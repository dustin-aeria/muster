/**
 * Modal Component
 * Accessible modal dialogs and drawers
 *
 * @location src/components/ui/Modal.jsx
 */

import React, { Fragment, useState, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, ChevronLeft } from 'lucide-react'

// ============================================
// MODAL SIZES
// ============================================

const MODAL_SIZES = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-full mx-4'
}

// ============================================
// BASE MODAL COMPONENT
// ============================================

/**
 * Base modal component
 */
export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = ''
}) {
  const sizeClass = MODAL_SIZES[size] || MODAL_SIZES.md

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnOverlayClick ? onClose : () => {}}
        static={!closeOnEsc}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${sizeClass} transform overflow-hidden rounded-lg bg-white shadow-xl transition-all ${className}`}
              >
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md z-10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

// ============================================
// MODAL PARTS
// ============================================

/**
 * Modal header
 */
export function ModalHeader({
  children,
  onClose,
  showCloseButton = false,
  className = ''
}) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      <div className="flex items-center justify-between">
        <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
          {children}
        </Dialog.Title>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Modal body
 */
export function ModalBody({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

/**
 * Modal footer
 */
export function ModalFooter({
  children,
  className = '',
  align = 'right'
}) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  }

  return (
    <div
      className={`px-6 py-4 border-t border-gray-200 flex items-center gap-3 ${alignClasses[align]} ${className}`}
    >
      {children}
    </div>
  )
}

// ============================================
// STANDARD MODAL
// ============================================

/**
 * Standard modal with header, body, footer
 */
export function StandardModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      closeOnOverlayClick={closeOnOverlayClick}
      showCloseButton={false}
    >
      <ModalHeader onClose={onClose} showCloseButton>
        {title}
      </ModalHeader>
      {description && (
        <div className="px-6 py-2 text-sm text-gray-500">{description}</div>
      )}
      <ModalBody>{children}</ModalBody>
      {footer && <ModalFooter>{footer}</ModalFooter>}
    </Modal>
  )
}

// ============================================
// FORM MODAL
// ============================================

/**
 * Modal optimized for forms
 */
export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isLoading = false,
  size = 'md',
  closeOnOverlayClick = false
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      closeOnOverlayClick={closeOnOverlayClick}
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose} showCloseButton>
          {title}
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : submitLabel}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

// ============================================
// DRAWER (SLIDE-OUT PANEL)
// ============================================

const DRAWER_POSITIONS = {
  right: {
    container: 'inset-y-0 right-0',
    panel: 'ml-auto',
    enterFrom: 'translate-x-full',
    enterTo: 'translate-x-0',
    leaveFrom: 'translate-x-0',
    leaveTo: 'translate-x-full'
  },
  left: {
    container: 'inset-y-0 left-0',
    panel: 'mr-auto',
    enterFrom: '-translate-x-full',
    enterTo: 'translate-x-0',
    leaveFrom: 'translate-x-0',
    leaveTo: '-translate-x-full'
  },
  bottom: {
    container: 'inset-x-0 bottom-0',
    panel: 'mt-auto',
    enterFrom: 'translate-y-full',
    enterTo: 'translate-y-0',
    leaveFrom: 'translate-y-0',
    leaveTo: 'translate-y-full'
  },
  top: {
    container: 'inset-x-0 top-0',
    panel: 'mb-auto',
    enterFrom: '-translate-y-full',
    enterTo: 'translate-y-0',
    leaveFrom: 'translate-y-0',
    leaveTo: '-translate-y-full'
  }
}

const DRAWER_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full'
}

/**
 * Drawer (slide-out panel) component
 */
export function Drawer({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'md',
  showOverlay = true,
  className = ''
}) {
  const posConfig = DRAWER_POSITIONS[position] || DRAWER_POSITIONS.right
  const sizeClass = position === 'top' || position === 'bottom' ? '' : DRAWER_SIZES[size]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        {showOverlay && (
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>
        )}

        {/* Drawer */}
        <div className={`fixed overflow-hidden ${posConfig.container}`}>
          <div className="absolute inset-0 overflow-hidden">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom={posConfig.enterFrom}
              enterTo={posConfig.enterTo}
              leave="transform transition ease-in-out duration-200"
              leaveFrom={posConfig.leaveFrom}
              leaveTo={posConfig.leaveTo}
            >
              <Dialog.Panel
                className={`w-full ${sizeClass} h-full ${posConfig.panel} flex flex-col bg-white shadow-xl ${className}`}
              >
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

/**
 * Drawer header
 */
export function DrawerHeader({
  children,
  onClose,
  showBackButton = false,
  onBack,
  className = ''
}) {
  return (
    <div className={`px-4 py-4 border-b border-gray-200 flex items-center ${className}`}>
      {showBackButton && (
        <button
          onClick={onBack || onClose}
          className="mr-3 text-gray-400 hover:text-gray-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <Dialog.Title as="h2" className="text-lg font-semibold text-gray-900 flex-1">
        {children}
      </Dialog.Title>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

/**
 * Drawer body
 */
export function DrawerBody({ children, className = '' }) {
  return (
    <div className={`flex-1 overflow-y-auto px-4 py-4 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Drawer footer
 */
export function DrawerFooter({ children, className = '' }) {
  return (
    <div className={`px-4 py-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

// ============================================
// FULLSCREEN MODAL
// ============================================

/**
 * Fullscreen modal
 */
export function FullscreenModal({
  isOpen,
  onClose,
  children,
  title,
  className = ''
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <Dialog.Title as="h2" className="text-lg font-semibold text-gray-900">
                  {title}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className={`flex-1 overflow-auto ${className}`}>
                {children}
              </div>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}

// ============================================
// USE MODAL HOOK
// ============================================

/**
 * Hook for managing modal state
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  }
}

/**
 * Hook for managing multiple modals
 */
export function useModals() {
  const [openModals, setOpenModals] = useState({})

  const open = useCallback((id) => {
    setOpenModals((prev) => ({ ...prev, [id]: true }))
  }, [])

  const close = useCallback((id) => {
    setOpenModals((prev) => ({ ...prev, [id]: false }))
  }, [])

  const isOpen = useCallback((id) => !!openModals[id], [openModals])

  const closeAll = useCallback(() => {
    setOpenModals({})
  }, [])

  return {
    openModals,
    open,
    close,
    isOpen,
    closeAll
  }
}

export default {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  StandardModal,
  FormModal,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  FullscreenModal,
  useModal,
  useModals,
  MODAL_SIZES
}
