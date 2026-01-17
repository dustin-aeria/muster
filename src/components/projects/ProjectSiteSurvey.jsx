import { useState, useEffect, useRef } from 'react'
import { 
  MapPin, 
  Plus,
  Trash2,
  AlertTriangle,
  Navigation,
  Mountain,
  TreePine,
  Building,
  Radio,
  Car,
  Users,
  Camera,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  CheckCircle2,
  Crosshair,
  Map,
  X,
  Loader2,
  Navigation2,
  Target,
  Search
} from 'lucide-react'

// Population categories for SORA integration
const populationCategories = {
  controlled: { 
    label: 'Controlled Ground Area', 
    description: 'No uninvolved people present, area fully controlled',
    examples: 'Closed industrial sites, secured perimeters, active construction zones with access control',
    density: 0,
    grcColumn: 0
  },
  remote: { 
    label: 'Remote/Sparsely Populated', 
    description: 'Very low density, < 5 people/km²',
    examples: 'Wilderness areas, remote mining sites, unpopulated farmland',
    density: 5,
    grcColumn: 1
  },
  lightly: { 
    label: 'Lightly Populated', 
    description: 'Rural areas, 5-50 people/km²',
    examples: 'Rural farmland with scattered houses, forest service roads',
    density: 50,
    grcColumn: 2
  },
  sparsely: { 
    label: 'Sparsely Populated', 
    description: 'Scattered houses, 50-500 people/km²',
    examples: 'Rural residential areas, small villages, acreages',
    density: 500,
    grcColumn: 3
  },
  suburban: { 
    label: 'Suburban/Populated', 
    description: 'Residential areas, 500-5000 people/km²',
    examples: 'Suburban neighborhoods, small towns, industrial parks during work hours',
    density: 5000,
    grcColumn: 4
  },
  highdensity: { 
    label: 'High Density Urban', 
    description: 'Urban centers, > 5000 people/km²',
    examples: 'City centers, downtown areas, apartment complexes',
    density: 10000,
    grcColumn: 5
  },
  assembly: { 
    label: 'Gatherings/Assembly', 
    description: 'Crowds, events, high concentration of people',
    examples: 'Concerts, sporting events, festivals, protests',
    density: 50000,
    grcColumn: 6
  }
}

const obstacleTypes = [
  { value: 'tower', label: 'Tower/Mast', icon: Radio },
  { value: 'powerline', label: 'Power Lines', icon: Radio },
  { value: 'building', label: 'Building/Structure', icon: Building },
  { value: 'tree', label: 'Trees/Vegetation', icon: TreePine },
  { value: 'terrain', label: 'Terrain Feature', icon: Mountain },
  { value: 'wire', label: 'Wire/Cable', icon: Radio },
  { value: 'antenna', label: 'Antenna', icon: Radio },
  { value: 'other', label: 'Other', icon: AlertTriangle }
]

const accessTypes = [
  { value: 'public_road', label: 'Public Road' },
  { value: 'private_road', label: 'Private Road (permission required)' },
  { value: 'trail', label: 'Trail/Path' },
  { value: 'off_road', label: 'Off-road/4x4' },
  { value: 'boat', label: 'Boat Access' },
  { value: 'helicopter', label: 'Helicopter Access' },
  { value: 'walk_in', label: 'Walk-in Only' }
]

const groundConditions = [
  { value: 'paved', label: 'Paved/Concrete' },
  { value: 'gravel', label: 'Gravel' },
  { value: 'grass', label: 'Grass/Field' },
  { value: 'dirt', label: 'Dirt/Earth' },
  { value: 'sand', label: 'Sand' },
  { value: 'snow', label: 'Snow/Ice' },
  { value: 'rocky', label: 'Rocky Terrain' },
  { value: 'wetland', label: 'Wetland/Marsh' }
]

