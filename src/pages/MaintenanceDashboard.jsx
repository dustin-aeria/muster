/**
 * MaintenanceDashboard.jsx
 * Central dashboard for preventative maintenance system
 *
 * Features:
 * - KPI stats (overdue, due soon, grounded, ok)
 * - Alert list of items needing attention
 * - Recent maintenance activity
 * - Quick actions
 *
 * @location src/pages/MaintenanceDashboard.jsx
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
  Plus,
  Calendar,
  Settings,
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react'
import {
  getMaintenanceDashboardStats,
  getRecentMaintenance
} from '../lib/firestoreMaintenance'
import { useOrganization } from '../hooks/useOrganization'
import MaintenanceStatCard from '../components/maintenance/MaintenanceStatCard'
import MaintenanceAlertList from '../components/maintenance/MaintenanceAlertList'
import RecentMaintenanceList from '../components/maintenance/RecentMaintenanceList'

export default function MaintenanceDashboard() {
  const { organizationId } = useOrganization()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState(null)
  const [recentRecords, setRecentRecords] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (organizationId) {
      loadDashboardData()
    }
  }, [organizationId])

  const loadDashboardData = async (isRefresh = false) => {
    if (!organizationId) return

    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const [dashboardStats, recent] = await Promise.all([
        getMaintenanceDashboardStats(organizationId),
        getRecentMaintenance(organizationId, 10)
      ])

      setStats(dashboardStats)
      setRecentRecords(recent)
    } catch (err) {
      console.error('Failed to load maintenance dashboard:', err)
      setError('Failed to load maintenance data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-aeria-navy mx-auto" />
          <p className="mt-2 text-gray-500">Loading maintenance data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => loadDashboardData()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Combine overdue and due soon items for alerts
  const alertItems = [
    ...(stats?.overdueItems || []),
    ...(stats?.dueSoonItems || [])
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Wrench className="w-7 h-7 text-aeria-navy" />
            Maintenance Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Track equipment and fleet maintenance schedules
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/maintenance/schedules"
            className="btn-secondary flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Manage Schedules
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MaintenanceStatCard
          title="Overdue"
          value={stats?.overdue || 0}
          subtitle="Items past due"
          icon={AlertTriangle}
          status={stats?.overdue > 0 ? 'danger' : 'ok'}
          href="/maintenance/items?status=overdue"
        />
        <MaintenanceStatCard
          title="Due Soon"
          value={stats?.dueSoon || 0}
          subtitle="Within warning threshold"
          icon={Clock}
          status={stats?.dueSoon > 0 ? 'warning' : 'ok'}
          href="/maintenance/items?status=due_soon"
        />
        <MaintenanceStatCard
          title="Grounded"
          value={stats?.grounded || 0}
          subtitle="Items out of service"
          icon={XOctagon}
          status={stats?.grounded > 0 ? 'danger' : 'neutral'}
          href="/maintenance/items?status=grounded"
        />
        <MaintenanceStatCard
          title="Good Standing"
          value={stats?.ok || 0}
          subtitle="Maintenance current"
          icon={CheckCircle}
          status="ok"
          href="/maintenance/items?status=ok"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/maintenance/items"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-aeria-navy hover:bg-aeria-sky/20 transition-colors"
          >
            <div className="p-2 rounded-lg bg-blue-100">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View All Items</p>
              <p className="text-sm text-gray-500">{stats?.totalItems || 0} items tracked</p>
            </div>
          </Link>
          <Link
            to="/maintenance/schedules"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-aeria-navy hover:bg-aeria-sky/20 transition-colors"
          >
            <div className="p-2 rounded-lg bg-purple-100">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Schedules</p>
              <p className="text-sm text-gray-500">Manage templates</p>
            </div>
          </Link>
          <Link
            to="/maintenance/calendar"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-aeria-navy hover:bg-aeria-sky/20 transition-colors"
          >
            <div className="p-2 rounded-lg bg-green-100">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Calendar View</p>
              <p className="text-sm text-gray-500">Upcoming maintenance</p>
            </div>
          </Link>
          <Link
            to="/equipment"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-aeria-navy hover:bg-aeria-sky/20 transition-colors"
          >
            <div className="p-2 rounded-lg bg-amber-100">
              <Plus className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Add Equipment</p>
              <p className="text-sm text-gray-500">Register new item</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Alerts */}
        <MaintenanceAlertList
          items={alertItems}
          title="Items Needing Attention"
          emptyMessage="All items are up to date!"
          maxItems={6}
        />

        {/* Recent Activity */}
        <RecentMaintenanceList
          records={recentRecords}
          title="Recent Maintenance"
          emptyMessage="No maintenance recorded yet"
          maxItems={6}
        />
      </div>

      {/* Fleet vs Equipment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Plane className="w-5 h-5 text-aeria-navy" />
              Fleet (Aircraft)
            </h3>
            <Link
              to="/maintenance/items?type=aircraft"
              className="text-sm text-aeria-navy hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {alertItems.filter(i => i.type === 'aircraft' && i.worstStatus === 'overdue').length}
              </p>
              <p className="text-xs text-gray-500">Overdue</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">
                {alertItems.filter(i => i.type === 'aircraft' && i.worstStatus === 'due_soon').length}
              </p>
              <p className="text-xs text-gray-500">Due Soon</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {(stats?.ok || 0) - alertItems.filter(i => i.type !== 'aircraft').length}
              </p>
              <p className="text-xs text-gray-500">Current</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-aeria-navy" />
              Equipment
            </h3>
            <Link
              to="/maintenance/items?type=equipment"
              className="text-sm text-aeria-navy hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {alertItems.filter(i => i.type === 'equipment' && i.worstStatus === 'overdue').length}
              </p>
              <p className="text-xs text-gray-500">Overdue</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">
                {alertItems.filter(i => i.type === 'equipment' && i.worstStatus === 'due_soon').length}
              </p>
              <p className="text-xs text-gray-500">Due Soon</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {(stats?.ok || 0) - alertItems.filter(i => i.type !== 'equipment').length}
              </p>
              <p className="text-xs text-gray-500">Current</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
