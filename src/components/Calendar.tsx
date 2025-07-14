// useState and useEffect to manage component's data (current date and events)
import { useState, useEffect } from "react";

// Import custom hook to fetch and manage availability data from Supabase
import { useAvailability } from "../hooks/useAvailability";

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

// Define the cycle for which we are managing availability
const CYCLE: "PRIMARY" | "SECONDARY" = "PRIMARY";

const Calendar = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // State to hold the events (availability slots)
  const [events, setEvents] = useState<Event[]>([]); 

  // Track if we've loaded initial data to prevent refetching
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Use the custom hook to manage availability data
  const { getAvailability, setAvailability, fetchLoading, saveLoading, loading, error } = useAvailability();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Load availability from Supabase only once when component mounts and auth is ready
  useEffect(() => {
    const fetchAvailability = async () => {
      if (loading || hasLoadedInitialData) return; // Don't fetch if still loading auth or already loaded
      
      try {
        const timeBlocks = await getAvailability(CYCLE);
        setEvents(
          timeBlocks.map((tb) => ({
            id: tb.id || `event_${tb.start_time}`,
            startTime: new Date(tb.start_time),
            endTime: new Date(tb.end_time),
          }))
        );
        setHasLoadedInitialData(true); // Mark as loaded to prevent refetching
      } catch (err) {
        console.error('Error fetching availability:', err);
      }
    };
    
    // Only fetch when auth loading is complete and we haven't loaded yet
    if (!loading && !hasLoadedInitialData) {
      fetchAvailability();
    }
  }, [loading, hasLoadedInitialData, getAvailability, CYCLE]); // Include all dependencies

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

  // Save events to Supabase
  const handleSaveAvailability = async () => {
    try {
      const timeBlocks = events.map((event) => ({
        start_time: event.startTime.toISOString(),
        end_time: event.endTime.toISOString(),
        submission_cycle: CYCLE,
      }));
      
      const success = await setAvailability(timeBlocks);
      
      if (success) {
        // Optionally refresh data from database after successful save
        // For now, we'll keep the local state as is since it should match the saved data
        console.log('Availability saved successfully');
      }
    } catch (err) {
      console.error('Error saving availability:', err);
    }
  };

  // Function to refresh data from database (useful after save or to discard local changes)
  const handleRefreshAvailability = async () => {
    try {
      const timeBlocks = await getAvailability(CYCLE);
      setEvents(
        timeBlocks.map((tb) => ({
          id: tb.id || `event_${tb.start_time}`,
          startTime: new Date(tb.start_time),
          endTime: new Date(tb.end_time),
        }))
      );
    } catch (err) {
      console.error('Error refreshing availability:', err);
    }
  };

  // direction argument must be either the string "prev" or the string "next"
  const navigateWeek = (direction: "prev" | "next") => {
    // We update the state with a new date, either 7 days in the future or 7 days in the past.
    // addDays(...):is from date-fns function
    setCurrentWeek(addDays(currentWeek, direction === "next" ? 7 : -7));
  };

  return (
    <div className="bg-primary-blue/5">
      <header className="flex items-center justify-between p-4 border-b bg-card-color">
        <div className="flex items-center">
          <button
            className="p-2 rounded hover:bg-primary-blue/10"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="h-5 w-5 text-primary-blue" />
          </button>

          <button
            className="p-2 rounded hover:bg-primary-blue/10"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="h-5 w-5 text-primary-blue" />
          </button>

          <h1 className="text-xl font-semibold mx-4 text-center text-main">
            {format(weekStart, "MMMM yyyy")}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 text-sm border rounded hover:bg-primary-blue/10 text-main"
            onClick={() => setCurrentWeek(new Date())}
          >
            Today
          </button>

          <button
            className="px-4 py-2 text-sm border rounded bg-primary-blue text-white hover:bg-primary-blue-hover"
            onClick={handleSaveAvailability}
            disabled={saveLoading}
          >
            {saveLoading ? "Saving..." : "Save Availability"}
          </button>

          <button
            className="px-4 py-2 text-sm border rounded bg-primary-blue/10 text-main hover:bg-primary-blue/20"
            onClick={handleRefreshAvailability}
            disabled={fetchLoading}
          >
            {fetchLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </header>
      {error && <div className="text-error-red bg-card-color p-2">{error}</div>}

      <div className="flex flex-1 overflow-auto bg-card-color">
        {/* flex-1: Makes this container expand to fill all available vertical screen space. */}
        {/* overflow-auto: If the content gets too big, this will automatically add scrollbars. */}
        {/* Time Column (Left Side) */}
        <div className="w-16 border-r bg-primary-blue/10">
          <div className="h-12 border-b"></div>

          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-12 flex items-center justify-center text-xs text-muted"
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
              className="h-12 border-b border-r text-center p-1 bg-card-color"
            >
              <div className="text-xs text-muted">
                {DAYS_OF_WEEK[index]}
              </div>
              <div className="text-lg text-main">{format(day, "d")}</div>
            </div>
          ))}

          {/* Time Slots for each day */}
          {/* relative:  place events on top of this grid. */}
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="relative border-r bg-card-color">
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

export { Calendar };
export default Calendar;