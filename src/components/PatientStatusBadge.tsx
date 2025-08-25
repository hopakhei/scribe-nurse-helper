import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Clock, 
  User, 
  CheckCircle 
} from "lucide-react";

interface PatientStatusBadgeProps {
  status: 'awaiting_bed' | 'bed_assigned' | 'assessment_in_progress' | 'assessment_completed';
}

export const PatientStatusBadge: React.FC<PatientStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'awaiting_bed':
        return {
          label: 'Awaiting Bed',
          variant: 'destructive' as const,
          icon: AlertCircle,
          className: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
        };
      case 'bed_assigned':
        return {
          label: 'Bed Assigned',
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
        };
      case 'assessment_in_progress':
        return {
          label: 'In Progress',
          variant: 'default' as const,
          icon: User,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
        };
      case 'assessment_completed':
        return {
          label: 'Completed',
          variant: 'secondary' as const,
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
        };
      default:
        return {
          label: 'Unknown',
          variant: 'outline' as const,
          icon: AlertCircle,
          className: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};