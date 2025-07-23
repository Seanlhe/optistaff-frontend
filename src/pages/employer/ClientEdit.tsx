import CustomInputField from "../../components/CustomInputField"
import CustomTextArea from "../../components/CustomTextArea"
import CustomSelect from "../../components/CustomSelect";
import { Shift, Assignment} from "../../types/hooks";
import { useShifts } from "../../hooks/useShifts";
import { useAssignments } from "../../hooks/useAssignments";
import { getDateForm, ShiftError, validateShift, createEmptyShiftError } from "../../utils/uploadjobs";
import { useEffect, useState } from "react";
import {format} from "date-fns";
export default function ClientEdit({shift}:{shift:Shift}){
    return <div className="bg-tertiary-bg min-h-screen flex flex-col px-16 py-8 gap-10">
        <div className="flex flex-col gap-2">
            <h1 className="font-montserrat-b text-2xl">Edit Listing</h1>
            <p className="font-montserrat-smb text-base text-secondary-text">Modify details and click “save” to confirm</p>
        </div>
        <div className="flex flex-row gap-10">
            <UpdateForm shift={shift}/>
            <AssignmentsContainer shift={shift}/>
        </div>
    </div>
}

function UpdateForm({shift}: {shift: Shift}){
    const {updateShift} = useShifts();
    const [valid, setValid] = useState<boolean>(true);
    const [shiftError, setShiftError] = useState<ShiftError>(createEmptyShiftError());
    const [formData, setFormData] = useState<Shift>(shift);
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

    async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setValid(true);
        const newErrors = validateShift(formData);
        setShiftError(newErrors);
        console.log(newErrors)
        const isValid = Object.values(newErrors).every((value) => value === null);
        if (isValid) {
            await updateShift(formData.shift_id, formData);
            setValid(true);
            console.log("✅ Submitted shift:", formData);
        }else{
            setValid(false);
        }
      }
    const handleCancel = () => {
        console.log("cancelled");
    }
    
    return <div id="upload-jobs-form" className="w-2/3">
            <form className="grid grid-cols-12 gap-x-4 gap-y-12 items-center">
                <p className="pt-5 col-span-12 font-montserrat-b text-lg text-black">Title and Description</p>
                <CustomInputField className="col-span-6" name="job_title" title="Job Title" value = {formData.job_title} valid = {valid} error={shiftError.job_title} placeholder="Eg. Banquet Server" type="text" onChange={handleDataChange}/>
                <CustomSelect options={jobRoleOptions} className="col-span-6" name="job_type" title="Job Category" value = {formData.job_type} valid = {valid} error={shiftError.job_type} placeholder="Eg. Banquet Server" type="text" onInput={handleDataChange}/>
                <CustomTextArea className="col-span-12 h-[8rem]" name="job_description" title="Description" value = {formData.job_description != null? formData.job_description: ""} valid = {valid} error={shiftError.job_description} placeholder="Format into sections to improve readability. Give clear responsibilities and roles" onChange={handleDataChange}/>
                <CustomTextArea className="col-span-12 h-[8rem]" name="job_requirements" title="Requirements" value = {formData.job_requirements != null? formData.job_requirements: ""} valid = {valid} error={shiftError.job_requirements} placeholder="Clearly state any preparation required by staff. For example, attire or tools required."onChange={handleDataChange}/>
                <p className="pt-3 col-span-12 font-montserrat-b text-lg text-black">Time and Venue</p>
                <CustomInputField className="col-span-3"  name="date" title="Date" type="date" value = {format(formData.start_time, "yyyy-MM-dd")} valid={valid} error={formData.start_time <= new Date()? "Please choose a date after today.": null} onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="start_time" title="Start Time" type="time" value = {format(formData.start_time, "HH:mm")} valid = {valid} error={shiftError.start_time} onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="end_time" title="End Time" type="time" value = {format(formData.end_time, "HH:mm")} valid = {valid} error={shiftError.end_time} onChange={handleDataChange}/>
                <CustomInputField className="col-span-3" name="break_duration" title="Break (hrs)" value = {formData.break_duration != null? shift.break_duration : 0} type="number" valid = {valid}  error = {shiftError.break_duration} onChange={handleDataChange}/>
                <CustomInputField className="col-span-6" name="job_location" title="Address" type="text" value = {formData.job_location} valid = {valid} error = {shiftError.job_location} onChange={handleDataChange}/>
                <CustomInputField className="col-span-6" name="postal_code" title="Postal Code" type="text" value = {formData.postal_code} valid = {valid} error = {shiftError.postal_code} onChange={handleDataChange}/>
                <p className="pt-3 col-span-12 font-montserrat-b text-lg text-black">Staffing Requirements</p>
                <CustomInputField className="col-span-6"  placeholder="Eg. 7000" name="pay_rate" title="Pay Rate (/hr)" type="number" value = {formData.pay_rate} valid={valid} error = {shiftError.pay_rate} onChange={handleDataChange}/>
                <CustomInputField className="col-span-6" placeholder="Eg. 10"name="staff_needed" title="No. Pax" type="number" value = {formData.staff_needed} valid={valid} error = {shiftError.staff_needed} onChange={handleDataChange}/>
                <div id="upload-btns" className="col-span-12 flex flex-row gap-4 justify-end">
                    <button type="button" className="hover:cursor-pointer hover:opacity-80 w-full p-3 bg-primary-blue font-montserrat-smb text-white text-base rounded-lg" onClick={(e: React.MouseEvent<HTMLButtonElement>)=>handleSubmit(e)}>Post Job</button> 
                    <button type="button" className="hover:cursor-pointer hover:bg-gray-100 w-full p-3 border-2 bg-white border-secondary-text font-montserrat-smb text-secondary-text text-base rounded-lg" onClick={handleCancel}>Cancel</button>
                </div>
            </form>
    </div>
}

function AssignmentsContainer({shift}: {shift: Shift}){
    const {fetchAssignmentsByShift} = useAssignments();
    const [assignments, setAssignments] = useState<Assignment[]>(); 
    const fetchData = async () => {
        const result = await fetchAssignmentsByShift(shift.shift_id);
        if (result) {
          setAssignments(result);
        }
    };
    useEffect(() => {
        fetchData();
      }, []);
    return <div className="w-116 min-h-screen flex flex-col gap-6 p-5 rounded-lg bg-secondary-bg ">
        <p className="font-montserrat-b text-xl text-primary-text">Assigned Staff</p>
        {assignments?.map((a) => <AssignmentsCard user={{employee_name: a.employee_name, email: a.contact_email}}/>)}
    </div>
}

interface User{
    employee_name: string;
    email: string;
}

function AssignmentsCard({user}: {user: User}){

    function handleClick(){
        
    }
    return <div className="w-full flex flex-row justify-between items-center bg-white p-5 rounded-lg">
        <div className="flex flex-row items-center gap-5">
            <img className="bg-[#D9D9D9] rounded-full w-15 h-15" src=""/>
            <div className="flex flex-col gap-2">
                <p className="font-montserrat text-base text-primary-text">{user.employee_name}</p>
            </div>
        </div>
        <button onClick={()=>handleClick()}className="hover:bg-gray-300 hover:cursor-pointer border-1 h-fit border-primary-text text-primary-text font-montserrat px-2 py-1 rounded-md">Contact</button>
    </div>
}