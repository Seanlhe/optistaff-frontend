import { Shift } from "../../types/hooks";
import { useState } from "react";
import { useShifts } from "../../hooks/useShifts";
import ClientEdit from "./ClientEdit";
import ClientDashboard from "./ClientDashboard";
import { startOfWeek, endOfWeek, isWithinInterval, addDays, subDays } from "date-fns"; // Using date-fns for date manipulation

export const getShiftsThisWeek = (shifts: Shift[]) => {
  const now = new Date();
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 }); // 1 = Monday
  const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });
  return shifts.filter(shift => {
    const shiftStartTime = new Date(shift.start_time);
    return isWithinInterval(shiftStartTime, { start: startOfCurrentWeek, end: endOfCurrentWeek }) && shift.status != "cancel_by_employer";
  });
};

export default function ClientDbContainer() {
  const { shifts } = useShifts();
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const handleManageClick = (shift: Shift) => {
    setSelectedShift(shift);
  };

  const handleCloseEdit = () => {
    setSelectedShift(null);
  };

  
  const shiftsThisWeek = getShiftsThisWeek(shifts);

  return selectedShift ? (
    <ClientEdit shift={selectedShift} onClose={handleCloseEdit} />
  ) : (
    <ClientDashboard shifts={shiftsThisWeek} handleManageClick={handleManageClick} />
  );
}