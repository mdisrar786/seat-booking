import React from 'react';
import { Card } from 'react-bootstrap';
import { getSeatColor } from '../../utils/seatUtils';

export const Legend: React.FC = () => {
  const legendItems = [
    { status: 'available', label: 'Available', description: 'Click to select' },
    { status: 'selected', label: 'Selected', description: 'Your chosen seats' },
    { status: 'reserved', label: 'Reserved', description: 'Already booked' },
    { status: 'unavailable', label: 'Unavailable', description: 'Not for sale' }
  ];

  return (
    <Card className="legend-card">
      <Card.Header className="py-2">
        <small className="fw-bold">SEAT STATUS</small>
      </Card.Header>
      <Card.Body className="py-2">
        <div className="d-flex flex-wrap gap-3">
          {legendItems.map(item => (
            <div key={item.status} className="d-flex align-items-center gap-2">
              <div 
                className="legend-color"
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: getSeatColor(item.status as any),
                  border: '1px solid #fff',
                  flexShrink: 0
                }}
              />
              <div>
                <div className="small fw-medium">{item.label}</div>
                <div className="extra-small text-muted">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};