/**
 * ProjectExpenses.jsx
 * Expenses tab for project view
 *
 * @location src/components/projects/ProjectExpenses.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Receipt,
  Plus,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import {
  getExpensesByProject,
  calculateExpenseTotals,
  formatCurrency,
  EXPENSE_STATUS
} from '../../lib/firestoreExpenses'
import { logger } from '../../lib/logger'
import { useOrganization } from '../../hooks/useOrganization'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import ExpenseForm from '../expenses/ExpenseForm'
import ExpenseList from '../expenses/ExpenseList'

export default function ProjectExpenses({ project }) {
  const { organizationId } = useOrganization()
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  // Load expenses
  useEffect(() => {
    if (organizationId && project?.id) {
      loadExpenses()
    }
  }, [organizationId, project?.id])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const data = await getExpensesByProject(organizationId, project.id)
      setExpenses(data)
    } catch (err) {
      logger.error('Failed to load expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals
  const totals = useMemo(() => {
    return calculateExpenseTotals(expenses)
  }, [expenses])

  // Handle edit
  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setShowForm(true)
  }

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false)
    setEditingExpense(null)
  }

  // Handle form save
  const handleFormSaved = () => {
    loadExpenses()
    handleFormClose()
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Receipt className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Expenses</h2>
            <p className="text-sm text-gray-500">
              Track project expenses and receipts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadExpenses}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold">{formatCurrency(totals.total)}</p>
            </div>
          </div>
        </Card>

        {/* Billable */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Billable</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totals.billable)}</p>
            </div>
          </div>
        </Card>

        {/* Pending */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-amber-600">
                {formatCurrency(totals.byStatus.draft + totals.byStatus.submitted)}
              </p>
            </div>
          </div>
        </Card>

        {/* Approved */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(totals.byStatus.approved)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(totals.byCategory).length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">By Category</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(totals.byCategory).map(([category, amount]) => (
              <div
                key={category}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-600 capitalize">
                  {category.replace('_', ' ')}
                </span>
                <span className="text-sm font-medium">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Expenses List */}
      <Card className="p-4">
        <ExpenseList
          expenses={expenses}
          onEdit={handleEdit}
          onRefresh={loadExpenses}
        />
      </Card>

      {/* Expense Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          projectId={project.id}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  )
}
