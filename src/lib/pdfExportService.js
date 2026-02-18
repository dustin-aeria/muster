/**
 * PDF EXPORT SERVICE - ENHANCED VERSION
 * Professional document formatting with:
 * - Table of Contents generation
 * - Section page breaks
 * - Operator logo in header (right corner) - FIX #4
 * - Client logo in footer (bottom right) - FIX #5
 * - Fixed clientName field references - FIX #7
 * - COR audit report support
 * 
 * @location src/lib/pdfExportService.js
 * @action REPLACE
 */

import { logger } from './logger'
import { getSiteMapImage, getProjectMapImages } from './staticMapService'

const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
const AUTOTABLE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js'

let jspdfLoaded = false
let loadingPromise = null

function loadScript(src, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true

    // Timeout handler
    const timeoutId = setTimeout(() => {
      script.onload = null
      script.onerror = null
      reject(new Error(`Timeout loading ${src}`))
    }, timeoutMs)

    script.onload = () => {
      clearTimeout(timeoutId)
      resolve()
    }
    script.onerror = () => {
      clearTimeout(timeoutId)
      reject(new Error(`Failed to load ${src}`))
    }
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
    name: 'Your Company Name',
    registration: '',
    tagline: 'Professional RPAS Operations',
    website: '',
    email: '',
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
    // Professional date formatting
    const now = new Date()
    this.generatedDate = now.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    this.generatedTimestamp = now.toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
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
    if (this.clientBranding?.logo || this.clientBranding?.name || this.clientName) {
      this.setFillColor('light')
      this.doc.roundedRect(this.margin, 95, this.contentWidth, 35, 3, 3, 'F')
      
      this.setColor('textLight')
      this.doc.setFontSize(8)
      this.doc.text('PREPARED FOR', this.margin + 10, 103)
      
      this.setColor('text')
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(this.clientName || this.clientBranding?.name || 'Client', this.margin + 10, 116)
      
      if (this.clientBranding?.logo) {
        try {
          this.doc.addImage(this.clientBranding.logo, 'PNG', this.pageWidth - this.margin - 45, 100, 35, 25)
        } catch (e) { logger.warn('Client logo error:', e) }
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

  // FIX #4: Enhanced header with operator logo
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
    
    // FIX #4: Add operator logo to header if available
    if (this.branding.operator.logo) {
      try {
        // Logo in top right corner of header
        const logoHeight = 10
        const logoWidth = 25
        const logoX = this.pageWidth - this.margin - logoWidth
        const logoY = 2.5
        this.doc.addImage(this.branding.operator.logo, 'PNG', logoX, logoY, logoWidth, logoHeight)
      } catch (e) {
        // Fallback to text if logo fails
        logger.warn('Header logo error:', e)
        const rightText = this.branding.operator.name.split(' ')[0] || ''
        const rightWidth = this.doc.getTextWidth(rightText)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(rightText, this.pageWidth - this.margin - rightWidth, 10)
      }
    } else {
      // No logo - use text
      const rightText = this.branding.operator.name.split(' ')[0] || ''
      const rightWidth = this.doc.getTextWidth(rightText)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(rightText, this.pageWidth - this.margin - rightWidth, 10)
    }
    
    this.currentY = 25
    return this
  }

  // FIX #5: Enhanced footer with client logo
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
    
    // FIX #5: Add client logo to footer if available
    if (this.clientBranding?.logo) {
      try {
        // Client logo in bottom right, slightly smaller than header logo
        const logoHeight = 8
        const logoWidth = 20
        const logoX = this.pageWidth - this.margin - logoWidth
        const logoY = footerY - 12
        this.doc.addImage(this.clientBranding.logo, 'PNG', logoX, logoY, logoWidth, logoHeight)
        
        // Move page number to left of logo
        this.doc.text(pageText, logoX - pageWidth - 5, footerY)
      } catch (e) {
        logger.warn('Footer client logo error:', e)
        this.doc.text(pageText, this.pageWidth - this.margin - pageWidth, footerY)
      }
    } else {
      this.doc.text(pageText, this.pageWidth - this.margin - pageWidth, footerY)
    }
    
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
    
    const lines = this.doc.splitTextToSize(text, this.contentWidth)
    const lineHeight = (options.fontSize || 9) * 0.4
    
    lines.forEach(line => {
      this.checkNewPage(lineHeight + 2)
      this.doc.text(line, this.margin, this.currentY)
      this.currentY += lineHeight
    })
    
    this.currentY += 4
    return this
  }

  addSpacer(height = 5) {
    this.currentY += height
    return this
  }

  addLabelValue(label, value) {
    if (!value) return this
    this.checkNewPage(8)
    
    this.setColor('textLight')
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(label + ':', this.margin, this.currentY)
    
    this.setColor('text')
    this.doc.setFont('helvetica', 'normal')
    const labelWidth = this.doc.getTextWidth(label + ': ')
    this.doc.text(String(value), this.margin + labelWidth, this.currentY)
    
    this.currentY += 6
    return this
  }

  addKeyValuePairs(pairs = []) {
    pairs.forEach(([label, value]) => {
      this.addLabelValue(label, value)
    })
    return this
  }

  addKeyValueGrid(items = [], columns = 2) {
    this.checkNewPage(20)
    const colWidth = this.contentWidth / columns
    
    items.forEach((item, i) => {
      const col = i % columns
      const x = this.margin + (col * colWidth)
      
      if (col === 0 && i > 0) this.currentY += 8
      
      this.setColor('textLight')
      this.doc.setFontSize(7)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text((item.label || '').toUpperCase(), x, this.currentY)
      
      this.setColor('text')
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(String(item.value || 'N/A'), x, this.currentY + 4)
    })
    
    this.currentY += 15
    return this
  }

  addTable(headers = [], rows = [], options = {}) {
    if (rows.length === 0) return this
    this.checkNewPage(30)
    
    const colors = this.branding.operator.colors
    const primaryRgb = this.hexToRgb(colors.primary)
    
    this.doc.autoTable({
      startY: this.currentY,
      head: [headers],
      body: rows,
      margin: { left: this.margin, right: this.margin },
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      ...options
    })
    
    this.currentY = this.doc.lastAutoTable.finalY + 10
    return this
  }

  addInfoBox(title, content, type = 'info') {
    this.checkNewPage(25)
    
    const colors = { info: '#e0f2fe', warning: '#fef3c7', success: '#d1fae5', danger: '#fee2e2' }
    const borderColors = { info: '#0ea5e9', warning: '#f59e0b', success: '#10b981', danger: '#ef4444' }
    
    this.setFillColor(colors[type] || colors.info)
    this.doc.roundedRect(this.margin, this.currentY, this.contentWidth, 20, 2, 2, 'F')
    
    this.setDrawColor(borderColors[type] || borderColors.info)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY, this.margin, this.currentY + 20)
    
    this.setColor('text')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin + 5, this.currentY + 7)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(8)
    const lines = this.doc.splitTextToSize(content, this.contentWidth - 10)
    this.doc.text(lines[0] || '', this.margin + 5, this.currentY + 14)
    
    this.currentY += 28
    return this
  }

  addKPIRow(kpis = []) {
    this.checkNewPage(30)
    const kpiWidth = this.contentWidth / kpis.length
    
    this.setFillColor('light')
    this.doc.roundedRect(this.margin, this.currentY, this.contentWidth, 25, 2, 2, 'F')
    
    kpis.forEach((kpi, i) => {
      const x = this.margin + (i * kpiWidth) + (kpiWidth / 2)
      
      this.setColor('text')
      this.doc.setFontSize(14)
      this.doc.setFont('helvetica', 'bold')
      const valueText = String(kpi.value)
      const valueWidth = this.doc.getTextWidth(valueText)
      this.doc.text(valueText, x - valueWidth / 2, this.currentY + 12)
      
      this.setColor('textLight')
      this.doc.setFontSize(7)
      this.doc.setFont('helvetica', 'normal')
      const labelWidth = this.doc.getTextWidth(kpi.label)
      this.doc.text(kpi.label.toUpperCase(), x - labelWidth / 2, this.currentY + 20)
    })
    
    this.currentY += 32
    return this
  }

  /**
   * Add a map image to the PDF
   * @param {string} imageDataUrl - Base64 data URL of the map image
   * @param {Object} options - Display options
   */
  addMapImage(imageDataUrl, options = {}) {
    if (!imageDataUrl) return this

    const {
      caption = 'Site Location Map',
      width = this.contentWidth,
      height = 80, // Default height in mm
      centered = true
    } = options

    this.checkNewPage(height + 20)

    // Calculate x position for centering
    const imgWidth = Math.min(width, this.contentWidth)
    const x = centered ? this.margin + (this.contentWidth - imgWidth) / 2 : this.margin

    // Add subtle border/frame
    this.setDrawColor('#e5e7eb')
    this.doc.setLineWidth(0.5)
    this.doc.roundedRect(x - 1, this.currentY - 1, imgWidth + 2, height + 2, 2, 2, 'S')

    try {
      // Add the image
      this.doc.addImage(
        imageDataUrl,
        'PNG',
        x,
        this.currentY,
        imgWidth,
        height
      )
    } catch (e) {
      logger.warn('Failed to add map image to PDF:', e)
      // Add placeholder if image fails
      this.setFillColor('#f3f4f6')
      this.doc.roundedRect(x, this.currentY, imgWidth, height, 2, 2, 'F')
      this.setColor('textLight')
      this.doc.setFontSize(10)
      this.doc.text('Map image unavailable', x + imgWidth / 2 - 20, this.currentY + height / 2)
    }

    this.currentY += height + 5

    // Add caption
    if (caption) {
      this.setColor('textLight')
      this.doc.setFontSize(8)
      this.doc.setFont('helvetica', 'italic')
      const captionWidth = this.doc.getTextWidth(caption)
      const captionX = centered ? this.margin + (this.contentWidth - captionWidth) / 2 : this.margin
      this.doc.text(caption, captionX, this.currentY)
      this.currentY += 8
    }

    return this
  }

  /**
   * Add a site map section with map image
   * @param {Object} site - Site data
   * @param {string} mapImageDataUrl - Pre-fetched map image data URL
   * @param {Object} options - Display options
   */
  addSiteMapSection(site, mapImageDataUrl, options = {}) {
    const siteName = site?.name || 'Site'

    this.addSubsectionTitle(`${siteName} - Location Map`)

    if (mapImageDataUrl) {
      this.addMapImage(mapImageDataUrl, {
        caption: `${siteName} operational area and key positions`,
        ...options
      })
    } else {
      this.setColor('textLight')
      this.doc.setFontSize(9)
      this.doc.text('Map image not available for this site.', this.margin, this.currentY)
      this.currentY += 10
    }

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

  /**
   * Add an AI-enhanced section with professional prose
   * Combines enhanced narrative with optional data table
   * @param {string} title - Section title
   * @param {string} enhancedText - AI-generated prose content
   * @param {object} options - Optional configuration
   */
  addEnhancedSection(title, enhancedText, options = {}) {
    if (!enhancedText) return this

    const { dataTable, showBadge = true } = options

    // Add the section title if provided
    if (title) {
      if (options.isSubsection) {
        this.addSubsectionTitle(title)
      } else {
        this.addSectionTitle(title)
      }
    }

    // Add AI-enhanced badge if enabled
    if (showBadge) {
      this.setFillColor('#f3e8ff') // Light purple background
      this.doc.roundedRect(this.margin, this.currentY - 2, this.contentWidth, 6, 1, 1, 'F')
      this.setColor('#7c3aed') // Purple text
      this.doc.setFontSize(6)
      this.doc.setFont('helvetica', 'italic')
      this.doc.text('AI-Enhanced Content', this.margin + 2, this.currentY + 2)
      this.currentY += 8
    }

    // Add the enhanced prose content
    this.addParagraph(enhancedText, { fontSize: 9 })

    // Add optional data table below the prose
    if (dataTable && dataTable.headers && dataTable.rows?.length > 0) {
      this.addSpacer(5)
      this.addTable(dataTable.headers, dataTable.rows, dataTable.options || {})
    }

    return this
  }

  /**
   * Add enhanced prose paragraph with visual distinction
   * @param {string} text - Enhanced text content
   * @param {object} options - Display options
   */
  addEnhancedParagraph(text, options = {}) {
    if (!text) return this

    // Subtle left border to indicate enhanced content
    this.setDrawColor('#a78bfa') // Purple border
    this.doc.setLineWidth(0.8)
    const startY = this.currentY

    // Add the paragraph text
    this.addParagraph(text, { fontSize: 9, ...options })

    // Draw the accent border on the left
    this.doc.line(this.margin - 3, startY, this.margin - 3, this.currentY - 4)

    return this
  }

  /**
   * Add an enhanced info callout box
   * @param {string} title - Box title
   * @param {string} content - AI-enhanced content
   */
  addEnhancedInfoBox(title, content) {
    if (!content) return this

    this.checkNewPage(35)

    // Purple-themed info box for enhanced content
    this.setFillColor('#faf5ff') // Very light purple
    this.doc.roundedRect(this.margin, this.currentY, this.contentWidth, 25, 2, 2, 'F')

    this.setDrawColor('#a78bfa') // Purple border
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.currentY, this.margin, this.currentY + 25)

    // Title
    this.setColor('#6d28d9')
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin + 5, this.currentY + 7)

    // Content
    this.setColor('#374151')
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(8)
    const lines = this.doc.splitTextToSize(content, this.contentWidth - 10)
    this.doc.text(lines.slice(0, 2).join(' '), this.margin + 5, this.currentY + 15)

    this.currentY += 32
    return this
  }

  finalize() {
    if (this.tocEntries.length > 0) this.fillTableOfContents()
    const totalPages = this.doc.internal.getNumberOfPages()
    for (let i = 2; i <= totalPages; i++) {
      this.doc.setPage(i)
      this.addFooter(i - 1, totalPages - 1)
    }
    this.doc.setProperties({ title: this.title, subject: this.subtitle, author: this.branding.operator.name, creator: 'Muster' })
    return this
  }

  save(filename) { this.finalize(); this.doc.save(filename); return filename }
  getBlob() { this.finalize(); return this.doc.output('blob') }
  getDataUrl() { this.finalize(); return this.doc.output('dataurlstring') }
}

