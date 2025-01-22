import React from 'react';
import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import HomeScreen from './components/HomeScreen'; // Import your HomeScreen component
import CreateSample from './components/CreateSample'; // Import your CreateSample component
import Share from './components/Share'; // Import your Share component
import './App.css';

function App() {
  return (
    <Router>
      <header className="page-header">
        <div className="header-logo">
          <h2>
            {/* Use a Link to route to the HomeScreen */}
            <Link to="/" className="header-icon-link">SongTrax</Link>
          </h2>
        </div>
        <div className="header-app-description">
          <span>Create & Share Location Based Music Samples!</span>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/createsample" element={<CreateSample />} />
          <Route
            path="/share/:id" // Use a URL parameter named "id"
            element={<Share />} // Pass the "id" parameter to the Share component
          />
        </Routes>
      </main>
      <footer className="page-footer"></footer>
    </Router>
  );
}

export default App;
