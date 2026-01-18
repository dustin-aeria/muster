/**
 * siteMigration.js
 * Migration utilities for converting existing single-site projects
 * to the new multi-site structure.
 * 
 * Handles backward compatibility and data transformation.
 * 
 * @location src/lib/siteMigration.js
 * @action NEW
 */

import {
  createDefaultSite,
  createMapMarker,
  createMapPolygon,
  createObstacle,
  createMusterPoint,
  createEvacuationRoute,
  getDefaultSiteMapData,
  getDefaultSiteSurveyData,
  getDefaultSiteFlightPlanData,
  getDefaultSiteEmergencyData,
  getDefaultSiteSoraData,
  MAP_ELEMENT_STYLES
} from './mapDataStructures'

// ============================================
// MIGRATION VERSION TRACKING
// ============================================

export const CURRENT_PROJECT_VERSION = '2.0.0' // Multi-site version

/**
 * Check if a project needs migration to multi-site structure
 */
export const needsMultiSiteMigration = (project) => {
  if (!project) return false
  
  // If project already has sites array with valid structure, no migration needed
  if (Array.isArray(project.sites) && project.sites.length > 0) {
    // Check if first site has the new structure
    const firstSite = project.sites[0]
    if (firstSite?.mapData && firstSite?.siteSurvey !== undefined) {
      return false
    }
  }
  
  // Check for legacy single-site data
  const hasLegacySiteSurvey = project.siteSurvey && (
    project.siteSurvey.location ||
    project.siteSurvey.population ||
    project.siteSurvey.obstacles?.length > 0
  )
  
  const hasLegacyFlightPlan = project.flightPlan && (
    project.flightPlan.launchRecovery ||
    project.flightPlan.operationType
  )
  
  const hasLegacyEmergency = project.emergencyPlan && (
    project.emergencyPlan.musterPoints?.length > 0 ||
    project.emergencyPlan.evacuationRoutes?.length > 0
  )
  
  return hasLegacySiteSurvey || hasLegacyFlightPlan || hasLegacyEmergency
}

/**
 * Get the current migration status of a project
 */
export const getProjectMigrationStatus = (project) => {
  if (!project) {
    return { status: 'invalid', message: 'No project data' }
  }
  
  // Already migrated
  if (Array.isArray(project.sites) && project.sites.length > 0) {
    const firstSite = project.sites[0]
    if (firstSite?.mapData) {
      return { 
        status: 'current', 
        message: 'Project uses multi-site structure',
        version: project.projectVersion || CURRENT_PROJECT_VERSION,
        siteCount: project.sites.length
      }
    }
  }
  
  // Has legacy data that needs migration
  if (needsMultiSiteMigration(project)) {
    return {
      status: 'needs_migration',
      message: 'Project has legacy single-site data that can be migrated',
      hasLegacyData: {
        siteSurvey: !!project.siteSurvey?.location || !!project.siteSurvey?.population?.category,
        flightPlan: !!project.flightPlan?.operationType,
        emergency: project.emergencyPlan?.musterPoints?.length > 0
      }
    }
  }
  
  // New project without any site data
  return {
    status: 'new',
    message: 'New project without site data'
  }
}

// ============================================
// COORDINATE CONVERSION HELPERS
// ============================================

/**
 * Convert legacy location object to GeoJSON point
 * Handles various legacy formats
 */
const convertLegacyLocation = (location) => {
  if (!location) return null
  
  let lng, lat
  
  // Format: { lat, lng }
  if (location.lat !== undefined && location.lng !== undefined) {
    lat = parseFloat(location.lat)
    lng = parseFloat(location.lng)
  }
  // Format: { latitude, longitude }
  else if (location.latitude !== undefined && location.longitude !== undefined) {
    lat = parseFloat(location.latitude)
    lng = parseFloat(location.longitude)
  }
  // Format: { coordinates: { lat, lng } }
  else if (location.coordinates?.lat !== undefined) {
    lat = parseFloat(location.coordinates.lat)
    lng = parseFloat(location.coordinates.lng)
  }
  // Format: [lng, lat] array (GeoJSON style)
  else if (Array.isArray(location) && location.length >= 2) {
    lng = parseFloat(location[0])
    lat = parseFloat(location[1])
  }
  // Format: "lat, lng" string
  else if (typeof location === 'string' && location.includes(',')) {
    const parts = location.split(',').map(s => parseFloat(s.trim()))
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      lat = parts[0]
      lng = parts[1]
    }
  }
  
  if (isNaN(lat) || isNaN(lng)) return null
  
  return { lng, lat }
}

