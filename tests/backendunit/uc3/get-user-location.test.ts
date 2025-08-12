/**
 * OPTIMIZED Unit Tests for get_user_location Database Function
 * @description Streamlined tests focusing on essential equivalence classes and edge cases
 * @author OptiStaff Team
 * @testing_approach Equivalence Class Testing (ECT) - Essential classes only
 */

import { describe, test, expect, beforeEach } from "vitest";
import {
  testSupabase,
  createTestJobSeeker,
  cleanupTestData,
  ensureTestJobTypes,
} from "../../../src/test-setup";


// UC3 Mapping:
// - UC3 Location: "get_user_location() -> location data for map display" (implementation addition supporting UC3 map/radius UI)
// - UC3 Step 2: Location displayed with preferences page; data is sourced via DB RPC get_user_location

describe("get_user_location - Database Function Unit Tests (Optimized)", () => {
  beforeEach(async () => {
    await cleanupTestData();
    await ensureTestJobTypes();
  });

  describe("Valid Input Equivalence Classes", () => {
    test("retrieves location data for user with complete location info", async () => {
      const jobSeeker = await createTestJobSeeker({
        address: "123 Main Street",
        postal_code: "123456",
        address_coordinates: "1.3521,103.8198",
      });

      const { data, error } = await testSupabase.rpc("get_user_location", {
        p_user_id: jobSeeker.user_id,
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.length).toBe(1);

      const location = data[0];
      expect(location.user_id).toBe(jobSeeker.user_id);
      expect(location.address).toBe("123 Main Street");
      expect(location.postal_code).toBe("123456");
      expect(location.address_coordinates).toBe("1.3521,103.8198");
      expect(location.coordinates_lat).toBe(1.3521);
      expect(location.coordinates_lng).toBe(103.8198);
      expect(location.formatted_address).toBe(
        "123 Main Street, Singapore 123456",
      );
    });

    test("retrieves location data for user with partial location info (postal code only)", async () => {
      const jobSeeker = await createTestJobSeeker({
        postal_code: "654321",
      });

      const { data, error } = await testSupabase.rpc("get_user_location", {
        p_user_id: jobSeeker.user_id,
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.length).toBe(1);

      const location = data[0];
      expect(location.user_id).toBe(jobSeeker.user_id);
      expect(location.postal_code).toBe("654321");
      expect(location.formatted_address).toBe("Singapore 654321");
      expect(location.coordinates_lat).toBeNull();
      expect(location.coordinates_lng).toBeNull();
    });

    test("retrieves location data for user with address but no coordinates", async () => {
      const jobSeeker = await createTestJobSeeker({
        address: "456 Another Street",
        postal_code: "789012",
      });

      const { data, error } = await testSupabase.rpc("get_user_location", {
        p_user_id: jobSeeker.user_id,
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.length).toBe(1);

      const location = data[0];
      expect(location.address).toBe("456 Another Street");
      expect(location.postal_code).toBe("789012");
      expect(location.formatted_address).toBe(
        "456 Another Street, Singapore 789012",
      );
      expect(location.coordinates_lat).toBeNull();
      expect(location.coordinates_lng).toBeNull();
    });

    test("retrieves location data with all fields null", async () => {
      const jobSeeker = await createTestJobSeeker();

      const { data, error } = await testSupabase.rpc("get_user_location", {
        p_user_id: jobSeeker.user_id,
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.length).toBe(1);

      const location = data[0];
      expect(location.user_id).toBe(jobSeeker.user_id);
      expect(location.address).toBeNull();
      expect(location.postal_code).toBeNull();
      expect(location.address_coordinates).toBeNull();
      expect(location.coordinates_lat).toBeNull();
      expect(location.coordinates_lng).toBeNull();
      expect(location.formatted_address).toBeNull();
    });
  });

  describe("Invalid Input Equivalence Classes", () => {
    test("returns empty result for non-existent user", async () => {
      const { data, error } = await testSupabase.rpc("get_user_location", {
        p_user_id: "00000000-0000-0000-0000-000000000001",
      });

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    test("handles null user_id gracefully", async () => {
      const { data, error } = await testSupabase.rpc("get_user_location", {
        p_user_id: null,
      });

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    test("handles invalid UUID format", async () => {
      const { error } = await testSupabase.rpc("get_user_location", {
        p_user_id: "invalid-uuid",
      });

      expect(error).not.toBeNull();
    });
  });

  describe("Coordinate Parsing Tests", () => {
    test("handles valid coordinate string", async () => {
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: "1.2966,103.7764",
      });

      const { data, error } = await testSupabase.rpc("get_user_location", {
        p_user_id: jobSeeker.user_id,
      });

      expect(error).toBeNull();
      expect(data[0].coordinates_lat).toBe(1.2966);
      expect(data[0].coordinates_lng).toBe(103.7764);
    });

    test("handles coordinate string with negative values", async () => {
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: "-1.2966,103.7764",
      });

      const { data, error } = await testSupabase.rpc("get_user_location", {
        p_user_id: jobSeeker.user_id,
      });

      expect(error).toBeNull();
      expect(data[0].coordinates_lat).toBe(-1.2966);
      expect(data[0].coordinates_lng).toBe(103.7764);
    });

    test("handles coordinate string with missing comma", async () => {
      const jobSeeker = await createTestJobSeeker({
        address_coordinates: "1.2966103.7764", // No comma
      });

      const { data, error } = await testSupabase.rpc("get_user_location", {
        p_user_id: jobSeeker.user_id,
      });

      expect(error).toBeNull();
      expect(data[0].coordinates_lat).toBeNull();
      expect(data[0].coordinates_lng).toBeNull();
    });
  });

  describe("Address Formatting Tests", () => {
    test("handles address only (no postal code)", async () => {
      const jobSeeker = await createTestJobSeeker({
        address: "123 Main Street",
      });

      const { data, error } = await testSupabase.rpc("get_user_location", {
        p_user_id: jobSeeker.user_id,
      });

      expect(error).toBeNull();
      expect(data[0].formatted_address).toBe("123 Main Street, Singapore");
    });
  });

  describe("Performance Tests", () => {
    test("handles multiple concurrent requests for same user", async () => {
      const jobSeeker = await createTestJobSeeker({
        address: "123 Test Street",
        postal_code: "123456",
      });

      const requests = Array(5)
        .fill(null)
        .map(() =>
          testSupabase.rpc("get_user_location", {
            p_user_id: jobSeeker.user_id,
          }),
        );
      const results = await Promise.all(requests);

      results.forEach((result) => {
        expect(result.error).toBeNull();
        expect(result.data).toBeTruthy();
        expect(result.data[0].user_id).toBe(jobSeeker.user_id);
      });
    });
  });
});
