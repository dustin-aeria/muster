/**
 * Export Service
 * Export data to various formats (CSV, JSON, PDF)
 *
 * @location src/lib/exportService.js
 */

import { formatDate } from './dateUtils'

// ============================================
// CSV EXPORT
// ============================================

/**
 * Convert data to CSV string
 */
export function toCSV(data, options = {}) {
  if (!data || data.length === 0) return ''

  const {
    columns = null, // Specific columns to include
    headers = null, // Custom header labels
    delimiter = ',',
    includeHeaders = true,
    dateFormat = 'short'
  } = options

  // Determine columns to export
  const cols = columns || Object.keys(data[0])

  // Build header row
  let csv = ''
  if (includeHeaders) {
    const headerRow = cols.map((col, index) => {
      const label = headers?.[index] || headers?.[col] || formatColumnHeader(col)
      return escapeCSVValue(label, delimiter)
    })
    csv += headerRow.join(delimiter) + '\n'
  }

  // Build data rows
  data.forEach(row => {
    const values = cols.map(col => {
      let value = getNestedValue(row, col)

      // Format dates
      if (value instanceof Date) {
        value = formatDate(value, { format: dateFormat })
      } else if (value && typeof value === 'object') {
        value = JSON.stringify(value)
      }

      return escapeCSVValue(value, delimiter)
    })
    csv += values.join(delimiter) + '\n'
  })

  return csv
}

/**
 * Export data as CSV file
 */
export function exportToCSV(data, filename, options = {}) {
  const csv = toCSV(data, options)
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;')
}

/**
 * Escape CSV value
 */
function escapeCSVValue(value, delimiter = ',') {
  if (value === null || value === undefined) return ''

  const str = String(value)

  // Check if escaping is needed
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }

  return str
}

/**
 * Format column header from camelCase/snake_case
 */
function formatColumnHeader(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .trim()
}

// ============================================
// JSON EXPORT
// ============================================

/**
 * Export data as JSON file
 */
export function exportToJSON(data, filename, options = {}) {
  const {
    pretty = true,
    columns = null
  } = options

  let exportData = data

  // Filter columns if specified
  if (columns && Array.isArray(data)) {
    exportData = data.map(row => {
      const filtered = {}
      columns.forEach(col => {
        filtered[col] = getNestedValue(row, col)
      })
      return filtered
    })
  }

  const json = pretty
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData)

  downloadFile(json, `${filename}.json`, 'application/json')
}

// ============================================
// PDF EXPORT (HTML-based)
// ============================================

/**
 * Generate printable HTML for data
 */
