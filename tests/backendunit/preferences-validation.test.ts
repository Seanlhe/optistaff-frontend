/**
 * Preferences Validation - Pure Function Unit Tests
 * @description Tests for preferences validation logic and helper functions
 * @testing-strategy Boundary Value Testing (BVT) and Equivalence Class Testing (ECT)
 */

import { describe, test, expect } from "vitest";
import { validatePreferences } from "../../src/utils/preferencesValidator";
import { UserPreferences } from "../../src/types/hooks";

// Pure helper functions extracted for testing
export const preferencesHelpers = {
  /**
   * Check if pay rate is within reasonable Singapore range
   * @param payRate - Hourly pay rate
   * @returns Boolean indicating if rate is reasonable
   */
  isReasonablePayRate: (payRate: number): boolean => {
    return payRate >= 5 && payRate <= 100;
  },

  /**
   * Check if travel distance is reasonable for Singapore
   * @param distance - Distance in kilometers
   * @returns Boolean indicating if distance is reasonable
   */
  isReasonableTravelDistance: (distance: number): boolean => {
    return distance >= 0 && distance <= 100;
  },

  /**
   * Validate Singapore labor law compliance for work hours
   * @param hoursPerWeek - Maximum hours per week
   * @param hoursPerShift - Maximum hours per shift
   * @returns Validation result
   */
  validateLaborLawCompliance: (hoursPerWeek: number, hoursPerShift: number): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (hoursPerWeek > 44) {
      errors.push("Maximum hours per week cannot exceed 44 (Singapore labor law)");
    }
    if (hoursPerShift > 12) {
      errors.push("Maximum hours per shift cannot exceed 12 (Singapore labor law)");
    }
    if (hoursPerShift > hoursPerWeek) {
      errors.push("Maximum hours per shift cannot exceed maximum hours per week");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Normalize job role names for comparison
   * @param roles - Array of job role names
   * @returns Normalized role names
   */
  normalizeJobRoles: (roles: string[]): string[] => {
    return roles.map(role => role.trim().toLowerCase());
  },

  /**
   * Check if job roles array has duplicates
   * @param roles - Array of job role names
   * @returns Boolean indicating if duplicates exist
   */
  hasDuplicateRoles: (roles: string[]): boolean => {
    const normalized = preferencesHelpers.normalizeJobRoles(roles);
    return normalized.length !== new Set(normalized).size;
  },

  /**
   * Calculate weekly earning potential
   * @param payRate - Hourly pay rate
   * @param hoursPerWeek - Maximum hours per week
   * @returns Weekly earning potential
   */
  calculateWeeklyEarningPotential: (payRate: number, hoursPerWeek: number): number => {
    return payRate * hoursPerWeek;
  },

  /**
   * Validate preference consistency
   * @param preferences - User preferences object
   * @returns Consistency validation result
   */
  validatePreferenceConsistency: (preferences: Partial<UserPreferences>): {
    isValid: boolean;
    warnings: string[];
  } => {
    const warnings: string[] = [];

    // Check if considering lower rate makes sense with current minimum
    if (preferences.consider_lower_rate && preferences.min_pay_rate && preferences.min_pay_rate < 10) {
      warnings.push("Consider lower rate option may not be beneficial with already low minimum rate");
    }

    // Check if travel distance vs hours makes sense
    if (preferences.max_travel_km && preferences.max_travel_km > 50 && 
        preferences.max_hours_per_week && preferences.max_hours_per_week < 20) {
      warnings.push("High travel distance with low weekly hours may not be cost-effective");
    }

    // Check if shift hours vs weekly hours ratio is reasonable
    if (preferences.max_hours_per_shift && preferences.max_hours_per_week &&
        preferences.max_hours_per_shift > preferences.max_hours_per_week * 0.6) {
      warnings.push("Long shifts relative to weekly hours may limit job opportunities");
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
};

describe("Preferences Validation - Pure Functions Unit Tests", () => {
  const baseValidPreferences: UserPreferences = {
    user_id: "test-user-id",
    min_pay_rate: 20,
    max_travel_km: 15,
    desired_roles: ["Waiter/Waitress"],
    max_hours_per_week: 40,
    max_hours_per_shift: 8,
    consider_lower_rate: false,
  };

  describe("validatePreferences - Boundary Value Testing", () => {
    test("validates minimum pay rate boundary (positive)", () => {
      const result = validatePreferences({
        ...baseValidPreferences,
        min_pay_rate: 5, // Minimum reasonable rate
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("warns about very low pay rate", () => {
      const result = validatePreferences({
        ...baseValidPreferences,
        min_pay_rate: 3, // Below reasonable minimum
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Minimum pay rate seems too low (Singapore minimum wage considerations)",
      );
    });

    test("rejects negative pay rate", () => {
      const result = validatePreferences({
        ...baseValidPreferences,
        min_pay_rate: -5,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Minimum pay rate cannot be negative");
    });

    test("validates minimum travel distance (0 km)", () => {
      const result = validatePreferences({
        ...baseValidPreferences,
        max_travel_km: 0,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("rejects negative travel distance", () => {
      const result = validatePreferences({
        ...baseValidPreferences,
        max_travel_km: -1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Maximum travel distance cannot be negative",
      );
    });

    test("validates maximum hours per week (44 hours)", () => {
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_week: 44,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("rejects hours per week over limit (45 hours)", () => {
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_week: 45,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Maximum hours per week cannot exceed 44 (Singapore labor law)",
      );
    });

    test("validates maximum hours per shift (12 hours)", () => {
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_shift: 12,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("rejects hours per shift over limit (13 hours)", () => {
      const result = validatePreferences({
        ...baseValidPreferences,
        max_hours_per_shift: 13,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Maximum hours per shift cannot exceed 12 (Singapore labor law)",
      );
    });
  });

  describe("isReasonablePayRate - Equivalence Class Testing", () => {
    test("accepts reasonable pay rates", () => {
      const { isReasonablePayRate } = preferencesHelpers;
      
      expect(isReasonablePayRate(15)).toBe(true);  // Standard rate
      expect(isReasonablePayRate(25)).toBe(true);  // Good rate
      expect(isReasonablePayRate(50)).toBe(true);  // Premium rate
    });

    test("rejects unreasonably low rates", () => {
      const { isReasonablePayRate } = preferencesHelpers;
      
      expect(isReasonablePayRate(2)).toBe(false);   // Too low
      expect(isReasonablePayRate(0)).toBe(false);   // Zero
      expect(isReasonablePayRate(-5)).toBe(false);  // Negative
    });

    test("rejects unreasonably high rates", () => {
      const { isReasonablePayRate } = preferencesHelpers;
      
      expect(isReasonablePayRate(150)).toBe(false); // Too high
      expect(isReasonablePayRate(500)).toBe(false); // Extremely high
    });

    test("handles boundary values", () => {
      const { isReasonablePayRate } = preferencesHelpers;
      
      expect(isReasonablePayRate(5)).toBe(true);    // Min boundary
      expect(isReasonablePayRate(100)).toBe(true);  // Max boundary
      expect(isReasonablePayRate(4.99)).toBe(false); // Just below min
      expect(isReasonablePayRate(100.01)).toBe(false); // Just above max
    });
  });

  describe("isReasonableTravelDistance - Boundary Value Testing", () => {
    test("accepts reasonable travel distances", () => {
      const { isReasonableTravelDistance } = preferencesHelpers;
      
      expect(isReasonableTravelDistance(0)).toBe(true);   // No travel
      expect(isReasonableTravelDistance(10)).toBe(true);  // Short distance
      expect(isReasonableTravelDistance(25)).toBe(true);  // Medium distance
      expect(isReasonableTravelDistance(50)).toBe(true);  // Long distance
    });

    test("rejects unreasonable distances", () => {
      const { isReasonableTravelDistance } = preferencesHelpers;
      
      expect(isReasonableTravelDistance(-1)).toBe(false);  // Negative
      expect(isReasonableTravelDistance(150)).toBe(false); // Too far for Singapore
      expect(isReasonableTravelDistance(1000)).toBe(false); // Extremely far
    });

    test("handles boundary values", () => {
      const { isReasonableTravelDistance } = preferencesHelpers;
      
      expect(isReasonableTravelDistance(100)).toBe(true);   // Max boundary
      expect(isReasonableTravelDistance(100.1)).toBe(false); // Just above max
    });
  });

  describe("validateLaborLawCompliance - Decision Table Testing", () => {
    test("validates compliant work hours", () => {
      const { validateLaborLawCompliance } = preferencesHelpers;
      
      const result = validateLaborLawCompliance(40, 8);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("rejects excessive weekly hours", () => {
      const { validateLaborLawCompliance } = preferencesHelpers;
      
      const result = validateLaborLawCompliance(50, 8);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Maximum hours per week cannot exceed 44 (Singapore labor law)"
      );
    });

    test("rejects excessive shift hours", () => {
      const { validateLaborLawCompliance } = preferencesHelpers;
      
      const result = validateLaborLawCompliance(40, 15);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Maximum hours per shift cannot exceed 12 (Singapore labor law)"
      );
    });

    test("rejects shift hours exceeding weekly hours", () => {
      const { validateLaborLawCompliance } = preferencesHelpers;
      
      const result = validateLaborLawCompliance(20, 25);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Maximum hours per shift cannot exceed maximum hours per week"
      );
    });

    test("accumulates multiple violations", () => {
      const { validateLaborLawCompliance } = preferencesHelpers;
      
      const result = validateLaborLawCompliance(50, 15);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe("normalizeJobRoles - Pure String Transformation", () => {
    test("normalizes role names", () => {
      const { normalizeJobRoles } = preferencesHelpers;
      
      const input = ["  Waiter/Waitress  ", "KITCHEN Helper", "Cashier"];
      const expected = ["waiter/waitress", "kitchen helper", "cashier"];
      
      expect(normalizeJobRoles(input)).toEqual(expected);
    });

    test("handles empty array", () => {
      const { normalizeJobRoles } = preferencesHelpers;
      
      expect(normalizeJobRoles([])).toEqual([]);
    });

    test("handles special characters", () => {
      const { normalizeJobRoles } = preferencesHelpers;
      
      const input = ["Server/Host", "Kitchen-Helper", "Front-Desk"];
      const expected = ["server/host", "kitchen-helper", "front-desk"];
      
      expect(normalizeJobRoles(input)).toEqual(expected);
    });
  });

  describe("hasDuplicateRoles - Equivalence Class Testing", () => {
    test("detects no duplicates", () => {
      const { hasDuplicateRoles } = preferencesHelpers;
      
      const roles = ["Waiter", "Kitchen Helper", "Cashier"];
      expect(hasDuplicateRoles(roles)).toBe(false);
    });

    test("detects exact duplicates", () => {
      const { hasDuplicateRoles } = preferencesHelpers;
      
      const roles = ["Waiter", "Kitchen Helper", "Waiter"];
      expect(hasDuplicateRoles(roles)).toBe(true);
    });

    test("detects case-insensitive duplicates", () => {
      const { hasDuplicateRoles } = preferencesHelpers;
      
      const roles = ["Waiter", "WAITER", "Kitchen Helper"];
      expect(hasDuplicateRoles(roles)).toBe(true);
    });

    test("detects whitespace duplicates", () => {
      const { hasDuplicateRoles } = preferencesHelpers;
      
      const roles = ["Waiter", "  waiter  ", "Kitchen Helper"];
      expect(hasDuplicateRoles(roles)).toBe(true);
    });

    test("handles empty array", () => {
      const { hasDuplicateRoles } = preferencesHelpers;
      
      expect(hasDuplicateRoles([])).toBe(false);
    });
  });

  describe("calculateWeeklyEarningPotential - Pure Calculation", () => {
    test("calculates standard earning potential", () => {
      const { calculateWeeklyEarningPotential } = preferencesHelpers;
      
      expect(calculateWeeklyEarningPotential(20, 40)).toBe(800);
    });

    test("calculates part-time earning potential", () => {
      const { calculateWeeklyEarningPotential } = preferencesHelpers;
      
      expect(calculateWeeklyEarningPotential(25, 20)).toBe(500);
    });

    test("handles zero values", () => {
      const { calculateWeeklyEarningPotential } = preferencesHelpers;
      
      expect(calculateWeeklyEarningPotential(0, 40)).toBe(0);
      expect(calculateWeeklyEarningPotential(20, 0)).toBe(0);
    });

    test("handles fractional values", () => {
      const { calculateWeeklyEarningPotential } = preferencesHelpers;
      
      expect(calculateWeeklyEarningPotential(22.5, 37.5)).toBe(843.75);
    });
  });

  describe("validatePreferenceConsistency - Complex Logic Testing", () => {
    test("validates consistent preferences", () => {
      const { validatePreferenceConsistency } = preferencesHelpers;
      
      const preferences = {
        min_pay_rate: 20,
        max_travel_km: 25,
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      const result = validatePreferenceConsistency(preferences);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    test("warns about low rate with consider lower option", () => {
      const { validatePreferenceConsistency } = preferencesHelpers;
      
      const preferences = {
        min_pay_rate: 8,
        consider_lower_rate: true
      };
      
      const result = validatePreferenceConsistency(preferences);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        "Consider lower rate option may not be beneficial with already low minimum rate"
      );
    });

    test("warns about high travel with low hours", () => {
      const { validatePreferenceConsistency } = preferencesHelpers;
      
      const preferences = {
        max_travel_km: 60,
        max_hours_per_week: 15
      };
      
      const result = validatePreferenceConsistency(preferences);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        "High travel distance with low weekly hours may not be cost-effective"
      );
    });

    test("warns about long shifts relative to weekly hours", () => {
      const { validatePreferenceConsistency } = preferencesHelpers;
      
      const preferences = {
        max_hours_per_week: 20,
        max_hours_per_shift: 15 // 75% of weekly hours
      };
      
      const result = validatePreferenceConsistency(preferences);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        "Long shifts relative to weekly hours may limit job opportunities"
      );
    });
  });

  describe("Integration - Complete Validation Scenarios", () => {
    test("validates perfect preferences", () => {
      const perfectPreferences: UserPreferences = {
        user_id: "test-user",
        min_pay_rate: 25,
        max_travel_km: 20,
        desired_roles: ["Waiter/Waitress", "Kitchen Helper"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false,
      };

      const result = validatePreferences(perfectPreferences);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("accumulates multiple validation errors", () => {
      const invalidPreferences: UserPreferences = {
        user_id: "test-user",
        min_pay_rate: -5,        // Invalid - negative
        max_travel_km: -10,      // Invalid - negative
        desired_roles: [],       // Invalid - empty
        max_hours_per_week: 50,  // Invalid - over limit
        max_hours_per_shift: 15, // Invalid - over limit
        consider_lower_rate: false,
      };

      const result = validatePreferences(invalidPreferences);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(4);
    });
  });
});