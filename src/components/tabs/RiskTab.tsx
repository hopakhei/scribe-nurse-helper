import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import { Badge } from "@/components/ui/badge";
import type { FormCard } from "@/components/EnhancedFormSection";

interface RiskTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function RiskTab({ onFieldChange, fieldValues }: RiskTabProps) {
  const calculateMorseScore = () => {
    const scores = {
      history_falling: fieldValues.morse_history_falling === 'Yes' ? 25 : 0,
      secondary_diagnosis: fieldValues.morse_secondary_diagnosis === 'Yes' ? 15 : 0,
      ambulatory_aid: fieldValues.morse_ambulatory_aid === 'Furniture' ? 30 : fieldValues.morse_ambulatory_aid === 'Crutches/cane/walker' ? 15 : 0,
      iv_heparin: fieldValues.morse_iv_therapy === 'Yes' ? 20 : 0,
      gait: fieldValues.morse_gait === 'Impaired' ? 20 : fieldValues.morse_gait === 'Weak' ? 10 : 0,
      mental_status: fieldValues.morse_mental_status === 'Forgets limitations' ? 15 : 0
    };
    
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    onFieldChange('morse_total_score', total);
  };

  const getMorseRiskLevel = (score: number) => {
    if (score >= 51) return { level: 'High Risk', color: 'destructive' };
    if (score >= 25) return { level: 'Moderate Risk', color: 'secondary' };
    return { level: 'Low Risk', color: 'default' };
  };

  const getNortonRiskLevel = (score: number) => {
    if (score < 10) return { level: 'Very High Risk', color: 'destructive' };
    if (score <= 13) return { level: 'High Risk', color: 'destructive' };
    if (score <= 18) return { level: 'Medium Risk', color: 'secondary' };
    return { level: 'Low Risk', color: 'default' };
  };

  const getBradenRiskLevel = (score: number) => {
    if (score <= 9) return { level: 'Very High/Severe Risk', color: 'destructive' };
    if (score <= 12) return { level: 'High Risk', color: 'destructive' };
    if (score <= 14) return { level: 'Moderate Risk', color: 'secondary' };
    if (score <= 18) return { level: 'Mild Risk', color: 'secondary' };
    return { level: 'No Risk', color: 'default' };
  };

