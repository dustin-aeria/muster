/**
 * DeclarationGenerator.jsx
 * Main component for generating Safety Assurance Declaration documents
 *
 * Features:
 * - Submission readiness checklist
 * - Document preview with multiple sections
 * - PDF/DOCX export functionality
 * - Form 26-0882E auto-population
 * - Compliance matrix generation
 *
 * @location src/components/safetyDeclaration/DeclarationGenerator.jsx
 */

import { useState, useMemo } from 'react'
import {
  FileText,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Mail,
  FileCheck,
  ClipboardList,
  TestTube,
  Plane,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  FileSpreadsheet,
  X
} from 'lucide-react'
import {
  DECLARATION_TYPES,
  DECLARATION_STATUSES,
  REQUIREMENT_SECTIONS,
  COMPLIANCE_METHODS,
  KINETIC_ENERGY_CATEGORIES,
  RPAS_CATEGORIES,
  EVIDENCE_TYPES,
  RELIABILITY_TARGETS
} from '../../lib/firestoreSafetyDeclaration'
import { exportToPDF, exportToMarkdown, exportToDocx } from '../../lib/documentExportService'

export default function DeclarationGenerator({
  declaration,
  requirements = [],
  sessions = [],
  evidence = [],
  stats = null
}) {
  const [activeSection, setActiveSection] = useState('checklist')
  const [exporting, setExporting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewSection, setPreviewSection] = useState(null)

  // Calculate readiness
  const readiness = useMemo(() => {
    const checks = []

    // Check: All requirements have a status
    const notStartedReqs = requirements.filter(r => r.status === 'not_started')
    checks.push({
      id: 'requirements_addressed',
      label: 'All requirements addressed',
      description: `${requirements.length - notStartedReqs.length} of ${requirements.length} requirements have been reviewed`,
      passed: notStartedReqs.length === 0,
      blocking: true,
      count: `${requirements.length - notStartedReqs.length}/${requirements.length}`
    })

    // Check: Requirements completion
    const applicableReqs = requirements.filter(r => r.status !== 'not_applicable')
    const completeReqs = requirements.filter(r => r.status === 'complete')
    const completionPct = applicableReqs.length > 0
      ? Math.round((completeReqs.length / applicableReqs.length) * 100)
      : 100
    checks.push({
      id: 'requirements_complete',
      label: 'Requirements marked complete',
      description: `${completeReqs.length} of ${applicableReqs.length} applicable requirements complete`,
      passed: completionPct === 100,
      blocking: true,
      count: `${completionPct}%`
    })

    // Check: Compliance methods specified
    const reqsWithMethods = requirements.filter(r => r.status !== 'not_applicable' && r.complianceMethod)
    checks.push({
      id: 'compliance_methods',
      label: 'Compliance methods specified',
      description: `${reqsWithMethods.length} of ${applicableReqs.length} requirements have compliance methods`,
      passed: reqsWithMethods.length === applicableReqs.length,
      blocking: false,
      count: `${reqsWithMethods.length}/${applicableReqs.length}`
    })

    // Check: Evidence linked
    const reqsNeedingEvidence = requirements.filter(r =>
      r.status !== 'not_applicable' && r.testable
    )
    const reqsWithEvidence = reqsNeedingEvidence.filter(r =>
      r.evidenceIds && r.evidenceIds.length > 0
    )
    checks.push({
      id: 'evidence_linked',
      label: 'Evidence linked to testable requirements',
      description: `${reqsWithEvidence.length} of ${reqsNeedingEvidence.length} testable requirements have evidence`,
      passed: reqsWithEvidence.length === reqsNeedingEvidence.length,
      blocking: true,
      count: `${reqsWithEvidence.length}/${reqsNeedingEvidence.length}`
    })

    // Check: Testing sessions complete
    const completedTests = sessions.filter(s => s.status === 'complete')
    const scheduledTests = sessions.filter(s => s.status === 'scheduled')
    checks.push({
      id: 'testing_complete',
      label: 'Testing sessions complete',
      description: `${completedTests.length} complete, ${scheduledTests.length} scheduled`,
      passed: scheduledTests.length === 0 && completedTests.length > 0,
      blocking: false,
      count: `${completedTests.length}/${sessions.length}`
    })

    // Check: Declarant information
    const hasDeclarant = declaration?.declarantInfo?.name && declaration?.declarantInfo?.email
    checks.push({
      id: 'declarant_info',
      label: 'Declarant information complete',
      description: hasDeclarant ? 'Name and contact information provided' : 'Missing declarant name or email',
      passed: hasDeclarant,
      blocking: true
    })

    // Check: RPAS details
    const hasRpasDetails = declaration?.rpasDetails?.manufacturer &&
      declaration?.rpasDetails?.model &&
      declaration?.rpasDetails?.weightKg
    checks.push({
      id: 'rpas_details',
      label: 'RPAS system details complete',
      description: hasRpasDetails ? 'Manufacturer, model, and specifications provided' : 'Missing RPAS details',
      passed: hasRpasDetails,
      blocking: true
    })

    const blockingFailed = checks.filter(c => c.blocking && !c.passed).length
    const totalPassed = checks.filter(c => c.passed).length
    const isReady = blockingFailed === 0

    return { checks, blockingFailed, totalPassed, isReady }
  }, [declaration, requirements, sessions, evidence])

  // Generate document sections for export
  const generateDocumentSections = () => {
    const sections = []

    // Section 1: Declaration Statement
    sections.push({
      title: 'Declaration Statement',
      content: generateDeclarationStatement()
    })

    // Section 2: RPAS System Description
    sections.push({
      title: 'RPAS System Description',
      content: generateRPASDescription()
    })

    // Section 3: Operations Summary
    sections.push({
      title: 'Operations Summary',
      content: generateOperationsSummary()
    })

    // Section 4: Compliance Matrix
    sections.push({
      title: 'Compliance Matrix',
      content: generateComplianceMatrix()
    })

    // Section 5: Test Summary
    sections.push({
      title: 'Test Summary',
      content: generateTestSummary()
    })

    // Section 6: Evidence Summary
    sections.push({
      title: 'Evidence Summary',
      content: generateEvidenceSummary()
    })

    return sections
  }

  const generateDeclarationStatement = () => {
    const typeInfo = DECLARATION_TYPES[declaration?.declarationType] || DECLARATION_TYPES.declaration
    const lines = []

    lines.push(`## ${typeInfo.label}`)
    lines.push('')
    lines.push(`I, **${declaration?.declarantInfo?.name || '[Name]'}**, representing **${declaration?.declarantInfo?.organization || '[Organization]'}**, hereby declare that:`)
    lines.push('')
    lines.push(`The RPAS system described herein (**${declaration?.rpasDetails?.manufacturer || ''} ${declaration?.rpasDetails?.model || ''}**) has been evaluated for compliance with Transport Canada Standard 922 requirements applicable to the intended operations.`)
    lines.push('')
    lines.push('This declaration is made in accordance with:')
    lines.push('- Canadian Aviation Regulations (CARs) Part IX')
    lines.push('- Transport Canada Standard 922 - RPAS Safety Assurance')
    lines.push('- Advisory Circular AC 922-001')
    lines.push('')
    lines.push('### Intended Operations')
    lines.push('')

    if (declaration?.operationTypes?.length > 0) {
      declaration.operationTypes.forEach(op => {
        lines.push(`- ${op.replace(/_/g, ' ')}`)
      })
    } else {
      lines.push('- [Operations not specified]')
    }

    lines.push('')
    lines.push('### Applicable Standards')
    lines.push('')

    if (declaration?.applicableStandards?.length > 0) {
      declaration.applicableStandards.forEach(std => {
        const section = REQUIREMENT_SECTIONS[std]
        lines.push(`- **${std}**: ${section?.title || 'Unknown'}`)
      })
    }

    lines.push('')
    lines.push('### Declarant Contact')
    lines.push('')
    lines.push(`- **Name:** ${declaration?.declarantInfo?.name || '-'}`)
    lines.push(`- **Organization:** ${declaration?.declarantInfo?.organization || '-'}`)
    lines.push(`- **Email:** ${declaration?.declarantInfo?.email || '-'}`)
    lines.push(`- **Phone:** ${declaration?.declarantInfo?.phone || '-'}`)

    return lines.join('\n')
  }

  const generateRPASDescription = () => {
    const rpas = declaration?.rpasDetails || {}
    const categoryInfo = RPAS_CATEGORIES[rpas.category] || {}
    const keInfo = KINETIC_ENERGY_CATEGORIES[rpas.kineticEnergyCategory] || {}

    const lines = []
    lines.push('## System Identification')
    lines.push('')
    lines.push(`| Property | Value |`)
    lines.push(`|----------|-------|`)
    lines.push(`| Manufacturer | ${rpas.manufacturer || '-'} |`)
    lines.push(`| Model | ${rpas.model || '-'} |`)
    lines.push(`| Serial Number | ${rpas.serialNumber || '-'} |`)
    lines.push('')
    lines.push('## Physical Characteristics')
    lines.push('')
    lines.push(`| Property | Value |`)
    lines.push(`|----------|-------|`)
    lines.push(`| Weight | ${rpas.weightKg || '-'} kg |`)
    lines.push(`| Weight Category | ${categoryInfo.label || '-'} |`)
    lines.push(`| Max Velocity | ${rpas.maxVelocityMs || '-'} m/s |`)
    lines.push(`| Max Kinetic Energy | ${rpas.maxKineticEnergy || '-'} J |`)
    lines.push(`| KE Category | ${keInfo.label || '-'} |`)
    lines.push('')
    lines.push('## Safety Configuration')
    lines.push('')
    lines.push(`| Property | Value |`)
    lines.push(`|----------|-------|`)
    lines.push(`| Robustness Level | ${(declaration?.robustnessLevel || 'low').toUpperCase()} |`)
    lines.push(`| Declaration Type | ${DECLARATION_TYPES[declaration?.declarationType]?.label || '-'} |`)

    if (rpas.description) {
      lines.push('')
      lines.push('## Additional Description')
      lines.push('')
      lines.push(rpas.description)
    }

    return lines.join('\n')
  }

  const generateOperationsSummary = () => {
    const lines = []
    lines.push('## Intended Operation Types')
    lines.push('')

    if (declaration?.operationTypes?.length > 0) {
      declaration.operationTypes.forEach(opType => {
        lines.push(`### ${opType.replace(/_/g, ' ')}`)
        lines.push('')
      })
    } else {
      lines.push('No operation types specified.')
    }

    lines.push('')
    lines.push('## Operational Limitations')
    lines.push('')
    lines.push('The following operational limitations apply based on the safety analysis:')
    lines.push('')
    lines.push('- Operations must be conducted within the demonstrated environmental envelope')
    lines.push('- All pre-flight and post-flight checklists must be completed')
    lines.push('- Maintenance intervals as specified by the manufacturer must be followed')

    return lines.join('\n')
  }

  const generateComplianceMatrix = () => {
    const lines = []
    lines.push('## Requirements Compliance Summary')
    lines.push('')

    // Group by section
    const bySection = {}
    requirements.forEach(req => {
      if (!bySection[req.sectionId]) {
        bySection[req.sectionId] = []
      }
      bySection[req.sectionId].push(req)
    })

    Object.entries(bySection).forEach(([sectionId, reqs]) => {
      const section = REQUIREMENT_SECTIONS[sectionId]
      lines.push(`### ${sectionId}: ${section?.title || 'Unknown'}`)
      lines.push('')
      lines.push(`| Requirement | Status | Method | Evidence |`)
      lines.push(`|-------------|--------|--------|----------|`)

      reqs.forEach(req => {
        const status = req.status === 'complete' ? 'PASS' :
          req.status === 'not_applicable' ? 'N/A' :
          req.status === 'in_progress' ? 'IN PROGRESS' : 'PENDING'
        const method = req.complianceMethod ?
          COMPLIANCE_METHODS[req.complianceMethod]?.label || req.complianceMethod : '-'
        const evidenceCount = req.evidenceIds?.length || 0

        lines.push(`| ${req.requirementId} | ${status} | ${method} | ${evidenceCount} items |`)
      })
      lines.push('')
    })

    // Summary stats
    const total = requirements.length
    const complete = requirements.filter(r => r.status === 'complete').length
    const na = requirements.filter(r => r.status === 'not_applicable').length
    const applicable = total - na

    lines.push('## Summary Statistics')
    lines.push('')
    lines.push(`- **Total Requirements:** ${total}`)
    lines.push(`- **Applicable:** ${applicable}`)
    lines.push(`- **Complete:** ${complete}`)
    lines.push(`- **Completion Rate:** ${applicable > 0 ? Math.round((complete / applicable) * 100) : 100}%`)

    return lines.join('\n')
  }

  const generateTestSummary = () => {
    const lines = []
    lines.push('## Testing Campaign Summary')
    lines.push('')

    const completed = sessions.filter(s => s.status === 'complete')
    const totalHours = completed.reduce((sum, s) => sum + (s.totalDurationMinutes || 0), 0) / 60

    lines.push(`| Metric | Value |`)
    lines.push(`|--------|-------|`)
    lines.push(`| Total Sessions | ${sessions.length} |`)
    lines.push(`| Completed | ${completed.length} |`)
    lines.push(`| Total Test Hours | ${totalHours.toFixed(1)} |`)
    lines.push('')

    if (completed.length > 0) {
      lines.push('## Completed Test Sessions')
      lines.push('')

      completed.forEach(session => {
        lines.push(`### ${session.name}`)
        lines.push('')
        lines.push(`- **Test Type:** ${session.testType?.replace(/_/g, ' ') || '-'}`)
        lines.push(`- **Date:** ${session.actualStartTime?.toLocaleDateString() || session.scheduledDate || '-'}`)
        lines.push(`- **Duration:** ${session.totalDurationMinutes || 0} minutes`)
        lines.push(`- **Result:** ${session.results?.passed === true ? 'PASS' : session.results?.passed === false ? 'FAIL' : 'Not recorded'}`)

        if (session.results?.summary) {
          lines.push(`- **Summary:** ${session.results.summary}`)
        }

        if (session.linkedRequirements?.length > 0) {
          lines.push(`- **Linked Requirements:** ${session.linkedRequirements.join(', ')}`)
        }
        lines.push('')
      })
    }

    return lines.join('\n')
  }

  const generateEvidenceSummary = () => {
    const lines = []
    lines.push('## Evidence Package Contents')
    lines.push('')
    lines.push(`Total evidence items: **${evidence.length}**`)
    lines.push('')

    // Group by type
    const byType = {}
    evidence.forEach(ev => {
      if (!byType[ev.type]) {
        byType[ev.type] = []
      }
      byType[ev.type].push(ev)
    })

    if (Object.keys(byType).length > 0) {
      lines.push('### Evidence by Type')
      lines.push('')
      lines.push(`| Type | Count |`)
      lines.push(`|------|-------|`)

      Object.entries(byType).forEach(([type, items]) => {
        const typeInfo = EVIDENCE_TYPES[type] || { label: type }
        lines.push(`| ${typeInfo.label} | ${items.length} |`)
      })
      lines.push('')

      lines.push('### Evidence Index')
      lines.push('')
      lines.push(`| # | Name | Type | Linked Requirements |`)
      lines.push(`|---|------|------|---------------------|`)

      evidence.forEach((ev, idx) => {
        const typeInfo = EVIDENCE_TYPES[ev.type] || { label: ev.type }
        const linkedReqs = ev.linkedRequirements?.length > 0
          ? ev.linkedRequirements.map(id => {
              const req = requirements.find(r => r.id === id)
              return req?.requirementId || id
            }).join(', ')
          : '-'
        lines.push(`| ${idx + 1} | ${ev.name} | ${typeInfo.label} | ${linkedReqs} |`)
      })
    }

    return lines.join('\n')
  }

  // Handle exports
  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const sections = generateDocumentSections()
      const document = {
        title: `Safety Declaration - ${declaration?.name || 'Untitled'}`,
        type: 'safety_declaration',
        version: '1.0',
        status: readiness.isReady ? 'Ready for Submission' : 'Draft',
        sections
      }

      const project = {
        name: declaration?.name,
        clientName: declaration?.declarantInfo?.organization
      }

      await exportToPDF(document, project)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleExportMarkdown = async () => {
    setExporting(true)
    try {
      const sections = generateDocumentSections()
      const document = {
        title: `Safety Declaration - ${declaration?.name || 'Untitled'}`,
        type: 'safety_declaration',
        version: '1.0',
        status: readiness.isReady ? 'Ready for Submission' : 'Draft',
        sections
      }

      const project = {
        name: declaration?.name,
        clientName: declaration?.declarantInfo?.organization
      }

      exportToMarkdown(document, project)
    } catch (error) {
      console.error('Error exporting Markdown:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleExportDocx = async () => {
    setExporting(true)
    try {
      const sections = generateDocumentSections()
      const document = {
        title: `Safety Declaration - ${declaration?.name || 'Untitled'}`,
        type: 'safety_declaration',
        version: '1.0',
        status: readiness.isReady ? 'Ready for Submission' : 'Draft',
        sections
      }

      const project = {
        name: declaration?.name,
        clientName: declaration?.declarantInfo?.organization
      }

      exportToDocx(document, project)
    } catch (error) {
      console.error('Error exporting DOCX:', error)
    } finally {
      setExporting(false)
    }
  }

  // Preview Modal
  const PreviewModal = ({ section, onClose }) => {
    const content = section === 'declaration' ? generateDeclarationStatement() :
      section === 'rpas' ? generateRPASDescription() :
      section === 'operations' ? generateOperationsSummary() :
      section === 'compliance' ? generateComplianceMatrix() :
      section === 'testing' ? generateTestSummary() :
      section === 'evidence' ? generateEvidenceSummary() : ''

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Document Preview</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                  {content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const documentSections = [
    { id: 'declaration', label: 'Declaration Statement', icon: FileCheck, description: 'Official declaration with signatures' },
    { id: 'rpas', label: 'RPAS Description', icon: Plane, description: 'System specifications and characteristics' },
    { id: 'operations', label: 'Operations Summary', icon: FileText, description: 'Intended operations and limitations' },
    { id: 'compliance', label: 'Compliance Matrix', icon: ClipboardList, description: 'Requirements and compliance status' },
    { id: 'testing', label: 'Test Summary', icon: TestTube, description: 'Testing campaign results' },
    { id: 'evidence', label: 'Evidence Index', icon: FileSpreadsheet, description: 'Evidence package contents' }
  ]

  return (
    <div className="space-y-6">
      {/* Readiness Status Banner */}
      <div className={`rounded-lg p-4 ${
        readiness.isReady
          ? 'bg-green-50 border border-green-200'
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center gap-3">
          {readiness.isReady ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          )}
          <div>
            <h3 className={`font-medium ${readiness.isReady ? 'text-green-800' : 'text-yellow-800'}`}>
              {readiness.isReady ? 'Ready for Submission' : 'Not Ready for Submission'}
            </h3>
            <p className={`text-sm ${readiness.isReady ? 'text-green-600' : 'text-yellow-600'}`}>
              {readiness.isReady
                ? 'All required items complete. You can generate the declaration package.'
                : `${readiness.blockingFailed} blocking item${readiness.blockingFailed !== 1 ? 's' : ''} need${readiness.blockingFailed === 1 ? 's' : ''} attention`}
            </p>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveSection('checklist')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeSection === 'checklist'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Submission Checklist
        </button>
        <button
          onClick={() => setActiveSection('documents')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeSection === 'documents'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Document Sections
        </button>
        <button
          onClick={() => setActiveSection('export')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeSection === 'export'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Export Package
        </button>
      </div>

      {/* Checklist Section */}
      {activeSection === 'checklist' && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Pre-Submission Checklist</h3>
          <p className="text-sm text-gray-500">
            Complete all blocking items before generating the declaration package.
          </p>

          <div className="space-y-2 mt-4">
            {readiness.checks.map((check) => (
              <div
                key={check.id}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  check.passed
                    ? 'bg-green-50 border-green-200'
                    : check.blocking
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                {check.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : check.blocking ? (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${
                      check.passed ? 'text-green-800' : check.blocking ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {check.label}
                      {check.blocking && !check.passed && (
                        <span className="ml-2 text-xs font-normal px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                          Required
                        </span>
                      )}
                    </p>
                    {check.count && (
                      <span className={`text-sm font-medium ${
                        check.passed ? 'text-green-600' : check.blocking ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {check.count}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    check.passed ? 'text-green-600' : check.blocking ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {check.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Section */}
      {activeSection === 'documents' && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Declaration Package Contents</h3>
          <p className="text-sm text-gray-500">
            Review each section before generating the final package.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {documentSections.map((section) => (
              <div
                key={section.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <section.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{section.label}</h4>
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                    <button
                      onClick={() => setPreviewSection(section.id)}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Section */}
      {activeSection === 'export' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900">Export Declaration Package</h3>
            <p className="text-sm text-gray-500">
              Generate and download the complete declaration package in your preferred format.
            </p>
          </div>

          {!readiness.isReady && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800">Declaration not ready</p>
                  <p className="text-sm text-yellow-600">
                    You can still export a draft package, but it will be marked as incomplete.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PDF Export */}
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="font-medium text-gray-900">PDF Document</h4>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Formatted PDF with cover page and table of contents
              </p>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export PDF
              </button>
            </div>

            {/* Word Export */}
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Word Document</h4>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Editable HTML file compatible with Word
              </p>
              <button
                onClick={handleExportDocx}
                disabled={exporting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export Word
              </button>
            </div>

            {/* Markdown Export */}
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <h4 className="font-medium text-gray-900">Markdown</h4>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                Plain text markdown for version control
              </p>
              <button
                onClick={handleExportMarkdown}
                disabled={exporting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export Markdown
              </button>
            </div>
          </div>

          {/* Transport Canada Submission Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Transport Canada Submission
            </h4>
            <p className="text-sm text-blue-600 mt-2">
              After exporting, submit your declaration package to Transport Canada via:
            </p>
            <p className="text-sm font-medium text-blue-800 mt-2">
              TC.RPASDeclaration-DeclarationSATP.TC@tc.gc.ca
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Include: Completed Form 26-0882E, Declaration Package PDF, and supporting evidence files.
            </p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewSection && (
        <PreviewModal
          section={previewSection}
          onClose={() => setPreviewSection(null)}
        />
      )}
    </div>
  )
}
