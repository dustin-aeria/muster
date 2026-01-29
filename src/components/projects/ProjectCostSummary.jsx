/**
 * ProjectCostSummary.jsx
 * Aggregates all project costs into a single summary widget.
 * Shows pre-field, services, field work, and post-field costs.
 *
 * @location src/components/projects/ProjectCostSummary.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Briefcase,
  Target,
  PackageCheck
} from 'lucide-react'
import { getOperators, getEquipment } from '../../lib/firestore'
import { formatCurrency, calculatePhaseCost } from '../../lib/costEstimator'

// Rate type config (same as services)
const RATE_TYPE_OPTIONS = {
  hourly: { label: 'Hours', rateField: 'hourlyRate', unitLabel: 'hr' },
  daily: { label: 'Days', rateField: 'dailyRate', unitLabel: 'day' },
  weekly: { label: 'Weeks', rateField: 'weeklyRate', unitLabel: 'wk' },
  fixed: { label: 'Fixed', rateField: 'fixedRate', unitLabel: 'fixed' }
}

export default function ProjectCostSummary({ project }) {
  const [freshOperators, setFreshOperators] = useState([])
  const [freshEquipment, setFreshEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  // Load fresh data for field calculations
  useEffect(() => {
    const loadData = async () => {
      try {
        const [ops, equip] = await Promise.all([
          getOperators(),
          getEquipment()
        ])
        setFreshOperators(ops)
        setFreshEquipment(equip)
      } catch (err) {
        console.error('Error loading cost data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate all costs
  const costs = useMemo(() => {
    const estimatedFieldDays = parseFloat(project?.estimatedFieldDays) || 0
    const crew = project?.crew || []
    const assignedEquipment = project?.assignedEquipment || []
    const services = project?.projectServices || []

    // Pre-field costs
    const preFieldCost = calculatePhaseCost(project?.preFieldPhase)

    // Services costs - also track incomplete
    let servicesWithCost = 0
    const servicesCost = services.reduce((sum, s) => {
      const sRateType = s.rateType || 'daily'
      const sRateConfig = RATE_TYPE_OPTIONS[sRateType]
      const sRate = s[sRateConfig.rateField] || 0
      const sQuantity = parseFloat(s.quantity) || 0

      if (sRateType === 'fixed' && sRate > 0) {
        servicesWithCost++
        return sum + sRate
      } else if (sQuantity > 0 && sRate > 0) {
        servicesWithCost++
        return sum + (sQuantity * sRate)
      }
      return sum
    }, 0)
    const servicesIncomplete = services.length - servicesWithCost

    // Field crew costs - track missing rates
    let crewWithRates = 0
    const crewCost = crew.reduce((sum, member) => {
      const freshOp = freshOperators.find(op => op.id === member.operatorId)
      const dailyRate = freshOp?.dailyRate || member.dailyRate || 0
      if (dailyRate > 0) crewWithRates++
      return sum + (dailyRate * estimatedFieldDays)
    }, 0)
    const crewMissingRates = crew.length - crewWithRates

    // Field equipment costs - track missing rates
    let equipmentWithRates = 0
    const equipmentCost = assignedEquipment.reduce((sum, item) => {
      const freshItem = freshEquipment.find(e => e.id === item.id)
      const dailyRate = freshItem?.dailyRate || item.dailyRate || 0
      if (dailyRate > 0) equipmentWithRates++
      return sum + (dailyRate * estimatedFieldDays)
    }, 0)
    const equipmentMissingRates = assignedEquipment.length - equipmentWithRates

    const fieldCost = crewCost + equipmentCost

    // Post-field costs
    const postFieldCost = calculatePhaseCost(project?.postFieldPhase)

    // Grand total
    const total = preFieldCost + servicesCost + fieldCost + postFieldCost

    // Check for incomplete data
    const hasIncompleteData = servicesIncomplete > 0 || crewMissingRates > 0 ||
      equipmentMissingRates > 0 || (estimatedFieldDays === 0 && (crew.length > 0 || assignedEquipment.length > 0))

    return {
      preField: preFieldCost,
      services: servicesCost,
      servicesCount: services.length,
      servicesIncomplete,
      field: fieldCost,
      fieldBreakdown: {
        crew: crewCost,
        equipment: equipmentCost,
        crewCount: crew.length,
        crewMissingRates,
        equipmentCount: assignedEquipment.length,
        equipmentMissingRates
      },
      postField: postFieldCost,
      total,
      estimatedFieldDays,
      hasIncompleteData
    }
  }, [project, freshOperators, freshEquipment])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-6 h-6 bg-white/30 rounded" />
          <div className="h-5 bg-white/30 rounded w-40" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 text-white">
          <DollarSign className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Project Cost Estimate</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white">
            {formatCurrency(costs.total)}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-white/70" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/70" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-white/10 p-4 space-y-3">
          {/* Pre-Field */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-white/70" />
              <span className="text-sm">Pre-Field Tasks</span>
            </div>
            <span className="font-medium">
              {costs.preField > 0 ? formatCurrency(costs.preField) : '—'}
            </span>
          </div>

          {/* Services */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-white/70" />
              <span className="text-sm">
                Services
                {costs.servicesCount > 0 && (
                  <span className="text-white/60 ml-1">({costs.servicesCount})</span>
                )}
              </span>
              {costs.servicesIncomplete > 0 && (
                <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded">
                  {costs.servicesIncomplete} need rates
                </span>
              )}
            </div>
            <span className="font-medium">
              {costs.services > 0 ? formatCurrency(costs.services) : '—'}
            </span>
          </div>

          {/* Field Work */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-white/70" />
              <span className="text-sm">
                Field Work
                {costs.estimatedFieldDays > 0 && (
                  <span className="text-white/60 ml-1">
                    ({costs.estimatedFieldDays} day{costs.estimatedFieldDays !== 1 ? 's' : ''})
                  </span>
                )}
              </span>
            </div>
            <span className="font-medium">
              {costs.field > 0 ? formatCurrency(costs.field) : '—'}
            </span>
          </div>

          {/* Field breakdown (indented) */}
          {(costs.fieldBreakdown.crewCount > 0 || costs.fieldBreakdown.equipmentCount > 0) && (
            <div className="ml-6 space-y-1 text-white/80 text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Crew ({costs.fieldBreakdown.crewCount})
                  {costs.fieldBreakdown.crewMissingRates > 0 && (
                    <span className="text-amber-300">
                      · {costs.fieldBreakdown.crewMissingRates} no rate
                    </span>
                  )}
                </span>
                <span>{formatCurrency(costs.fieldBreakdown.crew)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Equipment ({costs.fieldBreakdown.equipmentCount})
                  {costs.fieldBreakdown.equipmentMissingRates > 0 && (
                    <span className="text-amber-300">
                      · {costs.fieldBreakdown.equipmentMissingRates} no rate
                    </span>
                  )}
                </span>
                <span>{formatCurrency(costs.fieldBreakdown.equipment)}</span>
              </div>
              {costs.estimatedFieldDays === 0 && (costs.fieldBreakdown.crewCount > 0 || costs.fieldBreakdown.equipmentCount > 0) && (
                <div className="text-amber-300 mt-1">
                  Set field days in Project Details to calculate costs
                </div>
              )}
            </div>
          )}

          {/* Post-Field */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-white/70" />
              <span className="text-sm">Post-Field Tasks</span>
            </div>
            <span className="font-medium">
              {costs.postField > 0 ? formatCurrency(costs.postField) : '—'}
            </span>
          </div>

          {/* Divider and Total */}
          <div className="pt-3 border-t border-white/20">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Total Estimate</span>
              </div>
              <span className="text-xl font-bold">
                {formatCurrency(costs.total)}
              </span>
            </div>
          </div>

          {/* Note */}
          <p className="text-xs text-white/60 mt-2">
            Costs calculated from task assignments, service rates, and field day estimates.
            Set daily rates for crew and equipment for accurate field calculations.
          </p>
        </div>
      )}
    </div>
  )
}
