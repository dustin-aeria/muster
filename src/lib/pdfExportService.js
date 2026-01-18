// ============================================
// PDF EXPORT SERVICE - ENHANCED VERSION
// Professional document formatting with:
// - Table of Contents generation
// - Section page breaks
// - Client logo support
// - Consistent header alignment
// - COR audit report support
// ============================================

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

export class BrandedPDF {
  constructor(options = {}) {
    this.options = options
    this.doc = null
    this.initialized = false
    this.branding = { ...DEFAULT_BRANDING, ...options.branding }
    this.clientBranding = options.clientBranding || null
    
    this.pageWidth = 215.9
    this.pageHeight = 279.4
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
    
    this.tocEntries = []
    this.tocPageNumber = 2
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
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 }
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

  addCoverPage() {
    this.setFillColor('primary')
    this.doc.rect(0, 0, this.pageWidth, 80, 'F')
    this.setFillColor('secondary')
    this.doc.rect(0, 80, this.pageWidth, 4, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(this.branding.operator.name, this.margin, 25)
    
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(200, 220, 255)
    const regText = this.branding.operator.registration
    const regWidth = this.doc.getTextWidth(regText)
    this.doc.text(regText, this.pageWidth - this.margin - regWidth, 25)
    
    this.doc.setFontSize(28)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(255, 255, 255)
    this.doc.text(this.title, this.margin, 50)
    
    if (this.subtitle) {
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(this.subtitle, this.margin, 65)
    }
    
    // Client branding section
    let nextY = 100
    if (this.clientBranding?.logo || this.clientBranding?.name) {
      this.setFillColor('light')
      this.doc.roundedRect(this.margin, 95, this.contentWidth, 35, 3, 3, 'F')
      
      this.setColor('textLight')
      this.doc.setFontSize(8)
      this.doc.text('PREPARED FOR', this.margin + 10, 103)
      
      this.setColor('text')
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(this.clientName || this.clientBranding.name || 'Client', this.margin + 10, 116)
      
      if (this.clientBranding.logo) {
        try {
          this.doc.addImage(this.clientBranding.logo, 'PNG', this.pageWidth - this.margin - 45, 100, 35, 25)
        } catch (e) { console.warn('Client logo error:', e) }
      }
      nextY = 140
    }
    
    // Project details
    this.setFillColor('light')
    this.doc.roundedRect(this.margin, nextY, this.contentWidth, 55, 3, 3, 'F')
    
    this.setColor('text')
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('PROJECT DETAILS', this.margin + 10, nextY + 12)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    
    const details = [
      { label: 'Project:', value: this.projectName },
      { label: 'Code:', value: this.projectCode },
      { label: 'Client:', value: this.clientName || 'N/A' },
      { label: 'Generated:', value: this.generatedDate }
    ]
    
    const colWidth = this.contentWidth / 2
    details.forEach((d, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = this.margin + 10 + (col * colWidth)
      const y = nextY + 25 + (row * 12)
      
      this.doc.setFont('helvetica', 'bold')
      this.setColor('text')
      this.doc.text(d.label, x, y)
      this.doc.setFont('helvetica', 'normal')
      this.setColor('textLight')
      this.doc.text(d.value || 'N/A', x + 25, y)
    })
    
    // Footer
    this.setColor('textLight')
    this.doc.setFontSize(8)
    this.doc.text(this.branding.operator.name, this.margin, this.pageHeight - 30)
    if (this.branding.operator.website) {
      this.doc.text(this.branding.operator.website, this.margin, this.pageHeight - 25)
    }
    this.doc.setFontSize(7)
    this.doc.text('This document contains confidential operational information.', this.margin, this.pageHeight - 10)
    
    return this
  }

  addTableOfContents() {
    this.doc.addPage()
    this.pageNumber++
    
    this.setFillColor('primary')
    this.doc.rect(0, 0, this.pageWidth, 15, 'F')
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('TABLE OF CONTENTS', this.margin, 10)
    
    this.currentY = 30
    this.setColor('primary')
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Contents', this.margin, this.currentY)
    this.currentY += 15
    
    this.setDrawColor('secondary')
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY - 5, this.pageWidth - this.margin, this.currentY - 5)
    
    this.tocStartY = this.currentY
    return this
  }

