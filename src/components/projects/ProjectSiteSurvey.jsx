/**
 * ProjectSiteSurvey.jsx
 * Site Survey component with multi-site map integration
 * 
 * Features:
 * - Multi-site support with site selector
 * - Unified map for location, boundary, and obstacle placement
 * - Population assessment with SORA categories
 * - Airspace classification
 * - Access and surroundings documentation
 * - Photo upload with categorization (Batch 4)
 * 
 * @location src/components/projects/ProjectSiteSurvey.jsx
 * @action REPLACE
 */

import React, { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  MapPin,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Navigation,
  Users,
  Mountain,
  Building,
  Plane,
  TreePine,
  Droplets,
  Car,
  Key,
  Camera,
  FileText,
  Check,
  X,
  Copy,
  MoreVertical,
  Pencil,
  Eye,
  ArrowRight,
  Cloud,
  Wind,
  Sun
} from 'lucide-react'
import UnifiedProjectMap from '../map/UnifiedProjectMap'
import { LayerToggles, DrawingTools } from '../map/MapControls'
import { useMapData } from '../../hooks/useMapData'
import PhotoUpload, { PhotoCountBadge } from '../PhotoUpload'
import { ObstacleLabelPrompt } from '../map/SiteSurveyMapTools'
import {
  POPULATION_CATEGORIES,
  createDefaultSite,
  getSiteStats,
  validateSiteCompleteness
} from '../../lib/mapDataStructures'

// ============================================
// CONSTANTS
// ============================================

const AIRSPACE_CLASSES = [
  { value: 'A', label: 'Class A', description: 'High altitude, IFR only' },
  { value: 'B', label: 'Class B', description: 'Major airports' },
  { value: 'C', label: 'Class C', description: 'Busy airports with tower' },
  { value: 'D', label: 'Class D', description: 'Airports with tower' },
  { value: 'E', label: 'Class E', description: 'Controlled airspace' },
  { value: 'F', label: 'Class F', description: 'Advisory/Restricted' },
  { value: 'G', label: 'Class G', description: 'Uncontrolled airspace' }
]

