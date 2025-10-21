import { useState, useEffect, useCallback } from "react";
import { TabNavigation } from "@/components/TabNavigation";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { GeneralTab } from "@/components/tabs/GeneralTab";
import { PhysicalTab } from "@/components/tabs/PhysicalTab";
import { SocialTab } from "@/components/tabs/SocialTab";
import { RiskTab } from "@/components/tabs/RiskTab";
import { CommunicationRespirationMobilityTab } from "@/components/tabs/CommunicationRespirationMobilityTab";
import { EliminationTab } from "@/components/tabs/EliminationTab";
import { NutritionSelfCareTab } from "@/components/tabs/NutritionSelfCareTab";
import { SkinPainTab } from "@/components/tabs/SkinPainTab";
import { EmotionRemarkTab } from "@/components/tabs/EmotionRemarkTab";
import { PhotoTab } from "@/components/tabs/PhotoTab";
import { useExternalDataPopulation } from "@/hooks/useExternalDataPopulation";

interface TabAssessmentSystemProps {
  onFieldChange: (fieldId: string, value: any) => void;
  fieldValues: Record<string, any>;
  assessmentId?: string;
  patientId?: string;
}

interface TabSection {
  id: string;
  title: string;
  completed: boolean;
  hasErrors?: boolean;
  fieldsCount?: number;
  completedFields?: number;
}

export function TabAssessmentSystem({ onFieldChange, fieldValues, assessmentId, patientId }: TabAssessmentSystemProps) {
  const [currentSection, setCurrentSection] = useState('general');
  const [localFieldValues, setLocalFieldValues] = useState<Record<string, any>>({});
  const [hasAutoSynced, setHasAutoSynced] = useState(false);
  const { populateExternalData, isLoading } = useExternalDataPopulation();
  
  // Auto-sync external data when component mounts with valid IDs
  useEffect(() => {
    const autoSyncData = async () => {
      if (assessmentId && patientId && !hasAutoSynced) {
        console.log('Auto-syncing external data on assessment form entry');
        await populateExternalData(assessmentId, patientId);
        setHasAutoSynced(true);
      }
    };
    
    autoSyncData();
  }, [assessmentId, patientId, hasAutoSynced, populateExternalData]);
  
  const handleLocalFieldChange = useCallback((fieldId: string, value: any) => {
    setLocalFieldValues(prev => ({ ...prev, [fieldId]: value }));
    onFieldChange(fieldId, value);
  }, [onFieldChange]);

  const mergedFieldValues = { ...fieldValues, ...localFieldValues };


  const sections: TabSection[] = [
    { id: 'general', title: 'General', completed: false, fieldsCount: 7, completedFields: 0 },
    { id: 'physical', title: 'Physical', completed: false, fieldsCount: 15, completedFields: 0 },
    { id: 'social', title: 'Social', completed: false, fieldsCount: 12, completedFields: 0 },
    { id: 'risk', title: 'Risk', completed: false, fieldsCount: 20, completedFields: 0 },
    { id: 'communication', title: 'Communication/Respiration/Mobility', completed: false, fieldsCount: 18, completedFields: 0 },
    { id: 'elimination', title: 'Elimination', completed: false, fieldsCount: 10, completedFields: 0 },
    { id: 'nutrition', title: 'Nutrition/Self-Care', completed: false, fieldsCount: 14, completedFields: 0 },
    { id: 'skin-pain', title: 'Skin/Pain', completed: false, fieldsCount: 12, completedFields: 0 },
    { id: 'emotion-remark', title: 'Emotion/Remark', completed: false, fieldsCount: 2, completedFields: 0 },
    { id: 'photo', title: 'Photo', completed: false, fieldsCount: 1, completedFields: 0 }
  ];

  // Update completion status based on field values
  useEffect(() => {
    // Placeholder for completion logic
  }, [fieldValues]);

  const renderTabContent = (sectionId: string) => {
    switch (sectionId) {
      case 'general':
        return <GeneralTab onFieldChange={handleLocalFieldChange} fieldValues={mergedFieldValues} assessmentId={assessmentId} patientId={patientId} isLoading={isLoading} />;
      case 'physical':
        return <PhysicalTab onFieldChange={handleLocalFieldChange} fieldValues={mergedFieldValues} />;
      case 'social':
        return <SocialTab onFieldChange={handleLocalFieldChange} fieldValues={mergedFieldValues} />;
      case 'risk':
        return <RiskTab onFieldChange={handleLocalFieldChange} fieldValues={mergedFieldValues} />;
      case 'communication':
        return <CommunicationRespirationMobilityTab onFieldChange={handleLocalFieldChange} fieldValues={mergedFieldValues} />;
      case 'elimination':
        return <EliminationTab onFieldChange={handleLocalFieldChange} fieldValues={mergedFieldValues} />;
      case 'nutrition':
        return <NutritionSelfCareTab onFieldChange={handleLocalFieldChange} fieldValues={mergedFieldValues} />;
      case 'skin-pain':
        return <SkinPainTab onFieldChange={handleLocalFieldChange} fieldValues={mergedFieldValues} />;
      case 'emotion-remark':
        return <EmotionRemarkTab onFieldChange={handleLocalFieldChange} fieldValues={mergedFieldValues} />;
      case 'photo':
        return <PhotoTab onFieldChange={handleLocalFieldChange} fieldValues={mergedFieldValues} />;

      // The default case now correctly handles any unexpected issues.
      default:
        return (
          <TabsContent value={sectionId} className="mt-0">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">Component Not Found</h3>
                  <p className="text-muted-foreground">
                    The component for the {sections.find(s => s.id === sectionId)?.title} tab could not be loaded.
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
      {renderTabContent(currentSection)}
    </TabNavigation>
  );
}