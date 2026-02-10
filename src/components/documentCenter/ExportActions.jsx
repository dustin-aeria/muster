/**
 * Export Actions Component
 * Download buttons and format options for document export
 *
 * @location src/components/documentCenter/ExportActions.jsx
 */

import { useState, useCallback } from 'react'
import {
  Download,
  FileText,
  FileImage,
  File,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Copy,
  Check,
  Printer
} from 'lucide-react'
import {
  generateOperationsPlanPDF,
  generateSORAPDF,
  generateHSERiskPDF
} from '../../lib/pdfExportService'
import {
  generateMultiSiteOperationsPlanPDF,
  generateMultiSiteSORA_PDF
} from '../../lib/pdfExportServiceMultiSite'
import { generateQuotePDF, generateProposalPDF } from '../../lib/documentExportService'
import { getDocumentColorClasses } from '../../lib/documentTypes'
import { logger } from '../../lib/logger'

export default function ExportActions({
  project,
  documentType,
  selectedSections,
  sectionOrder,
  aiEnabled,
  aiTone,
  selectedSite,
  branding,
  sites,
  enhance,
  isEnhancing,
  getEnhanced,
  isExporting,
  setIsExporting,
  exportProgress,
  setExportProgress
}) {
  const [copied, setCopied] = useState(false)
  const [showMoreFormats, setShowMoreFormats] = useState(false)

  const colors = getDocumentColorClasses(documentType?.id)
  const isMultiSite = sites?.length > 1
  const exportType = documentType?.exportType || documentType?.id

  // Download helper
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Generate filename
  const generateFilename = (extension) => {
    const siteSuffix = isMultiSite ? (selectedSite ? `_site-${selectedSite}` : '_all-sites') : ''
    const dateStr = new Date().toISOString().split('T')[0]
    return `${documentType?.id || 'document'}${siteSuffix}_${project?.projectCode || project?.name || 'export'}_${dateStr}.${extension}`
  }

  // Get client branding
  const clientBranding = project?.clientId
    ? branding?.clients?.find(c => c.id === project.clientId)
    : null

  const exportBranding = {
    operator: branding?.operator,
    client: clientBranding
  }

  // Handle PDF export
  const handlePDFExport = useCallback(async () => {
    if (!project || !documentType) return

    setIsExporting(true)
    setExportProgress('Preparing export...')

    try {
      let enhancedContent = null

      // Get AI enhancement if enabled
      if (aiEnabled) {
        setExportProgress('Generating AI-enhanced content...')
        try {
          const result = await enhance(exportType)
          if (result?.enhanced) {
            enhancedContent = result.enhanced
          }
        } catch (enhanceErr) {
          logger.warn('Enhancement failed, continuing with standard export:', enhanceErr)
        }
      }

      setExportProgress('Generating PDF...')

      let pdf
      const filename = generateFilename('pdf')

      // Filter project by selected site if needed
      const projectForExport = selectedSite && isMultiSite
        ? { ...project, sites: sites.filter(s => s.id === selectedSite) }
        : project

      // Route to appropriate PDF generator
      switch (documentType.id) {
        case 'quote':
          pdf = await generateQuotePDF(projectForExport, exportBranding, {
            sections: selectedSections,
            sectionOrder,
            enhanced: enhancedContent,
            tone: aiTone
          })
          break

        case 'proposal':
          pdf = await generateProposalPDF(projectForExport, exportBranding, {
            sections: selectedSections,
            sectionOrder,
            enhanced: enhancedContent,
            tone: aiTone
          })
          break

        case 'operationsPlan':
          if (isMultiSite && !selectedSite) {
            pdf = await generateMultiSiteOperationsPlanPDF(
              projectForExport,
              exportBranding,
              clientBranding,
              enhancedContent
            )
          } else {
            pdf = await generateOperationsPlanPDF(
              projectForExport,
              exportBranding,
              clientBranding,
              enhancedContent
            )
          }
          break

        case 'sora':
          const soraCalcs = {
            intrinsicGRC: project.soraAssessment?.intrinsicGRC || 3,
            finalGRC: project.soraAssessment?.finalGRC || 3,
            residualARC: project.soraAssessment?.residualARC || project.soraAssessment?.initialARC || 'ARC-b',
            sail: project.soraAssessment?.sail || 'II'
          }
          if (isMultiSite && !selectedSite) {
            pdf = await generateMultiSiteSORA_PDF(
              projectForExport,
              exportBranding,
              enhancedContent
            )
          } else {
            pdf = await generateSORAPDF(
              projectForExport,
              soraCalcs,
              exportBranding,
              enhancedContent
            )
          }
          break

        case 'hseRisk':
          pdf = await generateHSERiskPDF(projectForExport, exportBranding, enhancedContent)
          break

        default:
          // Fallback to operations plan
          pdf = await generateOperationsPlanPDF(
            projectForExport,
            exportBranding,
            clientBranding,
            enhancedContent
          )
      }

      setExportProgress('Saving...')
      pdf.save(filename)
      setExportProgress(null)

    } catch (err) {
      logger.error('PDF export failed:', err)
      setExportProgress('Export failed')
      setTimeout(() => setExportProgress(null), 3000)
    } finally {
      setIsExporting(false)
    }
  }, [
    project, documentType, aiEnabled, aiTone, selectedSite, isMultiSite,
    sites, exportBranding, clientBranding, selectedSections, sectionOrder,
    enhance, exportType, setIsExporting, setExportProgress
  ])

  // Handle HTML export
  const handleHTMLExport = useCallback(() => {
    // Generate simple HTML document
    const html = generateHTMLDocument(project, documentType, selectedSections, branding)
    const blob = new Blob([html], { type: 'text/html' })
    downloadBlob(blob, generateFilename('html'))
  }, [project, documentType, selectedSections, branding])

  // Handle text export
  const handleTextExport = useCallback(() => {
    const text = generateTextDocument(project, documentType, selectedSections)
    const blob = new Blob([text], { type: 'text/plain' })
    downloadBlob(blob, generateFilename('txt'))
  }, [project, documentType, selectedSections])

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    const text = generateTextDocument(project, documentType, selectedSections)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      logger.error('Copy failed:', err)
    }
  }, [project, documentType, selectedSections])

  // Handle print
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  return (
    <div className="space-y-4">
      {/* Primary Export - PDF */}
      <div className="card">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FileImage className="w-4 h-4 text-red-500" />
          Export Document
        </h4>

        <button
          onClick={handlePDFExport}
          disabled={isExporting || selectedSections.length === 0}
          className={`
            w-full p-4 rounded-lg border-2 text-left transition-all
            ${isExporting
              ? 'border-gray-200 bg-gray-50'
              : 'border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              {isExporting ? (
                <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
              ) : (
                <FileImage className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {isExporting ? 'Generating...' : 'Download PDF'}
              </div>
              <div className="text-sm text-gray-500">
                {isExporting ? exportProgress : 'Professional branded document'}
              </div>
            </div>
            {!isExporting && <Download className="w-5 h-5 text-red-600" />}
          </div>

          {/* AI indicator */}
          {aiEnabled && !isExporting && (
            <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
              <Sparkles className="w-3 h-3" />
              AI-enhanced content will be generated
            </div>
          )}
        </button>
      </div>

      {/* Additional formats */}
      <div className="card">
        <button
          onClick={() => setShowMoreFormats(!showMoreFormats)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700"
        >
          <span>Other Formats</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showMoreFormats ? 'rotate-180' : ''}`} />
        </button>

        {showMoreFormats && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {/* HTML */}
            <button
              onClick={handleHTMLExport}
              disabled={selectedSections.length === 0}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-blue-500 mb-1" />
              <div className="text-sm font-medium text-gray-900">HTML</div>
              <div className="text-xs text-gray-500">Web format</div>
            </button>

            {/* Plain Text */}
            <button
              onClick={handleTextExport}
              disabled={selectedSections.length === 0}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
            >
              <File className="w-4 h-4 text-gray-500 mb-1" />
              <div className="text-sm font-medium text-gray-900">Text</div>
              <div className="text-xs text-gray-500">Plain text</div>
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              disabled={selectedSections.length === 0}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500 mb-1" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500 mb-1" />
              )}
              <div className="text-sm font-medium text-gray-900">
                {copied ? 'Copied!' : 'Copy'}
              </div>
              <div className="text-xs text-gray-500">To clipboard</div>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
            >
              <Printer className="w-4 h-4 text-gray-500 mb-1" />
              <div className="text-sm font-medium text-gray-900">Print</div>
              <div className="text-xs text-gray-500">Current view</div>
            </button>
          </div>
        )}
      </div>

      {/* Export summary */}
      <div className="text-xs text-gray-500 text-center">
        {selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''} selected
        {isMultiSite && (
          <span className="ml-1">
            | {selectedSite ? '1 site' : `${sites.length} sites`}
          </span>
        )}
      </div>
    </div>
  )
}

