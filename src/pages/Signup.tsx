import { Link } from "react-router-dom";
import CustomInputField from "../components/CustomInputField";
import { useState } from "react";
import {
  isValidEmail,
  isValidCreatePassword,
  getEmailError,
  getCreatePasswordError,
} from "../utils/authentication";
import {
  CompanyFormProps,
  EmployeeFormData,
  EmployeeFormProps,
} from "../types/components";
import { CompanyFormData } from "../types/components";
import ToggleSwitchButton from "../components/ToggleSwitchButton";
import { useAuth } from "../hooks/useAuth";

export default function SignUp() {
  const [role, setRole] = useState<string>("Company");
  const { signup, loading, error } = useAuth();

  const [employeeData, setEmployeeData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    birthday: "",
    address: "",
    zipCode: "",
    mobileNo: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [companyData, setCompanyData] = useState<CompanyFormData>({
    companyName: "",
    address: "",
    zipCode: "",
    mobileNo: "",
    officeNo: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (role === "Company") {
      if (companyData.password !== companyData.confirmPassword) {
        return; // Passwords don't match
      }

      await signup({
        email: companyData.email,
        password: companyData.password,
        userType: "employer",
        firstName: "",
        lastName: "",
        phoneNumber: companyData.mobileNo,
        companyName: companyData.companyName,
      });
    } else {
      if (employeeData.password !== employeeData.confirmPassword) {
        return; // Passwords don't match
      }

      await signup({
        email: employeeData.email,
        password: employeeData.password,
        userType: "jobseeker",
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        phoneNumber: employeeData.mobileNo,
      });
    }
  }

  function handleEmployeeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const value = e.target.value;
    setEmployeeData((prevData) => ({ ...prevData, [name]: value }));
  }

  function handleCompanyChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name;
    const value = e.target.value;
    setCompanyData((prevData) => ({ ...prevData, [name]: value }));
  }

  function handleChangeRole() {
    if (role == "Company") {
      setRole("Employee");
    } else {
      setRole("Company");
    }
  }

  return (
    <div id="signup-header" className="flex flex-col py-18 gap-15">
      <div className="flex flex-row gap-10 justify-center items-center">
        <img src="/public/images/optistafflogo.svg"></img>
        <h2 className="text-4xl text-primary-blue font-montserrat-b">
          Your gateway to flexible hiring
        </h2>
      </div>
      <div id="signup-form-container" className="px-110">
        <div className="flex flex-col gap-9 w-full px-7 py-12 bg-white shadow-2xl items-center rounded-3xl">
          <h1 className="text-4xl text-center font-montserrat-b">
            Create an account
          </h1>
          <ToggleSwitchButton
            option1="Employee"
            option2="Company"
            selected={role}
            onClick={() => handleChangeRole()}
          />
          <form
            className="w-full flex flex-col gap-9 items-center"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                {error}
              </div>
            )}
            {role == "Company" ? (
              <CompanyForm
                handleChange={handleCompanyChange}
                companyData={companyData}
              />
            ) : (
              <EmployeeForm
                handleChange={handleEmployeeChange}
                employeeData={employeeData}
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="hover:cursor-pointer hover:opacity-80 w-full bg-primary-blue py-4 rounded-3xl text-base font-montserrat text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
          <div className="flex flex-col items-center">
            <p className="text-2xl">Already have an account?</p>
            <Link
              className="text-xl text-primary-blue font-montserrat underline hover:opacity-60"
              to="/login"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyForm({ handleChange, companyData }: CompanyFormProps) {
  return (
    <>
      <CustomInputField
        name="companyName"
        title="Company Name"
        onChange={handleChange}
      />
      <div className="w-full flex flex-row gap-5">
        <CustomInputField
          name="address"
          title="Address"
          onChange={handleChange}
        />
        <CustomInputField
          name="zipCode"
          title="Zip Code"
          onChange={handleChange}
        />
      </div>
      <CustomInputField
        name="mobileNo"
        title="Mobile No."
        onChange={handleChange}
      />
      <CustomInputField
        name="officeNo"
        title="Office No."
        onChange={handleChange}
      />
      <CustomInputField
        name="email"
        title="Email"
        valid={companyData.email == "" || isValidEmail(companyData.email)}
        error={getEmailError(companyData.email)}
        onChange={handleChange}
      />
      <CustomInputField
        name="password"
        title="Password"
        type="password"
        valid={
          companyData.password == "" ||
          isValidCreatePassword(
            companyData.password,
            companyData.confirmPassword,
          )
        }
        error={getCreatePasswordError(
          companyData.password,
          companyData.confirmPassword,
        )}
        onChange={handleChange}
      />
      <CustomInputField
        name="confirmPassword"
        title="Confirm Password"
        type="password"
        onChange={handleChange}
        valid={
          (companyData.password.length == 0 &&
            companyData.confirmPassword.length == 0) ||
          companyData.password == companyData.confirmPassword
        }
        error={"Passwords do not match."}
      />
    </>
  );
}

function EmployeeForm({ handleChange, employeeData }: EmployeeFormProps) {
  return (
    <>
      <div className="w-full flex flex-row gap-5">
        <CustomInputField
          name="firstName"
          title="First Name"
          onChange={handleChange}
        />
        <CustomInputField
          name="lastName"
          title="Last Name"
          onChange={handleChange}
        />
      </div>
      <CustomInputField
        name="birthday"
        title="Birthday"
        onChange={handleChange}
      />
      <div className="w-full flex flex-row gap-5">
        <CustomInputField
          name="address"
          title="Address"
          onChange={handleChange}
        />
        <CustomInputField
          name="zipCode"
          title="Zip Code"
          onChange={handleChange}
        />
      </div>
      <CustomInputField
        name="mobileNo"
        title="Mobile No."
        onChange={handleChange}
      />
      <CustomInputField name="email" title="Email" onChange={handleChange} />
      <CustomInputField
        name="password"
        title="Password"
        onChange={handleChange}
        valid={
          employeeData.password == "" ||
          isValidCreatePassword(
            employeeData.password,
            employeeData.confirmPassword,
          )
        }
        error={getCreatePasswordError(
          employeeData.password,
          employeeData.confirmPassword,
        )}
      />
      <CustomInputField
        name="confirmPassword"
        title="Confirm Password"
        type="password"
        onChange={handleChange}
        valid={
          (employeeData.password.length == 0 &&
            employeeData.confirmPassword.length == 0) ||
          employeeData.password == employeeData.confirmPassword
        }
        error={"Passwords do not match."}
      />
    </>
  );
}
