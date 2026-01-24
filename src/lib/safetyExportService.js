/**
 * Safety Export Service
 * Export CAPA and Incident reports as professional PDFs
 *
 * @location src/lib/safetyExportService.js
 */

import { logger } from './logger'
import { CAPA_STATUS, CAPA_TYPES, PRIORITY_LEVELS, INCIDENT_STATUS, INCIDENT_TYPES, SEVERITY_LEVELS, RPAS_INCIDENT_TYPES } from './firestoreSafety'
import { format } from 'date-fns'

const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
const AUTOTABLE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js'

let jspdfLoaded = false
let loadingPromise = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = resolve
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

async function loadJsPDF() {
  if (jspdfLoaded && window.jspdf) return window.jspdf.jsPDF
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    await loadScript(JSPDF_CDN)
    await loadScript(AUTOTABLE_CDN)
    jspdfLoaded = true
    return window.jspdf.jsPDF
  })()
  return loadingPromise
}

// Helper to format dates
function formatDate(dateValue) {
  if (!dateValue) return 'Not set'
  try {
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue)
    return format(date, 'MMM d, yyyy')
  } catch {
    return 'Invalid date'
  }
}

function formatDateTime(dateValue) {
  if (!dateValue) return 'Unknown'
  try {
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue)
    return format(date, 'MMM d, yyyy h:mm a')
  } catch {
    return 'Invalid date'
  }
}

// Colors
const COLORS = {
  primary: { r: 30, g: 58, b: 95 },
  secondary: { r: 59, g: 130, b: 246 },
  success: { r: 16, g: 185, b: 129 },
  danger: { r: 239, g: 68, b: 68 },
  warning: { r: 245, g: 158, b: 11 },
  text: { r: 31, g: 41, b: 55 },
  textLight: { r: 107, g: 114, b: 128 },
  lightBg: { r: 249, g: 250, b: 251 }
}

/**
 * Export a CAPA report as PDF
 */
