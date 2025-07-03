import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"
export default function Login(){
    const navigate = useNavigate();
    const [role, setRole] = useState<string>("Company");
    function handleSubmit(e: React.FormEvent<HTMLFormElement>){
        if (role == "Company"){
            navigate("/employer/dashboard");
        } else{
            navigate("/employee/dashboard");
        }
    }
    return <div className="flex flex-col py-18 gap-15"> 
        <div className="flex flex-row gap-10 justify-center items-center">
            <img src="/public/images/optistafflogo.svg"></img>
            <h1 className="text-4xl">Your gateway to flexible hiring</h1>
        </div>
        <div className="px-96">
            <div className="w-full px-7 py-15 bg-blue-300 rounded-3xl">
                <form className="w-full flex flex-col gap-8 items-center" onSubmit={handleSubmit}>
                    <div className="w-full flex flex-col gap-4">
                        <label className="text-2xl">Email</label>
                        <input className="w-full h-15 rounded-3xl bg-white" name="emailInput" />
                    </div>
                    <div className="w-full flex flex-col gap-4">
                        <label className="text-2xl">Password</label>
                        <input className="w-full h-15 rounded-3xl bg-white" name="passwordInput" />
                        <Link className="text-center text-2xl underline" to="/forgotpassword">Forgot Password?</Link>
                    </div>
                    <button className="w-full bg-white px-7 py-8 rounded-3xl text-2xl">Log in</button>
                    <div className="flex flex-col items-center">
                        <p className="text-2xl">Don't have an account yet?</p>
                        <Link className="text-2xl underline" to="/signup">Sign Up</Link>
                    </div>
                </form>
            </div>
        </div>
    </div>
}