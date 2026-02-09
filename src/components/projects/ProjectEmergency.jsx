/**
 * ProjectEmergency.jsx
 * Emergency Plan component with multi-site map integration
 * 
 * Features:
 * - Multi-site support with site selector
 * - Muster points (multiple per site, primary designation)
 * - Evacuation routes (primary/secondary lines)
 * - Emergency contacts (project-level)
 * - Nearest facilities (hospital, fire, police)
 * - Emergency procedures (fly-away, injury, fire, etc.)
 * 
 * @location src/components/projects/ProjectEmergency.jsx
 * @action NEW
 */

import React, { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  ShieldAlert,
  MapPin,
  Flag,
  Route,
  Phone,
  Building2,
  Flame,
  Shield,
  Ambulance,
  Users,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Eye,
  Star,
  StarOff,
  Copy,
  ExternalLink,
  Clock,
  Navigation,
  FileText,
  Siren
} from 'lucide-react'
import UnifiedProjectMap from '../map/UnifiedProjectMap'
import { LayerToggles, DrawingTools } from '../map/MapControls'
import { useMapData } from '../../hooks/useMapData'

// ============================================
// CONSTANTS
// ============================================

const EMERGENCY_TYPES = [
  { id: 'flyaway', label: 'Fly-Away / Lost Link', icon: '🚁', color: 'red' },
  { id: 'injury', label: 'Personal Injury', icon: '🩹', color: 'amber' },
  { id: 'fire', label: 'Fire', icon: '🔥', color: 'orange' },
  { id: 'medical', label: 'Medical Emergency', icon: '🏥', color: 'red' },
  { id: 'collision', label: 'Collision / Crash', icon: '💥', color: 'red' },
  { id: 'wildlife', label: 'Wildlife Encounter', icon: '🐻', color: 'amber' },
  { id: 'weather', label: 'Severe Weather', icon: '⛈️', color: 'blue' },
  { id: 'security', label: 'Security Threat', icon: '🚨', color: 'purple' },
  { id: 'environmental', label: 'Environmental Spill', icon: '☢️', color: 'green' },
  { id: 'custom', label: 'Custom Procedure', icon: '📋', color: 'gray', isCustom: true }
]

const DEFAULT_EMERGENCY_CONTACTS = [
  { name: 'Emergency Services', phone: '911', role: 'emergency', isPrimary: true },
  { name: 'NAV CANADA FIC', phone: '1-866-541-4101', role: 'aviation', notes: 'Flight Information Centre - Report fly-away/incidents' },
  { name: 'Transport Canada', phone: '1-888-463-0521', role: 'regulatory', notes: 'Civil Aviation - Serious incident reporting' }
]

