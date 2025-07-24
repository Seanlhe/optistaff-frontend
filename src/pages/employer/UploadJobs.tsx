import CustomInputField from "../../components/CustomInputField"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useShifts } from "../../hooks/useShifts";
import { Shift } from "../../types/hooks";
import {getDateForm, ShiftError, validateShift, createEmptyShiftError} from "../../utils/uploadjobs";
import {format} from "date-fns";
import CustomSelect from "../../components/CustomSelect";
import CustomTextArea from "../../components/CustomTextArea";
export default function UploadJobs(){
    const navigate = useNavigate();
    const {createShift} = useShifts();
    const [formData, setFormData] = useState<Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned" | "employer_name" | "submission_cycle" | "company_name">>({
        job_title: "",
        job_description: "",
        job_requirements: "",
        job_type: "",
        pay_rate: 0,
        job_location: "",
        postal_code: 0,
        start_time: new Date(),
        end_time: new Date(),
        break_duration: 0,
        staff_needed: 0,  
    })
    const [valid, setValid] = useState<boolean>(true);
    const [shiftError, setShiftError] = useState<ShiftError>(createEmptyShiftError());
    const jobRoleOptions = [
        { label: "Kitchen Helper", value: "Kitchen Helper" },
        { label: "Waiter/Waitress", value: "Waiter/Waitress" },
        { label: "Dishwasher", value: "Dishwasher" },
        { label: "Bartender/Barista", value: "Bartender/Barista" },
        { label: "Banquet Server", value: "Banquet Server" },
        { label: "Food Stall Assistant", value: "Food Stall Assistant" },
        { label: "Cleaner", value: "Cleaner" },
        { label: "Sales Associate", value: "Sales Associate" },
        { label: "Cashier", value: "Cashier" },
        { label: "Promoter", value: "Promoter" },
        { label: "Usher", value: "Usher" },
        { label: "Event Crew", value: "Event Crew" },
        { label: "Customer Service", value: "Customer Service" },
        { label: "Leaflet Distributor", value: "Leaflet Distributor" },
        { label: "Packer", value: "Packer" },
        { label: "Warehouse Assistant", value: "Warehouse Assistant" },
        { label: "Inventory Checker", value: "Inventory Checker" },
        { label: "Delivery", value: "Delivery" },
        { label: "Sorter", value: "Sorter" }
    ];

    const handleDataChange = (e:  React.ChangeEvent<HTMLInputElement>| React.ChangeEvent<HTMLTextAreaElement>|  React.ChangeEvent<HTMLSelectElement>) => {
        const name = e.target.name;
        let value = e.target.value;
        switch (name){
            case "start_time": {
                const baseDate = format(formData.start_time, "yyyy-MM-dd");
                const new_start = getDateForm(baseDate, value);
                setFormData(prev => ({ ...prev, start_time: new_start }));
                break;
            }
            case "end_time": {
                const baseDate = format(formData.start_time, "yyyy-MM-dd");
                const new_end = getDateForm(baseDate, value);
                setFormData(prev => ({ ...prev, end_time: new_end }));
                break;
            }
            case "date": {
                console.log(value);
                const new_sd = getDateForm(value, format(formData.start_time, "HH:mm"));
                const new_ed = getDateForm(value, format(formData.end_time, "HH:mm"));
                setFormData(prev => ({ ...prev, start_time: new_sd, end_time: new_ed }));
                break;
            }
            default:
                setFormData((prevData)=> ({...prevData, [name]:value}));
        }
    }

    function handleCancel(){
        navigate("/employer/dashboard");
    }

    async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setValid(true);
        const newErrors = validateShift(formData);
        setShiftError(newErrors);
        console.log(newErrors)
        const isValid = Object.values(newErrors).every((value) => value === null);
        if (isValid) {
            await createShift(formData);
            setValid(true);
            console.log("✅ Submitted shift:", formData);
        }else{
            setValid(false);
        }
      }

    return <div id="upload-jobs-content" className="min-h-full flex flex-col px-16 py-6 gap-10 bg-tertiary-bg">
        <div id="upload-jobs-header" className= "flex flex-col gap-3">
            <h1 className="text-black font-montserrat-b text-2xl">Create Listing</h1>
            <h2 className="text-secondary-text font-montserrat-smb text-base">Fill out the required information and click "Post Job" to submit.</h2>
        </div>
        <div id="upload-jobs-form" className="w-4/5">
            <form className="grid grid-cols-12 gap-x-4 gap-y-12 items-center">
                <p className="pt-3 col-span-12 font-montserrat-b text-lg text-black">Title and Description</p>
                <CustomInputField className="col-span-6" name="job_title" title="Job Title" valid = {valid} error={shiftError.job_title} placeholder="Eg. Banquet Server" type="text" onChange={handleDataChange}/>
                <CustomSelect options={jobRoleOptions} className="col-span-6" name="job_type" title="Job Category" valid = {valid} error={shiftError.job_type} placeholder="Eg. Banquet Server" type="text" onInput={handleDataChange}/>
                <CustomTextArea className="col-span-12 h-[8rem]" name="job_description" title="Description"  valid = {valid} error={shiftError.job_description} placeholder="Format into sections to improve readability. Give clear responsibilities and roles" onChange={handleDataChange}/>
                <CustomTextArea className="col-span-12 h-[8rem]" name="job_requirements" title="Requirements"  valid = {valid} error={shiftError.job_requirements} placeholder="Clearly state any preparation required by staff. For example, attire or tools required."onChange={handleDataChange}/>
                <p className="pt-3 col-span-12 font-montserrat-b text-lg text-black">Time and Venue</p>
                <CustomInputField className="col-span-3"  name="date" title="Date" type="date" valid={valid} error={formData.start_time <= new Date()? "Please choose a date after today.": null} onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="start_time" title="Start Time" type="time" valid = {valid} error={shiftError.start_time} onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="end_time" title="End Time" type="time" valid = {valid} error={shiftError.end_time} onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="break_duration" title="Break Duration (hrs)" type="number" valid = {valid}  error = {shiftError.break_duration} onChange={handleDataChange}/>
                <CustomInputField className="col-span-6" name="job_location" title="Address" type="text" valid = {valid} error = {shiftError.job_location} onChange={handleDataChange}/>
                <CustomInputField className="col-span-6" name="postal_code" title="Postal Code" type="text" valid = {valid} error = {shiftError.postal_code} onChange={handleDataChange}/>
                <p className="pt-3 col-span-12 font-montserrat-b text-lg text-black">Staffing Requirements</p>
                <CustomInputField className="col-span-6"  placeholder="Eg. 7000" name="pay_rate" title="Pay Rate (/hr)" type="number" valid={valid} error = {shiftError.pay_rate} onChange={handleDataChange}/>
                <CustomInputField className="col-span-6" placeholder="Eg. 10"name="staff_needed" title="No. Pax" type="number" valid={valid} error = {shiftError.staff_needed} onChange={handleDataChange}/>
                <div id="upload-btns" className="col-span-12 flex flex-row gap-4 justify-end">
                    <button type="button" className="hover:cursor-pointer hover:opacity-80 w-full p-3 bg-primary-blue font-montserrat-smb text-white text-base rounded-lg" onClick={(e: React.MouseEvent<HTMLButtonElement>)=>handleSubmit(e)}>Post Job</button> 
                    <button type="button" className="hover:cursor-pointer hover:bg-gray-100 w-full p-3 border-2 bg-white border-secondary-text font-montserrat-smb text-secondary-text text-base rounded-lg" onClick={handleCancel}>Cancel</button>
                </div>
            </form>
        </div>
    </div>
}