/**
 * Convert legacy polygon coordinates to GeoJSON format
 */
const convertLegacyPolygon = (coordinates) => {
  if (!coordinates) return null
  if (!Array.isArray(coordinates)) return null
  
  // Already in GeoJSON format [[lng, lat], ...]
  if (Array.isArray(coordinates[0]) && coordinates[0].length === 2) {
    // Ensure polygon is closed
    const first = coordinates[0]
    const last = coordinates[coordinates.length - 1]
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coordinates = [...coordinates, first]
    }
    return coordinates
  }
  
  // Format: [{ lat, lng }, ...]
  if (coordinates[0]?.lat !== undefined) {
    const converted = coordinates.map(c => [
      parseFloat(c.lng || c.longitude),
      parseFloat(c.lat || c.latitude)
    ])
    // Ensure closed
    const first = converted[0]
    const last = converted[converted.length - 1]
    if (first[0] !== last[0] || first[1] !== last[1]) {
      converted.push([...first])
    }
    return converted
  }
  
  return null
}

// ============================================
// MIGRATION FUNCTIONS
// ============================================

/**
 * Migrate legacy site survey data to new structure
 */
const migrateSiteSurvey = (legacySiteSurvey, siteName) => {
  const mapData = getDefaultSiteMapData()
  const surveyData = getDefaultSiteSurveyData()
  
  if (!legacySiteSurvey) {
    return { mapData, surveyData }
  }
  
  // Migrate location to map marker
  const location = legacySiteSurvey.location
  if (location) {
    const coords = convertLegacyLocation(location)
    if (coords) {
      mapData.siteSurvey.siteLocation = createMapMarker(coords.lng, coords.lat, {
        elementType: 'siteLocation',
        label: siteName || location.name || 'Site Location',
        description: location.address || location.description || '',
        ...MAP_ELEMENT_STYLES.siteLocation
      })
    }
    
    // Copy text data
    surveyData.locationName = location.name || ''
    surveyData.address = location.address || location.description || ''
    surveyData.accessInstructions = location.accessInstructions || ''
  }
  
  // Migrate boundary if exists
  if (legacySiteSurvey.boundary) {
    const boundaryCoords = convertLegacyPolygon(legacySiteSurvey.boundary)
    if (boundaryCoords) {
      mapData.siteSurvey.operationsBoundary = createMapPolygon(boundaryCoords, {
        elementType: 'operationsBoundary',
        label: 'Operations Boundary',
        ...MAP_ELEMENT_STYLES.operationsBoundary
      })
    }
  }
  
  // Migrate obstacles
  if (Array.isArray(legacySiteSurvey.obstacles)) {
    mapData.siteSurvey.obstacles = legacySiteSurvey.obstacles
      .map(obs => {
        // Try to get coordinates from obstacle
        let coords = null
        if (obs.location) {
          coords = convertLegacyLocation(obs.location)
        } else if (obs.lat !== undefined && obs.lng !== undefined) {
          coords = { lat: obs.lat, lng: obs.lng }
        } else if (obs.coordinates) {
          coords = convertLegacyLocation(obs.coordinates)
        }
        
        if (!coords) return null
        
        return createObstacle(coords.lng, coords.lat, {
          obstacleType: obs.type || 'other',
          height: obs.height || null,
          label: obs.type || 'Obstacle',
          description: obs.description || obs.notes || '',
          notes: obs.notes || ''
        })
      })
      .filter(Boolean)
  }
  
  // Migrate airspace
  if (legacySiteSurvey.airspace) {
    surveyData.airspace = {
      ...surveyData.airspace,
      classification: legacySiteSurvey.airspace.classification || 'G',
      restrictions: legacySiteSurvey.airspace.restrictions || [],
      nearestAerodrome: legacySiteSurvey.airspace.nearestAerodrome || '',
      aerodromeDistance: legacySiteSurvey.airspace.aerodromeDistance || null
    }
  }
  
  // Migrate population
  if (legacySiteSurvey.population) {
    surveyData.population = {
      category: legacySiteSurvey.population.category || null,
      adjacentCategory: legacySiteSurvey.population.adjacentCategory || null,
      density: legacySiteSurvey.population.density || null,
      justification: legacySiteSurvey.population.justification || '',
      assessmentDate: legacySiteSurvey.population.assessmentDate || null
    }
  }
  
  // Migrate surroundings
  if (legacySiteSurvey.surroundings) {
    surveyData.surroundings = {
      ...surveyData.surroundings,
      ...legacySiteSurvey.surroundings
    }
  }
  
  // Migrate access
  if (legacySiteSurvey.access) {
    surveyData.access = {
      ...surveyData.access,
      vehicleAccess: legacySiteSurvey.access.vehicleAccess ?? true,
      parkingAvailable: legacySiteSurvey.access.parkingAvailable ?? true,
      permissionsRequired: legacySiteSurvey.access.permissionsRequired || [],
      accessNotes: legacySiteSurvey.access.accessNotes || ''
    }
  }
  
  // Migrate photos
  surveyData.photos = legacySiteSurvey.photos || []
  surveyData.notes = legacySiteSurvey.notes || ''
  surveyData.surveyDate = legacySiteSurvey.surveyDate || null
  surveyData.surveyedBy = legacySiteSurvey.surveyedBy || null
  
  return { mapData, surveyData }
}

