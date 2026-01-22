/**
 * FHAEditorModal.jsx
 * Modal for creating and editing Formal Hazard Assessments
 *
 * @location src/components/fha/FHAEditorModal.jsx
 */

import { useState, useEffect } from 'react'
import {
  X,
  Save,
  AlertTriangle,
  FileText,
  Calendar,
  Tag,
  Link2,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  FHA_CATEGORIES,
  FHA_STATUSES,
  LIKELIHOOD_RATINGS,
  SEVERITY_RATINGS,
  calculateRiskScore,
  getRiskLevel,
  createFormalHazard,
  updateFormalHazard
} from '../../lib/firestoreFHA'
import { RiskMatrixSelector } from './FHARiskMatrix'
import ControlMeasuresEditor from './ControlMeasuresEditor'

// Default empty FHA structure
const getEmptyFHA = () => ({
  title: '',
  fhaNumber: '',
  category: 'flight_ops',
  status: 'active',
  description: '',
  consequences: '',
  likelihood: 3,
  severity: 3,
  riskScore: 9,
  controlMeasures: [],
  residualLikelihood: 2,
  residualSeverity: 2,
  residualRiskScore: 4,
  keywords: [],
  regulatoryRefs: [],
  linkedFieldForms: [],
  reviewDate: null,
  notes: ''
})

/**
 * Section header with collapse functionality
 */
function SectionHeader({ title, icon: Icon, expanded, onToggle, badge }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full py-3 border-b border-gray-200"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-gray-500" />
        <span className="font-medium text-gray-900">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {badge}
          </span>
        )}
      </div>
      {expanded ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </button>
  )
}

/**
 * Keywords/Tags input
 */
function TagsInput({ value = [], onChange, placeholder = 'Add keyword...' }) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = input.trim().toLowerCase()
      if (tag && !value.includes(tag)) {
        onChange([...value, tag])
      }
      setInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    onChange(value.filter(t => t !== tagToRemove))
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg min-h-[42px]">
      {value.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-sm"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] border-none p-0 text-sm focus:outline-none focus:ring-0"
      />
    </div>
  )
}

/**
 * Main FHA Editor Modal
 */
