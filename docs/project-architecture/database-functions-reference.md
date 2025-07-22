# OptiStaff Database Functions Reference

**Generated:** July 15, 2025  
**Database Schema:** Supabase PostgreSQL  
**Project:** OptiStaff Workforce Management System

---

## 📋 Table of Contents

1. [Authentication Functions](#authentication-functions)
2. [User Management Functions](#user-management-functions)
3. [Shift Management Functions](#shift-management-functions)
4. [Assignment Management Functions](#assignment-management-functions)
5. [Rating & Feedback Functions](#rating--feedback-functions)
6. [Payout & Financial Functions](#payout--financial-functions)
7. [Database Triggers](#database-triggers)
8. [Function Usage Examples](#function-usage-examples)

---

## 🔐 Authentication Functions

### `auth.uid()` (Deprecated)
**Schema:** `auth`  
**Return Type:** `uuid`  
**Security:** `INVOKER`  
**Status:** ⚠️ **Deprecated** - Use `auth.jwt() -> 'sub'` instead

**Description:** Returns the current user's UUID from JWT claims.

**Function Body:**
```sql
SELECT 
  COALESCE(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
```

---

### `auth.email()` (Deprecated)
**Schema:** `auth`  
**Return Type:** `text`  
**Security:** `INVOKER`  
**Status:** ⚠️ **Deprecated** - Use `auth.jwt() -> 'email'` instead

**Description:** Returns the current user's email from JWT claims.

**Function Body:**
```sql
SELECT 
  COALESCE(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
```

---

### `auth.role()` (Deprecated)
**Schema:** `auth`  
**Return Type:** `text`  
**Security:** `INVOKER`  
**Status:** ⚠️ **Deprecated** - Use `auth.jwt() -> 'role'` instead

**Description:** Returns the current user's role from JWT claims.

---

### `auth.jwt()`
**Schema:** `auth`  
**Return Type:** `jsonb`  
**Security:** `INVOKER`  
**Status:** ✅ **Current**

**Description:** Returns the complete JWT claims as a JSON object.

**Function Body:**
```sql
SELECT 
  COALESCE(
    nullif(current_setting('request.jwt.claim', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')
  )::jsonb
```

---

## 👥 User Management Functions

### `handle_new_user()` 
**Schema:** `public`  
**Return Type:** `trigger`  
**Security:** `DEFINER`  
**Status:** ✅ **Enhanced with Complete Fields**

**Description:** Automatically creates database records when new users are registered through Supabase Auth. Handles both job seekers and employers with all enhanced fields.

**Trigger Events:**
- **Table:** `auth.users`
- **Event:** `AFTER INSERT`
- **Trigger Name:** `on_auth_user_created`

**Enhanced Features:**
- ✅ **Job Seeker Registration**: Creates records in `job_seekers` and `preferences` tables
- ✅ **Employer Registration**: Creates records in `clients` table
- ✅ **Complete Field Support**: 
  - Job Seekers: `date_of_birth`, `address_coordinates`, `postal_code`
  - Employers: `address`, `postal_code`, `office_number`
- ✅ **Data Type Conversion**: Proper DATE conversion for `date_of_birth`
- ✅ **Fallback Logic**: Graceful handling of missing metadata

**Function Logic:**
```sql
-- Extract all metadata fields from user registration
user_type_value := NEW.raw_user_meta_data->>'user_type';
date_of_birth_value := NEW.raw_user_meta_data->>'date_of_birth';
address_value := NEW.raw_user_meta_data->>'address';
postal_code_value := NEW.raw_user_meta_data->>'postal_code';
-- ... (other fields)

-- Job Seeker Path
IF user_type_value = 'job-seeker' THEN
  INSERT INTO public.job_seekers (
    user_id, first_name, last_name, phone_number, 
    date_of_birth, address_coordinates, postal_code, status
  ) VALUES (
    NEW.id, 
    COALESCE(first_name_value, split_part(NEW.email, '@', 1)),
    COALESCE(last_name_value, ''),
    phone_number_value,
    CASE 
      WHEN date_of_birth_value IS NOT NULL AND date_of_birth_value != '' 
      THEN date_of_birth_value::DATE 
      ELSE NULL 
    END,
    address_value,
    postal_code_value,
    'ACTIVE'
  );
  
  INSERT INTO public.preferences (user_id) VALUES (NEW.id);
END IF;
```

---

### `check_email_exists(email_to_check text)`
**Schema:** `public`  
**Return Type:** `boolean`  
**Security:** `DEFINER`

**Description:** Checks if an email exists in the public.users table.

**Parameters:**
- `email_to_check` (text): Email address to verify

---

### `check_email_exists_comprehensive(email_to_check text)`
**Schema:** `public`  
**Return Type:** `boolean`  
**Security:** `DEFINER`

**Description:** Comprehensive email check across both auth.users and public.users tables.

**Parameters:**
- `email_to_check` (text): Email address to verify

**Function Body:**
```sql
-- Check if email exists in either auth.users or public.users
RETURN EXISTS (
  SELECT 1 FROM auth.users WHERE LOWER(email) = LOWER(email_to_check)
) OR EXISTS (
  SELECT 1 FROM public.users WHERE LOWER(email) = LOWER(email_to_check)
);
```

---

## 🏢 Shift Management Functions

### `create_shift(...)`
**Schema:** `public`  
**Return Type:** `uuid`  
**Security:** `INVOKER`

**Description:** Creates a new shift with all required parameters and returns the shift ID.

**Parameters:**
- `client_id` (uuid): ID of the client creating the shift
- `title` (varchar): Shift title
- `description` (varchar): Shift description  
- `start_time` (timestamptz): Shift start time
- `end_time` (timestamptz): Shift end time
- `pay_rate` (numeric): Hourly pay rate
- `job_location` (varchar): Location of the job
- `staff_needed` (integer): Number of staff required
- `submission_cycle` (varchar): 'PRIMARY' or 'SECONDARY'
- `break_duration` (integer): Break duration in minutes

**Returns:** UUID of the created shift or NULL if creation fails

**Function Body:**
```sql
INSERT INTO public.shifts (
  client_id, title, description, start_time, end_time,
  pay_rate, job_location, staff_needed, staff_assigned,
  submission_cycle, break_duration
)
VALUES (
  client_id, title, description, start_time, end_time,
  pay_rate, job_location, staff_needed, 0,
  submission_cycle, break_duration
)
RETURNING shift_id INTO new_shift_id;

RETURN new_shift_id;
```

---

### `auto_update_shift_status()`
**Schema:** `public`  
**Return Type:** `trigger`  
**Security:** `DEFINER`

**Description:** Automatically updates shift status based on staff assignment levels.

**Trigger Events:**
- **Table:** `shifts`
- **Event:** `AFTER UPDATE`
- **Trigger Name:** `trigger_auto_update_shift_status`

**Logic:**
- **Auto-Fill**: When `staff_assigned >= staff_needed` → Set status to 2 (FILLED)
- **Auto-Reopen**: When `staff_assigned < staff_needed` and status was FILLED → Set status to 1 (OPEN)

---

## 📋 Assignment Management Functions

### `is_user_assigned_to_shift(p_shift_id uuid, p_user_id uuid)`
**Schema:** `public`  
**Return Type:** `boolean`  
**Security:** `DEFINER`

**Description:** Checks if a specific user is assigned to a specific shift.

**Parameters:**
- `p_shift_id` (uuid): Shift ID to check
- `p_user_id` (uuid): User ID to check

**Returns:** Boolean indicating assignment status

---

### `update_staff_assigned()`
**Schema:** `public`  
**Return Type:** `trigger`  
**Security:** `DEFINER`

**Description:** Maintains accurate staff assignment counts on shifts table.

**Trigger Events:**
- **Table:** `assignments`
- **Event:** `AFTER INSERT, UPDATE, DELETE`
- **Trigger Name:** `trigger_update_staff_assigned`

**Logic:**
- **INSERT**: If status = 'CONFIRMED' → Increment `staff_assigned`
- **UPDATE**: 
  - Status changed to 'CONFIRMED' → Increment `staff_assigned`
  - Status changed from 'CONFIRMED' → Decrement `staff_assigned`
- **DELETE**: If old status was 'CONFIRMED' → Decrement `staff_assigned`

---

## ⭐ Rating & Feedback Functions

### `update_job_seeker_rating()`
**Schema:** `public`  
**Return Type:** `trigger`  
**Security:** `DEFINER`

**Description:** Automatically updates job seeker ratings based on client feedback and reliability metrics.

**Trigger Events:**
- **Table:** `feedback` - **Event:** `AFTER INSERT` - **Trigger:** `trigger_update_rating_on_feedback`
- **Table:** `assignments` - **Event:** `AFTER UPDATE` - **Trigger:** `trigger_update_rating_on_assignment`

**Rating Calculation:**
1. **Base Rating**: Average of all CLIENT_TO_EMPLOYEE feedback scores
2. **Reliability Penalty**: 
   - Each cancellation: -0.1 points
   - Each no-show: -0.3 points
   - Scaled by experience level (new users get lighter penalties)
3. **Final Rating**: Base rating - reliability penalty (clamped between 0.0 and 5.0)

**Function Logic:**
```sql
-- Calculate average rating from feedback
SELECT AVG(f.rating_score)::DECIMAL(3,2) INTO avg_rating
FROM public.feedback f
JOIN public.assignments a ON f.assignment_id = a.assignment_id
WHERE a.user_id = job_seeker_user_id 
AND f.review_type = 'CLIENT_TO_EMPLOYEE';

-- Calculate reliability metrics
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'CANCELLED_BY_USER' THEN 1 END) as cancelled,
  COUNT(CASE WHEN status = 'NO_SHOW' THEN 1 END) as no_shows
INTO total_assignments, cancelled_assignments, no_show_assignments
FROM public.assignments
WHERE user_id = job_seeker_user_id;

-- Apply reliability penalty
reliability_penalty := (cancelled_assignments * 0.1) + (no_show_assignments * 0.3);
reliability_penalty := reliability_penalty * LEAST(total_assignments::DECIMAL / 10.0, 1.0);

-- Final rating calculation
final_rating := COALESCE(avg_rating, 5.0) - reliability_penalty;
final_rating := GREATEST(0.0, LEAST(5.0, final_rating));
```

---

## 💰 Payout & Financial Functions

### `calculate_user_payout(target_user_id uuid, period_start date, period_end date)`
**Schema:** `public`  
**Return Type:** `numeric`  
**Security:** `DEFINER`

**Description:** Calculates total earnings for a user over a specified period and creates a payout record.

**Parameters:**
- `target_user_id` (uuid): User ID to calculate payout for
- `period_start` (date): Start date of the payout period
- `period_end` (date): End date of the payout period

**Returns:** Total earnings amount

**Calculation Formula:**
```sql
earnings = pay_rate × hours_worked - (break_hours × pay_rate)

WHERE hours_worked = EXTRACT(EPOCH FROM (check_out_time - check_in_time))/3600
```

**Function Logic:**
```sql
-- Calculate total earnings from completed assignments
SELECT 
  COALESCE(SUM(
    s.pay_rate * 
    EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time))/3600 - 
    (a.break_hours * s.pay_rate)
  ), 0),
  COUNT(*)
INTO total_earnings, shift_count
FROM public.assignments a
JOIN public.shifts s ON a.shift_id = s.shift_id
WHERE a.user_id = target_user_id
  AND a.status = 'COMPLETED'
  AND a.check_in_time IS NOT NULL
  AND a.check_out_time IS NOT NULL
  AND DATE(a.check_in_time) BETWEEN period_start AND period_end;

-- Create payout record if earnings > 0
IF total_earnings > 0 THEN
  INSERT INTO public.payouts (user_id, amount, start_period, end_period)
  VALUES (target_user_id, total_earnings, period_start, period_end)
  ON CONFLICT DO NOTHING;
END IF;
```

---

### `get_earnings_breakdown(target_user_id uuid, period_start date, period_end date)`
**Schema:** `public`  
**Return Type:** `TABLE(shift_id uuid, title varchar, work_date date, hours_worked numeric, pay_rate numeric, total_earned numeric)`
**Security:** `DEFINER`

**Description:** Returns detailed earnings breakdown for a user over a specified period.

**Parameters:**
- `target_user_id` (uuid): User ID to get breakdown for
- `period_start` (date): Start date of the period
- `period_end` (date): End date of the period

**Returns:** Table with columns:
- `shift_id` (uuid): ID of the shift
- `title` (varchar): Shift title
- `work_date` (date): Date the work was performed
- `hours_worked` (numeric): Hours worked (excluding breaks)
- `pay_rate` (numeric): Hourly pay rate
- `total_earned` (numeric): Total amount earned for that shift

---

## 🔍 Advanced Business Functions

### `find_matching_job_seekers(p_shift_id uuid)`
**Schema:** `public`  
**Return Type:** `TABLE(user_id uuid, first_name varchar, last_name varchar, rating numeric, match_score numeric, preferred_categories text[], distance_km numeric)`
**Security:** `DEFINER`

**Description:** Advanced matching algorithm that finds suitable job seekers for a specific shift based on multiple criteria.

**Parameters:**
- `p_shift_id` (uuid): Shift ID to find matches for

**Matching Logic:**
- **Pay Rate Match**: 30 points if job seeker's minimum rate ≤ shift pay rate
- **Category Preference**: 40 points if shift category matches desired roles
- **Rating Contribution**: Up to 30 points based on job seeker rating (rating × 6.0)
- **Minimum Threshold**: 30+ points required for consideration
- **Availability Check**: Excludes already assigned users

**Returns:** Top 20 matches ordered by match score and rating

---

### `get_job_categories_with_types()`
**Schema:** `public`  
**Return Type:** `TABLE(category_id uuid, category_name varchar, job_types jsonb)`
**Security:** `DEFINER`

**Description:** Returns hierarchical job classification data with categories and their associated job types.

**Returns:** Table with columns:
- `category_id` (uuid): Category identifier
- `category_name` (varchar): Category name
- `job_types` (jsonb): Array of job type objects with id, name, and description

**Usage:** Populates job selection dropdowns and preference forms

---

### `update_assignment_status(p_assignment_id uuid, p_status_name text)`
**Schema:** `public`  
**Return Type:** `TABLE(rows_affected integer)`
**Security:** `DEFINER`

**Description:** Safely updates assignment status with validation and error handling.

**Parameters:**
- `p_assignment_id` (uuid): Assignment ID to update
- `p_status_name` (text): Status name (e.g., 'CONFIRMED', 'CANCELLED_BY_USER')

**Features:**
- Validates status names against status lookup table
- Converts status names to integer IDs
- Returns number of affected rows
- Raises exceptions for invalid status names

---

## 📊 Query & Reporting Functions

### `get_shifts_by_client(p_client_id uuid)`
**Schema:** `public`  
**Return Type:** `TABLE(shift_id uuid, client_name varchar, title varchar, job_location varchar, description text, start_time timestamptz, end_time timestamptz, pay_rate numeric, staff_needed integer, staff_assigned integer, status varchar, submission_cycle varchar, break_duration integer, created_at timestamptz, job_name varchar)`
**Security:** `DEFINER`

**Description:** Returns comprehensive shift information for a specific client with joined data.

**Parameters:**
- `p_client_id` (uuid): Client ID to get shifts for

**Returns:** Complete shift details including:
- Client name and contact information
- Job type and category information
- Status names (not just IDs)
- Staff capacity and assignment counts

---

### `get_assignment_by_jobseeker(p_user_id uuid)`
**Schema:** `public`  
**Return Type:** `TABLE(assignment_id uuid, name varchar, job_title varchar, status varchar, check_in_time timestamptz, check_out_time timestamptz, break_hours integer, created_at timestamptz)`
**Security:** `DEFINER`

**Description:** Returns assignment history and status for a specific job seeker.

**Parameters:**
- `p_user_id` (uuid): Job seeker user ID

**Returns:** Assignment details with:
- Job seeker name
- Shift title and job information
- Status names (converted from IDs)
- Time tracking information

---

### `get_assignment_status_summary(p_shift_id uuid)`
**Schema:** `public`  
**Return Type:** `TABLE(status_name varchar, count integer)`
**Security:** `DEFINER`

**Description:** Provides assignment status breakdown for a specific shift.

**Parameters:**
- `p_shift_id` (uuid): Shift ID to analyze

**Returns:** Status counts for capacity planning and reporting

---

## 🔧 Additional Utility Functions

### `validate_job_names(job_names text[])`
**Schema:** `public`  
**Return Type:** `boolean`
**Security:** `DEFINER`

**Description:** Validates that all provided job type names exist and are active.

**Parameters:**
- `job_names` (text[]): Array of job type names to validate

**Returns:** Boolean indicating if all names are valid and active

**Usage:** Preference validation and job selection forms

---

## 🔧 Database Triggers

### Summary of Active Triggers

| Trigger Name | Table | Event | Function | Purpose |
|-------------|-------|-------|----------|---------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user` | Auto-create user profiles |
| `trigger_update_staff_assigned` | `assignments` | AFTER INSERT | `update_staff_assigned` | Maintain staff counts |
| `trigger_update_rating_on_assignment` | `assignments` | AFTER UPDATE | `update_job_seeker_rating` | Update ratings on status change |
| `trigger_update_rating_on_feedback` | `feedback` | AFTER INSERT | `update_job_seeker_rating` | Update ratings on new feedback |
| `trigger_auto_update_shift_status` | `shifts` | AFTER UPDATE | `auto_update_shift_status` | Auto-manage shift status |

---

## 📚 Function Usage Examples

### Creating a New Shift
```sql
-- Create a new shift and get the shift ID
SELECT create_shift(
  'client-uuid-here'::uuid,
  'Restaurant Server',
  'Serve customers during lunch rush',
  '2025-07-20 11:00:00+08'::timestamptz,
  '2025-07-20 15:00:00+08'::timestamptz,
  18.50,
  '123 Restaurant Street, Singapore',
  3,
  'PRIMARY',
  30
) as new_shift_id;
```

### Calculating User Payout
```sql
-- Calculate weekly payout for a user
SELECT calculate_user_payout(
  'user-uuid-here'::uuid,
  '2025-07-14'::date,
  '2025-07-20'::date
) as weekly_earnings;
```

### Getting Earnings Breakdown
```sql
-- Get detailed earnings breakdown
SELECT * FROM get_earnings_breakdown(
  'user-uuid-here'::uuid,
  '2025-07-01'::date,
  '2025-07-31'::date
);
```

### Checking Assignment Status
```sql
-- Check if user is assigned to a shift
SELECT is_user_assigned_to_shift(
  'shift-uuid-here'::uuid,
  'user-uuid-here'::uuid
) as is_assigned;
```

---

## 🔄 Recent Updates

### July 15, 2025 - Enhanced User Registration
- ✅ **Updated `handle_new_user()` function** with complete field support
- ✅ **Added enhanced fields**: `date_of_birth`, `address_coordinates`, `postal_code` for job seekers
- ✅ **Added enhanced fields**: `address`, `postal_code`, `office_number` for employers
- ✅ **Improved data type handling**: Proper DATE conversion for birth dates
- ✅ **Enhanced error handling**: Graceful fallbacks for missing metadata

### Function Performance Notes
- All trigger functions use `SECURITY DEFINER` for consistent permissions
- Rating calculations are optimized with proper indexing
- Payout functions include duplicate prevention with `ON CONFLICT DO NOTHING`
- Email checking functions use case-insensitive comparison

---

## 🚀 Performance Considerations

### Indexing Recommendations
For optimal performance, ensure these indexes exist:
- `job_seekers(user_id)` - Primary key (automatic)
- `assignments(user_id, status)` - For rating calculations
- `assignments(shift_id, status)` - For staff count updates
- `feedback(assignment_id, review_type)` - For rating queries
- `shifts(client_id, status)` - For shift queries

### Monitoring
Monitor these functions for performance:
- `update_job_seeker_rating()` - Runs on every feedback/assignment update
- `update_staff_assigned()` - Runs on every assignment change
- `handle_new_user()` - Critical for user registration flow

---

## 🔢 Status System Reference

### Critical: Integer-Based Status Management
The OptiStaff platform uses an **integer-based status system** with a lookup table, not string values. This is crucial for frontend development.

#### Status Lookup Table (`public.status`)
```sql
SELECT status_id, name FROM public.status ORDER BY status_id;
```

#### Shift Status Codes
- **1**: `OPEN` - Shift is available for assignment
- **2**: `FILLED` - Shift has reached capacity

#### Assignment Status Codes  
- **5**: `CONFIRMED` - Job seeker is confirmed for the shift
- **7**: `CANCELLED_BY_USER` - Job seeker cancelled their assignment
- **8**: `NO_SHOW` - Job seeker failed to show up
- **9**: `COMPLETED` - Assignment completed successfully

#### Frontend Usage
```typescript
// ❌ WRONG - Don't use strings
assignment.status = 'CONFIRMED';

// ✅ CORRECT - Use integer status IDs
assignment.status = 5; // CONFIRMED

// ✅ CORRECT - Use status lookup for display
const statusName = statusLookup[assignment.status]; // "CONFIRMED"
```

#### Database Function Integration
- `update_staff_assigned()`: Checks for status = 5 (CONFIRMED)
- `update_job_seeker_rating()`: Penalizes status 7 (CANCELLED) and 8 (NO_SHOW)
- `auto_update_shift_status()`: Toggles between status 1 (OPEN) and 2 (FILLED)

---

**Documentation Generated:** July 20, 2025  
**Last Updated:** Added missing functions and corrected status system documentation  
**Version:** OptiStaff v1.0 - Complete Database Schema (`devnew`)
