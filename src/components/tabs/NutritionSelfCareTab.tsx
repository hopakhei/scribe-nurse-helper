import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import { Badge } from "@/components/ui/badge";
import type { FormCard } from "@/components/EnhancedFormSection";

interface NutritionSelfCareTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function NutritionSelfCareTab({ onFieldChange, fieldValues }: NutritionSelfCareTabProps) {
  const getMstRiskLevel = (score: number) => {
    if (score >= 2) return { level: 'High Risk', color: 'destructive' };
    if (score === 1) return { level: 'Medium Risk', color: 'secondary' };
    return { level: 'Low Risk', color: 'default' };
  };

  const cards: FormCard[] = [
    {
      id: 'mst-screening',
      title: 'Malnutrition Screening Tool (MST)',
      column: 'left',
      fields: [
        {
          id: 'mst_q1',
          label: '1. Have you/the patient lost weight recently without trying?',
          type: 'radio',
          options: [
            { label: 'No (0)', value: '0' },
            { label: 'Unsure (2)', value: '2' },
            { label: 'Yes, how much (kg)?', value: 'yes' }
          ],
          dataSource: 'manual'
        },
        {
          id: 'mst_q1_weight_amount',
          label: 'Weight loss amount:',
          type: 'radio',
          options: [
            { label: '1-5 (1)', value: '1' },
            { label: '6-10 (2)', value: '2' },
            { label: '11-15 (3)', value: '3' },
            { label: '>15 (4)', value: '4' },
            { label: 'Unsure (2)', value: '2' }
          ],
          dataSource: 'manual',
          displayCondition: 'mst_q1 === "yes"'
        },
        {
          id: 'mst_q2',
          label: '2. Have you/the patient been eating poorly because of a decreased appetite?',
          type: 'radio',
          options: [
            { label: 'No (0)', value: '0' },
            { label: 'Yes (1)', value: '1' }
          ],
          dataSource: 'manual'
        },
        {
          id: 'mst_total_score',
          label: 'Total MST Score /5',
          type: 'calculated',
          calculation: (values) => {
            let q1Score = 0;
            if (values.mst_q1 === '0') q1Score = 0;
            else if (values.mst_q1 === '2') q1Score = 2;
            else if (values.mst_q1 === 'yes') {
              q1Score = parseInt(values.mst_q1_weight_amount || '0');
            }
            const q2Score = parseInt(values.mst_q2 || '0');
            return q1Score + q2Score;
          },
          dataSource: 'manual'
        }
      ]
    },
    {
      id: 'denture-assessment',
      title: 'Denture Assessment',
      column: 'left',
      fields: [
        {
          id: 'denture_upper_jaw',
          label: 'Denture (Upper jaw)',
          type: 'radio',
          options: ['Nil', 'Fixed', 'Removable'],
          dataSource: 'manual'
        },
        {
          id: 'denture_lower_jaw',
          label: 'Denture (Lower jaw)',
          type: 'radio',
          options: ['Nil', 'Fixed', 'Removable'],
          dataSource: 'manual'
        }
      ]
    },
    {
      id: 'diet-and-feeding',
      title: 'Diet & Feeding',
      column: 'right',
      fields: [
        {
          id: 'diet',
          label: 'Diet',
          type: 'select',
          options: [
            'Diet as tolerated',
            'Regular diet',
            'Soft diet',
            'Mince diet',
            'Congee diet',
            'Semi-clear fluid diet',
            'Clear fluid diet',
            'D-pureed meat soft rice diet',
            'D-puree diet'
          ],
          dataSource: 'manual'
        },
        {
          id: 'thickener_for_dysphagia',
          label: 'Thickener for dysphagia (tsp/100ml fluid)',
          type: 'text',
          dataSource: 'manual'
        },
        {
          id: 'thickener_prn',
          label: 'p.r.n.',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'food_preference',
          label: 'Food Preference',
          type: 'multi-select',
          options: ['Fish only', 'No beef', 'No pork', 'No chicken', 'Vegetarian'],
          dataSource: 'manual'
        },
        {
          id: 'food_preference_others',
          label: 'Others (food preference)',
          type: 'text',
          dataSource: 'manual'
        },
        {
          id: 'oral_supplement_milk',
          label: 'Oral Supplement - Milk',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'oral_supplement_milk_details',
          label: 'Milk details',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'oral_supplement_milk === true'
        },
        {
          id: 'oral_supplement_others',
          label: 'Oral Supplement - Others',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'oral_supplement_others_details',
          label: 'Others details',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'oral_supplement_others === true'
        },
        {
          id: 'oral_feeding',
          label: 'Oral Feeding',
          type: 'radio',
          options: ['Self-help', 'With assistance', 'By others'],
          dataSource: 'manual'
        }
      ]
    },
    {
      id: 'tube-feeding',
      title: 'Tube Feeding',
      column: 'right',
      fields: [
        {
          id: 'tube_feeding',
          label: 'Tube Feeding',
          type: 'checkbox',
          dataSource: 'manual'
        },
        {
          id: 'tube_feeding_type',
          label: 'Type',
          type: 'radio',
          options: ['Nasogastric', 'PEG', 'Gastrostomy', 'Gastro-duodenal'],
          dataSource: 'manual',
          displayCondition: 'tube_feeding === true'
        },
        {
          id: 'tube_feeding_intermittent',
          label: 'Intermittent',
          type: 'checkbox',
          dataSource: 'manual',
          displayCondition: 'tube_feeding === true'
        },
        {
          id: 'tube_feeding_feeds_per_day',
          label: 'No. of feed per day',
          type: 'number',
          dataSource: 'manual',
          displayCondition: 'tube_feeding_intermittent === true'
        },
        {
          id: 'tube_feeding_ml_per_meal',
          label: 'ml/meal',
          type: 'number',
          dataSource: 'manual',
          displayCondition: 'tube_feeding_intermittent === true'
        },
        {
          id: 'tube_feeding_time_from',
          label: 'From (time hh:mm)',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'tube_feeding_intermittent === true'
        },
        {
          id: 'tube_feeding_time_to',
          label: 'To (time hh:mm)',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'tube_feeding_intermittent === true'
        },
        {
          id: 'tube_feeding_continuous',
          label: 'Continuous',
          type: 'checkbox',
          dataSource: 'manual',
          displayCondition: 'tube_feeding === true'
        },
        {
          id: 'tube_feeding_hours_per_day',
          label: 'hr/day',
          type: 'number',
          dataSource: 'manual',
          displayCondition: 'tube_feeding_continuous === true'
        },
        {
          id: 'tube_feeding_ml_per_day',
          label: 'ml/day',
          type: 'number',
          dataSource: 'manual',
          displayCondition: 'tube_feeding_continuous === true'
        },
        {
          id: 'tube_feeding_ml_per_hour',
          label: 'ml/hr',
          type: 'number',
          dataSource: 'manual',
          displayCondition: 'tube_feeding_continuous === true'
        },
        {
          id: 'tube_feeding_type_of_feed',
          label: 'Type of feed',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'tube_feeding === true'
        },
        {
          id: 'tube_feeding_type_of_tube',
          label: 'Type of tube',
          type: 'multi-select',
          options: ['Silicone', 'PVC', 'Polyurethane'],
          dataSource: 'manual',
          displayCondition: 'tube_feeding === true'
        },
        {
          id: 'tube_feeding_size_of_tube',
          label: 'Size of tube',
          type: 'text',
          dataSource: 'manual',
          displayCondition: 'tube_feeding === true'
        },
        {
          id: 'tube_feeding_last_renewal_date',
          label: 'Date of last renewal',
          type: 'datepicker',
          dataSource: 'manual',
          displayCondition: 'tube_feeding === true'
        },
        {
          id: 'tube_feeding_change_days',
          label: 'Change every ___ day(s) + p.r.n.',
          type: 'number',
          dataSource: 'manual',
          displayCondition: 'tube_feeding === true'
        },
        {
          id: 'tube_feeding_remarks',
          label: 'Remarks',
          type: 'textarea',
          dataSource: 'manual',
          displayCondition: 'tube_feeding === true'
        }
      ]
    },
    {
      id: 'self-care',
      title: 'Self Care',
      column: 'left',
      fields: [
        {
          id: 'self_care',
          label: 'Self Care Status',
          type: 'radio',
          options: ['Independent', 'Assisted', 'Dependent'],
          dataSource: 'manual'
        }
      ]
    }
  ];

  return (
    <TabsContent value="nutrition" className="mt-0">
      <EnhancedFormSection
        title="Nutrition & Self-Care"
        description="Assessment of patient's nutritional status and ability to perform self-care."
        cards={cards}
        layout="two-column"
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
      
      {/* MST Score Display */}
      {fieldValues.mst_total_score !== undefined && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">MST Risk Level:</span>
            <Badge variant={getMstRiskLevel(fieldValues.mst_total_score).color as any}>
              {getMstRiskLevel(fieldValues.mst_total_score).level}
            </Badge>
          </div>
        </div>
      )}
    </TabsContent>
  );
}