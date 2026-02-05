/**
 * EmptyState.jsx
 * Reusable empty state component for Safety Declaration modules
 *
 * @location src/components/safetyDeclaration/shared/EmptyState.jsx
 */

import {
  FileText,
  TestTube,
  ClipboardList,
  FileCheck,
  Upload,
  Plus,
  Search,
  AlertCircle
} from 'lucide-react'

const ICONS = {
  declarations: FileCheck,
  requirements: ClipboardList,
  testing: TestTube,
  evidence: FileText,
  upload: Upload,
  search: Search,
  error: AlertCircle,
  default: FileText
}

export default function EmptyState({
  icon = 'default',
  title,
  description,
  action,
  actionLabel,
  actionIcon,
  size = 'default',
  variant = 'default'
}) {
  const Icon = typeof icon === 'string' ? ICONS[icon] || ICONS.default : icon
  const ActionIcon = actionIcon || Plus

  const sizeClasses = {
    small: 'py-6',
    default: 'py-12',
    large: 'py-16'
  }

  const iconSizes = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16'
  }

  const variantClasses = {
    default: 'bg-white',
    muted: 'bg-gray-50',
    bordered: 'bg-white border border-gray-200 rounded-lg'
  }

  return (
    <div className={`${variantClasses[variant]} ${sizeClasses[size]} text-center px-4`}>
      <div className={`mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit`}>
        <Icon className={`${iconSizes[size]} text-gray-400`} />
      </div>

      <h3 className={`font-medium text-gray-900 ${
        size === 'small' ? 'text-base' : 'text-lg'
      }`}>
        {title}
      </h3>

      {description && (
        <p className={`mt-2 text-gray-500 max-w-md mx-auto ${
          size === 'small' ? 'text-sm' : ''
        }`}>
          {description}
        </p>
      )}

      {action && actionLabel && (
        <button
          onClick={action}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ActionIcon className="w-5 h-5" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// Pre-configured empty states for common scenarios
export function NoDeclarations({ onCreateClick }) {
  return (
    <EmptyState
      icon="declarations"
      title="No Safety Declarations Yet"
      description="Create your first Safety Assurance Declaration to track compliance with Transport Canada CAR Standard 922."
      action={onCreateClick}
      actionLabel="Create Declaration"
      variant="bordered"
    />
  )
}

export function NoRequirements() {
  return (
    <EmptyState
      icon="requirements"
      title="No Requirements Loaded"
      description="Requirements will be automatically loaded based on the operation types selected for this declaration."
      variant="bordered"
      size="small"
    />
  )
}

export function NoTestingSessions({ onCreateClick }) {
  return (
    <EmptyState
      icon="testing"
      title="No Testing Sessions"
      description="Schedule and track testing sessions to document compliance with Standard 922 requirements."
      action={onCreateClick}
      actionLabel="Schedule Test"
      variant="bordered"
    />
  )
}

export function NoEvidence({ onUploadClick }) {
  return (
    <EmptyState
      icon="evidence"
      title="No Evidence Uploaded"
      description="Upload test reports, analysis documents, photos, and other evidence to support your compliance claims."
      action={onUploadClick}
      actionLabel="Upload Evidence"
      actionIcon={Upload}
      variant="bordered"
    />
  )
}

export function NoSearchResults({ searchTerm, onClearSearch }) {
  return (
    <EmptyState
      icon="search"
      title="No Matching Results"
      description={`No items found matching "${searchTerm}". Try adjusting your search or filter criteria.`}
      action={onClearSearch}
      actionLabel="Clear Search"
      actionIcon={Search}
      variant="bordered"
      size="small"
    />
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <EmptyState
      icon="error"
      title="Something went wrong"
      description={error?.message || "We couldn't load the data. Please try again."}
      action={onRetry}
      actionLabel="Try Again"
      variant="bordered"
    />
  )
}