  const cards: FormCard[] = [
    {
      id: 'infection-isolation',
      title: 'Infection & Isolation',
      column: 'left',
      fields: [
        {
          id: 'infection_risk_status',
          label: 'Infection Risk Status',
          type: 'radio',
          options: ['At risk', 'Not at risk', 'Unknown'],
        },
        {
          id: 'clinical_criteria',
          label: 'Clinical Criteria',
          type: 'multi-select',
          options: ['Nil', 'Fever', 'Cough', 'Shortness of Breath', 'Sore throat', 'Running nose', 'Pneumonia', 'Others'],
          dataSource: 'manual'
        },
        {
          id: 'other_symptoms',
          label: 'Other Symptoms',
          type: 'multi-select',
          options: ['Vomiting', 'Diarrhea', 'Rash', 'Affected body site'],
          dataSource: 'manual'
        },
        {
          id: 'cpe_screening',
          label: 'CPE Screening - Patient has history of hospitalization (including day care/procedure in hospital) outside Hong Kong in the last 12 months?',
          type: 'radio',
          options: ['Unknown', 'No', 'Yes'],
          dataSource: 'manual',
          conditionalFields: [
            {
              id: 'cpe_country_area',
              label: 'Country/Area/City',
              type: 'text',
              dataSource: 'manual',
              showCondition: (value) => value === 'Yes'
            }
          ]
        },
        {
          id: 'vre_screening',
          label: 'VRE Screening - Patient has history of hospitalization (including day care/procedure in hospital) outside Hong Kong in the last 12 months?',
          type: 'radio',
          options: ['Unknown', 'No', 'Yes'],
          dataSource: 'manual',
          conditionalFields: [
            {
              id: 'vre_country_area',
              label: 'Country/Area/City',
              type: 'text',
              dataSource: 'manual',
              showCondition: (value) => value === 'Yes'
            }
          ]
        },
        {
          id: 'mdro_tagging',
          label: 'Patient has confirmed or contact case of MDRO Tagging at time of assessment? (Data from CMS Alert)',
          type: 'radio',
          options: ['No', 'Yes', 'Manual update'],
          dataSource: 'manual'
        },
        {
          id: 'isolation_precaution',
          label: 'Isolation Precaution',
          type: 'multi-select',
          options: ['Airborne', 'Contact', 'Droplet', 'Standard'],
          dataSource: 'manual'
        },
        {
          id: 'ftocc',
          label: 'FTOCC',
          type: 'multi-select',
          options: ['At risk', 'Fever', 'Travel', 'Occupation', 'Clustering', 'Contact'],
          dataSource: 'manual'
        },
        {
          id: 'infectious_status',
          label: 'Infectious Status',
          type: 'radio',
          options: ['Not at Risk — Apply Standard Precaution', 'At Risk or Unknown — Refer PCP-ID'],
          dataSource: 'manual'
        }
      ]
    },
    {
      id: 'pressure-injury-risk',
      title: 'Pressure Injury Risk Assessment',
      column: 'right',
      fields: [
        {
          id: 'pressure_scale_type',
          label: 'Assessment Scale',
          type: 'radio',
          options: ['Norton Scale', 'Braden Scale'],
          defaultValue: 'Norton Scale',
          dataSource: 'manual'
        },
        // Norton Scale Fields
        {
          id: 'norton_physical',
          label: 'Physical Condition',
          type: 'select',
          options: [
            { value: '4', label: 'Good (4)' },
            { value: '3', label: 'Fair (3)' },
            { value: '2', label: 'Poor (2)' },
            { value: '1', label: 'Very bad (1)' }
          ],
          dataSource: 'manual',
          displayCondition: 'pressure_scale_type == "Norton Scale"'
        },
        {
          id: 'norton_mental',
          label: 'Mental Condition', 
          type: 'select',
          options: [
            { value: '4', label: 'Alert (4)' },
            { value: '3', label: 'Apathetic (3)' },
            { value: '2', label: 'Confused (2)' },
            { value: '1', label: 'Stuporous (1)' }
          ],
          dataSource: 'manual',
          displayCondition: 'pressure_scale_type == "Norton Scale"'
        },
        {
          id: 'norton_activity',
          label: 'Activity',
          type: 'select',
          options: [
            { value: '4', label: 'Ambulant (4)' },
            { value: '3', label: 'Walk with help (3)' },
            { value: '2', label: 'Chairfast (2)' },
            { value: '1', label: 'Bedfast (1)' }
          ],
          dataSource: 'manual',
          displayCondition: 'pressure_scale_type == "Norton Scale"'
        },
        {
          id: 'norton_mobility',
          label: 'Mobility',
          type: 'select',
          options: [
            { value: '4', label: 'Full (4)' },
            { value: '3', label: 'Slightly limited (3)' },
            { value: '2', label: 'Very limited (2)' },
            { value: '1', label: 'Immobile (1)' }
          ],
          dataSource: 'manual',
          displayCondition: 'pressure_scale_type == "Norton Scale"'
        },
        {
          id: 'norton_incontinent',
          label: 'Incontinent',
          type: 'select',
          options: [
            { value: '4', label: 'Not (4)' },
            { value: '3', label: 'Occasionally (3)' },
            { value: '2', label: 'Usually (2)' },
            { value: '1', label: 'Doubly (1)' }
          ],
          dataSource: 'manual',
          displayCondition: 'pressure_scale_type == "Norton Scale"'
        },
        {
          id: 'norton_total',
          label: 'Total Score /20',
          type: 'calculated',
          calculation: (values) => {
            return (parseInt(values.norton_physical || '0') + 
                    parseInt(values.norton_mental || '0') + 
                    parseInt(values.norton_activity || '0') + 
                    parseInt(values.norton_mobility || '0') + 
                    parseInt(values.norton_incontinent || '0'));
          },
          displayCondition: 'pressure_scale_type == "Norton Scale"'
        },
        // Braden Scale Fields
        {
          id: 'braden_sensory',
          label: 'Sensory Perception',
          type: 'select',
          options: [
            { value: '1', label: 'Completely limited (1)' },
            { value: '2', label: 'Very limited (2)' },
            { value: '3', label: 'Slightly limited (3)' },
            { value: '4', label: 'No impairment (4)' }
          ],
          dataSource: 'manual',
          displayCondition: 'pressure_scale_type == "Braden Scale"'
        },
        {
          id: 'braden_moisture',
          label: 'Moisture',
          type: 'select',
          options: [
            { value: '1', label: 'Constantly moist (1)' },
            { value: '2', label: 'Very moist (2)' },
            { value: '3', label: 'Occasionally moist (3)' },
            { value: '4', label: 'Rarely moist (4)' }
          ],
          dataSource: 'manual',
          displayCondition: 'pressure_scale_type == "Braden Scale"'
        },
        {
          id: 'braden_activity',
          label: 'Activity',
          type: 'select',
          options: [
            { value: '1', label: 'Bedfast (1)' },
            { value: '2', label: 'Chairfast (2)' },
            { value: '3', label: 'Walks occasionally (3)' },
            { value: '4', label: 'Walks frequently (4)' }
          ],
          dataSource: 'manual',
          displayCondition: 'pressure_scale_type == "Braden Scale"'
        },
        {
          id: 'braden_mobility',
          label: 'Mobility',
          type: 'select',
          options: [
            { value: '1', label: 'Completely immobile (1)' },
            { value: '2', label: 'Very limited (2)' },
            { value: '3', label: 'Slightly limited (3)' },
            { value: '4', label: 'No limitation (4)' }
          ],
          dataSource: 'manual',
          displayCondition: 'pressure_scale_type == "Braden Scale"'
        },
        {
          id: 'braden_nutrition',
          label: 'Nutrition',
          type: 'select',
          options: [
            { value: '1', label: 'Very Poor (1)' },
            { value: '2', label: 'Probably inadequate (2)' },      
            { value: '3', label: 'Adequate (3)' },
            { value: '4', label: 'Excellent (4)' }
          ],
          dataSource: 'manual',
          displayCondition: 'pressure_scale_type == "Braden Scale"'
        },
        {
          id: 'braden_friction',
          label: 'Friction & Shear',
          type: 'select',
          options: [
            { value: '1', label: 'Problem (1)' },
            { value: '2', label: 'Potential problem (2)' },
            { value: '3', label: 'No apparent problem (3)' }
          ],
          dataSource: 'manual',
          displayCondition: 'pressure_scale_type == "Braden Scale"'
        },
        {
          id: 'braden_total',
          label: 'Total Score /23',
          type: 'calculated',
          calculation: (values) => {
            return (parseInt(values.braden_sensory || '0') + 
                    parseInt(values.braden_moisture || '0') + 
                    parseInt(values.braden_activity || '0') + 
                    parseInt(values.braden_mobility || '0') + 
                    parseInt(values.braden_nutrition || '0') + 
                    parseInt(values.braden_friction || '0'));
          },
          displayCondition: 'pressure_scale_type == "Braden Scale"'
        }
      ]
    },
    {
      id: 'fall-risk',
      title: 'Fall Risk Assessment',
      column: 'right',
      fields: [
        {
          id: 'fall_risk_level',
          label: 'Fall Risk Level',
          type: 'radio',
          options: ['High risk', 'Low to moderate risk'],
          dataSource: 'manual'
        },
        {
          id: 'morse_history_falling',
          label: 'History of Falling',
          type: 'radio',
          options: ['No (0)', 'Yes (25)'],
          dataSource: 'manual'
        },
        {
          id: 'morse_secondary_diagnosis',
          label: 'Secondary Diagnosis',
          type: 'radio',
          options: ['No (0)', 'Yes (15)'],
          dataSource: 'manual'
        },
        {
          id: 'morse_ambulatory_aid',
          label: 'Ambulatory Aid',
          type: 'radio',
          options: ['None/bed rest/nurse assist (0)', 'Crutches/cane/walker (15)', 'Furniture (30)'],
          dataSource: 'manual'
        },
        {
          id: 'morse_iv_therapy',
          label: 'Intravenous Therapy / Saline Lock',
          type: 'radio',
          options: ['No (0)', 'Yes (20)'],
          dataSource: 'manual'
        },
        {
          id: 'morse_gait',
          label: 'Gait',
          type: 'radio',
          options: ['Normal / Bed rest / Wheelchair (0)', 'Weak (10)', 'Impaired (20)'],
          dataSource: 'manual'
        },
        {
          id: 'morse_mental_status',
          label: 'Mental Status',
          type: 'radio',
          options: ['Oriented to own ability (0)', 'Overestimates / Forgets limitations (15)'],
          dataSource: 'manual'
        },
        {
          id: 'morse_total_score',
          label: 'Total Score /125',
          type: 'calculated',
          dataSource: 'manual',
          calculation: (values) => {
            const scores = {
              history: values.morse_history_falling?.includes('25') ? 25 : 0,
              secondary: values.morse_secondary_diagnosis?.includes('15') ? 15 : 0,
              aid: values.morse_ambulatory_aid?.includes('30') ? 30 : values.morse_ambulatory_aid?.includes('15') ? 15 : 0,
              iv: values.morse_iv_therapy?.includes('20') ? 20 : 0,
              gait: values.morse_gait?.includes('20') ? 20 : values.morse_gait?.includes('10') ? 10 : 0,
              mental: values.morse_mental_status?.includes('15') ? 15 : 0
            };
            return Object.values(scores).reduce((sum, score) => sum + score, 0);
          }
        },
        {
          id: 'fall_remarks',
          label: 'Remarks',
          type: 'textarea',
          dataSource: 'manual'
        }
      ]
    },
    {
      id: 'suicide-risk',
      title: 'Suicide Risk Assessment',
      column: 'right',
      fields: [
        {
          id: 'suicide_admitted_attempt',
          label: 'Patient was admitted because of suicidal attempt or idea',
          type: 'radio',
          options: ['Yes', 'No'],
          dataSource: 'manual'
        },
        {
          id: 'suicide_expresses_idea',
          label: 'Patient expresses suicidal idea or self-harm behaviour',
          type: 'radio',
          options: ['Yes', 'No'],
          dataSource: 'manual'
        },
        {
          id: 'suicide_disclosure_relatives',
          label: 'Disclosure by relatives / friends that patient has suicidal inclination',
          type: 'radio',
          options: ['Yes', 'No', 'Not applicable'],
          dataSource: 'manual'
        }
      ]
    },
    {
      id: 'missing-risk',
      title: 'Missing Risk',
      column: 'left',
      fields: [
        {
          id: 'missing_risk_status',
          label: 'Missing Risk Assessment',
          type: 'radio',
          options: ['At risk', 'Not at risk'],
          dataSource: 'manual'
        }
      ]
    }
  ];

