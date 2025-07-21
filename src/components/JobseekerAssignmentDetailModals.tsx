import { Clock, MapPin, DollarSign, Briefcase, FileText, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { JobseekerAssignmentCard } from "./JobseekerAssignmentCard";
import { useAssignments } from "../hooks/useAssignments";

interface ShiftDetailsModalProps {
  shift: JobseekerAssignmentCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftDetailsModal = ({ shift, isOpen, onClose }: ShiftDetailsModalProps) => {
  const { cancelAssignment } = useAssignments();
  
  if (!shift) return null;

  // Handler function for cancelling assignment
  const handleCancelAssignment = async () => {
    try {
      await cancelAssignment(shift.id, 'cancel_by_employee');
      // Close modal after successful cancellation
      onClose();
    } catch (error) {
      console.error('Failed to cancel assignment:', error);
      // You could show a toast notification here
    }
  };

  // Render assignment-specific information section
  const renderAssignmentDetails = () => (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <h4 className="font-semibold text-primary-text mb-3">Assignment Details</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-secondary-text">Status</label>
            <p className="font-medium capitalize">{shift.status}</p>
          </div>
          
          <div>
            <label className="text-sm text-secondary-text">Assignment ID</label>
            <p className="font-mono text-sm">{shift.id}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render cancel button for upcoming assignments
  const renderCancelButton = () => {
    if (shift.status === 'upcoming') {
      return (
        <div className="pt-4 border-t">
          <Button 
            onClick={handleCancelAssignment}
            className="w-full bg-error text-white hover:bg-error/80"
            variant="destructive"
          >
            Cancel Assignment
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-lg mx-auto border border-none max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-primary-text">
            {shift.title}
          </DialogTitle>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-secondary-text">{shift.company}</span>
            {shift.hourlyRate > 0 && (
              <span className="text-base font-bold text-primary-text">${shift.hourlyRate}/hr</span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start space-x-3 p-3 bg-card-color border border-border-color rounded-lg">
              <Clock className="w-5 h-5 text-primary-blue mt-0.5" />
              <div>
                <p className="text-base font-semibold text-primary-text">Schedule</p>
                <p className="text-sm text-secondary-text">{shift.date}</p>
                <p className="text-sm text-secondary-text">{shift.time}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-card-color border border-border-color rounded-lg">
              <MapPin className="w-5 h-5 text-primary-blue mt-0.5" />
              <div>
                <p className="text-base font-semibold text-primary-text">Location</p>
                <p className="text-sm text-secondary-text">{shift.location}</p>
              </div>
            </div>

            {shift.hourlyRate > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-card-color border border-border-color rounded-lg">
                <DollarSign className="w-5 h-5 text-primary-blue mt-0.5" />
                <div>
                  <p className="text-base font-semibold text-primary-text">Compensation</p>
                  <p className="text-sm text-secondary-text">${shift.hourlyRate} per hour</p>
                </div>
              </div>
            )}
          </div>

          {shift.description && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-primary-blue" />
                <h4 className="text-base font-semibold text-primary-text">Job Description</h4>
              </div>
              <p className="text-sm text-secondary-text leading-relaxed">
                {shift.description}
              </p>
            </div>
          )}

          {shift.requirements && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary-blue" />
                <h4 className="text-base font-semibold text-primary-text">Requirements</h4>
              </div>
              <p className="text-sm text-secondary-text leading-relaxed">
                {shift.requirements}
              </p>
            </div>
          )}

          {/* Assignment Details Section */}
          {renderAssignmentDetails()}
          {renderCancelButton()}

          {shift.status === "completed" && shift.employerFeedback && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-primary-blue" />
                <h4 className="text-base font-semibold text-primary-text">Employer Feedback</h4>
              </div>
              {shift.rating && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < shift.rating! ? "fill-yellow-400 text-yellow-400" : "text-secondary-text"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-secondary-text">({shift.rating}/5)</span>
                </div>
              )}
              <p className="text-sm text-secondary-text leading-relaxed">
                {shift.employerFeedback}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};