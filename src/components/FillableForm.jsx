/**
 * FillableForm Component
 * Renders parsed form fields as interactive input controls
 *
 * Features:
 * - Dynamic field rendering based on type
 * - Validation with error display
 * - Signature capture
 * - Auto-save draft functionality
 *
 * @version 1.0.0
 */

import { useState, useRef, useEffect } from 'react'
import {
  Calendar,
  Clock,
  CheckSquare,
  Square,
  Edit3,
  AlertCircle,
  Trash2,
  Save,
} from 'lucide-react'
import { validateField, validateForm } from '../lib/formParser'

// ============================================
// FIELD COMPONENTS
// ============================================

/**
 * Text input field
 */
function TextField({ field, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ''}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Textarea field
 */
function TextareaField({ field, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ''}
        rows={4}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Number input field
 */
function NumberField({ field, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ''}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Email input field
 */
function EmailField({ field, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="email"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || 'email@example.com'}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Phone input field
 */
function PhoneField({ field, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="tel"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || '(555) 555-5555'}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Date input field
 */
function DateField({ field, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * DateTime input field
 */
function DateTimeField({ field, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="datetime-local"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Time input field
 */
function TimeField({ field, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Single checkbox field
 */
function CheckboxField({ field, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-3 cursor-pointer">
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            value
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-gray-300 hover:border-blue-500'
          }`}
        >
          {value && <CheckSquare className="w-4 h-4" />}
        </button>
        <span className="text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1 ml-9">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Checkbox group field
 */
function CheckboxGroupField({ field, value, onChange, error }) {
  const selectedValues = Array.isArray(value) ? value : []

  const toggleOption = (optionValue) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter(v => v !== optionValue))
    } else {
      onChange([...selectedValues, optionValue])
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {field.options?.map((option) => (
          <label key={option.value} className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => toggleOption(option.value)}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                selectedValues.includes(option.value)
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 hover:border-blue-500'
              }`}
            >
              {selectedValues.includes(option.value) && <CheckSquare className="w-4 h-4" />}
            </button>
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Select dropdown field
 */
function SelectField({ field, value, onChange, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select...</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Signature capture field
 */
function SignatureField({ field, value, onChange, error }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Load existing signature if present
    if (value && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
      }
      img.src = value
    }
  }, [])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e) => {
    setIsDrawing(true)
    setLastPos(getPos(e))
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)

    ctx.beginPath()
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    setLastPos(pos)
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      // Save signature as data URL
      const dataUrl = canvasRef.current.toDataURL()
      onChange(dataUrl)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onChange('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={`border-2 rounded-lg overflow-hidden ${error ? 'border-red-500' : 'border-gray-300'}`}>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="w-full bg-gray-50 cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-t border-gray-200">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Edit3 className="w-4 h-4" />
            Draw your signature above
          </span>
          <button
            type="button"
            onClick={clearSignature}
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

// ============================================
// FIELD RENDERER
// ============================================

/**
 * Render a form field based on its type
 */
function FieldRenderer({ field, value, onChange, error }) {
  const props = { field, value, onChange, error }

  switch (field.type) {
    case 'text':
      return <TextField {...props} />
    case 'textarea':
      return <TextareaField {...props} />
    case 'number':
      return <NumberField {...props} />
    case 'email':
      return <EmailField {...props} />
    case 'phone':
      return <PhoneField {...props} />
    case 'date':
      return <DateField {...props} />
    case 'datetime':
      return <DateTimeField {...props} />
    case 'time':
      return <TimeField {...props} />
    case 'checkbox':
      return <CheckboxField {...props} />
    case 'checkbox-group':
      return <CheckboxGroupField {...props} />
    case 'select':
      return <SelectField {...props} />
    case 'signature':
      return <SignatureField {...props} />
    default:
      return <TextField {...props} />
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * FillableForm - Main form component
 *
 * @param {Object} props
 * @param {Array} props.fields - Field definitions from formParser
 * @param {Object} props.values - Current field values
 * @param {Function} props.onChange - Called when any field changes
 * @param {Function} props.onSubmit - Called when form is submitted
 * @param {Function} [props.onSaveDraft] - Called to save draft
 * @param {boolean} [props.readOnly] - Whether form is read-only
 * @param {boolean} [props.loading] - Whether form is loading/saving
 * @param {Object} [props.errors] - Validation errors by field ID
 */
export default function FillableForm({
  fields,
  values,
  onChange,
  onSubmit,
  onSaveDraft,
  readOnly = false,
  loading = false,
  errors = {},
}) {
  const [localValues, setLocalValues] = useState(values || {})
  const [localErrors, setLocalErrors] = useState(errors)
  const [isDirty, setIsDirty] = useState(false)

  // Sync with external values
  useEffect(() => {
    setLocalValues(values || {})
  }, [values])

  useEffect(() => {
    setLocalErrors(errors)
  }, [errors])

  const handleFieldChange = (fieldId, value) => {
    const newValues = { ...localValues, [fieldId]: value }
    setLocalValues(newValues)
    setIsDirty(true)

    // Clear error for this field
    if (localErrors[fieldId]) {
      setLocalErrors({ ...localErrors, [fieldId]: undefined })
    }

    // Notify parent
    if (onChange) {
      onChange(newValues)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate all fields
    const { valid, errors: validationErrors } = validateForm(fields, localValues)

    if (!valid) {
      setLocalErrors(validationErrors)
      return
    }

    if (onSubmit) {
      onSubmit(localValues)
    }
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(localValues)
    }
  }

  // Group fields by row for better layout
  const groupedFields = fields.reduce((acc, field) => {
    const row = field.row ?? acc.length
    if (!acc[row]) {
      acc[row] = []
    }
    acc[row].push(field)
    return acc
  }, [])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {groupedFields.map((rowFields, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid gap-4 ${
            rowFields.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {rowFields.map((field) => (
            <div key={field.id} className={readOnly ? 'opacity-75' : ''}>
              <FieldRenderer
                field={field}
                value={localValues[field.id]}
                onChange={(value) => !readOnly && handleFieldChange(field.id, value)}
                error={localErrors[field.id]}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Form actions */}
      {!readOnly && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            {isDirty && (
              <span className="text-sm text-amber-600">
                You have unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onSaveDraft && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
