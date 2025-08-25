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
          id: 'cpe_screening',
          label: 'CPE Screening',
          type: 'radio',
          options: ['Yes', 'No', 'Unknown'],
          dataSource: 'manual',
          conditionalFields: [
            {
              id: 'cpe_country',
              label: 'Country',
              type: 'text',
              dataSource: 'manual',
              showCondition: (value) => value === 'Yes'
            }
          ]
        },
        {
          id: 'vre_screening',
          label: 'VRE Screening',
          type: 'radio',
          options: ['Yes', 'No', 'Unknown'],
          dataSource: 'manual',
          conditionalFields: [
            {
              id: 'vre_country',
              label: 'Country',
              type: 'text',
              dataSource: 'manual',
              showCondition: (value) => value === 'Yes'
            }
          ]
        },
        {
          id: 'ftocc',
          label: 'FTOCC',
          type: 'multi-select',
          options: ['Fever', 'Travel', 'Occupation', 'Contact', 'Cluster'],
          dataSource: 'manual'
        },
        {
          id: 'isolation_precaution',
          label: 'Isolation Precaution',
          type: 'multi-select',
          options: ['Airborne', 'Contact', 'Droplet', 'Standard'],
          dataSource: 'manual'
        }
      ]
    },
    {
      id: 'suicide-risk',
      title: 'Suicide Risk Assessment',
      fields: [
        {
          id: 'suicide_q1',
          label: 'In the past month, have you had thoughts about suicide?',
          type: 'radio',
          options: ['Yes', 'No'],
          dataSource: 'manual'
        },
        {
          id: 'suicide_q2',
          label: 'Have you ever attempted suicide?',
          type: 'radio',
          options: ['Yes', 'No'],
          dataSource: 'manual'
        },
        {
          id: 'suicide_q3',
          label: 'Are you having thoughts of suicide right now?',
          type: 'radio',
          options: ['Yes', 'No'],
          dataSource: 'manual'
        }
      ]
    },
    {
      id: 'fall-risk',
      title: 'Fall Risk (Morse Fall Scale)',
      fields: [
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
          id: 'morse_iv_heparin',
          label: 'IV/Heparin Lock',
          type: 'radio',
          options: ['No (0)', 'Yes (20)'],
          dataSource: 'manual'
        },
        {
          id: 'morse_gait',
          label: 'Gait/Transferring',
          type: 'radio',
          options: ['Normal/bed rest/immobile (0)', 'Weak (10)', 'Impaired (20)'],
          dataSource: 'manual'
        },
        {
          id: 'morse_mental_status',
          label: 'Mental Status',
          type: 'radio',
          options: ['Oriented to own ability (0)', 'Forgets limitations (15)'],
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
              iv: values.morse_iv_heparin?.includes('20') ? 20 : 0,
              gait: values.morse_gait?.includes('20') ? 20 : values.morse_gait?.includes('10') ? 10 : 0,
              mental: values.morse_mental_status?.includes('15') ? 15 : 0
            };
            return Object.values(scores).reduce((sum, score) => sum + score, 0);
          }
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
              onChange={(e) => onFieldChange('norton_mental', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="4">Alert (4)</option>
              <option value="3">Apathetic (3)</option>
              <option value="2">Confused (2)</option>
              <option value="1">Stuporous (1)</option>
            </select>
          </div>
          <div className="pt-2 border-t">
            <span className="text-sm font-medium">Total Score: </span>
            <Badge variant="secondary">
              {(parseInt(fieldValues.norton_physical || '0') + parseInt(fieldValues.norton_mental || '0'))} /20
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
              onChange={(e) => onFieldChange('braden_sensory', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="1">Completely Limited (1)</option>
              <option value="2">Very Limited (2)</option>
              <option value="3">Slightly Limited (3)</option>
              <option value="4">No Impairment (4)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Moisture</label>
            <select 
              className="w-full mt-1 p-2 border rounded"
              onChange={(e) => onFieldChange('braden_moisture', e.target.value)}
            >
              <option value="">Select...</option>
              <option value="1">Constantly Moist (1)</option>
              <option value="2">Very Moist (2)</option>
              <option value="3">Occasionally Moist (3)</option>
              <option value="4">Rarely Moist (4)</option>
            </select>
          </div>
          <div className="pt-2 border-t">
            <span className="text-sm font-medium">Total Score: </span>
            <Badge variant="secondary">
              {(parseInt(fieldValues.braden_sensory || '0') + parseInt(fieldValues.braden_moisture || '0'))} /23
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