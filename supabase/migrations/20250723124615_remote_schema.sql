create table "public"."assignments" (
    "assignment_id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "shift_id" uuid not null,
    "check_in_time" timestamp with time zone,
    "check_out_time" timestamp with time zone,
    "break_hours" numeric,
    "created_at" timestamp with time zone not null default now(),
    "status" integer not null
);


create table "public"."availability" (
    "availability_id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "start_time" timestamp with time zone not null,
    "end_time" timestamp with time zone not null,
    "submission_cycle" character varying(50) default 'PRIMARY'::character varying,
    "created_at" timestamp with time zone not null default now(),
    "day_of_week" integer not null default 1
);


create table "public"."availability_templates" (
    "template_id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "template_name" character varying(100) not null,
    "is_default" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "timeblocks" jsonb[]
);


create table "public"."clients" (
    "client_id" uuid not null,
    "company_name" character varying(255) not null,
    "first_name" character varying(50),
    "last_name" character varying(50),
    "phone" character varying(20),
    "address" text,
    "contact_email" character varying(255) not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "postal_code" character varying(6),
    "office_number" character varying(20)
);


create table "public"."feedback" (
    "feedback_id" uuid not null default gen_random_uuid(),
    "assignment_id" uuid not null,
    "reviewer_id" uuid not null,
    "reviewee_id" uuid not null,
    "rating_score" integer not null,
    "comment" text,
    "review_type" character varying(50) not null,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."job_categories" (
    "category_id" uuid not null default gen_random_uuid(),
    "category_name" character varying(100) not null,
    "description" text,
    "parent_category_id" uuid,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."job_seekers" (
    "user_id" uuid not null,
    "first_name" character varying(50) not null,
    "last_name" character varying(50) not null,
    "phone_number" character varying(20),
    "address_coordinates" character varying(255),
    "rating" numeric(3,2) default 0.00,
    "client_id_internal" uuid,
    "status" character varying(50) default 'ACTIVE'::character varying,
    "created_at" timestamp with time zone not null default now(),
    "date_of_birth" date,
    "postal_code" character varying(6),
    "updated_at" timestamp with time zone default now(),
    "address" text
);


create table "public"."job_types" (
    "job_type_id" uuid not null default gen_random_uuid(),
    "type_name" character varying(100) not null,
    "category_id" uuid not null,
    "description" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."payouts" (
    "payout_id" uuid not null default gen_random_uuid(),
    "amount" numeric(10,2) not null,
    "created_at" timestamp with time zone not null default now(),
    "assignment_id" uuid not null,
    "pay_rate" numeric not null,
    "start_time" timestamp with time zone not null,
    "end_time" timestamp with time zone not null,
    "break_hours" numeric
);


create table "public"."preferences" (
    "preference_id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "min_pay_rate" numeric(10,2) default 0.00,
    "max_travel_km" integer default 50,
    "desired_roles" jsonb default '[]'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "max_hours_per_week" integer,
    "max_hours_per_shift" integer,
    "consider_lower_rate" boolean default false
);


create table "public"."shifts" (
    "shift_id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null,
    "title" character varying(255) not null,
    "description" text,
    "start_time" timestamp with time zone not null,
    "end_time" timestamp with time zone not null,
    "pay_rate" numeric(10,2) not null,
    "job_location" character varying(255) not null,
    "staff_needed" integer not null,
    "staff_assigned" integer default 0,
    "status" integer not null default 1,
    "submission_cycle" character varying(50) default 'PRIMARY'::character varying,
    "break_duration" numeric,
    "created_at" timestamp with time zone not null default now(),
    "job_type_id" uuid not null,
    "requirements" text,
    "postal_code" bigint
);


create table "public"."status" (
    "status_id" integer generated by default as identity not null,
    "name" text not null,
    "created_at" timestamp with time zone default now()
);


CREATE UNIQUE INDEX assignments_pkey ON public.assignments USING btree (assignment_id);

CREATE UNIQUE INDEX assignments_user_id_shift_id_key ON public.assignments USING btree (user_id, shift_id);

CREATE UNIQUE INDEX availability_pkey ON public.availability USING btree (availability_id);

CREATE UNIQUE INDEX availability_templates_pkey ON public.availability_templates USING btree (template_id);

CREATE UNIQUE INDEX availability_templates_user_id_template_name_key ON public.availability_templates USING btree (user_id, template_name);

CREATE UNIQUE INDEX clients_pkey ON public.clients USING btree (client_id);

CREATE UNIQUE INDEX feedback_assignment_id_reviewer_id_key ON public.feedback USING btree (assignment_id, reviewer_id);

CREATE UNIQUE INDEX feedback_pkey ON public.feedback USING btree (feedback_id);

CREATE INDEX idx_assignments_shift_id ON public.assignments USING btree (shift_id);

CREATE INDEX idx_assignments_user_id ON public.assignments USING btree (user_id);

CREATE INDEX idx_availability_day_of_week ON public.availability USING btree (day_of_week);

CREATE INDEX idx_availability_start_time ON public.availability USING btree (start_time);

CREATE INDEX idx_availability_submission_cycle ON public.availability USING btree (submission_cycle);

CREATE INDEX idx_availability_templates_user_id ON public.availability_templates USING btree (user_id);

CREATE INDEX idx_availability_user_id ON public.availability USING btree (user_id);

CREATE INDEX idx_clients_company_name ON public.clients USING btree (company_name);

CREATE INDEX idx_clients_email ON public.clients USING btree (contact_email);

CREATE INDEX idx_clients_postal_code ON public.clients USING btree (postal_code);

CREATE INDEX idx_feedback_assignment_id ON public.feedback USING btree (assignment_id);

CREATE INDEX idx_feedback_created_at ON public.feedback USING btree (created_at);

CREATE INDEX idx_feedback_review_type ON public.feedback USING btree (review_type);

CREATE INDEX idx_feedback_reviewee_id ON public.feedback USING btree (reviewee_id);

CREATE INDEX idx_feedback_reviewer_id ON public.feedback USING btree (reviewer_id);

CREATE INDEX idx_job_seekers_client_id_internal ON public.job_seekers USING btree (client_id_internal);

CREATE INDEX idx_job_seekers_postal_code ON public.job_seekers USING btree (postal_code);

CREATE INDEX idx_job_seekers_rating ON public.job_seekers USING btree (rating);

CREATE INDEX idx_job_seekers_status ON public.job_seekers USING btree (status);

CREATE INDEX idx_job_types_category_id ON public.job_types USING btree (category_id);

CREATE INDEX idx_payouts_created_at ON public.payouts USING btree (created_at);

CREATE INDEX idx_preferences_desired_roles_gin ON public.preferences USING gin (desired_roles);

CREATE INDEX idx_preferences_user_id ON public.preferences USING btree (user_id);

CREATE INDEX idx_shifts_client_id ON public.shifts USING btree (client_id);

CREATE INDEX idx_shifts_job_type_id ON public.shifts USING btree (job_type_id);

CREATE INDEX idx_shifts_staff_assigned ON public.shifts USING btree (staff_assigned);

CREATE INDEX idx_shifts_start_time ON public.shifts USING btree (start_time);

CREATE INDEX idx_shifts_status ON public.shifts USING btree (status);

CREATE INDEX idx_shifts_submission_cycle ON public.shifts USING btree (submission_cycle);

CREATE UNIQUE INDEX job_categories_category_name_key ON public.job_categories USING btree (category_name);

CREATE UNIQUE INDEX job_categories_pkey ON public.job_categories USING btree (category_id);

CREATE UNIQUE INDEX job_seekers_pkey ON public.job_seekers USING btree (user_id);

CREATE UNIQUE INDEX job_types_pkey ON public.job_types USING btree (job_type_id);

CREATE UNIQUE INDEX job_types_type_name_category_id_key ON public.job_types USING btree (type_name, category_id);

CREATE UNIQUE INDEX payouts_assignment_id_key ON public.payouts USING btree (assignment_id);

CREATE UNIQUE INDEX payouts_pkey ON public.payouts USING btree (payout_id);

CREATE UNIQUE INDEX preferences_pkey ON public.preferences USING btree (preference_id);

CREATE UNIQUE INDEX preferences_user_id_key ON public.preferences USING btree (user_id);

CREATE UNIQUE INDEX shifts_pkey ON public.shifts USING btree (shift_id);

CREATE UNIQUE INDEX status_name_key ON public.status USING btree (name);

CREATE UNIQUE INDEX status_pkey ON public.status USING btree (status_id);

CREATE UNIQUE INDEX status_status_id_key ON public.status USING btree (status_id);

alter table "public"."assignments" add constraint "assignments_pkey" PRIMARY KEY using index "assignments_pkey";

alter table "public"."availability" add constraint "availability_pkey" PRIMARY KEY using index "availability_pkey";

alter table "public"."availability_templates" add constraint "availability_templates_pkey" PRIMARY KEY using index "availability_templates_pkey";

alter table "public"."clients" add constraint "clients_pkey" PRIMARY KEY using index "clients_pkey";

alter table "public"."feedback" add constraint "feedback_pkey" PRIMARY KEY using index "feedback_pkey";

alter table "public"."job_categories" add constraint "job_categories_pkey" PRIMARY KEY using index "job_categories_pkey";

alter table "public"."job_seekers" add constraint "job_seekers_pkey" PRIMARY KEY using index "job_seekers_pkey";

alter table "public"."job_types" add constraint "job_types_pkey" PRIMARY KEY using index "job_types_pkey";

alter table "public"."payouts" add constraint "payouts_pkey" PRIMARY KEY using index "payouts_pkey";

alter table "public"."preferences" add constraint "preferences_pkey" PRIMARY KEY using index "preferences_pkey";

alter table "public"."shifts" add constraint "shifts_pkey" PRIMARY KEY using index "shifts_pkey";

alter table "public"."status" add constraint "status_pkey" PRIMARY KEY using index "status_pkey";

alter table "public"."assignments" add constraint "assignments_break_hours_check" CHECK ((break_hours >= (0)::numeric)) not valid;

alter table "public"."assignments" validate constraint "assignments_break_hours_check";

alter table "public"."assignments" add constraint "assignments_shift_id_fkey" FOREIGN KEY (shift_id) REFERENCES shifts(shift_id) ON DELETE CASCADE not valid;

alter table "public"."assignments" validate constraint "assignments_shift_id_fkey";

alter table "public"."assignments" add constraint "assignments_status_fkey" FOREIGN KEY (status) REFERENCES status(status_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."assignments" validate constraint "assignments_status_fkey";

alter table "public"."assignments" add constraint "assignments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES job_seekers(user_id) ON DELETE CASCADE not valid;

alter table "public"."assignments" validate constraint "assignments_user_id_fkey";

alter table "public"."assignments" add constraint "assignments_user_id_shift_id_key" UNIQUE using index "assignments_user_id_shift_id_key";

alter table "public"."assignments" add constraint "valid_check_times" CHECK (((check_out_time IS NULL) OR (check_out_time > check_in_time))) not valid;

alter table "public"."assignments" validate constraint "valid_check_times";

alter table "public"."availability" add constraint "availability_day_of_week_check" CHECK (((day_of_week >= 1) AND (day_of_week <= 7))) not valid;

alter table "public"."availability" validate constraint "availability_day_of_week_check";

alter table "public"."availability" add constraint "availability_submission_cycle_check" CHECK (((submission_cycle)::text = ANY ((ARRAY['PRIMARY'::character varying, 'SECONDARY'::character varying])::text[]))) not valid;

alter table "public"."availability" validate constraint "availability_submission_cycle_check";

alter table "public"."availability" add constraint "availability_user_id_fkey" FOREIGN KEY (user_id) REFERENCES job_seekers(user_id) ON DELETE CASCADE not valid;

alter table "public"."availability" validate constraint "availability_user_id_fkey";

alter table "public"."availability" add constraint "valid_availability_times" CHECK ((end_time > start_time)) not valid;

alter table "public"."availability" validate constraint "valid_availability_times";

alter table "public"."availability_templates" add constraint "availability_templates_user_id_fkey" FOREIGN KEY (user_id) REFERENCES job_seekers(user_id) ON DELETE CASCADE not valid;

alter table "public"."availability_templates" validate constraint "availability_templates_user_id_fkey";

alter table "public"."availability_templates" add constraint "availability_templates_user_id_template_name_key" UNIQUE using index "availability_templates_user_id_template_name_key";

alter table "public"."clients" add constraint "check_clients_postal_code_format" CHECK (((postal_code IS NULL) OR ((postal_code)::text ~ '^[0-9]{6}$'::text))) not valid;

alter table "public"."clients" validate constraint "check_clients_postal_code_format";

alter table "public"."clients" add constraint "clients_client_id_fkey" FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."clients" validate constraint "clients_client_id_fkey";

alter table "public"."feedback" add constraint "feedback_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE not valid;

alter table "public"."feedback" validate constraint "feedback_assignment_id_fkey";

alter table "public"."feedback" add constraint "feedback_assignment_id_reviewer_id_key" UNIQUE using index "feedback_assignment_id_reviewer_id_key";

alter table "public"."feedback" add constraint "feedback_rating_score_check" CHECK (((rating_score >= 1) AND (rating_score <= 5))) not valid;

alter table "public"."feedback" validate constraint "feedback_rating_score_check";

alter table "public"."feedback" add constraint "feedback_review_type_check" CHECK (((review_type)::text = ANY ((ARRAY['CLIENT_TO_EMPLOYEE'::character varying, 'EMPLOYEE_TO_CLIENT'::character varying])::text[]))) not valid;

alter table "public"."feedback" validate constraint "feedback_review_type_check";

alter table "public"."feedback" add constraint "feedback_reviewee_id_fkey" FOREIGN KEY (reviewee_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."feedback" validate constraint "feedback_reviewee_id_fkey";

alter table "public"."feedback" add constraint "feedback_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."feedback" validate constraint "feedback_reviewer_id_fkey";

alter table "public"."job_categories" add constraint "job_categories_category_name_key" UNIQUE using index "job_categories_category_name_key";

alter table "public"."job_categories" add constraint "job_categories_parent_category_id_fkey" FOREIGN KEY (parent_category_id) REFERENCES job_categories(category_id) not valid;

alter table "public"."job_categories" validate constraint "job_categories_parent_category_id_fkey";

alter table "public"."job_seekers" add constraint "check_job_seekers_postal_code_format" CHECK (((postal_code IS NULL) OR ((postal_code)::text ~ '^[0-9]{6}$'::text))) not valid;

alter table "public"."job_seekers" validate constraint "check_job_seekers_postal_code_format";

alter table "public"."job_seekers" add constraint "job_seekers_client_id_internal_fkey" FOREIGN KEY (client_id_internal) REFERENCES clients(client_id) not valid;

alter table "public"."job_seekers" validate constraint "job_seekers_client_id_internal_fkey";

alter table "public"."job_seekers" add constraint "job_seekers_rating_check" CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric))) not valid;

alter table "public"."job_seekers" validate constraint "job_seekers_rating_check";

alter table "public"."job_seekers" add constraint "job_seekers_status_check" CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'SUSPENDED'::character varying, 'INACTIVE'::character varying])::text[]))) not valid;

