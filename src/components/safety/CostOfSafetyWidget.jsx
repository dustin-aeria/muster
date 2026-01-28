/**
 * CostOfSafetyWidget.jsx
 * Dashboard widget showing cost metrics related to safety
 *
 * Displays:
 * - Total incident costs
 * - Training investment
 * - Insurance costs
 * - Cost per incident
 * - Savings from prevention
 *
 * @location src/components/safety/CostOfSafetyWidget.jsx
 */

import { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  GraduationCap,
  AlertTriangle,
  FileText,
  ChevronRight,
  Info
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Industry average costs for reference (Canadian data)
const INDUSTRY_BENCHMARKS = {
  avgIncidentCost: 15000, // Average direct cost per incident
  avgIndirectMultiplier: 4, // Indirect costs are typically 4x direct costs
  avgTrainingPerEmployee: 2500, // Annual training investment per employee
  avgInsurancePerAircraft: 8000 // Liability insurance per aircraft
}

/**
 * Calculate estimated cost savings from safety program
 */
function calculatePreventionSavings(incidents, nearMisses) {
  // Each near miss reported and addressed prevents ~10% chance of becoming an incident
  const potentialIncidentsPrevented = nearMisses * 0.1
  const directSavings = potentialIncidentsPrevented * INDUSTRY_BENCHMARKS.avgIncidentCost
  const indirectSavings = directSavings * INDUSTRY_BENCHMARKS.avgIndirectMultiplier
  return Math.round(directSavings + indirectSavings)
}

/**
 * Format currency for display
 */
function formatCurrency(amount) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`
  }
  return `$${amount.toLocaleString()}`
}

export default function CostOfSafetyWidget({ incidents = [], training = [], insurance = [] }) {
  const [expanded, setExpanded] = useState(false)

  // Calculate YTD stats
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)

  // Filter YTD data
  const ytdIncidents = incidents.filter(i => {
    const date = i.dateOccurred?.toDate?.() || new Date(i.dateOccurred)
    return date >= yearStart
  })

  const recordableIncidents = ytdIncidents.filter(i => i.type !== 'near_miss')
  const nearMisses = ytdIncidents.filter(i => i.type === 'near_miss')

  // Calculate costs
  const totalIncidentCosts = recordableIncidents.reduce((sum, i) => {
    const directCost = i.costs?.direct || 0
    const indirectCost = i.costs?.indirect || 0
    const workersComp = i.costs?.workersComp || 0
    return sum + directCost + indirectCost + workersComp
  }, 0)

  // If no costs entered, estimate based on industry average
  const estimatedIncidentCosts = recordableIncidents.length * INDUSTRY_BENCHMARKS.avgIncidentCost
  const displayIncidentCosts = totalIncidentCosts > 0 ? totalIncidentCosts : estimatedIncidentCosts

  // Training costs (YTD)
  const trainingCosts = training.reduce((sum, t) => {
    const cost = t.cost || 0
    return sum + cost
  }, 0)

  // Insurance costs
  const insuranceCosts = insurance.reduce((sum, i) => {
    const premium = i.premium || 0
    return sum + premium
  }, 0)

  // Prevention savings
  const preventionSavings = calculatePreventionSavings(recordableIncidents.length, nearMisses.length)

  // Total safety investment
  const totalInvestment = trainingCosts + insuranceCosts

  // Cost per incident
  const costPerIncident = recordableIncidents.length > 0
    ? Math.round(displayIncidentCosts / recordableIncidents.length)
    : 0

  // ROI calculation (savings / investment)
  const roi = totalInvestment > 0
    ? Math.round((preventionSavings / totalInvestment) * 100)
    : 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cost of Safety</h3>
              <p className="text-sm text-gray-500">YTD financial impact</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            {expanded ? 'Less' : 'More'} details
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main metrics */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Incident Costs */}
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Incident Costs</span>
            </div>
            <p className="text-xl font-bold text-red-700">
              {formatCurrency(displayIncidentCosts)}
            </p>
            <p className="text-xs text-red-600">
              {recordableIncidents.length} incident{recordableIncidents.length !== 1 ? 's' : ''} YTD
            </p>
            {totalIncidentCosts === 0 && displayIncidentCosts > 0 && (
              <p className="text-xs text-red-500 italic mt-1">*Estimated</p>
            )}
          </div>

          {/* Prevention Savings */}
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium">Prevention Savings</span>
            </div>
            <p className="text-xl font-bold text-green-700">
              {formatCurrency(preventionSavings)}
            </p>
            <p className="text-xs text-green-600">
              {nearMisses.length} near miss{nearMisses.length !== 1 ? 'es' : ''} addressed
            </p>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {/* Investment breakdown */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Safety Investment</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <GraduationCap className="w-4 h-4" />
                    <span>Training</span>
                  </div>
                  <span className="font-medium">{formatCurrency(trainingCosts)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>Insurance</span>
                  </div>
                  <span className="font-medium">{formatCurrency(insuranceCosts)}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="font-medium text-gray-700">Total Investment</span>
                  <span className="font-bold text-gray-900">{formatCurrency(totalInvestment)}</span>
                </div>
              </div>
            </div>

            {/* Key metrics */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Cost Per Incident</p>
                  <p className="text-lg font-bold text-gray-900">
                    {costPerIncident > 0 ? formatCurrency(costPerIncident) : 'N/A'}
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Prevention ROI</p>
                  <p className={`text-lg font-bold ${roi > 100 ? 'text-green-600' : 'text-gray-900'}`}>
                    {roi > 0 ? `${roi}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Industry comparison */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Industry Benchmarks</p>
                  <ul className="space-y-0.5">
                    <li>Average incident cost: {formatCurrency(INDUSTRY_BENCHMARKS.avgIncidentCost)}</li>
                    <li>Indirect costs typically 4x direct costs</li>
                    <li>Training investment: {formatCurrency(INDUSTRY_BENCHMARKS.avgTrainingPerEmployee)}/employee/year</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <Link
          to="/incidents"
          className="text-sm text-aeria-blue hover:text-aeria-navy flex items-center gap-1"
        >
          View incident details
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
