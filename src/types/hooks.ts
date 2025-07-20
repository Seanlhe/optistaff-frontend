// Centralized hook interfaces

// useAuth interfaces
interface User {
    id: string;
    email: string;
    role: 'jobseeker' | 'employer';
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface SignupData {
    email: string;
    password: string;
    confirmPassword: string;
    userType: 'jobseeker' | 'employer';
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dateOfBirth?: string;        // New field for job seekers
    address?: string;            // New field for both user types
    postalCode?: string;         // New field for both user types
    companyName?: string;
    officeNumber?: string;       // New field for employers
}

// useShifts interfaces
export interface Shift {
    shift_id: string;
    client_id: string;
    title: string;
    description: string;
    start_time: Date;
    end_time: Date;
    pay_rate: number;
    job_location: string;
    staff_needed: number;
    staff_assigned: number;
    submission_cycle: 'PRIMARY' | 'SECONDARY';
    created_at: Date;
    break_duration?: number; // in minutes
    status: 0 | 1 | 2;
}

// useAvailability interfaces
export interface TimeBlock {
    id?: string;
    user_id: string;
    start_time: string; // ISO string
    end_time: string;   // ISO string
    submission_cycle: 'PRIMARY' | 'SECONDARY'; // Scheduling cycle
}

// useUserProfile interfaces
export type UserProfile = Record<string, unknown>;

// usePreferences interfaces
export type UserPreferences = Record<string, unknown>;

// usePayouts interfaces
export type Payout = Record<string, unknown>;

// useAssignments interfaces
export interface Assignment {
    assignment_id: string;
    break_hours: number;
    check_in_time: string | null;
    check_out_time: string | null;
    created_at: string;
    job_title: string;
    name: string;
    status: string;
}

// useFeedback interfaces
export interface Feedback {
  feedback_id: string;
  assignment_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating_score: number;
  comment: string;
  review_type: string;
  created_at?: string;
}

// General status type for assignment cancellation
export type Status = 'cancel_by_employer' | 'cancel_by_employee' | 'confirmed' | 'pending';

