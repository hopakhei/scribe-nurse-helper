
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubmissionRequest {
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

    const { assessmentId }: SubmissionRequest = await req.json()

    // Mark assessment as completed
    const { error: assessmentError } = await supabaseClient
      .from('patient_assessments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', assessmentId)

    if (assessmentError) {
      throw assessmentError
    }

    // Get assessment details to update patient status
    const { data: assessmentData, error: assessmentFetchError } = await supabaseClient
      .from('patient_assessments')
      .select('patient_id')
      .eq('id', assessmentId)
      .single()

    if (assessmentFetchError) {
      throw assessmentFetchError
    }

    // Update patient status to assessment_completed
    const { error: patientError } = await supabaseClient
      .from('patients')
      .update({ 
        patient_status: 'assessment_completed'
      })
      .eq('id', assessmentData.patient_id)

    if (patientError) {
      throw patientError
    }

    // Get complete assessment data for EMR submission
    const { data: assessment, error: fetchError } = await supabaseClient
      .from('patient_assessments')
      .select(`
        *,
        patients (*),
        form_field_values (*),
        risk_scores (*)
      `)
      .eq('id', assessmentId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Clean up expired audio transcripts
    await supabaseClient.rpc('cleanup_expired_transcripts')

    // In production, this would submit to actual EMR system
    console.log('Assessment submitted to EMR:', assessment)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Assessment successfully submitted to EMR',
        assessmentId: assessmentId
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
