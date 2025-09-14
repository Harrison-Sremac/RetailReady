/**
 * TypeScript Type Definitions
 * 
 * This module contains all TypeScript interface and type definitions
 * used throughout the RetailReady application.
 * 
 * @fileoverview TypeScript type definitions for the application
 * @author RetailReady Team
 * @version 1.0.0
 */

/**
 * Compliance Violation Interface
 * 
 * Represents a compliance violation with all associated metadata.
 * This is the core data structure for compliance requirements.
 */
export interface Violation {
  /** Unique identifier for the violation */
  id: number
  /** The compliance requirement text */
  requirement: string
  /** Description of what constitutes a violation */
  violation: string
  /** Fine structure and amount */
  fine: string
  /** Category classification (e.g., Labeling, ASN, Packaging) */
  category: string
  /** Severity level of the violation */
  severity: 'High' | 'Medium' | 'Low'
  /** Retailer or source of the requirement */
  retailer: string
  /** Timestamp when the violation was created */
  created_at: string
}

/**
 * Risk Calculation Result Interface
 * 
 * Represents the result of a risk assessment calculation
 * including estimated fines and risk levels.
 */
export interface RiskCalculation {
  /** The violation being assessed */
  violation: Violation
  /** Number of units affected */
  units: number
  /** Calculated estimated fine amount */
  estimatedFine: number
  /** Severity level of the violation */
  severity: string
  /** Calculated risk level based on fine amount */
  riskLevel: 'High' | 'Medium' | 'Low'
  /** Risk percentage (0-100) */
  riskPercentage: number
  /** Array of risk factors identified */
  riskFactors?: string[]
  /** Detailed calculation information */
  calculationDetails?: {
    baseFine: number
    severityMultiplier: number
    thresholds: {
      high: number
      medium: number
    }
  }
}

/**
 * Filter Configuration Interface
 * 
 * Represents the current filter state for violations data.
 * Used for filtering violations by various criteria.
 */
export interface Filters {
  /** Category filter value */
  category: string
  /** Severity filter value */
  severity: string
  /** Retailer filter value */
  retailer: string
}

