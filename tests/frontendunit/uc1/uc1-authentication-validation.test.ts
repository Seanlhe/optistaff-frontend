/**
 * UC1 Authentication Validation - Focused Unit Tests
 * @description Tests for authentication validation functions actually used in UC1 Create Account
 * @testing-strategy Boundary Value Testing (BVT) and Equivalence Class Testing (ECT)
 * @use-case UC1 - Create Account
 */

import { describe, test, expect } from "vitest";
import {
  validateSignupForm,
  type SignupValidationData,
} from "../../../src/utils/authentication";

describe("UC1 Authentication Validation - Used Functions Only", () => {
  
  describe("validateSignupForm - UC1 Step 4: Complete Form Validation", () => {
    const createValidJobseekerData = (): SignupValidationData => ({
      email: "test@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      firstName: "John",
      lastName: "Doe",
      userType: "jobseeker",
      phoneNumber: "91234567",
      dateOfBirth: "1990-01-01",
      address: "123 Test Street, Singapore",
      postalCode: "123456",
    });

    const createValidEmployerData = (): SignupValidationData => ({
      email: "employer@company.com",
      password: "Password123",
      confirmPassword: "Password123",
      firstName: "Jane",
      lastName: "Smith",
      userType: "employer",
      companyName: "Test Company Pte Ltd",
      phoneNumber: "62345678",
    });

    describe("Valid data scenarios", () => {
      test("should pass validation for valid jobseeker data", () => {
        const data = createValidJobseekerData();
        const errors = validateSignupForm(data);
        expect(errors).toEqual([]);
      });

      test("should pass validation for valid employer data", () => {
        const data = createValidEmployerData();
        const errors = validateSignupForm(data);
        expect(errors).toEqual([]);
      });

      test("should pass validation for minimal valid employer data", () => {
        const data: SignupValidationData = {
          email: "simple@employer.com",
          password: "Simple123",
          confirmPassword: "Simple123",
          firstName: "Jo",
          lastName: "Li",
          userType: "employer",
          companyName: "AB",
        };
        const errors = validateSignupForm(data);
        expect(errors).toEqual([]);
      });
    });

    describe("Email validation", () => {
      test("should reject empty email", () => {
        const data = createValidJobseekerData();
        data.email = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Email is required");
      });

      test("should reject invalid email format", () => {
        const data = createValidJobseekerData();
        data.email = "invalid-email";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Please enter a valid email address");
      });

      test("should accept valid email formats", () => {
        const data = createValidJobseekerData();
        const validEmails = [
          "test@example.com",
          "user.name@domain.co.uk",
          "user+tag@example.org",
          "user123@test-domain.com",
        ];
        
        validEmails.forEach(email => {
          data.email = email;
          const errors = validateSignupForm(data);
          expect(errors.some(error => error.includes("email"))).toBe(false);
        });
      });
    });

    describe("Password validation", () => {
      test("should reject empty password", () => {
        const data = createValidJobseekerData();
        data.password = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Password is required");
      });

      test("should reject password too short", () => {
        const data = createValidJobseekerData();
        data.password = "Pass1";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Password must be at least 6 characters long");
      });

      test("should reject password without uppercase", () => {
        const data = createValidJobseekerData();
        data.password = "password123";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Password must contain at least one uppercase letter");
      });

      test("should reject non-matching confirmation password", () => {
        const data = createValidJobseekerData();
        data.confirmPassword = "DifferentPassword123";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Passwords do not match");
      });

      test("should reject empty confirmation password", () => {
        const data = createValidJobseekerData();
        data.confirmPassword = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Password confirmation is required");
      });
    });

    describe("Name validation", () => {
      test("should reject empty first name", () => {
        const data = createValidJobseekerData();
        data.firstName = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("First name is required");
      });

      test("should reject first name too short", () => {
        const data = createValidJobseekerData();
        data.firstName = "J";
        const errors = validateSignupForm(data);
        expect(errors).toContain("First name must be at least 2 characters long");
      });

      test("should reject first name with numbers", () => {
        const data = createValidJobseekerData();
        data.firstName = "John123";
        const errors = validateSignupForm(data);
        expect(errors).toContain("First name can only contain letters and spaces");
      });

      test("should reject first name with special characters", () => {
        const data = createValidJobseekerData();
        data.firstName = "John@Doe";
        const errors = validateSignupForm(data);
        expect(errors).toContain("First name can only contain letters and spaces");
      });

      test("should accept first name with spaces", () => {
        const data = createValidJobseekerData();
        data.firstName = "Mary Ann";
        const errors = validateSignupForm(data);
        expect(errors.some(error => error.includes("First name"))).toBe(false);
      });

      test("should reject empty last name", () => {
        const data = createValidJobseekerData();
        data.lastName = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Last name is required");
      });

      test("should reject last name too short", () => {
        const data = createValidJobseekerData();
        data.lastName = "D";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Last name must be at least 2 characters long");
      });

      test("should reject last name with numbers", () => {
        const data = createValidJobseekerData();
        data.lastName = "Doe123";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Last name can only contain letters and spaces");
      });
    });

    describe("Jobseeker-specific validation", () => {
      test("should require date of birth for jobseekers", () => {
        const data = createValidJobseekerData();
        data.dateOfBirth = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Date of birth is required for job seekers");
      });

      test("should require phone number for jobseekers", () => {
        const data = createValidJobseekerData();
        data.phoneNumber = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Mobile number is required for job seekers");
      });

      test("should reject phone number too short for jobseekers", () => {
        const data = createValidJobseekerData();
        data.phoneNumber = "1234567";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Phone number must be at least 8 characters long");
      });

      test("should require address for jobseekers", () => {
        const data = createValidJobseekerData();
        data.address = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Residential address is required for job seekers");
      });

      test("should require postal code for jobseekers", () => {
        const data = createValidJobseekerData();
        data.postalCode = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Postal code is required for job seekers");
      });

      test("should reject invalid postal code format", () => {
        const data = createValidJobseekerData();
        data.postalCode = "12345"; // Only 5 digits
        const errors = validateSignupForm(data);
        expect(errors).toContain("Postal code must be 6 digits");
      });

      test("should reject postal code with letters", () => {
        const data = createValidJobseekerData();
        data.postalCode = "12345a";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Postal code must be 6 digits");
      });

      test("should accept valid 6-digit postal code", () => {
        const data = createValidJobseekerData();
        data.postalCode = "123456";
        const errors = validateSignupForm(data);
        expect(errors.some(error => error.includes("postal code"))).toBe(false);
      });
    });

    describe("Employer-specific validation", () => {
      test("should require company name for employers", () => {
        const data = createValidEmployerData();
        data.companyName = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Company name is required for employers");
      });

      test("should reject company name too short", () => {
        const data = createValidEmployerData();
        data.companyName = "A";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Company name must be at least 2 characters long");
      });

      test("should accept minimal company name", () => {
        const data = createValidEmployerData();
        data.companyName = "AB";
        const errors = validateSignupForm(data);
        expect(errors.some(error => error.includes("Company name"))).toBe(false);
      });
    });

    describe("Phone number format validation", () => {
      test("should accept valid phone number formats", () => {
        const data = createValidJobseekerData();
        const validPhones = [
          "+65 9123 4567",
          "(65) 9123-4567",
          "91234567",
          "+1-555-123-4567",
        ];
        
        validPhones.forEach(phone => {
          data.phoneNumber = phone;
          const errors = validateSignupForm(data);
          expect(errors.some(error => error.includes("valid phone number"))).toBe(false);
        });
      });

      test("should reject phone number with invalid characters", () => {
        const data = createValidJobseekerData();
        data.phoneNumber = "9123abc4567";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Please enter a valid phone number");
      });

      test("should reject phone number with letters", () => {
        const data = createValidJobseekerData();
        data.phoneNumber = "phone123";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Please enter a valid phone number");
      });
    });

    describe("Multiple validation errors", () => {
      test("should return all validation errors", () => {
        const data: SignupValidationData = {
          email: "invalid-email",
          password: "short",
          confirmPassword: "different",
          firstName: "",
          lastName: "D",
          userType: "jobseeker",
          phoneNumber: "123",
          dateOfBirth: "",
          address: "",
          postalCode: "123",
        };
        
        const errors = validateSignupForm(data);
        
        expect(errors.length).toBeGreaterThan(5);
        expect(errors).toContain("Please enter a valid email address");
        expect(errors).toContain("Password must be at least 6 characters long");
        expect(errors).toContain("Passwords do not match");
        expect(errors).toContain("First name is required");
        expect(errors).toContain("Last name must be at least 2 characters long");
      });

      test("should prioritize required fields over format validation", () => {
        const data: SignupValidationData = {
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          userType: "jobseeker",
        };
        
        const errors = validateSignupForm(data);
        
        expect(errors).toContain("Email is required");
        expect(errors).toContain("Password is required");
        expect(errors).toContain("Password confirmation is required");
        expect(errors).toContain("First name is required");
        expect(errors).toContain("Last name is required");
      });
    });
  });
});
