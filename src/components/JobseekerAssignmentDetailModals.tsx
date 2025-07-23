import { Clock, MapPin, DollarSign, Briefcase, FileText, Star, Phone, Mail, Coffee, User } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { JobseekerAssignmentCard } from "./JobseekerAssignmentCard";
import { useAssignments } from "../hooks/useAssignments";
import { StatusEnum } from "../types/hooks";

interface AssignmentDetailsModalProps {
  assignment: JobseekerAssignmentCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssignmentDetailsModal = ({ assignment, isOpen, onClose }: AssignmentDetailsModalProps) => {
  const { updateAssignmentStatus } = useAssignments();
  
  if (!assignment) return null;

  // Handler function for cancelling assignment
  const handleCancelAssignment = async () => {
    try {
      await updateAssignmentStatus(assignment.id, StatusEnum.CancelByEmployee);
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
      <div className="border-t border-t-border pt-4">
        <h4 className="font-semibold text-primary-text mb-3">Assignment Details</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-secondary-text">Status</label>
            <p className="font-medium capitalize">{assignment.status}</p>
          </div>
          
          <div>
            <label className="text-sm text-secondary-text">Assignment ID</label>
            <p className="font-mono text-sm">{assignment.id}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render contact details section
  const renderContactDetails = () => {
    if (!assignment.contactNumber && !assignment.contactEmail) return null;
    
    return (
      <div className="space-y-4">
        <div className="border-t border-t-border pt-4">
          <h4 className="font-semibold text-primary-text mb-3">Contact Information</h4>
          
          <div className="space-y-3">
            {assignment.contactNumber && (
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary-blue" />
                <div>
                  <label className="text-sm text-secondary-text">Phone</label>
                  <p className="font-medium">{assignment.contactNumber}</p>
                </div>
              </div>
            )}
            
            {assignment.contactEmail && (
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary-blue" />
                <div>
                  <label className="text-sm text-secondary-text">Email</label>
                  <p className="font-medium">{assignment.contactEmail}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render cancel button for upcoming assignments
  const renderCancelButton = () => {
    if (assignment.status === 'upcoming') {
      return (
        <div>
          <Button 
            onClick={handleCancelAssignment}
            className="w-full bg-primary-blue text-white hover:bg-error/80"
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
            {assignment.title}
          </DialogTitle>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-secondary-text">{assignment.company}</span>
            {assignment.hourlyRate > 0 && (
              <span className="text-base font-bold text-primary-text">${assignment.hourlyRate}/hr</span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center space-x-4 p-4 bg-card-color border border-border rounded-lg">
              <Clock className="w-6 h-6 text-primary-blue" />
              <div>
                <p className="text-lg font-bold text-primary-text mb-1">Schedule</p>
                <p className="text-sm text-secondary-text">{assignment.date}</p>
                <p className="text-sm text-secondary-text">{assignment.time}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-card-color border border-border rounded-lg">
              <MapPin className="w-6 h-6 text-primary-blue" />
              <div>
                <p className="text-lg font-bold text-primary-text mb-1">Location</p>
                <p className="text-sm text-secondary-text">{assignment.location}</p>
              </div>
            </div>

            {assignment.hourlyRate > 0 && (
              <div className="flex items-center space-x-4 p-4 bg-card-color border border-border rounded-lg">
                <DollarSign className="w-6 h-6 text-primary-blue" />
                <div>
                  <p className="text-lg font-bold text-primary-text mb-1">Compensation</p>
                  <p className="text-sm text-secondary-text">{assignment.hourlyRate} per hour</p>
                </div>
              </div>
            )}

            {assignment.jobType && (
              <div className="flex items-center space-x-4 p-4 bg-card-color border border-border rounded-lg">
                <User className="w-6 h-6 text-primary-blue" />
                <div>
                  <p className="text-lg font-bold text-primary-text mb-1">Job Type</p>
                  <p className="text-sm text-secondary-text">{assignment.jobType}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 p-4 bg-card-color border border-border rounded-lg">
              <Coffee className="w-6 h-6 text-primary-blue" />
              <div>
                <p className="text-lg font-bold text-primary-text mb-1">Break Time</p>
                <p className="text-sm text-secondary-text">{assignment.breakHours ?? 0} hour(s) break included</p>
              </div>
            </div>
          </div>

          {assignment.description && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-primary-blue" />
                <h4 className="text-base font-semibold text-primary-text">Job Description</h4>
              </div>
              <p className="text-sm text-secondary-text leading-relaxed">
                {assignment.description}
              </p>
            </div>
          )}

          {assignment.requirements && (
            <div className="space-y-2 border-t border-t-border pt-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary-blue" />
                <h4 className="text-base font-semibold text-primary-text">Requirements</h4>
              </div>
              <p className="text-sm text-secondary-text leading-relaxed">
                {assignment.requirements}
              </p>
            </div>
          )}

          {/* Contact Details Section */}
          {renderContactDetails()}

          {/* Assignment Details Section */}
          {renderAssignmentDetails()}
          {renderCancelButton()}

          {assignment.status === "completed" && assignment.employerFeedback && (
            <div className="space-y-3 border-t border-t-border pt-4">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-primary-blue" />
                <h4 className="text-base font-semibold text-primary-text">Employer Feedback</h4>
              </div>
              {assignment.rating && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < assignment.rating! ? "fill-yellow-400 text-yellow-400" : "text-secondary-text"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-secondary-text">({assignment.rating}/5)</span>
                </div>
              )}
              <p className="text-sm text-secondary-text leading-relaxed">
                {assignment.employerFeedback}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};