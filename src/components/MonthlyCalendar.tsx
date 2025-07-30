import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const MonthlyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  return (
    <div className="border border-border rounded bg-card-color p-4 w-full max-w-sm">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary-text">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-md hover:bg-secondary-bg transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-secondary-text" />
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-md hover:bg-secondary-bg transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-secondary-text" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
          <div key={day} className="text-xs text-center text-secondary-text">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`text-sm text-center p-2 rounded-md cursor-pointer transition-colors ${!isSameMonth(day, currentDate) ? "text-secondary-text/50" : "text-primary-text"} ${isToday(day) ? "bg-primary-blue text-white font-medium" : "hover:bg-secondary-bg"}`}
          >
            {format(day, "d")}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyCalendar;
