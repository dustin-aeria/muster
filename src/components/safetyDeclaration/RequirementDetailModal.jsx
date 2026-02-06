/**
 * Requirement Detail Modal Component
 * AI-powered modal for viewing and understanding CAR 922 requirements
 *
 * Features:
 * - "Explain this requirement" button with AI interpretation
 * - Compliance method suggestions based on user context
 * - Example evidence for similar declarations
 * - Common pitfall warnings
 * - Integration with RequirementWalkthrough
 *
 * @location src/components/safetyDeclaration/RequirementDetailModal.jsx
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  X,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Target,
  Search,
  Calculator,
  FlaskConical,
  History,
  HelpCircle,
  ClipboardCheck,
  Info,
  ArrowRight,
  Shield,
  Save,
  Eye,
  Clock,
  Circle
} from 'lucide-react'
import {
  updateRequirement,
  REQUIREMENT_STATUSES,
  COMPLIANCE_METHODS as FIRESTORE_COMPLIANCE_METHODS,
  REQUIREMENT_SECTIONS,
  KINETIC_ENERGY_CATEGORIES,
  RELIABILITY_TARGETS
} from '../../lib/firestoreSafetyDeclaration'
import {
  REQUIREMENT_GUIDANCE,
  SECTION_GUIDANCE,
  COMPLIANCE_METHODS,
  getGuidance,
  getSectionGuidance
} from '../../lib/requirementGuidance'
import { useSafetyDeclarationAI } from '../../lib/safetyDeclarationAI'
import { RequirementWalkthrough } from './RequirementWalkthrough'

// ============================================
// Compliance Method Icons
// ============================================

const COMPLIANCE_METHOD_ICONS = {
  inspection: Search,
  analysis: Calculator,
  test: FlaskConical,
  service_experience: History
}

// ============================================
// Main Modal Component
// ============================================

export default function RequirementDetailModal({
  isOpen,
  onClose,
  requirement,
  declarationId,
  declaration,
  onSave
}) {
  // Form state (for backwards compatibility)
  const [formData, setFormData] = useState({
    status: 'not_started',
    complianceMethod: null,
    notes: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // AI-enhanced state
  const [activeTab, setActiveTab] = useState('overview')
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [aiExplanation, setAiExplanation] = useState(null)
  const [aiRecommendation, setAiRecommendation] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    plainLanguage: true,
    howToComply: true,
    evidence: false,
    mistakes: false,
    related: false
  })

  // Initialize form data when requirement changes
  useEffect(() => {
    if (requirement) {
      setFormData({
        status: requirement.status || 'not_started',
        complianceMethod: requirement.complianceMethod || null,
        notes: requirement.notes || ''
      })
    }
  }, [requirement])

  // AI Hook
  const {
    loading: aiLoading,
    error: aiError,
    getGuidance: fetchAIGuidance,
    getRecommendation: fetchAIRecommendation
  } = useSafetyDeclarationAI(declarationId)

  // Get static guidance data
  const requirementId = requirement?.requirementId || requirement?.id
  const guidance = useMemo(() => getGuidance(requirementId) || {}, [requirementId])
  const sectionId = requirementId?.split('.').slice(0, 2).join('.')
  const sectionGuidance = useMemo(() => getSectionGuidance(sectionId) || {}, [sectionId])

  // RPAS context from declaration
  const rpasContext = useMemo(() => ({
    isCustomBuild: declaration?.rpasDetails?.isCustomBuild,
    model: declaration?.rpasDetails?.model,
    manufacturer: declaration?.rpasDetails?.manufacturer,
    weightKg: declaration?.rpasDetails?.weightKg,
    kineticEnergyCategory: declaration?.rpasDetails?.kineticEnergyCategory
  }), [declaration])

  // Get compliance method icon
  const getMethodIcon = useCallback((methodId) => {
    const Icon = COMPLIANCE_METHOD_ICONS[methodId] || HelpCircle
    return Icon
  }, [])

  // Toggle section expansion
  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }, [])

  // Handle save
  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      await updateRequirement(declarationId, requirement.id, {
        status: formData.status,
        complianceMethod: formData.complianceMethod,
        notes: formData.notes
      })

      if (onSave) {
        onSave({
          ...requirement,
          ...formData
        })
      }

      onClose()
    } catch (err) {
      console.error('Error updating requirement:', err)
      setError(err.message || 'Failed to update requirement')
    } finally {
      setSaving(false)
    }
  }

  // Fetch AI explanation
  const handleExplainRequirement = useCallback(async () => {
    if (!declarationId || !requirementId) return

    const result = await fetchAIGuidance(requirementId)
    if (result.success) {
      setAiExplanation(result.guidance)
    }
  }, [declarationId, requirementId, fetchAIGuidance])

  // Fetch AI recommendation
  const handleGetRecommendation = useCallback(async () => {
    if (!declarationId || !requirementId) return

    const result = await fetchAIRecommendation(requirementId, rpasContext)
    if (result.success) {
      setAiRecommendation(result.recommendation)
    }
  }, [declarationId, requirementId, rpasContext, fetchAIRecommendation])

  // Handle AI check from walkthrough
  const handleAICheck = useCallback(async (checkData) => {
    const result = await fetchAIRecommendation(checkData.requirementId, {
      ...rpasContext,
      selectedMethod: checkData.selectedMethod,
      userNotes: checkData.userNotes
    })
    return result
  }, [rpasContext, fetchAIRecommendation])

  // Get RPAS-specific tips
  const rpasTypeTips = useMemo(() => {
    return rpasContext?.isCustomBuild
      ? guidance.tips?.custom
      : guidance.tips?.commercial
  }, [guidance, rpasContext])

  // Status icons
  const getStatusIcon = (status, size = 'w-5 h-5') => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className={`${size} text-green-500`} />
      case 'in_progress':
        return <Clock className={`${size} text-yellow-500`} />
      case 'evidence_needed':
        return <AlertCircle className={`${size} text-orange-500`} />
      case 'not_applicable':
        return <Circle className={`${size} text-gray-300`} />
      case 'under_review':
        return <Eye className={`${size} text-purple-500`} />
      default:
        return <Circle className={`${size} text-gray-400`} />
    }
  }

  // Difficulty indicator
  const difficultyInfo = useMemo(() => {
    const level = sectionGuidance.difficulty
    const colors = {
      low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Complexity' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium Complexity' },
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Complexity' }
    }
    return colors[level] || colors.medium
  }, [sectionGuidance])

  if (!isOpen || !requirement) return null

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'guidance', label: 'AI Guidance', icon: Sparkles },
    { id: 'update', label: 'Update Status', icon: ClipboardCheck }
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">CAR {requirementId}</h2>
                <p className="text-white/80 text-sm">{sectionGuidance.title || requirement.sectionTitle || 'Requirement Details'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyInfo.bg} ${difficultyInfo.text}`}>
                {difficultyInfo.label}
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex-shrink-0 px-6 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}

            <div className="flex-1" />

            {/* Quick Actions */}
            <button
              onClick={() => setShowWalkthrough(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Full Walkthrough
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Requirement Text */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-2">Official Requirement Text</p>
                <p className="text-gray-900 leading-relaxed">{requirement.text}</p>
              </div>

              {/* Plain Language */}
              {guidance.plainLanguage && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-700 mb-1">In Plain Language</p>
                      <p className="text-blue-900">{guidance.plainLanguage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Why It Matters */}
              {guidance.whyItMatters && (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-start gap-2">
                    <Target className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-indigo-700 mb-1">Why This Matters</p>
                      <p className="text-indigo-900 text-sm">{guidance.whyItMatters}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Status */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  {getStatusIcon(formData.status)}
                  <div>
                    <p className="font-medium text-gray-900">Current Status</p>
                    <p className="text-sm text-gray-500">
                      {REQUIREMENT_STATUSES[formData.status]?.label || 'Not Started'}
                      {formData.complianceMethod && ` - ${FIRESTORE_COMPLIANCE_METHODS[formData.complianceMethod]?.label}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('update')}
                  className="px-4 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Update Status
                </button>
              </div>

              {/* RPAS-Specific Tip */}
              {rpasTypeTips && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-700 mb-1">
                        Tip for Your {rpasContext?.isCustomBuild ? 'Custom Build' : 'Commercial'} RPAS
                      </p>
                      <p className="text-green-900 text-sm">{rpasTypeTips}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Common Mistakes Warning */}
              {guidance.commonMistakes && guidance.commonMistakes.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-700 mb-2">Common Mistakes to Avoid</p>
                      <ul className="space-y-1">
                        {guidance.commonMistakes.slice(0, 3).map((mistake, i) => (
                          <li key={i} className="text-amber-900 text-sm flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Guidance Tab */}
          {activeTab === 'guidance' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* AI Error Display */}
              {aiError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700">Error</p>
                    <p className="text-sm text-red-600">{aiError}</p>
                  </div>
                </div>
              )}

              {/* Explain Requirement */}
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Explain This Requirement</h3>
                      <p className="text-sm text-gray-500">Get AI-powered plain-language explanation</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExplainRequirement}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Explain
                      </>
                    )}
                  </button>
                </div>

                {aiExplanation && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-700 mb-2">AI Explanation</p>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {aiExplanation}
                    </div>
                  </div>
                )}
              </div>

              {/* Get Compliance Recommendation */}
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Compliance Recommendation</h3>
                      <p className="text-sm text-gray-500">AI suggests best approach for your RPAS</p>
                    </div>
                  </div>
                  <button
                    onClick={handleGetRecommendation}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Get Recommendation
                      </>
                    )}
                  </button>
                </div>

                {/* Context Info */}
                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your RPAS Context</p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Type:</span>{' '}
                      {rpasContext?.isCustomBuild ? 'Custom Build' : 'Commercial'}
                    </div>
                    <div>
                      <span className="font-medium">Model:</span>{' '}
                      {rpasContext?.model || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Weight:</span>{' '}
                      {rpasContext?.weightKg ? `${rpasContext.weightKg} kg` : 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">KE Category:</span>{' '}
                      {rpasContext?.kineticEnergyCategory || 'Not specified'}
                    </div>
                  </div>
                </div>

                {aiRecommendation && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-sm font-medium text-indigo-700 mb-2">AI Recommendation</p>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {aiRecommendation}
                    </div>
                  </div>
                )}
              </div>

              {/* How to Comply */}
              {guidance.howToComply && (
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-indigo-600" />
                    How to Comply
                  </h3>
                  <div className="space-y-3">
                    {guidance.howToComply.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Examples */}
              {guidance.evidenceExamples && (
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Evidence Examples
                  </h3>
                  <div className="space-y-2">
                    {guidance.evidenceExamples.map((example, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-green-900 text-sm">{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Update Status Tab */}
          {activeTab === 'update' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(REQUIREMENT_STATUSES).map(([key, status]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: key }))}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        formData.status === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {getStatusIcon(key)}
                      <span className="text-sm font-medium text-gray-900">{status.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compliance Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Compliance Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(FIRESTORE_COMPLIANCE_METHODS).map(([key, method]) => {
                    const MethodIcon = getMethodIcon(key)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          complianceMethod: prev.complianceMethod === key ? null : key
                        }))}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                          formData.complianceMethod === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          formData.complianceMethod === key ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <MethodIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{method.label}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{method.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about compliance, testing approach, or other relevant information..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {sectionGuidance.typicalEvidence && (
              <div className="text-sm text-gray-500">
                <span className="font-medium">Typical Evidence:</span>{' '}
                {sectionGuidance.typicalEvidence.slice(0, 2).join(', ')}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Walkthrough Modal */}
      {showWalkthrough && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowWalkthrough(false)}
          />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <RequirementWalkthrough
              requirementId={requirementId}
              requirementText={requirement.text}
              acceptanceCriteria={requirement.acceptanceCriteria}
              rpasContext={rpasContext}
              onClose={() => setShowWalkthrough(false)}
              onAICheck={handleAICheck}
            />
          </div>
        </div>
      )}
    </>
  )
}
