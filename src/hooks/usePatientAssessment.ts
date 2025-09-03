
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from './useAuth';
import { toast } from 'sonner';
import { getFieldSection, validateSectionCompletion, isRequiredField } from '@/utils/fieldRegistry';

interface RiskScores {
  morseScore: number;
  mstScore: number;
  mewsScore: number;
}

interface FormFieldValue {
  field_id: string;
  value: string;
  data_source: string;
}

export const usePatientAssessment = (patientId?: string) => {
  const { user } = useAuthState();
  const [patient, setPatient] = useState<any>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [riskScores, setRiskScores] = useState<RiskScores>({
    morseScore: 0,
    mstScore: 0,
    mewsScore: 0
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const creatingRef = useRef(false);
  const initializedRef = useRef(false);

  // Load patient data
  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  // Create or load assessment
  useEffect(() => {
    if (!patientId || !user) return;
    if (initializedRef.current || creatingRef.current) return;
    creatingRef.current = true;
    createOrLoadAssessment()
      .catch((e) => console.error('createOrLoadAssessment error:', e))
      .finally(() => {
        creatingRef.current = false;
        initializedRef.current = true;
      });
  }, [patientId, user]);

  // Load existing field values when assessment is ready
  useEffect(() => {
    if (assessmentId) {
      // Set up real-time subscription for field value updates
      const channel = supabase
        .channel('field-value-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'form_field_values',
            filter: `assessment_id=eq.${assessmentId}`
          },
          (payload) => {
            console.log('Field value updated:', payload);
            loadFieldValues(); // Reload all field values
          }
        )
        .subscribe();

      // Load initial field values after setting up subscription
      loadFieldValues();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [assessmentId]);


  const loadPatient = async () => {
    if (!patientId) return;
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (error: any) {
      console.error('Error loading patient:', error);
      toast.error('Failed to load patient data');
    }
  };

  const createOrLoadAssessment = async () => {
    if (!patientId || !user) {
      console.log('createOrLoadAssessment: Missing patientId or user', { patientId: !!patientId, user: !!user });
      return;
    }

    console.log('createOrLoadAssessment: Starting for patient', patientId, 'user', user.id);

    try {
      // First check if there's ANY assessment for this patient and user today
      const today = new Date().toISOString().split('T')[0];
      console.log('Looking for assessments on date:', today);
      
      const { data: allAssessments, error: searchError } = await supabase
        .from('patient_assessments')
        .select('id, status, created_at')
        .eq('patient_id', patientId)
        .eq('user_id', user.id)
        .eq('assessment_date', today)
        .order('created_at', { ascending: false });

      if (searchError) {
        console.error('Error searching for assessments:', searchError);
        throw searchError;
      }

      console.log('Found assessments:', allAssessments);

      // Use the latest assessment regardless of status
      const latestAssessment = allAssessments && allAssessments.length > 0 ? allAssessments[0] : null;

      if (latestAssessment) {
        console.log('Using existing assessment:', latestAssessment.id, 'status:', latestAssessment.status);
        setAssessmentId(latestAssessment.id);
      } else {
        console.log('Creating new assessment for patient', patientId);
        // Create new assessment
        const { data: newAssessment, error: createError } = await supabase
          .from('patient_assessments')
          .insert({
            patient_id: patientId,
            user_id: user.id,
            status: 'in_progress'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating new assessment:', createError);
          throw createError;
        }
        
        console.log('Created new assessment:', newAssessment.id);
        setAssessmentId(newAssessment.id);
      }
    } catch (error: any) {
      console.error('Error in createOrLoadAssessment:', error);
      toast.error('Failed to initialize assessment: ' + error.message);
    }
  };

  const loadFieldValues = async () => {
    if (!assessmentId) {
      console.log('No assessment ID available for loading field values');
      return;
    }

    try {
      console.log('Loading field values for assessment:', assessmentId);
      const { data, error } = await supabase
        .from('form_field_values')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (error) throw error;

      // Convert array to object with field_id as key
      const values: Record<string, any> = {};
      data?.forEach((item: FormFieldValue) => {
        values[item.field_id] = item.value;
      });

      setFieldValues(values);
      console.log('Loaded field values:', values);
    } catch (error: any) {
      console.error('Error loading field values:', error);
    }
  };

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    // Update local state immediately for responsive UI
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Debounce the database update
    const timeoutId = setTimeout(async () => {
      if (!assessmentId) return;

      try {
        // Get the correct section for this field
        const sectionId = getFieldSection(fieldId);
        
        const { error } = await supabase
          .from('form_field_values')
          .upsert(
            {
              assessment_id: assessmentId,
              field_id: fieldId,
              field_label: fieldId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Convert field_id to readable label
              section_id: sectionId,
              value: value
            },
            { onConflict: 'assessment_id,field_id' }
          );

        if (error) throw error;
        console.log(`Updated field ${fieldId} in section ${sectionId} with value:`, value);
      } catch (error: any) {
        console.error('Error updating field:', error);
        toast.error('Failed to save field value');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [assessmentId]);

  const handleRecordingStart = () => {
    setIsRecording(true);
    console.log('Recording started');
  };

  const handleRecordingStop = async (audioBlob?: Blob) => {
    setIsRecording(false);
    
    if (audioBlob && assessmentId) {
      try {
        // Convert audio blob to transcript using Supabase edge function
        const formData = new FormData();
        formData.append('audio', audioBlob);
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: formData
        });
        
        if (error) throw error;
        
        const transcript = data?.transcript || '';
        setLastTranscript(transcript);
        
        if (transcript) {
          processTranscript(transcript);
        }
      } catch (error: any) {
        console.error('Error transcribing audio:', error);
      }
    }
  };

  const processTranscript = async (transcriptText: string) => {
    if (!assessmentId) return;

    setIsProcessingAudio(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-audio-transcript', {
        body: {
          assessmentId,
          transcriptText
        }
      });

      if (error) throw error;

      console.log('Transcript processed:', data);
      toast.success(`Audio processed successfully - ${data?.fieldsExtracted || 0} fields extracted`);
      
      // Force reload field values after processing to ensure immediate update
      setTimeout(() => {
        loadFieldValues();
      }, 500);
      
    } catch (error: any) {
      console.error('Error processing transcript:', error);
      toast.error('Failed to process audio transcript');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const saveDraft = async () => {
    if (!assessmentId) {
      toast.error('No assessment found to save');
      return;
    }

    try {
      // Update assessment status to in_progress (since draft is not a valid status)
      const { error } = await supabase
        .from('patient_assessments')
        .update({ 
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (error) throw error;

      toast.success('Assessment saved successfully');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  };

  const validateAssessment = () => {
    const sections = ['general', 'physical', 'social', 'risk', 'communication', 'elimination', 'nutrition', 'skin-pain', 'emotion-remark', 'photo'];
    const validationResults = sections.map(sectionId => ({
      sectionId,
      ...validateSectionCompletion(sectionId, fieldValues)
    }));

    const missingRequiredFields = validationResults
      .filter(result => !result.isValid)
      .map(result => ({
        section: result.sectionId,
        fields: result.missingFields
      }));

    return {
      isValid: missingRequiredFields.length === 0,
      missingRequiredFields,
      validationResults
    };
  };

  const submitAssessment = async (navigate: any) => {
    if (!assessmentId) {
      toast.error('No assessment found to submit');
      return;
    }

    // Validate assessment before submission
    const validation = validateAssessment();
    if (!validation.isValid) {
      const missingFieldsText = validation.missingRequiredFields
        .map(section => `${section.section}: ${section.fields.join(', ')}`)
        .join('\n');
      
      toast.error(`Please complete required fields:\n${missingFieldsText}`);
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('submit-assessment', {
        body: { assessmentId }
      });

      if (error) throw error;

      toast.success('Assessment submitted successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
    }
  };

  // Calculate risk scores based on current field values
  useEffect(() => {
    const calculateRiskScores = () => {
      // Morse Fall Scale calculation
      let morseScore = 0;
      
      if (fieldValues.morse_history_falling?.includes('25')) morseScore += 25;
      if (fieldValues.morse_secondary_diagnosis?.includes('15')) morseScore += 15;
      if (fieldValues.morse_ambulatory_aid?.includes('30')) morseScore += 30;
      else if (fieldValues.morse_ambulatory_aid?.includes('15')) morseScore += 15;
      if (fieldValues.morse_iv_heparin?.includes('20')) morseScore += 20;
      if (fieldValues.morse_gait?.includes('20')) morseScore += 20;
      else if (fieldValues.morse_gait?.includes('10')) morseScore += 10;
      if (fieldValues.morse_mental_status?.includes('15')) morseScore += 15;

      // MST Score calculation
      let mstScore = 0;
      if (fieldValues.mst_q1 === '0') mstScore += 0;
      else if (fieldValues.mst_q1 === '2') mstScore += 2;
      else if (fieldValues.mst_q1 === 'yes') {
        mstScore += parseInt(fieldValues.mst_q1_weight_amount || '0');
      }
      mstScore += parseInt(fieldValues.mst_q2 || '0');

      setRiskScores(prev => ({
        ...prev,
        morseScore,
        mstScore
      }));
    };

    calculateRiskScores();
  }, [fieldValues]);

  return {
    patient,
    assessmentId,
    fieldValues,
    riskScores,
    isRecording,
    isProcessingAudio,
    lastTranscript,
    handleRecordingStart,
    handleRecordingStop,
    handleFieldChange,
    submitAssessment,
    saveDraft,
    validateAssessment,
    sections: [], // Add if needed
    currentSection: '', // Add if needed
    setCurrentSection: () => {}, // Add if needed
    getFormFields: () => [] // Add if needed
  };
};
