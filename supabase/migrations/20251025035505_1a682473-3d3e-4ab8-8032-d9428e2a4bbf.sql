-- Reset Patient 陳大文 (CHAN TAI MAN) for Full Demo
-- Patient ID: f3333333-3333-3333-3333-333333333333

-- Step 1: Delete all previous assessment-related data for this patient
DELETE FROM public.audio_transcripts 
WHERE assessment_id IN (
  SELECT id FROM public.patient_assessments 
  WHERE patient_id = 'f3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.form_field_values 
WHERE assessment_id IN (
  SELECT id FROM public.patient_assessments 
  WHERE patient_id = 'f3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.risk_scores 
WHERE assessment_id IN (
  SELECT id FROM public.patient_assessments 
  WHERE patient_id = 'f3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.assessment_sections 
WHERE assessment_id IN (
  SELECT id FROM public.patient_assessments 
  WHERE patient_id = 'f3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.patient_assessments 
WHERE patient_id = 'f3333333-3333-3333-3333-333333333333';

-- Step 2: Clear external data cache for this patient
DELETE FROM public.external_data_cache 
WHERE patient_id = 'f3333333-3333-3333-3333-333333333333';

-- Step 3: Reset patient to "Awaiting Bed" status with updated admission info
UPDATE public.patients 
SET 
  patient_status = 'awaiting_bed',
  bed = NULL,
  bed_assigned_at = NULL,
  bed_assigned_by = NULL,
  admission_date = '2025-10-25',
  admission_type = 'A&E',
  ward = '9A',
  dept = 'Medicine',
  team = 'Team A',
  robot_navigation_status = 'idle',
  updated_at = now()
WHERE id = 'f3333333-3333-3333-3333-333333333333';

-- Verify the reset
SELECT 
  id,
  name,
  hospital_no,
  patient_status,
  bed,
  admission_date,
  admission_type,
  ward,
  dept,
  team
FROM public.patients 
WHERE id = 'f3333333-3333-3333-3333-333333333333';