// ============================================
// PDF EXPORT SERVICE (CDN Version)
// Loads jspdf from CDN - no npm install needed
// ============================================

// CDN URLs for jspdf
const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
const AUTOTABLE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js'

// Track loading state
let jspdfLoaded = false
let loadingPromise = null

// ============================================
// LOAD JSPDF FROM CDN
// ============================================
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Check if already loaded
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
  if (jspdfLoaded && window.jspdf) {
    return window.jspdf.jsPDF
  }
  
  if (loadingPromise) {
    return loadingPromise
  }
  
  loadingPromise = (async () => {
    try {
      // Load jspdf first
      await loadScript(JSPDF_CDN)
      
      // Then load autotable plugin
      await loadScript(AUTOTABLE_CDN)
      
      jspdfLoaded = true
      return window.jspdf.jsPDF
    } catch (err) {
      console.error('Failed to load jsPDF:', err)
      throw err
    }
  })()
  
  return loadingPromise
}

// ============================================
// DEFAULT BRANDING (Aeria Solutions)
// ============================================
const DEFAULT_BRANDING = {
  operator: {
    name: 'Aeria Solutions Ltd.',
    registration: 'Transport Canada Operator #930355',
    tagline: 'Professional RPAS Operations',
    website: 'www.aeriasolutions.ca',
    email: 'ops@aeriasolutions.ca',
    phone: '',
    address: '',
    logo: null,
    colors: {
      primary: '#1e3a5f',
      secondary: '#3b82f6',
      accent: '#10b981',
      light: '#e0f2fe',
      text: '#1f2937',
      textLight: '#6b7280'
    }
  },
  client: null
}

// ============================================
// BRANDED PDF DOCUMENT CLASS
// ============================================
export class BrandedPDF {
  constructor(options = {}) {
    this.options = options
    this.doc = null
    this.initialized = false
    
    this.branding = {
      ...DEFAULT_BRANDING,
      ...options.branding
    }
    
    this.pageWidth = 215.9 // Letter width in mm
    this.pageHeight = 279.4 // Letter height in mm
    this.margin = options.margin || 20
    this.contentWidth = this.pageWidth - (this.margin * 2)
    this.currentY = this.margin
    this.pageNumber = 1
    
    this.title = options.title || 'Document'
    this.subtitle = options.subtitle || ''
    this.projectName = options.projectName || ''
    this.projectCode = options.projectCode || ''
    this.clientName = options.clientName || ''
    this.generatedDate = new Date().toLocaleDateString('en-CA')
  }

  async init() {
    if (this.initialized) return this
    
    const jsPDF = await loadJsPDF()
    this.doc = new jsPDF({
      orientation: this.options.orientation || 'portrait',
      unit: 'mm',
      format: 'letter'
    })
    
    this.initialized = true
    return this
  }

  // ============================================
  // COLOR UTILITIES
  // ============================================
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  setColor(colorKey) {
    const hex = this.branding.operator.colors[colorKey] || colorKey
    const { r, g, b } = this.hexToRgb(hex)
    this.doc.setTextColor(r, g, b)
    return this
  }

  setFillColor(colorKey) {
    const hex = this.branding.operator.colors[colorKey] || colorKey
    const { r, g, b } = this.hexToRgb(hex)
    this.doc.setFillColor(r, g, b)
    return this
  }

  setDrawColor(colorKey) {
    const hex = this.branding.operator.colors[colorKey] || colorKey
    const { r, g, b } = this.hexToRgb(hex)
    this.doc.setDrawColor(r, g, b)
    return this
  }

  // ============================================
  // LOGO HELPER
  // ============================================
  async addLogo(x, y, maxWidth, maxHeight) {
    const logo = this.branding?.operator?.logo
    if (!logo) return false
    
    try {
      // Logo should be base64 data URL
      if (!logo.startsWith('data:image')) {
        console.warn('Invalid logo format - expected base64 data URL')
        return false
      }
      
      // Get image dimensions using a promise-based approach
      const img = new window.Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = logo
      })
      
      // Calculate scaled dimensions maintaining aspect ratio
      let width = img.width
      let height = img.height
      const aspectRatio = width / height
      
