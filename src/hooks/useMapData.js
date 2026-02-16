/**
 * useMapData.js
 * Custom hook for managing map state across the unified project map system
 * 
 * Provides centralized state management for:
 * - Active site selection
 * - Layer visibility toggles
 * - Drawing mode state
 * - Map element CRUD operations
 * 
 * BATCH 6 FINAL:
 * - Fixed obstacle/obstacles naming mismatch
 * 
 * @location src/hooks/useMapData.js
 * @action REPLACE
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { logger } from '../lib/logger'
import {
  MAP_LAYERS,
  MAP_ELEMENT_STYLES,
  MAP_BASEMAPS,
  createMapMarker,
  createMapPolygon,
  createMapLine,
  createObstacle,
  createMusterPoint,
  createEvacuationRoute,
  getSiteBounds,
  getProjectBounds,
  calculateDistance,
  calculatePolygonArea,
  validateSiteCompleteness,
  getSiteStats
} from '../lib/mapDataStructures'
import { reverseGeocode } from '../components/map/SiteSurveyMapTools'

// ============================================
// OBSTACLE TYPES MAP (for label display)
// ============================================

const OBSTACLE_TYPES_MAP = {
  tower: 'Tower/Antenna',
  wire: 'Power Lines',
  building: 'Building',
  tree: 'Trees',
  terrain: 'Terrain',
  crane: 'Crane',
  water: 'Water Tower',
  other: 'Obstacle'
}

// ============================================
// DRAWING MODES
// ============================================

export const DRAWING_MODES = {
  none: { id: 'none', label: 'View Only', cursor: 'default' },
  
  // Site Survey drawing modes
  siteLocation: { 
    id: 'siteLocation', 
    label: 'Set Site Location', 
    cursor: 'crosshair',
    type: 'marker',
    layer: 'siteSurvey',
    single: true // Only one allowed
  },
  operationsBoundary: { 
    id: 'operationsBoundary', 
    label: 'Draw Operations Boundary', 
    cursor: 'crosshair',
    type: 'polygon',
    layer: 'siteSurvey',
    single: true
  },
  obstacle: { 
    id: 'obstacle', 
    label: 'Add Obstacle', 
    cursor: 'crosshair',
    type: 'marker',
    layer: 'siteSurvey',
    single: false // Multiple allowed
  },
  
  // Flight Plan drawing modes
  launchPoint: { 
    id: 'launchPoint', 
    label: 'Set Launch Point', 
    cursor: 'crosshair',
    type: 'marker',
    layer: 'flightPlan',
    single: true
  },
  recoveryPoint: { 
    id: 'recoveryPoint', 
    label: 'Set Recovery Point', 
    cursor: 'crosshair',
    type: 'marker',
    layer: 'flightPlan',
    single: true
  },
  pilotPosition: { 
    id: 'pilotPosition', 
    label: 'Set Pilot Position', 
    cursor: 'crosshair',
    type: 'marker',
    layer: 'flightPlan',
    single: true
  },
  flightGeography: {
    id: 'flightGeography',
    label: 'Draw Flight Area',
    cursor: 'crosshair',
    type: 'polygon',
    layer: 'flightPlan',
    single: true
  },

  // Emergency drawing modes
  musterPoint: {
    id: 'musterPoint',
    label: 'Add Muster Point',
    cursor: 'crosshair',
    type: 'marker',
    layer: 'emergency',
    single: false
  },
  evacuationRoute: {
    id: 'evacuationRoute',
    label: 'Draw Evacuation Route',
    cursor: 'crosshair',
    type: 'line',
    layer: 'emergency',
    single: false
  },

  // Measurement tool (read-only, doesn't save to project)
  measureDistance: {
    id: 'measureDistance',
    label: 'Measure Distance',
    cursor: 'crosshair',
    type: 'measurement',
    layer: null, // Not tied to a specific layer
    single: false,
    readOnly: true // Doesn't save to project data
  }
}

// ============================================
// MAIN HOOK
// ============================================

/**
 * useMapData hook
 * 
 * @param {Object} project - The project object containing sites array
 * @param {Function} onUpdate - Callback to update project data
 * @param {Object} options - Configuration options
 * @returns {Object} Map state and control functions
 */
