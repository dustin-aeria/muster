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
import { getOperators, getEquipment, getAircraft } from '../../lib/firestore'
import { useOrganization } from '../../hooks/useOrganization'
import { formatCurrency, calculatePhaseCost } from '../../lib/costEstimator'
import { calculateServiceCost } from './ProjectServicesSection'

export default function ProjectCostSummary({ project }) {
  const { organizationId } = useOrganization()
  const [freshOperators, setFreshOperators] = useState([])
  const [freshEquipment, setFreshEquipment] = useState([])
  const [freshAircraft, setFreshAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  // Load fresh data for field calculations
  useEffect(() => {
    const loadData = async () => {
      if (!organizationId) return
      try {
        const [ops, equip, aircraft] = await Promise.all([
          getOperators(organizationId),
          getEquipment(organizationId),
          getAircraft(organizationId)
        ])
        setFreshOperators(ops)
        setFreshEquipment(equip)
        setFreshAircraft(aircraft)
      } catch (err) {
        console.error('Error loading cost data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [organizationId])

  // Calculate all costs
  const costs = useMemo(() => {
    const estimatedFieldDays = parseFloat(project?.estimatedFieldDays) || 0
    const crew = project?.crew || []
    const assignedEquipment = project?.assignedEquipment || []
    const assignedAircraft = project?.flightPlan?.aircraft || []
    const services = project?.projectServices || []

    // Pre-field costs
    const preFieldCost = calculatePhaseCost(project?.preFieldPhase)

    // Services costs - using enhanced pricing model
    let servicesWithCost = 0
    const servicesCost = services.reduce((sum, s) => {
      const cost = calculateServiceCost(s)
      if (cost > 0) servicesWithCost++
      return sum + cost
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

    // Aircraft costs - track missing rates
    let aircraftWithRates = 0
    const aircraftCost = assignedAircraft.reduce((sum, item) => {
      const freshItem = freshAircraft.find(a => a.id === item.id)
      const dailyRate = freshItem?.dailyRate || item.dailyRate || 0
      if (dailyRate > 0) aircraftWithRates++
      return sum + (dailyRate * estimatedFieldDays)
    }, 0)
    const aircraftMissingRates = assignedAircraft.length - aircraftWithRates

    const fieldCost = crewCost + equipmentCost + aircraftCost

    // Post-field costs
    const postFieldCost = calculatePhaseCost(project?.postFieldPhase)

    // Grand total
    const total = preFieldCost + servicesCost + fieldCost + postFieldCost

    // Check for incomplete data
    const hasIncompleteData = servicesIncomplete > 0 || crewMissingRates > 0 ||
      equipmentMissingRates > 0 || aircraftMissingRates > 0 ||
      (estimatedFieldDays === 0 && (crew.length > 0 || assignedEquipment.length > 0 || assignedAircraft.length > 0))

    return {
      preField: preFieldCost,
      services: servicesCost,
      servicesCount: services.length,
      servicesIncomplete,
      field: fieldCost,
      fieldBreakdown: {
        crew: crewCost,
        equipment: equipmentCost,
        aircraft: aircraftCost,
        crewCount: crew.length,
        crewMissingRates,
        equipmentCount: assignedEquipment.length,
        equipmentMissingRates,
        aircraftCount: assignedAircraft.length,
        aircraftMissingRates
      },
      postField: postFieldCost,
      total,
      estimatedFieldDays,
      hasIncompleteData
    }
  }, [project, freshOperators, freshEquipment, freshAircraft])

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
          {(costs.fieldBreakdown.crewCount > 0 || costs.fieldBreakdown.equipmentCount > 0 || costs.fieldBreakdown.aircraftCount > 0) && (
            <div className="ml-6 space-y-1 text-white/80 text-xs">
              {costs.fieldBreakdown.crewCount > 0 && (
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
              )}
              {costs.fieldBreakdown.aircraftCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    Aircraft ({costs.fieldBreakdown.aircraftCount})
                    {costs.fieldBreakdown.aircraftMissingRates > 0 && (
                      <span className="text-amber-300">
                        · {costs.fieldBreakdown.aircraftMissingRates} no rate
                      </span>
                    )}
                  </span>
                  <span>{formatCurrency(costs.fieldBreakdown.aircraft)}</span>
                </div>
              )}
              {costs.fieldBreakdown.equipmentCount > 0 && (
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
              )}
              {costs.estimatedFieldDays === 0 && (costs.fieldBreakdown.crewCount > 0 || costs.fieldBreakdown.equipmentCount > 0 || costs.fieldBreakdown.aircraftCount > 0) && (
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
