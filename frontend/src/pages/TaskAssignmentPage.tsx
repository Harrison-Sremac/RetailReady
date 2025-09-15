/**
 * Task Assignment Page
 * 
 * This page showcases the task-level worker assignment system for Dick's Sporting Goods
 * compliance optimization. It provides a comprehensive interface for breaking down orders
 * into compliance-critical tasks and optimizing worker assignments.
 * 
 * @fileoverview Task assignment page for compliance optimization
 * @author RetailReady Team
 * @version 1.0.0
 */

import TaskAssignmentSystem from '../components/TaskAssignmentSystem';

/**
 * Task Assignment Page Component
 * 
 * Provides the main interface for task-level worker assignment optimization.
 * This page demonstrates how RetailReady solves the real problem of granular,
 * task-level compliance optimization rather than abstract risk calculations.
 * 
 * @returns JSX element
 */
function TaskAssignmentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TaskAssignmentSystem />
    </div>
  );
}

export default TaskAssignmentPage;
