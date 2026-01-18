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
  ExternalLink
} from 'lucide-react'
import UnifiedProjectMap from '../map/UnifiedProjectMap'
import { 
  createDefaultSite,
  getSiteStats,
  calculatePolygonArea
} from '../../lib/mapDataStructures'

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
  { value: 'manual', label: 'Manual', description: 'Draw flight geography directly on map' }
]

const DEFAULT_CONTINGENCIES = [
  { trigger: 'Loss of C2 Link', action: 'Return to Home (RTH) automatically engages. If no RTH within 30 seconds, land in place.', priority: 'high' },
  { trigger: 'Low Battery Warning', action: 'Immediately return to launch point. Land with minimum 20% remaining.', priority: 'high' },
  { trigger: 'GPS Loss', action: 'Switch to ATTI mode, maintain visual contact, manual return and land.', priority: 'high' },
  { trigger: 'Fly-Away', action: 'Attempt to regain control. If unsuccessful, contact FIC immediately.', priority: 'critical' },
  { trigger: 'Deteriorating Weather', action: 'Land immediately if conditions fall below minimums.', priority: 'medium' },
  { trigger: 'Aircraft in Vicinity', action: 'Descend and hold position or land. Give way to all manned aircraft.', priority: 'high' }
]

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

function AircraftSelector({ 
  projectAircraft = [], 
  selectedAircraftIds = [], 
  onToggleAircraft,
  onNavigateToAircraft 
}) {
  if (projectAircraft.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          No aircraft assigned to this project. Add aircraft in project settings.
        </p>
        {onNavigateToAircraft && (
          <button
            onClick={onNavigateToAircraft}
            className="mt-2 text-sm text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Go to Aircraft
          </button>
        )}
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      {projectAircraft.map(aircraft => {
        const isSelected = selectedAircraftIds.includes(aircraft.id)
        return (
          <label
            key={aircraft.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              isSelected 
                ? 'bg-aeria-navy/5 border-aeria-navy' 
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleAircraft(aircraft.id)}
              className="w-4 h-4 text-aeria-navy rounded focus:ring-aeria-navy"
            />
            <Plane className={`w-5 h-5 ${isSelected ? 'text-aeria-navy' : 'text-gray-400'}`} />
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${isSelected ? 'text-aeria-navy' : 'text-gray-900'}`}>
                {aircraft.nickname || `${aircraft.make} ${aircraft.model}`}
              </p>
              <p className="text-xs text-gray-500">
                {aircraft.make} {aircraft.model} • {aircraft.mtow ? `${aircraft.mtow}kg` : 'Weight N/A'}
              </p>
            </div>
            {aircraft.isPrimary && (
              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Primary</span>
            )}
          </label>
        )
      })}
    </div>
  )
}

// ============================================
// WEATHER MINIMUMS FORM
// ============================================

function WeatherMinimumsForm({ weatherMinimums = {}, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...weatherMinimums, [field]: value })
  }
  
  return (
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
    
    // Check project-level requirements
    if (!projectFlightPlan.aircraft || projectFlightPlan.aircraft.length === 0) {
      issues.push('No aircraft selected')
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
      
      {/* Map */}
      {showMap && (
        <div className="card p-0 overflow-hidden">
          <UnifiedProjectMap
            project={project}
            onUpdate={onUpdate}
            editMode={true}
            activeLayer="flightPlan"
            height="400px"
            allowedLayers={['siteSurvey', 'flightPlan']}
            showLegend={true}
            onSiteChange={handleSelectSite}
          />
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
              <span className="text-sm text-gray-500">meters</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Canadian limit: 122m (400ft) AGL</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flight Geography Method
            </label>
            <select
              value={siteFlightPlan.flightGeographyMethod || 'inside-out'}
              onChange={(e) => updateSiteFlightPlan({ flightGeographyMethod: e.target.value })}
              className="input"
            >
              {FLIGHT_GEOGRAPHY_METHODS.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label} - {method.description}
                </option>
              ))}
            </select>
          </div>
          
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
              <span className="text-sm text-gray-500">meters</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">SORA: Based on aircraft max speed × 15s</p>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Flight Plan Notes
          </label>
          <textarea
            value={siteFlightPlan.notes || ''}
            onChange={(e) => updateSiteFlightPlan({ notes: e.target.value })}
            placeholder="Additional notes about flight operations at this site..."
            rows={3}
            className="input"
          />
        </div>
      </CollapsibleSection>
      
      {/* Aircraft - Project Level */}
      <CollapsibleSection
        title="Aircraft"
        icon={Plane}
        badge={projectFlightPlan.aircraft?.length > 0 ? `${projectFlightPlan.aircraft.length} selected` : null}
        status={projectFlightPlan.aircraft?.length > 0 ? 'complete' : 'missing'}
      >
        <AircraftSelector
          projectAircraft={project?.aircraft || projectFlightPlan.aircraft || []}
          selectedAircraftIds={(projectFlightPlan.aircraft || []).map(a => a.id)}
          onToggleAircraft={handleToggleAircraft}
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
    </div>
  )
}
