import { FormField } from "./FormField"

interface AuthFormFieldsProps {
  isSignup: boolean
  userType: "jobseeker" | "employer"
  formData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber: string
    companyName: string
  }
  setFormData: {
    setEmail: (value: string) => void
    setPassword: (value: string) => void
    setFirstName: (value: string) => void
    setLastName: (value: string) => void
    setPhoneNumber: (value: string) => void
    setCompanyName: (value: string) => void
  }
}

export const AuthFormFields = ({
  isSignup,
  userType,
  formData,
  setFormData,
}: AuthFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {/* Name Fields (Sign up only) */}
      {isSignup && (
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
            placeholder="Doe"
          />
        </div>
      )}

      {/* Email Field */}
      <FormField
        id="email"
        label="Email Address"
        type="email"
        required
        value={formData.email}
        onChange={setFormData.setEmail}
        placeholder="john@example.com"
      />

      {/* Password Field */}
      <FormField
        id="password"
        label="Password"
        type="password"
        required
        value={formData.password}
        onChange={setFormData.setPassword}
        placeholder="••••••••"
        minLength={6}
      />

      {/* Job Seeker Specific Fields */}
      {isSignup && userType === "jobseeker" && (
        <FormField
          id="phoneNumber"
          label="Phone Number (optional)"
          type="tel"
          value={formData.phoneNumber}
          onChange={setFormData.setPhoneNumber}
          placeholder="+1 (555) 123-4567"
        />
      )}

      {/* Employer Specific Fields */}
      {isSignup && userType === "employer" && (
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
  )
}
