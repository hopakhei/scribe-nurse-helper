-- Update the user profile to have appropriate department and ward access
UPDATE public.profiles 
SET 
  department = 'Internal Medicine',
  ward = 'Ward 3A'
WHERE user_id = 'd127ecb2-44fa-4552-9d40-ed01caf40e26';