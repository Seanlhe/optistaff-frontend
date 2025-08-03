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
    return isWithinInterval(shiftStartTime, { start: startOfCurrentWeek, end: endOfCurrentWeek });
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

  const mockedShifts: Shift[] = [
    {
      shift_id: "shift002",
      employer_name: "Company B",
      company_name: "Company B",
      job_title: "Product Manager",
      job_location: "Singapore",
      postal_code: 654321,
      job_description: "Managing product",
      job_requirements: "5+ years experience",
      job_type: "Full-time",
      pay_rate: 70,
      start_time: addDays(new Date(), 1), // A date within the current week
      end_time: addDays(new Date(), 2),
      break_duration: 1,
      staff_needed: 4,
      staff_assigned: 2,
      submission_cycle: 'PRIMARY',
      status: "Open",
      created_at: new Date(),
    },
  ];

  return selectedShift ? (
    <ClientEdit shift={selectedShift} onClose={handleCloseEdit} />
  ) : (
    <ClientDashboard shifts={shiftsThisWeek} handleManageClick={handleManageClick} />
  );
}