/**
 * SiteSurveyMapTools.jsx
 * Site Survey specific map tools and helper components
 * 
 * Provides specialized tools for:
 * - Quick location search/geocoding
 * - Coordinate input
 * - Area measurement display
 * - Population density estimation help
 * 
 * @location src/components/map/SiteSurveyMapTools.jsx
 * @action NEW
 */

import React, { useState, useCallback } from 'react'
import {
  Search,
  MapPin,
  Square,
  AlertTriangle,
  Ruler,
  Users,
  Navigation,
  Crosshair,
  Info,
  Loader2,
  X,
  Check,
  RotateCcw,
  Tag
} from 'lucide-react'
import { POPULATION_CATEGORIES, calculatePolygonArea } from '../../lib/mapDataStructures'
import { logger } from '../../lib/logger'

// ============================================
// REVERSE GEOCODING HELPER
// ============================================

export async function reverseGeocode(lat, lng) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN
  if (!token) {
    logger.warn('Mapbox token not configured for reverse geocoding')
    return null
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,place,locality,neighborhood&limit=1`
    )

    if (!response.ok) {
      throw new Error('Reverse geocoding failed')
    }

    const data = await response.json()
    if (data.features && data.features.length > 0) {
      return {
        address: data.features[0].place_name,
        shortAddress: data.features[0].text || data.features[0].place_name,
        context: data.features[0].context || []
      }
    }
    return null
  } catch (err) {
    logger.error('Reverse geocoding error:', err)
    return null
  }
}

// ============================================
// COORDINATE INPUT TOOL
// ============================================

export function CoordinateInput({ 
  onSetLocation, 
  currentLocation = null,
  label = "Set Location by Coordinates"
}) {
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [error, setError] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      setError('Please enter valid coordinates')
      return
    }
    
    if (latNum < -90 || latNum > 90) {
      setError('Latitude must be between -90 and 90')
      return
    }
    
    if (lngNum < -180 || lngNum > 180) {
      setError('Longitude must be between -180 and 180')
      return
    }
    
    onSetLocation({ lat: latNum, lng: lngNum })
    setLat('')
    setLng('')
  }
  
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6))
        setLng(position.coords.longitude.toFixed(6))
      },
      (err) => {
        setError('Unable to retrieve your location')
      }
    )
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Crosshair className="w-4 h-4" />
        {label}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Latitude</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g., 51.0447"
              className="input text-sm py-1.5"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Longitude</label>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="e.g., -114.0719"
              className="input text-sm py-1.5"
            />
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
          >
            <Navigation className="w-3 h-3" />
            Use My Location
          </button>
          <button
            type="submit"
            className="flex-1 px-3 py-1.5 text-sm bg-aeria-navy text-white rounded hover:bg-aeria-navy/90 flex items-center justify-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            Set Location
          </button>
        </div>
      </form>
      
      {currentLocation && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
          <strong>Current:</strong> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
        </div>
      )}
    </div>
  )
}

// ============================================
// LOCATION SEARCH (GEOCODING)
// ============================================

export function LocationSearch({ onSelectLocation, placeholder = "Search for a location..." }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setError('')
    setResults([])
    
    try {
      // Use Mapbox Geocoding API
      const token = import.meta.env.VITE_MAPBOX_TOKEN
      if (!token) {
        setError('Mapbox token not configured')
        return
      }
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=5&country=ca`
      )
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const data = await response.json()
      setResults(data.features || [])
      
      if (data.features.length === 0) {
        setError('No results found')
      }
    } catch (err) {
      logger.error('Geocoding error:', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [query])
  
  const handleSelect = (feature) => {
    const [lng, lat] = feature.center
    onSelectLocation({
      lat,
      lng,
      name: feature.place_name,
      address: feature.place_name
    })
    setQuery('')
    setResults([])
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Search className="w-4 h-4" />
        Search Location
      </h4>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={placeholder}
          className="input flex-1 text-sm"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-3 py-2 bg-aeria-navy text-white rounded hover:bg-aeria-navy/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {results.length > 0 && (
        <ul className="mt-3 space-y-1 max-h-48 overflow-y-auto">
          {results.map((feature) => (
            <li key={feature.id}>
              <button
                onClick={() => handleSelect(feature)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature.place_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ============================================
// AREA MEASUREMENT DISPLAY
// ============================================

export function AreaMeasurement({ polygon, label = "Operations Boundary Area" }) {
  if (!polygon?.geometry?.coordinates?.[0]) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <Square className="w-6 h-6 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Draw a boundary to see area measurement</p>
      </div>
    )
  }
  
  const areaM2 = calculatePolygonArea(polygon)
  if (!areaM2) return null
  
  const areaKm2 = areaM2 / 1000000
  const areaHa = areaM2 / 10000
  const areaAcres = areaHa * 2.471
  
  // Determine appropriate unit
  let displayArea, unit
  if (areaKm2 >= 1) {
    displayArea = areaKm2.toFixed(2)
    unit = 'km²'
  } else if (areaHa >= 1) {
    displayArea = areaHa.toFixed(2)
    unit = 'hectares'
  } else {
    displayArea = areaM2.toFixed(0)
    unit = 'm²'
  }
  
  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
        <Ruler className="w-4 h-4" />
        {label}
      </h4>
      
      <div className="text-2xl font-bold text-blue-700 mb-2">
        {displayArea} {unit}
      </div>
      
      <div className="text-sm text-blue-600 space-y-1">
        <p>{areaM2.toLocaleString()} m²</p>
        <p>{areaHa.toFixed(2)} hectares ({areaAcres.toFixed(2)} acres)</p>
        {areaKm2 >= 0.01 && <p>{areaKm2.toFixed(4)} km²</p>}
      </div>
    </div>
  )
}

// ============================================
// DISTANCE MEASUREMENT TOOL
// ============================================

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - First point latitude
 * @param {number} lon1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lon2 - Second point longitude
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }
  return `${Math.round(meters)} m`
}

export function DistanceMeasurement({
  points = [],
  onClear,
  label = "Distance Measurement"
}) {
  if (points.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <Ruler className="w-6 h-6 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Click "Measure" tool then click two points on the map</p>
      </div>
    )
  }

  if (points.length === 1) {
    return (
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          {label}
        </h4>
        <p className="text-sm text-blue-700">
          Point 1 set. Click second point to measure distance.
        </p>
        <p className="text-xs text-blue-600 mt-1">
          {points[0].lat.toFixed(6)}, {points[0].lng.toFixed(6)}
        </p>
      </div>
    )
  }

  const distance = calculateDistance(
    points[0].lat, points[0].lng,
    points[1].lat, points[1].lng
  )

  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
        <Ruler className="w-4 h-4" />
        {label}
      </h4>

      <div className="text-2xl font-bold text-blue-700 mb-2">
        {formatDistance(distance)}
      </div>

      <div className="text-sm text-blue-600 space-y-1">
        <p>From: {points[0].lat.toFixed(6)}, {points[0].lng.toFixed(6)}</p>
        <p>To: {points[1].lat.toFixed(6)}, {points[1].lng.toFixed(6)}</p>
      </div>

      <div className="mt-3 text-xs text-blue-600 space-y-0.5">
        <p><strong>Distance:</strong> {Math.round(distance)} meters</p>
        <p><strong>Distance:</strong> {(distance / 1000).toFixed(3)} km</p>
        <p><strong>Distance:</strong> {(distance * 3.28084).toFixed(0)} feet</p>
        <p><strong>Distance:</strong> {(distance / 1852).toFixed(2)} NM</p>
      </div>

      {onClear && (
        <button
          onClick={onClear}
          className="mt-3 w-full px-3 py-2 text-sm bg-white text-blue-700 border border-blue-200 rounded hover:bg-blue-100 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3 h-3" />
          Clear Measurement
        </button>
      )}
    </div>
  )
}

// ============================================
// POPULATION DENSITY HELPER
// ============================================

export function PopulationDensityHelper({ 
  boundary, 
  currentCategory,
  onSuggestCategory 
}) {
  const [estimatedPeople, setEstimatedPeople] = useState('')
  const [suggestion, setSuggestion] = useState(null)
  
  const calculateDensity = useCallback(() => {
    if (!boundary?.geometry?.coordinates?.[0] || !estimatedPeople) {
      setSuggestion(null)
      return
    }
    
    const areaM2 = calculatePolygonArea(boundary)
    if (!areaM2) return
    
    const areaKm2 = areaM2 / 1000000
    const people = parseInt(estimatedPeople, 10)
    
    if (isNaN(people) || people < 0) {
      setSuggestion(null)
      return
    }
    
    const density = people / areaKm2
    
    // Determine suggested category based on density
    let suggestedCategory
    if (density === 0) {
      suggestedCategory = 'controlled'
    } else if (density < 1) {
      suggestedCategory = 'remote'
    } else if (density < 50) {
      suggestedCategory = 'lightly'
    } else if (density < 500) {
      suggestedCategory = 'sparsely'
    } else if (density < 5000) {
      suggestedCategory = 'suburban'
    } else {
      suggestedCategory = 'highdensity'
    }
    
    setSuggestion({
      density: density.toFixed(1),
      category: suggestedCategory,
      categoryLabel: POPULATION_CATEGORIES[suggestedCategory]?.label
    })
  }, [boundary, estimatedPeople])
  
  if (!boundary?.geometry?.coordinates?.[0]) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Draw an operations boundary to use the population density calculator
        </p>
      </div>
    )
  }
  
  const areaM2 = calculatePolygonArea(boundary)
  const areaKm2 = areaM2 ? (areaM2 / 1000000).toFixed(4) : 0
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h4 className="font-medium text-gray-900 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Population Density Calculator
      </h4>
      
      <p className="text-sm text-gray-600">
        Boundary area: <strong>{areaKm2} km²</strong>
      </p>
      
      <div>
        <label className="block text-sm text-gray-700 mb-1">
          Estimated people in operations area
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            value={estimatedPeople}
            onChange={(e) => setEstimatedPeople(e.target.value)}
            placeholder="e.g., 10"
            className="input flex-1"
          />
          <button
            onClick={calculateDensity}
            className="px-4 py-2 bg-aeria-navy text-white rounded hover:bg-aeria-navy/90"
          >
            Calculate
          </button>
        </div>
      </div>
      
      {suggestion && (
        <div className="p-3 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Estimated density: <strong>{suggestion.density} people/km²</strong>
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: POPULATION_CATEGORIES[suggestion.category]?.color }}
              />
              <span className="font-medium">Suggested: {suggestion.categoryLabel}</span>
            </div>
            
            {onSuggestCategory && suggestion.category !== currentCategory && (
              <button
                onClick={() => onSuggestCategory(suggestion.category)}
                className="text-sm text-aeria-navy hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Use this
              </button>
            )}
          </div>
          
          {suggestion.category === currentCategory && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Matches current selection
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// QUICK ACTIONS TOOLBAR
// ============================================

export function SiteSurveyQuickActions({
  onClearBoundary,
  onClearLocation,
  onClearObstacles,
  hasBoundary,
  hasLocation,
  obstacleCount
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <RotateCcw className="w-4 h-4" />
        Quick Actions
      </h4>
      
      <div className="space-y-2">
        <button
          onClick={onClearLocation}
          disabled={!hasLocation}
          className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <X className="w-4 h-4 text-red-500" />
          Clear Site Location
        </button>
        
        <button
          onClick={onClearBoundary}
          disabled={!hasBoundary}
          className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <X className="w-4 h-4 text-red-500" />
          Clear Operations Boundary
        </button>
        
        <button
          onClick={onClearObstacles}
          disabled={obstacleCount === 0}
          className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <X className="w-4 h-4 text-red-500" />
          Clear All Obstacles ({obstacleCount})
        </button>
      </div>
    </div>
  )
}

// ============================================
// SITE SURVEY INSTRUCTIONS
// ============================================

export function SiteSurveyInstructions() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <span className="font-medium text-blue-900 flex items-center gap-2">
          <Info className="w-4 h-4" />
          How to Complete Site Survey
        </span>
        {isOpen ? (
          <X className="w-4 h-4 text-blue-500" />
        ) : (
          <span className="text-sm text-blue-600">Show</span>
        )}
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 text-sm text-blue-800">
          <div>
            <h5 className="font-medium mb-1">1. Set Site Location</h5>
            <p>Click the "Site Location" tool, then click on the map to place the center marker.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">2. Draw Operations Boundary</h5>
            <p>Click "Boundary" tool, then click multiple points on the map. Double-click to complete the polygon.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">3. Mark Obstacles</h5>
            <p>Click "Obstacle" tool, then click on the map to mark each obstacle. Add details in the form below.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">4. Assess Population</h5>
            <p>Select the population category that best represents the operations area for SORA calculations.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">5. Document Airspace & Access</h5>
            <p>Complete the remaining sections with airspace classification, site access details, and notes.</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// OBSTACLE LABEL PROMPT
// Shows immediately after placing an obstacle to label it
// ============================================

const OBSTACLE_TYPES_QUICK = [
  { value: 'tower', label: 'Tower/Antenna', icon: '📡' },
  { value: 'wire', label: 'Power Lines', icon: '⚡' },
  { value: 'building', label: 'Building', icon: '🏢' },
  { value: 'tree', label: 'Trees', icon: '🌲' },
  { value: 'terrain', label: 'Terrain', icon: '⛰️' },
  { value: 'crane', label: 'Crane', icon: '🏗️' },
  { value: 'other', label: 'Other', icon: '⚠️' }
]

export function ObstacleLabelPrompt({
  isOpen,
  position,
  onSave,
  onCancel
}) {
  const [obstacleType, setObstacleType] = useState('other')
  const [height, setHeight] = useState('')
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    onSave({
      obstacleType,
      height: height ? Number(height) : null,
      notes: notes.trim() || null
    })
    // Reset form
    setObstacleType('other')
    setHeight('')
    setNotes('')
  }

  const handleCancel = () => {
    onCancel()
    setObstacleType('other')
    setHeight('')
    setNotes('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30">
      <div
        className="bg-white rounded-xl shadow-2xl border border-gray-200 w-80 max-w-[90vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-gray-900">Label Obstacle</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Quick type selection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {OBSTACLE_TYPES_QUICK.map(type => (
                <button
                  key={type.value}
                  onClick={() => setObstacleType(type.value)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    obstacleType === type.value
                      ? 'bg-amber-100 border-2 border-amber-400'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                  title={type.label}
                >
                  <span className="text-lg">{type.icon}</span>
                  <p className="text-[10px] text-gray-600 mt-0.5 truncate">{type.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Height input */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Height (meters) - optional
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g., 30"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Notes - optional
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Guy wires, red lights"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-1"
          >
            <Tag className="w-4 h-4" />
            Save Obstacle
          </button>
        </div>
      </div>
    </div>
  )
}

export default {
  CoordinateInput,
  LocationSearch,
  AreaMeasurement,
  DistanceMeasurement,
  PopulationDensityHelper,
  SiteSurveyQuickActions,
  SiteSurveyInstructions,
  ObstacleLabelPrompt,
  reverseGeocode,
  calculateDistance,
  formatDistance
}
