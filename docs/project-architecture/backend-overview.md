# OptiStaff Backend Overview

*Generated on: July 16, 2025*

## Database Schema Overview

The OptiStaff backend is built on **Supabase**, utilizing PostgreSQL as the primary database with Row Level Security (RLS) policies for secure data access. The system supports two main user types: **Job Seekers** and **Clients**.

## Core Tables

### 1. User Management Tables

#### `job_seekers`
- **Purpose**: Stores profile information for job seekers (employees)
- **Primary Key**: `user_id` (UUID, references `auth.users.id`)
- **Key Fields**:
  - `first_name`, `last_name`: Personal information
  - `phone_number`: Contact information  
  - `home_location`, `postal_code`: Location data for shift matching
  - `date_of_birth`: Age verification
  - `rating`: Performance rating (0.0-5.0, calculated automatically)
  - `client_id_internal`: Optional internal client association
  - `status`: Account status (ACTIVE, SUSPENDED, INACTIVE)
- **Constraints**:
  - Postal code validation (6-digit format)
  - Rating bounds (0.0-5.0)
- **Relationships**: One-to-many with preferences, availability, assignments, payouts

#### `clients`
- **Purpose**: Stores company/client information for shift creators
- **Primary Key**: `client_id` (UUID, references `auth.users.id`)
- **Key Fields**:
  - `company_name`: Business name
  - `first_name`, `last_name`: Contact person
  - `phone`, `contact_email`: Contact information
  - `address`, `postal_code`, `office_number`: Location details
- **Constraints**:
  - Postal code validation (6-digit format)
- **Relationships**: One-to-many with shifts, one-to-many with job_seekers (internal)

### 2. Scheduling & Availability Tables

#### `shifts`
- **Purpose**: Core table for job postings and shift management
- **Primary Key**: `shift_id` (UUID)
- **Key Fields**:
  - `client_id`: Foreign key to clients table
  - `title`, `description`: Shift details
  - `start_time`, `end_time`: Shift timing (timestamptz)
  - `pay_rate`: Hourly rate (numeric, must be > 0)
  - `job_location`: Work location
  - `staff_needed`, `staff_assigned`: Capacity management
  - `status`: Shift status (1=OPEN, 2=FILLED, 3=CANCELLED, 4=COMPLETED)
  - `submission_cycle`: PRIMARY or SECONDARY
  - `break_duration`: Break time in minutes
- **Automated Features**:
  - Auto-updates status when `staff_assigned` reaches `staff_needed`
  - Auto-reopens when staff drops below needed

#### `availability`
- **Purpose**: Stores when job seekers are available to work
- **Primary Key**: `availability_id` (UUID)
- **Key Fields**:
  - `user_id`: Foreign key to job_seekers
  - `start_time`, `end_time`: Available time slot
  - `day_of_week`: Day reference (1=Monday, 7=Sunday)
  - `submission_cycle`: PRIMARY or SECONDARY
- **Features**: Used for shift matching and template application

#### `availability_templates`
- **Purpose**: Named templates for reusable availability patterns
- **Primary Key**: `template_id` (UUID)
- **Key Fields**:
  - `user_id`: Template owner
  - `template_name`: User-defined name
  - `availability_ids`: Array of linked availability UUIDs
  - `is_default`: Default template flag

### 3. Assignment & Work Management Tables

#### `assignments`
- **Purpose**: Links job seekers to specific shifts (the work contract)
- **Primary Key**: `assignment_id` (UUID)
- **Key Fields**:
  - `user_id`: Job seeker assigned
  - `shift_id`: Shift being worked
  - `status`: Assignment status (CONFIRMED, CANCELLED_BY_USER, CANCELLED_BY_CLIENT, NO_SHOW, COMPLETED)
  - `check_in_time`, `check_out_time`: Time tracking
  - `break_hours`: Unpaid break time
- **Automated Features**:
  - Updates shift `staff_assigned` count automatically
  - Triggers rating recalculation on status changes

#### `feedback`
- **Purpose**: Bidirectional rating system between clients and job seekers
- **Primary Key**: `feedback_id` (UUID)
- **Key Fields**:
  - `assignment_id`: Reference to specific work assignment
  - `reviewer_id`, `reviewee_id`: Participants in review
  - `rating_score`: 1-5 star rating
  - `comment`: Optional text feedback
  - `review_type`: CLIENT_TO_EMPLOYEE or EMPLOYEE_TO_CLIENT
- **Business Rules**:
  - Can only be edited within 24 hours of creation
  - Automatically updates job seeker ratings

### 4. Preferences & Financial Tables

#### `preferences`
- **Purpose**: Job seeker work preferences and filters
- **Primary Key**: `preference_id` (UUID)
- **Key Fields**:
  - `user_id`: Unique job seeker reference
  - `min_pay_rate`: Minimum acceptable hourly rate
  - `max_travel_km`: Maximum travel distance
  - `desired_roles`: JSONB array of preferred job types

#### `payouts`
- **Purpose**: Financial records and earnings tracking
- **Primary Key**: `payout_id` (UUID)
- **Key Fields**:
  - `user_id`: Job seeker receiving payout
  - `amount`: Total earnings for period
  - `start_period`, `end_period`: Pay period dates
- **Automated Calculation**: Uses `calculate_user_payout()` function

