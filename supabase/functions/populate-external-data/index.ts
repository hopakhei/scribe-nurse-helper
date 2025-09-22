import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentId, patientId } = await req.json();
    
    console.log('Populating external data for assessment:', assessmentId, 'patient:', patientId);

    const results = {
      opas: null,
      evital: null,
      previousAssessment: null,
      alertFunction: null,
      errors: []
    };

    // Call OPAS for emergency contacts
    try {
      const opasResponse = await supabase.functions.invoke('opas-emergency-contacts', {
        body: { patientId }
      });
      if (opasResponse.data) {
        results.opas = opasResponse.data;
        await populateFormFields(assessmentId, opasResponse.data.data, 'opas');
      }
    } catch (error) {
      console.error('OPAS error:', error);
      results.errors.push({ system: 'OPAS', error: error.message });
    }

    // Call eVital for vital signs
    try {
      const evitalResponse = await supabase.functions.invoke('evital-vitals', {
        body: { patientId }
      });
      if (evitalResponse.data) {
        results.evital = evitalResponse.data;
        await populateFormFields(assessmentId, evitalResponse.data.data, 'evital');
      }
    } catch (error) {
      console.error('eVital error:', error);
      results.errors.push({ system: 'eVital', error: error.message });
    }

    // Call Previous Assessment for social data
    try {
      const prevResponse = await supabase.functions.invoke('previous-assessment-data', {
        body: { patientId }
      });
      if (prevResponse.data) {
        results.previousAssessment = prevResponse.data;
        await populateFormFields(assessmentId, prevResponse.data.data, 'previous-assessment');
      }
    } catch (error) {
      console.error('Previous Assessment error:', error);
      results.errors.push({ system: 'History', error: error.message });
    }

    // Call Alert Function for MDRO tagging
    try {
      const alertResponse = await supabase.functions.invoke('alert-mdro-tagging', {
        body: { patientId }
      });
      if (alertResponse.data) {
        results.alertFunction = alertResponse.data;
        await populateFormFields(assessmentId, alertResponse.data.data, 'alert-function');
      }
    } catch (error) {
      console.error('Alert Function error:', error);
      results.errors.push({ system: 'Alert Function', error: error.message });
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      populated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in populate external data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function populateFormFields(assessmentId: string, data: Record<string, any>, dataSource: string) {
  const formFields = [];
  
  for (const [fieldId, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      formFields.push({
        assessment_id: assessmentId,
        section_id: getSectionId(fieldId),
        field_id: fieldId,
        field_label: getFieldLabel(fieldId),
        value: String(value),
        data_source: dataSource,
        source_system: getSourceSystemName(dataSource),
        last_sync_at: new Date().toISOString()
      });
    }
  }

  if (formFields.length > 0) {
    const { error } = await supabase
      .from('form_field_values')
      .upsert(formFields, { 
        onConflict: 'assessment_id,field_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error inserting form fields:', error);
      throw error;
    }
  }
}

function getSectionId(fieldId: string): string {
  if (fieldId.startsWith('emergency_contact')) return 'general';
  if (fieldId.includes('temperature') || fieldId.includes('pulse') || fieldId.includes('bp_') || fieldId.includes('respiratory') || fieldId.includes('spo2')) return 'physical';
  if (fieldId.includes('marital') || fieldId.includes('religion') || fieldId.includes('education') || fieldId.includes('smoking') || fieldId.includes('drinking')) return 'social';
  if (fieldId.includes('language') || fieldId.includes('communication') || fieldId.includes('hearing') || fieldId.includes('speech')) return 'communication';
  if (fieldId.includes('mdro') || fieldId.includes('isolation') || fieldId.includes('alert')) return 'risk';
  return 'general';
}

function getFieldLabel(fieldId: string): string {
  const labels: Record<string, string> = {
    'emergency_contact_1_name': 'Emergency Contact 1 Name',
    'emergency_contact_1_relationship': 'Emergency Contact 1 Relationship',
    'emergency_contact_1_phone': 'Emergency Contact 1 Phone',
    'emergency_contact_2_name': 'Emergency Contact 2 Name',
    'emergency_contact_2_relationship': 'Emergency Contact 2 Relationship',
    'emergency_contact_2_phone': 'Emergency Contact 2 Phone',
    'temperature': 'Temperature',
    'temp_method': 'Temperature Method',
    'pulse': 'Pulse',
    'pulse_location': 'Pulse Location',
    'pulse_pattern': 'Pulse Pattern',
    'bp_systolic': 'Systolic BP',
    'bp_diastolic': 'Diastolic BP',
    'bp_position': 'BP Position',
    'respiratory_rate': 'Respiratory Rate',
    'respiration_status': 'Respiration Status',
    'spo2': 'SpO2',
    'marital_status': 'Marital Status',
    'religion': 'Religion',
    'education': 'Education',
    'mdro_status': 'MDRO Status',
    'mdro_organism': 'MDRO Organism'
  };
  return labels[fieldId] || fieldId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getSourceSystemName(dataSource: string): string {
  const systemNames: Record<string, string> = {
    'opas': 'OPAS',
    'evital': 'eVital',
    'previous-assessment': 'History',
    'alert-function': 'Alert Function'
  };
  return systemNames[dataSource] || dataSource;
}