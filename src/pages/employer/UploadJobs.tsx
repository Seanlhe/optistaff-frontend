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

    return <div id="upload-jobs-content" className="min-h-full flex flex-col px-16 py-8 gap-10 bg-tertiary-bg">
        <div id="upload-jobs-header" className= "flex flex-col gap-3">
            <h1 className="text-black font-montserrat-b text-3xl">Create Listing</h1>
            <h2 className="text-black font-montserrat-smb text-xl">Fill out the required information</h2>
        </div>
        <div id="upload-jobs-form" className="w-full">
            <form className="grid grid-cols-6 gap-x-4 gap-y-8 items-center">
                <p className="col-span-6 font-montserrat-smb text-xl text-black">Title and Description</p>
                <CustomInputField className="col-span-3" name="jobTitle" title="Job Title" placeholder="Eg. Banquet Server" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="category" title="Job Category" placeholder="Eg. Banquet Server" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-6 h-[8rem]" name="description" title="Description" type="text" placeholder="Format into sections to improve readability. Give clear responsibilities and roles"onChange={handleDataChange}/>
                <p className="pt-3 col-span-6 font-montserrat-smb text-xl text-black">Time and Venue</p>
                <CustomInputField className="col-span-2"  name="date" title="Date" type="date" onChange={handleDataChange}/>
                <CustomInputField className="col-span-2" name="startTime" title="Start Time" type="time" valid = {jobForm.startTime == "" || jobForm.endTime == "" || checkTimeValid(jobForm.startTime, jobForm.endTime)} error={getTimeError(jobForm.startTime, jobForm.endTime)} onChange={handleDataChange}/>
                <CustomInputField className="col-span-2" name="endTime" title="End Time" type="time" valid = {jobForm.startTime == "" || jobForm.endTime == "" || checkTimeValid(jobForm.startTime, jobForm.endTime)} error={getTimeError(jobForm.startTime, jobForm.endTime)} onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="address" title="Address" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="zipCode" title="Zip Code" type="text" onChange={handleDataChange}/>
                <p className="pt-3 col-span-6 font-montserrat-smb text-xl text-black">Staffing Requirements</p>
                <CustomInputField className="col-span-3"  placeholder="Eg. 7000" name="payRate" title="Pay Rate (/hr)" type="number" onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" placeholder="Eg. 10"name="noPax" title="No. Pax" type="number" onChange={handleDataChange}/>
                <div id="upload-btns" className="col-span-6 flex flex-row gap-4 justify-end">
                    <button type="button" className="hover:cursor-pointer hover:opacity-80 w-full p-3 bg-primary-blue font-montserrat-smb text-white text-base rounded-lg" onClick={(e: React.MouseEvent<HTMLButtonElement>)=>handleSubmit(e)}>Post Job</button> 
                    <button type="button" className="hover:cursor-pointer hover:bg-gray-100 w-full p-3 border-2 bg-white border-secondary-text font-montserrat-smb text-secondary-text text-base rounded-lg" onClick={handleCancel}>Cancel</button>
                </div>
            </form>
        </div>
    </div>
}