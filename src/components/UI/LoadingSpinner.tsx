import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

export const LoadingSpinner: React.FC = () => {
  return (
    <Container className="text-center py-5">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading seating map...</span>
      </Spinner>
      <div className="mt-3">Loading seating map...</div>
    </Container>
  );
};