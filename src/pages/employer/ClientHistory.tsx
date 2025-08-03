import { useShifts } from "../../hooks/useShifts";
import { Shift, Assignment, Feedback } from "../../types/hooks";
import { format } from "date-fns";
import { reviewError, validateReview } from "../../utils/review";
import { useState, useEffect } from "react";
import { useFeedback } from "../../hooks/useFeedback";
import { useAssignments } from "../../hooks/useAssignments";

export default function ClientHistory() {
  const { shifts } = useShifts();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pastShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.start_time);
    return shiftDate < today;
  });
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const {fetchAssignmentsByShift } = useAssignments();
  const [selAssignment, setSelAssignment] = useState<Assignment|null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift|null>(null);

  // Handle window focus to refresh data
  useEffect(() => {
    const handleFocus = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
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
  }, [selectedShift, refreshTrigger]); // Add refreshTrigger as dependency

  const handleSelectShift = (shift: Shift) => {
    setSelectedShift(shift);
    console.log("shift selected");
    console.log(assignments);
  };
  const handleModalClick = (a: Assignment) => {
    setSelAssignment(a);
  };

  const handleModalClose = ()=>{
    setSelAssignment(null);
  }

  const handleSort = () => {
    console.log("sorting");
  };

  return (
    <div className="bg-tertiary-bg min-h-screen flex flex-col px-12 py-6 gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xl text-primary-text font-montserrat-b">History</p>
        <p className="text-md text-secondary-text font-montserrat-smb">
          View past completed jobs and rate past employees
        </p>
      </div>
      <div
        id="history-content"
        className="flex flex-row gap-6 h-[calc(100vh-150px)]"
      >
        <HistoryPastShifts handleSort={handleSort} handleSelectShift={handleSelectShift} pastShifts={pastShifts} selectedShift={selectedShift}/>
        <HistoryAssignedStaff handleModalClick={handleModalClick}  assignments={assignments}/>
      </div>
      {selAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-80 backdrop-blur-sm">
          <RatingModal
            assignment={selAssignment}
            handleClose={handleModalClose}
          />
        </div>
      )}
    </div>
  );
}

function HistoryRateCard({
  handleClick,
  assignment,
}: {
  handleClick: Function;
  assignment: Assignment;
}) {
  return (
    <div className="w-full flex flex-row justify-between items-center bg-white p-3 rounded-lg">
      <div className="flex flex-row items-center gap-3">
        <img className="bg-[#D9D9D9] rounded-full w-12 h-12" src="" />
        <div className="flex flex-col">
          <p className="font-montserrat text-sm text-primary-text">
            {assignment.employee_name}
          </p>
        </div>
      </div>
      <button
        onClick={() => handleClick()}
        className="hover:bg-gray-100 hover:cursor-pointer border border-primary-text text-primary-text font-montserrat px-2 py-1 rounded-md text-xs"
      >
        Review
      </button>
    </div>
  );
}

export function HistoryPastShifts({handleSort, handleSelectShift, pastShifts, selectedShift}: {handleSort: Function; handleSelectShift: Function; pastShifts: Shift[]; selectedShift: Shift|null}){
    return <div id="previous-jobs" className="grow flex flex-col gap-4">
          <div className="flex flex-row justify-between mb-2">
            <p className="font-montserrat-b text-lg text-primary-text">
              Previous Jobs
            </p>
            <button
              onClick={() => handleSort()}
              className="hover:cursor-pointer hover:opacity-80 flex flex-col items-center justify-center bg-[#D9D9D9] rounded-full h-8 w-8"
            >
              <img className="w-3 h-3" src="/icons/sorticon.svg" />
            </button>
          </div>
          <div
            className="overflow-auto pr-2"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {pastShifts.length != 0 ? (
              pastShifts.map((shift) => (
                <div className="mb-4" key={shift.shift_id}>
                  <PastShiftCard
                    selectedShift={selectedShift}
                    shift={shift}
                    handleSelectShift={() => handleSelectShift(shift)}
                  />
                </div>
              ))
            ) : (
              <p className="font-montserrat text-secondary-text text-sm">
                No past shifts found. Click upload jobs to create new listings
              </p>
            )}
          </div>
        </div>
}

export function HistoryAssignedStaff({handleModalClick,  assignments}:{handleModalClick: Function; assignments: Assignment[]}){
    return <div className="w-96 flex flex-col gap-4 p-4 rounded-xl bg-secondary-bg">
          <p className="font-montserrat-b text-lg text-primary-text mb-2">
            Assigned Staff
          </p>
          <div
            className="overflow-auto"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {assignments.length > 0 ? (
              assignments.map((a) => (
                <div className="mb-3" key={a.assignment_id}>
                  <HistoryRateCard
                    assignment={a}
                    handleClick={() => handleModalClick(a)}
                  />
                </div>
              ))
            ) : (
              <p className="self-center font-montserrat text-secondary-text text-sm">
                Select a job. Display staff here.
              </p>
            )}
          </div>
        </div>
}

