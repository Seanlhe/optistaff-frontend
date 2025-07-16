import EmployeeShiftDetails from "../../components/EmployeeShiftDetails";
import EmployeeCalendarDay from "../../components/EmployeeCalendarDay";
import EmployeeCalendarHeader from "../../components/EmployeeCalendarHeader";
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

        {/* Calendar Days */}
        <div className="grow grid grid-cols-7 divide-x-2 divide-gray-200 px-4 pt-2 pb-4">
          {days.map((day) => (
            <EmployeeCalendarDay
              key={day.date}
              day={day}
              shiftData={shiftData}
              selectedShift={selectedShift}
              onShiftClick={handleShiftClick}
            />
          ))}
        </div>
      </div>

      {/* Shift Details Overlay */}
      {selectedShift && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-opacity-50"
          onClick={handleCloseDetails}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-auto overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <EmployeeShiftDetails
              {...selectedShift}
              onClose={handleCloseDetails}
            />
          </div>
        </div>
      )}
    </div>
  );
}
