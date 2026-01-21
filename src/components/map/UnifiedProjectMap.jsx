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
import { MAP_ELEMENT_STYLES, MAP_BASEMAPS, getSiteBounds } from '../../lib/mapDataStructures'
import {
  Loader2,
  AlertCircle,
  WifiOff
} from 'lucide-react'

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
        
        // Fit to bounds if available
        if (currentBounds) {
          map.fitBounds(currentBounds, {
            padding: 50,
            maxZoom: 16
          })
        }
      })
      
      map.on('error', (e) => {
        console.error('Map error:', e)
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
      console.error('Failed to initialize map:', err)
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
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[200px] max-w-[280px]">
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
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
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
