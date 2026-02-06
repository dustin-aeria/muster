/**
 * SFOCStatusWidget.jsx
 * Dashboard widget showing SFOC application status and alerts
 *
 * Displays:
 * - Total SFOC applications by status
 * - Expiring SFOCs (within 60 days)
 * - Pending submissions
 * - Quick links to SFOC hub
 *
 * @location src/components/dashboard/SFOCStatusWidget.jsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Scale,
  ArrowRight,
  Plane,
  FileText
} from 'lucide-react'
import { useOrganization } from '../../hooks/useOrganization'
import { getSFOCApplications, getDaysUntilExpiry, SFOC_STATUSES } from '../../lib/firestoreSFOC'
import { getSORAAssessments } from '../../lib/firestoreSora'

export default function SFOCStatusWidget() {
  const { organizationId } = useOrganization()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    expiringSoon: 0,
    soraInProgress: 0
  })
  const [expiringSFOCs, setExpiringSFOCs] = useState([])

  useEffect(() => {
    if (organizationId) {
      loadSFOCData()
    }
  }, [organizationId])

  const loadSFOCData = async () => {
    setLoading(true)
    try {
      const [sfocs, soraAssessments] = await Promise.all([
        getSFOCApplications(organizationId),
        getSORAAssessments(organizationId)
      ])

      // Calculate stats
      const total = sfocs.length
      const active = sfocs.filter(s => s.status === 'approved').length
      const pending = sfocs.filter(s =>
        ['draft', 'documents_pending', 'review_ready', 'submitted', 'under_review'].includes(s.status)
      ).length

      // Find expiring SFOCs (approved, expiring within 60 days)
      const expiring = sfocs
        .filter(s => s.status === 'approved' && s.approvedEndDate)
        .map(s => {
          const endDate = s.approvedEndDate?.toDate ? s.approvedEndDate.toDate() : new Date(s.approvedEndDate)
          const daysRemaining = getDaysUntilExpiry(endDate)
          return { ...s, daysRemaining }
        })
        .filter(s => s.daysRemaining <= 60)
        .sort((a, b) => a.daysRemaining - b.daysRemaining)

      const soraInProgress = soraAssessments.filter(s =>
        ['draft', 'in_progress'].includes(s.status)
      ).length

      setStats({
        total,
        active,
        pending,
        expiringSoon: expiring.length,
        soraInProgress
      })
      setExpiringSFOCs(expiring.slice(0, 3))
    } catch (err) {
      console.error('Error loading SFOC data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="text-center p-3 bg-gray-100 rounded-lg">
              <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2" />
              <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Don't show if no SFOC data
  if (stats.total === 0 && stats.soraInProgress === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            SFOC Applications
          </h2>
        </div>
        <div className="text-center py-6">
          <Scale className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No SFOC applications</p>
          <Link
            to="/sfoc"
            className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-flex items-center gap-1"
          >
            Start an application
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-indigo-600" />
          SFOC Applications
        </h2>
        <Link
          to="/sfoc"
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          View all →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Link
          to="/sfoc?status=approved"
          className="text-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
          <p className="text-xs text-green-600">Active</p>
        </Link>
        <Link
          to="/sfoc?status=pending"
          className="text-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <p className="text-2xl font-bold text-blue-700">{stats.pending}</p>
          <p className="text-xs text-blue-600">Pending</p>
        </Link>
        <Link
          to="/sfoc?expiring=true"
          className={`text-center p-3 rounded-lg transition-colors ${
            stats.expiringSoon > 0
              ? 'bg-amber-50 hover:bg-amber-100'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <p className={`text-2xl font-bold ${
            stats.expiringSoon > 0 ? 'text-amber-700' : 'text-gray-500'
          }`}>{stats.expiringSoon}</p>
          <p className={`text-xs ${
            stats.expiringSoon > 0 ? 'text-amber-600' : 'text-gray-500'
          }`}>Expiring</p>
        </Link>
        <Link
          to="/sora"
          className="text-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <p className="text-2xl font-bold text-purple-700">{stats.soraInProgress}</p>
          <p className="text-xs text-purple-600">SORA In Progress</p>
        </Link>
      </div>

      {/* Expiring SFOCs Alert */}
      {expiringSFOCs.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">SFOC Expiry Alerts</p>
              <div className="mt-2 space-y-1">
                {expiringSFOCs.map(sfoc => (
                  <Link
                    key={sfoc.id}
                    to={`/sfoc/${sfoc.id}`}
                    className="flex items-center justify-between text-sm hover:bg-amber-100 p-1 rounded -mx-1"
                  >
                    <span className="text-amber-800 truncate">{sfoc.name}</span>
                    <span className={`font-medium ${
                      sfoc.daysRemaining <= 0
                        ? 'text-red-600'
                        : sfoc.daysRemaining <= 30
                        ? 'text-amber-700'
                        : 'text-amber-600'
                    }`}>
                      {sfoc.daysRemaining <= 0
                        ? 'Expired'
                        : `${sfoc.daysRemaining} days`}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Quick Access</p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/sfoc"
            className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 flex items-center gap-1"
          >
            <FileCheck className="w-3 h-3" />
            SFOC Hub
          </Link>
          <Link
            to="/sora"
            className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 flex items-center gap-1"
          >
            <Scale className="w-3 h-3" />
            SORA Assessments
          </Link>
          <Link
            to="/manufacturer-declarations"
            className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            MPD
          </Link>
        </div>
      </div>
    </div>
  )
}