alter table "public"."job_seekers" validate constraint "job_seekers_status_check";

alter table "public"."job_seekers" add constraint "job_seekers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."job_seekers" validate constraint "job_seekers_user_id_fkey";

alter table "public"."job_types" add constraint "job_types_category_id_fkey" FOREIGN KEY (category_id) REFERENCES job_categories(category_id) not valid;

alter table "public"."job_types" validate constraint "job_types_category_id_fkey";

alter table "public"."job_types" add constraint "job_types_type_name_category_id_key" UNIQUE using index "job_types_type_name_category_id_key";

alter table "public"."payouts" add constraint "payouts_amount_check" CHECK ((amount >= (0)::numeric)) not valid;

alter table "public"."payouts" validate constraint "payouts_amount_check";

alter table "public"."payouts" add constraint "payouts_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."payouts" validate constraint "payouts_assignment_id_fkey";

alter table "public"."payouts" add constraint "payouts_assignment_id_key" UNIQUE using index "payouts_assignment_id_key";

alter table "public"."preferences" add constraint "preferences_max_hours_per_shift_check" CHECK (((max_hours_per_shift > 0) AND (max_hours_per_shift <= 12))) not valid;

alter table "public"."preferences" validate constraint "preferences_max_hours_per_shift_check";

alter table "public"."preferences" add constraint "preferences_max_hours_per_week_check" CHECK (((max_hours_per_week > 0) AND (max_hours_per_week <= 44))) not valid;