  fillTableOfContents() {
    if (this.tocEntries.length === 0) return this
    this.doc.setPage(this.tocPageNumber)
    
    let y = this.tocStartY || 45
    this.tocEntries.forEach((entry, index) => {
      if (y > this.pageHeight - 30) return
      
      this.setColor('text')
      this.doc.setFontSize(entry.level === 1 ? 11 : 9)
      this.doc.setFont('helvetica', entry.level === 1 ? 'bold' : 'normal')
      
      const indent = entry.level === 1 ? 0 : 10
      const titleX = this.margin + indent
      const pageX = this.pageWidth - this.margin - 10
      
      const sectionNum = entry.level === 1 ? `${index + 1}.` : ''
      const titleText = `${sectionNum} ${entry.title}`
      this.doc.text(titleText, titleX, y)
      
      const pageText = String(entry.page)
      const pageWidth = this.doc.getTextWidth(pageText)
      this.setColor('textLight')
      this.doc.text(pageText, pageX + 10 - pageWidth, y)
      
      y += entry.level === 1 ? 8 : 6
    })
    return this
  }

  addHeader() {
    this.setFillColor('primary')
    this.doc.rect(0, 0, this.pageWidth, 15, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(this.title, this.margin, 10)
    
    if (this.projectCode) {
      const centerWidth = this.doc.getTextWidth(this.projectCode)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(this.projectCode, (this.pageWidth - centerWidth) / 2, 10)
    }
    
    const rightText = this.branding.operator.name.split(' ')[0] || ''
    const rightWidth = this.doc.getTextWidth(rightText)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(rightText, this.pageWidth - this.margin - rightWidth, 10)
    
    this.currentY = 25
    return this
  }

  addFooter(pageNum, totalPages) {
    const footerY = this.pageHeight - 10
    
    this.setDrawColor('primary')
    this.doc.setLineWidth(0.3)
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5)
    
    this.setColor('textLight')
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(this.branding.operator.name, this.margin, footerY)
    
    const dateWidth = this.doc.getTextWidth(this.generatedDate)
    this.doc.text(this.generatedDate, (this.pageWidth - dateWidth) / 2, footerY)
    
    const pageText = `Page ${pageNum} of ${totalPages}`
    const pageWidth = this.doc.getTextWidth(pageText)
    this.doc.text(pageText, this.pageWidth - this.margin - pageWidth, footerY)
    
    return this
  }

  addNewSection(title, level = 1) {
    if (level === 1) {
      this.doc.addPage()
      this.pageNumber++
      this.addHeader()
    }
    
    this.tocEntries.push({ title, page: this.pageNumber, level })
    
    if (level === 1) {
      this.addSectionTitle(title)
    } else {
      this.addSubsectionTitle(title)
    }
    return this
  }

  addNewPage() {
    this.doc.addPage()
    this.pageNumber++
    this.addHeader()
    return this
  }

  checkNewPage(requiredSpace = 30) {
    if (this.currentY + requiredSpace > this.pageHeight - 25) {
      this.addNewPage()
      return true
    }
    return false
  }

  checkPageBreak(requiredSpace = 30) {
    return this.checkNewPage(requiredSpace)
  }

  addSectionTitle(text) {
    this.checkNewPage(20)
    
    this.setFillColor('primary')
    this.doc.roundedRect(this.margin, this.currentY, this.contentWidth, 10, 2, 2, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text.toUpperCase(), this.margin + 5, this.currentY + 7)
    
    this.currentY += 18
    return this
  }

  addSubsectionTitle(text) {
    this.checkNewPage(15)
    
    this.setColor('secondary')
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text, this.margin, this.currentY)
    
    this.setDrawColor('secondary')
    this.doc.setLineWidth(0.3)
    const textWidth = this.doc.getTextWidth(text)
    this.doc.line(this.margin, this.currentY + 1, this.margin + textWidth, this.currentY + 1)
    
