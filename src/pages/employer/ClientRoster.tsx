import { ClientShiftProps } from "../../types/components";

export default function ClientRoster() {
  const ClientShiftCard: ClientShiftProps[] = [
    {
      id: "1",
      startTime: "8:00 AM",
      endTime: "4:00 PM",
      date: "2023-10-01",
      location: "123 Main St, Cityville",
      jobTitle: "Front Desk Receptionist",
      payRate: 20,
      employeeName: "John Doe",
    },
    {
      id: "2",
      startTime: "9:00 AM",
      endTime: "5:00 PM",
      date: "2023-10-02",
      location: "456 Elm St, Townsville",
      jobTitle: "Housekeeping Staff",
      payRate: 18,
      employeeName: "Jane Smith",
    },
  ];
  return (
    <div className="bg-tertiary-bg min-h-screen flex flex-col w-full px-16 py-8 gap-8">
      <h1 className="text-4xl text-secondary-text font-montserrat-b">
        Weekly Roster
      </h1>
      <CalendarHeader />
    </div>
  );
}

function CalendarHeader() {
  return (
    <div className="bg-white p-4 rounded-2xl flex justify-between">
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
      <form className="relative w-48 bg-gray-50 border border-gray-300 px-3 py-1 rounded focus:outline-none">
        <select className="w-full outline-none">
          <option>Tang Plaza</option>
          <option>JW</option>
        </select>
      </form>

      <input
        type="text"
        placeholder="Search"
        className="bg-gray-50 border border-gray-300 px-3 py-1 border rounded-text-lg rounded focus:outline-none"
      />
    </div>
  );
}
