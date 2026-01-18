// ============================================
// PDF EXPORT SERVICE - Premium Edition
// Beautiful, comprehensive exports with full data
// ============================================

// CDN URLs for jspdf
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

// ============================================
// PREMIUM COLOR PALETTE
// ============================================
const COLORS = {
  navy: '#0f172a',
  navyLight: '#1e3a5f',
  blue: '#3b82f6',
  blueLight: '#60a5fa',
  bluePale: '#dbeafe',
  emerald: '#10b981',
  emeraldPale: '#d1fae5',
  amber: '#f59e0b',
  amberPale: '#fef3c7',
  red: '#ef4444',
  redPale: '#fee2e2',
  purple: '#8b5cf6',
  purplePale: '#ede9fe',
  gray900: '#111827',
  gray700: '#374151',
  gray500: '#6b7280',
  gray400: '#9ca3af',
  gray300: '#d1d5db',
  gray200: '#e5e7eb',
  gray100: '#f3f4f6',
  gray50: '#f9fafb',
  white: '#ffffff'
}

const DEFAULT_BRANDING = {
  operator: {
    name: 'Aeria Solutions Ltd.',
    registration: 'Transport Canada Operator #930355',
    tagline: 'Professional RPAS Operations',
    website: 'www.aeriasolutions.ca',
    email: 'ops@aeriasolutions.ca',
    phone: '',
    logo: null,
    colors: {
      primary: COLORS.navy,
      secondary: COLORS.blue,
      accent: COLORS.emerald,
      light: COLORS.bluePale
    }
  }
}

