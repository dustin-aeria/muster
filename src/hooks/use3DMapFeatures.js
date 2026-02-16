/**
 * use3DMapFeatures.js
 * Custom hook for managing 3D map visualization state
 *
 * Provides state management for:
 * - 3D terrain visualization toggle
 * - Camera pitch and bearing controls
 * - Terrain exaggeration
 * - Flight path 3D visualization
 * - Altitude profile data
 *
 * @location src/hooks/use3DMapFeatures.js
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  generateGridPattern,
  generateCorridorPath,
  generatePerimeterPath,
  calculatePathDistance,
  calculateFlightDuration,
  getAltitudeRange,
  generateAltitudeProfile,
  waypointsTo3DGeoJSON,
  DEFAULT_GRID_SETTINGS,
  DEFAULT_CORRIDOR_SETTINGS,
  insertWaypoint,
  removeWaypoint,
  moveWaypoint,
  updateWaypointAltitude,
  reorderWaypoints
} from '../lib/flightPathUtils'

// ============================================
// DEFAULT STATE
// ============================================

const DEFAULT_3D_VIEW_STATE = {
  enabled: false,
  terrainEnabled: true,
  terrainExaggeration: 1.5,
  pitch: 60,
  bearing: 0,
  skyEnabled: true
}

const DEFAULT_FLIGHT_PATH_STATE = {
  type: null, // 'grid' | 'waypoint' | 'corridor' | 'perimeter'
  waypoints: [],
  gridSettings: { ...DEFAULT_GRID_SETTINGS },
  corridorSettings: { ...DEFAULT_CORRIDOR_SETTINGS },
  corridorBuffer: null,
  isEditing: false,
  selectedWaypointId: null
}

// ============================================
// MAIN HOOK
// ============================================

/**
 * use3DMapFeatures hook
 *
 * @param {Object} options - Configuration options
 * @returns {Object} 3D map state and control functions
 */
