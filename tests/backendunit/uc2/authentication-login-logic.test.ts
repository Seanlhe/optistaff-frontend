/**
 * Authentication Login Logic - Pure Function Unit Tests
 * @description Tests for login business logic, role determination, and authentication utilities
 * @testing-strategy Pure function testing without Supabase integration
 * @use-case UC2 - Sign In
 */

import { describe, test, expect } from "vitest";

describe("UC2: Authentication Login Logic", () => {

  describe("UC2 Step 7: Role Determination from User Metadata", () => {
    interface UserMetadata {
      user_type?: string;
      first_name?: string;
      last_name?: string;
    }

    const determineUserRole = (userMetadata: UserMetadata): "jobseeker" | "employer" | undefined => {
      const userType = userMetadata?.user_type;
      
      if (userType === "job-seeker" || userType === "jobseeker") {
        return "jobseeker";
      } else if (userType === "client" || userType === "employer") {
        return "employer";
      }
      
      return undefined;
    };

    test("should determine jobseeker role from metadata", () => {
      expect(determineUserRole({ user_type: "job-seeker" })).toBe("jobseeker");
      expect(determineUserRole({ user_type: "jobseeker" })).toBe("jobseeker");
    });

    test("should determine employer role from metadata", () => {
      expect(determineUserRole({ user_type: "client" })).toBe("employer");
      expect(determineUserRole({ user_type: "employer" })).toBe("employer");
    });

    test("should return undefined for unknown user types", () => {
      expect(determineUserRole({ user_type: "unknown" })).toBeUndefined();
      expect(determineUserRole({ user_type: "admin" })).toBeUndefined();
      expect(determineUserRole({ user_type: "" })).toBeUndefined();
    });

    test("should handle missing or malformed metadata", () => {
      expect(determineUserRole({})).toBeUndefined();
      expect(determineUserRole({ user_type: undefined })).toBeUndefined();
      expect(determineUserRole({ first_name: "John" })).toBeUndefined();
    });

    test("should handle case sensitivity", () => {
      expect(determineUserRole({ user_type: "Job-Seeker" })).toBeUndefined();
      expect(determineUserRole({ user_type: "CLIENT" })).toBeUndefined();
      expect(determineUserRole({ user_type: "JOBSEEKER" })).toBeUndefined();
    });

    test("should handle metadata with extra properties", () => {
      const fullMetadata = {
        user_type: "jobseeker",
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      };
      expect(determineUserRole(fullMetadata)).toBe("jobseeker");
    });
  });

  describe("UC2 Step 8: Role Normalization Logic", () => {
    const normalizeRole = (role: string): "jobseeker" | "employer" | null => {
      const normalizedRole = role.toLowerCase().trim();
      
      switch (normalizedRole) {
        case "job-seeker":
        case "jobseeker":
        case "job_seeker":
          return "jobseeker";
        case "client":
        case "employer":
        case "company":
          return "employer";
        default:
          return null;
      }
    };

    test("should normalize jobseeker role variations", () => {
      expect(normalizeRole("job-seeker")).toBe("jobseeker");
      expect(normalizeRole("jobseeker")).toBe("jobseeker");
      expect(normalizeRole("job_seeker")).toBe("jobseeker");
      expect(normalizeRole("Job-Seeker")).toBe("jobseeker");
      expect(normalizeRole("JOBSEEKER")).toBe("jobseeker");
    });

    test("should normalize employer role variations", () => {
      expect(normalizeRole("client")).toBe("employer");
      expect(normalizeRole("employer")).toBe("employer");
      expect(normalizeRole("company")).toBe("employer");
      expect(normalizeRole("Client")).toBe("employer");
      expect(normalizeRole("EMPLOYER")).toBe("employer");
    });

    test("should handle whitespace in role strings", () => {
      expect(normalizeRole("  jobseeker  ")).toBe("jobseeker");
      expect(normalizeRole("\tclient\n")).toBe("employer");
      expect(normalizeRole(" job-seeker ")).toBe("jobseeker");
    });

    test("should return null for invalid roles", () => {
      expect(normalizeRole("admin")).toBeNull();
      expect(normalizeRole("user")).toBeNull();
      expect(normalizeRole("")).toBeNull();
      expect(normalizeRole("unknown")).toBeNull();
    });
  });

  describe("UC2 Step 9: Navigation Route Determination", () => {
    const getPostLoginRoute = (role: "jobseeker" | "employer"): string => {
      switch (role) {
        case "jobseeker":
          return "/employee/preferences";
        case "employer":
          return "/employer/dashboard";
        default:
          return "/";
      }
    };

    test("should return correct route for jobseeker", () => {
      expect(getPostLoginRoute("jobseeker")).toBe("/employee/preferences");
    });

    test("should return correct route for employer", () => {
      expect(getPostLoginRoute("employer")).toBe("/employer/dashboard");
    });

    test("should handle route determination edge cases", () => {
      // Test with explicit type assertion for edge cases
      expect(getPostLoginRoute("jobseeker" as "jobseeker")).toBe("/employee/preferences");
      expect(getPostLoginRoute("employer" as "employer")).toBe("/employer/dashboard");
    });
  });

  describe("UC2 Step 10: Role Caching Logic", () => {
    interface RoleCache {
      [userId: string]: "jobseeker" | "employer";
    }

    const createRoleCacheKey = (userId: string): string => {
      return `user_role_${userId}`;
    };

    const isValidCachedRole = (role: any): role is "jobseeker" | "employer" => {
      return role === "jobseeker" || role === "employer";
    };

    const simulateRoleCache = (): {
      get: (key: string) => string | null;
      set: (key: string, value: string) => void;
      remove: (key: string) => void;
    } => {
      const cache: { [key: string]: string } = {};
      
      return {
        get: (key: string) => cache[key] || null,
        set: (key: string, value: string) => { cache[key] = value; },
        remove: (key: string) => { delete cache[key]; },
      };
    };

    test("should create correct cache key for user ID", () => {
      expect(createRoleCacheKey("user123")).toBe("user_role_user123");
      expect(createRoleCacheKey("abc-def-ghi")).toBe("user_role_abc-def-ghi");
    });

    test("should validate cached role values", () => {
      expect(isValidCachedRole("jobseeker")).toBe(true);
      expect(isValidCachedRole("employer")).toBe(true);
      expect(isValidCachedRole("admin")).toBe(false);
      expect(isValidCachedRole("")).toBe(false);
      expect(isValidCachedRole(null)).toBe(false);
      expect(isValidCachedRole(undefined)).toBe(false);
    });

    test("should handle role cache operations", () => {
      const cache = simulateRoleCache();
      const userId = "user123";
      const cacheKey = createRoleCacheKey(userId);

      // Initially no cached role
      expect(cache.get(cacheKey)).toBeNull();

      // Cache a role
      cache.set(cacheKey, "jobseeker");
      expect(cache.get(cacheKey)).toBe("jobseeker");

      // Update cached role
      cache.set(cacheKey, "employer");
      expect(cache.get(cacheKey)).toBe("employer");

      // Remove cached role
      cache.remove(cacheKey);
      expect(cache.get(cacheKey)).toBeNull();
    });

    test("should handle multiple user role caching", () => {
      const cache = simulateRoleCache();
      
      cache.set(createRoleCacheKey("user1"), "jobseeker");
      cache.set(createRoleCacheKey("user2"), "employer");
      cache.set(createRoleCacheKey("user3"), "jobseeker");

      expect(cache.get(createRoleCacheKey("user1"))).toBe("jobseeker");
      expect(cache.get(createRoleCacheKey("user2"))).toBe("employer");
      expect(cache.get(createRoleCacheKey("user3"))).toBe("jobseeker");
      expect(cache.get(createRoleCacheKey("user4"))).toBeNull();
    });
  });

  describe("UC2 Step 11: Error Code Classification", () => {
    enum LoginErrorType {
      INVALID_CREDENTIALS = "invalid_credentials",
      EMAIL_NOT_CONFIRMED = "email_not_confirmed",
      NETWORK_ERROR = "network_error",
      VALIDATION_ERROR = "validation_error",
      UNKNOWN_ERROR = "unknown_error",
    }

    interface LoginError {
      type: LoginErrorType;
      message: string;
      userMessage: string;
    }

    const classifyLoginError = (errorMessage: string): LoginError => {
      const lowerMessage = errorMessage.toLowerCase();

      if (lowerMessage.includes("invalid login credentials") || 
          lowerMessage.includes("invalid credentials") ||
          lowerMessage.includes("wrong password") ||
          lowerMessage.includes("incorrect password")) {
        return {
          type: LoginErrorType.INVALID_CREDENTIALS,
          message: errorMessage,
          userMessage: "Invalid email or password. Please check your credentials and try again.",
        };
      }

      if (lowerMessage.includes("email not confirmed") ||
          lowerMessage.includes("email not verified") ||
          lowerMessage.includes("confirm your email")) {
        return {
          type: LoginErrorType.EMAIL_NOT_CONFIRMED,
          message: errorMessage,
          userMessage: "Please verify your email address before signing in. Check your inbox for a confirmation link.",
        };
      }

      if (lowerMessage.includes("network") ||
          lowerMessage.includes("connection") ||
          lowerMessage.includes("timeout")) {
        return {
          type: LoginErrorType.NETWORK_ERROR,
          message: errorMessage,
          userMessage: "Connection error. Please check your internet connection and try again.",
        };
      }

      if (lowerMessage.includes("validation") ||
          lowerMessage.includes("invalid email") ||
          lowerMessage.includes("password must")) {
        return {
          type: LoginErrorType.VALIDATION_ERROR,
          message: errorMessage,
          userMessage: errorMessage, // Use original validation message
        };
      }

      return {
        type: LoginErrorType.UNKNOWN_ERROR,
        message: errorMessage,
        userMessage: "An unexpected error occurred. Please try again.",
      };
    };

    test("should classify invalid credentials errors", () => {
      const error1 = classifyLoginError("Invalid login credentials");
      expect(error1.type).toBe(LoginErrorType.INVALID_CREDENTIALS);
      expect(error1.userMessage).toContain("Invalid email or password");

      const error2 = classifyLoginError("Wrong password provided");
      expect(error2.type).toBe(LoginErrorType.INVALID_CREDENTIALS);
    });

    test("should classify email confirmation errors", () => {
      const error1 = classifyLoginError("Email not confirmed");
      expect(error1.type).toBe(LoginErrorType.EMAIL_NOT_CONFIRMED);
      expect(error1.userMessage).toContain("verify your email");

      const error2 = classifyLoginError("Please confirm your email");
      expect(error2.type).toBe(LoginErrorType.EMAIL_NOT_CONFIRMED);
    });

    test("should classify network errors", () => {
      const error1 = classifyLoginError("Network connection failed");
      expect(error1.type).toBe(LoginErrorType.NETWORK_ERROR);
      expect(error1.userMessage).toContain("Connection error");

      const error2 = classifyLoginError("Request timeout");
      expect(error2.type).toBe(LoginErrorType.NETWORK_ERROR);
    });

    test("should classify validation errors", () => {
      const error1 = classifyLoginError("Invalid email format");
      expect(error1.type).toBe(LoginErrorType.VALIDATION_ERROR);
      expect(error1.userMessage).toBe("Invalid email format");

      const error2 = classifyLoginError("Password must be 6 characters");
      expect(error2.type).toBe(LoginErrorType.VALIDATION_ERROR);
    });

    test("should classify unknown errors", () => {
      const error = classifyLoginError("Unexpected server error");
      expect(error.type).toBe(LoginErrorType.UNKNOWN_ERROR);
      expect(error.userMessage).toBe("An unexpected error occurred. Please try again.");
    });
  });

  describe("UC2 Step 12: Login State Management", () => {
    interface LoginState {
      isLoading: boolean;
      error: string | null;
      user: { id: string; email: string; role: "jobseeker" | "employer" } | null;
    }

    const createInitialLoginState = (): LoginState => ({
      isLoading: false,
      error: null,
      user: null,
    });

    const setLoadingState = (state: LoginState, loading: boolean): LoginState => ({
      ...state,
      isLoading: loading,
      error: loading ? null : state.error, // Clear error when starting new request
    });

    const setErrorState = (state: LoginState, error: string): LoginState => ({
      ...state,
      isLoading: false,
      error,
      user: null,
    });

    const setSuccessState = (
      state: LoginState,
      user: { id: string; email: string; role: "jobseeker" | "employer" }
    ): LoginState => ({
      ...state,
      isLoading: false,
      error: null,
      user,
    });

    test("should create initial login state", () => {
      const state = createInitialLoginState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toBeNull();
    });

    test("should set loading state correctly", () => {
      const initialState = createInitialLoginState();
      
      const loadingState = setLoadingState(initialState, true);
      expect(loadingState.isLoading).toBe(true);
      expect(loadingState.error).toBeNull();

      const notLoadingState = setLoadingState(loadingState, false);
      expect(notLoadingState.isLoading).toBe(false);
    });

    test("should set error state correctly", () => {
      const initialState = createInitialLoginState();
      
      const errorState = setErrorState(initialState, "Login failed");
      expect(errorState.isLoading).toBe(false);
      expect(errorState.error).toBe("Login failed");
      expect(errorState.user).toBeNull();
    });

    test("should set success state correctly", () => {
      const initialState = createInitialLoginState();
      const user = { id: "user123", email: "user@example.com", role: "jobseeker" as const };
      
      const successState = setSuccessState(initialState, user);
      expect(successState.isLoading).toBe(false);
      expect(successState.error).toBeNull();
      expect(successState.user).toEqual(user);
    });

    test("should clear error when setting loading state", () => {
      const stateWithError = setErrorState(createInitialLoginState(), "Previous error");
      const loadingState = setLoadingState(stateWithError, true);
      
      expect(loadingState.error).toBeNull();
      expect(loadingState.isLoading).toBe(true);
    });

    test("should handle state transitions", () => {
      let state = createInitialLoginState();
      
      // Start loading
      state = setLoadingState(state, true);
      expect(state.isLoading).toBe(true);
      
      // Set error
      state = setErrorState(state, "Login failed");
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Login failed");
      
      // Try again - start loading (should clear error)
      state = setLoadingState(state, true);
      expect(state.error).toBeNull();
      
      // Success
      const user = { id: "user123", email: "user@example.com", role: "employer" as const };
      state = setSuccessState(state, user);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.user).toEqual(user);
    });
  });

  describe("UC2 Step 13: Login Session Management", () => {
    interface LoginSession {
      userId: string;
      email: string;
      role: "jobseeker" | "employer";
      timestamp: number;
      expiresAt: number;
    }

    const createLoginSession = (
      userId: string,
      email: string,
      role: "jobseeker" | "employer",
      durationMs: number = 24 * 60 * 60 * 1000 // 24 hours default
    ): LoginSession => {
      const now = Date.now();
      return {
        userId,
        email,
        role,
        timestamp: now,
        expiresAt: now + durationMs,
      };
    };

    const isSessionValid = (session: LoginSession): boolean => {
      return Date.now() < session.expiresAt;
    };

    const getSessionTimeRemaining = (session: LoginSession): number => {
      return Math.max(0, session.expiresAt - Date.now());
    };

    test("should create login session with correct properties", () => {
      const session = createLoginSession("user123", "user@example.com", "jobseeker");
      
      expect(session.userId).toBe("user123");
      expect(session.email).toBe("user@example.com");
      expect(session.role).toBe("jobseeker");
      expect(session.timestamp).toBeGreaterThan(0);
      expect(session.expiresAt).toBeGreaterThan(session.timestamp);
    });

    test("should create session with custom duration", () => {
      const customDuration = 60 * 60 * 1000; // 1 hour
      const session = createLoginSession("user123", "user@example.com", "employer", customDuration);
      
      const expectedExpiry = session.timestamp + customDuration;
      expect(session.expiresAt).toBe(expectedExpiry);
    });

    test("should validate session correctly", () => {
      // Valid session (future expiry)
      const validSession = createLoginSession("user123", "user@example.com", "jobseeker", 1000);
      expect(isSessionValid(validSession)).toBe(true);

      // Invalid session (past expiry)
      const expiredSession = createLoginSession("user123", "user@example.com", "jobseeker", -1000);
      expect(isSessionValid(expiredSession)).toBe(false);
    });

    test("should calculate remaining time correctly", () => {
      const duration = 5000; // 5 seconds
      const session = createLoginSession("user123", "user@example.com", "jobseeker", duration);
      
      const remaining = getSessionTimeRemaining(session);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(duration);
      
      // Test expired session
      const expiredSession = createLoginSession("user123", "user@example.com", "jobseeker", -1000);
      expect(getSessionTimeRemaining(expiredSession)).toBe(0);
    });
  });
});
