import { useState, useEffect } from 'react'
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
  CheckCircle2
} from 'lucide-react'

// Import population categories from SORA config for consistency
import { populationCategories } from '../../lib/soraConfig'

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

export default function ProjectSiteSurvey({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    population: true,  // NEW: Population section expanded by default
    airspace: true,
    obstacles: true,
    access: true,
    ground: false,
    notes: false
  })
  const [copiedCoords, setCopiedCoords] = useState(false)

  // Initialize site survey if not present
  useEffect(() => {
    if (!project.siteSurvey) {
      onUpdate({
        siteSurvey: {
          location: {
            name: '',
            address: '',
            coordinates: { lat: '', lng: '' },
            elevation: '',
            description: ''
          },
          // NEW: Population density for SORA integration
          population: {
            category: 'sparsely',  // Default to sparsely populated
            justification: '',
            source: 'visual',  // visual | statscan | map | other
            adjacentCategory: 'sparsely',  // For containment calculations
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
    }
    // Migration: Add population field if missing from existing surveys
    else if (!project.siteSurvey.population) {
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
    }
  }, [project.siteSurvey])

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

  // NEW: Update population data
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
                  type="number"
                  value={siteSurvey.location?.elevation || ''}
                  onChange={(e) => updateLocation('elevation', e.target.value)}
                  className="input"
                  placeholder="Meters above sea level"
                />
              </div>

              <div className="flex items-end gap-2">
                {siteSurvey.location?.coordinates?.lat && siteSurvey.location?.coordinates?.lng && (
                  <>
                    <button
                      onClick={copyCoordinates}
                      className="btn-secondary text-sm inline-flex items-center gap-1"
                    >
                      {copiedCoords ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedCoords ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={openInMaps}
                      className="btn-secondary text-sm inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Maps
                    </button>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="label">Site Description</label>
              <textarea
                value={siteSurvey.location?.description || ''}
                onChange={(e) => updateLocation('description', e.target.value)}
                className="input min-h-[80px]"
                placeholder="Describe the operational area, terrain, notable features..."
              />
            </div>
          </div>
        )}
      </div>

      {/* NEW: Population Density Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('population')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            Population Density
            <span className="text-xs font-normal text-gray-500 bg-blue-100 px-2 py-0.5 rounded">Used by SORA</span>
          </h2>
          {expandedSections.population ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.population && (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Population density determines the Ground Risk Class (GRC) in SORA assessment. 
                Select the category that best represents the operational area during flight operations.
              </p>
            </div>

            {/* Operational Area Population */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Operational Area (iGRC Footprint)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Population Density Category</label>
                  <select
                    value={siteSurvey.population?.category || 'sparsely'}
                    onChange={(e) => updatePopulation('category', e.target.value)}
                    className="input"
                  >
                    {populationCategories.map(pop => (
                      <option key={pop.value} value={pop.value}>
                        {pop.label} ({pop.density})
                      </option>
                    ))}
                  </select>
                  {siteSurvey.population?.category && (
                    <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                      <p className="text-xs text-gray-600">
                        <strong>Description:</strong> {populationCategories.find(p => p.value === siteSurvey.population?.category)?.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Examples:</strong> {populationCategories.find(p => p.value === siteSurvey.population?.category)?.examples}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Data Source</label>
                  <select
                    value={siteSurvey.population?.source || 'visual'}
                    onChange={(e) => updatePopulation('source', e.target.value)}
                    className="input"
                  >
                    <option value="visual">Visual Assessment (Site Survey)</option>
                    <option value="statscan">Statistics Canada Data</option>
                    <option value="map">Population Density Map</option>
                    <option value="client">Client Provided</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="label">Justification</label>
                  <textarea
                    value={siteSurvey.population?.justification || ''}
                    onChange={(e) => updatePopulation('justification', e.target.value)}
                    className="input min-h-[60px]"
                    placeholder="Explain how you determined this population category (e.g., 'Industrial site with controlled access, no public present during operations')"
                  />
                </div>
              </div>
            </div>

            {/* Adjacent Area Population */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Adjacent Area (Containment Buffer)</h3>
              <p className="text-sm text-gray-600 mb-3">
                The adjacent area extends beyond the operational boundary (typically 3 minutes of flight at max speed). 
                This affects containment requirements in SORA Step 8.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Adjacent Area Population Category</label>
                  <select
                    value={siteSurvey.population?.adjacentCategory || 'sparsely'}
                    onChange={(e) => updatePopulation('adjacentCategory', e.target.value)}
                    className="input"
                  >
                    {populationCategories.map(pop => (
                      <option key={pop.value} value={pop.value}>
                        {pop.label} ({pop.density})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Adjacent Area Notes</label>
                  <textarea
                    value={siteSurvey.population?.adjacentJustification || ''}
                    onChange={(e) => updatePopulation('adjacentJustification', e.target.value)}
                    className="input min-h-[60px]"
                    placeholder="Describe what surrounds the operational area (e.g., 'Forest to north and west, rural residential to south, highway 2km east')"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Launch & Recovery Points */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Navigation className="w-5 h-5 text-aeria-blue" />
          Launch & Recovery Points
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Launch Point */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-800 mb-3">Launch Point</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs">Latitude</label>
                  <input
                    type="text"
                    value={siteSurvey.launchRecovery?.launchPoint?.lat || ''}
                    onChange={(e) => updateLaunchRecovery('launchPoint', 'lat', e.target.value)}
                    className="input text-sm font-mono"
                    placeholder="55.1234"
                  />
                </div>
                <div>
                  <label className="label text-xs">Longitude</label>
                  <input
                    type="text"
                    value={siteSurvey.launchRecovery?.launchPoint?.lng || ''}
                    onChange={(e) => updateLaunchRecovery('launchPoint', 'lng', e.target.value)}
                    className="input text-sm font-mono"
                    placeholder="-121.5678"
                  />
                </div>
              </div>
              <div>
                <label className="label text-xs">Description</label>
                <input
                  type="text"
                  value={siteSurvey.launchRecovery?.launchPoint?.description || ''}
                  onChange={(e) => updateLaunchRecovery('launchPoint', 'description', e.target.value)}
                  className="input text-sm"
                  placeholder="e.g., Flat gravel pad near parking area"
                />
              </div>
            </div>
          </div>

          {/* Recovery Point */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-3">Recovery Point</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs">Latitude</label>
                  <input
                    type="text"
                    value={siteSurvey.launchRecovery?.recoveryPoint?.lat || ''}
                    onChange={(e) => updateLaunchRecovery('recoveryPoint', 'lat', e.target.value)}
                    className="input text-sm font-mono"
                    placeholder="55.1234"
                  />
                </div>
                <div>
                  <label className="label text-xs">Longitude</label>
                  <input
                    type="text"
                    value={siteSurvey.launchRecovery?.recoveryPoint?.lng || ''}
                    onChange={(e) => updateLaunchRecovery('recoveryPoint', 'lng', e.target.value)}
                    className="input text-sm font-mono"
                    placeholder="-121.5678"
                  />
                </div>
              </div>
              <div>
                <label className="label text-xs">Description</label>
                <input
                  type="text"
                  value={siteSurvey.launchRecovery?.recoveryPoint?.description || ''}
                  onChange={(e) => updateLaunchRecovery('recoveryPoint', 'description', e.target.value)}
                  className="input text-sm"
                  placeholder="e.g., Same as launch point"
                />
              </div>
            </div>
          </div>
        </div>
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
                  <option value="A">Class A</option>
                  <option value="B">Class B</option>
                  <option value="C">Class C</option>
                  <option value="D">Class D</option>
                  <option value="E">Class E</option>
                  <option value="F">Class F (Restricted/Advisory)</option>
                  <option value="G">Class G (Uncontrolled)</option>
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

              {siteSurvey.airspace?.navCanadaAuth && (
                <div className="sm:col-span-2">
                  <label className="label">Authorization Number</label>
                  <input
                    type="text"
                    value={siteSurvey.airspace?.authNumber || ''}
                    onChange={(e) => updateAirspace('authNumber', e.target.value)}
                    className="input"
                    placeholder="e.g., RPAS-2026-001234"
                  />
                </div>
              )}
            </div>

            {/* Nearby Aerodromes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Nearby Aerodromes (within 10km)</label>
                <button
                  onClick={addAerodrome}
                  className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {(siteSurvey.airspace?.nearbyAerodromes || []).length === 0 ? (
                <p className="text-sm text-gray-500 italic">No nearby aerodromes identified.</p>
              ) : (
                <div className="space-y-2">
                  {(siteSurvey.airspace?.nearbyAerodromes || []).map((aerodrome, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
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
                        className="input text-sm w-24 font-mono"
                        placeholder="ICAO"
                      />
                      <input
                        type="text"
                        value={aerodrome.distance}
                        onChange={(e) => updateAerodrome(index, 'distance', e.target.value)}
                        className="input text-sm w-20"
                        placeholder="km"
                      />
                      <input
                        type="text"
                        value={aerodrome.bearing}
                        onChange={(e) => updateAerodrome(index, 'bearing', e.target.value)}
                        className="input text-sm w-20"
                        placeholder="°"
                      />
                      <button
                        onClick={() => removeAerodrome(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label">NOTAMs / TFRs</label>
              <textarea
                value={siteSurvey.airspace?.notams || ''}
                onChange={(e) => updateAirspace('notams', e.target.value)}
                className="input min-h-[60px]"
                placeholder="Note any relevant NOTAMs or temporary flight restrictions..."
              />
            </div>

            <div>
              <label className="label">Additional Restrictions</label>
              <textarea
                value={siteSurvey.airspace?.restrictions || ''}
                onChange={(e) => updateAirspace('restrictions', e.target.value)}
                className="input min-h-[60px]"
                placeholder="Any other airspace restrictions or considerations..."
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
          </h2>
          {expandedSections.obstacles ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.obstacles && (
          <div className="mt-4 space-y-3">
            {(siteSurvey.obstacles || []).length === 0 ? (
              <p className="text-sm text-gray-500 italic">No obstacles documented.</p>
            ) : (
              (siteSurvey.obstacles || []).map((obstacle, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <select
                      value={obstacle.type}
                      onChange={(e) => updateObstacle(index, 'type', e.target.value)}
                      className="input text-sm w-40"
                    >
                      {obstacleTypes.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeObstacle(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-4 gap-2 mb-2">
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
              ))
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
    </div>
  )
}
