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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState<"jobseeker" | "employer">("jobseeker");
  
  const [isSignup, setIsSignup] = useState(mode === "signup");

  // Job seeker specific fields
  const [phoneNumber, setPhoneNumber] = useState("");

  // Employer specific fields
  const [companyName, setCompanyName] = useState("");

  // Handle navigation when no mode is present
  useEffect(() => {
    if (!mode) {
      navigate("/");
    }
  }, [mode, navigate]);

  // Handle mode changes
  useEffect(() => {
    if (mode) {
      setIsSignup(mode === "signup");
      clearError();
    }
  }, [mode, clearError]);

  // Early return if no mode is provided
  if (!mode) {
    return null;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isSignup) {
      await signup({
        email,
        password,
        userType,
        firstName,
        lastName,
        phoneNumber,
        companyName,
      });
    } else {
      await login(email, password);
    }
  };

  // Prepare form data for child components
  const formData = {
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    companyName,
  };

  const setFormData = {
    setEmail,
    setPassword,
    setFirstName,
    setLastName,
    setPhoneNumber,
    setCompanyName,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5 font-sans">
      <div className="w-full max-w-md">
        <AuthHeader isSignup={isSignup} />
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-6">
            {isSignup && (
              <UserTypeToggle userType={userType} setUserType={setUserType} />
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-6">
              <AuthFormFields
                isSignup={isSignup}
                userType={userType}
                formData={formData}
                setFormData={setFormData}
              />

              {/* Error Message */}
              {error && (
                <Alert variant={error.includes("email") ? "default" : "destructive"}>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className={`w-full h-12 text-lg font-semibold ${
                  loading 
                    ? "bg-slate-400" 
                    : userType === "employer" && isSignup
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                {loading
                  ? isSignup
                    ? "Creating Account..."
                    : "Signing In..."
                  : isSignup
                    ? "Create Account"
                    : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6">
          <AuthFooter isSignup={isSignup} />
        </div>
      </div>
    </div>
  );
};

export default Auth;
