import React, { Fragment, useState, useRef, useEffect, useCallback } from 'react';
import { Popover as HeadlessPopover, Transition } from '@headlessui/react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { X, ChevronDown, Info, HelpCircle, Settings, Bell } from 'lucide-react';

/**
 * Batch 92: Popover Component
 *
 * Popover components for displaying floating content.
 *
 * Exports:
 * - Popover: Basic popover with Headless UI
 * - SimplePopover: Lightweight controlled popover
 * - HoverPopover: Popover on hover
 * - ClickPopover: Popover on click
 * - ConfirmPopover: Popover with confirmation
 * - PopoverCard: Card-style popover
 * - PopoverMenu: Menu-style popover
 * - PopoverForm: Form in popover
 * - NotificationPopover: Notifications dropdown
 * - UserPopover: User profile dropdown
 * - InfoPopover: Information popover
 */

// ============================================================================
// POPOVER - Basic popover with Headless UI
// ============================================================================
export function Popover({
  trigger,
  children,
  position = 'bottom',
  align = 'center',
  offset = 8,
  className,
  panelClassName,
  ...props
}) {
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const alignClasses = {
    start: position === 'top' || position === 'bottom' ? 'left-0' : 'top-0',
    center: position === 'top' || position === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
    end: position === 'top' || position === 'bottom' ? 'right-0' : 'bottom-0',
  };

  return (
    <HeadlessPopover className={cn('relative', className)} {...props}>
      <HeadlessPopover.Button as={Fragment}>
        {trigger}
      </HeadlessPopover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <HeadlessPopover.Panel
          className={cn(
            'absolute z-50',
            positionClasses[position],
            alignClasses[align],
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'rounded-lg shadow-lg',
            panelClassName
          )}
        >
          {children}
        </HeadlessPopover.Panel>
      </Transition>
    </HeadlessPopover>
  );
}

