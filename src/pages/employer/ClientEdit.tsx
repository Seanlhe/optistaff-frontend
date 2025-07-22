import CustomInputField from "../../components/CustomInputField"
import CustomTextArea from "../../components/CustomTextArea"
import { Shift, User} from "../../types/hooks";
import { useState } from "react";
import { getDateForm, checkTimeValid } from "../../utils/uploadjobs";
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
                setFormData((prevData: Shift)=> ({...prevData, [name]:value}));
        }
    }
    const [formData, setFormData] = useState<Shift>(shift);
    const handleSubmit = () => {
        console.log(formData);
    }
    const handleCancel = () => {
        console.log("cancelled");
    }
    return <div id="upload-jobs-form" className="grow">
        <form className="grid grid-cols-6 gap-x-4 gap-y-8 items-center">
            <p className="pt-3 col-span-6 font-montserrat-b text-lg text-black">Title and Description</p>
            <CustomInputField className="col-span-3" name="title" title="Job Title" value={formData.title} type="text" onChange={handleDataChange}/>
            <CustomInputField className="col-span-3" name="category" title="Job Category" value={formData.title} placeholder="Eg. Banquet Server" type="text" onChange={handleDataChange}/>
            <CustomTextArea className="col-span-6 h-[8rem]" name="description" title="Description" value={formData.description} type="text" placeholder="Format into sections to improve readability. Give clear responsibilities and roles"onChange={handleDataChange}/>
            <p className="pt-3 col-span-6 font-montserrat-b text-lg text-black">Time and Venue</p>
            <CustomInputField className="col-span-2"  name="date" title="Date" type="date" value={format(formData.start_time, "yyyy-MM-dd")} onChange={handleDataChange}/>
            <CustomInputField className="col-span-2" name="start_time" title="Start Time" value={format(formData.start_time, "HH:mm")} type="time"  onChange={handleDataChange}/>
            <CustomInputField className="col-span-2" name="end_time" title="End Time" value={format(formData.end_time, "HH:mm")} type="time" onChange={handleDataChange}/>
            <CustomInputField className="col-span-3" name="address" title="Address" value={formData.job_location.split(" ").slice(0, -2).join(" ")} type="text" onChange={handleDataChange}/>
            <CustomInputField className="col-span-3" name="zipCode" title="Zip Code" value={formData.job_location.split(" ").at(-1)} type="text" onChange={handleDataChange}/>
            <p className="pt-3 col-span-6 font-montserrat-b text-lg text-black">Staffing Requirements</p>
            <CustomInputField className="col-span-3"  placeholder="Eg. 7000" name="pay_rate" title="Pay Rate (/hr)" value={formData.pay_rate} type="number" onChange={handleDataChange}/>
            <CustomInputField className="col-span-3" placeholder="Eg. 10" name="staff_needed" title="No. Pax" type="number" value={formData.staff_needed}  onChange={handleDataChange}/>
            <div id="upload-btns" className="col-span-6 flex flex-row gap-4 justify-end">
                <button type="button" className="hover:cursor-pointer hover:opacity-80 w-full p-3 bg-primary-blue font-montserrat-smb text-white text-base rounded-lg" onClick={()=>handleSubmit()}>Post Job</button> 
                <button type="button" className="hover:cursor-pointer hover:bg-gray-100 w-full p-3 border-2 bg-white border-secondary-text font-montserrat-smb text-secondary-text text-base rounded-lg" onClick={handleCancel}>Cancel</button>
            </div>
        </form>
    </div>
}

function AssignmentsContainer({shift}: {shift: Shift}){
    return <div className="w-116 min-h-screen flex flex-col gap-6 p-5 rounded-xl bg-secondary-bg ">
    <p className="font-montserrat-b text-xl text-primary-text">Assigned Staff</p>
    <AssignmentsCard user={{id: "12345",email: "seanleng",role: 'employer'}}/>
</div>
}

function AssignmentsCard({user}: {user: User}){
    function handleClick(){
        
    }
    return <div className="w-full flex flex-row justify-between items-center bg-white p-5 rounded-lg">
        <div className="flex flex-row items-center gap-5">
            <img className="bg-[#D9D9D9] rounded-full w-18 h-18"src=""/>
            <div className="flex flex-col gap-2">
                <p className="font-montserrat text-base text-primary-text">Marcus Tan</p>
                <div className="flex flex-row gap-2">
                    <img src="/icons/star.svg"/>
                    <p className="font-montserrat text-base text-secondary-text">4.8</p>
                </div>
            </div>
        </div>
        <button onClick={()=>handleClick()}className="hover:bg-gray-300 hover:cursor-pointer border-1 h-fit border-primary-text text-primary-text font-montserrat px-2 py-1 rounded-md">Contact</button>
    </div>
}