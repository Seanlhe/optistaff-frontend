import { useState } from "react";
import StatsCard from "../../components/StatsCard";
import { ShiftDetailsModal } from "../../components/JobseekerAssignmentDetailModals";
import { ShiftCard, JobseekerAssignmentCard } from "../../components/JobseekerAssignmentCard";
import { DollarSign, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import MonthlyCalendar from "../../components/MonthlyCalendar";
// Mock data for upcoming assignments
const upcomingAssignments: JobseekerAssignmentCard[] = [
	{
		id: "1",
		title: "Barista at The Coffee Bean",
		company: "The Coffee Bean",
		date: "Sat, June 14",
		time: "2:00 PM – 4:00 PM",
		location: "Changi City Point",
		hourlyRate: 15,
		description:
			"Operate POS, assist customers, manage transactions and handle returns. Maintain cleanliness and ensure excellent customer service.",
		requirements:
			"Attire: Smart casual. Previous barista experience preferred but not required.",
		status: "upcoming",
	},
	{
		id: "2",
		title: "Kitchen Assistant At The Line",
		company: "The Line",
		date: "Mon, June 15",
		time: "10:00 AM – 2:00 PM",
		location: "The Line",
		hourlyRate: 14,
		description:
			"Assist kitchen staff with food preparation, maintain cleanliness, and support service during peak hours.",
		requirements:
			"Attire: Kitchen uniform provided. Must be comfortable working in a fast-paced environment.",
		status: "upcoming",
	},
	{
		id: "3",
		title: "Cashier at Popular Bookstore",
		company: "Popular Bookstore",
		date: "Mon, June 15",
		time: "4:00 PM – 8:00 PM",
		location: "Popular Bookstore",
		hourlyRate: 16,
		description:
			"Operate POS, assist customers, manage transactions and handle returns. Maintain store cleanliness and provide excellent customer service.",
		requirements: "Attire: Smart casual. Basic retail experience preferred.",
		status: "upcoming",
	},
];

const Dashboard = () => {
	const [selectedAssignment, setSelectedAssignment] =
		useState<JobseekerAssignmentCard | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleViewDetails = (assignment: JobseekerAssignmentCard) => {
		setSelectedAssignment(assignment);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedAssignment(null);
	};

	return (
		<div className="min-h-screen bg-[#f1f5f9] p-8 pr-12">
			{/* Welcome and Past Assignments */}
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold text-gray-800">
					Welcome Back,{" "}
					<span className="text-blue-600">Job Seeker</span>
				</h1>
				<Link
					to="/employee/history"
					className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-medium px-5 py-2 rounded-md shadow transition"
				>
					Past Assignments
				</Link>
			</div>

			{/* Header Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<StatsCard title="Earnings This Week" value="$600" icon={<DollarSign />} />
				<StatsCard title="Rating" value="50" icon={<Star />} />
				<StatsCard
					title="Next Assignment"
					value="Starbucks\nChangi City Point, 2:00 PM – 4:00 PM"
					icon={<Clock />}
				/>
			</div>

			{/* Toggle + Section Header */}
			<div className="flex justify-between items-center mb-2 w-full">
				<div>
					<h2 className="text-xl font-semibold text-gray-800">
						Upcoming Assignments
					</h2>
					<p className="text-sm text-gray-500">14 Jun – 15 Jun</p>
				</div>
				<label className="flex items-center gap-2 text-sm text-gray-600">
					Toggle View
					<input
						type="checkbox"
						checked={false} // Placeholder for view mode toggle
						onChange={() => {}}
						className="accent-blue-600"
					/>
				</label>
			</div>

			{/* Assignment List */}
			<div className="bg-white rounded-xl p-6 shadow w-full">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-4">
						{upcomingAssignments.map((assignment) => (
							<ShiftCard
								key={assignment.id}
								{...assignment}
								onClick={() => handleViewDetails(assignment)}
								onViewDetails={handleViewDetails}
								shift={assignment} // Pass shift prop to ShiftCard
							/>
						))}
					</div>
					<div className="lg:col-span-1">
						<MonthlyCalendar />
					</div>
				</div>
			</div>

			{/* Details Modal */}
			{selectedAssignment && (
				<ShiftDetailsModal
					shift={selectedAssignment}
					isOpen={isModalOpen}
					onClose={handleCloseModal}
				/>
			)}
		</div>
	);
};

export default Dashboard;