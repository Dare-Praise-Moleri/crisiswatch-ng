// ─────────────────────────────────────────────────────────
//  App.jsx  —  CrisisWatch Lagos  (complete, all routes)
// ─────────────────────────────────────────────────────────
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Theme must wrap everything
import { ThemeProvider } from './context/ThemeContext';

// Layout
import Navbar          from './components/Navbar';
import ToastContainer  from './components/ToastNotification';

// Pages
import HomePage        from './pages/HomePage';
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import ReportPage      from './pages/ReportPage';
import IncidentsPage   from './pages/IncidentsPage';
import MapPage         from './pages/MapPage';
import AlertsPage      from './pages/AlertsPage';
import ProfilePage     from './pages/ProfilePage';
import AboutPage       from './pages/AboutPage';
import SettingsPage    from './pages/SettingsPage';
import NLPPage         from './pages/NLPPage';
import AnalyticsPage   from './pages/AnalyticsPage';   // NEW
import ResponderPage   from './pages/ResponderPage';   // NEW

export default function App() {
  return (
    <ThemeProvider>                          {/* ← must be outermost */}
      <Router>
        <Navbar />

        <Routes>
          {/* Public */}
          <Route path="/"           element={<HomePage />}      />
          <Route path="/login"      element={<LoginPage />}     />
          <Route path="/about"      element={<AboutPage />}     />

          {/* Core features */}
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/report"     element={<ReportPage />}    />
          <Route path="/incidents"  element={<IncidentsPage />} />
          <Route path="/map"        element={<MapPage />}       />
          <Route path="/alerts"     element={<AlertsPage />}    />

          {/* Analytics — standalone page */}
          <Route path="/analytics"  element={<AnalyticsPage />} />

          {/* Responder center management */}
          <Route path="/responder"  element={<ResponderPage />} />

          {/* NLP lab */}
          <Route path="/nlp"        element={<NLPPage />}       />

          {/* User */}
          <Route path="/profile"    element={<ProfilePage />}   />
          <Route path="/settings"   element={<SettingsPage />}  />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Global toast overlay — must be inside ThemeProvider */}
        <ToastContainer />
      </Router>
    </ThemeProvider>
  );
}
