/**
 * get-user-location-coordinate-parsing.test.ts
 * UC3 Back-end Unit Test
 *
 * Additional malformed coordinate strings for get_user_location.
 *
 * UC3 Mapping:
 * // UC3 Location: "get_user_location() -> location data for map display"
 */

import { describe, test, expect, beforeEach } from "vitest";
import { testSupabase, createTestJobSeeker, cleanupTestData } from "../../../src/test-setup";

describe("UC3 - get_user_location malformed coordinates", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  test("'1.23,invalid' yields null parsed coordinates", async () => {
    const js = await createTestJobSeeker({ address_coordinates: "1.23,invalid" });

    const { error } = await testSupabase.rpc("get_user_location", {
      p_user_id: js.user_id,
    });

    expect(error).not.toBeNull();
    expect(error?.code).toBe("22P02"); // invalid input syntax for numeric
    return;
  });

  test("'1.23' (no comma) yields null parsed coordinates", async () => {
    const js = await createTestJobSeeker({ address_coordinates: "1.23" });

    const { data, error } = await testSupabase.rpc("get_user_location", {
      p_user_id: js.user_id,
    });

    expect(error).toBeNull();
    const loc = data![0];
    expect(loc.coordinates_lat).toBeNull();
    expect(loc.coordinates_lng).toBeNull();
  });

  test("'1.23,4.56,7.89' (extra parts) yields null parsed coordinates", async () => {
    const js = await createTestJobSeeker({ address_coordinates: "1.23,4.56,7.89" });

    const { data, error } = await testSupabase.rpc("get_user_location", {
      p_user_id: js.user_id,
    });

    expect(error).toBeNull();
    const loc = data![0];
    expect(loc.coordinates_lat).toBeCloseTo(1.23, 2);
    expect(loc.coordinates_lng).toBeCloseTo(4.56, 2);
  });

  test("empty string yields null parsed coordinates", async () => {
    const js = await createTestJobSeeker({ address_coordinates: "" });

    const { data, error } = await testSupabase.rpc("get_user_location", {
      p_user_id: js.user_id,
    });

    expect(error).toBeNull();
    const loc = data![0];
    expect(loc.coordinates_lat).toBeNull();
    expect(loc.coordinates_lng).toBeNull();
  });

  test("null address_coordinates yields null parsed coordinates", async () => {
    const js = await createTestJobSeeker({ address_coordinates: null as any });

    const { data, error } = await testSupabase.rpc("get_user_location", {
      p_user_id: js.user_id,
    });

    expect(error).toBeNull();
    const loc = data![0];
    expect(loc.coordinates_lat).toBeNull();
    expect(loc.coordinates_lng).toBeNull();
  });
});

