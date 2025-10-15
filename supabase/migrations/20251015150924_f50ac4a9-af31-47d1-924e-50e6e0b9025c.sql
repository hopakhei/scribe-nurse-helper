-- Remove Morse Fall Scale field values that were imported from external systems
DELETE FROM form_field_values 
WHERE field_id LIKE 'morse%';