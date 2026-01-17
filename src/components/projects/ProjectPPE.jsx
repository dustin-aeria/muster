import { useState } from 'react'
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
  Sun,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// Common PPE items organized by category
const commonPPEItems = [
  // Head
  { id: 'hard_hat', category: 'head', item: 'Hard Hat', specification: 'CSA Z94.1 Type 1 or 2' },
  { id: 'bump_cap', category: 'head', item: 'Bump Cap', specification: 'For minor impact hazards' },
  { id: 'sun_hat', category: 'head', item: 'Sun Hat / Wide Brim', specification: 'UV protection' },
  { id: 'winter_hat', category: 'head', item: 'Winter Hat / Toque', specification: 'Cold weather protection' },
  // Eye
  { id: 'safety_glasses', category: 'eye', item: 'Safety Glasses', specification: 'ANSI Z87.1 / CSA Z94.3' },
  { id: 'tinted_glasses', category: 'eye', item: 'Tinted Safety Glasses', specification: 'UV protection' },
  { id: 'safety_goggles', category: 'eye', item: 'Safety Goggles', specification: 'Splash/dust protection' },
  { id: 'face_shield', category: 'eye', item: 'Face Shield', specification: 'Full face protection' },
  // Hearing
  { id: 'ear_plugs', category: 'hearing', item: 'Ear Plugs', specification: 'NRR 25dB minimum' },
  { id: 'ear_muffs', category: 'hearing', item: 'Ear Muffs', specification: 'NRR 25dB minimum' },
  // Hand
  { id: 'work_gloves', category: 'hand', item: 'Work Gloves', specification: 'General purpose' },
  { id: 'leather_gloves', category: 'hand', item: 'Leather Gloves', specification: 'Cut/abrasion resistant' },
  { id: 'insulated_gloves', category: 'hand', item: 'Insulated Gloves', specification: 'Cold weather' },
  { id: 'nitrile_gloves', category: 'hand', item: 'Nitrile Gloves', specification: 'Chemical/fluid protection' },
  // Foot
  { id: 'safety_boots', category: 'foot', item: 'Safety Boots', specification: 'CSA Grade 1, green triangle' },
  { id: 'rubber_boots', category: 'foot', item: 'Rubber Boots', specification: 'Waterproof with safety toe' },
  { id: 'winter_boots', category: 'foot', item: 'Insulated Winter Boots', specification: 'CSA approved, -40°C' },
  // Body
  { id: 'hi_vis_vest', category: 'body', item: 'High-Visibility Vest', specification: 'CSA Z96-15 Class 2' },
  { id: 'hi_vis_jacket', category: 'body', item: 'Hi-Vis Jacket', specification: 'CSA Z96-15 Class 2/3' },
  { id: 'rain_gear', category: 'body', item: 'Rain Gear', specification: 'Waterproof jacket/pants' },
  { id: 'winter_jacket', category: 'body', item: 'Winter Jacket', specification: 'Insulated outerwear' },
  { id: 'coveralls', category: 'body', item: 'Coveralls', specification: 'FR rated if required' },
  { id: 'fr_clothing', category: 'body', item: 'FR Clothing', specification: 'NFPA 2112 / CSA Z462' },
  // Respiratory
  { id: 'dust_mask', category: 'respiratory', item: 'Dust Mask', specification: 'N95 minimum' },
  { id: 'respirator', category: 'respiratory', item: 'Half-Face Respirator', specification: 'With appropriate cartridges' },
  // Fall
  { id: 'harness', category: 'fall', item: 'Fall Arrest Harness', specification: 'CSA Z259.10' },
  { id: 'lanyard', category: 'fall', item: 'Shock-Absorbing Lanyard', specification: 'CSA Z259.11' },
  // Other
  { id: 'sunscreen', category: 'other', item: 'Sunscreen', specification: 'SPF 30+ minimum' },
  { id: 'bug_spray', category: 'other', item: 'Insect Repellent', specification: 'DEET or equivalent' },
  { id: 'cooling_towel', category: 'other', item: 'Cooling Towel/Vest', specification: 'Heat stress prevention' },
  { id: 'hand_warmers', category: 'other', item: 'Hand/Toe Warmers', specification: 'Cold weather operations' },
]

