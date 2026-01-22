/**
 * ProcedureLibrary.jsx
 * Searchable Procedure Library with full CRUD support
 *
 * Features:
 * - Firestore-backed procedure management
 * - Create, edit, delete procedures
 * - File attachments via Firebase Storage
 * - Search functionality
 * - Category filter chips (General, Advanced, Emergency)
 * - List/grid toggle view
 * - Sort by number/title/date
 * - Procedure detail modal with edit/delete
 * - Review status badges (active/due/overdue)
 * - Step-by-step procedure display
 * - Loading skeleton UI
 *
 * @location src/components/ProcedureLibrary.jsx
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Grid,
  List,
  FileText,
  ChevronRight,
  X,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  FolderOpen,
  Plus,
  Check,
  ChevronDown,
  ClipboardList,
  Zap,
  AlertTriangle,
  ListChecks
} from 'lucide-react'
import {
  getProceduresEnhanced,
  deleteProcedureEnhanced,
  seedMissingProcedures,
  updateProceduresWithContent,
  updateProcedureField
} from '../lib/firestoreProcedures'
import { useAuth } from '../contexts/AuthContext'
import { logger } from '../lib/logger'

// ============================================
// PROCEDURE CATEGORIES
// ============================================

const CATEGORIES = {
  general: {
    id: 'general',
    name: 'General Procedures',
    icon: ClipboardList,
    color: 'blue',
    description: 'Pre-flight, post-flight, and routine operational procedures'
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced Procedures',
    icon: Zap,
    color: 'purple',
    description: 'BVLOS, complex operations, and specialized tasks'
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Procedures',
    icon: AlertTriangle,
    color: 'red',
    description: 'Flyaways, lost link, injuries, and emergency response'
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getStatusInfo = (procedure) => {
  if (!procedure) {
    return { status: 'active', label: 'Active', color: 'green', icon: CheckCircle2 }
  }

  if (procedure.status === 'draft') {
    return { status: 'draft', label: 'Draft', color: 'gray', icon: FileText }
  }

  if (procedure.status === 'retired') {
    return { status: 'retired', label: 'Retired', color: 'gray', icon: FileText }
  }

  // Handle review date check safely
  try {
    if (procedure.reviewDate) {
      const today = new Date()
      const reviewDate = new Date(procedure.reviewDate)
      const daysUntilReview = Math.ceil((reviewDate - today) / (1000 * 60 * 60 * 24))

      if (daysUntilReview < 0) {
        return { status: 'overdue', label: 'Review Overdue', color: 'red', icon: AlertCircle }
      }

      if (daysUntilReview <= 30) {
        return { status: 'due', label: 'Review Due', color: 'amber', icon: Clock }
      }
    }
  } catch {
    // If date parsing fails, just return active
  }

  return { status: 'active', label: 'Active', color: 'green', icon: CheckCircle2 }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Not set'
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Status options for the inline dropdown
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'retired', label: 'Retired' }
]

// ============================================
// INLINE EDITING COMPONENTS
// ============================================

/**
 * Inline status dropdown editor
 * Shows current status as clickable badge, opens dropdown on click
 */
