import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WardMapProps {
  selectedBed: string | null;
  onBedSelect: (bedNumber: string) => void;
}

export const WardMap: React.FC<WardMapProps> = ({ selectedBed, onBedSelect }) => {
  // Generate bed numbers for Ward 3A and 3B
  const generateBeds = (corridor: 'A' | 'B') => {
    return Array.from({ length: 20 }, (_, i) => `3${corridor}-${String(i + 1).padStart(2, '0')}`);
  };

  const ward3ABeds = generateBeds('A');
  const ward3BBeds = generateBeds('B');

  // Mock occupied beds for demo
  const occupiedBeds = ['3A-03', '3A-07', '3A-15', '3B-02', '3B-09', '3B-14', '3B-18'];

  const getBedStatus = (bedNumber: string) => {
    if (occupiedBeds.includes(bedNumber)) return 'occupied';
    if (selectedBed === bedNumber) return 'selected';
    return 'available';
  };

  const getBedClassName = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed opacity-50';
      case 'selected':
        return 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/20';
      case 'available':
        return 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100 hover:border-green-400';
      default:
        return '';
    }
  };

  const renderCorridor = (beds: string[], corridorName: string) => (
    <div className="space-y-3">
      <h5 className="font-medium text-sm flex items-center gap-2">
        Corridor {corridorName}
        <Badge variant="outline" className="text-xs">
          {beds.filter(bed => getBedStatus(bed) === 'available').length} available
        </Badge>
      </h5>
      
      <div className="grid grid-cols-10 gap-2">
        {beds.map((bedNumber) => {
          const status = getBedStatus(bedNumber);
          const isOccupied = status === 'occupied';
          
          return (
            <Button
              key={bedNumber}
              variant="outline"
              size="sm"
              disabled={isOccupied}
              onClick={() => !isOccupied && onBedSelect(bedNumber)}
              className={cn(
                "h-12 w-full text-xs font-medium transition-all duration-200",
                getBedClassName(status)
              )}
            >
              <div className="text-center">
                <div className="font-semibold">{bedNumber.split('-')[1]}</div>
                <div className="text-[10px] opacity-75">{bedNumber.split('-')[0]}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded opacity-50"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary border border-primary rounded"></div>
          <span>Selected</span>
        </div>
      </div>

      {/* Ward Layout */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-8">
        <div className="text-center">
          <h4 className="font-semibold text-lg mb-2">Ward 3 - Floor Plan</h4>
          <p className="text-sm text-muted-foreground">Click on an available bed to select</p>
        </div>

        {/* Corridor A */}
        {renderCorridor(ward3ABeds, 'A')}

        {/* Corridor Separator */}
        <div className="flex items-center justify-center py-4">
          <div className="flex-1 h-px bg-border"></div>
          <div className="px-4 text-sm text-muted-foreground bg-background">
            Nursing Station & Common Area
          </div>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Corridor B */}
        {renderCorridor(ward3BBeds, 'B')}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="font-semibold text-green-800">
            {[...ward3ABeds, ...ward3BBeds].filter(bed => getBedStatus(bed) === 'available').length}
          </div>
          <div className="text-xs text-green-600">Available</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="font-semibold text-red-800">{occupiedBeds.length}</div>
          <div className="text-xs text-red-600">Occupied</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="font-semibold text-gray-800">40</div>
          <div className="text-xs text-gray-600">Total Beds</div>
        </div>
      </div>
    </div>
  );
};