export function use3DMapFeatures(options = {}) {
  const {
    initialView3D = DEFAULT_3D_VIEW_STATE,
    initialFlightPath = DEFAULT_FLIGHT_PATH_STATE,
    flightGeography = null, // GeoJSON polygon for flight area
    maxAltitude = 400,
    onFlightPathChange = null
  } = options

  // ============================================
  // STATE
  // ============================================

  // 3D View state
  const [view3D, setView3D] = useState({
    ...DEFAULT_3D_VIEW_STATE,
    ...initialView3D
  })

  // Flight path state
  const [flightPath, setFlightPath] = useState({
    ...DEFAULT_FLIGHT_PATH_STATE,
    ...initialFlightPath
  })

  // ============================================
  // 3D VIEW CONTROLS
  // ============================================

  const toggle3DMode = useCallback(() => {
    setView3D(prev => ({
      ...prev,
      enabled: !prev.enabled,
      pitch: !prev.enabled ? 60 : 0
    }))
  }, [])

  const enable3DMode = useCallback(() => {
    setView3D(prev => ({
      ...prev,
      enabled: true,
      pitch: prev.pitch || 60
    }))
  }, [])

  const disable3DMode = useCallback(() => {
    setView3D(prev => ({
      ...prev,
      enabled: false,
      pitch: 0
    }))
  }, [])

  const toggleTerrain = useCallback(() => {
    setView3D(prev => ({
      ...prev,
      terrainEnabled: !prev.terrainEnabled
    }))
  }, [])

  const setTerrainExaggeration = useCallback((value) => {
    const clamped = Math.max(1, Math.min(3, value))
    setView3D(prev => ({
      ...prev,
      terrainExaggeration: clamped
    }))
  }, [])

  const setPitch = useCallback((value) => {
    const clamped = Math.max(0, Math.min(85, value))
    setView3D(prev => ({
      ...prev,
      pitch: clamped
    }))
  }, [])

  const setBearing = useCallback((value) => {
    // Normalize bearing to 0-360
    const normalized = ((value % 360) + 360) % 360
    setView3D(prev => ({
      ...prev,
      bearing: normalized
    }))
  }, [])

  const toggleSky = useCallback(() => {
    setView3D(prev => ({
      ...prev,
      skyEnabled: !prev.skyEnabled
    }))
  }, [])

  const resetView = useCallback(() => {
    setView3D({
      ...DEFAULT_3D_VIEW_STATE,
      enabled: true
    })
  }, [])

  // ============================================
  // FLIGHT PATH CONTROLS
  // ============================================

  const setFlightPathType = useCallback((type) => {
    setFlightPath(prev => ({
      ...prev,
      type,
      waypoints: [],
      corridorBuffer: null,
      isEditing: false,
      selectedWaypointId: null
    }))
  }, [])

  const updateGridSettings = useCallback((updates) => {
    setFlightPath(prev => ({
      ...prev,
      gridSettings: {
        ...prev.gridSettings,
        ...updates
      }
    }))
  }, [])

  const updateCorridorSettings = useCallback((updates) => {
    setFlightPath(prev => ({
      ...prev,
      corridorSettings: {
        ...prev.corridorSettings,
        ...updates
      }
    }))
  }, [])

  const setWaypoints = useCallback((waypoints) => {
    setFlightPath(prev => ({
      ...prev,
      waypoints
    }))
    onFlightPathChange?.({ waypoints })
  }, [onFlightPathChange])

  const addWaypoint = useCallback((afterOrder, lng, lat, altitude) => {
    setFlightPath(prev => {
      const newWaypoints = insertWaypoint(prev.waypoints, afterOrder, lng, lat, altitude)
      onFlightPathChange?.({ waypoints: newWaypoints })
      return {
        ...prev,
        waypoints: newWaypoints
      }
    })
  }, [onFlightPathChange])

  const deleteWaypoint = useCallback((waypointId) => {
    setFlightPath(prev => {
      const newWaypoints = removeWaypoint(prev.waypoints, waypointId)
      onFlightPathChange?.({ waypoints: newWaypoints })
      return {
        ...prev,
        waypoints: newWaypoints,
        selectedWaypointId: prev.selectedWaypointId === waypointId ? null : prev.selectedWaypointId
      }
    })
  }, [onFlightPathChange])

  const updateWaypointPosition = useCallback((waypointId, lng, lat, alt = null) => {
    setFlightPath(prev => {
      const newWaypoints = moveWaypoint(prev.waypoints, waypointId, lng, lat, alt)
      onFlightPathChange?.({ waypoints: newWaypoints })
      return {
        ...prev,
        waypoints: newWaypoints
      }
    })
  }, [onFlightPathChange])

  const setWaypointAltitude = useCallback((waypointId, altitude) => {
    setFlightPath(prev => {
      const newWaypoints = updateWaypointAltitude(prev.waypoints, waypointId, altitude)
      onFlightPathChange?.({ waypoints: newWaypoints })
      return {
        ...prev,
        waypoints: newWaypoints
      }
    })
  }, [onFlightPathChange])

  const reorderWaypointsList = useCallback((fromOrder, toOrder) => {
    setFlightPath(prev => {
      const newWaypoints = reorderWaypoints(prev.waypoints, fromOrder, toOrder)
      onFlightPathChange?.({ waypoints: newWaypoints })
      return {
        ...prev,
        waypoints: newWaypoints
      }
    })
  }, [onFlightPathChange])

  const selectWaypoint = useCallback((waypointId) => {
    setFlightPath(prev => ({
      ...prev,
      selectedWaypointId: waypointId
    }))
  }, [])

  const clearSelection = useCallback(() => {
    setFlightPath(prev => ({
      ...prev,
      selectedWaypointId: null
    }))
  }, [])

  const toggleEditing = useCallback(() => {
    setFlightPath(prev => ({
      ...prev,
      isEditing: !prev.isEditing
    }))
  }, [])

  const startEditing = useCallback(() => {
    setFlightPath(prev => ({
      ...prev,
      isEditing: true
    }))
  }, [])

  const stopEditing = useCallback(() => {
    setFlightPath(prev => ({
      ...prev,
      isEditing: false,
      selectedWaypointId: null
    }))
  }, [])

  // ============================================
  // PATTERN GENERATION
  // ============================================

  const generateGridFlightPath = useCallback(() => {
    if (!flightGeography?.coordinates) {
      console.warn('No flight geography available for grid generation')
      return
    }

    const waypoints = generateGridPattern(flightGeography, flightPath.gridSettings)

    setFlightPath(prev => ({
      ...prev,
      type: 'grid',
      waypoints,
      corridorBuffer: null
    }))

    onFlightPathChange?.({ type: 'grid', waypoints })
  }, [flightGeography, flightPath.gridSettings, onFlightPathChange])

  const generateCorridorFlightPath = useCallback((centerLine) => {
    if (!centerLine?.coordinates) {
      console.warn('No center line provided for corridor generation')
      return
    }

    const result = generateCorridorPath(centerLine, flightPath.corridorSettings)

    setFlightPath(prev => ({
      ...prev,
      type: 'corridor',
      waypoints: result.waypoints,
      corridorBuffer: result.corridorBuffer
    }))

    onFlightPathChange?.({ type: 'corridor', waypoints: result.waypoints, corridorBuffer: result.corridorBuffer })
  }, [flightPath.corridorSettings, onFlightPathChange])

  const generatePerimeterFlightPath = useCallback(() => {
    if (!flightGeography?.coordinates) {
      console.warn('No flight geography available for perimeter generation')
      return
    }

    const waypoints = generatePerimeterPath(flightGeography, {
      altitude: flightPath.gridSettings.altitude
    })

    setFlightPath(prev => ({
      ...prev,
      type: 'perimeter',
      waypoints,
      corridorBuffer: null
    }))

    onFlightPathChange?.({ type: 'perimeter', waypoints })
  }, [flightGeography, flightPath.gridSettings.altitude, onFlightPathChange])

  const clearFlightPath = useCallback(() => {
    setFlightPath({
      ...DEFAULT_FLIGHT_PATH_STATE
    })
    onFlightPathChange?.({ type: null, waypoints: [] })
  }, [onFlightPathChange])

  // ============================================
  // DERIVED STATE
  // ============================================

  // Flight path statistics
  const flightStats = useMemo(() => {
    if (!flightPath.waypoints || flightPath.waypoints.length < 2) {
      return {
        distance: 0,
        duration: 0,
        durationMinutes: 0,
        waypointCount: flightPath.waypoints?.length || 0,
        altitudeRange: { min: 0, max: 0, average: 0 }
      }
    }

    const distance = calculatePathDistance(flightPath.waypoints)
    const duration = calculateFlightDuration(flightPath.waypoints, flightPath.gridSettings.speed)
    const altitudeRange = getAltitudeRange(flightPath.waypoints)

    return {
      distance,
      duration,
      durationMinutes: Math.round(duration / 60 * 10) / 10,
      waypointCount: flightPath.waypoints.length,
      altitudeRange
    }
  }, [flightPath.waypoints, flightPath.gridSettings.speed])

  // Altitude profile for chart
  const altitudeProfile = useMemo(() => {
    return generateAltitudeProfile(flightPath.waypoints)
  }, [flightPath.waypoints])

  // 3D GeoJSON for visualization
  const flightPath3DGeoJSON = useMemo(() => {
    return waypointsTo3DGeoJSON(flightPath.waypoints)
  }, [flightPath.waypoints])

  // Selected waypoint data
  const selectedWaypoint = useMemo(() => {
    if (!flightPath.selectedWaypointId) return null
    return flightPath.waypoints.find(wp => wp.id === flightPath.selectedWaypointId) || null
  }, [flightPath.waypoints, flightPath.selectedWaypointId])

  // ============================================
  // RETURN VALUE
  // ============================================

  return {
    // 3D View State
    view3D,
    is3DEnabled: view3D.enabled,
    isTerrainEnabled: view3D.terrainEnabled,
    terrainExaggeration: view3D.terrainExaggeration,
    pitch: view3D.pitch,
    bearing: view3D.bearing,
    isSkyEnabled: view3D.skyEnabled,

    // 3D View Controls
    toggle3DMode,
    enable3DMode,
    disable3DMode,
    toggleTerrain,
    setTerrainExaggeration,
    setPitch,
    setBearing,
    toggleSky,
    resetView,
    setView3D,

    // Flight Path State
    flightPath,
    flightPathType: flightPath.type,
    waypoints: flightPath.waypoints,
    gridSettings: flightPath.gridSettings,
    corridorSettings: flightPath.corridorSettings,
    corridorBuffer: flightPath.corridorBuffer,
    isEditingPath: flightPath.isEditing,
    selectedWaypointId: flightPath.selectedWaypointId,
    selectedWaypoint,

    // Flight Path Controls
    setFlightPathType,
    updateGridSettings,
    updateCorridorSettings,
    setWaypoints,
    addWaypoint,
    deleteWaypoint,
    updateWaypointPosition,
    setWaypointAltitude,
    reorderWaypoints: reorderWaypointsList,
    selectWaypoint,
    clearSelection,
    toggleEditing,
    startEditing,
    stopEditing,

    // Pattern Generation
    generateGridFlightPath,
    generateCorridorFlightPath,
    generatePerimeterFlightPath,
    clearFlightPath,

    // Derived Data
    flightStats,
    altitudeProfile,
    flightPath3DGeoJSON
  }
}

export default use3DMapFeatures
