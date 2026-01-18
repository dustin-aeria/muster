import { useState, useEffect, useRef } from 'react'
import { 
  ShieldAlert, Plus, Trash2, Phone, MapPin, Users, Route, Stethoscope, Flame, Plane,
  AlertTriangle, ChevronDown, ChevronUp, Building, Clock, Navigation, Map, X, Loader2,
  Layers, CheckCircle2
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
  { type: 'company', name: 'Aeria Solutions', phone: '', notes: 'Company emergency contact' }
]

const procedureTypes = [
  { id: 'medical', label: 'Medical Emergency', icon: Stethoscope, 
    defaultSteps: ['Cease all flight operations', 'Ensure scene safety', 'Call 911 if serious', 'Administer first aid within training', 'Designate someone to meet responders', 'Document incident'] },
  { id: 'fire', label: 'Fire Emergency', icon: Flame,
    defaultSteps: ['Alert all personnel - evacuate to muster', 'Call 911', 'Only extinguish small fires if trained', 'Do not re-enter until cleared', 'Account for all personnel'] },
  { id: 'aircraft_incident', label: 'Aircraft Incident', icon: Plane,
    defaultSteps: ['Note last known position/time', 'Do not approach if fire/smoke', 'Secure area', 'Do not disturb wreckage', 'Document scene', 'Report to FIC if fly-away'] },
  { id: 'weather', label: 'Severe Weather', icon: AlertTriangle,
    defaultSteps: ['Monitor weather continuously', 'Land immediately if conditions deteriorate', 'Seek shelter', 'Wait 30 min after thunder', 'Do not resume until conditions improve'] }
]

