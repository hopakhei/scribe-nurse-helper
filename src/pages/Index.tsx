
import { useState } from 'react';
import { PatientHeader } from "@/components/PatientHeader";
import { AudioRecordingControls } from "@/components/AudioRecordingControls";
import { FormNavigation } from "@/components/FormNavigation";
import { RiskScoreDisplay } from "@/components/RiskScoreDisplay";
import { FormSection } from "@/components/FormSection";
import { AndroidLayout } from "@/components/AndroidLayout";
import { UserSelection } from "@/components/UserSelection";
import { usePatientAssessment } from "@/hooks/usePatientAssessment";
import { useAuthState } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Save, Send, Loader2, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


const Index = () => {
  const { user, loading, profile, signOut } = useAuthState();
  const [showNewUserAuth, setShowNewUserAuth] = useState(false);
  
  const {
    patient,
    sections,
    currentSection,
    setCurrentSection,
    riskScores,
    isRecording,
    isProcessingAudio,
    lastTranscript,
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

  const handleSignInComplete = () => {
    window.location.href = '/';
  };

  const handleNewUserSignIn = () => {
    window.location.href = '/auth';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'nurse':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <AndroidLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AndroidLayout>
    );
  }

  if (!user) {
    return (
      <AndroidLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <UserSelection 
            onSignInComplete={handleSignInComplete}
            onNewUserSignIn={handleNewUserSignIn}
          />
        </div>
      </AndroidLayout>
    );
  }

  return (
    <AndroidLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4 max-w-7xl">
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
              
              {/* User Info & Sign Out */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(profile?.full_name || user?.email || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="flex items-center gap-1">
                      {profile?.role && (
                        <Badge className={getRoleBadgeColor(profile.role)} variant="secondary">
                          {profile.role}
                        </Badge>
                      )}
                      {profile?.department && (
                        <Badge variant="outline" className="text-xs">
                          {profile.department}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <PatientHeader patient={patient} />

          {/* Main Content */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="space-y-6">
              {/* Audio Recording Controls */}
              <AudioRecordingControls 
                onRecordingStart={handleRecordingStart}
                onRecordingStop={handleRecordingStop}
                transcriptText={lastTranscript}
                isProcessing={isProcessingAudio}
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
              <div className="flex justify-between gap-4">
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
        </div>
      </div>
    </AndroidLayout>
  );
};

export default Index;
