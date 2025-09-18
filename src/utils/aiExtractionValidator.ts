// Validation utilities for AI-extracted field data
import { COMPREHENSIVE_FIELD_MAPPING, FieldMappingConfig } from './comprehensiveFieldMapping';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalizedValue: string;
}

export interface ExtractedFieldValidation {
  fieldId: string;
  originalValue: string;
  validation: ValidationResult;
}

// Validate an extracted field value against its expected format and rules
export const validateExtractedField = (
  fieldId: string, 
  value: string, 
  confidenceScore?: number
): ValidationResult => {
  const field = COMPREHENSIVE_FIELD_MAPPING[fieldId];
  
  if (!field) {
    return {
      isValid: false,
      errors: [`Unknown field ID: ${fieldId}`],
      warnings: [],
      normalizedValue: value
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  let normalizedValue = value.trim();

  // Confidence score validation
  if (confidenceScore !== undefined && confidenceScore < 0.5) {
    warnings.push(`Low confidence score: ${confidenceScore}`);
  }

  // Type-specific validation
  switch (field.fieldType) {
    case 'number':
      normalizedValue = validateNumericField(field, value, errors, warnings);
      break;
      
    case 'select':
    case 'radio':
      normalizedValue = validateSelectField(field, value, errors, warnings);
      break;
      
    case 'text':
    case 'textarea':
      normalizedValue = validateTextField(field, value, errors, warnings);
      break;
      
    default:
      // Basic validation for other types
      if (!value || value.length === 0) {
        warnings.push('Empty value provided');
      }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    normalizedValue
  };
};

// Validate numeric field values
const validateNumericField = (
  field: FieldMappingConfig, 
  value: string, 
  errors: string[], 
  warnings: string[]
): string => {
  // Extract numeric value from string
  const numericMatch = value.match(/(\d+\.?\d*)/);
  if (!numericMatch) {
    errors.push(`Invalid numeric value: ${value}`);
    return value;
  }

  const numericValue = parseFloat(numericMatch[1]);
  
  // Range validation
  if (field.validationRules?.min !== undefined && numericValue < field.validationRules.min) {
    errors.push(`Value ${numericValue} is below minimum ${field.validationRules.min}`);
  }
  
  if (field.validationRules?.max !== undefined && numericValue > field.validationRules.max) {
    errors.push(`Value ${numericValue} is above maximum ${field.validationRules.max}`);
  }

  // Field-specific validation and formatting
  switch (field.fieldId) {
    case 'temperature':
      if (numericValue < 35 || numericValue > 42) {
        warnings.push(`Unusual temperature value: ${numericValue}°C`);
      }
      return `${numericValue}°C`;
      
    case 'pulse':
      if (numericValue < 50 || numericValue > 150) {
        warnings.push(`Unusual pulse rate: ${numericValue} bpm`);
      }
      return `${numericValue} bpm`;
      
    case 'bp_systolic':
      if (numericValue < 80 || numericValue > 200) {
        warnings.push(`Unusual systolic BP: ${numericValue} mmHg`);
      }
      return `${numericValue} mmHg`;
      
    case 'bp_diastolic':
      if (numericValue < 40 || numericValue > 120) {
        warnings.push(`Unusual diastolic BP: ${numericValue} mmHg`);
      }
      return `${numericValue} mmHg`;
      
    case 'respiratory_rate':
      if (numericValue < 10 || numericValue > 30) {
        warnings.push(`Unusual respiratory rate: ${numericValue}/min`);
      }
      return `${numericValue}/min`;
      
    case 'spo2':
      if (numericValue < 85 || numericValue > 100) {
        warnings.push(`Unusual SpO2: ${numericValue}%`);
      }
      return `${numericValue}%`;
      
    case 'pain_scale':
      if (numericValue < 0 || numericValue > 10) {
        errors.push(`Pain scale must be 0-10, got: ${numericValue}`);
      }
      return `${numericValue}/10`;
      
    default:
      return numericValue.toString();
  }
};

// Validate select/radio field values
const validateSelectField = (
  field: FieldMappingConfig, 
  value: string, 
  errors: string[], 
  warnings: string[]
): string => {
  if (!field.options || field.options.length === 0) {
    return value;
  }

  // Try exact match first
  const exactMatch = field.options.find(option => 
    option.toLowerCase() === value.toLowerCase()
  );
  
  if (exactMatch) {
    return exactMatch;
  }

  // Try partial match
  const partialMatch = field.options.find(option =>
    option.toLowerCase().includes(value.toLowerCase()) ||
    value.toLowerCase().includes(option.toLowerCase())
  );
  
  if (partialMatch) {
    warnings.push(`Partial match found: "${value}" → "${partialMatch}"`);
    return partialMatch;
  }

  // For Morse scale fields, try to extract score
  if (field.fieldId.startsWith('morse_')) {
    const scoreMatch = value.match(/\((\d+)\s*(?:points?)?\)/i);
    if (scoreMatch) {
      const score = scoreMatch[1];
      const optionWithScore = field.options.find(option => 
        option.includes(`(${score}`)
      );
      if (optionWithScore) {
        warnings.push(`Matched by score: "${value}" → "${optionWithScore}"`);
        return optionWithScore;
      }
    }
  }

  errors.push(`Invalid option "${value}". Valid options: ${field.options.join(', ')}`);
  return value;
};

// Validate text field values
const validateTextField = (
  field: FieldMappingConfig, 
  value: string, 
  errors: string[], 
  warnings: string[]
): string => {
  let normalizedValue = value.trim();

  // Length validation
  if (normalizedValue.length === 0) {
    warnings.push('Empty text value');
    return normalizedValue;
  }

  if (normalizedValue.length > 1000) {
    warnings.push(`Very long text (${normalizedValue.length} characters)`);
  }

  // Format validation for specific fields
  if (field.fieldId.includes('phone')) {
    // Basic phone number validation/formatting
    const phoneMatch = normalizedValue.match(/(\+?65\s?)?\d{4}\s?\d{4}/);
    if (phoneMatch) {
      normalizedValue = phoneMatch[0].replace(/(\d{4})(\d{4})/, '$1 $2');
      if (!normalizedValue.startsWith('+65')) {
        normalizedValue = `+65 ${normalizedValue}`;
      }
    } else if (normalizedValue.match(/\d/)) {
      warnings.push(`Phone number format may be incorrect: ${normalizedValue}`);
    }
  }

  // Pattern validation if specified
  if (field.validationRules?.pattern) {
    const regex = new RegExp(field.validationRules.pattern);
    if (!regex.test(normalizedValue)) {
      warnings.push(`Value doesn't match expected pattern: ${field.validationRules.pattern}`);
    }
  }

  return normalizedValue;
};

// Validate multiple extracted fields and identify conflicts
export const validateExtractedFields = (
  extractedFields: Array<{
    fieldId: string;
    value: string;
    confidenceScore?: number;
  }>
): ExtractedFieldValidation[] => {
  const validations: ExtractedFieldValidation[] = [];
  
  // Validate each field individually
  for (const field of extractedFields) {
    const validation = validateExtractedField(
      field.fieldId, 
      field.value, 
      field.confidenceScore
    );
    
    validations.push({
      fieldId: field.fieldId,
      originalValue: field.value,
      validation
    });
  }

  // Check for logical conflicts between related fields
  checkLogicalConsistency(validations);
  
  return validations;
};

// Check for logical consistency between related fields
const checkLogicalConsistency = (validations: ExtractedFieldValidation[]): void => {
  const fieldMap = new Map<string, ExtractedFieldValidation>();
  validations.forEach(v => fieldMap.set(v.fieldId, v));

  // BP consistency check
  const systolic = fieldMap.get('bp_systolic');
  const diastolic = fieldMap.get('bp_diastolic');
  
  if (systolic && diastolic) {
    const systolicValue = parseFloat(systolic.validation.normalizedValue);
    const diastolicValue = parseFloat(diastolic.validation.normalizedValue);
    
    if (!isNaN(systolicValue) && !isNaN(diastolicValue)) {
      if (systolicValue <= diastolicValue) {
        systolic.validation.errors.push('Systolic BP should be higher than diastolic BP');
        diastolic.validation.errors.push('Diastolic BP should be lower than systolic BP');
        systolic.validation.isValid = false;
        diastolic.validation.isValid = false;
      }
    }
  }

  // Temperature and other vital signs correlation
  const temperature = fieldMap.get('temperature');
  const pulse = fieldMap.get('pulse');
  
  if (temperature && pulse) {
    const tempValue = parseFloat(temperature.validation.normalizedValue);
    const pulseValue = parseFloat(pulse.validation.normalizedValue);
    
    if (!isNaN(tempValue) && !isNaN(pulseValue)) {
      // High fever usually correlates with elevated pulse
      if (tempValue > 38.5 && pulseValue < 60) {
        temperature.validation.warnings.push('High fever with unusually low pulse rate');
        pulse.validation.warnings.push('Low pulse rate despite elevated temperature');
      }
    }
  }
};

// Get summary of validation results
export const getValidationSummary = (validations: ExtractedFieldValidation[]): {
  totalFields: number;
  validFields: number;
  fieldsWithErrors: number;
  fieldsWithWarnings: number;
  criticalErrors: string[];
} => {
  const criticalErrors: string[] = [];
  let validFields = 0;
  let fieldsWithErrors = 0;
  let fieldsWithWarnings = 0;

  for (const validation of validations) {
    if (validation.validation.isValid) {
      validFields++;
    } else {
      fieldsWithErrors++;
      // Check for critical errors (vital signs out of range)
      const criticalFields = ['temperature', 'pulse', 'bp_systolic', 'bp_diastolic', 'respiratory_rate', 'spo2'];
      if (criticalFields.includes(validation.fieldId)) {
        criticalErrors.push(`Critical: ${validation.fieldId} - ${validation.validation.errors.join(', ')}`);
      }
    }
    
    if (validation.validation.warnings.length > 0) {
      fieldsWithWarnings++;
    }
  }

  return {
    totalFields: validations.length,
    validFields,
    fieldsWithErrors,
    fieldsWithWarnings,
    criticalErrors
  };
};