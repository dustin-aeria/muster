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

import buffer from '@turf/buffer'
import { polygon as turfPolygon } from '@turf/helpers'

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

// Map overlay layers (togglable reference layers)
export const MAP_OVERLAY_LAYERS = {
  adminBoundaries: {
    id: 'adminBoundaries',
    label: 'Province/State Borders',
    description: 'Country and province/state boundaries',
    icon: 'landmark'
  },
  municipalBoundaries: {
    id: 'municipalBoundaries',
    label: 'Municipal Boundaries',
    description: 'City, town, and district boundaries',
    icon: 'building',
    comingSoon: true
  },
  airspace: {
    id: 'airspace',
    label: 'Airspace Zones',
    description: 'Controlled airspace from OpenAIP',
    icon: 'plane',
    tilesetId: 'dustinwales.2qdxi73r',
    sourceLayer: 'ca_asp-70vtd0',
    hasSubLayers: true,
    // OpenAIP uses numeric icaoClass: 0=A, 1=B, 2=C, 3=D, 4=E, 5=F, 6=G
    subLayers: {
      0: { label: 'Class A', color: '#DC2626', description: 'High altitude (18,000ft+)' },
      1: { label: 'Class B', color: '#EA580C', description: 'Major airports' },
      2: { label: 'Class C', color: '#CA8A04', description: 'Busy airports with tower' },
      3: { label: 'Class D', color: '#2563EB', description: 'Airports with tower' },
      4: { label: 'Class E', color: '#7C3AED', description: 'Controlled airspace' },
      5: { label: 'Class F', color: '#0D9488', description: 'Advisory/restricted' },
      6: { label: 'Class G', color: '#6B7280', description: 'Uncontrolled airspace' }
    }
  },
  airports: {
    id: 'airports',
    label: 'Airports',
    description: 'Canadian airports from OpenAIP',
    icon: 'plane',
    tilesetId: 'dustinwales.4uq7nsfr',
    sourceLayer: 'ca_apt-03h2t3'
  },
  populationDensity: {
    id: 'populationDensity',
    label: 'Population Density',
    description: 'Population heatmap - requires Statistics Canada data',
    icon: 'users',
    comingSoon: true
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
// MISSION TYPES
// ============================================

export const MISSION_TYPES = {
  mapping: { id: 'mapping', label: 'Area Mapping', description: 'Survey a defined area with grid pattern' },
  corridor: { id: 'corridor', label: 'Corridor/Linear', description: 'Follow a linear path (pipeline, road, etc.)' },
  point: { id: 'point', label: 'Point Inspection', description: 'Inspect a specific point or structure' },
  perimeter: { id: 'perimeter', label: 'Perimeter', description: 'Fly around the boundary of an area' },
  freeform: { id: 'freeform', label: 'Freeform', description: 'Custom flight path' }
}

/**
 * Create a waypoint for flight path
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {number} altitude - Altitude in meters AGL
 * @param {Object} options - Additional waypoint options
 */
export const createWaypoint = (lng, lat, altitude, options = {}) => ({
  id: options.id || `wp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  coordinates: [lng, lat, altitude],
  order: options.order ?? 0,
  speed: options.speed || null,        // m/s, null = use mission default
  heading: options.heading || null,    // degrees, null = auto
  action: options.action || null,      // hover | photo | video | etc.
  actionDuration: options.actionDuration || null, // seconds
  notes: options.notes || ''
})

/**
 * Mission structure - THE single source of truth for flight paths
 * Each mission contains its own flight path with waypoints
 *
 * @param {Object} options - Mission configuration
 */
export const createMission = (options = {}) => {
  const now = new Date().toISOString()
  return {
    id: options.id || `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: options.name || 'New Mission',
    type: options.type || 'freeform',         // mapping | corridor | point | perimeter | freeform

    // Mission-specific geography (optional - for area-based missions)
    geography: options.geography || null,      // GeoJSON polygon for area missions

    // Default altitude for this mission
    altitude: options.altitude || 80,          // meters AGL

    // Flight path - THE waypoints for this mission
    flightPath: {
      waypoints: options.waypoints || [],      // Array of waypoint objects
      corridorBuffer: options.corridorBuffer || null,  // meters (for corridor missions)
      lastGenerated: options.lastGenerated || null     // timestamp of auto-generation
    },

    // Mission settings
    settings: {
      speed: options.speed || 10,              // m/s default speed
      overlapForward: options.overlapForward || 80,    // % for mapping missions
      overlapSide: options.overlapSide || 70,          // % for mapping missions
      gimbalPitch: options.gimbalPitch || -90,         // degrees
      photoInterval: options.photoInterval || null,    // seconds or distance
      ...options.settings
    },

    // Status
    status: options.status || 'draft',         // draft | ready | completed

    // Metadata
    createdAt: now,
    updatedAt: now,
    createdBy: options.createdBy || null
  }
}

/**
 * Generate waypoints from a polygon for area mapping
 * (Placeholder - actual implementation would calculate grid pattern)
 */
export const generateMappingWaypoints = (polygon, altitude, settings = {}) => {
  // This would be implemented to generate a lawnmower pattern
  // For now, returns the polygon corners as waypoints
  if (!polygon?.geometry?.coordinates?.[0]) return []

  const coords = polygon.geometry.coordinates[0]
  return coords.slice(0, -1).map((coord, index) =>
    createWaypoint(coord[0], coord[1], altitude, { order: index })
  )
}

/**
 * Generate waypoints from a line for corridor missions
 */
export const generateCorridorWaypoints = (lineCoords, altitude, settings = {}) => {
  if (!Array.isArray(lineCoords) || lineCoords.length < 2) return []

  return lineCoords.map((coord, index) =>
    createWaypoint(coord[0], coord[1], altitude, { order: index })
  )
}

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
  
  // NOTE: Airspace moved to flightPlan as it's flight-relevant, not ground condition
  
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
  // Site-specific aircraft assignment
  aircraft: [],              // Array of aircraft IDs assigned to this site
  primaryAircraftId: null,   // ID of primary aircraft for this site (for SORA)

  // Missions - THE source of truth for all flight paths
  // Each mission contains its own flight path with waypoints
  missions: [],              // Array of mission objects (see createMission helper)
  
  // Operation parameters (SORA-relevant)
  operationType: 'VLOS',       // VLOS | EVLOS | BVLOS
  maxAltitudeAGL: 120,         // meters
  maxDistanceFromPilot: null,  // meters
  flightDuration: null,        // minutes per flight
  totalFlights: 1,             // number of flights planned
  
  // Airspace (moved from siteSurvey - flight-relevant)
  airspace: {
    classification: 'G',        // Class A, B, C, D, E, F, G
    controlled: false,          // Is this controlled airspace?
    restrictions: [],           // Any airspace restrictions
    nearestAerodrome: '',
    aerodromeDistance: null,    // km
    aerodromeDirection: '',     // e.g., 'NE', 'SW'
    notamRequired: false,
    atcCoordinationRequired: false,
    notams: [],                 // Active NOTAMs
    notes: ''
  },
  
  // Flight geography parameters
  areaType: null,                        // point | corridor | area
  flightGeographyMethod: 'manual',       // inside-out | reverse | manual
  contingencyBuffer: null,               // meters (typically maxSpeed × 15s)
  groundRiskBufferMethod: 'altitude',    // altitude | ballistic | fixed | containment
  groundRiskBuffer: null,                // meters (auto-calculated or manual)
  adjacentAreaConsidered: false,         // SORA Step 8 assessment done
  
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
  adjacentAreaPopulation: null,  // From siteSurvey.population.adjacentCategory
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
  
  // Containment & Adjacent Area (Step 8)
  containment: {
    method: 'none',           // none | procedural | sw_geofence | hw_geofence | flight_termination | parachute_fts
    evidence: ''              // Reference to containment evidence
  },
  
  // Site-specific mitigations (can override project defaults)
  mitigationOverrides: {},
  
  // OSO compliance tracking
  osoCompliance: {},          // { 'OSO-01': { robustness: 'low', evidence: '...' }, ... }
  
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

/**
 * Generate a buffer polygon around a source polygon
 * @param {Object} sourcePolygon - The source polygon with geometry.coordinates
 * @param {number} bufferDistance - Buffer distance in meters
 * @param {string} elementType - The element type for the new polygon (e.g., 'contingencyVolume', 'groundRiskBuffer')
 * @returns {Object|null} - New polygon object or null if generation fails
 */
export const generateBufferPolygon = (sourcePolygon, bufferDistance, elementType) => {
  if (!sourcePolygon?.geometry?.coordinates?.[0] || bufferDistance <= 0) {
    return null
  }

  try {
    // Create turf polygon from source
    const turfPoly = turfPolygon(sourcePolygon.geometry.coordinates)

    // Generate buffer (turf uses kilometers, so convert from meters)
    const buffered = buffer(turfPoly, bufferDistance / 1000, { units: 'kilometers' })

    if (!buffered?.geometry?.coordinates) {
      return null
    }

    // Create the new polygon element
    const now = new Date().toISOString()
    return {
      id: `polygon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      elementType,
      geometry: buffered.geometry,
      properties: {
        label: MAP_ELEMENT_STYLES[elementType]?.label || elementType,
        bufferDistance,
        sourcePolygonId: sourcePolygon.id,
        generatedAt: now
      },
      createdAt: now,
      updatedAt: now
    }
  } catch (err) {
    console.error('Error generating buffer polygon:', err)
    return null
  }
}

/**
 * Generate contingency volume from flight geography
 * @param {Object} flightGeography - The flight geography polygon
 * @param {number} bufferDistance - Buffer distance in meters (typically maxSpeed × 15s)
 * @returns {Object|null} - Contingency volume polygon or null
 */
export const generateContingencyVolume = (flightGeography, bufferDistance) => {
  return generateBufferPolygon(flightGeography, bufferDistance, 'contingencyVolume')
}

/**
 * Generate ground risk buffer from contingency volume (or flight geography if CV not available)
 * @param {Object} sourcePolygon - The contingency volume or flight geography polygon
 * @param {number} bufferDistance - Buffer distance in meters (typically max altitude for 1:1)
 * @returns {Object|null} - Ground risk buffer polygon or null
 */
export const generateGroundRiskBuffer = (sourcePolygon, bufferDistance) => {
  return generateBufferPolygon(sourcePolygon, bufferDistance, 'groundRiskBuffer')
}

/**
 * Generate both SORA volumes from flight geography
 * @param {Object} flightGeography - The flight geography polygon
 * @param {number} contingencyBuffer - Contingency buffer distance in meters
 * @param {number} groundRiskBuffer - Ground risk buffer distance in meters
 * @returns {Object} - Object with contingencyVolume and groundRiskBuffer polygons
 */
export const generateSORAVolumes = (flightGeography, contingencyBuffer, groundRiskBuffer) => {
  const contingencyVolume = generateContingencyVolume(flightGeography, contingencyBuffer)

  // Ground risk buffer is added to the contingency volume (not flight geography)
  // If contingency volume generation failed, fall back to flight geography
  const sourceForGRB = contingencyVolume || flightGeography
  const grb = generateGroundRiskBuffer(sourceForGRB, groundRiskBuffer)

  return {
    contingencyVolume,
    groundRiskBuffer: grb
  }
}

export default {
  MAX_SITES_PER_PROJECT,
  SITE_STATUS,
  MAP_LAYERS,
  MAP_ELEMENT_STYLES,
  MAP_BASEMAPS,
  MAP_OVERLAY_LAYERS,
  POPULATION_CATEGORIES,
  MISSION_TYPES,
  createGeoPoint,
  createGeoPolygon,
  createGeoLine,
  createMapMarker,
  createMapPolygon,
  createMapLine,
  createObstacle,
  createMusterPoint,
  createEvacuationRoute,
  createWaypoint,
  createMission,
  generateMappingWaypoints,
  generateCorridorWaypoints,
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
  getSiteStats,
  generateBufferPolygon,
  generateContingencyVolume,
  generateGroundRiskBuffer,
  generateSORAVolumes
}