const DEFAULT_PROCEDURES = [
  {
    type: 'flyaway',
    steps: [
      'Immediately attempt to regain control using all available means',
      'If control cannot be regained within 30 seconds, assume fly-away',
      'Contact NAV CANADA FIC (1-866-541-4101) immediately',
      'Provide: Aircraft type, last known position, altitude, heading',
      'Alert all crew to monitor for aircraft',
      'Do NOT leave the area until authorized',
      'Complete incident report within 24 hours'
    ]
  },
  {
    type: 'injury',
    steps: [
      'Stop all flight operations immediately',
      'Assess the scene for ongoing hazards',
      'Call 911 if serious injury',
      'Administer first aid within training limits',
      'Do not move injured person unless in immediate danger',
      'Designate someone to meet emergency services',
      'Document incident details'
    ]
  },
  {
    type: 'collision',
    steps: [
      'Ensure safety of all personnel',
      'Secure the crash site - do not disturb wreckage',
      'Call 911 if injuries or property damage',
      'Contact NAV CANADA FIC immediately',
      'Photograph scene before any cleanup',
      'Collect witness statements',
      'Report to Transport Canada within 24 hours if required'
    ]
  },
  {
    type: 'fire',
    steps: [
      'Cease all flight operations immediately and land/secure aircraft',
      'Alert all personnel - shout "FIRE" and indicate location',
      'Call 911 and provide exact location and nature of fire',
      'If safe and trained, attempt to extinguish using appropriate fire extinguisher',
      'If fire cannot be controlled, evacuate to designated muster point',
      'Account for all personnel at muster point',
      'Do not re-enter area until cleared by fire services',
      'Preserve evidence and document for incident report'
    ]
  },
  {
    type: 'medical',
    steps: [
      'Stop all flight operations and secure aircraft',
      'Assess patient responsiveness - check airway, breathing, circulation',
      'Call 911 immediately for serious conditions (chest pain, difficulty breathing, unconsciousness, severe bleeding)',
      'Retrieve first aid kit and AED if available',
      'Administer first aid within your training level',
      'Keep patient calm, warm, and still',
      'Designate crew member to guide emergency services to location',
      'Provide EMS with patient information and what occurred',
      'Document incident and complete required reporting'
    ]
  },
  {
    type: 'wildlife',
    steps: [
      'Cease flight operations - land aircraft at safe location',
      'Do NOT approach, feed, or provoke the animal',
      'Slowly back away while facing the animal - do not run',
      'Make noise to alert others without startling the animal',
      'If animal is aggressive, group together and appear large',
      'For bears: Do not make eye contact, speak calmly, back away slowly',
      'For large predators: If attacked, fight back (do not play dead for cougars/wolves)',
      'Call local conservation/wildlife officers if animal poses ongoing threat',
      'Document encounter and report to site supervisor',
      'Do not resume operations until area is confirmed clear'
    ]
  },
  {
    type: 'weather',
    steps: [
      'Monitor weather conditions continuously - check radar and forecasts',
      'If conditions deteriorate rapidly, cease operations immediately',
      'Land aircraft and secure against wind/precipitation',
      'Secure all loose equipment and gear',
      'If lightning within 10km, suspend operations and seek shelter',
      'Move personnel to vehicles or designated shelter - avoid open areas and tall objects',
      'Wait 30 minutes after last lightning/thunder before resuming',
      'If severe weather warning issued, evacuate site if safe to travel',
      'Maintain communication with operations base',
      'Document weather conditions and decisions made'
    ]
  },
  {
    type: 'security',
    steps: [
      'Cease operations and secure all aircraft and equipment',
      'Do NOT confront or engage with threatening individuals',
      'Move personnel to safe location - vehicle or secure area',
      'Call 911 if threat is imminent or active',
      'For unauthorized persons: Politely inform them of restricted area and request they leave',
      'Document description, vehicle info, and behavior of individuals',
      'If theft/vandalism, do not touch anything - preserve evidence',
      'Notify site owner/manager and company security',
      'Do not resume operations until area is secured',
      'Complete security incident report'
    ]
  },
  {
    type: 'environmental',
    steps: [
      'Stop all operations immediately',
      'Identify the substance and quantity spilled',
      'Ensure personnel safety - evacuate if hazardous fumes or contact risk',
      'Prevent spill from spreading - use absorbent materials, create barriers',
      'Do NOT wash spill into drains, waterways, or soil',
      'Retrieve spill kit and appropriate PPE',
      'Contain and absorb spill following SDS guidelines',
      'For large spills or hazardous materials, call emergency spill response',
      'Notify site owner and environmental authorities as required',
      'Document spill details, response actions, and cleanup for reporting',
      'Properly dispose of contaminated materials'
    ]
  },
  {
    type: 'custom',
    steps: ['']
  }
]

// ============================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, badge = null }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================
// SITE SELECTOR BAR
// ============================================

