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

export function usePatientAssessment(patientId?: string) {
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
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<Record<string, FormField[]>>({});

  // Initialize assessment on component mount or when patientId changes
  useEffect(() => {
    if (patientId) {
      initializeAssessment(patientId);
    } else {
      // Mock initialization for development when no patientId
      setAssessmentId(crypto.randomUUID());
      initializeMockData();
    }
  }, [patientId]);

  const initializeAssessment = async (patientIdParam: string) => {
    try {
      // Create new assessment for the patient
      const { data: assessment, error: assessmentError } = await supabase
        .from('patient_assessments')
        .insert({
          patient_id: patientIdParam,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (assessmentError) {
        // If assessment already exists, load it
        const { data: existingAssessment, error: loadError } = await supabase
          .from('patient_assessments')
          .select('*')
          .eq('patient_id', patientIdParam)
          .eq('status', 'in_progress')
          .single();

        if (loadError) throw loadError;
        setAssessmentId(existingAssessment.id);
        await loadFormFields(existingAssessment.id);
        await loadRiskScores();
      } else {
        setAssessmentId(assessment.id);
        initializeMockData();
      }
    } catch (error) {
      console.error('Error initializing assessment:', error);
      // Fallback to mock data
      setAssessmentId(crypto.randomUUID());
      initializeMockData();
    }
  };

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
    setLastTranscript(""); // Clear previous transcript
    setIsProcessingAudio(false); // Reset processing state
  };

  const handleRecordingStop = async (audioBlob?: Blob) => {
    setIsRecording(false);
    setIsProcessingAudio(true); // Start processing
    
    if (!audioBlob) {
      console.log('No audio data received');
      setIsProcessingAudio(false);
      return;
    }
    
    try {
      console.log('Processing audio with AI...');
      
      // Show initial processing message
      toast({
        title: "Processing Audio",
        description: "Transcribing audio with AI...",
      });
      
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
            // Store the transcript for display
            setLastTranscript(transcriptText);
            
            // Show AI processing message
            toast({
              title: "Extracting Information",
              description: "AI is analyzing conversation and filling form fields...",
            });
            
            // Process the transcript to extract form fields
            const processResponse = await supabase.functions.invoke('process-audio-transcript', {
              body: { 
                assessmentId: assessmentId,
                transcriptText: transcriptText 
              }
            });
            
            if (processResponse.error) {
              // Check for authentication errors
              if (processResponse.error.message?.includes('Unauthorized') || 
                  processResponse.error.message?.includes('JWT')) {
                toast({
                  title: "Authentication Required",
                  description: "Please sign in to use AI features. Redirecting to login...",
                  variant: "destructive",
                });
                setTimeout(() => {
                  window.location.href = '/auth';
                }, 2000);
                return;
              }
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
          } else {
            toast({
              title: "No Speech Detected",
              description: "No clear speech was detected in the recording. Please try again.",
              variant: "destructive",
            });
          }
          
        } catch (error) {
          console.error('Error processing audio:', error);
          
          // Handle specific error types
          if (error?.message?.includes('Unauthorized') || error?.message?.includes('JWT')) {
            toast({
              title: "Authentication Required",
              description: "Please sign in to use AI features. Redirecting to login...",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = '/auth';
            }, 2000);
          } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
            toast({
              title: "Network Error",
              description: "Failed to connect to AI services. Please check your connection and try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Processing Error",
              description: error?.message || "Failed to process audio recording. Please try again.",
              variant: "destructive",
            });
          }
        } finally {
          setIsProcessingAudio(false); // Stop processing
        }
      };
      
    } catch (error) {
      console.error('Error in handleRecordingStop:', error);
      toast({
        title: "Error",
        description: "Failed to process audio recording",
        variant: "destructive",
      });
      setIsProcessingAudio(false); // Stop processing on error
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

    // Recalculate risk scores locally when relevant fields change
    if (fieldId.startsWith('morse-') || fieldId.startsWith('gcs-') || fieldId.startsWith('norton-') || 
        fieldId.startsWith('braden-') || fieldId.startsWith('hkc-must-') || fieldId.startsWith('mst-')) {
      calculateLocalRiskScores(updatedFields);
    }
  };

  const calculateLocalRiskScores = (fieldsData: Record<string, FormField[]>) => {
    const riskFields = fieldsData['risk'] || [];
    const physicalFields = fieldsData['physical'] || [];
    const nutritionFields = fieldsData['nutrition'] || [];
    const functionalFields = fieldsData['functional'] || [];
    
    const updatedScores: RiskScore[] = [];

    // Calculate Morse Fall Scale Score
    let morseScore = 0;
    
    const historyFalling = riskFields.find(f => f.id === 'morse-history-falling')?.value;
    if (historyFalling === 'Yes (25 points)') morseScore += 25;
    
    const secondaryDiagnosis = riskFields.find(f => f.id === 'morse-secondary-diagnosis')?.value;
    if (secondaryDiagnosis === 'Yes (15 points)') morseScore += 15;
    
    const ambulatoryAid = riskFields.find(f => f.id === 'morse-ambulatory-aid')?.value;
    if (ambulatoryAid === 'Crutches/Cane/Walkers (15 points)') morseScore += 15;
    else if (ambulatoryAid === 'Furniture (30 points)') morseScore += 30;
    
    const ivTherapy = riskFields.find(f => f.id === 'morse-iv-therapy')?.value;
    if (ivTherapy === 'Yes (20 points)') morseScore += 20;
    
    const gait = riskFields.find(f => f.id === 'morse-gait')?.value;
    if (gait === 'Weak (10 points)') morseScore += 10;
    else if (gait === 'Impaired (20 points)') morseScore += 20;
    
    const mentalStatus = riskFields.find(f => f.id === 'morse-mental-status')?.value;
    if (mentalStatus === 'Overestimates/Forgets limitations (15 points)') morseScore += 15;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (morseScore >= 45) riskLevel = 'high';
    else if (morseScore >= 25) riskLevel = 'medium';

    updatedScores.push({
      name: 'Morse Fall Scale',
      score: morseScore,
      maxScore: 125,
      level: riskLevel,
      description: `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} risk of falls (${morseScore}/125 points)`
    });

    // Calculate Glasgow Coma Scale (GCS)
    let gcsScore = 0;
    const eyeResponse = parseInt(String(physicalFields.find(f => f.id === 'gcs-eye')?.value || '0'));
    const verbalResponse = parseInt(String(physicalFields.find(f => f.id === 'gcs-verbal')?.value || '0'));
    const motorResponse = parseInt(String(physicalFields.find(f => f.id === 'gcs-motor')?.value || '0'));
    
    gcsScore = eyeResponse + verbalResponse + motorResponse;
    
    if (gcsScore > 0) {
      let gcsRisk: 'low' | 'medium' | 'high' = 'low';
      if (gcsScore <= 8) gcsRisk = 'high';
      else if (gcsScore <= 12) gcsRisk = 'medium';

      updatedScores.push({
        name: 'Glasgow Coma Scale',
        score: gcsScore,
        maxScore: 15,
        level: gcsRisk,
        description: `GCS ${gcsScore}/15 - ${gcsRisk} risk neurological impairment`
      });
    }

    // Calculate Norton Scale
    let nortonScore = 0;
    const physicalCondition = parseInt(String(riskFields.find(f => f.id === 'norton-physical')?.value || '0'));
    const mentalCondition = parseInt(String(riskFields.find(f => f.id === 'norton-mental')?.value || '0'));
    const activity = parseInt(String(riskFields.find(f => f.id === 'norton-activity')?.value || '0'));
    const mobility = parseInt(String(riskFields.find(f => f.id === 'norton-mobility')?.value || '0'));
    const incontinence = parseInt(String(riskFields.find(f => f.id === 'norton-incontinence')?.value || '0'));
    
    nortonScore = physicalCondition + mentalCondition + activity + mobility + incontinence;
    
    if (nortonScore > 0) {
      let nortonRisk: 'low' | 'medium' | 'high' = 'low';
      if (nortonScore <= 14) nortonRisk = 'high';
      else if (nortonScore <= 18) nortonRisk = 'medium';

      updatedScores.push({
        name: 'Norton Scale',
        score: nortonScore,
        maxScore: 20,
        level: nortonRisk,
        description: `${nortonRisk.charAt(0).toUpperCase() + nortonRisk.slice(1)} pressure injury risk (${nortonScore}/20)`
      });
    }

    // Calculate Braden Scale
    let bradenScore = 0;
    const sensory = parseInt(String(riskFields.find(f => f.id === 'braden-sensory')?.value || '0'));
    const moisture = parseInt(String(riskFields.find(f => f.id === 'braden-moisture')?.value || '0'));
    const bradenActivity = parseInt(String(riskFields.find(f => f.id === 'braden-activity')?.value || '0'));
    const bradenMobility = parseInt(String(riskFields.find(f => f.id === 'braden-mobility')?.value || '0'));
    const nutrition = parseInt(String(riskFields.find(f => f.id === 'braden-nutrition')?.value || '0'));
    const friction = parseInt(String(riskFields.find(f => f.id === 'braden-friction')?.value || '0'));
    
    bradenScore = sensory + moisture + bradenActivity + bradenMobility + nutrition + friction;
    
    if (bradenScore > 0) {
      let bradenRisk: 'low' | 'medium' | 'high' = 'low';
      if (bradenScore <= 12) bradenRisk = 'high';
      else if (bradenScore <= 18) bradenRisk = 'medium';

      updatedScores.push({
        name: 'Braden Scale',
        score: bradenScore,
        maxScore: 23,
        level: bradenRisk,
        description: `${bradenRisk.charAt(0).toUpperCase() + bradenRisk.slice(1)} pressure injury risk (${bradenScore}/23)`
      });
    }

    // Calculate HKC-MUST Score
    let hkcMustScore = 0;
    const bmiScore = parseInt(String(nutritionFields.find(f => f.id === 'hkc-must-bmi')?.value || '0'));
    const weightLossScore = parseInt(String(nutritionFields.find(f => f.id === 'hkc-must-weight-loss')?.value || '0'));
    const acuteIllness = parseInt(String(nutritionFields.find(f => f.id === 'hkc-must-acute')?.value || '0'));
    
    hkcMustScore = bmiScore + weightLossScore + acuteIllness;
    
    if (hkcMustScore > 0) {
      let hkcRisk: 'low' | 'medium' | 'high' = 'low';
      if (hkcMustScore >= 2) hkcRisk = 'medium';
      if (hkcMustScore >= 4) hkcRisk = 'high';

      updatedScores.push({
        name: 'HKC-MUST',
        score: hkcMustScore,
        maxScore: 6,
        level: hkcRisk,
        description: `${hkcRisk.charAt(0).toUpperCase() + hkcRisk.slice(1)} malnutrition risk (${hkcMustScore}/6)`
      });
    }

    // Calculate MST Score
    let mstScore = 0;
    const weightLoss = parseInt(String(nutritionFields.find(f => f.id === 'mst-weight-loss')?.value || '0'));
    const poorAppetite = parseInt(String(nutritionFields.find(f => f.id === 'mst-appetite')?.value || '0'));
    
    mstScore = weightLoss + poorAppetite;
    
    if (mstScore > 0) {
      let mstRisk: 'low' | 'medium' | 'high' = 'low';
      if (mstScore >= 2) mstRisk = 'medium';
      if (mstScore >= 4) mstRisk = 'high';

      updatedScores.push({
        name: 'Malnutrition Screening Tool',
        score: mstScore,
        maxScore: 5,
        level: mstRisk,
        description: `${mstRisk.charAt(0).toUpperCase() + mstRisk.slice(1)} malnutrition risk (${mstScore}/5)`
      });
    }

    console.log('Risk scores calculated:', updatedScores);
    setRiskScores(updatedScores);
  };

  // Form field definitions for each section
  const getFormFields = (sectionId: string): FormField[] => {
    return formFields[sectionId] || getDefaultFormFields(sectionId);
  };

  const getDefaultFormFields = (sectionId: string): FormField[] => {
    switch (sectionId) {
      case 'general-physical':
        return [
          // General Information
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
            id: 'emergency-contact-1-phone',
            label: 'Emergency Contact 1 - Phone',
            type: 'text',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'emergency-contact-2-name',
            label: 'Emergency Contact 2 - Name',
            type: 'text',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'bring-in-belongings',
            label: 'Bring-in Belongings',
            type: 'textarea',
            value: '',
            dataSource: 'manual'
          },
          // Current Complaint
          {
            id: 'current-complaint',
            label: 'Current Complaint / Problem',
            type: 'textarea',
            value: '',
            dataSource: 'manual',
            required: true
          },
          // Vital Signs
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
            id: 'pulse-site',
            label: 'Pulse Site',
            type: 'select',
            value: '',
            options: ['Radial', 'Apical', 'Carotid', 'Brachial', 'Femoral', 'Popliteal', 'Dorsalis pedis', 'Other'],
            dataSource: 'manual'
          },
          {
            id: 'pulse-pattern',
            label: 'Pulse Pattern',
            type: 'select',
            value: '',
            options: ['Regular', 'Irregular', 'N/A'],
            dataSource: 'manual'
          },
          {
            id: 'pacemaker',
            label: 'Pacemaker',
            type: 'select',
            value: '',
            options: ['Yes', 'No'],
            dataSource: 'manual'
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
            id: 'bp-position',
            label: 'BP Position',
            type: 'select',
            value: '',
            options: ['Sitting', 'Standing', 'Lying', 'Other'],
            dataSource: 'manual'
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
            id: 'breathing-pattern',
            label: 'Breathing Pattern',
            type: 'select',
            value: '',
            options: ['Normal', 'Dyspnoea'],
            dataSource: 'manual'
          },
          {
            id: 'spo2',
            label: 'SpO2 (%)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'oxygen-therapy',
            label: 'Oxygen Therapy',
            type: 'select',
            value: '',
            options: ['Yes', 'No'],
            dataSource: 'manual'
          },
          {
            id: 'oxygen-rate',
            label: 'Oxygen Rate (L/min)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'oxygen-delivery',
            label: 'Oxygen Delivery Method',
            type: 'select',
            value: '',
            options: ['Mask', 'Cannula', 'Ventilator'],
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
            id: 'sputum-amount',
            label: 'Sputum Amount',
            type: 'text',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'sputum-colour',
            label: 'Sputum Colour',
            type: 'select',
            value: '',
            options: ['Clear', 'White', 'Yellow', 'Green', 'Cream colour', 'Coffee/Rusty', 'Blood-stained'],
            dataSource: 'manual'
          },
          // Body Measurement
          {
            id: 'weight',
            label: 'Weight (kg)',
            type: 'number',
            value: '',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'height',
            label: 'Height (cm)',
            type: 'number',
            value: '',
            dataSource: 'manual',
            required: true
          },
          {
            id: 'bmi',
            label: 'Body Mass Index (kg/m²)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'weight-loss-10-percent',
            label: '10% weight loss within 6 months prior to admission',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          // Urinalysis
          {
            id: 'urinalysis-sugar',
            label: 'Urinalysis - Sugar',
            type: 'select',
            value: '',
            options: ['Negative', 'Trace', '+', '++', '+++ or above'],
            dataSource: 'manual'
          },
          {
            id: 'urinalysis-albumin',
            label: 'Urinalysis - Albumin',
            type: 'select',
            value: '',
            options: ['Negative', 'Trace', '+', '++', '+++ or above'],
            dataSource: 'manual'
          },
          {
            id: 'urinalysis-ketone',
            label: 'Urinalysis - Ketone',
            type: 'select',
            value: '',
            options: ['Negative', 'Trace', '+', '++', '+++ or above'],
            dataSource: 'manual'
          },
          {
            id: 'urinalysis-wbc',
            label: 'Urinalysis - White Blood Cell',
            type: 'select',
            value: '',
            options: ['Negative', 'Trace', '+', '++', '+++ or above'],
            dataSource: 'manual'
          },
          {
            id: 'urinalysis-rbc',
            label: 'Urinalysis - Red Blood Cell',
            type: 'select',
            value: '',
            options: ['Negative', 'Trace', '+', '++', '+++ or above'],
            dataSource: 'manual'
          },
          {
            id: 'urinalysis-nitrite',
            label: 'Urinalysis - Nitrite',
            type: 'select',
            value: '',
            options: ['Negative', 'Trace', '+', '++', '+++ or above'],
            dataSource: 'manual'
          },
          // Other Measurements
          {
            id: 'last-menstrual-period',
            label: 'Last Menstrual Period',
            type: 'date',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'pregnancy-test',
            label: 'Pregnancy Test',
            type: 'select',
            value: '',
            options: ['-ve', 'Inconclusive', '+ve'],
            dataSource: 'manual'
          },
          {
            id: 'blood-glucose',
            label: 'Blood Glucose Monitoring (mmol/L)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          // Level of Consciousness (AVPU)
          {
            id: 'avpu',
            label: 'Level of Consciousness (AVPU)',
            type: 'select',
            value: '',
            options: ['Alert (A)', 'Response to Voice (V)', 'Response to Pain (P)', 'Unresponsive (U)'],
            dataSource: 'manual'
          },
          // Glasgow Coma Scale
          {
            id: 'gcs-eye',
            label: 'GCS - Eye Opening Response',
            type: 'select',
            value: '',
            options: ['4 - Spontaneously', '3 - To speech', '2 - To pain', '1 - No response'],
            dataSource: 'manual'
          },
          {
            id: 'gcs-verbal',
            label: 'GCS - Verbal Response',
            type: 'select',
            value: '',
            options: ['5 - Oriented', '4 - Confused', '3 - Inappropriate words', '2 - Incomprehensible sounds', '1 - None'],
            dataSource: 'manual'
          },
          {
            id: 'gcs-motor',
            label: 'GCS - Motor Response',
            type: 'select',
            value: '',
            options: ['6 - Obeys commands', '5 - Localizes to pain', '4 - Flexion withdrawal', '3 - Abnormal flexion', '2 - Abnormal extension', '1 - No response'],
            dataSource: 'manual'
          },
          {
            id: 'gcs-total',
            label: 'GCS Total Score',
            type: 'number',
            value: '',
            dataSource: 'manual'
          }
        ];

      case 'social':
        return [
          // Basic Demographics
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
          // Financial Support
          {
            id: 'financial-support',
            label: 'Financial Support',
            type: 'select',
            value: '',
            options: ['Comprehensive Social Security Assistance', 'Disability Allowance', 'Old Age Allowance', 'Traffic Accident Victims Assistance', 'Self-supporting', 'Supported by family', 'Supported by others'],
            dataSource: 'manual'
          },
          // Occupation
          {
            id: 'occupation',
            label: 'Occupation',
            type: 'select',
            value: '',
            options: ['Elementary occupation', 'Craft and related worker', 'Service / shop sales worker', 'Plant / machine operator', 'Clerk', 'Associate professional', 'Professional', 'Health Care Worker', 'Other'],
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
          // Nationality
          {
            id: 'nationality',
            label: 'Nationality',
            type: 'select',
            value: '',
            options: ['Chinese (Hong Kong)', 'Chinese (Mainland China)', 'Chinese (Taiwan)', 'American', 'British', 'Canadian', 'Filipino', 'Indian', 'Indonesian', 'Japanese', 'Korean', 'Nepalese', 'Pakistani', 'Thai', 'Other', 'Unknown', 'Cannot be assessed'],
            dataSource: 'manual'
          },
          // Habits
          {
            id: 'smoking-status',
            label: 'Smoking Status',
            type: 'select',
            value: '',
            options: ['Smoker', 'Ex-smoker', 'Non-smoker', 'Unknown', 'Cannot be assessed'],
            dataSource: 'manual'
          },
          {
            id: 'cigarettes-per-day',
            label: 'Cigarettes per Day',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'smoking-start-year',
            label: 'Smoking Start Year (yyyy)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'smoking-quit-year',
            label: 'Smoking Quit Year (yyyy)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'drinking-status',
            label: 'Drinking Status',
            type: 'select',
            value: '',
            options: ['Drinker', 'Ex-drinker', 'Non-drinker', 'Unknown', 'Cannot be assessed'],
            dataSource: 'manual'
          },
          {
            id: 'social-drinker',
            label: 'Social Drinker',
            type: 'select',
            value: '',
            options: ['Yes', 'No'],
            dataSource: 'manual'
          },
          {
            id: 'drinking-start-year',
            label: 'Drinking Start Year (yyyy)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'drinking-quit-year',
            label: 'Drinking Quit Year (yyyy)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'beverage-spirits',
            label: 'Spirits (ml/day)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'beverage-wine',
            label: 'Wine (ml/day)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'beverage-liquor',
            label: 'Liquor (ml/day)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          // Substance Use
          {
            id: 'substance-use-status',
            label: 'Substance Use Status',
            type: 'select',
            value: '',
            options: ['Active user', 'Ex-user', 'Non-user', 'Unknown', 'Cannot be assessed'],
            dataSource: 'manual'
          },
          {
            id: 'substance-type',
            label: 'Type of Substance',
            type: 'select',
            value: '',
            options: ['Cannabinoid', 'Cocaine', 'Ketamine', 'Opioid', 'Stimulant', 'Tranquillizer', 'Hypnotic', 'Sedative', 'Other'],
            dataSource: 'manual'
          },
          {
            id: 'substance-start-year',
            label: 'Substance Use Start Year (yyyy)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'substance-quit-year',
            label: 'Substance Use Quit Year (yyyy)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          }
        ];

      case 'risk':
        return [
          // Infection Risk
          {
            id: 'infection-risk',
            label: 'Infection Risk',
            type: 'select',
            value: '',
            options: ['At risk', 'Not at risk', 'Unknown'],
            dataSource: 'manual'
          },
          {
            id: 'cpe-screening',
            label: 'CPE Screening - Hospitalization outside HK in last 12 months',
            type: 'select',
            value: '',
            options: ['Unknown', 'No', 'Yes'],
            dataSource: 'manual'
          },
          {
            id: 'cpe-country',
            label: 'CPE Screening - Country/Area/City',
            type: 'text',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'vre-screening',
            label: 'VRE Screening - Hospitalization outside HK in last 12 months',
            type: 'select',
            value: '',
            options: ['Unknown', 'No', 'Yes'],
            dataSource: 'manual'
          },
          {
            id: 'vre-country',
            label: 'VRE Screening - Country/Area/City',
            type: 'text',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'isolation-precaution',
            label: 'Isolation Precaution Type',
            type: 'select',
            value: '',
            options: ['Airborne', 'Contact', 'Droplet', 'Reverse Isolation'],
            dataSource: 'manual'
          },
          {
            id: 'isolation-remarks',
            label: 'Isolation Precaution Remarks',
            type: 'textarea',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'ftocc-risk',
            label: 'FTOCC Risk Status',
            type: 'select',
            value: '',
            options: ['At risk', 'Not at risk', 'Unknown'],
            dataSource: 'manual'
          },
          {
            id: 'ftocc-fever',
            label: 'FTOCC - Fever',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'ftocc-travel',
            label: 'FTOCC - Travel',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'ftocc-occupation',
            label: 'FTOCC - Occupation',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'ftocc-clustering',
            label: 'FTOCC - Clustering',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'ftocc-contact',
            label: 'FTOCC - Contact',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'ftocc-remarks',
            label: 'FTOCC Remarks',
            type: 'textarea',
            value: '',
            dataSource: 'manual'
          },
          // Morse Fall Scale
          {
            id: 'morse-fall-risk',
            label: 'Morse Fall Scale Risk',
            type: 'select',
            value: '',
            options: ['At risk', 'Not at risk'],
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
          },
          {
            id: 'morse-total-score',
            label: 'Morse Fall Scale Total Score',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'morse-remarks',
            label: 'Morse Fall Scale Remarks',
            type: 'textarea',
            value: '',
            dataSource: 'manual'
          },
          // Norton Scale
          {
            id: 'norton-pressure-risk',
            label: 'Norton Scale Pressure Injury Risk',
            type: 'select',
            value: '',
            options: ['At risk', 'Not at risk'],
            dataSource: 'manual'
          },
          {
            id: 'norton-physical',
            label: 'Norton Scale - Physical Condition',
            type: 'select',
            value: '',
            options: ['4 - Good', '3 - Fair', '2 - Poor', '1 - Very bad'],
            dataSource: 'manual'
          },
          {
            id: 'norton-mental',
            label: 'Norton Scale - Mental Condition',
            type: 'select',
            value: '',
            options: ['4 - Alert', '3 - Apathetic', '2 - Confused', '1 - Stupor'],
            dataSource: 'manual'
          },
          {
            id: 'norton-activity',
            label: 'Norton Scale - Activity',
            type: 'select',
            value: '',
            options: ['4 - Ambulant', '3 - Walk with help', '2 - Chair bound', '1 - Bed'],
            dataSource: 'manual'
          },
          {
            id: 'norton-mobility',
            label: 'Norton Scale - Mobility',
            type: 'select',
            value: '',
            options: ['4 - Full', '3 - Slightly limited', '2 - Very limited', '1 - Immobile'],
            dataSource: 'manual'
          },
          {
            id: 'norton-incontinence',
            label: 'Norton Scale - Incontinence',
            type: 'select',
            value: '',
            options: ['4 - Not', '3 - Occasionally', '2 - Usually / Urine', '1 - Doubly'],
            dataSource: 'manual'
          },
          {
            id: 'norton-total-score',
            label: 'Norton Scale Total Score',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          // Braden Scale
          {
            id: 'braden-pressure-risk',
            label: 'Braden Scale Pressure Injury Risk',
            type: 'select',
            value: '',
            options: ['At risk', 'Not at risk'],
            dataSource: 'manual'
          },
          {
            id: 'braden-sensory',
            label: 'Braden Scale - Sensory Perception',
            type: 'select',
            value: '',
            options: ['4 - No impairment', '3 - Slightly limited', '2 - Very limited', '1 - Completely limited'],
            dataSource: 'manual'
          },
          {
            id: 'braden-moisture',
            label: 'Braden Scale - Moisture',
            type: 'select',
            value: '',
            options: ['4 - Rarely moist', '3 - Occasionally moist', '2 - Very moist', '1 - Constantly moist'],
            dataSource: 'manual'
          },
          {
            id: 'braden-activity',
            label: 'Braden Scale - Activity',
            type: 'select',
            value: '',
            options: ['4 - Walks frequently', '3 - Walks occasionally', '2 - Chairfast', '1 - Bedfast'],
            dataSource: 'manual'
          },
          {
            id: 'braden-mobility',
            label: 'Braden Scale - Mobility',
            type: 'select',
            value: '',
            options: ['4 - No limitations', '3 - Slightly limited', '2 - Very limited', '1 - Completely immobile'],
            dataSource: 'manual'
          },
          {
            id: 'braden-nutrition',
            label: 'Braden Scale - Nutrition',
            type: 'select',
            value: '',
            options: ['4 - Excellent', '3 - Adequate', '2 - Probably inadequate', '1 - Very Poor'],
            dataSource: 'manual'
          },
          {
            id: 'braden-friction',
            label: 'Braden Scale - Friction & Shear',
            type: 'select',
            value: '',
            options: ['3 - No apparent problem', '2 - Potential problem', '1 - Problem'],
            dataSource: 'manual'
          },
          {
            id: 'braden-total-score',
            label: 'Braden Scale Total Score',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          // Other Risks
          {
            id: 'missing-risk',
            label: 'Missing Risk',
            type: 'select',
            value: '',
            options: ['At risk', 'Not at risk'],
            dataSource: 'manual'
          },
          {
            id: 'suicide-admission',
            label: 'Patient admitted due to suicidal attempt/idea',
            type: 'select',
            value: '',
            options: ['Yes', 'No'],
            dataSource: 'manual'
          },
          {
            id: 'suicide-expression',
            label: 'Patient expresses suicidal idea/self-harm',
            type: 'select',
            value: '',
            options: ['Yes', 'No'],
            dataSource: 'manual'
          },
          {
            id: 'suicide-disclosure',
            label: 'Relatives/friends disclose suicidal inclination',
            type: 'select',
            value: '',
            options: ['Yes', 'No', 'Not applicable'],
            dataSource: 'manual'
          }
        ];

      case 'functional':
        return [
          // Communication
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
            id: 'hearing-left-aid',
            label: 'Hearing Aid (Left Ear)',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'hearing-right',
            label: 'Hearing (Right Ear)',
            type: 'select',
            value: '',
            options: ['Normal', 'Impaired', 'Deaf'],
            dataSource: 'manual'
          },
          {
            id: 'hearing-right-aid',
            label: 'Hearing Aid (Right Ear)',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'denture-lower',
            label: 'Denture (Lower Jaw)',
            type: 'select',
            value: '',
            options: ['Nil', 'Fixed', 'Removable'],
            dataSource: 'manual'
          },
          {
            id: 'denture-upper',
            label: 'Denture (Upper Jaw)',
            type: 'select',
            value: '',
            options: ['Nil', 'Fixed', 'Removable'],
            dataSource: 'manual'
          },
          {
            id: 'communication-remarks',
            label: 'Communication Remarks',
            type: 'textarea',
            value: '',
            dataSource: 'manual'
          },
          // Respiration
          {
            id: 'respiration-status',
            label: 'Respiration Status',
            type: 'select',
            value: '',
            options: ['Normal', 'Dyspnoea'],
            dataSource: 'manual'
          },
          {
            id: 'spo2-peripheral',
            label: 'Saturation of Peripheral Oxygen (%)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'respiration-remarks',
            label: 'Respiration Remarks',
            type: 'textarea',
            value: '',
            dataSource: 'manual'
          },
          // Mobility
          {
            id: 'mobility-status',
            label: 'Mobility Status',
            type: 'select',
            value: '',
            options: ['Independent', 'Ambulatory with aids', 'Dependent'],
            dataSource: 'manual'
          },
          {
            id: 'left-upper-limb-weakness',
            label: 'Left Upper Limb - Weakness',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'left-upper-limb-paralysis',
            label: 'Left Upper Limb - Paralysis',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'left-upper-limb-contracture',
            label: 'Left Upper Limb - Contracture',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'left-upper-limb-rigid',
            label: 'Left Upper Limb - Rigid',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'right-upper-limb-weakness',
            label: 'Right Upper Limb - Weakness',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'right-upper-limb-paralysis',
            label: 'Right Upper Limb - Paralysis',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'right-upper-limb-contracture',
            label: 'Right Upper Limb - Contracture',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'right-upper-limb-rigid',
            label: 'Right Upper Limb - Rigid',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'left-lower-limb-weakness',
            label: 'Left Lower Limb - Weakness',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'left-lower-limb-paralysis',
            label: 'Left Lower Limb - Paralysis',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'left-lower-limb-contracture',
            label: 'Left Lower Limb - Contracture',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'left-lower-limb-rigid',
            label: 'Left Lower Limb - Rigid',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'right-lower-limb-weakness',
            label: 'Right Lower Limb - Weakness',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'right-lower-limb-paralysis',
            label: 'Right Lower Limb - Paralysis',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'right-lower-limb-contracture',
            label: 'Right Lower Limb - Contracture',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'right-lower-limb-rigid',
            label: 'Right Lower Limb - Rigid',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          // Walking Aids
          {
            id: 'walking-aid-stick',
            label: 'Walking Aid - Stick',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'walking-aid-quadripod',
            label: 'Walking Aid - Quadripod',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'walking-aid-tripod',
            label: 'Walking Aid - Tripod',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'walking-aid-frame',
            label: 'Walking Aid - Frame',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'walking-aid-wheelchair',
            label: 'Walking Aid - Wheelchair',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'walking-aid-crutch',
            label: 'Walking Aid - Crutch',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'walking-aid-rollator',
            label: 'Walking Aid - Rollator',
            type: 'checkbox',
            value: false,
            dataSource: 'manual'
          },
          {
            id: 'assisted-by-persons',
            label: 'Assisted by (number of persons)',
            type: 'number',
            value: '',
            dataSource: 'manual'
          },
          {
            id: 'mobility-others',
            label: 'Mobility - Others',
            type: 'textarea',
            value: '',
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

  const submitAssessment = async (navigate?: (path: string) => void) => {
    if (!assessmentId) return;

    try {
      const { error } = await supabase.functions.invoke('submit-assessment', {
        body: { assessmentId }
      });

      if (error) throw error;

      toast({
        title: "Assessment Submitted", 
        description: "Assessment successfully submitted to History system. Redirecting to patient list...",
      });

      // Redirect to patient list after successful submission
      if (navigate) {
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }

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
    isProcessingAudio,
    lastTranscript,
    handleRecordingStart,
    handleRecordingStop,
    handleFieldChange,
    getFormFields,
    submitAssessment,
    assessmentId
  };
}
