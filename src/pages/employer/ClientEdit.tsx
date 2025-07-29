import CustomInputField from "../../components/CustomInputField"
import CustomTextArea from "../../components/CustomTextArea"
import CustomSelect from "../../components/CustomSelect";
import { Shift, Assignment} from "../../types/hooks";
import { useShifts } from "../../hooks/useShifts";
import { useAssignments } from "../../hooks/useAssignments";
import { getDateForm, ShiftError, validateShift, createEmptyShiftError, jobRoleOptions } from "../../utils/uploadjobs";
import { useEffect, useState } from "react";
import {format, parse} from "date-fns";
import * as React from "react";
export default function ClientEdit({shift, onClose}:{shift:Shift, onClose: Function}){
    return <div className="bg-tertiary-bg min-h-screen flex flex-col px-16 py-8 gap-10">
        <div className="flex flex-col gap-2">
            <h1 className="font-montserrat-b text-2xl">Edit Listing</h1>
            <p className="font-montserrat-smb text-base text-secondary-text">Modify details and click “save” to confirm</p>
        </div>
        <div className="flex flex-row gap-10">
            <UpdateForm shift={shift} onClose={onClose}/>
            <AssignmentsContainer shift={shift}/>
        </div>
    </div>
}

function UpdateForm({shift, onClose}: {shift: Shift, onClose: Function}){
    const disabled = shift.staff_assigned > 0;
    const {updateShift} = useShifts();
    const [shiftError, setShiftError] = useState<ShiftError>(createEmptyShiftError());
    const [formData, setFormData] = useState<Shift>(shift);
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
                console.log("value: ",value);
                const new_sd = getDateForm(value, format(formData.start_time, "HH:mm"));
                const new_ed = getDateForm(value, format(formData.end_time, "HH:mm"));
                if (!isNaN(new_sd.getTime())){
                    setFormData(prev => ({ ...prev, start_time: new_sd, end_time: new_ed }));
                }
                break;
            }
            default:
                setFormData((prevData)=> ({...prevData, [name]:value}));
        }
    }

    async function handleSubmit() {
        setShiftError(createEmptyShiftError);
        console.log("old shift: ", shift);
        console.log(formData)
        const newErrors = validateShift(formData);
        setShiftError(newErrors);
        console.log(newErrors)
        const isValid = Object.values(newErrors).every((value) => value === null);
        if (isValid) {
            await updateShift({
                shift_id: formData.shift_id,
                job_title: formData.job_title,
                job_location: formData.job_location,
                postal_code: formData.postal_code,
                job_description: formData.job_description,
                job_requirements: formData.job_requirements,
                pay_rate: formData.pay_rate,
                start_time: formData.start_time,
                end_time: formData.end_time,
                break_duration: formData.break_duration,
                staff_needed: formData.staff_needed
            });
            console.log("✅ Submitted shift:", formData);
            onClose();
        }
      }

    const handleCancel = () => {
        onClose();
    }
    
    return <div id="upload-jobs-form" className="w-2/3">
            <form className="grid grid-cols-12 gap-x-4 gap-y-12 items-center">
                <p className="pt-5 col-span-12 font-montserrat-b text-lg text-black">Title and Description</p>
                <CustomInputField disabled={disabled} className="col-span-6" name="job_title" title="Job Title" value = {shift.job_title} error={shiftError.job_title} placeholder="Eg. Banquet Server" type="text" onChange={handleDataChange}/>
                <CustomSelect disabled={disabled} options={jobRoleOptions} className="col-span-6" name="job_type" title="Job Category" value = {shift.job_type}  error={shiftError.job_type} placeholder="Eg. Banquet Server" type="text" onInput={handleDataChange}/>
                <CustomTextArea disabled={disabled} className="col-span-12 h-[8rem]" name="job_description" title="Description" value = {shift.job_description != null? shift.job_description: ""}  error={shiftError.job_description} placeholder="Format into sections to improve readability. Give clear responsibilities and roles" onChange={handleDataChange}/>
                <CustomTextArea disabled={disabled} className="col-span-12 h-[8rem]" name="job_requirements" title="Requirements" value = {shift.job_requirements != null? shift.job_requirements: ""}  error={shiftError.job_requirements} placeholder="Clearly state any preparation required by staff. For example, attire or tools required."onChange={handleDataChange}/>
                <p className="pt-3 col-span-12 font-montserrat-b text-lg text-black">Time and Venue</p>
                <CustomInputField disabled={disabled} className="col-span-3"  name="date" title="Date" type="date" value={format(shift.start_time, "yyyy-MM-dd")}  error={shiftError.date} onChange={handleDataChange}/>
                <CustomInputField disabled={disabled} className="col-span-3" name="start_time" title="Start Time" type="time" value = {format(shift.start_time, "HH:mm")} error={shiftError.start_time} onChange={handleDataChange}/>
                <CustomInputField disabled={disabled} className="col-span-3" name="end_time" title="End Time" type="time" value = {format(shift.end_time, "HH:mm")} error={shiftError.end_time} onChange={handleDataChange}/>
                <CustomInputField disabled={disabled} className="col-span-3" name="break_duration" title="Break (hrs)" value = {shift.break_duration? shift.break_duration : 0} type="number" error = {shiftError.break_duration} onChange={handleDataChange}/>
                <CustomInputField disabled={disabled} className="col-span-6" name="job_location" title="Address" type="text" value = {shift.job_location} error = {shiftError.job_location} onChange={handleDataChange}/>
                <CustomInputField disabled={disabled} className="col-span-6" name="postal_code" title="Postal Code" type="text" value = {shift.postal_code} error = {shiftError.postal_code} onChange={handleDataChange}/>
                <p className="pt-3 col-span-12 font-montserrat-b text-lg text-black">Staffing Requirements</p>
                <CustomInputField disabled={disabled} className="col-span-6"  placeholder="Eg. 7000" name="pay_rate" title="Pay Rate (/hr)" type="number" value = {shift.pay_rate} error = {shiftError.pay_rate} onChange={handleDataChange}/>
                <CustomInputField disabled={disabled} className="col-span-6" placeholder="Eg. 10"name="staff_needed" title="No. Pax" type="number" value = {shift.staff_needed}  error = {shiftError.staff_needed} onChange={handleDataChange}/>
                <div id="upload-btns" className="col-span-12 flex flex-row gap-4 justify-end">
                    {!disabled && <button type="button" className="hover:cursor-pointer hover:opacity-80 w-full p-3 bg-primary-blue font-montserrat-smb text-white text-base rounded-lg" onClick={()=>handleSubmit()}>Update Job</button>}
                    <button type="button" className="hover:cursor-pointer hover:bg-gray-100 w-full p-3 border-2 bg-white border-secondary-text font-montserrat-smb text-secondary-text text-base rounded-lg" onClick={handleCancel}>Cancel</button>
                </div>
            </form>
    </div>
}

