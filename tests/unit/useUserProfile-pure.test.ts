/**
 * useUserProfile Hook - Pure Function Unit Tests
 * @description Tests for pure data transformation functions in useUserProfile hook
 * @testing-strategy Equivalence Class Testing (ECT) and Boundary Value Testing (BVT)
 */

import { describe, test, expect } from "vitest";
import { 
  UserProfileData, 
  ProfileDisplayData, 
  PersonalInfoFormData, 
  AccountSettingsFormData 
} from "../../src/types/hooks";

// Pure helper functions extracted for testing
export const useUserProfileHelpers = {
  /**
   * Transform profile data for display
   * @param profileData - Complete profile data
   * @returns Display data or null
   */
  getDisplayData: (profileData: UserProfileData | null): ProfileDisplayData | null => {
    return profileData?.display || null;
  },

  /**
   * Transform profile data for personal info form
   * @param profileData - Complete profile data
   * @returns Personal info form data or null
   */
  getPersonalInfoData: (profileData: UserProfileData | null): PersonalInfoFormData | null => {
    return profileData?.personalInfo || null;
  },

  /**
   * Transform profile data for account settings form
   * @param profileData - Complete profile data
   * @returns Account settings form data
   */
  getAccountFormData: (profileData: UserProfileData | null): AccountSettingsFormData => {
    return {
      email: profileData?.display.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  },

  /**
   * Check if user is a job seeker
   * @param profileData - Complete profile data
   * @returns Boolean indicating if user is job seeker
   */
  isJobSeeker: (profileData: UserProfileData | null): boolean => {
    return profileData?.userRole === "jobseeker";
  },

  /**
   * Check if user is a client/employer
   * @param profileData - Complete profile data
   * @returns Boolean indicating if user is client
   */
  isClient: (profileData: UserProfileData | null): boolean => {
    return profileData?.userRole === "employer";
  },

  /**
   * Validate postal code format (Singapore 6-digit)
   * @param postalCode - Postal code to validate
   * @returns Validation result
   */
  validatePostalCode: (postalCode: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    
    if (!postalCode) {
      errors.push("Postal code is required");
    } else if (!/^\d{6}$/.test(postalCode)) {
      errors.push("Postal code must be 6 digits");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate phone number format (Singapore)
   * @param phoneNumber - Phone number to validate
   * @returns Validation result
   */
  validatePhoneNumber: (phoneNumber: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    
    if (!phoneNumber) {
      errors.push("Phone number is required");
    } else if (!/^\d{8}$/.test(phoneNumber)) {
      errors.push("Phone number must be 8 digits");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format full name from first and last name
   * @param firstName - First name
   * @param lastName - Last name
   * @returns Formatted full name
   */
  formatFullName: (firstName: string, lastName: string): string => {
    const first = firstName?.trim() || "";
    const last = lastName?.trim() || "";
    
    if (!first && !last) return "Name not set";
    if (!first) return last;
    if (!last) return first;
    
    return `${first} ${last}`;
  },

  /**
   * Get profile completeness percentage
   * @param profileData - Complete profile data
   * @returns Completeness percentage (0-100)
   */
  getProfileCompleteness: (profileData: UserProfileData | null): number => {
    if (!profileData) return 0;
    
    let completedFields = 0;
    const totalFields = profileData.userRole === "jobseeker" ? 6 : 5;
    
    // Common fields
    if (profileData.display.firstName) completedFields++;
    if (profileData.display.lastName) completedFields++;
    if (profileData.display.email) completedFields++;
    if (profileData.personalInfo.phoneNumber) completedFields++;
    if (profileData.personalInfo.postalCode) completedFields++;
    
    // Job seeker specific field
    if (profileData.userRole === "jobseeker" && profileData.personalInfo.homeAddress) {
      completedFields++;
    }
    
    // Employer specific field (company name is required, so if they exist, it's complete)
    if (profileData.userRole === "employer" && profileData.display.companyName) {
      // Company name is already counted in the existence check
    }
    
    return (completedFields / totalFields) * 100;
  },

  /**
   * Get missing profile fields
   * @param profileData - Complete profile data
   * @returns Array of missing field names
   */
  getMissingFields: (profileData: UserProfileData | null): string[] => {
    if (!profileData) return ["All profile data"];
    
    const missing: string[] = [];
    
    if (!profileData.display.firstName) missing.push("First Name");
    if (!profileData.display.lastName) missing.push("Last Name");
    if (!profileData.display.email) missing.push("Email");
    if (!profileData.personalInfo.phoneNumber) missing.push("Phone Number");
    if (!profileData.personalInfo.postalCode) missing.push("Postal Code");
    
    if (profileData.userRole === "jobseeker" && !profileData.personalInfo.homeAddress) {
      missing.push("Home Address");
    }
    
    if (profileData.userRole === "employer" && !profileData.display.companyName) {
      missing.push("Company Name");
    }
    
    return missing;
  },

  /**
   * Format rating for display
   * @param rating - Numeric rating
   * @returns Formatted rating string
   */
  formatRating: (rating: number | undefined): string => {
    if (rating === undefined || rating === null) return "0.0";
    return rating.toFixed(1);
  },

  /**
   * Get account status display text
   * @param status - Account status
   * @returns Display text for status
   */
  getStatusDisplayText: (status: "ACTIVE" | "SUSPENDED" | "INACTIVE" | undefined): string => {
    switch (status) {
      case "ACTIVE": return "Active";
      case "SUSPENDED": return "Suspended";
      case "INACTIVE": return "Inactive";
      default: return "Unknown";
    }
  },

  /**
   * Check if profile data is valid for the user role
   * @param profileData - Complete profile data
   * @returns Validation result
   */
  validateProfileForRole: (profileData: UserProfileData | null): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    
    if (!profileData) {
      errors.push("Profile data is missing");
      return { isValid: false, errors };
    }
    
    // Common validations
    if (!profileData.display.firstName) {
      errors.push("First name is required");
    }
    if (!profileData.display.lastName) {
      errors.push("Last name is required");
    }
    if (!profileData.display.email) {
      errors.push("Email is required");
    }
    
    // Role-specific validations
    if (profileData.userRole === "jobseeker") {
      if (!profileData.personalInfo.homeAddress) {
        errors.push("Home address is required for job seekers");
      }
    } else if (profileData.userRole === "employer") {
      if (!profileData.display.companyName) {
        errors.push("Company name is required for employers");
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

describe("useUserProfile - Pure Functions Unit Tests", () => {
  const mockJobSeekerProfile: UserProfileData = {
    display: {
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      rating: 4.5,
      accountStatus: "ACTIVE",
      email: "john@example.com",
      accountCreated: "2025-01-01T00:00:00Z"
    },
    personalInfo: {
      phoneNumber: "12345678",
      homeAddress: "123 Test Street",
      postalCode: "123456"
    },
    userRole: "jobseeker"
  };

  const mockEmployerProfile: UserProfileData = {
    display: {
      firstName: "Jane",
      lastName: "Smith",
      fullName: "Jane Smith",
      companyName: "Test Corp",
      email: "jane@testcorp.com",
      accountCreated: "2025-01-01T00:00:00Z"
    },
    personalInfo: {
      phoneNumber: "87654321",
      homeAddress: "456 Business Ave",
      postalCode: "654321"
    },
    userRole: "employer"
  };

  describe("getDisplayData - Equivalence Class Testing", () => {
    test("extracts display data from job seeker profile", () => {
      const { getDisplayData } = useUserProfileHelpers;
      
      const result = getDisplayData(mockJobSeekerProfile);
      
      expect(result).toEqual(mockJobSeekerProfile.display);
      expect(result?.rating).toBe(4.5);
      expect(result?.companyName).toBeUndefined();
    });

    test("extracts display data from employer profile", () => {
      const { getDisplayData } = useUserProfileHelpers;
      
      const result = getDisplayData(mockEmployerProfile);
      
      expect(result).toEqual(mockEmployerProfile.display);
      expect(result?.companyName).toBe("Test Corp");
      expect(result?.rating).toBeUndefined();
    });

    test("returns null for null profile", () => {
      const { getDisplayData } = useUserProfileHelpers;
      
      expect(getDisplayData(null)).toBeNull();
    });

    test("handles profile without display data", () => {
      const { getDisplayData } = useUserProfileHelpers;
      
      const incompleteProfile = {
        personalInfo: mockJobSeekerProfile.personalInfo,
        userRole: "jobseeker" as const
      } as UserProfileData;
      
      expect(getDisplayData(incompleteProfile)).toBeNull();
    });
  });

  describe("getPersonalInfoData - Equivalence Class Testing", () => {
    test("extracts personal info from complete profile", () => {
      const { getPersonalInfoData } = useUserProfileHelpers;
      
      const result = getPersonalInfoData(mockJobSeekerProfile);
      
      expect(result).toEqual(mockJobSeekerProfile.personalInfo);
    });

    test("returns null for null profile", () => {
      const { getPersonalInfoData } = useUserProfileHelpers;
      
      expect(getPersonalInfoData(null)).toBeNull();
    });

    test("handles profile without personal info", () => {
      const { getPersonalInfoData } = useUserProfileHelpers;
      
      const incompleteProfile = {
        display: mockJobSeekerProfile.display,
        userRole: "jobseeker" as const
      } as UserProfileData;
      
      expect(getPersonalInfoData(incompleteProfile)).toBeNull();
    });
  });

  describe("getAccountFormData - Pure Data Transformation", () => {
    test("creates account form data from profile", () => {
      const { getAccountFormData } = useUserProfileHelpers;
      
      const result = getAccountFormData(mockJobSeekerProfile);
      
      expect(result).toEqual({
        email: "john@example.com",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    });

    test("handles null profile", () => {
      const { getAccountFormData } = useUserProfileHelpers;
      
      const result = getAccountFormData(null);
      
      expect(result).toEqual({
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    });

    test("handles profile without email", () => {
      const { getAccountFormData } = useUserProfileHelpers;
      
      const profileWithoutEmail = {
        ...mockJobSeekerProfile,
        display: {
          ...mockJobSeekerProfile.display,
          email: ""
        }
      };
      
      const result = getAccountFormData(profileWithoutEmail);
      expect(result.email).toBe("");
    });
  });

  describe("isJobSeeker - Equivalence Class Testing", () => {
    test("identifies job seeker profile", () => {
      const { isJobSeeker } = useUserProfileHelpers;
      
      expect(isJobSeeker(mockJobSeekerProfile)).toBe(true);
    });

    test("identifies non-job seeker profile", () => {
      const { isJobSeeker } = useUserProfileHelpers;
      
      expect(isJobSeeker(mockEmployerProfile)).toBe(false);
    });

    test("handles null profile", () => {
      const { isJobSeeker } = useUserProfileHelpers;
      
      expect(isJobSeeker(null)).toBe(false);
    });
  });

  describe("isClient - Equivalence Class Testing", () => {
    test("identifies employer profile", () => {
      const { isClient } = useUserProfileHelpers;
      
      expect(isClient(mockEmployerProfile)).toBe(true);
    });

    test("identifies non-employer profile", () => {
      const { isClient } = useUserProfileHelpers;
      
      expect(isClient(mockJobSeekerProfile)).toBe(false);
    });

    test("handles null profile", () => {
      const { isClient } = useUserProfileHelpers;
      
      expect(isClient(null)).toBe(false);
    });
  });

  describe("validatePostalCode - Boundary Value Testing", () => {
    test("validates correct 6-digit postal codes", () => {
      const { validatePostalCode } = useUserProfileHelpers;
      
      const validCodes = ["123456", "000000", "999999"];
      
      validCodes.forEach(code => {
        const result = validatePostalCode(code);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test("rejects invalid postal code formats", () => {
      const { validatePostalCode } = useUserProfileHelpers;
      
      const invalidCodes = [
        { code: "", expectedError: "Postal code is required" },
        { code: "12345", expectedError: "Postal code must be 6 digits" },
        { code: "1234567", expectedError: "Postal code must be 6 digits" },
        { code: "12345a", expectedError: "Postal code must be 6 digits" },
        { code: "abcdef", expectedError: "Postal code must be 6 digits" }
      ];
      
      invalidCodes.forEach(({ code, expectedError }) => {
        const result = validatePostalCode(code);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expectedError);
      });
    });
  });

  describe("validatePhoneNumber - Boundary Value Testing", () => {
    test("validates correct 8-digit phone numbers", () => {
      const { validatePhoneNumber } = useUserProfileHelpers;
      
      const validNumbers = ["12345678", "87654321", "90000000"];
      
      validNumbers.forEach(number => {
        const result = validatePhoneNumber(number);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test("rejects invalid phone number formats", () => {
      const { validatePhoneNumber } = useUserProfileHelpers;
      
      const invalidNumbers = [
        { number: "", expectedError: "Phone number is required" },
        { number: "1234567", expectedError: "Phone number must be 8 digits" },
        { number: "123456789", expectedError: "Phone number must be 8 digits" },
        { number: "1234567a", expectedError: "Phone number must be 8 digits" },
        { number: "abcdefgh", expectedError: "Phone number must be 8 digits" }
      ];
      
      invalidNumbers.forEach(({ number, expectedError }) => {
        const result = validatePhoneNumber(number);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expectedError);
      });
    });
  });

  describe("formatFullName - Pure String Transformation", () => {
    test("formats complete names", () => {
      const { formatFullName } = useUserProfileHelpers;
      
      expect(formatFullName("John", "Doe")).toBe("John Doe");
      expect(formatFullName("Jane", "Smith")).toBe("Jane Smith");
    });

    test("handles missing first name", () => {
      const { formatFullName } = useUserProfileHelpers;
      
      expect(formatFullName("", "Doe")).toBe("Doe");
      expect(formatFullName(null as any, "Doe")).toBe("Doe");
    });

    test("handles missing last name", () => {
      const { formatFullName } = useUserProfileHelpers;
      
      expect(formatFullName("John", "")).toBe("John");
      expect(formatFullName("John", null as any)).toBe("John");
    });

    test("handles both names missing", () => {
      const { formatFullName } = useUserProfileHelpers;
      
      expect(formatFullName("", "")).toBe("Name not set");
      expect(formatFullName(null as any, null as any)).toBe("Name not set");
    });

    test("trims whitespace", () => {
      const { formatFullName } = useUserProfileHelpers;
      
      expect(formatFullName("  John  ", "  Doe  ")).toBe("John Doe");
      expect(formatFullName("   ", "Doe")).toBe("Doe");
    });
  });

  describe("getProfileCompleteness - Boundary Value Testing", () => {
    test("calculates 100% for complete job seeker profile", () => {
      const { getProfileCompleteness } = useUserProfileHelpers;
      
      expect(getProfileCompleteness(mockJobSeekerProfile)).toBe(100);
    });

    test("calculates 100% for complete employer profile", () => {
      const { getProfileCompleteness } = useUserProfileHelpers;
      
      expect(getProfileCompleteness(mockEmployerProfile)).toBe(100);
    });

    test("calculates 0% for null profile", () => {
      const { getProfileCompleteness } = useUserProfileHelpers;
      
      expect(getProfileCompleteness(null)).toBe(0);
    });

    test("calculates partial completion for job seeker", () => {
      const { getProfileCompleteness } = useUserProfileHelpers;
      
      const partialProfile: UserProfileData = {
        display: {
          firstName: "John",
          lastName: "", // Missing
          fullName: "John",
          email: "john@example.com",
          accountCreated: "2025-01-01T00:00:00Z"
        },
        personalInfo: {
          phoneNumber: "12345678",
          homeAddress: "", // Missing
          postalCode: "123456"
        },
        userRole: "jobseeker"
      };
      
      // 4 out of 6 fields complete = 66.67%
      expect(getProfileCompleteness(partialProfile)).toBeCloseTo(66.67, 1);
    });

    test("calculates partial completion for employer", () => {
      const { getProfileCompleteness } = useUserProfileHelpers;
      
      const partialProfile: UserProfileData = {
        display: {
          firstName: "Jane",
          lastName: "", // Missing
          fullName: "Jane",
          companyName: "Test Corp",
          email: "jane@testcorp.com",
          accountCreated: "2025-01-01T00:00:00Z"
        },
        personalInfo: {
          phoneNumber: "", // Missing
          homeAddress: "456 Business Ave",
          postalCode: "654321"
        },
        userRole: "employer"
      };
      
      // 3 out of 5 fields complete = 60%
      expect(getProfileCompleteness(partialProfile)).toBe(60);
    });
  });

  describe("getMissingFields - Pure Analysis", () => {
    test("returns empty array for complete profile", () => {
      const { getMissingFields } = useUserProfileHelpers;
      
      expect(getMissingFields(mockJobSeekerProfile)).toEqual([]);
      expect(getMissingFields(mockEmployerProfile)).toEqual([]);
    });

    test("identifies missing fields in job seeker profile", () => {
      const { getMissingFields } = useUserProfileHelpers;
      
      const incompleteProfile: UserProfileData = {
        display: {
          firstName: "",
          lastName: "Doe",
          fullName: "Doe",
          email: "",
          accountCreated: "2025-01-01T00:00:00Z"
        },
        personalInfo: {
          phoneNumber: "",
          homeAddress: "123 Test Street",
          postalCode: ""
        },
        userRole: "jobseeker"
      };
      
      const missing = getMissingFields(incompleteProfile);
      expect(missing).toContain("First Name");
      expect(missing).toContain("Email");
      expect(missing).toContain("Phone Number");
      expect(missing).toContain("Postal Code");
      expect(missing).not.toContain("Last Name");
      expect(missing).not.toContain("Home Address");
    });

    test("identifies missing company name for employer", () => {
      const { getMissingFields } = useUserProfileHelpers;
      
      const incompleteProfile: UserProfileData = {
        display: {
          firstName: "Jane",
          lastName: "Smith",
          fullName: "Jane Smith",
          companyName: "",
          email: "jane@testcorp.com",
          accountCreated: "2025-01-01T00:00:00Z"
        },
        personalInfo: {
          phoneNumber: "87654321",
          homeAddress: "456 Business Ave",
          postalCode: "654321"
        },
        userRole: "employer"
      };
      
      const missing = getMissingFields(incompleteProfile);
      expect(missing).toContain("Company Name");
      expect(missing).not.toContain("Home Address"); // Not required for employers
    });

    test("handles null profile", () => {
      const { getMissingFields } = useUserProfileHelpers;
      
      expect(getMissingFields(null)).toEqual(["All profile data"]);
    });
  });

  describe("formatRating - Pure String Transformation", () => {
    test("formats numeric ratings", () => {
      const { formatRating } = useUserProfileHelpers;
      
      expect(formatRating(4.5)).toBe("4.5");
      expect(formatRating(3.0)).toBe("3.0");
      expect(formatRating(5)).toBe("5.0");
      expect(formatRating(0)).toBe("0.0");
    });

    test("handles undefined and null ratings", () => {
      const { formatRating } = useUserProfileHelpers;
      
      expect(formatRating(undefined)).toBe("0.0");
      expect(formatRating(null as any)).toBe("0.0");
    });

    test("handles edge values", () => {
      const { formatRating } = useUserProfileHelpers;
      
      expect(formatRating(4.99)).toBe("5.0");
      expect(formatRating(0.01)).toBe("0.0");
    });
  });

  describe("getStatusDisplayText - Equivalence Class Testing", () => {
    test("formats known status values", () => {
      const { getStatusDisplayText } = useUserProfileHelpers;
      
      expect(getStatusDisplayText("ACTIVE")).toBe("Active");
      expect(getStatusDisplayText("SUSPENDED")).toBe("Suspended");
      expect(getStatusDisplayText("INACTIVE")).toBe("Inactive");
    });

    test("handles unknown status values", () => {
      const { getStatusDisplayText } = useUserProfileHelpers;
      
      expect(getStatusDisplayText(undefined)).toBe("Unknown");
      expect(getStatusDisplayText("INVALID" as any)).toBe("Unknown");
    });
  });

  describe("validateProfileForRole - Complex Validation", () => {
    test("validates complete job seeker profile", () => {
      const { validateProfileForRole } = useUserProfileHelpers;
      
      const result = validateProfileForRole(mockJobSeekerProfile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("validates complete employer profile", () => {
      const { validateProfileForRole } = useUserProfileHelpers;
      
      const result = validateProfileForRole(mockEmployerProfile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("rejects null profile", () => {
      const { validateProfileForRole } = useUserProfileHelpers;
      
      const result = validateProfileForRole(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Profile data is missing");
    });

    test("validates job seeker specific requirements", () => {
      const { validateProfileForRole } = useUserProfileHelpers;
      
      const incompleteJobSeeker: UserProfileData = {
        ...mockJobSeekerProfile,
        personalInfo: {
          ...mockJobSeekerProfile.personalInfo,
          homeAddress: "" // Missing required field for job seekers
        }
      };
      
      const result = validateProfileForRole(incompleteJobSeeker);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Home address is required for job seekers");
    });

    test("validates employer specific requirements", () => {
      const { validateProfileForRole } = useUserProfileHelpers;
      
      const incompleteEmployer: UserProfileData = {
        ...mockEmployerProfile,
        display: {
          ...mockEmployerProfile.display,
          companyName: "" // Missing required field for employers
        }
      };
      
      const result = validateProfileForRole(incompleteEmployer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Company name is required for employers");
    });

    test("accumulates multiple validation errors", () => {
      const { validateProfileForRole } = useUserProfileHelpers;
      
      const invalidProfile: UserProfileData = {
        display: {
          firstName: "",
          lastName: "",
          fullName: "",
          email: "",
          accountCreated: "2025-01-01T00:00:00Z"
        },
        personalInfo: {
          phoneNumber: "12345678",
          homeAddress: "",
          postalCode: "123456"
        },
        userRole: "jobseeker"
      };
      
      const result = validateProfileForRole(invalidProfile);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
      expect(result.errors).toContain("First name is required");
      expect(result.errors).toContain("Last name is required");
      expect(result.errors).toContain("Email is required");
      expect(result.errors).toContain("Home address is required for job seekers");
    });
  });
});