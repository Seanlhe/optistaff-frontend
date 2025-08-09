/**
 * concurrency-scenarios.test.ts
 * UC3 Back-end Unit Test
 *
 * Concurrency and race conditions across UC3 DB functions.
 */

import { describe, test, expect, beforeEach } from "vitest";
import { testSupabase, createTestJobSeeker, cleanupTestData, ensureTestJobTypes } from "../../../src/test-setup";

describe("UC3 - Concurrency scenarios", () => {
  beforeEach(async () => {
    await cleanupTestData();
    await ensureTestJobTypes();
  });

  test("concurrent default creation for different users", async () => {
    const [js1, js2] = await Promise.all([createTestJobSeeker(), createTestJobSeeker()]);

    const [r1, r2] = await Promise.all([
      testSupabase.rpc("create_default_preferences", { p_user_id: js1.user_id }),
      testSupabase.rpc("create_default_preferences", { p_user_id: js2.user_id }),
    ]);

    expect(r1.error).toBeNull();
    expect(r2.error).toBeNull();

    const { data: prefs1 } = await testSupabase.from("preferences").select("*").eq("user_id", js1.user_id);
    const { data: prefs2 } = await testSupabase.from("preferences").select("*").eq("user_id", js2.user_id);

    expect(prefs1?.length).toBe(1);
    expect(prefs2?.length).toBe(1);
  });

  test("concurrent preference updates for same user - last write wins", async () => {
    const js = await createTestJobSeeker();

    // Ensure a record exists first
    await testSupabase.rpc("create_default_preferences", { p_user_id: js.user_id });

    const p1 = testSupabase.rpc("upsert_user_preferences", {
      p_target_user_id: js.user_id,
      p_min_pay_rate: 20,
      p_max_travel_km: 10,
      p_desired_roles: ["Cashier"],
      p_max_hours_per_week: 35,
      p_max_hours_per_shift: 7,
      p_consider_lower_rate: false,
    });

    const p2 = testSupabase.rpc("upsert_user_preferences", {
      p_target_user_id: js.user_id,
      p_min_pay_rate: 25,
      p_max_travel_km: 15,
      p_desired_roles: ["Kitchen Helper"],
      p_max_hours_per_week: 40,
      p_max_hours_per_shift: 8,
      p_consider_lower_rate: true,
    });

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1.error).toBeNull();
    expect(r2.error).toBeNull();

    const { data: finalPrefs } = await testSupabase.from("preferences").select("*").eq("user_id", js.user_id).single();
    expect(finalPrefs).toBeTruthy();
    // Cannot guarantee which finishes last in real race; simply assert one of the two possibilities
    const desired = finalPrefs!.desired_roles as string[];
    expect(["Cashier", "Kitchen Helper"].some((n) => desired.includes(n))).toBe(true);
  });

  test("job type modification during save - deactivated should cause validation error", async () => {
    const js = await createTestJobSeeker();

    // Pick a valid job
    const { data: jt } = await testSupabase
      .from("job_types")
      .select("*")
      .eq("type_name", "Kitchen Helper")
      .single();

    expect(jt).toBeTruthy();

    // Start RPC call (simulate race) while deactivating job type
    const savePromise = testSupabase.rpc("upsert_user_preferences", {
      p_target_user_id: js.user_id,
      p_min_pay_rate: 20,
      p_max_travel_km: 15,
      p_desired_roles: ["Kitchen Helper"],
      p_max_hours_per_week: 40,
      p_max_hours_per_shift: 8,
      p_consider_lower_rate: false,
    });

    await testSupabase
      .from("job_types")
      .update({ is_active: false })
      .eq("job_type_id", jt.job_type_id);

    const { data, error } = await savePromise;
    expect(error).toBeNull();
    const result = data![0];
    expect(result.validation_errors).toContain(
      "One or more selected job types are invalid or inactive"
    );
  });
});

