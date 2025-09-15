/**
 * Navigation Component
 * 
 * Main navigation component for the multi-page application.
 * 
 * @fileoverview Navigation component with routing
 * @author RetailReady Team
 * @version 1.0.0
 */

import { Link, useLocation } from 'react-router-dom';

/**
 * Navigation Component
 * 
 * Provides navigation between different pages of the application.
 * 
 * @returns JSX element
 */
export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview' },
    { path: '/compliance', label: 'Compliance' },
    { path: '/risk', label: 'Risk Management' },
    { path: '/task-assignment', label: 'Task Assignment' },
    { path: '/workers', label: 'Worker Tools' },
    { path: '/worker-management', label: 'Worker Management' },
    { path: '/analytics', label: 'Analytics' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/pp.webp" 
              alt="Profile" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">RetailReady</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
