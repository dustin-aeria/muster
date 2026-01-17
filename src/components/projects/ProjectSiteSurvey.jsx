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
  Target
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
// MAP PICKER MODAL COMPONENT
// Uses Leaflet (loaded via CDN) for free interactive maps
// ============================================
function MapPickerModal({ isOpen, onClose, initialLat, initialLng, onSelectLocation, title = 'Select Location' }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [selectedCoords, setSelectedCoords] = useState({ lat: initialLat || 49.6, lng: initialLng || -123.1 })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)

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

    // Load Leaflet JS
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

      const lat = initialLat || 49.6
      const lng = initialLng || -123.1
      const zoom = initialLat ? 14 : 5

      // Initialize map
      const map = L.map(mapContainerRef.current).setView([lat, lng], zoom)
      mapRef.current = map

      // Add OpenStreetMap tiles (free, no API key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      // Add marker
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
      markerRef.current = marker

      // Update coords when marker is dragged
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        setSelectedCoords({ lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) })
      })

      // Click on map to move marker
      map.on('click', (e) => {
        marker.setLatLng(e.latlng)
        setSelectedCoords({ lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) })
      })

      setIsLoading(false)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [isOpen, initialLat, initialLng])

  // Search for location using Nominatim (free geocoding)
  const handleSearch = async () => {
    if (!searchQuery.trim() || !window.L) return
    setSearching(true)
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const newLat = parseFloat(lat).toFixed(6)
        const newLng = parseFloat(lon).toFixed(6)
        
        setSelectedCoords({ lat: newLat, lng: newLng })
        
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([lat, lon], 14)
          markerRef.current.setLatLng([lat, lon])
        }
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

  const handleConfirm = () => {
    onSelectLocation(selectedCoords.lat, selectedCoords.lng)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-aeria-blue" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for a location (e.g., Squamish BC, or an address)"
              className="input flex-1"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="btn-secondary flex items-center gap-2"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation2 className="w-4 h-4" />}
              Search
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[400px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Loader2 className="w-8 h-8 text-aeria-blue animate-spin" />
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '400px' }} />
        </div>

        {/* Footer with coordinates */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Selected:</span>{' '}
            <span className="font-mono">{selectedCoords.lat}, {selectedCoords.lng}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleConfirm} className="btn-primary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Use This Location
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAP PREVIEW COMPONENT
// Shows embedded map preview of location
// ============================================
function MapPreview({ lat, lng, onOpenPicker }) {
  const hasCoords = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))
  
  if (!hasCoords) {
    return (
      <div 
        onClick={onOpenPicker}
        className="h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-aeria-blue hover:bg-gray-50 transition-colors"
      >
        <Map className="w-10 h-10 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Click to select location on map</p>
      </div>
    )
  }

  // Use OpenStreetMap embed (free, no API key)
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng)-0.01},${parseFloat(lat)-0.01},${parseFloat(lng)+0.01},${parseFloat(lat)+0.01}&layer=mapnik&marker=${lat},${lng}`

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      <iframe
        src={mapUrl}
        width="100%"
        height="200"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Location Map"
      />
      <button
        onClick={onOpenPicker}
        className="absolute top-2 right-2 px-3 py-1.5 bg-white rounded-lg shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1"
      >
        <Target className="w-4 h-4" />
        Edit
      </button>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectSiteSurvey({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
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
  const [mapPickerOpen, setMapPickerOpen] = useState(false)
  const [mapPickerTarget, setMapPickerTarget] = useState('main') // 'main', 'launch', 'recovery'

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

  // Handle map picker location selection
  const handleMapSelect = (lat, lng) => {
    if (mapPickerTarget === 'main') {
      updateSiteSurvey({
        location: {
          ...(siteSurvey.location || {}),
          coordinates: { lat, lng }
        }
      })
    } else if (mapPickerTarget === 'launch') {
      updateLaunchRecovery('launchPoint', 'lat', lat)
      updateLaunchRecovery('launchPoint', 'lng', lng)
    } else if (mapPickerTarget === 'recovery') {
      updateLaunchRecovery('recoveryPoint', 'lat', lat)
      updateLaunchRecovery('recoveryPoint', 'lng', lng)
    }
  }

  // Open map picker for different targets
  const openMapPicker = (target) => {
    setMapPickerTarget(target)
    setMapPickerOpen(true)
  }

  // Get initial coords for map picker based on target
  const getMapPickerInitialCoords = () => {
    if (mapPickerTarget === 'launch') {
      return {
        lat: siteSurvey.launchRecovery?.launchPoint?.lat || siteSurvey.location?.coordinates?.lat,
        lng: siteSurvey.launchRecovery?.launchPoint?.lng || siteSurvey.location?.coordinates?.lng
      }
    } else if (mapPickerTarget === 'recovery') {
      return {
        lat: siteSurvey.launchRecovery?.recoveryPoint?.lat || siteSurvey.location?.coordinates?.lat,
        lng: siteSurvey.launchRecovery?.recoveryPoint?.lng || siteSurvey.location?.coordinates?.lng
      }
    }
    return {
      lat: siteSurvey.location?.coordinates?.lat,
      lng: siteSurvey.location?.coordinates?.lng
    }
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
              lat={siteSurvey.location?.coordinates?.lat}
              lng={siteSurvey.location?.coordinates?.lng}
              onOpenPicker={() => openMapPicker('main')}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Site Name</label>
                <input
                  type="text"
                  value={siteSurvey.location?.name || ''}
                  onChange={(e) => updateLocation('name', e.target.value)}
                  className="input"
                  placeholder="e.g., Quintette Mine North Pit"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Address / Location Description</label>
                <input
                  type="text"
                  value={siteSurvey.location?.address || ''}
                  onChange={(e) => updateLocation('address', e.target.value)}
                  className="input"
                  placeholder="e.g., 15km NW of Tumbler Ridge, BC"
                />
              </div>

              <div>
                <label className="label">Latitude (decimal degrees)</label>
                <input
                  type="text"
                  value={siteSurvey.location?.coordinates?.lat || ''}
                  onChange={(e) => updateCoordinates('lat', e.target.value)}
                  className="input font-mono"
                  placeholder="e.g., 55.1234"
                />
              </div>

              <div>
                <label className="label">Longitude (decimal degrees)</label>
                <input
                  type="text"
                  value={siteSurvey.location?.coordinates?.lng || ''}
                  onChange={(e) => updateCoordinates('lng', e.target.value)}
                  className="input font-mono"
                  placeholder="e.g., -121.5678"
                />
              </div>

              <div>
                <label className="label">Elevation (m ASL)</label>
                <input
                  type="text"
                  value={siteSurvey.location?.elevation || ''}
                  onChange={(e) => updateLocation('elevation', e.target.value)}
                  className="input"
                  placeholder="e.g., 1250"
                />
              </div>
            </div>

            {/* Location Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
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
              
              <button
                onClick={() => openMapPicker('main')}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <Map className="w-4 h-4" />
                Pick on Map
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
                    View in Maps
                  </button>

                  <button
                    onClick={openDirections}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </button>
                </>
              )}
            </div>

            <div>
              <label className="label">Site Description</label>
              <textarea
                value={siteSurvey.location?.description || ''}
                onChange={(e) => updateLocation('description', e.target.value)}
                className="input min-h-[80px]"
                placeholder="General description of the site, landmarks, notable features..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Launch/Recovery Points */}
      <div className="card">
        <button
          onClick={() => toggleSection('launchRecovery')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-aeria-blue" />
            Launch & Recovery Points
          </h2>
          {expandedSections.launchRecovery ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.launchRecovery && (
          <div className="mt-4 space-y-6">
            {/* Launch Point */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                Launch Point
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="label text-xs">Latitude</label>
                  <input
                    type="text"
                    value={siteSurvey.launchRecovery?.launchPoint?.lat || ''}
                    onChange={(e) => updateLaunchRecovery('launchPoint', 'lat', e.target.value)}
                    className="input text-sm font-mono"
                    placeholder="Lat"
                  />
                </div>
                <div>
                  <label className="label text-xs">Longitude</label>
                  <input
                    type="text"
                    value={siteSurvey.launchRecovery?.launchPoint?.lng || ''}
                    onChange={(e) => updateLaunchRecovery('launchPoint', 'lng', e.target.value)}
                    className="input text-sm font-mono"
                    placeholder="Lng"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => openMapPicker('launch')}
                    className="btn-secondary text-sm w-full flex items-center justify-center gap-1"
                  >
                    <Map className="w-4 h-4" />
                    Pick on Map
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <label className="label text-xs">Description</label>
                <input
                  type="text"
                  value={siteSurvey.launchRecovery?.launchPoint?.description || ''}
                  onChange={(e) => updateLaunchRecovery('launchPoint', 'description', e.target.value)}
                  className="input text-sm"
                  placeholder="e.g., Flat gravel pad near equipment shed"
                />
              </div>
            </div>

            {/* Recovery Point */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                Recovery Point
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="label text-xs">Latitude</label>
                  <input
                    type="text"
                    value={siteSurvey.launchRecovery?.recoveryPoint?.lat || ''}
                    onChange={(e) => updateLaunchRecovery('recoveryPoint', 'lat', e.target.value)}
                    className="input text-sm font-mono"
                    placeholder="Lat"
                  />
                </div>
                <div>
                  <label className="label text-xs">Longitude</label>
                  <input
                    type="text"
                    value={siteSurvey.launchRecovery?.recoveryPoint?.lng || ''}
                    onChange={(e) => updateLaunchRecovery('recoveryPoint', 'lng', e.target.value)}
                    className="input text-sm font-mono"
                    placeholder="Lng"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => openMapPicker('recovery')}
                    className="btn-secondary text-sm w-full flex items-center justify-center gap-1"
                  >
                    <Map className="w-4 h-4" />
                    Pick on Map
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <label className="label text-xs">Description</label>
                <input
                  type="text"
                  value={siteSurvey.launchRecovery?.recoveryPoint?.description || ''}
                  onChange={(e) => updateLaunchRecovery('recoveryPoint', 'description', e.target.value)}
                  className="input text-sm"
                  placeholder="e.g., Same as launch, or alternate location"
                />
              </div>
            </div>

            {/* Copy from main location buttons */}
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => {
                  const { lat, lng } = siteSurvey.location?.coordinates || {}
                  if (lat && lng) {
                    updateLaunchRecovery('launchPoint', 'lat', lat)
                    updateLaunchRecovery('launchPoint', 'lng', lng)
                  }
                }}
                className="text-aeria-blue hover:underline"
              >
                Copy site location to launch point
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => {
                  const { lat, lng } = siteSurvey.location?.coordinates || {}
                  if (lat && lng) {
                    updateLaunchRecovery('recoveryPoint', 'lat', lat)
                    updateLaunchRecovery('recoveryPoint', 'lng', lng)
                  }
                }}
                className="text-aeria-blue hover:underline"
              >
                Copy site location to recovery point
              </button>
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

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        initialLat={parseFloat(getMapPickerInitialCoords().lat) || null}
        initialLng={parseFloat(getMapPickerInitialCoords().lng) || null}
        onSelectLocation={handleMapSelect}
        title={
          mapPickerTarget === 'launch' ? 'Select Launch Point' :
          mapPickerTarget === 'recovery' ? 'Select Recovery Point' :
          'Select Site Location'
        }
      />
    </div>
  )
}
