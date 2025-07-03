import { ShiftCardProps } from "../types/components";
export default function ShiftCard({title, date, time, staffNo}: ShiftCardProps){
    return <div className="bg-white flex flex-row p-5 items-center justify-between rounded-2xl">
        <div className="flex flex-col gap-4"> 
            <p id="shift-card-title">{title}</p>
            <div className="flex flex-row gap-2">
                <img src = "/public/icons/clock.svg"/>
                <p className="text-xl">{date}</p>
                <p className="text-xl">{time}</p>
            </div>
            <div className="flex flex-row gap-2">
                <img src = "/public/icons/users.svg" />
                <p className="text-xl">{staffNo}</p>
            </div>
        </div>
        <button className="bg-[var(--card-color)] rounded-md text-[var(--secondary-text)] py-2.5 px-4 border border-[var(--secondary-text)] font-[montserrat-semibold] text-lg">Manage</button>
    </div>
}