      if (width > maxWidth) {
        width = maxWidth
        height = width / aspectRatio
      }
      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
      }
      
      // Determine format from data URL
      let format = 'PNG'
      if (logo.includes('image/jpeg') || logo.includes('image/jpg')) {
        format = 'JPEG'
      }
      
      // Add image to PDF
      this.doc.addImage(logo, format, x, y, width, height)
      return { width, height }
    } catch (err) {
      console.warn('Failed to add logo to PDF:', err)
      return false
    }
  }

  // ============================================
  // COVER PAGE (with logo support)
  // ============================================
  async addCoverPage() {
    // Background header
    this.setFillColor('primary')
    this.doc.rect(0, 0, this.pageWidth, 80, 'F')
    
    // Accent stripe
    this.setFillColor('secondary')
    this.doc.rect(0, 80, this.pageWidth, 4, 'F')
    
    // Try to add logo
    const logo = this.branding?.operator?.logo
    let logoAdded = false
    let textStartX = this.margin
    
    if (logo) {
      try {
        const logoResult = await this.addLogo(this.margin, 12, 50, 25)
        if (logoResult) {
          logoAdded = true
          textStartX = this.margin + logoResult.width + 10
        }
      } catch (err) {
        console.warn('Logo add failed, using text fallback')
      }
    }
    
    // Company name (positioned after logo if present)
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(logoAdded ? 14 : 18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(this.branding.operator.name, textStartX, logoAdded ? 22 : 30)
    
    // Registration
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(200, 220, 255)
    const regWidth = this.doc.getTextWidth(this.branding.operator.registration)
    this.doc.text(this.branding.operator.registration, this.pageWidth - this.margin - regWidth, 30)
    
    // Document title
    this.doc.setFontSize(28)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(255, 255, 255)
    this.doc.text(this.title, this.margin, 55)
    
    // Subtitle
    if (this.subtitle) {
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(this.subtitle, this.margin, 68)
    }
    
    // Project info box
    const boxY = 100
    this.setFillColor('light')
    this.doc.roundedRect(this.margin, boxY, this.contentWidth, 55, 3, 3, 'F')
    
    this.setColor('text')
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('PROJECT DETAILS', this.margin + 10, boxY + 12)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    
    const details = [
      { label: 'Project:', value: this.projectName },
      { label: 'Code:', value: this.projectCode },
      { label: 'Client:', value: this.clientName || 'N/A' },
      { label: 'Generated:', value: this.generatedDate }
    ]
    
    let detailY = boxY + 25
    details.forEach(d => {
      this.doc.setFont('helvetica', 'bold')
      this.setColor('text')
      this.doc.text(d.label, this.margin + 10, detailY)
      this.doc.setFont('helvetica', 'normal')
      this.setColor('textLight')
      this.doc.text(d.value || 'N/A', this.margin + 45, detailY)
      detailY += 8
    })
    
    // Footer
    const footerY = this.pageHeight - 30
    this.setColor('textLight')
    this.doc.setFontSize(8)
    this.doc.text(this.branding.operator.name, this.margin, footerY)
    this.doc.text(this.branding.operator.website || '', this.margin, footerY + 4)
    
    // Confidentiality
    this.doc.setFontSize(7)
    this.doc.text(
      'This document contains confidential operational information.',
      this.margin,
      this.pageHeight - 10
    )
    
    return this
  }

  // ============================================
  // HEADER & FOOTER
  // ============================================
  addHeader() {
    this.setFillColor('primary')
    this.doc.rect(0, 0, this.pageWidth, 15, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(this.title, this.margin, 10)
    
    const codeText = this.projectCode || this.projectName
    const codeWidth = this.doc.getTextWidth(codeText)
    this.doc.text(codeText, this.pageWidth - this.margin - codeWidth, 10)
    
    this.currentY = 25
    return this
  }

  addFooter(pageNum, totalPages) {
    const footerY = this.pageHeight - 10
    
    this.setDrawColor('primary')
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5)
    
    this.setColor('textLight')
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(this.branding.operator.name, this.margin, footerY)
    
    const pageText = `Page ${pageNum} of ${totalPages}`
    const pageWidth = this.doc.getTextWidth(pageText)
    this.doc.text(pageText, this.pageWidth - this.margin - pageWidth, footerY)
    
    const dateWidth = this.doc.getTextWidth(this.generatedDate)
    this.doc.text(this.generatedDate, (this.pageWidth - dateWidth) / 2, footerY)
    
    return this
  }

  // ============================================
  // CONTENT ELEMENTS
  // ============================================
  addNewPage() {
    this.doc.addPage()
    this.pageNumber++
    this.addHeader()
    return this
  }

  checkPageBreak(requiredSpace = 30) {
    if (this.currentY + requiredSpace > this.pageHeight - 25) {
      this.addNewPage()
    }
    return this
  }

  addSectionTitle(text) {
    this.checkPageBreak(20)
    
    this.setFillColor('primary')
    this.doc.roundedRect(this.margin, this.currentY, this.contentWidth, 10, 2, 2, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text.toUpperCase(), this.margin + 5, this.currentY + 7)
    
    this.currentY += 15
    return this
  }

  addSubsectionTitle(text) {
    this.checkPageBreak(15)
    
    this.setColor('secondary')
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text, this.margin, this.currentY)
    
    this.setDrawColor('secondary')
    this.doc.setLineWidth(0.3)
    const textWidth = this.doc.getTextWidth(text)
    this.doc.line(this.margin, this.currentY + 1, this.margin + textWidth, this.currentY + 1)
    
    this.currentY += 8
    return this
  }

  addParagraph(text) {
    if (!text) return this
    
    this.setColor('text')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'normal')
    
    const lines = this.doc.splitTextToSize(text, this.contentWidth)
    
    lines.forEach(line => {
      this.checkPageBreak(6)
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += 5
    })
    
    this.currentY += 3
    return this
  }

  addLabelValue(label, value) {
    if (!value) return this
    
    this.checkPageBreak(8)
    
    this.setColor('text')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(label + ':', this.margin, this.currentY)
    
    this.doc.setFont('helvetica', 'normal')
    this.setColor('textLight')
    this.doc.text(String(value), this.margin + 45, this.currentY)
    
    this.currentY += 6
    return this
  }

  addKeyValueGrid(items, columns = 2) {
    this.checkPageBreak(20)
    
    const colWidth = this.contentWidth / columns
    let col = 0
    let maxY = this.currentY
    
    items.forEach(({ label, value }) => {
      if (!value && value !== 0) return
      
      const x = this.margin + (col * colWidth)
      const y = this.currentY
      
      this.setColor('text')
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(label, x, y)
      
      this.doc.setFont('helvetica', 'normal')
      this.setColor('textLight')
      this.doc.setFontSize(9)
      this.doc.text(String(value || 'N/A'), x, y + 4)
      
      maxY = Math.max(maxY, y + 8)
      
      col++
      if (col >= columns) {
        col = 0
        this.currentY += 12
      }
    })
    
    this.currentY = maxY + 5
    return this
  }

  addTable(headers, rows) {
    this.checkPageBreak(30)
    
    const colors = this.branding.operator.colors
    const rgb = this.hexToRgb(colors.primary)
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [headers],
      body: rows,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [rgb.r, rgb.g, rgb.b],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    return this
  }

  addSpacer(height = 10) {
    this.currentY += height
    return this
  }

  addSignatureBlock(signers = []) {
    this.checkPageBreak(40)
    
    this.addSubsectionTitle('Signatures')
    
    signers.forEach(signer => {
      this.checkPageBreak(25)
      
      this.setDrawColor('textLight')
      this.doc.setLineWidth(0.3)
      this.doc.line(this.margin, this.currentY + 10, this.margin + 60, this.currentY + 10)
      
      this.setColor('text')
      this.doc.setFontSize(8)
      this.doc.text(signer.role || 'Signature', this.margin, this.currentY + 15)
      
      this.doc.line(this.margin + 80, this.currentY + 10, this.margin + 120, this.currentY + 10)
      this.doc.text('Date', this.margin + 80, this.currentY + 15)
      
      if (signer.name) {
        this.setColor('textLight')
        this.doc.setFontSize(7)
        this.doc.text(`(${signer.name})`, this.margin, this.currentY + 19)
      }
      
      this.currentY += 25
    })
    
    return this
  }

  // ============================================
  // FINALIZE & EXPORT
  // ============================================
  finalize() {
    const totalPages = this.doc.internal.getNumberOfPages()
    
    for (let i = 2; i <= totalPages; i++) {
      this.doc.setPage(i)
      this.addFooter(i - 1, totalPages - 1)
    }
    
    this.doc.setProperties({
      title: this.title,
      subject: this.subtitle,
      author: this.branding.operator.name,
      creator: 'Aeria Ops'
    })
    
    return this
  }

  save(filename) {
    this.finalize()
    this.doc.save(filename)
  }

  getBlob() {
    this.finalize()
    return this.doc.output('blob')
  }
}

