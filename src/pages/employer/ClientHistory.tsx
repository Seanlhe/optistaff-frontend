import { useShifts } from "../../hooks/useShifts"
import { Shift, Feedback, Assignment } from "../../types/hooks"
import {format} from "date-fns"
import { useState, useEffect } from "react";
import { useFeedback } from "../../hooks/useFeedback";
import { useAssignments } from "../../hooks/useAssignments";
export default function ClientHistory(){
    const {shifts} = useShifts();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.start_time);
    return shiftDate < today;});
    console.log(pastShifts);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const {fetchAssignmentsByShift} = useAssignments();
    const [selectedShift, setSelectedShift] = useState<Shift|null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    useEffect(() => {
        console.log("fetching data");
        console.log(selectedShift?.shift_id);
        const fetchData = async () => {
          if (selectedShift) {
            const result = await fetchAssignmentsByShift(selectedShift.shift_id);
            if (result) {
                console.log(assignments);
                setAssignments(result);
            }
          } else {
            setAssignments([]); // Clear if no shift selected
          }
    };
        fetchData();
      }, [selectedShift]);

    const handleSelectShift = (shift: Shift) => {
        setSelectedShift(shift);
        console.log("shift selected");
        console.log(assignments)
    }
    const handleModalClick = () => {
        setModalVisible(!modalVisible);
    }
    const handleSort = () => {
        console.log("sorting");
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
                    <button onClick={() => handleSort()} className="hover:cursor-pointer hover:opacity-80 flex flex-col items-center justify-center bg-[#D9D9D9] rounded-full h-9 w-9"><img className="w-3 h-3"src="/icons/sorticon.svg"/></button>
                </div>
                {pastShifts.length != 0? pastShifts.map((shift) => (<PastShiftCard key={shift.shift_id} selectedShift={selectedShift} shift={shift} handleSelectShift={()=>handleSelectShift(shift)}/>)): <p className="font-montserrat text-secondary-text text-base">No past shifts found. Click upload jobs to create new listings</p>}
            </div>
            <div className="w-116 min-h-screen flex flex-col gap-6 p-5 rounded-xl bg-secondary-bg ">
                <p className="font-montserrat-b text-xl text-primary-text">Assigned Staff</p>
                {selectedShift != null && assignments.length > 0? assignments.map((a)=> <HistoryRateCard assignment={a} handleClick={handleModalClick}/>): <p className="self-center font-montserrat text-secondary-text text-base">Select a job. Display staff here.</p>}
                {selectedShift == null? null: null}
            </div>
        </div>
        {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-80 backdrop-blur-sm">
            <RatingModal handleClose={handleModalClick} />
        </div>
        )}
    </div>
}

function HistoryRateCard({handleClick, assignment}: {handleClick:Function, assignment:Assignment}){

    return <div className="w-full flex flex-row justify-between items-center bg-white p-5 rounded-lg">
        <div className="flex flex-row items-center gap-5">
            <img className="bg-[#D9D9D9] rounded-full w-18 h-18"src=""/>
            <div className="flex flex-col gap-2">
                <p className="font-montserrat text-base text-primary-text">{assignment.employee_name}</p>
            </div>
        </div>
        <button onClick={()=>handleClick()}className="hover:bg-gray-300 hover:cursor-pointer border-1 h-fit border-primary-text text-primary-text font-montserrat px-2 py-1 rounded-md">Review</button>
    </div>
}

function PastShiftCard({shift, selectedShift, handleSelectShift}: { shift: Shift, selectedShift: Shift|null, handleSelectShift: Function }){
    return <div onClick={()=>handleSelectShift()} className={`${selectedShift==shift?"border-primary-blue border-2":"border-[#B3B3B3]"} hover:cursor-pointer border flex flex-row  items-center justify-between rounded-2xl`}>
        <div className="w-full flex flex-col gap-4 rounded-2xl p-5"> 
            <p className="text-base font-montserrat-b text-primary-text mb-2">{shift.job_title}</p>
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

function RatingModal({handleClose}: {handleClose: Function}) {
    const {submitFeedback} = useFeedback();
    const [feedbackData, setFeedbackData] = useState<Partial<Feedback>>({
        // assignment_id: assignmentId,
        // reviewee_id: revieweeId,
        comment: "",
        rating_score: 0,
    });
    async function handleSubmit(){
        console.log(feedbackData);
        await submitFeedback(feedbackData);
    }

    return <div className="relative w-120 flex flex-col bg-white rounded-xl gap-8 p-8 shadow">
        <div className="flex flex-row gap-6 items-center">
            <img className="bg-[#D9D9D9] rounded-full w-18 h-18"src=""/>
            <p className="font-montserrat-b text-xl">Tony Chan</p>
        </div>
        <div className="flex flex-col gap-6">
            <p className="font-montserrat-smb text-secondary-text">Help us improve your working experience by rating this employee.</p>
            <div className="hover:cursor-pointer self-center flex flex-row gap-3">
                {feedbackData && feedbackData.rating_score !== undefined && [...Array(5)].map((_, index) => (
                    <img 
                    key={index}
                    src={(feedbackData.rating_score - 1) >= index ? "/icons/activestaricon.svg" : "/icons/ratingstaricon.svg"}
                    alt={`Star ${index + 1}`} 
                    onClick={() => {
                        setFeedbackData((prevData) => ({
                        ...prevData,
                        rating_score: index + 1
                        }));
                    }}
                    />
                ))}
        </div>
        </div>
        <div className="flex flex-col gap-6">
            <p className="font-montserrat-smb text-secondary-text">Write up to 50 characters</p>
            <textarea
                onChange={(e) => {
                    setFeedbackData((prevData) => ({
                    ...prevData,
                    comment: e.target.value,
                    }));
                }}
                name="comment"
                placeholder="Be as descriptive as possible"
                id="feedback_comment"
                className="bg-[#F2F2F2] rounded-lg font-montserrat text-secondary-text h-50 p-5"
            />
        </div> 
        <button className="hover:cursor-pointer absolute top-4 right-4"onClick={()=>handleClose()}><img src="/icons/crossicon.svg"/></button>
        <button onClick={()=>handleSubmit()}className="hover:cursor-pointer hover:opacity-80 bg-primary-blue rounded-lg py-2  text-white font-montserrat">Rate</button>
    </div>
}