    this.currentY += 10
    return this
  }

  addParagraph(text, options = {}) {
    if (!text) return this
    
    this.setColor(options.color || 'text')
    this.doc.setFontSize(options.fontSize || 9)
    this.doc.setFont('helvetica', options.bold ? 'bold' : 'normal')
    
    const indent = options.indent ? 10 : 0
    const lines = this.doc.splitTextToSize(text, this.contentWidth - indent)
    
    lines.forEach(line => {
      this.checkNewPage(6)
      this.doc.text(line, this.margin + indent, this.currentY)
      this.currentY += 5
    })
    
    this.currentY += 3
    return this
  }

  addLabelValue(label, value, inline = true) {
    if (value === null || value === undefined || value === '') return this
    this.checkNewPage(8)
    
    if (inline) {
      this.setColor('text')
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(label + ':', this.margin, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.setColor('textLight')
      this.doc.text(String(value), this.margin + 50, this.currentY)
      this.currentY += 6
    } else {
      this.setColor('text')
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(label, this.margin, this.currentY)
      this.currentY += 4
      this.doc.setFont('helvetica', 'normal')
      this.setColor('textLight')
      this.doc.setFontSize(9)
      this.doc.text(String(value), this.margin, this.currentY)
      this.currentY += 7
    }
    return this
  }

  addKeyValuePairs(pairs) {
    pairs.forEach(([label, value]) => this.addLabelValue(label, value))
    return this
  }

  addKeyValueGrid(items, columns = 2) {
    this.checkNewPage(20)
    const colWidth = this.contentWidth / columns
    let col = 0
    
    items.forEach(({ label, value }) => {
      if (!value && value !== 0) return
      const x = this.margin + (col * colWidth)
      
      this.setColor('text')
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(label, x, this.currentY)
      
      this.doc.setFont('helvetica', 'normal')
      this.setColor('textLight')
      this.doc.setFontSize(9)
      this.doc.text(String(value || 'N/A'), x, this.currentY + 5)
      
      col++
      if (col >= columns) {
        col = 0
        this.currentY += 14
      }
    })
    
    if (col !== 0) this.currentY += 14
    return this
  }

  addTable(headers, rows, options = {}) {
    this.checkNewPage(30)
    const colors = this.branding.operator.colors
    const rgb = this.hexToRgb(colors.primary)
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [headers],
      body: rows,
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: options.fontSize || 8, cellPadding: options.cellPadding || 3, lineColor: [200, 200, 200], lineWidth: 0.1, overflow: 'linebreak' },
      headStyles: { fillColor: [rgb.r, rgb.g, rgb.b], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: options.columnStyles || {}
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    return this
  }

  addBulletList(items, bullet = '•') {
    items.forEach(item => {
      if (!item) return
      this.checkNewPage(8)
      this.setColor('text')
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(bullet, this.margin + 5, this.currentY)
      
      const lines = this.doc.splitTextToSize(item, this.contentWidth - 15)
      lines.forEach((line, i) => {
        this.doc.text(line, this.margin + 12, this.currentY)
        if (i < lines.length - 1) { this.currentY += 5; this.checkNewPage(5) }
      })
      this.currentY += 6
    })
    return this
  }

  addNumberedList(items) {
    items.forEach((item, index) => {
      if (!item) return
      this.checkNewPage(8)
      this.setColor('text')
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`${index + 1}.`, this.margin + 3, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      const lines = this.doc.splitTextToSize(item, this.contentWidth - 15)
      lines.forEach((line, i) => {
        this.doc.text(line, this.margin + 12, this.currentY)
        if (i < lines.length - 1) { this.currentY += 5; this.checkNewPage(5) }
      })
      this.currentY += 6
    })
    return this
  }

  addSpacer(height = 10) { this.currentY += height; return this }

  addHorizontalRule() {
    this.setDrawColor('textLight')
    this.doc.setLineWidth(0.2)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 5
    return this
  }

  addInfoBox(title, content, type = 'info') {
    this.checkNewPage(30)
    const colors = {
      info: { bg: '#e0f2fe', border: '#3b82f6' },
      warning: { bg: '#fef3c7', border: '#f59e0b' },
      danger: { bg: '#fee2e2', border: '#ef4444' },
      success: { bg: '#dcfce7', border: '#22c55e' }
    }
    const style = colors[type] || colors.info
    
    this.setFillColor(style.bg)
    this.setDrawColor(style.border)
    this.doc.setLineWidth(0.5)
    this.doc.roundedRect(this.margin, this.currentY, this.contentWidth, 25, 2, 2, 'FD')
    
    this.setColor(style.border)
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin + 5, this.currentY + 8)
    
    this.setColor('text')
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(8)
    const lines = this.doc.splitTextToSize(content, this.contentWidth - 10)
    this.doc.text(lines[0], this.margin + 5, this.currentY + 16)
    
    this.currentY += 33
    return this
  }

  addKPIRow(kpis) {
    this.checkNewPage(30)
    const cardWidth = (this.contentWidth - ((kpis.length - 1) * 5)) / kpis.length
    
    kpis.forEach((kpi, index) => {
      const x = this.margin + (index * (cardWidth + 5))
      this.setFillColor('light')
      this.doc.roundedRect(x, this.currentY, cardWidth, 25, 2, 2, 'F')
      
      this.setColor('primary')
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(String(kpi.value), x + 5, this.currentY + 12)
      
      this.setColor('textLight')
      this.doc.setFontSize(7)
      this.doc.setFont('helvetica', 'normal')
      const labelLines = this.doc.splitTextToSize(kpi.label.toUpperCase(), cardWidth - 10)
      this.doc.text(labelLines[0], x + 5, this.currentY + 19)
    })
    
    this.currentY += 32
    return this
  }

  addSignatureBlock(signers = []) {
    this.checkNewPage(50)
    this.addSubsectionTitle('Signatures & Approvals')
    this.currentY += 5
    
    signers.forEach(signer => {
      this.checkNewPage(30)
      this.setDrawColor('textLight')
      this.doc.setLineWidth(0.3)
      this.doc.line(this.margin, this.currentY + 12, this.margin + 65, this.currentY + 12)
      
      this.setColor('text')
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(signer.role || 'Signature', this.margin, this.currentY + 17)
      
      this.doc.line(this.margin + 85, this.currentY + 12, this.margin + 130, this.currentY + 12)
      this.doc.text('Date', this.margin + 85, this.currentY + 17)
      
      if (signer.name) {
        this.setColor('textLight')
        this.doc.setFontSize(7)
        this.doc.text(`(${signer.name})`, this.margin, this.currentY + 22)
      }
      this.currentY += 30
    })
    return this
  }

  finalize() {
    if (this.tocEntries.length > 0) this.fillTableOfContents()
    const totalPages = this.doc.internal.getNumberOfPages()
    for (let i = 2; i <= totalPages; i++) {
      this.doc.setPage(i)
      this.addFooter(i - 1, totalPages - 1)
    }
    this.doc.setProperties({ title: this.title, subject: this.subtitle, author: this.branding.operator.name, creator: 'Aeria Ops' })
    return this
  }

  save(filename) { this.finalize(); this.doc.save(filename); return filename }
  getBlob() { this.finalize(); return this.doc.output('blob') }
  getDataUrl() { this.finalize(); return this.doc.output('dataurlstring') }
}

