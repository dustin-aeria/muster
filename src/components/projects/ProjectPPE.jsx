import { useState, useEffect } from 'react'
import { 
  HardHat, 
  Plus,
  Trash2,
  Eye,
  Ear,
  Hand,
  Footprints,
  Shirt,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react'

const ppeCategories = [
  { value: 'head', label: 'Head Protection', icon: HardHat, examples: 'Hard hat, bump cap' },
  { value: 'eye', label: 'Eye Protection', icon: Eye, examples: 'Safety glasses, goggles, face shield' },
  { value: 'hearing', label: 'Hearing Protection', icon: Ear, examples: 'Earplugs, earmuffs' },
  { value: 'hand', label: 'Hand Protection', icon: Hand, examples: 'Work gloves, cut-resistant gloves' },
  { value: 'foot', label: 'Foot Protection', icon: Footprints, examples: 'Steel-toe boots, CSA approved footwear' },
  { value: 'body', label: 'Body Protection', icon: Shirt, examples: 'High-vis vest, coveralls, FR clothing' },
  { value: 'respiratory', label: 'Respiratory Protection', icon: Shield, examples: 'N95 mask, respirator' },
  { value: 'fall', label: 'Fall Protection', icon: AlertTriangle, examples: 'Harness, lanyard' },
  { value: 'other', label: 'Other', icon: Shield, examples: 'Specialty equipment' }
]

const defaultPPE = [
  { 
    category: 'body', 
    item: 'High-Visibility Vest', 
    specification: 'ANSI/CSA Type R Class 2 minimum', 
    required: true,
    notes: 'Required for all field personnel'
  },
  { 
    category: 'foot', 
    item: 'Safety Footwear', 
    specification: 'CSA approved, Grade 1', 
    required: true,
    notes: 'Steel or composite toe'
  },
  { 
    category: 'eye', 
    item: 'Safety Glasses', 
    specification: 'ANSI Z87.1', 
    required: false,
    notes: 'As conditions require'
  },
  { 
    category: 'other', 
    item: 'Sun Protection', 
    specification: 'Sunscreen SPF 30+, hat', 
    required: false,
    notes: 'For outdoor operations'
  }
]

export default function ProjectPPE({ project, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    category: 'other',
    item: '',
    specification: '',
    required: false,
    notes: ''
  })

  // Initialize PPE if not present
  useEffect(() => {
    if (!project.ppe || !project.ppe.items) {
      onUpdate({
        ppe: {
          items: [...defaultPPE],
          siteSpecific: '',
          clientRequirements: '',
          inspectionNotes: ''
        }
      })
    }
  }, [project.ppe])

  const ppe = project.ppe || { items: [] }

  const updatePPE = (updates) => {
    onUpdate({
      ppe: {
        ...ppe,
        ...updates
      }
    })
  }

  const addItem = () => {
    if (!newItem.item.trim()) return
    
    updatePPE({
      items: [...(ppe.items || []), { ...newItem }]
    })
    
    setNewItem({
      category: 'other',
      item: '',
      specification: '',
      required: false,
      notes: ''
    })
    setShowAddForm(false)
  }

  const updateItem = (index, field, value) => {
    const newItems = [...(ppe.items || [])]
    newItems[index] = { ...newItems[index], [field]: value }
    updatePPE({ items: newItems })
  }

  const removeItem = (index) => {
    const newItems = (ppe.items || []).filter((_, i) => i !== index)
    updatePPE({ items: newItems })
  }

  const toggleRequired = (index) => {
    const newItems = [...(ppe.items || [])]
    newItems[index] = { ...newItems[index], required: !newItems[index].required }
    updatePPE({ items: newItems })
  }

  // Group items by category
  const groupedItems = (ppe.items || []).reduce((acc, item, index) => {
    const category = item.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push({ ...item, index })
    return acc
  }, {})

  const getCategoryInfo = (categoryValue) => {
    return ppeCategories.find(c => c.value === categoryValue) || ppeCategories[8]
  }

  const requiredCount = (ppe.items || []).filter(item => item.required).length

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-aeria-sky to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <HardHat className="w-6 h-6 text-aeria-navy" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">PPE Requirements</h2>
              <p className="text-sm text-gray-600">
                {(ppe.items || []).length} items configured, {requiredCount} required
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary text-sm inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="card border-aeria-light-blue">
          <h3 className="font-medium text-gray-900 mb-4">Add PPE Item</h3>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                className="input"
              >
                {ppeCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Item Name</label>
              <input
                type="text"
                value={newItem.item}
                onChange={(e) => setNewItem(prev => ({ ...prev, item: e.target.value }))}
                className="input"
                placeholder="e.g., Hard Hat"
              />
            </div>
            <div>
              <label className="label">Specification</label>
              <input
                type="text"
                value={newItem.specification}
                onChange={(e) => setNewItem(prev => ({ ...prev, specification: e.target.value }))}
                className="input"
                placeholder="e.g., ANSI Type I Class E"
              />
            </div>
            <div>
              <label className="label">Notes</label>
              <input
                type="text"
                value={newItem.notes}
                onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                className="input"
                placeholder="Additional notes..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItem.required}
                  onChange={(e) => setNewItem(prev => ({ ...prev, required: e.target.checked }))}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <span className="text-sm text-gray-700">Required for all personnel</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewItem({ category: 'other', item: '', specification: '', required: false, notes: '' })
              }}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={addItem}
              disabled={!newItem.item.trim()}
              className="btn-primary text-sm"
            >
              Add Item
            </button>
          </div>
        </div>
      )}

      {/* PPE Items by Category */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="card text-center py-8">
          <HardHat className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">No PPE items configured.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm text-aeria-blue hover:underline mt-2"
          >
            Add your first item
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {ppeCategories.map(category => {
            const items = groupedItems[category.value]
            if (!items || items.length === 0) return null

            const CategoryIcon = category.icon

            return (
              <div key={category.value} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className="w-5 h-5 text-aeria-blue" />
                  <h3 className="font-medium text-gray-900">{category.label}</h3>
                  <span className="text-xs text-gray-400">({items.length})</span>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div 
                      key={item.index}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        item.required 
                          ? 'bg-amber-50 border-amber-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <button
                        onClick={() => toggleRequired(item.index)}
                        className={`mt-0.5 flex-shrink-0 ${
                          item.required ? 'text-amber-600' : 'text-gray-400'
                        }`}
                        title={item.required ? 'Required - click to make optional' : 'Optional - click to make required'}
                      >
                        {item.required ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-current" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{item.item}</span>
                          {item.required && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-200 text-amber-800 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        {item.specification && (
                          <p className="text-sm text-gray-600 mt-0.5">{item.specification}</p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">{item.notes}</p>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Site-Specific Requirements */}
      <div className="card">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Site-Specific Requirements
        </h3>
        <textarea
          value={ppe.siteSpecific || ''}
          onChange={(e) => updatePPE({ siteSpecific: e.target.value })}
          className="input min-h-[80px]"
          placeholder="Document any site-specific PPE requirements based on hazard assessment (e.g., FR clothing for industrial sites, flotation devices near water)..."
        />
      </div>

      {/* Client Requirements */}
      <div className="card">
        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Client Requirements
        </h3>
        <textarea
          value={ppe.clientRequirements || ''}
          onChange={(e) => updatePPE({ clientRequirements: e.target.value })}
          className="input min-h-[80px]"
          placeholder="Document any client-specific PPE requirements or standards that must be met..."
        />
      </div>

      {/* Inspection Notes */}
      <div className="card">
        <h3 className="font-medium text-gray-900 mb-3">Pre-Operation Inspection</h3>
        <p className="text-sm text-gray-500 mb-3">
          All PPE should be inspected before each use. Document any specific inspection requirements:
        </p>
        <textarea
          value={ppe.inspectionNotes || ''}
          onChange={(e) => updatePPE({ inspectionNotes: e.target.value })}
          className="input min-h-[60px]"
          placeholder="Inspection requirements and procedures..."
        />
      </div>

      {/* Quick Reference */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">PPE Checklist Reminder</h3>
            <p className="text-sm text-blue-700 mt-1">
              Ensure all required PPE is available and inspected during the pre-operation tailgate briefing.
              Personnel without proper PPE should not be permitted to participate in field operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
