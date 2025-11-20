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
  const seatSize = Math.max(6, Math.min(20, 12 * zoomLevel));
  const showLabel = zoomLevel > 0.6;
  
  const handleClick = () => {
    if (status === 'available' || status === 'selected') {
      onSelect(seat, sectionLabel, price);
    }
  };

  const handleMouseEnter = () => {
    onHover(seat, sectionLabel, price, seat.x, seat.y);
  };

  const handleMouseLeave = () => {
    onLeave();
  };

  // Don't render unavailable seats at very low zoom for performance
  if (zoomLevel < 0.2 && status === 'unavailable') {
    return null;
  }

  const isInteractive = status === 'available' || status === 'selected';

  return (
    <g 
      className="seat"
      transform={`translate(${seat.x}, ${seat.y})`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <circle
        r={seatSize}
        fill={getSeatColor(status)}
        stroke="#fff"
        strokeWidth={1}
        className="seat-circle"
        style={{ 
          cursor: isInteractive ? 'pointer' : 'not-allowed',
          transition: 'fill 0.2s ease'
        }}
      />
      {showLabel && (
        <text
          textAnchor="middle"
          dy="0.3em"
          fontSize={Math.max(6, 8 * zoomLevel)}
          fill="#fff"
          fontWeight="bold"
          className="seat-label"
          style={{ pointerEvents: 'none' }}
        >
          {seat.col}
        </text>
      )}
    </g>
  );
});

Seat.displayName = 'Seat';