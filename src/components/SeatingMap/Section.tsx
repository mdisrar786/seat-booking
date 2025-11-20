import React from 'react';
import type { Section as SectionType, Seat as SeatType } from '../../types';
import { Seat } from './Seat';
import { getSeatPrice } from '../../utils/seatUtils';

interface SectionProps {
  section: SectionType;
  getSeatStatus: (seat: SeatType, sectionLabel: string, price: number) => string;
  onSeatSelect: (seat: SeatType, sectionLabel: string, price: number) => void;
  onSeatHover: (seat: SeatType, sectionLabel: string, price: number, x: number, y: number) => void;
  onSeatLeave: () => void;
  zoomLevel: number;
  viewport: { x: number; y: number; width: number; height: number };
}

export const Section: React.FC<SectionProps> = React.memo(({
  section,
  getSeatStatus,
  onSeatSelect,
  onSeatHover,
  onSeatLeave,
  zoomLevel,
  viewport
}) => {
  // Enhanced visibility check with larger buffer for smooth panning
  const isSeatVisible = (seat: SeatType) => {
    const buffer = 100; // Larger buffer for smooth panning
    return (
      seat.x >= viewport.x - buffer &&
      seat.x <= viewport.x + viewport.width + buffer &&
      seat.y >= viewport.y - buffer &&
      seat.y <= viewport.y + viewport.height + buffer
    );
  };

  return (
    <g 
      className="section"
      transform={`translate(${section.transform.x}, ${section.transform.y})`}
    >
      {/* Section background - only show at higher zoom levels */}
      {zoomLevel > 0.8 && (
        <rect
          x={-20}
          y={-20}
          width={section.rows[0]?.seats.length * 15 + 40 || 200}
          height={section.rows.length * 20 + 40 || 200}
          fill="transparent"
          stroke="#dee2e6"
          strokeWidth="1"
          strokeDasharray="4,4"
          opacity="0.5"
          rx="8"
        />
      )}
      
      {/* Section label - only show at higher zoom levels */}
      {zoomLevel > 0.6 && (
        <text
          x={section.rows[0]?.seats.length * 7.5 || 100}
          y={-8}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#495057"
          style={{ pointerEvents: 'none' }}
        >
          {section.label}
        </text>
      )}
      
      {/* Render seats with visibility check */}
      {section.rows.map(row =>
        row.seats.map(seat => {
          if (!isSeatVisible(seat)) return null;
          
          const price = getSeatPrice(seat.priceTier);
          const status = getSeatStatus(seat, section.label, price);
          
          return (
            <Seat
              key={seat.id}
              seat={seat}
              sectionLabel={section.label}
              status={status}
              onSelect={onSeatSelect}
              onHover={onSeatHover}
              onLeave={onSeatLeave}
              zoomLevel={zoomLevel}
            />
          );
        })
      )}
    </g>
  );
});

Section.displayName = 'Section';