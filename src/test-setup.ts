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
  // First create an auth user
  const testEmail = `test-${crypto.randomUUID()}@example.com`;
  const testPassword = "testpassword123";

  const { data: authData, error: authError } =
    await testSupabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

  if (authError) throw authError;

  const defaultData = {
    user_id: authData.user.id, // Use the auth user's ID
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

// Helper function to create job seeker with preferences
export const createTestJobSeekerWithPreferences = async (
  jobSeekerOverrides = {},
  preferencesOverrides = {},
) => {
  const jobSeeker = await createTestJobSeeker(jobSeekerOverrides);

  // Create default preferences for the job seeker
  const { data: preferences, error: prefError } = await testSupabase.rpc(
    "create_default_preferences",
    {
      p_user_id: jobSeeker.user_id,
    },
  );

  if (prefError) throw prefError;

  return {
    jobSeeker,
    preferences: preferences[0],
  };
};

// Helper function to ensure job types exist for testing
export const ensureTestJobTypes = async () => {
  // First, get an existing category to use for test job types
  const { data: categories, error: categoryError } = await testSupabase
    .from("job_categories")
    .select("category_id, category_name, is_active")
    .limit(1);

  if (categoryError) {
    console.error("Error fetching categories:", categoryError);
    throw categoryError;
  }

  let defaultCategoryId;

  if (!categories || categories.length === 0) {
    // Create a default category if none exists
    const defaultCategory = {
      category_id: crypto.randomUUID(),
      category_name: "Test Category",
      is_active: true,
    };

    const { error: insertError } = await testSupabase
      .from("job_categories")
      .insert(defaultCategory);

    if (insertError) throw insertError;

    defaultCategoryId = defaultCategory.category_id;
  } else {
    defaultCategoryId = categories[0].category_id;
  }

  // Check if test job types exist
  const { data: existingTypes } = await testSupabase
    .from("job_types")
    .select("type_name")
    .in("type_name", [
      "Waiter/Waitress",
      "Kitchen Helper",
      "Cashier",
      "Cleaner",
    ]);

  const existingTypeNames = existingTypes?.map((t) => t.type_name) || [];
  const requiredTypes = [
    "Waiter/Waitress",
    "Kitchen Helper",
    "Cashier",
    "Cleaner",
  ];
  const missingTypes = requiredTypes.filter(
    (type) => !existingTypeNames.includes(type),
  );

  // Create missing job types with proper category_id
  if (missingTypes.length > 0) {
    const newTypes = missingTypes.map((typeName) => ({
      job_type_id: crypto.randomUUID(),
      type_name: typeName,
      category_id: defaultCategoryId,
      is_active: true,
    }));

    const { error } = await testSupabase.from("job_types").insert(newTypes);

    if (error) throw error;
  }

  return requiredTypes;
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
  overrides = {},
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
      "Local Supabase is not running. Run `supabase start` first.",
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
