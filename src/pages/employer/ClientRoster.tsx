import ClientShiftDetails from "../../components/ClientShiftDetails";
import ClientCalendarHeader from "../../components/ClientCalendarHeader";
import ClientCalendarDay from "../../components/ClientCalendarDay";
import { Shift } from "../../types/hooks";
import { useShifts } from "../../hooks/useShifts";
import { useMemo, useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";

export default function ClientRoster() {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Dynamic calendar state
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const { shifts, loading, error, deleteShift, updateShift } = useShifts();

  const availableLocations = useMemo(() => {
    if (!shifts || shifts.length === 0) return [];

    // Get unique locations from shifts
    const locations = [...new Set(shifts.map((shift) => shift.job_location))];
    return locations;
  }, [shifts]);

  const [selectedLocation, setSelectedLocation] = useState(
    availableLocations[0]
  );

  // Calculate dynamic week days
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start on Monday
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return {
      name: dayNames[i],
      date: format(date, "dd MMM yyyy"), // Format: "22 May 2025"
    };
  });

  // Navigation functions
  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek(addDays(currentWeek, direction === "next" ? 7 : -7));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
  };

  const handleCloseDetails = () => {
    setSelectedShift(null);
  };

  if (loading) {
    return (
      <div className="bg-tertiary-bg min-h-full flex flex-col px-16 py-8 gap-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-secondary-text text-lg">Loading shifts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-tertiary-bg min-h-full flex flex-col px-16 py-8 gap-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!shifts || shifts.length === 0) {
    return (
      <div className="bg-tertiary-bg min-h-full flex flex-col px-16 py-8 gap-8">
        <h1 className="text-3xl text-secondary-text font-montserrat-b">
          Weekly Roster
        </h1>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-secondary-text">No shifts found</p>
        </div>
      </div>
    );
  }

  // Don't render until we have locations
  if (availableLocations.length === 0) {
    return (
      <div className="bg-tertiary-bg min-h-full flex flex-col px-16 py-8 gap-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Processing shifts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tertiary-bg min-h-full flex flex-col px-16 py-8 gap-8">
      <p className="text-3xl text-primary-text font-montserrat-b">
        Weekly Roster
      </p>

      <div
        className={`flex flex-col grow bg-white rounded-2xl overflow-hidden transition-opacity duration-300 ${
          selectedShift ? "opacity-50" : "opacity-100"
        }`}
      >
        {/* Calendar Header */}
        <ClientCalendarHeader
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          availableLocations={availableLocations}
          days={days}
          onNavigateWeek={navigateWeek}
          onGoToToday={goToToday}
        />

        {/* Calendar Days */}
        <div className="grow grid grid-cols-7 divide-x-2 divide-gray-200 px-4 pt-2 pb-4">
          {days.map((day) => (
            <ClientCalendarDay
              key={day.date}
              day={day}
              shiftData={shifts}
              selectedLocation={selectedLocation}
              selectedShift={selectedShift}
              onShiftClick={handleShiftClick}
            />
          ))}
        </div>
      </div>

      {/* Shift Details Overlay */}
      {selectedShift && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-opacity-50"
          onClick={handleCloseDetails}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-auto overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ClientShiftDetails
              {...selectedShift}
              onClose={handleCloseDetails}
              onDelete={deleteShift}
            />
          </div>
        </div>
      )}
    </div>
  );
}
