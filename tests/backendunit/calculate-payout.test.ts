/**
 * Calculate Payout - Pure Function Unit Tests
 * @description Tests for payout calculation logic and utilities
 * @testing-strategy Boundary Value Testing (BVT) and Equivalence Class Testing (ECT)
 */

import { describe, test, expect } from "vitest";

// Pure calculation functions extracted for testing
export const payoutCalculationHelpers = {
  /**
   * Calculate hours worked from timestamps
   * @param startTime - Start timestamp
   * @param endTime - End timestamp
   * @returns Hours worked as decimal
   */
  calculateHoursWorked: (startTime: string, endTime: string): number => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
  },

  /**
   * Calculate net hours after break deduction
   * @param totalHours - Total hours worked
   * @param breakHours - Break hours to deduct
   * @returns Net working hours
   */
  calculateNetHours: (totalHours: number, breakHours: number): number => {
    return Math.max(0, totalHours - breakHours);
  },

  /**
   * Calculate gross pay before deductions
   * @param hours - Hours worked
   * @param payRate - Hourly pay rate
   * @returns Gross pay amount
   */
  calculateGrossPay: (hours: number, payRate: number): number => {
    return hours * payRate;
  },

  /**
   * Validate payout calculation inputs
   * @param payRate - Hourly rate
   * @param hours - Hours worked
   * @param breakHours - Break hours
   * @returns Validation result
   */
  validatePayoutInputs: (payRate: number, hours: number, breakHours: number): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (payRate < 0) {
      errors.push("Pay rate cannot be negative");
    }
    if (payRate === 0) {
      errors.push("Pay rate cannot be zero");
    }
    if (hours < 0) {
      errors.push("Hours worked cannot be negative");
    }
    if (breakHours < 0) {
      errors.push("Break hours cannot be negative");
    }
    if (breakHours > hours) {
      errors.push("Break hours cannot exceed total hours worked");
    }
    if (hours > 24) {
      errors.push("Hours worked cannot exceed 24 hours in a day");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format currency for display
   * @param amount - Amount to format
   * @returns Formatted currency string
   */
  formatCurrency: (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  },

  /**
   * Round to nearest cent
   * @param amount - Amount to round
   * @returns Rounded amount
   */
  roundToCents: (amount: number): number => {
    return Math.round(amount * 100) / 100;
  }
};

