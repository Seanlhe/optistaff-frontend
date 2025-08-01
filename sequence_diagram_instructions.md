# Sequence Diagram Instructions for Use Cases

This document provides instructions for creating Mermaid sequence diagrams for each use case in `use_case_tables.md`, mapping to actual components, hooks, and database tables from the OptiStaff codebase.

## General Format Guidelines

- **Actor**: The user type (Jobseeker, Employer, Unauthenticated User)
- **UI**: Specific page or component from `src/pages/` or `src/components/`
- **Hook**: Custom hook from `src/hooks/` that handles the business logic
- **Database Tables**: Specific tables from backend-overview.md (auth.users, job_seekers, clients, shifts, assignments, feedback, preferences, availability, etc.)
- **Database Functions**: Specific functions and triggers (handle_new_user(), update_job_seeker_rating(), etc.)

## Use Case 1: Create Account

### Components Involved:
- **UI**: `src/pages/Auth.tsx` or `src/pages/Signup.tsx`
- **Components**: `src/components/auth/AuthFormFields.tsx`, `src/components/auth/UserTypeToggle.tsx`
- **Hook**: `src/hooks/useAuth.tsx`
- **Database Tables**: `auth.users`, `job_seekers`, `clients`, `preferences`
- **Database Functions**: `handle_new_user()` trigger

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor User as Unauthenticated User
    participant AuthPage as Auth.tsx
    participant AuthFormFields as AuthFormFields.tsx
    participant UserTypeToggle as UserTypeToggle.tsx
    participant useAuth as useAuth Hook
    participant Supabase as Supabase Auth
    participant AuthUsers as auth.users
    participant JobSeekers as job_seekers
    participant Clients as clients
    participant Preferences as preferences

    %% User navigates to signup
    User->>+AuthPage: navigate("/signup")
    AuthPage->>+AuthFormFields: render(signup_form)
    AuthFormFields->>+UserTypeToggle: render(user_type_selection)
    UserTypeToggle-->>-AuthFormFields: display(jobseeker/employer_toggle)
    AuthFormFields-->>-AuthPage: display(form_fields)
    AuthPage-->>-User: display(signup_page)

    %% User fills form and submits
    User->>+AuthPage: input(email, password, user_type, details)
    AuthPage->>+AuthFormFields: validate_input()
    
    alt input_valid
        AuthFormFields->>+useAuth: signUp(formData)
        useAuth->>+Supabase: auth.signUp(credentials, metadata)
        Supabase->>+AuthUsers: INSERT INTO auth.users
        AuthUsers->>+AuthUsers: trigger: handle_new_user()
        
        alt user_type === "job-seeker"
            AuthUsers->>+JobSeekers: INSERT INTO job_seekers (user_id, first_name, last_name, phone_number, date_of_birth, address_coordinates, postal_code, status)
            JobSeekers-->>-AuthUsers: job_seeker_created
            AuthUsers->>+Preferences: INSERT INTO preferences (user_id, min_pay_rate, max_travel_km, desired_roles, max_hours_per_week, max_hours_per_shift)
            Preferences-->>-AuthUsers: default_preferences_created
        else user_type === "employer"
            AuthUsers->>+Clients: INSERT INTO clients (client_id, company_name, first_name, last_name, phone, contact_email, address, postal_code, office_number)
            Clients-->>-AuthUsers: client_created
        end
        
        AuthUsers-->>-Supabase: user_created_success
        Supabase-->>-useAuth: signup_success
        useAuth-->>-AuthFormFields: account_created
        AuthFormFields-->>-AuthPage: show_verification_message
        AuthPage-->>-User: "Verification email sent"
    else input_invalid
        AuthFormFields-->>AuthPage: show_validation_errors
        AuthPage-->>User: display(error_messages)
    end
