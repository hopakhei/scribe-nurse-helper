import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Phone } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  contact?: string;
}

interface TeamAssignment {
  team: 'A' | 'B' | 'C';
  members: TeamMember[];
}

interface TeamPanelProps {
  teams: TeamAssignment[];
}

export const TeamPanel: React.FC<TeamPanelProps> = ({ teams }) => {
  const getTeamColor = (team: string) => {
    switch (team) {
      case 'A':
        return 'bg-team-a text-blue-900 border-blue-300';
      case 'B':
        return 'bg-team-b text-purple-900 border-purple-300';
      case 'C':
        return 'bg-team-c text-yellow-900 border-yellow-300';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-ward-background rounded-lg border border-bed-border/50 p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">團隊分配</h3>
      </div>

      {teams.map((teamData) => (
        <div
          key={teamData.team}
          className="bg-white rounded-lg p-3 border border-bed-border/50"
        >
          <Badge className={`${getTeamColor(teamData.team)} mb-3`}>
            Team {teamData.team}
          </Badge>

          <div className="space-y-2">
            {teamData.members.map((member, idx) => (
              <div key={idx} className="flex items-start justify-between text-sm">
                <div>
                  <div className="font-medium text-foreground">{member.name}</div>
                  <div className="text-xs text-bed-text">{member.role}</div>
                </div>
                {member.contact && (
                  <div className="flex items-center gap-1 text-xs text-bed-text">
                    <Phone className="h-3 w-3" />
                    {member.contact}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
