/**
 * mapDataStructures.js
 * Core data structures for the unified multi-site map system
 * 
 * Defines map element types, site structures, and helper functions
 * for GeoJSON-compatible coordinate storage and manipulation.
 * 
 * @location src/lib/mapDataStructures.js
 * @action NEW
 */

// ============================================
// CONSTANTS
// ============================================

export const MAX_SITES_PER_PROJECT = 10

export const SITE_STATUS = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  surveyed: { label: 'Surveyed', color: 'bg-blue-100 text-blue-700' },
  planned: { label: 'Planned', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', color: 'bg-purple-100 text-purple-700' }
}

// Map layer configuration
export const MAP_LAYERS = {
  siteSurvey: {
    id: 'siteSurvey',
    label: 'Site Survey',
    description: 'Location, boundary, obstacles',
    color: '#3B82F6', // blue-500
    elements: ['siteLocation', 'operationsBoundary', 'obstacles']
  },
  flightPlan: {
    id: 'flightPlan',
    label: 'Flight Plan',
    description: 'Launch, recovery, flight geography',
    color: '#22C55E', // green-500
    elements: ['launchPoint', 'recoveryPoint', 'flightGeography', 'contingencyVolume', 'groundRiskBuffer']
  },
  emergency: {
    id: 'emergency',
    label: 'Emergency',
    description: 'Muster points, evacuation routes',
    color: '#EF4444', // red-500
    elements: ['musterPoints', 'evacuationRoutes']
  }
}

// Map element visual configuration
export const MAP_ELEMENT_STYLES = {
  // Site Survey Elements
  siteLocation: {
    type: 'marker',
    layer: 'siteSurvey',
    label: 'Site Location',
    color: '#3B82F6',
    icon: 'map-pin',
    description: 'Center point of the operation site'
  },
  operationsBoundary: {
    type: 'polygon',
    layer: 'siteSurvey',
    label: 'Operations Boundary',
    color: '#3B82F6',
    fillOpacity: 0.1,
    strokeWidth: 2,
    strokeStyle: 'solid',
    description: 'Area where operations will take place'
  },
  obstacles: {
    type: 'marker',
    layer: 'siteSurvey',
    label: 'Obstacle',
    color: '#F59E0B', // amber-500
    icon: 'alert-triangle',
    description: 'Identified obstacles (towers, wires, etc.)'
  },
  
  // Flight Plan Elements
  launchPoint: {
    type: 'marker',
    layer: 'flightPlan',
    label: 'Launch Point',
    color: '#22C55E',
    icon: 'plane-takeoff',
    description: 'RPAS launch/takeoff location'
  },
  recoveryPoint: {
    type: 'marker',
    layer: 'flightPlan',
    label: 'Recovery Point',
    color: '#F97316', // orange-500
    icon: 'plane-landing',
    description: 'RPAS landing/recovery location'
  },
  pilotPosition: {
    type: 'marker',
    layer: 'flightPlan',
    label: 'Pilot Position',
    color: '#8B5CF6', // violet-500
    icon: 'user',
    description: 'Remote pilot operating position'
  },
  flightGeography: {
    type: 'polygon',
    layer: 'flightPlan',
    label: 'Flight Geography',
    color: '#22C55E',
    fillOpacity: 0.05,
    strokeWidth: 2,
    strokeStyle: 'dashed',
    description: 'Intended flight area (SORA)'
  },
  contingencyVolume: {
    type: 'polygon',
    layer: 'flightPlan',
    label: 'Contingency Volume',
    color: '#EAB308', // yellow-500
    fillOpacity: 0.05,
    strokeWidth: 2,
    strokeStyle: 'dotted',
    description: 'Buffer for abnormal situations (SORA)'
  },
  groundRiskBuffer: {
    type: 'polygon',
    layer: 'flightPlan',
    label: 'Ground Risk Buffer',
    color: '#F97316',
    fillOpacity: 0.03,
    strokeWidth: 1,
    strokeStyle: 'dotted',
    description: 'Extended ground risk area (SORA)'
  },
  
  // Emergency Elements
  musterPoints: {
    type: 'marker',
    layer: 'emergency',
    label: 'Muster Point',
    color: '#EF4444',
    icon: 'flag',
    description: 'Emergency assembly location'
  },
  evacuationRoutes: {
    type: 'line',
    layer: 'emergency',
    label: 'Evacuation Route',
    color: '#EF4444',
    strokeWidth: 3,
    strokeStyle: 'solid',
    arrowEnd: true,
    description: 'Primary evacuation path'
  }
}

