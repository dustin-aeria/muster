/**
 * ExpenseForm.jsx
 * Form for creating and editing expenses with receipt capture
 *
 * @location src/components/expenses/ExpenseForm.jsx
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  X,
  Camera,
  Upload,
  Receipt,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganizationContext } from '../../contexts/OrganizationContext'
import { getProjects } from '../../lib/firestore'
import {
  createExpense,
  updateExpense,
  EXPENSE_CATEGORIES
} from '../../lib/firestoreExpenses'
import { uploadExpenseReceipt } from '../../lib/storageHelpers'
import { logger } from '../../lib/logger'
import { FormField } from '../ui/FormField'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Toggle } from '../ui/Toggle'

/**
 * Expense Form Component
 */
export default function ExpenseForm({
  expense = null,
  projectId = null,
  siteId = null,
  onClose,
  onSaved
}) {
  const { user, userProfile } = useAuth()
  const { organizationId } = useOrganizationContext()
  const [loading, setLoading] = useState(false)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [error, setError] = useState(null)

  // Receipt capture refs
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Form state
  const [formData, setFormData] = useState({
    projectId: expense?.projectId || projectId || '',
    siteId: expense?.siteId || siteId || '',
    vendor: expense?.vendor || '',
    amount: expense?.amount || '',
    currency: expense?.currency || 'CAD',
    date: expense?.date || new Date().toISOString().split('T')[0],
    category: expense?.category || 'other',
    description: expense?.description || '',
    isBillable: expense?.isBillable ?? true
  })

  // Receipt state
  const [receipt, setReceipt] = useState(expense?.receipt || null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [ocrStatus, setOcrStatus] = useState(expense?.ocrStatus || null)
  const [ocrData, setOcrData] = useState(expense?.ocrData || null)

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

  // Handle receipt file selection
  const handleReceiptSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.')
      return
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setReceiptPreview(previewUrl)
    setReceipt({ file, previewUrl })
    setError(null)
  }

  // Remove receipt
  const handleRemoveReceipt = () => {
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview)
    }
    setReceipt(null)
    setReceiptPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  // Apply OCR data to form
  const applyOcrData = () => {
    if (!ocrData) return

    setFormData(prev => ({
      ...prev,
      vendor: ocrData.extractedVendor || prev.vendor,
      amount: ocrData.extractedAmount || prev.amount,
      date: ocrData.extractedDate || prev.date
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation - project is optional (for general costs)
    if (!formData.vendor) {
      setError('Please enter a vendor name')
      return
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (!formData.date) {
      setError('Please select a date')
      return
    }

    try {
      setLoading(true)

      // Upload receipt if new file selected
      let receiptData = expense?.receipt || null
      if (receipt?.file) {
        setUploadingReceipt(true)

        // Create a temporary expense ID for storage path
        const tempExpenseId = expense?.id || `temp_${Date.now()}`

        receiptData = await uploadExpenseReceipt(
          receipt.file,
          organizationId,
          formData.projectId,
          tempExpenseId
        )
        receiptData.archived = false
        setUploadingReceipt(false)
      }

      const expenseData = {
        projectId: formData.projectId || null,
        projectName: selectedProject?.name || '',
        siteId: formData.siteId || null,
        siteName: availableSites.find(s => s.value === formData.siteId)?.label || '',
        vendor: formData.vendor,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        date: formData.date,
        category: formData.category,
        description: formData.description,
        isBillable: formData.isBillable,
        receipt: receiptData,
        createdBy: user.uid,
        createdByName: userProfile?.displayName || user.email
      }

      if (expense?.id) {
        await updateExpense(expense.id, expenseData)
      } else {
        await createExpense(expenseData, organizationId)
      }

      onSaved?.()
      onClose?.()
    } catch (err) {
      logger.error('Failed to save expense:', err)
      setError(err.message || 'Failed to save expense')
    } finally {
      setLoading(false)
      setUploadingReceipt(false)
    }
  }

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (receiptPreview && !expense?.receipt) {
        URL.revokeObjectURL(receiptPreview)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Receipt className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold">
              {expense ? 'Edit Expense' : 'Add Expense'}
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

          {/* Receipt Capture */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Receipt Photo
            </label>

            {receipt?.url || receiptPreview ? (
              <div className="relative">
                <img
                  src={receipt?.url || receiptPreview}
                  alt="Receipt"
                  className="w-full max-h-48 object-contain rounded-lg border bg-gray-50"
                />
                <button
                  type="button"
                  onClick={handleRemoveReceipt}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* OCR Status */}
                {ocrStatus === 'processing' && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-full">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processing receipt...
                  </div>
                )}
                {ocrStatus === 'completed' && ocrData && (
                  <button
                    type="button"
                    onClick={applyOcrData}
                    className="absolute bottom-2 left-2 flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white text-xs rounded-full hover:bg-green-600"
                  >
                    <Sparkles className="w-3 h-3" />
                    Apply extracted data
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptSelect}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleReceiptSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors"
                >
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Take Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Upload</span>
                </button>
              </div>
            )}
          </div>

          {/* Project */}
          <FormField label="Project">
            <select
              value={formData.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              disabled={loadingProjects}
            >
              <option value="">General Cost (No Project)</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">All sites</option>
                {availableSites.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </FormField>
          )}

          {/* Vendor */}
          <FormField label="Vendor" required>
            <Input
              value={formData.vendor}
              onChange={(e) => handleChange('vendor', e.target.value)}
              placeholder="e.g., Gas Station, Restaurant, Hardware Store"
              icon={<Building2 className="w-4 h-4" />}
            />
          </FormField>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount" required>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </FormField>
            <FormField label="Currency">
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="CAD">CAD</option>
                <option value="USD">USD</option>
              </select>
            </FormField>
          </div>

          {/* Date */}
          <FormField label="Date" required>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              icon={<Calendar className="w-4 h-4" />}
            />
          </FormField>

          {/* Category */}
          <FormField label="Category">
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {Object.entries(EXPENSE_CATEGORIES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </FormField>

          {/* Description */}
          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add any notes about this expense..."
              rows={2}
            />
          </FormField>

          {/* Billable Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <label className="font-medium text-gray-700">Billable to Client</label>
              <p className="text-sm text-gray-500">Include this expense in client billing</p>
            </div>
            <Toggle
              checked={formData.isBillable}
              onChange={(checked) => handleChange('isBillable', checked)}
            />
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
              disabled={loading || uploadingReceipt}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading || uploadingReceipt ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadingReceipt ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {expense ? 'Update Expense' : 'Add Expense'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
