/**
 * Field Validation - Pure Function Unit Tests
 * @description Tests for real-time field validation logic and formatters
 * @testing-strategy Boundary Value Testing (BVT) and Equivalence Class Testing (ECT)
 * @use-case UC1 - Create Account (Real-time validation support)
 */

import { describe, test, expect } from "vitest";
import {
  formatters,
  fieldValidators,
  inputConstraints,
  useFieldValidation,
} from "../../../src/utils/field-validation";
import { renderHook } from "@testing-library/react";

describe("Field Validation Utils", () => {
  
  describe("formatters - UC1 Step 2: Input Formatting", () => {
    describe("nameOnly formatter", () => {
      test("should remove numbers and special characters", () => {
        expect(formatters.nameOnly("John123")).toBe("John");
        expect(formatters.nameOnly("Jane@Doe")).toBe("JaneDoe");
        expect(formatters.nameOnly("Mary-Ann")).toBe("MaryAnn");
        expect(formatters.nameOnly("Bob$%^")).toBe("Bob");
      });

      test("should preserve letters and spaces", () => {
        expect(formatters.nameOnly("John Doe")).toBe("John Doe");
        expect(formatters.nameOnly("Mary Ann Smith")).toBe("Mary Ann Smith");
        expect(formatters.nameOnly("O'Connor")).toBe("OConnor"); // Apostrophe removed
      });

      test("should handle edge cases", () => {
        expect(formatters.nameOnly("")).toBe("");
        expect(formatters.nameOnly("123456")).toBe("");
        expect(formatters.nameOnly("   ")).toBe("   ");
      });
    });

    describe("phoneNumber formatter", () => {
      test("should preserve numbers, spaces, dashes, parentheses, and plus", () => {
        expect(formatters.phoneNumber("+65 9123 4567")).toBe("+65 9123 4567");
        expect(formatters.phoneNumber("(65) 9123-4567")).toBe("(65) 9123-4567");
        expect(formatters.phoneNumber("91234567")).toBe("91234567");
      });

      test("should remove letters and other special characters", () => {
        expect(formatters.phoneNumber("phone123abc")).toBe("123");
        expect(formatters.phoneNumber("9123@4567")).toBe("91234567");
        expect(formatters.phoneNumber("91#23$45%67")).toBe("91234567");
      });

      test("should handle edge cases", () => {
        expect(formatters.phoneNumber("")).toBe("");
        expect(formatters.phoneNumber("abcdef")).toBe("");
        expect(formatters.phoneNumber("+()-")).toBe("+()-");
      });
    });

    describe("postalCode formatter", () => {
      test("should preserve only numbers", () => {
        expect(formatters.postalCode("123456")).toBe("123456");
        expect(formatters.postalCode("123")).toBe("123");
      });

      test("should remove all non-numeric characters", () => {
        expect(formatters.postalCode("12a3b4c5")).toBe("12345");
        expect(formatters.postalCode("S123456")).toBe("123456");
        expect(formatters.postalCode("12-34-56")).toBe("123456");
      });

      test("should handle edge cases", () => {
        expect(formatters.postalCode("")).toBe("");
        expect(formatters.postalCode("abcdef")).toBe("");
        expect(formatters.postalCode("!@#$%^")).toBe("");
      });
    });

    describe("email formatter", () => {
      test("should trim and convert to lowercase", () => {
        expect(formatters.email("  TEST@EXAMPLE.COM  ")).toBe("test@example.com");
        expect(formatters.email("User@Domain.Org")).toBe("user@domain.org");
      });

      test("should handle normal cases", () => {
        expect(formatters.email("test@example.com")).toBe("test@example.com");
        expect(formatters.email("")).toBe("");
      });
    });
  });

  describe("fieldValidators - UC1 Step 3: Real-time Field Validation", () => {
    describe("name validator", () => {
      test("should accept valid names", () => {
        expect(fieldValidators.name("John")).toEqual({ isValid: true });
        expect(fieldValidators.name("Mary Ann")).toEqual({ isValid: true });
        expect(fieldValidators.name("O Connor")).toEqual({ isValid: true });
      });

      test("should reject empty names", () => {
        expect(fieldValidators.name("")).toEqual({ 
          isValid: false, 
          message: "This field is required" 
        });
        expect(fieldValidators.name("   ")).toEqual({ 
          isValid: false, 
          message: "This field is required" 
        });
      });

      test("should reject short names", () => {
        expect(fieldValidators.name("J")).toEqual({ 
          isValid: false, 
          message: "Must be at least 2 characters" 
        });
      });

      test("should reject names with invalid characters", () => {
        expect(fieldValidators.name("John123")).toEqual({ 
          isValid: false, 
          message: "Only letters and spaces allowed" 
        });
        expect(fieldValidators.name("Jane@Doe")).toEqual({ 
          isValid: false, 
          message: "Only letters and spaces allowed" 
        });
      });
    });

    describe("phoneNumber validator", () => {
      test("should accept valid phone numbers", () => {
        expect(fieldValidators.phoneNumber("91234567")).toEqual({ isValid: true });
        expect(fieldValidators.phoneNumber("+65 9123 4567")).toEqual({ isValid: true });
        expect(fieldValidators.phoneNumber("(65) 9123-4567")).toEqual({ isValid: true });
      });

      test("should reject empty phone numbers", () => {
        expect(fieldValidators.phoneNumber("")).toEqual({ 
          isValid: false, 
          message: "Phone number is required" 
        });
      });

      test("should reject short phone numbers", () => {
        expect(fieldValidators.phoneNumber("123")).toEqual({ 
          isValid: false, 
          message: "Phone number too short" 
        });
      });

      test("should reject invalid format", () => {
        expect(fieldValidators.phoneNumber("abc123def")).toEqual({ 
          isValid: false, 
          message: "Invalid phone number format" 
        });
      });
    });

    describe("postalCode validator", () => {
      test("should accept valid postal codes", () => {
        expect(fieldValidators.postalCode("123456")).toEqual({ isValid: true });
        expect(fieldValidators.postalCode("654321")).toEqual({ isValid: true });
      });

      test("should reject empty postal codes", () => {
        expect(fieldValidators.postalCode("")).toEqual({ 
          isValid: false, 
          message: "Postal code is required" 
        });
      });

      test("should reject invalid format", () => {
        expect(fieldValidators.postalCode("12345")).toEqual({ 
          isValid: false, 
          message: "Must be 6 digits" 
        });
        expect(fieldValidators.postalCode("1234567")).toEqual({ 
          isValid: false, 
          message: "Must be 6 digits" 
        });
        expect(fieldValidators.postalCode("12345a")).toEqual({ 
          isValid: false, 
          message: "Must be 6 digits" 
        });
      });
    });

    describe("companyName validator", () => {
      test("should accept valid company names", () => {
        expect(fieldValidators.companyName("ABC Company")).toEqual({ isValid: true });
        expect(fieldValidators.companyName("XYZ Pte Ltd")).toEqual({ isValid: true });
      });

      test("should reject empty company names", () => {
        expect(fieldValidators.companyName("")).toEqual({ 
          isValid: false, 
          message: "Company name is required" 
        });
      });

      test("should reject short company names", () => {
        expect(fieldValidators.companyName("A")).toEqual({ 
          isValid: false, 
          message: "Company name too short" 
        });
      });
    });
  });

  describe("inputConstraints - UC1 Step 3: Field Configuration", () => {
    test("should have correct constraints for firstName", () => {
      const constraint = inputConstraints.firstName;
      expect(constraint.maxLength).toBe(50);
      expect(constraint.pattern).toBe("[a-zA-Z\\s]*");
      expect(constraint.formatter).toBe(formatters.nameOnly);
      expect(constraint.validator).toBe(fieldValidators.name);
    });

    test("should have correct constraints for lastName", () => {
      const constraint = inputConstraints.lastName;
      expect(constraint.maxLength).toBe(50);
      expect(constraint.pattern).toBe("[a-zA-Z\\s]*");
      expect(constraint.formatter).toBe(formatters.nameOnly);
      expect(constraint.validator).toBe(fieldValidators.name);
    });

    test("should have correct constraints for phoneNumber", () => {
      const constraint = inputConstraints.phoneNumber;
      expect(constraint.maxLength).toBe(15);
      expect(constraint.pattern).toBe("[\\d+\\-\\s()]*");
      expect(constraint.formatter).toBe(formatters.phoneNumber);
      expect(constraint.validator).toBe(fieldValidators.phoneNumber);
    });

    test("should have correct constraints for postalCode", () => {
      const constraint = inputConstraints.postalCode;
      expect(constraint.maxLength).toBe(6);
      expect(constraint.pattern).toBe("[0-9]*");
      expect(constraint.formatter).toBe(formatters.postalCode);
      expect(constraint.validator).toBe(fieldValidators.postalCode);
    });

    test("should have correct constraints for companyName", () => {
      const constraint = inputConstraints.companyName;
      expect(constraint.maxLength).toBe(100);
      expect(constraint.validator).toBe(fieldValidators.companyName);
      expect(constraint.pattern).toBeUndefined();
      expect(constraint.formatter).toBeUndefined();
    });

    test("should have correct constraints for address", () => {
      const constraint = inputConstraints.address;
      expect(constraint.maxLength).toBe(200);
      expect(constraint.validator).toBeDefined();
    });
  });

  describe("useFieldValidation Hook - UC1 Step 3: Hook Integration", () => {
    test("should validate fields correctly", () => {
      const { result } = renderHook(() => useFieldValidation());

      // Test firstName validation
      expect(result.current.validateField("firstName", "John")).toEqual({ isValid: true });
      expect(result.current.validateField("firstName", "")).toEqual({ 
        isValid: false, 
        message: "This field is required" 
      });

      // Test phoneNumber validation
      expect(result.current.validateField("phoneNumber", "91234567")).toEqual({ isValid: true });
      expect(result.current.validateField("phoneNumber", "123")).toEqual({ 
        isValid: false, 
        message: "Phone number too short" 
      });
    });

    test("should format fields correctly", () => {
      const { result } = renderHook(() => useFieldValidation());

      // Test firstName formatting
      expect(result.current.formatField("firstName", "John123")).toBe("John");
      expect(result.current.formatField("firstName", "Jane@Doe")).toBe("JaneDoe");

      // Test phoneNumber formatting
      expect(result.current.formatField("phoneNumber", "phone123abc")).toBe("123");
      expect(result.current.formatField("phoneNumber", "+65 9123 4567")).toBe("+65 9123 4567");

      // Test postalCode formatting
      expect(result.current.formatField("postalCode", "12a3b4c5")).toBe("12345");
    });

    test("should handle unknown field names gracefully", () => {
      const { result } = renderHook(() => useFieldValidation());

      // Should return unchanged value for unknown fields
      expect(result.current.formatField("unknownField", "test123")).toBe("test123");
      expect(result.current.validateField("unknownField", "test")).toEqual({ isValid: true });
    });

    test("should handle fields without formatters", () => {
      const { result } = renderHook(() => useFieldValidation());

      // companyName doesn't have a formatter
      expect(result.current.formatField("companyName", "ABC Company 123")).toBe("ABC Company 123");
    });

    test("should handle fields without validators", () => {
      const { result } = renderHook(() => useFieldValidation());

      // If we add a field without validator in the future
      expect(result.current.validateField("fieldWithoutValidator", "anything")).toEqual({ isValid: true });
    });
  });

  describe("Integration Tests - UC1 Step 3: Complete Field Processing", () => {
    test("should process firstName input completely", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      // Simulate user typing "John123" in firstName field
      const formatted = result.current.formatField("firstName", "John123");
      expect(formatted).toBe("John"); // Numbers removed
      
      const validation = result.current.validateField("firstName", formatted);
      expect(validation).toEqual({ isValid: true });
    });

    test("should process phoneNumber input completely", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      // Simulate user typing "phone91234567abc" in phoneNumber field
      const formatted = result.current.formatField("phoneNumber", "phone91234567abc");
      expect(formatted).toBe("91234567"); // Letters removed
      
      const validation = result.current.validateField("phoneNumber", formatted);
      expect(validation).toEqual({ isValid: true });
    });

    test("should process postalCode input completely", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      // Simulate user typing "S123456" in postalCode field
      const formatted = result.current.formatField("postalCode", "S123456");
      expect(formatted).toBe("123456"); // Letters removed
      
      const validation = result.current.validateField("postalCode", formatted);
      expect(validation).toEqual({ isValid: true });
    });

    test("should handle invalid input after formatting", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      // Simulate user typing only letters in phoneNumber field
      const formatted = result.current.formatField("phoneNumber", "abcdefgh");
      expect(formatted).toBe(""); // All letters removed
      
      const validation = result.current.validateField("phoneNumber", formatted);
      expect(validation).toEqual({ 
        isValid: false, 
        message: "Phone number is required" 
      });
    });
  });
});
