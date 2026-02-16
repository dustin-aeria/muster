/**
 * Static Map Service
 * Generates static map images using Mapbox Static Images API
 * for embedding in PDF reports and documents
 *
 * @location src/lib/staticMapService.js
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

// Map styles available
const MAP_STYLES = {
  streets: 'mapbox/streets-v12',
  satellite: 'mapbox/satellite-v9',
  satelliteStreets: 'mapbox/satellite-streets-v12',
  outdoors: 'mapbox/outdoors-v12',
  light: 'mapbox/light-v11',
  dark: 'mapbox/dark-v11'
}

/**
 * Generate a static map URL for a site
 * @param {Object} site - Site data with mapData
 * @param {Object} options - Configuration options
 * @returns {string} Static map URL
 */
export function generateStaticMapUrl(site, options = {}) {
  const {
    width = 600,
    height = 400,
    style = 'satelliteStreets',
    padding = 50,
    retina = true
  } = options

  if (!MAPBOX_TOKEN) {
    console.warn('Mapbox token not available for static map generation')
    return null
  }

  const mapData = site?.mapData
  if (!mapData) {
    console.warn('No mapData found for site:', site?.name || site?.id)
    return null
  }

  console.log('Generating static map for site:', site?.name, 'mapData keys:', Object.keys(mapData))

  // Collect all coordinates to calculate bounds
  const coordinates = []
  const overlays = []

  // Site location marker
  const siteLocation = mapData.siteSurvey?.siteLocation
  if (siteLocation?.geometry?.coordinates) {
    const [lng, lat] = siteLocation.geometry.coordinates
    coordinates.push([lng, lat])
    // Add pin marker
    overlays.push(`pin-l-star+1e3a5f(${lng},${lat})`)
  }

  // Launch point
  const launchPoint = mapData.flightPlan?.launchPoint
  if (launchPoint?.geometry?.coordinates) {
    const [lng, lat] = launchPoint.geometry.coordinates
    coordinates.push([lng, lat])
    overlays.push(`pin-l-airport+22c55e(${lng},${lat})`)
  }

  // Recovery point
  const recoveryPoint = mapData.flightPlan?.recoveryPoint
  if (recoveryPoint?.geometry?.coordinates) {
    const [lng, lat] = recoveryPoint.geometry.coordinates
    coordinates.push([lng, lat])
    overlays.push(`pin-l-circle+ef4444(${lng},${lat})`)
  }

  // Pilot position
  const pilotPosition = mapData.flightPlan?.pilotPosition
  if (pilotPosition?.geometry?.coordinates) {
    const [lng, lat] = pilotPosition.geometry.coordinates
    coordinates.push([lng, lat])
    overlays.push(`pin-s-pitch+3b82f6(${lng},${lat})`)
  }

  // Operations boundary polygon
  const opsBoundary = mapData.siteSurvey?.operationsBoundary
  if (opsBoundary?.geometry?.coordinates?.[0]?.length >= 4) {
    const coords = opsBoundary.geometry.coordinates[0]
    coords.forEach(c => coordinates.push(c))
    // Add polygon as GeoJSON overlay
    const polyGeoJson = {
      type: 'Feature',
      properties: {
        stroke: '#1e3a5f',
        'stroke-width': 2,
        'stroke-opacity': 0.8,
        fill: '#1e3a5f',
        'fill-opacity': 0.1
      },
      geometry: opsBoundary.geometry
    }
    overlays.push(`geojson(${encodeURIComponent(JSON.stringify(polyGeoJson))})`)
  }

  // Flight geography polygon
  const flightGeo = mapData.flightPlan?.flightGeography
  if (flightGeo?.geometry?.coordinates?.[0]?.length >= 4) {
    const coords = flightGeo.geometry.coordinates[0]
    coords.forEach(c => coordinates.push(c))
    // Add polygon as GeoJSON overlay
    const polyGeoJson = {
      type: 'Feature',
      properties: {
        stroke: '#22c55e',
        'stroke-width': 2,
        'stroke-opacity': 0.8,
        fill: '#22c55e',
        'fill-opacity': 0.15
      },
      geometry: flightGeo.geometry
    }
    overlays.push(`geojson(${encodeURIComponent(JSON.stringify(polyGeoJson))})`)
  }

  // Obstacles
  const obstacles = mapData.siteSurvey?.obstacles || []
  obstacles.forEach(obs => {
    if (obs?.geometry?.coordinates) {
      const [lng, lat] = obs.geometry.coordinates
      coordinates.push([lng, lat])
      overlays.push(`pin-s-danger+f59e0b(${lng},${lat})`)
    }
  })

  // If no coordinates found, return null
  if (coordinates.length === 0) return null

  // Calculate center and auto-fit
  const styleId = MAP_STYLES[style] || MAP_STYLES.satelliteStreets
  const retinaStr = retina ? '@2x' : ''
  const overlayStr = overlays.length > 0 ? overlays.join(',') + '/' : ''

  // Use auto to fit all overlays
  const url = `https://api.mapbox.com/styles/v1/${styleId}/static/${overlayStr}auto/${width}x${height}${retinaStr}?padding=${padding}&access_token=${MAPBOX_TOKEN}`

  return url
}

/**
 * Generate a simple static map URL centered on coordinates
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {Object} options - Configuration options
 * @returns {string} Static map URL
 */
export function generateSimpleMapUrl(lng, lat, options = {}) {
  const {
    width = 400,
    height = 300,
    zoom = 15,
    style = 'satelliteStreets',
    marker = true,
    retina = true
  } = options

  if (!MAPBOX_TOKEN) return null

  const styleId = MAP_STYLES[style] || MAP_STYLES.satelliteStreets
  const retinaStr = retina ? '@2x' : ''
  const markerStr = marker ? `pin-l-star+1e3a5f(${lng},${lat})/` : ''

  return `https://api.mapbox.com/styles/v1/${styleId}/static/${markerStr}${lng},${lat},${zoom}/${width}x${height}${retinaStr}?access_token=${MAPBOX_TOKEN}`
}

/**
 * Fetch a static map image as a data URL (base64)
 * This is needed for embedding in PDFs
 * @param {string} url - Static map URL
 * @returns {Promise<string>} Base64 data URL
 */
export async function fetchMapAsDataUrl(url) {
  if (!url) return null

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn('Failed to fetch static map:', response.status)
      return null
    }

    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.warn('Error fetching static map:', error)
    return null
  }
}

/**
 * Generate and fetch a static map for a site as a data URL
 * @param {Object} site - Site data
 * @param {Object} options - Map options
 * @returns {Promise<string>} Base64 data URL or null
 */
export async function getSiteMapImage(site, options = {}) {
  const url = generateStaticMapUrl(site, options)
  if (!url) return null
  return fetchMapAsDataUrl(url)
}

/**
 * Generate map images for all sites in a project
 * @param {Object} project - Project with sites array
 * @param {Object} options - Map options
 * @returns {Promise<Object>} Map of siteId -> dataUrl
 */
export async function getProjectMapImages(project, options = {}) {
  const sites = project?.sites || []
  const mapImages = {}

  await Promise.all(
    sites.map(async (site) => {
      const dataUrl = await getSiteMapImage(site, options)
      if (dataUrl) {
        mapImages[site.id] = dataUrl
      }
    })
  )

  return mapImages
}

export default {
  generateStaticMapUrl,
  generateSimpleMapUrl,
  fetchMapAsDataUrl,
  getSiteMapImage,
  getProjectMapImages,
  MAP_STYLES
}
