import { useState, useEffect, useMemo, useRef } from 'react'
import { getAircraft } from '../../lib/firestore'
import { 
  Plane, Plus, Trash2, AlertTriangle, Cloud, Wind, Eye, Gauge, ChevronDown, ChevronUp, Award, FileCheck,
  CheckCircle2, Zap, MapPin, Users, Radio, ExternalLink, RefreshCw, Navigation, Target, Map, X, Loader2, Search, Info, Link2, Layers
} from 'lucide-react'

const operationTypes = [
  { value: 'VLOS', label: 'VLOS', description: 'Visual Line of Sight' },
  { value: 'EVLOS', label: 'EVLOS', description: 'Extended Visual Line of Sight' },
  { value: 'BVLOS', label: 'BVLOS', description: 'Beyond Visual Line of Sight' }
]

const defaultWeatherMinimums = {
  minVisibility: 3,
  minCeiling: 500,
  maxWind: 10,
  maxGust: 15,
  precipitation: false,
  notes: ''
}

const defaultContingencies = [
  { trigger: 'Loss of C2 Link', action: 'Return to Home (RTH) automatically engages. If no RTH within 30 seconds, land in place.', priority: 'high' },
  { trigger: 'Low Battery Warning', action: 'Immediately return to launch point. Land with minimum 20% remaining.', priority: 'high' },
  { trigger: 'GPS Loss', action: 'Switch to ATTI mode, maintain visual contact, manual return and land.', priority: 'high' },
  { trigger: 'Fly-Away', action: 'Attempt to regain control. If unsuccessful, contact FIC Edmonton (1-866-541-4102) immediately.', priority: 'critical' },
  { trigger: 'Deteriorating Weather', action: 'Land immediately if conditions fall below minimums.', priority: 'medium' },
  { trigger: 'Aircraft in Vicinity', action: 'Descend and hold position or land. Give way to all manned aircraft.', priority: 'high' }
]

