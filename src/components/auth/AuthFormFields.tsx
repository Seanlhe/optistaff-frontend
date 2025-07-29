import { FormField } from "./FormField";
import { PasswordField } from "../PasswordField";
import { DateInput } from "../DateInput";
import { AddressLookupField } from "../AddressLookupField";
import { ConfirmPasswordField } from "../ConfirmPasswordField";

interface AuthFormFieldsProps {
  isSignup: boolean;
  userType: "jobseeker" | "employer";
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    address: string;
    postalCode: string;
    companyName: string;
    officeNumber: string;
  };
  setFormData: {
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    setFirstName: (value: string) => void;
    setLastName: (value: string) => void;
    setPhoneNumber: (value: string) => void;
    setDateOfBirth: (value: string) => void;
    setAddress: (value: string) => void;
    setPostalCode: (value: string) => void;
    setCompanyName: (value: string) => void;
    setOfficeNumber: (value: string) => void;
  };
}

export const AuthFormFields = ({
  isSignup,
  userType,
  formData,
  setFormData,
}: AuthFormFieldsProps) => {
  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      {isSignup && (
        <div className="space-y-4">
          <h3 className="text-sm font-montserrat-smb text-primary-text border-b border-border pb-2">
            Personal Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="firstName"
              label="First Name"
              required
              value={formData.firstName}
              onChange={setFormData.setFirstName}
              placeholder="John"
            />
            <FormField
              id="lastName"
              label="Last Name"
              required
              value={formData.lastName}
              onChange={setFormData.setLastName}
              placeholder="Tan"
            />
          </div>

          {/* Date of Birth for Job Seekers */}
          {userType === "jobseeker" && (
            <DateInput
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={setFormData.setDateOfBirth}
              required
            />
          )}

          {/* Company Name for Employers */}
          {userType === "employer" && (
            <FormField
              id="companyName"
              label="Company Name"
              required
              value={formData.companyName}
              onChange={setFormData.setCompanyName}
              placeholder="ABC Restaurant"
            />
          )}
        </div>
      )}

      {/* Contact Information Section */}
      {isSignup && (
        <div className="space-y-4">
          <h3 className="text-sm font-montserrat-smb text-primary-text border-b border-border pb-2">
            Contact Information
          </h3>

          <FormField
            id="phoneNumber"
            label={userType === "jobseeker" ? "Mobile Number" : "Phone Number"}
            type="tel"
            required={userType === "employer"}
            value={formData.phoneNumber}
            onChange={setFormData.setPhoneNumber}
            placeholder="+65 9123 4567"
          />

          {/* Office Number for Employers */}
          {userType === "employer" && (
            <FormField
              id="officeNumber"
              label="Office Number (optional)"
              type="tel"
              value={formData.officeNumber}
              onChange={setFormData.setOfficeNumber}
              placeholder="+65 6123 4567"
            />
          )}

          {/* Address Fields */}
          <AddressLookupField
            label={
              userType === "employer"
                ? "Company Address"
                : "Residential Address"
            }
            placeholder={
              userType === "employer"
                ? "Enter your company address"
                : "Enter your residential address"
            }
            postalCode={formData.postalCode}
            address={formData.address}
            onPostalCodeChange={setFormData.setPostalCode}
            onAddressChange={setFormData.setAddress}
            required
          />
        </div>
      )}

      {/* Account Credentials Section */}
      <div className="space-y-4">
        {isSignup && (
          <h3 className="text-sm font-montserrat-smb text-primary-text border-b border-border pb-2">
            Account Credentials
          </h3>
        )}

        <FormField
          id="email"
          label="Email Address"
          type="email"
          required
          value={formData.email}
          onChange={setFormData.setEmail}
          placeholder="john@example.com"
        />

        <PasswordField
          id="password"
          label="Password"
          required
          value={formData.password}
          onChange={setFormData.setPassword}
          placeholder="••••••••"
          minLength={6}
        />

        {/* Confirm Password for Signup */}
        {isSignup && (
          <ConfirmPasswordField
            password={formData.password}
            confirmPassword={formData.confirmPassword}
            onConfirmPasswordChange={setFormData.setConfirmPassword}
          />
        )}
      </div>
    </div>
  );
};