// FIX #7: Fixed clientName field reference (project?.clientName instead of project?.client)
export async function generateOperationsPlanPDF(project, branding = null, clientBranding = null, enhancedContent = null, mapImages = null) {
  // Normalize data access - handle both single-site (project.siteSurvey) and multi-site (project.sites[0].siteSurvey) structures
  const sites = project?.sites || []
  const primarySite = sites[0] || {}
  const siteSurvey = project?.siteSurvey || primarySite?.siteSurvey || {}
  const flightPlan = project?.flightPlan || primarySite?.flightPlan || {}
  const hseRisk = project?.hseRiskAssessment || project?.hseRisk || primarySite?.hseRiskAssessment || {}
  const emergency = project?.emergencyPlan || project?.emergency || primarySite?.emergency || {}
  const mapData = primarySite?.mapData || {}

  const pdf = new BrandedPDF({
    title: 'RPAS Operations Plan',
    subtitle: project?.name || 'Operations Plan',
    projectName: project?.name || '',
    projectCode: project?.projectCode || '',
    clientName: project?.clientName || '', // FIX #7
    branding,
    clientBranding
  })

  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()

  pdf.addNewSection('Executive Summary')

  // Use enhanced executive summary if available, otherwise use default
  if (enhancedContent?.executiveSummary) {
    pdf.addEnhancedParagraph(enhancedContent.executiveSummary)
  } else {
    pdf.addParagraph(`This RPAS Operations Plan details the planned flight operations for ${project?.name || 'this project'}. It includes site assessment, flight parameters, risk mitigations, and emergency procedures.`)
  }
  
  if (project?.overview?.description || project?.description) {
    pdf.addSubsectionTitle('Project Description')
    pdf.addParagraph(project?.overview?.description || project?.description)
  }
  
  // Get location from various possible places
  const locationDesc = project?.overview?.location ||
    siteSurvey?.location?.description ||
    siteSurvey?.location?.name ||
    mapData?.siteSurvey?.siteLocation?.properties?.address ||
    primarySite?.name ||
    'Not specified'

  pdf.addKeyValueGrid([
    { label: 'Project Code', value: project?.projectCode },
    { label: 'Client', value: project?.clientName }, // FIX #7
    { label: 'Location', value: locationDesc },
    { label: 'Status', value: project?.status }
  ])

  // Site Survey Section
  const hasSiteSurveyData = siteSurvey?.location || mapData?.siteSurvey?.siteLocation || mapData?.siteSurvey?.obstacles?.length > 0
  if (hasSiteSurveyData) {
    pdf.addNewSection('Site Survey')

    // Location details - check multiple sources
    const siteLocationCoords = mapData?.siteSurvey?.siteLocation?.geometry?.coordinates
    const locationCoords = siteSurvey?.location?.lat && siteSurvey?.location?.lng
      ? `${siteSurvey.location.lat.toFixed(5)}, ${siteSurvey.location.lng.toFixed(5)}`
      : siteLocationCoords
        ? `${siteLocationCoords[1]?.toFixed(5)}, ${siteLocationCoords[0]?.toFixed(5)}`
        : 'Not set'

    pdf.addSubsectionTitle('Location Details')
    pdf.addKeyValueGrid([
      { label: 'Coordinates', value: locationCoords },
      { label: 'Address', value: siteSurvey?.location?.description || siteSurvey?.location?.address || mapData?.siteSurvey?.siteLocation?.properties?.address || 'Not specified' },
      { label: 'Site Name', value: primarySite?.name || siteSurvey?.location?.name || 'Site 1' },
      { label: 'Access Type', value: siteSurvey?.access?.type || (siteSurvey?.access?.vehicleAccess ? 'Vehicle' : 'Foot access') }
    ])

    // Obstacles from mapData
    const obstacles = mapData?.siteSurvey?.obstacles || siteSurvey?.obstacles || []
    if (obstacles.length > 0) {
      pdf.addSubsectionTitle('Identified Obstacles')
      const obstacleRows = obstacles.map(o => [
        o.properties?.obstacleType || o.type || 'Unknown',
        o.properties?.label || o.description || '',
        o.properties?.height ? `${o.properties.height}m` : (o.height ? `${o.height}m` : 'N/A'),
        o.properties?.distance ? `${o.properties.distance}m` : (o.distance ? `${o.distance}m` : 'N/A')
      ])
      pdf.addTable(['Type', 'Description', 'Height', 'Distance'], obstacleRows)
    }
  }

  // Add site map images
  if (sites.length > 0 && mapImages) {
    pdf.addNewSection('Site Maps')
    pdf.addParagraph('The following maps show the operational areas, flight zones, and key positions for each site.')
    pdf.addSpacer(5)

    for (const site of sites) {
      const mapImage = mapImages[site.id]
      if (mapImage) {
        pdf.addSiteMapSection(site, mapImage)
        pdf.addSpacer(10)
      }
    }
  } else if (sites.length === 0 && mapImages) {
    // Single-site project (legacy structure)
    const singleSiteMap = Object.values(mapImages)[0]
    if (singleSiteMap) {
      pdf.addNewSection('Site Map')
      pdf.addMapImage(singleSiteMap, {
        caption: 'Operational area showing flight zone and key positions'
      })
    }
  }
  
  // Flight Plan Section
  const hasFlightPlanData = flightPlan?.operationType || flightPlan?.maxAltitudeAGL || mapData?.flightPlan?.launchPoint
  if (hasFlightPlanData) {
    pdf.addNewSection('Flight Plan')

    pdf.addSubsectionTitle('Flight Parameters')
    pdf.addKeyValueGrid([
      { label: 'Aircraft', value: flightPlan.aircraft?.[0]?.nickname || flightPlan.aircraft?.name || project?.aircraft?.[0]?.nickname || 'Not specified' },
      { label: 'Operation Type', value: flightPlan.operationType || 'VLOS' },
      { label: 'Max Altitude', value: flightPlan.maxAltitudeAGL ? `${flightPlan.maxAltitudeAGL}m AGL` : 'Not specified' },
      { label: 'Speed', value: flightPlan.speed ? `${flightPlan.speed} m/s` : 'Not specified' }
    ])

    // Flight positions from mapData
    const fpMapData = mapData?.flightPlan || {}
    const hasPositions = fpMapData.launchPoint || fpMapData.recoveryPoint || fpMapData.pilotPosition

    if (hasPositions) {
      pdf.addSubsectionTitle('Flight Positions')
      const positions = []

      if (fpMapData.launchPoint?.geometry?.coordinates) {
        const [lng, lat] = fpMapData.launchPoint.geometry.coordinates
        positions.push(['Launch Point', `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`])
      }
      if (fpMapData.recoveryPoint?.geometry?.coordinates) {
        const [lng, lat] = fpMapData.recoveryPoint.geometry.coordinates
        positions.push(['Recovery Point', `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`])
      }
      if (fpMapData.pilotPosition?.geometry?.coordinates) {
        const [lng, lat] = fpMapData.pilotPosition.geometry.coordinates
        positions.push(['Pilot Position', `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`])
      }

      if (positions.length > 0) {
        pdf.addTable(['Position', 'Coordinates'], positions)
      }
    }

    // Flight geography info
    if (fpMapData.flightGeography?.geometry) {
      pdf.addSpacer(5)
      const coords = fpMapData.flightGeography.geometry.coordinates?.[0] || []
      pdf.addParagraph(`Flight Geography: ${coords.length - 1} vertex polygon defined`, { bold: true })
    }
  }
  
  // HSE Risk Assessment Section
  if (hseRisk?.hazards?.length > 0) {
    pdf.addNewSection('HSE Risk Assessment')

    // Add enhanced risk narrative if available
    if (enhancedContent?.riskNarrative) {
      pdf.addEnhancedParagraph(enhancedContent.riskNarrative)
      pdf.addSpacer(5)
    }

    pdf.addSubsectionTitle('Identified Hazards')
    const hazardRows = hseRisk.hazards.map(h => [
      h.category || 'General',
      h.description || '',
      h.riskLevel?.toUpperCase() || `${h.likelihood || '?'}x${h.severity || '?'}`,
      h.residualRisk?.toUpperCase() || `${h.residualLikelihood || '?'}x${h.residualSeverity || '?'}`
    ])
    pdf.addTable(['Category', 'Hazard', 'Initial Risk', 'Residual Risk'], hazardRows)
  }

  // Emergency Procedures Section
  const emergencyMapData = mapData?.emergency || {}
  const hasEmergencyData = emergency?.contacts?.length > 0 ||
    emergency?.primaryEmergencyContact ||
    emergencyMapData?.musterPoints?.length > 0

  if (hasEmergencyData) {
    pdf.addNewSection('Emergency Procedures')

    // Add enhanced emergency procedures narrative if available
    if (enhancedContent?.emergencyProcedures) {
      pdf.addEnhancedParagraph(enhancedContent.emergencyProcedures)
      pdf.addSpacer(5)
    }

    // Muster points from map data
    const musterPoints = emergencyMapData?.musterPoints || []
    if (musterPoints.length > 0) {
      pdf.addSubsectionTitle('Muster Points')
      const musterRows = musterPoints.map(mp => {
        const coords = mp.geometry?.coordinates || []
        return [
          mp.properties?.label || 'Muster Point',
          mp.properties?.isPrimary ? 'Primary' : 'Secondary',
          coords.length >= 2 ? `${coords[1]?.toFixed(5)}°, ${coords[0]?.toFixed(5)}°` : 'N/A'
        ]
      })
      pdf.addTable(['Name', 'Type', 'Coordinates'], musterRows)
    }

    // Emergency contacts
    if (emergency?.primaryEmergencyContact || emergency?.musterPoint) {
      pdf.addSubsectionTitle('Emergency Information')
      pdf.addLabelValue('Primary Muster Point', emergency.musterPoint || emergency.rallyPoint)
      pdf.addLabelValue('Emergency Contact', emergency.primaryEmergencyContact?.name)
      pdf.addLabelValue('Contact Phone', emergency.primaryEmergencyContact?.phone)
      pdf.addLabelValue('Nearest Hospital', emergency.nearestHospital)
    }

    if (emergency?.contacts?.length > 0) {
      pdf.addSubsectionTitle('Emergency Contacts')
      const contactRows = emergency.contacts.map(c => [c.name || '', c.role || '', c.phone || ''])
      pdf.addTable(['Name', 'Role', 'Phone'], contactRows)
    }

    // Evacuation routes from map data
    const evacRoutes = emergencyMapData?.evacuationRoutes || []
    if (evacRoutes.length > 0) {
      pdf.addSubsectionTitle('Evacuation Routes')
      pdf.addParagraph(`${evacRoutes.length} evacuation route(s) defined on site map.`)
    }
  }
  
  if (project?.crew?.length > 0) {
    pdf.addNewSection('Crew Roster')
    const crewRows = project.crew.map(m => [
      m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
      m.role || '',
      m.certifications?.join?.(', ') || m.certifications || 'N/A'
    ])
    pdf.addTable(['Name', 'Role', 'Certifications'], crewRows)
  }

  // Add enhanced recommendations if available
  if (enhancedContent?.recommendations) {
    pdf.addNewSection('Recommendations')
    if (Array.isArray(enhancedContent.recommendations)) {
      enhancedContent.recommendations.forEach((rec, i) => {
        pdf.addParagraph(`${i + 1}. ${rec}`, { fontSize: 9 })
      })
    } else {
      pdf.addEnhancedParagraph(enhancedContent.recommendations)
    }
  }

  pdf.addNewSection('Approvals')

  // Add enhanced closing statement if available
  if (enhancedContent?.closingStatement) {
    pdf.addEnhancedParagraph(enhancedContent.closingStatement)
    pdf.addSpacer(10)
  }

  pdf.addSignatureBlock([
    { role: 'Pilot in Command (PIC)', name: '' },
    { role: 'Operations Manager', name: '' },
    { role: 'Client Representative', name: '' }
  ])

  return pdf
}

