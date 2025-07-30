import { Shift } from "../types/hooks";
import { format } from "date-fns";
import { useState } from "react";
interface ClientShiftDetailsProps {
  shiftData: Shift;
  onClose?: () => void;
  onDelete?: (shift_id: string) => Promise<void>;
  onEdit?: (shift: Shift) => void;
}

export default function ClientShiftDetails({
  shiftData,
  onClose,
  onDelete,
  onEdit,
}: ClientShiftDetailsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this shift?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return; // User cancelled, don't proceed with deletion
    }

    try {
      setIsDeleting(true);
      await onDelete(shiftData.shift_id);

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to delete shift:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format times for display
  const startTimeFormatted = format(shiftData.start_time, "h:mm a");
  const endTimeFormatted = format(shiftData.end_time, "h:mm a");
  return (
    <div className="bg-white p-4 rounded-lg w-150">
      {/* Header with Close Button */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-secondary-text text-sm mb-1">Title</p>
          <h2 className="text-xl font-semibold">{shiftData.job_title}</h2>
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
        <p className="text-secondary-text text-sm mb-1">Shift Time</p>
        <p className="text-lg font-medium">
          {startTimeFormatted} - {endTimeFormatted}
        </p>
      </div>

      {/* Location */}
      <div className="mb-4">
        <p className="text-secondary-text text-sm mb-1">Location</p>
        <p className="text-lg font-medium">{shiftData.job_location}</p>
      </div>

      {/* Pay Rate */}
      <div className="mb-4">
        <p className="text-secondary-text text-sm mb-1">Pay Rate</p>
        <p className="text-lg font-medium">${shiftData.pay_rate.toFixed(2)}</p>
      </div>

      {/* Description */}
      {shiftData.job_description && (
        <div className="mb-4">
          <p className="text-secondary-text text-sm mb-1">Description</p>
          <p className="text-lg font-medium">{shiftData.job_description}</p>
        </div>
      )}

      {/* Filled / Required */}
      <div>
        <p className="text-secondary-text text-sm mb-1">Filled / Required</p>
        <p className="text-lg font-medium">
          {shiftData.staff_assigned} / {shiftData.staff_needed}
        </p>
      </div>

      {/* Edit and Delete Buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <button
          className="bg-primary-blue text-white px-4 py-2 rounded-lg hover:opacity-80 transition-colors"
          onClick={() => onEdit && onEdit(shiftData)}
        >
          Edit
        </button>

        {/* Delete Button - Only show if status is NOT "completed" */}
        {shiftData.status !== "completed" && (
          <button
            className={`bg-red-dark text-white px-4 py-2 rounded-lg hover:bg-red transition-colors ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
