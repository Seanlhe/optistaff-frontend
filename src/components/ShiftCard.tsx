import { ShiftCardProps } from "../types/components";
import { useNavigate } from "react-router-dom";
export default function ShiftCard({title, date, time, staffNo}: ShiftCardProps){
    const navigate = useNavigate();
    function handleManageClick(){
        navigate("/employer/manage")
    }
    return <div className="bg-white flex flex-row p-5 items-center justify-between rounded-2xl">
        <div className="flex flex-col gap-4"> 
            <p className="text-XL font-montserrat-b text-primary-text">{title}</p>
            <div className="flex flex-row gap-2">
                <img src = "/public/icons/clock.svg"/>
                <p className="text-l font-montserrat text-secondary-text">{date}</p>
                <p className="text-l font-montserrat text-secondary-text">{time}</p>
            </div>
            <div className="flex flex-row gap-2">
                <img src = "/public/icons/users.svg" />
                <p className="text-l font-montserrat text-secondary-text">{staffNo}</p>
            </div>
        </div>
        <button className="hover:cursor-pointer hover:bg-gray-100 hover:border-3 hover: text-secondary-text hover:opacity-80 bg-white rounded-md text-secondary-text py-2.5 px-4 border border-secondary-text font-montserrat-smb text-lg"
        onClick={()=>handleManageClick()}
        >Manage</button>
    </div>
}