// FIX #7: Fixed clientName field reference
export async function generateSORAPDF(project, calculations, branding = null, enhancedContent = null, mapImages = null) {
  const pdf = new BrandedPDF({
    title: 'SORA Risk Assessment',
    subtitle: 'JARUS SORA 2.5 Methodology',
    projectName: project?.name || '',
    projectCode: project?.projectCode || '',
    clientName: project?.clientName || '', // FIX #7
    branding
  })

  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()

  pdf.addNewSection('Assessment Summary')

  // Use enhanced executive summary if available
  if (enhancedContent?.executiveSummary) {
    pdf.addEnhancedParagraph(enhancedContent.executiveSummary)
    pdf.addSpacer(5)
  }

  pdf.addInfoBox('SAIL Level Determination', `Based on the assessment, this operation has been assigned SAIL Level ${calculations?.sailLevel || calculations?.sail || 'N/A'}`, 'info')
  pdf.addKPIRow([
    { label: 'Initial GRC', value: calculations?.initialGRC || calculations?.intrinsicGRC || 'N/A' },
    { label: 'Final GRC', value: calculations?.finalGRC || 'N/A' },
    { label: 'Air Risk Class', value: calculations?.airRiskClass || calculations?.residualARC || 'N/A' },
    { label: 'SAIL Level', value: calculations?.sailLevel || calculations?.sail || 'N/A' }
  ])

  pdf.addNewSection('Ground Risk Assessment')
  pdf.addSubsectionTitle('Intrinsic Ground Risk Class (iGRC)')

  // Use enhanced risk narrative if available
  if (enhancedContent?.riskNarrative) {
    pdf.addEnhancedParagraph(enhancedContent.riskNarrative)
  } else {
    pdf.addParagraph('The initial ground risk is determined by the characteristic UA dimension and the population density of the operational area.')
  }

  pdf.addNewSection('Ground Risk Mitigations')

  // Use enhanced mitigations summary if available
  if (enhancedContent?.mitigationsSummary) {
    pdf.addEnhancedParagraph(enhancedContent.mitigationsSummary)
  } else {
    pdf.addParagraph('Ground risk mitigations reduce the final GRC based on operational measures.')
  }

  pdf.addNewSection('Air Risk Assessment')
  pdf.addSubsectionTitle('Air Risk Class (ARC)')
  pdf.addParagraph('The air risk class is determined by the airspace classification and the type of operation.')

  // Add OSO narrative if available
  if (enhancedContent?.osoNarrative) {
    pdf.addNewSection('Operational Safety Objectives')
    pdf.addEnhancedParagraph(enhancedContent.osoNarrative)
  }

  // Add site map images for operational area visualization
  const sites = project?.sites || []
  if (sites.length > 0 && mapImages) {
    pdf.addNewSection('Operational Area Maps')
    pdf.addParagraph('The following maps illustrate the operational areas assessed in this SORA evaluation, including ground risk buffer zones and flight geography.')
    pdf.addSpacer(5)

    for (const site of sites) {
      const mapImage = mapImages[site.id]
      if (mapImage) {
        pdf.addSiteMapSection(site, mapImage)
        pdf.addSpacer(10)
      }
    }
  }

  pdf.addNewSection('Assessment Approval')
  pdf.addSignatureBlock([{ role: 'Assessor' }, { role: 'Reviewer' }])

  return pdf
}