export function useMapData(project, onUpdate, options = {}) {
  const {
    initialSiteId = null,
    editMode = false,
    allowedLayers = ['siteSurvey', 'flightPlan', 'emergency'],
    initialBasemap = 'streets'
  } = options

  // ============================================
  // STATE
  // ============================================
  
  // Active site
  const [activeSiteId, setActiveSiteId] = useState(
    initialSiteId || project?.activeSiteId || project?.sites?.[0]?.id || null
  )
  
  // Layer visibility
  const [visibleLayers, setVisibleLayers] = useState({
    siteSurvey: true,
    flightPlan: true,
    emergency: true
  })
  
  // Drawing mode
  const [drawingMode, setDrawingMode] = useState(DRAWING_MODES.none)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingPoints, setDrawingPoints] = useState([])
  
  // Selected element (for editing)
  const [selectedElement, setSelectedElement] = useState(null)
  
  // Basemap
  const [basemap, setBasemap] = useState(initialBasemap)
  
  // Map view state
  const [mapCenter, setMapCenter] = useState(null)
  const [mapZoom, setMapZoom] = useState(12)
  
  // UI state
  const [showAllSites, setShowAllSites] = useState(false)

  // Pending obstacle state - for label prompt workflow
  const [pendingObstacle, setPendingObstacle] = useState(null)

  // ============================================
  // REF FOR LATEST PROJECT DATA
  // Following Mapbox React best practice: use refs for data that
  // needs to be accessed in callbacks without stale closure issues.
  // This ref ALWAYS holds the current project, even if the callback
  // was created before the latest render.
  // ============================================
  const projectRef = useRef(project)

  // Keep projectRef in sync with latest project prop
  useEffect(() => {
    projectRef.current = project
  }, [project])

  // ============================================
  // SYNC activeSiteId with project.activeSiteId
  // This ensures the hook's internal state stays in sync when
  // the user selects a different site via the sidebar
  // ============================================
  useEffect(() => {
    if (project?.activeSiteId && project.activeSiteId !== activeSiteId) {
      setActiveSiteId(project.activeSiteId)
    }
  }, [project?.activeSiteId])

  // ============================================
  // DERIVED STATE
  // ============================================
  
  // Get sites array with defensive check
  const sites = useMemo(() => {
    return Array.isArray(project?.sites) ? project.sites : []
  }, [project?.sites])
  
  // Get active site
  const activeSite = useMemo(() => {
    if (!activeSiteId || sites.length === 0) return null
    return sites.find(s => s.id === activeSiteId) || sites[0]
  }, [sites, activeSiteId])
  
  // Get active site's map data
  const activeMapData = useMemo(() => {
    return activeSite?.mapData || null
  }, [activeSite])
  
  // Compute bounds for active site
  const activeSiteBounds = useMemo(() => {
    if (!activeSite) return null
    return getSiteBounds(activeSite)
  }, [activeSite])
  
  // Compute bounds for all sites
  const allSitesBounds = useMemo(() => {
    return getProjectBounds(sites)
  }, [sites])
  
  // Get current bounds based on view mode
  const currentBounds = useMemo(() => {
    return showAllSites ? allSitesBounds : activeSiteBounds
  }, [showAllSites, allSitesBounds, activeSiteBounds])
  
  // Site statistics
  const activeSiteStats = useMemo(() => {
    if (!activeSite) return null
    return getSiteStats(activeSite)
  }, [activeSite])
  
  // Site validation
  const activeSiteValidation = useMemo(() => {
    if (!activeSite) return null
    return validateSiteCompleteness(activeSite)
  }, [activeSite])
  
  // All map elements for rendering (respecting visibility)
  const visibleMapElements = useMemo(() => {
    const elements = {
      siteSurvey: { markers: [], polygons: [] },
      flightPlan: { markers: [], polygons: [] },
      emergency: { markers: [], lines: [] }
    }
    
    const sitesToShow = showAllSites ? sites : (activeSite ? [activeSite] : [])
    
    sitesToShow.forEach((site, siteIndex) => {
      const mapData = site?.mapData
      if (!mapData) return
      
      const isActive = site.id === activeSiteId
      const siteColor = isActive ? null : `hsl(${siteIndex * 60}, 70%, 50%)`
      
      // Site Survey elements
      if (visibleLayers.siteSurvey && mapData.siteSurvey) {
        if (mapData.siteSurvey.siteLocation) {
          elements.siteSurvey.markers.push({
            ...mapData.siteSurvey.siteLocation,
            siteId: site.id,
            siteName: site.name,
            isActive,
            _siteColor: siteColor
          })
        }
        if (mapData.siteSurvey.operationsBoundary) {
          elements.siteSurvey.polygons.push({
            ...mapData.siteSurvey.operationsBoundary,
            siteId: site.id,
            siteName: site.name,
            isActive,
            _siteColor: siteColor
          })
        }
        if (Array.isArray(mapData.siteSurvey.obstacles)) {
          mapData.siteSurvey.obstacles.forEach(obs => {
            elements.siteSurvey.markers.push({
              ...obs,
              elementType: obs.elementType || 'obstacles', // Ensure elementType is set
              siteId: site.id,
              siteName: site.name,
              isActive,
              _siteColor: siteColor
            })
          })
        }
      }
      
      // Flight Plan elements
      if (visibleLayers.flightPlan && mapData.flightPlan) {
        if (mapData.flightPlan.launchPoint) {
          elements.flightPlan.markers.push({
            ...mapData.flightPlan.launchPoint,
            siteId: site.id,
            siteName: site.name,
            isActive,
            _siteColor: siteColor
          })
        }
        if (mapData.flightPlan.recoveryPoint) {
          elements.flightPlan.markers.push({
            ...mapData.flightPlan.recoveryPoint,
            siteId: site.id,
            siteName: site.name,
            isActive,
            _siteColor: siteColor
          })
        }
        if (mapData.flightPlan.pilotPosition) {
          elements.flightPlan.markers.push({
            ...mapData.flightPlan.pilotPosition,
            siteId: site.id,
            siteName: site.name,
            isActive,
            _siteColor: siteColor
          })
        }
        if (mapData.flightPlan.flightGeography) {
          elements.flightPlan.polygons.push({
            ...mapData.flightPlan.flightGeography,
            siteId: site.id,
            siteName: site.name,
            isActive,
            _siteColor: siteColor
          })
        }
        if (mapData.flightPlan.contingencyVolume) {
          elements.flightPlan.polygons.push({
            ...mapData.flightPlan.contingencyVolume,
            siteId: site.id,
            siteName: site.name,
            isActive,
            _siteColor: siteColor
          })
        }
        if (mapData.flightPlan.groundRiskBuffer) {
          elements.flightPlan.polygons.push({
            ...mapData.flightPlan.groundRiskBuffer,
            siteId: site.id,
            siteName: site.name,
            isActive,
            _siteColor: siteColor
          })
        }
      }
      
      // Emergency elements
      if (visibleLayers.emergency && mapData.emergency) {
        if (Array.isArray(mapData.emergency.musterPoints)) {
          mapData.emergency.musterPoints.forEach(point => {
            elements.emergency.markers.push({
              ...point,
              elementType: point.elementType || 'musterPoints', // Ensure elementType is set
              siteId: site.id,
              siteName: site.name,
              isActive,
              _siteColor: siteColor
            })
          })
        }
        if (Array.isArray(mapData.emergency.evacuationRoutes)) {
          mapData.emergency.evacuationRoutes.forEach(route => {
            elements.emergency.lines.push({
              ...route,
              siteId: site.id,
              siteName: site.name,
              isActive,
              _siteColor: siteColor
            })
          })
        }
      }
    })
    
    return elements
  }, [sites, activeSite, activeSiteId, visibleLayers, showAllSites])

  // ============================================
  // SITE MANAGEMENT
  // ============================================
  
  const selectSite = useCallback((siteId) => {
    setActiveSiteId(siteId)
    setSelectedElement(null)
    setDrawingMode(DRAWING_MODES.none)
    setIsDrawing(false)
    setDrawingPoints([])
    
    // Also update project's activeSiteId
    if (onUpdate && project) {
      onUpdate({ activeSiteId: siteId })
    }
  }, [onUpdate, project])

  // ============================================
  // LAYER MANAGEMENT
  // ============================================
  
  const toggleLayer = useCallback((layerId) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }))
  }, [])
  
  const setLayerVisibility = useCallback((layerId, visible) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerId]: visible
    }))
  }, [])
  
  const showAllLayers = useCallback(() => {
    setVisibleLayers({
      siteSurvey: true,
      flightPlan: true,
      emergency: true
    })
  }, [])
  
  const hideAllLayers = useCallback(() => {
    setVisibleLayers({
      siteSurvey: false,
      flightPlan: false,
      emergency: false
    })
  }, [])

  // ============================================
  // DRAWING MODE MANAGEMENT
  // ============================================
  
  const startDrawing = useCallback((mode) => {
    if (!editMode) return
    if (!DRAWING_MODES[mode]) return
    
    setDrawingMode(DRAWING_MODES[mode])
    setIsDrawing(true)
    setDrawingPoints([])
    setSelectedElement(null)
  }, [editMode])
  
  const cancelDrawing = useCallback(() => {
    setDrawingMode(DRAWING_MODES.none)
    setIsDrawing(false)
    setDrawingPoints([])
  }, [])
  
  const addDrawingPoint = useCallback((lngLat) => {
    if (!isDrawing) return
    
    setDrawingPoints(prev => [...prev, [lngLat.lng, lngLat.lat]])
  }, [isDrawing])
  
  const removeLastDrawingPoint = useCallback(() => {
    setDrawingPoints(prev => prev.slice(0, -1))
  }, [])

  // ============================================
  // ELEMENT CRUD OPERATIONS
  // ============================================
  
  /**
   * Update the active site's map data
   *
   * CRITICAL FIX: Uses projectRef.current to ALWAYS get the latest project data.
   *
   * Problem: When user rapidly switches sites and adds markers, the `project`
   * in the callback closure may be stale (from a previous render), causing
   * data to be overwritten or saved to the wrong site.
   *
   * Solution: Following Mapbox React best practices, we use a ref that is
   * always kept in sync with the latest project. Reading from projectRef.current
   * gives us the absolute latest data, regardless of when this callback was created.
   */
  const updateSiteMapData = useCallback((updater) => {
    if (!onUpdate) return

    // CRITICAL: Read from ref, not from closure!
    // projectRef.current is ALWAYS the latest project, even if this
    // callback was created during a previous render cycle.
    const currentProject = projectRef.current
    if (!currentProject) return

    const currentSites = currentProject.sites || []
    const targetSiteId = currentProject.activeSiteId || activeSiteId

    if (!targetSiteId || currentSites.length === 0) return

    const targetSite = currentSites.find(s => s.id === targetSiteId)
    if (!targetSite) {
      logger.warn(`[useMapData] Target site ${targetSiteId} not found in sites array`)
      return
    }

    const updatedSites = currentSites.map(site => {
      if (site.id !== targetSiteId) return site

      const newMapData = typeof updater === 'function'
        ? updater(site.mapData)
        : { ...site.mapData, ...updater }

      return {
        ...site,
        mapData: newMapData,
        updatedAt: new Date().toISOString()
      }
    })

    onUpdate({ sites: updatedSites })
  }, [activeSiteId, onUpdate])
  
  /**
   * Add or update a marker element
   */
  const setMarker = useCallback((elementType, lngLat, options = {}) => {
    if (!activeSite) return null
    
    // FIX: Handle singular/plural naming mismatch
    // DRAWING_MODES uses singular but MAP_ELEMENT_STYLES uses plural
    let styleKey = elementType
    if (elementType === 'obstacle') styleKey = 'obstacles'
    if (elementType === 'musterPoint') styleKey = 'musterPoints'
    if (elementType === 'evacuationRoute') styleKey = 'evacuationRoutes'
    
    const style = MAP_ELEMENT_STYLES[styleKey]
    if (!style) {
      logger.warn(`No style found for element type: ${elementType} (tried: ${styleKey})`)
      return null
    }
    
    let marker
    
    // Create appropriate marker type
    switch (elementType) {
      case 'obstacle':
      case 'obstacles':
        marker = createObstacle(lngLat.lng, lngLat.lat, {
          ...options,
          ...style
        })
        break
      case 'musterPoints':
      case 'musterPoint':
        marker = createMusterPoint(lngLat.lng, lngLat.lat, {
          ...options,
          ...style
        })
        break
      default:
        marker = createMapMarker(lngLat.lng, lngLat.lat, {
          elementType,
          ...options,
          ...style
        })
    }
    
    // Determine where to store in mapData
    const layer = style.layer
    
    updateSiteMapData(mapData => {
      // Start with existing data or empty object
      const newMapData = mapData ? { ...mapData } : {}

      // Ensure the layer structure exists
      if (!newMapData[layer]) {
        newMapData[layer] = {}
      }

      // Handle array vs single element
      if (elementType === 'obstacles' || elementType === 'obstacle') {
        // Ensure siteSurvey exists
        if (!newMapData.siteSurvey) {
          newMapData.siteSurvey = {}
        }
        if (!Array.isArray(newMapData.siteSurvey.obstacles)) {
          newMapData.siteSurvey.obstacles = []
        }
        newMapData.siteSurvey.obstacles = [...newMapData.siteSurvey.obstacles, marker]
      } else if (elementType === 'musterPoints' || elementType === 'musterPoint') {
        // Ensure emergency structure exists
        if (!newMapData.emergency) {
          newMapData.emergency = { musterPoints: [], evacuationRoutes: [] }
        }
        if (!Array.isArray(newMapData.emergency.musterPoints)) {
          newMapData.emergency.musterPoints = []
        }
        // Set first one as primary if none exists
        if (newMapData.emergency.musterPoints.length === 0) {
          marker.isPrimary = true
        }
        newMapData.emergency.musterPoints = [...newMapData.emergency.musterPoints, marker]
      } else {
        // Single marker - replace existing
        newMapData[layer][elementType] = marker
      }

      return newMapData
    })
    
    return marker
  }, [activeSite, updateSiteMapData])
  
  /**
   * Add or update a polygon element
   */
  const setPolygon = useCallback((elementType, coordinates, options = {}) => {
    if (!activeSite) return null
    if (!coordinates || coordinates.length < 3) return null
    
    const style = MAP_ELEMENT_STYLES[elementType]
    if (!style) return null
    
    // Ensure polygon is closed
    const first = coordinates[0]
    const last = coordinates[coordinates.length - 1]
    let closedCoords = coordinates
    if (first[0] !== last[0] || first[1] !== last[1]) {
      closedCoords = [...coordinates, first]
    }
    
    const polygon = createMapPolygon(closedCoords, {
      elementType,
      area: calculatePolygonArea({ geometry: { coordinates: [closedCoords] } }),
      ...options,
      ...style
    })
    
    const layer = style.layer
    
    updateSiteMapData(mapData => {
      const newMapData = { ...mapData }
      
      if (!newMapData[layer]) {
        newMapData[layer] = {}
      }
      
      newMapData[layer][elementType] = polygon
      
      return newMapData
    })
    
    return polygon
  }, [activeSite, updateSiteMapData])
  
  /**
   * Add an evacuation route (line)
   */
  const addEvacuationRoute = useCallback((coordinates, options = {}) => {
    if (!activeSite) return null
    if (!coordinates || coordinates.length < 2) return null
    
    const route = createEvacuationRoute(coordinates, options)
    
    updateSiteMapData(mapData => {
      // Start with existing data or empty object
      const newMapData = mapData ? { ...mapData } : {}

      // Ensure emergency structure exists
      if (!newMapData.emergency) {
        newMapData.emergency = { musterPoints: [], evacuationRoutes: [] }
      }
      if (!Array.isArray(newMapData.emergency.evacuationRoutes)) {
        newMapData.emergency.evacuationRoutes = []
      }

      // Set first one as primary if none exists
      if (newMapData.emergency.evacuationRoutes.length === 0) {
        route.isPrimary = true
      }

      newMapData.emergency.evacuationRoutes = [
        ...newMapData.emergency.evacuationRoutes,
        route
      ]

      return newMapData
    })
    
    return route
  }, [activeSite, updateSiteMapData])
  
  /**
   * Remove an element by ID
   */
  const removeElement = useCallback((elementId, elementType) => {
    if (!activeSite) return

    // FIX: Handle singular/plural naming mismatch
    let styleKey = elementType
    if (elementType === 'obstacle') styleKey = 'obstacles'
    if (elementType === 'musterPoint') styleKey = 'musterPoints'
    if (elementType === 'evacuationRoute') styleKey = 'evacuationRoutes'

    const style = MAP_ELEMENT_STYLES[styleKey]
    if (!style) return
    
    updateSiteMapData(mapData => {
      const newMapData = JSON.parse(JSON.stringify(mapData))
      const layer = style.layer
      
      // Handle arrays
      if (elementType === 'obstacles' || elementType === 'obstacle') {
        if (Array.isArray(newMapData.siteSurvey?.obstacles)) {
          newMapData.siteSurvey.obstacles = newMapData.siteSurvey.obstacles.filter(
            o => o.id !== elementId
          )
        }
      } else if (elementType === 'musterPoints' || elementType === 'musterPoint') {
        if (Array.isArray(newMapData.emergency?.musterPoints)) {
          newMapData.emergency.musterPoints = newMapData.emergency.musterPoints.filter(
            p => p.id !== elementId
          )
          // Ensure at least one primary if any remain
          if (newMapData.emergency.musterPoints.length > 0 &&
              !newMapData.emergency.musterPoints.some(p => p.isPrimary)) {
            newMapData.emergency.musterPoints[0].isPrimary = true
          }
        }
      } else if (elementType === 'evacuationRoutes' || elementType === 'evacuationRoute') {
        if (Array.isArray(newMapData.emergency?.evacuationRoutes)) {
          newMapData.emergency.evacuationRoutes = newMapData.emergency.evacuationRoutes.filter(
            r => r.id !== elementId
          )
          // Ensure at least one primary if any remain
          if (newMapData.emergency.evacuationRoutes.length > 0 &&
              !newMapData.emergency.evacuationRoutes.some(r => r.isPrimary)) {
            newMapData.emergency.evacuationRoutes[0].isPrimary = true
          }
        }
      } else {
        // Single element - set to null
        if (newMapData[layer]) {
          newMapData[layer][elementType] = null
        }
      }
      
      return newMapData
    })
    
    setSelectedElement(null)
  }, [activeSite, updateSiteMapData])
  
  /**
   * Update an existing element
   */
  const updateElement = useCallback((elementId, elementType, updates) => {
    if (!activeSite) return

    // FIX: Handle singular/plural naming mismatch
    let styleKey = elementType
    if (elementType === 'obstacle') styleKey = 'obstacles'
    if (elementType === 'musterPoint') styleKey = 'musterPoints'
    if (elementType === 'evacuationRoute') styleKey = 'evacuationRoutes'

    const style = MAP_ELEMENT_STYLES[styleKey]
    if (!style) return

    updateSiteMapData(mapData => {
      const newMapData = JSON.parse(JSON.stringify(mapData))
      const layer = style.layer

      // Handle arrays
      if (elementType === 'obstacles' || elementType === 'obstacle') {
        if (Array.isArray(newMapData.siteSurvey?.obstacles)) {
          newMapData.siteSurvey.obstacles = newMapData.siteSurvey.obstacles.map(o =>
            o.id === elementId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
          )
        }
      } else if (elementType === 'musterPoints' || elementType === 'musterPoint') {
        if (Array.isArray(newMapData.emergency?.musterPoints)) {
          newMapData.emergency.musterPoints = newMapData.emergency.musterPoints.map(p =>
            p.id === elementId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          )
        }
      } else if (elementType === 'evacuationRoutes' || elementType === 'evacuationRoute') {
        if (Array.isArray(newMapData.emergency?.evacuationRoutes)) {
          newMapData.emergency.evacuationRoutes = newMapData.emergency.evacuationRoutes.map(r =>
            r.id === elementId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          )
        }
      } else {
        // Single element
        if (newMapData[layer]?.[elementType]) {
          newMapData[layer][elementType] = {
            ...newMapData[layer][elementType],
            ...updates,
            updatedAt: new Date().toISOString()
          }
        }
      }

      return newMapData
    })
  }, [activeSite, updateSiteMapData])

  /**
   * Update site survey data (for address auto-populate)
   */
  const updateSiteSurveyField = useCallback((field, value) => {
    if (!onUpdate) return

    const currentProject = projectRef.current
    if (!currentProject) return

    const currentSites = currentProject.sites || []
    const targetSiteId = currentProject.activeSiteId || activeSiteId

    if (!targetSiteId) return

    const updatedSites = currentSites.map(site => {
      if (site.id !== targetSiteId) return site

      return {
        ...site,
        siteSurvey: {
          ...site.siteSurvey,
          [field]: value
        },
        updatedAt: new Date().toISOString()
      }
    })

    onUpdate({ sites: updatedSites })
  }, [activeSiteId, onUpdate])

  /**
   * Auto-populate address from coordinates using reverse geocoding
   */
  const autoPopulateAddress = useCallback(async (lat, lng) => {
    try {
      const result = await reverseGeocode(lat, lng)
      if (result?.address) {
        updateSiteSurveyField('address', result.address)
        logger.info('[useMapData] Auto-populated address:', result.address)
        return result.address
      }
    } catch (err) {
      logger.error('[useMapData] Failed to auto-populate address:', err)
    }
    return null
  }, [updateSiteSurveyField])

  /**
   * Save pending obstacle with label data
   */
  const savePendingObstacle = useCallback((labelData) => {
    if (!pendingObstacle) return

    const { lngLat } = pendingObstacle
    setMarker('obstacle', lngLat, {
      obstacleType: labelData.obstacleType || 'other',
      height: labelData.height,
      notes: labelData.notes,
      properties: {
        label: labelData.notes || OBSTACLE_TYPES_MAP[labelData.obstacleType] || 'Obstacle',
        obstacleType: labelData.obstacleType,
        height: labelData.height
      }
    })

    setPendingObstacle(null)
  }, [pendingObstacle, setMarker])

  /**
   * Cancel pending obstacle
   */
  const cancelPendingObstacle = useCallback(() => {
    setPendingObstacle(null)
  }, [])

  // ============================================
  // DRAWING COMPLETION HANDLERS
  // ============================================
  
  /**
   * Complete the current drawing operation
   */
  const completeDrawing = useCallback((lngLat = null) => {
    if (!isDrawing || !drawingMode || drawingMode.id === 'none') return

    const { id: elementType, type: shapeType } = drawingMode

    // Handle drawing modes
    if (shapeType === 'marker') {
      // For markers, use the provided lngLat or last point
      const point = lngLat || (drawingPoints.length > 0 ? {
        lng: drawingPoints[drawingPoints.length - 1][0],
        lat: drawingPoints[drawingPoints.length - 1][1]
      } : null)

      if (point) {
        // Special handling for obstacles - show label prompt instead of immediate save
        if (elementType === 'obstacle') {
          setPendingObstacle({ lngLat: point, elementType })
          cancelDrawing()
          return
        }

        // For site location, also auto-populate address
        if (elementType === 'siteLocation') {
          setMarker(elementType, point)
          // Trigger async address lookup
          autoPopulateAddress(point.lat, point.lng)
        } else {
          setMarker(elementType, point)
        }
      }
    } else if (shapeType === 'polygon') {
      // Need at least 3 points for a polygon
      if (drawingPoints.length >= 3) {
        setPolygon(elementType, drawingPoints)
      }
    } else if (shapeType === 'line') {
      // Need at least 2 points for a line
      if (drawingPoints.length >= 2) {
        addEvacuationRoute(drawingPoints)
      }
    } else if (shapeType === 'measurement') {
      // Measurement tool - don't save anything, just clear
      // The distance was displayed in real-time during drawing
    }

    // Reset drawing state
    cancelDrawing()
  }, [isDrawing, drawingMode, drawingPoints, setMarker, setPolygon, addEvacuationRoute, cancelDrawing, autoPopulateAddress])

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  /**
   * Fit map to show all elements of the active site
   */
  const fitToActiveSite = useCallback(() => {
    setShowAllSites(false)
    // The actual fit operation will be handled by the map component
    // using activeSiteBounds
  }, [])
  
  /**
   * Fit map to show all sites
   */
  const fitToAllSites = useCallback(() => {
    setShowAllSites(true)
  }, [])
  
  /**
   * Calculate distance between two map elements
   */
  const getDistanceBetween = useCallback((element1, element2) => {
    if (!element1?.geometry?.coordinates || !element2?.geometry?.coordinates) return null
    
    const [lng1, lat1] = element1.geometry.coordinates
    const [lng2, lat2] = element2.geometry.coordinates
    
    return calculateDistance({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 })
  }, [])

  // ============================================
  // SYNC WITH PROJECT CHANGES
  // ============================================
  
  useEffect(() => {
    // If activeSiteId doesn't exist in sites, select first site
    if (activeSiteId && sites.length > 0) {
      const siteExists = sites.some(s => s.id === activeSiteId)
      if (!siteExists) {
        setActiveSiteId(sites[0].id)
      }
    } else if (!activeSiteId && sites.length > 0) {
      setActiveSiteId(sites[0].id)
    }
  }, [sites, activeSiteId])

  // ============================================
  // RETURN VALUE
  // ============================================
  
  return {
    // State
    sites,
    activeSiteId,
    activeSite,
    activeMapData,
    visibleLayers,
    drawingMode,
    isDrawing,
    drawingPoints,
    selectedElement,
    basemap,
    showAllSites,

    // Pending obstacle state (for label prompt)
    pendingObstacle,

    // Bounds
    activeSiteBounds,
    allSitesBounds,
    currentBounds,

    // Statistics
    activeSiteStats,
    activeSiteValidation,

    // Computed elements
    visibleMapElements,

    // Site management
    selectSite,

    // Layer management
    toggleLayer,
    setLayerVisibility,
    showAllLayers,
    hideAllLayers,

    // Drawing
    startDrawing,
    cancelDrawing,
    addDrawingPoint,
    removeLastDrawingPoint,
    completeDrawing,

    // Element selection
    setSelectedElement,

    // Element CRUD
    setMarker,
    setPolygon,
    addEvacuationRoute,
    removeElement,
    updateElement,
    updateSiteMapData,

    // Address and obstacle labeling
    autoPopulateAddress,
    savePendingObstacle,
    cancelPendingObstacle,
    updateSiteSurveyField,

    // View
    fitToActiveSite,
    fitToAllSites,
    setBasemap,
    setMapCenter,
    setMapZoom,
    mapCenter,
    mapZoom,
    setShowAllSites,

    // Utilities
    getDistanceBetween,

    // Constants
    DRAWING_MODES,
    MAP_LAYERS,
    MAP_ELEMENT_STYLES,
    MAP_BASEMAPS
  }
}

export default useMapData
