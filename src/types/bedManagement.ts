export type BedStatus = 'available' | 'occupied' | 'discharging' | 'cleaning' | 'blocked';
export type BedTeam = 'A' | 'B' | 'C' | null;

export interface BedStatusIndicator {
  type: 'home' | 'wrench' | 'alert' | 'medical' | 'discharged' | 'attention';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color?: string;
}

export interface BedData {
  number: string;
  room: string;
  status: BedStatus;
  team: BedTeam;
  patientName?: string;
  statusIndicators?: BedStatusIndicator[];
  isDisinfection?: boolean;
  isMDRO?: boolean;
}

export interface RoomData {
  id: string;
  name: string;
  corridor?: string;
  isDisinfection?: boolean;
  beds: BedData[];
}

export interface WardData {
  name: string;
  statistics: {
    totalBeds: number;
    occupancyRate: number;
    vacant: number;
    occupied: number;
    reserved: number;
    frozen: number;
    homeLeave: number;
    missing: number;
    discharging: number;
    cleaning: number;
  };
  rooms: RoomData[];
  nurseStationPosition?: { x: number; y: number };
}
