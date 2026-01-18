import { useState, useEffect, useRef } from 'react'
import { 
  MapPin, Plus, Trash2, AlertTriangle, Navigation, Mountain, TreePine, Building, Radio, Car, Users,
  Camera, ChevronDown, ChevronUp, CheckCircle2, Map, Plane, Layers, ExternalLink, X, Loader2, Search, Target
} from 'lucide-react'

// ============================================
// POPULATION CATEGORIES (SORA-aligned)
// ============================================
const populationCategories = {
  controlled: { label: 'Controlled Ground Area', description: 'No uninvolved people present, fully controlled access', density: 0 },
  remote: { label: 'Remote/Sparsely Populated', description: 'Very low density, < 5 people/km²', density: 5 },
  lightly: { label: 'Lightly Populated', description: 'Rural areas, 5-50 people/km²', density: 50 },
  sparsely: { label: 'Sparsely Populated', description: 'Scattered houses, 50-500 people/km²', density: 500 },
  suburban: { label: 'Suburban/Populated', description: 'Residential areas, 500-5000 people/km²', density: 5000 },
  highdensity: { label: 'High Density Urban', description: 'Urban centers, > 5000 people/km²', density: 10000 },
  assembly: { label: 'Gatherings/Assembly', description: 'Crowds, events, high concentration', density: 50000 }
}

