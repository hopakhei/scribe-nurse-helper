import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthState } from "@/hooks/useAuth";
import { useLocalUserManager } from "@/hooks/useLocalUserManager";
import { UserSelection } from "@/components/UserSelection";
import { AndroidLayout } from "@/components/AndroidLayout";
import { PatientHeader } from "@/components/PatientHeader";
import { AudioRecordingControls } from "@/components/AudioRecordingControls";
import { ImprovedAudioRecording } from "@/components/ImprovedAudioRecording";
import { EnhancedScribeDataDisplay, EnhancedScribeDataDisplayRef } from "@/components/EnhancedScribeDataDisplay";
import { RiskScoreDisplay } from "@/components/RiskScoreDisplay";
import { TabAssessmentSystem } from "@/components/TabAssessmentSystem";
import RAGSetupButton from "@/components/RAGSetupButton";
import { usePatientAssessment } from "@/hooks/usePatientAssessment";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import HandoverFormPrint from "@/components/HandoverFormPrint";
import "@/styles/print.css";

const Index = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuthState();
  const { quickSignIn } = useLocalUserManager();
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const scribeDisplayRef = useRef<EnhancedScribeDataDisplayRef>(null);

  console.log('Index render:', { 
    patientId, 
    user: !!user, 
    authLoading, 
    showUserSelection,
    userEmail: user?.email 
  });

  const {
    patient: patientFromHook,
    sections,
    currentSection,
    setCurrentSection,
    riskScores,
    isRecording,
    isProcessingAudio,
    lastTranscript,
    fieldValues,
    handleRecordingStart,
    handleRecordingStop,
    handleFieldChange,
    getFormFields,
    submitAssessment,
    saveDraft,
    validateAssessment,
    assessmentId,
    registerScribeRefresh
  } = usePatientAssessment(patientId);

  // Register the scribe refresh callback
  useEffect(() => {
    // Register regardless of current ref; callback will resolve ref at call time
    registerScribeRefresh(() => {
      scribeDisplayRef.current?.refresh();
    });
  }, [registerScribeRefresh]);

  console.log('Hook data:', {
    patient: !!patientFromHook,
    assessmentId,
    fieldValuesCount: Object.keys(fieldValues || {}).length,
    riskScores
  });

  useEffect(() => {
    console.log('Auth effect:', { user: !!user, authLoading });
    if (!user && !authLoading) {
      console.log('Setting showUserSelection to true');
      setShowUserSelection(true);
    } else if (user) {
      console.log('User authenticated, hiding user selection');
      setShowUserSelection(false);
    }
  }, [user, authLoading]);

  const handleSignInComplete = () => {
    setShowUserSelection(false);
  };

  const handleNewUserSignIn = () => {
    navigate('/auth');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'nurse':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (loadingError) {
    return (
      <AndroidLayout>
        <ErrorBoundary>
          <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md text-center">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-2">Loading Error</h2>
                <p className="text-muted-foreground mb-4">{loadingError}</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </ErrorBoundary>
      </AndroidLayout>
    );
  }

  if (authLoading) {
    console.log('Showing auth loading spinner');
    return (
      <AndroidLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading authentication...</p>
          </div>
        </div>
      </AndroidLayout>
    );
  }

  if (!patientId) {
    console.log('No patientId, redirecting to home');
    navigate('/');
    return null;
  }

  if (showUserSelection) {
    console.log('Showing user selection');
    return (
      <AndroidLayout>
        <ErrorBoundary>
          <div className="flex items-center justify-center min-h-screen p-4">
            <UserSelection 
              onSignInComplete={handleSignInComplete}
              onNewUserSignIn={handleNewUserSignIn}
            />
          </div>
        </ErrorBoundary>
      </AndroidLayout>
    );
  }

  if (!patientFromHook && !assessmentId) {
    console.log('Patient or assessment still loading');
    return (
      <AndroidLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading patient assessment...</p>
          </div>
        </div>
      </AndroidLayout>
    );
  }

  console.log('Rendering main assessment interface');
  
  return (
    <AndroidLayout>
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto py-6 px-4 max-w-7xl">
            {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Patient List
              </Button>
              <div>
                <h2 className="font-semibold">{profile?.full_name || profile?.email}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getRoleBadgeColor(profile?.role)}>
                    {profile?.role || 'User'}
                  </Badge>
                  {profile?.department && (
                    <span className="text-sm text-muted-foreground">
                      {profile.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-primary mb-2">
                Patient Assessment
              </h1>
              <p className="text-muted-foreground">
                AI-Assisted Patient Assessment Documentation System
              </p>
            </div>

            {/* RAG Setup for Admin Users */}
            {profile?.role === 'admin' && (
              <div className="mb-6">
                <RAGSetupButton />
              </div>
            )}

            {/* Patient Information */}
          <PatientHeader patient={patientFromHook} />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Assessment */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Audio Recording Controls */}
                  <ImprovedAudioRecording 
                    onRecordingStart={handleRecordingStart}
                    onRecordingStop={handleRecordingStop}
                    transcriptText={lastTranscript}
                    isProcessing={isProcessingAudio}
                  />

                  {/* Risk Scores */}
                  <RiskScoreDisplay scores={[
                    {
                      name: 'Morse Fall Scale',
                      score: riskScores.morseScore || null,
                      maxScore: 125,
                      level: !riskScores.morseScore ? 'none' : (riskScores.morseScore >= 45 ? 'high' : riskScores.morseScore >= 25 ? 'medium' : 'low') as 'high' | 'medium' | 'low' | 'none',
                      description: 'Fall risk assessment score'
                    },
                    {
                      name: 'MST Score',
                      score: riskScores.mstScore || null,
                      maxScore: 5,
                      level: !riskScores.mstScore ? 'none' : (riskScores.mstScore >= 2 ? 'high' : 'low') as 'high' | 'medium' | 'low' | 'none',
                      description: 'Malnutrition screening tool'
                    },
                    {
                      name: 'Norton Scale',
                      score: riskScores.nortonScore || null,
                      maxScore: 20,
                      level: !riskScores.nortonScore ? 'none' : (riskScores.nortonScore < 10 ? 'high' : riskScores.nortonScore <= 18 ? 'medium' : 'low') as 'high' | 'medium' | 'low' | 'none',
                      description: 'Pressure injury risk assessment'
                    },
                    {
                      name: 'Braden Scale', 
                      score: riskScores.bradenScore || null,
                      maxScore: 23,
                      level: !riskScores.bradenScore ? 'none' : (riskScores.bradenScore <= 12 ? 'high' : riskScores.bradenScore <= 18 ? 'medium' : 'low') as 'high' | 'medium' | 'low' | 'none',
                      description: 'Pressure injury risk assessment'
                    }
                  ]} />

                  {/* Enhanced Tab Assessment System */}
                  <TabAssessmentSystem
                    onFieldChange={handleFieldChange}
                    assessmentId={assessmentId}
                    patientId={patientId}
                    fieldValues={{
                      patient_gender: patientFromHook?.sex === 'F' ? 'Female' : 'Male',
                      ...fieldValues
                    }}
                  />

                  {/* Action Buttons */}
                  <div className="flex justify-between gap-4">
                    <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        onClick={saveDraft}
                        className="flex items-center min-h-[48px] px-6"
                      >
                        Save Draft
                      </Button>
                      
                      <HandoverFormPrint 
                        patient={patientFromHook}
                        fieldValues={fieldValues}
                        riskScores={riskScores}
                        assessmentId={assessmentId || ''}
                      />
                    </div>
                    
                    <Button 
                      onClick={() => submitAssessment(navigate)}
                      className="flex items-center min-h-[48px] px-6"
                    >
                      Submit Assessment
                    </Button>
                  </div>
                </div>

                {/* Right Column - Scribe Data & History */}
                <div className="lg:col-span-1">
                  <div className="sticky top-4">
                    <EnhancedScribeDataDisplay
                      ref={scribeDisplayRef}
                      assessmentId={assessmentId || ''}
                      currentFieldValues={fieldValues}
                      patientId={patientId}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AndroidLayout>
  );
};

export default Index;