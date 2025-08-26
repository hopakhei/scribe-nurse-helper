import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import type { FormCard } from "@/components/EnhancedFormSection";

interface NutritionSelfCareTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function NutritionSelfCareTab({ onFieldChange, fieldValues }: NutritionSelfCareTabProps) {
  const cards: FormCard[] = [
    {
      id: 'nutrition-screening',
      title: 'Malnutrition Screening',
      fields: [
        {
          id: 'malnutrition_screening_tools',
          type: 'nested-tabs', // Custom type for the EnhancedFormSection to render tabs
          tabs: [
            {
              id: 'must',
              title: 'MUST',
              totalScoreId: 'must_total',
              maxScore: 5,
              items: [
                { id: 'must_q1', label: '1. Lost weight recently without trying?', type: 'radio', options: [{ label: 'No', value: 0 }, { label: 'Unsure', value: 2 }, { label: 'Yes', value: 1 }] },
                { id: 'must_q2', label: '2. Been eating poorly due to decreased appetite?', type: 'radio', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 1 }] },
              ]
            },
            {
              id: 'hk_chinese_must',
              title: 'HK Chinese MUST',
              totalScoreId: 'hk_chinese_must_total',
              maxScore: 6,
              items: [
                // HK Chinese MUST items would be defined here
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'diet-and-feeding',
      title: 'Diet & Feeding',
      fields: [
        { id: 'diet', label: 'Diet', type: 'select', options: ['Regular diet', 'Soft diet', 'Mince diet', 'Congee diet', 'Clear fluid diet'], dataSource: 'manual' },
        { id: 'food_preference', label: 'Food Preference', type: 'checkbox', options: ['Fish only', 'No beef', 'No pork', 'No chicken', 'Vegetarian'], dataSource: 'manual' },
        { id: 'oral_supplement', label: 'Oral Supplement', type: 'text', dataSource: 'manual' },
        { id: 'oral_feeding', label: 'Oral Feeding', type: 'radio', options: ['Self-help', 'With assistance', 'By others'], dataSource: 'manual' },
        { id: 'tube_feeding_enabled', label: 'Tube Feeding', type: 'checkbox', dataSource: 'manual' },
        {
          id: 'tube_feeding_type',
          label: 'Tube Type',
          type: 'radio',
          options: ['Nasogastric', 'PEG', 'Gastrostomy'],
          dataSource: 'manual',
          displayCondition: { fieldId: 'tube_feeding_enabled', value: true }
        },
        {
          id: 'tube_feeding_schedule',
          label: 'Schedule',
          type: 'radio',
          options: ['Intermittent', 'Continuous'],
          dataSource: 'manual',
          displayCondition: { fieldId: 'tube_feeding_enabled', value: true }
        },
      ]
    },
    {
      id: 'self-care-status',
      title: 'Self Care',
      gridColumns: 2, // Make this card span both columns
      fields: [
        { id: 'self_care', label: 'Self Care Status', type: 'radio', options: ['Independent', 'Assisted', 'Dependent'], dataSource: 'manual' },
      ]
    }
  ];

  return (
    <TabsContent value="nutrition" className="mt-0">
      <EnhancedFormSection
        title="Nutrition & Self-Care"
        description="Assessment of patient's nutritional status and ability to perform self-care."
        cards={cards}
        layout="double"
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}