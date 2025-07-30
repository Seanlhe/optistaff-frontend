# OptiStaff Backend Overview

_Generated on: July 16, 2025_

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
  - `address_coordinates`, `postal_code`: Location data for shift matching (coordinates auto-updated via geocoding)
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
  - `job_type_id`: Foreign key to job_types table
  - `title`, `description`: Shift details
  - `start_time`, `end_time`: Shift timing (timestamptz)
  - `pay_rate`: Hourly rate (numeric, must be > 0)
  - `job_location`: Work location
  - `staff_needed`, `staff_assigned`: Capacity management
  - `status`: Foreign key to status table (references standardized status values)
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

### 4. Job Classification & Status Tables

#### `job_categories`

- **Purpose**: Hierarchical categorization of job types
- **Primary Key**: `category_id` (UUID)
- **Key Fields**:
  - `category_name`: Unique category name
  - `description`: Category description
  - `parent_category_id`: Self-referencing for hierarchy (nullable)
  - `is_active`: Active status flag (default: true)
- **Features**: Supports nested categories for job organization

#### `job_types`

- **Purpose**: Specific job types within categories
- **Primary Key**: `job_type_id` (UUID)
- **Key Fields**:
  - `type_name`: Job type name
  - `category_id`: Foreign key to job_categories
  - `description`: Job type description
  - `is_active`: Active status flag (default: true)
- **Relationships**: Many-to-one with job_categories, one-to-many with shifts

#### `status`

- **Purpose**: Standardized integer-based status lookup table
- **Primary Key**: `status_id` (integer, identity)
- **Key Fields**:
  - `name`: Status name (unique)
- **Status Values**:
  - **Shifts**: 1 = OPEN, 2 = FILLED
  - **Assignments**: 5 = CONFIRMED, 7 = CANCELLED_BY_USER, 8 = NO_SHOW, 9 = COMPLETED
- **Usage**: Referenced by shifts and assignments tables for status management

### 5. Preferences & Financial Tables

#### `preferences`

- **Purpose**: Job seeker work preferences and filters
- **Primary Key**: `preference_id` (UUID)
- **Key Fields**:
  - `user_id`: Unique job seeker reference (unique constraint)
  - `min_pay_rate`: Minimum acceptable hourly rate (default: 0.00, constraint: >= 0)
  - `max_travel_km`: Maximum travel distance (default: 50, constraint: >= 0)
  - `desired_roles`: JSONB array of preferred job types (default: '[]')
  - `max_hours_per_week`: Maximum hours per week (constraint: > 0 AND <= 44)
  - `max_hours_per_shift`: Maximum hours per shift (constraint: > 0 AND <= 12)
  - `consider_lower_rate`: Whether to consider lower pay rates (default: false)

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
- **Enhanced Features**:
  - Extracts metadata from `raw_user_meta_data`
  - Creates appropriate profile tables with all enhanced fields
  - Job Seekers: `date_of_birth`, `address_coordinates`, `postal_code`
  - Clients: `address`, `postal_code`, `office_number`
  - Sets default preferences for job seekers
  - Proper DATE conversion for birth dates

#### `calculate_user_payout(target_user_id, period_start, period_end)`

- **Purpose**: Calculates earnings for a specific period
- **Logic**:
  - `pay_rate * hours_worked - break_time_deduction`
  - Only processes COMPLETED assignments (status = 9)
  - Prevents duplicate payout records with `ON CONFLICT DO NOTHING`

#### `update_job_seeker_rating()`

- **Type**: Trigger function
- **Purpose**: Dynamically updates job seeker ratings based on feedback and reliability
- **Enhanced Formula**:
  - Base: Average CLIENT_TO_EMPLOYEE feedback rating
  - Reliability Penalties: Cancellations (-0.1), No-shows (-0.3)
  - Experience Scaling: New users get lighter penalties
  - Status Codes: Uses integer status (7 = CANCELLED_BY_USER, 8 = NO_SHOW)

#### `update_staff_assigned()`

