# OptiStaff User Flow Sequence Diagrams

## Overview
This document contains comprehensive user flow sequence diagrams for the OptiStaff platform. Each diagram shows the interaction between specific pages, controller hooks, and database operations, including alternative flows, error handling, and retry mechanisms.

## Controllers (Hooks) Reference
- **useAuth**: Authentication and user management
- **usePreferences**: User preference management
- **usePreferencesForm**: Form-specific preference handling
- **usePreferencesLocation**: Location and geocoding services
- **useAvailability**: Jobseeker availability management
- **useShifts**: Employer shift management
- **useAssignments**: Assignment and booking management
- **useFeedback**: Review and rating system

---

## UC1: Create Account

```mermaid
sequenceDiagram
    participant LandingPage as LandingPage.tsx
    participant Auth as Auth.tsx/Signup.tsx
    participant AuthForm as AuthFormFields
    participant useAuth as useAuth Controller
    participant AuthUsers as auth.users table
    participant JobSeekers as job_seekers table
    participant Clients as clients table

    Note over LandingPage: User clicks "Don't have an account? Sign up"
    LandingPage->>Auth: Navigate to /auth?mode=signup
    Auth->>AuthForm: Render signup form with user type selection
    
    Note over AuthForm: User fills form and selects Jobseeker/Employer
    AuthForm->>useAuth: signup(signupData)
    
    alt Email validation fails
        useAuth-->>AuthForm: Validation error
        AuthForm-->>Auth: Display validation error
    else Password mismatch
        useAuth-->>AuthForm: "Passwords do not match"
        AuthForm-->>Auth: Display password error
    else Postal code invalid (Singapore format)
        useAuth-->>AuthForm: "Postal code must be 6 digits"
        AuthForm-->>Auth: Display postal code error
    else Valid signup data
        useAuth->>AuthUsers: signUp() with metadata
        
        alt Email already exists
            AuthUsers-->>useAuth: Error: Email already registered
            useAuth-->>AuthForm: "Email address is already registered"
            AuthForm-->>Auth: Show create account suggestion
        else Signup successful
            AuthUsers->>AuthUsers: Insert user record
            
            alt Email confirmation required
                AuthUsers-->>useAuth: User created, no session
                useAuth->>Auth: Navigate to /auth?mode=login with success message
            else Auto-login enabled
                AuthUsers-->>useAuth: User + session created
                alt Jobseeker selected
                    useAuth->>JobSeekers: Create jobseeker profile
                    useAuth->>Auth: Navigate to /employee/preferences
                else Employer selected
                    useAuth->>Clients: Create client profile
                    useAuth->>Auth: Navigate to /employer/dashboard
                end
            end
        end
    end
```

---

## UC2: Sign In

```mermaid
sequenceDiagram
    participant LandingPage as LandingPage.tsx
    participant Auth as Auth.tsx/Login.tsx
    participant useAuth as useAuth Controller
    participant AuthUsers as auth.users table
    participant JobSeekers as job_seekers table
    participant Clients as clients table

    Note over LandingPage: User clicks "Sign In"
    LandingPage->>Auth: Navigate to /auth?mode=login
    
    Note over Auth: User enters email and password
    Auth->>useAuth: login(email, password)
    
    alt Invalid credentials
        useAuth->>AuthUsers: signInWithPassword()
        AuthUsers-->>useAuth: Invalid login error
        useAuth-->>Auth: Display "Invalid credentials"
        
    else Valid credentials but unverified email
        AuthUsers-->>useAuth: Email not confirmed error
        useAuth-->>Auth: "Please check your email and confirm your account"
        
    else Successful login
        useAuth->>AuthUsers: signInWithPassword()
        AuthUsers-->>useAuth: Return user session
        
        alt Role cached in localStorage
            useAuth-->>Auth: Use cached role for navigation
        else No cached role
            useAuth->>JobSeekers: Query for jobseeker record
            useAuth->>Clients: Query for client record
            
            alt Found in job_seekers
                JobSeekers-->>useAuth: Jobseeker record found
                useAuth->>Auth: Navigate to /employee/preferences
            else Found in clients
                Clients-->>useAuth: Client record found
                useAuth->>Auth: Navigate to /employer/dashboard
            else No role found
                useAuth->>Auth: Navigate to /employee/preferences (default)
            end
        end
    end
```

