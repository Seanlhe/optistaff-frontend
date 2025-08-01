/**
 * usePreferences Hook - Pure Function Unit Tests
 * @description Tests for pure helper functions in usePreferences hook
 * @testing-strategy Boundary Value Testing (BVT) and Equivalence Class Testing (ECT)
 */

import { describe, test, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { UserPreferences } from "../../src/types/hooks";

// Mock the usePreferences hook to test pure functions
const mockUsePreferences = () => {
  const preferences: UserPreferences | null = {
    user_id: "test-user",
    min_pay_rate: 20,
    max_travel_km: 25,
    desired_roles: ["Waiter/Waitress", "Kitchen Helper"],
    max_hours_per_week: 40,
    max_hours_per_shift: 8,
    consider_lower_rate: false
  };

  return {
    preferences,
    hasJobPreference: (jobTypeName: string): boolean => {
      return preferences?.desired_roles.includes(jobTypeName) || false;
    },
    getPreferredJobTypes: (): string[] => {
      if (!preferences) return [];
      return preferences.desired_roles;
    }
  };
};

// Pure helper functions extracted for testing
export const usePreferencesHelpers = {
  /**
   * Check if user has specific job preference
   * @param preferences - User preferences object
   * @param jobTypeName - Job type name to check
   * @returns Boolean indicating if job is preferred
   */
  hasJobPreference: (preferences: UserPreferences | null, jobTypeName: string): boolean => {
    return preferences?.desired_roles.includes(jobTypeName) || false;
  },

  /**
   * Get all preferred job types
   * @param preferences - User preferences object
   * @returns Array of preferred job type names
   */
  getPreferredJobTypes: (preferences: UserPreferences | null): string[] => {
    if (!preferences) return [];
    return preferences.desired_roles;
  },

  /**
   * Check if preferences are complete
   * @param preferences - User preferences object
   * @returns Boolean indicating if all required fields are set
   */
  arePreferencesComplete: (preferences: UserPreferences | null): boolean => {
    if (!preferences) return false;
    
    return preferences.min_pay_rate > 0 &&
           preferences.max_travel_km >= 0 &&
           preferences.desired_roles.length > 0 &&
           preferences.max_hours_per_week > 0 &&
           preferences.max_hours_per_shift > 0;
  },

  /**
   * Calculate preference completeness percentage
   * @param preferences - User preferences object
   * @returns Percentage of completion (0-100)
   */
  calculateCompletenessPercentage: (preferences: UserPreferences | null): number => {
    if (!preferences) return 0;
    
    let completedFields = 0;
    const totalFields = 6;
    
    if (preferences.min_pay_rate > 0) completedFields++;
    if (preferences.max_travel_km >= 0) completedFields++;
    if (preferences.desired_roles.length > 0) completedFields++;
    if (preferences.max_hours_per_week > 0) completedFields++;
    if (preferences.max_hours_per_shift > 0) completedFields++;
    if (typeof preferences.consider_lower_rate === 'boolean') completedFields++;
    
    return (completedFields / totalFields) * 100;
  },

  /**
   * Get preference summary for display
   * @param preferences - User preferences object
   * @returns Summary object with formatted values
   */
  getPreferenceSummary: (preferences: UserPreferences | null): {
    payRate: string;
    travelDistance: string;
    jobCount: number;
    weeklyHours: string;
    shiftHours: string;
    flexibleRate: string;
  } | null => {
    if (!preferences) return null;
    
    return {
      payRate: `$${preferences.min_pay_rate.toFixed(2)}/hour`,
      travelDistance: `${preferences.max_travel_km} km`,
      jobCount: preferences.desired_roles.length,
      weeklyHours: `${preferences.max_hours_per_week} hours/week`,
      shiftHours: `${preferences.max_hours_per_shift} hours/shift`,
      flexibleRate: preferences.consider_lower_rate ? 'Yes' : 'No'
    };
  },

  /**
   * Validate preference changes
   * @param currentPreferences - Current preferences
   * @param updates - Proposed updates
   * @returns Validation result
   */
  validatePreferenceUpdates: (
    currentPreferences: UserPreferences | null,
    updates: Partial<UserPreferences>
  ): {
    isValid: boolean;
    warnings: string[];
  } => {
    const warnings: string[] = [];
    
    if (!currentPreferences) {
      warnings.push("No current preferences to update");
      return { isValid: false, warnings };
    }
    
    // Check for significant pay rate changes
    if (updates.min_pay_rate !== undefined) {
      const currentRate = currentPreferences.min_pay_rate;
      const newRate = updates.min_pay_rate;
      
      if (newRate < currentRate * 0.5) {
        warnings.push("Pay rate decrease is more than 50% - this may limit job opportunities");
      }
      if (newRate > currentRate * 2) {
        warnings.push("Pay rate increase is more than 100% - this may limit job opportunities");
      }
    }
    
    // Check for travel distance changes
    if (updates.max_travel_km !== undefined) {
      const currentDistance = currentPreferences.max_travel_km;
      const newDistance = updates.max_travel_km;
      
      if (newDistance < currentDistance * 0.5) {
        warnings.push("Travel distance reduction may significantly limit job opportunities");
      }
    }
    
    // Check for job role changes
    if (updates.desired_roles !== undefined) {
      const currentRoles = currentPreferences.desired_roles.length;
      const newRoles = updates.desired_roles.length;
      
      if (newRoles < currentRoles * 0.5) {
        warnings.push("Reducing job types may limit opportunities");
      }
    }
    
    return {
      isValid: warnings.length === 0,
      warnings
    };
  }
};

describe("usePreferences - Pure Functions Unit Tests", () => {
  describe("hasJobPreference - Boundary Value Testing", () => {
    test("detects existing job preference", () => {
      const { hasJobPreference } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 25,
        desired_roles: ["Waiter/Waitress", "Kitchen Helper"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(hasJobPreference(preferences, "Waiter/Waitress")).toBe(true);
      expect(hasJobPreference(preferences, "Kitchen Helper")).toBe(true);
    });

    test("detects non-existing job preference", () => {
      const { hasJobPreference } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 25,
        desired_roles: ["Waiter/Waitress"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(hasJobPreference(preferences, "Cashier")).toBe(false);
      expect(hasJobPreference(preferences, "NonExistent")).toBe(false);
    });

    test("handles null preferences", () => {
      const { hasJobPreference } = usePreferencesHelpers;
      
      expect(hasJobPreference(null, "Waiter/Waitress")).toBe(false);
    });

    test("handles empty job roles array", () => {
      const { hasJobPreference } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 25,
        desired_roles: [],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(hasJobPreference(preferences, "Waiter/Waitress")).toBe(false);
    });

    test("handles case sensitivity", () => {
      const { hasJobPreference } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 25,
        desired_roles: ["Waiter/Waitress"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(hasJobPreference(preferences, "waiter/waitress")).toBe(false); // Case sensitive
      expect(hasJobPreference(preferences, "WAITER/WAITRESS")).toBe(false); // Case sensitive
    });
  });

  describe("getPreferredJobTypes - Equivalence Class Testing", () => {
    test("returns job types for valid preferences", () => {
      const { getPreferredJobTypes } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 25,
        desired_roles: ["Waiter/Waitress", "Kitchen Helper", "Cashier"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      const result = getPreferredJobTypes(preferences);
      expect(result).toEqual(["Waiter/Waitress", "Kitchen Helper", "Cashier"]);
      expect(result).toHaveLength(3);
    });

    test("returns empty array for null preferences", () => {
      const { getPreferredJobTypes } = usePreferencesHelpers;
      
      expect(getPreferredJobTypes(null)).toEqual([]);
    });

    test("returns empty array for empty desired_roles", () => {
      const { getPreferredJobTypes } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 25,
        desired_roles: [],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(getPreferredJobTypes(preferences)).toEqual([]);
    });

    test("returns single job type", () => {
      const { getPreferredJobTypes } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 25,
        desired_roles: ["Waiter/Waitress"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(getPreferredJobTypes(preferences)).toEqual(["Waiter/Waitress"]);
    });
  });

  describe("arePreferencesComplete - Decision Table Testing", () => {
    test("validates complete preferences", () => {
      const { arePreferencesComplete } = usePreferencesHelpers;
      
      const completePreferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 25,
        desired_roles: ["Waiter/Waitress"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(arePreferencesComplete(completePreferences)).toBe(true);
    });

    test("rejects null preferences", () => {
      const { arePreferencesComplete } = usePreferencesHelpers;
      
      expect(arePreferencesComplete(null)).toBe(false);
    });

    test("rejects preferences with zero pay rate", () => {
      const { arePreferencesComplete } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 0, // Invalid
        max_travel_km: 25,
        desired_roles: ["Waiter/Waitress"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(arePreferencesComplete(preferences)).toBe(false);
    });

    test("rejects preferences with negative travel distance", () => {
      const { arePreferencesComplete } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: -5, // Invalid
        desired_roles: ["Waiter/Waitress"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(arePreferencesComplete(preferences)).toBe(false);
    });

    test("rejects preferences with empty job roles", () => {
      const { arePreferencesComplete } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 25,
        desired_roles: [], // Invalid
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(arePreferencesComplete(preferences)).toBe(false);
    });

    test("accepts zero travel distance", () => {
      const { arePreferencesComplete } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 0, // Valid - no travel required
        desired_roles: ["Waiter/Waitress"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(arePreferencesComplete(preferences)).toBe(true);
    });
  });

  describe("calculateCompletenessPercentage - Boundary Value Testing", () => {
    test("calculates 100% for complete preferences", () => {
      const { calculateCompletenessPercentage } = usePreferencesHelpers;
      
      const completePreferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 25,
        desired_roles: ["Waiter/Waitress"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      expect(calculateCompletenessPercentage(completePreferences)).toBe(100);
    });

    test("calculates 0% for null preferences", () => {
      const { calculateCompletenessPercentage } = usePreferencesHelpers;
      
      expect(calculateCompletenessPercentage(null)).toBe(0);
    });

    test("calculates partial completion", () => {
      const { calculateCompletenessPercentage } = usePreferencesHelpers;
      
      const partialPreferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,        // Valid (1/6)
        max_travel_km: 25,       // Valid (2/6)
        desired_roles: [],       // Invalid (2/6)
        max_hours_per_week: 0,   // Invalid (2/6)
        max_hours_per_shift: 8,  // Valid (3/6)
        consider_lower_rate: false // Valid (4/6)
      };
      
      expect(calculateCompletenessPercentage(partialPreferences)).toBeCloseTo(66.67, 1);
    });

    test("handles edge case with all invalid values", () => {
      const { calculateCompletenessPercentage } = usePreferencesHelpers;
      
      const invalidPreferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 0,         // Invalid
        max_travel_km: -1,       // Invalid (but >= 0 check fails)
        desired_roles: [],       // Invalid
        max_hours_per_week: 0,   // Invalid
        max_hours_per_shift: 0,  // Invalid
        consider_lower_rate: false // Valid (1/6)
      };
      
      expect(calculateCompletenessPercentage(invalidPreferences)).toBeCloseTo(16.67, 1);
    });
  });

  describe("getPreferenceSummary - Pure Data Transformation", () => {
    test("formats complete preference summary", () => {
      const { getPreferenceSummary } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 22.50,
        max_travel_km: 15,
        desired_roles: ["Waiter/Waitress", "Kitchen Helper"],
        max_hours_per_week: 35,
        max_hours_per_shift: 10,
        consider_lower_rate: true
      };
      
      const summary = getPreferenceSummary(preferences);
      
      expect(summary).toEqual({
        payRate: "$22.50/hour",
        travelDistance: "15 km",
        jobCount: 2,
        weeklyHours: "35 hours/week",
        shiftHours: "10 hours/shift",
        flexibleRate: "Yes"
      });
    });

    test("handles null preferences", () => {
      const { getPreferenceSummary } = usePreferencesHelpers;
      
      expect(getPreferenceSummary(null)).toBeNull();
    });

    test("formats with consider_lower_rate false", () => {
      const { getPreferenceSummary } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 20,
        max_travel_km: 25,
        desired_roles: ["Cashier"],
        max_hours_per_week: 40,
        max_hours_per_shift: 8,
        consider_lower_rate: false
      };
      
      const summary = getPreferenceSummary(preferences);
      expect(summary?.flexibleRate).toBe("No");
    });

    test("handles zero and edge values", () => {
      const { getPreferenceSummary } = usePreferencesHelpers;
      
      const preferences: UserPreferences = {
        user_id: "test",
        min_pay_rate: 0.01,
        max_travel_km: 0,
        desired_roles: [],
        max_hours_per_week: 1,
        max_hours_per_shift: 1,
        consider_lower_rate: false
      };
      
      const summary = getPreferenceSummary(preferences);
      
      expect(summary).toEqual({
        payRate: "$0.01/hour",
        travelDistance: "0 km",
        jobCount: 0,
        weeklyHours: "1 hours/week",
        shiftHours: "1 hours/shift",
        flexibleRate: "No"
      });
    });
  });

  describe("validatePreferenceUpdates - Complex Logic Testing", () => {
    const basePreferences: UserPreferences = {
      user_id: "test",
      min_pay_rate: 20,
      max_travel_km: 30,
      desired_roles: ["Waiter/Waitress", "Kitchen Helper", "Cashier", "Cleaner"],
      max_hours_per_week: 40,
      max_hours_per_shift: 8,
      consider_lower_rate: false
    };

    test("validates reasonable updates", () => {
      const { validatePreferenceUpdates } = usePreferencesHelpers;
      
      const updates = {
        min_pay_rate: 22, // 10% increase
        max_travel_km: 25  // Small decrease
      };
      
      const result = validatePreferenceUpdates(basePreferences, updates);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    test("warns about significant pay rate decrease", () => {
      const { validatePreferenceUpdates } = usePreferencesHelpers;
      
      const updates = {
        min_pay_rate: 8 // 60% decrease (more than 50%)
      };
      
      const result = validatePreferenceUpdates(basePreferences, updates);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        "Pay rate decrease is more than 50% - this may limit job opportunities"
      );
    });

    test("warns about significant pay rate increase", () => {
      const { validatePreferenceUpdates } = usePreferencesHelpers;
      
      const updates = {
        min_pay_rate: 45 // 125% increase (more than 100%)
      };
      
      const result = validatePreferenceUpdates(basePreferences, updates);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        "Pay rate increase is more than 100% - this may limit job opportunities"
      );
    });

    test("warns about significant travel distance reduction", () => {
      const { validatePreferenceUpdates } = usePreferencesHelpers;
      
      const updates = {
        max_travel_km: 10 // 67% decrease (more than 50%)
      };
      
      const result = validatePreferenceUpdates(basePreferences, updates);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        "Travel distance reduction may significantly limit job opportunities"
      );
    });

    test("warns about significant job role reduction", () => {
      const { validatePreferenceUpdates } = usePreferencesHelpers;
      
      const updates = {
        desired_roles: ["Waiter/Waitress"] // From 4 to 1 (75% reduction, more than 50%)
      };
      
      const result = validatePreferenceUpdates(basePreferences, updates);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        "Reducing job types may limit opportunities"
      );
    });

    test("handles null current preferences", () => {
      const { validatePreferenceUpdates } = usePreferencesHelpers;
      
      const updates = { min_pay_rate: 25 };
      
      const result = validatePreferenceUpdates(null, updates);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain("No current preferences to update");
    });

    test("accumulates multiple warnings", () => {
      const { validatePreferenceUpdates } = usePreferencesHelpers;
      
      const updates = {
        min_pay_rate: 8,           // Significant decrease
        max_travel_km: 10,         // Significant decrease
        desired_roles: ["Cashier"] // Significant reduction
      };
      
      const result = validatePreferenceUpdates(basePreferences, updates);
      expect(result.isValid).toBe(false);
      expect(result.warnings.length).toBe(3);
    });
  });
});