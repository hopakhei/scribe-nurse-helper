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
    
    console.log('Previous Assessment: Fetching data for patient:', patientId);

    // Mock previous assessment data for social and communication
    const mockData = {
      // Social data
      marital_status: "Married",
      religion: "Buddhism", 
      education: "Secondary",
      employment_status: "Retired",
      occupation: "Teacher",
      financial_support: "Self",
      accommodation: "Own home",
      nationality: "Singaporean",
      household_members: ["Spouse", "Children"],
      smoking_status: "Non-smoker",
      drinking_status: "Ex-drinker",
      drinking_start_since: "20",
      substance_status: "Non-user",
      
      // Communication data
      primary_language: "English",
      dialect: "Hokkien",
      communication_barriers: "None",
      hearing_aids: "No",
      visual_aids: "Reading glasses",
      speech_difficulties: "None"
    };

    // Store in cache
    const cacheData = {
      patient_id: patientId,
      system_name: 'previous-assessment',
      cache_key: 'social_communication',
      cached_data: mockData,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    const { error: cacheError } = await supabase
      .from('external_data_cache')
      .upsert(cacheData);

    if (cacheError) {
      console.error('Error caching previous assessment data:', cacheError);
    }

    return new Response(JSON.stringify({
      success: true,
      data: mockData,
      source: 'Previous Assessment',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in previous assessment function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      source: 'Previous Assessment'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});