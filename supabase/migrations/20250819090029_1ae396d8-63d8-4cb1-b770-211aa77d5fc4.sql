
-- Create enum types for better data integrity
CREATE TYPE public.admission_type AS ENUM ('A&E', 'Elective', 'Transfer', 'Readmission');
CREATE TYPE public.data_source AS ENUM ('pre-populated', 'ai-filled', 'manual');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.assessment_status AS ENUM ('in_progress', 'completed', 'submitted');

-- Patients table - core patient demographics
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hospital_no TEXT UNIQUE NOT NULL,
  id_no TEXT,
  age INTEGER,
  sex CHAR(1) CHECK (sex IN ('M', 'F')),
  dept TEXT,
  team TEXT,
  ward TEXT,
  bed TEXT,
  admission_type admission_type,
  admission_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Patient assessments - main assessment records
CREATE TABLE public.patient_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assessment_time TIME NOT NULL DEFAULT CURRENT_TIME,
  status assessment_status DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Assessment sections - track completion of form sections
CREATE TABLE public.assessment_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.patient_assessments(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL, -- e.g., 'general-physical', 'social'
  section_title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Form field values - store all form responses
CREATE TABLE public.form_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.patient_assessments(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  field_id TEXT NOT NULL,
  field_label TEXT NOT NULL,
  value TEXT,
  data_source data_source NOT NULL DEFAULT 'manual',
  ai_source_text TEXT, -- Original conversation text for AI-filled fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assessment_id, field_id)
);

-- Risk scores - calculated assessment scores
CREATE TABLE public.risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.patient_assessments(id) ON DELETE CASCADE,
  score_name TEXT NOT NULL, -- 'MEWS', 'Morse Fall Scale', etc.
  score_value INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  risk_level risk_level NOT NULL,
  description TEXT,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assessment_id, score_name)
);

-- Audio transcripts - temporary storage for AI processing
CREATE TABLE public.audio_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.patient_assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript_text TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours') -- Auto-cleanup after 24h
);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_transcripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients
CREATE POLICY "Users can view patients they have access to" ON public.patients
  FOR SELECT USING (true); -- Healthcare staff can view all patients

CREATE POLICY "Users can create patients" ON public.patients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update patients" ON public.patients
  FOR UPDATE USING (true);

-- RLS Policies for patient_assessments
CREATE POLICY "Users can view assessments they created" ON public.patient_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create assessments" ON public.patient_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their assessments" ON public.patient_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for assessment_sections
CREATE POLICY "Users can view their assessment sections" ON public.assessment_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patient_assessments pa 
      WHERE pa.id = assessment_id AND pa.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their assessment sections" ON public.assessment_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.patient_assessments pa 
      WHERE pa.id = assessment_id AND pa.user_id = auth.uid()
    )
  );

-- RLS Policies for form_field_values
CREATE POLICY "Users can view their form field values" ON public.form_field_values
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patient_assessments pa 
      WHERE pa.id = assessment_id AND pa.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their form field values" ON public.form_field_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.patient_assessments pa 
      WHERE pa.id = assessment_id AND pa.user_id = auth.uid()
    )
  );

-- RLS Policies for risk_scores
CREATE POLICY "Users can view their risk scores" ON public.risk_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patient_assessments pa 
      WHERE pa.id = assessment_id AND pa.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their risk scores" ON public.risk_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.patient_assessments pa 
      WHERE pa.id = assessment_id AND pa.user_id = auth.uid()
    )
  );

-- RLS Policies for audio_transcripts
CREATE POLICY "Users can view their audio transcripts" ON public.audio_transcripts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create audio transcripts" ON public.audio_transcripts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their audio transcripts" ON public.audio_transcripts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their audio transcripts" ON public.audio_transcripts
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_patients_hospital_no ON public.patients(hospital_no);
CREATE INDEX idx_patient_assessments_patient_id ON public.patient_assessments(patient_id);
CREATE INDEX idx_patient_assessments_user_id ON public.patient_assessments(user_id);
CREATE INDEX idx_assessment_sections_assessment_id ON public.assessment_sections(assessment_id);
CREATE INDEX idx_form_field_values_assessment_id ON public.form_field_values(assessment_id);
CREATE INDEX idx_risk_scores_assessment_id ON public.risk_scores(assessment_id);
CREATE INDEX idx_audio_transcripts_expires_at ON public.audio_transcripts(expires_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_patient_assessments_updated_at BEFORE UPDATE ON public.patient_assessments
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_assessment_sections_updated_at BEFORE UPDATE ON public.assessment_sections
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_form_field_values_updated_at BEFORE UPDATE ON public.form_field_values
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to clean up expired audio transcripts
CREATE OR REPLACE FUNCTION cleanup_expired_transcripts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.audio_transcripts 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate risk scores automatically
CREATE OR REPLACE FUNCTION calculate_morse_fall_score(assessment_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER := 0;
  field_value TEXT;
BEGIN
  -- History of falling (25 points if Yes)
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-history-falling';
  IF field_value = 'Yes (25 points)' THEN total_score := total_score + 25; END IF;
  
  -- Secondary diagnosis (15 points if Yes)
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-secondary-diagnosis';
  IF field_value = 'Yes (15 points)' THEN total_score := total_score + 15; END IF;
  
  -- Ambulatory aid
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-ambulatory-aid';
  IF field_value = 'Crutches/Cane/Walkers (15 points)' THEN total_score := total_score + 15;
  ELSIF field_value = 'Furniture (30 points)' THEN total_score := total_score + 30; END IF;
  
  -- IV therapy (20 points if Yes)
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-iv-therapy';
  IF field_value = 'Yes (20 points)' THEN total_score := total_score + 20; END IF;
  
  -- Gait
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-gait';
  IF field_value = 'Weak (10 points)' THEN total_score := total_score + 10;
  ELSIF field_value = 'Impaired (20 points)' THEN total_score := total_score + 20; END IF;
  
  -- Mental status (15 points if overestimates)
  SELECT value INTO field_value FROM public.form_field_values 
  WHERE assessment_id = assessment_id_param AND field_id = 'morse-mental-status';
  IF field_value = 'Overestimates/Forgets limitations (15 points)' THEN total_score := total_score + 15; END IF;
  
  RETURN total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
