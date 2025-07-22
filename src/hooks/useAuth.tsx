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
    
    // Add timeout protection for database queries
    const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
        )
      ]);
    };
    
    if (userType === 'job-seeker' || userType === 'jobseeker') {
      role = 'jobseeker';
    } else if (userType === 'client' || userType === 'employer') {
      role = 'employer';
    } else if (!userType) {
      // Check if we have cached role in localStorage first
      const cachedRole = localStorage.getItem(`user_role_${user.id}`);
      if (cachedRole === 'jobseeker' || cachedRole === 'employer') {
        role = cachedRole as 'jobseeker' | 'employer';
        console.log('🔍 Auth Debug - Using cached role:', role);
      } else {
        // Fallback: Check database tables to determine role (only if no cache)
        try {
          console.log('🔍 Auth Debug - No cached role found, checking database...');
          // Use Promise.allSettled with timeout to check both tables simultaneously
          const [jobSeekerResult, clientResult] = await Promise.allSettled([
            withTimeout(supabase
              .from('job_seekers')
              .select('user_id')
              .eq('user_id', user.id)
              .single()),
            withTimeout(supabase
              .from('clients')
              .select('client_id')
              .eq('client_id', user.id)
              .single())
          ]);

          if (jobSeekerResult.status === 'fulfilled' && jobSeekerResult.value.data) {
            role = 'jobseeker';
          } else if (clientResult.status === 'fulfilled' && clientResult.value.data) {
            role = 'employer';
          } else {
            // If both queries fail or return no data, we need to handle this gracefully
            console.log('🔍 Auth Debug - No role found in database, user may need to complete registration');
            role = 'jobseeker'; // Default fallback
          }
          
          // Cache the role for future use
          if (role) {
            localStorage.setItem(`user_role_${user.id}`, role);
            console.log('🔍 Auth Debug - Cached role for future use:', role);
          }
        } catch (error) {
          console.log('🔍 Auth Debug - Database role check failed, using default fallback');
          role = 'jobseeker'; // Ensure we always have a role
        }
      }
    }
    
    // Ensure we always have a role - this prevents infinite loading
    if (!role) {
      console.log('🔍 Auth Debug - WARNING: No role determined, using jobseeker as fallback');
      role = 'jobseeker'; // Fallback to prevent infinite loading
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

    // Navigate to appropriate dashboard if needed (only for login, not page refresh)
    if (shouldNavigate) {
      const targetRoute = role === 'jobseeker' ? '/employee/preferences' : '/employer/dashboard';
      console.log('🔍 Auth Debug - Navigating to:', targetRoute);
      navigate(targetRoute);
    }
  }, [navigate]);

  // Helper function to clear user state
  const clearUserState = useCallback((errorMessage?: string) => {
    setAuthState(prev => {
      // Only update if state actually changed
      if (prev.user === null && prev.loading === false && prev.error === (errorMessage || null)) {
        return prev;
      }
      return {
        user: null,
        loading: false,
        error: errorMessage || null,
      };
    });
  }, []);

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const response = await supabase.auth.getSession();
        const session = response.data.session;

        // Only update state if component is still mounted
        if (!isMounted) return;

        if (session?.user) {
          // Don't navigate on page refresh - only update auth state
          await updateUserState(session.user, false);
        } else {
          clearUserState();
        }
      } catch (error: unknown) {
        if (!isMounted) return;
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        clearUserState(errorMessage);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        // Only navigate on actual sign in, not on page refresh
        const shouldNavigate = event === 'SIGNED_IN';
        await updateUserState(session.user, shouldNavigate);
      } else if (event === 'SIGNED_OUT') {
        // Clear cached role on logout
        if (session?.user?.id) {
          localStorage.removeItem(`user_role_${session.user.id}`);
        }
        clearUserState();
      }
    });

    // Get initial session
    getInitialSession();

    // Cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
      // Clear cached role before logout
      if (authState.user?.id) {
        localStorage.removeItem(`user_role_${authState.user.id}`);
      }
      
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