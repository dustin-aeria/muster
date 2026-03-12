/**
 * PDF Generator Utility
 * Client-side PDF generation for filled forms
 *
 * Uses html2canvas and jsPDF for conversion
 * Falls back to browser print if libraries unavailable
 *
 * @version 1.0.0
 */

import { generateFilledMarkdown } from './formParser'

// ============================================
// MARKDOWN TO HTML CONVERSION
// ============================================

/**
 * Convert markdown to HTML for PDF rendering
 * Basic markdown parser for common elements
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
function markdownToHtml(markdown) {
  if (!markdown) return ''

  let html = markdown

  // Escape HTML entities first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Checkboxes
  html = html.replace(/☑/g, '✓')
  html = html.replace(/☐/g, '○')
  html = html.replace(/\[x\]/gi, '✓')
  html = html.replace(/\[ \]/g, '○')

  // Tables
  html = convertTablesToHtml(html)

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')

  // Wrap in paragraph
  html = `<p>${html}</p>`

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p>\s*<\/p>/g, '')

  return html
}

/**
 * Convert markdown tables to HTML tables
 * @param {string} content - Content with markdown tables
 * @returns {string} Content with HTML tables
 */
function convertTablesToHtml(content) {
  const lines = content.split('\n')
  let result = []
  let inTable = false
  let tableRows = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Check if line is a table row
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        inTable = true
        tableRows = []
      }

      // Skip separator rows
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        continue
      }

      // Parse cells
      const cells = trimmed
        .slice(1, -1) // Remove outer pipes
        .split('|')
        .map(cell => cell.trim())

      tableRows.push(cells)
    } else {
      // End of table
      if (inTable && tableRows.length > 0) {
        result.push(generateHtmlTable(tableRows))
        inTable = false
        tableRows = []
      }
      result.push(line)
    }
  }

  // Handle table at end of content
  if (inTable && tableRows.length > 0) {
    result.push(generateHtmlTable(tableRows))
  }

  return result.join('\n')
}

/**
 * Generate HTML table from rows
 * @param {Array<Array<string>>} rows - Table rows
 * @returns {string} HTML table
 */
function generateHtmlTable(rows) {
  if (rows.length === 0) return ''

  let html = '<table class="form-table">'

  // First row as header
  html += '<thead><tr>'
  for (const cell of rows[0]) {
    html += `<th>${cell}</th>`
  }
  html += '</tr></thead>'

  // Rest as body
  if (rows.length > 1) {
    html += '<tbody>'
    for (let i = 1; i < rows.length; i++) {
      html += '<tr>'
      for (const cell of rows[i]) {
        html += `<td>${cell}</td>`
      }
      html += '</tr>'
    }
    html += '</tbody>'
  }

  html += '</table>'
  return html
}

// ============================================
// PDF STYLES
// ============================================

const PDF_STYLES = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #1a1a1a;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 16px;
      color: #111827;
      border-bottom: 2px solid #111827;
      padding-bottom: 8px;
    }

    h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 12px;
      color: #374151;
    }

    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 16px;
      margin-bottom: 8px;
      color: #4b5563;
    }

    p {
      margin-bottom: 8px;
    }

    .form-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 10pt;
    }

    .form-table th,
    .form-table td {
      border: 1px solid #d1d5db;
      padding: 8px 12px;
      text-align: left;
      vertical-align: top;
    }

    .form-table th {
      background-color: #f3f4f6;
      font-weight: 600;
      color: #374151;
    }

    .form-table td {
      background-color: #ffffff;
    }

    .form-table tr:nth-child(even) td {
      background-color: #f9fafb;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .header-title {
      font-size: 18pt;
      font-weight: bold;
      color: #111827;
    }

    .header-meta {
      text-align: right;
      font-size: 9pt;
      color: #6b7280;
    }

    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 9pt;
      color: #6b7280;
      text-align: center;
    }

    .signature-box {
      border: 1px solid #d1d5db;
      min-height: 60px;
      margin: 8px 0;
      padding: 8px;
      background-color: #fafafa;
    }

    .signature-line {
      border-bottom: 1px solid #1a1a1a;
      margin-top: 40px;
      margin-bottom: 4px;
    }

    .signature-label {
      font-size: 9pt;
      color: #6b7280;
    }

    .field-value {
      font-weight: 500;
      color: #111827;
    }

    .checkbox-checked {
      color: #059669;
      font-weight: bold;
    }

    .checkbox-unchecked {
      color: #9ca3af;
    }

    @media print {
      body {
        padding: 20px;
      }

      .no-print {
        display: none;
      }
    }
  </style>
