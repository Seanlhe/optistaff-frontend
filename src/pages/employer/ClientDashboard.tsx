import IconButton from "../../components/IconButton"
import CircleButton from "../../components/CircleButton"
import ShiftCard from "../../components/ShiftCard"
import { ShiftCardProps } from "../../types/components"
import { useNavigate } from "react-router-dom"
import type {} from '@mui/x-charts/themeAugmentation';
import { PieChart } from '@mui/x-charts';


export default function ClientDashboard(){
    const navigate = useNavigate();

    const ShiftCardData: ShiftCardProps[] = [
        {title: "Front Desk", date: "Today", time: "8:00am - 1:30pm", staffNo: 3, unfilledStaff: 0},
        {title: "Front Desk", date: "Today", time: "8:00am - 1:30pm", staffNo: 3, unfilledStaff: 0},
        {title: "Front Desk", date: "Today", time: "8:00am - 1:30pm", staffNo: 2, unfilledStaff: 3},
    ]

    function calculateFilled(shiftCardData: ShiftCardProps[]): number[]{
        let filledStaffCount = 0;
        let unfilledStaffCount = 0;
        for (let i: number = 0; i < shiftCardData.length; i++){
           filledStaffCount += shiftCardData[i].staffNo;
           unfilledStaffCount += shiftCardData[i].unfilledStaff;
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
                <p className="text-2xl text-secondary-text font-montserrat-smb">Welcome Back,</p>
                <h1 className="text-4xl text-secondary-text font-montserrat-b">Marriot Plaza</h1>
            </div>
            <div className = "flex flex-row items-center gap-12">
                <IconButton onClick={()=>{handleUploadClick()}}text="Upload Jobs" src="/public/icons/uploadicon.png"/>
                <CircleButton className="circle-button" src = "/icons/notifications.svg"/>
            </div>
        </div>
        <div className="flex flex-row gap-10">
            <DashboardUpcoming data = {ShiftCardData}/>
            <div className="grow flex flex-col gap-15">
                <DashboardPositions data={ShiftCardData} calculateFilled={calculateFilled}/>
                <DashboardInProgress data={ShiftCardData}/>
            </div>
        </div>
    </div>
    )
}

function DashboardUpcoming({data}: {data: ShiftCardProps[]}){
    return <div className="bg-secondary-bg grow flex flex-col p-8 rounded-3xl gap-8">
        <div className="flex flex-row gap-4 items-center">
            <img className="h-7 w-7"src="/icons/calendar.svg"/>
            <h1 className="text-3xl text-secondary-text font-montserrat-b">Upcoming Shifts</h1>
        </div>
        <ul className="flex flex-col gap-8">
            {data.map((prop) => <li><ShiftCard {...prop}/></li>)}
        </ul>
    </div>
}

function DashboardPositions({data, calculateFilled}: {data: ShiftCardProps[], calculateFilled: Function}){
    return <div className="bg-secondary-bg flex flex-row p-8 gap-13 rounded-3xl justify-between items-center">
        <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-4 items-center">
                <img className = "h-7 w-7" src="/public/icons/personicon.svg"/>
                <h1 className="text-3xl text-secondary-text font-montserrat-b">Positions</h1>
            </div>
            <p className="text-4xl font-montserrat-b text-primary-text">{`${calculateFilled(data)[0]}/${calculateFilled(data)[0] + calculateFilled(data)[1]} `}<span className="text-base font-montserrat text-primary-text">Filled</span></p>
        </div>
        <div className="relative">
            <PieChart series={[
                {
                innerRadius: 45,
                data: [
                    { id: 0, value: calculateFilled(data)[1]+ calculateFilled(data)[0], color: "oklch(0.48 0.27 263.26)"},
                    { id: 1, value: calculateFilled(data)[1], color: "#FFFFFF" },
                ],
                
                },
            ]}
            width={172}
            height={172}/>
            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-montserrat-b text-3xl">{`${Math.floor(calculateFilled(data)[0]/(calculateFilled(data)[0] + calculateFilled(data)[1]) * 100)}%`}</p>
        </div>
    </div>
}

function DashboardInProgress({data}: {data: ShiftCardProps[]}){
    return <div className="bg-secondary-bg grow flex flex-col p-8 rounded-3xl gap-8">
        <div className="flex flex-row gap-4 items-center">
            <img className="h-7 w-7"src="/icons/calendar.svg"/>
            <h1 className="text-3xl text-secondary-text font-montserrat-b">In Progress</h1>
        </div>
        <ul className="flex flex-col gap-8">
            {data.map((prop) => <li><ShiftCard {...prop}/></li>)}
        </ul>
    </div>
}