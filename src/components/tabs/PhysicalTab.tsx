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
      id: 'complaint-consciousness',
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
          options: ['Alert', 'Confused', 'Drowsy', 'Unconscious'],
          dataSource: 'manual',
          required: true
        }
      ]
    },
    {
      id: 'glasgow-coma-scale',
      title: 'Glasgow Coma Scale (GCS)',
      fields: [
        {
          id: 'gcs_inline',
          label: 'GCS Components',
          type: 'inline-group',
          dataSource: 'manual',
          inlineFields: [
            {
              id: 'gcs_eye',
              label: 'Eye (1-4)',
              type: 'number',
              dataSource: 'manual'
            },
            {
              id: 'gcs_verbal',
              label: 'Verbal (1-5)',
              type: 'number',
              dataSource: 'manual'
            },
            {
              id: 'gcs_motor',
              label: 'Motor (1-6)',
              type: 'number',
              dataSource: 'manual'
            }
          ]
        },
        {
          id: 'gcs_total',
          label: 'Total GCS Score',
          type: 'calculated',
          dataSource: 'manual',
          calculation: (values) => {
            const eye = parseInt(values.gcs_eye) || 0;
            const verbal = parseInt(values.gcs_verbal) || 0;
            const motor = parseInt(values.gcs_motor) || 0;
            return eye + verbal + motor;
          }
        }
      ]
    },
    {
      id: 'vital-signs',
      title: 'Vital Signs & Observations',
      columns: 3,
      fields: [
        {
          id: 'temperature',
          label: 'Temperature (°C)',
          type: 'number',
          dataSource: 'manual',
          required: true
        },
        {
          id: 'pulse',
          label: 'Pulse (bpm)',
          type: 'number',
          dataSource: 'manual',
          required: true
        },
        {
          id: 'bp_systolic',
          label: 'BP Systolic',
          type: 'number',
          dataSource: 'manual',
          required: true
        },
        {
          id: 'bp_diastolic',
          label: 'BP Diastolic',
          type: 'number',
          dataSource: 'manual',
          required: true
        },
        {
          id: 'respiratory_rate',
          label: 'RR (breaths/min)',
          type: 'number',
          dataSource: 'manual',
          required: true
        },
        {
          id: 'spo2',
          label: 'SpO2 (%)',
          type: 'number',
          dataSource: 'manual',
          required: true
        },
        {
          id: 'oxygen_therapy',
          label: 'Oxygen Therapy',
          type: 'select',
          options: ['None', 'Nasal Cannula', 'Face Mask', 'Non-rebreather', 'Ventilator'],
          dataSource: 'manual',
          conditionalFields: [
            {
              id: 'oxygen_flow_rate',
              label: 'Flow Rate (L/min)',
              type: 'number',
              dataSource: 'manual',
              showCondition: (value) => value && value !== 'None'
            }
          ]
        }
      ]
    },
    {
      id: 'body-measurements',
      title: 'Body & Other Measurements',
      fields: [
        {
          id: 'body_measurements',
          label: 'Body Measurements',
          type: 'inline-group',
          dataSource: 'manual',
          inlineFields: [
            {
              id: 'weight',
              label: 'Weight (kg)',
              type: 'number',
              dataSource: 'manual'
            },
            {
              id: 'height',
              label: 'Height (cm)',
              type: 'number',
              dataSource: 'manual'
            }
          ]
        },
        {
          id: 'bmi',
          label: 'BMI',
          type: 'calculated',
          dataSource: 'manual',
          calculation: (values) => {
            const weight = parseFloat(values.weight) || 0;
            const height = parseFloat(values.height) || 0;
            if (weight > 0 && height > 0) {
              const heightInMeters = height / 100;
              return (weight / (heightInMeters * heightInMeters)).toFixed(1);
            }
            return '';
          }
        },
        {
          id: 'gender_specific',
          label: 'Gender-Specific Information',
          type: 'select',
          options: ['Not Applicable', 'Last Menstrual Period', 'Pregnancy Test'],
          dataSource: 'manual',
          conditionalFields: [
            {
              id: 'lmp_date',
              label: 'Last Menstrual Period Date',
              type: 'date',
              dataSource: 'manual',
              showCondition: (value) => value === 'Last Menstrual Period'
            },
            {
              id: 'pregnancy_test',
              label: 'Pregnancy Test Result',
              type: 'select',
              options: ['Positive', 'Negative', 'Not Done'],
              dataSource: 'manual',
              showCondition: (value) => value === 'Pregnancy Test'
            }
          ]
        }
      ]
    },
    {
      id: 'mews',
      title: 'Modified Early Warning Score (MEWS)',
      fields: [
        {
          id: 'mews_score',
          label: 'Total MEWS Score',
          type: 'number',
          dataSource: 'manual'
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
        layout="two-column"
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}