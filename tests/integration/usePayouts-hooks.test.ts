/**
 * Integration Tests for usePayouts Hook
 * @description Tests the React hook with real database connections following foreign key constraints
 * @author OptiStaff Team
 * @testing_approach True integration testing with live test database
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePayouts } from "../../src/hooks/usePayouts";
import { useAuth } from "../../src/hooks/useAuth";
import {
  testSupabase,
  testSupabaseAdmin,
  cleanupTestData,
  ensureTestStatuses,
  ensureTestJobTypes,
} from "../../src/test-setup";

// Mock the useAuth hook
vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("usePayouts Hook - True Integration Tests", () => {
  let testUserId: string;
  let testAuthUser: any;
  let testJobSeeker: any;
  let testClient: any;
  let testClientAuthUser: any;
  let testShift: any;
  let testAssignment: any;
  let jobType: any;

  beforeEach(async () => {
    await cleanupTestData();
    
    // Ensure required statuses and job types exist
    await ensureTestStatuses();
    await ensureTestJobTypes();
    
    // Step 1: Create auth user for job seeker
    const jobSeekerAuthResult = await testSupabaseAdmin.auth.admin.createUser({
      email: `jobseeker-${crypto.randomUUID()}@example.com`,
      password: "testpassword123",
      email_confirm: true,
    });

    if (jobSeekerAuthResult.error) throw jobSeekerAuthResult.error;
    testAuthUser = jobSeekerAuthResult.data.user;
    testUserId = testAuthUser.id;
    
    // Step 2: Create job seeker record with proper user_id
    const { data: jobSeekerData, error: jobSeekerError } = await testSupabase
      .from("job_seekers")
      .insert({
        user_id: testUserId,
        first_name: "Test",
        last_name: "JobSeeker",
        phone_number: "12345678",
        status: "ACTIVE",
        rating: 5.0,
      })
      .select()
      .single();

    if (jobSeekerError) throw jobSeekerError;
    testJobSeeker = jobSeekerData;
    
    // Step 3: Set up mock auth to return our test user
    vi.mocked(useAuth).mockReturnValue({
      user: { id: testUserId, email: testAuthUser.email, role: "jobseeker" },
      loading: false,
      error: null,
    });
    
    // Step 4: Create auth user for client
    const clientAuthResult = await testSupabaseAdmin.auth.admin.createUser({
      email: `client-${crypto.randomUUID()}@company.com`,
      password: "testpassword123",
      email_confirm: true,
    });

    if (clientAuthResult.error) throw clientAuthResult.error;
    testClientAuthUser = clientAuthResult.data.user;

    // Step 5: Create client record with proper client_id
    const { data: clientData, error: clientError } = await testSupabase
      .from("clients")
      .insert({
        client_id: testClientAuthUser.id,
        company_name: "Test Company",
        first_name: "Test",
        last_name: "Client", 
        phone: "87654321",
        contact_email: testClientAuthUser.email,
      })
      .select()
      .single();

    if (clientError) throw clientError;
    testClient = clientData;
    
    // Step 6: Get a job type to use
    const { data: jobTypes } = await testSupabase
      .from("job_types")
      .select("*")
      .limit(1);
    
    if (!jobTypes || jobTypes.length === 0) {
      throw new Error("No job types available after ensureTestJobTypes");
    }
    jobType = jobTypes[0];

    // Step 7: Create shift with proper relationships
    const { data: shiftData, error: shiftError } = await testSupabase
      .from("shifts")
      .insert({
        client_id: testClient.client_id,
        title: "Test Shift",
        description: "Test Description",
        start_time: new Date("2025-01-01T09:00:00Z").toISOString(),
        end_time: new Date("2025-01-01T17:00:00Z").toISOString(),
        pay_rate: 25.50,
        job_location: "Test Location",
        staff_needed: 1,
        status: 1, // OPEN status
        submission_cycle: "PRIMARY",
        break_duration: 30,
        job_type_id: jobType.job_type_id,
      })
      .select()
      .single();

    if (shiftError) throw shiftError;
    testShift = shiftData;
    
    // Step 8: Create assignment with proper foreign keys
    const { data: assignmentData, error: assignmentError } = await testSupabase
      .from("assignments")
      .insert({
        user_id: testUserId, // This now references a valid auth.users.id
        shift_id: testShift.shift_id,
        status: 5, // CONFIRMED
      })
      .select()
      .single();

    if (assignmentError) throw assignmentError;
    testAssignment = assignmentData;
  });

  describe("Database RPC Function Tests", () => {
    test("get_user_total_earnings returns 0 for user with no payouts", async () => {
      // Act - Call RPC directly without any payout records
      const { data, error } = await testSupabase.rpc("get_user_total_earnings", {
        target_user_id: testUserId,
      });

      // Assert
      expect(error).toBeNull();
      expect(Number(data)).toBe(0);
    });

    test("get_user_total_earnings only includes user's own payouts", async () => {
      // Arrange - Create auth user for another job seeker
      const otherAuthResult = await testSupabaseAdmin.auth.admin.createUser({
        email: `other-jobseeker-${crypto.randomUUID()}@example.com`,
        password: "testpassword123",
        email_confirm: true,
      });

      if (otherAuthResult.error) throw otherAuthResult.error;
      const otherUserId = otherAuthResult.data.user.id;
      
      // Create other job seeker
      const { data: otherJobSeeker, error: otherJobSeekerError } = await testSupabase
        .from("job_seekers")
        .insert({
          user_id: otherUserId,
          first_name: "Other",
          last_name: "JobSeeker",  
          phone_number: "87654321",
          status: "ACTIVE",
          rating: 4.0,
        })
        .select()
        .single();

      if (otherJobSeekerError) throw otherJobSeekerError;

      // Create assignment for other user
      const { data: otherAssignment, error: otherAssignmentError } = await testSupabase
        .from("assignments")
        .insert({
          user_id: otherUserId,
          shift_id: testShift.shift_id,
          status: 5, // CONFIRMED
        })
        .select()
        .single();

      if (otherAssignmentError) throw otherAssignmentError;

      // Create payouts for both users
      await testSupabase.from("payouts").insert([
        {
          assignment_id: testAssignment.assignment_id,
          amount: 200.00,
          pay_rate: 25.00,
          start_time: new Date("2025-01-01T09:00:00Z").toISOString(),
          end_time: new Date("2025-01-01T17:00:00Z").toISOString(),
          break_hours: 0,
        },
        {
          assignment_id: otherAssignment.assignment_id,
          amount: 300.00,
          pay_rate: 30.00,
          start_time: new Date("2025-01-01T09:00:00Z").toISOString(),
          end_time: new Date("2025-01-01T17:00:00Z").toISOString(),
          break_hours: 0,
        },
      ]);

      // Act - Get earnings for our test user
      const { data, error } = await testSupabase.rpc("get_user_total_earnings", {
        target_user_id: testUserId,
      });

      // Assert - Should only return our user's earnings, not the other user's
      expect(error).toBeNull();
      expect(Number(data)).toBe(200.00);
    });
  });

  describe("usePayouts Hook Integration", () => {
    test("hook updates when user changes", async () => {
      // Arrange - Create initial payout
      await testSupabase.from("payouts").insert([
        {
          assignment_id: testAssignment.assignment_id,
          amount: 150.00,
          pay_rate: 25.00,
          start_time: new Date("2025-01-01T09:00:00Z").toISOString(),
          end_time: new Date("2025-01-01T17:00:00Z").toISOString(),
          break_hours: 0,
        },
      ]);

      // Act - Render hook
      const { result } = renderHook(() => usePayouts());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert - Should have initial earnings
      expect(result.current.totalEarnings).toBe(150.00);
      expect(result.current.error).toBeNull();
    });

    test("hook allows manual refetch with live data", async () => {
      // Arrange - Start with no payouts
      const { result } = renderHook(() => usePayouts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should start with 0 earnings
      expect(result.current.totalEarnings).toBe(0);

      // Add a payout
      await testSupabase.from("payouts").insert([
        {
          assignment_id: testAssignment.assignment_id,
          amount: 175.00,
          pay_rate: 25.00,
          start_time: new Date("2025-01-01T09:00:00Z").toISOString(),
          end_time: new Date("2025-01-01T17:00:00Z").toISOString(),
          break_hours: 0,
        },
      ]);

      // Act - Manually refetch
      await act(async () => {
        await result.current.fetchTotalEarnings();
      });

      // Assert - Should now show updated earnings
      expect(result.current.totalEarnings).toBe(175.00);
      expect(result.current.error).toBeNull();
    });
  });
});