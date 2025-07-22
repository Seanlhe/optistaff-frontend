import CustomInputField from "../../components/CustomInputField"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useShifts } from "../../hooks/useShifts";
import { Shift } from "../../types/hooks";
import {checkTimeValid, getTimeError, getDateForm} from "../../utils/uploadjobs";
import {format} from "date-fns";
import CustomSelect from "../../components/CustomSelect";
import CustomTextArea from "../../components/CustomTextArea";
export default function UploadJobs(){
    const navigate = useNavigate();
    const {createShift, error, loading} = useShifts();
    const [formData, setFormData] = useState<Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned" | "client_id"| "employer_name"| "submission_cycle">>({
        job_title: "",
        job_location: "",
        description: "",
        job_requirements: "",
        job_type: "Full-Time",
        pay_rate: 0,
        start_time: new Date(),
        end_time: new Date(),
        break_duration: 0,
        staff_needed: 1,  
    })

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

    const handleDataChange = (e:  React.ChangeEvent<HTMLInputElement>) => {
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
            case "address": {
                const parts = formData.job_location.trim().split(" ");
                const zip = parts.at(-1) ?? "";
                const new_address = `${value} Singapore ${zip}`;
                setFormData(prev => ({
                    ...prev,
                    job_location: new_address
                }));
                break;
            }
            case "zipCode": {
                const parts = formData.job_location.trim().split(" ");
                const address = parts.slice(0, -1).join(" ");
                const new_location = `${address} ${value}`;
                setFormData(prev => ({
                    ...prev,
                    job_location: new_location
                }));
                break;
            }
            default:
                setFormData((prevData)=> ({...prevData, [name]:value}));
        }
    }

    const handleSelect = (e:  React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            job_type: value
        }));
    }

    function handleCancel(){
        navigate("/employer/dashboard");
    }

    async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        // await createShift(formData);
        console.log("Submitted shift:", formData);
    }

    return <div id="upload-jobs-content" className="min-h-full flex flex-col px-16 py-6 gap-10 bg-tertiary-bg">
        <div id="upload-jobs-header" className= "flex flex-col gap-3">
            <h1 className="text-black font-montserrat-b text-2xl">Create Listing</h1>
            <h2 className="text-secondary-text font-montserrat-smb text-base">Fill out the required information and click "Post Job" to submit.</h2>
        </div>
        <div id="upload-jobs-form" className="w-3/5">
            <form className="grid grid-cols-6 gap-x-4 gap-y-8 items-center">
                <p className="pt-3 col-span-6 font-montserrat-b text-lg text-black">Title and Description</p>
                <CustomInputField className="col-span-3" name="jobTitle" title="Job Title" placeholder="Eg. Banquet Server" type="text" onChange={handleDataChange}/>
                <CustomSelect options={jobRoleOptions} className="col-span-3" name="job_type" title="Job Category" placeholder="Eg. Banquet Server" type="text" onInput={handleSelect}/>
                <CustomTextArea className="col-span-6 h-[8rem]" name="description" title="Description" type="text" placeholder="Format into sections to improve readability. Give clear responsibilities and roles"onChange={handleDataChange}/>
                <p className="pt-3 col-span-6 font-montserrat-b text-lg text-black">Time and Venue</p>
                <CustomInputField className="col-span-2"  name="date" title="Date" type="date" onChange={handleDataChange}/>
                <CustomInputField className="col-span-2" name="start_time" title="Start Time" type="time" valid = {checkTimeValid(format(formData.start_time, "HH:mm"), format(formData.end_time, "HH:mm"))} error={getTimeError(format(formData.start_time, "HH:mm"), format(formData.end_time, "HH:mm"))} onChange={handleDataChange}/>
                <CustomInputField className="col-span-2" name="end_time" title="End Time" type="time" valid = {checkTimeValid(format(formData.start_time, "HH:mm"), format(formData.end_time, "HH:mm"))} error={getTimeError(format(formData.start_time, "HH:mm"), format(formData.end_time, "HH:mm"))} onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="address" title="Address" type="text" onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="zipCode" title="Postal Code" type="text" onChange={handleDataChange}/>
                <p className="pt-3 col-span-6 font-montserrat-b text-lg text-black">Staffing Requirements</p>
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