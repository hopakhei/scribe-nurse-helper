-- Update existing test patients to match the ward naming convention
UPDATE patients 
SET ward = '9A'
WHERE hospital_no IN ('H2024001', 'H2024002', 'H2024003');