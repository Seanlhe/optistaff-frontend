import { Clock, MapPin, DollarSign, Phone, Mail, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export interface JobseekerAssignmentCard {
  id: string;
  title: string;
  company_name: string;
  date: string;
  time: string;
  location: string;
  hourlyRate: number;
  description?: string;
  requirements?: string;
  status?: 'upcoming' | 'completed' | 'cancel_by_employer' | 'cancel_by_employee';
  employerFeedback?: string;
  rating?: number;
  contactNumber?: string;
  contactEmail?: string;
  jobType?: string;
  breakHours?: number;
  startTime?: Date;
  endTime?: Date;
}

interface JobseekerAssignmentCardProps {
  assignment: JobseekerAssignmentCard;
  onViewDetails: (assignment: JobseekerAssignmentCard) => void;
}

export const JobseekerAssignmentCard = ({ assignment, onViewDetails }: JobseekerAssignmentCardProps) => {
  // Status color mapping
  const statusColors = {
    completed: 'bg-green-dark text-white border-green-dark',
    cancel_by_employer: 'bg-red-dark text-white border-red-dark',
    cancel_by_employee: 'bg-red-dark text-white border-red-dark',
    upcoming: 'bg-yellow-500 text-white border-yellow-500',
  };

  // Status display names
  const statusNames = {
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancel_by_employer: 'Cancelled by Employer',
    cancel_by_employee: 'Cancelled by Employee',
  };

  const getStatusColor = (status?: string) => {
    return statusColors[status as keyof typeof statusColors] || 'bg-secondary-text text-white border-secondary-text';
  };

  const getStatusDisplayName = (status?: string) => {
    return statusNames[status as keyof typeof statusNames] || 
           (status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : 'Unknown');
  };

  const renderGridItem = (icon: React.ReactNode, text: string, condition: boolean = true) => {
    if (!condition) return null;
    return (
      <div className="flex items-center text-secondary-text">
        {icon}
        <span className="text-sm">{text}</span>
      </div>
    );
  };

  const renderActionButtons = () => {
    // Both upcoming and other statuses show the same "View Details" button
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
          <p className="text-secondary-text text-sm">{assignment.company_name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
          {getStatusDisplayName(assignment.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
        {renderGridItem(<Clock className="w-4 h-4 mr-2" />, `${assignment.date}, ${assignment.time}`)}
        {renderGridItem(<DollarSign className="w-4 h-4 mr-2" />, `${assignment.hourlyRate}/hr`, assignment.hourlyRate > 0)}
        {renderGridItem(<MapPin className="w-4 h-4 mr-2" />, assignment.location)}
        {renderGridItem(<Briefcase className="w-4 h-4 mr-2" />, assignment.jobType!, !!assignment.jobType)}
        {renderGridItem(<Phone className="w-4 h-4 mr-2" />, assignment.contactNumber!, !!assignment.contactNumber)}
        {renderGridItem(<Mail className="w-4 h-4 mr-2" />, assignment.contactEmail!, !!assignment.contactEmail)}
      </div>

      {renderActionButtons()}
    </Card>
  );
};