/**
 * Migrate legacy flight plan data to new structure
 */
const migrateFlightPlan = (legacyFlightPlan, existingMapData) => {
  const mapData = existingMapData || getDefaultSiteMapData()
  const flightPlanData = getDefaultSiteFlightPlanData()
  
  if (!legacyFlightPlan) {
    return { mapData, flightPlanData }
  }
  
  // Migrate launch/recovery points
  if (legacyFlightPlan.launchRecovery) {
    const lr = legacyFlightPlan.launchRecovery
    
    // Launch point
    if (lr.launchPoint) {
      const coords = convertLegacyLocation(lr.launchPoint)
      if (coords) {
        mapData.flightPlan.launchPoint = createMapMarker(coords.lng, coords.lat, {
          elementType: 'launchPoint',
          label: 'Launch Point',
          description: lr.launchPoint.description || '',
          ...MAP_ELEMENT_STYLES.launchPoint
        })
      }
    }
    
    // Recovery point
    if (lr.recoveryPoint) {
      const coords = convertLegacyLocation(lr.recoveryPoint)
      if (coords) {
        mapData.flightPlan.recoveryPoint = createMapMarker(coords.lng, coords.lat, {
          elementType: 'recoveryPoint',
          label: 'Recovery Point',
          description: lr.recoveryPoint.description || '',
          ...MAP_ELEMENT_STYLES.recoveryPoint
        })
      }
    }
  }
  
  // Also check for direct launch/recovery fields
  if (legacyFlightPlan.launchPoint) {
    const coords = convertLegacyLocation(legacyFlightPlan.launchPoint)
    if (coords && !mapData.flightPlan.launchPoint) {
      mapData.flightPlan.launchPoint = createMapMarker(coords.lng, coords.lat, {
        elementType: 'launchPoint',
        label: 'Launch Point',
        ...MAP_ELEMENT_STYLES.launchPoint
      })
    }
  }
  
  if (legacyFlightPlan.recoveryPoint) {
    const coords = convertLegacyLocation(legacyFlightPlan.recoveryPoint)
    if (coords && !mapData.flightPlan.recoveryPoint) {
      mapData.flightPlan.recoveryPoint = createMapMarker(coords.lng, coords.lat, {
        elementType: 'recoveryPoint',
        label: 'Recovery Point',
        ...MAP_ELEMENT_STYLES.recoveryPoint
      })
    }
  }
  
  // Migrate flight geography/boundary if exists
  if (legacyFlightPlan.flightGeography || legacyFlightPlan.flightBoundary) {
    const boundaryCoords = convertLegacyPolygon(
      legacyFlightPlan.flightGeography || legacyFlightPlan.flightBoundary
    )
    if (boundaryCoords) {
      mapData.flightPlan.flightGeography = createMapPolygon(boundaryCoords, {
        elementType: 'flightGeography',
        label: 'Flight Geography',
        ...MAP_ELEMENT_STYLES.flightGeography
      })
    }
  }
  
  // Migrate operation parameters
  flightPlanData.operationType = legacyFlightPlan.operationType || 'VLOS'
  flightPlanData.maxAltitudeAGL = legacyFlightPlan.maxAltitudeAGL || 120
  flightPlanData.maxDistanceFromPilot = legacyFlightPlan.maxDistanceFromPilot || null
  
  return { mapData, flightPlanData }
}

