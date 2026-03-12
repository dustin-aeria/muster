/**
 * WorkflowProgress Component
 * Visual progress indicator with history timeline and action buttons
 *
 * @version 1.0.0
 */

import {
  CheckCircle,
  Circle,
  Clock,
  ArrowRight,
  User,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { WORKFLOW_ACTIONS } from '../lib/database-phase4'

/**
 * Get step status based on workflow instance and template
 */
function getStepStatus(step, instance, allSteps) {
  const currentStepIndex = allSteps.findIndex(s => s.id === instance.currentStepId)
  const stepIndex = allSteps.findIndex(s => s.id === step.id)

  // Check if step was completed (appears in history with approval)
  const historyEntry = instance.history?.find(h => h.stepId === step.id && h.action === 'approved')

  if (instance.status === 'completed') {
    return 'completed'
  }

  if (instance.status === 'cancelled') {
    if (stepIndex <= currentStepIndex) {
      return historyEntry ? 'completed' : 'cancelled'
    }
    return 'pending'
  }

  if (stepIndex < currentStepIndex) {
    return 'completed'
  }

  if (stepIndex === currentStepIndex) {
    return 'current'
  }

  return 'pending'
}

/**
 * Step indicator component
 */
function StepIndicator({ step, status, isLast }) {
  return (
    <div className="flex items-center">
      {/* Step circle */}
      <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${
        status === 'completed' ? 'bg-green-500 border-green-500' :
        status === 'current' ? 'bg-purple-500 border-purple-500' :
        status === 'cancelled' ? 'bg-gray-300 border-gray-300' :
        'bg-white border-gray-300'
      }`}>
        {status === 'completed' ? (
          <CheckCircle className="w-5 h-5 text-white" />
        ) : status === 'current' ? (
          <Clock className="w-5 h-5 text-white" />
        ) : status === 'cancelled' ? (
          <XCircle className="w-5 h-5 text-white" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className={`w-12 h-0.5 ${
          status === 'completed' ? 'bg-green-500' :
          status === 'current' ? 'bg-purple-500' :
          'bg-gray-300'
        }`} />
      )}
    </div>
  )
}

/**
 * WorkflowProgress - Main component
 *
 * @param {Object} props
 * @param {Object} props.instance - Workflow instance data
 * @param {Object} props.template - Workflow template with steps
 * @param {boolean} [props.compact] - Compact display mode
 * @param {Function} [props.onAction] - Callback for action buttons
 * @param {boolean} [props.showActions] - Whether to show action buttons
 */
export default function WorkflowProgress({
  instance,
  template,
  compact = false,
  onAction,
  showActions = false,
}) {
  if (!instance || !template) {
    return null
  }

  const sortedSteps = [...(template.steps || [])].sort((a, b) => a.order - b.order)
  const currentStep = sortedSteps.find(s => s.id === instance.currentStepId)

  return (
    <div className={`${compact ? '' : 'bg-white rounded-xl border border-gray-200 p-6'}`}>
      {!compact && (
        <h3 className="font-semibold text-gray-900 mb-6">Workflow Progress</h3>
      )}

      {/* Steps visualization */}
      <div className="flex items-start justify-between overflow-x-auto pb-4">
        {sortedSteps.map((step, index) => {
          const status = getStepStatus(step, instance, sortedSteps)
          const isLast = index === sortedSteps.length - 1

          return (
            <div key={step.id} className="flex flex-col items-center min-w-[100px]">
              <StepIndicator step={step} status={status} isLast={isLast} />

              {/* Step label */}
              <div className="mt-3 text-center">
                <div className={`text-sm font-medium ${
                  status === 'current' ? 'text-purple-600' :
                  status === 'completed' ? 'text-green-600' :
                  status === 'cancelled' ? 'text-gray-400' :
                  'text-gray-500'
                }`}>
                  {step.name}
                </div>

                {/* Assignee role */}
                {step.assigneeRole && (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-1">
                    <User className="w-3 h-3" />
                    {step.assigneeRole}
                  </div>
                )}

                {/* Due indicator for current step */}
                {status === 'current' && instance.dueDate && (
                  <div className={`text-xs mt-1 ${
                    new Date(instance.dueDate) < new Date() ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    {new Date(instance.dueDate) < new Date() ? 'Overdue' : `Due ${new Date(instance.dueDate).toLocaleDateString()}`}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Current step info */}
      {!compact && instance.status === 'active' && currentStep && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">Current Step</div>
              <div className="font-semibold text-gray-900 text-lg mt-1">
                {currentStep.name}
              </div>
              {currentStep.description && (
                <p className="text-gray-500 text-sm mt-1">{currentStep.description}</p>
              )}

              {/* Assignment info */}
              {instance.assignedTo && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  Assigned to {instance.assignedToName}
                </div>
              )}

              {/* Due date warning */}
              {instance.dueDate && new Date(instance.dueDate) < new Date() && (
                <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  This step is overdue
                </div>
              )}
            </div>

            {/* Action buttons */}
            {showActions && currentStep.actions?.length > 0 && onAction && (
              <div className="flex items-center gap-2">
                {currentStep.actions.map((action) => {
                  const config = WORKFLOW_ACTIONS[action]
                  if (!config) return null

                  return (
                    <button
                      key={action}
                      onClick={() => onAction(action)}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${config.color}`}
                    >
                      {config.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status messages */}
      {instance.status === 'completed' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Workflow completed</span>
            {instance.completedAt && (
              <span className="text-sm text-gray-500">
                on {instance.completedAt.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}

      {instance.status === 'cancelled' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-500">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Workflow cancelled</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact workflow progress bar
 * Shows just the progress without step details
 */
export function WorkflowProgressBar({ instance, template }) {
  if (!instance || !template) return null

  const sortedSteps = [...(template.steps || [])].sort((a, b) => a.order - b.order)
  const currentStepIndex = sortedSteps.findIndex(s => s.id === instance.currentStepId)
  const progress = instance.status === 'completed'
    ? 100
    : Math.round((currentStepIndex / (sortedSteps.length - 1)) * 100)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>{sortedSteps[0]?.name}</span>
        <span>{sortedSteps[sortedSteps.length - 1]?.name}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            instance.status === 'completed' ? 'bg-green-500' :
            instance.status === 'cancelled' ? 'bg-gray-400' :
            'bg-purple-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1 text-center">
        {instance.status === 'completed' ? 'Completed' :
         instance.status === 'cancelled' ? 'Cancelled' :
         `Step ${currentStepIndex + 1} of ${sortedSteps.length}`}
      </div>
    </div>
  )
}
