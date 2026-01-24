/**
 * Geolocation Utilities
 * Coordinate handling, distance calculations, and map helpers
 *
 * @location src/lib/geoUtils.js
 */

// ============================================
// CONSTANTS
// ============================================

export const EARTH_RADIUS_KM = 6371
export const EARTH_RADIUS_MILES = 3959

export const COORDINATE_FORMATS = {
  decimal: 'Decimal Degrees',
  dms: 'Degrees Minutes Seconds',
  dmm: 'Degrees Decimal Minutes'
}

// ============================================
// COORDINATE VALIDATION
// ============================================

/**
 * Validate latitude
 */
export function isValidLatitude(lat) {
  const num = parseFloat(lat)
  return !isNaN(num) && num >= -90 && num <= 90
}

/**
 * Validate longitude
 */
export function isValidLongitude(lng) {
  const num = parseFloat(lng)
  return !isNaN(num) && num >= -180 && num <= 180
}

/**
 * Validate coordinates pair
 */
export function isValidCoordinates(lat, lng) {
  return isValidLatitude(lat) && isValidLongitude(lng)
}

/**
 * Parse coordinate string (various formats)
 */
export function parseCoordinates(coordString) {
  if (!coordString) return null

  // Try decimal format: "40.7128, -74.0060"
  const decimalMatch = coordString.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/)
  if (decimalMatch) {
    const lat = parseFloat(decimalMatch[1])
    const lng = parseFloat(decimalMatch[2])
    if (isValidCoordinates(lat, lng)) {
      return { lat, lng }
    }
  }

  // Try DMS format: "40°42'46.4"N 74°00'21.6"W"
  const dmsMatch = coordString.match(
    /(\d+)°(\d+)'([\d.]+)"?\s*([NS])\s*(\d+)°(\d+)'([\d.]+)"?\s*([EW])/i
  )
  if (dmsMatch) {
    const lat = dmsToDecimal(
      parseInt(dmsMatch[1]),
      parseInt(dmsMatch[2]),
      parseFloat(dmsMatch[3]),
      dmsMatch[4].toUpperCase()
    )
    const lng = dmsToDecimal(
      parseInt(dmsMatch[5]),
      parseInt(dmsMatch[6]),
      parseFloat(dmsMatch[7]),
      dmsMatch[8].toUpperCase()
    )
    if (isValidCoordinates(lat, lng)) {
      return { lat, lng }
    }
  }

  return null
}

// ============================================
// COORDINATE CONVERSION
// ============================================

/**
 * Convert DMS to decimal degrees
 */
export function dmsToDecimal(degrees, minutes, seconds, direction) {
  let decimal = degrees + minutes / 60 + seconds / 3600
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal
  }
  return decimal
}

/**
 * Convert decimal degrees to DMS
 */
