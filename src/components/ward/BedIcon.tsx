import React from 'react';
import { BedData } from '@/types/bedManagement';
import { getBedStatusColor } from '@/lib/colorUtils';
import { Home, Wrench, AlertCircle, Cross, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BedIconProps {
  bed: BedData;
  isSelected: boolean;
  onSelect: (bedNumber: string) => void;
}

export const BedIcon: React.FC<BedIconProps> = ({ bed, isSelected, onSelect }) => {
  const canSelect = bed.status === 'available';
  
  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-2.5 w-2.5" />;
      case 'wrench':
        return <Wrench className="h-2.5 w-2.5" />;
      case 'alert':
        return <AlertCircle className="h-2.5 w-2.5" />;
      case 'medical':
        return <Cross className="h-2.5 w-2.5" />;
      case 'discharged':
        return <CheckCircle className="h-2.5 w-2.5" />;
      case 'attention':
        return <AlertCircle className="h-2.5 w-2.5" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={() => canSelect && onSelect(bed.number)}
      disabled={!canSelect}
      className={cn(
        "relative w-16 h-20 rounded-lg border-2 transition-all duration-200",
        getBedStatusColor(bed.status, bed.team),
        canSelect && "hover:shadow-md hover:scale-105 cursor-pointer",
        !canSelect && "opacity-60 cursor-not-allowed",
        isSelected && "ring-4 ring-primary ring-offset-2 shadow-lg scale-105",
        bed.isMDRO && "bg-bed-mdro border-red-300"
      )}
    >
      {/* Bed Number */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(
          "text-lg font-bold",
          bed.status === 'available' ? "text-bed-text" : "text-foreground/80"
        )}>
          {bed.number}
        </span>
      </div>

      {/* Status Indicators */}
      {bed.statusIndicators?.map((indicator, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute flex items-center justify-center w-5 h-5 rounded-full bg-white border shadow-sm",
            indicator.position === 'top-left' && "top-0.5 left-0.5",
            indicator.position === 'top-right' && "top-0.5 right-0.5",
            indicator.position === 'bottom-left' && "bottom-0.5 left-0.5",
            indicator.position === 'bottom-right' && "bottom-0.5 right-0.5"
          )}
          style={{ 
            borderColor: indicator.color || '#cbd5e1',
            color: indicator.color || '#64748b'
          }}
        >
          {getStatusIcon(indicator.type)}
        </div>
      ))}

      {/* Disinfection Badge */}
      {bed.isDisinfection && (
        <div className="absolute -top-1 -right-1 bg-ward-section-purple text-purple-800 text-[8px] font-semibold px-1 py-0.5 rounded">
          消毒
        </div>
      )}
    </button>
  );
};
