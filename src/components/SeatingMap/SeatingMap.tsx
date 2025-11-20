import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Container, Row, Col, Alert, Modal, Button } from 'react-bootstrap';
import type { Venue, Seat as SeatType } from '../../types';
import { Section } from './Section';
import { SelectionPanel } from './SelectionPanel';
import { CheckoutModal } from './CheckoutModal';
import { Tooltip } from '../UI/Tooltip';
import { Legend } from '../UI/Legend';
import { useSeatSelection } from '../../hooks/useSeatSelection';

interface SeatingMapProps {
  venue: Venue;
  loading: boolean;
}

export const SeatingMap: React.FC<SeatingMapProps> = ({ venue, loading }) => {
  // Set initial zoom to 100% (1.0)
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panning, setPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState({ content: '', x: 0, y: 0, visible: false });
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    selectedSeats,
    lastPaymentSeats,
    selectSeat,
    deselectSeat,
    clearSelection,
    recordPayment,
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

  // Enhanced zoom functionality
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.min(3, prev + 0.2);
      
      // Calculate center point for zoom
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Adjust offset to zoom towards center
        const zoomFactor = newZoom / prev;
        const newOffsetX = offset.x - (centerX * (zoomFactor - 1)) / zoomFactor;
        const newOffsetY = offset.y - (centerY * (zoomFactor - 1)) / zoomFactor;
        
        setOffset({ x: newOffsetX, y: newOffsetY });
      }
      
      return newZoom;
    });
  }, [offset]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.max(0.3, prev - 0.2);
      
      // Calculate center point for zoom
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Adjust offset to zoom towards center
        const zoomFactor = newZoom / prev;
        const newOffsetX = offset.x - (centerX * (zoomFactor - 1)) / zoomFactor;
        const newOffsetY = offset.y - (centerY * (zoomFactor - 1)) / zoomFactor;
        
        setOffset({ x: newOffsetX, y: newOffsetY });
      }
      
      return newZoom;
    });
  }, [offset]);

  // Mouse wheel zoom with center point
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = -e.deltaY * 0.002;
    const newZoom = Math.max(0.3, Math.min(3, zoomLevel + delta));
    
    if (newZoom !== zoomLevel) {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Zoom towards mouse position
        const zoomFactor = newZoom / zoomLevel;
        const newOffsetX = offset.x - (mouseX * (zoomFactor - 1)) / zoomFactor;
        const newOffsetY = offset.y - (mouseY * (zoomFactor - 1)) / zoomFactor;
        
        setOffset({ x: newOffsetX, y: newOffsetY });
      }
      
      setZoomLevel(newZoom);
    }
  }, [zoomLevel, offset]);

  // Enhanced panning with bounds
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setPanning(true);
      setIsDragging(true);
      setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!panning) return;
    
    const newX = e.clientX - startPan.x;
    const newY = e.clientY - startPan.y;
    
    // Calculate bounds to prevent panning outside the venue
    const maxX = 0;
    const minX = -(venue.map.width * (zoomLevel - 1));
    const maxY = 0;
    const minY = -(venue.map.height * (zoomLevel - 1));
    
    setOffset({ 
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  }, [panning, startPan, zoomLevel, venue.map]);

  const handleMouseUp = useCallback(() => {
    setPanning(false);
    setTimeout(() => setIsDragging(false), 100);
  }, []);

  const handleSeatHover = useCallback((seat: SeatType, sectionLabel: string, price: number, x: number, y: number) => {
    if (!panning) {
      setTooltip({
        content: `Seat: ${seat.id} | Section: ${sectionLabel} | Price: $${price}`,
        x: x + 10,
        y: y - 10,
        visible: true
      });
    }
  }, [panning]);

  const handleSeatLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
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
    recordPayment();
    setShowCheckout(false);
    setShowSuccess(true);
    clearSelection();
  }, [recordPayment, clearSelection]);

  const handleCloseSuccess = useCallback(() => {
    setShowSuccess(false);
  }, []);

  const handleResetView = useCallback(() => {
    setZoomLevel(1.0);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleFitToView = useCallback(() => {
    setZoomLevel(0.5);
    setOffset({ x: 0, y: 0 });
  }, []);

  const zoomPercentage = Math.round(zoomLevel * 100);

  // Calculate payment amounts
  const paymentSeats = lastPaymentSeats.length > 0 ? lastPaymentSeats : selectedSeats;
  const totalPrice = paymentSeats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceFee = paymentSeats.length * 2.5;
  const finalTotal = totalPrice + serviceFee;

  // Viewport for virtualization
  const viewport = useMemo(() => ({
    x: -offset.x / zoomLevel,
    y: -offset.y / zoomLevel,
    width: venue.map.width / zoomLevel,
    height: venue.map.height / zoomLevel
  }), [offset.x, offset.y, zoomLevel, venue.map]);

  if (loading) {
    return (
      <Container fluid className="seating-map-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-3">Loading seating map with {totalSeats.toLocaleString()} seats...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="seating-map-container">
      <Row>
        <Col lg={8} xl={9} className="map-column">
          {/* Enhanced Controls */}
          <div className="map-controls mb-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="zoom-controls d-flex align-items-center gap-1">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.3}
                  title="Zoom Out"
                >
                  −
                </button>
                <span className="fw-bold mx-2">{zoomPercentage}%</span>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  title="Zoom In"
                >
                  +
                </button>
              </div>
              
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={handleResetView}
                title="Reset to 100% Zoom"
              >
                100%
              </button>

              <button 
                className="btn btn-outline-info btn-sm"
                onClick={handleFitToView}
                title="Fit to View"
              >
                Fit View
              </button>

              <span className="ms-3 text-muted">
                {selectedSeats.length} / {maxSelection} selected
              </span>
              <span className="ms-3 text-muted">
                Total: {totalSeats.toLocaleString()} seats
              </span>
            </div>
          </div>

          <Alert variant="info" className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>🎯 Navigation Tips:</strong>
                <span className="ms-2">• Use +/- to zoom</span>
                <span className="ms-2">• Drag to explore different areas</span>
                <span className="ms-2">• Mouse wheel to zoom at cursor</span>
              </div>
              <small className="text-muted">
                Zoom: {zoomPercentage}%
              </small>
            </div>
          </Alert>

          {/* Enhanced SVG Container */}
          <div 
            ref={containerRef}
            className="svg-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ 
              cursor: panning ? 'grabbing' : (isDragging ? 'grab' : 'default')
            }}
          >
            <svg
              ref={svgRef}
              width="100%"
              height="600"
              viewBox={`${offset.x} ${offset.y} ${venue.map.width / zoomLevel} ${venue.map.height / zoomLevel}`}
              className="seating-map-svg"
              style={{
                cursor: panning ? 'grabbing' : 'grab'
              }}
            >
              {/* Stage */}
              <rect
                x={venue.map.width * 0.3}
                y={venue.map.height - 100}
                width={venue.map.width * 0.4}
                height={80}
                fill="#17a2b8"
                opacity="0.8"
                rx="10"
              />
              <text
                x={venue.map.width / 2}
                y={venue.map.height - 50}
                textAnchor="middle"
                fill="white"
                fontSize="20"
                fontWeight="bold"
              >
                STAGE
              </text>
              
              {/* Viewport indicator when zoomed in */}
              {zoomLevel > 1.2 && (
                <rect
                  x={-offset.x / zoomLevel}
                  y={-offset.y / zoomLevel}
                  width={viewport.width}
                  height={viewport.height}
                  fill="none"
                  stroke="#007bff"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.6"
                />
              )}
              
              {/* Sections */}
              {venue.sections.map(section => (
                <Section
                  key={section.id}
                  section={section}
                  getSeatStatus={getSeatStatus}
                  onSeatSelect={selectSeat}
                  onSeatHover={handleSeatHover}
                  onSeatLeave={handleSeatLeave}
                  zoomLevel={zoomLevel}
                  viewport={viewport}
                />
              ))}
            </svg>

            {/* Tooltip */}
            <Tooltip 
              content={tooltip.content}
              x={tooltip.x}
              y={tooltip.y}
              visible={tooltip.visible && !panning}
            />

            {/* Zoom level indicator */}
            {zoomLevel > 1.5 && (
              <div className="position-absolute top-0 end-0 m-3">
                <div className="bg-dark text-white px-3 py-2 rounded shadow">
                  <small>
                    <strong>Exploring:</strong> {Math.round(viewport.width)} × {Math.round(viewport.height)} area
                  </small>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3">
            <Legend />
          </div>
        </Col>
        
        {/* Selection Panel */}
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

      {/* Success Modal */}
      <Modal show={showSuccess} onHide={handleCloseSuccess} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="w-100 text-center text-success">
            <div className="success-icon mb-3">🎉</div>
            Payment Successful!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p className="text-muted mb-4">
            Your tickets have been booked successfully. You will receive a confirmation email shortly.
          </p>
          
          <div className="booking-summary bg-light p-4 rounded">
            <h6 className="fw-bold mb-3">Payment Summary</h6>
            
            {/* Individual Seats */}
            {paymentSeats.map(seat => (
              <div key={seat.id} className="d-flex justify-content-between mb-2">
                <span>{seat.id} - {seat.section}</span>
                <span>${seat.price}</span>
              </div>
            ))}
            
            {/* Service Fee */}
            <div className="d-flex justify-content-between text-muted mb-2">
              <span>Service Fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            
            <hr />
            
            {/* Total Paid Amount - Highlighted */}
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total Paid:</span>
              <span className="text-success">
                ${finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-success bg-opacity-10 rounded">
            <small className="text-success">
              <i className="bi bi-check-circle-fill me-2"></i>
              Payment of <strong>${finalTotal.toFixed(2)}</strong> completed successfully
            </small>
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