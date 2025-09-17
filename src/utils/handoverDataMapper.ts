// Utility to map assessment data to handover form fields
export interface HandoverData {
  // Patient Information
  patientName: string;
  hospitalNo: string;
  age: string;
  sex: string;
  ward: string;
  bed: string;
  date: string;
  time: string;

  // Contact Information
  nextOfKin: string;
  relationship: string;
  contactNumber: string;
  address: string;

  // Medical Information
  admissionDate: string;
  admissionType: string;
  currentComplaints: string;
  diagnosis: string;
  allergies: string;

  // Risk Scores
  morseScore: string;
  mstScore: string;
  nortonScore: string;
  bradenScore: string;

  // Vital Signs
  bloodPressure: string;
  pulse: string;
  temperature: string;
  oxygenSaturation: string;
  respiratoryRate: string;
  weight: string;

  // Equipment & Devices (boolean flags)
  oxygenTherapy: boolean;
  ivAccess: boolean;
  catheter: boolean;
  pacemaker: boolean;
  mobility: boolean;
  fallRisk: boolean;

  // Additional Information
  additionalNotes: string;
  preparedBy: string;
  currentDateTime: string;
}

export const mapAssessmentToHandoverData = (
  patient: any,
  fieldValues: Record<string, any>,
  riskScores: any
): HandoverData => {
  const currentDate = new Date();
  
  return {
    // Patient Information
    patientName: patient?.name || '',
    hospitalNo: patient?.hospital_no || '',
    age: patient?.age?.toString() || '',
    sex: patient?.sex === 'F' ? 'Female' : patient?.sex === 'M' ? 'Male' : patient?.sex || '',
    ward: patient?.ward || '',
    bed: patient?.bed || '',
    date: currentDate.toLocaleDateString('en-GB'),
    time: currentDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),

    // Contact Information - Extract from field values
    nextOfKin: fieldValues['emergency-contact-name'] || fieldValues['contact-person'] || '',
    relationship: fieldValues['emergency-contact-relationship'] || fieldValues['relationship'] || '',
    contactNumber: fieldValues['emergency-contact-phone'] || fieldValues['contact-number'] || '',
    address: fieldValues['address'] || fieldValues['patient-address'] || '',

    // Medical Information
    admissionDate: patient?.admission_date ? new Date(patient.admission_date).toLocaleDateString('en-GB') : '',
    admissionType: patient?.admission_type || '',
    currentComplaints: fieldValues['current-complaints'] || fieldValues['chief-complaint'] || fieldValues['presenting-complaint'] || '',
    diagnosis: fieldValues['diagnosis'] || fieldValues['medical-diagnosis'] || fieldValues['primary-diagnosis'] || '',
    allergies: fieldValues['allergies'] || fieldValues['drug-allergies'] || fieldValues['food-allergies'] || 'NKDA',

    // Risk Scores
    morseScore: riskScores?.morseScore?.toString() || '0',
    mstScore: riskScores?.mstScore?.toString() || '0',
    nortonScore: riskScores?.nortonScore?.toString() || '0',
    bradenScore: riskScores?.bradenScore?.toString() || '0',

    // Vital Signs - Extract from various possible field names
    bloodPressure: fieldValues['blood-pressure'] || fieldValues['bp'] || fieldValues['systolic-bp'] && fieldValues['diastolic-bp'] 
      ? `${fieldValues['systolic-bp']}/${fieldValues['diastolic-bp']}` : '',
    pulse: fieldValues['pulse'] || fieldValues['heart-rate'] || fieldValues['pulse-rate'] || '',
    temperature: fieldValues['temperature'] || fieldValues['temp'] || fieldValues['body-temperature'] || '',
    oxygenSaturation: fieldValues['oxygen-saturation'] || fieldValues['spo2'] || fieldValues['o2-saturation'] || '',
    respiratoryRate: fieldValues['respiratory-rate'] || fieldValues['rr'] || fieldValues['breathing-rate'] || '',
    weight: fieldValues['weight'] || fieldValues['body-weight'] || '',

    // Equipment & Devices - Convert field values to boolean
    oxygenTherapy: !!(fieldValues['oxygen-therapy'] || fieldValues['o2-therapy'] || fieldValues['supplemental-oxygen']),
    ivAccess: !!(fieldValues['iv-access'] || fieldValues['intravenous-access'] || fieldValues['iv-line']),
    catheter: !!(fieldValues['catheter'] || fieldValues['urinary-catheter'] || fieldValues['foley-catheter']),
    pacemaker: !!(fieldValues['pacemaker'] || fieldValues['cardiac-pacemaker']),
    mobility: !!(fieldValues['mobility-aid'] || fieldValues['walking-aid'] || fieldValues['ambulatory-aid']),
    fallRisk: riskScores?.morseScore >= 45 || !!(fieldValues['fall-risk'] || fieldValues['high-fall-risk']),

    // Additional Information
    additionalNotes: compileAdditionalNotes(fieldValues),
    preparedBy: fieldValues['nurse-name'] || 'System Generated',
    currentDateTime: currentDate.toLocaleString('en-GB')
  };
};

// Helper function to compile relevant notes from various fields
const compileAdditionalNotes = (fieldValues: Record<string, any>): string => {
  const noteFields = [
    'additional-notes',
    'nursing-notes',
    'special-instructions',
    'care-plan-notes',
    'discharge-notes',
    'handover-notes',
    'clinical-notes',
    'patient-concerns',
    'family-concerns',
    'social-concerns'
  ];

  const notes: string[] = [];
  
  // Collect all relevant note fields
  noteFields.forEach(field => {
    if (fieldValues[field] && typeof fieldValues[field] === 'string' && fieldValues[field].trim()) {
      notes.push(fieldValues[field].trim());
    }
  });

  // Add any relevant assessment findings
  if (fieldValues['pain-score']) {
    notes.push(`Pain Score: ${fieldValues['pain-score']}`);
  }
  
  if (fieldValues['mobility-status']) {
    notes.push(`Mobility: ${fieldValues['mobility-status']}`);
  }

  if (fieldValues['diet-type']) {
    notes.push(`Diet: ${fieldValues['diet-type']}`);
  }

  if (fieldValues['sleep-pattern']) {
    notes.push(`Sleep: ${fieldValues['sleep-pattern']}`);
  }

  // Join all notes with line breaks
  return notes.join('\n\n') || 'No additional notes available.';
};