// ============================================
// UNIFIED MAP COMPONENT
// Single map with multiple markers (site, launch, recovery) and boundary drawing
// ============================================
function SiteMapEditor({ 
  siteLocation, 
  launchPoint, 
  recoveryPoint, 
  boundary,
  onUpdate,
  isOpen, 
  onClose 
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const boundaryLayerRef = useRef(null)
  const boundaryVertexMarkersRef = useRef([])  // Store vertex markers for boundary editing
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [activeMarker, setActiveMarker] = useState('site') // 'site', 'launch', 'recovery'
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false)
  const [boundaryPoints, setBoundaryPoints] = useState(boundary || [])
  
  // Refs to track current state for event handlers (closures capture stale state)
  const activeMarkerRef = useRef(activeMarker)
  const isDrawingBoundaryRef = useRef(isDrawingBoundary)
  
  // Keep refs in sync with state
  useEffect(() => { activeMarkerRef.current = activeMarker }, [activeMarker])
  useEffect(() => { isDrawingBoundaryRef.current = isDrawingBoundary }, [isDrawingBoundary])
  
  // Invalidate map size when modal is shown (fixes rendering issues)
  useEffect(() => {
    if (isOpen && mapRef.current) {
      // Multiple invalidateSize calls to catch async rendering
      const timeouts = [0, 100, 200, 500].map(delay => 
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize()
          }
        }, delay)
      )
      return () => timeouts.forEach(clearTimeout)
    }
  }, [isOpen])

  // ResizeObserver to handle container size changes
  useEffect(() => {
    if (!mapContainerRef.current || !isOpen) return
    
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    })
    
    resizeObserver.observe(mapContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [isOpen])
  
  // Local state for coordinates
  const [coords, setCoords] = useState({
    site: { lat: siteLocation?.lat || '', lng: siteLocation?.lng || '' },
    launch: { lat: launchPoint?.lat || '', lng: launchPoint?.lng || '' },
    recovery: { lat: recoveryPoint?.lat || '', lng: recoveryPoint?.lng || '' }
  })

  // Sync coords with props when modal opens (props may have changed)
  useEffect(() => {
    if (isOpen) {
      setCoords({
        site: { lat: siteLocation?.lat || '', lng: siteLocation?.lng || '' },
        launch: { lat: launchPoint?.lat || '', lng: launchPoint?.lng || '' },
        recovery: { lat: recoveryPoint?.lat || '', lng: recoveryPoint?.lng || '' }
      })
      setBoundaryPoints(boundary || [])
    }
  }, [isOpen, siteLocation, launchPoint, recoveryPoint, boundary])

  const markerColors = {
    site: { color: '#1e40af', label: 'Site Location', icon: '📍' },
    launch: { color: '#16a34a', label: 'Launch Point', icon: '🛫' },
    recovery: { color: '#d97706', label: 'Recovery Point', icon: '🛬' }
  }

  useEffect(() => {
    if (!isOpen) return

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Add custom styles to fix Leaflet in modal
    if (!document.getElementById('leaflet-modal-fix')) {
      const style = document.createElement('style')
      style.id = 'leaflet-modal-fix'
      style.textContent = `
        .leaflet-container { 
          z-index: 1; 
          width: 100% !important;
          height: 100% !important;
        }
        .leaflet-pane { z-index: 1; }
        .leaflet-control { z-index: 2; }
        .leaflet-control-layers { z-index: 2; }
        .custom-marker { background: transparent !important; border: none !important; }
        .leaflet-interactive.boundary-vertex { cursor: grab !important; }
        .leaflet-interactive.boundary-vertex:active { cursor: grabbing !important; }
        .leaflet-dragging .leaflet-interactive.boundary-vertex { cursor: grabbing !important; }
      `
      document.head.appendChild(style)
    }

    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) {
          resolve(window.L)
          return
        }
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => resolve(window.L)
        document.body.appendChild(script)
      })
    }

    loadLeaflet().then((L) => {
      if (!mapContainerRef.current || mapRef.current) return

      // Small delay to ensure container is ready
      setTimeout(() => {
        if (!mapContainerRef.current || mapRef.current) return
        
        // Find initial center from existing coordinates
        const siteLat = parseFloat(siteLocation?.lat) || 49.5
        const siteLng = parseFloat(siteLocation?.lng) || -123.1
        const hasCoords = siteLocation?.lat && siteLocation?.lng
        const zoom = hasCoords ? 15 : 5

        const map = L.map(mapContainerRef.current).setView([siteLat, siteLng], zoom)
        mapRef.current = map

        // Add satellite/hybrid tile layer option
        const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        })
        
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri'
        })

        osmLayer.addTo(map)
        
        L.control.layers({
          'Street Map': osmLayer,
          'Satellite': satelliteLayer
        }).addTo(map)
        
        // Force map to recalculate size multiple times to ensure proper rendering
        setTimeout(() => { if (map) map.invalidateSize() }, 100)
        setTimeout(() => { if (map) map.invalidateSize() }, 250)
        setTimeout(() => { if (map) map.invalidateSize() }, 500)

      // Create custom icon function
      const createIcon = (color, emoji) => {
        return L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 14px;">${emoji}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }

      // Create markers for each point type
      const createMarker = (type, lat, lng) => {
        if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) return null
        
        const { color, icon } = markerColors[type]
        const marker = L.marker([parseFloat(lat), parseFloat(lng)], {
          draggable: true,
          icon: createIcon(color, icon)
        }).addTo(map)

        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          setCoords(prev => ({
            ...prev,
            [type]: { lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) }
          }))
        })

        marker.bindTooltip(markerColors[type].label, { permanent: false })
        return marker
      }

      // Initialize existing markers
      if (siteLocation?.lat && siteLocation?.lng) {
        markersRef.current.site = createMarker('site', siteLocation.lat, siteLocation.lng)
      }
      if (launchPoint?.lat && launchPoint?.lng) {
        markersRef.current.launch = createMarker('launch', launchPoint.lat, launchPoint.lng)
      }
      if (recoveryPoint?.lat && recoveryPoint?.lng) {
        markersRef.current.recovery = createMarker('recovery', recoveryPoint.lat, recoveryPoint.lng)
      }

      // Draw existing boundary
      if (boundary && boundary.length >= 3) {
        const polygon = L.polygon(boundary.map(p => [p.lat, p.lng]), {
          color: '#7c3aed',
          fillColor: '#7c3aed',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map)
        boundaryLayerRef.current = polygon
        setBoundaryPoints(boundary)
      }

      // Map click handler - uses refs to get current state values
      map.on('click', (e) => {
        const currentActiveMarker = activeMarkerRef.current
        const currentIsDrawingBoundary = isDrawingBoundaryRef.current
        
        if (currentIsDrawingBoundary) {
          // Add point to boundary
          setBoundaryPoints(prev => [...prev, { lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) }])
        } else {
          // Place/move active marker
          const { color, icon } = markerColors[currentActiveMarker]
          
          if (markersRef.current[currentActiveMarker]) {
            markersRef.current[currentActiveMarker].setLatLng(e.latlng)
          } else {
            const marker = L.marker(e.latlng, {
              draggable: true,
              icon: createIcon(color, icon)
            }).addTo(map)

            marker.on('dragend', () => {
              const pos = marker.getLatLng()
              const markerType = currentActiveMarker // capture in closure
              setCoords(prev => ({
                ...prev,
                [markerType]: { lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) }
              }))
            })

            marker.bindTooltip(markerColors[currentActiveMarker].label, { permanent: false })
            markersRef.current[currentActiveMarker] = marker
          }

          setCoords(prev => ({
            ...prev,
            [currentActiveMarker]: { lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) }
          }))
        }
      })

        setIsLoading(false)
      }, 50) // end setTimeout
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current = {}
        boundaryLayerRef.current = null
        boundaryVertexMarkersRef.current = []
      }
    }
  }, [isOpen])

  // Update boundary polygon when points change
  useEffect(() => {
    if (!mapRef.current || !window.L) return

    const L = window.L
    const map = mapRef.current

    // Remove existing boundary polygon/polyline
    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current)
      boundaryLayerRef.current = null
    }

    // Remove existing vertex markers
    boundaryVertexMarkersRef.current.forEach(marker => {
      if (marker) map.removeLayer(marker)
    })
    boundaryVertexMarkersRef.current = []

    // Draw new boundary if we have enough points
    if (boundaryPoints.length >= 3) {
      const polygon = L.polygon(
        boundaryPoints.map(p => [parseFloat(p.lat), parseFloat(p.lng)]),
        {
          color: '#7c3aed',
          fillColor: '#7c3aed',
          fillOpacity: 0.2,
          weight: 2,
          dashArray: isDrawingBoundary ? '5, 10' : null
        }
      ).addTo(map)
      boundaryLayerRef.current = polygon

      // Add draggable vertex markers (only when not actively drawing)
      if (!isDrawingBoundary) {
        boundaryPoints.forEach((point, index) => {
          const vertexMarker = L.circleMarker(
            [parseFloat(point.lat), parseFloat(point.lng)],
            {
              radius: 8,
              color: '#7c3aed',
              fillColor: '#ffffff',
              fillOpacity: 1,
              weight: 3,
              className: 'boundary-vertex'
            }
          ).addTo(map)

          // Make it draggable using a custom approach
          vertexMarker.on('mousedown', function(e) {
            L.DomEvent.stopPropagation(e)
            L.DomEvent.preventDefault(e)
            map.dragging.disable()
            
            const onMouseMove = (moveEvent) => {
              const newLatLng = moveEvent.latlng
              vertexMarker.setLatLng(newLatLng)
              
              // Update polygon in real-time
              const newPoints = [...boundaryPoints]
              newPoints[index] = { 
                lat: newLatLng.lat.toFixed(6), 
                lng: newLatLng.lng.toFixed(6) 
              }
              if (boundaryLayerRef.current) {
                boundaryLayerRef.current.setLatLngs(
                  newPoints.map(p => [parseFloat(p.lat), parseFloat(p.lng)])
                )
              }
            }

            const onMouseUp = (upEvent) => {
              map.dragging.enable()
              map.off('mousemove', onMouseMove)
              map.off('mouseup', onMouseUp)
              
              // Update state with final position
              const finalLatLng = vertexMarker.getLatLng()
              setBoundaryPoints(prev => {
                const newPoints = [...prev]
                newPoints[index] = { 
                  lat: finalLatLng.lat.toFixed(6), 
                  lng: finalLatLng.lng.toFixed(6) 
                }
                return newPoints
              })
            }

            map.on('mousemove', onMouseMove)
            map.on('mouseup', onMouseUp)
          })

          vertexMarker.bindTooltip(`Point ${index + 1} (drag to move)`, { 
            permanent: false,
            direction: 'top'
          })

          boundaryVertexMarkersRef.current.push(vertexMarker)
        })
      }
    } else if (boundaryPoints.length >= 1) {
      // Show points as they're being added
      const points = boundaryPoints.map(p => [parseFloat(p.lat), parseFloat(p.lng)])
      if (points.length >= 2) {
        const polyline = L.polyline(points, {
          color: '#7c3aed',
          weight: 2,
          dashArray: '5, 10'
        }).addTo(map)
        boundaryLayerRef.current = polyline
      }
      
      // Show small markers for points being added
      boundaryPoints.forEach((point, index) => {
        const vertexMarker = L.circleMarker(
          [parseFloat(point.lat), parseFloat(point.lng)],
          {
            radius: 6,
            color: '#7c3aed',
            fillColor: '#7c3aed',
            fillOpacity: 0.8,
            weight: 2
          }
        ).addTo(map)
        boundaryVertexMarkersRef.current.push(vertexMarker)
      })
    }
  }, [boundaryPoints, isDrawingBoundary])

  const handleSearch = async () => {
    if (!searchQuery.trim() || !window.L || !mapRef.current) return
    setSearching(true)
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        mapRef.current.setView([lat, lon], 15)
      } else {
        alert('Location not found. Try a more specific search.')
      }
    } catch (err) {
      console.error('Search error:', err)
      alert('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleSave = () => {
    onUpdate({
      siteLocation: coords.site,
      launchPoint: coords.launch,
      recoveryPoint: coords.recovery,
      boundary: boundaryPoints.length >= 3 ? boundaryPoints : []
    })
    onClose()
  }

  const clearBoundary = () => {
    setBoundaryPoints([])
    if (boundaryLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(boundaryLayerRef.current)
      boundaryLayerRef.current = null
    }
  }

  const undoLastBoundaryPoint = () => {
    setBoundaryPoints(prev => prev.slice(0, -1))
  }

  const toggleBoundaryDrawing = () => {
    setIsDrawingBoundary(prev => !prev)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-aeria-blue" />
            <h2 className="text-lg font-semibold text-gray-900">Site Map Editor</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b bg-gray-50 space-y-3">
          {/* Search */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a location..."
              className="input flex-1 text-sm"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>

          {/* Marker Selection */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Click to place:</span>
            {Object.entries(markerColors).map(([key, { color, label, icon }]) => (
              <button
                key={key}
                onClick={() => { setActiveMarker(key); setIsDrawingBoundary(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                  activeMarker === key && !isDrawingBoundary
                    ? 'ring-2 ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ 
                  backgroundColor: `${color}20`, 
                  color: color,
                  ringColor: color
                }}
              >
                <span>{icon}</span>
                {label}
                {coords[key].lat && <CheckCircle2 className="w-3 h-3" />}
              </button>
            ))}
            
            <div className="h-6 w-px bg-gray-300 mx-2" />
            
            {/* Boundary Drawing */}
            <button
              onClick={toggleBoundaryDrawing}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                isDrawingBoundary
                  ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500 ring-offset-2'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              <Target className="w-4 h-4" />
              {isDrawingBoundary ? 'Drawing Boundary...' : 'Draw Boundary'}
              {boundaryPoints.length >= 3 && !isDrawingBoundary && <CheckCircle2 className="w-3 h-3" />}
            </button>
            
            {isDrawingBoundary && (
              <>
                <button
                  onClick={undoLastBoundaryPoint}
                  disabled={boundaryPoints.length === 0}
                  className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50"
                >
                  Undo
                </button>
                <button
                  onClick={() => setIsDrawingBoundary(false)}
                  className="px-2 py-1.5 text-sm text-green-600 hover:bg-green-100 rounded"
                >
                  Done ({boundaryPoints.length} pts)
                </button>
              </>
            )}
            
            {boundaryPoints.length > 0 && !isDrawingBoundary && (
              <button
                onClick={clearBoundary}
                className="px-2 py-1.5 text-sm text-red-600 hover:bg-red-100 rounded"
              >
                Clear Boundary
              </button>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative" style={{ height: '450px', width: '100%' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <Loader2 className="w-8 h-8 text-aeria-blue animate-spin" />
            </div>
          )}
          <div ref={mapContainerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          
          {/* Instructions overlay */}
          {isDrawingBoundary && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-[1000]">
              Click on map to add boundary points. Click "Done" when finished.
            </div>
          )}
        </div>

        {/* Coordinates Summary */}
        <div className="p-3 border-t bg-gray-50">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">📍 Site:</span>{' '}
              <span className="font-mono text-gray-600">
                {coords.site.lat && coords.site.lng 
                  ? `${coords.site.lat}, ${coords.site.lng}`
                  : 'Not set'}
              </span>
            </div>
            <div>
              <span className="font-medium text-green-700">🛫 Launch:</span>{' '}
              <span className="font-mono text-gray-600">
                {coords.launch.lat && coords.launch.lng
                  ? `${coords.launch.lat}, ${coords.launch.lng}`
                  : 'Not set'}
              </span>
            </div>
            <div>
              <span className="font-medium text-amber-700">🛬 Recovery:</span>{' '}
              <span className="font-mono text-gray-600">
                {coords.recovery.lat && coords.recovery.lng
                  ? `${coords.recovery.lat}, ${coords.recovery.lng}`
                  : 'Not set'}
              </span>
            </div>
          </div>
          {boundaryPoints.length >= 3 && (
            <div className="mt-2 text-sm">
              <span className="font-medium text-purple-700">🔷 Boundary:</span>{' '}
              <span className="text-gray-600">{boundaryPoints.length} points defined</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Drag markers to reposition. Click map to place selected marker type.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Save All Points
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAP PREVIEW COMPONENT
// Shows embedded map preview with all points using Leaflet
// ============================================
function MapPreview({ siteLocation, launchPoint, recoveryPoint, boundary, onOpenEditor }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  const hasCoords = siteLocation?.lat && siteLocation?.lng && 
    !isNaN(parseFloat(siteLocation.lat)) && !isNaN(parseFloat(siteLocation.lng))
  
  const hasLaunch = launchPoint?.lat && launchPoint?.lng && 
    !isNaN(parseFloat(launchPoint.lat)) && !isNaN(parseFloat(launchPoint.lng))
  const hasRecovery = recoveryPoint?.lat && recoveryPoint?.lng &&
    !isNaN(parseFloat(recoveryPoint.lat)) && !isNaN(parseFloat(recoveryPoint.lng))
  const hasBoundary = boundary && boundary.length >= 3

  // Initialize map
  useEffect(() => {
    if (!hasCoords || !mapContainerRef.current) return

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) {
          resolve(window.L)
          return
        }
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => resolve(window.L)
        document.body.appendChild(script)
      })
    }

    loadLeaflet().then((L) => {
      // Clean up existing map
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      if (!mapContainerRef.current) return

      const lat = parseFloat(siteLocation.lat)
      const lng = parseFloat(siteLocation.lng)

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: true
      }).setView([lat, lng], 15)
      
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM'
      }).addTo(map)

      // Custom icon function
      const createIcon = (color, emoji) => {
        return L.divIcon({
          className: 'custom-marker-preview',
          html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 12px;">${emoji}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      }

      // Add site marker
      L.marker([lat, lng], {
        icon: createIcon('#1e40af', '📍')
      }).addTo(map).bindTooltip('Site Location', { permanent: false })

      // Add launch marker
      if (hasLaunch) {
        L.marker([parseFloat(launchPoint.lat), parseFloat(launchPoint.lng)], {
          icon: createIcon('#16a34a', '🛫')
        }).addTo(map).bindTooltip('Launch Point', { permanent: false })
      }

      // Add recovery marker
      if (hasRecovery) {
        L.marker([parseFloat(recoveryPoint.lat), parseFloat(recoveryPoint.lng)], {
          icon: createIcon('#d97706', '🛬')
        }).addTo(map).bindTooltip('Recovery Point', { permanent: false })
      }

      // Add boundary polygon
      if (hasBoundary) {
        L.polygon(
          boundary.map(p => [parseFloat(p.lat), parseFloat(p.lng)]),
          {
            color: '#7c3aed',
            fillColor: '#7c3aed',
            fillOpacity: 0.15,
            weight: 2
          }
        ).addTo(map)
      }

      // Fit bounds to show all markers
      const bounds = L.latLngBounds([[lat, lng]])
      if (hasLaunch) bounds.extend([parseFloat(launchPoint.lat), parseFloat(launchPoint.lng)])
      if (hasRecovery) bounds.extend([parseFloat(recoveryPoint.lat), parseFloat(recoveryPoint.lng)])
      if (hasBoundary) {
        boundary.forEach(p => bounds.extend([parseFloat(p.lat), parseFloat(p.lng)]))
      }
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 })
      }

      // Invalidate size after render
      setTimeout(() => {
        if (map) map.invalidateSize()
      }, 100)

      setMapReady(true)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [hasCoords, siteLocation?.lat, siteLocation?.lng, launchPoint?.lat, launchPoint?.lng, recoveryPoint?.lat, recoveryPoint?.lng, boundary])

  if (!hasCoords) {
    return (
      <div 
        onClick={onOpenEditor}
        className="h-56 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-aeria-blue hover:bg-gray-50 transition-colors"
      >
        <Map className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 font-medium">Click to open map editor</p>
        <p className="text-xs text-gray-400 mt-1">Set site location, launch/recovery points, and boundary</p>
      </div>
    )
  }

  const lat = parseFloat(siteLocation.lat)
  const lng = parseFloat(siteLocation.lng)

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <div 
          ref={mapContainerRef} 
          style={{ width: '100%', height: '220px' }}
        />
        <button
          onClick={onOpenEditor}
          className="absolute top-2 right-2 px-3 py-1.5 bg-white rounded-lg shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 z-[1000]"
        >
          <Target className="w-4 h-4" />
          Edit Map
        </button>
        
        {/* Point indicators */}
        <div className="absolute bottom-2 left-2 flex gap-2 z-[1000]">
          <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
            📍 Site
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
            hasLaunch ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            🛫 Launch
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
            hasRecovery ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
          }`}>
            🛬 Recovery
          </div>
          {hasBoundary && (
            <div className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
              🔷 Boundary
            </div>
          )}
        </div>
      </div>

      {/* Coordinates display */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 bg-blue-50 rounded">
          <div className="font-medium text-blue-700 mb-1">📍 Site Location</div>
          <div className="font-mono text-gray-600">{lat.toFixed(5)}, {lng.toFixed(5)}</div>
        </div>
        <div className={`p-2 rounded ${hasLaunch ? 'bg-green-50' : 'bg-gray-50'}`}>
          <div className={`font-medium mb-1 ${hasLaunch ? 'text-green-700' : 'text-gray-500'}`}>🛫 Launch Point</div>
          <div className="font-mono text-gray-600">
            {hasLaunch ? `${parseFloat(launchPoint.lat).toFixed(5)}, ${parseFloat(launchPoint.lng).toFixed(5)}` : 'Not set'}
          </div>
        </div>
        <div className={`p-2 rounded ${hasRecovery ? 'bg-amber-50' : 'bg-gray-50'}`}>
          <div className={`font-medium mb-1 ${hasRecovery ? 'text-amber-700' : 'text-gray-500'}`}>🛬 Recovery Point</div>
          <div className="font-mono text-gray-600">
            {hasRecovery ? `${parseFloat(recoveryPoint.lat).toFixed(5)}, ${parseFloat(recoveryPoint.lng).toFixed(5)}` : 'Not set'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
// DISTANCE CALCULATIONS COMPONENT
// Shows calculated distances and area from map points
// ============================================
function DistanceCalculations({ siteLocation, launchPoint, recoveryPoint, boundary }) {
  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return null
    
    const R = 6371000 // Earth's radius in meters
    const φ1 = parseFloat(lat1) * Math.PI / 180
    const φ2 = parseFloat(lat2) * Math.PI / 180
    const Δφ = (parseFloat(lat2) - parseFloat(lat1)) * Math.PI / 180
    const Δλ = (parseFloat(lng2) - parseFloat(lng1)) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  // Calculate polygon area using Shoelace formula (approximate for small areas)
  const calculateBoundaryArea = (points) => {
    if (!points || points.length < 3) return null
    
    // Convert to approximate meters using center point as reference
    const centerLat = points.reduce((sum, p) => sum + parseFloat(p.lat), 0) / points.length
    const metersPerDegreeLat = 111320
    const metersPerDegreeLng = 111320 * Math.cos(centerLat * Math.PI / 180)
    
    // Convert points to meters
    const metersPoints = points.map(p => ({
      x: parseFloat(p.lng) * metersPerDegreeLng,
      y: parseFloat(p.lat) * metersPerDegreeLat
    }))
    
    // Shoelace formula
    let area = 0
    for (let i = 0; i < metersPoints.length; i++) {
      const j = (i + 1) % metersPoints.length
      area += metersPoints[i].x * metersPoints[j].y
      area -= metersPoints[j].x * metersPoints[i].y
    }
    area = Math.abs(area) / 2
    
    return area // Area in square meters
  }

  const formatDistance = (meters) => {
    if (meters === null) return null
    if (meters < 1000) return `${Math.round(meters)} m`
    return `${(meters / 1000).toFixed(2)} km`
  }

  const formatArea = (sqMeters) => {
    if (sqMeters === null) return null
    if (sqMeters < 10000) return `${Math.round(sqMeters).toLocaleString()} m²`
    return `${(sqMeters / 10000).toFixed(2)} hectares`
  }

  const hasLaunch = launchPoint?.lat && launchPoint?.lng
  const hasRecovery = recoveryPoint?.lat && recoveryPoint?.lng
  const hasBoundary = boundary && boundary.length >= 3

  const siteToLaunch = hasLaunch ? calculateDistance(
    siteLocation.lat, siteLocation.lng, launchPoint.lat, launchPoint.lng
  ) : null
  
  const siteToRecovery = hasRecovery ? calculateDistance(
    siteLocation.lat, siteLocation.lng, recoveryPoint.lat, recoveryPoint.lng
  ) : null
  
  const launchToRecovery = hasLaunch && hasRecovery ? calculateDistance(
    launchPoint.lat, launchPoint.lng, recoveryPoint.lat, recoveryPoint.lng
  ) : null

  const boundaryArea = hasBoundary ? calculateBoundaryArea(boundary) : null

  // Don't render if no data to show
  if (!hasLaunch && !hasRecovery && !hasBoundary) return null

  return (
    <div className="p-3 bg-gray-50 rounded-lg border">
      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Navigation2 className="w-4 h-4" />
        Calculated Measurements
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {siteToLaunch !== null && (
          <div>
            <div className="text-xs text-gray-500">Site → Launch</div>
            <div className="font-medium text-green-700">{formatDistance(siteToLaunch)}</div>
          </div>
        )}
        {siteToRecovery !== null && (
          <div>
            <div className="text-xs text-gray-500">Site → Recovery</div>
            <div className="font-medium text-amber-700">{formatDistance(siteToRecovery)}</div>
          </div>
        )}
        {launchToRecovery !== null && (
          <div>
            <div className="text-xs text-gray-500">Launch → Recovery</div>
            <div className="font-medium text-blue-700">{formatDistance(launchToRecovery)}</div>
          </div>
        )}
        {boundaryArea !== null && (
          <div>
            <div className="text-xs text-gray-500">Boundary Area</div>
            <div className="font-medium text-purple-700">{formatArea(boundaryArea)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectSiteSurvey({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    launchRecovery: true,
    population: true,
    airspace: true,
    obstacles: true,
    access: true,
    ground: false,
    notes: false
  })
  const [copiedCoords, setCopiedCoords] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [mapEditorOpen, setMapEditorOpen] = useState(false)

  // Initialize site survey if not present
  useEffect(() => {
    if (initialized || !project) return

    if (!project.siteSurvey) {
      setInitialized(true)
      onUpdate({
        siteSurvey: {
          location: {
            name: '',
            address: '',
            coordinates: { lat: '', lng: '' },
            elevation: '',
            description: ''
          },
          population: {
            category: 'sparsely',
            justification: '',
            source: 'visual',
            adjacentCategory: 'sparsely',
            adjacentJustification: ''
          },
          airspace: {
            classification: 'G',
            nearbyAerodromes: [],
            notams: '',
            restrictions: '',
            navCanadaAuth: false,
            authNumber: ''
          },
          obstacles: [],
          launchRecovery: {
            launchPoint: { lat: '', lng: '', description: '' },
            recoveryPoint: { lat: '', lng: '', description: '' },
            alternatePoints: []
          },
          boundary: [],
          access: {
            type: 'public_road',
            directions: '',
            parkingLocation: '',
            gateCode: '',
            contactOnSite: '',
            restrictions: ''
          },
          groundConditions: {
            type: 'grass',
            hazards: '',
            suitableForVehicle: true,
            notes: ''
          },
          surroundings: {
            populatedAreas: '',
            sensitiveAreas: '',
            wildlife: '',
            noise: ''
          },
          photos: [],
          surveyDate: '',
          surveyedBy: '',
          notes: ''
        }
      })
    } else if (!project.siteSurvey.population) {
      setInitialized(true)
      onUpdate({
        siteSurvey: {
          ...project.siteSurvey,
          population: {
            category: 'sparsely',
            justification: '',
            source: 'visual',
            adjacentCategory: 'sparsely',
            adjacentJustification: ''
          }
        }
      })
    } else {
      setInitialized(true)
    }
  }, [initialized, project, onUpdate])

  if (!project) return <div className="p-4 text-gray-500">Loading...</div>

  const siteSurvey = project.siteSurvey || {}

  const updateSiteSurvey = (updates) => {
    onUpdate({
      siteSurvey: {
        ...siteSurvey,
        ...updates
      }
    })
  }

  const updateLocation = (field, value) => {
    updateSiteSurvey({
      location: { ...(siteSurvey.location || {}), [field]: value }
    })
  }

  const updateCoordinates = (field, value) => {
    updateSiteSurvey({
      location: {
        ...(siteSurvey.location || {}),
        coordinates: { ...(siteSurvey.location?.coordinates || {}), [field]: value }
      }
    })
  }

  const updatePopulation = (field, value) => {
    updateSiteSurvey({
      population: { ...(siteSurvey.population || {}), [field]: value }
    })
  }

  const updateAirspace = (field, value) => {
    updateSiteSurvey({
      airspace: { ...(siteSurvey.airspace || {}), [field]: value }
    })
  }

  const updateAccess = (field, value) => {
    updateSiteSurvey({
      access: { ...(siteSurvey.access || {}), [field]: value }
    })
  }

  const updateGroundConditions = (field, value) => {
    updateSiteSurvey({
      groundConditions: { ...(siteSurvey.groundConditions || {}), [field]: value }
    })
  }

  const updateSurroundings = (field, value) => {
    updateSiteSurvey({
      surroundings: { ...(siteSurvey.surroundings || {}), [field]: value }
    })
  }

  const updateLaunchRecovery = (point, field, value) => {
    updateSiteSurvey({
      launchRecovery: {
        ...(siteSurvey.launchRecovery || {}),
        [point]: { ...(siteSurvey.launchRecovery?.[point] || {}), [field]: value }
      }
    })
  }

  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6)
        const lng = position.coords.longitude.toFixed(6)
        updateSiteSurvey({
          location: {
            ...(siteSurvey.location || {}),
            coordinates: { lat, lng }
          }
        })
        setGettingLocation(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Unable to get your location. Please check your browser permissions.')
        setGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Handle unified map editor save
  const handleMapEditorSave = ({ siteLocation, launchPoint, recoveryPoint, boundary }) => {
    updateSiteSurvey({
      location: {
        ...(siteSurvey.location || {}),
        coordinates: siteLocation
      },
      launchRecovery: {
        ...(siteSurvey.launchRecovery || {}),
        launchPoint: { 
          ...(siteSurvey.launchRecovery?.launchPoint || {}),
          lat: launchPoint.lat,
          lng: launchPoint.lng
        },
        recoveryPoint: {
          ...(siteSurvey.launchRecovery?.recoveryPoint || {}),
          lat: recoveryPoint.lat,
          lng: recoveryPoint.lng
        }
      },
      boundary: boundary
    })
  }

  // Obstacles management
  const addObstacle = () => {
    updateSiteSurvey({
      obstacles: [...(siteSurvey.obstacles || []), {
        type: 'tower',
        description: '',
        height: '',
        distance: '',
        bearing: '',
        mitigations: ''
      }]
    })
  }

  const updateObstacle = (index, field, value) => {
    const newObstacles = [...(siteSurvey.obstacles || [])]
    newObstacles[index] = { ...newObstacles[index], [field]: value }
    updateSiteSurvey({ obstacles: newObstacles })
  }

  const removeObstacle = (index) => {
    const newObstacles = (siteSurvey.obstacles || []).filter((_, i) => i !== index)
    updateSiteSurvey({ obstacles: newObstacles })
  }

  // Nearby aerodromes
  const addAerodrome = () => {
    updateAirspace('nearbyAerodromes', [...(siteSurvey.airspace?.nearbyAerodromes || []), {
      name: '',
      identifier: '',
      distance: '',
      bearing: ''
    }])
  }

  const updateAerodrome = (index, field, value) => {
    const newAerodromes = [...(siteSurvey.airspace?.nearbyAerodromes || [])]
    newAerodromes[index] = { ...newAerodromes[index], [field]: value }
    updateAirspace('nearbyAerodromes', newAerodromes)
  }

  const removeAerodrome = (index) => {
    const newAerodromes = (siteSurvey.airspace?.nearbyAerodromes || []).filter((_, i) => i !== index)
    updateAirspace('nearbyAerodromes', newAerodromes)
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const copyCoordinates = () => {
    const coords = `${siteSurvey.location?.coordinates?.lat}, ${siteSurvey.location?.coordinates?.lng}`
    navigator.clipboard.writeText(coords)
    setCopiedCoords(true)
    setTimeout(() => setCopiedCoords(false), 2000)
  }

  const openInMaps = () => {
    const { lat, lng } = siteSurvey.location?.coordinates || {}
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
    }
  }

  const openDirections = () => {
    const { lat, lng } = siteSurvey.location?.coordinates || {}
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      {/* Location */}
      <div className="card">
        <button
          onClick={() => toggleSection('location')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-aeria-blue" />
            Location
          </h2>
          {expandedSections.location ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.location && (
          <div className="mt-4 space-y-4">
            {/* Map Preview */}
            <MapPreview
              siteLocation={siteSurvey.location?.coordinates}
              launchPoint={siteSurvey.launchRecovery?.launchPoint}
              recoveryPoint={siteSurvey.launchRecovery?.recoveryPoint}
              boundary={siteSurvey.boundary}
              onOpenEditor={() => setMapEditorOpen(true)}
            />

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMapEditorOpen(true)}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Map className="w-4 h-4" />
                Edit Map & Points
              </button>
              
              <button
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                {gettingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Crosshair className="w-4 h-4" />
                )}
                {gettingLocation ? 'Getting Location...' : 'Use My Location'}
              </button>

              {siteSurvey.location?.coordinates?.lat && siteSurvey.location?.coordinates?.lng && (
                <>
                  <button
                    onClick={copyCoordinates}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    {copiedCoords ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copiedCoords ? 'Copied!' : 'Copy Coords'}
                  </button>

                  <button
                    onClick={openInMaps}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Google Maps
                  </button>

                  <button
                    onClick={openDirections}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Directions
                  </button>
                </>
              )}
            </div>

            {/* Site Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Site Name *</label>
                <input
                  type="text"
                  value={siteSurvey.location?.name || ''}
                  onChange={(e) => updateLocation('name', e.target.value)}
                  className="input"
                  placeholder="e.g., Quintette Mine North Pit"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Address / Location Description</label>
                  {siteSurvey.location?.coordinates?.lat && !siteSurvey.location?.address && (
                    <button
                      onClick={async () => {
                        const { lat, lng } = siteSurvey.location.coordinates
                        try {
                          const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`
                          )
                          const data = await response.json()
                          if (data.display_name) {
                            updateLocation('address', data.display_name)
                          }
                        } catch (err) {
                          console.error('Reverse geocode failed:', err)
                        }
                      }}
                      className="text-xs text-aeria-blue hover:underline flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      Auto-fill from coordinates
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={siteSurvey.location?.address || ''}
                  onChange={(e) => updateLocation('address', e.target.value)}
                  className="input"
                  placeholder="e.g., 15km NW of Tumbler Ridge, BC"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Elevation (m ASL)</label>
                  {siteSurvey.location?.coordinates?.lat && !siteSurvey.location?.elevation && (
                    <button
                      onClick={async () => {
                        const { lat, lng } = siteSurvey.location.coordinates
                        try {
                          const response = await fetch(
                            `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
                          )
                          const data = await response.json()
                          if (data.results?.[0]?.elevation) {
                            updateLocation('elevation', Math.round(data.results[0].elevation).toString())
                          }
                        } catch (err) {
                          console.error('Elevation lookup failed:', err)
                        }
                      }}
                      className="text-xs text-aeria-blue hover:underline flex items-center gap-1"
                    >
                      <Mountain className="w-3 h-3" />
                      Auto-fill elevation
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={siteSurvey.location?.elevation || ''}
                  onChange={(e) => updateLocation('elevation', e.target.value)}
                  className="input"
                  placeholder="e.g., 1250"
                />
              </div>

              <div>
                <label className="label">Coordinates</label>
                <div className="input bg-gray-50 font-mono text-sm flex items-center justify-between">
                  {siteSurvey.location?.coordinates?.lat && siteSurvey.location?.coordinates?.lng ? (
                    <>
                      <span>{siteSurvey.location.coordinates.lat}, {siteSurvey.location.coordinates.lng}</span>
                      <button 
                        onClick={() => setMapEditorOpen(true)}
                        className="text-aeria-blue text-xs hover:underline"
                      >
                        Edit
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400">Set via Map Editor</span>
                  )}
                </div>
              </div>
            </div>

            {/* Calculated Distances */}
            {siteSurvey.location?.coordinates?.lat && (
              <DistanceCalculations 
                siteLocation={siteSurvey.location?.coordinates}
                launchPoint={siteSurvey.launchRecovery?.launchPoint}
                recoveryPoint={siteSurvey.launchRecovery?.recoveryPoint}
                boundary={siteSurvey.boundary}
              />
            )}

            <div>
              <label className="label">Site Description</label>
              <textarea
                value={siteSurvey.location?.description || ''}
                onChange={(e) => updateLocation('description', e.target.value)}
                className="input min-h-[80px]"
                placeholder="General description of the site, terrain, landmarks, notable features..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Launch/Recovery Point Descriptions */}
      <div className="card">
        <button
          onClick={() => toggleSection('launchRecovery')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-aeria-blue" />
            Launch & Recovery Details
          </h2>
          {expandedSections.launchRecovery ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.launchRecovery && (
          <div className="mt-4 space-y-4">
            {/* Launch Point */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-green-800 flex items-center gap-2">
                  <span className="text-lg">🛫</span>
                  Launch Point
                </h3>
                <div className="flex items-center gap-2">
                  {siteSurvey.launchRecovery?.launchPoint?.lat ? (
                    <span className="text-xs font-mono text-green-600 bg-green-100 px-2 py-0.5 rounded">
                      {siteSurvey.launchRecovery.launchPoint.lat}, {siteSurvey.launchRecovery.launchPoint.lng}
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">Not set</span>
                  )}
                </div>
              </div>
              
              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => setMapEditorOpen(true)}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
                >
                  <Target className="w-3 h-3" />
                  Set on Map
                </button>
                {siteSurvey.location?.coordinates?.lat && !siteSurvey.launchRecovery?.launchPoint?.lat && (
                  <button
                    onClick={() => {
                      const { lat, lng } = siteSurvey.location.coordinates
                      updateLaunchRecovery('launchPoint', 'lat', lat)
                      updateLaunchRecovery('launchPoint', 'lng', lng)
                    }}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Use Site Location
                  </button>
                )}
              </div>
              
              <div>
                <label className="label text-xs">Description *</label>
                <textarea
                  value={siteSurvey.launchRecovery?.launchPoint?.description || ''}
                  onChange={(e) => updateLaunchRecovery('launchPoint', 'description', e.target.value)}
                  className="input text-sm"
                  rows={2}
                  placeholder="Describe the launch area: surface type, dimensions, clearances, obstacles..."
                />
              </div>
            </div>

            {/* Recovery Point */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-amber-800 flex items-center gap-2">
                  <span className="text-lg">🛬</span>
                  Recovery Point
                </h3>
                <div className="flex items-center gap-2">
                  {siteSurvey.launchRecovery?.recoveryPoint?.lat ? (
                    <span className="text-xs font-mono text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                      {siteSurvey.launchRecovery.recoveryPoint.lat}, {siteSurvey.launchRecovery.recoveryPoint.lng}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Not set</span>
                  )}
                </div>
              </div>
              
              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => setMapEditorOpen(true)}
                  className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 flex items-center gap-1"
                >
                  <Target className="w-3 h-3" />
                  Set on Map
                </button>
                {siteSurvey.launchRecovery?.launchPoint?.lat && (
                  <button
                    onClick={() => {
                      const { lat, lng, description } = siteSurvey.launchRecovery.launchPoint
                      updateLaunchRecovery('recoveryPoint', 'lat', lat)
                      updateLaunchRecovery('recoveryPoint', 'lng', lng)
                      if (!siteSurvey.launchRecovery?.recoveryPoint?.description) {
                        updateLaunchRecovery('recoveryPoint', 'description', 'Same as launch point')
                      }
                    }}
                    className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Same as Launch
                  </button>
                )}
                {siteSurvey.location?.coordinates?.lat && !siteSurvey.launchRecovery?.recoveryPoint?.lat && (
                  <button
                    onClick={() => {
                      const { lat, lng } = siteSurvey.location.coordinates
                      updateLaunchRecovery('recoveryPoint', 'lat', lat)
                      updateLaunchRecovery('recoveryPoint', 'lng', lng)
                    }}
                    className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Use Site Location
                  </button>
                )}
              </div>
              
              <div>
                <label className="label text-xs">Description *</label>
                <textarea
                  value={siteSurvey.launchRecovery?.recoveryPoint?.description || ''}
                  onChange={(e) => updateLaunchRecovery('recoveryPoint', 'description', e.target.value)}
                  className="input text-sm"
                  rows={2}
                  placeholder="Describe the recovery area, or note if same as launch point..."
                />
              </div>
            </div>

            {/* Boundary Info */}
            <div className={`p-4 rounded-lg border ${
              siteSurvey.boundary && siteSurvey.boundary.length >= 3 
                ? 'bg-purple-50 border-purple-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-medium flex items-center gap-2 ${
                  siteSurvey.boundary && siteSurvey.boundary.length >= 3 
                    ? 'text-purple-800' 
                    : 'text-gray-600'
                }`}>
                  <span className="text-lg">🔷</span>
                  Operational Boundary
                </h3>
                {siteSurvey.boundary && siteSurvey.boundary.length >= 3 ? (
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                    {siteSurvey.boundary.length} points defined
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    Not defined
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setMapEditorOpen(true)}
                  className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                    siteSurvey.boundary && siteSurvey.boundary.length >= 3
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Target className="w-3 h-3" />
                  {siteSurvey.boundary && siteSurvey.boundary.length >= 3 ? 'Edit Boundary' : 'Draw Boundary'}
                </button>
                <span className="text-xs text-gray-500">
                  Define the operational area perimeter for SORA assessment
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Population Density */}
      <div className="card">
        <button
          onClick={() => toggleSection('population')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            Population Density (SORA)
          </h2>
          {expandedSections.population ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.population && (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>SORA Integration:</strong> Population density determines your Ground Risk Class (GRC). 
              Select the category that best represents your operational area.
            </div>

            {/* Operational Area Category */}
            <div>
              <label className="label">Operational Area Category</label>
              <div className="grid gap-2">
                {Object.entries(populationCategories).map(([key, cat]) => (
                  <label
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      siteSurvey.population?.category === key
                        ? 'bg-aeria-sky border-aeria-blue'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="populationCategory"
                      value={key}
                      checked={siteSurvey.population?.category === key}
                      onChange={(e) => updatePopulation('category', e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{cat.label}</div>
                      <div className="text-sm text-gray-600">{cat.description}</div>
                      <div className="text-xs text-gray-500 mt-1">Examples: {cat.examples}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Justification */}
            <div>
              <label className="label">Justification</label>
              <textarea
                value={siteSurvey.population?.justification || ''}
                onChange={(e) => updatePopulation('justification', e.target.value)}
                className="input min-h-[80px]"
                placeholder="Explain why this category was selected (e.g., based on site visit observation, satellite imagery review, census data)..."
              />
            </div>

            {/* Source */}
            <div>
              <label className="label">Assessment Source</label>
              <select
                value={siteSurvey.population?.source || 'visual'}
                onChange={(e) => updatePopulation('source', e.target.value)}
                className="input"
              >
                <option value="visual">Visual observation (site visit)</option>
                <option value="satellite">Satellite/aerial imagery</option>
                <option value="census">Census data</option>
                <option value="client">Client-provided information</option>
                <option value="multiple">Multiple sources</option>
              </select>
            </div>

            {/* Adjacent Area */}
            <div className="pt-4 border-t">
              <h3 className="font-medium text-gray-700 mb-3">Adjacent Area Category</h3>
              <p className="text-sm text-gray-500 mb-3">
                If the adjacent areas have different population density, record them here for contingency planning.
              </p>
              <select
                value={siteSurvey.population?.adjacentCategory || 'sparsely'}
                onChange={(e) => updatePopulation('adjacentCategory', e.target.value)}
                className="input"
              >
                {Object.entries(populationCategories).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Airspace */}
      <div className="card">
        <button
          onClick={() => toggleSection('airspace')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-aeria-blue" />
            Airspace
          </h2>
          {expandedSections.airspace ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.airspace && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Airspace Classification</label>
                <select
                  value={siteSurvey.airspace?.classification || 'G'}
                  onChange={(e) => updateAirspace('classification', e.target.value)}
                  className="input"
                >
                  <option value="G">Class G - Uncontrolled</option>
                  <option value="E">Class E - Controlled (above 700ft AGL)</option>
                  <option value="D">Class D - Control Zone</option>
                  <option value="C">Class C - Terminal Control</option>
                  <option value="B">Class B - Terminal Control (high density)</option>
                  <option value="F">Class F - Special Use</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={siteSurvey.airspace?.navCanadaAuth || false}
                    onChange={(e) => updateAirspace('navCanadaAuth', e.target.checked)}
                    className="w-4 h-4 text-aeria-navy rounded"
                  />
                  <span className="text-sm text-gray-700">NAV CANADA Authorization Required</span>
                </label>
              </div>
            </div>

            {siteSurvey.airspace?.navCanadaAuth && (
              <div>
                <label className="label">Authorization Number</label>
                <input
                  type="text"
                  value={siteSurvey.airspace?.authNumber || ''}
                  onChange={(e) => updateAirspace('authNumber', e.target.value)}
                  className="input"
                  placeholder="e.g., RPAS-2024-1234"
                />
              </div>
            )}

            {/* Nearby Aerodromes */}
            <div>
              <label className="label">Nearby Aerodromes (within 5nm)</label>
              {(siteSurvey.airspace?.nearbyAerodromes || []).length === 0 ? (
                <p className="text-sm text-gray-500 mb-2">No aerodromes added</p>
              ) : (
                <div className="space-y-2 mb-2">
                  {(siteSurvey.airspace?.nearbyAerodromes || []).map((aerodrome, index) => (
                    <div key={index} className="flex gap-2 items-start p-2 bg-gray-50 rounded">
                      <input
                        type="text"
                        value={aerodrome.name}
                        onChange={(e) => updateAerodrome(index, 'name', e.target.value)}
                        className="input text-sm flex-1"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={aerodrome.identifier}
                        onChange={(e) => updateAerodrome(index, 'identifier', e.target.value)}
                        className="input text-sm w-24"
                        placeholder="ID (e.g., CYYJ)"
                      />
                      <input
                        type="text"
                        value={aerodrome.distance}
                        onChange={(e) => updateAerodrome(index, 'distance', e.target.value)}
                        className="input text-sm w-20"
                        placeholder="nm"
                      />
                      <input
                        type="text"
                        value={aerodrome.bearing}
                        onChange={(e) => updateAerodrome(index, 'bearing', e.target.value)}
                        className="input text-sm w-20"
                        placeholder="Bearing °"
                      />
                      <button
                        onClick={() => removeAerodrome(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={addAerodrome}
                className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Aerodrome
              </button>
            </div>

            <div>
              <label className="label">NOTAMs / Restrictions</label>
              <textarea
                value={siteSurvey.airspace?.restrictions || ''}
                onChange={(e) => updateAirspace('restrictions', e.target.value)}
                className="input min-h-[80px]"
                placeholder="Active NOTAMs, TFRs, or other airspace restrictions..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Obstacles */}
      <div className="card">
        <button
          onClick={() => toggleSection('obstacles')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-aeria-blue" />
            Obstacles
            {(siteSurvey.obstacles || []).length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                {siteSurvey.obstacles.length}
              </span>
            )}
          </h2>
          {expandedSections.obstacles ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.obstacles && (
          <div className="mt-4 space-y-4">
            {(siteSurvey.obstacles || []).length === 0 ? (
              <p className="text-sm text-gray-500">No obstacles recorded</p>
            ) : (
              (siteSurvey.obstacles || []).map((obstacle, index) => {
                const ObstacleIcon = obstacleTypes.find(t => t.value === obstacle.type)?.icon || AlertTriangle
                return (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ObstacleIcon className="w-4 h-4 text-gray-500" />
                        <select
                          value={obstacle.type}
                          onChange={(e) => updateObstacle(index, 'type', e.target.value)}
                          className="text-sm font-medium bg-transparent border-none p-0"
                        >
                          {obstacleTypes.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => removeObstacle(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={obstacle.height}
                        onChange={(e) => updateObstacle(index, 'height', e.target.value)}
                        className="input text-sm"
                        placeholder="Height (m)"
                      />
                      <input
                        type="text"
                        value={obstacle.distance}
                        onChange={(e) => updateObstacle(index, 'distance', e.target.value)}
                        className="input text-sm"
                        placeholder="Distance (m)"
                      />
                      <input
                        type="text"
                        value={obstacle.bearing}
                        onChange={(e) => updateObstacle(index, 'bearing', e.target.value)}
                        className="input text-sm"
                        placeholder="Bearing (°)"
                      />
                      <input
                        type="text"
                        value={obstacle.description}
                        onChange={(e) => updateObstacle(index, 'description', e.target.value)}
                        className="input text-sm"
                        placeholder="Description"
                      />
                    </div>
                    <input
                      type="text"
                      value={obstacle.mitigations}
                      onChange={(e) => updateObstacle(index, 'mitigations', e.target.value)}
                      className="input text-sm"
                      placeholder="Mitigations (e.g., maintain 30m lateral clearance)"
                    />
                  </div>
                )
              })
            )}

            <button
              onClick={addObstacle}
              className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Obstacle
            </button>
          </div>
        )}
      </div>

      {/* Access */}
      <div className="card">
        <button
          onClick={() => toggleSection('access')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-aeria-blue" />
            Site Access
          </h2>
          {expandedSections.access ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.access && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Access Type</label>
                <select
                  value={siteSurvey.access?.type || 'public_road'}
                  onChange={(e) => updateAccess('type', e.target.value)}
                  className="input"
                >
                  {accessTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Gate Code / Access Code</label>
                <input
                  type="text"
                  value={siteSurvey.access?.gateCode || ''}
                  onChange={(e) => updateAccess('gateCode', e.target.value)}
                  className="input"
                  placeholder="If applicable"
                />
              </div>
            </div>

            <div>
              <label className="label">Directions to Site</label>
              <textarea
                value={siteSurvey.access?.directions || ''}
                onChange={(e) => updateAccess('directions', e.target.value)}
                className="input min-h-[80px]"
                placeholder="Turn-by-turn directions from nearest landmark or highway..."
              />
            </div>

            <div>
              <label className="label">Parking Location</label>
              <input
                type="text"
                value={siteSurvey.access?.parkingLocation || ''}
                onChange={(e) => updateAccess('parkingLocation', e.target.value)}
                className="input"
                placeholder="Where to park vehicles"
              />
            </div>

            <div>
              <label className="label">On-Site Contact</label>
              <input
                type="text"
                value={siteSurvey.access?.contactOnSite || ''}
                onChange={(e) => updateAccess('contactOnSite', e.target.value)}
                className="input"
                placeholder="Name and phone of site contact if applicable"
              />
            </div>

            <div>
              <label className="label">Access Restrictions</label>
              <textarea
                value={siteSurvey.access?.restrictions || ''}
                onChange={(e) => updateAccess('restrictions', e.target.value)}
                className="input min-h-[60px]"
                placeholder="Any access restrictions, hours, permits required..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Ground Conditions */}
      <div className="card">
        <button
          onClick={() => toggleSection('ground')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mountain className="w-5 h-5 text-aeria-blue" />
            Ground Conditions
          </h2>
          {expandedSections.ground ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.ground && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Surface Type</label>
                <select
                  value={siteSurvey.groundConditions?.type || 'grass'}
                  onChange={(e) => updateGroundConditions('type', e.target.value)}
                  className="input"
                >
                  {groundConditions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={siteSurvey.groundConditions?.suitableForVehicle ?? true}
                    onChange={(e) => updateGroundConditions('suitableForVehicle', e.target.checked)}
                    className="w-4 h-4 text-aeria-navy rounded"
                  />
                  <span className="text-sm text-gray-700">Suitable for vehicle access</span>
                </label>
              </div>
            </div>

            <div>
              <label className="label">Ground Hazards</label>
              <textarea
                value={siteSurvey.groundConditions?.hazards || ''}
                onChange={(e) => updateGroundConditions('hazards', e.target.value)}
                className="input min-h-[60px]"
                placeholder="Uneven terrain, holes, debris, water hazards..."
              />
            </div>

            <div>
              <label className="label">Surrounding Areas</label>
              <textarea
                value={siteSurvey.surroundings?.populatedAreas || ''}
                onChange={(e) => updateSurroundings('populatedAreas', e.target.value)}
                className="input min-h-[60px]"
                placeholder="Nearby populated areas, sensitive locations, wildlife considerations..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Survey Info & Notes */}
      <div className="card">
        <button
          onClick={() => toggleSection('notes')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-aeria-blue" />
            Survey Information
          </h2>
          {expandedSections.notes ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.notes && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Survey Date</label>
                <input
                  type="date"
                  value={siteSurvey.surveyDate || ''}
                  onChange={(e) => updateSiteSurvey({ surveyDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Surveyed By</label>
                <input
                  type="text"
                  value={siteSurvey.surveyedBy || ''}
                  onChange={(e) => updateSiteSurvey({ surveyedBy: e.target.value })}
                  className="input"
                  placeholder="Name of person who conducted survey"
                />
              </div>
            </div>

            <div>
              <label className="label">Additional Notes</label>
              <textarea
                value={siteSurvey.notes || ''}
                onChange={(e) => updateSiteSurvey({ notes: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Any additional observations, recommendations, or notes from the site survey..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Site Map Editor Modal */}
      <SiteMapEditor
        isOpen={mapEditorOpen}
        onClose={() => setMapEditorOpen(false)}
        siteLocation={siteSurvey.location?.coordinates}
        launchPoint={siteSurvey.launchRecovery?.launchPoint}
        recoveryPoint={siteSurvey.launchRecovery?.recoveryPoint}
        boundary={siteSurvey.boundary}
        onUpdate={handleMapEditorSave}
      />
    </div>
  )
}
