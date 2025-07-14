// import EmployeeShiftDetails from "../../components/EmployeeShiftDetails";
import EmployeeCalendarHeader from "../../components/EmployeeCalendarHeader";
// import EmployeeCalendarDay from "../../components/EmployeeCalendarDay";
import { EmployeeShiftProps } from "../../types/components";
import { useState } from "react";

export default function JSSchedule() {
  const [selectedShift, setSelectedShift] = useState<EmployeeShiftProps | null>(
    null
  );

  const shiftData: EmployeeShiftProps[] = [
    {
      id: 1,
      startTime: "8:00 AM",
      endTime: "4:00 PM",
      date: "23 May 2025",
      location: "Tangs Plaza",
      title: "Front Desk Receptionist",
      payRate: 20,
    },
    {
      id: 2,
      startTime: "9:00 AM",
      endTime: "5:00 PM",
      date: "25 May 2025",
      location: "Tangs Plaza",
      title: "Housekeeping Staff",
      payRate: 18,
    },
    {
      id: 3,
      startTime: "7.00 AM",
      endTime: "3.00 PM",
      date: "22 May 2025",
      location: "JW",
      title: "Kitchen Staff",
      payRate: 22,
    },
  ];

  const days = [
    { name: "Mon", date: "22 May 2025" },
    { name: "Tue", date: "23 May 2025" },
    { name: "Wed", date: "24 May 2025" },
    { name: "Thu", date: "25 May 2025" },
    { name: "Fri", date: "26 May 2025" },
    { name: "Sat", date: "27 May 2025" },
    { name: "Sun", date: "28 May 2025" },
  ];

  const handleShiftClick = (shift: EmployeeShiftProps) => {
    setSelectedShift(shift);
  };

  const handleCloseDetails = () => {
    setSelectedShift(null);
  };

  return (
    <div className="bg-tertiary-bg min-h-full flex flex-col px-16 py-8 gap-4">
      <p className="text-3xl text-secondary-text font-montserrat-b">
        Weekly Schedule
      </p>

      <div
        className={`flex flex-col grow bg-white rounded-2xl overflow-hidden transition-opacity duration-300 ${
          selectedShift ? "opacity-50" : "opacity-100"
        }`}
      >
        {/* Calendar Header */}
        <EmployeeCalendarHeader days={days} />
      </div>
    </div>
  );
}
