import { TabsContent } from "@/components/ui/tabs";
import { EnhancedFormSection } from "@/components/EnhancedFormSection";
import type { FormCard } from "@/components/EnhancedFormSection";

interface SocialTabProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

export function SocialTab({ onFieldChange, fieldValues }: SocialTabProps) {
  const cards: FormCard[] = [
    {
      id: 'personal-details',
      title: 'Personal Details',
      columns: 2,
      fields: [
        {
          id: 'marital_status',
          label: 'Marital Status',
          type: 'select',
          options: ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'],
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment'
        },
        {
          id: 'religion',
          label: 'Religion',
          type: 'select',
          options: ['Buddhism', 'Christianity', 'Islam', 'Hinduism', 'Taoism', 'Other', 'None'],
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment'
        },
        {
          id: 'education',
          label: 'Education',
          type: 'select',
          options: ['Primary', 'Secondary', 'Tertiary', 'University', 'Postgraduate', 'Other'],
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment'
        },
        {
          id: 'employment_status',
          label: 'Employment Status',
          type: 'select',
          options: ['Employed', 'Unemployed', 'Retired', 'Student', 'Homemaker', 'Other'],
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment'
        },
        {
          id: 'occupation',
          label: 'Occupation',
          type: 'text',
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment'
        },
        {
          id: 'financial_support',
          label: 'Financial Support',
          type: 'select',
          options: ['Self', 'Family', 'Government', 'Insurance', 'Other'],
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment'
        },
        {
          id: 'accommodation',
          label: 'Accommodation',
          type: 'select',
          options: ['Own home', 'Rental', 'Care home', 'Hostel', 'Homeless', 'Other'],
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment'
        },
        {
          id: 'nationality',
          label: 'Nationality',
          type: 'text',
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment'
        }
      ]
    },
    {
      id: 'household',
      title: 'Household Information',
      fields: [
        {
          id: 'household_members',
          label: 'Household Members',
          type: 'multi-select',
          options: ['Spouse', 'Children', 'Parents', 'Siblings', 'Other relatives', 'Non-relatives', 'Live alone'],
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment'
        }
      ]
    },
    {
      id: 'habits',
      title: 'Habits',
      description: 'Please provide information about smoking, drinking, and substance use',
      fields: [
        {
          id: 'smoking_status',
          label: 'Smoking',
          type: 'radio',
          options: ['Smoker', 'Ex-smoker', 'Non-smoker'],
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment',
          conditionalFields: [
            {
              id: 'smoking_cigarettes_per_day',
              label: 'Cigarettes per day',
              type: 'number',
              dataSource: 'previous-assessment',
              sourceSystem: 'Previous Assessment',
              showCondition: (value) => value === 'Smoker'
            },
            {
              id: 'smoking_start_since',
              label: 'Started since (years)',
              type: 'number',
              dataSource: 'previous-assessment',
              sourceSystem: 'Previous Assessment',
              showCondition: (value) => value === 'Smoker' || value === 'Ex-smoker'
            },
            {
              id: 'smoking_quit_since',
              label: 'Quit since (years)',
              type: 'number',
              dataSource: 'previous-assessment',
              sourceSystem: 'Previous Assessment',
              showCondition: (value) => value === 'Ex-smoker'
            }
          ]
        },
        {
          id: 'drinking_status',
          label: 'Drinking',
          type: 'radio',
          options: ['Drinker', 'Ex-drinker', 'Non-drinker'],
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment',
          conditionalFields: [
            {
              id: 'drinking_type',
              label: 'Type of Beverage',
              type: 'select',
              options: ['Beer', 'Wine', 'Spirits', 'Mixed'],
              dataSource: 'previous-assessment',
              sourceSystem: 'Previous Assessment',
              showCondition: (value) => value === 'Drinker'
            },
            {
              id: 'drinking_frequency',
              label: 'Frequency',
              type: 'select',
              options: ['Daily', 'Weekly', 'Monthly', 'Occasionally'],
              dataSource: 'previous-assessment',
              sourceSystem: 'Previous Assessment',
              showCondition: (value) => value === 'Drinker'
            },
            {
              id: 'drinking_start_since',
              label: 'Started since (years)',
              type: 'number',
              dataSource: 'previous-assessment',
              sourceSystem: 'Previous Assessment',
              showCondition: (value) => value === 'Drinker' || value === 'Ex-drinker'
            }
          ]
        },
        {
          id: 'substance_status',
          label: 'Substance Use',
          type: 'radio',
          options: ['Active user', 'Ex-user', 'Non-user'],
          dataSource: 'previous-assessment',
          sourceSystem: 'Previous Assessment',
          conditionalFields: [
            {
              id: 'substance_type',
              label: 'Type of Substance',
              type: 'text',
              dataSource: 'previous-assessment',
              sourceSystem: 'Previous Assessment',
              showCondition: (value) => value === 'Active user'
            },
            {
              id: 'substance_frequency',
              label: 'Frequency',
              type: 'select',
              options: ['Daily', 'Weekly', 'Monthly', 'Occasionally'],
              dataSource: 'previous-assessment',
              sourceSystem: 'Previous Assessment',
              showCondition: (value) => value === 'Active user'
            }
          ]
        }
      ]
    }
  ];

  return (
    <TabsContent value="social" className="mt-0">
      <EnhancedFormSection
        title="Social Assessment"
        description="Social circumstances, education, employment, and lifestyle habits"
        cards={cards}
        layout="two-column"
        onFieldChange={onFieldChange}
        fieldValues={fieldValues}
      />
    </TabsContent>
  );
}