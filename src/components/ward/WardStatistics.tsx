import React from 'react';
import { WardData } from '@/types/bedManagement';
import { Badge } from '@/components/ui/badge';
import { Home, AlertCircle, Lock, Wrench, Users, UserX } from 'lucide-react';

interface WardStatisticsProps {
  ward: WardData;
}

export const WardStatistics: React.FC<WardStatisticsProps> = ({ ward }) => {
  const { statistics } = ward;

  const statItems = [
    {
      label: 'Vacant',
      value: statistics.vacant,
      icon: Home,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Occupied',
      value: statistics.occupied,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Reserved',
      value: statistics.reserved,
      icon: Lock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Frozen',
      value: statistics.frozen,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      label: 'Home Leave',
      value: statistics.homeLeave,
      icon: Home,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    },
    {
      label: 'Missing',
      value: statistics.missing,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="bg-ward-background rounded-lg p-4 border border-bed-border/50">
      {/* Header with Ward Name and Occupancy */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">{ward.name}</h2>
          <Badge className="bg-team-a text-blue-900 border-blue-300 px-3 py-1">
            Occupancy: {statistics.occupancyRate}% - {statistics.occupied}/{statistics.totalBeds}
          </Badge>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-6 gap-3">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-bed-border/50"
          >
            <div className={`${stat.bgColor} p-1.5 rounded`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <div className="text-xs text-bed-text">{stat.label}</div>
              <div className="text-lg font-bold text-foreground">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