// ============================================
// EMERGENCY MAP EDITOR (Muster + Routes)
// ============================================
function EmergencyMapEditor({ site, onUpdate, isOpen, onClose }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeMode, setActiveMode] = useState('muster') // 'muster' or 'route'
  const [routePoints, setRoutePoints] = useState([])
  
  const siteLocation = site?.siteSurvey?.location?.coordinates
  const boundary = site?.siteSurvey?.boundary || []
  const musterPoints = site?.emergency?.musterPoints || []
  const evacuationRoutes = site?.emergency?.evacuationRoutes || []
  const launchPoint = site?.flightPlan?.launchPoint
  const recoveryPoint = site?.flightPlan?.recoveryPoint

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return
    
    const loadMap = async () => {
      if (!window.L) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => initMap()
        document.head.appendChild(script)
      } else {
        initMap()
      }
    }

    const initMap = () => {
      if (mapRef.current) mapRef.current.remove()
      
      const defaultCenter = siteLocation ? [siteLocation.lat, siteLocation.lng] : [49.2827, -123.1207]
      mapRef.current = window.L.map(mapContainerRef.current).setView(defaultCenter, 15)
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current)

      // Add site location
      if (siteLocation) {
        window.L.marker([siteLocation.lat, siteLocation.lng], {
          icon: window.L.divIcon({
            className: 'custom-marker',
            html: '<div style="background:#1e40af;color:white;padding:3px 6px;border-radius:4px;font-size:10px;">📍 Site</div>'
          })
        }).addTo(mapRef.current)
      }

      // Add boundary
      if (boundary.length > 0) {
        window.L.polygon(boundary.map(p => [p.lat, p.lng]), {
          color: '#3b82f6',
          fillOpacity: 0.1
        }).addTo(mapRef.current)
      }

      // Add launch/recovery points (reference only)
      if (launchPoint) {
        window.L.marker([launchPoint.lat, launchPoint.lng], {
          icon: window.L.divIcon({
            className: 'custom-marker',
            html: '<div style="background:#059669;color:white;padding:3px 6px;border-radius:4px;font-size:10px;opacity:0.7">🚀</div>'
          })
        }).addTo(mapRef.current)
      }

      if (recoveryPoint) {
        window.L.marker([recoveryPoint.lat, recoveryPoint.lng], {
          icon: window.L.divIcon({
            className: 'custom-marker',
            html: '<div style="background:#dc2626;color:white;padding:3px 6px;border-radius:4px;font-size:10px;opacity:0.7">🎯</div>'
          })
        }).addTo(mapRef.current)
      }

      // Add existing muster points
      musterPoints.forEach((mp, i) => {
        if (mp.coordinates) {
          window.L.marker([mp.coordinates.lat, mp.coordinates.lng], {
            icon: window.L.divIcon({
              className: 'custom-marker',
              html: `<div style="background:#f59e0b;color:white;padding:3px 6px;border-radius:4px;font-size:10px;">🚨 ${mp.name || 'Muster'}</div>`
            })
          }).addTo(mapRef.current)
        }
      })

      // Add existing evacuation routes
      evacuationRoutes.forEach((er, i) => {
        if (er.coordinates && er.coordinates.length > 1) {
          window.L.polyline(er.coordinates.map(c => [c.lat, c.lng]), {
            color: '#ef4444',
            weight: 4,
            dashArray: '10, 10'
          }).addTo(mapRef.current)
        }
      })

      // Click handler
      mapRef.current.on('click', (e) => {
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng }
        
        if (activeMode === 'muster') {
          // Add new muster point
          const newMuster = {
            name: `Muster Point ${musterPoints.length + 1}`,
            location: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`,
            coordinates: coords,
            description: ''
          }
          onUpdate({
            ...site,
            emergency: {
              ...site.emergency,
              musterPoints: [...musterPoints, newMuster]
            }
          })
        } else {
          // Add point to route being drawn
          setRoutePoints(prev => [...prev, coords])
        }
      })

      setIsLoading(false)
      setTimeout(() => mapRef.current?.invalidateSize(), 100)
    }

    loadMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isOpen, activeMode])

  const saveRoute = () => {
    if (routePoints.length < 2) return
    
    const newRoute = {
      name: `Evacuation Route ${evacuationRoutes.length + 1}`,
      description: '',
      coordinates: routePoints
    }
    
    onUpdate({
      ...site,
      emergency: {
        ...site.emergency,
        evacuationRoutes: [...evacuationRoutes, newRoute]
      }
    })
    
    setRoutePoints([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Emergency Map - {site?.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-4 bg-gray-50 border-b flex gap-2">
          <button
            onClick={() => { setActiveMode('muster'); setRoutePoints([]) }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeMode === 'muster' ? 'bg-amber-500 text-white' : 'bg-white border'
            }`}
          >
            🚨 Add Muster Point
          </button>
          <button
            onClick={() => setActiveMode('route')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              activeMode === 'route' ? 'bg-red-500 text-white' : 'bg-white border'
            }`}
          >
            <Route className="w-4 h-4" />
            Draw Evacuation Route
          </button>
          {activeMode === 'route' && routePoints.length >= 2 && (
            <button onClick={saveRoute} className="px-4 py-2 rounded-lg bg-green-500 text-white">
              Save Route ({routePoints.length} points)
            </button>
          )}
        </div>
        
        <div className="p-4 flex-1 min-h-[400px] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-aeria-blue" />
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full rounded-lg" style={{ minHeight: '350px' }} />
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {activeMode === 'muster' ? 'Click map to add muster point' : `Click to draw route (${routePoints.length} points)`}
          </div>
          <button onClick={onClose} className="btn-primary">Done</button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT: Multi-Site Emergency Plan
// ============================================
export default function ProjectEmergency({ project, onUpdate }) {
  const [sites, setSites] = useState([])
  const [activeSiteIndex, setActiveSiteIndex] = useState(0)
  const [mapEditorOpen, setMapEditorOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    contacts: true,
    medical: true,
    muster: true,
    procedures: false
  })

  // Initialize from project
  useEffect(() => {
    if (project.sites && Array.isArray(project.sites)) {
      setSites(project.sites)
    }
  }, [project.sites])

  // Also initialize project-level emergency plan for shared contacts
  useEffect(() => {
    if (!project.emergencyPlan) {
      const defaultProcedures = {}
      procedureTypes.forEach(p => {
        defaultProcedures[p.id] = { enabled: true, steps: [...p.defaultSteps] }
      })

      onUpdate({
        emergencyPlan: {
          contacts: [...defaultContacts],
          medicalFacility: { name: '', address: '', phone: '', distance: '', driveTime: '' },
          firstAid: { kitLocation: 'In project vehicle', aedAvailable: false },
          procedures: defaultProcedures
        }
      })
    }
  }, [project.emergencyPlan])

  const emergencyPlan = project.emergencyPlan || {}
  const activeSite = sites[activeSiteIndex]

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const saveSites = (newSites) => {
    setSites(newSites)
    onUpdate({ sites: newSites })
  }

  const updateEmergencyPlan = (updates) => {
    onUpdate({ emergencyPlan: { ...emergencyPlan, ...updates } })
  }

  // Contacts (shared across all sites)
  const addContact = () => {
    updateEmergencyPlan({
      contacts: [...(emergencyPlan.contacts || []), { type: 'other', name: '', phone: '', notes: '' }]
    })
  }

  const updateContact = (index, field, value) => {
    const newContacts = [...(emergencyPlan.contacts || [])]
    newContacts[index] = { ...newContacts[index], [field]: value }
    updateEmergencyPlan({ contacts: newContacts })
  }

  const removeContact = (index) => {
    updateEmergencyPlan({
      contacts: (emergencyPlan.contacts || []).filter((_, i) => i !== index)
    })
  }

  // Medical facility
  const updateMedical = (field, value) => {
    updateEmergencyPlan({
      medicalFacility: { ...(emergencyPlan.medicalFacility || {}), [field]: value }
    })
  }

  // First aid
  const updateFirstAid = (field, value) => {
    updateEmergencyPlan({
      firstAid: { ...(emergencyPlan.firstAid || {}), [field]: value }
    })
  }

  // Site-specific muster points
  const updateSiteMuster = (index, field, value) => {
    const newSites = [...sites]
    const musterPoints = [...(newSites[activeSiteIndex].emergency?.musterPoints || [])]
    musterPoints[index] = { ...musterPoints[index], [field]: value }
    newSites[activeSiteIndex] = {
      ...newSites[activeSiteIndex],
      emergency: { ...newSites[activeSiteIndex].emergency, musterPoints }
    }
    saveSites(newSites)
  }

  const removeSiteMuster = (index) => {
    const newSites = [...sites]
    const musterPoints = (newSites[activeSiteIndex].emergency?.musterPoints || []).filter((_, i) => i !== index)
    newSites[activeSiteIndex] = {
      ...newSites[activeSiteIndex],
      emergency: { ...newSites[activeSiteIndex].emergency, musterPoints }
    }
    saveSites(newSites)
  }

  // Site-specific evacuation routes
  const updateSiteRoute = (index, field, value) => {
    const newSites = [...sites]
    const routes = [...(newSites[activeSiteIndex].emergency?.evacuationRoutes || [])]
    routes[index] = { ...routes[index], [field]: value }
    newSites[activeSiteIndex] = {
      ...newSites[activeSiteIndex],
      emergency: { ...newSites[activeSiteIndex].emergency, evacuationRoutes: routes }
    }
    saveSites(newSites)
  }

  const removeSiteRoute = (index) => {
    const newSites = [...sites]
    const routes = (newSites[activeSiteIndex].emergency?.evacuationRoutes || []).filter((_, i) => i !== index)
    newSites[activeSiteIndex] = {
      ...newSites[activeSiteIndex],
      emergency: { ...newSites[activeSiteIndex].emergency, evacuationRoutes: routes }
    }
    saveSites(newSites)
  }

  const handleMapUpdate = (updatedSite) => {
    const siteIndex = sites.findIndex(s => s.id === updatedSite.id)
    if (siteIndex === -1) return
    const newSites = [...sites]
    newSites[siteIndex] = updatedSite
    saveSites(newSites)
  }

  return (
    <div className="space-y-6">
      {/* Site Selector (for site-specific emergency info) */}
      {sites.length > 1 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5 text-aeria-blue" />
            <h2 className="text-lg font-semibold">Select Site for Muster Points & Routes</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {sites.map((site, index) => (
              <button
                key={site.id}
                onClick={() => setActiveSiteIndex(index)}
                className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 transition-all ${
                  activeSiteIndex === index
                    ? 'border-aeria-blue bg-blue-50 text-aeria-navy'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MapPin className="w-4 h-4" />
                {site.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contacts (shared) */}
      <div className="card">
        <button
          onClick={() => toggleSection('contacts')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-aeria-blue" />
            Emergency Contacts
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">All Sites</span>
          </h2>
          {expandedSections.contacts ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.contacts && (
          <div className="mt-4 space-y-3">
            {(emergencyPlan.contacts || []).map((contact, index) => {
              const TypeIcon = contactTypes.find(t => t.value === contact.type)?.icon || Phone
              return (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <TypeIcon className="w-5 h-5 text-gray-400 mt-2" />
                    <div className="flex-1 grid sm:grid-cols-4 gap-2">
                      <select
                        value={contact.type}
                        onChange={(e) => updateContact(index, 'type', e.target.value)}
                        className="input text-sm"
                      >
                        {contactTypes.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                        className="input text-sm"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                        className="input text-sm"
                        placeholder="Phone"
                      />
                      <input
                        type="text"
                        value={contact.notes}
                        onChange={(e) => updateContact(index, 'notes', e.target.value)}
                        className="input text-sm"
                        placeholder="Notes"
                      />
                    </div>
                    <button onClick={() => removeContact(index)} className="p-1 text-red-500 hover:bg-red-100 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
            <button onClick={addContact} className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        )}
      </div>

      {/* Nearest Medical Facility */}
      <div className="card">
        <button
          onClick={() => toggleSection('medical')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-aeria-blue" />
            Medical Facility & First Aid
          </h2>
          {expandedSections.medical ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.medical && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Hospital / Medical Facility</label>
                <input
                  type="text"
                  value={emergencyPlan.medicalFacility?.name || ''}
                  onChange={(e) => updateMedical('name', e.target.value)}
                  className="input"
                  placeholder="Name of nearest hospital"
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="text"
                  value={emergencyPlan.medicalFacility?.phone || ''}
                  onChange={(e) => updateMedical('phone', e.target.value)}
                  className="input"
                  placeholder="Hospital phone number"
                />
              </div>
            </div>
            <div>
              <label className="label">Address</label>
              <input
                type="text"
                value={emergencyPlan.medicalFacility?.address || ''}
                onChange={(e) => updateMedical('address', e.target.value)}
                className="input"
                placeholder="Full address"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Distance</label>
                <input
                  type="text"
                  value={emergencyPlan.medicalFacility?.distance || ''}
                  onChange={(e) => updateMedical('distance', e.target.value)}
                  className="input"
                  placeholder="e.g., 15 km"
                />
              </div>
              <div>
                <label className="label">Drive Time</label>
                <input
                  type="text"
                  value={emergencyPlan.medicalFacility?.driveTime || ''}
                  onChange={(e) => updateMedical('driveTime', e.target.value)}
                  className="input"
                  placeholder="e.g., 20 minutes"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-3">First Aid</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Aid Kit Location</label>
                  <input
                    type="text"
                    value={emergencyPlan.firstAid?.kitLocation || ''}
                    onChange={(e) => updateFirstAid('kitLocation', e.target.value)}
                    className="input"
                    placeholder="e.g., In project vehicle"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emergencyPlan.firstAid?.aedAvailable || false}
                      onChange={(e) => updateFirstAid('aedAvailable', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">AED Available</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Site-Specific Muster & Evacuation */}
      {activeSite && (
        <div className="card">
          <button
            onClick={() => toggleSection('muster')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-aeria-blue" />
              Muster Points & Evacuation
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{activeSite.name}</span>
            </h2>
            {expandedSections.muster ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.muster && (
            <div className="mt-4 space-y-4">
              {/* Map Button */}
              <button
                onClick={() => setMapEditorOpen(true)}
                className="w-full p-4 border-2 border-dashed border-amber-300 bg-amber-50 rounded-lg hover:border-amber-400 flex items-center justify-center gap-2 text-amber-700"
              >
                <Map className="w-5 h-5" />
                Open Emergency Map to Set Points & Routes
              </button>

              {/* Muster Points */}
              <div>
                <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                  🚨 Muster Points
                  <span className="text-xs text-gray-500">({(activeSite.emergency?.musterPoints || []).length})</span>
                </h3>
                <div className="space-y-2">
                  {(activeSite.emergency?.musterPoints || []).map((point, index) => (
                    <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 grid sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={point.name}
                            onChange={(e) => updateSiteMuster(index, 'name', e.target.value)}
                            className="input text-sm"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={point.location}
                            onChange={(e) => updateSiteMuster(index, 'location', e.target.value)}
                            className="input text-sm"
                            placeholder="Coordinates"
                          />
                          <input
                            type="text"
                            value={point.description}
                            onChange={(e) => updateSiteMuster(index, 'description', e.target.value)}
                            className="input text-sm"
                            placeholder="Description"
                          />
                        </div>
                        <button onClick={() => removeSiteMuster(index)} className="p-1 text-red-500 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {point.coordinates && (
                        <p className="text-xs text-amber-600 mt-1">
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          Map coordinates set
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Evacuation Routes */}
              <div className="pt-4 border-t">
                <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                  <Route className="w-4 h-4" />
                  Evacuation Routes
                  <span className="text-xs text-gray-500">({(activeSite.emergency?.evacuationRoutes || []).length})</span>
                </h3>
                <div className="space-y-2">
                  {(activeSite.emergency?.evacuationRoutes || []).map((route, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={route.name}
                            onChange={(e) => updateSiteRoute(index, 'name', e.target.value)}
                            className="input text-sm"
                            placeholder="Route name"
                          />
                          <textarea
                            value={route.description}
                            onChange={(e) => updateSiteRoute(index, 'description', e.target.value)}
                            className="input text-sm min-h-[60px]"
                            placeholder="Route description..."
                          />
                        </div>
                        <button onClick={() => removeSiteRoute(index)} className="p-1 text-red-500 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {route.coordinates && route.coordinates.length > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          Route mapped ({route.coordinates.length} points)
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Emergency Procedures (shared) */}
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
                  <div className="flex items-center justify-between p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <ProcIcon className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">{procType.label}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      {(procedure.steps || []).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Map Editor Modal */}
      {activeSite && (
        <EmergencyMapEditor
          site={activeSite}
          isOpen={mapEditorOpen}
          onClose={() => setMapEditorOpen(false)}
          onUpdate={handleMapUpdate}
        />
      )}
    </div>
  )
}
