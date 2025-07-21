import { useState, useMemo } from "react";
import StatsCard from "../../components/StatsCard";
import PayoutSummaryCard from "../../components/PayoutSummaryCard";
import { ShiftDetailsModal } from "../../components/JobseekerAssignmentDetailModals";
import { JobseekerAssignmentCard } from "../../components/JobseekerAssignmentCard";
import { Star, Clock } from "lucide-react";
import MonthlyCalendar from "../../components/MonthlyCalendar";
import { useAssignments } from "../../hooks/useAssignments";
import { useUserProfile } from "../../hooks/useUserProfile";
import { Assignment } from "../../types/hooks";

const Dashboard = () => {
	const [selectedAssignment, setSelectedAssignment] = useState<JobseekerAssignmentCard | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Fetch data using custom hooks
	const { assignments, loading } = useAssignments();
	const { profile } = useUserProfile();

	// Transform assignment data to JobseekerAssignmentCard format
	const transformAssignmentToCard = (assignment: Assignment): JobseekerAssignmentCard => {
		// Use created_at as fallback for timing information since start_time/end_time may not be available
		const assignmentDate = new Date(assignment.created_at);
		
		const formatDate = (date: Date) => {
			return date.toLocaleDateString('en-US', { 
				weekday: 'short', 
				month: 'short', 
				day: 'numeric' 
			});
		};
		
		// Generate default time based on assignment creation
		const formatDefaultTime = () => {
			const startTime = new Date(assignmentDate);
			startTime.setHours(9, 0, 0, 0); // Default to 9:00 AM
			const endTime = new Date(startTime);
			endTime.setHours(17, 0, 0, 0); // Default to 5:00 PM
			
			const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { 
				hour: 'numeric', 
				minute: '2-digit',
				hour12: true 
			});
			
			return `${formatTime(startTime)} – ${formatTime(endTime)}`;
		};

		return {
			id: assignment.assignment_id,
			title: assignment.job_title || "Assignment",
			company: assignment.name || "Company",
			date: formatDate(assignmentDate),
			time: formatDefaultTime(),
			location: "Location TBD", // Will be available when shift data is joined
			hourlyRate: 0, // Will be available when shift data is joined
			description: "Assignment details will be available soon",
			requirements: "Requirements will be specified",
			status: mapAssignmentStatusToCardStatus(assignment.status),
		};
	};

	// Status mapping based on actual database status values
	const mapAssignmentStatusToCardStatus = (status: string): 'upcoming' | 'completed' | 'cancelled' => {
		switch (status?.toLowerCase()) {
			case 'confirmed':
			case 'pending':
				return 'upcoming';
			case 'completed':
				return 'completed';
			case 'cancel_by_employer':
			case 'cancel_by_employee':
				return 'cancelled';
			default:
				return 'upcoming';
		}
	};

	// Use real assignment data
	const displayAssignments = useMemo(() => {
		if (loading || assignments.length === 0) return [];
		return assignments.map(transformAssignmentToCard);
	}, [assignments, loading]);

	const handleViewDetails = (assignment: JobseekerAssignmentCard) => {
		setSelectedAssignment(assignment);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedAssignment(null);
	};

	const getUserName = () => {
		if (!profile || typeof profile !== 'object') return "Job Seeker";
		const firstName = (profile as any).first_name || '';
		const lastName = (profile as any).last_name || '';
		return firstName && lastName ? `${firstName} ${lastName}` : "Job Seeker";
	};

	const getDateRange = () => {
		if (displayAssignments.length === 0) return "No upcoming assignments";
		
		const upcomingAssignments = displayAssignments.filter(a => a.status === 'upcoming');
		if (upcomingAssignments.length === 0) return "No upcoming assignments";
		
		// For now, use a simple date range calculation based on assignment creation
		const dates = assignments.map(a => new Date(a.created_at));
		if (dates.length === 0) return "No upcoming assignments";
		
		const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
		const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
		
		const formatDateForRange = (date: Date) => {
			return date.toLocaleDateString('en-US', { 
				day: 'numeric', 
				month: 'short' 
			});
		};
		
		if (minDate.toDateString() === maxDate.toDateString()) {
			return formatDateForRange(minDate);
		}
		
		return `${formatDateForRange(minDate)} – ${formatDateForRange(maxDate)}`;
	};

	const getNextAssignment = () => {
		const upcomingAssignments = displayAssignments.filter(a => a.status === 'upcoming');
		if (upcomingAssignments.length === 0) return "No upcoming assignments";
		
		const next = upcomingAssignments[0];
		return `${next.title}\n${next.company}\n${next.location}, ${next.time}`;
	};

	return (
		<div className="min-h-screen bg-bg p-8 pr-12">
			{/* Header */}
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-xl font-bold text-primary-text">
					Welcome Back, <span className="text-primary-blue">{getUserName()}</span>
				</h1>
			</div>

			{/* Loading State */}
			{loading && (
				<div className="flex items-center justify-center h-32">
					<div className="text-secondary-text">Loading assignments...</div>
				</div>
			)}

			{/* Main Content */}
			{!loading && (
				<div className="grid grid-cols-[2fr_1fr] gap-4 mb-6">
					{/* Assignments List */}
					<div className="bg-card-color rounded-xl p-6 w-full md:order-1">
						{displayAssignments.length === 0 ? (
							<div className="flex items-center justify-center h-32">
								<div className="text-secondary-text text-sm">No upcoming assignments</div>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-4">
								<div className="flex justify-between items-center mb-2 w-full">
										<h2 className="text-base font-bold text-primary-text">
											Upcoming Assignments
										</h2>
										<p className="text-sm text-secondary-text">{getDateRange()}</p>
								</div>

								{displayAssignments.map((assignment) => (
									<JobseekerAssignmentCard
										key={assignment.id}
										shift={assignment}
										onClick={() => handleViewDetails(assignment)}
										onViewDetails={handleViewDetails}
									/>
								))}
							</div>
						)}
					</div>

					{/* Stats and Calendar */}
					<div className="bg-card-color rounded-xl p-6 w-full md:order-2 text-primary-blue">
						<div className="space-y-4">
							<StatsCard
								title="Next Assignment"
								value={getNextAssignment()}
								icon={<Clock />}
							/>
							<PayoutSummaryCard timeframe="week" />
							<StatsCard
								title="Rating"
								value={typeof profile === 'object' && profile && 'rating' in profile 
									? Number(profile.rating).toFixed(1) 
									: "0.0"
								}
								icon={<Star />}
							/>
							<MonthlyCalendar />
						</div>
					</div>
				</div>
			)}

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