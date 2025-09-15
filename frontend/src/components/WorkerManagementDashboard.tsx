/**
 * Worker Management Dashboard Component
 * 
 * This component provides a comprehensive dashboard for managing workers,
 * tracking their performance, violations, and identifying workers who need intervention.
 * 
 * @fileoverview Worker management dashboard for performance tracking and intervention
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

interface WorkerViolation {
  violation_type: string;
  violation_count: number;
  total_fines: number;
}

interface WorkerPerformance {
  worker_id: string;
  name: string;
  department: string;
  total_scans: number;
  successful_scans: number;
  accuracy_rate: number;
  total_fines_incurred: number;
  total_fines_saved: number;
  violations: WorkerViolation[];
  last_scan_date: string;
  intervention_needed: boolean;
  risk_level: 'Low' | 'Medium' | 'High';
}

interface WorkerManagementDashboardProps {
  className?: string;
}

/**
 * Worker Management Dashboard Component
 * 
 * Provides a comprehensive view of all workers with performance metrics,
 * violation tracking, and intervention recommendations.
 * 
 * @returns JSX element
 */
function WorkerManagementDashboard({ className = '' }: WorkerManagementDashboardProps) {
  const [workers, setWorkers] = useState<WorkerPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'accuracy' | 'violations' | 'fines'>('violations');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  /**
   * Load worker performance data
   */
  useEffect(() => {
    loadWorkerData();
  }, []);

  const loadWorkerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/worker-management/dashboard');
      const data = await response.json();

      if (data.success) {
        setWorkers(data.data);
      } else {
        setError(data.message || 'Failed to load worker data');
      }
    } catch (err) {
      setError('Network error loading worker data');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get violation type display name
   */
  const getViolationDisplayName = (violationType: string) => {
    const violationNames: { [key: string]: string } = {
      'INCORRECT_LABEL_PLACEMENT': 'Label Placement',
      'MIXED_SKU_VIOLATION': 'SKU Verification',
      'LATE_ASN': 'ASN Preparation',
      'INCORRECT_CARTON_SIZE': 'Carton Selection',
      'IMPROPER_PACKING': 'Packing Verification',
      'INVALID_UPC': 'UPC Verification'
    };
    return violationNames[violationType] || violationType;
  };

  /**
   * Get risk level color
   */
  const getRiskLevelColor = (riskLevel: string) => {
    const colors = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-red-100 text-red-800'
    };
    return colors[riskLevel as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get department color
   */
  const getDepartmentColor = (department: string) => {
    const colors = {
      'Warehouse': 'bg-blue-100 text-blue-800',
      'Packaging': 'bg-purple-100 text-purple-800',
      'Quality Control': 'bg-green-100 text-green-800',
      'Shipping': 'bg-orange-100 text-orange-800'
    };
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Filter and sort workers
   */
  const filteredWorkers = workers
    .filter(worker => filterDepartment === 'All' || worker.department === filterDepartment)
    .sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'accuracy':
          aValue = a.accuracy_rate;
          bValue = b.accuracy_rate;
          break;
        case 'violations':
          aValue = a.violations.reduce((sum, v) => sum + v.violation_count, 0);
          bValue = b.violations.reduce((sum, v) => sum + v.violation_count, 0);
          break;
        case 'fines':
          aValue = a.total_fines_incurred;
          bValue = b.total_fines_incurred;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  /**
   * Get unique departments for filter
   */
  const departments = ['All', ...Array.from(new Set(workers.map(w => w.department)))];

  /**
   * Calculate summary statistics
   */
  const totalWorkers = workers.length;
  const workersNeedingIntervention = workers.filter(w => w.intervention_needed).length;
  const totalViolations = workers.reduce((sum, w) => sum + w.violations.reduce((vSum, v) => vSum + v.violation_count, 0), 0);
  const totalFinesIncurred = workers.reduce((sum, w) => sum + w.total_fines_incurred, 0);
  const averageAccuracy = workers.length > 0 ? workers.reduce((sum, w) => sum + w.accuracy_rate, 0) / workers.length : 0;

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading worker data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="text-red-400 mr-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Data</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 px-6 py-6 max-w-7xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Worker Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor performance and identify workers needing intervention</p>
        </div>
        <button
          onClick={loadWorkerData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Workers</p>
              <p className="text-2xl font-bold text-gray-900">{totalWorkers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Need Intervention</p>
              <p className="text-2xl font-bold text-red-600">{workersNeedingIntervention}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Violations</p>
              <p className="text-2xl font-bold text-gray-900">{totalViolations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Fines</p>
              <p className="text-2xl font-bold text-red-600">${totalFinesIncurred.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
              <p className="text-2xl font-bold text-green-600">{averageAccuracy.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="accuracy">Accuracy Rate</option>
              <option value="violations">Total Violations</option>
              <option value="fines">Fines Incurred</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Worker Performance Overview</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Violations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial Impact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWorkers.map((worker) => (
                <tr key={worker.worker_id} className={worker.intervention_needed ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {worker.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                        <div className="text-sm text-gray-500">ID: {worker.worker_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDepartmentColor(worker.department)}`}>
                      {worker.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="font-medium">{worker.accuracy_rate.toFixed(1)}%</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${worker.accuracy_rate >= 90 ? 'bg-green-500' : worker.accuracy_rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${worker.accuracy_rate}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {worker.successful_scans}/{worker.total_scans} scans
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">
                        {worker.violations.reduce((sum, v) => sum + v.violation_count, 0)} total
                      </div>
                      <div className="text-xs text-gray-500">
                        {worker.violations.length > 0 ? (
                          <div className="space-y-1">
                            {worker.violations.slice(0, 2).map((violation, idx) => (
                              <div key={idx}>
                                {getViolationDisplayName(violation.violation_type)}: {violation.violation_count}
                              </div>
                            ))}
                            {worker.violations.length > 2 && (
                              <div>+{worker.violations.length - 2} more</div>
                            )}
                          </div>
                        ) : (
                          'No violations'
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="text-red-600 font-medium">
                        -${worker.total_fines_incurred.toFixed(0)}
                      </div>
                      <div className="text-green-600 text-xs">
                        +${worker.total_fines_saved.toFixed(0)} saved
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(worker.risk_level)}`}>
                      {worker.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                      {worker.intervention_needed && (
                        <button className="text-red-600 hover:text-red-900">
                          Schedule Intervention
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intervention Recommendations */}
      {workersNeedingIntervention > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="text-red-400 mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-red-800 font-medium">Workers Requiring Intervention</h3>
          </div>
          <div className="space-y-2">
            {workers.filter(w => w.intervention_needed).map(worker => (
              <div key={worker.worker_id} className="flex justify-between items-center bg-white rounded p-3">
                <div>
                  <span className="font-medium">{worker.name}</span>
                  <span className="text-gray-600 ml-2">({worker.department})</span>
                  <span className="text-red-600 ml-2">
                    {worker.violations.reduce((sum, v) => sum + v.violation_count, 0)} violations
                  </span>
                </div>
                <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                  Schedule Training
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerManagementDashboard;
