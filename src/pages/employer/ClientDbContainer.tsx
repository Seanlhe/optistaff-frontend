import { Shift } from "../../types/hooks";
import { useState, useCallback, useEffect } from "react";
import { useShifts } from "../../hooks/useShifts";
import ClientEdit from "./ClientEdit";
import ClientDashboard from "./ClientDashboard";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns"; // Using date-fns for date manipulation

export default function ClientDbContainer() {
  const { shifts, deleteShift, refetchShifts } = useShifts();
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const handleManageClick = (shift: Shift) => {
    setSelectedShift(shift);
  };

  const handleDeleteShift = async (shiftId: string) => {
    await deleteShift(shiftId);
    // The deleteShift function in useShifts already calls fetchShifts()
    // so no additional refresh needed
  };

  const handleCloseEdit = useCallback(() => {
    setSelectedShift(null);
    // Refresh data after editing to show updated information
    refetchShifts();
  }, [refetchShifts]);

  // Simple window focus refresh - only if data might be stale (5+ minutes)
  useEffect(() => {
    const handleFocus = () => {
      const lastUpdate = localStorage.getItem('lastShiftUpdate');
      if (!lastUpdate || Date.now() - parseInt(lastUpdate) > 300000) { // 5 minutes
        refetchShifts();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchShifts]);

  const getShiftsThisWeek = (shifts: Shift[]) => {
    const now = new Date();
    // Get the start and end of the current week (assuming the week starts on Monday)
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 }); // 1 = Monday
    const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });
    // Filter shifts that fall within the current week
    return shifts.filter(shift => {
      const shiftStartTime = new Date(shift.start_time);
      return isWithinInterval(shiftStartTime, { start: startOfCurrentWeek, end: endOfCurrentWeek });
    });
  };
  
  const shiftsThisWeek = getShiftsThisWeek(shifts);

  return selectedShift ? (
    <ClientEdit 
      shift={selectedShift} 
      onClose={handleCloseEdit}
    />
  ) : (
    <ClientDashboard 
      shifts={shiftsThisWeek} 
      handleManageClick={handleManageClick}
      handleDeleteShift={handleDeleteShift}
    />
  );
}