function PastShiftCard({
  shift,
  selectedShift,
  handleSelectShift,
}: {
  shift: Shift;
  selectedShift: Shift | null;
  handleSelectShift: Function;
}) {
  return (
    <div
      onClick={() => handleSelectShift()}
      className={`${selectedShift == shift ? "border-primary-blue border" : "border-[#B3B3B3]"} hover:cursor-pointer border flex flex-row items-center justify-between rounded-lg`}
    >
      <div className="w-full flex flex-col gap-3 rounded-lg p-3">
        <p className="text-sm font-montserrat-b text-primary-text">
          {shift.job_title}
        </p>
        <div className="flex flex-row gap-2 items-center">
          <img className="w-4 h-4" src="/icons/map.svg" />
          <p className="text-xs font-montserrat text-secondary-text">
            {shift.job_location}
          </p>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <img className="w-4 h-4" src="/icons/calendar.svg" />
          <p className="text-xs font-montserrat text-secondary-text">
            {format(shift.start_time, "EEEE, dd/MM/yyyy")}
          </p>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <img className="w-4 h-4" src="/icons/clock.svg" />
          <p className="text-xs font-montserrat text-secondary-text">{`${format(shift.start_time, "hh:mm a")} - ${format(shift.end_time, "hh:mm a")}`}</p>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <img className="w-4 h-4" src="/icons/users.svg" />
          <p className="text-xs font-montserrat text-secondary-text">
            {shift.staff_needed}
          </p>
        </div>
      </div>
    </div>
  );
}

function RatingModal({
  handleClose,
  assignment,
}: {
  handleClose: Function;
  assignment: Assignment;
}) {
  const { submitFeedback } = useFeedback();
  const [error, setError] = useState<reviewError>({
    rating_score: null,
    comment: null,
  });
  const [displayError, setDisplayError] = useState<boolean>(false);

  const [feedbackData, setFeedbackData] = useState<Partial<Feedback>>({
    assignment_id: assignment.assignment_id,
    reviewee_id: assignment.employee_id,
    comment: "",
    rating_score: 0,
  });
  async function handleSubmit() {
    setDisplayError(true);
    setError({
      rating_score: null,
      comment: null,
    });
    const newError = validateReview(feedbackData);
    setError(newError);
    console.log(newError);
    const isValid = Object.values(newError).every((value) => value === null);
    console.log(feedbackData, displayError);
    if (isValid) {
      await submitFeedback(feedbackData);
      setDisplayError(false);
    }
  }

  return (
    <div className="relative w-100 flex flex-col bg-white rounded-lg gap-6 p-6 shadow">
      <div className="flex flex-row gap-4 items-center">
        <img className="bg-[#D9D9D9] rounded-full w-14 h-14" src="" />
        <p className="font-montserrat-b text-lg text-primary-text">
          {assignment.employee_name}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <p className="font-montserrat-smb text-secondary-text text-sm">
          Help us improve your working experience by rating this employee.
        </p>
        <div className="hover:cursor-pointer self-center flex flex-row gap-2">
          {feedbackData &&
            feedbackData.rating_score !== undefined &&
            [...Array(5)].map((_, index) => (
              <img
                key={index}
                src={
                  feedbackData.rating_score &&
                  feedbackData.rating_score - 1 >= index
                    ? "/icons/activestaricon.svg"
                    : "/icons/ratingstaricon.svg"
                }
                alt={`Star ${index + 1}`}
                onClick={() => {
                  setFeedbackData((prevData) => ({
                    ...prevData,
                    rating_score: index + 1,
                  }));
                }}
              />
            ))}
        </div>
        {displayError && error.rating_score ? (
          <p className="self-center font-montserrat text-pink-500 text-xs">
            {error.rating_score}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">
        <p className="font-montserrat-smb text-secondary-text text-sm">
          Write up to 50 characters
        </p>
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
          className="bg-[#F2F2F2] rounded-lg font-montserrat text-secondary-text h-40 p-3 text-sm"
        />
        {displayError && error.comment ? (
          <p className="self-center font-montserrat text-pink-500 text-xs">
            {error.comment}
          </p>
        ) : null}
      </div>
      <button
        className="hover:cursor-pointer absolute top-3 right-3"
        onClick={() => handleClose()}
      >
        <img src="/icons/crossicon.svg" />
      </button>
      <button
        onClick={() => handleSubmit()}
        className="hover:cursor-pointer hover:opacity-80 bg-primary-blue rounded-lg py-2 text-white font-montserrat text-sm"
      >
        Rate
      </button>
    </div>
  );
}
