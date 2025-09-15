/**
 * Main Application Component (Multi-Page)
 * 
 * This is the main application component with React Router for multi-page navigation.
 * 
 * @fileoverview Multi-page application with routing
 * @author RetailReady Team
 * @version 1.0.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { OverviewPage } from './pages/OverviewPage';
import { CompliancePage } from './pages/CompliancePage';
import { RiskPage } from './pages/RiskPage';
import { WorkersPage } from './pages/WorkersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

/**
 * Main Application Component
 * 
 * Multi-page application with React Router navigation.
 * 
 * @returns JSX element
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
