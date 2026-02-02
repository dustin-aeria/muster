/**
 * UnifiedProjectMap.jsx
 * Main unified map component for displaying and editing project sites
 * 
 * Features:
 * - Mapbox GL JS integration
 * - Multi-site display with color coding
 * - Layer-based rendering (Site Survey, Flight Plan, Emergency)
 * - Drawing tools for markers, polygons, and lines
 * - Offline tile caching support
 * - Responsive design
 * - Fullscreen mode
 * 
 * FIXES APPLIED:
 * - Fixed stale closure bug in map click handlers (refs sync with state)
 * - Fixed layers disappearing after basemap change (styleVersion + style.load)
 * - Added fullscreen toggle with Escape key support
 * 
 * @location src/components/map/UnifiedProjectMap.jsx
 * @action REPLACE
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

import { useMapData, DRAWING_MODES } from '../../hooks/useMapData'
import { MapControlsPanel, FullscreenButton } from './MapControls'
import { MapLegend, SiteColorLegend } from './MapLegend'
import { MAP_ELEMENT_STYLES, MAP_BASEMAPS, MAP_OVERLAY_LAYERS, getSiteBounds } from '../../lib/mapDataStructures'
import {
  Loader2,
  AlertCircle,
  WifiOff,
  Layers
} from 'lucide-react'
import { logger } from '../../lib/logger'

// ============================================
// MAPBOX TOKEN
// ============================================

// Token should be set in environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

// ============================================
// INJECT KEYFRAME ANIMATION FOR SELECTION
// ============================================

// Inject pulse animation CSS once
if (typeof document !== 'undefined') {
  const styleId = 'aeria-map-animations'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.1); }
      }
    `
    document.head.appendChild(style)
  }
}

// ============================================
// MARKER ICONS (SVG as data URLs)
// ============================================

const MARKER_ICONS = {
  'map-pin': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
  'alert-triangle': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2"/><circle cx="12" cy="17" r="1" fill="white"/></svg>`,
  'plane-takeoff': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22h20M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z"/></svg>`,
  'plane-landing': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22h20M3.77 10.77 2 9l2-4 1.1.55a2 2 0 0 1 .9 1.48l.26 1.97a2 2 0 0 0 .9 1.48L9 10l-1-6 1.1-.55a2 2 0 0 1 2.12.19l4.16 3.12a2 2 0 0 0 2.12.19l4.8-2.4a2.41 2.41 0 0 1 1.73-.17L21 5a1.4 1.4 0 0 1 .87 1.99l-.38.76a2 2 0 0 1-1.07 1.08l-12 5.23a2 2 0 0 1-1.64-.01l-3.01-1.28Z"/></svg>`,
  'user': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>`,
  'flag': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" stroke-width="2"/></svg>`,
  'target': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" fill="white"/><circle cx="12" cy="12" r="6" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="white"/></svg>`
}

// Create marker element - selection state is handled via CSS class, not at creation time
const createMarkerElement = (color, icon = 'map-pin', size = 32) => {
  const el = document.createElement('div')
  el.className = 'map-marker'
  el.style.width = `${size}px`
  el.style.height = `${size}px`
  el.style.cursor = 'pointer'
  el.style.transition = 'filter 0.15s ease, transform 0.15s ease'

  const svgTemplate = MARKER_ICONS[icon] || MARKER_ICONS['map-pin']
  el.innerHTML = svgTemplate.replace('currentColor', color)

  return el
}

// Update marker selection visual
const updateMarkerSelection = (markerEl, isSelected) => {
  if (isSelected) {
    markerEl.style.filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.9))'
    markerEl.style.transform = 'scale(1.15)'
    markerEl.classList.add('map-marker-selected')
  } else {
    markerEl.style.filter = ''
    markerEl.style.transform = ''
    markerEl.classList.remove('map-marker-selected')
  }
}

// ============================================
// OFFLINE CACHE HELPER
// ============================================

const CACHE_NAME = 'aeria-map-tiles-v1'

async function cacheMapTiles(bounds, zoom = 14) {
  if (!('caches' in window)) return false

  try {
    // This is a simplified cache implementation
    // A full implementation would iterate over tile coordinates
    return true
  } catch (err) {
    // Tile caching failed - gracefully continue without offline support
    return false
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export function UnifiedProjectMap({
  project,
  onUpdate,
  editMode = false,
  activeLayer = 'siteSurvey',
  height = '500px',
  showControls = true,
  showLegend = true,
  allowedLayers = ['siteSurvey', 'flightPlan', 'emergency'],
  onSiteChange,
  onElementSelect,
  className = '',
  // Optional external map data - if provided, use it instead of internal useMapData
  externalMapData = null
}) {
  // Refs
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const drawRef = useRef(null)
  // Store polygon/line element data for click lookups
  const polygonsDataRef = useRef([])
  const linesDataRef = useRef([])
  // Track if we're in vertex editing mode
  const [isEditingVertices, setIsEditingVertices] = useState(false)
  const editingElementRef = useRef(null)
  
  // ============================================
  // PHASE 1 FIX: Refs for drawing state
  // These refs always hold the current values and solve
  // the stale closure problem in map event handlers
  // ============================================
  const isDrawingRef = useRef(false)
  const drawingModeRef = useRef(DRAWING_MODES.none)
  const completeDrawingRef = useRef(null)
  const addDrawingPointRef = useRef(null)
  // Refs for edit mode and selection (for polygon/line clicks)
  // Initialize with null - will be updated in useEffect after mapData is available
  const editModeRef = useRef(editMode)
  const setSelectedElementRef = useRef(null)

  // Track initial basemap to prevent unnecessary setStyle on first load
  // Initialize with 'streets' (the default) since basemap isn't available yet
  const initialBasemapRef = useRef('streets')
  
  // State
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [styleVersion, setStyleVersion] = useState(0) // Increments when style changes to force layer re-render
  const [overlayLayers, setOverlayLayers] = useState({}) // Which overlay layers are enabled
  const [showOverlayPanel, setShowOverlayPanel] = useState(false) // Show overlay layer picker
  const [airspaceClasses, setAirspaceClasses] = useState({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true }) // Which airspace classes are visible (numeric icaoClass)
  const [showAirspacePanel, setShowAirspacePanel] = useState(false) // Show airspace class picker
  
  // Map data hook - use external if provided, otherwise create internal
  const internalMapData = useMapData(project, onUpdate, {
    editMode,
    allowedLayers,
    initialBasemap: 'streets'
  })

  // Use external map data if provided (for sidebar controls), otherwise use internal
  const mapData = externalMapData || internalMapData
  
  const {
    sites,
    activeSiteId,
    activeSite,
    visibleLayers,
    drawingMode,
    isDrawing,
    drawingPoints,
    selectedElement,
    basemap,
    showAllSites,
    currentBounds,
    visibleMapElements,
    
    selectSite,
    toggleLayer,
    startDrawing,
    cancelDrawing,
    addDrawingPoint,
    removeLastDrawingPoint,
    completeDrawing,
    setSelectedElement,
    setMarker,
    setPolygon,
    addEvacuationRoute,
    removeElement,
    updateElement,
    setBasemap,
    fitToActiveSite,
    fitToAllSites,
    setShowAllSites
  } = mapData

  // ============================================
  // PHASE 1 FIX: Keep refs in sync with state
  // These effects update refs whenever state changes
  // ============================================
  useEffect(() => {
    isDrawingRef.current = isDrawing
  }, [isDrawing])
  
  useEffect(() => {
    drawingModeRef.current = drawingMode
  }, [drawingMode])
  
  useEffect(() => {
    completeDrawingRef.current = completeDrawing
  }, [completeDrawing])
  
  useEffect(() => {
    addDrawingPointRef.current = addDrawingPoint
  }, [addDrawingPoint])

  useEffect(() => {
    editModeRef.current = editMode
  }, [editMode])

  useEffect(() => {
    setSelectedElementRef.current = setSelectedElement
  }, [setSelectedElement])

  // ============================================
  // KEYBOARD HANDLER FOR DELETE
  // ============================================

  useEffect(() => {
    if (!editMode) return

    const handleKeyDown = (e) => {
      // Delete or Backspace to remove selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault()
        removeElement?.(selectedElement.id, selectedElement.elementType)
      }
      // Escape to deselect
      if (e.key === 'Escape' && selectedElement) {
        setSelectedElement(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editMode, selectedElement, removeElement, setSelectedElement])

  // ============================================
  // VERTEX EDITING FUNCTIONS
  // ============================================

  // Start editing vertices of selected polygon/line
  const startVertexEditing = useCallback(() => {
    if (!selectedElement || !drawRef.current || !mapRef.current) return

    const draw = drawRef.current
    const geometry = selectedElement.geometry

    if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'LineString')) {
      return
    }

    // Store reference to element being edited
    editingElementRef.current = {
      id: selectedElement.id,
      elementType: selectedElement.elementType,
      originalGeometry: JSON.parse(JSON.stringify(geometry))
    }

    // Clear any existing draw features
    draw.deleteAll()

    // Add the feature to draw
    const featureId = draw.add({
      type: 'Feature',
      properties: {},
      geometry: geometry
    })

    // Enter direct_select mode to edit vertices
    draw.changeMode('direct_select', { featureId: featureId[0] })

    setIsEditingVertices(true)
  }, [selectedElement])

  // Save vertex edits
  const saveVertexEdits = useCallback(() => {
    if (!drawRef.current || !editingElementRef.current || !updateElement) return

    const draw = drawRef.current
    const features = draw.getAll()

    if (features.features.length > 0) {
      const editedGeometry = features.features[0].geometry
      const { id, elementType } = editingElementRef.current

      // Update the element with new geometry
      updateElement(id, elementType, {
        geometry: editedGeometry
      })
    }

    // Clean up
    draw.deleteAll()
    draw.changeMode('simple_select')
    editingElementRef.current = null
    setIsEditingVertices(false)
    setSelectedElement(null)
  }, [updateElement, setSelectedElement])

  // Cancel vertex edits
  const cancelVertexEdits = useCallback(() => {
    if (!drawRef.current) return

    const draw = drawRef.current
    draw.deleteAll()
    draw.changeMode('simple_select')
    editingElementRef.current = null
    setIsEditingVertices(false)
  }, [])

  // Listen for draw update events
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    const map = mapRef.current

    const handleDrawUpdate = (e) => {
      // Feature was updated (vertex moved)
      if (e.features && e.features.length > 0) {
        // We'll save on explicit "Done" click, not on every update
        // This allows users to make multiple edits before confirming
      }
    }

    map.on('draw.update', handleDrawUpdate)

    return () => {
      map.off('draw.update', handleDrawUpdate)
    }
  }, [mapLoaded])

  // ============================================
  // INITIALIZE MAP
  // ============================================
  
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    
    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox token not configured. Please set VITE_MAPBOX_TOKEN in your environment.')
      return
    }
    
    mapboxgl.accessToken = MAPBOX_TOKEN
    
    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: MAP_BASEMAPS[basemap]?.style || MAP_BASEMAPS.streets.style,
        center: [-123.1, 49.2], // Default to Vancouver area
        zoom: 10,
        attributionControl: false
      })
      
      // Add attribution control
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')
      
      // Add navigation control
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')
      
      map.on('load', () => {
        setMapLoaded(true)
        mapRef.current = map

        // Initialize MapboxDraw for vertex editing
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {},
          defaultMode: 'simple_select',
          styles: [
            // Polygon fill when selected
            {
              id: 'gl-draw-polygon-fill',
              type: 'fill',
              filter: ['all', ['==', '$type', 'Polygon']],
              paint: {
                'fill-color': '#3B82F6',
                'fill-opacity': 0.1
              }
            },
            // Polygon outline
            {
              id: 'gl-draw-polygon-stroke',
              type: 'line',
              filter: ['all', ['==', '$type', 'Polygon']],
              paint: {
                'line-color': '#3B82F6',
                'line-width': 2
              }
            },
            // Line
            {
              id: 'gl-draw-line',
              type: 'line',
              filter: ['all', ['==', '$type', 'LineString']],
              paint: {
                'line-color': '#F59E0B',
                'line-width': 3
              }
            },
            // Vertex points
            {
              id: 'gl-draw-point',
              type: 'circle',
              filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
              paint: {
                'circle-radius': 7,
                'circle-color': '#FFFFFF',
                'circle-stroke-color': '#3B82F6',
                'circle-stroke-width': 2
              }
            },
            // Midpoint vertices
            {
              id: 'gl-draw-midpoint',
              type: 'circle',
              filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
              paint: {
                'circle-radius': 5,
                'circle-color': '#3B82F6',
                'circle-opacity': 0.5
              }
            }
          ]
        })

        map.addControl(draw, 'top-left')
        drawRef.current = draw

        // Fit to bounds if available
        if (currentBounds) {
          map.fitBounds(currentBounds, {
            padding: 50,
            maxZoom: 16
          })
        }
      })
      
      map.on('error', (e) => {
        logger.error('Map error:', e)
        setMapError('Failed to load map')
      })
      
      // ============================================
      // PHASE 1 FIX: Click handler uses refs
      // Instead of capturing stale state values at mount time,
      // we now read from refs which always have current values
      // ============================================
      map.on('click', (e) => {
        // Read current values from refs (not stale closure values)
        const currentIsDrawing = isDrawingRef.current
        const currentDrawingMode = drawingModeRef.current
        const currentCompleteDrawing = completeDrawingRef.current
        const currentAddDrawingPoint = addDrawingPointRef.current
        const currentEditMode = editModeRef.current
        const currentSetSelectedElement = setSelectedElementRef.current

        // Handle drawing mode clicks
        if (currentIsDrawing && currentDrawingMode.id !== 'none') {
          const lngLat = e.lngLat

          if (currentDrawingMode.type === 'marker') {
            // For markers, complete immediately on click
            if (currentCompleteDrawing) {
              currentCompleteDrawing(lngLat)
            }
          } else {
            // For polygons/lines, add point
            if (currentAddDrawingPoint) {
              currentAddDrawingPoint(lngLat)
            }
          }
          return // Don't process selection when drawing
        }

        // Handle polygon/line selection in edit mode (when not drawing)
        if (currentEditMode && !currentIsDrawing) {
          // Check for polygon/line clicks using queryRenderedFeatures
          const polygonLineLayerIds = [
            'polygons-fill', 'polygons-outline',
            'hatched-polygons-fill', 'hatched-polygons-outline',
            'lines'
          ]

          // Get only layers that exist
          const existingLayers = polygonLineLayerIds.filter(id => map.getLayer(id))

          if (existingLayers.length > 0) {
            const features = map.queryRenderedFeatures(e.point, {
              layers: existingLayers
            })

            if (features.length > 0) {
              const feature = features[0]
              const elementId = feature.properties?.id

              if (elementId) {
                // Find the element in our data refs
                let element = polygonsDataRef.current.find(p => p.id === elementId)
                if (!element) {
                  element = linesDataRef.current.find(l => l.id === elementId)
                }

                if (element && element.isActive) {
                  currentSetSelectedElement?.(element)
                  e.preventDefault?.()
                }
              }
            }
          }
        }
      })
      
      // ============================================
      // PHASE 1 FIX: Double-click handler uses refs
      // ============================================
      map.on('dblclick', (e) => {
        const currentIsDrawing = isDrawingRef.current
        const currentDrawingMode = drawingModeRef.current
        const currentCompleteDrawing = completeDrawingRef.current
        
        if (currentIsDrawing && (currentDrawingMode.type === 'polygon' || currentDrawingMode.type === 'line')) {
          e.preventDefault()
          if (currentCompleteDrawing) {
            currentCompleteDrawing()
          }
        }
      })
      
      return () => {
        map.remove()
        mapRef.current = null
      }
    } catch (err) {
      logger.error('Failed to initialize map:', err)
      setMapError('Failed to initialize map')
    }
  }, []) // Only run once on mount

  // ============================================
  // UPDATE BASEMAP
  // When basemap changes, setStyle removes all custom layers.
  // We listen for style.load and increment styleVersion to
  // force the layer rendering effects to re-run.
  // ============================================

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    const map = mapRef.current
    const newStyle = MAP_BASEMAPS[basemap]?.style
    if (!newStyle) return

    // Skip setStyle on initial load - the style is already set in the Map constructor
    // This prevents a race condition where setStyle removes layers before they're rendered
    if (basemap === initialBasemapRef.current && initialBasemapRef.current !== null) {
      initialBasemapRef.current = null // Clear so future changes work
      return
    }

    // Handler to re-add layers after style loads
    const handleStyleLoad = () => {
      setStyleVersion(v => v + 1)
    }

    // Listen for style.load before changing style
    map.once('style.load', handleStyleLoad)
    map.setStyle(newStyle)

    return () => {
      map.off('style.load', handleStyleLoad)
    }
  }, [basemap, mapLoaded])

  // ============================================
  // OVERLAY LAYERS MANAGEMENT
  // Add/remove overlay layers based on toggle state
  // ============================================

  const toggleOverlayLayer = useCallback((layerId) => {
    setOverlayLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }))
  }, [])

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    const map = mapRef.current

    // Handle each overlay layer type
    Object.entries(MAP_OVERLAY_LAYERS).forEach(([layerId, config]) => {
      // Skip layers that are marked as coming soon
      if (config.comingSoon || config.enabled === false) return

      const isEnabled = overlayLayers[layerId]
      const mapLayerId = `overlay-${layerId}`

      if (isEnabled) {
        // Add the layer if it doesn't exist
        if (!map.getLayer(mapLayerId)) {
          if (layerId === 'adminBoundaries') {
            try {
              if (!map.getSource('composite')) return

              // Province/state boundaries - purple dashed lines
              map.addLayer({
                id: mapLayerId,
                type: 'line',
                source: 'composite',
                'source-layer': 'admin',
                minzoom: 0,
                maxzoom: 22,
                filter: ['<=', ['get', 'admin_level'], 1], // Countries and provinces/states only
                paint: {
                  'line-color': '#7C3AED', // Purple
                  'line-width': [
                    'interpolate', ['linear'], ['zoom'],
                    2, 1.5,
                    6, 2,
                    10, 2.5
                  ],
                  'line-opacity': 0.8,
                  'line-dasharray': [3, 2]
                }
              })
            } catch (err) {
              console.warn('Could not add admin boundaries layer:', err.message)
            }
          }

          if (layerId === 'municipalBoundaries' && config.tilesetId) {
            try {
              const sourceId = `municipal-boundaries-source`
              if (!map.getSource(sourceId)) {
                map.addSource(sourceId, {
                  type: 'vector',
                  url: `mapbox://${config.tilesetId}`
                })
              }

              // Municipal boundaries - teal color
              map.addLayer({
                id: mapLayerId,
                type: 'line',
                source: sourceId,
                'source-layer': config.sourceLayer,
                minzoom: 6,
                maxzoom: 22,
                paint: {
                  'line-color': '#0D9488', // Teal-600
                  'line-width': [
                    'interpolate', ['linear'], ['zoom'],
                    6, 0.5,
                    10, 1,
                    14, 1.5
                  ],
                  'line-opacity': [
                    'interpolate', ['linear'], ['zoom'],
                    6, 0.4,
                    10, 0.7,
                    14, 0.9
                  ],
                  'line-dasharray': [2, 1]
                }
              })
            } catch (err) {
              console.warn('Could not add municipal boundaries layer:', err.message)
            }
          }

          if (layerId === 'airspace' && config.tilesetId) {
            try {
              const sourceId = 'airspace-source'
              if (!map.getSource(sourceId)) {
                map.addSource(sourceId, {
                  type: 'vector',
                  url: `mapbox://${config.tilesetId}`
                })
              }

              // Build filter for enabled classes (icaoClass is numeric: 0=A, 1=B, etc.)
              const enabledClasses = Object.entries(airspaceClasses)
                .filter(([_, enabled]) => enabled)
                .map(([cls]) => parseInt(cls, 10))

              const classFilter = enabledClasses.length > 0
                ? ['in', ['get', 'icaoClass'], ['literal', enabledClasses]]
                : null // Will use visibility instead

              // Check if layers already exist - if so, just update the filter/visibility
              if (map.getLayer(`${mapLayerId}-fill`)) {
                if (enabledClasses.length === 0) {
                  map.setLayoutProperty(`${mapLayerId}-fill`, 'visibility', 'none')
                  map.setLayoutProperty(mapLayerId, 'visibility', 'none')
                } else {
                  map.setLayoutProperty(`${mapLayerId}-fill`, 'visibility', 'visible')
                  map.setLayoutProperty(mapLayerId, 'visibility', 'visible')
                  map.setFilter(`${mapLayerId}-fill`, classFilter)
                  map.setFilter(mapLayerId, classFilter)
                }
              } else {
                // Airspace zones - fill with colored overlay based on icaoClass
                const layerVisibility = enabledClasses.length > 0 ? 'visible' : 'none'

                map.addLayer({
                  id: `${mapLayerId}-fill`,
                  type: 'fill',
                  source: sourceId,
                  'source-layer': config.sourceLayer,
                  ...(classFilter && { filter: classFilter }),
                  layout: {
                    'visibility': layerVisibility
                  },
                  paint: {
                    'fill-color': [
                      'match',
                      ['get', 'icaoClass'],
                      0, '#DC2626', // Class A - Red
                      1, '#EA580C', // Class B - Orange
                      2, '#CA8A04', // Class C - Yellow
                      3, '#2563EB', // Class D - Blue
                      4, '#7C3AED', // Class E - Purple
                      5, '#0D9488', // Class F - Teal
                      6, '#6B7280', // Class G - Gray
                      '#6B7280'     // Default
                    ],
                    'fill-opacity': 0.15
                  }
                })

                // Airspace outline
                map.addLayer({
                  id: mapLayerId,
                  type: 'line',
                  source: sourceId,
                  'source-layer': config.sourceLayer,
                  ...(classFilter && { filter: classFilter }),
                  layout: {
                    'visibility': layerVisibility
                  },
                  paint: {
                    'line-color': [
                      'match',
                      ['get', 'icaoClass'],
                      0, '#DC2626',
                      1, '#EA580C',
                      2, '#CA8A04',
                      3, '#2563EB',
                      4, '#7C3AED',
                      5, '#0D9488',
                      6, '#6B7280',
                      '#6B7280'
                    ],
                    'line-width': 1.5,
                    'line-opacity': 0.8
                  }
                })
              }

              // Add labels to airspace zones showing class letter and name
              map.addLayer({
                id: `${mapLayerId}-labels`,
                type: 'symbol',
                source: sourceId,
                'source-layer': config.sourceLayer,
                ...(classFilter && { filter: classFilter }),
                minzoom: 8,
                layout: {
                  'visibility': layerVisibility,
                  'text-field': [
                    'concat',
                    'Class ',
                    ['match', ['get', 'icaoClass'], 0, 'A', 1, 'B', 2, 'C', 3, 'D', 4, 'E', 5, 'F', 6, 'G', '?'],
                    '\n',
                    ['get', 'name']
                  ],
                  'text-size': [
                    'interpolate', ['linear'], ['zoom'],
                    8, 9,
                    12, 11
                  ],
                  'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
                  'text-allow-overlap': false,
                  'text-ignore-placement': false,
                  'symbol-placement': 'point',
                  'text-anchor': 'center',
                  'text-max-width': 12
                },
                paint: {
                  'text-color': [
                    'match',
                    ['get', 'icaoClass'],
                    0, '#991B1B', // Darker red
                    1, '#C2410C', // Darker orange
                    2, '#A16207', // Darker yellow
                    3, '#1D4ED8', // Darker blue
                    4, '#6D28D9', // Darker purple
                    5, '#0F766E', // Darker teal
                    6, '#4B5563', // Darker gray
                    '#4B5563'
                  ],
                  'text-halo-color': 'rgba(255, 255, 255, 0.95)',
                  'text-halo-width': 2
                }
              })

              // Add hover popup for airspace info
              const airspacePopup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'airspace-popup'
              })

              // Helper to parse altitude JSON
              const parseAltitude = (altJson) => {
                try {
                  const alt = typeof altJson === 'string' ? JSON.parse(altJson) : altJson
                  const value = alt.value || 0
                  const unit = alt.unit === 1 ? 'ft' : 'm'
                  const datum = alt.referenceDatum === 0 ? 'AGL' : 'MSL'
                  return `${value.toLocaleString()} ${unit} ${datum}`
                } catch {
                  return 'Unknown'
                }
              }

              // Helper to get class name
              const getClassName = (icaoClass) => {
                const names = { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G' }
                return names[icaoClass] || 'Unknown'
              }

              map.on('mouseenter', `${mapLayerId}-fill`, () => {
                map.getCanvas().style.cursor = 'pointer'
              })

              map.on('mousemove', `${mapLayerId}-fill`, (e) => {
                if (e.features && e.features.length > 0) {
                  const feature = e.features[0]
                  const props = feature.properties

                  const name = props.name || 'Unnamed Airspace'
                  const icaoClass = getClassName(props.icaoClass)
                  const lower = parseAltitude(props.lowerLimit)
                  const upper = parseAltitude(props.upperLimit)

                  const html = `
                    <div style="padding: 8px; min-width: 180px;">
                      <p style="font-weight: 600; margin: 0 0 6px 0; color: #1e3a5f;">${name}</p>
                      <div style="font-size: 12px; color: #4b5563;">
                        <p style="margin: 2px 0;"><strong>Class:</strong> ${icaoClass}</p>
                        <p style="margin: 2px 0;"><strong>Lower:</strong> ${lower}</p>
                        <p style="margin: 2px 0;"><strong>Upper:</strong> ${upper}</p>
                      </div>
                    </div>
                  `

                  airspacePopup
                    .setLngLat(e.lngLat)
                    .setHTML(html)
                    .addTo(map)
                }
              })

              map.on('mouseleave', `${mapLayerId}-fill`, () => {
                map.getCanvas().style.cursor = ''
                airspacePopup.remove()
              })
            } catch (err) {
              console.warn('Could not add airspace layer:', err.message)
            }
          }

          if (layerId === 'airports' && config.tilesetId) {
            try {
              const sourceId = 'airports-source'
              if (!map.getSource(sourceId)) {
                map.addSource(sourceId, {
                  type: 'vector',
                  url: `mapbox://${config.tilesetId}`
                })
              }

              // Airport markers
              map.addLayer({
                id: mapLayerId,
                type: 'circle',
                source: sourceId,
                'source-layer': config.sourceLayer,
                paint: {
                  'circle-radius': [
                    'interpolate', ['linear'], ['zoom'],
                    5, 3,
                    10, 6,
                    14, 10
                  ],
                  'circle-color': '#1E40AF', // Blue-800
                  'circle-stroke-color': '#FFFFFF',
                  'circle-stroke-width': 1.5,
                  'circle-opacity': 0.9
                }
              })

              // Airport labels at higher zoom
              map.addLayer({
                id: `${mapLayerId}-labels`,
                type: 'symbol',
                source: sourceId,
                'source-layer': config.sourceLayer,
                minzoom: 8,
                layout: {
                  'text-field': ['coalesce', ['get', 'name'], ['get', 'icao'], ''],
                  'text-size': 11,
                  'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
                  'text-offset': [0, 1.2],
                  'text-anchor': 'top',
                  'text-allow-overlap': false
                },
                paint: {
                  'text-color': '#1E40AF',
                  'text-halo-color': 'rgba(255, 255, 255, 0.9)',
                  'text-halo-width': 1.5
                }
              })
            } catch (err) {
              console.warn('Could not add airports layer:', err.message)
            }
          }
        }
      } else {
        // Remove the layer if it exists
        if (map.getLayer(mapLayerId)) {
          map.removeLayer(mapLayerId)
        }
        // Also remove associated layers (labels, fills)
        if (map.getLayer(`${mapLayerId}-labels`)) {
          map.removeLayer(`${mapLayerId}-labels`)
        }
        if (map.getLayer(`${mapLayerId}-fill`)) {
          map.removeLayer(`${mapLayerId}-fill`)
        }
      }
    })
  }, [overlayLayers, mapLoaded, styleVersion, airspaceClasses]) // Re-run when style changes or airspace classes change

  // ============================================
  // UPDATE AIRSPACE FILTER WHEN CLASSES CHANGE
  // Separate effect to ensure filter updates happen
  // ============================================

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    if (!overlayLayers.airspace) return // Only if airspace layer is enabled

    const map = mapRef.current
    const fillLayerId = 'overlay-airspace-fill'
    const lineLayerId = 'overlay-airspace'
    const labelsLayerId = 'overlay-airspace-labels'

    // Build filter for enabled classes
    const enabledClasses = Object.entries(airspaceClasses)
      .filter(([_, enabled]) => enabled)
      .map(([cls]) => parseInt(cls, 10))

    try {
      if (enabledClasses.length === 0) {
        // Hide layers when no classes selected
        if (map.getLayer(fillLayerId)) {
          map.setLayoutProperty(fillLayerId, 'visibility', 'none')
        }
        if (map.getLayer(lineLayerId)) {
          map.setLayoutProperty(lineLayerId, 'visibility', 'none')
        }
        if (map.getLayer(labelsLayerId)) {
          map.setLayoutProperty(labelsLayerId, 'visibility', 'none')
        }
      } else {
        // Show layers and apply filter
        const classFilter = ['in', ['get', 'icaoClass'], ['literal', enabledClasses]]

        if (map.getLayer(fillLayerId)) {
          map.setLayoutProperty(fillLayerId, 'visibility', 'visible')
          map.setFilter(fillLayerId, classFilter)
        }
        if (map.getLayer(lineLayerId)) {
          map.setLayoutProperty(lineLayerId, 'visibility', 'visible')
          map.setFilter(lineLayerId, classFilter)
        }
        if (map.getLayer(labelsLayerId)) {
          map.setLayoutProperty(labelsLayerId, 'visibility', 'visible')
          map.setFilter(labelsLayerId, classFilter)
        }
      }
    } catch (err) {
      console.warn('Could not update airspace filter:', err.message)
    }
  }, [airspaceClasses, mapLoaded, overlayLayers.airspace])

  // ============================================
  // FIT TO BOUNDS
  // ============================================
  
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !currentBounds) return
    
    mapRef.current.fitBounds(currentBounds, {
      padding: 50,
      maxZoom: 16,
      duration: 500
    })
  }, [currentBounds, mapLoaded])

  // ============================================
  // RENDER MARKERS
  // Separate from selection visual updates
  // ============================================

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // Helper to add markers from a layer
    const addMarkersFromLayer = (markers, layer) => {
      markers.forEach(marker => {
        if (!marker?.geometry?.coordinates) return

        const [lng, lat] = marker.geometry.coordinates
        const style = MAP_ELEMENT_STYLES[marker.elementType] || {}
        const color = marker._siteColor || style.color || '#3B82F6'
        const icon = style.icon || 'map-pin'

        const el = createMarkerElement(color, icon, marker.isActive ? 32 : 24)

        // Store marker ID on element for selection tracking
        el.dataset.markerId = marker.id

        // Add click handler
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          setSelectedElement(marker)
          onElementSelect?.(marker)
        })

        // Add popup with edit hint
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false
        }).setHTML(`
          <div class="text-sm">
            <p class="font-medium">${marker.properties?.label || style.label || 'Marker'}</p>
            ${marker.siteName ? `<p class="text-gray-500 text-xs">${marker.siteName}</p>` : ''}
            ${marker.properties?.description ? `<p class="text-gray-600 text-xs mt-1">${marker.properties.description}</p>` : ''}
            ${editMode && marker.isActive ? '<p class="text-blue-500 text-xs mt-1 font-medium">Drag to move • Click to select</p>' : ''}
          </div>
        `)

        // Create marker - draggable only in edit mode for active site markers
        const isDraggable = editMode && marker.isActive
        const mapMarker = new mapboxgl.Marker({
          element: el,
          draggable: isDraggable,
          anchor: 'center'
        })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(mapRef.current)

        // Handle drag end - update marker position
        if (isDraggable) {
          mapMarker.on('dragend', () => {
            const newLngLat = mapMarker.getLngLat()
            // Update the element with new coordinates
            updateElement?.(marker.id, marker.elementType, {
              geometry: {
                type: 'Point',
                coordinates: [newLngLat.lng, newLngLat.lat]
              }
            })
            // Auto-update address if this is a site location marker
            if (marker.elementType === 'siteLocation' && mapData.autoPopulateAddress) {
              mapData.autoPopulateAddress(newLngLat.lat, newLngLat.lng)
            }
          })
        }

        markersRef.current[marker.id] = mapMarker
      })
    }

    // Add all visible markers
    addMarkersFromLayer(visibleMapElements.siteSurvey.markers, 'siteSurvey')
    addMarkersFromLayer(visibleMapElements.flightPlan.markers, 'flightPlan')
    addMarkersFromLayer(visibleMapElements.emergency.markers, 'emergency')

  }, [visibleMapElements, mapLoaded, setSelectedElement, onElementSelect, editMode, updateElement])

  // ============================================
  // UPDATE MARKER SELECTION VISUAL
  // Separate effect to avoid recreating all markers on selection change
  // ============================================

  useEffect(() => {
    // Update selection visual on all markers
    Object.entries(markersRef.current).forEach(([markerId, mapMarker]) => {
      const el = mapMarker.getElement()
      if (el) {
        updateMarkerSelection(el, selectedElement?.id === markerId)
      }
    })
  }, [selectedElement])

  // ============================================
  // RENDER POLYGONS AND LINES
  // ============================================
  
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    const map = mapRef.current

    // Safety check: ensure map is still valid (not destroyed)
    if (!map.getStyle) return

    // Remove existing layers and sources
    const layerIds = [
      'polygons-fill', 'polygons-outline', 'lines',
      'hatched-polygons-fill', 'hatched-polygons-outline', 'hatched-polygons-inner'
    ]
    try {
      layerIds.forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id)
      })
      const sourceIds = ['polygons-source', 'lines-source', 'hatched-polygons-source']
      sourceIds.forEach(id => {
        if (map.getSource(id)) map.removeSource(id)
      })
    } catch (e) {
      // Map might be in an invalid state during unmount
      return
    }
    
    // Separate solid polygons from hatched polygons (flight geography)
    const allPolygons = [
      ...visibleMapElements.siteSurvey.polygons,
      ...visibleMapElements.flightPlan.polygons
    ].filter(p => p?.geometry?.coordinates?.[0]?.length > 0)

    // Flight geography uses hatched/lined style, others use solid fill
    const solidPolygons = allPolygons.filter(p => p.elementType !== 'flightGeography')
    const hatchedPolygons = allPolygons.filter(p => p.elementType === 'flightGeography')

    // Collect all lines
    const lines = [
      ...(visibleMapElements.emergency.lines || [])
    ].filter(l => l?.geometry?.coordinates?.length > 0)

    // Add SOLID polygons source and layers (boundaries, etc.)
    if (solidPolygons.length > 0) {
      const polygonFeatures = solidPolygons.map(polygon => {
        const style = MAP_ELEMENT_STYLES[polygon.elementType] || {}
        const color = polygon._siteColor || style.color || '#3B82F6'

        return {
          type: 'Feature',
          properties: {
            id: polygon.id,
            color: color,
            fillOpacity: style.fillOpacity || 0.1,
            strokeWidth: style.strokeWidth || 2,
            isActive: polygon.isActive
          },
          geometry: polygon.geometry
        }
      })

      map.addSource('polygons-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: polygonFeatures
        }
      })

      // Fill layer
      map.addLayer({
        id: 'polygons-fill',
        type: 'fill',
        source: 'polygons-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['get', 'fillOpacity']
        }
      })

      // Outline layer
      map.addLayer({
        id: 'polygons-outline',
        type: 'line',
        source: 'polygons-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'strokeWidth'],
          'line-opacity': ['case', ['get', 'isActive'], 1, 0.6]
        }
      })
    }

    // Add HATCHED polygons (flight geography) - lined/graphed style
    if (hatchedPolygons.length > 0) {
      const hatchedFeatures = hatchedPolygons.map(polygon => {
        const style = MAP_ELEMENT_STYLES[polygon.elementType] || {}
        const color = polygon._siteColor || style.color || '#10B981' // Green for flight area

        return {
          type: 'Feature',
          properties: {
            id: polygon.id,
            color: color,
            isActive: polygon.isActive
          },
          geometry: polygon.geometry
        }
      })

      map.addSource('hatched-polygons-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: hatchedFeatures
        }
      })

      // Very light fill for hatched polygons
      map.addLayer({
        id: 'hatched-polygons-fill',
        type: 'fill',
        source: 'hatched-polygons-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.05
        }
      })

      // Primary dashed outline
      map.addLayer({
        id: 'hatched-polygons-outline',
        type: 'line',
        source: 'hatched-polygons-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-opacity': ['case', ['get', 'isActive'], 1, 0.7],
          'line-dasharray': [4, 3]
        }
      })

      // Inner offset line for "graphed" appearance
      map.addLayer({
        id: 'hatched-polygons-inner',
        type: 'line',
        source: 'hatched-polygons-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 1,
          'line-opacity': ['case', ['get', 'isActive'], 0.5, 0.3],
          'line-dasharray': [2, 4],
          'line-offset': -8
        }
      })
    }
    
    // Add lines source and layer
    if (lines.length > 0) {
      const lineFeatures = lines.map(line => {
        const style = MAP_ELEMENT_STYLES[line.elementType] || {}
        const color = line._siteColor || style.color || '#EF4444'
        
        return {
          type: 'Feature',
          properties: {
            id: line.id,
            color: color,
            strokeWidth: style.strokeWidth || 3,
            isActive: line.isActive
          },
          geometry: line.geometry
        }
      })
      
      map.addSource('lines-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: lineFeatures
        }
      })
      
      map.addLayer({
        id: 'lines',
        type: 'line',
        source: 'lines-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'strokeWidth'],
          'line-opacity': ['case', ['get', 'isActive'], 1, 0.6]
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        }
      })
    }

    // Store polygon/line data for click lookups (used by main map click handler)
    polygonsDataRef.current = [...solidPolygons, ...hatchedPolygons]
    linesDataRef.current = lines

    // Add cursor change on hover for polygons/lines (click handled in main map click handler)
    const interactiveLayers = ['polygons-fill', 'hatched-polygons-fill', 'lines']

    const handleMouseEnter = () => {
      if (editModeRef.current && !isDrawingRef.current) {
        map.getCanvas().style.cursor = 'pointer'
      }
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = isDrawingRef.current ? 'crosshair' : 'grab'
    }

    interactiveLayers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.on('mouseenter', layerId, handleMouseEnter)
        map.on('mouseleave', layerId, handleMouseLeave)
      }
    })

    // Cleanup hover handlers
    return () => {
      // Safety check: map might be destroyed when switching tabs
      if (!map || !map.getStyle) return
      try {
        interactiveLayers.forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.off('mouseenter', layerId, handleMouseEnter)
            map.off('mouseleave', layerId, handleMouseLeave)
          }
        })
      } catch (e) {
        // Map was likely destroyed, ignore cleanup errors
      }
    }

  }, [visibleMapElements, mapLoaded, styleVersion]) // styleVersion forces re-render after basemap change

  // ============================================
  // RENDER DRAWING PREVIEW
  // ============================================
  
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    const map = mapRef.current

    // Safety check: ensure map is still valid (not destroyed)
    if (!map.getStyle) return

    const sourceId = 'drawing-preview'
    const layerId = 'drawing-preview-line'
    const pointsLayerId = 'drawing-preview-points'

    // Remove existing preview
    try {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getLayer(pointsLayerId)) map.removeLayer(pointsLayerId)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    } catch (e) {
      // Map might be in an invalid state during unmount
      return
    }

    if (!isDrawing || drawingPoints.length === 0) return
    
    const style = MAP_ELEMENT_STYLES[drawingMode.id] || {}
    const color = style.color || '#3B82F6'
    
    // Create preview geometry
    const features = []
    
    // Add line/polygon preview
    if (drawingPoints.length >= 2) {
      const coords = [...drawingPoints]
      if (drawingMode.type === 'polygon' && drawingPoints.length >= 3) {
        coords.push(drawingPoints[0]) // Close polygon
      }
      
      features.push({
        type: 'Feature',
        properties: { type: 'line' },
        geometry: {
          type: 'LineString',
          coordinates: coords
        }
      })
    }
    
    // Add point markers
    drawingPoints.forEach((point, index) => {
      features.push({
        type: 'Feature',
        properties: { type: 'point', index },
        geometry: {
          type: 'Point',
          coordinates: point
        }
      })
    })
    
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    })
    
    // Line layer
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      filter: ['==', ['get', 'type'], 'line'],
      paint: {
        'line-color': color,
        'line-width': 2,
        'line-dasharray': [2, 2]
      }
    })
    
    // Points layer
    map.addLayer({
      id: pointsLayerId,
      type: 'circle',
      source: sourceId,
      filter: ['==', ['get', 'type'], 'point'],
      paint: {
        'circle-radius': 6,
        'circle-color': '#FFFFFF',
        'circle-stroke-color': color,
        'circle-stroke-width': 2
      }
    })
    
  }, [isDrawing, drawingPoints, drawingMode, mapLoaded, styleVersion])

  // ============================================
  // CURSOR STYLE
  // ============================================
  
  useEffect(() => {
    if (!mapRef.current) return
    
    const cursor = isDrawing ? 'crosshair' : 'grab'
    mapRef.current.getCanvas().style.cursor = cursor
  }, [isDrawing])

  // ============================================
  // ONLINE/OFFLINE STATUS
  // ============================================
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleSiteSelect = useCallback((siteId) => {
    selectSite(siteId)
    onSiteChange?.(siteId)
  }, [selectSite, onSiteChange])
  
  const handleAddSite = useCallback(() => {
    // This will be handled by parent component
    // No-op: parent component should handle site addition
  }, [])
  
  const handleDuplicateSite = useCallback((siteId) => {
    // No-op: parent component should handle site duplication
  }, [])
  
  const handleDeleteSite = useCallback((siteId) => {
    if (confirm('Are you sure you want to delete this site?')) {
      // No-op: parent component should handle site deletion
    }
  }, [])
  
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn()
    }
  }, [])
  
  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut()
    }
  }, [])
  
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])
  
  // Resize map when fullscreen changes
  useEffect(() => {
    if (mapRef.current) {
      // Small delay to let the DOM update
      setTimeout(() => {
        mapRef.current?.resize()
      }, 50)
    }
  }, [isFullscreen])
  
  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // ============================================
  // RENDER
  // ============================================
  
  // Error state
  if (mapError) {
    return (
      <div 
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-2">Map Error</p>
          <p className="text-gray-500 text-sm">{mapError}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className={`relative bg-gray-100 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-[9999]' : 'rounded-lg'} ${className}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0" />
      
      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-aeria-navy animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Offline indicator */}
      {isOffline && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          Offline Mode
        </div>
      )}
      
      {/* Controls */}
      {showControls && mapLoaded && (
        <MapControlsPanel
          sites={sites}
          activeSiteId={activeSiteId}
          onSelectSite={handleSiteSelect}
          onAddSite={handleAddSite}
          onDuplicateSite={handleDuplicateSite}
          onDeleteSite={handleDeleteSite}
          visibleLayers={visibleLayers}
          onToggleLayer={toggleLayer}
          allowedLayers={allowedLayers}
          drawingMode={drawingMode}
          isDrawing={isDrawing}
          drawingPoints={drawingPoints}
          onStartDrawing={startDrawing}
          onCancelDrawing={cancelDrawing}
          onCompleteDrawing={completeDrawing}
          onRemoveLastPoint={removeLastDrawingPoint}
          activeLayer={activeLayer}
          currentBasemap={basemap}
          onChangeBasemap={setBasemap}
          onFitToSite={fitToActiveSite}
          onFitToAll={fitToAllSites}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          showAllSites={showAllSites}
          editMode={editMode}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Fullscreen button - shown even when controls are hidden */}
      {/* Positioned bottom-right near map nav controls for visibility */}
      {!showControls && mapLoaded && (
        <div className="absolute bottom-20 right-4 z-30">
          <FullscreenButton
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>
      )}

      {/* Overlay Layers Toggle Button */}
      {mapLoaded && (
        <div className="absolute top-4 left-4 z-20">
          <div className="relative">
            <button
              onClick={() => setShowOverlayPanel(!showOverlayPanel)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-md transition-colors ${
                showOverlayPanel || Object.values(overlayLayers).some(Boolean)
                  ? 'bg-aeria-navy text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Toggle overlay layers"
            >
              <Layers className="w-4 h-4" />
              <span className="text-sm font-medium">Layers</span>
              {Object.values(overlayLayers).filter(Boolean).length > 0 && (
                <span className="bg-white text-aeria-navy text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {Object.values(overlayLayers).filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Overlay Layers Panel */}
            {showOverlayPanel && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900">Reference Layers</h4>
                  <p className="text-xs text-gray-500">Toggle additional map data</p>
                </div>
                <div className="p-2 space-y-1">
                  {Object.entries(MAP_OVERLAY_LAYERS).map(([layerId, config]) => (
                    <div key={layerId}>
                      <button
                        onClick={() => !config.comingSoon && toggleOverlayLayer(layerId)}
                        disabled={config.comingSoon}
                        className={`w-full flex items-start gap-3 p-2 rounded-lg transition-colors text-left ${
                          config.comingSoon
                            ? 'bg-gray-50 cursor-not-allowed opacity-60'
                            : overlayLayers[layerId]
                              ? 'bg-aeria-navy/10 border border-aeria-navy/30'
                              : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center ${
                          overlayLayers[layerId] && !config.comingSoon
                            ? 'bg-aeria-navy border-aeria-navy'
                            : 'border-gray-300'
                        }`}>
                          {overlayLayers[layerId] && !config.comingSoon && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {config.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {config.description}
                          </p>
                        </div>
                        {/* Expand button for layers with sub-layers */}
                        {config.hasSubLayers && overlayLayers[layerId] && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowAirspacePanel(!showAirspacePanel)
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <svg className={`w-4 h-4 text-gray-500 transition-transform ${showAirspacePanel ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </button>

                      {/* Sub-layer panel for airspace classes */}
                      {layerId === 'airspace' && config.hasSubLayers && overlayLayers[layerId] && showAirspacePanel && (
                        <div className="ml-6 mt-1 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">Filter by class:</p>
                          <div className="grid grid-cols-2 gap-1">
                            {Object.entries(config.subLayers).map(([classId, classConfig]) => (
                              <button
                                key={classId}
                                onClick={() => setAirspaceClasses(prev => ({ ...prev, [classId]: !prev[classId] }))}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${
                                  airspaceClasses[classId]
                                    ? 'bg-white border border-gray-300 shadow-sm'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                              >
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: airspaceClasses[classId] ? classConfig.color : '#D1D5DB' }}
                                />
                                <span className="font-medium">{classConfig.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => setAirspaceClasses({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true })}
                              className="flex-1 text-xs text-aeria-navy hover:underline"
                            >
                              Select All
                            </button>
                            <button
                              onClick={() => setAirspaceClasses({ 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false })}
                              className="flex-1 text-xs text-gray-500 hover:underline"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Legend */}
      {showLegend && mapLoaded && (
        <div className="absolute bottom-4 left-4 z-10">
          <MapLegend 
            visibleLayers={visibleLayers}
            compact
            position="bottom-left"
          />
        </div>
      )}
      
      {/* Site colors legend (when showing all sites) */}
      {showAllSites && sites.length > 1 && mapLoaded && (
        <div className="absolute top-4 right-4 z-10">
          <SiteColorLegend sites={sites} activeSiteId={activeSiteId} />
        </div>
      )}

      {/* Selection action panel - shows when element is selected in edit mode */}
      {editMode && selectedElement && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[200px] max-w-[320px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {selectedElement.properties?.label || MAP_ELEMENT_STYLES[selectedElement.elementType]?.label || 'Selected Element'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {selectedElement.elementType}
                {selectedElement.geometry?.type === 'Polygon' && ' (boundary)'}
                {selectedElement.geometry?.type === 'LineString' && ' (route)'}
              </p>
              {/* Point coordinates */}
              {selectedElement.geometry?.coordinates && selectedElement.geometry.type === 'Point' && (
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  {selectedElement.geometry.coordinates[1]?.toFixed(6)}, {selectedElement.geometry.coordinates[0]?.toFixed(6)}
                </p>
              )}
              {/* Polygon info */}
              {selectedElement.geometry?.type === 'Polygon' && (
                <p className="text-xs text-gray-400 mt-1">
                  {selectedElement.geometry.coordinates?.[0]?.length - 1 || 0} vertices
                  {selectedElement.properties?.area && ` • ${(selectedElement.properties.area / 10000).toFixed(2)} ha`}
                </p>
              )}
              {/* Line info */}
              {selectedElement.geometry?.type === 'LineString' && (
                <p className="text-xs text-gray-400 mt-1">
                  {selectedElement.geometry.coordinates?.length || 0} points
                  {selectedElement.properties?.distance && ` • ${selectedElement.properties.distance.toFixed(0)}m`}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                removeElement?.(selectedElement.id, selectedElement.elementType)
                setSelectedElement(null)
              }}
              className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete element (Del)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>

          {/* Edit Vertices button for polygons/lines */}
          {(selectedElement.geometry?.type === 'Polygon' || selectedElement.geometry?.type === 'LineString') && !isEditingVertices && (
            <button
              onClick={startVertexEditing}
              className="mt-2 w-full py-1.5 px-3 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                <path d="m15 5 4 4"/>
              </svg>
              Edit Vertices
            </button>
          )}

          {/* Editing mode controls */}
          {isEditingVertices && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={saveVertexEdits}
                className="flex-1 py-1.5 px-3 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Done
              </button>
              <button
                onClick={cancelVertexEdits}
                className="flex-1 py-1.5 px-3 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Re-draw option for polygons/boundaries */}
          {selectedElement.geometry?.type === 'Polygon' && startDrawing && !isEditingVertices && (
            <button
              onClick={() => {
                const elementType = selectedElement.elementType
                removeElement?.(selectedElement.id, elementType)
                setSelectedElement(null)
                // Start drawing the same type again
                startDrawing(elementType)
              }}
              className="mt-2 w-full py-1.5 px-3 text-xs font-medium text-aeria-navy bg-aeria-navy/10 hover:bg-aeria-navy/20 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 21h5v-5"/>
              </svg>
              Clear & Re-draw Boundary
            </button>
          )}

          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            {isEditingVertices ? (
              <>
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Drag</span>
                <span>vertices to move</span>
                <span className="mx-1">|</span>
                <span>Click midpoints to add</span>
              </>
            ) : (
              <>
                {/* Only show drag hint for Point geometry (markers) */}
                {selectedElement.geometry?.type === 'Point' && (
                  <>
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Drag</span>
                    <span>to move</span>
                    <span className="mx-1">|</span>
                  </>
                )}
                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Del</span>
                <span>to delete</span>
                {selectedElement.geometry?.type !== 'Point' && (
                  <>
                    <span className="mx-1">|</span>
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Esc</span>
                    <span>to deselect</span>
                  </>
                )}
              </>
            )}
          </div>
          <button
            onClick={() => setSelectedElement(null)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drawing mode indicator */}
      {isDrawing && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-aeria-navy text-white rounded-lg shadow-lg text-sm">
          <p className="font-medium">{drawingMode.label}</p>
          {drawingMode.type === 'marker' && (
            <p className="text-white/80 text-xs">Click on map to place</p>
          )}
          {drawingMode.type === 'polygon' && (
            <p className="text-white/80 text-xs">Click to add points, double-click to finish</p>
          )}
          {drawingMode.type === 'line' && (
            <p className="text-white/80 text-xs">Click to add points, double-click to finish</p>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// COMPACT MAP VARIANT
// ============================================

export function CompactProjectMap({
  project,
  siteId,
  layer = 'siteSurvey',
  height = '300px',
  className = ''
}) {
  return (
    <UnifiedProjectMap
      project={project}
      editMode={false}
      activeLayer={layer}
      height={height}
      showControls={false}
      showLegend={false}
      allowedLayers={[layer]}
      className={className}
    />
  )
}

// ============================================
// MAP THUMBNAIL
// ============================================

export function MapThumbnail({
  site,
  size = 100,
  className = ''
}) {
  const bounds = getSiteBounds(site)
  
  if (!bounds) {
    return (
      <div 
        className={`bg-gray-100 rounded flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <MapPin className="w-6 h-6 text-gray-400" />
      </div>
    )
  }
  
  // Static map URL
  const center = [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2
  ]
  
  const staticUrl = MAPBOX_TOKEN 
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${center[0]},${center[1]},12/${size}x${size}?access_token=${MAPBOX_TOKEN}`
    : null
  
  if (!staticUrl) {
    return (
      <div 
        className={`bg-gray-100 rounded flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <MapPin className="w-6 h-6 text-gray-400" />
      </div>
    )
  }
  
  return (
    <img 
      src={staticUrl}
      alt={site.name}
      className={`rounded object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

export default UnifiedProjectMap
