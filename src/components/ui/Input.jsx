/**
 * Input Components
 * Form input fields and related components
 *
 * @location src/components/ui/Input.jsx
 */

import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, Search, X, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'

// ============================================
// BASE INPUT
// ============================================

/**
 * Base text input
 */
export const Input = forwardRef(({
  type = 'text',
  size = 'md',
  variant = 'default',
  error,
  success,
  disabled,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftAddon,
  rightAddon,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4'
  }

  const stateClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500'
  }

  const state = error ? 'error' : success ? 'success' : 'default'

  const hasLeftContent = LeftIcon || leftAddon
  const hasRightContent = RightIcon || rightAddon

  return (
    <div className={`relative flex ${className}`}>
      {leftAddon && (
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
          {leftAddon}
        </span>
      )}
      <div className="relative flex-1">
        {LeftIcon && !leftAddon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={`
            block w-full rounded-md border shadow-sm
            focus:outline-none focus:ring-1
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${sizeClasses[size]}
            ${stateClasses[state]}
            ${LeftIcon && !leftAddon ? 'pl-10' : ''}
            ${RightIcon && !rightAddon ? 'pr-10' : ''}
            ${leftAddon ? 'rounded-l-none' : ''}
            ${rightAddon ? 'rounded-r-none' : ''}
            ${inputClassName}
          `}
          {...props}
        />
        {RightIcon && !rightAddon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <RightIcon className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>
      {rightAddon && (
        <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
          {rightAddon}
        </span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// ============================================
// PASSWORD INPUT
// ============================================

/**
 * Password input with visibility toggle
 */
export const PasswordInput = forwardRef(({
  showStrength = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState(0)

  const calculateStrength = (value) => {
    let score = 0
    if (value.length >= 8) score++
    if (value.length >= 12) score++
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
    if (/\d/.test(value)) score++
    if (/[^a-zA-Z0-9]/.test(value)) score++
    return Math.min(score, 4)
  }

  const handleChange = (e) => {
    if (showStrength) {
      setStrength(calculateStrength(e.target.value))
    }
    props.onChange?.(e)
  }

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600']

  return (
    <div>
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          {...props}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>
      {showStrength && props.value && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded ${
                  i < strength ? strengthColors[strength - 1] : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {strengthLabels[strength]}
          </p>
        </div>
      )}
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'

// ============================================
// SEARCH INPUT
// ============================================

/**
 * Search input with icon and clear button
 */
export const SearchInput = forwardRef(({
  value,
  onChange,
  onClear,
  onSearch,
  placeholder = 'Search...',
  loading = false,
  size = 'md',
  ...props
}, ref) => {
  const handleClear = () => {
    onClear?.()
    onChange?.({ target: { value: '' } })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch?.(value)
    }
    props.onKeyDown?.(e)
  }

  return (
    <div className="relative">
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        size={size}
        leftIcon={Search}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

// ============================================
// NUMBER INPUT
// ============================================

/**
 * Number input with increment/decrement buttons
 */
export const NumberInput = forwardRef(({
  value,
  onChange,
  min,
  max,
  step = 1,
  size = 'md',
  showButtons = true,
  ...props
}, ref) => {
  const handleIncrement = () => {
    const newValue = (parseFloat(value) || 0) + step
    if (max === undefined || newValue <= max) {
      onChange?.({ target: { value: newValue } })
    }
  }

  const handleDecrement = () => {
    const newValue = (parseFloat(value) || 0) - step
    if (min === undefined || newValue >= min) {
      onChange?.({ target: { value: newValue } })
    }
  }

  if (!showButtons) {
    return (
      <Input
        ref={ref}
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        size={size}
        {...props}
      />
    )
  }

  return (
    <div className="flex">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={min !== undefined && value <= min}
        className="px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
      >
        -
      </button>
      <Input
        ref={ref}
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        size={size}
        inputClassName="rounded-none text-center"
        {...props}
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={max !== undefined && value >= max}
        className="px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
      >
        +
      </button>
    </div>
  )
})

NumberInput.displayName = 'NumberInput'

// ============================================
// FORM FIELD
// ============================================

/**
 * Form field wrapper with label, help text, and error
 */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  success,
  helpText,
  children,
  className = ''
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {success && !error && (
        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {success}
        </p>
      )}
    </div>
  )
}

// ============================================
// INPUT GROUP
// ============================================

/**
 * Group multiple inputs horizontally
 */
export function InputGroup({ children, className = '' }) {
  return (
    <div className={`flex -space-x-px ${className}`}>
      {React.Children.map(children, (child, index) => {
        const isFirst = index === 0
        const isLast = index === React.Children.count(children) - 1

        return React.cloneElement(child, {
          inputClassName: `
            ${child.props.inputClassName || ''}
            ${isFirst ? 'rounded-r-none' : ''}
            ${isLast ? 'rounded-l-none' : ''}
            ${!isFirst && !isLast ? 'rounded-none' : ''}
          `
        })
      })}
    </div>
  )
}

// ============================================
// INLINE EDIT INPUT
// ============================================

/**
 * Click-to-edit input
 */
export function InlineEditInput({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder = 'Click to edit',
  className = ''
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  const handleSave = () => {
    onSave?.(editValue)
    onChange?.(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    onCancel?.()
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') handleCancel()
  }

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className={`text-left hover:bg-gray-100 px-2 py-1 rounded ${className}`}
      >
        {value || <span className="text-gray-400">{placeholder}</span>}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        autoFocus
        size="sm"
        className={className}
      />
    </div>
  )
}

// ============================================
// PIN INPUT
// ============================================

/**
 * PIN/OTP code input
 */
export function PinInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  type = 'number',
  mask = false,
  className = ''
}) {
  const inputRefs = React.useRef([])

  const handleChange = (index, char) => {
    const newValue = value.split('')
    newValue[index] = char
    const result = newValue.join('').slice(0, length)

    onChange?.(result)

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (result.length === length) {
      onComplete?.(result)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').slice(0, length)
    onChange?.(pasted)
    if (pasted.length === length) {
      onComplete?.(pasted)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type={type === 'number' ? 'tel' : 'text'}
          inputMode={type === 'number' ? 'numeric' : 'text'}
          maxLength={1}
          value={mask && value[index] ? '*' : value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      ))}
    </div>
  )
}

export default {
  Input,
  PasswordInput,
  SearchInput,
  NumberInput,
  FormField,
  InputGroup,
  InlineEditInput,
  PinInput
}
