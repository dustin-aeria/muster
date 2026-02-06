/**
 * DocumentExportPanel.jsx
 * Panel for generating and exporting SFOC documents from SORA assessment
 *
 * @location src/components/sora/DocumentExportPanel.jsx
 */

import { useState } from 'react'
import {
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  FileWarning,
  Shield,
  Plane,
  BookOpen,
  X,
  Loader2
} from 'lucide-react'
import {
  generateConOpsPDF,
  generateSafetyPlanPDF,
  generateERPPDF,
  generateSORAReportPDF,
  saveSFOCDocument
} from '../../lib/sfocDocumentGenerator'
import {
  generateMPDPDF,
  generateMPDTemplatePDF,
  prefillMPDFromAssessment,
  saveMPDDocument
} from '../../lib/mpdDocumentGenerator'
import { mpdRequirementsBySAIL } from '../../lib/soraConfig'

/**
 * Document types available for export
 */
const DOCUMENT_TYPES = {
  conops: {
    id: 'conops',
    label: 'Concept of Operations (ConOps)',
    description: 'Detailed operation description per JARUS Annex A',
    icon: BookOpen,
    color: 'blue',
    requiredData: ['conops']
  },
  safetyPlan: {
    id: 'safetyPlan',
    label: 'Safety Plan',
    description: 'Safety management and risk mitigation documentation',
    icon: Shield,
    color: 'green',
    requiredData: ['groundRisk', 'airRisk', 'sail']
  },
  erp: {
    id: 'erp',
    label: 'Emergency Response Plan (ERP)',
    description: 'Emergency procedures and response protocols',
    icon: AlertCircle,
    color: 'red',
    requiredData: ['conops']
  },
  soraReport: {
    id: 'soraReport',
    label: 'SORA Assessment Report',
    description: 'Comprehensive SORA 2.5 assessment documentation',
    icon: FileText,
    color: 'purple',
    requiredData: ['conops', 'groundRisk', 'airRisk', 'sail']
  },
  mpd: {
    id: 'mpd',
    label: 'Manufacturer Performance Declaration',
    description: 'Designer/manufacturer compliance declaration',
    icon: Plane,
    color: 'orange',
    requiredData: ['sail', 'conops.uasDescription']
  },
  mpdTemplate: {
    id: 'mpdTemplate',
    label: 'MPD Template (Blank)',
    description: 'Blank template for manufacturer to complete',
    icon: FileWarning,
    color: 'gray',
    requiredData: []
  }
}

/**
 * Check if required data is present
 */
function checkDataAvailable(assessment, requiredData) {
  for (const path of requiredData) {
    const parts = path.split('.')
    let current = assessment
    for (const part of parts) {
      if (!current || !current[part]) return false
      current = current[part]
    }
  }
  return true
}

/**
 * Get color classes for document type
 */
function getColorClasses(color) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200'
  }
  return colors[color] || colors.gray
}