export function generatePrintableHTML(data, options = {}) {
  const {
    title = 'Export',
    subtitle = '',
    columns = null,
    headers = null,
    orientation = 'portrait',
    fontSize = '12px',
    includeTimestamp = true,
    logo = null
  } = options

  const cols = columns || Object.keys(data[0] || {})

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @page { size: ${orientation}; margin: 1cm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: ${fontSize};
          color: #1a1a1a;
          padding: 20px;
        }
        .header {
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .logo { max-height: 50px; margin-bottom: 10px; }
        h1 { margin: 0 0 5px 0; font-size: 1.5em; }
        .subtitle { color: #666; margin: 0; }
        .timestamp { color: #999; font-size: 0.85em; margin-top: 5px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        tr:nth-child(even) { background-color: #fafafa; }
        .footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          font-size: 0.85em;
          color: #666;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${logo ? `<img src="${logo}" class="logo" alt="Logo">` : ''}
        <h1>${title}</h1>
        ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
        ${includeTimestamp ? `<p class="timestamp">Generated: ${formatDate(new Date(), { format: 'long', includeTime: true })}</p>` : ''}
      </div>
      <table>
        <thead>
          <tr>
            ${cols.map((col, i) => `<th>${headers?.[i] || headers?.[col] || formatColumnHeader(col)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${cols.map(col => {
                let value = getNestedValue(row, col)
                if (value instanceof Date) {
                  value = formatDate(value)
                } else if (value && typeof value === 'object') {
                  value = JSON.stringify(value)
                }
                return `<td>${value ?? ''}</td>`
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        Total records: ${data.length}
      </div>
    </body>
    </html>
  `

  return html
}

/**
 * Export to PDF by printing HTML
 */
export function exportToPDF(data, filename, options = {}) {
  const html = generatePrintableHTML(data, options)
  printHTML(html)
}

/**
 * Print HTML in a new window
 */
function printHTML(html) {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

// ============================================
// ENTITY-SPECIFIC EXPORTS
// ============================================

/**
 * Export projects
 */
export function exportProjects(projects, format = 'csv') {
  const columns = ['name', 'projectCode', 'clientName', 'status', 'startDate', 'endDate', 'location']
  const headers = {
    name: 'Project Name',
    projectCode: 'Code',
    clientName: 'Client',
    status: 'Status',
    startDate: 'Start Date',
    endDate: 'End Date',
    location: 'Location'
  }

  const filename = `projects_export_${formatDate(new Date(), { format: 'short' }).replace(/\//g, '-')}`

  if (format === 'csv') {
    exportToCSV(projects, filename, { columns, headers })
  } else if (format === 'json') {
    exportToJSON(projects, filename, { columns })
  } else if (format === 'pdf') {
    exportToPDF(projects, filename, {
      title: 'Projects Export',
      subtitle: 'All Projects',
      columns,
      headers
    })
  }
}

/**
 * Export equipment
 */
export function exportEquipment(equipment, format = 'csv') {
  const columns = ['name', 'category', 'manufacturer', 'model', 'serialNumber', 'status', 'purchaseDate']
  const headers = {
    name: 'Equipment Name',
    category: 'Category',
    manufacturer: 'Manufacturer',
    model: 'Model',
    serialNumber: 'Serial Number',
    status: 'Status',
    purchaseDate: 'Purchase Date'
  }

  const filename = `equipment_export_${formatDate(new Date(), { format: 'short' }).replace(/\//g, '-')}`

  if (format === 'csv') {
    exportToCSV(equipment, filename, { columns, headers })
  } else if (format === 'json') {
    exportToJSON(equipment, filename, { columns })
  } else if (format === 'pdf') {
    exportToPDF(equipment, filename, {
      title: 'Equipment Inventory',
      columns,
      headers
    })
  }
}

/**
 * Export aircraft
 */
export function exportAircraft(aircraft, format = 'csv') {
  const columns = ['nickname', 'make', 'model', 'serialNumber', 'registration', 'status', 'totalFlightHours']
  const headers = {
    nickname: 'Name',
    make: 'Make',
    model: 'Model',
    serialNumber: 'Serial Number',
    registration: 'Registration',
    status: 'Status',
    totalFlightHours: 'Flight Hours'
  }

  const filename = `aircraft_export_${formatDate(new Date(), { format: 'short' }).replace(/\//g, '-')}`

  if (format === 'csv') {
    exportToCSV(aircraft, filename, { columns, headers })
  } else if (format === 'json') {
    exportToJSON(aircraft, filename, { columns })
  } else if (format === 'pdf') {
    exportToPDF(aircraft, filename, {
      title: 'Aircraft Fleet',
      columns,
      headers
    })
  }
}

/**
 * Export incidents
 */
export function exportIncidents(incidents, format = 'csv') {
  const columns = ['title', 'incidentDate', 'severity', 'status', 'location', 'reportedByName']
  const headers = {
    title: 'Title',
    incidentDate: 'Date',
    severity: 'Severity',
    status: 'Status',
    location: 'Location',
    reportedByName: 'Reported By'
  }

  const filename = `incidents_export_${formatDate(new Date(), { format: 'short' }).replace(/\//g, '-')}`

  if (format === 'csv') {
    exportToCSV(incidents, filename, { columns, headers })
  } else if (format === 'json') {
    exportToJSON(incidents, filename, { columns })
  } else if (format === 'pdf') {
    exportToPDF(incidents, filename, {
      title: 'Incident Report',
      subtitle: 'Safety Incidents',
      columns,
      headers
    })
  }
}

/**
 * Export CAPAs
 */
export function exportCapas(capas, format = 'csv') {
  const columns = ['title', 'type', 'status', 'priority', 'dueDate', 'ownerName']
  const headers = {
    title: 'Title',
    type: 'Type',
    status: 'Status',
    priority: 'Priority',
    dueDate: 'Due Date',
    ownerName: 'Owner'
  }

  const filename = `capas_export_${formatDate(new Date(), { format: 'short' }).replace(/\//g, '-')}`

  if (format === 'csv') {
    exportToCSV(capas, filename, { columns, headers })
  } else if (format === 'json') {
    exportToJSON(capas, filename, { columns })
  } else if (format === 'pdf') {
    exportToPDF(capas, filename, {
      title: 'CAPA Report',
      subtitle: 'Corrective and Preventive Actions',
      columns,
      headers
    })
  }
}

/**
 * Export flight logs
 */
export function exportFlightLogs(logs, format = 'csv') {
  const columns = ['flightDate', 'aircraftName', 'pilotName', 'projectName', 'takeoffTime', 'landingTime', 'flightDuration', 'purpose']
  const headers = {
    flightDate: 'Date',
    aircraftName: 'Aircraft',
    pilotName: 'Pilot',
    projectName: 'Project',
    takeoffTime: 'Takeoff',
    landingTime: 'Landing',
    flightDuration: 'Duration',
    purpose: 'Purpose'
  }

  const filename = `flight_logs_${formatDate(new Date(), { format: 'short' }).replace(/\//g, '-')}`

  if (format === 'csv') {
    exportToCSV(logs, filename, { columns, headers })
  } else if (format === 'json') {
    exportToJSON(logs, filename, { columns })
  } else if (format === 'pdf') {
    exportToPDF(logs, filename, {
      title: 'Flight Log Report',
      columns,
      headers,
      orientation: 'landscape'
    })
  }
}

/**
 * Export audit logs
 */
export function exportAuditLogs(logs, format = 'csv') {
  const columns = ['timestamp', 'userName', 'action', 'entityType', 'entityName', 'details']
  const headers = {
    timestamp: 'Timestamp',
    userName: 'User',
    action: 'Action',
    entityType: 'Entity Type',
    entityName: 'Entity Name',
    details: 'Details'
  }

  const filename = `audit_logs_${formatDate(new Date(), { format: 'short' }).replace(/\//g, '-')}`

  if (format === 'csv') {
    exportToCSV(logs, filename, { columns, headers })
  } else if (format === 'json') {
    exportToJSON(logs, filename, { columns })
  } else if (format === 'pdf') {
    exportToPDF(logs, filename, {
      title: 'Audit Log Report',
      subtitle: 'System Activity Log',
      columns,
      headers,
      orientation: 'landscape'
    })
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get nested object value by dot notation
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * Download file
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()

  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Supported export formats
 */
export const EXPORT_FORMATS = {
  csv: { label: 'CSV', extension: '.csv', mimeType: 'text/csv' },
  json: { label: 'JSON', extension: '.json', mimeType: 'application/json' },
  pdf: { label: 'PDF', extension: '.pdf', mimeType: 'application/pdf' }
}

export default {
  toCSV,
  exportToCSV,
  exportToJSON,
  generatePrintableHTML,
  exportToPDF,
  exportProjects,
  exportEquipment,
  exportAircraft,
  exportIncidents,
  exportCapas,
  exportFlightLogs,
  exportAuditLogs,
  EXPORT_FORMATS
}
