import { TabsContent } from "@/components/ui/tabs";
import { Tabs, TabsList, TabsTrigger, TabsContent as InnerTabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
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
      iv_heparin: fieldValues.morse_iv_heparin === 'Yes' ? 20 : 0,
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

  const cards: FormCard[] = [
    {
      id: 'infection-isolation',
      title: 'Infection & Isolation',
      fields: [
        {
          id: 'infection_risk_status',
          label: 'Infection Risk Status',
          type: 'radio',
          options: ['At risk', 'Not at risk', 'Unknown'],
          dataSource: 'manual'
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
      id: 'suicide-risk',
      title: 'Suicide Risk Assessment',
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
      id: 'fall-risk',
      title: 'Fall Risk Assessment',
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
      id: 'pressure-injury-risk',
      title: 'Pressure Injury Risk',
      fields: [
        {
          id: 'pressure_injury_tabs',
          label: 'Risk Assessment Scale',
          type: 'inline-group',
          dataSource: 'manual',
          inlineFields: [] // This will be handled with custom rendering
        }
      ]
    },
    {
      id: 'missing-risk',
      title: 'Missing Risk',
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

  // Custom pressure injury risk component
  const PressureInjuryRiskTabs = () => (
    <Tabs defaultValue="norton" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="norton">Norton Scale</TabsTrigger>
        <TabsTrigger value="braden">Braden Scale</TabsTrigger>
      </TabsList>
      
      <InnerTabsContent value="norton" className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Physical Condition</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              value={fieldValues.norton_physical || ''}
              onChange={(e) => onFieldChange('norton_physical', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="4">Good (4)</option>
              <option value="3">Fair (3)</option>
              <option value="2">Poor (2)</option>
              <option value="1">Very bad (1)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Mental Condition</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              value={fieldValues.norton_mental || ''}
              onChange={(e) => onFieldChange('norton_mental', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="4">Alert (4)</option>
              <option value="3">Apathetic (3)</option>
              <option value="2">Confused (2)</option>
              <option value="1">Stuporous (1)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Activity</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              value={fieldValues.norton_activity || ''}
              onChange={(e) => onFieldChange('norton_activity', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="4">Ambulant (4)</option>
              <option value="3">Walk with help (3)</option>
              <option value="2">Chairfast (2)</option>
              <option value="1">Bedfast (1)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Mobility</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              value={fieldValues.norton_mobility || ''}
              onChange={(e) => onFieldChange('norton_mobility', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="4">Full (4)</option>
              <option value="3">Slightly limited (3)</option>
              <option value="2">Very limited (2)</option>
              <option value="1">Immobile (1)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Incontinent</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              value={fieldValues.norton_incontinent || ''}
              onChange={(e) => onFieldChange('norton_incontinent', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="4">Not (4)</option>
              <option value="3">Occasionally (3)</option>
              <option value="2">Usually (2)</option>
              <option value="1">Doubly (1)</option>
            </select>
          </div>
          <div className="pt-2 border-t">
            <span className="text-sm font-medium">Total Score: </span>
            <Badge variant="secondary">
              {(parseInt(fieldValues.norton_physical || '0') + 
                parseInt(fieldValues.norton_mental || '0') + 
                parseInt(fieldValues.norton_activity || '0') + 
                parseInt(fieldValues.norton_mobility || '0') + 
                parseInt(fieldValues.norton_incontinent || '0'))} /20
            </Badge>
          </div>
        </div>
      </InnerTabsContent>
      
      <InnerTabsContent value="braden" className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Sensory Perception</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              value={fieldValues.braden_sensory || ''}
              onChange={(e) => onFieldChange('braden_sensory', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="1">Completely limited (1)</option>
              <option value="2">Very limited (2)</option>
              <option value="3">Slightly limited (3)</option>
              <option value="4">No impairment (4)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Moisture</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              value={fieldValues.braden_moisture || ''}
              onChange={(e) => onFieldChange('braden_moisture', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="1">Constantly moist (1)</option>
              <option value="2">Very moist (2)</option>
              <option value="3">Occasionally moist (3)</option>
              <option value="4">Rarely moist (4)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Activity</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              value={fieldValues.braden_activity || ''}
              onChange={(e) => onFieldChange('braden_activity', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="1">Bedfast (1)</option>
              <option value="2">Chairfast (2)</option>
              <option value="3">Walks occasionally (3)</option>
              <option value="4">Walks frequently (4)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Mobility</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              value={fieldValues.braden_mobility || ''}
              onChange={(e) => onFieldChange('braden_mobility', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="1">Completely immobile (1)</option>
              <option value="2">Very limited (2)</option>
              <option value="3">Slightly limited (3)</option>
              <option value="4">No limitation (4)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Nutrition</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              value={fieldValues.braden_nutrition || ''}
              onChange={(e) => onFieldChange('braden_nutrition', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="1">Very Poor (1)</option>
              <option value="2">Probably inadequate (2)</option>
              <option value="3">Adequate (3)</option>
              <option value="4">Excellent (4)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Friction & Shear</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              value={fieldValues.braden_friction || ''}
              onChange={(e) => onFieldChange('braden_friction', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="1">Problem (1)</option>
              <option value="2">Potential problem (2)</option>
              <option value="3">No apparent problem (3)</option>
            </select>
          </div>
          <div className="pt-2 border-t">
            <span className="text-sm font-medium">Total Score: </span>
            <Badge variant="secondary">
              {(parseInt(fieldValues.braden_sensory || '0') + 
                parseInt(fieldValues.braden_moisture || '0') + 
                parseInt(fieldValues.braden_activity || '0') + 
                parseInt(fieldValues.braden_mobility || '0') + 
                parseInt(fieldValues.braden_nutrition || '0') + 
                parseInt(fieldValues.braden_friction || '0'))} /23
            </Badge>
          </div>
        </div>
      </InnerTabsContent>
    </Tabs>
  );

  return (
    <TabsContent value="risk" className="mt-0">
      <EnhancedFormSection
        title="Risk Assessment"
        description="Comprehensive risk evaluation including infection, suicide, fall, and pressure injury risks"
        cards={cards}
        layout="two-column"
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
      
      {/* Custom Pressure Injury Risk Section */}
      <div className="mt-6">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Pressure Injury Risk Assessment</h3>
          <PressureInjuryRiskTabs />
        </div>
      </div>
      
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
    </TabsContent>
  );
}