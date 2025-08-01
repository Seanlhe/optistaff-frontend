export const isValidEmail = (email: string): boolean => {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email.toLowerCase()
  );
};

export const isValidPassword = (password: string): boolean => {
  return isValidPasswordLength(password) && hasUpperCase(password);
};

export const isValidCreatePassword = (
  password: string,
  confirmPassword: string
) => {
  return (
    isValidPassword(password) && isPasswordMatching(password, confirmPassword)
  );
};

const isValidPasswordLength = (password: string): boolean => {
  return password.length >= 6;
};

const hasUpperCase = (password: string): boolean => {
  return password.toLowerCase() != password;
};

const isPasswordMatching = (
  password: string,
  confirmPassword: string
): boolean => {
  return password == confirmPassword;
};

export const getEmailError = (email: string): string | null => {
  if (!isValidEmail(email)) {
    return "Please enter a valid email.";
  }
  return null;
};

export const getPasswordError = (password: string): string | null => {
  if (!isValidPasswordLength(password)) {
    return "Password must be 6 characters or longer.";
  } else if (!hasUpperCase(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  return null;
};

export const getCreatePasswordError = (
  password: string,
  createPassword: string
): string | null => {
  if (!isValidPasswordLength(password)) {
    return "Password must be 6 characters or longer.";
  } else if (!hasUpperCase(password)) {
    return "Password must contain at least one uppercase letter.";
  } else if (!isPasswordMatching(password, createPassword)) {
    return "Passwords do not match.";
  }
  return null;
};

// Comprehensive signup form validation
export interface SignupValidationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: "jobseeker" | "employer";
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  postalCode?: string;
  companyName?: string;
  officeNumber?: string;
}

export const validateSignupForm = (signupData: SignupValidationData): string[] => {
  const validationErrors: string[] = [];

  // Required fields for all users
  if (!signupData.email?.trim()) {
    validationErrors.push("Email is required");
  } else if (!isValidEmail(signupData.email)) {
    validationErrors.push("Please enter a valid email address");
  }

  if (!signupData.password?.trim()) {
    validationErrors.push("Password is required");
  } else if (!isValidPasswordLength(signupData.password)) {
    validationErrors.push("Password must be at least 6 characters long");
  } else if (!hasUpperCase(signupData.password)) {
    validationErrors.push("Password must contain at least one uppercase letter");
  }

  if (!signupData.confirmPassword?.trim()) {
    validationErrors.push("Password confirmation is required");
  } else if (!isPasswordMatching(signupData.password, signupData.confirmPassword)) {
    validationErrors.push("Passwords do not match");
  }

  if (!signupData.firstName?.trim()) {
    validationErrors.push("First name is required");
  }

  if (!signupData.lastName?.trim()) {
    validationErrors.push("Last name is required");
  }

  // User type specific validation
  if (signupData.userType === "employer") {
    if (!signupData.companyName?.trim()) {
      validationErrors.push("Company name is required for employers");
    }
  } else if (signupData.userType === "jobseeker") {
    if (!signupData.dateOfBirth?.trim()) {
      validationErrors.push("Date of birth is required for job seekers");
    }
    if (!signupData.phoneNumber?.trim()) {
      validationErrors.push("Mobile number is required for job seekers");
    }
    if (!signupData.address?.trim()) {
      validationErrors.push("Residential address is required for job seekers");
    }
    if (!signupData.postalCode?.trim()) {
      validationErrors.push("Postal code is required for job seekers");
    }
  }

  // Optional field format validation
  if (signupData.postalCode && !/^[0-9]{6}$/.test(signupData.postalCode)) {
    validationErrors.push("Postal code must be 6 digits");
  }

  if (signupData.phoneNumber && !/^[+]?[\d\s\-()]+$/.test(signupData.phoneNumber)) {
    validationErrors.push("Please enter a valid phone number");
  }

  return validationErrors;
};

// Format user data for consistent storage
export const formatUserData = (userData: any) => {
  return {
    id: userData.id,
    email: userData.email || "",
    role: userData.role || "jobseeker",
    // Add any other formatting logic needed
  };
};
