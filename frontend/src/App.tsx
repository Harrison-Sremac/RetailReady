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
import { AppProvider } from './contexts/AppContext';
import { Navigation } from './components/Navigation';
import { OverviewPage } from './pages/OverviewPage';
import { CompliancePage } from './pages/CompliancePage';
import { RiskPage } from './pages/RiskPage';
import { WorkersPage } from './pages/WorkersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import TaskAssignmentPage from './pages/TaskAssignmentPage';
import WorkerManagementPage from './pages/WorkerManagementPage';

/**
 * Main Application Component
 * 
 * Multi-page application with React Router navigation.
 * 
 * @returns JSX element
 */
function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/worker-management" element={<WorkerManagementPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/task-assignment" element={<TaskAssignmentPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
