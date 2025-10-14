-- Insert 3 dummy patients with high historical data coverage
-- All patients start with 'awaiting_bed' status

-- Patient 1: CHAN, CHUN HIN (Male, 68, High MDRO Alert)
INSERT INTO patients (
  id,
  hospital_no,
  id_no,
  name,
  age,
  sex,
  admission_type,
  admission_date,
  dept,
  team,
  ward,
  bed,
  patient_status,
  bed_assigned_at,
  bed_assigned_by,
  robot_navigation_status,
  created_at
) VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'H0000010',
  'N15000063X',
  'CHAN, CHUN HIN (陳駿軒)',
  68,
  'M',
  'A&E',
  '2025-10-14',
  'Internal Medicine',
  'Team Alpha',
  'Ward 3A',
  NULL,
  'awaiting_bed',
  NULL,
  NULL,
  'idle',
  NOW()
);

-- Patient 2: SUEN, CHUEN YEE (Male, 75, Elective Admission)
INSERT INTO patients (
  id,
  hospital_no,
  id_no,
  name,
  age,
  sex,
  admission_type,
  admission_date,
  dept,
  team,
  ward,
  bed,
  patient_status,
  bed_assigned_at,
  bed_assigned_by,
  robot_navigation_status,
  created_at
) VALUES (
  'c2222222-2222-2222-2222-222222222222',
  'H0000029',
  'N15000064V',
  'SUEN, CHUEN YEE (孫存義)',
  75,
  'M',
  'Elective',
  '2025-10-14',
  'Internal Medicine',
  'Team Beta',
  'Ward 3A',
  NULL,
  'awaiting_bed',
  NULL,
  NULL,
  'idle',
  NOW()
);

-- Patient 3: HUNG, ROSE (Female, 52, Emergency Admission)
INSERT INTO patients (
  id,
  hospital_no,
  id_no,
  name,
  age,
  sex,
  admission_type,
  admission_date,
  dept,
  team,
  ward,
  bed,
  patient_status,
  bed_assigned_at,
  bed_assigned_by,
  robot_navigation_status,
  created_at
) VALUES (
  'c3333333-3333-3333-3333-333333333333',
  'H0000037',
  'N15000065T',
  'HUNG, ROSE (洪梅貴)',
  52,
  'F',
  'A&E',
  '2025-10-14',
  'Internal Medicine',
  'Team Alpha',
  'Ward 3A',
  NULL,
  'awaiting_bed',
  NULL,
  NULL,
  'idle',
  NOW()
);