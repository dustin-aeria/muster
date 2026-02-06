/**
 * MPDSectionChecklist.jsx
 * Section checklist component for Manufacturer Performance Declarations
 * Displays 8 documentation sections with item-level tracking
 *
 * @location src/components/manufacturerDeclaration/MPDSectionChecklist.jsx
 */

import { useState, useMemo } from 'react'
import {
  FileText,
  Upload,
  Check,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Code,
  AlertTriangle,
  Cpu,
  Shield,
  Zap,
  Settings,
  Users,
  BookOpen
} from 'lucide-react'
import {
  MPD_SECTIONS,
  SECTION_STATUSES,
  updateDeclarationSection,
  updateSectionItem
} from '../../lib/firestoreManufacturerDeclaration'

const SECTION_ICONS = {
  system_design: Cpu,
  software_declaration: Code,
  safety_analysis: AlertTriangle,
  performance_verification: Zap,
  environmental_qualification: Settings,
  reliability_assessment: Shield,
  maintenance_program: Settings,
  operator_package: BookOpen
}

export default function MPDSectionChecklist({ declarationId, sections, hasCustomSoftware }) {
  const [expandedSections, setExpandedSections] = useState(
    sections.reduce((acc, s) => ({ ...acc, [s.sectionId]: true }), {})
  )

  // Calculate section stats
  const sectionStats = useMemo(() => {
    const stats = {}
    sections.forEach(section => {
      const requiredItems = section.items?.filter(i => i.isRequired) || []
      const completeItems = requiredItems.filter(i =>
        i.status === 'complete' || i.status === 'documentation_complete'
      )
      stats[section.sectionId] = {
        total: section.items?.length || 0,
        required: requiredItems.length,
        complete: completeItems.length,
        percentage: requiredItems.length > 0
          ? Math.round((completeItems.length / requiredItems.length) * 100)
          : 100
      }
    })
    return stats
  }, [sections])

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const handleItemStatusChange = async (sectionId, itemId, newStatus) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    try {
      await updateSectionItem(declarationId, sectionId, itemId, { status: newStatus })

      // Check if all required items complete to update section status
      const updatedItems = section.items.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
      const allComplete = updatedItems
        .filter(i => i.isRequired)
        .every(i => i.status === 'complete' || i.status === 'documentation_complete')

      if (allComplete && section.status !== 'complete') {
        await updateDeclarationSection(declarationId, sectionId, { status: 'complete' })
      } else if (!allComplete && section.status === 'complete') {
        await updateDeclarationSection(declarationId, sectionId, { status: 'in_progress' })
      }
    } catch (err) {
      console.error('Error updating item status:', err)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <Check className="w-4 h-4 text-green-600" />
      case 'documentation_complete':
        return <Check className="w-4 h-4 text-blue-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'under_review':
        return <Clock className="w-4 h-4 text-purple-600" />
      case 'not_applicable':
        return <span className="w-4 h-4 text-gray-400 text-xs">N/A</span>
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded" />
    }
  }

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="divide-y divide-gray-200">
      {/* Overall Progress Header */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Documentation Sections</h3>
          <span className="text-sm text-gray-500">
            {sections.filter(s => s.status === 'complete').length} / {sections.filter(s => s.isRequired).length} sections complete
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {sortedSections.slice(0, 8).map(section => {
            const stats = sectionStats[section.sectionId]
            const SectionIcon = SECTION_ICONS[section.sectionId] || FileText

            return (
              <div
                key={section.id}
                className={`text-center p-2 rounded-lg border ${
                  !section.isRequired ? 'bg-gray-50 border-gray-200 opacity-60' :
                  section.status === 'complete' ? 'bg-green-50 border-green-200' :
                  'bg-white border-gray-200'
                }`}
              >
                <SectionIcon className={`w-4 h-4 mx-auto mb-1 ${
                  !section.isRequired ? 'text-gray-400' :
                  section.status === 'complete' ? 'text-green-600' :
                  'text-gray-400'
                }`} />
                <p className={`text-xs font-medium truncate ${
                  section.status === 'complete' ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {stats?.percentage || 0}%
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section List */}
      {sortedSections.map(section => {
        const SectionIcon = SECTION_ICONS[section.sectionId] || FileText
        const stats = sectionStats[section.sectionId]
        const isExpanded = expandedSections[section.sectionId]
        const statusInfo = SECTION_STATUSES[section.status] || SECTION_STATUSES.not_started

        // Skip software section if no custom software
        if (section.sectionId === 'software_declaration' && !hasCustomSoftware) {
          return null
        }

        return (
          <div key={section.id}>
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.sectionId)}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                !section.isRequired ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  section.status === 'complete' ? 'bg-green-100' :
                  section.sectionId === 'software_declaration' ? 'bg-purple-100' :
                  'bg-gray-100'
                }`}>
                  <SectionIcon className={`w-5 h-5 ${
                    section.status === 'complete' ? 'text-green-600' :
                    section.sectionId === 'software_declaration' ? 'text-purple-600' :
                    'text-gray-600'
                  }`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{section.label}</p>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  stats?.percentage === 100
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {stats?.complete || 0}/{stats?.required || 0}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Section Items */}
            {isExpanded && (
              <div className="px-4 pb-4">
                <div className="space-y-2 ml-10">
                  {section.items?.map(item => {
                    const itemStatus = SECTION_STATUSES[item.status] || SECTION_STATUSES.not_started

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          !item.isRequired
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : item.status === 'complete' || item.status === 'documentation_complete'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {/* Status Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusIcon(item.status)}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`font-medium text-sm ${
                                !item.isRequired ? 'text-gray-500' : 'text-gray-900'
                              }`}>
                                {item.label}
                                {item.isRequired && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </p>
                            </div>
                            <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${itemStatus.color}`}>
                              {itemStatus.label}
                            </span>
                          </div>

                          {/* Evidence Count */}
                          {item.evidenceIds?.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.evidenceIds.length} evidence file(s) attached
                            </p>
                          )}

                          {/* Notes */}
                          {item.notes && (
                            <p className="text-xs text-gray-600 mt-1 bg-gray-100 rounded px-2 py-1">
                              {item.notes}
                            </p>
                          )}

                          {/* Actions */}
                          {item.isRequired && (
                            <div className="mt-2 flex items-center gap-2">
                              <select
                                value={item.status}
                                onChange={(e) => handleItemStatusChange(section.id, item.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="not_started">Not Started</option>
                                <option value="in_progress">In Progress</option>
                                <option value="documentation_complete">Documentation Complete</option>
                                <option value="under_review">Under Review</option>
                                <option value="complete">Complete</option>
                              </select>

                              <button
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Upload className="w-3 h-3" />
                                Upload Evidence
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Section Legend */}
      <div className="p-4 bg-gray-50">
        <p className="text-xs text-gray-500 mb-2">Section Status Guide:</p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(SECTION_STATUSES).map(([key, status]) => (
            <div key={key} className="flex items-center gap-1.5">
              {getStatusIcon(key)}
              <span className="text-xs text-gray-600">{status.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guidance Box */}
      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Documentation Guidance</p>
              <ul className="mt-2 space-y-1">
                <li>• Complete all required items marked with <span className="text-red-500">*</span></li>
                <li>• Upload evidence files for each item where applicable</li>
                <li>• Safety analysis must include FHA, FMEA, and kinetic energy calculations</li>
                <li>• Performance verification requires actual test data and reports</li>
                <li>• Keep documentation traceable to design requirements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
