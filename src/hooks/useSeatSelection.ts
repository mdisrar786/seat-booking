import { useState, useCallback, useEffect } from 'react';
import type { SelectedSeat, Seat, SeatStatus } from '../types';

const MAX_SELECTION = 8;

// Debounce function for performance
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useSeatSelection = () => {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedSeats');
    if (saved) {
      try {
        setSelectedSeats(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved seats:', error);
      }
    }
  }, []);

  // Debounced save to localStorage
  useEffect(() => {
    const saveToStorage = debounce(() => {
      localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    }, 500);

    saveToStorage();
  }, [selectedSeats]);

  const selectSeat = useCallback((seat: Seat, sectionLabel: string, price: number) => {
    setSelectedSeats(current => {
      // Check if already selected
      const existingIndex = current.findIndex(s => s.id === seat.id);
      if (existingIndex > -1) {
        return current.filter(s => s.id !== seat.id);
      }

      // Check max selection limit
      if (current.length >= MAX_SELECTION) {
        alert(`You can only select up to ${MAX_SELECTION} seats`);
        return current;
      }

      const newSeat: SelectedSeat = {
        id: seat.id,
        section: sectionLabel,
        row: Math.floor(seat.col / 100),
        col: seat.col,
        price,
        priceTier: seat.priceTier,
        x: seat.x,
        y: seat.y
      };

      return [...current, newSeat];
    });
  }, []);

  const deselectSeat = useCallback((seatId: string) => {
    setSelectedSeats(current => current.filter(seat => seat.id !== seatId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  const isSeatSelected = useCallback((seatId: string) => {
    return selectedSeats.some(seat => seat.id === seatId);
  }, [selectedSeats]);

  const getSeatStatus = useCallback((seat: Seat, sectionLabel: string, price: number): SeatStatus => {
    if (seat.status !== 'available') return seat.status;
    return isSeatSelected(seat.id) ? 'selected' : 'available';
  }, [isSeatSelected]);

  return {
    selectedSeats,
    selectSeat,
    deselectSeat,
    clearSelection,
    isSeatSelected,
    getSeatStatus,
    maxSelection: MAX_SELECTION
  };
};