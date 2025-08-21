import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
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
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<Record<string, FormField[]>>({});

  // Initialize assessment on component mount - mock for development
  useEffect(() => {
    // Mock initialization without database calls for development
    setAssessmentId('mock-assessment-id');
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Initialize form fields with default values for development
    const fieldsBySection: Record<string, FormField[]> = {};
    sections.forEach(section => {
      fieldsBySection[section.id] = getDefaultFormFields(section.id);
    });
    setFormFields(fieldsBySection);

    // Initialize mock risk scores
    setRiskScores([
      {
        name: 'Morse Fall Scale',
        score: 45,
        maxScore: 125,
        level: 'medium',
        description: 'Medium risk of falls'
      },
      {
        name: 'Malnutrition Screening',
        score: 2,
        maxScore: 5,
        level: 'low',
        description: 'Low malnutrition risk'
      }
    ]);
  };

  const loadRiskScores = async () => {
    if (!assessmentId) return;

    try {
      const { data, error } = await supabase
        .from('risk_scores')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (error) throw error;

      const scores: RiskScore[] = data?.map(score => ({
        name: score.score_name,
        score: score.score_value,
        maxScore: score.max_score,
        level: score.risk_level as 'low' | 'medium' | 'high',
        description: score.description || ''
      })) || [];

      setRiskScores(scores);
    } catch (error) {
      console.error('Error loading risk scores:', error);
    }
  };

  const loadFormFields = async (assessmentIdParam?: string) => {
    const id = assessmentIdParam || assessmentId;
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('form_field_values')
        .select('*')
        .eq('assessment_id', id);

      if (error) throw error;

      // Group fields by section
      const fieldsBySection: Record<string, FormField[]> = {};
      
      // Initialize with default fields for each section
      sections.forEach(section => {
        fieldsBySection[section.id] = getDefaultFormFields(section.id);
      });

      // Override with saved values
      data?.forEach(fieldValue => {
        const sectionFields = fieldsBySection[fieldValue.section_id] || [];
        const fieldIndex = sectionFields.findIndex(f => f.id === fieldValue.field_id);
        
        if (fieldIndex >= 0) {
          sectionFields[fieldIndex] = {
            ...sectionFields[fieldIndex],
            value: fieldValue.value || '',
            dataSource: fieldValue.data_source as any,
            aiSourceText: fieldValue.ai_source_text || undefined
          };
        }
      });

      setFormFields(fieldsBySection);
    } catch (error) {
      console.error('Error loading form fields:', error);
    }
  };

  const handleRecordingStart = () => {
    setIsRecording(true);
  };

  const handleRecordingStop = async (audioBlob?: Blob) => {
    setIsRecording(false);
    
    if (!audioBlob) {
      console.log('No audio data received');
      return;
    }
    
    try {
      console.log('Processing audio with AI...');
      
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        try {
          // First, transcribe the audio
          const transcribeResponse = await supabase.functions.invoke('transcribe-audio', {
            body: { audio: base64Audio }
          });
          
          if (transcribeResponse.error) {
            throw transcribeResponse.error;
          }
          
          const { text: transcriptText } = transcribeResponse.data;
          console.log('Transcription:', transcriptText?.substring(0, 100) + '...');
          
          if (transcriptText && transcriptText.trim()) {
            // Process the transcript to extract form fields
            const processResponse = await supabase.functions.invoke('process-audio-transcript', {
              body: { 
                assessmentId: assessmentId,
                transcriptText: transcriptText 
              }
            });
            
            if (processResponse.error) {
              throw processResponse.error;
            }
            
            console.log('AI processing complete');
            
            // Show success message
            toast({
              title: "AI Processing Complete",
              description: `Extracted information from conversation and filled form fields`,
            });
            
            // Reload data to get new AI-filled fields
            await loadFormFields(assessmentId);
            await calculateRiskScores();
          }
          
        } catch (error) {
          console.error('Error processing audio:', error);
          toast({
            title: "Error",
            description: "Failed to process audio recording",
            variant: "destructive",
          });
        }
      };
      
    } catch (error) {
      console.error('Error in handleRecordingStop:', error);
    }
  };

  const calculateRiskScores = async () => {
    if (!assessmentId) return;

    try {
      const { error } = await supabase.functions.invoke('calculate-risk-scores', {
        body: { assessmentId }
      });

      if (error) throw error;
      await loadRiskScores();
    } catch (error) {
      console.error('Error calculating risk scores:', error);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    console.log(`Field ${fieldId} changed to:`, value);

    // Update local state immediately for development
    const updatedFields = { ...formFields };
    Object.keys(updatedFields).forEach(sectionId => {
      const fieldIndex = updatedFields[sectionId].findIndex(f => f.id === fieldId);
      if (fieldIndex >= 0) {
        updatedFields[sectionId][fieldIndex].value = value;
        updatedFields[sectionId][fieldIndex].dataSource = 'manual';
      }
    });
    setFormFields(updatedFields);
  };

  // Form field definitions for each section
  const getFormFields = (sectionId: string): FormField[] => {
    return formFields[sectionId] || getDefaultFormFields(sectionId);
  };

  const getDefaultFormFields = (sectionId: string): FormField[] => {
    switch (sectionId) {
      case 'general-physical':
        return [
          {
            id: 'emergency-contact-1-name',
            label: 'Emergency Contact 1 - Name',
            type: 'text',
            value: '',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'emergency-contact-1-relationship',
            label: 'Emergency Contact 1 - Relationship',
            type: 'text',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'current-complaint',
            label: 'Current Complaint / Problem',
            type: 'textarea',
            value: '',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'temperature',
            label: 'Temperature (°C)',
            type: 'number',
            value: '',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'temperature-method',
            label: 'Temperature Method',
            type: 'select',
            value: '',
            options: ['Oral', 'Tympanic', 'Axilla', 'Rectal', 'Skin'],
            dataSource: 'manual'
          },
          {
            id: 'pulse',
            label: 'Pulse (/min)',
            type: 'number',
            value: '',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'bp-systolic',
            label: 'BP Systolic (mmHg)',
            type: 'number',
            value: '',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'bp-diastolic',
            label: 'BP Diastolic (mmHg)',
            type: 'number',
            value: '',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'respiratory-rate',
            label: 'Respiratory Rate (/min)',
            type: 'number',
            value: '',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'spo2',
            label: 'SpO2 (%)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'coughing',
            label: 'Coughing',
            type: 'select',
            value: '',
            options: ['Yes', 'No'],
            dataSource: 'manual'
          },
          {
            id: 'sputum',
            label: 'Sputum Present',
            type: 'select',
            value: '',
            options: ['Yes', 'No'],
            dataSource: 'manual'
          },
          {
            id: 'sputum-colour',
            label: 'Sputum Colour',
            type: 'select',
            value: '',
            options: ['Clear', 'White', 'Yellow', 'Green', 'Cream colour', 'Coffee/Rusty', 'Blood-stained'],
            dataSource: 'manual'
          }
        ];

      case 'social':
        return [
          {
            id: 'marital-status',
            label: 'Marital Status',
            type: 'select',
            value: '',
            options: ['Single', 'Married', 'Cohabited', 'Widowed', 'Separated', 'Divorced', 'Unknown', 'Cannot be assessed'],
            dataSource: 'manual'
          },
          {
            id: 'religion',
            label: 'Religion',
            type: 'select',
            value: '',
            options: ['Nil', 'Buddhism', 'Catholic', 'Christian', 'Confucianism', 'Hindu', 'Jehovah Witness', 'Jewish', 'Muslim', 'Sikh', 'Traditional Chinese', 'Taoism', 'Other', 'Unknown', 'Cannot be assessed'],
            dataSource: 'manual'
          },
          {
            id: 'education',
            label: 'Education Level',
            type: 'select',
            value: '',
            options: ['No school / Kindergarten', 'Primary', 'Secondary', 'Tertiary', 'Unknown', 'Cannot be assessed'],
            dataSource: 'manual'
          },
          {
            id: 'employment-status',
            label: 'Employment Status',
            type: 'select',
            value: '',
            options: ['Employer', 'Employee', 'Self-employed', 'Homemaker', 'Student', 'Unemployed', 'Retired', 'Not working', 'Other', 'Unknown', 'Cannot be assessed'],
            dataSource: 'manual'
          },
          {
            id: 'household-members',
            label: 'Household Members',
            type: 'select',
            value: '',
            options: ['Alone', 'Grandparents', 'Father', 'Mother', 'Spouse', 'Siblings', 'Children', 'Attendant / maid / helper', 'Relatives', 'Guardian', 'Friend', 'Boyfriend / girlfriend', 'Others'],
            dataSource: 'manual'
          },
          {
            id: 'accommodation',
            label: 'Accommodation Type',
            type: 'select',
            value: '',
            options: ['Hospital', 'Hostel', 'Halfway house', 'Old aged home', 'Private residential flat', 'Public rental flat', 'Street Sleeper', 'Temporary housing', 'Traditional village house', 'Other', 'Unknown', 'Cannot be assessed'],
            dataSource: 'manual'
          },
          {
            id: 'smoking-status',
            label: 'Smoking Status',
            type: 'select',
            value: '',
            options: ['Smoker', 'Ex-smoker', 'Non-smoker', 'Unknown', 'Cannot be assessed'],
            dataSource: 'manual'
          },
          {
            id: 'drinking-status',
            label: 'Drinking Status',
            type: 'select',
            value: '',
            options: ['Drinker', 'Ex-drinker', 'Non-drinker', 'Social Drinker', 'Unknown', 'Cannot be assessed'],
            dataSource: 'manual'
          }
        ];

      case 'risk':
        return [
          {
            id: 'cpe-screening',
            label: 'CPE Screening - Hospitalization outside HK in last 12 months',
            type: 'select',
            value: '',
            options: ['Unknown', 'No', 'Yes'],
            dataSource: 'manual'
          },
          {
            id: 'morse-history-falling',
            label: 'Morse Fall Scale - History of Falling',
            type: 'select',
            value: '',
            options: ['No (0 points)', 'Yes (25 points)'],
            dataSource: 'manual'
          },
          {
            id: 'morse-secondary-diagnosis',
            label: 'Morse Fall Scale - Secondary Diagnosis',
            type: 'select',
            value: '',
            options: ['No (0 points)', 'Yes (15 points)'],
            dataSource: 'manual'
          },
          {
            id: 'morse-ambulatory-aid',
            label: 'Morse Fall Scale - Ambulatory Aid',
            type: 'select',
            value: '',
            options: ['None/Bed rest/Nurse assist (0 points)', 'Crutches/Cane/Walkers (15 points)', 'Furniture (30 points)'],
            dataSource: 'manual'
          },
          {
            id: 'morse-iv-therapy',
            label: 'Morse Fall Scale - IV Therapy/Lock',
            type: 'select',
            value: '',
            options: ['No (0 points)', 'Yes (20 points)'],
            dataSource: 'manual'
          },
          {
            id: 'morse-gait',
            label: 'Morse Fall Scale - Gait',
            type: 'select',
            value: '',
            options: ['Normal/Bed rest/Wheelchair (0 points)', 'Weak (10 points)', 'Impaired (20 points)'],
            dataSource: 'manual'
          },
          {
            id: 'morse-mental-status',
            label: 'Morse Fall Scale - Mental Status',
            type: 'select',
            value: '',
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
            value: '',
            options: ['Normal', 'Cataract', 'Squint', 'Glaucoma', 'Double vision', 'Blurred vision', 'Blindness', 'Other'],
            dataSource: 'manual'
          },
          {
            id: 'vision-right',
            label: 'Vision (Right Eye)',
            type: 'select',
            value: '',
            options: ['Normal', 'Cataract', 'Squint', 'Glaucoma', 'Double vision', 'Blurred vision', 'Blindness', 'Other'],
            dataSource: 'manual'
          },
          {
            id: 'language-dialect',
            label: 'Language / Dialect',
            type: 'select',
            value: '',
            options: ['Cantonese (廣東話)', 'English', 'Mandarin (普通話)', 'Shanghainese (上海話)', 'Chiu Chow (潮州話)', 'Hokkien (福建話)', 'Hakka (客家話)', 'Filipino (菲律賓話)', 'Others'],
            dataSource: 'pre-populated'
          },
          {
            id: 'speech',
            label: 'Speech Quality',
            type: 'select',
            value: '',
            options: ['Clear', 'Slurring', 'Incomprehensible sounds', 'Dysphasia'],
            dataSource: 'manual'
          },
          {
            id: 'hearing-left',
            label: 'Hearing (Left Ear)',
            type: 'select',
            value: '',
            options: ['Normal', 'Impaired', 'Deaf'],
            dataSource: 'manual'
          },
          {
            id: 'mobility-status',
            label: 'Mobility Status',
            type: 'select',
            value: '',
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
            value: '',
            options: ['Normal', 'Frequent', 'Dysuria', 'Incontinence', 'Urinary retention', 'Anuria', 'Oliguria', 'Others'],
            dataSource: 'manual'
          },
          {
            id: 'bowel-pattern',
            label: 'Bowel Pattern',
            type: 'select',
            value: '',
            options: ['Normal', 'Incontinence', 'Constipation', 'Diarrhoea', 'Others'],
            dataSource: 'manual'
          },
          {
            id: 'mst-weight-loss',
            label: 'MST - Recent Weight Loss',
            type: 'select',
            value: '',
            options: ['No (0 points)', 'Unsure (2 points)', 'Yes, 1-5kg (1 point)', 'Yes, 6-10kg (2 points)', 'Yes, 11-15kg (3 points)', 'Yes, >15kg (4 points)'],
            dataSource: 'manual'
          },
          {
            id: 'mst-poor-appetite',
            label: 'MST - Poor Appetite',
            type: 'select',
            value: '',
            options: ['No (0 points)', 'Yes (1 point)'],
            dataSource: 'manual'
          },
          {
            id: 'diet-type',
            label: 'Diet Type',
            type: 'select',
            value: '',
            options: ['Diet as tolerated', 'Regular diet', 'Soft diet', 'Mince diet', 'Congee diet', 'Semi-clear fluid diet', 'Clear fluid diet', 'D-pureed meat soft rice diet', 'D-puree diet'],
            dataSource: 'manual'
          },
          {
            id: 'food-preference',
            label: 'Food Preference',
            type: 'select',
            value: '',
            options: ['Fish only', 'No beef', 'No pork', 'No chicken', 'Vegetarian', 'Others'],
            dataSource: 'manual'
          },
          {
            id: 'oral-feeding',
            label: 'Oral Feeding Assistance',
            type: 'select',
            value: '',
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
            value: '',
            options: ['Intact', 'Dry', 'Fragile', 'Oedema', 'Rash', 'Pressure injury / Wound'],
            dataSource: 'manual'
          },
          {
            id: 'wound-1-present',
            label: 'Wound 1 Present',
            type: 'select',
            value: '',
            options: ['No', 'Yes'],
            dataSource: 'manual'
          },
          {
            id: 'wound-1-type',
            label: 'Wound 1 - Type',
            type: 'select',
            value: '',
            options: ['Pressure injury', 'Medical device related pressure injury', 'Abrasion', 'Laceration', 'Ulcer', 'Suture wound', 'Incision', 'Drain wound', 'Burn', 'Scald'],
            dataSource: 'manual'
          },
          {
            id: 'wound-1-location',
            label: 'Wound 1 - Location/Site',
            type: 'text',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'wound-1-size',
            label: 'Wound 1 - Size (LxWxD, cm)',
            type: 'text',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'wound-1-severity',
            label: 'Wound 1 - Severity',
            type: 'select',
            value: '',
            options: ['Shallow', 'Intermediate', 'Deep', 'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Unstageable', 'Deep tissue pressure injury'],
            dataSource: 'manual'
          },
          {
            id: 'wound-1-discharge',
            label: 'Wound 1 - Discharge',
            type: 'select',
            value: '',
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
            value: '',
            options: ['No', 'Unassessable', 'Yes'],
            dataSource: 'manual'
          },
          {
            id: 'pain-severity',
            label: 'Pain Severity',
            type: 'select',
            value: '',
            options: ['High', 'Medium', 'Low'],
            dataSource: 'manual'
          },
          {
            id: 'pain-location',
            label: 'Pain Location',
            type: 'select',
            value: '',
            options: ['Whole body', 'Head', 'Face', 'Chest', 'Abdomen', 'Back', 'Upper limbs', 'Lower limbs', 'Others'],
            dataSource: 'manual'
          },
          {
            id: 'emotional-status',
            label: 'Emotional Status',
            type: 'select',
            value: '',
            options: ['Stable', 'Depressed', 'Confused', 'Agitated', 'Others'],
            dataSource: 'manual'
          },
          {
            id: 'suicide-admission',
            label: 'Admitted due to suicidal attempt/idea',
            type: 'select',
            value: '',
            options: ['Yes', 'No'],
            dataSource: 'manual'
          },
          {
            id: 'suicide-expression',
            label: 'Expresses suicidal idea/self-harm',
            type: 'select',
            value: '',
            options: ['Yes', 'No'],
            dataSource: 'manual'
          }
        ];

      default:
        return [];
    }
  };

  const submitAssessment = async () => {
    if (!assessmentId) return;

    try {
      const { error } = await supabase.functions.invoke('submit-assessment', {
        body: { assessmentId }
      });

      if (error) throw error;

      toast({
        title: "Assessment Submitted",
        description: "Assessment successfully submitted to EMR system",
      });

    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to submit assessment",
        variant: "destructive",
      });
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
    getFormFields,
    submitAssessment,
    assessmentId
  };
}
