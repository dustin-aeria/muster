import React, { forwardRef, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { Menu, Transition } from '@headlessui/react';
import {
  ChevronDown,
  MoreHorizontal,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Undo,
  Redo,
  Plus,
  Minus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  Share,
  Settings,
} from 'lucide-react';

/**
 * Batch 109: Toolbar Component
 *
 * Toolbar and action bar components.
 *
 * Exports:
 * - Toolbar: Base toolbar container
 * - ToolbarGroup: Group of toolbar items
 * - ToolbarButton: Toolbar button
 * - ToolbarToggle: Toggle button
 * - ToolbarSeparator: Visual separator
 * - ToolbarDropdown: Dropdown menu in toolbar
 * - TextEditorToolbar: Rich text editor toolbar
 * - ActionToolbar: Action toolbar with common actions
 * - FilterToolbar: Filter/search toolbar
 * - SelectionToolbar: Multi-select action toolbar
 */

const ToolbarContext = createContext({});

// ============================================================================
// TOOLBAR - Base toolbar container
// ============================================================================
export function Toolbar({
  children,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  className,
  ...props
}) {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    ghost: 'bg-transparent',
    filled: 'bg-gray-100 dark:bg-gray-800',
    floating: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700',
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  return (
    <ToolbarContext.Provider value={{ size }}>
      <div
        role="toolbar"
        className={cn(
          'rounded-lg',
          variantClasses[variant],
          sizeClasses[size],
          orientation === 'horizontal' ? 'flex items-center gap-1' : 'flex flex-col gap-1',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ToolbarContext.Provider>
  );
}

// ============================================================================
// TOOLBAR GROUP - Group of toolbar items
// ============================================================================
export function ToolbarGroup({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// TOOLBAR BUTTON - Toolbar button
// ============================================================================
export const ToolbarButton = forwardRef(function ToolbarButton({
  children,
  icon: Icon,
  active = false,
  disabled = false,
  variant = 'ghost',
  size,
  tooltip,
  className,
  ...props
}, ref) {
  const { size: contextSize } = useContext(ToolbarContext);
  const buttonSize = size || contextSize || 'md';

  const variantClasses = {
    ghost: active
      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
    outline: cn(
      'border',
      active
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
    ),
    solid: active
      ? 'bg-blue-600 text-white'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600',
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      title={tooltip}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[buttonSize],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {Icon && <Icon className={iconSizes[buttonSize]} />}
      {children}
    </button>
  );
});

// ============================================================================
// TOOLBAR TOGGLE - Toggle button
// ============================================================================
export function ToolbarToggle({
  pressed,
  onPressedChange,
  icon: Icon,
  children,
  disabled = false,
  size,
  tooltip,
  className,
  ...props
}) {
  return (
    <ToolbarButton
      icon={Icon}
      active={pressed}
      disabled={disabled}
      size={size}
      tooltip={tooltip}
      onClick={() => onPressedChange?.(!pressed)}
      aria-pressed={pressed}
      className={className}
      {...props}
    >
      {children}
    </ToolbarButton>
  );
}

// ============================================================================
// TOOLBAR SEPARATOR - Visual separator
// ============================================================================
export function ToolbarSeparator({
  orientation = 'vertical',
  className,
  ...props
}) {
  return (
    <div
      role="separator"
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        orientation === 'vertical' ? 'w-px h-6 mx-1' : 'h-px w-6 my-1',
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// TOOLBAR DROPDOWN - Dropdown menu in toolbar
// ============================================================================
export function ToolbarDropdown({
  trigger,
  children,
  align = 'start',
  className,
  ...props
}) {
  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <Menu as="div" className={cn('relative', className)} {...props}>
      <Menu.Button as={React.Fragment}>
        {trigger}
      </Menu.Button>

      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={cn(
            'absolute mt-1 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50',
            alignClasses[align]
          )}
        >
          <div className="py-1">
            {children}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// ============================================================================
// TOOLBAR DROPDOWN ITEM
// ============================================================================
export function ToolbarDropdownItem({
  children,
  icon: Icon,
  shortcut,
  disabled = false,
  danger = false,
  onClick,
  className,
  ...props
}) {
  return (
    <Menu.Item disabled={disabled}>
      {({ active }) => (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'flex items-center w-full px-3 py-2 text-sm',
            active && 'bg-gray-100 dark:bg-gray-700',
            danger
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-700 dark:text-gray-300',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          {...props}
        >
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          <span className="flex-1 text-left">{children}</span>
          {shortcut && (
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
              {shortcut}
            </span>
          )}
        </button>
      )}
    </Menu.Item>
  );
}

// ============================================================================
// TEXT EDITOR TOOLBAR - Rich text editor toolbar
// ============================================================================
export function TextEditorToolbar({
  onBold,
  onItalic,
  onUnderline,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignJustify,
  onBulletList,
  onNumberedList,
  onLink,
  onImage,
  onCode,
  onQuote,
  onUndo,
  onRedo,
  values = {},
  className,
  ...props
}) {
  return (
    <Toolbar variant="default" className={className} {...props}>
      <ToolbarGroup>
        <ToolbarButton icon={Undo} onClick={onUndo} tooltip="Undo" />
        <ToolbarButton icon={Redo} onClick={onRedo} tooltip="Redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ToolbarToggle
          icon={Bold}
          pressed={values.bold}
          onPressedChange={onBold}
          tooltip="Bold"
        />
        <ToolbarToggle
          icon={Italic}
          pressed={values.italic}
          onPressedChange={onItalic}
          tooltip="Italic"
        />
        <ToolbarToggle
          icon={Underline}
          pressed={values.underline}
          onPressedChange={onUnderline}
          tooltip="Underline"
        />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ToolbarToggle
          icon={AlignLeft}
          pressed={values.align === 'left'}
          onPressedChange={() => onAlignLeft?.()}
          tooltip="Align Left"
        />
        <ToolbarToggle
          icon={AlignCenter}
          pressed={values.align === 'center'}
          onPressedChange={() => onAlignCenter?.()}
          tooltip="Align Center"
        />
        <ToolbarToggle
          icon={AlignRight}
          pressed={values.align === 'right'}
          onPressedChange={() => onAlignRight?.()}
          tooltip="Align Right"
        />
        <ToolbarToggle
          icon={AlignJustify}
          pressed={values.align === 'justify'}
          onPressedChange={() => onAlignJustify?.()}
          tooltip="Justify"
        />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ToolbarButton icon={List} onClick={onBulletList} tooltip="Bullet List" />
        <ToolbarButton icon={ListOrdered} onClick={onNumberedList} tooltip="Numbered List" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ToolbarButton icon={Link} onClick={onLink} tooltip="Insert Link" />
        <ToolbarButton icon={Image} onClick={onImage} tooltip="Insert Image" />
        <ToolbarButton icon={Code} onClick={onCode} tooltip="Code Block" />
        <ToolbarButton icon={Quote} onClick={onQuote} tooltip="Quote" />
      </ToolbarGroup>
    </Toolbar>
  );
}

// ============================================================================
// ACTION TOOLBAR - Action toolbar with common actions
// ============================================================================
export function ActionToolbar({
  onAdd,
  onEdit,
  onDelete,
  onCopy,
  onDownload,
  onUpload,
  onShare,
  onSettings,
  onMore,
  moreActions = [],
  disabled = {},
  className,
  ...props
}) {
  return (
    <Toolbar variant="default" className={className} {...props}>
      {onAdd && (
        <ToolbarButton
          icon={Plus}
          onClick={onAdd}
          disabled={disabled.add}
          tooltip="Add"
        />
      )}
      {onEdit && (
        <ToolbarButton
          icon={Edit}
          onClick={onEdit}
          disabled={disabled.edit}
          tooltip="Edit"
        />
      )}
      {onCopy && (
        <ToolbarButton
          icon={Copy}
          onClick={onCopy}
          disabled={disabled.copy}
          tooltip="Copy"
        />
      )}

      {(onAdd || onEdit || onCopy) && (onDelete || onDownload || onUpload) && (
        <ToolbarSeparator />
      )}

      {onDownload && (
        <ToolbarButton
          icon={Download}
          onClick={onDownload}
          disabled={disabled.download}
          tooltip="Download"
        />
      )}
      {onUpload && (
        <ToolbarButton
          icon={Upload}
          onClick={onUpload}
          disabled={disabled.upload}
          tooltip="Upload"
        />
      )}
      {onShare && (
        <ToolbarButton
          icon={Share}
          onClick={onShare}
          disabled={disabled.share}
          tooltip="Share"
        />
      )}

      {(onDownload || onUpload || onShare) && (onDelete || onSettings) && (
        <ToolbarSeparator />
      )}

      {onDelete && (
        <ToolbarButton
          icon={Trash2}
          onClick={onDelete}
          disabled={disabled.delete}
          tooltip="Delete"
          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        />
      )}

      {onSettings && (
        <ToolbarButton
          icon={Settings}
          onClick={onSettings}
          disabled={disabled.settings}
          tooltip="Settings"
        />
      )}

      {moreActions.length > 0 && (
        <>
          <ToolbarSeparator />
          <ToolbarDropdown
            trigger={
              <ToolbarButton icon={MoreHorizontal} tooltip="More actions" />
            }
          >
            {moreActions.map((action, index) => (
              <ToolbarDropdownItem
                key={index}
                icon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                danger={action.danger}
              >
                {action.label}
              </ToolbarDropdownItem>
            ))}
          </ToolbarDropdown>
        </>
      )}
    </Toolbar>
  );
}

// ============================================================================
// FILTER TOOLBAR - Filter/search toolbar
// ============================================================================
export function FilterToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onFilterChange,
  activeFilters = {},
  onClearFilters,
  actions,
  className,
  ...props
}) {
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <Toolbar variant="ghost" className={cn('gap-3', className)} {...props}>
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filters.length > 0 && (
        <ToolbarGroup>
          {filters.map((filter) => (
            <ToolbarDropdown
              key={filter.key}
              trigger={
                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
                    activeFilters[filter.key]
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  {filter.icon && <filter.icon className="w-4 h-4" />}
                  {filter.label}
                  {activeFilters[filter.key] && (
                    <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 rounded">
                      {activeFilters[filter.key]}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>
              }
            >
              {filter.options.map((option) => (
                <ToolbarDropdownItem
                  key={option.value}
                  onClick={() => onFilterChange?.(filter.key, option.value)}
                >
                  {option.label}
                </ToolbarDropdownItem>
              ))}
            </ToolbarDropdown>
          ))}
        </ToolbarGroup>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Clear filters
        </button>
      )}

      {actions && (
        <>
          <div className="flex-1" />
          {actions}
        </>
      )}
    </Toolbar>
  );
}

// ============================================================================
// SELECTION TOOLBAR - Multi-select action toolbar
// ============================================================================
export function SelectionToolbar({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onArchive,
  onMove,
  onExport,
  actions = [],
  className,
  ...props
}) {
  if (selectedCount === 0) return null;

  return (
    <Toolbar
      variant="floating"
      className={cn('fixed bottom-6 left-1/2 -translate-x-1/2 z-50', className)}
      {...props}
    >
      <span className="px-3 text-sm font-medium text-gray-900 dark:text-white">
        {selectedCount} selected
      </span>

      <ToolbarSeparator />

      <ToolbarButton onClick={onSelectAll} tooltip="Select all">
        Select all
      </ToolbarButton>
      <ToolbarButton onClick={onDeselectAll} tooltip="Deselect all">
        Deselect
      </ToolbarButton>

      <ToolbarSeparator />

      {actions.map((action, index) => (
        <ToolbarButton
          key={index}
          icon={action.icon}
          onClick={action.onClick}
          tooltip={action.label}
          className={action.danger ? 'text-red-600 dark:text-red-400' : ''}
        >
          {action.showLabel && action.label}
        </ToolbarButton>
      ))}

      {onDelete && (
        <ToolbarButton
          icon={Trash2}
          onClick={onDelete}
          tooltip="Delete selected"
          className="text-red-600 dark:text-red-400"
        />
      )}
    </Toolbar>
  );
}

// ============================================================================
// ZOOM TOOLBAR - Zoom controls toolbar
// ============================================================================
export function ZoomToolbar({
  zoom = 100,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomChange,
  minZoom = 25,
  maxZoom = 400,
  className,
  ...props
}) {
  return (
    <Toolbar variant="default" size="sm" className={className} {...props}>
      <ToolbarButton
        icon={Minus}
        onClick={onZoomOut}
        disabled={zoom <= minZoom}
        tooltip="Zoom out"
      />

      <button
        type="button"
        onClick={onZoomReset}
        className="px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        {zoom}%
      </button>

      <ToolbarButton
        icon={Plus}
        onClick={onZoomIn}
        disabled={zoom >= maxZoom}
        tooltip="Zoom in"
      />
    </Toolbar>
  );
}

// ============================================================================
// FLOATING TOOLBAR - Floating toolbar with position
// ============================================================================
export function FloatingToolbar({
  children,
  position = { x: 0, y: 0 },
  visible = true,
  className,
  ...props
}) {
  if (!visible) return null;

  return (
    <div
      className={cn('fixed z-50', className)}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
      {...props}
    >
      <Toolbar variant="floating">
        {children}
      </Toolbar>
    </div>
  );
}

export default Toolbar;
