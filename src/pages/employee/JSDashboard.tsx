import { useState } from "react";

const JSDashboard = () => {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [showDetails, setShowDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "history">("dashboard");

  const shifts = [
    {
      title: "Barista at The Coffee Bean",
      date: "Sat, June 14",
      time: "2:00 PM - 4:00 PM",
      details: "Serve coffee and maintain cleanliness. Wage: $15/hr. Attire: Clean and neat.",
    },
    {
      title: "Kitchen Assistant At The Line",
      date: "Mon, June 15",
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
    },
  ];

  return (
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
    </div>
  );
};

export default JSDashboard;