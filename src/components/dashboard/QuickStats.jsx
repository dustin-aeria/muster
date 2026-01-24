/**
 * Quick Stats Widget
 * Compact display of key operational metrics
 *
 * @location src/components/dashboard/QuickStats.jsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  FolderKanban,
  Plane,
  Package,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Calendar,
  Shield
} from 'lucide-react'
import { getProjects, getAircraft, getEquipment, getOperators } from '../../lib/firestore'
import { getAllIncidents } from '../../lib/firestoreIncidents'
import { getAllTrainingRecords } from '../../lib/firestoreTraining'
import { useAuth } from '../../contexts/AuthContext'
import { logger } from '../../lib/logger'

export default function QuickStats() {
  const { operatorData } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (operatorData?.id) {
      loadStats()
    }
  }, [operatorData?.id])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [projects, aircraft, equipment, operators, incidents, training] = await Promise.all([
        getProjects().catch(() => []),
        getAircraft().catch(() => []),
        getEquipment().catch(() => []),
        getOperators().catch(() => []),
        getAllIncidents(operatorData.id).catch(() => []),
        getAllTrainingRecords(operatorData.id).catch(() => [])
      ])

      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      // Calculate stats
      const activeProjects = projects.filter(p =>
        p.status === 'planning' || p.status === 'approved' || p.status === 'active'
      ).length

      const recentProjects = projects.filter(p => {
        const created = p.createdAt?.toDate?.() || new Date(p.createdAt)
        return created >= thirtyDaysAgo
      }).length

      const airworthyAircraft = aircraft.filter(a => a.status === 'airworthy').length
      const maintenanceAircraft = aircraft.filter(a => a.status === 'maintenance').length

      const availableEquipment = equipment.filter(e => e.status === 'available').length
      const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length

      const activeOperators = operators.filter(o => o.status === 'active').length

      const openIncidents = incidents.filter(i =>
        i.status !== 'closed' && i.status !== 'resolved'
      ).length

      const highSeverityIncidents = incidents.filter(i =>
        (i.severity === 'high' || i.severity === 'critical') &&
        i.status !== 'closed' && i.status !== 'resolved'
      ).length

      // Training due soon
      const trainingDueSoon = training.filter(t => {
        if (!t.expiryDate) return false
        const expiry = t.expiryDate instanceof Date ? t.expiryDate : new Date(t.expiryDate)
        return expiry <= sevenDaysFromNow && expiry >= now
      }).length

      const expiredTraining = training.filter(t => {
        if (!t.expiryDate) return false
        const expiry = t.expiryDate instanceof Date ? t.expiryDate : new Date(t.expiryDate)
        return expiry < now
      }).length

      setStats({
        projects: {
          active: activeProjects,
          recent: recentProjects,
          total: projects.length
        },
        fleet: {
          airworthy: airworthyAircraft,
          maintenance: maintenanceAircraft,
          total: aircraft.length
        },
        equipment: {
          available: availableEquipment,
          maintenance: maintenanceEquipment,
          total: equipment.length
        },
        operators: {
          active: activeOperators,
          total: operators.length
        },
        safety: {
          openIncidents,
          highSeverity: highSeverityIncidents
        },
        training: {
          dueSoon: trainingDueSoon,
          expired: expiredTraining
        }
      })
    } catch (err) {
      logger.error('Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Quick Stats</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      label: 'Active Projects',
      value: stats.projects.active,
      subtext: `${stats.projects.recent} this month`,
      icon: FolderKanban,
      color: 'bg-blue-50 text-blue-600',
      link: '/projects'
    },
    {
      label: 'Fleet Ready',
      value: stats.fleet.airworthy,
      subtext: stats.fleet.maintenance > 0 ? `${stats.fleet.maintenance} in maintenance` : 'All operational',
      icon: Plane,
      color: stats.fleet.maintenance > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600',
      link: '/aircraft'
    },
    {
      label: 'Equipment',
      value: stats.equipment.available,
      subtext: `of ${stats.equipment.total} available`,
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
      link: '/equipment'
    },
    {
      label: 'Active Team',
      value: stats.operators.active,
      subtext: `${stats.operators.total} total`,
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600',
      link: '/operators'
    },
    {
      label: 'Open Incidents',
      value: stats.safety.openIncidents,
      subtext: stats.safety.highSeverity > 0 ? `${stats.safety.highSeverity} high priority` : 'No critical issues',
      icon: AlertTriangle,
      color: stats.safety.openIncidents > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600',
      link: '/incidents'
    },
    {
      label: 'Training',
      value: stats.training.expired,
      subtext: stats.training.dueSoon > 0 ? `${stats.training.dueSoon} due soon` : 'All current',
      icon: Shield,
      color: stats.training.expired > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600',
      link: '/training',
      valueLabel: 'expired'
    }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-aeria-blue" />
          Quick Stats
        </h2>
        <button
          onClick={loadStats}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link
              key={index}
              to={stat.link}
              className="group p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 group-hover:text-aeria-navy transition-colors">
                {stat.value}
                {stat.valueLabel && (
                  <span className="text-xs font-normal text-gray-500 ml-1">{stat.valueLabel}</span>
                )}
              </p>
              <p className="text-xs font-medium text-gray-600">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{stat.subtext}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
