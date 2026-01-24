import React, { useState, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Search,
  Settings,
  LogOut,
  User,
  Bell,
  HelpCircle
} from 'lucide-react';

/**
 * Batch 104: Sidebar Component
 *
 * Sidebar navigation and layout components.
 *
 * Exports:
 * - Sidebar: Basic sidebar container
 * - SidebarHeader: Sidebar header with logo
 * - SidebarContent: Scrollable content area
 * - SidebarFooter: Fixed footer
 * - SidebarNav: Navigation menu
 * - SidebarNavItem: Navigation item
 * - SidebarNavGroup: Collapsible nav group
 * - SidebarDivider: Section divider
 * - SidebarToggle: Collapse toggle button
 * - CollapsibleSidebar: Sidebar with collapse
 * - MobileSidebar: Mobile-responsive sidebar
 * - SidebarLayout: Layout with sidebar
 */

// ============================================================================
// SIDEBAR CONTEXT
// ============================================================================
const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: () => {},
  isMobile: false,
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

// ============================================================================
// SIDEBAR - Basic sidebar container
// ============================================================================
export function Sidebar({
  children,
  width = 256,
  collapsedWidth = 64,
  collapsed = false,
  variant = 'default',
  position = 'left',
  className,
  ...props
}) {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
    dark: 'bg-gray-900 text-white',
    light: 'bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
    transparent: 'bg-transparent',
  };

  return (
    <aside
      className={cn(
        'h-full flex flex-col transition-all duration-300',
        variantClasses[variant],
        position === 'right' && 'border-l border-r-0',
        className
      )}
      style={{ width: collapsed ? collapsedWidth : width }}
      {...props}
    >
      {children}
    </aside>
  );
}

// ============================================================================
// SIDEBAR HEADER - Sidebar header with logo
// ============================================================================
export function SidebarHeader({
  logo,
  title,
  subtitle,
  collapsed = false,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-800',
        collapsed && 'justify-center px-2',
        className
      )}
      {...props}
    >
      {logo && (
        <div className="flex-shrink-0">
          {typeof logo === 'string' ? (
            <img src={logo} alt={title || ''} className="h-8 w-8" />
          ) : (
            logo
          )}
        </div>
      )}

      {!collapsed && (
        <>
          <div className="flex-1 min-w-0">
            {title && (
              <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </>
      )}
    </div>
  );
}

// ============================================================================
// SIDEBAR CONTENT - Scrollable content area
// ============================================================================
export function SidebarContent({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// SIDEBAR FOOTER - Fixed footer
// ============================================================================
export function SidebarFooter({
  children,
  collapsed = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'px-4 py-4 border-t border-gray-200 dark:border-gray-800',
        collapsed && 'px-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// SIDEBAR NAV - Navigation menu
// ============================================================================
export function SidebarNav({
  children,
  collapsed = false,
  className,
  ...props
}) {
  return (
    <nav className={cn('space-y-1 px-3', collapsed && 'px-2', className)} {...props}>
      {children}
    </nav>
  );
}

// ============================================================================
// SIDEBAR NAV ITEM - Navigation item
// ============================================================================
export function SidebarNavItem({
  icon: Icon,
  label,
  href,
  onClick,
  active = false,
  disabled = false,
  badge,
  collapsed = false,
  className,
  ...props
}) {
  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
        'transition-colors',
        active
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
        disabled && 'opacity-50 cursor-not-allowed',
        collapsed && 'justify-center px-2',
        className
      )}
      title={collapsed ? label : undefined}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </Component>
  );
}

// ============================================================================
// SIDEBAR NAV GROUP - Collapsible nav group
// ============================================================================
export function SidebarNavGroup({
  icon: Icon,
  label,
  children,
  defaultOpen = false,
  collapsed = false,
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (collapsed) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div className={className} {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
          'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors'
        )}
      >
        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
        <span className="flex-1 text-left truncate">{label}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="mt-1 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SIDEBAR DIVIDER - Section divider
// ============================================================================
export function SidebarDivider({
  label,
  collapsed = false,
  className,
  ...props
}) {
  if (collapsed) {
    return (
      <div
        className={cn('my-4 mx-2 h-px bg-gray-200 dark:bg-gray-700', className)}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        className={cn('px-3 py-2 mt-4 mb-2', className)}
        {...props}
      >
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn('my-4 mx-3 h-px bg-gray-200 dark:bg-gray-700', className)}
      {...props}
    />
  );
}

// ============================================================================
// SIDEBAR TOGGLE - Collapse toggle button
// ============================================================================
export function SidebarToggle({
  collapsed,
  onToggle,
  position = 'bottom',
  className,
  ...props
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'p-2 rounded-lg',
        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'transition-colors',
        className
      )}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      {...props}
    >
      {collapsed ? (
        <ChevronRight className="w-5 h-5" />
      ) : (
        <ChevronLeft className="w-5 h-5" />
      )}
    </button>
  );
}

