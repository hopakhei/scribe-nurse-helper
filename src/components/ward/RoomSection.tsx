import React from 'react';
import { RoomData } from '@/types/bedManagement';
import { BedIcon } from './BedIcon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RoomSectionProps {
  room: RoomData;
  selectedBed: string | null;
  onBedSelect: (bedNumber: string) => void;
  className?: string;
}

export const RoomSection: React.FC<RoomSectionProps> = ({
  room,
  selectedBed,
  onBedSelect,
  className
}) => {
  const availableCount = room.beds.filter(b => b.status === 'available').length;

  return (
    <div className={cn("rounded-lg border-2 border-bed-border/50 p-3", className)}>
      {/* Room Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{room.name}</h3>
          {room.isDisinfection && (
            <Badge className="bg-ward-section-purple text-purple-800 border-purple-300 text-xs">
              消毒
            </Badge>
          )}
        </div>
        <span className="text-xs text-bed-text">
          可用: {availableCount}/{room.beds.length}
        </span>
      </div>

      {/* Beds Grid */}
      <div className="grid grid-cols-2 gap-2">
        {room.beds.map((bed) => (
          <BedIcon
            key={bed.number}
            bed={bed}
            isSelected={selectedBed === bed.number}
            onSelect={onBedSelect}
          />
        ))}
      </div>
    </div>
  );
};
