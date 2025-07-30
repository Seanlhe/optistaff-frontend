import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePreferences } from "../../src/hooks/usePreferences";
import {
  testSupabase,
  createTestJobSeeker,
  cleanupTestData,
} from "../../src/test-setup";

// Mock the auth hook with proper UUID
const mockUser = { id: crypto.randomUUID() };
vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock the location geocoding hook
const mockGeocodeAddress = vi.fn();
const mockReverseGeocode = vi.fn();
vi.mock("../../src/hooks/useLocationGeocoding", () => ({
  useLocationGeocoding: () => ({
    geocodeAddress: mockGeocodeAddress,
    reverseGeocode: mockReverseGeocode,
    loading: false,
    error: null,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("usePreferences Hook - Integration Tests", () => {
  beforeEach(async () => {
    await cleanupTestData();
    vi.clearAllMocks();

    // Create auth user first, then job seeker
    await testSupabase.auth.admin.createUser({
      user_id: mockUser.id,
      email: "test@example.com",
      password: "testpassword123",
      email_confirm: true,
    });

    // Create test job seeker for the mocked user
    await createTestJobSeeker({ user_id: mockUser.id });
  });

  describe("fetchPreferences - Equivalence Class Testing", () => {
    test("fetches existing preferences successfully", async () => {
      // Arrange - Create preferences
      const testPreferences = {
        user_id: mockUser.id,
        min_pay_rate: 20,
        max_travel_km: 15,
        desired_roles: ["Server", "Bartender"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: true,
      };

      await testSupabase.from("preferences").insert(testPreferences);

      // Act
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.preferences).toBeTruthy();
      expect(result.current.preferences?.min_pay_rate).toBe(20);
      expect(result.current.preferences?.desired_roles).toEqual([
        "Server",
        "Bartender",
      ]);
      expect(result.current.error).toBeNull();
    });

    test("creates default preferences when none exist", async () => {
      // Act - No existing preferences
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.preferences).toBeTruthy();
      expect(result.current.preferences?.min_pay_rate).toBe(15); // Default value
      expect(result.current.preferences?.desired_roles).toEqual([]); // Default empty array
      expect(result.current.error).toBeNull();
    });

    test("handles database error gracefully", async () => {
      // Arrange - Create invalid user ID to trigger error
      const invalidUser = ({ id: "invalid-user-id" }(
        vi.importActual("../../src/hooks/useAuth") as any,
      ).useAuth = () => ({ user: invalidUser }));

      // Act
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.preferences).toBeNull();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("savePreferences - Boundary Value Testing", () => {
    test("saves preferences with minimum valid values", async () => {
      // Arrange
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const minValidPreferences = {
        payRate: 15, // Minimum
        maxTravelKm: 1, // Minimum
        selectedJobNames: [], // Empty is valid
        maxHoursPerWeek: 1, // Minimum
        maxHoursPerShift: 1, // Minimum
        considerLowerRate: false,
      };

      // Act
      let saveResult: boolean | undefined;
      await act(async () => {
        saveResult = await result.current.savePreferences(minValidPreferences);
      });

      // Assert
      expect(saveResult).toBe(true);
      expect(result.current.preferences?.min_pay_rate).toBe(15);
      expect(result.current.preferences?.max_travel_km).toBe(1);
      expect(result.current.error).toBeNull();
    });

    test("saves preferences with maximum valid values", async () => {
      // Arrange - Create job types for maximum test
      await testSupabase.from("job_categories").insert({
        category_name: "Hospitality",
        description: "Hospitality jobs",
      });

      const { data: category } = await testSupabase
        .from("job_categories")
        .select("category_id")
        .eq("category_name", "Hospitality")
        .single();

      await testSupabase.from("job_types").insert([
        {
          type_name: "Server",
          category_id: category.category_id,
          description: "Server",
          is_active: true,
        },
        {
          type_name: "Manager",
          category_id: category.category_id,
          description: "Manager",
          is_active: true,
        },
        {
          type_name: "Cook",
          category_id: category.category_id,
          description: "Cook",
          is_active: true,
        },
      ]);

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const maxValidPreferences = {
        payRate: 100, // High value
        maxTravelKm: 100, // High value
        selectedJobNames: ["Server", "Manager", "Cook"], // Multiple jobs
        maxHoursPerWeek: 44, // Maximum allowed
        maxHoursPerShift: 12, // Maximum allowed
        considerLowerRate: true,
      };

      // Act
      let saveResult: boolean | undefined;
      await act(async () => {
        saveResult = await result.current.savePreferences(maxValidPreferences);
      });

      // Assert
      expect(saveResult).toBe(true);
      expect(result.current.preferences?.min_pay_rate).toBe(100);
      expect(result.current.preferences?.desired_roles).toEqual([
        "Server",
        "Manager",
        "Cook",
      ]);
      expect(result.current.preferences?.max_hours_per_week).toBe(44);
      expect(result.current.error).toBeNull();
    });

    test("rejects invalid job names", async () => {
      // Arrange
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const invalidPreferences = {
        payRate: 20,
        maxTravelKm: 15,
        selectedJobNames: ["NonExistentJob"], // Invalid job name
        maxHoursPerWeek: 40,
        maxHoursPerShift: 8,
        considerLowerRate: false,
      };

      // Act
      let saveResult: boolean | undefined;
      await act(async () => {
        saveResult = await result.current.savePreferences(invalidPreferences);
      });

      // Assert
      expect(saveResult).toBe(false);
      expect(result.current.error).toContain("Invalid job types");
    });

    test("validates hours per week boundary (over 44 hours)", async () => {
      // Arrange
      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const invalidPreferences = {
        payRate: 20,
        maxTravelKm: 15,
        selectedJobNames: [],
        maxHoursPerWeek: 50, // Over limit
        maxHoursPerShift: 8,
        considerLowerRate: false,
      };

      // Act
      let saveResult: boolean | undefined;
      await act(async () => {
        saveResult = await result.current.savePreferences(invalidPreferences);
      });

      // Assert
      expect(saveResult).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("updatePreferences - Decision Table Testing", () => {
    const updateTestCases = [
      {
        description: "updates single field (pay rate)",
        update: { min_pay_rate: 25 },
        expectedField: "min_pay_rate",
        expectedValue: 25,
      },
      {
        description: "updates multiple fields",
        update: {
          min_pay_rate: 30,
          max_travel_km: 20,
          consider_lower_rate: true,
        },
        expectedField: "min_pay_rate",
        expectedValue: 30,
      },
      {
        description: "updates job preferences",
        update: { desired_roles: ["Server"] },
        expectedField: "desired_roles",
        expectedValue: ["Server"],
      },
    ];

    updateTestCases.forEach(
      ({ description, update, expectedField, expectedValue }) => {
        test(description, async () => {
          // Arrange - Create initial preferences
          await testSupabase.from("preferences").insert({
            user_id: mockUser.id,
            min_pay_rate: 15,
            max_travel_km: 10,
            desired_roles: [],
            max_hours_per_week: 40,
            max_hours_per_shift: 8,
            consider_lower_rate: false,
          });

          const { result } = renderHook(() => usePreferences(), {
            wrapper: createWrapper(),
          });

          await waitFor(() => {
            expect(result.current.preferences).toBeTruthy();
          });

          // Act
          let updateResult: boolean | undefined;
          await act(async () => {
            updateResult = await result.current.updatePreferences(update);
          });

          // Assert
          expect(updateResult).toBe(true);
          expect(
            result.current.preferences?.[
              expectedField as keyof typeof result.current.preferences
            ],
          ).toEqual(expectedValue);
          expect(result.current.error).toBeNull();
        });
      },
    );
  });

  describe("resetPreferences", () => {
    test("resets preferences to default values", async () => {
      // Arrange - Create custom preferences
      await testSupabase.from("preferences").insert({
        user_id: mockUser.id,
        min_pay_rate: 50,
        max_travel_km: 30,
        desired_roles: ["Manager", "Server"],
        max_hours_per_week: 35,
        max_hours_per_shift: 10,
        consider_lower_rate: true,
      });

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.preferences).toBeTruthy();
      });

      // Act
      let resetResult: boolean | undefined;
      await act(async () => {
        resetResult = await result.current.resetPreferences();
      });

      // Assert
      expect(resetResult).toBe(true);
      expect(result.current.preferences?.min_pay_rate).toBe(15); // Default
      expect(result.current.preferences?.max_travel_km).toBe(15); // Default
      expect(result.current.preferences?.desired_roles).toEqual([]); // Default
      expect(result.current.preferences?.consider_lower_rate).toBe(false); // Default
      expect(result.current.error).toBeNull();
    });
  });

  describe("Helper functions", () => {
    test("hasJobPreference returns correct boolean", async () => {
      // Arrange
      await testSupabase.from("preferences").insert({
        user_id: mockUser.id,
        min_pay_rate: 20,
        max_travel_km: 15,
        desired_roles: ["Server", "Bartender"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false,
      });

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.preferences).toBeTruthy();
      });

      // Act & Assert
      expect(result.current.hasJobPreference("Server")).toBe(true);
      expect(result.current.hasJobPreference("Cook")).toBe(false);
    });

    test("getPreferredJobTypes returns correct array", async () => {
      // Arrange
      const jobTypes = ["Server", "Bartender", "Manager"];
      await testSupabase.from("preferences").insert({
        user_id: mockUser.id,
        min_pay_rate: 20,
        max_travel_km: 15,
        desired_roles: jobTypes,
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false,
      });

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.preferences).toBeTruthy();
      });

      // Act & Assert
      expect(result.current.getPreferredJobTypes()).toEqual(jobTypes);
    });

    test("getFormData returns correct form structure", async () => {
      // Arrange
      await testSupabase.from("preferences").insert({
        user_id: mockUser.id,
        min_pay_rate: 25,
        max_travel_km: 20,
        desired_roles: ["Server"],
        max_hours_per_week: 35,
        max_hours_per_shift: 7,
        consider_lower_rate: true,
      });

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.preferences).toBeTruthy();
      });

      // Act
      const formData = result.current.getFormData();

      // Assert
      expect(formData).toBeTruthy();
      expect(formData?.payRate).toBe(25);
      expect(formData?.maxTravelKm).toBe(20);
      expect(formData?.selectedJobNames).toEqual(["Server"]);
      expect(formData?.maxHoursPerWeek).toBe(35);
      expect(formData?.maxHoursPerShift).toBe(7);
      expect(formData?.considerLowerRate).toBe(true);
    });
  });

  describe("Location functionality", () => {
    test("loads location data from job_seekers table", async () => {
      // Arrange - Add location data to job seeker
      await testSupabase
        .from("job_seekers")
        .update({
          address_coordinates: "1.3521,103.8198", // Singapore coordinates
          postal_code: "238880",
        })
        .eq("user_id", mockUser.id);

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      // Act & Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.homeLocation).toEqual([1.3521, 103.8198]);
      expect(result.current.homeAddress).toBe("238880");
    });

    test("geocodes home location when coordinates missing", async () => {
      // Arrange
      await testSupabase
        .from("job_seekers")
        .update({
          address_coordinates: null,
          postal_code: "238880",
        })
        .eq("user_id", mockUser.id);

      mockGeocodeAddress.mockResolvedValue([1.3521, 103.8198]);
      mockReverseGeocode.mockResolvedValue("Marina Bay, Singapore 238880");

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      let coordinates: [number, number] | null = null;
      await act(async () => {
        coordinates = await result.current.geocodeHomeLocation();
      });

      // Assert
      expect(coordinates).toEqual([1.3521, 103.8198]);
      expect(mockGeocodeAddress).toHaveBeenCalledWith("238880");
      expect(result.current.homeLocation).toEqual([1.3521, 103.8198]);
    });

    test("handles invalid coordinates gracefully", async () => {
      // Arrange - Invalid coordinates (outside Singapore)
      await testSupabase
        .from("job_seekers")
        .update({
          address_coordinates: "40.7128,-74.0060", // New York coordinates
          postal_code: "238880",
        })
        .eq("user_id", mockUser.id);

      const { result } = renderHook(() => usePreferences(), {
        wrapper: createWrapper(),
      });

      // Act & Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.homeLocation).toBeNull();
      expect(result.current.error).toContain("outside Singapore");
    });
  });
});
