// Test setup for local Supabase testing
import { createClient } from "@supabase/supabase-js";
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { StatusEnum } from "./types/hooks";

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
  try {
    // First clean up auth users to trigger cascade deletions
    const { data: users } = await testSupabaseAdmin.auth.admin.listUsers();
    if (users?.users) {
      for (const user of users.users) {
        // Delete test users (broader pattern to catch all test emails)
        if (user.email?.includes("test") || 
            user.email?.includes("@test.com") || 
            user.email?.includes("@company.com") ||
            user.email?.includes("@example.com") ||
            user.email?.includes("minimal@") ||
            user.email?.includes("invaliddate@") ||
            user.email?.includes("unknown@") ||
            user.email?.includes("cascade@") ||
            user.email?.includes("jobseeker@") ||
            user.email?.includes("employer@")) {
          await testSupabaseAdmin.auth.admin.deleteUser(user.id);
        }
      }
    }

    // Wait a moment for cascades to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Clean up remaining records in dependency order (just in case cascade didn't work)
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
  } catch (error) {
    console.warn("Cleanup error:", error);
    // Continue with test execution even if cleanup fails
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

// Helper function to seed requried data
export const seedRequiredData = async () => {
  // Ensure job types exist
  await ensureTestJobTypes();
  await ensureStatusTypes();
};

export const ensureStatusTypes = async () => {
  const { data: existingStatuses } = await testSupabase
    .from("status")
    .select("name")
    .in("name", [...Object.values(StatusEnum)]);
  const existingStatusNames = existingStatuses?.map((s) => s.name) || [];
  const requiredStatuses = [...Object.values(StatusEnum)];
  const missingStatuses = requiredStatuses.filter(
    (status) => !existingStatusNames.includes(status),
  );
  if (missingStatuses.length > 0) {
    const newStatuses = missingStatuses.map((statusName) => ({
      name: statusName,
    }));

    const { error } = await testSupabase
      .from("status")
      .insert(newStatuses);

    if (error) throw error;
  }
}

// Helper function to ensure job types exist for testing
export const ensureTestStatuses = async () => {
  // Check if basic status records exist
  const { data: existingStatuses } = await testSupabase
    .from("status")
    .select("status_id, name")
    .in("status_id", [1, 2, 3, 4, 5]);

  const existingStatusIds = existingStatuses?.map((s) => s.status_id) || [];
  
  const requiredStatuses = [
    { status_id: 1, name: "OPEN" },
    { status_id: 2, name: "IN_PROGRESS" },
    { status_id: 3, name: "COMPLETED" },
    { status_id: 4, name: "CANCELLED" },
    { status_id: 5, name: "CONFIRMED" },
  ];

  const statusesToCreate = requiredStatuses.filter(
    (status) => !existingStatusIds.includes(status.status_id)
  );

  if (statusesToCreate.length > 0) {
    const { error } = await testSupabase
      .from("status")
      .insert(statusesToCreate);

    if (error) throw error;
  }

  return requiredStatuses.map((s) => s.name);
};

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
    client_id: authData.user.id,
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

export const createTestShift = async (clientId: string) => {
  const defaultData = {
    p_employer_id: clientId,
    job_title: "Test Shift",
    job_location: "Test Location",
    postal_code: 123456,
    job_description: "Test Description",
    job_requirements: "Test Requirements",
    job_type: "Waiter/Waitress", // Use a valid job type
    pay_rate: 20.0,
    break_duration: 1,
    staff_needed: 1,
    p_start_time: new Date().toISOString(),
    p_end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
  };

  const { data, error } = await testSupabase.rpc("create_shift", {
    ...defaultData
  });
  if (error) throw error;
  const { created_shift_id } = data[0];
  return { shift_id: created_shift_id };
};

export const createTestAssignment = async (
  userId: string,
  shiftId: string,
  overrides = {},
) => {
  const defaultData = {
    user_id: userId,
    shift_id: shiftId,
    break_hours: 0.5,
    ...overrides,
  };

  // 1) fetch the status_id from the status table
  const { data: statusRow, error: statusErr } = await testSupabase
    .from('status')
    .select('status_id')
    .eq('name', StatusEnum.Upcoming)
    .single()
  if (statusErr) throw statusErr

  // 2) insert into assignments, using that status_id
  const { data, error } = await testSupabase
    .from('assignments')
    .insert(
      {
        ...defaultData,
        status: statusRow.status_id, // Use the fetched status_id
      }
    )
    .select()
    .single()

  if (error) throw error;
  return data;
};

// Global test setup
beforeAll(async () => {
  // Verify local Supabase is running
  const { error } = await testSupabase
    .from("job_categories")
    .select("count")
    .limit(1);
  if (error) {
    throw new Error(
      "Local Supabase is not running. Run `supabase start` first.",
    );
  }
  
  // Ensure required status records exist
  await ensureTestStatuses();
  
  // Ensure test job types exist
  await ensureTestJobTypes();
});

beforeEach(async () => {
  // Clean database before each test
  await cleanupTestData();
});

afterEach(async () => {
  // Clean database after each test
  await cleanupTestData();
});
