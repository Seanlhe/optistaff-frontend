import { JSX } from "react";
import { Shift } from "../types/hooks";
import { format } from "date-fns";

interface ClientShiftCardProps extends Shift {
  onShiftClick?: (shift: Shift) => void;
  isSelected?: boolean;
}

export default function ClientShiftCard({
  shift_id,
  client_id,
  title,
  description,
  start_time,
  end_time,
  pay_rate,
  job_location,
  staff_needed,
  staff_assigned,
  submission_cycle,
  created_at,
  break_duration,
  status,
  onShiftClick,
  isSelected = false,
}: ClientShiftCardProps): JSX.Element {
  const isFilled = staff_assigned >= staff_needed;
  const borderColor = isFilled ? "border-l-green-dark" : "border-l-red-dark";
  const bgColor = isFilled ? "bg-green" : "bg-red";

  // Format times for display
  const startTimeFormatted = format(start_time, "h:mm a");
  const endTimeFormatted = format(end_time, "h:mm a");

  const handleClick = () => {
    if (onShiftClick) {
      onShiftClick({
        shift_id,
        client_id,
        title,
        description,
        start_time,
        end_time,
        pay_rate,
        job_location,
        staff_needed,
        staff_assigned,
        submission_cycle,
        created_at,
        break_duration,
        status,
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${borderColor} ${bgColor} border-l-4 cursor-pointer p-2 rounded mb-1 max-h-30 min-h-30 overflow-hidden transition-all duration-200 ${
        isSelected ? "ring-2 ring-gray-300 ring-opacity-50" : "hover:shadow-sm"
      }`}
    >
      <div className="flex items-start mb-1.5">
        <span className="text-sm font-medium">
          {startTimeFormatted} to
          <br />
          {endTimeFormatted}
        </span>
      </div>

      <p className="text-xs font-medium mb-1.5 line-clamp-2 leading-tight">
        {title}
      </p>
      <div className="flex items-center text-xs">
        <img
          src="/icons/person.svg"
          alt="Calendar Icon"
          className="h-3 w-3 mr-1 brightness-0"
        />
        <span>
          {staff_assigned}/{staff_needed}
        </span>
      </div>
    </div>
  );
}
