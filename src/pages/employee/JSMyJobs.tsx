export default function JSMyJobs() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
        <p className="text-gray-600 mt-2">
          View and manage your job assignments
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6.341"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Coming Soon
        </h2>
        <p className="text-gray-600 mb-4">
          The My Jobs feature is currently under development. Here you'll be
          able to:
        </p>
        <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
          <li className="flex items-center">
            <span className="text-blue-500 mr-2">•</span>
            View your current job assignments
          </li>
          <li className="flex items-center">
            <span className="text-blue-500 mr-2">•</span>
            Check job details and schedules
          </li>
          <li className="flex items-center">
            <span className="text-blue-500 mr-2">•</span>
            Track your work history
          </li>
          <li className="flex items-center">
            <span className="text-blue-500 mr-2">•</span>
            Manage job preferences
          </li>
        </ul>
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            In the meantime, check out your{" "}
            <a
              href="/employee/dashboard"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Dashboard
            </a>{" "}
            for available opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
