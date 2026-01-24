import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';
import { Check, Circle, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

/**
 * Batch 101: Stepper Component
 *
 * Step-by-step navigation and progress components.
 *
 * Exports:
 * - Stepper: Basic stepper
 * - StepperHorizontal: Horizontal stepper layout
 * - StepperVertical: Vertical stepper layout
 * - StepperCompact: Compact stepper
 * - StepperWithContent: Stepper with step content
 * - StepperDots: Dot-style stepper
 * - StepperProgress: Progress bar stepper
 * - StepperNav: Stepper navigation buttons
 * - WizardStepper: Full wizard with stepper
 * - StepperMobile: Mobile-friendly stepper
 */

// ============================================================================
// STEPPER CONTEXT
// ============================================================================
const StepperContext = createContext({
  currentStep: 0,
  totalSteps: 0,
  goToStep: () => {},
  nextStep: () => {},
  prevStep: () => {},
});

export function useStepperContext() {
  return useContext(StepperContext);
}

// ============================================================================
// STEPPER - Basic stepper
// ============================================================================
export function Stepper({
  steps,
  currentStep = 0,
  onChange,
  orientation = 'horizontal',
  size = 'md',
  variant = 'default',
  clickable = false,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-xs', connector: 'h-0.5' },
    md: { icon: 'w-8 h-8', text: 'text-sm', connector: 'h-0.5' },
    lg: { icon: 'w-10 h-10', text: 'text-base', connector: 'h-1' },
  };

  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const handleStepClick = (index) => {
    if (clickable && onChange) {
      onChange(index);
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col', className)} {...props}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={index} className="flex">
              <div className="flex flex-col items-center">
                <StepIcon
                  status={status}
                  step={step}
                  index={index}
                  size={sizeClasses[size]}
                  variant={variant}
                  clickable={clickable}
                  onClick={() => handleStepClick(index)}
                />
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[40px]',
                      status === 'completed' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  />
                )}
              </div>
              <div className="ml-4 pb-8">
                <p className={cn(
                  'font-medium',
                  sizeClasses[size].text,
                  status === 'current' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                )}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)} {...props}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <StepIcon
                status={status}
                step={step}
                index={index}
                size={sizeClasses[size]}
                variant={variant}
                clickable={clickable}
                onClick={() => handleStepClick(index)}
              />
              <div className="mt-2 text-center">
                <p className={cn(
                  'font-medium',
                  sizeClasses[size].text,
                  status === 'current' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                )}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 max-w-[120px]">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {!isLast && (
              <div
                className={cn(
                  'flex-1 mx-4',
                  sizeClasses[size].connector,
                  status === 'completed' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// STEP ICON - Helper component
// ============================================================================
function StepIcon({ status, step, index, size, variant, clickable, onClick }) {
  const baseClasses = cn(
    'flex items-center justify-center rounded-full font-medium transition-colors',
    size.icon,
    clickable && 'cursor-pointer'
  );

  const statusClasses = {
    completed: 'bg-blue-600 text-white',
    current: variant === 'outlined'
      ? 'border-2 border-blue-600 text-blue-600 bg-white dark:bg-gray-900'
      : 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50',
    upcoming: variant === 'outlined'
      ? 'border-2 border-gray-300 dark:border-gray-600 text-gray-400 bg-white dark:bg-gray-900'
      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  };

  if (step.error) {
    return (
      <div
        className={cn(baseClasses, 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400')}
        onClick={onClick}
      >
        <AlertCircle className="w-4 h-4" />
      </div>
    );
  }

  if (step.loading) {
    return (
      <div className={cn(baseClasses, statusClasses.current)} onClick={onClick}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className={cn(baseClasses, statusClasses.completed)} onClick={onClick}>
        {step.icon ? <step.icon className="w-4 h-4" /> : <Check className="w-4 h-4" />}
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, statusClasses[status])} onClick={onClick}>
      {step.icon ? <step.icon className="w-4 h-4" /> : index + 1}
    </div>
  );
}

// ============================================================================
// STEPPER HORIZONTAL - Horizontal stepper layout
// ============================================================================
export function StepperHorizontal(props) {
  return <Stepper {...props} orientation="horizontal" />;
}

// ============================================================================
// STEPPER VERTICAL - Vertical stepper layout
// ============================================================================
export function StepperVertical(props) {
  return <Stepper {...props} orientation="vertical" />;
}

// ============================================================================
// STEPPER COMPACT - Compact stepper
// ============================================================================
export function StepperCompact({
  steps,
  currentStep = 0,
  showLabels = false,
  className,
  ...props
}) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-colors',
                isCompleted && 'bg-blue-600',
                isCurrent && 'bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/50',
                !isCompleted && !isCurrent && 'bg-gray-300 dark:bg-gray-600'
              )}
              title={step.title}
            />
            {showLabels && isCurrent && (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {step.title}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// STEPPER WITH CONTENT - Stepper with step content
// ============================================================================
export function StepperWithContent({
  steps,
  currentStep = 0,
  onChange,
  showNavigation = true,
  className,
  ...props
}) {
  const goToStep = (step) => {
    if (step >= 0 && step < steps.length) {
      onChange?.(step);
    }
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  return (
    <StepperContext.Provider value={{ currentStep, totalSteps: steps.length, goToStep, nextStep, prevStep }}>
      <div className={className} {...props}>
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onChange={onChange}
          className="mb-8"
        />

        <div className="min-h-[200px]">
          {steps[currentStep]?.content}
        </div>

        {showNavigation && (
          <StepperNav
            currentStep={currentStep}
            totalSteps={steps.length}
            onPrev={prevStep}
            onNext={nextStep}
            className="mt-8"
          />
        )}
      </div>
    </StepperContext.Provider>
  );
}

// ============================================================================
// STEPPER DOTS - Dot-style stepper
// ============================================================================
export function StepperDots({
  total,
  current = 0,
  onChange,
  size = 'md',
  color = 'blue',
  className,
  ...props
}) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    green: 'bg-green-600',
  };

  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onChange?.(index)}
          className={cn(
            'rounded-full transition-all',
            sizeClasses[size],
            index === current
              ? colorClasses[color]
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
          )}
          aria-label={`Go to step ${index + 1}`}
        />
      ))}
    </div>
  );
}

