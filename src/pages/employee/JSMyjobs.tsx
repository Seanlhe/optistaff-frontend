import { useState, useMemo } from "react";
import StatsCard from "../../components/StatsCard";
import { ShiftDetailsModal } from "../../components/JobseekerAssignmentDetailModals";
import { JobseekerAssignmentCard, JobseekerAssignmentCard as JobseekerAssignmentCardType } from "../../components/JobseekerAssignmentCard";
import { DollarSign, Star, Clock } from "lucide-react";
import MonthlyCalendar from "../../components/MonthlyCalendar";
import { useAssignments } from "../../hooks/useAssignments";
import { useUserProfile } from "../../hooks/useUserProfile";

const JSMyjobs = () => {
    const [selectedAssignment, setSelectedAssignment] = useState<JobseekerAssignmentCard | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch data using custom hooks
    const { assignments } = useAssignments();
    const { profile } = useUserProfile();

    // Mock data as fallback until proper data structure is available
    const mockAssignments: JobseekerAssignmentCard[] = useMemo(() => [
        {
            id: "1",
            title: "Barista at The Coffee Bean",
            company: "The Coffee Bean",
            date: "Sat, June 14",
            time: "2:00 PM – 4:00 PM",
            location: "Changi City Point",
            hourlyRate: 15,
            description: "Operate POS, assist customers, manage transactions and handle returns.",
            requirements: "Attire: Smart casual. Previous barista experience preferred.",
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
            description: "Assist kitchen staff with food preparation and maintain cleanliness.",
            requirements: "Kitchen uniform provided. Fast-paced environment.",
            status: "upcoming",
        }
    ], []);

    // Use real data if available, otherwise fallback to mock data
    const displayAssignments = assignments.length > 0 ? [] : mockAssignments; // Using mock until real data structure is fixed
    // const displayAssignments = assignments;

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
        return "14 Jun – 15 Jun"; // Mock range for now
    };

    return (
        <div className="min-h-screen bg-bg p-8 pr-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-3xl text-secondary-text font-montserrat-b">
                    My Jobs
                </p>

            </div>

            {/* Section Header */}
            
            {/* Main Content */}
            <div className="grid  gap-4 mb-6">
                {/* Assignments List */}
                <div className="bg-card-color rounded-xl p-6 w-full md:order-1">
                    {displayAssignments.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-secondary-text text-sm">No upcoming assignments</div>
                        </div>
                    ) : ( 
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex justify-between items-center mb-2 w-full">
                                    {/* <h2 className="text-base font-bold text-primary-text">
                                        Upcoming Assignments
                                    </h2>
                                    <p className="text-sm text-secondary-text">14 Jun – 15 Jun</p> */}
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
                {/* <div className="bg-card-color rounded-xl p-6 w-full md:order-2 text-primary-blue">
                    <div className="space-y-4">
                        <StatsCard
                            title="Next Assignment"
                            value={displayAssignments.length > 0 
                                ? `${displayAssignments[0].title}\n${displayAssignments[0].company}\n${displayAssignments[0].location}, ${displayAssignments[0].time}`
                                : "No upcoming assignments"
                            }
                            icon={<Clock />}
                        />
                        <StatsCard
                            title="Earnings This Week"
                            value="$600.00"
                            icon={<DollarSign />}
                        />
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
                </div> */}
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

export default JSMyjobs;