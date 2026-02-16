/**
 * ProjectFlightPlan.jsx
 * Flight Plan component with multi-site map integration
 * 
 * Features:
 * - Multi-site support with site selector
 * - Unified map for launch/recovery/pilot position/flight geography
 * - Operation type selection (VLOS/EVLOS/BVLOS)
 * - Aircraft selection from project fleet
 * - Weather minimums configuration
 * - Contingency procedures
 * - SORA-aligned volume calculations
 * 
 * @location src/components/projects/ProjectFlightPlan.jsx
 * @action NEW
 */

import React, { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  Plane,
  MapPin,
  Navigation,
  Target,
  User,
  Square,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Eye,
  Cloud,
  Wind,
  Thermometer,
  Gauge,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Settings,
  Copy,
  ExternalLink,
  Radio,
  Navigation2,
  Users,
  ShieldAlert,
  Route,
  Box
} from 'lucide-react'
import UnifiedProjectMap from '../map/UnifiedProjectMap'
import { LayerToggles, DrawingTools } from '../map/MapControls'
import { useMapData } from '../../hooks/useMapData'
import {
  createDefaultSite,
  getSiteStats,
  calculatePolygonArea,
  POPULATION_CATEGORIES,
  generateSORAVolumes
} from '../../lib/mapDataStructures'
import NoAircraftAssignedModal from '../NoAircraftAssignedModal'
import { FlightPathGenerator } from '../map/FlightPathGenerator'
import { WaypointEditor } from '../map/WaypointEditor'
import { AltitudeProfileView } from '../map/AltitudeProfileView'
import { use3DMapFeatures } from '../../hooks/use3DMapFeatures'
import {
  waypointsTo3DGeoJSON,
  generateAltitudeProfile,
  calculatePathDistance,
  calculateFlightDuration
} from '../../lib/flightPathUtils'

// ============================================
// CONSTANTS
// ============================================

