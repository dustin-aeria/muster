/**
 * Slider Component
 * Range sliders and input controls
 *
 * @location src/components/ui/Slider.jsx
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'

// ============================================
// BASE SLIDER
// ============================================

/**
 * Base slider component
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = true,
  valuePosition = 'right',
  formatValue = (v) => v,
  size = 'md',
  variant = 'primary',
  className = ''
}) {
  const percentage = ((value - min) / (max - min)) * 100

  const sizeClasses = {
    sm: { track: 'h-1', thumb: 'h-3 w-3', text: 'text-xs' },
    md: { track: 'h-2', thumb: 'h-4 w-4', text: 'text-sm' },
    lg: { track: 'h-3', thumb: 'h-5 w-5', text: 'text-base' }
  }

  const variantClasses = {
    primary: { track: 'bg-blue-600', thumb: 'border-blue-600' },
    success: { track: 'bg-green-600', thumb: 'border-green-600' },
    warning: { track: 'bg-yellow-500', thumb: 'border-yellow-500' },
    danger: { track: 'bg-red-600', thumb: 'border-red-600' }
  }

  const config = sizeClasses[size] || sizeClasses.md
  const colors = variantClasses[variant] || variantClasses.primary

  const handleChange = (e) => {
    onChange(Number(e.target.value))
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showValue && valuePosition === 'left' && (
        <span className={`${config.text} text-gray-700 min-w-[2rem] text-right`}>
          {formatValue(value)}
        </span>
      )}
      <div className="relative flex-1">
        <div className={`${config.track} bg-gray-200 rounded-full`}>
          <div
            className={`${config.track} ${colors.track} rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            absolute inset-0 w-full opacity-0 cursor-pointer
            disabled:cursor-not-allowed
          `}
          style={{
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
        />
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            ${config.thumb} rounded-full bg-white border-2 ${colors.thumb}
            shadow transition-all
            ${disabled ? 'opacity-50' : ''}
          `}
          style={{ left: `${percentage}%` }}
        />
      </div>
      {showValue && valuePosition === 'right' && (
        <span className={`${config.text} text-gray-700 min-w-[2rem]`}>
          {formatValue(value)}
        </span>
      )}
    </div>
  )
}

// ============================================
// RANGE SLIDER (DUAL HANDLES)
// ============================================

/**
 * Range slider with two handles
 */
