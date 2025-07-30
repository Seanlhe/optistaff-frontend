import { useState } from "react";
import { Link } from "react-router-dom";
import CustomInputField from "../components/CustomInputField";
import { LoginFormData } from "../types/components";
import {
  isValidEmail,
  isValidPassword,
  getEmailError,
  getPasswordError,
} from "../utils/authentication";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login, loading, error } = useAuth();
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  function handleLoginChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const value = e.target.value;
    setLoginData((prevData: LoginFormData) => ({ ...prevData, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isValidEmail(loginData.email) && isValidPassword(loginData.password)) {
      await login(loginData.email, loginData.password);
    }
  }

  return (
    <div className="flex flex-col py-18 gap-15">
      <div
        id="login-header"
        className="flex flex-row gap-10 justify-center items-center"
      >
        <img className="" src="/public/images/optistafflogo.svg"></img>
        <h1 className="text-4xl font-montserrat-b text-primary-blue">
          Your gateway to flexible hiring
        </h1>
      </div>
      <div id="login-form-container" className="px-110">
        <div
          id="login-form"
          className="w-full px-7 py-12 bg-white rounded-3xl shadow-2xl"
        >
          <form
            className="w-full flex flex-col gap-8 items-center"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                {error}
              </div>
            )}
            <CustomInputField
              title="Email"
              name="email"
              type="email"
              onChange={handleLoginChange}
              valid={loginData.email == "" || isValidEmail(loginData.email)}
              error={getEmailError(loginData.email)}
            />
            <CustomInputField
              title="Password"
              name="password"
              type="password"
              onChange={handleLoginChange}
              valid={
                loginData.password == "" || isValidPassword(loginData.password)
              }
              error={getPasswordError(loginData.password)}
            />
            <Link
              className="text-center text-xl font-montserrat underline hover:opacity-60"
              to="/forgotpassword"
            >
              Forgot Password?
            </Link>
            <button
              type="submit"
              disabled={
                loading ||
                !isValidEmail(loginData.email) ||
                !isValidPassword(loginData.password)
              }
              className="w-full bg-primary-blue py-4 rounded-3xl font-montserrat text-white text-base cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </button>
            <div className="flex flex-col items-center">
              <p className="text-2xl font-montserrat">
                Don't have an account yet?
              </p>
              <Link
                className="text-xl text-primary-blue font-montserrat underline hover:opacity-60"
                to="/signup"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
