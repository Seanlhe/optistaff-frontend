// Centralized hook interfaces

// Location-related type definitions
export type Coordinates = [number, number]; // [latitude, longitude] tuple
export type LocationString = string; // Formatted address string

// Location data from job_seekers table
export interface UserLocationData {
  address_coordinates?: string; // Stored as "latitude,longitude" string in database
  postal_code?: string; // Singapore postal code
  address?: string; // Full address string
}

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

// For displaying profile information (read-only)
export interface ProfileDisplayData {
  // Personal Info (from job_seekers/clients table)
  firstName: string;
  lastName: string;
  fullName: string;        // computed: firstName + lastName
  
  // Job Seeker specific (only for job seekers)
  rating?: number;         // from job_seekers.rating
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'; // from job_seekers.status
  
  // Client specific (only for clients)
  companyName?: string;    // from clients.company_name
  
  // Account Info (from auth.users)
  email: string;           // from auth.users.email
  accountCreated: string;  // from auth.users.created_at
}

// For editing personal information
export interface PersonalInfoFormData {
  phoneNumber: string;     // job_seekers.phone_number OR clients.phone
  homeAddress: string;     // job_seekers.address_coordinates OR clients.address  
  postalCode: string;      // job_seekers.postal_code OR clients.postal_code
}

// For changing account details
export interface AccountSettingsFormData {
  email: string;           // auth.users.email
  currentPassword: string; // for verification
  newPassword?: string;    // optional - only if changing password
  confirmPassword?: string; // optional - only if changing password
}

// Complete profile data structure
export interface UserProfileData {
  // Display data (read-only)
  display: ProfileDisplayData;
  
  // Editable data
  personalInfo: PersonalInfoFormData;
  
  // User role for conditional rendering
  userRole: 'jobseeker' | 'employer';
}

// Legacy type for backward compatibility
export type UserProfile = UserProfileData;

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
  
  // Location fields (read-only from job_seekers table)
  homeLocation?: [number, number]; // [latitude, longitude] coordinates for map display
  homeAddress?: string; // Formatted address string for display purposes
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
export type Feedback = Record<string, unknown>;

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



