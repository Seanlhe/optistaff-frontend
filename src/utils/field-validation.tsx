/**
 * Field-level validation u  // Check name validity in real-time
  name: (value: string): { isValid: boolean; message?: string } => {
    if (!value.trim()) {
      return { isValid: false, message: "Must be at least 2 characters long" };
    }
    if (value.length < 2) {
      return { isValid: false, message: "Must be at least 2 characters long" };
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return { isValid: false, message: "Can only contain letters and spaces" };
    }
    return { isValid: true };
  },real-time input validation
 * These complement the business logic validation in authentication.tsx
 */

// Input formatters and sanitizers
export const formatters = {
  // Only allow alphabetic characters and spaces for names
  nameOnly: (value: string): string => {
    return value.replace(/[^a-zA-Z\s]/g, '');
  },

  // Only allow numeric characters for phone numbers
  phoneNumber: (value: string): string => {
    return value.replace(/[^\d+\-\s()]/g, '').replace(/-+/g, '-');
  },

  // Only allow numeric characters for postal codes and limit to 6 digits
  postalCode: (value: string): string => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    return digitsOnly.substring(0, 6); // Limit to 6 digits
  },

  // Email formatting (basic cleanup)
  email: (value: string): string => {
    return value.trim().toLowerCase();
  }
};

// Real-time field validators
export const fieldValidators = {
  // Check if name field has valid characters and length
  name: (value: string): { isValid: boolean; message?: string } => {
    if (!value.trim()) {
      return { isValid: false, message: "Must be at least 2 characters long" };
    }
    if (value.length < 2) {
      return { isValid: false, message: "Must be at least 2 characters long" };
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return { isValid: false, message: "Can only contain letters and spaces" };
    }
    return { isValid: true };
  },

  // Check phone number format as user types
  phoneNumber: (value: string): { isValid: boolean; message?: string } => {
    if (!value.trim()) {
      return { isValid: false, message: "Must be at least 8 characters long" };
    }
    if (value.length < 8) {
      return { isValid: false, message: "Must be at least 8 characters long" };
    }
    if (!/^[+]?[\d\s\-()]+$/.test(value)) {
      return { isValid: false, message: "Can only contain numbers, spaces, dashes, parentheses, and plus sign" };
    }
    return { isValid: true };
  },

  // Check postal code format
  postalCode: (value: string): { isValid: boolean; message?: string } => {
    if (!value.trim()) {
      return { isValid: false, message: "Must be exactly 6 digits" };
    }
    if (!/^[0-9]{6}$/.test(value)) {
      return { isValid: false, message: "Must be exactly 6 digits" };
    }
    return { isValid: true };
  },

  // Company name validation
  companyName: (value: string): { isValid: boolean; message?: string } => {
    if (!value.trim()) {
      return { isValid: false, message: "Must be at least 2 characters long" };
    }
    if (value.length < 2) {
      return { isValid: false, message: "Must be at least 2 characters long" };
    }
    return { isValid: true };
  }
};

// Input constraints for different field types
interface FieldConstraint {
  maxLength: number;
  pattern?: string;
  formatter?: (value: string) => string;
  validator?: (value: string) => { isValid: boolean; message?: string };
}

export const inputConstraints: Record<string, FieldConstraint> = {
  firstName: {
    maxLength: 50,
    pattern: "[a-zA-Z\\s]*",
    formatter: formatters.nameOnly,
    validator: fieldValidators.name
  },
  lastName: {
    maxLength: 50,
    pattern: "[a-zA-Z\\s]*",
    formatter: formatters.nameOnly,
    validator: fieldValidators.name
  },
  phoneNumber: {
    maxLength: 20,
    pattern: "[\\d+\\-\\s()]*",
    formatter: formatters.phoneNumber,
    validator: fieldValidators.phoneNumber
  },
  postalCode: {
    maxLength: 6,
    pattern: "[0-9]*",
    formatter: formatters.postalCode,
    validator: fieldValidators.postalCode
  },
  address: {
    maxLength: 200,
    validator: (value: string) => {
      if (!value.trim()) {
        return { isValid: false, message: "Address is required" };
      }
      if (value.length < 10) {
        return { isValid: false, message: "Please enter a complete address" };
      }
      return { isValid: true };
    }
  },
  companyName: {
    maxLength: 100,
    validator: fieldValidators.companyName
  }
};

// Hook for managing field validation state
export const useFieldValidation = () => {
  const validateField = (fieldName: string, value: string) => {
    const constraint = inputConstraints[fieldName];
    if (constraint?.validator) {
      return constraint.validator(value);
    }
    return { isValid: true };
  };

  const formatField = (fieldName: string, value: string) => {
    const constraint = inputConstraints[fieldName];
    if (constraint?.formatter) {
      return constraint.formatter(value);
    }
    return value;
  };

  return { validateField, formatField };
};
