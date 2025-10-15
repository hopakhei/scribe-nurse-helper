-- Set all user profiles' ward to 9A so UI header reflects the change
UPDATE public.profiles
SET ward = '9A'
WHERE ward IS DISTINCT FROM '9A';