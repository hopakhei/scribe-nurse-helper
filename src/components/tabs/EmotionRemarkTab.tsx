import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import type { FormCard } from "@/components/EnhancedFormSection";

interface EmotionRemarkTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function EmotionRemarkTab({ onFieldChange, fieldValues }: EmotionRemarkTabProps) {
  const cards: FormCard[] = [
    {
      id: 'emotional-status',
      title: 'Emotional Status',
      fields: [
        { id: 'emotional_status', label: 'Status', type: 'radio', options: ['Stable', 'Depressed', 'Confused', 'Agitated', 'Others'], dataSource: 'manual' },
      ]
    },
    {
      id: 'remark',
      title: 'Remark',
      fields: [
        { id: 'general_remark', label: 'General Remarks', type: 'textarea', dataSource: 'manual' },
      ]
    }
  ];

  return (
    <TabsContent value="emotion-remark" className="mt-0">
      <EnhancedFormSection
        title="Emotion & Remarks"
        description="Patient's emotional state and any additional notes."
        cards={cards}
        layout="single"
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}