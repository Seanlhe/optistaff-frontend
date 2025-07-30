import CustomInputField from "../../components/CustomInputField"
import CustomTextArea from "../../components/CustomTextArea"
import CustomSelect from "../../components/CustomSelect";
import { DateInput } from "../../components/DateInput";
import { Shift, Assignment} from "../../types/hooks";
import { useShifts } from "../../hooks/useShifts";
import { useAssignments } from "../../hooks/useAssignments";
import { getDateForm, ShiftError, validateShift, createEmptyShiftError, jobRoleOptions } from "../../utils/uploadjobs";
import { useEffect, useState } from "react";
import {format, parse} from "date-fns";
import * as React from "react";
export default function ClientEdit({shift, onClose}:{shift:Shift, onClose: Function}){
    return <div className="min-h-screen bg-bg p-8">
        <div className="flex flex-col gap-2">
            <h1 className="font-montserrat-b text-2xl">Edit Listing</h1>
            <p className="font-montserrat-smb text-base text-secondary-text">Modify details and click “save” to confirm</p>
        </div>
        <div className="flex flex-row gap-6">
            <UpdateForm shift={shift} onClose={onClose}/>
            <AssignmentsContainer shift={shift}/>
        </div>
    </div>
}

function UpdateForm({shift, onClose}: {shift: Shift, onClose: Function}){
    const disabled = shift.staff_assigned > 0;
    console.log("Shift staff_assigned:", shift.staff_assigned, "Disabled:", disabled);
    const {updateShift} = useShifts();
    const [shiftError, setShiftError] = useState<ShiftError>(createEmptyShiftError());
    const [formData, setFormData] = useState<Shift>(shift);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
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

            default:
                setFormData((prevData)=> ({...prevData, [name]:value}));
        }
    }

    const handleDateChange = (dateValue: string) => {
        if (dateValue) {
            const new_sd = getDateForm(dateValue, format(formData.start_time, "HH:mm"));
            const new_ed = getDateForm(dateValue, format(formData.end_time, "HH:mm"));
            if (!isNaN(new_sd.getTime())){
                setFormData(prev => ({ ...prev, start_time: new_sd, end_time: new_ed }));
            }
        }
    }

    async function handleSubmit() {
        setShiftError(createEmptyShiftError());
        setSubmitSuccess(false);
        setSubmitError(null);
        
        console.log("old shift: ", shift);
        console.log(formData)
        const newErrors = validateShift(formData);
        setShiftError(newErrors);
        console.log(newErrors)
        const isValid = Object.values(newErrors).every((value) => value === null);
        
        if (isValid) {
            try {
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
                setSubmitSuccess(true);
                console.log("✅ Updated shift:", formData);
                // Hide success message after 3 seconds, then close
                setTimeout(() => {
                    setSubmitSuccess(false);
                    onClose();
                }, 3000);
            } catch (error) {
                setSubmitError("Failed to update job listing. Please try again.");
                console.error("❌ Failed to update shift:", error);
            }
        } else {
            setSubmitError("Please fix the validation errors before submitting.");
        }
    }

    const handleCancel = () => {
        onClose();
    }
    
    return <div id="upload-jobs-form" className="bg-card-color rounded-xl p-8 w-2/3 max-w-4xl">
            <form className="grid grid-cols-12 gap-x-4 gap-y-12 items-center">
                <p className="pt-5 col-span-12 font-montserrat-b text-lg text-black">Title and Description</p>
                <CustomInputField disabled={disabled} className="col-span-6" name="job_title" title="Job Title" value = {shift.job_title} error={shiftError.job_title} placeholder="Eg. Banquet Server" type="text" onChange={handleDataChange}/>
                <CustomSelect disabled={disabled} options={jobRoleOptions} className="col-span-6" name="job_type" title="Job Category" value = {shift.job_type}  error={shiftError.job_type} placeholder="Eg. Banquet Server" type="text" onInput={handleDataChange}/>
                <CustomTextArea disabled={disabled} className="col-span-12 h-[8rem]" name="job_description" title="Description" value = {shift.job_description != null? shift.job_description: ""}  error={shiftError.job_description} placeholder="Format into sections to improve readability. Give clear responsibilities and roles" onChange={handleDataChange}/>
                <CustomTextArea disabled={disabled} className="col-span-12 h-[8rem]" name="job_requirements" title="Requirements" value = {shift.job_requirements != null? shift.job_requirements: ""}  error={shiftError.job_requirements} placeholder="Clearly state any preparation required by staff. For example, attire or tools required."onChange={handleDataChange}/>
                <p className="pt-3 col-span-12 font-montserrat-b text-lg text-black">Time and Venue</p>
                <div className="col-span-3">
                    <DateInput
                        label="Date"
                        value={format(formData.start_time, "yyyy-MM-dd")}
                        onChange={handleDateChange}
                        required={false}
                        error={shiftError.date}
                        placeholder="Select shift date..."
                    />
                </div>
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

                {/* Success Alert */}
                {submitSuccess && (
                    <div className="col-span-12 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                        <div className="flex items-center">
                            <svg
                                className="h-5 w-5 text-green-400 mr-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-sm font-medium">
                                Job listing updated successfully!
                            </span>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {submitError && (
                    <div className="col-span-12 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        <div className="flex items-start">
                            <svg
                                className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div>
                                <h3 className="text-sm font-medium text-red-800">
                                    Error Updating Job Listing
                                </h3>
                                <p className="text-sm text-red-700 mt-1">{submitError}</p>
                            </div>
                        </div>
                    </div>
                )}
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