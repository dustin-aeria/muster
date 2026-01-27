/**
 * PhaseCostSummary.jsx
 * Display phase cost totals with breakdown by category
 *
 * @location src/components/projects/phases/PhaseCostSummary.jsx
 */

import { DollarSign, Users, Settings, Wrench, Truck, CheckCircle, Clock } from 'lucide-react'
import { formatCurrency, getPhaseCostSummary } from '../../../lib/costEstimator'

export default function PhaseCostSummary({ phase, title = 'Phase Summary' }) {
  const summary = getPhaseCostSummary(phase)

  const costCategories = [
    { key: 'personnel', label: 'Personnel', icon: Users, color: 'text-blue-600' },
    { key: 'service', label: 'Services', icon: Settings, color: 'text-purple-600' },
    { key: 'equipment', label: 'Equipment', icon: Wrench, color: 'text-green-600' },
    { key: 'fleet', label: 'Fleet', icon: Truck, color: 'text-amber-600' },
    { key: 'fixed', label: 'Fixed Costs', icon: DollarSign, color: 'text-gray-600' }
  ]

  // Filter to only show categories with costs
  const activeCategories = costCategories.filter(cat => summary.byType[cat.key] > 0)

  const completionPercent = summary.taskCount > 0
    ? Math.round((summary.completedTasks / summary.taskCount) * 100)
    : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <div className="text-xl font-bold text-gray-900">
          {formatCurrency(summary.total)}
        </div>
      </div>

      {/* Progress bar */}
      {summary.taskCount > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {summary.completedTasks} of {summary.taskCount} tasks complete
            </span>
            <span>{completionPercent}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Cost breakdown */}
      {activeCategories.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-gray-100">
          {activeCategories.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(summary.byType[key])}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {summary.taskCount === 0 && (
        <p className="text-sm text-gray-500 text-center py-2">
          No tasks added yet
        </p>
      )}
    </div>
  )
}
