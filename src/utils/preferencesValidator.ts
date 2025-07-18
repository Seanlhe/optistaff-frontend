import { UserPreferences } from '../types/hooks';

/**
 * Validates user preferences to ensure all required fields are present
 * @param preferences The user preferences object to validate
 * @returns An object containing validation results
 */
export const validatePreferences = (preferences: UserPreferences | null): {
  isValid: boolean;
  missingFields: string[];
  errors: string[];
} => {
  if (!preferences) {
    return {
      isValid: false,
      missingFields: ['preferences'],
      errors: ['No preferences data available']
    };
  }

  const missingFields: string[] = [];
  const errors: string[] = [];

  // Check required fields
  if (preferences.min_pay_rate === undefined) missingFields.push('min_pay_rate');
  if (preferences.max_travel_km === undefined) missingFields.push('max_travel_km');
  if (preferences.desired_roles === undefined) missingFields.push('desired_roles');
  if (preferences.max_hours_per_week === undefined) missingFields.push('max_hours_per_week');
  if (preferences.max_hours_per_shift === undefined) missingFields.push('max_hours_per_shift');
  if (preferences.consider_lower_rate === undefined) missingFields.push('consider_lower_rate');

  // Validate field values
  if (preferences.min_pay_rate !== undefined && preferences.min_pay_rate < 0) {
    errors.push('Minimum pay rate cannot be negative');
  }

  if (preferences.max_travel_km !== undefined && preferences.max_travel_km < 0) {
    errors.push('Maximum travel distance cannot be negative');
  }

  if (preferences.max_hours_per_week !== undefined) {
    if (preferences.max_hours_per_week <= 0) {
      errors.push('Maximum hours per week must be greater than 0');
    } else if (preferences.max_hours_per_week > 44) {
      errors.push('Maximum hours per week cannot exceed 44');
    }
  }

  if (preferences.max_hours_per_shift !== undefined) {
    if (preferences.max_hours_per_shift <= 0) {
      errors.push('Maximum hours per shift must be greater than 0');
    } else if (preferences.max_hours_per_shift > 12) {
      errors.push('Maximum hours per shift cannot exceed 12');
    }
  }

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    errors
  };
};

/**
 * Checks if the preferences schema is up to date with the latest database schema
 * @param preferences The user preferences object to check
 * @returns True if the schema is up to date, false otherwise
 */
export const isPreferencesSchemaUpToDate = (preferences: UserPreferences | null): boolean => {
  if (!preferences) return false;
  
  // Check for all required fields in the latest schema
  return (
    preferences.min_pay_rate !== undefined &&
    preferences.max_travel_km !== undefined &&
    preferences.desired_roles !== undefined &&
    preferences.max_hours_per_week !== undefined &&
    preferences.max_hours_per_shift !== undefined &&
    preferences.consider_lower_rate !== undefined
  );
};