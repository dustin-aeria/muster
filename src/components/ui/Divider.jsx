import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Batch 88: Divider Component
 *
 * Components for visual separation of content sections.
 *
 * Exports:
 * - Divider: Basic horizontal/vertical divider
 * - DividerWithText: Divider with centered text
 * - DividerWithIcon: Divider with centered icon
 * - GradientDivider: Divider with gradient effect
 * - DashedDivider: Dashed/dotted line divider
 * - ThickDivider: Bold section divider
 * - SpaceDivider: Invisible spacing divider
 * - DecorativeDivider: Decorative patterns
 * - SectionDivider: Full section break with title
 * - ListDivider: Thin divider for list items
 */

// ============================================================================
// DIVIDER - Basic horizontal/vertical divider
// ============================================================================
export function Divider({
  orientation = 'horizontal',
  color = 'default',
  thickness = 'normal',
  spacing = 'md',
  className,
  ...props
}) {
  const colorClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    light: 'bg-gray-100 dark:bg-gray-800',
    dark: 'bg-gray-300 dark:bg-gray-600',
    primary: 'bg-blue-200 dark:bg-blue-800',
    secondary: 'bg-purple-200 dark:bg-purple-800',
    success: 'bg-green-200 dark:bg-green-800',
    warning: 'bg-yellow-200 dark:bg-yellow-800',
    danger: 'bg-red-200 dark:bg-red-800',
  };

  const thicknessClasses = {
    thin: orientation === 'horizontal' ? 'h-px' : 'w-px',
    normal: orientation === 'horizontal' ? 'h-0.5' : 'w-0.5',
    thick: orientation === 'horizontal' ? 'h-1' : 'w-1',
    bold: orientation === 'horizontal' ? 'h-2' : 'w-2',
  };

  const spacingClasses = {
    none: '',
    xs: orientation === 'horizontal' ? 'my-1' : 'mx-1',
    sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
    xl: orientation === 'horizontal' ? 'my-8' : 'mx-8',
  };

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === 'horizontal' ? 'w-full' : 'h-full',
        colorClasses[color],
        thicknessClasses[thickness],
        spacingClasses[spacing],
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// DIVIDER WITH TEXT - Divider with centered text
// ============================================================================
export function DividerWithText({
  children,
  position = 'center',
  color = 'default',
  textColor = 'default',
  spacing = 'md',
  className,
  ...props
}) {
  const lineColorClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    light: 'bg-gray-100 dark:bg-gray-800',
    dark: 'bg-gray-300 dark:bg-gray-600',
    primary: 'bg-blue-200 dark:bg-blue-800',
  };

  const textColorClasses = {
    default: 'text-gray-500 dark:text-gray-400',
    muted: 'text-gray-400 dark:text-gray-500',
    dark: 'text-gray-700 dark:text-gray-300',
    primary: 'text-blue-600 dark:text-blue-400',
  };

  const spacingClasses = {
    none: '',
    xs: 'my-1',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
  };

  const positionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      role="separator"
      className={cn(
        'flex items-center w-full',
        spacingClasses[spacing],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'flex-grow h-px',
          lineColorClasses[color],
          position === 'left' && 'max-w-[30px]'
        )}
      />
      <span
        className={cn(
          'px-3 text-sm font-medium whitespace-nowrap',
          textColorClasses[textColor]
        )}
      >
        {children}
      </span>
      <div
        className={cn(
          'flex-grow h-px',
          lineColorClasses[color],
          position === 'right' && 'max-w-[30px]'
        )}
      />
    </div>
  );
}

