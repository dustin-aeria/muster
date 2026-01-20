/**
 * PolicyModal.jsx
 * Modal for creating and editing policies with file attachments
 *
 * @location src/components/PolicyModal.jsx
 */

import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Modal, { ModalFooter } from './Modal'
import {
  createPolicy,
  updatePolicy,
  getNextPolicyNumber,
  getPolicies
} from '../lib/firestore'
import { uploadPolicyAttachment, deletePolicyAttachment } from '../lib/storageHelpers'
import { useAuth } from '../contexts/AuthContext'
import {
  Plus,
  Trash2,
  AlertCircle,
  Upload,
  FileText,
  X,
  Loader2,
  GripVertical
} from 'lucide-react'

const CATEGORIES = [
  { id: 'rpas', label: 'RPAS Operations', color: 'blue' },
  { id: 'crm', label: 'Crew Resource Management', color: 'purple' },
  { id: 'hse', label: 'Health, Safety & Environment', color: 'green' }
]

export default function PolicyModal({ isOpen, onClose, policy, onSaved }) {
  const { user } = useAuth()
  const isEditing = !!policy
  const fileInputRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [allPolicies, setAllPolicies] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    category: 'rpas',
    description: '',
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    reviewDate: '',
    owner: '',
    status: 'draft',
    keywords: [],
    relatedPolicies: [],
    regulatoryRefs: [],
    sections: [],
    attachments: []
  })

  // Input states for tags
  const [keywordInput, setKeywordInput] = useState('')
  const [regRefInput, setRegRefInput] = useState('')
  const [sectionInput, setSectionInput] = useState('')

  // Load form data when editing
  useEffect(() => {
    if (policy) {
      setFormData({
        number: policy.number || '',
        title: policy.title || '',
        category: policy.category || 'rpas',
        description: policy.description || '',
        version: policy.version || '1.0',
        effectiveDate: policy.effectiveDate || '',
        reviewDate: policy.reviewDate || '',
        owner: policy.owner || '',
        status: policy.status || 'draft',
        keywords: policy.keywords || [],
        relatedPolicies: policy.relatedPolicies || [],
        regulatoryRefs: policy.regulatoryRefs || [],
        sections: policy.sections || [],
        attachments: policy.attachments || []
      })
    } else {
      resetForm()
    }
  }, [policy, isOpen])

  // Load all policies for related policies dropdown
  useEffect(() => {
    if (isOpen) {
      loadAllPolicies()
    }
  }, [isOpen])

  const loadAllPolicies = async () => {
    try {
      const policies = await getPolicies()
      setAllPolicies(policies)
    } catch {
      // Policies will be empty - that's okay for new installations
    }
  }

  // Generate policy number when category changes (only for new policies)
  useEffect(() => {
    if (!isEditing && isOpen && formData.category) {
      generatePolicyNumber()
    }
  }, [formData.category, isEditing, isOpen])

  const generatePolicyNumber = async () => {
    try {
      const nextNumber = await getNextPolicyNumber(formData.category)
      setFormData(prev => ({ ...prev, number: nextNumber }))
    } catch {
      // Keep existing number if generation fails
    }
  }

  const resetForm = () => {
    setFormData({
      number: '',
      title: '',
      category: 'rpas',
      description: '',
      version: '1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      reviewDate: '',
      owner: '',
      status: 'draft',
      keywords: [],
      relatedPolicies: [],
      regulatoryRefs: [],
      sections: [],
      attachments: []
    })
    setError('')
    setKeywordInput('')
    setRegRefInput('')
    setSectionInput('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Tag/list management
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const addRegRef = () => {
    if (regRefInput.trim() && !formData.regulatoryRefs.includes(regRefInput.trim())) {
      setFormData(prev => ({
        ...prev,
        regulatoryRefs: [...prev.regulatoryRefs, regRefInput.trim()]
      }))
      setRegRefInput('')
    }
  }

  const removeRegRef = (ref) => {
    setFormData(prev => ({
      ...prev,
      regulatoryRefs: prev.regulatoryRefs.filter(r => r !== ref)
    }))
  }

  const addSection = () => {
    if (sectionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        sections: [...prev.sections, sectionInput.trim()]
      }))
      setSectionInput('')
    }
  }

  const removeSection = (index) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }))
  }

  const moveSection = (index, direction) => {
    const newSections = [...formData.sections]
    const newIndex = index + direction
    if (newIndex >= 0 && newIndex < newSections.length) {
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]]
      setFormData(prev => ({ ...prev, sections: newSections }))
    }
  }

  // Related policies toggle
  const toggleRelatedPolicy = (policyNumber) => {
    setFormData(prev => ({
      ...prev,
      relatedPolicies: prev.relatedPolicies.includes(policyNumber)
        ? prev.relatedPolicies.filter(p => p !== policyNumber)
        : [...prev.relatedPolicies, policyNumber]
    }))
  }

  // File attachment handling
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setError('')

    try {
      // For new policies, we need to save first to get an ID
      if (!isEditing) {
        setError('Please save the policy first before uploading attachments.')
        setUploadingFile(false)
        return
      }

      const result = await uploadPolicyAttachment(file, policy.id)
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, result]
      }))
    } catch (err) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
      setError(err.message || 'Failed to delete attachment')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.title.trim()) throw new Error('Title is required')
      if (!formData.number.trim()) throw new Error('Policy number is required')
      if (!formData.reviewDate) throw new Error('Review date is required')

      const policyData = {
        ...formData,
        createdBy: user?.uid || null
      }

      if (isEditing) {
        await updatePolicy(policy.id, policyData)
      } else {
        await createPolicy(policyData)
      }

      onSaved?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Policy' : 'New Policy'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Info Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="number" className="label">
                Policy Number <span className="text-red-500">*</span>
              </label>
              <input
                id="number"
                name="number"
                type="text"
                value={formData.number}
                onChange={handleChange}
                className="input"
                placeholder="e.g., 1001"
              />
            </div>
            <div>
              <label htmlFor="category" className="label">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="title" className="label">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="e.g., RPAS Operations Policy"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input min-h-[100px]"
                placeholder="Policy description and scope..."
              />
            </div>
          </div>
        </div>

        {/* Dates & Version Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Version & Dates</h3>
          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="version" className="label">Version</label>
              <input
                id="version"
                name="version"
                type="text"
                value={formData.version}
                onChange={handleChange}
                className="input"
                placeholder="1.0"
              />
            </div>
            <div>
              <label htmlFor="effectiveDate" className="label">Effective Date</label>
              <input
                id="effectiveDate"
                name="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="reviewDate" className="label">
                Review Date <span className="text-red-500">*</span>
              </label>
              <input
                id="reviewDate"
                name="reviewDate"
                type="date"
                value={formData.reviewDate}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="owner" className="label">Owner</label>
              <input
                id="owner"
                name="owner"
                type="text"
                value={formData.owner}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Chief Pilot"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input w-40"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>

        {/* Sections */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Policy Sections</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={sectionInput}
              onChange={(e) => setSectionInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSection())}
              className="input flex-1"
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
          {formData.sections.length > 0 && (
            <div className="space-y-1">
              {formData.sections.map((section, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="w-6 h-6 bg-aeria-navy text-white rounded-full text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm">{section}</span>
                  <button
                    type="button"
                    onClick={() => moveSection(index, -1)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(index, 1)}
                    disabled={index === formData.sections.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Regulatory References */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Regulatory References</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={regRefInput}
              onChange={(e) => setRegRefInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRegRef())}
              className="input flex-1"
              placeholder="e.g., CARs 901.01"
            />
            <button
              type="button"
              onClick={addRegRef}
              className="btn-secondary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {formData.regulatoryRefs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.regulatoryRefs.map((ref, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {ref}
                  <button
                    type="button"
                    onClick={() => removeRegRef(ref)}
                    className="hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Keywords */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Keywords</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              className="input flex-1"
              placeholder="Add a keyword..."
            />
            <button
              type="button"
              onClick={addKeyword}
              className="btn-secondary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Related Policies */}
        {allPolicies.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Policies</h3>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
              <div className="space-y-1">
                {allPolicies
                  .filter(p => p.number !== formData.number)
                  .map(p => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.relatedPolicies.includes(p.number)}
                        onChange={() => toggleRelatedPolicy(p.number)}
                        className="w-4 h-4 text-aeria-navy rounded"
                      />
                      <span className="text-xs font-mono text-gray-500">{p.number}</span>
                      <span className="text-sm truncate">{p.title}</span>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Attachments */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Attachments</h3>

          {isEditing ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="btn-secondary inline-flex items-center gap-2 mb-3"
              >
                {uploadingFile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploadingFile ? 'Uploading...' : 'Upload File'}
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-500 mb-3">
              Save the policy first to enable file uploads.
            </p>
          )}

          {formData.attachments.length > 0 && (
            <div className="space-y-2">
              {formData.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-aeria-blue hover:underline truncate block"
                    >
                      {attachment.name}
                    </a>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(attachment, index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <ModalFooter>
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Policy'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

PolicyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  policy: PropTypes.object,
  onSaved: PropTypes.func
}
