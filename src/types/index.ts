export interface Venue {
  venueId: string;
  name: string;
  map: {
    width: number;
    height: number;
  };
  sections: Section[];
}

export interface Section {
  id: string;
  label: string;
  transform: Transform;
  rows: Row[];
}

export interface Row {
  index: number;
  seats: Seat[];
}

export interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: number;
  status: SeatStatus;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export type SeatStatus = 'available' | 'reserved' | 'selected' | 'unavailable';

export interface SelectedSeat {
  id: string;
  section: string;
  row: number;
  col: number;
  price: number;
  priceTier: number;
  x: number;
  y: number;
}

// Export all types as named exports and also as default
export default {
  Venue,
  Section,
  Row,
  Seat,
  Transform,
  SeatStatus,
  SelectedSeat
};