```

## Use Case 2: Sign In

### Components Involved:
- **UI**: `src/pages/Auth.tsx` or `src/pages/Login.tsx`
- **Components**: `src/components/auth/AuthFormFields.tsx`
- **Hook**: `src/hooks/useAuth.tsx`
- **Database Tables**: `auth.users`, `job_seekers`, `clients`

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor User as Jobseeker/Employer
    participant AuthPage as Auth.tsx
    participant AuthFormFields as AuthFormFields.tsx
    participant useAuth as useAuth Hook
    participant Supabase as Supabase Auth
    participant AuthUsers as auth.users
    participant JobSeekers as job_seekers
    participant Clients as clients

    %% User navigates to login
    User->>+AuthPage: navigate("/login")
    AuthPage->>+AuthFormFields: render(login_form)
    AuthFormFields-->>-AuthPage: display(email_password_fields)
    AuthPage-->>-User: display(login_page)

    %% User enters credentials
    User->>+AuthPage: input(email, password)
    User->>+AuthPage: click(sign_in_button)
    AuthPage->>+AuthFormFields: validate_credentials()
    AuthFormFields->>+useAuth: signIn(email, password)
    useAuth->>+Supabase: auth.signInWithPassword()
    Supabase->>+AuthUsers: validate_credentials
    
    alt credentials_valid
        AuthUsers-->>-Supabase: user_authenticated
        Supabase-->>-useAuth: session_created
        useAuth->>useAuth: setUser(user_data)
        useAuth->>useAuth: cacheUserRole(role)
        
        %% Determine user type from database
        alt check_user_type
            useAuth->>+Clients: SELECT FROM clients WHERE client_id = user.id
            Clients-->>-useAuth: employer_data
            useAuth->>useAuth: setUserType("employer")
        else
            useAuth->>+JobSeekers: SELECT FROM job_seekers WHERE user_id = user.id
            JobSeekers-->>-useAuth: jobseeker_data
            useAuth->>useAuth: setUserType("job-seeker")
        end
        
        useAuth-->>-AuthFormFields: login_success
        AuthFormFields-->>-AuthPage: redirect_to_dashboard
        
        alt user_role === "employer"
            AuthPage->>AuthPage: navigate("/employer/dashboard")
        else user_role === "job-seeker"
            AuthPage->>AuthPage: navigate("/employee/dashboard")
        end
        
        AuthPage-->>-User: display(dashboard)
    else credentials_invalid
        AuthUsers-->>Supabase: authentication_failed
        Supabase-->>useAuth: login_error
        useAuth-->>AuthFormFields: show_error
        AuthFormFields-->>AuthPage: display(error_message)
        AuthPage-->>User: "Invalid credentials"
    end
```


## Use Case 3: Set Preferences

