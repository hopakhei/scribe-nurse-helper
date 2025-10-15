-- Create patient 陳大文 (CHAN TAI MAN) with comprehensive profile
INSERT INTO public.patients (
  id,
  name,
  hospital_no,
  id_no,
  sex,
  age,
  dept,
  team,
  ward,
  bed,
  admission_type,
  admission_date,
  patient_status,
  created_at,
  updated_at
) VALUES (
  'f3333333-3333-3333-3333-333333333333'::uuid,
  'CHAN TAI MAN (陳大文)',
  'H2025-003',
  'Y123456(7)',
  'M',
  72,
  'Medicine',
  'Team A',
  '9A',
  NULL,
  'A&E',
  '2025-10-15',
  'awaiting_bed',
  now(),
  now()
);