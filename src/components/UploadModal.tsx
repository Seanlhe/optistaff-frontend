import { useEffect, useState } from "react";
import { Shift } from "../types/hooks";
import {getDate, getDateForm, jobRoleOptions, ShiftError, validateShift, createEmptyShiftError } from "../utils/uploadjobs";
import {format} from "date-fns";


type ModalProps = {
    shift: Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned" | "employer_name" | "submission_cycle" | "company_name">
    onClose: () => void,
    onSave: (updatedShift: Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned" | "employer_name" | "submission_cycle" | "company_name">) => void
};


export default function UploadModal({shift, onClose, onSave }: ModalProps) {
    const [shiftObj, setShiftObj] = useState<Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned" | "employer_name" | "submission_cycle" | "company_name">>(shift);
    const [error, setError] = useState<ShiftError>(createEmptyShiftError());

    const handleChange = (e:  React.ChangeEvent<HTMLInputElement>| React.ChangeEvent<HTMLTextAreaElement>|  React.ChangeEvent<HTMLSelectElement>) => {
        const name = e.target.name;
        let value = e.target.value;
        switch (name){
            case "start_time": {
                const baseDate = format(shiftObj.start_time, "yyyy-MM-dd");
                const new_start = getDateForm(baseDate, value);
                setShiftObj(prev => ({ ...prev, start_time: new_start }));
                break;
            }
            case "end_time": {
                const baseDate = format(shiftObj.start_time, "yyyy-MM-dd");
                const new_end = getDateForm(baseDate, value);
                setShiftObj(prev => ({ ...prev, end_time: new_end }));
                break;
            }
            case "date": {
                console.log(value);
                const new_sd = getDateForm(value, format(shiftObj.start_time, "HH:mm"));
                const new_ed = getDateForm(value, format(shiftObj.end_time, "HH:mm"));
                setShiftObj(prev => ({ ...prev, start_time: new_sd, end_time: new_ed }));
                break;
            }
            default:
                setShiftObj((prevData)=> ({...prevData, [name]:value}));
        }
    }

    const handleSave = () => {
        if (!shiftObj) return;
        setError(createEmptyShiftError());
        const newError = validateShift(shiftObj);
        const isValid = Object.values(newError).every((value) => value === null);
        if (isValid){
            onSave(shiftObj);
        }else{
            setError(newError);
        }

    }

    return (
        <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-fit self-center bg-white flex flex-col gap-4 p-5 rounded-xl">
            <div className="flex flex-row justify-between">
                <p className="font-montserrat-b text-xl">Details</p>
                <button className="hover:cursor-pointer col-span-1" onClick={() => onClose()}>close</button>
            </div>

            {shiftObj && (
                <div className="grid grid-cols-12 gap-y-4 gap-x-2 rounded-xl">
                    <div className="col-span-6 flex flex-col">
                        <label className="font-montserrat-smb">Job Title</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="job_title"
                            value={shiftObj.job_title}
                            onChange={handleChange}
                        />
                        {error.job_title && <p>{error.job_title}</p>}
                    </div>

                    <div className="col-span-6 flex flex-col">
                        <label className="font-montserrat-smb">Job Category</label>
                        <select
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="job_type"
                            defaultValue={shiftObj.job_type}
                            onChange={handleChange}
                        >
                            {jobRoleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                        {error.job_type && <p>{error.job_type}</p>}
                    </div>

                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">Date</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="date"
                            value={format(shiftObj.start_time, "yyyy-MM-dd")}
                            onChange={handleChange}
                        />
                        {error.start_time && <p>{error.start_time}</p>}
                    </div>

                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">Start Time</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="start_time"
                            type="time"
                            value={format(shiftObj.start_time, "HH:mm")}
                            onChange={handleChange}
                        />
                        {error.start_time && <p>{error.start_time}</p>}
                    </div>

                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">End Time</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="end_time"
                            type="time"
                            value={format(shiftObj.end_time, "HH:mm")}
                            onChange={handleChange}
                        />
                        {error.end_time && <p>{error.end_time}</p>}
                    </div>

                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">Break Duration</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="break_duration"
                            type="number"
                            value={shiftObj.break_duration != null? shiftObj.break_duration: 0}
                            onChange={handleChange}
                        />
                        {error.break_duration && <p>{error.break_duration}</p>}
                    </div>

                    <div className="col-span-8 flex flex-col">
                        <label className="font-montserrat-smb">Address</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="job_location"
                            value={shiftObj.job_location}
                            onChange={handleChange}
                        />
                        {error.job_location && <p>{error.job_location}</p>}
                    </div>

                    <div className="col-span-4 flex flex-col">
                        <label className="font-montserrat-smb">Postal Code</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="postal_code"
                            value={shiftObj.postal_code}
                            onChange={handleChange}
                        />
                        {error.postal_code && <p>{error.postal_code}</p>}
                    </div>

                    <div className="col-span-6 flex flex-col">
                        <label className="font-montserrat-smb">Staff No.</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="staff_needed"
                            type="number"
                            value={shiftObj.staff_needed}
                            onChange={handleChange}
                        />
                        {error.staff_needed && <p>{error.staff_needed}</p>}
                    </div>

                    <div className="col-span-6 flex flex-col">
                        <label className="font-montserrat-smb">Pay Rate (/hr)</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="pay_rate"
                            type="number"
                            value={shiftObj.pay_rate}
                            onChange={handleChange}
                        />
                        {error.pay_rate && <p>{error.pay_rate}</p>}
                    </div>

                    <div className="col-span-12 flex flex-col">
                        <label className="font-montserrat-smb">Job Description</label>
                        <textarea
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="job_description"
                            value={shiftObj.job_description != null?  shiftObj.job_description: ""}
                            onChange={handleChange}
                        />
                        {error.job_description && <p>{error.job_description}</p>}
                    </div>

                    <div className="col-span-12 flex flex-col">
                        <label className="font-montserrat-smb">Job Requirements</label>
                        <textarea
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="job_requirements"
                            value={shiftObj.job_requirements != null?  shiftObj.job_requirements: ""}
                            onChange={handleChange}
                        />
                        {error.job_requirements && <p>{error.job_requirements}</p>}
                    </div>
                </div>
            )}

            <button
                onClick={() => shiftObj && handleSave()}
                className="hover:cursor-pointer hover:opacity-80 self-center p-3 bg-primary-blue text-white font-montserrat rounded-lg"
            >
                Confirm
            </button>
        </div>
    );
}