---

## UC3: Set Preferences

```mermaid
sequenceDiagram
    participant JSPref as JSPref.tsx/Preferences.tsx
    participant PreferencesForm as PreferencesForm
    participant usePreferencesForm as usePreferencesForm Controller
    participant usePreferences as usePreferences Controller
    participant usePreferencesLocation as usePreferencesLocation Controller
    participant LocationMap as LocationAwareMap
    participant Preferences as preferences table

    JSPref->>PreferencesForm: Mount preferences page
    PreferencesForm->>usePreferencesForm: Initialize form hook
    usePreferencesForm->>usePreferences: fetchPreferences()
    usePreferences->>Preferences: Query preferences for user
    
    alt No existing preferences
        Preferences-->>usePreferences: No records found
        usePreferences->>Preferences: create_default_preferences(user_id)
        Preferences-->>usePreferences: Default preferences created
        usePreferences-->>PreferencesForm: Populate with defaults
    else Existing preferences found
        Preferences-->>usePreferences: Return user preferences
        usePreferences-->>PreferencesForm: Populate form with existing data
    end

    PreferencesForm->>LocationMap: Render map with travel radius
    LocationMap->>usePreferencesLocation: loadLocationData()
    
    alt Location permission denied
        usePreferencesLocation-->>LocationMap: Location error
        LocationMap-->>PreferencesForm: Show error with retry button
    else Location permission granted
        usePreferencesLocation-->>LocationMap: Update map center and address
    end

    Note over PreferencesForm: User modifies pay rate, job types, travel radius
    PreferencesForm->>PreferencesForm: Validate form data locally
    
    alt Form validation errors
        PreferencesForm-->>PreferencesForm: Display validation errors
    else Valid form data
        Note over PreferencesForm: User clicks "Save Preferences"
        PreferencesForm->>usePreferencesForm: savePreferences(formData)
        usePreferencesForm->>usePreferences: savePreferences(preferencesData)
        usePreferences->>Preferences: upsert_user_preferences()
        
        alt Database validation errors
            Preferences-->>usePreferences: validation_errors array
            usePreferences-->>PreferencesForm: Display server validation errors
        else Save successful
            Preferences-->>usePreferences: Updated preferences record
            usePreferences-->>PreferencesForm: Success confirmation
        end
    end
```

---

## UC4: Indicate Availability

```mermaid
sequenceDiagram
    participant JSSchedule as JSSchedule.tsx
    participant Availability as Availability Component
    participant Calendar as Calendar Component
    participant useAvailability as useAvailability Controller
    participant AvailabilityTable as availability table

    JSSchedule->>Availability: Navigate to availability page
    Availability->>Calendar: Render calendar interface
    Calendar->>useAvailability: getAvailability("PRIMARY")
    
    alt User not authenticated
        useAvailability-->>Calendar: "User not authenticated" error
        Calendar-->>JSSchedule: Redirect to auth page
    else Authentication successful
        useAvailability->>AvailabilityTable: Query availability for user + cycle
        AvailabilityTable-->>useAvailability: Return existing time blocks
        useAvailability-->>Calendar: Populate calendar with availability slots
    end

    Note over Calendar: User selects/deselects time slots on calendar
    Calendar->>Calendar: Validate time slot selection
    
    alt Invalid time selection
        Calendar-->>Calendar: Show validation error
    else Valid time selection
        Note over Calendar: User clicks save/confirm availability
        Calendar->>useAvailability: setAvailability(timeBlocks, "PRIMARY")
        useAvailability->>AvailabilityTable: Delete existing availability for user + cycle
        
        alt Delete operation fails
            AvailabilityTable-->>useAvailability: Delete error
            useAvailability-->>Calendar: "Error clearing previous availability"
        else Delete successful
            useAvailability->>AvailabilityTable: Insert new time blocks
            
            alt Insert operation fails
                AvailabilityTable-->>useAvailability: Insert error
                useAvailability-->>Calendar: "Error saving availability"
            else Insert successful
                AvailabilityTable-->>useAvailability: Success confirmation
                useAvailability-->>Calendar: "Availability saved successfully"
            end
        end
    end
```

