import { useState, useEffect, useRef } from 'react'
import { 
  MapPin, Plus, Trash2, AlertTriangle, Navigation, Mountain, TreePine, Building, Radio, Car, Users,
  Camera, ChevronDown, ChevronUp, CheckCircle2, Map, Plane, Layers, ExternalLink, X, Loader2, Search, Target
} from 'lucide-react'

// ============================================
// CONSTANTS
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
  emergency: { musterPoints: [], evacuationRoutes: [] }
})

// ============================================
// UNIFIED MAP PREVIEW - Shows ALL project data
// ============================================
function UnifiedMapPreview({ 
  siteLocation, boundary, launchPoint, recoveryPoint, 
  musterPoints, evacuationRoutes, 
  height = 200, onEdit, editLabel = "Edit Map" 
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return
    
    const init = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
      
      if (!window.L) {
        await new Promise(resolve => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = resolve
          document.body.appendChild(script)
        })
      }

      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      await new Promise(r => setTimeout(r, 50))
      if (!containerRef.current) return

      const L = window.L
      const lat = siteLocation?.lat || 54
      const lng = siteLocation?.lng || -125
      const hasLoc = !!siteLocation?.lat

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: hasLoc ? 14 : 4,
        zoomControl: false,
        attributionControl: false
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
      mapRef.current = map

      const icon = (color, emoji, size = 24) => L.divIcon({
        className: 'custom-icon',
        html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:${size*0.4}px">${emoji}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size]
      })

      // Site location
      if (siteLocation?.lat) L.marker([siteLocation.lat, siteLocation.lng], { icon: icon('#1e40af', '📍', 28) }).addTo(map)
      
      // Boundary
      if (Array.isArray(boundary) && boundary.length >= 3) {
        L.polygon(boundary.map(p => [p.lat, p.lng]), { color: '#9333ea', fillOpacity: 0.15, weight: 2 }).addTo(map)
      }

      // Launch & Recovery
      if (launchPoint?.lat) L.marker([launchPoint.lat, launchPoint.lng], { icon: icon('#16a34a', '🚀', 24) }).addTo(map)
      if (recoveryPoint?.lat) L.marker([recoveryPoint.lat, recoveryPoint.lng], { icon: icon('#dc2626', '🎯', 24) }).addTo(map)

      // Muster points
      if (Array.isArray(musterPoints)) {
        musterPoints.forEach(mp => {
          if (mp.coordinates?.lat) L.marker([mp.coordinates.lat, mp.coordinates.lng], { icon: icon('#f59e0b', '🚨', 24) }).addTo(map)
        })
      }

      // Evacuation routes
      if (Array.isArray(evacuationRoutes)) {
        evacuationRoutes.forEach(route => {
          if (Array.isArray(route.coordinates) && route.coordinates.length >= 2) {
            L.polyline(route.coordinates.map(c => [c.lat, c.lng]), { color: '#ef4444', weight: 3, dashArray: '8,8' }).addTo(map)
          }
        })
      }

      // Fit bounds
      const pts = []
      if (siteLocation?.lat) pts.push([siteLocation.lat, siteLocation.lng])
      if (Array.isArray(boundary)) boundary.forEach(p => pts.push([p.lat, p.lng]))
      if (launchPoint?.lat) pts.push([launchPoint.lat, launchPoint.lng])
      if (recoveryPoint?.lat) pts.push([recoveryPoint.lat, recoveryPoint.lng])
      if (Array.isArray(musterPoints)) musterPoints.forEach(mp => { if (mp.coordinates?.lat) pts.push([mp.coordinates.lat, mp.coordinates.lng]) })
      if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30] })

      setLoading(false)
    }
    
    init()
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [siteLocation, boundary, launchPoint, recoveryPoint, musterPoints, evacuationRoutes])

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100" style={{ height }}>
      {loading && <div className="absolute inset-0 flex items-center justify-center z-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
      <div ref={containerRef} className="w-full h-full" />
      <button onClick={onEdit} className="absolute bottom-3 right-3 px-4 py-2 bg-white hover:bg-gray-50 text-sm font-medium rounded-lg shadow-md border flex items-center gap-2" style={{ zIndex: 1000 }}>
        <Map className="w-4 h-4" /> {editLabel}
      </button>
      {!siteLocation?.lat && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 pointer-events-none" style={{ zIndex: 5 }}>
          <div className="text-center">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No location set</p>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute top-2 left-2 bg-white/90 rounded-lg px-2 py-1.5 text-xs space-y-1 shadow" style={{ zIndex: 1000 }}>
        {siteLocation?.lat && <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-700"></span> Site</div>}
        {launchPoint?.lat && <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-600"></span> Launch</div>}
        {recoveryPoint?.lat && <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600"></span> Recovery</div>}
        {Array.isArray(musterPoints) && musterPoints.length > 0 && <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Muster</div>}
      </div>
    </div>
  )
}

// ============================================
// SITE MAP EDITOR
// ============================================
function SiteMapEditor({ 
  siteLocation, boundary, launchPoint, recoveryPoint, musterPoints, evacuationRoutes,
  onSave, isOpen, onClose, siteName 
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const siteMarkerRef = useRef(null)
  const boundaryLayerRef = useRef(null)
  const vertexMarkersRef = useRef([])

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [mode, setMode] = useState('site')
  const [siteCoords, setSiteCoords] = useState({ lat: '', lng: '' })
  const [boundaryPts, setBoundaryPts] = useState([])

  const modeRef = useRef('site')
  useEffect(() => { modeRef.current = mode }, [mode])

  useEffect(() => {
    if (isOpen) {
      setSiteCoords({ lat: siteLocation?.lat?.toString() || '', lng: siteLocation?.lng?.toString() || '' })
      setBoundaryPts(Array.isArray(boundary) ? [...boundary] : [])
      setMode('site')
      setLoading(true)
    }
  }, [isOpen, siteLocation, boundary])

  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const init = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      if (!window.L) {
        await new Promise(resolve => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = resolve
          document.body.appendChild(script)
        })
      }

      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      siteMarkerRef.current = null
      boundaryLayerRef.current = null
      vertexMarkersRef.current = []

      await new Promise(r => setTimeout(r, 100))
      if (!containerRef.current) return

      const L = window.L
      const lat = siteLocation?.lat || 54
      const lng = siteLocation?.lng || -125
      const hasLoc = !!siteLocation?.lat

      const map = L.map(containerRef.current, { center: [lat, lng], zoom: hasLoc ? 15 : 5 })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
      mapRef.current = map

      const createIcon = (color, emoji, size = 32) => L.divIcon({
        className: 'custom-icon',
        html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:${size*0.45}px">${emoji}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size]
      })

      // Editable site marker
      if (siteLocation?.lat && siteLocation?.lng) {
        const marker = L.marker([siteLocation.lat, siteLocation.lng], { icon: createIcon('#1e40af', '📍'), draggable: true }).addTo(map)
        marker.on('dragend', e => {
          const p = e.target.getLatLng()
          setSiteCoords({ lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) })
        })
        siteMarkerRef.current = marker
      }

      // Reference: launch/recovery (read-only)
      if (launchPoint?.lat) L.marker([launchPoint.lat, launchPoint.lng], { icon: createIcon('#16a34a', '🚀', 24), opacity: 0.5 }).addTo(map).bindTooltip('Launch (edit in Flight Plan)')
      if (recoveryPoint?.lat) L.marker([recoveryPoint.lat, recoveryPoint.lng], { icon: createIcon('#dc2626', '🎯', 24), opacity: 0.5 }).addTo(map).bindTooltip('Recovery (edit in Flight Plan)')

      // Reference: muster points (read-only)
      if (Array.isArray(musterPoints)) {
        musterPoints.forEach(mp => {
          if (mp.coordinates?.lat) L.marker([mp.coordinates.lat, mp.coordinates.lng], { icon: createIcon('#f59e0b', '🚨', 22), opacity: 0.5 }).addTo(map).bindTooltip('Muster (edit in Emergency)')
        })
      }

      // Reference: routes (read-only)
      if (Array.isArray(evacuationRoutes)) {
        evacuationRoutes.forEach(route => {
          if (Array.isArray(route.coordinates) && route.coordinates.length >= 2) {
            L.polyline(route.coordinates.map(c => [c.lat, c.lng]), { color: '#ef4444', weight: 3, dashArray: '8,8', opacity: 0.5 }).addTo(map)
          }
        })
      }

      // Draw boundary with draggable vertices
      const drawBoundary = (pts) => {
        if (boundaryLayerRef.current) map.removeLayer(boundaryLayerRef.current)
        vertexMarkersRef.current.forEach(m => map.removeLayer(m))
        vertexMarkersRef.current = []

        if (pts.length >= 3) {
          boundaryLayerRef.current = L.polygon(pts.map(p => [p.lat, p.lng]), { color: '#9333ea', fillColor: '#9333ea', fillOpacity: 0.2, weight: 2 }).addTo(map)
        }

        pts.forEach((pt, idx) => {
          const vm = L.circleMarker([pt.lat, pt.lng], { radius: 8, color: '#9333ea', fillColor: 'white', fillOpacity: 1, weight: 3 }).addTo(map)
          vm.on('mousedown', () => {
            map.dragging.disable()
            const onMove = (e) => {
              vm.setLatLng(e.latlng)
              setBoundaryPts(prev => {
                const updated = [...prev]
                updated[idx] = { lat: e.latlng.lat, lng: e.latlng.lng }
                return updated
              })
            }
            const onUp = () => {
              map.dragging.enable()
              map.off('mousemove', onMove)
              map.off('mouseup', onUp)
            }
            map.on('mousemove', onMove)
            map.on('mouseup', onUp)
          })
          vertexMarkersRef.current.push(vm)
        })
      }

      if (Array.isArray(boundary) && boundary.length > 0) drawBoundary(boundary)

      // Click handler
      map.on('click', e => {
        const lat = parseFloat(e.latlng.lat.toFixed(6))
        const lng = parseFloat(e.latlng.lng.toFixed(6))

        if (modeRef.current === 'boundary') {
          setBoundaryPts(prev => [...prev, { lat, lng }])
        } else {
          setSiteCoords({ lat: lat.toString(), lng: lng.toString() })
          if (siteMarkerRef.current) {
            siteMarkerRef.current.setLatLng([lat, lng])
          } else {
            const marker = L.marker([lat, lng], { icon: createIcon('#1e40af', '📍'), draggable: true }).addTo(map)
            marker.on('dragend', e => {
              const p = e.target.getLatLng()
              setSiteCoords({ lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) })
            })
            siteMarkerRef.current = marker
          }
        }
      })

      setTimeout(() => { map.invalidateSize(); setLoading(false) }, 200)
    }

    init()
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [isOpen])

  // Redraw boundary when points change
  useEffect(() => {
    if (!mapRef.current || !window.L || loading) return
    const L = window.L
    const map = mapRef.current

    if (boundaryLayerRef.current) map.removeLayer(boundaryLayerRef.current)
    vertexMarkersRef.current.forEach(m => map.removeLayer(m))
    vertexMarkersRef.current = []

    if (boundaryPts.length >= 3) {
      boundaryLayerRef.current = L.polygon(boundaryPts.map(p => [p.lat, p.lng]), { color: '#9333ea', fillColor: '#9333ea', fillOpacity: 0.2, weight: 2 }).addTo(map)
    }

    const createIcon = (color, emoji, size = 32) => L.divIcon({
      className: 'custom-icon',
      html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:${size*0.45}px">${emoji}</span></div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size]
    })

    boundaryPts.forEach((pt, idx) => {
      const vm = L.circleMarker([pt.lat, pt.lng], { radius: 8, color: '#9333ea', fillColor: 'white', fillOpacity: 1, weight: 3 }).addTo(map)
      vm.on('mousedown', () => {
        map.dragging.disable()
        const onMove = (e) => {
          vm.setLatLng(e.latlng)
          setBoundaryPts(prev => {
            const updated = [...prev]
            updated[idx] = { lat: e.latlng.lat, lng: e.latlng.lng }
            return updated
          })
        }
        const onUp = () => {
          map.dragging.enable()
          map.off('mousemove', onMove)
          map.off('mouseup', onUp)
        }
        map.on('mousemove', onMove)
        map.on('mouseup', onUp)
      })
      vertexMarkersRef.current.push(vm)
    })
  }, [boundaryPts, loading])

  const doSearch = async () => {
    if (!search.trim() || !mapRef.current) return
    setSearching(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=1`)
      const data = await res.json()
      if (data[0]) mapRef.current.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 15)
    } catch (e) { console.error(e) }
    setSearching(false)
  }

  const handleSave = () => {
    onSave({
      siteLocation: siteCoords.lat && siteCoords.lng ? { lat: parseFloat(siteCoords.lat), lng: parseFloat(siteCoords.lng) } : null,
      boundary: boundaryPts.length >= 3 ? boundaryPts : []
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Site Map Editor - {siteName}</h2>
            <p className="text-sm text-gray-500">Click to place, drag to move. Other markers shown as reference.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-3 border-b bg-gray-50 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} placeholder="Search location..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" />
          </div>
          <button onClick={doSearch} disabled={searching} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">{searching ? '...' : 'Search'}</button>
        </div>

        <div className="p-3 border-b flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-gray-500 mr-2">MODE:</span>
          <button onClick={() => setMode('site')} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${mode === 'site' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>📍 Site Location</button>
          <button onClick={() => setMode('boundary')} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${mode === 'boundary' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><Target className="w-3 h-3" /> {mode === 'boundary' ? 'Drawing...' : 'Draw Boundary'}</button>
          {boundaryPts.length > 0 && (
            <>
              <button onClick={() => setBoundaryPts(prev => prev.slice(0, -1))} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Undo</button>
              <button onClick={() => setBoundaryPts([])} className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded">Clear</button>
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">{boundaryPts.length} pts</span>
            </>
          )}
          <span className="ml-4 text-xs text-gray-500">💡 Drag vertex circles to adjust boundary</span>
        </div>

        <div className="flex-1 relative" style={{ minHeight: 400 }}>
          {loading && <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}
          <div ref={containerRef} className="absolute inset-0" />
        </div>

        <div className="p-3 border-t bg-gray-50 flex items-center gap-4">
          <span className="text-xl">📍</span>
          <div className="flex-1 flex gap-2">
            <input type="text" value={siteCoords.lat} onChange={e => setSiteCoords(p => ({ ...p, lat: e.target.value }))} placeholder="Latitude" className="flex-1 px-3 py-1.5 border rounded text-sm" />
            <input type="text" value={siteCoords.lng} onChange={e => setSiteCoords(p => ({ ...p, lng: e.target.value }))} placeholder="Longitude" className="flex-1 px-3 py-1.5 border rounded text-sm" />
          </div>
        </div>

        <div className="p-4 border-t flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectSiteSurvey({ project, onUpdate }) {
  const [sites, setSites] = useState([])
  const [activeSiteIndex, setActiveSiteIndex] = useState(0)
  const [mapEditorOpen, setMapEditorOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    location: true, population: true, airspace: false, obstacles: false, access: false, ground: false, notes: false
  })

  useEffect(() => {
    if (project.sites && Array.isArray(project.sites) && project.sites.length > 0) {
      setSites(project.sites)
    } else if (project.siteSurvey) {
      const migrated = {
        id: 'site-migrated-1', name: 'Primary Site', includeFlightPlan: true,
        siteSurvey: project.siteSurvey, flightPlan: project.flightPlan || null, sora: project.sora || null,
        emergency: { musterPoints: project.emergencyPlan?.musterPoints || [], evacuationRoutes: project.emergencyPlan?.evacuationRoutes || [] }
      }
      setSites([migrated])
      onUpdate({ sites: [migrated] })
    } else {
      const def = createEmptySite(0)
      setSites([def])
      onUpdate({ sites: [def] })
    }
  }, [])

  const saveSites = (newSites) => { setSites(newSites); onUpdate({ sites: newSites }) }

  const activeSite = sites[activeSiteIndex] || sites[0]
  const siteSurvey = activeSite?.siteSurvey || {}

  const toggleSection = (s) => setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }))

  const addSite = () => {
    const ns = createEmptySite(sites.length)
    const newSites = [...sites, ns]
    saveSites(newSites)
    setActiveSiteIndex(newSites.length - 1)
  }

  const removeSite = (i) => {
    if (sites.length <= 1) return
    const newSites = sites.filter((_, idx) => idx !== i)
    saveSites(newSites)
    if (activeSiteIndex >= newSites.length) setActiveSiteIndex(newSites.length - 1)
  }

  const updateSiteName = (i, name) => {
    const newSites = [...sites]
    newSites[i] = { ...newSites[i], name }
    saveSites(newSites)
  }

  const toggleFlightPlan = (i) => {
    const newSites = [...sites]
    const s = newSites[i]
    const inc = !s.includeFlightPlan
    newSites[i] = { ...s, includeFlightPlan: inc, flightPlan: inc ? (s.flightPlan || {}) : null, sora: inc ? (s.sora || {}) : null }
    saveSites(newSites)
  }

  const updateSiteSurvey = (updates) => {
    const newSites = [...sites]
    newSites[activeSiteIndex] = { ...newSites[activeSiteIndex], siteSurvey: { ...newSites[activeSiteIndex].siteSurvey, ...updates } }
    saveSites(newSites)
  }

  const updateLocation = (f, v) => updateSiteSurvey({ location: { ...(siteSurvey.location || {}), [f]: v } })
  const updatePopulation = (f, v) => updateSiteSurvey({ population: { ...(siteSurvey.population || {}), [f]: v } })
  const updateAirspace = (f, v) => updateSiteSurvey({ airspace: { ...(siteSurvey.airspace || {}), [f]: v } })
  const updateAccess = (f, v) => updateSiteSurvey({ access: { ...(siteSurvey.access || {}), [f]: v } })
  const updateGroundConditions = (f, v) => updateSiteSurvey({ groundConditions: { ...(siteSurvey.groundConditions || {}), [f]: v } })

  const addObstacle = () => updateSiteSurvey({ obstacles: [...(siteSurvey.obstacles || []), { type: 'building', description: '', height: '', distance: '' }] })
  const updateObstacle = (i, f, v) => {
    const obs = [...(siteSurvey.obstacles || [])]
    obs[i] = { ...obs[i], [f]: v }
    updateSiteSurvey({ obstacles: obs })
  }
  const removeObstacle = (i) => updateSiteSurvey({ obstacles: (siteSurvey.obstacles || []).filter((_, idx) => idx !== i) })

  const handleMapSave = (data) => {
    const newSites = [...sites]
    newSites[activeSiteIndex] = {
      ...newSites[activeSiteIndex],
      siteSurvey: {
        ...newSites[activeSiteIndex].siteSurvey,
        location: { ...newSites[activeSiteIndex].siteSurvey.location, coordinates: data.siteLocation },
        boundary: data.boundary || []
      }
    }
    saveSites(newSites)
  }

  if (sites.length === 0) return <div className="p-4">Loading...</div>

  // Emergency is always at project level (not per-site)
  const emergency = project.emergencyPlan || {}
  const flightPlan = activeSite?.flightPlan || {}

  return (
    <div className="space-y-6">
      {/* Site Tabs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" /> Project Sites
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{sites.length}</span>
          </h2>
          <button onClick={addSite} className="btn-secondary text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add Site</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {sites.map((s, i) => (
            <button key={s.id} onClick={() => setActiveSiteIndex(i)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${activeSiteIndex === i ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{s.name}</span>
              {s.includeFlightPlan && <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">+ Flight</span>}
            </button>
          ))}
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Site Name</label>
              <input type="text" value={activeSite?.name || ''} onChange={e => updateSiteName(activeSiteIndex, e.target.value)} className="input font-medium" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border">
                <input type="checkbox" checked={activeSite?.includeFlightPlan || false} onChange={() => toggleFlightPlan(activeSiteIndex)} className="w-4 h-4" />
                <span className="text-sm flex items-center gap-1"><Plane className="w-4 h-4 text-green-600" /> Include Flight Plan & SORA</span>
              </label>
              {sites.length > 1 && <button onClick={() => removeSite(activeSiteIndex)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200"><Trash2 className="w-4 h-4" /></button>}
            </div>
          </div>
        </div>
      </div>

      {/* Location & Map */}
      <div className="card">
        <button onClick={() => toggleSection('location')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Site Location & Boundary</h2>
          {expandedSections.location ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.location && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Site Name / Description *</label>
              <input type="text" value={siteSurvey.location?.name || ''} onChange={e => updateLocation('name', e.target.value)} className="input" placeholder="e.g., Highway 99 Bridge Inspection Site" />
            </div>
            <div>
              <label className="label mb-2">Site Map</label>
              <UnifiedMapPreview
                siteLocation={siteSurvey.location?.coordinates}
                boundary={siteSurvey.boundary}
                launchPoint={flightPlan?.launchPoint}
                recoveryPoint={flightPlan?.recoveryPoint}
                musterPoints={emergency?.musterPoints}
                evacuationRoutes={emergency?.evacuationRoutes}
                height={280}
                onEdit={() => setMapEditorOpen(true)}
                editLabel="Edit Site & Boundary"
              />
            </div>
            {siteSurvey.location?.coordinates && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Latitude</label><input type="text" value={siteSurvey.location.coordinates.lat || ''} readOnly className="input bg-gray-50" /></div>
                <div><label className="label">Longitude</label><input type="text" value={siteSurvey.location.coordinates.lng || ''} readOnly className="input bg-gray-50" /></div>
              </div>
            )}
            {(siteSurvey.boundary || []).length > 0 && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Boundary defined ({siteSurvey.boundary.length} points)</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Population */}
      <div className="card">
        <button onClick={() => toggleSection('population')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" /> Population Density <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">SORA Input</span></h2>
          {expandedSections.population ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.population && (
          <div className="mt-4 space-y-2">
            {Object.entries(populationCategories).map(([k, v]) => (
              <label key={k} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer ${siteSurvey.population?.category === k ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="pop" value={k} checked={siteSurvey.population?.category === k} onChange={e => updatePopulation('category', e.target.value)} className="mt-1" />
                <div><p className="font-medium">{v.label}</p><p className="text-sm text-gray-600">{v.description}</p></div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Airspace */}
      <div className="card">
        <button onClick={() => toggleSection('airspace')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Radio className="w-5 h-5 text-blue-600" /> Airspace Classification</h2>
          {expandedSections.airspace ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.airspace && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Airspace Class</label>
              <select value={siteSurvey.airspace?.classification || 'G'} onChange={e => updateAirspace('classification', e.target.value)} className="input">
                <option value="G">Class G - Uncontrolled</option>
                <option value="E">Class E - Controlled</option>
                <option value="D">Class D - Control Zone</option>
                <option value="C">Class C - Terminal</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={siteSurvey.airspace?.nearAerodrome || false} onChange={e => updateAirspace('nearAerodrome', e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">Near Aerodrome (5.6km)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Obstacles */}
      <div className="card">
        <button onClick={() => toggleSection('obstacles')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-blue-600" /> Obstacles <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">{(siteSurvey.obstacles || []).length}</span></h2>
          {expandedSections.obstacles ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.obstacles && (
          <div className="mt-4 space-y-3">
            {(siteSurvey.obstacles || []).map((o, i) => (
              <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex gap-3">
                <div className="flex-1 grid sm:grid-cols-4 gap-2">
                  <select value={o.type} onChange={e => updateObstacle(i, 'type', e.target.value)} className="input text-sm">
                    {obstacleTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input type="text" value={o.description} onChange={e => updateObstacle(i, 'description', e.target.value)} className="input text-sm" placeholder="Description" />
                  <input type="text" value={o.height} onChange={e => updateObstacle(i, 'height', e.target.value)} className="input text-sm" placeholder="Height (m)" />
                  <input type="text" value={o.distance} onChange={e => updateObstacle(i, 'distance', e.target.value)} className="input text-sm" placeholder="Distance (m)" />
                </div>
                <button onClick={() => removeObstacle(i)} className="p-1.5 text-red-500 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={addObstacle} className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-400 hover:text-amber-600 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Obstacle
            </button>
          </div>
        )}
      </div>

      {/* Access */}
      <div className="card">
        <button onClick={() => toggleSection('access')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Car className="w-5 h-5 text-blue-600" /> Site Access</h2>
          {expandedSections.access ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.access && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Access Type</label>
                <select value={siteSurvey.access?.type || 'public_road'} onChange={e => updateAccess('type', e.target.value)} className="input">
                  {accessTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Gate Code</label>
                <input type="text" value={siteSurvey.access?.gateCode || ''} onChange={e => updateAccess('gateCode', e.target.value)} className="input" placeholder="If applicable" />
              </div>
            </div>
            <div>
              <label className="label">Directions</label>
              <textarea value={siteSurvey.access?.directions || ''} onChange={e => updateAccess('directions', e.target.value)} className="input min-h-[80px]" placeholder="Turn-by-turn directions..." />
            </div>
          </div>
        )}
      </div>

      {/* Ground */}
      <div className="card">
        <button onClick={() => toggleSection('ground')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Mountain className="w-5 h-5 text-blue-600" /> Ground Conditions</h2>
          {expandedSections.ground ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.ground && (
          <div className="mt-4">
            <label className="label">Surface Type</label>
            <select value={siteSurvey.groundConditions?.type || 'grass'} onChange={e => updateGroundConditions('type', e.target.value)} className="input">
              {groundConditions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Survey Info */}
      <div className="card">
        <button onClick={() => toggleSection('notes')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Camera className="w-5 h-5 text-blue-600" /> Survey Information</h2>
          {expandedSections.notes ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.notes && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className="label">Survey Date *</label><input type="date" value={siteSurvey.surveyDate || ''} onChange={e => updateSiteSurvey({ surveyDate: e.target.value })} className="input" /></div>
              <div><label className="label">Surveyed By *</label><input type="text" value={siteSurvey.surveyedBy || ''} onChange={e => updateSiteSurvey({ surveyedBy: e.target.value })} className="input" placeholder="Name" /></div>
              <div><label className="label">Method</label><select value={siteSurvey.surveyMethod || 'in_person'} onChange={e => updateSiteSurvey({ surveyMethod: e.target.value })} className="input">
                {surveyMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select></div>
            </div>
            <div><label className="label">Notes</label><textarea value={siteSurvey.notes || ''} onChange={e => updateSiteSurvey({ notes: e.target.value })} className="input min-h-[100px]" placeholder="Additional observations..." /></div>
          </div>
        )}
      </div>

      {/* Map Editor */}
      <SiteMapEditor
        isOpen={mapEditorOpen}
        onClose={() => setMapEditorOpen(false)}
        onSave={handleMapSave}
        siteLocation={siteSurvey.location?.coordinates}
        boundary={siteSurvey.boundary}
        launchPoint={flightPlan?.launchPoint}
        recoveryPoint={flightPlan?.recoveryPoint}
        musterPoints={emergency?.musterPoints}
        evacuationRoutes={emergency?.evacuationRoutes}
        siteName={activeSite?.name}
      />
    </div>
  )
}
