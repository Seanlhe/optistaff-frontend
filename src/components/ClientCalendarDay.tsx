import ClientShiftCard from "./ClientShiftCard";
import { Shift } from "../types/hooks";
import { isSameDay } from "date-fns";

interface CalendarDayProps {
  day: { name: string; date: string };
  shiftData: Shift[];
  selectedLocation: string;
  selectedShift: Shift | null;
  onShiftClick: (shift: Shift) => void;
}

export default function ClientCalendarDay({
  day,
  shiftData,
  selectedLocation,
  selectedShift,
  onShiftClick,
}: CalendarDayProps) {
  const today = new Date();
  const dayShifts = shiftData
    .filter((shift) => {
      const dayDate = new Date(day.date);
      const shiftDate = new Date(shift.start_time);

      if (shiftDate < today) return false;

      // Check if same day and location
      const sameDay = isSameDay(dayDate, shiftDate);
      if (selectedLocation === "All Locations") {
        return sameDay;
      }

      const isCompleted = shift.status === "completed";

      const sameLocation = shift.job_location === selectedLocation;

      return sameDay && sameLocation && !isCompleted;
    })
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

  return (
    <div className="bg-white px-2 grow">
      {/* Date Header */}
      <div className="pb-2">
        <h2 className="text-sm font-montserrat">{day.name}</h2>
        <p className="text-xl font-semibold">
          {day.date.split(" ").slice(0, 2).join(" ")}
        </p>
      </div>

      {/* Shift Cards */}
      <div className="space-y-2">
        {dayShifts.map((shift) => (
          <ClientShiftCard
            shiftData={shift}
            key={shift.shift_id}
            onShiftClick={onShiftClick}
            isSelected={selectedShift?.shift_id === shift.shift_id}
          />
        ))}
      </div>
    </div>
  );
}