function SiteSelectorBar({ sites, activeSiteId, onSelectSite }) {
  if (sites.length <= 1) return null
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3 overflow-x-auto">
      <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Site:</span>
      <div className="flex gap-2">
        {sites.map((site, index) => {
          const isActive = site.id === activeSiteId
          const musterCount = site.mapData?.emergency?.musterPoints?.length || 0
          return (
            <button
              key={site.id}
              onClick={() => onSelectSite(site.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isActive ? 'white' : `hsl(${index * 60}, 70%, 50%)` }}
              />
              {site.name}
              {musterCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-red-100 text-red-700'
                }`}>
                  {musterCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// MUSTER POINTS LIST
// ============================================

function MusterPointsList({ musterPoints = [], onUpdate, onRemove, onSetPrimary }) {
  if (musterPoints.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Flag className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600 mb-2">No muster points defined</p>
        <p className="text-sm text-gray-500">
          Use the <strong>Muster Point</strong> tool on the map to add rally points
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      {musterPoints.map((point, index) => {
        const identifier = `M${index + 1}`
        return (
          <div
            key={point.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              point.isPrimary
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
              point.isPrimary ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              <span className="text-xs font-bold">{identifier}</span>
              <Flag className="w-3 h-3" />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={point.name || `Muster Point ${index + 1}`}
                  onChange={(e) => onUpdate(point.id, { name: e.target.value })}
                  className="input text-sm py-1 flex-1"
                  placeholder="Muster point name"
                />
                {point.isPrimary && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                    Primary
                  </span>
                )}
            </div>
            
            <textarea
              value={point.description || ''}
              onChange={(e) => onUpdate(point.id, { description: e.target.value })}
              placeholder="Description (e.g., Near main gate, by large oak tree)"
              rows={2}
              className="input text-sm"
            />
            
            {point.geometry?.coordinates && (
              <p className="text-xs text-gray-500">
                📍 {point.geometry.coordinates[1].toFixed(5)}, {point.geometry.coordinates[0].toFixed(5)}
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onSetPrimary(point.id)}
              className={`p-1.5 rounded ${
                point.isPrimary 
                  ? 'text-red-500 bg-red-100' 
                  : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
              }`}
              title={point.isPrimary ? 'Primary muster point' : 'Set as primary'}
            >
              {point.isPrimary ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onRemove(point.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
              title="Remove muster point"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        )
      })}
    </div>
  )
}

// ============================================
// EVACUATION ROUTES LIST
// ============================================

function EvacuationRoutesList({ routes = [], onUpdate, onRemove, onSetPrimary }) {
  if (routes.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Route className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600 mb-2">No evacuation routes defined</p>
        <p className="text-sm text-gray-500">
          Use the <strong>Evacuation Route</strong> tool on the map to draw routes
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      {routes.map((route, index) => {
        const identifier = `E${index + 1}`
        return (
          <div
            key={route.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              route.isPrimary
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
              route.isPrimary ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              <span className="text-xs font-bold">{identifier}</span>
              <Route className="w-3 h-3" />
            </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={route.name || `Route ${index + 1}`}
                onChange={(e) => onUpdate(route.id, { name: e.target.value })}
                className="input text-sm py-1 flex-1"
                placeholder="Route name"
              />
              {route.isPrimary && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                  Primary
                </span>
              )}
            </div>
            
            <textarea
              value={route.description || ''}
              onChange={(e) => onUpdate(route.id, { description: e.target.value })}
              placeholder="Route description (e.g., Follow access road to main gate)"
              rows={2}
              className="input text-sm"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onSetPrimary(route.id)}
              className={`p-1.5 rounded ${
                route.isPrimary 
                  ? 'text-red-500 bg-red-100' 
                  : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
              }`}
              title={route.isPrimary ? 'Primary route' : 'Set as primary'}
            >
              {route.isPrimary ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onRemove(route.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
              title="Remove route"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        )
      })}
    </div>
  )
}

// ============================================
// EMERGENCY CONTACTS
// ============================================

function EmergencyContactsList({ contacts = [], onChange }) {
  const handleAdd = () => {
    onChange([...contacts, { 
      id: `contact_${Date.now()}`,
      name: '', 
      phone: '', 
      role: '', 
      notes: '',
      isPrimary: contacts.length === 0
    }])
  }
  
  const handleUpdate = (index, field, value) => {
    const updated = [...contacts]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }
  
  const handleRemove = (index) => {
    onChange(contacts.filter((_, i) => i !== index))
  }
  
  const handleLoadDefaults = () => {
    if (contacts.length > 0) {
      if (!confirm('This will add default emergency contacts. Continue?')) return
    }
    onChange([...contacts, ...DEFAULT_EMERGENCY_CONTACTS.map(c => ({
      ...c,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    }))])
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Key contacts for emergency response
        </p>
        <button
          type="button"
          onClick={handleLoadDefaults}
          className="text-sm text-aeria-navy hover:underline flex items-center gap-1"
        >
          <Copy className="w-3 h-3" />
          Add Default Contacts
        </button>
      </div>
      
      {contacts.map((contact, index) => (
        <div key={contact.id || index} className="p-3 bg-gray-50 rounded-lg space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={contact.name || ''}
              onChange={(e) => handleUpdate(index, 'name', e.target.value)}
              placeholder="Name / Organization"
              className="input text-sm py-1.5"
            />
            <input
              type="tel"
              value={contact.phone || ''}
              onChange={(e) => handleUpdate(index, 'phone', e.target.value)}
              placeholder="Phone Number"
              className="input text-sm py-1.5"
            />
            <div className="flex gap-2">
              <select
                value={contact.role || ''}
                onChange={(e) => handleUpdate(index, 'role', e.target.value)}
                className="input text-sm py-1.5 flex-1"
              >
                <option value="">Select role...</option>
                <option value="emergency">Emergency Services</option>
                <option value="aviation">Aviation Authority</option>
                <option value="regulatory">Regulatory</option>
                <option value="client">Client Contact</option>
                <option value="manager">Operations Manager</option>
                <option value="safety">Safety Officer</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={() => handleRemove(index)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <input
            type="text"
            value={contact.notes || ''}
            onChange={(e) => handleUpdate(index, 'notes', e.target.value)}
            placeholder="Notes (when to contact, availability)"
            className="input text-sm py-1.5 w-full"
          />
        </div>
      ))}
      
      <button
        type="button"
        onClick={handleAdd}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Contact
      </button>
    </div>
  )
}

// ============================================
// NEAREST FACILITIES
// ============================================

function NearestFacilitiesForm({ facilities = {}, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...facilities, [field]: value })
  }
  
  return (
    <div className="space-y-4">
      {/* Hospital */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
          <Ambulance className="w-5 h-5" />
          Nearest Hospital
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={facilities.hospitalName || ''}
            onChange={(e) => handleChange('hospitalName', e.target.value)}
            placeholder="Hospital Name"
            className="input text-sm"
          />
          <input
            type="tel"
            value={facilities.hospitalPhone || ''}
            onChange={(e) => handleChange('hospitalPhone', e.target.value)}
            placeholder="Phone Number"
            className="input text-sm"
          />
          <input
            type="text"
            value={facilities.hospitalAddress || ''}
            onChange={(e) => handleChange('hospitalAddress', e.target.value)}
            placeholder="Address"
            className="input text-sm md:col-span-2"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              value={facilities.hospitalDistance || ''}
              onChange={(e) => handleChange('hospitalDistance', e.target.value ? Number(e.target.value) : null)}
              placeholder="Distance"
              className="input text-sm w-24"
            />
            <span className="text-sm text-gray-500">km</span>
            <input
              type="number"
              value={facilities.hospitalTime || ''}
              onChange={(e) => handleChange('hospitalTime', e.target.value ? Number(e.target.value) : null)}
              placeholder="Time"
              className="input text-sm w-24"
            />
            <span className="text-sm text-gray-500">min</span>
          </div>
        </div>
      </div>
      
      {/* Fire Station */}
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
          <Flame className="w-5 h-5" />
          Nearest Fire Station
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={facilities.fireStationName || ''}
            onChange={(e) => handleChange('fireStationName', e.target.value)}
            placeholder="Fire Station Name"
            className="input text-sm"
          />
          <input
            type="tel"
            value={facilities.fireStationPhone || ''}
            onChange={(e) => handleChange('fireStationPhone', e.target.value)}
            placeholder="Non-Emergency Phone"
            className="input text-sm"
          />
        </div>
      </div>
      
      {/* Police */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Nearest Police / RCMP
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={facilities.policeStationName || ''}
            onChange={(e) => handleChange('policeStationName', e.target.value)}
            placeholder="Detachment Name"
            className="input text-sm"
          />
          <input
            type="tel"
            value={facilities.policeStationPhone || ''}
            onChange={(e) => handleChange('policeStationPhone', e.target.value)}
            placeholder="Non-Emergency Phone"
            className="input text-sm"
          />
        </div>
      </div>
    </div>
  )
}

// ============================================
// EMERGENCY PROCEDURES
// ============================================

function EmergencyProceduresList({ procedures = [], onChange }) {
  const [expandedId, setExpandedId] = useState(null)

  // Ensure procedures is always an array (handles legacy data that might be objects)
  const proceduresArray = Array.isArray(procedures) ? procedures : []

  const handleAdd = (type) => {
    const defaultProcedure = DEFAULT_PROCEDURES.find(p => p.type === type)
    const typeInfo = EMERGENCY_TYPES.find(t => t.id === type)
    onChange([...proceduresArray, {
      id: `proc_${Date.now()}`,
      type,
      customName: typeInfo?.isCustom ? '' : null, // Allow custom name for custom procedures
      steps: defaultProcedure?.steps || [''],
      notes: ''
    }])
  }

  const handleUpdateSteps = (procId, steps) => {
    onChange(proceduresArray.map(p => p.id === procId ? { ...p, steps } : p))
  }

  const handleUpdateCustomName = (procId, customName) => {
    onChange(proceduresArray.map(p => p.id === procId ? { ...p, customName } : p))
  }

  const handleRemove = (procId) => {
    onChange(proceduresArray.filter(p => p.id !== procId))
  }

  // Filter out existing types, but always allow 'custom' to be added multiple times
  const existingTypes = proceduresArray.map(p => p.type)
  const availableTypes = EMERGENCY_TYPES.filter(t => t.isCustom || !existingTypes.includes(t.id))

  return (
    <div className="space-y-3">
      {proceduresArray.map((procedure) => {
        const typeInfo = EMERGENCY_TYPES.find(t => t.id === procedure.type)
        const isExpanded = expandedId === procedure.id
        const isCustom = typeInfo?.isCustom
        const displayName = isCustom && procedure.customName ? procedure.customName : (typeInfo?.label || procedure.type)

        return (
          <div key={procedure.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedId(isExpanded ? null : procedure.id)}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{typeInfo?.icon || '⚠️'}</span>
                <span className="font-medium text-gray-900">{displayName}</span>
                {isCustom && !procedure.customName && (
                  <span className="text-xs text-amber-600">(click to name)</span>
                )}
                <span className="text-sm text-gray-500">({procedure.steps?.length || 0} steps)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(procedure.id)
                  }}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 space-y-3">
                {isCustom && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Procedure Name
                    </label>
                    <input
                      type="text"
                      value={procedure.customName || ''}
                      onChange={(e) => handleUpdateCustomName(procedure.id, e.target.value)}
                      placeholder="Enter custom procedure name (e.g., Battery Fire, Drone Recovery)"
                      className="input text-sm w-full"
                    />
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Define step-by-step response procedure:
                </p>
                {(procedure.steps || ['']).map((step, stepIndex) => {
                  const steps = procedure.steps || ['']
                  return (
                    <div key={stepIndex} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center flex-shrink-0 mt-1">
                        {stepIndex + 1}
                      </span>
                      <textarea
                        value={step || ''}
                        onChange={(e) => {
                          const newSteps = [...steps]
                          newSteps[stepIndex] = e.target.value
                          handleUpdateSteps(procedure.id, newSteps)
                        }}
                        placeholder={`Step ${stepIndex + 1}`}
                        rows={2}
                        className="input text-sm flex-1"
                      />
                      <button
                        onClick={() => {
                          const newSteps = steps.filter((_, i) => i !== stepIndex)
                          handleUpdateSteps(procedure.id, newSteps.length ? newSteps : [''])
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
                <button
                  onClick={() => handleUpdateSteps(procedure.id, [...(procedure.steps || []), ''])}
                  className="text-sm text-aeria-navy hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Step
                </button>
              </div>
            )}
          </div>
        )
      })}
      
      {availableTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-sm text-gray-500 py-1">Add procedure:</span>
          {availableTypes.filter(t => !t.isCustom).map(type => (
            <button
              key={type.id}
              onClick={() => handleAdd(type.id)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full flex items-center gap-1"
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
          {/* Custom procedure button - always available */}
          <button
            onClick={() => handleAdd('custom')}
            className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Custom Procedure
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProjectEmergency({ project, onUpdate }) {
  const [showMap, setShowMap] = useState(true)

  // Map controls - lifted to page level so we can render controls outside the map
  const mapControls = useMapData(project, onUpdate, {
    editMode: true,
    allowedLayers: ['siteSurvey', 'flightPlan', 'emergency'],
    initialBasemap: 'streets'
  })

  // Get sites array
  const sites = useMemo(() => {
    return Array.isArray(project?.sites) ? project.sites : []
  }, [project?.sites])
  
  // Active site
  const activeSiteId = project?.activeSiteId || sites[0]?.id || null
  const activeSite = useMemo(() => {
    return sites.find(s => s.id === activeSiteId) || sites[0] || null
  }, [sites, activeSiteId])
  
  // Project-level emergency data
  const emergencyPlan = project?.emergencyPlan || {}
  
  // Site-level emergency map data
  const siteEmergencyData = activeSite?.mapData?.emergency || {}
  
  // ============================================
  // HANDLERS
  // ============================================
  
  const handleSelectSite = useCallback((siteId) => {
    onUpdate({ activeSiteId: siteId })
  }, [onUpdate])
  
  // Update project-level emergency plan
  const updateEmergencyPlan = useCallback((updates) => {
    onUpdate({
      emergencyPlan: {
        ...emergencyPlan,
        ...updates
      }
    })
  }, [emergencyPlan, onUpdate])
  
  // Update muster point
  const handleUpdateMusterPoint = useCallback((pointId, updates) => {
    if (!activeSiteId) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      const musterPoints = site.mapData?.emergency?.musterPoints || []
      const updatedPoints = musterPoints.map(p =>
        p.id === pointId ? { ...p, ...updates } : p
      )
      
      return {
        ...site,
        mapData: {
          ...site.mapData,
          emergency: {
            ...site.mapData?.emergency,
            musterPoints: updatedPoints
          }
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  // Remove muster point
  const handleRemoveMusterPoint = useCallback((pointId) => {
    if (!activeSiteId) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      const musterPoints = site.mapData?.emergency?.musterPoints || []
      
      return {
        ...site,
        mapData: {
          ...site.mapData,
          emergency: {
            ...site.mapData?.emergency,
            musterPoints: musterPoints.filter(p => p.id !== pointId)
          }
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  // Set primary muster point
  const handleSetPrimaryMusterPoint = useCallback((pointId) => {
    if (!activeSiteId) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      const musterPoints = site.mapData?.emergency?.musterPoints || []
      const updatedPoints = musterPoints.map(p => ({
        ...p,
        isPrimary: p.id === pointId
      }))
      
      return {
        ...site,
        mapData: {
          ...site.mapData,
          emergency: {
            ...site.mapData?.emergency,
            musterPoints: updatedPoints
          }
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  // Update evacuation route
  const handleUpdateRoute = useCallback((routeId, updates) => {
    if (!activeSiteId) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      const routes = site.mapData?.emergency?.evacuationRoutes || []
      const updatedRoutes = routes.map(r =>
        r.id === routeId ? { ...r, ...updates } : r
      )
      
      return {
        ...site,
        mapData: {
          ...site.mapData,
          emergency: {
            ...site.mapData?.emergency,
            evacuationRoutes: updatedRoutes
          }
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  // Remove evacuation route
  const handleRemoveRoute = useCallback((routeId) => {
    if (!activeSiteId) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      const routes = site.mapData?.emergency?.evacuationRoutes || []
      
      return {
        ...site,
        mapData: {
          ...site.mapData,
          emergency: {
            ...site.mapData?.emergency,
            evacuationRoutes: routes.filter(r => r.id !== routeId)
          }
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  // Set primary route
  const handleSetPrimaryRoute = useCallback((routeId) => {
    if (!activeSiteId) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      const routes = site.mapData?.emergency?.evacuationRoutes || []
      const updatedRoutes = routes.map(r => ({
        ...r,
        isPrimary: r.id === routeId
      }))
      
      return {
        ...site,
        mapData: {
          ...site.mapData,
          emergency: {
            ...site.mapData?.emergency,
            evacuationRoutes: updatedRoutes
          }
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Emergency Plan</h2>
          <p className="text-gray-500">Define muster points, evacuation routes, and emergency procedures</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`btn ${showMap ? 'btn-primary' : 'btn-secondary'} inline-flex items-center gap-2`}
          >
            {showMap ? <Eye className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            {showMap ? 'Viewing Map' : 'Show Map'}
          </button>
        </div>
      </div>
      
      {/* Site Selector */}
      <SiteSelectorBar
        sites={sites}
        activeSiteId={activeSiteId}
        onSelectSite={handleSelectSite}
      />
      
      {/* Emergency Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Siren className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">In an Emergency: Call 911</h3>
            <p className="text-sm text-red-700 mt-1">
              For fly-away incidents, also contact NAV CANADA FIC: <strong>1-866-541-4101</strong>
            </p>
          </div>
        </div>
      </div>
      
      {/* Map Controls and Map */}
      {showMap && (
        <div className="space-y-3">
          {/* Controls row - outside the map for better interaction */}
          <div className="flex flex-wrap gap-3 items-center">
            <LayerToggles
              visibleLayers={mapControls.visibleLayers}
              onToggleLayer={mapControls.toggleLayer}
              allowedLayers={['siteSurvey', 'flightPlan', 'emergency']}
              compact={true}
            />
            <DrawingTools
              drawingMode={mapControls.drawingMode}
              isDrawing={mapControls.isDrawing}
              drawingPoints={mapControls.drawingPoints}
              onStartDrawing={mapControls.startDrawing}
              onCancelDrawing={mapControls.cancelDrawing}
              onCompleteDrawing={mapControls.completeDrawing}
              onRemoveLastPoint={mapControls.removeLastDrawingPoint}
              activeLayer="emergency"
              editMode={true}
            />
            {/* View All Sites Toggle */}
            {sites.length > 1 && (
              <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={mapControls.showAllSites}
                  onChange={(e) => mapControls.setShowAllSites(e.target.checked)}
                  className="w-4 h-4 text-aeria-navy rounded focus:ring-aeria-navy"
                />
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">All Sites</span>
              </label>
            )}
          </div>

          {/* Map */}
          <div className="card p-0 overflow-hidden">
            <UnifiedProjectMap
              project={project}
              onUpdate={onUpdate}
              editMode={true}
              activeLayer="emergency"
              height="400px"
              allowedLayers={['siteSurvey', 'flightPlan', 'emergency']}
              showLegend={true}
              showControls={false}
              externalMapData={mapControls}
              onSiteChange={handleSelectSite}
            />
          </div>
        </div>
      )}
      
      {/* Muster Points */}
      <CollapsibleSection
        title="Muster Points"
        icon={Flag}
        badge={siteEmergencyData.musterPoints?.length > 0 ? `${siteEmergencyData.musterPoints.length} points` : null}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <Info className="w-4 h-4 inline mr-1" />
            Use the <strong>Muster Point</strong> drawing tool on the map to add rally points.
            Designate one as the primary muster point.
          </p>
        </div>
        
        <MusterPointsList
          musterPoints={siteEmergencyData.musterPoints || []}
          onUpdate={handleUpdateMusterPoint}
          onRemove={handleRemoveMusterPoint}
          onSetPrimary={handleSetPrimaryMusterPoint}
        />
      </CollapsibleSection>
      
      {/* Evacuation Routes */}
      <CollapsibleSection
        title="Evacuation Routes"
        icon={Route}
        badge={siteEmergencyData.evacuationRoutes?.length > 0 ? `${siteEmergencyData.evacuationRoutes.length} routes` : null}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <Info className="w-4 h-4 inline mr-1" />
            Use the <strong>Evacuation Route</strong> drawing tool on the map to draw escape paths.
            Define primary and secondary routes.
          </p>
        </div>
        
        <EvacuationRoutesList
          routes={siteEmergencyData.evacuationRoutes || []}
          onUpdate={handleUpdateRoute}
          onRemove={handleRemoveRoute}
          onSetPrimary={handleSetPrimaryRoute}
        />
      </CollapsibleSection>
      
      {/* Emergency Contacts */}
      <CollapsibleSection
        title="Emergency Contacts"
        icon={Phone}
        badge={emergencyPlan.contacts?.length > 0 ? `${emergencyPlan.contacts.length}` : null}
      >
        <EmergencyContactsList
          contacts={emergencyPlan.contacts || []}
          onChange={(contacts) => updateEmergencyPlan({ contacts })}
        />
      </CollapsibleSection>
      
      {/* Nearest Facilities */}
      <CollapsibleSection
        title="Nearest Emergency Facilities"
        icon={Building2}
        defaultOpen={false}
      >
        <NearestFacilitiesForm
          facilities={emergencyPlan.facilities || {}}
          onChange={(facilities) => updateEmergencyPlan({ facilities })}
        />
      </CollapsibleSection>
      
      {/* Emergency Procedures */}
      <CollapsibleSection
        title="Emergency Response Procedures"
        icon={FileText}
        badge={emergencyPlan.procedures?.length > 0 ? `${emergencyPlan.procedures.length}` : null}
        defaultOpen={false}
      >
        <EmergencyProceduresList
          procedures={emergencyPlan.procedures || []}
          onChange={(procedures) => updateEmergencyPlan({ procedures })}
        />
      </CollapsibleSection>
      
      {/* Additional Notes */}
      <CollapsibleSection
        title="Additional Emergency Notes"
        icon={AlertTriangle}
        defaultOpen={false}
      >
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Use bullet points (• or -) for organized notes. Press Enter to continue with bullets.
          </p>
          <textarea
            value={emergencyPlan.notes || ''}
            onChange={(e) => updateEmergencyPlan({ notes: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                const textarea = e.target
                const value = textarea.value
                const selectionStart = textarea.selectionStart
                const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
                const currentLine = value.substring(lineStart, selectionStart)
                const bulletMatch = currentLine.match(/^(\s*)(•|-|\*)\s/)

                if (bulletMatch) {
                  e.preventDefault()
                  const indent = bulletMatch[1]
                  const bullet = bulletMatch[2]
                  const lineContent = currentLine.replace(/^(\s*)(•|-|\*)\s*/, '')

                  if (lineContent.trim() === '') {
                    const newValue = value.substring(0, lineStart) + value.substring(selectionStart)
                    updateEmergencyPlan({ notes: newValue })
                    setTimeout(() => {
                      textarea.selectionStart = textarea.selectionEnd = lineStart
                    }, 0)
                  } else {
                    const insertion = `\n${indent}${bullet} `
                    const newValue = value.substring(0, selectionStart) + insertion + value.substring(selectionStart)
                    updateEmergencyPlan({ notes: newValue })
                    setTimeout(() => {
                      textarea.selectionStart = textarea.selectionEnd = selectionStart + insertion.length
                    }, 0)
                  }
                }
              }
            }}
            placeholder="• Site-specific hazards&#10;• Special access requirements&#10;• Local emergency contact notes..."
            rows={5}
            className="input font-mono text-sm"
          />
        </div>
      </CollapsibleSection>
    </div>
  )
}

ProjectEmergency.propTypes = {
  project: PropTypes.shape({
    emergencyPlan: PropTypes.object,
    sites: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}
