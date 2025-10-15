import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WardMap } from "@/components/WardMap";
import { User, MapPin, Clock } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  hospital_no: string;
  age: number;
  sex: string;
  admission_type: string;
  admission_date: string;
  bed: string | null;
  patient_status: string;
  dept: string;
  ward: string;
}

interface BedAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  onBedAssigned: (bedNumber: string) => void;
}

export const BedAssignmentModal: React.FC<BedAssignmentModalProps> = ({
  open,
  onOpenChange,
  patient,
  onBedAssigned
}) => {
  const [selectedBed, setSelectedBed] = useState<string | null>(null);

  const handleBedSelect = (bedNumber: string) => {
    setSelectedBed(bedNumber);
  };

  const handleConfirmAssignment = () => {
    if (selectedBed) {
      onBedAssigned(selectedBed);
      setSelectedBed(null);
    }
  };

  const handleCancel = () => {
    setSelectedBed(null);
    onOpenChange(false);
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Bed Assignment - Ward 9
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {patient.hospital_no} • {patient.age}y {patient.sex}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{patient.admission_type}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(patient.admission_date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ward Map */}
          <div>
            <h4 className="font-medium mb-3">Select a bed from Ward 9:</h4>
            <WardMap 
              selectedBed={selectedBed}
              onBedSelect={handleBedSelect}
            />
          </div>

          {/* Selected Bed Info */}
          {selectedBed && (
            <div className="bg-primary/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Selected Bed: {selectedBed}</p>
                  <p className="text-sm text-muted-foreground">
                    Patient will be assigned to this bed
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  Selected
                </Badge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAssignment}
              disabled={!selectedBed}
              className="min-w-32"
            >
              Assign Bed {selectedBed && `${selectedBed}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};