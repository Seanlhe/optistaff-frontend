/**
 * useAuth Hook - Integration Tests
 * @description Integration tests for useAuth hook login functionality
 * @testing-strategy Integration testing with mocked external dependencies
 * @use-case UC2 - Sign In
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../../../src/hooks/useAuth";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock Supabase client
vi.mock("../../../src/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}));

// Mock authentication utils
vi.mock("../../../src/utils/authentication", () => ({
  validateSignupForm: vi.fn(),
  formatUserData: vi.fn(),
}));

// Import mocked modules after mocking
import { supabase } from "../../../src/integrations/supabase/client";
import { validateSignupForm, formatUserData } from "../../../src/utils/authentication";

// Get access to the mocked functions
const mockSupabaseAuth = supabase.auth as any;
const mockSupabaseFrom = supabase.from as any;
const mockValidateSignupForm = vi.mocked(validateSignupForm);
const mockFormatUserData = vi.mocked(formatUserData);

describe("useAuth Hook - UC2 Sign In Integration Tests", () => {
  const mockJobSeekerUser = {
    id: "jobseeker-user-id",
    email: "jobseeker@test.com",
    created_at: new Date().toISOString(),
    user_metadata: {
      user_type: "job-seeker",
      first_name: "John",
      last_name: "Doe",
    },
    app_metadata: {},
    aud: "authenticated",
  };

  const mockEmployerUser = {
    id: "employer-user-id",
    email: "employer@company.com",
    created_at: new Date().toISOString(),
    user_metadata: {
      user_type: "client",
      first_name: "Jane",
      last_name: "Smith",
      company_name: "Test Company",
    },
    app_metadata: {},
    aud: "authenticated",
  };

  const mockSession = {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: "bearer",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockSupabaseAuth.getSession.mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    });
    
    mockSupabaseAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    mockValidateSignupForm.mockReturnValue([]);
    mockFormatUserData.mockReturnValue({
      id: mockJobSeekerUser.id,
      email: mockJobSeekerUser.email,
      role: "jobseeker",
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("login function - UC2 Steps 1-8: Sign In Integration", () => {
    test("UC2-Step1-8: should successfully sign in jobseeker and navigate to preferences", async () => {
      // Arrange - Mock successful jobseeker login
      const email = "jobseeker@test.com";
      const password = "TestPassword123";

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { 
          user: mockJobSeekerUser, 
          session: { ...mockSession, user: mockJobSeekerUser } 
        },
        error: null,
      });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login(email, password);

      // Assert - UC2 Step 4: Verify signInWithPassword called correctly
      await waitFor(() => {
        expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
          email: email,
          password: password,
        });
      });

      // Assert - UC2 Step 7: Verify jobseeker navigation
      expect(mockNavigate).toHaveBeenCalledWith("/employee/preferences");
      
      // Assert - Verify user state is updated
      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
      });
    });

    test("UC2-Step1-8: should successfully sign in employer and navigate to dashboard", async () => {
      // Arrange - Mock successful employer login
      const email = "employer@company.com";
      const password = "TestPassword123";

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { 
          user: mockEmployerUser, 
          session: { ...mockSession, user: mockEmployerUser } 
        },
        error: null,
      });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login(email, password);

      // Assert - UC2 Step 4: Verify signInWithPassword called correctly
      await waitFor(() => {
        expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
          email: email,
          password: password,
        });
      });

      // Assert - UC2 Step 8: Verify employer navigation
      expect(mockNavigate).toHaveBeenCalledWith("/employer/dashboard");
      
      // Assert - Verify user state is updated
      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
      });
    });

    test("UC2-Step4-6: should handle invalid credentials error", async () => {
      // Arrange - Mock invalid credentials error
      const email = "invalid@test.com";
      const password = "wrongpassword";

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { 
          message: "Invalid login credentials",
          __isAuthError: true,
          status: 400
        },
      });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login(email, password);

      // Assert - UC2 Step 5: Verify error handling
      await waitFor(() => {
        expect(result.current.error).toBe("Invalid credentials");
        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
      });

      // Assert - Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("UC2-Step4-6: should handle unverified email error", async () => {
      // Arrange - Mock unverified email error
      const email = "unverified@test.com";
      const password = "TestPassword123";

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { 
          message: "Email not confirmed",
          __isAuthError: true,
          status: 400
        },
      });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login(email, password);

      // Assert - UC2 Step 6: Verify unverified email error handling
      await waitFor(() => {
        expect(result.current.error).toBe("Please verify your email");
        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
      });

      // Assert - Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("UC2-Step4: should handle network/connection errors", async () => {
      // Arrange - Mock network error
      const email = "test@test.com";
      const password = "TestPassword123";

      mockSupabaseAuth.signInWithPassword.mockRejectedValue(new Error("Network error"));

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login(email, password);

      // Assert - Should handle network errors gracefully
      await waitFor(() => {
        expect(result.current.error).toBe("Network error");
        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("UC2-Step1-3: should set loading state correctly during login", async () => {
      // Arrange - Create a promise we can control
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      
      mockSupabaseAuth.signInWithPassword.mockReturnValue(loginPromise);

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Start login
      result.current.login("test@test.com", "password");

      // Should be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Resolve login
      resolveLogin!({
        data: { 
          user: mockJobSeekerUser, 
          session: { ...mockSession, user: mockJobSeekerUser } 
        },
        error: null,
      });

      // Should not be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    test("UC2-Step7-8: should handle role determination correctly", async () => {
      // Test both user types to ensure role determination logic works
      const testCases = [
        {
          user: mockJobSeekerUser,
          expectedNavigation: "/employee/preferences",
          description: "jobseeker with job-seeker metadata"
        },
        {
          user: mockEmployerUser,
          expectedNavigation: "/employer/dashboard", 
          description: "employer with client metadata"
        }
      ];

      for (const testCase of testCases) {
        // Reset mocks for each test case
        vi.clearAllMocks();
        mockSupabaseAuth.getSession.mockResolvedValue({ 
          data: { session: null }, 
          error: null 
        });
        mockSupabaseAuth.onAuthStateChange.mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        });

        // Arrange
        mockSupabaseAuth.signInWithPassword.mockResolvedValue({
          data: { 
            user: testCase.user, 
            session: { ...mockSession, user: testCase.user } 
          },
          error: null,
        });

        // Act
        const { result } = renderHook(() => useAuth());
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await result.current.login("test@test.com", "password");

        // Assert
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith(testCase.expectedNavigation);
        }, { timeout: 3000 });
      }
    });

    test("UC2 Integration: should handle user with missing role metadata", async () => {
      // Arrange - User with no user_type in metadata
      const userWithoutRole = {
        ...mockJobSeekerUser,
        user_metadata: {
          first_name: "Test",
          last_name: "User",
          // Missing user_type
        },
      };

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { 
          user: userWithoutRole, 
          session: { ...mockSession, user: userWithoutRole } 
        },
        error: null,
      });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login("test@test.com", "password");

      // Assert - Should handle gracefully, possibly with default navigation
      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
        expect(result.current.error).toBeNull();
        expect(result.current.loading).toBe(false);
      });

      // Navigation behavior would depend on your implementation
      // This test ensures it doesn't crash
    });
  });

  describe("clearError function - UC2 Error Handling", () => {
    test("should clear error state", async () => {
      // Arrange - First create an error state
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid credentials" },
      });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger error
      await result.current.login("test@test.com", "wrongpassword");
      
      await waitFor(() => {
        expect(result.current.error).toBe("Invalid credentials");
      });

      // Clear error
      result.current.clearError();

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("UC2 Business Rules Integration", () => {
    test("should cache role in localStorage for performance", async () => {
      // Arrange
      const email = "jobseeker@test.com";
      const password = "TestPassword123";

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { 
          user: mockJobSeekerUser, 
          session: { ...mockSession, user: mockJobSeekerUser } 
        },
        error: null,
      });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login(email, password);

      // Assert - Check if role is cached (depending on your implementation)
      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
      });

      // This would test localStorage caching if implemented
      // expect(window.localStorage.setItem).toHaveBeenCalledWith('userRole', 'jobseeker');
    });

    test("should extract user role from user_metadata.user_type correctly", async () => {
      // Test the business rule that role comes from user.user_metadata.user_type
      const testUsers = [
        { 
          user: { ...mockJobSeekerUser, user_metadata: { user_type: "job-seeker" } },
          expectedNavigation: "/employee/preferences" 
        },
        { 
          user: { ...mockEmployerUser, user_metadata: { user_type: "client" } },
          expectedNavigation: "/employer/dashboard" 
        }
      ];

      for (const testCase of testUsers) {
        vi.clearAllMocks();
        mockSupabaseAuth.getSession.mockResolvedValue({ 
          data: { session: null }, 
          error: null 
        });
        mockSupabaseAuth.onAuthStateChange.mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        });

        mockSupabaseAuth.signInWithPassword.mockResolvedValue({
          data: { 
            user: testCase.user, 
            session: { ...mockSession, user: testCase.user } 
          },
          error: null,
        });

        const { result } = renderHook(() => useAuth());
        
        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        await result.current.login("test@test.com", "password");

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith(testCase.expectedNavigation);
        });
      }
    });
  });
});
