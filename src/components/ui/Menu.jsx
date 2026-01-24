import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { cn } from '../../lib/utils';
import {
  ChevronDown,
  ChevronRight,
  MoreVertical,
  MoreHorizontal,
  Check,
  Circle
} from 'lucide-react';

/**
 * Batch 90: Menu Component
 *
 * Dropdown menu components for actions and navigation.
 *
 * Exports:
 * - Menu: Basic dropdown menu
 * - MenuItem: Menu item component
 * - MenuDivider: Menu separator
 * - MenuHeader: Menu section header
 * - ContextMenu: Right-click context menu
 * - ActionMenu: Icon button with menu
 * - SelectMenu: Single selection menu
 * - MultiSelectMenu: Multiple selection menu
 * - NestedMenu: Menu with submenus
 * - CommandMenu: Command palette style menu
 * - MegaMenu: Large multi-column menu
 */

// ============================================================================
// MENU - Basic dropdown menu
// ============================================================================
export function Menu({
  trigger,
  children,
  align = 'left',
  width = 'auto',
  className,
  ...props
}) {
  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  const widthClasses = {
    auto: 'min-w-[200px]',
    sm: 'w-48',
    md: 'w-56',
    lg: 'w-64',
    xl: 'w-80',
    full: 'w-full',
  };

  return (
    <HeadlessMenu as="div" className="relative inline-block text-left" {...props}>
      <HeadlessMenu.Button as={Fragment}>
        {trigger}
      </HeadlessMenu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <HeadlessMenu.Items
          className={cn(
            'absolute z-50 mt-2',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'rounded-lg shadow-lg',
            'py-1',
            'focus:outline-none',
            alignClasses[align],
            widthClasses[width],
            className
          )}
        >
          {children}
        </HeadlessMenu.Items>
      </Transition>
    </HeadlessMenu>
  );
}

// ============================================================================
// MENU ITEM - Menu item component
// ============================================================================
export function MenuItem({
  children,
  icon: Icon,
  shortcut,
  danger = false,
  disabled = false,
  onClick,
  className,
  ...props
}) {
  return (
    <HeadlessMenu.Item disabled={disabled}>
      {({ active }) => (
        <button
          onClick={onClick}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-2 text-sm text-left',
            active && !danger && 'bg-gray-100 dark:bg-gray-700',
            active && danger && 'bg-red-50 dark:bg-red-900/20',
            danger && 'text-red-600 dark:text-red-400',
            !danger && 'text-gray-700 dark:text-gray-200',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...props}
        >
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1">{children}</span>
          {shortcut && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {shortcut}
            </span>
          )}
        </button>
      )}
    </HeadlessMenu.Item>
  );
}

