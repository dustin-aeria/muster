/**
 * ExpenseList.jsx
 * List view for expenses with filtering and totals
 *
 * @location src/components/expenses/ExpenseList.jsx
 */

import { useState, useMemo } from 'react'
import {
  Receipt,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  Building2,
  MoreVertical
} from 'lucide-react'
import {
  EXPENSE_STATUS,
  EXPENSE_CATEGORIES,
  formatCurrency,
  deleteExpense,
  submitExpense
} from '../../lib/firestoreExpenses'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

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
 * Expense List Component
 */
export default function ExpenseList({
  expenses = [],
  onEdit,
  onRefresh,
  showProjectColumn = false,
  canApprove = false
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [expandedId, setExpandedId] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(e =>
        e.vendor?.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term) ||
        e.projectName?.toLowerCase().includes(term)
      )
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(e => e.category === filterCategory)
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status === filterStatus)
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = (a.date || '').localeCompare(b.date || '')
          break
        case 'amount':
          comparison = (a.amount || 0) - (b.amount || 0)
          break
        case 'vendor':
          comparison = (a.vendor || '').localeCompare(b.vendor || '')
          break
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '')
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [expenses, searchTerm, filterCategory, filterStatus, sortBy, sortOrder])

  // Calculate totals
  const totals = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => ({
      total: acc.total + (e.amount || 0),
      billable: acc.billable + (e.isBillable ? (e.amount || 0) : 0),
      count: acc.count + 1
    }), { total: 0, billable: 0, count: 0 })
  }, [filteredExpenses])

  // Handle sort toggle
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Handle delete
  const handleDelete = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      setActionLoading(expenseId)
      await deleteExpense(expenseId)
      onRefresh?.()
    } catch (err) {
      alert(err.message || 'Failed to delete expense')
    } finally {
      setActionLoading(null)
    }
  }

  // Handle submit for approval
  const handleSubmit = async (expense) => {
    try {
      setActionLoading(expense.id)
      await submitExpense(expense.id, expense.createdBy)
      onRefresh?.()
    } catch (err) {
      alert(err.message || 'Failed to submit expense')
    } finally {
      setActionLoading(null)
    }
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const config = EXPENSE_STATUS[status] || EXPENSE_STATUS.draft
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {status === 'draft' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'submitted' && <Send className="w-3 h-3 mr-1" />}
        {status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
        {status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
        {config.label}
      </span>
    )
  }

  // Get category badge
  const getCategoryBadge = (category) => {
    const config = EXPENSE_CATEGORIES[category] || EXPENSE_CATEGORIES.other
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses yet</h3>
        <p className="text-gray-500">Add your first expense to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="all">All Categories</option>
          {Object.entries(EXPENSE_CATEGORIES).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        >
          <option value="all">All Status</option>
          {Object.entries(EXPENSE_STATUS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="flex gap-4 p-3 bg-gray-50 rounded-lg text-sm">
        <div>
          <span className="text-gray-500">Total:</span>{' '}
          <span className="font-semibold">{formatCurrency(totals.total)}</span>
        </div>
        <div>
          <span className="text-gray-500">Billable:</span>{' '}
          <span className="font-semibold text-green-600">{formatCurrency(totals.billable)}</span>
        </div>
        <div>
          <span className="text-gray-500">Count:</span>{' '}
          <span className="font-semibold">{totals.count}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="pb-3 pr-4">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Date
                  {sortBy === 'date' && (sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                </button>
              </th>
              <th className="pb-3 pr-4">
                <button
                  onClick={() => handleSort('vendor')}
                  className="flex items-center gap-1 hover:text-gray-700"
                >
                  Vendor
                  {sortBy === 'vendor' && (sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                </button>
              </th>
              {showProjectColumn && <th className="pb-3 pr-4">Project</th>}
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 pr-4 text-right">
                <button
                  onClick={() => handleSort('amount')}
                  className="flex items-center gap-1 hover:text-gray-700 ml-auto"
                >
                  Amount
                  {sortBy === 'amount' && (sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                </button>
              </th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(expense => (
              <tr
                key={expense.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 pr-4">
                  <span className="text-sm">{formatDate(expense.date)}</span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {expense.receipt?.url && (
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="font-medium">{expense.vendor}</span>
                  </div>
                  {expense.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                      {expense.description}
                    </p>
                  )}
                </td>
                {showProjectColumn && (
                  <td className="py-3 pr-4">
                    <span className="text-sm text-gray-600">{expense.projectName}</span>
                  </td>
                )}
                <td className="py-3 pr-4">
                  {getCategoryBadge(expense.category)}
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className={`font-medium ${expense.isBillable ? 'text-green-600' : ''}`}>
                    {formatCurrency(expense.amount, expense.currency)}
                  </span>
                  {expense.isBillable && (
                    <span className="text-xs text-gray-400 ml-1">(billable)</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  {getStatusBadge(expense.status)}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    {expense.status === 'draft' && (
                      <>
                        <button
                          onClick={() => onEdit?.(expense)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleSubmit(expense)}
                          disabled={actionLoading === expense.id}
                          className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                          title="Submit for Approval"
                        >
                          <Send className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          disabled={actionLoading === expense.id}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                    {expense.status === 'rejected' && (
                      <>
                        <button
                          onClick={() => onEdit?.(expense)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Edit & Resubmit"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          disabled={actionLoading === expense.id}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                    {expense.receipt?.url && (
                      <a
                        href={expense.receipt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="View Receipt"
                      >
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredExpenses.length === 0 && expenses.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No expenses match your filters
        </div>
      )}
    </div>
  )
}
