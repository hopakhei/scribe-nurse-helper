
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RiskCalculationRequest {
  assessmentId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { assessmentId }: RiskCalculationRequest = await req.json()

    // Calculate Morse Fall Scale using database function
    const { data: morseScore, error: morseError } = await supabaseClient
      .rpc('calculate_morse_fall_score', { assessment_id_param: assessmentId })

    if (morseError) {
      throw morseError
    }

    // Calculate risk level for Morse Fall Scale
    let morseRiskLevel: 'low' | 'medium' | 'high' = 'low'
    if (morseScore >= 45) morseRiskLevel = 'high'
    else if (morseScore >= 25) morseRiskLevel = 'medium'

    // Calculate MST score (simple example)
    const { data: mstFields, error: mstError } = await supabaseClient
      .from('form_field_values')
      .select('field_id, value')
      .eq('assessment_id', assessmentId)
      .in('field_id', ['mst-weight-loss', 'mst-poor-appetite'])

    if (mstError) {
      throw mstError
    }

    let mstScore = 0
    mstFields?.forEach(field => {
      if (field.field_id === 'mst-weight-loss') {
        if (field.value?.includes('1 point')) mstScore += 1
        if (field.value?.includes('2 points')) mstScore += 2
        if (field.value?.includes('3 points')) mstScore += 3
        if (field.value?.includes('4 points')) mstScore += 4
      }
      if (field.field_id === 'mst-poor-appetite' && field.value?.includes('Yes')) {
        mstScore += 1
      }
    })

    let mstRiskLevel: 'low' | 'medium' | 'high' = 'low'
    if (mstScore >= 2) mstRiskLevel = 'medium'
    if (mstScore >= 4) mstRiskLevel = 'high'

    // Update risk scores in database
    const riskScores = [
      {
        assessment_id: assessmentId,
        score_name: 'Morse Fall Scale',
        score_value: morseScore || 0,
        max_score: 125,
        risk_level: morseRiskLevel,
        description: morseRiskLevel === 'high' ? 'High risk for falls' : 
                    morseRiskLevel === 'medium' ? 'Medium fall risk' : 'Low fall risk'
      },
      {
        assessment_id: assessmentId,
        score_name: 'Malnutrition (MST)',
        score_value: mstScore,
        max_score: 5,
        risk_level: mstRiskLevel,
        description: mstRiskLevel === 'high' ? 'High malnutrition risk' : 
                    mstRiskLevel === 'medium' ? 'Medium malnutrition risk' : 'Low malnutrition risk'
      }
    ]

    const { error: scoresError } = await supabaseClient
      .from('risk_scores')
      .upsert(riskScores, { onConflict: 'assessment_id,score_name' })

    if (scoresError) {
      throw scoresError
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        scores: riskScores
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
