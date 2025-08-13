

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."auto_update_shift_status"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  -- Auto-fill shift when staff_assigned reaches staff_needed
  IF NEW.staff_assigned >= NEW.staff_needed AND NEW.status = 1 THEN
    UPDATE public.shifts 
    SET status = 2 -- FILLED
    WHERE shift_id = NEW.shift_id;
  END IF;
  
  -- Reopen shift if staff drops below needed and it was filled
  IF NEW.staff_assigned < NEW.staff_needed AND NEW.status = 2 THEN
    UPDATE public.shifts 
    SET status = 1 -- OPEN
    WHERE shift_id = NEW.shift_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_update_shift_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_user_payout"("target_user_id" "uuid", "period_start" "date", "period_end" "date") RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$DECLARE
  total_earnings DECIMAL(10,2) := 0;
  shift_count INTEGER := 0;
BEGIN
  -- Calculate total earnings from completed assignments in the period
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
    AND a.status = 'completed'
    AND a.check_in_time IS NOT NULL
    AND a.check_out_time IS NOT NULL
    AND DATE(a.check_in_time) BETWEEN period_start AND period_end;
  
  -- Only create payout record if there are earnings
  IF total_earnings > 0 THEN
    INSERT INTO public.payouts (user_id, amount, start_period, end_period)
    VALUES (target_user_id, total_earnings, period_start, period_end)
    ON CONFLICT DO NOTHING; -- Prevent duplicates
  END IF;
  
  RETURN total_earnings;
END;$$;


ALTER FUNCTION "public"."calculate_user_payout"("target_user_id" "uuid", "period_start" "date", "period_end" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_email_exists"("email_to_check" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if email exists in the users table
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE LOWER(email) = LOWER(email_to_check)
  );
END;
$$;


ALTER FUNCTION "public"."check_email_exists"("email_to_check" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_email_exists_comprehensive"("email_to_check" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if email exists in either auth.users or public.users
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE LOWER(email) = LOWER(email_to_check)
  ) OR EXISTS (
    SELECT 1 FROM public.users WHERE LOWER(email) = LOWER(email_to_check)
  );
END;
$$;


