/**
 * ExpenseApproval.jsx
 * Manager approval page for submitted expenses
 *
 * @location src/pages/ExpenseApproval.jsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  Building2,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganizationContext } from '../contexts/OrganizationContext'
import {
  getPendingExpenses,
  approveExpense,
  rejectExpense,
  formatCurrency,
  EXPENSE_CATEGORIES
} from '../lib/firestoreExpenses'
import { logger } from '../lib/logger'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

/**
 * Format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export default function ExpenseApproval() {
  const { user, userProfile } = useAuth()
  const { organizationId } = useOrganizationContext()
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState([])
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  // Load pending expenses
  useEffect(() => {
    if (organizationId) {
      loadExpenses()
    }
  }, [organizationId])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const data = await getPendingExpenses(organizationId)
      setExpenses(data)
    } catch (err) {
      logger.error('Failed to load pending expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle approve
  const handleApprove = async (expense) => {
    try {
      setActionLoading(expense.id)
      await approveExpense(
        expense.id,
        user.uid,
        userProfile?.displayName || user.email
      )
      await loadExpenses()
    } catch (err) {
      logger.error('Failed to approve expense:', err)
      alert(err.message || 'Failed to approve expense')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle reject
  const handleReject = async () => {
    if (!selectedExpense || !rejectReason.trim()) return

    try {
      setActionLoading(selectedExpense.id)
      await rejectExpense(selectedExpense.id, user.uid, rejectReason)
      setShowRejectModal(false)
      setSelectedExpense(null)
      setRejectReason('')
      await loadExpenses()
    } catch (err) {
      logger.error('Failed to reject expense:', err)
      alert(err.message || 'Failed to reject expense')
    } finally {
      setActionLoading(null)
    }
  }

  // Open reject modal
  const openRejectModal = (expense) => {
    setSelectedExpense(expense)
    setRejectReason('')
    setShowRejectModal(true)
  }

  // Get category info
  const getCategoryInfo = (category) => {
    return EXPENSE_CATEGORIES[category] || EXPENSE_CATEGORIES.other
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Receipt className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Approval</h1>
            <p className="text-gray-500">Review and approve submitted expenses</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadExpenses}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Pending Count */}
      <div className="mb-6">
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-800">
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''} pending approval
            </span>
          </div>
        </Card>
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">All caught up!</h3>
          <p className="text-gray-500">No expenses pending approval</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {expenses.map(expense => (
            <Card key={expense.id} className="p-4">
              <div className="flex items-start gap-4">
                {/* Receipt Thumbnail */}
                <div className="flex-shrink-0">
                  {expense.receipt?.url ? (
                    <a
                      href={expense.receipt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-20 h-20 rounded-lg overflow-hidden border hover:border-amber-400 transition-colors"
                    >
                      <img
                        src={expense.receipt.url}
                        alt="Receipt"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Receipt className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{expense.vendor}</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(expense.amount, expense.currency)}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryInfo(expense.category).color}`}>
                      {getCategoryInfo(expense.category).label}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(expense.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {expense.createdByName}
                    </div>
                    <Link
                      to={`/projects/${expense.projectId}`}
                      className="flex items-center gap-1 text-amber-600 hover:text-amber-700"
                    >
                      <Building2 className="w-4 h-4" />
                      {expense.projectName}
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {expense.description && (
                    <p className="mt-2 text-sm text-gray-600">{expense.description}</p>
                  )}

                  <div className="mt-2 text-xs text-gray-400">
                    Submitted {formatTimestamp(expense.submittedAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleApprove(expense)}
                    disabled={actionLoading === expense.id}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {actionLoading === expense.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openRejectModal(expense)}
                    disabled={actionLoading === expense.id}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Reject Expense</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this expense from{' '}
              <strong>{selectedExpense?.vendor}</strong> for{' '}
              <strong>{formatCurrency(selectedExpense?.amount)}</strong>.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                className="bg-red-500 hover:bg-red-600"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Reject Expense'
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
