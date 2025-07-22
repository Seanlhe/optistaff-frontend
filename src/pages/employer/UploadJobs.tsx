import CustomInputField from "../../components/CustomInputField"
import { JobFormData } from "../../types/components"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {checkTimeValid, getTimeError} from "../../utils/uploadjobs"
export default function UploadJobs(){
    const navigate = useNavigate();
    const [jobForm, setJobForm] = useState<JobFormData>({
        jobTitle: "",
        date: "",
        startTime: "",
        endTime: "",
        address: "",
        zipCode: "",
        payRate: 10,
        noPax: 1,
        description: ""
    })

    function handleDataChange(e: React.ChangeEvent<HTMLInputElement>){
        const name = e.target.name;
        const value = e.target.value;
        setJobForm((prevData: JobFormData)=> ({...prevData, [name]:value}));
    }

    function handleSubmit(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        console.log(jobForm);
    }

    function handleCancel(){
        navigate("/employer/dashboard");
    }

    return <div id="upload-jobs-content" className="min-h-full flex flex-col px-40 py-8 gap-10 bg-tertiary-bg">
        <div id="upload-jobs-header" className= "flex flex-col gap-3">
            <h1 className="text-black font-montserrat-b text-3xl">Create Listing</h1>
            <h2 className="text-black font-montserrat-smb text-xl">Fill out the required information</h2>
        </div>
        <div id="upload-jobs-form" className="w-full">
            <form className="grid grid-cols-4 gap-x-12 gap-y-8 items-center">
                <p className="col-span-3 font-montserrat-smb text-xl text-black">Title and Description</p>
                <div className="col-span-1 flex flex-row gap-3">
                    <img className="h-7.5 w-7.5"src="/icons/lightbulb.svg"/>
                    <p className="font-montserrat text-gray-500">Tips</p>
                </div>
                <CustomInputField className="col-span-3" name="jobTitle" title="Job Title" placeholder="Eg. Banquet Server" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-3 h-[8rem]" name="description" title="Description" type="text" onChange={handleDataChange}/>
                <p className="col-span-1 font-montserrat text-sm text-gray-500">
                        Format into sections to improve readability<br/><br/>
                        Give clear responsibilities and roles
                </p>
                <p className="pt-3 col-span-4 font-montserrat-smb text-xl text-black">Time and Venue</p>
                <div className="col-span-3 grid grid-cols-3 gap-x-4" >
                    <CustomInputField className="col-span-1"  name="date" title="Date" type="date" onChange={handleDataChange}/>
                    <CustomInputField className="col-span-1" name="startTime" title="Start Time" type="time" valid = {jobForm.startTime == "" || jobForm.endTime == "" || checkTimeValid(jobForm.startTime, jobForm.endTime)} error={getTimeError(jobForm.startTime, jobForm.endTime)} onChange={handleDataChange}/>
                    <CustomInputField className="col-span-1" name="endTime" title="End Time" type="time" valid = {jobForm.startTime == "" || jobForm.endTime == "" || checkTimeValid(jobForm.startTime, jobForm.endTime)} error={getTimeError(jobForm.startTime, jobForm.endTime)} onChange={handleDataChange}/>
                </div>
                <div className="col-span-3 grid grid-cols-3 gap-x-4 ">
                    <CustomInputField className="col-span-2" name="address" title="Address" type="text" onChange={handleDataChange}/>
                    <CustomInputField className="col-span-1" name="zipCode" title="Zip Code" type="text" onChange={handleDataChange}/>
                </div>
                <p className="col-span-1 font-montserrat text-sm text-gray-500">
                    Give a specific location to get your best match
                </p>
                <p className="pt-3 col-span-4 font-montserrat-smb text-xl text-black">Title and Description</p>
                <div className="col-span-3 grid grid-cols-4 gap-x-4">
                    <CustomInputField className="col-span-2"  placeholder="Eg. 7000" name="payRate" title="Pay Rate (/hr)" type="number" onChange={handleDataChange}/>
                    <CustomInputField className="col-span-2" placeholder="Eg. 10"name="noPax" title="No. Pax" type="number" onChange={handleDataChange}/>
                </div>
                <p className="col-span-1 font-montserrat text-sm text-gray-500">
                    Consider market rates for your best chance at hiring
                </p>
                <div id="upload-btns" className="col-span-3 flex flex-row gap-10 justify-end">
                    <button type="button" className="hover:cursor-pointer hover:opacity-80 w-full p-3 bg-primary-blue font-montserrat-smb text-white text-base rounded-lg" onClick={(e: React.MouseEvent<HTMLButtonElement>)=>handleSubmit(e)}>Post Job</button> 
                    <button type="button" className="hover:cursor-pointer hover:bg-gray-100 w-full p-3 border-2 bg-white border-secondary-text font-montserrat-smb text-secondary-text text-base rounded-lg" onClick={handleCancel}>Cancel</button>
                </div>
            </form>
        </div>
    </div>
}