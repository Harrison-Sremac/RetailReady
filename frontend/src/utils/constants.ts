/**
 * Application Constants
 * 
 * This module contains all application-wide constants including
 * API endpoints, configuration values, and static data.
 * 
 * @fileoverview Application constants and configuration
 * @author RetailReady Team
 * @version 1.0.0
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api',
  ENDPOINTS: {
    HEALTH: 'http://localhost:3001/api/health',
    VIOLATIONS: 'http://localhost:3001/api/violations',
    CATEGORIES: 'http://localhost:3001/api/violations/categories',
    RETAILERS: 'http://localhost:3001/api/violations/retailers',
    DATABASE_VIEW: 'http://localhost:3001/api/violations/database-view',
    UPLOAD: 'http://localhost:3001/api/upload',
    UPLOAD_VALIDATE: 'http://localhost:3001/api/upload/validate',
    UPLOAD_INFO: 'http://localhost:3001/api/upload/info',
    RISK_SCORE: 'http://localhost:3001/api/risk/score',
    RISK_BATCH: 'http://localhost:3001/api/risk/batch',
    RISK_ESTIMATE: 'http://localhost:3001/api/risk/estimate',
    RISK_CONFIG: 'http://localhost:3001/api/risk/config',
    WORKER_SCAN: 'http://localhost:3001/api/worker/scan',
    WORKER_LEADERBOARD: 'http://localhost:3001/api/worker/leaderboard',
    WORKER_PERFORMANCE: 'http://localhost:3001/api/worker'
  }
} as const;

/**
 * Severity Levels
 */
export const SEVERITY_LEVELS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
} as const;

export type SeverityLevel = typeof SEVERITY_LEVELS[keyof typeof SEVERITY_LEVELS];

/**
 * Severity Configuration
 */
export const SEVERITY_CONFIG = {
  [SEVERITY_LEVELS.HIGH]: {
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: '●',
    description: 'High Risk'
  },
  [SEVERITY_LEVELS.MEDIUM]: {
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: '●',
    description: 'Medium Risk'
  },
  [SEVERITY_LEVELS.LOW]: {
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    icon: '●',
    description: 'Low Risk'
  }
} as const;

/**
 * Category Configuration
 */
export const CATEGORY_CONFIG = {
  LABELING: {
    name: 'Labeling',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    description: 'Label and marking requirements'
  },
  ASN: {
    name: 'ASN',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    description: 'Advance Ship Notice requirements'
  },
  PACKAGING: {
    name: 'Packaging',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    description: 'Packaging and shipping requirements'
  },
  DELIVERY: {
    name: 'Delivery',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    description: 'Delivery timing and method requirements'
  },
  DEFAULT: {
    name: 'Other',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    description: 'Other compliance requirements'
  }
} as const;

/**
 * File Upload Configuration
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf']
} as const;

/**
 * Risk Calculation Configuration
 */
export const RISK_CONFIG = {
  THRESHOLDS: {
    HIGH: 1000,
    MEDIUM: 500
  },
  DEFAULT_UNITS: 100,
  MIN_UNITS: 1,
  MAX_UNITS: 10000
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  PAGINATION_SIZE: 20,
  MAX_DISPLAY_ITEMS: 100
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  INVALID_FILE_TYPE: 'Please upload a PDF file only.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  PARSING_FAILED: 'Failed to parse document. Please try a different file.',
  CALCULATION_FAILED: 'Risk calculation failed. Please try again.',
  NO_DATA_FOUND: 'No data found matching your criteria.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: 'Document uploaded and parsed successfully!',
  CALCULATION_SUCCESS: 'Risk calculation completed successfully!',
  FILTER_APPLIED: 'Filters applied successfully!',
  DATA_REFRESHED: 'Data refreshed successfully!'
} as const;

/**
 * Application Metadata
 */
export const APP_METADATA = {
  NAME: 'RetailReady',
  VERSION: '1.0.0',
  DESCRIPTION: 'Compliance Risk Assessment Platform',
  TAGLINE: 'Compliance Risk Assessment'
} as const;
