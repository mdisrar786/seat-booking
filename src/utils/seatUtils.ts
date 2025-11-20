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
  // Aggressive optimization for low zoom levels
  if (zoomLevel < 0.2) {
    // Only render every 10th seat at very low zoom
    return seat.col % 10 === 0;
  }
  
  if (zoomLevel < 0.4) {
    // Only render every 5th seat at low zoom
    return seat.col % 5 === 0;
  }

  if (zoomLevel < 0.6) {
    // Only render every 3rd seat at medium-low zoom
    return seat.col % 3 === 0;
  }

  // At higher zoom levels, use viewport-based rendering
  const buffer = 50; // Buffer area around viewport
  const isInViewport = 
    seat.x >= viewport.x - buffer && 
    seat.x <= viewport.x + viewport.width + buffer &&
    seat.y >= viewport.y - buffer && 
    seat.y <= viewport.y + viewport.height + buffer;
  
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

// Fast color lookup for performance
const colorCache = new Map<SeatStatus, string>();
export const getSeatColorCached = (status: SeatStatus): string => {
  if (!colorCache.has(status)) {
    colorCache.set(status, getSeatColor(status));
  }
  return colorCache.get(status)!;
};