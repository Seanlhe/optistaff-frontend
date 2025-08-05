/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AuthFormFields } from "../../../src/components/auth/AuthFormFields";

// Mock all child components
vi.mock("../../../src/components/auth/FormField", () => ({
  FormField: ({ id, label, value, onChange, required, placeholder, type }: any) => (
    <div data-testid={`form-field-${id}`}>
      <label htmlFor={id}>{label} {required && "*"}</label>
      <input
        id={id}
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={`input-${id}`}
      />
    </div>
  ),
}));

vi.mock("../../../src/components/PasswordField", () => ({
  PasswordField: ({ id, label, value, onChange, required, placeholder, minLength }: any) => (
    <div data-testid={`password-field-${id}`}>
      <label htmlFor={id}>{label} {required && "*"}</label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        minLength={minLength}
        data-testid={`input-${id}`}
      />
    </div>
  ),
}));

vi.mock("../../../src/components/DateInput", () => ({
  DateInput: ({ label, value, onChange, required, minDate, maxDate }: any) => (
    <div data-testid="date-input">
      <label>{label} {required && "*"}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="input-dateOfBirth"
      />
    </div>
  ),
}));

vi.mock("../../../src/components/AddressLookupField", () => ({
  AddressLookupField: ({ 
    label, 
    placeholder, 
    postalCode, 
    address, 
    onPostalCodeChange, 
    onAddressChange, 
    required 
  }: any) => (
    <div data-testid="address-lookup-field">
      <label>{label} {required && "*"}</label>
      <input
        type="text"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder={placeholder}
        data-testid="input-address"
      />
      <input
        type="text"
        value={postalCode}
        onChange={(e) => onPostalCodeChange(e.target.value)}
        placeholder="Postal Code"
        data-testid="input-postalCode"
      />
    </div>
  ),
}));

vi.mock("../../../src/components/ConfirmPasswordField", () => ({
  ConfirmPasswordField: ({ password, confirmPassword, onConfirmPasswordChange }: any) => (
    <div data-testid="confirm-password-field">
      <label>Confirm Password *</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => onConfirmPasswordChange(e.target.value)}
        data-testid="input-confirmPassword"
      />
    </div>
  ),
}));

