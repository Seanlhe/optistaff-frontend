/**
 * upsert-user-preferences-structured-errors.test.ts
 * UC3 Back-end Unit Test
 *
 * Validates structured validation_errors array from upsert_user_preferences
 * for various validation failures.
 *
 * UC3 Mapping:
 * // UC3 Step 4: "validate_preferences() -> validate job names and constraints"
 * // UC3 Step 5: "savePreferences() -> CALL upsert_user_preferences(...)"
 */

import { describe, test, expect, beforeEach } from "vitest";
import { testSupabase, createTestJobSeeker, cleanupTestData, ensureTestJobTypes } from "../../../src/test-setup";

describe("UC3 - upsert_user_preferences structured errors", () => {
  beforeEach(async () => {
    await cleanupTestData();
    await ensureTestJobTypes();
  });

  test("empty desired_roles returns specific validation error message", async () => {
    const js = await createTestJobSeeker();
    const { data, error } = await testSupabase.rpc("upsert_user_preferences", {
      p_target_user_id: js.user_id,
      p_min_pay_rate: 20,
      p_max_travel_km: 15,
      p_desired_roles: [],
      p_max_hours_per_week: 40,
      p_max_hours_per_shift: 8,
      p_consider_lower_rate: false,
    });

    expect(error).toBeNull();
    const result = data![0];
    expect(Array.isArray(result.validation_errors)).toBe(true);
    expect(result.validation_errors).toContain("Please select at least one preferred job type");
  });

  test("nonexistent job roles returns invalid/inactive validation error", async () => {
    const js = await createTestJobSeeker();
    const { data, error } = await testSupabase.rpc("upsert_user_preferences", {
      p_target_user_id: js.user_id,
      p_min_pay_rate: 20,
      p_max_travel_km: 15,
      p_desired_roles: ["NonExistentJob"],
      p_max_hours_per_week: 40,
      p_max_hours_per_shift: 8,
      p_consider_lower_rate: false,
    });

    expect(error).toBeNull();
    const result = data![0];
    expect(result.validation_errors).toContain("One or more selected job types are invalid or inactive");
  });
});

