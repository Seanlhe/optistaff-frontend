import { useState, useRef, useEffect } from "react";
import { format, differenceInMinutes, addMinutes, addDays } from "date-fns";
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

  // Calculate display properties
  const duration = differenceInMinutes(event.endTime, event.startTime);
  const height = (duration / 60) * HOUR_HEIGHT;
  const topOffset =
    event.startTime.getHours() * HOUR_HEIGHT +
    (event.startTime.getMinutes() / 60) * HOUR_HEIGHT;

  // State
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const eventRef = useRef<HTMLDivElement>(null);

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (keyEvent: KeyboardEvent) => {
      if (isSelected && (keyEvent.key === 'Delete' || keyEvent.key === 'Backspace')) {
        onDelete(event.id);
      }
    };

    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelected, event.id, onDelete]);

  // Handle dragging and selection
  const handleMouseDown = (mouseEvent: React.MouseEvent) => {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();

    setIsSelected((prev) => !prev);

    if (
      eventRef.current &&
      mouseEvent.target instanceof Node &&
      eventRef.current.querySelector('.resize-handle')?.contains(mouseEvent.target)
    ) {
      return;
    }

    setIsDragging(true);
    const startX = mouseEvent.clientX;
    const startY = mouseEvent.clientY;
    const originalStart = event.startTime;
    const originalEnd = event.endTime;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaX = moveEvent.clientX - startX;
      
      // Calculate minutes moved vertically
      const minutesMoved = Math.round((deltaY / HOUR_HEIGHT) * 60 / 15) * 15;
      
      // Calculate days moved horizontally
      const daysMoved = Math.round(deltaX / DAY_WIDTH);
      
      // Apply time changes (vertical movement)
      let newStart = addMinutes(originalStart, minutesMoved);
      let newEnd = addMinutes(originalEnd, minutesMoved);
      
      // Apply day changes (horizontal movement)
      if (daysMoved !== 0) {
        newStart = addDays(newStart, daysMoved);
        newEnd = addDays(newEnd, daysMoved);
      }
      
      // Clamp within current day boundaries (only for vertical movement)
      const currentDay = daysMoved !== 0 ? addDays(originalStart, daysMoved) : originalStart;
      const dayStart = new Date(currentDay);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDay);
      dayEnd.setHours(23, 59, 59, 999);
      
      const duration = differenceInMinutes(originalEnd, originalStart);
      
      // Only clamp if we're still in the same day (vertical movement only)
      if (daysMoved === 0) {
        if (newStart < dayStart) {
          newStart = new Date(dayStart);
          newEnd = addMinutes(newStart, duration);
        }
        if (newEnd > dayEnd) {
          newEnd = new Date(dayEnd);
          newStart = addMinutes(newEnd, -duration);
          if (newStart < dayStart) {
            newStart = new Date(dayStart);
          }
        }
      }
      
      onUpdate({ ...event, startTime: newStart, endTime: newEnd });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle resizing
  const handleResizeStart = (mouseEvent: React.MouseEvent) => {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!eventRef.current) return;
      const rect = eventRef.current.getBoundingClientRect();
      const newHeight = Math.max(HOUR_HEIGHT, moveEvent.clientY - rect.top);
      const newDuration = Math.round((newHeight / HOUR_HEIGHT) * 60 / 15) * 15;
      const newEndTime = addMinutes(event.startTime, newDuration);
      onUpdate({ ...event, endTime: newEndTime });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
        ${isSelected
          ? 'bg-gradient-end border-gradient-end'
          : 'bg-gradient-end/40 border-gradient-end/60'}
        ${!isSelected ? 'hover:bg-gradient-end/80 hover:border-gradient-end' : ''}
        ${isDragging ? 'opacity-50 cursor-grabbing' : ''}
      `}
      style={{
        top: `${topOffset}px`,
        height: `${height}px`,
        userSelect: "none",
      }}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onFocus={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
    >
      <div className="text-xs text-white overflow-hidden h-full">
        {format(event.startTime, "HH:mm")} - {format(event.endTime, "HH:mm")}
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-end cursor-ns-resize rounded-b opacity-0 hover:opacity-100"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};
export default CalendarEvent;