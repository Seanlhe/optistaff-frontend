import CustomInputField from "../../components/CustomInputField"
import { JobFormData } from "@/types/components"
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

    return <div id="upload-jobs-content" className="min-h-full flex flex-col px-70 py-8 gap-10 bg-tertiary-bg">
        <div id="upload-jobs-header">
            <h1 className="text-secondary-text font-montserrat-b text-4xl">Create Listing</h1>
        </div>
        <div id="upload-jobs-form" className="w-full">
            <form className="grid grid-cols-6 gap-x-4 gap-y-12 ">
                <CustomInputField className="col-span-6" name="jobTitle" title="Job Title" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-2"  name="date" title="Date" type="date" onChange={handleDataChange}/>
                <CustomInputField className="col-span-2" name="startTime" title="Start Time" type="time" valid = {jobForm.startTime == "" || jobForm.endTime == "" || checkTimeValid(jobForm.startTime, jobForm.endTime)} error={getTimeError(jobForm.startTime, jobForm.endTime)} onChange={handleDataChange}/>
                <CustomInputField className="col-span-2" name="endTime" title="End Time" type="time" valid = {jobForm.startTime == "" || jobForm.endTime == "" || checkTimeValid(jobForm.startTime, jobForm.endTime)} error={getTimeError(jobForm.startTime, jobForm.endTime)} onChange={handleDataChange}/>
                <CustomInputField className="col-span-4" name="address" title="Address" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-2" name="zipCode" title="Zip Code" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="payRate" title="Pay Rate (/hr)" type="number" onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="noPax" title="No. Pax" type="number" onChange={handleDataChange}/>
                <CustomInputField className="col-span-6 h-[8rem]" name="description" title="Description" type="text" onChange={handleDataChange}/>
                <div id="upload-btns" className="col-span-6 flex flex-row gap-10 justify-end">
                    <button type="button" className="hover:cursor-pointer hover:opacity-80 p-3 bg-primary-blue font-montserrat-smb text-white text-base rounded-lg" onClick={(e: React.MouseEvent<HTMLButtonElement>)=>handleSubmit(e)}>Post Job</button> 
                    <button type="button" className="hover:cursor-pointer hover:bg-gray-100 hover:border-3 p-3 border-2 bg-white border-secondary-text font-montserrat-smb text-secondary-text text-base rounded-lg" onClick={handleCancel}>Cancel</button>
                </div>
            </form>
        </div>
    </div>
}