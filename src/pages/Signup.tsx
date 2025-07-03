import { Link } from "react-router-dom"
import { InputFieldProps } from "../types/components"

export default function Login(){
    return <div className="flex flex-col py-18 gap-15"> 
        <div className="flex flex-row gap-10 justify-center items-center">
            <img src="/public/images/optistafflogo.svg"></img>
            <h2 className="text-4xl">Your gateway to flexible hiring</h2>
        </div>
        <div className="px-96">
            <div className="flex flex-col gap-9 w-full px-7 py-15 bg-blue-300 items-center rounded-3xl">
                <h1 className="text-4xl text-center bold">Create an account</h1>
                <button className="w-6/12 bg-white p-7.5 rounded-4xl text-2xl">Company/Employee</button>
                <form className="w-full flex flex-col gap-9 items-center">
                    <div className="w-full flex flex-row gap-5">
                        <CustomInputField title="First Name"/>
                        <CustomInputField title="Last Name"/>
                    </div>
                    <CustomInputField title="Birthday"/>
                    <div className="w-full flex flex-row gap-5">
                        <CustomInputField title="Address"/>
                        <CustomInputField title="Zip Code"/>
                    </div>
                    <CustomInputField title="Mobile No."/>
                    <CustomInputField title="Email"/>
                    <CustomInputField title="Password"/>
                    <CustomInputField title="Confirm Password"/>
                    
                    <button className="w-full bg-white px-7 py-8 rounded-3xl text-2xl">Sign Up</button>
                    <div className="flex flex-col items-center">
                        <p className="text-2xl">Don't have an account yet?</p>
                        <Link className="text-2xl underline" to="/signup">Sign Up</Link>
                    </div>
                    
                </form>
            </div>
        </div>
    </div>
}

function CustomInputField({title}: InputFieldProps){
    return <div className="w-full flex flex-col gap-4">
        <label className="text-2xl">{title}</label>
        <input className="w-full h-15 rounded-3xl bg-white"/>
    </div>
}