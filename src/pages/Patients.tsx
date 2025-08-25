import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuth";
import { AndroidLayout } from "@/components/AndroidLayout";
import { PatientCard } from "@/components/PatientCard";
import { BedAssignmentModal } from "@/components/BedAssignmentModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Clock, CheckCircle, AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  hospital_no: string;
  age: number;
  sex: string;
  admission_type: string;
  admission_date: string;
  bed: string | null;
  patient_status: 'awaiting_bed' | 'bed_assigned' | 'assessment_in_progress' | 'assessment_completed';
  bed_assigned_by: string | null;
  bed_assigned_at: string | null;
  dept: string;
  ward: string;
}

const Patients = () => {
  const { user, profile, loading: authLoading, signOut } = useAuthState();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [bedAssignmentOpen, setBedAssignmentOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadPatients();
  }, [user]);

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('patient_status', { ascending: true })
        .order('admission_date', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast.error('Failed to load patients: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBedAssignment = (patient: Patient) => {
    setSelectedPatient(patient);
    setBedAssignmentOpen(true);
  };

  const handleBedAssigned = async (bedNumber: string) => {
    if (!selectedPatient) return;

    try {
      const { error } = await supabase
        .from('patients')
        .update({
          bed: bedNumber,
          patient_status: 'bed_assigned',
          bed_assigned_by: 'robot',
          bed_assigned_at: new Date().toISOString()
        })
        .eq('id', selectedPatient.id);

      if (error) throw error;
      
      toast.success(`Bed ${bedNumber} assigned to ${selectedPatient.name}`);
      setBedAssignmentOpen(false);
      setSelectedPatient(null);
      loadPatients();
    } catch (error: any) {
      toast.error('Failed to assign bed: ' + error.message);
    }
  };

  const getStatusCounts = () => {
    return {
      awaiting_bed: patients.filter(p => p.patient_status === 'awaiting_bed').length,
      bed_assigned: patients.filter(p => p.patient_status === 'bed_assigned').length,
      assessment_in_progress: patients.filter(p => p.patient_status === 'assessment_in_progress').length,
      assessment_completed: patients.filter(p => p.patient_status === 'assessment_completed').length,
    };
  };

  if (authLoading || loading) {
    return (
      <AndroidLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AndroidLayout>
    );
  }

  const statusCounts = getStatusCounts();

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'doctor':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'nurse':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <AndroidLayout>
      <div className="p-4 space-y-6">
        {/* User Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Patient List
          </h1>
          <p className="text-muted-foreground">
            Ward {profile?.ward || '3A'} - {patients.length} patients
          </p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Awaiting Bed</p>
                  <p className="text-2xl font-bold">{statusCounts.awaiting_bed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Bed Assigned</p>
                  <p className="text-2xl font-bold">{statusCounts.bed_assigned}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">In Progress</p>
                  <p className="text-2xl font-bold">{statusCounts.assessment_in_progress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold">{statusCounts.assessment_completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Patients</h2>
          <div className="grid gap-4">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onAssignBed={() => handleBedAssignment(patient)}
              />
            ))}
          </div>
        </div>

        {/* Bed Assignment Modal */}
        <BedAssignmentModal
          open={bedAssignmentOpen}
          onOpenChange={setBedAssignmentOpen}
          patient={selectedPatient}
          onBedAssigned={handleBedAssigned}
        />
      </div>
    </AndroidLayout>
  );
};

export default Patients;