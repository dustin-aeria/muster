/**
 * TaskCostItems.jsx
 * Display cost items within a task
 *
 * @location src/components/projects/phases/TaskCostItems.jsx
 */

import { X, Plus } from 'lucide-react'
import { formatCurrency } from '../../../lib/costEstimator'
import { getCostItemTypeConfig } from './phaseConstants'

export default function TaskCostItems({
  costItems = [],
  onRemove,
  onAdd,
  readOnly = false
}) {
  if (costItems.length === 0 && readOnly) {
    return null
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      {/* Cost items list */}
      {costItems.length > 0 && (
        <div className="space-y-2 mb-3">
          {costItems.map((item) => {
            const typeConfig = getCostItemTypeConfig(item.type)
            const TypeIcon = typeConfig.icon

            return (
              <div
                key={item.id}
                className="py-2 px-2 bg-gray-50 rounded text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <TypeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 truncate font-medium">
                      {item.referenceName || 'Unnamed'}
                    </span>
                    {item.hours > 0 && (
                      <span className="text-gray-400 text-xs flex-shrink-0">
                        ({item.hours}{item.rateType === 'daily' ? 'd' : 'h'} @ {formatCurrency(item.rate)}/{item.rateType === 'daily' ? 'day' : 'hr'})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.total)}
                    </span>
                    {!readOnly && onRemove && (
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        title="Remove cost item"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-1 ml-6 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add cost button */}
      {!readOnly && onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-sm text-aeria-navy hover:text-aeria-navy/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Cost
        </button>
      )}
    </div>
  )
}
