-- Insert demo patient awaiting bed assignment
INSERT INTO patients (
  id,
  name,
  hospital_no,
  id_no,
  age,
  sex,
  admission_type,
  admission_date,
  dept,
  team,
  ward,
  bed,
  patient_status,
  created_at,
  updated_at
) VALUES (
  'd5555555-5555-5555-5555-555555555555',
  'LEE MEI LING (李美玲)',
  'H2025-DEMO-NEW',
  'S1234567A',
  58,
  'F',
  'A&E',
  '2025-10-21',
  'Medicine',
  'Team A',
  '9A',
  NULL,
  'awaiting_bed',
  NOW(),
  NOW()
);