ALTER FUNCTION "public"."check_email_exists_comprehensive"("email_to_check" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_preferences"("p_user_id" "uuid") RETURNS TABLE("preference_id" "uuid", "user_id" "uuid", "min_pay_rate" numeric, "max_travel_km" integer, "desired_roles" "jsonb", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "max_hours_per_week" integer, "max_hours_per_shift" integer, "consider_lower_rate" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- First try to insert new preferences
  BEGIN
    RETURN QUERY
    INSERT INTO public.preferences (
      user_id, 
      min_pay_rate, 
      max_travel_km, 
      desired_roles,
      max_hours_per_week, 
      max_hours_per_shift, 
      consider_lower_rate
    )
    VALUES (
      create_default_preferences.p_user_id, 
      15,           -- Default minimum pay rate
      15,           -- Default max travel (reasonable for Singapore)
      '[]'::JSONB,  -- Empty array of job names
      40,           -- Default max hours per week
      8,            -- Default max hours per shift
      false         -- Don't consider lower rates by default
    )
    RETURNING *;
    
  EXCEPTION WHEN unique_violation THEN
    -- If preferences already exist, return existing ones
    RETURN QUERY
    SELECT 
      p.preference_id,
      p.user_id,
      p.min_pay_rate,
      p.max_travel_km,
      p.desired_roles,
      p.created_at,
      p.updated_at,
      p.max_hours_per_week,
      p.max_hours_per_shift,
      p.consider_lower_rate
    FROM public.preferences p
    WHERE p.user_id = create_default_preferences.p_user_id;
  END;
END;
$$;


ALTER FUNCTION "public"."create_default_preferences"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_shift"("p_employer_id" "uuid", "job_title" "text", "job_location" "text", "postal_code" integer, "job_description" "text", "job_requirements" "text", "job_type" "text", "pay_rate" numeric, "break_duration" numeric, "staff_needed" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) RETURNS TABLE("created_shift_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_job_type_id uuid;
BEGIN
  -- Look up the job_type_id from job_types table
  SELECT job_type_id INTO v_job_type_id
  FROM public.job_types
  WHERE type_name = job_type;

  -- If no match, raise an error
  IF v_job_type_id IS NULL THEN
    RAISE EXCEPTION 'Invalid job type: %', job_type;
  END IF;

  -- Insert the shift and return selected fields
  RETURN QUERY
    INSERT INTO public.shifts (
      client_id,
      title,
      description,
      start_time,
      end_time,
      pay_rate,
      job_location,
      staff_needed,
      break_duration,
      job_type_id,
      requirements,
      postal_code
    )
    VALUES (
      p_employer_id,
      job_title,
      job_description,
      p_start_time,
      p_end_time,
      pay_rate,
      job_location,
      staff_needed,
      break_duration,
      v_job_type_id,
      job_requirements,
      postal_code
    )
    RETURNING shift_id;
END;
$$;


ALTER FUNCTION "public"."create_shift"("p_employer_id" "uuid", "job_title" "text", "job_location" "text", "postal_code" integer, "job_description" "text", "job_requirements" "text", "job_type" "text", "pay_rate" numeric, "break_duration" numeric, "staff_needed" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_user_payouts"("target_user_id" "uuid") RETURNS TABLE("payout_id" "uuid", "amount" numeric, "start_time" timestamp with time zone, "end_time" timestamp with time zone, "break_hours" numeric, "pay_rate" numeric, "assignment_id" "uuid", "created_at" timestamp with time zone)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select 
    p.payout_id,
    p.amount,
    p.start_time,
    p.end_time,
    p.break_hours,
    p.pay_rate,
    p.assignment_id,
    p.created_at
  from payouts p
  where p.assignment_id in (
    select a.assignment_id 
    from assignments a 
    where a.user_id = target_user_id
  )
  order by p.created_at desc;
$$;


ALTER FUNCTION "public"."fetch_user_payouts"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."find_matching_job_seekers"("p_shift_id" "uuid") RETURNS TABLE("user_id" "uuid", "first_name" character varying, "last_name" character varying, "rating" numeric, "match_score" numeric, "preferred_categories" "text"[], "distance_km" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  WITH shift_details AS (
    SELECT 
      s.shift_id,
      s.pay_rate,
      s.job_location,
      s.job_type_id,
      jt.category_id,
      jc.category_name
    FROM shifts s
    LEFT JOIN job_types jt ON s.job_type_id = jt.job_type_id
    LEFT JOIN job_categories jc ON jt.category_id = jc.category_id
    WHERE s.shift_id = p_shift_id
  ),
  matching_users AS (
    SELECT 
      js.user_id,
      js.first_name,
      js.last_name,
      js.rating,
      p.min_pay_rate,
      p.max_travel_km,
      p.desired_roles,
      sd.pay_rate as shift_pay_rate,
      sd.category_name as shift_category,
      sd.job_location as shift_location,
      -- Calculate match score based on multiple factors
      CASE 
        WHEN p.min_pay_rate <= sd.pay_rate THEN 30.0 -- Pay rate match
        ELSE 0.0
      END +
      CASE 
        WHEN sd.category_name = ANY(
          SELECT jsonb_array_elements_text(p.desired_roles)
        ) THEN 40.0 -- Category preference match
        ELSE 0.0
      END +
      LEAST(js.rating * 6.0, 30.0) -- Rating contribution (max 30 points)
      as match_score
    FROM job_seekers js
    JOIN preferences p ON js.user_id = p.user_id
    CROSS JOIN shift_details sd
    WHERE js.status = 'ACTIVE'
      AND p.min_pay_rate <= sd.pay_rate
      -- Add availability check here when availability system is implemented
      AND NOT EXISTS (
        SELECT 1 FROM assignments a 
        WHERE a.user_id = js.user_id 
          AND a.shift_id = p_shift_id
      )
  )
  SELECT 
    mu.user_id,
    mu.first_name,
    mu.last_name, 
    mu.rating,
    mu.match_score,
    ARRAY(SELECT jsonb_array_elements_text(mu.desired_roles)) as preferred_categories,
    0.0 as distance_km -- Placeholder for distance calculation
  FROM matching_users mu
  WHERE mu.match_score > 30.0 -- Minimum threshold for consideration
  ORDER BY mu.match_score DESC, mu.rating DESC
  LIMIT 20;
END;
$$;


ALTER FUNCTION "public"."find_matching_job_seekers"("p_shift_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_assignment_feedback"("p_assignment_id" "uuid", "p_reviewee_id" "uuid") RETURNS TABLE("feedback_id" "uuid", "assignment_id" "uuid", "reviewer_id" "uuid", "reviewee_id" "uuid", "rating_score" integer, "comment" "text", "review_type" character varying, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Return feedback for the specific assignment and reviewee (job seeker)
  RETURN QUERY
  SELECT 
    f.feedback_id,
    f.assignment_id,
    f.reviewer_id,
    f.reviewee_id,
    f.rating_score,
    f.comment,
    f.review_type,
    f.created_at
  FROM feedback f
  WHERE 
    f.assignment_id = p_assignment_id 
    AND f.reviewee_id = p_reviewee_id
    AND f.review_type = 'CLIENT_TO_EMPLOYEE'
  ORDER BY f.created_at DESC
  LIMIT 1;
END;
$$;


ALTER FUNCTION "public"."get_assignment_feedback"("p_assignment_id" "uuid", "p_reviewee_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_assignment_status_summary"("p_shift_id" "uuid") RETURNS TABLE("status_name" character varying, "count" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.status::VARCHAR as status_name,
    COUNT(*)::INTEGER as count
  FROM assignments a
  WHERE a.shift_id = p_shift_id
  GROUP BY a.status
  ORDER BY count DESC;
END;
$$;


ALTER FUNCTION "public"."get_assignment_status_summary"("p_shift_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_assignments_by_jobseeker"("p_user_id" "uuid") RETURNS TABLE("assignment_id" "uuid", "employee_name" "text", "employee_id" "uuid", "employer_name" "text", "company_name" "text", "job_title" "text", "job_location" "text", "job_description" "text", "job_requirements" "text", "job_type" "text", "pay_rate" double precision, "start_time" timestamp with time zone, "end_time" timestamp with time zone, "break_hours" integer, "contact_number" "text", "contact_email" "text", "check_in_time" timestamp with time zone, "check_out_time" timestamp with time zone, "status" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql"
    AS $$
SELECT
a.assignment_id, 
CONCAT_WS(' ', j.last_name, j.first_name) as employee_name,
a.user_id,
CONCAT_WS(' ', c.last_name, c.first_name) as employer_name,
c.company_name,
ss.title as job_title,
ss.job_location,
ss.description as job_description,
ss.requirements as job_requirements,
jt.type_name as job_type,
ss.pay_rate,
ss.start_time,
ss.end_time,
a.break_hours,
c.phone as contact_number,
c.contact_email,
a.check_in_time,
a.check_out_time,
s.name as status,
a.created_at
FROM public.assignments a, public.job_seekers j, public.status s, public.shifts ss, public.clients c, public.job_types jt
WHERE a.user_id = p_user_id and a.shift_id = ss.shift_id and a.status = s.status_id and a.user_id = j.user_id and ss.client_id = c.client_id and ss.job_type_id = jt.job_type_id;
$$;


ALTER FUNCTION "public"."get_assignments_by_jobseeker"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_assignments_by_shift"("p_shift_id" "uuid") RETURNS TABLE("assignment_id" "uuid", "employee_name" "text", "employee_id" "uuid", "employer_name" "text", "company_name" "text", "job_title" "text", "job_location" "text", "job_description" "text", "job_requirements" "text", "job_type" "text", "pay_rate" double precision, "start_time" timestamp with time zone, "end_time" timestamp with time zone, "break_hours" integer, "contact_number" "text", "contact_email" "text", "check_in_time" timestamp with time zone, "check_out_time" timestamp with time zone, "status" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql"
    AS $$
SELECT
a.assignment_id, 
CONCAT_WS(' ', j.last_name, j.first_name) as employee_name,
a.user_id,
CONCAT_WS(' ', c.last_name, c.first_name) as employer_name,
c.company_name,
ss.title as job_title,
ss.job_location,
ss.description as job_description,
ss.requirements as job_requirements,
jt.type_name as job_type,
ss.pay_rate,
ss.start_time,
ss.end_time,
a.break_hours,
c.phone as contact_number,
c.contact_email,
a.check_in_time,
a.check_out_time,
s.name as status,
a.created_at
FROM public.assignments a, public.job_seekers j, public.status s, public.shifts ss, public.clients c, public.job_types jt
WHERE a.shift_id = p_shift_id and a.shift_id = ss.shift_id and a.status = s.status_id and a.user_id = j.user_id and ss.client_id = c.client_id and ss.job_type_id = jt.job_type_id;
$$;


ALTER FUNCTION "public"."get_assignments_by_shift"("p_shift_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_job_categories_with_types"() RETURNS TABLE("category_id" "uuid", "category_name" character varying, "job_types" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jc.category_id,
    jc.category_name,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'job_type_id', jt.job_type_id,
          'type_name', jt.type_name,
          'description', jt.description
        ) ORDER BY jt.type_name
      ) FILTER (WHERE jt.job_type_id IS NOT NULL),
      '[]'::jsonb
    ) as job_types
  FROM job_categories jc
  LEFT JOIN job_types jt ON jc.category_id = jt.category_id AND jt.is_active = true
  WHERE jc.is_active = true
  GROUP BY jc.category_id, jc.category_name
  ORDER BY jc.category_name;
END;
$$;


ALTER FUNCTION "public"."get_job_categories_with_types"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_shifts_by_employer"("p_employer_id" "uuid") RETURNS TABLE("shift_id" "uuid", "employer_name" "text", "company_name" "text", "job_title" "text", "job_location" "text", "postal_code" integer, "job_description" "text", "job_requirements" "text", "job_type" "text", "pay_rate" double precision, "start_time" timestamp with time zone, "end_time" timestamp with time zone, "break_duration" double precision, "staff_needed" integer, "staff_assigned" integer, "submission_cycle" "text", "status" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql"
    AS $$

SELECT 
  s.shift_id,
  CONCAT_WS(' ', c.first_name, c.last_name) as employer_name,
  c.company_name,
  s.title as job_title,
  s.job_location,
  s.postal_code,
  s.description as job_description,
  s.requirements as job_requirements,
  j.type_name as job_type,
  s.pay_rate,
  s.start_time,
  s.end_time,
  s.break_duration,
  s.staff_needed,
  s.staff_assigned,
  s.submission_cycle,
  ss.name as status,
  s.created_at
FROM public.shifts s
JOIN public.status ss ON s.status = ss.status_id
JOIN public.clients c ON s.client_id = c.client_id
JOIN public.job_types j ON s.job_type_id = j.job_type_id
WHERE s.client_id = p_employer_id;
$$;


ALTER FUNCTION "public"."get_shifts_by_employer"("p_employer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_details_from_assignment"("p_assignment_id" "uuid") RETURNS TABLE("user_id" "uuid", "first_name" character varying, "last_name" character varying, "full_name" "text", "date_of_birth" "date", "rating" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    js.user_id,
    js.first_name,
    js.last_name,
    CONCAT_WS(' ', js.first_name, js.last_name) as full_name,
    js.date_of_birth,
    js.rating
  FROM public.assignments a
  JOIN public.job_seekers js ON a.user_id = js.user_id
  WHERE a.assignment_id = p_assignment_id;
END;
$$;


ALTER FUNCTION "public"."get_user_details_from_assignment"("p_assignment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_location"("p_user_id" "uuid") RETURNS TABLE("user_id" "uuid", "address_coordinates" character varying, "postal_code" character varying, "address" "text", "coordinates_lat" numeric, "coordinates_lng" numeric, "formatted_address" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    js.user_id,
    js.address_coordinates,
    js.postal_code,
    js.address,
    -- Parse coordinates (simplified - no bounds checking needed)
    CASE 
      WHEN js.address_coordinates IS NOT NULL AND js.address_coordinates LIKE '%,%' THEN
        split_part(js.address_coordinates, ',', 1)::NUMERIC
      ELSE NULL
    END as coordinates_lat,
    CASE 
      WHEN js.address_coordinates IS NOT NULL AND js.address_coordinates LIKE '%,%' THEN
        split_part(js.address_coordinates, ',', 2)::NUMERIC
      ELSE NULL
    END as coordinates_lng,
    -- Create formatted address
    CASE 
      WHEN js.address IS NOT NULL AND js.postal_code IS NOT NULL THEN
        js.address || ', Singapore ' || js.postal_code
      WHEN js.address IS NOT NULL THEN
        js.address || ', Singapore'
      WHEN js.postal_code IS NOT NULL THEN
        'Singapore ' || js.postal_code
      ELSE NULL
    END as formatted_address
  FROM public.job_seekers js
  WHERE js.user_id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."get_user_location"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_payouts_by_time_range"("p_user_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  total_amount NUMERIC := 0;
BEGIN
  -- Calculate total payout amount for the user in the given time range
  -- Using check_in_time from assignments table as the time reference
  SELECT COALESCE(SUM(p.amount), 0)
  INTO total_amount
  FROM 
    public.payouts p
    JOIN public.assignments a ON p.assignment_id = a.assignment_id
  WHERE 
    a.user_id = p_user_id
    AND a.check_in_time BETWEEN p_start_time AND p_end_time;
    
  RETURN total_amount;
END;
$$;


ALTER FUNCTION "public"."get_user_payouts_by_time_range"("p_user_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_preferences_with_location"("p_user_id" "uuid") RETURNS TABLE("preference_id" "uuid", "user_id" "uuid", "min_pay_rate" numeric, "max_travel_km" integer, "desired_roles" "jsonb", "max_hours_per_week" integer, "max_hours_per_shift" integer, "consider_lower_rate" boolean, "preferences_created_at" timestamp with time zone, "preferences_updated_at" timestamp with time zone, "address_coordinates" character varying, "postal_code" character varying, "address" "text", "coordinates_lat" numeric, "coordinates_lng" numeric, "is_singapore_location" boolean, "formatted_address" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN QUERY
  SELECT 
    p.preference_id,
    p.user_id,
    p.min_pay_rate,
    p.max_travel_km,
    p.desired_roles,
    p.max_hours_per_week,
    p.max_hours_per_shift,
    p.consider_lower_rate,
    p.created_at as preferences_created_at,
    p.updated_at as preferences_updated_at,
    js.address_coordinates,
    js.postal_code,
    js.address,
    -- Parse coordinates with better error handling
    CASE 
      WHEN js.address_coordinates IS NOT NULL AND js.address_coordinates LIKE '%,%' THEN
        CASE 
          WHEN split_part(js.address_coordinates, ',', 1) ~ '^-?[0-9]+\.?[0-9]*$' THEN
            split_part(js.address_coordinates, ',', 1)::NUMERIC
          ELSE NULL
        END
      ELSE NULL
    END as coordinates_lat,
    CASE 
      WHEN js.address_coordinates IS NOT NULL AND js.address_coordinates LIKE '%,%' THEN
        CASE 
          WHEN split_part(js.address_coordinates, ',', 2) ~ '^-?[0-9]+\.?[0-9]*$' THEN
            split_part(js.address_coordinates, ',', 2)::NUMERIC
          ELSE NULL
        END
      ELSE NULL
    END as coordinates_lng,
    -- Enhanced Singapore bounds validation
    CASE 
      WHEN js.address_coordinates IS NOT NULL AND js.address_coordinates LIKE '%,%' THEN
        CASE 
          WHEN split_part(js.address_coordinates, ',', 1) ~ '^-?[0-9]+\.?[0-9]*$' AND
               split_part(js.address_coordinates, ',', 2) ~ '^-?[0-9]+\.?[0-9]*$' THEN
            (split_part(js.address_coordinates, ',', 1)::NUMERIC BETWEEN 1.2290 AND 1.4784) AND
            (split_part(js.address_coordinates, ',', 2)::NUMERIC BETWEEN 103.6000 AND 104.0120)
          ELSE FALSE
        END
      ELSE FALSE
    END as is_singapore_location,
    -- Create formatted address from available data
    CASE 
      WHEN js.address IS NOT NULL AND js.postal_code IS NOT NULL THEN
        js.address || ', Singapore ' || js.postal_code
      WHEN js.address IS NOT NULL THEN
        js.address || ', Singapore'
      WHEN js.postal_code IS NOT NULL THEN
        'Singapore ' || js.postal_code
      ELSE NULL
    END as formatted_address
  FROM public.preferences p
  LEFT JOIN public.job_seekers js ON p.user_id = js.user_id
  WHERE p.user_id = get_user_preferences_with_location.p_user_id;
END;
$_$;


ALTER FUNCTION "public"."get_user_preferences_with_location"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_profile_data"("p_user_id" "uuid") RETURNS TABLE("user_role" "text", "first_name" "text", "last_name" "text", "email" "text", "phone_number" "text", "address" "text", "postal_code" "text", "address_coordinates" "text", "company_name" "text", "rating" numeric, "status" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Check if user exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found in auth.users table';
  END IF;
  
  -- Determine user role and fetch data
  IF EXISTS (SELECT 1 FROM public.job_seekers WHERE user_id = p_user_id) THEN
    -- Return job seeker profile data
    RETURN QUERY
    SELECT 
      'jobseeker'::text as user_role,
      js.first_name::text,
      js.last_name::text,
      au.email::text,
      js.phone_number::text,
      js.address::text,
      js.postal_code::text,
      js.address_coordinates::text,
      NULL::text as company_name,
      js.rating,
      COALESCE(js.status, 'ACTIVE')::text,
      au.created_at
    FROM public.job_seekers js
    JOIN auth.users au ON js.user_id = au.id
    WHERE js.user_id = p_user_id;
    
  ELSIF EXISTS (SELECT 1 FROM public.clients WHERE client_id = p_user_id) THEN
    -- Return client profile data
    RETURN QUERY
    SELECT 
      'employer'::text as user_role,
      c.first_name::text,
      c.last_name::text,
      au.email::text,
      c.phone::text as phone_number,
      c.address::text,
      c.postal_code::text,
      NULL::text as address_coordinates,
      c.company_name::text,
      NULL::numeric as rating,
      'ACTIVE'::text as status,
      au.created_at
    FROM public.clients c
    JOIN auth.users au ON c.client_id = au.id
    WHERE c.client_id = p_user_id;
    
  ELSE
    RAISE EXCEPTION 'User profile not found in job_seekers or clients table';
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error fetching user profile data: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."get_user_profile_data"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_total_earnings"("target_user_id" "uuid") RETURNS numeric
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select coalesce(sum(p.amount), 0)
  from payouts p
  where p.assignment_id in (
    select a.assignment_id 
    from assignments a 
    where a.user_id = target_user_id
  );
$$;


ALTER FUNCTION "public"."get_user_total_earnings"("target_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_weekly_earnings_summary"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") RETURNS TABLE("assignment_id" "uuid", "shift_id" "uuid", "shift_title" character varying, "shift_start_time" timestamp with time zone, "shift_end_time" timestamp with time zone, "break_hours" numeric, "pay_rate" numeric, "scheduled_hours" numeric, "calculated_pay" numeric, "shift_date" "date", "assignment_status" "text", "is_completed" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.assignment_id,
    s.shift_id,
    s.title as shift_title,
    s.start_time as shift_start_time,
    s.end_time as shift_end_time,
    COALESCE(a.break_hours, 0) as break_hours,
    s.pay_rate,
    -- Calculate hours based on SHIFT SCHEDULE (not actual clock times)
    GREATEST(0, 
      EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600.0 - COALESCE(a.break_hours, 0)
    ) as scheduled_hours,
    -- Calculate pay based on scheduled hours
    ROUND(
      GREATEST(0, 
        EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600.0 - COALESCE(a.break_hours, 0)
      ) * s.pay_rate,
      2
    ) as calculated_pay,
    DATE(s.start_time) as shift_date,
    st.name as assignment_status,
    -- Determine if assignment is completed
    CASE WHEN a.status = 2 THEN true ELSE false END as is_completed
  FROM public.assignments a
  JOIN public.shifts s ON a.shift_id = s.shift_id
  JOIN public.status st ON a.status = st.status_id
  WHERE a.user_id = p_user_id
    AND (a.status = 2 OR a.status = 9)  -- Both completed and upcoming
    AND DATE(s.start_time) BETWEEN p_start_date AND p_end_date
  ORDER BY s.start_time ASC;
END;
$$;


ALTER FUNCTION "public"."get_weekly_earnings_summary"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_type_value TEXT;
  company_name_value TEXT;
  first_name_value TEXT;
  last_name_value TEXT;
  phone_number_value TEXT;
  date_of_birth_value TEXT;
  address_value TEXT;
  postal_code_value TEXT;
  office_number_value TEXT;
BEGIN
  -- Extract values from raw_user_meta_data
  user_type_value := NEW.raw_user_meta_data->>'user_type';
  company_name_value := NEW.raw_user_meta_data->>'company_name';
  first_name_value := NEW.raw_user_meta_data->>'first_name';
  last_name_value := NEW.raw_user_meta_data->>'last_name';
  phone_number_value := NEW.raw_user_meta_data->>'phone_number';
  date_of_birth_value := NEW.raw_user_meta_data->>'date_of_birth';
  address_value := NEW.raw_user_meta_data->>'address';
  postal_code_value := NEW.raw_user_meta_data->>'postal_code';
  office_number_value := NEW.raw_user_meta_data->>'office_number';
  
  -- Handle job-seeker signup with corrected field mapping
  IF user_type_value = 'job-seeker' THEN
    INSERT INTO public.job_seekers (
      user_id, 
      first_name, 
      last_name, 
      phone_number, 
      date_of_birth,
      address,        -- ✅ Store address in address field
      postal_code,
      status
    ) 
    VALUES (
      NEW.id, 
      COALESCE(first_name_value, split_part(NEW.email, '@', 1)), 
      COALESCE(last_name_value, ''), 
      phone_number_value,
      CASE 
        WHEN date_of_birth_value IS NOT NULL AND date_of_birth_value != '' 
        THEN date_of_birth_value::DATE 
        ELSE NULL 
      END,
      address_value,  -- ✅ Address goes to address field, not home_location
      postal_code_value,
      'ACTIVE'
    );
    
    INSERT INTO public.preferences (user_id) VALUES (NEW.id);
  END IF;
  
  -- Handle client signup (unchanged - already correct)
  IF user_type_value = 'client' THEN
    INSERT INTO public.clients (
      client_id, 
      company_name, 
      first_name, 
      last_name, 
      phone,
      address,
      postal_code,
      office_number,
      contact_email
    ) 
    VALUES (
      NEW.id, 
      COALESCE(company_name_value, 'My Company'), 
      COALESCE(first_name_value, split_part(NEW.email, '@', 1)),
      COALESCE(last_name_value, ''), 
      phone_number_value,
      address_value,
      postal_code_value,
      office_number_value,
      NEW.email
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_assigned_to_shift"("p_shift_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM assignments
    WHERE shift_id = p_shift_id AND user_id = p_user_id
  )
  INTO result;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."is_user_assigned_to_shift"("p_shift_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manage_user_preferences"("p_user_id" "uuid", "p_action" "text", "p_min_pay_rate" numeric DEFAULT NULL::numeric, "p_max_travel_km" integer DEFAULT NULL::integer, "p_desired_roles" "jsonb" DEFAULT NULL::"jsonb", "p_max_hours_per_week" integer DEFAULT NULL::integer, "p_max_hours_per_shift" integer DEFAULT NULL::integer, "p_consider_lower_rate" boolean DEFAULT NULL::boolean) RETURNS TABLE("preference_id" "uuid", "user_id" "uuid", "min_pay_rate" numeric, "max_travel_km" integer, "desired_roles" "jsonb", "max_hours_per_week" integer, "max_hours_per_shift" integer, "consider_lower_rate" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "validation_errors" "text"[], "action_performed" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- GET action
  IF p_action = 'get' THEN
    RETURN QUERY
    SELECT 
      p.preference_id, p.user_id, p.min_pay_rate, p.max_travel_km, 
      p.desired_roles, p.max_hours_per_week, p.max_hours_per_shift, 
      p.consider_lower_rate, p.created_at, p.updated_at,
      '{}'::text[] as validation_errors,
      'get'::text as action_performed
    FROM public.preferences p
    WHERE p.user_id = manage_user_preferences.p_user_id;
    
    -- If no preferences found, create defaults
    IF NOT FOUND THEN
      RETURN QUERY
      SELECT 
        cd.preference_id, cd.user_id, cd.min_pay_rate, cd.max_travel_km,
        cd.desired_roles, cd.max_hours_per_week, cd.max_hours_per_shift,
        cd.consider_lower_rate, cd.created_at, cd.updated_at,
        '{}'::text[] as validation_errors,
        'created_default'::text as action_performed
      FROM public.create_default_preferences(manage_user_preferences.p_user_id) cd;
    END IF;
    RETURN;
  END IF;

  -- CREATE_DEFAULT action
  IF p_action = 'create_default' THEN
    RETURN QUERY
    SELECT 
      cd.preference_id, cd.user_id, cd.min_pay_rate, cd.max_travel_km,
      cd.desired_roles, cd.max_hours_per_week, cd.max_hours_per_shift,
      cd.consider_lower_rate, cd.created_at, cd.updated_at,
      '{}'::text[] as validation_errors, 
      'created_default'::text as action_performed
    FROM public.create_default_preferences(manage_user_preferences.p_user_id) cd;
    RETURN;
  END IF;

  -- UPSERT action
  IF p_action = 'upsert' THEN
    -- Validate job names if provided
    IF p_desired_roles IS NOT NULL AND jsonb_array_length(p_desired_roles) > 0 THEN
      IF NOT validate_job_names(
        ARRAY(SELECT jsonb_array_elements_text(p_desired_roles))
      ) THEN
        RETURN QUERY SELECT 
          NULL::uuid, NULL::uuid, NULL::numeric, NULL::integer, NULL::jsonb,
          NULL::integer, NULL::integer, NULL::boolean, NULL::timestamptz, NULL::timestamptz,
          ARRAY['One or more selected job types are invalid or inactive']::text[] as validation_errors,
          'validation_failed'::text as action_performed;
        RETURN;
      END IF;
    END IF;

    -- Perform upsert
    INSERT INTO public.preferences (
      user_id, min_pay_rate, max_travel_km, desired_roles,
      max_hours_per_week, max_hours_per_shift, consider_lower_rate,
      updated_at
    )
    VALUES (
      manage_user_preferences.p_user_id, p_min_pay_rate, p_max_travel_km, p_desired_roles,
      p_max_hours_per_week, p_max_hours_per_shift, p_consider_lower_rate,
      NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      min_pay_rate = COALESCE(EXCLUDED.min_pay_rate, preferences.min_pay_rate),
      max_travel_km = COALESCE(EXCLUDED.max_travel_km, preferences.max_travel_km),
      desired_roles = COALESCE(EXCLUDED.desired_roles, preferences.desired_roles),
      max_hours_per_week = COALESCE(EXCLUDED.max_hours_per_week, preferences.max_hours_per_week),
      max_hours_per_shift = COALESCE(EXCLUDED.max_hours_per_shift, preferences.max_hours_per_shift),
      consider_lower_rate = COALESCE(EXCLUDED.consider_lower_rate, preferences.consider_lower_rate),
      updated_at = NOW();

    RETURN QUERY
    SELECT 
      p.preference_id, p.user_id, p.min_pay_rate, p.max_travel_km, 
      p.desired_roles, p.max_hours_per_week, p.max_hours_per_shift, 
      p.consider_lower_rate, p.created_at, p.updated_at,
      '{}'::text[] as validation_errors,
      'upserted'::text as action_performed
    FROM public.preferences p
    WHERE p.user_id = manage_user_preferences.p_user_id;
    RETURN;
  END IF;

  -- Invalid action
  RETURN QUERY SELECT 
    NULL::uuid, NULL::uuid, NULL::numeric, NULL::integer, NULL::jsonb,
    NULL::integer, NULL::integer, NULL::boolean, NULL::timestamptz, NULL::timestamptz,
    ARRAY['Invalid action specified']::text[] as validation_errors,
    'error'::text as action_performed;
END;
$$;


ALTER FUNCTION "public"."manage_user_preferences"("p_user_id" "uuid", "p_action" "text", "p_min_pay_rate" numeric, "p_max_travel_km" integer, "p_desired_roles" "jsonb", "p_max_hours_per_week" integer, "p_max_hours_per_shift" integer, "p_consider_lower_rate" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."request_user_payout_for_period"("target_user_id" "uuid", "period_start" "date", "period_end" "date") RETURNS TABLE("success" boolean, "message" "text", "payout_amount" numeric, "assignments_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$declare
  total_earnings numeric := 0;
  assignments_count integer := 0;
  assignment_record record;
begin
  -- Calculate earnings from completed assignments in the period
  for assignment_record in
    select 
      a.assignment_id,
      a.user_id,
      s.pay_rate,
      s.start_time,
      s.end_time,
      coalesce(a.break_hours, 0) as break_hours
    from assignments a
    join shifts s on a.shift_id = s.shift_id
    where a.user_id = target_user_id
      and a.status = (select status_id from status where name = 'completed')
      and a.check_in_time is not null
      and a.check_out_time is not null
      and date(s.start_time) between period_start and period_end
      and not exists (
        select 1 from payouts p where p.assignment_id = a.assignment_id
      )
  loop
    -- Calculate worked hours for this assignment
    declare
      worked_hours numeric;
      assignment_earnings numeric;
    begin
      worked_hours := extract(epoch from (assignment_record.end_time - assignment_record.start_time)) / 3600.0 - assignment_record.break_hours;
      assignment_earnings := worked_hours * assignment_record.pay_rate;
      
      -- Create individual payout record for this assignment
      insert into payouts (
        assignment_id,
        amount,
        start_time,
        end_time,
        break_hours,
        pay_rate
      ) values (
        assignment_record.assignment_id,
        assignment_earnings,
        assignment_record.start_time,
        assignment_record.end_time,
        assignment_record.break_hours,
        assignment_record.pay_rate
      );
      
      total_earnings := total_earnings + assignment_earnings;
      assignments_count := assignments_count + 1;
    end;
  end loop;
  
  -- Return results
  if assignments_count = 0 then
    return query select false, 'No completed assignments found for the specified period'::text, 0::numeric, 0::integer;
  else
    return query select true, format('Successfully processed %s assignments for $%s', assignments_count, total_earnings)::text, total_earnings, assignments_count;
  end if;
end;$_$;


ALTER FUNCTION "public"."request_user_payout_for_period"("target_user_id" "uuid", "period_start" "date", "period_end" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_assignment_status"("p_status_name" "text", "p_assignment_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("updated_count" integer, "payout_created" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  v_status_id INT;
  v_rows_affected INT := 0;
  v_payout_rows INT := 0;
  v_payout_created BOOLEAN := FALSE;
BEGIN
  -- Ensure assignment_id is provided
  IF p_assignment_id IS NULL THEN
    RAISE EXCEPTION 'Must provide assignment_id';
  END IF;

  -- Get status_id from status name
  SELECT status_id INTO v_status_id
  FROM public.status
  WHERE name = p_status_name;

  -- If invalid status name, raise error
  IF v_status_id IS NULL THEN
    RAISE EXCEPTION 'Invalid status name: %', p_status_name;
  END IF;

  -- Update assignment status
  UPDATE public.assignments
  SET status = v_status_id
  WHERE assignment_id = p_assignment_id;

  -- Count updated rows
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  -- If status is 'completed' and assignment was updated, process payout
  IF p_status_name = 'completed' AND v_rows_affected > 0 THEN
    WITH assignment_details AS (
      SELECT 
        a.assignment_id,
        a.user_id,
        s.start_time,
        s.end_time,
        COALESCE(a.break_hours, 0) AS break_hours,
        s.pay_rate,
        GREATEST(0,
          EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600.0 -
          COALESCE(a.break_hours, 0)
        ) AS worked_hours
      FROM public.assignments a
      JOIN public.shifts s ON a.shift_id = s.shift_id
      WHERE a.assignment_id = p_assignment_id
    ),
    payout_calculations AS (
      SELECT
        assignment_id,
        user_id,
        start_time,
        end_time,
        worked_hours,
        pay_rate,
        break_hours,
        ROUND(worked_hours * pay_rate, 2) AS calculated_amount
      FROM assignment_details
    )
    INSERT INTO public.payouts (
      assignment_id,
      amount,
      start_time,
      end_time,
      break_hours,
      pay_rate
    )
    SELECT
      assignment_id,
      calculated_amount,
      start_time,
      end_time,
      break_hours,
      pay_rate
    FROM payout_calculations
    ON CONFLICT (assignment_id) DO NOTHING;

    -- Check if any payouts were created
    GET DIAGNOSTICS v_payout_rows = ROW_COUNT;
    v_payout_created := v_payout_rows > 0;
  END IF;

  -- Return result
  RETURN QUERY SELECT v_rows_affected, v_payout_created;
END;$$;


ALTER FUNCTION "public"."update_assignment_status"("p_status_name" "text", "p_assignment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_job_seeker_rating"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$DECLARE
  avg_rating DECIMAL;
  reliability_penalty DECIMAL;
  job_seeker_user_id UUID;
  total_assignments INTEGER;
  cancelled_assignments INTEGER;
  no_show_assignments INTEGER;
  final_rating DECIMAL;
BEGIN
  -- Determine the job seeker user_id based on trigger source
  IF TG_TABLE_NAME = 'feedback' THEN
    -- Only process CLIENT_TO_EMPLOYEE feedback
    IF NEW.review_type != 'CLIENT_TO_EMPLOYEE' THEN
      RETURN NEW;
    END IF;
    
    -- Get the job seeker's user_id from the assignment
    SELECT a.user_id INTO job_seeker_user_id
    FROM public.assignments a
    WHERE a.assignment_id = NEW.assignment_id;
  ELSIF TG_TABLE_NAME = 'assignments' THEN
    -- Assignment status change
    job_seeker_user_id := NEW.user_id;
  ELSE
    RETURN NEW;
  END IF;
  
  -- Calculate average rating from feedback
  SELECT AVG(f.rating_score)::DECIMAL(3,2) INTO avg_rating
  FROM public.feedback f
  JOIN public.assignments a ON f.assignment_id = a.assignment_id
  WHERE a.user_id = job_seeker_user_id 
  AND f.review_type = 'CLIENT_TO_EMPLOYEE';
  
  -- Calculate reliability metrics
  SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN status = 7 THEN 1 END) as cancelled,
    COUNT(CASE WHEN status = 8 THEN 1 END) as no_shows
  INTO total_assignments, cancelled_assignments, no_show_assignments
  FROM public.assignments
  WHERE user_id = job_seeker_user_id;
  
  -- Calculate reliability penalty
  IF total_assignments > 0 THEN
    -- Each cancellation = 0.1 point penalty, each no-show = 0.3 point penalty
    reliability_penalty := (cancelled_assignments * 0.1) + (no_show_assignments * 0.3);
    -- Scale by assignment frequency to avoid penalizing new users too harshly
    reliability_penalty := reliability_penalty * LEAST(total_assignments::DECIMAL / 10.0, 1.0);
  ELSE
    reliability_penalty := 0.0;
  END IF;
  
  -- Combine rating and reliability (start with feedback rating, subtract reliability penalty)
  final_rating := COALESCE(avg_rating, 5.0) - reliability_penalty;
  
  -- Ensure rating stays within bounds (0.0 to 5.0)
  final_rating := GREATEST(0.0, LEAST(5.0, final_rating));
  
  -- Update the job seeker's rating
  UPDATE public.job_seekers 
  SET rating = final_rating
  WHERE user_id = job_seeker_user_id;
  
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."update_job_seeker_rating"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_shift"("p_shift_id" "uuid", "p_job_title" "text", "p_job_location" "text", "p_postal_code" integer, "p_job_description" "text", "p_job_requirements" "text", "p_pay_rate" numeric, "p_break_duration" numeric, "p_staff_needed" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) RETURNS TABLE("updated_shift_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Update the shift and return the shift_id
  RETURN QUERY
    UPDATE public.shifts
    SET
      title = p_job_title,
      description = p_job_description,
      start_time = p_start_time,
      end_time = p_end_time,
      pay_rate = p_pay_rate,
      job_location = p_job_location,
      staff_needed = p_staff_needed,
      break_duration = p_break_duration,
      requirements = p_job_requirements,
      postal_code = p_postal_code
    WHERE shift_id = p_shift_id
    RETURNING shift_id;
END;
$$;


ALTER FUNCTION "public"."update_shift"("p_shift_id" "uuid", "p_job_title" "text", "p_job_location" "text", "p_postal_code" integer, "p_job_description" "text", "p_job_requirements" "text", "p_pay_rate" numeric, "p_break_duration" numeric, "p_staff_needed" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_shift_status"("p_shift_id" "uuid", "p_status_name" "text") RETURNS TABLE("updated_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_status_id INT;
  v_rows_affected INT := 0;
BEGIN
  -- Ensure assignment_id is provided
  IF p_shift_id IS NULL THEN
    RAISE EXCEPTION 'Must provide shift_id';
  END IF;

  -- Get status_id from status name
  SELECT status_id INTO v_status_id
  FROM public.status
  WHERE name = p_status_name;

  -- If invalid status name, raise error
  IF v_status_id IS NULL THEN
    RAISE EXCEPTION 'Invalid status name: %', p_status_name;
  END IF;

  -- Update assignment status
  UPDATE public.shifts
  SET status = v_status_id
  WHERE shift_id = p_shift_id;

  -- Count updated rows
  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  -- If status is 'completed' and assignment was updated, process payout
  -- IF p_status_name = 'cancel_by_employer' AND v_rows_affected > 0 THEN
    
  -- END IF;

  -- Return result
  RETURN QUERY SELECT v_rows_affected;
END;
$$;


ALTER FUNCTION "public"."update_shift_status"("p_shift_id" "uuid", "p_status_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_staff_assigned"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$BEGIN
  -- Handle INSERT (new assignment)
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 5 THEN
      UPDATE public.shifts 
      SET staff_assigned = staff_assigned + 1 
      WHERE shift_id = NEW.shift_id;
    END IF;
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE (status change)
  IF TG_OP = 'UPDATE' THEN
    -- Assignment was confirmed
    IF OLD.status != 5 AND NEW.status = 5 THEN
      UPDATE public.shifts 
      SET staff_assigned = staff_assigned + 1 
      WHERE shift_id = NEW.shift_id;
    END IF;
    
    -- Assignment was cancelled/removed
    IF OLD.status = 5 AND NEW.status != 5 THEN
      UPDATE public.shifts 
      SET staff_assigned = staff_assigned - 1 
      WHERE shift_id = NEW.shift_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 5 THEN
      UPDATE public.shifts 
      SET staff_assigned = staff_assigned - 1 
      WHERE shift_id = OLD.shift_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;$$;


ALTER FUNCTION "public"."update_staff_assigned"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_phone_number" "text" DEFAULT NULL::"text", "p_address" "text" DEFAULT NULL::"text", "p_postal_code" "text" DEFAULT NULL::"text", "p_address_coordinates" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  is_jobseeker BOOLEAN;
  update_count INTEGER;
BEGIN
  -- Check if user is a job seeker
  SELECT EXISTS (SELECT 1 FROM job_seekers WHERE user_id = p_user_id) INTO is_jobseeker;
  
  IF is_jobseeker THEN
    -- Update job seeker profile
    UPDATE job_seekers 
    SET 
      phone_number = COALESCE(p_phone_number, phone_number),
      address = COALESCE(p_address, address),
      postal_code = COALESCE(p_postal_code, postal_code),
      address_coordinates = COALESCE(p_address_coordinates, address_coordinates),
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
  ELSE
    -- Update client profile
    UPDATE clients 
    SET 
      phone = COALESCE(p_phone_number, phone),
      address = COALESCE(p_address, address),
      postal_code = COALESCE(p_postal_code, postal_code),
      updated_at = NOW()
    WHERE client_id = p_user_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
  END IF;
  
  RETURN update_count > 0;
END;
$$;


ALTER FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_phone_number" "text", "p_address" "text", "p_postal_code" "text", "p_address_coordinates" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_user_preferences"("p_target_user_id" "uuid", "p_min_pay_rate" numeric, "p_max_travel_km" integer, "p_desired_roles" "jsonb", "p_max_hours_per_week" integer, "p_max_hours_per_shift" integer, "p_consider_lower_rate" boolean) RETURNS TABLE("preference_id" "uuid", "user_id" "uuid", "min_pay_rate" numeric, "max_travel_km" integer, "desired_roles" "jsonb", "max_hours_per_week" integer, "max_hours_per_shift" integer, "consider_lower_rate" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "validation_errors" "text"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  -- Validate that at least one job type is selected
  IF p_desired_roles IS NULL OR jsonb_array_length(p_desired_roles) = 0 THEN
    RETURN QUERY SELECT 
      NULL::uuid, NULL::uuid, NULL::numeric, NULL::integer, NULL::jsonb,
      NULL::integer, NULL::integer, NULL::boolean, NULL::timestamptz, NULL::timestamptz,
      ARRAY['Please select at least one preferred job type']::text[] as validation_errors;
    RETURN;
  END IF;

  -- Validate job names if provided
  IF NOT validate_job_names(
    ARRAY(SELECT jsonb_array_elements_text(p_desired_roles))
  ) THEN
    RETURN QUERY SELECT 
      NULL::uuid, NULL::uuid, NULL::numeric, NULL::integer, NULL::jsonb,
      NULL::integer, NULL::integer, NULL::boolean, NULL::timestamptz, NULL::timestamptz,
      ARRAY['One or more selected job types are invalid or inactive']::text[] as validation_errors;
    RETURN;
  END IF;

  -- Use constraint name to avoid ambiguity completely
  INSERT INTO public.preferences (
    user_id, min_pay_rate, max_travel_km, desired_roles,
    max_hours_per_week, max_hours_per_shift, consider_lower_rate,
    updated_at
  )
  VALUES (
    p_target_user_id, p_min_pay_rate, p_max_travel_km, p_desired_roles,
    p_max_hours_per_week, p_max_hours_per_shift, p_consider_lower_rate,
    NOW()
  )
  ON CONFLICT ON CONSTRAINT preferences_user_id_key
  DO UPDATE SET
    min_pay_rate = EXCLUDED.min_pay_rate,
    max_travel_km = EXCLUDED.max_travel_km,
    desired_roles = EXCLUDED.desired_roles,
    max_hours_per_week = EXCLUDED.max_hours_per_week,
    max_hours_per_shift = EXCLUDED.max_hours_per_shift,
    consider_lower_rate = EXCLUDED.consider_lower_rate,
    updated_at = NOW();

  -- Return the result
  RETURN QUERY
  SELECT 
    p.preference_id,
    p.user_id,
    p.min_pay_rate,
    p.max_travel_km,
    p.desired_roles,
    p.max_hours_per_week,
    p.max_hours_per_shift,
    p.consider_lower_rate,
    p.created_at,
    p.updated_at,
    '{}'::text[] as validation_errors
  FROM public.preferences p
  WHERE p.user_id = p_target_user_id;
END;$$;


ALTER FUNCTION "public"."upsert_user_preferences"("p_target_user_id" "uuid", "p_min_pay_rate" numeric, "p_max_travel_km" integer, "p_desired_roles" "jsonb", "p_max_hours_per_week" integer, "p_max_hours_per_shift" integer, "p_consider_lower_rate" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_job_names"("job_names" "text"[]) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Handle empty array case
  IF job_names IS NULL OR array_length(job_names, 1) = 0 THEN
    RETURN true;
  END IF;

  -- Check if all provided job names exist and are active
  RETURN (
    SELECT COUNT(*) = array_length(job_names, 1)
    FROM unnest(job_names) AS job_name
    JOIN job_types jt ON jt.type_name = job_name AND jt.is_active = true
  );
END;
$$;


ALTER FUNCTION "public"."validate_job_names"("job_names" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_job_names_detailed"("job_names" "text"[]) RETURNS TABLE("is_valid" boolean, "valid_names" "text"[], "invalid_names" "text"[], "inactive_names" "text"[])
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  valid_job_names text[];
  invalid_job_names text[];
  inactive_job_names text[];
BEGIN
  -- Handle empty array case
  IF job_names IS NULL OR array_length(job_names, 1) = 0 THEN
    RETURN QUERY SELECT true, '{}'::text[], '{}'::text[], '{}'::text[];
    RETURN;
  END IF;

  -- Get valid (active) job names
  SELECT array_agg(jt.type_name) INTO valid_job_names
  FROM unnest(job_names) AS job_name
  JOIN job_types jt ON jt.type_name = job_name AND jt.is_active = true;

  -- Get inactive job names (exist but not active)
  SELECT array_agg(jt.type_name) INTO inactive_job_names
  FROM unnest(job_names) AS job_name
  JOIN job_types jt ON jt.type_name = job_name AND jt.is_active = false;

  -- Get completely invalid job names (don't exist at all)
  SELECT array_agg(job_name) INTO invalid_job_names
  FROM unnest(job_names) AS job_name
  WHERE job_name NOT IN (SELECT type_name FROM job_types);

  -- Clean up null arrays
  valid_job_names := COALESCE(valid_job_names, '{}'::text[]);
  invalid_job_names := COALESCE(invalid_job_names, '{}'::text[]);
  inactive_job_names := COALESCE(inactive_job_names, '{}'::text[]);

  RETURN QUERY SELECT 
    (array_length(invalid_job_names, 1) = 0 OR invalid_job_names = '{}') AND 
    (array_length(inactive_job_names, 1) = 0 OR inactive_job_names = '{}'),
    valid_job_names,
    invalid_job_names,
    inactive_job_names;
END;
$$;


ALTER FUNCTION "public"."validate_job_names_detailed"("job_names" "text"[]) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."assignments" (
    "assignment_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "shift_id" "uuid" NOT NULL,
    "check_in_time" timestamp with time zone,
    "check_out_time" timestamp with time zone,
    "break_hours" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" integer NOT NULL,
    CONSTRAINT "assignments_break_hours_check" CHECK (("break_hours" >= (0)::numeric)),
    CONSTRAINT "valid_check_times" CHECK ((("check_out_time" IS NULL) OR ("check_out_time" > "check_in_time")))
);


ALTER TABLE "public"."assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."availability" (
    "availability_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "submission_cycle" character varying(50) DEFAULT 'PRIMARY'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "day_of_week" integer DEFAULT 1 NOT NULL,
    CONSTRAINT "availability_day_of_week_check" CHECK ((("day_of_week" >= 1) AND ("day_of_week" <= 7))),
    CONSTRAINT "availability_submission_cycle_check" CHECK ((("submission_cycle")::"text" = ANY (ARRAY[('PRIMARY'::character varying)::"text", ('SECONDARY'::character varying)::"text"]))),
    CONSTRAINT "valid_availability_times" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."availability" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."availability_templates" (
    "template_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "template_name" character varying(100) NOT NULL,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "timeblocks" "jsonb"[]
);


ALTER TABLE "public"."availability_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "client_id" "uuid" NOT NULL,
    "company_name" character varying(255) NOT NULL,
    "first_name" character varying(50),
    "last_name" character varying(50),
    "phone" character varying(20),
    "address" "text",
    "contact_email" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "postal_code" character varying(6),
    "office_number" character varying(20),
    CONSTRAINT "check_clients_postal_code_format" CHECK ((("postal_code" IS NULL) OR (("postal_code")::"text" ~ '^[0-9]{6}$'::"text")))
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "feedback_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assignment_id" "uuid" NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "reviewee_id" "uuid" NOT NULL,
    "rating_score" integer NOT NULL,
    "comment" "text",
    "review_type" character varying(50) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "feedback_rating_score_check" CHECK ((("rating_score" >= 1) AND ("rating_score" <= 5))),
    CONSTRAINT "feedback_review_type_check" CHECK ((("review_type")::"text" = ANY (ARRAY[('CLIENT_TO_EMPLOYEE'::character varying)::"text", ('EMPLOYEE_TO_CLIENT'::character varying)::"text"])))
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_categories" (
    "category_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_name" character varying(100) NOT NULL,
    "description" "text",
    "parent_category_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_seekers" (
    "user_id" "uuid" NOT NULL,
    "first_name" character varying(50) NOT NULL,
    "last_name" character varying(50) NOT NULL,
    "phone_number" character varying(20),
    "address_coordinates" character varying(255),
    "rating" numeric(3,2) DEFAULT 0.00,
    "client_id_internal" "uuid",
    "status" character varying(50) DEFAULT 'ACTIVE'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "date_of_birth" "date",
    "postal_code" character varying(6),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "address" "text",
    CONSTRAINT "check_job_seekers_postal_code_format" CHECK ((("postal_code" IS NULL) OR (("postal_code")::"text" ~ '^[0-9]{6}$'::"text"))),
    CONSTRAINT "job_seekers_rating_check" CHECK ((("rating" >= (0)::numeric) AND ("rating" <= (5)::numeric))),
    CONSTRAINT "job_seekers_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('ACTIVE'::character varying)::"text", ('SUSPENDED'::character varying)::"text", ('INACTIVE'::character varying)::"text"])))
);


ALTER TABLE "public"."job_seekers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_types" (
    "job_type_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type_name" character varying(100) NOT NULL,
    "category_id" "uuid" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payouts" (
    "payout_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "assignment_id" "uuid" NOT NULL,
    "pay_rate" numeric NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "break_hours" numeric,
    CONSTRAINT "payouts_amount_check" CHECK (("amount" >= (0)::numeric))
);


ALTER TABLE "public"."payouts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."preferences" (
    "preference_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "min_pay_rate" numeric(10,2) DEFAULT 0.00,
    "max_travel_km" integer DEFAULT 50,
    "desired_roles" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "max_hours_per_week" integer,
    "max_hours_per_shift" integer,
    "consider_lower_rate" boolean DEFAULT false,
    CONSTRAINT "preferences_max_hours_per_shift_check" CHECK ((("max_hours_per_shift" > 0) AND ("max_hours_per_shift" <= 12))),
    CONSTRAINT "preferences_max_hours_per_week_check" CHECK ((("max_hours_per_week" > 0) AND ("max_hours_per_week" <= 44))),
    CONSTRAINT "preferences_max_travel_km_check" CHECK (("max_travel_km" >= 0)),
    CONSTRAINT "preferences_min_pay_rate_check" CHECK (("min_pay_rate" >= (0)::numeric))
);


ALTER TABLE "public"."preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shifts" (
    "shift_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "uuid" NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "pay_rate" numeric(10,2) NOT NULL,
    "job_location" character varying(255) NOT NULL,
    "staff_needed" integer NOT NULL,
    "staff_assigned" integer DEFAULT 0,
    "status" integer DEFAULT 1 NOT NULL,
    "submission_cycle" character varying(50) DEFAULT 'PRIMARY'::character varying,
    "break_duration" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "job_type_id" "uuid" NOT NULL,
    "requirements" "text",
    "postal_code" bigint,
    CONSTRAINT "shifts_break_dur_check" CHECK (("break_duration" >= (0)::numeric)),
    CONSTRAINT "shifts_pay_rate_check" CHECK (("pay_rate" > (0)::numeric)),
    CONSTRAINT "shifts_staff_assigned_check" CHECK (("staff_assigned" >= 0)),
    CONSTRAINT "shifts_staff_needed_check" CHECK (("staff_needed" > 0)),
    CONSTRAINT "shifts_submission_cycle_check" CHECK ((("submission_cycle")::"text" = ANY (ARRAY[('PRIMARY'::character varying)::"text", ('SECONDARY'::character varying)::"text"]))),
    CONSTRAINT "valid_shift_times" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."shifts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."status" (
    "status_id" integer NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."status" OWNER TO "postgres";


ALTER TABLE "public"."status" ALTER COLUMN "status_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."status_status_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_pkey" PRIMARY KEY ("assignment_id");



ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_user_id_shift_id_key" UNIQUE ("user_id", "shift_id");



ALTER TABLE ONLY "public"."availability"
    ADD CONSTRAINT "availability_pkey" PRIMARY KEY ("availability_id");



ALTER TABLE ONLY "public"."availability_templates"
    ADD CONSTRAINT "availability_templates_pkey" PRIMARY KEY ("template_id");



ALTER TABLE ONLY "public"."availability_templates"
    ADD CONSTRAINT "availability_templates_user_id_template_name_key" UNIQUE ("user_id", "template_name");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("client_id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_assignment_id_reviewer_id_key" UNIQUE ("assignment_id", "reviewer_id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("feedback_id");



ALTER TABLE ONLY "public"."job_categories"
    ADD CONSTRAINT "job_categories_category_name_key" UNIQUE ("category_name");



ALTER TABLE ONLY "public"."job_categories"
    ADD CONSTRAINT "job_categories_pkey" PRIMARY KEY ("category_id");



ALTER TABLE ONLY "public"."job_seekers"
    ADD CONSTRAINT "job_seekers_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."job_types"
    ADD CONSTRAINT "job_types_pkey" PRIMARY KEY ("job_type_id");



ALTER TABLE ONLY "public"."job_types"
    ADD CONSTRAINT "job_types_type_name_category_id_key" UNIQUE ("type_name", "category_id");



ALTER TABLE ONLY "public"."payouts"
    ADD CONSTRAINT "payouts_assignment_id_key" UNIQUE ("assignment_id");



ALTER TABLE ONLY "public"."payouts"
    ADD CONSTRAINT "payouts_pkey" PRIMARY KEY ("payout_id");



ALTER TABLE ONLY "public"."preferences"
    ADD CONSTRAINT "preferences_pkey" PRIMARY KEY ("preference_id");



ALTER TABLE ONLY "public"."preferences"
    ADD CONSTRAINT "preferences_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_pkey" PRIMARY KEY ("shift_id");



ALTER TABLE ONLY "public"."status"
    ADD CONSTRAINT "status_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."status"
    ADD CONSTRAINT "status_pkey" PRIMARY KEY ("status_id");



ALTER TABLE ONLY "public"."status"
    ADD CONSTRAINT "status_status_id_key" UNIQUE ("status_id");



CREATE INDEX "idx_assignments_shift_id" ON "public"."assignments" USING "btree" ("shift_id");



CREATE INDEX "idx_assignments_user_id" ON "public"."assignments" USING "btree" ("user_id");



CREATE INDEX "idx_availability_day_of_week" ON "public"."availability" USING "btree" ("day_of_week");



CREATE INDEX "idx_availability_start_time" ON "public"."availability" USING "btree" ("start_time");



CREATE INDEX "idx_availability_submission_cycle" ON "public"."availability" USING "btree" ("submission_cycle");



CREATE INDEX "idx_availability_templates_user_id" ON "public"."availability_templates" USING "btree" ("user_id");



CREATE INDEX "idx_availability_user_id" ON "public"."availability" USING "btree" ("user_id");



CREATE INDEX "idx_clients_company_name" ON "public"."clients" USING "btree" ("company_name");



CREATE INDEX "idx_clients_email" ON "public"."clients" USING "btree" ("contact_email");



CREATE INDEX "idx_clients_postal_code" ON "public"."clients" USING "btree" ("postal_code");



CREATE INDEX "idx_feedback_assignment_id" ON "public"."feedback" USING "btree" ("assignment_id");



CREATE INDEX "idx_feedback_created_at" ON "public"."feedback" USING "btree" ("created_at");



CREATE INDEX "idx_feedback_review_type" ON "public"."feedback" USING "btree" ("review_type");



CREATE INDEX "idx_feedback_reviewee_id" ON "public"."feedback" USING "btree" ("reviewee_id");



CREATE INDEX "idx_feedback_reviewer_id" ON "public"."feedback" USING "btree" ("reviewer_id");



CREATE INDEX "idx_job_seekers_client_id_internal" ON "public"."job_seekers" USING "btree" ("client_id_internal");



CREATE INDEX "idx_job_seekers_postal_code" ON "public"."job_seekers" USING "btree" ("postal_code");



CREATE INDEX "idx_job_seekers_rating" ON "public"."job_seekers" USING "btree" ("rating");



CREATE INDEX "idx_job_seekers_status" ON "public"."job_seekers" USING "btree" ("status");



CREATE INDEX "idx_job_types_category_id" ON "public"."job_types" USING "btree" ("category_id");



CREATE INDEX "idx_payouts_created_at" ON "public"."payouts" USING "btree" ("created_at");



CREATE INDEX "idx_preferences_desired_roles_gin" ON "public"."preferences" USING "gin" ("desired_roles");



CREATE INDEX "idx_preferences_user_id" ON "public"."preferences" USING "btree" ("user_id");



CREATE INDEX "idx_shifts_client_id" ON "public"."shifts" USING "btree" ("client_id");



CREATE INDEX "idx_shifts_job_type_id" ON "public"."shifts" USING "btree" ("job_type_id");



CREATE INDEX "idx_shifts_staff_assigned" ON "public"."shifts" USING "btree" ("staff_assigned");



CREATE INDEX "idx_shifts_start_time" ON "public"."shifts" USING "btree" ("start_time");



CREATE INDEX "idx_shifts_status" ON "public"."shifts" USING "btree" ("status");



CREATE INDEX "idx_shifts_submission_cycle" ON "public"."shifts" USING "btree" ("submission_cycle");



CREATE OR REPLACE TRIGGER "trigger_auto_update_shift_status" AFTER UPDATE ON "public"."shifts" FOR EACH ROW EXECUTE FUNCTION "public"."auto_update_shift_status"();



CREATE OR REPLACE TRIGGER "trigger_update_rating_on_assignment" AFTER UPDATE ON "public"."assignments" FOR EACH ROW EXECUTE FUNCTION "public"."update_job_seeker_rating"();



CREATE OR REPLACE TRIGGER "trigger_update_rating_on_feedback" AFTER INSERT OR UPDATE ON "public"."feedback" FOR EACH ROW EXECUTE FUNCTION "public"."update_job_seeker_rating"();



CREATE OR REPLACE TRIGGER "trigger_update_staff_assigned" AFTER INSERT OR DELETE OR UPDATE ON "public"."assignments" FOR EACH ROW EXECUTE FUNCTION "public"."update_staff_assigned"();



ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_status_fkey" FOREIGN KEY ("status") REFERENCES "public"."status"("status_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."job_seekers"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."availability_templates"
    ADD CONSTRAINT "availability_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."job_seekers"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."availability"
    ADD CONSTRAINT "availability_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."job_seekers"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("assignment_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_categories"
    ADD CONSTRAINT "job_categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "public"."job_categories"("category_id");



ALTER TABLE ONLY "public"."job_seekers"
    ADD CONSTRAINT "job_seekers_client_id_internal_fkey" FOREIGN KEY ("client_id_internal") REFERENCES "public"."clients"("client_id");



ALTER TABLE ONLY "public"."job_seekers"
    ADD CONSTRAINT "job_seekers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_types"
    ADD CONSTRAINT "job_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."job_categories"("category_id");



ALTER TABLE ONLY "public"."payouts"
    ADD CONSTRAINT "payouts_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("assignment_id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."preferences"
    ADD CONSTRAINT "preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."job_seekers"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("client_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_job_type_id_fkey" FOREIGN KEY ("job_type_id") REFERENCES "public"."job_types"("job_type_id");



ALTER TABLE ONLY "public"."shifts"
    ADD CONSTRAINT "shifts_status_fkey" FOREIGN KEY ("status") REFERENCES "public"."status"("status_id") ON UPDATE CASCADE ON DELETE RESTRICT;



CREATE POLICY "Allow all for authenticated" ON "public"."availability" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow authenticated users to insert feedback" ON "public"."feedback" FOR INSERT WITH CHECK (("auth"."uid"() = "reviewer_id"));



CREATE POLICY "Allow delete if owner" ON "public"."feedback" FOR DELETE USING (("auth"."uid"() = "reviewer_id"));



CREATE POLICY "Allow inserts by authenticated Clients" ON "public"."shifts" FOR INSERT WITH CHECK (true);



CREATE POLICY "Clients can manage their own shifts" ON "public"."shifts" USING (true);



CREATE POLICY "Clients can view and manage assignments for their shifts" ON "public"."assignments" USING (true);



CREATE POLICY "Clients can view job seekers assigned to their shifts" ON "public"."job_seekers" FOR SELECT USING (true);



CREATE POLICY "Clients can view their own data" ON "public"."clients" USING ((( SELECT "auth"."uid"() AS "uid") = "client_id"));



CREATE POLICY "Enable read access for all users" ON "public"."status" FOR SELECT USING (true);



CREATE POLICY "Enable signup for service_role on clients" ON "public"."clients" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable signup for service_role on job_seekers" ON "public"."job_seekers" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable signup for service_role on preferences" ON "public"."preferences" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Job seekers can view and update their own assignments" ON "public"."assignments" USING (true);



CREATE POLICY "Job seekers can view and update their own data" ON "public"."job_seekers" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Job seekers can view client info for their shifts" ON "public"."clients" FOR SELECT USING (true);



CREATE POLICY "Job seekers can view open shifts and their assigned shifts" ON "public"."shifts" FOR SELECT USING (true);



CREATE POLICY "Job seekers can view their own payouts" ON "public"."payouts" FOR SELECT USING (true);



CREATE POLICY "Job seekers can view total earnings" ON "public"."payouts" FOR INSERT WITH CHECK (true);



CREATE POLICY "Service role can manage payouts for calculations" ON "public"."payouts" TO "service_role" WITH CHECK (true);



CREATE POLICY "Users can create feedback for their assignments" ON "public"."feedback" FOR INSERT WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "reviewer_id") AND (EXISTS ( SELECT 1
   FROM "public"."assignments" "a"
  WHERE (("a"."assignment_id" = "feedback"."assignment_id") AND (("a"."user_id" = ( SELECT "auth"."uid"() AS "uid")) OR (EXISTS ( SELECT 1
           FROM "public"."shifts" "s"
          WHERE (("s"."shift_id" = "a"."shift_id") AND ("s"."client_id" = ( SELECT "auth"."uid"() AS "uid")))))))))));



CREATE POLICY "Users can manage their own availability" ON "public"."availability" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can manage their own availability templates" ON "public"."availability_templates" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own preferences" ON "public"."preferences" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own feedback" ON "public"."feedback" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "reviewer_id") AND ("created_at" > ("now"() - '24:00:00'::interval)))) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "reviewer_id"));



CREATE POLICY "Users can view their own feedback" ON "public"."feedback" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "reviewer_id") OR (( SELECT "auth"."uid"() AS "uid") = "reviewee_id")));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."auto_update_shift_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_update_shift_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_update_shift_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_user_payout"("target_user_id" "uuid", "period_start" "date", "period_end" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_user_payout"("target_user_id" "uuid", "period_start" "date", "period_end" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_user_payout"("target_user_id" "uuid", "period_start" "date", "period_end" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_email_exists"("email_to_check" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_email_exists"("email_to_check" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_email_exists"("email_to_check" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_email_exists_comprehensive"("email_to_check" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_email_exists_comprehensive"("email_to_check" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_email_exists_comprehensive"("email_to_check" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_preferences"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_preferences"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_preferences"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_shift"("p_employer_id" "uuid", "job_title" "text", "job_location" "text", "postal_code" integer, "job_description" "text", "job_requirements" "text", "job_type" "text", "pay_rate" numeric, "break_duration" numeric, "staff_needed" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."create_shift"("p_employer_id" "uuid", "job_title" "text", "job_location" "text", "postal_code" integer, "job_description" "text", "job_requirements" "text", "job_type" "text", "pay_rate" numeric, "break_duration" numeric, "staff_needed" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_shift"("p_employer_id" "uuid", "job_title" "text", "job_location" "text", "postal_code" integer, "job_description" "text", "job_requirements" "text", "job_type" "text", "pay_rate" numeric, "break_duration" numeric, "staff_needed" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_user_payouts"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_user_payouts"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_user_payouts"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."find_matching_job_seekers"("p_shift_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."find_matching_job_seekers"("p_shift_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."find_matching_job_seekers"("p_shift_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_assignment_feedback"("p_assignment_id" "uuid", "p_reviewee_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_assignment_feedback"("p_assignment_id" "uuid", "p_reviewee_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_assignment_feedback"("p_assignment_id" "uuid", "p_reviewee_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_assignment_status_summary"("p_shift_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_assignment_status_summary"("p_shift_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_assignment_status_summary"("p_shift_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_assignments_by_jobseeker"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_assignments_by_jobseeker"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_assignments_by_jobseeker"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_assignments_by_shift"("p_shift_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_assignments_by_shift"("p_shift_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_assignments_by_shift"("p_shift_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_job_categories_with_types"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_job_categories_with_types"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_job_categories_with_types"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_shifts_by_employer"("p_employer_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_shifts_by_employer"("p_employer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_shifts_by_employer"("p_employer_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_details_from_assignment"("p_assignment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_details_from_assignment"("p_assignment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_details_from_assignment"("p_assignment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_location"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_location"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_location"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_payouts_by_time_range"("p_user_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_payouts_by_time_range"("p_user_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_payouts_by_time_range"("p_user_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_preferences_with_location"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_preferences_with_location"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_preferences_with_location"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_profile_data"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_profile_data"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_profile_data"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_total_earnings"("target_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_total_earnings"("target_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_total_earnings"("target_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_weekly_earnings_summary"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_weekly_earnings_summary"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_weekly_earnings_summary"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_assigned_to_shift"("p_shift_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_assigned_to_shift"("p_shift_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_assigned_to_shift"("p_shift_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."manage_user_preferences"("p_user_id" "uuid", "p_action" "text", "p_min_pay_rate" numeric, "p_max_travel_km" integer, "p_desired_roles" "jsonb", "p_max_hours_per_week" integer, "p_max_hours_per_shift" integer, "p_consider_lower_rate" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."manage_user_preferences"("p_user_id" "uuid", "p_action" "text", "p_min_pay_rate" numeric, "p_max_travel_km" integer, "p_desired_roles" "jsonb", "p_max_hours_per_week" integer, "p_max_hours_per_shift" integer, "p_consider_lower_rate" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."manage_user_preferences"("p_user_id" "uuid", "p_action" "text", "p_min_pay_rate" numeric, "p_max_travel_km" integer, "p_desired_roles" "jsonb", "p_max_hours_per_week" integer, "p_max_hours_per_shift" integer, "p_consider_lower_rate" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."request_user_payout_for_period"("target_user_id" "uuid", "period_start" "date", "period_end" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."request_user_payout_for_period"("target_user_id" "uuid", "period_start" "date", "period_end" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."request_user_payout_for_period"("target_user_id" "uuid", "period_start" "date", "period_end" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_assignment_status"("p_status_name" "text", "p_assignment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_assignment_status"("p_status_name" "text", "p_assignment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_assignment_status"("p_status_name" "text", "p_assignment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_job_seeker_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_job_seeker_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_job_seeker_rating"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_shift"("p_shift_id" "uuid", "p_job_title" "text", "p_job_location" "text", "p_postal_code" integer, "p_job_description" "text", "p_job_requirements" "text", "p_pay_rate" numeric, "p_break_duration" numeric, "p_staff_needed" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."update_shift"("p_shift_id" "uuid", "p_job_title" "text", "p_job_location" "text", "p_postal_code" integer, "p_job_description" "text", "p_job_requirements" "text", "p_pay_rate" numeric, "p_break_duration" numeric, "p_staff_needed" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_shift"("p_shift_id" "uuid", "p_job_title" "text", "p_job_location" "text", "p_postal_code" integer, "p_job_description" "text", "p_job_requirements" "text", "p_pay_rate" numeric, "p_break_duration" numeric, "p_staff_needed" integer, "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_shift_status"("p_shift_id" "uuid", "p_status_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_shift_status"("p_shift_id" "uuid", "p_status_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_shift_status"("p_shift_id" "uuid", "p_status_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_staff_assigned"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_staff_assigned"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_staff_assigned"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_phone_number" "text", "p_address" "text", "p_postal_code" "text", "p_address_coordinates" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_phone_number" "text", "p_address" "text", "p_postal_code" "text", "p_address_coordinates" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profile"("p_user_id" "uuid", "p_phone_number" "text", "p_address" "text", "p_postal_code" "text", "p_address_coordinates" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_user_preferences"("p_target_user_id" "uuid", "p_min_pay_rate" numeric, "p_max_travel_km" integer, "p_desired_roles" "jsonb", "p_max_hours_per_week" integer, "p_max_hours_per_shift" integer, "p_consider_lower_rate" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_user_preferences"("p_target_user_id" "uuid", "p_min_pay_rate" numeric, "p_max_travel_km" integer, "p_desired_roles" "jsonb", "p_max_hours_per_week" integer, "p_max_hours_per_shift" integer, "p_consider_lower_rate" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_user_preferences"("p_target_user_id" "uuid", "p_min_pay_rate" numeric, "p_max_travel_km" integer, "p_desired_roles" "jsonb", "p_max_hours_per_week" integer, "p_max_hours_per_shift" integer, "p_consider_lower_rate" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_job_names"("job_names" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."validate_job_names"("job_names" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_job_names"("job_names" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_job_names_detailed"("job_names" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."validate_job_names_detailed"("job_names" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_job_names_detailed"("job_names" "text"[]) TO "service_role";


















GRANT ALL ON TABLE "public"."assignments" TO "anon";
GRANT ALL ON TABLE "public"."assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."assignments" TO "service_role";



GRANT ALL ON TABLE "public"."availability" TO "anon";
GRANT ALL ON TABLE "public"."availability" TO "authenticated";
GRANT ALL ON TABLE "public"."availability" TO "service_role";



GRANT ALL ON TABLE "public"."availability_templates" TO "anon";
GRANT ALL ON TABLE "public"."availability_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."availability_templates" TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";



GRANT ALL ON TABLE "public"."job_categories" TO "anon";
GRANT ALL ON TABLE "public"."job_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."job_categories" TO "service_role";



GRANT ALL ON TABLE "public"."job_seekers" TO "anon";
GRANT ALL ON TABLE "public"."job_seekers" TO "authenticated";
GRANT ALL ON TABLE "public"."job_seekers" TO "service_role";



GRANT ALL ON TABLE "public"."job_types" TO "anon";
GRANT ALL ON TABLE "public"."job_types" TO "authenticated";
GRANT ALL ON TABLE "public"."job_types" TO "service_role";



GRANT ALL ON TABLE "public"."payouts" TO "anon";
GRANT ALL ON TABLE "public"."payouts" TO "authenticated";
GRANT ALL ON TABLE "public"."payouts" TO "service_role";



GRANT ALL ON TABLE "public"."preferences" TO "anon";
GRANT ALL ON TABLE "public"."preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."preferences" TO "service_role";



GRANT ALL ON TABLE "public"."shifts" TO "anon";
GRANT ALL ON TABLE "public"."shifts" TO "authenticated";
GRANT ALL ON TABLE "public"."shifts" TO "service_role";



GRANT ALL ON TABLE "public"."status" TO "anon";
GRANT ALL ON TABLE "public"."status" TO "authenticated";
GRANT ALL ON TABLE "public"."status" TO "service_role";



GRANT ALL ON SEQUENCE "public"."status_status_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."status_status_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."status_status_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
