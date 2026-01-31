/**
 * FieldCostCalculator.jsx
 * Calculates field work costs based on estimated field days,
 * assigned crew rates, and assigned equipment rates.
 *
 * @location src/components/projects/FieldCostCalculator.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Calculator,
  Users,
  Package,
  Plane,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react'
import { getOperators, getEquipment, getAircraft } from '../../lib/firestore'
import { useOrganization } from '../../hooks/useOrganization'
import { formatCurrency } from '../../lib/costEstimator'

export default function FieldCostCalculator({ project, onUpdate }) {
  const { organizationId } = useOrganization()
  const [freshOperators, setFreshOperators] = useState([])
  const [freshEquipment, setFreshEquipment] = useState([])
  const [freshAircraft, setFreshAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)

  const estimatedFieldDays = parseFloat(project?.estimatedFieldDays) || 0
  const crew = project?.crew || []
  const assignedEquipment = project?.assignedEquipment || []
  const assignedAircraft = project?.flightPlan?.aircraft || []

  // Load fresh operator, equipment, and aircraft data
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
        console.error('Error loading field cost data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [organizationId])

  // Calculate crew costs with fresh rates
  const crewCosts = useMemo(() => {
    return crew.map(member => {
      const freshOp = freshOperators.find(op => op.id === member.operatorId)
      const dailyRate = freshOp?.dailyRate || member.dailyRate || 0
      const cost = dailyRate * estimatedFieldDays

      return {
        ...member,
        operatorName: member.operatorName || `${freshOp?.firstName || ''} ${freshOp?.lastName || ''}`.trim(),
        dailyRate,
        cost,
        hasRate: dailyRate > 0
      }
    })
  }, [crew, freshOperators, estimatedFieldDays])

  // Calculate equipment costs with fresh rates
  const equipmentCosts = useMemo(() => {
    return assignedEquipment.map(item => {
      const freshItem = freshEquipment.find(e => e.id === item.id)
      const dailyRate = freshItem?.dailyRate || item.dailyRate || 0
      const cost = dailyRate * estimatedFieldDays

      return {
        ...item,
        name: item.name || freshItem?.name || 'Unknown Equipment',
        dailyRate,
        cost,
        hasRate: dailyRate > 0
      }
    })
  }, [assignedEquipment, freshEquipment, estimatedFieldDays])

  // Calculate aircraft costs with fresh rates
  const aircraftCosts = useMemo(() => {
    return assignedAircraft.map(item => {
      const freshItem = freshAircraft.find(a => a.id === item.id)
      const dailyRate = freshItem?.dailyRate || item.dailyRate || 0
      const cost = dailyRate * estimatedFieldDays

      return {
        ...item,
        name: item.nickname || freshItem?.nickname || `${item.make} ${item.model}`,
        dailyRate,
        cost,
        hasRate: dailyRate > 0
      }
    })
  }, [assignedAircraft, freshAircraft, estimatedFieldDays])

  // Calculate totals
  const totalCrewCost = crewCosts.reduce((sum, c) => sum + c.cost, 0)
  const totalEquipmentCost = equipmentCosts.reduce((sum, e) => sum + e.cost, 0)
  const totalAircraftCost = aircraftCosts.reduce((sum, a) => sum + a.cost, 0)
  const totalFieldCost = totalCrewCost + totalEquipmentCost + totalAircraftCost

  // Check for missing rates
  const crewMissingRates = crewCosts.filter(c => !c.hasRate).length
  const equipmentMissingRates = equipmentCosts.filter(e => !e.hasRate).length
  const aircraftMissingRates = aircraftCosts.filter(a => !a.hasRate).length

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-orange-600" />
          <h3 className="font-medium text-gray-900">Field Cost Calculator</h3>
        </div>
        <div className="flex items-center gap-3">
          {totalFieldCost > 0 && (
            <span className="text-lg font-semibold text-orange-600">
              {formatCurrency(totalFieldCost)}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Field Days Input */}
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Estimated Field Days</span>
              </div>
              <span className="text-lg font-bold text-orange-700">
                {estimatedFieldDays || '0'} days
              </span>
            </div>
            {!estimatedFieldDays && (
              <p className="text-xs text-orange-600 mt-1">
                Set field days in Project Details above to calculate costs
              </p>
            )}
          </div>

          {/* Crew Costs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Users className="w-4 h-4" />
                Crew ({crew.length})
              </h4>
              {totalCrewCost > 0 && (
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(totalCrewCost)}
                </span>
              )}
            </div>

            {crew.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No crew assigned</p>
            ) : (
              <div className="space-y-1">
                {crewCosts.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-sm"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{member.operatorName}</span>
                      <span className="text-gray-500 ml-2">({member.role})</span>
                    </div>
                    <div className="text-right">
                      {member.hasRate ? (
                        <>
                          <span className="text-gray-500">
                            {formatCurrency(member.dailyRate)}/day × {estimatedFieldDays}
                          </span>
                          <span className="ml-2 font-medium text-gray-900">
                            = {formatCurrency(member.cost)}
                          </span>
                        </>
                      ) : (
                        <span className="text-amber-600 text-xs">No daily rate</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {crewMissingRates > 0 && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {crewMissingRates} crew member{crewMissingRates !== 1 ? 's' : ''} missing daily rate
              </p>
            )}
          </div>

          {/* Equipment Costs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Package className="w-4 h-4" />
                Equipment ({assignedEquipment.length})
              </h4>
              {totalEquipmentCost > 0 && (
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(totalEquipmentCost)}
                </span>
              )}
            </div>

            {assignedEquipment.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No equipment assigned</p>
            ) : (
              <div className="space-y-1">
                {equipmentCosts.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-sm"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                      {item.category && (
                        <span className="text-gray-500 ml-2">({item.category})</span>
                      )}
                    </div>
                    <div className="text-right">
                      {item.hasRate ? (
                        <>
                          <span className="text-gray-500">
                            {formatCurrency(item.dailyRate)}/day × {estimatedFieldDays}
                          </span>
                          <span className="ml-2 font-medium text-gray-900">
                            = {formatCurrency(item.cost)}
                          </span>
                        </>
                      ) : (
                        <span className="text-amber-600 text-xs">No daily rate</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {equipmentMissingRates > 0 && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {equipmentMissingRates} equipment item{equipmentMissingRates !== 1 ? 's' : ''} missing daily rate
              </p>
            )}
          </div>

          {/* Aircraft Costs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Plane className="w-4 h-4" />
                Aircraft ({assignedAircraft.length})
              </h4>
              {totalAircraftCost > 0 && (
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(totalAircraftCost)}
                </span>
              )}
            </div>

            {assignedAircraft.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No aircraft assigned</p>
            ) : (
              <div className="space-y-1">
                {aircraftCosts.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-sm"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                      {item.make && item.model && (
                        <span className="text-gray-500 ml-2">({item.make} {item.model})</span>
                      )}
                    </div>
                    <div className="text-right">
                      {item.hasRate ? (
                        <>
                          <span className="text-gray-500">
                            {formatCurrency(item.dailyRate)}/day × {estimatedFieldDays}
                          </span>
                          <span className="ml-2 font-medium text-gray-900">
                            = {formatCurrency(item.cost)}
                          </span>
                        </>
                      ) : (
                        <span className="text-amber-600 text-xs">No daily rate</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {aircraftMissingRates > 0 && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {aircraftMissingRates} aircraft missing daily rate
              </p>
            )}
          </div>

          {/* Total */}
          {(crew.length > 0 || assignedEquipment.length > 0 || assignedAircraft.length > 0) && estimatedFieldDays > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Total Field Cost</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(totalFieldCost)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on {estimatedFieldDays} field day{estimatedFieldDays !== 1 ? 's' : ''} with {crew.length} crew, {assignedAircraft.length} aircraft, and {assignedEquipment.length} equipment
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
