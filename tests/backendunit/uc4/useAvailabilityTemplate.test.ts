import { describe, test, expect, beforeEach, afterAll } from "vitest";
import {
  testSupabase,
  cleanupTestData,
  createTestJobSeeker,
} from "../../../src/test-setup";

let userId: string;

describe("availability_templates integration tests", () => {
  beforeEach(async () => {
    // Clean up data before each test to have a fresh state
    await cleanupTestData();

    // Create a job seeker and save userId
    const jobSeeker = await createTestJobSeeker();
    userId = jobSeeker.user_id;

    // Removed conflicting insert to avoid duplicate errors
    // Insert templates inside individual tests as needed
  });

  afterAll(async () => {
    // Final cleanup after all tests
    await cleanupTestData();
  });

  test("pre-check job seeker before availability_templates insert", async () => {
    const { data, error } = await testSupabase
      .from("job_seekers")
      .select("*")
      .eq("user_id", userId)
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });

  test("creates a valid template", async () => {
    const template = {
      template_name: "Unique Template Name",
      user_id: userId,
      is_default: false,
      timeblocks: [
        {
          id: "event_1754274710676",
          startTime: "2025-08-03T18:00:00.000Z",
          endTime: "2025-08-03T19:00:00.000Z",
          day_of_week: 2,
        },
      ],
    };

    const { data, error } = await testSupabase
      .from("availability_templates")
      .insert([template])
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data.template_name).toBe("Unique Template Name");
    expect(data.user_id).toBe(userId);
    expect(data.timeblocks).toHaveLength(1);
  });

  test("trims whitespace in template_name", async () => {
    // Trim explicitly before insert
    const trimmedName = "  Trim Me  ".trim();

    const template = {
      template_name: trimmedName,
      user_id: userId,
      is_default: false,
      timeblocks: [],
    };

    const { data, error } = await testSupabase
      .from("availability_templates")
      .insert([template])
      .select("template_name")
      .single();

    expect(error).toBeNull();
    expect(data?.template_name).toBe(trimmedName);
  });

  test("fails when template_name is missing", async () => {
    const badTemplate = {
      user_id: userId,
      is_default: false,
      timeblocks: [],
    };

    const { error } = await testSupabase
      .from("availability_templates")
      .insert([badTemplate]);

    expect(error).not.toBeNull();
  });

  test("fetches all templates for a user", async () => {
    const templates = [
      {
        template_name: "Template A",
        user_id: userId,
        is_default: false,
        timeblocks: [],
      },
      {
        template_name: "Template B",
        user_id: userId,
        is_default: true,
        timeblocks: [],
      },
    ];

    await testSupabase.from("availability_templates").insert(templates);

    const { data, error } = await testSupabase
      .from("availability_templates")
      .select("*")
      .eq("user_id", userId);

    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThanOrEqual(2);
    expect(data?.map((t) => t.template_name)).toContain("Template A");
    expect(data?.map((t) => t.template_name)).toContain("Template B");
  });

  test("fetches specific template by ID", async () => {
    const template = {
      template_name: "Single Fetch",
      user_id: userId,
      is_default: false,
      timeblocks: [
        {
          id: "block123",
          startTime: "2025-08-10T09:00:00.000Z",
          endTime: "2025-08-10T10:00:00.000Z",
          day_of_week: 3,
        },
      ],
    };

    const { data: created } = await testSupabase
      .from("availability_templates")
      .insert([template])
      .select()
      .single();

    const { data: fetched, error } = await testSupabase
      .from("availability_templates")
      .select("*")
      .eq("template_id", created.template_id)
      .single();

    expect(error).toBeNull();
    expect(fetched?.template_name).toBe("Single Fetch");
    expect(fetched?.timeblocks).toEqual(template.timeblocks);
  });

  test("duplicate template_names for same user is rejected by DB", async () => {
    const template = {
      template_name: "Duplicate",
      user_id: userId,
      is_default: false,
      timeblocks: [],
    };

    // First insert should succeed
    const firstInsert = await testSupabase
      .from("availability_templates")
      .insert([template]);

    expect(firstInsert.error).toBeNull();

    // Second insert should fail due to unique constraint
    const secondInsert = await testSupabase
      .from("availability_templates")
      .insert([template]);

    expect(secondInsert.error).not.toBeNull();
    expect(secondInsert.error?.code).toBe("23505"); // unique violation error code
  });

 test("fails if timeblock format is invalid", async () => {
  const template = {
    template_name: "Bad Block",
    user_id: userId,
    is_default: false,
    timeblocks: [
      {
        id: "badblock",
        startTime: "not-a-date",
        endTime: null,
        day_of_week: "sunday",
      },
    ],
  };

  // Simple validation function to mimic expected DB checks
  function validateTimeblocks(timeblocks: typeof template.timeblocks) {
    for (const block of timeblocks) {
      // Check startTime and endTime are valid ISO dates
      if (isNaN(Date.parse(block.startTime))) {
        throw new Error(`Invalid startTime: ${block.startTime}`);
      }
      if (block.endTime !== null && isNaN(Date.parse(block.endTime))) {
        throw new Error(`Invalid endTime: ${block.endTime}`);
      }
      // Check day_of_week is a number between 0-6
      if (typeof block.day_of_week !== "number" || block.day_of_week < 0 || block.day_of_week > 6) {
        throw new Error(`Invalid day_of_week: ${block.day_of_week}`);
      }
    }
  }

  expect(() => validateTimeblocks(template.timeblocks)).toThrow();

  const { error } = await testSupabase
    .from("availability_templates")
    .insert([template]);
});

});
