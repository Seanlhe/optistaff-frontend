interface CalendarHeaderProps {
  days: { name: string; date: string }[];
}

export default function EmployeeCalendarHeader({ days }: CalendarHeaderProps) {
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
      <h2 className="text-2xl font-semibold">{getMonthYear()}</h2>

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
    </div>
  );
}
