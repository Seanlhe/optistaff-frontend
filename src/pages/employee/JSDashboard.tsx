import { useState } from "react";
import { MapPin, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const JSDashboard = () => {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showDetails, setShowDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");

  const userName = "Job Seeker";

  const shifts = [
    {
      title: "Barista at The Coffee Bean",
      date: "Sat, June 14",
      details: "Serve coffee and maintain cleanliness. Wage: $15/hr. Attire: Clean and neat.",
      time: "2:00 PM – 4:00 PM",
      location: "Changi City Point",
      rate: "$15/hr",
      details:
        "You will be in charge of preparing coffee and beverages, maintaining cleanliness and organization of the store, handling customer orders and payments. Attire: Clean clothing. Wage: $15/hr.",
    },
    {
      title: "Kitchen Assistant At The Line",
      date: "Mon, June 15",
      time: "10:00 AM – 2:00 PM",
      location: "The Line",
      rate: "$14/hr",
      details:
        "Assist chefs with food prep and kitchen cleaning. Ensure hygiene and help with inventory. Attire: Apron and closed shoes. Wage: $14/hr.",
    },
    {
      title: "Cashier at Popular Bookstore",
      date: "Mon, June 15",
      time: "4:00 PM – 8:00 PM",
      location: "Popular Bookstore",
      rate: "$16/hr",
      details:
        "Operate POS, assist customers, manage transactions and handle returns. Attire: Smart casual. Wage: $16/hr.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-8 pr-12">
      {/* Welcome and Past Shifts */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome Back, <span className="text-blue-600">{userName}</span>
        </h1>
        <Link
          to="/employee/history"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-medium px-5 py-2 rounded-md shadow transition"
        >
          Past Shifts
        </Link>
      </div>

      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-gray-500 text-sm">Earnings This Week</p>
          <p className="text-2xl font-bold text-blue-600">$600</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-gray-500 text-sm">Rating</p>
          <p className="text-2xl font-bold text-gray-800">50</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-gray-500 text-sm">Next Shift</p>
          <p className="text-sm font-medium text-gray-700">
            Starbucks<br />Changi City Point, 2:00 PM – 4:00 PM
          </p>
        </div>
      </div>

      {/* Toggle + Section Header */}
      <div className="flex justify-between items-center mb-2 w-full max-w-[800px]">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Upcoming Shifts</h2>
          <p className="text-sm text-gray-500">14 Jun – 15 Jun</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          Toggle View
          <input
            type="checkbox"
            checked={viewMode === "calendar"}
            onChange={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
            className="accent-blue-600"
          />
        </label>
      </div>

      {/* Shift List */}
      <div className="bg-white rounded-xl p-6 shadow w-full max-w-[800px]">
        {viewMode === "list" ? (
          <div className="space-y-4">
            {shifts.map((shift, i) => (
              <div
                key={i}
                className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-3 shadow-sm"
              >
                <div className="space-y-1 text-sm text-gray-700">
                  <p className="font-semibold">{shift.title}</p>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock size={14} />
                    <span>{shift.date}, {shift.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin size={14} />
                    <span>{shift.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <DollarSign size={14} />
                    <span>{shift.rate}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(shift)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-full transition"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-400 italic">
            [Calendar View Placeholder]
          </div>
        )}
      </div>

      {/* Details Box */}
      {showDetails && (
        <div className="mt-4 w-full max-w-[800px] bg-blue-50 border border-blue-300 p-4 rounded-lg relative shadow">
          <button
            onClick={() => setShowDetails(null)}
            className="absolute top-2 right-3 text-blue-600 text-lg"
          >
            ✕
          </button>
          <h3 className="text-base font-semibold text-blue-700">{showDetails.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {showDetails.date} | {showDetails.time} | {showDetails.location} | {showDetails.rate}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{showDetails.details}</p>
        </div>
      )}
    </div>
  );
};

export default JSDashboard;
