
const completedShifts = [
  {
    title: "Cashier at Supermarket",
    status: "Pending",
    date: "Fri, June 13",
    time: "6:00 PM - 10:00 PM",
    location: "Changi City Point",
    pay: "$60",
    rate: "$15 / Hour",
    feedback: "Very reliable and hardworking",
  },
  {
    title: "Barista at The Coffee Bean",
    status: "Paid",
    date: "Thu, June 12",
    time: "1:00 PM - 5:00 PM",
    location: "Changi City Point",
    pay: "$72",
    rate: "$18 / Hour",
    feedback: "Excellent service and professional attitude",
  },
  {
    title: "Waiter at Saizeriya",
    status: "Paid",
    date: "Wed, June 11",
    time: "1:00 PM - 5:00 PM",
    location: "Changi City Point",
    pay: "$56",
    rate: "$14 / Hour",
    feedback: "Great communication skills",
  },
];

export default function EmployeeHistory() {
  return (
    <div className="bg-[#f1f5f9] min-h-screen p-8 pr-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Recently Completed Jobs</h2>

      <div className="space-y-4 max-w-[900px]">
        {completedShifts.map((job, i) => (
          <div key={i} className="flex justify-between bg-white shadow rounded-lg p-4 border border-gray-200">
            <div className="w-[70%]">
              <p className="text-lg font-semibold text-gray-800">
                {job.title}
                <span className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${
                  job.status === "Paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {job.status}
                </span>
              </p>
              <p className="text-sm text-gray-500">{job.date} | {job.time}</p>
              <p className="text-sm text-gray-500">{job.location}</p>

              <div className="bg-green-100 rounded-md px-3 py-2 mt-3 text-sm">
                <span className="font-semibold">Feedback:</span> {job.feedback}
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">{job.pay}</p>
              <p className="text-sm text-gray-500">{job.rate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
