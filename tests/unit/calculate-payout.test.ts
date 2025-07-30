import { describe, test, expect } from "vitest";
import {
  testSupabase,
  createTestJobSeeker,
  createTestClient,
  createTestShift,
  createTestAssignment,
} from "../../src/test-setup";

describe("calculate_user_payout function - Boundary Value Testing", () => {
  test("calculates payout for minimum valid hours (1 hour)", async () => {
    // Arrange
    const jobSeeker = await createTestJobSeeker();
    const client = await createTestClient();
    const shift = await createTestShift(client.client_id, {
      pay_rate: 15.0,
      start_time: "2025-07-01 09:00:00+08",
      end_time: "2025-07-01 10:00:00+08", // 1 hour
    });

    await createTestAssignment(jobSeeker.user_id, shift.shift_id, {
      status: 9, // COMPLETED
      check_in_time: "2025-07-01 09:00:00+08",
      check_out_time: "2025-07-01 10:00:00+08",
      break_hours: 0,
    });

    // Act
    const { data, error } = await testSupabase.rpc("calculate_user_payout", {
      target_user_id: jobSeeker.user_id,
      period_start: "2025-07-01",
      period_end: "2025-07-01",
    });

    // Assert
    expect(error).toBeNull();
    expect(data).toBe(15.0); // 1 hour * $15.00
  });

  test("calculates payout for maximum shift hours (12 hours)", async () => {
    // Arrange
    const jobSeeker = await createTestJobSeeker();
    const client = await createTestClient();
    const shift = await createTestShift(client.client_id, {
      pay_rate: 20.0,
      start_time: "2025-07-01 08:00:00+08",
      end_time: "2025-07-01 20:00:00+08", // 12 hours
    });

    await createTestAssignment(jobSeeker.user_id, shift.shift_id, {
      status: 9, // COMPLETED
      check_in_time: "2025-07-01 08:00:00+08",
      check_out_time: "2025-07-01 20:00:00+08",
      break_hours: 1, // 1 hour break
    });

    // Act
    const { data, error } = await testSupabase.rpc("calculate_user_payout", {
      target_user_id: jobSeeker.user_id,
      period_start: "2025-07-01",
      period_end: "2025-07-01",
    });

    // Assert
    expect(error).toBeNull();
    expect(data).toBe(220.0); // (12 - 1) hours * $20.00 = $220.00
  });

  test("returns 0 for period with no completed assignments", async () => {
    // Arrange
    const jobSeeker = await createTestJobSeeker();

    // Act
    const { data, error } = await testSupabase.rpc("calculate_user_payout", {
      target_user_id: jobSeeker.user_id,
      period_start: "2025-07-01",
      period_end: "2025-07-07",
    });

    // Assert
    expect(error).toBeNull();
    expect(data).toBe(0);
  });
});
