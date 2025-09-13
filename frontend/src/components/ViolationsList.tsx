import React from 'react'
import { AlertTriangle, DollarSign, Calendar, Building } from 'lucide-react'
import { Violation } from '../types'

interface ViolationsListProps {
  violations: Violation[]
}

export const ViolationsList: React.FC<ViolationsListProps> = ({ violations }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Labeling': 'bg-blue-100 text-blue-800',
      'ASN': 'bg-purple-100 text-purple-800',
      'Packaging': 'bg-orange-100 text-orange-800',
      'Delivery': 'bg-green-100 text-green-800',
      'Default': 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || colors.Default
  }

  if (violations.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No violations found</h3>
        <p className="text-gray-500">
          {violations.length === 0 
            ? "Upload a compliance guide to get started, or adjust your filters."
            : "Try adjusting your filters to see more results."
          }
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {violations.map((violation) => (
        <div
          key={violation.id}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {violation.requirement}
              </h3>
              <p className="text-gray-600 mb-3">
                <strong>Violation:</strong> {violation.violation}
              </p>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(violation.severity)}`}>
                {violation.severity}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(violation.category)}`}>
                {violation.category}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span>
                <strong>Fine:</strong> {violation.fine}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building className="w-4 h-4 text-blue-600" />
              <span>
                <strong>Retailer:</strong> {violation.retailer}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>
                <strong>Added:</strong> {new Date(violation.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                ID: #{violation.id}
              </div>
              <div className="text-sm text-gray-500">
                Risk Level: {violation.severity === 'High' ? '🔴 High Risk' : 
                           violation.severity === 'Medium' ? '🟡 Medium Risk' : 
                           '🟢 Low Risk'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

