// ============================================
// PROJECT EMERGENCY COMPONENT
// With map-based muster points and evacuation routes
// Auto-saves on changes, clear/delete functionality
// 
// @location src/components/projects/ProjectEmergency.jsx
// @action REPLACE
// ============================================

import { useState, useEffect, useRef } from 'react'
import { 
  ShieldAlert, 
  Plus,
  Trash2,
  Phone,
  MapPin,
  Users,
  Route,
  Stethoscope,
  Flame,
  Plane,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Building,
  Clock,
  Navigation,
  Map,
  X,
  Loader2,
  Search,
  Target,
  Edit3
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
  { type: 'fic', name: 'FIC Edmonton', phone: '1-866-541-4102', notes: 'For fly-away reporting, lost link incidents' },
  { type: 'company', name: 'Aeria Solutions', phone: '', notes: 'Company emergency contact' }
]

const procedureTypes = [
  { 
    id: 'medical', 
    label: 'Medical Emergency', 
    icon: Stethoscope,
    defaultSteps: [
      'Cease all flight operations immediately',
      'Ensure scene safety before approaching',
      'Call 911 if serious injury',
      'Administer first aid within training level',
      'Designate someone to meet emergency responders',
      'Do not move injured person unless immediate danger',
      'Document incident details for reporting'
    ]
  },
  { 
    id: 'fire', 
    label: 'Fire Emergency', 
    icon: Flame,
    defaultSteps: [
      'Alert all personnel - evacuate to muster point',
      'Call 911',
      'Only attempt to extinguish small fires if safe and trained',
      'Do not re-enter area until cleared by fire services',
      'Account for all personnel at muster point',
      'Notify client/site contact'
    ]
  },
  { 
    id: 'aircraft_incident', 
    label: 'Aircraft Incident/Crash', 
    icon: Plane,
    defaultSteps: [
      'Note last known position and time',
      'Do not approach if fire/smoke present',
      'Secure the area - prevent unauthorized access',
      'Do not disturb wreckage (potential TSB investigation)',
      'Document scene with photos from safe distance',
      'Report to FIC Edmonton if fly-away',
      'Complete incident report within 24 hours',
      'Notify Transport Canada if required by CARs 901.50'
    ]
  },
  { 
    id: 'weather', 
    label: 'Severe Weather', 
    icon: AlertTriangle,
    defaultSteps: [
      'Monitor weather continuously during operations',
      'Land aircraft immediately if conditions deteriorate',
      'Seek shelter in vehicle or substantial structure',
      'If lightning: avoid high ground, isolated trees, water',
      'Wait 30 minutes after last thunder before resuming',
      'Do not resume operations until conditions improve to minimums'
    ]
  },
  { 
    id: 'wildlife', 
    label: 'Wildlife Encounter', 
    icon: AlertTriangle,
    defaultSteps: [
      'Do not approach or feed wildlife',
      'Make noise to alert animals to your presence',
      'If bear encounter: speak calmly, back away slowly',
      'Do not run - back away while facing the animal',
      'Report dangerous wildlife to site supervisor',
      'Suspend operations if wildlife presents ongoing hazard'
    ]
  }
]

const defaultProcedures = {}
procedureTypes.forEach(pt => {
  defaultProcedures[pt.id] = { enabled: true, steps: pt.defaultSteps }
})

// ============================================
// SITE COLORS - Consistent across all views
// ============================================
const SITE_COLORS = [
  { primary: '#1e40af', light: '#dbeafe', name: 'Blue' },
  { primary: '#7c3aed', light: '#ede9fe', name: 'Purple' },
  { primary: '#059669', light: '#d1fae5', name: 'Green' },
  { primary: '#dc2626', light: '#fee2e2', name: 'Red' },
  { primary: '#d97706', light: '#fef3c7', name: 'Amber' },
  { primary: '#0891b2', light: '#cffafe', name: 'Cyan' },
]

const getSiteColor = (index) => SITE_COLORS[index % SITE_COLORS.length]

