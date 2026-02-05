/**
 * CreateProjectModal.jsx
 * Modal for creating a new document project with client selection and branding
 */

import { useState, useEffect } from 'react'
import { X, Building2, Palette, FileText, ChevronRight, ChevronLeft } from 'lucide-react'
import { useOrganization } from '../../hooks/useOrganization'
import { getClients } from '../../lib/firestore'

export default function CreateProjectModal({ isOpen, onClose, onSubmit }) {
  const { organization } = useOrganization()
  const [step, setStep] = useState(1)
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    name: '',
    description: '',
    companyProfile: '',
    operationsScope: '',
    aircraftTypes: [],
    regulations: [],
    customContext: '',
    branding: {
      name: '',
      logo: null,
      colors: {
        primary: '#1e3a5f',
        secondary: '#2563eb',
        accent: '#3b82f6'
      }
    }
  })

  const [newAircraftType, setNewAircraftType] = useState('')
  const [newRegulation, setNewRegulation] = useState('')

  // Load clients
  useEffect(() => {
    if (isOpen && organization?.id) {
      setLoadingClients(true)
      getClients(organization.id)
        .then(setClients)
        .catch(console.error)
        .finally(() => setLoadingClients(false))
    }
  }, [isOpen, organization?.id])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setFormData({
        clientId: '',
        clientName: '',
        name: '',
        description: '',
        companyProfile: '',
        operationsScope: '',
        aircraftTypes: [],
        regulations: [],
        customContext: '',
        branding: {
          name: '',
          logo: null,
          colors: {
            primary: '#1e3a5f',
            secondary: '#2563eb',
            accent: '#3b82f6'
          }
        }
      })
    }
  }, [isOpen])

  const handleClientSelect = (clientId) => {
    const client = clients.find(c => c.id === clientId)
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName: client?.name || '',
      branding: {
        ...prev.branding,
        name: client?.name || ''
      }
    }))
  }

  const handleAddAircraftType = () => {
    if (newAircraftType.trim()) {
      setFormData(prev => ({
        ...prev,
        aircraftTypes: [...prev.aircraftTypes, newAircraftType.trim()]
      }))
      setNewAircraftType('')
    }
  }

  const handleRemoveAircraftType = (index) => {
    setFormData(prev => ({
      ...prev,
      aircraftTypes: prev.aircraftTypes.filter((_, i) => i !== index)
    }))
  }

  const handleAddRegulation = () => {
    if (newRegulation.trim()) {
      setFormData(prev => ({
        ...prev,
        regulations: [...prev.regulations, newRegulation.trim()]
      }))
      setNewRegulation('')
    }
  }

  const handleRemoveRegulation = (index) => {
    setFormData(prev => ({
      ...prev,
      regulations: prev.regulations.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const canProceedStep1 = formData.clientId && formData.name.trim()
  const canProceedStep2 = true // Context is optional
  const canSubmit = canProceedStep1

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Create Document Project
              </h2>
              <p className="text-sm text-gray-500">
                Step {step} of 3
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`flex-1 h-1.5 rounded-full transition-colors ${
                    s <= step ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">Client & Project Details</span>
                </div>

                {/* Client Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  {loadingClients ? (
                    <div className="animate-pulse h-10 bg-gray-100 rounded-lg" />
                  ) : (
                    <select
                      value={formData.clientId}
                      onChange={(e) => handleClientSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., 2024 Compliance Documentation Suite"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this documentation project..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Context */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Shared Context (Optional)</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  This context will be shared across all documents in the project to maintain consistency.
                </p>

                {/* Company Profile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Profile
                  </label>
                  <textarea
                    value={formData.companyProfile}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyProfile: e.target.value }))}
                    placeholder="Brief company overview, history, core operations..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Operations Scope */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operations Scope
                  </label>
                  <textarea
                    value={formData.operationsScope}
                    onChange={(e) => setFormData(prev => ({ ...prev, operationsScope: e.target.value }))}
                    placeholder="Types of operations, geographic coverage, services offered..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Aircraft Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aircraft Types
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newAircraftType}
                      onChange={(e) => setNewAircraftType(e.target.value)}
                      placeholder="Add aircraft type..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAircraftType())}
                    />
                    <button
                      type="button"
                      onClick={handleAddAircraftType}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.aircraftTypes.map((type, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                      >
                        {type}
                        <button onClick={() => handleRemoveAircraftType(index)} className="hover:text-blue-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Regulations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applicable Regulations
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newRegulation}
                      onChange={(e) => setNewRegulation(e.target.value)}
                      placeholder="e.g., CARs Part IX, SFOC requirements..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRegulation())}
                    />
                    <button
                      type="button"
                      onClick={handleAddRegulation}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.regulations.map((reg, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                      >
                        {reg}
                        <button onClick={() => handleRemoveRegulation(index)} className="hover:text-green-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Branding */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 mb-4">
                  <Palette className="w-5 h-5" />
                  <span className="font-medium">Branding (Optional)</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Customize the appearance of exported documents.
                </p>

                {/* Brand Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.branding.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, name: e.target.value }
                    }))}
                    placeholder="Company name for documents"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.branding.colors.primary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            colors: { ...prev.branding.colors, primary: e.target.value }
                          }
                        }))}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.branding.colors.primary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            colors: { ...prev.branding.colors, primary: e.target.value }
                          }
                        }))}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.branding.colors.secondary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            colors: { ...prev.branding.colors, secondary: e.target.value }
                          }
                        }))}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.branding.colors.secondary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            colors: { ...prev.branding.colors, secondary: e.target.value }
                          }
                        }))}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.branding.colors.accent}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            colors: { ...prev.branding.colors, accent: e.target.value }
                          }
                        }))}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.branding.colors.accent}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            colors: { ...prev.branding.colors, accent: e.target.value }
                          }
                        }))}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-4 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Preview:</p>
                  <div
                    className="h-2 rounded-full mb-2"
                    style={{ backgroundColor: formData.branding.colors.primary }}
                  />
                  <div className="flex gap-2">
                    <div
                      className="flex-1 h-8 rounded flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: formData.branding.colors.primary }}
                    >
                      Primary
                    </div>
                    <div
                      className="flex-1 h-8 rounded flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: formData.branding.colors.secondary }}
                    >
                      Secondary
                    </div>
                    <div
                      className="flex-1 h-8 rounded flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: formData.branding.colors.accent }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4" />
              {step > 1 ? 'Back' : 'Cancel'}
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !canProceedStep1}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="flex items-center gap-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
