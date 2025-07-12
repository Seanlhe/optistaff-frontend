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
      const minutesMoved = Math.round((deltaY / HOUR_HEIGHT) * 60 / 15) * 15;
      const deltaX = moveEvent.clientX - startX;
      const daysMoved = Math.round(deltaX / DAY_WIDTH);
      const newStart = addDays(addMinutes(originalStart, minutesMoved), daysMoved);
      const newEnd = addDays(addMinutes(originalEnd, minutesMoved), daysMoved);
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
          ? 'bg-blue-200 border-blue-500'
          : 'bg-blue-100 border-blue-300'
        }
        ${isDragging ? 'opacity-50 cursor-grabbing' : ''}
        hover:bg-blue-150
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
      <div className="text-xs text-muted-foreground overflow-hidden h-full">
        {format(event.startTime, "HH:mm")} - {format(event.endTime, "HH:mm")}
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-2 bg-blue-400 cursor-ns-resize rounded-b opacity-0 hover:opacity-100"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};
export default CalendarEvent; 