import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import type { FormCard } from "@/components/EnhancedFormSection";

interface EliminationTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function EliminationTab({ onFieldChange, fieldValues }: EliminationTabProps) {
  const cards: FormCard[] = [
    {
      id: 'urinary',
      title: 'Elimination - Urinary',
      fields: [
        { id: 'urinary_status', label: 'Status', type: 'checkbox', options: ['Normal', 'Frequent', 'Dysuria', 'Incontinence', 'Urinary retention', 'Anuria', 'Oliguria'], dataSource: 'manual' },
        { id: 'urinary_aids', label: 'Aids', type: 'checkbox', options: ['Commode', 'Diaper', 'Bedpan / Urinal', 'Urinary catheter', 'Intermittent catheterization'], dataSource: 'manual' },
        {
          id: 'urinary_catheter_site',
          label: 'Catheter Site',
          type: 'radio',
          options: ['Urethral', 'Suprapubic'],
          dataSource: 'manual',
          displayCondition: { fieldId: 'urinary_aids', includes: 'Urinary catheter' }
        },
        {
          id: 'urinary_catheter_size',
          label: 'Catheter Size',
          type: 'text',
          dataSource: 'manual',
          displayCondition: { fieldId: 'urinary_aids', includes: 'Urinary catheter' }
        },
        {
          id: 'urinary_catheter_type',
          label: 'Catheter Type',
          type: 'radio',
          options: ['Latex', 'Silicone'],
          dataSource: 'manual',
          displayCondition: { fieldId: 'urinary_aids', includes: 'Urinary catheter' }
        },
        {
          id: 'urinary_catheter_renewal_date',
          label: 'Date of Last Renewal',
          type: 'datepicker',
          dataSource: 'manual',
          displayCondition: { fieldId: 'urinary_aids', includes: 'Urinary catheter' }
        },
      ]
    },
    {
      id: 'bowel',
      title: 'Elimination - Bowel',
      fields: [
        { id: 'bowel_status', label: 'Status', type: 'checkbox', options: ['Normal', 'Incontinence', 'Constipation', 'Diarrhoea'], dataSource: 'manual' },
        { id: 'bowel_aids', label: 'Aids', type: 'checkbox', options: ['Stoma'], dataSource: 'manual' },
        { id: 'bowel_others', label: 'Others', type: 'textarea', dataSource: 'manual' },
      ]
    }
  ];

  return (
    <TabsContent value="elimination" className="mt-0">
      <EnhancedFormSection
        title="Elimination Assessment"
        description="Patient's urinary and bowel function."
        cards={cards}
        layout="double" // Use a two-column layout
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}