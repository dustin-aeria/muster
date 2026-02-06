/**
 * CreateSORAModal.jsx
 * Modal for creating a new SORA assessment
 *
 * @location src/components/sora/CreateSORAModal.jsx
 */

import { useState, useEffect } from 'react'
import { X, FileText, Plane, Target, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganization } from '../../hooks/useOrganization'
import { createSORAAssessment } from '../../lib/firestoreSora'
import { subscribeToSFOCApplications } from '../../lib/firestoreSFOC'

export default function CreateSORAModal({ onClose, onSuccess, linkedSFOCId = null }) {
  const { user } = useAuth()
  const { organization } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sfocApplications, setSfocApplications] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: '',
    sfocApplicationId: linkedSFOCId || ''
  })

  // Load SFOC applications for linking
  useEffect(() => {
    if (!organization?.id) return

    const unsubscribe = subscribeToSFOCApplications(organization.id, (applications) => {
      // Filter to only show draft or in-progress SFOCs that don't have a SORA linked
      const linkable = applications.filter(app =>
        !app.soraAssessmentId &&
        !['approved', 'cancelled', 'expired'].includes(app.status)
      )
      setSfocApplications(linkable)
    })

    return () => unsubscribe()
  }, [organization?.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Please enter an assessment name')
      return
    }

    setLoading(true)

    try {
      const newAssessment = await createSORAAssessment({
        organizationId: organization.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        purpose: formData.purpose.trim(),
        sfocApplicationId: formData.sfocApplicationId || null,
        createdBy: user.uid
      })

      onSuccess(newAssessment)
    } catch (err) {
      console.error('Error creating SORA assessment:', err)
      setError('Failed to create assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">New SORA Assessment</h2>
                <p className="text-sm text-gray-500">JARUS SORA 2.5 Compliant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Assessment Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Pipeline Inspection BVLOS Operations"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the operation..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Purpose (for ConOps) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operational Purpose
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="What is the purpose of this operation? This will be part of your ConOps..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Link to SFOC */}
              {sfocApplications.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link to SFOC Application (Optional)
                  </label>
                  <select
                    value={formData.sfocApplicationId}
                    onChange={(e) => setFormData({ ...formData, sfocApplicationId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- No SFOC Link --</option>
                    {sfocApplications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.name} ({app.complexityLevel === 'high' ? 'High' : 'Medium'} Complexity)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Linking to an SFOC will automatically populate the SORA summary in your application.
                  </p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Assessment Workflow</h4>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Define Concept of Operations (ConOps)</li>
                  <li>2. Determine Ground Risk Class (GRC)</li>
                  <li>3. Determine Air Risk Class (ARC)</li>
                  <li>4. Calculate SAIL level</li>
                  <li>5. Define Containment Strategy</li>
                  <li>6. Complete OSO Compliance</li>
                  <li>7. Review and Submit</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Create Assessment
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
