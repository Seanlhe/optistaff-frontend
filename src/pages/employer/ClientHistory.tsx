import { useShifts } from "../../hooks/useShifts";
import { Shift, Assignment} from "../../types/hooks";
import HistoryPastShifts from "../../components/HistoryPastShifts";
import HistoryAssignedStaff from "../../components/HistoryAssignedStaff";
import RatingModal from "../../components/RatingModal";
import { useState, useEffect } from "react";
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
          console.log("assignments:", result);
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