### Components Involved:
- **UI**: `src/pages/employee/JSPref.tsx` or `src/pages/jobseeker/Preferences.tsx`
- **Components**: `src/components/PreferencesForm.tsx`, `src/components/PreferencesPay.tsx`, `src/components/PreferencesJobType.tsx`, `src/components/PreferencesMaximum.tsx`
- **Hook**: `src/hooks/usePreferences.tsx`, `src/hooks/useJobTypes.tsx`
- **Database Tables**: `preferences`, `job_types`, `job_categories`

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor Jobseeker as Jobseeker
    participant PreferencesPage as JSPref.tsx
    participant PreferencesForm as PreferencesForm.tsx
    participant PreferencesPay as PreferencesPay.tsx
    participant PreferencesJobType as PreferencesJobType.tsx
    participant usePreferences as usePreferences Hook
    participant useJobTypes as useJobTypes Hook
    participant Preferences as preferences
    participant JobTypes as job_types
    participant JobCategories as job_categories

    %% Navigate to preferences
    Jobseeker->>+PreferencesPage: navigate("/employee/preferences")
    PreferencesPage->>+usePreferences: fetchPreferences()
    usePreferences->>+Preferences: SELECT FROM preferences WHERE user_id = current_user_id
    Preferences-->>-usePreferences: current_preferences(min_pay_rate, max_travel_km, desired_roles, max_hours_per_week, max_hours_per_shift, consider_lower_rate)
    usePreferences-->>-PreferencesPage: preferences_data
    
    PreferencesPage->>+PreferencesForm: render(preferences_form)
    PreferencesForm->>+PreferencesPay: render(pay_preferences)
    PreferencesForm->>+PreferencesJobType: render(job_type_preferences)
    PreferencesJobType->>+useJobTypes: fetchJobTypes()
    useJobTypes->>+JobTypes: SELECT FROM job_types WHERE is_active = true
    JobTypes->>+JobCategories: JOIN job_categories ON category_id
    JobCategories-->>-JobTypes: hierarchical_job_data
    JobTypes-->>-useJobTypes: available_job_types(type_name, category_name, description)
    useJobTypes-->>-PreferencesJobType: job_types_list
    
    PreferencesJobType-->>-PreferencesForm: display(job_type_options)
    PreferencesPay-->>-PreferencesForm: display(pay_rate_fields)
    PreferencesForm-->>-PreferencesPage: display(complete_form)
    PreferencesPage-->>-Jobseeker: display(preferences_page)

    %% User updates preferences
    Jobseeker->>+PreferencesPage: update(min_pay_rate, max_travel_km, desired_roles, max_hours_per_week, max_hours_per_shift)
    PreferencesPage->>+PreferencesForm: validate_preferences()
    PreferencesForm->>+usePreferences: updatePreferences(preferences_data)
    usePreferences->>+Preferences: UPDATE preferences SET min_pay_rate = ?, max_travel_km = ?, desired_roles = ?, max_hours_per_week = ?, max_hours_per_shift = ?, consider_lower_rate = ? WHERE user_id = current_user_id
    Preferences-->>-usePreferences: update_success
    usePreferences-->>-PreferencesForm: preferences_saved
    PreferencesForm-->>-PreferencesPage: show_success_message
    PreferencesPage-->>-Jobseeker: "Preferences saved successfully"
```

## Use Case 4: Indicate Availability

### Components Involved:
- **UI**: `src/pages/employee/JSDashboard.tsx`
- **Components**: `src/components/Availability.tsx`, `src/components/Calendar.tsx`, `src/components/MonthlyCalendar.tsx`
- **Hook**: `src/hooks/useAvailability.tsx`, `src/hooks/useAvailabilityTemplate.tsx`
- **Database Tables**: `availability`, `availability_templates`

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor Jobseeker as Jobseeker
    participant Dashboard as JSDashboard.tsx
    participant Availability as Availability.tsx
    participant Calendar as Calendar.tsx
    participant useAvailability as useAvailability Hook
    participant useAvailabilityTemplate as useAvailabilityTemplate Hook
    participant AvailabilityTable as availability
    participant AvailabilityTemplates as availability_templates

    %% Navigate to availability
    Jobseeker->>+Dashboard: navigate("/employee/dashboard")
    Dashboard->>+Availability: render(availability_component)
    Availability->>+useAvailability: fetchAvailability()
    useAvailability->>+AvailabilityTable: SELECT FROM availability WHERE user_id = current_user_id
    AvailabilityTable-->>-useAvailability: current_availability(availability_id, start_time, end_time, day_of_week, submission_cycle)
    useAvailability-->>-Availability: availability_data
    
    Availability->>+useAvailabilityTemplate: fetchTemplates()
    useAvailabilityTemplate->>+AvailabilityTemplates: SELECT FROM availability_templates WHERE user_id = current_user_id
    AvailabilityTemplates-->>-useAvailabilityTemplate: user_templates(template_id, template_name, availability_ids, is_default)
    useAvailabilityTemplate-->>-Availability: template_data
    
    Availability->>+Calendar: render(calendar_view)
    Calendar-->>-Availability: display(time_slots)
    Availability-->>-Dashboard: display(availability_interface)
    Dashboard-->>-Jobseeker: display(dashboard_with_availability)

    %% User selects time slots
    Jobseeker->>+Dashboard: select_time_slots(day, start_time, end_time)
    Dashboard->>+Availability: update_availability(time_slots)
    Availability->>+Calendar: highlight_selected_slots()
    Calendar-->>-Availability: visual_feedback
    Availability-->>-Dashboard: show_selected_slots
    Dashboard-->>-Jobseeker: display(updated_calendar)

    %% Save availability
    Jobseeker->>+Dashboard: click(save_availability)
    Dashboard->>+Availability: validate_availability()
    Availability->>+useAvailability: saveAvailability(availability_data)
    useAvailability->>+AvailabilityTable: INSERT INTO availability (user_id, start_time, end_time, day_of_week, submission_cycle) VALUES (?, ?, ?, ?, ?)
    AvailabilityTable-->>-useAvailability: save_success
    useAvailability-->>-Availability: availability_saved
    Availability-->>-Dashboard: show_confirmation
    Dashboard-->>-Jobseeker: "Availability saved successfully"
```

