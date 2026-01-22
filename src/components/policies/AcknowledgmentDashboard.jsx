/**
 * AcknowledgmentDashboard.jsx
 * Dashboard component for tracking policy acknowledgments
 *
 * Features:
 * - Admin view: See who has/hasn't acknowledged
 * - Filter by policy, status, role
 * - Export acknowledgment report
 * - Overdue tracking
 *
 * @location src/components/policies/AcknowledgmentDashboard.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  Users,
  Check,
  X,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import {
  getAcknowledgments,
  getAcknowledgmentStats,
  getPoliciesEnhanced
} from '../../lib/firestorePolicies'
import { getOperators } from '../../lib/firestore'
import { logger } from '../../lib/logger'

/**
 * Format timestamp
 */
function formatDate(date) {
  if (!date) return '-'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Status badge component
 */
function StatusBadge({ status }) {
  const styles = {
    acknowledged: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    overdue: 'bg-red-100 text-red-700 border-red-200'
  }

  const icons = {
    acknowledged: Check,
    pending: Clock,
    overdue: AlertCircle
  }

  const labels = {
    acknowledged: 'Acknowledged',
    pending: 'Pending',
    overdue: 'Overdue'
  }

  const Icon = icons[status] || Clock

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${styles[status]}`}>
      <Icon className="w-3 h-3" />
      {labels[status]}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired
}

/**
 * Summary cards component
 */
function SummaryCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Users</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.acknowledged}</p>
            <p className="text-xs text-gray-500">Acknowledged</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
        </div>
      </div>
    </div>
  )
}

SummaryCards.propTypes = {
  stats: PropTypes.object.isRequired
}

/**
 * Main AcknowledgmentDashboard component
 */
export default function AcknowledgmentDashboard({ policyId = null }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [policies, setPolicies] = useState([])
  const [operators, setOperators] = useState([])
  const [acknowledgments, setAcknowledgments] = useState([])

  const [selectedPolicy, setSelectedPolicy] = useState(policyId)
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  // Load acknowledgments when policy changes
  useEffect(() => {
    if (selectedPolicy) {
      loadAcknowledgments()
    }
  }, [selectedPolicy])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [policiesData, operatorsData] = await Promise.all([
        getPoliciesEnhanced({ status: 'active' }),
        getOperators()
      ])

      setPolicies(policiesData.filter(p => p.acknowledgmentSettings?.required))
      setOperators(operatorsData)

      // Set initial policy
      if (policyId) {
        setSelectedPolicy(policyId)
      } else if (policiesData.length > 0) {
        const firstRequired = policiesData.find(p => p.acknowledgmentSettings?.required)
        if (firstRequired) {
          setSelectedPolicy(firstRequired.id)
        }
      }
    } catch (err) {
      setError('Failed to load data')
      logger.error('Error loading acknowledgments:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadAcknowledgments = async () => {
    if (!selectedPolicy) return

    try {
      const data = await getAcknowledgments(selectedPolicy)
      setAcknowledgments(data)
    } catch (err) {
      logger.error('Failed to load acknowledgments:', err)
    }
  }

  // Get current policy
  const currentPolicy = useMemo(() => {
    return policies.find(p => p.id === selectedPolicy)
  }, [policies, selectedPolicy])

  // Build user acknowledgment status list
  const userStatusList = useMemo(() => {
    if (!currentPolicy) return []

    const ackMap = new Map()
    acknowledgments.forEach(ack => {
      if (ack.isValid && ack.policyVersion === currentPolicy.version) {
        ackMap.set(ack.userId, ack)
      }
    })

    const requiredRoles = currentPolicy.acknowledgmentSettings?.requiredRoles || []
    const deadline = currentPolicy.acknowledgmentSettings?.deadline
    const policyDate = new Date(currentPolicy.effectiveDate)

    return operators
      .filter(op => {
        // Filter by required roles if specified
        if (requiredRoles.length > 0 && !requiredRoles.includes(op.role)) {
          return false
        }
        return op.status === 'active'
      })
      .map(op => {
        const ack = ackMap.get(op.id)
        let status = 'pending'

        if (ack) {
          status = 'acknowledged'
        } else if (deadline) {
          const dueDate = new Date(policyDate)
          dueDate.setDate(dueDate.getDate() + deadline)
          if (new Date() > dueDate) {
            status = 'overdue'
          }
        }

        return {
          id: op.id,
          name: `${op.firstName || ''} ${op.lastName || ''}`.trim() || op.email || 'Unknown',
          email: op.email,
          role: op.role || 'operator',
          status,
          acknowledgedAt: ack?.acknowledgedAt,
          signatureType: ack?.signatureType
        }
      })
  }, [operators, acknowledgments, currentPolicy])

  // Apply filters
  const filteredUsers = useMemo(() => {
    return userStatusList.filter(user => {
      // Status filter
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false
      }

      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false
      }

      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          user.name.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [userStatusList, statusFilter, roleFilter, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const total = userStatusList.length
    const acknowledged = userStatusList.filter(u => u.status === 'acknowledged').length
    const pending = userStatusList.filter(u => u.status === 'pending').length
    const overdue = userStatusList.filter(u => u.status === 'overdue').length

    return { total, acknowledged, pending, overdue }
  }, [userStatusList])

  // Get unique roles for filter
  const availableRoles = useMemo(() => {
    const roles = new Set(operators.map(op => op.role).filter(Boolean))
    return Array.from(roles).sort()
  }, [operators])

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Acknowledged Date']
    const rows = filteredUsers.map(user => [
      user.name,
      user.email || '',
      user.role,
      user.status,
      user.acknowledgedAt ? formatDate(user.acknowledgedAt) : ''
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `acknowledgments-${currentPolicy?.number || 'report'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  if (policies.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Policies Require Acknowledgment</h3>
        <p className="text-gray-500">
          Enable acknowledgment requirements on policies to track compliance
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Policy selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Policy
        </label>
        <select
          value={selectedPolicy || ''}
          onChange={(e) => setSelectedPolicy(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {policies.map(policy => (
            <option key={policy.id} value={policy.id}>
              {policy.number} - {policy.title} (v{policy.version})
            </option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <SummaryCards stats={stats} />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <label htmlFor="ack-dashboard-search" className="sr-only">Search by name or email</label>
              <input
                id="ack-dashboard-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <label htmlFor="ack-status-filter" className="sr-only">Filter by status</label>
            <select
              id="ack-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            {availableRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          {/* Export */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* User table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                Acknowledged Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No users match the current filters
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      {user.email && (
                        <p className="text-sm text-gray-500">{user.email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-sm capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.acknowledgedAt ? formatDate(user.acknowledgedAt) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Completion rate */}
      {stats.total > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Completion Rate</span>
            <span className="text-sm text-gray-500">
              {stats.acknowledged} of {stats.total} ({Math.round((stats.acknowledged / stats.total) * 100)}%)
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(stats.acknowledged / stats.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

AcknowledgmentDashboard.propTypes = {
  policyId: PropTypes.string
}
