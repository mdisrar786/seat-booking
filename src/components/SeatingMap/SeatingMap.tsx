import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Container, Row, Col, Alert, Modal, Button } from 'react-bootstrap';
import type { Venue, Seat as SeatType } from '../../types';
import { Section } from './Section';
import { SelectionPanel } from './SelectionPanel';
import { CheckoutModal } from './CheckoutModal.tsx';
import { Tooltip } from '../UI/Tooltip';
import { Legend } from '../UI/Legend';
import { PerformanceStats } from '../UI/PerformanceStats';
import { useSeatSelection } from '../../hooks/useSeatSelection';

interface SeatingMapProps {
  venue: Venue;
}

// Enhanced throttle with requestAnimationFrame
const rafThrottle = (func: Function) => {
  let running = false;
  return (...args: any[]) => {
    if (!running) {
      running = true;
      requestAnimationFrame(() => {
        func(...args);
        running = false;
      });
    }
  };
};

// Smooth zoom levels with discrete steps
const ZOOM_LEVELS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0];

export const SeatingMap: React.FC<SeatingMapProps> = ({ venue }) => {
  const [zoomLevel, setZoomLevel] = useState(0.3);
  const [panning, setPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState({ content: '', x: 0, y: 0, visible: false });
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [renderedSeatsCount, setRenderedSeatsCount] = useState(0);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastZoomTime = useRef<number>(0);

  const {
    selectedSeats,
    selectSeat,
    deselectSeat,
    clearSelection,
    getSeatStatus,
    maxSelection
  } = useSeatSelection();

  // Calculate total seats
  const totalSeats = useMemo(() => {
    return venue.sections.reduce((total, section) => {
      return total + section.rows.reduce((sectionTotal, row) => {
        return sectionTotal + row.seats.length;
      }, 0);
    }, 0);
  }, [venue]);

  // Smooth zoom to discrete levels
  const zoomToLevel = useCallback((targetLevel: number) => {
    const now = Date.now();
    if (now - lastZoomTime.current < 16) return; // 60fps limit
    
    lastZoomTime.current = now;
    setZoomLevel(targetLevel);
  }, []);

  const handleZoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.findIndex(level => level === zoomLevel);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      zoomToLevel(ZOOM_LEVELS[currentIndex + 1]);
    }
  }, [zoomLevel, zoomToLevel]);

  const handleZoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.findIndex(level => level === zoomLevel);
    if (currentIndex > 0) {
      zoomToLevel(ZOOM_LEVELS[currentIndex - 1]);
    }
  }, [zoomLevel, zoomToLevel]);

  // Enhanced wheel zoom with momentum
  const handleWheel = useCallback(rafThrottle((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = -Math.sign(e.deltaY) * 0.1;
    const currentIndex = ZOOM_LEVELS.findIndex(level => level === zoomLevel);
    let newIndex = currentIndex + Math.sign(delta);
    
    newIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, newIndex));
    
    if (newIndex !== currentIndex) {
      zoomToLevel(ZOOM_LEVELS[newIndex]);
    }
  }), [zoomLevel, zoomToLevel]);

  // Enhanced panning with bounds
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setPanning(true);
      setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      setTooltip(prev => ({ ...prev, visible: false }));
      
      // Add global event listeners for smoother panning
      const handleMouseMove = rafThrottle((e: MouseEvent) => {
        if (!panning) return;
        
        const newX = e.clientX - startPan.x;
        const newY = e.clientY - startPan.y;
        
        // Calculate bounds to prevent panning too far
        const maxX = venue.map.width * (1 - 1/zoomLevel);
        const maxY = venue.map.height * (1 - 1/zoomLevel);
        
        setOffset({ 
          x: Math.max(-maxX, Math.min(0, newX)),
          y: Math.max(-maxY, Math.min(0, newY))
        });
      });

      const handleMouseUp = () => {
        setPanning(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }, [offset, panning, startPan, zoomLevel, venue.map]);

  const handleSeatHover = useCallback(rafThrottle((seat: SeatType, sectionLabel: string, price: number, x: number, y: number) => {
    setTooltip({
      content: `${seat.id} | ${sectionLabel} | $${price} | ${seat.status}`,
      x: x + 10,
      y: y - 10,
      visible: true
    });
  }), []);

  const handleSeatLeave = useCallback(rafThrottle(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }), []);

  const handleRenderedSeatsUpdate = useCallback((count: number) => {
    setRenderedSeatsCount(count);
  }, []);

  const handleCheckout = useCallback(() => {
    if (selectedSeats.length > 0) {
      setShowCheckout(true);
    }
  }, [selectedSeats]);

  const handleCloseCheckout = useCallback(() => {
    setShowCheckout(false);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    setShowCheckout(false);
    setShowSuccess(true);
    clearSelection();
  }, [clearSelection]);

  const handleCloseSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);

  const zoomPercentage = Math.round(zoomLevel * 100);
  const canZoomIn = zoomLevel < ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
  const canZoomOut = zoomLevel > ZOOM_LEVELS[0];

  // Optimized viewport calculation
  const viewport = useMemo(() => ({
    x: -offset.x / zoomLevel,
    y: -offset.y / zoomLevel,
    width: venue.map.width / zoomLevel,
    height: venue.map.height / zoomLevel
  }), [offset.x, offset.y, zoomLevel, venue.map.width, venue.map.height]);

  return (
    <Container fluid className="seating-map-container">
      <Row>
        <Col lg={8} xl={9} className="map-column">
          {/* Enhanced Zoom Controls */}
          <div className="map-controls-wrapper mb-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="zoom-controls-group">
                  <div className="d-flex align-items-center gap-1">
                    <button 
                      className="btn btn-outline-primary btn-sm zoom-btn"
                      onClick={handleZoomOut}
                      disabled={!canZoomOut}
                      title="Zoom Out"
                    >
                      <i className="bi bi-zoom-out"></i>
                    </button>
                    
                    <div className="zoom-level-display">
                      <div className="zoom-percentage fw-bold">{zoomPercentage}%</div>
                      <div className="zoom-slider">
                        <input
                          type="range"
                          min="0"
                          max={ZOOM_LEVELS.length - 1}
                          value={ZOOM_LEVELS.findIndex(level => level === zoomLevel)}
                          onChange={(e) => zoomToLevel(ZOOM_LEVELS[parseInt(e.target.value)])}
                          className="form-range"
                          style={{ width: '100px' }}
                        />
                      </div>
                    </div>
                    
                    <button 
                      className="btn btn-outline-primary btn-sm zoom-btn"
                      onClick={handleZoomIn}
                      disabled={!canZoomIn}
                      title="Zoom In"
                    >
                      <i className="bi bi-zoom-in"></i>
                    </button>
                  </div>
                </div>
                
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    zoomToLevel(0.3);
                    setOffset({ x: 0, y: 0 });
                  }}
                  title="Reset View"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>

                <div className="selection-info">
                  <span className="badge bg-primary">
                    {selectedSeats.length}/{maxSelection}
                  </span>
                </div>
              </div>

              <PerformanceStats 
                totalSeats={totalSeats}
                renderedSeats={renderedSeatsCount}
                zoomLevel={zoomLevel}
              />
            </div>
          </div>

          <Alert variant="info" className="mb-3 py-2">
            <div className="d-flex justify-content-between align-items-center">
              <small>
                <strong>🎯 Smooth Controls:</strong> Use slider or buttons for precise zoom • Drag to pan
              </small>
              <small className="text-muted">
                {renderedSeatsCount.toLocaleString()} seats visible
              </small>
            </div>
          </Alert>

          <div 
            ref={containerRef}
            className="svg-container"
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            style={{ 
              cursor: panning ? 'grabbing' : 'grab'
            }}
          >
            <svg
              ref={svgRef}
              width="100%"
              height="600"
              viewBox={`${offset.x} ${offset.y} ${viewport.width} ${viewport.height}`}
              className="seating-map-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Optimized stage area */}
              <rect
                x={venue.map.width * 0.3}
                y={venue.map.height - 80}
                width={venue.map.width * 0.4}
                height={60}
                fill="#17a2b8"
                opacity="0.9"
                rx="5"
              />
              <text
                x={venue.map.width / 2}
                y={venue.map.height - 45}
                textAnchor="middle"
                fill="white"
                fontSize="16"
                fontWeight="bold"
              >
                STAGE
              </text>
              
              {/* Optimized sections rendering */}
              {venue.sections.map(section => (
                <Section
                  key={section.id}
                  section={section}
                  getSeatStatus={getSeatStatus}
                  onSeatSelect={selectSeat}
                  onSeatHover={handleSeatHover}
                  onSeatLeave={handleSeatLeave}
                  onRenderedSeatsUpdate={handleRenderedSeatsUpdate}
                  zoomLevel={zoomLevel}
                  viewport={viewport}
                />
              ))}
            </svg>

            <Tooltip 
              content={tooltip.content}
              x={tooltip.x}
              y={tooltip.y}
              visible={tooltip.visible && !panning}
            />

            {renderedSeatsCount === 0 && totalSeats > 0 && (
              <div className="loading-overlay">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Rendering seats...</span>
                </div>
                <div className="mt-2">Optimizing view...</div>
              </div>
            )}
          </div>

          <div className="mt-3">
            <Legend />
          </div>
        </Col>
        
        <Col lg={4} xl={3}>
          <SelectionPanel
            selectedSeats={selectedSeats}
            onDeseat={deselectSeat}
            onClear={clearSelection}
            onCheckout={handleCheckout}
            maxSelection={maxSelection}
          />
        </Col>
      </Row>

      {/* Checkout Modal */}
      <CheckoutModal
        show={showCheckout}
        onHide={handleCloseCheckout}
        selectedSeats={selectedSeats}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Payment Success Modal */}
      <Modal show={showSuccess} onHide={handleCloseSuccess} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="w-100 text-center">
            <div className="success-icon">🎉</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <h4 className="text-success mb-3">Payment Successful!</h4>
          <p className="text-muted mb-4">
            Your tickets have been booked successfully. You will receive a confirmation email shortly.
          </p>
          
          <div className="booking-details mb-4">
            <h6 className="mb-3">Booking Summary</h6>
            {selectedSeats.map(seat => (
              <div key={seat.id} className="d-flex justify-content-between mb-2">
                <span>{seat.id}</span>
                <span className="fw-bold">${seat.price}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between fw-bold">
              <span>Total Paid:</span>
              <span>${selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button 
            variant="success" 
            onClick={handleCloseSuccess}
            className="px-4"
          >
            Continue Exploring
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};