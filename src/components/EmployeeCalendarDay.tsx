import EmployeeShiftCard from "./EmployeeShiftCard";
import { EmployeeShiftProps } from "../types/components";
import {
  filterShiftsByDate,
  sortShiftsByTime,
  formatDateDisplay,
} from "../utils/JSShifts";

interface EmployeeCalendarDayProps {
  day: { name: string; date: string };
  shiftData: EmployeeShiftProps[];
  selectedShift: EmployeeShiftProps | null;
  onShiftClick: (shift: EmployeeShiftProps) => void;
}

export default function EmployeeCalendarDay({
  day,
  shiftData,
  selectedShift,
  onShiftClick,
}: EmployeeCalendarDayProps) {
  const dayShifts = sortShiftsByTime(filterShiftsByDate(shiftData, day.date));

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
            <EmployeeShiftCard
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
