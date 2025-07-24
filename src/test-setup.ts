// Test setup for local Supabase testing
import { createClient } from "@supabase/supabase-js";
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";

// Local Supabase configuration
const supabaseUrl = "http://127.0.0.1:54321";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

export const testSupabase = createClient(supabaseUrl, supabaseAnonKey);
export const testSupabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Test data cleanup utilities
export const cleanupTestData = async () => {
  // Clean up in reverse dependency order
  await testSupabase
    .from("feedback")
    .delete()
    .neq("feedback_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("assignments")
    .delete()
    .neq("assignment_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("shifts")
    .delete()
    .neq("shift_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("availability")
    .delete()
    .neq("availability_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("preferences")
    .delete()
    .neq("preference_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("job_types")
    .delete()
    .neq("job_type_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("job_categories")
    .delete()
    .neq("category_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("job_seekers")
    .delete()
    .neq("user_id", "00000000-0000-0000-0000-000000000000");
  await testSupabase
    .from("clients")
    .delete()
    .neq("client_id", "00000000-0000-0000-0000-000000000000");

  // Clean up auth users (use service role key for admin operations)
  try {
    const { data: users } = await testSupabaseAdmin.auth.admin.listUsers();
    if (users?.users) {
      for (const user of users.users) {
        if (user.email?.includes("test")) {
          await testSupabaseAdmin.auth.admin.deleteUser(user.id);
        }
      }
    }
  } catch (error) {
    // Ignore cleanup errors
    console.warn("Auth cleanup error:", error);
  }
};

// Test data factories
export const createTestJobSeeker = async (overrides = {}) => {
  const defaultData = {
    user_id: crypto.randomUUID(),
    first_name: "Test",
    last_name: "JobSeeker",
    phone_number: "12345678",
    status: "ACTIVE",
    rating: 5.0,
    ...overrides,
  };

  const { data, error } = await testSupabase
    .from("job_seekers")
    .insert(defaultData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createTestClient = async (overrides = {}) => {
  const defaultData = {
    client_id: crypto.randomUUID(),
    company_name: "Test Company",
    first_name: "Test",
    last_name: "Client",
    phone: "87654321",
    contact_email: "test@company.com",
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

export const createTestShift = async (clientId: string, overrides = {}) => {
  const defaultData = {
    client_id: clientId,
    title: "Test Shift",
    description: "Test Description",
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
    pay_rate: 20.0,
    job_location: "Test Location",
    staff_needed: 1,
    submission_cycle: "PRIMARY",
    break_duration: 30,
    ...overrides,
  };

  const { data, error } = await testSupabase.rpc("create_shift", defaultData);
  if (error) throw error;
  return { shift_id: data };
};

export const createTestAssignment = async (
  userId: string,
  shiftId: string,
  overrides = {}
) => {
  const defaultData = {
    user_id: userId,
    shift_id: shiftId,
    status: 5, // CONFIRMED
    ...overrides,
  };

  const { data, error } = await testSupabase
    .from("assignments")
    .insert(defaultData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Global test setup
beforeAll(async () => {
  // Verify local Supabase is running
  const { data, error } = await testSupabase
    .from("job_categories")
    .select("count")
    .limit(1);
  if (error) {
    throw new Error(
      "Local Supabase is not running. Run `supabase start` first."
    );
  }
});

beforeEach(async () => {
  // Clean database before each test
  await cleanupTestData();
});

afterEach(async () => {
  // Clean database after each test
  await cleanupTestData();
});
