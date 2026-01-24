/**
 * Breadcrumb Component
 * Navigation breadcrumbs for page hierarchy
 *
 * @location src/components/ui/Breadcrumb.jsx
 */

import React from 'react'
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react'

// ============================================
// BASE BREADCRUMB
// ============================================

/**
 * Base breadcrumb container
 */
export function Breadcrumb({
  children,
  separator = 'chevron',
  size = 'md',
  className = ''
}) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const separatorElements = {
    chevron: <ChevronRight className="h-4 w-4 text-gray-400" />,
    slash: <span className="text-gray-400">/</span>,
    arrow: <span className="text-gray-400">→</span>,
    dot: <span className="text-gray-400">•</span>
  }

  const separatorElement = separatorElements[separator] || separatorElements.chevron

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={`flex items-center gap-1 ${sizeClasses[size]}`}>
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return null

          return (
            <>
              {index > 0 && (
                <li className="flex items-center" aria-hidden="true">
                  {separatorElement}
                </li>
              )}
              <li className="flex items-center">
                {child}
              </li>
            </>
          )
        })}
      </ol>
    </nav>
  )
}

// ============================================
// BREADCRUMB ITEM
// ============================================

/**
 * Breadcrumb item (link or current page)
 */
export function BreadcrumbItem({
  href,
  onClick,
  current = false,
  icon: Icon,
  children,
  className = ''
}) {
  const baseClasses = 'flex items-center gap-1.5 transition-colors'
  const linkClasses = 'text-gray-500 hover:text-gray-700 hover:underline'
  const currentClasses = 'text-gray-900 font-medium'

  if (current) {
    return (
      <span
        className={`${baseClasses} ${currentClasses} ${className}`}
        aria-current="page"
      >
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </span>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        className={`${baseClasses} ${linkClasses} ${className}`}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${linkClasses} ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  )
}

// ============================================
// BREADCRUMB HOME
// ============================================

/**
 * Home icon breadcrumb item
 */
export function BreadcrumbHome({ href, onClick, label = 'Home' }) {
  const content = (
    <>
      <Home className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className="text-gray-500 hover:text-gray-700 transition-colors"
        aria-label={label}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-gray-500 hover:text-gray-700 transition-colors"
      aria-label={label}
    >
      {content}
    </button>
  )
}

// ============================================
// SIMPLE BREADCRUMB
// ============================================

/**
 * Simple breadcrumb from array of items
 */
export function SimpleBreadcrumb({
  items = [],
  separator = 'chevron',
  size = 'md',
  showHome = false,
  homeHref = '/',
  onNavigate,
  className = ''
}) {
  return (
    <Breadcrumb separator={separator} size={size} className={className}>
      {showHome && (
        <BreadcrumbHome
          href={onNavigate ? undefined : homeHref}
          onClick={onNavigate ? () => onNavigate(homeHref) : undefined}
        />
      )}
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <BreadcrumbItem
            key={item.href || item.label || index}
            href={!isLast && !onNavigate ? item.href : undefined}
            onClick={!isLast && onNavigate ? () => onNavigate(item.href) : undefined}
            current={isLast}
            icon={item.icon}
          >
            {item.label}
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
}

// ============================================
// COLLAPSIBLE BREADCRUMB
// ============================================

/**
 * Breadcrumb that collapses middle items
 */
export function CollapsibleBreadcrumb({
  items = [],
  maxItems = 4,
  separator = 'chevron',
  size = 'md',
  showHome = false,
  homeHref = '/',
  onNavigate,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  if (items.length <= maxItems) {
    return (
      <SimpleBreadcrumb
        items={items}
        separator={separator}
        size={size}
        showHome={showHome}
        homeHref={homeHref}
        onNavigate={onNavigate}
        className={className}
      />
    )
  }

  if (isExpanded) {
    return (
      <SimpleBreadcrumb
        items={items}
        separator={separator}
        size={size}
        showHome={showHome}
        homeHref={homeHref}
        onNavigate={onNavigate}
        className={className}
      />
    )
  }

  const firstItem = items[0]
  const lastItems = items.slice(-2)
  const hiddenCount = items.length - 3

  return (
    <Breadcrumb separator={separator} size={size} className={className}>
      {showHome && (
        <BreadcrumbHome
          href={onNavigate ? undefined : homeHref}
          onClick={onNavigate ? () => onNavigate(homeHref) : undefined}
        />
      )}
      <BreadcrumbItem
        href={!onNavigate ? firstItem.href : undefined}
        onClick={onNavigate ? () => onNavigate(firstItem.href) : undefined}
        icon={firstItem.icon}
      >
        {firstItem.label}
      </BreadcrumbItem>
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
        title={`Show ${hiddenCount} more items`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {lastItems.map((item, index) => {
        const isLast = index === lastItems.length - 1
        return (
          <BreadcrumbItem
            key={item.href || item.label || index}
            href={!isLast && !onNavigate ? item.href : undefined}
            onClick={!isLast && onNavigate ? () => onNavigate(item.href) : undefined}
            current={isLast}
            icon={item.icon}
          >
            {item.label}
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
}

// ============================================
// BREADCRUMB WITH DROPDOWN
// ============================================

/**
 * Breadcrumb with dropdown menu for collapsed items
 */
export function BreadcrumbWithDropdown({
  items = [],
  maxItems = 4,
  separator = 'chevron',
  size = 'md',
  showHome = false,
  homeHref = '/',
  onNavigate,
  className = ''
}) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const dropdownRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (items.length <= maxItems) {
    return (
      <SimpleBreadcrumb
        items={items}
        separator={separator}
        size={size}
        showHome={showHome}
        homeHref={homeHref}
        onNavigate={onNavigate}
        className={className}
      />
    )
  }

  const firstItem = items[0]
  const hiddenItems = items.slice(1, -2)
  const lastItems = items.slice(-2)

  return (
    <Breadcrumb separator={separator} size={size} className={className}>
      {showHome && (
        <BreadcrumbHome
          href={onNavigate ? undefined : homeHref}
          onClick={onNavigate ? () => onNavigate(homeHref) : undefined}
        />
      )}
      <BreadcrumbItem
        href={!onNavigate ? firstItem.href : undefined}
        onClick={onNavigate ? () => onNavigate(firstItem.href) : undefined}
        icon={firstItem.icon}
      >
        {firstItem.label}
      </BreadcrumbItem>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
            {hiddenItems.map((item, index) => (
              <button
                key={item.href || item.label || index}
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(item.href)
                  } else {
                    window.location.href = item.href
                  }
                  setIsDropdownOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                {item.icon && <item.icon className="h-4 w-4 text-gray-400" />}
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {lastItems.map((item, index) => {
        const isLast = index === lastItems.length - 1
        return (
          <BreadcrumbItem
            key={item.href || item.label || index}
            href={!isLast && !onNavigate ? item.href : undefined}
            onClick={!isLast && onNavigate ? () => onNavigate(item.href) : undefined}
            current={isLast}
            icon={item.icon}
          >
            {item.label}
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
}

// ============================================
// BREADCRUMB WITH BACK
// ============================================

/**
 * Breadcrumb with back button
 */
export function BreadcrumbWithBack({
  items = [],
  onBack,
  backLabel = 'Back',
  separator = 'chevron',
  size = 'md',
  className = ''
}) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronRight className="h-4 w-4 rotate-180" />
        {backLabel}
      </button>
      <div className="h-4 w-px bg-gray-300" />
      <SimpleBreadcrumb
        items={items}
        separator={separator}
        size={size}
      />
    </div>
  )
}

// ============================================
// PAGE BREADCRUMB
// ============================================

/**
 * Full-width page breadcrumb
 */
export function PageBreadcrumb({
  items = [],
  title,
  actions,
  separator = 'chevron',
  showHome = true,
  homeHref = '/',
  onNavigate,
  className = ''
}) {
  const lastItem = items[items.length - 1]

  return (
    <div className={`border-b border-gray-200 bg-white ${className}`}>
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <SimpleBreadcrumb
          items={items}
          separator={separator}
          showHome={showHome}
          homeHref={homeHref}
          onNavigate={onNavigate}
        />
        {(title || actions) && (
          <div className="mt-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {title || lastItem?.label}
            </h1>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// COMPACT BREADCRUMB
// ============================================

/**
 * Compact breadcrumb showing only parent and current
 */
export function CompactBreadcrumb({
  parent,
  current,
  onNavigate,
  className = ''
}) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 text-sm ${className}`}>
      {parent && (
        <>
          <BreadcrumbItem
            href={!onNavigate ? parent.href : undefined}
            onClick={onNavigate ? () => onNavigate(parent.href) : undefined}
            icon={parent.icon}
          >
            {parent.label}
          </BreadcrumbItem>
          <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
        </>
      )}
      <BreadcrumbItem current icon={current.icon}>
        {current.label}
      </BreadcrumbItem>
    </nav>
  )
}

// ============================================
// STYLED BREADCRUMB
// ============================================

/**
 * Breadcrumb with background styling
 */
export function StyledBreadcrumb({
  items = [],
  variant = 'default',
  separator = 'chevron',
  size = 'md',
  showHome = false,
  homeHref = '/',
  onNavigate,
  className = ''
}) {
  const variantClasses = {
    default: '',
    contained: 'bg-gray-100 px-4 py-2 rounded-lg',
    bordered: 'border border-gray-200 px-4 py-2 rounded-lg',
    pills: ''
  }

  if (variant === 'pills') {
    return (
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex items-center gap-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={item.href || item.label || index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-1" aria-hidden="true" />
                )}
                {isLast ? (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={!onNavigate ? item.href : undefined}
                    onClick={onNavigate ? (e) => { e.preventDefault(); onNavigate(item.href) } : undefined}
                    className="px-3 py-1 text-gray-600 hover:text-gray-900 text-sm"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }

  return (
    <div className={variantClasses[variant]}>
      <SimpleBreadcrumb
        items={items}
        separator={separator}
        size={size}
        showHome={showHome}
        homeHref={homeHref}
        onNavigate={onNavigate}
        className={className}
      />
    </div>
  )
}

export default {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbHome,
  SimpleBreadcrumb,
  CollapsibleBreadcrumb,
  BreadcrumbWithDropdown,
  BreadcrumbWithBack,
  PageBreadcrumb,
  CompactBreadcrumb,
  StyledBreadcrumb
}
