import { JSX } from "react";
import { ClientShiftProps } from "../types/components";

interface ClientShiftCardProps extends ClientShiftProps {
  onShiftClick?: (shift: ClientShiftProps) => void;
  isSelected?: boolean;
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
  onShiftClick,
  isSelected = false,
}: ClientShiftCardProps): JSX.Element {
  const isFilled = filled >= required;
  const borderColor = isFilled
    ? "border-l-button-color"
    : "border-l-card-red-accent";
  const bgColor = isFilled ? "bg-card-color" : "bg-card-red";
  const statusIcon = isFilled ? "✓" : "ⓘ";

  const handleClick = () => {
    if (onShiftClick) {
      onShiftClick({
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
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${borderColor} ${bgColor} border-l-4 cursor-pointer p-2 rounded mb-1 transition-all duration-200 ${
        isSelected ? "ring-2 ring-gray-300 ring-opacity-50" : "hover:shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-medium text-gray-900">
          {startTime} - {endTime}
        </span>
        <span className="text-gray-500 text-sm">{statusIcon}</span>
      </div>

      <p className="text-xs font-medium text-gray-900 mb-1">{title}</p>
      <div className="flex items-center text-xs text-gray-600">
        <img
          src="/icons/person.svg"
          alt="Calendar Icon"
          className="h-3 w-3 mr-1 brightness-0"
        />
        <span>
          {filled}/{required}
        </span>
      </div>
    </div>
  );
}