---

## UC5: Cancel Shift

```mermaid
sequenceDiagram
    participant JSMyJobs as JSMyJobs.tsx
    participant AssignmentCard as JobseekerAssignmentCard
    participant DetailModal as JobseekerAssignmentDetailModals
    participant useAssignments as useAssignments Controller
    participant Assignments as assignments table
    participant JobSeekers as job_seekers table

    JSMyJobs->>AssignmentCard: Display assigned/upcoming shifts
    AssignmentCard->>AssignmentCard: Show shift details with "Cancel" button
    
    Note over AssignmentCard: User clicks "Cancel Shift" for upcoming shift
    AssignmentCard->>DetailModal: Open cancellation modal
    DetailModal->>DetailModal: Display cancellation reasons and rating warning
    
    alt User clicks "Go Back"
        DetailModal-->>JSMyJobs: Close modal, return to shift view
        
    else User confirms cancellation
        DetailModal->>useAssignments: updateAssignmentStatus(assignmentId, "CancelByJobseeker")
        useAssignments->>Assignments: update_assignment_status()
        
        alt Update operation fails
            Assignments-->>useAssignments: Database error
            useAssignments-->>DetailModal: Display error message
            
        else Update successful
            Assignments->>Assignments: Update status to cancelled
            Assignments->>JobSeekers: Reduce reliability rating
            Assignments-->>useAssignments: Return updated_count
            
            useAssignments-->>DetailModal: "Shift cancelled successfully"
            DetailModal->>JSMyJobs: Close modal and refresh assignments
        end
    end
```

---

## UC6: List Jobs (Create Shifts)

```mermaid
sequenceDiagram
    participant ClientDashboard as ClientDashboard.tsx
    participant UploadJobs as UploadJobs.tsx
    participant UploadCSV as UploadCSV.tsx
    participant UploadModal as UploadModal Component
    participant useShifts as useShifts Controller
    participant Shifts as shifts table

    Note over ClientDashboard: Main Flow - Single Job Creation
    ClientDashboard->>UploadJobs: Click "Post a New Job"
    UploadJobs->>UploadJobs: Render shift creation form
    
    Note over UploadJobs: User fills job details and validates locally
    
    alt Form validation fails
        UploadJobs-->>UploadJobs: Display field-specific errors
    else Valid form data
        UploadJobs->>useShifts: createShift(shiftData)
        useShifts->>Shifts: create_shift()
        
        alt Shift creation fails
            Shifts-->>useShifts: Database validation error
            useShifts-->>UploadJobs: Display creation error
        else Shift created successfully
            Shifts-->>useShifts: New shift created with ID
            useShifts-->>UploadJobs: "Job posted successfully"
            UploadJobs->>ClientDashboard: Navigate back with success message
        end
    end

    Note over ClientDashboard: Alternative Flow - CSV Upload
    ClientDashboard->>UploadCSV: Click "Upload Shifts CSV"
    UploadCSV->>UploadModal: Show file upload modal
    
    Note over UploadModal: User selects and parses CSV file
    
    alt Invalid CSV format
        UploadModal-->>UploadCSV: Show parsing errors
    else Valid CSV data
        UploadModal->>useShifts: Process CSV rows for bulk creation
        useShifts->>Shifts: create_shift() for each row
        
        alt Some shifts failed validation
            Shifts-->>useShifts: Partial success with errors
            useShifts-->>UploadCSV: Show success count + error details
        else All shifts created successfully
            Shifts-->>useShifts: All shifts created
            useShifts-->>UploadCSV: "All shifts uploaded successfully"
            UploadCSV->>ClientDashboard: Navigate back with full success
        end
    end
```

---

## UC7: Review Employee