describe("AuthFormFields", () => {
  const mockFormData = {
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "+65 9123 4567",
    dateOfBirth: "1990-01-01",
    address: "123 Main Street",
    postalCode: "123456",
    companyName: "Test Company",
    officeNumber: "+65 6123 4567",
  };

  const mockSetFormData = {
    setEmail: vi.fn(),
    setPassword: vi.fn(),
    setConfirmPassword: vi.fn(),
    setFirstName: vi.fn(),
    setLastName: vi.fn(),
    setPhoneNumber: vi.fn(),
    setDateOfBirth: vi.fn(),
    setAddress: vi.fn(),
    setPostalCode: vi.fn(),
    setCompanyName: vi.fn(),
    setOfficeNumber: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering Tests - Login Mode", () => {
    it("renders login form fields correctly", () => {
      render(
        <AuthFormFields
          isSignup={false}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      // Should only show email and password for login
      expect(screen.getByTestId("form-field-email")).toBeTruthy();
      expect(screen.getByTestId("password-field-password")).toBeTruthy();
      
      // Should not show signup-only fields
      expect(screen.queryByTestId("form-field-firstName")).toBeNull();
      expect(screen.queryByTestId("form-field-lastName")).toBeNull();
      expect(screen.queryByTestId("confirm-password-field")).toBeNull();
    });

    it("displays correct email field for login", () => {
      render(
        <AuthFormFields
          isSignup={false}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByText("Email Address *")).toBeTruthy();
      expect(screen.getByTestId("input-email")).toBeTruthy();
    });

    it("displays correct password field for login", () => {
      render(
        <AuthFormFields
          isSignup={false}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByText("Password *")).toBeTruthy();
      expect(screen.getByTestId("input-password")).toBeTruthy();
    });
  });

  describe("Rendering Tests - Signup Mode Jobseeker", () => {
    it("renders all jobseeker signup fields correctly", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      // Personal Information
      expect(screen.getByText("Personal Information")).toBeTruthy();
      expect(screen.getByTestId("form-field-firstName")).toBeTruthy();
      expect(screen.getByTestId("form-field-lastName")).toBeTruthy();
      expect(screen.getByTestId("date-input")).toBeTruthy();

      // Contact Information
      expect(screen.getByText("Contact Information")).toBeTruthy();
      expect(screen.getByTestId("form-field-phoneNumber")).toBeTruthy();
      expect(screen.getByTestId("address-lookup-field")).toBeTruthy();

      // Account Credentials
      expect(screen.getByText("Account Credentials")).toBeTruthy();
      expect(screen.getByTestId("form-field-email")).toBeTruthy();
      expect(screen.getByTestId("password-field-password")).toBeTruthy();
      expect(screen.getByTestId("confirm-password-field")).toBeTruthy();
    });

    it("shows date of birth for jobseeker signup", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByText("Date of Birth *")).toBeTruthy();
      expect(screen.getByTestId("input-dateOfBirth")).toBeTruthy();
    });

    it("does not show company fields for jobseeker", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.queryByTestId("form-field-companyName")).toBeNull();
      expect(screen.queryByTestId("form-field-officeNumber")).toBeNull();
    });

    it("shows mobile number label for jobseeker", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByText("Mobile Number")).toBeTruthy();
    });

    it("shows residential address label for jobseeker", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByText("Residential Address *")).toBeTruthy();
    });
  });

  describe("Rendering Tests - Signup Mode Employer", () => {
    it("renders all employer signup fields correctly", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      // Personal Information (no date of birth for employer)
      expect(screen.getByText("Personal Information")).toBeTruthy();
      expect(screen.getByTestId("form-field-firstName")).toBeTruthy();
      expect(screen.getByTestId("form-field-lastName")).toBeTruthy();
      expect(screen.getByTestId("form-field-companyName")).toBeTruthy();
      expect(screen.queryByTestId("date-input")).toBeNull();

      // Contact Information (with office number)
      expect(screen.getByText("Contact Information")).toBeTruthy();
      expect(screen.getByTestId("form-field-phoneNumber")).toBeTruthy();
      expect(screen.getByTestId("form-field-officeNumber")).toBeTruthy();
      expect(screen.getByTestId("address-lookup-field")).toBeTruthy();

      // Account Credentials
      expect(screen.getByText("Account Credentials")).toBeTruthy();
      expect(screen.getByTestId("form-field-email")).toBeTruthy();
      expect(screen.getByTestId("password-field-password")).toBeTruthy();
      expect(screen.getByTestId("confirm-password-field")).toBeTruthy();
    });

    it("shows company name field for employer", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByText("Company Name *")).toBeTruthy();
      expect(screen.getByTestId("input-companyName")).toBeTruthy();
    });

    it("shows office number field for employer", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByText("Office Number (optional)")).toBeTruthy();
      expect(screen.getByTestId("input-officeNumber")).toBeTruthy();
    });

    it("does not show date of birth for employer", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.queryByTestId("date-input")).toBeNull();
      expect(screen.queryByText("Date of Birth")).toBeNull();
    });

    it("shows phone number label for employer", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByText("Phone Number *")).toBeTruthy();
    });

    it("shows company address label for employer", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByText("Company Address *")).toBeTruthy();
    });
  });

  describe("Form Field Interaction Tests", () => {
    it("calls setEmail when email field changes", () => {
      render(
        <AuthFormFields
          isSignup={false}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const emailInput = screen.getByTestId("input-email");
      fireEvent.change(emailInput, { target: { value: "newemail@test.com" } });

      expect(mockSetFormData.setEmail).toHaveBeenCalledWith("newemail@test.com");
    });

    it("calls setPassword when password field changes", () => {
      render(
        <AuthFormFields
          isSignup={false}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const passwordInput = screen.getByTestId("input-password");
      fireEvent.change(passwordInput, { target: { value: "newpassword" } });

      expect(mockSetFormData.setPassword).toHaveBeenCalledWith("newpassword");
    });

    it("calls setFirstName when first name field changes", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const firstNameInput = screen.getByTestId("input-firstName");
      fireEvent.change(firstNameInput, { target: { value: "Jane" } });

      expect(mockSetFormData.setFirstName).toHaveBeenCalledWith("Jane");
    });

    it("calls setLastName when last name field changes", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const lastNameInput = screen.getByTestId("input-lastName");
      fireEvent.change(lastNameInput, { target: { value: "Smith" } });

      expect(mockSetFormData.setLastName).toHaveBeenCalledWith("Smith");
    });

    it("calls setDateOfBirth when date field changes", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const dateInput = screen.getByTestId("input-dateOfBirth");
      fireEvent.change(dateInput, { target: { value: "1995-01-01" } });

      expect(mockSetFormData.setDateOfBirth).toHaveBeenCalledWith("1995-01-01");
    });

    it("calls setCompanyName when company name field changes", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const companyInput = screen.getByTestId("input-companyName");
      fireEvent.change(companyInput, { target: { value: "New Company" } });

      expect(mockSetFormData.setCompanyName).toHaveBeenCalledWith("New Company");
    });

    it("calls address setters when address fields change", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const addressInput = screen.getByTestId("input-address");
      const postalCodeInput = screen.getByTestId("input-postalCode");

      fireEvent.change(addressInput, { target: { value: "456 New Street" } });
      fireEvent.change(postalCodeInput, { target: { value: "654321" } });

      expect(mockSetFormData.setAddress).toHaveBeenCalledWith("456 New Street");
      expect(mockSetFormData.setPostalCode).toHaveBeenCalledWith("654321");
    });

    it("calls setConfirmPassword when confirm password field changes", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const confirmPasswordInput = screen.getByTestId("input-confirmPassword");
      fireEvent.change(confirmPasswordInput, { target: { value: "confirmed" } });

      expect(mockSetFormData.setConfirmPassword).toHaveBeenCalledWith("confirmed");
    });
  });

  describe("Section Heading Tests", () => {
    it("displays Personal Information heading for signup", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const heading = screen.getByText("Personal Information");
      expect(heading.className).toContain("font-montserrat-smb");
      expect(heading.className).toContain("text-primary-text");
      expect(heading.className).toContain("border-b");
      expect(heading.className).toContain("border-border");
    });

    it("displays Contact Information heading for signup", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const heading = screen.getByText("Contact Information");
      expect(heading.className).toContain("font-montserrat-smb");
      expect(heading.className).toContain("text-primary-text");
    });

    it("displays Account Credentials heading for signup", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const heading = screen.getByText("Account Credentials");
      expect(heading.className).toContain("font-montserrat-smb");
      expect(heading.className).toContain("text-primary-text");
    });

    it("does not display section headings for login", () => {
      render(
        <AuthFormFields
          isSignup={false}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.queryByText("Personal Information")).toBeNull();
      expect(screen.queryByText("Contact Information")).toBeNull();
      expect(screen.queryByText("Account Credentials")).toBeNull();
    });
  });

  describe("Field Requirements Tests", () => {
    it("shows required fields correctly for jobseeker signup", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      // Required fields
      expect(screen.getByText("First Name *")).toBeTruthy();
      expect(screen.getByText("Last Name *")).toBeTruthy();
      expect(screen.getByText("Date of Birth *")).toBeTruthy();
      expect(screen.getByText("Residential Address *")).toBeTruthy();
      expect(screen.getByText("Email Address *")).toBeTruthy();
      expect(screen.getByText("Password *")).toBeTruthy();
      expect(screen.getByText("Confirm Password *")).toBeTruthy();

      // Optional field (mobile number is optional for jobseeker)
      expect(screen.getByText("Mobile Number")).toBeTruthy();
      expect(screen.queryByText("Mobile Number *")).toBeNull();
    });

    it("shows required fields correctly for employer signup", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      // Required fields
      expect(screen.getByText("First Name *")).toBeTruthy();
      expect(screen.getByText("Last Name *")).toBeTruthy();
      expect(screen.getByText("Company Name *")).toBeTruthy();
      expect(screen.getByText("Phone Number *")).toBeTruthy();
      expect(screen.getByText("Company Address *")).toBeTruthy();
      expect(screen.getByText("Email Address *")).toBeTruthy();
      expect(screen.getByText("Password *")).toBeTruthy();
      expect(screen.getByText("Confirm Password *")).toBeTruthy();

      // Optional field
      expect(screen.getByText("Office Number (optional)")).toBeTruthy();
    });
  });

  describe("Component Structure Tests", () => {
    it("renders with correct HTML structure", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const container = screen.getByText("Personal Information").closest("div");
      expect(container?.className).toContain("space-y-4");
    });

    it("arranges first and last name in grid layout", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const firstNameField = screen.getByTestId("form-field-firstName");
      const gridContainer = firstNameField.closest(".grid");
      expect(gridContainer?.className).toContain("grid-cols-2");
      expect(gridContainer?.className).toContain("gap-4");
    });
  });

  describe("Props Change Tests", () => {
    it("updates field visibility when isSignup changes", () => {
      const { rerender } = render(
        <AuthFormFields
          isSignup={false}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.queryByTestId("form-field-firstName")).toBeNull();

      rerender(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByTestId("form-field-firstName")).toBeTruthy();
    });

    it("updates fields when userType changes from jobseeker to employer", () => {
      const { rerender } = render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByTestId("date-input")).toBeTruthy();
      expect(screen.queryByTestId("form-field-companyName")).toBeNull();

      rerender(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.queryByTestId("date-input")).toBeNull();
      expect(screen.getByTestId("form-field-companyName")).toBeTruthy();
    });
  });

  describe("Form Data Display Tests", () => {
    it("displays form data values correctly", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const emailInput = screen.getByTestId("input-email") as HTMLInputElement;
      const firstNameInput = screen.getByTestId("input-firstName") as HTMLInputElement;
      const lastNameInput = screen.getByTestId("input-lastName") as HTMLInputElement;

      expect(emailInput.value).toBe("test@example.com");
      expect(firstNameInput.value).toBe("John");
      expect(lastNameInput.value).toBe("Doe");
    });

    it("handles empty form data correctly", () => {
      const emptyFormData = {
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        dateOfBirth: "",
        address: "",
        postalCode: "",
        companyName: "",
        officeNumber: "",
      };

      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={emptyFormData}
          setFormData={mockSetFormData}
        />
      );

      const emailInput = screen.getByTestId("input-email") as HTMLInputElement;
      const firstNameInput = screen.getByTestId("input-firstName") as HTMLInputElement;

      expect(emailInput.value).toBe("");
      expect(firstNameInput.value).toBe("");
    });
  });

  describe("Phone Number Field Tests", () => {
    it("shows different phone number requirements for jobseeker vs employer", () => {
      const { rerender } = render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByText("Mobile Number")).toBeTruthy();
      expect(screen.queryByText("Phone Number *")).toBeNull();

      rerender(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.queryByText("Mobile Number")).toBeNull();
      expect(screen.getByText("Phone Number *")).toBeTruthy();
    });
  });

  describe("Address Field Tests", () => {
    it("shows different address labels for jobseeker vs employer", () => {
      const { rerender } = render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.getByText("Residential Address *")).toBeTruthy();
      expect(screen.queryByText("Company Address *")).toBeNull();

      rerender(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      expect(screen.queryByText("Residential Address *")).toBeNull();
      expect(screen.getByText("Company Address *")).toBeTruthy();
    });
  });

  describe("Field Placeholders Tests", () => {
    it("displays correct placeholders for form fields", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="jobseeker"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const firstNameInput = screen.getByTestId("input-firstName");
      const lastNameInput = screen.getByTestId("input-lastName");
      const emailInput = screen.getByTestId("input-email");

      expect(firstNameInput.getAttribute("placeholder")).toBe("John");
      expect(lastNameInput.getAttribute("placeholder")).toBe("Tan");
      expect(emailInput.getAttribute("placeholder")).toBe("john@example.com");
    });

    it("displays correct placeholders for employer fields", () => {
      render(
        <AuthFormFields
          isSignup={true}
          userType="employer"
          formData={mockFormData}
          setFormData={mockSetFormData}
        />
      );

      const companyNameInput = screen.getByTestId("input-companyName");
      const phoneInput = screen.getByTestId("input-phoneNumber");
      const officeInput = screen.getByTestId("input-officeNumber");

      expect(companyNameInput.getAttribute("placeholder")).toBe("ABC Restaurant");
      expect(phoneInput.getAttribute("placeholder")).toBe("+65 9123 4567");
      expect(officeInput.getAttribute("placeholder")).toBe("+65 6123 4567");
    });
  });
});