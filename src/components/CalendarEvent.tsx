import React, { useState, useRef, useEffect } from "react";
import { format, differenceInMinutes, addMinutes, addDays } from "date-fns";
import type { Event } from "./Calendar";

interface CalendarEventProps {
  event: Event;
  onUpdate: (event: Event) => void; // Callback for when an event is updated
  onDelete: (eventId: string) => void; // Callback for when an event is deleted
}

export const CalendarEvent = ({
  event,
  onUpdate,
  onDelete,
}: CalendarEventProps) => {
  // Constants
  const HOUR_HEIGHT = 64;
  const DAY_WIDTH = 200; // Approximate width of each day column (variable needed to drag events between days)
  
  // Calculate display properties
  const duration = differenceInMinutes(event.endTime, event.startTime); // Duration of the event in minutes
  const height = (duration / 60) * HOUR_HEIGHT; // height of the event in pixels
  const topOffset = 
    event.startTime.getHours() * HOUR_HEIGHT + 
    (event.startTime.getMinutes() / 60) * HOUR_HEIGHT; // Vertical position of the event

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

  // Handle dragging the entire event
  const handleDragStart = (mouseEvent: React.MouseEvent) => {
    mouseEvent.preventDefault(); // Prevent browser drag behavior
    mouseEvent.stopPropagation();
    
    setIsDragging(true);
    setIsSelected(true);
    
    const startX = mouseEvent.clientX;
    const startY = mouseEvent.clientY;
    const originalStart = event.startTime;
    const originalEnd = event.endTime;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Calculate time change (vertical movement)
      const deltaY = moveEvent.clientY - startY;
      const minutesMoved = Math.round((deltaY / HOUR_HEIGHT) * 60 / 15) * 15; // Snap to 15 mnits intervals
      
      // Calculate day change (horizontal movement)
      const deltaX = moveEvent.clientX - startX;
      const daysMoved = Math.round(deltaX / DAY_WIDTH);
      
      // Update event times
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

  // Handle resizing by dragging bottom of the event
  const handleResizeStart = (mouseEvent: React.MouseEvent) => {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!eventRef.current) return;
      
      const rect = eventRef.current.getBoundingClientRect();
      const newHeight = Math.max(HOUR_HEIGHT, moveEvent.clientY - rect.top);
      const newDuration = Math.round((newHeight / HOUR_HEIGHT) * 60 / 15) * 15; // Snap to 15 minutes
      const newEndTime = addMinutes(event.startTime, newDuration);
      
      onUpdate({ ...event, endTime: newEndTime });
    };
    
    // Function to handle mouse release after resize
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle selection
  const handleClick = (clickEvent: React.MouseEvent) => {
    clickEvent.stopPropagation();
    setIsSelected(!isSelected);
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
          ? 'bg-blue-200 border-blue-500 ring-2 ring-blue-300' 
          : 'bg-blue-100 border-blue-300'
        }
        ${isDragging ? 'opacity-50 cursor-grabbing' : ''}
        hover:bg-blue-150 transition-colors
      `}
      style={{
        top: `${topOffset}px`,
        height: `${height}px`,
        userSelect: "none",
      }}
      tabIndex={0} // Make focusable for keyboard events
      onMouseDown={handleDragStart}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onFocus={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
    >
      {/* Event content */}
      <div className="text-xs text-muted-foreground overflow-hidden h-full pointer-events-none">
        {format(event.startTime, "HH:mm")} - {format(event.endTime, "HH:mm")}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 bg-blue-400 cursor-ns-resize rounded-b opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};