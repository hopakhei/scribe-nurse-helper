import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import { computeMews } from "@/utils/mews";
import type { FormCard } from "@/components/EnhancedFormSection";

interface PhysicalTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function PhysicalTab({ onFieldChange, fieldValues }: PhysicalTabProps) {
  const cards: FormCard[] = [
    // --- CARD 1: Complaint & Consciousness (Existing) ---
    {
      id: 'clinical-status',
      title: 'Complaint & Consciousness',
      column: 'left',
      fields: [
        { id: 'current_complaint', label: 'Current Complaint / Problem', type: 'textarea' },
        { id: 'level_of_consciousness', label: 'Level of Consciousness', type: 'radio', options: ['Alert', 'Response to Voice', 'Response to Pain', 'Unresponsive'] }
      ]
    },
    // --- CARD 2: GCS (Existing & Correct) ---
    {
      id: 'gcs',
      title: 'Glasgow Coma Scale (GCS)',
      column: 'left',
      fields: [
        { id: 'gcs_eye', label: 'Eye', type: 'select', options: [ { value: 4, label: 'Spontaneously (4)' }, { value: 3, label: 'To speech (3)' }, { value: 2, label: 'To pain (2)' }, { value: 1, label: 'None (1)' } ] },
        { id: 'gcs_verbal', label: 'Verbal', type: 'select', options: [ { value: 5, label: 'Oriented (5)' }, { value: 4, label: 'Confused (4)' }, { value: 3, label: 'Inappropriate words (3)' }, { value: 2, label: 'Incomprehensible sounds (2)' }, { value: 1, label: 'None (1)' } ] },
        { id: 'gcs_motor', label: 'Motor', type: 'select', options: [ { value: 6, label: 'Obeys commands (6)' }, { value: 5, label: 'Localizes to pain (5)' }, { value: 4, label: 'Flexion withdrawal (4)' }, { value: 3, label: 'Abnormal flexion (3)' }, { value: 2, label: 'Abnormal extension (2)' }, { value: 1, label: 'None (1)' } ] },
        { id: 'gcs_total', label: 'Total Score', type: 'calculated', subLabel: '/ 15', calculation: (values) => (Number(values.gcs_eye) || 0) + (Number(values.gcs_verbal) || 0) + (Number(values.gcs_motor) || 0) }
      ]
    },
    // --- CARD 3: Vital Signs (Revised & Expanded) ---
    {
      id: 'vital-signs',
      title: 'Vital Signs & Observations',
      column: 'right',
      fields: [
        { id: 'temperature', label: 'Temperature', type: 'number', subLabel: '°C', dataSource: 'evital', sourceSystem: 'eVital' },
        { id: 'temp_method', label: 'Temp Method', type: 'select', options: ['Oral', 'Tympanic', 'Axilla', 'Rectal', 'Skin'], dataSource: 'evital', sourceSystem: 'eVital' },
        { id: 'pulse', label: 'Pulse', type: 'number', subLabel: 'bpm', dataSource: 'evital', sourceSystem: 'eVital' },
        { id: 'pulse_location', label: 'Pulse Location', type: 'select', options: ['Radial', 'Apical', 'Carotid', 'Brachial', 'Femoral', 'Popliteal', 'Dorsalis pedis', 'Other'], dataSource: 'evital', sourceSystem: 'eVital' },
        { id: 'pulse_pattern', label: 'Pulse Pattern', type: 'radio', options: ['Regular', 'Irregular'], dataSource: 'evital', sourceSystem: 'eVital' },
        { id: 'bp_systolic', label: 'Systolic', type: 'number', subLabel: 'mmHg', dataSource: 'evital', sourceSystem: 'eVital' },
        { id: 'bp_diastolic', label: 'Diastolic', type: 'number', subLabel: 'mmHg', dataSource: 'evital', sourceSystem: 'eVital' },
        { id: 'bp_position', label: 'BP Position', type: 'select', options: ['Sitting', 'Standing', 'Lying', 'Other'], dataSource: 'evital', sourceSystem: 'eVital' },
        { id: 'mean_bp', label: 'Mean BP', type: 'calculated', subLabel: 'mmHg', calculation: (values) => { const s = Number(values.bp_systolic) || 0, d = Number(values.bp_diastolic) || 0; return s > 0 && d > 0 ? Math.round((d * 2 + s) / 3) : 0; } },
        { id: 'respiratory_rate', label: 'RR', type: 'number', subLabel: 'breaths/min', dataSource: 'evital', sourceSystem: 'eVital' },
        { id: 'respiration_status', label: 'Respiration', type: 'radio', options: ['Normal', 'Dyspnoea'], dataSource: 'evital', sourceSystem: 'eVital' },
        { id: 'spo2', label: 'SpO2', type: 'number', subLabel: '%', dataSource: 'evital', sourceSystem: 'eVital' },
      ]
    },
    // --- CARD 4: Additional Vitals (New) ---
    {
      id: 'additional-vitals',
      title: 'Additional Vitals & Observations',
      column: 'right',
      fields: [
        { id: 'cvp', label: 'CVP', type: 'number', subLabel: 'mmHg/cmH2O' },
        { id: 'cvp_level', label: 'CVP Level', type: 'radio', options: ['Swing', 'Not swing'] },
        { id: 'pacemaker', label: 'Pacemaker', type: 'radio', options: ['Yes', 'No'], defaultValue: 'No' },
        { id: 'coughing', label: 'Coughing', type: 'radio', options: ['Yes', 'No'], defaultValue: 'No' },
        { id: 'sputum', label: 'Sputum', type: 'radio', options: ['Yes', 'No'], defaultValue: 'No', displayCondition: 'coughing === "Yes"' },
        { id: 'sputum_colour', label: 'Sputum Colour', type: 'select', options: ['Clear', 'White', 'Yellow', 'Green', 'Cream colour', 'Coffee/Rusty', 'Blood-stained'], displayCondition: 'sputum === "Yes"' },
        { id: 'oxygen_therapy', label: 'Oxygen Therapy', type: 'radio', options: ['Yes', 'No'], defaultValue: 'No' },
        { id: 'oxygen_flow_rate', label: 'Flow Rate (L/min)', type: 'number', displayCondition: 'oxygen_therapy === "Yes"' },
        { id: 'oxygen_via', label: 'Via (%)', type: 'number', displayCondition: 'oxygen_therapy === "Yes"' },
        { id: 'oxygen_device', label: 'Device', type: 'select', options: ['Mask', 'Cannula', 'Ventilator'], displayCondition: 'oxygen_therapy === "Yes"' },
      ]
    },
    // --- CARD 5: Body Measurements (Revised) ---
    {
      id: 'body-measurements',
      title: 'Body & Other Measurements',
      column: 'left',
      fields: [
        { id: 'weight', label: 'Weight (kg)', type: 'number' },
        { id: 'height', label: 'Height (cm)', type: 'number' },
        { id: 'bmi', label: 'BMI', type: 'calculated', subLabel: 'kg/m²', calculation: (values) => { const w = Number(values.weight) || 0, h = Number(values.height) || 0; if (w > 0 && h > 0) return (w / ((h / 100) ** 2)).toFixed(1); return 0; } },
        { id: 'weight_loss_6_months', label: '10% weight loss within 6 months prior to admission', type: 'checkbox' },
        { id: 'blood_glucose', label: 'Blood Glucose', type: 'number', subLabel: 'mmol/L' },
        { id: 'lmp', label: 'Last Menstrual Period', type: 'datepicker', displayCondition: 'patient_gender === "Female"' },
        { id: 'pregnancy_test', label: 'Pregnancy Test', type: 'radio', options: ['+ve', '-ve', 'Inconclusive'], displayCondition: 'patient_gender === "Female"' },
      ]
    },
    // --- CARD 6: Urinalysis (New) ---
    {
      id: 'urinalysis',
      title: 'Urinalysis',
      column: 'left',
      fields: [
        { id: 'urinalysis_sugar', label: 'Sugar', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'] },
        { id: 'urinalysis_albumin', label: 'Albumin', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'] },
        { id: 'urinalysis_ketone', label: 'Ketone', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'] },
        { id: 'urinalysis_wbc', label: 'White blood cell', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'] },
        { id: 'urinalysis_rbc', label: 'Red blood cell', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'] },
        { id: 'urinalysis_nitrite', label: 'Nitrite', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'] },
        { id: 'urinalysis_remarks', label: 'Remarks on value', type: 'textarea' },
      ]
    },
    // --- CARD 7: MEWS (Calculated) ---
    {
      id: 'mews',
      title: 'Modified Early Warning Score (MEWS)',
      column: 'left',
      fields: [
        { 
          id: 'mews_total', 
          label: 'Total Score', 
          type: 'calculated', 
          calculation: (values) => {
            // Only calculate if we have the essential vital signs
            const systolic = Number(values.bp_systolic) || 0;
            const pulse = Number(values.pulse) || 0;
            const rr = Number(values.respiratory_rate) || 0;
            const temp = Number(values.temperature) || 0;
            
            const mewsScore = computeMews(values);
            return mewsScore !== null ? mewsScore.toString() : '';
          }
        }
      ]
    }
  ];

  return (
    <TabsContent value="physical" className="mt-0">
      <EnhancedFormSection
        title="Physical Assessment"
        description="Comprehensive physical examination and vital signs"
        cards={cards}
        layout="double" // This should now render as a two-column grid
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}