/**
 * Integration Tests for usePayouts Hook
 * @description Tests the React hook with real database connections
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
  createTestJobSeeker,
  createTestClient,
  createTestShift,
  createTestAssignment,
} from "../../src/test-setup";

// Mock only the useAuth hook, but use real Supabase
vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("usePayouts Hook - True Integration Tests", () => {
  let testUserId: string;
  let testJobSeeker: any;
  let testClient: any;
  let testShift: any;
  let testAssignment: any;
  let jobType: any;

  beforeEach(async () => {
    await cleanupTestData();
    
    // Create test job seeker with auth user
    testJobSeeker = await createTestJobSeeker();
    testUserId = testJobSeeker.user_id;
    
    // Set up mock auth to return our test user
    vi.mocked(useAuth).mockReturnValue({
      user: { id: testUserId, email: `test-${testUserId}@example.com` },
      loading: false,
      error: null,
    });
    
    // Create test client with proper auth user
    const clientAuthUser = await testSupabaseAdmin.auth.admin.createUser({
      email: `client-${crypto.randomUUID()}@company.com`,
      password: "testpassword123",
      email_confirm: true,
    });

    testClient = await testSupabase
      .from("clients")
      .insert({
        client_id: clientAuthUser.data.user.id,
        company_name: "Test Company",
        first_name: "Test",
        last_name: "Client",
        phone: "87654321",
        contact_email: `client-${crypto.randomUUID()}@company.com`,
      })
      .select()
      .single();

    if (testClient.error) throw testClient.error;
    testClient = testClient.data;
    // Create a job category first
    const { data: jobCategory } = await testSupabase
      .from("job_categories")
      .insert({
        category_name: "Test Category",
        description: "Test Category Description",
      })
      .select()
      .single();

    // Create a job type
    const { data: jobTypeData } = await testSupabase
      .from("job_types")
      .insert({
        type_name: "Test Job Type",
        category_id: jobCategory.category_id,
        is_active: true,
      })
      .select()
      .single();

    jobType = jobTypeData;

    // Create shift directly in table instead of using RPC
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
        status: 1, // Default status
        submission_cycle: "PRIMARY",
        break_duration: 30,
        job_type_id: jobType.job_type_id,
      })
      .select()
      .single();

    if (shiftError) throw shiftError;
    testShift = shiftData;
    
    // Create assignment for the test user
    testAssignment = await createTestAssignment(testUserId, testShift.shift_id, {
      status: 5, // CONFIRMED
    });
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

    test("get_user_total_earnings calculates correct total with real payouts", async () => {
      // Arrange - Create payout records
      const payout1Amount = 204.00; // 8 hours * $25.50
      const payout2Amount = 150.75;
      
      await testSupabase.from("payouts").insert([
        {
          assignment_id: testAssignment.assignment_id,
          amount: payout1Amount,
          payment_date: new Date("2025-01-02T00:00:00Z").toISOString(),
          payment_method: "BANK_TRANSFER",
          status: "COMPLETED",
        },
      ]);

      // Create another assignment and payout
      const { data: testShift2, error: shift2Error } = await testSupabase
        .from("shifts")
        .insert({
          client_id: testClient.client_id,
          title: "Test Shift 2",
          description: "Test Description 2", 
          start_time: new Date("2025-01-03T10:00:00Z").toISOString(),
          end_time: new Date("2025-01-03T17:30:00Z").toISOString(),
          pay_rate: 20.10,
          job_location: "Test Location 2",
          staff_needed: 1,
          status: 1,
          submission_cycle: "PRIMARY",
          break_duration: 30,
          job_type_id: jobType.job_type_id,
        })
        .select()
        .single();

      if (shift2Error) throw shift2Error;
      
      const testAssignment2 = await createTestAssignment(testUserId, testShift2.shift_id, {
        status: 5, // CONFIRMED
      });

      await testSupabase.from("payouts").insert([
        {
          assignment_id: testAssignment2.assignment_id,
          amount: payout2Amount,
          payment_date: new Date("2025-01-04T00:00:00Z").toISOString(),
          payment_method: "BANK_TRANSFER",
          status: "COMPLETED",
        },
      ]);

      // Act - Call RPC function
      const { data, error } = await testSupabase.rpc("get_user_total_earnings", {
        target_user_id: testUserId,
      });

      // Assert
      expect(error).toBeNull();
      expect(Number(data)).toBe(payout1Amount + payout2Amount);
    });

    test("get_user_total_earnings only includes user's own payouts", async () => {
      // Arrange - Create another user with payouts
      const otherJobSeeker = await createTestJobSeeker();
      const otherAssignment = await createTestAssignment(
        otherJobSeeker.user_id, 
        testShift.shift_id,
        { status: 5 }
      );

      // Add payouts for both users
      await testSupabase.from("payouts").insert([
        {
          assignment_id: testAssignment.assignment_id,
          amount: 100.00,
          payment_date: new Date().toISOString(),
          payment_method: "BANK_TRANSFER",
          status: "COMPLETED",
        },
        {
          assignment_id: otherAssignment.assignment_id,
          amount: 200.00,
          payment_date: new Date().toISOString(),
          payment_method: "BANK_TRANSFER",
          status: "COMPLETED",
        },
      ]);

      // Act - Get earnings for our test user only
      const { data, error } = await testSupabase.rpc("get_user_total_earnings", {
        target_user_id: testUserId,
      });

      // Assert - Should only include test user's payouts
      expect(error).toBeNull();
      expect(Number(data)).toBe(100.00);
    });
  });

  describe("usePayouts Hook Integration", () => {
    test("hook fetches real earnings from database", async () => {
      // Arrange - Create real payout data
      await testSupabase.from("payouts").insert({
        assignment_id: testAssignment.assignment_id,
        amount: 275.25,
        payment_date: new Date().toISOString(),
        payment_method: "BANK_TRANSFER",
        status: "COMPLETED",
      });

      // Act
      const { result } = renderHook(() => usePayouts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(result.current.totalEarnings).toBe(275.25);
      expect(result.current.error).toBeNull();
    });

    test("hook handles unauthenticated user", async () => {
      // Arrange
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        error: null,
      });

      // Act
      const { result } = renderHook(() => usePayouts());

      // Assert
      expect(result.current.error).toBe("User not authenticated");
      expect(result.current.totalEarnings).toBe(0);
      expect(result.current.loading).toBe(false);
    });

    test("hook updates when user changes", async () => {
      // Arrange - Create payouts for first user
      await testSupabase.from("payouts").insert({
        assignment_id: testAssignment.assignment_id,
        amount: 100.50,
        payment_date: new Date().toISOString(),
        payment_method: "BANK_TRANSFER",
        status: "COMPLETED",
      });

      // Act - Initial render with first user
      const { result, rerender } = renderHook(() => usePayouts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.totalEarnings).toBe(100.50);

      // Arrange - Create second user with different payouts
      const secondUser = await createTestJobSeeker();
      const secondAssignment = await createTestAssignment(
        secondUser.user_id,
        testShift.shift_id,
        { status: 5 }
      );

      await testSupabase.from("payouts").insert({
        assignment_id: secondAssignment.assignment_id,
        amount: 200.75,
        payment_date: new Date().toISOString(),
        payment_method: "BANK_TRANSFER",
        status: "COMPLETED",
      });

      // Change auth mock to return second user
      vi.mocked(useAuth).mockReturnValue({
        user: { id: secondUser.user_id, email: `test-${secondUser.user_id}@example.com` },
        loading: false,
        error: null,
      });

      // Act - Rerender with new user
      rerender();

      await waitFor(() => {
        expect(result.current.totalEarnings).toBe(200.75);
      });

      // Assert
      expect(result.current.error).toBeNull();
    });

    test("hook allows manual refetch with live data", async () => {
      // Arrange - Initial payout
      await testSupabase.from("payouts").insert({
        assignment_id: testAssignment.assignment_id,
        amount: 150.00,
        payment_date: new Date().toISOString(),
        payment_method: "BANK_TRANSFER",
        status: "COMPLETED",
      });

      const { result } = renderHook(() => usePayouts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.totalEarnings).toBe(150.00);

      // Arrange - Add another payout
      const { data: secondShift, error: secondShiftError } = await testSupabase
        .from("shifts")
        .insert({
          client_id: testClient.client_id,
          title: "Second Test Shift",
          description: "Second Test Description",
          start_time: new Date("2025-01-05T09:00:00Z").toISOString(),
          end_time: new Date("2025-01-05T17:00:00Z").toISOString(),
          pay_rate: 20.0,
          job_location: "Second Test Location",
          staff_needed: 1,
          status: 1,
          submission_cycle: "PRIMARY",
          break_duration: 30,
          job_type_id: jobType.job_type_id,
        })
        .select()
        .single();

      if (secondShiftError) throw secondShiftError;

      const secondAssignment = await createTestAssignment(testUserId, secondShift.shift_id, {
        status: 5,
      });

      await testSupabase.from("payouts").insert({
        assignment_id: secondAssignment.assignment_id,
        amount: 85.25,
        payment_date: new Date().toISOString(),
        payment_method: "BANK_TRANSFER",
        status: "COMPLETED",
      });

      // Act - Manual refetch
      await act(async () => {
        await result.current.fetchTotalEarnings();
      });

      // Assert - Should now include both payouts
      expect(result.current.totalEarnings).toBe(235.25); // 150.00 + 85.25
      expect(result.current.error).toBeNull();
    });
  });

  describe("Database Constraints and Error Handling", () => {
    test("handles non-existent user gracefully", async () => {
      // Arrange
      const nonExistentUserId = crypto.randomUUID();
      
      vi.mocked(useAuth).mockReturnValue({
        user: { id: nonExistentUserId, email: "nonexistent@example.com" },
        loading: false,
        error: null,
      });

      // Act
      const { result } = renderHook(() => usePayouts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert - Should return 0 for non-existent user
      expect(result.current.totalEarnings).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });
});