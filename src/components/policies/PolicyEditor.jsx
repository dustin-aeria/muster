/**
 * PolicyEditor.jsx
 * Enhanced policy editor with rich content, versioning, and permissions
 *
 * Features:
 * - Rich text/markdown content editing
 * - Section-based content structure
 * - Version management (save as new version)
 * - Acknowledgment settings configuration
 * - Role-based permission settings
 *
 * @location src/components/policies/PolicyEditor.jsx
 */

import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Modal, { ModalFooter } from '../Modal'
import {
  createPolicyEnhanced,
  updatePolicyEnhanced,
  getCategories,
  getNextPolicyNumber,
  incrementVersion,
  findChangedFields
} from '../../lib/firestorePolicies'
import { getPolicies } from '../../lib/firestore'
import { uploadPolicyAttachment, deletePolicyAttachment } from '../../lib/storageHelpers'
import { useAuth } from '../../contexts/AuthContext'
import { usePolicyPermissions } from '../../hooks/usePolicyPermissions'
import {
  Plus,
  Trash2,
  AlertCircle,
  Upload,
  FileText,
  X,
  Loader2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Shield,
  Bell,
  Settings,
  Save
} from 'lucide-react'

// ============================================
// TAB NAVIGATION
// ============================================

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: FileText },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'metadata', label: 'Metadata', icon: Settings },
  { id: 'acknowledgment', label: 'Acknowledgment', icon: Bell },
  { id: 'permissions', label: 'Permissions', icon: Shield }
]

function TabNavigation({ activeTab, onChange }) {
  return (
    <div className="flex border-b border-gray-200 -mx-6 px-6">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
        </button>
      ))}
    </div>
  )
}

TabNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

// ============================================
// SECTION EDITOR
// ============================================

