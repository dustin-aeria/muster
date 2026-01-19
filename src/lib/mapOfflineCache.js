/**
 * mapOfflineCache.js
 * Offline map tile caching utilities using Cache API
 * 
 * Features:
 * - Convert bounds to tile coordinates
 * - Cache map tiles for offline use
 * - Track caching progress
 * - Clear cached tiles
 * - Check cache status
 * 
 * @location src/lib/mapOfflineCache.js
 * @action NEW
 */

const CACHE_NAME = 'aeria-map-tiles-v2'
const MAX_TILES_PER_CACHE = 500 // Limit to prevent excessive storage use
const TILE_SIZE = 256

/**
 * Convert longitude to tile X coordinate
 * @param {number} lon - Longitude
 * @param {number} zoom - Zoom level
 * @returns {number} Tile X coordinate
 */
function lon2tile(lon, zoom) {
  return Math.floor((lon + 180) / 360 * Math.pow(2, zoom))
}

/**
 * Convert latitude to tile Y coordinate
 * @param {number} lat - Latitude
 * @param {number} zoom - Zoom level
 * @returns {number} Tile Y coordinate
 */
function lat2tile(lat, zoom) {
  return Math.floor(
    (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
  )
}

/**
 * Get tile coordinates for bounds at a specific zoom level
 * @param {Object} bounds - {north, south, east, west}
 * @param {number} zoom - Zoom level
 * @returns {Object} {minX, maxX, minY, maxY, count}
 */
function getTileCoords(bounds, zoom) {
  const minX = lon2tile(bounds.west, zoom)
  const maxX = lon2tile(bounds.east, zoom)
  const minY = lat2tile(bounds.north, zoom) // Note: Y is inverted
  const maxY = lat2tile(bounds.south, zoom)
  
  const count = (maxX - minX + 1) * (maxY - minY + 1)
  
  return { minX, maxX, minY, maxY, count }
}

/**
 * Generate Mapbox tile URL
 * @param {number} x - Tile X
 * @param {number} y - Tile Y
 * @param {number} z - Zoom level
 * @param {string} style - Mapbox style ID
 * @param {string} token - Mapbox access token
 * @returns {string} Tile URL
 */
function getTileUrl(x, y, z, style = 'mapbox/streets-v12', token) {
  // Mapbox Static Tiles API
  return `https://api.mapbox.com/styles/v1/${style}/tiles/${z}/${x}/${y}?access_token=${token}`
}

/**
 * Estimate cache size for bounds
 * @param {Object} bounds - {north, south, east, west}
 * @param {number} minZoom - Minimum zoom level
 * @param {number} maxZoom - Maximum zoom level
 * @returns {Object} {tileCount, estimatedMB}
 */
export function estimateCacheSize(bounds, minZoom = 12, maxZoom = 16) {
  let totalTiles = 0
  
  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    const coords = getTileCoords(bounds, zoom)
    totalTiles += coords.count
  }
  
  // Estimate ~50KB per tile on average
  const estimatedMB = (totalTiles * 50) / 1024
  
  return {
    tileCount: totalTiles,
    estimatedMB: Math.round(estimatedMB * 10) / 10
  }
}

/**
 * Cache map tiles for offline use
 * @param {Object} bounds - {north, south, east, west} or Mapbox LngLatBounds
 * @param {Object} options - Configuration options
 * @param {number} options.minZoom - Minimum zoom level (default: 12)
 * @param {number} options.maxZoom - Maximum zoom level (default: 16)
 * @param {string} options.style - Mapbox style (default: 'mapbox/streets-v12')
 * @param {string} options.token - Mapbox access token
 * @param {function} options.onProgress - Progress callback (cached, total, percent)
 * @returns {Promise<{success: boolean, cached: number, failed: number}>}
 */
