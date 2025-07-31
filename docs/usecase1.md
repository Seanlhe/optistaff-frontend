# Authentication Use Cases - Sequence Diagrams

This document contains Mermaid sequence diagrams for the OptiStaff authentication system, focusing on components that directly interact with hooks.

## Use Case 1: Create Account (Sign Up)

```mermaid
sequenceDiagram
    participant User
    participant Auth.tsx
    participant UserTypeToggle
    participant useAuth
    participant Supabase
    participant Database

    User->>Auth.tsx: Clicks "Sign Up" tab
    Auth.tsx->>Auth.tsx: Sets isSignup = true
    
    User->>UserTypeToggle: Selects user type (jobseeker/employer)
    UserTypeToggle->>Auth.tsx: Updates userType state
    
    User->>Auth.tsx: Fills form fields (email, password, personal info)
    Auth.tsx->>Auth.tsx: Updates form state
    
    User->>Auth.tsx: Clicks "Create Account" button
    Auth.tsx->>Auth.tsx: Calls handleSubmit()
    Auth.tsx->>useAuth: Calls signup(formData, userType)
    
    useAuth->>Supabase: auth.signUp({ email, password, options })
    Supabase->>Database: Creates user in auth.users table
    Database-->>Database: Triggers handle_new_user() function
    Database-->>Database: Creates profile in job_seekers OR clients table
    Supabase-->>useAuth: Returns { data, error }
    
    alt Signup Success
        useAuth->>useAuth: Calls updateUserState()
        useAuth->>Database: Query job_seekers table for user
        Database-->>useAuth: Returns jobseeker data or null
        useAuth->>Database: Query clients table for user
        Database-->>useAuth: Returns client data or null
        useAuth->>useAuth: Sets userType based on query results
        useAuth-->>Auth.tsx: Returns success
        Auth.tsx->>User: Redirects to dashboard/home
    else Signup Error
        useAuth-->>Auth.tsx: Returns error
        Auth.tsx->>User: Shows error message
    end
```

## Use Case 2: Sign In (Login)

```mermaid
sequenceDiagram
    participant User
    participant Auth.tsx
    participant useAuth
    participant Supabase
    participant Database

    User->>Auth.tsx: Clicks "Sign In" tab (default)
    Auth.tsx->>Auth.tsx: Sets isSignup = false
    
    User->>Auth.tsx: Enters email and password
    Auth.tsx->>Auth.tsx: Updates form state
    
    User->>Auth.tsx: Clicks "Sign In" button
    Auth.tsx->>Auth.tsx: Calls handleSubmit()
    Auth.tsx->>useAuth: Calls login(email, password)
    
    useAuth->>Supabase: auth.signInWithPassword({ email, password })
    Supabase->>Database: Validates credentials in auth.users
    
    alt Login Success
        Supabase-->>useAuth: Returns { data: { user }, error: null }
        useAuth->>useAuth: Calls updateUserState()
        useAuth->>Database: Query job_seekers table for user.id
        Database-->>useAuth: Returns jobseeker data or null
        useAuth->>Database: Query clients table for user.id
        Database-->>useAuth: Returns client data or null
        
        alt User is Job Seeker
            useAuth->>useAuth: Sets userType = "jobseeker"
            useAuth->>useAuth: Sets user = jobseeker data
        else User is Employer
            useAuth->>useAuth: Sets userType = "employer"
            useAuth->>useAuth: Sets user = client data
        end
        
        useAuth-->>Auth.tsx: Returns success
        Auth.tsx->>User: Redirects to appropriate dashboard
    else Login Error
        Supabase-->>useAuth: Returns { data: null, error }
        useAuth-->>Auth.tsx: Returns error
        Auth.tsx->>User: Shows error message
    end
```

## Component-Hook Interaction Summary

### Hook-Calling Components:
- **Auth.tsx**: Main authentication page that directly calls `useAuth` hook methods
  - Calls `signup()` for account creation
  - Calls `login()` for sign in
  - Manages form state and user interaction

### Pure UI Components (No Direct Hook Calls):
- **AuthFormFields.tsx**: Renders form fields based on props
- **UserTypeToggle.tsx**: Toggle component for user type selection
- **AuthHeader.tsx**: Header component for authentication pages
- **AuthFooter.tsx**: Footer component for authentication pages
- **FormField.tsx**: Reusable form field component

### Key Database Operations:
1. **Account Creation**: 
   - `auth.signUp()` creates user in `auth.users`
   - `handle_new_user()` trigger creates profile in `job_seekers` or `clients`
   - `create_default_preferences()` function sets up user preferences

2. **Sign In**:
   - `auth.signInWithPassword()` validates credentials
   - `updateUserState()` queries both `job_seekers` and `clients` tables
   - Sets appropriate user type and profile data

### Hook State Management:
- **useAuth** manages:
  - `user`: Current user profile data
  - `userType`: "jobseeker" | "employer" | null
  - `loading`: Authentication operation status
  - `updateUserState()`: Determines user type from database queries
