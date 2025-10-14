-- Delete the three specified patients
DELETE FROM patients WHERE id IN (
  'd4567890-4567-4567-4567-456789012345', -- Diana Wong (No Coverage)
  'c3456789-3456-3456-3456-345678901234', -- Charles Lim (Low Coverage)
  'b2345678-2345-2345-2345-234567890123'  -- Betty Santos (Medium Coverage)
);