/**
 * Authentication Page Component
 * @description Login and signup page with Supabase integration
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// UI Components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

// Auth Components
import { AuthHeader } from "../components/auth/AuthHeader";
import { AuthFooter } from "../components/auth/AuthFooter";
import { UserTypeToggle } from "../components/auth/UserTypeToggle";
import { AuthFormFields } from "../components/auth/AuthFormFields";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { login, signup, loading, error, clearError } = useAuth();

  const mode = searchParams.get("mode") as "login" | "signup" | null;

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState<"jobseeker" | "employer">("jobseeker");
  
  const [isSignup, setIsSignup] = useState(mode === "signup");

  // Contact fields
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Job seeker specific fields
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Employer specific fields
  const [companyName, setCompanyName] = useState("");
  const [officeNumber, setOfficeNumber] = useState("");

  // Handle navigation when no mode is present and update isSignup when mode changes
  useEffect(() => {
    if (!mode) {
      navigate("/");
    } else {
      setIsSignup(mode === "signup");
    }
  }, [mode, navigate]);

  // Clear errors when mode or userType changes
  useEffect(() => {
    clearError();
  }, [isSignup, userType, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignup) {
      await signup({
        email,
        password,
        confirmPassword,
        userType,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: userType === "jobseeker" ? dateOfBirth : undefined,
        address,
        postalCode,
        companyName: userType === "employer" ? companyName : undefined,
        officeNumber: userType === "employer" ? officeNumber : undefined,
      });
    } else {
      await login(email, password);
    }
  };

  // Prepare form data and setters for AuthFormFields
  const formData = {
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    phoneNumber,
    dateOfBirth,
    address,
    postalCode,
    companyName,
    officeNumber,
  };

  const setFormData = {
    setEmail,
    setPassword,
    setConfirmPassword,
    setFirstName,
    setLastName,
    setPhoneNumber,
    setDateOfBirth,
    setAddress,
    setPostalCode,
    setCompanyName,
    setOfficeNumber,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <AuthHeader isSignup={isSignup} />
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <UserTypeToggle
                userType={userType}
                setUserType={setUserType}
              />
            )}

            <AuthFormFields
              isSignup={isSignup}
              userType={userType}
              formData={formData}
              setFormData={setFormData}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isSignup ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                isSignup ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          <AuthFooter
            isSignup={isSignup}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
