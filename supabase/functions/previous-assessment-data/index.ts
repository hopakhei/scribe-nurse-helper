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
    },
    medium: {
      marital_status: "Single",
      religion: "Christianity",
      education: "Primary", 
      smoking_status: "Non-smoker",
      drinking_status: "Social drinker",
      primary_language: "Mandarin",
      hearing_aids: "No"
      // Partial historical data for medium coverage
    },
    low: {
      marital_status: "Married",
      smoking_status: "Ex-smoker",
      primary_language: "English"
      // Very limited historical data for low coverage
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
    
    console.log('History: Fetching data for patient:', patientId);

    const coverage = getPatientCoverage(patientId);
    console.log(`Patient ${patientId} has ${coverage} coverage`);
    
    // Simulate no historical data for 'none' coverage
    if (coverage === 'none') {
      return new Response(JSON.stringify({
        success: true,
        data: {},
        source: 'History',
        coverage: coverage,
        message: 'No previous assessment data available',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const mockData = getMockDataForCoverage(coverage);

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
      console.error('Error caching History data:', cacheError);
    }

    return new Response(JSON.stringify({
      success: true,
      data: mockData,
      source: 'History',
      coverage: coverage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in History function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      source: 'History'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});