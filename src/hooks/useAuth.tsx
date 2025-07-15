/**
 * Authentication Hook
 * @description Custom hook for authentication state management
 */

import { supabase } from '../integrations/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  role: 'jobseeker' | 'employer';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'jobseeker' | 'employer';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;        // New field for job seekers
  address?: string;            // New field for both user types
  postalCode?: string;         // New field for both user types
  companyName?: string;
  officeNumber?: string;       // New field for employers
}


export const useAuth = () => {
  const navigate = useNavigate();
  
  // create state with initial values
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Helper function to update user state
  const updateUserState = useCallback(async (user: SupabaseUser, shouldNavigate = false) => {
    const userType = user.user_metadata?.user_type;
    
    let role: 'jobseeker' | 'employer' | undefined = undefined;
    
    if (userType === 'job-seeker' || userType === 'jobseeker') {
      role = 'jobseeker';
    } else if (userType === 'client' || userType === 'employer') {
      role = 'employer';
    } else if (!userType) {
      // Fallback: Check database tables to determine role
      try {
        const { data: jobSeekerData } = await supabase
          .from('job_seekers')
          .select('user_id')
          .eq('user_id', user.id)
          .single();
          
        if (jobSeekerData) {
          role = 'jobseeker';
        } else {
          // Check if user exists in clients table
          const { data: clientData } = await supabase
            .from('clients')
            .select('client_id')
            .eq('client_id', user.id)
            .single();
            
          if (clientData) {
            role = 'employer';
          }
          // If neither, default to jobseeker
        }
      } catch (error) {
        console.log('🔍 Auth Debug - Database role check failed, using default');
      }
    }
    
    // Debug logging
    console.log('🔍 Auth Debug - User metadata:', user.user_metadata);
    console.log('🔍 Auth Debug - Extracted userType:', userType);
    console.log('🔍 Auth Debug - Mapped role:', role);
    console.log('🔍 Auth Debug - Should navigate:', shouldNavigate);
    
    // Only set auth state if role was determined
    if (!role) {
      console.log('🔍 Auth Debug - ERROR: No role could be determined for user');
      setAuthState({
        user: null,
        loading: false,
        error: 'Unable to determine user role',
      });
      return;
    }
    
    setAuthState({
      user: {
        id: user.id,
        email: user.email || '',
        role: role,
      },
      loading: false,
      error: null,
    });

    // Navigate to appropriate dashboard if needed
    if (shouldNavigate) {
      const targetRoute = role === 'jobseeker' ? '/employee/preferences' : '/employer/dashboard';
      console.log('🔍 Auth Debug - Navigating to:', targetRoute);
      navigate(targetRoute);
    }
  }, [navigate]);

  // Helper function to clear user state
  const clearUserState = useCallback((errorMessage?: string) => {
    setAuthState({
      user: null,
      loading: false,
      error: errorMessage || null,
    });
  }, []);

  useEffect(() => {
    // IIFE to handle async operations directly
    (async () => {
      try {
        const response = await supabase.auth.getSession();
        const data = response.data;
        const session = data.session;

        //if session exists and has a user, set the auth state
        if (session?.user){
          await updateUserState(session.user);
        }
        // if no session or user, set user to null and loading to false
        else {
          clearUserState();
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        clearUserState(errorMessage);
      }
    })();
  }, [updateUserState, clearUserState]);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user){
        await updateUserState(data.user, true); // Navigate after successful login
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      clearUserState();
      navigate('/'); // Navigate to home after logout
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  const signup = async (signupData: SignupData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    // Validate required fields based on user type
    if (signupData.userType === 'employer' && !signupData.companyName?.trim()) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Company name is required for employers',
      }));
      return;
    }

    // Validate password confirmation
    if (signupData.password !== signupData.confirmPassword) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Passwords do not match',
      }));
      return;
    }

    // Validate postal code format (Singapore 6-digit format)
    if (signupData.postalCode && !/^[0-9]{6}$/.test(signupData.postalCode)) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Postal code must be 6 digits',
      }));
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            user_type: signupData.userType === 'jobseeker' ? 'job-seeker' : 'client',
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            ...(signupData.phoneNumber && { phone_number: signupData.phoneNumber }),
            ...(signupData.dateOfBirth && { date_of_birth: signupData.dateOfBirth }),
            ...(signupData.address && { address: signupData.address }),
            ...(signupData.postalCode && { postal_code: signupData.postalCode }),
            ...(signupData.companyName && { company_name: signupData.companyName }),
            ...(signupData.officeNumber && { office_number: signupData.officeNumber }),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Insert user data into the appropriate table
        if (signupData.userType === 'jobseeker') {
          const { error: insertError } = await supabase
            .from('job_seekers')
            .insert({
              user_id: data.user.id,
              first_name: signupData.firstName,
              last_name: signupData.lastName,
              phone_number: signupData.phoneNumber || null,
              date_of_birth: signupData.dateOfBirth || null,
              home_location: signupData.address || null,
              postal_code: signupData.postalCode || null,
            });

          if (insertError) {
            console.error('Failed to create job seeker profile:', insertError);
            throw new Error('Failed to complete registration');
          }
        } else {
          const { error: insertError } = await supabase
            .from('clients')
            .insert({
              client_id: data.user.id,
              company_name: signupData.companyName!,
              first_name: signupData.firstName,
              last_name: signupData.lastName,
              phone: signupData.phoneNumber || null,
              address: signupData.address || null,
              postal_code: signupData.postalCode || null,
              office_number: signupData.officeNumber || null,
              contact_email: signupData.email,
            });

          if (insertError) {
            console.error('Failed to create client profile:', insertError);
            throw new Error('Failed to complete registration');
          }
        }

        await updateUserState(data.user, true); 
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };
  
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState, 
    login,
    logout,
    signup,
    clearError,
  };
};