const ppeCategories = [
  { value: 'head', label: 'Head Protection', icon: HardHat, color: 'bg-blue-100 text-blue-700' },
  { value: 'eye', label: 'Eye & Face Protection', icon: Eye, color: 'bg-purple-100 text-purple-700' },
  { value: 'hearing', label: 'Hearing Protection', icon: Ear, color: 'bg-orange-100 text-orange-700' },
  { value: 'hand', label: 'Hand Protection', icon: Hand, color: 'bg-green-100 text-green-700' },
  { value: 'foot', label: 'Foot Protection', icon: Footprints, color: 'bg-amber-100 text-amber-700' },
  { value: 'body', label: 'Body Protection', icon: Shirt, color: 'bg-cyan-100 text-cyan-700' },
  { value: 'respiratory', label: 'Respiratory Protection', icon: Shield, color: 'bg-red-100 text-red-700' },
  { value: 'fall', label: 'Fall Protection', icon: AlertTriangle, color: 'bg-rose-100 text-rose-700' },
  { value: 'other', label: 'Other / Weather', icon: Sun, color: 'bg-gray-100 text-gray-700' }
]

export default function ProjectPPE({ project, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({
    head: true, eye: true, hearing: true, hand: true, foot: true,
    body: true, respiratory: false, fall: false, other: true
  })
  const [newItem, setNewItem] = useState({
    category: 'other', item: '', specification: '', required: false, notes: ''
  })

  // Get current PPE data with safe defaults
  const getPPEData = () => {
    if (!project.ppe) {
      return { selectedItems: ['hi_vis_vest', 'safety_boots'], customItems: [], requirements: {} }
    }
    // Handle both old structure (items) and new structure (selectedItems)
    if (project.ppe.items && !project.ppe.selectedItems) {
      // Old structure - treat items as custom items
      return {
        selectedItems: ['hi_vis_vest', 'safety_boots'],
        customItems: project.ppe.items || [],
        requirements: {},
        siteSpecific: project.ppe.siteSpecific || '',
        clientRequirements: project.ppe.clientRequirements || '',
        inspectionNotes: project.ppe.inspectionNotes || ''
      }
    }
    return {
      selectedItems: project.ppe.selectedItems || [],
      customItems: project.ppe.customItems || [],
      requirements: project.ppe.requirements || {},
      siteSpecific: project.ppe.siteSpecific || '',
      clientRequirements: project.ppe.clientRequirements || '',
      inspectionNotes: project.ppe.inspectionNotes || ''
    }
  }

  const ppe = getPPEData()

  const updatePPE = (updates) => {
    onUpdate({
      ppe: {
        selectedItems: ppe.selectedItems,
        customItems: ppe.customItems,
        requirements: ppe.requirements,
        siteSpecific: ppe.siteSpecific,
        clientRequirements: ppe.clientRequirements,
        inspectionNotes: ppe.inspectionNotes,
        ...updates
      }
    })
  }

  // Toggle a common PPE item
  const toggleItem = (itemId) => {
    const isSelected = ppe.selectedItems.includes(itemId)
    const newSelected = isSelected
      ? ppe.selectedItems.filter(id => id !== itemId)
      : [...ppe.selectedItems, itemId]
    updatePPE({ selectedItems: newSelected })
  }

  // Toggle required status
  const toggleRequired = (itemId) => {
    updatePPE({
      requirements: {
        ...ppe.requirements,
        [itemId]: !ppe.requirements[itemId]
      }
    })
  }

  // Check if item is selected/required
  const isSelected = (itemId) => ppe.selectedItems.includes(itemId)
  const isRequired = (itemId) => ppe.requirements[itemId] || false

  // Add custom item
  const addCustomItem = () => {
    if (!newItem.item.trim()) return
    updatePPE({
      customItems: [...ppe.customItems, { ...newItem, id: `custom_${Date.now()}` }]
    })
    setNewItem({ category: 'other', item: '', specification: '', required: false, notes: '' })
    setShowAddForm(false)
  }

  // Remove custom item
  const removeCustomItem = (itemId) => {
    updatePPE({
      customItems: ppe.customItems.filter(item => item.id !== itemId)
    })
  }

  // Get items by category
  const getItemsByCategory = (category) => commonPPEItems.filter(item => item.category === category)
  const getSelectedCount = (category) => getItemsByCategory(category).filter(item => isSelected(item.id)).length

  // Get summary
  const selectedItems = commonPPEItems.filter(item => isSelected(item.id))
  const requiredCount = selectedItems.filter(item => isRequired(item.id)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <HardHat className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Personal Protective Equipment</h2>
            <p className="text-sm text-gray-500">Select required PPE for this operation</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{selectedItems.length + ppe.customItems.length}</p>
            <p className="text-xs text-gray-500">items selected</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      {ppeCategories.map(category => {
        const items = getItemsByCategory(category.value)
        const selectedCount = getSelectedCount(category.value)
        const Icon = category.icon
        const isExpanded = expandedCategories[category.value]

        return (
          <div key={category.value} className="card">
            <button
              onClick={() => setExpandedCategories(prev => ({ ...prev, [category.value]: !prev[category.value] }))}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">{category.label}</h3>
                  <p className="text-sm text-gray-500">{selectedCount} of {items.length} selected</p>
                </div>
              </div>
              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {isExpanded && (
              <div className="mt-4 grid gap-2">
                {items.map(item => {
                  const selected = isSelected(item.id)
                  const required = isRequired(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                        selected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <label className="flex items-center gap-3 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleItem(item.id)}
                          className="w-5 h-5 rounded border-gray-300 text-green-600"
                        />
                        <div>
                          <p className={`font-medium ${selected ? 'text-gray-900' : 'text-gray-700'}`}>{item.item}</p>
                          <p className="text-xs text-gray-500">{item.specification}</p>
                        </div>
                      </label>
                      {selected && (
                        <button
                          onClick={() => toggleRequired(item.id)}
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {required ? 'Required' : 'Optional'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Custom Items */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Custom PPE Items</h3>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-secondary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Custom
          </button>
        </div>

        {showAddForm && (
          <div className="p-4 bg-gray-50 rounded-lg mb-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Category</label>
                <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="input">
                  {ppeCategories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Item Name *</label>
                <input type="text" value={newItem.item} onChange={(e) => setNewItem({ ...newItem, item: e.target.value })} className="input" placeholder="e.g., Welding Hood" />
              </div>
            </div>
            <div>
              <label className="label">Specification</label>
              <input type="text" value={newItem.specification} onChange={(e) => setNewItem({ ...newItem, specification: e.target.value })} className="input" placeholder="e.g., ANSI Z87.1" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newItem.required} onChange={(e) => setNewItem({ ...newItem, required: e.target.checked })} className="rounded" />
                <span className="text-sm">Required</span>
              </label>
              <div className="flex gap-2">
                <button onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
                <button onClick={addCustomItem} className="btn-primary" disabled={!newItem.item.trim()}>Add</button>
              </div>
            </div>
          </div>
        )}

        {ppe.customItems.length > 0 ? (
          <div className="space-y-2">
            {ppe.customItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.item}</p>
                  <p className="text-xs text-gray-500">{item.specification}</p>
                </div>
                <button onClick={() => removeCustomItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : !showAddForm && (
          <p className="text-sm text-gray-500 text-center py-4">No custom items. Use common items above or add custom ones.</p>
        )}
      </div>

      {/* Notes */}
      <div className="card">
        <h3 className="font-medium text-gray-900 mb-4">Additional Notes</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Site-Specific Requirements</label>
            <textarea
              value={ppe.siteSpecific}
              onChange={(e) => updatePPE({ siteSpecific: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Site-specific PPE requirements..."
            />
          </div>
          <div>
            <label className="label">Client Requirements</label>
            <textarea
              value={ppe.clientRequirements}
              onChange={(e) => updatePPE({ clientRequirements: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Client-specific requirements..."
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {(selectedItems.length > 0 || ppe.customItems.length > 0) && (
        <div className="card bg-green-50 border-green-200">
          <h3 className="font-medium text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            PPE Summary
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Required ({requiredCount})</h4>
              <ul className="space-y-1">
                {selectedItems.filter(i => isRequired(i.id)).map(item => (
                  <li key={item.id} className="text-green-700">• {item.item}</li>
                ))}
                {requiredCount === 0 && <li className="text-green-600 italic">None marked required</li>}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">Recommended ({selectedItems.length - requiredCount + ppe.customItems.length})</h4>
              <ul className="space-y-1">
                {selectedItems.filter(i => !isRequired(i.id)).map(item => (
                  <li key={item.id} className="text-green-700">• {item.item}</li>
                ))}
                {ppe.customItems.map(item => (
                  <li key={item.id} className="text-green-700">• {item.item} (custom)</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
