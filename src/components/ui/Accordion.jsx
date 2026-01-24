/**
 * Accordion Component
 * Expandable/collapsible content sections
 *
 * @location src/components/ui/Accordion.jsx
 */

import React, { createContext, useContext, useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react'

// ============================================
// ACCORDION CONTEXT
// ============================================

const AccordionContext = createContext(null)

function useAccordionContext() {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion')
  }
  return context
}

// ============================================
// ACCORDION COMPONENT
// ============================================

/**
 * Accordion container
 */
export function Accordion({
  children,
  type = 'single', // 'single' | 'multiple'
  defaultValue = type === 'single' ? null : [],
  value,
  onChange,
  collapsible = true,
  className = ''
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeValue = value !== undefined ? value : internalValue

  const toggleItem = (itemValue) => {
    let newValue

    if (type === 'single') {
      if (collapsible && activeValue === itemValue) {
        newValue = null
      } else {
        newValue = itemValue
      }
    } else {
      const currentArray = Array.isArray(activeValue) ? activeValue : []
      if (currentArray.includes(itemValue)) {
        newValue = currentArray.filter((v) => v !== itemValue)
      } else {
        newValue = [...currentArray, itemValue]
      }
    }

    if (value === undefined) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  const isItemOpen = (itemValue) => {
    if (type === 'single') {
      return activeValue === itemValue
    }
    return Array.isArray(activeValue) && activeValue.includes(itemValue)
  }

  return (
    <AccordionContext.Provider value={{ toggleItem, isItemOpen, type }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  )
}

// ============================================
// ACCORDION ITEM
// ============================================

const AccordionItemContext = createContext(null)

/**
 * Individual accordion item
 */
export function AccordionItem({
  value,
  children,
  disabled = false,
  className = ''
}) {
  return (
    <AccordionItemContext.Provider value={{ value, disabled }}>
      <div
        className={`border-b border-gray-200 last:border-b-0 ${
          disabled ? 'opacity-50' : ''
        } ${className}`}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

// ============================================
// ACCORDION TRIGGER
// ============================================

/**
 * Accordion trigger/header
 */
export function AccordionTrigger({
  children,
  icon = 'chevron',
  iconPosition = 'right',
  className = ''
}) {
  const { toggleItem, isItemOpen } = useAccordionContext()
  const { value, disabled } = useContext(AccordionItemContext)
  const isOpen = isItemOpen(value)

  const handleClick = () => {
    if (!disabled) {
      toggleItem(value)
    }
  }

  const renderIcon = () => {
    if (icon === 'chevron') {
      return (
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      )
    }
    if (icon === 'chevron-right') {
      return (
        <ChevronRight
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
      )
    }
    if (icon === 'plus-minus') {
      return isOpen ? (
        <Minus className="h-4 w-4 text-gray-500" />
      ) : (
        <Plus className="h-4 w-4 text-gray-500" />
      )
    }
    return null
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full flex items-center justify-between py-4 px-0
        text-left font-medium text-gray-900
        hover:text-gray-700 focus:outline-none
        disabled:cursor-not-allowed
        ${className}
      `}
      aria-expanded={isOpen}
    >
      {iconPosition === 'left' && <span className="mr-3">{renderIcon()}</span>}
      <span className="flex-1">{children}</span>
      {iconPosition === 'right' && <span className="ml-3">{renderIcon()}</span>}
    </button>
  )
}

// ============================================
// ACCORDION CONTENT
// ============================================

/**
 * Accordion content panel
 */
export function AccordionContent({ children, className = '' }) {
  const { isItemOpen } = useAccordionContext()
  const { value } = useContext(AccordionItemContext)
  const isOpen = isItemOpen(value)

  return (
    <div
      className={`
        overflow-hidden transition-all duration-200 ease-in-out
        ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
      `}
      aria-hidden={!isOpen}
    >
      <div className={`pb-4 text-gray-600 ${className}`}>{children}</div>
    </div>
  )
}

// ============================================
// SIMPLE ACCORDION
// ============================================

/**
 * Simple accordion with array configuration
 */
export function SimpleAccordion({
  items,
  type = 'single',
  defaultOpen,
  icon = 'chevron',
  bordered = false,
  className = ''
}) {
  return (
    <Accordion
      type={type}
      defaultValue={defaultOpen}
      className={`
        ${bordered ? 'border border-gray-200 rounded-lg divide-y divide-gray-200' : ''}
        ${className}
      `}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.value || item.title}
          value={item.value || item.title}
          disabled={item.disabled}
        >
          <AccordionTrigger icon={icon} className={bordered ? 'px-4' : ''}>
            {item.icon && <item.icon className="h-5 w-5 mr-3 text-gray-400" />}
            {item.title}
          </AccordionTrigger>
          <AccordionContent className={bordered ? 'px-4' : ''}>
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// ============================================
// FAQ ACCORDION
// ============================================

/**
 * FAQ-styled accordion
 */
export function FAQAccordion({ items, className = '' }) {
  return (
    <Accordion type="single" collapsible className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.question || index}
          value={item.question || index.toString()}
          className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
        >
          <AccordionTrigger
            icon="plus-minus"
            className="px-6 hover:bg-gray-50"
          >
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="px-6 text-gray-600">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// ============================================
// COLLAPSIBLE SECTION
// ============================================

/**
 * Single collapsible section
 */
export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  icon: Icon,
  badge,
  actions,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <ChevronRight
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-90' : ''
            }`}
          />
          {Icon && <Icon className="h-5 w-5 text-gray-400" />}
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {actions && (
          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================
// EXPANDABLE CARD
// ============================================

/**
 * Card with expandable content
 */
export function ExpandableCard({
  title,
  subtitle,
  preview,
  children,
  defaultExpanded = false,
  expandLabel = 'Show more',
  collapseLabel = 'Show less',
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {preview && !isExpanded && (
          <div className="mt-3 text-gray-600">{preview}</div>
        )}
        {isExpanded && <div className="mt-3">{children}</div>}
      </div>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-t border-gray-200 flex items-center justify-center gap-1"
      >
        {isExpanded ? collapseLabel : expandLabel}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  )
}

// ============================================
// NESTED ACCORDION
// ============================================

/**
 * Nested accordion for hierarchical content
 */
export function NestedAccordion({ items, level = 0, className = '' }) {
  const [openItems, setOpenItems] = useState([])

  const toggleItem = (value) => {
    setOpenItems((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    )
  }

  const isOpen = (value) => openItems.includes(value)

  return (
    <div className={`${level > 0 ? 'ml-4 border-l border-gray-200 pl-4' : ''} ${className}`}>
      {items.map((item) => (
        <div key={item.value} className="py-1">
          <button
            type="button"
            onClick={() => toggleItem(item.value)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            {item.children && item.children.length > 0 ? (
              <ChevronRight
                className={`h-3 w-3 transition-transform ${
                  isOpen(item.value) ? 'rotate-90' : ''
                }`}
              />
            ) : (
              <span className="w-3" />
            )}
            {item.icon && <item.icon className="h-4 w-4 text-gray-400" />}
            <span className={isOpen(item.value) ? 'font-medium' : ''}>
              {item.label}
            </span>
          </button>
          {item.children && item.children.length > 0 && isOpen(item.value) && (
            <NestedAccordion items={item.children} level={level + 1} />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================
// DISCLOSURE
// ============================================

/**
 * Simple disclosure (show/hide)
 */
export function Disclosure({
  children,
  label,
  defaultOpen = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        {label}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  )
}

export default {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  SimpleAccordion,
  FAQAccordion,
  CollapsibleSection,
  ExpandableCard,
  NestedAccordion,
  Disclosure
}
