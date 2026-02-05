/**
 * LoadingState.jsx
 * Reusable loading state component for Safety Declaration modules
 *
 * @location src/components/safetyDeclaration/shared/LoadingState.jsx
 */

import { Loader2 } from 'lucide-react'

export default function LoadingState({
  message = 'Loading...',
  size = 'default',
  inline = false
}) {
  if (inline) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className={`animate-spin ${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'}`} />
        <span className={size === 'small' ? 'text-sm' : ''}>{message}</span>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center ${
      size === 'small' ? 'py-8' : size === 'large' ? 'py-16' : 'py-12'
    }`}>
      <Loader2 className={`animate-spin text-blue-600 ${
        size === 'small' ? 'w-6 h-6' : size === 'large' ? 'w-12 h-12' : 'w-8 h-8'
      }`} />
      <p className={`mt-3 text-gray-500 ${size === 'small' ? 'text-sm' : ''}`}>
        {message}
      </p>
    </div>
  )
}

// Skeleton loader variants
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4 animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="h-8 bg-gray-200 rounded w-12 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      ))}
    </div>
  )
}
