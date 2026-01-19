/**
 * MapControls.jsx
 * Control panel for the unified project map
 * 
 * BATCH 6 FINAL - All issues fixed:
 * - Fixed scroll not working in control panels
 * - Fixed expand/collapse buttons not responding
 * - Fixed click events being intercepted by map
 * - Added fullscreen toggle support
 * - Increased z-index for reliable layering
 * 
 * @location src/components/map/MapControls.jsx
 * @action REPLACE
 */

import React, { useState, useCallback } from 'react'
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
  Minimize2,
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
  Expand
} from 'lucide-react'
import { MAP_LAYERS, MAP_BASEMAPS, SITE_STATUS } from '../../lib/mapDataStructures'
import { DRAWING_MODES } from '../../hooks/useMapData'

// ============================================
// EVENT HELPERS - CRITICAL FOR MAP CONTROL INTERACTIVITY
// ============================================

/**
 * Stops event propagation to prevent map from intercepting
 * BUT does NOT preventDefault - allows native behaviors like scrolling
 */
const stopMapPropagation = (e) => {
  e.stopPropagation()
  // Don't preventDefault - this allows native scroll, click, etc.
}

/**
 * For wheel events specifically - stop propagation but allow scroll
 */
const handleWheel = (e) => {
  e.stopPropagation()
  // Don't preventDefault - allows the div to scroll naturally
}

/**
 * For mouse/pointer events that shouldn't reach the map
 */
const handlePointerEvent = (e) => {
  e.stopPropagation()
}

// ============================================
// SITE SELECTOR COMPONENT
// ============================================

