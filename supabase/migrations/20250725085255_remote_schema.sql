alter table "public"."availability" drop constraint "availability_submission_cycle_check";

alter table "public"."feedback" drop constraint "feedback_review_type_check";

alter table "public"."job_seekers" drop constraint "job_seekers_status_check";

alter table "public"."shifts" drop constraint "shifts_submission_cycle_check";

drop function if exists "public"."upsert_user_preferences"(p_user_id uuid, p_min_pay_rate numeric, p_max_travel_km integer, p_desired_roles jsonb, p_max_hours_per_week integer, p_max_hours_per_shift integer, p_consider_lower_rate boolean);

drop function if exists "public"."create_default_preferences"(p_user_id uuid);

drop function if exists "public"."get_assignments_by_jobseeker"(p_user_id uuid);

drop function if exists "public"."get_assignments_by_shift"(p_shift_id uuid);

drop function if exists "public"."get_user_preferences_with_location"(p_user_id uuid);

alter table "public"."availability" add constraint "availability_submission_cycle_check" CHECK (((submission_cycle)::text = ANY ((ARRAY['PRIMARY'::character varying, 'SECONDARY'::character varying])::text[]))) not valid;

alter table "public"."availability" validate constraint "availability_submission_cycle_check";

alter table "public"."feedback" add constraint "feedback_review_type_check" CHECK (((review_type)::text = ANY ((ARRAY['CLIENT_TO_EMPLOYEE'::character varying, 'EMPLOYEE_TO_CLIENT'::character varying])::text[]))) not valid;

alter table "public"."feedback" validate constraint "feedback_review_type_check";

alter table "public"."job_seekers" add constraint "job_seekers_status_check" CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'SUSPENDED'::character varying, 'INACTIVE'::character varying])::text[]))) not valid;

alter table "public"."job_seekers" validate constraint "job_seekers_status_check";

alter table "public"."shifts" add constraint "shifts_submission_cycle_check" CHECK (((submission_cycle)::text = ANY ((ARRAY['PRIMARY'::character varying, 'SECONDARY'::character varying])::text[]))) not valid;

alter table "public"."shifts" validate constraint "shifts_submission_cycle_check";

set check_function_bodies = off;

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
 RETURNS TABLE(payout_id uuid, assignment_id uuid, amount numeric, payout_date timestamp with time zone, assignment_start_time timestamp with time zone, assignment_end_time timestamp with time zone, shift_title character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.payout_id,
    p.assignment_id,
    p.amount,
    p.created_at AS payout_date,
    s.start_time AS assignment_start_time,
    s.end_time as assignment_end_time,
    s.title AS shift_title
  FROM 
    public.payouts p
    JOIN public.assignments a ON p.assignment_id = a.assignment_id
    JOIN public.shifts s ON a.shift_id = s.shift_id
  WHERE 
    a.user_id = p_user_id
    AND s.start_time BETWEEN p_start_time AND p_end_time
  ORDER BY 
    s.start_time;
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