/**
 * Migrate legacy emergency plan data to new structure
 */
const migrateEmergencyPlan = (legacyEmergencyPlan, existingMapData) => {
  const mapData = existingMapData || getDefaultSiteMapData()
  const emergencyData = getDefaultSiteEmergencyData()
  
  if (!legacyEmergencyPlan) {
    return { mapData, emergencyData }
  }
  
  // Migrate muster points
  if (Array.isArray(legacyEmergencyPlan.musterPoints)) {
    mapData.emergency.musterPoints = legacyEmergencyPlan.musterPoints
      .map((point, index) => {
        let coords = null
        
        if (point.location) {
          coords = convertLegacyLocation(point.location)
        } else if (point.lat !== undefined && point.lng !== undefined) {
          coords = { lat: point.lat, lng: point.lng }
        } else if (point.coordinates) {
          coords = convertLegacyLocation(point.coordinates)
        }
        
        if (!coords) return null
        
        return createMusterPoint(coords.lng, coords.lat, {
          isPrimary: index === 0 || point.isPrimary || false,
          label: point.name || point.label || `Muster Point ${index + 1}`,
          description: point.description || '',
          notes: point.notes || ''
        })
      })
      .filter(Boolean)
  }
  
  // Migrate evacuation routes
  if (Array.isArray(legacyEmergencyPlan.evacuationRoutes)) {
    mapData.emergency.evacuationRoutes = legacyEmergencyPlan.evacuationRoutes
      .map((route, index) => {
        let coordinates = null
        
        if (route.path) {
          coordinates = convertLegacyPolygon(route.path)
        } else if (route.coordinates) {
          coordinates = convertLegacyPolygon(route.coordinates)
        } else if (Array.isArray(route) && route.length > 0) {
          coordinates = convertLegacyPolygon(route)
        }
        
        if (!coordinates || coordinates.length < 2) return null
        
        // For lines, we don't need it closed
        if (coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
            coordinates[0][1] === coordinates[coordinates.length - 1][1]) {
          coordinates = coordinates.slice(0, -1)
        }
        
        return createEvacuationRoute(coordinates, {
          isPrimary: index === 0 || route.isPrimary || false,
          label: route.name || route.label || `Evacuation Route ${index + 1}`,
          description: route.description || '',
          notes: route.notes || ''
        })
      })
      .filter(Boolean)
  }
  
  // Migrate hospital info
  if (legacyEmergencyPlan.hospital) {
    emergencyData.nearestHospital = {
      name: legacyEmergencyPlan.hospital.name || '',
      address: legacyEmergencyPlan.hospital.address || '',
      distance: legacyEmergencyPlan.hospital.distance || null,
      estimatedTime: legacyEmergencyPlan.hospital.estimatedTime || null,
      phone: legacyEmergencyPlan.hospital.phone || ''
    }
  }
  
  // Migrate procedures
  emergencyData.siteEvacuationProcedure = legacyEmergencyPlan.procedures?.evacuation || ''
  emergencyData.flyAwayProcedure = legacyEmergencyPlan.procedures?.flyAway || ''
  emergencyData.localEmergencyNotes = legacyEmergencyPlan.notes || ''
  
  return { mapData, emergencyData }
}

/**
 * Migrate legacy SORA assessment to site-specific structure
 */
