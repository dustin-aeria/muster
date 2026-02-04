/**
 * ActivityForm.jsx
 * Form for starting and editing in-field activities
 *
 * @location src/components/activities/ActivityForm.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Timer,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Tag,
  FileText,
  Bookmark
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganizationContext } from '../../contexts/OrganizationContext'
import { getProjects } from '../../lib/firestore'
import {
  startActivity,
  updateActivity,
  ACTIVITY_CATEGORIES,
  METHOD_TAGS,
  REPORT_SECTIONS
} from '../../lib/firestoreActivities'
import { logger } from '../../lib/logger'
import { FormField } from '../ui/FormField'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Toggle } from '../ui/Toggle'

/**
 * Activity Form Component
 */
export default function ActivityForm({
  activity = null,
  projectId = null,
  siteId = null,
  onClose,
  onSaved,
  onStarted
}) {
  const { user, userProfile } = useAuth()
  const { organizationId } = useOrganizationContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isEditing = !!activity

  // Form state
  const [formData, setFormData] = useState({
    projectId: activity?.projectId || projectId || '',
    siteId: activity?.siteId || siteId || '',
    name: activity?.name || '',
    category: activity?.category || 'other',
    notes: activity?.notes || '',
    methodsUsed: activity?.methodsUsed || [],
    informationGathered: activity?.informationGathered || '',
    includeInReport: activity?.includeInReport ?? true,
    reportSection: activity?.reportSection || 'fieldwork'
  })

  // Projects list
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  // Load projects
  useEffect(() => {
    if (organizationId) {
      loadProjects()
    }
  }, [organizationId])

  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      const allProjects = await getProjects(organizationId)
      const availableProjects = allProjects.filter(p => p.status !== 'archived')
      setProjects(availableProjects)
    } catch (err) {
      logger.error('Failed to load projects:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  // Get selected project
  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === formData.projectId)
  }, [projects, formData.projectId])

  // Get sites for selected project
  const availableSites = useMemo(() => {
    if (!selectedProject?.sites) return []
    return selectedProject.sites.map(site => ({
      value: site.id,
      label: site.name || 'Unnamed Site'
    }))
  }, [selectedProject])

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      if (field === 'projectId' && value !== prev.projectId) {
        updated.siteId = ''
      }
      return updated
    })
  }

  // Handle method tag toggle
  const handleMethodToggle = (method) => {
    setFormData(prev => {
      const methods = prev.methodsUsed.includes(method)
        ? prev.methodsUsed.filter(m => m !== method)
        : [...prev.methodsUsed, method]
      return { ...prev, methodsUsed: methods }
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.projectId) {
      setError('Please select a project')
      return
    }
    if (!formData.name.trim()) {
      setError('Please enter an activity name')
      return
    }

    try {
      setLoading(true)

      const activityData = {
        projectId: formData.projectId,
        projectName: selectedProject?.name || '',
        siteId: formData.siteId || null,
        siteName: availableSites.find(s => s.value === formData.siteId)?.label || '',
        name: formData.name.trim(),
        category: formData.category,
        notes: formData.notes,
        methodsUsed: formData.methodsUsed,
        informationGathered: formData.informationGathered,
        includeInReport: formData.includeInReport,
        reportSection: formData.reportSection,
        operatorId: user.uid,
        operatorName: userProfile?.displayName || user.email
      }

      if (isEditing) {
        await updateActivity(activity.id, activityData)
        onSaved?.()
      } else {
        const newActivity = await startActivity(activityData, organizationId)
        onStarted?.(newActivity)
      }

      onClose?.()
    } catch (err) {
      logger.error('Failed to save activity:', err)
      setError(err.message || 'Failed to save activity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Timer className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold">
              {isEditing ? 'Edit Activity' : 'Start Activity'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Project */}
          <FormField label="Project" required>
            <select
              value={formData.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              disabled={loadingProjects || isEditing}
            >
              <option value="">Select a project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </FormField>

          {/* Site (if multi-site project) */}
          {availableSites.length > 0 && (
            <FormField label="Site">
              <select
                value={formData.siteId}
                onChange={(e) => handleChange('siteId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={isEditing}
              >
                <option value="">All sites</option>
                {availableSites.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </FormField>
          )}

          {/* Activity Name */}
          <FormField label="Activity Name" required>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Site Survey, Data Collection, Inspection"
              icon={<FileText className="w-4 h-4" />}
            />
          </FormField>

          {/* Category */}
          <FormField label="Category">
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {Object.entries(ACTIVITY_CATEGORIES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </FormField>

          {/* Methods Used (Tags) */}
          <FormField label="Methods Used">
            <div className="flex flex-wrap gap-2">
              {METHOD_TAGS.map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => handleMethodToggle(method)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    formData.methodsUsed.includes(method)
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {method}
                </button>
              ))}
            </div>
          </FormField>

          {/* Initial Notes */}
          <FormField label="Notes">
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any notes about this activity..."
              rows={2}
            />
          </FormField>

          {/* Information Gathered (for editing) */}
          {isEditing && (
            <FormField label="Information Gathered">
              <Textarea
                value={formData.informationGathered}
                onChange={(e) => handleChange('informationGathered', e.target.value)}
                placeholder="Summarize findings and observations..."
                rows={3}
              />
            </FormField>
          )}

          {/* Report Inclusion */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-700">Include in Report</label>
                <p className="text-sm text-gray-500">Add this activity to the project report</p>
              </div>
              <Toggle
                checked={formData.includeInReport}
                onChange={(checked) => handleChange('includeInReport', checked)}
              />
            </div>

            {formData.includeInReport && (
              <FormField label="Report Section">
                <select
                  value={formData.reportSection}
                  onChange={(e) => handleChange('reportSection', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {Object.entries(REPORT_SECTIONS).map(([key, { label, description }]) => (
                    <option key={key} value={key}>{label} - {description}</option>
                  ))}
                </select>
              </FormField>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Saving...' : 'Starting...'}
                </>
              ) : isEditing ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Update Activity
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Timer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
