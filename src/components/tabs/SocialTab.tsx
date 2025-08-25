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
          dataSource: 'manual'
        },
        {
          id: 'religion',
          label: 'Religion',
          type: 'select',
          options: ['Buddhism', 'Christianity', 'Islam', 'Hinduism', 'Taoism', 'Other', 'None'],
          dataSource: 'manual'
        },
        {
          id: 'education',
          label: 'Education',
          type: 'select',
          options: ['Primary', 'Secondary', 'Tertiary', 'University', 'Postgraduate', 'Other'],
          dataSource: 'manual'
        },
        {
          id: 'employment_status',
          label: 'Employment Status',
          type: 'select',
          options: ['Employed', 'Unemployed', 'Retired', 'Student', 'Homemaker', 'Other'],
          dataSource: 'manual'
        },
        {
          id: 'occupation',
          label: 'Occupation',
          type: 'text',
          dataSource: 'manual'
        },
        {
          id: 'financial_support',
          label: 'Financial Support',
          type: 'select',
          options: ['Self', 'Family', 'Government', 'Insurance', 'Other'],
          dataSource: 'manual'
        },
        {
          id: 'accommodation',
          label: 'Accommodation',
          type: 'select',
          options: ['Own home', 'Rental', 'Care home', 'Hostel', 'Homeless', 'Other'],
          dataSource: 'manual'
        },
        {
          id: 'nationality',
          label: 'Nationality',
          type: 'text',
          dataSource: 'manual'
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
          dataSource: 'manual'
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
          dataSource: 'manual',
          conditionalFields: [
            {
              id: 'smoking_cigarettes_per_day',
              label: 'Cigarettes per day',
              type: 'number',
              dataSource: 'manual',
              showCondition: (value) => value === 'Smoker'
            },
            {
              id: 'smoking_start_since',
              label: 'Started since (years)',
              type: 'number',
              dataSource: 'manual',
              showCondition: (value) => value === 'Smoker' || value === 'Ex-smoker'
            },
            {
              id: 'smoking_quit_since',
              label: 'Quit since (years)',
              type: 'number',
              dataSource: 'manual',
              showCondition: (value) => value === 'Ex-smoker'
            }
          ]
        },
        {
          id: 'drinking_status',
          label: 'Drinking',
          type: 'radio',
          options: ['Drinker', 'Ex-drinker', 'Non-drinker'],
          dataSource: 'manual',
          conditionalFields: [
            {
              id: 'drinking_type',
              label: 'Type of Beverage',
              type: 'select',
              options: ['Beer', 'Wine', 'Spirits', 'Mixed'],
              dataSource: 'manual',
              showCondition: (value) => value === 'Drinker'
            },
            {
              id: 'drinking_frequency',
              label: 'Frequency',
              type: 'select',
              options: ['Daily', 'Weekly', 'Monthly', 'Occasionally'],
              dataSource: 'manual',
              showCondition: (value) => value === 'Drinker'
            },
            {
              id: 'drinking_start_since',
              label: 'Started since (years)',
              type: 'number',
              dataSource: 'manual',
              showCondition: (value) => value === 'Drinker' || value === 'Ex-drinker'
            }
          ]
        },
        {
          id: 'substance_status',
          label: 'Substance Use',
          type: 'radio',
          options: ['Active user', 'Ex-user', 'Non-user'],
          dataSource: 'manual',
          conditionalFields: [
            {
              id: 'substance_type',
              label: 'Type of Substance',
              type: 'text',
              dataSource: 'manual',
              showCondition: (value) => value === 'Active user'
            },
            {
              id: 'substance_frequency',
              label: 'Frequency',
              type: 'select',
              options: ['Daily', 'Weekly', 'Monthly', 'Occasionally'],
              dataSource: 'manual',
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