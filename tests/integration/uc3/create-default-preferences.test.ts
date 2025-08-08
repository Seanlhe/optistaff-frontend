/**
 * Unit Tests for create_default_preferences Database Function
 * @description Tests the create_default_preferences function using Equivalence Class Testing (ECT)
 * @author OptiStaff Team
 * @testing_approach Equivalence Class Testing - Valid/Invalid input classes
 */

import { describe, test, expect, beforeEach } from "vitest";
import {
  testSupabase,
  createTestJobSeeker,
  cleanupTestData,
  ensureTestJobTypes,
} from "../../../src/test-setup";

describe("create_default_preferences - Database Function Unit Tests", () => {
  beforeEach(async () => {
    await cleanupTestData();
    await ensureTestJobTypes(); // Ensure required job types exist
  });

  // ========================================
  // Equivalence Class Testing (ECT)
  // ========================================
  describe("Valid Input Equivalence Classes", () => {
    test("TC-UC3-I18: creates default preferences for new user (valid UUID)", async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker();

      // Act
      const { data, error } = await testSupabase.rpc(
        "create_default_preferences",
        {
          p_user_id: jobSeeker.user_id,
        },
      );

      // Assert
      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);

      const preferences = data[0];
      expect(preferences.user_id).toBe(jobSeeker.user_id);
      expect(preferences.min_pay_rate).toBe(15); // Default value
      expect(preferences.max_travel_km).toBe(15); // Default value
      expect(preferences.desired_roles).toEqual([]); // Empty array
      expect(preferences.max_hours_per_week).toBe(40); // Default value
      expect(preferences.max_hours_per_shift).toBe(8); // Default value
      expect(preferences.consider_lower_rate).toBe(false); // Default value
      expect(preferences.preference_id).toBeTruthy();
      expect(preferences.created_at).toBeTruthy();
      expect(preferences.updated_at).toBeTruthy();
    });

    test("TC-UC3-I18: handles duplicate creation gracefully (idempotent operation)", async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker();

      // Create preferences first time
      const firstResult = await testSupabase.rpc("create_default_preferences", {
        p_user_id: jobSeeker.user_id,
      });

      // Ensure first creation succeeded
      expect(firstResult.error).toBeNull();

      // Act - Try to create again
      const secondResult = await testSupabase.rpc(
        "create_default_preferences",
        {
          p_user_id: jobSeeker.user_id,
        },
      );

      // Assert - Should return existing preferences, not create duplicates
      expect(secondResult.error).toBeNull();
      expect(secondResult.data).toBeTruthy();
      expect(secondResult.data?.length).toBe(1);

      // Verify only one preference record exists
      const { data: allPreferences, error: queryError } = await testSupabase
        .from("preferences")
        .select("*")
        .eq("user_id", jobSeeker.user_id);

      expect(queryError).toBeNull();
      expect(allPreferences?.length).toBe(1);
    });

    test("TC-UC3-I18: creates preferences with correct default values structure", async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker();

      // Act
      const { data, error } = await testSupabase.rpc(
        "create_default_preferences",
        {
          p_user_id: jobSeeker.user_id,
        },
      );

      // Assert - Verify all expected fields are present and correct
      expect(error).toBeNull();
      const preferences = data[0];

      // Required fields
      expect(preferences).toHaveProperty("preference_id");
      expect(preferences).toHaveProperty("user_id");
      expect(preferences).toHaveProperty("created_at");
      expect(preferences).toHaveProperty("updated_at");

      // Default values validation
      expect(typeof preferences.min_pay_rate).toBe("number");
      expect(typeof preferences.max_travel_km).toBe("number");
      expect(Array.isArray(preferences.desired_roles)).toBe(true);
      expect(typeof preferences.max_hours_per_week).toBe("number");
      expect(typeof preferences.max_hours_per_shift).toBe("number");
      expect(typeof preferences.consider_lower_rate).toBe("boolean");

      // Business rule validation
      expect(preferences.min_pay_rate).toBeGreaterThan(0);
      expect(preferences.max_travel_km).toBeGreaterThan(0);
      expect(preferences.max_hours_per_week).toBeGreaterThan(0);
      expect(preferences.max_hours_per_week).toBeLessThanOrEqual(44);
      expect(preferences.max_hours_per_shift).toBeGreaterThan(0);
      expect(preferences.max_hours_per_shift).toBeLessThanOrEqual(12);
    });
  });

  describe("Invalid Input Equivalence Classes", () => {
    test("TC-UC3-I18: handles null user_id gracefully", async () => {
      // Act
      const { data, error } = await testSupabase.rpc(
        "create_default_preferences",
        {
          p_user_id: null,
        },
      );

      // Assert - Should handle gracefully (implementation dependent)
      expect(error).not.toBeNull();
    });

    test("TC-UC3-I18: handles invalid UUID format", async () => {
      // Act
      const { data, error } = await testSupabase.rpc(
        "create_default_preferences",
        {
          p_user_id: "invalid-uuid-format",
        },
      );

      // Assert
      expect(error).not.toBeNull();
    });

    test("TC-UC3-I18: handles non-existent user_id", async () => {
      // Arrange - Use valid UUID format but non-existent user
      const nonExistentUserId = "00000000-0000-0000-0000-000000000001";

      // Act
      const { data, error } = await testSupabase.rpc(
        "create_default_preferences",
        {
          p_user_id: nonExistentUserId,
        },
      );

      // Assert - Should fail due to foreign key constraint
      // (preferences table enforces FK to job_seekers)
      expect(error).not.toBeNull();
      expect(error.code).toBe("23503"); // Foreign key violation
      expect(error.message).toContain("violates foreign key constraint");
      expect(data).toBeNull();
    });

    test("TC-UC3-I18: handles empty string user_id", async () => {
      // Act
      const { data, error } = await testSupabase.rpc(
        "create_default_preferences",
        {
          p_user_id: "",
        },
      );

      // Assert
      expect(error).not.toBeNull();
    });
  });

  describe("Edge Cases and Boundary Conditions", () => {
    test("TC-UC3-I18: verifies created preferences can be retrieved via direct query", async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker();

      // Act
      const { data: rpcData, error: rpcError } = await testSupabase.rpc(
        "create_default_preferences",
        {
          p_user_id: jobSeeker.user_id,
        },
      );

      // Verify via direct table query
      const { data: directData, error: directError } = await testSupabase
        .from("preferences")
        .select("*")
        .eq("user_id", jobSeeker.user_id)
        .single();

      // Assert
      expect(rpcError).toBeNull();
      expect(directError).toBeNull();
      expect(rpcData?.[0]?.preference_id).toBe(directData?.preference_id);
      expect(rpcData?.[0]?.min_pay_rate).toBe(directData?.min_pay_rate);
      expect(rpcData?.[0]?.desired_roles).toEqual(directData?.desired_roles);
    });

    test("TC-UC3-I18: handles concurrent creation attempts", async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker();

      // Act - Simulate concurrent creation attempts
      const [result1, result2] = await Promise.all([
        testSupabase.rpc("create_default_preferences", {
          p_user_id: jobSeeker.user_id,
        }),
        testSupabase.rpc("create_default_preferences", {
          p_user_id: jobSeeker.user_id,
        }),
      ]);

      // Assert - Both should succeed (idempotent)
      expect(result1.error).toBeNull();
      expect(result2.error).toBeNull();

      // Verify only one record exists
      const { data: allPreferences, error: queryError } = await testSupabase
        .from("preferences")
        .select("*")
        .eq("user_id", jobSeeker.user_id);

      expect(queryError).toBeNull();
      expect(allPreferences?.length).toBe(1);
    });
  });
});
