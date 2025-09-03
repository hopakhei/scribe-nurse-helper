// Field Registry - Maps all form fields to their corresponding sections and validation rules
export interface FieldRegistryItem {
  sectionId: string;
  sectionTitle: string;
  required?: boolean;
  fieldType?: string;
}

export const FIELD_REGISTRY: Record<string, FieldRegistryItem> = {
  // General Tab Fields
  'emergency_contact_1_name': { sectionId: 'general', sectionTitle: 'General Information' },
  'emergency_contact_1_relationship': { sectionId: 'general', sectionTitle: 'General Information' },
  'emergency_contact_1_phone': { sectionId: 'general', sectionTitle: 'General Information' },
  'emergency_contact_2_name': { sectionId: 'general', sectionTitle: 'General Information' },
  'emergency_contact_2_relationship': { sectionId: 'general', sectionTitle: 'General Information' },
  'emergency_contact_2_phone': { sectionId: 'general', sectionTitle: 'General Information' },
  'belongings_description': { sectionId: 'general', sectionTitle: 'General Information' },

  // Physical Tab Fields
  'current_complaint': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'level_of_consciousness': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'gcs_eye': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'gcs_verbal': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'gcs_motor': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'gcs_total': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'temperature': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'temp_method': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'pulse': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'pulse_location': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'pulse_pattern': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'bp_systolic': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'bp_diastolic': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'bp_position': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'mean_bp': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'respiratory_rate': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'respiration_status': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'spo2': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'cvp': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'cvp_level': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'pacemaker': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'coughing': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'sputum': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'sputum_colour': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'oxygen_therapy': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'oxygen_flow_rate': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'oxygen_via': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'oxygen_device': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'weight': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'height': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'bmi': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'weight_loss_6_months': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'blood_glucose': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'lmp': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'pregnancy_test': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'urinalysis_sugar': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'urinalysis_albumin': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'urinalysis_ketone': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'urinalysis_wbc': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'urinalysis_rbc': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'urinalysis_nitrite': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'urinalysis_remarks': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },
  'mews_total': { sectionId: 'physical', sectionTitle: 'Physical Assessment' },

  // Risk Tab Fields
  'infection_risk_status': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'clinical_criteria': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'other_symptoms': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'cpe_screening': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'cpe_country_area': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'vre_screening': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'vre_country_area': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'mdro_tagging': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'isolation_precaution': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'ftocc': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'infectious_status': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'suicide_admitted_attempt': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'suicide_expresses_idea': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'suicide_disclosure_relatives': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'fall_risk_level': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'morse_history_falling': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'morse_secondary_diagnosis': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'morse_ambulatory_aid': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'morse_iv_therapy': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'morse_gait': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'morse_mental_status': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'morse_total_score': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'fall_remarks': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'missing_risk_status': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'norton_physical': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'norton_mental': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'norton_activity': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'norton_mobility': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'norton_incontinent': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'braden_sensory': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'braden_moisture': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'braden_activity': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'braden_mobility': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'braden_nutrition': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },
  'braden_friction': { sectionId: 'risk', sectionTitle: 'Risk Assessment' },

  // Social Tab Fields
  'education_level': { sectionId: 'social', sectionTitle: 'Social Assessment' },
  'occupation': { sectionId: 'social', sectionTitle: 'Social Assessment' },
  'insurance_type': { sectionId: 'social', sectionTitle: 'Social Assessment' },
  'living_arrangement': { sectionId: 'social', sectionTitle: 'Social Assessment' },
  'religious_practice': { sectionId: 'social', sectionTitle: 'Social Assessment' },
  'religious_denomination': { sectionId: 'social', sectionTitle: 'Social Assessment' },
  'cultural_dietary_requirements': { sectionId: 'social', sectionTitle: 'Social Assessment' },
  'personal_hygiene_independence': { sectionId: 'social', sectionTitle: 'Social Assessment' },
  'adl_independence': { sectionId: 'social', sectionTitle: 'Social Assessment' },
  'assistance_needed': { sectionId: 'social', sectionTitle: 'Social Assessment' },
  'home_safety_concerns': { sectionId: 'social', sectionTitle: 'Social Assessment' },
  'discharge_planning_needs': { sectionId: 'social', sectionTitle: 'Social Assessment' },

  // Communication/Respiration/Mobility Tab Fields
  'hearing_status': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'hearing_aid': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'vision_status': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'vision_aid': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'speech_status': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'language_preferred': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'communication_concerns': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'respiratory_concerns': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'breathing_pattern': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'mobility_status': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'mobility_aids': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'transfer_ability': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'ambulation_distance': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },
  'mobility_limitations': { sectionId: 'communication', sectionTitle: 'Communication/Respiration/Mobility' },

  // Elimination Tab Fields
  'bowel_pattern': { sectionId: 'elimination', sectionTitle: 'Elimination' },
  'last_bowel_movement': { sectionId: 'elimination', sectionTitle: 'Elimination' },
  'bowel_continence': { sectionId: 'elimination', sectionTitle: 'Elimination' },
  'bowel_concerns': { sectionId: 'elimination', sectionTitle: 'Elimination' },
  'urinary_pattern': { sectionId: 'elimination', sectionTitle: 'Elimination' },
  'urinary_continence': { sectionId: 'elimination', sectionTitle: 'Elimination' },
  'urinary_concerns': { sectionId: 'elimination', sectionTitle: 'Elimination' },
  'catheter_type': { sectionId: 'elimination', sectionTitle: 'Elimination' },
  'elimination_aids': { sectionId: 'elimination', sectionTitle: 'Elimination' },
  'elimination_assistance': { sectionId: 'elimination', sectionTitle: 'Elimination' },

  // Nutrition/Self-Care Tab Fields
  'appetite': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'dietary_restrictions': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'food_allergies': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'swallowing_status': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'feeding_assistance': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'fluid_intake': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'nutrition_concerns': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'bathing_independence': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'dressing_independence': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'grooming_independence': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'toileting_independence': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'self_care_assistance': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'self_care_concerns': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },
  'mst_total_score': { sectionId: 'nutrition', sectionTitle: 'Nutrition/Self-Care' },

  // Skin/Pain Tab Fields
  'skin_condition': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },
  'skin_integrity': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },
  'pressure_ulcer_risk': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },
  'wound_assessment': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },
  'pain_status': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },
  'pain_scale': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },
  'pain_location': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },
  'pain_quality': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },
  'pain_management': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },
  'skin_concerns': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },
  'pain_concerns': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },
  'comfort_measures': { sectionId: 'skin-pain', sectionTitle: 'Skin/Pain Assessment' },

  // Emotion/Remark Tab Fields
  'emotional_state': { sectionId: 'emotion-remark', sectionTitle: 'Emotion/Remark' },
  'assessment_remarks': { sectionId: 'emotion-remark', sectionTitle: 'Emotion/Remark' },

  // Photo Tab Fields
  'assessment_photos': { sectionId: 'photo', sectionTitle: 'Photo Documentation' }
};