// ============================================================================
// DIVIDER WITH ICON - Divider with centered icon
// ============================================================================
export function DividerWithIcon({
  icon: Icon,
  iconSize = 'md',
  color = 'default',
  iconColor = 'default',
  spacing = 'md',
  className,
  ...props
}) {
  const lineColorClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    light: 'bg-gray-100 dark:bg-gray-800',
    dark: 'bg-gray-300 dark:bg-gray-600',
    primary: 'bg-blue-200 dark:bg-blue-800',
  };

  const iconColorClasses = {
    default: 'text-gray-400 dark:text-gray-500',
    muted: 'text-gray-300 dark:text-gray-600',
    dark: 'text-gray-600 dark:text-gray-400',
    primary: 'text-blue-500 dark:text-blue-400',
    success: 'text-green-500 dark:text-green-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
    danger: 'text-red-500 dark:text-red-400',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const spacingClasses = {
    none: '',
    xs: 'my-1',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
  };

  return (
    <div
      role="separator"
      className={cn(
        'flex items-center w-full',
        spacingClasses[spacing],
        className
      )}
      {...props}
    >
      <div className={cn('flex-grow h-px', lineColorClasses[color])} />
      <div className="px-3">
        <Icon
          className={cn(
            iconSizeClasses[iconSize],
            iconColorClasses[iconColor]
          )}
        />
      </div>
      <div className={cn('flex-grow h-px', lineColorClasses[color])} />
    </div>
  );
}

