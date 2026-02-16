/**
 * flightPathUtils.js
 * Flight path generation algorithms for 3D flight visualization
 *
 * Provides utilities for:
 * - Grid pattern generation (area survey)
 * - Corridor path generation (linear inspection)
 * - Waypoint management and manipulation
 * - Terrain-aware path calculations
 *
 * @location src/lib/flightPathUtils.js
 */

import buffer from '@turf/buffer'
import { polygon as turfPolygon, lineString as turfLineString, point as turfPoint } from '@turf/helpers'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import lineIntersect from '@turf/line-intersect'
import length from '@turf/length'
import along from '@turf/along'
import bearing from '@turf/bearing'
import destination from '@turf/destination'
import bbox from '@turf/bbox'
import centroid from '@turf/centroid'

// ============================================
// CONSTANTS
// ============================================

export const FLIGHT_PATH_TYPES = {
  grid: {
    id: 'grid',
    label: 'Grid Pattern',
    description: 'Parallel flight lines for area coverage',
    icon: 'grid'
  },
  waypoint: {
    id: 'waypoint',
    label: 'Waypoint Path',
    description: 'Custom waypoint-to-waypoint flight',
    icon: 'route'
  },
  corridor: {
    id: 'corridor',
    label: 'Corridor Flight',
    description: 'Linear path following feature (road, pipeline, water)',
    icon: 'move-horizontal'
  },
  perimeter: {
    id: 'perimeter',
    label: 'Perimeter Survey',
    description: 'Flight around the boundary edge',
    icon: 'square'
  }
}

export const DEFAULT_GRID_SETTINGS = {
  spacing: 30,        // meters between flight lines
  angle: 0,           // grid rotation in degrees
  overlap: 70,        // percentage overlap for camera coverage
  altitude: 120,      // meters AGL
  speed: 10,          // m/s
  turnRadius: 15      // meters for smooth turns
}

export const DEFAULT_CORRIDOR_SETTINGS = {
  width: 50,          // buffer width on each side (meters)
  altitude: 80,       // meters AGL
  waypointSpacing: 100, // meters between waypoints along path
  speed: 8
}

// ============================================
// WAYPOINT CREATION
// ============================================

/**
 * Create a waypoint object
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {number} alt - Altitude in meters AGL
 * @param {number} order - Waypoint sequence number
 * @param {Object} options - Additional properties
 */
