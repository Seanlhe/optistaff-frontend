/**
 * Frontend Failure Unit Tests for usePreferences Hooks
 * @description Tests error scenarios and edge cases for usePreferences hooks
 * @author OptiStaff Team
 * @testing_approach Error boundary testing and failure scenario validation
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePreferences } from "../../src/hooks/usePreferences";
import { usePreferencesForm } from "../../src/hooks/usePreferencesForm";
import { usePreferencesLocation } from "../../src/hooks/usePreferencesLocation";

// Mock the Supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
};

// Mock the auth hook with different scenarios
const mockUseAuth = vi.fn();

// Mock the location geocoding hook
const mockUseLocationGeocoding = vi.fn();

// Mock modules
vi.mock("../../src/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("../../src/hooks/useLocationGeocoding", () => ({
  useLocationGeocoding: mockUseLocationGeocoding,
}));

describe("usePreferences Hooks - Error Scenarios and Failure Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: {
        id: "test-user-id",
        email: "test@example.com",
        role: "jobseeker",
      },
      loading: false,
      error: null,
    });

    mockUseLocationGeocoding.mockReturnValue({
      geocodeAddress: vi.fn(),
      reverseGeocode: vi.fn(),
      loading: false,
      error: null,
    });
  });

  // ========================================
  // Authentication Error Scenarios
  // ========================================
  describe("Authentication Error Scenarios", () => {
    test("usePreferences handles null user gracefully", async () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
      });

      // Act
      const { result } = renderHook(() => usePreferences());

      // Assert
      expect(result.current.preferences).toBeNull();
      expect(result.current.error).toBe("User not authenticated");
      expect(result.current.loading).toBe(false);
    });

    test("usePreferences handles authentication loading state", async () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        error: null,
      });

      // Act
      const { result } = renderHook(() => usePreferences());

      // Assert
      expect(result.current.preferences).toBeNull();
      expect(result.current.loading).toBe(true);
    });

    test("savePreferences fails when user is not authenticated", async () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
      });

      const { result } = renderHook(() => usePreferences());

      const preferencesData = {
        min_pay_rate: 20,
        max_travel_km: 15,
        desired_roles: ["Waiter"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false,
      };

      // Act
      let saveResult: boolean = true;
      await act(async () => {
        saveResult = await result.current.savePreferences(preferencesData);
      });

      // Assert
      expect(saveResult).toBe(false);
      expect(result.current.error).toBe("User not authenticated");
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Database Error Scenarios
  // ========================================
  describe("Database Error Scenarios", () => {
    test("fetchPreferences handles database connection error", async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi
              .fn()
              .mockRejectedValue(new Error("Database connection failed")),
          }),
        }),
      });

      // Act
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.preferences).toBeNull();
      expect(result.current.error).toBe("Database connection failed");
    });

    test("create_default_preferences handles RPC function error", async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116", message: "No rows found" },
            }),
          }),
        }),
      });

      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: {
          message: "Function create_default_preferences does not exist",
        },
      });

      // Act
      const { result } = renderHook(() => usePreferences());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.preferences).toBeNull();
      expect(result.current.error).toBe(
        "Function create_default_preferences does not exist",
      );
    });

    test("upsert_user_preferences handles constraint violation", async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: {
          message:
            'new row for relation "preferences" violates check constraint "preferences_max_hours_per_week_check"',
          code: "23514",
        },
      });

      const { result } = renderHook(() => usePreferences());

      const invalidPreferencesData = {
        min_pay_rate: 20,
        max_travel_km: 15,
        desired_roles: ["Waiter"],
        max_hours_per_week: 50, // Violates constraint
        max_hours_per_shift: 8,
        consider_lower_rate: false,
      };

      // Act
      let saveResult: boolean = true;
      await act(async () => {
        saveResult = await result.current.savePreferences(
          invalidPreferencesData,
        );
      });

      // Assert
      expect(saveResult).toBe(false);
      expect(result.current.error).toContain("violates check constraint");
    });

    test("validate_job_names handles RPC timeout", async () => {
      // Arrange
      mockSupabase.rpc.mockRejectedValue(new Error("Request timeout"));

      const { result } = renderHook(() => usePreferencesForm());

      // Act
      let validationResult: { isValid: boolean; error?: string } = {
        isValid: true,
      };
      await act(async () => {
        validationResult = await result.current.validateJobNames(["Waiter"]);
      });

      // Assert
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.error).toBe("Request timeout");
    });
  });

  // ========================================
  // Location Service Error Scenarios
  // ========================================
  describe("Location Service Error Scenarios", () => {
    test("usePreferencesLocation handles get_user_location RPC error", async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "Function get_user_location does not exist" },
      });

      // Act
      const { result } = renderHook(() => usePreferencesLocation());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.homeLocation).toBeNull();
      expect(result.current.homeAddress).toBeNull();
      expect(result.current.error).toBe(
        "Failed to load location data: Function get_user_location does not exist",
      );
    });

    test("geocodeHomeLocation handles geocoding service failure", async () => {
      // Arrange
      const mockLocationData = {
        user_id: "test-user-id",
        address_coordinates: null,
        postal_code: "123456",
        address: null,
        coordinates_lat: null,
        coordinates_lng: null,
        formatted_address: "Singapore 123456",
      };

      mockSupabase.rpc.mockResolvedValue({
        data: [mockLocationData],
        error: null,
      });

      const mockGeocodeAddress = vi
        .fn()
        .mockRejectedValue(new Error("Geocoding service unavailable"));

      mockUseLocationGeocoding.mockReturnValue({
        geocodeAddress: mockGeocodeAddress,
        reverseGeocode: vi.fn(),
        loading: false,
        error: {
          type: "NETWORK_ERROR",
          message: "Geocoding service unavailable",
        },
      });

      const { result } = renderHook(() => usePreferencesLocation());

      await waitFor(() => {
        expect(result.current.locationData?.postal_code).toBe("123456");
      });

      // Act
      let coordinates: [number, number] | null = [0, 0];
      await act(async () => {
        coordinates = await result.current.geocodeHomeLocation();
      });

      // Assert
      expect(coordinates).toBeNull();
      expect(result.current.error).toContain("Geocoding error");
    });

    test("geocodeHomeLocation handles missing postal code", async () => {
      // Arrange
      const mockLocationData = {
        user_id: "test-user-id",
        address_coordinates: null,
        postal_code: null,
        address: null,
        coordinates_lat: null,
        coordinates_lng: null,
        formatted_address: null,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: [mockLocationData],
        error: null,
      });

      const { result } = renderHook(() => usePreferencesLocation());

      await waitFor(() => {
        expect(result.current.locationData?.postal_code).toBeNull();
      });

      // Act
      let coordinates: [number, number] | null = [0, 0];
      await act(async () => {
        coordinates = await result.current.geocodeHomeLocation();
      });

      // Assert
      expect(coordinates).toBeNull();
      expect(result.current.error).toContain(
        "No postal code available for geocoding",
      );
    });
  });

  // ========================================
  // Validation Error Scenarios
  // ========================================
  describe("Validation Error Scenarios", () => {
    test("upsert_user_preferences handles validation errors from database function", async () => {
      // Arrange
      const mockValidationError = {
        preference_id: null,
        user_id: null,
        min_pay_rate: null,
        max_travel_km: null,
        desired_roles: null,
        max_hours_per_week: null,
        max_hours_per_shift: null,
        consider_lower_rate: null,
        created_at: null,
        updated_at: null,
        validation_errors: [
          "Please select at least one preferred job type",
          "One or more selected job types are invalid or inactive",
        ],
      };

      mockSupabase.rpc.mockResolvedValue({
        data: [mockValidationError],
        error: null,
      });

      const { result } = renderHook(() => usePreferences());

      const invalidPreferencesData = {
        min_pay_rate: 20,
        max_travel_km: 15,
        desired_roles: [], // Empty array should trigger validation error
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false,
      };

      // Act
      let saveResult: boolean = true;
      await act(async () => {
        saveResult = await result.current.savePreferences(
          invalidPreferencesData,
        );
      });

      // Assert
      expect(saveResult).toBe(false);
      expect(result.current.error).toBe(
        "Please select at least one preferred job type, One or more selected job types are invalid or inactive",
      );
    });

    test("usePreferencesForm handles client-side validation failure", async () => {
      // Arrange
      const invalidPreferences = {
        preference_id: "pref-123",
        user_id: "test-user-id",
        min_pay_rate: -5, // Invalid negative pay rate
        max_travel_km: 15,
        desired_roles: ["Waiter"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: invalidPreferences,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => usePreferencesForm());

      await waitFor(() => {
        expect(result.current.preferences).toEqual(invalidPreferences);
      });

      const formData = {
        payRate: -5, // Invalid
        considerLowerRate: false,
        maxHoursPerWeek: 40,
        maxHoursPerShift: 8,
        maxTravelKm: 15,
        selectedJobNames: ["Waiter"],
      };

      // Act
      let saveResult: boolean = true;
      await act(async () => {
        saveResult = await result.current.savePreferences(formData);
      });

      // Assert
      expect(saveResult).toBe(false);
      expect(result.current.error).toContain(
        "Pay rate must be greater than or equal to 0",
      );
    });
  });

  // ========================================
  // Network and Connectivity Error Scenarios
  // ========================================
  describe("Network and Connectivity Error Scenarios", () => {
    test("handles network timeout during preferences fetch", async () => {
      // Arrange
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockImplementation(() => {
              return new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Network timeout")), 100);
              });
            }),
          }),
        }),
      });

      // Act
      const { result } = renderHook(() => usePreferences());

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 200 },
      );

      // Assert
      expect(result.current.preferences).toBeNull();
      expect(result.current.error).toBe("Network timeout");
    });

    test("handles intermittent network failure during save operation", async () => {
      // Arrange
      let callCount = 0;
      mockSupabase.rpc.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error("Network error"));
        }
        return Promise.resolve({
          data: [
            {
              preference_id: "pref-123",
              user_id: "test-user-id",
              min_pay_rate: 20,
              max_travel_km: 15,
              desired_roles: ["Waiter"],
              max_hours_per_week: 40,
              max_hours_per_shift: 8,
              consider_lower_rate: false,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
              validation_errors: [],
            },
          ],
          error: null,
        });
      });

      const { result } = renderHook(() => usePreferences());

      const preferencesData = {
        min_pay_rate: 20,
        max_travel_km: 15,
        desired_roles: ["Waiter"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false,
      };

      // Act - First attempt should fail
      let firstSaveResult: boolean = true;
      await act(async () => {
        firstSaveResult = await result.current.savePreferences(preferencesData);
      });

      // Act - Second attempt should succeed
      let secondSaveResult: boolean = false;
      await act(async () => {
        secondSaveResult =
          await result.current.savePreferences(preferencesData);
      });

      // Assert
      expect(firstSaveResult).toBe(false);
      expect(secondSaveResult).toBe(true);
      expect(callCount).toBe(2);
    });
  });

  // ========================================
  // Edge Cases and Boundary Conditions
  // ========================================
  describe("Edge Cases and Boundary Conditions", () => {
    test("handles malformed response from database function", async () => {
      // Arrange
      mockSupabase.rpc.mockResolvedValue({
        data: "invalid-response-format", // Should be array
        error: null,
      });

      const { result } = renderHook(() => usePreferences());

      const preferencesData = {
        min_pay_rate: 20,
        max_travel_km: 15,
        desired_roles: ["Waiter"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false,
      };

      // Act
      let saveResult: boolean = true;
      await act(async () => {
        saveResult = await result.current.savePreferences(preferencesData);
      });

      // Assert
      expect(saveResult).toBe(false);
      // Should handle gracefully without crashing
    });

    test("handles extremely large desired_roles array", async () => {
      // Arrange
      const largeJobArray = Array.from({ length: 1000 }, (_, i) => `Job${i}`);

      mockSupabase.rpc.mockResolvedValue({
        data: false, // Validation should fail for such large array
        error: null,
      });

      const { result } = renderHook(() => usePreferencesForm());

      // Act
      let validationResult: { isValid: boolean; error?: string } = {
        isValid: true,
      };
      await act(async () => {
        validationResult = await result.current.validateJobNames(largeJobArray);
      });

      // Assert
      expect(validationResult.isValid).toBe(false);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("validate_job_names", {
        job_names: largeJobArray,
      });
    });

    test("handles concurrent save operations", async () => {
      // Arrange
      let resolveCount = 0;
      mockSupabase.rpc.mockImplementation(() => {
        resolveCount++;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: [
                {
                  preference_id: `pref-${resolveCount}`,
                  user_id: "test-user-id",
                  min_pay_rate: 20 + resolveCount,
                  max_travel_km: 15,
                  desired_roles: ["Waiter"],
                  max_hours_per_week: 40,
                  max_hours_per_shift: 8,
                  consider_lower_rate: false,
                  created_at: "2025-01-01T00:00:00Z",
                  updated_at: "2025-01-01T00:00:00Z",
                  validation_errors: [],
                },
              ],
              error: null,
            });
          }, 100);
        });
      });

      const { result } = renderHook(() => usePreferences());

      const preferencesData1 = {
        min_pay_rate: 20,
        max_travel_km: 15,
        desired_roles: ["Waiter"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false,
      };

      const preferencesData2 = {
        min_pay_rate: 25,
        max_travel_km: 20,
        desired_roles: ["Chef"],
        max_hours_per_week: 35,
        max_hours_per_shift: 7,
        consider_lower_rate: true,
      };

      // Act - Trigger concurrent saves
      const [result1, result2] = await Promise.all([
        act(async () => await result.current.savePreferences(preferencesData1)),
        act(async () => await result.current.savePreferences(preferencesData2)),
      ]);

      // Assert - Both operations should complete
      expect(resolveCount).toBe(2);
      // The final state should reflect one of the operations
      expect(result.current.preferences?.min_pay_rate).toBeGreaterThanOrEqual(
        20,
      );
    });
  });
});
