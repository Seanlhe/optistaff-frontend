/**
 * Login Validation - Pure Function Unit Tests
 * @description Tests for login-specific validation logic and helper functions
 * @testing-strategy Boundary Value Testing (BVT) and Equivalence Class Testing (ECT)
 * @use-case UC2 - Sign In
 */

import { describe, test, expect } from "vitest";
import {
  isValidEmail,
  isValidPassword,
  getEmailError,
  getPasswordError,
} from "../../../src/utils/authentication";

describe("UC2: Login Validation Utils", () => {
  
  describe("UC2 Step 2: Email Validation for Login", () => {
    test("should accept valid email formats for login", () => {
      const validEmails = [
        "user@example.com",
        "test.email@domain.co.uk",
        "user+tag@example.org",
        "jobseeker123@company.com",
        "employer@restaurant.sg",
        "admin@optistaff.com",
      ];
      
      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    test("should reject invalid email formats for login", () => {
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
        "user@.com",
        "user@domain.",
        "user@domain..com",
      ];
      
      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    test("should handle case insensitive emails for login", () => {
      expect(isValidEmail("USER@EXAMPLE.COM")).toBe(true);
      expect(isValidEmail("User@Example.Com")).toBe(true);
      expect(isValidEmail("jobseeker@COMPANY.COM")).toBe(true);
    });

    test("should handle email edge cases", () => {
      // Very long email
      const longEmail = "a".repeat(50) + "@" + "b".repeat(50) + ".com";
      expect(isValidEmail(longEmail)).toBe(true);
      
      // Email with numbers
      expect(isValidEmail("user123@domain456.com")).toBe(true);
      
      // Email with hyphens
      expect(isValidEmail("user-name@test-domain.com")).toBe(true);
    });
  });

  describe("UC2 Step 2: Password Validation for Login", () => {
    test("should accept valid passwords for login", () => {
      const validPasswords = [
        "Password123",
        "MyPass1",
        "HELLO123",
        "MixedCase1",
        "SimplePass",
        "LoginPassword",
        "VeryLongPasswordWithUpperCase123",
      ];
      
      validPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(true);
      });
    });

    test("should reject passwords without uppercase for login", () => {
      const invalidPasswords = [
        "password123",
        "nouppercase",
        "12345678",
        "alllowercase",
        "simple",
        "nouppercasehere",
      ];
      
      invalidPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    test("should reject passwords too short for login", () => {
      const shortPasswords = [
        "Pass1",
        "Hi",
        "",
        "12345",
        "A",
        "Ab1",
      ];
      
      shortPasswords.forEach(password => {
        expect(isValidPassword(password)).toBe(false);
      });
    });

    test("should handle password edge cases", () => {
      // Minimum valid password (6 chars with uppercase)
      expect(isValidPassword("Pass12")).toBe(true);
      
      // Password with special characters
      expect(isValidPassword("Pass@123")).toBe(true);
      
      // Password with spaces (should be valid if has uppercase and length)
      expect(isValidPassword("My Password")).toBe(true);
      
      // Password with only uppercase and numbers
      expect(isValidPassword("PASS123")).toBe(true);
    });
  });

  describe("UC2 Step 3: Login Error Message Generation", () => {
    describe("Email Error Messages", () => {
      test("should return null for valid email", () => {
        expect(getEmailError("user@example.com")).toBeNull();
        expect(getEmailError("test@domain.co.uk")).toBeNull();
      });

      test("should return error message for invalid email", () => {
        expect(getEmailError("invalid")).toBe("Please enter a valid email.");
        expect(getEmailError("@domain.com")).toBe("Please enter a valid email.");
        expect(getEmailError("")).toBe("Please enter a valid email.");
      });

      test("should handle email error edge cases", () => {
        expect(getEmailError("user@")).toBe("Please enter a valid email.");
        expect(getEmailError("user@@domain.com")).toBe("Please enter a valid email.");
        expect(getEmailError("user space@domain.com")).toBe("Please enter a valid email.");
      });
    });

    describe("Password Error Messages", () => {
      test("should return null for valid password", () => {
        expect(getPasswordError("Password123")).toBeNull();
        expect(getPasswordError("MyPass1")).toBeNull();
        expect(getPasswordError("HELLO123")).toBeNull();
      });

      test("should return length error for short password", () => {
        expect(getPasswordError("Pass1")).toBe("Password must be 6 characters or longer.");
        expect(getPasswordError("Hi")).toBe("Password must be 6 characters or longer.");
        expect(getPasswordError("")).toBe("Password must be 6 characters or longer.");
      });

      test("should return uppercase error for lowercase password", () => {
        expect(getPasswordError("password123")).toBe("Password must contain at least one uppercase letter.");
        expect(getPasswordError("nouppercase")).toBe("Password must contain at least one uppercase letter.");
        expect(getPasswordError("12345678")).toBe("Password must contain at least one uppercase letter.");
      });

      test("should prioritize length error over uppercase error", () => {
        // Short passwords without uppercase should show length error first
        expect(getPasswordError("pass")).toBe("Password must be 6 characters or longer.");
        expect(getPasswordError("a")).toBe("Password must be 6 characters or longer.");
      });
    });
  });

  describe("UC2 Step 4: Login Form Data Validation", () => {
    interface LoginData {
      email: string;
      password: string;
    }

    const validateLoginForm = (data: LoginData): string[] => {
      const errors: string[] = [];
      
      if (!data.email) {
        errors.push("Email is required");
      } else if (!isValidEmail(data.email)) {
        errors.push("Please enter a valid email");
      }
      
      if (!data.password) {
        errors.push("Password is required");
      } else if (!isValidPassword(data.password)) {
        const passwordError = getPasswordError(data.password);
        if (passwordError) {
          errors.push(passwordError);
        }
      }
      
      return errors;
    };

    test("should pass validation for valid login data", () => {
      const validLoginData: LoginData = {
        email: "user@example.com",
        password: "Password123",
      };
      
      expect(validateLoginForm(validLoginData)).toHaveLength(0);
    });

    test("should return errors for missing email", () => {
      const loginData: LoginData = {
        email: "",
        password: "Password123",
      };
      
      const errors = validateLoginForm(loginData);
      expect(errors).toContain("Email is required");
    });

    test("should return errors for invalid email format", () => {
      const loginData: LoginData = {
        email: "invalid-email",
        password: "Password123",
      };
      
      const errors = validateLoginForm(loginData);
      expect(errors).toContain("Please enter a valid email");
    });

    test("should return errors for missing password", () => {
      const loginData: LoginData = {
        email: "user@example.com",
        password: "",
      };
      
      const errors = validateLoginForm(loginData);
      expect(errors).toContain("Password is required");
    });

    test("should return errors for invalid password", () => {
      const loginData: LoginData = {
        email: "user@example.com",
        password: "short",
      };
      
      const errors = validateLoginForm(loginData);
      expect(errors).toContain("Password must be 6 characters or longer.");
    });

    test("should return multiple errors for multiple invalid fields", () => {
      const loginData: LoginData = {
        email: "invalid-email",
        password: "short",
      };
      
      const errors = validateLoginForm(loginData);
      expect(errors).toHaveLength(2);
      expect(errors).toContain("Please enter a valid email");
      expect(errors).toContain("Password must be 6 characters or longer.");
    });

    test("should handle completely empty form", () => {
      const loginData: LoginData = {
        email: "",
        password: "",
      };
      
      const errors = validateLoginForm(loginData);
      expect(errors).toHaveLength(2);
      expect(errors).toContain("Email is required");
      expect(errors).toContain("Password is required");
    });
  });

  describe("UC2 Step 5: Login Input Sanitization", () => {
    const sanitizeLoginInput = (input: string): string => {
      return input.trim();
    };

    test("should trim whitespace from email input", () => {
      expect(sanitizeLoginInput("  user@example.com  ")).toBe("user@example.com");
      expect(sanitizeLoginInput("\nuser@example.com\n")).toBe("user@example.com");
      expect(sanitizeLoginInput("\tuser@example.com\t")).toBe("user@example.com");
    });

    test("should trim whitespace from password input", () => {
      expect(sanitizeLoginInput("  Password123  ")).toBe("Password123");
      expect(sanitizeLoginInput("\nPassword123\n")).toBe("Password123");
      expect(sanitizeLoginInput("\tPassword123\t")).toBe("Password123");
    });

    test("should handle empty or whitespace-only input", () => {
      expect(sanitizeLoginInput("")).toBe("");
      expect(sanitizeLoginInput("   ")).toBe("");
      expect(sanitizeLoginInput("\n\t ")).toBe("");
    });

    test("should preserve internal spaces in passwords", () => {
      expect(sanitizeLoginInput("  My Password  ")).toBe("My Password");
      expect(sanitizeLoginInput("  Pass Word 123  ")).toBe("Pass Word 123");
    });
  });

  describe("UC2 Step 6: Login Security Validation", () => {
    const isSecureLoginAttempt = (email: string, password: string): boolean => {
      // Basic security checks for login attempt
      return (
        isValidEmail(email) &&
        isValidPassword(password) &&
        !email.includes('<') &&
        !email.includes('>') &&
        !password.includes('<') &&
        !password.includes('>')
      );
    };

    test("should accept secure login attempts", () => {
      expect(isSecureLoginAttempt("user@example.com", "Password123")).toBe(true);
      expect(isSecureLoginAttempt("test@domain.org", "MySecurePass")).toBe(true);
    });

    test("should reject login attempts with potential XSS", () => {
      expect(isSecureLoginAttempt("user<script>@example.com", "Password123")).toBe(false);
      expect(isSecureLoginAttempt("user@example.com", "Pass<script>")).toBe(false);
      expect(isSecureLoginAttempt("user>test@example.com", "Password123")).toBe(false);
    });

    test("should reject login attempts with invalid credentials", () => {
      expect(isSecureLoginAttempt("invalid-email", "Password123")).toBe(false);
      expect(isSecureLoginAttempt("user@example.com", "short")).toBe(false);
      expect(isSecureLoginAttempt("", "Password123")).toBe(false);
      expect(isSecureLoginAttempt("user@example.com", "")).toBe(false);
    });
  });
});
