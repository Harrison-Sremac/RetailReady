/**
 * Workers Page Component
 * 
 * Page for worker tools and interface.
 * 
 * @fileoverview Worker tools and interface page
 * @author RetailReady Team
 * @version 1.0.0
 */

import WorkerInterface from '../components/WorkerInterface';

/**
 * Workers Page Component
 * 
 * Provides access to worker tools and interface.
 * 
 * @returns JSX element
 */
export function WorkersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker Tools</h1>
          <p className="text-gray-600">Mobile-first interface for warehouse workers</p>
        </div>

        {/* Worker Interface */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <WorkerInterface />
        </div>
      </main>
    </div>
  );
}