## Use Case 5: Cancel Shift

### Components Involved:
- **UI**: `src/pages/employee/JSDashboard.tsx`
- **Components**: `src/components/JobseekerAssignmentCard.tsx`, `src/components/JobseekerAssignmentDetailModals.tsx`
- **Hook**: `src/hooks/useAssignments.tsx`
- **Database Tables**: `assignments`, `job_seekers`, `shifts`
- **Database Functions**: `update_assignment_status()`, `update_job_seeker_rating()` trigger

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor Jobseeker as Jobseeker
    participant Dashboard as JSDashboard.tsx
    participant AssignmentCard as JobseekerAssignmentCard.tsx
    participant DetailModal as JobseekerAssignmentDetailModals.tsx
    participant useAssignments as useAssignments Hook
    participant Assignments as assignments
    participant JobSeekers as job_seekers
    participant Shifts as shifts

    %% View assignments
    Jobseeker->>+Dashboard: navigate("/employee/dashboard")
    Dashboard->>+useAssignments: fetchAssignmentsByJobseeker()
    useAssignments->>+Assignments: SELECT a.*, s.title, s.start_time, s.end_time FROM assignments a JOIN shifts s ON a.shift_id = s.shift_id WHERE a.user_id = current_user_id AND a.status = 5
    Assignments->>+Shifts: JOIN shifts ON shift_id
    Shifts-->>-Assignments: shift_details(title, start_time, end_time, job_location)
    Assignments-->>-useAssignments: assignment_list(assignment_id, shift_id, status, check_in_time, check_out_time)
    useAssignments-->>-Dashboard: assignments_data
    
    Dashboard->>+AssignmentCard: render(assignment_cards)
    AssignmentCard-->>-Dashboard: display(upcoming_shifts)
    Dashboard-->>-Jobseeker: display(dashboard_with_assignments)

    %% Cancel shift process
    Jobseeker->>+Dashboard: click(cancel_shift_button)
    Dashboard->>+DetailModal: open(cancellation_modal)
    DetailModal-->>-Dashboard: display(cancellation_form)
    Dashboard-->>-Jobseeker: show(cancellation_options)

    Jobseeker->>+Dashboard: select(cancellation_reason)
    Dashboard->>+DetailModal: show_rating_warning()
    DetailModal-->>-Dashboard: display(rating_impact_warning)
    Dashboard-->>-Jobseeker: "This will affect your rating (-0.1 points)"

    Jobseeker->>+Dashboard: confirm(cancellation)
    Dashboard->>+useAssignments: updateAssignmentStatus(assignment_id, "CANCELLED_BY_USER")
    useAssignments->>+Assignments: UPDATE assignments SET status = 7 WHERE assignment_id = ?
    Assignments->>+Assignments: trigger: trigger_update_rating_on_assignment
    Assignments->>+JobSeekers: CALL update_job_seeker_rating()
    JobSeekers->>JobSeekers: Calculate new rating (base_rating - cancellation_penalty)
    JobSeekers->>JobSeekers: UPDATE job_seekers SET rating = new_calculated_rating WHERE user_id = ?
    JobSeekers-->>-Assignments: rating_updated
    Assignments-->>-useAssignments: cancellation_success
    useAssignments-->>-Dashboard: assignment_cancelled
    Dashboard-->>-Jobseeker: "Shift cancelled successfully"