export function RangeSlider({
  value = [0, 100],
  onChange,
  min = 0,
  max = 100,
  step = 1,
  minGap = 0,
  disabled = false,
  showValues = true,
  formatValue = (v) => v,
  size = 'md',
  variant = 'primary',
  className = ''
}) {
  const [activeHandle, setActiveHandle] = useState(null)
  const trackRef = useRef(null)

  const sizeClasses = {
    sm: { track: 'h-1', thumb: 'h-3 w-3', text: 'text-xs' },
    md: { track: 'h-2', thumb: 'h-4 w-4', text: 'text-sm' },
    lg: { track: 'h-3', thumb: 'h-5 w-5', text: 'text-base' }
  }

  const variantClasses = {
    primary: { track: 'bg-blue-600', thumb: 'border-blue-600 hover:border-blue-700' },
    success: { track: 'bg-green-600', thumb: 'border-green-600 hover:border-green-700' },
    warning: { track: 'bg-yellow-500', thumb: 'border-yellow-500 hover:border-yellow-600' },
    danger: { track: 'bg-red-600', thumb: 'border-red-600 hover:border-red-700' }
  }

  const config = sizeClasses[size] || sizeClasses.md
  const colors = variantClasses[variant] || variantClasses.primary

  const getPercentage = (val) => ((val - min) / (max - min)) * 100
  const leftPercent = getPercentage(value[0])
  const rightPercent = getPercentage(value[1])

  const getValueFromPosition = useCallback((clientX) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const rawValue = min + percent * (max - min)
    return Math.round(rawValue / step) * step
  }, [min, max, step])

  const handleMouseDown = (index) => (e) => {
    if (disabled) return
    e.preventDefault()
    setActiveHandle(index)
  }

  useEffect(() => {
    if (activeHandle === null) return

    const handleMouseMove = (e) => {
      const newValue = getValueFromPosition(e.clientX)
      const [minVal, maxVal] = value

      if (activeHandle === 0) {
        const clampedValue = Math.min(newValue, maxVal - minGap)
        if (clampedValue !== minVal && clampedValue >= min) {
          onChange([clampedValue, maxVal])
        }
      } else {
        const clampedValue = Math.max(newValue, minVal + minGap)
        if (clampedValue !== maxVal && clampedValue <= max) {
          onChange([minVal, clampedValue])
        }
      }
    }

    const handleMouseUp = () => {
      setActiveHandle(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [activeHandle, value, onChange, getValueFromPosition, min, max, minGap])

  return (
    <div className={className}>
      {showValues && (
        <div className="flex justify-between mb-2">
          <span className={`${config.text} text-gray-700`}>{formatValue(value[0])}</span>
          <span className={`${config.text} text-gray-700`}>{formatValue(value[1])}</span>
        </div>
      )}
      <div ref={trackRef} className="relative py-2">
        <div className={`${config.track} bg-gray-200 rounded-full`} />
        <div
          className={`absolute ${config.track} ${colors.track} rounded-full`}
          style={{
            left: `${leftPercent}%`,
            width: `${rightPercent - leftPercent}%`,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        />
        {/* Left handle */}
        <div
          onMouseDown={handleMouseDown(0)}
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            ${config.thumb} rounded-full bg-white border-2 ${colors.thumb}
            shadow cursor-pointer transition-shadow
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
            ${activeHandle === 0 ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          `}
          style={{ left: `${leftPercent}%` }}
        />
        {/* Right handle */}
        <div
          onMouseDown={handleMouseDown(1)}
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            ${config.thumb} rounded-full bg-white border-2 ${colors.thumb}
            shadow cursor-pointer transition-shadow
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
            ${activeHandle === 1 ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          `}
          style={{ left: `${rightPercent}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// SLIDER WITH MARKS
// ============================================

/**
 * Slider with tick marks
 */
export function SliderWithMarks({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  marks = [],
  showLabels = true,
  disabled = false,
  size = 'md',
  variant = 'primary',
  className = ''
}) {
  const percentage = ((value - min) / (max - min)) * 100

  const sizeClasses = {
    sm: { track: 'h-1', thumb: 'h-3 w-3', mark: 'h-2 w-0.5', text: 'text-xs' },
    md: { track: 'h-2', thumb: 'h-4 w-4', mark: 'h-3 w-0.5', text: 'text-xs' },
    lg: { track: 'h-3', thumb: 'h-5 w-5', mark: 'h-4 w-1', text: 'text-sm' }
  }

  const variantClasses = {
    primary: { track: 'bg-blue-600', thumb: 'border-blue-600' },
    success: { track: 'bg-green-600', thumb: 'border-green-600' },
    warning: { track: 'bg-yellow-500', thumb: 'border-yellow-500' },
    danger: { track: 'bg-red-600', thumb: 'border-red-600' }
  }

  const config = sizeClasses[size] || sizeClasses.md
  const colors = variantClasses[variant] || variantClasses.primary

  // Generate marks if not provided
  const generatedMarks = marks.length > 0 ? marks : Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => ({ value: min + i * step })
  ).filter((_, i, arr) => arr.length <= 11 || i % Math.ceil(arr.length / 10) === 0)

  return (
    <div className={className}>
      <div className="relative pt-2 pb-6">
        <div className={`${config.track} bg-gray-200 rounded-full`}>
          <div
            className={`${config.track} ${colors.track} rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            ${config.thumb} rounded-full bg-white border-2 ${colors.thumb}
            shadow pointer-events-none
            ${disabled ? 'opacity-50' : ''}
          `}
          style={{ left: `${percentage}%`, top: '0.5rem' }}
        />
        {/* Marks */}
        {generatedMarks.map((mark) => {
          const markPercent = ((mark.value - min) / (max - min)) * 100
          const isActive = mark.value <= value

          return (
            <div
              key={mark.value}
              className="absolute -translate-x-1/2"
              style={{ left: `${markPercent}%`, top: '1.25rem' }}
            >
              <div
                className={`${config.mark} rounded-full ${isActive ? colors.track : 'bg-gray-300'}`}
              />
              {showLabels && mark.label !== undefined && (
                <span className={`absolute top-4 left-1/2 -translate-x-1/2 ${config.text} text-gray-500 whitespace-nowrap`}>
                  {mark.label}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// SLIDER WITH INPUT
// ============================================

/**
 * Slider with number input
 */
export function SliderWithInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  size = 'md',
  variant = 'primary',
  className = ''
}) {
  const handleInputChange = (e) => {
    const newValue = Number(e.target.value)
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        showValue={false}
        size={size}
        variant={variant}
        className="flex-1"
      />
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-20 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
    </div>
  )
}

// ============================================
// VERTICAL SLIDER
// ============================================

/**
 * Vertical slider
 */
export function VerticalSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  height = 200,
  disabled = false,
  showValue = true,
  formatValue = (v) => v,
  variant = 'primary',
  className = ''
}) {
  const trackRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const percentage = ((value - min) / (max - min)) * 100

  const variantClasses = {
    primary: { track: 'bg-blue-600', thumb: 'border-blue-600' },
    success: { track: 'bg-green-600', thumb: 'border-green-600' },
    warning: { track: 'bg-yellow-500', thumb: 'border-yellow-500' },
    danger: { track: 'bg-red-600', thumb: 'border-red-600' }
  }

  const colors = variantClasses[variant] || variantClasses.primary

  const getValueFromPosition = useCallback((clientY) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const percent = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    const rawValue = min + percent * (max - min)
    return Math.round(rawValue / step) * step
  }, [min, max, step])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      const newValue = getValueFromPosition(e.clientY)
      if (newValue !== value && newValue >= min && newValue <= max) {
        onChange(newValue)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, value, onChange, getValueFromPosition, min, max])

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {showValue && (
        <span className="text-sm text-gray-700">{formatValue(value)}</span>
      )}
      <div
        ref={trackRef}
        className="relative w-2 bg-gray-200 rounded-full cursor-pointer"
        style={{ height }}
        onMouseDown={() => !disabled && setIsDragging(true)}
      >
        <div
          className={`absolute bottom-0 left-0 right-0 ${colors.track} rounded-full`}
          style={{ height: `${percentage}%` }}
        />
        <div
          className={`
            absolute left-1/2 -translate-x-1/2 translate-y-1/2
            h-4 w-4 rounded-full bg-white border-2 ${colors.thumb}
            shadow cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ bottom: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// GRADIENT SLIDER
// ============================================

/**
 * Slider with gradient track
 */
export function GradientSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  gradient = 'from-blue-400 via-blue-500 to-blue-600',
  disabled = false,
  showValue = true,
  formatValue = (v) => v,
  className = ''
}) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={className}>
      {showValue && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">{formatValue(min)}</span>
          <span className="text-sm font-medium text-gray-900">{formatValue(value)}</span>
          <span className="text-sm text-gray-500">{formatValue(max)}</span>
        </div>
      )}
      <div className="relative">
        <div className={`h-3 bg-gradient-to-r ${gradient} rounded-full`} />
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            h-5 w-5 rounded-full bg-white border-2 border-white
            shadow-lg pointer-events-none
            ${disabled ? 'opacity-50' : ''}
          `}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// SLIDER WITH TOOLTIP
// ============================================

/**
 * Slider with hover tooltip
 */
export function SliderWithTooltip({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue = (v) => v,
  disabled = false,
  variant = 'primary',
  className = ''
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const percentage = ((value - min) / (max - min)) * 100

  const variantClasses = {
    primary: { track: 'bg-blue-600', thumb: 'border-blue-600' },
    success: { track: 'bg-green-600', thumb: 'border-green-600' },
    warning: { track: 'bg-yellow-500', thumb: 'border-yellow-500' },
    danger: { track: 'bg-red-600', thumb: 'border-red-600' }
  }

  const colors = variantClasses[variant] || variantClasses.primary

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className={`h-2 ${colors.track} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div
        className={`
          absolute top-1/2 -translate-y-1/2 -translate-x-1/2
          h-4 w-4 rounded-full bg-white border-2 ${colors.thumb}
          shadow pointer-events-none
          ${disabled ? 'opacity-50' : ''}
        `}
        style={{ left: `${percentage}%` }}
      />
      {showTooltip && (
        <div
          className="absolute -top-8 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap"
          style={{ left: `${percentage}%` }}
        >
          {formatValue(value)}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

// ============================================
// SLIDER FIELD
// ============================================

/**
 * Slider with form field wrapper
 */
export function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  helpText,
  error,
  required,
  formatValue = (v) => v,
  showMinMax = true,
  className = '',
  ...sliderProps
}) {
  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <span className="text-sm font-medium text-gray-900">
            {formatValue(value)}
          </span>
        </div>
      )}
      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        showValue={false}
        {...sliderProps}
      />
      {showMinMax && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{formatValue(min)}</span>
          <span className="text-xs text-gray-500">{formatValue(max)}</span>
        </div>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default {
  Slider,
  RangeSlider,
  SliderWithMarks,
  SliderWithInput,
  VerticalSlider,
  GradientSlider,
  SliderWithTooltip,
  SliderField
}
