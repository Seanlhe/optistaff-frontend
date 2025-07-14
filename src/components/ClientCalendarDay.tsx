import ClientShiftCard from "./ClientShiftCard";
import { ClientShiftProps } from "../types/components";
import {
  filterShiftsByDateAndLocation,
  sortShiftsByTime,
  formatDateDisplay,
} from "../utils/ClientShiftUtils";

interface CalendarDayProps {
  day: { name: string; date: string };
  shiftData: ClientShiftProps[];
  selectedLocation: string;
  selectedShift: ClientShiftProps | null;
  onShiftClick: (shift: ClientShiftProps) => void;
}

export default function ClientCalendarDay({
  day,
  shiftData,
  selectedLocation,
  selectedShift,
  onShiftClick,
}: CalendarDayProps) {
  const dayShifts = sortShiftsByTime(
    filterShiftsByDateAndLocation(shiftData, day.date, selectedLocation)
  );

  return (
    <div className="bg-white px-2 grow">
      {/* Date Header */}
      <div className="pb-2">
        <h2 className="text-sm font-montserrat">{day.name}</h2>
        <p className="text-xl font-semibold">{formatDateDisplay(day.date)}</p>
      </div>

      {/* Shift Cards */}
      <div className="space-y-2">
        {dayShifts.map((shift) => (
          <div key={shift.id}>
            <ClientShiftCard
              {...shift}
              onShiftClick={onShiftClick}
              isSelected={selectedShift?.id === shift.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
