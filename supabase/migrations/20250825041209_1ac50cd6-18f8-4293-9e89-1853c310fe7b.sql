-- Add patient status enum
CREATE TYPE patient_status AS ENUM (
  'awaiting_bed',
  'bed_assigned', 
  'assessment_in_progress',
  'assessment_completed'
);

-- Add robot navigation status enum
CREATE TYPE robot_navigation_status AS ENUM (
  'idle',
  'navigating_to_bed',
  'at_bedside',
  'assessment_active'
);

-- Add new columns to patients table
ALTER TABLE public.patients 
ADD COLUMN patient_status patient_status DEFAULT 'awaiting_bed',
ADD COLUMN bed_assigned_by TEXT DEFAULT NULL,
ADD COLUMN bed_assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN robot_navigation_status robot_navigation_status DEFAULT 'idle';

-- Insert 5 dummy patients with different statuses
INSERT INTO public.patients (name, hospital_no, id_no, sex, age, dept, ward, team, admission_type, admission_date, bed, patient_status, bed_assigned_by, bed_assigned_at) VALUES
('Sarah Johnson', 'H001234', 'ID001234', 'F', 65, 'Internal Medicine', 'Ward 3A', 'Team Alpha', 'A&E', CURRENT_DATE, NULL, 'awaiting_bed', NULL, NULL),
('Michael Chen', 'H001235', 'ID001235', 'M', 58, 'Internal Medicine', 'Ward 3A', 'Team Beta', 'Elective', CURRENT_DATE, '3A-05', 'bed_assigned', 'robot', NOW() - INTERVAL '30 minutes'),
('Emily Davis', 'H001236', 'ID001236', 'F', 42, 'Internal Medicine', 'Ward 3B', 'Team Alpha', 'A&E', CURRENT_DATE, '3B-12', 'assessment_in_progress', 'robot', NOW() - INTERVAL '2 hours'),
('Robert Wilson', 'H001237', 'ID001237', 'M', 71, 'Internal Medicine', 'Ward 3A', 'Team Beta', 'Transfer', CURRENT_DATE, NULL, 'awaiting_bed', NULL, NULL),
('Anna Garcia', 'H001238', 'ID001238', 'F', 34, 'Internal Medicine', 'Ward 3B', 'Team Alpha', 'Elective', CURRENT_DATE, '3B-08', 'assessment_completed', 'robot', NOW() - INTERVAL '4 hours');