import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './services/api';
import NLPPage from './pages/NLPPage';

const Protected = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
};

import Navbar from './components/Navbar';

import HomePage     from './pages/HomePage';
import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MapPage      from './pages/MapPage';
import ReportPage   from './pages/ReportPage';
import IncidentsPage from './pages/IncidentsPage';
import AlertsPage   from './pages/AlertsPage';
import ProfilePage  from './pages/ProfilePage';
import AboutPage    from './pages/AboutPage';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0d1526] text-white">
        <Navbar />
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/map"       element={<Protected><MapPage /></Protected>} />
          <Route path="/report"    element={<Protected><ReportPage /></Protected>} />
          <Route path="/incidents" element={<Protected><IncidentsPage /></Protected>} />
          <Route path="/alerts"    element={<Protected><AlertsPage /></Protected>} />
          <Route path="/profile"   element={<Protected><ProfilePage /></Protected>} />
          <Route path="/about"     element={<Protected><AboutPage /></Protected>} />
          <Route path="/nlp" element={<Protected><NLPPage /></Protected>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;