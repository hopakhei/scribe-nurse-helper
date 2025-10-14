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
      marital_status: 'Married',
      religion: 'Buddhism',
      education_level: 'Primary',
      employment_status: 'Retired',
      previous_occupation: 'Construction Worker',
      financial_support: 'Children',
      accommodation_type: 'Public housing',
      living_arrangement: 'With spouse',
      nationality: 'Hong Kong Permanent Resident',
      smoking_history: 'Ex-smoker',
      smoking_details: 'Quit 5 years ago, 20 pack-year history',
      drinking_history: 'Social drinker',
      drinking_details: 'Occasional beer on weekends',
      primary_language: 'Cantonese',
      secondary_language: 'Limited English',
      dialect: 'Hokkien',
      hearing_aids: 'Yes',
      hearing_aids_details: 'Right ear, worn daily',
      visual_aids: 'Bifocals',
      visual_aids_details: 'For reading',
      communication_barriers: 'Mild hearing impairment',
      communication_notes: 'Prefers loud clear speech'
    },
    'c2222222-2222-2222-2222-222222222222': {
      marital_status: 'Widower',
      marital_notes: 'Spouse passed 2 years ago',
      religion: 'Christianity',
      religion_notes: 'Active church member',
      education_level: 'Secondary',
      education_details: 'Form 5',
      employment_status: 'Retired',
      previous_occupation: 'Bank Clerk',
      financial_support: 'Pension and children',
      accommodation_type: 'Private housing',
      accommodation_details: 'Owned apartment',
      living_arrangement: 'With daughter\'s family',
      nationality: 'Hong Kong Permanent Resident',
      smoking_history: 'Never smoked',
      drinking_history: 'Never drinks alcohol',
      primary_language: 'Cantonese',
      secondary_language: 'Mandarin (fluent), English (conversational)',
      dialect: 'None',
      hearing_aids: 'No',
      visual_aids: 'Reading glasses',
      communication_barriers: 'None',
      communication_notes: 'Clear speech and comprehension'
    },
    'c3333333-3333-3333-3333-333333333333': {
      marital_status: 'Divorced',
      marital_notes: 'Separated 10 years ago',
      religion: 'None',
      religion_notes: 'Secular',
      education_level: 'Tertiary',
      education_details: 'University graduate',
      employment_status: 'Employed',
      current_occupation: 'Marketing Manager',
      financial_support: 'Self-supporting',
      financial_notes: 'Owns property',
      accommodation_type: 'Private housing',
      accommodation_details: 'Owned flat',
      living_arrangement: 'Lives alone',
      living_notes: 'Children visit regularly',
      nationality: 'Hong Kong Permanent Resident with foreign passport',
      smoking_history: 'Never smoked',
      drinking_history: 'Occasional social drinker',
      drinking_details: 'Wine with dinner',
      primary_language: 'English',
      language_proficiency: 'Native level',
      secondary_language: 'Cantonese (fluent), Mandarin (basic)',
      dialect: 'None',
      hearing_aids: 'No',
      visual_aids: 'Contact lenses',
      visual_aids_details: 'Daily wear',
      communication_barriers: 'None',
      communication_notes: 'Highly articulate, prefers English for medical discussions'
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

    // Check for patient-specific data first
    const specificData = getPatientSpecificData(patientId);
    if (specificData) {
      console.log(`Using patient-specific data for ${patientId}`);
      
      // Store in cache
      const cacheData = {
        patient_id: patientId,
        system_name: 'previous-assessment',
        cache_key: 'social_communication',
        cached_data: specificData,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { error: cacheError } = await supabase
        .from('external_data_cache')
        .upsert(cacheData);

      if (cacheError) {
        console.error('Error caching History data:', cacheError);
      }

      return new Response(JSON.stringify({
        success: true,
        data: specificData,
        source: 'History',
        coverage: 'high',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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