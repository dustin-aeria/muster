/**
 * LogMaintenanceModal.jsx
 * Manual maintenance logging modal for schedules without forms
 * or ad-hoc maintenance entries
 *
 * @location src/components/maintenance/LogMaintenanceModal.jsx
 */

import { useState, useEffect } from 'react'
import {
  X,
  Save,
  Loader2,
  Plus,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  Upload,
  Paperclip,
  User
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { recordMaintenance } from '../../lib/firestoreMaintenance'

const SERVICE_TYPES = [
  { value: 'scheduled', label: 'Scheduled Maintenance' },
  { value: 'unscheduled', label: 'Unscheduled / Ad-hoc' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'repair', label: 'Repair' }
]

export default function LogMaintenanceModal({
  isOpen,
  onClose,
  item,
  schedule = null,
  onSuccess
}) {
  const { user, userProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    serviceDate: new Date().toISOString().split('T')[0],
    serviceType: 'scheduled',
    hoursAtService: '',
    cyclesAtService: '',
    flightsAtService: '',
    tasksCompleted: [],
    partsUsed: [],
    laborHours: '',
    laborRate: '75',
    notes: '',
    findings: ''
  })

  // Initialize form when opening
  useEffect(() => {
    if (isOpen) {
      const initialData = {
        serviceDate: new Date().toISOString().split('T')[0],
        serviceType: schedule ? 'scheduled' : 'unscheduled',
        hoursAtService: item?.currentHours || item?.totalFlightHours || '',
        cyclesAtService: item?.currentCycles || item?.totalCycles || '',
        flightsAtService: item?.totalFlights || '',
        tasksCompleted: schedule?.tasks?.map(t => ({
          taskId: t.id,
          name: t.name,
          completed: false,
          notes: ''
        })) || [],
        partsUsed: [],
        laborHours: '',
        laborRate: '75',
        notes: '',
        findings: ''
      }
      setFormData(initialData)
      setErrors({})
    }
  }, [isOpen, item, schedule])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleTaskToggle = (taskId) => {
    setFormData(prev => ({
      ...prev,
      tasksCompleted: prev.tasksCompleted.map(t =>
        t.taskId === taskId ? { ...t, completed: !t.completed } : t
      )
    }))
  }

  const handleTaskNotes = (taskId, notes) => {
    setFormData(prev => ({
      ...prev,
      tasksCompleted: prev.tasksCompleted.map(t =>
        t.taskId === taskId ? { ...t, notes } : t
      )
    }))
  }

  const handleAddPart = () => {
    setFormData(prev => ({
      ...prev,
      partsUsed: [
        ...prev.partsUsed,
        { id: `part_${Date.now()}`, name: '', partNumber: '', quantity: 1, cost: '' }
      ]
    }))
  }

  const handleUpdatePart = (partId, field, value) => {
    setFormData(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.map(p =>
        p.id === partId ? { ...p, [field]: value } : p
      )
    }))
  }

  const handleRemovePart = (partId) => {
    setFormData(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.filter(p => p.id !== partId)
    }))
  }

  // Calculate costs
  const laborCost = (parseFloat(formData.laborHours) || 0) * (parseFloat(formData.laborRate) || 0)
  const partsCost = formData.partsUsed.reduce((sum, p) => sum + ((parseFloat(p.cost) || 0) * (parseInt(p.quantity) || 1)), 0)
  const totalCost = laborCost + partsCost

  const validate = () => {
    const newErrors = {}

    if (!formData.serviceDate) {
      newErrors.serviceDate = 'Service date is required'
    }

    // Check if all required tasks are completed (if schedule has tasks)
    if (schedule?.tasks?.length > 0) {
      const requiredTasks = schedule.tasks.filter(t => t.required)
      const completedTaskIds = formData.tasksCompleted.filter(t => t.completed).map(t => t.taskId)
      const missingRequired = requiredTasks.filter(t => !completedTaskIds.includes(t.id))

      if (missingRequired.length > 0) {
        newErrors.tasks = `Complete all required tasks: ${missingRequired.map(t => t.name).join(', ')}`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      const recordData = {
        scheduleId: schedule?.id || null,
        scheduleName: schedule?.name || null,
        itemName: item?.name || item?.nickname || '',
        serviceType: formData.serviceType,
        serviceDate: new Date(formData.serviceDate),
        completedBy: user?.uid,
        completedByName: userProfile?.displayName || user?.email || 'Unknown',
        hoursAtService: formData.hoursAtService ? parseFloat(formData.hoursAtService) : null,
        cyclesAtService: formData.cyclesAtService ? parseInt(formData.cyclesAtService) : null,
        flightsAtService: formData.flightsAtService ? parseInt(formData.flightsAtService) : null,
        tasksCompleted: formData.tasksCompleted,
        partsUsed: formData.partsUsed.filter(p => p.name).map(p => ({
          name: p.name,
          partNumber: p.partNumber,
          quantity: parseInt(p.quantity) || 1,
          cost: parseFloat(p.cost) || 0
        })),
        laborHours: parseFloat(formData.laborHours) || 0,
        laborCost,
        partsCost,
        totalCost,
        notes: formData.notes,
        findings: formData.findings,
        status: 'completed'
      }

      await recordMaintenance(item.id, item.itemType, recordData)

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err) {
      console.error('Failed to save maintenance record:', err)
      setErrors({ submit: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const itemName = item?.name || item?.nickname || 'Item'
  const isAircraft = item?.itemType === 'aircraft'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {schedule ? `Log: ${schedule.name}` : 'Log Maintenance Service'}
            </h2>
            <p className="text-sm text-gray-500">{itemName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Service Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Date *
              </label>
              <input
                type="date"
                value={formData.serviceDate}
                onChange={(e) => handleChange('serviceDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy ${
                  errors.serviceDate ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.serviceDate && (
                <p className="mt-1 text-sm text-red-600">{errors.serviceDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => handleChange('serviceType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy bg-white"
              >
                {SERVICE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Meter Readings */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Meter Readings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {isAircraft ? 'Flight Hours' : 'Operating Hours'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hoursAtService}
                  onChange={(e) => handleChange('hoursAtService', e.target.value)}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cycles</label>
                <input
                  type="number"
                  value={formData.cyclesAtService}
                  onChange={(e) => handleChange('cyclesAtService', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>
              {isAircraft && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Flights</label>
                  <input
                    type="number"
                    value={formData.flightsAtService}
                    onChange={(e) => handleChange('flightsAtService', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tasks Checklist (if schedule has tasks) */}
          {formData.tasksCompleted.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Tasks</h3>
              <div className="space-y-2">
                {formData.tasksCompleted.map(task => {
                  const scheduleTask = schedule?.tasks?.find(t => t.id === task.taskId)
                  return (
                    <div key={task.taskId} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleTaskToggle(task.taskId)}
                          className="mt-1 w-4 h-4 rounded border-gray-300 text-aeria-navy focus:ring-aeria-navy"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${task.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                            {task.name}
                            {scheduleTask?.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </p>
                          <input
                            type="text"
                            value={task.notes}
                            onChange={(e) => handleTaskNotes(task.taskId, e.target.value)}
                            placeholder="Notes (optional)"
                            className="mt-2 w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-aeria-navy"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {errors.tasks && (
                <p className="mt-2 text-sm text-red-600">{errors.tasks}</p>
              )}
            </div>
          )}

          {/* Parts Used */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Parts / Consumables</h3>
              <button
                onClick={handleAddPart}
                className="flex items-center gap-1 text-sm text-aeria-navy hover:text-aeria-navy/80"
              >
                <Plus className="w-4 h-4" />
                Add Part
              </button>
            </div>

            {formData.partsUsed.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No parts recorded</p>
            ) : (
              <div className="space-y-2">
                {formData.partsUsed.map(part => (
                  <div key={part.id} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={part.name}
                      onChange={(e) => handleUpdatePart(part.id, 'name', e.target.value)}
                      placeholder="Part name"
                      className="col-span-4 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-aeria-navy"
                    />
                    <input
                      type="text"
                      value={part.partNumber}
                      onChange={(e) => handleUpdatePart(part.id, 'partNumber', e.target.value)}
                      placeholder="Part #"
                      className="col-span-3 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-aeria-navy"
                    />
                    <input
                      type="number"
                      value={part.quantity}
                      onChange={(e) => handleUpdatePart(part.id, 'quantity', e.target.value)}
                      placeholder="Qty"
                      min="1"
                      className="col-span-2 px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-aeria-navy"
                    />
                    <div className="col-span-2 relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={part.cost}
                        onChange={(e) => handleUpdatePart(part.id, 'cost', e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-aeria-navy"
                      />
                    </div>
                    <button
                      onClick={() => handleRemovePart(part.id)}
                      className="col-span-1 p-1.5 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Labor */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Labor</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.laborHours}
                  onChange={(e) => handleChange('laborHours', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Rate ($/hr)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.laborRate}
                  onChange={(e) => handleChange('laborRate', e.target.value)}
                  placeholder="75"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                />
              </div>
            </div>
          </div>

          {/* Notes & Findings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="General notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
              <textarea
                value={formData.findings}
                onChange={(e) => handleChange('findings', e.target.value)}
                placeholder="Issues discovered..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy"
              />
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Cost Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Labor ({formData.laborHours || 0} hrs @ ${formData.laborRate || 0}/hr)</span>
                <span className="font-medium">${laborCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Parts ({formData.partsUsed.length} items)</span>
                <span className="font-medium">${partsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-semibold text-aeria-navy">${totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>Logged by: {userProfile?.displayName || user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-navy/90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Record
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
