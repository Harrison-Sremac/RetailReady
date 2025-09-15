/**
 * Worker Management Page
 * 
 * This page provides a comprehensive worker management dashboard for
 * tracking performance, violations, and scheduling interventions.
 * 
 * @fileoverview Worker management page for performance tracking and intervention
 * @author RetailReady Team
 * @version 1.0.0
 */

import WorkerManagementDashboard from '../components/WorkerManagementDashboard';

/**
 * Worker Management Page Component
 * 
 * Provides the main interface for worker performance management,
 * violation tracking, and intervention scheduling.
 * 
 * @returns JSX element
 */
function WorkerManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <WorkerManagementDashboard className="pt-6" />
    </div>
  );
}

export default WorkerManagementPage;
