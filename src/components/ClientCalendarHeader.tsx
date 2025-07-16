interface CalendarHeaderProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  availableLocations: string[];
  days: { name: string; date: string }[];
}

export default function ClientCalendarHeader({
  selectedLocation,
  onLocationChange,
  availableLocations,
  days,
}: CalendarHeaderProps) {
  const getMonthYear = () => {
    if (days.length > 0) {
      const firstDate = new Date(days[0].date);
      return firstDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    }
    return "Current Month";
  };

  return (
    <div className="p-4 flex justify-between items-center">
      <div className="flex gap-1">
        <button className="bg-gray-50 border border-gray-300 px-3 py-1 rounded focus:outline-none active:bg-gray-200 transition-colors">
          ←
        </button>
        <button className="bg-gray-50 border border-gray-300 px-3 py-1 rounded focus:outline-none active:bg-gray-200 transition-colors">
          Today
        </button>
        <button className="bg-gray-50 border border-gray-300 px-3 py-1 rounded focus:outline-none active:bg-gray-200 transition-colors">
          →
        </button>
      </div>

      <h2 className="text-2xl font-semibold">{getMonthYear()}</h2>
      <form className="relative w-48 bg-gray-50 border border-gray-300 px-3 py-1 rounded focus:outline-none">
        <select
          className="w-full outline-none"
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
        >
          {availableLocations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </form>
    </div>
  );
}
