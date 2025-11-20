import React from 'react';
import { Card, ListGroup, Button, Badge } from 'react-bootstrap';
import type { SelectedSeat } from '../../types';

interface SelectionPanelProps {
  selectedSeats: SelectedSeat[];
  onDeseat: (seatId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  maxSelection: number;
}

export const SelectionPanel: React.FC<SelectionPanelProps> = ({
  selectedSeats,
  onDeseat,
  onClear,
  onCheckout,
  maxSelection
}) => {
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceFee = selectedSeats.length * 2.5;
  const finalTotal = totalPrice + serviceFee;

  return (
    <Card className="selection-panel">
      <Card.Header>
        <h5 className="mb-0">
          Selected Seats 
          <Badge bg="primary" className="ms-2">
            {selectedSeats.length} / {maxSelection}
          </Badge>
        </h5>
      </Card.Header>
      
      <Card.Body className="p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {selectedSeats.length === 0 ? (
          <div className="text-center p-4 text-muted">
            No seats selected yet
            <div className="mt-2 small">
              Click on available seats to select them
            </div>
          </div>
        ) : (
          <ListGroup variant="flush">
            {selectedSeats.map(seat => (
              <ListGroup.Item
                key={seat.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-bold">{seat.id}</div>
                  <small className="text-muted">
                    {seat.section} • ${seat.price}
                  </small>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDeseat(seat.id)}
                  aria-label={`Remove seat ${seat.id}`}
                >
                  ×
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
      
      {selectedSeats.length > 0 && (
        <Card.Body className="border-top">
          <div className="d-flex justify-content-between mb-1">
            <span>Subtotal:</span>
            <span>${totalPrice}</span>
          </div>
          <div className="d-flex justify-content-between mb-2 text-muted">
            <span>Service Fee:</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between fw-bold border-top pt-2">
            <span>Total Amount:</span>
            <span className="text-primary">${finalTotal.toFixed(2)}</span>
          </div>
        </Card.Body>
      )}
      
      <Card.Footer>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <strong>{selectedSeats.length} seats selected</strong>
          {selectedSeats.length > 0 && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onClear}
            >
              Clear All
            </Button>
          )}
        </div>
        
        <Button
          variant="primary"
          disabled={selectedSeats.length === 0}
          className="w-100"
          onClick={onCheckout}
        >
          {selectedSeats.length > 0 ? `Pay $${finalTotal.toFixed(2)}` : 'Proceed to Checkout'}
        </Button>
        
        {selectedSeats.length > 0 && (
          <div className="mt-2 text-center">
            <small className="text-muted">
              {maxSelection - selectedSeats.length} seats remaining
            </small>
          </div>
        )}
      </Card.Footer>
    </Card>
  );
};