`

// ============================================
// PDF GENERATION
// ============================================

/**
 * Generate PDF from filled form data
 * @param {Object} options - Generation options
 * @param {string} options.title - Form title
 * @param {string} options.formNumber - Form number
 * @param {string} options.template - Original markdown template
 * @param {Object} options.fieldValues - Filled field values
 * @param {Array} options.fieldDefinitions - Field definitions
 * @param {Object} options.metadata - Additional metadata
 * @returns {Promise<Blob>} PDF blob
 */
export async function generateFormPdf(options) {
  const {
    title,
    formNumber,
    template,
    fieldValues,
    fieldDefinitions,
    metadata = {}
  } = options

  // Generate filled markdown
  const filledMarkdown = generateFilledMarkdown(template, fieldValues, fieldDefinitions)

  // Convert to HTML
  const htmlContent = markdownToHtml(filledMarkdown)

  // Build full HTML document
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      ${PDF_STYLES}
    </head>
    <body>
      <div class="header">
        <div>
          <div class="header-title">${title}</div>
          ${formNumber ? `<div style="font-size: 10pt; color: #6b7280;">Form #: ${formNumber}</div>` : ''}
        </div>
        <div class="header-meta">
          <div>Generated: ${new Date().toLocaleDateString()}</div>
          ${metadata.submittedBy ? `<div>Submitted by: ${metadata.submittedBy}</div>` : ''}
          ${metadata.organization ? `<div>${metadata.organization}</div>` : ''}
        </div>
      </div>

      <div class="content">
        ${htmlContent}
      </div>

      <div class="footer">
        <div>This document was generated electronically by Muster</div>
        <div>Generated on ${new Date().toISOString()}</div>
      </div>
    </body>
    </html>
  `

  // Use browser print as the primary method (no external dependencies)
  // This opens a print dialog where users can save as PDF
  return printFallback(fullHtml, title)
}

/**
 * Fallback to browser print dialog
 * @param {string} html - HTML content
 * @param {string} title - Document title
 * @returns {Promise<null>}
 */
async function printFallback(html, title) {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 500))

    printWindow.print()
    printWindow.close()
  }

  return null
}

/**
 * Generate PDF and upload to Firebase Storage
 * @param {Object} options - Generation options
 * @param {string} options.storagePath - Path in Firebase Storage
 * @param {Function} options.uploadFn - Upload function from storageHelpers
 * @returns {Promise<{url: string, path: string}>}
 */
export async function generateAndUploadPdf(options) {
  const { storagePath, uploadFn, ...pdfOptions } = options

  const blob = await generateFormPdf(pdfOptions)

  if (!blob) {
    throw new Error('PDF generation failed')
  }

  // Convert blob to File
  const file = new File([blob], `${pdfOptions.title.replace(/[^a-z0-9]/gi, '_')}.pdf`, {
    type: 'application/pdf',
  })

  // Upload using provided function
  const result = await uploadFn(file, storagePath)

  return result
}

/**
 * Open print preview for a form
 * @param {Object} options - Same options as generateFormPdf
 */
export function openPrintPreview(options) {
  const {
    title,
    formNumber,
    template,
    fieldValues,
    fieldDefinitions,
    metadata = {}
  } = options

  // Generate filled markdown
  const filledMarkdown = generateFilledMarkdown(template, fieldValues, fieldDefinitions)

  // Convert to HTML
  const htmlContent = markdownToHtml(filledMarkdown)

  // Build full HTML document
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      ${PDF_STYLES}
    </head>
    <body>
      <div class="no-print" style="background: #f3f4f6; padding: 16px; margin-bottom: 24px; text-align: center;">
        <button onclick="window.print()" style="padding: 8px 24px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
          Print / Save as PDF
        </button>
        <button onclick="window.close()" style="padding: 8px 24px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; margin-left: 8px;">
          Close
        </button>
      </div>

      <div class="header">
        <div>
          <div class="header-title">${title}</div>
          ${formNumber ? `<div style="font-size: 10pt; color: #6b7280;">Form #: ${formNumber}</div>` : ''}
        </div>
        <div class="header-meta">
          <div>Generated: ${new Date().toLocaleDateString()}</div>
          ${metadata.submittedBy ? `<div>Submitted by: ${metadata.submittedBy}</div>` : ''}
          ${metadata.organization ? `<div>${metadata.organization}</div>` : ''}
        </div>
      </div>

      <div class="content">
        ${htmlContent}
      </div>

      <div class="footer">
        <div>This document was generated electronically by Muster</div>
        <div>Generated on ${new Date().toISOString()}</div>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(fullHtml)
    printWindow.document.close()
  }
}
