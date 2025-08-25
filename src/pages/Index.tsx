import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthState } from "@/hooks/useAuth";
import { useLocalUserManager } from "@/hooks/useLocalUserManager";
import { UserSelection } from "@/components/UserSelection";
import { AndroidLayout } from "@/components/AndroidLayout";
import { PatientHeader } from "@/components/PatientHeader";
import { AudioRecordingControls } from "@/components/AudioRecordingControls";
import { RiskScoreDisplay } from "@/components/RiskScoreDisplay";
import { TabAssessmentSystem } from "@/components/TabAssessmentSystem";
import { usePatientAssessment } from "@/hooks/usePatientAssessment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuthState();
  const { quickSignIn } = useLocalUserManager();
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const {
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
    submitAssessment,
    assessmentId
  } = usePatientAssessment(patientId);

  useEffect(() => {
    if (!user && !authLoading) {
      setShowUserSelection(true);
    } else if (user) {
      setShowUserSelection(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (patientId && user) {
      loadPatient();
    }
  }, [patientId, user]);

  const loadPatient = async () => {
    if (!patientId) return;
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      setPatient(data);
      
      // Update patient status to assessment_in_progress if it's bed_assigned
      if (data.patient_status === 'bed_assigned') {
        await supabase
          .from('patients')
          .update({ patient_status: 'assessment_in_progress' })
          .eq('id', patientId);
      }
    } catch (error: any) {
      toast.error('Failed to load patient: ' + error.message);
      navigate('/');
    } finally {
      setLoadingPatient(false);
    }
  };

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

  if (authLoading || loadingPatient) {
    return (
      <AndroidLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AndroidLayout>
    );
  }

  if (!patientId) {
    navigate('/');
    return null;
  }

  if (showUserSelection) {
    return (
      <AndroidLayout>
        <div className="flex items-center justify-center min-h-screen p-4">
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

              {/* Enhanced Tab Assessment System */}
              <TabAssessmentSystem
                onFieldChange={handleFieldChange}
                fieldValues={{}} // This would be populated from usePatientAssessment
              />

              {/* Action Buttons */}
              <div className="flex justify-between gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center min-h-[48px] px-6"
                >
                  Save Draft
                </Button>
                
                <Button 
                  onClick={() => submitAssessment(navigate)}
                  className="flex items-center min-h-[48px] px-6"
                >
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