// Map basemap options
export const MAP_BASEMAPS = {
  streets: {
    id: 'streets',
    label: 'Streets',
    style: 'mapbox://styles/mapbox/streets-v12',
    icon: 'map'
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    icon: 'globe'
  },
  outdoors: {
    id: 'outdoors',
    label: 'Outdoors',
    style: 'mapbox://styles/mapbox/outdoors-v12',
    icon: 'mountain'
  }
}

// Population categories (aligned with SORA)
export const POPULATION_CATEGORIES = {
  controlled: {
    id: 'controlled',
    label: 'Controlled Ground',
    description: 'Access strictly controlled, no uninvolved people',
    density: '0',
    color: '#22C55E'
  },
  remote: {
    id: 'remote',
    label: 'Remote/Uninhabited',
    description: 'Wilderness, no permanent structures',
    density: '< 1/km²',
    color: '#86EFAC'
  },
  lightly: {
    id: 'lightly',
    label: 'Lightly Populated',
    description: 'Rural areas, scattered buildings',
    density: '1-50/km²',
    color: '#FEF08A'
  },
  sparsely: {
    id: 'sparsely',
    label: 'Sparsely Populated',
    description: 'Small towns, light residential',
    density: '50-500/km²',
    color: '#FDE047'
  },
  suburban: {
    id: 'suburban',
    label: 'Suburban',
    description: 'Residential neighborhoods',
    density: '500-5000/km²',
    color: '#FDBA74'
  },
  highdensity: {
    id: 'highdensity',
    label: 'High Density Urban',
    description: 'Urban centers, high-rise areas',
    density: '> 5000/km²',
    color: '#FCA5A5'
  },
  assembly: {
    id: 'assembly',
    label: 'Assembly of People',
    description: 'Events, stadiums, gatherings',
    density: 'Variable',
    color: '#F87171'
  }
}

// ============================================
// DATA STRUCTURES
// ============================================

/**
 * GeoJSON Point structure
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {number} [alt] - Altitude in meters (optional)
 */
export const createGeoPoint = (lng, lat, alt = null) => ({
  type: 'Point',
  coordinates: alt !== null ? [lng, lat, alt] : [lng, lat]
})

/**
 * GeoJSON Polygon structure
 * @param {Array<[number, number]>} coordinates - Array of [lng, lat] pairs
 */
export const createGeoPolygon = (coordinates) => ({
  type: 'Polygon',
  coordinates: [coordinates] // GeoJSON polygons need nested array
})

/**
 * GeoJSON LineString structure
 * @param {Array<[number, number]>} coordinates - Array of [lng, lat] pairs
 */
export const createGeoLine = (coordinates) => ({
  type: 'LineString',
  coordinates
})

/**
 * Map marker structure
 */
