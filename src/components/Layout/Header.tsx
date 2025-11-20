import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
// import type { Venue } from '../../types';
// In Header.tsx and other components
import type { Venue } from '../../types/index.ts';

interface HeaderProps {
  venue: Venue | null;
}

export const Header: React.FC<HeaderProps> = ({ venue }) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand>
          {venue ? venue.name : 'Event Seating Map'}
        </Navbar.Brand>
        <Navbar.Text>
          Interactive Seating Map
        </Navbar.Text>
      </Container>
    </Navbar>
  );
};