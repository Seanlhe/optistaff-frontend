import { JSX } from "react";
import { EmployeeShiftProps } from "../types/components";

interface EmployeeShiftCardProps extends EmployeeShiftProps {
  onShiftClick?: (shift: EmployeeShiftProps) => void;
  isSelected?: boolean;
}

export default function EmployeeShiftCard({
  id,
  startTime,
  endTime,
  date,
  location,
  title,
  payRate,
  onShiftClick,
  isSelected = false,
}: EmployeeShiftCardProps): JSX.Element {
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
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-card-color cursor-pointer p-2 rounded mb-1 transition-all duration-200 ${
        isSelected ? "ring-2 ring-gray-300 ring-opacity-50" : "hover:shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-medium text-gray-900">
          {startTime} - {endTime}
        </span>
      </div>

      <p className="text-xs font-medium text-gray-900 mb-1">{title}</p>
      <div className="flex items-center text-xs text-gray-600">
        <img
          src="/icons/person.svg"
          alt="Employee Icon"
          className="w-4 h-4 mr-1 brightness-0"
        />
        <span className="text-gray-800">{location}</span>
      </div>
    </div>
  );
}