alter table "public"."preferences" validate constraint "preferences_max_hours_per_week_check";

alter table "public"."preferences" add constraint "preferences_max_travel_km_check" CHECK ((max_travel_km >= 0)) not valid;

alter table "public"."preferences" validate constraint "preferences_max_travel_km_check";

alter table "public"."preferences" add constraint "preferences_min_pay_rate_check" CHECK ((min_pay_rate >= (0)::numeric)) not valid;

alter table "public"."preferences" validate constraint "preferences_min_pay_rate_check";

alter table "public"."preferences" add constraint "preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES job_seekers(user_id) ON DELETE CASCADE not valid;

alter table "public"."preferences" validate constraint "preferences_user_id_fkey";

alter table "public"."preferences" add constraint "preferences_user_id_key" UNIQUE using index "preferences_user_id_key";

alter table "public"."shifts" add constraint "shifts_break_dur_check" CHECK ((break_duration >= (0)::numeric)) not valid;

alter table "public"."shifts" validate constraint "shifts_break_dur_check";

alter table "public"."shifts" add constraint "shifts_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE not valid;

alter table "public"."shifts" validate constraint "shifts_client_id_fkey";

alter table "public"."shifts" add constraint "shifts_job_type_id_fkey" FOREIGN KEY (job_type_id) REFERENCES job_types(job_type_id) not valid;

