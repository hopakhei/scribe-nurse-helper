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
    const { patientId } = await req.json();
    
    console.log('eVital: Fetching vital signs for patient:', patientId);

    // Mock eVital vital signs data
    const mockData = {
      temperature: "37.2",
      temp_method: "Tympanic",
      pulse: "78",
      pulse_location: "Radial",
      pulse_pattern: "Regular",
      bp_systolic: "124",
      bp_diastolic: "82",
      bp_position: "Sitting",
      respiratory_rate: "16",
      respiration_status: "Normal",
      spo2: "98"
    };

    // Store in cache
    const cacheData = {
      patient_id: patientId,
      system_name: 'evital',
      cache_key: 'vital_signs',
      cached_data: mockData,
      expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
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