  return (
    <TabsContent value="risk" className="mt-0">
      <EnhancedFormSection
        title="Risk Assessment"
        description="Comprehensive risk evaluation including infection, suicide, fall, and pressure injury risks"
        cards={cards}
        layout="double"
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
      
      {/* Fall Risk Score Display */}
      {fieldValues.morse_total_score && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Morse Fall Scale Risk Level:</span>
            <Badge variant={getMorseRiskLevel(fieldValues.morse_total_score).color as any}>
              {getMorseRiskLevel(fieldValues.morse_total_score).level}
            </Badge>
          </div>
        </div>
      )}

      {/* Norton Scale Risk Level Display */}
      {fieldValues.norton_total && fieldValues.pressure_scale_type === 'Norton Scale' && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Norton Scale Risk Level:</span>
            <Badge variant={getNortonRiskLevel(fieldValues.norton_total).color as any}>
              {getNortonRiskLevel(fieldValues.norton_total).level}
            </Badge>
          </div>
        </div>
      )}

      {/* Braden Scale Risk Level Display */}
      {fieldValues.braden_total && fieldValues.pressure_scale_type === 'Braden Scale' && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Braden Scale Risk Level:</span>
            <Badge variant={getBradenRiskLevel(fieldValues.braden_total).color as any}>
              {getBradenRiskLevel(fieldValues.braden_total).level}
            </Badge>
          </div>
        </div>
      )}
    </TabsContent>
  );
}