- **Type**: Trigger function
- **Purpose**: Maintains shift capacity counters
- **Logic**:
  - Increments/decrements `staff_assigned` based on CONFIRMED status (status = 5)
  - Handles INSERT, UPDATE, and DELETE operations
  - Ensures accurate capacity tracking

#### `auto_update_shift_status()`

- **Type**: Trigger function
- **Purpose**: Automatically manages shift open/filled status
- **Logic**: Status 1 (OPEN) ↔ Status 2 (FILLED) based on capacity

### Advanced Business Functions

#### `find_matching_job_seekers(p_shift_id)`

- **Purpose**: Advanced matching algorithm for job seekers
- **Logic**:
  - Pay rate compatibility check
  - Job category preference matching
  - Rating-based scoring (max 30 points)
  - Availability validation
  - Returns top 20 matches with scores
- **Returns**: user_id, name, rating, match_score, preferred_categories, distance

#### `get_job_categories_with_types()`

- **Purpose**: Hierarchical job classification data
- **Returns**: Categories with nested job types as JSONB
- **Usage**: Populates job selection dropdowns and preference forms

#### `update_assignment_status(p_assignment_id, p_status_name)`

- **Purpose**: Safe assignment status updates with validation
- **Features**:
  - Validates status names against status table
  - Converts status names to integer IDs
  - Returns number of affected rows
  - Error handling for invalid status names

### Query & Reporting Functions

#### `get_shifts_by_client(p_client_id)`

- **Purpose**: Client-specific shift management queries
- **Returns**: Complete shift details with status names and job types
- **Usage**: Client dashboard and shift management interfaces

#### `get_assignment_by_jobseeker(p_user_id)`

- **Purpose**: Job seeker assignment history and status
- **Returns**: Assignment details with job titles and status information
- **Usage**: Job seeker dashboard and assignment tracking

#### `get_assignment_status_summary(p_shift_id)`

- **Purpose**: Shift-specific assignment status breakdown
- **Returns**: Status counts for capacity planning
- **Usage**: Shift management and reporting

### Utility Functions

#### `is_user_assigned_to_shift(shift_id, user_id)`

- **Purpose**: Checks if a user is assigned to a specific shift
- **Returns**: Boolean
- **Usage**: Prevents duplicate assignments and access control

#### `create_shift(...)`

- **Purpose**: Safe shift creation with validation
- **Parameters**: All shift fields including job_type_id
- **Returns**: New shift UUID or NULL on error
- **Features**: Proper error handling and validation

#### `get_earnings_breakdown(user_id, period_start, period_end)`

- **Purpose**: Detailed earnings report by shift
- **Returns**: Record set with shift details, hours worked, and earnings
- **Usage**: Payroll processing and earnings statements

#### `validate_job_names(job_names[])`

- **Purpose**: Validates job type names against active job types
- **Returns**: Boolean indicating if all names are valid
- **Usage**: Preference validation and job selection

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

| Table         | Trigger                               | Function                     | Event                | Purpose                         |
| ------------- | ------------------------------------- | ---------------------------- | -------------------- | ------------------------------- |
| `auth.users`  | `on_auth_user_created`                | `handle_new_user()`          | INSERT               | Auto-create profile tables      |
| `assignments` | `trigger_update_staff_assigned`       | `update_staff_assigned()`    | INSERT/UPDATE/DELETE | Maintain shift capacity         |
| `assignments` | `trigger_update_rating_on_assignment` | `update_job_seeker_rating()` | UPDATE               | Update ratings on status change |
| `feedback`    | `trigger_update_rating_on_feedback`   | `update_job_seeker_rating()` | INSERT/UPDATE        | Update ratings on new feedback  |
| `shifts`      | `trigger_auto_update_shift_status`    | `auto_update_shift_status()` | UPDATE               | Auto-manage shift status        |

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

job_categories
├── job_categories (1:many, self-referencing for hierarchy)
└── job_types (1:many)

job_types
└── shifts (1:many)

status (lookup table)
├── shifts (1:many) - status field
└── assignments (1:many) - status field

