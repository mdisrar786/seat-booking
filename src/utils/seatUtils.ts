import type { Seat, SeatStatus } from '../types';

const PRICE_TIERS: Record<number, number> = {
  1: 150, // VIP
  2: 100, // Lower Bowl
  3: 75,  // Upper Bowl
  4: 50,  // Economy
  5: 35   // Student
};

export const getSeatPrice = (priceTier: number): number => {
  return PRICE_TIERS[priceTier] || 50;
};

export const shouldRenderSeat = (
  seat: Seat,
  zoomLevel: number,
  viewport: { x: number; y: number; width: number; height: number }
): boolean => {
  // Use integer-based calculations for stability
  const seatX = Math.round(seat.x);
  const seatY = Math.round(seat.y);
  const viewportX = Math.round(viewport.x);
  const viewportY = Math.round(viewport.y);
  const viewportWidth = Math.round(viewport.width);
  const viewportHeight = Math.round(viewport.height);

  // Aggressive optimization for low zoom levels
  if (zoomLevel < 0.2) {
    return seat.col % 10 === 0;
  }
  
  if (zoomLevel < 0.4) {
    return seat.col % 5 === 0;
  }

  if (zoomLevel < 0.6) {
    return seat.col % 3 === 0;
  }

  // Stable viewport calculation with buffer
  const buffer = 100; // Larger buffer to prevent edge flickering
  const isInViewport = 
    seatX >= viewportX - buffer && 
    seatX <= viewportX + viewportWidth + buffer &&
    seatY >= viewportY - buffer && 
    seatY <= viewportY + viewportHeight + buffer;
  
  return isInViewport;
};

export const getSeatColor = (status: SeatStatus): string => {
  switch (status) {
    case 'available':
      return '#28a745';
    case 'selected':
      return '#007bff';
    case 'reserved':
      return '#6c757d';
    case 'unavailable':
      return '#dc3545';
    default:
      return '#6c757d';
  }
};