// ============================================================================
// COLLAPSIBLE SIDEBAR - Sidebar with collapse
// ============================================================================
export function CollapsibleSidebar({
  children,
  defaultCollapsed = false,
  width = 256,
  collapsedWidth = 64,
  variant = 'default',
  className,
  ...props
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <Sidebar
        width={width}
        collapsedWidth={collapsedWidth}
        collapsed={collapsed}
        variant={variant}
        className={className}
        {...props}
      >
        {typeof children === 'function'
          ? children({ collapsed, setCollapsed })
          : children}
      </Sidebar>
    </SidebarContext.Provider>
  );
}

// ============================================================================
// MOBILE SIDEBAR - Mobile-responsive sidebar
// ============================================================================
export function MobileSidebar({
  children,
  open,
  onClose,
  position = 'left',
  className,
  ...props
}) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 z-50 w-64',
          'bg-white dark:bg-gray-900',
          'shadow-xl',
          'transform transition-transform duration-300',
          position === 'left' ? 'left-0' : 'right-0',
          className
        )}
        {...props}
      >
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 p-2 rounded-lg',
            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            position === 'left' ? 'right-4' : 'left-4'
          )}
        >
          <X className="w-5 h-5" />
        </button>

        {children}
      </div>
    </>
  );
}

// ============================================================================
// SIDEBAR LAYOUT - Layout with sidebar
// ============================================================================
export function SidebarLayout({
  sidebar,
  children,
  sidebarWidth = 256,
  collapsedWidth = 64,
  defaultCollapsed = false,
  mobileBreakpoint = 768,
  className,
  ...props
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, isMobile, mobileOpen, setMobileOpen }}
    >
      <div className={cn('flex h-screen', className)} {...props}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar
            width={sidebarWidth}
            collapsedWidth={collapsedWidth}
            collapsed={collapsed}
          >
            {typeof sidebar === 'function'
              ? sidebar({ collapsed, setCollapsed })
              : sidebar}
          </Sidebar>
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)}>
            {typeof sidebar === 'function'
              ? sidebar({ collapsed: false, setCollapsed: () => {} })
              : sidebar}
          </MobileSidebar>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          )}

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

// ============================================================================
// SIDEBAR USER - User info in sidebar
// ============================================================================
export function SidebarUser({
  name,
  email,
  avatar,
  collapsed = false,
  onSettingsClick,
  onLogoutClick,
  className,
  ...props
}) {
  const [showMenu, setShowMenu] = useState(false);

  if (collapsed) {
    return (
      <button
        className={cn(
          'w-full flex justify-center p-2 rounded-lg',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          className
        )}
        title={name}
        {...props}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            {name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={cn('relative', className)} {...props}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {avatar ? (
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
            {name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
          </div>
        )}
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {name}
          </p>
          {email && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {email}
            </p>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-2 z-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg py-1">
            <button
              onClick={() => {
                onSettingsClick?.();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => {
                onLogoutClick?.();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// SIDEBAR SEARCH - Search in sidebar
// ============================================================================
export function SidebarSearch({
  placeholder = 'Search...',
  value,
  onChange,
  collapsed = false,
  className,
  ...props
}) {
  if (collapsed) {
    return (
      <button
        className={cn(
          'w-full flex justify-center p-2 rounded-lg',
          'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          className
        )}
        title="Search"
        {...props}
      >
        <Search className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className={cn('px-3 mb-4', className)} {...props}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

export default Sidebar;