function AssignmentsContainer({shift}: {shift: Shift}){
    const {fetchAssignmentsByShift} = useAssignments();
    const [assignments, setAssignments] = useState<Assignment[]>(); 
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const fetchData = async () => {
        const result = await fetchAssignmentsByShift(shift.shift_id);
        if (result) {
          setAssignments(result);
        }
    };
    useEffect(() => {
        fetchData();
      }, []);

    function handleContactClick(a: Assignment){
        setSelectedAssignment(a);
    }
    function handleCloseContact(){
        setSelectedAssignment(null);
    }
    return <div className="w-116 min-h-screen flex flex-col gap-6 p-5 rounded-lg bg-secondary-bg ">
        <p className="font-montserrat-b text-xl text-primary-text">Assigned Staff</p>
        {assignments?.map((a) => <AssignmentsCard assignment={a} handleContactClick={handleContactClick}/>)}
        {selectedAssignment? <ContactCard assignment={selectedAssignment} handleCloseContact={handleCloseContact}/>:null}
    </div>
}

function AssignmentsCard({assignment, handleContactClick}: {assignment: Assignment, handleContactClick: Function}){
    return <div className="w-full flex flex-row justify-between items-center bg-white p-5 rounded-lg">
        <div className="flex flex-row items-center gap-5">
            <img className="bg-[#D9D9D9] rounded-full w-15 h-15" src=""/>
            <div className="flex flex-col gap-2">
                <p className="font-montserrat text-base text-primary-text">{assignment.employee_name}</p>
            </div>
        </div>
        <button onClick={()=>handleContactClick(assignment)}className="hover:bg-gray-300 hover:cursor-pointer border-1 h-fit border-primary-text text-primary-text font-montserrat px-2 py-1 rounded-md">Contact</button>
    </div>
}

function ContactCard({assignment, handleCloseContact}: {assignment: Assignment, handleCloseContact: Function}){
    return <div className="relative w-120 flex flex-col bg-white rounded-xl gap-5 p-5 shadow">
        <div className="flex flex-row items-center gap-5">
            <img className="bg-[#D9D9D9] rounded-full w-15 h-15" src=""/>
            <p className="font-montserrat text-base text-primary-text">{assignment.employee_name}</p>
        </div>
        <div className="flex flex-col gap-3">
            <p className="font-montserrat-smb text-secondary-text">Email: {assignment.contact_email}</p>
            <p className="font-montserrat-smb text-secondary-text">Contact Number: {assignment.contact_number}</p>
        </div>
        <button className="hover:cursor-pointer absolute top-4 right-4"onClick={()=>handleCloseContact()}><img src="/icons/crossicon.svg"/></button>
    </div>
}