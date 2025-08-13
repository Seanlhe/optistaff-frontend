/**
 * useAuth Hook - Integration Unit Tests
 * @description Tests for useAuth hook signup functionality
 * @testing-strategy Integration testing with mocked Supabase
 * @use-case UC1 - Create Account
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { SignupData } from "../../../src/types/hooks";

// Create hoisted mock functions that can be used in vi.mock calls
const { mockNavigate, mockValidateSignupForm, mockFormatUserData } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockValidateSignupForm: vi.fn(),
  mockFormatUserData: vi.fn(),
}));

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock Supabase client
vi.mock("../../../src/integrations/supabase/client", () => {
  const mockSupabaseAuth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  };

  const mockSupabaseFrom = vi.fn();

  return {
    supabase: {
      auth: mockSupabaseAuth,
      from: mockSupabaseFrom,
    },
  };
});

// Mock authentication utils
vi.mock("../../../src/utils/authentication", () => ({
  validateSignupForm: mockValidateSignupForm,
  formatUserData: mockFormatUserData,
}));

// Import the hook after mocking
import { useAuth } from "../../../src/hooks/useAuth";

// Import mocked modules after mocking
import { supabase } from "../../../src/integrations/supabase/client";

// Get access to the mocked functions
const mockSupabaseAuth = supabase.auth as any;
const mockSupabaseFrom = supabase.from as any;

describe("useAuth Hook", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    created_at: new Date().toISOString(),
    user_metadata: {
      user_type: "job-seeker",
      first_name: "John",
      last_name: "Doe",
    },
  };

  const createValidSignupData = (): SignupData => ({
    email: "test@example.com",
    password: "Password123",
    confirmPassword: "Password123",
    firstName: "John",
    lastName: "Doe",
    userType: "jobseeker",
    phoneNumber: "91234567",
    dateOfBirth: "1990-01-01",
    address: "123 Test Street, Singapore",
    postalCode: "123456",
  });

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
      id: mockUser.id,
      email: mockUser.email,
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

  describe("signup function - UC1 Steps 5-14: Account Creation Integration", () => {
    test("should successfully create jobseeker account", async () => {
      // Arrange
      const signupData = createValidSignupData();
      
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      // Mock database checks for existing users
      const mockJobSeekerQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      const mockClientQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      
      mockSupabaseFrom
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockJobSeekerQuery,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockClientQuery,
            }),
          }),
        });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signup(signupData);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
          email: signupData.email,
          password: signupData.password,
          options: {
            data: {
              user_type: "job-seeker",
              first_name: signupData.firstName,
              last_name: signupData.lastName,
              phone_number: signupData.phoneNumber,
              date_of_birth: signupData.dateOfBirth,
              address: signupData.address,
              postal_code: signupData.postalCode,
            },
          },
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith("/auth?mode=login");
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        "signup_success",
        "Account created successfully! Please check your email and confirm your account, then log in."
      );
    });

    test("should successfully create employer account", async () => {
      // Arrange
      const signupData: SignupData = {
        email: "employer@company.com",
        password: "Password123",
        confirmPassword: "Password123",
        firstName: "Jane",
        lastName: "Smith",
        userType: "employer",
        companyName: "Test Company",
        phoneNumber: "62345678",
      };

      const employerUser = {
        ...mockUser,
        email: "employer@company.com",
        user_metadata: {
          user_type: "client",
          first_name: "Jane",
          last_name: "Smith",
          company_name: "Test Company",
          phone_number: "62345678",
        },
      };

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: employerUser, session: null },
        error: null,
      });

      // Mock database checks for existing users
      const mockJobSeekerQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      const mockClientQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      
      mockSupabaseFrom
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockJobSeekerQuery,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockClientQuery,
            }),
          }),
        });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signup(signupData);

      // Assert
      await waitFor(() => {
        expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
          email: signupData.email,
          password: signupData.password,
          options: {
            data: {
              user_type: "client",
              first_name: signupData.firstName,
              last_name: signupData.lastName,
              phone_number: signupData.phoneNumber,
              company_name: signupData.companyName,
            },
          },
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith("/auth?mode=login");
    });

    test("should handle validation errors - UC1 Step 4 Integration: Form Validation Failure", async () => {
      // Arrange
      const signupData = createValidSignupData();
      signupData.email = ""; // Invalid email
      
      const validationErrors = ["Email is required", "Invalid email format"];
      mockValidateSignupForm.mockReturnValue(validationErrors);

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signup(signupData);

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Email is required. Invalid email format");
        expect(result.current.loading).toBe(false);
      });

      expect(mockSupabaseAuth.signUp).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("should handle existing email in custom tables", async () => {
      // Arrange
      const signupData = createValidSignupData();
      
      // Mock existing user found in job_seekers table
      const mockJobSeekerQuery = vi.fn().mockResolvedValue({
        data: { email: signupData.email },
      });
      const mockClientQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      
      mockSupabaseFrom
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockJobSeekerQuery,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockClientQuery,
            }),
          }),
        });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signup(signupData);

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Email already registered. Try signing in instead.");
        expect(result.current.loading).toBe(false);
      });

      expect(mockSupabaseAuth.signUp).not.toHaveBeenCalled();
    });

    test("should handle Supabase signup errors", async () => {
      // Arrange
      const signupData = createValidSignupData();
      
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Email already registered" },
      });

      // Mock database checks (no existing users)
      const mockJobSeekerQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      const mockClientQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      
      mockSupabaseFrom
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockJobSeekerQuery,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockClientQuery,
            }),
          }),
        });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signup(signupData);

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Signup failed");
        expect(result.current.loading).toBe(false);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("should handle existing unconfirmed user", async () => {
      // Arrange
      const signupData = createValidSignupData();
      
      // Mock user created 1 hour ago (not new)
      const oldUser = {
        ...mockUser,
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      };

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: oldUser, session: null },
        error: null,
      });

      // Mock database checks (no existing users)
      const mockJobSeekerQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      const mockClientQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      
      mockSupabaseFrom
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockJobSeekerQuery,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockClientQuery,
            }),
          }),
        });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signup(signupData);

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe("Email already registered but not confirmed. Please check your email for the confirmation link, or try signing in.");
        expect(result.current.loading).toBe(false);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("should handle network/database errors gracefully", async () => {
      // Arrange
      const signupData = createValidSignupData();
      
      // Mock database check throwing error
      mockSupabaseFrom.mockImplementation(() => {
        throw new Error("Network error");
      });

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signup(signupData);

      // Assert - Should continue with signup despite database check error
      await waitFor(() => {
        expect(mockSupabaseAuth.signUp).toHaveBeenCalled();
      });

      expect(mockNavigate).toHaveBeenCalledWith("/auth?mode=login");
    });

    test("should set loading state correctly during signup", async () => {
      // Arrange
      const signupData = createValidSignupData();
      
      let resolveSignup: (value: any) => void;
      const signupPromise = new Promise((resolve) => {
        resolveSignup = resolve;
      });
      
      mockSupabaseAuth.signUp.mockReturnValue(signupPromise);

      // Mock database checks
      const mockJobSeekerQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      const mockClientQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      
      mockSupabaseFrom
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockJobSeekerQuery,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockClientQuery,
            }),
          }),
        });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Start signup
      result.current.signup(signupData);

      // Should be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Resolve signup
      resolveSignup!({
        data: { user: mockUser, session: null },
        error: null,
      });

      // Should not be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("clearError function - UC1 Error Handling", () => {
    test("should clear error state", async () => {
      // Arrange
      const signupData = createValidSignupData();
      signupData.email = "";
      
      mockValidateSignupForm.mockReturnValue(["Email is required"]);

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger error
      await result.current.signup(signupData);
      
      await waitFor(() => {
        expect(result.current.error).toBe("Email is required");
      });

      // Clear error
      result.current.clearError();

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe("Signup data mapping - UC1 Steps 5-14: Supabase Metadata Integration", () => {
    test("should map jobseeker data correctly to Supabase metadata", async () => {
      // Arrange
      const signupData = createValidSignupData();
      
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      // Mock database checks
      const mockJobSeekerQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      const mockClientQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      
      mockSupabaseFrom
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockJobSeekerQuery,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockClientQuery,
            }),
          }),
        });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signup(signupData);

      // Assert
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123",
        options: {
          data: {
            user_type: "job-seeker",
            first_name: "John",
            last_name: "Doe",
            phone_number: "91234567",
            date_of_birth: "1990-01-01",
            address: "123 Test Street, Singapore",
            postal_code: "123456",
          },
        },
      });
    });

    test("should map employer data correctly to Supabase metadata", async () => {
      // Arrange
      const signupData: SignupData = {
        email: "employer@company.com",
        password: "Password123",
        confirmPassword: "Password123",
        firstName: "Jane",
        lastName: "Smith",
        userType: "employer",
        companyName: "Test Company",
        phoneNumber: "62345678",
        officeNumber: "64567890",
      };

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      // Mock database checks
      const mockJobSeekerQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      const mockClientQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      
      mockSupabaseFrom
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockJobSeekerQuery,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockClientQuery,
            }),
          }),
        });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signup(signupData);

      // Assert
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: "employer@company.com",
        password: "Password123",
        options: {
          data: {
            user_type: "client",
            first_name: "Jane",
            last_name: "Smith",
            phone_number: "62345678",
            company_name: "Test Company",
            office_number: "64567890",
          },
        },
      });
    });

    test("should handle optional fields correctly", async () => {
      // Arrange
      const signupData: SignupData = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "Password123",
        firstName: "John",
        lastName: "Doe",
        userType: "jobseeker",
        // Missing optional fields
      };

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      // Mock database checks
      const mockJobSeekerQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      const mockClientQuery = vi.fn().mockRejectedValue(new Error("No user found"));
      
      mockSupabaseFrom
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockJobSeekerQuery,
            }),
          }),
        })
        .mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: mockClientQuery,
            }),
          }),
        });

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signup(signupData);

      // Assert - should only include defined fields
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "Password123",
        options: {
          data: {
            user_type: "job-seeker",
            first_name: "John",
            last_name: "Doe",
          },
        },
      });
    });
  });
});
