import { describe, test, expect, beforeAll, afterAll } from "vitest";
import {
  testSupabase,
  testSupabaseAdmin,
  cleanupTestData,
  createTestJobSeeker,
  createTestAssignment,
  createTestShift,
} from "../../../src/test-setup";

let clientId: string;
let jobSeekerId: string;
let assignmentId: string;

// Re-implement createTestClientWithAuth here if not exported:
const createTestClientWithAuth = async (overrides = {}) => {
  const testEmail = `test-client-${crypto.randomUUID()}@example.com`;
  const testPassword = "testpassword123";

  // Create user in auth system
  const { data: authData, error: authError } =
    await testSupabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });
  if (authError) throw authError;

  // Insert client profile linked to auth user id
  const defaultData = {
    client_id: authData.user.id,
    company_name: "Test Company",
    first_name: "Test",
    last_name: "Client",
    phone: "87654321",
    contact_email: testEmail,
    ...overrides,
  };

  const { data, error } = await testSupabase
    .from("clients")
    .insert(defaultData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

beforeAll(async () => {
  await cleanupTestData();

  const client = await createTestClientWithAuth();
  clientId = client.client_id;

  const jobSeeker = await createTestJobSeeker();
  jobSeekerId = jobSeeker.user_id;

  // Create a valid shift before assignment (to satisfy FK constraint)
  const shift = await createTestShift(clientId);

  const assignment = await createTestAssignment(jobSeekerId, shift.shift_id);
  assignmentId = assignment.assignment_id;
});

afterAll(async () => {
  await cleanupTestData();
});

describe("feedback integration tests", () => {
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
