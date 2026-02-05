/**
 * Document Export Service
 * Export generated documents to PDF, DOCX, and Markdown formats
 * with client branding and cross-reference appendix
 *
 * @location src/lib/documentExportService.js
 */

import { logger } from './logger'

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

// Default colors if branding not provided
const DEFAULT_COLORS = {
  primary: '#1e3a5f',
  secondary: '#2563eb',
  accent: '#3b82f6',
  text: '#1f2937',
  textLight: '#6b7280'
}

/**
 * Export document to PDF format
 */
export async function exportToPDF(document, project, options = {}) {
  const jsPDF = await loadJsPDF()

  const colors = {
    ...DEFAULT_COLORS,
    ...(project?.branding?.colors || {})
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  })

  const pageWidth = 215.9
  const pageHeight = 279.4
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let currentY = margin
  let pageNumber = 1

  // Helper to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  // Helper to check page break
  const checkPageBreak = (neededSpace) => {
    if (currentY + neededSpace > pageHeight - margin - 15) {
      addFooter()
      doc.addPage()
      pageNumber++
      currentY = margin
      addHeader()
      return true
    }
    return false
  }

  // Add header with branding
  const addHeader = () => {
    const primaryRgb = hexToRgb(colors.primary)

    // Header line
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.setLineWidth(0.5)
    doc.line(margin, 12, pageWidth - margin, 12)

    // Document title in header
    doc.setFontSize(8)
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.text(document.title || 'Document', margin, 10)

    // Client name on right
    if (project?.clientName) {
      doc.text(project.clientName, pageWidth - margin, 10, { align: 'right' })
    }
  }

  // Add footer
  const addFooter = () => {
    const y = pageHeight - 10

    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)

    // Page number centered
    doc.text(`Page ${pageNumber}`, pageWidth / 2, y, { align: 'center' })

    // Version on left
    doc.text(`Version ${document.version || '1.0'}`, margin, y)

    // Date on right
    const dateStr = new Date().toLocaleDateString('en-CA')
    doc.text(dateStr, pageWidth - margin, y, { align: 'right' })
  }

  // ========== COVER PAGE ==========
  const primaryRgb = hexToRgb(colors.primary)
  const secondaryRgb = hexToRgb(colors.secondary)

  // Cover background strip
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
  doc.rect(0, 0, pageWidth, 80, 'F')

  // Logo placeholder (if available)
  if (project?.branding?.logo) {
    try {
      doc.addImage(project.branding.logo, 'PNG', margin, 20, 40, 40)
    } catch (e) {
      logger.warn('Failed to add logo to PDF:', e)
    }
  }

  // Document title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  const titleLines = doc.splitTextToSize(document.title || 'Untitled Document', contentWidth)
  doc.text(titleLines, margin, 100)

  // Document type
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  const typeLabel = document.type?.replace(/_/g, ' ').toUpperCase() || 'DOCUMENT'
  doc.text(typeLabel, margin, 115)

  // Client info
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Prepared for:', margin, 140)

  doc.setFontSize(20)
  doc.text(project?.clientName || project?.branding?.name || 'Client', margin, 152)

  // Project info
  if (project?.name) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Project: ${project.name}`, margin, 165)
  }

  // Version and date info
  doc.setFontSize(10)
  doc.setTextColor(128, 128, 128)
  doc.text(`Version: ${document.version || '1.0'}`, margin, 200)
  doc.text(`Status: ${document.status || 'Draft'}`, margin, 208)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 216)

  // Footer on cover
  doc.setFontSize(8)
  doc.text('Generated with Muster Document Generator', pageWidth / 2, pageHeight - 15, { align: 'center' })

  // ========== TABLE OF CONTENTS ==========
  doc.addPage()
  pageNumber++
  currentY = margin

  addHeader()

  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Table of Contents', margin, currentY + 10)
  currentY += 25

  // List sections
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)

  const sections = document.sections || []
  let tocPage = 3 // Content starts on page 3

  sections.forEach((section, index) => {
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.text(`${index + 1}.`, margin, currentY)

    doc.setTextColor(30, 30, 30)
    doc.text(section.title, margin + 8, currentY)

    // Dotted line to page number
    const titleWidth = doc.getTextWidth(section.title)
    const dotsStart = margin + 10 + titleWidth
    const dotsEnd = pageWidth - margin - 15

    doc.setTextColor(180, 180, 180)
    let dotX = dotsStart
    while (dotX < dotsEnd) {
      doc.text('.', dotX, currentY)
      dotX += 2
    }

    doc.setTextColor(100, 100, 100)
    doc.text(tocPage.toString(), pageWidth - margin, currentY, { align: 'right' })

    currentY += 8
    tocPage++
  })

  // Add cross-references to TOC if present
  if (document.crossReferences?.length > 0) {
    currentY += 5
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.text('Appendix', margin, currentY)

    doc.setTextColor(30, 30, 30)
    doc.text('Cross-References', margin + 20, currentY)
    currentY += 8
  }

  addFooter()

  // ========== CONTENT SECTIONS ==========
  for (const section of sections) {
    doc.addPage()
    pageNumber++
    currentY = margin

    addHeader()

    // Section title
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(section.title, margin, currentY + 10)
    currentY += 20

    // Section content
    if (section.content) {
      doc.setTextColor(30, 30, 30)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')

      // Parse markdown-like content
      const lines = section.content.split('\n')

      for (const line of lines) {
        // Check for page break
        checkPageBreak(8)

        // Handle headers
        if (line.startsWith('### ')) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(12)
          doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b)
          doc.text(line.replace('### ', ''), margin, currentY)
          currentY += 8
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(30, 30, 30)
        } else if (line.startsWith('## ')) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(14)
          doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
          doc.text(line.replace('## ', ''), margin, currentY)
          currentY += 10
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(30, 30, 30)
        } else if (line.startsWith('# ')) {
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(16)
          doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
          doc.text(line.replace('# ', ''), margin, currentY)
          currentY += 12
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(30, 30, 30)
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          // Bullet point
          const bulletText = line.replace(/^[-*]\s/, '')
          const wrappedText = doc.splitTextToSize(bulletText, contentWidth - 10)
          doc.text('•', margin, currentY)
          doc.text(wrappedText, margin + 5, currentY)
          currentY += wrappedText.length * 5
        } else if (line.match(/^\d+\.\s/)) {
          // Numbered list
          const wrappedText = doc.splitTextToSize(line, contentWidth - 10)
          doc.text(wrappedText, margin + 5, currentY)
          currentY += wrappedText.length * 5
        } else if (line.startsWith('> ')) {
          // Block quote
          doc.setFillColor(245, 245, 245)
          const quoteText = line.replace('> ', '')
          const wrappedText = doc.splitTextToSize(quoteText, contentWidth - 15)
          const quoteHeight = wrappedText.length * 5 + 4
          doc.rect(margin, currentY - 3, contentWidth, quoteHeight, 'F')
          doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
          doc.setLineWidth(1)
          doc.line(margin, currentY - 3, margin, currentY - 3 + quoteHeight)
          doc.setTextColor(80, 80, 80)
          doc.text(wrappedText, margin + 5, currentY)
          currentY += quoteHeight + 2
          doc.setTextColor(30, 30, 30)
        } else if (line.trim() === '') {
          currentY += 3
        } else {
          // Regular paragraph
          const wrappedText = doc.splitTextToSize(line, contentWidth)
          doc.text(wrappedText, margin, currentY)
          currentY += wrappedText.length * 5
        }
      }
    } else {
      doc.setTextColor(150, 150, 150)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('No content in this section.', margin, currentY)
      currentY += 10
    }

    addFooter()
  }

  // ========== CROSS-REFERENCES APPENDIX ==========
  if (document.crossReferences?.length > 0) {
    doc.addPage()
    pageNumber++
    currentY = margin

    addHeader()

    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Appendix: Cross-References', margin, currentY + 10)
    currentY += 25

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)

    document.crossReferences.forEach((ref, index) => {
      checkPageBreak(20)

      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}. ${ref.referenceText}`, margin, currentY)
      currentY += 6

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(`Target Document ID: ${ref.targetDocumentId}`, margin + 5, currentY)
      currentY += 5

      if (ref.targetSectionId) {
        doc.text(`Target Section: ${ref.targetSectionId}`, margin + 5, currentY)
        currentY += 5
      }

      doc.setTextColor(30, 30, 30)
      currentY += 5
    })

    addFooter()
  }

  // Save PDF
  const filename = `${document.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'document'}_v${document.version || '1.0'}.pdf`
  doc.save(filename)

  return { success: true, filename }
}

