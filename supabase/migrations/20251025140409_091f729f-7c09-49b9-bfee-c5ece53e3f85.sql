-- Clean Up Patient List - Keep Only Chan Tai Man and Reset for Demo
-- Patient ID: f3333333-3333-3333-3333-333333333333

-- Step 1: Delete all assessment data for Chan Tai Man
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

-- Step 2: Clear external data cache for Chan Tai Man
DELETE FROM public.external_data_cache 
WHERE patient_id = 'f3333333-3333-3333-3333-333333333333';

-- Step 3: Delete all assessment-related data for other patients
DELETE FROM public.audio_transcripts 
WHERE assessment_id IN (
  SELECT id FROM public.patient_assessments 
  WHERE patient_id != 'f3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.form_field_values 
WHERE assessment_id IN (
  SELECT id FROM public.patient_assessments 
  WHERE patient_id != 'f3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.risk_scores 
WHERE assessment_id IN (
  SELECT id FROM public.patient_assessments 
  WHERE patient_id != 'f3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.assessment_sections 
WHERE assessment_id IN (
  SELECT id FROM public.patient_assessments 
  WHERE patient_id != 'f3333333-3333-3333-3333-333333333333'
);

DELETE FROM public.patient_assessments 
WHERE patient_id != 'f3333333-3333-3333-3333-333333333333';

-- Step 4: Delete external data cache for other patients
DELETE FROM public.external_data_cache 
WHERE patient_id != 'f3333333-3333-3333-3333-333333333333';

-- Step 5: Delete all other patients
DELETE FROM public.patients 
WHERE id != 'f3333333-3333-3333-3333-333333333333';

-- Step 6: Reset Chan Tai Man to awaiting_bed status
UPDATE public.patients 
SET 
  patient_status = 'awaiting_bed',
  bed = NULL,
  bed_assigned_at = NULL,
  bed_assigned_by = NULL,
  robot_navigation_status = 'idle',
  updated_at = now()
WHERE id = 'f3333333-3333-3333-3333-333333333333';

-- Verify the result
SELECT 
  id,
  name,
  hospital_no,
  patient_status,
  bed,
  admission_date,
  ward,
  dept,
  team,
  (SELECT COUNT(*) FROM public.patients) as total_patients_count
FROM public.patients 
WHERE id = 'f3333333-3333-3333-3333-333333333333';