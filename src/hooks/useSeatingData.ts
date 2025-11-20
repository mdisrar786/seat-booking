import { useState, useEffect } from 'react';
import type { Venue, Section, Row, Seat } from '../types';
import venueData from '../../public/venue.json';

const generateSeatsForSection = (section: Section): Section => {
  const sectionConfigs: { [key: string]: { rows: number; seatsPerRow: number; priceTier: number } } = {
    'LB-A': { rows: 50, seatsPerRow: 100, priceTier: 2 },
    'LB-B': { rows: 50, seatsPerRow: 100, priceTier: 2 },
    'LB-C': { rows: 50, seatsPerRow: 100, priceTier: 2 },
    'UB-A': { rows: 40, seatsPerRow: 80, priceTier: 3 },
    'UB-B': { rows: 40, seatsPerRow: 80, priceTier: 3 }
  };

  const config = sectionConfigs[section.id] || { rows: 30, seatsPerRow: 50, priceTier: 3 };
  const rows: Row[] = [];

  for (let rowIndex = 1; rowIndex <= config.rows; rowIndex++) {
    const seats: Seat[] = [];
    
    for (let seatNum = 1; seatNum <= config.seatsPerRow; seatNum++) {
      const random = Math.random();
      let status: 'available' | 'reserved' | 'unavailable' = 'available';
      if (random > 0.85) status = 'reserved';
      else if (random > 0.75) status = 'unavailable';

      const seat: Seat = {
        id: `${section.id}-${rowIndex}-${seatNum.toString().padStart(3, '0')}`,
        col: seatNum,
        x: section.transform.x + (seatNum * 15),
        y: section.transform.y + (rowIndex * 20),
        priceTier: config.priceTier,
        status: status
      };

      seats.push(seat);
    }

    rows.push({ index: rowIndex, seats });
  }

  return { ...section, rows };
};

export const useSeatingData = () => {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateVenueData = () => {
      try {
        setLoading(true);
        
        // Generate seats for each section
        const sectionsWithSeats = venueData.sections.map(generateSeatsForSection);
        
        const generatedVenue: Venue = {
          ...venueData,
          sections: sectionsWithSeats
        };

        // Calculate total seats
        const totalSeats = sectionsWithSeats.reduce((total, section) => 
          total + section.rows.reduce((sectionTotal, row) => 
            sectionTotal + row.seats.length, 0), 0);

        console.log(`✅ Generated ${totalSeats.toLocaleString()} seats`);
        
        setVenue(generatedVenue);
        setLoading(false);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate seating data');
        setLoading(false);
      }
    };

    // Small delay to show loading state
    setTimeout(generateVenueData, 500);
  }, []);

  return { venue, loading, error };
};