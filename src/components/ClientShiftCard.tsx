import { JSX } from "react";
import { Shift } from "../types/hooks";
import { format } from "date-fns";

interface ClientShiftCardProps {
  shiftData: Shift;
  onShiftClick?: (shift: Shift) => void;
  isSelected?: boolean;
}

export default function ClientShiftCard({
  shiftData,
  onShiftClick,
  isSelected = false,
}: ClientShiftCardProps): JSX.Element {
  const isFilled = shiftData.staff_assigned >= shiftData.staff_needed;
  const borderColor = isFilled ? "border-l-green-dark" : "border-l-red-dark";
  const bgColor = isFilled ? "bg-green" : "bg-red";

  // Format times for display
  const startTimeFormatted = format(shiftData.start_time, "h:mm a");
  const endTimeFormatted = format(shiftData.end_time, "h:mm a");

  const handleClick = () => {
    if (onShiftClick) {
      onShiftClick(shiftData);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${borderColor} ${bgColor} border-l-4 cursor-pointer p-2 rounded mb-1 max-h-30 min-h-30 overflow-hidden transition-all duration-200 ${
        isSelected ? "ring-2 ring-gray-300 ring-opacity-50" : "hover:shadow-sm"
      }`}
    >
      <p className="font-montserrat-smb mb-1.5 line-clamp-2 leading-tight">
        {shiftData.job_title}
      </p>

      <div className="flex items-start mb-1.5">
        <span className="text-sm font-medium">
          {startTimeFormatted} to
          <br />
          {endTimeFormatted}
        </span>
      </div>

      <div className="flex items-center text-xs">
        <img
          src="/icons/person.svg"
          alt="Calendar Icon"
          className="h-3 w-3 mr-1 brightness-0"
        />
        <span>
          {shiftData.staff_assigned}/{shiftData.staff_needed}
        </span>
      </div>
    </div>
  );
}
