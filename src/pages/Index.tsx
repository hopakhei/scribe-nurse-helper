
import { PatientHeader } from "@/components/PatientHeader";
import { AudioRecordingControls } from "@/components/AudioRecordingControls";
import { FormNavigation } from "@/components/FormNavigation";
import { RiskScoreDisplay } from "@/components/RiskScoreDisplay";
import { FormSection } from "@/components/FormSection";
import { AndroidLayout } from "@/components/AndroidLayout";
import { usePatientAssessment } from "@/hooks/usePatientAssessment";
import { Button } from "@/components/ui/button";
import { Save, Send } from "lucide-react";


const Index = () => {
  const {
    patient,
    sections,
    currentSection,
    setCurrentSection,
    riskScores,
    handleRecordingStart,
    handleRecordingStop,
    handleFieldChange,
    getFormFields,
    submitAssessment
  } = usePatientAssessment();

  const currentSectionData = sections.find(s => s.id === currentSection);
  const currentFields = getFormFields(currentSection);

  const handleSubmit = async () => {
    await submitAssessment();
  };

  return (
    <AndroidLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  Patient Admission Robot
                </h1>
                <p className="text-muted-foreground">
                  AI-Assisted Patient Assessment Documentation System
                </p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <PatientHeader patient={patient} />

          {/* Audio Recording Controls */}
          <AudioRecordingControls 
            onRecordingStart={handleRecordingStart}
            onRecordingStop={handleRecordingStop}
          />

          {/* Risk Scores */}
          <RiskScoreDisplay scores={riskScores} />

          {/* Form Navigation */}
          <FormNavigation 
            sections={sections}
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
          />

          {/* Current Form Section */}
          <FormSection
            title={currentSectionData?.title || 'Patient Assessment Form'}
            description={`Complete the ${currentSectionData?.title} fields below. AI-filled data is highlighted in blue and shows source conversation.`}
            fields={currentFields}
            onFieldChange={handleFieldChange}
          />

          {/* Action Buttons - Optimized for touch */}
          <div className="flex justify-between mt-8 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center min-h-[56px] px-8 text-base touch-manipulation active:scale-95"
            >
              <Save className="h-5 w-5 mr-3" />
              Save Draft
            </Button>
            
            <Button 
              className="flex items-center bg-primary hover:bg-primary-hover min-h-[56px] px-8 text-base touch-manipulation active:scale-95"
              onClick={handleSubmit}
            >
              <Send className="h-5 w-5 mr-3" />
              Submit to EMR
            </Button>
          </div>
        </div>
      </div>
    </AndroidLayout>
  );
};

export default Index;
