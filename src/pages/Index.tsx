import { PatientHeader } from "@/components/PatientHeader";
import { AudioRecordingControls } from "@/components/AudioRecordingControls";
import { FormNavigation } from "@/components/FormNavigation";
import { RiskScoreDisplay } from "@/components/RiskScoreDisplay";
import { FormSection } from "@/components/FormSection";
import { usePatientAssessment } from "@/hooks/usePatientAssessment";
import { Button } from "@/components/ui/button";
import { Save, Send } from "lucide-react";
import medicalLogo from "@/assets/medical-logo.png";

const Index = () => {
  const {
    patient,
    sections,
    currentSection,
    setCurrentSection,
    riskScores,
    handleRecordingStart,
    handleRecordingStop,
    handleFieldChange
  } = usePatientAssessment();

  // Mock form fields for demonstration
  const mockFields = [
    {
      id: 'chief-complaint',
      label: 'Chief Complaint',
      type: 'textarea' as const,
      value: 'Cough with yellow sputum, dizziness, fell at home',
      dataSource: 'ai-filled' as const,
      aiSourceText: 'Patient said: "咳得好辛苦，有啲黃色嘅痰。尋日喺屋企行去廁所，覺得暈跟住就跌低咗"',
      required: true
    },
    {
      id: 'marital-status',
      label: 'Marital Status',
      type: 'select' as const,
      value: 'Widowed',
      options: ['Single', 'Married', 'Divorced', 'Widowed'],
      dataSource: 'ai-filled' as const,
      aiSourceText: 'Patient mentioned: "我老婆幾年前走咗"'
    },
    {
      id: 'living-arrangement',
      label: 'Living Arrangement',
      type: 'select' as const,
      value: 'Lives alone',
      options: ['Lives alone', 'Lives with family', 'Lives with spouse', 'Residential care'],
      dataSource: 'ai-filled' as const,
      aiSourceText: 'Patient confirmed living alone when asked'
    },
    {
      id: 'vital-signs-temp',
      label: 'Temperature (°C)',
      type: 'number' as const,
      value: '37.9',
      dataSource: 'manual' as const,
      required: true
    },
    {
      id: 'vital-signs-bp',
      label: 'Blood Pressure (mmHg)',
      type: 'text' as const,
      value: '155/90',
      dataSource: 'manual' as const,
      required: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center space-x-4">
          <img 
            src={medicalLogo} 
            alt="HA Nursing Scribe Logo" 
            className="h-16 w-16"
          />
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              HA Nursing Scribe
            </h1>
            <p className="text-muted-foreground">
              AI-Assisted Patient Assessment Documentation System
            </p>
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
          title={sections.find(s => s.id === currentSection)?.title || ''}
          description="Complete the fields below. AI-filled data is highlighted in blue."
          fields={mockFields}
          onFieldChange={handleFieldChange}
        />

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          
          <Button className="flex items-center bg-primary hover:bg-primary-hover">
            <Send className="h-4 w-4 mr-2" />
            Submit to EMR
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
