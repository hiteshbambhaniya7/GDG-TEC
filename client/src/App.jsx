import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DemoBanner } from './components/common/DemoBanner';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { HomePage } from './pages/HomePage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { TrackIssuePage } from './pages/TrackIssuePage';
import { CivicMapPage } from './pages/CivicMapPage';
import { PublicFeedPage } from './pages/PublicFeedPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';

// Phase 2: Citizen Reporting Experience Pages
import { CitizenDashboardPage } from './pages/citizen/CitizenDashboardPage';
import { CitizenReportPage } from './pages/citizen/CitizenReportPage';
import { CitizenReportsListPage } from './pages/citizen/CitizenReportsListPage';
import { CitizenReportDetailsPage } from './pages/citizen/CitizenReportDetailsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <DemoBanner />
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Home & General Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/map" element={<CivicMapPage />} />
              <Route path="/feed" element={<PublicFeedPage />} />
              <Route path="/admin" element={<AdminDashboard />} />

              {/* Citizen Reporting Routes */}
              <Route path="/citizen" element={<CitizenDashboardPage />} />
              <Route path="/citizen/report" element={<CitizenReportPage />} />
              <Route path="/citizen/reports" element={<CitizenReportsListPage />} />
              <Route path="/citizen/reports/:id" element={<CitizenReportDetailsPage />} />

              {/* General / Legacy Route Aliases */}
              <Route path="/report" element={<CitizenReportPage />} />
              <Route path="/track" element={<TrackIssuePage />} />
              <Route path="/track/:trackingId" element={<CitizenReportDetailsPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
