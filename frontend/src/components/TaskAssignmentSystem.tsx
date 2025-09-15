/**
 * Task Assignment System Component
 * 
 * This component provides task-level worker assignment optimization for Dick's Sporting Goods
 * compliance requirements. It breaks down orders into specific compliance-critical tasks
 * and matches workers to tasks based on their proven abilities.
 * 
 * @fileoverview Task-level worker assignment and violation prediction interface
 * @author RetailReady Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

interface OrderTask {
  id: string;
  type: string;
  quantity: number;
  requirement: string;
  potentialFine: number;
  requiredSkills: string[];
  estimatedTime: number;
  complexity: string;
}

interface OrderBreakdown {
  orderId: string;
  retailer: string;
  orderType: string;
  itemCount: number;
  tasks: OrderTask[];
  totalEstimatedTime: number;
  maxPossibleFines: number;
}

interface Worker {
  worker_id: string;
  name: string;
  department: string;
  profile?: WorkerProfile;
}

interface WorkerProfile {
  workerId: string;
  skills: {
    [key: string]: {
      accuracy: number;
      speed: number;
      violations: number;
    };
  };
  totalScans: number;
  successfulScans: number;
  overallAccuracy: number;
  violationHistory: { [key: string]: number };
}

interface TaskAssignment {
  primary: {
    worker: Worker;
    score: number;
    expectedFine: number;
    riskReduction: number;
  };
  backup: {
    worker: Worker;
    score: number;
    expectedFine: number;
    riskReduction: number;
  };
}

interface ViolationPrediction {
  taskId: string;
  taskName: string;
  taskType: string;
  assignedWorker: string;
  successRate: number;
  expectedFine: number;
  riskLevel: 'High' | 'Medium' | 'Low';
  warning: string | null;
  potentialFine: number;
}

interface OptimizationResult {
  orderId: string;
  assignments: { [taskId: string]: TaskAssignment };
  predictions: ViolationPrediction[];
  totalExpectedFines: number;
  maxPossibleFines: number;
  riskReduction: number;
  riskReductionPercentage: number;
}

/**
 * Task Assignment System Component
 * 
 * Provides a comprehensive interface for task-level worker assignment optimization
 * with real-time violation prediction and risk assessment.
 * 
 * @returns JSX element
 */
