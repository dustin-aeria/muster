/**
 * Toast Notifications Component
 * Non-blocking notifications for feedback
 *
 * @location src/components/ui/Toast.jsx
 */

import React, { Fragment, createContext, useContext, useState, useCallback } from 'react'
import { Transition } from '@headlessui/react'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Loader2
} from 'lucide-react'

// ============================================
// TOAST VARIANTS
// ============================================

const TOAST_VARIANTS = {
  success: {
    icon: CheckCircle,
    containerClass: 'bg-green-50 border-green-200',
    iconClass: 'text-green-500',
    titleClass: 'text-green-800',
    messageClass: 'text-green-700'
  },
  error: {
    icon: XCircle,
    containerClass: 'bg-red-50 border-red-200',
    iconClass: 'text-red-500',
    titleClass: 'text-red-800',
    messageClass: 'text-red-700'
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-yellow-50 border-yellow-200',
    iconClass: 'text-yellow-500',
    titleClass: 'text-yellow-800',
    messageClass: 'text-yellow-700'
  },
  info: {
    icon: Info,
    containerClass: 'bg-blue-50 border-blue-200',
    iconClass: 'text-blue-500',
    titleClass: 'text-blue-800',
    messageClass: 'text-blue-700'
  },
  loading: {
    icon: Loader2,
    containerClass: 'bg-gray-50 border-gray-200',
    iconClass: 'text-gray-500 animate-spin',
    titleClass: 'text-gray-800',
    messageClass: 'text-gray-700'
  }
}

// ============================================
// SINGLE TOAST COMPONENT
// ============================================

/**
 * Individual toast component
 */
