import React, { Fragment, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { cn } from '../../lib/utils';
import { X, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

/**
 * Batch 93: Drawer Component
 *
 * Slide-out panel components for side content.
 *
 * Exports:
 * - Drawer: Basic drawer/sheet component
 * - DrawerHeader: Drawer header with title
 * - DrawerBody: Scrollable drawer content
 * - DrawerFooter: Fixed footer with actions
 * - SideDrawer: Navigation drawer
 * - FormDrawer: Drawer with form
 * - DetailDrawer: Detail view drawer
 * - FilterDrawer: Filter panel drawer
 * - ConfirmDrawer: Drawer with confirmation
 * - NestedDrawer: Drawer with nested panels
 * - MobileDrawer: Mobile-optimized drawer
 */

// ============================================================================
// DRAWER - Basic drawer/sheet component
// ============================================================================
export function Drawer({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'md',
  overlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  ...props
}) {
  const positionClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  };

  const sizeClasses = {
    left: {
      xs: 'w-64',
      sm: 'w-80',
      md: 'w-96',
      lg: 'w-[480px]',
      xl: 'w-[600px]',
      full: 'w-full',
    },
    right: {
      xs: 'w-64',
      sm: 'w-80',
      md: 'w-96',
      lg: 'w-[480px]',
      xl: 'w-[600px]',
      full: 'w-full',
    },
    top: {
      xs: 'h-32',
      sm: 'h-48',
      md: 'h-64',
      lg: 'h-96',
      xl: 'h-[480px]',
      full: 'h-full',
    },
    bottom: {
      xs: 'h-32',
      sm: 'h-48',
      md: 'h-64',
      lg: 'h-96',
      xl: 'h-[480px]',
      full: 'h-full',
    },
  };

  const slideClasses = {
    left: {
      from: '-translate-x-full',
      to: 'translate-x-0',
    },
    right: {
      from: 'translate-x-full',
      to: 'translate-x-0',
    },
    top: {
      from: '-translate-y-full',
      to: 'translate-y-0',
    },
    bottom: {
      from: 'translate-y-full',
      to: 'translate-y-0',
    },
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnEscape ? onClose : () => {}}
        {...props}
      >
        {overlay && (
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeOnOverlayClick ? onClose : undefined}
            />
          </Transition.Child>
        )}

        <div className="fixed inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom={slideClasses[position].from}
            enterTo={slideClasses[position].to}
            leave="transform transition ease-in-out duration-300"
            leaveFrom={slideClasses[position].to}
            leaveTo={slideClasses[position].from}
          >
            <Dialog.Panel
              className={cn(
                'fixed',
                positionClasses[position],
                sizeClasses[position][size],
                'bg-white dark:bg-gray-900',
                'shadow-xl',
                'flex flex-col',
                className
              )}
            >
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    'absolute z-10 p-2 rounded-lg',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'text-gray-500 dark:text-gray-400',
                    position === 'left' ? 'right-4 top-4' : 'left-4 top-4'
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

// ============================================================================
// DRAWER HEADER - Drawer header with title
// ============================================================================
export function DrawerHeader({
  title,
  subtitle,
  icon: Icon,
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-gray-200 dark:border-gray-700',
        'flex-shrink-0',
        className
      )}
      {...props}
    >
      {children || (
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          )}
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DRAWER BODY - Scrollable drawer content
// ============================================================================
export function DrawerBody({
  children,
  padding = true,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// DRAWER FOOTER - Fixed footer with actions
// ============================================================================
export function DrawerFooter({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-gray-200 dark:border-gray-700',
        'bg-gray-50 dark:bg-gray-800/50',
        'flex-shrink-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// SIDE DRAWER - Navigation drawer
// ============================================================================
export function SideDrawer({
  isOpen,
  onClose,
  logo,
  title,
  navigation = [],
  activeItem,
  onNavigate,
  footer,
  position = 'left',
  className,
  ...props
}) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      size="sm"
      className={className}
      {...props}
    >
      <DrawerHeader>
        <div className="flex items-center gap-3">
          {logo && (
            <img src={logo} alt="" className="w-8 h-8" />
          )}
          {title && (
            <span className="font-semibold text-gray-900 dark:text-white">
              {title}
            </span>
          )}
        </div>
      </DrawerHeader>

      <DrawerBody padding={false}>
        <nav className="py-2">
          {navigation.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={index}
                  className="h-px my-2 mx-4 bg-gray-200 dark:bg-gray-700"
                />
              );
            }

            if (item.type === 'header') {
              return (
                <div
                  key={index}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {item.label}
                </div>
              );
            }

            const isActive = activeItem === item.id || activeItem === item.href;

            return (
              <button
                key={index}
                onClick={() => {
                  onNavigate?.(item);
                  onClose();
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left',
                  'transition-colors',
                  isActive && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600',
                  !isActive && 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </DrawerBody>

      {footer && (
        <DrawerFooter>
          {footer}
        </DrawerFooter>
      )}
    </Drawer>
  );
}

// ============================================================================
// FORM DRAWER - Drawer with form
// ============================================================================
export function FormDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onSubmit,
  isLoading = false,
  position = 'right',
  size = 'md',
  className,
  ...props
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    onSubmit?.(data);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      size={size}
      className={className}
      {...props}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <DrawerHeader title={title} subtitle={subtitle} />

        <DrawerBody>
          {children}
        </DrawerBody>

        <DrawerFooter>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg',
                'bg-blue-600 hover:bg-blue-700 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? 'Saving...' : submitLabel}
            </button>
          </div>
        </DrawerFooter>
      </form>
    </Drawer>
  );
}

// ============================================================================
// DETAIL DRAWER - Detail view drawer
// ============================================================================
export function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  image,
  sections = [],
  actions,
  position = 'right',
  size = 'lg',
  className,
  ...props
}) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      size={size}
      className={className}
      {...props}
    >
      <DrawerHeader>
        <div className="flex items-start gap-4">
          {image && (
            <img
              src={image}
              alt=""
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </DrawerHeader>

      <DrawerBody>
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index}>
              {section.title && (
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  {section.title}
                </h3>
              )}
              {section.content}
            </div>
          ))}
        </div>
      </DrawerBody>

      {actions && (
        <DrawerFooter>
          <div className="flex gap-3 justify-end">
            {actions}
          </div>
        </DrawerFooter>
      )}
    </Drawer>
  );
}

