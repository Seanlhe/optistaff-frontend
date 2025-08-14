/**
 * Authentication Hook
 * @description Custom hook for authentication state management
 */

import { supabase } from "../integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { AuthState, SignupData } from "../types/hooks";
import { validateSignupForm, formatUserData } from "../utils/authentication";

export const useAuth = () => {
  const navigate = useNavigate();

  // create state with initial values
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Helper function to update user state
  const updateUserState = useCallback(
    async (user: SupabaseUser, shouldNavigate = false) => {
      const userType = user.user_metadata?.user_type;

      let role: "jobseeker" | "employer" | undefined = undefined;

      // Add timeout protection for database queries
      const withTimeout = function <T>(
        promise: Promise<T>,
        timeoutMs: number = 5000
      ): Promise<T> {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) =>
            setTimeout(
              () => reject(new Error("Database query timeout")),
              timeoutMs
            )
          ),
        ]);
      };

      if (userType === "job-seeker" || userType === "jobseeker") {
        role = "jobseeker";
      } else if (userType === "client" || userType === "employer") {
        role = "employer";
      } else if (!userType) {
        // Check if we have cached role in localStorage first
        const cachedRole = localStorage.getItem(`user_role_${user.id}`);
        if (cachedRole === "jobseeker" || cachedRole === "employer") {
          role = cachedRole as "jobseeker" | "employer";
          console.log("🔍 Auth Debug - Using cached role:", role);
        } else {
          // Fallback: Check database tables to determine role (only if no cache)
          try {
            console.log(
              "🔍 Auth Debug - No cached role found, checking database..."
            );
            // Use Promise.allSettled with timeout to check both tables simultaneously
            const [jobSeekerResult, clientResult] = await Promise.allSettled([
              withTimeout(
                Promise.resolve(
                  supabase
                    .from("job_seekers")
                    .select("user_id")
                    .eq("user_id", user.id)
                    .single()
                )
              ),
              withTimeout(
                Promise.resolve(
                  supabase
                    .from("clients")
                    .select("client_id")
                    .eq("client_id", user.id)
                    .single()
                )
              ),
            ]);

            if (
              jobSeekerResult.status === "fulfilled" &&
              (jobSeekerResult.value as any)?.data
            ) {
              role = "jobseeker";
            } else if (
              clientResult.status === "fulfilled" &&
              (clientResult.value as any)?.data
            ) {
              role = "employer";
            } else {
              // If both queries fail or return no data, we need to handle this gracefully
              console.log(
                "🔍 Auth Debug - No role found in database, user may need to complete registration"
              );
              role = "jobseeker"; // Default fallback
            }

            // Cache the role for future use
            if (role) {
              localStorage.setItem(`user_role_${user.id}`, role);
              console.log("🔍 Auth Debug - Cached role for future use:", role);
            }
          } catch (error) {
            console.log(
              "🔍 Auth Debug - Database role check failed, using default fallback"
            );
            role = "jobseeker"; // Ensure we always have a role
          }
        }
      }

      // Ensure we always have a role - this prevents infinite loading
      if (!role) {
        console.log(
          "🔍 Auth Debug - WARNING: No role determined, using jobseeker as fallback"
        );
        role = "jobseeker"; // Fallback to prevent infinite loading
      }

      setAuthState({
        user: {
          id: user.id,
          email: user.email || "",
          role: role,
        },
        loading: false,
        error: null,
      });

      // Navigate to appropriate dashboard if needed (only for login, not page refresh)
      if (shouldNavigate) {
        const targetRoute =
          role === "jobseeker" ? "/employee/dashboard" : "/employer/dashboard";
        console.log("🔍 Auth Debug - Navigating to:", targetRoute);
        navigate(targetRoute);
      }
    },
    [navigate]
  );

  // Helper function to clear user state
  const clearUserState = useCallback((errorMessage?: string) => {
    setAuthState((prev) => {
      // Only update if state actually changed
      if (
        prev.user === null &&
        prev.loading === false &&
        prev.error === (errorMessage || null)
      ) {
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
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        clearUserState(errorMessage);
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        // Never navigate on auth state change - only update auth state
        // Navigation should only happen through explicit login/signup functions
        await updateUserState(session.user, false);
      } else if (event === "SIGNED_OUT") {
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
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await updateUserState(data.user, true); // Navigate after successful login
      }
    } catch (error: unknown) {
      // Extract a raw error message from different possible error shapes
      const rawMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error && (error as any).message
          ? String((error as any).message)
          : "";

      // Map Supabase auth error messages to UC2 user-friendly messages
      const mapAuthErrorMessage = (errorMessage: string): string => {
        const msg = (errorMessage || "").toLowerCase();
        if (msg.includes("invalid login credentials")) {
          return "Invalid credentials";
        }
        if (msg.includes("email not confirmed")) {
          return "Please verify your email";
        }
        // Default to original message if available, otherwise a generic fallback
        return errorMessage || "Login failed";
      };

      const friendlyMessage = mapAuthErrorMessage(rawMessage);

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: friendlyMessage,
      }));
    }
  };

  const logout = async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      // Clear cached role before logout
      if (authState.user?.id) {
        localStorage.removeItem(`user_role_${authState.user.id}`);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      clearUserState();
      navigate("/"); // Navigate to home after logout
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  const signup = async (signupData: SignupData) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    // Use Utils layer for form validation (matches sequence diagram)
    const validationErrors = validateSignupForm(signupData);

    // If there are validation errors, show them and return
    if (validationErrors.length > 0) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: validationErrors.join(". "),
      }));
      return;
    }

    // Check if user already exists in our custom tables
    console.log(
      "🔍 Signup Debug - Checking if email already exists:",
      signupData.email
    );

    try {
      // Check both job_seekers and clients tables for existing email
      const [jobSeekerCheck, clientCheck] = await Promise.allSettled([
        supabase
          .from("job_seekers")
          .select("email")
          .eq("email", signupData.email)
          .single(),
        supabase
          .from("clients")
          .select("email")
          .eq("email", signupData.email)
          .single(),
      ]);

      const jobSeekerExists =
        jobSeekerCheck.status === "fulfilled" && jobSeekerCheck.value.data;
      const clientExists =
        clientCheck.status === "fulfilled" && clientCheck.value.data;

      if (jobSeekerExists || clientExists) {
        console.log("🔍 Signup Debug - Email found in custom tables");
        console.log("🔍 Signup Debug - Job seeker exists:", jobSeekerExists);
        console.log("🔍 Signup Debug - Client exists:", clientExists);

        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: "Email already registered. Try signing in instead.",
        }));
        return;
      }

      console.log(
        "🔍 Signup Debug - Email not found in custom tables, proceeding with signup"
      );
    } catch (checkError) {
      console.log(
        "🔍 Signup Debug - Error checking custom tables:",
        checkError
      );
      // Continue with signup if we can't check
    }

    try {
      console.log(
        "🔍 Signup Debug - Attempting signup for email:",
        signupData.email
      );

      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            user_type:
              signupData.userType === "jobseeker" ? "job-seeker" : "client",
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            ...(signupData.phoneNumber && {
              phone_number: signupData.phoneNumber,
            }),
            ...(signupData.dateOfBirth && {
              date_of_birth: signupData.dateOfBirth,
            }),
            ...(signupData.address && { address: signupData.address }),
            ...(signupData.postalCode && {
              postal_code: signupData.postalCode,
            }),
            ...(signupData.companyName && {
              company_name: signupData.companyName,
            }),
            ...(signupData.officeNumber && {
              office_number: signupData.officeNumber,
            }),
          },
        },
      });

      console.log("🔍 Signup Debug - Supabase response data:", data);
      console.log("🔍 Signup Debug - Supabase response error:", error);
      console.log("🔍 Signup Debug - User object:", data?.user);
      console.log("🔍 Signup Debug - Session object:", data?.session);

      if (error) throw error;

      // Only proceed with success logic if there's no error and we have a user
      if (data.user && !error) {
        // Check if this is a truly new user or an existing unconfirmed user
        const userCreatedAt = new Date(data.user.created_at);
        const now = new Date();
        const timeDiff = now.getTime() - userCreatedAt.getTime();
        const isNewUser = timeDiff < 5000; // Created within last 5 seconds

        console.log("🔍 Signup Debug - User created successfully");
        console.log("🔍 Signup Debug - User created at:", data.user.created_at);
        console.log("🔍 Signup Debug - Is new user:", isNewUser);
        console.log("🔍 Signup Debug - Time difference (ms):", timeDiff);
        console.log(
          "🔍 Signup Debug - User metadata stored:",
          data.user.user_metadata
        );

        // If this is not a new user (existing unconfirmed user), show appropriate message
        if (!isNewUser) {
          console.log("🔍 Signup Debug - Existing unconfirmed user detected");
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error:
              "Email already registered but not confirmed. Please check your email for the confirmation link, or try signing in.",
          }));
          return;
        }

        // Always redirect to login page after signup, regardless of session status
        // Users must confirm their email before they can access the app
        console.log(
          "🔍 Signup Debug - Signup successful, redirecting to login for email confirmation"
        );

        // Set a success message and navigate to login page
        setAuthState({
          user: null,
          loading: false,
          error: null, // No error - this is expected behavior
        });

        // Store success message for the login page to display
        sessionStorage.setItem(
          "signup_success",
          "Account created successfully! Please check your email and confirm your account, then log in."
        );

        // Always navigate to login page after signup
        navigate("/auth?mode=login");
        return;
      }
    } catch (error: unknown) {
      // Debug logging to see what Supabase error we're getting
      console.log("🔍 Signup Error Debug - Full error object:", error);
      console.log("🔍 Signup Error Debug - Error type:", typeof error);

      let errorMessage = "Signup failed";

      if (error instanceof Error) {
        console.log("🔍 Signup Error Debug - Error message:", error.message);
        console.log("🔍 Signup Error Debug - Error name:", error.name);

        // Check for specific Supabase error codes for existing email
        if (
          error.message.includes("User already registered") ||
          error.message.includes("already been registered") ||
          error.message.includes("email address is already registered")
        ) {
          console.log("🔍 Signup Error Debug - Detected duplicate email error");
          errorMessage = "Email already registered. Try signing in instead.";
        } else {
          console.log("🔍 Signup Error Debug - Using original error message");
          errorMessage = error.message;
        }
      } else {
        console.log("🔍 Signup Error Debug - Error is not an Error instance");
      }

      console.log("🔍 Signup Error Debug - Final error message:", errorMessage);

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    logout,
    signup,
    clearError,
  };
};
