/**
 * MyAcknowledgments.jsx
 * User's personal policy acknowledgment dashboard
 *
 * Features:
 * - View pending acknowledgments
 * - View completed acknowledgments
 * - Quick acknowledge actions
 * - Filter by status and category
 *
 * @location src/pages/MyAcknowledgments.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Check,
  Clock,
  AlertCircle,
  FileText,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  Calendar,
  Plane,
  Users,
  HardHat
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  getPendingAcknowledgments,
  getUserAcknowledgments,
  getPoliciesEnhanced
} from '../lib/firestorePolicies'
import PolicyAcknowledgment from '../components/policies/PolicyAcknowledgment'
import { logger } from '../lib/logger'

const CATEGORY_ICONS = {
  rpas: Plane,
  crm: Users,
  hse: HardHat
}

const CATEGORY_COLORS = {
  rpas: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  crm: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  hse: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
}

function formatDate(date) {
  if (!date) return '-'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function PolicyCard({ policy, acknowledgment, isPending, onAcknowledge }) {
  const Icon = CATEGORY_ICONS[policy.category] || FileText
  const colors = CATEGORY_COLORS[policy.category] || CATEGORY_COLORS.rpas

  return (
    <div className={`bg-white rounded-lg border ${colors.border} overflow-hidden hover:shadow-md transition-shadow`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors.bg} ${colors.text}`}>
              {policy.number}
            </span>
            {isPending ? (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                <Clock className="w-3 h-3" />
                Pending
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                <Check className="w-3 h-3" />
                Acknowledged
              </span>
            )}
          </div>
          <div className={`p-1.5 rounded ${colors.bg}`}>
            <Icon className={`w-4 h-4 ${colors.text}`} />
          </div>
        </div>

        <h3 className="font-medium text-gray-900 mb-1">{policy.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{policy.description}</p>

        {acknowledgment && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Acknowledged {formatDate(acknowledgment.acknowledgedAt)}
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <Link
          to={`/policies/${policy.id}`}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          View Policy
          <ChevronRight className="w-4 h-4" />
        </Link>

        {isPending && (
          <button
            onClick={() => onAcknowledge(policy)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            Acknowledge
          </button>
        )}
      </div>
    </div>
  )
}

export default function MyAcknowledgments() {
  const { user, userProfile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [pendingPolicies, setPendingPolicies] = useState([])
  const [completedAcknowledgments, setCompletedAcknowledgments] = useState([])
  const [allPolicies, setAllPolicies] = useState([])

  const [activeTab, setActiveTab] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [acknowledgePolicy, setAcknowledgePolicy] = useState(null)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      const [pending, completed, policies] = await Promise.all([
        getPendingAcknowledgments(user.uid, userProfile?.role || 'operator'),
        getUserAcknowledgments(user.uid),
        getPoliciesEnhanced({ status: 'active' })
      ])

      setPendingPolicies(pending)
      setCompletedAcknowledgments(completed)
      setAllPolicies(policies)
    } catch (err) {
      setError('Failed to load acknowledgment data')
      logger.error('Error loading acknowledgments:', err)
    } finally {
      setLoading(false)
    }
  }

  // Build completed policies list with acknowledgment data
  const completedPolicies = useMemo(() => {
    const policyMap = new Map(allPolicies.map(p => [p.id, p]))

    return completedAcknowledgments
      .filter(ack => ack.isValid)
      .map(ack => ({
        policy: policyMap.get(ack.policyId),
        acknowledgment: ack
      }))
      .filter(item => item.policy)
  }, [completedAcknowledgments, allPolicies])

  // Apply filters
  const filteredPending = useMemo(() => {
    return pendingPolicies.filter(policy => {
      if (categoryFilter !== 'all' && policy.category !== categoryFilter) {
        return false
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          policy.number?.includes(query) ||
          policy.title?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [pendingPolicies, categoryFilter, searchQuery])

  const filteredCompleted = useMemo(() => {
    return completedPolicies.filter(({ policy }) => {
      if (categoryFilter !== 'all' && policy.category !== categoryFilter) {
        return false
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          policy.number?.includes(query) ||
          policy.title?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [completedPolicies, categoryFilter, searchQuery])

  const handleAcknowledged = () => {
    setAcknowledgePolicy(null)
    loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">My Policy Acknowledgments</h1>
            <p className="text-gray-600 mt-1">
              Review and acknowledge required policies to ensure compliance
            </p>
          </div>
          {pendingPolicies.length > 0 && (
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-600">{pendingPolicies.length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{pendingPolicies.length}</p>
              <p className="text-xs text-gray-500">Pending Acknowledgment</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{completedPolicies.length}</p>
              <p className="text-xs text-gray-500">Acknowledged</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {pendingPolicies.length + completedPolicies.length}
              </p>
              <p className="text-xs text-gray-500">Total Required</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <label htmlFor="acknowledgment-search" className="sr-only">Search policies</label>
              <input
                id="acknowledgment-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search policies..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="rpas">RPAS Operations</option>
              <option value="crm">CRM</option>
              <option value="hse">HSE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pending ({filteredPending.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'completed'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Check className="w-4 h-4" />
            Completed ({filteredCompleted.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'pending' && (
            <>
              {filteredPending.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-500">
                    You've acknowledged all required policies
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPending.map(policy => (
                    <PolicyCard
                      key={policy.id}
                      policy={policy}
                      isPending
                      onAcknowledge={setAcknowledgePolicy}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'completed' && (
            <>
              {filteredCompleted.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Acknowledgments</h3>
                  <p className="text-gray-500">
                    Policies you acknowledge will appear here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCompleted.map(({ policy, acknowledgment }) => (
                    <PolicyCard
                      key={`${policy.id}-${acknowledgment.id}`}
                      policy={policy}
                      acknowledgment={acknowledgment}
                      isPending={false}
                      onAcknowledge={() => {}}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Acknowledgment modal */}
      {acknowledgePolicy && (
        <PolicyAcknowledgment
          policy={acknowledgePolicy}
          isOpen={!!acknowledgePolicy}
          onClose={() => setAcknowledgePolicy(null)}
          onAcknowledged={handleAcknowledged}
        />
      )}
    </div>
  )
}
