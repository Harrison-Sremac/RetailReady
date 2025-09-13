import React, { useState, useEffect } from 'react'
import { UploadZone } from './components/UploadZone'
import { ViolationsList } from './components/ViolationsList'
import { RiskCalculator } from './components/RiskCalculator'
import { Header } from './components/Header'
import { FilterBar } from './components/FilterBar'
import { Violation } from './types'

function App() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [filteredViolations, setFilteredViolations] = useState<Violation[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
    retailer: ''
  })

  // Fetch violations and categories on component mount
  useEffect(() => {
    fetchViolations()
    fetchCategories()
  }, [])

  // Update filtered violations when violations or filters change
  useEffect(() => {
    let filtered = violations

    if (filters.category) {
      filtered = filtered.filter(v => v.category === filters.category)
    }
    if (filters.severity) {
      filtered = filtered.filter(v => v.severity === filters.severity)
    }
    if (filters.retailer) {
      filtered = filtered.filter(v => v.retailer === filters.retailer)
    }

    setFilteredViolations(filtered)
  }, [violations, filters])

  const fetchViolations = async () => {
    try {
      const response = await fetch('/api/violations')
      const data = await response.json()
      setViolations(data)
    } catch (error) {
      console.error('Error fetching violations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleUploadSuccess = () => {
    // Refresh violations after successful upload
    fetchViolations()
    fetchCategories()
  }

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Compliance Guide</h2>
            <UploadZone onUploadSuccess={handleUploadSuccess} />
          </div>
        </section>

        {/* Filters */}
        <section className="mb-6">
          <FilterBar 
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </section>

        {/* Risk Calculator */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Risk Assessment Calculator</h2>
            <RiskCalculator violations={filteredViolations} />
          </div>
        </section>

        {/* Violations List */}
        <section>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Compliance Requirements</h2>
              <span className="text-sm text-gray-500">
                {filteredViolations.length} of {violations.length} requirements
              </span>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ViolationsList violations={filteredViolations} />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App

