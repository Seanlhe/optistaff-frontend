import { ShiftCardProps } from "../types/components";
export default function ShiftCard({title, date, time, staffNo}: ShiftCardProps){
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
        <button className="hover:cursor-pointer hover:bg-gray-100 hover:opacity-80 bg-white rounded-md text-secondary-text py-2.5 px-4 border border-secondary-text font-montserrat-smb text-lg">Manage</button>
    </div>
}