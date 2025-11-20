import React from 'react';
import type { Seat as SeatType, SeatStatus } from '../../types';
import { getSeatColor, getSeatPrice } from '../../utils/seatUtils';

interface SeatProps {
  seat: SeatType;
  sectionLabel: string;
  status: SeatStatus;
  onSelect: (seat: SeatType, sectionLabel: string, price: number) => void;
  onHover: (seat: SeatType, sectionLabel: string, price: number, x: number, y: number) => void;
  onLeave: () => void;
  zoomLevel: number;
}

// Pre-computed sizes for different zoom levels
const SEAT_SIZES = {
  0.1: 4, 0.2: 5, 0.3: 6, 0.4: 7, 0.5: 8, 0.6: 9, 0.7: 10, 
  0.8: 11, 0.9: 12, 1.0: 13, 1.1: 14, 1.2: 15, 1.3: 16, 
  1.4: 17, 1.5: 18, 2.0: 20, 3.0: 22
};

const getSeatSize = (zoomLevel: number): number => {
  const roundedZoom = Math.round(zoomLevel * 10) / 10;
  return SEAT_SIZES[roundedZoom as keyof typeof SEAT_SIZES] || 8;
};

export const Seat: React.FC<SeatProps> = React.memo(({ 
  seat, 
  sectionLabel, 
  status, 
  onSelect, 
  onHover,
  onLeave,
  zoomLevel 
}) => {
  const price = getSeatPrice(seat.priceTier);
  const seatSize = getSeatSize(zoomLevel);
  const showLabel = zoomLevel > 0.6;
  
  const handleClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === 'available' || status === 'selected') {
      onSelect(seat, sectionLabel, price);
    }
  }, [seat, sectionLabel, price, status, onSelect]);

  const handleMouseEnter = React.useCallback((e: React.MouseEvent<SVGGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onHover(seat, sectionLabel, price, rect.left + rect.width / 2, rect.top);
  }, [seat, sectionLabel, price, onHover]);

  const handleMouseLeave = React.useCallback(() => {
    onLeave();
  }, [onLeave]);

  // Don't render unavailable seats at low zoom levels for performance
  if (zoomLevel < 0.3 && status === 'unavailable') {
    return null;
  }

  return (
    <g 
      className="seat"
      transform={`translate(${seat.x}, ${seat.y})`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: status === 'available' || status === 'selected' ? 'pointer' : 'not-allowed' }}
    >
      <circle
        r={seatSize}
        fill={getSeatColor(status)}
        stroke="#fff"
        strokeWidth={1}
        className={`seat-circle ${status}`}
      />
      {showLabel && (
        <text
          textAnchor="middle"
          dy="0.3em"
          fontSize={Math.max(6, 8 * zoomLevel)}
          fill="#fff"
          fontWeight="bold"
          className="seat-label"
        >
          {seat.col}
        </text>
      )}
    </g>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.seat.id === nextProps.seat.id &&
    prevProps.status === nextProps.status &&
    prevProps.zoomLevel === nextProps.zoomLevel &&
    prevProps.sectionLabel === nextProps.sectionLabel
  );
});

Seat.displayName = 'Seat';