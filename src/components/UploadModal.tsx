import { useEffect, useState } from "react";
import { Shift } from "../types/hooks";
import {getDate } from "../utils/uploadjobs";
import {format} from "date-fns";


type ModalProps = {
    shift: Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned" | "client_id"> | null,
    onClose: () => void,
    onSave: (updatedShift: Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned" | "client_id">) => void
};

type ShiftInputData = {
    title: string,
    category: string,
    description: string,
    date: string,
    start_time: string,
    end_time: string,
    address: string,
    zip_code: string,
    staff_needed: number,
    pay_rate: number
}

export default function UploadModal({shift, onClose, onSave }: ModalProps) {
    const [shiftObj, setShiftObj] = useState<Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned"| "client_id" > | null>(shift);
    const [shiftData, setShiftData] = useState<ShiftInputData | null>(shiftObj &&{
        title: shiftObj.title,
        category: shiftObj.title,
        description: shiftObj.description,
        date: format(shiftObj.start_time, "dd/MM/yyyy"),
        start_time: format(shiftObj.start_time, "HH:mm"),
        end_time: format(shiftObj.end_time, "HH:mm"),
        address: shiftObj.job_location.split(" ").slice(0,-1).join(" "),
        zip_code: shiftObj.job_location.split(" ").at(-1)||"",
        staff_needed: shiftObj.staff_needed,
        pay_rate: shiftObj.pay_rate
    });

    useEffect(() => {
        setShiftObj(shift);
        console.log(shiftData);
    }, [shift]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShiftData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSave = () => {
        if (!shiftObj || !shiftData) return;
        const updatedShift: Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned" | "client_id"> = {
            ...shiftObj,
            title: shiftData.title,
            // category: shiftData.category,
            description: shiftData.description,
            start_time: getDate(shiftData.date, shiftData.start_time),
            end_time: getDate(shiftData.date, shiftData.end_time),
            job_location: `${shiftData.address} ${shiftData.zip_code}`,
            staff_needed: parseInt(String(shiftData.staff_needed)),
            pay_rate: parseFloat(String(shiftData.pay_rate)),
          };
      
          onSave(updatedShift);
    }

    return (
        <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-fit self-center bg-white flex flex-col gap-4 p-5 rounded-xl">
            <div className="flex flex-row justify-between">
                <p className="font-montserrat-b text-xl">Details</p>
                <button className="hover:cursor-pointer col-span-1" onClick={() => onClose()}>close</button>
            </div>

            {shiftData && (
                <div className="grid grid-cols-6 gap-y-4 gap-x-2 rounded-xl">
                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">Job Title</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="title"
                            value={shiftData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">Job Category</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="category"
                            value={shiftData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-2 flex flex-col">
                        <label className="font-montserrat-smb">Date</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="date"
                            value={shiftData.date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-2 flex flex-col">
                        <label className="font-montserrat-smb">Start Time</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="start_time"
                            type="time"
                            value={shiftData.start_time}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-2 flex flex-col">
                        <label className="font-montserrat-smb">End Time</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="end_time"
                            type="time"
                            value={shiftData.end_time}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-4 flex flex-col">
                        <label className="font-montserrat-smb">Address</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="address"
                            value={shiftData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-2 flex flex-col">
                        <label className="font-montserrat-smb">Zip Code</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="zip_code"
                            value={shiftData.zip_code}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">Staff No.</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="staff_needed"
                            type="number"
                            value={shiftData.staff_needed}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">Pay Rate (/hr)</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="pay_rate"
                            type="number"
                            value={shiftData.pay_rate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-6 flex flex-col">
                        <label className="font-montserrat-smb">Job Description</label>
                        <textarea
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="description"
                            value={shiftData.description}
                            onChange={handleChange}
                        />
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
