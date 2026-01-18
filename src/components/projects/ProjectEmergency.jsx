import { useState, useEffect, useRef } from 'react'
import { 
  ShieldAlert, Plus, Trash2, Phone, MapPin, Users, Route, Stethoscope, Flame, Plane,
  AlertTriangle, ChevronDown, ChevronUp, Building, Clock, Navigation, Map, X, Loader2, Search, Layers
} from 'lucide-react'

const contactTypes = [
  { value: 'emergency', label: 'Emergency Services', icon: Phone },
  { value: 'fic', label: 'Flight Information Centre', icon: Plane },
  { value: 'hospital', label: 'Hospital', icon: Stethoscope },
  { value: 'client', label: 'Client Contact', icon: Building },
  { value: 'company', label: 'Company Contact', icon: Users },
  { value: 'site', label: 'Site Contact', icon: MapPin },
  { value: 'other', label: 'Other', icon: Phone }
]

const defaultContacts = [
  { type: 'emergency', name: 'Emergency Services', phone: '911', notes: 'Police, Fire, Ambulance' },
  { type: 'fic', name: 'FIC Edmonton', phone: '1-866-541-4102', notes: 'For fly-away reporting' },
  { type: 'company', name: 'Company Emergency', phone: '', notes: 'Company emergency contact' }
]

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

      // All markers
      if (siteLocation?.lat) L.marker([siteLocation.lat, siteLocation.lng], { icon: icon('#1e40af', '📍', 24) }).addTo(map)
      if (Array.isArray(boundary) && boundary.length >= 3) {
        L.polygon(boundary.map(p => [p.lat, p.lng]), { color: '#9333ea', fillOpacity: 0.15, weight: 2 }).addTo(map)
      }
      if (launchPoint?.lat) L.marker([launchPoint.lat, launchPoint.lng], { icon: icon('#16a34a', '🚀', 24) }).addTo(map)
      if (recoveryPoint?.lat) L.marker([recoveryPoint.lat, recoveryPoint.lng], { icon: icon('#dc2626', '🎯', 24) }).addTo(map)
      if (Array.isArray(musterPoints)) {
        musterPoints.forEach(mp => {
          if (mp.coordinates?.lat) L.marker([mp.coordinates.lat, mp.coordinates.lng], { icon: icon('#f59e0b', '🚨', 28) }).addTo(map)
        })
      }
      if (Array.isArray(evacuationRoutes)) {
        evacuationRoutes.forEach(route => {
          if (Array.isArray(route.coordinates) && route.coordinates.length >= 2) {
            L.polyline(route.coordinates.map(c => [c.lat, c.lng]), { color: '#ef4444', weight: 4, dashArray: '10,10' }).addTo(map)
          }
        })
      }

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

  const hasContent = (Array.isArray(musterPoints) && musterPoints.length > 0) || siteLocation?.lat

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100" style={{ height }}>
      {loading && <div className="absolute inset-0 flex items-center justify-center z-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
      <div ref={containerRef} className="w-full h-full" />
      <button onClick={onEdit} className="absolute bottom-3 right-3 px-4 py-2 bg-white hover:bg-gray-50 text-sm font-medium rounded-lg shadow-md border flex items-center gap-2" style={{ zIndex: 1000 }}>
        <Map className="w-4 h-4" /> {editLabel}
      </button>
      {!hasContent && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 pointer-events-none" style={{ zIndex: 5 }}>
          <div className="text-center">
            <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No emergency points set</p>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute top-2 left-2 bg-white/90 rounded-lg px-2 py-1.5 text-xs space-y-1 shadow" style={{ zIndex: 1000 }}>
        {siteLocation?.lat && <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-700"></span> Site</div>}
        {launchPoint?.lat && <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-600"></span> Launch</div>}
        {recoveryPoint?.lat && <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600"></span> Recovery</div>}
        {Array.isArray(musterPoints) && musterPoints.length > 0 && <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Muster</div>}
        {Array.isArray(evacuationRoutes) && evacuationRoutes.length > 0 && <div className="flex items-center gap-1"><span className="w-3 h-1 bg-red-500"></span> Routes</div>}
      </div>
    </div>
  )
}

// ============================================
// EMERGENCY MAP EDITOR
// ============================================
function EmergencyMapEditor({ siteLocation, boundary, launchPoint, recoveryPoint, musterPoints, evacuationRoutes, onSave, isOpen, onClose }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const routeLayersRef = useRef([])

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [mode, setMode] = useState('muster')
  const [localMusterPoints, setLocalMusterPoints] = useState([])
  const [localRoutes, setLocalRoutes] = useState([])
  const [isDrawingRoute, setIsDrawingRoute] = useState(false)
  const [tempRoutePoints, setTempRoutePoints] = useState([])

  const modeRef = useRef('muster')
  const isDrawingRouteRef = useRef(false)
  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { isDrawingRouteRef.current = isDrawingRoute }, [isDrawingRoute])

  useEffect(() => {
    if (isOpen) {
      setLocalMusterPoints(Array.isArray(musterPoints) ? [...musterPoints] : [])
      setLocalRoutes(Array.isArray(evacuationRoutes) ? [...evacuationRoutes] : [])
      setMode('muster')
      setIsDrawingRoute(false)
      setTempRoutePoints([])
      setLoading(true)
    }
  }, [isOpen, musterPoints, evacuationRoutes])

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
      markersRef.current = {}
      routeLayersRef.current = []
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

      // Reference: site location (read-only)
      if (siteLocation?.lat) L.marker([siteLocation.lat, siteLocation.lng], { icon: createIcon('#1e40af', '📍', 24), opacity: 0.5 }).addTo(map).bindTooltip('Site (edit in Site Survey)')
      if (Array.isArray(boundary) && boundary.length >= 3) {
        L.polygon(boundary.map(p => [p.lat, p.lng]), { color: '#9333ea', fillOpacity: 0.1, weight: 2, dashArray: '5,5' }).addTo(map)
      }

      // Reference: launch/recovery (read-only)
      if (launchPoint?.lat) L.marker([launchPoint.lat, launchPoint.lng], { icon: createIcon('#16a34a', '🚀', 22), opacity: 0.5 }).addTo(map).bindTooltip('Launch (edit in Flight Plan)')
      if (recoveryPoint?.lat) L.marker([recoveryPoint.lat, recoveryPoint.lng], { icon: createIcon('#dc2626', '🎯', 22), opacity: 0.5 }).addTo(map).bindTooltip('Recovery (edit in Flight Plan)')

      // Editable: muster points (draggable)
      if (Array.isArray(musterPoints)) {
        musterPoints.forEach((mp, idx) => {
          if (mp.coordinates?.lat) {
            const m = L.marker([mp.coordinates.lat, mp.coordinates.lng], { icon: createIcon('#f59e0b', '🚨', 28), draggable: true }).addTo(map)
            m.on('dragend', e => {
              const p = e.target.getLatLng()
              setLocalMusterPoints(prev => {
                const updated = [...prev]
                updated[idx] = { ...updated[idx], coordinates: { lat: parseFloat(p.lat.toFixed(6)), lng: parseFloat(p.lng.toFixed(6)) } }
                return updated
              })
            })
            markersRef.current[`muster_${idx}`] = m
          }
        })
      }

      // Existing routes
      if (Array.isArray(evacuationRoutes)) {
        evacuationRoutes.forEach((route, idx) => {
          if (Array.isArray(route.coordinates) && route.coordinates.length >= 2) {
            const line = L.polyline(route.coordinates.map(c => [c.lat, c.lng]), { color: '#ef4444', weight: 4, dashArray: '10,10' }).addTo(map)
            routeLayersRef.current.push(line)
          }
        })
      }

      // Click handler
      map.on('click', e => {
        const lat = parseFloat(e.latlng.lat.toFixed(6))
        const lng = parseFloat(e.latlng.lng.toFixed(6))

        if (isDrawingRouteRef.current) {
          setTempRoutePoints(prev => [...prev, { lat, lng }])
        } else if (modeRef.current === 'muster') {
          const newMuster = { name: `Muster ${localMusterPoints.length + 1}`, description: '', coordinates: { lat, lng } }
          
          setLocalMusterPoints(prev => {
            const newList = [...prev, newMuster]
            const idx = newList.length - 1
            
            const m = L.marker([lat, lng], { icon: createIcon('#f59e0b', '🚨', 28), draggable: true }).addTo(map)
            m.on('dragend', e => {
              const p = e.target.getLatLng()
              setLocalMusterPoints(prev2 => {
                const updated = [...prev2]
                if (updated[idx]) updated[idx] = { ...updated[idx], coordinates: { lat: parseFloat(p.lat.toFixed(6)), lng: parseFloat(p.lng.toFixed(6)) } }
                return updated
              })
            })
            markersRef.current[`muster_${idx}`] = m
            
            return newList
          })
        }
      })

      setTimeout(() => { map.invalidateSize(); setLoading(false) }, 200)
    }

    init()
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [isOpen])

  // Draw temp route
  useEffect(() => {
    if (!mapRef.current || !window.L || loading) return
    const L = window.L
    const map = mapRef.current

    if (markersRef.current.tempRoute) { map.removeLayer(markersRef.current.tempRoute); delete markersRef.current.tempRoute }
    Object.keys(markersRef.current).forEach(key => {
      if (key.startsWith('tempPt_')) { map.removeLayer(markersRef.current[key]); delete markersRef.current[key] }
    })

    if (tempRoutePoints.length >= 2) {
      const line = L.polyline(tempRoutePoints.map(p => [p.lat, p.lng]), { color: '#f87171', weight: 3, dashArray: '5,5' }).addTo(map)
      markersRef.current.tempRoute = line
    }

    tempRoutePoints.forEach((pt, i) => {
      const vm = L.circleMarker([pt.lat, pt.lng], { radius: 6, color: '#ef4444', fillColor: 'white', fillOpacity: 1, weight: 2 }).addTo(map)
      markersRef.current[`tempPt_${i}`] = vm
    })
  }, [tempRoutePoints, loading])

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

  const startDrawingRoute = () => { setMode('route'); setIsDrawingRoute(true); setTempRoutePoints([]) }

  const saveRoute = () => {
    if (tempRoutePoints.length < 2) return
    const newRoute = { name: `Route ${localRoutes.length + 1}`, description: '', coordinates: tempRoutePoints }
    setLocalRoutes(prev => [...prev, newRoute])

    if (mapRef.current && window.L) {
      const line = window.L.polyline(tempRoutePoints.map(p => [p.lat, p.lng]), { color: '#ef4444', weight: 4, dashArray: '10,10' }).addTo(mapRef.current)
      routeLayersRef.current.push(line)
    }

    if (markersRef.current.tempRoute && mapRef.current) { mapRef.current.removeLayer(markersRef.current.tempRoute); delete markersRef.current.tempRoute }
    Object.keys(markersRef.current).forEach(key => {
      if (key.startsWith('tempPt_') && mapRef.current) { mapRef.current.removeLayer(markersRef.current[key]); delete markersRef.current[key] }
    })

    setTempRoutePoints([])
    setIsDrawingRoute(false)
    setMode('muster')
  }

  const cancelRoute = () => {
    if (markersRef.current.tempRoute && mapRef.current) { mapRef.current.removeLayer(markersRef.current.tempRoute); delete markersRef.current.tempRoute }
    Object.keys(markersRef.current).forEach(key => {
      if (key.startsWith('tempPt_') && mapRef.current) { mapRef.current.removeLayer(markersRef.current[key]); delete markersRef.current[key] }
    })
    setTempRoutePoints([])
    setIsDrawingRoute(false)
    setMode('muster')
  }

  const handleSave = () => {
    onSave({ musterPoints: localMusterPoints, evacuationRoutes: localRoutes })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Emergency Map Editor</h2>
            <p className="text-sm text-gray-500">Set muster points and evacuation routes. Other markers shown as reference.</p>
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
          <button onClick={() => { setMode('muster'); setIsDrawingRoute(false) }} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${mode === 'muster' && !isDrawingRoute ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>🚨 Add Muster Point</button>
          <button onClick={startDrawingRoute} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${isDrawingRoute ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}><Route className="w-3 h-3" /> {isDrawingRoute ? 'Drawing Route...' : 'Draw Route'}</button>
          {isDrawingRoute && (
            <>
              {tempRoutePoints.length >= 2 && <button onClick={saveRoute} className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded">Save Route ({tempRoutePoints.length} pts)</button>}
              <button onClick={cancelRoute} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">Cancel</button>
            </>
          )}
          <span className="ml-4 text-xs text-gray-500">🚨 {localMusterPoints.length} muster • 🛣️ {localRoutes.length} routes</span>
        </div>

        <div className="flex-1 relative" style={{ minHeight: 400 }}>
          {loading && <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}
          <div ref={containerRef} className="absolute inset-0" />
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
export default function ProjectEmergency({ project, onUpdate }) {
  const [mapEditorOpen, setMapEditorOpen] = useState(false)
  const [activeSiteIndex, setActiveSiteIndex] = useState(0)
  const [expandedSections, setExpandedSections] = useState({
    muster: true, contacts: true, procedures: false, hospital: false
  })

  // Handle both multi-site and legacy
  const sites = project.sites && Array.isArray(project.sites) ? project.sites : []
  const useLegacy = sites.length === 0
  const activeSite = !useLegacy ? sites[activeSiteIndex] : null
  
  const emergencyPlan = useLegacy ? (project.emergencyPlan || {}) : (activeSite?.emergency || {})
  const siteSurvey = useLegacy ? (project.siteSurvey || {}) : (activeSite?.siteSurvey || {})
  const flightPlan = useLegacy ? (project.flightPlan || {}) : (activeSite?.flightPlan || {})

  useEffect(() => {
    if (useLegacy && !project.emergencyPlan) {
      onUpdate({
        emergencyPlan: {
          contacts: [...defaultContacts],
          musterPoints: [],
          evacuationRoutes: [],
          hospital: { name: '', address: '', phone: '', distance: '', driveTime: '' },
          firstAid: { kitLocation: '', aedAvailable: false }
        }
      })
    }
  }, [useLegacy, project.emergencyPlan])

  const updateEmergencyPlan = (updates) => {
    if (useLegacy) {
      onUpdate({ emergencyPlan: { ...emergencyPlan, ...updates } })
    } else if (activeSite) {
      const newSites = [...project.sites]
      const siteIdx = project.sites.findIndex(s => s.id === activeSite.id)
      if (siteIdx >= 0) {
        newSites[siteIdx] = { ...newSites[siteIdx], emergency: { ...newSites[siteIdx].emergency, ...updates } }
        onUpdate({ sites: newSites })
      }
    }
  }

  const toggleSection = (s) => setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }))

  // Contacts
  const addContact = () => updateEmergencyPlan({ contacts: [...(emergencyPlan.contacts || []), { type: 'other', name: '', phone: '', notes: '' }] })
  const updateContact = (i, f, v) => {
    const contacts = [...(emergencyPlan.contacts || [])]
    contacts[i] = { ...contacts[i], [f]: v }
    updateEmergencyPlan({ contacts })
  }
  const removeContact = (i) => updateEmergencyPlan({ contacts: (emergencyPlan.contacts || []).filter((_, idx) => idx !== i) })

  // Muster points (text only)
  const updateMusterPoint = (i, f, v) => {
    const pts = [...(emergencyPlan.musterPoints || [])]
    pts[i] = { ...pts[i], [f]: v }
    updateEmergencyPlan({ musterPoints: pts })
  }
  const removeMusterPoint = (i) => updateEmergencyPlan({ musterPoints: (emergencyPlan.musterPoints || []).filter((_, idx) => idx !== i) })

  // Routes (text only)
  const updateRoute = (i, f, v) => {
    const routes = [...(emergencyPlan.evacuationRoutes || [])]
    routes[i] = { ...routes[i], [f]: v }
    updateEmergencyPlan({ evacuationRoutes: routes })
  }
  const removeRoute = (i) => updateEmergencyPlan({ evacuationRoutes: (emergencyPlan.evacuationRoutes || []).filter((_, idx) => idx !== i) })

  const handleMapSave = ({ musterPoints, evacuationRoutes }) => updateEmergencyPlan({ musterPoints, evacuationRoutes })

  return (
    <div className="space-y-6">
      {/* Site selector */}
      {!useLegacy && sites.length > 1 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4"><Layers className="w-5 h-5 text-blue-600" /> Select Site</h2>
          <div className="flex flex-wrap gap-2">
            {sites.map((s, i) => (
              <button key={s.id} onClick={() => setActiveSiteIndex(i)} className={`px-4 py-2 rounded-lg border-2 ${activeSiteIndex === i ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="font-medium">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!useLegacy && activeSite && (
        <div className="text-sm text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Emergency Plan for: <span className="font-medium text-gray-700">{activeSite.name}</span></div>
      )}

      {/* Muster Points & Evacuation Map */}
      <div className="card">
        <button onClick={() => toggleSection('muster')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Navigation className="w-5 h-5 text-blue-600" /> Muster Points & Evacuation Routes</h2>
          {expandedSections.muster ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.muster && (
          <div className="mt-4 space-y-4">
            <UnifiedMapPreview
              siteLocation={siteSurvey.location?.coordinates}
              boundary={siteSurvey.boundary}
              launchPoint={flightPlan?.launchPoint}
              recoveryPoint={flightPlan?.recoveryPoint}
              musterPoints={emergencyPlan.musterPoints}
              evacuationRoutes={emergencyPlan.evacuationRoutes}
              height={280}
              onEdit={() => setMapEditorOpen(true)}
              editLabel="Edit Muster & Routes"
            />

            {/* Muster Points List */}
            <div>
              <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">🚨 Muster Points ({(emergencyPlan.musterPoints || []).length})</h3>
              {(emergencyPlan.musterPoints || []).length === 0 ? (
                <p className="text-sm text-gray-500">No muster points set. Click "Edit Map" to add.</p>
              ) : (
                <div className="space-y-2">
                  {(emergencyPlan.musterPoints || []).map((mp, i) => (
                    <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex gap-3">
                      <div className="flex-1 grid sm:grid-cols-2 gap-2">
                        <input type="text" value={mp.name || ''} onChange={e => updateMusterPoint(i, 'name', e.target.value)} className="input text-sm" placeholder="Name" />
                        <input type="text" value={mp.description || ''} onChange={e => updateMusterPoint(i, 'description', e.target.value)} className="input text-sm" placeholder="Description / landmarks" />
                      </div>
                      <button onClick={() => removeMusterPoint(i)} className="p-1.5 text-red-500 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Routes List */}
            <div>
              <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">🛣️ Evacuation Routes ({(emergencyPlan.evacuationRoutes || []).length})</h3>
              {(emergencyPlan.evacuationRoutes || []).length === 0 ? (
                <p className="text-sm text-gray-500">No routes set. Click "Edit Map" to draw routes.</p>
              ) : (
                <div className="space-y-2">
                  {(emergencyPlan.evacuationRoutes || []).map((route, i) => (
                    <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-200 flex gap-3">
                      <div className="flex-1 grid sm:grid-cols-2 gap-2">
                        <input type="text" value={route.name || ''} onChange={e => updateRoute(i, 'name', e.target.value)} className="input text-sm" placeholder="Route name" />
                        <input type="text" value={route.description || ''} onChange={e => updateRoute(i, 'description', e.target.value)} className="input text-sm" placeholder="Description" />
                      </div>
                      <button onClick={() => removeRoute(i)} className="p-1.5 text-red-500 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="card">
        <button onClick={() => toggleSection('contacts')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Phone className="w-5 h-5 text-blue-600" /> Emergency Contacts <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">{(emergencyPlan.contacts || []).length}</span></h2>
          {expandedSections.contacts ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.contacts && (
          <div className="mt-4 space-y-3">
            {(emergencyPlan.contacts || []).map((contact, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border flex gap-3">
                <div className="flex-1 grid sm:grid-cols-4 gap-2">
                  <select value={contact.type} onChange={e => updateContact(i, 'type', e.target.value)} className="input text-sm">
                    {contactTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input type="text" value={contact.name} onChange={e => updateContact(i, 'name', e.target.value)} className="input text-sm" placeholder="Name" />
                  <input type="text" value={contact.phone} onChange={e => updateContact(i, 'phone', e.target.value)} className="input text-sm" placeholder="Phone" />
                  <input type="text" value={contact.notes || ''} onChange={e => updateContact(i, 'notes', e.target.value)} className="input text-sm" placeholder="Notes" />
                </div>
                <button onClick={() => removeContact(i)} className="p-1.5 text-red-500 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={addContact} className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Contact</button>
          </div>
        )}
      </div>

      {/* Hospital */}
      <div className="card">
        <button onClick={() => toggleSection('hospital')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Stethoscope className="w-5 h-5 text-blue-600" /> Nearest Hospital</h2>
          {expandedSections.hospital ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.hospital && (
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div><label className="label">Hospital Name</label><input type="text" value={emergencyPlan.hospital?.name || ''} onChange={e => updateEmergencyPlan({ hospital: { ...emergencyPlan.hospital, name: e.target.value } })} className="input" placeholder="e.g., Squamish General Hospital" /></div>
            <div><label className="label">Phone</label><input type="text" value={emergencyPlan.hospital?.phone || ''} onChange={e => updateEmergencyPlan({ hospital: { ...emergencyPlan.hospital, phone: e.target.value } })} className="input" placeholder="e.g., 604-892-5211" /></div>
            <div className="sm:col-span-2"><label className="label">Address</label><input type="text" value={emergencyPlan.hospital?.address || ''} onChange={e => updateEmergencyPlan({ hospital: { ...emergencyPlan.hospital, address: e.target.value } })} className="input" placeholder="Full address" /></div>
            <div><label className="label">Distance</label><input type="text" value={emergencyPlan.hospital?.distance || ''} onChange={e => updateEmergencyPlan({ hospital: { ...emergencyPlan.hospital, distance: e.target.value } })} className="input" placeholder="e.g., 15 km" /></div>
            <div><label className="label">Drive Time</label><input type="text" value={emergencyPlan.hospital?.driveTime || ''} onChange={e => updateEmergencyPlan({ hospital: { ...emergencyPlan.hospital, driveTime: e.target.value } })} className="input" placeholder="e.g., 20 minutes" /></div>
          </div>
        )}
      </div>

      {/* First Aid */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4"><Plus className="w-5 h-5 text-blue-600" /> First Aid</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">First Aid Kit Location</label><input type="text" value={emergencyPlan.firstAid?.kitLocation || ''} onChange={e => updateEmergencyPlan({ firstAid: { ...emergencyPlan.firstAid, kitLocation: e.target.value } })} className="input" placeholder="e.g., In project vehicle" /></div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={emergencyPlan.firstAid?.aedAvailable || false} onChange={e => updateEmergencyPlan({ firstAid: { ...emergencyPlan.firstAid, aedAvailable: e.target.checked } })} className="w-4 h-4" />
              <span className="text-sm">AED Available</span>
            </label>
          </div>
        </div>
      </div>

      {/* Map Editor */}
      <EmergencyMapEditor
        isOpen={mapEditorOpen}
        onClose={() => setMapEditorOpen(false)}
        siteLocation={siteSurvey.location?.coordinates}
        boundary={siteSurvey.boundary}
        launchPoint={flightPlan?.launchPoint}
        recoveryPoint={flightPlan?.recoveryPoint}
        musterPoints={emergencyPlan.musterPoints}
        evacuationRoutes={emergencyPlan.evacuationRoutes}
        onSave={handleMapSave}
      />
    </div>
  )
}
