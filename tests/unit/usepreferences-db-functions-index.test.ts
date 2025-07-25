/**
 * Index File for usePreferences Database Functions Tests
 * @description References all split test files for usePreferences database functions
 * @author OptiStaff Team
 * @note This file serves as documentation of the test suite structure
 */

/**
 * Test Suite Structure for usePreferences Database Functions
 *
 * The original large test file has been split into focused, maintainable files:
 *
 * 1. create-default-preferences.test.ts
 *    - Testing Approach: Equivalence Class Testing (ECT)
 *    - Functions: create_default_preferences
 *    - Coverage: Valid/Invalid input classes, idempotent operations
 *
 * 2. upsert-user-preferences.test.ts
 *    - Testing Approach: Decision Table Testing
 *    - Functions: upsert_user_preferences
 *    - Coverage: 7 decision rules covering all business logic combinations
 *
 * 3. validate-job-names.test.ts
 *    - Testing Approach: Boundary Value Testing (BVT)
 *    - Functions: validate_job_names
 *    - Coverage: Array boundaries, validation scenarios, performance tests
 *
 * 4. get-user-location.test.ts
 *    - Testing Approach: Equivalence Class Testing (ECT)
 *    - Functions: get_user_location
 *    - Coverage: Complete/partial/missing location data, coordinate parsing
 *
 * Benefits of Splitting:
 * ✅ Improved maintainability - easier to find and update specific tests
 * ✅ Focused testing - each file tests one function with appropriate methodology
 * ✅ Better organization - follows single responsibility principle
 * ✅ Faster test execution - can run individual function tests
 * ✅ Clearer documentation - each file documents its testing approach
 *
 * To run all usePreferences database function tests:
 * npm test tests/unit/create-default-preferences.test.ts
 * npm test tests/unit/upsert-user-preferences.test.ts
 * npm test tests/unit/validate-job-names.test.ts
 * npm test tests/unit/get-user-location.test.ts
 *
 * Or run all unit tests:
 * npm test tests/unit/
 */

import { describe, test, expect } from "vitest";

describe("usePreferences Database Functions Test Suite", () => {
  test("test suite structure documentation", () => {
    // This test serves as documentation and ensures the index file is included in test runs
    const testFiles = [
      "create-default-preferences.test.ts",
      "upsert-user-preferences.test.ts",
      "validate-job-names.test.ts",
      "get-user-location.test.ts",
    ];

    expect(testFiles).toHaveLength(4);
    expect(testFiles).toContain("create-default-preferences.test.ts");
    expect(testFiles).toContain("upsert-user-preferences.test.ts");
    expect(testFiles).toContain("validate-job-names.test.ts");
    expect(testFiles).toContain("get-user-location.test.ts");
  });
});
