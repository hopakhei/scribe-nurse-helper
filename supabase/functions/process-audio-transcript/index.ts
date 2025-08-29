
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  confidenceScore?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with the user's JWT for RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    // Verify auth context and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { assessmentId, transcriptText } = await req.json();
    
    if (!assessmentId || !transcriptText) {
      throw new Error('Missing required parameters: assessmentId and transcriptText');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing transcript with AI:', transcriptText.substring(0, 100) + '...');

    // Ensure a patient_assessments row exists for this assessment (needed for RLS on related tables)
    const { data: paRows, error: paSelectError } = await supabase
      .from('patient_assessments')
      .select('id')
      .eq('id', assessmentId)
      .limit(1);

    if (paSelectError) {
      console.error('Error checking patient_assessments:', paSelectError);
    } else if (!paRows || paRows.length === 0) {
      const { error: paInsertError } = await supabase
        .from('patient_assessments')
        .insert({ id: assessmentId, user_id: user.id });
      if (paInsertError) {
        console.error('Error creating patient assessment:', paInsertError);
      }
    }

    // Store the raw transcript in the database
    const { data: transcript, error: insertError } = await supabase
      .from('audio_transcripts')
      .insert({
        assessment_id: assessmentId,
        user_id: user.id,
        transcript_text: transcriptText,
        processed: false,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting transcript:', insertError);
      throw insertError;
    }

    console.log('Transcript stored with ID:', transcript.id);

    // Use OpenAI GPT to intelligently extract form fields from the transcript
    const extractedFields: FieldMapping[] = await extractFieldsWithAI(transcriptText, openAIApiKey);
    
    console.log('Extracted fields:', extractedFields.length);

    // Store extracted fields in the database and update transcript with extracted fields
    if (extractedFields.length > 0) {
      for (const field of extractedFields) {
        const { error: upsertError } = await supabase
          .from('form_field_values')
          .upsert({
            assessment_id: assessmentId,
            field_id: field.fieldId,
            section_id: field.sectionId,
            field_label: field.fieldLabel,
            value: field.value,
            data_source: 'ai-filled',
            ai_source_text: field.aiSourceText
          });

        if (upsertError) {
          console.error('Error upserting field:', field.fieldId, upsertError);
        }
      }

      // Update transcript as processed
      const { error: updateTranscriptError } = await supabase
        .from('audio_transcripts')
        .update({ processed: true })
        .eq('id', transcript.id);

      if (updateTranscriptError) {
        console.error('Error updating transcript:', updateTranscriptError);
      }
    } else {
      // Mark transcript as processed even if no fields extracted
      const { error: updateError } = await supabase
        .from('audio_transcripts')
        .update({ processed: true })
        .eq('id', transcript.id);

      if (updateError) {
        console.error('Error updating transcript:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedFields: extractedFields.length,
        transcriptId: transcript.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in process-audio-transcript function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// AI-powered field extraction using OpenAI GPT-4
async function extractFieldsWithAI(transcriptText: string, apiKey: string): Promise<FieldMapping[]> {
  try {
    const systemPrompt = `You are a medical AI assistant helping nurses extract patient information from conversation transcripts to fill out patient assessment forms.

EXACT FORM FIELD IDs (use these exactly):
- morse_history_falling: "No (0)" or "Yes (25)"
- morse_secondary_diagnosis: "No (0)" or "Yes (15)" 
- morse_ambulatory_aid: "None/bed rest/nurse assist (0)" or "Crutches/cane/walker (15)" or "Furniture (30)"
- morse_iv_heparin: "No (0)" or "Yes (20)"
- morse_gait: "Normal/bed rest/immobile (0)" or "Weak (10)" or "Impaired (20)"
- morse_mental_status: "Oriented to own ability (0)" or "Forgets limitations (15)"

SECTION MAPPING:
- All morse_* fields belong to section "risk"

CRITICAL RULES:
1. Use EXACT field IDs from the list above
2. Use EXACT option values in parentheses
3. Only extract information explicitly mentioned or clearly implied
4. For fall history: if patient mentions falling, use "Yes (25)"
5. For gait: if mentions walking problems/instability, use "Impaired (20)"
6. For mental status: if mentions forgetting limitations/confusion, use "Forgets limitations (15)"

Return JSON array with:
- fieldId: exact field ID from list
- sectionId: "risk" 
- fieldLabel: human readable label
- value: exact option value with score
- aiSourceText: relevant quote from transcript
- confidenceScore: 0.0-1.0`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract patient information from this transcript: "${transcriptText}"` }
        ],
        max_tokens: 2000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse JSON from the response
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (parseError) {
      // If direct JSON parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\[([\s\S]*?)\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1].trim());
        return Array.isArray(parsed) ? parsed : [];
      }
      console.error('Failed to parse AI response:', content);
      return [];
    }

  } catch (error) {
    console.error('Error in AI field extraction:', error);
    return [];
  }
}
