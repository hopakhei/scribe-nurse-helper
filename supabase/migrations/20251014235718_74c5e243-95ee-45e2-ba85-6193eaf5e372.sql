-- Insert NAT YAN PING patient with full test coverage
INSERT INTO patients (
  id,
  name,
  hospital_no,
  id_no,
  sex,
  age,
  patient_status,
  dept,
  team,
  ward,
  bed
) VALUES (
  'e1111111-1111-1111-1111-111111111111',
  '鈉欣平 / NAT YAN PING',
  'HN15003260(3)',
  'Q801305(1)',
  'M',
  80,
  'awaiting_bed',
  'Medical',
  'Team A',
  NULL,
  NULL
);