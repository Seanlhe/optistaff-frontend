alter table "public"."availability" drop constraint "availability_submission_cycle_check";

alter table "public"."feedback" drop constraint "feedback_review_type_check";

alter table "public"."job_seekers" drop constraint "job_seekers_status_check";

alter table "public"."shifts" drop constraint "shifts_submission_cycle_check";

drop function if exists "public"."get_earnings_breakdown"(target_user_id uuid, period_start date, period_end date);

drop function if exists "public"."get_user_payouts_by_time_range"(p_user_id uuid, p_start_time timestamp with time zone, p_end_time timestamp with time zone);

alter table "public"."availability" add constraint "availability_submission_cycle_check" CHECK (((submission_cycle)::text = ANY ((ARRAY['PRIMARY'::character varying, 'SECONDARY'::character varying])::text[]))) not valid;

alter table "public"."availability" validate constraint "availability_submission_cycle_check";

alter table "public"."feedback" add constraint "feedback_review_type_check" CHECK (((review_type)::text = ANY ((ARRAY['CLIENT_TO_EMPLOYEE'::character varying, 'EMPLOYEE_TO_CLIENT'::character varying])::text[]))) not valid;

alter table "public"."feedback" validate constraint "feedback_review_type_check";

alter table "public"."job_seekers" add constraint "job_seekers_status_check" CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'SUSPENDED'::character varying, 'INACTIVE'::character varying])::text[]))) not valid;

alter table "public"."job_seekers" validate constraint "job_seekers_status_check";

alter table "public"."shifts" add constraint "shifts_submission_cycle_check" CHECK (((submission_cycle)::text = ANY ((ARRAY['PRIMARY'::character varying, 'SECONDARY'::character varying])::text[]))) not valid;

