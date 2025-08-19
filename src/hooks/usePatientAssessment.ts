import { useState } from 'react';

export interface Patient {
  name: string;
  hospitalNo: string;
  age: number;
  sex: string;
  admissionType: string;
  ward: string;
  admissionDate: string;
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

export function usePatientAssessment() {
  // Mock patient data (would come from EMR API)
  const [patient] = useState<Patient>({
    name: "CHAN Tai Man",
    hospitalNo: "12345678",
    age: 82,
    sex: "M",
    admissionType: "A&E",
    ward: "Medical Ward 3A",
    admissionDate: "2025-08-19"
  });

  const [sections] = useState<FormSection[]>([
    { id: 'demographics', title: 'Demographics & History', completed: false },
    { id: 'current-complaint', title: 'Current Complaint', completed: false },
    { id: 'physical-assessment', title: 'Physical Assessment', completed: false },
    { id: 'risk-assessments', title: 'Risk Assessments', completed: true },
    { id: 'psychosocial', title: 'Psychosocial Assessment', completed: false },
    { id: 'care-planning', title: 'Care Planning', completed: false },
    { id: 'medications', title: 'Medications & Allergies', completed: false }
  ]);

  const [currentSection, setCurrentSection] = useState('demographics');

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
      name: "Braden Scale",
      score: 16,
      maxScore: 23,
      level: 'low',
      description: "Pressure ulcer risk"
    },
    {
      name: "Malnutrition",
      score: 2,
      maxScore: 6,
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

  return {
    patient,
    sections,
    currentSection,
    setCurrentSection,
    riskScores,
    isRecording,
    handleRecordingStart,
    handleRecordingStop,
    handleFieldChange
  };
}