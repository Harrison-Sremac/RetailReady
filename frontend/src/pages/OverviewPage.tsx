/**
 * Overview Page Component
 * 
 * Dashboard page with quick stats, upload functionality, and recent activity.
 * 
 * @fileoverview Main dashboard overview page
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { UploadZone } from '../components/UploadZone';
import { useApp } from '../contexts/AppContext';

/**
 * Overview Page Component
 * 
 * Provides a dashboard view with key metrics and quick access to main features.
 * 
 * @returns JSX element
 */
export function OverviewPage() {
  const { violations, loading, error, apiConnected, parsedRoutingGuideData, setParsedRoutingGuideData, refreshData } = useApp();

  // Handle successful file upload
  const handleUploadSuccess = async (data?: ParsedRoutingGuideData) => {
    try {
      if (data) {
        setParsedRoutingGuideData(data);
      }
      // Refresh violations data
      await refreshData();
    } catch (err) {
      console.error('Error refreshing data after upload:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome to RetailReady compliance management</p>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              apiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {apiConnected ? '✓ Backend Connected' : '✗ Backend Disconnected'}
            </span>
            <span className="text-sm text-gray-500">
              {violations.length} compliance requirements loaded
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">!</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Make sure the backend server is running on port 3001
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requirements</p>
                <p className="text-2xl font-bold text-gray-900">{violations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <div className="w-6 h-6 bg-red-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {violations.filter(v => v.severity === 'High').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {violations.filter(v => v.severity === 'Medium').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">
                  {violations.filter(v => v.severity === 'Low').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Compliance Guide</h2>
          <UploadZone onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Compliance requirements loaded</span>
              <span className="text-xs text-gray-500">Just now</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Risk assessment completed</span>
              <span className="text-xs text-gray-500">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Worker scan processed</span>
              <span className="text-xs text-gray-500">5 minutes ago</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/compliance" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                </div>
                <h3 className="font-medium text-gray-900">View Compliance</h3>
                <p className="text-sm text-gray-600">Browse requirements and violations</p>
              </div>
            </a>
            
            <a 
              href="/risk" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                </div>
                <h3 className="font-medium text-gray-900">Risk Management</h3>
                <p className="text-sm text-gray-600">Calculate and assess risks</p>
              </div>
            </a>
            
            <a 
              href="/workers" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                </div>
                <h3 className="font-medium text-gray-900">Worker Tools</h3>
                <p className="text-sm text-gray-600">Access worker interface</p>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
