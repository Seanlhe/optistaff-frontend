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
export interface UserPreferences {
  preference_id?: string;
  user_id: string;
  min_pay_rate: number;
  max_travel_km: number;
  desired_roles: string[]; // Array of job type names (changed from UUIDs)
  max_hours_per_week: number; // Now required with default value 40
  max_hours_per_shift: number; // Now required with default value 8
  consider_lower_rate: boolean; // Now required with default value false
  created_at?: string;
  updated_at?: string;
}

// Form data interface for frontend components
export interface PreferencesFormData {
  payRate: number;
  considerLowerRate: boolean;
  maxHoursPerWeek: number;
  maxHoursPerShift: number;
  maxTravelKm: number;
  selectedJobNames: string[]; // Job names - now matches database storage
}

// Job Types and Categories interfaces
export interface JobCategory {
  category_id: string;
  category_name: string;
  description?: string;
  parent_category_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobType {
  job_type_id: string;
  type_name: string;
  category_id: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: JobCategory; // For joined queries
}

export interface JobTypesByCategory {
  [categoryName: string]: JobType[];
}

// usePayouts interfaces
export type Payout = Record<string, unknown>;

// useAssignments interfaces
export type Assignment = Record<string, unknown>;

// useFeedback interfaces
export type Feedback = Record<string, unknown>;

