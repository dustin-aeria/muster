/**
 * RequirementsMatrix.jsx
 * Visual compliance tracker for CAR Standard 922 requirements
 * Shows requirements grouped by section with progress indicators
 *
 * @location src/components/safetyDeclaration/RequirementsMatrix.jsx
 */

import { useState, useMemo } from 'react'
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  FileText,
  TestTube,
  Calculator,
  Eye,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react'
import {
  REQUIREMENT_SECTIONS,
  REQUIREMENT_STATUSES,
  COMPLIANCE_METHODS,
  KINETIC_ENERGY_CATEGORIES,
  RELIABILITY_TARGETS
} from '../../lib/firestoreSafetyDeclaration'
import RequirementDetailModal from './RequirementDetailModal'

export default function RequirementsMatrix({
  declarationId,
  requirements,
  declaration,
  onRequirementUpdate
}) {
  const [expandedSections, setExpandedSections] = useState(new Set())
  const [selectedRequirement, setSelectedRequirement] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Group requirements by section
  const requirementsBySection = useMemo(() => {
    const grouped = requirements.reduce((acc, req) => {
      if (!acc[req.sectionId]) {
        acc[req.sectionId] = {
          sectionId: req.sectionId,
          sectionTitle: req.sectionTitle,
          requirements: [],
          sectionInfo: REQUIREMENT_SECTIONS[req.sectionId]
        }
      }
      acc[req.sectionId].requirements.push(req)
      return acc
    }, {})

    // Sort sections by ID
    return Object.values(grouped).sort((a, b) => a.sectionId.localeCompare(b.sectionId))
  }, [requirements])

  // Filter requirements
  const filteredSections = useMemo(() => {
    return requirementsBySection.map(section => ({
      ...section,
      requirements: section.requirements.filter(req => {
        const matchesSearch = searchTerm === '' ||
          req.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.requirementId.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || req.status === statusFilter

        return matchesSearch && matchesStatus
      })
    })).filter(section => section.requirements.length > 0)
  }, [requirementsBySection, searchTerm, statusFilter])

  // Calculate section stats
  const getSectionStats = (section) => {
    const total = section.requirements.length
    const complete = section.requirements.filter(r => r.status === 'complete').length
    const inProgress = section.requirements.filter(r => r.status === 'in_progress').length
    const notApplicable = section.requirements.filter(r => r.status === 'not_applicable').length
    const applicable = total - notApplicable
    const percentage = applicable > 0 ? Math.round((complete / applicable) * 100) : 100

    return { total, complete, inProgress, notApplicable, applicable, percentage }
  }

  // Overall stats
  const overallStats = useMemo(() => {
    const total = requirements.length
    const complete = requirements.filter(r => r.status === 'complete').length
    const inProgress = requirements.filter(r => r.status === 'in_progress').length
    const notApplicable = requirements.filter(r => r.status === 'not_applicable').length
    const evidenceNeeded = requirements.filter(r => r.status === 'evidence_needed').length
    const notStarted = requirements.filter(r => r.status === 'not_started').length
    const applicable = total - notApplicable
    const percentage = applicable > 0 ? Math.round((complete / applicable) * 100) : 100

    return { total, complete, inProgress, notApplicable, evidenceNeeded, notStarted, applicable, percentage }
  }, [requirements])

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedSections(new Set(requirementsBySection.map(s => s.sectionId)))
  }

  const collapseAll = () => {
    setExpandedSections(new Set())
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'evidence_needed':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      case 'not_applicable':
        return <Circle className="w-5 h-5 text-gray-300" />
      case 'under_review':
        return <Eye className="w-5 h-5 text-purple-500" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getComplianceMethodIcon = (method) => {
    switch (method) {
      case 'inspection':
        return <Eye className="w-4 h-4" />
      case 'analysis':
        return <Calculator className="w-4 h-4" />
      case 'test':
        return <TestTube className="w-4 h-4" />
      case 'service_experience':
        return <FileText className="w-4 h-4" />
      default:
        return null
    }
  }

  const handleRequirementClick = (requirement) => {
    setSelectedRequirement(requirement)
    setShowDetailModal(true)
  }

  const handleRequirementSave = (updatedRequirement) => {
    if (onRequirementUpdate) {
      onRequirementUpdate(updatedRequirement)
    }
  }

  // Get KE category info for reliability targets display
  const keCategory = declaration?.rpasDetails?.kineticEnergyCategory || 'low'
  const keCategoryInfo = KINETIC_ENERGY_CATEGORIES[keCategory]

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{overallStats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{overallStats.complete}</p>
          <p className="text-sm text-gray-500">Complete</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{overallStats.inProgress}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{overallStats.evidenceNeeded}</p>
          <p className="text-sm text-gray-500">Evidence Needed</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{overallStats.notStarted}</p>
          <p className="text-sm text-gray-500">Not Started</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{overallStats.percentage}%</p>
          <p className="text-sm text-gray-500">Complete</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search requirements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {Object.entries(REQUIREMENT_STATUSES).map(([key, status]) => (
                <option key={key} value={key}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* KE Category Info */}
      {keCategoryInfo && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Kinetic Energy Category:</span>
              <span className={`ml-2 font-medium ${
                keCategory === 'very_high' || keCategory === 'high' ? 'text-orange-600' : 'text-gray-900'
              }`}>
                {keCategoryInfo.label}
              </span>
              <span className="text-sm text-gray-500 ml-2">({keCategoryInfo.description})</span>
            </div>
            <div className="text-sm text-gray-500">
              Robustness: <span className="font-medium capitalize">{declaration?.robustnessLevel || 'Low'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Requirements by Section */}
      {filteredSections.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Requirements</h3>
          <p className="text-gray-500">
            {requirements.length === 0
              ? 'No requirements have been initialized for this declaration.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSections.map((section) => {
            const stats = getSectionStats(section)
            const isExpanded = expandedSections.has(section.sectionId)

            return (
              <div
                key={section.sectionId}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.sectionId)}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">
                        CAR {section.sectionId}: {section.sectionTitle}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {section.sectionInfo?.description || ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Progress Bar */}
                    <div className="hidden md:flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            stats.percentage === 100 ? 'bg-green-500' :
                            stats.percentage > 50 ? 'bg-blue-500' :
                            stats.percentage > 0 ? 'bg-yellow-500' :
                            'bg-gray-300'
                          }`}
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {stats.percentage}%
                      </span>
                    </div>

                    {/* Stats Badges */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        {stats.complete}/{stats.applicable}
                      </span>
                      {stats.inProgress > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          {stats.inProgress} in progress
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="col-span-1">Status</div>
                      <div className="col-span-1">ID</div>
                      <div className="col-span-5">Requirement</div>
                      <div className="col-span-2">Method</div>
                      <div className="col-span-2">Evidence</div>
                      <div className="col-span-1">Actions</div>
                    </div>

                    {/* Requirements List */}
                    <div className="divide-y divide-gray-100">
                      {section.requirements.map((req) => (
                        <div
                          key={req.id}
                          onClick={() => handleRequirementClick(req)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          {/* Desktop View */}
                          <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-1">
                              {getStatusIcon(req.status)}
                            </div>
                            <div className="col-span-1">
                              <span className="text-xs text-gray-500 font-mono">
                                {req.requirementId}
                              </span>
                            </div>
                            <div className="col-span-5">
                              <p className="text-sm text-gray-900 line-clamp-2">{req.text}</p>
                              {req.acceptanceCriteria && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                  Criteria: {req.acceptanceCriteria}
                                </p>
                              )}
                            </div>
                            <div className="col-span-2">
                              {req.complianceMethod ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                  {getComplianceMethodIcon(req.complianceMethod)}
                                  {COMPLIANCE_METHODS[req.complianceMethod]?.label}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">Not set</span>
                              )}
                            </div>
                            <div className="col-span-2">
                              {req.evidenceIds?.length > 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                                  <FileText className="w-3.5 h-3.5" />
                                  {req.evidenceIds.length} item(s)
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">None</span>
                              )}
                            </div>
                            <div className="col-span-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRequirementClick(req)
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Mobile View */}
                          <div className="md:hidden space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                {getStatusIcon(req.status)}
                                <div>
                                  <span className="text-xs text-gray-500 font-mono block">
                                    {req.requirementId}
                                  </span>
                                  <p className="text-sm text-gray-900 mt-1">{req.text}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pl-8">
                              {req.complianceMethod && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                                  {COMPLIANCE_METHODS[req.complianceMethod]?.label}
                                </span>
                              )}
                              {req.evidenceIds?.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                                  <FileText className="w-3 h-3" />
                                  {req.evidenceIds.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Requirement Detail Modal */}
      {showDetailModal && selectedRequirement && (
        <RequirementDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedRequirement(null)
          }}
          requirement={selectedRequirement}
          declarationId={declarationId}
          declaration={declaration}
          onSave={handleRequirementSave}
        />
      )}
    </div>
  )
}