alter table "public"."shifts" validate constraint "shifts_submission_cycle_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_assignment_feedback(p_assignment_id uuid, p_reviewee_id uuid)
 RETURNS TABLE(feedback_id uuid, assignment_id uuid, reviewer_id uuid, reviewee_id uuid, rating_score integer, comment text, review_type character varying, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_weekly_earnings_summary(p_user_id uuid, p_start_date date, p_end_date date)
 RETURNS TABLE(assignment_id uuid, shift_id uuid, shift_title character varying, shift_start_time timestamp with time zone, shift_end_time timestamp with time zone, break_hours numeric, pay_rate numeric, scheduled_hours numeric, calculated_pay numeric, shift_date date, assignment_status text, is_completed boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_shift(p_shift_id uuid, p_job_title text, p_job_location text, p_postal_code integer, p_job_description text, p_job_requirements text, p_pay_rate numeric, p_break_duration numeric, p_staff_needed integer, p_start_time timestamp with time zone, p_end_time timestamp with time zone)
 RETURNS TABLE(updated_shift_id uuid)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_shift_status(p_shift_id uuid, p_status_name text)
 RETURNS TABLE(updated_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.auto_update_shift_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_user_payout(target_user_id uuid, period_start date, period_end date)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$DECLARE
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if email exists in the users table
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE LOWER(email) = LOWER(email_to_check)
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_email_exists_comprehensive(email_to_check text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if email exists in either auth.users or public.users
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE LOWER(email) = LOWER(email_to_check)
  ) OR EXISTS (
    SELECT 1 FROM public.users WHERE LOWER(email) = LOWER(email_to_check)
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_default_preferences(p_user_id uuid)
 RETURNS TABLE(preference_id uuid, user_id uuid, min_pay_rate numeric, max_travel_km integer, desired_roles jsonb, created_at timestamp with time zone, updated_at timestamp with time zone, max_hours_per_week integer, max_hours_per_shift integer, consider_lower_rate boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_shift(p_employer_id uuid, job_title text, job_location text, postal_code integer, job_description text, job_requirements text, job_type text, pay_rate numeric, break_duration numeric, staff_needed integer, p_start_time timestamp with time zone, p_end_time timestamp with time zone)
 RETURNS TABLE(created_shift_id uuid)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_user_payouts(target_user_id uuid)
 RETURNS TABLE(payout_id uuid, amount numeric, start_time timestamp with time zone, end_time timestamp with time zone, break_hours numeric, pay_rate numeric, assignment_id uuid, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.find_matching_job_seekers(p_shift_id uuid)
 RETURNS TABLE(user_id uuid, first_name character varying, last_name character varying, rating numeric, match_score numeric, preferred_categories text[], distance_km numeric)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_assignment_status_summary(p_shift_id uuid)
 RETURNS TABLE(status_name character varying, count integer)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_assignments_by_jobseeker(p_user_id uuid)
 RETURNS TABLE(assignment_id uuid, employee_name text, employee_id uuid, employer_name text, company_name text, job_title text, job_location text, job_description text, job_requirements text, job_type text, pay_rate double precision, start_time timestamp with time zone, end_time timestamp with time zone, break_hours integer, contact_number text, contact_email text, check_in_time timestamp with time zone, check_out_time timestamp with time zone, status text, created_at timestamp with time zone)
 LANGUAGE sql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_assignments_by_shift(p_shift_id uuid)
 RETURNS TABLE(assignment_id uuid, employee_name text, employee_id uuid, employer_name text, company_name text, job_title text, job_location text, job_description text, job_requirements text, job_type text, pay_rate double precision, start_time timestamp with time zone, end_time timestamp with time zone, break_hours integer, contact_number text, contact_email text, check_in_time timestamp with time zone, check_out_time timestamp with time zone, status text, created_at timestamp with time zone)
 LANGUAGE sql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_job_categories_with_types()
 RETURNS TABLE(category_id uuid, category_name character varying, job_types jsonb)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_shifts_by_employer(p_employer_id uuid)
 RETURNS TABLE(shift_id uuid, employer_name text, company_name text, job_title text, job_location text, postal_code integer, job_description text, job_requirements text, job_type text, pay_rate double precision, start_time timestamp with time zone, end_time timestamp with time zone, break_duration double precision, staff_needed integer, staff_assigned integer, submission_cycle text, status text, created_at timestamp with time zone)
 LANGUAGE sql
AS $function$

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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_details_from_assignment(p_assignment_id uuid)
 RETURNS TABLE(user_id uuid, first_name character varying, last_name character varying, full_name text, date_of_birth date, rating numeric)
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_location(p_user_id uuid)
 RETURNS TABLE(user_id uuid, address_coordinates character varying, postal_code character varying, address text, coordinates_lat numeric, coordinates_lng numeric, formatted_address text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_payouts_by_time_range(p_user_id uuid, p_start_time timestamp with time zone, p_end_time timestamp with time zone)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_preferences_with_location(p_user_id uuid)
 RETURNS TABLE(preference_id uuid, user_id uuid, min_pay_rate numeric, max_travel_km integer, desired_roles jsonb, max_hours_per_week integer, max_hours_per_shift integer, consider_lower_rate boolean, preferences_created_at timestamp with time zone, preferences_updated_at timestamp with time zone, address_coordinates character varying, postal_code character varying, address text, coordinates_lat numeric, coordinates_lng numeric, is_singapore_location boolean, formatted_address text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_profile_data(p_user_id uuid)
 RETURNS TABLE(user_role text, first_name text, last_name text, email text, phone_number text, address text, postal_code text, address_coordinates text, company_name text, rating numeric, status text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_total_earnings(target_user_id uuid)
 RETURNS numeric
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select coalesce(sum(p.amount), 0)
  from payouts p
  where p.assignment_id in (
    select a.assignment_id 
    from assignments a 
    where a.user_id = target_user_id
  );
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.is_user_assigned_to_shift(p_shift_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.manage_user_preferences(p_user_id uuid, p_action text, p_min_pay_rate numeric DEFAULT NULL::numeric, p_max_travel_km integer DEFAULT NULL::integer, p_desired_roles jsonb DEFAULT NULL::jsonb, p_max_hours_per_week integer DEFAULT NULL::integer, p_max_hours_per_shift integer DEFAULT NULL::integer, p_consider_lower_rate boolean DEFAULT NULL::boolean)
 RETURNS TABLE(preference_id uuid, user_id uuid, min_pay_rate numeric, max_travel_km integer, desired_roles jsonb, max_hours_per_week integer, max_hours_per_shift integer, consider_lower_rate boolean, created_at timestamp with time zone, updated_at timestamp with time zone, validation_errors text[], action_performed text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.request_user_payout_for_period(target_user_id uuid, period_start date, period_end date)
 RETURNS TABLE(success boolean, message text, payout_amount numeric, assignments_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$declare
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
end;$function$
;

CREATE OR REPLACE FUNCTION public.update_assignment_status(p_status_name text, p_assignment_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(updated_count integer, payout_created boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_job_seeker_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$DECLARE
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_staff_assigned()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$BEGIN
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_user_profile(p_user_id uuid, p_phone_number text DEFAULT NULL::text, p_address text DEFAULT NULL::text, p_postal_code text DEFAULT NULL::text, p_address_coordinates text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_user_preferences(p_target_user_id uuid, p_min_pay_rate numeric, p_max_travel_km integer, p_desired_roles jsonb, p_max_hours_per_week integer, p_max_hours_per_shift integer, p_consider_lower_rate boolean)
 RETURNS TABLE(preference_id uuid, user_id uuid, min_pay_rate numeric, max_travel_km integer, desired_roles jsonb, max_hours_per_week integer, max_hours_per_shift integer, consider_lower_rate boolean, created_at timestamp with time zone, updated_at timestamp with time zone, validation_errors text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.validate_job_names(job_names text[])
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_job_names_detailed(job_names text[])
 RETURNS TABLE(is_valid boolean, valid_names text[], invalid_names text[], inactive_names text[])
 LANGUAGE plpgsql
AS $function$
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
$function$
;


