-- Enable RLS on all tables with policies but without RLS
ALTER TABLE public.assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;

-- Now add the unique constraint to prevent duplicate assessments
ALTER TABLE patient_assessments 
ADD CONSTRAINT unique_daily_assessment 
UNIQUE (patient_id, user_id, assessment_date);