const OBSTACLE_TYPES = [
  { value: 'tower', label: 'Tower/Antenna', icon: '📡' },
  { value: 'wire', label: 'Power Lines/Wires', icon: '⚡' },
  { value: 'building', label: 'Building/Structure', icon: '🏢' },
  { value: 'tree', label: 'Trees/Vegetation', icon: '🌲' },
  { value: 'terrain', label: 'Terrain Feature', icon: '⛰️' },
  { value: 'water', label: 'Water Tower/Tank', icon: '💧' },
  { value: 'crane', label: 'Crane', icon: '🏗️' },
  { value: 'other', label: 'Other', icon: '⚠️' }
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
            <span className="px-2 py-0.5 text-xs font-medium bg-aeria-navy/10 text-aeria-navy rounded-full">
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
// SITE MANAGEMENT PANEL
// ============================================

function SiteManagementPanel({
  sites,
  activeSiteId,
  onSelectSite,
  onAddSite,
  onDuplicateSite,
  onDeleteSite,
  onRenameSite
}) {
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const handleStartEdit = (site) => {
    setEditingId(site.id)
    setEditName(site.name)
    setMenuOpenId(null)
  }

  const handleSaveEdit = (siteId) => {
    if (editName.trim()) {
      onRenameSite(siteId, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }

  const handleMenuToggle = (e, siteId) => {
    e.stopPropagation()
    if (menuOpenId === siteId) {
      setMenuOpenId(null)
    } else {
      // Calculate position based on button location
      const rect = e.currentTarget.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 144 // 144px = menu width (w-36 = 9rem = 144px)
      })
      setMenuOpenId(siteId)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Operation Sites</h3>
        <span className="text-sm text-gray-500">{sites.length}/10</span>
      </div>

      <div className="divide-y divide-gray-100">
        {sites.map((site, index) => {
          const isActive = site.id === activeSiteId
          const isEditing = editingId === site.id
          const stats = getSiteStats(site)

          return (
            <div
              key={site.id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                isActive ? 'bg-aeria-navy/5 border-l-4 border-aeria-navy' : 'hover:bg-gray-50 border-l-4 border-transparent'
              }`}
              onClick={() => !isEditing && onSelectSite(site.id)}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
              />

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(site.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-aeria-navy"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(site.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-aeria-navy' : 'text-gray-900'}`}>
                      {site.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {stats.hasLocation && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Located</span>}
                      {stats.hasBoundary && <span className="flex items-center gap-1"><span className="w-2 h-2 border border-current" /> Bounded</span>}
                      {stats.obstacleCount > 0 && <span>{stats.obstacleCount} obstacles</span>}
                    </div>
                  </>
                )}
              </div>

              {!isEditing && (
                <div onClick={e => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleMenuToggle(e, site.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    aria-label={`Site options for ${site.name}`}
                    aria-haspopup="menu"
                    aria-expanded={menuOpenId === site.id}
                  >
                    <MoreVertical className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Fixed position dropdown menu - renders outside the overflow container */}
      {menuOpenId && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setMenuOpenId(null)}
          />
          <div
            className="fixed w-36 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999]"
            style={{ top: menuPosition.top, left: Math.max(8, menuPosition.left) }}
          >
            <button
              onClick={() => handleStartEdit(sites.find(s => s.id === menuOpenId))}
              className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Rename
            </button>
            <button
              onClick={() => {
                onDuplicateSite(menuOpenId)
                setMenuOpenId(null)
              }}
              className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </button>
            {sites.length > 1 && (
              <button
                onClick={() => {
                  onDeleteSite(menuOpenId)
                  setMenuOpenId(null)
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </>
      )}

      {sites.length < 10 && (
        <button
          onClick={onAddSite}
          className="w-full px-4 py-3 text-sm text-aeria-navy hover:bg-aeria-navy/5 flex items-center justify-center gap-2 border-t border-gray-200"
        >
          <Plus className="w-4 h-4" />
          Add Site
        </button>
      )}
    </div>
  )
}

// ============================================
// OBSTACLES LIST WITH MANUAL ADD
// ============================================

function ObstaclesList({ obstacles = [], onUpdate, onRemove, onAdd }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newObstacle, setNewObstacle] = useState({
    obstacleType: 'other',
    height: '',
    notes: '',
    lat: '',
    lng: ''
  })

  const handleAddManualObstacle = () => {
    if (!newObstacle.lat || !newObstacle.lng) {
      alert('Please enter coordinates (latitude and longitude)')
      return
    }
    
    const lat = parseFloat(newObstacle.lat)
    const lng = parseFloat(newObstacle.lng)
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Invalid coordinates. Latitude must be -90 to 90, Longitude must be -180 to 180')
      return
    }

    onAdd({
      obstacleType: newObstacle.obstacleType,
      height: newObstacle.height ? Number(newObstacle.height) : null,
      notes: newObstacle.notes,
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    })

    setNewObstacle({ obstacleType: 'other', height: '', notes: '', lat: '', lng: '' })
    setShowAddForm(false)
  }

  return (
    <div className="space-y-4">
      {!showAddForm ? (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Obstacle Manually
        </button>
      ) : (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Add Manual Obstacle</h4>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={newObstacle.obstacleType} onChange={(e) => setNewObstacle(prev => ({ ...prev, obstacleType: e.target.value }))} className="input text-sm">
                {OBSTACLE_TYPES.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Height (m)</label>
              <input type="number" value={newObstacle.height} onChange={(e) => setNewObstacle(prev => ({ ...prev, height: e.target.value }))} placeholder="e.g., 30" className="input text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Latitude *</label>
              <input type="number" step="any" value={newObstacle.lat} onChange={(e) => setNewObstacle(prev => ({ ...prev, lat: e.target.value }))} placeholder="e.g., 49.7" className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Longitude *</label>
              <input type="number" step="any" value={newObstacle.lng} onChange={(e) => setNewObstacle(prev => ({ ...prev, lng: e.target.value }))} placeholder="e.g., -123.1" className="input text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <input type="text" value={newObstacle.notes} onChange={(e) => setNewObstacle(prev => ({ ...prev, notes: e.target.value }))} placeholder="e.g., Guy wires, red aviation lights" className="input text-sm" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="button" onClick={handleAddManualObstacle} className="px-3 py-1.5 text-sm bg-aeria-navy text-white rounded-lg hover:bg-aeria-navy/90">Add Obstacle</button>
          </div>
        </div>
      )}

      {obstacles.length === 0 ? (
        <p className="text-sm text-gray-500 italic text-center py-4">No obstacles marked yet.</p>
      ) : (
        <div className="space-y-2">
          {obstacles.map((obstacle) => {
            const typeInfo = OBSTACLE_TYPES.find(t => t.value === obstacle.obstacleType) || OBSTACLE_TYPES[OBSTACLE_TYPES.length - 1]
            return (
              <div key={obstacle.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">{typeInfo.icon}</span>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <select value={obstacle.obstacleType || 'other'} onChange={(e) => onUpdate(obstacle.id, { obstacleType: e.target.value })} className="input text-sm py-1">
                      {OBSTACLE_TYPES.map(type => (<option key={type.value} value={type.value}>{type.label}</option>))}
                    </select>
                    <input type="number" value={obstacle.height || ''} onChange={(e) => onUpdate(obstacle.id, { height: e.target.value ? Number(e.target.value) : null })} placeholder="Height (m)" className="input text-sm py-1 w-28" />
                  </div>
                  <input type="text" value={obstacle.notes || ''} onChange={(e) => onUpdate(obstacle.id, { notes: e.target.value })} placeholder="Notes (e.g., guy wires, lighting)" className="input text-sm py-1 w-full" />
                  {obstacle.geometry?.coordinates && (
                    <p className="text-xs text-gray-500">Location: {obstacle.geometry.coordinates[1].toFixed(5)}, {obstacle.geometry.coordinates[0].toFixed(5)}</p>
                  )}
                </div>
                <button type="button" onClick={() => onRemove(obstacle.id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProjectSiteSurvey({ project, onUpdate }) {
  const [showMap, setShowMap] = useState(true)

  // Map controls - lifted to page level so we can render controls in sidebar
  const mapControls = useMapData(project, onUpdate, {
    editMode: true,
    allowedLayers: ['siteSurvey'],
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
  
  // Get active site's survey data
  const surveyData = activeSite?.siteSurvey || {}
  const mapData = activeSite?.mapData?.siteSurvey || {}
  
  // ============================================
  // SITE MANAGEMENT HANDLERS
  // ============================================
  
  const handleSelectSite = useCallback((siteId) => {
    onUpdate({ activeSiteId: siteId })
  }, [onUpdate])
  
  const handleAddSite = useCallback(() => {
    const newSite = createDefaultSite({
      name: `Site ${sites.length + 1}`,
      order: sites.length
    })
    
    onUpdate({
      sites: [...sites, newSite],
      activeSiteId: newSite.id
    })
  }, [sites, onUpdate])
  
  const handleDuplicateSite = useCallback((siteId) => {
    const sourceSite = sites.find(s => s.id === siteId)
    if (!sourceSite) return
    
    const newSite = {
      ...JSON.parse(JSON.stringify(sourceSite)),
      id: `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${sourceSite.name} (Copy)`,
      status: 'draft',
      order: sites.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    onUpdate({
      sites: [...sites, newSite],
      activeSiteId: newSite.id
    })
  }, [sites, onUpdate])
  
  const handleDeleteSite = useCallback((siteId) => {
    if (sites.length <= 1) {
      alert('Cannot delete the last site')
      return
    }
    
    if (!confirm('Are you sure you want to delete this site?')) return
    
    const filteredSites = sites.filter(s => s.id !== siteId)
    const newActiveSiteId = activeSiteId === siteId ? filteredSites[0]?.id : activeSiteId
    
    onUpdate({
      sites: filteredSites,
      activeSiteId: newActiveSiteId
    })
  }, [sites, activeSiteId, onUpdate])
  
  const handleRenameSite = useCallback((siteId, newName) => {
    const updatedSites = sites.map(site => 
      site.id === siteId 
        ? { ...site, name: newName, updatedAt: new Date().toISOString() }
        : site
    )
    onUpdate({ sites: updatedSites })
  }, [sites, onUpdate])
  
  // ============================================
  // SURVEY DATA HANDLERS
  // ============================================
  
  const updateSiteSurveyData = useCallback((updates) => {
    if (!activeSiteId) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      return {
        ...site,
        siteSurvey: {
          ...site.siteSurvey,
          ...updates
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  const updateNestedSurveyData = useCallback((section, updates) => {
    if (!activeSiteId) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      return {
        ...site,
        siteSurvey: {
          ...site.siteSurvey,
          [section]: {
            ...(site.siteSurvey?.[section] || {}),
            ...updates
          }
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  // Update obstacle
  const handleUpdateObstacle = useCallback((obstacleId, updates) => {
    if (!activeSiteId) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      const obstacles = site.mapData?.siteSurvey?.obstacles || []
      const updatedObstacles = obstacles.map(obs =>
        obs.id === obstacleId ? { ...obs, ...updates, updatedAt: new Date().toISOString() } : obs
      )
      
      return {
        ...site,
        mapData: {
          ...site.mapData,
          siteSurvey: {
            ...site.mapData?.siteSurvey,
            obstacles: updatedObstacles
          }
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  // Remove obstacle
  const handleRemoveObstacle = useCallback((obstacleId) => {
    if (!activeSiteId) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      const obstacles = site.mapData?.siteSurvey?.obstacles || []
      
      return {
        ...site,
        mapData: {
          ...site.mapData,
          siteSurvey: {
            ...site.mapData?.siteSurvey,
            obstacles: obstacles.filter(obs => obs.id !== obstacleId)
          }
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  // Add obstacle manually
  const handleAddObstacle = useCallback((obstacleData) => {
    if (!activeSiteId) return
    
    const newObstacle = {
      id: `obstacle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      elementType: 'obstacle',
      ...obstacleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      const obstacles = site.mapData?.siteSurvey?.obstacles || []
      
      return {
        ...site,
        mapData: {
          ...site.mapData,
          siteSurvey: {
            ...site.mapData?.siteSurvey,
            obstacles: [...obstacles, newObstacle]
          }
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  // ============================================
  // VALIDATION
  // ============================================
  
  const validation = useMemo(() => {
    if (!activeSite) return null
    return validateSiteCompleteness(activeSite)
  }, [activeSite])

  // ============================================
  // RENDER
  // ============================================
  
  if (!activeSite) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Sites Configured</h3>
        <p className="text-gray-500 mb-4">Add your first operation site to begin the survey.</p>
        <button onClick={handleAddSite} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add First Site
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Site Survey</h2>
          <p className="text-gray-500">Document location, boundaries, and hazards for each operation site</p>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Site Management */}
        <div className="lg:col-span-1 space-y-4">
          <SiteManagementPanel
            sites={sites}
            activeSiteId={activeSiteId}
            onSelectSite={handleSelectSite}
            onAddSite={handleAddSite}
            onDuplicateSite={handleDuplicateSite}
            onDeleteSite={handleDeleteSite}
            onRenameSite={handleRenameSite}
          />
          
          {/* Layer Controls - in sidebar instead of floating over map */}
          {showMap && (
            <LayerToggles
              visibleLayers={mapControls.visibleLayers}
              onToggleLayer={mapControls.toggleLayer}
              allowedLayers={['siteSurvey']}
            />
          )}

          {/* View All Sites Toggle */}
          {showMap && sites.length > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">View All Sites</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={mapControls.showAllSites}
                    onChange={(e) => mapControls.setShowAllSites(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-aeria-navy/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-aeria-navy"></div>
                </div>
              </label>
              {mapControls.showAllSites && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing data from all {sites.length} sites. Each site has a unique color.
                </p>
              )}
            </div>
          )}

          {/* Drawing Tools - in sidebar instead of floating over map */}
          {showMap && (
            <DrawingTools
              drawingMode={mapControls.drawingMode}
              isDrawing={mapControls.isDrawing}
              drawingPoints={mapControls.drawingPoints}
              onStartDrawing={mapControls.startDrawing}
              onCancelDrawing={mapControls.cancelDrawing}
              onCompleteDrawing={mapControls.completeDrawing}
              onRemoveLastPoint={mapControls.removeLastDrawingPoint}
              activeLayer="siteSurvey"
              editMode={true}
            />
          )}

          {/* Validation Status */}
          {validation && (
            <div className={`p-4 rounded-lg border ${
              validation.isComplete
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <h4 className={`font-medium mb-2 ${
                validation.isComplete ? 'text-green-800' : 'text-amber-800'
              }`}>
                {validation.isComplete ? '✓ Survey Complete' : 'Survey Incomplete'}
              </h4>
              {!validation.isComplete && (
                <ul className="text-sm space-y-1">
                  {validation.issues.map((issue, i) => (
                    <li key={i} className="text-amber-700">• {issue.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Map */}
          {showMap && (
            <div className="card p-0 overflow-hidden">
              <UnifiedProjectMap
                project={project}
                onUpdate={onUpdate}
                editMode={true}
                activeLayer="siteSurvey"
                height="400px"
                allowedLayers={['siteSurvey']}
                showLegend={true}
                showControls={false}
                externalMapData={mapControls}
                onSiteChange={handleSelectSite}
              />
            </div>
          )}

          {/* Obstacle Label Prompt - shows when obstacle is placed */}
          <ObstacleLabelPrompt
            isOpen={!!mapControls.pendingObstacle}
            position={mapControls.pendingObstacle?.lngLat}
            onSave={(labelData) => mapControls.savePendingObstacle(labelData)}
            onCancel={() => mapControls.cancelPendingObstacle()}
          />
          
          {/* Location Details */}
          <CollapsibleSection 
            title="Location Details" 
            icon={MapPin}
            badge={mapData.siteLocation ? 'Set' : null}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name / Description
                </label>
                <input
                  type="text"
                  value={surveyData.locationName || ''}
                  onChange={(e) => updateSiteSurveyData({ locationName: e.target.value })}
                  placeholder="e.g., North Field Survey Area"
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address / Location Reference
                </label>
                <input
                  type="text"
                  value={surveyData.address || ''}
                  onChange={(e) => updateSiteSurveyData({ address: e.target.value })}
                  placeholder="e.g., 123 Industrial Rd, Calgary AB"
                  className="input"
                />
              </div>
            </div>
            
            {mapData.siteLocation && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  <strong>Coordinates:</strong>{' '}
                  {mapData.siteLocation.geometry.coordinates[1].toFixed(6)},{' '}
                  {mapData.siteLocation.geometry.coordinates[0].toFixed(6)}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Instructions
              </label>
              <textarea
                value={surveyData.accessInstructions || ''}
                onChange={(e) => updateSiteSurveyData({ accessInstructions: e.target.value })}
                placeholder="Describe how to access the site, gate codes, parking locations..."
                rows={3}
                className="input"
              />
            </div>
          </CollapsibleSection>

          {/* Obstacles */}
          <CollapsibleSection 
            title="Obstacles & Hazards" 
            icon={AlertTriangle}
            badge={mapData.obstacles?.length > 0 ? `${mapData.obstacles.length} marked` : null}
          >
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                <Info className="w-4 h-4 inline mr-1" />
                Mark obstacles using the <strong>map drawing tools</strong> or <strong>add manually</strong> below with coordinates.
              </p>
            </div>
            
            <ObstaclesList
              obstacles={mapData.obstacles || []}
              onUpdate={handleUpdateObstacle}
              onRemove={handleRemoveObstacle}
              onAdd={handleAddObstacle}
            />
          </CollapsibleSection>

          {/* Expected Weather Conditions */}
          <CollapsibleSection title="Expected Weather Conditions" icon={Cloud} defaultOpen={false}>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                Select conditions typical for this location at the planned time of year. Live weather will be shown in Tailgate on the day of operations.
              </p>
            </div>

            <div className="space-y-4">
              {/* Condition Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Conditions (select all that may apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {[
                    { id: 'clear', label: 'Clear/Sunny', icon: '☀️' },
                    { id: 'cloudy', label: 'Cloudy', icon: '☁️' },
                    { id: 'overcast', label: 'Overcast', icon: '🌥️' },
                    { id: 'rain', label: 'Rain', icon: '🌧️' },
                    { id: 'snow', label: 'Snow', icon: '❄️' },
                    { id: 'fog', label: 'Fog', icon: '🌫️' },
                    { id: 'wind', label: 'Wind', icon: '💨' },
                    { id: 'thunderstorms', label: 'Thunderstorms', icon: '⛈️' },
                    { id: 'haze', label: 'Haze/Smoke', icon: '🌁' },
                    { id: 'freezing', label: 'Freezing', icon: '🥶' },
                    { id: 'hot', label: 'Hot (>30°C)', icon: '🔥' },
                    { id: 'variable', label: 'Variable', icon: '🔄' }
                  ].map(condition => {
                    const conditions = surveyData.weatherPlanning?.expectedConditions || []
                    const isChecked = conditions.includes(condition.id)
                    return (
                      <label
                        key={condition.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newConditions = e.target.checked
                              ? [...conditions, condition.id]
                              : conditions.filter(c => c !== condition.id)
                            updateNestedSurveyData('weatherPlanning', { expectedConditions: newConditions })
                          }}
                          className="sr-only"
                        />
                        <span>{condition.icon}</span>
                        <span className="text-sm">{condition.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Wind and Visibility Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Wind (km/h)
                  </label>
                  <input
                    type="number"
                    value={surveyData.weatherPlanning?.maxWind || ''}
                    onChange={(e) => updateNestedSurveyData('weatherPlanning', { maxWind: e.target.value })}
                    placeholder="e.g., 25"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Visibility (km)
                  </label>
                  <input
                    type="number"
                    value={surveyData.weatherPlanning?.minVisibility || ''}
                    onChange={(e) => updateNestedSurveyData('weatherPlanning', { minVisibility: e.target.value })}
                    placeholder="e.g., 5"
                    className="input"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weather Notes
                </label>
                <textarea
                  value={surveyData.weatherPlanning?.notes || ''}
                  onChange={(e) => updateNestedSurveyData('weatherPlanning', { notes: e.target.value })}
                  placeholder="Local weather patterns, seasonal considerations, go/no-go criteria..."
                  rows={2}
                  className="input resize-none"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Surroundings */}
          <CollapsibleSection title="Site Surroundings" icon={Mountain} defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mountain className="w-4 h-4 inline mr-1" />
                  Terrain
                </label>
                <input
                  type="text"
                  value={surveyData.surroundings?.terrain || ''}
                  onChange={(e) => updateNestedSurveyData('surroundings', { terrain: e.target.value })}
                  placeholder="e.g., Flat agricultural land, gentle slope"
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TreePine className="w-4 h-4 inline mr-1" />
                  Vegetation
                </label>
                <input
                  type="text"
                  value={surveyData.surroundings?.vegetation || ''}
                  onChange={(e) => updateNestedSurveyData('surroundings', { vegetation: e.target.value })}
                  placeholder="e.g., Open grassland, scattered trees"
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building className="w-4 h-4 inline mr-1" />
                  Structures
                </label>
                <input
                  type="text"
                  value={surveyData.surroundings?.structures || ''}
                  onChange={(e) => updateNestedSurveyData('surroundings', { structures: e.target.value })}
                  placeholder="e.g., Industrial buildings to the east"
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Droplets className="w-4 h-4 inline mr-1" />
                  Water Features
                </label>
                <input
                  type="text"
                  value={surveyData.surroundings?.waterFeatures || ''}
                  onChange={(e) => updateNestedSurveyData('surroundings', { waterFeatures: e.target.value })}
                  placeholder="e.g., Creek 200m south, pond on-site"
                  className="input"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wildlife Considerations
              </label>
              <textarea
                value={surveyData.surroundings?.wildlife || ''}
                onChange={(e) => updateNestedSurveyData('surroundings', { wildlife: e.target.value })}
                placeholder="Note any wildlife concerns, nesting areas, migration patterns..."
                rows={2}
                className="input"
              />
            </div>
          </CollapsibleSection>
          
          {/* Access */}
          <CollapsibleSection title="Site Access" icon={Car} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={surveyData.access?.vehicleAccess ?? true}
                  onChange={(e) => updateNestedSurveyData('access', { vehicleAccess: e.target.checked })}
                  className="w-4 h-4 text-aeria-navy rounded focus:ring-aeria-navy"
                />
                <div>
                  <p className="font-medium text-gray-900">Vehicle Access</p>
                  <p className="text-sm text-gray-500">Site accessible by vehicle</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={surveyData.access?.parkingAvailable ?? true}
                  onChange={(e) => updateNestedSurveyData('access', { parkingAvailable: e.target.checked })}
                  className="w-4 h-4 text-aeria-navy rounded focus:ring-aeria-navy"
                />
                <div>
                  <p className="font-medium text-gray-900">Parking Available</p>
                  <p className="text-sm text-gray-500">Adequate parking on-site</p>
                </div>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Key className="w-4 h-4 inline mr-1" />
                  Land Owner / Contact
                </label>
                <input
                  type="text"
                  value={surveyData.access?.landOwner || ''}
                  onChange={(e) => updateNestedSurveyData('access', { landOwner: e.target.value })}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="e.g., ABC Corp - John Smith"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permissions Required
                </label>
                <input
                  type="text"
                  value={Array.isArray(surveyData.access?.permissionsRequired)
                    ? surveyData.access.permissionsRequired.join(', ')
                    : ''}
                  onChange={(e) => updateNestedSurveyData('access', {
                    permissionsRequired: e.target.value.split(',').map(p => p.trim()).filter(Boolean)
                  })}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="e.g., Land access permit, Site induction"
                  className="input"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Notes
              </label>
              <textarea
                value={surveyData.access?.accessNotes || ''}
                onChange={(e) => updateNestedSurveyData('access', { accessNotes: e.target.value })}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Gate codes, special access requirements, timing restrictions..."
                rows={2}
                className="input"
              />
            </div>
          </CollapsibleSection>
          
          {/* Survey Notes */}
          <CollapsibleSection title="Survey Notes & Photos" icon={FileText} defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Survey Date
                </label>
                <input
                  type="date"
                  value={surveyData.surveyDate ? surveyData.surveyDate.split('T')[0] : ''}
                  onChange={(e) => updateSiteSurveyData({ surveyDate: e.target.value })}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surveyed By
                </label>
                <input
                  type="text"
                  value={surveyData.surveyedBy || ''}
                  onChange={(e) => updateSiteSurveyData({ surveyedBy: e.target.value })}
                  placeholder="e.g., John Smith, PIC"
                  className="input"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={surveyData.notes || ''}
                onChange={(e) => updateSiteSurveyData({ notes: e.target.value })}
                placeholder="Any additional observations or notes from the site survey..."
                rows={4}
                className="input"
              />
            </div>
            
            {/* Photo upload */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Site Photos
                <PhotoCountBadge count={surveyData.photos?.length} />
              </h4>
              <PhotoUpload
                projectId={project?.id}
                siteId={activeSiteId}
                photos={surveyData.photos || []}
                onPhotosChange={(photos) => updateSiteSurveyData({ photos })}
                maxPhotos={20}
              />
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  )
}

ProjectSiteSurvey.propTypes = {
  project: PropTypes.shape({
    siteSurvey: PropTypes.object,
    sites: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}
