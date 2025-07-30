import { UserPreferences } from "../types/hooks";

/**
 * Validates user preferences business rules
 * @param preferences The user preferences object to validate
 * @returns An object containing validation results
 */
export const validatePreferences = (
  preferences: UserPreferences,
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validate business rules only (TypeScript handles required fields)
  if (preferences.min_pay_rate < 0) {
    errors.push("Minimum pay rate cannot be negative");
  }

  if (preferences.max_travel_km < 0) {
    errors.push("Maximum travel distance cannot be negative");
  }

  if (preferences.max_hours_per_week <= 0) {
    errors.push("Maximum hours per week must be greater than 0");
  } else if (preferences.max_hours_per_week > 44) {
    errors.push(
      "Maximum hours per week cannot exceed 44 (Singapore labor law)",
    );
  }

  if (preferences.max_hours_per_shift <= 0) {
    errors.push("Maximum hours per shift must be greater than 0");
  } else if (preferences.max_hours_per_shift > 12) {
    errors.push(
      "Maximum hours per shift cannot exceed 12 (Singapore labor law)",
    );
  }

  // Validate logical consistency
  if (preferences.max_hours_per_shift > preferences.max_hours_per_week) {
    errors.push("Maximum hours per shift cannot exceed maximum hours per week");
  }

  // Validate pay rate reasonableness (Singapore context)
  if (preferences.min_pay_rate > 0 && preferences.min_pay_rate < 5) {
    errors.push(
      "Minimum pay rate seems too low (Singapore minimum wage considerations)",
    );
  } else if (preferences.min_pay_rate > 100) {
    errors.push("Minimum pay rate seems unreasonably high");
  }

  // Validate travel distance reasonableness
  if (preferences.max_travel_km > 100) {
    errors.push(
      "Maximum travel distance seems unreasonably high for Singapore",
    );
  }

  // Validate that at least one job type is selected
  if (!preferences.desired_roles || preferences.desired_roles.length === 0) {
    errors.push("Please select at least one preferred job type");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
