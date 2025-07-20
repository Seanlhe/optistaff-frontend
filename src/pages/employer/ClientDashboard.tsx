import IconButton from "../../components/IconButton";
import CircleButton from "../../components/CircleButton";
import ShiftCard from "../../components/ShiftCard";
import { useNavigate } from "react-router-dom";
import { useShifts } from "../../hooks/useShifts";
import { Shift } from "../../types/hooks";
import { PieChart } from '@mui/x-charts';

export default function ClientDashboard(){
    const {shifts} = useShifts();
    const navigate = useNavigate();

    function calculateFilled(shiftCardData: Shift[]): number[]{
        let filledStaffCount = 0;
        let unfilledStaffCount = 0;
        for (let i: number = 0; i < shiftCardData.length; i++){
           filledStaffCount += shiftCardData[i].staff_needed;
           unfilledStaffCount += shiftCardData[i].staff_assigned;
        }
        return [filledStaffCount, unfilledStaffCount];
    }

    function handleUploadClick(){
        navigate("/employer/uploadjobs");
    }


    return (
    <div className="bg-tertiary-bg min-h-screen flex flex-col px-16 py-8 gap-8 ">
        <div id = "DashboardHeader" className="flex flex-row w-full justify-between">
            <div className="flex flex-col gap-2">
                <p className="text-lg text-secondary-text font-montserrat-smb">Welcome Back,</p>
                <p className="text-2xl text-primary-text font-montserrat-b">Marriot Plaza</p>
            </div>
            <div className = "flex flex-row items-center gap-12">
                <IconButton onClick={()=>{handleUploadClick()}}text="Upload Jobs" src="/public/icons/uploadicon.png"/>
                <CircleButton className="circle-button" src = "/icons/notifications.svg"/>
            </div>
        </div>
        <div className="flex flex-row gap-10">
            <DashboardUpcoming shifts={shifts}/>
            <div className="grow flex flex-col gap-15">
                <DashboardPositions shifts={shifts} calculateFilled={calculateFilled}/>
                <DashboardInProgress shifts={shifts}/>
            </div>
        </div>
    </div>
    )
}

function DashboardUpcoming({ shifts }: { shifts: Shift[] }){
    return <div className="bg-secondary-bg grow flex flex-col p-8 rounded-3xl gap-8">
        <div className="flex flex-row gap-4 items-center">
            <img className="h-5 w-5"src="/icons/calendar.svg"/>
            <h1 className="text-xl text-secondary-text font-montserrat-b">Upcoming Shifts</h1>
        </div>
        {shifts && <div className="overflow-hidden">
                <ul className="z-50 flex flex-col gap-8 animate-slidedown">
                    {shifts.map((shift) => shift.staff_assigned == shift.staff_needed? <li><ShiftCard {...shift}/></li>: null)}
                </ul>
        </div>
        }
    </div>
}

function DashboardPositions({shifts, calculateFilled}: {shifts: Shift[], calculateFilled: Function}){
    return <div className="bg-secondary-bg flex flex-row p-8 gap-13 rounded-3xl justify-between items-center">
        <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-4 items-center">
                <img className = "h-5 w-5" src="/public/icons/personicon.svg"/>
                <h1 className="text-xl text-secondary-text font-montserrat-b">Positions</h1>
            </div>
            <p className="text-3xl font-montserrat-b text-primary-text">{`${calculateFilled(shifts)[0]}/${calculateFilled(shifts)[0] + calculateFilled(shifts)[1]} `}<span className="text-base font-montserrat text-primary-text">Filled</span></p>
        </div>
        <div className="relative">
            <PieChart series={[
                {
                innerRadius: 45,
                data: [
                    { id: 0, value: calculateFilled(shifts)[1]+ calculateFilled(shifts)[0], color: "oklch(0.48 0.27 263.26)"},
                    { id: 1, value: calculateFilled(shifts)[1], color: "#FFFFFF" },
                ],
                
                },
            ]}
            width={172}
            height={172}/>
            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-montserrat-b text-3xl">{`${Math.floor(calculateFilled(shifts)[0]/(calculateFilled(shifts)[0] + calculateFilled(shifts)[1]) * 100)}%`}</p>
        </div>
    </div>
}

function DashboardInProgress({ shifts }: { shifts: Shift[] }){
    return <div className="bg-secondary-bg grow flex flex-col p-8 rounded-3xl gap-8">
        <div className="flex flex-row gap-4 items-center">
            <img className="h-5 w-5"src="/icons/calendar.svg"/>
            <h1 className="text-xl text-secondary-text font-montserrat-b">In Progress</h1>
        </div>
        <div className="overflow-hidden">
            <ul className="flex flex-col gap-8 animate-slidedown">
                {shifts.map((shift) => shift.staff_assigned < shift.staff_needed? <li><ShiftCard {...shift}/></li> : null)}
            </ul>
        </div>
    </div>
}