const migrateSoraAssessment = (legacySora, siteSurveyData, siteFlightPlanData) => {
  const soraData = getDefaultSiteSoraData()
  
  // Pull from site survey
  if (siteSurveyData?.population) {
    soraData.populationCategory = siteSurveyData.population.category
    soraData.adjacentPopulation = siteSurveyData.population.adjacentCategory
  }
  
  // Pull from site flight plan
  if (siteFlightPlanData) {
    soraData.operationType = siteFlightPlanData.operationType || 'VLOS'
    soraData.maxAltitudeAGL = siteFlightPlanData.maxAltitudeAGL || 120
  }
  
  // If we have legacy SORA data, use it
  if (legacySora) {
    soraData.uaCharacteristic = legacySora.uaCharacteristic || null
    soraData.iGRC = legacySora.iGRC || null
    soraData.fGRC = legacySora.fGRC || null
    soraData.initialARC = legacySora.initialARC || null
    soraData.residualARC = legacySora.residualARC || null
    soraData.sail = legacySora.sail || null
    
    // Copy mitigations if different from defaults
    if (legacySora.mitigations) {
      soraData.mitigationOverrides = legacySora.mitigations
    }
  }
  
  return soraData
}

// ============================================
// MAIN MIGRATION FUNCTION
// ============================================

/**
 * Migrate a project from legacy single-site structure to multi-site structure
 * 
 * @param {Object} project - The project to migrate
 * @param {Object} options - Migration options
 * @returns {Object} - Migrated project
 */