alter table "public"."shifts" validate constraint "shifts_job_type_id_fkey";

alter table "public"."shifts" add constraint "shifts_pay_rate_check" CHECK ((pay_rate > (0)::numeric)) not valid;

alter table "public"."shifts" validate constraint "shifts_pay_rate_check";

alter table "public"."shifts" add constraint "shifts_staff_assigned_check" CHECK ((staff_assigned >= 0)) not valid;

alter table "public"."shifts" validate constraint "shifts_staff_assigned_check";

alter table "public"."shifts" add constraint "shifts_staff_needed_check" CHECK ((staff_needed > 0)) not valid;

alter table "public"."shifts" validate constraint "shifts_staff_needed_check";

alter table "public"."shifts" add constraint "shifts_status_fkey" FOREIGN KEY (status) REFERENCES status(status_id) ON UPDATE CASCADE ON DELETE RESTRICT not valid;

alter table "public"."shifts" validate constraint "shifts_status_fkey";

alter table "public"."shifts" add constraint "shifts_submission_cycle_check" CHECK (((submission_cycle)::text = ANY ((ARRAY['PRIMARY'::character varying, 'SECONDARY'::character varying])::text[]))) not valid;

alter table "public"."shifts" validate constraint "shifts_submission_cycle_check";

alter table "public"."shifts" add constraint "valid_shift_times" CHECK ((end_time > start_time)) not valid;

alter table "public"."shifts" validate constraint "valid_shift_times";

alter table "public"."status" add constraint "status_name_key" UNIQUE using index "status_name_key";

alter table "public"."status" add constraint "status_status_id_key" UNIQUE using index "status_status_id_key";

set check_function_bodies = off;

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
AS $function$
DECLARE
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
    AND a.status = 'COMPLETED'
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
END;
$function$
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
 RETURNS TABLE(preference_id uuid, user_id uuid, min_pay_rate numeric, max_travel_km integer, desired_roles jsonb, max_hours_per_week integer, max_hours_per_shift integer, consider_lower_rate boolean, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  INSERT INTO public.preferences (
    user_id, min_pay_rate, max_travel_km, desired_roles,
    max_hours_per_week, max_hours_per_shift, consider_lower_rate
  )
  VALUES (
    p_user_id, 15, 15, '[]'::JSONB, 40, 8, false
  )
  ON CONFLICT (user_id) DO NOTHING
  RETURNING *;
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
 RETURNS TABLE(assignment_id uuid, employee_name text, employee_id uuid, employer_name text, job_title text, job_location text, job_description text, job_requirements text, job_type text, pay_rate double precision, start_time timestamp with time zone, end_time timestamp with time zone, break_hours integer, contact_number text, contact_email text, check_in_time timestamp with time zone, check_out_time timestamp with time zone, status text, created_at timestamp with time zone)
 LANGUAGE sql
AS $function$
SELECT
a.assignment_id, 
CONCAT_WS(' ', j.last_name, j.first_name) as employee_name,
a.user_id,
CONCAT_WS(' ', c.last_name, c.first_name) as employer_name,
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
 RETURNS TABLE(assignment_id uuid, employee_name text, employee_id uuid, employer_name text, job_title text, job_location text, job_description text, job_requirements text, job_type text, pay_rate double precision, start_time timestamp with time zone, end_time timestamp with time zone, break_hours integer, contact_number text, contact_email text, check_in_time timestamp with time zone, check_out_time timestamp with time zone, status text, created_at timestamp with time zone)
 LANGUAGE sql
AS $function$
SELECT
a.assignment_id, 
CONCAT_WS(' ', j.last_name, j.first_name) as employee_name,
a.user_id,
CONCAT_WS(' ', c.last_name, c.first_name) as employer_name,
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

CREATE OR REPLACE FUNCTION public.get_earnings_breakdown(target_user_id uuid, period_start date, period_end date)
 RETURNS TABLE(shift_id uuid, title character varying, work_date date, hours_worked numeric, pay_rate numeric, total_earned numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.shift_id,
    s.title,
    DATE(a.check_in_time),
    EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time))/3600 - a.break_hours,
    s.pay_rate,
    (EXTRACT(EPOCH FROM (a.check_out_time - a.check_in_time))/3600 - a.break_hours) * s.pay_rate
  FROM public.assignments a
  JOIN public.shifts s ON a.shift_id = s.shift_id
  WHERE a.user_id = target_user_id
    AND a.status = 'COMPLETED'
    AND a.check_in_time IS NOT NULL
    AND a.check_out_time IS NOT NULL
    AND DATE(a.check_in_time) BETWEEN period_start AND period_end
  ORDER BY a.check_in_time;
END;
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

