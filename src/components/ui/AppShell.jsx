import React, { useState, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { Menu, X, ChevronLeft, ChevronRight, Bell, Search, User, Settings, LogOut, Home } from 'lucide-react';

/**
 * Batch 108: AppShell Component
 *
 * Application shell and layout components.
 *
 * Exports:
 * - AppShell: Main application shell
 * - AppShellHeader: Header section
 * - AppShellNavbar: Top navigation bar
 * - AppShellSidebar: Side navigation
 * - AppShellMain: Main content area
 * - AppShellFooter: Footer section
 * - AppShellAside: Right sidebar
 * - DashboardShell: Dashboard-specific shell
 * - AdminShell: Admin panel shell
 * - DocsShell: Documentation shell
 */

const AppShellContext = createContext({
  sidebarOpen: true,
  setSidebarOpen: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  mobileMenuOpen: false,
  setMobileMenuOpen: () => {},
});

export const useAppShell = () => useContext(AppShellContext);

// ============================================================================
// APP SHELL - Main application shell
// ============================================================================
export function AppShell({
  children,
  layout = 'default',
  sidebarWidth = 256,
  sidebarCollapsedWidth = 64,
  headerHeight = 64,
  className,
  ...props
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const layoutClasses = {
    default: '',
    sidebar: '',
    navbar: '',
    'sidebar-navbar': '',
  };

  return (
    <AppShellContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        sidebarWidth,
        sidebarCollapsedWidth,
        headerHeight,
      }}
    >
      <div
        className={cn(
          'min-h-screen bg-gray-50 dark:bg-gray-900',
          layoutClasses[layout],
          className
        )}
        style={{
          '--sidebar-width': `${sidebarWidth}px`,
          '--sidebar-collapsed-width': `${sidebarCollapsedWidth}px`,
          '--header-height': `${headerHeight}px`,
        }}
        {...props}
      >
        {children}
      </div>
    </AppShellContext.Provider>
  );
}

// ============================================================================
// APP SHELL HEADER - Header section
// ============================================================================
export function AppShellHeader({
  children,
  fixed = false,
  bordered = true,
  className,
  ...props
}) {
  const { headerHeight } = useAppShell();

  return (
    <header
      className={cn(
        'bg-white dark:bg-gray-900 z-40',
        fixed && 'fixed top-0 left-0 right-0',
        bordered && 'border-b border-gray-200 dark:border-gray-700',
        className
      )}
      style={{ height: headerHeight }}
      {...props}
    >
      <div className="h-full flex items-center px-4 lg:px-6">
        {children}
      </div>
    </header>
  );
}

// ============================================================================
// APP SHELL NAVBAR - Top navigation bar
// ============================================================================
export function AppShellNavbar({
  brand,
  brandHref = '/',
  leftContent,
  rightContent,
  children,
  fixed = false,
  className,
  ...props
}) {
  const { setMobileMenuOpen } = useAppShell();

  return (
    <AppShellHeader fixed={fixed} className={className} {...props}>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {brand && (
          <a href={brandHref} className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
            {brand}
          </a>
        )}

        {leftContent}
      </div>

      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>

      <div className="flex items-center gap-4">
        {rightContent}
      </div>
    </AppShellHeader>
  );
}

// ============================================================================
// APP SHELL SIDEBAR - Side navigation
// ============================================================================
export function AppShellSidebar({
  children,
  position = 'left',
  collapsible = true,
  fixed = true,
  className,
  ...props
}) {
  const {
    sidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    sidebarWidth,
    sidebarCollapsedWidth,
    headerHeight,
  } = useAppShell();

  const currentWidth = sidebarCollapsed ? sidebarCollapsedWidth : sidebarWidth;

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:hidden',
          position === 'left' ? 'left-0' : 'right-0',
          mobileMenuOpen
            ? 'translate-x-0'
            : position === 'left'
              ? '-translate-x-full'
              : 'translate-x-full',
          className
        )}
        style={{ width: sidebarWidth }}
        {...props}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
          <button
            type="button"
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {children}
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
          fixed && 'fixed inset-y-0',
          position === 'left' ? 'left-0' : 'right-0',
          className
        )}
        style={{
          width: currentWidth,
          top: fixed ? headerHeight : 0,
        }}
        {...props}
      >
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {collapsible && (
          <button
            type="button"
            className="flex items-center justify-center h-12 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}
      </aside>
    </>
  );
}

// ============================================================================
// APP SHELL MAIN - Main content area
// ============================================================================
export function AppShellMain({
  children,
  withSidebar = false,
  withHeader = true,
  withAside = false,
  asideWidth = 320,
  className,
  ...props
}) {
  const { sidebarCollapsed, sidebarWidth, sidebarCollapsedWidth, headerHeight } = useAppShell();
  const currentSidebarWidth = sidebarCollapsed ? sidebarCollapsedWidth : sidebarWidth;

  return (
    <main
      className={cn(
        'min-h-screen transition-all duration-300',
        className
      )}
      style={{
        marginLeft: withSidebar ? currentSidebarWidth : 0,
        marginRight: withAside ? asideWidth : 0,
        paddingTop: withHeader ? headerHeight : 0,
      }}
      {...props}
    >
      {children}
    </main>
  );
}

