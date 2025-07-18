// useState and useEffect to manage component's data (current date and events)
import { useState, useEffect } from "react";

// Import custom hook to fetch and manage availability data from Supabase
import { useAvailability } from "../hooks/useAvailability";

// Date and Time Library
import { format, startOfWeek, addDays, isSameDay, set } from "date-fns";

//Icons
import { ChevronLeft, ChevronRight, Save, File, RefreshCw } from "lucide-react";

import { CalendarEvent } from "./CalendarEvent";
import { TemplateNameDialog } from "./TemplateNameDialog";
import { TemplateSelectDialog } from "./TemplateSelectDialog";

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

  // Template dialog states
  const [showTemplateNameDialog, setShowTemplateNameDialog] = useState(false);
  const [showTemplateSelectDialog, setShowTemplateSelectDialog] = useState(false);
  const [templateSaveLoading, setTemplateSaveLoading] = useState(false);
  const [templateLoadLoading, setTemplateLoadLoading] = useState(false);

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

  // Template functions
  const handleSaveTemplate = async (templateName: string) => {
    setTemplateSaveLoading(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving template:', templateName, 'with events:', events);
      setShowTemplateNameDialog(false);
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setTemplateSaveLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    setTemplateLoadLoading(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Loading template:', templateId);
      
      // Mock template data - replace with actual template loading
      const mockTemplateEvents: Event[] = [
        {
          id: `template_event_1`,
          startTime: set(weekDays[0], { hours: 9, minutes: 0 }),
          endTime: set(weekDays[0], { hours: 10, minutes: 0 }),
        },
        {
          id: `template_event_2`,
          startTime: set(weekDays[1], { hours: 14, minutes: 0 }),
          endTime: set(weekDays[1], { hours: 15, minutes: 40 }),
        },
      ];
      
      setEvents(mockTemplateEvents);
      setShowTemplateSelectDialog(false);
    } catch (err) {
      console.error('Error loading template:', err);
    } finally {
      setTemplateLoadLoading(false);
    }
  };

  // direction argument must be either the string "prev" or the string "next"
  const navigateWeek = (direction: "prev" | "next") => {
    // We update the state with a new date, either 7 days in the future or 7 days in the past.
    // addDays(...):is from date-fns function
    setCurrentWeek(addDays(currentWeek, direction === "next" ? 7 : -7));
  };

  return (
    <div>
      <header className="flex items-center justify-between p-4 border-b border-border bg-card-color">
        <div className="flex items-center">
          <button
            className="p-2 rounded-md hover:bg-bg transition-colors"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="h-5 w-5 text-secondary-text" />
          </button>

          <button
            className="p-2 rounded-md hover:bg-bg transition-colors"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="h-5 w-5 text-secondary-text" />
          </button>

          <h1 className="text-xl font-semibold mx-4 text-primary-text">
            {format(weekStart, "MMMM yyyy")}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 text-sm text-secondary-text border border-border rounded-md hover:bg-bg transition-colors"
            onClick={() => setCurrentWeek(new Date())}
          >
            Today
          </button>

          <button
            className="px-4 py-2 text-sm text-secondary-text border border-border rounded-md hover:bg-bg transition-colors flex items-center gap-2"
            onClick={() => setShowTemplateSelectDialog(true)}
          >
            <File className="h-4 w-4" />
            Templates
          </button>

          <button
            className="px-4 py-2 text-sm bg-primary-blue text-white rounded-md hover:bg-primary-blue/80 flex items-center gap-2"
            onClick={handleSaveAvailability}
            disabled={saveLoading}
          >
            <Save className="h-4 w-4" />
            {saveLoading ? 'Saving...' : 'Save'}
          </button>

          <button
            className="p-2 text-secondary-text border border-border rounded-md hover:bg-bg transition-colors"
            onClick={handleRefreshAvailability}
            disabled={fetchLoading}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${fetchLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-1 overflow-auto">
        {/* Time Column (Left Side) */}
        <div className="w-16 border-r border-border bg-secondary-text/5">
          <div className="h-12 border-b border-border"></div>

          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-12 flex items-center justify-center text-xs text-secondary-text"
            >
              {format(set(new Date(), { hours: hour, minutes: 0 }), "H:mm")}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day, index) => (
            <div
              key={day.toISOString()}
              className="h-12 border-b border-r border-border text-center p-1 bg-white"
            >
              <div className="text-xs text-secondary-text">
                {DAYS_OF_WEEK[index]}
              </div>
              <div className="text-lg text-secondary-text">{format(day, "d")}</div>
            </div>
          ))}

          {/* Time Slots for each day */}
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="relative border-r border-border">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-12 border-b border-border hover:bg-bg cursor-pointer"
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

      {/* Template and Save Dialogs */}
      <TemplateSelectDialog
        isOpen={showTemplateSelectDialog}
        onClose={() => setShowTemplateSelectDialog(false)}
        onSelect={handleUseTemplate}
        onSaveTemplate={() => setShowTemplateNameDialog(true)}
        loading={templateLoadLoading}
      />

      <TemplateNameDialog
        isOpen={showTemplateNameDialog}
        onClose={() => setShowTemplateNameDialog(false)}
        onSave={handleSaveTemplate}
        loading={templateSaveLoading}
      />
    </div>
  );
};

export { Calendar };
export default Calendar;
