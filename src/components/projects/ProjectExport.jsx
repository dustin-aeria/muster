// ============================================
// PROJECT EXPORT COMPONENT
// Export project data in multiple formats including PDF
// UPDATED: Added multi-site support
// ============================================

import { useState, useMemo } from 'react'
import { 
  Download,
  FileText,
  FileCheck,
  Printer,
  Mail,
  Copy,
  Check,
  Loader2,
  Package,
  File,
  AlertTriangle,
  CheckCircle2,
  Info,
  Settings,
  FileImage,
  Shield,
  ClipboardList,
  MapPin,
  Plane,
  AlertCircle as AlertIcon,
  Users,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react'
import { useBranding } from '../BrandingSettings'
import { 
  exportToPDF, 
  generateOperationsPlanPDF, 
  generateSORAPDF, 
  generateHSERiskPDF 
} from '../../lib/pdfExportService'
import { 
  exportMultiSitePDF,
  generateMultiSiteOperationsPlanPDF,
  generateMultiSiteSORA_PDF,
  calculateSiteSORA,
  calculateMaxSAIL
} from '../../lib/pdfExportServiceMultiSite'
import { sailColors } from '../../lib/soraConfig'

// ============================================
// EXPORT SECTIONS CONFIGURATION
// ============================================
const exportSections = [
  { id: 'overview', label: 'Project Overview', included: true },
  { id: 'crew', label: 'Crew Roster', included: true },
  { id: 'siteSurvey', label: 'Site Survey', included: true, conditional: true },
  { id: 'flightPlan', label: 'Flight Plan', included: true, conditional: true },
  { id: 'riskAssessment', label: 'Risk Assessment', included: true },
  { id: 'emergency', label: 'Emergency Plan', included: true },
  { id: 'ppe', label: 'PPE Requirements', included: true },
  { id: 'communications', label: 'Communications', included: true },
  { id: 'approvals', label: 'Approvals & Signatures', included: true },
  { id: 'forms', label: 'Forms Checklist', included: false },
]

// ============================================
// PDF EXPORT TYPES
// ============================================
const pdfExportTypes = [
  {
    id: 'operations-plan',
    label: 'Full Operations Plan',
    description: 'Complete project documentation including all sections',
    icon: FileText,
    color: 'blue',
    supportsMultiSite: true
  },
  {
    id: 'sora',
    label: 'SORA Assessment',
    description: 'Specific Operations Risk Assessment (SORA 2.5)',
    icon: Shield,
    color: 'purple',
    conditional: 'soraAssessment',
    supportsMultiSite: true
  },
  {
    id: 'hse-risk',
    label: 'HSE Risk Assessment',
    description: 'Health, Safety & Environment hazard assessment',
    icon: AlertIcon,
    color: 'orange',
    conditional: 'hseRiskAssessment',
    supportsMultiSite: false
  },
  {
    id: 'site-survey',
    label: 'Site Survey Report',
    description: 'Site survey documentation and findings',
    icon: MapPin,
    color: 'green',
    conditional: 'siteSurvey',
    supportsMultiSite: false
  },
  {
    id: 'flight-plan',
    label: 'Flight Plan',
    description: 'Flight operations plan and aircraft details',
    icon: Plane,
    color: 'cyan',
    conditional: 'flightPlan',
    supportsMultiSite: false
  },
  {
    id: 'tailgate',
    label: 'Tailgate Meeting',
    description: 'Pre-deployment safety briefing form',
    icon: Users,
    color: 'amber',
    supportsMultiSite: false
  }
]

// ============================================
// DOWNLOAD HELPER
// ============================================
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

// ============================================
// MULTI-SITE SELECTOR COMPONENT
// ============================================
function MultiSiteSelector({ sites, selectedSite, onSelect, calculations }) {
  if (!sites || sites.length <= 1) return null
  
  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-5 h-5 text-blue-600" />
        <span className="font-medium text-blue-900">Multi-Site Project</span>
        <span className="text-sm text-blue-700">({sites.length} sites)</span>
      </div>
      
      <p className="text-sm text-blue-700 mb-3">
        Select which sites to include in the export:
      </p>
      
      <div className="space-y-2">
        {/* All Sites Option */}
        <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-50">
          <input
            type="radio"
            name="siteSelection"
            checked={selectedSite === null}
            onChange={() => onSelect(null)}
            className="w-4 h-4 text-aeria-navy"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900">All Sites</span>
            <span className="text-sm text-gray-500 ml-2">
              Export complete multi-site document
            </span>
          </div>
          {calculations && (
            <span className="text-xs text-gray-500">
              Max SAIL: {calculateMaxSAIL(sites) || 'N/A'}
            </span>
          )}
        </label>
        
        {/* Individual Sites */}
        {sites.map((site, index) => {
          const calc = calculations?.[site.id] || {}
          
          return (
            <label 
              key={site.id}
              className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="siteSelection"
                checked={selectedSite === site.id}
                onChange={() => onSelect(site.id)}
                className="w-4 h-4 text-aeria-navy"
              />
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <span className="font-medium text-gray-900">{site.name || `Site ${index + 1}`}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {site.siteSurvey?.location || 'No location'}
                </span>
              </div>
              {calc.sail && (
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: sailColors[calc.sail],
                    color: calc.sail === 'I' || calc.sail === 'II' ? '#1F2937' : '#FFFFFF'
                  }}
                >
                  SAIL {calc.sail}
                </span>
              )}
            </label>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectExport({ project, onUpdate }) {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState(null)
  const [copied, setCopied] = useState(false)
  const [selectedSections, setSelectedSections] = useState(
    exportSections.reduce((acc, s) => ({ ...acc, [s.id]: s.included }), {})
  )
  const [includeAppendices, setIncludeAppendices] = useState(true)
  const [includeCoverPage, setIncludeCoverPage] = useState(true)
  const [showPDFOptions, setShowPDFOptions] = useState(false)
  const [pdfExportProgress, setPdfExportProgress] = useState(null)
  const [selectedSite, setSelectedSite] = useState(null) // null = all sites
  const [showSiteSelector, setShowSiteSelector] = useState(false)
  
  // Get branding settings
  const { branding, loading: brandingLoading } = useBranding()
  
  // Get sites array for multi-site projects
  const sites = useMemo(() => {
    return Array.isArray(project?.sites) ? project.sites : []
  }, [project?.sites])
  
  const isMultiSite = sites.length > 1
  
  // Calculate SORA for all sites
  const siteCalculations = useMemo(() => {
    if (!isMultiSite) return {}
    const results = {}
    sites.forEach(site => {
      results[site.id] = calculateSiteSORA(site)
    })
    return results
  }, [sites, isMultiSite])

  const toggleSection = (sectionId) => {
    setSelectedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  // ============================================
  // TEXT EXPORT (existing functionality)
  // ============================================
  const generateTextSummary = () => {
    const lines = []
    
    // Header
    lines.push('='.repeat(60))
    lines.push(`RPAS OPERATIONS PLAN`)
    lines.push('='.repeat(60))
    lines.push('')
    lines.push(`Project: ${project.name || 'Untitled'}`)
    lines.push(`Code: ${project.projectCode || 'N/A'}`)
    lines.push(`Client: ${project.clientName || 'N/A'}`)
    lines.push(`Date: ${project.startDate || 'TBD'}`)
    lines.push(`Status: ${project.status?.toUpperCase() || 'DRAFT'}`)
    
    // Multi-site info
    if (isMultiSite) {
      lines.push(`Sites: ${sites.length}`)
      lines.push('')
      lines.push('Operation Sites:')
      sites.forEach((site, idx) => {
        const calc = siteCalculations[site.id] || {}
        lines.push(`  ${idx + 1}. ${site.name || 'Unnamed'} - SAIL: ${calc.sail || 'N/A'}`)
      })
    }
    lines.push('')

    // Crew
    if (selectedSections.crew) {
      lines.push('-'.repeat(40))
      lines.push('CREW')
      lines.push('-'.repeat(40))
      if (project.crew?.length > 0) {
        project.crew.forEach(member => {
          lines.push(`${member.role}: ${member.name}`)
          if (member.phone) lines.push(`  Phone: ${member.phone}`)
          if (member.certifications) lines.push(`  Certs: ${member.certifications}`)
        })
      } else {
        lines.push('No crew assigned')
      }
      lines.push('')
    }

    // Flight Plan
    if (selectedSections.flightPlan && project.sections?.flightPlan) {
      lines.push('-'.repeat(40))
      lines.push('FLIGHT PLAN')
      lines.push('-'.repeat(40))
      const fp = project.flightPlan || {}
      lines.push(`Operation Type: ${fp.operationType || 'VLOS'}`)
      lines.push(`Max Altitude: ${fp.maxAltitudeAGL || fp.maxAltitude || 'N/A'} m AGL`)
      lines.push(`Aircraft: ${fp.aircraft?.[0]?.registration || 'N/A'}`)
      if (fp.flightArea) lines.push(`Flight Area: ${fp.flightArea}`)
      lines.push('')
    }

    // Site Survey
    if (selectedSections.siteSurvey && project.sections?.siteSurvey) {
      lines.push('-'.repeat(40))
      lines.push('SITE SURVEY')
      lines.push('-'.repeat(40))
      const ss = project.siteSurvey || {}
      lines.push(`Site: ${ss.general?.siteName || 'N/A'}`)
      if (ss.general?.coordinates) {
        lines.push(`Coordinates: ${ss.general.coordinates.lat}, ${ss.general.coordinates.lng}`)
      }
      lines.push('')
    }

    // Risk Assessment
    if (selectedSections.riskAssessment) {
      lines.push('-'.repeat(40))
      lines.push('RISK ASSESSMENT')
      lines.push('-'.repeat(40))
      
      if (project.soraAssessment) {
        const sora = project.soraAssessment
        lines.push(`SORA SAIL: ${sora.sail || 'N/A'}`)
        lines.push(`Final GRC: ${sora.finalGRC || 'N/A'}`)
        lines.push(`Residual ARC: ${sora.residualARC || sora.initialARC || 'N/A'}`)
      }
      
      if (project.hseRiskAssessment?.hazards?.length > 0) {
        lines.push('')
        lines.push('Identified Hazards:')
        project.hseRiskAssessment.hazards.forEach((h, i) => {
          lines.push(`${i + 1}. ${h.description || 'Unnamed hazard'}`)
          lines.push(`   Controls: ${h.controls || 'None documented'}`)
        })
      }
      lines.push('')
    }

    // Emergency
    if (selectedSections.emergency) {
      lines.push('-'.repeat(40))
      lines.push('EMERGENCY PLAN')
      lines.push('-'.repeat(40))
      const ep = project.emergencyPlan || {}
      const contact = ep.primaryEmergencyContact || {}
      lines.push(`Emergency Contact: ${contact.name || 'Not set'}`)
      if (contact.phone) lines.push(`  Phone: ${contact.phone}`)
      lines.push(`Hospital: ${ep.nearestHospital || 'Not set'}`)
      lines.push(`Rally Point: ${ep.rallyPoint || 'Not set'}`)
      lines.push('')
    }

    // Communications
    if (selectedSections.communications) {
      lines.push('-'.repeat(40))
      lines.push('COMMUNICATIONS')
      lines.push('-'.repeat(40))
      const comm = project.communications || {}
      lines.push(`Primary: ${comm.primaryChannel || 'Not set'}`)
      lines.push(`Backup: ${comm.backupChannel || 'Not set'}`)
      lines.push(`Lost Link: ${comm.lostLinkProcedure || 'RTH'}`)
      lines.push('')
    }

    // PPE
    if (selectedSections.ppe) {
      lines.push('-'.repeat(40))
      lines.push('PPE REQUIREMENTS')
      lines.push('-'.repeat(40))
      const ppe = project.ppe || {}
      if (ppe.required?.length > 0) {
        ppe.required.forEach(item => lines.push(`• ${item}`))
      } else {
        lines.push('Standard PPE')
      }
      lines.push('')
    }

    // Footer
    lines.push('='.repeat(60))
    lines.push(`Generated: ${new Date().toLocaleString()}`)
    lines.push(`${branding?.operator?.name || 'Operator'} - ${branding?.operator?.registration || ''}`)
    lines.push('='.repeat(60))

    return lines.join('\n')
  }

  // ============================================
  // HTML EXPORT
  // ============================================
  const generateHTMLReport = () => {
    const colors = branding?.operator?.colors || { primary: '#1e3a5f', secondary: '#3b82f6' }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name || 'Operations Plan'} - ${branding?.operator?.name || 'Operator'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; }
    .header { background: ${colors.primary}; color: white; padding: 2rem; }
    .header h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .header p { opacity: 0.9; font-size: 0.9rem; }
    .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    .section { margin-bottom: 2rem; }
    .section-title { background: ${colors.secondary}; color: white; padding: 0.75rem 1rem; border-radius: 4px; font-weight: 600; margin-bottom: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .field { background: #f9fafb; padding: 0.75rem; border-radius: 4px; }
    .field-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
    .field-value { font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th { background: ${colors.primary}; color: white; text-align: left; padding: 0.75rem; }
    td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) { background: #f9fafb; }
    .footer { text-align: center; padding: 2rem; color: #6b7280; font-size: 0.875rem; border-top: 1px solid #e5e7eb; margin-top: 2rem; }
    .site-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
    .site-card h3 { font-size: 1rem; margin-bottom: 0.5rem; }
    @media print { .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${project.name || 'RPAS Operations Plan'}</h1>
    <p>${project.projectCode || ''} | ${project.clientName || 'No Client'} | ${project.startDate || 'TBD'}${isMultiSite ? ` | ${sites.length} Sites` : ''}</p>
  </div>
  
  <div class="container">
    ${selectedSections.overview ? `
    <div class="section">
      <div class="section-title">Project Overview</div>
      <div class="grid">
        <div class="field"><div class="field-label">Project Name</div><div class="field-value">${project.name || 'N/A'}</div></div>
        <div class="field"><div class="field-label">Project Code</div><div class="field-value">${project.projectCode || 'N/A'}</div></div>
        <div class="field"><div class="field-label">Client</div><div class="field-value">${project.clientName || 'N/A'}</div></div>
        <div class="field"><div class="field-label">Status</div><div class="field-value">${project.status?.toUpperCase() || 'DRAFT'}</div></div>
        <div class="field"><div class="field-label">Start Date</div><div class="field-value">${project.startDate || 'TBD'}</div></div>
        <div class="field"><div class="field-label">End Date</div><div class="field-value">${project.endDate || 'TBD'}</div></div>
      </div>
    </div>
    ` : ''}
    
    ${isMultiSite ? `
    <div class="section">
      <div class="section-title">Operation Sites (${sites.length})</div>
      ${sites.map((site, idx) => {
        const calc = siteCalculations[site.id] || {}
        return `
        <div class="site-card">
          <h3>${idx + 1}. ${site.name || 'Unnamed Site'}</h3>
          <div class="grid">
            <div class="field"><div class="field-label">Location</div><div class="field-value">${site.siteSurvey?.location || 'N/A'}</div></div>
            <div class="field"><div class="field-label">Operation Type</div><div class="field-value">${site.flightPlan?.operationType || 'VLOS'}</div></div>
            <div class="field"><div class="field-label">SAIL Level</div><div class="field-value">${calc.sail || 'N/A'}</div></div>
            <div class="field"><div class="field-label">Final GRC</div><div class="field-value">${calc.fGRC || 'N/A'}</div></div>
          </div>
        </div>
        `
      }).join('')}
    </div>
    ` : ''}
    
    ${selectedSections.crew && project.crew?.length > 0 ? `
    <div class="section">
      <div class="section-title">Crew Roster</div>
      <table>
        <thead><tr><th>Role</th><th>Name</th><th>Certifications</th><th>Phone</th></tr></thead>
        <tbody>
          ${project.crew.map(c => `<tr><td>${c.role || 'N/A'}</td><td>${c.name || 'N/A'}</td><td>${c.certifications || 'N/A'}</td><td>${c.phone || 'N/A'}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    ${selectedSections.riskAssessment && project.soraAssessment ? `
    <div class="section">
      <div class="section-title">SORA Assessment</div>
      <div class="grid">
        <div class="field"><div class="field-label">SAIL Level</div><div class="field-value">${project.soraAssessment.sail || 'N/A'}</div></div>
        <div class="field"><div class="field-label">Final GRC</div><div class="field-value">${project.soraAssessment.finalGRC || 'N/A'}</div></div>
        <div class="field"><div class="field-label">Initial ARC</div><div class="field-value">${project.soraAssessment.initialARC || 'N/A'}</div></div>
        <div class="field"><div class="field-label">Operation Type</div><div class="field-value">${project.soraAssessment.operationType || 'VLOS'}</div></div>
      </div>
    </div>
    ` : ''}
    
    ${selectedSections.emergency && project.emergencyPlan ? `
    <div class="section">
      <div class="section-title">Emergency Response</div>
      <div class="grid">
        <div class="field"><div class="field-label">Emergency Contact</div><div class="field-value">${project.emergencyPlan.primaryEmergencyContact?.name || 'N/A'}</div></div>
        <div class="field"><div class="field-label">Contact Phone</div><div class="field-value">${project.emergencyPlan.primaryEmergencyContact?.phone || 'N/A'}</div></div>
        <div class="field"><div class="field-label">Nearest Hospital</div><div class="field-value">${project.emergencyPlan.nearestHospital || 'N/A'}</div></div>
        <div class="field"><div class="field-label">Rally Point</div><div class="field-value">${project.emergencyPlan.rallyPoint || 'N/A'}</div></div>
      </div>
    </div>
    ` : ''}
  </div>
  
  <div class="footer">
    <p>Generated ${new Date().toLocaleString()}</p>
    <p>${branding?.operator?.name || 'Operator'} | ${branding?.operator?.registration || ''}</p>
  </div>
</body>
</html>`
  }

  // ============================================
  // PDF EXPORT HANDLER (UPDATED FOR MULTI-SITE)
  // ============================================
  const handlePDFExport = async (pdfType) => {
    setExporting(true)
    setExportType(pdfType)
    setPdfExportProgress('Generating PDF...')

    try {
      // Get client branding if applicable
      const clientBranding = project.clientId 
        ? branding?.clients?.find(c => c.id === project.clientId)
        : null

      const exportBranding = {
        operator: branding?.operator,
        client: clientBranding
      }

      let pdf
      const siteSuffix = isMultiSite ? (selectedSite ? `_site-${selectedSite}` : '_all-sites') : ''
      const filename = `${pdfType}${siteSuffix}_${project.projectCode || project.name || 'export'}_${new Date().toISOString().split('T')[0]}.pdf`

      // Use multi-site export for supported types when project has multiple sites
      if (isMultiSite && (pdfType === 'operations-plan' || pdfType === 'sora')) {
        setPdfExportProgress('Generating multi-site PDF...')
        
        if (pdfType === 'operations-plan') {
          pdf = await generateMultiSiteOperationsPlanPDF(
            selectedSite ? { ...project, sites: sites.filter(s => s.id === selectedSite) } : project,
            exportBranding,
            clientBranding
          )
        } else if (pdfType === 'sora') {
          pdf = await generateMultiSiteSORA_PDF(
            selectedSite ? { ...project, sites: sites.filter(s => s.id === selectedSite) } : project,
            exportBranding
          )
        }
      } else {
        // Use original single-site export functions
        switch (pdfType) {
          case 'operations-plan':
            pdf = await generateOperationsPlanPDF(project, exportBranding)
            break
          
          case 'sora':
            const soraCalcs = {
              intrinsicGRC: project.soraAssessment?.intrinsicGRC || 3,
              finalGRC: project.soraAssessment?.finalGRC || 3,
              residualARC: project.soraAssessment?.residualARC || project.soraAssessment?.initialARC || 'ARC-b',
              sail: project.soraAssessment?.sail || 'II'
            }
            pdf = await generateSORAPDF(project, soraCalcs, exportBranding)
            break
          
          case 'hse-risk':
            pdf = await generateHSERiskPDF(project, exportBranding)
            break
          
          default:
            pdf = await generateOperationsPlanPDF(project, exportBranding)
        }
      }

      setPdfExportProgress('Saving...')
      pdf.save(filename)
      setPdfExportProgress(null)
      
    } catch (err) {
      console.error('PDF export failed:', err)
      setPdfExportProgress('Export failed')
      setTimeout(() => setPdfExportProgress(null), 3000)
    } finally {
      setExporting(false)
      setExportType(null)
    }
  }

  // ============================================
  // OTHER EXPORT HANDLERS
  // ============================================
  const handleExport = async (type) => {
    setExporting(true)
    setExportType(type)

    try {
      switch (type) {
        case 'text':
          const text = generateTextSummary()
          const blob = new Blob([text], { type: 'text/plain' })
          downloadBlob(blob, `${project.projectCode || 'ops-plan'}-${project.name || 'export'}.txt`)
          break

        case 'copy':
          const copyText = generateTextSummary()
          await navigator.clipboard.writeText(copyText)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
          break

        case 'json':
          const jsonData = {
            exportedAt: new Date().toISOString(),
            project: project
          }
          const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
          downloadBlob(jsonBlob, `${project.projectCode || 'project'}-backup.json`)
          break

        case 'html':
          const html = generateHTMLReport()
          const htmlBlob = new Blob([html], { type: 'text/html' })
          downloadBlob(htmlBlob, `${project.projectCode || 'ops-plan'}-${project.name || 'export'}.html`)
          break

        case 'print':
          window.print()
          break
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
      setExportType(null)
    }
  }

  // ============================================
  // COMPLETENESS CHECK (UPDATED FOR MULTI-SITE)
  // ============================================
  const completenessChecks = useMemo(() => {
    const checks = [
      { label: 'Project overview complete', ok: !!project.name && !!project.startDate },
      { label: 'Crew assigned', ok: project.crew?.length > 0 },
      { label: 'Flight plan configured', ok: !!project.flightPlan?.operationType || sites.some(s => s.flightPlan?.operationType) },
      { label: 'Risk assessment complete', ok: !!project.soraAssessment?.sail || sites.some(s => s.soraAssessment?.populationCategory) },
      { label: 'Emergency contacts set', ok: !!project.emergencyPlan?.primaryEmergencyContact?.name || !!project.emergencyPlan?.contacts?.length },
      { label: 'Project approved', ok: project.status === 'approved' }
    ]
    
    // Add multi-site specific checks
    if (isMultiSite) {
      const sitesWithBoundary = sites.filter(s => s.mapData?.siteSurvey?.operationsBoundary).length
      const sitesWithLaunch = sites.filter(s => s.mapData?.flightPlan?.launchPoint).length
      const sitesWithSORA = sites.filter(s => siteCalculations[s.id]?.sail).length
      
      checks.push({ 
        label: `Sites with boundaries (${sitesWithBoundary}/${sites.length})`, 
        ok: sitesWithBoundary === sites.length 
      })
      checks.push({ 
        label: `Sites with SORA (${sitesWithSORA}/${sites.length})`, 
        ok: sitesWithSORA === sites.length 
      })
    }
    
    return checks
  }, [project, sites, isMultiSite, siteCalculations])

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Completeness Check */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-aeria-blue" />
          Export Readiness
          {isMultiSite && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {sites.length} Sites
            </span>
          )}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {completenessChecks.map((check, i) => (
            <div 
              key={i}
              className={`flex items-center gap-2 p-2 rounded ${
                check.ok ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              {check.ok ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-sm ${check.ok ? 'text-green-800' : 'text-gray-500'}`}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Export Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileImage className="w-5 h-5 text-red-500" />
            PDF Export
          </h2>
          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Professional</span>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Generate branded PDF reports for clients and regulatory submissions.
        </p>
        
        {/* Multi-Site Selector */}
        {isMultiSite && (
          <MultiSiteSelector
            sites={sites}
            selectedSite={selectedSite}
            onSelect={setSelectedSite}
            calculations={siteCalculations}
          />
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pdfExportTypes.map((pdfType) => {
            const Icon = pdfType.icon
            const isDisabled = pdfType.conditional && !project[pdfType.conditional] && !sites.some(s => s[pdfType.conditional])
            const supportsMultiSite = pdfType.supportsMultiSite
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600',
              purple: 'bg-purple-100 text-purple-600',
              orange: 'bg-orange-100 text-orange-600',
              green: 'bg-green-100 text-green-600',
              cyan: 'bg-cyan-100 text-cyan-600',
              amber: 'bg-amber-100 text-amber-600'
            }
            
            return (
              <button
                key={pdfType.id}
                onClick={() => handlePDFExport(pdfType.id)}
                disabled={exporting || isDisabled}
                className={`p-4 border rounded-lg text-left transition-all ${
                  isDisabled 
                    ? 'border-gray-200 opacity-50 cursor-not-allowed' 
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${colorClasses[pdfType.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{pdfType.label}</span>
                    {isMultiSite && supportsMultiSite && (
                      <span className="ml-2 text-xs text-blue-600">Multi-site</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">{pdfType.description}</p>
                {isDisabled && (
                  <p className="text-xs text-gray-400 mt-2">Section not enabled</p>
                )}
                {exporting && exportType === pdfType.id && (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    <span className="text-xs text-red-600">{pdfExportProgress}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        {/* Branding indicator */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
          {branding?.operator?.logo ? (
            <img src={branding.operator.logo} alt="Logo" className="h-8 w-auto" />
          ) : (
            <div className="h-8 w-8 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-500">Logo</div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">{branding?.operator?.name || 'Your Company'}</p>
            <p className="text-xs text-gray-500">PDFs will be branded with your company identity</p>
          </div>
          <a href="/settings" className="text-xs text-aeria-blue hover:underline">Edit branding</a>
        </div>
      </div>

      {/* Section Selection */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-aeria-blue" />
          Export Sections
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-2 mb-4">
          {exportSections.map((section) => {
            const isConditional = section.conditional && !project.sections?.[section.id]
            
            return (
              <label 
                key={section.id}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                  isConditional ? 'opacity-50' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSections[section.id] && !isConditional}
                  onChange={() => toggleSection(section.id)}
                  disabled={isConditional}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <span className="text-sm text-gray-700">{section.label}</span>
                {isConditional && (
                  <span className="text-xs text-gray-400">(not enabled)</span>
                )}
              </label>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCoverPage}
              onChange={(e) => setIncludeCoverPage(e.target.checked)}
              className="w-4 h-4 text-aeria-navy rounded"
            />
            <span className="text-sm text-gray-700">Include cover page</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAppendices}
              onChange={(e) => setIncludeAppendices(e.target.checked)}
              className="w-4 h-4 text-aeria-navy rounded"
            />
            <span className="text-sm text-gray-700">Include appendices</span>
          </label>
        </div>
      </div>

      {/* Other Export Options */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-aeria-blue" />
          Other Export Formats
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* HTML Report */}
          <button
            onClick={() => handleExport('html')}
            disabled={exporting}
            className="p-4 border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">HTML Report</span>
            </div>
            <p className="text-sm text-gray-500">
              Formatted report viewable in any browser
            </p>
            {exporting && exportType === 'html' && (
              <Loader2 className="w-4 h-4 animate-spin mt-2" />
            )}
          </button>

          {/* Plain Text */}
          <button
            onClick={() => handleExport('text')}
            disabled={exporting}
            className="p-4 border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <File className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">Plain Text</span>
            </div>
            <p className="text-sm text-gray-500">
              Simple text file for printing or email
            </p>
            {exporting && exportType === 'text' && (
              <Loader2 className="w-4 h-4 animate-spin mt-2" />
            )}
          </button>

          {/* Copy to Clipboard */}
          <button
            onClick={() => handleExport('copy')}
            disabled={exporting}
            className="p-4 border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-green-600" />
                )}
              </div>
              <span className="font-medium text-gray-900">
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Copy summary to paste in email or document
            </p>
          </button>

          {/* JSON Export */}
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="p-4 border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">JSON Data</span>
            </div>
            <p className="text-sm text-gray-500">
              Full project data for backup or import
            </p>
            {exporting && exportType === 'json' && (
              <Loader2 className="w-4 h-4 animate-spin mt-2" />
            )}
          </button>

          {/* Print */}
          <button
            onClick={() => handleExport('print')}
            disabled={exporting}
            className="p-4 border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky transition-colors text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Printer className="w-5 h-5 text-amber-600" />
              </div>
              <span className="font-medium text-gray-900">Print</span>
            </div>
            <p className="text-sm text-gray-500">
              Print current view directly
            </p>
          </button>

          {/* Email (placeholder) */}
          <div className="p-4 border border-gray-200 rounded-lg opacity-50 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <span className="font-medium text-gray-500">Email</span>
            </div>
            <p className="text-sm text-gray-400">
              Coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Export Notes</h3>
            <p className="text-sm text-blue-700 mt-1">
              PDF exports include professional branding and are suitable for client delivery and regulatory submissions.
              Configure your company branding in Settings to customize the appearance of all exported documents.
              {isMultiSite && (
                <span className="block mt-1">
                  <strong>Multi-Site:</strong> Select "All Sites" to generate a comprehensive document, or choose a specific site for a focused report.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
