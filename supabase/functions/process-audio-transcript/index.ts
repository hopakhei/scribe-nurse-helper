
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

// Enhanced AI-powered field extraction using comprehensive field mapping
async function extractFieldsWithAI(transcriptText: string, apiKey: string): Promise<FieldMapping[]> {
  try {
    // Generate comprehensive field mapping for the AI
    const fieldMappingPrompt = generateFieldMappingPrompt();
    
    const systemPrompt = `You are an expert medical AI assistant specializing in extracting comprehensive patient information from clinical conversation transcripts to populate electronic health record assessment forms.

${fieldMappingPrompt}

EXTRACTION STRATEGY:
1. VITAL SIGNS PRIORITY: Always look for temperature, pulse, blood pressure, respiratory rate, SpO2
2. CLINICAL STATUS: Extract consciousness level, pain scores, complaints, symptoms
3. RISK FACTORS: Identify fall risks, mobility issues, cognitive status
4. FUNCTIONAL STATUS: Assess communication, elimination, nutrition, self-care abilities
5. SOCIAL FACTORS: Capture living situation, support systems, discharge needs

EXTRACTION RULES:
1. Extract ALL relevant information mentioned in the transcript
2. Use EXACT field IDs from the comprehensive mapping above
3. Match values to provided options when available
4. For numeric fields, extract exact values with units
5. Include confidence scores based on clarity of information
6. Reference the exact text that supports each extraction
7. Handle synonyms and medical terminology variations
8. Infer reasonable values when clearly implied

CRITICAL GUIDELINES:
- Prioritize patient safety information (vital signs, pain, consciousness)
- Extract multiple related fields when mentioned together (e.g., BP systolic/diastolic)
- Handle ranges and approximate values appropriately
- Consider clinical context and normal ranges
- Extract negative findings when explicitly stated

Return a JSON array with this exact structure:
[
  {
    "fieldId": "exact_field_id_from_mapping",
    "sectionId": "section_id",
    "fieldLabel": "Human readable field name",
    "value": "extracted_value_matching_expected_format",
    "aiSourceText": "exact quote from transcript supporting this extraction",
    "confidenceScore": 0.95
  }
]

RESPONSE FORMAT: Return only valid JSON array, no explanatory text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Upgraded to more capable model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract comprehensive patient information from this clinical transcript:\n\n"${transcriptText}"\n\nExtract all relevant assessment data following the field mapping guidelines.` }
        ],
        max_tokens: 4000, // Increased for comprehensive extraction
        temperature: 0.1,
        response_format: { type: "json_object" }, // Ensure JSON response
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI Response received, length:', content.length);
    
    // Enhanced JSON parsing with multiple fallback strategies
    try {
      // Try direct JSON parsing first
      let parsed = JSON.parse(content);
      
      // Handle different response structures
      if (parsed.extractions && Array.isArray(parsed.extractions)) {
        parsed = parsed.extractions;
      } else if (parsed.fields && Array.isArray(parsed.fields)) {
        parsed = parsed.fields;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        parsed = parsed.data;
      }
      
      const extractedFields = Array.isArray(parsed) ? parsed : [];
      
      // Validate and filter extracted fields
      const validatedFields = extractedFields
        .filter(field => field.fieldId && field.sectionId && field.value)
        .map(field => ({
          ...field,
          confidenceScore: field.confidenceScore || 0.8,
          aiSourceText: field.aiSourceText || 'Extracted from transcript'
        }));
      
      console.log(`Successfully extracted ${validatedFields.length} fields from transcript`);
      return validatedFields;
      
    } catch (parseError) {
      console.error('JSON parsing failed, trying alternative extraction');
      
      // Alternative: Extract from code blocks or arrays
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/\[([\s\S]*?)\]/) ||
                       content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
          const extractedFields = Array.isArray(parsed) ? parsed : [parsed];
          console.log(`Alternative parsing extracted ${extractedFields.length} fields`);
          return extractedFields.filter(field => field.fieldId && field.value);
        } catch (secondaryError) {
          console.error('Alternative parsing also failed:', secondaryError);
        }
      }
      
      // Final fallback: Try to extract individual field mentions
      console.log('Attempting basic field extraction from text content');
      return performBasicExtraction(content, transcriptText);
    }

  } catch (error) {
    console.error('Error in comprehensive AI field extraction:', error);
    // Fallback to basic extraction if AI fails
    return performBasicExtraction('', transcriptText);
  }
}

