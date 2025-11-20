import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, ListGroup, Alert } from 'react-bootstrap';
import type { SelectedSeat } from '../../types';

interface CheckoutModalProps {
  show: boolean;
  onHide: () => void;
  selectedSeats: SelectedSeat[];
  onPaymentSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  show,
  onHide,
  selectedSeats,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceFee = selectedSeats.length * 2.5;
  const finalTotal = totalPrice + serviceFee;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing with better UX
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(); // This will trigger the success modal
    }, 2000);
  };

  const isFormValid = () => {
    if (paymentMethod === 'card') {
      return cardNumber.length === 16 && expiry.length === 5 && cvv.length === 3 && name && email;
    }
    return name && email;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(value);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setExpiry(value.slice(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, '').slice(0, 3));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Complete Your Booking</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handlePayment}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h6 className="fw-bold mb-3">Order Summary</h6>
              <ListGroup variant="flush" className="mb-3">
                {selectedSeats.map(seat => (
                  <ListGroup.Item key={seat.id} className="px-0 py-2">
                    <div className="d-flex justify-content-between">
                      <span className="fw-medium">{seat.id}</span>
                      <span>${seat.price}</span>
                    </div>
                    <small className="text-muted">{seat.section}</small>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item className="px-0 py-2">
                  <div className="d-flex justify-content-between text-muted">
                    <span>Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 py-2 fw-bold border-top">
                  <div className="d-flex justify-content-between">
                    <span>Total Amount</span>
                    <span className="text-primary">${finalTotal.toFixed(2)}</span>
                  </div>
                </ListGroup.Item>
              </ListGroup>

              <Alert variant="success" className="small">
                <strong>Great choice!</strong> You've selected {selectedSeats.length} premium seat{selectedSeats.length > 1 ? 's' : ''}.
              </Alert>
            </Col>

            <Col md={6}>
              <h6 className="fw-bold mb-3">Payment Details</h6>
              
              <Form.Group className="mb-3">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="card">💳 Credit/Debit Card</option>
                  <option value="paypal">💰 PayPal</option>
                  <option value="wallet">📱 Digital Wallet</option>
                </Form.Select>
              </Form.Group>

              {paymentMethod === 'card' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Card Number *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={16}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Expiry Date *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>CVV *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="123"
                          value={cvv}
                          onChange={handleCvvChange}
                          maxLength={3}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              )}

              {paymentMethod === 'paypal' && (
                <Alert variant="info" className="small">
                  You will be redirected to PayPal to complete your payment securely.
                </Alert>
              )}

              {paymentMethod === 'wallet' && (
                <Alert variant="info" className="small">
                  Digital wallet payment will be processed through our secure gateway.
                </Alert>
              )}
            </Col>
          </Row>
        </Modal.Body>
        
        <Modal.Footer className="border-top">
          <Button variant="outline-secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={!isFormValid() || isProcessing}
            className="px-4"
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Processing...
              </>
            ) : (
              `Pay $${finalTotal.toFixed(2)}`
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};