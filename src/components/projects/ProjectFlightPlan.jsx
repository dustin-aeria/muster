import { useState, useEffect, useMemo, useRef } from 'react'
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
  ChevronDown,
  ChevronUp,
  Award,
  FileCheck,
  CheckCircle2,
  Zap,
  MapPin,
  Users,
  Radio,
  ExternalLink,
  RefreshCw,
  Navigation,
  Target,
  Map,
  X,
  Loader2,
  Search,
  Info,
  Link2
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
  { trigger: 'Deteriorating Weather', action: 'Land immediately if conditions fall below minimums. Do not attempt to "push through."', priority: 'medium' },
  { trigger: 'Aircraft in Vicinity', action: 'Descend and hold position or land. Give way to all manned aircraft.', priority: 'high' }
]

// ============================================
// CARs PART 9 CATEGORY DETECTION
// Divisions: IV (Basic), V (Advanced), VI (Complex Level 1), Subpart 3 (SFOC)
// ============================================
const detectCARsCategory = (flightPlan, siteSurvey) => {
  const {
    operationType = 'VLOS',
    maxAltitudeAGL = 120,
    overPeople = false,
    nearAerodrome = false,
    aerodromeDistance = null,
    nightOperations = false,
    distanceFromPeople = 30,
    distanceFromPopulated = 1000
  } = flightPlan

  // Get airspace from site survey
  const airspaceClass = siteSurvey?.airspace?.classification || 'G'
  const isControlled = ['A', 'B', 'C', 'D', 'E'].includes(airspaceClass.toUpperCase())
  const isUncontrolled = !isControlled

  // Get population from site survey
  const populationCategory = siteSurvey?.population?.category || 'sparsely'
  const isGathering = populationCategory === 'assembly'

  // Get primary aircraft specs
  const primaryAircraft = flightPlan.aircraft?.find(a => a.isPrimary) || flightPlan.aircraft?.[0]
  const mtowKg = primaryAircraft?.mtow || 0
  
  // RPAS Weight Categories per CARs Part 9
  const isMicro = mtowKg > 0 && mtowKg < 0.25
  const isSmall = mtowKg >= 0.25 && mtowKg <= 25
  const isMedium = mtowKg > 25 && mtowKg <= 150
  const isLarge = mtowKg > 150

  const reasons = []
  let category = 'basic'

  // =====================================================
  // SFOC REQUIRED (Subpart 3 - 903.02)
  // =====================================================
  
  if (isLarge) {
    category = 'sfoc'
    reasons.push('RPAS over 150kg requires SFOC (CARs 903.02)')
  }
  
  if (isGathering) {
    category = 'sfoc'
    reasons.push('Operations at advertised events require SFOC (CARs 901.41)')
  }
  
  if (operationType === 'BVLOS' && isControlled) {
    category = 'sfoc'
    reasons.push('BVLOS in controlled airspace requires SFOC')
  }
  
  if (operationType === 'BVLOS' && nearAerodrome) {
    const distKm = aerodromeDistance || 0
    if (distKm < 9.26) {
      category = 'sfoc'
      reasons.push('BVLOS within 5nm of aerodrome requires SFOC (CARs 901.47)')
    }
  }
  
  if (maxAltitudeAGL > 122 && isControlled) {
    category = 'sfoc'
    reasons.push('Above 400ft in controlled airspace requires SFOC (CARs 903.02)')
  }

  if (isMedium && operationType === 'BVLOS' && distanceFromPopulated < 1000) {
    category = 'sfoc'
    reasons.push('Medium RPAS BVLOS <1km from populated area requires SFOC')
  }

  // =====================================================
  // COMPLEX LEVEL 1 (Division VI - 901.87)
  // =====================================================
  if (category !== 'sfoc' && operationType === 'BVLOS') {
    if (isUncontrolled) {
      if ((isSmall || isMedium) && distanceFromPopulated >= 1000) {
        category = 'complex1'
        reasons.push('BVLOS in uncontrolled airspace ≥1km from populated - Complex Level 1 (CARs 901.87a)')
      }
      else if (isSmall && populationCategory === 'sparsely') {
        category = 'complex1'
        reasons.push('Small RPAS BVLOS over sparsely populated - Complex Level 1 (CARs 901.87b)')
      }
      else if ((isSmall || isMedium) && ['remote', 'controlled'].includes(populationCategory)) {
        category = 'complex1'
        reasons.push('BVLOS in remote/controlled ground area - Complex Level 1 (CARs 901.87)')
      }
    }
  }

  // =====================================================
  // ADVANCED OPERATIONS (Division V - 901.62)
  // =====================================================
  if (category !== 'sfoc' && category !== 'complex1') {
    const isNearAirport = nearAerodrome && (!aerodromeDistance || aerodromeDistance < 5.56)
    const isNearHeliport = nearAerodrome && aerodromeDistance && aerodromeDistance < 1.85
    
    if (operationType === 'EVLOS' && isUncontrolled) {
      category = 'advanced'
      reasons.push('EVLOS requires Advanced certificate (CARs 901.62b)')
    }
    
    if (isSmall && operationType === 'VLOS' && isControlled) {
      category = 'advanced'
      reasons.push('VLOS in controlled airspace requires Advanced (CARs 901.62a-i)')
    }
    
    if (isSmall && distanceFromPeople < 30 && distanceFromPeople >= 5) {
      category = 'advanced'
      reasons.push('Operations <30m from people require Advanced (CARs 901.62a-ii)')
    }
    
    if (isSmall && (overPeople || distanceFromPeople < 5)) {
      category = 'advanced'
      reasons.push('Operations <5m from people require Advanced (CARs 901.62a-iii)')
    }
    
    if (isNearAirport || isNearHeliport) {
      category = 'advanced'
      reasons.push('Within 3nm of airport/1nm of heliport requires Advanced (CARs 901.62a-iv)')
    }
    
    if (isMedium && operationType === 'VLOS') {
      category = 'advanced'
      reasons.push('Medium RPAS (25-150kg) requires Advanced minimum (CARs 901.62d-g)')
    }
    
    if (nightOperations && operationType === 'VLOS') {
      if (category !== 'advanced') {
        category = 'advanced'
        reasons.push('Night operations may require Advanced certification')
      }
    }
  }

  // =====================================================
  // BASIC OPERATIONS (Division IV - 901.53)
  // =====================================================
  if (category === 'basic') {
    if (isMicro && mtowKg > 0) {
      reasons.push('Micro RPAS (<250g) - some regulatory exemptions apply')
    } else if (isSmall) {
      reasons.push('Small RPAS VLOS in uncontrolled airspace (CARs 901.53)')
    }
    reasons.push('Operations meet Basic requirements: VLOS, uncontrolled airspace, ≥30m from people')
  }

  if (maxAltitudeAGL > 122 && category !== 'sfoc') {
    reasons.push('⚠️ Above 400ft (122m) - verify airspace authorization')
  }

  // Format MTOW display
  let mtowDisplay = 'Not set'
  let weightClass = ''
  if (mtowKg > 0) {
    if (mtowKg < 1) {
      mtowDisplay = `${(mtowKg * 1000).toFixed(0)}g`
    } else {
      mtowDisplay = `${mtowKg} kg`
    }
    if (isMicro) weightClass = 'Micro RPAS'
    else if (isSmall) weightClass = 'Small RPAS'
    else if (isMedium) weightClass = 'Medium RPAS'
    else if (isLarge) weightClass = 'Large RPAS'
  }

  return { 
    category, 
    reasons, 
    isMicro, 
    isSmall, 
    isMedium, 
    isLarge,
    mtowKg,
    mtowDisplay,
    weightClass
  }
}

