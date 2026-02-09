/**
 * IncidentDetail.jsx
 * Incident Detail View with Investigation Workflow
 * 
 * Displays:
 * - Full incident information
 * - Investigation workflow
 * - Root cause analysis tools
 * - Timeline of actions
 * - Linked CAPAs
 * - Regulatory notification tracking
 * 
 * Batch 5 Fix:
 * - Fixed TODO: Now uses auth context for current user name (L-04)
 * 
 * @location src/pages/IncidentDetail.jsx
 * @action REPLACE
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Plane,
  Building2,
  Plus,
  FileText,
  Bell,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Users,
  Wrench,
  MessageSquare,
  Activity,
  Target,
  ClipboardCheck,
  ExternalLink,
  Phone,
  Download
} from 'lucide-react'
import { format } from 'date-fns'
import {
  getIncident,
  updateIncident,
  closeIncident,
  deleteIncident,
  markNotificationComplete,
  INCIDENT_TYPES,
  RPAS_INCIDENT_TYPES,
  SEVERITY_LEVELS,
  INCIDENT_STATUS,
  REGULATORY_TRIGGERS
} from '../lib/firestoreSafety'
import { getCapas } from '../lib/firestoreSafety'
import { exportIncidentReport } from '../lib/safetyExportService'
import {
  SUBSTANDARD_ACTS,
  SUBSTANDARD_CONDITIONS,
  PERSONAL_FACTORS,
  JOB_SYSTEM_FACTORS
} from '../lib/formDefinitions'
import { logger } from '../lib/logger'
import { useOrganization } from '../hooks/useOrganization'

// Collapsible section component
function Section({ title, icon: Icon, children, defaultOpen = true, badge }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-400" />}
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && <div className="mt-4 pt-4 border-t border-gray-100">{children}</div>}
    </div>
  )
}

// Info row component
function InfoRow({ label, value, icon: Icon }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  )
}

// Status badge component
function StatusBadge({ status }) {
  const statusInfo = INCIDENT_STATUS[status]
  if (!statusInfo) return null
  
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
      {statusInfo.label}
    </span>
  )
}

// Severity badge component  
function SeverityBadge({ severity }) {
  const level = SEVERITY_LEVELS[severity]
  if (!level) return null
  
  const colorClass = 
    severity === 'fatal' ? 'bg-black text-white' :
    severity === 'critical' ? 'bg-red-700 text-white' :
    severity === 'serious' ? 'bg-red-500 text-white' :
    severity === 'moderate' ? 'bg-orange-500 text-white' :
    severity === 'minor' ? 'bg-orange-300 text-orange-900' :
    'bg-yellow-200 text-yellow-800'
  
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${colorClass}`}>
      {level.label}
    </span>
  )
}

// Notification card component
function NotificationCard({ type, required, notified, notifiedDate, reference, onMarkComplete, incidentId }) {
  const config = REGULATORY_TRIGGERS[type]
  if (!config || !required) return null
  
  const [marking, setMarking] = useState(false)
  const [refInput, setRefInput] = useState(reference || '')
  
  const handleMarkComplete = async () => {
    setMarking(true)
    try {
      await onMarkComplete(type.toLowerCase().replace('_immediate', ''), refInput)
    } finally {
      setMarking(false)
    }
  }
  
  return (
    <div className={`p-4 rounded-lg border-2 ${
      notified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-300'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {notified ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Bell className="w-5 h-5 text-red-600" />
            )}
            <h4 className={`font-medium ${notified ? 'text-green-900' : 'text-red-900'}`}>
              {config.label}
            </h4>
          </div>
          
          {config.phone && (
            <a 
              href={`tel:${config.phone}`} 
              className={`flex items-center gap-1 mt-1 text-sm ${
                notified ? 'text-green-700' : 'text-red-700 font-bold'
              }`}
            >
              <Phone className="w-3 h-3" />
              {config.phone}
            </a>
          )}
          
          <p className={`text-xs mt-1 ${notified ? 'text-green-600' : 'text-red-600'}`}>
            Timeframe: {config.timeframe}
          </p>
          
          {notified && notifiedDate && (
            <p className="text-xs text-green-600 mt-1">
              Notified: {format(
                notifiedDate.toDate ? notifiedDate.toDate() : new Date(notifiedDate),
                'MMM d, yyyy h:mm a'
              )}
            </p>
          )}
          
          {notified && reference && (
            <p className="text-xs text-green-600 mt-1">
              Reference: {reference}
            </p>
          )}
        </div>
        
        {!notified && (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="Reference #"
              className="input text-sm py-1 px-2 w-32"
            />
            <button
              onClick={handleMarkComplete}
              disabled={marking}
              className="btn-primary text-xs py-1 px-2"
            >
              {marking ? 'Saving...' : 'Mark Complete'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userProfile } = useAuth()
  const { organizationId } = useOrganization()

  // Get display name for current user
  const currentUserName = userProfile
    ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || userProfile.email
    : 'Unknown User'
  
  const [incident, setIncident] = useState(null)
  const [linkedCapas, setLinkedCapas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  // Investigation form state
  const [showInvestigationForm, setShowInvestigationForm] = useState(false)
  const [investigationData, setInvestigationData] = useState({
    assignedTo: '',
    substandardActs: [],
    substandardConditions: [],
    personalFactors: [],
    jobSystemFactors: [],
    fiveWhys: [{ why: 1, answer: '' }],
    findings: '',
    recommendations: ''
  })

  useEffect(() => {
    loadIncident()
  }, [id])

  const loadIncident = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await getIncident(id)
      setIncident(data)
      
      // Load linked CAPAs if any
      if (data.linkedCapas?.length > 0 && organizationId) {
        const capas = await getCapas(organizationId, { incidentId: id })
        setLinkedCapas(capas)
      }
      
      // Pre-populate investigation form
      if (data.investigation) {
        setInvestigationData({
          assignedTo: data.investigation.assignedTo || '',
          substandardActs: data.investigation.immediateCauses?.substandardActs || [],
          substandardConditions: data.investigation.immediateCauses?.substandardConditions || [],
          personalFactors: data.investigation.rootCauses?.personalFactors || [],
          jobSystemFactors: data.investigation.rootCauses?.jobSystemFactors || [],
          fiveWhys: data.investigation.fiveWhys?.length > 0 
            ? data.investigation.fiveWhys 
            : [{ why: 1, answer: '' }],
          findings: data.investigation.findings || '',
          recommendations: data.investigation.recommendations?.join('\n') || ''
        })
      }
    } catch (err) {
      logger.error('Error loading incident:', err)
      setError('Failed to load incident')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    setSaving(true)
    try {
      await updateIncident(id, {
        status: newStatus,
        _previousStatus: incident.status,
        _changedBy: currentUserName,
        _statusChangeNotes: ''
      })
      await loadIncident()
    } catch (err) {
      logger.error('Error updating status:', err)
      alert('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationComplete = async (notificationType, reference) => {
    try {
      await markNotificationComplete(id, notificationType, reference)
      await loadIncident()
    } catch (err) {
      logger.error('Error marking notification complete:', err)
      alert('Failed to update notification status')
    }
  }

  const handleSaveInvestigation = async () => {
    setSaving(true)
    try {
      await updateIncident(id, {
        investigation: {
          ...incident.investigation,
          assigned: !!investigationData.assignedTo,
          assignedTo: investigationData.assignedTo,
          assignedDate: incident.investigation?.assignedDate || new Date().toISOString(),
          immediateCauses: {
            substandardActs: investigationData.substandardActs,
            substandardConditions: investigationData.substandardConditions
          },
          rootCauses: {
            personalFactors: investigationData.personalFactors,
            jobSystemFactors: investigationData.jobSystemFactors
          },
          fiveWhys: investigationData.fiveWhys.filter(w => w.answer),
          findings: investigationData.findings,
          recommendations: investigationData.recommendations.split('\n').filter(r => r.trim())
        },
        status: incident.status === 'reported' ? 'under_investigation' : incident.status,
        _previousStatus: incident.status,
        _changedBy: currentUserName
      })
      await loadIncident()
      setShowInvestigationForm(false)
    } catch (err) {
      logger.error('Error saving investigation:', err)
      alert('Failed to save investigation')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseIncident = async () => {
    if (!confirm('Are you sure you want to close this incident?')) return
    
    setSaving(true)
    try {
      await closeIncident(id, currentUserName, 'Incident closed')
      await loadIncident()
    } catch (err) {
      logger.error('Error closing incident:', err)
      alert('Failed to close incident')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete incident ${incident.incidentNumber}? This cannot be undone.`)) return

    try {
      await deleteIncident(id)
      navigate('/incidents')
    } catch (err) {
      logger.error('Error deleting incident:', err)
      alert('Failed to delete incident')
    }
  }

  const handleExport = async () => {
    if (!incident) return
    setExporting(true)
    try {
      await exportIncidentReport(incident)
    } catch (err) {
      logger.error('Error exporting incident:', err)
      alert('Failed to export incident report')
    } finally {
      setExporting(false)
    }
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown'
    try {
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue)
      return format(date, 'MMM d, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'Unknown'
    try {
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue)
      return format(date, 'MMM d, yyyy h:mm a')
    } catch {
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="card text-center py-16">
          <div className="w-12 h-12 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading incident...</p>
        </div>
      </div>
    )
  }

  if (error || !incident) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Incident Not Found</h1>
        </div>
        <div className="card border-red-200 bg-red-50 text-center py-8">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium text-red-900 mb-1">{error || 'Incident not found'}</h3>
          <Link to="/incidents" className="btn-primary mt-4">
            Back to Incidents
          </Link>
        </div>
      </div>
    )
  }

  const notif = incident.regulatoryNotifications || {}
  const hasRequiredNotifications = notif.tsbRequired || notif.tcRequired || notif.worksafebcRequired
  const hasPendingNotifications = (notif.tsbRequired && !notif.tsbNotified) ||
    (notif.tcRequired && !notif.tcNotified) ||
    (notif.worksafebcRequired && !notif.worksafebcNotified)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{incident.incidentNumber}</h1>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <p className="text-gray-600 mt-1">{incident.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-secondary inline-flex items-center gap-2"
            title="Export as PDF"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
          {incident.status !== 'closed' && (
            <>
              <Link
                to={`/capas/new?incidentId=${id}&sourceReference=${incident.incidentNumber}`}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create CAPA
              </Link>
              <Link
                to={`/incidents/${id}/edit`}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </>
          )}
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
            title="Delete incident"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pending Notifications Warning */}
      {hasPendingNotifications && (
        <div className="p-4 rounded-lg border-2 bg-red-50 border-red-300">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-bold text-red-900">Action Required: Regulatory Notifications Pending</h3>
              <p className="text-sm text-red-700">Complete the required notifications below before proceeding.</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Actions */}
      {incident.status !== 'closed' && (
        <div className="card bg-gray-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <StatusBadge status={incident.status} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {incident.status === 'reported' && (
                <button
                  onClick={() => handleStatusChange('under_investigation')}
                  disabled={saving}
                  className="btn-primary text-sm"
                >
                  Start Investigation
                </button>
              )}
              {incident.status === 'under_investigation' && (
                <button
                  onClick={() => handleStatusChange('root_cause_identified')}
                  disabled={saving}
                  className="btn-primary text-sm"
                >
                  Root Cause Identified
                </button>
              )}
              {incident.status === 'root_cause_identified' && (
                <button
                  onClick={() => handleStatusChange('capa_in_progress')}
                  disabled={saving}
                  className="btn-primary text-sm"
                >
                  CAPA In Progress
                </button>
              )}
              {incident.status === 'capa_in_progress' && (
                <button
                  onClick={() => handleStatusChange('pending_verification')}
                  disabled={saving}
                  className="btn-primary text-sm"
                >
                  Pending Verification
                </button>
              )}
              {incident.status === 'pending_verification' && (
                <button
                  onClick={handleCloseIncident}
                  disabled={saving}
                  className="btn-primary text-sm bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Close Incident
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Details */}
          <Section title="Incident Details" icon={AlertTriangle} defaultOpen={true}>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow label="Type" value={INCIDENT_TYPES[incident.type]?.label} icon={AlertCircle} />
              <InfoRow label="Severity" value={SEVERITY_LEVELS[incident.severity]?.label} icon={AlertTriangle} />
              <InfoRow label="Date Occurred" value={formatDate(incident.dateOccurred)} icon={Calendar} />
              <InfoRow label="Time" value={incident.timeOccurred} icon={Clock} />
              <InfoRow label="Location" value={incident.location} icon={MapPin} />
              <InfoRow label="Reported By" value={incident.reportedBy} icon={User} />
              {incident.rpasType && (
                <InfoRow 
                  label="RPAS Incident Type" 
                  value={RPAS_INCIDENT_TYPES[incident.rpasType]?.label} 
                  icon={Plane} 
                />
              )}
              {incident.projectName && (
                <InfoRow label="Project" value={incident.projectName} icon={Building2} />
              )}
              {incident.aircraftName && (
                <InfoRow label="Aircraft" value={incident.aircraftName} icon={Plane} />
              )}
            </div>
            
            {incident.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{incident.description}</p>
              </div>
            )}
            
            {incident.immediateActions && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Immediate Actions Taken</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{incident.immediateActions}</p>
              </div>
            )}
          </Section>

          {/* Regulatory Notifications */}
          {hasRequiredNotifications && (
            <Section title="Regulatory Notifications" icon={Bell} defaultOpen={hasPendingNotifications}>
              <div className="space-y-3">
                <NotificationCard
                  type="TSB_IMMEDIATE"
                  required={notif.tsbRequired}
                  notified={notif.tsbNotified}
                  notifiedDate={notif.tsbNotifiedDate}
                  reference={notif.tsbReference}
                  onMarkComplete={handleNotificationComplete}
                  incidentId={id}
                />
                <NotificationCard
                  type="TRANSPORT_CANADA"
                  required={notif.tcRequired}
                  notified={notif.tcNotified}
                  notifiedDate={notif.tcNotifiedDate}
                  reference={notif.tcReference}
                  onMarkComplete={handleNotificationComplete}
                  incidentId={id}
                />
                <NotificationCard
                  type="WORKSAFEBC"
                  required={notif.worksafebcRequired}
                  notified={notif.worksafebcNotified}
                  notifiedDate={notif.worksafebcNotifiedDate}
                  reference={notif.worksafebcReference}
                  onMarkComplete={handleNotificationComplete}
                  incidentId={id}
                />
                
                {/* Aeria Internal */}
                <div className={`p-4 rounded-lg border ${
                  notif.aeriaNotified ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {notif.aeriaNotified ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Bell className="w-5 h-5 text-blue-600" />
                      )}
                      <div>
                        <h4 className={`font-medium ${notif.aeriaNotified ? 'text-green-900' : 'text-blue-900'}`}>
                          Accountable Executive
                        </h4>
                        <p className="text-sm">Contact your organization's Accountable Executive</p>
                      </div>
                    </div>
                    {!notif.aeriaNotified && (
                      <button
                        onClick={() => handleNotificationComplete('aeria', '')}
                        className="btn-secondary text-sm"
                      >
                        Mark Notified
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* People Involved */}
          {incident.involvedPersons?.length > 0 && (
            <Section title="People Involved" icon={Users} badge={incident.involvedPersons.length}>
              <div className="space-y-3">
                {incident.involvedPersons.map((person, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{person.name || `Person ${idx + 1}`}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        person.injuryType === 'fatality' ? 'bg-black text-white' :
                        person.injuryType === 'hospitalization' ? 'bg-red-100 text-red-700' :
                        person.injuryType === 'lost_time' ? 'bg-orange-100 text-orange-700' :
                        person.injuryType === 'medical_aid' ? 'bg-yellow-100 text-yellow-700' :
                        person.injuryType === 'first_aid' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {person.injuryType?.replace(/_/g, ' ') || 'No injury'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {person.role && <div><span className="text-gray-500">Role:</span> {person.role}</div>}
                      {person.daysLost > 0 && <div><span className="text-gray-500">Days Lost:</span> {person.daysLost}</div>}
                      {person.injuryDescription && (
                        <div className="col-span-2"><span className="text-gray-500">Injury:</span> {person.injuryDescription}</div>
                      )}
                      {person.treatmentReceived && (
                        <div className="col-span-2"><span className="text-gray-500">Treatment:</span> {person.treatmentReceived}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Equipment Damage */}
          {incident.equipmentDamage?.length > 0 && (
            <Section title="Equipment Damage" icon={Wrench} badge={incident.equipmentDamage.length}>
              <div className="space-y-3">
                {incident.equipmentDamage.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{item.item || `Item ${idx + 1}`}</span>
                      {item.estimatedCost > 0 && (
                        <span className="text-sm text-gray-600">${item.estimatedCost.toLocaleString()}</span>
                      )}
                    </div>
                    {item.damageDescription && (
                      <p className="text-sm text-gray-600">{item.damageDescription}</p>
                    )}
                    <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                      item.repairable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.repairable ? 'Repairable' : 'Not Repairable'}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Investigation */}
          <Section 
            title="Investigation" 
            icon={Target} 
            defaultOpen={incident.status !== 'reported'}
          >
            {!showInvestigationForm ? (
              <div>
                {incident.investigation?.assignedTo ? (
                  <div className="space-y-4">
                    <InfoRow label="Assigned To" value={incident.investigation.assignedTo} icon={User} />
                    
                    {incident.investigation.immediateCauses?.substandardActs?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Substandard Acts</p>
                        <div className="flex flex-wrap gap-1">
                          {incident.investigation.immediateCauses.substandardActs.map((act, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {incident.investigation.immediateCauses?.substandardConditions?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Substandard Conditions</p>
                        <div className="flex flex-wrap gap-1">
                          {incident.investigation.immediateCauses.substandardConditions.map((cond, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                              {cond}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {incident.investigation.findings && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Findings</p>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{incident.investigation.findings}</p>
                      </div>
                    )}
                    
                    {incident.investigation.recommendations?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Recommendations</p>
                        <ul className="list-disc list-inside text-sm text-gray-900 space-y-1">
                          {incident.investigation.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowInvestigationForm(true)}
                      className="btn-secondary text-sm mt-4"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Investigation
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 mb-4">No investigation data recorded yet</p>
                    <button
                      onClick={() => setShowInvestigationForm(true)}
                      className="btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Start Investigation
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={investigationData.assignedTo}
                    onChange={(e) => setInvestigationData(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="input"
                    placeholder="Investigator name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Substandard Acts (Immediate Causes)</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBSTANDARD_ACTS.map((act) => (
                      <label key={act} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={investigationData.substandardActs.includes(act)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInvestigationData(prev => ({
                                ...prev,
                                substandardActs: [...prev.substandardActs, act]
                              }))
                            } else {
                              setInvestigationData(prev => ({
                                ...prev,
                                substandardActs: prev.substandardActs.filter(a => a !== act)
                              }))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        {act}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Substandard Conditions (Immediate Causes)</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBSTANDARD_CONDITIONS.map((cond) => (
                      <label key={cond} className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={investigationData.substandardConditions.includes(cond)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInvestigationData(prev => ({
                                ...prev,
                                substandardConditions: [...prev.substandardConditions, cond]
                              }))
                            } else {
                              setInvestigationData(prev => ({
                                ...prev,
                                substandardConditions: prev.substandardConditions.filter(c => c !== cond)
                              }))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        {cond}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
                  <textarea
                    value={investigationData.findings}
                    onChange={(e) => setInvestigationData(prev => ({ ...prev, findings: e.target.value }))}
                    className="input"
                    rows={4}
                    placeholder="Summary of investigation findings..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations (one per line)</label>
                  <textarea
                    value={investigationData.recommendations}
                    onChange={(e) => setInvestigationData(prev => ({ ...prev, recommendations: e.target.value }))}
                    className="input"
                    rows={3}
                    placeholder="Enter recommendations, one per line..."
                  />
                </div>
                
                <div className="flex items-center gap-2 pt-4">
                  <button
                    onClick={handleSaveInvestigation}
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Saving...' : 'Save Investigation'}
                  </button>
                  <button
                    onClick={() => setShowInvestigationForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Linked CAPAs */}
          <Section 
            title="Linked CAPAs" 
            icon={ClipboardCheck} 
            badge={linkedCapas.length || incident.linkedCapas?.length}
          >
            {linkedCapas.length > 0 ? (
              <div className="space-y-2">
                {linkedCapas.map((capa) => (
                  <Link
                    key={capa.id}
                    to={`/capas/${capa.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{capa.capaNumber}</span>
                      <p className="text-sm text-gray-600 line-clamp-1">{capa.title}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-4">No CAPAs linked to this incident</p>
                {incident.status !== 'closed' && (
                  <Link
                    to={`/capas/new?incidentId=${id}&sourceReference=${incident.incidentNumber}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create CAPA
                  </Link>
                )}
              </div>
            )}
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              Timeline
            </h3>
            
            {incident.timeline?.length > 0 ? (
              <div className="space-y-4">
                {incident.timeline.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-aeria-blue flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(entry.date)} by {entry.by}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No timeline entries</p>
            )}
          </div>

          {/* Witnesses */}
          {incident.witnesses?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                Witnesses ({incident.witnesses.length})
              </h3>
              <div className="space-y-3">
                {incident.witnesses.map((witness, idx) => (
                  <div key={idx} className="p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-900">{witness.name}</p>
                    {witness.contact && (
                      <p className="text-xs text-gray-500">{witness.contact}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {incident.metrics && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Metrics</h3>
              <div className="space-y-2">
                {incident.metrics.reportingDelay !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reporting Delay</span>
                    <span className="text-gray-900">{incident.metrics.reportingDelay} days</span>
                  </div>
                )}
                {incident.metrics.totalResolutionTime !== undefined && incident.status === 'closed' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Resolution Time</span>
                    <span className="text-gray-900">{incident.metrics.totalResolutionTime} days</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/incidents"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Incidents
              </Link>
              <Link
                to="/safety"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
              >
                <Activity className="w-4 h-4" />
                Safety Dashboard
              </Link>
              {incident.projectId && (
                <Link
                  to={`/projects/${incident.projectId}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
                >
                  <Building2 className="w-4 h-4" />
                  View Project
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
