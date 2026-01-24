/**
 * ProjectCostEstimate.jsx
 * Cost estimation component for projects
 *
 * @location src/components/projects/ProjectCostEstimate.jsx
 */

import { useState, useEffect } from 'react'
import {
  DollarSign,
  Calculator,
  Package,
  Users,
  Plus,
  Trash2,
  Download,
  Settings,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Briefcase
} from 'lucide-react'
import {
  calculateProjectCost,
  generateCostSummary,
  formatCurrency,
  RATE_TYPES,
  COST_CATEGORIES
} from '../../lib/costEstimator'
import { getEquipment } from '../../lib/firestore'

// Crew members may come from project data or a dedicated collection
// For now, we'll work with project-assigned crew

export default function ProjectCostEstimate({ project, operatorId, onSave }) {
  const [loading, setLoading] = useState(true)
  const [equipment, setEquipment] = useState([])
  const [crew, setCrew] = useState([])
  const [breakdown, setBreakdown] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [expanded, setExpanded] = useState(true)

  // Estimate settings
  const [settings, setSettings] = useState({
    estimatedHours: project?.estimatedHours || 8,
    rateType: 'hourly',
    includeOverhead: true,
    overheadPercent: 15,
    includeTax: false,
    taxPercent: 5
  })

  // Custom line items
  const [customItems, setCustomItems] = useState(project?.customCostItems || [])
  const [newItem, setNewItem] = useState({ description: '', category: 'other', cost: '' })

  useEffect(() => {
    if (operatorId) {
      loadData()
    }
  }, [operatorId])

  useEffect(() => {
    if (equipment.length > 0 || crew.length > 0) {
      recalculate()
    }
  }, [project, equipment, crew, settings, customItems])

  const loadData = async () => {
    setLoading(true)
    try {
      const equipmentData = await getEquipment(operatorId)
      setEquipment(equipmentData || [])
      // Crew data comes from project.crew array
      setCrew(project?.crew || [])
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const recalculate = () => {
    const result = calculateProjectCost(
      project,
      equipment,
      crew,
      {
        ...settings,
        customLineItems: customItems
      }
    )
    setBreakdown(result)
  }

  const handleAddCustomItem = () => {
    if (!newItem.description || !newItem.cost) return

    const item = {
      id: Date.now().toString(),
      description: newItem.description,
      category: newItem.category,
      cost: parseFloat(newItem.cost) || 0
    }

    setCustomItems(prev => [...prev, item])
    setNewItem({ description: '', category: 'other', cost: '' })
  }

  const handleRemoveCustomItem = (itemId) => {
    setCustomItems(prev => prev.filter(i => i.id !== itemId))
  }

  const handleSave = () => {
    if (onSave) {
      onSave({
        estimatedCost: breakdown?.total || 0,
        costBreakdown: breakdown,
        costSettings: settings,
        customCostItems: customItems
      })
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-aeria-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const summary = breakdown ? generateCostSummary(breakdown) : []

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div
        className="p-4 border-b border-gray-200 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cost Estimate</h3>
              <p className="text-sm text-gray-500">
                {breakdown ? formatCurrency(breakdown.total) : 'No estimate yet'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Settings className="w-4 h-4" />
            </button>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-6">
          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-gray-900">Estimate Settings</h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={settings.estimatedHours}
                    onChange={(e) => setSettings(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Rate Type</label>
                  <select
                    value={settings.rateType}
                    onChange={(e) => setSettings(prev => ({ ...prev, rateType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {Object.entries(RATE_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Overhead %</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.includeOverhead}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeOverhead: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <input
                      type="number"
                      value={settings.overheadPercent}
                      onChange={(e) => setSettings(prev => ({ ...prev, overheadPercent: parseFloat(e.target.value) || 0 }))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      max="100"
                      disabled={!settings.includeOverhead}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Tax %</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.includeTax}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeTax: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <input
                      type="number"
                      value={settings.taxPercent}
                      onChange={(e) => setSettings(prev => ({ ...prev, taxPercent: parseFloat(e.target.value) || 0 }))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      max="100"
                      disabled={!settings.includeTax}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Equipment</span>
              </div>
              <p className="text-lg font-bold text-blue-900">
                {formatCurrency(breakdown?.subtotals?.equipment || 0)}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Personnel</span>
              </div>
              <p className="text-lg font-bold text-green-900">
                {formatCurrency(breakdown?.subtotals?.personnel || 0)}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">Other</span>
              </div>
              <p className="text-lg font-bold text-yellow-900">
                {formatCurrency(breakdown?.subtotals?.custom || 0)}
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calculator className="w-4 h-4" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(breakdown?.total || 0)}
              </p>
            </div>
          </div>

          {/* Equipment Breakdown */}
          {breakdown?.equipment?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                Equipment Costs
              </h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Item</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Rate</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Hours</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {breakdown.equipment.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-gray-900">{item.name}</td>
                        <td className="px-3 py-2 text-right text-gray-600">
                          {formatCurrency(item.rate)}/{item.rateType.replace('ly', '')}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">{item.hours}h</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">
                          {formatCurrency(item.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Personnel Breakdown */}
          {breakdown?.personnel?.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                Personnel Costs
              </h4>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Role</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Rate</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Hours</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {breakdown.personnel.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-gray-900">{item.name}</td>
                        <td className="px-3 py-2 text-gray-600">{item.role}</td>
                        <td className="px-3 py-2 text-right text-gray-600">
                          {formatCurrency(item.rate)}/{item.rateType.replace('ly', '')}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">{item.hours}h</td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900">
                          {formatCurrency(item.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Custom Line Items */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-yellow-500" />
              Additional Items
            </h4>

            {/* Existing items */}
            {customItems.length > 0 && (
              <div className="space-y-2 mb-4">
                {customItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs rounded ${COST_CATEGORIES[item.category]?.color || 'bg-gray-100'}`}>
                        {COST_CATEGORIES[item.category]?.label || item.category}
                      </span>
                      <span className="text-sm text-gray-900">{item.description}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.cost)}
                      </span>
                      <button
                        onClick={() => handleRemoveCustomItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new item */}
            <div className="flex items-center gap-2">
              <select
                value={newItem.category}
                onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Object.entries(COST_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <div className="relative">
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={newItem.cost}
                  onChange={(e) => setNewItem(prev => ({ ...prev, cost: e.target.value }))}
                  placeholder="0.00"
                  className="w-28 pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
              <button
                onClick={handleAddCustomItem}
                disabled={!newItem.description || !newItem.cost}
                className="px-3 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Totals */}
          {breakdown && (
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(breakdown.subtotals.subtotal)}</span>
                </div>
                {settings.includeOverhead && breakdown.overhead > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Overhead ({settings.overheadPercent}%)</span>
                    <span className="text-gray-900">{formatCurrency(breakdown.overhead)}</span>
                  </div>
                )}
                {settings.includeTax && breakdown.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax ({settings.taxPercent}%)</span>
                    <span className="text-gray-900">{formatCurrency(breakdown.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Total Estimate</span>
                  <span className="text-green-600">{formatCurrency(breakdown.total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {onSave && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
              >
                <Download className="w-4 h-4" />
                Save Estimate
              </button>
            </div>
          )}

          {/* No rates notice */}
          {(!breakdown?.equipment?.length && !breakdown?.personnel?.length) && (
            <div className="text-center py-6 text-gray-500">
              <Calculator className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <p>No equipment or crew with rates assigned to this project</p>
              <p className="text-sm mt-1">Add hourly/daily rates in Equipment and Crew settings</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
