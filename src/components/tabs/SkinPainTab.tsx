// src/components/tabs/SkinPainTab.tsx

import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import type { FormCard } from "@/components/EnhancedFormSection";

interface SkinPainTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function SkinPainTab({ onFieldChange, fieldValues }: SkinPainTabProps) {
  const cards: FormCard[] = [
    {
      id: 'skin-condition',
      title: 'Skin Condition & Wounds',
      fields: [
        { id: 'skin_condition_status', label: 'Skin Condition', type: 'checkbox', options: ['Intact', 'Dry', 'Fragile', 'Oedema', 'Rash'], dataSource: 'manual' },
        {
          id: 'wounds',
          label: 'Wounds',
          type: 'dynamic-group', // Custom type for adding/removing groups of fields
          addButtonLabel: '+ Add Wound',
          itemSchema: [ // Defines the fields for each wound entry
            { id: 'wound_type', label: 'Type', type: 'select', options: ['Pressure injury', 'Abrasion', 'Laceration', 'Ulcer', 'Suture wound', 'Burn'] },
            { id: 'wound_location', label: 'Location / Site', type: 'text' },
            { id: 'wound_size', label: 'Size (LxWxD, cm)', type: 'text' },
            { id: 'wound_severity', label: 'Severity', type: 'select', options: ['Shallow', 'Deep', 'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Unstageable'] },
            { id: 'wound_discharge', label: 'Discharge', type: 'radio', options: ['Nil', 'Small amount', 'Profuse'] },
            { id: 'wound_necrotic_tissue', label: 'Necrotic Tissue', type: 'radio', options: ['No', 'Yes'] },
          ]
        }
      ]
    },
    {
      id: 'pain-assessment',
      title: 'Pain Assessment',
      fields: [
        { id: 'pain_status', label: 'Pain', type: 'radio', options: ['No', 'Unassessable', 'Yes'], dataSource: 'manual', defaultValue: 'No' },
        {
          id: 'pain_severity',
          label: 'Pain Severity',
          type: 'radio',
          options: ['Low', 'Medium', 'High'],
          dataSource: 'manual',
          disabledCondition: { fieldId: 'pain_status', valueIsNot: 'Yes' }
        },
        {
          id: 'pain_location',
          label: 'Pain Location',
          type: 'checkbox',
          options: ['Whole body', 'Head', 'Chest', 'Abdomen', 'Back', 'Upper limbs', 'Lower limbs'],
          dataSource: 'manual',
          disabledCondition: { fieldId: 'pain_status', valueIsNot: 'Yes' }
        }
      ]
    }
  ];

  return (
    <TabsContent value="skin-pain" className="mt-0">
      <EnhancedFormSection
        title="Skin & Pain Assessment"
        description="Evaluation of skin integrity and patient-reported pain."
        cards={cards}
        layout="double"
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}