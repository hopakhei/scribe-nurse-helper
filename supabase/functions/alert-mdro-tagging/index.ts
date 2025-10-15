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
      mdro_status: "MRSA Positive",
      mdro_type: "MRSA",
      mdro_site: "Nasal swab",
      mdro_date_detected: "2025-09-20",
      isolation_precautions: "Contact Precautions Required",
      isolation_type: "Contact",
      ppe_requirements: "Gown and gloves required for all contact",
      special_instructions: "Patient requires single room isolation. Hand hygiene before and after contact."
    },
    'c2222222-2222-2222-2222-222222222222': {
      mdro_status: "VRE Positive",
      mdro_type: "VRE",
      mdro_site: "Rectal swab",
      mdro_date_detected: "2025-08-15",
      isolation_precautions: "Contact Precautions Required",
      isolation_type: "Contact",
      ppe_requirements: "Gown and gloves for direct contact and environmental contact",
      special_instructions: "Dedicated equipment preferred. Ensure thorough environmental cleaning."
    },
    'c3333333-3333-3333-3333-333333333333': {
      mdro_status: "ESBL Positive",
      mdro_type: "ESBL-producing E. coli",
      mdro_site: "Urine culture",
      mdro_date_detected: "2025-07-10",
      isolation_precautions: "Contact Precautions",
      isolation_type: "Contact",
      ppe_requirements: "Gloves for contact with patient or contaminated surfaces",
      special_instructions: "Single room preferred but not mandatory. Standard contact precautions apply."
    },
    'e1111111-1111-1111-1111-111111111111': {
      mdro_status: "MRSA Positive",
      mdro_type: "MRSA",
      mdro_site: "Nasal swab",
      mdro_date_detected: "2025-09-15",
      isolation_precautions: "Contact Precautions Required",
      isolation_type: "Contact",
      ppe_requirements: "Gown and gloves required for all contact",
      special_instructions: "Patient requires single room isolation. Hand hygiene before and after contact."
    },
    'e2222222-2222-2222-2222-222222222222': {
      mdro_status: "VRE Positive",
      mdro_type: "VRE",
      mdro_site: "Rectal swab",
      mdro_date_detected: "2025-09-20",
      isolation_precautions: "Contact Precautions Required",
      isolation_type: "Contact",
      ppe_requirements: "Gown and gloves for direct contact and environmental contact",
      special_instructions: "Dedicated equipment preferred. Ensure thorough environmental cleaning. Single room isolation recommended."
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