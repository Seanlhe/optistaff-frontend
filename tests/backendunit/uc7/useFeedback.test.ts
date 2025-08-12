import { describe, test, expect, beforeEach, afterAll } from "vitest";
import {
  testSupabase,
  cleanupTestData,
  createTestJobSeeker,
  createTestAssignment,
  createTestShift,
  createTestClient,
  seedRequiredData,
} from "../../../src/test-setup";

let clientId: string;
let jobSeekerId: string;
let assignmentId: string;

describe("feedback integration tests", () => {
  beforeEach(async () => {
    // Clean up and seed required data before each test
    await cleanupTestData();
    await seedRequiredData();

    // Create fresh test data
    const client = await createTestClient();
    clientId = client.client_id;

    const jobSeeker = await createTestJobSeeker();
    jobSeekerId = jobSeeker.user_id;

    const shift = await createTestShift(clientId);
    
    const assignment = await createTestAssignment(jobSeekerId, shift.shift_id);
    assignmentId = assignment.assignment_id;

    // Verify assignment exists and has proper relationships
    const { data, error } = await testSupabase
      .from('assignments')
      .select(`
        *,
        shifts!inner (*),
        job_seekers!inner (*)
      `)
      .eq('assignment_id', assignmentId)
      .single();
    
    if (error || !data) {
      throw new Error(`Failed to verify assignment setup: ${error?.message || 'No data found'}`);
    }
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  test("inserts valid feedback record", async () => {
    const feedback = {
      assignment_id: assignmentId,
      reviewer_id: clientId,
      reviewee_id: jobSeekerId,
      rating_score: 4,
      comment: "Satisfactory work, but could improve attention to detail.",
      review_type: "CLIENT_TO_EMPLOYEE",
    };

    const { error, data } = await testSupabase
      .from("feedback")
      .insert([feedback])
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      assignment_id: assignmentId,
      reviewer_id: clientId,
      reviewee_id: jobSeekerId,
      rating_score: 4,
      comment: expect.any(String),
      review_type: "CLIENT_TO_EMPLOYEE",
    });
  });

  test("fails if reviewer_id is missing (unauthenticated)", async () => {
    const badFeedback = {
      assignment_id: assignmentId,
      reviewee_id: jobSeekerId,
      rating_score: 5,
      comment: "No reviewer",
      review_type: "CLIENT_TO_EMPLOYEE",
    };

    const { error } = await testSupabase.from("feedback").insert([badFeedback]);

    expect(error).not.toBeNull();
  });

  test("fails if rating_score is invalid", async () => {
    const invalidFeedback = {
      assignment_id: assignmentId,
      reviewer_id: clientId,
      reviewee_id: jobSeekerId,
      rating_score: -1,
      comment: "Invalid rating",
      review_type: "CLIENT_TO_EMPLOYEE",
    };

    const { error } = await testSupabase.from("feedback").insert([invalidFeedback]);

    expect(error).not.toBeNull();
  });

  test("fails if review_type is not allowed", async () => {
    const invalidType = {
      assignment_id: assignmentId,
      reviewer_id: clientId,
      reviewee_id: jobSeekerId,
      rating_score: 5,
      comment: "Wrong type",
      review_type: "INVALID_TYPE",
    };

    const { error } = await testSupabase.from("feedback").insert([invalidType]);

    expect(error).not.toBeNull();
  });
});
