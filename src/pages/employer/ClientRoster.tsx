import ClientShiftCard from "../../components/ClientShiftCard";
import ClientShiftDetails from "../../components/ClientShiftDetails";
import { ClientShiftProps } from "../../types/components";
// import { useState } from "react";

export default function ClientRoster() {
  const shiftData: ClientShiftProps[] = [
    {
      id: 1,
      startTime: "8:00 AM",
      endTime: "4:00 PM",
      date: 23,
      location: "Tangs Plaza",
      title: "Front Desk Receptionist",
      payRate: 20,
      employeeName: "John Doe",
      filled: 2,
      required: 2,
    },
    {
      id: 2,
      startTime: "9:00 AM",
      endTime: "5:00 PM",
      date: 22,
      location: "Tangs Plaza",
      title: "Housekeeping Staff",
      payRate: 18,
      employeeName: "Jane Smith",
      filled: 15,
      required: 20,
    },
  ];
  const days = [
    { name: "Mon", date: 22 },
    { name: "Tue", date: 23 },
    { name: "Wed", date: 24 },
    { name: "Thu", date: 25 },
    { name: "Fri", date: 26 },
    { name: "Sat", date: 27 },
    { name: "Sun", date: 28 },
  ];
  return (
    <div className="bg-tertiary-bg min-h-screen flex flex-col px-16 py-8 gap-8">
      <h1 className="text-4xl text-secondary-text font-montserrat-b">
        Weekly Roster
      </h1>
      <div className="bg-white rounded-2xl overflow-hidden">
        <CalendarHeader />
        <div className="grid grid-cols-7 divide-x-2 divide-gray-200 px-4 pt-2 pb-4">
          {days.map((day) => (
            <div key={day.date} className="bg-white px-2">
              {/* Date Header */}
              <div className="pb-2">
                <h2 className="text-sm font-montserrat">{day.name}</h2>
                <p className="text-xl font-semibold">{day.date}</p>
              </div>

              {/* Shift Cards */}
              <div className="space-y-2">
                {shiftData
                  .filter((shift) => {
                    return shift.date === day.date;
                  })
                  .map((shift) => (
                    <div key={shift.id}>
                      <ClientShiftCard {...shift} />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarHeader() {
  return (
    <div className="p-4 flex justify-between">
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
      <form className="relative w-30 bg-gray-50 border border-gray-300 px-3 py-1 rounded focus:outline-none">
        <select className="w-full outline-none">
          <option>Tang Plaza</option>
          <option>JW</option>
        </select>
      </form>

      <input
        type="text"
        placeholder="Search"
        className="bg-gray-50 w-40 border border-gray-300 px-3 py-1 border rounded-text-lg rounded focus:outline-none"
      />
    </div>
  );
}