export const createMapMarker = (lng, lat, options = {}) => ({
  id: options.id || `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type: 'marker',
  elementType: options.elementType || 'generic',
  geometry: createGeoPoint(lng, lat, options.altitude),
  properties: {
    label: options.label || '',
    description: options.description || '',
    icon: options.icon || 'map-pin',
    color: options.color || '#3B82F6',
    ...options.properties
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

/**
 * Map polygon structure
 */
export const createMapPolygon = (coordinates, options = {}) => ({
  id: options.id || `polygon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type: 'polygon',
  elementType: options.elementType || 'generic',
  geometry: createGeoPolygon(coordinates),
  properties: {
    label: options.label || '',
    description: options.description || '',
    color: options.color || '#3B82F6',
    fillOpacity: options.fillOpacity || 0.1,
    strokeWidth: options.strokeWidth || 2,
    strokeStyle: options.strokeStyle || 'solid',
    area: options.area || null, // km²
    ...options.properties
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

/**
 * Map line structure
 */
export const createMapLine = (coordinates, options = {}) => ({
  id: options.id || `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type: 'line',
  elementType: options.elementType || 'generic',
  geometry: createGeoLine(coordinates),
  properties: {
    label: options.label || '',
    description: options.description || '',
    color: options.color || '#EF4444',
    strokeWidth: options.strokeWidth || 3,
    strokeStyle: options.strokeStyle || 'solid',
    arrowEnd: options.arrowEnd || false,
    distance: options.distance || null, // meters
    ...options.properties
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

/**
 * Obstacle structure (extends marker with specific properties)
 */
export const createObstacle = (lng, lat, options = {}) => ({
  ...createMapMarker(lng, lat, {
    elementType: 'obstacles',
    icon: 'alert-triangle',
    color: '#F59E0B',
    ...options
  }),
  obstacleType: options.obstacleType || 'other', // tower | wire | building | tree | terrain | other
  height: options.height || null, // meters AGL
  radius: options.radius || null, // meters (for buffer zone)
  lighted: options.lighted || false,
  notes: options.notes || ''
})

/**
 * Muster point structure (extends marker)
 */
export const createMusterPoint = (lng, lat, options = {}) => ({
  ...createMapMarker(lng, lat, {
    elementType: 'musterPoints',
    icon: 'flag',
    color: '#EF4444',
    ...options
  }),
  isPrimary: options.isPrimary || false,
  capacity: options.capacity || null,
  accessibility: options.accessibility || '', // Description of access
  notes: options.notes || ''
})

/**
 * Evacuation route structure (extends line)
 */
export const createEvacuationRoute = (coordinates, options = {}) => ({
  ...createMapLine(coordinates, {
    elementType: 'evacuationRoutes',
    color: '#EF4444',
    strokeWidth: 3,
    arrowEnd: true,
    ...options
  }),
  isPrimary: options.isPrimary || false,
  surfaceType: options.surfaceType || '', // paved | gravel | trail | etc.
  estimatedTime: options.estimatedTime || null, // minutes
  notes: options.notes || ''
})

// ============================================
// SITE STRUCTURE
// ============================================

/**
 * Default map data structure for a site
 * Contains all geospatial elements organized by section
 */
export const getDefaultSiteMapData = () => ({
  // Site Survey map elements
  siteSurvey: {
    siteLocation: null,        // Single marker
    operationsBoundary: null,  // Single polygon
    obstacles: []              // Array of obstacle markers
  },
  
  // Flight Plan map elements
  flightPlan: {
    launchPoint: null,         // Single marker
    recoveryPoint: null,       // Single marker
    pilotPosition: null,       // Single marker
    flightGeography: null,     // Single polygon (optional, can auto-calc)
    contingencyVolume: null,   // Single polygon (calculated from flight geography)
    groundRiskBuffer: null     // Single polygon (calculated from contingency volume)
  },
  
  // Emergency map elements
  emergency: {
    musterPoints: [],          // Array of muster point markers
    evacuationRoutes: []       // Array of evacuation route lines
  }
})

/**
 * Default site-specific site survey data
 */
export const getDefaultSiteSurveyData = () => ({
  // Location details (text-based, complements map marker)
  locationName: '',
  address: '',
  accessInstructions: '',
  
  // Airspace
  airspace: {
    classification: 'G',
    restrictions: [],
    nearestAerodrome: '',
    aerodromeDistance: null,
    aerodromeDirection: '',
    notams: []
  },
  
  // Population (SORA-aligned)
  population: {
    category: null,
    adjacentCategory: null,
    density: null,
    justification: '',
    assessmentDate: null
  },
  
  // Surroundings (text descriptions)
  surroundings: {
    terrain: '',
    vegetation: '',
    structures: '',
    waterFeatures: '',
    wildlife: ''
  },
  
  // Access
  access: {
    vehicleAccess: true,
    parkingAvailable: true,
    permissionsRequired: [],
    landOwner: '',
    accessNotes: ''
  },
  
  // Photos
  photos: [],
  
  // Survey metadata
  surveyDate: null,
  surveyedBy: null,
  notes: ''
})

/**
 * Default site-specific flight plan data
 */
export const getDefaultSiteFlightPlanData = () => ({
  // Operation parameters (SORA-relevant)
  operationType: 'VLOS',
  maxAltitudeAGL: 120,
  maxDistanceFromPilot: null,
  
  // Flight geography parameters (for auto-calculation)
  flightGeographyMethod: 'manual', // manual | auto
  contingencyBuffer: 15,           // seconds at max speed
  groundRiskBufferMethod: 'altitude', // altitude | fixed | manual
  
  // Site-specific weather considerations
  localWeatherFactors: '',
  
  // Site-specific contingencies
  siteContingencies: [],
  
  notes: ''
})

/**
 * Default site-specific emergency data
 */
export const getDefaultSiteEmergencyData = () => ({
  // Local emergency info
  localEmergencyNotes: '',
  nearestHospital: {
    name: '',
    address: '',
    distance: null,
    estimatedTime: null,
    phone: ''
  },
  nearestFireStation: {
    name: '',
    distance: null,
    phone: ''
  },
  
  // Site-specific procedures
  siteEvacuationProcedure: '',
  flyAwayProcedure: '',
  
  notes: ''
})

/**
 * Default site-specific SORA assessment data
 */
export const getDefaultSiteSoraData = () => ({
  // iGRC calculation (auto-populated from site data)
  populationCategory: null,      // From siteSurvey.population.category
  adjacentPopulation: null,      // From siteSurvey.population.adjacentCategory
  operationType: 'VLOS',         // From siteFlightPlan.operationType
  maxAltitudeAGL: 120,           // From siteFlightPlan.maxAltitudeAGL
  
  // UA Characteristics (inherited from project-level flight plan aircraft)
  uaCharacteristic: null,
  
  // Calculated values
  iGRC: null,
  fGRC: null,
  initialARC: null,
  residualARC: null,
  sail: null,
  
  // Site-specific mitigations (can override project defaults)
  mitigationOverrides: {},
  
  // Status
  calculationDate: null,
  isValid: false,
  validationNotes: ''
})

/**
 * Complete site structure
 */
export const createDefaultSite = (options = {}) => {
  const now = new Date().toISOString()
  return {
    // Identity
    id: options.id || `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: options.name || 'New Site',
    description: options.description || '',
    status: options.status || 'draft',
    order: options.order || 0,
    
    // Map data (geospatial elements)
    mapData: getDefaultSiteMapData(),
    
    // Section-specific data
    siteSurvey: getDefaultSiteSurveyData(),
    flightPlan: getDefaultSiteFlightPlanData(),
    emergency: getDefaultSiteEmergencyData(),
    
    // SORA assessment for this site
    soraAssessment: getDefaultSiteSoraData(),
    
    // Metadata
    createdAt: now,
    updatedAt: now,
    createdBy: options.createdBy || null
  }
}

/**
 * Copy/duplicate a site with new ID
 */
export const duplicateSite = (site, options = {}) => {
  const now = new Date().toISOString()
  const newId = `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Deep clone the site
  const clonedSite = JSON.parse(JSON.stringify(site))
  
  // Update identity and metadata
  return {
    ...clonedSite,
    id: newId,
    name: options.name || `${site.name} (Copy)`,
    status: 'draft',
    order: options.order ?? (site.order + 1),
    createdAt: now,
    updatedAt: now,
    createdBy: options.createdBy || null,
    
    // Regenerate IDs for all map elements
    mapData: regenerateMapElementIds(clonedSite.mapData)
  }
}

/**
 * Regenerate IDs for all map elements in a site's mapData
 */
const regenerateMapElementIds = (mapData) => {
  const regenerateId = (prefix) => 
    `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const processElement = (element, prefix) => {
    if (!element) return null
    return {
      ...element,
      id: regenerateId(prefix),
      updatedAt: new Date().toISOString()
    }
  }
  
  const processArray = (arr, prefix) => {
    if (!Array.isArray(arr)) return []
    return arr.map(el => processElement(el, prefix))
  }
  
  return {
    siteSurvey: {
      siteLocation: processElement(mapData?.siteSurvey?.siteLocation, 'marker'),
      operationsBoundary: processElement(mapData?.siteSurvey?.operationsBoundary, 'polygon'),
      obstacles: processArray(mapData?.siteSurvey?.obstacles, 'obstacle')
    },
    flightPlan: {
      launchPoint: processElement(mapData?.flightPlan?.launchPoint, 'marker'),
      recoveryPoint: processElement(mapData?.flightPlan?.recoveryPoint, 'marker'),
      pilotPosition: processElement(mapData?.flightPlan?.pilotPosition, 'marker'),
      flightGeography: processElement(mapData?.flightPlan?.flightGeography, 'polygon'),
      contingencyVolume: processElement(mapData?.flightPlan?.contingencyVolume, 'polygon'),
      groundRiskBuffer: processElement(mapData?.flightPlan?.groundRiskBuffer, 'polygon')
    },
    emergency: {
      musterPoints: processArray(mapData?.emergency?.musterPoints, 'muster'),
      evacuationRoutes: processArray(mapData?.emergency?.evacuationRoutes, 'route')
    }
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the center point of a polygon
 */
export const getPolygonCenter = (polygon) => {
  if (!polygon?.geometry?.coordinates?.[0]) return null
  
  const coords = polygon.geometry.coordinates[0]
  if (coords.length === 0) return null
  
  let sumLng = 0
  let sumLat = 0
  
  coords.forEach(([lng, lat]) => {
    sumLng += lng
    sumLat += lat
  })
  
  return {
    lng: sumLng / coords.length,
    lat: sumLat / coords.length
  }
}

/**
 * Get bounding box for a site's map elements
 */
export const getSiteBounds = (site) => {
  const bounds = {
    minLng: Infinity,
    maxLng: -Infinity,
    minLat: Infinity,
    maxLat: -Infinity
  }
  
  let hasCoordinates = false
  
  const processPoint = (point) => {
    if (!point?.geometry?.coordinates) return
    const [lng, lat] = point.geometry.coordinates
    bounds.minLng = Math.min(bounds.minLng, lng)
    bounds.maxLng = Math.max(bounds.maxLng, lng)
    bounds.minLat = Math.min(bounds.minLat, lat)
    bounds.maxLat = Math.max(bounds.maxLat, lat)
    hasCoordinates = true
  }
  
  const processPolygon = (polygon) => {
    if (!polygon?.geometry?.coordinates?.[0]) return
    polygon.geometry.coordinates[0].forEach(([lng, lat]) => {
      bounds.minLng = Math.min(bounds.minLng, lng)
      bounds.maxLng = Math.max(bounds.maxLng, lng)
      bounds.minLat = Math.min(bounds.minLat, lat)
      bounds.maxLat = Math.max(bounds.maxLat, lat)
      hasCoordinates = true
    })
  }
  
  const processLine = (line) => {
    if (!line?.geometry?.coordinates) return
    line.geometry.coordinates.forEach(([lng, lat]) => {
      bounds.minLng = Math.min(bounds.minLng, lng)
      bounds.maxLng = Math.max(bounds.maxLng, lng)
      bounds.minLat = Math.min(bounds.minLat, lat)
      bounds.maxLat = Math.max(bounds.maxLat, lat)
      hasCoordinates = true
    })
  }
  
  // Process all map elements
  const mapData = site?.mapData
  if (!mapData) return null
  
  // Site Survey
  processPoint(mapData.siteSurvey?.siteLocation)
  processPolygon(mapData.siteSurvey?.operationsBoundary)
  mapData.siteSurvey?.obstacles?.forEach(processPoint)
  
  // Flight Plan
  processPoint(mapData.flightPlan?.launchPoint)
  processPoint(mapData.flightPlan?.recoveryPoint)
  processPoint(mapData.flightPlan?.pilotPosition)
  processPolygon(mapData.flightPlan?.flightGeography)
  processPolygon(mapData.flightPlan?.contingencyVolume)
  processPolygon(mapData.flightPlan?.groundRiskBuffer)
  
  // Emergency
  mapData.emergency?.musterPoints?.forEach(processPoint)
  mapData.emergency?.evacuationRoutes?.forEach(processLine)
  
  if (!hasCoordinates) return null
  
  return [
    [bounds.minLng, bounds.minLat],
    [bounds.maxLng, bounds.maxLat]
  ]
}

/**
 * Get bounds for all sites in a project
 */
export const getProjectBounds = (sites) => {
  if (!Array.isArray(sites) || sites.length === 0) return null
  
  const bounds = {
    minLng: Infinity,
    maxLng: -Infinity,
    minLat: Infinity,
    maxLat: -Infinity
  }
  
  let hasCoordinates = false
  
  sites.forEach(site => {
    const siteBounds = getSiteBounds(site)
    if (siteBounds) {
      bounds.minLng = Math.min(bounds.minLng, siteBounds[0][0])
      bounds.maxLng = Math.max(bounds.maxLng, siteBounds[1][0])
      bounds.minLat = Math.min(bounds.minLat, siteBounds[0][1])
      bounds.maxLat = Math.max(bounds.maxLat, siteBounds[1][1])
      hasCoordinates = true
    }
  })
  
  if (!hasCoordinates) return null
  
  return [
    [bounds.minLng, bounds.minLat],
    [bounds.maxLng, bounds.maxLat]
  ]
}

/**
 * Calculate distance between two points (Haversine formula)
 * Returns distance in meters
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371000 // Earth's radius in meters
  
  const lat1 = point1.lat * Math.PI / 180
  const lat2 = point2.lat * Math.PI / 180
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180
  const deltaLng = (point2.lng - point1.lng) * Math.PI / 180
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

/**
 * Calculate area of a polygon (in square meters)
 * Uses the Shoelace formula with geodetic corrections
 */
export const calculatePolygonArea = (polygon) => {
  if (!polygon?.geometry?.coordinates?.[0]) return null
  
  const coords = polygon.geometry.coordinates[0]
  if (coords.length < 3) return null
  
  // Convert to radians and calculate
  const R = 6371000 // Earth's radius in meters
  let area = 0
  
  for (let i = 0; i < coords.length - 1; i++) {
    const [lng1, lat1] = coords[i]
    const [lng2, lat2] = coords[i + 1]
    
    const lat1Rad = lat1 * Math.PI / 180
    const lat2Rad = lat2 * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    
    area += dLng * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad))
  }
  
  area = Math.abs(area * R * R / 2)
  return area
}

/**
 * Validate site data completeness
 */
export const validateSiteCompleteness = (site) => {
  const issues = []
  
  // Check site survey
  if (!site?.mapData?.siteSurvey?.siteLocation) {
    issues.push({ section: 'siteSurvey', field: 'siteLocation', message: 'Site location not set' })
  }
  if (!site?.siteSurvey?.population?.category) {
    issues.push({ section: 'siteSurvey', field: 'population', message: 'Population category not assessed' })
  }
  
  // Check flight plan
  if (!site?.mapData?.flightPlan?.launchPoint) {
    issues.push({ section: 'flightPlan', field: 'launchPoint', message: 'Launch point not set' })
  }
  if (!site?.mapData?.flightPlan?.recoveryPoint) {
    issues.push({ section: 'flightPlan', field: 'recoveryPoint', message: 'Recovery point not set' })
  }
  
  // Check emergency
  if (!site?.mapData?.emergency?.musterPoints?.length) {
    issues.push({ section: 'emergency', field: 'musterPoints', message: 'No muster points defined' })
  }
  
  return {
    isComplete: issues.length === 0,
    issues,
    completeness: {
      siteSurvey: !issues.some(i => i.section === 'siteSurvey'),
      flightPlan: !issues.some(i => i.section === 'flightPlan'),
      emergency: !issues.some(i => i.section === 'emergency')
    }
  }
}

/**
 * Get site summary statistics
 */
export const getSiteStats = (site) => {
  const mapData = site?.mapData || {}
  
  return {
    hasLocation: !!mapData.siteSurvey?.siteLocation,
    hasBoundary: !!mapData.siteSurvey?.operationsBoundary,
    obstacleCount: mapData.siteSurvey?.obstacles?.length || 0,
    hasLaunchPoint: !!mapData.flightPlan?.launchPoint,
    hasRecoveryPoint: !!mapData.flightPlan?.recoveryPoint,
    hasPilotPosition: !!mapData.flightPlan?.pilotPosition,
    hasFlightGeography: !!mapData.flightPlan?.flightGeography,
    musterPointCount: mapData.emergency?.musterPoints?.length || 0,
    evacuationRouteCount: mapData.emergency?.evacuationRoutes?.length || 0,
    boundaryArea: mapData.siteSurvey?.operationsBoundary 
      ? calculatePolygonArea(mapData.siteSurvey.operationsBoundary) 
      : null
  }
}

export default {
  MAX_SITES_PER_PROJECT,
  SITE_STATUS,
  MAP_LAYERS,
  MAP_ELEMENT_STYLES,
  MAP_BASEMAPS,
  POPULATION_CATEGORIES,
  createGeoPoint,
  createGeoPolygon,
  createGeoLine,
  createMapMarker,
  createMapPolygon,
  createMapLine,
  createObstacle,
  createMusterPoint,
  createEvacuationRoute,
  getDefaultSiteMapData,
  getDefaultSiteSurveyData,
  getDefaultSiteFlightPlanData,
  getDefaultSiteEmergencyData,
  getDefaultSiteSoraData,
  createDefaultSite,
  duplicateSite,
  getPolygonCenter,
  getSiteBounds,
  getProjectBounds,
  calculateDistance,
  calculatePolygonArea,
  validateSiteCompleteness,
  getSiteStats
}
