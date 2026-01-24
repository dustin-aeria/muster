/**
 * Form Utilities
 * Common form handling patterns and helpers
 *
 * @location src/lib/formUtils.js
 */

// ============================================
// FORM STATE MANAGEMENT
// ============================================

/**
 * Create initial form state from default values
 */
export function createFormState(defaultValues = {}, options = {}) {
  return {
    values: { ...defaultValues },
    errors: {},
    touched: {},
    isDirty: false,
    isSubmitting: false,
    isValid: true,
    submitCount: 0,
    ...options
  }
}

/**
 * Update a form field value
 */
export function setFieldValue(state, field, value) {
  const newValues = { ...state.values, [field]: value }
  const newTouched = { ...state.touched, [field]: true }

  return {
    ...state,
    values: newValues,
    touched: newTouched,
    isDirty: true
  }
}

/**
 * Set multiple field values at once
 */
export function setFormValues(state, values) {
  return {
    ...state,
    values: { ...state.values, ...values },
    isDirty: true
  }
}

/**
 * Set field error
 */
export function setFieldError(state, field, error) {
  const newErrors = { ...state.errors }

  if (error) {
    newErrors[field] = error
  } else {
    delete newErrors[field]
  }

  return {
    ...state,
    errors: newErrors,
    isValid: Object.keys(newErrors).length === 0
  }
}

/**
 * Set multiple field errors
 */
export function setFormErrors(state, errors) {
  return {
    ...state,
    errors: { ...state.errors, ...errors },
    isValid: Object.keys(errors).length === 0
  }
}

/**
 * Clear all errors
 */
export function clearErrors(state) {
  return {
    ...state,
    errors: {},
    isValid: true
  }
}

/**
 * Mark field as touched
 */
export function touchField(state, field) {
  return {
    ...state,
    touched: { ...state.touched, [field]: true }
  }
}

/**
 * Mark all fields as touched
 */
export function touchAllFields(state) {
  const touched = {}
  Object.keys(state.values).forEach(key => {
    touched[key] = true
  })

  return {
    ...state,
    touched
  }
}

/**
 * Reset form to initial state
 */
export function resetForm(state, defaultValues = {}) {
  return createFormState(defaultValues)
}

// ============================================
// INPUT HANDLING
// ============================================

/**
 * Get input value from event
 */
export function getInputValue(event) {
  const { type, checked, value, files } = event.target

  switch (type) {
    case 'checkbox':
      return checked
    case 'file':
      return files?.[0] || null
    case 'number':
    case 'range':
      return value === '' ? '' : parseFloat(value)
    default:
      return value
  }
}

/**
 * Create onChange handler for a field
 */
export function createChangeHandler(setValue, field) {
  return (event) => {
    const value = getInputValue(event)
    setValue(field, value)
  }
}

/**
 * Create onBlur handler for a field
 */
export function createBlurHandler(setTouched, field, validate = null) {
  return (event) => {
    setTouched(field, true)
    if (validate) {
      validate(field)
    }
  }
}

/**
 * Bind form handlers to input props
 */
export function bindField(formState, handlers, field) {
  return {
    name: field,
    value: formState.values[field] ?? '',
    onChange: handlers.handleChange(field),
    onBlur: handlers.handleBlur(field),
    error: formState.touched[field] ? formState.errors[field] : undefined
  }
}

// ============================================
// SELECT/DROPDOWN HELPERS
// ============================================

/**
 * Create options array from object
 */
export function createOptions(obj, valueKey = 'value', labelKey = 'label') {
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'string') {
        return { value: item, label: item }
      }
      return {
        value: item[valueKey],
        label: item[labelKey] || item[valueKey]
      }
    })
  }

  return Object.entries(obj).map(([key, val]) => ({
    value: key,
    label: typeof val === 'object' ? val[labelKey] || key : val
  }))
}

/**
 * Get selected option from value
 */
export function getSelectedOption(options, value) {
  return options.find(opt => opt.value === value) || null
}

/**
 * Create status options
 */
export function createStatusOptions(statuses) {
  return Object.entries(statuses).map(([key, config]) => ({
    value: key,
    label: config.label || key,
    color: config.color || null
  }))
}

// ============================================
// MULTI-SELECT HELPERS
// ============================================

/**
 * Toggle value in array
 */
export function toggleArrayValue(array, value) {
  const index = array.indexOf(value)
  if (index === -1) {
    return [...array, value]
  }
  return array.filter((_, i) => i !== index)
}

/**
 * Check if value is in array
 */
export function isValueSelected(array, value) {
  return Array.isArray(array) && array.includes(value)
}

/**
 * Select all values
 */
export function selectAll(options) {
  return options.map(opt => opt.value)
}

/**
 * Deselect all values
 */
export function deselectAll() {
  return []
}

// ============================================
// DATE INPUT HELPERS
// ============================================

/**
 * Parse date string to Date object
 */
export function parseDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Format Date for input
 */
export function formatDateForInput(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

/**
 * Format DateTime for input
 */
export function formatDateTimeForInput(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 16)
}

