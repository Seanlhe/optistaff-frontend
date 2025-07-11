// useState to manage component's data )current date and events)
import { useState } from "react";

// Date and Time Library
import { format, startOfWeek, addDays, isSameDay, set } from "date-fns";
//format: Turns a Date object into a readable string (e.g., "July 2025" or "10:00").
//startOfWeek: Finds the first day (Monday, in our case) of any given week.
//addDays: Adds a number of days to a date. We'll use this to get all 7 days of the week.
//isSameDay: Checks if two Date objects are on the exact same day.
//set: A clean way to change a part of a date, like setting the hour or minute.

//Icons
import { ChevronLeft, ChevronRight } from "lucide-react";

import { CalendarEvent } from "./CalendarEvent";

//export interface Event says any object we call an Event must have
// an id, title, startTime, and endTime.
export interface Event {
  id: string;
  startTime: Date;
  endTime: Date;
}

export default function Calendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const [events, setEvents] = useState<Event[]>([]); // Starts empty

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleDoubleClick = (day: Date, hour: number) => {
    const newSlot: Event = {
      id: `event_${Date.now()}`, //Create a simple unique ID
      startTime: set(day, { hours: hour, minutes: 0 }),
      endTime: set(day, { hours: hour + 1, minutes: 0 }),
    };
    // Add the new slot to our events array
    setEvents((prevEvents) => [...prevEvents, newSlot]);
  };

  // update a slot when dragged
  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event,
      ),
    );
  };

  // function to delete a slot
  const handleDeleteEvent = (eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventId),
    );
  };

  // direction argument must be either the string "prev" or the string "next"
  const navigateWeek = (direction: "prev" | "next") => {
    // We update the state with a new date, either 7 days in the future or 7 days in the past.
    // addDays(...):is from date-fns function
    setCurrentWeek(addDays(currentWeek, direction === "next" ? 7 : -7));
  };

  return (
    <div>
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <button
            className="p-2 rounded hover:bg-accent"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            className="p-2 rounded hover:bg-accent"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <h1 className="text-xl font-semibold mx-4 text-center">
            {format(weekStart, "MMMM yyyy")}
          </h1>

          
        </div>

        <button
          className="px-4 py-2 text-sm border rounded hover:bg-muted"
          onClick={() => setCurrentWeek(new Date())}
        >
          Today
        </button>
      </header>

      <div className="flex flex-1 overflow-auto">
        {/* flex-1: Makes this container expand to fill all available vertical screen space. */}
        {/* overflow-auto: If the content gets too big, this will automatically add scrollbars. */}
        {/* Time Column (Left Side) */}
        <div className="w-16 border-r bg-muted">
          <div className="h-12 border-b"></div>

          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-12 flex items-center justify-center text-xs text-muted-foreground"
            >
              {format(set(new Date(), { hours: hour, minutes: 0 }), "H:mm")}
            </div>
          ))}
          {/* w-16: Sets a fixed width for the column. */}
          {/* border-r: Adds a right border to separate it from the days grid. */}
        </div>

        {/* Days Grid */}
        {/* h-12: Sets a fixed height for the header row.
            border-b, border-r: Adds bottom and right borders to each header cell. */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day, index) => (
            <div
              key={day.toISOString()}
              className="h-12 border-b border-r text-center p-1"
            >
              <div className="text-xs text-muted-foreground">
                {DAYS_OF_WEEK[index]}
              </div>
              <div className="text-lg">{format(day, "d")}</div>
            </div>
          ))}

          {/* Time Slots for each day */}
          {/* relative:  place events on top of this grid. */}
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="relative border-r">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-12 border-b"
                  onDoubleClick={() => handleDoubleClick(day, hour)}
                ></div>
              ))}
              {events
                .filter((event) => isSameDay(event.startTime, day))
                .map((event) => (
                  <CalendarEvent
                    key={event.id}
                    event={event}
                    onUpdate={handleUpdateEvent}
                    onDelete={handleDeleteEvent}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