// ============================================
// PREMIUM PDF CLASS
// ============================================
export class BrandedPDF {
  constructor(options = {}) {
    this.options = options
    this.doc = null
    this.initialized = false
    this.branding = { ...DEFAULT_BRANDING, ...options.branding }
    
    this.pageWidth = 215.9
    this.pageHeight = 279.4
    this.margin = 15
    this.contentWidth = this.pageWidth - (this.margin * 2)
    this.currentY = this.margin
    this.pageNumber = 1
    
    this.title = options.title || 'Document'
    this.subtitle = options.subtitle || ''
    this.projectName = options.projectName || ''
    this.projectCode = options.projectCode || ''
    this.clientName = options.clientName || ''
    this.generatedDate = new Date().toLocaleDateString('en-CA', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
    this.generatedTime = new Date().toLocaleTimeString('en-CA', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  async init() {
    if (this.initialized) return this
    const jsPDF = await loadJsPDF()
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
    this.initialized = true
    return this
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  setColor(hex) {
    const { r, g, b } = this.hexToRgb(hex)
    this.doc.setTextColor(r, g, b)
    return this
  }

  setFillColor(hex) {
    const { r, g, b } = this.hexToRgb(hex)
    this.doc.setFillColor(r, g, b)
    return this
  }

  setDrawColor(hex) {
    const { r, g, b } = this.hexToRgb(hex)
    this.doc.setDrawColor(r, g, b)
    return this
  }

  // ============================================
  // LOGO SUPPORT
  // ============================================
  async addLogo(x, y, maxWidth, maxHeight) {
    const logo = this.branding?.operator?.logo
    if (!logo || !logo.startsWith('data:image')) return false
    
    try {
      const img = new window.Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = logo
      })
      
      let width = img.width
      let height = img.height
      const aspectRatio = width / height
      
      if (width > maxWidth) { width = maxWidth; height = width / aspectRatio }
      if (height > maxHeight) { height = maxHeight; width = height * aspectRatio }
      
      const format = logo.includes('image/jpeg') ? 'JPEG' : 'PNG'
      this.doc.addImage(logo, format, x, y, width, height)
      return { width, height }
    } catch (err) {
      console.warn('Logo failed:', err)
      return false
    }
  }

  // ============================================
  // PREMIUM COVER PAGE
  // ============================================
  async addCoverPage() {
    // Navy header background
    this.setFillColor(COLORS.navy)
    this.doc.rect(0, 0, this.pageWidth, 95, 'F')
    
    // Decorative blue diagonal
    this.setFillColor(COLORS.blue)
    this.doc.triangle(0, 75, this.pageWidth, 85, this.pageWidth, 100, 'F')
    
    // Emerald accent line
    this.setFillColor(COLORS.emerald)
    this.doc.rect(0, 95, this.pageWidth, 4, 'F')
    
    // Logo
    let logoBottom = 30
    if (this.branding?.operator?.logo) {
      const logoResult = await this.addLogo(this.margin, 18, 55, 28)
      if (logoResult) logoBottom = 18 + logoResult.height + 8
    }
    
    // Company name
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(this.branding.operator.name, this.margin, logoBottom + 5)
    
    // Tagline
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(180, 200, 255)
    this.doc.text(this.branding.operator.tagline || '', this.margin, logoBottom + 12)
    
    // Registration (right)
    this.doc.setFontSize(8)
    const regText = this.branding.operator.registration
    const regWidth = this.doc.getTextWidth(regText)
    this.doc.text(regText, this.pageWidth - this.margin - regWidth, 28)
    
    // Document title
    this.doc.setFontSize(32)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(255, 255, 255)
    this.doc.text(this.title, this.margin, 70)
    
    // Subtitle
    if (this.subtitle) {
      this.doc.setFontSize(13)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(this.subtitle, this.margin, 80)
    }
    
    // Project details card
    const cardY = 115
    const cardHeight = 70
    
    // Card shadow
    this.setFillColor(COLORS.gray300)
    this.doc.roundedRect(this.margin + 2, cardY + 2, this.contentWidth, cardHeight, 4, 4, 'F')
    
    // Card background
    this.setFillColor(COLORS.white)
    this.doc.roundedRect(this.margin, cardY, this.contentWidth, cardHeight, 4, 4, 'F')
    
    // Card header stripe
    this.setFillColor(COLORS.gray50)
    this.doc.roundedRect(this.margin, cardY, this.contentWidth, 14, 4, 4, 'F')
    this.doc.rect(this.margin, cardY + 10, this.contentWidth, 4, 'F')
    
    // Header text
    this.setColor(COLORS.navy)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('PROJECT DETAILS', this.margin + 8, cardY + 10)
    
    // Project info grid
    const infoY = cardY + 26
    const col1X = this.margin + 8
    const col2X = this.pageWidth / 2 + 5
    
    const details = [
      { label: 'PROJECT NAME', value: this.projectName, x: col1X },
      { label: 'PROJECT CODE', value: this.projectCode, x: col2X },
      { label: 'CLIENT', value: this.clientName || 'N/A', x: col1X },
      { label: 'GENERATED', value: `${this.generatedDate} at ${this.generatedTime}`, x: col2X },
    ]
    
    let row = 0
    details.forEach((item, idx) => {
      const yPos = infoY + (row * 18)
      
      this.setColor(COLORS.gray500)
      this.doc.setFontSize(7)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(item.label, item.x, yPos)
      
      this.setColor(COLORS.gray900)
      this.doc.setFontSize(11)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(String(item.value || 'N/A'), item.x, yPos + 6)
      
      if (idx % 2 === 1) row++
    })
    
    // Confidential badge
    const badgeY = this.pageHeight - 50
    this.setFillColor(COLORS.bluePale)
    this.doc.roundedRect(this.margin, badgeY, 75, 18, 3, 3, 'F')
    this.setColor(COLORS.navyLight)
    this.doc.setFontSize(7)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('CONFIDENTIAL', this.margin + 5, badgeY + 7)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Operations Document', this.margin + 5, badgeY + 13)
    
    // Footer
    this.setColor(COLORS.gray400)
    this.doc.setFontSize(8)
    this.doc.text(
      `${this.branding.operator.name} | ${this.branding.operator.website || ''}`,
      this.margin, this.pageHeight - 15
    )
    
    return this
  }

  // ============================================
  // HEADER & FOOTER
  // ============================================
  addHeader() {
    this.setFillColor(COLORS.navy)
    this.doc.rect(0, 0, this.pageWidth, 12, 'F')
    
    this.setFillColor(COLORS.emerald)
    this.doc.rect(0, 12, this.pageWidth, 1.5, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(this.title, this.margin, 8)
    
    const codeText = this.projectCode || this.projectName
    const codeWidth = this.doc.getTextWidth(codeText)
    this.doc.text(codeText, this.pageWidth - this.margin - codeWidth, 8)
    
    this.currentY = 22
    return this
  }

  addFooter() {
    const footerY = this.pageHeight - 10
    
    this.setDrawColor(COLORS.gray200)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, footerY - 4, this.pageWidth - this.margin, footerY - 4)
    
    this.setColor(COLORS.gray400)
    this.doc.setFontSize(7)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(this.branding.operator.name, this.margin, footerY)
    
    const dateWidth = this.doc.getTextWidth(this.generatedDate)
    this.doc.text(this.generatedDate, (this.pageWidth - dateWidth) / 2, footerY)
    
    const pageText = `Page ${this.pageNumber}`
    const pageWidth = this.doc.getTextWidth(pageText)
    this.doc.text(pageText, this.pageWidth - this.margin - pageWidth, footerY)
    
    return this
  }

  // ============================================
  // PAGE MANAGEMENT
  // ============================================
  addNewPage() {
    this.doc.addPage()
    this.pageNumber++
    this.addHeader()
    return this
  }

  checkPageBreak(requiredSpace = 30) {
    if (this.currentY + requiredSpace > this.pageHeight - 20) {
      this.addFooter()
      this.addNewPage()
    }
    return this
  }

  // ============================================
  // SECTION COMPONENTS
  // ============================================
  addSectionTitle(text) {
    this.checkPageBreak(25)
    
    this.setFillColor(COLORS.navy)
    this.doc.roundedRect(this.margin, this.currentY, this.contentWidth, 11, 2, 2, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text.toUpperCase(), this.margin + 5, this.currentY + 7.5)
    
    this.currentY += 17
    return this
  }

  addSubsectionTitle(text) {
    this.checkPageBreak(15)
    
    this.setColor(COLORS.blue)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text, this.margin, this.currentY)
    
    this.setDrawColor(COLORS.blue)
    this.doc.setLineWidth(0.5)
    const textWidth = this.doc.getTextWidth(text)
    this.doc.line(this.margin, this.currentY + 1.5, this.margin + textWidth, this.currentY + 1.5)
    
    this.currentY += 8
    return this
  }

  addParagraph(text) {
    if (!text) return this
    
    this.setColor(COLORS.gray700)
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

  addLabelValue(label, value, highlight = false) {
    if (value === undefined || value === null || value === '') return this
    
    this.checkPageBreak(10)
    
    this.setColor(COLORS.gray500)
    this.doc.setFontSize(7)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(label.toUpperCase(), this.margin, this.currentY)
    
    this.setColor(highlight ? COLORS.blue : COLORS.gray900)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', highlight ? 'bold' : 'normal')
    this.doc.text(String(value), this.margin, this.currentY + 5)
    
    this.currentY += 12
    return this
  }

  addKeyValueGrid(items, columns = 2) {
    this.checkPageBreak(30)
    
    const colWidth = this.contentWidth / columns
    let col = 0
    
    items.forEach((item) => {
      if (!item.value && item.value !== 0) return
      
      const x = this.margin + (col * colWidth)
      
      this.setColor(COLORS.gray500)
      this.doc.setFontSize(7)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(item.label.toUpperCase(), x, this.currentY)
      
      this.setColor(COLORS.gray900)
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(String(item.value || 'N/A'), x, this.currentY + 5)
      
      col++
      if (col >= columns) {
        col = 0
        this.currentY += 14
      }
    })
    
    if (col > 0) this.currentY += 14
    this.currentY += 4
    return this
  }

  // ============================================
  // METRICS ROW (KPI Cards)
  // ============================================
  addMetricsRow(metrics) {
    this.checkPageBreak(45)
    
    const cardWidth = (this.contentWidth - (metrics.length - 1) * 4) / metrics.length
    const cardHeight = 32
    
    metrics.forEach((metric, idx) => {
      const x = this.margin + idx * (cardWidth + 4)
      
      // Card background
      this.setFillColor(COLORS.white)
      this.setDrawColor(COLORS.gray200)
      this.doc.setLineWidth(0.5)
      this.doc.roundedRect(x, this.currentY, cardWidth, cardHeight, 2, 2, 'FD')
      
      // Colored top border
      this.setFillColor(metric.color || COLORS.blue)
      this.doc.rect(x, this.currentY, cardWidth, 3, 'F')
      
      // Value
      this.setColor(metric.color || COLORS.blue)
      this.doc.setFontSize(16)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(String(metric.value), x + cardWidth/2, this.currentY + 17, { align: 'center' })
      
      // Label
      this.setColor(COLORS.gray500)
      this.doc.setFontSize(7)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(metric.label.toUpperCase(), x + cardWidth/2, this.currentY + 26, { align: 'center' })
    })
    
    this.currentY += cardHeight + 8
    return this
  }

  // ============================================
  // TABLES
  // ============================================
  addTable(headers, rows, options = {}) {
    this.checkPageBreak(40)
    
    const rgb = this.hexToRgb(COLORS.navy)
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [headers],
      body: rows,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
        textColor: [55, 65, 81]
      },
      headStyles: {
        fillColor: [rgb.r, rgb.g, rgb.b],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: options.columnStyles || {}
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    return this
  }

  // ============================================
  // CHECKLIST
  // ============================================
  addChecklist(items) {
    this.checkPageBreak(items.length * 7 + 10)
    
    items.forEach(item => {
      const checkColor = item.checked ? COLORS.emerald : COLORS.gray300
      
      this.setDrawColor(checkColor)
      this.setFillColor(item.checked ? checkColor : COLORS.white)
      this.doc.setLineWidth(0.5)
      this.doc.roundedRect(this.margin, this.currentY - 3, 4, 4, 0.5, 0.5, 'FD')
      
      if (item.checked) {
        this.doc.setTextColor(255, 255, 255)
        this.doc.setFontSize(6)
        this.doc.text('✓', this.margin + 0.8, this.currentY)
      }
      
      this.setColor(item.checked ? COLORS.gray900 : COLORS.gray500)
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(item.label, this.margin + 8, this.currentY)
      
      this.currentY += 7
    })
    
    this.currentY += 5
    return this
  }

  // ============================================
  // INFO BOXES
  // ============================================
  addInfoBox(title, content, type = 'info') {
    this.checkPageBreak(30)
    
    const colors = {
      info: { bg: COLORS.bluePale, border: COLORS.blue, text: COLORS.navyLight },
      success: { bg: COLORS.emeraldPale, border: COLORS.emerald, text: COLORS.gray900 },
      warning: { bg: COLORS.amberPale, border: COLORS.amber, text: COLORS.gray900 },
      danger: { bg: COLORS.redPale, border: COLORS.red, text: COLORS.gray900 }
    }
    
    const scheme = colors[type] || colors.info
    
    this.setFillColor(scheme.bg)
    this.doc.roundedRect(this.margin, this.currentY, this.contentWidth, 22, 3, 3, 'F')
    
    this.setFillColor(scheme.border)
    this.doc.rect(this.margin, this.currentY, 3, 22, 'F')
    
    this.setColor(scheme.text)
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin + 8, this.currentY + 7)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(8)
    this.doc.text(content.substring(0, 100), this.margin + 8, this.currentY + 15)
    
    this.currentY += 28
    return this
  }

  addSpacer(height = 8) {
    this.currentY += height
    return this
  }

  // ============================================
  // SIGNATURE BLOCK
  // ============================================
  addSignatureBlock(signers = []) {
    this.checkPageBreak(50)
    
    this.addSubsectionTitle('Signatures & Approvals')
    
    const colWidth = this.contentWidth / 2
    
    signers.forEach((signer, idx) => {
      const col = idx % 2
      const row = Math.floor(idx / 2)
      const x = this.margin + (col * colWidth)
      const y = this.currentY + (row * 30)
      
      this.setColor(COLORS.gray500)
      this.doc.setFontSize(7)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(signer.role || 'Signature', x, y)
      
      this.setDrawColor(COLORS.gray300)
      this.doc.setLineWidth(0.5)
      this.doc.line(x, y + 12, x + colWidth - 15, y + 12)
      
      this.setColor(COLORS.gray700)
      this.doc.setFontSize(8)
      if (signer.name) this.doc.text(signer.name, x, y + 18)
      if (signer.date) this.doc.text(`Date: ${signer.date}`, x, y + 24)
    })
    
    this.currentY += Math.ceil(signers.length / 2) * 30 + 10
    return this
  }

  finalize() {
    this.addFooter()
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
// POPULATION LABELS
// ============================================
const populationLabels = {
  controlled: 'Controlled Ground Area',
  remote: 'Remote/Sparsely Populated',
  lightly: 'Lightly Populated',
  sparsely: 'Sparsely Populated',
  suburban: 'Suburban/Populated',
  highdensity: 'High Density Urban',
  assembly: 'Gatherings/Assembly'
}

// ============================================
// COMPREHENSIVE OPERATIONS PLAN PDF
// ============================================
export async function generateOperationsPlanPDF(project, branding = {}) {
  const pdf = new BrandedPDF({
    title: 'RPAS Operations Plan',
    subtitle: 'Complete Project Documentation',
    projectName: project.name,
    projectCode: project.projectCode,
    clientName: project.clientName,
    branding
  })
  
  await pdf.init()
  await pdf.addCoverPage()
  pdf.addNewPage()
  
  const sora = project.soraAssessment || {}
  const hse = project.hseRiskAssessment || {}
  const fp = project.flightPlan || {}
  const ss = project.siteSurvey || {}
  
  // ==========================================
  // EXECUTIVE SUMMARY
  // ==========================================
  pdf.addSectionTitle('Executive Summary')
  
  const highRiskCount = hse.hazards?.filter(h => (h.likelihood * h.severity) >= 15).length || 0
  
  pdf.addMetricsRow([
    { label: 'SAIL Level', value: sora.sail || 'N/A', color: COLORS.purple },
    { label: 'Final GRC', value: sora.finalGRC || 'N/A', color: COLORS.blue },
    { label: 'Residual ARC', value: sora.residualARC || sora.initialARC || 'N/A', color: COLORS.emerald },
    { label: 'HSE Hazards', value: hse.hazards?.length || 0, color: highRiskCount > 0 ? COLORS.amber : COLORS.emerald }
  ])
  
  pdf.addKeyValueGrid([
    { label: 'Project Name', value: project.name },
    { label: 'Project Code', value: project.projectCode },
    { label: 'Client', value: project.clientName },
    { label: 'Status', value: project.status?.toUpperCase() },
    { label: 'Start Date', value: project.startDate },
    { label: 'End Date', value: project.endDate },
    { label: 'Operation Type', value: fp.operationType || 'VLOS' },
    { label: 'Max Altitude', value: fp.maxAltitudeAGL ? `${fp.maxAltitudeAGL}m AGL` : 'N/A' }
  ])
  
  if (project.description) {
    pdf.addSubsectionTitle('Project Description')
    pdf.addParagraph(project.description)
  }
  
  // ==========================================
  // SITE SURVEY
  // ==========================================
  if (ss && Object.keys(ss).length > 0) {
    pdf.addSectionTitle('Site Survey')
    
    // Location
    if (ss.location) {
      pdf.addSubsectionTitle('Location Details')
      pdf.addKeyValueGrid([
        { label: 'Site Name', value: ss.location.name },
        { label: 'Address', value: ss.location.address },
        { label: 'Coordinates', value: ss.location.coordinates ? 
          `${ss.location.coordinates.lat}, ${ss.location.coordinates.lng}` : 
          (ss.location.lat ? `${ss.location.lat}, ${ss.location.lng}` : 'N/A') },
        { label: 'Elevation', value: ss.location.elevation ? `${ss.location.elevation}m` : 'N/A' }
      ])
    }
    
    // Population
    if (ss.population) {
      pdf.addSubsectionTitle('Population Assessment')
      pdf.addKeyValueGrid([
        { label: 'Population Category', value: populationLabels[ss.population.category] || ss.population.category },
        { label: 'Adjacent Category', value: populationLabels[ss.population.adjacentCategory] || ss.population.adjacentCategory },
        { label: 'Assessment Source', value: ss.population.source || 'Visual Assessment' }
      ])
      if (ss.population.justification) {
        pdf.addLabelValue('Justification', ss.population.justification)
      }
    }
    
    // Airspace
    if (ss.airspace) {
      pdf.addSubsectionTitle('Airspace Information')
      pdf.addKeyValueGrid([
        { label: 'Classification', value: `Class ${ss.airspace.classification}` },
        { label: 'NAV CANADA Auth', value: ss.airspace.navCanadaAuth ? 'Required' : 'Not Required' },
        { label: 'Restrictions', value: ss.airspace.restrictions || 'None identified' }
      ])
      
      if (ss.airspace.nearbyAerodromes?.length > 0) {
        pdf.addSubsectionTitle('Nearby Aerodromes')
        const aerodromeRows = ss.airspace.nearbyAerodromes.map(a => [
          a.name || 'N/A',
          a.identifier || 'N/A',
          a.distance ? `${a.distance} km` : 'N/A',
          a.bearing || 'N/A'
        ])
        pdf.addTable(['Name', 'Identifier', 'Distance', 'Bearing'], aerodromeRows)
      }
    }
    
    // Obstacles
    if (ss.obstacles?.length > 0) {
      pdf.addSubsectionTitle('Identified Obstacles')
      const obstacleRows = ss.obstacles.map(o => [
        o.type || 'N/A',
        o.description || 'N/A',
        o.height ? `${o.height}m` : 'N/A',
        o.distance ? `${o.distance}m` : 'N/A',
        o.mitigations || 'N/A'
      ])
      pdf.addTable(['Type', 'Description', 'Height', 'Distance', 'Mitigations'], obstacleRows)
    }
    
    // Access & Ground Conditions
    if (ss.access || ss.groundConditions) {
      pdf.addSubsectionTitle('Site Access & Conditions')
      pdf.addKeyValueGrid([
        { label: 'Access Type', value: ss.access?.type },
        { label: 'Contact On-Site', value: ss.access?.contactOnSite },
        { label: 'Gate Code', value: ss.access?.gateCode },
        { label: 'Vehicle Access', value: ss.groundConditions?.suitableForVehicle ? 'Yes' : 'No' }
      ])
      if (ss.access?.directions) {
        pdf.addLabelValue('Directions', ss.access.directions)
      }
      if (ss.groundConditions?.hazards) {
        pdf.addLabelValue('Ground Hazards', ss.groundConditions.hazards)
      }
    }
  }
  
  // ==========================================
  // FLIGHT PLAN
  // ==========================================
  if (fp && Object.keys(fp).length > 0) {
    pdf.addSectionTitle('Flight Plan')
    
    // Operation parameters
    pdf.addSubsectionTitle('Operation Parameters')
    pdf.addKeyValueGrid([
      { label: 'Operation Type', value: fp.operationType },
      { label: 'Max Altitude AGL', value: fp.maxAltitudeAGL ? `${fp.maxAltitudeAGL}m` : 'N/A' },
      { label: 'Max Flight Duration', value: fp.maxDuration ? `${fp.maxDuration} min` : 'N/A' },
      { label: 'Flight Radius', value: fp.flightRadius ? `${fp.flightRadius}m` : 'N/A' }
    ])
    
    // Launch/Recovery
    if (fp.launchRecovery) {
      pdf.addSubsectionTitle('Launch & Recovery Points')
      const lr = fp.launchRecovery
      pdf.addKeyValueGrid([
        { label: 'Launch Point', value: lr.launchPoint ? `${lr.launchPoint.lat}, ${lr.launchPoint.lng}` : 'N/A' },
        { label: 'Launch Description', value: lr.launchDescription },
        { label: 'Recovery Point', value: lr.recoveryPoint ? `${lr.recoveryPoint.lat}, ${lr.recoveryPoint.lng}` : 
          (lr.launchPoint ? 'Same as Launch' : 'N/A') },
        { label: 'Recovery Description', value: lr.recoveryDescription }
      ])
    }
    
    // Aircraft
    if (fp.aircraft?.length > 0) {
      pdf.addSubsectionTitle('Aircraft')
      const aircraftRows = fp.aircraft.map(a => [
        a.isPrimary ? '★ ' + (a.nickname || a.model) : (a.nickname || a.model),
        a.make || 'N/A',
        a.serialNumber || 'N/A',
        a.mtow ? `${a.mtow} kg` : 'N/A',
        a.registration || 'N/A'
      ])
      pdf.addTable(['Aircraft', 'Make', 'Serial #', 'MTOW', 'Registration'], aircraftRows)
    }
    
    // Weather minimums
    if (fp.weatherMinimums) {
      pdf.addSubsectionTitle('Weather Minimums')
      const wm = fp.weatherMinimums
      pdf.addKeyValueGrid([
        { label: 'Min Visibility', value: wm.minVisibility ? `${wm.minVisibility} km` : 'N/A' },
        { label: 'Min Ceiling', value: wm.minCeiling ? `${wm.minCeiling} ft AGL` : 'N/A' },
        { label: 'Max Wind', value: wm.maxWind ? `${wm.maxWind} kt` : 'N/A' },
        { label: 'Max Gust', value: wm.maxGust ? `${wm.maxGust} kt` : 'N/A' }
      ])
      if (wm.notes) {
        pdf.addLabelValue('Notes', wm.notes)
      }
    }
    
    // Contingencies
    if (fp.contingencies?.length > 0) {
      pdf.addSubsectionTitle('Contingency Procedures')
      const contRows = fp.contingencies.map(c => [
        c.trigger || 'N/A',
        c.action || 'N/A',
        (c.priority || 'Medium').toUpperCase()
      ])
      pdf.addTable(['Trigger', 'Action', 'Priority'], contRows)
    }
  }
  
  // ==========================================
  // SORA ASSESSMENT
  // ==========================================
  if (sora && Object.keys(sora).length > 0) {
    pdf.addSectionTitle('SORA 2.5 Risk Assessment')
    
    pdf.addMetricsRow([
      { label: 'SAIL Level', value: sora.sail || 'N/A', color: COLORS.purple },
      { label: 'Intrinsic GRC', value: sora.intrinsicGRC || 'N/A', color: COLORS.gray500 },
      { label: 'Final GRC', value: sora.finalGRC || 'N/A', color: COLORS.blue },
      { label: 'Residual ARC', value: sora.residualARC || sora.initialARC || 'N/A', color: COLORS.emerald }
    ])
    
    // ConOps
    pdf.addSubsectionTitle('Concept of Operations')
    pdf.addKeyValueGrid([
      { label: 'Operation Type', value: sora.operationType },
      { label: 'Max Altitude', value: sora.maxAltitudeAGL ? `${sora.maxAltitudeAGL}m AGL` : 'N/A' },
      { label: 'Population Category', value: populationLabels[sora.populationCategory] || sora.populationCategory },
      { label: 'UA Characteristic', value: sora.uaCharacteristic }
    ])
    
    // Ground Risk Mitigations
    if (sora.mitigations) {
      pdf.addSubsectionTitle('Ground Risk Mitigations')
      const mitigations = [
        { label: 'M1(A) - Strategic Sheltering', checked: sora.mitigations.M1A?.enabled },
        { label: 'M1(B) - Operational Restrictions', checked: sora.mitigations.M1B?.enabled },
        { label: 'M1(C) - Emergency Response Plan', checked: sora.mitigations.M1C?.enabled },
        { label: 'M2 - Impact Dynamics Reduced', checked: sora.mitigations.M2?.enabled }
      ]
      pdf.addChecklist(mitigations)
    }
    
    // Air Risk
    pdf.addSubsectionTitle('Air Risk Assessment')
    pdf.addKeyValueGrid([
      { label: 'Initial ARC', value: sora.initialARC },
      { label: 'TMPR Type', value: sora.tmpr?.type || 'N/A' },
      { label: 'TMPR Robustness', value: sora.tmpr?.robustness || 'N/A' },
      { label: 'Residual ARC', value: sora.residualARC || sora.initialARC }
    ])
    
    // Adjacent Area / Containment
    if (sora.containment || sora.adjacentAreaPopulation) {
      pdf.addSubsectionTitle('Containment Assessment')
      pdf.addKeyValueGrid([
        { label: 'Adjacent Area Population', value: populationLabels[sora.adjacentAreaPopulation] || sora.adjacentAreaPopulation },
        { label: 'Containment Required', value: sora.containment?.required ? 'Yes' : 'No' },
        { label: 'Containment Robustness', value: sora.containment?.robustness || 'None' }
      ])
    }
    
    // OSO Compliance
    if (sora.osoCompliance && Object.keys(sora.osoCompliance).length > 0) {
      pdf.addSubsectionTitle('OSO Compliance Summary')
      const osoEntries = Object.entries(sora.osoCompliance)
      const osoRows = osoEntries.slice(0, 12).map(([id, data]) => [
        id,
        data.requirement?.substring(0, 40) || 'N/A',
        data.robustness || 'None',
        data.evidence ? '✓' : '-'
      ])
      pdf.addTable(['OSO', 'Requirement', 'Robustness', 'Evidence'], osoRows)
      
      if (osoEntries.length > 12) {
        const osoRows2 = osoEntries.slice(12).map(([id, data]) => [
          id,
          data.requirement?.substring(0, 40) || 'N/A',
          data.robustness || 'None',
          data.evidence ? '✓' : '-'
        ])
        pdf.addTable(['OSO', 'Requirement', 'Robustness', 'Evidence'], osoRows2)
      }
    }
  }
  
  // ==========================================
  // HSE RISK ASSESSMENT
  // ==========================================
  if (hse && Object.keys(hse).length > 0) {
    pdf.addSectionTitle('HSE Risk Assessment')
    
    const criticalCount = hse.hazards?.filter(h => (h.likelihood * h.severity) >= 20).length || 0
    const highCount = hse.hazards?.filter(h => {
      const s = h.likelihood * h.severity
      return s >= 15 && s < 20
    }).length || 0
    const mediumCount = hse.hazards?.filter(h => {
      const s = h.likelihood * h.severity
      return s >= 8 && s < 15
    }).length || 0
    
    pdf.addMetricsRow([
      { label: 'Total Hazards', value: hse.hazards?.length || 0, color: COLORS.blue },
      { label: 'Critical/High', value: criticalCount + highCount, color: COLORS.red },
      { label: 'Medium', value: mediumCount, color: COLORS.amber },
      { label: 'Risk Acceptable', value: hse.overallRiskAcceptable ? 'YES' : 'NO', 
        color: hse.overallRiskAcceptable ? COLORS.emerald : COLORS.red }
    ])
    
    // Hazard register
    if (hse.hazards?.length > 0) {
      pdf.addSubsectionTitle('Hazard Register')
      const hazardRows = hse.hazards.map((h, i) => {
        const initialScore = h.likelihood * h.severity
        const residualScore = h.residualLikelihood * h.residualSeverity
        return [
          String(i + 1),
          h.category || 'N/A',
          (h.description || 'N/A').substring(0, 35) + ((h.description?.length > 35) ? '...' : ''),
          String(initialScore),
          h.controlType || 'Admin',
          String(residualScore)
        ]
      })
      pdf.addTable(['#', 'Category', 'Hazard', 'Initial', 'Control', 'Residual'], hazardRows)
    }
    
    // Review info
    if (hse.reviewedBy || hse.reviewNotes) {
      pdf.addSubsectionTitle('Assessment Review')
      pdf.addKeyValueGrid([
        { label: 'Reviewed By', value: hse.reviewedBy },
        { label: 'Review Date', value: hse.reviewDate },
        { label: 'Approved By', value: hse.approvedBy },
        { label: 'Approval Date', value: hse.approvalDate }
      ])
      if (hse.reviewNotes) {
        pdf.addLabelValue('Review Notes', hse.reviewNotes)
      }
    }
  }
  
  // ==========================================
  // CREW ROSTER
  // ==========================================
  if (project.crew?.length > 0) {
    pdf.addSectionTitle('Crew Roster')
    
    const crewRows = project.crew.map(c => [
      c.role || 'N/A',
      c.name || 'N/A',
      c.certifications || 'N/A',
      c.certificateNumber || 'N/A',
      c.phone || 'N/A'
    ])
    pdf.addTable(['Role', 'Name', 'Certifications', 'Cert #', 'Phone'], crewRows)
  }
  
  // ==========================================
  // EMERGENCY PLAN
  // ==========================================
  if (project.emergencyPlan && Object.keys(project.emergencyPlan).length > 0) {
    pdf.addSectionTitle('Emergency Response Plan')
    
    const ep = project.emergencyPlan
    
    // Emergency contacts
    if (ep.contacts?.length > 0) {
      pdf.addSubsectionTitle('Emergency Contacts')
      const contactRows = ep.contacts.map(c => [
        c.name || 'N/A',
        c.role || 'N/A',
        c.phone || 'N/A',
        c.priority || 'N/A'
      ])
      pdf.addTable(['Name', 'Role', 'Phone', 'Priority'], contactRows)
    }
    
    // Nearest hospital
    if (ep.nearestHospital) {
      pdf.addSubsectionTitle('Nearest Medical Facility')
      pdf.addKeyValueGrid([
        { label: 'Hospital', value: ep.nearestHospital.name },
        { label: 'Address', value: ep.nearestHospital.address },
        { label: 'Distance', value: ep.nearestHospital.distance },
        { label: 'Phone', value: ep.nearestHospital.phone }
      ])
    }
    
    // Emergency procedures
    if (ep.procedures) {
      pdf.addSubsectionTitle('Emergency Procedures')
      Object.entries(ep.procedures).forEach(([key, value]) => {
        if (value) {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          pdf.addLabelValue(label, value)
        }
      })
    }
  }
  
  // ==========================================
  // PPE REQUIREMENTS
  // ==========================================
  if (project.ppe && Object.keys(project.ppe).length > 0) {
    pdf.addSectionTitle('PPE Requirements')
    
    const ppeItems = project.ppe.required || project.ppe.items || []
    if (ppeItems.length > 0) {
      pdf.addChecklist(ppeItems.map(item => ({
        label: typeof item === 'string' ? item : (item.name || item.item),
        checked: true
      })))
    }
    
    if (project.ppe.notes) {
      pdf.addLabelValue('Additional Notes', project.ppe.notes)
    }
  }
  
  // ==========================================
  // COMMUNICATIONS
  // ==========================================
  if (project.communications && Object.keys(project.communications).length > 0) {
    pdf.addSectionTitle('Communications Plan')
    
    const comms = project.communications
    pdf.addKeyValueGrid([
      { label: 'Primary Method', value: comms.primaryMethod },
      { label: 'Backup Method', value: comms.backupMethod },
      { label: 'Radio Channel', value: comms.radioChannel },
      { label: 'Check-in Frequency', value: comms.checkInFrequency }
    ])
    
    if (comms.callSigns) {
      pdf.addLabelValue('Call Signs', comms.callSigns)
    }
    
    if (comms.frequencies?.length > 0) {
      pdf.addSubsectionTitle('Frequencies')
      const freqRows = comms.frequencies.map(f => [
        f.name || 'N/A',
        f.frequency || 'N/A',
        f.purpose || 'N/A'
      ])
      pdf.addTable(['Name', 'Frequency', 'Purpose'], freqRows)
    }
  }
  
  // ==========================================
  // APPROVALS
  // ==========================================
  if (project.approvals && Object.keys(project.approvals).length > 0) {
    pdf.addSectionTitle('Approvals & Sign-Off')
    
    const approvals = project.approvals
    const signers = []
    
    if (approvals.preparedBy) {
      signers.push({ role: 'Prepared By', name: approvals.preparedBy, date: approvals.preparedDate })
    }
    if (approvals.reviewedBy) {
      signers.push({ role: 'Reviewed By', name: approvals.reviewedBy, date: approvals.reviewedDate })
    }
    if (approvals.approvedBy) {
      signers.push({ role: 'Approved By', name: approvals.approvedBy, date: approvals.approvedDate })
    }
    if (approvals.clientApproval) {
      signers.push({ role: 'Client Approval', name: approvals.clientApproval, date: approvals.clientApprovalDate })
    }
    
    if (signers.length > 0) {
      pdf.addSignatureBlock(signers)
    }
    
    if (approvals.notes) {
      pdf.addLabelValue('Approval Notes', approvals.notes)
    }
  }
  
  // ==========================================
  // FORMS CHECKLIST
  // ==========================================
  if (project.forms?.length > 0) {
    pdf.addSectionTitle('Forms & Documentation')
    
    const formRows = project.forms.map(f => [
      f.templateId || f.type || 'N/A',
      f.status || 'N/A',
      f.completedAt ? new Date(f.completedAt.seconds ? f.completedAt.seconds * 1000 : f.completedAt).toLocaleDateString() : 'N/A',
      f.completedBy || 'N/A'
    ])
    pdf.addTable(['Form Type', 'Status', 'Completed', 'By'], formRows)
  }
  
  // ==========================================
  // DOCUMENT END
  // ==========================================
  pdf.addSpacer(10)
  pdf.addInfoBox(
    'Document Control',
    `This operations plan was generated by Aeria Ops on ${pdf.generatedDate}. For questions, contact ${pdf.branding.operator.email || pdf.branding.operator.name}.`,
    'info'
  )
  
  return pdf.getBlob()
}

// ============================================
// SORA-SPECIFIC PDF
// ============================================
export async function generateSORAPDF(project, branding = {}, soraCalculations = {}) {
  const pdf = new BrandedPDF({
    title: 'SORA 2.5 Assessment',
    subtitle: 'Specific Operations Risk Assessment',
    projectName: project.name,
    projectCode: project.projectCode,
    clientName: project.clientName,
    branding
  })
  
  await pdf.init()
  await pdf.addCoverPage()
  pdf.addNewPage()
  
  const sora = project.soraAssessment || {}
  const { intrinsicGRC, finalGRC, residualARC, sail } = soraCalculations
  
  pdf.addSectionTitle('Assessment Summary')
  pdf.addMetricsRow([
    { label: 'SAIL Level', value: sail || sora.sail || 'N/A', color: COLORS.purple },
    { label: 'Intrinsic GRC', value: intrinsicGRC || sora.intrinsicGRC || 'N/A', color: COLORS.gray500 },
    { label: 'Final GRC', value: finalGRC || sora.finalGRC || 'N/A', color: COLORS.blue },
    { label: 'Residual ARC', value: residualARC || sora.residualARC || 'N/A', color: COLORS.emerald }
  ])
  
  pdf.addSubsectionTitle('This assessment follows JARUS SORA 2.5 methodology')
  pdf.addParagraph('The Specific Operations Risk Assessment (SORA) provides a systematic methodology for evaluating the risk of unmanned aircraft system operations and determining the robustness requirements for mitigations.')
  
  // Add full SORA content similar to operations plan...
  
  return pdf.getBlob()
}

// ============================================
// HSE RISK PDF
// ============================================
export async function generateHSERiskPDF(project, branding = {}) {
  const pdf = new BrandedPDF({
    title: 'HSE Risk Assessment',
    subtitle: 'Health, Safety & Environment',
    projectName: project.name,
    projectCode: project.projectCode,
    clientName: project.clientName,
    branding
  })
  
  await pdf.init()
  await pdf.addCoverPage()
  pdf.addNewPage()
  
  const hse = project.hseRiskAssessment || {}
  
  pdf.addSectionTitle('Risk Assessment Summary')
  
  const highRiskCount = hse.hazards?.filter(h => (h.likelihood * h.severity) >= 15).length || 0
  pdf.addMetricsRow([
    { label: 'Total Hazards', value: hse.hazards?.length || 0, color: COLORS.blue },
    { label: 'High Risk', value: highRiskCount, color: COLORS.red },
    { label: 'Risk Acceptable', value: hse.overallRiskAcceptable ? 'YES' : 'NO', 
      color: hse.overallRiskAcceptable ? COLORS.emerald : COLORS.red }
  ])
  
  if (hse.hazards?.length > 0) {
    pdf.addSectionTitle('Hazard Register')
    const hazardRows = hse.hazards.map((h, i) => [
      String(i + 1),
      h.category || 'N/A',
      h.description || 'N/A',
      `${h.likelihood}×${h.severity}=${h.likelihood * h.severity}`,
      h.controls?.substring(0, 30) || 'N/A',
      `${h.residualLikelihood}×${h.residualSeverity}=${h.residualLikelihood * h.residualSeverity}`
    ])
    pdf.addTable(['#', 'Category', 'Hazard', 'Initial', 'Controls', 'Residual'], hazardRows)
  }
  
  return pdf.getBlob()
}

// ============================================
// LEGACY EXPORT
// ============================================
export const exportToPDF = generateOperationsPlanPDF
