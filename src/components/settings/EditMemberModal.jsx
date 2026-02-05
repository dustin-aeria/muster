/**
 * EditMemberModal.jsx
 * Modal for editing team member details, job info, and allowances
 *
 * @location src/components/settings/EditMemberModal.jsx
 */

import { useState, useEffect } from 'react'
import { X, Loader2, User, Briefcase, Calendar, DollarSign, FileText } from 'lucide-react'
import { updateMemberDetails } from '../../lib/firestoreOrganizations'
import { useAuth } from '../../contexts/AuthContext'

export default function EditMemberModal({
  isOpen,
  onClose,
  member,
  onSuccess
}) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    employeeId: '',
    startDate: '',
    ptoAllowance: '',
    sickAllowance: '',
    hourlyRate: '',
    notes: ''
  })

  // Initialize form with member data
  useEffect(() => {
    if (member) {
      setFormData({
        jobTitle: member.jobTitle || '',
        department: member.department || '',
        employeeId: member.employeeId || '',
        startDate: member.startDate || '',
        ptoAllowance: member.ptoAllowance ?? '',
        sickAllowance: member.sickAllowance ?? '',
        hourlyRate: member.hourlyRate ?? '',
        notes: member.notes || ''
      })
    }
  }, [member])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Convert numeric fields
      const details = {
        ...formData,
        ptoAllowance: formData.ptoAllowance ? Number(formData.ptoAllowance) : null,
        sickAllowance: formData.sickAllowance ? Number(formData.sickAllowance) : null,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : null
      }

      await updateMemberDetails(member.id, details, user?.uid)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error updating member:', err)
      setError(err.message || 'Failed to update member details')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const memberName = member?.userDetails
    ? `${member.userDetails.firstName} ${member.userDetails.lastName}`
    : member?.email || 'Team Member'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Team Member</h2>
            <p className="text-sm text-gray-500">{memberName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Job Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              Job Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g., Drone Pilot"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., Operations"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="e.g., EMP-001"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Allowances */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Time Off Allowances (days per year)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">PTO / Vacation Days</label>
                <input
                  type="number"
                  name="ptoAllowance"
                  value={formData.ptoAllowance}
                  onChange={handleChange}
                  placeholder="e.g., 15"
                  min="0"
                  step="0.5"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Sick Days</label>
                <input
                  type="number"
                  name="sickAllowance"
                  value={formData.sickAllowance}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  min="0"
                  step="0.5"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              Compensation
            </h3>
            <div>
              <label className="label">Hourly Rate ($)</label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder="e.g., 35.00"
                min="0"
                step="0.01"
                className="input w-48"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for time tracking cost calculations
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              Notes
            </h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes about this team member..."
              rows={3}
              className="input"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
