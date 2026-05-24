// UI-only mock data. TODO: wire to Supabase (replace these with real queries).

export const mockVentures = [
  { id: '1', name: 'Acme Co' },
  { id: '2', name: 'Pollen Labs' },
  { id: '3', name: 'Northwind' },
  { id: '4', name: 'Helix' },
  { id: '5', name: 'Tidepool' },
];

export const mockParticipants = [
  { id: '1', firstName: 'Jordan', lastName: 'Reeves', email: 'jreeves@example.edu', ventureId: '1' },
  { id: '2', firstName: 'Sam', lastName: 'Patel', email: 'spatel@example.edu', ventureId: '2' },
  { id: '3', firstName: 'Riley', lastName: 'Chen', email: 'rchen@example.edu', ventureId: '1' },
];

export const mockSessions = [
  { id: '1', ventureName: 'Acme Co', date: 'May 6', duration: '2h 10m' },
  { id: '2', ventureName: 'Acme Co', date: 'May 4', duration: '1h 45m' },
  { id: '3', ventureName: 'Pollen Labs', date: 'May 2', duration: '3h 00m' },
  { id: '4', ventureName: 'Acme Co', date: 'Apr 30', duration: '1h 15m' },
];

export type Venture = (typeof mockVentures)[number];
export type Participant = (typeof mockParticipants)[number];
export type Session = (typeof mockSessions)[number];