// Helper functions
export const getFieldSection = (fieldId: string): string => {
  return FIELD_REGISTRY[fieldId]?.sectionId || 'general';
};

export const getFieldSectionTitle = (fieldId: string): string => {
  return FIELD_REGISTRY[fieldId]?.sectionTitle || 'General Information';
};

export const isRequiredField = (fieldId: string): boolean => {
  return FIELD_REGISTRY[fieldId]?.required || false;
};

export const getRequiredFieldsBySection = (sectionId: string): string[] => {
  return Object.keys(FIELD_REGISTRY).filter(
    fieldId => FIELD_REGISTRY[fieldId].sectionId === sectionId && FIELD_REGISTRY[fieldId].required
  );
};

export const validateSectionCompletion = (sectionId: string, fieldValues: Record<string, any>): { 
  isValid: boolean; 
  missingFields: string[]; 
  completedFields: number; 
  totalFields: number; 
} => {
  const requiredFields = getRequiredFieldsBySection(sectionId);
  const missingFields = requiredFields.filter(fieldId => !fieldValues[fieldId] || fieldValues[fieldId] === '');
  
  const allSectionFields = Object.keys(FIELD_REGISTRY).filter(
    fieldId => FIELD_REGISTRY[fieldId].sectionId === sectionId
  );
  
  const completedFields = allSectionFields.filter(fieldId => 
    fieldValues[fieldId] && fieldValues[fieldId] !== ''
  ).length;

  return {
    isValid: missingFields.length === 0,
    missingFields,
    completedFields,
    totalFields: allSectionFields.length
  };
};