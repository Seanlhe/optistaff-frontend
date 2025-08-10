/**
 * preferences-loading-flow.test.ts
 * UC3 Back-end Unit Test
 *
 * Validates UC3 Step 2 behavior at database boundary:
 * - When SELECT preferences by user_id returns no rows, app calls create_default_preferences.
 * - This test simulates the flow: ensure no preferences exist, call RPC create_default_preferences,
 *   and verify default values.
 *
 * UC3 Mapping:
 * // UC3 Step 2: "fetchPreferences() -> SELECT FROM preferences WHERE user_id" (no rows)
 * // UC3 Step 2 fallback: app calls create_default_preferences
 */

import { describe, test, expect, beforeEach } from "vitest";
import { testSupabase, createTestJobSeeker, cleanupTestData } from "../../../src/test-setup";

describe("UC3 - Preferences loading flow at DB boundary", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  test("when preferences missing, create_default_preferences returns correct defaults", async () => {
    // Arrange - Create user; ensure no preferences exist
    const jobSeeker = await createTestJobSeeker();

    const { data: preExisting } = await testSupabase
      .from("preferences")
      .select("*")
      .eq("user_id", jobSeeker.user_id);

    expect(preExisting).toEqual([]);

    // Act - Call DB RPC create_default_preferences (as app would do upon missing)
    const { data, error } = await testSupabase.rpc("create_default_preferences", {
      p_user_id: jobSeeker.user_id,
    });

    // Assert
    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(Array.isArray(data)).toBe(true);
    const prefs = data![0];

    expect(prefs.user_id).toBe(jobSeeker.user_id);
    expect(prefs.min_pay_rate).toBe(15);
    expect(prefs.max_travel_km).toBe(15);
    expect(prefs.desired_roles).toEqual([]);
    expect(prefs.max_hours_per_week).toBe(40);
    expect(prefs.max_hours_per_shift).toBe(8);
    expect(prefs.consider_lower_rate).toBe(false);
  });
});