```

## Use Case 6: List Jobs

### Components Involved:
- **UI**: `src/pages/employer/UploadJobs.tsx`, `src/pages/employer/ClientDashboard.tsx`
- **Components**: `src/components/UploadModal.tsx`, `src/components/CustomInputField.tsx`, `src/components/UploadCSV.tsx`
- **Hook**: `src/hooks/useShifts.tsx`
- **Database Tables**: `shifts`, `job_types`, `status`
- **Database Functions**: `create_shift()`, `auto_update_shift_status()` trigger

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor Employer as Employer
    participant Dashboard as ClientDashboard.tsx
    participant UploadJobs as UploadJobs.tsx
    participant UploadModal as UploadModal.tsx
    participant useShifts as useShifts Hook
    participant Shifts as shifts
    participant JobTypes as job_types
    participant Status as status

    %% Navigate to job posting
    Employer->>+Dashboard: click(upload_jobs_button)
    Dashboard->>+UploadJobs: navigate("/employer/uploadjobs")
    UploadJobs-->>-Dashboard: display(upload_interface)
    Dashboard-->>-Employer: show(job_posting_options)

    %% Single job post flow
    alt Single Job Post
        Employer->>+UploadJobs: click(post_single_job)
        UploadJobs->>+UploadModal: open(job_form_modal)
        UploadModal->>+JobTypes: SELECT FROM job_types WHERE is_active = true
        JobTypes-->>-UploadModal: available_job_types
        UploadModal-->>-UploadJobs: display(job_form)
        UploadJobs-->>-Employer: show(job_details_form)

        %% Input validation loop
        loop while input_invalid
            Employer->>+UploadJobs: input(job_details)
            UploadJobs->>+UploadModal: validate_input()
            UploadModal-->>-UploadJobs: validation_errors
            UploadJobs-->>-Employer: display(error_messages)
        end

        %% Successful submission
        Employer->>+UploadJobs: click(submit_job)
        UploadJobs->>+useShifts: createShift(job_data)
        useShifts->>+Shifts: INSERT INTO shifts (client_id, job_type_id, title, description, start_time, end_time, pay_rate, job_location, staff_needed, staff_assigned, status, submission_cycle, break_duration)
        Shifts->>+Status: SET status = 1 (OPEN)
        Status-->>-Shifts: status_set
        Shifts->>+Shifts: trigger: trigger_auto_update_shift_status
        Shifts-->>-useShifts: shift_created_success(shift_id)
        useShifts-->>-UploadJobs: job_posted
        UploadJobs-->>-Employer: "Job posted successfully"

    else CSV Upload
        Employer->>+UploadJobs: click(upload_csv)
        UploadJobs->>+UploadModal: open(csv_upload_modal)
        UploadModal-->>-UploadJobs: display(file_upload)
        UploadJobs-->>-Employer: show(csv_upload_interface)

        Employer->>+UploadJobs: upload(csv_file)
        UploadJobs->>+useShifts: processCsvFile(csv_data)
        
        loop for each row in CSV
            useShifts->>useShifts: validate_row(row_data)
            alt row_valid
                useShifts->>+Shifts: INSERT INTO shifts (client_id, job_type_id, title, description, start_time, end_time, pay_rate, job_location, staff_needed, staff_assigned, status, submission_cycle, break_duration)
                Shifts-->>-useShifts: shift_created
            else row_invalid
                useShifts->>useShifts: record_failed_row(row_data)
            end
        end

        alt all_rows_successful
            useShifts-->>UploadJobs: "All jobs created successfully"
            UploadJobs-->>Employer: show_success_message
        else some_rows_failed
            useShifts-->>UploadJobs: failed_rows_report
            UploadJobs-->>Employer: display(error_report)
        end
    end
```

## Use Case 7: Review Employee

