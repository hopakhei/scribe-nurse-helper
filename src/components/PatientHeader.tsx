import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { User, Calendar, MapPin, Clock } from "lucide-react";

interface PatientHeaderProps {
  patient: {
    name: string;
    hospitalNo: string;
    age: number;
    sex: string;
    admissionType: string;
    ward: string;
    admissionDate: string;
  };
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <Card className="bg-medical-pre-populated border-l-4 border-l-primary p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
            <p className="text-medical-pre-populated-foreground font-medium">
              Hospital No: {patient.hospitalNo}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-primary text-primary-foreground border-primary">
          {patient.admissionType}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {patient.age} years, {patient.sex}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{patient.ward}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{patient.admissionDate}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">In Progress</span>
        </div>
      </div>
    </Card>
  );
}