shifts
├── assignments (1:many)
└── feedback (through assignments)

assignments
└── feedback (1:many)

availability_templates
└── availability (many:many through availability_ids array)
```

### Key Relationships

- **User Authentication**: `auth.users` → `job_seekers` or `clients` (1:1)
- **Job Classification**: `job_categories` → `job_types` → `shifts` (hierarchical)
- **Status Management**: `status` lookup table → `shifts` and `assignments`
- **Scheduling**: `job_seekers` → `availability` → `availability_templates`
- **Work Assignment**: `shifts` → `assignments` → `job_seekers`
- **Feedback System**: `assignments` → `feedback` (bidirectional rating)
- **Financial Tracking**: `job_seekers` → `assignments` → `payouts`

## Status System Reference

### Integer-Based Status Management

The platform uses an integer-based status system with a lookup table for consistency and performance:

#### Shift Status Codes

- **1**: OPEN - Shift is available for assignment
- **2**: FILLED - Shift has reached capacity (staff_assigned >= staff_needed)

#### Assignment Status Codes

- **5**: CONFIRMED - Job seeker is confirmed for the shift
- **7**: CANCELLED_BY_USER - Job seeker cancelled their assignment
- **8**: NO_SHOW - Job seeker failed to show up for confirmed shift
- **9**: COMPLETED - Assignment completed successfully

### Status Transitions

- **Automatic Shift Status**: Triggers update shift status based on capacity
- **Assignment Lifecycle**: CONFIRMED → COMPLETED (normal flow)
- **Cancellation Flow**: CONFIRMED → CANCELLED_BY_USER or NO_SHOW
- **Rating Impact**: Cancellations and no-shows affect job seeker ratings

## Key Business Rules

1. **User Types**: Enforced at registration through `raw_user_meta_data`
2. **Status Management**: Integer-based system with automatic transitions
3. **Capacity Management**: Automatic shift status updates based on assignments
4. **Rating System**: Dynamic calculation including reliability metrics with status-based penalties
5. **Data Security**: RLS policies ensure users only access authorized data
6. **Time Tracking**: Assignments track actual work hours for payroll
7. **Feedback Window**: 24-hour edit limit on feedback submissions
8. **Financial Integrity**: Duplicate payout prevention with date ranges
9. **Job Classification**: Hierarchical categories and types for organized job management

### 5. Database Views

#### `shift_status_view`

- **Purpose**: Denormalized view of shifts with status information
- **Key Fields**: All shift fields plus `status_name` and `status_code`
- **Usage**: Simplifies queries that need both shift and status information
- **Performance**: Optimized for dashboard and listing queries

### 6. Job Classification Tables

#### `job_categories`

- **Purpose**: Hierarchical categorization of job types
- **Primary Key**: `category_id` (UUID)
- **Key Fields**:
  - `category_name`: Unique category name
  - `description`: Category description
  - `parent_category_id`: Self-referencing for hierarchy
  - `is_active`: Active status flag
- **Features**: Supports nested categories for job organization

#### `job_types`

- **Purpose**: Specific job types within categories
- **Primary Key**: `job_type_id` (UUID)
- **Key Fields**:
  - `type_name`: Job type name
  - `category_id`: Foreign key to job_categories
  - `description`: Job type description
  - `is_active`: Active status flag
- **Relationships**: Many-to-one with job_categories, one-to-many with shifts

#### `status`

- **Purpose**: Standardized status values for shifts
- **Primary Key**: `status_id` (integer, identity)
- **Key Fields**:
  - `name`: Status name (unique)
- **Usage**: Referenced by shifts table for status management

## Migration History

Recent migrations focus on:

- Enhanced user registration fields (postal codes, addresses)
- Availability template system for recurring schedules
- Postal code validation and indexing
- Job classification system (categories and types)
- Enhanced preferences system with work hour limits
- Status standardization for shift management
- Improved user onboarding flow

This backend architecture supports a scalable staffing platform with automated business logic, secure data access, and comprehensive audit trails.
