import { useState, useRef, useEffect } from "react";
import {
  format,
  differenceInMinutes,
  addMinutes,
  addDays,
  set,
  isSameDay,
} from "date-fns";
import type { Event } from "./Calendar";

interface CalendarEventProps {
  event: Event;
  onUpdate: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

export const CalendarEvent = ({
  event,
  onUpdate,
  onDelete,
}: CalendarEventProps) => {
  // Constants
  const HOUR_HEIGHT = 48;
  const DAY_WIDTH = 200;

  // Validate dates and provide fallbacks
  const isValidStartTime =
    event.startTime instanceof Date && !isNaN(event.startTime.getTime());
  const isValidEndTime =
    event.endTime instanceof Date && !isNaN(event.endTime.getTime());

  // Calculate display properties with error handling
  let duration = 60; // Default 1 hour
  let height = HOUR_HEIGHT;
  let topOffset = 0;

  if (isValidStartTime && isValidEndTime) {
    try {
      duration = differenceInMinutes(event.endTime, event.startTime);
      // Ensure minimum duration for display
      if (duration <= 0) duration = 30;
      height = (duration / 60) * HOUR_HEIGHT;
      topOffset =
        event.startTime.getHours() * HOUR_HEIGHT +
        (event.startTime.getMinutes() / 60) * HOUR_HEIGHT;
    } catch (error) {
      // Use defaults if calculation fails
      duration = 60;
      height = HOUR_HEIGHT;
      topOffset = 0;
    }
  }

  // State
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const eventRef = useRef<HTMLDivElement>(null);

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (keyEvent: KeyboardEvent) => {
      if (
        isSelected &&
        (keyEvent.key === "Delete" || keyEvent.key === "Backspace")
      ) {
        if (onDelete && typeof onDelete === "function") {
          onDelete(event.id);
        }
      }
    };

    if (isSelected) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isSelected, event.id, onDelete]);

  // Handle dragging and selection
  const handleMouseDown = (mouseEvent: React.MouseEvent) => {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();

    if (!eventRef.current || !isValidStartTime || !isValidEndTime) return;

    // Check if click is on resize handle - if so, don't initiate drag
    if (mouseEvent.target instanceof Node) {
      const resizeHandle = eventRef.current.querySelector(".resize-handle");
      if (resizeHandle && resizeHandle.contains(mouseEvent.target)) {
        return; // Let handleResizeStart handle this
      }
    }

    // Toggle selection and initiate dragging
    setIsSelected((prev) => !prev);
    setIsDragging(true);

    const startX = mouseEvent.clientX;
    const startY = mouseEvent.clientY;
    const originalStart = event.startTime;
    const originalEnd = event.endTime;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaX = moveEvent.clientX - startX;

      // Calculate vertical movement in 15-minute increments
      const minutesMoved = Math.round(((deltaY / HOUR_HEIGHT) * 60) / 15) * 15;

      // Calculate horizontal movement in day increments
      const daysMoved = Math.round(deltaX / DAY_WIDTH);

      // Apply vertical time movement first (but keep on same day for now)
      let newStart = addMinutes(originalStart, minutesMoved);
      let newEnd = addMinutes(originalEnd, minutesMoved);

      // Get the current day boundaries before any day movement
      const currentDayStart = set(originalStart, {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      });
      const currentDayEnd = set(originalStart, {
        hours: 23,
        minutes: 59,
        seconds: 59,
        milliseconds: 999,
      });

      // Clamp to current day boundaries first (prevent auto day shifting)
      if (newStart < currentDayStart) {
        newStart = new Date(currentDayStart);
        newEnd = addMinutes(newStart, duration);
      }

      if (newEnd > currentDayEnd) {
        newEnd = new Date(currentDayEnd);
        newStart = addMinutes(newEnd, -duration);

        // If start time goes before day start after clamping end
        if (newStart < currentDayStart) {
          newStart = new Date(currentDayStart);
          const maxPossibleDuration = differenceInMinutes(
            currentDayEnd,
            currentDayStart,
          );
          newEnd = addMinutes(
            newStart,
            Math.min(duration, maxPossibleDuration),
          );
        }
      }

      // Now apply horizontal day movement if user dragged horizontally
      if (daysMoved !== 0) {
        newStart = addDays(newStart, daysMoved);
        newEnd = addDays(newEnd, daysMoved);

        // Get the new target day boundaries after day movement
        const targetDayStart = set(newStart, {
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        });
        const targetDayEnd = set(newStart, {
          hours: 23,
          minutes: 59,
          seconds: 59,
          milliseconds: 999,
        });

        // Ensure event stays within the target day boundaries
        if (newStart < targetDayStart) {
          newStart = new Date(targetDayStart);
          newEnd = addMinutes(newStart, duration);

          if (newEnd > targetDayEnd) {
            newEnd = new Date(targetDayEnd);
          }
        }

        if (newEnd > targetDayEnd) {
          newEnd = new Date(targetDayEnd);
          newStart = addMinutes(newEnd, -duration);

          if (newStart < targetDayStart) {
            newStart = new Date(targetDayStart);
            const maxPossibleDuration = differenceInMinutes(
              targetDayEnd,
              targetDayStart,
            );
            newEnd = addMinutes(
              newStart,
              Math.min(duration, maxPossibleDuration),
            );
          }
        }
      }

      // Calculate week boundaries (Monday to Sunday)
      const originalWeekStart = new Date(originalStart);
      const dayOfWeek = originalWeekStart.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1); // Sunday = 0, Monday = 1
      originalWeekStart.setDate(originalWeekStart.getDate() + mondayOffset);
      originalWeekStart.setHours(0, 0, 0, 0);

      const originalWeekEnd = addDays(originalWeekStart, 6);
      originalWeekEnd.setHours(23, 59, 59, 999);

      // Clamp to week boundaries if event moved outside current week
      if (newStart < originalWeekStart) {
        const daysToMove = Math.ceil(
          differenceInMinutes(originalWeekStart, newStart) / (60 * 24),
        );
        newStart = addDays(newStart, daysToMove);
        newEnd = addDays(newEnd, daysToMove);
      } else if (newEnd > originalWeekEnd) {
        const daysToMove = Math.ceil(
          differenceInMinutes(newEnd, originalWeekEnd) / (60 * 24),
        );
        newStart = addDays(newStart, -daysToMove);
        newEnd = addDays(newEnd, -daysToMove);
      }

      onUpdate({ ...event, startTime: newStart, endTime: newEnd });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  // FIX ENDS HERE

  // Handle resizing
  const handleResizeStart = (mouseEvent: React.MouseEvent) => {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();

    // Don't allow resize if dates are invalid
    if (!isValidStartTime || !isValidEndTime) return;

    setIsSelected(false);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!eventRef.current) return;

      const rect = eventRef.current.getBoundingClientRect();
      const newHeight = Math.max(HOUR_HEIGHT / 4, moveEvent.clientY - rect.top);

      // Snap to 15-minute increments
      const snappedHeight =
        Math.round(newHeight / (HOUR_HEIGHT / 4)) * (HOUR_HEIGHT / 4);
      const newDuration = Math.max(15, (snappedHeight / HOUR_HEIGHT) * 60); // Minimum 15 minutes

      let newEndTime = addMinutes(event.startTime, newDuration);

      // Get the day boundary (strict 23:59:59)
      const dayEnd = set(event.startTime, {
        hours: 23,
        minutes: 59,
        seconds: 59,
        milliseconds: 999,
      });

      // Clamp end time to day boundary - no crossing midnight
      if (newEndTime > dayEnd) {
        newEndTime = dayEnd;
      }

      onUpdate({ ...event, endTime: newEndTime });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle double-click delete
  const handleDoubleClick = (clickEvent: React.MouseEvent) => {
    clickEvent.stopPropagation();
    onDelete(event.id);
  };

  return (
    <div
      ref={eventRef}
      className={`
        absolute left-1 right-1 rounded border p-1 cursor-grab select-none
        ${
          isSelected
            ? "bg-primary-blue border-primary-blue"
            : "bg-primary-blue/40 border-primary-blue/60"
        }
        ${!isSelected ? "hover:bg-primary-blue/80 hover:border-primary-blue" : ""}
        ${isDragging ? "opacity-50 cursor-grabbing" : ""}
      `}
      style={{
        top: `${topOffset}px`,
        height: `${height}px`,
        userSelect: "none",
        zIndex: isDragging ? 10 : 1,
      }}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onFocus={() => setIsSelected(true)}
      onBlur={() => {
        if (!isDragging) {
          setIsSelected(false);
        }
      }}
    >
      <div className="text-xs text-white overflow-hidden h-full">
        {isValidStartTime ? format(event.startTime, "HH:mm") : "--:--"} -{" "}
        {isValidEndTime ? format(event.endTime, "HH:mm") : "--:--"}
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-2 bg-primary-blue cursor-ns-resize rounded-b opacity-0 hover:opacity-100 resize-handle"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};
export default CalendarEvent;