// FIX #7: Fixed clientName field reference
export async function generateHSERiskPDF(project, branding = null, enhancedContent = null, mapImages = null) {
  const pdf = new BrandedPDF({
    title: 'HSE Risk Assessment',
    subtitle: 'Workplace Hazard Analysis',
    projectName: project?.name || '',
    projectCode: project?.projectCode || '',
    clientName: project?.clientName || '', // FIX #7
    branding
  })

  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()

  const risk = project?.hseRiskAssessment || project?.hseRisk || {}

  pdf.addNewSection('Assessment Summary')

  // Use enhanced executive summary if available
  if (enhancedContent?.executiveSummary) {
    pdf.addEnhancedParagraph(enhancedContent.executiveSummary)
    pdf.addSpacer(5)
  }

  const hazards = risk.hazards || []
  // Risk thresholds: Low (1-4), Medium (5-9), High (10-16), Critical (17-25)
  const criticalRisks = hazards.filter(h => h.riskLevel === 'critical' || (h.likelihood * h.severity >= 17)).length
  const highRisks = hazards.filter(h => h.riskLevel === 'high' || (h.likelihood * h.severity >= 10 && h.likelihood * h.severity <= 16)).length
  const mediumRisks = hazards.filter(h => h.riskLevel === 'medium' || (h.likelihood * h.severity >= 5 && h.likelihood * h.severity <= 9)).length
  const lowRisks = hazards.filter(h => h.riskLevel === 'low' || (h.likelihood * h.severity <= 4)).length

  pdf.addKPIRow([
    { label: 'Total Hazards', value: hazards.length || 0 },
    { label: 'Critical/High', value: criticalRisks + highRisks },
    { label: 'Medium Risk', value: mediumRisks },
    { label: 'Low Risk', value: lowRisks }
  ])

  pdf.addNewSection('Hazard Register')
  if (hazards.length > 0) {
    hazards.forEach((hazard, index) => {
      pdf.checkNewPage(40)
      pdf.addSubsectionTitle(`${index + 1}. ${hazard.description || 'Hazard'}`)

      // Use enhanced hazard description if available
      const enhancedHazardDesc = enhancedContent?.hazardDescriptions?.[hazard.id || index]
      if (enhancedHazardDesc) {
        pdf.addEnhancedParagraph(enhancedHazardDesc)
        pdf.addSpacer(3)
      }

      pdf.addKeyValueGrid([
        { label: 'Category', value: hazard.category },
        { label: 'Initial Risk', value: hazard.riskLevel?.toUpperCase() || `L${hazard.likelihood} x S${hazard.severity}` },
        { label: 'Residual Risk', value: hazard.residualRisk?.toUpperCase() || `L${hazard.residualLikelihood} x S${hazard.residualSeverity}` }
      ])
      if (hazard.controls) {
        const controlsText = Array.isArray(hazard.controls) ? hazard.controls.join('; ') : hazard.controls
        pdf.addParagraph('Controls: ' + controlsText, { fontSize: 8 })
      }
      pdf.addSpacer(5)
    })
  } else {
    pdf.addParagraph('No hazards identified.')
  }

  // Add enhanced recommendations if available
  if (enhancedContent?.recommendations) {
    pdf.addNewSection('Recommendations')
    if (Array.isArray(enhancedContent.recommendations)) {
      enhancedContent.recommendations.forEach((rec, i) => {
        pdf.addParagraph(`${i + 1}. ${rec}`, { fontSize: 9 })
      })
    } else {
      pdf.addEnhancedParagraph(enhancedContent.recommendations)
    }
  }

  // Add site map images showing hazard locations
  const sites = project?.sites || []
  if (sites.length > 0 && mapImages) {
    pdf.addNewSection('Site Overview Maps')
    pdf.addParagraph('The following maps provide visual context for the operational sites and identified hazard locations.')
    pdf.addSpacer(5)

    for (const site of sites) {
      const mapImage = mapImages[site.id]
      if (mapImage) {
        pdf.addSiteMapSection(site, mapImage)
        pdf.addSpacer(10)
      }
    }
  }

  pdf.addNewSection('Approvals')
  pdf.addSignatureBlock([{ role: 'Assessor' }, { role: 'Reviewer' }])

  return pdf
}

