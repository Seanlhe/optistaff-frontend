/**
 * Authentication Hook
 * @description Custom hook for authentication state management
 */

import { supabase } from '../integrations/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
  userType: 'jobseeker' | 'employer';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  companyName?: string;
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
  const updateUserState = useCallback((user: any, shouldNavigate = false) => {
    // ✅ Fixed role mapping to match what we send in metadata
    const userType = user.user_metadata?.user_type;
    const role = userType === 'job-seeker' ? 'jobseeker' : 'employer';
    
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
      navigate(role === 'jobseeker' ? '/employee/preferences' : '/employer/dashboard');
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
    // check if user is already logged in 
    const checkUser = async () => {
      try {
        const response = await supabase.auth.getSession();
        const data = response.data;
        const session = data.session;

        //if session exists and has a user, set the auth state
        if (session?.user){
          updateUserState(session.user);
        }
        // if no session or user, set user to null and loading to false
        else {
          clearUserState();
          };
      } catch (error: any) {
        clearUserState(error.message);
      }
    };
    checkUser();
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
        updateUserState(data.user, true); // Navigate after successful login
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
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
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  const signup = async (signupData: SignupData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    if (signupData.userType === 'employer' && !signupData.companyName?.trim()) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Company name is required for employers',
      }));
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            // ✅ Fixed field names to match database function expectations
            user_type: signupData.userType === 'jobseeker' ? 'job-seeker' : 'client',
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            ...(signupData.phoneNumber && { phone_number: signupData.phoneNumber }),
            ...(signupData.companyName && { company_name: signupData.companyName }),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        updateUserState(data.user, true); 
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Signup failed',
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