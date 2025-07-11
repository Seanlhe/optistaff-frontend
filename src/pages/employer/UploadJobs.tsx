import CustomInputField from "../../components/CustomInputField"
import { JobFormData } from "@/types/components"
import { useState } from "react"
export default function UploadJobs(){
    const [jobForm, setJobForm] = useState<JobFormData>({
        jobTitle: "",
        date: "",
        startTime: "",
        endTime: "",
        Address: "",
        zipCode: "",
        payRate: 10,
        noPax: 1,
        description: ""
    })


    function handleDataChange(e: React.ChangeEvent<HTMLInputElement>){
        const name = e.target.name;
        const value = e.target.value;
        setJobForm((prevData: JobFormData)=> ({...prevData, [name]:value}));
        console.log(jobForm);
    }
    return <div id="upload-jobs-content" className="flex flex-col px-75 py-8 gap-10 bg-tertiary-bg">
        <div id="upload-jobs-header">
            <h1 className="text-secondary-text font-montserrat-b text-4xl">Create Listing</h1>
        </div>
        <div id="upload-jobs-form" className="w-full rounded-2xl">
            <form className="grid grid-cols-6 gap-x-4 gap-y-8 ">
                <CustomInputField className="col-span-6" name="jobTitle" title="Job Title" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-2" name="date" title="Date" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-2" name="startTime" title="Start Time" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-2" name="endTime" title="End Time" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-4" name="address" title="Address" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-2" name="zipCode" title="Zip Code" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="payRate" title="Pay Rate (/hr)" type="number" onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="noPax" title="No. Pax" type="number" onChange={handleDataChange}/>
                <CustomInputField className="col-span-6 h-[22.5rem]" name="description" title="Description" type="text" onChange={handleDataChange}/>
            </form>
        </div>
    </div>
}