### Components Involved:
- **UI**: `src/pages/employer/ClientRoster.tsx` or `src/pages/employer/ClientEdit.tsx`
- **Components**: `src/components/ClientShiftDetails.tsx`, Rating component (to be implemented)
- **Hook**: `src/hooks/useFeedback.tsx`, `src/hooks/useAssignments.tsx`
- **Database Tables**: `feedback`, `assignments`, `job_seekers`
- **Database Functions**: `update_job_seeker_rating()` trigger

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor Employer as Employer
    participant ClientRoster as ClientRoster.tsx
    participant ShiftDetails as ClientShiftDetails.tsx
    participant useFeedback as useFeedback Hook
    participant useAssignments as useAssignments Hook
    participant Assignments as assignments
    participant Feedback as feedback
    participant JobSeekers as job_seekers

    %% View completed shifts
    Employer->>+ClientRoster: navigate("/employer/roster")
    ClientRoster->>+useAssignments: fetchAssignmentsByShift(shift_id)
    useAssignments->>+Assignments: SELECT a.*, js.first_name, js.last_name FROM assignments a JOIN job_seekers js ON a.user_id = js.user_id WHERE a.shift_id = ? AND a.status = 9
    Assignments->>+JobSeekers: JOIN job_seekers ON user_id
    JobSeekers-->>-Assignments: employee_details(first_name, last_name, rating)
    Assignments-->>-useAssignments: completed_assignments
    useAssignments-->>-ClientRoster: assignment_data
    
    ClientRoster->>+ShiftDetails: render(completed_shifts)
    ShiftDetails-->>-ClientRoster: display(employee_list)
    ClientRoster-->>-Employer: show(completed_assignments)

    %% Rate employee
    Employer->>+ClientRoster: click(rate_employee_button)
    ClientRoster->>+ShiftDetails: open(rating_modal)
    ShiftDetails-->>-ClientRoster: display(rating_interface)
    ClientRoster-->>-Employer: show(rating_form)

    Employer->>+ClientRoster: select(rating_score, comment)
    ClientRoster->>+useFeedback: submitFeedback(assignment_id, rating_data)
    useFeedback->>+Feedback: INSERT INTO feedback (assignment_id, reviewer_id, reviewee_id, rating_score, comment, review_type) VALUES (?, ?, ?, ?, ?, 'CLIENT_TO_EMPLOYEE')
    Feedback->>+Feedback: trigger: trigger_update_rating_on_feedback
    Feedback->>+JobSeekers: CALL update_job_seeker_rating()
    JobSeekers->>JobSeekers: Calculate new rating (AVG(CLIENT_TO_EMPLOYEE ratings) - reliability_penalty)
    JobSeekers->>JobSeekers: UPDATE job_seekers SET rating = new_calculated_rating WHERE user_id = reviewee_id
    JobSeekers-->>-Feedback: rating_updated
    Feedback-->>-useFeedback: feedback_saved
    useFeedback-->>-ClientRoster: rating_submitted
    ClientRoster-->>-Employer: "Employee rated successfully"
