/**
 * Workflow-Based Category Definitions
 * 
 * This module defines the new workflow-based categorization system
 * that groups violations by WHEN they occur and WHO is responsible.
 * 
 * @fileoverview Workflow-based category definitions and metadata
 * @author RetailReady Team
 * @version 1.0.0
 */

/**
 * Workflow Category Interface
 */
export interface WorkflowCategory {
  /** Display name for the category */
  name: string
  /** Description of what this category covers */
  description: string
  /** When in the workflow this occurs */
  workflowStage: string
  /** Typical prevention methods */
  preventionMethods: string[]
  /** Who is typically responsible */
  responsibleParties: string[]
  /** Risk level indicator */
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  /** Color for UI display */
  color: string
  /** Icon for UI display */
  icon: string
}

/**
 * Workflow-based category definitions
 */
export const WORKFLOW_CATEGORIES: Record<string, WorkflowCategory> = {
  'Pre-Packing': {
    name: 'Pre-Packing',
    description: 'Requirements checked before packing starts',
    workflowStage: 'Order Preparation',
    preventionMethods: ['Order verification', 'Box size calculator', 'Product prep guides'],
    responsibleParties: ['Supervisor', 'Warehouse Worker'],
    riskLevel: 'HIGH',
    color: 'blue',
    icon: 'prep'
  },
  'During Packing': {
    name: 'During Packing',
    description: 'Requirements during the packing process',
    workflowStage: 'Active Packing',
    preventionMethods: ['Visual guides', 'SKU verification', 'Quality checklists'],
    responsibleParties: ['Warehouse Worker'],
    riskLevel: 'HIGH',
    color: 'green',
    icon: 'packing'
  },
  'Post-Packing': {
    name: 'Post-Packing',
    description: 'Requirements after packing but before shipping',
    workflowStage: 'Final Preparation',
    preventionMethods: ['Label placement guides', 'Photo verification', 'Sealing procedures'],
    responsibleParties: ['Warehouse Worker'],
    riskLevel: 'MEDIUM',
    color: 'yellow',
    icon: 'label'
  },
  'Pre-Shipment': {
    name: 'Pre-Shipment',
    description: 'Requirements before shipment leaves',
    workflowStage: 'Shipment Preparation',
    preventionMethods: ['Final validation', 'Documentation check', 'Carrier verification'],
    responsibleParties: ['Supervisor', 'Shipping Clerk'],
    riskLevel: 'CRITICAL',
    color: 'red',
    icon: 'shipment'
  },
  'EDI/Digital': {
    name: 'EDI/Digital',
    description: 'Electronic data interchange and system requirements',
    workflowStage: 'System Operations',
    preventionMethods: ['Automated alerts', 'System validation', 'API monitoring'],
    responsibleParties: ['IT System', 'System Administrator'],
    riskLevel: 'CRITICAL',
    color: 'purple',
    icon: 'digital'
  },
  'Carrier/Routing': {
    name: 'Carrier/Routing',
    description: 'Transportation and logistics requirements',
    workflowStage: 'Logistics Planning',
    preventionMethods: ['System validation', 'Route optimization', 'Carrier selection tools'],
    responsibleParties: ['Logistics Coordinator', 'IT System'],
    riskLevel: 'MEDIUM',
    color: 'orange',
    icon: 'routing'
  }
}

/**
 * Get category metadata by category name
 */
export function getCategoryInfo(categoryName: string): WorkflowCategory | null {
  return WORKFLOW_CATEGORIES[categoryName] || null
}

/**
 * Get all category names
 */
export function getAllCategoryNames(): string[] {
  return Object.keys(WORKFLOW_CATEGORIES)
}

/**
 * Get categories grouped by risk level
 */
export function getCategoriesByRiskLevel(): Record<string, string[]> {
  const grouped: Record<string, string[]> = {
    'CRITICAL': [],
    'HIGH': [],
    'MEDIUM': [],
    'LOW': []
  }

  Object.entries(WORKFLOW_CATEGORIES).forEach(([name, category]) => {
    grouped[category.riskLevel].push(name)
  })

  return grouped
}

/**
 * Get categories grouped by responsible party
 */
export function getCategoriesByResponsibleParty(): Record<string, string[]> {
  const grouped: Record<string, string[]> = {}

  Object.entries(WORKFLOW_CATEGORIES).forEach(([name, category]) => {
    category.responsibleParties.forEach(party => {
      if (!grouped[party]) {
        grouped[party] = []
      }
      grouped[party].push(name)
    })
  })

  return grouped
}
