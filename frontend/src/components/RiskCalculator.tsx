import React, { useState } from 'react'
import { Calculator, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react'
import { Violation, RiskCalculation } from '../types'

interface RiskCalculatorProps {
  violations: Violation[]
}

export const RiskCalculator: React.FC<RiskCalculatorProps> = ({ violations }) => {
  const [selectedViolationId, setSelectedViolationId] = useState<number | null>(null)
  const [units, setUnits] = useState<number>(100)
  const [calculation, setCalculation] = useState<RiskCalculation | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    if (!selectedViolationId || units <= 0) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/risk-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          violationId: selectedViolationId,
          units: units,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setCalculation(data)
      } else {
        console.error('Error calculating risk:', data.error)
      }
    } catch (error) {
      console.error('Network error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTopRisks = () => {
    const highRiskViolations = violations.filter(v => v.severity === 'High')
    return highRiskViolations.slice(0, 3)
  }

  return (
    <div className="space-y-6">
      {/* Calculator Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Violation
            </label>
            <select
              value={selectedViolationId || ''}
              onChange={(e) => setSelectedViolationId(Number(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a violation...</option>
              {violations.map((violation) => (
                <option key={violation.id} value={violation.id}>
                  {violation.category}: {violation.violation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipment Size (units)
            </label>
            <input
              type="number"
              min="1"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter number of units"
            />
          </div>

          <button
            onClick={handleCalculate}
            disabled={!selectedViolationId || units <= 0 || loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            <span>{loading ? 'Calculating...' : 'Calculate Risk'}</span>
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {calculation ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${getRiskColor(calculation.riskLevel)}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Risk Assessment</span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  ${calculation.estimatedFine.toLocaleString()}
                </div>
                <div className="text-sm">
                  Potential exposure for {calculation.units} units
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Calculation Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Violation:</span>
                    <span className="font-medium">{calculation.violation.violation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fine Structure:</span>
                    <span className="font-medium">{calculation.violation.fine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Severity:</span>
                    <span className="font-medium">{calculation.severity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Level:</span>
                    <span className="font-medium">{calculation.riskLevel}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a violation and enter units to calculate risk</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Risks Summary */}
      {violations.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Top Risk Areas</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getTopRisks().map((violation, index) => (
              <div key={violation.id} className="bg-white p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    #{index + 1} Risk
                  </span>
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                    {violation.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {violation.category}
                </div>
                <div className="text-xs text-gray-500">
                  {violation.fine}
                </div>
              </div>
            ))}
          </div>
          
          {getTopRisks().length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No high-risk violations found in current selection
            </p>
          )}
        </div>
      )}
    </div>
  )
}

