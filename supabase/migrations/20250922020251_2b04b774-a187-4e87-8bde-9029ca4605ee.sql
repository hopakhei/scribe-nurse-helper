-- Update the demo patients to be in Ward 3A so they're visible to the current user
UPDATE public.patients 
SET ward = 'Ward 3A'
WHERE hospital_no IN ('A987654', 'B123789', 'C456123');