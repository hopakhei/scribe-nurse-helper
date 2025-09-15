-- Make RLS more flexible for prototype - users can see patients in their ward or all patients if no ward specified
DROP POLICY IF EXISTS "Users can view patients in their department/ward" ON public.patients;

CREATE POLICY "Users can view patients (prototype mode)" 
ON public.patients 
FOR SELECT 
USING (
  -- Admins can see everything
  get_current_user_role() = 'admin' 
  OR 
  -- Users with no ward assigned can see all patients (prototype mode)
  get_current_user_ward() IS NULL 
  OR 
  -- Users can see patients in their ward (if ward matches or patient has no ward)
  (ward IS NULL OR ward = get_current_user_ward())
);

-- Also update INSERT and UPDATE policies to be more flexible
DROP POLICY IF EXISTS "Users can create patients in their department/ward" ON public.patients;
DROP POLICY IF EXISTS "Users can update patients in their department/ward" ON public.patients;

CREATE POLICY "Users can create patients (prototype mode)" 
ON public.patients 
FOR INSERT 
WITH CHECK (
  get_current_user_role() = 'admin' 
  OR 
  get_current_user_ward() IS NULL 
  OR 
  (ward IS NULL OR ward = get_current_user_ward())
);

CREATE POLICY "Users can update patients (prototype mode)" 
ON public.patients 
FOR UPDATE 
USING (
  get_current_user_role() = 'admin' 
  OR 
  get_current_user_ward() IS NULL 
  OR 
  (ward IS NULL OR ward = get_current_user_ward())
);