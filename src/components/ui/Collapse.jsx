import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, ChevronRight, Plus, Minus, ChevronsUpDown } from 'lucide-react';

/**
 * Batch 95: Collapse Component
 *
 * Collapsible content components for expandable sections.
 *
 * Exports:
 * - Collapse: Basic collapse animation
 * - CollapseGroup: Group of collapsible sections
 * - CollapsePanel: Panel with header and content
 * - ExpandableSection: Section with expand/collapse
 * - TreeView: Hierarchical tree structure
 * - NestedCollapse: Multi-level collapse
 * - CardCollapse: Collapsible card
 * - ShowMore: Show more/less toggle
 * - ReadMore: Read more text truncation
 * - FadeCollapse: Collapse with fade effect
 */

// ============================================================================
// COLLAPSE CONTEXT
// ============================================================================
const CollapseGroupContext = createContext({
  activeItems: [],
  toggle: () => {},
  allowMultiple: true,
});

function useCollapseGroup() {
  return useContext(CollapseGroupContext);
}

// ============================================================================
// COLLAPSE - Basic collapse animation
// ============================================================================
export function Collapse({
  isOpen,
  children,
  duration = 300,
  className,
  ...props
}) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(isOpen ? 'auto' : 0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;

    if (isOpen) {
      setIsAnimating(true);
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);

      const timer = setTimeout(() => {
        setHeight('auto');
        setIsAnimating(false);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);

      // Force reflow
      contentRef.current.offsetHeight;

      requestAnimationFrame(() => {
        setHeight(0);
      });

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  return (
    <div
      ref={contentRef}
      className={cn(
        'overflow-hidden',
        isAnimating && 'transition-[height] ease-in-out',
        className
      )}
      style={{
        height,
        transitionDuration: `${duration}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// COLLAPSE GROUP - Group of collapsible sections
// ============================================================================
export function CollapseGroup({
  children,
  defaultActiveItems = [],
  allowMultiple = true,
  onChange,
  className,
  ...props
}) {
  const [activeItems, setActiveItems] = useState(defaultActiveItems);

  const toggle = (id) => {
    setActiveItems((prev) => {
      let newItems;
      if (prev.includes(id)) {
        newItems = prev.filter((item) => item !== id);
      } else {
        newItems = allowMultiple ? [...prev, id] : [id];
      }
      onChange?.(newItems);
      return newItems;
    });
  };

  return (
    <CollapseGroupContext.Provider value={{ activeItems, toggle, allowMultiple }}>
      <div className={cn('space-y-2', className)} {...props}>
        {children}
      </div>
    </CollapseGroupContext.Provider>
  );
}

// ============================================================================
// COLLAPSE PANEL - Panel with header and content
// ============================================================================
export function CollapsePanel({
  id,
  title,
  subtitle,
  icon: Icon,
  children,
  defaultOpen = false,
  disabled = false,
  iconPosition = 'right',
  iconStyle = 'chevron',
  variant = 'default',
  className,
  ...props
}) {
  const { activeItems, toggle } = useCollapseGroup();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = id !== undefined && activeItems !== undefined;
  const isOpen = isControlled ? activeItems.includes(id) : internalOpen;

  const handleToggle = () => {
    if (disabled) return;
    if (isControlled) {
      toggle(id);
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  const variantClasses = {
    default: 'border border-gray-200 dark:border-gray-700 rounded-lg',
    bordered: 'border-b border-gray-200 dark:border-gray-700',
    ghost: '',
    filled: 'bg-gray-50 dark:bg-gray-800 rounded-lg',
  };

  const iconComponents = {
    chevron: isOpen ? ChevronDown : ChevronRight,
    plus: isOpen ? Minus : Plus,
    expand: ChevronsUpDown,
  };

  const IconComponent = iconComponents[iconStyle];

  return (
    <div className={cn(variantClasses[variant], className)} {...props}>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'w-full flex items-center gap-3 p-4 text-left',
          'hover:bg-gray-50 dark:hover:bg-gray-800/50',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
          'transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          variant === 'default' && isOpen && 'border-b border-gray-200 dark:border-gray-700',
          variant === 'filled' && 'rounded-lg'
        )}
      >
        {iconPosition === 'left' && (
          <IconComponent
            className={cn(
              'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform',
              iconStyle === 'chevron' && isOpen && 'rotate-90'
            )}
          />
        )}

        {Icon && <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />}

        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-white">
            {title}
          </div>
          {subtitle && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </div>
          )}
        </div>

        {iconPosition === 'right' && (
          <IconComponent
            className={cn(
              'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform',
              iconStyle === 'chevron' && isOpen && 'rotate-180'
            )}
          />
        )}
      </button>

      <Collapse isOpen={isOpen}>
        <div className="p-4 pt-0">
          {children}
        </div>
      </Collapse>
    </div>
  );
}

// ============================================================================
// EXPANDABLE SECTION - Section with expand/collapse
// ============================================================================
export function ExpandableSection({
  title,
  subtitle,
  children,
  defaultExpanded = false,
  expandLabel = 'Show more',
  collapseLabel = 'Show less',
  className,
  ...props
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn('space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
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
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isExpanded ? collapseLabel : expandLabel}
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </button>
      </div>

      <Collapse isOpen={isExpanded}>
        {children}
      </Collapse>
    </div>
  );
}

// ============================================================================
// TREE VIEW - Hierarchical tree structure
// ============================================================================
export function TreeView({
  items,
  defaultExpanded = [],
  onSelect,
  selectedItem,
  className,
  ...props
}) {
  const [expandedItems, setExpandedItems] = useState(defaultExpanded);

  const toggleExpand = (id) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isSelected = selectedItem === item.id;

    return (
      <div key={item.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            isSelected && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          )}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ChevronRight
                className={cn(
                  'w-4 h-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          ) : (
            <span className="w-5" />
          )}

          {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}

          <span
            onClick={() => onSelect?.(item)}
            className="flex-1 text-sm truncate"
          >
            {item.label}
          </span>

          {item.badge && (
            <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">
              {item.badge}
            </span>
          )}
        </div>

        {hasChildren && (
          <Collapse isOpen={isExpanded}>
            {item.children.map((child) => renderItem(child, level + 1))}
          </Collapse>
        )}
      </div>
    );
  };

  return (
    <div className={cn('py-2', className)} {...props}>
      {items.map((item) => renderItem(item))}
    </div>
  );
}

// ============================================================================
// NESTED COLLAPSE - Multi-level collapse
// ============================================================================
export function NestedCollapse({
  items,
  renderItem,
  defaultExpanded = [],
  className,
  ...props
}) {
  const [expandedItems, setExpandedItems] = useState(defaultExpanded);

  const toggleExpand = (id) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderNestedItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);

    return (
      <div key={item.id} className={cn(level > 0 && 'ml-4 border-l border-gray-200 dark:border-gray-700')}>
        <div className="flex items-center gap-2 py-2">
          {hasChildren && (
            <button
              onClick={() => toggleExpand(item.id)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight
                className={cn(
                  'w-4 h-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          )}
          <div className="flex-1">
            {renderItem ? renderItem(item, level) : item.label}
          </div>
        </div>

        {hasChildren && (
          <Collapse isOpen={isExpanded}>
            {item.children.map((child) => renderNestedItem(child, level + 1))}
          </Collapse>
        )}
      </div>
    );
  };

  return (
    <div className={className} {...props}>
      {items.map((item) => renderNestedItem(item))}
    </div>
  );
}

// ============================================================================
// CARD COLLAPSE - Collapsible card
// ============================================================================
export function CardCollapse({
  title,
  subtitle,
  icon: Icon,
  children,
  defaultOpen = true,
  actions,
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'flex items-center gap-3 p-4 cursor-pointer',
          'hover:bg-gray-50 dark:hover:bg-gray-800/50',
          isOpen && 'border-b border-gray-200 dark:border-gray-700'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {Icon && (
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}

        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </div>

      <Collapse isOpen={isOpen}>
        <div className="p-4">
          {children}
        </div>
      </Collapse>
    </div>
  );
}

// ============================================================================
// SHOW MORE - Show more/less toggle
// ============================================================================
export function ShowMore({
  children,
  visibleItems = 3,
  showMoreLabel = 'Show more',
  showLessLabel = 'Show less',
  className,
  ...props
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const items = React.Children.toArray(children);
  const hasMore = items.length > visibleItems;
  const displayedItems = isExpanded ? items : items.slice(0, visibleItems);

  return (
    <div className={className} {...props}>
      <div className="space-y-2">
        {displayedItems}
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          {isExpanded ? showLessLabel : `${showMoreLabel} (${items.length - visibleItems})`}
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// READ MORE - Read more text truncation
// ============================================================================
export function ReadMore({
  children,
  maxLength = 200,
  readMoreLabel = 'Read more',
  readLessLabel = 'Read less',
  className,
  ...props
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = String(children);
  const isTruncatable = text.length > maxLength;
  const displayText = isExpanded || !isTruncatable
    ? text
    : `${text.slice(0, maxLength).trim()}...`;

  return (
    <div className={className} {...props}>
      <p className="text-gray-600 dark:text-gray-300">
        {displayText}
        {isTruncatable && (
          <>
            {' '}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {isExpanded ? readLessLabel : readMoreLabel}
            </button>
          </>
        )}
      </p>
    </div>
  );
}

// ============================================================================
// FADE COLLAPSE - Collapse with fade effect
// ============================================================================
export function FadeCollapse({
  isOpen,
  children,
  maxHeight = 200,
  fadeHeight = 60,
  expandLabel = 'Show more',
  collapseLabel = 'Show less',
  className,
  ...props
}) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = isOpen !== undefined ? isOpen : internalExpanded;
  const contentRef = useRef(null);
  const [needsFade, setNeedsFade] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      setNeedsFade(contentRef.current.scrollHeight > maxHeight);
    }
  }, [children, maxHeight]);

  return (
    <div className={className} {...props}>
      <div
        ref={contentRef}
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          !expanded && needsFade && 'max-h-[var(--max-height)]'
        )}
        style={{ '--max-height': `${maxHeight}px` }}
      >
        {children}

        {!expanded && needsFade && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"
            style={{ height: `${fadeHeight}px` }}
          />
        )}
      </div>

      {needsFade && (
        <button
          onClick={() => setInternalExpanded(!expanded)}
          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          {expanded ? collapseLabel : expandLabel}
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// DETAILS COLLAPSE - HTML details/summary style
// ============================================================================
export function DetailsCollapse({
  summary,
  children,
  defaultOpen = false,
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'border border-gray-200 dark:border-gray-700 rounded-lg',
        className
      )}
      {...props}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-2 p-3 text-left',
          'hover:bg-gray-50 dark:hover:bg-gray-800/50',
          isOpen && 'border-b border-gray-200 dark:border-gray-700'
        )}
      >
        <ChevronRight
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            isOpen && 'rotate-90'
          )}
        />
        <span className="font-medium text-gray-900 dark:text-white">
          {summary}
        </span>
      </button>

      <Collapse isOpen={isOpen}>
        <div className="p-3">
          {children}
        </div>
      </Collapse>
    </div>
  );
}

export default Collapse;
