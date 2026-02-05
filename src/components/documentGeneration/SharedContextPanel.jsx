/**
 * SharedContextPanel.jsx
 * Edit project-wide shared context that persists across all documents
 */

import { useState, useEffect } from 'react'
import {
  Settings,
  Building2,
  Plane,
  ScrollText,
  FileText,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Info
} from 'lucide-react'

export default function SharedContextPanel({
  project,
  onSave,
  saving = false,
  isOpen,
  onClose
}) {
  const [context, setContext] = useState({
    companyProfile: '',
    operationsScope: '',
    aircraftTypes: [],
    regulations: [],
    customContext: ''
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    company: true,
    operations: true,
    aircraft: false,
    regulations: false,
    custom: false
  })
  const [newAircraft, setNewAircraft] = useState('')
  const [newRegulation, setNewRegulation] = useState('')

  // Load context from project
  useEffect(() => {
    if (project?.sharedContext) {
      setContext({
        companyProfile: project.sharedContext.companyProfile || '',
        operationsScope: project.sharedContext.operationsScope || '',
        aircraftTypes: project.sharedContext.aircraftTypes || [],
        regulations: project.sharedContext.regulations || [],
        customContext: project.sharedContext.customContext || ''
      })
      setHasChanges(false)
    }
  }, [project?.id])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleChange = (field, value) => {
    setContext(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const addAircraft = () => {
    if (!newAircraft.trim()) return
    handleChange('aircraftTypes', [...context.aircraftTypes, newAircraft.trim()])
    setNewAircraft('')
  }

  const removeAircraft = (index) => {
    handleChange('aircraftTypes', context.aircraftTypes.filter((_, i) => i !== index))
  }

  const addRegulation = () => {
    if (!newRegulation.trim()) return
    handleChange('regulations', [...context.regulations, newRegulation.trim()])
    setNewRegulation('')
  }

  const removeRegulation = (index) => {
    handleChange('regulations', context.regulations.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    await onSave?.(context)
    setHasChanges(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Shared Context
              </h2>
              <p className="text-sm text-gray-500">
                {project?.name || 'Project'} • Applied to all documents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-start gap-2">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Shared context is automatically included in all AI conversations for this project.
            This helps Claude understand your organization and generate more relevant content.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Company Profile */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('company')}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">Company Profile</span>
              </div>
              {expandedSections.company ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.company && (
              <div className="p-4">
                <textarea
                  value={context.companyProfile}
                  onChange={(e) => handleChange('companyProfile', e.target.value)}
                  placeholder="Describe your organization, its mission, size, and key characteristics..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Include company name, industry, size, certifications, and any relevant background.
                </p>
              </div>
            )}
          </div>

          {/* Operations Scope */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('operations')}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">Operations Scope</span>
              </div>
              {expandedSections.operations ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.operations && (
              <div className="p-4">
                <textarea
                  value={context.operationsScope}
                  onChange={(e) => handleChange('operationsScope', e.target.value)}
                  placeholder="Describe the scope of operations, services provided, geographic area..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Include types of operations, service areas, and any operational limitations.
                </p>
              </div>
            )}
          </div>

          {/* Aircraft Types */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('aircraft')}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">Aircraft/Equipment Types</span>
                {context.aircraftTypes.length > 0 && (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                    {context.aircraftTypes.length}
                  </span>
                )}
              </div>
              {expandedSections.aircraft ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.aircraft && (
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newAircraft}
                    onChange={(e) => setNewAircraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAircraft()}
                    placeholder="Add aircraft or equipment type..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    onClick={addAircraft}
                    disabled={!newAircraft.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {context.aircraftTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {context.aircraftTypes.map((aircraft, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {aircraft}
                        <button
                          onClick={() => removeAircraft(index)}
                          className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No aircraft types added</p>
                )}
              </div>
            )}
          </div>

          {/* Regulations */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('regulations')}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">Applicable Regulations</span>
                {context.regulations.length > 0 && (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                    {context.regulations.length}
                  </span>
                )}
              </div>
              {expandedSections.regulations ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.regulations && (
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newRegulation}
                    onChange={(e) => setNewRegulation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addRegulation()}
                    placeholder="Add regulation (e.g., CARs 702, OSHA, etc.)..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    onClick={addRegulation}
                    disabled={!newRegulation.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {context.regulations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {context.regulations.map((reg, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {reg}
                        <button
                          onClick={() => removeRegulation(index)}
                          className="p-0.5 hover:bg-purple-200 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No regulations added</p>
                )}
              </div>
            )}
          </div>

          {/* Custom Context */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('custom')}
              className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-900">Custom Context</span>
              </div>
              {expandedSections.custom ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.custom && (
              <div className="p-4">
                <textarea
                  value={context.customContext}
                  onChange={(e) => handleChange('customContext', e.target.value)}
                  placeholder="Any additional context, special requirements, or instructions for AI generation..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Include any specific terminology, style preferences, or special requirements.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            {hasChanges && (
              <span className="text-sm text-yellow-600">Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Context
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