## Database Functions

### Core Business Logic Functions

#### `handle_new_user()`
- **Type**: Trigger function (executes on auth.users insert)
- **Purpose**: Automatically creates job_seeker or client records based on signup type
- **Features**:
  - Extracts metadata from `raw_user_meta_data`
  - Creates appropriate profile tables
  - Sets default preferences for job seekers

#### `calculate_user_payout(target_user_id, period_start, period_end)`
- **Purpose**: Calculates earnings for a specific period
- **Logic**: 
  - `pay_rate * hours_worked - break_time_deduction`
  - Only processes COMPLETED assignments
  - Prevents duplicate payout records

#### `update_job_seeker_rating()`
- **Type**: Trigger function
- **Purpose**: Dynamically updates job seeker ratings
- **Formula**: 
  - Base: Average feedback rating
  - Penalties: Cancellations (-0.1), No-shows (-0.3)
  - Reliability scaling for new users

#### `update_staff_assigned()`
- **Type**: Trigger function
- **Purpose**: Maintains shift capacity counters
- **Logic**: Increments/decrements `staff_assigned` based on assignment status changes

#### `auto_update_shift_status()`
- **Type**: Trigger function  
- **Purpose**: Automatically manages shift open/filled status
- **Logic**: Status 1 (OPEN) ↔ Status 2 (FILLED) based on capacity

### Utility Functions

#### `is_user_assigned_to_shift(shift_id, user_id)`
- **Purpose**: Checks if a user is assigned to a specific shift
- **Returns**: Boolean

#### `create_shift(...)`
- **Purpose**: Safe shift creation with validation
- **Returns**: New shift UUID or NULL on error

#### `get_earnings_breakdown(user_id, period_start, period_end)`
- **Purpose**: Detailed earnings report by shift
- **Returns**: Record set with shift details and earnings

## Row Level Security (RLS) Policies

### Job Seekers Policies
- **Own Data Access**: Users can view/update their own profile
- **Client Visibility**: Clients can view job seekers assigned to their shifts
- **Service Role**: Full access for system operations

### Shifts Policies  
- **Client Management**: Clients can manage their own shifts
- **Job Seeker View**: Can view open shifts OR assigned shifts
- **Assignment Check**: Uses `is_user_assigned_to_shift()` function

### Assignments Policies
- **Own Assignments**: Job seekers can manage their assignments
- **Client Access**: Clients can manage assignments for their shifts

### Feedback Policies
- **Bidirectional**: Both reviewer and reviewee can view feedback
- **Time-Limited Editing**: 24-hour edit window
- **Assignment Validation**: Must be related to user's assignment

### Availability & Preferences Policies
- **Personal Data**: Users can only access their own availability and preferences

## Database Triggers

| Table | Trigger | Function | Event | Purpose |
|-------|---------|----------|-------|---------|
| `auth.users` | `on_auth_user_created` | `handle_new_user()` | INSERT | Auto-create profile tables |
| `assignments` | `trigger_update_staff_assigned` | `update_staff_assigned()` | INSERT/UPDATE/DELETE | Maintain shift capacity |
| `assignments` | `trigger_update_rating_on_assignment` | `update_job_seeker_rating()` | UPDATE | Update ratings on status change |
| `feedback` | `trigger_update_rating_on_feedback` | `update_job_seeker_rating()` | INSERT/UPDATE | Update ratings on new feedback |
| `shifts` | `trigger_auto_update_shift_status` | `auto_update_shift_status()` | UPDATE | Auto-manage shift status |

## Database Extensions

### Installed Extensions
- **pgcrypto**: Cryptographic functions for security
- **uuid-ossp**: UUID generation utilities  
- **pg_stat_statements**: Query performance monitoring
- **pg_graphql**: GraphQL API support
- **supabase_vault**: Secure secrets management

### Available Extensions
- **postgis**: Geospatial data support (for future location features)
- **pg_cron**: Scheduled job support (for automated payouts)
- **http**: HTTP client capabilities (for integrations)

## Data Relationships & Entity Model

```
auth.users
├── job_seekers (1:1)
│   ├── preferences (1:1)
│   ├── availability (1:many)
│   ├── availability_templates (1:many)
│   ├── assignments (1:many)
│   └── payouts (1:many)
└── clients (1:1)
    ├── shifts (1:many)
    └── job_seekers (1:many, internal clients)

shifts
├── assignments (1:many)
└── feedback (through assignments)

assignments
└── feedback (1:many)
```

## Key Business Rules

1. **User Types**: Enforced at registration through `raw_user_meta_data`
2. **Capacity Management**: Automatic shift status updates based on assignments
3. **Rating System**: Dynamic calculation including reliability metrics
4. **Data Security**: RLS policies ensure users only access authorized data
5. **Time Tracking**: Assignments track actual work hours for payroll
6. **Feedback Window**: 24-hour edit limit on feedback submissions
7. **Financial Integrity**: Duplicate payout prevention with date ranges

## Migration History

Recent migrations focus on:
- Enhanced user registration fields (postal codes, addresses)
- Availability template system for recurring schedules  
- Postal code validation and indexing
- Improved user onboarding flow

This backend architecture supports a scalable staffing platform with automated business logic, secure data access, and comprehensive audit trails.