function SectionEditor({ sections, onChange }) {
  const [editingId, setEditingId] = useState(null)
  const [newTitle, setNewTitle] = useState('')

  const addSection = () => {
    if (!newTitle.trim()) return
    const newSection = {
      id: `section_${Date.now()}`,
      title: newTitle.trim(),
      content: '',
      order: sections.length
    }
    onChange([...sections, newSection])
    setNewTitle('')
  }

  const updateSection = (id, updates) => {
    onChange(sections.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const removeSection = (id) => {
    onChange(sections.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i })))
  }

  const moveSection = (index, direction) => {
    const newSections = [...sections]
    const newIndex = index + direction
    if (newIndex >= 0 && newIndex < newSections.length) {
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]]
      onChange(newSections.map((s, i) => ({ ...s, order: i })))
    }
  }

  return (
    <div className="space-y-4">
      {/* Add section */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSection())}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a section title..."
        />
        <button
          type="button"
          onClick={addSection}
          className="btn-secondary"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Section list */}
      {sections.length > 0 && (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Section header */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </span>

                {editingId === section.id ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    autoFocus
                  />
                ) : (
                  <span
                    className="flex-1 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => setEditingId(section.id)}
                  >
                    {section.title}
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(index, -1)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(index, 1)}
                    disabled={index === sections.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section content */}
              <div className="p-3">
                <textarea
                  value={section.content || ''}
                  onChange={(e) => updateSection(section.id, { content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Section content (supports markdown)..."
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {sections.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No sections added yet. Add sections to structure your policy content.
        </p>
      )}
    </div>
  )
}

SectionEditor.propTypes = {
  sections: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
}

// ============================================
// ACKNOWLEDGMENT SETTINGS
// ============================================

function AcknowledgmentSettings({ settings, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...settings, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Enable acknowledgment */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={settings.required}
          onChange={(e) => handleChange('required', e.target.checked)}
          className="mt-1 w-5 h-5 text-blue-600 rounded"
        />
        <div>
          <p className="font-medium text-gray-900">Require Acknowledgment</p>
          <p className="text-sm text-gray-500">
            Users must acknowledge they have read and understood this policy
          </p>
        </div>
      </label>

      {settings.required && (
        <>
          {/* Required roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Roles
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Leave empty to require all users to acknowledge
            </p>
            <div className="flex flex-wrap gap-2">
              {['admin', 'manager', 'operator', 'pilot'].map(role => (
                <label key={role} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                  <input
                    type="checkbox"
                    checked={settings.requiredRoles?.includes(role)}
                    onChange={(e) => {
                      const roles = settings.requiredRoles || []
                      if (e.target.checked) {
                        handleChange('requiredRoles', [...roles, role])
                      } else {
                        handleChange('requiredRoles', roles.filter(r => r !== role))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acknowledgment Deadline (days after effective date)
            </label>
            <input
              type="number"
              value={settings.deadline || ''}
              onChange={(e) => handleChange('deadline', e.target.value ? parseInt(e.target.value) : null)}
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 30"
              min="1"
            />
          </div>

          {/* Re-acknowledgment period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Re-acknowledgment Period (days)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Set to 365 for annual re-acknowledgment
            </p>
            <input
              type="number"
              value={settings.reacknowledgmentPeriod || ''}
              onChange={(e) => handleChange('reacknowledgmentPeriod', e.target.value ? parseInt(e.target.value) : null)}
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 365"
              min="1"
            />
          </div>

          {/* Signature type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signature Type
            </label>
            <select
              value={settings.signatureType || 'checkbox'}
              onChange={(e) => handleChange('signatureType', e.target.value)}
              className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="checkbox">Checkbox only</option>
              <option value="typed">Typed name</option>
              <option value="drawn">Drawn signature</option>
            </select>
          </div>
        </>
      )}
    </div>
  )
}

AcknowledgmentSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

// ============================================
// PERMISSION SETTINGS
// ============================================

function PermissionSettings({ permissions, onChange }) {
  const handleRoleToggle = (field, role) => {
    const roles = permissions[field] || []
    if (roles.includes(role)) {
      onChange({ ...permissions, [field]: roles.filter(r => r !== role) })
    } else {
      onChange({ ...permissions, [field]: [...roles, role] })
    }
  }

  const allRoles = ['admin', 'manager', 'editor', 'operator', 'pilot', 'viewer']

  return (
    <div className="space-y-6">
      {/* View permissions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          View Permissions
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Leave empty to allow all users to view this policy
        </p>
        <div className="flex flex-wrap gap-2">
          {allRoles.map(role => (
            <label key={role} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
              <input
                type="checkbox"
                checked={permissions.viewRoles?.includes(role)}
                onChange={() => handleRoleToggle('viewRoles', role)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm capitalize">{role}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Edit permissions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Edit Permissions
        </label>
        <div className="flex flex-wrap gap-2">
          {allRoles.map(role => (
            <label key={role} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
              <input
                type="checkbox"
                checked={permissions.editRoles?.includes(role)}
                onChange={() => handleRoleToggle('editRoles', role)}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm capitalize">{role}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Approve permissions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Approval Permissions
        </label>
        <div className="flex flex-wrap gap-2">
          {allRoles.map(role => (
            <label key={role} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
              <input
                type="checkbox"
                checked={permissions.approveRoles?.includes(role)}
                onChange={() => handleRoleToggle('approveRoles', role)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm capitalize">{role}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

PermissionSettings.propTypes = {
  permissions: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

// ============================================
// VERSION SAVE MODAL
// ============================================

function VersionSaveModal({ isOpen, onClose, onSave, currentVersion }) {
  const [versionType, setVersionType] = useState('minor')
  const [versionNotes, setVersionNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const newVersion = incrementVersion(currentVersion, versionType)

  const handleSave = async () => {
    setLoading(true)
    await onSave(versionType, versionNotes)
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <GitBranch className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Save as New Version</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version Type
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="minor"
                  checked={versionType === 'minor'}
                  onChange={(e) => setVersionType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Minor ({incrementVersion(currentVersion, 'minor')})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="major"
                  checked={versionType === 'major'}
                  onChange={(e) => setVersionType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Major ({incrementVersion(currentVersion, 'major')})</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version Notes
            </label>
            <textarea
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe what changed in this version..."
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Current: <strong>v{currentVersion}</strong> → New: <strong>v{newVersion}</strong>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Version
          </button>
        </div>
      </div>
    </div>
  )
}

VersionSaveModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentVersion: PropTypes.string.isRequired
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PolicyEditor({ isOpen, onClose, policy, onSaved }) {
  const { user } = useAuth()
  const permissions = usePolicyPermissions(policy)
  const isEditing = !!policy
  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [categories, setCategories] = useState([])
  const [allPolicies, setAllPolicies] = useState([])
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    category: 'rpas',
    description: '',
    content: '',
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: '',
    owner: '',
    status: 'draft',
    keywords: [],
    relatedPolicies: [],
    regulatoryRefs: [],
    sections: [],
    attachments: [],
    acknowledgmentSettings: {
      required: false,
      requiredRoles: [],
      deadline: null,
      reacknowledgmentPeriod: null,
      signatureRequired: false,
      signatureType: 'checkbox'
    },
    permissions: {
      viewRoles: [],
      editRoles: ['admin', 'policy_editor'],
      approveRoles: ['admin', 'policy_approver']
    }
  })

  // Tag inputs
  const [keywordInput, setKeywordInput] = useState('')
  const [regRefInput, setRegRefInput] = useState('')

  // Load data on open
  useEffect(() => {
    if (isOpen) {
      loadCategories()
      loadPolicies()
      if (policy) {
        loadPolicyData()
      } else {
        resetForm()
      }
    }
  }, [isOpen, policy])

  // Track changes
  useEffect(() => {
    if (policy && isOpen) {
      const changed = findChangedFields(policy, formData)
      setHasChanges(changed.length > 0)
    }
  }, [formData, policy])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch {
      // Intentionally silent - use DEFAULT_CATEGORIES if custom categories fail to load
    }
  }

  const loadPolicies = async () => {
    try {
      const data = await getPolicies()
      setAllPolicies(data)
    } catch {
      // Intentionally silent - policy list is optional for related policy suggestions
    }
  }

  const loadPolicyData = () => {
    setFormData({
      number: policy.number || '',
      title: policy.title || '',
      category: policy.category || 'rpas',
      description: policy.description || '',
      content: policy.content || '',
      version: policy.version || '1.0',
      effectiveDate: policy.effectiveDate || '',
      reviewDate: policy.reviewDate || '',
      owner: policy.owner || '',
      status: policy.status || 'draft',
      keywords: policy.keywords || [],
      relatedPolicies: policy.relatedPolicies || [],
      regulatoryRefs: policy.regulatoryRefs || [],
      sections: policy.sections || [],
      attachments: policy.attachments || [],
      acknowledgmentSettings: policy.acknowledgmentSettings || {
        required: false,
        requiredRoles: [],
        deadline: null,
        reacknowledgmentPeriod: null,
        signatureRequired: false,
        signatureType: 'checkbox'
      },
      permissions: policy.permissions || {
        viewRoles: [],
        editRoles: ['admin', 'policy_editor'],
        approveRoles: ['admin', 'policy_approver']
      }
    })
  }

  const resetForm = () => {
    setFormData({
      number: '',
      title: '',
      category: 'rpas',
      description: '',
      content: '',
      version: '1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      reviewDate: '',
      owner: '',
      status: 'draft',
      keywords: [],
      relatedPolicies: [],
      regulatoryRefs: [],
      sections: [],
      attachments: [],
      acknowledgmentSettings: {
        required: false,
        requiredRoles: [],
        deadline: null,
        reacknowledgmentPeriod: null,
        signatureRequired: false,
        signatureType: 'checkbox'
      },
      permissions: {
        viewRoles: [],
        editRoles: ['admin', 'policy_editor'],
        approveRoles: ['admin', 'policy_approver']
      }
    })
    setError('')
    setKeywordInput('')
    setRegRefInput('')
    setActiveTab('basic')
    setHasChanges(false)
  }

  // Generate policy number when category changes
  useEffect(() => {
    if (!isEditing && isOpen && formData.category) {
      generateNumber()
    }
  }, [formData.category, isEditing, isOpen])

  const generateNumber = async () => {
    try {
      const num = await getNextPolicyNumber(formData.category)
      setFormData(prev => ({ ...prev, number: num }))
    } catch {
      // Intentionally silent - keep existing policy number if auto-generation fails
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Tag management
  const addTag = (field, inputValue, setInputValue) => {
    if (inputValue.trim() && !formData[field].includes(inputValue.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], inputValue.trim()]
      }))
      setInputValue('')
    }
  }

  const removeTag = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(v => v !== value)
    }))
  }

  // File handling
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !isEditing) return

    setUploadingFile(true)
    setError('')

    try {
      const result = await uploadPolicyAttachment(file, policy.id)
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, result]
      }))
    } catch (err) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveAttachment = async (attachment, index) => {
    try {
      if (attachment.path) {
        await deletePolicyAttachment(attachment.path)
      }
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
      }))
    } catch (err) {
      setError(err.message || 'Failed to remove attachment')
    }
  }

  // Check for duplicate policy number
  const checkDuplicateNumber = async (number) => {
    const policies = await getPolicies()
    const existing = policies.find(p =>
      p.number === number && (!isEditing || p.id !== policy?.id)
    )
    return existing
  }

  // Save handlers
  const handleSave = async (createNewVersion = false, versionType = 'minor', versionNotes = '') => {
    setError('')
    setLoading(true)

    try {
      if (!formData.title.trim()) throw new Error('Title is required')
      if (!formData.number.trim()) throw new Error('Policy number is required')
      if (!formData.reviewDate) throw new Error('Review date is required')

      // Check for duplicate policy number
      const duplicate = await checkDuplicateNumber(formData.number)
      if (duplicate) {
        throw new Error(`Policy number ${formData.number} is already in use by "${duplicate.title}". Please use a different number or click "Auto" to generate the next available number.`)
      }

      if (isEditing) {
        await updatePolicyEnhanced(policy.id, formData, {
          createNewVersion,
          versionType,
          versionNotes,
          userId: user?.uid
        })
      } else {
        await createPolicyEnhanced({
          ...formData,
          createdBy: user?.uid
        })
      }

      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVersionSave = async (versionType, versionNotes) => {
    await handleSave(true, versionType, versionNotes)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Policy ${policy?.number}` : 'New Policy'}
      size="xl"
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab navigation */}
        <TabNavigation activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab content */}
        <div className="min-h-[400px]">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Policy Number <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      className="input flex-1"
                      placeholder="Auto-generated"
                    />
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={generateNumber}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                        title="Generate next available number"
                      >
                        Auto
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-generated based on category. Manual override allowed.
                  </p>
                </div>
                <div>
                  <label className="label">Category <span className="text-red-500">*</span></label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Title <span className="text-red-500">*</span></label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="Policy title"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input min-h-[100px]"
                  placeholder="Brief description of this policy..."
                />
              </div>

              <div className="grid sm:grid-cols-4 gap-4">
                <div>
                  <label className="label">Version</label>
                  <input
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    className="input"
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="label">Effective Date</label>
                  <input
                    type="date"
                    name="effectiveDate"
                    value={formData.effectiveDate}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Review Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="reviewDate"
                    value={formData.reviewDate}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="active">Active</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Owner</label>
                <input
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Chief Pilot"
                />
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div>
                <label className="label">Policy Content</label>
                <p className="text-xs text-gray-500 mb-2">Supports markdown formatting</p>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="input min-h-[200px] font-mono text-sm"
                  placeholder="# Policy Content&#10;&#10;Write your policy content here using markdown..."
                />
              </div>

              <div>
                <label className="label">Policy Sections</label>
                <SectionEditor
                  sections={formData.sections}
                  onChange={(sections) => setFormData(prev => ({ ...prev, sections }))}
                />
              </div>
            </div>
          )}

          {/* Metadata Tab */}
          {activeTab === 'metadata' && (
            <div className="space-y-6">
              {/* Keywords */}
              <div>
                <label className="label">Keywords</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('keywords', keywordInput, setKeywordInput))}
                    className="input flex-1"
                    placeholder="Add keyword..."
                  />
                  <button
                    type="button"
                    onClick={() => addTag('keywords', keywordInput, setKeywordInput)}
                    className="btn-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {kw}
                      <button onClick={() => removeTag('keywords', kw)} className="hover:text-gray-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Regulatory References */}
              <div>
                <label className="label">Regulatory References</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={regRefInput}
                    onChange={(e) => setRegRefInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('regulatoryRefs', regRefInput, setRegRefInput))}
                    className="input flex-1"
                    placeholder="e.g., CARs 901.01"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('regulatoryRefs', regRefInput, setRegRefInput)}
                    className="btn-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.regulatoryRefs.map((ref, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {ref}
                      <button onClick={() => removeTag('regulatoryRefs', ref)} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Policies */}
              {allPolicies.length > 0 && (
                <div>
                  <label className="label">Related Policies</label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {allPolicies
                      .filter(p => p.number !== formData.number)
                      .map(p => (
                        <label key={p.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.relatedPolicies.includes(p.number)}
                            onChange={() => {
                              const related = formData.relatedPolicies.includes(p.number)
                                ? formData.relatedPolicies.filter(n => n !== p.number)
                                : [...formData.relatedPolicies, p.number]
                              setFormData(prev => ({ ...prev, relatedPolicies: related }))
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-xs font-mono text-gray-500">{p.number}</span>
                          <span className="text-sm truncate">{p.title}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              <div>
                <label className="label">Attachments</label>
                {isEditing ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="btn-secondary mb-3"
                    >
                      {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploadingFile ? 'Uploading...' : 'Upload File'}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">Save policy first to upload files</p>
                )}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-blue-600 hover:underline truncate">
                          {att.name}
                        </a>
                        <button onClick={() => handleRemoveAttachment(att, i)} className="p-1 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Acknowledgment Tab */}
          {activeTab === 'acknowledgment' && (
            <AcknowledgmentSettings
              settings={formData.acknowledgmentSettings}
              onChange={(settings) => setFormData(prev => ({ ...prev, acknowledgmentSettings: settings }))}
            />
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <PermissionSettings
              permissions={formData.permissions}
              onChange={(perms) => setFormData(prev => ({ ...prev, permissions: perms }))}
            />
          )}
        </div>

        <ModalFooter>
          <div className="flex items-center gap-3 w-full">
            {isEditing && hasChanges && (
              <button
                type="button"
                onClick={() => setShowVersionModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <GitBranch className="w-4 h-4" />
                Save as New Version
              </button>
            )}
            <div className="flex-1" />
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Policy'}
            </button>
          </div>
        </ModalFooter>
      </div>

      {/* Version save modal */}
      <VersionSaveModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        onSave={handleVersionSave}
        currentVersion={formData.version}
      />
    </Modal>
  )
}

PolicyEditor.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  policy: PropTypes.object,
  onSaved: PropTypes.func
}
