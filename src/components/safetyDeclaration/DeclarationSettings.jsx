/**
 * DeclarationSettings.jsx
 * Settings and configuration panel for a safety declaration
 *
 * Features:
 * - Edit declaration details
 * - Edit RPAS system info
 * - Edit declarant info
 * - Change status
 * - Archive/delete declaration
 * - Export declaration data
 *
 * @location src/components/safetyDeclaration/DeclarationSettings.jsx
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Save,
  Trash2,
  Archive,
  Download,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  X,
  Loader2,
  Plane,
  User,
  FileText,
  RefreshCw
} from 'lucide-react'
import {
  updateSafetyDeclaration,
  updateDeclarationStatus,
  deleteSafetyDeclaration,
  logActivity,
  DECLARATION_STATUSES,
  DECLARATION_TYPES,
  RPAS_CATEGORIES,
  KINETIC_ENERGY_CATEGORIES,
  calculateKineticEnergy,
  getKineticEnergyCategory,
  getRPASCategory
} from '../../lib/firestoreSafetyDeclaration'

export default function DeclarationSettings({
  declaration,
  declarationId,
  onUpdate
}) {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('general')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form states
  const [generalForm, setGeneralForm] = useState({
    name: declaration?.name || '',
    description: declaration?.description || '',
    declarationType: declaration?.declarationType || 'declaration',
    robustnessLevel: declaration?.robustnessLevel || 'low'
  })

  const [rpasForm, setRpasForm] = useState({
    manufacturer: declaration?.rpasDetails?.manufacturer || '',
    model: declaration?.rpasDetails?.model || '',
    serialNumber: declaration?.rpasDetails?.serialNumber || '',
    weightKg: declaration?.rpasDetails?.weightKg || '',
    maxVelocityMs: declaration?.rpasDetails?.maxVelocityMs || '',
    description: declaration?.rpasDetails?.description || ''
  })

  const [declarantForm, setDeclarantForm] = useState({
    name: declaration?.declarantInfo?.name || '',
    organization: declaration?.declarantInfo?.organization || '',
    email: declaration?.declarantInfo?.email || '',
    phone: declaration?.declarantInfo?.phone || '',
    address: declaration?.declarantInfo?.address || ''
  })

  // Calculate derived RPAS values
  const calculatedKE = rpasForm.weightKg && rpasForm.maxVelocityMs
    ? calculateKineticEnergy(parseFloat(rpasForm.weightKg), parseFloat(rpasForm.maxVelocityMs))
    : 0
  const keCategory = getKineticEnergyCategory(calculatedKE)
  const rpasCategory = getRPASCategory(parseFloat(rpasForm.weightKg) || 0)

  const handleSaveGeneral = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await updateSafetyDeclaration(declarationId, {
        name: generalForm.name,
        description: generalForm.description,
        declarationType: generalForm.declarationType,
        robustnessLevel: generalForm.robustnessLevel
      })

      await logActivity(declarationId, {
        type: 'declaration_updated',
        description: 'General settings updated',
        details: { fields: ['name', 'description', 'type', 'robustness'] }
      })

      setSuccess('General settings saved successfully')
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error saving general settings:', err)
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveRPAS = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await updateSafetyDeclaration(declarationId, {
        rpasDetails: {
          manufacturer: rpasForm.manufacturer,
          model: rpasForm.model,
          serialNumber: rpasForm.serialNumber,
          weightKg: parseFloat(rpasForm.weightKg) || 0,
          maxVelocityMs: parseFloat(rpasForm.maxVelocityMs) || 0,
          maxKineticEnergy: calculatedKE,
          category: rpasCategory,
          kineticEnergyCategory: keCategory,
          description: rpasForm.description
        }
      })

      await logActivity(declarationId, {
        type: 'declaration_updated',
        description: 'RPAS system details updated',
        details: { manufacturer: rpasForm.manufacturer, model: rpasForm.model }
      })

      setSuccess('RPAS details saved successfully')
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error saving RPAS details:', err)
      setError(err.message || 'Failed to save RPAS details')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDeclarant = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await updateSafetyDeclaration(declarationId, {
        declarantInfo: {
          name: declarantForm.name,
          organization: declarantForm.organization,
          email: declarantForm.email,
          phone: declarantForm.phone,
          address: declarantForm.address
        }
      })

      await logActivity(declarationId, {
        type: 'declaration_updated',
        description: 'Declarant information updated',
        details: { name: declarantForm.name, organization: declarantForm.organization }
      })

      setSuccess('Declarant information saved successfully')
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error saving declarant info:', err)
      setError(err.message || 'Failed to save declarant information')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    setSaving(true)
    setError(null)

    try {
      const oldStatus = declaration.status
      await updateDeclarationStatus(declarationId, newStatus)

      await logActivity(declarationId, {
        type: 'status_changed',
        description: `Status changed from ${DECLARATION_STATUSES[oldStatus]?.label} to ${DECLARATION_STATUSES[newStatus]?.label}`,
        details: { oldStatus, newStatus }
      })

      setSuccess('Status updated successfully')
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Error changing status:', err)
      setError(err.message || 'Failed to change status')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      await deleteSafetyDeclaration(declarationId)
      navigate('/safety-declarations')
    } catch (err) {
      console.error('Error deleting declaration:', err)
      setError(err.message || 'Failed to delete declaration')
      setDeleting(false)
    }
  }

  const handleExportJSON = () => {
    const exportData = {
      declaration,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `declaration-${declaration.name?.replace(/[^a-zA-Z0-9]/g, '_')}-export.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sections = [
    { id: 'general', label: 'General', icon: FileText },
    { id: 'rpas', label: 'RPAS System', icon: Plane },
    { id: 'declarant', label: 'Declarant', icon: User },
    { id: 'status', label: 'Status', icon: RefreshCw },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ]

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-green-700">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* General Settings */}
      {activeSection === 'general' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">General Settings</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Declaration Name</label>
            <input
              type="text"
              value={generalForm.name}
              onChange={(e) => setGeneralForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={generalForm.description}
              onChange={(e) => setGeneralForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Declaration Type</label>
              <select
                value={generalForm.declarationType}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, declarationType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(DECLARATION_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Robustness Level</label>
              <select
                value={generalForm.robustnessLevel}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, robustnessLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low Robustness</option>
                <option value="high">High Robustness</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveGeneral}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* RPAS Settings */}
      {activeSection === 'rpas' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">RPAS System Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input
                type="text"
                value={rpasForm.manufacturer}
                onChange={(e) => setRpasForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={rpasForm.model}
                onChange={(e) => setRpasForm(prev => ({ ...prev, model: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <input
                type="text"
                value={rpasForm.serialNumber}
                onChange={(e) => setRpasForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={rpasForm.weightKg}
                onChange={(e) => setRpasForm(prev => ({ ...prev, weightKg: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Velocity (m/s)</label>
              <input
                type="number"
                step="0.1"
                value={rpasForm.maxVelocityMs}
                onChange={(e) => setRpasForm(prev => ({ ...prev, maxVelocityMs: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calculated KE</label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">
                {calculatedKE.toFixed(2)} J ({KINETIC_ENERGY_CATEGORIES[keCategory]?.label})
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Description</label>
            <textarea
              value={rpasForm.description}
              onChange={(e) => setRpasForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Category:</strong> {RPAS_CATEGORIES[rpasCategory]?.label} |{' '}
              <strong>KE Category:</strong> {KINETIC_ENERGY_CATEGORIES[keCategory]?.label}
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveRPAS}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save RPAS Details
            </button>
          </div>
        </div>
      )}

      {/* Declarant Settings */}
      {activeSection === 'declarant' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Declarant Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={declarantForm.name}
                onChange={(e) => setDeclarantForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input
                type="text"
                value={declarantForm.organization}
                onChange={(e) => setDeclarantForm(prev => ({ ...prev, organization: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={declarantForm.email}
                onChange={(e) => setDeclarantForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={declarantForm.phone}
                onChange={(e) => setDeclarantForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={declarantForm.address}
              onChange={(e) => setDeclarantForm(prev => ({ ...prev, address: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveDeclarant}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Declarant Info
            </button>
          </div>
        </div>
      )}

      {/* Status Management */}
      {activeSection === 'status' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Declaration Status</h3>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Current Status:</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${DECLARATION_STATUSES[declaration?.status]?.color || 'bg-gray-100 text-gray-800'}`}>
              {DECLARATION_STATUSES[declaration?.status]?.label || declaration?.status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Change Status To:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(DECLARATION_STATUSES).map(([key, status]) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key)}
                  disabled={saving || declaration?.status === key}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    declaration?.status === key
                      ? 'border-blue-500 bg-blue-50 text-blue-700 cursor-default'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Export Data</h4>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export as JSON
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {activeSection === 'danger' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>

          <div className="border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Delete Declaration</h4>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete this declaration and all associated data including requirements,
              testing sessions, and evidence. This action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete Declaration
              </button>
            ) : (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700 mb-4">
                  Are you sure you want to delete "<strong>{declaration?.name}</strong>"?
                  This will permanently remove all data.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Yes, Delete Permanently
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
