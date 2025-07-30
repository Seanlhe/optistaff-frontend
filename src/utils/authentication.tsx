export const isValidEmail = (email: string): boolean => {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email.toLowerCase(),
  );
};

export const isValidPassword = (password: string): boolean => {
  return isValidPasswordLength(password) && hasUpperCase(password);
};

export const isValidCreatePassword = (
  password: string,
  confirmPassword: string,
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
  confirmPassword: string,
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
  createPassword: string,
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