// FIX #7: Fixed clientName field reference
export async function generateFormPDF(form, formTemplate, project, operators = [], branding = null, clientBranding = null) {
  const pdf = new BrandedPDF({
    title: formTemplate?.name || 'Form',
    subtitle: form.data?.header?.form_id || form.id,
    projectName: project?.name || '',
    projectCode: project?.projectCode || '',
    clientName: project?.clientName || '', // FIX #7
    branding,
    clientBranding
  })
  
  await pdf.init()
  pdf.addCoverPage()
  pdf.addNewPage()
  
  pdf.addSectionTitle('Form Information')
  pdf.addKeyValuePairs([
    ['Form Type', formTemplate?.name],
    ['Form ID', form.data?.header?.form_id || form.id],
    ['Status', form.status === 'completed' ? 'Completed' : 'Draft'],
    ['Created', form.createdAt ? new Date(form.createdAt.toDate ? form.createdAt.toDate() : form.createdAt).toLocaleString() : 'N/A'],
    ['Completed', form.completedAt ? new Date(form.completedAt.toDate ? form.completedAt.toDate() : form.completedAt).toLocaleString() : 'Not completed']
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
  const { branding, calculations, clientBranding, enhancedContent, includeMapImages = true } = options
  let pdf

  // Fetch map images for all sites if enabled
  let mapImages = null
  if (includeMapImages) {
    try {
      mapImages = await getProjectMapImages(project, {
        width: 800,
        height: 500,
        style: 'satelliteStreets'
      })
    } catch (e) {
      logger.warn('Failed to fetch map images for PDF:', e)
    }
  }

  switch (type) {
    case 'operations-plan':
      pdf = await generateOperationsPlanPDF(project, branding, clientBranding, enhancedContent, mapImages)
      break
    case 'sora':
      pdf = await generateSORAPDF(project, calculations, branding, enhancedContent, mapImages)
      break
    case 'hse-risk':
      pdf = await generateHSERiskPDF(project, branding, enhancedContent, mapImages)
      break
    default:
      throw new Error(`Unknown export type: ${type}`)
  }

  const filename = `${type}_${project?.projectCode || project?.name || 'export'}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
  return filename
}

export async function exportFormToPDF(form, formTemplate, project, operators = [], branding = null, clientBranding = null) {
  const pdf = await generateFormPDF(form, formTemplate, project, operators, branding, clientBranding)
  const formType = formTemplate?.id || 'form'
  const formId = form.data?.header?.form_id || form.id
  const filename = `${formType}_${formId}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
  return filename
}

/**
 * Generate a compact Flight Plan Brief PDF for notification attachment
 * Single page with map, parameters, and GO/NO-GO status
 */
export async function generateFlightPlanBriefPDF(site, options = {}) {
  const {
    projectName = '',
    projectCode = '',
    clientName = '',
    operatorName = '',
    operatorContact = '',
    status = 'GO',           // 'GO' or 'NO-GO'
    statusNotes = '',
    startTime = '',
    endTime = '',
    date = new Date().toISOString().split('T')[0],
    mapImage = null,         // Base64 data URL
    branding = null
  } = options

  const flightPlan = site?.flightPlan || {}
  const siteSurvey = site?.siteSurvey || site?.mapData?.siteSurvey || {}

  const pdf = new BrandedPDF({
    title: 'FLIGHT PLAN BRIEF',
    subtitle: status === 'GO' ? 'FLIGHT AUTHORIZED' : 'FLIGHT NOT AUTHORIZED',
    projectName,
    projectCode,
    clientName,
    branding
  })

  await pdf.init()

  // Compact header (no cover page for single-page brief)
  pdf.addNewPage()

  // Status banner at top
  pdf.addInfoBox(
    status === 'GO' ? 'GO - FLIGHT AUTHORIZED' : 'NO-GO - FLIGHT NOT AUTHORIZED',
    status === 'GO'
      ? 'All parameters within operational limits'
      : statusNotes || 'Operations suspended',
    status === 'GO' ? 'success' : 'danger'
  )
  pdf.addSpacer(5)

  // Key parameters grid
  pdf.addKeyValueGrid([
    { label: 'Site', value: site?.name || 'Unnamed Site' },
    { label: 'Date', value: date },
    { label: 'Time Window', value: startTime && endTime ? `${startTime} - ${endTime}` : 'TBD' },
    { label: 'Max Altitude', value: flightPlan.maxAltitudeAGL ? `${flightPlan.maxAltitudeAGL}m AGL` : 'See plan' },
    { label: 'Operation Type', value: flightPlan.operationType || 'VLOS' },
    { label: 'Aircraft', value: flightPlan.aircraft?.[0]?.nickname || 'See plan' }
  ], 2)

  // Map section
  if (mapImage) {
    pdf.addSpacer(5)
    pdf.addSubsectionTitle('Operational Area')
    pdf.addMapImage(mapImage, {
      caption: `${site?.name || 'Site'} - Flight area, launch/recovery points`,
      height: 70
    })
  }

  // Operator contact
  pdf.addSpacer(5)
  pdf.addSubsectionTitle('Operator Contact')
  pdf.addParagraph(`${operatorName || 'Operator'} | ${operatorContact || 'Contact on file'}`)

  // Footer note
  pdf.addSpacer(10)
  pdf.setColor('textLight')
  pdf.doc.setFontSize(8)
  pdf.doc.text(
    `Generated: ${new Date().toLocaleString()} | For flight coordination only`,
    pdf.margin,
    pdf.currentY
  )

  return pdf
}

export default {
  BrandedPDF,
  generateOperationsPlanPDF,
  generateSORAPDF,
  generateHSERiskPDF,
  generateFormPDF,
  exportToPDF,
  exportFormToPDF,
  generateFlightPlanBriefPDF
}