export default function FHAEditorModal({
  isOpen,
  onClose,
  fha = null,
  onSave
}) {
  const { user } = useAuth()
  const [formData, setFormData] = useState(getEmptyFHA())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Expanded sections
  const [sections, setSections] = useState({
    basic: true,
    risk: true,
    controls: true,
    metadata: false
  })

  const isEditing = !!fha?.id

  // Initialize form with FHA data
  useEffect(() => {
    if (fha) {
      setFormData({
        ...getEmptyFHA(),
        ...fha,
        reviewDate: fha.reviewDate?.toDate?.() || fha.reviewDate || null
      })
    } else {
      setFormData(getEmptyFHA())
    }
  }, [fha])

  // Update risk scores when likelihood/severity change
  useEffect(() => {
    const riskScore = calculateRiskScore(formData.likelihood, formData.severity)
    const residualRiskScore = calculateRiskScore(formData.residualLikelihood, formData.residualSeverity)
    if (riskScore !== formData.riskScore || residualRiskScore !== formData.residualRiskScore) {
      setFormData(prev => ({
        ...prev,
        riskScore,
        residualRiskScore
      }))
    }
  }, [formData.likelihood, formData.severity, formData.residualLikelihood, formData.residualSeverity])

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRiskChange = (type, { likelihood, severity }) => {
    if (type === 'initial') {
      setFormData(prev => ({
        ...prev,
        likelihood,
        severity,
        riskScore: likelihood * severity
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        residualLikelihood: likelihood,
        residualSeverity: severity,
        residualRiskScore: likelihood * severity
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.title?.trim()) {
        throw new Error('Title is required')
      }
      if (!formData.fhaNumber?.trim()) {
        throw new Error('FHA Number is required')
      }

      // Prepare data for save
      const dataToSave = {
        ...formData,
        title: formData.title.trim(),
        fhaNumber: formData.fhaNumber.trim(),
        description: formData.description?.trim() || '',
        consequences: formData.consequences?.trim() || ''
      }

      let savedFHA
      if (isEditing) {
        savedFHA = await updateFormalHazard(fha.id, dataToSave)
      } else {
        savedFHA = await createFormalHazard(dataToSave, user.uid)
      }

      onSave?.(savedFHA)
      onClose()
    } catch (err) {
      console.error('Error saving FHA:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const initialRisk = getRiskLevel(formData.riskScore)
  const residualRisk = getRiskLevel(formData.residualRiskScore)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-16">
        <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Formal Hazard Assessment' : 'Create New FHA'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isEditing ? `Editing ${fha.fhaNumber}` : 'Define a new hazard and its controls'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4">
              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Basic Information Section */}
              <div>
                <SectionHeader
                  title="Basic Information"
                  icon={FileText}
                  expanded={sections.basic}
                  onToggle={() => toggleSection('basic')}
                />
                {sections.basic && (
                  <div className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          FHA Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.fhaNumber}
                          onChange={(e) => handleChange('fhaNumber', e.target.value)}
                          placeholder="e.g., FHA-001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => handleChange('category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {FHA_CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hazard Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Brief description of the hazard"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Detailed description of the hazard..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Potential Consequences
                      </label>
                      <textarea
                        value={formData.consequences}
                        onChange={(e) => handleChange('consequences', e.target.value)}
                        placeholder="What could happen if this hazard is not controlled..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => handleChange('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {FHA_STATUSES.map(status => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Review Date
                        </label>
                        <input
                          type="date"
                          value={formData.reviewDate ? new Date(formData.reviewDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleChange('reviewDate', e.target.value ? new Date(e.target.value) : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Risk Assessment Section */}
              <div>
                <SectionHeader
                  title="Risk Assessment"
                  icon={AlertTriangle}
                  expanded={sections.risk}
                  onToggle={() => toggleSection('risk')}
                  badge={`Initial: ${initialRisk.level} → Residual: ${residualRisk.level}`}
                />
                {sections.risk && (
                  <div className="pt-4 space-y-6">
                    {/* Initial Risk */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Initial Risk (Before Controls)</h5>
                      <RiskMatrixSelector
                        likelihood={formData.likelihood}
                        severity={formData.severity}
                        onChange={(values) => handleRiskChange('initial', values)}
                        label={null}
                      />
                    </div>

                    {/* Residual Risk */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Residual Risk (After Controls)</h5>
                      <RiskMatrixSelector
                        likelihood={formData.residualLikelihood}
                        severity={formData.residualSeverity}
                        onChange={(values) => handleRiskChange('residual', values)}
                        label={null}
                      />
                    </div>

                    {/* Risk reduction summary */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Risk Reduction:</span>
                        <span className={`font-medium ${
                          formData.riskScore - formData.residualRiskScore > 0
                            ? 'text-green-600'
                            : formData.riskScore - formData.residualRiskScore < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}>
                          {formData.riskScore} → {formData.residualRiskScore}
                          {formData.riskScore - formData.residualRiskScore > 0 && (
                            <span className="ml-2">
                              (-{formData.riskScore - formData.residualRiskScore} points)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Control Measures Section */}
              <div>
                <SectionHeader
                  title="Control Measures"
                  icon={Tag}
                  expanded={sections.controls}
                  onToggle={() => toggleSection('controls')}
                  badge={formData.controlMeasures?.length || 0}
                />
                {sections.controls && (
                  <div className="pt-4">
                    <ControlMeasuresEditor
                      controlMeasures={formData.controlMeasures || []}
                      onChange={(controls) => handleChange('controlMeasures', controls)}
                    />
                  </div>
                )}
              </div>

              {/* Metadata Section */}
              <div>
                <SectionHeader
                  title="Keywords & References"
                  icon={Link2}
                  expanded={sections.metadata}
                  onToggle={() => toggleSection('metadata')}
                />
                {sections.metadata && (
                  <div className="pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Keywords
                      </label>
                      <TagsInput
                        value={formData.keywords || []}
                        onChange={(tags) => handleChange('keywords', tags)}
                        placeholder="Add keywords for search..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Press Enter or comma to add a keyword
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Regulatory References
                      </label>
                      <TagsInput
                        value={formData.regulatoryRefs || []}
                        onChange={(tags) => handleChange('regulatoryRefs', tags)}
                        placeholder="Add regulatory references..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        e.g., CARs 901.01, OSHA 1910.134
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Any additional notes or comments..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Update FHA' : 'Create FHA'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
