/**
 * Tabs Component
 * Tab navigation and content panels
 *
 * @location src/components/ui/Tabs.jsx
 */

import React, { useState, createContext, useContext } from 'react'

// ============================================
// TABS CONTEXT
// ============================================

const TabsContext = createContext(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tab components must be used within a Tabs component')
  }
  return context
}

// ============================================
// TABS VARIANTS
// ============================================

const TAB_VARIANTS = {
  underline: {
    list: 'border-b border-gray-200',
    tab: 'border-b-2 border-transparent py-3 px-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300',
    activeTab: 'border-blue-500 text-blue-600'
  },
  pills: {
    list: 'space-x-2',
    tab: 'px-3 py-2 text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    activeTab: 'bg-blue-100 text-blue-700'
  },
  bordered: {
    list: 'border-b border-gray-200 space-x-4',
    tab: 'px-4 py-2 text-sm font-medium border border-transparent rounded-t-lg text-gray-500 hover:text-gray-700',
    activeTab: 'bg-white border-gray-200 border-b-white text-gray-900 -mb-px'
  },
  segment: {
    list: 'bg-gray-100 p-1 rounded-lg',
    tab: 'px-3 py-1.5 text-sm font-medium rounded-md text-gray-600',
    activeTab: 'bg-white text-gray-900 shadow-sm'
  },
  minimal: {
    list: '',
    tab: 'px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900',
    activeTab: 'text-gray-900'
  }
}

// ============================================
// TABS COMPONENT
// ============================================

/**
 * Tabs container component
 */
