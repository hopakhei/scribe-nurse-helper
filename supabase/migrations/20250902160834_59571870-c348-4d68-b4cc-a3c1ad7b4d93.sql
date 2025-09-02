-- Clean up duplicate assessments (keep only the latest one)
WITH ranked_assessments AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY patient_id, user_id, DATE(created_at) ORDER BY created_at DESC) as rn
  FROM patient_assessments
  WHERE patient_id = '7f391b89-9cb1-46f8-9fbf-39af9d8953d6'
    AND status = 'in_progress'
)
DELETE FROM patient_assessments 
WHERE id IN (
  SELECT id FROM ranked_assessments WHERE rn > 1
);

-- Add unique constraint to prevent duplicate assessments per day
ALTER TABLE patient_assessments 
ADD CONSTRAINT unique_daily_assessment 
UNIQUE (patient_id, user_id, assessment_date);

-- Also clean up duplicate form_field_values for deleted assessments
DELETE FROM form_field_values 
WHERE assessment_id NOT IN (SELECT id FROM patient_assessments);