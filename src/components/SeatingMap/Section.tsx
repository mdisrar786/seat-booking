import React, { useEffect, useMemo } from 'react';
import type { Section as SectionType, Seat as SeatType } from '../../types';
import { Seat } from './Seat';
import { shouldRenderSeat, getSeatPrice } from '../../utils/seatUtils';

interface SectionProps {
  section: SectionType;
  getSeatStatus: (seat: SeatType, sectionLabel: string, price: number) => string;
  onSeatSelect: (seat: SeatType, sectionLabel: string, price: number) => void;
  onSeatHover: (seat: SeatType, sectionLabel: string, price: number, x: number, y: number) => void;
  onSeatLeave: () => void;
  onRenderedSeatsUpdate: (count: number) => void;
  zoomLevel: number;
  viewport: { x: number; y: number; width: number; height: number };
}

export const Section: React.FC<SectionProps> = React.memo(({
  section,
  getSeatStatus,
  onSeatSelect,
  onSeatHover,
  onSeatLeave,
  onRenderedSeatsUpdate,
  zoomLevel,
  viewport
}) => {
  const totalSeats = section.rows.reduce((sum, row) => sum + row.seats.length, 0);
  
  // Memoized visible seats calculation
  const visibleSeats = useMemo(() => {
    return section.rows.flatMap(row =>
      row.seats.filter(seat => 
        shouldRenderSeat(seat, zoomLevel, viewport)
      )
    );
  }, [section.rows, zoomLevel, viewport]);

  // Batch rendered seats update
  useEffect(() => {
    onRenderedSeatsUpdate(visibleSeats.length);
  }, [visibleSeats.length, onRenderedSeatsUpdate]);

  // Only show section background at higher zoom levels
  const showSectionBackground = zoomLevel > 0.3;

  return (
    <g 
      className="section"
      transform={`translate(${section.transform.x}, ${section.transform.y}) scale(${section.transform.scale})`}
      data-section-id={section.id}
    >
      {showSectionBackground && (
        <rect
          x={-10}
          y={-15}
          width={section.rows[0]?.seats.length * 18 + 20 || 200}
          height={section.rows.length * 22 + 30 || 200}
          fill="transparent"
          stroke="#dee2e6"
          strokeWidth="1"
          opacity="0.4"
          rx="5"
        />
      )}
      
      {zoomLevel > 0.4 && (
        <text
          x={section.rows[0]?.seats.length * 9 || 100}
          y={-5}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#495057"
        >
          {section.label}
        </text>
      )}
      
      {visibleSeats.map(seat => {
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
      })}
    </g>
  );
}, (prevProps, nextProps) => {
  // Deep comparison for performance
  return (
    prevProps.section.id === nextProps.section.id &&
    prevProps.zoomLevel === nextProps.zoomLevel &&
    prevProps.viewport.x === nextProps.viewport.x &&
    prevProps.viewport.y === nextProps.viewport.y &&
    prevProps.viewport.width === nextProps.viewport.width &&
    prevProps.viewport.height === nextProps.viewport.height
  );
});

Section.displayName = 'Section';