export async function exportCapaReport(capa, options = {}) {
  const jsPDF = await loadJsPDF()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const pageWidth = 215.9
  const pageHeight = 279.4
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let currentY = margin
  let pageNumber = 1

  const operatorName = options.operatorName || 'Aeria Operations'
  const generatedDate = new Date().toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  // Helper functions
  const setColor = (color) => doc.setTextColor(color.r, color.g, color.b)
  const setFillColor = (color) => doc.setFillColor(color.r, color.g, color.b)
  const setDrawColor = (color) => doc.setDrawColor(color.r, color.g, color.b)

  const addHeader = () => {
    setFillColor(COLORS.primary)
    doc.rect(0, 0, pageWidth, 15, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('CAPA REPORT', margin, 10)
    doc.setFont('helvetica', 'normal')
    const rightText = capa.capaNumber || ''
    const rightWidth = doc.getTextWidth(rightText)
    doc.text(rightText, pageWidth - margin - rightWidth, 10)
    currentY = 25
  }

  const addFooter = (pageNum, totalPages) => {
    const footerY = pageHeight - 10
    setDrawColor(COLORS.primary)
    doc.setLineWidth(0.3)
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

    setColor(COLORS.textLight)
    doc.setFontSize(8)
    doc.text(operatorName, margin, footerY)

    const dateWidth = doc.getTextWidth(generatedDate)
    doc.text(generatedDate, (pageWidth - dateWidth) / 2, footerY)

    const pageText = `Page ${pageNum} of ${totalPages}`
    const pageWidth2 = doc.getTextWidth(pageText)
    doc.text(pageText, pageWidth - margin - pageWidth2, footerY)
  }

  const checkPageBreak = (required = 30) => {
    if (currentY + required > pageHeight - 25) {
      doc.addPage()
      pageNumber++
      addHeader()
      return true
    }
    return false
  }

  const addSectionTitle = (text) => {
    checkPageBreak(20)
    setFillColor(COLORS.primary)
    doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(text.toUpperCase(), margin + 5, currentY + 7)
    currentY += 18
  }

  const addSubsectionTitle = (text) => {
    checkPageBreak(15)
    setColor(COLORS.secondary)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(text, margin, currentY)
    currentY += 8
  }

  const addLabelValue = (label, value) => {
    if (!value) return
    checkPageBreak(8)
    setColor(COLORS.textLight)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(label + ':', margin, currentY)
    setColor(COLORS.text)
    doc.setFont('helvetica', 'normal')
    const labelWidth = doc.getTextWidth(label + ': ')
    doc.text(String(value), margin + labelWidth, currentY)
    currentY += 6
  }

  const addParagraph = (text, bold = false) => {
    if (!text) return
    setColor(COLORS.text)
    doc.setFontSize(9)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(text, contentWidth)
    lines.forEach(line => {
      checkPageBreak(5)
      doc.text(line, margin, currentY)
      currentY += 4
    })
    currentY += 4
  }

  // ===== COVER PAGE =====
  setFillColor(COLORS.primary)
  doc.rect(0, 0, pageWidth, 80, 'F')
  setFillColor(COLORS.secondary)
  doc.rect(0, 80, pageWidth, 4, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(operatorName, margin, 25)

  doc.setFontSize(28)
  doc.text('CAPA Report', margin, 50)

  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text(capa.capaNumber || 'N/A', margin, 65)

  // Status badge
  const statusInfo = CAPA_STATUS[capa.status]
  currentY = 100
  setFillColor(COLORS.lightBg)
  doc.roundedRect(margin, currentY, contentWidth, 60, 3, 3, 'F')

  setColor(COLORS.text)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(capa.title || 'Untitled CAPA', margin + 10, currentY + 15)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  const details = [
    ['Type', CAPA_TYPES[capa.type]?.label || capa.type],
    ['Priority', PRIORITY_LEVELS[capa.priority]?.label || capa.priority],
    ['Status', statusInfo?.label || capa.status],
    ['Assigned To', capa.assignedTo || 'Unassigned'],
    ['Target Date', formatDate(capa.targetDate)],
    ['Generated', generatedDate]
  ]

  let detailY = currentY + 25
  details.forEach((d, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = margin + 10 + (col * (contentWidth / 2))
    const y = detailY + (row * 10)

    setColor(COLORS.textLight)
    doc.setFont('helvetica', 'bold')
    doc.text(d[0] + ':', x, y)
    setColor(COLORS.text)
    doc.setFont('helvetica', 'normal')
    doc.text(d[1] || 'N/A', x + 30, y)
  })

  // ===== CONTENT PAGES =====
  doc.addPage()
  pageNumber++
  addHeader()

  // CAPA Details Section
  addSectionTitle('CAPA Details')

  addLabelValue('CAPA Number', capa.capaNumber)
  addLabelValue('Title', capa.title)
  addLabelValue('Type', CAPA_TYPES[capa.type]?.label)
  addLabelValue('Priority', PRIORITY_LEVELS[capa.priority]?.label)
  addLabelValue('Status', CAPA_STATUS[capa.status]?.label)
  addLabelValue('Category', capa.category)
  addLabelValue('Source Reference', capa.sourceReference)
  addLabelValue('Assigned To', capa.assignedTo)
  addLabelValue('Assigned Date', formatDate(capa.assignedDate))
  addLabelValue('Target Date', formatDate(capa.targetDate))
  addLabelValue('Completed Date', formatDate(capa.completedDate))

  currentY += 5

  if (capa.problemStatement) {
    addSubsectionTitle('Problem Statement')
    addParagraph(capa.problemStatement)
  }

  if (capa.rootCause) {
    addSubsectionTitle('Root Cause')
    addParagraph(capa.rootCause)
  }

  if (capa.action?.description) {
    addSubsectionTitle('Planned Action')
    addParagraph(capa.action.description)
  }

  // Implementation Section
  if (capa.implementation) {
    addSectionTitle('Implementation')

    addLabelValue('Status', capa.implementation.status || 'Not started')
    addLabelValue('Completed By', capa.implementation.completedBy)
    addLabelValue('Completed Date', formatDate(capa.implementation.completedDate))

    if (capa.implementation.actionsTaken) {
      addSubsectionTitle('Actions Taken')
      addParagraph(capa.implementation.actionsTaken)
    }

    if (capa.implementation.completionNotes) {
      addSubsectionTitle('Completion Notes')
      addParagraph(capa.implementation.completionNotes)
    }

    if (capa.implementation.evidenceProvided?.length > 0) {
      addSubsectionTitle('Evidence Provided')
      capa.implementation.evidenceProvided.forEach((ev, idx) => {
        addLabelValue(`Evidence ${idx + 1}`, ev.description || ev.type || 'Attached')
      })
    }
  }

  // Verification Section
  if (capa.verification) {
    addSectionTitle('Verification of Effectiveness')

    addLabelValue('Verified By', capa.verification.verifiedBy)
    addLabelValue('Verified Date', formatDate(capa.verification.verifiedDate))
    addLabelValue('Effective', capa.verification.effective === true ? 'Yes' : capa.verification.effective === false ? 'No' : 'Pending')

    if (capa.verification.findings) {
      addSubsectionTitle('Findings')
      addParagraph(capa.verification.findings)
    }

    if (capa.verification.evidence) {
      addSubsectionTitle('Evidence')
      addParagraph(capa.verification.evidence)
    }

    // Recurrence Check
    if (capa.verification.recurrenceCheck) {
      addSubsectionTitle('Recurrence Check')
      addLabelValue('Checked By', capa.verification.recurrenceCheck.checkedBy)
      addLabelValue('Check Date', formatDate(capa.verification.recurrenceCheck.checkDate))
      addLabelValue('Recurred', capa.verification.recurrenceCheck.recurred === true ? 'Yes' : 'No')
      if (capa.verification.recurrenceCheck.notes) {
        addParagraph(capa.verification.recurrenceCheck.notes)
      }
    }
  }

  // Status History
  if (capa.statusHistory?.length > 0) {
    addSectionTitle('Status History')

    const historyHeaders = ['Date', 'Change', 'By', 'Reason']
    const historyRows = capa.statusHistory.slice().reverse().map(entry => [
      formatDateTime(entry.date),
      entry.from ? `${entry.from} → ${entry.to}` : entry.to,
      entry.by || 'System',
      entry.reason || '-'
    ])

    checkPageBreak(30)
    doc.autoTable({
      startY: currentY,
      head: [historyHeaders],
      body: historyRows,
      margin: { left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    })
    currentY = doc.lastAutoTable.finalY + 10
  }

  // Comments
  if (capa.comments?.length > 0) {
    addSectionTitle('Comments')

    capa.comments.forEach(comment => {
      checkPageBreak(20)
      setFillColor(COLORS.lightBg)
      doc.roundedRect(margin, currentY, contentWidth, 15, 2, 2, 'F')

      setColor(COLORS.text)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(comment.by || 'Unknown', margin + 5, currentY + 6)

      setColor(COLORS.textLight)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(formatDateTime(comment.date), margin + 5, currentY + 11)

      currentY += 18
      addParagraph(comment.text)
    })
  }

  // Add footers to all pages
  const totalPages = pageNumber
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    if (i > 1) addFooter(i, totalPages)
  }

  // Save
  const filename = `CAPA_${capa.capaNumber || 'Report'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`
  doc.save(filename)

  logger.info(`CAPA report exported: ${filename}`)
  return filename
}

/**
 * Export an Incident report as PDF
 */
export async function exportIncidentReport(incident, options = {}) {
  const jsPDF = await loadJsPDF()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const pageWidth = 215.9
  const pageHeight = 279.4
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let currentY = margin
  let pageNumber = 1

  const operatorName = options.operatorName || 'Aeria Operations'
  const generatedDate = new Date().toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  // Helper functions (same as CAPA)
  const setColor = (color) => doc.setTextColor(color.r, color.g, color.b)
  const setFillColor = (color) => doc.setFillColor(color.r, color.g, color.b)
  const setDrawColor = (color) => doc.setDrawColor(color.r, color.g, color.b)

  const addHeader = () => {
    setFillColor(COLORS.primary)
    doc.rect(0, 0, pageWidth, 15, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('INCIDENT REPORT', margin, 10)
    doc.setFont('helvetica', 'normal')
    const rightText = incident.incidentNumber || ''
    const rightWidth = doc.getTextWidth(rightText)
    doc.text(rightText, pageWidth - margin - rightWidth, 10)
    currentY = 25
  }

  const addFooter = (pageNum, totalPages) => {
    const footerY = pageHeight - 10
    setDrawColor(COLORS.primary)
    doc.setLineWidth(0.3)
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

    setColor(COLORS.textLight)
    doc.setFontSize(8)
    doc.text(operatorName, margin, footerY)

    const dateWidth = doc.getTextWidth(generatedDate)
    doc.text(generatedDate, (pageWidth - dateWidth) / 2, footerY)

    const pageText = `Page ${pageNum} of ${totalPages}`
    const pageWidth2 = doc.getTextWidth(pageText)
    doc.text(pageText, pageWidth - margin - pageWidth2, footerY)
  }

  const checkPageBreak = (required = 30) => {
    if (currentY + required > pageHeight - 25) {
      doc.addPage()
      pageNumber++
      addHeader()
      return true
    }
    return false
  }

  const addSectionTitle = (text) => {
    checkPageBreak(20)
    setFillColor(COLORS.primary)
    doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(text.toUpperCase(), margin + 5, currentY + 7)
    currentY += 18
  }

  const addSubsectionTitle = (text) => {
    checkPageBreak(15)
    setColor(COLORS.secondary)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(text, margin, currentY)
    currentY += 8
  }

  const addLabelValue = (label, value) => {
    if (!value) return
    checkPageBreak(8)
    setColor(COLORS.textLight)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(label + ':', margin, currentY)
    setColor(COLORS.text)
    doc.setFont('helvetica', 'normal')
    const labelWidth = doc.getTextWidth(label + ': ')
    doc.text(String(value), margin + labelWidth, currentY)
    currentY += 6
  }

  const addParagraph = (text, bold = false) => {
    if (!text) return
    setColor(COLORS.text)
    doc.setFontSize(9)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(text, contentWidth)
    lines.forEach(line => {
      checkPageBreak(5)
      doc.text(line, margin, currentY)
      currentY += 4
    })
    currentY += 4
  }

  // Severity color
  const getSeverityColor = (severity) => {
    if (severity === 'fatal' || severity === 'critical') return COLORS.danger
    if (severity === 'serious' || severity === 'moderate') return COLORS.warning
    return COLORS.secondary
  }

  // ===== COVER PAGE =====
  const severityColor = getSeverityColor(incident.severity)
  setFillColor(COLORS.primary)
  doc.rect(0, 0, pageWidth, 80, 'F')
  setFillColor(severityColor)
  doc.rect(0, 80, pageWidth, 4, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(operatorName, margin, 25)

  doc.setFontSize(28)
  doc.text('Incident Report', margin, 50)

  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text(incident.incidentNumber || 'N/A', margin, 65)

  // Summary box
  currentY = 100
  setFillColor(COLORS.lightBg)
  doc.roundedRect(margin, currentY, contentWidth, 70, 3, 3, 'F')

  setColor(COLORS.text)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(incident.title || 'Untitled Incident', margin + 10, currentY + 15)

  const details = [
    ['Type', INCIDENT_TYPES[incident.type]?.label || incident.type],
    ['Severity', SEVERITY_LEVELS[incident.severity]?.label || incident.severity],
    ['Status', INCIDENT_STATUS[incident.status]?.label || incident.status],
    ['Date Occurred', formatDate(incident.dateOccurred)],
    ['Location', incident.location || 'Not specified'],
    ['Reported By', incident.reportedBy || 'Unknown'],
    ['Project', incident.projectName || 'N/A'],
    ['Generated', generatedDate]
  ]

  let detailY = currentY + 25
  doc.setFontSize(9)
  details.forEach((d, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = margin + 10 + (col * (contentWidth / 2))
    const y = detailY + (row * 10)

    setColor(COLORS.textLight)
    doc.setFont('helvetica', 'bold')
    doc.text(d[0] + ':', x, y)
    setColor(COLORS.text)
    doc.setFont('helvetica', 'normal')
    doc.text(d[1] || 'N/A', x + 35, y)
  })

  // ===== CONTENT PAGES =====
  doc.addPage()
  pageNumber++
  addHeader()

  // Incident Details
  addSectionTitle('Incident Details')

  addLabelValue('Incident Number', incident.incidentNumber)
  addLabelValue('Title', incident.title)
  addLabelValue('Type', INCIDENT_TYPES[incident.type]?.label)
  addLabelValue('Severity', SEVERITY_LEVELS[incident.severity]?.label)
  addLabelValue('Status', INCIDENT_STATUS[incident.status]?.label)
  addLabelValue('Date Occurred', formatDate(incident.dateOccurred))
  addLabelValue('Time', incident.timeOccurred)
  addLabelValue('Location', incident.location)
  addLabelValue('Reported By', incident.reportedBy)
  if (incident.rpasType) {
    addLabelValue('RPAS Incident Type', RPAS_INCIDENT_TYPES[incident.rpasType]?.label)
  }
  addLabelValue('Project', incident.projectName)
  addLabelValue('Aircraft', incident.aircraftName)

  currentY += 5

  if (incident.description) {
    addSubsectionTitle('Description')
    addParagraph(incident.description)
  }

  if (incident.immediateActions) {
    addSubsectionTitle('Immediate Actions Taken')
    addParagraph(incident.immediateActions)
  }

  // People Involved
  if (incident.involvedPersons?.length > 0) {
    addSectionTitle('People Involved')

    const personHeaders = ['Name', 'Role', 'Injury Type', 'Days Lost']
    const personRows = incident.involvedPersons.map(p => [
      p.name || 'Unknown',
      p.role || '-',
      p.injuryType?.replace(/_/g, ' ') || 'None',
      p.daysLost > 0 ? String(p.daysLost) : '-'
    ])

    checkPageBreak(30)
    doc.autoTable({
      startY: currentY,
      head: [personHeaders],
      body: personRows,
      margin: { left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    })
    currentY = doc.lastAutoTable.finalY + 10

    // Injury details
    incident.involvedPersons.forEach(p => {
      if (p.injuryDescription || p.treatmentReceived) {
        addSubsectionTitle(p.name || 'Person')
        if (p.injuryDescription) addParagraph(`Injury: ${p.injuryDescription}`)
        if (p.treatmentReceived) addParagraph(`Treatment: ${p.treatmentReceived}`)
      }
    })
  }

  // Equipment Damage
  if (incident.equipmentDamage?.length > 0) {
    addSectionTitle('Equipment Damage')

    const equipHeaders = ['Item', 'Description', 'Est. Cost', 'Repairable']
    const equipRows = incident.equipmentDamage.map(e => [
      e.item || 'Unknown',
      e.damageDescription || '-',
      e.estimatedCost > 0 ? `$${e.estimatedCost.toLocaleString()}` : '-',
      e.repairable ? 'Yes' : 'No'
    ])

    checkPageBreak(30)
    doc.autoTable({
      startY: currentY,
      head: [equipHeaders],
      body: equipRows,
      margin: { left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    })
    currentY = doc.lastAutoTable.finalY + 10
  }

  // Regulatory Notifications
  const notif = incident.regulatoryNotifications || {}
  if (notif.tsbRequired || notif.tcRequired || notif.worksafebcRequired) {
    addSectionTitle('Regulatory Notifications')

    const notifItems = []
    if (notif.tsbRequired) {
      notifItems.push([
        'Transportation Safety Board',
        notif.tsbNotified ? 'Notified' : 'PENDING',
        notif.tsbNotified ? formatDate(notif.tsbNotifiedDate) : '-',
        notif.tsbReference || '-'
      ])
    }
    if (notif.tcRequired) {
      notifItems.push([
        'Transport Canada',
        notif.tcNotified ? 'Notified' : 'PENDING',
        notif.tcNotified ? formatDate(notif.tcNotifiedDate) : '-',
        notif.tcReference || '-'
      ])
    }
    if (notif.worksafebcRequired) {
      notifItems.push([
        'WorkSafeBC',
        notif.worksafebcNotified ? 'Notified' : 'PENDING',
        notif.worksafebcNotified ? formatDate(notif.worksafebcNotifiedDate) : '-',
        notif.worksafebcReference || '-'
      ])
    }

    checkPageBreak(30)
    doc.autoTable({
      startY: currentY,
      head: [['Authority', 'Status', 'Date', 'Reference']],
      body: notifItems,
      margin: { left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      bodyStyles: {
        textColor: function(data) {
          if (data.column.index === 1 && data.cell.text[0] === 'PENDING') {
            return [239, 68, 68]
          }
          return [31, 41, 55]
        }
      }
    })
    currentY = doc.lastAutoTable.finalY + 10
  }

  // Investigation
  if (incident.investigation) {
    addSectionTitle('Investigation')

    addLabelValue('Assigned To', incident.investigation.assignedTo)
    addLabelValue('Assigned Date', formatDate(incident.investigation.assignedDate))

    if (incident.investigation.immediateCauses?.substandardActs?.length > 0) {
      addSubsectionTitle('Substandard Acts')
      incident.investigation.immediateCauses.substandardActs.forEach(act => {
        addParagraph(`- ${act}`)
      })
    }

    if (incident.investigation.immediateCauses?.substandardConditions?.length > 0) {
      addSubsectionTitle('Substandard Conditions')
      incident.investigation.immediateCauses.substandardConditions.forEach(cond => {
        addParagraph(`- ${cond}`)
      })
    }

    if (incident.investigation.rootCauses?.personalFactors?.length > 0) {
      addSubsectionTitle('Personal Factors')
      incident.investigation.rootCauses.personalFactors.forEach(factor => {
        addParagraph(`- ${factor}`)
      })
    }

    if (incident.investigation.rootCauses?.jobSystemFactors?.length > 0) {
      addSubsectionTitle('Job/System Factors')
      incident.investigation.rootCauses.jobSystemFactors.forEach(factor => {
        addParagraph(`- ${factor}`)
      })
    }

    if (incident.investigation.fiveWhys?.length > 0) {
      addSubsectionTitle('5 Whys Analysis')
      incident.investigation.fiveWhys.forEach(why => {
        if (why.answer) addParagraph(`Why ${why.why}: ${why.answer}`)
      })
    }

    if (incident.investigation.findings) {
      addSubsectionTitle('Findings')
      addParagraph(incident.investigation.findings)
    }

    if (incident.investigation.recommendations?.length > 0) {
      addSubsectionTitle('Recommendations')
      incident.investigation.recommendations.forEach(rec => {
        addParagraph(`- ${rec}`)
      })
    }
  }

  // Timeline
  if (incident.timeline?.length > 0) {
    addSectionTitle('Timeline')

    const timelineHeaders = ['Date', 'Action', 'By', 'Notes']
    const timelineRows = incident.timeline.slice().reverse().map(entry => [
      formatDateTime(entry.date),
      entry.action || '-',
      entry.by || 'System',
      entry.notes || '-'
    ])

    checkPageBreak(30)
    doc.autoTable({
      startY: currentY,
      head: [timelineHeaders],
      body: timelineRows,
      margin: { left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    })
    currentY = doc.lastAutoTable.finalY + 10
  }

  // Witnesses
  if (incident.witnesses?.length > 0) {
    addSectionTitle('Witnesses')

    const witnessHeaders = ['Name', 'Contact', 'Statement']
    const witnessRows = incident.witnesses.map(w => [
      w.name || 'Unknown',
      w.contact || '-',
      w.statement ? 'Recorded' : '-'
    ])

    checkPageBreak(30)
    doc.autoTable({
      startY: currentY,
      head: [witnessHeaders],
      body: witnessRows,
      margin: { left: margin, right: margin },
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    })
    currentY = doc.lastAutoTable.finalY + 10
  }

  // Add footers to all pages
  const totalPages = pageNumber
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    if (i > 1) addFooter(i, totalPages)
  }

  // Save
  const filename = `Incident_${incident.incidentNumber || 'Report'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`
  doc.save(filename)

  logger.info(`Incident report exported: ${filename}`)
  return filename
}
