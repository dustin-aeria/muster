/**
 * Button Component
 * Versatile button components for various use cases
 *
 * @location src/components/ui/Button.jsx
 */

import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

// ============================================
// BUTTON VARIANTS
// ============================================

const BUTTON_VARIANTS = {
  // Muster Brand Colors
  primary: 'bg-muster-amber text-gray-900 hover:bg-muster-amber-dark focus:ring-muster-amber',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
  success: 'bg-muster-success text-white hover:bg-muster-success-dark focus:ring-muster-success',
  warning: 'bg-muster-amber text-gray-900 hover:bg-muster-amber-dark focus:ring-muster-amber',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-muster-navy hover:bg-muster-navy/10 focus:ring-muster-navy',
  link: 'bg-transparent text-muster-navy hover:text-muster-navy-light hover:underline focus:ring-muster-navy p-0',
  outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  'outline-primary': 'bg-transparent border-2 border-muster-navy text-muster-navy hover:bg-muster-navy hover:text-white focus:ring-muster-navy',
  'outline-danger': 'bg-transparent border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
  'outline-success': 'bg-transparent border border-muster-success text-muster-success hover:bg-green-50 focus:ring-muster-success'
}

const BUTTON_SIZES = {
  xs: 'h-7 px-2 text-xs gap-1',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  xl: 'h-14 px-8 text-lg gap-2.5'
}

const ICON_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6'
}

// ============================================
// BASE BUTTON
// ============================================

/**
 * Base button component
 */
export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = 'md',
  as: Component = 'button',
  className = '',
  ...props
}, ref) => {
  const variantClass = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary
  const sizeClass = BUTTON_SIZES[size] || BUTTON_SIZES.md
  const iconClass = ICON_SIZES[size] || ICON_SIZES.md

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  const isDisabled = disabled || loading

  return (
    <Component
      ref={ref}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClass}
        ${sizeClass}
        ${roundedClasses[rounded]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className={`animate-spin ${iconClass}`} />}
      {!loading && LeftIcon && <LeftIcon className={iconClass} />}
      {children}
      {!loading && RightIcon && <RightIcon className={iconClass} />}
    </Component>
  )
})

Button.displayName = 'Button'

// ============================================
// ICON BUTTON
// ============================================

/**
 * Icon-only button
 */
