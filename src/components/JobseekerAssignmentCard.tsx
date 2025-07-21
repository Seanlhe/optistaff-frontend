import { Clock, MapPin, DollarSign } from "lucide-react";
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
}

interface JobseekerAssignmentDetailModals {
  shift: JobseekerAssignmentCard;
  onViewDetails: (shift: JobseekerAssignmentCard) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const JobseekerAssignmentCard = ({ shift, onViewDetails, onClick }: JobseekerAssignmentDetailModals & { onClick?: () => void }) => {
  const { cancelAssignment } = useAssignments();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white border-success';
      case 'cancelled':
        return 'bg-error text-white border-error';
      case 'upcoming':
        return 'bg-primary-blue text-white border-primary-blue';
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
      await cancelAssignment(shift.id, 'cancel_by_employee');
      // Assignment list will be automatically updated through the hook
    } catch (error) {
      console.error('Failed to cancel assignment:', error);
      // You could show a toast notification here
    }
  };

  const renderActionButtons = () => {
    if (shift.status === 'upcoming') {
      return (
        <div className="flex gap-2">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(shift);
            }}
            className="flex-1 bg-primary-blue text-white hover:bg-primary-blue/80 text-sm"
            variant="default"
          >
            View Details
          </Button>
          <Button 
            onClick={handleCancelAssignment}
            className="px-4 bg-error text-white hover:bg-error/80 text-sm"
            variant="destructive"
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
          onViewDetails(shift);
        }}
        className="w-full bg-primary-blue text-white hover:bg-primary-blue/80 text-sm"
        variant="default"
      >
        View Details
      </Button>
    );
  };

  return (
    <Card className="p-6 transition-all duration-200 border border-border-color bg-card-color shadow-none hover:shadow-md cursor-pointer" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-base font-bold text-primary-text mb-1">
            {shift.title}
          </h3>
          <p className="text-secondary-text text-sm">{shift.company}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shift.status)}`}>
          {getStatusDisplayName(shift.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-secondary-text">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-sm">{shift.date}, {shift.time}</span>
        </div>
        <div className="flex items-center text-secondary-text">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-sm">{shift.location}</span>
        </div>
        {shift.hourlyRate > 0 && (
          <div className="flex items-center text-secondary-text">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="text-sm font-bold">${shift.hourlyRate}/hr</span>
          </div>
        )}
      </div>

      {renderActionButtons()}
    </Card>
  );
};
