import {format} from "date-fns"
import { Shift } from "../types/hooks";
import { useNavigate } from "react-router-dom";
export default function ShiftCard(shift: Shift){
    const navigate = useNavigate();
    function handleManageClick(){
        navigate("/employer/manage")
    }
    return <div className="bg-white flex flex-row  items-center justify-between rounded-2xl">
        <div className="w-full bg-white flex flex-col gap-4 rounded-2xl p-5"> 
            <p className="text-base font-montserrat-b text-primary-text mb-2">{shift.title}</p>
            <div className="flex flex-row gap-4 items-center">
                <img className="w-5 h-5" src = "/public/icons/map.svg"/>
                <p className="text-base font-montserrat text-secondary-text">{shift.job_location}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
                <img className="w-5 h-5" src = "/public/icons/calendar.svg"/>
                <p className="text-base font-montserrat text-secondary-text">{format(shift.start_time, "EEEE, dd/MM/yyyy")}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
                <img src = "/public/icons/clock.svg"/>
                <p className="text-base font-montserrat text-secondary-text">{`${format(shift.start_time, "hh:mm a")} - ${format(shift.end_time, "hh:mm a")}`}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
                <img src={`${shift.staff_assigned==shift.staff_needed?"/public/icons/users.svg": "/icons/userswarning.svg"}`}/>
                <p className={`${shift.staff_assigned==shift.staff_needed?"text-secondary-text font-montserrat":"text-pink-500 font-montserrat-b"} text-base`}>{shift.staff_assigned==shift.staff_needed? `${shift.staff_needed}`: `${shift.staff_assigned} / ${shift.staff_needed}`}</p>
            </div>
            <button className="w-full hover:cursor-pointer hover:bg-gray-100 hover:opacity-80 bg-white rounded-md text-secondary-text py-2.5 px-4 border border-secondary-text font-montserrat-smb text-base"
            onClick={()=>handleManageClick()}
            >Manage</button>
        </div>
        
    </div>
}