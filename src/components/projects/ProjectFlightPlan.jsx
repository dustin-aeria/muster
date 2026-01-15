import { useState, useEffect } from 'react'
import { getAircraft } from '../../lib/firestore'
import { 
  Plane, 
  Plus,
  Trash2,
  AlertTriangle,
  Cloud,
  Wind,
  Eye,
  Gauge,
  MapPin,
  Radio,
  Shield,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'

const operationTypes = [
  { value: 'VLOS', label: 'VLOS', description: 'Visual Line of Sight' },
  { value: 'EVLOS', label: 'EVLOS', description: 'Extended Visual Line of Sight' },
  { value: 'BVLOS', label: 'BVLOS', description: 'Beyond Visual Line of Sight' }
]

const areaTypes = [
  { value: 'controlled', label: 'Controlled Airspace', description: 'Class A, B, C, D, E' },
  { value: 'uncontrolled', label: 'Uncontrolled Airspace', description: 'Class G' },
  { value: 'restricted', label: 'Restricted/Prohibited', description: 'Special authorization required' }
]

const groundTypes = [
  { value: 'sparsely_populated', label: 'Sparsely Populated', description: 'Few or no people, rural areas' },
  { value: 'populated', label: 'Populated', description: 'Residential, commercial areas' },
  { value: 'gathering', label: 'Gathering of People', description: 'Events, crowds, assemblies' },
  { value: 'controlled_ground', label: 'Controlled Ground Area', description: 'Access restricted, no bystanders' }
]

const defaultWeatherMinimums = {
  minVisibility: 3, // statute miles
  minCeiling: 500, // feet AGL
  maxWind: 10, // m/s
  maxGust: 15, // m/s
  precipitation: false,
  notes: ''
}

const defaultContingencies = [
  { trigger: 'Loss of C2 Link', action: 'Return to Home (RTH) automatically engages. If no RTH within 30 seconds, land in place.', priority: 'high' },
  { trigger: 'Low Battery Warning', action: 'Immediately return to launch point. Land with minimum 20% remaining.', priority: 'high' },
  { trigger: 'GPS Loss', action: 'Switch to ATTI mode, maintain visual contact, manual return and land.', priority: 'high' },
  { trigger: 'Fly-Away', action: 'Attempt to regain control. If unsuccessful, contact FIC Edmonton (1-866-541-4102) immediately.', priority: 'critical' },
  { trigger: 'Deteriorating Weather', action: 'Land immediately if conditions fall below minimums. Do not attempt to "push through."', priority: 'medium' },
  { trigger: 'Aircraft in Vicinity', action: 'Descend and hold position or land. Give way to all manned aircraft.', priority: 'high' }
]

export default function ProjectFlightPlan({ project, onUpdate }) {
  const [aircraftList, setAircraftList] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    aircraft: true,
    parameters: true,
    weather: true,
    contingencies: false
  })

  useEffect(() => {
    loadAircraft()
  }, [])

  // Initialize flight plan if not present
  useEffect(() => {
    if (!project.flightPlan) {
      onUpdate({
        flightPlan: {
          aircraft: [],
          operationType: 'VLOS',
          maxAltitudeAGL: 120,
          flightAreaType: 'uncontrolled',
          groundType: 'sparsely_populated',
          overPeople: false,
          nearAerodrome: false,
          aerodromeDistance: null,
          weatherMinimums: { ...defaultWeatherMinimums },
          contingencies: [...defaultContingencies],
          additionalProcedures: ''
        }
      })
    }
  }, [project.flightPlan])

  const loadAircraft = async () => {
    try {
      const data = await getAircraft()
      setAircraftList(data.filter(ac => ac.status === 'airworthy'))
    } catch (err) {
      console.error('Error loading aircraft:', err)
    } finally {
      setLoading(false)
    }
  }

  const flightPlan = project.flightPlan || {}

  const updateFlightPlan = (updates) => {
    onUpdate({
      flightPlan: {
        ...flightPlan,
        ...updates
      }
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Aircraft selection
  const addAircraft = (aircraftId) => {
    if (!aircraftId) return
    const ac = aircraftList.find(a => a.id === aircraftId)
    if (!ac) return
    if (flightPlan.aircraft?.some(a => a.id === aircraftId)) return

    updateFlightPlan({
      aircraft: [...(flightPlan.aircraft || []), {
        id: ac.id,
        nickname: ac.nickname,
        make: ac.make,
        model: ac.model,
        mtow: ac.mtow,
        maxSpeed: ac.maxSpeed,
        isPrimary: (flightPlan.aircraft || []).length === 0
      }]
    })
  }

  const removeAircraft = (aircraftId) => {
    const newAircraft = (flightPlan.aircraft || []).filter(a => a.id !== aircraftId)
    // If we removed the primary, make the first one primary
    if (newAircraft.length > 0 && !newAircraft.some(a => a.isPrimary)) {
      newAircraft[0].isPrimary = true
    }
    updateFlightPlan({ aircraft: newAircraft })
  }

  const setPrimaryAircraft = (aircraftId) => {
    const newAircraft = (flightPlan.aircraft || []).map(a => ({
      ...a,
      isPrimary: a.id === aircraftId
    }))
    updateFlightPlan({ aircraft: newAircraft })
  }

  // Weather minimums
  const updateWeather = (field, value) => {
    updateFlightPlan({
      weatherMinimums: {
        ...(flightPlan.weatherMinimums || defaultWeatherMinimums),
        [field]: value
      }
    })
  }

  // Contingencies
  const updateContingency = (index, field, value) => {
    const newContingencies = [...(flightPlan.contingencies || defaultContingencies)]
    newContingencies[index] = { ...newContingencies[index], [field]: value }
    updateFlightPlan({ contingencies: newContingencies })
  }

  const addContingency = () => {
    updateFlightPlan({
      contingencies: [...(flightPlan.contingencies || []), {
        trigger: '',
        action: '',
        priority: 'medium'
      }]
    })
  }

  const removeContingency = (index) => {
    const newContingencies = (flightPlan.contingencies || []).filter((_, i) => i !== index)
    updateFlightPlan({ contingencies: newContingencies })
  }

  const availableAircraft = aircraftList.filter(ac => 
    !flightPlan.aircraft?.some(a => a.id === ac.id)
  )

  return (
    <div className="space-y-6">
      {/* Aircraft Selection */}
      <div className="card">
        <button
          onClick={() => toggleSection('aircraft')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-aeria-blue" />
            Aircraft
          </h2>
          {expandedSections.aircraft ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.aircraft && (
          <div className="mt-4 space-y-4">
            {/* Selected aircraft */}
            {flightPlan.aircraft?.length > 0 ? (
              <div className="space-y-2">
                {flightPlan.aircraft.map((ac) => (
                  <div 
                    key={ac.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <Plane className="w-5 h-5 text-aeria-navy" />
                      <div>
                        <span className="font-medium text-gray-900">{ac.nickname}</span>
                        <span className="text-gray-500 ml-2">{ac.make} {ac.model}</span>
                        {ac.isPrimary && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-aeria-navy text-white rounded">Primary</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!ac.isPrimary && flightPlan.aircraft.length > 1 && (
                        <button
                          onClick={() => setPrimaryAircraft(ac.id)}
                          className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 hover:bg-gray-200 rounded"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        onClick={() => removeAircraft(ac.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Plane className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No aircraft selected</p>
              </div>
            )}

            {/* Add aircraft */}
            {availableAircraft.length > 0 && (
              <div className="flex gap-2">
                <select
                  className="input flex-1"
                  defaultValue=""
                  onChange={(e) => {
                    addAircraft(e.target.value)
                    e.target.value = ''
                  }}
                >
                  <option value="">Add aircraft...</option>
                  {availableAircraft.map(ac => (
                    <option key={ac.id} value={ac.id}>
                      {ac.nickname} - {ac.make} {ac.model}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {availableAircraft.length === 0 && aircraftList.length === 0 && !loading && (
              <p className="text-sm text-gray-500">
                <a href="/aircraft" className="text-aeria-blue hover:underline">Add aircraft</a> to your fleet first.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Flight Parameters */}
      <div className="card">
        <button
          onClick={() => toggleSection('parameters')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-aeria-blue" />
            Flight Parameters
          </h2>
          {expandedSections.parameters ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.parameters && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Operation Type */}
              <div>
                <label className="label">Operation Type</label>
                <select
                  value={flightPlan.operationType || 'VLOS'}
                  onChange={(e) => updateFlightPlan({ operationType: e.target.value })}
                  className="input"
                >
                  {operationTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} - {opt.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Altitude */}
              <div>
                <label className="label">Max Altitude AGL (m)</label>
                <input
                  type="number"
                  value={flightPlan.maxAltitudeAGL || 120}
                  onChange={(e) => updateFlightPlan({ maxAltitudeAGL: parseFloat(e.target.value) || 0 })}
                  className="input"
                  min="0"
                  max="400"
                />
                <p className="text-xs text-gray-500 mt-1">Canadian limit: 122m (400ft) AGL without SFOC</p>
              </div>

              {/* Airspace Type */}
              <div>
                <label className="label">Airspace Classification</label>
                <select
                  value={flightPlan.flightAreaType || 'uncontrolled'}
                  onChange={(e) => updateFlightPlan({ flightAreaType: e.target.value })}
                  className="input"
                >
                  {areaTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ground Type */}
              <div>
                <label className="label">Ground Area Type</label>
                <select
                  value={flightPlan.groundType || 'sparsely_populated'}
                  onChange={(e) => updateFlightPlan({ groundType: e.target.value })}
                  className="input"
                >
                  {groundTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flightPlan.overPeople || false}
                  onChange={(e) => updateFlightPlan({ overPeople: e.target.checked })}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <span className="text-sm text-gray-700">Operations over people (uninvolved persons)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flightPlan.nearAerodrome || false}
                  onChange={(e) => updateFlightPlan({ nearAerodrome: e.target.checked })}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <span className="text-sm text-gray-700">Within 5.6km of an aerodrome</span>
              </label>

              {flightPlan.nearAerodrome && (
                <div className="ml-7">
                  <label className="label text-xs">Distance to nearest aerodrome (km)</label>
                  <input
                    type="number"
                    value={flightPlan.aerodromeDistance || ''}
                    onChange={(e) => updateFlightPlan({ aerodromeDistance: parseFloat(e.target.value) || null })}
                    className="input w-32"
                    step="0.1"
                    min="0"
                    max="5.6"
                  />
                </div>
              )}
            </div>

            {/* Warnings */}
            {flightPlan.flightAreaType === 'controlled' && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Controlled Airspace</p>
                  <p className="text-sm text-amber-700">NAV CANADA authorization required. Ensure RPAS Flight Authorization is obtained.</p>
                </div>
              </div>
            )}

            {flightPlan.overPeople && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Operations Over People</p>
                  <p className="text-sm text-red-700">Additional mitigations required. Consider ground risk buffer, parachute systems, or controlled ground area.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Weather Minimums */}
      <div className="card">
        <button
          onClick={() => toggleSection('weather')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-aeria-blue" />
            Weather Minimums
          </h2>
          {expandedSections.weather ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.weather && (
          <div className="mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  Min Visibility (SM)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.minVisibility ?? 3}
                  onChange={(e) => updateWeather('minVisibility', parseFloat(e.target.value))}
                  className="input"
                  step="0.5"
                  min="0"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1">
                  <Cloud className="w-4 h-4" />
                  Min Ceiling (ft AGL)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.minCeiling ?? 500}
                  onChange={(e) => updateWeather('minCeiling', parseFloat(e.target.value))}
                  className="input"
                  step="100"
                  min="0"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1">
                  <Wind className="w-4 h-4" />
                  Max Sustained Wind (m/s)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.maxWind ?? 10}
                  onChange={(e) => updateWeather('maxWind', parseFloat(e.target.value))}
                  className="input"
                  step="1"
                  min="0"
                />
              </div>
              <div>
                <label className="label flex items-center gap-1">
                  <Wind className="w-4 h-4" />
                  Max Gusts (m/s)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.maxGust ?? 15}
                  onChange={(e) => updateWeather('maxGust', parseFloat(e.target.value))}
                  className="input"
                  step="1"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!(flightPlan.weatherMinimums?.precipitation ?? false)}
                  onChange={(e) => updateWeather('precipitation', !e.target.checked)}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <span className="text-sm text-gray-700">No precipitation (rain, snow, fog)</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="label">Additional Weather Notes</label>
              <textarea
                value={flightPlan.weatherMinimums?.notes || ''}
                onChange={(e) => updateWeather('notes', e.target.value)}
                className="input min-h-[60px]"
                placeholder="Any site-specific weather considerations..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Contingencies */}
      <div className="card">
        <button
          onClick={() => toggleSection('contingencies')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-aeria-blue" />
            Contingency Procedures
          </h2>
          {expandedSections.contingencies ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.contingencies && (
          <div className="mt-4 space-y-3">
            {(flightPlan.contingencies || defaultContingencies).map((contingency, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <input
                    type="text"
                    value={contingency.trigger}
                    onChange={(e) => updateContingency(index, 'trigger', e.target.value)}
                    className="input text-sm font-medium flex-1"
                    placeholder="Trigger condition..."
                  />
                  <select
                    value={contingency.priority}
                    onChange={(e) => updateContingency(index, 'priority', e.target.value)}
                    className="input text-sm w-28"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button
                    onClick={() => removeContingency(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={contingency.action}
                  onChange={(e) => updateContingency(index, 'action', e.target.value)}
                  className="input text-sm min-h-[60px]"
                  placeholder="Response action..."
                />
              </div>
            ))}

            <button
              onClick={addContingency}
              className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Contingency
            </button>

            <div className="pt-4">
              <label className="label">Additional Procedures</label>
              <textarea
                value={flightPlan.additionalProcedures || ''}
                onChange={(e) => updateFlightPlan({ additionalProcedures: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Any additional flight procedures or site-specific considerations..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
