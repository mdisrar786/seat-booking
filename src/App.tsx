import React from 'react';
import { Container } from 'react-bootstrap';
import { Header } from './components/Layout/Header';
import { SeatingMap } from './components/SeatingMap/SeatingMap';
import { useSeatingData } from './hooks/useSeatingData';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

function App() {
  const { venue, loading, error } = useSeatingData();

  return (
    <div className="App">
      <Header venue={venue} />
      
      <main className="py-4">
        <Container fluid>
          {error && (
            <div className="alert alert-danger">
              <h4>Error Loading Seating Map</h4>
              <p>{error}</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}
          {venue && <SeatingMap venue={venue} loading={loading} />}
        </Container>
      </main>
    </div>
  );
}

export default App;