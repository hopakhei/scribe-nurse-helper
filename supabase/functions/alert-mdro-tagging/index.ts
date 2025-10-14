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

// Patient-specific mock data for high-coverage demo patients
function getPatientSpecificData(patientId: string) {
  const specificPatients: Record<string, any> = {
    'c1111111-1111-1111-1111-111111111111': {
      mdro_status: "Positive",
      mdro_organism: "MRSA",
      mdro_organism_full: "Methicillin-resistant Staphylococcus aureus",
      mdro_site: "Nasal swab",
      mdro_date_identified: "2024-09-20",
      isolation_precautions: "Contact precautions required",
      isolation_details: "Gloves and gown required for contact",
      alert_level: "High",
      previous_mdro_history: "Yes",
      previous_mdro_details: "MRSA in 2023, successfully treated",
      screening_required: "Yes",
      screening_details: "Required on admission",
      precautions_notes: "Patient aware of precautions"
    },
    'c2222222-2222-2222-2222-222222222222': {
      mdro_status: "Negative",
      mdro_organism: "None detected",
      mdro_site: "Nasal and rectal swabs",
      mdro_date_screened: "2025-10-10",
      screening_type: "Pre-admission screening",
      isolation_precautions: "Standard precautions only",
      alert_level: "Low risk",
      previous_mdro_history: "No",
      previous_mdro_details: "No previous positive screens",
      screening_required: "Completed",
      screening_status: "Pre-admission screening completed",
      precautions_notes: "Standard hand hygiene protocols"
    },
    'c3333333-3333-3333-3333-333333333333': {
      mdro_status: "Negative",
      mdro_organism: "None detected",
      mdro_site: "Nasal swab",
      mdro_date_screened: "2025-10-14",
      screening_type: "On admission",
      isolation_precautions: "Standard precautions only",
      alert_level: "Low risk",
      previous_mdro_history: "No",
      screening_required: "Completed",
      screening_status: "Screening completed on admission",
      precautions_notes: "Standard hand hygiene protocols"
    }
  };
  
  return specificPatients[patientId] || null;
}

// Define patient coverage scenarios based on ID patterns
function getPatientCoverage(patientId: string): 'high' | 'medium' | 'low' | 'none' {
  if (patientId.toUpperCase().startsWith('A')) return 'high';
  if (patientId.toUpperCase().startsWith('B')) return 'medium'; 
  if (patientId.toUpperCase().startsWith('C')) return 'low';
  if (patientId.toUpperCase().startsWith('D')) return 'none';
  return 'high'; // Default to high coverage
}

function getMockDataForCoverage(coverage: 'high' | 'medium' | 'low' | 'none') {
  const scenarios = {
    high: {
      mdro_status: "Positive",
      mdro_organism: "MRSA",
      mdro_site: "Wound swab",
      mdro_date_identified: "2024-01-15",
      isolation_precautions: "Contact precautions",
      alert_level: "High",
      previous_mdro_history: "Yes",
      screening_required: "Yes"
    },
    medium: {
      mdro_status: "Negative", 
      screening_required: "Yes",
      previous_mdro_history: "No"
      // Basic alert data for medium coverage
    },
    low: {
      mdro_status: "Negative"
      // Minimal alert data for low coverage
    },
    none: {}
  };
  
  return scenarios[coverage];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientId } = await req.json();
    
    console.log('Alert Function: Fetching MDRO tags for patient:', patientId);

    // Check for patient-specific data first
    const specificData = getPatientSpecificData(patientId);
    if (specificData) {
      console.log(`Using patient-specific data for ${patientId}`);
      
      // Store in cache
      const cacheData = {
        patient_id: patientId,
        system_name: 'alert-function',
        cache_key: 'mdro_alerts',
        cached_data: specificData,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const { error: cacheError } = await supabase
        .from('external_data_cache')
        .upsert(cacheData);

      if (cacheError) {
        console.error('Error caching Alert Function data:', cacheError);
      }

      return new Response(JSON.stringify({
        success: true,
        data: specificData,
        source: 'Alert Function',
        coverage: 'high',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const coverage = getPatientCoverage(patientId);
    console.log(`Patient ${patientId} has ${coverage} coverage`);
    
    // Simulate system unavailability for 'none' and some 'low' coverage cases
    if (coverage === 'none' || (coverage === 'low' && Math.random() < 0.3)) {
      throw new Error('Alert system database maintenance in progress');
    }
    
    const mockData = getMockDataForCoverage(coverage);

    // Store in cache
    const cacheData = {
      patient_id: patientId,
      system_name: 'alert-function',
      cache_key: 'mdro_alerts',
      cached_data: mockData,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    const { error: cacheError } = await supabase
      .from('external_data_cache')
      .upsert(cacheData);

    if (cacheError) {
      console.error('Error caching Alert Function data:', cacheError);
    }

    return new Response(JSON.stringify({
      success: true,
      data: mockData,
      source: 'Alert Function',
      coverage: coverage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Alert Function MDRO tagging:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      source: 'Alert Function'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});