describe("Calculate Payout - Pure Functions Unit Tests", () => {
  describe("calculateHoursWorked - Boundary Value Testing", () => {
    test("calculates minimum valid duration (1 minute)", () => {
      const { calculateHoursWorked } = payoutCalculationHelpers;
      
      const result = calculateHoursWorked(
        "2025-01-01T09:00:00Z",
        "2025-01-01T09:01:00Z"
      );
      
      expect(result).toBeCloseTo(1/60, 4); // 1 minute = 0.0167 hours
    });

    test("calculates standard work hours (8 hours)", () => {
      const { calculateHoursWorked } = payoutCalculationHelpers;
      
      const result = calculateHoursWorked(
        "2025-01-01T09:00:00Z",
        "2025-01-01T17:00:00Z"
      );
      
      expect(result).toBe(8);
    });

    test("calculates maximum shift hours (12 hours)", () => {
      const { calculateHoursWorked } = payoutCalculationHelpers;
      
      const result = calculateHoursWorked(
        "2025-01-01T08:00:00Z",
        "2025-01-01T20:00:00Z"
      );
      
      expect(result).toBe(12);
    });

    test("handles same start and end time (0 hours)", () => {
      const { calculateHoursWorked } = payoutCalculationHelpers;
      
      const result = calculateHoursWorked(
        "2025-01-01T09:00:00Z",
        "2025-01-01T09:00:00Z"
      );
      
      expect(result).toBe(0);
    });

    test("handles cross-day shifts", () => {
      const { calculateHoursWorked } = payoutCalculationHelpers;
      
      const result = calculateHoursWorked(
        "2025-01-01T22:00:00Z",
        "2025-01-02T06:00:00Z"
      );
      
      expect(result).toBe(8);
    });
  });

  describe("calculateNetHours - Boundary Value Testing", () => {
    test("calculates net hours with no break", () => {
      const { calculateNetHours } = payoutCalculationHelpers;
      
      expect(calculateNetHours(8, 0)).toBe(8);
    });

    test("calculates net hours with standard break (0.5 hours)", () => {
      const { calculateNetHours } = payoutCalculationHelpers;
      
      expect(calculateNetHours(8, 0.5)).toBe(7.5);
    });

    test("calculates net hours with maximum break (1 hour)", () => {
      const { calculateNetHours } = payoutCalculationHelpers;
      
      expect(calculateNetHours(8, 1)).toBe(7);
    });

    test("handles break hours equal to total hours (0 net)", () => {
      const { calculateNetHours } = payoutCalculationHelpers;
      
      expect(calculateNetHours(8, 8)).toBe(0);
    });

    test("prevents negative net hours", () => {
      const { calculateNetHours } = payoutCalculationHelpers;
      
      expect(calculateNetHours(6, 8)).toBe(0); // Should not go negative
    });
  });

  describe("calculateGrossPay - Equivalence Class Testing", () => {
    test("calculates pay for minimum wage equivalent", () => {
      const { calculateGrossPay } = payoutCalculationHelpers;
      
      // Singapore minimum wage considerations
      expect(calculateGrossPay(8, 5)).toBe(40);
    });

    test("calculates pay for standard rate", () => {
      const { calculateGrossPay } = payoutCalculationHelpers;
      
      expect(calculateGrossPay(8, 20)).toBe(160);
    });

    test("calculates pay for premium rate", () => {
      const { calculateGrossPay } = payoutCalculationHelpers;
      
      expect(calculateGrossPay(8, 50)).toBe(400);
    });

    test("handles fractional hours", () => {
      const { calculateGrossPay } = payoutCalculationHelpers;
      
      expect(calculateGrossPay(7.5, 20)).toBe(150);
    });

    test("handles zero hours", () => {
      const { calculateGrossPay } = payoutCalculationHelpers;
      
      expect(calculateGrossPay(0, 20)).toBe(0);
    });
  });

  describe("validatePayoutInputs - Decision Table Testing", () => {
    test("validates all positive inputs", () => {
      const { validatePayoutInputs } = payoutCalculationHelpers;
      
      const result = validatePayoutInputs(20, 8, 0.5);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("rejects negative pay rate", () => {
      const { validatePayoutInputs } = payoutCalculationHelpers;
      
      const result = validatePayoutInputs(-5, 8, 0.5);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Pay rate cannot be negative");
    });

    test("rejects zero pay rate", () => {
      const { validatePayoutInputs } = payoutCalculationHelpers;
      
      const result = validatePayoutInputs(0, 8, 0.5);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Pay rate cannot be zero");
    });

    test("rejects negative hours", () => {
      const { validatePayoutInputs } = payoutCalculationHelpers;
      
      const result = validatePayoutInputs(20, -2, 0.5);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Hours worked cannot be negative");
    });

    test("rejects break hours exceeding total hours", () => {
      const { validatePayoutInputs } = payoutCalculationHelpers;
      
      const result = validatePayoutInputs(20, 6, 8);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Break hours cannot exceed total hours worked");
    });

    test("rejects excessive daily hours", () => {
      const { validatePayoutInputs } = payoutCalculationHelpers;
      
      const result = validatePayoutInputs(20, 25, 1);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Hours worked cannot exceed 24 hours in a day");
    });

    test("accumulates multiple validation errors", () => {
      const { validatePayoutInputs } = payoutCalculationHelpers;
      
      const result = validatePayoutInputs(-5, -2, -1);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });

  describe("formatCurrency - Pure String Transformation", () => {
    test("formats whole dollar amounts", () => {
      const { formatCurrency } = payoutCalculationHelpers;
      
      expect(formatCurrency(100)).toBe("$100.00");
      expect(formatCurrency(0)).toBe("$0.00");
    });

    test("formats decimal amounts", () => {
      const { formatCurrency } = payoutCalculationHelpers;
      
      expect(formatCurrency(123.45)).toBe("$123.45");
      expect(formatCurrency(0.99)).toBe("$0.99");
    });

    test("handles rounding for display", () => {
      const { formatCurrency } = payoutCalculationHelpers;
      
      expect(formatCurrency(123.456)).toBe("$123.46"); // Rounds up
      expect(formatCurrency(123.454)).toBe("$123.45"); // Rounds down
    });
  });

  describe("roundToCents - Boundary Value Testing", () => {
    test("rounds to nearest cent", () => {
      const { roundToCents } = payoutCalculationHelpers;
      
      expect(roundToCents(123.456)).toBe(123.46);
      expect(roundToCents(123.454)).toBe(123.45);
      expect(roundToCents(123.455)).toBe(123.46); // Banker's rounding
    });

    test("handles exact cent values", () => {
      const { roundToCents } = payoutCalculationHelpers;
      
      expect(roundToCents(123.45)).toBe(123.45);
      expect(roundToCents(0.01)).toBe(0.01);
      expect(roundToCents(0.00)).toBe(0.00);
    });

    test("handles very small amounts", () => {
      const { roundToCents } = payoutCalculationHelpers;
      
      expect(roundToCents(0.001)).toBe(0.00);
      expect(roundToCents(0.009)).toBe(0.01);
    });
  });

  describe("Integration - Complete Payout Calculation", () => {
    test("calculates complete payout scenario", () => {
      const {
        calculateHoursWorked,
        calculateNetHours,
        calculateGrossPay,
        validatePayoutInputs,
        roundToCents
      } = payoutCalculationHelpers;

      // Scenario: 8-hour shift with 30-minute break at $20/hour
      const startTime = "2025-01-01T09:00:00Z";
      const endTime = "2025-01-01T17:00:00Z";
      const payRate = 20;
      const breakHours = 0.5;

      // Step 1: Calculate total hours
      const totalHours = calculateHoursWorked(startTime, endTime);
      expect(totalHours).toBe(8);

      // Step 2: Validate inputs
      const validation = validatePayoutInputs(payRate, totalHours, breakHours);
      expect(validation.isValid).toBe(true);

      // Step 3: Calculate net hours
      const netHours = calculateNetHours(totalHours, breakHours);
      expect(netHours).toBe(7.5);

      // Step 4: Calculate gross pay
      const grossPay = calculateGrossPay(netHours, payRate);
      expect(grossPay).toBe(150);

      // Step 5: Round to cents
      const finalPay = roundToCents(grossPay);
      expect(finalPay).toBe(150.00);
    });
  });
});