/**
 * FlightPath3DLayer.jsx
 * Renders 3D flight path visualization on Mapbox map
 *
 * Features:
 * - 3D flight path line at altitude
 * - Ground shadow projection
 * - Altitude poles from ground to waypoints
 * - Numbered waypoint markers
 * - Corridor buffer visualization
 * - Flight geography extrusion
 *
 * @location src/components/map/FlightPath3DLayer.jsx
 */

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

// ============================================
// LAYER IDS
// ============================================

const LAYER_IDS = {
  // Flight geography extrusion
  flightVolumeExtrusion: 'flight-volume-extrusion',

  // Flight path
  flightPathLine: 'flight-path-line',
  groundShadow: 'flight-path-ground-shadow',
  altitudePoles: 'flight-path-altitude-poles',

  // Waypoints
  waypointMarkers: 'flight-path-waypoint-markers',
  waypointLabels: 'flight-path-waypoint-labels',

  // Corridor
  corridorBuffer: 'flight-path-corridor-buffer',
  corridorBufferOutline: 'flight-path-corridor-outline'
}

const SOURCE_IDS = {
  flightVolume: 'flight-volume-source',
  flightPath: 'flight-path-source',
  waypoints: 'flight-waypoints-source',
  corridorBuffer: 'flight-corridor-source'
}

// ============================================
// LAYER MANAGEMENT
// ============================================

/**
 * Add or update flight path 3D layers on the map
 */
