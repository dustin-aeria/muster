/**
 * TailgateFlightPlanEditor.jsx
 * Inline map editor for field adjustments to flight plan during tailgate
 *
 * Features:
 * - Launch point placement/editing
 * - Landing/recovery point placement/editing
 * - Pilot position placement/editing
 * - Flight area boundary drawing
 * - Reset to original site plan
 *
 * @location src/components/projects/TailgateFlightPlanEditor.jsx
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  Plane,
  Target,
  User,
  Square,
  RotateCcw,
  Check,
  X,
  Loader2,
  Info
} from 'lucide-react'
import { logger } from '../../lib/logger'

const TOOLS = [
  { id: 'launch', label: 'Launch', icon: Plane, color: '#16a34a', emoji: '🚀' },
  { id: 'recovery', label: 'Landing', icon: Target, color: '#dc2626', emoji: '🎯' },
  { id: 'pilot', label: 'Pilot', icon: User, color: '#3b82f6', emoji: '👤' },
  { id: 'boundary', label: 'Flight Area', icon: Square, color: '#9333ea', emoji: '⬛' }
]

export default function TailgateFlightPlanEditor({
  site,
  previousEdits,  // Previously saved field adjustments (optional)
  onSave,
  onCancel
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const boundaryLayerRef = useRef(null)
  const boundaryVerticesRef = useRef([])

  const [isLoading, setIsLoading] = useState(true)
  const [activeTool, setActiveTool] = useState(null)
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false)

  // Local editing state - initialized from site's flight plan data
  const [launchPoint, setLaunchPoint] = useState(null)
  const [recoveryPoint, setRecoveryPoint] = useState(null)
  const [pilotPosition, setPilotPosition] = useState(null)
  const [flightBoundary, setFlightBoundary] = useState([])

  // Track if changes were made
  const [hasChanges, setHasChanges] = useState(false)

  // Track if previous edits are available but not applied
  const [hasPreviousEdits] = useState(!!previousEdits?.editedAt)

  // Refs for click handler
  const activeToolRef = useRef(null)
  const isDrawingBoundaryRef = useRef(false)

  // Sync refs
  useEffect(() => { activeToolRef.current = activeTool }, [activeTool])
  useEffect(() => { isDrawingBoundaryRef.current = isDrawingBoundary }, [isDrawingBoundary])

  // Helper to extract coordinates from GeoJSON
  const extractCoords = (feature) => {
    if (!feature?.geometry?.coordinates) return null
    const [lng, lat] = feature.geometry.coordinates
    return { lat, lng }
  }

  // Load data from a source (site or previous edits)
  const loadFromSource = (sourceData, siteSurvey) => {
    setLaunchPoint(extractCoords(sourceData.launchPoint))
    setRecoveryPoint(extractCoords(sourceData.recoveryPoint))
    setPilotPosition(extractCoords(sourceData.pilotPosition))

    // Extract boundary from flight geography or operations boundary
    const boundaryFeature = sourceData.flightGeography || siteSurvey?.operationsBoundary
    if (boundaryFeature?.geometry?.coordinates?.[0]) {
      const coords = boundaryFeature.geometry.coordinates[0]
      setFlightBoundary(coords.map(([lng, lat]) => ({ lat, lng })))
    } else {
      setFlightBoundary([])
    }
  }

  // Always initialize from LATEST site data (not previous edits)
  useEffect(() => {
    const sourceData = site?.mapData?.flightPlan || {}
    const siteSurvey = site?.mapData?.siteSurvey || {}
    loadFromSource(sourceData, siteSurvey)
  }, [site])

  // Function to restore previous field adjustments
  const restorePreviousEdits = () => {
    if (previousEdits) {
      loadFromSource(previousEdits, site?.mapData?.siteSurvey || {})
      setHasChanges(true)
    }
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Load CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!document.getElementById('tailgate-map-styles')) {
      const style = document.createElement('style')
      style.id = 'tailgate-map-styles'
      style.textContent = `
        .custom-div-icon { background: transparent !important; border: none !important; }
        .tailgate-map-container .leaflet-container { cursor: crosshair; }
        .tailgate-map-container .leaflet-dragging .leaflet-container { cursor: move; }
      `
      document.head.appendChild(style)
    }

    const initMap = async () => {
      // Load Leaflet
      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = resolve
          document.body.appendChild(script)
        })
      }

      const L = window.L

      // Clean up existing
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markersRef.current = {}
      boundaryLayerRef.current = null
      boundaryVerticesRef.current = []

      await new Promise(r => setTimeout(r, 100))
      if (!mapContainerRef.current) return

      // Get center from site location or default
      const siteLocation = site?.mapData?.siteSurvey?.siteLocation?.geometry?.coordinates
      const defaultLat = siteLocation ? siteLocation[1] : 54.0
      const defaultLng = siteLocation ? siteLocation[0] : -125.0
      const hasLocation = !!siteLocation
      const defaultZoom = hasLocation ? 16 : 5

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        zoomControl: true
      })

      // Use satellite imagery for better field assessment
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri',
        maxZoom: 19
      }).addTo(map)

      mapRef.current = map

      // Icon creator
      const createIcon = (color, emoji, size = 32) => L.divIcon({
        className: 'custom-div-icon',
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
        "><span style="transform: rotate(45deg); font-size: ${size * 0.45}px;">${emoji}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size]
      })

      // Map click handler
      map.on('click', (e) => {
        const lat = parseFloat(e.latlng.lat.toFixed(6))
        const lng = parseFloat(e.latlng.lng.toFixed(6))
        const coords = { lat, lng }

        if (isDrawingBoundaryRef.current) {
          setFlightBoundary(prev => [...prev, coords])
          setHasChanges(true)
        } else {
          const tool = activeToolRef.current
          if (tool === 'launch') {
            setLaunchPoint(coords)
            updateMarker('launch', coords, '#16a34a', '🚀', setLaunchPoint)
            setHasChanges(true)
          } else if (tool === 'recovery') {
            setRecoveryPoint(coords)
            updateMarker('recovery', coords, '#dc2626', '🎯', setRecoveryPoint)
            setHasChanges(true)
          } else if (tool === 'pilot') {
            setPilotPosition(coords)
            updateMarker('pilot', coords, '#3b82f6', '👤', setPilotPosition)
            setHasChanges(true)
          }
        }
      })

      // Helper to update/create marker
      function updateMarker(key, coords, color, emoji, setter) {
        if (markersRef.current[key]) {
          markersRef.current[key].setLatLng([coords.lat, coords.lng])
        } else {
          const marker = L.marker([coords.lat, coords.lng], {
            icon: createIcon(color, emoji),
            draggable: true
          }).addTo(map)

          marker.on('dragend', (e) => {
            const pos = e.target.getLatLng()
            setter({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) })
            setHasChanges(true)
          })
          markersRef.current[key] = marker
        }
      }

      // Add existing markers from latest site data
      const sourceData = site?.mapData?.flightPlan || {}

      if (sourceData.launchPoint?.geometry?.coordinates) {
        const [lng, lat] = sourceData.launchPoint.geometry.coordinates
        updateMarker('launch', { lat, lng }, '#16a34a', '🚀', setLaunchPoint)
      }
      if (sourceData.recoveryPoint?.geometry?.coordinates) {
        const [lng, lat] = sourceData.recoveryPoint.geometry.coordinates
        updateMarker('recovery', { lat, lng }, '#dc2626', '🎯', setRecoveryPoint)
      }
      if (sourceData.pilotPosition?.geometry?.coordinates) {
        const [lng, lat] = sourceData.pilotPosition.geometry.coordinates
        updateMarker('pilot', { lat, lng }, '#3b82f6', '👤', setPilotPosition)
      }

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
  }, [site])

  // Update boundary display when flightBoundary changes
  useEffect(() => {
    if (!mapRef.current || !window.L || isLoading) return

    const L = window.L
    const map = mapRef.current

    // Remove old
    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current)
      boundaryLayerRef.current = null
    }
    boundaryVerticesRef.current.forEach(v => map.removeLayer(v))
    boundaryVerticesRef.current = []

    // Draw new
    if (flightBoundary.length >= 3) {
      const polygon = L.polygon(flightBoundary.map(p => [p.lat, p.lng]), {
        color: '#9333ea',
        fillColor: '#9333ea',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(map)
      boundaryLayerRef.current = polygon
    }

    // Add vertices
    flightBoundary.forEach((point) => {
      const vertex = L.circleMarker([point.lat, point.lng], {
        radius: 6,
        color: '#9333ea',
        fillColor: 'white',
        fillOpacity: 1,
        weight: 2
      }).addTo(map)
      boundaryVerticesRef.current.push(vertex)
    })
  }, [flightBoundary, isLoading])

  // Tool handlers
  const handleToolClick = (toolId) => {
    if (toolId === 'boundary') {
      setIsDrawingBoundary(!isDrawingBoundary)
      setActiveTool(isDrawingBoundary ? null : toolId)
    } else {
      setIsDrawingBoundary(false)
      setActiveTool(activeTool === toolId ? null : toolId)
    }
  }

  const handleClearBoundary = () => {
    setFlightBoundary([])
    setHasChanges(true)
  }

  const handleUndoBoundaryPoint = () => {
    setFlightBoundary(prev => prev.slice(0, -1))
    setHasChanges(true)
  }

  const handleResetToOriginal = () => {
    const sourceData = site?.mapData?.flightPlan || {}
    const siteSurvey = site?.mapData?.siteSurvey || {}

    const extractCoords = (feature) => {
      if (!feature?.geometry?.coordinates) return null
      const [lng, lat] = feature.geometry.coordinates
      return { lat, lng }
    }

    // Reset all state
    setLaunchPoint(extractCoords(sourceData.launchPoint))
    setRecoveryPoint(extractCoords(sourceData.recoveryPoint))
    setPilotPosition(extractCoords(sourceData.pilotPosition))

    const boundaryFeature = sourceData.flightGeography || siteSurvey.operationsBoundary
    if (boundaryFeature?.geometry?.coordinates?.[0]) {
      const coords = boundaryFeature.geometry.coordinates[0]
      setFlightBoundary(coords.map(([lng, lat]) => ({ lat, lng })))
    } else {
      setFlightBoundary([])
    }

    // Reset markers on map
    if (mapRef.current && window.L) {
      Object.values(markersRef.current).forEach(m => mapRef.current.removeLayer(m))
      markersRef.current = {}
    }

    setHasChanges(false)
    setActiveTool(null)
    setIsDrawingBoundary(false)
  }

  const handleSave = () => {
    // Convert to GeoJSON format for storage
    const toGeoJsonPoint = (coords, label) => {
      if (!coords) return null
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        },
        properties: { label }
      }
    }

    const toGeoJsonPolygon = (coords) => {
      if (!coords || coords.length < 3) return null
      const ring = [...coords.map(c => [c.lng, c.lat])]
      // Close the ring
      if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
        ring.push(ring[0])
      }
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [ring]
        },
        properties: {}
      }
    }

    const tailgateMapData = {
      launchPoint: toGeoJsonPoint(launchPoint, 'Launch Point'),
      recoveryPoint: toGeoJsonPoint(recoveryPoint, 'Landing Point'),
      pilotPosition: toGeoJsonPoint(pilotPosition, 'Pilot Position'),
      flightGeography: toGeoJsonPolygon(flightBoundary),
      editedAt: new Date().toISOString()
    }

    onSave(tailgateMapData)
  }

  return (
    <div className="tailgate-map-container border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        {/* Previous edits notice */}
        {hasPreviousEdits && !hasChanges && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-amber-800">
              You have previous field adjustments from {new Date(previousEdits.editedAt).toLocaleString()}
            </span>
            <button
              onClick={restorePreviousEdits}
              className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded hover:bg-amber-200"
            >
              Restore Previous
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Plane className="w-4 h-4 text-aeria-blue" />
            Field Flight Plan Adjustments
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToOriginal}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Site Plan
            </button>
          </div>
        </div>

        {/* Tool buttons */}
        <div className="flex flex-wrap gap-2">
          {TOOLS.map(tool => {
            const Icon = tool.icon
            const isActive = activeTool === tool.id || (tool.id === 'boundary' && isDrawingBoundary)
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'bg-aeria-navy text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tool.label}
              </button>
            )
          })}
        </div>

        {/* Boundary controls */}
        {isDrawingBoundary && (
          <div className="mt-2 p-2 bg-purple-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-purple-800">
              Click on map to add boundary points ({flightBoundary.length} points)
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleUndoBoundaryPoint}
                disabled={flightBoundary.length === 0}
                className="px-2 py-1 text-xs bg-white border border-purple-200 rounded hover:bg-purple-100 disabled:opacity-50"
              >
                Undo
              </button>
              <button
                onClick={handleClearBoundary}
                disabled={flightBoundary.length === 0}
                className="px-2 py-1 text-xs bg-white border border-purple-200 rounded hover:bg-purple-100 disabled:opacity-50"
              >
                Clear
              </button>
              <button
                onClick={() => setIsDrawingBoundary(false)}
                className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Active tool hint */}
        {activeTool && !isDrawingBoundary && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-800">
              Click on map to place {TOOLS.find(t => t.id === activeTool)?.label}
            </span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative" style={{ height: 350 }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-aeria-blue" />
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Status indicators */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-3 text-xs">
          <span className={`flex items-center gap-1 ${launchPoint ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="w-2 h-2 rounded-full" style={{ background: launchPoint ? '#16a34a' : '#d1d5db' }} />
            Launch {launchPoint ? '✓' : ''}
          </span>
          <span className={`flex items-center gap-1 ${recoveryPoint ? 'text-red-600' : 'text-gray-400'}`}>
            <span className="w-2 h-2 rounded-full" style={{ background: recoveryPoint ? '#dc2626' : '#d1d5db' }} />
            Landing {recoveryPoint ? '✓' : ''}
          </span>
          <span className={`flex items-center gap-1 ${pilotPosition ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className="w-2 h-2 rounded-full" style={{ background: pilotPosition ? '#3b82f6' : '#d1d5db' }} />
            Pilot {pilotPosition ? '✓' : ''}
          </span>
          <span className={`flex items-center gap-1 ${flightBoundary.length >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
            <span className="w-2 h-2 rounded-full" style={{ background: flightBoundary.length >= 3 ? '#9333ea' : '#d1d5db' }} />
            Area {flightBoundary.length >= 3 ? '✓' : `(${flightBoundary.length}/3)`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {hasChanges ? (
            <span className="text-amber-600 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Unsaved changes
            </span>
          ) : (
            'No changes'
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-4 py-2 text-sm bg-aeria-navy text-white rounded-lg hover:bg-aeria-navy/90 disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save Adjustments
          </button>
        </div>
      </div>
    </div>
  )
}

TailgateFlightPlanEditor.propTypes = {
  site: PropTypes.object,
  previousEdits: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}
