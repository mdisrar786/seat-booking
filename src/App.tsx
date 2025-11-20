import React from 'react';
import { Container } from 'react-bootstrap';
import { Header } from './components/Layout/Header';
import { SeatingMap } from './components/SeatingMap/SeatingMap';
import { LoadingSpinner } from './components/UI/LoadingSpinner';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { useSeatingData } from './hooks/useSeatingData';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';

function App() {
  const { venue, loading, error } = useSeatingData();

  console.log('App state:', { venue, loading, error }); // Debug log

  return (
    <div className="App">
      <Header venue={venue} />
      
      <main className="py-4">
        <Container fluid>
          <ErrorBoundary>
            {loading && <LoadingSpinner />}
            {error && (
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Error Loading Seating Map</h4>
                <p><strong>Error:</strong> {error}</p>
                <p className="mb-3">Please make sure the venue.json file exists in the public folder.</p>
                <button 
                  className="btn btn-primary me-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => console.log('Debug info:', { venue, loading, error })}
                >
                  Debug Info
                </button>
              </div>
            )}
            {venue && !loading && <SeatingMap venue={venue} />}
          </ErrorBoundary>
        </Container>
      </main>
    </div>
  );
}

export default App;