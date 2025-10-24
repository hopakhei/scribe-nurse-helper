-- Test Patient 1: A&E Admission - Elderly Male
INSERT INTO patients (
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
  patient_status
) VALUES (
  'Wong Tai Sin',
  'H2024001',
  'A123456(7)',
  72,
  'M',
  'A&E',
  CURRENT_DATE,
  'Medicine',
  'A',
  'Ward 9',
  'awaiting_bed'
);

-- Test Patient 2: Elective Admission - Middle-aged Female
INSERT INTO patients (
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
  patient_status
) VALUES (
  'Lee Mei Ling',
  'H2024002',
  'B234567(8)',
  58,
  'F',
  'Elective',
  CURRENT_DATE,
  'Surgery',
  'B',
  'Ward 9',
  'awaiting_bed'
);

-- Test Patient 3: A&E Admission - Adult Male
INSERT INTO patients (
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
  patient_status
) VALUES (
  'Chen Wei Ming',
  'H2024003',
  'C345678(9)',
  45,
  'M',
  'A&E',
  CURRENT_DATE,
  'A&E',
  'C',
  'Ward 9',
  'awaiting_bed'
);