const obstacleTypes = [
  { value: 'tower', label: 'Tower/Mast' },
  { value: 'powerline', label: 'Power Lines' },
  { value: 'building', label: 'Building/Structure' },
  { value: 'tree', label: 'Trees/Vegetation' },
  { value: 'terrain', label: 'Terrain Feature' },
  { value: 'wire', label: 'Wire/Cable' },
  { value: 'antenna', label: 'Antenna' },
  { value: 'other', label: 'Other' }
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

const surveyMethods = [
  { value: 'in_person', label: 'In-Person Site Visit' },
  { value: 'remote', label: 'Remote Assessment' },
  { value: 'hybrid', label: 'Hybrid' }
]

// Default empty site structure
const createEmptySite = (index) => ({
  id: `site-${Date.now()}-${index}`,
  name: index === 0 ? 'Primary Site' : `Site ${index + 1}`,
  includeFlightPlan: true,
  siteSurvey: {
    location: { name: '', coordinates: null },
    boundary: [],
    population: { category: 'sparsely' },
    airspace: { classification: 'G' },
    obstacles: [],
    access: { type: 'public_road' },
    groundConditions: { type: 'grass' },
    surveyDate: new Date().toISOString().split('T')[0],
    surveyedBy: '',
    surveyMethod: 'in_person'
  },
  flightPlan: null,
  sora: null,
  emergency: {
    musterPoints: [],
    evacuationRoutes: []
  }
})

// ============================================
// INLINE MAP PREVIEW (Read-only)
// ============================================
function MapPreview({ siteLocation, boundary, launchPoint, recoveryPoint, height = 200, onOpenEditor }) {
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
      style.textContent = `.custom-div-icon { background: transparent !important; border: none !important; }`
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

      const defaultLat = siteLocation?.lat || 54.0
      const defaultLng = siteLocation?.lng || -125.0
      const hasLocation = siteLocation?.lat
      const defaultZoom = hasLocation ? 14 : 4

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

      // Fit bounds to show all content
      const allPoints = []
      if (siteLocation?.lat) allPoints.push([siteLocation.lat, siteLocation.lng])
      if (launchPoint?.lat) allPoints.push([launchPoint.lat, launchPoint.lng])
      if (recoveryPoint?.lat) allPoints.push([recoveryPoint.lat, recoveryPoint.lng])
      if (Array.isArray(boundary)) {
        boundary.forEach(p => allPoints.push([p.lat, p.lng]))
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
  }, [siteLocation, boundary, launchPoint, recoveryPoint])

  const hasContent = siteLocation?.lat || (Array.isArray(boundary) && boundary.length > 0)

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-aeria-blue" />
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Edit button - ALWAYS SHOW */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onOpenEditor()
        }}
        className="absolute bottom-3 right-3 px-4 py-2 bg-white hover:bg-gray-50 text-sm font-medium rounded-lg shadow-md border border-gray-200 flex items-center gap-2 transition-colors"
        style={{ zIndex: 1000 }}
      >
        <Map className="w-4 h-4" />
        Edit Map
      </button>

      {/* Empty state */}
      {!hasContent && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 pointer-events-none" style={{ zIndex: 5 }}>
          <div className="text-center">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No location set</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// MAP EDITOR MODAL
// ============================================
function SiteMapEditor({ 
  siteLocation, 
  boundary,
  launchPoint,
  recoveryPoint,
  onUpdate,
  isOpen, 
  onClose,
  siteName
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const boundaryLayerRef = useRef(null)
  const boundaryVerticesRef = useRef([])

  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [activeMarker, setActiveMarker] = useState('site')
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false)
  const [boundaryPoints, setBoundaryPoints] = useState([])
  
  const [coords, setCoords] = useState({
    site: { lat: '', lng: '' }
  })

  // Refs for click handler
  const activeMarkerRef = useRef('site')
  const isDrawingBoundaryRef = useRef(false)

  useEffect(() => { activeMarkerRef.current = activeMarker }, [activeMarker])
  useEffect(() => { isDrawingBoundaryRef.current = isDrawingBoundary }, [isDrawingBoundary])

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCoords({
        site: { 
          lat: siteLocation?.lat?.toString() || '', 
          lng: siteLocation?.lng?.toString() || '' 
        }
      })
      setBoundaryPoints(Array.isArray(boundary) ? [...boundary] : [])
      setIsDrawingBoundary(false)
      setActiveMarker('site')
      setIsLoading(true)
    }
  }, [isOpen, siteLocation, boundary])

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

      // Add existing site marker (draggable)
      if (siteLocation?.lat && siteLocation?.lng) {
        const marker = L.marker([siteLocation.lat, siteLocation.lng], {
          icon: createIcon('#1e40af', '📍'),
          draggable: true
        }).addTo(map)
        
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng()
          setCoords(prev => ({
            ...prev,
            site: { lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) }
          }))
        })
        markersRef.current.site = marker
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

        boundary.forEach((point) => {
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

      // Add launch/recovery as reference (non-draggable)
      if (launchPoint?.lat && launchPoint?.lng) {
        const marker = L.marker([launchPoint.lat, launchPoint.lng], {
          icon: createIcon('#16a34a', '🚀', 24),
          opacity: 0.7
        }).addTo(map)
        marker.bindTooltip('Launch Point (edit in Flight Plan)')
      }

      if (recoveryPoint?.lat && recoveryPoint?.lng) {
        const marker = L.marker([recoveryPoint.lat, recoveryPoint.lng], {
          icon: createIcon('#dc2626', '🎯', 24),
          opacity: 0.7
        }).addTo(map)
        marker.bindTooltip('Recovery Point (edit in Flight Plan)')
      }

      // Map click handler
      map.on('click', (e) => {
        const lat = e.latlng.lat.toFixed(6)
        const lng = e.latlng.lng.toFixed(6)

        if (isDrawingBoundaryRef.current) {
          // Add boundary point
          setBoundaryPoints(prev => [...prev, { lat: parseFloat(lat), lng: parseFloat(lng) }])
        } else {
          // Place site marker
          setCoords(prev => ({
            ...prev,
            site: { lat, lng }
          }))

          // Update or create marker
          if (markersRef.current.site) {
            markersRef.current.site.setLatLng([parseFloat(lat), parseFloat(lng)])
          } else {
            const marker = L.marker([parseFloat(lat), parseFloat(lng)], {
              icon: createIcon('#1e40af', '📍'),
              draggable: true
            }).addTo(map)
            
            marker.on('dragend', (e) => {
              const pos = e.target.getLatLng()
              setCoords(prev => ({
                ...prev,
                site: { lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) }
              }))
            })
            markersRef.current.site = marker
          }
        }
      })

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

  // Update boundary display when points change
  useEffect(() => {
    if (!mapRef.current || !window.L || isLoading) return
    
    const L = window.L
    const map = mapRef.current

    // Remove old boundary
    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current)
      boundaryLayerRef.current = null
    }
    boundaryVerticesRef.current.forEach(v => map.removeLayer(v))
    boundaryVerticesRef.current = []

    // Draw new boundary
    if (boundaryPoints.length >= 3) {
      const polygon = L.polygon(boundaryPoints.map(p => [p.lat, p.lng]), {
        color: '#9333ea',
        fillColor: '#9333ea',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(map)
      boundaryLayerRef.current = polygon
    }

    // Add vertices
    boundaryPoints.forEach((point) => {
      const vertex = L.circleMarker([point.lat, point.lng], {
        radius: 7,
        color: '#9333ea',
        fillColor: 'white',
        fillOpacity: 1,
        weight: 2
      }).addTo(map)
      boundaryVerticesRef.current.push(vertex)
    })
  }, [boundaryPoints, isLoading])

  // Search handler
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
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  // Save handler
  const handleSave = () => {
    onUpdate({
      siteLocation: coords.site.lat && coords.site.lng 
        ? { lat: parseFloat(coords.site.lat), lng: parseFloat(coords.site.lng) }
        : null,
      boundary: boundaryPoints.length >= 3 ? boundaryPoints : []
    })
    onClose()
  }

  // Boundary controls
  const undoBoundaryPoint = () => setBoundaryPoints(prev => prev.slice(0, -1))
  const clearBoundary = () => setBoundaryPoints([])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Site Map Editor - {siteName}</h2>
            <p className="text-sm text-gray-500">Click to place site marker, drag to reposition</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b bg-gray-50 flex-shrink-0">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
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
          
          <button
            onClick={() => { setActiveMarker('site'); setIsDrawingBoundary(false) }}
            className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              activeMarker === 'site' && !isDrawingBoundary ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📍 Site Location
          </button>
          
          <button
            onClick={() => { setIsDrawingBoundary(!isDrawingBoundary); setActiveMarker(null) }}
            className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              isDrawingBoundary ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Target className="w-3 h-3" /> {isDrawingBoundary ? 'Drawing Boundary...' : 'Draw Boundary'}
          </button>
          
          {boundaryPoints.length > 0 && (
            <>
              <button onClick={undoBoundaryPoint} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Undo</button>
              <button onClick={clearBoundary} className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded">Clear</button>
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">{boundaryPoints.length} points</span>
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

        {/* Coordinate Display */}
        <div className="p-3 border-t bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-2xl">📍</span>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Site Location</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coords.site.lat}
                  onChange={(e) => setCoords(prev => ({ ...prev, site: { ...prev.site, lat: e.target.value }}))}
                  placeholder="Latitude"
                  className="flex-1 px-3 py-1.5 border rounded text-sm"
                />
                <input
                  type="text"
                  value={coords.site.lng}
                  onChange={(e) => setCoords(prev => ({ ...prev, site: { ...prev.site, lng: e.target.value }}))}
                  placeholder="Longitude"
                  className="flex-1 px-3 py-1.5 border rounded text-sm"
                />
              </div>
            </div>
          </div>
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

// ============================================
// MAIN COMPONENT: Multi-Site Survey
// ============================================
export default function ProjectSiteSurvey({ project, onUpdate }) {
  const [sites, setSites] = useState([])
  const [activeSiteIndex, setActiveSiteIndex] = useState(0)
  const [mapEditorOpen, setMapEditorOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    population: true,
    airspace: false,
    obstacles: false,
    access: false,
    ground: false,
    notes: false
  })

  // Initialize from project
  useEffect(() => {
    if (project.sites && Array.isArray(project.sites) && project.sites.length > 0) {
      setSites(project.sites)
    } else if (project.siteSurvey) {
      // Migrate old single-site structure
      const migratedSite = {
        id: 'site-migrated-1',
        name: 'Primary Site',
        includeFlightPlan: true,
        siteSurvey: project.siteSurvey,
        flightPlan: project.flightPlan || null,
        sora: project.sora || null,
        emergency: {
          musterPoints: project.emergencyPlan?.musterPoints || [],
          evacuationRoutes: project.emergencyPlan?.evacuationRoutes || []
        }
      }
      setSites([migratedSite])
      onUpdate({ sites: [migratedSite] })
    } else {
      // Create default site
      const defaultSite = createEmptySite(0)
      setSites([defaultSite])
      onUpdate({ sites: [defaultSite] })
    }
  }, [])

  // Save sites to project
  const saveSites = (newSites) => {
    setSites(newSites)
    onUpdate({ sites: newSites })
  }

  const activeSite = sites[activeSiteIndex] || sites[0]
  const siteSurvey = activeSite?.siteSurvey || {}

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Site management
  const addSite = () => {
    const newSite = createEmptySite(sites.length)
    const newSites = [...sites, newSite]
    saveSites(newSites)
    setActiveSiteIndex(newSites.length - 1)
  }

  const removeSite = (index) => {
    if (sites.length <= 1) return
    const newSites = sites.filter((_, i) => i !== index)
    saveSites(newSites)
    if (activeSiteIndex >= newSites.length) {
      setActiveSiteIndex(newSites.length - 1)
    }
  }

  const updateSiteName = (index, name) => {
    const newSites = [...sites]
    newSites[index] = { ...newSites[index], name }
    saveSites(newSites)
  }

  const toggleFlightPlan = (index) => {
    const newSites = [...sites]
    const site = newSites[index]
    const includeFlightPlan = !site.includeFlightPlan
    newSites[index] = {
      ...site,
      includeFlightPlan,
      flightPlan: includeFlightPlan ? (site.flightPlan || {}) : null,
      sora: includeFlightPlan ? (site.sora || {}) : null
    }
    saveSites(newSites)
  }

  // Update active site's survey data
  const updateSiteSurvey = (updates) => {
    const newSites = [...sites]
    newSites[activeSiteIndex] = {
      ...newSites[activeSiteIndex],
      siteSurvey: {
        ...newSites[activeSiteIndex].siteSurvey,
        ...updates
      }
    }
    saveSites(newSites)
  }

  const updateLocation = (field, value) => {
    updateSiteSurvey({
      location: { ...(siteSurvey.location || {}), [field]: value }
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

  // Obstacles
  const addObstacle = () => {
    updateSiteSurvey({
      obstacles: [...(siteSurvey.obstacles || []), { type: 'building', description: '', height: '', distance: '' }]
    })
  }

  const updateObstacle = (index, field, value) => {
    const obstacles = [...(siteSurvey.obstacles || [])]
    obstacles[index] = { ...obstacles[index], [field]: value }
    updateSiteSurvey({ obstacles })
  }

  const removeObstacle = (index) => {
    updateSiteSurvey({
      obstacles: (siteSurvey.obstacles || []).filter((_, i) => i !== index)
    })
  }

  // Handle map editor save
  const handleMapSave = (mapData) => {
    const newSites = [...sites]
    newSites[activeSiteIndex] = {
      ...newSites[activeSiteIndex],
      siteSurvey: {
        ...newSites[activeSiteIndex].siteSurvey,
        location: {
          ...newSites[activeSiteIndex].siteSurvey.location,
          coordinates: mapData.siteLocation
        },
        boundary: mapData.boundary || []
      }
    }
    saveSites(newSites)
  }

  if (sites.length === 0) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Site Tabs / Selector */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-aeria-blue" />
            Project Sites
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{sites.length}</span>
          </h2>
          <button onClick={addSite} className="btn-secondary text-sm flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add Site
          </button>
        </div>

        {/* Site Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sites.map((site, index) => (
            <button
              key={site.id}
              onClick={() => setActiveSiteIndex(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                activeSiteIndex === index
                  ? 'border-aeria-blue bg-blue-50 text-aeria-navy'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{site.name}</span>
              {site.includeFlightPlan && (
                <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">+ Flight</span>
              )}
            </button>
          ))}
        </div>

        {/* Active Site Configuration */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Site Name</label>
              <input
                type="text"
                value={activeSite?.name || ''}
                onChange={(e) => updateSiteName(activeSiteIndex, e.target.value)}
                className="input font-medium"
                placeholder="Site name"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border">
                <input
                  type="checkbox"
                  checked={activeSite?.includeFlightPlan || false}
                  onChange={() => toggleFlightPlan(activeSiteIndex)}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <span className="text-sm flex items-center gap-1">
                  <Plane className="w-4 h-4 text-green-600" />
                  Include Flight Plan & SORA
                </span>
              </label>
              {sites.length > 1 && (
                <button
                  onClick={() => removeSite(activeSiteIndex)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                  title="Remove site"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Site Location & Map */}
      <div className="card">
        <button
          onClick={() => toggleSection('location')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-aeria-blue" />
            Site Location & Boundary
          </h2>
          {expandedSections.location ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.location && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Site Name / Description *</label>
              <input
                type="text"
                value={siteSurvey.location?.name || ''}
                onChange={(e) => updateLocation('name', e.target.value)}
                className="input"
                placeholder="e.g., Highway 99 Bridge Inspection Site"
              />
            </div>

            {/* Inline Map Preview */}
            <div>
              <label className="label mb-2">Site Map</label>
              <MapPreview
                siteLocation={siteSurvey.location?.coordinates}
                boundary={siteSurvey.boundary}
                launchPoint={activeSite?.flightPlan?.launchPoint}
                recoveryPoint={activeSite?.flightPlan?.recoveryPoint}
                height={250}
                onOpenEditor={() => setMapEditorOpen(true)}
              />
            </div>

            {/* Coordinate Display */}
            {siteSurvey.location?.coordinates && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Latitude</label>
                  <input
                    type="text"
                    value={siteSurvey.location?.coordinates?.lat || ''}
                    readOnly
                    className="input bg-gray-50"
                  />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input
                    type="text"
                    value={siteSurvey.location?.coordinates?.lng || ''}
                    readOnly
                    className="input bg-gray-50"
                  />
                </div>
              </div>
            )}

            {/* Boundary Status */}
            {(siteSurvey.boundary || []).length > 0 && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Work area boundary defined ({siteSurvey.boundary.length} points)
                </p>
              </div>
            )}
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
            Population Density
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">SORA Input</span>
          </h2>
          {expandedSections.population ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.population && (
          <div className="mt-4 space-y-2">
            {Object.entries(populationCategories).map(([key, cat]) => (
              <label
                key={key}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  siteSurvey.population?.category === key
                    ? 'border-aeria-blue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
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
                <div>
                  <p className="font-medium text-gray-900">{cat.label}</p>
                  <p className="text-sm text-gray-600">{cat.description}</p>
                </div>
              </label>
            ))}
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
            Airspace Classification
          </h2>
          {expandedSections.airspace ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.airspace && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Airspace Class</label>
              <select
                value={siteSurvey.airspace?.classification || 'G'}
                onChange={(e) => updateAirspace('classification', e.target.value)}
                className="input"
              >
                <option value="G">Class G - Uncontrolled</option>
                <option value="E">Class E - Controlled (above 700ft AGL)</option>
                <option value="D">Class D - Control Zone</option>
                <option value="C">Class C - Terminal Area</option>
                <option value="B">Class B - Major Airport</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSurvey.airspace?.nearAerodrome || false}
                  onChange={(e) => updateAirspace('nearAerodrome', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Near Aerodrome (within 5.6km / 3nm)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSurvey.airspace?.nearHeliport || false}
                  onChange={(e) => updateAirspace('nearHeliport', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Near Heliport (within 1.8km / 1nm)</span>
              </label>
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
            Obstacles & Hazards
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {(siteSurvey.obstacles || []).length}
            </span>
          </h2>
          {expandedSections.obstacles ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.obstacles && (
          <div className="mt-4 space-y-3">
            {(siteSurvey.obstacles || []).map((obs, i) => (
              <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid sm:grid-cols-4 gap-2">
                    <select
                      value={obs.type}
                      onChange={(e) => updateObstacle(i, 'type', e.target.value)}
                      className="input text-sm"
                    >
                      {obstacleTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={obs.description}
                      onChange={(e) => updateObstacle(i, 'description', e.target.value)}
                      className="input text-sm"
                      placeholder="Description"
                    />
                    <input
                      type="text"
                      value={obs.height}
                      onChange={(e) => updateObstacle(i, 'height', e.target.value)}
                      className="input text-sm"
                      placeholder="Height (m AGL)"
                    />
                    <input
                      type="text"
                      value={obs.distance}
                      onChange={(e) => updateObstacle(i, 'distance', e.target.value)}
                      className="input text-sm"
                      placeholder="Distance (m)"
                    />
                  </div>
                  <button onClick={() => removeObstacle(i)} className="p-1.5 text-red-500 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addObstacle} className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-400 hover:text-amber-600 flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Add Obstacle
            </button>
          </div>
        )}
      </div>

      {/* Site Access */}
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
                placeholder="Turn-by-turn directions from nearest landmark..."
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
            </div>
          </div>
        )}
      </div>

      {/* Survey Info */}
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
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Survey Date *</label>
                <input
                  type="date"
                  value={siteSurvey.surveyDate || ''}
                  onChange={(e) => updateSiteSurvey({ surveyDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Surveyed By *</label>
                <input
                  type="text"
                  value={siteSurvey.surveyedBy || ''}
                  onChange={(e) => updateSiteSurvey({ surveyedBy: e.target.value })}
                  className="input"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="label">Method</label>
                <select
                  value={siteSurvey.surveyMethod || 'in_person'}
                  onChange={(e) => updateSiteSurvey({ surveyMethod: e.target.value })}
                  className="input"
                >
                  {surveyMethods.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Additional Notes</label>
              <textarea
                value={siteSurvey.notes || ''}
                onChange={(e) => updateSiteSurvey({ notes: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Any additional observations, recommendations, or notes..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Map Editor Modal */}
      <SiteMapEditor
        isOpen={mapEditorOpen}
        onClose={() => setMapEditorOpen(false)}
        onUpdate={handleMapSave}
        siteLocation={siteSurvey.location?.coordinates}
        boundary={siteSurvey.boundary}
        launchPoint={activeSite?.flightPlan?.launchPoint}
        recoveryPoint={activeSite?.flightPlan?.recoveryPoint}
        siteName={activeSite?.name}
      />
    </div>
  )
}