// Helper: Generate HTML document
function generateHTMLDocument(project, documentType, selectedSections, branding) {
  const operatorName = branding?.operator?.name || 'Operator'
  const colors = branding?.operator?.colors || { primary: '#1e3a5f', secondary: '#3b82f6' }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentType?.label || 'Document'} - ${project?.name || 'Project'}</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
    .header { background: ${colors.primary}; color: white; padding: 2rem; margin: -2rem -2rem 2rem; }
    h1 { margin: 0; }
    h2 { color: ${colors.primary}; border-bottom: 2px solid ${colors.secondary}; padding-bottom: 0.5rem; }
    .meta { color: rgba(255,255,255,0.8); margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${documentType?.label || 'Document'}</h1>
    <p class="meta">${project?.name || 'Project'} | ${project?.clientName || ''} | ${new Date().toLocaleDateString()}</p>
  </div>
  ${selectedSections.map(sectionId => {
    const section = documentType?.sections?.find(s => s.id === sectionId)
    return section ? `<h2>${section.label}</h2><p>Section content for ${section.label}</p>` : ''
  }).join('\n')}
  <hr>
  <p style="text-align: center; color: #666; font-size: 0.875rem;">
    Generated by ${operatorName} | ${new Date().toLocaleString()}
  </p>
</body>
</html>`
}

// Helper: Generate text document
function generateTextDocument(project, documentType, selectedSections) {
  const lines = []
  lines.push('='.repeat(60))
  lines.push(documentType?.label?.toUpperCase() || 'DOCUMENT')
  lines.push('='.repeat(60))
  lines.push('')
  lines.push(`Project: ${project?.name || 'N/A'}`)
  lines.push(`Client: ${project?.clientName || 'N/A'}`)
  lines.push(`Date: ${new Date().toLocaleDateString()}`)
  lines.push('')

  selectedSections.forEach(sectionId => {
    const section = documentType?.sections?.find(s => s.id === sectionId)
    if (section) {
      lines.push('-'.repeat(40))
      lines.push(section.label.toUpperCase())
      lines.push('-'.repeat(40))
      lines.push('')
      lines.push(`[${section.label} content]`)
      lines.push('')
    }
  })

  lines.push('='.repeat(60))
  lines.push(`Generated: ${new Date().toLocaleString()}`)
  lines.push('='.repeat(60))

  return lines.join('\n')
}
