import { useState } from "react";
<<<<<<< HEAD
=======
import { MapPin, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
>>>>>>> a6bb6c1 (Updated Employee dashboard and added EmployeeHistory)

const JSDashboard = () => {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showDetails, setShowDetails] = useState<any>(null);
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");
=======

  const userName = "Job Seeker";
>>>>>>> a6bb6c1 (Updated Employee dashboard and added EmployeeHistory)

  const shifts = [
    {
      title: "Barista at The Coffee Bean",
      date: "Sat, June 14",
<<<<<<< HEAD
      time: "2:00 PM - 4:00 PM",
      details: "Serve coffee and maintain cleanliness. Wage: $15/hr. Attire: Clean and neat.",
=======
      time: "2:00 PM – 4:00 PM",
      location: "Changi City Point",
      rate: "$15/hr",
      details:
        "You will be in charge of preparing coffee and beverages, maintaining cleanliness and organization of the store, handling customer orders and payments. Attire: Clean clothing. Wage: $15/hr.",
>>>>>>> a6bb6c1 (Updated Employee dashboard and added EmployeeHistory)
    },
    {
      title: "Kitchen Assistant At The Line",
      date: "Mon, June 15",
<<<<<<< HEAD
      time: "10:00 AM - 2:00 PM",
      details: "Assist chefs and handle prep. Wage: $14/hr. Attire: Apron and non-slip shoes.",
    },
  ];

  const history = [
    {
      job: "Cashier at Supermarket",
      pay: "$60",
      rate: "$15/hr",
      feedback: "Hardworking and reliable",
      status: "Pending",
    },
    {
      job: "Barista at Coffee Bean",
      pay: "$72",
      rate: "$18/hr",
      feedback: "Friendly and fast",
      status: "Paid",
=======
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
>>>>>>> a6bb6c1 (Updated Employee dashboard and added EmployeeHistory)
    },
  ];

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Main Content - Removed sidebar since JSLayout already provides navigation */}
      <main className="p-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            <button 
              onClick={() => setActiveTab("dashboard")} 
              className={`px-4 py-2 rounded-lg ${activeTab === "dashboard" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("history")} 
              className={`px-4 py-2 rounded-lg ${activeTab === "history" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              History
            </button>
          </nav>
        </div>

        {activeTab === "dashboard" ? (
          <>
            <div className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <p className="text-gray-500">Earnings This Week</p>
                <p className="text-2xl font-bold text-blue-600">$600</p>
              </div>
              <div>
                <p className="text-gray-500">Rating</p>
                <p className="text-2xl font-bold">50</p>
              </div>
              <div>
                <p className="text-gray-500">Next Shift</p>
                <p className="text-sm font-medium">Starbucks<br />2PM - 4PM</p>
              </div>
              <div className="flex items-center gap-2">
                <span>Calendar View</span>
                <input
                  type="checkbox"
                  checked={viewMode === "calendar"}
                  onChange={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">Upcoming</h2>

            {viewMode === "list" ? (
              <div className="space-y-4">
                {shifts.map((shift, i) => (
                  <div key={i} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{shift.title}</p>
                      <p className="text-sm text-gray-500">{shift.date} | {shift.time}</p>
                    </div>
                    <button onClick={() => setShowDetails(shift)} className="text-blue-500">View Details</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-10 mt-4 text-center italic text-gray-400 rounded shadow">
                Calendar view placeholder
              </div>
            )}

            {showDetails && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded shadow relative">
                <button
                  className="absolute top-2 right-4 text-blue-500"
                  onClick={() => setShowDetails(null)}
                >
                  ✕
                </button>
                <h3 className="text-lg font-bold">{showDetails.title}</h3>
                <p className="text-sm text-gray-500">{showDetails.date} | {showDetails.time}</p>
                <p className="mt-2">{showDetails.details}</p>
              </div>
            )}
          </>
        ) : (
          <div>
            <div className="flex gap-6 bg-white p-4 rounded shadow">
              <div><p>Earnings</p><p className="text-xl font-bold">$320</p></div>
              <div><p>Total Hours</p><p className="text-xl font-bold">20</p></div>
              <div><p>Avg / Hour</p><p className="text-xl font-bold">$16</p></div>
            </div>
            <div className="mt-6 space-y-4">
              {history.map((job, i) => (
                <div key={i} className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between">
                    <p className="font-semibold">{job.job}</p>
                    <span className={`px-2 py-1 text-sm rounded ${job.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{job.status}</span>
                  </div>
                  <p>{job.pay} ({job.rate})</p>
                  <p className="text-sm italic mt-1">Feedback: {job.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
=======
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
>>>>>>> a6bb6c1 (Updated Employee dashboard and added EmployeeHistory)
    </div>
  );
};

<<<<<<< HEAD
export default JSDashboard;
=======
export default JSDashboard;
>>>>>>> a6bb6c1 (Updated Employee dashboard and added EmployeeHistory)
