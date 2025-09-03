import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
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
        { id: 'temperature', label: 'Temperature', type: 'number', subLabel: '°C', dataSource: 'manual' },
        { id: 'temp_method', label: 'Temp Method', type: 'select', options: ['Oral', 'Tympanic', 'Axilla', 'Rectal', 'Skin'], dataSource: 'manual' },
        { id: 'pulse', label: 'Pulse', type: 'number', subLabel: 'bpm', dataSource: 'manual' },
        { id: 'pulse_location', label: 'Pulse Location', type: 'select', options: ['Radial', 'Apical', 'Carotid', 'Brachial', 'Femoral', 'Popliteal', 'Dorsalis pedis', 'Other'], dataSource: 'manual' },
        { id: 'pulse_pattern', label: 'Pulse Pattern', type: 'radio', options: ['Regular', 'Irregular'], dataSource: 'manual' },
        { id: 'bp_systolic', label: 'Systolic', type: 'number', subLabel: 'mmHg', dataSource: 'manual' },
        { id: 'bp_diastolic', label: 'Diastolic', type: 'number', subLabel: 'mmHg', dataSource: 'manual' },
        { id: 'bp_position', label: 'BP Position', type: 'select', options: ['Sitting', 'Standing', 'Lying', 'Other'], dataSource: 'manual' },
        { id: 'mean_bp', label: 'Mean BP', type: 'calculated', subLabel: 'mmHg', dataSource: 'manual', calculation: (values) => { const s = Number(values.bp_systolic) || 0, d = Number(values.bp_diastolic) || 0; return s > 0 && d > 0 ? Math.round((d * 2 + s) / 3) : 0; } },
        { id: 'respiratory_rate', label: 'RR', type: 'number', subLabel: 'breaths/min', dataSource: 'manual' },
        { id: 'respiration_status', label: 'Respiration', type: 'radio', options: ['Normal', 'Dyspnoea'], dataSource: 'manual' },
        { id: 'spo2', label: 'SpO2', type: 'number', subLabel: '%', dataSource: 'manual' },
      ]
    },
    // --- CARD 4: Additional Vitals (New) ---
    {
      id: 'additional-vitals',
      title: 'Additional Vitals & Observations',
      column: 'right',
      fields: [
        { id: 'cvp', label: 'CVP', type: 'number', subLabel: 'mmHg/cmH2O', dataSource: 'manual' },
        { id: 'cvp_level', label: 'CVP Level', type: 'radio', options: ['Swing', 'Not swing'], dataSource: 'manual' },
        { id: 'pacemaker', label: 'Pacemaker', type: 'radio', options: ['Yes', 'No'], dataSource: 'manual', defaultValue: 'No' },
        { id: 'coughing', label: 'Coughing', type: 'radio', options: ['Yes', 'No'], dataSource: 'manual', defaultValue: 'No' },
        { id: 'sputum', label: 'Sputum', type: 'radio', options: ['Yes', 'No'], dataSource: 'manual', defaultValue: 'No', displayCondition: 'coughing === "Yes"' },
        { id: 'sputum_colour', label: 'Sputum Colour', type: 'select', options: ['Clear', 'White', 'Yellow', 'Green', 'Cream colour', 'Coffee/Rusty', 'Blood-stained'], dataSource: 'manual', displayCondition: 'sputum === "Yes"' },
        { id: 'oxygen_therapy', label: 'Oxygen Therapy', type: 'radio', options: ['Yes', 'No'], dataSource: 'manual', defaultValue: 'No' },
        { id: 'oxygen_flow_rate', label: 'Flow Rate (L/min)', type: 'number', dataSource: 'manual', displayCondition: 'oxygen_therapy === "Yes"' },
        { id: 'oxygen_via', label: 'Via (%)', type: 'number', dataSource: 'manual', displayCondition: 'oxygen_therapy === "Yes"' },
        { id: 'oxygen_device', label: 'Device', type: 'select', options: ['Mask', 'Cannula', 'Ventilator'], dataSource: 'manual', displayCondition: 'oxygen_therapy === "Yes"' },
      ]
    },
    // --- CARD 5: Body Measurements (Revised) ---
    {
      id: 'body-measurements',
      title: 'Body & Other Measurements',
      column: 'left',
      fields: [
        { id: 'weight', label: 'Weight (kg)', type: 'number', dataSource: 'manual' },
        { id: 'height', label: 'Height (cm)', type: 'number', dataSource: 'manual' },
        { id: 'bmi', label: 'BMI', type: 'calculated', subLabel: 'kg/m²', dataSource: 'manual', calculation: (values) => { const w = Number(values.weight) || 0, h = Number(values.height) || 0; if (w > 0 && h > 0) return (w / ((h / 100) ** 2)).toFixed(1); return 0; } },
        { id: 'weight_loss_6_months', label: '10% weight loss within 6 months prior to admission', type: 'checkbox', dataSource: 'manual' },
        { id: 'blood_glucose', label: 'Blood Glucose', type: 'number', subLabel: 'mmol/L', dataSource: 'manual' },
        { id: 'lmp', label: 'Last Menstrual Period', type: 'datepicker', dataSource: 'manual', displayCondition: 'patient_gender === "Female"' },
        { id: 'pregnancy_test', label: 'Pregnancy Test', type: 'radio', options: ['+ve', '-ve', 'Inconclusive'], dataSource: 'manual', displayCondition: 'patient_gender === "Female"' },
      ]
    },
    // --- CARD 6: Urinalysis (New) ---
    {
      id: 'urinalysis',
      title: 'Urinalysis',
      column: 'right',
      fields: [
        { id: 'urinalysis_sugar', label: 'Sugar', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'], dataSource: 'manual' },
        { id: 'urinalysis_albumin', label: 'Albumin', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'], dataSource: 'manual' },
        { id: 'urinalysis_ketone', label: 'Ketone', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'], dataSource: 'manual' },
        { id: 'urinalysis_wbc', label: 'White blood cell', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'], dataSource: 'manual' },
        { id: 'urinalysis_rbc', label: 'Red blood cell', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'], dataSource: 'manual' },
        { id: 'urinalysis_nitrite', label: 'Nitrite', type: 'select', options: ['Negative', 'Trace', '+', '++', '+++ or above'], dataSource: 'manual' },
        { id: 'urinalysis_remarks', label: 'Remarks on value', type: 'textarea', dataSource: 'manual' },
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
          dataSource: 'manual',
          calculation: (values) => {
            // Only calculate if we have the essential vital signs
            const systolic = Number(values.bp_systolic) || 0;
            const pulse = Number(values.pulse) || 0;
            const rr = Number(values.respiratory_rate) || 0;
            const temp = Number(values.temperature) || 0;
            
            // Return empty if no vital signs are entered
            if (!systolic && !pulse && !rr && !temp) {
              return '';
            }
            
            let score = 0;
            
            // Systolic Blood Pressure scoring (only if value exists)
            if (systolic > 0) {
              if (systolic <= 70) score += 3;
              else if (systolic >= 71 && systolic <= 80) score += 2;
              else if (systolic >= 81 && systolic <= 100) score += 1;
              else if (systolic >= 101 && systolic <= 199) score += 0;
              else if (systolic >= 200) score += 2;
            }
            
            // Heart/Pulse Rate scoring (only if value exists)
            if (pulse > 0) {
              if (pulse <= 40) score += 3;
              else if (pulse >= 41 && pulse <= 50) score += 2;
              else if (pulse >= 51 && pulse <= 100) score += 1;
              else if (pulse >= 101 && pulse <= 110) score += 0;
              else if (pulse >= 111 && pulse <= 129) score += 1;
              else if (pulse >= 130) score += 2;
            }
            
            // Respiratory Rate scoring (only if value exists)
            if (rr > 0) {
              if (rr <= 8) score += 3;
              else if (rr >= 9 && rr <= 14) score += 1;
              else if (rr >= 15 && rr <= 20) score += 0;
              else if (rr >= 21 && rr <= 29) score += 1;
              else if (rr >= 30) score += 2;
            }
            
            // Temperature scoring (only if value exists)
            if (temp > 0) {
              if (temp <= 35) score += 3;
              else if (temp >= 35.1 && temp <= 36) score += 2;
              else if (temp >= 36.1 && temp <= 38) score += 1;
              else if (temp >= 38.1 && temp <= 38.5) score += 0;
              else if (temp >= 38.6) score += 1;
            }
            
            // Level of Consciousness scoring
            const consciousness = values.level_of_consciousness;
            if (consciousness === 'Alert') score += 0;
            else if (consciousness === 'Response to Voice') score += 1;
            else if (consciousness === 'Response to Pain') score += 2;
            else if (consciousness === 'Unresponsive') score += 3;
            
            // GCS scoring (only if GCS values are entered)
            const gcsTotal = Number(values.gcs_total);
            if (gcsTotal > 0) {
              if (gcsTotal === 15) score += 0;
              else if (gcsTotal === 14) score += 1;
              else if (gcsTotal >= 9 && gcsTotal <= 13) score += 2;
              else if (gcsTotal <= 8) score += 3;
            }
            
            return score;
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