export function decimalToDms(decimal, isLatitude = true) {
  const absolute = Math.abs(decimal)
  const degrees = Math.floor(absolute)
  const minutesFloat = (absolute - degrees) * 60
  const minutes = Math.floor(minutesFloat)
  const seconds = (minutesFloat - minutes) * 60

  let direction
  if (isLatitude) {
    direction = decimal >= 0 ? 'N' : 'S'
  } else {
    direction = decimal >= 0 ? 'E' : 'W'
  }

  return { degrees, minutes, seconds: Math.round(seconds * 100) / 100, direction }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat, lng, format = 'decimal', precision = 6) {
  if (!isValidCoordinates(lat, lng)) return ''

  switch (format) {
    case 'dms': {
      const latDms = decimalToDms(lat, true)
      const lngDms = decimalToDms(lng, false)
      return `${latDms.degrees}°${latDms.minutes}'${latDms.seconds.toFixed(1)}"${latDms.direction} ${lngDms.degrees}°${lngDms.minutes}'${lngDms.seconds.toFixed(1)}"${lngDms.direction}`
    }
    case 'dmm': {
      const latDeg = Math.floor(Math.abs(lat))
      const latMin = (Math.abs(lat) - latDeg) * 60
      const latDir = lat >= 0 ? 'N' : 'S'
      const lngDeg = Math.floor(Math.abs(lng))
      const lngMin = (Math.abs(lng) - lngDeg) * 60
      const lngDir = lng >= 0 ? 'E' : 'W'
      return `${latDeg}°${latMin.toFixed(3)}'${latDir} ${lngDeg}°${lngMin.toFixed(3)}'${lngDir}`
    }
    case 'decimal':
    default:
      return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`
  }
}

// ============================================
// DISTANCE CALCULATIONS
// ============================================

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(lat1, lng1, lat2, lng2, unit = 'km') {
  const R = unit === 'miles' ? EARTH_RADIUS_MILES : EARTH_RADIUS_KM

  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Calculate bearing between two points
 */
export function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = toRadians(lng2 - lng1)
  const lat1Rad = toRadians(lat1)
  const lat2Rad = toRadians(lat2)

  const y = Math.sin(dLng) * Math.cos(lat2Rad)
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)

  let bearing = toDegrees(Math.atan2(y, x))
  return (bearing + 360) % 360
}

/**
 * Get compass direction from bearing
 */
export function bearingToDirection(bearing) {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ]
  const index = Math.round(bearing / 22.5) % 16
  return directions[index]
}

/**
 * Calculate destination point given start, bearing, and distance
 */
export function calculateDestination(lat, lng, bearing, distance, unit = 'km') {
  const R = unit === 'miles' ? EARTH_RADIUS_MILES : EARTH_RADIUS_KM

  const lat1 = toRadians(lat)
  const lng1 = toRadians(lng)
  const bearingRad = toRadians(bearing)
  const angularDistance = distance / R

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
  )

  const lng2 = lng1 + Math.atan2(
    Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
  )

  return {
    lat: toDegrees(lat2),
    lng: toDegrees(lng2)
  }
}

// ============================================
// BOUNDING BOX & AREA
// ============================================

/**
 * Calculate bounding box for a set of coordinates
 */
export function getBoundingBox(coordinates) {
  if (!coordinates || coordinates.length === 0) return null

  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  coordinates.forEach(({ lat, lng }) => {
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
  })

  return {
    north: maxLat,
    south: minLat,
    east: maxLng,
    west: minLng,
    center: {
      lat: (maxLat + minLat) / 2,
      lng: (maxLng + minLng) / 2
    }
  }
}

/**
 * Expand bounding box by a margin (in km)
 */
export function expandBoundingBox(bounds, marginKm) {
  const latMargin = marginKm / 111 // Approx km per degree latitude
  const lngMargin = marginKm / (111 * Math.cos(toRadians(bounds.center.lat)))

  return {
    north: bounds.north + latMargin,
    south: bounds.south - latMargin,
    east: bounds.east + lngMargin,
    west: bounds.west - lngMargin,
    center: bounds.center
  }
}

/**
 * Check if point is within bounding box
 */
export function isPointInBounds(lat, lng, bounds) {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  )
}

/**
 * Calculate area of polygon (in square km)
 */
export function calculatePolygonArea(coordinates) {
  if (!coordinates || coordinates.length < 3) return 0

  let area = 0
  const n = coordinates.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += toRadians(coordinates[j].lng - coordinates[i].lng) *
      (2 + Math.sin(toRadians(coordinates[i].lat)) + Math.sin(toRadians(coordinates[j].lat)))
  }

  area = Math.abs(area * EARTH_RADIUS_KM * EARTH_RADIUS_KM / 2)
  return area
}

// ============================================
// GEOFENCING
// ============================================

/**
 * Check if point is within a circular geofence
 */
export function isPointInCircle(pointLat, pointLng, centerLat, centerLng, radiusKm) {
  const distance = calculateDistance(pointLat, pointLng, centerLat, centerLng, 'km')
  return distance <= radiusKm
}

/**
 * Check if point is within a polygon (ray casting algorithm)
 */
export function isPointInPolygon(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) return false

  let inside = false
  const n = polygon.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lng
    const yi = polygon[i].lat
    const xj = polygon[j].lng
    const yj = polygon[j].lat

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

/**
 * Create circular geofence coordinates
 */
export function createCirclePolygon(centerLat, centerLng, radiusKm, numPoints = 32) {
  const points = []

  for (let i = 0; i < numPoints; i++) {
    const bearing = (360 / numPoints) * i
    const point = calculateDestination(centerLat, centerLng, bearing, radiusKm)
    points.push(point)
  }

  return points
}

// ============================================
// DRONE SPECIFIC CALCULATIONS
// ============================================

/**
 * Calculate altitude MSL from AGL and terrain elevation
 */
export function aglToMsl(aglMeters, terrainElevationMeters) {
  return aglMeters + terrainElevationMeters
}

/**
 * Calculate AGL from MSL and terrain elevation
 */
export function mslToAgl(mslMeters, terrainElevationMeters) {
  return mslMeters - terrainElevationMeters
}

/**
 * Convert feet to meters
 */
export function feetToMeters(feet) {
  return feet * 0.3048
}

/**
 * Convert meters to feet
 */
export function metersToFeet(meters) {
  return meters / 0.3048
}

/**
 * Check if altitude is within legal limit (e.g., 400ft AGL in US)
 */
export function isWithinAltitudeLimit(aglMeters, limitFeet = 400) {
  return aglMeters <= feetToMeters(limitFeet)
}

/**
 * Calculate flight path distance
 */
export function calculateFlightPathDistance(waypoints) {
  if (!waypoints || waypoints.length < 2) return 0

  let totalDistance = 0

  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(
      waypoints[i].lat,
      waypoints[i].lng,
      waypoints[i + 1].lat,
      waypoints[i + 1].lng,
      'km'
    )
  }

  return totalDistance
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert degrees to radians
 */
export function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians) {
  return (radians * 180) / Math.PI
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm, unit = 'km') {
  if (unit === 'miles') {
    const miles = distanceKm * 0.621371
    return miles < 1
      ? `${(miles * 5280).toFixed(0)} ft`
      : `${miles.toFixed(2)} mi`
  }

  return distanceKm < 1
    ? `${(distanceKm * 1000).toFixed(0)} m`
    : `${distanceKm.toFixed(2)} km`
}

/**
 * Format area for display
 */
export function formatArea(areaKm2, unit = 'km2') {
  if (unit === 'acres') {
    return `${(areaKm2 * 247.105).toFixed(2)} acres`
  }
  if (unit === 'hectares') {
    return `${(areaKm2 * 100).toFixed(2)} ha`
  }

  return areaKm2 < 1
    ? `${(areaKm2 * 1000000).toFixed(0)} m²`
    : `${areaKm2.toFixed(2)} km²`
}

/**
 * Get center point of coordinates array
 */
export function getCenterPoint(coordinates) {
  if (!coordinates || coordinates.length === 0) return null

  const sum = coordinates.reduce(
    (acc, coord) => ({
      lat: acc.lat + coord.lat,
      lng: acc.lng + coord.lng
    }),
    { lat: 0, lng: 0 }
  )

  return {
    lat: sum.lat / coordinates.length,
    lng: sum.lng / coordinates.length
  }
}

export default {
  EARTH_RADIUS_KM,
  EARTH_RADIUS_MILES,
  COORDINATE_FORMATS,
  isValidLatitude,
  isValidLongitude,
  isValidCoordinates,
  parseCoordinates,
  dmsToDecimal,
  decimalToDms,
  formatCoordinates,
  calculateDistance,
  calculateBearing,
  bearingToDirection,
  calculateDestination,
  getBoundingBox,
  expandBoundingBox,
  isPointInBounds,
  calculatePolygonArea,
  isPointInCircle,
  isPointInPolygon,
  createCirclePolygon,
  aglToMsl,
  mslToAgl,
  feetToMeters,
  metersToFeet,
  isWithinAltitudeLimit,
  calculateFlightPathDistance,
  toRadians,
  toDegrees,
  formatDistance,
  formatArea,
  getCenterPoint
}