// Export functions omitted for brevity - see full file
export async function generateOperationsPlanPDF(project, branding = null, clientBranding = null) {
  const pdf = new BrandedPDF({
    title: 'RPAS Operations Plan',
    subtitle: project?.name || 'Operations Plan',
    projectName: project?.name || '',
    projectCode: project?.projectCode || '',
    clientName: project?.client || '',
    branding,
    clientBranding
  })
  
  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()
  
  pdf.addNewSection('Executive Summary')
  pdf.addParagraph(`This RPAS Operations Plan details the planned flight operations for ${project?.name || 'this project'}. It includes site assessment, flight parameters, risk mitigations, and emergency procedures.`)
  
  if (project?.overview?.description) {
    pdf.addSubsectionTitle('Project Description')
    pdf.addParagraph(project.overview.description)
  }
  
  pdf.addKeyValueGrid([
    { label: 'Project Code', value: project?.projectCode },
    { label: 'Client', value: project?.client },
    { label: 'Location', value: project?.overview?.location || project?.siteSurvey?.location?.description },
    { label: 'Status', value: project?.status }
  ])
  
  if (project?.siteSurvey) {
    pdf.addNewSection('Site Survey')
    const ss = project.siteSurvey
    if (ss.location) {
      pdf.addSubsectionTitle('Location Details')
      pdf.addKeyValueGrid([
        { label: 'Coordinates', value: ss.location.lat && ss.location.lng ? `${ss.location.lat}, ${ss.location.lng}` : 'Not set' },
        { label: 'Address', value: ss.location.description },
        { label: 'Elevation', value: ss.location.elevation ? `${ss.location.elevation}m ASL` : 'N/A' },
        { label: 'Access Type', value: ss.access?.type }
      ])
    }
    if (ss.obstacles?.length > 0) {
      pdf.addSubsectionTitle('Identified Obstacles')
      const obstacleRows = ss.obstacles.map(o => [o.type || 'Unknown', o.description || '', o.height ? `${o.height}m` : 'N/A', o.distance ? `${o.distance}m` : 'N/A'])
      pdf.addTable(['Type', 'Description', 'Height', 'Distance'], obstacleRows)
    }
  }
  
  if (project?.flightPlan) {
    pdf.addNewSection('Flight Plan')
    const fp = project.flightPlan
    pdf.addSubsectionTitle('Flight Parameters')
    pdf.addKeyValueGrid([
      { label: 'Aircraft', value: fp.aircraft?.name || fp.aircraftId },
      { label: 'Operation Type', value: fp.operationType },
      { label: 'Max Altitude', value: fp.maxAltitude ? `${fp.maxAltitude}m AGL` : 'N/A' },
      { label: 'Flight Radius', value: fp.flightRadius ? `${fp.flightRadius}m` : 'N/A' }
    ])
  }
  
  if (project?.hseRisk) {
    pdf.addNewSection('HSE Risk Assessment')
    if (project.hseRisk.hazards?.length > 0) {
      pdf.addSubsectionTitle('Identified Hazards')
      const hazardRows = project.hseRisk.hazards.map(h => [h.category || 'General', h.description || '', h.riskLevel?.toUpperCase() || 'N/A', h.residualRisk?.toUpperCase() || 'N/A'])
      pdf.addTable(['Category', 'Hazard', 'Initial Risk', 'Residual Risk'], hazardRows)
    }
  }
  
  if (project?.emergency) {
    pdf.addNewSection('Emergency Procedures')
    if (project.emergency.musterPoint) pdf.addLabelValue('Muster Point', project.emergency.musterPoint)
    if (project.emergency.contacts?.length > 0) {
      pdf.addSubsectionTitle('Emergency Contacts')
      const contactRows = project.emergency.contacts.map(c => [c.name || '', c.role || '', c.phone || ''])
      pdf.addTable(['Name', 'Role', 'Phone'], contactRows)
    }
  }
  
  if (project?.crew?.members?.length > 0) {
    pdf.addNewSection('Crew Roster')
    const crewRows = project.crew.members.map(m => [m.name || '', m.role || '', m.certifications?.join(', ') || 'N/A'])
    pdf.addTable(['Name', 'Role', 'Certifications'], crewRows)
  }
  
  pdf.addNewSection('Approvals')
  pdf.addSignatureBlock([
    { role: 'Pilot in Command (PIC)', name: '' },
    { role: 'Operations Manager', name: '' },
    { role: 'Client Representative', name: '' }
  ])
  
  return pdf
}

