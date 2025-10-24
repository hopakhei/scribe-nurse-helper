import { BedTeam, BedStatus } from "@/types/bedManagement";

export const getTeamColor = (team: BedTeam): string => {
  switch (team) {
    case 'A':
      return 'bg-team-a border-team-a/30';
    case 'B':
      return 'bg-team-b border-team-b/30';
    case 'C':
      return 'bg-team-c border-team-c/30';
    default:
      return 'bg-bed-available border-bed-border';
  }
};

export const getBedStatusColor = (status: BedStatus, team: BedTeam): string => {
  if (status === 'available') {
    return 'bg-bed-available border-bed-border';
  }
  
  // For occupied beds, use team colors
  return getTeamColor(team);
};

export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'awaiting_bed':
      return 'bg-status-attention/50 text-orange-900 border-orange-300';
    case 'bed_assigned':
      return 'bg-team-a/50 text-blue-900 border-blue-300';
    case 'assessment_in_progress':
      return 'bg-team-c/50 text-yellow-900 border-yellow-300';
    case 'assessment_completed':
      return 'bg-success/20 text-green-900 border-green-300';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};
