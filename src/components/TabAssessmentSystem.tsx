import { useState, useEffect } from "react";
import { TabNavigation } from "@/components/TabNavigation";
import { GeneralTab } from "@/components/tabs/GeneralTab";
import { PhysicalTab } from "@/components/tabs/PhysicalTab";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface TabAssessmentSystemProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
}

interface TabSection {
  id: string;
  title: string;
  completed: boolean;
  hasErrors?: boolean;
  fieldsCount?: number;
  completedFields?: number;
}

export function TabAssessmentSystem({ onFieldChange, fieldValues }: TabAssessmentSystemProps) {
  const [currentSection, setCurrentSection] = useState('general');

  const sections: TabSection[] = [
    {
      id: 'general',
      title: 'General',
      completed: false,
      fieldsCount: 7,
      completedFields: 0
    },
    {
      id: 'physical',
      title: 'Physical',
      completed: false,
      fieldsCount: 15,
      completedFields: 0
    },
    {
      id: 'social',
      title: 'Social',
      completed: false,
      fieldsCount: 12,
      completedFields: 0
    },
    {
      id: 'communication',
      title: 'Communication/Respiration/Mobility',
      completed: false,
      fieldsCount: 18,
      completedFields: 0
    },
    {
      id: 'elimination',
      title: 'Elimination',
      completed: false,
      fieldsCount: 10,
      completedFields: 0
    },
    {
      id: 'nutrition',
      title: 'Nutrition/Self-Care',
      completed: false,
      fieldsCount: 14,
      completedFields: 0
    },
    {
      id: 'skin-pain',
      title: 'Skin/Pain',
      completed: false,
      fieldsCount: 12,
      completedFields: 0
    },
    {
      id: 'emotion',
      title: 'Emotion/Remark',
      completed: false,
      fieldsCount: 3,
      completedFields: 0
    },
    {
      id: 'risk',
      title: 'Risk',
      completed: false,
      fieldsCount: 20,
      completedFields: 0
    },
    {
      id: 'photo',
      title: 'Photo',
      completed: false,
      fieldsCount: 1,
      completedFields: 0
    }
  ];

  // Update completion status based on field values
  useEffect(() => {
    // This would be enhanced to calculate actual completion
    // For now, we'll use placeholder logic
  }, [fieldValues]);

  const renderTabContent = (sectionId: string) => {
    switch (sectionId) {
      case 'general':
        return <GeneralTab onFieldChange={onFieldChange} fieldValues={fieldValues} />;
      case 'physical':
        return <PhysicalTab onFieldChange={onFieldChange} fieldValues={fieldValues} />;
      default:
        return (
          <TabsContent value={sectionId} className="mt-0">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    The {sections.find(s => s.id === sectionId)?.title} tab is being developed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        );
    }
  };

  return (
    <TabNavigation
      sections={sections}
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
    >
      {sections.map(section => renderTabContent(section.id))}
    </TabNavigation>
  );
}