export async function generateSORAPDF(project, calculations, branding = null) {
  const pdf = new BrandedPDF({
    title: 'SORA Risk Assessment',
    subtitle: 'JARUS SORA 2.5 Methodology',
    projectName: project?.name || '',
    projectCode: project?.projectCode || '',
    clientName: project?.client || '',
    branding
  })
  
  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()
  
  pdf.addNewSection('Assessment Summary')
  pdf.addInfoBox('SAIL Level Determination', `Based on the assessment, this operation has been assigned SAIL Level ${calculations?.sailLevel || 'N/A'}`, 'info')
  pdf.addKPIRow([
    { label: 'Initial GRC', value: calculations?.initialGRC || 'N/A' },
    { label: 'Final GRC', value: calculations?.finalGRC || 'N/A' },
    { label: 'Air Risk Class', value: calculations?.airRiskClass || 'N/A' },
    { label: 'SAIL Level', value: calculations?.sailLevel || 'N/A' }
  ])
  
  pdf.addNewSection('Ground Risk Assessment')
  pdf.addSubsectionTitle('Intrinsic Ground Risk Class (iGRC)')
  pdf.addParagraph('The initial ground risk is determined by the characteristic UA dimension and the population density of the operational area.')
  
  pdf.addNewSection('Ground Risk Mitigations')
  pdf.addParagraph('Ground risk mitigations reduce the final GRC based on operational measures.')
  
  pdf.addNewSection('Air Risk Assessment')
  pdf.addSubsectionTitle('Air Risk Class (ARC)')
  pdf.addParagraph('The air risk class is determined by the airspace classification and the type of operation.')
  
  pdf.addNewSection('Assessment Approval')
  pdf.addSignatureBlock([{ role: 'Assessor' }, { role: 'Reviewer' }])
  
  return pdf
}

