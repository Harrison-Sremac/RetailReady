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
  /** Workflow-based category (Pre-Packing, During Packing, Post-Packing, Pre-Shipment, EDI/Digital, Carrier/Routing) */
  category: string
  /** Severity level of the violation */
  severity: 'High' | 'Medium' | 'Low'
  /** Retailer or source of the requirement */
  retailer: string
  /** Numeric fine amount if available */
  fine_amount?: number
  /** Unit of measurement for the fine */
  fine_unit?: string
  /** Additional fees or penalties */
  additional_fees?: string
  /** Method to prevent this violation */
  prevention_method?: string
  /** Who is responsible for prevention */
  responsible_party?: string
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

/**
 * Order Type Interface
 * 
 * Represents different order types and their packing requirements.
 */
export interface OrderType {
  /** Order type name */
  type: string
  /** Description of this order type */
  description: string
  /** Specific rules for this order type */
  rules: string[]
  /** Packing method description */
  packing_method: string
  /** SKU mixing rules */
  skus_per_carton: string
  /** Any special requirements */
  special_requirements: string[]
}

/**
 * Carton Specifications Interface
 * 
 * Represents dimensional and weight requirements for cartons.
 */
export interface CartonSpecs {
  /** Conveyable carton specifications */
  conveyable: {
    /** Minimum length in inches */
    length_min: string
    /** Maximum length in inches */
    length_max: string
    /** Minimum width in inches */
    width_min: string
    /** Maximum width in inches */
    width_max: string
    /** Minimum height in inches */
    height_min: string
    /** Maximum height in inches */
    height_max: string
    /** Minimum weight in pounds */
    weight_min: string
    /** Maximum weight in pounds */
    weight_max: string
  }
  /** Description of non-conveyable requirements */
  non_conveyable: string
}

/**
 * Label Placement Rule Interface
 * 
 * Represents label placement requirements and violations.
 */
export interface LabelPlacementRule {
  /** Label placement requirement description */
  requirement: string
  /** Standard positioning (e.g., '2 inches from bottom, 2 inches from right') */
  standard_position: string
  /** Special cases for placement */
  special_cases: string[]
  /** Fine for incorrect placement */
  violation_fine: string
}

/**
 * Timing Requirement Interface
 * 
 * Represents critical timing requirements and deadlines.
 */
export interface TimingRequirement {
  /** Timing requirement name (e.g., 'ASN Submission', 'Routing Request') */
  requirement: string
  /** Deadline description (e.g., 'within 1 hour of shipment') */
  deadline: string
  /** Specific timeframe */
  timeframe: string
  /** Fine for missing deadline */
  violation_fine: string
}

/**
 * Product Requirement Interface
 * 
 * Represents product category-specific requirements.
 */
export interface ProductRequirement {
  /** Product category (e.g., 'Apparel', 'Footwear', 'Electronics') */
  category: string
  /** Specific requirements for this category */
  requirements: string[]
  /** Special rules for this category */
  special_rules: string[]
  /** Common violations for this category */
  violations: string[]
}

/**
 * Comprehensive Parsed Data Interface
 * 
 * Represents the complete structure returned by the enhanced parser.
 */
export interface ParsedRoutingGuideData {
  /** Array of compliance requirements and violations */
  requirements: Violation[]
  /** Different order types and their rules */
  order_types: OrderType[]
  /** Carton dimensional and weight specifications */
  carton_specs: CartonSpecs
  /** Label placement rules and requirements */
  label_placement: LabelPlacementRule[]
  /** Critical timing requirements */
  timing_requirements: TimingRequirement[]
  /** Product category-specific requirements */
  product_requirements: ProductRequirement[]
}

