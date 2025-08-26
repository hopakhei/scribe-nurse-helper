import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import type { FormCard } from "@/components/EnhancedFormSection";

interface CommunicationRespirationMobilityTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function CommunicationRespirationMobilityTab({ onFieldChange, fieldValues }: CommunicationRespirationMobilityTabProps) {
  const cards: FormCard[] = [
    {
      id: 'communication',
      title: 'Communication',
      fields: [
        { id: 'vision_left', label: 'Vision (Left Eye)', type: 'select', options: ['Normal', 'Cataract', 'Glaucoma', 'Blurred vision', 'Blindness', 'Other'], dataSource: 'manual' },
        { id: 'vision_right', label: 'Vision (Right Eye)', type: 'select', options: ['Normal', 'Cataract', 'Glaucoma', 'Blurred vision', 'Blindness', 'Other'], dataSource: 'manual' },
        { id: 'hearing_left', label: 'Hearing (Left Ear)', type: 'select', options: ['Normal', 'Impaired', 'Deaf'], dataSource: 'manual' },
        { id: 'hearing_left_aids', label: 'Hearing aids', type: 'checkbox', displayCondition: { fieldId: 'hearing_left', value: 'Impaired' } },
        { id: 'hearing_right', label: 'Hearing (Right Ear)', type: 'select', options: ['Normal', 'Impaired', 'Deaf'], dataSource: 'manual' },
        { id: 'hearing_right_aids', label: 'Hearing aids', type: 'checkbox', displayCondition: { fieldId: 'hearing_right', value: 'Impaired' } },
        { id: 'language_dialect', label: 'Language / Dialect', type: 'select', options: ['Cantonese', 'English', 'Mandarin', 'Other'], dataSource: 'manual' },
        { id: 'speech', label: 'Speech', type: 'select', options: ['Clear', 'Slurring', 'Dysphasia', 'Incomprehensible sounds'], dataSource: 'manual' },
        { id: 'denture_upper', label: 'Denture (Upper Jaw)', type: 'select', options: ['Nil', 'Fixed', 'Removable'], dataSource: 'manual' },
        { id: 'denture_lower', label: 'Denture (Lower Jaw)', type: 'select', options: ['Nil', 'Fixed', 'Removable'], dataSource: 'manual' },
      ]
    },
    {
      id: 'respiration',
      title: 'Respiration',
      fields: [
        { id: 'respiration_status', label: 'Respiration', type: 'radio', options: ['Normal', 'Dyspnoea'], dataSource: 'manual' },
        { id: 'respiration_remarks', label: 'Remarks', type: 'textarea', dataSource: 'manual' },
      ]
    },
    {
      id: 'mobility',
      title: 'Mobility',
      fields: [
        { id: 'mobility_status', label: 'Mobility Status', type: 'radio', options: ['Independent', 'Ambulatory with aids', 'Dependent'], dataSource: 'manual' },
        { id: 'limb_upper_left', label: 'Left Upper Limb', type: 'select', options: ['Normal', 'Weakness', 'Paralysis', 'Contracture', 'Rigid'], dataSource: 'manual' },
        { id: 'limb_upper_right', label: 'Right Upper Limb', type: 'select', options: ['Normal', 'Weakness', 'Paralysis', 'Contracture', 'Rigid'], dataSource: 'manual' },
        { id: 'limb_lower_left', label: 'Left Lower Limb', type: 'select', options: ['Normal', 'Weakness', 'Paralysis', 'Contracture', 'Rigid'], dataSource: 'manual' },
        { id: 'limb_lower_right', label: 'Right Lower Limb', type: 'select', options: ['Normal', 'Weakness', 'Paralysis', 'Contracture', 'Rigid'], dataSource: 'manual' },
        { id: 'walking_aids', label: 'Walking Aids', type: 'select', options: ['None', 'Stick', 'Quadripod', 'Frame', 'Wheelchair', 'Crutch'], dataSource: 'manual' },
        { id: 'assisted_by', label: 'Assisted by (person(s))', type: 'number', dataSource: 'manual' },
      ]
    }
  ];

  return (
    <TabsContent value="communication" className="mt-0">
      <EnhancedFormSection
        title="Communication, Respiration & Mobility"
        description="Assessment of functional status."
        cards={cards}
        layout="triple" // Use a three-column layout
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}