export const migrateToMultiSite = (project, options = {}) => {
  if (!project) {
    throw new Error('No project provided for migration')
  }
  
  // Check if migration is needed
  const migrationStatus = getProjectMigrationStatus(project)
  
  if (migrationStatus.status === 'current') {
    // Already migrated, return as-is
    return project
  }
  
  // Create a deep copy to avoid mutating the original
  const migratedProject = JSON.parse(JSON.stringify(project))
  
  // Determine site name
  const siteName = options.siteName || 
                   project.siteSurvey?.location?.name ||
                   project.name ||
                   'Primary Site'
  
  // Migrate each section
  const { mapData: siteSurveyMapData, surveyData } = migrateSiteSurvey(
    project.siteSurvey,
    siteName
  )
  
  const { mapData: flightPlanMapData, flightPlanData } = migrateFlightPlan(
    project.flightPlan,
    siteSurveyMapData
  )
  
  const { mapData: emergencyMapData, emergencyData } = migrateEmergencyPlan(
    project.emergencyPlan,
    flightPlanMapData
  )
  
  // Migrate SORA
  const soraData = migrateSoraAssessment(
    project.soraAssessment,
    surveyData,
    flightPlanData
  )
  
  // Create the site object
  const site = {
    id: `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: siteName,
    description: project.description || '',
    status: 'draft',
    order: 0,
    
    // Map data (combined from all sections)
    mapData: emergencyMapData, // This contains all accumulated map data
    
    // Section-specific data
    siteSurvey: surveyData,
    flightPlan: flightPlanData,
    emergency: emergencyData,
    
    // SORA assessment for this site
    soraAssessment: soraData,
    
    // Metadata
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: null,
    migratedFromLegacy: true
  }
  
  // Update project structure
  migratedProject.sites = [site]
  migratedProject.projectVersion = CURRENT_PROJECT_VERSION
  migratedProject.migratedAt = new Date().toISOString()
  
  // Keep legacy data for reference (can be removed later)
  migratedProject._legacyData = {
    siteSurvey: project.siteSurvey,
    flightPlan: project.flightPlan,
    emergencyPlan: project.emergencyPlan,
    soraAssessment: project.soraAssessment
  }
  
  // Update project-level structures to only contain non-site-specific data
  // Keep aircraft at project level (shared across sites)
  migratedProject.flightPlan = {
    aircraft: project.flightPlan?.aircraft || [],
    weatherMinimums: project.flightPlan?.weatherMinimums || {
      minVisibility: 3,
      minCeiling: 500,
      maxWind: 10,
      maxGust: 15,
      precipitation: false,
      notes: ''
    },
    contingencies: project.flightPlan?.contingencies || [],
    additionalProcedures: project.flightPlan?.additionalProcedures || ''
  }
  
  // Keep project-level emergency contacts
  migratedProject.emergencyPlan = {
    contacts: project.emergencyPlan?.contacts || [
      { type: 'emergency', name: 'Local Emergency', phone: '911', notes: '' },
      { type: 'fic', name: 'FIC Edmonton', phone: '1-866-541-4102', notes: 'For fly-away reporting' }
    ],
    firstAid: project.emergencyPlan?.firstAid || null,
    procedures: project.emergencyPlan?.procedures || {}
  }
  
  // Clear the old single-site siteSurvey (now lives in sites[])
  migratedProject.siteSurvey = null
  
  // Clear the old single soraAssessment (now lives in sites[])
  migratedProject.soraAssessment = null
  
  return migratedProject
}

/**
 * Add a new site to a project
 */
export const addSiteToProject = (project, options = {}) => {
  if (!project) {
    throw new Error('No project provided')
  }
  
  // Ensure sites array exists
  const sites = Array.isArray(project.sites) ? [...project.sites] : []
  
  // Check site limit
  if (sites.length >= 10) {
    throw new Error('Maximum of 10 sites per project')
  }
  
  // Create new site
  const newSite = createDefaultSite({
    name: options.name || `Site ${sites.length + 1}`,
    description: options.description || '',
    order: sites.length,
    createdBy: options.createdBy || null
  })
  
  // Copy from existing site if specified
  if (options.copyFromSiteId) {
    const sourceSite = sites.find(s => s.id === options.copyFromSiteId)
    if (sourceSite) {
      // Deep clone and reset identity
      const clonedData = JSON.parse(JSON.stringify(sourceSite))
      newSite.siteSurvey = clonedData.siteSurvey
      newSite.flightPlan = clonedData.flightPlan
      newSite.emergency = clonedData.emergency
      newSite.name = options.name || `${sourceSite.name} (Copy)`
    }
  }
  
  return {
    ...project,
    sites: [...sites, newSite],
    updatedAt: new Date().toISOString()
  }
}

/**
 * Remove a site from a project
 */
export const removeSiteFromProject = (project, siteId) => {
  if (!project || !Array.isArray(project.sites)) {
    throw new Error('Invalid project')
  }
  
  const filteredSites = project.sites.filter(s => s.id !== siteId)
  
  // Re-order remaining sites
  const reorderedSites = filteredSites.map((site, index) => ({
    ...site,
    order: index
  }))
  
  return {
    ...project,
    sites: reorderedSites,
    updatedAt: new Date().toISOString()
  }
}

/**
 * Reorder sites in a project
 */
export const reorderSites = (project, siteIds) => {
  if (!project || !Array.isArray(project.sites)) {
    throw new Error('Invalid project')
  }
  
  const siteMap = new Map(project.sites.map(s => [s.id, s]))
  
  const reorderedSites = siteIds
    .filter(id => siteMap.has(id))
    .map((id, index) => ({
      ...siteMap.get(id),
      order: index
    }))
  
  return {
    ...project,
    sites: reorderedSites,
    updatedAt: new Date().toISOString()
  }
}

/**
 * Update a specific site in a project
 */
export const updateSiteInProject = (project, siteId, updates) => {
  if (!project || !Array.isArray(project.sites)) {
    throw new Error('Invalid project')
  }
  
  const siteIndex = project.sites.findIndex(s => s.id === siteId)
  if (siteIndex === -1) {
    throw new Error('Site not found')
  }
  
  const updatedSites = [...project.sites]
  updatedSites[siteIndex] = {
    ...updatedSites[siteIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  return {
    ...project,
    sites: updatedSites,
    updatedAt: new Date().toISOString()
  }
}

/**
 * Get a site by ID from a project
 */
export const getSiteById = (project, siteId) => {
  if (!project || !Array.isArray(project.sites)) return null
  return project.sites.find(s => s.id === siteId) || null
}

/**
 * Get the active/first site from a project
 */
export const getActiveSite = (project, activeSiteId = null) => {
  if (!project || !Array.isArray(project.sites) || project.sites.length === 0) {
    return null
  }
  
  if (activeSiteId) {
    const site = project.sites.find(s => s.id === activeSiteId)
    if (site) return site
  }
  
  // Return first site by order
  return [...project.sites].sort((a, b) => (a.order || 0) - (b.order || 0))[0]
}

export default {
  CURRENT_PROJECT_VERSION,
  needsMultiSiteMigration,
  getProjectMigrationStatus,
  migrateToMultiSite,
  addSiteToProject,
  removeSiteFromProject,
  reorderSites,
  updateSiteInProject,
  getSiteById,
  getActiveSite
}
