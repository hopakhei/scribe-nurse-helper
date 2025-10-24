import { WardData } from "@/types/bedManagement";

export const mockWardData: WardData = {
  name: "Ward 9A",
  statistics: {
    totalBeds: 40,
    occupancyRate: 85,
    vacant: 6,
    occupied: 34,
    reserved: 0,
    frozen: 0,
    homeLeave: 2,
    missing: 0,
    discharging: 1,
    cleaning: 1
  },
  rooms: [
    {
      id: "room-1",
      name: "Room 1",
      corridor: "Corridor 1",
      beds: [
        { number: "01", room: "Room 1", status: "occupied", team: "A", patientName: "Patient A" },
        { number: "02", room: "Room 1", status: "occupied", team: "A", patientName: "Patient B" },
        { number: "03", room: "Room 1", status: "available", team: null },
        { number: "04", room: "Room 1", status: "occupied", team: "A", patientName: "Patient C" }
      ]
    },
    {
      id: "room-3",
      name: "Room 3",
      corridor: "Corridor 1",
      isDisinfection: true,
      beds: [
        { number: "09", room: "Room 3", status: "occupied", team: "B", patientName: "Patient D", isDisinfection: true },
        { number: "10", room: "Room 3", status: "occupied", team: "B", patientName: "Patient E" },
        { number: "11", room: "Room 3", status: "available", team: null },
        { number: "12", room: "Room 3", status: "occupied", team: "B", patientName: "Patient F" }
      ]
    },
    {
      id: "room-4",
      name: "Room 4",
      corridor: "Corridor 1",
      beds: [
        { 
          number: "13", 
          room: "Room 4", 
          status: "occupied", 
          team: "A", 
          patientName: "Patient G",
          statusIndicators: [{ type: "home", position: "top-left" }]
        },
        { number: "14", room: "Room 4", status: "occupied", team: "A", patientName: "Patient H" },
        { number: "15", room: "Room 4", status: "occupied", team: "A", patientName: "Patient I" },
        { number: "16", room: "Room 4", status: "available", team: null }
      ]
    },
    {
      id: "room-5",
      name: "Room 5",
      corridor: "Corridor 1",
      beds: [
        { number: "17", room: "Room 5", status: "occupied", team: "C", patientName: "Patient J" },
        { number: "18", room: "Room 5", status: "occupied", team: "C", patientName: "Patient K" },
        { number: "19", room: "Room 5", status: "available", team: null },
        { number: "20", room: "Room 5", status: "occupied", team: "C", patientName: "Patient L" }
      ]
    },
    {
      id: "room-6",
      name: "Room 6",
      beds: [
        { number: "21", room: "Room 6", status: "occupied", team: "B", patientName: "Patient M" },
        { number: "22", room: "Room 6", status: "occupied", team: "B", patientName: "Patient N" },
        { number: "23", room: "Room 6", status: "occupied", team: "B", patientName: "Patient O" },
        { number: "24", room: "Room 6", status: "available", team: null }
      ]
    },
    {
      id: "room-7",
      name: "Room 7",
      beds: [
        { number: "25", room: "Room 7", status: "occupied", team: "A", patientName: "Patient P" },
        { number: "26", room: "Room 7", status: "occupied", team: "A", patientName: "Patient Q" },
        { number: "27", room: "Room 7", status: "available", team: null },
        { number: "28", room: "Room 7", status: "occupied", team: "A", patientName: "Patient R" }
      ]
    },
    {
      id: "room-8",
      name: "Room 8",
      beds: [
        { 
          number: "29", 
          room: "Room 8", 
          status: "occupied", 
          team: "C", 
          patientName: "Patient S",
          isMDRO: true,
          statusIndicators: [{ type: "alert", position: "top-right" }]
        },
        { number: "30", room: "Room 8", status: "occupied", team: "C", patientName: "Patient T" },
        { number: "31", room: "Room 8", status: "available", team: null },
        { number: "32", room: "Room 8", status: "occupied", team: "C", patientName: "Patient U" }
      ]
    },
    {
      id: "room-9",
      name: "Room 9",
      beds: [
        { number: "33", room: "Room 9", status: "occupied", team: "B", patientName: "Patient V" },
        { number: "34", room: "Room 9", status: "occupied", team: "B", patientName: "Patient W" },
        { number: "35", room: "Room 9", status: "available", team: null },
        { number: "36", room: "Room 9", status: "occupied", team: "B", patientName: "Patient X" }
      ]
    },
    {
      id: "room-10",
      name: "Room 10",
      beds: [
        { number: "37", room: "Room 10", status: "occupied", team: "C", patientName: "Patient Y" },
        { number: "38", room: "Room 10", status: "occupied", team: "C", patientName: "Patient Z" },
        { number: "39", room: "Room 10", status: "available", team: null },
        { number: "40", room: "Room 10", status: "occupied", team: "C", patientName: "Patient AA" }
      ]
    }
  ],
  nurseStationPosition: { x: 50, y: 50 }
};

export const mockTeamAssignments = [
  {
    team: 'A' as const,
    members: [
      { name: "Dr. Smith", role: "E-Call MO", contact: "Ext 1234" },
      { name: "Dr. Johnson", role: "URO MO", contact: "Ext 1235" }
    ]
  },
  {
    team: 'B' as const,
    members: [
      { name: "Dr. Lee", role: "E-Call MO", contact: "Ext 1236" },
      { name: "Dr. Wang", role: "URO MO", contact: "Ext 1237" }
    ]
  },
  {
    team: 'C' as const,
    members: [
      { name: "Dr. Chen", role: "E-Call MO", contact: "Ext 1238" },
      { name: "Dr. Liu", role: "URO MO", contact: "Ext 1239" }
    ]
  }
];