export const IconButton = forwardRef(({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  label,
  loading = false,
  disabled = false,
  rounded = 'md',
  className = '',
  ...props
}, ref) => {
  const variantClass = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.ghost
  const iconClass = ICON_SIZES[size] || ICON_SIZES.md

  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-14 w-14'
  }

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-label={label}
      className={`
        inline-flex items-center justify-center
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClass}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className={`animate-spin ${iconClass}`} />
      ) : (
        <Icon className={iconClass} />
      )}
    </button>
  )
})

IconButton.displayName = 'IconButton'

// ============================================
// BUTTON GROUP
// ============================================

/**
 * Group of buttons
 */
export function ButtonGroup({
  children,
  variant = 'outline',
  size = 'md',
  attached = true,
  className = ''
}) {
  return (
    <div
      className={`
        inline-flex
        ${attached ? '-space-x-px' : 'space-x-2'}
        ${className}
      `}
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child

        const isFirst = index === 0
        const isLast = index === React.Children.count(children) - 1

        return React.cloneElement(child, {
          variant: child.props.variant || variant,
          size: child.props.size || size,
          className: `
            ${child.props.className || ''}
            ${attached ? (isFirst ? 'rounded-r-none' : isLast ? 'rounded-l-none' : 'rounded-none') : ''}
          `
        })
      })}
    </div>
  )
}

// ============================================
// SPLIT BUTTON
// ============================================

import { ChevronDown } from 'lucide-react'

/**
 * Button with dropdown menu
 * Includes keyboard navigation for accessibility
 */
export function SplitButton({
  children,
  variant = 'primary',
  size = 'md',
  options = [],
  onOptionClick,
  disabled = false,
  loading = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [focusedIndex, setFocusedIndex] = React.useState(0)
  const menuRef = React.useRef(null)
  const dropdownButtonRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset focus index when menu opens
  React.useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0)
    }
  }, [isOpen])

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        dropdownButtonRef.current?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(i => Math.min(i + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (options[focusedIndex] && !options[focusedIndex].disabled) {
          onOptionClick?.(options[focusedIndex])
          setIsOpen(false)
          dropdownButtonRef.current?.focus()
        }
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  return (
    <div className={`relative inline-flex ${className}`} ref={menuRef}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        loading={loading}
        className="rounded-r-none"
      >
        {children}
      </Button>
      <Button
        ref={dropdownButtonRef}
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Show more options"
        className="rounded-l-none border-l border-white/20 px-2"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10"
          role="menu"
          aria-orientation="vertical"
          onKeyDown={handleKeyDown}
        >
          {options.map((option, index) => (
            <button
              key={option.value || index}
              role="menuitem"
              tabIndex={index === focusedIndex ? 0 : -1}
              onClick={() => {
                onOptionClick?.(option)
                setIsOpen(false)
                dropdownButtonRef.current?.focus()
              }}
              disabled={option.disabled}
              className={`w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                index === focusedIndex ? 'bg-gray-100' : ''
              }`}
            >
              {option.icon && <option.icon className="inline h-4 w-4 mr-2" />}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// TOGGLE BUTTON
// ============================================

/**
 * Toggle/switch button
 */
export function ToggleButton({
  pressed,
  onPressedChange,
  children,
  variant = 'outline',
  size = 'md',
  disabled = false,
  className = ''
}) {
  const activeClasses = pressed
    ? 'bg-muster-amber/20 border-muster-amber text-muster-amber-dark'
    : ''

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={() => onPressedChange?.(!pressed)}
      aria-pressed={pressed}
      className={`${activeClasses} ${className}`}
    >
      {children}
    </Button>
  )
}

/**
 * Toggle button group (single select)
 */
export function ToggleButtonGroup({
  value,
  onChange,
  options,
  size = 'md',
  fullWidth = false,
  className = ''
}) {
  return (
    <ButtonGroup className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          pressed={value === option.value}
          onPressedChange={() => onChange?.(option.value)}
          disabled={option.disabled}
          size={size}
          className={fullWidth ? 'flex-1' : ''}
        >
          {option.icon && <option.icon className="h-4 w-4 mr-1" />}
          {option.label}
        </ToggleButton>
      ))}
    </ButtonGroup>
  )
}

// ============================================
// FLOATING ACTION BUTTON
// ============================================

/**
 * Floating action button (FAB)
 */
export const FloatingActionButton = forwardRef(({
  icon: Icon,
  label,
  variant = 'primary',
  size = 'lg',
  position = 'bottom-right',
  className = '',
  ...props
}, ref) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
    xl: 'h-16 w-16'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
  }

  return (
    <button
      ref={ref}
      aria-label={label}
      className={`
        fixed ${positionClasses[position]}
        ${sizeClasses[size]}
        ${BUTTON_VARIANTS[variant]}
        rounded-full shadow-lg
        flex items-center justify-center
        transition-all duration-200
        hover:shadow-xl hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-offset-2
        z-40
        ${className}
      `}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </button>
  )
})

FloatingActionButton.displayName = 'FloatingActionButton'

// ============================================
// CLOSE BUTTON
// ============================================

import { X } from 'lucide-react'

/**
 * Close/dismiss button
 */
export function CloseButton({
  onClick,
  size = 'md',
  label = 'Close',
  className = ''
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        rounded-full text-gray-500
        hover:text-gray-700 hover:bg-gray-100
        focus:outline-none focus:ring-2 focus:ring-gray-500
        ${className}
      `}
    >
      <X className={iconSizes[size]} />
    </button>
  )
}

// ============================================
// COPY BUTTON
// ============================================

import { Copy, Check } from 'lucide-react'

/**
 * Copy to clipboard button
 */
export function CopyButton({
  text,
  onCopy,
  size = 'sm',
  variant = 'ghost',
  className = ''
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <IconButton
      icon={copied ? Check : Copy}
      variant={variant}
      size={size}
      onClick={handleCopy}
      label={copied ? 'Copied!' : 'Copy to clipboard'}
      className={`${copied ? 'text-green-600' : ''} ${className}`}
    />
  )
}

export default {
  Button,
  IconButton,
  ButtonGroup,
  SplitButton,
  ToggleButton,
  ToggleButtonGroup,
  FloatingActionButton,
  CloseButton,
  CopyButton,
  BUTTON_VARIANTS,
  BUTTON_SIZES
}
