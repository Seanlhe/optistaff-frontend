/**
 * UC1 Field Validation - Focused Unit Tests
 * @description Tests for real-time field validation functions used in UC1 Create Account
 * @testing-strategy Boundary Value Testing (BVT) and Equivalence Class Testing (ECT)
 * @use-case UC1 - Create Account (Real-time field validation)
 */

import { describe, test, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  formatters,
  fieldValidators,
  inputConstraints,
  useFieldValidation,
} from "../../../src/utils/field-validation";

describe("UC1 Field Validation - Used Functions Only", () => {
  
  describe("formatters - UC1 Real-time Input Formatting", () => {
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
        expect(formatters.phoneNumber("call+65-9123#4567")).toBe("+65-91234567");
      });

      test("should handle edge cases", () => {
        expect(formatters.phoneNumber("")).toBe("");
        expect(formatters.phoneNumber("abcdef")).toBe("");
        expect(formatters.phoneNumber("!@#$%^")).toBe("");
      });
    });

    describe("postalCode formatter", () => {
      test("should preserve only digits", () => {
        expect(formatters.postalCode("123456")).toBe("123456");
        expect(formatters.postalCode("12ab34cd56")).toBe("123456");
        expect(formatters.postalCode("1@2#3$4%5^6")).toBe("123456");
      });

      test("should limit to 6 digits", () => {
        expect(formatters.postalCode("1234567890")).toBe("123456");
        expect(formatters.postalCode("123456abc789")).toBe("123456");
      });

      test("should handle edge cases", () => {
        expect(formatters.postalCode("")).toBe("");
        expect(formatters.postalCode("abcdef")).toBe("");
        expect(formatters.postalCode("!@#$%^")).toBe("");
      });
    });
  });

  describe("fieldValidators - UC1 Real-time Field Validation", () => {
    describe("name validator", () => {
      test("should accept valid names", () => {
        expect(fieldValidators.name("John")).toEqual({ isValid: true });
        expect(fieldValidators.name("Mary Ann")).toEqual({ isValid: true });
        expect(fieldValidators.name("Li")).toEqual({ isValid: true });
      });

      test("should reject names too short", () => {
        const result = fieldValidators.name("J");
        expect(result.isValid).toBe(false);
        expect(result.message).toBe("Must be at least 2 characters long");
      });

      test("should reject empty names", () => {
        const result = fieldValidators.name("");
        expect(result.isValid).toBe(false);
        expect(result.message).toBe("Must be at least 2 characters long");
      });

      test("should reject names with numbers", () => {
        const result = fieldValidators.name("John123");
        expect(result.isValid).toBe(false);
        expect(result.message).toBe("Can only contain letters and spaces");
      });

      test("should reject names with special characters", () => {
        const result = fieldValidators.name("John@Doe");
        expect(result.isValid).toBe(false);
        expect(result.message).toBe("Can only contain letters and spaces");
      });
    });

    describe("phoneNumber validator", () => {
      test("should accept valid phone numbers", () => {
        expect(fieldValidators.phoneNumber("91234567")).toEqual({ isValid: true });
        expect(fieldValidators.phoneNumber("+65 9123 4567")).toEqual({ isValid: true });
        expect(fieldValidators.phoneNumber("(65) 9123-4567")).toEqual({ isValid: true });
      });

      test("should reject phone numbers too short", () => {
        const result = fieldValidators.phoneNumber("1234567");
        expect(result.isValid).toBe(false);
        expect(result.message).toBe("Must be at least 8 characters long");
      });

      test("should reject empty phone numbers", () => {
        const result = fieldValidators.phoneNumber("");
        expect(result.isValid).toBe(false);
        expect(result.message).toBe("Must be at least 8 characters long");
      });

      test("should reject phone numbers with invalid characters", () => {
        const result = fieldValidators.phoneNumber("91234abc");
        expect(result.isValid).toBe(false);
        expect(result.message).toBe("Can only contain numbers, spaces, dashes, parentheses, and plus sign");
      });
    });

    describe("postalCode validator", () => {
      test("should accept valid 6-digit postal codes", () => {
        expect(fieldValidators.postalCode("123456")).toEqual({ isValid: true });
        expect(fieldValidators.postalCode("654321")).toEqual({ isValid: true });
      });

      test("should reject postal codes not exactly 6 digits", () => {
        const result1 = fieldValidators.postalCode("12345");
        expect(result1.isValid).toBe(false);
        expect(result1.message).toBe("Must be exactly 6 digits");

        const result2 = fieldValidators.postalCode("1234567");
        expect(result2.isValid).toBe(false);
        expect(result2.message).toBe("Must be exactly 6 digits");
      });

      test("should reject empty postal codes", () => {
        const result = fieldValidators.postalCode("");
        expect(result.isValid).toBe(false);
        expect(result.message).toBe("Must be exactly 6 digits");
      });

      test("should reject postal codes with non-digits", () => {
        const result = fieldValidators.postalCode("12345a");
        expect(result.isValid).toBe(false);
        expect(result.message).toBe("Must be exactly 6 digits");
      });
    });

    describe("companyName validator", () => {
      test("should accept valid company names", () => {
        expect(fieldValidators.companyName("Test Company")).toEqual({ isValid: true });
        expect(fieldValidators.companyName("AB")).toEqual({ isValid: true });
        expect(fieldValidators.companyName("Very Long Company Name Pte Ltd")).toEqual({ isValid: true });
      });

      test("should reject company names too short", () => {
        const result = fieldValidators.companyName("A");
        expect(result.isValid).toBe(false);
        expect(result.message).toBe("Must be at least 2 characters long");
      });

      test("should reject empty company names", () => {
        const result = fieldValidators.companyName("");
        expect(result.isValid).toBe(false);
        expect(result.message).toBe("Must be at least 2 characters long");
      });
    });
  });

  describe("inputConstraints - UC1 Field Configuration", () => {
    test("should have correct constraints for firstName", () => {
      const constraint = inputConstraints.firstName;
      expect(constraint.formatter).toBe(formatters.nameOnly);
      expect(constraint.validator).toBe(fieldValidators.name);
      expect(constraint.maxLength).toBe(50);
    });

    test("should have correct constraints for lastName", () => {
      const constraint = inputConstraints.lastName;
      expect(constraint.formatter).toBe(formatters.nameOnly);
      expect(constraint.validator).toBe(fieldValidators.name);
      expect(constraint.maxLength).toBe(50);
    });

    test("should have correct constraints for phoneNumber", () => {
      const constraint = inputConstraints.phoneNumber;
      expect(constraint.formatter).toBe(formatters.phoneNumber);
      expect(constraint.validator).toBe(fieldValidators.phoneNumber);
      expect(constraint.maxLength).toBe(20);
    });

    test("should have correct constraints for postalCode", () => {
      const constraint = inputConstraints.postalCode;
      expect(constraint.formatter).toBe(formatters.postalCode);
      expect(constraint.validator).toBe(fieldValidators.postalCode);
      expect(constraint.maxLength).toBe(6);
    });

    test("should have correct constraints for companyName", () => {
      const constraint = inputConstraints.companyName;
      expect(constraint.validator).toBe(fieldValidators.companyName);
      expect(constraint.maxLength).toBe(100);
    });
  });

  describe("useFieldValidation hook - UC1 Real-time Validation", () => {
    test("should format firstName field correctly", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      expect(result.current.formatField("firstName", "John123")).toBe("John");
      expect(result.current.formatField("firstName", "Jane@Doe")).toBe("JaneDoe");
      expect(result.current.formatField("firstName", "Mary Ann")).toBe("Mary Ann");
    });

    test("should format lastName field correctly", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      expect(result.current.formatField("lastName", "Smith123")).toBe("Smith");
      expect(result.current.formatField("lastName", "O'Connor")).toBe("OConnor");
      expect(result.current.formatField("lastName", "Van Der Berg")).toBe("Van Der Berg");
    });

    test("should format phoneNumber field correctly", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      expect(result.current.formatField("phoneNumber", "phone123abc")).toBe("123");
      expect(result.current.formatField("phoneNumber", "+65 9123 4567")).toBe("+65 9123 4567");
      expect(result.current.formatField("phoneNumber", "call-me-123")).toBe("-123");
    });

    test("should format postalCode field correctly", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      expect(result.current.formatField("postalCode", "12ab34cd56")).toBe("123456");
      expect(result.current.formatField("postalCode", "1234567890")).toBe("123456");
      expect(result.current.formatField("postalCode", "postal123code")).toBe("123");
    });

    test("should validate firstName field correctly", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      expect(result.current.validateField("firstName", "John")).toEqual({ isValid: true });
      expect(result.current.validateField("firstName", "J")).toEqual({ 
        isValid: false, 
        message: "Must be at least 2 characters long" 
      });
      expect(result.current.validateField("firstName", "John123")).toEqual({ 
        isValid: false, 
        message: "Can only contain letters and spaces" 
      });
    });

    test("should validate phoneNumber field correctly", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      expect(result.current.validateField("phoneNumber", "91234567")).toEqual({ isValid: true });
      expect(result.current.validateField("phoneNumber", "1234567")).toEqual({ 
        isValid: false, 
        message: "Must be at least 8 characters long" 
      });
      expect(result.current.validateField("phoneNumber", "91234abc")).toEqual({ 
        isValid: false, 
        message: "Can only contain numbers, spaces, dashes, parentheses, and plus sign" 
      });
    });

    test("should validate postalCode field correctly", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      expect(result.current.validateField("postalCode", "123456")).toEqual({ isValid: true });
      expect(result.current.validateField("postalCode", "12345")).toEqual({ 
        isValid: false, 
        message: "Must be exactly 6 digits" 
      });
      expect(result.current.validateField("postalCode", "12345a")).toEqual({ 
        isValid: false, 
        message: "Must be exactly 6 digits" 
      });
    });

    test("should validate companyName field correctly", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      expect(result.current.validateField("companyName", "Test Company")).toEqual({ isValid: true });
      expect(result.current.validateField("companyName", "A")).toEqual({ 
        isValid: false, 
        message: "Must be at least 2 characters long" 
      });
    });

    test("should handle unknown field names gracefully", () => {
      const { result } = renderHook(() => useFieldValidation());
      
      // Should return original value for unknown fields
      expect(result.current.formatField("unknownField", "test123")).toBe("test123");
      
      // Should return valid for unknown fields
      expect(result.current.validateField("unknownField", "anything")).toEqual({ isValid: true });
    });
  });
});
