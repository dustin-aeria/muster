/**
 * MapControls.jsx
 * Control panel for the unified project map
 * 
 * PHASE 1 FIXES:
 * - Added pointer-events: auto to ensure controls are clickable
 * - Fixed overflow scroll on site selector
 * - Added stopPropagation to prevent map events from interfering
 * - Added CSS classes for proper z-index stacking
 * 
 * @location src/components/map/MapControls.jsx
 * @action REPLACE
 */

import React, { useState, useRef, useEffect } from 'react'
import {
  MapPin,
  Layers,
  PenTool,
  Map,
  Globe,
  Mountain,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Maximize2,
  Target,
  Trash2,
  X,
  Check,
  Square,
  Circle,
  Navigation,
  Flag,
  Plane,
  AlertTriangle,
  Copy,
  MoreVertical,
  Undo2
} from 'lucide-react'
import { MAP_LAYERS, MAP_BASEMAPS, SITE_STATUS } from '../../lib/mapDataStructures'
import { DRAWING_MODES } from '../../hooks/useMapData'

// ============================================
// SITE SELECTOR COMPONENT
// ============================================

export function SiteSelector({ 
  sites = [], 
  activeSiteId, 
  onSelectSite, 
  onAddSite,
  onDuplicateSite,
  onDeleteSite,
  editMode = false,
  compact = false 
}) {
  const [menuOpenId, setMenuOpenId] = useState(null)
  const containerRef = useRef(null)
  
  // Defensive: ensure sites is always an array
  const safeSites = Array.isArray(sites) ? sites : []
  const activeSite = safeSites.find(s => s.id === activeSiteId)
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpenId && containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpenId])
  
  if (compact) {
    return (
      <div 
        className="relative map-control-panel"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <select
          value={activeSiteId || ''}
          onChange={(e) => {
            e.stopPropagation()
            onSelectSite(e.target.value)
          }}
          className="input text-sm py-1.5 pr-8 cursor-pointer"
        >
          {safeSites.map(site => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
      </div>
    )
  }
  
  return (
    <div 
      ref={containerRef}
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden map-control-panel"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sites ({safeSites.length}/10)
          </span>
          {editMode && safeSites.length < 10 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddSite?.()
              }}
              className="p-1 text-aeria-navy hover:bg-aeria-navy/10 rounded transition-colors"
              title="Add new site"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Scrollable site list with proper overflow handling */}
      <div 
        className="max-h-60 overflow-y-auto overscroll-contain"
        onWheel={(e) => e.stopPropagation()}
      >
        {safeSites.map((site, index) => {
          const isActive = site.id === activeSiteId
          const status = SITE_STATUS[site.status] || SITE_STATUS.draft
          
          return (
            <div
              key={site.id}
              className={`relative flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-aeria-navy/10 border-l-2 border-aeria-navy' 
                  : 'hover:bg-gray-50 border-l-2 border-transparent'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onSelectSite(site.id)
              }}
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
              />
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isActive ? 'text-aeria-navy' : 'text-gray-900'}`}>
                  {site.name}
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${status.color}`}>
                  {status.label}
                </span>
              </div>
              
              {editMode && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpenId(menuOpenId === site.id ? null : site.id)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {menuOpenId === site.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDuplicateSite?.(site.id)
                          setMenuOpenId(null)
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      {safeSites.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteSite?.(site.id)
                            setMenuOpenId(null)
                          }}
                          className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        
        {safeSites.length === 0 && (
          <div className="px-4 py-6 text-center">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No sites yet</p>
            {editMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAddSite?.()
                }}
                className="mt-2 text-sm text-aeria-navy hover:underline"
              >
                Add first site
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// LAYER TOGGLE COMPONENT
// ============================================

export function LayerToggles({ 
  visibleLayers = {}, 
  onToggleLayer, 
  allowedLayers = ['siteSurvey', 'flightPlan', 'emergency'],
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(!compact)
  
  // Defensive: ensure allowedLayers is always an array
  const safeAllowedLayers = Array.isArray(allowedLayers) ? allowedLayers : []
  const layers = Object.entries(MAP_LAYERS || {}).filter(([id]) => safeAllowedLayers.includes(id))
  
  if (compact) {
    return (
      <div 
        className="flex items-center gap-1 bg-white rounded-lg shadow border border-gray-200 p-1 map-control-panel"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {layers.map(([id, layer]) => {
          const isVisible = visibleLayers[id]
          return (
            <button
              key={id}
              onClick={(e) => {
                e.stopPropagation()
                onToggleLayer(id)
              }}
              className={`p-2 rounded transition-colors ${
                isVisible 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={`${isVisible ? 'Hide' : 'Show'} ${layer.label}`}
              style={{ color: isVisible ? layer.color : undefined }}
            >
              {id === 'siteSurvey' && <MapPin className="w-4 h-4" />}
              {id === 'flightPlan' && <Plane className="w-4 h-4" />}
              {id === 'emergency' && <AlertTriangle className="w-4 h-4" />}
            </button>
          )
        })}
      </div>
    )
  }
  
  return (
    <div 
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden map-control-panel"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="w-full px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100"
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Layers
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-2 space-y-1">
          {layers.map(([id, layer]) => {
            const isVisible = visibleLayers[id]
            return (
              <button
                key={id}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleLayer(id)
                }}
                className={`w-full flex items-center gap-3 px-2 py-1.5 rounded transition-colors ${
                  isVisible ? 'bg-gray-50' : 'opacity-50'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-sm flex-1 text-left">{layer.label}</span>
                {isVisible ? (
                  <Eye className="w-4 h-4 text-gray-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================
// DRAWING TOOLS COMPONENT
// ============================================

export function DrawingTools({
  drawingMode = {},
  isDrawing = false,
  drawingPoints = [],
  onStartDrawing,
  onCancelDrawing,
  onCompleteDrawing,
  onRemoveLastPoint,
  activeLayer = 'siteSurvey',
  editMode = false
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  if (!editMode) return null
  
  // Get tools for the active layer
  const getToolsForLayer = (layer) => {
    switch (layer) {
      case 'siteSurvey':
        return [
          { mode: 'siteLocation', icon: MapPin, label: 'Site Location' },
          { mode: 'operationsBoundary', icon: Square, label: 'Boundary' },
          { mode: 'obstacle', icon: AlertTriangle, label: 'Obstacle' }
        ]
      case 'flightPlan':
        return [
          { mode: 'launchPoint', icon: Navigation, label: 'Launch' },
          { mode: 'recoveryPoint', icon: Target, label: 'Recovery' },
          { mode: 'pilotPosition', icon: Circle, label: 'Pilot' },
          { mode: 'flightGeography', icon: Square, label: 'Flight Area' }
        ]
      case 'emergency':
        return [
          { mode: 'musterPoint', icon: Flag, label: 'Muster Point' },
          { mode: 'evacuationRoute', icon: Navigation, label: 'Evac Route' }
        ]
      default:
        return []
    }
  }
  
  const currentTools = getToolsForLayer(activeLayer)
  const safeDrawingPoints = Array.isArray(drawingPoints) ? drawingPoints : []
  
  return (
    <div 
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden map-control-panel"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="w-full px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100"
      >
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <PenTool className="w-4 h-4" />
          Drawing Tools
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-2 space-y-2">
          {/* Drawing status */}
          {isDrawing && (
            <div className="p-2 bg-aeria-navy/5 rounded-lg border border-aeria-navy/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-aeria-navy">
                  {drawingMode.label || 'Drawing'}
                </span>
                <div className="flex gap-1">
                  {safeDrawingPoints.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveLastPoint?.()
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                      title="Undo last point"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCancelDrawing?.()
                    }}
                    className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100"
                    title="Cancel drawing"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {drawingMode.type === 'polygon' && safeDrawingPoints.length > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>{safeDrawingPoints.length} points</span>
                  {safeDrawingPoints.length >= 3 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCompleteDrawing?.()
                      }}
                      className="px-2 py-1 bg-aeria-navy text-white rounded text-xs hover:bg-aeria-navy/90"
                    >
                      Done
                    </button>
                  )}
                </div>
              )}
              
              {drawingMode.type === 'line' && safeDrawingPoints.length > 0 && (
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>{safeDrawingPoints.length} points</span>
                  {safeDrawingPoints.length >= 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCompleteDrawing?.()
                      }}
                      className="px-2 py-1 bg-aeria-navy text-white rounded text-xs hover:bg-aeria-navy/90"
                    >
                      Done
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Tool buttons */}
          <div className="grid grid-cols-2 gap-1">
            {currentTools.map(({ mode, icon: Icon, label }) => {
              const modeConfig = DRAWING_MODES[mode] || {}
              const isActive = drawingMode.id === mode
              return (
                <button
                  key={mode}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isActive) {
                      onCancelDrawing?.()
                    } else {
                      onStartDrawing?.(mode)
                    }
                  }}
                  disabled={isDrawing && !isActive}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                    isActive
                      ? 'bg-aeria-navy text-white'
                      : isDrawing
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// BASEMAP SWITCHER COMPONENT
// ============================================

export function BasemapSwitcher({ currentBasemap, onChangeBasemap }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  
  const basemaps = Object.values(MAP_BASEMAPS || {})
  const current = (MAP_BASEMAPS || {})[currentBasemap] || MAP_BASEMAPS?.streets
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])
  
  return (
    <div 
      ref={containerRef}
      className="relative map-control-panel"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="p-2 bg-white rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Change basemap"
      >
        {current?.id === 'satellite' ? (
          <Globe className="w-5 h-5 text-gray-700" />
        ) : current?.id === 'outdoors' ? (
          <Mountain className="w-5 h-5 text-gray-700" />
        ) : (
          <Map className="w-5 h-5 text-gray-700" />
        )}
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          {basemaps.map(basemap => (
            <button
              key={basemap.id}
              onClick={(e) => {
                e.stopPropagation()
                onChangeBasemap?.(basemap.id)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors whitespace-nowrap ${
                current?.id === basemap.id
                  ? 'bg-aeria-navy/10 text-aeria-navy'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {basemap.id === 'satellite' ? (
                <Globe className="w-4 h-4" />
              ) : basemap.id === 'outdoors' ? (
                <Mountain className="w-4 h-4" />
              ) : (
                <Map className="w-4 h-4" />
              )}
              {basemap.label}
              {current?.id === basemap.id && (
                <Check className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// VIEW CONTROLS COMPONENT
// ============================================

export function ViewControls({ 
  onFitToSite, 
  onFitToAll, 
  onZoomIn, 
  onZoomOut,
  showAllSites,
  onToggleShowAll 
}) {
  return (
    <div 
      className="flex flex-col gap-1 bg-white rounded-lg shadow border border-gray-200 p-1 map-control-panel"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onZoomIn?.()
        }}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="Zoom in"
      >
        <Plus className="w-5 h-5" />
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          onZoomOut?.()
        }}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="Zoom out"
      >
        <Minus className="w-5 h-5" />
      </button>
      
      <div className="w-full h-px bg-gray-200 my-1" />
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          onFitToSite?.()
        }}
        className={`p-2 rounded transition-colors ${
          !showAllSites 
            ? 'text-aeria-navy bg-aeria-navy/10' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="Fit to active site"
      >
        <Target className="w-5 h-5" />
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation()
          onFitToAll?.()
        }}
        className={`p-2 rounded transition-colors ${
          showAllSites 
            ? 'text-aeria-navy bg-aeria-navy/10' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="Fit to all sites"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
    </div>
  )
}

// ============================================
// COMBINED CONTROLS PANEL
// ============================================

export function MapControlsPanel({
  // Site props
  sites,
  activeSiteId,
  onSelectSite,
  onAddSite,
  onDuplicateSite,
  onDeleteSite,
  
  // Layer props
  visibleLayers,
  onToggleLayer,
  allowedLayers,
  
  // Drawing props
  drawingMode,
  isDrawing,
  drawingPoints,
  onStartDrawing,
  onCancelDrawing,
  onCompleteDrawing,
  onRemoveLastPoint,
  activeLayer,
  
  // Basemap props
  currentBasemap,
  onChangeBasemap,
  
  // View props
  onFitToSite,
  onFitToAll,
  onZoomIn,
  onZoomOut,
  showAllSites,
  
  // Mode
  editMode = false,
  position = 'left' // 'left' | 'right'
}) {
  const positionClasses = position === 'right' 
    ? 'right-4' 
    : 'left-4'
  
  // Defensive defaults
  const safeSites = Array.isArray(sites) ? sites : []
  const safeVisibleLayers = visibleLayers || {}
  const safeDrawingMode = drawingMode || { id: 'none' }
  const safeDrawingPoints = Array.isArray(drawingPoints) ? drawingPoints : []
  
  return (
    <>
      {/* Left/Right side controls - wrapped in div with pointer-events */}
      <div 
        className={`absolute top-4 ${positionClasses} z-20 flex flex-col gap-3 max-h-[calc(100%-8rem)] pointer-events-auto`}
        style={{ pointerEvents: 'auto' }}
      >
        <SiteSelector
          sites={safeSites}
          activeSiteId={activeSiteId}
          onSelectSite={onSelectSite}
          onAddSite={onAddSite}
          onDuplicateSite={onDuplicateSite}
          onDeleteSite={onDeleteSite}
          editMode={editMode}
        />
        
        <LayerToggles
          visibleLayers={safeVisibleLayers}
          onToggleLayer={onToggleLayer}
          allowedLayers={allowedLayers}
        />
        
        {editMode && (
          <DrawingTools
            drawingMode={safeDrawingMode}
            isDrawing={isDrawing}
            drawingPoints={safeDrawingPoints}
            onStartDrawing={onStartDrawing}
            onCancelDrawing={onCancelDrawing}
            onCompleteDrawing={onCompleteDrawing}
            onRemoveLastPoint={onRemoveLastPoint}
            activeLayer={activeLayer}
            editMode={editMode}
          />
        )}
      </div>
      
      {/* Bottom right controls */}
      <div 
        className="absolute bottom-4 right-4 z-20 flex items-end gap-2 pointer-events-auto"
        style={{ pointerEvents: 'auto' }}
      >
        <BasemapSwitcher
          currentBasemap={currentBasemap}
          onChangeBasemap={onChangeBasemap}
        />
        
        <ViewControls
          onFitToSite={onFitToSite}
          onFitToAll={onFitToAll}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          showAllSites={showAllSites}
        />
      </div>
    </>
  )
}

export default MapControlsPanel