CREATE OR REPLACE FUNCTION public.get_user_preferences_with_location(p_user_id uuid)
 RETURNS TABLE(preference_id uuid, user_id uuid, min_pay_rate numeric, max_travel_km integer, desired_roles jsonb, max_hours_per_week integer, max_hours_per_shift integer, consider_lower_rate boolean, preferences_created_at timestamp with time zone, preferences_updated_at timestamp with time zone, address_coordinates character varying, postal_code character varying, coordinates_lat numeric, coordinates_lng numeric, is_singapore_location boolean)
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
    -- Parse coordinates
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
    -- Validate Singapore bounds
    CASE 
      WHEN js.address_coordinates IS NOT NULL AND js.address_coordinates LIKE '%,%' THEN
        (split_part(js.address_coordinates, ',', 1)::NUMERIC BETWEEN 1.2290 AND 1.4784) AND
        (split_part(js.address_coordinates, ',', 2)::NUMERIC BETWEEN 103.6000 AND 104.0120)
      ELSE FALSE
    END as is_singapore_location
  FROM public.preferences p
  LEFT JOIN public.job_seekers js ON p.user_id = js.user_id
  WHERE p.user_id = p_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_profile_data(p_user_id uuid)
 RETURNS TABLE(user_role text, first_name text, last_name text, email text, phone_number text, address text, postal_code text, address_coordinates text, company_name text, rating numeric, status text, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check if user is a job seeker
  IF EXISTS (SELECT 1 FROM job_seekers WHERE user_id = p_user_id) THEN
    RETURN QUERY
    SELECT 
      'jobseeker'::TEXT as user_role,
      js.first_name,
      js.last_name,
      au.email,
      js.phone_number,
      js.address,
      js.postal_code,
      js.address_coordinates,
      NULL::TEXT as company_name,
      js.rating,
      js.status,
      au.created_at
    FROM job_seekers js
    JOIN auth.users au ON js.user_id = au.id
    WHERE js.user_id = p_user_id;
    
  -- Check if user is a client/employer
  ELSIF EXISTS (SELECT 1 FROM clients WHERE client_id = p_user_id) THEN
    RETURN QUERY
    SELECT 
      'employer'::TEXT as user_role,
      c.first_name,
      c.last_name,
      au.email,
      c.phone as phone_number,
      c.address,
      c.postal_code,
      NULL::TEXT as address_coordinates,
      c.company_name,
      NULL::NUMERIC as rating,
      NULL::TEXT as status,
      au.created_at
    FROM clients c
    JOIN auth.users au ON c.client_id = au.id
    WHERE c.client_id = p_user_id;
  END IF;
END;
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

CREATE OR REPLACE FUNCTION public.upsert_user_preferences(p_user_id uuid, p_min_pay_rate numeric, p_max_travel_km integer, p_desired_roles jsonb, p_max_hours_per_week integer, p_max_hours_per_shift integer, p_consider_lower_rate boolean)
 RETURNS TABLE(preference_id uuid, user_id uuid, min_pay_rate numeric, max_travel_km integer, desired_roles jsonb, max_hours_per_week integer, max_hours_per_shift integer, consider_lower_rate boolean, created_at timestamp with time zone, updated_at timestamp with time zone, validation_errors text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  validation_errors TEXT[] := '{}';
  job_name TEXT;
  valid_job_count INTEGER;
  result_record RECORD;
BEGIN
  -- Validate business rules
  IF p_min_pay_rate < 0 THEN
    validation_errors := array_append(validation_errors, 'Minimum pay rate must be non-negative');
  END IF;
  
  IF p_max_travel_km < 0 THEN
    validation_errors := array_append(validation_errors, 'Maximum travel distance must be non-negative');
  END IF;
  
  IF p_max_hours_per_week <= 0 OR p_max_hours_per_week > 44 THEN
    validation_errors := array_append(validation_errors, 'Maximum hours per week must be between 1 and 44');
  END IF;
  
  IF p_max_hours_per_shift <= 0 OR p_max_hours_per_shift > 12 THEN
    validation_errors := array_append(validation_errors, 'Maximum hours per shift must be between 1 and 12');
  END IF;
  
  -- Validate job types exist and are active
  IF jsonb_array_length(p_desired_roles) > 0 THEN
    -- Check if all job names exist and are active
    SELECT COUNT(*)
    INTO valid_job_count
    FROM job_types jt
    WHERE jt.type_name = ANY(
      SELECT jsonb_array_elements_text(p_desired_roles)
    )
    AND jt.is_active = true;
    
    -- If count doesn't match array length, some job types are invalid
    IF valid_job_count != jsonb_array_length(p_desired_roles) THEN
      validation_errors := array_append(validation_errors, 'One or more selected job types are invalid or inactive');
    END IF;
  END IF;
  
  -- Return validation errors if any
  IF array_length(validation_errors, 1) > 0 THEN
    RETURN QUERY SELECT 
      NULL::UUID, NULL::UUID, NULL::NUMERIC, NULL::INTEGER, NULL::JSONB,
      NULL::INTEGER, NULL::INTEGER, NULL::BOOLEAN, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ,
      validation_errors;
    RETURN;
  END IF;
  
  -- Upsert preferences
  INSERT INTO public.preferences (
    user_id, min_pay_rate, max_travel_km, desired_roles,
    max_hours_per_week, max_hours_per_shift, consider_lower_rate,
    updated_at
  )
  VALUES (
    p_user_id, p_min_pay_rate, p_max_travel_km, p_desired_roles,
    p_max_hours_per_week, p_max_hours_per_shift, p_consider_lower_rate,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    min_pay_rate = EXCLUDED.min_pay_rate,
    max_travel_km = EXCLUDED.max_travel_km,
    desired_roles = EXCLUDED.desired_roles,
    max_hours_per_week = EXCLUDED.max_hours_per_week,
    max_hours_per_shift = EXCLUDED.max_hours_per_shift,
    consider_lower_rate = EXCLUDED.consider_lower_rate,
    updated_at = NOW()
  RETURNING *
  INTO result_record;
  
  -- Return successful result
  RETURN QUERY SELECT 
    result_record.preference_id,
    result_record.user_id,
    result_record.min_pay_rate,
    result_record.max_travel_km,
    result_record.desired_roles,
    result_record.max_hours_per_week,
    result_record.max_hours_per_shift,
    result_record.consider_lower_rate,
    result_record.created_at,
    result_record.updated_at,
    '{}'::TEXT[] as validation_errors;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_job_names(job_names text[])
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check if all provided job names exist and are active
  RETURN (
    SELECT COUNT(*) = array_length(job_names, 1)
    FROM unnest(job_names) AS job_name
    JOIN job_types jt ON jt.type_name = job_name AND jt.is_active = true
  );
END;
$function$
;

grant delete on table "public"."assignments" to "anon";

grant insert on table "public"."assignments" to "anon";

grant references on table "public"."assignments" to "anon";

grant select on table "public"."assignments" to "anon";

grant trigger on table "public"."assignments" to "anon";

grant truncate on table "public"."assignments" to "anon";

grant update on table "public"."assignments" to "anon";

grant delete on table "public"."assignments" to "authenticated";

grant insert on table "public"."assignments" to "authenticated";

grant references on table "public"."assignments" to "authenticated";

grant select on table "public"."assignments" to "authenticated";

grant trigger on table "public"."assignments" to "authenticated";

grant truncate on table "public"."assignments" to "authenticated";

grant update on table "public"."assignments" to "authenticated";

grant delete on table "public"."assignments" to "service_role";

grant insert on table "public"."assignments" to "service_role";

grant references on table "public"."assignments" to "service_role";

grant select on table "public"."assignments" to "service_role";

grant trigger on table "public"."assignments" to "service_role";

grant truncate on table "public"."assignments" to "service_role";

grant update on table "public"."assignments" to "service_role";

grant delete on table "public"."availability" to "anon";

grant insert on table "public"."availability" to "anon";

grant references on table "public"."availability" to "anon";

grant select on table "public"."availability" to "anon";

grant trigger on table "public"."availability" to "anon";

grant truncate on table "public"."availability" to "anon";

grant update on table "public"."availability" to "anon";

grant delete on table "public"."availability" to "authenticated";

grant insert on table "public"."availability" to "authenticated";

grant references on table "public"."availability" to "authenticated";

grant select on table "public"."availability" to "authenticated";

grant trigger on table "public"."availability" to "authenticated";

grant truncate on table "public"."availability" to "authenticated";

grant update on table "public"."availability" to "authenticated";

grant delete on table "public"."availability" to "service_role";

grant insert on table "public"."availability" to "service_role";

grant references on table "public"."availability" to "service_role";

grant select on table "public"."availability" to "service_role";

grant trigger on table "public"."availability" to "service_role";

grant truncate on table "public"."availability" to "service_role";

grant update on table "public"."availability" to "service_role";

grant delete on table "public"."availability_templates" to "anon";

grant insert on table "public"."availability_templates" to "anon";

grant references on table "public"."availability_templates" to "anon";

grant select on table "public"."availability_templates" to "anon";

grant trigger on table "public"."availability_templates" to "anon";

grant truncate on table "public"."availability_templates" to "anon";

grant update on table "public"."availability_templates" to "anon";

grant delete on table "public"."availability_templates" to "authenticated";

grant insert on table "public"."availability_templates" to "authenticated";

grant references on table "public"."availability_templates" to "authenticated";

grant select on table "public"."availability_templates" to "authenticated";

grant trigger on table "public"."availability_templates" to "authenticated";

grant truncate on table "public"."availability_templates" to "authenticated";

grant update on table "public"."availability_templates" to "authenticated";

grant delete on table "public"."availability_templates" to "service_role";

grant insert on table "public"."availability_templates" to "service_role";

grant references on table "public"."availability_templates" to "service_role";

grant select on table "public"."availability_templates" to "service_role";

grant trigger on table "public"."availability_templates" to "service_role";

grant truncate on table "public"."availability_templates" to "service_role";

grant update on table "public"."availability_templates" to "service_role";

grant delete on table "public"."clients" to "anon";

grant insert on table "public"."clients" to "anon";

grant references on table "public"."clients" to "anon";

grant select on table "public"."clients" to "anon";

grant trigger on table "public"."clients" to "anon";

grant truncate on table "public"."clients" to "anon";

grant update on table "public"."clients" to "anon";

grant delete on table "public"."clients" to "authenticated";

grant insert on table "public"."clients" to "authenticated";

grant references on table "public"."clients" to "authenticated";

grant select on table "public"."clients" to "authenticated";

grant trigger on table "public"."clients" to "authenticated";

grant truncate on table "public"."clients" to "authenticated";

grant update on table "public"."clients" to "authenticated";

grant delete on table "public"."clients" to "service_role";

grant insert on table "public"."clients" to "service_role";

grant references on table "public"."clients" to "service_role";

grant select on table "public"."clients" to "service_role";

grant trigger on table "public"."clients" to "service_role";

grant truncate on table "public"."clients" to "service_role";

grant update on table "public"."clients" to "service_role";

grant delete on table "public"."feedback" to "anon";

grant insert on table "public"."feedback" to "anon";

grant references on table "public"."feedback" to "anon";

grant select on table "public"."feedback" to "anon";

grant trigger on table "public"."feedback" to "anon";

grant truncate on table "public"."feedback" to "anon";

grant update on table "public"."feedback" to "anon";

grant delete on table "public"."feedback" to "authenticated";

grant insert on table "public"."feedback" to "authenticated";

grant references on table "public"."feedback" to "authenticated";

grant select on table "public"."feedback" to "authenticated";

grant trigger on table "public"."feedback" to "authenticated";

grant truncate on table "public"."feedback" to "authenticated";

grant update on table "public"."feedback" to "authenticated";

grant delete on table "public"."feedback" to "service_role";

grant insert on table "public"."feedback" to "service_role";

grant references on table "public"."feedback" to "service_role";

grant select on table "public"."feedback" to "service_role";

grant trigger on table "public"."feedback" to "service_role";

grant truncate on table "public"."feedback" to "service_role";

grant update on table "public"."feedback" to "service_role";

grant delete on table "public"."job_categories" to "anon";

grant insert on table "public"."job_categories" to "anon";

grant references on table "public"."job_categories" to "anon";

grant select on table "public"."job_categories" to "anon";

grant trigger on table "public"."job_categories" to "anon";

grant truncate on table "public"."job_categories" to "anon";

grant update on table "public"."job_categories" to "anon";

grant delete on table "public"."job_categories" to "authenticated";

grant insert on table "public"."job_categories" to "authenticated";

grant references on table "public"."job_categories" to "authenticated";

grant select on table "public"."job_categories" to "authenticated";

grant trigger on table "public"."job_categories" to "authenticated";

grant truncate on table "public"."job_categories" to "authenticated";

grant update on table "public"."job_categories" to "authenticated";

grant delete on table "public"."job_categories" to "service_role";

grant insert on table "public"."job_categories" to "service_role";

grant references on table "public"."job_categories" to "service_role";

grant select on table "public"."job_categories" to "service_role";

grant trigger on table "public"."job_categories" to "service_role";

grant truncate on table "public"."job_categories" to "service_role";

grant update on table "public"."job_categories" to "service_role";

grant delete on table "public"."job_seekers" to "anon";

grant insert on table "public"."job_seekers" to "anon";

grant references on table "public"."job_seekers" to "anon";

grant select on table "public"."job_seekers" to "anon";

grant trigger on table "public"."job_seekers" to "anon";

grant truncate on table "public"."job_seekers" to "anon";

grant update on table "public"."job_seekers" to "anon";

grant delete on table "public"."job_seekers" to "authenticated";

grant insert on table "public"."job_seekers" to "authenticated";

grant references on table "public"."job_seekers" to "authenticated";

grant select on table "public"."job_seekers" to "authenticated";

grant trigger on table "public"."job_seekers" to "authenticated";

grant truncate on table "public"."job_seekers" to "authenticated";

grant update on table "public"."job_seekers" to "authenticated";

grant delete on table "public"."job_seekers" to "service_role";

grant insert on table "public"."job_seekers" to "service_role";

grant references on table "public"."job_seekers" to "service_role";

grant select on table "public"."job_seekers" to "service_role";

grant trigger on table "public"."job_seekers" to "service_role";

grant truncate on table "public"."job_seekers" to "service_role";

grant update on table "public"."job_seekers" to "service_role";

grant delete on table "public"."job_types" to "anon";

grant insert on table "public"."job_types" to "anon";

grant references on table "public"."job_types" to "anon";

grant select on table "public"."job_types" to "anon";

grant trigger on table "public"."job_types" to "anon";

grant truncate on table "public"."job_types" to "anon";

grant update on table "public"."job_types" to "anon";

grant delete on table "public"."job_types" to "authenticated";

grant insert on table "public"."job_types" to "authenticated";

grant references on table "public"."job_types" to "authenticated";

grant select on table "public"."job_types" to "authenticated";

grant trigger on table "public"."job_types" to "authenticated";

grant truncate on table "public"."job_types" to "authenticated";

grant update on table "public"."job_types" to "authenticated";

grant delete on table "public"."job_types" to "service_role";

grant insert on table "public"."job_types" to "service_role";

grant references on table "public"."job_types" to "service_role";

grant select on table "public"."job_types" to "service_role";

grant trigger on table "public"."job_types" to "service_role";

grant truncate on table "public"."job_types" to "service_role";

grant update on table "public"."job_types" to "service_role";

grant delete on table "public"."payouts" to "anon";

grant insert on table "public"."payouts" to "anon";

grant references on table "public"."payouts" to "anon";

grant select on table "public"."payouts" to "anon";

grant trigger on table "public"."payouts" to "anon";

grant truncate on table "public"."payouts" to "anon";

grant update on table "public"."payouts" to "anon";

grant delete on table "public"."payouts" to "authenticated";

grant insert on table "public"."payouts" to "authenticated";

grant references on table "public"."payouts" to "authenticated";

grant select on table "public"."payouts" to "authenticated";

grant trigger on table "public"."payouts" to "authenticated";

grant truncate on table "public"."payouts" to "authenticated";

grant update on table "public"."payouts" to "authenticated";

grant delete on table "public"."payouts" to "service_role";

grant insert on table "public"."payouts" to "service_role";

grant references on table "public"."payouts" to "service_role";

grant select on table "public"."payouts" to "service_role";

grant trigger on table "public"."payouts" to "service_role";

grant truncate on table "public"."payouts" to "service_role";

grant update on table "public"."payouts" to "service_role";

grant delete on table "public"."preferences" to "anon";

grant insert on table "public"."preferences" to "anon";

grant references on table "public"."preferences" to "anon";

grant select on table "public"."preferences" to "anon";

grant trigger on table "public"."preferences" to "anon";

grant truncate on table "public"."preferences" to "anon";

grant update on table "public"."preferences" to "anon";

grant delete on table "public"."preferences" to "authenticated";

grant insert on table "public"."preferences" to "authenticated";

grant references on table "public"."preferences" to "authenticated";

grant select on table "public"."preferences" to "authenticated";

grant trigger on table "public"."preferences" to "authenticated";

grant truncate on table "public"."preferences" to "authenticated";

grant update on table "public"."preferences" to "authenticated";

grant delete on table "public"."preferences" to "service_role";

grant insert on table "public"."preferences" to "service_role";

grant references on table "public"."preferences" to "service_role";

grant select on table "public"."preferences" to "service_role";

grant trigger on table "public"."preferences" to "service_role";

grant truncate on table "public"."preferences" to "service_role";

grant update on table "public"."preferences" to "service_role";

grant delete on table "public"."shifts" to "anon";

grant insert on table "public"."shifts" to "anon";

grant references on table "public"."shifts" to "anon";

grant select on table "public"."shifts" to "anon";

grant trigger on table "public"."shifts" to "anon";

grant truncate on table "public"."shifts" to "anon";

grant update on table "public"."shifts" to "anon";

grant delete on table "public"."shifts" to "authenticated";

grant insert on table "public"."shifts" to "authenticated";

grant references on table "public"."shifts" to "authenticated";

grant select on table "public"."shifts" to "authenticated";

grant trigger on table "public"."shifts" to "authenticated";

grant truncate on table "public"."shifts" to "authenticated";

grant update on table "public"."shifts" to "authenticated";

grant delete on table "public"."shifts" to "service_role";

grant insert on table "public"."shifts" to "service_role";

grant references on table "public"."shifts" to "service_role";

grant select on table "public"."shifts" to "service_role";

grant trigger on table "public"."shifts" to "service_role";

grant truncate on table "public"."shifts" to "service_role";

grant update on table "public"."shifts" to "service_role";

grant delete on table "public"."status" to "anon";

grant insert on table "public"."status" to "anon";

grant references on table "public"."status" to "anon";

grant select on table "public"."status" to "anon";

grant trigger on table "public"."status" to "anon";

grant truncate on table "public"."status" to "anon";

grant update on table "public"."status" to "anon";

grant delete on table "public"."status" to "authenticated";

grant insert on table "public"."status" to "authenticated";

grant references on table "public"."status" to "authenticated";

grant select on table "public"."status" to "authenticated";

grant trigger on table "public"."status" to "authenticated";

grant truncate on table "public"."status" to "authenticated";

grant update on table "public"."status" to "authenticated";

grant delete on table "public"."status" to "service_role";

grant insert on table "public"."status" to "service_role";

grant references on table "public"."status" to "service_role";

grant select on table "public"."status" to "service_role";

grant trigger on table "public"."status" to "service_role";

grant truncate on table "public"."status" to "service_role";

grant update on table "public"."status" to "service_role";

create policy "Clients can view and manage assignments for their shifts"
on "public"."assignments"
as permissive
for all
to public
using (true);


create policy "Job seekers can view and update their own assignments"
on "public"."assignments"
as permissive
for all
to public
using (true);


create policy "Allow all for authenticated"
on "public"."availability"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Users can manage their own availability"
on "public"."availability"
as permissive
for all
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Users can manage their own availability templates"
on "public"."availability_templates"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "Clients can view their own data"
on "public"."clients"
as permissive
for all
to public
using ((( SELECT auth.uid() AS uid) = client_id));


create policy "Enable signup for service_role on clients"
on "public"."clients"
as permissive
for insert
to service_role
with check (true);


create policy "Job seekers can view client info for their shifts"
on "public"."clients"
as permissive
for select
to public
using (true);


create policy "Allow authenticated users to insert feedback"
on "public"."feedback"
as permissive
for insert
to public
with check ((auth.uid() = reviewer_id));


create policy "Allow delete if owner"
on "public"."feedback"
as permissive
for delete
to public
using ((auth.uid() = reviewer_id));


create policy "Users can create feedback for their assignments"
on "public"."feedback"
as permissive
for insert
to public
with check (((( SELECT auth.uid() AS uid) = reviewer_id) AND (EXISTS ( SELECT 1
   FROM assignments a
  WHERE ((a.assignment_id = feedback.assignment_id) AND ((a.user_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
           FROM shifts s
          WHERE ((s.shift_id = a.shift_id) AND (s.client_id = ( SELECT auth.uid() AS uid)))))))))));


create policy "Users can update their own feedback"
on "public"."feedback"
as permissive
for update
to public
using (((( SELECT auth.uid() AS uid) = reviewer_id) AND (created_at > (now() - '24:00:00'::interval))))
with check ((( SELECT auth.uid() AS uid) = reviewer_id));


create policy "Users can view their own feedback"
on "public"."feedback"
as permissive
for select
to public
using (((( SELECT auth.uid() AS uid) = reviewer_id) OR (( SELECT auth.uid() AS uid) = reviewee_id)));


create policy "Clients can view job seekers assigned to their shifts"
on "public"."job_seekers"
as permissive
for select
to public
using (true);


create policy "Enable signup for service_role on job_seekers"
on "public"."job_seekers"
as permissive
for insert
to service_role
with check (true);


create policy "Job seekers can view and update their own data"
on "public"."job_seekers"
as permissive
for all
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Job seekers can view their own payouts"
on "public"."payouts"
as permissive
for select
to public
using (true);


create policy "Job seekers can view total earnings"
on "public"."payouts"
as permissive
for insert
to public
with check (true);


create policy "Service role can manage payouts for calculations"
on "public"."payouts"
as permissive
for all
to service_role
with check (true);


create policy "Enable signup for service_role on preferences"
on "public"."preferences"
as permissive
for insert
to service_role
with check (true);


create policy "Users can manage their own preferences"
on "public"."preferences"
as permissive
for all
to public
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Allow inserts by authenticated Clients"
on "public"."shifts"
as permissive
for insert
to public
with check (true);


create policy "Clients can manage their own shifts"
on "public"."shifts"
as permissive
for all
to public
using (true);


create policy "Job seekers can view open shifts and their assigned shifts"
on "public"."shifts"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."status"
as permissive
for select
to public
using (true);


CREATE TRIGGER trigger_update_rating_on_assignment AFTER UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_job_seeker_rating();

CREATE TRIGGER trigger_update_staff_assigned AFTER INSERT OR DELETE OR UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_staff_assigned();

CREATE TRIGGER trigger_update_rating_on_feedback AFTER INSERT OR UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION update_job_seeker_rating();

CREATE TRIGGER trigger_auto_update_shift_status AFTER UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION auto_update_shift_status();


