/**
 * App Router Component
 * 
 * Simple routing system to switch between manager dashboard
 * and worker interface.
 * 
 * @fileoverview Simple routing for dual interface system
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useState } from 'react';
import RobustApp from './RobustApp';
import WorkerInterface from './WorkerInterface';

type ViewMode = 'manager' | 'worker';

/**
 * App Router Component
 * 
 * Provides simple routing between manager dashboard and worker interface.
 * 
 * @returns JSX element
 */
function AppRouter() {
  const [viewMode, setViewMode] = useState<ViewMode>('manager');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">RetailReady</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode('manager')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'manager'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Manager Dashboard
              </button>
              <button
                onClick={() => setViewMode('worker')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'worker'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Worker Interface
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Render appropriate interface */}
      {viewMode === 'manager' ? <RobustApp /> : <WorkerInterface />}
    </div>
  );
}

export default AppRouter;
