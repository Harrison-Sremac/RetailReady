export interface Violation {
  id: number
  requirement: string
  violation: string
  fine: string
  category: string
  severity: 'High' | 'Medium' | 'Low'
  retailer: string
  created_at: string
}

export interface RiskCalculation {
  violation: Violation
  units: number
  estimatedFine: number
  severity: string
  riskLevel: 'High' | 'Medium' | 'Low'
}

export interface Filters {
  category: string
  severity: string
  retailer: string
}

