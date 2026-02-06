/**
 * Expenses Page
 * Manage expenses - both project-specific and general costs
 *
 * @location src/pages/Expenses.jsx
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  Receipt,
  Plus,
  Filter,
  Download,
  Search,
  FolderKanban,
  Building2,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import {
  getExpenses,
  EXPENSE_CATEGORIES,
  EXPENSE_STATUS,
  formatCurrency
} from '../lib/firestoreExpenses'
import { getProjects } from '../lib/firestore'
import ExpenseForm from '../components/expenses/ExpenseForm'
import ExpenseList from '../components/expenses/ExpenseList'

export default function Expenses() {
  const { user } = useAuth()
  const { organizationId } = useOrganization()
  const [expenses, setExpenses] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [filters, setFilters] = useState({
    projectId: '',
    category: '',
    status: '',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Modal state
  const [showForm, setShowForm] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)

  useEffect(() => {
    if (organizationId) {
      loadData()
    }
  }, [organizationId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [expensesData, projectsData] = await Promise.all([
        getExpenses(organizationId),
        getProjects(organizationId)
      ])

      setExpenses(expensesData)
      setProjects(projectsData)
    } catch (err) {
      console.error('Error loading expenses:', err)
      setError('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    if (filters.projectId === 'general' && expense.projectId) return false
    if (filters.projectId && filters.projectId !== 'general' && expense.projectId !== filters.projectId) return false
    if (filters.category && expense.category !== filters.category) return false
    if (filters.status && expense.status !== filters.status) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      const matchesDescription = expense.description?.toLowerCase().includes(search)
      const matchesVendor = expense.vendor?.toLowerCase().includes(search)
      const matchesMerchant = expense.merchant?.toLowerCase().includes(search)
      if (!matchesDescription && !matchesVendor && !matchesMerchant) return false
    }
    return true
  })

  // Calculate stats
  const stats = {
    total: filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    projectTotal: filteredExpenses.filter(e => e.projectId).reduce((sum, e) => sum + (e.amount || 0), 0),
    generalTotal: filteredExpenses.filter(e => !e.projectId).reduce((sum, e) => sum + (e.amount || 0), 0),
    count: filteredExpenses.length
  }

  const handleCreateExpense = () => {
    setSelectedExpense(null)
    setShowForm(true)
  }

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedExpense(null)
  }

  const handleFormSaved = () => {
    loadData()
    handleFormClose()
  }

  const clearFilters = () => {
    setFilters({
      projectId: '',
      category: '',
      status: '',
      search: ''
    })
  }

  const activeFilterCount = Object.values(filters).filter(v => v).length

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-green-600" />
            Expenses
          </h1>
          <p className="text-gray-600 mt-1">
            Track project and general business expenses
          </p>
        </div>
        <button
          onClick={handleCreateExpense}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(stats.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderKanban className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Project Expenses</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(stats.projectTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">General Costs</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(stats.generalTotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-xl font-bold text-gray-900">{stats.count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  value={filters.projectId}
                  onChange={(e) => setFilters(f => ({ ...f, projectId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All</option>
                  <option value="general">General Costs Only</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Categories</option>
                  {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(EXPENSE_STATUS).map(([key, status]) => (
                    <option key={key} value={key}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Expenses List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-600 mb-4">
            {activeFilterCount > 0
              ? 'Try adjusting your filters'
              : 'Get started by adding your first expense'}
          </p>
          {activeFilterCount === 0 && (
            <button
              onClick={handleCreateExpense}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          )}
        </div>
      ) : (
        <ExpenseList
          expenses={filteredExpenses}
          onEdit={handleEditExpense}
          onRefresh={loadData}
        />
      )}

      {/* Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ExpenseForm
              expense={selectedExpense}
              onClose={handleFormClose}
              onSaved={handleFormSaved}
            />
          </div>
        </div>
      )}
    </div>
  )
}
