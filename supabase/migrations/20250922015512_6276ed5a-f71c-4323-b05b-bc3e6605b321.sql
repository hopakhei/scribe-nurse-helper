-- Insert three demo patients with different coverage levels for external data testing

-- Patient 1: Dr. Amanda Wilson (High Coverage - A prefix)
INSERT INTO public.patients (
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
  patient_status
) VALUES (
  'Dr. Amanda Wilson',
  'A987654',
  'S1234567A',
  'F',
  45,
  'Cardiology',
  'Team Alpha',
  'Ward A',
  'A-12',
  'A&E',
  '2024-01-20',
  'admitted'
);

-- Patient 2: Mr. Benjamin Foster (Medium Coverage - B prefix)
INSERT INTO public.patients (
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
  patient_status
) VALUES (
  'Mr. Benjamin Foster',
  'B123789',
  'S9876543B',
  'M',
  67,
  'Internal Medicine',
  'Team Beta',
  'Ward B',
  'B-08',
  'Elective',
  '2024-01-19',
  'admitted'
);

-- Patient 3: Ms. Catherine Liu (Low Coverage - C prefix)
INSERT INTO public.patients (
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
  patient_status
) VALUES (
  'Ms. Catherine Liu',
  'C456123',
  'S5647382C',
  'F',
  29,
  'Orthopedics',
  'Team Gamma',
  'Ward C',
  'C-15',
  'A&E',
  '2024-01-21',
  'admitted'
);