/**
 * Project Proposal Generator Component
 * Generate and export professional client proposals
 *
 * @location src/components/projects/ProjectProposal.jsx
 */

import { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  Building2,
  Target,
  Shield,
  Package,
  Users,
  CheckSquare,
  Calendar,
  DollarSign,
  FileCheck,
  Copy,
  Check,
  Loader2
} from 'lucide-react'
import {
  PROPOSAL_TEMPLATES,
  PROPOSAL_SECTIONS,
  generateProposal,
  exportProposalToPdf
} from '../../lib/proposalGenerator'
import { calculateProjectCost } from '../../lib/costEstimator'
import { getEquipment } from '../../lib/firestore'

const SECTION_ICONS = {
  executive_summary: FileText,
  company_overview: Building2,
  scope: Target,
  methodology: Settings,
  safety: Shield,
  equipment: Package,
  personnel: Users,
  deliverables: CheckSquare,
  timeline: Calendar,
  pricing: DollarSign,
  terms: FileCheck
}

export default function ProjectProposal({ project }) {
  const [template, setTemplate] = useState('standard')
  const [showPreview, setShowPreview] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [equipment, setEquipment] = useState([])

  // Company settings
  const [companySettings, setCompanySettings] = useState({
    companyName: 'Aeria Operations',
    companyDescription: 'A leading provider of professional drone services specializing in aerial imaging, mapping, and inspection services.',
    certifications: [
      'Transport Canada RPAS Certification',
      'Advanced Operations Certificate',
      'Comprehensive Liability Insurance'
    ],
    experience: 'With years of experience in the drone services industry, we have successfully completed hundreds of projects across various sectors.'
  })

  // Pricing settings
  const [pricingSettings, setPricingSettings] = useState({
    showBreakdown: true,
    estimatedHours: 8,
    includeOverhead: true,
    overheadPercent: 15
  })

  const [proposalContent, setProposalContent] = useState('')

  // Load equipment for cost calculations
  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const data = await getEquipment()
        setEquipment(data)
      } catch (err) {
        // Non-critical - equipment costs will be skipped
      }
    }
    loadEquipment()
  }, [])

  // Generate proposal preview
  useEffect(() => {
    if (showPreview) {
      generatePreview()
    }
  }, [showPreview, template, companySettings, pricingSettings, project])

  const generatePreview = () => {
    let costBreakdown = null

    if (pricingSettings.showBreakdown) {
      costBreakdown = calculateProjectCost(project, equipment, [], {
        estimatedHours: pricingSettings.estimatedHours,
        includeOverhead: pricingSettings.includeOverhead,
        overheadPercent: pricingSettings.overheadPercent
      })
    }

    const content = generateProposal(project, {
      template,
      ...companySettings,
      equipment,
      costBreakdown,
      showPricingBreakdown: pricingSettings.showBreakdown
    })

    setProposalContent(content)
  }

  const handleExportPdf = async () => {
    setIsGenerating(true)
    try {
      generatePreview() // Ensure content is up to date
      await exportProposalToPdf(
        proposalContent,
        `${project.name?.replace(/[^a-z0-9]/gi, '_') || 'proposal'}_proposal.pdf`
      )
    } catch (err) {
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyMarkdown = async () => {
    generatePreview()
    try {
      await navigator.clipboard.writeText(proposalContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = proposalContent
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const templateConfig = PROPOSAL_TEMPLATES[template]

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposal Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(PROPOSAL_TEMPLATES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setTemplate(key)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                template === key
                  ? 'border-aeria-navy bg-aeria-sky/30'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="font-medium text-gray-900">{config.label}</div>
              <p className="text-sm text-gray-500 mt-1">{config.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {config.sections.slice(0, 4).map(section => (
                  <span
                    key={section}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {PROPOSAL_SECTIONS[section]?.label}
                  </span>
                ))}
                {config.sections.length > 4 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    +{config.sections.length - 4} more
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="card">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between text-lg font-semibold text-gray-900"
        >
          <span className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Customize Proposal
          </span>
          {showSettings ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showSettings && (
          <div className="mt-4 space-y-6">
            {/* Company Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Company Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companySettings.companyName}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certifications (one per line)
                  </label>
                  <textarea
                    value={companySettings.certifications.join('\n')}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      certifications: e.target.value.split('\n').filter(c => c.trim())
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Description
                  </label>
                  <textarea
                    value={companySettings.companyDescription}
                    onChange={(e) => setCompanySettings({ ...companySettings, companyDescription: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Settings */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pricing Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pricingSettings.showBreakdown}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, showBreakdown: e.target.checked })}
                    className="rounded border-gray-300 text-aeria-navy focus:ring-aeria-navy"
                  />
                  <span className="text-sm text-gray-700">Show cost breakdown</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pricingSettings.includeOverhead}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, includeOverhead: e.target.checked })}
                    className="rounded border-gray-300 text-aeria-navy focus:ring-aeria-navy"
                  />
                  <span className="text-sm text-gray-700">Include overhead</span>
                </label>
                {pricingSettings.includeOverhead && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Overhead %:</label>
                    <input
                      type="number"
                      value={pricingSettings.overheadPercent}
                      onChange={(e) => setPricingSettings({ ...pricingSettings, overheadPercent: parseInt(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sections Preview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Included Sections</h3>
        <div className="flex flex-wrap gap-2">
          {templateConfig.sections.map(sectionId => {
            const config = PROPOSAL_SECTIONS[sectionId]
            const Icon = SECTION_ICONS[sectionId] || FileText
            return (
              <div
                key={sectionId}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
              >
                <Icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{config?.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Preview Proposal'}
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="btn-secondary flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy as Markdown'}
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isGenerating}
            className="btn-primary flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposal Preview</h3>
          <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
              {proposalContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