export function Toast({
  id,
  title,
  message,
  variant = 'info',
  duration = 5000,
  onClose,
  action,
  actionLabel,
  dismissible = true,
  position = 'top-right'
}) {
  const [isVisible, setIsVisible] = useState(true)
  const config = TOAST_VARIANTS[variant] || TOAST_VARIANTS.info
  const Icon = config.icon

  React.useEffect(() => {
    if (duration && variant !== 'loading') {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(id), 200)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, id, onClose, variant])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(id), 200)
  }

  return (
    <Transition
      show={isVisible}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border overflow-hidden ${config.containerClass}`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`h-5 w-5 ${config.iconClass}`} />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              {title && (
                <p className={`text-sm font-medium ${config.titleClass}`}>
                  {title}
                </p>
              )}
              {message && (
                <p className={`mt-1 text-sm ${config.messageClass}`}>
                  {message}
                </p>
              )}
              {action && actionLabel && (
                <div className="mt-3">
                  <button
                    onClick={action}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    {actionLabel}
                  </button>
                </div>
              )}
            </div>
            {dismissible && (
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleClose}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Transition>
  )
}

// ============================================
// TOAST CONTAINER
// ============================================

const POSITION_CLASSES = {
  'top-left': 'top-0 left-0',
  'top-center': 'top-0 left-1/2 -translate-x-1/2',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-0 right-0'
}

/**
 * Toast container for rendering multiple toasts
 */
export function ToastContainer({ toasts, onClose, position = 'top-right' }) {
  const positionClass = POSITION_CLASSES[position] || POSITION_CLASSES['top-right']

  return (
    <div
      className={`fixed z-50 p-4 space-y-4 pointer-events-none ${positionClass}`}
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
          position={position}
        />
      ))}
    </div>
  )
}

// ============================================
// TOAST CONTEXT & PROVIDER
// ============================================

const ToastContext = createContext(null)

/**
 * Toast provider component
 */
export function ToastProvider({ children, position = 'top-right', maxToasts = 5 }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = toast.id || Date.now().toString()
    const newToast = { ...toast, id }

    setToasts((prev) => {
      // Remove oldest if at max
      const updated = prev.length >= maxToasts ? prev.slice(1) : prev
      return [...updated, newToast]
    })

    return id
  }, [maxToasts])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const updateToast = useCallback((id, updates) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, ...updates } : toast
      )
    )
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = useCallback((title, message, options = {}) => {
    return addToast({ variant: 'success', title, message, ...options })
  }, [addToast])

  const error = useCallback((title, message, options = {}) => {
    return addToast({ variant: 'error', title, message, duration: 8000, ...options })
  }, [addToast])

  const warning = useCallback((title, message, options = {}) => {
    return addToast({ variant: 'warning', title, message, ...options })
  }, [addToast])

  const info = useCallback((title, message, options = {}) => {
    return addToast({ variant: 'info', title, message, ...options })
  }, [addToast])

  const loading = useCallback((title, message, options = {}) => {
    return addToast({ variant: 'loading', title, message, duration: null, dismissible: false, ...options })
  }, [addToast])

  // Promise-based toast for async operations
  const promise = useCallback(async (promiseFn, messages) => {
    const {
      loading: loadingMsg = 'Loading...',
      success: successMsg = 'Success!',
      error: errorMsg = 'Something went wrong'
    } = messages

    const id = loading(typeof loadingMsg === 'string' ? loadingMsg : loadingMsg.title, typeof loadingMsg === 'object' ? loadingMsg.message : undefined)

    try {
      const result = await promiseFn
      updateToast(id, {
        variant: 'success',
        title: typeof successMsg === 'string' ? successMsg : successMsg.title,
        message: typeof successMsg === 'object' ? successMsg.message : undefined,
        duration: 5000,
        dismissible: true
      })
      return result
    } catch (err) {
      updateToast(id, {
        variant: 'error',
        title: typeof errorMsg === 'string' ? errorMsg : errorMsg.title,
        message: typeof errorMsg === 'object' ? errorMsg.message : err.message,
        duration: 8000,
        dismissible: true
      })
      throw err
    }
  }, [loading, updateToast])

  const value = {
    toasts,
    addToast,
    removeToast,
    updateToast,
    clearAll,
    success,
    error,
    warning,
    info,
    loading,
    promise
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  )
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// ============================================
// STANDALONE TOAST FUNCTIONS
// ============================================

let toastRef = null

export function setToastRef(ref) {
  toastRef = ref
}

export const toast = {
  success: (title, message, options) => toastRef?.success(title, message, options),
  error: (title, message, options) => toastRef?.error(title, message, options),
  warning: (title, message, options) => toastRef?.warning(title, message, options),
  info: (title, message, options) => toastRef?.info(title, message, options),
  loading: (title, message, options) => toastRef?.loading(title, message, options),
  promise: (promiseFn, messages) => toastRef?.promise(promiseFn, messages),
  dismiss: (id) => toastRef?.removeToast(id),
  dismissAll: () => toastRef?.clearAll()
}

// ============================================
// SIMPLE TOAST COMPONENT
// ============================================

/**
 * Simple inline toast/alert (not floating)
 */
export function InlineToast({
  title,
  message,
  variant = 'info',
  onClose,
  action,
  actionLabel,
  className = ''
}) {
  const config = TOAST_VARIANTS[variant] || TOAST_VARIANTS.info
  const Icon = config.icon

  return (
    <div className={`rounded-md p-4 border ${config.containerClass} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconClass}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleClass}`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`mt-1 text-sm ${config.messageClass}`}>
              {message}
            </div>
          )}
          {action && actionLabel && (
            <div className="mt-3">
              <button
                onClick={action}
                className="text-sm font-medium underline hover:no-underline"
              >
                {actionLabel}
              </button>
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// BANNER TOAST
// ============================================

/**
 * Full-width banner toast
 */
export function BannerToast({
  title,
  message,
  variant = 'info',
  onClose,
  action,
  actionLabel,
  sticky = false
}) {
  const config = TOAST_VARIANTS[variant] || TOAST_VARIANTS.info
  const Icon = config.icon

  return (
    <div className={`${sticky ? 'sticky top-0 z-40' : ''} border-b ${config.containerClass}`}>
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex-1 flex items-center">
            <Icon className={`h-5 w-5 ${config.iconClass}`} />
            <p className={`ml-3 font-medium ${config.titleClass}`}>
              {title}
              {message && (
                <span className={`ml-2 font-normal ${config.messageClass}`}>
                  {message}
                </span>
              )}
            </p>
          </div>
          {action && actionLabel && (
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <button
                onClick={action}
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {actionLabel}
              </button>
            </div>
          )}
          {onClose && (
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
              <button
                onClick={onClose}
                className="-mr-1 flex p-2 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default {
  Toast,
  ToastContainer,
  ToastProvider,
  useToast,
  toast,
  setToastRef,
  InlineToast,
  BannerToast
}
