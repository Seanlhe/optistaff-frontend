import { ClientShiftProps } from "../types/components";

export default function ClientShiftDetails({
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
}: ClientShiftProps) {
  return (
    <div className="bg-white p-4 rounded-lg w-64">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 mb-1">Date: {date}</p>
      <p className="text-gray-600 mb-1">
        Time: {startTime} - {endTime}
      </p>
      <p className="text-gray-600 mb-1">Location: {location}</p>
      <p className="text-gray-600 mb-1">Pay Rate: ${payRate.toFixed(2)}</p>
      {employeeName && (
        <p className="text-gray-600 mb-1">Assigned Employee: {employeeName}</p>
      )}
      <p className="text-gray-600">
        Filled: {filled} / Required: {required}
      </p>
    </div>
  );
}
