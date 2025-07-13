import { JSX } from "react";
import { ClientShiftProps } from "../types/components";

function onClick() {
  // Handle click event, e.g., navigate to shift details
  console.log("Shift card clicked");
}

export default function ClientShiftCard({
  id,
  startTime,
  endTime,
  date,
  location,
  title,
  payRate,
  employeeName,
  filled,
  required,
}: ClientShiftProps): JSX.Element {
  const isFilled = filled >= required;
  const borderColor = isFilled ? "border-l-green-400" : "border-l-red-500";
  const bgColor = isFilled ? "bg-green-50" : "bg-red-50";
  const statusIcon = isFilled ? "✓" : "ⓘ";

  return (
    <div
      onClick={onClick}
      className={`${borderColor} ${bgColor} border-l-4 cursor-pointer p-2 rounded mb-1`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-medium text-gray-900">{startTime}</span>
        <span className="text-gray-500 text-sm">{statusIcon}</span>
      </div>

      <p className="text-xs font-medium text-gray-900 mb-1">
        {title} @ {location}
      </p>
      <div className="flex items-center text-xs text-gray-600">
        <img
          src="/icons/personicon.svg"
          alt="Calendar Icon"
          className="h-3 w-3 mr-1"
        />
        <span>
          {filled}/{required}
        </span>
      </div>
    </div>
  );
}
