import { EmployeeShiftProps } from "../types/components";

interface EmployeeShiftDetailsProps extends EmployeeShiftProps {
  onClose?: () => void;
}

export default function EmployeeShiftDetails({
  id,
  startTime,
  endTime,
  date,
  location,
  title,
  payRate,
  onClose,
}: EmployeeShiftDetailsProps) {
  return (
    <div className="bg-white p-4 rounded-lg">
      {/* Header with Close Button */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm mb-1">Title</p>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      {/* <p className="text-gray-500 mb-1">Date: {date}</p> */}

      {/* Shift Time */}
      <div className="mb-4">
        <p className="text-gray-500 text-sm mb-1">Shift Time</p>
        <p className="text-lg font-medium text-gray-900">
          {startTime} - {endTime}
        </p>
      </div>

      {/* Location */}
      <div className="mb-4">
        <p className="text-gray-500 text-sm mb-1">Location</p>
        <p className="text-lg font-medium text-gray-900">{location}</p>
      </div>

      {/* Pay Rate */}
      <div className="mb-4">
        <p className="text-gray-500 text-sm mb-1">Pay Rate</p>
        <p className="text-lg font-medium text-gray-900">
          ${payRate.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
