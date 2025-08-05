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


