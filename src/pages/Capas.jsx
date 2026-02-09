/**
 * Capas.jsx
 * CAPA (Corrective and Preventive Action) List Page
 * 
 * Displays all CAPAs with filtering, status tracking, and quick actions
 * 
 * @location src/pages/Capas.jsx
 * @action NEW FILE
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  ClipboardCheck,
  Calendar,
  ChevronRight,
  MoreVertical,
  Trash2,
  Eye,
  FileText,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Target,
  ArrowRight,
  Filter
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import {
  getCapas,
  deleteCapa,
  CAPA_STATUS,
  CAPA_TYPES,
  PRIORITY_LEVELS
} from '../lib/firestoreSafety'
import { logger } from '../lib/logger'
import { useOrganization } from '../hooks/useOrganization'

export default function Capas() {
  const { organizationId } = useOrganization()
  const [searchParams, setSearchParams] = useSearchParams()
  const [capas, setCapas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all')
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'all')
  const [menuOpen, setMenuOpen] = useState(null)

  useEffect(() => {
    if (organizationId) {
      loadCapas()
    }
  }, [organizationId])

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('filter', statusFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (priorityFilter !== 'all') params.set('priority', priorityFilter)
    setSearchParams(params)
  }, [statusFilter, typeFilter, priorityFilter])

  const loadCapas = async () => {
    if (!organizationId) return
    setLoading(true)
    try {
      const data = await getCapas(organizationId)
      setCapas(data)
    } catch (err) {
      logger.error('Error loading CAPAs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (capaId, capaNumber) => {
    if (!confirm(`Are you sure you want to delete CAPA "${capaNumber}"? This cannot be undone.`)) {
      return
    }
    
    try {
      await deleteCapa(capaId)
      setCapas(prev => prev.filter(c => c.id !== capaId))
    } catch (err) {
      logger.error('Error deleting CAPA:', err)
      alert('Failed to delete CAPA')
    }
    setMenuOpen(null)
  }

  // Calculate days overdue/remaining
  const getDaysInfo = (capa) => {
    if (!capa.targetDate) return null
    
    const targetDate = capa.targetDate.toDate ? capa.targetDate.toDate() : new Date(capa.targetDate)
    const today = new Date()
    const diff = differenceInDays(targetDate, today)
    
    if (['closed', 'verified_effective', 'verified_ineffective'].includes(capa.status)) {
      return null
    }
    
    if (diff < 0) {
      return { overdue: true, days: Math.abs(diff) }
    }
    
    return { overdue: false, days: diff }
  }

  // Filter CAPAs
  const filteredCapas = capas.filter(capa => {
    const matchesSearch = 
      capa.capaNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capa.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capa.problemStatement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capa.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Handle special filters
    let matchesStatus = true
    if (statusFilter === 'overdue') {
      const daysInfo = getDaysInfo(capa)
      matchesStatus = daysInfo?.overdue === true
    } else if (statusFilter === 'due_soon') {
      const daysInfo = getDaysInfo(capa)
      matchesStatus = daysInfo && !daysInfo.overdue && daysInfo.days <= 7
    } else if (statusFilter !== 'all') {
      matchesStatus = capa.status === statusFilter
    }
    
    const matchesType = typeFilter === 'all' || capa.type === typeFilter
    const matchesPriority = priorityFilter === 'all' || capa.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Not set'
    try {
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue)
      return format(date, 'MMM d, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const getStatusBadge = (status) => {
    const statusInfo = CAPA_STATUS[status]
    if (!statusInfo) return null
    
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityInfo = PRIORITY_LEVELS[priority]
    if (!priorityInfo) return null
    
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityInfo.color}`}>
        {priorityInfo.label}
      </span>
    )
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'corrective':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'preventive':
        return <Target className="w-5 h-5 text-blue-500" />
      case 'improvement':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      default:
        return <ClipboardCheck className="w-5 h-5 text-purple-500" />
    }
  }

  // Stats summary
  const stats = {
    total: filteredCapas.length,
    open: filteredCapas.filter(c => ['open', 'in_progress'].includes(c.status)).length,
    overdue: filteredCapas.filter(c => getDaysInfo(c)?.overdue).length,
    pendingVerification: filteredCapas.filter(c => c.status === 'pending_verification').length,
    effective: filteredCapas.filter(c => c.status === 'verified_effective').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CAPAs</h1>
          <p className="text-gray-600 mt-1">Corrective and Preventive Actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/safety" className="btn-secondary inline-flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Dashboard
          </Link>
          <Link to="/capas/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New CAPA
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card py-3">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="card py-3">
          <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
          <p className="text-sm text-gray-500">Open</p>
        </div>
        <div className="card py-3">
          <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.overdue}
          </p>
          <p className="text-sm text-gray-500">Overdue</p>
        </div>
        <div className="card py-3">
          <p className="text-2xl font-bold text-purple-600">{stats.pendingVerification}</p>
          <p className="text-sm text-gray-500">Pending VOE</p>
        </div>
        <div className="card py-3">
          <p className="text-2xl font-bold text-green-600">{stats.effective}</p>
          <p className="text-sm text-gray-500">Effective</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <label htmlFor="capa-search" className="sr-only">Search CAPAs</label>
          <input
            id="capa-search"
            type="search"
            placeholder="Search CAPAs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <label htmlFor="capa-status-filter" className="sr-only">Filter by status</label>
        <select
          id="capa-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-44"
        >
          <option value="all">All Status</option>
          <option value="overdue">⚠️ Overdue</option>
          <option value="due_soon">⏰ Due Soon (7 days)</option>
          {Object.entries(CAPA_STATUS).map(([key, status]) => (
            <option key={key} value={key}>{status.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input w-full sm:w-40"
        >
          <option value="all">All Types</option>
          {Object.entries(CAPA_TYPES).map(([key, type]) => (
            <option key={key} value={key}>{type.label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="input w-full sm:w-36"
        >
          <option value="all">All Priority</option>
          {Object.entries(PRIORITY_LEVELS).map(([key, level]) => (
            <option key={key} value={key}>{level.label}</option>
          ))}
        </select>
      </div>

      {/* CAPAs List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading CAPAs...</p>
        </div>
      ) : filteredCapas.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          {capas.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No CAPAs yet</h3>
              <p className="text-gray-500 mb-4">
                Create a CAPA to track corrective or preventive actions.
              </p>
              <Link to="/capas/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create CAPA
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No matching CAPAs</h3>
              <p className="text-gray-500">
                Try adjusting your search or filters.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCapas.map((capa) => {
            const daysInfo = getDaysInfo(capa)
            
            return (
              <div 
                key={capa.id} 
                className={`card hover:shadow-md transition-shadow group ${
                  daysInfo?.overdue ? 'border-l-4 border-l-red-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    capa.type === 'corrective' ? 'bg-orange-100' :
                    capa.type === 'preventive' ? 'bg-blue-100' :
                    'bg-green-100'
                  }`}>
                    {getTypeIcon(capa.type)}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link 
                        to={`/capas/${capa.id}`}
                        className="font-semibold text-gray-900 hover:text-aeria-blue"
                      >
                        {capa.capaNumber}
                      </Link>
                      {getStatusBadge(capa.status)}
                      {getPriorityBadge(capa.priority)}
                      {daysInfo?.overdue && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          {daysInfo.days}d overdue
                        </span>
                      )}
                      {daysInfo && !daysInfo.overdue && daysInfo.days <= 7 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          Due in {daysInfo.days}d
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-2 line-clamp-1">
                      {capa.title || capa.problemStatement || 'No description'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1 capitalize">
                        {CAPA_TYPES[capa.type]?.label || capa.type}
                      </span>
                      {capa.targetDate && (
                        <span className={`inline-flex items-center gap-1 ${
                          daysInfo?.overdue ? 'text-red-600' : ''
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {formatDate(capa.targetDate)}
                        </span>
                      )}
                      {capa.assignedTo && (
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {capa.assignedTo}
                        </span>
                      )}
                      {capa.sourceReference && (
                        <span className="inline-flex items-center gap-1 text-purple-600">
                          <FileText className="w-3.5 h-3.5" />
                          {capa.sourceReference}
                        </span>
                      )}
                    </div>
                    
                    {/* Progress indicator for in-progress CAPAs */}
                    {capa.status === 'in_progress' && capa.implementation?.status && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              capa.implementation.status === 'complete' ? 'bg-green-500 w-full' :
                              capa.implementation.status === 'in_progress' ? 'bg-blue-500 w-1/2' :
                              'bg-gray-300 w-0'
                            }`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 capitalize">
                          {capa.implementation.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/capas/${capa.id}`}
                      className="p-2 text-gray-400 hover:text-aeria-blue rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="View details"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                    
                    {/* More menu */}
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === capa.id ? null : capa.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {menuOpen === capa.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpen(null)}
                          />
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <Link
                              to={`/capas/${capa.id}`}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                            <Link
                              to={`/capas/${capa.id}/edit`}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              Edit
                            </Link>
                            {capa.relatedIncidentId && (
                              <Link
                                to={`/incidents/${capa.relatedIncidentId}`}
                                className="w-full px-4 py-2 text-left text-sm text-orange-700 hover:bg-orange-50 flex items-center gap-2"
                              >
                                <AlertTriangle className="w-4 h-4" />
                                View Incident
                              </Link>
                            )}
                            <button
                              onClick={() => handleDelete(capa.id, capa.capaNumber)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination placeholder */}
      {filteredCapas.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredCapas.length} CAPA{filteredCapas.length !== 1 ? 's' : ''}</span>
          <button 
            onClick={loadCapas}
            className="inline-flex items-center gap-1 text-aeria-blue hover:text-aeria-navy"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}
