/**
 * PolicyTemplates.jsx
 * Component for browsing and adopting default policy templates
 *
 * Features:
 * - Browse available templates by category
 * - Preview template content
 * - Adopt template to create custom policy
 * - Track which templates have been adopted
 *
 * @location src/components/policies/PolicyTemplates.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  FileText,
  Copy,
  Check,
  Search,
  Filter,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
  BookOpen,
  Download,
  Plane,
  Users,
  HardHat
} from 'lucide-react'
import {
  getDefaultPolicies,
  getPoliciesEnhanced,
  adoptTemplate,
  getCategories
} from '../../lib/firestorePolicies'
import { usePolicyPermissions } from '../../hooks/usePolicyPermissions'
import { useAuth } from '../../contexts/AuthContext'
import { logger } from '../../lib/logger'

/**
 * Category icons
 */
const CATEGORY_ICONS = {
  rpas: Plane,
  crm: Users,
  hse: HardHat
}

/**
 * Category colors
 */
const CATEGORY_COLORS = {
  rpas: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  crm: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  hse: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
}

/**
 * Template card component
 */
function TemplateCard({ template, isAdopted, onPreview, onAdopt, adopting }) {
  const IconComponent = CATEGORY_ICONS[template.category] || FileText
  const colors = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.rpas

  return (
    <div className={`bg-white rounded-lg border ${colors.border} overflow-hidden hover:shadow-md transition-shadow`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors.bg} ${colors.text}`}>
              {template.number}
            </span>
            {isAdopted && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                <Check className="w-3 h-3" />
                Adopted
              </span>
            )}
          </div>
          <div className={`p-1.5 rounded ${colors.bg}`}>
            <IconComponent className={`w-4 h-4 ${colors.text}`} />
          </div>
        </div>

        <h3 className="font-medium text-gray-900 mb-1">{template.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>

        {/* Sections preview */}
        {template.sections?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">
              {template.sections.length} sections
            </p>
            <div className="flex flex-wrap gap-1">
              {template.sections.slice(0, 3).map((section, idx) => (
                <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {typeof section === 'string' ? section : section.title}
                </span>
              ))}
              {template.sections.length > 3 && (
                <span className="px-1.5 py-0.5 text-gray-400 text-xs">
                  +{template.sections.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={() => onPreview(template)}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          Preview
          <ChevronRight className="w-4 h-4" />
        </button>

        {!isAdopted && (
          <button
            onClick={() => onAdopt(template)}
            disabled={adopting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {adopting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Adopt
          </button>
        )}
      </div>
    </div>
  )
}

TemplateCard.propTypes = {
  template: PropTypes.object.isRequired,
  isAdopted: PropTypes.bool,
  onPreview: PropTypes.func.isRequired,
  onAdopt: PropTypes.func.isRequired,
  adopting: PropTypes.bool
}

/**
 * Template preview modal
 */
function TemplatePreviewModal({ template, isOpen, onClose, onAdopt, isAdopted, adopting }) {
  if (!isOpen || !template) return null

  const IconComponent = CATEGORY_ICONS[template.category] || FileText
  const colors = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.rpas

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`p-6 ${colors.bg} ${colors.border} border-b`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 bg-white/50 rounded-lg`}>
                <IconComponent className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 bg-white/50 rounded text-sm font-bold ${colors.text}`}>
                    {template.number}
                  </span>
                  <span className="text-sm text-gray-500">Template</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{template.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-700">{template.description}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Version</p>
              <p className="font-medium text-gray-900">{template.version}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Owner</p>
              <p className="font-medium text-gray-900">{template.owner || 'Not set'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Sections</p>
              <p className="font-medium text-gray-900">{template.sections?.length || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className="font-medium text-gray-900 capitalize">{template.status}</p>
            </div>
          </div>

          {/* Sections */}
          {template.sections?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Policy Sections</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {template.sections.map((section, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-500">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {typeof section === 'string' ? section : section.title}
                      </p>
                      {section.content && (
                        <p className="text-sm text-gray-500 mt-1">{section.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regulatory References */}
          {template.regulatoryRefs?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Regulatory References</h3>
              <div className="flex flex-wrap gap-2">
                {template.regulatoryRefs.map((ref, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {template.keywords?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {template.keywords.map((keyword, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {isAdopted ? (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="w-4 h-4" />
                You've already adopted this template
              </span>
            ) : (
              <span>Adopt this template to create your own policy</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
            {!isAdopted && (
              <button
                onClick={() => onAdopt(template)}
                disabled={adopting}
                className="btn-primary flex items-center gap-2"
              >
                {adopting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Adopt Template
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

TemplatePreviewModal.propTypes = {
  template: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdopt: PropTypes.func.isRequired,
  isAdopted: PropTypes.bool,
  adopting: PropTypes.bool
}

/**
 * Main PolicyTemplates component
 */
export default function PolicyTemplates({ onTemplateAdopted }) {
  const { user } = useAuth()
  const permissions = usePolicyPermissions()

  const [templates, setTemplates] = useState([])
  const [adoptedPolicies, setAdoptedPolicies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [adoptingId, setAdoptingId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [templatesData, policiesData, categoriesData] = await Promise.all([
        getDefaultPolicies(),
        getPoliciesEnhanced({ type: 'custom' }),
        getCategories()
      ])

      setTemplates(templatesData)
      setAdoptedPolicies(policiesData)
      setCategories(categoriesData)
    } catch (err) {
      setError('Failed to load templates')
      logger.error('Error with template:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get set of adopted template IDs
  const adoptedTemplateIds = useMemo(() => {
    return new Set(adoptedPolicies.filter(p => p.derivedFrom).map(p => p.derivedFrom))
  }, [adoptedPolicies])

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Category filter
      if (categoryFilter && template.category !== categoryFilter) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          template.number?.includes(query) ||
          template.title?.toLowerCase().includes(query) ||
          template.description?.toLowerCase().includes(query) ||
          template.keywords?.some(k => k.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [templates, categoryFilter, searchQuery])

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped = {}
    filteredTemplates.forEach(template => {
      const cat = template.category || 'other'
      if (!grouped[cat]) {
        grouped[cat] = []
      }
      grouped[cat].push(template)
    })
    return grouped
  }, [filteredTemplates])

  const handleAdopt = async (template) => {
    try {
      setAdoptingId(template.id)
      await adoptTemplate(template.id, {}, user?.uid)
      await loadData()
      setPreviewTemplate(null)
      onTemplateAdopted?.()
    } catch (err) {
      setError(err.message || 'Failed to adopt template')
    } finally {
      setAdoptingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Policy Templates</h2>
            <p className="text-gray-600 mt-1">
              Browse and adopt pre-built policy templates based on industry best practices.
              Customize them to fit your organization's needs.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-red-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <label htmlFor="template-search" className="sr-only">Search templates</label>
              <input
                id="template-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                categoryFilter === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.filter(c => c.isDefault).map(cat => {
              const Icon = CATEGORY_ICONS[cat.id] || FileText
              const colors = CATEGORY_COLORS[cat.id] || {}
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
                    categoryFilter === cat.id
                      ? `${colors.bg} ${colors.text}`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>{filteredTemplates.length} templates available</span>
        <span className="text-green-600">
          {adoptedTemplateIds.size} adopted
        </span>
      </div>

      {/* Templates by category */}
      {Object.entries(templatesByCategory).length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
          <p className="text-gray-500">
            {searchQuery || categoryFilter
              ? 'Try adjusting your search or filters'
              : 'No policy templates are available'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(templatesByCategory).map(([categoryId, categoryTemplates]) => {
            const category = categories.find(c => c.id === categoryId) || { name: categoryId }
            const Icon = CATEGORY_ICONS[categoryId] || FileText

            return (
              <div key={categoryId}>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-gray-500" />
                  {category.name}
                  <span className="text-sm font-normal text-gray-400">
                    ({categoryTemplates.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isAdopted={adoptedTemplateIds.has(template.id)}
                      onPreview={setPreviewTemplate}
                      onAdopt={handleAdopt}
                      adopting={adoptingId === template.id}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onAdopt={handleAdopt}
        isAdopted={previewTemplate ? adoptedTemplateIds.has(previewTemplate.id) : false}
        adopting={adoptingId === previewTemplate?.id}
      />
    </div>
  )
}

PolicyTemplates.propTypes = {
  onTemplateAdopted: PropTypes.func
}