// ============================================
// MAP PREVIEW
// ============================================
function MapPreview({ siteLocation, boundary, launchPoint, recoveryPoint, height = 200, onEdit }) {
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
      const lat = siteLocation?.lat || launchPoint?.lat || 54
      const lng = siteLocation?.lng || launchPoint?.lng || -125
      const hasLoc = siteLocation?.lat || launchPoint?.lat

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

      // Reference markers
      if (siteLocation?.lat) L.marker([siteLocation.lat, siteLocation.lng], { icon: icon('#1e40af', '📍', 20), opacity: 0.6 }).addTo(map)
      if (Array.isArray(boundary) && boundary.length >= 3) {
        L.polygon(boundary.map(p => [p.lat, p.lng]), { color: '#9333ea', fillOpacity: 0.1, weight: 2, dashArray: '5,5' }).addTo(map)
      }

      // Main markers
      if (launchPoint?.lat) L.marker([launchPoint.lat, launchPoint.lng], { icon: icon('#16a34a', '🚀', 28) }).addTo(map)
      if (recoveryPoint?.lat) L.marker([recoveryPoint.lat, recoveryPoint.lng], { icon: icon('#dc2626', '🎯', 28) }).addTo(map)

      const pts = []
      if (siteLocation?.lat) pts.push([siteLocation.lat, siteLocation.lng])
      if (Array.isArray(boundary)) boundary.forEach(p => pts.push([p.lat, p.lng]))
      if (launchPoint?.lat) pts.push([launchPoint.lat, launchPoint.lng])
      if (recoveryPoint?.lat) pts.push([recoveryPoint.lat, recoveryPoint.lng])
      if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30] })

      setLoading(false)
    }
    
    init()
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [siteLocation, boundary, launchPoint, recoveryPoint])

  const hasContent = launchPoint?.lat || recoveryPoint?.lat

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100" style={{ height }}>
      {loading && <div className="absolute inset-0 flex items-center justify-center z-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
      <div ref={containerRef} className="w-full h-full" />
      <button onClick={onEdit} className="absolute bottom-3 right-3 px-4 py-2 bg-white hover:bg-gray-50 text-sm font-medium rounded-lg shadow-md border flex items-center gap-2" style={{ zIndex: 1000 }}>
        <Map className="w-4 h-4" /> Edit Map
      </button>
      {!hasContent && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 pointer-events-none" style={{ zIndex: 5 }}>
          <div className="text-center">
            <Navigation className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click "Edit Map" to set launch & recovery</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// MAP EDITOR MODAL
// ============================================
function FlightMapEditor({ siteLocation, boundary, launchPoint, recoveryPoint, onSave, isOpen, onClose }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [mode, setMode] = useState('launch')
  const [launchCoords, setLaunchCoords] = useState({ lat: '', lng: '' })
  const [recoveryCoords, setRecoveryCoords] = useState({ lat: '', lng: '' })

  const modeRef = useRef('launch')
  useEffect(() => { modeRef.current = mode }, [mode])

  useEffect(() => {
    if (isOpen) {
      setLaunchCoords({ lat: launchPoint?.lat?.toString() || '', lng: launchPoint?.lng?.toString() || '' })
      setRecoveryCoords({ lat: recoveryPoint?.lat?.toString() || '', lng: recoveryPoint?.lng?.toString() || '' })
      setMode('launch')
      setLoading(true)
    }
  }, [isOpen, launchPoint, recoveryPoint])

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
      await new Promise(r => setTimeout(r, 100))
      if (!containerRef.current) return

      const L = window.L
      const lat = siteLocation?.lat || launchPoint?.lat || 54
      const lng = siteLocation?.lng || launchPoint?.lng || -125
      const hasLoc = siteLocation?.lat || launchPoint?.lat

      const map = L.map(containerRef.current, { center: [lat, lng], zoom: hasLoc ? 15 : 5 })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
      mapRef.current = map

      const createIcon = (color, emoji, size = 32) => L.divIcon({
        className: 'custom-icon',
        html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:${size*0.45}px">${emoji}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size]
      })

      // Reference: site location
      if (siteLocation?.lat) {
        L.marker([siteLocation.lat, siteLocation.lng], { icon: createIcon('#1e40af', '📍', 24), opacity: 0.6 })
          .addTo(map).bindTooltip('Site Location (from Site Survey)')
      }

      // Reference: boundary
      if (Array.isArray(boundary) && boundary.length >= 3) {
        L.polygon(boundary.map(p => [p.lat, p.lng]), { color: '#9333ea', fillOpacity: 0.1, weight: 2, dashArray: '5,5' }).addTo(map)
      }

      // Draggable launch marker
      if (launchPoint?.lat) {
        const m = L.marker([launchPoint.lat, launchPoint.lng], { icon: createIcon('#16a34a', '🚀'), draggable: true }).addTo(map)
        m.on('dragend', e => {
          const p = e.target.getLatLng()
          setLaunchCoords({ lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) })
        })
        markersRef.current.launch = m
      }

      // Draggable recovery marker
      if (recoveryPoint?.lat) {
        const m = L.marker([recoveryPoint.lat, recoveryPoint.lng], { icon: createIcon('#dc2626', '🎯'), draggable: true }).addTo(map)
        m.on('dragend', e => {
          const p = e.target.getLatLng()
          setRecoveryCoords({ lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) })
        })
        markersRef.current.recovery = m
      }

      // Click handler
      map.on('click', e => {
        const lat = parseFloat(e.latlng.lat.toFixed(6))
        const lng = parseFloat(e.latlng.lng.toFixed(6))
        const currentMode = modeRef.current

        if (currentMode === 'launch') {
          setLaunchCoords({ lat: lat.toString(), lng: lng.toString() })
          if (markersRef.current.launch) {
            markersRef.current.launch.setLatLng([lat, lng])
          } else {
            const m = L.marker([lat, lng], { icon: createIcon('#16a34a', '🚀'), draggable: true }).addTo(map)
            m.on('dragend', e => {
              const p = e.target.getLatLng()
              setLaunchCoords({ lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) })
            })
            markersRef.current.launch = m
          }
        } else {
          setRecoveryCoords({ lat: lat.toString(), lng: lng.toString() })
          if (markersRef.current.recovery) {
            markersRef.current.recovery.setLatLng([lat, lng])
          } else {
            const m = L.marker([lat, lng], { icon: createIcon('#dc2626', '🎯'), draggable: true }).addTo(map)
            m.on('dragend', e => {
              const p = e.target.getLatLng()
              setRecoveryCoords({ lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) })
            })
            markersRef.current.recovery = m
          }
        }
      })

      setTimeout(() => { map.invalidateSize(); setLoading(false) }, 200)
    }

    init()
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [isOpen])

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

  const copyLaunchToRecovery = () => {
    if (launchCoords.lat && launchCoords.lng) {
      setRecoveryCoords({ ...launchCoords })
      if (mapRef.current && window.L) {
        const L = window.L
        const lat = parseFloat(launchCoords.lat)
        const lng = parseFloat(launchCoords.lng)
        if (markersRef.current.recovery) {
          markersRef.current.recovery.setLatLng([lat, lng])
        } else {
          const createIcon = (color, emoji, size = 32) => L.divIcon({
            className: 'custom-icon',
            html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:${size*0.45}px">${emoji}</span></div>`,
            iconSize: [size, size],
            iconAnchor: [size/2, size]
          })
          const m = L.marker([lat, lng], { icon: createIcon('#dc2626', '🎯'), draggable: true }).addTo(mapRef.current)
          m.on('dragend', e => {
            const p = e.target.getLatLng()
            setRecoveryCoords({ lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) })
          })
          markersRef.current.recovery = m
        }
      }
    }
  }

  const handleSave = () => {
    onSave({
      launchPoint: launchCoords.lat && launchCoords.lng ? { lat: parseFloat(launchCoords.lat), lng: parseFloat(launchCoords.lng) } : null,
      recoveryPoint: recoveryCoords.lat && recoveryCoords.lng ? { lat: parseFloat(recoveryCoords.lat), lng: parseFloat(recoveryCoords.lng) } : null
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Launch & Recovery Points</h2>
            <p className="text-sm text-gray-500">Click to place, drag to move markers</p>
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
          <span className="text-xs font-medium text-gray-500 mr-2">CLICK TO SET:</span>
          <button onClick={() => setMode('launch')} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${mode === 'launch' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            🚀 Launch Point
          </button>
          <button onClick={() => setMode('recovery')} className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${mode === 'recovery' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            🎯 Recovery Point
          </button>
          <button onClick={copyLaunchToRecovery} disabled={!launchCoords.lat} className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1">
            <Link2 className="w-3 h-3" /> Same as Launch
          </button>
        </div>

        <div className="flex-1 relative" style={{ minHeight: 400 }}>
          {loading && <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}
          <div ref={containerRef} className="absolute inset-0" />
        </div>

        <div className="p-3 border-t bg-gray-50 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚀</span>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Launch Point</div>
              <div className="flex gap-2">
                <input type="text" value={launchCoords.lat} onChange={e => setLaunchCoords(p => ({ ...p, lat: e.target.value }))} placeholder="Lat" className="flex-1 px-2 py-1 border rounded text-sm" />
                <input type="text" value={launchCoords.lng} onChange={e => setLaunchCoords(p => ({ ...p, lng: e.target.value }))} placeholder="Lng" className="flex-1 px-2 py-1 border rounded text-sm" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">Recovery Point</div>
              <div className="flex gap-2">
                <input type="text" value={recoveryCoords.lat} onChange={e => setRecoveryCoords(p => ({ ...p, lat: e.target.value }))} placeholder="Lat" className="flex-1 px-2 py-1 border rounded text-sm" />
                <input type="text" value={recoveryCoords.lng} onChange={e => setRecoveryCoords(p => ({ ...p, lng: e.target.value }))} placeholder="Lng" className="flex-1 px-2 py-1 border rounded text-sm" />
              </div>
            </div>
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
export default function ProjectFlightPlan({ project, onUpdate, onNavigateToSection }) {
  const [aircraftList, setAircraftList] = useState([])
  const [loading, setLoading] = useState(true)
  const [mapEditorOpen, setMapEditorOpen] = useState(false)
  const [activeSiteIndex, setActiveSiteIndex] = useState(0)
  const [expandedSections, setExpandedSections] = useState({
    inherited: true,
    aircraft: true,
    launchRecovery: true,
    parameters: true,
    weather: false,
    contingencies: false
  })

  useEffect(() => { loadAircraft() }, [])

  const loadAircraft = async () => {
    try {
      const data = await getAircraft()
      setAircraftList(data.filter(ac => ac.status === 'airworthy'))
    } catch (err) { console.error('Error loading aircraft:', err) }
    finally { setLoading(false) }
  }

  // Handle both multi-site and legacy single-site structure
  const sites = project.sites && Array.isArray(project.sites) ? project.sites.filter(s => s.includeFlightPlan) : []
  const useLegacy = sites.length === 0

  // Legacy mode uses project.flightPlan directly
  // Multi-site mode uses sites[activeSiteIndex].flightPlan
  const activeSite = !useLegacy ? sites[activeSiteIndex] : null
  const flightPlan = useLegacy ? (project.flightPlan || {}) : (activeSite?.flightPlan || {})
  const siteSurvey = useLegacy ? (project.siteSurvey || {}) : (activeSite?.siteSurvey || {})

  // Initialize legacy flightPlan if needed
  useEffect(() => {
    if (useLegacy && !project.flightPlan) {
      onUpdate({
        flightPlan: {
          aircraft: [],
          operationType: 'VLOS',
          maxAltitudeAGL: 120,
          weatherMinimums: { ...defaultWeatherMinimums },
          contingencies: [...defaultContingencies]
        }
      })
    }
  }, [useLegacy, project.flightPlan])

  const updateFlightPlan = (updates) => {
    if (useLegacy) {
      onUpdate({ flightPlan: { ...flightPlan, ...updates } })
    } else {
      const newSites = [...project.sites]
      const siteIdx = project.sites.findIndex(s => s.id === activeSite.id)
      if (siteIdx >= 0) {
        newSites[siteIdx] = { ...newSites[siteIdx], flightPlan: { ...newSites[siteIdx].flightPlan, ...updates } }
        onUpdate({ sites: newSites })
      }
    }
  }

  const toggleSection = (s) => setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }))

  const addAircraft = (aircraftId) => {
    if (!aircraftId) return
    const ac = aircraftList.find(a => a.id === aircraftId)
    if (!ac || flightPlan.aircraft?.some(a => a.id === aircraftId)) return
    updateFlightPlan({
      aircraft: [...(flightPlan.aircraft || []), {
        id: ac.id, nickname: ac.nickname, make: ac.make, model: ac.model,
        mtow: ac.mtow, maxSpeed: ac.maxSpeed, maxDimension: ac.maxDimension,
        isPrimary: (flightPlan.aircraft || []).length === 0
      }]
    })
  }

  const removeAircraft = (idx) => {
    const newList = (flightPlan.aircraft || []).filter((_, i) => i !== idx)
    if (newList.length > 0 && !newList.some(a => a.isPrimary)) newList[0].isPrimary = true
    updateFlightPlan({ aircraft: newList })
  }

  const setPrimaryAircraft = (idx) => {
    const newList = (flightPlan.aircraft || []).map((a, i) => ({ ...a, isPrimary: i === idx }))
    updateFlightPlan({ aircraft: newList })
  }

  const handleMapSave = ({ launchPoint, recoveryPoint }) => {
    updateFlightPlan({ launchPoint, recoveryPoint })
  }

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>

  // No sites with flight plans
  if (!useLegacy && sites.length === 0) {
    return (
      <div className="card text-center py-12">
        <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Flight Plans</h3>
        <p className="text-gray-500 mb-4">Enable "Include Flight Plan & SORA" on at least one site in Site Survey.</p>
        {onNavigateToSection && (
          <button onClick={() => onNavigateToSection('siteSurvey')} className="btn-primary">Go to Site Survey</button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Site selector for multi-site */}
      {!useLegacy && sites.length > 1 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-blue-600" /> Select Site
          </h2>
          <div className="flex flex-wrap gap-2">
            {sites.map((s, i) => (
              <button key={s.id} onClick={() => setActiveSiteIndex(i)} className={`px-4 py-2 rounded-lg border-2 ${activeSiteIndex === i ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="font-medium">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current site indicator */}
      {!useLegacy && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Flight Plan for: <span className="font-medium text-gray-700">{activeSite?.name}</span>
        </div>
      )}

      {/* Aircraft Selection */}
      <div className="card">
        <button onClick={() => toggleSection('aircraft')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" /> Aircraft
            <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">{(flightPlan.aircraft || []).length}</span>
          </h2>
          {expandedSections.aircraft ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.aircraft && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <select onChange={e => addAircraft(e.target.value)} value="" className="input flex-1">
                <option value="">Select aircraft to add...</option>
                {aircraftList.filter(ac => !(flightPlan.aircraft || []).some(a => a.id === ac.id)).map(ac => (
                  <option key={ac.id} value={ac.id}>{ac.nickname} - {ac.make} {ac.model}</option>
                ))}
              </select>
            </div>
            {(flightPlan.aircraft || []).map((ac, i) => (
              <div key={ac.id} className={`p-4 rounded-lg border ${ac.isPrimary ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{ac.nickname}</p>
                    <p className="text-sm text-gray-600">{ac.make} {ac.model}</p>
                    <p className="text-xs text-gray-500 mt-1">MTOW: {ac.mtow}kg</p>
                  </div>
                  <div className="flex gap-2">
                    {!ac.isPrimary && <button onClick={() => setPrimaryAircraft(i)} className="text-xs text-blue-600 hover:underline">Set Primary</button>}
                    {ac.isPrimary && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Primary</span>}
                    <button onClick={() => removeAircraft(i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Launch & Recovery */}
      <div className="card">
        <button onClick={() => toggleSection('launchRecovery')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" /> Launch & Recovery Points
            {(flightPlan.launchPoint || flightPlan.recoveryPoint) && <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">Set</span>}
          </h2>
          {expandedSections.launchRecovery ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.launchRecovery && (
          <div className="mt-4 space-y-4">
            <MapPreview
              siteLocation={siteSurvey.location?.coordinates}
              boundary={siteSurvey.boundary}
              launchPoint={flightPlan.launchPoint}
              recoveryPoint={flightPlan.recoveryPoint}
              height={250}
              onEdit={() => setMapEditorOpen(true)}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2"><span className="text-lg">🚀</span><h3 className="font-medium text-green-800">Launch Point</h3></div>
                {flightPlan.launchPoint?.lat ? (
                  <p className="text-sm font-mono text-green-700">{flightPlan.launchPoint.lat}, {flightPlan.launchPoint.lng}</p>
                ) : <p className="text-sm text-green-600">Click "Edit Map" to set</p>}
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2"><span className="text-lg">🎯</span><h3 className="font-medium text-red-800">Recovery Point</h3></div>
                {flightPlan.recoveryPoint?.lat ? (
                  <p className="text-sm font-mono text-red-700">{flightPlan.recoveryPoint.lat}, {flightPlan.recoveryPoint.lng}</p>
                ) : <p className="text-sm text-red-600">Click "Edit Map" to set</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flight Parameters */}
      <div className="card">
        <button onClick={() => toggleSection('parameters')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Gauge className="w-5 h-5 text-blue-600" /> Flight Parameters</h2>
          {expandedSections.parameters ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.parameters && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Operation Type *</label>
                <select value={flightPlan.operationType || 'VLOS'} onChange={e => updateFlightPlan({ operationType: e.target.value })} className="input">
                  {operationTypes.map(t => <option key={t.value} value={t.value}>{t.label} - {t.description}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Max Altitude (m AGL) *</label>
                <input type="number" value={flightPlan.maxAltitudeAGL || ''} onChange={e => updateFlightPlan({ maxAltitudeAGL: parseInt(e.target.value) || 0 })} className="input" placeholder="e.g., 120" />
              </div>
              <div>
                <label className="label">Flight Radius (m)</label>
                <input type="number" value={flightPlan.flightRadius || ''} onChange={e => updateFlightPlan({ flightRadius: parseInt(e.target.value) || 0 })} className="input" placeholder="e.g., 500" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Min Distance from People (m)</label>
                <input type="number" value={flightPlan.distanceFromPeople || ''} onChange={e => updateFlightPlan({ distanceFromPeople: parseInt(e.target.value) || 0 })} className="input" placeholder="30" />
              </div>
              <div>
                <label className="label">Estimated Duration (min)</label>
                <input type="number" value={flightPlan.estimatedDuration || ''} onChange={e => updateFlightPlan({ estimatedDuration: parseInt(e.target.value) || 0 })} className="input" placeholder="e.g., 30" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={flightPlan.overPeople || false} onChange={e => updateFlightPlan({ overPeople: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">Operations over people</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={flightPlan.nightOperations || false} onChange={e => updateFlightPlan({ nightOperations: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">Night operations</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Weather Minimums */}
      <div className="card">
        <button onClick={() => toggleSection('weather')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Cloud className="w-5 h-5 text-blue-600" /> Weather Minimums</h2>
          {expandedSections.weather ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.weather && (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">Min Visibility (km)</label>
              <input type="number" value={flightPlan.weatherMinimums?.minVisibility || ''} onChange={e => updateFlightPlan({ weatherMinimums: { ...flightPlan.weatherMinimums, minVisibility: parseFloat(e.target.value) || 0 } })} className="input" />
            </div>
            <div>
              <label className="label">Min Ceiling (ft AGL)</label>
              <input type="number" value={flightPlan.weatherMinimums?.minCeiling || ''} onChange={e => updateFlightPlan({ weatherMinimums: { ...flightPlan.weatherMinimums, minCeiling: parseInt(e.target.value) || 0 } })} className="input" />
            </div>
            <div>
              <label className="label">Max Wind (km/h)</label>
              <input type="number" value={flightPlan.weatherMinimums?.maxWind || ''} onChange={e => updateFlightPlan({ weatherMinimums: { ...flightPlan.weatherMinimums, maxWind: parseInt(e.target.value) || 0 } })} className="input" />
            </div>
            <div>
              <label className="label">Max Gust (km/h)</label>
              <input type="number" value={flightPlan.weatherMinimums?.maxGust || ''} onChange={e => updateFlightPlan({ weatherMinimums: { ...flightPlan.weatherMinimums, maxGust: parseInt(e.target.value) || 0 } })} className="input" />
            </div>
          </div>
        )}
      </div>

      {/* Contingencies */}
      <div className="card">
        <button onClick={() => toggleSection('contingencies')} className="flex items-center justify-between w-full text-left">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" /> Contingency Procedures
            <span className="px-2 py-0.5 text-xs bg-gray-100 rounded">{(flightPlan.contingencies || []).length}</span>
          </h2>
          {expandedSections.contingencies ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSections.contingencies && (
          <div className="mt-4 space-y-3">
            {(flightPlan.contingencies || defaultContingencies).map((c, i) => (
              <div key={i} className={`p-3 rounded-lg border ${c.priority === 'critical' ? 'border-red-300 bg-red-50' : c.priority === 'high' ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}`}>
                <p className="font-medium text-sm">{c.trigger}</p>
                <p className="text-sm text-gray-600 mt-1">{c.action}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Editor Modal */}
      <FlightMapEditor
        isOpen={mapEditorOpen}
        onClose={() => setMapEditorOpen(false)}
        siteLocation={siteSurvey.location?.coordinates}
        boundary={siteSurvey.boundary}
        launchPoint={flightPlan.launchPoint}
        recoveryPoint={flightPlan.recoveryPoint}
        onSave={handleMapSave}
      />
    </div>
  )
}
