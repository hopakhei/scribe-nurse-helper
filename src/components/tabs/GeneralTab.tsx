import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import type { FormCard } from "@/components/EnhancedFormSection";

interface GeneralTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function GeneralTab({ onFieldChange, fieldValues }: GeneralTabProps) {
  const cards: FormCard[] = [
    {
      id: 'assessment-time',
      title: 'Assessment Time',
      fields: [
        {
          id: 'assessment_date',
          label: 'Date of Assessment',
          type: 'datepicker',
          dataSource: 'manual',
          required: true
        },
        {
          id: 'assessment_time',
          label: 'Time of Assessment',
          type: 'time',
          dataSource: 'manual',
          required: true
        }
      ]
    },
    {
      id: 'admission',
      title: 'Admission',
      fields: [
        {
          id: 'admission_type',
          label: 'Type of Admission',
          type: 'radio',
          options: ['A&E', 'Baby born in own hospital', 'OPD', 'Other hospital', 'Other'],
          dataSource: 'manual',
          required: true
        }
      ]
    },
    {
      id: 'emergency-contact-1',
      title: 'Emergency Contact 1',
      fields: [
        {
          id: 'emergency_contact_1_name',
          label: 'Full Name',
          type: 'text',
          dataSource: 'manual',
          required: true
        },
        {
          id: 'emergency_contact_1_relationship',
          label: 'Relationship',
          type: 'text',
          dataSource: 'manual',
          required: true
        },
        {
          id: 'emergency_contact_1_phone',
          label: 'Phone Number',
          type: 'text',
          dataSource: 'manual',
          required: true
        }
      ]
    },
    {
      id: 'emergency-contact-2',
      title: 'Emergency Contact 2',
      fields: [
        {
          id: 'emergency_contact_2_name',
          label: 'Full Name',
          type: 'text',
          dataSource: 'manual'
        },
        {
          id: 'emergency_contact_2_relationship',
          label: 'Relationship',
          type: 'text',
          dataSource: 'manual'
        },
        {
          id: 'emergency_contact_2_phone',
          label: 'Phone Number',
          type: 'text',
          dataSource: 'manual'
        }
      ]
    },
    {
      id: 'belongings',
      title: 'Bring-in Belongings',
      fields: [
        {
          id: 'belongings_description',
          label: 'Describe belongings brought by patient',
          type: 'textarea',
          dataSource: 'manual'
        }
      ]
    }
  ];

  return (
    <TabsContent value="general" className="mt-0">
      <EnhancedFormSection
        title="General Information"
        description="Basic patient information and emergency contacts"
        cards={cards}
        layout="single"
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}