// ============================================
// ASYNC PDF GENERATORS
// ============================================

export async function generateOperationsPlanPDF(project, branding = {}) {
  const pdf = new BrandedPDF({
    title: 'RPAS Operations Plan',
    subtitle: 'Flight Operations Documentation',
    projectName: project.name,
    projectCode: project.projectCode,
    clientName: project.clientName,
    branding
  })
  
  await pdf.init()
  
  await pdf.addCoverPage()
  pdf.addNewPage()
  
  // Project Overview
  pdf.addSectionTitle('Project Overview')
  pdf.addKeyValueGrid([
    { label: 'Project Name', value: project.name },
    { label: 'Project Code', value: project.projectCode },
    { label: 'Client', value: project.clientName },
    { label: 'Start Date', value: project.startDate },
    { label: 'End Date', value: project.endDate },
    { label: 'Status', value: project.status?.toUpperCase() }
  ])
  
  if (project.description) {
    pdf.addSubsectionTitle('Description')
    pdf.addParagraph(project.description)
  }
  
  // Crew
  if (project.crew?.length > 0) {
    pdf.addSectionTitle('Crew Roster')
    const crewRows = project.crew.map(c => [
      c.role || 'N/A',
      c.name || 'N/A',
      c.certifications || 'N/A',
      c.phone || 'N/A'
    ])
    pdf.addTable(['Role', 'Name', 'Certifications', 'Phone'], crewRows)
  }
  
  // Flight Plan
  if (project.flightPlan) {
    pdf.addSectionTitle('Flight Plan')
    const fp = project.flightPlan
    pdf.addKeyValueGrid([
      { label: 'Operation Type', value: fp.operationType },
      { label: 'Max Altitude', value: `${fp.maxAltitudeAGL || fp.maxAltitude || 'N/A'} m AGL` },
      { label: 'Flight Duration', value: fp.duration || 'N/A' },
      { label: 'Takeoff Location', value: fp.takeoffLocation || 'N/A' }
    ])
  }
  
  // SORA
  if (project.soraAssessment) {
    pdf.addSectionTitle('SORA Assessment')
    const sora = project.soraAssessment
    pdf.addKeyValueGrid([
      { label: 'SAIL Level', value: sora.sail },
      { label: 'Final GRC', value: sora.finalGRC },
      { label: 'Residual ARC', value: sora.residualARC || sora.initialARC }
    ])
  }
  
  // Emergency
  if (project.emergencyPlan) {
    pdf.addSectionTitle('Emergency Response')
    const ep = project.emergencyPlan
    pdf.addKeyValueGrid([
      { label: 'Primary Contact', value: ep.primaryEmergencyContact?.name },
      { label: 'Contact Phone', value: ep.primaryEmergencyContact?.phone },
      { label: 'Nearest Hospital', value: ep.nearestHospital },
      { label: 'Rally Point', value: ep.rallyPoint }
    ])
  }
  
  // Approvals
  pdf.addSectionTitle('Approvals')
  pdf.addSignatureBlock([
    { role: 'Pilot in Command', name: project.crew?.find(c => c.role === 'PIC')?.name },
    { role: 'Operations Manager' },
    { role: 'Client Representative' }
  ])
  
  return pdf
}

