import React from 'react';
import { Card } from 'react-bootstrap';

interface PerformanceStatsProps {
  totalSeats: number;
  renderedSeats: number;
  zoomLevel: number;
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({
  totalSeats,
  renderedSeats,
  zoomLevel
}) => {
  const renderRatio = ((renderedSeats / totalSeats) * 100).toFixed(1);

  return (
    <Card className="performance-stats">
      <Card.Body className="py-2">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">Performance</small>
          <div className="d-flex gap-3">
            <small>
              <span className="fw-medium">{renderedSeats.toLocaleString()}</span>
              <span className="text-muted">/{totalSeats.toLocaleString()} seats</span>
            </small>
            <small>
              <span className="fw-medium">{renderRatio}%</span>
              <span className="text-muted"> rendered</span>
            </small>
            <small>
              <span className="fw-medium">{zoomLevel.toFixed(1)}x</span>
              <span className="text-muted"> zoom</span>
            </small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};