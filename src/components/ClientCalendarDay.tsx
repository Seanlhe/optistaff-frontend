import ClientShiftCard from "./ClientShiftCard";
import { Shift } from "../types/hooks";
import { format, isSameDay } from "date-fns";

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
  const dayShifts = shiftData
    .filter((shift) => {
      // Parse the day date (format: "22 May 2025")
      const dayDate = new Date(day.date);

      // Get the shift date
      const shiftDate = new Date(shift.start_time);

      // Check if same day and location
      const sameDay = isSameDay(dayDate, shiftDate);
      const sameLocation = shift.job_location === selectedLocation;

      return sameDay && sameLocation;
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
          <div key={shift.shift_id}>
            <ClientShiftCard
              {...shift}
              onShiftClick={onShiftClick}
              isSelected={selectedShift?.shift_id === shift.shift_id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
