-- Add source system tracking to form_field_values
ALTER TABLE form_field_values 
ADD COLUMN source_system TEXT,
ADD COLUMN last_sync_at TIMESTAMP WITH TIME ZONE;

-- Create external_system_configs table for managing system configurations
CREATE TABLE external_system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  endpoint_url TEXT,
  is_active BOOLEAN DEFAULT true,
  config_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create external_data_cache table for caching external responses
CREATE TABLE external_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  system_name TEXT NOT NULL,
  cache_key TEXT NOT NULL,
  cached_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(patient_id, system_name, cache_key)
);

-- Enable RLS on new tables
ALTER TABLE external_system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_data_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for external_system_configs
CREATE POLICY "Users can view system configs" 
ON external_system_configs FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage system configs" 
ON external_system_configs FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- RLS policies for external_data_cache
CREATE POLICY "Users can view their cached data" 
ON external_data_cache FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM patients p
  WHERE p.id = external_data_cache.patient_id
  AND ((get_current_user_role() = 'admin') OR 
       (get_current_user_ward() IS NULL) OR 
       ((p.ward IS NULL) OR (p.ward = get_current_user_ward())))
));

CREATE POLICY "Users can manage their cached data" 
ON external_data_cache FOR ALL 
USING (EXISTS (
  SELECT 1 FROM patients p
  WHERE p.id = external_data_cache.patient_id
  AND ((get_current_user_role() = 'admin') OR 
       (get_current_user_ward() IS NULL) OR 
       ((p.ward IS NULL) OR (p.ward = get_current_user_ward())))
));

-- Insert initial system configurations
INSERT INTO external_system_configs (system_name, display_name, endpoint_url, config_data) VALUES
('opas', 'OPAS', '/api/opas', '{"description": "Online Patient Admission System - Emergency contacts"}'),
('evital', 'eVital', '/api/evital', '{"description": "Electronic Vital Signs System"}'),  
('previous-assessment', 'Previous Assessment', '/api/previous-assessment', '{"description": "Previous patient assessment data"}'),
('alert-function', 'Alert Function', '/api/alert-function', '{"description": "MDRO tagging and alerts"}');

-- Update triggers for timestamps
CREATE TRIGGER update_external_system_configs_updated_at
  BEFORE UPDATE ON external_system_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_external_data_cache_patient_system ON external_data_cache(patient_id, system_name);
CREATE INDEX idx_external_data_cache_expires ON external_data_cache(expires_at);

-- Update the data_source enum to include new values
ALTER TYPE data_source ADD VALUE 'opas';
ALTER TYPE data_source ADD VALUE 'evital'; 
ALTER TYPE data_source ADD VALUE 'previous-assessment';
ALTER TYPE data_source ADD VALUE 'alert-function';