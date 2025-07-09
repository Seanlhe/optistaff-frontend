import { Link } from "react-router-dom"
import CustomInputField from "../components/CustomInputField";
import { useState } from "react";
import { EmployeeFormData } from "../types/components";
import { CompanyFormData } from "../types/components";
import { LoginFormProps } from "../types/components";
import { useNavigate } from "react-router-dom";

export default function SignUp(){
    const [role, setRole] = useState<String>("Company");
    const navigate = useNavigate();
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
    })
    const [companyData, setCompanyData] = useState<CompanyFormData>({
        companyName: "",
        address: "",
        zipCode: "",
        mobileNo: "",
        officeNo: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        e.preventDefault();
        if (role == "Company"){
            console.log(JSON.stringify(companyData));
        }else{
            console.log(JSON.stringify(employeeData));
        }
        navigate("/login");
    }

    function handleEmployeeChange(e: React.ChangeEvent<HTMLInputElement>){
        const name = e.target.name;
        const value = e.target.value
        setEmployeeData((prevData) => ({...prevData, [name]: value}));
    }

    function handleCompanyChange(e: React.ChangeEvent<HTMLInputElement>){
        const name = e.target.name;
        const value = e.target.value;
        setCompanyData((prevData) => ({...prevData, [name]: value}));
    }

    function handleChangeRole(){
        if (role == "Company"){
            setRole("Employee");
        }else{
            setRole("Company");
        }
    }    

    return <div className="flex flex-col py-18 gap-15"> 
        <div className="flex flex-row gap-10 justify-center items-center">
            <img src="/public/images/optistafflogo.svg"></img>
            <h2 className="text-4xl">Your gateway to flexible hiring</h2>
        </div>
        <div className="px-96">
            <div className="flex flex-col gap-9 w-full px-7 py-15 bg-white shadow-2xl items-center rounded-3xl">
                <h1 className="text-4xl text-center bold">Create an account</h1>
                <button className="w-6/12 bg-primary-blue text-white p-7.5 rounded-4xl text-2xl" onClick={()=>handleChangeRole()}>{role}</button>
                <form className="w-full flex flex-col gap-9 items-center" onSubmit={handleSubmit}>
                    {role == "Company"? <CompanyForm handleChange={handleCompanyChange}/>: <EmployeeForm handleChange={handleEmployeeChange}/>}
                </form>
            </div>
        </div>
    </div>
}


function CompanyForm({handleChange}: LoginFormProps){
    return <>
        <CustomInputField name = "companyName" title="Company Name" onChange={handleChange}/>
        <div className="w-full flex flex-row gap-5">
            <CustomInputField name = "address" title="Address" onChange={handleChange}/>
            <CustomInputField name = "zipCode" title="Zip Code" onChange={handleChange}/>
        </div>
        <CustomInputField name = "mobileNo" title="Mobile No." onChange={handleChange}/>
        <CustomInputField name = "officeNo" title="Office No." onChange={handleChange}/>
        <CustomInputField name = "email" title="Email" onChange={handleChange}/>
        <CustomInputField name = "password" title="Password" onChange={handleChange}/>
        <CustomInputField name = "confirmPassword" title="Confirm Password" onChange={handleChange}/>
        <button className="w-full bg-primary-blue px-7 py-8 rounded-3xl text-2xl text-white cursor-pointer">Sign Up</button>
        <div className="flex flex-col items-center">
            <p className="text-2xl">Already have an account?</p>
            <Link className="text-2xl underline" to="/login">Log In</Link>
        </div>
    </>
}

function EmployeeForm({handleChange}: LoginFormProps){
    return <>
            <div className="w-full flex flex-row gap-5">
                <CustomInputField name="firstName" title="First Name" onChange={handleChange} />
                <CustomInputField name="lastName" title="Last Name" onChange={handleChange}/>
            </div>
            <CustomInputField name="birthday" title="Birthday" onChange={handleChange}/>
            <div className="w-full flex flex-row gap-5">
                <CustomInputField name="address" title="Address" onChange={handleChange}/>
                <CustomInputField name="zipCode" title="Zip Code" onChange={handleChange}/>
            </div>
            <CustomInputField name="mobileNo" title="Mobile No." onChange={handleChange}/>
            <CustomInputField name="email" title="Email" onChange={handleChange}/>
            <CustomInputField name="password" title="Password" onChange={handleChange}/>
            <CustomInputField name="confirmPassword" title="Confirm Password" onChange={handleChange}/>
            <button className="w-full bg-white px-7 py-8 rounded-3xl text-2xl">Sign Up</button>
            <div className="flex flex-col items-center">
                <p className="text-2xl">Already have an account?</p>
                <Link className="text-2xl underline" to="/login">Log In</Link>
            </div>
        </>
}