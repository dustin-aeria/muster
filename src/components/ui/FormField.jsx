import React, { forwardRef, createContext, useContext, useId } from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle, Info, HelpCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Batch 116: FormField Component
 *
 * Form field wrapper components with label, error, help text.
 *
 * Exports:
 * - FormField: Complete form field wrapper
 * - FormLabel: Label component
 * - FormDescription: Help text component
 * - FormError: Error message component
 * - FormSuccess: Success message component
 * - FormHint: Hint/tooltip component
 * - FormGroup: Group of form fields
 * - FormSection: Section with heading
 * - FormDivider: Visual divider
 * - PasswordField: Password input with toggle
 * - RequiredIndicator: Required asterisk
 */

// ============================================================================
// FORM FIELD CONTEXT
// ============================================================================
const FormFieldContext = createContext({});

const useFormField = () => useContext(FormFieldContext);

// ============================================================================
// FORM FIELD - Complete form field wrapper
// ============================================================================
export function FormField({
  children,
  name,
  label,
  description,
  error,
  success,
  required = false,
  disabled = false,
  horizontal = false,
  labelWidth,
  className,
  ...props
}) {
  const generatedId = useId();
  const id = name || generatedId;

  return (
    <FormFieldContext.Provider
      value={{ id, name, error, success, required, disabled }}
    >
      <div
        className={cn(
          'space-y-1.5',
          horizontal && 'sm:flex sm:items-start sm:gap-4 sm:space-y-0',
          disabled && 'opacity-60',
          className
        )}
        {...props}
      >
        {label && (
          <FormLabel
            htmlFor={id}
            required={required}
            className={horizontal && labelWidth ? `sm:w-[${labelWidth}] sm:text-right sm:pt-2` : ''}
          >
            {label}
          </FormLabel>
        )}
        <div className={cn('flex-1', horizontal && 'sm:flex-1')}>
          {children}
          {description && !error && !success && (
            <FormDescription>{description}</FormDescription>
          )}
          {error && <FormError>{error}</FormError>}
          {success && <FormSuccess>{success}</FormSuccess>}
        </div>
      </div>
    </FormFieldContext.Provider>
  );
}

// ============================================================================
// FORM LABEL - Label component
// ============================================================================
export function FormLabel({
  children,
  htmlFor,
  required = false,
  optional = false,
  tooltip,
  className,
  ...props
}) {
  const context = useFormField();
  const labelFor = htmlFor || context.id;
  const isRequired = required || context.required;

  return (
    <label
      htmlFor={labelFor}
      className={cn(
        'block text-sm font-medium text-gray-700 dark:text-gray-300',
        className
      )}
      {...props}
    >
      {children}
      {isRequired && <RequiredIndicator />}
      {optional && (
        <span className="ml-1 text-gray-500 dark:text-gray-400 font-normal">
          (optional)
        </span>
      )}
      {tooltip && (
        <button
          type="button"
          className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          title={tooltip}
          aria-label="More information"
        >
          <HelpCircle className="w-4 h-4 inline" />
        </button>
      )}
    </label>
  );
}

