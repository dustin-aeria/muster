import React, { useState, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { Menu, X, ChevronDown, Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';

/**
 * Batch 105: Navbar/Navigation Bar Component
 *
 * Navigation bar and top bar components.
 *
 * Exports:
 * - Navbar: Main navigation bar
 * - NavbarBrand: Brand/logo section
 * - NavbarContent: Main content area
 * - NavbarItem: Navigation item
 * - NavbarLink: Navigation link
 * - NavbarMenu: Collapsible mobile menu
 * - NavbarMenuToggle: Mobile menu toggle
 * - NavbarDropdown: Dropdown menu in navbar
 * - TopBar: Application top bar
 * - AppNavbar: Full application navbar with user menu
 * - BreadcrumbNavbar: Navbar with breadcrumbs
 */

const NavbarContext = createContext({});

// ============================================================================
// NAVBAR - Main navigation bar
// ============================================================================
export function Navbar({
  children,
  variant = 'default',
  position = 'static',
  blur = false,
  bordered = false,
  className,
  ...props
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const variantClasses = {
    default: 'bg-white dark:bg-gray-900',
    transparent: 'bg-transparent',
    colored: 'bg-blue-600 text-white',
    dark: 'bg-gray-900 text-white',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
  };

  const positionClasses = {
    static: 'static',
    sticky: 'sticky top-0 z-50',
    fixed: 'fixed top-0 left-0 right-0 z-50',
  };

  return (
    <NavbarContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      <nav
        className={cn(
          'w-full px-4 lg:px-6',
          variantClasses[variant],
          positionClasses[position],
          blur && 'backdrop-blur-md bg-opacity-80',
          bordered && 'border-b border-gray-200 dark:border-gray-700',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
          {children}
        </div>
      </nav>
    </NavbarContext.Provider>
  );
}

// ============================================================================
// NAVBAR BRAND - Brand/logo section
// ============================================================================
export function NavbarBrand({
  children,
  href,
  className,
  ...props
}) {
  const Component = href ? 'a' : 'div';

  return (
    <Component
      href={href}
      className={cn(
        'flex items-center gap-2 font-bold text-xl',
        href && 'hover:opacity-80 transition-opacity',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// ============================================================================
// NAVBAR CONTENT - Main content area
// ============================================================================
export function NavbarContent({
  children,
  justify = 'start',
  className,
  ...props
}) {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  return (
    <div
      className={cn(
        'hidden md:flex items-center gap-4',
        justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// NAVBAR ITEM - Navigation item
// ============================================================================
export function NavbarItem({
  children,
  active = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'relative',
        active && 'text-blue-600 dark:text-blue-400',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// NAVBAR LINK - Navigation link
// ============================================================================
export function NavbarLink({
  children,
  href,
  active = false,
  className,
  ...props
}) {
  return (
    <a
      href={href}
      className={cn(
        'px-3 py-2 text-sm font-medium rounded-md transition-colors',
        active
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

// ============================================================================
// NAVBAR MENU - Collapsible mobile menu
// ============================================================================
export function NavbarMenu({
  children,
  className,
  ...props
}) {
  const { isMenuOpen } = useContext(NavbarContext);

  if (!isMenuOpen) return null;

  return (
    <div
      className={cn(
        'md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg',
        className
      )}
      {...props}
    >
      <div className="px-4 py-3 space-y-1">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// NAVBAR MENU TOGGLE - Mobile menu toggle
// ============================================================================
export function NavbarMenuToggle({
  className,
  ...props
}) {
  const { isMenuOpen, setIsMenuOpen } = useContext(NavbarContext);

  return (
    <button
      type="button"
      className={cn(
        'md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
        className
      )}
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      aria-expanded={isMenuOpen}
      aria-label="Toggle navigation menu"
      {...props}
    >
      {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
}

// ============================================================================
// NAVBAR DROPDOWN - Dropdown menu in navbar
// ============================================================================
export function NavbarDropdown({
  trigger,
  children,
  align = 'left',
  className,
  ...props
}) {
  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <HeadlessMenu as="div" className={cn('relative', className)} {...props}>
      <HeadlessMenu.Button as={React.Fragment}>
        {trigger}
      </HeadlessMenu.Button>

      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <HeadlessMenu.Items
          className={cn(
            'absolute mt-2 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50',
            alignClasses[align]
          )}
        >
          <div className="py-1">
            {children}
          </div>
        </HeadlessMenu.Items>
      </Transition>
    </HeadlessMenu>
  );
}

// ============================================================================
// NAVBAR DROPDOWN ITEM
// ============================================================================
export function NavbarDropdownItem({
  children,
  icon: Icon,
  href,
  onClick,
  danger = false,
  className,
  ...props
}) {
  return (
    <HeadlessMenu.Item>
      {({ active }) => (
        <a
          href={href}
          onClick={onClick}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm',
            active && 'bg-gray-100 dark:bg-gray-700',
            danger
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-700 dark:text-gray-300',
            className
          )}
          {...props}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </a>
      )}
    </HeadlessMenu.Item>
  );
}

// ============================================================================
// TOP BAR - Application top bar
// ============================================================================
export function TopBar({
  children,
  leftContent,
  rightContent,
  className,
  ...props
}) {
  return (
    <header
      className={cn(
        'h-14 px-4 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {leftContent}
      </div>
      {children}
      <div className="flex items-center gap-4">
        {rightContent}
      </div>
    </header>
  );
}

// ============================================================================
// APP NAVBAR - Full application navbar with user menu
// ============================================================================
export function AppNavbar({
  brand,
  brandHref = '/',
  links = [],
  user,
  onLogout,
  showSearch = false,
  onSearch,
  notifications = [],
  className,
  ...props
}) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Navbar variant="default" bordered className={className} {...props}>
      <div className="flex items-center gap-6">
        <NavbarBrand href={brandHref}>
          {brand}
        </NavbarBrand>

        <NavbarContent>
          {links.map((link, index) => (
            <NavbarLink
              key={index}
              href={link.href}
              active={link.active}
            >
              {link.label}
            </NavbarLink>
          ))}
        </NavbarContent>
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch?.(searchQuery)}
                className="pl-10 pr-4 py-2 w-64 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {notifications.length > 0 && (
          <NavbarDropdown
            trigger={
              <button className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            }
            align="right"
          >
            {notifications.map((notification, index) => (
              <NavbarDropdownItem key={index} href={notification.href}>
                {notification.message}
              </NavbarDropdownItem>
            ))}
          </NavbarDropdown>
        )}

        {user && (
          <NavbarDropdown
            trigger={
              <button className="flex items-center gap-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium">{user.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            }
            align="right"
          >
            <NavbarDropdownItem icon={User} href="/profile">
              Profile
            </NavbarDropdownItem>
            <NavbarDropdownItem icon={Settings} href="/settings">
              Settings
            </NavbarDropdownItem>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <NavbarDropdownItem icon={LogOut} onClick={onLogout} danger>
              Sign out
            </NavbarDropdownItem>
          </NavbarDropdown>
        )}

        <NavbarMenuToggle />
      </div>

      <NavbarMenu>
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className={cn(
              'block px-3 py-2 rounded-md text-base font-medium',
              link.active
                ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {link.label}
          </a>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}

// ============================================================================
// BREADCRUMB NAVBAR - Navbar with breadcrumbs
// ============================================================================
export function BreadcrumbNavbar({
  brand,
  brandHref = '/',
  breadcrumbs = [],
  actions,
  className,
  ...props
}) {
  return (
    <Navbar variant="default" bordered className={className} {...props}>
      <div className="flex items-center gap-4">
        <NavbarBrand href={brandHref}>
          {brand}
        </NavbarBrand>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-900 dark:text-white font-medium">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}

      <NavbarMenuToggle />
    </Navbar>
  );
}

// ============================================================================
// STICKY NAVBAR - Navbar that appears on scroll
// ============================================================================
export function StickyNavbar({
  children,
  showAfter = 100,
  className,
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfter);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-transform duration-300',
        isVisible ? 'translate-y-0' : '-translate-y-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// MINIMAL NAVBAR - Clean minimal navbar
// ============================================================================
export function MinimalNavbar({
  brand,
  brandHref = '/',
  links = [],
  cta,
  className,
  ...props
}) {
  return (
    <Navbar variant="transparent" className={cn('py-4', className)} {...props}>
      <NavbarBrand href={brandHref}>
        {brand}
      </NavbarBrand>

      <NavbarContent justify="center">
        {links.map((link, index) => (
          <NavbarLink
            key={index}
            href={link.href}
            active={link.active}
          >
            {link.label}
          </NavbarLink>
        ))}
      </NavbarContent>

      <div className="flex items-center gap-4">
        {cta}
        <NavbarMenuToggle />
      </div>

      <NavbarMenu>
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className={cn(
              'block px-3 py-2 rounded-md text-base font-medium',
              link.active
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            )}
          >
            {link.label}
          </a>
        ))}
        {cta && <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">{cta}</div>}
      </NavbarMenu>
    </Navbar>
  );
}

// ============================================================================
// DASHBOARD NAVBAR - Navbar for dashboard layouts
// ============================================================================
export function DashboardNavbar({
  onMenuClick,
  title,
  user,
  onLogout,
  notifications = [],
  actions,
  className,
  ...props
}) {
  return (
    <header
      className={cn(
        'h-16 px-4 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        {notifications.length > 0 && (
          <NavbarDropdown
            trigger={
              <button className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            }
            align="right"
          >
            {notifications.map((notification, index) => (
              <NavbarDropdownItem key={index} href={notification.href}>
                {notification.message}
              </NavbarDropdownItem>
            ))}
          </NavbarDropdown>
        )}

        {user && (
          <NavbarDropdown
            trigger={
              <button className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </button>
            }
            align="right"
          >
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <NavbarDropdownItem icon={User} href="/profile">
              Profile
            </NavbarDropdownItem>
            <NavbarDropdownItem icon={Settings} href="/settings">
              Settings
            </NavbarDropdownItem>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <NavbarDropdownItem icon={LogOut} onClick={onLogout} danger>
              Sign out
            </NavbarDropdownItem>
          </NavbarDropdown>
        )}
      </div>
    </header>
  );
}

export default Navbar;
