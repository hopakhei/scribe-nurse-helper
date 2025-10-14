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
      contact_1_name: 'Wong Mei Ling (陳美玲)',
      contact_1_relationship: 'Wife',
      contact_1_phone: '+852 9123 4567',
      contact_2_name: 'Chan Ka Fai (陳嘉輝)',
      contact_2_relationship: 'Son',
      contact_2_phone: '+852 8765 4321'
    },
    'c2222222-2222-2222-2222-222222222222': {
      contact_1_name: 'Suen Wai Han (孫惠嫻)',
      contact_1_relationship: 'Daughter',
      contact_1_phone: '+852 9876 5432',
      contact_2_name: 'Suen Ming Tat (孫明達)',
      contact_2_relationship: 'Son',
      contact_2_phone: '+852 8765 1234'
    },
    'c3333333-3333-3333-3333-333333333333': {
      contact_1_name: 'David Hung (洪大衛)',
      contact_1_relationship: 'Son',
      contact_1_phone: '+852 8888 8888',
      contact_2_name: 'Emily Hung (洪詠琳)',
      contact_2_relationship: 'Daughter',
      contact_2_phone: '+852 7777 7777'
    },
    'e1111111-1111-1111-1111-111111111111': {
      contact_1_name: 'NAT MEI KEI (楊美琪)',
      contact_1_relationship: 'Daughter',
      contact_1_phone: '+852 9234 5678',
      contact_2_name: 'NAT CHI KEUNG (楊志強)',
      contact_2_relationship: 'Son',
      contact_2_phone: '+852 9876 5432',
      contact_3_name: 'CHAN SUK FAN (陳淑芬)',
      contact_3_relationship: 'Niece',
      contact_3_phone: '+852 6543 2109'
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
      emergency_contact_1_name: "Sarah Chen",
      emergency_contact_1_relationship: "Spouse", 
      emergency_contact_1_phone: "+65 9123 4567",
      emergency_contact_2_name: "Michael Chen",
      emergency_contact_2_relationship: "Son",
      emergency_contact_2_phone: "+65 8765 4321"
    },
    medium: {
      emergency_contact_1_name: "Maria Santos",
      emergency_contact_1_relationship: "Daughter",
      emergency_contact_1_phone: "+65 9876 5432"
      // Only one contact for medium coverage
    },
    low: {
      emergency_contact_1_name: "John Doe",
      emergency_contact_1_phone: "+65 8888 8888"
      // Minimal data for low coverage
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
    
    console.log('OPAS: Fetching emergency contacts for patient:', patientId);

    // Check for patient-specific data first
    const specificData = getPatientSpecificData(patientId);
    if (specificData) {
      console.log(`Using patient-specific data for ${patientId}`);
      
      // Store in cache
      const cacheData = {
        patient_id: patientId,
        system_name: 'opas',
        cache_key: 'emergency_contacts',
        cached_data: specificData,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const { error: cacheError } = await supabase
        .from('external_data_cache')
        .upsert(cacheData);

      if (cacheError) {
        console.error('Error caching OPAS data:', cacheError);
      }

      return new Response(JSON.stringify({
        success: true,
        data: specificData,
        source: 'OPAS',
        coverage: 'high',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const coverage = getPatientCoverage(patientId);
    console.log(`Patient ${patientId} has ${coverage} coverage`);
    
    // Simulate system unavailability for 'none' coverage
    if (coverage === 'none') {
      throw new Error('OPAS system temporarily unavailable');
    }
    
    const mockData = getMockDataForCoverage(coverage);

    // Store in cache
    const cacheData = {
      patient_id: patientId,
      system_name: 'opas',
      cache_key: 'emergency_contacts',
      cached_data: mockData,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
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
      coverage: coverage,
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