import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PatientStatusBadge } from "@/components/PatientStatusBadge";
import { 
  User, 
  MapPin, 
  Clock, 
  NavigationIcon, 
  FileText, 
  Play,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface PatientCardProps {
  patient: Patient;
  onAssignBed: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onAssignBed }) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getActionButton = () => {
    switch (patient.patient_status) {
      case 'awaiting_bed':
        return (
          <Button onClick={onAssignBed} className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Assign Bed
          </Button>
        );
      case 'bed_assigned':
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {/* Navigate to bed logic */}}
              className="flex items-center gap-2"
            >
              <NavigationIcon className="h-4 w-4" />
              Navigate to Bed
            </Button>
            <Button 
              onClick={() => navigate(`/assessment/${patient.id}`)}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Assessment
            </Button>
          </div>
        );
      case 'assessment_in_progress':
        return (
          <Button 
            onClick={() => navigate(`/assessment/${patient.id}`)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Continue Assessment
          </Button>
        );
      case 'assessment_completed':
        return (
          <Button 
            variant="outline"
            onClick={() => navigate(`/assessment/${patient.id}`)}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            View Assessment
          </Button>
        );
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Patient Info */}
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{patient.name}</h3>
                <PatientStatusBadge status={patient.patient_status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{patient.hospital_no} • {patient.age}y {patient.sex}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(patient.admission_date)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {patient.admission_type}
                  </Badge>
                </div>

                {patient.bed && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Bed {patient.bed}</span>
                  </div>
                )}
              </div>

              {patient.bed_assigned_at && (
                <div className="text-xs text-muted-foreground">
                  Bed assigned {formatTime(patient.bed_assigned_at)} via {patient.bed_assigned_by}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};