-- Update existing patients to showcase different coverage scenarios
UPDATE patients SET id = 'a1234567-1234-1234-1234-123456789012', name = 'Alex Chen (High Coverage)', hospital_no = 'A001' WHERE hospital_no = 'H001';

-- Insert additional test patients for demo
INSERT INTO patients (id, name, hospital_no, id_no, sex, age, dept, team, ward, bed, admission_date, admission_type, patient_status)
VALUES 
('b2345678-2345-2345-2345-234567890123', 'Betty Santos (Medium Coverage)', 'B002', 'S1234567B', 'F', 65, 'General Medicine', 'Team A', 'Ward 3A', '3A-01', CURRENT_DATE - INTERVAL '2 days', 'scheduled', 'admitted'),
('c3456789-3456-3456-3456-345678901234', 'Charles Lim (Low Coverage)', 'C003', 'S2345678C', 'M', 78, 'Cardiology', 'Team B', 'Ward 4B', '4B-02', CURRENT_DATE - INTERVAL '1 day', 'emergency', 'admitted'),
('d4567890-4567-4567-4567-456789012345', 'Diana Wong (No Coverage)', 'D004', 'S3456789D', 'F', 52, 'Neurology', 'Team C', 'Ward 2C', '2C-03', CURRENT_DATE, 'emergency', 'admitted')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  hospital_no = EXCLUDED.hospital_no,
  id_no = EXCLUDED.id_no;