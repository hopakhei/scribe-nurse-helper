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

interface SimilarField {
  field_id: string;
  section_id: string;
  field_label: string;
  field_type: string;
  synonyms: string[];
  options: string[] | null;
  extraction_hints: string[];
  medical_context: string;
  similarity: number;
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

    console.log('Processing transcript with RAG-enhanced AI:', transcriptText.substring(0, 100) + '...');

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

    // Use RAG-enhanced AI to intelligently extract form fields from the transcript
    const extractedFields: FieldMapping[] = await extractFieldsWithRAG(
      transcriptText, 
      openAIApiKey, 
      supabase
    );
    
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
    console.error('Error in smart-medical-extraction function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// RAG-enhanced AI field extraction
async function extractFieldsWithRAG(
  transcriptText: string, 
  apiKey: string, 
  supabase: any
): Promise<FieldMapping[]> {
  try {
    // Step 1: Generate embedding for the transcript text
    const transcriptEmbedding = await generateEmbedding(transcriptText, apiKey);
    
    // Step 2: Find similar fields using vector search
    const { data: similarFields, error: searchError } = await supabase
      .rpc('search_similar_fields', {
        query_embedding: transcriptEmbedding,
        similarity_threshold: 0.6,
        match_count: 20
      });

    if (searchError) {
      console.error('Vector search error:', searchError);
      return performBasicExtraction(transcriptText);
    }

    console.log(`Found ${similarFields.length} similar fields via RAG search`);

    // Step 3: Generate enhanced prompt with retrieved field context
    const ragEnhancedPrompt = generateRAGPrompt(similarFields as SimilarField[], transcriptText);
    
    // Step 4: Use OpenAI with RAG-enhanced context
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07', // Use latest GPT-5 for better reasoning
        messages: [
          { role: 'system', content: ragEnhancedPrompt.systemPrompt },
          { role: 'user', content: ragEnhancedPrompt.userPrompt }
        ],
        max_completion_tokens: 4000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('RAG-enhanced AI response received, processing...');
    
    // Enhanced JSON parsing with multiple fallback strategies
    try {
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
      
      // Validate and enhance extracted fields with RAG confidence
      const validatedFields = extractedFields
        .filter(field => field.fieldId && field.sectionId && field.value)
        .map(field => {
          const matchingField = similarFields.find(sf => sf.field_id === field.fieldId);
          return {
            ...field,
            confidenceScore: matchingField ? 
              Math.min(0.95, (field.confidenceScore || 0.8) * matchingField.similarity) : 
              (field.confidenceScore || 0.8),
            aiSourceText: field.aiSourceText || 'Extracted from transcript using RAG'
          };
        });
      
      console.log(`Successfully extracted ${validatedFields.length} fields using RAG`);
      return validatedFields;
      
    } catch (parseError) {
      console.error('JSON parsing failed, using fallback extraction');
      return performBasicExtraction(transcriptText);
    }

  } catch (error) {
    console.error('Error in RAG-enhanced AI field extraction:', error);
    return performBasicExtraction(transcriptText);
  }
}

// Generate embedding for text using OpenAI
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Generate RAG-enhanced prompts
function generateRAGPrompt(similarFields: SimilarField[], transcriptText: string) {
  const fieldMappings = similarFields.map(field => {
    return `
FIELD: ${field.field_id}
- Label: ${field.field_label}
- Section: ${field.section_id}
- Type: ${field.field_type}
- Synonyms: ${field.synonyms.join(', ')}
${field.options ? `- Options: ${field.options.join(', ')}` : ''}
- Extraction Hints: ${field.extraction_hints.join('. ')}
- Medical Context: ${field.medical_context.substring(0, 200)}...
- RAG Similarity: ${(field.similarity * 100).toFixed(1)}%
    `.trim();
  }).join('\n\n');

  const systemPrompt = `You are an expert medical AI assistant specializing in extracting comprehensive patient information from clinical conversation transcripts. You use RAG (Retrieval-Augmented Generation) to identify the most relevant medical fields for extraction.

RELEVANT MEDICAL FIELDS (Retrieved via RAG similarity search):
${fieldMappings}

EXTRACTION STRATEGY:
1. FOCUS on the RAG-retrieved fields above - these are most relevant to the transcript content
2. PRIORITIZE fields with higher similarity scores (>80% = high confidence)
3. LOOK for exact synonyms and medical terminology from the field mappings
4. USE clinical reasoning to extract related fields when mentioned together
5. PRESERVE original language context while extracting structured data

CRITICAL EXTRACTION RULES:
1. Extract ALL relevant information mentioned in the transcript
2. Use EXACT field IDs from the RAG-retrieved mappings above
3. Match values to provided options when available (exact or closest match)
4. For numeric fields, extract exact values with appropriate units
5. Handle multilingual medical terminology (English, Cantonese, etc.)
6. Include confidence scores based on clarity and RAG similarity
7. Reference the exact text that supports each extraction

FALL HISTORY FOCUS:
Pay special attention to fall-related phrases in ANY language:
- English: "fell", "falling", "fall down", "tripped", "stumbled"
- Cantonese: "跌倒", "跌咗", "仆倒"
- Any mention of frequency: "three times", "last week", "recently"

For fall history, extract to morse_history_falling with value "Yes (25 points)" if ANY falls are mentioned.

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "extractions": [
    {
      "fieldId": "exact_field_id_from_rag_mapping",
      "sectionId": "section_id",
      "fieldLabel": "Human readable field name",
      "value": "extracted_value_matching_expected_format",
      "aiSourceText": "exact quote from transcript supporting this extraction",
      "confidenceScore": 0.95,
      "ragSimilarity": 0.87
    }
  ]
}

IMPORTANT: Return only valid JSON, no explanatory text.`;

  const userPrompt = `Analyze this clinical transcript and extract all relevant medical information using the RAG-retrieved field mappings above.

TRANSCRIPT TO ANALYZE:
"${transcriptText}"

Extract comprehensive patient assessment data following the RAG-enhanced field mapping guidelines. Focus especially on the fields with high similarity scores from the vector search.`;

  return { systemPrompt, userPrompt };
}

// Enhanced basic extraction with comprehensive patterns
function performBasicExtraction(transcriptText: string): FieldMapping[] {
  const basicExtractions: FieldMapping[] = [];
  const text = transcriptText.toLowerCase();
  
  console.log('Performing enhanced basic extraction with comprehensive patterns');
  
  // Enhanced fall history detection with multilingual support
  const fallPatterns = [
    /(?:fell|falling|fall down|tripped|stumbled|跌倒|跌咗|仆倒).*?(?:(\d+)\s*times?|last\s*week|recently|yesterday|today)/i,
    /(?:history|past|previous).*?(?:fall|falling|跌倒)/i,
    /i\s*(?:fell|fall|跌咗).*?(\d+).*?(?:times?|次)/i
  ];
  
  for (const pattern of fallPatterns) {
    const match = text.match(pattern);
    if (match) {
      basicExtractions.push({
        fieldId: 'morse_history_falling',
        sectionId: 'risk',
        fieldLabel: 'History of Falling',
        value: 'Yes (25 points)',
        aiSourceText: match[0],
        confidenceScore: 0.8
      });
      break;
    }
  }
  
  // Enhanced vital signs extraction
  const tempMatch = text.match(/(?:temp|temperature|發燒).*?(\d{1,2}\.?\d?)\s*°?c?/i);
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
  
  const bpMatch = text.match(/(?:bp|blood pressure|血壓).*?(\d{2,3})\/(\d{2,3})/i);
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
  
  const painMatch = text.match(/(?:pain|痛|疼).*?(\d{1,2})(?:\/10|\s*out\s*of\s*10|分)?/i);
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
  
  console.log(`Enhanced basic extraction found ${basicExtractions.length} fields`);
  return basicExtractions;
}