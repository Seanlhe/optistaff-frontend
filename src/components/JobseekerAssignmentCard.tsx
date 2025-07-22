import { Clock, MapPin, DollarSign, Phone, Mail, Briefcase, Coffee } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useAssignments } from "../hooks/useAssignments";

// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export interface JobseekerAssignmentCard {
  id: string;
  title: string;
  company: string;
  date: string;
  time: string;
  location: string;
  hourlyRate: number;
  description?: string;
  requirements?: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
  employerFeedback?: string;
  rating?: number;
  contactNumber?: string;
  contactEmail?: string;
  jobType?: string;
  breakHours?: number;
  startTime?: Date;
  endTime?: Date;
}

interface JobseekerAssignmentDetailModals {
  assignment: JobseekerAssignmentCard;
  onViewDetails: (assignment: JobseekerAssignmentCard) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const JobseekerAssignmentCard = ({ assignment, onViewDetails }: JobseekerAssignmentDetailModals) => {
  const { cancelAssignment } = useAssignments();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-dark text-white border-green-dark';
      case 'cancelled':
        return 'bg-red-dark text-white border-red-dark';
      case 'upcoming':
        return 'bg-yellow-500 text-white border-yellow-500';
      default:
        return 'bg-secondary-text text-white border-secondary-text';
    }
  };

  const getStatusDisplayName = (status?: string) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }
  };

  const handleCancelAssignment = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    try {
      await cancelAssignment(assignment.id, 'cancel_by_employee');
      // Assignment list will be automatically updated through the hook
    } catch (error) {
      console.error('Failed to cancel assignment:', error);
      // You could show a toast notification here
    }
  };

  const renderActionButtons = () => {
    console.log('Assignment status:', assignment.status); // Debug log
    if (assignment.status === 'upcoming') {
      return (
        <div className="flex gap-2">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(assignment);
            }}
            className="flex-1 bg-white text-primary-text border border-border hover:bg-gray-50 text-sm"
            variant="outline"
          >
            View Details
          </Button>
          <Button 
            onClick={handleCancelAssignment}
            className="px-4 bg-primary-blue text-white hover:bg-primary-blue/80 text-sm"
            variant="default"
          >
            Cancel
          </Button>
        </div>
      );
    }
    
    // For all other statuses, just show view details
    return (
      <Button 
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(assignment);
        }}
        className="w-full bg-white text-primary-text border border-border hover:bg-gray-50 text-sm"
        variant="outline"
      >
        View Details
      </Button>
    );
  };

  return (
    <Card className="p-4 transition-all duration-200 border border-border bg-card-color shadow-none hover:shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-base font-bold text-primary-text mb-1">
            {assignment.title}
          </h3>
          <p className="text-secondary-text text-sm">{assignment.company}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
          {getStatusDisplayName(assignment.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
        <div className="flex items-center text-secondary-text">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-sm">{assignment.date}, {assignment.time}</span>
        </div>
        {assignment.hourlyRate > 0 && (
          <div className="flex items-center text-secondary-text">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="text-sm">{assignment.hourlyRate}/hr</span>
          </div>
        )}
        <div className="flex items-center text-secondary-text">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{assignment.location}</span>
        </div>
        {assignment.jobType && (
          <div className="flex items-center text-secondary-text">
            <Briefcase className="w-4 h-4 mr-2" />
            <span className="text-sm">{assignment.jobType}</span>
          </div>
        )}
        {assignment.contactNumber && (
          <div className="flex items-center text-secondary-text">
            <Phone className="w-4 h-4 mr-2" />
            <span className="text-sm">{assignment.contactNumber}</span>
          </div>
        )}
        {assignment.contactEmail && (
          <div className="flex items-center text-secondary-text">
            <Mail className="w-4 h-4 mr-2" />
            <span className="text-sm">{assignment.contactEmail}</span>
          </div>
        )}
      </div>

      {renderActionButtons()}
    </Card>
  );
};
