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