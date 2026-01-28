/**
 * MaintenanceAlertWidget.jsx
 * Reusable widget for displaying maintenance alerts
 *
 * @location src/components/maintenance/MaintenanceAlertWidget.jsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  XOctagon,
  Plane,
  Package,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { getMaintenanceDashboardStats } from '../../lib/firestoreMaintenance'

export default function MaintenanceAlertWidget({ compact = false }) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const dashboardStats = await getMaintenanceDashboardStats()
      setStats(dashboardStats)
    } catch (err) {
      console.error('Failed to load maintenance stats:', err)
      setError('Failed to load maintenance data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-aeria-navy" />
        </div>
      </div>
    )
  }

  if (error) {
    return null // Silently fail on dashboard
  }

  const hasAlerts = (stats?.overdue || 0) > 0 || (stats?.dueSoon || 0) > 0 || (stats?.grounded || 0) > 0
  const alertItems = [...(stats?.overdueItems || []), ...(stats?.dueSoonItems || [])].slice(0, compact ? 3 : 5)

  // Good standing - no alerts
  if (!hasAlerts) {
    return (
      <div className="card border-green-200 bg-green-50">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-green-900">Maintenance Current</h3>
            <p className="text-sm text-green-700 mt-1">
              All equipment and aircraft maintenance is up to date.
            </p>
            <Link
              to="/maintenance"
              className="text-sm text-green-800 font-medium hover:underline mt-2 inline-block"
            >
              View maintenance dashboard →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Has alerts
  const alertClass = (stats?.overdue || 0) > 0
    ? 'border-red-200 bg-red-50'
    : 'border-amber-200 bg-amber-50'

  const AlertIcon = (stats?.overdue || 0) > 0 ? AlertTriangle : Clock
  const alertIconClass = (stats?.overdue || 0) > 0 ? 'text-red-600' : 'text-amber-600'
  const alertTextClass = (stats?.overdue || 0) > 0 ? 'text-red-900' : 'text-amber-900'
  const alertDescClass = (stats?.overdue || 0) > 0 ? 'text-red-700' : 'text-amber-700'

  return (
    <div className={`card ${alertClass}`}>
      <div className="flex items-start gap-3">
        <AlertIcon className={`w-5 h-5 ${alertIconClass} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`font-medium ${alertTextClass} flex items-center gap-2`}>
            Maintenance Alerts
            {(stats?.grounded || 0) > 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-200 text-red-800 rounded-full">
                <XOctagon className="w-3 h-3" />
                {stats.grounded} Grounded
              </span>
            )}
          </h3>
          <p className={`text-sm ${alertDescClass} mt-1`}>
            {(stats?.overdue || 0) > 0 && `${stats.overdue} item${stats.overdue !== 1 ? 's' : ''} overdue`}
            {(stats?.overdue || 0) > 0 && (stats?.dueSoon || 0) > 0 && ' • '}
            {(stats?.dueSoon || 0) > 0 && `${stats.dueSoon} due soon`}
          </p>

          {/* Alert items list */}
          {alertItems.length > 0 && (
            <div className="mt-3 space-y-2">
              {alertItems.map((item) => {
                const ItemIcon = item.type === 'aircraft' ? Plane : Package
                const isOverdue = item.worstStatus === 'overdue'

                return (
                  <Link
                    key={item.id}
                    to={`/maintenance/item/${item.type}/${item.id}`}
                    className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-800' : 'text-amber-800'} hover:underline`}
                  >
                    <ItemIcon className="w-4 h-4" />
                    <span className="font-medium">{item.name || item.nickname}</span>
                    <span className={isOverdue ? 'text-red-600' : 'text-amber-600'}>
                      - {isOverdue ? 'Overdue' : 'Due Soon'}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          <Link
            to="/maintenance"
            className={`text-sm ${alertTextClass} font-medium hover:underline mt-3 inline-flex items-center gap-1`}
          >
            View maintenance dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
