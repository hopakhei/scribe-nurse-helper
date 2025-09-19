import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive field mapping for AI extraction
const COMPREHENSIVE_FIELD_MAPPING: Record<string, any> = {
  // Physical Assessment - Vital Signs
  'temperature': {
    fieldId: 'temperature',
    sectionId: 'physical',
    sectionTitle: 'Physical Assessment',
    fieldLabel: 'Temperature',
    fieldType: 'number',
    expectedFormat: '##.#°C',
    synonyms: ['temp', 'body temperature', 'fever', 'pyrexia', 'temperature reading'],
    validationRules: { min: 30, max: 45 },
    extractionHints: ['Look for temperature values in Celsius', 'May be mentioned as fever or high temp', 'Normal range 36-37.5°C']
  },
  
  'pulse': {
    fieldId: 'pulse',
    sectionId: 'physical', 
    sectionTitle: 'Physical Assessment',
    fieldLabel: 'Pulse Rate',
    fieldType: 'number',
    expectedFormat: '## bpm',
    synonyms: ['heart rate', 'HR', 'beats per minute', 'bpm', 'cardiac rate'],
    validationRules: { min: 40, max: 200 },
    extractionHints: ['Look for pulse or heart rate values', 'Usually expressed as beats per minute', 'Normal range 60-100 bpm']
  },

  'bp_systolic': {
    fieldId: 'bp_systolic',
    sectionId: 'physical',
    sectionTitle: 'Physical Assessment', 
    fieldLabel: 'Systolic Blood Pressure',
    fieldType: 'number',
    expectedFormat: '### mmHg',
    synonyms: ['systolic BP', 'systolic pressure', 'upper BP', 'blood pressure systolic'],
    validationRules: { min: 60, max: 250 },
    extractionHints: ['First number in blood pressure reading', 'Look for BP format like 120/80', 'Normal range 100-140 mmHg']
  },

  'bp_diastolic': {
    fieldId: 'bp_diastolic',
    sectionId: 'physical',
    sectionTitle: 'Physical Assessment',
    fieldLabel: 'Diastolic Blood Pressure', 
    fieldType: 'number',
    expectedFormat: '## mmHg',
    synonyms: ['diastolic BP', 'diastolic pressure', 'lower BP', 'blood pressure diastolic'],
    validationRules: { min: 40, max: 130 },
    extractionHints: ['Second number in blood pressure reading', 'Look for BP format like 120/80', 'Normal range 60-90 mmHg']
  },

  'respiratory_rate': {
    fieldId: 'respiratory_rate',
    sectionId: 'physical',
    sectionTitle: 'Physical Assessment',
    fieldLabel: 'Respiratory Rate',
    fieldType: 'number', 
    expectedFormat: '## breaths/min',
    synonyms: ['RR', 'respiration rate', 'breathing rate', 'breaths per minute'],
    validationRules: { min: 8, max: 40 },
    extractionHints: ['Look for respiratory or breathing rate', 'Usually expressed as breaths per minute', 'Normal range 12-20 breaths/min']
  },

  'spo2': {
    fieldId: 'spo2',
    sectionId: 'physical',
    sectionTitle: 'Physical Assessment',
    fieldLabel: 'Oxygen Saturation',
    fieldType: 'number',
    expectedFormat: '##%', 
    synonyms: ['SpO2', 'oxygen saturation', 'O2 sat', 'pulse oximetry', 'oxygen level'],
    validationRules: { min: 70, max: 100 },
    extractionHints: ['Look for SpO2 or oxygen saturation', 'Usually expressed as percentage', 'Normal range 95-100%']
  },

  // Physical Assessment - Clinical Status
  'current_complaint': {
    fieldId: 'current_complaint',
    sectionId: 'physical',
    sectionTitle: 'Physical Assessment',
    fieldLabel: 'Current Complaint',
    fieldType: 'textarea',
    synonyms: ['chief complaint', 'presenting complaint', 'main problem', 'primary concern', 'symptoms'],
    extractionHints: ['Patient\'s main reason for admission', 'Primary symptoms or concerns', 'What brought patient to hospital']
  },

  'level_of_consciousness': {
    fieldId: 'level_of_consciousness', 
    sectionId: 'physical',
    sectionTitle: 'Physical Assessment',
    fieldLabel: 'Level of Consciousness',
    fieldType: 'select',
    synonyms: ['LOC', 'consciousness level', 'alertness', 'mental state', 'awareness'],
    options: ['Alert', 'Drowsy', 'Lethargic', 'Stuporous', 'Comatose'],
    extractionHints: ['Patient\'s alertness and awareness level', 'May be described as alert, drowsy, confused', 'Part of neurological assessment']
  },

  'pain_scale': {
    fieldId: 'pain_scale',
    sectionId: 'skin-pain',
    sectionTitle: 'Skin/Pain Assessment',
    fieldLabel: 'Pain Scale (0-10)',
    fieldType: 'number',
    expectedFormat: '#/10',
    synonyms: ['pain score', 'pain level', 'pain rating', 'pain intensity', 'VAS score'],
    validationRules: { min: 0, max: 10 },
    extractionHints: ['Numeric pain rating 0-10', '0 = no pain, 10 = worst pain', 'May be described as mild/moderate/severe']
  },

  'pain_location': {
    fieldId: 'pain_location',
    sectionId: 'skin-pain', 
    sectionTitle: 'Skin/Pain Assessment',
    fieldLabel: 'Pain Location',
    fieldType: 'text',
    synonyms: ['where is pain', 'pain site', 'location of pain', 'painful area'],
    extractionHints: ['Where patient feels pain', 'Body part or region affected', 'May be multiple locations']
  },

  // Risk Assessment - Morse Fall Scale
  'morse_history_falling': {
    fieldId: 'morse_history_falling',
    sectionId: 'risk',
    sectionTitle: 'Risk Assessment',
    fieldLabel: 'History of Falling',
    fieldType: 'radio',
    options: ['No (0 points)', 'Yes (25 points)'],
    synonyms: ['fall history', 'previous falls', 'history of falls', 'fallen before', 'I fell', 'fall down', 'falling', 'tripped', 'stumbled'],
    extractionHints: ['Has patient fallen in past 3 months', 'Any mention of previous falls or accidents', 'Falls risk factor', 'Listen for phrases like "I fell three times last week"']
  },

  'morse_secondary_diagnosis': {
    fieldId: 'morse_secondary_diagnosis',
    sectionId: 'risk', 
    sectionTitle: 'Risk Assessment',
    fieldLabel: 'Secondary Diagnosis',
    fieldType: 'radio',
    options: ['No (0 points)', 'Yes (15 points)'],
    synonyms: ['multiple diagnoses', 'comorbidities', 'other conditions', 'additional diagnosis'],
    extractionHints: ['Does patient have more than one medical diagnosis', 'Multiple conditions or comorbidities', 'Secondary medical problems']
  },

  'morse_ambulatory_aid': {
    fieldId: 'morse_ambulatory_aid',
    sectionId: 'risk',
    sectionTitle: 'Risk Assessment', 
    fieldLabel: 'Ambulatory Aid',
    fieldType: 'radio',
    options: ['None/bed rest/nurse assist (0 points)', 'Crutches/cane/walker (15 points)', 'Furniture (30 points)'],
    synonyms: ['walking aid', 'mobility aid', 'assistance walking', 'cane', 'walker', 'crutches'],
    extractionHints: ['What patient uses to walk', 'Walking aids or support needed', 'Independence in mobility']
  },

  'morse_iv_therapy': {
    fieldId: 'morse_iv_therapy',
    sectionId: 'risk',
    sectionTitle: 'Risk Assessment',
    fieldLabel: 'IV Therapy/Heparin Lock', 
    fieldType: 'radio',
    options: ['No (0 points)', 'Yes (20 points)'],
    synonyms: ['IV line', 'intravenous', 'heparin lock', 'IV access', 'venous access'],
    extractionHints: ['Does patient have IV line or heparin lock', 'Intravenous access present', 'IV therapy ongoing']
  },

  'morse_gait': {
    fieldId: 'morse_gait',
    sectionId: 'risk',
    sectionTitle: 'Risk Assessment',
    fieldLabel: 'Gait/Transferring',
    fieldType: 'radio', 
    options: ['Normal/bed rest/immobile (0 points)', 'Weak (10 points)', 'Impaired (20 points)'],
    synonyms: ['walking pattern', 'gait pattern', 'walking ability', 'mobility', 'transfer ability'],
    extractionHints: ['How patient walks or moves', 'Stability when walking', 'Transfer independence']
  },

  'morse_mental_status': {
    fieldId: 'morse_mental_status',
    sectionId: 'risk',
    sectionTitle: 'Risk Assessment',
    fieldLabel: 'Mental Status',
    fieldType: 'radio',
    options: ['Oriented to own ability (0 points)', 'Forgets limitations (15 points)'],
    synonyms: ['mental state', 'cognition', 'awareness', 'orientation', 'confusion'],
    extractionHints: ['Patient\'s mental awareness of limitations', 'Does patient overestimate abilities', 'Cognitive awareness of safety']
  },

  // Communication Assessment
  'hearing_status': {
    fieldId: 'hearing_status',
    sectionId: 'communication',
    sectionTitle: 'Communication/Respiration/Mobility',
    fieldLabel: 'Hearing Status',
    fieldType: 'select',
    synonyms: ['hearing', 'auditory', 'deaf', 'hard of hearing', 'hearing impaired'],
    options: ['Normal', 'Impaired', 'Hearing aid', 'Deaf'],
    extractionHints: ['Patient\'s ability to hear', 'Any hearing problems mentioned', 'Use of hearing aids']
  },

  'vision_status': {
    fieldId: 'vision_status', 
    sectionId: 'communication',
    sectionTitle: 'Communication/Respiration/Mobility',
    fieldLabel: 'Vision Status',
    fieldType: 'select',
    synonyms: ['vision', 'sight', 'eyesight', 'visual', 'blind', 'glasses'],
    options: ['Normal', 'Impaired', 'Glasses/contacts', 'Legally blind'],
    extractionHints: ['Patient\'s ability to see', 'Visual impairments mentioned', 'Use of glasses or contacts']
  },

  'language_preferred': {
    fieldId: 'language_preferred',
    sectionId: 'communication',
    sectionTitle: 'Communication/Respiration/Mobility', 
    fieldLabel: 'Preferred Language',
    fieldType: 'text',
    synonyms: ['language', 'speaks', 'communication language', 'native language'],
    extractionHints: ['What language patient prefers', 'Language barriers mentioned', 'Need for interpreter']
  },

  // Elimination Assessment
  'bowel_pattern': {
    fieldId: 'bowel_pattern',
    sectionId: 'elimination',
    sectionTitle: 'Elimination',
    fieldLabel: 'Bowel Pattern', 
    fieldType: 'select',
    synonyms: ['bowel movements', 'BM', 'defecation', 'stool', 'constipation', 'diarrhea'],
    options: ['Normal', 'Constipated', 'Diarrhea', 'Incontinence'],
    extractionHints: ['Patient\'s bowel movement pattern', 'Constipation or diarrhea mentioned', 'Bowel continence status']
  },

  'urinary_pattern': {
    fieldId: 'urinary_pattern',
    sectionId: 'elimination', 
    sectionTitle: 'Elimination',
    fieldLabel: 'Urinary Pattern',
    fieldType: 'select',
    synonyms: ['urination', 'voiding', 'urine', 'bladder', 'incontinence', 'catheter'],
    options: ['Normal', 'Frequency', 'Urgency', 'Incontinence', 'Retention'],
    extractionHints: ['Patient\'s urination pattern', 'Bladder problems mentioned', 'Urinary continence status']
  },

  // Nutrition Assessment
  'appetite': {
    fieldId: 'appetite',
    sectionId: 'nutrition',
    sectionTitle: 'Nutrition/Self-Care',
    fieldLabel: 'Appetite',
    fieldType: 'select', 
    synonyms: ['eating', 'food intake', 'hunger', 'appetite', 'nutrition'],
    options: ['Good', 'Fair', 'Poor', 'NPO'],
    extractionHints: ['Patient\'s appetite and eating', 'Food intake mentioned', 'Nutritional concerns']
  },

  'dietary_restrictions': {
    fieldId: 'dietary_restrictions',
    sectionId: 'nutrition',
    sectionTitle: 'Nutrition/Self-Care',
    fieldLabel: 'Dietary Restrictions',
    fieldType: 'text',
    synonyms: ['diet', 'food restrictions', 'allergies', 'special diet', 'diabetic diet'],
    extractionHints: ['Special dietary needs', 'Food allergies or restrictions', 'Therapeutic diets']
  },

  // Social Assessment
  'living_arrangement': {
    fieldId: 'living_arrangement', 
    sectionId: 'social',
    sectionTitle: 'Social Assessment',
    fieldLabel: 'Living Arrangement',
    fieldType: 'select',
    synonyms: ['lives with', 'home situation', 'living situation', 'family support'],
    options: ['Lives alone', 'With family', 'With spouse', 'Nursing home', 'Assisted living'],
    extractionHints: ['Who patient lives with', 'Home living situation', 'Support system at home']
  },

  'discharge_planning_needs': {
    fieldId: 'discharge_planning_needs',
    sectionId: 'social',
    sectionTitle: 'Social Assessment',
    fieldLabel: 'Discharge Planning Needs', 
    fieldType: 'textarea',
    synonyms: ['discharge planning', 'home care needs', 'follow-up care', 'support needed'],
    extractionHints: ['Plans for after discharge', 'Support needed at home', 'Follow-up care requirements']
  },

  // General Information
  'emergency_contact_1_name': {
    fieldId: 'emergency_contact_1_name',
    sectionId: 'general',
    sectionTitle: 'General Information',
    fieldLabel: 'Emergency Contact 1 - Name',
    fieldType: 'text',
    synonyms: ['emergency contact', 'next of kin', 'family contact', 'contact person'],
    extractionHints: ['Primary emergency contact name', 'Family member to contact', 'Next of kin information']
  },

  'emergency_contact_1_relationship': {
    fieldId: 'emergency_contact_1_relationship', 
    sectionId: 'general',
    sectionTitle: 'General Information',
    fieldLabel: 'Emergency Contact 1 - Relationship',
    fieldType: 'text',
    synonyms: ['relationship', 'family member', 'spouse', 'child', 'parent', 'sibling'],
    extractionHints: ['Relationship to patient', 'Family relationship', 'How they are related']
  },

  'emergency_contact_1_phone': {
    fieldId: 'emergency_contact_1_phone',
    sectionId: 'general', 
    sectionTitle: 'General Information',
    fieldLabel: 'Emergency Contact 1 - Phone',
    fieldType: 'text',
    expectedFormat: '+65 #### ####',
    synonyms: ['phone number', 'contact number', 'telephone', 'mobile number'],
    extractionHints: ['Phone number of emergency contact', 'Contact telephone number', 'Mobile or home phone']
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating embeddings for all medical fields...');

    // Clear existing embeddings
    const { error: clearError } = await supabase
      .from('field_embeddings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (clearError) {
      console.error('Error clearing existing embeddings:', clearError);
    }

    let successCount = 0;
    let errorCount = 0;

    // Generate embeddings for each field
    for (const [fieldId, fieldConfig] of Object.entries(COMPREHENSIVE_FIELD_MAPPING)) {
      try {
        // Create comprehensive text for embedding
        const medicalContext = `
Medical Field: ${fieldConfig.fieldLabel}
Section: ${fieldConfig.sectionTitle}
Field Type: ${fieldConfig.fieldType}
Synonyms: ${fieldConfig.synonyms.join(', ')}
${fieldConfig.options ? `Options: ${fieldConfig.options.join(', ')}` : ''}
${fieldConfig.expectedFormat ? `Format: ${fieldConfig.expectedFormat}` : ''}
Extraction Hints: ${fieldConfig.extractionHints.join('. ')}
Medical Context: This field is used in clinical assessment for ${fieldConfig.sectionTitle.toLowerCase()}. 
Common medical terminology includes: ${fieldConfig.synonyms.join(', ')}.
Clinical importance: This field helps assess patient ${fieldConfig.sectionId} status and clinical condition.
        `.trim();

        // Generate embedding using OpenAI
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: medicalContext,
          }),
        });

        if (!embeddingResponse.ok) {
          throw new Error(`OpenAI embedding error: ${embeddingResponse.statusText}`);
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Store in database
        const { error: insertError } = await supabase
          .from('field_embeddings')
          .insert({
            field_id: fieldConfig.fieldId,
            section_id: fieldConfig.sectionId,
            field_label: fieldConfig.fieldLabel,
            field_type: fieldConfig.fieldType,
            synonyms: fieldConfig.synonyms,
            options: fieldConfig.options || null,
            extraction_hints: fieldConfig.extractionHints,
            medical_context: medicalContext,
            embedding: embedding
          });

        if (insertError) {
          console.error(`Error inserting embedding for ${fieldId}:`, insertError);
          errorCount++;
        } else {
          console.log(`Generated embedding for ${fieldId}`);
          successCount++;
        }

      } catch (error) {
        console.error(`Error processing field ${fieldId}:`, error);
        errorCount++;
      }
    }

    console.log(`Embedding generation complete. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        generatedEmbeddings: successCount,
        errors: errorCount,
        message: `Generated ${successCount} field embeddings for RAG-based medical extraction`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-field-embeddings function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});