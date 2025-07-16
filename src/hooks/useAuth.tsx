/**
 * Authentication Hook
 * @description Custom hook for authentication state management
 */

import { supabase } from '../integrations/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { AuthState, SignupData } from '../types/hooks';

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
        console.log('🔍 Signup Debug - User created successfully');
        console.log('🔍 Signup Debug - User metadata stored:', data.user.user_metadata);
        
        // Check if the user needs email confirmation immediately
        if (data.user && !data.session) {
          console.log('🔍 Signup Debug - Email confirmation required, redirecting to login');
          // User was created but needs to confirm email before they can log in
          // Set a success message and navigate to login page immediately
          setAuthState({
            user: null,
            loading: false,
            error: null, // No error - this is expected behavior
          });
          
          // Store success message for the login page to display
          sessionStorage.setItem('signup_success', 'Account created successfully! Please check your email and confirm your account, then log in.');
          
          // Navigate to login page immediately
          navigate('/auth?mode=login');
          return;
        }
        
        // If we have a session (auto-login worked), proceed with navigation
        if (data.session && data.user) {
          await updateUserState(data.user, true);
          return;
        } 
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