function TaskAssignmentSystem() {
  const { violations } = useApp();
  const [orderBreakdown, setOrderBreakdown] = useState<OrderBreakdown | null>(null);
  const [assignments, setAssignments] = useState<{ [taskId: string]: TaskAssignment }>({});
  const [simulationResults, setSimulationResults] = useState<OptimizationResult | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if routing guide data is available
  const hasRoutingGuideData = violations.length > 0 && violations.some(v => v.retailer === 'Uploaded Document');

  // Form state for order input
  const [orderId, setOrderId] = useState('ORD-001');
  const [itemCount, setItemCount] = useState(150);
  const [orderType, setOrderType] = useState('Standard');
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]);

  /**
   * Load workers with skill profiles on component mount
   */
  useEffect(() => {
    loadWorkers();
  }, []);

  /**
   * Load all workers with their skill profiles
   */
  const loadWorkers = async () => {
    try {
      const response = await fetch('/api/task-assignment/workers');
      const data = await response.json();
      
      if (data.success) {
        setWorkers(data.data);
      } else {
        setError('Failed to load workers');
      }
    } catch (err) {
      setError('Network error loading workers');
    }
  };

  /**
   * Break down order into compliance tasks
   */
  const breakdownOrder = async () => {
    if (!orderId || !itemCount) {
      setError('Please enter Order ID and Item Count');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/task-assignment/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          itemCount,
          orderType,
          retailer: "Dick's Sporting Goods",
          specialRequirements
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOrderBreakdown(data.data);
      } else {
        setError(data.message || 'Failed to break down order');
      }
    } catch (err) {
      setError('Network error breaking down order');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Optimize task assignments
   */
  const optimizeAssignments = async () => {
    if (!orderBreakdown) {
      setError('Please break down order first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/task-assignment/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderBreakdown })
      });

      const data = await response.json();
      
      if (data.success) {
        setSimulationResults(data.data);
        setAssignments(data.data.assignments);
      } else {
        setError(data.message || 'Failed to optimize assignments');
      }
    } catch (err) {
      setError('Network error optimizing assignments');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Simulate different assignment strategies
   */
  const simulateStrategy = async (strategy: 'optimized' | 'random' | 'worst') => {
    if (!orderBreakdown) {
      setError('Please break down order first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/task-assignment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderBreakdown, 
          assignmentStrategy: strategy 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSimulationResults(data.data);
        setAssignments(data.data.assignments);
      } else {
        setError(data.message || 'Failed to simulate assignments');
      }
    } catch (err) {
      setError('Network error simulating assignments');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get task name from type
   */
  const getTaskName = (taskType: string) => {
    const taskNames: { [key: string]: string } = {
      'LABEL_PLACEMENT': 'Label Placement',
      'SKU_VERIFICATION': 'SKU Verification',
      'ASN_PREPARATION': 'ASN Preparation',
      'CARTON_SELECTION': 'Carton Selection',
      'PACKING_VERIFICATION': 'Packing Verification',
      'UPC_VERIFICATION': 'UPC Verification'
    };
    return taskNames[taskType] || taskType;
  };

  /**
   * Get risk badge component
   */
  const RiskBadge = ({ level }: { level: 'High' | 'Medium' | 'Low' }) => {
    const colors = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level]}`}>
        {level} Risk
      </span>
    );
  };

  /**
   * Get skill indicator component
   */
  const SkillIndicator = ({ 
    level, 
    violations 
  }: { 
    level: number; 
    violations: number; 
  }) => {
    const getColor = () => {
      if (level >= 0.9) return 'text-green-600';
      if (level >= 0.7) return 'text-yellow-600';
      return 'text-red-600';
    };

    return (
      <div className="text-center">
        <div className={`text-sm font-semibold ${getColor()}`}>
          {Math.round(level * 100)}%
        </div>
        {violations > 0 && (
          <div className="text-xs text-red-500">
            {violations} violations
          </div>
        )}
      </div>
    );
  };

  // Show message if no routing guide data is available
  if (!hasRoutingGuideData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Task-Level Worker Assignment
          </h1>
          <p className="text-gray-600">
            Break down orders into compliance-critical tasks and optimize worker assignments
            to minimize Dick's Sporting Goods violations and fines.
          </p>
        </div>

        {/* No Data Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">No Routing Guide Data Available</h2>
          <p className="text-blue-700 mb-4">
            To use the Task Assignment system, you need to upload a Dick's Sporting Goods routing guide PDF first.
          </p>
          <p className="text-sm text-blue-600 mb-6">
            The routing guide contains the compliance requirements needed to break down orders into specific tasks and optimize worker assignments.
          </p>
          <div className="bg-white rounded-lg p-4 border border-blue-200 max-w-md mx-auto">
            <h3 className="font-medium text-blue-900 mb-2">What you'll get after upload:</h3>
            <ul className="text-sm text-blue-700 text-left space-y-1">
              <li>• Order breakdown into compliance tasks</li>
              <li>• Worker skill-based assignments</li>
              <li>• Violation risk predictions</li>
              <li>• Fine optimization recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Task-Level Worker Assignment
        </h1>
        <p className="text-gray-600">
          Break down orders into compliance-critical tasks and optimize worker assignments
          to minimize Dick's Sporting Goods violations and fines.
        </p>
      </div>

      {/* Order Input Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Order Breakdown</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Count
            </label>
            <input
              type="number"
              value={itemCount}
              onChange={(e) => setItemCount(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Standard">Standard</option>
              <option value="Retail">Retail</option>
              <option value="Bulk">Bulk</option>
              <option value="Express">Express</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Requirements
            </label>
            <div className="space-y-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={specialRequirements.includes('fragile')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSpecialRequirements([...specialRequirements, 'fragile']);
                    } else {
                      setSpecialRequirements(specialRequirements.filter(r => r !== 'fragile'));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">Fragile Items</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={specialRequirements.includes('retail')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSpecialRequirements([...specialRequirements, 'retail']);
                    } else {
                      setSpecialRequirements(specialRequirements.filter(r => r !== 'retail'));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">Retail Items</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={breakdownOrder}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Processing...' : 'Break Down Order'}
          </button>
          
          {orderBreakdown && (
            <button
              onClick={optimizeAssignments}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Optimizing...' : 'Optimize Assignments'}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Order Task Breakdown */}
      {orderBreakdown && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Order Task Breakdown</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Order ID</div>
              <div className="text-lg font-bold text-blue-900">{orderBreakdown.orderId}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Items</div>
              <div className="text-lg font-bold text-green-900">{orderBreakdown.itemCount}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Max Possible Fines</div>
              <div className="text-lg font-bold text-purple-900">${orderBreakdown.maxPossibleFines}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            {orderBreakdown.tasks.map(task => (
              <div key={task.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{getTaskName(task.type)}</h3>
                    <p className="text-sm text-gray-600 mb-2">{task.requirement}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                        Risk: ${task.potentialFine}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {task.quantity} units
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {task.estimatedTime} min
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {task.complexity} complexity
                      </span>
                    </div>
                  </div>
                  
                  {assignments[task.id] && (
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-600">Assigned to:</div>
                      <div className="font-semibold">{assignments[task.id].primary.worker.name}</div>
                      <div className="text-sm text-green-600">
                        {Math.round(assignments[task.id].primary.score * 100)}% success rate
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simulation Results */}
      {simulationResults && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Violation Prediction</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {simulationResults.predictions.map(pred => (
              <div key={pred.taskId} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{pred.taskName}</span>
                  <RiskBadge level={pred.riskLevel} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Assigned to:</span>
                    <span className="font-semibold">{pred.assignedWorker}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Success Rate:</span>
                    <span className="font-semibold">{pred.successRate.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Expected Fine:</span>
                    <span className="text-red-600 font-semibold">${pred.expectedFine.toFixed(0)}</span>
                  </div>
                  
                  {pred.warning && (
                    <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 text-xs rounded">
                      Warning: {pred.warning}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Total Risk Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Total Order Risk</h3>
                <p className="text-sm text-gray-600">Based on current assignments</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600">
                  ${simulationResults.totalExpectedFines.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">
                  vs ${simulationResults.maxPossibleFines} max
                </div>
                <div className="text-sm text-green-600 font-semibold">
                  {simulationResults.riskReductionPercentage}% risk reduction
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Comparison */}
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Assignment Strategy Comparison</h3>
            <div className="flex gap-4">
              <button
                onClick={() => simulateStrategy('optimized')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Optimized
              </button>
              <button
                onClick={() => simulateStrategy('random')}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Random
              </button>
              <button
                onClick={() => simulateStrategy('worst')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Worst Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Worker Skill Matrix */}
      {workers.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Worker Skill Matrix</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Worker</th>
                  <th className="text-center py-2">Label Placement</th>
                  <th className="text-center py-2">SKU Verification</th>
                  <th className="text-center py-2">ASN Timing</th>
                  <th className="text-center py-2">Carton Selection</th>
                  <th className="text-center py-2">Packing</th>
                  <th className="text-center py-2">UPC Verification</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(worker => (
                  <tr key={worker.worker_id} className="border-b">
                    <td className="py-2">
                      <div>
                        <div className="font-medium">{worker.name}</div>
                        <div className="text-sm text-gray-600">{worker.department}</div>
                      </div>
                    </td>
                    <td className="text-center py-2">
                      <SkillIndicator 
                        level={worker.profile?.skills.label_placement?.accuracy || 0.8}
                        violations={worker.profile?.skills.label_placement?.violations || 0}
                      />
                    </td>
                    <td className="text-center py-2">
                      <SkillIndicator 
                        level={worker.profile?.skills.sku_verification?.accuracy || 0.8}
                        violations={worker.profile?.skills.sku_verification?.violations || 0}
                      />
                    </td>
                    <td className="text-center py-2">
                      <SkillIndicator 
                        level={worker.profile?.skills.asn_preparation?.accuracy || 0.8}
                        violations={worker.profile?.skills.asn_preparation?.violations || 0}
                      />
                    </td>
                    <td className="text-center py-2">
                      <SkillIndicator 
                        level={worker.profile?.skills.carton_selection?.accuracy || 0.8}
                        violations={worker.profile?.skills.carton_selection?.violations || 0}
                      />
                    </td>
                    <td className="text-center py-2">
                      <SkillIndicator 
                        level={worker.profile?.skills.packing_verification?.accuracy || 0.8}
                        violations={worker.profile?.skills.packing_verification?.violations || 0}
                      />
                    </td>
                    <td className="text-center py-2">
                      <SkillIndicator 
                        level={worker.profile?.skills.upc_verification?.accuracy || 0.8}
                        violations={worker.profile?.skills.upc_verification?.violations || 0}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskAssignmentSystem;
