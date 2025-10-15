-- Insert patient 陳大文 / CHAN TAI MAN
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
  patient_status,
  admission_type,
  admission_date,
  created_at,
  updated_at
) VALUES (
  'e2222222-2222-2222-2222-222222222222',
  '陳大文 / CHAN TAI MAN',
  'HN15003261(3)',
  'Q702408(2)',
  'M',
  72,
  'Medicine',
  'Team B',
  NULL,
  NULL,
  'awaiting_bed',
  'A&E',
  '2025-10-15',
  NOW(),
  NOW()
);