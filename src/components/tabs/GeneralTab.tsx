import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import { RefreshButton } from "@/components/RefreshButton";
import type { FormCard } from "@/components/EnhancedFormSection";

interface GeneralTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
  assessmentId?: string;
  patientId?: string;
}

export function GeneralTab({ onFieldChange, fieldValues, assessmentId, patientId }: GeneralTabProps) {
  const cards: FormCard[] = [
    {
      id: 'emergency-contact-1',
      title: 'Emergency Contact 1',
      fields: [
        {
          id: 'emergency_contact_1_name',
          label: 'Full Name',
          type: 'text',
          dataSource: 'manual'
        },
        {
          id: 'emergency_contact_1_relationship',
          label: 'Relationship',
          type: 'text',
          dataSource: 'manual'
        },
        {
          id: 'emergency_contact_1_phone',
          label: 'Phone Number',
          type: 'text',
          dataSource: 'manual'
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">General Information</h2>
          <p className="text-muted-foreground text-sm">Basic patient information and emergency contacts</p>
        </div>
        {assessmentId && patientId && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">External data:</span>
            <RefreshButton assessmentId={assessmentId} patientId={patientId} />
          </div>
        )}
      </div>
      <EnhancedFormSection
        title=""
        cards={cards}
        layout="single"
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}