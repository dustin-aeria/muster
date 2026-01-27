/**
 * Cost Estimator Library
 * Calculate project costs based on equipment and personnel rates
 *
 * @location src/lib/costEstimator.js
 */

// ============================================
// RATE TYPES
// ============================================

export const RATE_TYPES = {
  hourly: { label: 'Hourly', multiplier: 1 },
  daily: { label: 'Daily', multiplier: 8 }, // 8 hours per day
  weekly: { label: 'Weekly', multiplier: 40 } // 40 hours per week
}

export const COST_CATEGORIES = {
  equipment: { label: 'Equipment', icon: 'Package', color: 'bg-blue-100 text-blue-800' },
  personnel: { label: 'Personnel', icon: 'Users', color: 'bg-green-100 text-green-800' },
  travel: { label: 'Travel', icon: 'Car', color: 'bg-yellow-100 text-yellow-800' },
  materials: { label: 'Materials', icon: 'Box', color: 'bg-purple-100 text-purple-800' },
  permits: { label: 'Permits & Fees', icon: 'FileText', color: 'bg-orange-100 text-orange-800' },
  overhead: { label: 'Overhead', icon: 'Building', color: 'bg-gray-100 text-gray-800' },
  other: { label: 'Other', icon: 'MoreHorizontal', color: 'bg-gray-100 text-gray-800' }
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate equipment cost for a project
 * @param {Object} equipment - Equipment item with rates
 * @param {number} hours - Total hours of use
 * @param {string} rateType - 'hourly', 'daily', or 'weekly'
 * @returns {number} Total cost
 */
export function calculateEquipmentCost(equipment, hours, rateType = 'hourly') {
  if (!equipment) return 0

  // Get the appropriate rate
  let rate = 0
  if (rateType === 'hourly') {
    rate = equipment.hourlyRate || 0
  } else if (rateType === 'daily') {
    rate = equipment.dailyRate || equipment.hourlyRate * 8 || 0
    // Convert hours to days
    hours = Math.ceil(hours / 8)
  } else if (rateType === 'weekly') {
    rate = equipment.weeklyRate || equipment.dailyRate * 5 || equipment.hourlyRate * 40 || 0
    // Convert hours to weeks
    hours = Math.ceil(hours / 40)
  }

  return rate * hours
}

/**
 * Calculate personnel cost for a project
 * @param {Object} crewMember - Crew member with rates
 * @param {number} hours - Total hours worked
 * @param {string} rateType - 'hourly', 'daily', or 'weekly'
 * @returns {number} Total cost
 */
export function calculatePersonnelCost(crewMember, hours, rateType = 'hourly') {
  if (!crewMember) return 0

  // Get the appropriate rate
  let rate = 0
  if (rateType === 'hourly') {
    rate = crewMember.hourlyRate || 0
  } else if (rateType === 'daily') {
    rate = crewMember.dailyRate || crewMember.hourlyRate * 8 || 0
    // Convert hours to days
    hours = Math.ceil(hours / 8)
  } else if (rateType === 'weekly') {
    rate = crewMember.weeklyRate || crewMember.dailyRate * 5 || crewMember.hourlyRate * 40 || 0
    // Convert hours to weeks
    hours = Math.ceil(hours / 40)
  }

  return rate * hours
}

/**
 * Calculate total project cost estimate
 * @param {Object} project - Project with assignments
 * @param {Array} equipment - Equipment list with rates
 * @param {Array} crew - Crew list with rates
 * @param {Object} options - Calculation options
 * @returns {Object} Cost breakdown
 */
export function calculateProjectCost(project, equipment = [], crew = [], options = {}) {
  const {
    estimatedHours = 8,
    rateType = 'hourly',
    includeOverhead = true,
    overheadPercent = 15,
    includeTax = false,
    taxPercent = 5,
    customLineItems = []
  } = options

  const breakdown = {
    equipment: [],
    personnel: [],
    customItems: [],
    subtotals: {},
    overhead: 0,
    tax: 0,
    total: 0
  }

  // Calculate equipment costs
  const assignedEquipment = project.equipment || []
  let equipmentTotal = 0

  for (const assignment of assignedEquipment) {
    const item = equipment.find(e => e.id === assignment.equipmentId)
    if (item) {
      const hours = assignment.hours || estimatedHours
      const cost = calculateEquipmentCost(item, hours, rateType)
      breakdown.equipment.push({
        id: item.id,
        name: item.name,
        category: item.category,
        hours,
        rateType,
        rate: item[`${rateType}Rate`] || item.hourlyRate || 0,
        cost
      })
      equipmentTotal += cost
    }
  }
  breakdown.subtotals.equipment = equipmentTotal

  // Calculate personnel costs
  const assignedCrew = project.crew || []
  let personnelTotal = 0

  for (const assignment of assignedCrew) {
    const member = crew.find(c => c.id === assignment.crewMemberId)
    if (member) {
      const hours = assignment.hours || estimatedHours
      const cost = calculatePersonnelCost(member, hours, rateType)
      breakdown.personnel.push({
        id: member.id,
        name: member.name,
        role: member.role,
        hours,
        rateType,
        rate: member[`${rateType}Rate`] || member.hourlyRate || 0,
        cost
      })
      personnelTotal += cost
    }
  }
  breakdown.subtotals.personnel = personnelTotal

  // Add custom line items
  let customTotal = 0
  for (const item of customLineItems) {
    breakdown.customItems.push({
      ...item,
      cost: item.cost || item.amount || 0
    })
    customTotal += item.cost || item.amount || 0
  }
  breakdown.subtotals.custom = customTotal

  // Calculate subtotal
  const subtotal = equipmentTotal + personnelTotal + customTotal
  breakdown.subtotals.subtotal = subtotal

  // Calculate overhead
  if (includeOverhead) {
    breakdown.overhead = subtotal * (overheadPercent / 100)
  }

  // Calculate pre-tax total
  const preTaxTotal = subtotal + breakdown.overhead

  // Calculate tax
  if (includeTax) {
    breakdown.tax = preTaxTotal * (taxPercent / 100)
  }

  // Calculate total
  breakdown.total = preTaxTotal + breakdown.tax

  return breakdown
}

/**
 * Generate a cost estimate summary
 */
export function generateCostSummary(breakdown) {
  const summary = []

  if (breakdown.subtotals.equipment > 0) {
    summary.push({
      category: 'Equipment',
      items: breakdown.equipment.length,
      total: breakdown.subtotals.equipment
    })
  }

  if (breakdown.subtotals.personnel > 0) {
    summary.push({
      category: 'Personnel',
      items: breakdown.personnel.length,
      total: breakdown.subtotals.personnel
    })
  }

  if (breakdown.subtotals.custom > 0) {
    summary.push({
      category: 'Other Items',
      items: breakdown.customItems.length,
      total: breakdown.subtotals.custom
    })
  }

  if (breakdown.overhead > 0) {
    summary.push({
      category: 'Overhead',
      items: 1,
      total: breakdown.overhead
    })
  }

  if (breakdown.tax > 0) {
    summary.push({
      category: 'Tax',
      items: 1,
      total: breakdown.tax
    })
  }

  return summary
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// ============================================
// PHASE COST CALCULATIONS
// ============================================

/**
 * Calculate total cost for a single task
 * @param {Object} task - Task with costItems array
 * @returns {number} Total cost of all cost items in task
 */
export function calculateTaskCost(task) {
  if (!task || !Array.isArray(task.costItems)) return 0
  return task.costItems.reduce((sum, item) => sum + (item.total || 0), 0)
}

/**
 * Calculate total cost for a phase (pre-field or post-field)
 * @param {Object} phase - Phase with tasks array
 * @returns {number} Total cost of all tasks in phase
 */
export function calculatePhaseCost(phase) {
  if (!phase || !Array.isArray(phase.tasks)) return 0
  return phase.tasks.reduce((sum, task) => sum + calculateTaskCost(task), 0)
}

/**
 * Calculate full project cost including pre-field, field work, and post-field
 * @param {Object} project - Project document
 * @param {Array} equipment - Equipment list with rates
 * @param {Array} crew - Crew list with rates
 * @param {Object} options - Options for field cost calculation
 * @returns {Object} Complete cost breakdown
 */
export function calculateFullProjectCost(project, equipment = [], crew = [], options = {}) {
  // Pre-field costs
  const preFieldCost = calculatePhaseCost(project?.preFieldPhase)

  // Field costs (existing calculation)
  const fieldBreakdown = calculateProjectCost(project, equipment, crew, options)
  const fieldCost = fieldBreakdown.total

  // Post-field costs
  const postFieldCost = calculatePhaseCost(project?.postFieldPhase)

  // Grand total
  const grandTotal = preFieldCost + fieldCost + postFieldCost

  return {
    preField: {
      total: preFieldCost,
      tasks: project?.preFieldPhase?.tasks?.length || 0
    },
    field: {
      total: fieldCost,
      breakdown: fieldBreakdown
    },
    postField: {
      total: postFieldCost,
      tasks: project?.postFieldPhase?.tasks?.length || 0
    },
    grandTotal
  }
}

/**
 * Calculate cost item total based on hours/quantity and rate
 * @param {number} hours - Hours or quantity
 * @param {number} rate - Rate per unit
 * @param {string} rateType - 'hourly' or 'daily'
 * @returns {number} Calculated total
 */
export function calculateCostItemTotal(hours, rate, rateType = 'hourly') {
  if (!hours || !rate) return 0

  if (rateType === 'daily') {
    // For daily rates, hours represents days
    return hours * rate
  }

  // Default to hourly
  return hours * rate
}

/**
 * Get phase cost summary with breakdown by cost type
 * @param {Object} phase - Phase with tasks array
 * @returns {Object} Summary with totals by type
 */
export function getPhaseCostSummary(phase) {
  const summary = {
    total: 0,
    byType: {
      personnel: 0,
      service: 0,
      equipment: 0,
      fleet: 0,
      fixed: 0
    },
    taskCount: 0,
    completedTasks: 0
  }

  if (!phase || !Array.isArray(phase.tasks)) return summary

  summary.taskCount = phase.tasks.length
  summary.completedTasks = phase.tasks.filter(t => t.status === 'completed').length

  phase.tasks.forEach(task => {
    if (Array.isArray(task.costItems)) {
      task.costItems.forEach(item => {
        const cost = item.total || 0
        summary.total += cost

        const type = item.type || 'fixed'
        if (summary.byType[type] !== undefined) {
          summary.byType[type] += cost
        } else {
          summary.byType.fixed += cost
        }
      })
    }
  })

  return summary
}

export default {
  calculateEquipmentCost,
  calculatePersonnelCost,
  calculateProjectCost,
  generateCostSummary,
  formatCurrency,
  calculateTaskCost,
  calculatePhaseCost,
  calculateFullProjectCost,
  calculateCostItemTotal,
  getPhaseCostSummary,
  RATE_TYPES,
  COST_CATEGORIES
}
