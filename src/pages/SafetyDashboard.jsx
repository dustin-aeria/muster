/**
 * SafetyDashboard.jsx
 * Main Safety KPI Dashboard for Aeria Ops
 * 
 * Displays:
 * - Days Since Last Incident (hero metric)
 * - Leading & Lagging indicators
 * - Incident trends
 * - CAPA status
 * - Action items requiring attention
 * 
 * @location src/pages/SafetyDashboard.jsx
 * @action NEW FILE
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileWarning,
  ClipboardCheck,
  Activity,
  Calendar,
  ArrowRight,
  Plus,
  RefreshCw,
  Bell,
  Target,
  BarChart3,
  PieChart,
  Users,
  Plane,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import {
  getSafetyDashboardData,
  getIncidentTrendData,
  INCIDENT_STATUS,
  CAPA_STATUS,
  SEVERITY_LEVELS,
  PRIORITY_LEVELS,
  REGULATORY_TRIGGERS
} from '../lib/firestoreSafety'

// Simple bar chart component (no external dependencies)
function TrendChart({ data, height = 120 }) {
  if (!data || data.length === 0) return null
  
  const maxValue = Math.max(...data.map(d => d.total), 1)
  
  return (
    <div className="flex items-end gap-1 h-full" style={{ height }}>
      {data.map((item, index) => {
        const barHeight = (item.total / maxValue) * 100
        const hasIncident = item.total > 0
        
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className={`w-full rounded-t transition-all ${
                item.recordable > 0 
                  ? 'bg-red-400' 
                  : item.nearMiss > 0 
                    ? 'bg-yellow-400' 
                    : 'bg-green-400'
              }`}
              style={{ height: `${Math.max(barHeight, 4)}%` }}
              title={`${item.month}: ${item.total} incidents (${item.recordable} recordable, ${item.nearMiss} near miss)`}
            />
            <span className="text-[10px] text-gray-500 truncate w-full text-center">
              {item.month.split(' ')[0]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Stat card component
function StatCard({ title, value, subtitle, icon: Icon, color, trend, trendUp, link }) {
  const content = (
    <div className={`card hover:shadow-md transition-shadow ${link ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trendUp ? 'text-red-600' : 'text-green-600'
            }`}>
              {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{trend}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${color || 'bg-gray-100'}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </div>
  )
  
  if (link) {
    return <Link to={link}>{content}</Link>
  }
  
  return content
}

// Action item card
function ActionItemCard({ type, title, subtitle, count, items, link, priority }) {
  const priorityColors = {
    critical: 'border-l-red-600 bg-red-50',
    high: 'border-l-orange-500 bg-orange-50',
    medium: 'border-l-yellow-500 bg-yellow-50',
    low: 'border-l-green-500 bg-green-50',
    default: 'border-l-blue-500 bg-blue-50',
  }
  
  return (
    <div className={`card border-l-4 ${priorityColors[priority] || priorityColors.default}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">{title}</h3>
            {count > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">
                {count}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          
          {items && items.length > 0 && (
            <ul className="mt-3 space-y-2">
              {items.slice(0, 3).map((item, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  {item.title || item.capaNumber || item.incidentNumber || 'Item'}
                  {item.daysOverdue && (
                    <span className="text-xs text-red-600 font-medium">
                      ({item.daysOverdue}d overdue)
                    </span>
                  )}
                </li>
              ))}
              {items.length > 3 && (
                <li className="text-sm text-gray-500">
                  +{items.length - 3} more...
                </li>
              )}
            </ul>
          )}
        </div>
        
        {link && (
          <Link 
            to={link}
            className="p-2 text-gray-400 hover:text-aeria-blue rounded-lg hover:bg-white/50"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        )}
      </div>
    </div>
  )
}

// Hero metric - Days Since Last Incident
function DaysSinceIncident({ days, lastIncident }) {
  const getColorClass = (days) => {
    if (days === null) return 'from-gray-600 to-gray-700'
    if (days >= 365) return 'from-green-600 to-emerald-700'
    if (days >= 90) return 'from-green-500 to-green-600'
    if (days >= 30) return 'from-yellow-500 to-yellow-600'
    if (days >= 7) return 'from-orange-500 to-orange-600'
    return 'from-red-500 to-red-600'
  }
  
  const getMessage = (days) => {
    if (days === null) return 'No recordable incidents on file'
    if (days >= 365) return 'Outstanding safety record!'
    if (days >= 90) return 'Excellent safety performance'
    if (days >= 30) return 'Good safety streak - keep it up!'
    if (days >= 7) return 'Stay vigilant'
    return 'Recent incident - review lessons learned'
  }
  
  return (
    <div className={`card bg-gradient-to-br ${getColorClass(days)} text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">Days Since Last Recordable Incident</p>
          <p className="text-6xl font-bold mt-2">
            {days !== null ? days : '—'}
          </p>
          <p className="text-white/80 text-sm mt-2">{getMessage(days)}</p>
          {lastIncident && (
            <p className="text-white/60 text-xs mt-1">
              Last: {lastIncident.title || lastIncident.incidentNumber} 
              {lastIncident.dateOccurred && ` on ${new Date(
                lastIncident.dateOccurred.toDate ? lastIncident.dateOccurred.toDate() : lastIncident.dateOccurred
              ).toLocaleDateString()}`}
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
  const [dashboardData, setDashboardData] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [dashboard, trends] = await Promise.all([
        getSafetyDashboardData(),
        getIncidentTrendData(12)
      ])
      
      setDashboardData(dashboard)
      setTrendData(trends)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error loading safety dashboard:', err)
      setError('Failed to load safety data. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <p className="text-gray-500">Loading safety dashboard...</p>
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
            <p className="text-gray-600 mt-1">Safety KPIs and metrics</p>
          </div>
        </div>
        <div className="card border-red-200 bg-red-50 text-center py-8">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium text-red-900 mb-1">{error}</h3>
          <button 
            onClick={loadDashboardData}
            className="btn-primary mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const data = dashboardData || {}
  const incidents = data.incidents || {}
  const capas = data.capas || {}
  const actionItems = data.actionItems || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Safety Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Safety KPIs and operational metrics
            {lastRefresh && (
              <span className="text-gray-400 text-sm ml-2">
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadDashboardData}
            className="btn-secondary inline-flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link to="/incidents/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Report Incident
          </Link>
        </div>
      </div>

      {/* Hero Metric - Days Since Last Incident */}
      <DaysSinceIncident 
        days={data.daysSinceLastIncident} 
        lastIncident={data.lastIncidentInfo}
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="YTD Incidents"
          value={incidents.ytd?.total || 0}
          subtitle={`${incidents.ytd?.recordable || 0} recordable`}
          icon={AlertTriangle}
          color="bg-orange-500"
          link="/incidents"
        />
        <StatCard
          title="Near Misses (YTD)"
          value={incidents.ytd?.nearMiss || 0}
          subtitle={`Ratio: ${incidents.nearMissRatio?.ratio || 'N/A'}`}
          icon={AlertCircle}
          color="bg-yellow-500"
          link="/incidents?type=near_miss"
        />
        <StatCard
          title="Open CAPAs"
          value={capas.open || 0}
          subtitle={`${capas.overdue || 0} overdue`}
          icon={ClipboardCheck}
          color={capas.overdue > 0 ? 'bg-red-500' : 'bg-blue-500'}
          link="/capas"
        />
        <StatCard
          title="CAPA On-Time Rate"
          value={capas.onTimeRate !== null ? `${capas.onTimeRate}%` : '—'}
          subtitle={`Effectiveness: ${capas.effectivenessRate || '—'}%`}
          icon={Target}
          color={capas.onTimeRate >= 80 ? 'bg-green-500' : 'bg-amber-500'}
          link="/capas"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Trends & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Trend Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Incident Trends (12 Months)</h2>
              <Link 
                to="/incidents" 
                className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {trendData.length > 0 ? (
              <div>
                <TrendChart data={trendData} height={140} />
                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-400" />
                    No incidents
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-yellow-400" />
                    Near miss only
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-red-400" />
                    Recordable
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No incident data available</p>
              </div>
            )}
          </div>

          {/* Incident Breakdown */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* By Severity */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">YTD By Severity</h3>
              <div className="space-y-2">
                {Object.entries(SEVERITY_LEVELS).map(([key, level]) => {
                  const count = incidents.ytd?.bySeverity?.[key] || 0
                  const total = incidents.ytd?.total || 1
                  const percentage = Math.round((count / total) * 100) || 0
                  
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded ${level.color}`} />
                      <span className="text-sm text-gray-600 flex-1">{level.label}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${level.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* By Type */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">YTD By Type</h3>
              <div className="space-y-2">
                {Object.entries(incidents.ytd?.byType || {})
                  .filter(([_, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))
                }
                {Object.values(incidents.ytd?.byType || {}).every(c => c === 0) && (
                  <p className="text-sm text-gray-500 text-center py-2">No incidents</p>
                )}
              </div>
            </div>
          </div>

          {/* CAPA Summary */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">CAPA Status</h2>
              <Link 
                to="/capas" 
                className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Object.entries(CAPA_STATUS).map(([key, status]) => {
                const count = capas.byStatus?.[key] || 0
                return (
                  <div key={key} className="text-center">
                    <div className={`px-2 py-1 rounded-lg ${status.color} mb-1`}>
                      <span className="text-lg font-bold">{count}</span>
                    </div>
                    <span className="text-xs text-gray-500">{status.label}</span>
                  </div>
                )
              })}
            </div>
            
            {/* CAPA Metrics */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {capas.avgDaysToClose || '—'}
                </p>
                <p className="text-xs text-gray-500">Avg Days to Close</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {capas.onTimeRate !== null ? `${capas.onTimeRate}%` : '—'}
                </p>
                <p className="text-xs text-gray-500">On-Time Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {capas.effectivenessRate !== null ? `${capas.effectivenessRate}%` : '—'}
                </p>
                <p className="text-xs text-gray-500">Effectiveness</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Action Items */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Action Required</h2>
          
          {/* Pending Regulatory Notifications */}
          {actionItems.pendingNotifications?.length > 0 && (
            <ActionItemCard
              type="notification"
              title="Pending Notifications"
              subtitle="Regulatory notifications required"
              count={actionItems.pendingNotifications.length}
              items={actionItems.pendingNotifications}
              priority="critical"
              link="/incidents?filter=pending_notification"
            />
          )}

          {/* Overdue CAPAs */}
          {actionItems.overdueCapas?.length > 0 && (
            <ActionItemCard
              type="overdue"
              title="Overdue CAPAs"
              subtitle="Past target completion date"
              count={actionItems.overdueCapas.length}
              items={actionItems.overdueCapas}
              priority="high"
              link="/capas?filter=overdue"
            />
          )}

          {/* CAPAs Due Soon */}
          {actionItems.capasDueSoon?.length > 0 && (
            <ActionItemCard
              type="due_soon"
              title="CAPAs Due Soon"
              subtitle="Due within next 7 days"
              count={actionItems.capasDueSoon.length}
              items={actionItems.capasDueSoon}
              priority="medium"
              link="/capas?filter=due_soon"
            />
          )}

          {/* Open Investigations */}
          {actionItems.openInvestigations?.length > 0 && (
            <ActionItemCard
              type="investigation"
              title="Open Investigations"
              subtitle="Incidents under investigation"
              count={actionItems.openInvestigations.length}
              items={actionItems.openInvestigations}
              priority="medium"
              link="/incidents?status=under_investigation"
            />
          )}

          {/* All Clear */}
          {(!actionItems.pendingNotifications?.length &&
            !actionItems.overdueCapas?.length &&
            !actionItems.capasDueSoon?.length &&
            !actionItems.openInvestigations?.length) && (
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900">All Clear</h3>
                  <p className="text-sm text-green-700">No urgent action items</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link 
                to="/incidents/new"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Report New Incident</span>
              </Link>
              <Link 
                to="/incidents"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <FileWarning className="w-4 h-4 text-blue-500" />
                <span className="text-sm">View All Incidents</span>
              </Link>
              <Link 
                to="/capas"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <ClipboardCheck className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Manage CAPAs</span>
              </Link>
              <Link 
                to="/forms?type=flha"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm">Complete FLHA</span>
              </Link>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="card border-red-200 bg-red-50">
            <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Emergency Contacts
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-red-800">TSB (Immediate)</p>
                <a href="tel:1-800-387-3557" className="text-red-700 hover:underline">
                  1-800-387-3557
                </a>
              </div>
              <div>
                <p className="font-medium text-red-800">Aeria Internal</p>
                <a href="tel:604-849-2345" className="text-red-700 hover:underline">
                  604-849-2345
                </a>
                <span className="text-red-600 text-xs block">Dustin Wales (AE)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Month-to-Date Summary */}
      <div className="card bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Month-to-Date Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Incidents</p>
            <p className="text-xl font-bold text-gray-900">{incidents.mtd?.total || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Recordable</p>
            <p className="text-xl font-bold text-gray-900">{incidents.mtd?.recordable || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Near Misses</p>
            <p className="text-xl font-bold text-gray-900">{incidents.mtd?.nearMiss || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Open Incidents</p>
            <p className="text-xl font-bold text-gray-900">{incidents.openCount || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
