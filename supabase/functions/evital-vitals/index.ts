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
      temperature: "38.5",
      temp_method: "Oral",
      pulse: "92",
      pulse_location: "Radial",
      pulse_pattern: "Regular",
      bp_systolic: "145",
      bp_diastolic: "88",
      bp_position: "Sitting",
      respiratory_rate: "22",
      respiration_status: "Slightly laboured",
      spo2: "94"
    },
    'c2222222-2222-2222-2222-222222222222': {
      temperature: "36.9",
      temp_method: "Oral",
      pulse: "68",
      pulse_location: "Radial",
      pulse_pattern: "Regular",
      bp_systolic: "138",
      bp_diastolic: "82",
      bp_position: "Sitting",
      respiratory_rate: "18",
      respiration_status: "Normal",
      spo2: "97"
    },
    'c3333333-3333-3333-3333-333333333333': {
      temperature: "37.3",
      temp_method: "Oral",
      pulse: "85",
      pulse_location: "Radial",
      pulse_pattern: "Regular",
      bp_systolic: "132",
      bp_diastolic: "78",
      bp_position: "Sitting",
      respiratory_rate: "20",
      respiration_status: "Normal",
      spo2: "96"
    },
    'e1111111-1111-1111-1111-111111111111': {
      temperature: "37.8",
      temp_method: "Oral",
      pulse: "88",
      pulse_location: "Radial",
      pulse_pattern: "Regular",
      bp_systolic: "148",
      bp_diastolic: "92",
      bp_position: "Sitting",
      respiratory_rate: "20",
      respiration_status: "Normal",
      spo2: "95"
    },
    'e2222222-2222-2222-2222-222222222222': {
      temperature: "37.8",
      temp_method: "Oral",
      pulse: "92",
      pulse_location: "Radial",
      pulse_pattern: "Regular",
      bp_systolic: "145",
      bp_diastolic: "88",
      bp_position: "Sitting",
      respiratory_rate: "20",
      respiration_status: "Normal",
      spo2: "94"
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
      temperature: "37.2",
      temp_method: "Oral",
      pulse: "78",
      pulse_location: "Radial",
      pulse_pattern: "Regular",
      bp_systolic: "125",
      bp_diastolic: "80", 
      bp_position: "Sitting",
      respiratory_rate: "18",
      respiration_status: "Normal",
      spo2: "98"
    },
    medium: {
      temperature: "36.8",
      pulse: "82",
      bp_systolic: "130",
      bp_diastolic: "85",
      spo2: "97"
      // Partial vitals for medium coverage
    },
    low: {
      temperature: "37.0",
      pulse: "80"
      // Very limited vitals for low coverage  
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
    
    console.log('eVital: Fetching vital signs for patient:', patientId);
    
    // Check for patient-specific data first
    const specificData = getPatientSpecificData(patientId);
    if (specificData) {
      console.log(`Using patient-specific data for ${patientId}`);
      
      // Store in cache
      const cacheData = {
        patient_id: patientId,
        system_name: 'evital',
        cache_key: 'vital_signs',
        cached_data: specificData,
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      };

      const { error: cacheError } = await supabase
        .from('external_data_cache')
        .upsert(cacheData);

      if (cacheError) {
        console.error('Error caching eVital data:', cacheError);
      }

      return new Response(JSON.stringify({
        success: true,
        data: specificData,
        source: 'eVital',
        coverage: 'high',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const coverage = getPatientCoverage(patientId);
    console.log(`Patient ${patientId} has ${coverage} coverage`);
    
    // Simulate system unavailability for 'none' coverage and some 'low' coverage cases
    if (coverage === 'none' || (coverage === 'low' && Math.random() < 0.5)) {
      throw new Error('eVital system connection timeout');
    }
    
    const mockData = getMockDataForCoverage(coverage);

    // Store in cache
    const cacheData = {
      patient_id: patientId,
      system_name: 'evital',
      cache_key: 'vital_signs',
      cached_data: mockData,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
    };

    const { error: cacheError } = await supabase
      .from('external_data_cache')
      .upsert(cacheData);

    if (cacheError) {
      console.error('Error caching eVital data:', cacheError);
    }

    return new Response(JSON.stringify({
      success: true,
      data: mockData,
      source: 'eVital',
      coverage: coverage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in eVital vitals function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      source: 'eVital'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});