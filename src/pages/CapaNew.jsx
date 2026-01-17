/**
 * CapaNew.jsx
 * Create New CAPA Form
 * 
 * Form for creating new Corrective and Preventive Actions
 * Can be linked to incidents or created standalone
 * 
 * @location src/pages/CapaNew.jsx
 * @action NEW FILE
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Save, 
  ArrowLeft, 
  Target,
  AlertTriangle,
  Calendar,
  User,
  Building2,
  Plus,
  FileText,
  Info
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getOperators } from '../lib/firestore'
import { getIncident } from '../lib/firestoreSafety'
import {
  createCapa,
  CAPA_TYPES,
  PRIORITY_LEVELS
} from '../lib/firestoreSafety'

// Section component for form organization
function FormSection({ title, description, children, icon: Icon }) {
  return (
    <div className="card">
      <div className="flex items-start gap-3 mb-4">
        {Icon && (
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

export default function CapaNew() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { userProfile } = useAuth()
  
  const [saving, setSaving] = useState(false)
  const [operators, setOperators] = useState([])
  const [linkedIncident, setLinkedIncident] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  
  // Get URL params for linking
  const incidentId = searchParams.get('incidentId')
  const sourceType = searchParams.get('sourceType') || (incidentId ? 'incident' : 'observation')
  const sourceReference = searchParams.get('sourceReference') || ''
  
  // Form state
  const [formData, setFormData] = useState({
    // Source
    sourceType: sourceType,
    sourceId: incidentId || null,
    sourceReference: sourceReference,
    
    // Classification
    type: 'corrective',
    priority: 'medium',
    category: '',
    
    // Description
    title: '',
    problemStatement: '',
    rootCause: '',
    
    // Assignment
    assignedTo: '',
    assignedToEmail: '',
    assignedBy: userProfile?.firstName && userProfile?.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}` 
      : '',
    
    // Timeline
    targetDate: '',
    
    // Action Details
    action: {
      description: '',
      methodology: '',
      resources: [],
      estimatedCost: 0,
    },
    
    // Verification
    verification: {
      required: true,
      method: '',
      criteria: '',
    },
  })

  useEffect(() => {
    loadData()
  }, [incidentId])

  const loadData = async () => {
    setLoadingData(true)
    try {
      const [operatorsData] = await Promise.all([
        getOperators()
      ])
      setOperators(operatorsData)
      
      // Load linked incident if specified
      if (incidentId) {
        try {
          const incident = await getIncident(incidentId)
          setLinkedIncident(incident)
          
          // Pre-populate from incident
          setFormData(prev => ({
            ...prev,
            sourceReference: incident.incidentNumber,
            problemStatement: incident.description || '',
            rootCause: incident.investigation?.findings || '',
          }))
        } catch (err) {
          console.error('Error loading linked incident:', err)
        }
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleActionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      action: { ...prev.action, [field]: value }
    }))
  }

  const handleVerificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      verification: { ...prev.verification, [field]: value }
    }))
  }

  const handleAssigneeChange = (operatorId) => {
    const operator = operators.find(o => o.id === operatorId)
    if (operator) {
      setFormData(prev => ({
        ...prev,
        assignedTo: `${operator.firstName} ${operator.lastName}`,
        assignedToEmail: operator.email || ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        assignedTo: '',
        assignedToEmail: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.title.trim()) {
      alert('Please enter a CAPA title')
      return
    }
    
    if (!formData.problemStatement.trim()) {
      alert('Please enter a problem statement')
      return
    }
    
    if (!formData.action.description.trim()) {
      alert('Please enter the planned action')
      return
    }
    
    setSaving(true)
    
    try {
      const capa = await createCapa({
        ...formData,
        targetDate: formData.targetDate ? new Date(formData.targetDate) : null,
        relatedIncidentId: incidentId || null,
      })
      
      // Navigate to the new CAPA
      navigate(`/capas/${capa.id}`, { 
        state: { message: 'CAPA created successfully' } 
      })
    } catch (err) {
      console.error('Error creating CAPA:', err)
      alert('Failed to create CAPA. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Calculate default target date based on priority
  const getDefaultTargetDate = (priority) => {
    const days = PRIORITY_LEVELS[priority]?.daysToResolve || 14
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create CAPA</h1>
          <p className="text-gray-600 mt-1">Corrective and Preventive Action</p>
        </div>
      </div>

      {/* Linked Incident Info */}
      {linkedIncident && (
        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900">Linked to Incident</h3>
              <p className="text-sm text-orange-700 mt-1">
                {linkedIncident.incidentNumber}: {linkedIncident.title}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Classification */}
        <FormSection 
          title="Classification" 
          description="Define the type and priority of this CAPA"
          icon={Target}
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CAPA Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="input"
                required
              >
                {Object.entries(CAPA_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>{type.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {CAPA_TYPES[formData.type]?.description}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => {
                  handleChange('priority', e.target.value)
                  // Auto-set target date based on priority if not already set
                  if (!formData.targetDate) {
                    handleChange('targetDate', getDefaultTargetDate(e.target.value))
                  }
                }}
                className="input"
                required
              >
                {Object.entries(PRIORITY_LEVELS).map(([key, level]) => (
                  <option key={key} value={key}>
                    {level.label} ({level.daysToResolve} days)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="input"
              >
                <option value="">Select category...</option>
                <option value="HSE">HSE</option>
                <option value="Operations">Operations</option>
                <option value="Equipment">Equipment</option>
                <option value="Training">Training</option>
                <option value="Procedures">Procedures</option>
                <option value="Documentation">Documentation</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          {/* Source Information */}
          <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Type
              </label>
              <select
                value={formData.sourceType}
                onChange={(e) => handleChange('sourceType', e.target.value)}
                className="input"
                disabled={!!incidentId}
              >
                <option value="incident">Incident</option>
                <option value="audit">Audit Finding</option>
                <option value="observation">Observation</option>
                <option value="inspection">Inspection</option>
                <option value="meeting">Meeting Action</option>
                <option value="drill">Drill Gap</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Reference
              </label>
              <input
                type="text"
                value={formData.sourceReference}
                onChange={(e) => handleChange('sourceReference', e.target.value)}
                className="input"
                placeholder="e.g., INC-2026-0001, Audit Finding #3"
                disabled={!!incidentId}
              />
            </div>
          </div>
        </FormSection>

        {/* Problem Description */}
        <FormSection 
          title="Problem Description" 
          description="Describe the issue that needs to be addressed"
          icon={Info}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CAPA Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="input"
                placeholder="Brief title describing the action"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Statement *
              </label>
              <textarea
                value={formData.problemStatement}
                onChange={(e) => handleChange('problemStatement', e.target.value)}
                className="input"
                rows={4}
                placeholder="Describe the problem or issue that triggered this CAPA..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Root Cause
              </label>
              <textarea
                value={formData.rootCause}
                onChange={(e) => handleChange('rootCause', e.target.value)}
                className="input"
                rows={3}
                placeholder="What is the underlying cause of this problem?"
              />
            </div>
          </div>
        </FormSection>

        {/* Planned Action */}
        <FormSection 
          title="Planned Action" 
          description="What will be done to address the problem?"
          icon={FileText}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Description *
              </label>
              <textarea
                value={formData.action.description}
                onChange={(e) => handleActionChange('description', e.target.value)}
                className="input"
                rows={4}
                placeholder="Describe the specific actions that will be taken..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Methodology
              </label>
              <textarea
                value={formData.action.methodology}
                onChange={(e) => handleActionChange('methodology', e.target.value)}
                className="input"
                rows={2}
                placeholder="How will the action be implemented?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Cost ($)
              </label>
              <input
                type="number"
                value={formData.action.estimatedCost}
                onChange={(e) => handleActionChange('estimatedCost', parseFloat(e.target.value) || 0)}
                className="input w-48"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </FormSection>

        {/* Assignment */}
        <FormSection 
          title="Assignment" 
          description="Who is responsible and when is it due?"
          icon={User}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <select
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="input"
              >
                <option value="">Select assignee...</option>
                {operators.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.firstName} {op.lastName}
                  </option>
                ))}
              </select>
              {formData.assignedTo && (
                <p className="text-xs text-gray-500 mt-1">
                  {formData.assignedTo} {formData.assignedToEmail && `(${formData.assignedToEmail})`}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => handleChange('targetDate', e.target.value)}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
              {formData.priority && (
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: {PRIORITY_LEVELS[formData.priority]?.daysToResolve} days for {formData.priority} priority
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned By
              </label>
              <input
                type="text"
                value={formData.assignedBy}
                onChange={(e) => handleChange('assignedBy', e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </div>
          </div>
        </FormSection>

        {/* Verification */}
        <FormSection 
          title="Verification of Effectiveness" 
          description="How will effectiveness be verified?"
          icon={Target}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.verification.required}
                  onChange={(e) => handleVerificationChange('required', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Verification of effectiveness required</span>
              </label>
            </div>
            
            {formData.verification.required && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Method
                  </label>
                  <select
                    value={formData.verification.method}
                    onChange={(e) => handleVerificationChange('method', e.target.value)}
                    className="input"
                  >
                    <option value="">Select method...</option>
                    <option value="inspection">Inspection</option>
                    <option value="audit">Audit</option>
                    <option value="review">Document Review</option>
                    <option value="testing">Testing</option>
                    <option value="observation">Observation</option>
                    <option value="interview">Interview</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Success Criteria
                  </label>
                  <textarea
                    value={formData.verification.criteria}
                    onChange={(e) => handleVerificationChange('criteria', e.target.value)}
                    className="input"
                    rows={2}
                    placeholder="How will you measure if the action was effective?"
                  />
                </div>
              </>
            )}
          </div>
        </FormSection>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn-primary inline-flex items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create CAPA
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
