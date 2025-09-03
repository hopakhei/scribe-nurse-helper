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
      column: 'left',
      fields: [
        {
          id: 'urinary_status',
          label: 'Urinary Status',
          type: 'multi-select',
          options: ['Normal', 'Frequent', 'Dysuria', 'Incontinence', 'Urinary retention', 'Anuria', 'Oliguria', 'Others'],
          dataSource: 'manual'
        },
        {
          id: 'urinary_status_others',
          label: 'Others (specify)',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'urinary_status && urinary_status.includes("Others")'
        },
        {
          id: 'urinary_aids',
          label: 'Aids',
          type: 'multi-select',
          options: ['Commode', 'Diaper', 'Bedpan / Urinal', 'Incontinence diaper', 'Percutaneous nephrostomy tube', 'Ileal conduit', 'Others'],
          dataSource: 'manual'
        },
        {
          id: 'urinary_aids_others',
          label: 'Others (specify)',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'urinary_aids && urinary_aids.includes("Others")'
        },
        // Urinary Catheter Section
        {
          id: 'urinary_catheter_enabled',
          label: 'Urinary Catheter',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_catheter_site',
          label: 'Catheter Site',
          type: 'multi-select',
          options: ['Urethral', 'Suprapubic'],
          dataSource: 'manual',
          displayCondition: 'urinary_catheter_enabled === true'
        },
        {
          id: 'urinary_catheter_size',
          label: 'Catheter Size',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'urinary_catheter_enabled === true'
        },
        {
          id: 'urinary_catheter_type',
          label: 'Catheter Type',
          type: 'multi-select',
          options: ['Latex', 'Silicone'],
          dataSource: 'manual',
          displayCondition: 'urinary_catheter_enabled === true'
        },
        {
          id: 'urinary_catheter_renewal_date',
          label: 'Date of Last Renewal (dd/mm/yyyy)',
          type: 'datepicker',
          dataSource: 'manual',
          displayCondition: 'urinary_catheter_enabled === true'
        },
        {
          id: 'urinary_catheter_change_days',
          label: 'Change Every (days)',
          type: 'number',
          dataSource: 'manual',
          displayCondition: 'urinary_catheter_enabled === true'
        },
        // Intermittent Catheterization Section
        {
          id: 'intermittent_catheterization',
          label: 'Intermittent Catheterization',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'intermittent_catheter_size',
          label: 'Intermittent Catheter Size',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'intermittent_catheterization === true'
        },
        {
          id: 'self_catheterization',
          label: 'Self Catheterization',
          type: 'checkbox',
          dataSource: 'manual',
          displayCondition: 'intermittent_catheterization === true'
        },
        {
          id: 'catheterization_times_per_day',
          label: 'Perform (times/day)',
          type: 'number',
          dataSource: 'manual',
          displayCondition: 'intermittent_catheterization === true'
        }
      ]
    },
    {
      id: 'bowel',
      title: 'Elimination - Bowel',
      column: 'right',
      fields: [
        {
          id: 'bowel_status',
          label: 'Bowel Status',
          type: 'multi-select',
          options: ['Normal', 'Constipation', 'Diarrhoea'],
          dataSource: 'manual'
        },
        {
          id: 'bowel_incontinence',
          label: 'Incontinence',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'bowel_others',
          label: 'Others',
          type: 'text',
          dataSource: 'manual'
        },
        {
          id: 'bowel_aids',
          label: 'Aids',
          type: 'multi-select',
          options: ['Stoma'],
          dataSource: 'manual'
        }
      ]
    }
  ];

  return (
    <TabsContent value="elimination" className="mt-0">
      <EnhancedFormSection
        title="Elimination Assessment"
        description="Patient's urinary and bowel function."
        cards={cards}
        layout="two-column" // Use a two-column layout
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}