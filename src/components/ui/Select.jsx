/**
 * Select Component
 * Dropdown selects and comboboxes
 *
 * @location src/components/ui/Select.jsx
 */

import React, { Fragment, useState, useRef, useEffect, forwardRef } from 'react'
import { Listbox, Combobox, Transition } from '@headlessui/react'
import { Check, ChevronDown, X, Search, Loader2 } from 'lucide-react'
import { logger } from '../../lib/logger'

// ============================================
// BASE SELECT
// ============================================

/**
 * Basic select dropdown
 */
export function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  error,
  size = 'md',
  className = ''
}) {
  const selected = options.find((opt) => opt.value === value)

  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4'
  }

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={`relative ${className}`}>
        <Listbox.Button
          className={`
            relative w-full cursor-pointer rounded-md border bg-white text-left
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${sizeClasses[size]}
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        >
          <span className={`block truncate ${!selected ? 'text-gray-500' : 'text-gray-900'}`}>
            {selected?.label || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm"
          >
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={({ active, selected }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                  } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {option.label}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

// ============================================
// NATIVE SELECT
// ============================================

/**
 * Native HTML select for better mobile UX
 */
export const NativeSelect = forwardRef(({
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  error,
  size = 'md',
  className = ''
}, ref) => {
  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4'
  }

  return (
    <div className={`relative ${className}`}>
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`
          block w-full appearance-none rounded-md border bg-white pr-10
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
      </span>
    </div>
  )
})

NativeSelect.displayName = 'NativeSelect'

// ============================================
// MULTI-SELECT
// ============================================

/**
 * Multi-select with chips
 * Includes keyboard navigation for accessibility
 */
