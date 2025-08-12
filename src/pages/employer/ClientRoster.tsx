import ClientShiftDetails from "../../components/ClientShiftDetails";
import ClientCalendarHeader from "../../components/ClientCalendarHeader";
import ClientCalendarDay from "../../components/ClientCalendarDay";
import ClientEdit from "./ClientEdit";
import { Shift } from "../../types/hooks";
import { useShifts } from "../../hooks/useShifts";
import { useEffect, useMemo, useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { StatusEnum } from "../../types/hooks";

export default function ClientRoster() {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Dynamic calendar state - start from current week
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const {
    shifts,
    loading,
    error,
    // deleteShift,
    updateShiftStatus,
    refetchShifts,
  } = useShifts();

  const [selectedLocation, setSelectedLocation] =
    useState<string>("All Locations");

  const filteredShifts = useMemo(() => {
    if (!shifts || shifts.length === 0) return [];

    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });

    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.start_time);
      const shiftWeekStart = startOfWeek(shiftDate, { weekStartsOn: 1 });

      // Only include shifts from current week onwards
      return shiftWeekStart >= currentWeekStart;
    });
  }, [shifts]); // Remove refreshTrigger dependency

  const locationFilteredShifts = useMemo(() => {
    if (!filteredShifts || filteredShifts.length === 0) return [];

    // If "All Locations" is selected, return all shifts
    if (selectedLocation === "All Locations") {
      return filteredShifts;
    }

    // Filter by selected location
    return filteredShifts.filter(
      (shift) => shift.job_location === selectedLocation
    );
  }, [filteredShifts, selectedLocation]);

  useEffect(() => {
    if (locationFilteredShifts.length > 0) {
      // Find the earliest shift in the filtered results
      const earliestShift = locationFilteredShifts.reduce(
        (earliest, current) => {
          return new Date(current.start_time) < new Date(earliest.start_time)
            ? current
            : earliest;
        }
      );

      // Get the week start of the earliest shift
      const earliestShiftDate = new Date(earliestShift.start_time);
      const earliestShiftWeek = startOfWeek(earliestShiftDate, {
        weekStartsOn: 1,
      });

      // Only navigate if we're not already viewing that week
      const currentWeekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      if (
        format(earliestShiftWeek, "yyyy-MM-dd") !==
        format(currentWeekStart, "yyyy-MM-dd")
      ) {
        console.log(
          "🗓️ Navigating to first shift week:",
          format(earliestShiftWeek, "yyyy-MM-dd")
        );
        setCurrentWeek(earliestShiftWeek);
      }
    }
  }, [locationFilteredShifts]);

  const availableLocations = useMemo(() => {
    if (!filteredShifts || filteredShifts.length === 0) return [];

    const locations = [
      ...new Set(filteredShifts.map((shift) => shift.job_location)),
    ];
    return ["All Locations", ...locations];
  }, [filteredShifts]);

  useEffect(() => {
    if (availableLocations.length > 0 && !selectedLocation) {
      setSelectedLocation(availableLocations[0]);
    }
  }, [availableLocations, selectedLocation]);

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
    const newWeek = addDays(currentWeek, direction === "next" ? 7 : -7);
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });

    // Prevent going to weeks before the current week
    if (direction === "prev" && newWeek < startOfCurrentWeek) {
      return; // Don't allow navigation to past weeks
    }

    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setIsEditMode(false); // Reset to details view when opening a shift
  };

  const handleCloseDetails = () => {
    setSelectedShift(null);
    setIsEditMode(false);
    // Refresh data after editing to show updated information
    refetchShifts();
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsEditMode(true); // Switch to edit mode
  };

  const handleCancelShift = async (
    shift_id: string
  ): Promise<{ updated_count: number }> => {
    try {
      const result = await updateShiftStatus(
        shift_id,
        StatusEnum.CancelByEmployer
      );
      // Only close modal if cancellation succeeded
      if (result && result.updated_count > 0) {
        setSelectedShift(null);
        refetchShifts();
      }
      // If failed, do NOT change selectedShift -- let error message show
      return result;
    } catch (error) {
      console.error("Failed to cancel shift:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="bg-tertiary-bg min-h-screen flex flex-col px-16 py-8 gap-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-secondary-text text-lg">Loading shifts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-tertiary-bg min-h-screen flex flex-col px-16 py-8 gap-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!filteredShifts || filteredShifts.length === 0) {
    return (
      <div className="bg-tertiary-bg min-h-screen flex flex-col px-16 py-8 gap-8">
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
      <div className="bg-tertiary-bg min-h-screen flex flex-col px-16 py-8 gap-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Processing shifts...</p>
        </div>
      </div>
    );
  }

  if (selectedShift && isEditMode) {
    return <ClientEdit shift={selectedShift} onClose={handleCloseDetails} />;
  }

  return (
    <div className="bg-tertiary-bg min-h-screen flex flex-col px-16 py-8 gap-8">
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
          selectedLocation={selectedLocation ?? ""}
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
              shiftData={locationFilteredShifts}
              selectedLocation={selectedLocation ?? ""}
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
              shiftData={selectedShift}
              onClose={handleCloseDetails}
              // onDelete={deleteShift}
              onEdit={handleEditShift}
              onCancel={handleCancelShift}
            />
          </div>
        </div>
      )}
    </div>
  );
}