// Generate comprehensive field mapping prompt for AI
function generateFieldMappingPrompt(): string {
  return `
COMPREHENSIVE FIELD MAPPING - Use these EXACT field IDs and formats:

VITAL SIGNS (Physical Assessment):
- temperature: Number (°C) | Synonyms: temp, body temperature, fever, pyrexia | Normal: 36-37.5°C
- pulse: Number (bpm) | Synonyms: heart rate, HR, beats per minute | Normal: 60-100 bpm  
- bp_systolic: Number (mmHg) | Synonyms: systolic BP, upper BP | Normal: 100-140 mmHg
- bp_diastolic: Number (mmHg) | Synonyms: diastolic BP, lower BP | Normal: 60-90 mmHg
- respiratory_rate: Number (/min) | Synonyms: RR, breathing rate, breaths per minute | Normal: 12-20/min
- spo2: Number (%) | Synonyms: oxygen saturation, O2 sat, pulse oximetry | Normal: 95-100%

CLINICAL STATUS (Physical Assessment):
- current_complaint: Text | Synonyms: chief complaint, presenting complaint, main problem, symptoms
- level_of_consciousness: Select [Alert|Drowsy|Lethargic|Stuporous|Comatose] | Synonyms: LOC, alertness, mental state
- pain_scale: Number (0-10) | Synonyms: pain score, pain level, VAS score | 0=no pain, 10=worst pain
- pain_location: Text | Synonyms: where is pain, pain site, painful area

MORSE FALL RISK (Risk Assessment):
- morse_history_falling: Select ["No (0 points)"|"Yes (25 points)"] | Synonyms: fall history, previous falls
- morse_secondary_diagnosis: Select ["No (0 points)"|"Yes (15 points)"] | Synonyms: multiple diagnoses, comorbidities
- morse_ambulatory_aid: Select ["None/bed rest/nurse assist (0 points)"|"Crutches/cane/walker (15 points)"|"Furniture (30 points)"] | Synonyms: walking aid, mobility aid
- morse_iv_therapy: Select ["No (0 points)"|"Yes (20 points)"] | Synonyms: IV line, intravenous, heparin lock
- morse_gait: Select ["Normal/bed rest/immobile (0 points)"|"Weak (10 points)"|"Impaired (20 points)"] | Synonyms: walking pattern, gait pattern
- morse_mental_status: Select ["Oriented to own ability (0 points)"|"Forgets limitations (15 points)"] | Synonyms: mental state, cognition, awareness

COMMUNICATION (Communication/Respiration/Mobility):
- hearing_status: Select [Normal|Impaired|"Hearing aid"|Deaf] | Synonyms: hearing, auditory, deaf, hard of hearing
- vision_status: Select [Normal|Impaired|"Glasses/contacts"|"Legally blind"] | Synonyms: vision, sight, eyesight, glasses
- language_preferred: Text | Synonyms: language, speaks, communication language, interpreter needed

ELIMINATION:
- bowel_pattern: Select [Normal|Constipated|Diarrhea|Incontinence] | Synonyms: bowel movements, BM, stool, constipation
- urinary_pattern: Select [Normal|Frequency|Urgency|Incontinence|Retention] | Synonyms: urination, voiding, bladder

NUTRITION (Nutrition/Self-Care):
- appetite: Select [Good|Fair|Poor|NPO] | Synonyms: eating, food intake, hunger, nutrition
- dietary_restrictions: Text | Synonyms: diet, food allergies, special diet, diabetic diet

SOCIAL (Social Assessment):  
- living_arrangement: Select ["Lives alone"|"With family"|"With spouse"|"Nursing home"|"Assisted living"] | Synonyms: lives with, home situation
- discharge_planning_needs: Text | Synonyms: discharge planning, home care needs, follow-up care

GENERAL INFORMATION:
- emergency_contact_1_name: Text | Synonyms: emergency contact, next of kin, family contact
- emergency_contact_1_relationship: Text | Synonyms: relationship, family member, spouse, child, parent
- emergency_contact_1_phone: Text | Format: +65 #### #### | Synonyms: phone number, contact number, mobile

EXTRACTION PRIORITY: 1) Vital Signs, 2) Pain/Consciousness, 3) Fall Risk, 4) Communication, 5) Other assessments
`;
}

// Basic extraction fallback for when AI parsing fails
function performBasicExtraction(aiResponse: string, transcriptText: string): FieldMapping[] {
  const basicExtractions: FieldMapping[] = [];
  const text = transcriptText.toLowerCase();
  
  // Basic vital signs extraction using regex patterns
  const tempMatch = text.match(/(?:temp|temperature).*?(\d{1,2}\.?\d?)\s*°?c?/i);
  if (tempMatch) {
    basicExtractions.push({
      fieldId: 'temperature',
      sectionId: 'physical', 
      fieldLabel: 'Temperature',
      value: tempMatch[1] + '°C',
      aiSourceText: tempMatch[0],
      confidenceScore: 0.7
    });
  }
  
  const bpMatch = text.match(/(?:bp|blood pressure).*?(\d{2,3})\/(\d{2,3})/i);
  if (bpMatch) {
    basicExtractions.push({
      fieldId: 'bp_systolic',
      sectionId: 'physical',
      fieldLabel: 'Systolic BP', 
      value: bpMatch[1],
      aiSourceText: bpMatch[0],
      confidenceScore: 0.7
    });
    basicExtractions.push({
      fieldId: 'bp_diastolic',
      sectionId: 'physical',
      fieldLabel: 'Diastolic BP',
      value: bpMatch[2], 
      aiSourceText: bpMatch[0],
      confidenceScore: 0.7
    });
  }
  
  const painMatch = text.match(/(?:pain).*?(\d{1,2})(?:\/10|\s*out\s*of\s*10)?/i);
  if (painMatch) {
    basicExtractions.push({
      fieldId: 'pain_scale',
      sectionId: 'skin-pain',
      fieldLabel: 'Pain Scale', 
      value: painMatch[1],
      aiSourceText: painMatch[0],
      confidenceScore: 0.6
    });
  }
  
  console.log(`Basic extraction found ${basicExtractions.length} fields`);
  return basicExtractions;
}