/**
 * Export document to Markdown format
 */
export function exportToMarkdown(document, project, options = {}) {
  let markdown = ''

  // Title and metadata
  markdown += `# ${document.title || 'Untitled Document'}\n\n`
  markdown += `**Type:** ${document.type?.replace(/_/g, ' ') || 'Document'}\n`
  markdown += `**Version:** ${document.version || '1.0'}\n`
  markdown += `**Status:** ${document.status || 'Draft'}\n`
  markdown += `**Client:** ${project?.clientName || 'N/A'}\n`
  markdown += `**Generated:** ${new Date().toLocaleDateString('en-CA')}\n\n`
  markdown += `---\n\n`

  // Table of Contents
  markdown += `## Table of Contents\n\n`
  const sections = document.sections || []
  sections.forEach((section, index) => {
    const anchor = section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    markdown += `${index + 1}. [${section.title}](#${anchor})\n`
  })
  markdown += `\n---\n\n`

  // Sections
  sections.forEach((section, index) => {
    markdown += `## ${index + 1}. ${section.title}\n\n`
    markdown += section.content || '*No content in this section.*'
    markdown += '\n\n---\n\n'
  })

  // Cross-references
  if (document.crossReferences?.length > 0) {
    markdown += `## Appendix: Cross-References\n\n`
    document.crossReferences.forEach((ref, index) => {
      markdown += `${index + 1}. **${ref.referenceText}**\n`
      markdown += `   - Target Document: ${ref.targetDocumentId}\n`
      if (ref.targetSectionId) {
        markdown += `   - Target Section: ${ref.targetSectionId}\n`
      }
      markdown += '\n'
    })
  }

  // Download
  const filename = `${document.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'document'}_v${document.version || '1.0'}.md`
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement ? document.createElement('a') : { click: () => {} }

  // Handle browser environment
  if (typeof window !== 'undefined') {
    const a = window.document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return { success: true, filename, content: markdown }
}

/**
 * Export document to HTML format (for DOCX conversion or preview)
 */
export function exportToHTML(document, project, options = {}) {
  const colors = {
    ...DEFAULT_COLORS,
    ...(project?.branding?.colors || {})
  }

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${document.title || 'Document'}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: ${colors.text};
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 { color: ${colors.primary}; border-bottom: 2px solid ${colors.primary}; padding-bottom: 10px; }
    h2 { color: ${colors.primary}; margin-top: 40px; }
    h3 { color: ${colors.secondary}; }
    .meta { color: ${colors.textLight}; font-size: 0.9em; margin-bottom: 30px; }
    .meta span { margin-right: 20px; }
    .toc { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .toc h2 { margin-top: 0; }
    .toc ul { list-style: none; padding-left: 0; }
    .toc li { padding: 5px 0; }
    .toc a { color: ${colors.secondary}; text-decoration: none; }
    .toc a:hover { text-decoration: underline; }
    .section { margin: 40px 0; padding: 20px 0; border-bottom: 1px solid #eee; }
    blockquote { border-left: 4px solid ${colors.primary}; margin: 20px 0; padding: 10px 20px; background: #f8f9fa; }
    code { background: #f1f3f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; overflow-x: auto; }
    .appendix { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 40px; }
    .cross-ref { padding: 10px 0; border-bottom: 1px solid #eee; }
    .cross-ref:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <h1>${document.title || 'Untitled Document'}</h1>

  <div class="meta">
    <span><strong>Type:</strong> ${document.type?.replace(/_/g, ' ') || 'Document'}</span>
    <span><strong>Version:</strong> ${document.version || '1.0'}</span>
    <span><strong>Status:</strong> ${document.status || 'Draft'}</span>
    <span><strong>Client:</strong> ${project?.clientName || 'N/A'}</span>
  </div>

  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>
      ${(document.sections || []).map((s, i) =>
        `<li><a href="#section-${i + 1}">${i + 1}. ${s.title}</a></li>`
      ).join('\n      ')}
    </ul>
  </div>
`

  // Sections
  const sections = document.sections || []
  sections.forEach((section, index) => {
    html += `
  <div class="section" id="section-${index + 1}">
    <h2>${index + 1}. ${section.title}</h2>
    ${parseMarkdownToHTML(section.content || '<em>No content in this section.</em>')}
  </div>
`
  })

  // Cross-references
  if (document.crossReferences?.length > 0) {
    html += `
  <div class="appendix">
    <h2>Appendix: Cross-References</h2>
    ${document.crossReferences.map((ref, i) => `
    <div class="cross-ref">
      <strong>${i + 1}. ${ref.referenceText}</strong><br>
      <small>Target Document: ${ref.targetDocumentId}</small>
      ${ref.targetSectionId ? `<br><small>Target Section: ${ref.targetSectionId}</small>` : ''}
    </div>
    `).join('')}
  </div>
`
  }

  html += `
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 0.8em; text-align: center;">
    Generated with Muster Document Generator on ${new Date().toLocaleDateString('en-CA')}
  </footer>
</body>
</html>`

  return { success: true, content: html }
}

/**
 * Simple markdown to HTML parser
 */
function parseMarkdownToHTML(markdown) {
  if (!markdown) return ''

  let html = markdown
    // Headers
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Block quotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Lists
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')

  return `<p>${html}</p>`.replace(/<p><\/p>/g, '')
}

/**
 * Download HTML as DOCX-compatible file
 */
export function exportToDocx(document, project, options = {}) {
  const { content } = exportToHTML(document, project, options)

  const filename = `${document.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'document'}_v${document.version || '1.0'}.html`

  if (typeof window !== 'undefined') {
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return { success: true, filename, content }
}

export default {
  exportToPDF,
  exportToMarkdown,
  exportToHTML,
  exportToDocx
}
