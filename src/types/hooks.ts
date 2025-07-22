// Centralized hook interfaces

// Location-related type definitions
export type Coordinates = [number, number]; // [latitude, longitude] tuple
export type LocationString = string; // Formatted address string

// Location data from job_seekers table
export interface UserLocationData {
  home_location?: string; // Stored as "latitude,longitude" string in database
  postal_code?: string; // Singapore postal code
  address?: string; // Full address string
}

// useAuth interfaces
export interface User {
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
    client_name: string;
    title: string;
    description: string;
    start_time: Date;
    end_time: Date;
    pay_rate: number;
    job_location: string;
    pay_rate: number;
    job_location: string;
    staff_needed: number;
    staff_assigned: number;
    submission_cycle: 'PRIMARY' | 'SECONDARY';
    created_at: Date;
    break_duration?: number; // in minutes
    status: string;
    job_name: string;
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

// Enhanced usePreferences hook return type with location support
export interface UsePreferencesReturn {
  // Existing properties
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  
  // Existing methods
  fetchPreferences: () => Promise<void>;
  savePreferences: (formData: PreferencesFormData) => Promise<boolean>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<boolean>;
  resetPreferences: () => Promise<boolean>;
  createDefaultPreferences: () => Promise<void>;
  getFormData: () => PreferencesFormData | null;
  hasJobPreference: (jobTypeName: string) => boolean;
  getPreferredJobTypes: () => string[];
  
  // New location-related properties and methods
  homeLocation: [number, number] | null; // User's home coordinates from job_seekers table
  homeAddress: string | null; // User's formatted home address
  loadLocationData: () => Promise<void>; // Load home location from job_seekers table
  geocodeHomeLocation: () => Promise<[number, number] | null>; // Convert address to coordinates
}

