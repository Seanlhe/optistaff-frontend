import { X, Clock, MapPin, DollarSign, Briefcase, FileText, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { JobseekerAssignmentCard } from "./JobseekerAssignmentCard";

interface ShiftDetailsModalProps {
  shift: JobseekerAssignmentCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftDetailsModal = ({ shift, isOpen, onClose }: ShiftDetailsModalProps) => {
  if (!shift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary-text">
            {shift.title}
          </DialogTitle>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-secondary-text">{shift.company}</span>
            <span className="text-lg font-bold text-primary-text">${shift.hourlyRate}/hr</span>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start space-x-3 p-3 bg-card-color border border-border rounded-lg">
              <Clock className="w-5 h-5 text-primary-blue mt-0.5" />
              <div>
                <p className="font-medium text-primary-text">Schedule</p>
                <p className="text-sm text-secondary-text">{shift.date}</p>
                <p className="text-sm text-secondary-text">{shift.time}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-card-color border border-border rounded-lg">
              <MapPin className="w-5 h-5 text-primary-blue mt-0.5" />
              <div>
                <p className="font-medium text-primary-text">Location</p>
                <p className="text-sm text-secondary-text">{shift.location}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-card-color border border-border rounded-lg">
              <DollarSign className="w-5 h-5 text-primary-blue mt-0.5" />
              <div>
                <p className="font-medium text-primary-text">Compensation</p>
                <p className="text-sm text-secondary-text">${shift.hourlyRate} per hour</p>
              </div>
            </div>
          </div>

          {shift.description && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-primary-blue" />
                <h4 className="font-medium text-primary-text">Job Description</h4>
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
                <h4 className="font-medium text-primary-text">Requirements</h4>
              </div>
              <p className="text-sm text-secondary-text leading-relaxed">
                {shift.requirements}
              </p>
            </div>
          )}

          {shift.status === "completed" && shift.employerFeedback && (
            <div className="space-y-3 border border-border pt-4">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-primary-blue" />
                <h4 className="font-medium text-primary-text">Employer Feedback</h4>
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