const OPERATION_TYPES = [
  { 
    value: 'VLOS', 
    label: 'VLOS', 
    description: 'Visual Line of Sight - Pilot maintains direct visual contact',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  { 
    value: 'EVLOS', 
    label: 'EVLOS', 
    description: 'Extended VLOS - Visual observers extend operational range',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  { 
    value: 'BVLOS', 
    label: 'BVLOS', 
    description: 'Beyond VLOS - No direct visual contact with RPAS',
    color: 'bg-red-100 text-red-800 border-red-300'
  }
]

const FLIGHT_GEOGRAPHY_METHODS = [
  { value: 'inside-out', label: 'Inside-Out', description: 'Start with flight path, add buffers outward' },
  { value: 'reverse', label: 'Reverse', description: 'Start with available ground, determine max flight area' },
  { value: 'manual', label: 'Manual', description: 'Draw flight geography directly on map' },
  { value: 'sameAsBoundary', label: 'Same as Boundary', description: 'Use the operations boundary as flight geography' }
]

const AREA_TYPES = [
  { value: 'point', label: 'Point Operation', description: 'Stationary or near-stationary flight around a single point' },
  { value: 'corridor', label: 'Corridor / Linear', description: 'Flight along a linear path (pipeline, road, powerline)' },
  { value: 'area', label: 'Area Survey', description: 'Flight covering a defined area with multiple passes' }
]

const GROUND_RISK_BUFFER_METHODS = [
  { value: 'altitude', label: 'Altitude-Based', description: '1:1 ratio - buffer equals flight altitude' },
  { value: 'ballistic', label: 'Ballistic Calculation', description: 'Based on max speed, altitude, and glide ratio' },
  { value: 'fixed', label: 'Fixed Distance', description: 'Manual fixed-distance buffer' },
  { value: 'containment', label: 'With Containment', description: 'Reduced buffer with demonstrated containment' }
]

const DEFAULT_CONTINGENCIES = [
  { trigger: 'Loss of C2 Link', action: 'Return to Home (RTH) automatically engages. If no RTH within 30 seconds, land in place.', priority: 'high' },
  { trigger: 'Low Battery Warning', action: 'Immediately return to launch point. Land with minimum 20% remaining.', priority: 'high' },
  { trigger: 'GPS Loss', action: 'Switch to ATTI mode, maintain visual contact, manual return and land.', priority: 'high' },
  { trigger: 'Fly-Away', action: 'Attempt to regain control. If unsuccessful, contact FIC immediately.', priority: 'critical' },
  { trigger: 'Deteriorating Weather', action: 'Land immediately if conditions fall below minimums.', priority: 'medium' },
  { trigger: 'Aircraft in Vicinity', action: 'Descend and hold position or land. Give way to all manned aircraft.', priority: 'high' }
]

const AIRSPACE_CLASSES = [
  { value: 'A', label: 'Class A', description: 'Controlled - IFR only', controlled: true },
  { value: 'B', label: 'Class B', description: 'Controlled - Major airports', controlled: true },
  { value: 'C', label: 'Class C', description: 'Controlled - Busy airports', controlled: true },
  { value: 'D', label: 'Class D', description: 'Controlled - Towered airports', controlled: true },
  { value: 'E', label: 'Class E', description: 'Controlled - Low altitude', controlled: true },
  { value: 'F', label: 'Class F', description: 'Special use airspace', controlled: false },
  { value: 'G', label: 'Class G', description: 'Uncontrolled airspace', controlled: false }
]

// Emergency Response Types - matches ProjectEmergency.jsx
const EMERGENCY_RESPONSE_TYPES = [
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

// Default emergency response procedures - matches ProjectEmergency.jsx
const DEFAULT_EMERGENCY_PROCEDURES = [
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
  }
]

// ============================================
// POPULATION CATEGORY SELECTOR COMPONENT
// ============================================

function PopulationCategorySelector({ value, onChange, label = "Population Category" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {Object.entries(POPULATION_CATEGORIES).map(([id, category]) => {
          const isSelected = value === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-aeria-navy bg-aeria-navy/5 ring-2 ring-aeria-navy/20'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className={`text-sm font-medium ${isSelected ? 'text-aeria-navy' : 'text-gray-900'}`}>
                  {category.label}
                </span>
              </div>
              <p className="text-xs text-gray-500">{category.density}</p>
            </button>
          )
        })}
      </div>
      {value && (
        <p className="mt-2 text-sm text-gray-600">
          <Info className="w-4 h-4 inline mr-1" />
          {POPULATION_CATEGORIES[value]?.description}
        </p>
      )}
    </div>
  )
}

// ============================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, badge = null, status = null }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  const statusColors = {
    complete: 'bg-green-100 text-green-700',
    partial: 'bg-amber-100 text-amber-700',
    missing: 'bg-red-100 text-red-700'
  }
  
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
            <span className="px-2 py-0.5 text-xs font-medium bg-aeria-navy/10 text-aeria-navy rounded-full">
              {badge}
            </span>
          )}
          {status && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[status]}`}>
              {status === 'complete' ? '✓ Complete' : status === 'partial' ? 'Partial' : 'Missing'}
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
          return (
            <button
              key={site.id}
              onClick={() => onSelectSite(site.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-aeria-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isActive ? 'white' : `hsl(${index * 60}, 70%, 50%)` }}
              />
              {site.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// OPERATION TYPE SELECTOR
// ============================================

function OperationTypeSelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Operation Type</label>
      <div className="grid grid-cols-3 gap-3">
        {OPERATION_TYPES.map(type => {
          const isSelected = value === type.value
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? `${type.color} ring-2 ring-offset-2`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-lg mb-1">{type.label}</div>
              <p className="text-xs opacity-80">{type.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// AIRCRAFT SELECTOR
// ============================================

function SiteAircraftSelector({
  projectAircraft = [],
  siteAircraft = [],
  primaryAircraftId = null,
  onToggleAircraft,
  onSetPrimary,
  onAddAircraft
}) {
  const siteAircraftIds = siteAircraft.map(a => typeof a === 'string' ? a : a.id)

  // No aircraft in project - show prominent call to action
  if (projectAircraft.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Plane className="w-6 h-6 text-amber-600" />
        </div>
        <h4 className="font-medium text-amber-900 mb-1">No Aircraft Available</h4>
        <p className="text-sm text-amber-700 mb-4">
          Add aircraft to your inventory to assign them to this site.
        </p>
        {onAddAircraft && (
          <button
            type="button"
            onClick={onAddAircraft}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Aircraft
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <Info className="w-4 h-4 inline mr-1" />
          Select aircraft for this site. Mark one as <strong>primary</strong> for SORA calculations.
        </p>
      </div>

      <div className="space-y-2">
        {projectAircraft.map(aircraft => {
          const isAssigned = siteAircraftIds.includes(aircraft.id)
          const isPrimary = primaryAircraftId === aircraft.id

          return (
            <div
              key={aircraft.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isAssigned
                  ? 'bg-aeria-navy/5 border-aeria-navy'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={isAssigned}
                onChange={() => onToggleAircraft(aircraft.id)}
                className="w-4 h-4 text-aeria-navy rounded focus:ring-aeria-navy"
              />
              <Plane className={`w-5 h-5 ${isAssigned ? 'text-aeria-navy' : 'text-gray-400'}`} />
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${isAssigned ? 'text-aeria-navy' : 'text-gray-900'}`}>
                  {aircraft.nickname || `${aircraft.make} ${aircraft.model}`}
                </p>
                <p className="text-xs text-gray-500">
                  {aircraft.make} {aircraft.model} • {aircraft.mtow ? `${aircraft.mtow}kg` : 'Weight N/A'}
                  {aircraft.maxSpeed && ` • Max ${aircraft.maxSpeed}m/s`}
                </p>
              </div>

              {isAssigned && (
                <button
                  type="button"
                  onClick={() => onSetPrimary(aircraft.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    isPrimary
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {isPrimary ? '★ Primary' : 'Set Primary'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {siteAircraftIds.length > 0 && !primaryAircraftId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Select a primary aircraft for SORA calculations.
          </p>
        </div>
      )}

      {siteAircraftIds.length === 0 && (
        <p className="text-sm text-gray-500 italic text-center py-2">
          No aircraft assigned to this site yet.
        </p>
      )}

      {/* Add more aircraft button */}
      {onAddAircraft && (
        <button
          type="button"
          onClick={onAddAircraft}
          className="w-full p-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-aeria-navy hover:text-aeria-navy hover:bg-aeria-sky/20 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add More Aircraft
        </button>
      )}
    </div>
  )
}

// ============================================
// WEATHER MINIMUMS FORM
// ============================================

// Default weather minimums based on operation type
const WEATHER_DEFAULTS = {
  vlos: {
    minVisibility: 3,    // 3 SM (CARs 901.40)
    minCeiling: 500,     // 500 ft AGL
    maxWind: 10,         // 10 m/s (36 km/h)
    maxGust: 12,         // 12 m/s (43 km/h)
    precipitation: false,
    notes: 'Standard VLOS minimums per CARs Part IX'
  },
  advanced: {
    minVisibility: 3,
    minCeiling: 500,
    maxWind: 8,
    maxGust: 10,
    precipitation: false,
    notes: 'Advanced operation minimums - operations near people'
  },
  bvlos: {
    minVisibility: 5,
    minCeiling: 1000,
    maxWind: 8,
    maxGust: 10,
    precipitation: false,
    notes: 'BVLOS minimums - enhanced weather requirements'
  }
}

function WeatherMinimumsForm({ weatherMinimums = {}, onChange, operationType }) {
  const handleChange = (field, value) => {
    onChange({ ...weatherMinimums, [field]: value })
  }

  const loadDefaults = (type) => {
    const defaults = WEATHER_DEFAULTS[type] || WEATHER_DEFAULTS.vlos
    onChange({ ...weatherMinimums, ...defaults })
  }

  const hasValues = weatherMinimums.minVisibility || weatherMinimums.minCeiling ||
                    weatherMinimums.maxWind || weatherMinimums.maxGust

  return (
    <div className="space-y-4">
      {/* Default buttons */}
      {!hasValues && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800 mb-2">
            <Info className="w-4 h-4 inline mr-1" />
            Load weather minimums based on operation type:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadDefaults('vlos')}
              className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              VLOS Defaults
            </button>
            <button
              type="button"
              onClick={() => loadDefaults('advanced')}
              className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              Advanced Defaults
            </button>
            <button
              type="button"
              onClick={() => loadDefaults('bvlos')}
              className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              BVLOS Defaults
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <Eye className="w-4 h-4" />
          Min Visibility
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.5"
            min="0"
            value={weatherMinimums.minVisibility || ''}
            onChange={(e) => handleChange('minVisibility', e.target.value ? Number(e.target.value) : null)}
            className="input w-20"
          />
          <span className="text-sm text-gray-500">SM</span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <Cloud className="w-4 h-4" />
          Min Ceiling
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="100"
            min="0"
            value={weatherMinimums.minCeiling || ''}
            onChange={(e) => handleChange('minCeiling', e.target.value ? Number(e.target.value) : null)}
            className="input w-20"
          />
          <span className="text-sm text-gray-500">ft AGL</span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <Wind className="w-4 h-4" />
          Max Wind
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="1"
            min="0"
            value={weatherMinimums.maxWind || ''}
            onChange={(e) => handleChange('maxWind', e.target.value ? Number(e.target.value) : null)}
            className="input w-20"
          />
          <span className="text-sm text-gray-500">m/s</span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
          <Gauge className="w-4 h-4" />
          Max Gust
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="1"
            min="0"
            value={weatherMinimums.maxGust || ''}
            onChange={(e) => handleChange('maxGust', e.target.value ? Number(e.target.value) : null)}
            className="input w-20"
          />
          <span className="text-sm text-gray-500">m/s</span>
        </div>
      </div>
      
      <div className="col-span-2 md:col-span-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={weatherMinimums.precipitation === false}
            onChange={(e) => handleChange('precipitation', !e.target.checked)}
            className="w-4 h-4 text-aeria-navy rounded focus:ring-aeria-navy"
          />
          <span className="text-sm text-gray-700">No precipitation allowed during operation</span>
        </label>
      </div>
      
        <div className="col-span-2 md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Weather Notes</label>
          <textarea
            value={weatherMinimums.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional weather considerations..."
            rows={2}
            className="input"
          />
        </div>
      </div>
    </div>
  )
}

// ============================================
// CONTINGENCY LIST
// ============================================

function ContingencyList({ contingencies = [], onChange }) {
  const handleAdd = () => {
    onChange([...contingencies, { trigger: '', action: '', priority: 'medium' }])
  }
  
  const handleUpdate = (index, field, value) => {
    const updated = [...contingencies]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }
  
  const handleRemove = (index) => {
    onChange(contingencies.filter((_, i) => i !== index))
  }
  
  const handleLoadDefaults = () => {
    if (contingencies.length > 0) {
      if (!confirm('This will replace existing contingencies. Continue?')) return
    }
    onChange(DEFAULT_CONTINGENCIES)
  }
  
  const priorityColors = {
    critical: 'bg-red-100 text-red-700 border-red-300',
    high: 'bg-amber-100 text-amber-700 border-amber-300',
    medium: 'bg-blue-100 text-blue-700 border-blue-300',
    low: 'bg-gray-100 text-gray-700 border-gray-300'
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Define contingency procedures for abnormal situations
        </p>
        <button
          type="button"
          onClick={handleLoadDefaults}
          className="text-sm text-aeria-navy hover:underline flex items-center gap-1"
        >
          <Copy className="w-3 h-3" />
          Load Defaults
        </button>
      </div>
      
      {contingencies.map((contingency, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <select
              value={contingency.priority || 'medium'}
              onChange={(e) => handleUpdate(index, 'priority', e.target.value)}
              className={`px-2 py-1 text-xs font-medium rounded border ${priorityColors[contingency.priority || 'medium']}`}
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <input
              type="text"
              value={contingency.trigger || ''}
              onChange={(e) => handleUpdate(index, 'trigger', e.target.value)}
              placeholder="Trigger condition..."
              className="input flex-1 text-sm py-1"
            />
            
            <button
              onClick={() => handleRemove(index)}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <textarea
            value={contingency.action || ''}
            onChange={(e) => handleUpdate(index, 'action', e.target.value)}
            placeholder="Response action..."
            rows={2}
            className="input text-sm"
          />
        </div>
      ))}
      
      <button
        type="button"
        onClick={handleAdd}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Contingency
      </button>
    </div>
  )
}

// ============================================
// EMERGENCY RESPONSE PROCEDURES
// ============================================

function EmergencyResponseProcedures({ procedures = [], onChange, onNavigateToEmergency }) {
  const [expandedId, setExpandedId] = useState(null)

  // Ensure procedures is always an array
  const proceduresArray = Array.isArray(procedures) ? procedures : []

  const handleAdd = (type) => {
    const defaultProcedure = DEFAULT_EMERGENCY_PROCEDURES.find(p => p.type === type)
    const typeInfo = EMERGENCY_RESPONSE_TYPES.find(t => t.id === type)
    onChange([...proceduresArray, {
      id: `proc_${Date.now()}`,
      type,
      customName: typeInfo?.isCustom ? '' : null,
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

  const handleLoadDefaults = () => {
    if (proceduresArray.length > 0) {
      if (!confirm('This will replace existing procedures. Continue?')) return
    }
    const defaultProcedures = DEFAULT_EMERGENCY_PROCEDURES.filter(p => p.type !== 'custom').map(p => ({
      id: `proc_${Date.now()}_${p.type}`,
      type: p.type,
      steps: p.steps,
      notes: ''
    }))
    onChange(defaultProcedures)
  }

  // Filter out existing types, but always allow 'custom' to be added multiple times
  const existingTypes = proceduresArray.map(p => p.type)
  const availableTypes = EMERGENCY_RESPONSE_TYPES.filter(t => t.isCustom || !existingTypes.includes(t.id))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Define emergency response procedures for site-specific situations
        </p>
        <button
          type="button"
          onClick={handleLoadDefaults}
          className="text-sm text-aeria-navy hover:underline flex items-center gap-1"
        >
          <Copy className="w-3 h-3" />
          Load All Defaults
        </button>
      </div>

      {proceduresArray.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            No emergency response procedures defined. Click "Load All Defaults" to populate standard procedures, or add specific ones below.
          </p>
        </div>
      )}

      {proceduresArray.map((procedure) => {
        const typeInfo = EMERGENCY_RESPONSE_TYPES.find(t => t.id === procedure.type)
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
                  Step-by-step response procedure:
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

      {onNavigateToEmergency && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>For muster points, evacuation routes, and emergency contacts, see Emergency Plan.</span>
          </div>
          <button
            onClick={onNavigateToEmergency}
            className="text-sm text-aeria-navy hover:underline flex items-center gap-1"
          >
            View Emergency Plan
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// FLIGHT PARAMETERS SUMMARY
// ============================================

function FlightParametersSummary({ site, projectFlightPlan }) {
  const mapData = site?.mapData?.flightPlan || {}
  const siteFlightPlan = site?.flightPlan || {}
  
  const hasLaunch = !!mapData.launchPoint
  const hasRecovery = !!mapData.recoveryPoint
  const hasPilot = !!mapData.pilotPosition
  const hasFlightGeography = !!mapData.flightGeography
  
  const flightGeographyArea = hasFlightGeography 
    ? calculatePolygonArea(mapData.flightGeography) 
    : null
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className={`p-3 rounded-lg ${hasLaunch ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-1">
          <Navigation className={`w-4 h-4 ${hasLaunch ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">Launch Point</span>
        </div>
        <p className={`text-xs ${hasLaunch ? 'text-green-700' : 'text-gray-500'}`}>
          {hasLaunch ? 'Set on map' : 'Not set'}
        </p>
      </div>
      
      <div className={`p-3 rounded-lg ${hasRecovery ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-1">
          <Target className={`w-4 h-4 ${hasRecovery ? 'text-orange-600' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">Recovery Point</span>
        </div>
        <p className={`text-xs ${hasRecovery ? 'text-green-700' : 'text-gray-500'}`}>
          {hasRecovery ? 'Set on map' : 'Not set'}
        </p>
      </div>
      
      <div className={`p-3 rounded-lg ${hasPilot ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-1">
          <User className={`w-4 h-4 ${hasPilot ? 'text-purple-600' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">Pilot Position</span>
        </div>
        <p className={`text-xs ${hasPilot ? 'text-green-700' : 'text-gray-500'}`}>
          {hasPilot ? 'Set on map' : 'Not set'}
        </p>
      </div>
      
      <div className={`p-3 rounded-lg ${hasFlightGeography ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-1">
          <Square className={`w-4 h-4 ${hasFlightGeography ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="text-sm font-medium">Flight Geography</span>
        </div>
        <p className={`text-xs ${hasFlightGeography ? 'text-green-700' : 'text-gray-500'}`}>
          {flightGeographyArea 
            ? `${(flightGeographyArea / 10000).toFixed(2)} ha`
            : 'Not drawn'}
        </p>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProjectFlightPlan({ project, onUpdate, onNavigateToSection }) {
  const [showMap, setShowMap] = useState(true)
  const [showAircraftModal, setShowAircraftModal] = useState(false)
  const [selectedWaypointId, setSelectedWaypointId] = useState(null)

  // Map controls - lifted to page level so we can render controls outside the map
  const mapControls = useMapData(project, onUpdate, {
    editMode: true,
    allowedLayers: ['siteSurvey', 'flightPlan'],
    initialBasemap: 'streets'
  })

  // Get sites array with defensive check
  const sites = useMemo(() => {
    return Array.isArray(project?.sites) ? project.sites : []
  }, [project?.sites])
  
  // Active site
  const activeSiteId = project?.activeSiteId || sites[0]?.id || null
  const activeSite = useMemo(() => {
    return sites.find(s => s.id === activeSiteId) || sites[0] || null
  }, [sites, activeSiteId])
  
  // Project-level flight plan data
  const projectFlightPlan = project?.flightPlan || {}
  
  // Site-level flight plan data
  const siteFlightPlan = activeSite?.flightPlan || {}
  
  // ============================================
  // HANDLERS
  // ============================================
  
  const handleSelectSite = useCallback((siteId) => {
    onUpdate({ activeSiteId: siteId })
  }, [onUpdate])
  
  // Update project-level flight plan
  const updateProjectFlightPlan = useCallback((updates) => {
    onUpdate({
      flightPlan: {
        ...projectFlightPlan,
        ...updates
      }
    })
  }, [projectFlightPlan, onUpdate])
  
  // Update site-level flight plan
  const updateSiteFlightPlan = useCallback((updates) => {
    if (!activeSiteId) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      return {
        ...site,
        flightPlan: {
          ...site.flightPlan,
          ...updates
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  // Toggle aircraft selection
  const handleToggleAircraft = useCallback((aircraftId) => {
    const currentAircraft = projectFlightPlan.aircraft || []
    const exists = currentAircraft.some(a => a.id === aircraftId)
    
    let updatedAircraft
    if (exists) {
      updatedAircraft = currentAircraft.filter(a => a.id !== aircraftId)
    } else {
      // Add aircraft - would need to fetch full aircraft data
      updatedAircraft = [...currentAircraft, { id: aircraftId }]
    }
    
    updateProjectFlightPlan({ aircraft: updatedAircraft })
  }, [projectFlightPlan.aircraft, updateProjectFlightPlan])
  
  // Toggle site-level aircraft assignment
  const handleToggleSiteAircraft = useCallback((aircraftId) => {
    const currentAircraft = siteFlightPlan.aircraft || []
    const exists = currentAircraft.includes(aircraftId)
    
    let updatedAircraft
    let updatedPrimary = siteFlightPlan.primaryAircraftId
    
    if (exists) {
      updatedAircraft = currentAircraft.filter(id => id !== aircraftId)
      // Clear primary if we're removing the primary aircraft
      if (updatedPrimary === aircraftId) {
        updatedPrimary = updatedAircraft[0] || null
      }
    } else {
      updatedAircraft = [...currentAircraft, aircraftId]
      // Auto-set primary if this is the first aircraft
      if (!updatedPrimary && updatedAircraft.length === 1) {
        updatedPrimary = aircraftId
      }
    }
    
    updateSiteFlightPlan({ 
      aircraft: updatedAircraft,
      primaryAircraftId: updatedPrimary
    })
  }, [siteFlightPlan.aircraft, siteFlightPlan.primaryAircraftId, updateSiteFlightPlan])
  
  // Set primary aircraft for site
  const handleSetPrimaryAircraft = useCallback((aircraftId) => {
    updateSiteFlightPlan({ primaryAircraftId: aircraftId })
  }, [updateSiteFlightPlan])

  // Generate SORA volumes (contingency volume and ground risk buffer)
  const handleGenerateSORAVolumes = useCallback(() => {
    if (!activeSite || !activeSiteId) return

    const flightGeography = activeSite.mapData?.flightPlan?.flightGeography
    if (!flightGeography?.geometry?.coordinates?.[0]) {
      alert('Please draw a flight geography first before generating SORA volumes.')
      return
    }

    // Get buffer distances from site flight plan, or use defaults
    const contingencyBuffer = siteFlightPlan.contingencyBuffer || 50 // Default 50m
    const groundRiskBuffer = siteFlightPlan.groundRiskBuffer || siteFlightPlan.maxAltitudeAGL || 120 // Default to altitude or 120m

    // Generate the volumes
    const volumes = generateSORAVolumes(flightGeography, contingencyBuffer, groundRiskBuffer)

    if (!volumes.contingencyVolume && !volumes.groundRiskBuffer) {
      alert('Failed to generate SORA volumes. Please check the flight geography.')
      return
    }

    // Update the map data with the generated volumes
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site

      return {
        ...site,
        mapData: {
          ...site.mapData,
          flightPlan: {
            ...site.mapData?.flightPlan,
            contingencyVolume: volumes.contingencyVolume,
            groundRiskBuffer: volumes.groundRiskBuffer
          }
        },
        updatedAt: new Date().toISOString()
      }
    })

    onUpdate({ sites: updatedSites })
  }, [activeSite, activeSiteId, siteFlightPlan, sites, onUpdate])

  // Handle aircraft selected from modal (new or existing)
  const handleAircraftFromModal = useCallback((aircraft) => {
    // Add to project aircraft list
    const currentAircraft = project?.aircraft || []
    const exists = currentAircraft.some(a => a.id === aircraft.id)

    if (!exists) {
      const updatedProjectAircraft = [
        ...currentAircraft,
        {
          id: aircraft.id,
          nickname: aircraft.nickname,
          make: aircraft.make,
          model: aircraft.model,
          serialNumber: aircraft.serialNumber,
          mtow: aircraft.mtow,
          maxSpeed: aircraft.maxSpeed,
          endurance: aircraft.endurance
        }
      ]
      onUpdate({ aircraft: updatedProjectAircraft })
    }

    // Auto-assign to current site and set as primary
    const currentSiteAircraft = siteFlightPlan.aircraft || []
    if (!currentSiteAircraft.includes(aircraft.id)) {
      updateSiteFlightPlan({
        aircraft: [...currentSiteAircraft, aircraft.id],
        primaryAircraftId: aircraft.id
      })
    }
  }, [project?.aircraft, siteFlightPlan.aircraft, onUpdate, updateSiteFlightPlan])

  // ============================================
  // FLIGHT PATH HANDLERS
  // ============================================

  // Get flight path data from site mapData
  const flightPathData = activeSite?.mapData?.flightPlan?.flightPath || {
    type: null,
    waypoints: [],
    gridSettings: { spacing: 30, angle: 0, overlap: 70, altitude: 120, speed: 10 },
    corridorSettings: { width: 50, altitude: 80, waypointSpacing: 100 }
  }

  // Update flight path in site mapData
  const updateFlightPath = useCallback((updates) => {
    if (!activeSiteId) return

    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site

      return {
        ...site,
        mapData: {
          ...site.mapData,
          flightPlan: {
            ...site.mapData?.flightPlan,
            flightPath: {
              ...site.mapData?.flightPlan?.flightPath,
              ...updates
            }
          }
        },
        updatedAt: new Date().toISOString()
      }
    })

    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])

  // Handle waypoint updates
  const handleWaypointAltitudeUpdate = useCallback((waypointId, altitude) => {
    const waypoints = flightPathData.waypoints || []
    const updatedWaypoints = waypoints.map(wp => {
      if (wp.id === waypointId) {
        return {
          ...wp,
          coordinates: [wp.coordinates[0], wp.coordinates[1], altitude]
        }
      }
      return wp
    })
    updateFlightPath({ waypoints: updatedWaypoints })
  }, [flightPathData.waypoints, updateFlightPath])

  const handleWaypointDelete = useCallback((waypointId) => {
    const waypoints = flightPathData.waypoints || []
    const updatedWaypoints = waypoints
      .filter(wp => wp.id !== waypointId)
      .map((wp, index) => ({ ...wp, order: index }))
    updateFlightPath({ waypoints: updatedWaypoints })
    if (selectedWaypointId === waypointId) {
      setSelectedWaypointId(null)
    }
  }, [flightPathData.waypoints, updateFlightPath, selectedWaypointId])

  const handleWaypointReorder = useCallback((fromIndex, toIndex) => {
    const waypoints = [...(flightPathData.waypoints || [])]
    const [moved] = waypoints.splice(fromIndex, 1)
    waypoints.splice(toIndex, 0, moved)
    const reordered = waypoints.map((wp, index) => ({ ...wp, order: index }))
    updateFlightPath({ waypoints: reordered })
  }, [flightPathData.waypoints, updateFlightPath])

  const handlePatternGenerate = useCallback((waypoints, settings) => {
    updateFlightPath({
      waypoints,
      ...(settings.type === 'grid' ? { gridSettings: settings } : {}),
      ...(settings.type === 'corridor' ? { corridorSettings: settings } : {}),
      type: settings.type,
      lastGenerated: new Date().toISOString()
    })
  }, [updateFlightPath])

  // Compute derived data for flight path visualization
  const flightPath3DGeoJSON = useMemo(() => {
    if (!flightPathData.waypoints || flightPathData.waypoints.length === 0) return null
    return waypointsTo3DGeoJSON(flightPathData.waypoints)
  }, [flightPathData.waypoints])

  const altitudeProfile = useMemo(() => {
    if (!flightPathData.waypoints || flightPathData.waypoints.length === 0) return []
    return generateAltitudeProfile(flightPathData.waypoints)
  }, [flightPathData.waypoints])

  const flightStats = useMemo(() => {
    if (!flightPathData.waypoints || flightPathData.waypoints.length === 0) {
      return { distance: 0, duration: 0, waypointCount: 0 }
    }
    const speed = flightPathData.gridSettings?.speed || flightPathData.corridorSettings?.speed || 10
    return {
      distance: calculatePathDistance(flightPathData.waypoints),
      duration: calculateFlightDuration(flightPathData.waypoints, speed),
      waypointCount: flightPathData.waypoints.length,
      minAltitude: Math.min(...flightPathData.waypoints.map(wp => wp.coordinates[2] || 0)),
      maxAltitude: Math.max(...flightPathData.waypoints.map(wp => wp.coordinates[2] || 0))
    }
  }, [flightPathData.waypoints, flightPathData.gridSettings, flightPathData.corridorSettings])

  // ============================================
  // VALIDATION
  // ============================================
  
  const validation = useMemo(() => {
    const issues = []
    
    // Check site-level requirements
    if (activeSite) {
      const mapData = activeSite.mapData?.flightPlan || {}
      if (!mapData.launchPoint) issues.push('Launch point not set')
      if (!mapData.recoveryPoint) issues.push('Recovery point not set')
    }
    
    // Check site-level aircraft requirements
    if (!siteFlightPlan.aircraft || siteFlightPlan.aircraft.length === 0) {
      issues.push('No aircraft assigned to site')
    } else if (!siteFlightPlan.primaryAircraftId) {
      issues.push('No primary aircraft selected')
    }
    
    if (!siteFlightPlan.operationType) {
      issues.push('Operation type not selected')
    }
    
    return {
      isComplete: issues.length === 0,
      issues
    }
  }, [activeSite, projectFlightPlan, siteFlightPlan])

  // ============================================
  // RENDER
  // ============================================
  
  if (!activeSite && sites.length === 0) {
    return (
      <div className="text-center py-12">
        <Plane className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Sites Configured</h3>
        <p className="text-gray-500 mb-4">Add operation sites in Site Survey before creating flight plans.</p>
        <button 
          onClick={() => onNavigateToSection?.('siteSurvey')} 
          className="btn-primary"
        >
          Go to Site Survey
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Flight Plan</h2>
          <p className="text-gray-500">Define flight parameters, positions, and contingencies for each site</p>
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
      
      {/* Validation Banner */}
      {!validation.isComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Flight Plan Incomplete
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            {validation.issues.map((issue, i) => (
              <li key={i}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Map Controls and Map */}
      {showMap && (
        <div className="space-y-3">
          {/* Controls row - outside the map for better interaction */}
          <div className="flex flex-wrap gap-3 items-center">
            <LayerToggles
              visibleLayers={mapControls.visibleLayers}
              onToggleLayer={mapControls.toggleLayer}
              allowedLayers={['siteSurvey', 'flightPlan']}
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
              activeLayer="flightPlan"
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
                <Eye className="w-4 h-4 text-gray-500" aria-hidden="true" />
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
              activeLayer="flightPlan"
              height="400px"
              allowedLayers={['siteSurvey', 'flightPlan']}
              showLegend={true}
              showControls={false}
              externalMapData={mapControls}
              onSiteChange={handleSelectSite}
            />
          </div>
        </div>
      )}
      
      {/* Flight Parameters Summary */}
      <CollapsibleSection
        title="Flight Positions"
        icon={MapPin}
        status={
          activeSite?.mapData?.flightPlan?.launchPoint && 
          activeSite?.mapData?.flightPlan?.recoveryPoint 
            ? 'complete' 
            : 'missing'
        }
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <Info className="w-4 h-4 inline mr-1" />
            Use the <strong>Drawing Tools</strong> on the map to set launch point, recovery point, pilot position, and flight geography.
          </p>
        </div>
        
        <FlightParametersSummary 
          site={activeSite} 
          projectFlightPlan={projectFlightPlan}
        />
      </CollapsibleSection>
      
      {/* Operation Parameters */}
      <CollapsibleSection
        title="Operation Parameters"
        icon={Settings}
        status={siteFlightPlan.operationType ? 'complete' : 'missing'}
      >
        <OperationTypeSelector
          value={siteFlightPlan.operationType || 'VLOS'}
          onChange={(value) => updateSiteFlightPlan({ operationType: value })}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Altitude (AGL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="10"
                min="0"
                max="400"
                value={siteFlightPlan.maxAltitudeAGL || ''}
                onChange={(e) => updateSiteFlightPlan({ 
                  maxAltitudeAGL: e.target.value ? Number(e.target.value) : null 
                })}
                placeholder="120"
                className="input w-24"
              />
              <span className="text-sm text-gray-500">m</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Limit: 122m (400ft)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Distance from Pilot
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="100"
                min="0"
                value={siteFlightPlan.maxDistanceFromPilot || ''}
                onChange={(e) => updateSiteFlightPlan({ 
                  maxDistanceFromPilot: e.target.value ? Number(e.target.value) : null 
                })}
                placeholder="500"
                className="input w-24"
              />
              <span className="text-sm text-gray-500">m</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">VLOS typically ≤500m</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Flight Time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="5"
                min="0"
                value={siteFlightPlan.flightDuration || ''}
                onChange={(e) => updateSiteFlightPlan({
                  flightDuration: e.target.value ? Number(e.target.value) : null
                })}
                placeholder="60"
                className="input w-24"
              />
              <span className="text-sm text-gray-500">min</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total planned flight time at this site</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Battery Changes
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={siteFlightPlan.batteryChanges ?? ''}
              onChange={(e) => updateSiteFlightPlan({
                batteryChanges: e.target.value !== '' ? Number(e.target.value) : null
              })}
              placeholder="2"
              className="input w-24"
            />
            <p className="text-xs text-gray-500 mt-1">Number of battery swaps expected</p>
          </div>
        </div>
      </CollapsibleSection>
      
      {/* Flight Geography */}
      <CollapsibleSection
        title="Flight Geography"
        icon={Square}
        badge={siteFlightPlan.areaType ? AREA_TYPES.find(t => t.value === siteFlightPlan.areaType)?.label : null}
        status={siteFlightPlan.areaType ? 'complete' : 'incomplete'}
      >
        <div className="space-y-4">
          {/* Area Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operation Area Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {AREA_TYPES.map(type => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    siteFlightPlan.areaType === type.value
                      ? 'bg-aeria-navy/5 border-aeria-navy'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="areaType"
                    value={type.value}
                    checked={siteFlightPlan.areaType === type.value}
                    onChange={(e) => updateSiteFlightPlan({ areaType: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium text-gray-900">{type.label}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Geography Method & Buffers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flight Geography Method
              </label>
              <select
                value={siteFlightPlan.flightGeographyMethod || 'manual'}
                onChange={(e) => {
                  const method = e.target.value
                  updateSiteFlightPlan({ flightGeographyMethod: method })

                  // If "Same as Boundary" selected, copy the operations boundary to flight geography
                  if (method === 'sameAsBoundary' && activeSite?.mapData?.siteSurvey?.operationsBoundary) {
                    const boundary = activeSite.mapData.siteSurvey.operationsBoundary
                    // Copy boundary to flight geography
                    const updatedSites = sites.map(site => {
                      if (site.id !== activeSiteId) return site
                      return {
                        ...site,
                        mapData: {
                          ...site.mapData,
                          flightPlan: {
                            ...(site.mapData?.flightPlan || {}),
                            flightGeography: JSON.parse(JSON.stringify(boundary)) // Deep copy
                          }
                        },
                        updatedAt: new Date().toISOString()
                      }
                    })
                    onUpdate({ sites: updatedSites })
                  }
                }}
                className="input"
              >
                {FLIGHT_GEOGRAPHY_METHODS.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label} - {method.description}
                  </option>
                ))}
              </select>
              {siteFlightPlan.flightGeographyMethod === 'sameAsBoundary' && !activeSite?.mapData?.siteSurvey?.operationsBoundary && (
                <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Draw an operations boundary in Site Survey first
                </p>
              )}
              {siteFlightPlan.flightGeographyMethod === 'sameAsBoundary' && activeSite?.mapData?.siteSurvey?.operationsBoundary && (
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Flight geography copied from operations boundary
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ground Risk Buffer Method
              </label>
              <select
                value={siteFlightPlan.groundRiskBufferMethod || 'altitude'}
                onChange={(e) => updateSiteFlightPlan({ groundRiskBufferMethod: e.target.value })}
                className="input"
              >
                {GROUND_RISK_BUFFER_METHODS.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {GROUND_RISK_BUFFER_METHODS.find(m => m.value === (siteFlightPlan.groundRiskBufferMethod || 'altitude'))?.description}
              </p>
            </div>
          </div>
          
          {/* Buffer Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contingency Buffer
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={siteFlightPlan.contingencyBuffer || ''}
                  onChange={(e) => updateSiteFlightPlan({ 
                    contingencyBuffer: e.target.value ? Number(e.target.value) : null 
                  })}
                  placeholder="50"
                  className="input w-24"
                />
                <span className="text-sm text-gray-500">m</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Max speed × 15 sec typical</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ground Risk Buffer
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="10"
                  min="0"
                  value={siteFlightPlan.groundRiskBuffer || ''}
                  onChange={(e) => updateSiteFlightPlan({ 
                    groundRiskBuffer: e.target.value ? Number(e.target.value) : null 
                  })}
                  placeholder="120"
                  className="input w-24"
                />
                <span className="text-sm text-gray-500">m</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {siteFlightPlan.groundRiskBufferMethod === 'altitude' 
                  ? `Auto: ${siteFlightPlan.maxAltitudeAGL || 120}m (1:1)`
                  : 'Manual entry'
                }
              </p>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteFlightPlan.adjacentAreaConsidered || false}
                  onChange={(e) => updateSiteFlightPlan({ adjacentAreaConsidered: e.target.checked })}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Adjacent Area Assessed</span>
                  <p className="text-xs text-gray-500">Per SORA Step 8</p>
                </div>
              </label>
            </div>
          </div>
          
          {/* Flight Geography Calculator */}
          {(siteFlightPlan.maxAltitudeAGL || siteFlightPlan.contingencyBuffer || siteFlightPlan.groundRiskBuffer) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Volume Calculator
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-600 font-medium mb-1">Operational Volume</p>
                  <p className="text-green-900">
                    Flight Geography + {siteFlightPlan.maxAltitudeAGL || 120}m AGL
                  </p>
                  <p className="text-xs text-green-600 mt-1">Where normal flight occurs</p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-600 font-medium mb-1">Contingency Volume</p>
                  <p className="text-amber-900">
                    OV + {siteFlightPlan.contingencyBuffer || 50}m buffer
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    ~{Math.round((siteFlightPlan.contingencyBuffer || 50) / ((siteFlightPlan.maxSpeed || 15) / 3.6))}s at max speed
                  </p>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 font-medium mb-1">Ground Risk Buffer</p>
                  <p className="text-red-900">
                    CV + {siteFlightPlan.groundRiskBuffer || siteFlightPlan.maxAltitudeAGL || 120}m
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {siteFlightPlan.groundRiskBufferMethod === 'altitude' ? '1:1 altitude ratio' :
                     siteFlightPlan.groundRiskBufferMethod === 'ballistic' ? 'Ballistic calculation' :
                     siteFlightPlan.groundRiskBufferMethod === 'containment' ? 'With containment' : 'Fixed distance'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Total horizontal extent from flight path: {
                  (siteFlightPlan.contingencyBuffer || 50) + (siteFlightPlan.groundRiskBuffer || siteFlightPlan.maxAltitudeAGL || 120)
                }m per side
              </p>

              {/* Generate Volumes Button */}
              {activeSite?.mapData?.flightPlan?.flightGeography && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleGenerateSORAVolumes}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Generate SORA Volumes on Map
                  </button>
                  {activeSite?.mapData?.flightPlan?.contingencyVolume && (
                    <p className="text-xs text-green-600 mt-2 text-center">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      Volumes generated and displayed on map
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Map reference note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <Info className="w-4 h-4 inline mr-1" />
              Draw your flight geography on the map using the <strong>Drawing Tools</strong>.
              The flight volume, contingency volume, and ground risk buffer will be visualized.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Flight Path Generation */}
      <CollapsibleSection
        title="Flight Path"
        icon={Route}
        badge={flightPathData.waypoints?.length > 0 ? `${flightPathData.waypoints.length} waypoints` : null}
        status={flightPathData.waypoints?.length > 0 ? 'complete' : 'incomplete'}
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <Info className="w-4 h-4 inline mr-1" />
              Generate flight patterns based on your operation area type, then fine-tune waypoints manually.
              {siteFlightPlan.areaType === 'area' && ' For area surveys, use Grid Pattern.'}
              {siteFlightPlan.areaType === 'corridor' && ' For corridor operations, use Linear Pattern.'}
              {siteFlightPlan.areaType === 'point' && ' For point operations, add waypoints manually.'}
            </p>
          </div>

          {/* Flight Path Generator */}
          {activeSite?.mapData?.flightPlan?.flightGeography && (
            <FlightPathGenerator
              flightGeography={activeSite.mapData.flightPlan.flightGeography}
              areaType={siteFlightPlan.areaType || 'area'}
              gridSettings={flightPathData.gridSettings}
              corridorSettings={flightPathData.corridorSettings}
              onGenerate={handlePatternGenerate}
              onSettingsChange={(settings) => {
                if (settings.spacing !== undefined || settings.angle !== undefined) {
                  updateFlightPath({ gridSettings: { ...flightPathData.gridSettings, ...settings } })
                } else {
                  updateFlightPath({ corridorSettings: { ...flightPathData.corridorSettings, ...settings } })
                }
              }}
              flightStats={flightStats}
            />
          )}

          {!activeSite?.mapData?.flightPlan?.flightGeography && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <Square className="w-8 h-8 mx-auto text-amber-400 mb-2" />
              <p className="text-sm text-amber-800">
                Draw a flight geography on the map first to generate flight patterns.
              </p>
            </div>
          )}

          {/* Waypoint Editor */}
          {flightPathData.waypoints?.length > 0 && (
            <WaypointEditor
              waypoints={flightPathData.waypoints}
              selectedWaypointId={selectedWaypointId}
              onSelectWaypoint={setSelectedWaypointId}
              onUpdateAltitude={handleWaypointAltitudeUpdate}
              onDeleteWaypoint={handleWaypointDelete}
              onReorderWaypoints={handleWaypointReorder}
              maxAltitude={siteFlightPlan.maxAltitudeAGL || 400}
            />
          )}

          {/* Altitude Profile */}
          {altitudeProfile.length > 0 && (
            <AltitudeProfileView
              profile={altitudeProfile}
              selectedWaypointId={selectedWaypointId}
              onWaypointHover={setSelectedWaypointId}
              onWaypointClick={setSelectedWaypointId}
              altitudeRange={flightStats.minAltitude !== undefined ? {
                min: flightStats.minAltitude,
                max: flightStats.maxAltitude
              } : null}
            />
          )}

          {/* Flight Stats Summary */}
          {flightPathData.waypoints?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Total Distance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {flightStats.distance >= 1000
                    ? `${(flightStats.distance / 1000).toFixed(2)} km`
                    : `${Math.round(flightStats.distance)} m`
                  }
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Est. Duration</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Math.floor(flightStats.duration / 60)}:{String(Math.round(flightStats.duration % 60)).padStart(2, '0')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Waypoints</p>
                <p className="text-lg font-semibold text-gray-900">{flightStats.waypointCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Altitude Range</p>
                <p className="text-lg font-semibold text-gray-900">
                  {flightStats.minAltitude}-{flightStats.maxAltitude}m
                </p>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Flight Plan Notes */}
      <CollapsibleSection
        title="Flight Plan Notes"
        icon={Info}
        defaultOpen={false}
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Use bullet points (•) or dashes (-) at the start of lines for formatted lists.
            Press Enter to add new points.
          </p>
          <textarea
            value={siteFlightPlan.notes || ''}
            onChange={(e) => updateSiteFlightPlan({ notes: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const textarea = e.target
                const { selectionStart, value } = textarea
                const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
                const currentLine = value.substring(lineStart, selectionStart)
                const bulletMatch = currentLine.match(/^(\s*[-•]\s*)/)
                if (bulletMatch) {
                  e.preventDefault()
                  const bullet = bulletMatch[1]
                  const newValue = value.substring(0, selectionStart) + '\n' + bullet + value.substring(selectionStart)
                  updateSiteFlightPlan({ notes: newValue })
                  setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + bullet.length
                  }, 0)
                }
              }
            }}
            placeholder="• Key operational considerations&#10;• Site-specific requirements&#10;• Weather watch items&#10;• Client requirements"
            rows={6}
            className="input font-mono text-sm"
          />
        </div>
      </CollapsibleSection>
      
      {/* Airspace - Site Level */}
      <CollapsibleSection
        title="Airspace"
        icon={Radio}
        badge={siteFlightPlan.airspace?.classification ? `Class ${siteFlightPlan.airspace.classification}` : null}
        status={siteFlightPlan.airspace?.classification ? 'complete' : 'incomplete'}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <Info className="w-4 h-4 inline mr-1" />
              Airspace classification affects SORA Air Risk Class (ARC) determination.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Airspace Classification
              </label>
              <select
                value={siteFlightPlan.airspace?.classification || 'G'}
                onChange={(e) => {
                  const cls = AIRSPACE_CLASSES.find(c => c.value === e.target.value)
                  updateSiteFlightPlan({ 
                    airspace: {
                      ...siteFlightPlan.airspace,
                      classification: e.target.value,
                      controlled: cls?.controlled || false
                    }
                  })
                }}
                className="input"
              >
                {AIRSPACE_CLASSES.map(cls => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label} - {cls.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteFlightPlan.airspace?.atcCoordinationRequired || false}
                  onChange={(e) => updateSiteFlightPlan({ 
                    airspace: {
                      ...siteFlightPlan.airspace,
                      atcCoordinationRequired: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <span className="text-sm text-gray-700">ATC Coordination Required</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteFlightPlan.airspace?.notamRequired || false}
                  onChange={(e) => updateSiteFlightPlan({ 
                    airspace: {
                      ...siteFlightPlan.airspace,
                      notamRequired: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <span className="text-sm text-gray-700">NOTAM Required</span>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nearest Aerodrome
              </label>
              <input
                type="text"
                value={siteFlightPlan.airspace?.nearestAerodrome || ''}
                onChange={(e) => updateSiteFlightPlan({ 
                  airspace: {
                    ...siteFlightPlan.airspace,
                    nearestAerodrome: e.target.value
                  }
                })}
                placeholder="e.g., CYYC Calgary Intl"
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={siteFlightPlan.airspace?.aerodromeDistance || ''}
                onChange={(e) => updateSiteFlightPlan({ 
                  airspace: {
                    ...siteFlightPlan.airspace,
                    aerodromeDistance: e.target.value ? Number(e.target.value) : null
                  }
                })}
                placeholder="e.g., 12.5"
                className="input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <input
                type="text"
                value={siteFlightPlan.airspace?.aerodromeDirection || ''}
                onChange={(e) => updateSiteFlightPlan({ 
                  airspace: {
                    ...siteFlightPlan.airspace,
                    aerodromeDirection: e.target.value
                  }
                })}
                placeholder="e.g., NNW"
                className="input"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airspace Notes / Restrictions
            </label>
            <textarea
              value={siteFlightPlan.airspace?.notes || ''}
              onChange={(e) => updateSiteFlightPlan({ 
                airspace: {
                  ...siteFlightPlan.airspace,
                  notes: e.target.value
                }
              })}
              placeholder="Enter any airspace restrictions, special considerations, or coordination requirements..."
              rows={3}
              className="input"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Population Assessment - Site Level */}
      <CollapsibleSection
        title="Population Assessment"
        icon={Users}
        badge={siteFlightPlan.population?.category ? POPULATION_CATEGORIES[siteFlightPlan.population.category]?.label : null}
        status={siteFlightPlan.population?.category ? 'complete' : 'missing'}
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              <strong>SORA Requirement:</strong> Population category determines initial Ground Risk Class (iGRC).
              Select the category that best represents the operations area.
            </p>
          </div>

          <PopulationCategorySelector
            value={siteFlightPlan.population?.category}
            onChange={(category) => updateSiteFlightPlan({
              population: {
                ...siteFlightPlan.population,
                category,
                assessmentDate: new Date().toISOString()
              }
            })}
            label="Operations Area Population"
          />

          <PopulationCategorySelector
            value={siteFlightPlan.population?.adjacentCategory}
            onChange={(category) => updateSiteFlightPlan({
              population: {
                ...siteFlightPlan.population,
                adjacentCategory: category
              }
            })}
            label="Adjacent Area Population (for containment assessment)"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Population Assessment Justification
            </label>
            <textarea
              value={siteFlightPlan.population?.justification || ''}
              onChange={(e) => updateSiteFlightPlan({
                population: {
                  ...siteFlightPlan.population,
                  justification: e.target.value
                }
              })}
              placeholder="Describe the basis for your population category selection..."
              rows={3}
              className="input"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Aircraft - Site Level */}
      <CollapsibleSection
        title="Site Aircraft"
        icon={Plane}
        badge={siteFlightPlan.aircraft?.length > 0 ? `${siteFlightPlan.aircraft.length} assigned` : null}
        status={siteFlightPlan.aircraft?.length > 0 && siteFlightPlan.primaryAircraftId ? 'complete' : 'missing'}
      >
        <SiteAircraftSelector
          projectAircraft={project?.aircraft || []}
          siteAircraft={siteFlightPlan.aircraft || []}
          primaryAircraftId={siteFlightPlan.primaryAircraftId}
          onToggleAircraft={handleToggleSiteAircraft}
          onSetPrimary={handleSetPrimaryAircraft}
          onAddAircraft={() => setShowAircraftModal(true)}
        />
      </CollapsibleSection>

      {/* Weather Minimums - Project Level */}
      <CollapsibleSection
        title="Weather Minimums"
        icon={Cloud}
        defaultOpen={false}
      >
        <WeatherMinimumsForm
          weatherMinimums={projectFlightPlan.weatherMinimums || {}}
          onChange={(weatherMinimums) => updateProjectFlightPlan({ weatherMinimums })}
        />
      </CollapsibleSection>
      
      {/* Contingencies - Project Level */}
      <CollapsibleSection
        title="Contingency Procedures"
        icon={AlertTriangle}
        badge={projectFlightPlan.contingencies?.length > 0 ? `${projectFlightPlan.contingencies.length} defined` : null}
        defaultOpen={false}
      >
        <ContingencyList
          contingencies={projectFlightPlan.contingencies || []}
          onChange={(contingencies) => updateProjectFlightPlan({ contingencies })}
        />
      </CollapsibleSection>

      {/* Emergency Response Procedures - Project Level */}
      <CollapsibleSection
        title="Emergency Response Procedures"
        icon={ShieldAlert}
        badge={project?.emergencyPlan?.procedures?.length > 0 ? `${project.emergencyPlan.procedures.length} defined` : null}
        defaultOpen={false}
      >
        <EmergencyResponseProcedures
          procedures={project?.emergencyPlan?.procedures || []}
          onChange={(procedures) => onUpdate({
            emergencyPlan: {
              ...project?.emergencyPlan,
              procedures
            }
          })}
          onNavigateToEmergency={() => onNavigateToSection?.('emergency')}
        />
      </CollapsibleSection>

      {/* SORA Link */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">SORA Assessment</h4>
          <p className="text-sm text-gray-500">
            Flight plan parameters feed into SORA risk calculations
          </p>
        </div>
        <button
          onClick={() => onNavigateToSection?.('sora')}
          className="btn-secondary inline-flex items-center gap-2"
        >
          View SORA
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* No Aircraft Modal */}
      <NoAircraftAssignedModal
        isOpen={showAircraftModal}
        onClose={() => setShowAircraftModal(false)}
        onAircraftSelected={handleAircraftFromModal}
        context="flight planning"
      />
    </div>
  )
}

ProjectFlightPlan.propTypes = {
  project: PropTypes.shape({
    flightPlan: PropTypes.object,
    sites: PropTypes.array,
    aircraft: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onNavigateToSection: PropTypes.func
}
