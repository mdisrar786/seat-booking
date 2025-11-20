export const getSeatAriaLabel = (
  seatId: string, 
  status: string, 
  section: string, 
  price: number
): string => {
  return `${section}, Seat ${seatId}, ${status}, $${price}. Click to select.`;
};

export const handleKeyboardSeatSelection = (
  event: React.KeyboardEvent,
  onSelect: () => void
) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onSelect();
  }
};