// ============================================================================
// APP SHELL FOOTER - Footer section
// ============================================================================
export function AppShellFooter({
  children,
  withSidebar = false,
  className,
  ...props
}) {
  const { sidebarCollapsed, sidebarWidth, sidebarCollapsedWidth } = useAppShell();
  const currentSidebarWidth = sidebarCollapsed ? sidebarCollapsedWidth : sidebarWidth;

  return (
    <footer
      className={cn(
        'bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-all duration-300',
        className
      )}
      style={{
        marginLeft: withSidebar ? currentSidebarWidth : 0,
      }}
      {...props}
    >
      {children}
    </footer>
  );
}

// ============================================================================
// APP SHELL ASIDE - Right sidebar
// ============================================================================
export function AppShellAside({
  children,
  width = 320,
  fixed = true,
  className,
  ...props
}) {
  const { headerHeight } = useAppShell();

  return (
    <aside
      className={cn(
        'hidden xl:block bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700',
        fixed && 'fixed right-0 overflow-y-auto',
        className
      )}
      style={{
        width,
        top: fixed ? headerHeight : 0,
        height: fixed ? `calc(100vh - ${headerHeight}px)` : 'auto',
      }}
      {...props}
    >
      {children}
    </aside>
  );
}

// ============================================================================
// DASHBOARD SHELL - Dashboard-specific shell
// ============================================================================
export function DashboardShell({
  children,
  brand,
  user,
  navigation = [],
  onLogout,
  className,
  ...props
}) {
  return (
    <AppShell className={className} {...props}>
      <AppShellNavbar
        brand={brand}
        fixed
        rightContent={
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              <Search className="w-5 h-5" />
            </button>
            {user && (
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        }
      />

      <AppShellSidebar fixed>
        <nav className="p-4 space-y-1">
          {navigation.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                item.active
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              {item.label}
            </a>
          ))}
        </nav>
      </AppShellSidebar>

      <AppShellMain withSidebar withHeader>
        {children}
      </AppShellMain>
    </AppShell>
  );
}

// ============================================================================
// ADMIN SHELL - Admin panel shell
// ============================================================================
export function AdminShell({
  children,
  brand = 'Admin',
  user,
  navigation = [],
  onLogout,
  className,
  ...props
}) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AppShell className={className} {...props}>
      <AppShellHeader fixed>
        <div className="flex items-center gap-4 flex-1">
          <a href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
            {brand}
          </a>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {user && (
            <button className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {user.name?.charAt(0)}
                </div>
              )}
              <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white">
                {user.name}
              </span>
            </button>
          )}
        </div>
      </AppShellHeader>

      <AppShellSidebar fixed collapsible>
        <nav className="p-2">
          {navigation.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {section.title && (
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <a
                    key={itemIndex}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      item.active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </AppShellSidebar>

      <AppShellMain withSidebar withHeader className="p-6">
        {children}
      </AppShellMain>
    </AppShell>
  );
}

// ============================================================================
// DOCS SHELL - Documentation shell
// ============================================================================
export function DocsShell({
  children,
  brand,
  navigation = [],
  tableOfContents = [],
  className,
  ...props
}) {
  return (
    <AppShell sidebarWidth={280} className={className} {...props}>
      <AppShellNavbar brand={brand} fixed />

      <AppShellSidebar fixed collapsible={false}>
        <nav className="p-4">
          {navigation.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {section.title && (
                <h3 className="px-2 mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a
                      href={item.href}
                      className={cn(
                        'block px-2 py-1.5 text-sm rounded-md transition-colors',
                        item.active
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      {item.label}
                    </a>
                    {item.children && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {item.children.map((child, childIndex) => (
                          <li key={childIndex}>
                            <a
                              href={child.href}
                              className={cn(
                                'block px-2 py-1 text-sm rounded-md transition-colors',
                                child.active
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
                              )}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </AppShellSidebar>

      <AppShellMain withSidebar withHeader>
        <div className="max-w-4xl mx-auto px-6 py-8">
          {children}
        </div>
      </AppShellMain>

      {tableOfContents.length > 0 && (
        <AppShellAside width={240}>
          <div className="p-4 sticky top-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              On this page
            </h4>
            <ul className="space-y-2">
              {tableOfContents.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className={cn(
                      'block text-sm transition-colors',
                      item.active
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                      item.level === 2 && 'font-medium',
                      item.level === 3 && 'pl-3'
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </AppShellAside>
      )}
    </AppShell>
  );
}

// ============================================================================
// MINIMAL SHELL - Clean minimal shell
// ============================================================================
export function MinimalShell({
  children,
  header,
  footer,
  maxWidth = '7xl',
  className,
  ...props
}) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn('min-h-screen flex flex-col bg-white dark:bg-gray-900', className)} {...props}>
      {header && (
        <header className="border-b border-gray-200 dark:border-gray-700">
          <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidthClasses[maxWidth])}>
            {header}
          </div>
        </header>
      )}

      <main className="flex-1">
        <div className={cn('mx-auto px-4 sm:px-6 lg:px-8 py-8', maxWidthClasses[maxWidth])}>
          {children}
        </div>
      </main>

      {footer && (
        <footer className="border-t border-gray-200 dark:border-gray-700">
          <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidthClasses[maxWidth])}>
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
}

export default AppShell;
