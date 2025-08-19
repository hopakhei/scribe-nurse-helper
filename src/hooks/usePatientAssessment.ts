
import { useState } from 'react';

export interface Patient {
  name: string;
  hospitalNo: string;
  idNo: string;
  age: number;
  sex: string;
  dept: string;
  team: string;
  ward: string;
  bed: string;
  admissionType: string;
  admissionDate: string;
  assessmentDate: string;
  assessmentTime: string;
}

export interface FormSection {
  id: string;
  title: string;
  completed: boolean;
}

export interface RiskScore {
  name: string;
  score: number;
  maxScore: number;
  level: 'low' | 'medium' | 'high';
  description: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'radio' | 'date' | 'time';
  value?: string | boolean | number;
  options?: string[];
  required?: boolean;
  dataSource: 'pre-populated' | 'ai-filled' | 'manual';
  aiSourceText?: string;
}

export function usePatientAssessment() {
  // Mock patient data (would come from EMR API)
  const [patient] = useState<Patient>({
    name: "CHAN Tai Man",
    hospitalNo: "12345678",
    idNo: "A123456(7)",
    age: 82,
    sex: "M",
    dept: "Medicine",
    team: "Team A",
    ward: "Medical Ward 3A",
    bed: "3A-12",
    admissionType: "A&E",
    admissionDate: "2025-08-19",
    assessmentDate: "2025-08-19",
    assessmentTime: "14:30"
  });

  const [sections] = useState<FormSection[]>([
    { id: 'general-physical', title: 'General & Physical Assessment', completed: false },
    { id: 'social', title: 'Social Assessment', completed: false },
    { id: 'risk', title: 'Risk Assessment', completed: true },
    { id: 'functional', title: 'Functional Assessment', completed: false },
    { id: 'elimination-nutrition', title: 'Elimination & Nutrition', completed: false },
    { id: 'skin', title: 'Skin Assessment', completed: false },
    { id: 'pain-emotional', title: 'Pain & Emotional Status', completed: false }
  ]);

  const [currentSection, setCurrentSection] = useState('general-physical');

  // Mock risk scores (would be calculated from form data)
  const [riskScores] = useState<RiskScore[]>([
    {
      name: "MEWS",
      score: 4,
      maxScore: 14,
      level: 'medium',
      description: "Modified Early Warning Score"
    },
    {
      name: "Morse Fall Scale",
      score: 70,
      maxScore: 125,
      level: 'high',
      description: "High risk for falls"
    },
    {
      name: "Norton Scale",
      score: 12,
      maxScore: 20,
      level: 'high',
      description: "Pressure injury risk"
    },
    {
      name: "Malnutrition (MST)",
      score: 3,
      maxScore: 5,
      level: 'medium',
      description: "Nutritional screening"
    }
  ]);

  const [isRecording, setIsRecording] = useState(false);

  const handleRecordingStart = () => {
    setIsRecording(true);
    console.log('Recording started - AI listening...');
  };

  const handleRecordingStop = () => {
    setIsRecording(false);
    console.log('Recording stopped - Processing conversation...');
    // Simulate AI processing delay
    setTimeout(() => {
      console.log('AI form population complete');
      // In real implementation, this would populate form fields
    }, 2000);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log(`Field ${fieldId} changed to:`, value);
    // In real implementation, this would update form state
  };

  // Form field definitions for each section
  const getFormFields = (sectionId: string): FormField[] => {
    switch (sectionId) {
      case 'general-physical':
        return [
          {
            id: 'emergency-contact-1-name',
            label: 'Emergency Contact 1 - Name',
            type: 'text',
            value: 'CHAN Siu Ming',
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned: "我個仔叫陳小明"',
            required: true
          },
          {
            id: 'emergency-contact-1-relationship',
            label: 'Emergency Contact 1 - Relationship',
            type: 'text',
            value: 'Son',
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned: "我個仔叫陳小明"'
          },
          {
            id: 'current-complaint',
            label: 'Current Complaint / Problem',
            type: 'textarea',
            value: 'Cough with yellow sputum, dizziness, fell at home yesterday',
            dataSource: 'ai-filled',
            aiSourceText: 'Patient said: "咳得好辛苦，有啲黃色嘅痰。尋日喺屋企行去廁所，覺得暈跟住就跌低咗"',
            required: true
          },
          {
            id: 'temperature',
            label: 'Temperature (°C)',
            type: 'number',
            value: '37.9',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'temperature-method',
            label: 'Temperature Method',
            type: 'select',
            value: 'Tympanic',
            options: ['Oral', 'Tympanic', 'Axilla', 'Rectal', 'Skin'],
            dataSource: 'manual'
          },
          {
            id: 'pulse',
            label: 'Pulse (/min)',
            type: 'number',
            value: '98',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'bp-systolic',
            label: 'BP Systolic (mmHg)',
            type: 'number',
            value: '155',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'bp-diastolic',
            label: 'BP Diastolic (mmHg)',
            type: 'number',
            value: '90',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'respiratory-rate',
            label: 'Respiratory Rate (/min)',
            type: 'number',
            value: '22',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'spo2',
            label: 'SpO2 (%)',
            type: 'number',
            value: '95',
            dataSource: 'manual'
          },
          {
            id: 'coughing',
            label: 'Coughing',
            type: 'select',
            value: 'Yes',
            options: ['Yes', 'No'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient said: "咳得好辛苦"'
          },
          {
            id: 'sputum',
            label: 'Sputum Present',
            type: 'select',
            value: 'Yes',
            options: ['Yes', 'No'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned yellow sputum'
          },
          {
            id: 'sputum-colour',
            label: 'Sputum Colour',
            type: 'select',
            value: 'Yellow',
            options: ['Clear', 'White', 'Yellow', 'Green', 'Cream colour', 'Coffee/Rusty', 'Blood-stained'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient said: "有啲黃色嘅痰"'
          }
        ];

      case 'social':
        return [
          {
            id: 'marital-status',
            label: 'Marital Status',
            type: 'select',
            value: 'Widowed',
            options: ['Single', 'Married', 'Cohabited', 'Widowed', 'Separated', 'Divorced', 'Unknown', 'Cannot be assessed'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned: "我老婆幾年前走咗"'
          },
          {
            id: 'religion',
            label: 'Religion',
            type: 'select',
            value: 'Traditional Chinese',
            options: ['Nil', 'Buddhism', 'Catholic', 'Christian', 'Confucianism', 'Hindu', 'Jehovah Witness', 'Jewish', 'Muslim', 'Sikh', 'Traditional Chinese', 'Taoism', 'Other', 'Unknown', 'Cannot be assessed'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned traditional beliefs'
          },
          {
            id: 'education',
            label: 'Education Level',
            type: 'select',
            value: 'Primary',
            options: ['No school / Kindergarten', 'Primary', 'Secondary', 'Tertiary', 'Unknown', 'Cannot be assessed'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned elementary education'
          },
          {
            id: 'employment-status',
            label: 'Employment Status',
            type: 'select',
            value: 'Retired',
            options: ['Employer', 'Employee', 'Self-employed', 'Homemaker', 'Student', 'Unemployed', 'Retired', 'Not working', 'Other', 'Unknown', 'Cannot be assessed'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned being retired'
          },
          {
            id: 'household-members',
            label: 'Household Members',
            type: 'select',
            value: 'Alone',
            options: ['Alone', 'Grandparents', 'Father', 'Mother', 'Spouse', 'Siblings', 'Children', 'Attendant / maid / helper', 'Relatives', 'Guardian', 'Friend', 'Boyfriend / girlfriend', 'Others'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient confirmed living alone when asked'
          },
          {
            id: 'accommodation',
            label: 'Accommodation Type',
            type: 'select',
            value: 'Public rental flat',
            options: ['Hospital', 'Hostel', 'Halfway house', 'Old aged home', 'Private residential flat', 'Public rental flat', 'Street Sleeper', 'Temporary housing', 'Traditional village house', 'Other', 'Unknown', 'Cannot be assessed'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned living in public housing'
          },
          {
            id: 'smoking-status',
            label: 'Smoking Status',
            type: 'select',
            value: 'Ex-smoker',
            options: ['Smoker', 'Ex-smoker', 'Non-smoker', 'Unknown', 'Cannot be assessed'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned quitting smoking 10 years ago'
          },
          {
            id: 'drinking-status',
            label: 'Drinking Status',
            type: 'select',
            value: 'Social Drinker',
            options: ['Drinker', 'Ex-drinker', 'Non-drinker', 'Social Drinker', 'Unknown', 'Cannot be assessed'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned occasional drinking with meals'
          }
        ];

      case 'risk':
        return [
          {
            id: 'cpe-screening',
            label: 'CPE Screening - Hospitalization outside HK in last 12 months',
            type: 'select',
            value: 'No',
            options: ['Unknown', 'No', 'Yes'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient confirmed no recent overseas hospitalizations'
          },
          {
            id: 'morse-history-falling',
            label: 'Morse Fall Scale - History of Falling',
            type: 'select',
            value: 'Yes (25 points)',
            options: ['No (0 points)', 'Yes (25 points)'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient said: "尋日喺屋企行去廁所，覺得暈跟住就跌低咗"'
          },
          {
            id: 'morse-secondary-diagnosis',
            label: 'Morse Fall Scale - Secondary Diagnosis',
            type: 'select',
            value: 'Yes (15 points)',
            options: ['No (0 points)', 'Yes (15 points)'],
            dataSource: 'manual'
          },
          {
            id: 'morse-ambulatory-aid',
            label: 'Morse Fall Scale - Ambulatory Aid',
            type: 'select',
            value: 'None/Bed rest/Nurse assist (0 points)',
            options: ['None/Bed rest/Nurse assist (0 points)', 'Crutches/Cane/Walkers (15 points)', 'Furniture (30 points)'],
            dataSource: 'manual'
          },
          {
            id: 'morse-iv-therapy',
            label: 'Morse Fall Scale - IV Therapy/Lock',
            type: 'select',
            value: 'Yes (20 points)',
            options: ['No (0 points)', 'Yes (20 points)'],
            dataSource: 'manual'
          },
          {
            id: 'morse-gait',
            label: 'Morse Fall Scale - Gait',
            type: 'select',
            value: 'Weak (10 points)',
            options: ['Normal/Bed rest/Wheelchair (0 points)', 'Weak (10 points)', 'Impaired (20 points)'],
            dataSource: 'manual'
          },
          {
            id: 'morse-mental-status',
            label: 'Morse Fall Scale - Mental Status',
            type: 'select',
            value: 'Oriented to own ability (0 points)',
            options: ['Oriented to own ability (0 points)', 'Overestimates/Forgets limitations (15 points)'],
            dataSource: 'manual'
          }
        ];

      case 'functional':
        return [
          {
            id: 'vision-left',
            label: 'Vision (Left Eye)',
            type: 'select',
            value: 'Blurred vision',
            options: ['Normal', 'Cataract', 'Squint', 'Glaucoma', 'Double vision', 'Blurred vision', 'Blindness', 'Other'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned difficulty seeing clearly'
          },
          {
            id: 'vision-right',
            label: 'Vision (Right Eye)',
            type: 'select',
            value: 'Blurred vision',
            options: ['Normal', 'Cataract', 'Squint', 'Glaucoma', 'Double vision', 'Blurred vision', 'Blindness', 'Other'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned difficulty seeing clearly'
          },
          {
            id: 'language-dialect',
            label: 'Language / Dialect',
            type: 'select',
            value: 'Cantonese (廣東話)',
            options: ['Cantonese (廣東話)', 'English', 'Mandarin (普通話)', 'Shanghainese (上海話)', 'Chiu Chow (潮州話)', 'Hokkien (福建話)', 'Hakka (客家話)', 'Filipino (菲律賓話)', 'Others'],
            dataSource: 'pre-populated'
          },
          {
            id: 'speech',
            label: 'Speech Quality',
            type: 'select',
            value: 'Clear',
            options: ['Clear', 'Slurring', 'Incomprehensible sounds', 'Dysphasia'],
            dataSource: 'manual'
          },
          {
            id: 'hearing-left',
            label: 'Hearing (Left Ear)',
            type: 'select',
            value: 'Impaired',
            options: ['Normal', 'Impaired', 'Deaf'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient asked to repeat questions multiple times'
          },
          {
            id: 'mobility-status',
            label: 'Mobility Status',
            type: 'select',
            value: 'Ambulatory with aids',
            options: ['Independent', 'Ambulatory with aids', 'Dependent'],
            dataSource: 'manual'
          }
        ];

      case 'elimination-nutrition':
        return [
          {
            id: 'urinary-pattern',
            label: 'Urinary Pattern',
            type: 'select',
            value: 'Frequent',
            options: ['Normal', 'Frequent', 'Dysuria', 'Incontinence', 'Urinary retention', 'Anuria', 'Oliguria', 'Others'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned frequent trips to toilet'
          },
          {
            id: 'bowel-pattern',
            label: 'Bowel Pattern',
            type: 'select',
            value: 'Constipation',
            options: ['Normal', 'Incontinence', 'Constipation', 'Diarrhoea', 'Others'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned difficulty with bowel movements'
          },
          {
            id: 'mst-weight-loss',
            label: 'MST - Recent Weight Loss',
            type: 'select',
            value: 'Yes, 1-5kg (1 point)',
            options: ['No (0 points)', 'Unsure (2 points)', 'Yes, 1-5kg (1 point)', 'Yes, 6-10kg (2 points)', 'Yes, 11-15kg (3 points)', 'Yes, >15kg (4 points)'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient said: "呢幾個月瘦咗差唔多5公斤"'
          },
          {
            id: 'mst-poor-appetite',
            label: 'MST - Poor Appetite',
            type: 'select',
            value: 'Yes (1 point)',
            options: ['No (0 points)', 'Yes (1 point)'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient said: "冇乜心機食嘢"'
          },
          {
            id: 'diet-type',
            label: 'Diet Type',
            type: 'select',
            value: 'Soft diet',
            options: ['Diet as tolerated', 'Regular diet', 'Soft diet', 'Mince diet', 'Congee diet', 'Semi-clear fluid diet', 'Clear fluid diet', 'D-pureed meat soft rice diet', 'D-puree diet'],
            dataSource: 'manual'
          },
          {
            id: 'food-preference',
            label: 'Food Preference',
            type: 'select',
            value: 'No pork',
            options: ['Fish only', 'No beef', 'No pork', 'No chicken', 'Vegetarian', 'Others'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned not eating pork'
          },
          {
            id: 'oral-feeding',
            label: 'Oral Feeding Assistance',
            type: 'select',
            value: 'Self-help',
            options: ['Self-help', 'With assistance', 'By others'],
            dataSource: 'manual'
          }
        ];

      case 'skin':
        return [
          {
            id: 'skin-condition',
            label: 'General Skin Condition',
            type: 'select',
            value: 'Dry',
            options: ['Intact', 'Dry', 'Fragile', 'Oedema', 'Rash', 'Pressure injury / Wound'],
            dataSource: 'manual'
          },
          {
            id: 'wound-1-present',
            label: 'Wound 1 Present',
            type: 'select',
            value: 'Yes',
            options: ['No', 'Yes'],
            dataSource: 'manual'
          },
          {
            id: 'wound-1-type',
            label: 'Wound 1 - Type',
            type: 'select',
            value: 'Abrasion',
            options: ['Pressure injury', 'Medical device related pressure injury', 'Abrasion', 'Laceration', 'Ulcer', 'Suture wound', 'Incision', 'Drain wound', 'Burn', 'Scald'],
            dataSource: 'manual'
          },
          {
            id: 'wound-1-location',
            label: 'Wound 1 - Location/Site',
            type: 'text',
            value: 'Left forehead, 3cm above eyebrow',
            dataSource: 'manual'
          },
          {
            id: 'wound-1-size',
            label: 'Wound 1 - Size (LxWxD, cm)',
            type: 'text',
            value: '2 x 1 x 0.2',
            dataSource: 'manual'
          },
          {
            id: 'wound-1-severity',
            label: 'Wound 1 - Severity',
            type: 'select',
            value: 'Shallow',
            options: ['Shallow', 'Intermediate', 'Deep', 'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Unstageable', 'Deep tissue pressure injury'],
            dataSource: 'manual'
          },
          {
            id: 'wound-1-discharge',
            label: 'Wound 1 - Discharge',
            type: 'select',
            value: 'Small amount',
            options: ['Nil', 'Small amount', 'Profuse'],
            dataSource: 'manual'
          }
        ];

      case 'pain-emotional':
        return [
          {
            id: 'pain-present',
            label: 'Pain Present',
            type: 'select',
            value: 'Yes',
            options: ['No', 'Unassessable', 'Yes'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient mentioned pain from the fall'
          },
          {
            id: 'pain-severity',
            label: 'Pain Severity',
            type: 'select',
            value: 'Medium',
            options: ['High', 'Medium', 'Low'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient described moderate pain level'
          },
          {
            id: 'pain-location',
            label: 'Pain Location',
            type: 'select',
            value: 'Head',
            options: ['Whole body', 'Head', 'Face', 'Chest', 'Abdomen', 'Back', 'Upper limbs', 'Lower limbs', 'Others'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient indicated head pain from fall'
          },
          {
            id: 'emotional-status',
            label: 'Emotional Status',
            type: 'select',
            value: 'Depressed',
            options: ['Stable', 'Depressed', 'Confused', 'Agitated', 'Others'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient appeared sad and withdrawn during conversation'
          },
          {
            id: 'suicide-admission',
            label: 'Admitted due to suicidal attempt/idea',
            type: 'select',
            value: 'No',
            options: ['Yes', 'No'],
            dataSource: 'ai-filled',
            aiSourceText: 'Patient denied suicidal ideation when assessed'
          },
          {
            id: 'suicide-expression',
            label: 'Expresses suicidal idea/self-harm',
            type: 'select',
            value: 'No',
            options: ['Yes', 'No'],
            dataSource: 'manual'
          }
        ];

      default:
        return [];
    }
  };

  return {
    patient,
    sections,
    currentSection,
    setCurrentSection,
    riskScores,
    isRecording,
    handleRecordingStart,
    handleRecordingStop,
    handleFieldChange,
    getFormFields
  };
}
