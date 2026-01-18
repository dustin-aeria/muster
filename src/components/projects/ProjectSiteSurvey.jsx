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
  Search,
  Info,
  Clipboard,
  FileCheck,
  AlertCircle,
  Eye
} from 'lucide-react'

// ============================================
// POPULATION CATEGORIES (SORA-aligned)
// Used for both HSE risk and SORA calculations
// ============================================
const populationCategories = {
  controlled: { 
    label: 'Controlled Ground Area', 
    description: 'No uninvolved people present, area fully controlled',
    examples: 'Closed industrial sites, secured perimeters, active construction zones with access control',
    density: 0
  },
  remote: { 
    label: 'Remote/Sparsely Populated', 
    description: 'Very low density, < 5 people/km²',
    examples: 'Wilderness areas, remote mining sites, unpopulated farmland',
    density: 5
  },
  lightly: { 
    label: 'Lightly Populated', 
    description: 'Rural areas, 5-50 people/km²',
    examples: 'Rural farmland with scattered houses, forest service roads',
    density: 50
  },
  sparsely: { 
    label: 'Sparsely Populated', 
    description: 'Scattered houses, 50-500 people/km²',
    examples: 'Rural residential areas, small villages, acreages',
    density: 500
  },
  suburban: { 
    label: 'Suburban/Populated', 
    description: 'Residential areas, 500-5000 people/km²',
    examples: 'Suburban neighborhoods, small towns, industrial parks during work hours',
    density: 5000
  },
  highdensity: { 
    label: 'High Density Urban', 
    description: 'Urban centers, > 5000 people/km²',
    examples: 'City centers, downtown areas, apartment complexes',
    density: 10000
  },
  assembly: { 
    label: 'Gatherings/Assembly', 
    description: 'Crowds, events, high concentration of people',
    examples: 'Concerts, sporting events, festivals, protests',
    density: 50000
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

const surveyMethods = [
  { value: 'in_person', label: 'In-Person Site Visit', description: 'Physical inspection of the site' },
  { value: 'remote', label: 'Remote Assessment', description: 'Using satellite imagery, maps, and documentation' },
  { value: 'hybrid', label: 'Hybrid', description: 'Combination of remote assessment and site visit' }
]

// ============================================
// SITE MAP EDITOR COMPONENT
// For setting site location and work area boundary
// Note: Launch/Recovery points moved to Flight Plan
// ============================================
function SiteMapEditor({ 
  siteLocation, 
  boundary,
  launchPoint,      // From Flight Plan
  recoveryPoint,    // From Flight Plan
  onUpdate,
  isOpen, 
  onClose 
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const boundaryLayerRef = useRef(null)
  const boundaryVertexMarkersRef = useRef([])
  const flightPointMarkersRef = useRef([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [activeMarker, setActiveMarker] = useState('site')
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false)
  const [boundaryPoints, setBoundaryPoints] = useState(boundary || [])
  
  const activeMarkerRef = useRef(activeMarker)
  const isDrawingBoundaryRef = useRef(isDrawingBoundary)
  
  useEffect(() => { activeMarkerRef.current = activeMarker }, [activeMarker])
  useEffect(() => { isDrawingBoundaryRef.current = isDrawingBoundary }, [isDrawingBoundary])
  
  useEffect(() => {
    if (isOpen && mapRef.current) {
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
  
  const [coords, setCoords] = useState({
    site: { lat: siteLocation?.lat || '', lng: siteLocation?.lng || '' }
  })

  useEffect(() => {
    if (isOpen) {
      setCoords({
        site: { lat: siteLocation?.lat || '', lng: siteLocation?.lng || '' }
      })
      setBoundaryPoints(boundary || [])
    }
  }, [isOpen, siteLocation, boundary])

  const markerColors = {
    site: { color: '#1e40af', label: 'Site Location', icon: '📍' }
  }

  useEffect(() => {
    if (!isOpen) return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!document.getElementById('leaflet-modal-fix')) {
      const style = document.createElement('style')
      style.id = 'leaflet-modal-fix'
      style.textContent = `
        .leaflet-container { 
          width: 100% !important; 
          height: 100% !important;
          z-index: 1;
        }
        .leaflet-control-container { z-index: 800; }
        .leaflet-pane { z-index: 400; }
        .leaflet-tile-pane { z-index: 200; }
        .leaflet-overlay-pane { z-index: 400; }
        .leaflet-marker-pane { z-index: 600; }
        .leaflet-popup-pane { z-index: 700; }
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

    const initMap = async () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      const L = await loadLeaflet()
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (!mapContainerRef.current) return

      const defaultLat = coords.site.lat || 54.0
      const defaultLng = coords.site.lng || -125.0
      const defaultZoom = coords.site.lat ? 14 : 5

      const map = L.map(mapContainerRef.current, {
        center: [parseFloat(defaultLat), parseFloat(defaultLng)],
        zoom: defaultZoom,
        zoomControl: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      mapRef.current = map

      const createMarkerIcon = (color, emoji) => {
        return L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          "><span style="transform: rotate(45deg); font-size: 14px;">${emoji}</span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      }

      // Site marker
      if (coords.site.lat && coords.site.lng) {
        const marker = L.marker(
          [parseFloat(coords.site.lat), parseFloat(coords.site.lng)],
          { 
            icon: createMarkerIcon(markerColors.site.color, markerColors.site.icon),
            draggable: true
          }
        ).addTo(map)
        
        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng()
          setCoords(prev => ({
            ...prev,
            site: { lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) }
          }))
        })
        
        markersRef.current.site = marker
      }

      // Boundary polygon
      if (boundaryPoints.length >= 3) {
        const polygon = L.polygon(boundaryPoints.map(p => [p.lat, p.lng]), {
          color: '#9333ea',
          fillColor: '#9333ea',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map)
        boundaryLayerRef.current = polygon
        
        boundaryPoints.forEach((point, idx) => {
          const vertexMarker = L.circleMarker([point.lat, point.lng], {
            radius: 6,
            color: '#9333ea',
            fillColor: 'white',
            fillOpacity: 1,
            weight: 2
          }).addTo(map)
          boundaryVertexMarkersRef.current.push(vertexMarker)
        })
      }

      // Launch/Recovery points from Flight Plan (read-only display)
      flightPointMarkersRef.current.forEach(m => m.remove())
      flightPointMarkersRef.current = []
      
      if (launchPoint?.lat && launchPoint?.lng) {
        const launchIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: #16a34a;
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
          "><span style="transform: rotate(45deg); font-size: 12px;">🛫</span></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28]
        })
        const launchMarker = L.marker([parseFloat(launchPoint.lat), parseFloat(launchPoint.lng)], {
          icon: launchIcon,
          opacity: 0.8
        }).addTo(map)
        launchMarker.bindTooltip('Launch Point (from Flight Plan)')
        flightPointMarkersRef.current.push(launchMarker)
      }
      
      if (recoveryPoint?.lat && recoveryPoint?.lng) {
        const recoveryIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: #d97706;
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
          "><span style="transform: rotate(45deg); font-size: 12px;">🛬</span></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28]
        })
        const recoveryMarker = L.marker([parseFloat(recoveryPoint.lat), parseFloat(recoveryPoint.lng)], {
          icon: recoveryIcon,
          opacity: 0.8
        }).addTo(map)
        recoveryMarker.bindTooltip('Recovery Point (from Flight Plan)')
        flightPointMarkersRef.current.push(recoveryMarker)
      }

      map.on('click', (e) => {
        const lat = e.latlng.lat.toFixed(6)
        const lng = e.latlng.lng.toFixed(6)

        if (isDrawingBoundaryRef.current) {
          setBoundaryPoints(prev => [...prev, { lat: parseFloat(lat), lng: parseFloat(lng) }])
        } else {
          const markerType = activeMarkerRef.current
          setCoords(prev => ({
            ...prev,
            [markerType]: { lat, lng }
          }))

          if (markersRef.current[markerType]) {
            markersRef.current[markerType].setLatLng([parseFloat(lat), parseFloat(lng)])
          } else {
            const config = markerColors[markerType]
            const marker = L.marker(
              [parseFloat(lat), parseFloat(lng)],
              { 
                icon: createMarkerIcon(config.color, config.icon),
                draggable: true
              }
            ).addTo(map)
            
            marker.on('dragend', (e) => {
              const pos = e.target.getLatLng()
              setCoords(prev => ({
                ...prev,
                [markerType]: { lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) }
              }))
            })
            
            markersRef.current[markerType] = marker
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

  // Update boundary polygon when points change
  useEffect(() => {
    if (!mapRef.current) return
    
    const L = window.L
    if (!L) return

    // Clear existing boundary
    if (boundaryLayerRef.current) {
      mapRef.current.removeLayer(boundaryLayerRef.current)
      boundaryLayerRef.current = null
    }
    boundaryVertexMarkersRef.current.forEach(m => mapRef.current.removeLayer(m))
    boundaryVertexMarkersRef.current = []

    // Draw new boundary if we have enough points
    if (boundaryPoints.length >= 3) {
      const polygon = L.polygon(boundaryPoints.map(p => [p.lat, p.lng]), {
        color: '#9333ea',
        fillColor: '#9333ea',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(mapRef.current)
      boundaryLayerRef.current = polygon

      boundaryPoints.forEach((point) => {
        const vertexMarker = L.circleMarker([point.lat, point.lng], {
          radius: 6,
          color: '#9333ea',
          fillColor: 'white',
          fillOpacity: 1,
          weight: 2
        }).addTo(mapRef.current)
        boundaryVertexMarkersRef.current.push(vertexMarker)
      })
    }
  }, [boundaryPoints])

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
        mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 14)
      } else {
        alert('Location not found')
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleSave = () => {
    onUpdate({
      siteLocation: coords.site.lat && coords.site.lng 
        ? { lat: parseFloat(coords.site.lat), lng: parseFloat(coords.site.lng) }
        : null,
      boundary: boundaryPoints.length >= 3 ? boundaryPoints : []
    })
    onClose()
  }

  const clearBoundary = () => {
    setBoundaryPoints([])
  }

  const undoLastBoundaryPoint = () => {
    setBoundaryPoints(prev => prev.slice(0, -1))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Site Map Editor</h2>
            <p className="text-sm text-gray-500">Set site location and work area boundary</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for a location..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy disabled:opacity-50"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">Click map to set:</span>
          
          <button
            onClick={() => { setActiveMarker('site'); setIsDrawingBoundary(false) }}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
              activeMarker === 'site' && !isDrawingBoundary
                ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>📍</span> Site Location
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <button
            onClick={() => { setIsDrawingBoundary(!isDrawingBoundary); setActiveMarker(null) }}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
              isDrawingBoundary
                ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Target className="w-4 h-4" />
            {isDrawingBoundary ? 'Drawing Boundary...' : 'Draw Work Area Boundary'}
          </button>

          {boundaryPoints.length > 0 && (
            <>
              <button
                onClick={undoLastBoundaryPoint}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Undo Point
              </button>
              <button
                onClick={clearBoundary}
                className="px-3 py-1.5 rounded-lg text-sm bg-red-100 text-red-700 hover:bg-red-200"
              >
                Clear Boundary
              </button>
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                {boundaryPoints.length} points
              </span>
            </>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[400px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-aeria-blue" />
            </div>
          )}
          <div ref={mapContainerRef} className="absolute inset-0" />
        </div>

        {/* Coordinate Display */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 gap-4">
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAP PREVIEW COMPONENT
// Displays site location and boundary (read-only)
// ============================================
function MapPreview({ siteLocation, boundary, onOpenEditor }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapRef.current) return

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

    const initMap = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const L = await loadLeaflet()
      
      const defaultLat = siteLocation?.lat || 54.0
      const defaultLng = siteLocation?.lng || -125.0
      const hasLocation = siteLocation?.lat && siteLocation?.lng

      const map = L.map(mapContainerRef.current, {
        center: [parseFloat(defaultLat), parseFloat(defaultLng)],
        zoom: hasLocation ? 13 : 4,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map)

      mapRef.current = map

      // Add site marker
      if (hasLocation) {
        const siteIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: #1e40af;
            width: 24px;
            height: 24px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          "><span style="transform: rotate(45deg); font-size: 10px;">📍</span></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 24]
        })
        L.marker([parseFloat(siteLocation.lat), parseFloat(siteLocation.lng)], { icon: siteIcon }).addTo(map)
      }

      // Add boundary polygon
      if (boundary && boundary.length >= 3) {
        L.polygon(boundary.map(p => [p.lat, p.lng]), {
          color: '#9333ea',
          fillColor: '#9333ea',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map)
      }

      // Fit bounds if we have data
      if (hasLocation && boundary && boundary.length >= 3) {
        const allPoints = [
          [parseFloat(siteLocation.lat), parseFloat(siteLocation.lng)],
          ...boundary.map(p => [p.lat, p.lng])
        ]
        map.fitBounds(allPoints, { padding: [20, 20] })
      }

      setMapReady(true)
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [siteLocation, boundary])

  const hasData = siteLocation?.lat || (boundary && boundary.length >= 3)

  return (
    <div 
      className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
      onClick={onOpenEditor}
    >
      <div ref={mapContainerRef} className="absolute inset-0" />
      
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Map className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click to set site location</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1.5 rounded-lg text-sm font-medium shadow">
          Click to Edit Map
        </span>
      </div>

      {/* Legend */}
      {hasData && (
        <div className="absolute bottom-2 left-2 bg-white/90 rounded px-2 py-1 text-xs space-y-1">
          {siteLocation?.lat && (
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-700" />
              <span>Site</span>
            </div>
          )}
          {boundary && boundary.length >= 3 && (
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-purple-500/50 border border-purple-500" />
              <span>Boundary</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// COMPLETENESS INDICATOR
// Shows what percentage of site survey is complete
// ============================================
function CompletenessIndicator({ siteSurvey }) {
  const checks = [
    { label: 'Site Name', complete: !!siteSurvey.location?.name },
    { label: 'Coordinates', complete: !!(siteSurvey.location?.coordinates?.lat && siteSurvey.location?.coordinates?.lng) },
    { label: 'Population Assessment', complete: !!siteSurvey.population?.category },
    { label: 'Airspace Classification', complete: !!siteSurvey.airspace?.classification },
    { label: 'Access Information', complete: !!siteSurvey.access?.type },
    { label: 'Survey Date', complete: !!siteSurvey.surveyDate },
    { label: 'Surveyor Name', complete: !!siteSurvey.surveyedBy }
  ]

  const completed = checks.filter(c => c.complete).length
  const percentage = Math.round((completed / checks.length) * 100)

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Clipboard className="w-4 h-4 text-aeria-blue" />
          Survey Completeness
        </h3>
        <span className={`text-sm font-semibold ${
          percentage === 100 ? 'text-green-600' : percentage >= 70 ? 'text-amber-600' : 'text-red-600'
        }`}>
          {percentage}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full transition-all ${
            percentage === 100 ? 'bg-green-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1 text-xs">
        {checks.map((check, i) => (
          <div key={i} className={`flex items-center gap-1 ${check.complete ? 'text-green-600' : 'text-gray-400'}`}>
            {check.complete ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {check.label}
          </div>
        ))}
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
    boundary: false,
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
          surveyMethod: 'in_person',
          notes: ''
        }
      })
    } else if (!project.siteSurvey.population) {
      // Migration: add population if missing
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
    } else if (!project.siteSurvey.surveyMethod) {
      // Migration: add surveyMethod if missing
      setInitialized(true)
      onUpdate({
        siteSurvey: {
          ...project.siteSurvey,
          surveyMethod: 'in_person'
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

  // Handle map editor save
  const handleMapEditorSave = ({ siteLocation, boundary }) => {
    updateSiteSurvey({
      location: {
        ...(siteSurvey.location || {}),
        coordinates: siteLocation || siteSurvey.location?.coordinates
      },
      boundary: boundary || []
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Universal Site Survey</h3>
            <p className="text-sm text-blue-700 mt-1">
              This survey can be used for all field operations—with or without drones. 
              Population and airspace data will auto-populate Flight Plan and SORA assessments when applicable.
            </p>
          </div>
        </div>
      </div>

      {/* Completeness Indicator */}
      <CompletenessIndicator siteSurvey={siteSurvey} />

      {/* Location */}
      <div className="card">
        <button
          onClick={() => toggleSection('location')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-aeria-blue" />
            Site Location
          </h2>
          {expandedSections.location ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.location && (
          <div className="mt-4 space-y-4">
            {/* Map Preview */}
            <MapPreview
              siteLocation={siteSurvey.location?.coordinates}
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
                Edit Map
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

      {/* Work Area Boundary */}
      <div className="card">
        <button
          onClick={() => toggleSection('boundary')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Work Area Boundary
            {siteSurvey.boundary && siteSurvey.boundary.length >= 3 && (
              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                {siteSurvey.boundary.length} points
              </span>
            )}
          </h2>
          {expandedSections.boundary ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.boundary && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Define the boundary of your work area. This helps with planning, risk assessment, and 
              will auto-populate flight geography for drone operations.
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMapEditorOpen(true)}
                className={`text-sm px-3 py-2 rounded-lg flex items-center gap-2 ${
                  siteSurvey.boundary && siteSurvey.boundary.length >= 3
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Target className="w-4 h-4" />
                {siteSurvey.boundary && siteSurvey.boundary.length >= 3 ? 'Edit Boundary' : 'Draw Boundary'}
              </button>
              
              {siteSurvey.boundary && siteSurvey.boundary.length >= 3 && (
                <button
                  onClick={() => updateSiteSurvey({ boundary: [] })}
                  className="text-sm px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Boundary
                </button>
              )}
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
            Population Density
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
              Used by HSE & SORA
            </span>
          </h2>
          {expandedSections.population ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.population && (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>Integration:</strong> This assessment feeds into both HSE Risk Assessment and 
              SORA Ground Risk Class (GRC) calculations for drone operations.
            </div>

            {/* Operational Area Category */}
            <div>
              <label className="label">Operational Area Category *</label>
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
                Population density of areas immediately adjacent to your work area. 
                Used for contingency planning and SORA containment requirements.
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
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
              Used by Flight Plan & SORA
            </span>
          </h2>
          {expandedSections.airspace ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.airspace && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Airspace Classification *</label>
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
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Obstacles & Hazards
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {(siteSurvey.obstacles || []).length}
            </span>
          </h2>
          {expandedSections.obstacles ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.obstacles && (
          <div className="mt-4 space-y-3">
            {(siteSurvey.obstacles || []).length === 0 ? (
              <p className="text-sm text-gray-500">No obstacles identified</p>
            ) : (
              (siteSurvey.obstacles || []).map((obstacle, index) => {
                const TypeIcon = obstacleTypes.find(t => t.value === obstacle.type)?.icon || AlertTriangle
                return (
                  <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TypeIcon className="w-5 h-5 text-amber-600 mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="grid sm:grid-cols-4 gap-2">
                          <select
                            value={obstacle.type}
                            onChange={(e) => updateObstacle(index, 'type', e.target.value)}
                            className="input text-sm"
                          >
                            {obstacleTypes.map(t => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
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
                            placeholder="Bearing °"
                          />
                        </div>
                        <input
                          type="text"
                          value={obstacle.description}
                          onChange={(e) => updateObstacle(index, 'description', e.target.value)}
                          className="input text-sm"
                          placeholder="Description..."
                        />
                        <input
                          type="text"
                          value={obstacle.mitigations}
                          onChange={(e) => updateObstacle(index, 'mitigations', e.target.value)}
                          className="input text-sm"
                          placeholder="Mitigations..."
                        />
                      </div>
                      <button
                        onClick={() => removeObstacle(index)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}

            <button
              onClick={addObstacle}
              className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
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
                <label className="label">Access Type *</label>
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
                  placeholder="Name of person who conducted survey"
                />
              </div>
              <div>
                <label className="label">Survey Method</label>
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
        boundary={siteSurvey.boundary}
        launchPoint={project.flightPlan?.launchPoint}
        recoveryPoint={project.flightPlan?.recoveryPoint}
        onUpdate={handleMapEditorSave}
      />
    </div>
  )
}