export function useFlightPath3DLayers({
  map,
  mapLoaded,
  flightPath3DGeoJSON,
  flightGeography,
  corridorBuffer,
  maxAltitude = 120,
  is3DEnabled = false,
  selectedWaypointId = null,
  onWaypointClick = null,
  styleVersion = 0
}) {
  const markersRef = useRef([])

  // Clean up function
  const cleanupLayers = (mapInstance) => {
    if (!mapInstance || !mapInstance.getStyle) return

    // Remove layers
    Object.values(LAYER_IDS).forEach(layerId => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId)
      }
    })

    // Remove sources
    Object.values(SOURCE_IDS).forEach(sourceId => {
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId)
      }
    })

    // Remove waypoint markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }

  // Main effect for rendering layers
  useEffect(() => {
    if (!map || !mapLoaded) return

    // Clean up existing layers first
    cleanupLayers(map)

    // Add flight geography extrusion (3D volume)
    if (flightGeography?.coordinates?.[0]?.length >= 4 && is3DEnabled) {
      map.addSource(SOURCE_IDS.flightVolume, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { altitude: maxAltitude },
          geometry: flightGeography
        }
      })

      map.addLayer({
        id: LAYER_IDS.flightVolumeExtrusion,
        type: 'fill-extrusion',
        source: SOURCE_IDS.flightVolume,
        paint: {
          'fill-extrusion-color': '#22C55E',
          'fill-extrusion-height': maxAltitude,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.15
        }
      })
    }

    // Add corridor buffer if available
    if (corridorBuffer?.coordinates?.[0]?.length >= 4) {
      map.addSource(SOURCE_IDS.corridorBuffer, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: corridorBuffer
        }
      })

      map.addLayer({
        id: LAYER_IDS.corridorBuffer,
        type: 'fill',
        source: SOURCE_IDS.corridorBuffer,
        paint: {
          'fill-color': '#3B82F6',
          'fill-opacity': 0.1
        }
      })

      map.addLayer({
        id: LAYER_IDS.corridorBufferOutline,
        type: 'line',
        source: SOURCE_IDS.corridorBuffer,
        paint: {
          'line-color': '#3B82F6',
          'line-width': 2,
          'line-dasharray': [3, 2]
        }
      })
    }

    // Add flight path layers
    if (flightPath3DGeoJSON?.features?.length > 0) {
      map.addSource(SOURCE_IDS.flightPath, {
        type: 'geojson',
        data: flightPath3DGeoJSON
      })

      // Ground shadow (dashed line at ground level)
      map.addLayer({
        id: LAYER_IDS.groundShadow,
        type: 'line',
        source: SOURCE_IDS.flightPath,
        filter: ['==', ['get', 'type'], 'groundShadow'],
        paint: {
          'line-color': '#6B7280',
          'line-width': 1.5,
          'line-dasharray': [4, 4],
          'line-opacity': 0.5
        }
      })

      // Altitude poles (vertical lines)
      if (is3DEnabled) {
        map.addLayer({
          id: LAYER_IDS.altitudePoles,
          type: 'line',
          source: SOURCE_IDS.flightPath,
          filter: ['==', ['get', 'type'], 'altitudePole'],
          paint: {
            'line-color': '#9CA3AF',
            'line-width': 1,
            'line-dasharray': [2, 2],
            'line-opacity': 0.6
          }
        })
      }

      // Main flight path line
      map.addLayer({
        id: LAYER_IDS.flightPathLine,
        type: 'line',
        source: SOURCE_IDS.flightPath,
        filter: ['==', ['get', 'type'], 'flightPath'],
        paint: {
          'line-color': '#3B82F6',
          'line-width': 3,
          'line-opacity': 0.9
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        }
      })

      // Create custom markers for waypoints
      const waypointFeatures = flightPath3DGeoJSON.features.filter(
        f => f.properties?.type === 'waypointMarker'
      )

      waypointFeatures.forEach((feature, index) => {
        const { coordinates } = feature.geometry
        const { waypointId, order, label, waypointType, altitude } = feature.properties

        // Create marker element
        const el = document.createElement('div')
        el.className = 'flight-waypoint-marker'
        el.style.cssText = `
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${waypointType === 'start' ? '#22C55E' : waypointType === 'end' ? '#EF4444' : '#3B82F6'};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        `
        el.innerHTML = `${order + 1}`

        // Selection state
        if (selectedWaypointId === waypointId) {
          el.style.transform = 'scale(1.2)'
          el.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5), 0 2px 8px rgba(0,0,0,0.3)'
        }

        // Hover effects
        el.addEventListener('mouseenter', () => {
          if (selectedWaypointId !== waypointId) {
            el.style.transform = 'scale(1.1)'
          }
        })
        el.addEventListener('mouseleave', () => {
          if (selectedWaypointId !== waypointId) {
            el.style.transform = 'scale(1)'
          }
        })

        // Click handler
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onWaypointClick?.(waypointId, feature)
        })

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 20,
          closeButton: false
        }).setHTML(`
          <div style="font-size: 12px;">
            <p style="font-weight: 600; margin-bottom: 4px;">${label}</p>
            <p style="color: #666;">Altitude: ${altitude}m AGL</p>
            <p style="color: #666;">Type: ${waypointType}</p>
          </div>
        `)

        // Create marker at 2D position (Mapbox handles 3D projection)
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([coordinates[0], coordinates[1]])
          .setPopup(popup)
          .addTo(map)

        markersRef.current.push(marker)
      })
    }

    // Cleanup on unmount
    return () => {
      cleanupLayers(map)
    }
  }, [map, mapLoaded, flightPath3DGeoJSON, flightGeography, corridorBuffer, maxAltitude, is3DEnabled, selectedWaypointId, styleVersion])

  // Update selection state
  useEffect(() => {
    markersRef.current.forEach(marker => {
      const el = marker.getElement()
      const waypointId = el.dataset?.waypointId

      if (selectedWaypointId === waypointId) {
        el.style.transform = 'scale(1.2)'
        el.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5), 0 2px 8px rgba(0,0,0,0.3)'
      } else {
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
      }
    })
  }, [selectedWaypointId])

  return {
    cleanupLayers: () => cleanupLayers(map)
  }
}

// ============================================
// STANDALONE COMPONENT (for external use)
// ============================================

/**
 * FlightPath3DLayer component
 * Wraps the hook for use as a standalone component
 */
export function FlightPath3DLayer({
  map,
  mapLoaded,
  flightPath3DGeoJSON,
  flightGeography,
  corridorBuffer,
  maxAltitude,
  is3DEnabled,
  selectedWaypointId,
  onWaypointClick,
  styleVersion
}) {
  useFlightPath3DLayers({
    map,
    mapLoaded,
    flightPath3DGeoJSON,
    flightGeography,
    corridorBuffer,
    maxAltitude,
    is3DEnabled,
    selectedWaypointId,
    onWaypointClick,
    styleVersion
  })

  // This component doesn't render anything - it just manages map layers
  return null
}

export default FlightPath3DLayer
