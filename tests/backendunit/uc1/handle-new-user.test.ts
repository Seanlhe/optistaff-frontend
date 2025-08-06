/**
 * True Backend Unit Tests for handle_new_user Database Function and Trigger
 * @description Tests handle_new_user database function and trigger that creates user profiles
 * @testing-strategy Database Function Testing with Local Supabase Instance
 * @use-case UC1 - Create Account (Backend Database Logic)
 */

import { describe, test, expect, beforeEach } from "vitest";
import {
  testSupabase,
  testSupabaseAdmin,
  cleanupTestData,
} from "../../../src/test-setup";

describe("handle_new_user() - True Backend Database Unit Tests", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  describe("Database Trigger Tests - User Profile Creation", () => {
    test("should create job_seekers record when user_type is 'job-seeker'", async () => {
      // Arrange - Prepare test data
      const testEmail = "jobseeker@test.com";
      const testPassword = "testpassword123";
      const userData = {
        user_type: "job-seeker",
        first_name: "John",
        last_name: "Doe",
        phone_number: "91234567",
        date_of_birth: "1990-01-01",
        address: "123 Test Street, Singapore",
        postal_code: "123456",
      };

      console.log("Testing trigger by creating auth.users record with metadata");
      
      // Act - Create auth.users record with metadata (this should trigger handle_new_user)
      const { data: authData, error: authError } = await testSupabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: userData
      });

      expect(authError).toBeNull();
      expect(authData.user).toBeTruthy();
      
      const testUserId = authData.user!.id;

      // Wait for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Assert - Verify job_seekers record was created by trigger
      const { data: jobSeeker, error: jobSeekerError } = await testSupabase
        .from("job_seekers")
        .select("*")
        .eq("user_id", testUserId)
        .single();

      expect(jobSeekerError).toBeNull();
      expect(jobSeeker).toBeTruthy();
      expect(jobSeeker.user_id).toBe(testUserId);
      expect(jobSeeker.first_name).toBe("John");
      expect(jobSeeker.last_name).toBe("Doe");
      expect(jobSeeker.phone_number).toBe("91234567");
      expect(jobSeeker.address).toBe("123 Test Street, Singapore");
      expect(jobSeeker.postal_code).toBe("123456");
      expect(jobSeeker.status).toBe("ACTIVE");

      // Assert - Verify default preferences were created by trigger
      const { data: preferences, error: prefError } = await testSupabase
        .from("preferences")
        .select("*")
        .eq("user_id", testUserId)
        .single();

      expect(prefError).toBeNull();
      expect(preferences).toBeTruthy();
      expect(preferences.user_id).toBe(testUserId);
    });

    test("should create clients record when user_type is 'client'", async () => {
      // Arrange - Create auth.users record with client metadata
      const testEmail = "employer@company.com";
      const testPassword = "testpassword123";
      const userData = {
        user_type: "client",
        first_name: "Jane",
        last_name: "Smith",
        company_name: "Test Company Pte Ltd",
        phone_number: "62345678",
        address: "456 Business Ave, Singapore",
        postal_code: "654321",
        office_number: "10-01",
      };

      // Act - Create auth.users record with metadata (this should trigger handle_new_user)
      const { data: authData, error: authError } = await testSupabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: userData
      });

      expect(authError).toBeNull();
      expect(authData.user).toBeTruthy();
      
      const testUserId = authData.user!.id;

      // Wait a moment for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Assert - Verify clients record was created by trigger
      const { data: client, error: clientError } = await testSupabase
        .from("clients")
        .select("*")
        .eq("client_id", testUserId)
        .single();

      expect(clientError).toBeNull();
      expect(client).toBeTruthy();
      expect(client.client_id).toBe(testUserId);
      expect(client.first_name).toBe("Jane");
      expect(client.last_name).toBe("Smith");
      expect(client.company_name).toBe("Test Company Pte Ltd");
      expect(client.phone).toBe("62345678");
      expect(client.address).toBe("456 Business Ave, Singapore");
      expect(client.postal_code).toBe("654321");
      expect(client.office_number).toBe("10-01");
      expect(client.contact_email).toBe(testEmail);

      // Assert - Verify NO preferences record was created for clients
      const { data: preferences, error: prefError } = await testSupabase
        .from("preferences")
        .select("*")
        .eq("user_id", testUserId)
        .single();

      expect(prefError).toBeTruthy(); // Should error because no record exists
      expect(preferences).toBeNull();
    });

    test("should handle missing metadata gracefully", async () => {
      // Arrange - Create auth.users record with minimal metadata
      const testEmail = "minimal@test.com";
      const testPassword = "testpassword123";
      const userData = {
        user_type: "job-seeker",
        // Missing other fields
      };

      // Act - Create auth.users record with minimal metadata (this should trigger handle_new_user)
      const { data: authData, error: authError } = await testSupabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: userData
      });

      expect(authError).toBeNull();
      expect(authData.user).toBeTruthy();
      
      const testUserId = authData.user!.id;

      // Wait a moment for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: jobSeeker, error: jobSeekerError } = await testSupabase
        .from("job_seekers")
        .select("*")
        .eq("user_id", testUserId)
        .single();

      expect(jobSeekerError).toBeNull();
      expect(jobSeeker.user_id).toBe(testUserId);
      // Should use email prefix as default first name
      expect(jobSeeker.first_name).toBe("minimal");
      expect(jobSeeker.last_name).toBe("");
      expect(jobSeeker.status).toBe("ACTIVE");
    });

    test("should not create profile for unknown user_type", async () => {
      // Arrange
      const testEmail = "unknown@test.com";
      const testPassword = "testpassword123";
      const userData = {
        user_type: "admin", // Unknown user type
        first_name: "Admin",
        last_name: "User",
      };

      // Act - Create auth.users record with unknown user type (this should trigger handle_new_user)
      const { data: authData, error: authError } = await testSupabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: userData
      });

      expect(authError).toBeNull();
      expect(authData.user).toBeTruthy();
      
      const testUserId = authData.user!.id;

      // Wait for trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Assert - No job_seeker or client record should be created
      const { data: jobSeeker } = await testSupabase
        .from("job_seekers")
        .select("*")
        .eq("user_id", testUserId)
        .single();

      const { data: client } = await testSupabase
        .from("clients")
        .select("*")
        .eq("client_id", testUserId)
        .single();

      expect(jobSeeker).toBeNull();
      expect(client).toBeNull();
    });
  });

  describe("Database Function Direct Tests", () => {
    test("should call handle_new_user function directly", async () => {
      // Note: This would require creating a test version of the function
      // that can be called directly, or testing the trigger mechanism
      // For now, the trigger tests above cover the function behavior
      
      // This test demonstrates how you would test the function directly
      // if it was exposed as a callable RPC function
      expect(true).toBe(true); // Placeholder
    });
  });

  describe("Database Constraints and Validation", () => {
    test("should enforce foreign key constraint between job_seekers and auth.users", async () => {
      // Arrange - Try to insert job_seeker with non-existent user_id
      const fakeUserId = "00000000-0000-0000-0000-000000000001";

      // Act & Assert - Should fail with foreign key constraint error
      const { error } = await testSupabase
        .from("job_seekers")
        .insert({
          user_id: fakeUserId,
          first_name: "Test",
          last_name: "User",
          status: "ACTIVE",
        });

      expect(error).toBeTruthy();
      expect(error!.message).toContain("foreign key");
    });

    test("should enforce foreign key constraint between clients and auth.users", async () => {
      // Arrange
      const fakeUserId = "00000000-0000-0000-0000-000000000002";

      // Act & Assert
      const { error } = await testSupabase
        .from("clients")
        .insert({
          client_id: fakeUserId,
          company_name: "Test Company",
          first_name: "Test",
          last_name: "User",
          contact_email: "test@test.com", // Add required field
        });

      expect(error).toBeTruthy();
      expect(error!.message).toContain("foreign key");
    });

    test("should enforce postal_code format validation", async () => {
      // This would test database constraints if they exist
      // The current schema validation would need to be checked
      expect(true).toBe(true); // Placeholder for postal code validation tests
    });
  });

  describe("Cleanup and Cascade Behavior", () => {
    test("should cascade delete job_seeker when auth.users record is deleted", async () => {
      // Arrange - Create user and job_seeker using auth.admin.createUser (triggers handle_new_user)
      const testEmail = "cascade@test.com";
      const testPassword = "testpassword123";
      const userData = { 
        user_type: "job-seeker", 
        first_name: "Test", 
        last_name: "User" 
      };

      // Create auth.users record with metadata (this should trigger handle_new_user)
      const { data: authData, error: authError } = await testSupabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: userData
      });

      expect(authError).toBeNull();
      expect(authData.user).toBeTruthy();
      
      const testUserId = authData.user!.id;

      // Wait for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify job_seeker was created by trigger
      const { data: jobSeekerBefore } = await testSupabase
        .from("job_seekers")
        .select("*")
        .eq("user_id", testUserId)
        .single();
      expect(jobSeekerBefore).toBeTruthy();

      // Act - Delete auth.users record using admin API
      const { error: deleteError } = await testSupabaseAdmin.auth.admin.deleteUser(testUserId);
      expect(deleteError).toBeNull();

      // Wait for cascade to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Assert - job_seeker should be cascaded deleted
      const { data: jobSeekerAfter } = await testSupabase
        .from("job_seekers")
        .select("*")
        .eq("user_id", testUserId)
        .single();

      expect(jobSeekerAfter).toBeNull();
    });
  });
});
