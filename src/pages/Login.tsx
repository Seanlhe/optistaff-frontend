import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomInputField from "../components/CustomInputField";
import { LoginFormData } from "@/types/components";
import {
  isValidEmail,
  isValidPassword,
  getEmailError,
  getPasswordError,
} from "../utils/authentication";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("Company");
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  function handleLoginChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const value = e.target.value;
    setLoginData((prevData: LoginFormData) => ({ ...prevData, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    console.log(loginData);
    e.preventDefault();
    if (role == "Company") {
      navigate("/employer/dashboard");
    } else {
      navigate("/employee/dashboard");
    }
  }

  return (
    <div className="flex flex-col py-18 gap-15">
      <div id="login-header" className="flex flex-row gap-10 justify-center items-center">
        <img className="" src="/public/images/optistafflogo.svg"></img>
        <h1 className="text-4xl font-montserrat-b text-primary-blue">
          Your gateway to flexible hiring
        </h1>
      </div>
      <div id="login-form-container" className="px-110">
        <div id="login-form" className="w-full px-7 py-12 bg-white rounded-3xl shadow-2xl">
          <form
            className="w-full flex flex-col gap-8 items-center"
            onSubmit={handleSubmit}
          >
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
            <button className="w-full bg-primary-blue py-4 rounded-3xl font-montserrat text-white text-base cursor-pointer hover:opacity-80">
              Log in
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