```

## Use Case 8: Employer Cancels Job Listing

### Components Involved:
- **UI**: `src/pages/employer/ClientDashboard.tsx`, `src/pages/employer/ClientEdit.tsx`
- **Components**: `src/components/DashboardShiftCard.tsx`, Confirmation dialog
- **Hook**: `src/hooks/useShifts.tsx`, `src/hooks/useAssignments.tsx`
- **Database Tables**: `shifts`, `assignments`, `status`
- **Database Functions**: `update_staff_assigned()` trigger

### Sequence Diagram:

```mermaid
sequenceDiagram
    actor Employer as Employer
    participant Dashboard as ClientDashboard.tsx
    participant ShiftCard as DashboardShiftCard.tsx
    participant useShifts as useShifts Hook
    participant useAssignments as useAssignments Hook
    participant Shifts as shifts
    participant Assignments as assignments
    participant Status as status

    %% View posted shifts
    Employer->>+Dashboard: navigate("/employer/dashboard")
    Dashboard->>+useShifts: fetchShifts()
    useShifts->>+Shifts: SELECT s.*, st.name as status_name FROM shifts s JOIN status st ON s.status = st.status_id WHERE s.client_id = current_client_id
    Shifts->>+Status: JOIN status ON status_id
    Status-->>-Shifts: status_names(OPEN, FILLED)
    Shifts-->>-useShifts: employer_shifts(shift_id, title, start_time, end_time, staff_needed, staff_assigned, status)
    useShifts-->>-Dashboard: shifts_data
    
    Dashboard->>+ShiftCard: render(shift_cards)
    ShiftCard-->>-Dashboard: display(posted_shifts)
    Dashboard-->>-Employer: show(shift_listings)

    %% Cancel shift process
    Employer->>+Dashboard: click(cancel_shift_button)
    Dashboard->>+ShiftCard: show_confirmation_dialog()
    ShiftCard-->>-Dashboard: display(cancellation_warning)
    Dashboard-->>-Employer: "Are you sure you want to cancel? This will affect assigned employees."

    Employer->>+Dashboard: confirm(cancellation)
    Dashboard->>+useShifts: deleteShift(shift_id)
    
    %% Check for assignments
    useShifts->>+useAssignments: checkAssignments(shift_id)
    useAssignments->>+Assignments: SELECT FROM assignments WHERE shift_id = ? AND status = 5
    Assignments-->>-useAssignments: assigned_employees
    
    alt shift_has_assignments
        useAssignments->>+Assignments: UPDATE assignments SET status = 8 WHERE shift_id = ? AND status = 5
        Assignments->>+Assignments: trigger: trigger_update_staff_assigned
        Assignments->>Assignments: UPDATE shifts SET staff_assigned = staff_assigned - cancelled_count WHERE shift_id = ?
        Assignments-->>-useAssignments: assignments_cancelled
        useAssignments-->>-useShifts: employees_notified
    end
    
    useShifts->>+Shifts: DELETE FROM shifts WHERE shift_id = ?
    Shifts-->>-useShifts: shift_deleted
    useShifts-->>-Dashboard: cancellation_success
    Dashboard-->>-Employer: "Job listing cancelled successfully"
```

## Implementation Notes

1. **Database Table Integration**: Each sequence diagram now references the specific database tables from `backend-overview.md` including:
   - **User Management**: `auth.users`, `job_seekers`, `clients`
   - **Scheduling**: `shifts`, `availability`, `availability_templates`
   - **Work Management**: `assignments`, `feedback`
   - **Classification**: `job_types`, `job_categories`, `status`
   - **Preferences**: `preferences`
   - **Financial**: `payouts`

2. **Database Functions**: References actual database functions and triggers:
   - `handle_new_user()` - Auto-creates profiles on registration
   - `update_job_seeker_rating()` - Updates ratings based on feedback and reliability
   - `update_staff_assigned()` - Maintains shift capacity counters
   - `auto_update_shift_status()` - Manages shift open/filled status
   - `create_shift()` - Safe shift creation with validation

3. **Status System**: Uses the integer-based status system:
   - **Shift Status**: 1 = OPEN, 2 = FILLED
   - **Assignment Status**: 5 = CONFIRMED, 7 = CANCELLED_BY_USER, 8 = NO_SHOW, 9 = COMPLETED

4. **Relationships**: Shows proper table relationships and foreign key constraints as defined in the backend schema.

5. **Triggers**: Includes automatic database triggers that execute business logic (rating updates, capacity management, status transitions).

6. **RLS Policies**: Considers Row Level Security policies that ensure users only access authorized data.

## Usage Instructions

1. Copy the relevant sequence diagram code for each use case
2. Customize the participant names to match your specific implementation
3. Add error handling flows as needed based on database constraints
4. Include loading states and user feedback messages
5. Ensure all database operations match the actual table schema and functions
6. Consider RLS policies when showing data access patterns
7. Include trigger effects in the sequence flow where applicable