export async function cacheMapTiles(bounds, options = {}) {
  const {
    minZoom = 12,
    maxZoom = 16,
    style = 'mapbox/streets-v12',
    token,
    onProgress
  } = options
  
  if (!('caches' in window)) {
    console.warn('Cache API not supported')
    return { success: false, cached: 0, failed: 0, error: 'Cache API not supported' }
  }
  
  if (!token) {
    return { success: false, cached: 0, failed: 0, error: 'Mapbox token required' }
  }
  
  // Normalize bounds
  const normalizedBounds = bounds.toArray 
    ? { 
        west: bounds.getWest(), 
        east: bounds.getEast(), 
        north: bounds.getNorth(), 
        south: bounds.getSouth() 
      }
    : bounds
  
  // Calculate total tiles
  let totalTiles = 0
  const tileList = []
  
  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    const coords = getTileCoords(normalizedBounds, zoom)
    
    for (let x = coords.minX; x <= coords.maxX; x++) {
      for (let y = coords.minY; y <= coords.maxY; y++) {
        tileList.push({ x, y, z: zoom })
        totalTiles++
      }
    }
  }
  
  // Limit tile count
  if (totalTiles > MAX_TILES_PER_CACHE) {
    return { 
      success: false, 
      cached: 0, 
      failed: 0, 
      error: `Too many tiles (${totalTiles}). Maximum is ${MAX_TILES_PER_CACHE}. Try a smaller area or fewer zoom levels.` 
    }
  }
  
  // Open cache
  const cache = await caches.open(CACHE_NAME)
  
  let cached = 0
  let failed = 0
  
  // Cache tiles in batches to avoid overwhelming the network
  const batchSize = 10
  
  for (let i = 0; i < tileList.length; i += batchSize) {
    const batch = tileList.slice(i, i + batchSize)
    
    await Promise.all(batch.map(async ({ x, y, z }) => {
      const url = getTileUrl(x, y, z, style, token)
      
      try {
        // Check if already cached
        const existing = await cache.match(url)
        if (existing) {
          cached++
          return
        }
        
        // Fetch and cache
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(url, response.clone())
          cached++
        } else {
          failed++
        }
      } catch (err) {
        console.error(`Failed to cache tile ${z}/${x}/${y}:`, err)
        failed++
      }
    }))
    
    // Report progress
    if (onProgress) {
      const percent = Math.round((cached + failed) / totalTiles * 100)
      onProgress(cached, totalTiles, percent)
    }
  }
  
  return {
    success: failed === 0,
    cached,
    failed,
    total: totalTiles
  }
}

/**
 * Clear cached map tiles
 * @returns {Promise<boolean>}
 */
export async function clearMapCache() {
  if (!('caches' in window)) return false
  
  try {
    await caches.delete(CACHE_NAME)
    return true
  } catch (err) {
    console.error('Failed to clear map cache:', err)
    return false
  }
}

/**
 * Get cache storage estimate
 * @returns {Promise<{used: number, available: number, usedMB: string}>}
 */
export async function getCacheStatus() {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return { used: 0, available: 0, usedMB: '0' }
  }
  
  try {
    const estimate = await navigator.storage.estimate()
    return {
      used: estimate.usage || 0,
      available: estimate.quota || 0,
      usedMB: ((estimate.usage || 0) / (1024 * 1024)).toFixed(2)
    }
  } catch (err) {
    console.error('Failed to get cache status:', err)
    return { used: 0, available: 0, usedMB: '0' }
  }
}

/**
 * Check if specific bounds are cached
 * @param {Object} bounds - {north, south, east, west}
 * @param {number} zoom - Zoom level to check
 * @param {string} style - Mapbox style
 * @param {string} token - Mapbox token
 * @returns {Promise<{cached: number, total: number, percent: number}>}
 */
export async function checkCacheStatus(bounds, zoom, style, token) {
  if (!('caches' in window)) {
    return { cached: 0, total: 0, percent: 0 }
  }
  
  const cache = await caches.open(CACHE_NAME)
  const coords = getTileCoords(bounds, zoom)
  
  let cached = 0
  const total = coords.count
  
  for (let x = coords.minX; x <= coords.maxX; x++) {
    for (let y = coords.minY; y <= coords.maxY; y++) {
      const url = getTileUrl(x, y, zoom, style, token)
      const match = await cache.match(url)
      if (match) cached++
    }
  }
  
  return {
    cached,
    total,
    percent: total > 0 ? Math.round(cached / total * 100) : 0
  }
}

export default {
  cacheMapTiles,
  clearMapCache,
  getCacheStatus,
  checkCacheStatus,
  estimateCacheSize
}
