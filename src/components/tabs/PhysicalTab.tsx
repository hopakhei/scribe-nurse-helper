import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import type { FormCard } from "@/components/EnhancedFormSection";

interface PhysicalTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function PhysicalTab({ onFieldChange, fieldValues }: PhysicalTabProps) {
  const cards: FormCard[] = [
    {
      id: 'clinical-status',
      title: 'Complaint & Consciousness',
      fields: [
        {
          id: 'current_complaint',
          label: 'Current Complaint / Problem',
          type: 'textarea',
          dataSource: 'manual',
          required: true
        },
        {
          id: 'level_of_consciousness',
          label: 'Level of Consciousness',
          type: 'radio',
          options: ['Alert', 'Response to Voice', 'Response to Pain', 'Unresponsive'],
          dataSource: 'manual',
          required: true
        }
      ]
    },
    {
      id: 'gcs',
      title: 'Glasgow Coma Scale (GCS)',
      fields: [
        {
          id: 'gcs_eye',
          label: 'Eye',
          type: 'select',
          dataSource: 'manual',
          options: [
            { value: 4, label: 'Spontaneously (4)' },
            { value: 3, label: 'To speech (3)' },
            { value: 2, label: 'To pain (2)' },
            { value: 1, label: 'None (1)' },
          ]
        },
        {
          id: 'gcs_verbal',
          label: 'Verbal',
          type: 'select',
          dataSource: 'manual',
          options: [
            { value: 5, label: 'Oriented (5)' },
            { value: 4, label: 'Confused (4)' },
            { value: 3, label: 'Inappropriate words (3)' },
            { value: 2, label: 'Incomprehensible sounds (2)' },
            { value: 1, label: 'None (1)' },
          ]
        },
        {
          id: 'gcs_motor',
          label: 'Motor',
          type: 'select',
          dataSource: 'manual',
          options: [
            { value: 6, label: 'Obeys commands (6)' },
            { value: 5, label: 'Localizes to pain (5)' },
            { value: 4, label: 'Flexion withdrawal (4)' },
            { value: 3, label: 'Abnormal flexion (3)' },
            { value: 2, label: 'Abnormal extension (2)' },
            { value: 1, label: 'None (1)' },
          ]
        },
        {
          id: 'gcs_total',
          label: 'Total Score',
          type: 'calculated',
          dataSource: 'ai-filled',
          subLabel: '/ 15',
          calculation: (values) => {
            const eye = Number(values.gcs_eye) || 0;
            const verbal = Number(values.gcs_verbal) || 0;
            const motor = Number(values.gcs_motor) || 0;
            return eye + verbal + motor;
          }
        }
      ]
    },
    {
      id: 'vital-signs',
      title: 'Vital Signs & Observations',
      fields: [
        { id: 'temperature', label: 'Temperature', type: 'number', subLabel: '°C', dataSource: 'manual', required: true },
        { id: 'pulse', label: 'Pulse', type: 'number', subLabel: 'bpm', dataSource: 'manual', required: true },
        { id: 'bp_systolic', label: 'Systolic', type: 'number', subLabel: 'mmHg', dataSource: 'manual', required: true },
        { id: 'bp_diastolic', label: 'Diastolic', type: 'number', subLabel: 'mmHg', dataSource: 'manual', required: true },
        {
          id: 'mean_bp',
          label: 'Mean BP',
          type: 'calculated',
          dataSource: 'ai-filled',
          subLabel: 'mmHg',
          calculation: (values) => {
            const systolic = Number(values.bp_systolic) || 0;
            const diastolic = Number(values.bp_diastolic) || 0;
            return systolic > 0 && diastolic > 0 ? Math.round((diastolic * 2 + systolic) / 3) : 0;
          }
        },
        { id: 'respiratory_rate', label: 'RR', type: 'number', subLabel: 'breaths/min', dataSource: 'manual', required: true },
        { id: 'spo2', label: 'SpO2', type: 'number', subLabel: '%', dataSource: 'manual', required: true },
        { id: 'oxygen_therapy', label: 'Oxygen Therapy', type: 'radio', options: ['Yes', 'No'], dataSource: 'manual', defaultValue: 'No' },
        {
            id: 'oxygen_flow_rate',
            label: 'Flow Rate (L/min)',
            type: 'number',
            dataSource: 'manual',
            displayCondition: 'oxygen_therapy === "Yes"'
        },
      ]
    },
    {
      id: 'body-measurements',
      title: 'Body & Other Measurements',
      fields: [
        { id: 'weight', label: 'Weight (kg)', type: 'number', dataSource: 'manual' },
        { id: 'height', label: 'Height (cm)', type: 'number', dataSource: 'manual' },
        {
          id: 'bmi',
          label: 'BMI',
          type: 'calculated',
          dataSource: 'ai-filled',
          subLabel: 'kg/m²',
          calculation: (values) => {
            const weight = Number(values.weight) || 0;
            const height = Number(values.height) || 0;
            if (weight > 0 && height > 0) {
              const heightInMeters = height / 100;
              return (weight / (heightInMeters * heightInMeters)).toFixed(1);
            }
            return 0;
          }
        },
        { id: 'blood_glucose', label: 'Blood Glucose', type: 'number', subLabel: 'mmol/L', dataSource: 'manual' },
      ]
    },
  ];

  return (
    <TabsContent value="physical" className="mt-0">
      <EnhancedFormSection
        title="Physical Assessment"
        description="Comprehensive physical examination and vital signs"
        cards={cards}
        layout="two-column" // Use a two-column layout
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}