```mermaid
sequenceDiagram
    participant ClientHistory as ClientHistory.tsx
    participant Review as Review.tsx
    participant useFeedback as useFeedback Controller
    participant useAssignments as useAssignments Controller
    participant Assignments as assignments table
    participant Feedback as feedback table

    ClientHistory->>ClientHistory: Display completed shifts with "Rate Employee" buttons
    
    Note over ClientHistory: User clicks "Rate Employee" for completed shift
    ClientHistory->>Review: Navigate with shiftId and employeeId
    Review->>useAssignments: fetchAssignmentsByShift(shiftId)
    useAssignments->>Assignments: get_assignments_by_shift()
    Assignments-->>useAssignments: Return assignment details with employee info
    useAssignments-->>Review: Populate employee name and shift details

    Review->>useFeedback: fetchFeedbackReviewAssignID(assignmentId, revieweeId)
    useFeedback->>Feedback: Query for existing review
    
    alt Feedback already exists
        Feedback-->>useFeedback: Return existing feedback record
        useFeedback-->>Review: Pre-populate form with existing rating/comments
    else No existing feedback
        Feedback-->>useFeedback: No records found
        useFeedback-->>Review: Show empty review form
    end

    Note over Review: User selects rating and enters comments
    
    alt Missing required rating
        Review-->>Review: Show "Rating is required" error
    else Valid feedback data
        Review->>useFeedback: submitFeedback(feedbackData)
        useFeedback->>Feedback: Insert or update feedback record
        
        alt Database operation fails
            Feedback-->>useFeedback: Insert/update error
            useFeedback-->>Review: "Failed to save review"
            
        else Feedback saved successfully
            Feedback-->>useFeedback: Feedback record saved
            useFeedback-->>Review: "Review submitted successfully"
            Review->>ClientHistory: Navigate back with success message
        end
    end
```

---

## UC8: Employer Cancels Job Listing

```mermaid
sequenceDiagram
    participant ClientDashboard as ClientDashboard.tsx
    participant ShiftCard as ClientShiftCard
    participant ShiftDetails as ClientShiftDetails
    participant useShifts as useShifts Controller
    participant Shifts as shifts table
    participant Assignments as assignments table

    ClientDashboard->>ShiftCard: Display posted shifts with status indicators
    ShiftCard->>ShiftCard: Show shift summary with action buttons
    
    Note over ShiftCard: User clicks on shift for details
    ShiftCard->>ShiftDetails: Open shift details modal/page
    ShiftDetails->>ShiftDetails: Display full shift information and "Cancel" button
    
    Note over ShiftDetails: User clicks "Cancel" button and sees confirmation dialog
    
    alt User clicks "Go Back" / "Keep Job"
        ShiftDetails-->>ClientDashboard: Return to dashboard without changes
        
    else User confirms cancellation
        ShiftDetails->>useShifts: deleteShift(shiftId)
        useShifts->>Assignments: Check assignments for this shift
        
        alt Shift has no assigned employees
            Assignments-->>useShifts: No assignments found
            useShifts->>Shifts: Delete shift record completely
            Shifts-->>useShifts: Shift deleted successfully
            useShifts-->>ShiftDetails: "Job listing cancelled"
            
        else Shift has assigned employees
            Assignments-->>useShifts: Assignments exist for this shift
            useShifts->>Shifts: Update shift status to 'CANCELLED'
            useShifts->>Assignments: Update assignment statuses to 'CancelByEmployer'
            Assignments-->>useShifts: Status updated, notifications sent
            useShifts-->>ShiftDetails: "Job cancelled, employees notified"
        end
        
        ShiftDetails->>ClientDashboard: Close details and refresh dashboard
    end
```

---

## Sub Use Cases for Integration Testing

### Authentication Sub-flows (UC1, UC2)
- **SUC1.1**: Email validation and duplicate checking
  - Test: Valid/invalid email formats
  - Test: Existing vs new email addresses
  - Controller: `useAuth.signup()`

- **SUC1.2**: Password strength validation and confirmation matching
  - Test: Password complexity requirements
  - Test: Password confirmation mismatch scenarios
  - Controller: `useAuth.signup()`

- **SUC1.3**: User type selection and metadata storage
  - Test: Jobseeker vs Employer profile creation
  - Test: Required fields per user type (company name for employers)
  - Controller: `useAuth.signup()`

