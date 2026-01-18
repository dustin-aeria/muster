import { useState, useEffect, useRef } from 'react'
import { 
  MapPin, Plus, Trash2, AlertTriangle, Navigation, Mountain, TreePine, Building, Radio, Car, Users,
  Camera, ChevronDown, ChevronUp, ExternalLink, Copy, CheckCircle2, Crosshair, Map, X, Loader2,
  Navigation2, Target, Search, Info, Clipboard, FileCheck, AlertCircle, Eye, Plane, Layers
} from 'lucide-react'

// ============================================
// POPULATION CATEGORIES (SORA-aligned)
// ============================================
const populationCategories = {
  controlled: { label: 'Controlled Ground Area', description: 'No uninvolved people present', density: 0 },
  remote: { label: 'Remote/Sparsely Populated', description: 'Very low density, < 5 people/km²', density: 5 },
  lightly: { label: 'Lightly Populated', description: 'Rural areas, 5-50 people/km²', density: 50 },
  sparsely: { label: 'Sparsely Populated', description: 'Scattered houses, 50-500 people/km²', density: 500 },
  suburban: { label: 'Suburban/Populated', description: 'Residential areas, 500-5000 people/km²', density: 5000 },
  highdensity: { label: 'High Density Urban', description: 'Urban centers, > 5000 people/km²', density: 10000 },
  assembly: { label: 'Gatherings/Assembly', description: 'Crowds, events, high concentration', density: 50000 }
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
    musterPoints: [{ name: 'Primary Muster', location: '', coordinates: null }],
    evacuationRoutes: [{ name: 'Primary Route', description: '' }]
  }
})

// ============================================
// SITE MAP EDITOR COMPONENT (simplified)
// ============================================
function SiteMapEditor({ site, onUpdate, isOpen, onClose }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  const siteLocation = site?.siteSurvey?.location?.coordinates
  const boundary = site?.siteSurvey?.boundary || []

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return
    
    // Load Leaflet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

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
      mapRef.current = window.L.map(mapContainerRef.current).setView(defaultCenter, 14)
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current)

      // Add site marker if exists
      if (siteLocation) {
        window.L.marker([siteLocation.lat, siteLocation.lng], {
          icon: window.L.divIcon({
            className: 'custom-marker',
            html: '<div style="background:#1e40af;color:white;padding:4px 8px;border-radius:4px;font-size:12px;">📍 Site</div>'
          })
        }).addTo(mapRef.current)
      }

      // Add boundary polygon if exists
      if (boundary.length > 0) {
        window.L.polygon(boundary.map(p => [p.lat, p.lng]), {
          color: '#3b82f6',
          fillOpacity: 0.2
        }).addTo(mapRef.current)
      }

      // Click handler to set site location
      mapRef.current.on('click', (e) => {
        const newCoords = { lat: e.latlng.lat, lng: e.latlng.lng }
        onUpdate({
          ...site,
          siteSurvey: {
            ...site.siteSurvey,
            location: {
              ...site.siteSurvey.location,
              coordinates: newCoords
            }
          }
        })
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
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Edit Site Location - {site?.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 flex-1 min-h-[500px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-aeria-blue" />
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full rounded-lg" style={{ minHeight: '400px' }} />
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">Click on map to set site location</p>
          <button onClick={onClose} className="btn-primary">Done</button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT: Multi-Site Survey
// ============================================
export default function ProjectSiteSurvey({ project, onUpdate }) {
  // Initialize sites array if not present
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
    } else {
      // Create default site
      setSites([createEmptySite(0)])
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
    if (sites.length <= 1) return // Keep at least one site
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

  const handleMapUpdate = (updatedSite) => {
    const newSites = [...sites]
    newSites[activeSiteIndex] = updatedSite
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={activeSite?.name || ''}
                onChange={(e) => updateSiteName(activeSiteIndex, e.target.value)}
                className="input font-medium"
                placeholder="Site name"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeSite?.includeFlightPlan || false}
                  onChange={() => toggleFlightPlan(activeSiteIndex)}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <span className="text-sm flex items-center gap-1">
                  <Plane className="w-4 h-4 text-gray-500" />
                  Include Flight Plan
                </span>
              </label>
              {sites.length > 1 && (
                <button
                  onClick={() => removeSite(activeSiteIndex)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  title="Remove site"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {activeSite?.includeFlightPlan && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              This site will have a Flight Plan and SORA assessment
            </p>
          )}
        </div>
      </div>

      {/* Site Location */}
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

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Latitude</label>
                <input
                  type="text"
                  value={siteSurvey.location?.coordinates?.lat || ''}
                  onChange={(e) => updateLocation('coordinates', {
                    ...siteSurvey.location?.coordinates,
                    lat: parseFloat(e.target.value) || ''
                  })}
                  className="input"
                  placeholder="49.2827"
                />
              </div>
              <div>
                <label className="label">Longitude</label>
                <input
                  type="text"
                  value={siteSurvey.location?.coordinates?.lng || ''}
                  onChange={(e) => updateLocation('coordinates', {
                    ...siteSurvey.location?.coordinates,
                    lng: parseFloat(e.target.value) || ''
                  })}
                  className="input"
                  placeholder="-123.1207"
                />
              </div>
            </div>

            <button
              onClick={() => setMapEditorOpen(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Map className="w-4 h-4" />
              Open Map Editor
            </button>

            {siteSurvey.location?.coordinates && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  Site location set: {siteSurvey.location.coordinates.lat?.toFixed(6)}, {siteSurvey.location.coordinates.lng?.toFixed(6)}
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
          <div className="mt-4 space-y-4">
            <div className="grid gap-2">
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

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSurvey.airspace?.nearAerodrome || false}
                  onChange={(e) => updateAirspace('nearAerodrome', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Near Aerodrome (within 5.6km)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSurvey.airspace?.nearHeliport || false}
                  onChange={(e) => updateAirspace('nearHeliport', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Near Heliport (within 1.8km)</span>
              </label>
            </div>

            {siteSurvey.airspace?.nearAerodrome && (
              <div>
                <label className="label">Distance to Aerodrome (km)</label>
                <input
                  type="number"
                  value={siteSurvey.airspace?.aerodromeDistance || ''}
                  onChange={(e) => updateAirspace('aerodromeDistance', parseFloat(e.target.value))}
                  className="input"
                  placeholder="e.g., 3.5"
                  step="0.1"
                />
              </div>
            )}
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
                      placeholder="Height (m)"
                    />
                    <input
                      type="text"
                      value={obs.distance}
                      onChange={(e) => updateObstacle(i, 'distance', e.target.value)}
                      className="input text-sm"
                      placeholder="Distance (m)"
                    />
                  </div>
                  <button onClick={() => removeObstacle(i)} className="p-1 text-red-500 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addObstacle} className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 flex items-center justify-center gap-2">
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
              <label className="label">Directions</label>
              <textarea
                value={siteSurvey.access?.directions || ''}
                onChange={(e) => updateAccess('directions', e.target.value)}
                className="input min-h-[80px]"
                placeholder="Turn-by-turn directions..."
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
              <label className="label">Ground Hazards</label>
              <textarea
                value={siteSurvey.groundConditions?.hazards || ''}
                onChange={(e) => updateGroundConditions('hazards', e.target.value)}
                className="input min-h-[60px]"
                placeholder="Uneven terrain, holes, debris..."
              />
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
                placeholder="Any additional observations..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Map Editor Modal */}
      <SiteMapEditor
        site={activeSite}
        isOpen={mapEditorOpen}
        onClose={() => setMapEditorOpen(false)}
        onUpdate={handleMapUpdate}
      />
    </div>
  )
}
