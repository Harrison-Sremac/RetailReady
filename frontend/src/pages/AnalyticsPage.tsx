/**
 * Analytics Page Component
 * 
 * Page for analytics, routing guide analysis, and statistics.
 * 
 * @fileoverview Analytics and statistics page
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { RoutingGuideViewer } from '../components/RoutingGuideViewer';
import { useApp } from '../contexts/AppContext';

/**
 * Analytics Page Component
 * 
 * Provides comprehensive analytics and routing guide analysis.
 * 
 * @returns JSX element
 */
export function AnalyticsPage() {
  const { violations, loading, error, apiConnected, parsedRoutingGuideData } = useApp();

  // Get unique values for analytics
  const categories = useMemo(() => [...new Set(violations.map(v => v.category))], [violations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Analytics</h2>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
          <p className="text-gray-600">Comprehensive analytics and routing guide analysis</p>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              apiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {apiConnected ? '✓ Backend Connected' : '✗ Backend Disconnected'}
            </span>
            <span className="text-sm text-gray-500">
              {violations.length} compliance requirements analyzed
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

        {/* Routing Guide Analysis */}
        {(parsedRoutingGuideData || (violations.length > 0 && violations.some(v => v.retailer === 'Uploaded Document'))) && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Routing Guide Analysis</h2>
            {parsedRoutingGuideData ? (
              <RoutingGuideViewer parsedData={parsedRoutingGuideData} />
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  </div>
                  <h3 className="text-lg font-medium text-blue-900">Routing Guide Data Available</h3>
                </div>
                <p className="text-blue-700 mb-4">
                  Upload a routing guide PDF to see detailed analysis including order types, carton specifications, 
                  label placement rules, and product requirements.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Order Types</h4>
                    <p className="text-sm text-blue-700">Bulk Orders, Pack by Store, Direct to Store</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Carton Specs</h4>
                    <p className="text-sm text-blue-700">Conveyable dimensions and weight limits</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Label Placement</h4>
                    <p className="text-sm text-blue-700">2 inches from bottom/right edge</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compliance Statistics */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Compliance Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Risk Distribution</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High Risk</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(violations.filter(v => v.severity === 'High').length / violations.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      {violations.filter(v => v.severity === 'High').length}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Medium Risk</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${(violations.filter(v => v.severity === 'Medium').length / violations.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-yellow-600">
                      {violations.filter(v => v.severity === 'Medium').length}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Low Risk</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(violations.filter(v => v.severity === 'Low').length / violations.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {violations.filter(v => v.severity === 'Low').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Category Breakdown</h3>
              <div className="space-y-2">
                {categories.slice(0, 5).map(category => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{category}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {violations.filter(v => v.category === category).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {violations.length}
              </div>
              <div className="text-sm text-blue-800">Total Requirements</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {categories.length}
              </div>
              <div className="text-sm text-green-800">Categories</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {violations.filter(v => v.severity === 'High').length}
              </div>
              <div className="text-sm text-purple-800">High Priority</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
