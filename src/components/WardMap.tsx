import React from 'react';
import { RoomSection } from './ward/RoomSection';
import { Badge } from './ui/badge';
import { Home, Users, AlertCircle, Wrench } from 'lucide-react';
import { mockWardData } from '@/data/wardMockData';

interface WardMapProps {
  selectedBed: string | null;
  onBedSelect: (bedNumber: string) => void;
}

export const WardMap: React.FC<WardMapProps> = ({ selectedBed, onBedSelect }) => {
  const ward = mockWardData;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 p-3 bg-ward-background rounded-lg border border-bed-border/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-bed-available border-2 border-bed-border"></div>
          <span className="text-sm text-bed-text">Vacant</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-team-a border-2 border-team-a/30"></div>
          <span className="text-sm text-bed-text">Team A</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-team-b border-2 border-team-b/30"></div>
          <span className="text-sm text-bed-text">Team B</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-team-c border-2 border-team-c/30"></div>
          <span className="text-sm text-bed-text">Team C</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-bed-mdro border-2 border-red-300"></div>
          <span className="text-sm text-bed-text">MDRO</span>
        </div>
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-bed-text" />
          <span className="text-sm text-bed-text">Home Leave</span>
        </div>
      </div>

      {/* Ward Layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left Column - Corridor 1 */}
        <div className="space-y-4">
          <div className="bg-ward-section-blue/30 rounded-lg p-2">
            <Badge className="bg-team-a text-blue-900 border-blue-300 mb-2">
              Corridor 1
            </Badge>
            <div className="space-y-3">
              {ward.rooms.filter(r => r.corridor === 'Corridor 1').map(room => (
                <RoomSection
                  key={room.id}
                  room={room}
                  selectedBed={selectedBed}
                  onBedSelect={onBedSelect}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center Column - Nurse Station */}
        <div className="flex items-center justify-center">
          <div className="bg-primary/10 rounded-lg p-6 border-2 border-primary/20 text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">Nurse Station</h3>
          </div>
        </div>

        {/* Right Column - Other Rooms */}
        <div className="space-y-4">
          <div className="space-y-3">
            {ward.rooms.filter(r => !r.corridor).map(room => (
              <RoomSection
                key={room.id}
                room={room}
                selectedBed={selectedBed}
                onBedSelect={onBedSelect}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-xs text-green-700">Available Beds</div>
              <div className="text-2xl font-bold text-green-900">{ward.statistics.vacant}</div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-xs text-blue-700">Occupied</div>
              <div className="text-2xl font-bold text-blue-900">{ward.statistics.occupied}</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <div className="text-xs text-orange-700">Total Beds</div>
              <div className="text-2xl font-bold text-orange-900">{ward.statistics.totalBeds}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
