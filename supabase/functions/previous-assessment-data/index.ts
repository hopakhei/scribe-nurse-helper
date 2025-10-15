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
      diagnosis: "Acute Exacerbation of COPD, Type 2 Diabetes Mellitus",
      allergies: "Penicillin (anaphylaxis), Iodine contrast (severe reaction)",
      current_medications: "Salbutamol inhaler PRN, Spiriva 18mcg OD, Metformin 850mg BD, Insulin Glargine 20 units HS",
      past_medical_history: "COPD diagnosed 2018, T2DM since 2015, Previous MI (2020), Hypertension",
      mobility: "Requires wheelchair for long distances",
      fall_risk: "Moderate risk",
      cognitive_status: "Alert and oriented x3",
      diet: "Diabetic diet",
      functional_status: "Requires assistance with ADLs",
      pain_level: "4/10 chest tightness",
      wound_status: "No active wounds",
      last_admission_date: "2025-09-01",
      last_discharge_date: "2025-09-15"
    },
    'c2222222-2222-2222-2222-222222222222': {
      diagnosis: "Congestive Heart Failure NYHA Class III, Atrial Fibrillation",
      allergies: "Aspirin (GI bleeding), Morphine (nausea)",
      current_medications: "Furosemide 40mg BD, Bisoprolol 5mg OD, Warfarin 3mg OD, Digoxin 0.125mg OD",
      past_medical_history: "Heart failure since 2020, AF diagnosed 2019, Previous DVT (2018)",
      mobility: "Walking with frame, short distances only",
      fall_risk: "High risk due to dizziness",
      cognitive_status: "Mild cognitive impairment",
      diet: "Low sodium, fluid restriction 1.5L/day",
      functional_status: "Independent in basic self-care with aids",
      pain_level: "2/10 occasional chest discomfort",
      wound_status: "Bilateral leg edema, no breakdown",
      last_admission_date: "2025-08-10",
      last_discharge_date: "2025-08-25"
    },
    'c3333333-3333-3333-3333-333333333333': {
      diagnosis: "End-stage Renal Disease on Hemodialysis, Secondary Hyperparathyroidism",
      allergies: "No known drug allergies",
      current_medications: "Calcium carbonate 500mg TDS, Erythropoietin 4000 units weekly, Iron supplement",
      past_medical_history: "ESRD since 2021, on HD 3x/week, Diabetic nephropathy, Anemia of CKD",
      mobility: "Independent ambulation",
      fall_risk: "Low to moderate risk",
      cognitive_status: "Alert and oriented x3",
      diet: "Renal diet, potassium and phosphate restricted",
      functional_status: "Independent in most ADLs",
      pain_level: "3/10 at dialysis access site",
      wound_status: "Left arm AV fistula - patent and functioning",
      last_admission_date: "2025-07-15",
      last_discharge_date: "2025-07-30"
    },
    'e1111111-1111-1111-1111-111111111111': {
      diagnosis: "Type 2 Diabetes Mellitus, Hypertension, Chronic Kidney Disease Stage 3",
      allergies: "Penicillin (rash), Sulfa drugs (hives)",
      current_medications: "Metformin 500mg BD, Amlodipine 5mg OD, Aspirin 100mg OD, Atorvastatin 20mg ON",
      past_medical_history: "Previous stroke (2022), BPH, Osteoarthritis",
      mobility: "Walking with cane",
      fall_risk: "High risk - history of falls",
      cognitive_status: "Alert and oriented x3, mild forgetfulness",
      diet: "Diabetic diet, low sodium",
      functional_status: "Independent in most ADLs, needs assistance with bathing",
      pain_level: "3/10 chronic lower back pain",
      wound_status: "Stage 2 pressure ulcer on left heel - healing",
      last_admission_date: "2025-08-10",
      last_discharge_date: "2025-08-22"
    },
    'e2222222-2222-2222-2222-222222222222': {
      diagnosis: "Stroke (CVA) with right-sided weakness, Type 2 Diabetes Mellitus, Hypertension, Chronic Kidney Disease Stage 3, Benign Prostatic Hyperplasia",
      allergies: "Penicillin (rash), Sulfa drugs (hives)",
      current_medications: "Aspirin 100mg OD, Clopidogrel 75mg OD, Metformin 500mg BD, Amlodipine 5mg OD, Atorvastatin 20mg ON, Tamsulosin 0.4mg OD",
      past_medical_history: "Stroke (2023) with residual right-sided weakness, T2DM since 2018, Hypertension since 2015, CKD Stage 3 (2020), BPH",
      mobility: "Walking with 4-wheeled walker, requires supervision",
      fall_risk: "High risk - history of 2 falls in past 6 months",
      cognitive_status: "Alert and oriented x3, mild forgetfulness reported",
      diet: "Diabetic diet, low sodium, texture modified (soft diet)",
      functional_status: "Requires assistance with ADLs - bathing, dressing; independent with feeding",
      pain_level: "4/10 chronic right shoulder pain (post-stroke)",
      wound_status: "Stage 2 pressure ulcer on left heel - currently healing with dressing",
      marital_status: "Married",
      religion: "Buddhism",
      education: "Primary",
      employment_status: "Retired",
      occupation: "Factory worker",
      financial_support: "Family",
      accommodation: "Flat (no elevator, 3rd floor)",
      nationality: "Hong Kong Chinese",
      household_members: "Wife, Son (visits regularly)",
      smoking_status: "Ex-smoker (quit 10 years ago)",
      drinking_status: "Non-drinker",
      substance_status: "Non-user",
      primary_language: "Cantonese",
      dialect: "Cantonese",
      communication_barriers: "Mild dysarthria (speech difficulty post-stroke)",
      hearing_aids: "No",
      visual_aids: "Reading glasses",
      speech_difficulties: "Mild dysarthria",
      last_admission_date: "2025-08-10",
      last_discharge_date: "2025-08-22"
    },
    'f3333333-3333-3333-3333-333333333333': {
      diagnosis: "Pneumonia with Sepsis, Type 2 Diabetes Mellitus with complications, Hypertension, Chronic Obstructive Pulmonary Disease, Benign Prostatic Hyperplasia",
      allergies: "Penicillin (anaphylaxis), Sulfa drugs (severe rash)",
      current_medications: "Ceftriaxone 2g IV BD, Azithromycin 500mg OD, Metformin 1000mg BD, Insulin Glargine 24 units HS, Amlodipine 10mg OD, Spiriva 18mcg OD, Salbutamol inhaler PRN",
      past_medical_history: "T2DM since 2016, COPD diagnosed 2019, Hypertension since 2014, Previous MI (2021), BPH",
      mobility: "Walking with 4-wheeled walker, requires assistance",
      fall_risk: "Very high risk - history of 3 falls in past 6 months",
      cognitive_status: "Alert and oriented x2 (person and place only, confused about time)",
      diet: "Diabetic diet, low sodium, soft texture",
      functional_status: "Requires full assistance with ADLs - bathing, dressing, toileting; needs feeding assistance",
      pain_level: "6/10 (chest pain and productive cough)",
      wound_status: "Stage 3 pressure ulcer on sacrum - 4cm x 3cm, granulating tissue, daily dressing changes",
      marital_status: "Widowed",
      religion: "Taoism",
      education: "Primary only",
      employment_status: "Retired",
      occupation: "Construction worker",
      financial_support: "Children",
      accommodation: "Public housing (HDB), 4th floor with elevator",
      nationality: "Hong Kong Chinese",
      household_members: "Lives with son and daughter-in-law",
      smoking_status: "Ex-smoker (quit 5 years ago, 40 pack-year history)",
      drinking_status: "Social drinker (1-2 beers on weekends)",
      substance_status: "Non-user",
      primary_language: "Cantonese",
      dialect: "Hakka",
      communication_barriers: "Mild hearing impairment",
      hearing_aids: "Yes - bilateral hearing aids",
      visual_aids: "Reading glasses",
      speech_difficulties: "None",
      appetite: "Poor",
      dietary_restrictions: "Diabetic, avoid high potassium",
      bowel_pattern: "Constipated (last BM 3 days ago)",
      urinary_pattern: "Frequency and nocturia (BPH-related)",
      morse_history_falling: "Yes (25 points)",
      morse_secondary_diagnosis: "Yes (15 points)",
      morse_ambulatory_aid: "Crutches/Cane/Walkers (15 points)",
      morse_iv_therapy: "Yes (20 points)",
      morse_gait: "Impaired (20 points)",
      morse_mental_status: "Overestimates/Forgets limitations (15 points)",
      last_admission_date: "2025-09-01",
      last_discharge_date: "2025-09-18"
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