export async function generateSORAPDF(project, soraCalculations, branding = {}) {
  const pdf = new BrandedPDF({
    title: 'SORA 2.5 Assessment',
    subtitle: 'Specific Operations Risk Assessment',
    projectName: project.name,
    projectCode: project.projectCode,
    clientName: project.clientName,
    branding
  })
  
  await pdf.init()
  
  const sora = project.soraAssessment || {}
  const { intrinsicGRC, finalGRC, residualARC, sail } = soraCalculations
  
  await pdf.addCoverPage()
  pdf.addNewPage()
  
  // Summary
  pdf.addSectionTitle('Executive Summary')
  pdf.addKeyValueGrid([
    { label: 'SAIL Level', value: sail },
    { label: 'Final GRC', value: finalGRC },
    { label: 'Residual ARC', value: residualARC },
    { label: 'Assessment Status', value: 'Complete' }
  ])
  
  // ConOps
  pdf.addSectionTitle('Step 1: Concept of Operations')
  pdf.addKeyValueGrid([
    { label: 'Operation Type', value: sora.operationType },
    { label: 'Max Altitude AGL', value: `${sora.maxAltitudeAGL || 120}m` }
  ])
  
  // Ground Risk
  pdf.addSectionTitle('Steps 2-3: Ground Risk')
  pdf.addKeyValueGrid([
    { label: 'Population Category', value: sora.populationCategory },
    { label: 'UA Characteristic', value: sora.uaCharacteristic },
    { label: 'Intrinsic GRC', value: intrinsicGRC },
    { label: 'Final GRC', value: finalGRC }
  ])
  
  // Air Risk
  pdf.addSectionTitle('Steps 4-6: Air Risk')
  pdf.addKeyValueGrid([
    { label: 'Initial ARC', value: sora.initialARC },
    { label: 'TMPR Type', value: sora.tmpr?.type },
    { label: 'Residual ARC', value: residualARC }
  ])
  
  // SAIL
  pdf.addSectionTitle('Step 7: SAIL Determination')
  pdf.addLabelValue('SAIL Level', sail)
  
  return pdf
}

