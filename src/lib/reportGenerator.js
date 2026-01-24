/**
 * Report Generator Service
 * Generate various operational reports
 *
 * @location src/lib/reportGenerator.js
 */

import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from 'date-fns'

// ============================================
// REPORT TYPES
// ============================================

export const REPORT_TYPES = {
  operations_summary: {
    label: 'Operations Summary',
    description: 'Overview of all operational activities',
    icon: 'Activity'
  },
  flight_log: {
    label: 'Flight Log Report',
    description: 'Detailed flight records and statistics',
    icon: 'Plane'
  },
  equipment_status: {
    label: 'Equipment Status',
    description: 'Equipment inventory and maintenance status',
    icon: 'Package'
  },
  safety_metrics: {
    label: 'Safety Metrics',
    description: 'Incident trends and safety performance',
    icon: 'Shield'
  },
  training_compliance: {
    label: 'Training Compliance',
    description: 'Certification status and training records',
    icon: 'GraduationCap'
  },
  project_summary: {
    label: 'Project Summary',
    description: 'Project status and performance metrics',
    icon: 'FolderKanban'
  },
  maintenance_report: {
    label: 'Maintenance Report',
    description: 'Equipment maintenance history and schedules',
    icon: 'Wrench'
  }
}

export const DATE_RANGES = {
  this_week: { label: 'This Week', getValue: () => ({ start: startOfWeek(new Date()), end: endOfWeek(new Date()) }) },
  last_week: { label: 'Last Week', getValue: () => {
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    return { start: startOfWeek(lastWeek), end: endOfWeek(lastWeek) }
  }},
  this_month: { label: 'This Month', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  last_month: { label: 'Last Month', getValue: () => {
    const lastMonth = subMonths(new Date(), 1)
    return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
  }},
  last_3_months: { label: 'Last 3 Months', getValue: () => ({ start: startOfMonth(subMonths(new Date(), 2)), end: endOfMonth(new Date()) }) },
  last_6_months: { label: 'Last 6 Months', getValue: () => ({ start: startOfMonth(subMonths(new Date(), 5)), end: endOfMonth(new Date()) }) },
  this_year: { label: 'This Year', getValue: () => ({ start: new Date(new Date().getFullYear(), 0, 1), end: new Date() }) },
  custom: { label: 'Custom Range', getValue: null }
}

// ============================================
// REPORT GENERATION
// ============================================

/**
 * Generate operations summary report data
 */
export function generateOperationsSummaryReport(data) {
  const { projects = [], flights = [], incidents = [], equipment = [], operators = [] } = data
  const { startDate, endDate } = data.dateRange || {}

  // Filter by date range
  const filteredProjects = filterByDateRange(projects, 'createdAt', startDate, endDate)
  const filteredFlights = filterByDateRange(flights, 'flightDate', startDate, endDate)
  const filteredIncidents = filterByDateRange(incidents, 'incidentDate', startDate, endDate)

  return {
    title: 'Operations Summary Report',
    dateRange: { start: startDate, end: endDate },
    generatedAt: new Date(),
    summary: {
      totalProjects: filteredProjects.length,
      activeProjects: filteredProjects.filter(p => p.status === 'active').length,
      completedProjects: filteredProjects.filter(p => p.status === 'completed').length,
      totalFlights: filteredFlights.length,
      totalFlightHours: calculateTotalFlightHours(filteredFlights),
      totalIncidents: filteredIncidents.length,
      totalEquipment: equipment.length,
      equipmentAvailable: equipment.filter(e => e.status === 'available').length,
      activeOperators: operators.filter(o => o.status === 'active').length
    },
    sections: [
      {
        title: 'Project Status Distribution',
        type: 'chart',
        chartType: 'pie',
        data: getStatusDistribution(filteredProjects)
      },
      {
        title: 'Flights by Purpose',
        type: 'chart',
        chartType: 'bar',
        data: groupBy(filteredFlights, 'purpose')
      },
      {
        title: 'Monthly Trends',
        type: 'chart',
        chartType: 'line',
        data: getMonthlyTrends(filteredFlights, 'flightDate')
      }
    ]
  }
}

/**
 * Generate flight log report data
 */
export function generateFlightLogReport(data) {
  const { flights = [], aircraft = [], pilots = [] } = data
  const { startDate, endDate } = data.dateRange || {}

  const filteredFlights = filterByDateRange(flights, 'flightDate', startDate, endDate)
  const completedFlights = filteredFlights.filter(f => f.status === 'completed')

  return {
    title: 'Flight Log Report',
    dateRange: { start: startDate, end: endDate },
    generatedAt: new Date(),
    summary: {
      totalFlights: filteredFlights.length,
      completedFlights: completedFlights.length,
      abortedFlights: filteredFlights.filter(f => f.status === 'aborted').length,
      totalFlightHours: calculateTotalFlightHours(completedFlights),
      totalDistance: calculateTotalDistance(completedFlights),
      uniqueAircraft: [...new Set(completedFlights.map(f => f.aircraftId))].length,
      uniquePilots: [...new Set(completedFlights.map(f => f.pilotId))].length
    },
    byAircraft: aircraft.map(ac => ({
      name: ac.nickname || ac.name,
      flightCount: completedFlights.filter(f => f.aircraftId === ac.id).length,
      flightHours: calculateTotalFlightHours(completedFlights.filter(f => f.aircraftId === ac.id))
    })).filter(a => a.flightCount > 0),
    byPilot: pilots.map(pilot => ({
      name: `${pilot.firstName} ${pilot.lastName}`,
      flightCount: completedFlights.filter(f => f.pilotId === pilot.id).length,
      flightHours: calculateTotalFlightHours(completedFlights.filter(f => f.pilotId === pilot.id))
    })).filter(p => p.flightCount > 0),
    recentFlights: completedFlights.slice(0, 20)
  }
}

/**
 * Generate safety metrics report data
 */
export function generateSafetyMetricsReport(data) {
  const { incidents = [], capas = [], hazards = [], inspections = [] } = data
  const { startDate, endDate } = data.dateRange || {}

  const filteredIncidents = filterByDateRange(incidents, 'incidentDate', startDate, endDate)
  const filteredCapas = filterByDateRange(capas, 'createdAt', startDate, endDate)
  const filteredInspections = filterByDateRange(inspections, 'scheduledDate', startDate, endDate)

  return {
    title: 'Safety Metrics Report',
    dateRange: { start: startDate, end: endDate },
    generatedAt: new Date(),
    summary: {
      totalIncidents: filteredIncidents.length,
      openIncidents: filteredIncidents.filter(i => i.status !== 'closed' && i.status !== 'resolved').length,
      highSeverityIncidents: filteredIncidents.filter(i => i.severity === 'high' || i.severity === 'critical').length,
      totalCapas: filteredCapas.length,
      openCapas: filteredCapas.filter(c => c.status !== 'closed' && c.status !== 'verified').length,
      totalInspections: filteredInspections.length,
      completedInspections: filteredInspections.filter(i => i.status === 'completed').length,
      identifiedHazards: hazards.length
    },
    incidentsBySeverity: groupBy(filteredIncidents, 'severity'),
    incidentsByCategory: groupBy(filteredIncidents, 'category'),
    monthlyTrends: getMonthlyTrends(filteredIncidents, 'incidentDate'),
    capasByStatus: getStatusDistribution(filteredCapas)
  }
}

/**
 * Generate equipment status report data
 */
export function generateEquipmentStatusReport(data) {
  const { equipment = [], maintenanceRecords = [] } = data
  const { startDate, endDate } = data.dateRange || {}

  const filteredMaintenance = filterByDateRange(maintenanceRecords, 'scheduledDate', startDate, endDate)

  const now = new Date()
  const maintenanceDue = equipment.filter(e => {
    if (!e.nextServiceDate) return false
    const nextService = new Date(e.nextServiceDate)
    const daysUntil = Math.ceil((nextService - now) / (1000 * 60 * 60 * 24))
    return daysUntil <= 30
  })

  return {
    title: 'Equipment Status Report',
    dateRange: { start: startDate, end: endDate },
    generatedAt: new Date(),
    summary: {
      totalEquipment: equipment.length,
      available: equipment.filter(e => e.status === 'available').length,
      assigned: equipment.filter(e => e.status === 'assigned').length,
      inMaintenance: equipment.filter(e => e.status === 'maintenance').length,
      retired: equipment.filter(e => e.status === 'retired').length,
      maintenanceDueSoon: maintenanceDue.length,
      maintenanceCompletedThisPeriod: filteredMaintenance.filter(m => m.status === 'completed').length
    },
    byCategory: groupBy(equipment, 'category'),
    byStatus: getStatusDistribution(equipment),
    maintenanceSchedule: maintenanceDue.map(e => ({
      name: e.name,
      category: e.category,
      nextService: e.nextServiceDate
    })),
    maintenanceHistory: filteredMaintenance.slice(0, 20)
  }
}

/**
 * Generate training compliance report data
 */
export function generateTrainingComplianceReport(data) {
  const { operators = [], trainingRecords = [] } = data

  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Check certification status for each operator
  const operatorCompliance = operators.map(op => {
    const certs = op.certifications || []
    const expiringCerts = certs.filter(c => {
      if (!c.expiryDate) return false
      const expiry = new Date(c.expiryDate)
      return expiry <= thirtyDaysFromNow
    })
    const expiredCerts = certs.filter(c => {
      if (!c.expiryDate) return false
      return new Date(c.expiryDate) < now
    })

    return {
      name: `${op.firstName} ${op.lastName}`,
      totalCerts: certs.length,
      validCerts: certs.length - expiredCerts.length,
      expiringCerts: expiringCerts.length,
      expiredCerts: expiredCerts.length,
      isCompliant: expiredCerts.length === 0
    }
  })

  return {
    title: 'Training Compliance Report',
    generatedAt: new Date(),
    summary: {
      totalOperators: operators.length,
      compliantOperators: operatorCompliance.filter(o => o.isCompliant).length,
      nonCompliantOperators: operatorCompliance.filter(o => !o.isCompliant).length,
      totalTrainingRecords: trainingRecords.length,
      complianceRate: operators.length > 0
        ? Math.round((operatorCompliance.filter(o => o.isCompliant).length / operators.length) * 100)
        : 100
    },
    operatorCompliance,
    upcomingRenewals: operatorCompliance
      .filter(o => o.expiringCerts > 0)
      .sort((a, b) => b.expiringCerts - a.expiringCerts),
    trainingByType: groupBy(trainingRecords, 'type')
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function filterByDateRange(items, dateField, startDate, endDate) {
  if (!startDate && !endDate) return items

  return items.filter(item => {
    const date = item[dateField] instanceof Date
      ? item[dateField]
      : new Date(item[dateField])

    if (isNaN(date.getTime())) return false

    if (startDate && date < new Date(startDate)) return false
    if (endDate && date > new Date(endDate)) return false

    return true
  })
}

function calculateTotalFlightHours(flights) {
  const totalMinutes = flights.reduce((sum, f) => sum + (f.flightDuration || 0), 0)
  return Math.round(totalMinutes / 60 * 10) / 10 // Round to 1 decimal
}

function calculateTotalDistance(flights) {
  const totalMeters = flights.reduce((sum, f) => sum + (f.flightDistance || 0), 0)
  return Math.round(totalMeters / 1000 * 10) / 10 // km, rounded to 1 decimal
}

function getStatusDistribution(items) {
  const distribution = {}
  items.forEach(item => {
    const status = item.status || 'unknown'
    distribution[status] = (distribution[status] || 0) + 1
  })
  return distribution
}

function groupBy(items, field) {
  const grouped = {}
  items.forEach(item => {
    const value = item[field] || 'unknown'
    grouped[value] = (grouped[value] || 0) + 1
  })
  return grouped
}

function getMonthlyTrends(items, dateField) {
  const trends = {}

  items.forEach(item => {
    const date = item[dateField] instanceof Date
      ? item[dateField]
      : new Date(item[dateField])

    if (isNaN(date.getTime())) return

    const monthKey = format(date, 'yyyy-MM')
    trends[monthKey] = (trends[monthKey] || 0) + 1
  })

  // Sort by month
  return Object.entries(trends)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
}

// ============================================
// REPORT EXPORT FORMATS
// ============================================

/**
 * Format report data as markdown
 */
export function formatReportAsMarkdown(report) {
  let md = `# ${report.title}\n\n`
  md += `**Generated:** ${format(report.generatedAt, 'MMMM d, yyyy HH:mm')}\n\n`

  if (report.dateRange?.start && report.dateRange?.end) {
    md += `**Period:** ${format(new Date(report.dateRange.start), 'MMM d, yyyy')} - ${format(new Date(report.dateRange.end), 'MMM d, yyyy')}\n\n`
  }

  md += `## Summary\n\n`
  if (report.summary) {
    Object.entries(report.summary).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      md += `- **${label}:** ${value}\n`
    })
  }

  return md
}

/**
 * Format report data for PDF generation
 */
export function formatReportForPDF(report) {
  return {
    title: report.title,
    subtitle: report.dateRange?.start && report.dateRange?.end
      ? `${format(new Date(report.dateRange.start), 'MMM d, yyyy')} - ${format(new Date(report.dateRange.end), 'MMM d, yyyy')}`
      : 'All Time',
    generatedAt: format(report.generatedAt, 'MMMM d, yyyy HH:mm'),
    summary: report.summary,
    sections: report.sections || []
  }
}

export default {
  REPORT_TYPES,
  DATE_RANGES,
  generateOperationsSummaryReport,
  generateFlightLogReport,
  generateSafetyMetricsReport,
  generateEquipmentStatusReport,
  generateTrainingComplianceReport,
  formatReportAsMarkdown,
  formatReportForPDF
}
