-- Add 3 new dummy patients pending bed assignment
INSERT INTO public.patients (
  name, 
  hospital_no, 
  id_no, 
  age, 
  sex, 
  dept, 
  team, 
  ward, 
  admission_type, 
  admission_date, 
  patient_status,
  robot_navigation_status
) VALUES 
(
  'David Martinez', 
  'H001238', 
  'ID001238', 
  42, 
  'M', 
  'Internal Medicine', 
  'Team Alpha', 
  'Ward 3A', 
  'A&E', 
  '2025-09-03', 
  'awaiting_bed',
  'idle'
),
(
  'Lisa Wong', 
  'H001239', 
  'ID001239', 
  29, 
  'F', 
  'Internal Medicine', 
  'Team Beta', 
  'Ward 3A', 
  'Elective', 
  '2025-09-03', 
  'awaiting_bed',
  'idle'
),
(
  'James Thompson', 
  'H001240', 
  'ID001240', 
  67, 
  'M', 
  'Internal Medicine', 
  'Team Alpha', 
  'Ward 3A', 
  'Transfer', 
  '2025-09-03', 
  'awaiting_bed',
  'idle'
);