// ============================================================================
// MENU DIVIDER - Menu separator
// ============================================================================
export function MenuDivider({ className }) {
  return (
    <div
      className={cn(
        'h-px my-1 bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  );
}

// ============================================================================
// MENU HEADER - Menu section header
// ============================================================================
export function MenuHeader({ children, className }) {
  return (
    <div
      className={cn(
        'px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// CONTEXT MENU - Right-click context menu
// ============================================================================
export function ContextMenu({
  children,
  items,
  onSelect,
  disabled = false,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  const handleContextMenu = (e) => {
    if (disabled) return;
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY;

    // Adjust position if menu would go off screen
    const menuWidth = 200;
    const menuHeight = items.length * 40;

    setPosition({
      x: x + menuWidth > window.innerWidth ? x - menuWidth : x,
      y: y + menuHeight > window.innerHeight ? y - menuHeight : y,
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        handleClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {children}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[200px]"
          style={{ top: position.y, left: position.x }}
        >
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return <MenuDivider key={index} />;
            }

            if (item.type === 'header') {
              return <MenuHeader key={index}>{item.label}</MenuHeader>;
            }

            return (
              <button
                key={index}
                onClick={() => {
                  if (!item.disabled) {
                    onSelect?.(item);
                    handleClose();
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
                {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

// ============================================================================
// ACTION MENU - Icon button with menu
// ============================================================================
export function ActionMenu({
  items,
  onSelect,
  variant = 'vertical',
  size = 'md',
  className,
  ...props
}) {
  const Icon = variant === 'vertical' ? MoreVertical : MoreHorizontal;

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <Menu
      trigger={
        <button
          className={cn(
            'rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            sizeClasses[size],
            className
          )}
        >
          <Icon className={iconSizeClasses[size]} />
        </button>
      }
      align="right"
      {...props}
    >
      {items.map((item, index) => {
        if (item.type === 'divider') {
          return <MenuDivider key={index} />;
        }

        if (item.type === 'header') {
          return <MenuHeader key={index}>{item.label}</MenuHeader>;
        }

        return (
          <MenuItem
            key={index}
            icon={item.icon}
            shortcut={item.shortcut}
            danger={item.danger}
            disabled={item.disabled}
            onClick={() => onSelect?.(item)}
          >
            {item.label}
          </MenuItem>
        );
      })}
    </Menu>
  );
}

// ============================================================================
// SELECT MENU - Single selection menu
// ============================================================================
export function SelectMenu({
  value,
  options,
  onChange,
  placeholder = 'Select option',
  disabled = false,
  className,
  ...props
}) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Menu
      trigger={
        <button
          disabled={disabled}
          className={cn(
            'flex items-center justify-between gap-2 w-full px-4 py-2',
            'bg-white dark:bg-gray-800',
            'border border-gray-300 dark:border-gray-600',
            'rounded-lg text-sm',
            'hover:bg-gray-50 dark:hover:bg-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <span className={cn(!selectedOption && 'text-gray-400')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      }
      width="full"
      {...props}
    >
      {options.map((option) => (
        <HeadlessMenu.Item key={option.value} disabled={option.disabled}>
          {({ active }) => (
            <button
              onClick={() => onChange?.(option.value)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2 text-sm text-left',
                active && 'bg-gray-100 dark:bg-gray-700',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className="flex-1">{option.label}</span>
              {value === option.value && (
                <Check className="w-4 h-4 text-blue-500" />
              )}
            </button>
          )}
        </HeadlessMenu.Item>
      ))}
    </Menu>
  );
}

// ============================================================================
// MULTI SELECT MENU - Multiple selection menu
// ============================================================================
export function MultiSelectMenu({
  values = [],
  options,
  onChange,
  placeholder = 'Select options',
  disabled = false,
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabels = options
    .filter((opt) => values.includes(opt.value))
    .map((opt) => opt.label);

  const toggleOption = (value) => {
    const newValues = values.includes(value)
      ? values.filter((v) => v !== value)
      : [...values, value];
    onChange?.(newValues);
  };

  return (
    <div className="relative" {...props}>
      <button
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between gap-2 w-full px-4 py-2',
          'bg-white dark:bg-gray-800',
          'border border-gray-300 dark:border-gray-600',
          'rounded-lg text-sm',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <span className={cn(selectedLabels.length === 0 && 'text-gray-400')}>
          {selectedLabels.length > 0
            ? `${selectedLabels.length} selected`
            : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                disabled={option.disabled}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm text-left',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 border-2 rounded flex items-center justify-center',
                    values.includes(option.value)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  {values.includes(option.value) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// NESTED MENU - Menu with submenus
// ============================================================================
export function NestedMenu({
  trigger,
  items,
  onSelect,
  align = 'left',
  className,
  ...props
}) {
  return (
    <Menu trigger={trigger} align={align} className={className} {...props}>
      {items.map((item, index) => {
        if (item.type === 'divider') {
          return <MenuDivider key={index} />;
        }

        if (item.type === 'header') {
          return <MenuHeader key={index}>{item.label}</MenuHeader>;
        }

        if (item.children) {
          return (
            <NestedMenuItem
              key={index}
              item={item}
              onSelect={onSelect}
            />
          );
        }

        return (
          <MenuItem
            key={index}
            icon={item.icon}
            shortcut={item.shortcut}
            danger={item.danger}
            disabled={item.disabled}
            onClick={() => onSelect?.(item)}
          >
            {item.label}
          </MenuItem>
        );
      })}
    </Menu>
  );
}

function NestedMenuItem({ item, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2 text-sm text-left',
          'text-gray-700 dark:text-gray-200',
          'hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
      >
        {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
        <span className="flex-1">{item.label}</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute left-full top-0 ml-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]">
          {item.children.map((child, childIndex) => {
            if (child.type === 'divider') {
              return <MenuDivider key={childIndex} />;
            }

            return (
              <button
                key={childIndex}
                onClick={() => !child.disabled && onSelect?.(child)}
                disabled={child.disabled}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-sm text-left',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  child.danger && 'text-red-600 dark:text-red-400',
                  !child.danger && 'text-gray-700 dark:text-gray-200',
                  child.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {child.icon && <child.icon className="w-4 h-4 flex-shrink-0" />}
                <span className="flex-1">{child.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// RADIO MENU - Radio selection menu
// ============================================================================
export function RadioMenu({
  value,
  options,
  onChange,
  label,
  className,
  ...props
}) {
  return (
    <Menu
      trigger={
        <button
          className={cn(
            'flex items-center gap-2 px-4 py-2',
            'text-sm text-gray-700 dark:text-gray-200',
            'bg-white dark:bg-gray-800',
            'border border-gray-300 dark:border-gray-600',
            'rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700',
            className
          )}
        >
          <span>{label || options.find((o) => o.value === value)?.label}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      }
      {...props}
    >
      {options.map((option) => (
        <HeadlessMenu.Item key={option.value}>
          {({ active }) => (
            <button
              onClick={() => onChange?.(option.value)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2 text-sm text-left',
                active && 'bg-gray-100 dark:bg-gray-700'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                  value === option.value
                    ? 'border-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                )}
              >
                {value === option.value && (
                  <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
                )}
              </div>
              <span>{option.label}</span>
            </button>
          )}
        </HeadlessMenu.Item>
      ))}
    </Menu>
  );
}

// ============================================================================
// DROPDOWN BUTTON - Button with dropdown menu
// ============================================================================
export function DropdownButton({
  label,
  items,
  onSelect,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
    outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <Menu
      trigger={
        <button
          className={cn(
            'inline-flex items-center gap-2 rounded-lg font-medium',
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
        >
          {label}
          <ChevronDown className="w-4 h-4" />
        </button>
      }
      {...props}
    >
      {items.map((item, index) => {
        if (item.type === 'divider') {
          return <MenuDivider key={index} />;
        }

        return (
          <MenuItem
            key={index}
            icon={item.icon}
            danger={item.danger}
            disabled={item.disabled}
            onClick={() => onSelect?.(item)}
          >
            {item.label}
          </MenuItem>
        );
      })}
    </Menu>
  );
}

// ============================================================================
// SPLIT BUTTON MENU - Button with separate dropdown
// ============================================================================
export function SplitButtonMenu({
  label,
  onClick,
  items,
  onSelect,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  const paddingClasses = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5',
  };

  return (
    <div className={cn('inline-flex rounded-lg', className)} {...props}>
      <button
        onClick={onClick}
        className={cn(
          'rounded-l-lg font-medium',
          variantClasses[variant],
          sizeClasses[size],
          paddingClasses[size]
        )}
      >
        {label}
      </button>
      <Menu
        trigger={
          <button
            className={cn(
              'rounded-r-lg border-l border-white/20 px-2',
              variantClasses[variant],
              sizeClasses[size]
            )}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        }
        align="right"
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            icon={item.icon}
            onClick={() => onSelect?.(item)}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

export default Menu;
