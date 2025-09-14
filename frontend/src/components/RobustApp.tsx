import React, { useState, useEffect } from 'react';
import { Violation, Filters } from '../types';
import { violationsApi } from '../utils/api';

/**
 * Robust App Component with Error Boundaries
 * This version handles API errors gracefully and provides fallbacks
 */
function RobustApp() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState(false);

  // Test API connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await violationsApi.getAll({});
        if (response.success) {
          setApiConnected(true);
          setViolations(response.data || []);
        } else {
          setError('API returned an error');
        }
      } catch (err) {
        console.error('API connection failed:', err);
        setError('Cannot connect to backend API');
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading RetailReady</h2>
          <p className="text-gray-600">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RetailReady</h1>
          <p className="text-gray-600">AI-powered compliance management and risk assessment platform</p>
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
                <span className="text-red-400">⚠️</span>
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

        {/* Step 1: Upload Compliance Guide */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <h2 className="text-xl font-semibold">Upload Compliance Guide</h2>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-2">📄</div>
              <p className="text-gray-600 mb-2">Upload PDF compliance documents</p>
              <p className="text-sm text-gray-500">PDF parsing feature will be available here</p>
            </div>
          </div>
        </section>

        {/* Step 2: Filter & Explore */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <h2 className="text-xl font-semibold">Filter & Explore</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>All Categories</option>
                      <option>Labeling</option>
                      <option>Packaging</option>
                      <option>ASN</option>
                      <option>Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>All Severities</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retailer</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>All Retailers</option>
                      <option>Dick's Sporting Goods</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Requirements:</span>
                      <span className="font-medium">{violations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">High Risk:</span>
                      <span className="font-medium text-red-600">
                        {violations.filter(v => v.severity === 'High').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medium Risk:</span>
                      <span className="font-medium text-yellow-600">
                        {violations.filter(v => v.severity === 'Medium').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Low Risk:</span>
                      <span className="font-medium text-green-600">
                        {violations.filter(v => v.severity === 'Low').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Risk Assessment Calculator */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <h2 className="text-xl font-semibold">Risk Assessment Calculator</h2>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800">Risk calculation tools will be available here</p>
            </div>
          </div>
        </section>

        {/* Step 4: Top Risk Areas */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">4</span>
              </div>
              <h2 className="text-xl font-semibold">Top Risk Areas</h2>
            </div>
            
            {violations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {violations
                  .filter(v => v.severity === 'High')
                  .slice(0, 6)
                  .map((violation, index) => (
                    <div key={violation.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-red-600 font-semibold text-sm mr-2">
                              #{index + 1} Risk:
                            </span>
                            <span className="text-red-800 font-medium">{violation.category}</span>
                          </div>
                          <p className="text-sm text-red-700 mb-1">{violation.requirement}</p>
                          <p className="text-sm font-medium text-red-800">{violation.fine}</p>
                        </div>
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                          High
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No violations loaded</p>
                <p className="text-sm mt-2">Check your backend connection</p>
              </div>
            )}
          </div>
        </section>

        {/* Step 5: Review Requirements */}
        <section>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">5</span>
              </div>
              <h2 className="text-xl font-semibold">Review Requirements</h2>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Compliance Requirements</h3>
              <span className="text-sm text-gray-500">
                {violations.length} requirements
              </span>
            </div>
            
            {violations.length > 0 ? (
              <div className="space-y-3">
                {violations.slice(0, 10).map((violation) => (
                  <div key={violation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">
                            {violation.category}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            violation.severity === 'High' ? 'bg-red-100 text-red-800' :
                            violation.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {violation.severity}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{violation.requirement}</p>
                        <p className="text-sm text-gray-600 mb-1">{violation.violation}</p>
                        <p className="text-sm font-medium text-red-600">{violation.fine}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {violations.length > 10 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Showing first 10 of {violations.length} requirements
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No compliance requirements available</p>
                <p className="text-sm mt-2">Check your backend connection and try refreshing</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default RobustApp;
