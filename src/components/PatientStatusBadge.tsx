import React from 'react';
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeColor } from "@/lib/colorUtils";
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
          className: getStatusBadgeColor('awaiting_bed')
        };
      case 'bed_assigned':
        return {
          label: 'Bed Assigned',
          variant: 'secondary' as const,
          icon: Clock,
          className: getStatusBadgeColor('bed_assigned')
        };
      case 'assessment_in_progress':
        return {
          label: 'In Progress',
          variant: 'default' as const,
          icon: User,
          className: getStatusBadgeColor('assessment_in_progress')
        };
      case 'assessment_completed':
        return {
          label: 'Completed',
          variant: 'secondary' as const,
          icon: CheckCircle,
          className: getStatusBadgeColor('assessment_completed')
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