export function MultiSelect({
  value = [],
  onChange,
  options = [],
  placeholder = 'Select options...',
  disabled = false,
  error,
  maxItems,
  size = 'md',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset focus index when menu opens
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0)
    }
  }, [isOpen])

  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else if (!maxItems || value.length < maxItems) {
      onChange([...value, optionValue])
    }
  }

  const removeOption = (optionValue, e) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== optionValue))
  }

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
        triggerRef.current?.focus()
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
        const option = options[focusedIndex]
        const isDisabled = option?.disabled || (!value.includes(option?.value) && maxItems && value.length >= maxItems)
        if (option && !isDisabled) {
          toggleOption(option.value)
        }
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  const selectedOptions = options.filter((opt) => value.includes(opt.value))

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        ref={triggerRef}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={placeholder}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          min-h-[40px] w-full rounded-md border bg-white px-3 py-2 cursor-pointer
          flex flex-wrap gap-1 items-center
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-gray-500 text-sm">{placeholder}</span>
        ) : (
          selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm"
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => removeOption(option.value, e)}
                aria-label={`Remove ${option.label}`}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
        <span className="ml-auto pointer-events-none">
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </div>
      {isOpen && (
        <div
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
          role="listbox"
          aria-multiselectable="true"
          onKeyDown={handleKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = value.includes(option.value)
            const isDisabled = option.disabled || (!isSelected && maxItems && value.length >= maxItems)

            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={index === focusedIndex ? 0 : -1}
                onClick={() => !isDisabled && toggleOption(option.value)}
                className={`
                  relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm
                  ${isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900 hover:bg-gray-50'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  ${index === focusedIndex ? 'bg-gray-100' : ''}
                `}
              >
                <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                  {option.label}
                </span>
                {isSelected && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================
// SEARCHABLE SELECT (COMBOBOX)
// ============================================

/**
 * Searchable select with filtering
 */
export function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Search...',
  disabled = false,
  error,
  loading = false,
  onSearch,
  size = 'md',
  className = ''
}) {
  const [query, setQuery] = useState('')

  const filteredOptions = query === ''
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      )

  const selected = options.find((opt) => opt.value === value)

  const handleQueryChange = (event) => {
    const newQuery = event.target.value
    setQuery(newQuery)
    onSearch?.(newQuery)
  }

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  }

  return (
    <Combobox value={value} onChange={onChange} disabled={disabled}>
      <div className={`relative ${className}`}>
        <div className="relative">
          <Combobox.Input
            className={`
              w-full rounded-md border bg-white pl-3 pr-10
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${sizeClasses[size]}
              ${error ? 'border-red-300' : 'border-gray-300'}
            `}
            displayValue={() => selected?.label || ''}
            onChange={handleQueryChange}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            {loading ? (
              <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
            {loading ? (
              <div className="px-4 py-2 text-gray-500 text-center">Loading...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-gray-500 text-center">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                    } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  )
}

// ============================================
// ASYNC SELECT
// ============================================

/**
 * Select with async option loading
 */
export function AsyncSelect({
  value,
  onChange,
  loadOptions,
  placeholder = 'Search...',
  disabled = false,
  error,
  debounceMs = 300,
  minSearchLength = 2,
  size = 'md',
  className = ''
}) {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  const selected = options.find((opt) => opt.value === value)

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length < minSearchLength) {
      setOptions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const results = await loadOptions(query)
        setOptions(results)
      } catch (err) {
        logger.error('Failed to load options:', err)
        setOptions([])
      } finally {
        setLoading(false)
      }
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, loadOptions, debounceMs, minSearchLength])

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      loading={loading}
      onSearch={setQuery}
      size={size}
      className={className}
    />
  )
}

// ============================================
// GROUPED SELECT
// ============================================

/**
 * Select with option groups
 */
export function GroupedSelect({
  value,
  onChange,
  groups = [],
  placeholder = 'Select option...',
  disabled = false,
  error,
  size = 'md',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Find selected option across all groups
  let selected = null
  for (const group of groups) {
    const found = group.options.find((opt) => opt.value === value)
    if (found) {
      selected = found
      break
    }
  }

  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4'
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full cursor-pointer rounded-md border bg-white text-left
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${sizeClasses[size]}
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
      >
        <span className={`block truncate ${!selected ? 'text-gray-500' : 'text-gray-900'}`}>
          {selected?.label || placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                {group.label}
              </div>
              {group.options.map((option) => {
                const isSelected = value === option.value
                return (
                  <div
                    key={option.value}
                    onClick={() => {
                      if (!option.disabled) {
                        onChange(option.value)
                        setIsOpen(false)
                      }
                    }}
                    className={`
                      relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm
                      ${isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900 hover:bg-gray-50'}
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// CREATABLE SELECT
// ============================================

/**
 * Select that allows creating new options
 */
export function CreatableSelect({
  value,
  onChange,
  options: initialOptions = [],
  placeholder = 'Select or create...',
  disabled = false,
  error,
  onCreate,
  formatCreateLabel = (input) => `Create "${input}"`,
  size = 'md',
  className = ''
}) {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState(initialOptions)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    setOptions(initialOptions)
  }, [initialOptions])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = query === ''
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      )

  const showCreateOption = query !== '' && !filteredOptions.some(
    (opt) => opt.label.toLowerCase() === query.toLowerCase()
  )

  const handleCreate = () => {
    const newOption = { value: query, label: query }
    setOptions([...options, newOption])
    onChange(query)
    onCreate?.(newOption)
    setQuery('')
    setIsOpen(false)
  }

  const selected = options.find((opt) => opt.value === value)

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? query : (selected?.label || '')}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full rounded-md border bg-white pl-3 pr-10
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${sizeClasses[size]}
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        />
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          {showCreateOption && (
            <div
              onClick={handleCreate}
              className="cursor-pointer select-none py-2 px-4 text-sm text-blue-600 hover:bg-blue-50"
            >
              {formatCreateLabel(query)}
            </div>
          )}
          {filteredOptions.map((option) => {
            const isSelected = value === option.value
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setQuery('')
                  setIsOpen(false)
                }}
                className={`
                  relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm
                  ${isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900 hover:bg-gray-50'}
                `}
              >
                <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                  {option.label}
                </span>
                {isSelected && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            )
          })}
          {filteredOptions.length === 0 && !showCreateOption && (
            <div className="px-4 py-2 text-sm text-gray-500 text-center">
              No options
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// SELECT WITH ICONS
// ============================================

/**
 * Select with icons for each option
 */
export function IconSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select option...',
  disabled = false,
  error,
  size = 'md',
  className = ''
}) {
  const selected = options.find((opt) => opt.value === value)

  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4'
  }

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={`relative ${className}`}>
        <Listbox.Button
          className={`
            relative w-full cursor-pointer rounded-md border bg-white text-left
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${sizeClasses[size]}
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        >
          <span className={`flex items-center gap-2 truncate ${!selected ? 'text-gray-500' : 'text-gray-900'}`}>
            {selected?.icon && <selected.icon className="h-4 w-4 text-gray-500" />}
            {selected?.label || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                  } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`flex items-center gap-2 truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {option.icon && <option.icon className="h-4 w-4 text-gray-500" />}
                      {option.label}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

// ============================================
// FORM FIELD SELECT
// ============================================

/**
 * Select wrapped with form field
 */
export function SelectField({
  label,
  error,
  helpText,
  required,
  className = '',
  ...selectProps
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select {...selectProps} error={error} />
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
  Select,
  NativeSelect,
  MultiSelect,
  SearchableSelect,
  AsyncSelect,
  GroupedSelect,
  CreatableSelect,
  IconSelect,
  SelectField
}