- **SUC1.4**: Role determination and caching mechanism
  - Test: Database role lookup vs cached role
  - Test: Role-based navigation after login
  - Controller: `useAuth.updateUserState()`

- **SUC2.1**: Session management and persistence
  - Test: Auto-login on page refresh
  - Test: Session timeout handling
  - Controller: `useAuth` useEffect hook

### Preferences Sub-flows (UC3)
- **SUC3.1**: Default preferences creation using database function
  - Test: New user preference initialization
  - Test: Database function `create_default_preferences()`
  - Controller: `usePreferences.createDefaultPreferences()`

- **SUC3.2**: Location permission handling and error states
  - Test: Permission denied scenarios
  - Test: Location service unavailable
  - Controller: `usePreferencesLocation.loadLocationData()`

- **SUC3.3**: Address geocoding and map integration
  - Test: Valid address geocoding
  - Test: Google Maps API integration
  - Controller: `usePreferencesLocation.geocodeHomeLocation()`

- **SUC3.4**: Form validation and error display patterns
  - Test: Client-side vs server-side validation
  - Test: Field-specific error messaging
  - Controller: `usePreferencesForm.savePreferences()`

### Availability Sub-flows (UC4)
- **SUC4.1**: Calendar time slot selection and validation
  - Test: Time slot overlap detection
  - Test: Past date selection prevention
  - Component: `Calendar` with validation logic

- **SUC4.2**: Cycle-based availability management
  - Test: PRIMARY vs SECONDARY cycle handling
  - Test: Cycle-specific data isolation
  - Controller: `useAvailability.getAvailability()`

- **SUC4.3**: Bulk time block operations (delete + insert)
  - Test: Atomic operation success/failure
  - Test: Partial operation rollback
  - Controller: `useAvailability.setAvailability()`

### Assignment Management Sub-flows (UC5)
- **SUC5.1**: Status update with cascading effects
  - Test: Assignment status changes
  - Test: Rating impact calculations
  - Controller: `useAssignments.updateAssignmentStatus()`

- **SUC5.2**: Rating calculation and user profile updates
  - Test: Average rating recalculation
  - Test: Rating impact on future assignments
  - Database: `update_assignment_status()` RPC function

### Shift Management Sub-flows (UC6, UC8)
- **SUC6.1**: Form-based shift creation with validation
  - Test: Required field validation
  - Test: Date/time format validation
  - Controller: `useShifts.createShift()`

- **SUC6.2**: CSV parsing and bulk operation handling
  - Test: CSV format validation
  - Test: Partial success scenarios
  - Component: `UploadModal` with CSV processing

- **SUC8.1**: Assignment-aware cancellation logic
  - Test: Unassigned shift deletion
  - Test: Assigned shift status update with notifications
  - Controller: `useShifts.deleteShift()`

### Feedback Sub-flows (UC7)
- **SUC7.1**: Assignment-feedback relationship validation
  - Test: Feedback linked to specific assignments
  - Test: Duplicate feedback prevention
  - Controller: `useFeedback.fetchFeedbackReviewAssignID()`

- **SUC7.2**: Rating aggregation and profile updates
  - Test: Employee average rating calculation
  - Test: Rating impact on future job assignments
  - Database: Feedback table triggers

---

## Implementation Improvements Identified

### 1. Error Handling Standardization
- Implement consistent error boundary patterns across all page components
- Standardize error message display formats
- Add retry mechanisms for transient failures

### 2. Loading State Management
- Consolidate loading states using global context or state management
- Implement skeleton loading components for better UX
- Add optimistic UI updates for immediate user feedback

### 3. Integration Testing Focus Areas
- **Page-Component-Controller Integration**: Test complete user interaction flows
- **Database Operation Testing**: Mock RPC functions and database responses
- **Navigation Flow Testing**: Validate routing and state preservation between pages
- **Error State Coverage**: Ensure all error paths have corresponding UI states

### 4. Component Architecture Enhancements
- Wrap major page components with error boundaries
- Implement consistent form validation patterns
- Add loading indicators for all async operations
- Consider implementing global state management for cross-page data sharing

This comprehensive documentation provides the foundation for both development and testing of the OptiStaff platform's user interaction flows.