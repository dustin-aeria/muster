/**
 * ProjectCosts.jsx
 * Dedicated cost breakdown tab for project budgeting
 * Aggregates all costs from various project components
 *
 * @location src/components/projects/ProjectCosts.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  DollarSign,
  Users,
  Package,
  Plane,
  Briefcase,
  ClipboardCheck,
  PackageCheck,
  Calendar,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calculator,
  Layers,
  Clock,
  Percent,
  Receipt
} from 'lucide-react'
import { getOperators, getEquipment, getAircraft } from '../../lib/firestore'
import { getExpensesByProject, calculateExpenseTotals, formatCurrency as formatExpenseCurrency } from '../../lib/firestoreExpenses'
import { useOrganization } from '../../hooks/useOrganization'
import { formatCurrency, calculatePhaseCost } from '../../lib/costEstimator'
import { calculateServiceCost } from './ProjectServicesSection'
import { UNIT_TYPES } from '../../pages/Services'

export default function ProjectCosts({ project }) {
  const { organizationId } = useOrganization()
  const [freshOperators, setFreshOperators] = useState([])
  const [freshEquipment, setFreshEquipment] = useState([])
  const [freshAircraft, setFreshAircraft] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    preField: true,
    services: true,
    field: true,
    postField: true,
    expenses: true
  })

  // Load fresh data for calculations
  useEffect(() => {
    const loadData = async () => {
      if (!organizationId || !project?.id) return
      try {
        const [ops, equip, aircraft, projectExpenses] = await Promise.all([
          getOperators(organizationId),
          getEquipment(organizationId),
          getAircraft(organizationId),
          getExpensesByProject(organizationId, project.id)
        ])
        setFreshOperators(ops)
        setFreshEquipment(equip)
        setFreshAircraft(aircraft)
        setExpenses(projectExpenses)
      } catch (err) {
        console.error('Error loading cost data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [organizationId, project?.id])

  // Calculate all costs
  const costs = useMemo(() => {
    const estimatedFieldDays = parseFloat(project?.estimatedFieldDays) || 0
    const crew = project?.crew || []
    const assignedEquipment = project?.assignedEquipment || []
    const assignedAircraft = project?.flightPlan?.aircraft || []
    const services = project?.projectServices || []

    // Pre-field costs
    const preFieldTasks = project?.preFieldPhase?.tasks || []
    const preFieldCost = calculatePhaseCost(project?.preFieldPhase)

    // Services costs - using enhanced pricing model
    let servicesDetails = []
    const servicesCost = services.reduce((sum, s) => {
      const cost = calculateServiceCost(s)
      const pricingType = s.pricingType || 'time_based'
      const quantity = parseFloat(s.quantity) || 0
      const unitTypeInfo = UNIT_TYPES?.find(u => u.value === s.unitType)

      let rateInfo = ''
      if (pricingType === 'fixed') {
        rateInfo = 'Fixed price'
      } else if (pricingType === 'per_unit') {
        rateInfo = quantity > 0
          ? `${quantity} ${unitTypeInfo?.plural || 'units'} × ${formatCurrency(s.unitRate || 0)}`
          : `${unitTypeInfo?.label || 'Per unit'} pricing`
      } else {
        // time_based
        const rateType = s.rateType || 'daily'
        if (rateType === 'fixed' && s.fixedRate > 0) {
          rateInfo = 'Fixed'
        } else if (s.dailyRate > 0) {
          const qty = quantity > 0 ? quantity : 1
          rateInfo = `${formatCurrency(s.dailyRate)}/day × ${qty}`
        } else if (s.hourlyRate > 0) {
          const qty = quantity > 0 ? quantity : 1
          rateInfo = `${formatCurrency(s.hourlyRate)}/hr × ${qty}`
        } else if (s.weeklyRate > 0) {
          const qty = quantity > 0 ? quantity : 1
          rateInfo = `${formatCurrency(s.weeklyRate)}/wk × ${qty}`
        }
      }

      // Add extra info
      let extras = []
      if (s.baseFee > 0) extras.push(`+${formatCurrency(s.baseFee)} base`)
      if ((s.selectedDeliverables || []).length > 0) {
        const addOnCount = s.selectedDeliverables.filter(dId => {
          const d = s.deliverables?.find(del => del.id === dId)
          return d && !d.included && d.price > 0
        }).length
        if (addOnCount > 0) extras.push(`+${addOnCount} add-on${addOnCount > 1 ? 's' : ''}`)
      }
      if ((s.selectedModifiers || []).length > 0) {
        extras.push(`${s.selectedModifiers.length} modifier${s.selectedModifiers.length > 1 ? 's' : ''}`)
      }

      servicesDetails.push({
        name: s.name,
        cost,
        rateInfo,
        extras: extras.join(', '),
        pricingType,
        hasCost: cost > 0
      })

      return sum + cost
    }, 0)

    // Crew costs
    let crewDetails = []
    const crewCost = crew.reduce((sum, member) => {
      const freshOp = freshOperators.find(op => op.id === member.operatorId)
      const dailyRate = freshOp?.dailyRate || member.dailyRate || 0
      const cost = dailyRate * estimatedFieldDays
      const name = member.operatorName || `${freshOp?.firstName || ''} ${freshOp?.lastName || ''}`.trim()

      crewDetails.push({
        name,
        role: member.role,
        dailyRate,
        cost,
        hasCost: dailyRate > 0 && estimatedFieldDays > 0
      })

      return sum + cost
    }, 0)

    // Equipment costs
    let equipmentDetails = []
    const equipmentCost = assignedEquipment.reduce((sum, item) => {
      const freshItem = freshEquipment.find(e => e.id === item.id)
      const dailyRate = freshItem?.dailyRate || item.dailyRate || 0
      const cost = dailyRate * estimatedFieldDays

      equipmentDetails.push({
        name: item.name || freshItem?.name || 'Unknown',
        category: item.category,
        dailyRate,
        cost,
        hasCost: dailyRate > 0 && estimatedFieldDays > 0
      })

      return sum + cost
    }, 0)

    // Aircraft costs
    let aircraftDetails = []
    const aircraftCost = assignedAircraft.reduce((sum, item) => {
      const freshItem = freshAircraft.find(a => a.id === item.id)
      const dailyRate = freshItem?.dailyRate || item.dailyRate || 0
      const cost = dailyRate * estimatedFieldDays
      const name = freshItem?.nickname || item.nickname || `${item.make} ${item.model}`

      aircraftDetails.push({
        name,
        make: item.make,
        model: item.model,
        dailyRate,
        cost,
        hasCost: dailyRate > 0 && estimatedFieldDays > 0
      })

      return sum + cost
    }, 0)

    const fieldCost = crewCost + equipmentCost + aircraftCost

    // Post-field costs
    const postFieldTasks = project?.postFieldPhase?.tasks || []
    const postFieldCost = calculatePhaseCost(project?.postFieldPhase)

    // Expenses (actual tracked expenses)
    const expenseTotals = calculateExpenseTotals(expenses)

    // Grand total (estimates + actual expenses)
    const total = preFieldCost + servicesCost + fieldCost + postFieldCost + expenseTotals.byStatus.approved

    return {
      preField: {
        cost: preFieldCost,
        taskCount: preFieldTasks.length
      },
      services: {
        cost: servicesCost,
        details: servicesDetails,
        count: services.length
      },
      field: {
        cost: fieldCost,
        crew: { cost: crewCost, details: crewDetails },
        equipment: { cost: equipmentCost, details: equipmentDetails },
        aircraft: { cost: aircraftCost, details: aircraftDetails },
        estimatedFieldDays
      },
      postField: {
        cost: postFieldCost,
        taskCount: postFieldTasks.length
      },
      expenses: {
        total: expenseTotals.total,
        approved: expenseTotals.byStatus.approved,
        pending: expenseTotals.byStatus.draft + expenseTotals.byStatus.submitted,
        billable: expenseTotals.billable,
        count: expenseTotals.count,
        byCategory: expenseTotals.byCategory
      },
      total
    }
  }, [project, freshOperators, freshEquipment, freshAircraft, expenses])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading cost data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-green-600" />
            Project Cost Breakdown
          </h2>
          <p className="text-gray-600 mt-1">
            Estimated costs based on assigned resources and rates
          </p>
        </div>
      </div>

      {/* Total Summary Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Total Project Estimate</p>
            <p className="text-4xl font-bold mt-1">{formatCurrency(costs.total)}</p>
          </div>
          <DollarSign className="w-16 h-16 text-white/20" />
        </div>
        <div className="grid grid-cols-5 gap-4 mt-6 pt-4 border-t border-white/20">
          <div>
            <p className="text-green-100 text-xs">Pre-Field</p>
            <p className="text-lg font-semibold">{formatCurrency(costs.preField.cost)}</p>
          </div>
          <div>
            <p className="text-green-100 text-xs">Services</p>
            <p className="text-lg font-semibold">{formatCurrency(costs.services.cost)}</p>
          </div>
          <div>
            <p className="text-green-100 text-xs">Field Work</p>
            <p className="text-lg font-semibold">{formatCurrency(costs.field.cost)}</p>
          </div>
          <div>
            <p className="text-green-100 text-xs">Post-Field</p>
            <p className="text-lg font-semibold">{formatCurrency(costs.postField.cost)}</p>
          </div>
          <div>
            <p className="text-green-100 text-xs">Expenses</p>
            <p className="text-lg font-semibold">{formatCurrency(costs.expenses.approved)}</p>
          </div>
        </div>
      </div>

      {/* Field Days Notice */}
      {costs.field.estimatedFieldDays === 0 && (costs.field.crew.details.length > 0 || costs.field.aircraft.details.length > 0 || costs.field.equipment.details.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Field days not set</p>
            <p className="text-sm text-amber-700">
              Set "Estimated Field Days" in the Overview tab to calculate crew, aircraft, and equipment costs.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {/* Pre-Field Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('preField')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Pre-Field Tasks</h3>
                <p className="text-sm text-gray-500">{costs.preField.taskCount} tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(costs.preField.cost)}
              </span>
              {expandedSections.preField ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          {expandedSections.preField && costs.preField.taskCount > 0 && (
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              <p className="text-sm text-gray-600">
                Costs calculated from task assignments in the Pre-Field tab.
              </p>
            </div>
          )}
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('services')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Services</h3>
                <p className="text-sm text-gray-500">{costs.services.count} services</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(costs.services.cost)}
              </span>
              {expandedSections.services ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          {expandedSections.services && costs.services.details.length > 0 && (
            <div className="border-t border-gray-100">
              {costs.services.details.map((service, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        service.pricingType === 'time_based' ? 'bg-blue-100 text-blue-700' :
                        service.pricingType === 'per_unit' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {service.pricingType === 'time_based' && <Clock className="w-3 h-3 inline mr-0.5" />}
                        {service.pricingType === 'per_unit' && <Layers className="w-3 h-3 inline mr-0.5" />}
                        {service.pricingType === 'fixed' && <DollarSign className="w-3 h-3 inline mr-0.5" />}
                        {service.pricingType === 'time_based' ? 'Time' :
                         service.pricingType === 'per_unit' ? 'Unit' : 'Fixed'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{service.rateInfo || 'No rate set'}</p>
                    {service.extras && (
                      <p className="text-xs text-gray-400">{service.extras}</p>
                    )}
                  </div>
                  <span className={`font-semibold flex-shrink-0 ml-4 ${service.hasCost ? 'text-gray-900' : 'text-gray-400'}`}>
                    {service.hasCost ? formatCurrency(service.cost) : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Field Work Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('field')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Field Work</h3>
                <p className="text-sm text-gray-500">
                  {costs.field.estimatedFieldDays > 0
                    ? `${costs.field.estimatedFieldDays} day${costs.field.estimatedFieldDays !== 1 ? 's' : ''}`
                    : 'No field days set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(costs.field.cost)}
              </span>
              {expandedSections.field ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          {expandedSections.field && (
            <div className="border-t border-gray-100">
              {/* Crew */}
              {costs.field.crew.details.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <h4 className="font-medium text-gray-700">Crew ({costs.field.crew.details.length})</h4>
                    <span className="ml-auto font-semibold text-gray-900">
                      {formatCurrency(costs.field.crew.cost)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {costs.field.crew.details.map((member, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                        <div>
                          <span className="font-medium text-gray-900">{member.name}</span>
                          <span className="text-gray-500 ml-2">({member.role})</span>
                        </div>
                        <div className="text-right">
                          {member.hasCost ? (
                            <>
                              <span className="text-gray-500">
                                {formatCurrency(member.dailyRate)}/day × {costs.field.estimatedFieldDays}
                              </span>
                              <span className="ml-2 font-medium text-gray-900">
                                = {formatCurrency(member.cost)}
                              </span>
                            </>
                          ) : (
                            <span className="text-amber-600">
                              {member.dailyRate === 0 ? 'No rate' : 'Set field days'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aircraft */}
              {costs.field.aircraft.details.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Plane className="w-4 h-4 text-gray-500" />
                    <h4 className="font-medium text-gray-700">Aircraft ({costs.field.aircraft.details.length})</h4>
                    <span className="ml-auto font-semibold text-gray-900">
                      {formatCurrency(costs.field.aircraft.cost)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {costs.field.aircraft.details.map((ac, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                        <div>
                          <span className="font-medium text-gray-900">{ac.name}</span>
                          {ac.make && ac.model && (
                            <span className="text-gray-500 ml-2">({ac.make} {ac.model})</span>
                          )}
                        </div>
                        <div className="text-right">
                          {ac.hasCost ? (
                            <>
                              <span className="text-gray-500">
                                {formatCurrency(ac.dailyRate)}/day × {costs.field.estimatedFieldDays}
                              </span>
                              <span className="ml-2 font-medium text-gray-900">
                                = {formatCurrency(ac.cost)}
                              </span>
                            </>
                          ) : (
                            <span className="text-amber-600">
                              {ac.dailyRate === 0 ? 'No rate' : 'Set field days'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment */}
              {costs.field.equipment.details.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-gray-500" />
                    <h4 className="font-medium text-gray-700">Equipment ({costs.field.equipment.details.length})</h4>
                    <span className="ml-auto font-semibold text-gray-900">
                      {formatCurrency(costs.field.equipment.cost)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {costs.field.equipment.details.map((eq, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                        <div>
                          <span className="font-medium text-gray-900">{eq.name}</span>
                          {eq.category && (
                            <span className="text-gray-500 ml-2">({eq.category})</span>
                          )}
                        </div>
                        <div className="text-right">
                          {eq.hasCost ? (
                            <>
                              <span className="text-gray-500">
                                {formatCurrency(eq.dailyRate)}/day × {costs.field.estimatedFieldDays}
                              </span>
                              <span className="ml-2 font-medium text-gray-900">
                                = {formatCurrency(eq.cost)}
                              </span>
                            </>
                          ) : (
                            <span className="text-amber-600">
                              {eq.dailyRate === 0 ? 'No rate' : 'Set field days'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {costs.field.crew.details.length === 0 && costs.field.aircraft.details.length === 0 && costs.field.equipment.details.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <p>No crew, aircraft, or equipment assigned yet.</p>
                  <p className="text-sm mt-1">Assign resources in the Field phase tabs.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post-Field Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('postField')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <PackageCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Post-Field Tasks</h3>
                <p className="text-sm text-gray-500">{costs.postField.taskCount} tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(costs.postField.cost)}
              </span>
              {expandedSections.postField ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          {expandedSections.postField && costs.postField.taskCount > 0 && (
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              <p className="text-sm text-gray-600">
                Costs calculated from task assignments in the Post-Field tab.
              </p>
            </div>
          )}
        </div>

        {/* Expenses Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('expenses')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Tracked Expenses</h3>
                <p className="text-sm text-gray-500">{costs.expenses.count} expense{costs.expenses.count !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(costs.expenses.approved)}
              </span>
              {expandedSections.expenses ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>
          {expandedSections.expenses && (
            <div className="border-t border-gray-100">
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-600 font-medium">Approved</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(costs.expenses.approved)}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs text-amber-600 font-medium">Pending</p>
                    <p className="text-lg font-bold text-amber-700">{formatCurrency(costs.expenses.pending)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium">Billable</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(costs.expenses.billable)}</p>
                  </div>
                </div>

                {/* Category breakdown */}
                {Object.keys(costs.expenses.byCategory).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">By Category</h4>
                    <div className="space-y-2">
                      {Object.entries(costs.expenses.byCategory).map(([category, amount]) => (
                        <div key={category} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                          <span className="font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</span>
                          <span className="text-gray-700">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {costs.expenses.count === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No expenses tracked yet. Add expenses in the Expenses tab.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      <p className="text-sm text-gray-500 text-center">
        Costs are estimates based on assigned rates. Actual costs may vary.
        Edit rates in Operators, Equipment, Aircraft, and Services libraries.
      </p>
    </div>
  )
}
