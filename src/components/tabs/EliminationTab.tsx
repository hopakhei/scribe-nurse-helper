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
          id: 'urinary_normal',
          label: 'Normal',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_frequent',
          label: 'Frequent',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_dysuria',
          label: 'Dysuria',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_incontinence',
          label: 'Incontinence',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_retention',
          label: 'Urinary retention',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_anuria',
          label: 'Anuria',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_oliguria',
          label: 'Oliguria',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_others',
          label: 'Others',
          type: 'text',
          dataSource: 'manual'
        },
        // Aids section
        {
          id: 'urinary_commode',
          label: 'Commode',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_diaper',
          label: 'Diaper',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_bedpan',
          label: 'Bedpan / Urinal',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_incontinence_diaper',
          label: 'Incontinence diaper',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_nephrostomy',
          label: 'Percutaneous nephrostomy tube',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_ileal_conduit',
          label: 'Ileal conduit',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_aids_others',
          label: 'Others (aids)',
          type: 'text',
          dataSource: 'manual'
        },
        // Urinary Catheter Section
        {
          id: 'urinary_catheter',
          label: 'Urinary catheter',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'urinary_catheter_site',
          label: 'Site',
          type: 'select',
          options: ['Urethral', 'Suprapubic'],
          dataSource: 'manual',
          displayCondition: 'urinary_catheter === true'
        },
        {
          id: 'urinary_catheter_size',
          label: 'Size',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'urinary_catheter === true'
        },
        {
          id: 'urinary_catheter_type',
          label: 'Type',
          type: 'select',
          options: ['Latex', 'Silicone'],
          dataSource: 'manual',
          displayCondition: 'urinary_catheter === true'
        },
        {
          id: 'urinary_catheter_renewal_date',
          label: 'Date of last renewal',
          type: 'datepicker',
          dataSource: 'manual',
          displayCondition: 'urinary_catheter === true'
        },
        {
          id: 'urinary_catheter_change_days',
          label: 'Change every (day(s))',
          type: 'number',
          dataSource: 'manual',
          displayCondition: 'urinary_catheter === true'
        },
        // Intermittent Catheterization Section
        {
          id: 'intermittent_catheterization',
          label: 'Intermittent catheterization',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'intermittent_catheter_size',
          label: 'Size',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'intermittent_catheterization === true'
        },
        {
          id: 'self_catheterization',
          label: 'Self catheterization',
          type: 'checkbox',
          dataSource: 'manual',
          displayCondition: 'intermittent_catheterization === true'
        },
        {
          id: 'catheterization_times_per_day',
          label: 'Perform (time(s)/day)',
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
          id: 'bowel_normal',
          label: 'Normal',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'bowel_constipation',
          label: 'Constipation',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'bowel_diarrhoea',
          label: 'Diarrhoea',
          type: 'checkbox',
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
          id: 'bowel_stoma',
          label: 'Stoma',
          type: 'checkbox',
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