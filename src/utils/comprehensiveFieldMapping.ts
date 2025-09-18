// Comprehensive field mapping for AI extraction
import { FIELD_REGISTRY } from './fieldRegistry';

export interface FieldMappingConfig {
  fieldId: string;
  sectionId: string;
  sectionTitle: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'calculated';
  expectedFormat?: string;
  synonyms: string[];
  options?: string[];
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  extractionHints: string[];
}

// Comprehensive field mapping for AI extraction
export const COMPREHENSIVE_FIELD_MAPPING: Record<string, FieldMappingConfig> = {
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
    synonyms: ['fall history', 'previous falls', 'history of falls', 'fallen before'],
    extractionHints: ['Has patient fallen in past 3 months', 'Any mention of previous falls or accidents', 'Falls risk factor']
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

// Enhanced extraction utilities
export const getFieldsBySection = (sectionId: string): FieldMappingConfig[] => {
  return Object.values(COMPREHENSIVE_FIELD_MAPPING).filter(field => field.sectionId === sectionId);
};

export const getFieldsBySynonym = (searchTerm: string): FieldMappingConfig[] => {
  const lowercaseSearch = searchTerm.toLowerCase();
  return Object.values(COMPREHENSIVE_FIELD_MAPPING).filter(field => 
    field.synonyms.some(synonym => synonym.toLowerCase().includes(lowercaseSearch)) ||
    field.fieldLabel.toLowerCase().includes(lowercaseSearch)
  );
};

export const getCriticalFields = (): FieldMappingConfig[] => {
  const criticalFieldIds = [
    'temperature', 'pulse', 'bp_systolic', 'bp_diastolic', 'respiratory_rate', 'spo2',
    'level_of_consciousness', 'pain_scale', 'pain_location', 'current_complaint',
    'morse_history_falling', 'morse_gait', 'morse_mental_status'
  ];
  
  return criticalFieldIds
    .map(fieldId => COMPREHENSIVE_FIELD_MAPPING[fieldId])
    .filter(field => field);
};

export const getFieldExtractionContext = (fieldId: string): string => {
  const field = COMPREHENSIVE_FIELD_MAPPING[fieldId];
  if (!field) return '';
  
  return `
Field: ${field.fieldLabel}
Synonyms: ${field.synonyms.join(', ')}
Type: ${field.fieldType}
${field.expectedFormat ? `Format: ${field.expectedFormat}` : ''}
${field.options ? `Options: ${field.options.join(', ')}` : ''}
Extraction Hints: ${field.extractionHints.join('. ')}
  `.trim();
};