// src/components/tabs/PhotoTab.tsx

import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import type { FormCard } from "@/components/EnhancedFormSection";

interface PhotoTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function PhotoTab({ onFieldChange, fieldValues }: PhotoTabProps) {
  const cards: FormCard[] = [
    {
      id: 'photo-upload',
      title: 'Photo Upload',
      fields: [
        {
          id: 'patient_photos',
          label: 'Patient Photos',
          type: 'file',
          dataSource: 'manual',
          accept: 'image/*',
          multiple: true
        }
      ]
    }
  ];

  return (
    <TabsContent value="photo" className="mt-0">
      <EnhancedFormSection
        title="Patient Photos"
        description="Upload relevant photos, such as images of wounds or rashes."
        cards={cards}
        layout="single"
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}