function InlineStatusEditor({ procedure, onUpdate, disabled }) {
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const dropdownRef = React.useRef(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStatusChange = async (newStatus, e) => {
    e.preventDefault()
    e.stopPropagation()

    if (newStatus === procedure.status) {
      setIsOpen(false)
      return
    }

    setSaving(true)
    try {
      await onUpdate(procedure.id, { status: newStatus })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1500)
    } catch (error) {
      logger.error('Failed to update status:', error)
    } finally {
      setSaving(false)
      setIsOpen(false)
    }
  }

  const currentOption = STATUS_OPTIONS.find(opt => opt.value === procedure.status) || STATUS_OPTIONS[0]

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
    active: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
    'under-review': 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200',
    retired: 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!disabled) setIsOpen(!isOpen)
        }}
        disabled={disabled || saving}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium transition-all ${statusColors[procedure.status] || statusColors.draft} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {saving ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : showSuccess ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <>
            {currentOption.label}
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
          {STATUS_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={(e) => handleStatusChange(option.value, e)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                option.value === procedure.status ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Inline review date editor
 * Shows current date as clickable text, opens date picker on click
 */
function InlineReviewDateEditor({ procedure, onUpdate, disabled }) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const inputRef = React.useRef(null)

  // Focus input when editing starts
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleDateChange = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const newDate = e.target.value
    if (newDate === procedure.reviewDate) {
      setIsEditing(false)
      return
    }

    setSaving(true)
    try {
      await onUpdate(procedure.id, { reviewDate: newDate })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1500)
    } catch (error) {
      logger.error('Failed to update review date:', error)
    } finally {
      setSaving(false)
      setIsEditing(false)
    }
  }

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsEditing(true)
  }

  const handleBlur = () => {
    // Delay hiding to allow change event to fire
    setTimeout(() => setIsEditing(false), 100)
  }

  // Format date for display
  const displayDate = procedure.reviewDate ? formatDate(procedure.reviewDate) : 'Not set'

  // Format date for input (YYYY-MM-DD)
  const inputDate = procedure.reviewDate || ''

  if (isEditing) {
    return (
      <div className="inline-flex items-center" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="date"
          value={inputDate}
          onChange={handleDateChange}
          onBlur={handleBlur}
          disabled={saving}
          className="px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          onClick={(e) => e.stopPropagation()}
        />
        {saving && <Loader2 className="w-3 h-3 ml-1 animate-spin text-blue-500" />}
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Calendar className="w-3 h-3" />
      {showSuccess ? (
        <>
          <Check className="w-3 h-3 text-green-600" />
          <span className="text-green-600">Saved</span>
        </>
      ) : (
        <span>{displayDate}</span>
      )}
    </button>
  )
}

// ============================================
// UI COMPONENTS
// ============================================

function CategoryFilters({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-aeria-navy text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All Procedures
      </button>
      {Object.values(CATEGORIES).map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            selected === cat.id
              ? cat.color === 'blue' ? 'bg-blue-600 text-white' :
                cat.color === 'purple' ? 'bg-purple-600 text-white' :
                cat.color === 'red' ? 'bg-red-600 text-white' :
                'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <cat.icon className="w-4 h-4" />
          {cat.name}
        </button>
      ))}
    </div>
  )
}

function ProcedureCard({ procedure, view, onUpdate }) {
  const navigate = useNavigate()
  const category = CATEGORIES[procedure?.category] || CATEGORIES.general

  const categoryColors = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    green: 'bg-green-100 text-green-700 border-green-200'
  }

  const colorClass = categoryColors[category?.color] || categoryColors.blue

  const handleCardClick = (e) => {
    // Navigate to procedure detail if not clicking on an interactive element
    if (!e.defaultPrevented) {
      navigate(`/procedures/${procedure?.id}`)
    }
  }

  // Get step count
  const stepCount = procedure?.steps?.length || 0

  if (view === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className="block w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-left flex items-center gap-4 cursor-pointer"
      >
        <div className="w-20 text-center flex-shrink-0">
          <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${colorClass}`}>
            {procedure?.number || '-'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{procedure?.title || 'Untitled'}</h3>
          <p className="text-sm text-gray-500 truncate mt-0.5">{procedure?.description || ''}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Step Count */}
          <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            <ListChecks className="w-3 h-3" />
            {stepCount} steps
          </span>

          {/* Review Date - Inline Editable */}
          <InlineReviewDateEditor
            procedure={procedure}
            onUpdate={onUpdate}
          />

          {/* Status - Inline Editable */}
          <InlineStatusEditor
            procedure={procedure}
            onUpdate={onUpdate}
          />

          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div
      onClick={handleCardClick}
      className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all text-left h-full flex flex-col cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${colorClass}`}>
          {procedure?.number || '-'}
        </span>
        <InlineStatusEditor
          procedure={procedure}
          onUpdate={onUpdate}
        />
      </div>

      <h3 className="font-medium text-gray-900 mb-2">{procedure?.title || 'Untitled'}</h3>
      <p className="text-sm text-gray-500 flex-1 line-clamp-2">{procedure?.description || ''}</p>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <InlineReviewDateEditor
            procedure={procedure}
            onUpdate={onUpdate}
          />
          <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
            <ListChecks className="w-3 h-3" />
            {stepCount} steps
          </span>
        </div>
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {procedure?.owner || 'Unassigned'}
        </span>
      </div>
    </div>
  )
}

