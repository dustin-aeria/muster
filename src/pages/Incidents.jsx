/**
 * Incidents.jsx
 * Incident List Page for Aeria Ops Safety Module
 * 
 * Displays all incidents with filtering, search, and quick actions
 * 
 * @location src/pages/Incidents.jsx
 * @action NEW FILE
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  AlertCircle,
  Calendar,
  ChevronRight,
  MoreVertical,
  Trash2,
  Eye,
  FileText,
  Clock,
  MapPin,
  User,
  Plane,
  Building2,
  RefreshCw,
  Download,
  Bell
} from 'lucide-react'
import { format } from 'date-fns'
import {
  getIncidents,
  deleteIncident,
  INCIDENT_TYPES,
  SEVERITY_LEVELS,
  INCIDENT_STATUS,
  RPAS_INCIDENT_TYPES
} from '../lib/firestoreSafety'

export default function Incidents() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all')
  const [severityFilter, setSeverityFilter] = useState(searchParams.get('severity') || 'all')
  const [menuOpen, setMenuOpen] = useState(null)

  useEffect(() => {
    loadIncidents()
  }, [])

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (severityFilter !== 'all') params.set('severity', severityFilter)
    setSearchParams(params)
  }, [statusFilter, typeFilter, severityFilter])

  const loadIncidents = async () => {
    setLoading(true)
    try {
      const data = await getIncidents()
      setIncidents(data)
    } catch (err) {
      console.error('Error loading incidents:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (incidentId, incidentNumber) => {
    if (!confirm(`Are you sure you want to delete incident "${incidentNumber}"? This cannot be undone.`)) {
      return
    }
    
    try {
      await deleteIncident(incidentId)
      setIncidents(prev => prev.filter(i => i.id !== incidentId))
    } catch (err) {
      console.error('Error deleting incident:', err)
      alert('Failed to delete incident')
    }
    setMenuOpen(null)
  }

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.incidentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
    const matchesType = typeFilter === 'all' || incident.type === typeFilter
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesSeverity
  })

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown'
    try {
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue)
      return format(date, 'MMM d, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const getSeverityBadge = (severity) => {
    const level = SEVERITY_LEVELS[severity]
    if (!level) return null
    
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
        severity === 'fatal' ? 'bg-black text-white' :
        severity === 'critical' ? 'bg-red-700 text-white' :
        severity === 'serious' ? 'bg-red-500 text-white' :
        severity === 'moderate' ? 'bg-orange-500 text-white' :
        severity === 'minor' ? 'bg-orange-300 text-orange-900' :
        'bg-yellow-200 text-yellow-800'
      }`}>
        {level.label}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const statusInfo = INCIDENT_STATUS[status]
    if (!statusInfo) return null
    
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    )
  }

  const getTypeIcon = (type, rpasType) => {
    if (rpasType) {
      return <Plane className="w-5 h-5 text-sky-600" />
    }
    
    switch (type) {
      case 'near_miss':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'property_damage':
        return <Building2 className="w-5 h-5 text-purple-500" />
      case 'environmental':
        return <MapPin className="w-5 h-5 text-green-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
    }
  }

  const needsNotification = (incident) => {
    const notif = incident.regulatoryNotifications || {}
    return (
      (notif.tsbRequired && !notif.tsbNotified) ||
      (notif.tcRequired && !notif.tcNotified) ||
      (notif.worksafebcRequired && !notif.worksafebcNotified) ||
      !notif.aeriaNotified
    )
  }

  // Stats summary
  const stats = {
    total: filteredIncidents.length,
    open: filteredIncidents.filter(i => !['closed'].includes(i.status)).length,
    nearMiss: filteredIncidents.filter(i => i.type === 'near_miss' || i.severity === 'near_miss').length,
    needsNotification: filteredIncidents.filter(needsNotification).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-600 mt-1">Track and manage safety incidents</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/safety" className="btn-secondary inline-flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Dashboard
          </Link>
          <Link to="/incidents/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Report Incident
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card py-3">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="card py-3">
          <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
          <p className="text-sm text-gray-500">Open</p>
        </div>
        <div className="card py-3">
          <p className="text-2xl font-bold text-yellow-600">{stats.nearMiss}</p>
          <p className="text-sm text-gray-500">Near Misses</p>
        </div>
        <div className="card py-3">
          <p className={`text-2xl font-bold ${stats.needsNotification > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.needsNotification}
          </p>
          <p className="text-sm text-gray-500">Pending Notifications</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-44"
        >
          <option value="all">All Status</option>
          {Object.entries(INCIDENT_STATUS).map(([key, status]) => (
            <option key={key} value={key}>{status.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input w-full sm:w-44"
        >
          <option value="all">All Types</option>
          {Object.entries(INCIDENT_TYPES).map(([key, type]) => (
            <option key={key} value={key}>{type.label}</option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="input w-full sm:w-44"
        >
          <option value="all">All Severity</option>
          {Object.entries(SEVERITY_LEVELS).map(([key, level]) => (
            <option key={key} value={key}>{level.label}</option>
          ))}
        </select>
      </div>

      {/* Incidents List */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading incidents...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="card text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          {incidents.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No incidents recorded</h3>
              <p className="text-gray-500 mb-4">
                That's good news! Report any incidents or near misses here.
              </p>
              <Link to="/incidents/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Report Incident
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No matching incidents</h3>
              <p className="text-gray-500">
                Try adjusting your search or filters.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => (
            <div 
              key={incident.id} 
              className="card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  incident.severity === 'fatal' || incident.severity === 'critical' 
                    ? 'bg-red-100' 
                    : incident.severity === 'near_miss'
                      ? 'bg-yellow-100'
                      : 'bg-orange-100'
                }`}>
                  {getTypeIcon(incident.type, incident.rpasType)}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Link 
                      to={`/incidents/${incident.id}`}
                      className="font-semibold text-gray-900 hover:text-aeria-blue"
                    >
                      {incident.incidentNumber}
                    </Link>
                    {getSeverityBadge(incident.severity)}
                    {getStatusBadge(incident.status)}
                    {needsNotification(incident) && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        Notify
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-2 line-clamp-1">
                    {incident.title || incident.description || 'No description'}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(incident.dateOccurred)}
                    </span>
                    {incident.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {incident.location}
                      </span>
                    )}
                    {incident.projectName && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {incident.projectName}
                      </span>
                    )}
                    {incident.rpasType && (
                      <span className="inline-flex items-center gap-1 text-sky-600">
                        <Plane className="w-3.5 h-3.5" />
                        {RPAS_INCIDENT_TYPES[incident.rpasType]?.label || incident.rpasType}
                      </span>
                    )}
                    {incident.reportedBy && (
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {incident.reportedBy}
                      </span>
                    )}
                  </div>
                  
                  {/* Linked CAPAs */}
                  {incident.linkedCapas?.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-xs text-purple-600">
                        {incident.linkedCapas.length} CAPA{incident.linkedCapas.length > 1 ? 's' : ''} linked
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/incidents/${incident.id}`}
                    className="p-2 text-gray-400 hover:text-aeria-blue rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="View details"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  
                  {/* More menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === incident.id ? null : incident.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {menuOpen === incident.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <Link
                            to={`/incidents/${incident.id}`}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </Link>
                          <Link
                            to={`/incidents/${incident.id}/edit`}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Edit
                          </Link>
                          {incident.status !== 'closed' && (
                            <Link
                              to={`/capas/new?incidentId=${incident.id}`}
                              className="w-full px-4 py-2 text-left text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Create CAPA
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(incident.id, incident.incidentNumber)}
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
          ))}
        </div>
      )}

      {/* Pagination placeholder */}
      {filteredIncidents.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}</span>
          <button 
            onClick={loadIncidents}
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