// ============================================================================
// FORM DESCRIPTION - Help text component
// ============================================================================
export function FormDescription({
  children,
  className,
  ...props
}) {
  return (
    <p
      className={cn(
        'mt-1.5 text-sm text-gray-500 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// ============================================================================
// FORM ERROR - Error message component
// ============================================================================
export function FormError({
  children,
  className,
  ...props
}) {
  if (!children) return null;

  return (
    <p
      className={cn(
        'mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1',
        className
      )}
      role="alert"
      {...props}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {children}
    </p>
  );
}

// ============================================================================
// FORM SUCCESS - Success message component
// ============================================================================
export function FormSuccess({
  children,
  className,
  ...props
}) {
  if (!children) return null;

  return (
    <p
      className={cn(
        'mt-1.5 text-sm text-green-600 dark:text-green-400 flex items-center gap-1',
        className
      )}
      {...props}
    >
      <CheckCircle className="w-4 h-4 flex-shrink-0" />
      {children}
    </p>
  );
}

// ============================================================================
// FORM HINT - Hint/info component
// ============================================================================
export function FormHint({
  children,
  className,
  ...props
}) {
  return (
    <p
      className={cn(
        'mt-1.5 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1',
        className
      )}
      {...props}
    >
      <Info className="w-4 h-4 flex-shrink-0" />
      {children}
    </p>
  );
}

// ============================================================================
// REQUIRED INDICATOR - Required asterisk
// ============================================================================
export function RequiredIndicator({ className, ...props }) {
  return (
    <span
      className={cn('ml-0.5 text-red-500', className)}
      aria-hidden="true"
      {...props}
    >
      *
    </span>
  );
}

// ============================================================================
// FORM GROUP - Group of form fields
// ============================================================================
export function FormGroup({
  children,
  title,
  description,
  inline = false,
  columns,
  gap = 4,
  className,
  ...props
}) {
  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  const columnClasses = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  };

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div
        className={cn(
          inline ? 'flex flex-wrap items-end' : columns ? 'grid' : 'space-y-4',
          gapClasses[gap],
          columns && columnClasses[columns]
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// FORM SECTION - Section with heading
// ============================================================================
export function FormSection({
  children,
  title,
  description,
  icon: Icon,
  collapsible = false,
  defaultCollapsed = false,
  className,
  ...props
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <div
      className={cn(
        'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
          collapsible && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-1.5 bg-white dark:bg-gray-700 rounded-md">
              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {collapsible && (
            <svg
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform',
                isCollapsed && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FORM DIVIDER - Visual divider
// ============================================================================
export function FormDivider({
  label,
  className,
  ...props
}) {
  if (label) {
    return (
      <div className={cn('relative my-6', className)} {...props}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-400">
            {label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('my-6 border-t border-gray-200 dark:border-gray-700', className)}
      {...props}
    />
  );
}

// ============================================================================
// PASSWORD FIELD - Password input with toggle
// ============================================================================
export const PasswordField = forwardRef(function PasswordField({
  label = 'Password',
  error,
  description,
  required = false,
  showStrength = false,
  value = '',
  className,
  ...props
}, ref) {
  const [showPassword, setShowPassword] = React.useState(false);

  const getStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    return score;
  };

  const strength = getStrength(value);
  const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <FormField
      label={label}
      error={error}
      description={description}
      required={required}
      className={className}
    >
      <div className="relative">
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          className={cn(
            'w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 border rounded-lg text-sm',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500',
            'focus:outline-none focus:ring-2'
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {showStrength && value && (
        <div className="mt-2">
          <div className="flex gap-1 mb-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full',
                  i < strength ? strengthColors[strength - 1] : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Password strength: {strengthLabels[strength - 1] || 'Too short'}
          </p>
        </div>
      )}
    </FormField>
  );
});

// ============================================================================
// FORM ACTIONS - Form action buttons
// ============================================================================
export function FormActions({
  children,
  align = 'end',
  sticky = false,
  className,
  ...props
}) {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 pt-4',
        alignClasses[align],
        sticky && 'sticky bottom-0 bg-white dark:bg-gray-900 py-4 border-t border-gray-200 dark:border-gray-700 -mx-4 px-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// INLINE EDIT FIELD - Editable field
// ============================================================================
export function InlineEditField({
  value,
  onChange,
  onSave,
  onCancel,
  label,
  placeholder = 'Click to edit',
  className,
  ...props
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange?.(editValue);
    onSave?.(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    onCancel?.();
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={cn('flex items-center gap-2', className)} {...props}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  return (
    <div className={cn('group', className)} {...props}>
      {label && (
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}: </span>
      )}
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 border-b border-dashed border-transparent hover:border-blue-600 dark:hover:border-blue-400"
      >
        {value || placeholder}
      </button>
    </div>
  );
}

// ============================================================================
// CHARACTER COUNT - Character count display
// ============================================================================
export function CharacterCount({
  current,
  max,
  className,
  ...props
}) {
  const isOver = max && current > max;

  return (
    <span
      className={cn(
        'text-xs',
        isOver
          ? 'text-red-500'
          : 'text-gray-500 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {current}{max && `/${max}`}
    </span>
  );
}

export default FormField;