// ============================================
// EMERGENCY MAP EDITOR
// Shows all site locations + muster/evac features
// ============================================
function EmergencyMapEditor({ 
  project, 
  emergencyPlan,
  onUpdateMusterPoints,
  onUpdateEvacRoutes,
  isOpen, 
  onClose 
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const layersRef = useRef({})
  
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [editMode, setEditMode] = useState(null)
  const [tempRoutePoints, setTempRoutePoints] = useState([])
  
  const editModeRef = useRef(editMode)
  const tempRoutePointsRef = useRef(tempRoutePoints)
  
  useEffect(() => { editModeRef.current = editMode }, [editMode])
  useEffect(() => { tempRoutePointsRef.current = tempRoutePoints }, [tempRoutePoints])

  const sites = project?.sites || []
  const musterPoints = emergencyPlan?.musterPoints || []
  const evacuationRoutes = emergencyPlan?.evacuationRoutes || []

  useEffect(() => {
    if (!isOpen) return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!document.getElementById('emergency-map-styles')) {
      const style = document.createElement('style')
      style.id = 'emergency-map-styles'
      style.textContent = `
        .leaflet-container { width: 100% !important; height: 100% !important; z-index: 1; }
        .leaflet-control-container { z-index: 800; }
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

      let centerLat = 54.0
      let centerLng = -125.0
      let zoom = 5

      const siteWithLocation = sites.find(s => s.siteSurvey?.location?.coordinates?.lat)
      if (siteWithLocation) {
        const coords = siteWithLocation.siteSurvey.location.coordinates
        centerLat = parseFloat(coords.lat)
        centerLng = parseFloat(coords.lng)
        zoom = 13
      }

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      mapRef.current = map
      map.on('click', handleMapClick)
      
      renderFeatures(L)
      setIsLoading(false)
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!mapRef.current || !window.L || isLoading) return
    renderFeatures(window.L)
  }, [musterPoints, evacuationRoutes, tempRoutePoints, isLoading])

  const handleMapClick = (e) => {
    const mode = editModeRef.current
    if (!mode) return

    const { lat, lng } = e.latlng
    const point = { lat: lat.toFixed(6), lng: lng.toFixed(6) }

    if (mode === 'muster') {
      const newMusterPoints = [...(emergencyPlan?.musterPoints || [])]
      newMusterPoints.push({
        id: `muster-${Date.now()}`,
        name: `Muster Point ${newMusterPoints.length + 1}`,
        coordinates: point,
        location: `${point.lat}, ${point.lng}`,
        description: ''
      })
      onUpdateMusterPoints(newMusterPoints)
      setEditMode(null)
    } else if (mode === 'evacRoute') {
      setTempRoutePoints(prev => [...prev, point])
    }
  }

  const renderFeatures = (L) => {
    if (!mapRef.current) return
    const map = mapRef.current

    Object.values(markersRef.current).forEach(m => map.removeLayer(m))
    Object.values(layersRef.current).forEach(l => map.removeLayer(l))
    markersRef.current = {}
    layersRef.current = {}

    const createMarkerIcon = (color, emoji, size = 32) => {
      return L.divIcon({
        className: 'custom-marker',
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
        "><span style="transform: rotate(45deg); font-size: ${size * 0.5}px;">${emoji}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size]
      })
    }

    sites.forEach((site, idx) => {
      const color = getSiteColor(idx)
      const coords = site.siteSurvey?.location?.coordinates
      
      if (coords?.lat) {
        const marker = L.marker(
          [parseFloat(coords.lat), parseFloat(coords.lng)],
          { icon: createMarkerIcon(color.primary, '📍', 28), opacity: 0.7 }
        ).addTo(map)
        marker.bindPopup(`<b>${site.name || `Site ${idx + 1}`}</b><br/>Site Location`)
        markersRef.current[`site-${idx}`] = marker
      }

      const boundary = site.siteSurvey?.boundary || []
      if (boundary.length > 0) {
        const boundaryCoords = boundary.map(p => [parseFloat(p.lat), parseFloat(p.lng)])
        const polygon = L.polygon(boundaryCoords, {
          color: color.primary,
          fillColor: color.primary,
          fillOpacity: 0.1,
          weight: 2,
          opacity: 0.5,
          dashArray: '5, 5'
        }).addTo(map)
        polygon.bindPopup(`<b>${site.name}</b><br/>Work Area`)
        layersRef.current[`boundary-${idx}`] = polygon
      }
    })

    musterPoints.forEach((mp, idx) => {
      if (!mp.coordinates?.lat) return

      const marker = L.marker(
        [parseFloat(mp.coordinates.lat), parseFloat(mp.coordinates.lng)],
        { icon: createMarkerIcon('#22c55e', '🟢', 36), draggable: true }
      ).addTo(map)

      marker.bindPopup(`<b>${mp.name || `Muster Point ${idx + 1}`}</b>`)

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng()
        const newPoints = [...musterPoints]
        newPoints[idx] = {
          ...newPoints[idx],
          coordinates: { lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) },
          location: `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`
        }
        onUpdateMusterPoints(newPoints)
      })

      markersRef.current[`muster-${idx}`] = marker
    })

    evacuationRoutes.forEach((route, idx) => {
      if (!route.coordinates || route.coordinates.length < 2) return

      const coords = route.coordinates.map(p => [parseFloat(p.lat), parseFloat(p.lng)])
      
      const polyline = L.polyline(coords, {
        color: '#ef4444',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5'
      }).addTo(map)

      polyline.bindPopup(`<b>${route.name || `Route ${idx + 1}`}</b>`)
      layersRef.current[`evac-${idx}`] = polyline

      route.coordinates.forEach((point, pIdx) => {
        const vertexMarker = L.circleMarker(
          [parseFloat(point.lat), parseFloat(point.lng)],
          {
            radius: 6,
            fillColor: '#ef4444',
            color: 'white',
            weight: 2,
            fillOpacity: 1
          }
        ).addTo(map)
        markersRef.current[`evac-vertex-${idx}-${pIdx}`] = vertexMarker
      })
    })

    if (tempRoutePoints.length > 0) {
      const coords = tempRoutePoints.map(p => [parseFloat(p.lat), parseFloat(p.lng)])
      const polyline = L.polyline(coords, {
        color: '#ef4444',
        weight: 4,
        opacity: 0.8
      }).addTo(map)
      layersRef.current['temp-route'] = polyline

      tempRoutePoints.forEach((point, idx) => {
        const marker = L.circleMarker(
          [parseFloat(point.lat), parseFloat(point.lng)],
          {
            radius: 8,
            fillColor: '#ef4444',
            color: 'white',
            weight: 2,
            fillOpacity: 1
          }
        ).addTo(map)
        markersRef.current[`temp-route-${idx}`] = marker
      })
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapRef.current) return
    
    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 15)
      } else {
        alert('Location not found')
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setSearching(false)
    }
  }

  const saveEvacRoute = () => {
    if (tempRoutePoints.length < 2) {
      alert('Route needs at least 2 points')
      return
    }

    const newRoutes = [...evacuationRoutes]
    newRoutes.push({
      id: `route-${Date.now()}`,
      name: `Evacuation Route ${newRoutes.length + 1}`,
      coordinates: tempRoutePoints,
      description: ''
    })
    onUpdateEvacRoutes(newRoutes)
    setTempRoutePoints([])
    setEditMode(null)
  }

  const handleClose = () => {
    if (tempRoutePoints.length >= 2) {
      saveEvacRoute()
    }
    setTempRoutePoints([])
    setEditMode(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[95vw] h-[90vh] max-w-5xl flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Map className="w-5 h-5 text-red-600" />
            Emergency Map - Muster Points & Evacuation Routes
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b bg-white">
          <div className="flex gap-2 max-w-md">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>
        </div>

        <div className="p-3 border-b bg-gray-50 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 mr-2">Add:</span>
          <button
            onClick={() => setEditMode(editMode === 'muster' ? null : 'muster')}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
              editMode === 'muster'
                ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                : 'bg-white border text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" /> Muster Point
          </button>
          <button
            onClick={() => {
              if (editMode === 'evacRoute') {
                setEditMode(null)
                setTempRoutePoints([])
              } else {
                setEditMode('evacRoute')
                setTempRoutePoints([])
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
              editMode === 'evacRoute'
                ? 'bg-red-100 text-red-800 ring-2 ring-red-500'
                : 'bg-white border text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Route className="w-4 h-4" />
            {editMode === 'evacRoute' ? `Drawing (${tempRoutePoints.length})...` : 'Evacuation Route'}
          </button>

          {editMode === 'evacRoute' && tempRoutePoints.length > 0 && (
            <>
              <button
                onClick={() => setTempRoutePoints(prev => prev.slice(0, -1))}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Undo Point
              </button>
              <button
                onClick={saveEvacRoute}
                disabled={tempRoutePoints.length < 2}
                className="px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                ✓ Save Route
              </button>
            </>
          )}

          <div className="flex-1" />

          <span className="text-xs text-gray-500">
            {musterPoints.length} muster point{musterPoints.length !== 1 ? 's' : ''} • 
            {evacuationRoutes.length} route{evacuationRoutes.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}
          <div ref={mapContainerRef} className="absolute inset-0" />
        </div>

        <div className="p-4 border-t flex justify-between items-center bg-white">
          <div className="text-sm text-gray-500">
            {editMode ? (
              <span className="text-blue-600 font-medium">
                Click on map to {editMode === 'muster' ? 'place muster point' : 'add route points'}
              </span>
            ) : (
              <span>Drag muster points to reposition • Changes save automatically</span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectEmergency({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    contacts: true,
    medical: true,
    muster: true,
    procedures: false
  })
  const [mapEditorOpen, setMapEditorOpen] = useState(false)

  useEffect(() => {
    if (!project.emergencyPlan) {
      onUpdate({
        emergencyPlan: {
          contacts: defaultContacts,
          medicalFacility: {
            name: '',
            phone: '',
            address: '',
            distance: '',
            driveTime: '',
            directions: ''
          },
          firstAid: {
            kitLocation: 'In project vehicle',
            aedAvailable: false,
            aedLocation: '',
            designatedAttendant: ''
          },
          musterPoints: [],
          evacuationRoutes: [],
          procedures: defaultProcedures,
          siteSpecificHazards: '',
          additionalNotes: ''
        }
      })
    }
  }, [project.emergencyPlan])

  const emergencyPlan = project.emergencyPlan || {}

  const updateEmergencyPlan = (updates) => {
    onUpdate({
      emergencyPlan: {
        ...emergencyPlan,
        ...updates
      }
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const addContact = () => {
    updateEmergencyPlan({
      contacts: [...(emergencyPlan.contacts || []), {
        type: 'other',
        name: '',
        phone: '',
        notes: ''
      }]
    })
  }

  const updateContact = (index, field, value) => {
    const newContacts = [...(emergencyPlan.contacts || [])]
    newContacts[index] = { ...newContacts[index], [field]: value }
    updateEmergencyPlan({ contacts: newContacts })
  }

  const removeContact = (index) => {
    const newContacts = (emergencyPlan.contacts || []).filter((_, i) => i !== index)
    updateEmergencyPlan({ contacts: newContacts })
  }

  const updateMedical = (field, value) => {
    updateEmergencyPlan({
      medicalFacility: { ...(emergencyPlan.medicalFacility || {}), [field]: value }
    })
  }

  const updateFirstAid = (field, value) => {
    updateEmergencyPlan({
      firstAid: { ...(emergencyPlan.firstAid || {}), [field]: value }
    })
  }

  const updateMusterPoint = (index, field, value) => {
    const newPoints = [...(emergencyPlan.musterPoints || [])]
    newPoints[index] = { ...newPoints[index], [field]: value }
    updateEmergencyPlan({ musterPoints: newPoints })
  }

  const removeMusterPoint = (index) => {
    const newPoints = (emergencyPlan.musterPoints || []).filter((_, i) => i !== index)
    updateEmergencyPlan({ musterPoints: newPoints })
  }

  const updateEvacRoute = (index, field, value) => {
    const newRoutes = [...(emergencyPlan.evacuationRoutes || [])]
    newRoutes[index] = { ...newRoutes[index], [field]: value }
    updateEmergencyPlan({ evacuationRoutes: newRoutes })
  }

  const removeEvacRoute = (index) => {
    const newRoutes = (emergencyPlan.evacuationRoutes || []).filter((_, i) => i !== index)
    updateEmergencyPlan({ evacuationRoutes: newRoutes })
  }

  const updateProcedure = (procedureId, field, value) => {
    updateEmergencyPlan({
      procedures: {
        ...(emergencyPlan.procedures || {}),
        [procedureId]: {
          ...(emergencyPlan.procedures?.[procedureId] || {}),
          [field]: value
        }
      }
    })
  }

  const updateProcedureStep = (procedureId, stepIndex, value) => {
    const procedure = emergencyPlan.procedures?.[procedureId] || {}
    const steps = [...(procedure.steps || [])]
    steps[stepIndex] = value
    updateProcedure(procedureId, 'steps', steps)
  }

  const addProcedureStep = (procedureId) => {
    const procedure = emergencyPlan.procedures?.[procedureId] || {}
    const steps = [...(procedure.steps || []), '']
    updateProcedure(procedureId, 'steps', steps)
  }

  const removeProcedureStep = (procedureId, stepIndex) => {
    const procedure = emergencyPlan.procedures?.[procedureId] || {}
    const steps = (procedure.steps || []).filter((_, i) => i !== stepIndex)
    updateProcedure(procedureId, 'steps', steps)
  }

  const musterPoints = emergencyPlan.musterPoints || []
  const evacuationRoutes = emergencyPlan.evacuationRoutes || []

  return (
    <div className="space-y-6">
      {/* Emergency Contacts */}
      <div className="card">
        <button
          onClick={() => toggleSection('contacts')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-aeria-blue" />
            Emergency Contacts
          </h2>
          {expandedSections.contacts ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.contacts && (
          <div className="mt-4 space-y-4">
            {(emergencyPlan.contacts || []).map((contact, index) => {
              const contactType = contactTypes.find(t => t.value === contact.type) || contactTypes[6]
              const ContactIcon = contactType.icon

              return (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg">
                      <ContactIcon className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 grid sm:grid-cols-4 gap-3">
                      <div>
                        <label className="label text-xs">Type</label>
                        <select
                          value={contact.type}
                          onChange={(e) => updateContact(index, 'type', e.target.value)}
                          className="input text-sm"
                        >
                          {contactTypes.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">Name / Organization</label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
                          className="input text-sm"
                          placeholder="Contact name"
                        />
                      </div>
                      <div>
                        <label className="label text-xs">Phone Number</label>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => updateContact(index, 'phone', e.target.value)}
                          className="input text-sm font-mono"
                          placeholder="(555) 555-5555"
                        />
                      </div>
                      <div>
                        <label className="label text-xs">Notes</label>
                        <input
                          type="text"
                          value={contact.notes}
                          onChange={(e) => updateContact(index, 'notes', e.target.value)}
                          className="input text-sm"
                          placeholder="Additional info"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeContact(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}

            <button
              onClick={addContact}
              className="flex items-center gap-2 text-aeria-blue hover:text-aeria-navy"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        )}
      </div>

      {/* Medical Response */}
      <div className="card">
        <button
          onClick={() => toggleSection('medical')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-aeria-blue" />
            Medical Response
          </h2>
          {expandedSections.medical ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.medical && (
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                Nearest Hospital / Medical Facility
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Facility Name</label>
                  <input
                    type="text"
                    value={emergencyPlan.medicalFacility?.name || ''}
                    onChange={(e) => updateMedical('name', e.target.value)}
                    className="input"
                    placeholder="Hospital name"
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={emergencyPlan.medicalFacility?.phone || ''}
                    onChange={(e) => updateMedical('phone', e.target.value)}
                    className="input font-mono"
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address</label>
                  <input
                    type="text"
                    value={emergencyPlan.medicalFacility?.address || ''}
                    onChange={(e) => updateMedical('address', e.target.value)}
                    className="input"
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-1">
                    <Navigation className="w-4 h-4" />
                    Distance
                  </label>
                  <input
                    type="text"
                    value={emergencyPlan.medicalFacility?.distance || ''}
                    onChange={(e) => updateMedical('distance', e.target.value)}
                    className="input"
                    placeholder="e.g., 25 km"
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Drive Time
                  </label>
                  <input
                    type="text"
                    value={emergencyPlan.medicalFacility?.driveTime || ''}
                    onChange={(e) => updateMedical('driveTime', e.target.value)}
                    className="input"
                    placeholder="e.g., 30 minutes"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Directions</label>
                  <textarea
                    value={emergencyPlan.medicalFacility?.directions || ''}
                    onChange={(e) => updateMedical('directions', e.target.value)}
                    className="input min-h-[60px]"
                    placeholder="Driving directions from site to hospital..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-gray-500" />
                First Aid Equipment
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Aid Kit Location</label>
                  <input
                    type="text"
                    value={emergencyPlan.firstAid?.kitLocation || ''}
                    onChange={(e) => updateFirstAid('kitLocation', e.target.value)}
                    className="input"
                    placeholder="e.g., In project vehicle, rear compartment"
                  />
                </div>
                <div>
                  <label className="label">Designated First Aid Attendant</label>
                  <input
                    type="text"
                    value={emergencyPlan.firstAid?.designatedAttendant || ''}
                    onChange={(e) => updateFirstAid('designatedAttendant', e.target.value)}
                    className="input"
                    placeholder="Name of qualified attendant"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emergencyPlan.firstAid?.aedAvailable || false}
                      onChange={(e) => updateFirstAid('aedAvailable', e.target.checked)}
                      className="w-4 h-4 text-aeria-navy rounded"
                    />
                    <span className="text-sm text-gray-700">AED Available On Site</span>
                  </label>
                </div>
                {emergencyPlan.firstAid?.aedAvailable && (
                  <div>
                    <label className="label">AED Location</label>
                    <input
                      type="text"
                      value={emergencyPlan.firstAid?.aedLocation || ''}
                      onChange={(e) => updateFirstAid('aedLocation', e.target.value)}
                      className="input"
                      placeholder="Where is the AED located?"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Muster Points & Evacuation - WITH MAP */}
      <div className="card">
        <button
          onClick={() => toggleSection('muster')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            Muster Points & Evacuation
          </h2>
          {expandedSections.muster ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.muster && (
          <div className="mt-4 space-y-6">
            {/* Map Button */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Map className="w-5 h-5 text-blue-600" />
                    Emergency Map
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {musterPoints.length} muster point{musterPoints.length !== 1 ? 's' : ''} • 
                    {evacuationRoutes.length} evacuation route{evacuationRoutes.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setMapEditorOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Open Map Editor
                </button>
              </div>
            </div>

            {/* Muster Points List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Muster Points
                </h3>
              </div>

              {musterPoints.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No muster points set</p>
                  <button
                    onClick={() => setMapEditorOpen(true)}
                    className="text-sm text-blue-600 hover:underline mt-2"
                  >
                    Open map to add muster points
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {musterPoints.map((point, index) => (
                    <div key={point.id || index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={point.name || ''}
                            onChange={(e) => updateMusterPoint(index, 'name', e.target.value)}
                            className="input text-sm font-medium"
                            placeholder="Point name (e.g., Primary Muster Point)"
                          />
                          <div className="grid sm:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 text-green-600" />
                              {point.coordinates?.lat ? (
                                <span>{point.coordinates.lat}, {point.coordinates.lng}</span>
                              ) : (
                                <span className="text-gray-400">No coordinates set</span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={point.description || ''}
                              onChange={(e) => updateMusterPoint(index, 'description', e.target.value)}
                              className="input text-sm"
                              placeholder="Description / landmarks"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeMusterPoint(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                          title="Delete muster point"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evacuation Routes List */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Route className="w-4 h-4 text-gray-500" />
                  Evacuation Routes
                </h3>
              </div>

              {evacuationRoutes.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
                  <Route className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No evacuation routes defined</p>
                  <button
                    onClick={() => setMapEditorOpen(true)}
                    className="text-sm text-blue-600 hover:underline mt-2"
                  >
                    Open map to draw routes
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {evacuationRoutes.map((route, index) => (
                    <div key={route.id || index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={route.name || ''}
                            onChange={(e) => updateEvacRoute(index, 'name', e.target.value)}
                            className="input text-sm font-medium"
                            placeholder="Route name (e.g., Primary Route)"
                          />
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Route className="w-4 h-4 text-red-600" />
                              {route.coordinates?.length || 0} points
                            </span>
                            <input
                              type="text"
                              value={route.description || ''}
                              onChange={(e) => updateEvacRoute(index, 'description', e.target.value)}
                              className="input text-sm flex-1"
                              placeholder="Description..."
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeEvacRoute(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                          title="Delete evacuation route"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Emergency Procedures */}
      <div className="card">
        <button
          onClick={() => toggleSection('procedures')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-aeria-blue" />
            Emergency Procedures
          </h2>
          {expandedSections.procedures ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.procedures && (
          <div className="mt-4 space-y-4">
            {procedureTypes.map((procType) => {
              const procedure = emergencyPlan.procedures?.[procType.id] || { enabled: true, steps: procType.defaultSteps }
              const ProcIcon = procType.icon

              return (
                <div key={procType.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ProcIcon className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{procType.label}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm text-gray-500">Include</span>
                      <input
                        type="checkbox"
                        checked={procedure.enabled !== false}
                        onChange={(e) => updateProcedure(procType.id, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-aeria-navy rounded"
                      />
                    </label>
                  </div>

                  {procedure.enabled !== false && (
                    <div className="p-3 space-y-2">
                      {(procedure.steps || []).map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-2">
                          <span className="text-sm text-gray-400 font-mono w-6 pt-2">{stepIndex + 1}.</span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => updateProcedureStep(procType.id, stepIndex, e.target.value)}
                            className="input flex-1 text-sm"
                          />
                          <button
                            onClick={() => removeProcedureStep(procType.id, stepIndex)}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addProcedureStep(procType.id)}
                        className="text-sm text-aeria-blue hover:text-aeria-navy flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-3 h-3" />
                        Add Step
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Site-Specific Hazards */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-aeria-blue" />
          Site-Specific Hazards
        </h2>
        <textarea
          value={emergencyPlan.siteSpecificHazards || ''}
          onChange={(e) => updateEmergencyPlan({ siteSpecificHazards: e.target.value })}
          className="input min-h-[100px]"
          placeholder="Document any site-specific hazards..."
        />
      </div>

      {/* Additional Notes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-aeria-blue" />
          Additional Emergency Notes
        </h2>
        <textarea
          value={emergencyPlan.additionalNotes || ''}
          onChange={(e) => updateEmergencyPlan({ additionalNotes: e.target.value })}
          className="input min-h-[100px]"
          placeholder="Any additional emergency planning notes..."
        />
      </div>

      {/* Map Editor Modal */}
      <EmergencyMapEditor
        project={project}
        emergencyPlan={emergencyPlan}
        onUpdateMusterPoints={(points) => updateEmergencyPlan({ musterPoints: points })}
        onUpdateEvacRoutes={(routes) => updateEmergencyPlan({ evacuationRoutes: routes })}
        isOpen={mapEditorOpen}
        onClose={() => setMapEditorOpen(false)}
      />
    </div>
  )
}
