import { useShifts } from "../../hooks/useShifts"
import { Shift } from "../../types/hooks"
import {format} from "date-fns"
import { useState } from "react";
export default function ClientHistory(){
    const {shifts} = useShifts();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.start_time);
    return shiftDate < today;});

    const [selectedShift, setSelectedShift] = useState<Shift|null>(null);
    const handleSelectShift = (shift: Shift) => {
        setSelectedShift(shift);
        console.log("shift selected");
    }
    

    return <div className="bg-tertiary-bg min-h-screen flex flex-col px-16 py-8 gap-8 ">
        <div className="flex flex-col gap-2">
            <p className="text-2xl text-primary-text font-montserrat-b">History</p>
            <p className="text-lg text-secondary-text font-montserrat-smb">View past completed jobs and rate past employees</p>
        </div>
        <div id="history-content" className="flex flex-row gap-8">
            <div id="previous-jobs" className="grow flex flex-col gap-6 py-5">
                <div className="flex flex-row justify-between">
                    <p className="font-montserrat-b text-xl text-primary-text">Previous Jobs</p>
                    <button className="flex flex-col items-center justify-center bg-[#D9D9D9] rounded-full h-9 w-9"><img className="w-3 h-3"src="/icons/sorticon.svg"/></button>
                </div>
                {pastShifts.length != 0? pastShifts.map((shift) => (<PastShiftCard key={shift.shift_id} selectedShift={selectedShift} shift={shift} handleSelectShift={()=>handleSelectShift(shift)}/>)): <p className="font-montserrat text-secondary-text text-base">No past shifts found. Click upload jobs to create new listings</p>}
            </div>
            <div className="w-116 min-h-screen flex flex-col gap-6 p-5 rounded-xl bg-secondary-bg ">
                <p className="font-montserrat-b text-xl text-primary-text">Assigned Staff</p>
                {selectedShift != null? <HistoryRateCard/>: <p className="self-center font-montserrat text-secondary-text text-base">Select a job. Display staff here.</p>}
                {selectedShift == null? null: null}
            </div>
        </div>
    </div>
}

function HistoryRateCard(){
    return <div className="w-full flex flex-row justify-between items-center bg-white p-5 rounded-lg">
        <div className="flex flex-row items-center gap-5">
            <img className="bg-[#D9D9D9] rounded-full w-18 h-18"src=""/>
            <div>
                <p className="font-montserrat text-base text-primary-text">Marcus Tan</p>
                <div className="flex flex-row gap-2">
                    <img src="/icons/star.svg"/>
                    <p className="font-montserrat text-base text-secondary-text">4.8</p>
                </div>
            </div>
        </div>
        <button className="border-1 h-fit border-primary-text text-primary-text font-montserrat px-2 py-1 rounded-md">Rate</button>
    </div>
}

function PastShiftCard({shift, selectedShift, handleSelectShift}: { shift: Shift, selectedShift: Shift|null, handleSelectShift: Function }){
    return <div onClick={()=>handleSelectShift()} className={`${selectedShift==shift?"border-primary-blue border-2":"border-[#B3B3B3]"} hover:cursor-pointer border flex flex-row  items-center justify-between rounded-2xl`}>
        <div className="w-full flex flex-col gap-4 rounded-2xl p-5"> 
            <p className="text-base font-montserrat-b text-primary-text mb-2">{shift.title}</p>
            <div className="flex flex-row gap-4 items-center">
                <img className="w-5 h-5" src = "/icons/map.svg"/>
                <p className="text-base font-montserrat text-secondary-text">{shift.job_location}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
                <img className="w-5 h-5" src = "/icons/calendar.svg"/>
                <p className="text-base font-montserrat text-secondary-text">{format(shift.start_time, "EEEE, dd/MM/yyyy")}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
                <img src = "/icons/clock.svg"/>
                <p className="text-base font-montserrat text-secondary-text">{`${format(shift.start_time, "hh:mm a")} - ${format(shift.end_time, "hh:mm a")}`}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
                <img src = "/icons/users.svg" />
                <p className="text-base font-montserrat text-secondary-text">{shift.staff_needed}</p>
            </div>
        </div>
    </div>
}