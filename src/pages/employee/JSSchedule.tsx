import EmployeeShiftDetails from "../../components/EmployeeShiftDetails";
import EmployeeCalendarDay from "../../components/EmployeeCalendarDay";
import EmployeeCalendarHeader from "../../components/EmployeeCalendarHeader";
import { AssignmentDetailsModal } from "../../components/JobseekerAssignmentDetailModals";
import { JobseekerAssignmentCard } from "../../components/JobseekerAssignmentCard";
import { EmployeeShiftProps } from "../../types/components";
import { Assignment } from "../../types/hooks";
import { useAssignments } from "../../hooks/useAssignments";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useState,useMemo } from "react";
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { Star } from "lucide-react";
import StatsCard from "../../components/StatsCard";
import PayoutTotalSummaryCard from "../../components/PayoutTotalSummaryCard";


export default function JSSchedule() {
  const [selectedAssignment, setSelectedAssignment] =
    useState<JobseekerAssignmentCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data using custom hooks
  const { assignments, loading, fetchAssignments } = useAssignments();
  const { profileData } = useUserProfile();

  const [selectedShift, setSelectedShift] = useState<EmployeeShiftProps | null>(
    null,
  );

  // Status mapping using object mapping for cleaner code
  const statusMap: Record<
    string,
    "upcoming" | "completed" | "cancel_by_employer" | "cancel_by_employee"
  > = {
    confirmed: "upcoming",
    pending: "upcoming",
    active: "upcoming",
    completed: "completed",
    cancel_by_employer: "cancel_by_employer",
    cancel_by_employee: "cancel_by_employee",
  };

  const mapAssignmentStatusToCardStatus = (status: string) => {
    return statusMap[status?.toLowerCase()] || "upcoming";
  };

  // Transform assignment data to JobseekerAssignmentCard format
  const transformAssignmentToCard = (
    assignment: Assignment,
  ): JobseekerAssignmentCard => {
    // Use real start_time for date, fallback to created_at
    const assignmentDate = assignment.start_time
      ? new Date(assignment.start_time)
      : new Date(assignment.created_at);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    };

    // Use real start_time and end_time from assignment
    const formatRealTime = (startTime: Date, endTime: Date) => {
      const formatTime = (date: Date) =>
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

      return `${formatTime(startTime)} – ${formatTime(endTime)}`;
    };

    return {
      id: assignment.assignment_id,
      title: assignment.job_title || "Assignment",
      company: assignment.employer_name || "Company", // Use employer_name instead of name
      date: formatDate(assignmentDate),
      time: formatRealTime(
        new Date(assignment.start_time),
        new Date(assignment.end_time),
      ), // Use real times
      location: assignment.job_location || "Location TBD", // Use real job location
      hourlyRate: assignment.pay_rate || 0, // Use real pay rate
      description: assignment.job_description || "No description provided", // Use real description
      requirements: assignment.job_requirements || "No specific requirements", // Use real requirements
      status: mapAssignmentStatusToCardStatus(assignment.status),
      // Additional fields for enhanced components
      contactNumber: assignment.contact_number,
      contactEmail: assignment.contact_email,
      jobType: assignment.job_type,
      breakHours: assignment.break_hours,
      startTime: assignment.start_time,
      endTime: assignment.end_time,
    };
  };

  // Use real assignment data
  const displayAssignments = useMemo(() => {
    if (loading || assignments.length === 0) return [];
    return assignments.map(transformAssignmentToCard);
  }, [assignments, loading]);

  // Callback function to refresh assignments when status changes
  const handleAssignmentChange = () => {
    fetchAssignments();
  };

  const handleViewDetails = (assignment: JobseekerAssignmentCard) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAssignment(null);
  };

  const getUserName = () => {
    if (!profileData || typeof profileData !== "object") return "Job Seeker";
    const firstName = (profileData as any).first_name || "";
    const lastName = (profileData as any).last_name || "";
    return firstName && lastName ? `${firstName} ${lastName}` : "Job Seeker";
  };

   const getRating = () => {
      if (
        !profileData ||
        typeof profileData !== 'object' ||
        !('display' in profileData) ||
        typeof profileData.display !== 'object'
      ) {
        return "0.0";
      }

      const rating = (profileData.display as any).rating;
      return rating ? Number(rating).toFixed(1) : "0.0";
  };

    

  const getDateRange = () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday = 1
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const startFormatted = format(weekStart, "MMM d");
    const endFormatted = format(weekEnd, "MMM d");

    return `${startFormatted} – ${endFormatted}`;
  };

  const days = [
    { name: "Mon", date: "22 May 2025" },
    { name: "Tue", date: "23 May 2025" },
    { name: "Wed", date: "24 May 2025" },
    { name: "Thu", date: "25 May 2025" },
    { name: "Fri", date: "26 May 2025" },
    { name: "Sat", date: "27 May 2025" },
    { name: "Sun", date: "28 May 2025" },
  ];

  const handleShiftClick = (shift: EmployeeShiftProps) => {
    setSelectedShift(shift);
  };

  const handleCloseDetails = () => {
    setSelectedShift(null);
  };

  return (
    <div className="bg-tertiary-bg min-h-full flex flex-col px-16 py-8 gap-4">
      <p className="text-3xl text-secondary-text font-montserrat-b">My Jobs</p>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-secondary-text">Loading assignments...</div>
        </div>
      )}

			{/* Upcoming Content */}
			{!loading && (
				<div>


					{/* Assignments List */}
					<div className="bg-card-color rounded-xl p-6 w-full md:order-1">

             {/* Stats and Calendar */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 ">
            <PayoutTotalSummaryCard />
            <StatsCard
              title="Rating"
              value={getRating()}
              icon={<Star />}
            />

          </div>

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

                {displayAssignments
                  .filter((assignment) => assignment.status === "upcoming")
                  .map((assignment) => (
                    <JobseekerAssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-card-color rounded-xl p-6 w-full md:order-1">
        {displayAssignments.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-secondary-text text-sm">
              No upcoming assignments
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center mb-2 w-full">
              <h2 className="text-base font-bold text-primary-text">
                Past Assignments
              </h2>
            </div>

            {displayAssignments
              .filter(
                (assignment) =>
                  assignment.status === "completed" ||
                  assignment.status === "cancel_by_employer" ||
                  assignment.status === "cancel_by_employee",
              )
              .map((assignment) => (
                <JobseekerAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onViewDetails={handleViewDetails}
                />
              ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedAssignment && (
        <AssignmentDetailsModal
          assignment={selectedAssignment}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusChange={handleAssignmentChange}
        />
      )}
    </div>
  );
}
