// ============================================
// SHARED MAP COMPONENTS - FIXED VERSION
// Reusable map preview and editor for Site Survey, Flight Plan, Emergency
// 
// @location src/components/project/MapComponents.jsx
// @action NEW FILE
// ============================================

import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import {
  MapPin, X, Loader2, Search, Target, Route, CheckCircle2
} from 'lucide-react'
import { logger } from '../../lib/logger'

// ============================================
// MAP PREVIEW COMPONENT (Read-only inline display)
// ============================================
export function MapPreview({ 
  siteLocation,
  boundary = [],
  launchPoint,
  recoveryPoint,
  musterPoints = [],
  evacuationRoutes = [],
  height = 200,
  onOpenEditor
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Add custom styles
    if (!document.getElementById('leaflet-custom-styles')) {
      const style = document.createElement('style')
      style.id = 'leaflet-custom-styles'
      style.textContent = `
        .custom-div-icon { background: transparent !important; border: none !important; }
      `
      document.head.appendChild(style)
    }

    const loadAndInit = async () => {
      // Load Leaflet JS
      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = resolve
          document.body.appendChild(script)
        })
      }

      const L = window.L
      
      // Clean up existing map
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      await new Promise(r => setTimeout(r, 50))
      if (!mapContainerRef.current) return

      // Determine center and zoom
      const defaultLat = siteLocation?.lat || 54.0
      const defaultLng = siteLocation?.lng || -125.0
      const hasLocation = siteLocation?.lat
      const defaultZoom = hasLocation ? 14 : 4

      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        zoomControl: false,
        attributionControl: false
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map)

      mapRef.current = map

      // Helper to create marker icon
      const createIcon = (color, emoji, size = 28) => L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          background: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        "><span style="transform: rotate(45deg); font-size: ${size * 0.4}px;">${emoji}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size]
      })

      // Add site marker
      if (siteLocation?.lat && siteLocation?.lng) {
        L.marker([siteLocation.lat, siteLocation.lng], {
          icon: createIcon('#1e40af', '📍', 28)
        }).addTo(map)
      }

      // Add boundary polygon
      if (Array.isArray(boundary) && boundary.length >= 3) {
        L.polygon(boundary.map(p => [p.lat, p.lng]), {
          color: '#9333ea',
          fillColor: '#9333ea',
          fillOpacity: 0.15,
          weight: 2
        }).addTo(map)
      }

      // Add launch point
      if (launchPoint?.lat && launchPoint?.lng) {
        L.marker([launchPoint.lat, launchPoint.lng], {
          icon: createIcon('#16a34a', '🚀', 24)
        }).addTo(map)
      }

      // Add recovery point
      if (recoveryPoint?.lat && recoveryPoint?.lng) {
        L.marker([recoveryPoint.lat, recoveryPoint.lng], {
          icon: createIcon('#dc2626', '🎯', 24)
        }).addTo(map)
      }

      // Add muster points
      if (Array.isArray(musterPoints)) {
        musterPoints.forEach(mp => {
          if (mp.coordinates?.lat && mp.coordinates?.lng) {
            L.marker([mp.coordinates.lat, mp.coordinates.lng], {
              icon: createIcon('#f59e0b', '🚨', 24)
            }).addTo(map)
          }
        })
      }

      // Add evacuation routes
      if (Array.isArray(evacuationRoutes)) {
        evacuationRoutes.forEach(route => {
          if (Array.isArray(route.coordinates) && route.coordinates.length >= 2) {
            L.polyline(route.coordinates.map(c => [c.lat, c.lng]), {
              color: '#ef4444',
              weight: 3,
              dashArray: '8, 8'
            }).addTo(map)
          }
        })
      }

      // Fit bounds to show all content
      const allPoints = []
      if (siteLocation?.lat) allPoints.push([siteLocation.lat, siteLocation.lng])
      if (launchPoint?.lat) allPoints.push([launchPoint.lat, launchPoint.lng])
      if (recoveryPoint?.lat) allPoints.push([recoveryPoint.lat, recoveryPoint.lng])
      if (Array.isArray(boundary)) {
        boundary.forEach(p => allPoints.push([p.lat, p.lng]))
      }
      if (Array.isArray(musterPoints)) {
        musterPoints.forEach(mp => {
          if (mp.coordinates?.lat) allPoints.push([mp.coordinates.lat, mp.coordinates.lng])
        })
      }

      if (allPoints.length > 1) {
        map.fitBounds(allPoints, { padding: [30, 30] })
      }

      setIsLoading(false)
    }

    loadAndInit()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [siteLocation, boundary, launchPoint, recoveryPoint, musterPoints, evacuationRoutes])

  const hasContent = siteLocation?.lat || (Array.isArray(boundary) && boundary.length > 0)

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-aeria-blue" />
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Edit button */}
      {onOpenEditor && (
        <button
          onClick={onOpenEditor}
          className="absolute bottom-3 right-3 px-4 py-2 bg-white hover:bg-gray-50 text-sm font-medium rounded-lg shadow-md border border-gray-200 flex items-center gap-2 z-20 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Edit Map
        </button>
      )}

      {/* Empty state */}
      {!hasContent && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 z-10">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No location set</p>
            {onOpenEditor && (
              <button onClick={onOpenEditor} className="text-sm text-aeria-blue hover:underline mt-1">
                Click to set location
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// FULL MAP EDITOR MODAL
// ============================================
export function MapEditorModal({
  isOpen,
  onClose,
  onSave,
  siteLocation,
  boundary = [],
  launchPoint,
  recoveryPoint,
  musterPoints = [],
  evacuationRoutes = [],
  mode = 'site', // 'site' | 'flight' | 'emergency'
  siteName = 'Site'
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const boundaryLayerRef = useRef(null)
  const boundaryVerticesRef = useRef([])
  const routeLayersRef = useRef([])

  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  
  // Local editing state
  const [localSiteLocation, setLocalSiteLocation] = useState(null)
  const [localBoundary, setLocalBoundary] = useState([])
  const [localLaunchPoint, setLocalLaunchPoint] = useState(null)
  const [localRecoveryPoint, setLocalRecoveryPoint] = useState(null)
  const [localMusterPoints, setLocalMusterPoints] = useState([])
  const [localRoutes, setLocalRoutes] = useState([])
  
  // UI state
  const [activeMode, setActiveMode] = useState('site')
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false)
  const [isDrawingRoute, setIsDrawingRoute] = useState(false)
  const [tempRoutePoints, setTempRoutePoints] = useState([])

  // Refs for click handler
  const activeModeRef = useRef('site')
  const isDrawingBoundaryRef = useRef(false)
  const isDrawingRouteRef = useRef(false)
  const tempRoutePointsRef = useRef([])

  // Sync refs
  useEffect(() => { activeModeRef.current = activeMode }, [activeMode])
  useEffect(() => { isDrawingBoundaryRef.current = isDrawingBoundary }, [isDrawingBoundary])
  useEffect(() => { isDrawingRouteRef.current = isDrawingRoute }, [isDrawingRoute])
  useEffect(() => { tempRoutePointsRef.current = tempRoutePoints }, [tempRoutePoints])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSiteLocation(siteLocation || null)
      setLocalBoundary(Array.isArray(boundary) ? [...boundary] : [])
      setLocalLaunchPoint(launchPoint || null)
      setLocalRecoveryPoint(recoveryPoint || null)
      setLocalMusterPoints(Array.isArray(musterPoints) ? [...musterPoints] : [])
      setLocalRoutes(Array.isArray(evacuationRoutes) ? [...evacuationRoutes] : [])
      setTempRoutePoints([])
      setIsDrawingBoundary(false)
      setIsDrawingRoute(false)
      setActiveMode(mode === 'flight' ? 'launch' : mode === 'emergency' ? 'muster' : 'site')
    }
  }, [isOpen])

  // Initialize map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return

    // Load CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!document.getElementById('leaflet-editor-styles')) {
      const style = document.createElement('style')
      style.id = 'leaflet-editor-styles'
      style.textContent = `
        .custom-div-icon { background: transparent !important; border: none !important; }
        .leaflet-container { cursor: crosshair; }
        .leaflet-dragging .leaflet-container { cursor: move; }
      `
      document.head.appendChild(style)
    }

    const initMap = async () => {
      // Load Leaflet
      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = resolve
          document.body.appendChild(script)
        })
      }

      const L = window.L

      // Clean up
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markersRef.current = {}
      boundaryLayerRef.current = null
      boundaryVerticesRef.current = []
      routeLayersRef.current = []

      await new Promise(r => setTimeout(r, 100))
      if (!mapContainerRef.current) return

      const defaultLat = siteLocation?.lat || 54.0
      const defaultLng = siteLocation?.lng || -125.0
      const hasLocation = siteLocation?.lat
      const defaultZoom = hasLocation ? 15 : 5

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        zoomControl: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(map)

      mapRef.current = map

      // Create icon helper
      const createIcon = (color, emoji, size = 32) => L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          background: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        "><span style="transform: rotate(45deg); font-size: ${size * 0.45}px;">${emoji}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size]
      })

      // Add existing site marker
      if (siteLocation?.lat && siteLocation?.lng) {
        const marker = L.marker([siteLocation.lat, siteLocation.lng], {
          icon: createIcon('#1e40af', '📍'),
          draggable: true
        }).addTo(map)
        
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng()
          setLocalSiteLocation({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) })
        })
        markersRef.current.site = marker
      }

      // Add existing launch marker
      if (launchPoint?.lat && launchPoint?.lng) {
        const marker = L.marker([launchPoint.lat, launchPoint.lng], {
          icon: createIcon('#16a34a', '🚀'),
          draggable: true
        }).addTo(map)
        
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng()
          setLocalLaunchPoint({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) })
        })
        markersRef.current.launch = marker
      }

      // Add existing recovery marker
      if (recoveryPoint?.lat && recoveryPoint?.lng) {
        const marker = L.marker([recoveryPoint.lat, recoveryPoint.lng], {
          icon: createIcon('#dc2626', '🎯'),
          draggable: true
        }).addTo(map)
        
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng()
          setLocalRecoveryPoint({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) })
        })
        markersRef.current.recovery = marker
      }

      // Add existing boundary
      if (Array.isArray(boundary) && boundary.length >= 3) {
        const polygon = L.polygon(boundary.map(p => [p.lat, p.lng]), {
          color: '#9333ea',
          fillColor: '#9333ea',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map)
        boundaryLayerRef.current = polygon

        boundary.forEach((point, idx) => {
          const vertex = L.circleMarker([point.lat, point.lng], {
            radius: 7,
            color: '#9333ea',
            fillColor: 'white',
            fillOpacity: 1,
            weight: 2
          }).addTo(map)
          boundaryVerticesRef.current.push(vertex)
        })
      }

      // Add existing muster points
      if (Array.isArray(musterPoints)) {
        musterPoints.forEach((mp, idx) => {
          if (mp.coordinates?.lat && mp.coordinates?.lng) {
            const marker = L.marker([mp.coordinates.lat, mp.coordinates.lng], {
              icon: createIcon('#f59e0b', '🚨', 28),
              draggable: true
            }).addTo(map)
            
            marker.on('dragend', (e) => {
              const pos = e.target.getLatLng()
              setLocalMusterPoints(prev => {
                const updated = [...prev]
                updated[idx] = {
                  ...updated[idx],
                  coordinates: { lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) },
                  location: `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`
                }
                return updated
              })
            })
            markersRef.current[`muster_${idx}`] = marker
          }
        })
      }

      // Add existing routes
      if (Array.isArray(evacuationRoutes)) {
        evacuationRoutes.forEach((route, idx) => {
          if (Array.isArray(route.coordinates) && route.coordinates.length >= 2) {
            const line = L.polyline(route.coordinates.map(c => [c.lat, c.lng]), {
              color: '#ef4444',
              weight: 4,
              dashArray: '10, 10'
            }).addTo(map)
            routeLayersRef.current.push(line)
          }
        })
      }

      // Map click handler
      map.on('click', (e) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6))
        const lng = parseFloat(e.latlng.lng.toFixed(6))
        const coords = { lat, lng }

        if (isDrawingBoundaryRef.current) {
          // Add boundary point
          setLocalBoundary(prev => {
            const newBoundary = [...prev, coords]
            updateBoundaryDisplay(newBoundary)
            return newBoundary
          })
        } else if (isDrawingRouteRef.current) {
          // Add route point
          setTempRoutePoints(prev => {
            const newPoints = [...prev, coords]
            updateTempRouteDisplay(newPoints)
            return newPoints
          })
        } else {
          // Place marker based on active mode
          const currentMode = activeModeRef.current
          
          if (currentMode === 'site') {
            setLocalSiteLocation(coords)
            updateOrCreateMarker('site', coords, '#1e40af', '📍', (pos) => {
              setLocalSiteLocation({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) })
            })
          } else if (currentMode === 'launch') {
            setLocalLaunchPoint(coords)
            updateOrCreateMarker('launch', coords, '#16a34a', '🚀', (pos) => {
              setLocalLaunchPoint({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) })
            })
          } else if (currentMode === 'recovery') {
            setLocalRecoveryPoint(coords)
            updateOrCreateMarker('recovery', coords, '#dc2626', '🎯', (pos) => {
              setLocalRecoveryPoint({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) })
            })
          } else if (currentMode === 'muster') {
            // Add new muster point
            const newMuster = {
              name: `Muster ${localMusterPoints.length + 1}`,
              location: `${lat}, ${lng}`,
              coordinates: coords,
              description: ''
            }
            
            setLocalMusterPoints(prev => {
              const newList = [...prev, newMuster]
              const idx = newList.length - 1
              
              // Create marker
              const marker = L.marker([lat, lng], {
                icon: createIcon('#f59e0b', '🚨', 28),
                draggable: true
              }).addTo(map)
              
              marker.on('dragend', (e) => {
                const pos = e.target.getLatLng()
                setLocalMusterPoints(prev2 => {
                  const updated = [...prev2]
                  if (updated[idx]) {
                    updated[idx] = {
                      ...updated[idx],
                      coordinates: { lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) },
                      location: `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`
                    }
                  }
                  return updated
                })
              })
              markersRef.current[`muster_${idx}`] = marker
              
              return newList
            })
          }
        }
      })

      // Helper to update or create marker
      function updateOrCreateMarker(key, coords, color, emoji, onDrag) {
        if (markersRef.current[key]) {
          markersRef.current[key].setLatLng([coords.lat, coords.lng])
        } else {
          const marker = L.marker([coords.lat, coords.lng], {
            icon: createIcon(color, emoji),
            draggable: true
          }).addTo(map)
          
          marker.on('dragend', (e) => {
            const pos = e.target.getLatLng()
            onDrag(pos)
          })
          markersRef.current[key] = marker
        }
      }

      // Helper to update boundary display
      function updateBoundaryDisplay(points) {
        // Remove old
        if (boundaryLayerRef.current) {
          map.removeLayer(boundaryLayerRef.current)
          boundaryLayerRef.current = null
        }
        boundaryVerticesRef.current.forEach(v => map.removeLayer(v))
        boundaryVerticesRef.current = []

        // Draw new
        if (points.length >= 3) {
          const polygon = L.polygon(points.map(p => [p.lat, p.lng]), {
            color: '#9333ea',
            fillColor: '#9333ea',
            fillOpacity: 0.2,
            weight: 2
          }).addTo(map)
          boundaryLayerRef.current = polygon
        }

        // Add vertices
        points.forEach((point) => {
          const vertex = L.circleMarker([point.lat, point.lng], {
            radius: 7,
            color: '#9333ea',
            fillColor: 'white',
            fillOpacity: 1,
            weight: 2
          }).addTo(map)
          boundaryVerticesRef.current.push(vertex)
        })
      }

      // Helper to update temp route display
      function updateTempRouteDisplay(points) {
        // Remove old temp line if exists
        if (markersRef.current.tempRoute) {
          map.removeLayer(markersRef.current.tempRoute)
        }
        
        if (points.length >= 2) {
          const line = L.polyline(points.map(p => [p.lat, p.lng]), {
            color: '#f87171',
            weight: 3,
            dashArray: '5, 5'
          }).addTo(map)
          markersRef.current.tempRoute = line
        }
        
        // Add point markers
        points.forEach((point, i) => {
          const key = `tempRoutePoint_${i}`
          if (!markersRef.current[key]) {
            const vertex = L.circleMarker([point.lat, point.lng], {
              radius: 5,
              color: '#ef4444',
              fillColor: 'white',
              fillOpacity: 1,
              weight: 2
            }).addTo(map)
            markersRef.current[key] = vertex
          }
        })
      }

      setTimeout(() => {
        map.invalidateSize()
        setIsLoading(false)
      }, 200)
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isOpen])

  // Update boundary when localBoundary changes (for undo/clear)
  useEffect(() => {
    if (!mapRef.current || !window.L || isLoading) return
    
    const L = window.L
    const map = mapRef.current

    // Remove old
    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current)
      boundaryLayerRef.current = null
    }
    boundaryVerticesRef.current.forEach(v => map.removeLayer(v))
    boundaryVerticesRef.current = []

    // Draw new
    if (localBoundary.length >= 3) {
      const polygon = L.polygon(localBoundary.map(p => [p.lat, p.lng]), {
        color: '#9333ea',
        fillColor: '#9333ea',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(map)
      boundaryLayerRef.current = polygon
    }

    // Add vertices
    localBoundary.forEach((point) => {
      const vertex = L.circleMarker([point.lat, point.lng], {
        radius: 7,
        color: '#9333ea',
        fillColor: 'white',
        fillOpacity: 1,
        weight: 2
      }).addTo(map)
      boundaryVerticesRef.current.push(vertex)
    })
  }, [localBoundary, isLoading])

  // Search
  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapRef.current) return
    setSearching(true)
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      )
      const results = await response.json()
      
      if (results.length > 0) {
        const { lat, lon } = results[0]
        mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 15)
      }
    } catch (err) {
      logger.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  // Save route
  const saveRoute = () => {
    if (tempRoutePoints.length < 2) return
    
    setLocalRoutes(prev => [...prev, {
      name: `Route ${prev.length + 1}`,
      description: '',
      coordinates: tempRoutePoints
    }])
    
    // Clean up temp display
    if (markersRef.current.tempRoute && mapRef.current) {
      mapRef.current.removeLayer(markersRef.current.tempRoute)
      delete markersRef.current.tempRoute
    }
    // Clean up temp point markers
    Object.keys(markersRef.current).forEach(key => {
      if (key.startsWith('tempRoutePoint_') && mapRef.current) {
        mapRef.current.removeLayer(markersRef.current[key])
        delete markersRef.current[key]
      }
    })
    
    // Add permanent route line
    if (mapRef.current && window.L) {
      const line = window.L.polyline(tempRoutePoints.map(p => [p.lat, p.lng]), {
        color: '#ef4444',
        weight: 4,
        dashArray: '10, 10'
      }).addTo(mapRef.current)
      routeLayersRef.current.push(line)
    }
    
    setTempRoutePoints([])
    setIsDrawingRoute(false)
  }

  // Cancel route
  const cancelRoute = () => {
    // Clean up temp display
    if (markersRef.current.tempRoute && mapRef.current) {
      mapRef.current.removeLayer(markersRef.current.tempRoute)
      delete markersRef.current.tempRoute
    }
    Object.keys(markersRef.current).forEach(key => {
      if (key.startsWith('tempRoutePoint_') && mapRef.current) {
        mapRef.current.removeLayer(markersRef.current[key])
        delete markersRef.current[key]
      }
    })
    setTempRoutePoints([])
    setIsDrawingRoute(false)
  }

  // Boundary controls
  const undoBoundaryPoint = () => setLocalBoundary(prev => prev.slice(0, -1))
  const clearBoundary = () => setLocalBoundary([])

  // Save handler
  const handleSave = () => {
    onSave({
      siteLocation: localSiteLocation,
      boundary: localBoundary,
      launchPoint: localLaunchPoint,
      recoveryPoint: localRecoveryPoint,
      musterPoints: localMusterPoints,
      evacuationRoutes: localRoutes
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Map Editor - {siteName}</h2>
            <p className="text-sm text-gray-500">Click to place, drag to move markers</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b bg-gray-50 flex-shrink-0">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <label htmlFor="map-location-search" className="sr-only">Search location</label>
              <input
                id="map-location-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search location..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy disabled:opacity-50 text-sm"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Tool Controls */}
        <div className="p-3 border-b flex flex-wrap gap-2 items-center flex-shrink-0">
          <span className="text-xs font-medium text-gray-500 mr-2">CLICK TO SET:</span>
          
          {/* Site mode tools */}
          {(mode === 'site' || mode === 'all') && (
            <>
              <button
                onClick={() => { setActiveMode('site'); setIsDrawingBoundary(false); setIsDrawingRoute(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  activeMode === 'site' && !isDrawingBoundary ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                📍 Site Location
              </button>
              <button
                onClick={() => { setIsDrawingBoundary(!isDrawingBoundary); setActiveMode(null); setIsDrawingRoute(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  isDrawingBoundary ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Target className="w-3 h-3" /> {isDrawingBoundary ? 'Drawing...' : 'Draw Boundary'}
              </button>
              {localBoundary.length > 0 && (
                <>
                  <button onClick={undoBoundaryPoint} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Undo</button>
                  <button onClick={clearBoundary} className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded">Clear</button>
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">{localBoundary.length} pts</span>
                </>
              )}
            </>
          )}

          {/* Flight mode tools */}
          {(mode === 'flight' || mode === 'all') && (
            <>
              {mode !== 'site' && <div className="w-px h-5 bg-gray-300 mx-1" />}
              <button
                onClick={() => { setActiveMode('launch'); setIsDrawingBoundary(false); setIsDrawingRoute(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  activeMode === 'launch' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🚀 Launch
              </button>
              <button
                onClick={() => { setActiveMode('recovery'); setIsDrawingBoundary(false); setIsDrawingRoute(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  activeMode === 'recovery' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🎯 Recovery
              </button>
            </>
          )}

          {/* Emergency mode tools */}
          {(mode === 'emergency' || mode === 'all') && (
            <>
              {mode !== 'emergency' && <div className="w-px h-5 bg-gray-300 mx-1" />}
              <button
                onClick={() => { setActiveMode('muster'); setIsDrawingBoundary(false); setIsDrawingRoute(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  activeMode === 'muster' ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🚨 Add Muster
              </button>
              <button
                onClick={() => { setIsDrawingRoute(!isDrawingRoute); setActiveMode(null); setIsDrawingBoundary(false) }}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  isDrawingRoute ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Route className="w-3 h-3" /> {isDrawingRoute ? 'Drawing...' : 'Draw Route'}
              </button>
              {isDrawingRoute && tempRoutePoints.length >= 2 && (
                <button onClick={saveRoute} className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded">
                  Save Route ({tempRoutePoints.length})
                </button>
              )}
              {isDrawingRoute && (
                <button onClick={cancelRoute} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Cancel</button>
              )}
            </>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-0" style={{ minHeight: '400px' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-aeria-blue" />
            </div>
          )}
          <div ref={mapContainerRef} className="absolute inset-0" />
        </div>

        {/* Status Bar */}
        <div className="p-3 border-t bg-gray-50 flex flex-wrap gap-4 text-xs flex-shrink-0">
          {localSiteLocation && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              Site: {localSiteLocation.lat?.toFixed(5)}, {localSiteLocation.lng?.toFixed(5)}
            </span>
          )}
          {localLaunchPoint && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-600" />
              Launch: {localLaunchPoint.lat?.toFixed(5)}, {localLaunchPoint.lng?.toFixed(5)}
            </span>
          )}
          {localRecoveryPoint && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-600" />
              Recovery: {localRecoveryPoint.lat?.toFixed(5)}, {localRecoveryPoint.lng?.toFixed(5)}
            </span>
          )}
          {localMusterPoints.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              Muster Points: {localMusterPoints.length}
            </span>
          )}
          {localRoutes.length > 0 && (
            <span className="flex items-center gap-1">
              <Route className="w-3 h-3 text-red-500" />
              Routes: {localRoutes.length}
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t flex justify-between flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

MapPreview.propTypes = {
  siteLocation: PropTypes.object,
  boundary: PropTypes.array,
  launchPoint: PropTypes.object,
  recoveryPoint: PropTypes.object,
  musterPoints: PropTypes.array,
  evacuationRoutes: PropTypes.array,
  height: PropTypes.number,
  onOpenEditor: PropTypes.func
}

MapEditorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  siteLocation: PropTypes.object,
  boundary: PropTypes.array,
  launchPoint: PropTypes.object,
  recoveryPoint: PropTypes.object,
  musterPoints: PropTypes.array,
  evacuationRoutes: PropTypes.array,
  mode: PropTypes.oneOf(['site', 'flight', 'emergency'])
}

export default { MapPreview, MapEditorModal }
