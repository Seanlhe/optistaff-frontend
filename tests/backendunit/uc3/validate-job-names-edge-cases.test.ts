/**
 * validate-job-names-edge-cases.test.ts
 * UC3 Back-end Unit Test
 *
 * Covers validation edge cases not fully asserted in the base file:
 * - Mixed valid/invalid names in single call
 * - Case sensitivity ("Waiter" vs "waiter")
 * - Inactive job types that were previously valid
 *
 * UC3 Mapping:
 * // UC3 Step 3: "fetchJobTypes() -> SELECT FROM job_types WHERE is_active"
 * // UC3 Step 4: "validate_preferences() -> validate job names and constraints"
 */

import { describe, test, expect, beforeEach } from "vitest";
import { testSupabase, cleanupTestData, ensureTestJobTypes } from "../../../src/test-setup";

describe("UC3 - validate_job_names edge cases", () => {
  beforeEach(async () => {
    await cleanupTestData();
    await ensureTestJobTypes();
  });

  test("mixed valid and invalid names returns false", async () => {
    const { data, error } = await testSupabase.rpc("validate_job_names", {
      job_names: ["Waiter/Waitress", "NonExistentJob"],
    });

    expect(error).toBeNull();
    expect(data).toBe(false);
  });

  test("case sensitivity - exact case passes, wrong case fails", async () => {
    const { data: exact, error: err1 } = await testSupabase.rpc("validate_job_names", {
      job_names: ["Waiter/Waitress"],
    });
    expect(err1).toBeNull();
    expect(exact).toBe(true);

    const { data: wrongCase, error: err2 } = await testSupabase.rpc("validate_job_names", {
      job_names: ["waiter/waitress"],
    });
    expect(err2).toBeNull();
    expect(wrongCase).toBe(false);
  });

  test("previously valid but now inactive returns false", async () => {
    // Deactivate a known valid job type and ensure validation fails
    const { data: jt } = await testSupabase
      .from("job_types")
      .select("*")
      .eq("type_name", "Waiter/Waitress")
      .single();

    expect(jt).toBeTruthy();

    await testSupabase
      .from("job_types")
      .update({ is_active: false })
      .eq("job_type_id", jt.job_type_id);

    const { data, error } = await testSupabase.rpc("validate_job_names", {
      job_names: ["Waiter/Waitress"],
    });

    expect(error).toBeNull();
    expect(data).toBe(false);
  });
});