const licenseCategories = {
  basic: {
    label: 'Basic Operations',
    subtitle: 'Division IV (CARs 901.53-901.61)',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: CheckCircle2,
    ageReq: '14+',
    requirements: [
      'Pilot Certificate - Small RPAS (VLOS) Basic Operations',
      'Registered RPAS (250g - 25kg)',
      'VLOS only in uncontrolled airspace',
      'Below 400ft (122m) AGL',
      '≥30m (100ft) from uninvolved persons'
    ]
  },
  advanced: {
    label: 'Advanced Operations',
    subtitle: 'Division V (CARs 901.62-901.86)',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Award,
    ageReq: '16+',
    requirements: [
      'Pilot Certificate - Advanced Operations',
      'Flight Review required',
      'VLOS in controlled airspace (with NAV CANADA auth)',
      'EVLOS in uncontrolled airspace',
      'Can fly <30m from people (declared aircraft)',
      'Within 3nm airport / 1nm heliport',
      'Medium RPAS (25-150kg) VLOS operations'
    ]
  },
  complex1: {
    label: 'Complex Level 1 (BVLOS)',
    subtitle: 'Division VI (CARs 901.87-901.96)',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: Zap,
    ageReq: '18+',
    requirements: [
      'Pilot Certificate - Level 1 Complex Operations',
      'RPAS Operator Certificate required',
      'BVLOS in uncontrolled airspace only',
      'Small/Medium RPAS ≥1km from populated areas',
      'Small RPAS over sparsely populated areas',
      '20 hours ground school + flight review',
      '≥5nm from aerodromes'
    ]
  },
  sfoc: {
    label: 'SFOC Required',
    subtitle: 'Subpart 3 (CARs 903.01-903.03)',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: FileCheck,
    ageReq: 'Varies',
    requirements: [
      'Special Flight Operations Certificate',
      'Application to Transport Canada',
      'Operational Risk Assessment (SORA)',
      'RPAS >150kg, BVLOS in controlled airspace',
      'Advertised events, above 400ft controlled',
      'Within 5nm aerodrome (BVLOS)',
      'Processing: weeks to months'
    ]
  }
}

