/**
 * Unit Tests for upsert_user_preferences Database Function
 * @description Tests the upsert_user_preferences function with simplified test cases
 * @author OptiStaff Team
 * @testing_approach Simplified functional testing
 */

import { describe, test, expect, beforeEach } from "vitest";
import {
  testSupabase,
  createTestJobSeeker,
  cleanupTestData,
  ensureTestJobTypes,
} from "../../../src/test-setup";


// UC3 Mapping:
// - UC3 Step 4: "validate_preferences() -> validate job names and constraints" (via DB validation in function plus separate validate_job_names)
// - UC3 Step 5: "savePreferences() -> CALL upsert_user_preferences(...)" (primary save path)

describe("upsert_user_preferences - Database Function Unit Tests", () => {
  beforeEach(async () => {
    await cleanupTestData();
    await ensureTestJobTypes(); // Ensure required job types exist
  });

  describe("Basic Function Tests", () => {
    test("creates new preferences successfully", async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker();

      // Act
      const { data, error } = await testSupabase.rpc(
        "upsert_user_preferences",
        {
          p_target_user_id: jobSeeker.user_id,
          p_min_pay_rate: 20,
          p_max_travel_km: 15,
          p_desired_roles: ["Waiter/Waitress"],
          p_max_hours_per_week: 40,
          p_max_hours_per_shift: 8,
          p_consider_lower_rate: false,
        },
      );

      // Assert
      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.length).toBe(1);

      const result = data[0];
      expect(result.validation_errors).toEqual([]);
      expect(result.user_id).toBe(jobSeeker.user_id);
      expect(result.min_pay_rate).toBe(20);
      expect(result.max_travel_km).toBe(15);
      expect(result.desired_roles).toEqual(["Waiter/Waitress"]);
      expect(result.max_hours_per_week).toBe(40);
      expect(result.max_hours_per_shift).toBe(8);
      expect(result.consider_lower_rate).toBe(false);
    });

    test("updates existing preferences", async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker();

      // Create initial preferences
      await testSupabase.rpc("create_default_preferences", {
        p_user_id: jobSeeker.user_id,
      });

      // Act - Update preferences
      const { data, error } = await testSupabase.rpc(
        "upsert_user_preferences",
        {
          p_target_user_id: jobSeeker.user_id,
          p_min_pay_rate: 25,
          p_max_travel_km: 20,
          p_desired_roles: ["Kitchen Helper"],
          p_max_hours_per_week: 35,
          p_max_hours_per_shift: 8,
          p_consider_lower_rate: true,
        },
      );

      // Assert
      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.length).toBe(1);

      const result = data[0];
      expect(result.validation_errors).toEqual([]);
      expect(result.user_id).toBe(jobSeeker.user_id);
      expect(result.min_pay_rate).toBe(25);
      expect(result.max_travel_km).toBe(20);
      expect(result.desired_roles).toEqual(["Kitchen Helper"]);
      expect(result.max_hours_per_week).toBe(35);
      expect(result.max_hours_per_shift).toBe(8);
      expect(result.consider_lower_rate).toBe(true);
    });

    test("validates empty desired_roles", async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker();

      // Act
      const { data, error } = await testSupabase.rpc(
        "upsert_user_preferences",
        {
          p_target_user_id: jobSeeker.user_id,
          p_min_pay_rate: 20,
          p_max_travel_km: 15,
          p_desired_roles: [],
          p_max_hours_per_week: 40,
          p_max_hours_per_shift: 8,
          p_consider_lower_rate: false,
        },
      );

      // Assert
      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data[0].validation_errors).toContain(
        "Please select at least one preferred job type",
      );
    });

    test("validates non-existent job names", async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker();

      // Act
      const { data, error } = await testSupabase.rpc(
        "upsert_user_preferences",
        {
          p_target_user_id: jobSeeker.user_id,
          p_min_pay_rate: 20,
          p_max_travel_km: 15,
          p_desired_roles: ["NonExistentJob"],
          p_max_hours_per_week: 40,
          p_max_hours_per_shift: 8,
          p_consider_lower_rate: false,
        },
      );

      // Assert
      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data[0].validation_errors).toContain(
        "One or more selected job types are invalid or inactive",
      );
    });
  });

  describe("Edge Cases", () => {
    test("handles invalid UUID format", async () => {
      // Act
      const { error } = await testSupabase.rpc(
        "upsert_user_preferences",
        {
          p_target_user_id: "invalid-uuid",
          p_min_pay_rate: 20,
          p_max_travel_km: 15,
          p_desired_roles: ["Waiter/Waitress"],
          p_max_hours_per_week: 40,
          p_max_hours_per_shift: 8,
          p_consider_lower_rate: false,
        },
      );

      // Assert
      expect(error).not.toBeNull();
    });

    test("handles concurrent upsert operations", async () => {
      // Arrange
      const jobSeeker = await createTestJobSeeker();

      // Act - Simulate concurrent updates
      const update1Promise = testSupabase.rpc("upsert_user_preferences", {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 20,
        p_max_travel_km: 10,
        p_desired_roles: ["Cashier"],
        p_max_hours_per_week: 35,
        p_max_hours_per_shift: 7,
        p_consider_lower_rate: false,
      });

      const update2Promise = testSupabase.rpc("upsert_user_preferences", {
        p_target_user_id: jobSeeker.user_id,
        p_min_pay_rate: 25,
        p_max_travel_km: 15,
        p_desired_roles: ["Kitchen Helper"],
        p_max_hours_per_week: 40,
        p_max_hours_per_shift: 8,
        p_consider_lower_rate: true,
      });

      const [result1, result2] = await Promise.all([
        update1Promise,
        update2Promise,
      ]);

      // Assert - Both should succeed (last one wins due to upsert)
      expect(result1.error).toBeNull();
      expect(result2.error).toBeNull();

      // Verify final state
      const { data: finalPrefs } = await testSupabase
        .from("preferences")
        .select("*")
        .eq("user_id", jobSeeker.user_id)
        .single();

      expect(finalPrefs).toBeTruthy();
    });
  });
});
