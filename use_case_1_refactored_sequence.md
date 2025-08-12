# Use Case 1: Create Account - Refactored Sequence Diagram

## Use Case Overview

- **ID**: UC1
- **Name**: Create Account
- **Description**: A new user registers for either a Jobseeker or employer account on the platform
- **Actors**: Unauthenticated User
- **Triggers**: "Don't have an account? Sign up" button on sign-in page clicked

## Refactored Sequence Diagram

```mermaid
sequenceDiagram
    actor User as Unauthenticated User
    participant View as Auth.tsx
    participant Utils as Utils
    participant Controller as useAuth
    participant AuthUsers as Auth
    participant JobSeekers as job_seekers
    participant Clients as clients
    participant Preferences as preferences

    autonumber
    %% User navigates to signup
    User->>+View: navigate("/signup")
    View-->>-User: display(signup_form)

    %% User fills form and submits
    User->>+View: input(email, password, user_type, personal_details)
    View->>+Utils: validateSignupForm(formData)

    alt form_validation_passes
        Utils-->>-View: validation_success
        View->>+Controller: signUp(formData)

        %% Authentication with Supabase
        Controller->>+AuthUsers: auth.signUp(credentials, metadata)
        
        %% Database trigger automatically fired
        Note over AuthUsers: handle_new_user() trigger AUTOMATICALLY executed
        
        %% Profile creation based on user type (via trigger)
        alt user_type === "job-seeker"
            AuthUsers->>+JobSeekers: INSERT INTO job_seekers (via trigger)
            JobSeekers-->>-AuthUsers: job_seeker_created
            AuthUsers->>+Preferences: INSERT INTO preferences (via trigger)
            Preferences-->>-AuthUsers: default_preferences_created
        else user_type === "employer"
            AuthUsers->>+Clients: INSERT INTO clients (via trigger)
            Clients-->>-AuthUsers: client_created
        end

        AuthUsers-->>Controller: signup_success(user_data)
        Controller-->>View: account_created_success
        View-->>User: "Account created! Verification email sent"

    else form_validation_fails
        Utils-->>View: validation_errors
        View-->>User: display(error_messages)
    end

    %% Error handling for existing email
    alt email_already_exists
        AuthUsers-->>-Controller: signup_error("Email already registered")
        Controller-->>-View: show_existing_email_error
        View-->>-User: "Email already registered. Try signing in instead."
    end
```

## Key Components and Their Roles

### View Layer (Auth.tsx)

- Handles user interface for signup form
- Manages form state and user interactions
- Displays success/error messages
- Routes user input to validation and authentication

### Utils Layer

- **validateSignupForm()**: Validates email format, password strength, required fields
- Handles client-side validation before API calls

### Controller Layer (useAuth)

- **signUp()**: Orchestrates the account creation process
- Manages authentication state
- Handles Supabase auth integration
- Processes success/error responses

### Model Layer (Database Tables)

- **auth.users**: Core authentication table with user credentials
- **job_seekers**: Profile data for job seeker accounts
- **clients**: Profile data for employer accounts
- **preferences**: Default preferences for job seekers

## Database Triggers and Functions

- **handle_new_user()**: Database trigger that automatically executes when a new user is inserted into `auth.users` table via `supabase.auth.signUp()`
- Automatically creates appropriate profile records based on user_type metadata
- Ensures data consistency across related tables
- Sets up default preferences for job seekers
- **Trigger Timing**: Executes immediately after `auth.users` INSERT, before `auth.signUp()` returns response

## Use Case Compliance Verification

✅ **Email and Password Entry**: Handled in View layer with Utils validation
✅ **User Type Selection**: Processed in Controller and routed to appropriate Model tables
✅ **Personal/Company Details**: Stored in job_seekers or clients tables respectively
✅ **Verification Email**: Sent automatically by Supabase auth.signUp()
✅ **Error Handling**: Email already exists scenario handled with appropriate user feedback
✅ **Account Creation**: Complete profile creation with related data (preferences for job seekers)

## Data Flow Summary

1. User submits signup form through Auth.tsx
2. Utils validates form data client-side
3. useAuth hook processes signup with Supabase
4. Database trigger creates appropriate profile records
5. Success/error feedback provided to user
6. New account ready for sign-in upon email verification