// Population category labels for display
const populationLabels = {
  controlled: 'Controlled Ground Area',
  remote: 'Remote (< 5 ppl/km²)',
  lightly: 'Lightly Populated (< 50 ppl/km²)',
  sparsely: 'Sparsely Populated (< 500 ppl/km²)',
  suburban: 'Suburban (< 5,000 ppl/km²)',
  highdensity: 'High Density (> 5,000 ppl/km²)',
  assembly: 'Assembly of People'
}

// Airspace labels for display
const airspaceLabels = {
  'G': 'Class G - Uncontrolled',
  'E': 'Class E - Controlled (above 700ft)',
  'D': 'Class D - Control Zone',
  'C': 'Class C - Terminal Control',
  'B': 'Class B - Terminal (high density)',
  'F': 'Class F - Special Use',
  'A': 'Class A - Controlled'
}

// ============================================
// LAUNCH/RECOVERY MAP EDITOR
// Moved from Site Survey - for drone-specific planning
// ============================================
function LaunchRecoveryMapEditor({ 
  siteLocation,
  launchPoint, 
  recoveryPoint, 
  boundary,        // From Site Survey - work area boundary
  obstacles,       // From Site Survey - obstacles
  onUpdate,
  isOpen, 
  onClose 
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const boundaryLayerRef = useRef(null)
  const obstacleMarkersRef = useRef([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [activeMarker, setActiveMarker] = useState('launch')
  
  const activeMarkerRef = useRef(activeMarker)
  useEffect(() => { activeMarkerRef.current = activeMarker }, [activeMarker])
  
  const [coords, setCoords] = useState({
    launch: { lat: launchPoint?.lat || '', lng: launchPoint?.lng || '' },
    recovery: { lat: recoveryPoint?.lat || '', lng: recoveryPoint?.lng || '' }
  })

  useEffect(() => {
    if (isOpen) {
      setCoords({
        launch: { lat: launchPoint?.lat || '', lng: launchPoint?.lng || '' },
        recovery: { lat: recoveryPoint?.lat || '', lng: recoveryPoint?.lng || '' }
      })
    }
  }, [isOpen, launchPoint, recoveryPoint])

  const markerColors = {
    launch: { color: '#16a34a', label: 'Launch Point', icon: '🛫' },
    recovery: { color: '#d97706', label: 'Recovery Point', icon: '🛬' }
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

      // Default to site location if available, else Canada
      const defaultLat = siteLocation?.lat || coords.launch.lat || 54.0
      const defaultLng = siteLocation?.lng || coords.launch.lng || -125.0
      const hasLocation = siteLocation?.lat || coords.launch.lat
      const defaultZoom = hasLocation ? 14 : 5

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

      // Site location marker (reference only, not draggable)
      if (siteLocation?.lat && siteLocation?.lng) {
        const siteIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background: #1e40af;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          "><span style="font-size: 10px;">📍</span></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
        L.marker([parseFloat(siteLocation.lat), parseFloat(siteLocation.lng)], { 
          icon: siteIcon,
          opacity: 0.7
        }).addTo(map).bindTooltip('Site Location (from Site Survey)')
      }

      // Work area boundary from Site Survey (read-only display)
      if (boundary?.length >= 3) {
        const boundaryPolygon = L.polygon(
          boundary.map(p => [p.lat, p.lng]),
          {
            color: '#9333ea',
            fillColor: '#9333ea',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '5, 5'
          }
        ).addTo(map)
        boundaryPolygon.bindTooltip('Work Area Boundary (from Site Survey)')
        boundaryLayerRef.current = boundaryPolygon
        
        // Add vertex markers
        boundary.forEach((point) => {
          L.circleMarker([point.lat, point.lng], {
            radius: 4,
            color: '#9333ea',
            fillColor: '#9333ea',
            fillOpacity: 0.5,
            weight: 1
          }).addTo(map)
        })
      }

      // Obstacles from Site Survey (read-only display)
      if (obstacles?.length > 0) {
        obstacles.forEach(obs => {
          if (obs.location?.lat && obs.location?.lng) {
            const obsIcon = L.divIcon({
              className: 'custom-marker',
              html: `<div style="
                background: #dc2626;
                width: 20px;
                height: 20px;
                border-radius: 4px;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              "><span style="font-size: 10px;">⚠️</span></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
            const marker = L.marker([parseFloat(obs.location.lat), parseFloat(obs.location.lng)], {
              icon: obsIcon,
              opacity: 0.8
            }).addTo(map)
            marker.bindTooltip(`${obs.type || 'Obstacle'}: ${obs.description || 'N/A'} (${obs.height || '?'}m)`)
            obstacleMarkersRef.current.push(marker)
          }
        })
      }

      // Add existing markers
      Object.entries(markerColors).forEach(([key, config]) => {
        if (coords[key].lat && coords[key].lng) {
          const marker = L.marker(
            [parseFloat(coords[key].lat), parseFloat(coords[key].lng)],
            { 
              icon: createMarkerIcon(config.color, config.icon),
              draggable: true
            }
          ).addTo(map)
          
          marker.on('dragend', (e) => {
            const pos = e.target.getLatLng()
            setCoords(prev => ({
              ...prev,
              [key]: { lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) }
            }))
          })
          
          markersRef.current[key] = marker
        }
      })

      // Click handler for placing markers
      map.on('click', (e) => {
        const lat = e.latlng.lat.toFixed(6)
        const lng = e.latlng.lng.toFixed(6)
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

  const handleSave = () => {
    onUpdate({
      launchPoint: coords.launch.lat && coords.launch.lng 
        ? { lat: parseFloat(coords.launch.lat), lng: parseFloat(coords.launch.lng) }
        : null,
      recoveryPoint: coords.recovery.lat && coords.recovery.lng 
        ? { lat: parseFloat(coords.recovery.lat), lng: parseFloat(coords.recovery.lng) }
        : null
    })
    onClose()
  }

  const useSiteLocation = (target) => {
    if (siteLocation?.lat && siteLocation?.lng) {
      setCoords(prev => ({
        ...prev,
        [target]: { lat: siteLocation.lat.toString(), lng: siteLocation.lng.toString() }
      }))
    }
  }

  const copyLaunchToRecovery = () => {
    if (coords.launch.lat && coords.launch.lng) {
      setCoords(prev => ({
        ...prev,
        recovery: { ...prev.launch }
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Launch & Recovery Points</h2>
            <p className="text-sm text-gray-500">Set takeoff and landing locations for your flight</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">Click map to set:</span>
          
          {Object.entries(markerColors).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveMarker(key)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                activeMarker === key
                  ? 'ring-2 ring-offset-2'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{ 
                backgroundColor: `${config.color}20`, 
                color: config.color,
                ringColor: config.color
              }}
            >
              <span>{config.icon}</span>
              {config.label}
              {coords[key].lat && <CheckCircle2 className="w-3 h-3" />}
            </button>
          ))}

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {siteLocation?.lat && (
            <button
              onClick={() => useSiteLocation(activeMarker)}
              className="px-3 py-1.5 rounded-lg text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Use Site Location
            </button>
          )}

          {coords.launch.lat && activeMarker === 'recovery' && (
            <button
              onClick={copyLaunchToRecovery}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
            >
              Same as Launch
            </button>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-[350px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-aeria-blue" />
            </div>
          )}
          <div ref={mapContainerRef} className="absolute inset-0" />
        </div>

        {/* Coordinates */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🛫</span>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Launch Point</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coords.launch.lat}
                    onChange={(e) => setCoords(prev => ({ ...prev, launch: { ...prev.launch, lat: e.target.value }}))}
                    placeholder="Latitude"
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="text"
                    value={coords.launch.lng}
                    onChange={(e) => setCoords(prev => ({ ...prev, launch: { ...prev.launch, lng: e.target.value }}))}
                    placeholder="Longitude"
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🛬</span>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Recovery Point</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coords.recovery.lat}
                    onChange={(e) => setCoords(prev => ({ ...prev, recovery: { ...prev.recovery, lat: e.target.value }}))}
                    placeholder="Latitude"
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="text"
                    value={coords.recovery.lng}
                    onChange={(e) => setCoords(prev => ({ ...prev, recovery: { ...prev.recovery, lng: e.target.value }}))}
                    placeholder="Longitude"
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy">
            Save Points
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// INHERITED DATA PANEL
// Shows data inherited from Site Survey
// ============================================
function InheritedDataPanel({ siteSurvey, onNavigateToSiteSurvey }) {
  const hasLocation = siteSurvey?.location?.coordinates?.lat && siteSurvey?.location?.coordinates?.lng
  const hasPopulation = siteSurvey?.population?.category
  const hasAirspace = siteSurvey?.airspace?.classification
  const hasBoundary = siteSurvey?.boundary && siteSurvey.boundary.length >= 3
  const obstacleCount = (siteSurvey?.obstacles || []).length

  const completeness = [hasLocation, hasPopulation, hasAirspace].filter(Boolean).length
  const isComplete = completeness === 3

  return (
    <div className={`card border-2 ${isComplete ? 'border-green-200 bg-green-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-aeria-blue" />
          Inherited from Site Survey
          {isComplete ? (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Complete
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Incomplete
            </span>
          )}
        </h2>
        <button
          onClick={onNavigateToSiteSurvey}
          className="text-sm text-aeria-blue hover:text-aeria-navy flex items-center gap-1"
        >
          <ExternalLink className="w-4 h-4" />
          Edit in Site Survey
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Location */}
        <div className={`p-3 rounded-lg border ${hasLocation ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className={`w-4 h-4 ${hasLocation ? 'text-green-600' : 'text-amber-600'}`} />
            <span className="text-sm font-medium text-gray-700">Location</span>
          </div>
          {hasLocation ? (
            <div>
              <p className="text-sm font-medium text-gray-900">{siteSurvey.location?.name || 'Unnamed Site'}</p>
              <p className="text-xs text-gray-500 font-mono">
                {siteSurvey.location.coordinates.lat}, {siteSurvey.location.coordinates.lng}
              </p>
              {siteSurvey.location?.elevation && (
                <p className="text-xs text-gray-500">{siteSurvey.location.elevation}m ASL</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-amber-700">Not set in Site Survey</p>
          )}
        </div>

        {/* Population */}
        <div className={`p-3 rounded-lg border ${hasPopulation ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Users className={`w-4 h-4 ${hasPopulation ? 'text-green-600' : 'text-amber-600'}`} />
            <span className="text-sm font-medium text-gray-700">Population</span>
          </div>
          {hasPopulation ? (
            <div>
              <p className="text-sm font-medium text-gray-900">
                {populationLabels[siteSurvey.population.category] || siteSurvey.population.category}
              </p>
              {siteSurvey.population?.adjacentCategory && (
                <p className="text-xs text-gray-500">
                  Adjacent: {populationLabels[siteSurvey.population.adjacentCategory] || siteSurvey.population.adjacentCategory}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-amber-700">Not set in Site Survey</p>
          )}
        </div>

        {/* Airspace */}
        <div className={`p-3 rounded-lg border ${hasAirspace ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Radio className={`w-4 h-4 ${hasAirspace ? 'text-green-600' : 'text-amber-600'}`} />
            <span className="text-sm font-medium text-gray-700">Airspace</span>
          </div>
          {hasAirspace ? (
            <div>
              <p className="text-sm font-medium text-gray-900">
                {airspaceLabels[siteSurvey.airspace.classification] || `Class ${siteSurvey.airspace.classification}`}
              </p>
              {siteSurvey.airspace?.navCanadaAuth && (
                <p className="text-xs text-amber-600">NAV CANADA auth required</p>
              )}
              {(siteSurvey.airspace?.nearbyAerodromes || []).length > 0 && (
                <p className="text-xs text-gray-500">
                  {siteSurvey.airspace.nearbyAerodromes.length} nearby aerodrome(s)
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-amber-700">Not set in Site Survey</p>
          )}
        </div>

        {/* Obstacles & Boundary */}
        <div className="p-3 rounded-lg border bg-white border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Other Data</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">
              <span className="font-medium">{obstacleCount}</span> obstacle(s) identified
            </p>
            {hasBoundary ? (
              <p className="text-xs text-green-600">
                ✓ Work area boundary defined
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                No boundary defined
              </p>
            )}
          </div>
        </div>
      </div>

      {!isComplete && (
        <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Complete the Site Survey before the Flight Plan for best results. 
            Population and airspace data are required for accurate CARs category detection and SORA assessment.
          </p>
        </div>
      )}
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
  const [expandedSections, setExpandedSections] = useState({
    inherited: true,
    license: true,
    aircraft: true,
    launchRecovery: true,
    parameters: true,
    weather: false,
    contingencies: false
  })

  useEffect(() => {
    loadAircraft()
  }, [])

  useEffect(() => {
    if (!project.flightPlan) {
      onUpdate({
        flightPlan: {
          aircraft: [],
          operationType: 'VLOS',
          maxAltitudeAGL: 120,
          overPeople: false,
          nearAerodrome: false,
          aerodromeDistance: null,
          nightOperations: false,
          distanceFromPeople: 30,
          distanceFromPopulated: 1000,
          launchPoint: null,
          recoveryPoint: null,
          launchDescription: '',
          recoveryDescription: '',
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
  const siteSurvey = project.siteSurvey || {}

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
        maxDimension: ac.maxDimension,
        isPrimary: (flightPlan.aircraft || []).length === 0
      }]
    })
  }

  const removeAircraft = (aircraftId) => {
    const newAircraft = (flightPlan.aircraft || []).filter(a => a.id !== aircraftId)
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

  const updateWeather = (field, value) => {
    updateFlightPlan({
      weatherMinimums: {
        ...(flightPlan.weatherMinimums || defaultWeatherMinimums),
        [field]: value
      }
    })
  }

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

  const handleLaunchRecoverySave = ({ launchPoint, recoveryPoint }) => {
    updateFlightPlan({
      launchPoint,
      recoveryPoint
    })
  }

  const availableAircraft = aircraftList.filter(ac => 
    !flightPlan.aircraft?.some(a => a.id === ac.id)
  )

  // Use site survey data for CARs detection
  const licenseInfo = useMemo(() => {
    return detectCARsCategory(flightPlan, siteSurvey)
  }, [flightPlan, siteSurvey])

  const categoryConfig = licenseCategories[licenseInfo.category]
  const CategoryIcon = categoryConfig.icon

  const formatMtow = (mtow) => {
    if (!mtow) return 'N/A'
    if (mtow < 1) return `${(mtow * 1000).toFixed(0)}g`
    return `${mtow} kg`
  }

  const handleNavigateToSiteSurvey = () => {
    if (onNavigateToSection) {
      onNavigateToSection('siteSurvey')
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-cyan-900">Flight Plan for RPAS Operations</h3>
            <p className="text-sm text-cyan-700 mt-1">
              This plan inherits location, population, and airspace data from Site Survey. 
              Aircraft selection and flight parameters here drive CARs category detection and SORA calculations.
            </p>
          </div>
        </div>
      </div>

      {/* Inherited Data Panel */}
      <InheritedDataPanel 
        siteSurvey={siteSurvey} 
        onNavigateToSiteSurvey={handleNavigateToSiteSurvey}
      />

      {/* CARs Category Banner */}
      <div className={`card border-2 ${categoryConfig.color}`}>
        <button
          onClick={() => toggleSection('license')}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-3">
            <CategoryIcon className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">{categoryConfig.label}</h2>
              <p className="text-sm opacity-80">{categoryConfig.subtitle} • Min age: {categoryConfig.ageReq}</p>
            </div>
          </div>
          {expandedSections.license ? <ChevronUp className="w-5 h-5 opacity-60" /> : <ChevronDown className="w-5 h-5 opacity-60" />}
        </button>

        {expandedSections.license && (
          <div className="mt-4 pt-4 border-t border-current/20">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Why this category?</h4>
                <ul className="space-y-1">
                  {licenseInfo.reasons.map((reason, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
                {licenseInfo.mtowKg > 0 && (
                  <div className="mt-3 p-2 bg-white/50 rounded">
                    <p className="text-sm font-medium">
                      Aircraft MTOW: {licenseInfo.mtowDisplay}
                    </p>
                    <p className="text-xs opacity-75">{licenseInfo.weightClass}</p>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Requirements</h4>
                <ul className="space-y-1">
                  {categoryConfig.requirements.map((req, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Aircraft Selection */}
      <div className="card">
        <button
          onClick={() => toggleSection('aircraft')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-aeria-blue" />
            Aircraft
            {flightPlan.aircraft?.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {flightPlan.aircraft.length}
              </span>
            )}
          </h2>
          {expandedSections.aircraft ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.aircraft && (
          <div className="mt-4 space-y-4">
            {flightPlan.aircraft?.length > 0 ? (
              <div className="space-y-2">
                {flightPlan.aircraft.map((ac) => (
                  <div 
                    key={ac.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      ac.isPrimary ? 'bg-aeria-navy/5 border-aeria-navy/30' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Plane className={`w-5 h-5 ${ac.isPrimary ? 'text-aeria-navy' : 'text-gray-400'}`} />
                      <div>
                        <span className="font-medium text-gray-900">{ac.nickname}</span>
                        <span className="text-gray-500 ml-2">{ac.make} {ac.model}</span>
                        {ac.isPrimary && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-aeria-navy text-white rounded">Primary</span>
                        )}
                        <span className="ml-2 text-xs text-gray-500">MTOW: {formatMtow(ac.mtow)}</span>
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
                      {ac.nickname} - {ac.make} {ac.model} (MTOW: {formatMtow(ac.mtow)})
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

      {/* Launch & Recovery Points */}
      <div className="card">
        <button
          onClick={() => toggleSection('launchRecovery')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-aeria-blue" />
            Launch & Recovery Points
            {(flightPlan.launchPoint || flightPlan.recoveryPoint) && (
              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">Set</span>
            )}
          </h2>
          {expandedSections.launchRecovery ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.launchRecovery && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMapEditorOpen(true)}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Map className="w-4 h-4" />
                Set Points on Map
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Launch Point */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🛫</span>
                  <h3 className="font-medium text-green-800">Launch Point</h3>
                </div>
                {flightPlan.launchPoint?.lat ? (
                  <p className="text-sm font-mono text-green-700 mb-2">
                    {flightPlan.launchPoint.lat}, {flightPlan.launchPoint.lng}
                  </p>
                ) : (
                  <p className="text-sm text-green-600 mb-2">Not set</p>
                )}
                <div>
                  <label className="text-xs text-green-700">Description</label>
                  <textarea
                    value={flightPlan.launchDescription || ''}
                    onChange={(e) => updateFlightPlan({ launchDescription: e.target.value })}
                    className="input text-sm mt-1"
                    rows={2}
                    placeholder="Describe the launch area..."
                  />
                </div>
              </div>

              {/* Recovery Point */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🛬</span>
                  <h3 className="font-medium text-amber-800">Recovery Point</h3>
                </div>
                {flightPlan.recoveryPoint?.lat ? (
                  <p className="text-sm font-mono text-amber-700 mb-2">
                    {flightPlan.recoveryPoint.lat}, {flightPlan.recoveryPoint.lng}
                  </p>
                ) : (
                  <p className="text-sm text-amber-600 mb-2">Not set</p>
                )}
                <div>
                  <label className="text-xs text-amber-700">Description</label>
                  <textarea
                    value={flightPlan.recoveryDescription || ''}
                    onChange={(e) => updateFlightPlan({ recoveryDescription: e.target.value })}
                    className="input text-sm mt-1"
                    rows={2}
                    placeholder="Describe the recovery area..."
                  />
                </div>
              </div>
            </div>
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
                <p className="text-xs text-gray-500 mt-1">
                  {(flightPlan.maxAltitudeAGL || 120) > 122 
                    ? '⚠️ Above 400ft (122m) - may require authorization' 
                    : '✓ Within 400ft (122m) standard limit'}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Min Distance from Uninvolved Persons (m)</label>
                <input
                  type="number"
                  value={flightPlan.distanceFromPeople || 30}
                  onChange={(e) => updateFlightPlan({ distanceFromPeople: parseFloat(e.target.value) || 30 })}
                  className="input"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(flightPlan.distanceFromPeople || 30) >= 30 
                    ? '✓ ≥30m (100ft) - Basic eligible' 
                    : (flightPlan.distanceFromPeople || 30) >= 5
                      ? '⚠️ <30m requires Advanced + declared aircraft'
                      : '⚠️ <5m (16.4ft) requires Advanced + declared aircraft'}
                </p>
              </div>

              {flightPlan.operationType === 'BVLOS' && (
                <div>
                  <label className="label">Distance from Populated Area (m)</label>
                  <input
                    type="number"
                    value={flightPlan.distanceFromPopulated || 1000}
                    onChange={(e) => updateFlightPlan({ distanceFromPopulated: parseFloat(e.target.value) || 1000 })}
                    className="input"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(flightPlan.distanceFromPopulated || 1000) >= 1000 
                      ? '✓ ≥1km - Complex Level 1 eligible (small/medium RPAS)' 
                      : '⚠️ <1km - Small RPAS only for Complex Level 1'}
                  </p>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flightPlan.overPeople || false}
                  onChange={(e) => updateFlightPlan({ overPeople: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-aeria-blue"
                />
                <span className="text-sm">
                  <span className="font-medium">Over People</span>
                  <br />
                  <span className="text-gray-500">Directly overhead bystanders</span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flightPlan.nearAerodrome || false}
                  onChange={(e) => updateFlightPlan({ nearAerodrome: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-aeria-blue"
                />
                <span className="text-sm">
                  <span className="font-medium">Near Aerodrome</span>
                  <br />
                  <span className="text-gray-500">Within 3nm airport / 1nm heliport</span>
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flightPlan.nightOperations || false}
                  onChange={(e) => updateFlightPlan({ nightOperations: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-aeria-blue"
                />
                <span className="text-sm">
                  <span className="font-medium">Night Operations</span>
                  <br />
                  <span className="text-gray-500">Before sunrise / after sunset</span>
                </span>
              </label>
            </div>

            {flightPlan.nearAerodrome && (
              <div>
                <label className="label">Distance from Aerodrome (km)</label>
                <input
                  type="number"
                  value={flightPlan.aerodromeDistance || ''}
                  onChange={(e) => updateFlightPlan({ aerodromeDistance: parseFloat(e.target.value) || null })}
                  className="input"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 4.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Reference: 1nm = 1.85km (heliport), 3nm = 5.56km (airport), 5nm = 9.26km (BVLOS limit)
                </p>
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Min Visibility (SM)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.minVisibility || 3}
                  onChange={(e) => updateWeather('minVisibility', parseFloat(e.target.value))}
                  className="input"
                  step="0.5"
                  min="0"
                />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Min Ceiling (ft)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.minCeiling || 500}
                  onChange={(e) => updateWeather('minCeiling', parseFloat(e.target.value))}
                  className="input"
                  step="100"
                  min="0"
                />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Max Wind (m/s)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.maxWind || 10}
                  onChange={(e) => updateWeather('maxWind', parseFloat(e.target.value))}
                  className="input"
                  min="0"
                />
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Max Gust (m/s)
                </label>
                <input
                  type="number"
                  value={flightPlan.weatherMinimums?.maxGust || 15}
                  onChange={(e) => updateWeather('maxGust', parseFloat(e.target.value))}
                  className="input"
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
                  className="w-5 h-5 rounded border-gray-300 text-aeria-blue"
                />
                <span className="text-sm font-medium">No precipitation (rain, snow, etc.)</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="label">Weather Notes</label>
              <textarea
                value={flightPlan.weatherMinimums?.notes || ''}
                onChange={(e) => updateWeather('notes', e.target.value)}
                className="input min-h-[60px]"
                placeholder="Additional weather considerations..."
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
            <AlertTriangle className="w-5 h-5 text-aeria-blue" />
            Contingency Procedures
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {(flightPlan.contingencies || defaultContingencies).length}
            </span>
          </h2>
          {expandedSections.contingencies ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.contingencies && (
          <div className="mt-4 space-y-3">
            {(flightPlan.contingencies || defaultContingencies).map((cont, i) => (
              <div key={i} className={`p-3 rounded-lg border ${
                cont.priority === 'critical' ? 'bg-red-50 border-red-200' :
                cont.priority === 'high' ? 'bg-amber-50 border-amber-200' :
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={cont.priority}
                        onChange={(e) => updateContingency(i, 'priority', e.target.value)}
                        className="text-xs px-2 py-1 rounded border bg-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                      <input
                        type="text"
                        value={cont.trigger}
                        onChange={(e) => updateContingency(i, 'trigger', e.target.value)}
                        className="flex-1 text-sm font-medium bg-transparent border-none p-0 focus:ring-0"
                        placeholder="Trigger condition..."
                      />
                    </div>
                    <textarea
                      value={cont.action}
                      onChange={(e) => updateContingency(i, 'action', e.target.value)}
                      className="w-full text-sm bg-transparent border-none p-0 focus:ring-0 resize-none"
                      placeholder="Response action..."
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={() => removeContingency(i)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addContingency}
              className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Contingency
            </button>
          </div>
        )}
      </div>

      {/* Additional Procedures */}
      <div className="card">
        <label className="label">Additional Procedures / Notes</label>
        <textarea
          value={flightPlan.additionalProcedures || ''}
          onChange={(e) => updateFlightPlan({ additionalProcedures: e.target.value })}
          className="input min-h-[100px]"
          placeholder="Any additional flight procedures, special considerations, or notes..."
        />
      </div>

      {/* Launch/Recovery Map Editor Modal */}
      <LaunchRecoveryMapEditor
        isOpen={mapEditorOpen}
        onClose={() => setMapEditorOpen(false)}
        siteLocation={siteSurvey.location?.coordinates}
        boundary={siteSurvey.boundary}
        obstacles={siteSurvey.obstacles}
        launchPoint={flightPlan.launchPoint}
        recoveryPoint={flightPlan.recoveryPoint}
        onUpdate={handleLaunchRecoverySave}
      />
    </div>
  )
}
