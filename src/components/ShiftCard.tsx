import {format} from "date-fns"
import { Shift } from "../types/hooks";
import { useShifts } from "../hooks/useShifts";
export default function ShiftCard({shift, handleManageClick}: {shift: Shift, handleManageClick: Function}){
    const {deleteShift, error} = useShifts();

    const handleDelete = async () => {
        if (!deleteShift) return;
        const confirmed = window.confirm(
        `Are you sure you want to delete "${shift.job_title}"?\n\nThis action cannot be undone.`
        );
        if (!confirmed) {
        return; // User cancelled, don't proceed with deletion
        }
        await deleteShift(shift.shift_id);
        console.log(error);
    };
    return <div data-testid="shift-card" className="bg-white flex flex-row items-center justify-between rounded-2xl">
        <div className="w-full bg-white flex flex-col gap-3 rounded-2xl p-3"> 
            <p className="text-sm font-montserrat-b text-primary-text">{shift.job_title}</p>
            <div className="flex flex-row gap-2 items-center">
                <img className="w-4 h-4" src = "/public/icons/map.svg"/>
                <p className="text-xs font-montserrat text-secondary-text">{shift.job_location}</p>
            </div>
            <div className="flex flex-row gap-2 items-center">
                <img className="w-4 h-4" src = "/public/icons/calendar.svg"/>
                <p className="text-xs font-montserrat text-secondary-text">{format(shift.start_time, "EEEE, dd/MM/yyyy")}</p>
            </div>
            <div className="flex flex-row gap-2 items-center">
                <img className="w-4 h-4" src = "/public/icons/clock.svg"/>
                <p className="text-xs font-montserrat text-secondary-text">{`${format(shift.start_time, "hh:mm a")} - ${format(shift.end_time, "hh:mm a")}`}</p>
            </div>
            <div className="flex flex-row gap-2 items-center">
                <img className="w-4 h-4" src={`${shift.staff_assigned==shift.staff_needed?"/public/icons/users.svg": "/icons/userswarning.svg"}`}/>
                <p className={`${shift.staff_assigned==shift.staff_needed?"text-secondary-text font-montserrat":"text-pink-500 font-montserrat-b"} text-xs`}>{shift.staff_assigned==shift.staff_needed? `${shift.staff_needed}`: `${shift.staff_assigned} / ${shift.staff_needed}`}</p>
            </div>
            <button className="w-full hover:cursor-pointer hover:bg-gray-100 hover:opacity-80 bg-white rounded-md text-secondary-text py-2 px-3 border border-secondary-text font-montserrat-smb text-sm transition-colors"
            onClick={()=>handleManageClick(shift)}
            >Manage</button>
            {shift.status !== "completed" && (
            <button
                className="hover:cursor-pointer hover:bg-red bg-red-dark text-white px-3 py-2 rounded-md text-sm mt-0.5"
                onClick={()=>handleDelete()}
                >
                    Delete
            </button>
            )}
        </div>
        
    </div>
}