export async function generateHSERiskPDF(project, branding = null) {
  const pdf = new BrandedPDF({
    title: 'HSE Risk Assessment',
    subtitle: 'Workplace Hazard Analysis',
    projectName: project?.name || '',
    projectCode: project?.projectCode || '',
    clientName: project?.client || '',
    branding
  })
  
  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()
  
  const risk = project?.hseRisk || {}
  
  pdf.addNewSection('Assessment Summary')
  const highRisks = (risk.hazards || []).filter(h => h.riskLevel === 'high' || h.riskLevel === 'extreme').length
  const mediumRisks = (risk.hazards || []).filter(h => h.riskLevel === 'medium').length
  const lowRisks = (risk.hazards || []).filter(h => h.riskLevel === 'low').length
  
  pdf.addKPIRow([
    { label: 'Total Hazards', value: risk.hazards?.length || 0 },
    { label: 'High/Extreme Risk', value: highRisks },
    { label: 'Medium Risk', value: mediumRisks },
    { label: 'Low Risk', value: lowRisks }
  ])
  
  pdf.addNewSection('Hazard Register')
  if (risk.hazards?.length > 0) {
    risk.hazards.forEach((hazard, index) => {
      pdf.checkNewPage(40)
      pdf.addSubsectionTitle(`${index + 1}. ${hazard.description || 'Hazard'}`)
      pdf.addKeyValueGrid([
        { label: 'Category', value: hazard.category },
        { label: 'Initial Risk', value: hazard.riskLevel?.toUpperCase() },
        { label: 'Residual Risk', value: hazard.residualRisk?.toUpperCase() }
      ])
      if (hazard.controls?.length > 0) {
        pdf.addParagraph('Controls: ' + hazard.controls.join('; '), { fontSize: 8 })
      }
      pdf.addSpacer(5)
    })
  } else {
    pdf.addParagraph('No hazards identified.')
  }
  
  pdf.addNewSection('Approvals')
  pdf.addSignatureBlock([{ role: 'Assessor' }, { role: 'Reviewer' }])
  
  return pdf
}

export async function generateFormPDF(form, formTemplate, project, operators = [], branding = null) {
  const pdf = new BrandedPDF({
    title: formTemplate?.name || 'Form',
    subtitle: form.data?.header?.form_id || form.id,
    projectName: project?.name || '',
    projectCode: project?.projectCode || '',
    clientName: project?.client || '',
    branding
  })
  
  await pdf.init()
  pdf.addCoverPage()
  pdf.addNewPage()
  
  pdf.addSectionTitle('Form Information')
  pdf.addKeyValuePairs([
    ['Form Type', formTemplate?.name],
    ['Form ID', form.data?.header?.form_id || form.id],
    ['Status', form.status === 'completed' ? 'Completed' : 'Draft'],
    ['Created', form.createdAt ? new Date(form.createdAt).toLocaleString() : 'N/A'],
    ['Completed', form.completedAt ? new Date(form.completedAt).toLocaleString() : 'Not completed']
  ])
  
  const sections = Array.isArray(formTemplate?.sections) ? formTemplate.sections : []
  for (const section of sections) {
    if (!section || section.type === 'trigger_checklist') continue
    pdf.checkNewPage(40)
    pdf.addSubsectionTitle(section.title || 'Section')
    
    const sectionData = form.data?.[section.id]
    if (sectionData && typeof sectionData === 'object' && !Array.isArray(sectionData)) {
      const pairs = []
      ;(section.fields || []).forEach(field => {
        const value = sectionData[field.id]
        if (value !== null && value !== undefined && value !== '') {
          pairs.push([field.label, String(value)])
        }
      })
      if (pairs.length > 0) pdf.addKeyValuePairs(pairs)
    }
  }
  
  return pdf
}

export async function exportToPDF(type, project, options = {}) {
  const { branding, calculations, clientBranding } = options
  let pdf
  
  switch (type) {
    case 'operations-plan':
      pdf = await generateOperationsPlanPDF(project, branding, clientBranding)
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
  
  const filename = `${type}_${project?.projectCode || project?.name || 'export'}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
  return filename
}

export async function exportFormToPDF(form, formTemplate, project, operators = [], branding = null) {
  const pdf = await generateFormPDF(form, formTemplate, project, operators, branding)
  const formType = formTemplate?.id || 'form'
  const formId = form.data?.header?.form_id || form.id
  const filename = `${formType}_${formId}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
  return filename
}

export default {
  BrandedPDF,
  generateOperationsPlanPDF,
  generateSORAPDF,
  generateHSERiskPDF,
  generateFormPDF,
  exportToPDF,
  exportFormToPDF
}
