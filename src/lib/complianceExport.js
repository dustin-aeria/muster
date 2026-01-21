/**
 * complianceExport.js
 * Export utilities for compliance applications
 *
 * Generates formatted exports for:
 * - PDF (via print)
 * - Plain text/markdown
 * - CSV
 *
 * @location src/lib/complianceExport.js
 */

// ============================================
// FORMAT HELPERS
// ============================================

function formatDate(date) {
  if (!date) return 'N/A'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function escapeHtml(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>')
}

function stripHtml(text) {
  if (!text) return ''
  return text.replace(/<[^>]*>/g, '')
}

// ============================================
// EXPORT GENERATORS
// ============================================

/**
 * Generate HTML export for printing to PDF
 */
export function generateHtmlExport(application, template) {
  const categories = template.categories || []
  const requirements = template.requirements || []
  const responses = application.responses || {}

  // Group requirements by category
  const requirementsByCategory = {}
  for (const cat of categories) {
    requirementsByCategory[cat.id] = requirements
      .filter(r => r.category === cat.id)
      .sort((a, b) => a.order - b.order)
  }

  // Calculate stats
  const totalReqs = requirements.length
  const completedReqs = Object.values(responses).filter(r => r.status === 'complete').length
  const percentComplete = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(application.name)} - Compliance Matrix</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    @media print {
      body {
        padding: 0;
        font-size: 10pt;
      }

      .no-print {
        display: none !important;
      }

      .page-break {
        page-break-before: always;
      }

      .requirement {
        page-break-inside: avoid;
      }
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #1e3a5f;
    }

    .header h1 {
      font-size: 18pt;
      color: #1e3a5f;
      margin: 0 0 5px 0;
    }

    .header .subtitle {
      font-size: 12pt;
      color: #666;
      margin: 0;
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 30px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .meta-item {
      flex: 1;
      min-width: 150px;
    }

    .meta-label {
      font-size: 9pt;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-value {
      font-weight: 600;
      color: #333;
    }

    .progress-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 5px;
    }

    .progress-fill {
      height: 100%;
      background: #1e3a5f;
    }

    .category {
      margin-bottom: 30px;
    }

    .category-header {
      background: #1e3a5f;
      color: white;
      padding: 10px 15px;
      margin: 0;
      font-size: 14pt;
    }

    .category-description {
      background: #f0f4f8;
      padding: 10px 15px;
      font-size: 10pt;
      color: #555;
      margin: 0;
      border-bottom: 1px solid #ddd;
    }

    .requirement {
      border: 1px solid #ddd;
      border-top: none;
      padding: 15px;
    }

    .requirement:last-child {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    .req-header {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
    }

    .req-number {
      background: #e8f0fe;
      color: #1e3a5f;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 600;
      white-space: nowrap;
    }

    .req-text {
      flex: 1;
      font-weight: 500;
    }

    .req-status {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: 500;
    }

    .status-complete {
      background: #d4edda;
      color: #155724;
    }

    .status-partial {
      background: #fff3cd;
      color: #856404;
    }

    .status-empty {
      background: #f8d7da;
      color: #721c24;
    }

    .response {
      margin-top: 10px;
      padding: 10px;
      background: #fafafa;
      border-radius: 4px;
      border-left: 3px solid #1e3a5f;
    }

    .response-label {
      font-size: 9pt;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .response-text {
      white-space: pre-wrap;
    }

    .documents {
      margin-top: 10px;
    }

    .documents-label {
      font-size: 9pt;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 0;
      font-size: 10pt;
    }

    .document-icon {
      color: #1e3a5f;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 9pt;
      color: #666;
    }

    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #1e3a5f;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .print-button:hover {
      background: #2d4a6f;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>

  <div class="header">
    <h1>${escapeHtml(application.name)}</h1>
    <p class="subtitle">${escapeHtml(template.name)} - ${escapeHtml(template.regulatoryBody)}</p>
  </div>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Status</div>
      <div class="meta-value">${application.status?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Template Version</div>
      <div class="meta-value">${escapeHtml(template.version || '1.0')}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Last Updated</div>
      <div class="meta-value">${formatDate(application.updatedAt)}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Progress</div>
      <div class="meta-value">${percentComplete}% (${completedReqs}/${totalReqs})</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentComplete}%"></div>
      </div>
    </div>
  </div>

  ${categories.map((category, catIdx) => `
    <div class="category ${catIdx > 0 ? 'page-break' : ''}">
      <h2 class="category-header">${escapeHtml(category.name)}</h2>
      ${category.description ? `<p class="category-description">${escapeHtml(category.description)}</p>` : ''}

      ${requirementsByCategory[category.id]?.map(req => {
        const response = responses[req.id] || {}
        const status = response.status || 'empty'
        const statusClass = status === 'complete' ? 'status-complete' :
                           status === 'partial' ? 'status-partial' : 'status-empty'
        const statusLabel = status === 'complete' ? 'Complete' :
                           status === 'partial' ? 'Partial' : 'Not Addressed'

        return `
          <div class="requirement">
            <div class="req-header">
              ${req.regulatoryRef ? `<span class="req-number">${escapeHtml(req.regulatoryRef)}</span>` : ''}
              <span class="req-text">${escapeHtml(req.shortText || req.text)}</span>
              <span class="req-status ${statusClass}">${statusLabel}</span>
            </div>

            <div style="font-size: 10pt; color: #555; margin-bottom: 10px;">
              ${escapeHtml(req.text)}
            </div>

            ${response.response ? `
              <div class="response">
                <div class="response-label">Response</div>
                <div class="response-text">${escapeHtml(response.response)}</div>
              </div>
            ` : ''}

            ${response.documentRefs?.length > 0 ? `
              <div class="documents">
                <div class="documents-label">Referenced Documents</div>
                ${response.documentRefs.map(doc => `
                  <div class="document-item">
                    <span class="document-icon">📄</span>
                    <span>${escapeHtml(doc.title)}${doc.section ? ` - ${escapeHtml(doc.section)}` : ''}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `
      }).join('') || '<p style="padding: 15px; color: #666;">No requirements in this category</p>'}
    </div>
  `).join('')}

  <div class="footer">
    <p>Generated by Aeria Ops Compliance Matrix Engine</p>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `.trim()

  return html
}

/**
 * Generate CSV export
 */
export function generateCsvExport(application, template) {
  const requirements = template.requirements || []
  const responses = application.responses || {}
  const categories = template.categories || []

  // Create category lookup
  const categoryLookup = {}
  for (const cat of categories) {
    categoryLookup[cat.id] = cat.name
  }

  // CSV header
  const headers = [
    'Category',
    'Regulatory Ref',
    'Requirement',
    'Status',
    'Response',
    'Documents'
  ]

  // CSV rows
  const rows = requirements
    .sort((a, b) => a.order - b.order)
    .map(req => {
      const response = responses[req.id] || {}
      const documents = response.documentRefs?.map(d => d.title).join('; ') || ''

      return [
        categoryLookup[req.category] || req.category,
        req.regulatoryRef || '',
        req.shortText || req.text,
        response.status || 'empty',
        (response.response || '').replace(/"/g, '""'),
        documents
      ]
    })

  // Build CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csvContent
}

/**
 * Generate plain text/markdown export
 */
export function generateTextExport(application, template) {
  const categories = template.categories || []
  const requirements = template.requirements || []
  const responses = application.responses || {}

  // Group requirements by category
  const requirementsByCategory = {}
  for (const cat of categories) {
    requirementsByCategory[cat.id] = requirements
      .filter(r => r.category === cat.id)
      .sort((a, b) => a.order - b.order)
  }

  let text = `# ${application.name}\n\n`
  text += `**Template:** ${template.name}\n`
  text += `**Regulatory Body:** ${template.regulatoryBody}\n`
  text += `**Status:** ${application.status}\n`
  text += `**Last Updated:** ${formatDate(application.updatedAt)}\n\n`
  text += `---\n\n`

  for (const category of categories) {
    text += `## ${category.name}\n\n`

    if (category.description) {
      text += `*${category.description}*\n\n`
    }

    const catReqs = requirementsByCategory[category.id] || []

    for (const req of catReqs) {
      const response = responses[req.id] || {}
      const status = response.status || 'empty'
      const statusEmoji = status === 'complete' ? '✅' :
                         status === 'partial' ? '🔶' : '❌'

      text += `### ${req.regulatoryRef ? `[${req.regulatoryRef}] ` : ''}${req.shortText || req.text.substring(0, 60)}\n\n`
      text += `**Status:** ${statusEmoji} ${status}\n\n`
      text += `**Requirement:**\n${req.text}\n\n`

      if (response.response) {
        text += `**Response:**\n${response.response}\n\n`
      }

      if (response.documentRefs?.length > 0) {
        text += `**Referenced Documents:**\n`
        for (const doc of response.documentRefs) {
          text += `- ${doc.title}${doc.section ? ` (${doc.section})` : ''}\n`
        }
        text += '\n'
      }

      text += '---\n\n'
    }
  }

  text += `\n*Generated by Aeria Ops Compliance Matrix Engine on ${new Date().toLocaleString()}*\n`

  return text
}

/**
 * Open export in new window for printing
 */
export function openPrintExport(application, template) {
  const html = generateHtmlExport(application, template)
  const printWindow = window.open('', '_blank')

  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  } else {
    alert('Please allow popups to export the compliance matrix')
  }
}

/**
 * Download CSV export
 */
export function downloadCsvExport(application, template) {
  const csv = generateCsvExport(application, template)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${application.name.replace(/[^a-z0-9]/gi, '_')}_compliance.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Download text/markdown export
 */
export function downloadTextExport(application, template) {
  const text = generateTextExport(application, template)
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${application.name.replace(/[^a-z0-9]/gi, '_')}_compliance.md`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default {
  generateHtmlExport,
  generateCsvExport,
  generateTextExport,
  openPrintExport,
  downloadCsvExport,
  downloadTextExport
}
