/**
 * SafetyDashboard.jsx
 * Main Safety KPI Dashboard for Aeria Ops
 * 
 * Includes COR Program Report export functionality
 * 
 * @location src/pages/SafetyDashboard.jsx
 * @action REPLACE
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  AlertCircle,
  ClipboardCheck,
  Plus,
  RefreshCw,
  Bell,
  Target,
  ChevronRight,
  FileText,
  Download,
  Loader2,
  FileDown
} from 'lucide-react'
import { logger } from '../lib/logger'
import CostOfSafetyWidget from '../components/safety/CostOfSafetyWidget'

// Stat card component
function StatCard({ title, value, subtitle, icon: Icon, color = 'bg-white', link }) {
  const content = (
    <div className={`card hover:shadow-md transition-shadow ${link ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {link && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-sm text-aeria-blue">
          View details <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </div>
  )
  
  if (link) {
    return <Link to={link}>{content}</Link>
  }
  return content
}

// Hero metric component
function DaysSinceIncidentCard({ days, lastIncident }) {
  const getColorClass = (d) => {
    if (d === null) return 'from-gray-600 to-gray-700'
    if (d >= 365) return 'from-green-600 to-green-700'
    if (d >= 90) return 'from-green-500 to-green-600'
    if (d >= 30) return 'from-yellow-500 to-yellow-600'
    if (d >= 7) return 'from-orange-500 to-orange-600'
    return 'from-red-500 to-red-600'
  }
  
  const getMessage = (d) => {
    if (d === null) return 'No recordable incidents on record'
    if (d >= 365) return 'Outstanding safety record!'
    if (d >= 90) return 'Excellent safety performance'
    if (d >= 30) return 'Good progress - keep it up'
    if (d >= 7) return 'Stay vigilant'
    return 'Focus on safety'
  }
  
  return (
    <div className={`card bg-gradient-to-br ${getColorClass(days)} text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">Days Since Last Recordable Incident</p>
          <p className="text-6xl font-bold mt-2">
            {days !== null ? days : '∞'}
          </p>
          <p className="text-white/80 text-sm mt-2">{getMessage(days)}</p>
          {lastIncident && (
            <p className="text-white/60 text-xs mt-1">
              Last: {lastIncident.title || lastIncident.incidentNumber}
            </p>
          )}
        </div>
        <div className="p-4 bg-white/20 rounded-2xl">
          <Shield className="w-16 h-16 text-white" />
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function SafetyDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [exporting, setExporting] = useState(false)
  
  // Dashboard data with safe defaults
  const [stats, setStats] = useState({
    daysSinceIncident: null,
    lastIncident: null,
    ytdIncidents: 0,
    ytdNearMisses: 0,
    openCapas: 0,
    overdueCapas: 0,
    capaOnTimeRate: 100,
    pendingNotifications: 0
  })

  // Raw data for Cost of Safety widget
  const [rawIncidents, setRawIncidents] = useState([])
  const [rawTraining, setRawTraining] = useState([])
  const [rawInsurance, setRawInsurance] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Import dynamically to handle potential errors
      const { 
        getIncidents, 
        getCapas 
      } = await import('../lib/firestoreSafety')
      
      // Get basic counts - these are simple queries that don't need indexes
      const [incidents, capas] = await Promise.all([
        getIncidents({}).catch(() => []),
        getCapas({}).catch(() => [])
      ])
      
      // Calculate stats from raw data
      const now = new Date()
      const yearStart = new Date(now.getFullYear(), 0, 1)
      
      // Filter YTD incidents
      const ytdIncidents = incidents.filter(i => {
        const date = i.dateOccurred?.toDate ? i.dateOccurred.toDate() : new Date(i.dateOccurred)
        return date >= yearStart
      })
      
      const recordableIncidents = ytdIncidents.filter(i => i.type !== 'near_miss')
      const nearMisses = ytdIncidents.filter(i => i.type === 'near_miss')
      
      // Find last recordable incident
      const sortedRecordable = recordableIncidents.sort((a, b) => {
        const dateA = a.dateOccurred?.toDate ? a.dateOccurred.toDate() : new Date(a.dateOccurred)
        const dateB = b.dateOccurred?.toDate ? b.dateOccurred.toDate() : new Date(b.dateOccurred)
        return dateB - dateA
      })
      
      let daysSince = null
      let lastIncident = null
      if (sortedRecordable.length > 0) {
        lastIncident = sortedRecordable[0]
        const lastDate = lastIncident.dateOccurred?.toDate 
          ? lastIncident.dateOccurred.toDate() 
          : new Date(lastIncident.dateOccurred)
        daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
      }
      
      // CAPA stats
      const openCapas = capas.filter(c => !['closed', 'verified_effective'].includes(c.status))
      const overdueCapas = openCapas.filter(c => {
        if (!c.targetDate) return false
        const target = c.targetDate?.toDate ? c.targetDate.toDate() : new Date(c.targetDate)
        return target < now
      })
      
      // Pending notifications
      const pendingNotifications = incidents.filter(i => {
        const notif = i.regulatoryNotifications || {}
        return (notif.tsbRequired && !notif.tsbNotified) ||
               (notif.tcRequired && !notif.tcNotified) ||
               (notif.worksafebcRequired && !notif.worksafebcNotified)
      })
      
      setStats({
        daysSinceIncident: daysSince,
        lastIncident,
        ytdIncidents: recordableIncidents.length,
        ytdNearMisses: nearMisses.length,
        openCapas: openCapas.length,
        overdueCapas: overdueCapas.length,
        capaOnTimeRate: capas.length > 0 ? Math.round((capas.filter(c => c.metrics?.onTime).length / capas.length) * 100) : 100,
        pendingNotifications: pendingNotifications.length
      })

      // Store raw data for Cost of Safety widget
      setRawIncidents(incidents)

      // Try to load training and insurance data
      try {
        const { getAllTrainingRecords } = await import('../lib/firestoreTraining')
        const { getInsurancePolicies } = await import('../lib/firestore')
        const [trainingData, insuranceData] = await Promise.all([
          getAllTrainingRecords().catch(() => []),
          getInsurancePolicies().catch(() => [])
        ])
        setRawTraining(trainingData)
        setRawInsurance(insuranceData)
      } catch (err) {
        // Non-critical - Cost of Safety widget will work with partial data
        logger.warn('Could not load training/insurance data for Cost of Safety widget:', err)
      }

      setLastRefresh(new Date())
    } catch (err) {
      logger.error('Error loading safety dashboard:', err)
      setError('Failed to load safety data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // COR Program Report Export
  const handleExportCORReport = async () => {
    setExporting(true)
    
    try {
      // Import all needed functions
      const { getIncidents, getCapas } = await import('../lib/firestoreSafety')
      const { getProjects, getOperators, getAircraft, getClients } = await import('../lib/firestore')
      const { exportCORReport } = await import('../lib/corReportGenerator')
      
      // Gather all data
      const [incidents, capas, projects, operators, aircraft, clients] = await Promise.all([
        getIncidents({}).catch(() => []),
        getCapas({}).catch(() => []),
        getProjects().catch(() => []),
        getOperators().catch(() => []),
        getAircraft().catch(() => []),
        getClients().catch(() => [])
      ])
      
      // Gather all forms from projects
      const forms = []
      projects.forEach(p => {
        if (p.forms && Array.isArray(p.forms)) {
          forms.push(...p.forms.map(f => ({ ...f, projectId: p.id })))
        }
      })
      
      // Generate the report
      const data = {
        incidents,
        capas,
        forms,
        operators,
        projects,
        aircraft,
        clients
      }
      
      await exportCORReport(data, {
        includeAppendices: true
      })
      
    } catch (err) {
      logger.error('Error exporting COR report:', err)
      alert('Failed to generate COR Program Report. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const formatRefreshTime = () => {
    if (!lastRefresh) return ''
    return lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Safety Dashboard</h1>
            <p className="text-gray-600 mt-1">Loading safety metrics...</p>
          </div>
        </div>
        <div className="card text-center py-16">
          <div className="w-12 h-12 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading safety data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Safety Dashboard</h1>
            <p className="text-gray-600 mt-1">Safety performance overview</p>
          </div>
        </div>
        <div className="card border-red-200 bg-red-50 text-center py-8">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium text-red-900 mb-1">Failed to Load</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button onClick={loadDashboardData} className="btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Safety Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Safety performance overview
            {lastRefresh && (
              <span className="text-gray-400 ml-2">• Updated {formatRefreshTime()}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCORReport}
            disabled={exporting}
            className="btn-secondary inline-flex items-center gap-2"
            title="Export COR Program Report"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                COR Report
              </>
            )}
          </button>
          <button
            onClick={loadDashboardData}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link to="/incidents/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Report Incident
          </Link>
        </div>
      </div>

      {/* COR Export Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">COR Audit Documentation</h3>
            <p className="text-sm text-blue-700 mt-1">
              Generate a comprehensive Health & Safety Program Report for COR audit preparation. 
              Includes all incidents, CAPAs, training records, inspections, and KPIs.
            </p>
          </div>
          <button
            onClick={handleExportCORReport}
            disabled={exporting}
            className="btn-primary text-sm whitespace-nowrap"
          >
            {exporting ? 'Generating...' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Hero Metric */}
      <DaysSinceIncidentCard 
        days={stats.daysSinceIncident} 
        lastIncident={stats.lastIncident} 
      />

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="YTD Incidents"
          value={stats.ytdIncidents}
          subtitle="Recordable incidents"
          icon={AlertTriangle}
          color="bg-red-100 text-red-600"
          link="/incidents"
        />
        <StatCard
          title="Near Misses"
          value={stats.ytdNearMisses}
          subtitle="YTD reported"
          icon={AlertCircle}
          color="bg-yellow-100 text-yellow-600"
          link="/incidents?type=near_miss"
        />
        <StatCard
          title="Open CAPAs"
          value={stats.openCapas}
          subtitle={stats.overdueCapas > 0 ? `${stats.overdueCapas} overdue` : 'None overdue'}
          icon={Target}
          color={stats.overdueCapas > 0 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}
          link="/capas"
        />
        <StatCard
          title="CAPA On-Time Rate"
          value={`${stats.capaOnTimeRate}%`}
          subtitle="Completion rate"
          icon={CheckCircle2}
          color="bg-green-100 text-green-600"
          link="/capas"
        />
      </div>

      {/* Cost of Safety & Action Items Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Action Items */}
        <div className="lg:col-span-2">
          {(stats.overdueCapas > 0 || stats.pendingNotifications > 0) ? (
            <div className="card border-orange-200 bg-orange-50 h-full">
              <h2 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Action Items Requiring Attention
              </h2>
              <div className="space-y-2">
                {stats.pendingNotifications > 0 && (
                  <Link
                    to="/incidents?filter=pending_notification"
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Bell className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Pending Regulatory Notifications</p>
                        <p className="text-sm text-gray-500">{stats.pendingNotifications} incident(s) require notification</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                )}
                {stats.overdueCapas > 0 && (
                  <Link
                    to="/capas?filter=overdue"
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Clock className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Overdue CAPAs</p>
                        <p className="text-sm text-gray-500">{stats.overdueCapas} CAPA(s) past target date</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="card border-green-200 bg-green-50 h-full">
              <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                All Clear
              </h2>
              <p className="text-green-700">No pending action items. Keep up the great safety culture!</p>
            </div>
          )}
        </div>

        {/* Cost of Safety Widget */}
        <CostOfSafetyWidget
          incidents={rawIncidents}
          training={rawTraining}
          insurance={rawInsurance}
        />
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/incidents" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Incident Register</h3>
              <p className="text-sm text-gray-500">View and manage incidents</p>
            </div>
          </div>
        </Link>
        
        <Link to="/capas" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">CAPA Register</h3>
              <p className="text-sm text-gray-500">Corrective & preventive actions</p>
            </div>
          </div>
        </Link>
        
        <Link to="/incidents/new" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Report Incident</h3>
              <p className="text-sm text-gray-500">Submit a new incident report</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Emergency Contacts */}
      <div className="card bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">TSB (Aircraft Occurrence)</p>
            <p className="text-gray-900">1-800-387-3557</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Aeria Operations</p>
            <p className="text-gray-900">604-849-2345</p>
          </div>
        </div>
      </div>
    </div>
  )
}