// ============================================================================
// FILTER DRAWER - Filter panel drawer
// ============================================================================
export function FilterDrawer({
  isOpen,
  onClose,
  title = 'Filters',
  filters = [],
  values = {},
  onChange,
  onApply,
  onReset,
  position = 'right',
  size = 'sm',
  className,
  ...props
}) {
  const activeFilterCount = Object.values(values).filter(v => v !== undefined && v !== '' && v !== null).length;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      size={size}
      className={className}
      {...props}
    >
      <DrawerHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            {activeFilterCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </p>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      </DrawerHeader>

      <DrawerBody>
        <div className="space-y-6">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {filter.label}
              </label>
              {filter.render ? (
                filter.render({
                  value: values[filter.key],
                  onChange: (value) => onChange?.({ ...values, [filter.key]: value }),
                })
              ) : (
                <input
                  type={filter.type || 'text'}
                  value={values[filter.key] || ''}
                  onChange={(e) => onChange?.({ ...values, [filter.key]: e.target.value })}
                  placeholder={filter.placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              )}
            </div>
          ))}
        </div>
      </DrawerBody>

      <DrawerFooter>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApply?.(values);
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Apply Filters
          </button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}

// ============================================================================
// CONFIRM DRAWER - Drawer with confirmation
// ============================================================================
export function ConfirmDrawer({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'danger',
  icon: Icon,
  isLoading = false,
  position = 'bottom',
  className,
  ...props
}) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
  };

  const iconBgClasses = {
    primary: 'bg-blue-100 dark:bg-blue-900/50',
    danger: 'bg-red-100 dark:bg-red-900/50',
    warning: 'bg-yellow-100 dark:bg-yellow-900/50',
  };

  const iconColorClasses = {
    primary: 'text-blue-600 dark:text-blue-400',
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      size="xs"
      showCloseButton={false}
      className={className}
      {...props}
    >
      <div className="p-6 text-center">
        {Icon && (
          <div
            className={cn(
              'w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center',
              iconBgClasses[variant]
            )}
          >
            <Icon className={cn('w-6 h-6', iconColorClasses[variant])} />
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {description}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm?.();
            }}
            disabled={isLoading}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white',
              variantClasses[variant],
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Drawer>
  );
}

// ============================================================================
// NESTED DRAWER - Drawer with nested panels
// ============================================================================
export function NestedDrawer({
  isOpen,
  onClose,
  panels = [],
  currentPanel = 0,
  onPanelChange,
  position = 'right',
  size = 'md',
  className,
  ...props
}) {
  const canGoBack = currentPanel > 0;
  const panel = panels[currentPanel];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      size={size}
      showCloseButton={false}
      className={className}
      {...props}
    >
      <DrawerHeader>
        <div className="flex items-center gap-3">
          {canGoBack && (
            <button
              onClick={() => onPanelChange?.(currentPanel - 1)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {panel?.title}
            </h2>
            {panel?.subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {panel.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </DrawerHeader>

      <DrawerBody>
        {panel?.content}
      </DrawerBody>

      {panel?.footer && (
        <DrawerFooter>
          {panel.footer}
        </DrawerFooter>
      )}
    </Drawer>
  );
}

// ============================================================================
// MOBILE DRAWER - Mobile-optimized drawer
// ============================================================================
export function MobileDrawer({
  isOpen,
  onClose,
  children,
  handleBar = true,
  maxHeight = '90vh',
  className,
  ...props
}) {
  const startY = useRef(0);
  const currentY = useRef(0);
  const drawerRef = useRef(null);

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0 && drawerRef.current) {
      drawerRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;

    if (diff > 100) {
      onClose();
    }

    if (drawerRef.current) {
      drawerRef.current.style.transform = '';
    }

    startY.current = 0;
    currentY.current = 0;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose} {...props}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel
              ref={drawerRef}
              className={cn(
                'fixed bottom-0 left-0 w-full',
                'bg-white dark:bg-gray-900',
                'rounded-t-2xl shadow-xl',
                'flex flex-col',
                className
              )}
              style={{ maxHeight }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {handleBar && (
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
              )}
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

// ============================================================================
// DRAWER TRIGGER - Button to open drawer
// ============================================================================
export function DrawerTrigger({
  onClick,
  icon: Icon = Menu,
  label,
  variant = 'ghost',
  className,
  ...props
}) {
  const variantClasses = {
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
    solid: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg transition-colors',
        'text-gray-600 dark:text-gray-300',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <Icon className="w-5 h-5" />
      {label && <span className="ml-2">{label}</span>}
    </button>
  );
}

export default Drawer;