// ============================================================================
// STEPPER PROGRESS - Progress bar stepper
// ============================================================================
export function StepperProgress({
  steps,
  currentStep = 0,
  showLabels = true,
  color = 'blue',
  className,
  ...props
}) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
  };

  return (
    <div className={className} {...props}>
      {showLabels && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {steps[currentStep]?.title}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
      )}

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', colorClasses[color])}
          style={{ width: `${progress}%` }}
        />
      </div>

      {showLabels && (
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <span
              key={index}
              className={cn(
                'text-xs',
                index <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              )}
            >
              {step.shortTitle || step.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEPPER NAV - Stepper navigation buttons
// ============================================================================
export function StepperNav({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onComplete,
  prevLabel = 'Back',
  nextLabel = 'Continue',
  completeLabel = 'Complete',
  showStepCount = true,
  className,
  ...props
}) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div
      className={cn('flex items-center justify-between', className)}
      {...props}
    >
      <button
        onClick={onPrev}
        disabled={isFirst}
        className={cn(
          'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
          'border border-gray-300 dark:border-gray-600',
          'hover:bg-gray-50 dark:hover:bg-gray-800',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        {prevLabel}
      </button>

      {showStepCount && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Step {currentStep + 1} of {totalSteps}
        </span>
      )}

      {isLast ? (
        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white"
        >
          {completeLabel}
          <Check className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          {nextLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// WIZARD STEPPER - Full wizard with stepper
// ============================================================================
export function WizardStepper({
  steps,
  initialStep = 0,
  onComplete,
  onStepChange,
  validateStep,
  className,
  ...props
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const goToStep = async (step) => {
    if (validateStep) {
      const isValid = await validateStep(currentStep);
      if (!isValid) return;
    }

    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setCurrentStep(step);
    onStepChange?.(step);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      onStepChange?.(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (validateStep) {
      const isValid = await validateStep(currentStep);
      if (!isValid) return;
    }
    onComplete?.();
  };

  const enrichedSteps = steps.map((step, index) => ({
    ...step,
    completed: completedSteps.has(index),
  }));

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)} {...props}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Stepper
          steps={enrichedSteps}
          currentStep={currentStep}
          onChange={goToStep}
          clickable
        />
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {steps[currentStep]?.title}
        </h3>
        {steps[currentStep]?.description && (
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {steps[currentStep].description}
          </p>
        )}

        <div className="min-h-[200px]">
          {steps[currentStep]?.content}
        </div>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <StepperNav
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrev={prevStep}
          onNext={nextStep}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}

// ============================================================================
// STEPPER MOBILE - Mobile-friendly stepper
// ============================================================================
export function StepperMobile({
  steps,
  currentStep = 0,
  onChange,
  className,
  ...props
}) {
  const step = steps[currentStep];

  return (
    <div className={className} {...props}>
      {/* Progress bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Step {currentStep + 1} of {steps.length}
          </p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {step?.title}
          </h3>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => onChange?.(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === currentStep
                  ? 'bg-blue-600'
                  : index < currentStep
                  ? 'bg-blue-300 dark:bg-blue-700'
                  : 'bg-gray-300 dark:bg-gray-600'
              )}
            />
          ))}
        </div>
      </div>

      {step?.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {step.description}
        </p>
      )}
    </div>
  );
}

export default Stepper;
