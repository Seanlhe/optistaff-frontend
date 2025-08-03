/**
 * Authentication Validation - Pure Function Unit Tests
 * @description Tests for authentication validation logic and helper functions
 * @testing-strategy Boundary Value Testing (BVT) and Equivalence Class Testing (ECT)
 * @use-case UC1 - Create Account
 */

import { describe, test, expect } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  isValidCreatePassword,
  getEmailError,
  getPasswordError,
  getCreatePasswordError,
  validateSignupForm,
  formatUserData,
  type SignupValidationData,
} from "../../../src/utils/authentication";

describe("Authentication Validation Utils", () => {
  
  describe("isValidEmail - UC1 Step 4: Email Format Validation", () => {
    test("should accept valid email formats", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
        "user123@test-domain.com",
        "valid.email@subdomain.example.com",
      ];
      
      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    test("should reject invalid email formats", () => {
      const invalidEmails = [
        "",
        "invalid",
        "@domain.com",
        "user@",
        "user@@domain.com",
        "user space@domain.com",
        "user@domain",
        ".user@domain.com",
        "user.@domain.com",
      ];
      
      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    test("should handle case insensitive emails", () => {
      expect(isValidEmail("TEST@EXAMPLE.COM")).toBe(true);
      expect(isValidEmail("Test@Example.Com")).toBe(true);
    });
  });

  describe("isValidPassword - UC1 Step 4: Password Strength Validation", () => {
    test("should accept valid passwords", () => {
      const validPasswords = [
        "Password123",
        "MyPass1",
        "HELLO123",
        "MixedCase1",
        "VeryLongPasswordWithUpperCase",
      ];
      
      validPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(true);
      });
    });

    test("should reject passwords without uppercase", () => {
      const invalidPasswords = [
        "password123",
        "nouppercase",
        "12345678",
        "alllowercase",
      ];
      
      invalidPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    test("should reject passwords too short", () => {
      const shortPasswords = [
        "Pass1",
        "Hi",
        "",
        "12345",
      ];
      
      shortPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(false);
      });
    });
  });

  describe("isValidCreatePassword - UC1 Step 4: Password Confirmation", () => {
    test("should accept matching valid passwords", () => {
      expect(isValidCreatePassword("Password123", "Password123")).toBe(true);
      expect(isValidCreatePassword("MyPass1", "MyPass1")).toBe(true);
    });

    test("should reject non-matching passwords", () => {
      expect(isValidCreatePassword("Password123", "Password124")).toBe(false);
      expect(isValidCreatePassword("MyPass1", "MyPass2")).toBe(false);
    });

    test("should reject if primary password is invalid", () => {
      expect(isValidCreatePassword("short", "short")).toBe(false);
      expect(isValidCreatePassword("nouppercase", "nouppercase")).toBe(false);
    });
  });

  describe("getEmailError - UC1 Step 4: Email Error Messages", () => {
    test("should return null for valid emails", () => {
      expect(getEmailError("test@example.com")).toBeNull();
      expect(getEmailError("user@domain.org")).toBeNull();
    });

    test("should return error message for invalid emails", () => {
      expect(getEmailError("invalid")).toBe("Please enter a valid email.");
      expect(getEmailError("@domain.com")).toBe("Please enter a valid email.");
      expect(getEmailError("")).toBe("Please enter a valid email.");
    });
  });

  describe("getPasswordError - UC1 Step 4: Password Error Messages", () => {
    test("should return null for valid passwords", () => {
      expect(getPasswordError("Password123")).toBeNull();
      expect(getPasswordError("MyPass1")).toBeNull();
    });

    test("should return length error for short passwords", () => {
      expect(getPasswordError("12345")).toBe("Password must be 6 characters or longer.");
      expect(getPasswordError("Hi")).toBe("Password must be 6 characters or longer.");
    });

    test("should return uppercase error for passwords without uppercase", () => {
      expect(getPasswordError("password123")).toBe("Password must contain at least one uppercase letter.");
      expect(getPasswordError("alllowercase")).toBe("Password must contain at least one uppercase letter.");
    });
  });

  describe("getCreatePasswordError - UC1 Step 4: Password Confirmation Error Messages", () => {
    test("should return null for matching valid passwords", () => {
      expect(getCreatePasswordError("Password123", "Password123")).toBeNull();
    });

    test("should prioritize length errors", () => {
      expect(getCreatePasswordError("short", "short")).toBe("Password must be 6 characters or longer.");
    });

    test("should return uppercase error after length is valid", () => {
      expect(getCreatePasswordError("password", "password")).toBe("Password must contain at least one uppercase letter.");
    });

    test("should return mismatch error when passwords don't match", () => {
      expect(getCreatePasswordError("Password123", "Password124")).toBe("Passwords do not match.");
    });
  });

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
    });

    describe("Email validation errors", () => {
      test("should return error for missing email", () => {
        const data = createValidJobseekerData();
        data.email = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Email is required");
      });

      test("should return error for invalid email format", () => {
        const data = createValidJobseekerData();
        data.email = "invalid-email";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Please enter a valid email address");
      });
    });

    describe("Password validation errors", () => {
      test("should return error for missing password", () => {
        const data = createValidJobseekerData();
        data.password = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Password is required");
      });

      test("should return error for short password", () => {
        const data = createValidJobseekerData();
        data.password = "short";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Password must be at least 6 characters long");
      });

      test("should return error for password without uppercase", () => {
        const data = createValidJobseekerData();
        data.password = "password123";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Password must contain at least one uppercase letter");
      });

      test("should return error for missing password confirmation", () => {
        const data = createValidJobseekerData();
        data.confirmPassword = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Password confirmation is required");
      });

      test("should return error for non-matching passwords", () => {
        const data = createValidJobseekerData();
        data.confirmPassword = "DifferentPassword123";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Passwords do not match");
      });
    });

    describe("Name validation errors", () => {
      test("should return error for missing first name", () => {
        const data = createValidJobseekerData();
        data.firstName = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("First name is required");
      });

      test("should return error for short first name", () => {
        const data = createValidJobseekerData();
        data.firstName = "J";
        const errors = validateSignupForm(data);
        expect(errors).toContain("First name must be at least 2 characters long");
      });

      test("should return error for first name with numbers", () => {
        const data = createValidJobseekerData();
        data.firstName = "John123";
        const errors = validateSignupForm(data);
        expect(errors).toContain("First name can only contain letters and spaces");
      });

      test("should return error for missing last name", () => {
        const data = createValidJobseekerData();
        data.lastName = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Last name is required");
      });

      test("should return error for short last name", () => {
        const data = createValidJobseekerData();
        data.lastName = "D";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Last name must be at least 2 characters long");
      });

      test("should return error for last name with numbers", () => {
        const data = createValidJobseekerData();
        data.lastName = "Doe123";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Last name can only contain letters and spaces");
      });
    });

    describe("Jobseeker-specific validation errors", () => {
      test("should return error for missing date of birth", () => {
        const data = createValidJobseekerData();
        data.dateOfBirth = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Date of birth is required for job seekers");
      });

      test("should return error for missing phone number", () => {
        const data = createValidJobseekerData();
        data.phoneNumber = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Mobile number is required for job seekers");
      });

      test("should return error for short phone number", () => {
        const data = createValidJobseekerData();
        data.phoneNumber = "1234";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Phone number must be at least 8 characters long");
      });

      test("should return error for missing address", () => {
        const data = createValidJobseekerData();
        data.address = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Residential address is required for job seekers");
      });

      test("should return error for missing postal code", () => {
        const data = createValidJobseekerData();
        data.postalCode = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Postal code is required for job seekers");
      });
    });

    describe("Employer-specific validation errors", () => {
      test("should return error for missing company name", () => {
        const data = createValidEmployerData();
        data.companyName = "";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Company name is required for employers");
      });

      test("should return error for short company name", () => {
        const data = createValidEmployerData();
        data.companyName = "A";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Company name must be at least 2 characters long");
      });
    });

    describe("Format validation errors", () => {
      test("should return error for invalid postal code format", () => {
        const data = createValidJobseekerData();
        data.postalCode = "12345"; // Not 6 digits
        const errors = validateSignupForm(data);
        expect(errors).toContain("Postal code must be 6 digits");
      });

      test("should return error for invalid phone number format", () => {
        const data = createValidJobseekerData();
        data.phoneNumber = "phone123abc";
        const errors = validateSignupForm(data);
        expect(errors).toContain("Please enter a valid phone number");
      });
    });

    describe("Multiple errors scenario", () => {
      test("should return multiple errors for multiple invalid fields", () => {
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
        expect(errors).toContain("First name is required");
        expect(errors).toContain("Last name must be at least 2 characters long");
      });
    });
  });

  describe("formatUserData - UC1 Step 13: User Data Formatting", () => {
    test("should format user data with all fields", () => {
      const userData = {
        id: "123",
        email: "test@example.com",
        role: "jobseeker",
        extraField: "should be ignored",
      };
      
      const formatted = formatUserData(userData);
      expect(formatted).toEqual({
        id: "123",
        email: "test@example.com",
        role: "jobseeker",
      });
    });

    test("should handle missing email", () => {
      const userData = {
        id: "123",
        role: "employer",
      };
      
      const formatted = formatUserData(userData);
      expect(formatted).toEqual({
        id: "123",
        email: "",
        role: "employer",
      });
    });

    test("should default role to jobseeker", () => {
      const userData = {
        id: "123",
        email: "test@example.com",
      };
      
      const formatted = formatUserData(userData);
      expect(formatted).toEqual({
        id: "123",
        email: "test@example.com",
        role: "jobseeker",
      });
    });

    test("should handle null/undefined userData", () => {
      const formatted = formatUserData({});
      expect(formatted).toEqual({
        id: undefined,
        email: "",
        role: "jobseeker",
      });
    });
  });
});