export function SiteSelector({ 
  sites, 
  activeSiteId, 
  onSelectSite, 
  onAddSite,
  onDuplicateSite,
  onDeleteSite,
  editMode = false,
  compact = false 
}) {
  const [menuOpenId, setMenuOpenId] = useState(null)
  
  const handleSiteClick = useCallback((e, siteId) => {
    e.stopPropagation()
    e.preventDefault()
    onSelectSite(siteId)
  }, [onSelectSite])
  
  if (compact) {
    return (
      <div 
        className="relative pointer-events-auto"
        onMouseDown={handlePointerEvent}
        onClick={handlePointerEvent}
      >
        <select
          value={activeSiteId || ''}
          onChange={(e) => {
            e.stopPropagation()
            onSelectSite(e.target.value)
          }}
          className="input text-sm py-1.5 pr-8"
          onClick={handlePointerEvent}
        >
          {sites.map(site => (
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
      className="map-control-panel bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden pointer-events-auto"
      onWheel={handleWheel}
      onMouseDown={handlePointerEvent}
      onPointerDown={handlePointerEvent}
      onClick={handlePointerEvent}
    >
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sites ({sites.length}/10)
          </span>
          {editMode && sites.length < 10 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onAddSite?.()
              }}
              onMouseDown={handlePointerEvent}
              className="p-1 text-aeria-navy hover:bg-aeria-navy/10 rounded transition-colors"
              title="Add new site"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div 
        className="max-h-60 overflow-y-auto"
        onWheel={handleWheel}
        style={{ overscrollBehavior: 'contain' }}
      >
        {sites.map((site, index) => {
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
              onClick={(e) => handleSiteClick(e, site.id)}
              onMouseDown={handlePointerEvent}
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
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setMenuOpenId(menuOpenId === site.id ? null : site.id)
                    }}
                    onMouseDown={handlePointerEvent}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {menuOpenId === site.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-30"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuOpenId(null)
                        }}
                      />
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            onDuplicateSite?.(site.id)
                            setMenuOpenId(null)
                          }}
                          onMouseDown={handlePointerEvent}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        {sites.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              onDeleteSite?.(site.id)
                              setMenuOpenId(null)
                            }}
                            onMouseDown={handlePointerEvent}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// LAYER TOGGLES COMPONENT
// ============================================

export function LayerToggles({ 
  visibleLayers, 
  onToggleLayer, 
  allowedLayers = ['siteSurvey', 'flightPlan', 'emergency'],
  compact = false 
}) {
  const [isExpanded, setIsExpanded] = useState(!compact)
  
  const layers = Object.entries(MAP_LAYERS).filter(([id]) => allowedLayers.includes(id))
  
  const handleToggle = useCallback((e, layerId) => {
    e.stopPropagation()
    e.preventDefault()
    onToggleLayer(layerId)
  }, [onToggleLayer])
  
  const handleExpandClick = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsExpanded(prev => !prev)
  }, [])
  
  if (compact) {
    return (
      <div 
        className="flex gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 pointer-events-auto"
        onMouseDown={handlePointerEvent}
        onClick={handlePointerEvent}
      >
        {layers.map(([id, layer]) => {
          const isVisible = visibleLayers[id]
          return (
            <button
              key={id}
              type="button"
              onClick={(e) => handleToggle(e, id)}
              onMouseDown={handlePointerEvent}
              className={`p-1.5 rounded transition-colors ${
                isVisible 
                  ? 'bg-gray-100 text-gray-700' 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={`${layer.label} ${isVisible ? '(visible)' : '(hidden)'}`}
            >
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: isVisible ? layer.color : '#ccc' }}
              />
            </button>
          )
        })}
      </div>
    )
  }
  
  return (
    <div 
      className="map-control-panel bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden pointer-events-auto"
      onWheel={handleWheel}
      onMouseDown={handlePointerEvent}
      onPointerDown={handlePointerEvent}
      onClick={handlePointerEvent}
    >
      <button
        type="button"
        onClick={handleExpandClick}
        onMouseDown={handlePointerEvent}
        className="w-full px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
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
                type="button"
                onClick={(e) => handleToggle(e, id)}
                onMouseDown={handlePointerEvent}
                className={`w-full flex items-center gap-3 px-2 py-1.5 rounded transition-colors hover:bg-gray-100 ${
                  isVisible ? 'bg-gray-50' : 'opacity-50'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="flex-1 text-left text-sm text-gray-700">
                  {layer.label}
                </span>
                {isVisible ? (
                  <Eye className="w-4 h-4 text-gray-500" />
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
  drawingMode,
  isDrawing,
  drawingPoints,
  onStartDrawing,
  onCancelDrawing,
  onCompleteDrawing,
  onRemoveLastPoint,
  activeLayer = 'siteSurvey',
  editMode = false
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  if (!editMode) return null
  
  const handleExpandClick = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsExpanded(prev => !prev)
  }, [])
  
  // Tool groups by layer
  const toolGroups = {
    siteSurvey: [
      { mode: 'siteLocation', icon: MapPin, label: 'Site Location' },
      { mode: 'operationsBoundary', icon: Square, label: 'Boundary' },
      { mode: 'obstacle', icon: AlertTriangle, label: 'Obstacle' }
    ],
    flightPlan: [
      { mode: 'launchPoint', icon: Plane, label: 'Launch' },
      { mode: 'recoveryPoint', icon: Target, label: 'Recovery' },
      { mode: 'flightArea', icon: Square, label: 'Flight Area' }
    ],
    emergency: [
      { mode: 'musterPoint', icon: Flag, label: 'Muster' },
      { mode: 'evacuationRoute', icon: Navigation, label: 'Evac Route' }
    ]
  }
  
  const currentTools = toolGroups[activeLayer] || []
  
  return (
    <div 
      className="map-control-panel bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden pointer-events-auto"
      onWheel={handleWheel}
      onMouseDown={handlePointerEvent}
      onPointerDown={handlePointerEvent}
      onClick={handlePointerEvent}
    >
      <button
        type="button"
        onClick={handleExpandClick}
        onMouseDown={handlePointerEvent}
        className="w-full px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
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
        <div 
          className="p-2 max-h-64 overflow-y-auto"
          onWheel={handleWheel}
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* Active drawing indicator */}
          {isDrawing && (
            <div className="mb-2 p-2 bg-aeria-navy/10 rounded-lg">
              <p className="text-xs font-medium text-aeria-navy mb-1">
                {DRAWING_MODES[drawingMode.id]?.label || 'Drawing'}
              </p>
              {drawingMode.type === 'polygon' && (
                <p className="text-xs text-gray-600">
                  Points: {drawingPoints.length} (need 3+)
                </p>
              )}
              {drawingMode.type === 'line' && (
                <p className="text-xs text-gray-600">
                  Points: {drawingPoints.length} (need 2+)
                </p>
              )}
              <div className="flex gap-1 mt-2">
                {drawingPoints.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onRemoveLastPoint()
                    }}
                    onMouseDown={handlePointerEvent}
                    className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Undo
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onCancelDrawing()
                  }}
                  onMouseDown={handlePointerEvent}
                  className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Cancel
                </button>
                {((drawingMode.type === 'polygon' && drawingPoints.length >= 3) ||
                  (drawingMode.type === 'line' && drawingPoints.length >= 2)) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onCompleteDrawing()
                    }}
                    onMouseDown={handlePointerEvent}
                    className="flex-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Tool buttons */}
          <div className="grid grid-cols-2 gap-1">
            {currentTools.map(({ mode, icon: Icon, label }) => {
              const isActive = drawingMode.id === mode
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    isActive ? onCancelDrawing() : onStartDrawing(mode)
                  }}
                  onMouseDown={handlePointerEvent}
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
  
  const basemaps = Object.entries(MAP_BASEMAPS)
  const current = MAP_BASEMAPS[currentBasemap] || MAP_BASEMAPS.streets
  
  const handleToggle = useCallback((e) => {
    e.stopPropagation()
    e.preventDefault()
    setIsOpen(prev => !prev)
  }, [])
  
  const handleSelect = useCallback((e, basemapId) => {
    e.stopPropagation()
    e.preventDefault()
    onChangeBasemap(basemapId)
    setIsOpen(false)
  }, [onChangeBasemap])
  
  const IconComponent = current.icon === 'map' ? Map : current.icon === 'globe' ? Globe : Mountain
  
  return (
    <div 
      className="relative pointer-events-auto"
      onMouseDown={handlePointerEvent}
      onClick={handlePointerEvent}
    >
      <button
        type="button"
        onClick={handleToggle}
        onMouseDown={handlePointerEvent}
        className="p-2 bg-white rounded-lg shadow border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        title="Change basemap"
      >
        <IconComponent className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-30"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          />
          <div 
            className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-40"
            onWheel={handleWheel}
          >
            {basemaps.map(([id, basemap]) => {
              const BasemapIcon = basemap.icon === 'map' ? Map : basemap.icon === 'globe' ? Globe : Mountain
              const isActive = id === currentBasemap
              return (
                <button
                  key={id}
                  type="button"
                  onClick={(e) => handleSelect(e, id)}
                  onMouseDown={handlePointerEvent}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                    isActive 
                      ? 'bg-aeria-navy/10 text-aeria-navy' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BasemapIcon className="w-4 h-4" />
                  {basemap.label}
                  {isActive && <Check className="w-4 h-4 ml-auto" />}
                </button>
              )
            })}
          </div>
        </>
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
  isFullscreen = false,
  onToggleFullscreen
}) {
  return (
    <div 
      className="map-control-panel flex flex-col gap-1 bg-white rounded-lg shadow border border-gray-200 p-1 pointer-events-auto"
      onWheel={handleWheel}
      onMouseDown={handlePointerEvent}
      onClick={handlePointerEvent}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onZoomIn()
        }}
        onMouseDown={handlePointerEvent}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="Zoom in"
      >
        <Plus className="w-5 h-5" />
      </button>
      
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onZoomOut()
        }}
        onMouseDown={handlePointerEvent}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="Zoom out"
      >
        <Minus className="w-5 h-5" />
      </button>
      
      <div className="w-full h-px bg-gray-200 my-1" />
      
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onFitToSite()
        }}
        onMouseDown={handlePointerEvent}
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
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onFitToAll()
        }}
        onMouseDown={handlePointerEvent}
        className={`p-2 rounded transition-colors ${
          showAllSites 
            ? 'text-aeria-navy bg-aeria-navy/10' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title="Fit to all sites"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
      
      {/* Fullscreen toggle */}
      {onToggleFullscreen && (
        <>
          <div className="w-full h-px bg-gray-200 my-1" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onToggleFullscreen()
            }}
            onMouseDown={handlePointerEvent}
            className={`p-2 rounded transition-colors ${
              isFullscreen 
                ? 'text-aeria-navy bg-aeria-navy/10' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={isFullscreen ? "Exit fullscreen" : "Expand map"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Expand className="w-5 h-5" />
            )}
          </button>
        </>
      )}
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
  
  // Fullscreen props
  isFullscreen = false,
  onToggleFullscreen,
  
  // Mode
  editMode = false,
  position = 'left' // 'left' | 'right'
}) {
  const positionClasses = position === 'right' 
    ? 'right-4' 
    : 'left-4'
  
  return (
    <>
      {/* Left/Right side controls - z-50 ensures above map */}
      <div 
        className={`absolute top-4 ${positionClasses} z-50 flex flex-col gap-3 max-h-[calc(100%-8rem)] pointer-events-none`}
        style={{ overscrollBehavior: 'contain' }}
      >
        <SiteSelector
          sites={sites}
          activeSiteId={activeSiteId}
          onSelectSite={onSelectSite}
          onAddSite={onAddSite}
          onDuplicateSite={onDuplicateSite}
          onDeleteSite={onDeleteSite}
          editMode={editMode}
        />
        
        <LayerToggles
          visibleLayers={visibleLayers}
          onToggleLayer={onToggleLayer}
          allowedLayers={allowedLayers}
        />
        
        {editMode && (
          <DrawingTools
            drawingMode={drawingMode}
            isDrawing={isDrawing}
            drawingPoints={drawingPoints}
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
        className="absolute bottom-4 right-4 z-50 flex items-end gap-2 pointer-events-none"
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
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>
    </>
  )
}

export default MapControlsPanel
