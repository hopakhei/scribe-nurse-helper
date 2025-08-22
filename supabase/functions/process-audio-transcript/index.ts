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

    // Store extracted fields in the database
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
    }

    // Mark transcript as processed
    const { error: updateError } = await supabase
      .from('audio_transcripts')
      .update({ processed: true })
      .eq('id', transcript.id);

    if (updateError) {
      console.error('Error updating transcript:', updateError);
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

FORM SECTIONS AND FIELDS:
1. general-physical: emergency-contact-1-name, emergency-contact-1-relationship, current-complaint, temperature, temperature-method, pulse, bp-systolic, bp-diastolic, respiratory-rate, spo2, coughing, sputum, sputum-colour
2. social: marital-status, religion, education, employment-status, household-members, accommodation, smoking-status, drinking-status
3. risk: cpe-screening, morse-history-falling, morse-secondary-diagnosis, morse-ambulatory-aid, morse-iv-therapy, morse-gait, morse-mental-status
4. functional: vision-left, vision-right, hearing-left, hearing-right, communication, mobility, activities-daily-living
5. elimination-nutrition: bowel-pattern, bladder-pattern, appetite, dietary-restrictions, swallowing-difficulty
6. skin: skin-condition, pressure-areas, wound-presence
7. pain-emotional: pain-score, pain-location, anxiety-level, mood-assessment

Extract relevant information and map it to specific form fields. Return JSON array of field mappings with:
- fieldId: exact field ID from above list
- sectionId: section name 
- fieldLabel: human readable label
- value: extracted value (use exact option values for select fields)
- aiSourceText: relevant quote from transcript
- confidenceScore: 0.0-1.0 confidence level

SELECT FIELD VALUES (use exact text):
- coughing: ["Yes", "No"]
- sputum: ["Yes", "No"] 
- sputum-colour: ["Clear", "White", "Yellow", "Green", "Cream colour", "Coffee/Rusty", "Blood-stained"]
- morse-history-falling: ["No (0 points)", "Yes (25 points)"]
- morse-secondary-diagnosis: ["No (0 points)", "Yes (15 points)"]
- morse-ambulatory-aid: ["None/Bed rest/Nurse assist (0 points)", "Crutches/Cane/Walkers (15 points)", "Furniture (30 points)"]
- morse-iv-therapy: ["No (0 points)", "Yes (20 points)"]
- morse-gait: ["Normal/Bed rest/Wheelchair (0 points)", "Weak (10 points)", "Impaired (20 points)"]
- morse-mental-status: ["Oriented to own ability (0 points)", "Overestimates/Forgets limitations (15 points)"]

Only extract information that is explicitly mentioned or clearly implied. Use medical terminology when appropriate.`;

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