export const createWaypoint = (lng, lat, alt, order, options = {}) => ({
  id: options.id || `wp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  coordinates: [lng, lat, alt],
  order,
  label: options.label || `WP${order + 1}`,
  type: options.type || 'waypoint', // waypoint | turn | hover | photo | start | end
  heading: options.heading || null,
  speed: options.speed || null,
  hoverTime: options.hoverTime || 0, // seconds
  actions: options.actions || [], // camera actions, etc.
  createdAt: new Date().toISOString()
})

/**
 * Create waypoints from coordinate array
 */
export const coordinatesToWaypoints = (coordinates, altitude = 120) => {
  return coordinates.map((coord, index) => {
    const [lng, lat] = coord
    return createWaypoint(lng, lat, altitude, index, {
      type: index === 0 ? 'start' : index === coordinates.length - 1 ? 'end' : 'waypoint'
    })
  })
}

/**
 * Convert waypoints to GeoJSON LineString
 */
export const waypointsToLineString = (waypoints) => {
  if (!waypoints || waypoints.length < 2) return null

  const coordinates = waypoints
    .sort((a, b) => a.order - b.order)
    .map(wp => wp.coordinates)

  return {
    type: 'LineString',
    coordinates
  }
}

/**
 * Convert waypoints to 3D GeoJSON for visualization
 */
export const waypointsTo3DGeoJSON = (waypoints) => {
  if (!waypoints || waypoints.length === 0) return null

  const sortedWaypoints = [...waypoints].sort((a, b) => a.order - b.order)

  return {
    type: 'FeatureCollection',
    features: [
      // Flight path line
      {
        type: 'Feature',
        properties: { type: 'flightPath' },
        geometry: {
          type: 'LineString',
          coordinates: sortedWaypoints.map(wp => wp.coordinates)
        }
      },
      // Ground shadow (path at ground level)
      {
        type: 'Feature',
        properties: { type: 'groundShadow' },
        geometry: {
          type: 'LineString',
          coordinates: sortedWaypoints.map(wp => [wp.coordinates[0], wp.coordinates[1], 0])
        }
      },
      // Altitude poles (vertical lines from ground to waypoint)
      ...sortedWaypoints.map((wp, index) => ({
        type: 'Feature',
        properties: {
          type: 'altitudePole',
          waypointId: wp.id,
          order: wp.order,
          altitude: wp.coordinates[2]
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [wp.coordinates[0], wp.coordinates[1], 0],
            wp.coordinates
          ]
        }
      })),
      // Waypoint markers
      ...sortedWaypoints.map((wp, index) => ({
        type: 'Feature',
        properties: {
          type: 'waypointMarker',
          waypointId: wp.id,
          order: wp.order,
          label: wp.label,
          altitude: wp.coordinates[2],
          waypointType: wp.type
        },
        geometry: {
          type: 'Point',
          coordinates: wp.coordinates
        }
      }))
    ]
  }
}

// ============================================
// GRID PATTERN GENERATION
// ============================================

/**
 * Generate a grid flight pattern within a polygon
 * @param {Object} polygon - GeoJSON polygon geometry
 * @param {Object} settings - Grid settings
 * @returns {Array} Array of waypoints
 */
export const generateGridPattern = (polygon, settings = {}) => {
  const config = { ...DEFAULT_GRID_SETTINGS, ...settings }
  const { spacing, angle, altitude } = config

  if (!polygon?.coordinates?.[0] || polygon.coordinates[0].length < 4) {
    return []
  }

  try {
    const poly = turfPolygon(polygon.coordinates)
    const bounds = bbox(poly)
    const [minX, minY, maxX, maxY] = bounds

    // Calculate diagonal for grid coverage
    const diagonal = Math.sqrt(
      Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2)
    )

    // Convert spacing from meters to degrees (approximate)
    const spacingDeg = spacing / 111000 // ~111km per degree at equator

    // Get centroid for rotation
    const center = centroid(poly)
    const [cx, cy] = center.geometry.coordinates

    // Generate parallel lines
    const lines = []
    const angleRad = (angle * Math.PI) / 180

    // Extend beyond bounds to ensure coverage after rotation
    const extendedSize = diagonal * 1.5
    const numLines = Math.ceil(extendedSize / spacingDeg)

    for (let i = -numLines; i <= numLines; i++) {
      const offset = i * spacingDeg

      // Create line perpendicular to angle, through center + offset
      const x1 = cx + offset * Math.cos(angleRad + Math.PI / 2) - extendedSize * Math.cos(angleRad)
      const y1 = cy + offset * Math.sin(angleRad + Math.PI / 2) - extendedSize * Math.sin(angleRad)
      const x2 = cx + offset * Math.cos(angleRad + Math.PI / 2) + extendedSize * Math.cos(angleRad)
      const y2 = cy + offset * Math.sin(angleRad + Math.PI / 2) + extendedSize * Math.sin(angleRad)

      const line = turfLineString([[x1, y1], [x2, y2]])

      // Find intersections with polygon boundary
      const intersections = lineIntersect(line, poly)

      if (intersections.features.length >= 2) {
        // Sort intersections by x coordinate (for consistent direction)
        const sortedPoints = intersections.features
          .map(f => f.geometry.coordinates)
          .sort((a, b) => a[0] - b[0])

        lines.push({
          start: sortedPoints[0],
          end: sortedPoints[sortedPoints.length - 1],
          index: i
        })
      }
    }

    // Connect lines in serpentine pattern
    const waypoints = []
    let wpOrder = 0

    lines.forEach((line, lineIndex) => {
      // Alternate direction for serpentine pattern
      const reverse = lineIndex % 2 === 1
      const start = reverse ? line.end : line.start
      const end = reverse ? line.start : line.end

      // Add start point of line
      waypoints.push(createWaypoint(start[0], start[1], altitude, wpOrder++, {
        type: lineIndex === 0 ? 'start' : 'turn',
        label: `WP${wpOrder}`
      }))

      // Add end point of line
      waypoints.push(createWaypoint(end[0], end[1], altitude, wpOrder++, {
        type: lineIndex === lines.length - 1 ? 'end' : 'waypoint',
        label: `WP${wpOrder}`
      }))
    })

    return waypoints
  } catch (err) {
    console.error('Error generating grid pattern:', err)
    return []
  }
}

/**
 * Calculate estimated flight statistics for grid pattern
 */
export const calculateGridStats = (waypoints, settings = {}) => {
  if (!waypoints || waypoints.length < 2) {
    return { distance: 0, duration: 0, lines: 0 }
  }

  const config = { ...DEFAULT_GRID_SETTINGS, ...settings }
  let totalDistance = 0

  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1].coordinates
    const curr = waypoints[i].coordinates

    const line = turfLineString([
      [prev[0], prev[1]],
      [curr[0], curr[1]]
    ])

    totalDistance += length(line, { units: 'meters' })
  }

  const duration = totalDistance / config.speed // seconds
  const lines = Math.ceil(waypoints.length / 2)

  return {
    distance: Math.round(totalDistance),
    duration: Math.round(duration),
    durationMinutes: Math.round(duration / 60 * 10) / 10,
    lines,
    waypointCount: waypoints.length
  }
}

// ============================================
// CORRIDOR PATTERN GENERATION
// ============================================

/**
 * Generate corridor flight path along a line feature
 * @param {Object} lineGeometry - GeoJSON LineString geometry
 * @param {Object} settings - Corridor settings
 * @returns {Object} { waypoints, corridorBuffer }
 */
export const generateCorridorPath = (lineGeometry, settings = {}) => {
  const config = { ...DEFAULT_CORRIDOR_SETTINGS, ...settings }
  const { width, altitude, waypointSpacing } = config

  if (!lineGeometry?.coordinates || lineGeometry.coordinates.length < 2) {
    return { waypoints: [], corridorBuffer: null }
  }

  try {
    const line = turfLineString(lineGeometry.coordinates)
    const pathLength = length(line, { units: 'meters' })

    // Generate waypoints along the path
    const waypoints = []
    let wpOrder = 0
    let currentDistance = 0

    while (currentDistance <= pathLength) {
      const point = along(line, currentDistance / 1000, { units: 'kilometers' })
      const [lng, lat] = point.geometry.coordinates

      // Calculate heading to next point
      let headingValue = null
      if (currentDistance + waypointSpacing <= pathLength) {
        const nextPoint = along(line, (currentDistance + waypointSpacing) / 1000, { units: 'kilometers' })
        headingValue = bearing(point, nextPoint)
      }

      waypoints.push(createWaypoint(lng, lat, altitude, wpOrder++, {
        type: currentDistance === 0 ? 'start' : currentDistance >= pathLength ? 'end' : 'waypoint',
        heading: headingValue,
        label: `WP${wpOrder}`
      }))

      currentDistance += waypointSpacing
    }

    // Ensure we have the end point
    const lastCoord = lineGeometry.coordinates[lineGeometry.coordinates.length - 1]
    const lastWp = waypoints[waypoints.length - 1]
    if (lastWp && (lastWp.coordinates[0] !== lastCoord[0] || lastWp.coordinates[1] !== lastCoord[1])) {
      waypoints.push(createWaypoint(lastCoord[0], lastCoord[1], altitude, wpOrder++, {
        type: 'end',
        label: `WP${wpOrder}`
      }))
    }

    // Generate corridor buffer polygon
    const buffered = buffer(line, width / 1000, { units: 'kilometers' })
    const corridorBuffer = buffered?.geometry || null

    return {
      waypoints,
      corridorBuffer,
      pathLength: Math.round(pathLength)
    }
  } catch (err) {
    console.error('Error generating corridor path:', err)
    return { waypoints: [], corridorBuffer: null }
  }
}

// ============================================
// PERIMETER PATTERN GENERATION
// ============================================

/**
 * Generate perimeter flight path around polygon boundary
 * @param {Object} polygon - GeoJSON polygon geometry
 * @param {Object} settings - Flight settings
 * @returns {Array} Array of waypoints
 */
export const generatePerimeterPath = (polygon, settings = {}) => {
  const altitude = settings.altitude || 120
  const inset = settings.inset || 0 // meters inside boundary

  if (!polygon?.coordinates?.[0] || polygon.coordinates[0].length < 4) {
    return []
  }

  try {
    let coords = polygon.coordinates[0]

    // Apply inset buffer if specified
    if (inset > 0) {
      const poly = turfPolygon(polygon.coordinates)
      const buffered = buffer(poly, -inset / 1000, { units: 'kilometers' })
      if (buffered?.geometry?.coordinates?.[0]) {
        coords = buffered.geometry.coordinates[0]
      }
    }

    // Create waypoints from boundary coordinates
    const waypoints = coords.slice(0, -1).map((coord, index) => {
      const [lng, lat] = coord
      return createWaypoint(lng, lat, altitude, index, {
        type: index === 0 ? 'start' : 'waypoint',
        label: `WP${index + 1}`
      })
    })

    // Mark last waypoint as end (back to start)
    if (waypoints.length > 0) {
      waypoints[waypoints.length - 1].type = 'end'
    }

    return waypoints
  } catch (err) {
    console.error('Error generating perimeter path:', err)
    return []
  }
}

// ============================================
// WAYPOINT MANIPULATION
// ============================================

/**
 * Insert a waypoint between two existing waypoints
 */
export const insertWaypoint = (waypoints, afterOrder, lng, lat, altitude) => {
  const newWaypoints = [...waypoints]

  // Create new waypoint
  const newWp = createWaypoint(lng, lat, altitude, afterOrder + 1, {
    type: 'waypoint'
  })

  // Update orders for waypoints after insertion point
  newWaypoints.forEach(wp => {
    if (wp.order > afterOrder) {
      wp.order += 1
      wp.label = `WP${wp.order + 1}`
    }
  })

  // Insert new waypoint
  newWaypoints.push(newWp)

  return newWaypoints.sort((a, b) => a.order - b.order)
}

/**
 * Remove a waypoint and reorder remaining
 */
export const removeWaypoint = (waypoints, waypointId) => {
  const filtered = waypoints.filter(wp => wp.id !== waypointId)

  // Reorder remaining waypoints
  return filtered
    .sort((a, b) => a.order - b.order)
    .map((wp, index) => ({
      ...wp,
      order: index,
      label: `WP${index + 1}`,
      type: index === 0 ? 'start' : index === filtered.length - 1 ? 'end' : 'waypoint'
    }))
}

/**
 * Move a waypoint to new coordinates
 */
export const moveWaypoint = (waypoints, waypointId, newLng, newLat, newAlt = null) => {
  return waypoints.map(wp => {
    if (wp.id !== waypointId) return wp

    return {
      ...wp,
      coordinates: [
        newLng,
        newLat,
        newAlt !== null ? newAlt : wp.coordinates[2]
      ]
    }
  })
}

/**
 * Update waypoint altitude
 */
export const updateWaypointAltitude = (waypoints, waypointId, newAltitude) => {
  return waypoints.map(wp => {
    if (wp.id !== waypointId) return wp

    return {
      ...wp,
      coordinates: [wp.coordinates[0], wp.coordinates[1], newAltitude]
    }
  })
}

/**
 * Reorder waypoints by dragging
 */
export const reorderWaypoints = (waypoints, fromOrder, toOrder) => {
  const sorted = [...waypoints].sort((a, b) => a.order - b.order)
  const [moved] = sorted.splice(fromOrder, 1)
  sorted.splice(toOrder, 0, moved)

  return sorted.map((wp, index) => ({
    ...wp,
    order: index,
    label: `WP${index + 1}`,
    type: index === 0 ? 'start' : index === sorted.length - 1 ? 'end' : 'waypoint'
  }))
}

// ============================================
// PATH ANALYSIS
// ============================================

/**
 * Calculate total flight path distance
 */
export const calculatePathDistance = (waypoints) => {
  if (!waypoints || waypoints.length < 2) return 0

  const sorted = [...waypoints].sort((a, b) => a.order - b.order)
  let totalDistance = 0

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].coordinates
    const curr = sorted[i].coordinates

    const line = turfLineString([
      [prev[0], prev[1]],
      [curr[0], curr[1]]
    ])

    totalDistance += length(line, { units: 'meters' })
  }

  return Math.round(totalDistance)
}

/**
 * Calculate flight duration estimate
 */
export const calculateFlightDuration = (waypoints, averageSpeed = 10) => {
  const distance = calculatePathDistance(waypoints)
  return Math.round(distance / averageSpeed)
}

/**
 * Get altitude range from waypoints
 */
export const getAltitudeRange = (waypoints) => {
  if (!waypoints || waypoints.length === 0) {
    return { min: 0, max: 0, average: 0 }
  }

  const altitudes = waypoints.map(wp => wp.coordinates[2] || 0)
  const min = Math.min(...altitudes)
  const max = Math.max(...altitudes)
  const average = altitudes.reduce((a, b) => a + b, 0) / altitudes.length

  return {
    min: Math.round(min),
    max: Math.round(max),
    average: Math.round(average)
  }
}

/**
 * Generate altitude profile data for chart
 */
export const generateAltitudeProfile = (waypoints) => {
  if (!waypoints || waypoints.length === 0) return []

  const sorted = [...waypoints].sort((a, b) => a.order - b.order)
  const profile = []
  let cumulativeDistance = 0

  sorted.forEach((wp, index) => {
    if (index > 0) {
      const prev = sorted[index - 1].coordinates
      const curr = wp.coordinates

      const line = turfLineString([
        [prev[0], prev[1]],
        [curr[0], curr[1]]
      ])

      cumulativeDistance += length(line, { units: 'meters' })
    }

    profile.push({
      distance: Math.round(cumulativeDistance),
      altitude: wp.coordinates[2] || 0,
      waypointId: wp.id,
      label: wp.label,
      order: wp.order
    })
  })

  return profile
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate waypoints stay within flight geography
 */
export const validateWaypointsInBoundary = (waypoints, boundaryPolygon) => {
  if (!waypoints || !boundaryPolygon?.coordinates) {
    return { valid: true, outsideWaypoints: [] }
  }

  const poly = turfPolygon(boundaryPolygon.coordinates)
  const outsideWaypoints = []

  waypoints.forEach(wp => {
    const point = turfPoint([wp.coordinates[0], wp.coordinates[1]])
    if (!booleanPointInPolygon(point, poly)) {
      outsideWaypoints.push(wp.id)
    }
  })

  return {
    valid: outsideWaypoints.length === 0,
    outsideWaypoints
  }
}

/**
 * Check if altitude exceeds maximum
 */
export const validateMaxAltitude = (waypoints, maxAltitude = 400) => {
  if (!waypoints) return { valid: true, exceedingWaypoints: [] }

  const exceedingWaypoints = waypoints
    .filter(wp => wp.coordinates[2] > maxAltitude)
    .map(wp => wp.id)

  return {
    valid: exceedingWaypoints.length === 0,
    exceedingWaypoints
  }
}

// ============================================
// EXPORT
// ============================================

export default {
  FLIGHT_PATH_TYPES,
  DEFAULT_GRID_SETTINGS,
  DEFAULT_CORRIDOR_SETTINGS,
  createWaypoint,
  coordinatesToWaypoints,
  waypointsToLineString,
  waypointsTo3DGeoJSON,
  generateGridPattern,
  calculateGridStats,
  generateCorridorPath,
  generatePerimeterPath,
  insertWaypoint,
  removeWaypoint,
  moveWaypoint,
  updateWaypointAltitude,
  reorderWaypoints,
  calculatePathDistance,
  calculateFlightDuration,
  getAltitudeRange,
  generateAltitudeProfile,
  validateWaypointsInBoundary,
  validateMaxAltitude
}
