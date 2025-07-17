import { Clock, MapPin, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

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
  showStatus?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ShiftCard = ({ shift, onViewDetails, showStatus = false, onClick }: JobseekerAssignmentDetailModals & { onClick?: () => void }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-end text-gradient-start';
      case 'cancelled':
        return 'bg-color-ring text-color-foreground';
      default:
        return 'bg-primary-blue text-primary-text';
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200 border border-border bg-card-color" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-montserrat-smb text-lg text-primary-text mb-1">
            {shift.title}
          </h3>
          <p className="text-secondary-text text-sm">{shift.company}</p>
        </div>
        {showStatus && shift.status && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shift.status)}`}>
            {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
          </span>
        )}
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
        <div className="flex items-center text-secondary-text">
          <DollarSign className="w-4 h-4 mr-2" />
          <span className="text-sm font-montserrat-b">${shift.hourlyRate}/hr</span>
        </div>
      </div>

      <Button 
        onClick={() => onViewDetails(shift)}
        className="w-full bg-primary-blue text-primary-text hover:bg-gradient-end hover:text-gradient-start"
        variant="default"
      >
        View Details
      </Button>
    </Card>
  );
};

export const JobseekerAssignmentDetailModal = ({ shift, isOpen, onClose }: JobseekerAssignmentDetailModals) => {
  if (!shift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary-text">
            {shift.title}
          </DialogTitle>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-secondary-text">{shift.company}</span>
            <span className="text-lg font-bold text-primary-text">${shift.hourlyRate}/hr</span>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};