/**
 * Get min/max date strings for inputs
 */
export function getDateInputLimits(options = {}) {
  const { minDaysFromNow = null, maxDaysFromNow = null } = options
  const now = new Date()

  let min = null
  let max = null

  if (minDaysFromNow !== null) {
    const minDate = new Date(now)
    minDate.setDate(minDate.getDate() + minDaysFromNow)
    min = formatDateForInput(minDate)
  }

  if (maxDaysFromNow !== null) {
    const maxDate = new Date(now)
    maxDate.setDate(maxDate.getDate() + maxDaysFromNow)
    max = formatDateForInput(maxDate)
  }

  return { min, max }
}

// ============================================
// FILE INPUT HELPERS
// ============================================

/**
 * Get file info
 */
export function getFileInfo(file) {
  if (!file) return null

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: file.name.split('.').pop()?.toLowerCase() || '',
    sizeFormatted: formatFileSize(file.size)
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate file
 */
export function validateFile(file, options = {}) {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = null, allowedExtensions = null } = options
  const errors = []

  if (file.size > maxSize) {
    errors.push(`File too large (max ${formatFileSize(maxSize)})`)
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type`)
  }

  if (allowedExtensions) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      errors.push(`Invalid file extension`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Read file as data URL
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ============================================
// FORM DATA TRANSFORMERS
// ============================================

/**
 * Clean form values before submit
 */
export function cleanFormData(values, options = {}) {
  const { trimStrings = true, removeEmpty = true, convertNumbers = true } = options
  const cleaned = {}

  Object.entries(values).forEach(([key, value]) => {
    // Handle strings
    if (typeof value === 'string') {
      let cleanedValue = trimStrings ? value.trim() : value
      if (removeEmpty && cleanedValue === '') {
        return
      }
      // Convert numeric strings
      if (convertNumbers && /^-?\d+\.?\d*$/.test(cleanedValue)) {
        cleanedValue = parseFloat(cleanedValue)
      }
      cleaned[key] = cleanedValue
      return
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (removeEmpty && value.length === 0) {
        return
      }
      cleaned[key] = value
      return
    }

    // Handle null/undefined
    if (value == null) {
      if (!removeEmpty) {
        cleaned[key] = null
      }
      return
    }

    cleaned[key] = value
  })

  return cleaned
}

/**
 * Prepare form data for API submission
 */
export function prepareSubmitData(values, schema = {}) {
  const data = {}

  Object.entries(values).forEach(([key, value]) => {
    const fieldSchema = schema[key]

    if (fieldSchema?.exclude) return

    if (fieldSchema?.transform) {
      data[key] = fieldSchema.transform(value)
      return
    }

    data[key] = value
  })

  return data
}

/**
 * Get changed fields between original and current values
 */
export function getChangedFields(original, current) {
  const changes = {}

  Object.keys(current).forEach(key => {
    const originalValue = original[key]
    const currentValue = current[key]

    if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
      changes[key] = {
        from: originalValue,
        to: currentValue
      }
    }
  })

  return changes
}

/**
 * Check if form has any changes
 */
export function hasChanges(original, current) {
  return Object.keys(getChangedFields(original, current)).length > 0
}

// ============================================
// FORM SUBMISSION HELPERS
// ============================================

/**
 * Create submit handler
 */
export function createSubmitHandler(onSubmit, options = {}) {
  const { validate = null, clean = true, preventDouble = true } = options
  let isSubmitting = false

  return async (formState, setFormState) => {
    if (preventDouble && isSubmitting) return

    // Validate if validator provided
    if (validate) {
      const errors = validate(formState.values)
      if (Object.keys(errors).length > 0) {
        setFormState(prev => ({
          ...prev,
          errors,
          isValid: false,
          touched: touchAllFields(prev).touched
        }))
        return
      }
    }

    // Set submitting state
    isSubmitting = true
    setFormState(prev => ({ ...prev, isSubmitting: true }))

    try {
      const data = clean ? cleanFormData(formState.values) : formState.values
      await onSubmit(data)

      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitCount: prev.submitCount + 1
      }))
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: { ...prev.errors, _form: error.message }
      }))
      throw error
    } finally {
      isSubmitting = false
    }
  }
}

/**
 * Debounced field change handler
 */
export function debounce(fn, delay = 300) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export default {
  createFormState,
  setFieldValue,
  setFormValues,
  setFieldError,
  setFormErrors,
  clearErrors,
  touchField,
  touchAllFields,
  resetForm,
  getInputValue,
  createChangeHandler,
  createBlurHandler,
  bindField,
  createOptions,
  getSelectedOption,
  createStatusOptions,
  toggleArrayValue,
  isValueSelected,
  selectAll,
  deselectAll,
  parseDate,
  formatDateForInput,
  formatDateTimeForInput,
  getDateInputLimits,
  getFileInfo,
  formatFileSize,
  validateFile,
  readFileAsDataURL,
  cleanFormData,
  prepareSubmitData,
  getChangedFields,
  hasChanges,
  createSubmitHandler,
  debounce
}