export function Tabs({
  children,
  defaultValue,
  value,
  onChange,
  variant = 'underline',
  fullWidth = false,
  className = ''
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeValue = value !== undefined ? value : internalValue

  const handleChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  return (
    <TabsContext.Provider
      value={{
        activeValue,
        onChange: handleChange,
        variant,
        fullWidth
      }}
    >
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

// ============================================
// TAB LIST
// ============================================

/**
 * Container for tab triggers
 */
export function TabList({ children, className = '' }) {
  const { variant, fullWidth } = useTabsContext()
  const styles = TAB_VARIANTS[variant] || TAB_VARIANTS.underline

  return (
    <div
      className={`flex ${fullWidth ? '' : 'inline-flex'} ${styles.list} ${className}`}
      role="tablist"
    >
      {children}
    </div>
  )
}

// ============================================
// TAB TRIGGER
// ============================================

/**
 * Individual tab trigger
 */
export function TabTrigger({
  value,
  children,
  disabled = false,
  icon: Icon,
  badge,
  className = ''
}) {
  const { activeValue, onChange, variant, fullWidth } = useTabsContext()
  const isActive = activeValue === value
  const styles = TAB_VARIANTS[variant] || TAB_VARIANTS.underline

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      onClick={() => onChange(value)}
      className={`
        ${styles.tab}
        ${isActive ? styles.activeTab : ''}
        ${fullWidth ? 'flex-1 text-center' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        inline-flex items-center justify-center gap-2 transition-colors
        ${className}
      `}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
      {badge !== undefined && (
        <span
          className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
            isActive
              ? 'bg-blue-200 text-blue-800'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

// ============================================
// TAB CONTENT
// ============================================

/**
 * Container for tab panels
 */
export function TabContent({ children, className = '' }) {
  return <div className={className}>{children}</div>
}

/**
 * Individual tab panel
 */
export function TabPanel({
  value,
  children,
  forceMount = false,
  className = ''
}) {
  const { activeValue } = useTabsContext()
  const isActive = activeValue === value

  if (!forceMount && !isActive) {
    return null
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={className}
    >
      {children}
    </div>
  )
}

// ============================================
// SIMPLE TABS COMPONENT
// ============================================

/**
 * Simple tabs with array-based configuration
 */
export function SimpleTabs({
  tabs,
  defaultTab,
  variant = 'underline',
  fullWidth = false,
  onChange,
  className = ''
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value)

  const handleChange = (value) => {
    setActiveTab(value)
    onChange?.(value)
  }

  return (
    <Tabs
      value={activeTab}
      onChange={handleChange}
      variant={variant}
      fullWidth={fullWidth}
      className={className}
    >
      <TabList>
        {tabs.map((tab) => (
          <TabTrigger
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            badge={tab.badge}
            disabled={tab.disabled}
          >
            {tab.label}
          </TabTrigger>
        ))}
      </TabList>
      <TabContent className="mt-4">
        {tabs.map((tab) => (
          <TabPanel key={tab.value} value={tab.value}>
            {tab.content}
          </TabPanel>
        ))}
      </TabContent>
    </Tabs>
  )
}

// ============================================
// VERTICAL TABS
// ============================================

/**
 * Vertical tabs layout
 */
export function VerticalTabs({
  children,
  defaultValue,
  value,
  onChange,
  className = ''
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeValue = value !== undefined ? value : internalValue

  const handleChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  return (
    <TabsContext.Provider
      value={{
        activeValue,
        onChange: handleChange,
        variant: 'vertical',
        fullWidth: false
      }}
    >
      <div className={`flex ${className}`}>{children}</div>
    </TabsContext.Provider>
  )
}

/**
 * Vertical tab list
 */
export function VerticalTabList({ children, className = '' }) {
  return (
    <div
      className={`flex flex-col space-y-1 border-r border-gray-200 pr-4 min-w-[200px] ${className}`}
      role="tablist"
      aria-orientation="vertical"
    >
      {children}
    </div>
  )
}

/**
 * Vertical tab trigger
 */
export function VerticalTabTrigger({
  value,
  children,
  disabled = false,
  icon: Icon,
  description,
  className = ''
}) {
  const { activeValue, onChange } = useTabsContext()
  const isActive = activeValue === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => onChange(value)}
      className={`
        w-full text-left px-4 py-3 rounded-lg transition-colors
        ${
          isActive
            ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon
            className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
          />
        )}
        <div>
          <div className="font-medium">{children}</div>
          {description && (
            <div className="text-xs text-gray-500 mt-0.5">{description}</div>
          )}
        </div>
      </div>
    </button>
  )
}

/**
 * Vertical tab content
 */
export function VerticalTabContent({ children, className = '' }) {
  return <div className={`flex-1 pl-6 ${className}`}>{children}</div>
}

// ============================================
// SCROLLABLE TABS
// ============================================

/**
 * Horizontally scrollable tabs
 */
export function ScrollableTabs({
  children,
  defaultValue,
  value,
  onChange,
  variant = 'underline',
  className = ''
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeValue = value !== undefined ? value : internalValue

  const handleChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  return (
    <TabsContext.Provider
      value={{
        activeValue,
        onChange: handleChange,
        variant,
        fullWidth: false
      }}
    >
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

/**
 * Scrollable tab list
 */
export function ScrollableTabList({ children, className = '' }) {
  const { variant } = useTabsContext()
  const styles = TAB_VARIANTS[variant] || TAB_VARIANTS.underline

  return (
    <div className="relative">
      <div
        className={`flex overflow-x-auto scrollbar-hide ${styles.list} ${className}`}
        role="tablist"
      >
        {children}
      </div>
    </div>
  )
}

// ============================================
// CARD TABS
// ============================================

/**
 * Tabs styled as cards
 */
export function CardTabs({
  tabs,
  activeTab,
  onChange,
  columns = 3,
  className = ''
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-${columns} gap-4 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value
        const Icon = tab.icon

        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            disabled={tab.disabled}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${
                isActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {Icon && (
              <Icon
                className={`h-6 w-6 mb-2 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              />
            )}
            <h3
              className={`font-medium ${
                isActive ? 'text-blue-900' : 'text-gray-900'
              }`}
            >
              {tab.label}
            </h3>
            {tab.description && (
              <p className="text-sm text-gray-500 mt-1">{tab.description}</p>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default {
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
  TabPanel,
  SimpleTabs,
  VerticalTabs,
  VerticalTabList,
  VerticalTabTrigger,
  VerticalTabContent,
  ScrollableTabs,
  ScrollableTabList,
  CardTabs
}
