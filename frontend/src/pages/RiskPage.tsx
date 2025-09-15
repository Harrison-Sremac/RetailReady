/**
 * Risk Management Page Component
 * 
 * Page for risk assessment, calculation, and overview features.
 * 
 * @fileoverview Risk management and assessment page
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { Violation } from '../types';
import { violationsApi } from '../utils/api';
import { RiskCalculator } from '../components/RiskCalculator';
import { RiskOverviewDemo } from '../components/RiskOverviewDemo';

/**
 * Risk Management Page Component
 * 
 * Provides comprehensive risk assessment tools and overview features.
 * 
 * @returns JSX element
 */
export function RiskPage() {
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Risk Tools</h2>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Management</h1>
          <p className="text-gray-600">Assess and predict compliance risks with advanced tools</p>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              apiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {apiConnected ? '✓ Backend Connected' : '✗ Backend Disconnected'}
            </span>
            <span className="text-sm text-gray-500">
              {violations.length} violations available for assessment
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

        {/* Risk Calculator */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Risk Assessment Calculator</h2>
          <RiskCalculator violations={violations} />
        </div>

        {/* Risk Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <RiskOverviewDemo />
        </div>

        {/* Top Risk Areas */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Top Risk Areas</h2>
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
              <p>No high-risk violations found</p>
              <p className="text-sm mt-2">Try adjusting your filters or upload more data</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
