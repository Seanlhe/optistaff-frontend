// useState and useEffect to manage component's data (current date and events)
import { useState, useEffect } from "react";

// Import custom hook to fetch and manage availability data from Supabase
import { useAvailability } from "../hooks/useAvailability";
import { useAvailabilityTemplate } from "../hooks/useAvailabilityTemplate";

// Date and Time Library
import { format, startOfWeek, addDays, isSameDay, set } from "date-fns";

//Icons
import { ChevronLeft, ChevronRight, Save, File, RefreshCw } from "lucide-react";

import { CalendarEvent } from "./CalendarEvent";
import { TemplateNameDialog } from "./TemplateNameDialog";
import { TemplateSelectDialog } from "./TemplateSelectDialog";
import { UI_Event } from "../types/hooks"; // Import the Event type

// Define the cycle for which we are managing availability
const CYCLE: "PRIMARY" | "SECONDARY" = "PRIMARY";

const Calendar = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // State to hold the events (availability slots)
  const [events, setEvents] = useState<UI_Event[]>([]);

  // Track if we've loaded initial data to prevent refetching
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Template dialog states
  const [showTemplateNameDialog, setShowTemplateNameDialog] = useState(false);
  const [showTemplateSelectDialog, setShowTemplateSelectDialog] =
    useState(false);
  const [templateSaveLoading, setTemplateSaveLoading] = useState(false);
  const [templateLoadLoading, setTemplateLoadLoading] = useState(false);
  const [templateRefreshTrigger, setTemplateRefreshTrigger] = useState(0);

  // Use the custom hook to manage availability data
  const {
    getAvailability,
    setAvailability,
    fetchLoading,
    saveLoading,
    loading,
    error,
  } = useAvailability();

  const { createTemplate, fetchTemplate, deleteTemplate, fetchAllTemplates } =
    useAvailabilityTemplate();

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
            day_of_week: tb.day_of_week || new Date(tb.start_time).getDay() + 1, // Convert JS day (0-6) to 1-7
          })),
        );
        setHasLoadedInitialData(true); // Mark as loaded to prevent refetching
      } catch (err) {
        console.error("Error fetching availability:", err);
      }
    };

    // Only fetch when auth loading is complete and we haven't loaded yet
    if (!loading && !hasLoadedInitialData) {
      fetchAvailability();
    }
  }, [loading, hasLoadedInitialData, getAvailability, CYCLE]); // Include all dependencies

  const handleDoubleClick = (day: Date, hour: number) => {
    const newSlot: UI_Event = {
      id: `event_${Date.now()}`, //Create a simple unique ID
      startTime: set(day, { hours: hour, minutes: 0 }),
      endTime: set(day, { hours: hour + 1, minutes: 0 }),
      day_of_week: day.getDay() + 1, // Convert JS day (0-6) to 1-7
    };
    // Add the new slot to our events array
    setEvents((prevEvents) => [...prevEvents, newSlot]);
  };

  // update a slot when dragged
  const handleUpdateEvent = (updatedEvent: UI_Event) => {
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

      const success = await setAvailability(timeBlocks, "PRIMARY");

      if (success) {
        // Optionally refresh data from database after successful save
        // For now, we'll keep the local state as is since it should match the saved data
        console.log("Availability saved successfully");
      }
    } catch (err) {
      console.error("Error saving availability:", err);
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
          day_of_week: tb.day_of_week || new Date(tb.start_time).getDay() + 1, // Convert JS day (0-6) to 1-7
        })),
      );
    } catch (err) {
      console.error("Error refreshing availability:", err);
    }
  };

  // Template functions
  const handleSaveTemplate = async (templateName: string) => {
    setTemplateSaveLoading(true);
    let result = null; // Declare result outside try block
    try {
      const newTemplate = {
        template_name: templateName,
        is_default: false, 
        timeblocks: events.map((event) => ({
          id: event.id,
          startTime: event.startTime.toISOString(), // Convert Date to string
          endTime: event.endTime.toISOString(), // Convert Date to string
          day_of_week: event.startTime.getDay() + 1 // 1 (Mon) to 7 (Sun)
        }))
      };

      result = await createTemplate(newTemplate);

      if (result) {
        console.log("Template saved successfully:", result);
        setShowTemplateNameDialog(false);
      } else {
        console.error("Failed to save template", result);
      }
    } catch (err) {
      console.error("Error saving template:", err);
    } finally {
      setTemplateSaveLoading(false);
      // Refresh templates in background
      await fetchAllTemplates();
      // Trigger refresh in dialog
      setTemplateRefreshTrigger(Date.now());
      // Only close name dialog on success
      if (result) {
        setShowTemplateNameDialog(false);
      }
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    setTemplateLoadLoading(true);
    try {
      console.log("Loading template:", templateId);

      const template = await fetchTemplate(templateId);
      if (!template) throw new Error("Failed to load template");

      const templateEvents: UI_Event[] = template.timeblocks.map((block) => {
      const blockStart = new Date(block.startTime);
      const blockEnd = new Date(block.endTime);

      // Adjust to the same weekday in the current week
      const templateDay = blockStart.getDay(); // 0 (Sun) to 6 (Sat)
      const currentWeekDay = weekDays[templateDay === 0 ? 6 : templateDay - 1]; // shift Sun to end

    return {
      id: block.id,
      startTime: set(currentWeekDay, {
        hours: blockStart.getHours(),
        minutes: blockStart.getMinutes(),
      }),
      endTime: set(currentWeekDay, {
        hours: blockEnd.getHours(),
        minutes: blockEnd.getMinutes(),
      }),
      day_of_week: blockStart.getDay() + 1, // Correctly reflect JS day
    };
    });


      setEvents(templateEvents);
      setShowTemplateSelectDialog(false);
    } catch (err) {
      console.error("Error loading template:", err);
    } finally {
      setTemplateLoadLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const success = await deleteTemplate(templateId);
      if (!success) {
        throw new Error("Delete operation failed");
      }
      // Refresh templates in background
      await fetchAllTemplates();
      // Trigger refresh in dialog
      setTemplateRefreshTrigger(Date.now());
    } catch (err) {
      console.error("Failed to delete template", err);
      // Refresh templates to show current state
      await fetchAllTemplates();
      // Trigger refresh in dialog
      setTemplateRefreshTrigger(Date.now());
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
            {saveLoading ? "Saving..." : "Save"}
          </button>

          <button
            className="p-2 text-secondary-text border border-border rounded-md hover:bg-bg transition-colors"
            onClick={handleRefreshAvailability}
            disabled={fetchLoading}
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${fetchLoading ? "animate-spin" : ""}`}
            />
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
          {weekDays.map((day, index) => {
            // Handle invalid dates gracefully
            const isValidDate = day instanceof Date && !isNaN(day.getTime());
            const dayKey = isValidDate
              ? day.toISOString()
              : `invalid-day-${index}`;
            const dayText = isValidDate ? format(day, "d") : "--";

            return (
              <div
                key={dayKey}
                className="h-12 border-b border-r border-border text-center p-1 bg-white"
              >
                <div className="text-xs text-secondary-text">
                  {DAYS_OF_WEEK[index]}
                </div>
                <div className="text-lg text-secondary-text">{dayText}</div>
              </div>
            );
          })}

          {/* Time Slots for each day */}
          {weekDays.map((day, index) => {
            // Handle invalid dates gracefully for time slots
            const isValidDate = day instanceof Date && !isNaN(day.getTime());
            const dayKey = isValidDate
              ? day.toISOString()
              : `invalid-timeslot-${index}`;

            return (
              <div key={dayKey} className="relative border-r border-border">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-12 border-b border-border hover:bg-bg cursor-pointer"
                    onDoubleClick={() =>
                      isValidDate ? handleDoubleClick(day, hour) : null
                    }
                  ></div>
                ))}
                {events
                  .filter((event) => {
                    // Handle invalid dates in events gracefully
                    if (!event.startTime || !isValidDate) return false;
                    try {
                      return isSameDay(event.startTime, day);
                    } catch {
                      return false;
                    }
                  })
                  .map((event) => (
                    <CalendarEvent
                      key={event.id}
                      event={event}
                      onUpdate={handleUpdateEvent}
                      onDelete={handleDeleteEvent}
                    />
                  ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Template and Save Dialogs */}
      <TemplateSelectDialog
        isOpen={showTemplateSelectDialog}
        onClose={() => setShowTemplateSelectDialog(false)}
        onSelect={handleUseTemplate}
        onDelete={handleDeleteTemplate}
        onSaveTemplate={() => setShowTemplateNameDialog(true)}
        timeblocks={events}
        loading={templateLoadLoading}
        refreshTrigger={templateRefreshTrigger}
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
