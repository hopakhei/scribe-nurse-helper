-- Add 3 new dummy patients pending bed assignment with unique hospital numbers
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
  'H001241', 
  'ID001241', 
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
  'H001242', 
  'ID001242', 
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
  'H001243', 
  'ID001243', 
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