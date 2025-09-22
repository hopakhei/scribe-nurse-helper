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
    
    console.log('Alert Function: Fetching MDRO tags for patient:', patientId);

    // Mock MDRO (Multi-Drug Resistant Organism) alert data
    const mockData = {
      mdro_status: "Positive",
      mdro_organism: "MRSA",
      mdro_site: "Wound swab",
      mdro_date_identified: "2024-01-15",
      isolation_precautions: "Contact precautions",
      alert_level: "High",
      previous_mdro_history: "Yes",
      screening_required: "Yes"
    };

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