// ============================================================================
// GRADIENT DIVIDER - Divider with gradient effect
// ============================================================================
export function GradientDivider({
  gradient = 'default',
  thickness = 'normal',
  spacing = 'md',
  animated = false,
  className,
  ...props
}) {
  const gradientClasses = {
    default: 'from-transparent via-gray-300 to-transparent dark:via-gray-600',
    primary: 'from-transparent via-blue-500 to-transparent',
    rainbow: 'from-red-500 via-yellow-500 to-blue-500',
    purple: 'from-purple-500 via-pink-500 to-red-500',
    ocean: 'from-blue-400 via-teal-500 to-green-400',
    sunset: 'from-orange-500 via-red-500 to-pink-500',
    gold: 'from-yellow-400 via-amber-500 to-orange-500',
  };

  const thicknessClasses = {
    thin: 'h-px',
    normal: 'h-0.5',
    thick: 'h-1',
    bold: 'h-2',
  };

  const spacingClasses = {
    none: '',
    xs: 'my-1',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
  };

  return (
    <div
      role="separator"
      className={cn(
        'w-full bg-gradient-to-r',
        gradientClasses[gradient],
        thicknessClasses[thickness],
        spacingClasses[spacing],
        animated && 'animate-pulse',
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// DASHED DIVIDER - Dashed or dotted line divider
// ============================================================================
export function DashedDivider({
  style = 'dashed',
  color = 'default',
  spacing = 'md',
  className,
  ...props
}) {
  const colorClasses = {
    default: 'border-gray-300 dark:border-gray-600',
    light: 'border-gray-200 dark:border-gray-700',
    dark: 'border-gray-400 dark:border-gray-500',
    primary: 'border-blue-300 dark:border-blue-600',
  };

  const styleClasses = {
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  const spacingClasses = {
    none: '',
    xs: 'my-1',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
  };

  return (
    <div
      role="separator"
      className={cn(
        'w-full border-t',
        styleClasses[style],
        colorClasses[color],
        spacingClasses[spacing],
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// THICK DIVIDER - Bold section divider
// ============================================================================
export function ThickDivider({
  color = 'default',
  spacing = 'lg',
  rounded = true,
  className,
  ...props
}) {
  const colorClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    accent: 'bg-gradient-to-r from-blue-500 to-purple-500',
    dark: 'bg-gray-800 dark:bg-gray-200',
  };

  const spacingClasses = {
    none: '',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
  };

  return (
    <div
      role="separator"
      className={cn(
        'w-full h-1.5',
        colorClasses[color],
        spacingClasses[spacing],
        rounded && 'rounded-full',
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// SPACE DIVIDER - Invisible spacing divider
// ============================================================================
export function SpaceDivider({
  size = 'md',
  className,
  ...props
}) {
  const sizeClasses = {
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
    '2xl': 'h-24',
    '3xl': 'h-32',
  };

  return (
    <div
      role="separator"
      aria-hidden="true"
      className={cn('w-full', sizeClasses[size], className)}
      {...props}
    />
  );
}

// ============================================================================
// DECORATIVE DIVIDER - Decorative patterns
// ============================================================================
export function DecorativeDivider({
  pattern = 'dots',
  color = 'default',
  spacing = 'md',
  className,
  ...props
}) {
  const colorClasses = {
    default: 'text-gray-300 dark:text-gray-600',
    light: 'text-gray-200 dark:text-gray-700',
    dark: 'text-gray-400 dark:text-gray-500',
    primary: 'text-blue-400 dark:text-blue-600',
  };

  const spacingClasses = {
    none: '',
    xs: 'my-1',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
    xl: 'my-8',
  };

  const patterns = {
    dots: '• • •',
    stars: '✦ ✦ ✦',
    diamonds: '◆ ◆ ◆',
    arrows: '→ → →',
    waves: '〰 〰 〰',
    lines: '― ― ―',
    circles: '○ ○ ○',
    squares: '■ ■ ■',
  };

  return (
    <div
      role="separator"
      className={cn(
        'flex items-center justify-center w-full',
        spacingClasses[spacing],
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'text-lg tracking-[0.5em] select-none',
          colorClasses[color]
        )}
      >
        {patterns[pattern]}
      </span>
    </div>
  );
}

// ============================================================================
// SECTION DIVIDER - Full section break with title
// ============================================================================
export function SectionDivider({
  title,
  subtitle,
  action,
  spacing = 'lg',
  className,
  ...props
}) {
  const spacingClasses = {
    none: '',
    sm: 'my-4',
    md: 'my-6',
    lg: 'my-8',
    xl: 'my-12',
  };

  return (
    <div
      role="separator"
      className={cn(
        'w-full',
        spacingClasses[spacing],
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-grow">
          <div className="h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="flex-shrink-0 px-4 text-center">
          {title && (
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex-grow">
          <div className="h-px bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>

      {action && (
        <div className="flex justify-center mt-3">
          {action}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LIST DIVIDER - Thin divider for list items
// ============================================================================
export function ListDivider({
  inset = 'none',
  color = 'default',
  className,
  ...props
}) {
  const insetClasses = {
    none: '',
    start: 'ml-4',
    end: 'mr-4',
    both: 'mx-4',
    icon: 'ml-12',
    avatar: 'ml-16',
  };

  const colorClasses = {
    default: 'bg-gray-100 dark:bg-gray-800',
    light: 'bg-gray-50 dark:bg-gray-900',
    medium: 'bg-gray-200 dark:bg-gray-700',
  };

  return (
    <div
      role="separator"
      className={cn(
        'h-px w-full',
        insetClasses[inset],
        colorClasses[color],
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// VERTICAL DIVIDER - For inline/horizontal layouts
// ============================================================================
export function VerticalDivider({
  height = 'full',
  color = 'default',
  thickness = 'normal',
  spacing = 'md',
  className,
  ...props
}) {
  const colorClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    light: 'bg-gray-100 dark:bg-gray-800',
    dark: 'bg-gray-300 dark:bg-gray-600',
    primary: 'bg-blue-200 dark:bg-blue-800',
  };

  const thicknessClasses = {
    thin: 'w-px',
    normal: 'w-0.5',
    thick: 'w-1',
  };

  const heightClasses = {
    xs: 'h-3',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    full: 'h-full',
    auto: 'self-stretch',
  };

  const spacingClasses = {
    none: '',
    xs: 'mx-1',
    sm: 'mx-2',
    md: 'mx-4',
    lg: 'mx-6',
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className={cn(
        'inline-block',
        colorClasses[color],
        thicknessClasses[thickness],
        heightClasses[height],
        spacingClasses[spacing],
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// LABELED DIVIDER GROUP - Multiple sections with labels
// ============================================================================
export function LabeledDividerGroup({
  items,
  spacing = 'md',
  className,
  ...props
}) {
  const spacingClasses = {
    sm: 'space-y-4',
    md: 'space-y-6',
    lg: 'space-y-8',
  };

  return (
    <div
      className={cn(spacingClasses[spacing], className)}
      {...props}
    >
      {items.map((item, index) => (
        <div key={index}>
          <DividerWithText position="left" textColor="muted">
            {item.label}
          </DividerWithText>
          <div className="mt-4">
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Divider;
