
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranscriptRequest {
  assessmentId: string;
  transcriptText: string;
}

interface FieldMapping {
  fieldId: string;
  sectionId: string;
  fieldLabel: string;
  value: string;
  aiSourceText: string;
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

    const { assessmentId, transcriptText }: TranscriptRequest = await req.json()

    // Store the transcript temporarily
    const { error: transcriptError } = await supabaseClient
      .from('audio_transcripts')
      .insert({
        assessment_id: assessmentId,
        transcript_text: transcriptText,
        processed: false
      })

    if (transcriptError) {
      throw transcriptError
    }

    // Mock AI processing - In production, this would call OpenAI API
    // This simulates extracting clinical information from conversation
    const fieldMappings: FieldMapping[] = []

    // Simple keyword matching for demo - replace with actual AI processing
    if (transcriptText.includes('咳') || transcriptText.includes('cough')) {
      fieldMappings.push({
        fieldId: 'coughing',
        sectionId: 'general-physical',
        fieldLabel: 'Coughing',
        value: 'Yes',
        aiSourceText: transcriptText.substring(0, 100) + '...'
      })
    }

    if (transcriptText.includes('黃色') || transcriptText.includes('yellow')) {
      fieldMappings.push({
        fieldId: 'sputum-colour',
        sectionId: 'general-physical',
        fieldLabel: 'Sputum Colour',
        value: 'Yellow',
        aiSourceText: transcriptText.substring(0, 100) + '...'
      })
    }

    if (transcriptText.includes('跌') || transcriptText.includes('fall')) {
      fieldMappings.push({
        fieldId: 'morse-history-falling',
        sectionId: 'risk',
        fieldLabel: 'Morse Fall Scale - History of Falling',
        value: 'Yes (25 points)',
        aiSourceText: transcriptText.substring(0, 100) + '...'
      })
    }

    // Insert field mappings into database
    if (fieldMappings.length > 0) {
      const { error: fieldsError } = await supabaseClient
        .from('form_field_values')
        .upsert(
          fieldMappings.map(mapping => ({
            assessment_id: assessmentId,
            section_id: mapping.sectionId,
            field_id: mapping.fieldId,
            field_label: mapping.fieldLabel,
            value: mapping.value,
            data_source: 'ai-filled',
            ai_source_text: mapping.aiSourceText
          })),
          { onConflict: 'assessment_id,field_id' }
        )

      if (fieldsError) {
        throw fieldsError
      }
    }

    // Mark transcript as processed
    const { error: updateError } = await supabaseClient
      .from('audio_transcripts')
      .update({ processed: true })
      .eq('assessment_id', assessmentId)
      .eq('transcript_text', transcriptText)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        fieldsProcessed: fieldMappings.length,
        mappings: fieldMappings 
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
