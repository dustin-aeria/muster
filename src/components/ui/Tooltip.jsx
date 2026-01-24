/**
 * Tooltip Component
 * Accessible tooltips and popovers
 *
 * @location src/components/ui/Tooltip.jsx
 */

import React, { useState, useRef, useEffect, cloneElement } from 'react'

// ============================================
// TOOLTIP POSITIONS
// ============================================

const POSITIONS = {
  top: {
    tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent'
  },
  bottom: {
    tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent'
  },
  left: {
    tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent'
  },
  right: {
    tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent'
  }
}

// ============================================
// TOOLTIP COMPONENT
// ============================================

/**
 * Tooltip component
 */
export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  disabled = false,
  className = '',
  showArrow = true,
  maxWidth = 200
}) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef(null)
  const positionConfig = POSITIONS[position] || POSITIONS.top

  const showTooltip = () => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (!content) {
    return <>{children}</>
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 ${positionConfig.tooltip} ${className}`}
          role="tooltip"
        >
          <div
            className="px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap"
            style={{ maxWidth }}
          >
            {content}
          </div>
          {showArrow && (
            <div
              className={`absolute w-0 h-0 border-4 ${positionConfig.arrow}`}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// ICON TOOLTIP
// ============================================

/**
 * Tooltip wrapped around an icon
 */
export function IconTooltip({
  icon: Icon,
  content,
  position = 'top',
  iconClassName = 'h-4 w-4 text-gray-400'
}) {
  return (
    <Tooltip content={content} position={position}>
      <Icon className={iconClassName} />
    </Tooltip>
  )
}

// ============================================
// HELP TOOLTIP
// ============================================

import { HelpCircle } from 'lucide-react'

/**
 * Help tooltip with question mark icon
 */
export function HelpTooltip({
  content,
  position = 'top',
  size = 'sm'
}) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <Tooltip content={content} position={position}>
      <HelpCircle
        className={`${sizeClasses[size]} text-gray-400 hover:text-gray-500 cursor-help`}
      />
    </Tooltip>
  )
}

// ============================================
// TRUNCATED TEXT WITH TOOLTIP
// ============================================

/**
 * Truncated text that shows full content in tooltip
 */
export function TruncatedText({
  children,
  maxLength = 30,
  position = 'top',
  className = ''
}) {
  const text = String(children)
  const isTruncated = text.length > maxLength
  const displayText = isTruncated ? `${text.slice(0, maxLength)}...` : text

  if (!isTruncated) {
    return <span className={className}>{text}</span>
  }

  return (
    <Tooltip content={text} position={position}>
      <span className={`cursor-default ${className}`}>{displayText}</span>
    </Tooltip>
  )
}

// ============================================
// POPOVER COMPONENT
// ============================================

/**
 * Popover with click interaction
 */
export function Popover({
  children,
  content,
  position = 'bottom',
  trigger = 'click',
  closeOnClickOutside = true,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)
  const positionConfig = POSITIONS[position] || POSITIONS.bottom

  // Handle click outside
  useEffect(() => {
    if (!closeOnClickOutside || !isOpen) return

    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, closeOnClickOutside])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsOpen(!isOpen)
    }
  }

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsOpen(false)
    }
  }

  return (
    <div
      ref={popoverRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div onClick={handleTrigger} className="cursor-pointer">
        {children}
      </div>
      {isOpen && (
        <div
          className={`absolute z-50 ${positionConfig.tooltip} ${className}`}
        >
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {typeof content === 'function'
              ? content({ close: () => setIsOpen(false) })
              : content}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// DROPDOWN MENU
// ============================================

/**
 * Simple dropdown menu
 */
export function DropdownMenu({
  trigger,
  items,
  position = 'bottom',
  align = 'left'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  }

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={menuRef} className="relative inline-flex">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute z-50 ${position === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} ${alignClasses[align]} min-w-[160px]`}
        >
          <div className="bg-white rounded-md shadow-lg border border-gray-200 py-1">
            {items.map((item, index) => {
              if (item.divider) {
                return (
                  <div key={index} className="border-t border-gray-100 my-1" />
                )
              }

              if (item.header) {
                return (
                  <div
                    key={index}
                    className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase"
                  >
                    {item.header}
                  </div>
                )
              }

              return (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick?.()
                    setIsOpen(false)
                  }}
                  disabled={item.disabled}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// CONTEXT MENU
// ============================================

/**
 * Right-click context menu
 */
export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleContextMenu = (event) => {
    event.preventDefault()
    setPosition({ x: event.clientX, y: event.clientY })
    setIsOpen(true)
  }

  const close = () => setIsOpen(false)

  useEffect(() => {
    if (!isOpen) return

    const handleClick = () => close()
    const handleEscape = (e) => e.key === 'Escape' && close()

    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return {
    isOpen,
    position,
    handleContextMenu,
    close
  }
}

export function ContextMenu({ isOpen, position, items, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed z-50"
      style={{ top: position.y, left: position.x }}
    >
      <div className="bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[160px]">
        {items.map((item, index) => {
          if (item.divider) {
            return (
              <div key={index} className="border-t border-gray-100 my-1" />
            )
          }

          return (
            <button
              key={index}
              onClick={() => {
                item.onClick?.()
                onClose?.()
              }}
              disabled={item.disabled}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                item.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
              {item.shortcut && (
                <span className="ml-auto text-xs text-gray-400">
                  {item.shortcut}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default {
  Tooltip,
  IconTooltip,
  HelpTooltip,
  TruncatedText,
  Popover,
  DropdownMenu,
  useContextMenu,
  ContextMenu
}
