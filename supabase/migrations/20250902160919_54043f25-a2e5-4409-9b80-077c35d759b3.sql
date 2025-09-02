-- Clean up ALL duplicate assessments globally (keep only the latest one per patient/user/day)
WITH ranked_assessments AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY patient_id, user_id, assessment_date ORDER BY created_at DESC) as rn
  FROM patient_assessments
)
DELETE FROM patient_assessments 
WHERE id IN (
  SELECT id FROM ranked_assessments WHERE rn > 1
);

-- Clean up orphaned form field values
DELETE FROM form_field_values 
WHERE assessment_id NOT IN (SELECT id FROM patient_assessments);

-- Clean up orphaned risk scores
DELETE FROM risk_scores 
WHERE assessment_id NOT IN (SELECT id FROM patient_assessments);