export default function DocumentExportPanel({
  assessment,
  osoStatuses = [],
  project = null,
  branding = null,
  onClose,
  isModal = true
}) {
  const [generating, setGenerating] = useState(null)
  const [results, setResults] = useState({})
  const [error, setError] = useState(null)

  const sail = assessment?.sail?.level

  /**
   * Generate a specific document
   */
  async function handleGenerate(docType) {
    setGenerating(docType)
    setError(null)

    try {
      let pdf
      let filename

      const options = {
        branding,
        project,
        osoStatuses,
        assessment
      }

      switch (docType) {
        case 'conops':
          pdf = await generateConOpsPDF(assessment, options)
          filename = saveSFOCDocument(pdf, 'conops', assessment.id)
          break

        case 'safetyPlan':
          pdf = await generateSafetyPlanPDF(assessment, options)
          filename = saveSFOCDocument(pdf, 'safetyPlan', assessment.id)
          break

        case 'erp':
          pdf = await generateERPPDF(assessment, options)
          filename = saveSFOCDocument(pdf, 'erp', assessment.id)
          break

        case 'soraReport':
          pdf = await generateSORAReportPDF(assessment, options)
          filename = saveSFOCDocument(pdf, 'soraReport', assessment.id)
          break

        case 'mpd':
          const mpdData = prefillMPDFromAssessment(assessment)
          pdf = await generateMPDPDF(mpdData, options)
          filename = saveMPDDocument(pdf, mpdData, 'declaration')
          break

        case 'mpdTemplate':
          pdf = await generateMPDTemplatePDF(sail || 'IV', { branding })
          filename = saveMPDDocument(pdf, { sail: sail || 'IV' }, 'template')
          break

        default:
          throw new Error(`Unknown document type: ${docType}`)
      }

      setResults(prev => ({
        ...prev,
        [docType]: { success: true, filename }
      }))
    } catch (err) {
      console.error(`Error generating ${docType}:`, err)
      setError(`Failed to generate ${DOCUMENT_TYPES[docType]?.label}: ${err.message}`)
      setResults(prev => ({
        ...prev,
        [docType]: { success: false, error: err.message }
      }))
    } finally {
      setGenerating(null)
    }
  }

  /**
   * Generate all documents
   */
  async function handleGenerateAll() {
    const docTypes = Object.keys(DOCUMENT_TYPES).filter(
      dt => dt !== 'mpdTemplate' && checkDataAvailable(assessment, DOCUMENT_TYPES[dt].requiredData)
    )

    for (const docType of docTypes) {
      await handleGenerate(docType)
    }
  }

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Download className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Documents</h3>
            <p className="text-sm text-gray-500">
              Generate SFOC application documents from this assessment
            </p>
          </div>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* SAIL Level Info */}
      {sail && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Assessment SAIL Level</p>
              <p className="text-xl font-bold text-gray-900">SAIL {sail}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">MPD Requirements</p>
              <p className="text-sm font-medium text-gray-700">
                {mpdRequirementsBySAIL[sail]?.declarationType || 'Standard'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Generation Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-3">
        {Object.values(DOCUMENT_TYPES).map((doc) => {
          const Icon = doc.icon
          const isAvailable = checkDataAvailable(assessment, doc.requiredData)
          const isGenerating = generating === doc.id
          const result = results[doc.id]

          return (
            <div
              key={doc.id}
              className={`p-4 rounded-lg border transition-colors ${
                isAvailable
                  ? getColorClasses(doc.color)
                  : 'bg-gray-50 text-gray-400 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{doc.label}</p>
                    <p className="text-xs opacity-75">{doc.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result?.success && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Saved
                    </span>
                  )}
                  <button
                    onClick={() => handleGenerate(doc.id)}
                    disabled={!isAvailable || isGenerating}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isAvailable
                        ? 'bg-white hover:bg-gray-50 border border-current/20'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        Export PDF
                      </span>
                    )}
                  </button>
                </div>
              </div>
              {!isAvailable && doc.requiredData.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  Complete the following sections first: {doc.requiredData.join(', ')}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Generate All Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleGenerateAll}
          disabled={generating !== null}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Documents...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Generate All Available Documents
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Documents will be downloaded as PDF files
        </p>
      </div>

      {/* MPD Information */}
      {sail && ['IV', 'V', 'VI'].includes(sail) && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Manufacturer Declaration Required
              </p>
              <p className="text-sm text-orange-700 mt-1">
                At SAIL {sail}, Transport Canada requires a Manufacturer Performance Declaration.
                {sail >= 'V' && ' Third-party verification may be required.'}
              </p>
              <p className="text-xs text-orange-600 mt-2">
                Contact: TC.RPASDeclaration-DeclarationSATP.TC@tc.gc.ca
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // If modal, wrap in modal structure
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            {content}
          </div>
        </div>
      </div>
    )
  }

  // Otherwise render inline
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {content}
    </div>
  )
}
