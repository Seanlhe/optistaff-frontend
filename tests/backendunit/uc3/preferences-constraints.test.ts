/**
 * preferences-constraints.test.ts
 * UC3 Back-end Unit Test
 *
 * Validates database constraint behavior for preferences (where applicable)
 * and numeric boundary values expected by business logic in upsert RPC.
 *
 * UC3 Mapping:
 * // UC3 Step 4: "validate_preferences() -> validate job names and constraints"
 */

import { describe, test, expect, beforeEach } from "vitest";
import { testSupabase, createTestJobSeeker, cleanupTestData, ensureTestJobTypes } from "../../../src/test-setup";

describe("UC3 - Preferences constraints and integrity", () => {
  beforeEach(async () => {
    await cleanupTestData();
    await ensureTestJobTypes();
  });

  test("foreign key enforcement - preferences for non-existent user fails", async () => {
    const { data, error } = await testSupabase
      .from("preferences")
      .insert({ user_id: "00000000-0000-0000-0000-000000000001" });

    expect(error).toBeTruthy();
    expect(error!.code).toBe("23503");
    expect(error!.message).toContain("foreign key");
    expect(data).toBeNull();
  });

  test("numeric boundaries - negative/zero/large values rejected by upsert rpc", async () => {
    const js = await createTestJobSeeker();

    // Negative pay rate
    let res = await testSupabase.rpc("upsert_user_preferences", {
      p_target_user_id: js.user_id,
      p_min_pay_rate: -1,
      p_max_travel_km: 10,
      p_desired_roles: ["Waiter/Waitress"],
      p_max_hours_per_week: 40,
      p_max_hours_per_shift: 8,
      p_consider_lower_rate: false,
    });
    // DB-level check constraint may reject before function validation
    expect(res.error?.code === "23514" || res.data?.[0].validation_errors?.length > 0).toBe(true);

    // Zero hours per week
    res = await testSupabase.rpc("upsert_user_preferences", {
      p_target_user_id: js.user_id,
      p_min_pay_rate: 10,
      p_max_travel_km: 10,
      p_desired_roles: ["Waiter/Waitress"],
      p_max_hours_per_week: 0,
      p_max_hours_per_shift: 8,
      p_consider_lower_rate: false,
    });
    expect(res.error?.code === "23514" || res.data?.[0].validation_errors?.length > 0).toBe(true);

    // >44 hours per week
    res = await testSupabase.rpc("upsert_user_preferences", {
      p_target_user_id: js.user_id,
      p_min_pay_rate: 10,
      p_max_travel_km: 10,
      p_desired_roles: ["Waiter/Waitress"],
      p_max_hours_per_week: 45,
      p_max_hours_per_shift: 8,
      p_consider_lower_rate: false,
    });
    expect(res.error?.code === "23514" || res.data?.[0].validation_errors?.length > 0).toBe(true);

    // >12 hours per shift
    res = await testSupabase.rpc("upsert_user_preferences", {
      p_target_user_id: js.user_id,
      p_min_pay_rate: 10,
      p_max_travel_km: 10,
      p_desired_roles: ["Waiter/Waitress"],
      p_max_hours_per_week: 40,
      p_max_hours_per_shift: 13,
      p_consider_lower_rate: false,
    });
    expect(res.error?.code === "23514" || res.data?.[0].validation_errors?.length > 0).toBe(true);
  });

  test("JSONB desired_roles handling: nulls/non-strings rejected by upsert rpc", async () => {
    const js = await createTestJobSeeker();

    // Contains null element
    let res = await testSupabase.rpc("upsert_user_preferences", {
      p_target_user_id: js.user_id,
      p_min_pay_rate: 10,
      p_max_travel_km: 10,
      p_desired_roles: ["Waiter/Waitress", null],
      p_max_hours_per_week: 40,
      p_max_hours_per_shift: 8,
      p_consider_lower_rate: false,
    } as any);
    expect(res.error).toBeNull();
    expect(res.data?.[0].validation_errors.length).toBeGreaterThan(0);

    // Contains number element
    res = await testSupabase.rpc("upsert_user_preferences", {
      p_target_user_id: js.user_id,
      p_min_pay_rate: 10,
      p_max_travel_km: 10,
      p_desired_roles: ["Waiter/Waitress", 123],
      p_max_hours_per_week: 40,
      p_max_hours_per_shift: 8,
      p_consider_lower_rate: false,
    } as any);
    expect(res.error).toBeNull();
    expect(res.data?.[0].validation_errors.length).toBeGreaterThan(0);
  });
});

