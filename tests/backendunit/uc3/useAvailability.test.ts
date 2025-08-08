import { describe, test, expect, beforeEach, afterAll } from "vitest";
import {
  testSupabase,
  cleanupTestData,
  createTestJobSeeker,
} from "../../../src/test-setup";

let userId: string;

describe("availability table integration tests", () => {
  beforeEach(async () => {
    await cleanupTestData();
    const jobSeeker = await createTestJobSeeker();
    userId = jobSeeker.user_id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  test("inserts timeblocks correctly", async () => {
    const timeblocks = [
      {
        user_id: userId,
        start_time: "2025-08-15T07:00:00.000Z",
        end_time: "2025-08-15T15:00:00.000Z",
        submission_cycle: "PRIMARY",
        day_of_week: 5,
      },
    ];

    const { error } = await testSupabase.from("availability").insert(timeblocks);
    expect(error).toBeNull();

    const { data, error: fetchError } = await testSupabase
      .from("availability")
      .select("*")
      .eq("user_id", userId)
      .eq("submission_cycle", "PRIMARY");

    expect(fetchError).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].day_of_week).toBe(5); // Friday
  });

  test("replaces existing timeblocks", async () => {
    // Insert initial
    await testSupabase.from("availability").insert([
      {
        user_id: userId,
        start_time: "2025-08-15T07:00:00.000Z",
        end_time: "2025-08-15T15:00:00.000Z",
        submission_cycle: "PRIMARY",
        day_of_week: 5,
      },
    ]);

    // Delete existing and insert new
    await testSupabase
      .from("availability")
      .delete()
      .eq("user_id", userId)
      .eq("submission_cycle", "PRIMARY");

    await testSupabase.from("availability").insert([
      {
        user_id: userId,
        start_time: "2025-08-16T09:00:00.000Z",
        end_time: "2025-08-16T12:00:00.000Z",
        submission_cycle: "PRIMARY",
        day_of_week: 6,
      },
    ]);

    const { data, error } = await testSupabase
      .from("availability")
      .select("*")
      .eq("user_id", userId)
      .eq("submission_cycle", "PRIMARY");

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].day_of_week).toBe(6);
    expect(data?.[0].start_time).toBe("2025-08-16T09:00:00+00:00");
  });

  test("deletes availability when timeblocks are empty", async () => {
    // Insert initial
    await testSupabase.from("availability").insert([
      {
        user_id: userId,
        start_time: "2025-08-15T07:00:00.000Z",
        end_time: "2025-08-15T15:00:00.000Z",
        submission_cycle: "PRIMARY",
        day_of_week: 5,
      },
    ]);

    // Simulate setAvailability([], cycle)
    await testSupabase
      .from("availability")
      .delete()
      .eq("user_id", userId)
      .eq("submission_cycle", "PRIMARY");

    const { data, error } = await testSupabase
      .from("availability")
      .select("*")
      .eq("user_id", userId)
      .eq("submission_cycle", "PRIMARY");

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  test("fetches availability correctly", async () => {
    await testSupabase.from("availability").insert([
      {
        user_id: userId,
        start_time: "2025-08-15T07:00:00.000Z",
        end_time: "2025-08-15T15:00:00.000Z",
        submission_cycle: "PRIMARY",
        day_of_week: 5,
      },
    ]);

    const { data, error } = await testSupabase
      .from("availability")
      .select("*")
      .eq("user_id", userId)
      .eq("submission_cycle", "PRIMARY");

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].day_of_week).toBe(5);
  });

  test("returns empty if user_id is missing", async () => {

    const fakeUserId = "00000000-0000-0000-0000-000000000000";

    const { data, error } = await testSupabase
      .from("availability")
      .select("*")
      .eq("user_id", fakeUserId)
      .eq("submission_cycle", "PRIMARY");

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });
});