export async function generateHSERiskPDF(project, branding = {}) {
  const pdf = new BrandedPDF({
    title: 'HSE Risk Assessment',
    subtitle: 'Health, Safety & Environment Assessment',
    projectName: project.name,
    projectCode: project.projectCode,
    clientName: project.clientName,
    branding
  })
  
  await pdf.init()
  
  const hse = project.hseRiskAssessment || {}
  
  await pdf.addCoverPage()
  pdf.addNewPage()
  
  // Summary
  pdf.addSectionTitle('Assessment Summary')
  pdf.addKeyValueGrid([
    { label: 'Total Hazards', value: hse.hazards?.length || 0 },
    { label: 'High Risk Items', value: hse.hazards?.filter(h => (h.likelihood * h.severity) >= 15).length || 0 },
    { label: 'Risk Acceptable', value: hse.overallRiskAcceptable ? 'Yes' : 'Review Required' }
  ])
  
  // Hazard Register
  pdf.addSectionTitle('Hazard Register')
  if (hse.hazards?.length > 0) {
    const hazardRows = hse.hazards.map((h, i) => [
      String(i + 1),
      h.description || 'N/A',
      `${h.likelihood || '-'}x${h.severity || '-'}`,
      h.controls || 'N/A'
    ])
    pdf.addTable(['#', 'Hazard', 'Risk', 'Controls'], hazardRows)
  } else {
    pdf.addParagraph('No hazards identified')
  }
  
  // Signatures
  pdf.addSectionTitle('Approvals')
  pdf.addSignatureBlock([
    { role: 'Assessor' },
    { role: 'Reviewer' }
  ])
  
  return pdf
}

// ============================================
// EXPORT UTILITY
// ============================================
export async function exportToPDF(type, project, options = {}) {
  const { branding, calculations } = options
  
  let pdf
  
  switch (type) {
    case 'operations-plan':
      pdf = await generateOperationsPlanPDF(project, branding)
      break
    case 'sora':
      pdf = await generateSORAPDF(project, calculations, branding)
      break
    case 'hse-risk':
      pdf = await generateHSERiskPDF(project, branding)
      break
    default:
      throw new Error(`Unknown export type: ${type}`)
  }
  
  const filename = `${type}_${project.projectCode || project.name || 'export'}_${new Date().toISOString().split('T')[0]}.pdf`
  
  pdf.save(filename)
  return filename
}

export default {
  BrandedPDF,
  generateOperationsPlanPDF,
  generateSORAPDF,
  generateHSERiskPDF,
  exportToPDF
}
