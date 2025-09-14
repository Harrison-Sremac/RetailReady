import React from 'react'
import { Shield, AlertTriangle } from 'lucide-react'

/**
 * Header Component
 * 
 * Displays the application header with branding, logo, and version information.
 * Provides consistent navigation and branding across the application.
 * 
 * @fileoverview Application header component with branding and navigation
 * @author RetailReady Team
 * @version 1.0.0
 * 
 * @returns JSX element containing the application header
 * 
 * @example
 * <Header />
 */
export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RetailReady</h1>
              <p className="text-sm text-gray-500">Compliance Risk Assessment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <AlertTriangle className="w-4 h-4" />
            <span>MVP Version</span>
          </div>
        </div>
      </div>
    </header>
  )
}

