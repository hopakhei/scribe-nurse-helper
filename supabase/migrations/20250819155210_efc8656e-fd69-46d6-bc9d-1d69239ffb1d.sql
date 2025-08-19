-- Phase 1: Create user profiles and roles system for proper authentication and access control

-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  department text,
  ward text,
  role text NOT NULL DEFAULT 'nurse',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to get current user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Create function to get current user department
CREATE OR REPLACE FUNCTION public.get_current_user_department()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT department FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Create function to get current user ward
CREATE OR REPLACE FUNCTION public.get_current_user_ward()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER SET search_path = public
STABLE
AS $$
  SELECT ward FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Phase 2: Fix patient access control - remove overly permissive policies
DROP POLICY IF EXISTS "Users can create patients" ON public.patients;
DROP POLICY IF EXISTS "Users can update patients" ON public.patients;
DROP POLICY IF EXISTS "Users can view patients they have access to" ON public.patients;

-- Create proper patient access policies based on department/ward
CREATE POLICY "Users can view patients in their department/ward" 
ON public.patients 
FOR SELECT 
USING (
  -- Admin can see all patients
  public.get_current_user_role() = 'admin' OR 
  -- Users can see patients in their department or ward
  (
    (dept IS NULL OR dept = public.get_current_user_department()) AND
    (ward IS NULL OR ward = public.get_current_user_ward())
  )
);

CREATE POLICY "Users can create patients in their department/ward" 
ON public.patients 
FOR INSERT 
WITH CHECK (
  public.get_current_user_role() = 'admin' OR 
  (
    (dept IS NULL OR dept = public.get_current_user_department()) AND
    (ward IS NULL OR ward = public.get_current_user_ward())
  )
);

CREATE POLICY "Users can update patients in their department/ward" 
ON public.patients 
FOR UPDATE 
USING (
  public.get_current_user_role() = 'admin' OR 
  (
    (dept IS NULL OR dept = public.get_current_user_department()) AND
    (ward IS NULL OR ward = public.get_current_user_ward())
  )
);

-- Phase 3: Secure database functions with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_morse_fall_score(assessment_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $function$
DECLARE
  total_score INTEGER := 0;
  field_value TEXT;
BEGIN
  -- History of falling (25 points if Yes)
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-history-falling';
  IF field_value = 'Yes (25 points)' THEN total_score := total_score + 25; END IF;
  
  -- Secondary diagnosis (15 points if Yes)
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-secondary-diagnosis';
  IF field_value = 'Yes (15 points)' THEN total_score := total_score + 15; END IF;
  
  -- Ambulatory aid
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-ambulatory-aid';
  IF field_value = 'Crutches/Cane/Walkers (15 points)' THEN total_score := total_score + 15;
  ELSIF field_value = 'Furniture (30 points)' THEN total_score := total_score + 30; END IF;
  
  -- IV therapy (20 points if Yes)
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-iv-therapy';
  IF field_value = 'Yes (20 points)' THEN total_score := total_score + 20; END IF;
  
  -- Gait
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-gait';
  IF field_value = 'Weak (10 points)' THEN total_score := total_score + 10;
  ELSIF field_value = 'Impaired (20 points)' THEN total_score := total_score + 20; END IF;
  
  -- Mental status (15 points if overestimates)
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-mental-status';
  IF field_value = 'Overestimates/Forgets limitations (15 points)' THEN total_score := total_score + 15; END IF;
  
  RETURN total_score;
END;
$function$;

-- Update cleanup function with proper security
CREATE OR REPLACE FUNCTION public.cleanup_expired_transcripts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $function$
BEGIN
  DELETE FROM public.audio_transcripts 
  WHERE expires_at < now();
END;
$function$;

-- Update timestamp function with proper security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;