function EmptyState({ searchQuery, categoryFilter, onSeedProcedures, seeding }) {
  return (
    <div className="text-center py-12">
      <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No procedures found</h3>
      <p className="text-gray-500 mb-4">
        {searchQuery
          ? `No procedures match "${searchQuery}"`
          : categoryFilter
            ? `No procedures in this category`
            : 'No procedures available'
        }
      </p>
      {!searchQuery && !categoryFilter && onSeedProcedures && (
        <button
          onClick={onSeedProcedures}
          disabled={seeding}
          className="btn-primary inline-flex items-center gap-2"
        >
          {seeding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Seeding Procedures...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Seed Default Procedures
            </>
          )}
        </button>
      )}
    </div>
  )
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-100 rounded"></div>
          </div>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center px-4">
                <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="h-3 w-10 bg-gray-100 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="h-10 bg-gray-100 rounded-lg"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-28 bg-gray-100 rounded-full"></div>
          ))}
        </div>
      </div>

      {/* List skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="h-10 w-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-96 bg-gray-100 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// DELETE CONFIRMATION MODAL
// ============================================

function DeleteConfirmModal({ procedure, onConfirm, onCancel, deleting }) {
  if (!procedure) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Procedure</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{procedure.number} - {procedure.title}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="btn-primary bg-red-600 hover:bg-red-700"
          >
            {deleting ? 'Deleting...' : 'Delete Procedure'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProcedureLibrary() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [procedures, setProcedures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [sortBy, setSortBy] = useState('number')
  const [sortOrder, setSortOrder] = useState('asc')

  // Modal states
  const [deletingProcedure, setDeletingProcedure] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [populatingContent, setPopulatingContent] = useState(false)

  // Load procedures from Firestore
  const loadProcedures = async () => {
    try {
      setError('')
      const data = await getProceduresEnhanced()
      setProcedures(data)
    } catch (err) {
      setError('Failed to load procedures. Please try again.')
      logger.error('Error loading procedures:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProcedures()
  }, [])

  // Handle seed missing procedures
  const handleSeedProcedures = async () => {
    if (!user) return

    setSeeding(true)
    setError('')

    try {
      const result = await seedMissingProcedures(user.uid)
      if (result.success) {
        await loadProcedures()
        if (result.added > 0) {
          alert(`Successfully added ${result.added} procedures. ${result.skipped} procedures already existed.`)
        } else {
          alert('All procedures are already in the database.')
        }
      } else {
        setError(result.errors?.join(', ') || 'Failed to seed procedures')
      }
    } catch (err) {
      setError('Failed to seed procedures. Please try again.')
      logger.error('Error seeding procedures:', err)
    } finally {
      setSeeding(false)
    }
  }

  // Handle populate procedure content from extracted PDFs
  const handlePopulateContent = async () => {
    if (!user) return

    setPopulatingContent(true)
    setError('')

    try {
      const result = await updateProceduresWithContent(user.uid)
      if (result.success) {
        await loadProcedures()
        alert(`Successfully updated ${result.updated} procedures with content. ${result.skipped} procedures skipped (no content available).`)
      } else {
        setError(result.errors?.join(', ') || 'Failed to populate content')
      }
    } catch (err) {
      setError('Failed to populate procedure content. Please try again.')
      logger.error('Error populating content:', err)
    } finally {
      setPopulatingContent(false)
    }
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingProcedure) return

    setIsDeleting(true)
    try {
      await deleteProcedureEnhanced(deletingProcedure.id)
      await loadProcedures()
      setDeletingProcedure(null)
    } catch (err) {
      setError('Failed to delete procedure. Please try again.')
      logger.error('Error deleting procedure:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle inline field updates (for review date and status)
  const handleInlineUpdate = async (procedureId, fields) => {
    try {
      await updateProcedureField(procedureId, fields, user?.uid)
      // Update local state to reflect the change immediately
      setProcedures(prev => prev.map(p =>
        p.id === procedureId ? { ...p, ...fields } : p
      ))
    } catch (err) {
      setError('Failed to update procedure. Please try again.')
      logger.error('Error updating procedure field:', err)
      throw err // Re-throw so the inline editor knows it failed
    }
  }

  // Filter and sort procedures
  const filteredProcedures = useMemo(() => {
    let result = [...procedures]

    // Category filter
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.number?.toLowerCase().includes(query) ||
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.keywords?.some(k => k.toLowerCase().includes(query))
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'number':
          comparison = (a.number || '').localeCompare(b.number || '', undefined, { numeric: true })
          break
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '')
          break
        case 'date':
          comparison = new Date(a.effectiveDate || 0) - new Date(b.effectiveDate || 0)
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [procedures, searchQuery, categoryFilter, sortBy, sortOrder])

  // Stats
  const stats = useMemo(() => {
    const all = procedures.length
    const active = procedures.filter(p => getStatusInfo(p).status === 'active').length
    const due = procedures.filter(p => getStatusInfo(p).status === 'due').length
    const overdue = procedures.filter(p => getStatusInfo(p).status === 'overdue').length
    const totalSteps = procedures.reduce((sum, p) => sum + (p.steps?.length || 0), 0)

    return { all, active, due, overdue, totalSteps }
  }, [procedures])

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Show loading skeleton
  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-red-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ClipboardList className="w-7 h-7 text-aeria-navy" />
              Procedure Library
            </h1>
            <p className="text-gray-500 mt-1">
              Step-by-step operational procedures for RPAS operations
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Add Missing Procedures Button */}
            {procedures.length > 0 && (
              <button
                onClick={handleSeedProcedures}
                disabled={seeding}
                className="btn-secondary flex items-center gap-2"
                title="Add new procedures that don't exist yet"
              >
                {seeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Missing Procedures
                  </>
                )}
              </button>
            )}

            {/* Populate Content Button - only show when there are procedures */}
            {procedures.length > 0 && (
              <button
                onClick={handlePopulateContent}
                disabled={populatingContent}
                className="btn-secondary flex items-center gap-2"
                title="Populate procedures with extracted PDF content"
              >
                {populatingContent ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Populate Content
                  </>
                )}
              </button>
            )}

            {/* New Procedure Button */}
            <button
              onClick={() => navigate('/procedures/new')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Procedure
            </button>

            {/* Stats */}
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
              <div className="text-center px-4">
                <p className="text-2xl font-bold text-gray-900">{stats.all}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center px-4 border-l border-gray-200">
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div className="text-center px-4 border-l border-gray-200">
                <p className="text-2xl font-bold text-amber-600">{stats.due}</p>
                <p className="text-xs text-gray-500">Due</p>
              </div>
              <div className="text-center px-4 border-l border-gray-200">
                <p className="text-2xl font-bold text-blue-600">{stats.totalSteps}</p>
                <p className="text-xs text-gray-500">Steps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by number, title, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
              aria-label="Search procedures by number, title, or keyword"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-aeria-navy text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-aeria-navy text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort:</span>
            <button
              onClick={() => toggleSort('number')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'number' ? 'bg-aeria-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Number {sortBy === 'number' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('title')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'title' ? 'bg-aeria-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('date')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'date' ? 'bg-aeria-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <CategoryFilters selected={categoryFilter} onChange={setCategoryFilter} />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredProcedures.length} of {procedures.length} procedures
        </p>
        {(searchQuery || categoryFilter) && (
          <button
            onClick={() => {
              setSearchQuery('')
              setCategoryFilter(null)
            }}
            className="text-sm text-aeria-navy hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Procedure List/Grid */}
      {filteredProcedures.length === 0 ? (
        <EmptyState
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          onSeedProcedures={procedures.length === 0 ? handleSeedProcedures : null}
          seeding={seeding}
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredProcedures.map(procedure => (
            <ProcedureCard
              key={procedure.id}
              procedure={procedure}
              view="list"
              onUpdate={handleInlineUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProcedures.map(procedure => (
            <ProcedureCard
              key={procedure.id}
              procedure={procedure}
              view="grid"
              onUpdate={handleInlineUpdate}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        procedure={deletingProcedure}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingProcedure(null)}
        deleting={isDeleting}
      />
    </div>
  )
}