// ============================================================================
// SIMPLE POPOVER - Lightweight controlled popover
// ============================================================================
export function SimplePopover({
  trigger,
  children,
  isOpen,
  onOpenChange,
  position = 'bottom',
  align = 'center',
  closeOnClickOutside = true,
  closeOnEscape = true,
  className,
  ...props
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const containerRef = useRef(null);

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    if (!closeOnClickOutside || !open) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, closeOnClickOutside, setOpen]);

  useEffect(() => {
    if (!closeOnEscape || !open) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, setOpen]);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const alignClasses = {
    start: position === 'top' || position === 'bottom' ? 'left-0' : 'top-0',
    center: position === 'top' || position === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
    end: position === 'top' || position === 'bottom' ? 'right-0' : 'bottom-0',
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)} {...props}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            'absolute z-50',
            positionClasses[position],
            alignClasses[align],
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HOVER POPOVER - Popover on hover
// ============================================================================
export function HoverPopover({
  trigger,
  children,
  position = 'top',
  align = 'center',
  delay = 200,
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const alignClasses = {
    start: position === 'top' || position === 'bottom' ? 'left-0' : 'top-0',
    center: position === 'top' || position === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
    end: position === 'top' || position === 'bottom' ? 'right-0' : 'bottom-0',
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {trigger}

      {isOpen && (
        <div
          className={cn(
            'absolute z-50',
            positionClasses[position],
            alignClasses[align],
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'rounded-lg shadow-lg p-4',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CLICK POPOVER - Popover on click
// ============================================================================
export function ClickPopover({
  trigger,
  children,
  position = 'bottom',
  align = 'start',
  className,
  ...props
}) {
  return (
    <SimplePopover
      trigger={trigger}
      position={position}
      align={align}
      className={className}
      {...props}
    >
      {children}
    </SimplePopover>
  );
}

// ============================================================================
// CONFIRM POPOVER - Popover with confirmation
// ============================================================================
export function ConfirmPopover({
  trigger,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  position = 'bottom',
  className,
  ...props
}) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
  };

  return (
    <SimplePopover
      trigger={trigger}
      position={position}
      className={className}
      {...props}
    >
      {({ close }) => (
        <div className="p-4 w-64">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                onCancel?.();
                close();
              }}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm?.();
                close();
              }}
              className={cn(
                'flex-1 px-3 py-2 text-sm rounded-lg text-white',
                variantClasses[variant]
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </SimplePopover>
  );
}

// ============================================================================
// POPOVER CARD - Card-style popover
// ============================================================================
export function PopoverCard({
  trigger,
  title,
  subtitle,
  image,
  children,
  footer,
  width = 320,
  position = 'bottom',
  align = 'start',
  className,
  ...props
}) {
  return (
    <SimplePopover
      trigger={trigger}
      position={position}
      align={align}
      className={className}
      {...props}
    >
      <div className="overflow-hidden rounded-lg" style={{ width }}>
        {image && (
          <img
            src={image}
            alt=""
            className="w-full h-40 object-cover"
          />
        )}
        <div className="p-4">
          {title && (
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {children && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {children}
            </div>
          )}
        </div>
        {footer && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </SimplePopover>
  );
}

// ============================================================================
// POPOVER MENU - Menu-style popover
// ============================================================================
export function PopoverMenu({
  trigger,
  items,
  onSelect,
  width = 200,
  position = 'bottom',
  align = 'end',
  className,
  ...props
}) {
  return (
    <SimplePopover
      trigger={trigger}
      position={position}
      align={align}
      className={className}
      {...props}
    >
      {({ close }) => (
        <div className="py-1" style={{ width }}>
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={index}
                  className="h-px my-1 bg-gray-200 dark:bg-gray-700"
                />
              );
            }

            if (item.type === 'header') {
              return (
                <div
                  key={index}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase"
                >
                  {item.label}
                </div>
              );
            }

            return (
              <button
                key={index}
                onClick={() => {
                  if (!item.disabled) {
                    onSelect?.(item);
                    close();
                  }
                }}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm text-left',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  item.danger && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
                  !item.danger && 'text-gray-700 dark:text-gray-200',
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </SimplePopover>
  );
}

// ============================================================================
// POPOVER FORM - Form in popover
// ============================================================================
export function PopoverForm({
  trigger,
  title,
  children,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onSubmit,
  width = 320,
  position = 'bottom',
  className,
  ...props
}) {
  return (
    <SimplePopover
      trigger={trigger}
      position={position}
      className={className}
      {...props}
    >
      {({ close }) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            onSubmit?.(data);
            close();
          }}
          className="p-4"
          style={{ width }}
        >
          {title && (
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">
              {title}
            </h3>
          )}
          <div className="space-y-4">
            {children}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={close}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      )}
    </SimplePopover>
  );
}

// ============================================================================
// NOTIFICATION POPOVER - Notifications dropdown
// ============================================================================
export function NotificationPopover({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllRead,
  onNotificationClick,
  emptyMessage = 'No notifications',
  className,
  ...props
}) {
  return (
    <SimplePopover
      trigger={
        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      }
      position="bottom"
      align="end"
      className={className}
      {...props}
    >
      {({ close }) => (
        <div className="w-80">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => onMarkAllRead?.()}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    onNotificationClick?.(notification);
                    if (!notification.read) {
                      onMarkAsRead?.(notification.id);
                    }
                  }}
                  className={cn(
                    'px-4 py-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer',
                    'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {notification.avatar ? (
                      <img
                        src={notification.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      {notification.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {notification.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={close}
              className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </SimplePopover>
  );
}

// ============================================================================
// USER POPOVER - User profile dropdown
// ============================================================================
export function UserPopover({
  user,
  menuItems = [],
  onMenuSelect,
  onSignOut,
  className,
  ...props
}) {
  const defaultItems = [
    { label: 'Profile', icon: null },
    { label: 'Settings', icon: Settings },
    { type: 'divider' },
    { label: 'Sign out', danger: true },
  ];

  const items = menuItems.length > 0 ? menuItems : defaultItems;

  return (
    <SimplePopover
      trigger={
        <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
              {user?.name?.[0] || 'U'}
            </div>
          )}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      }
      position="bottom"
      align="end"
      className={className}
      {...props}
    >
      {({ close }) => (
        <div className="w-64">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.name || 'User'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.email || ''}
            </p>
          </div>

          <div className="py-1">
            {items.map((item, index) => {
              if (item.type === 'divider') {
                return (
                  <div
                    key={index}
                    className="h-px my-1 bg-gray-200 dark:bg-gray-700"
                  />
                );
              }

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (item.label === 'Sign out') {
                      onSignOut?.();
                    } else {
                      onMenuSelect?.(item);
                    }
                    close();
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 text-sm text-left',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    item.danger && 'text-red-600 dark:text-red-400'
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </SimplePopover>
  );
}

// ============================================================================
// INFO POPOVER - Information popover
// ============================================================================
export function InfoPopover({
  title,
  children,
  icon: Icon = Info,
  iconClassName,
  position = 'top',
  className,
  ...props
}) {
  return (
    <HoverPopover
      trigger={
        <Icon
          className={cn(
            'w-4 h-4 text-gray-400 cursor-help inline-block',
            iconClassName
          )}
        />
      }
      position={position}
      className={className}
      {...props}
    >
      <div className="max-w-xs">
        {title && (
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {title}
          </h4>
        )}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {children}
        </div>
      </div>
    </HoverPopover>
  );
}

// ============================================================================
// HELP POPOVER - Help text popover
// ============================================================================
export function HelpPopover({
  children,
  position = 'top',
  className,
  ...props
}) {
  return (
    <InfoPopover
      icon={HelpCircle}
      position={position}
      className={className}
      {...props}
    >
      {children}
    </InfoPopover>
  );
}

// ============================================================================
// PORTAL POPOVER - Renders in portal for overflow handling
// ============================================================================
export function PortalPopover({
  trigger,
  children,
  isOpen,
  onOpenChange,
  position = 'bottom',
  offset = 8,
  className,
  ...props
}) {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - popoverRect.height - offset;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.left - popoverRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.right + offset;
        break;
    }

    // Keep within viewport
    left = Math.max(8, Math.min(left, window.innerWidth - popoverRect.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - popoverRect.height - 8));

    setCoords({ top, left });
  }, [position, offset]);

  useEffect(() => {
    if (open) {
      calculatePosition();
    }
  }, [open, calculatePosition]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        open &&
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        popoverRef.current && !popoverRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setOpen]);

  return (
    <>
      <div
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className={cn('inline-block cursor-pointer', className)}
        {...props}
      >
        {trigger}
      </div>

      {open && createPortal(
        <div
          ref={popoverRef}
          className={cn(
            'fixed z-[9999]',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
          style={{ top: coords.top, left: coords.left }}
        >
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>,
        document.body
      )}
    </>
  );
}

export default Popover;
