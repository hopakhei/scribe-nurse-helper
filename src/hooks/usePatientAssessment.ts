
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from './useAuth';
import { toast } from 'sonner';

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

  // Load patient data
  useEffect(() => {
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  // Create or load assessment
  useEffect(() => {
    if (patientId && user) {
      createOrLoadAssessment();
    }
  }, [patientId, user]);

  // Load existing field values when assessment is ready
  useEffect(() => {
    if (assessmentId) {
      loadFieldValues();
      
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

  // Also load field values when component mounts and assessment is available
  useEffect(() => {
    if (assessmentId && Object.keys(fieldValues).length === 0) {
      setTimeout(() => loadFieldValues(), 1000); // Small delay to ensure data is ready
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
    if (!patientId || !user) return;

    try {
      // Try to find existing assessment for today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingAssessment, error: searchError } = await supabase
        .from('patient_assessments')
        .select('id')
        .eq('patient_id', patientId)
        .eq('user_id', user.id)
        .eq('assessment_date', today)
        .eq('status', 'in_progress')
        .maybeSingle();

      if (searchError) {
        console.error('Error searching for assessment:', searchError);
      }

      if (existingAssessment) {
        setAssessmentId(existingAssessment.id);
      } else {
        // Create new assessment
        const { data: newAssessment, error: createError } = await supabase
          .from('patient_assessments')
          .insert({
            patient_id: patientId,
            user_id: user.id
          })
          .select()
          .single();

        if (createError) throw createError;
        setAssessmentId(newAssessment.id);
      }
    } catch (error: any) {
      console.error('Error creating/loading assessment:', error);
      toast.error('Failed to initialize assessment');
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
        const { error } = await supabase
          .from('form_field_values')
          .upsert({
            assessment_id: assessmentId,
            field_id: fieldId,
            field_label: fieldId, // Use field_id as label fallback
            section_id: 'general', // Default section
            value: value,
            data_source: 'manual'
          });

        if (error) throw error;
        console.log(`Updated field ${fieldId} with value:`, value);
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
      toast.success('Audio processed successfully');
      
      // Field values will be updated automatically via real-time subscription
      
    } catch (error: any) {
      console.error('Error processing transcript:', error);
      toast.error('Failed to process audio transcript');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const submitAssessment = async (navigate: any) => {
    if (!assessmentId) return;

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

      setRiskScores(prev => ({
        ...prev,
        morseScore
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
    sections: [], // Add if needed
    currentSection: '', // Add if needed
    setCurrentSection: () => {}, // Add if needed
    getFormFields: () => [] // Add if needed
  };
};
