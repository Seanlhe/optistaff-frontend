import { useEffect, useState } from "react";
import { ShiftObject } from "../utils/uploadjobs";

type ModalProps = {
    shift: ShiftObject | null,
    onClose: () => void,
    onSave: (updatedShift: ShiftObject) => void
};

export default function UploadModal({ shift, onClose, onSave }: ModalProps) {
    const [shiftObj, setShiftObj] = useState<ShiftObject | null>(shift);

    useEffect(() => {
        setShiftObj(shift);
    }, [shift]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShiftObj(prev => prev ? { ...prev, [name]: value } : null);
    };

    return (
        <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-fit self-center bg-white flex flex-col gap-4 p-5 rounded-xl">
            <div className="flex flex-row justify-between">
                <p className="font-montserrat-b text-xl">Details</p>
                <button className="hover:cursor-pointer col-span-1" onClick={() => onClose()}>close</button>
            </div>

            {shiftObj && (
                <div className="grid grid-cols-6 gap-y-4 gap-x-2 rounded-xl">
                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">Job Title</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="title"
                            value={shiftObj.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">Job Category</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="category"
                            value={shiftObj.category}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-2 flex flex-col">
                        <label className="font-montserrat-smb">Date</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="date"
                            value={shiftObj.date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-2 flex flex-col">
                        <label className="font-montserrat-smb">Start Time</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="startTime"
                            value={shiftObj.startTime}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-2 flex flex-col">
                        <label className="font-montserrat-smb">End Time</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="endTime"
                            value={shiftObj.endTime}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-4 flex flex-col">
                        <label className="font-montserrat-smb">Address</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="address"
                            value={shiftObj.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-2 flex flex-col">
                        <label className="font-montserrat-smb">Zip Code</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="zipCode"
                            value={shiftObj.zipCode}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">Staff No.</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="staffNo"
                            type="number"
                            value={shiftObj.staffNo}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-3 flex flex-col">
                        <label className="font-montserrat-smb">Pay Rate (/hr)</label>
                        <input
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="payRate"
                            type="number"
                            value={shiftObj.payRate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-span-6 flex flex-col">
                        <label className="font-montserrat-smb">Job Description</label>
                        <textarea
                            className="font-montserrat border-1 border-gray-600 p-2 rounded-md"
                            name="description"
                            value={shiftObj.description}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            )}

            <button
                onClick={() => shiftObj && onSave({
                    ...shiftObj,
                    payRate: parseFloat(String(shiftObj.payRate)),
                    staffNo: parseInt(String(shiftObj.staffNo)),
                })}
                className="hover:cursor-pointer hover:opacity-80 self-center p-3 bg-primary-blue text-white font-montserrat rounded-lg"
            >
                Confirm
            </button>
        </div>
    );
}
