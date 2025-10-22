-- Clear all assessment data for CHAN TAI MAN (陳大文)
-- Patient ID: f3333333-3333-3333-3333-333333333333

-- Delete all form field values for this patient's assessments
DELETE FROM form_field_values 
WHERE assessment_id IN (
  SELECT id FROM patient_assessments 
  WHERE patient_id = 'f3333333-3333-3333-3333-333333333333'
);

-- Delete all patient assessments for this patient
DELETE FROM patient_assessments 
WHERE patient_id = 'f3333333-3333-3333-3333-333333333333';
