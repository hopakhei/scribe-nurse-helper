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
    
    console.log('OPAS: Fetching emergency contacts for patient:', patientId);

    // Mock OPAS emergency contact data
    const mockData = {
      emergency_contact_1_name: "Sarah Johnson",
      emergency_contact_1_relationship: "Daughter",
      emergency_contact_1_phone: "+65 9123 4567",
      emergency_contact_2_name: "Michael Chen",
      emergency_contact_2_relationship: "Son",
      emergency_contact_2_phone: "+65 8765 4321"
    };

    // Store in cache
    const cacheData = {
      patient_id: patientId,
      system_name: 'opas',
      cache_key: 'emergency_contacts',
      cached_data: mockData,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    const { error: cacheError } = await supabase
      .from('external_data_cache')
      .upsert(cacheData);

    if (cacheError) {
      console.error('Error caching OPAS data:', cacheError);
    }

    return new Response(JSON.stringify({
      success: true,
      data: mockData,
      source: 'OPAS',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in OPAS emergency contacts function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      source: 'OPAS'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});