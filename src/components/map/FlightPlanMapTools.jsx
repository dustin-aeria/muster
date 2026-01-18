/**
 * FlightPlanMapTools.jsx
 * Flight Plan specific map tools and helper components
 * 
 * Provides specialized tools for:
 * - Contingency volume calculation
 * - Ground risk buffer calculation
 * - Distance measurements
 * - Flight geography area display
 * - SORA volume visualization
 * 
 * @location src/components/map/FlightPlanMapTools.jsx
 * @action NEW
 */

import React, { useState, useMemo, useCallback } from 'react'
import {
  Calculator,
  Square,
  Ruler,
  AlertTriangle,
  Info,
  Navigation,
  Target,
  ArrowRight,
  Check,
  RefreshCw,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  calculatePolygonArea, 
  calculateDistance,
  getPolygonCenter 
} from '../../lib/mapDataStructures'

// ============================================
// CONTINGENCY VOLUME CALCULATOR
// ============================================

export function ContingencyVolumeCalculator({
  flightGeography,
  aircraftMaxSpeed = 20, // m/s default
  reactionTime = 15, // seconds - SORA standard
  onCalculate
}) {
  const [speed, setSpeed] = useState(aircraftMaxSpeed)
  const [time, setTime] = useState(reactionTime)
  
  const bufferDistance = useMemo(() => {
    return speed * time // meters
  }, [speed, time])
  
  const handleCalculate = () => {
    if (onCalculate) {
      onCalculate({
        bufferDistance,
        speed,
        time,
        method: 'sora-standard'
      })
    }
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Calculator className="w-4 h-4" />
        Contingency Volume Calculator
      </h4>
      
      <p className="text-sm text-gray-600 mb-4">
        SORA 2.5: CV = Aircraft max speed × reaction time
      </p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Max Aircraft Speed</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value) || 20)}
              className="input w-20 text-sm py-1.5"
            />
            <span className="text-sm text-gray-500">m/s</span>
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Reaction Time</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="60"
              value={time}
              onChange={(e) => setTime(Number(e.target.value) || 15)}
              className="input w-20 text-sm py-1.5"
            />
            <span className="text-sm text-gray-500">seconds</span>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-amber-50 rounded-lg mb-4">
        <p className="text-sm text-amber-800">
          <strong>Required Buffer:</strong> {bufferDistance} meters
        </p>
        <p className="text-xs text-amber-600 mt-1">
          ({speed} m/s × {time}s = {bufferDistance}m)
        </p>
      </div>
      
      {flightGeography && onCalculate && (
        <button
          onClick={handleCalculate}
          className="w-full px-4 py-2 bg-aeria-navy text-white rounded hover:bg-aeria-navy/90 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Contingency Volume
        </button>
      )}
      
      {!flightGeography && (
        <p className="text-sm text-gray-500 italic text-center">
          Draw flight geography first to generate contingency volume
        </p>
      )}
    </div>
  )
}

// ============================================
// GROUND RISK BUFFER CALCULATOR
// ============================================

export function GroundRiskBufferCalculator({
  contingencyVolume,
  maxAltitude = 120, // meters AGL
  onCalculate
}) {
  const [altitude, setAltitude] = useState(maxAltitude)
  
  // SORA: Ground risk buffer = max flight altitude added horizontally
  const bufferDistance = altitude
  
  const handleCalculate = () => {
    if (onCalculate) {
      onCalculate({
        bufferDistance,
        altitude,
        method: 'sora-standard'
      })
    }
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Square className="w-4 h-4" />
        Ground Risk Buffer Calculator
      </h4>
      
      <p className="text-sm text-gray-600 mb-4">
        SORA 2.5: GRB = Maximum planned altitude (horizontal expansion)
      </p>
      
      <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1">Max Planned Altitude AGL</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="400"
            value={altitude}
            onChange={(e) => setAltitude(Number(e.target.value) || 120)}
            className="input w-24 text-sm py-1.5"
          />
          <span className="text-sm text-gray-500">meters</span>
        </div>
      </div>
      
      <div className="p-3 bg-red-50 rounded-lg mb-4">
        <p className="text-sm text-red-800">
          <strong>Ground Risk Buffer:</strong> {bufferDistance} meters
        </p>
        <p className="text-xs text-red-600 mt-1">
          Added horizontally around contingency volume
        </p>
      </div>
      
      {contingencyVolume && onCalculate && (
        <button
          onClick={handleCalculate}
          className="w-full px-4 py-2 bg-aeria-navy text-white rounded hover:bg-aeria-navy/90 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Ground Risk Buffer
        </button>
      )}
      
      {!contingencyVolume && (
        <p className="text-sm text-gray-500 italic text-center">
          Generate contingency volume first
        </p>
      )}
    </div>
  )
}

// ============================================
// FLIGHT AREA MEASUREMENTS
// ============================================

export function FlightAreaMeasurements({ 
  flightGeography,
  contingencyVolume,
  groundRiskBuffer,
  launchPoint,
  recoveryPoint,
  pilotPosition
}) {
  const measurements = useMemo(() => {
    const data = {
      flightGeographyArea: null,
      contingencyVolumeArea: null,
      groundRiskBufferArea: null,
      launchToRecoveryDistance: null,
      pilotToLaunchDistance: null,
      pilotToRecoveryDistance: null,
      maxDistanceFromPilot: null
    }
    
    // Calculate areas
    if (flightGeography?.geometry?.coordinates?.[0]) {
      data.flightGeographyArea = calculatePolygonArea(flightGeography)
    }
    if (contingencyVolume?.geometry?.coordinates?.[0]) {
      data.contingencyVolumeArea = calculatePolygonArea(contingencyVolume)
    }
    if (groundRiskBuffer?.geometry?.coordinates?.[0]) {
      data.groundRiskBufferArea = calculatePolygonArea(groundRiskBuffer)
    }
    
    // Calculate distances
    if (launchPoint?.geometry?.coordinates && recoveryPoint?.geometry?.coordinates) {
      const [lng1, lat1] = launchPoint.geometry.coordinates
      const [lng2, lat2] = recoveryPoint.geometry.coordinates
      data.launchToRecoveryDistance = calculateDistance(
        { lat: lat1, lng: lng1 },
        { lat: lat2, lng: lng2 }
      )
    }
    
    if (pilotPosition?.geometry?.coordinates) {
      const [pilotLng, pilotLat] = pilotPosition.geometry.coordinates
      
      if (launchPoint?.geometry?.coordinates) {
        const [lng, lat] = launchPoint.geometry.coordinates
        data.pilotToLaunchDistance = calculateDistance(
          { lat: pilotLat, lng: pilotLng },
          { lat, lng }
        )
      }
      
      if (recoveryPoint?.geometry?.coordinates) {
        const [lng, lat] = recoveryPoint.geometry.coordinates
        data.pilotToRecoveryDistance = calculateDistance(
          { lat: pilotLat, lng: pilotLng },
          { lat, lng }
        )
      }
      
      // Estimate max distance from pilot to flight geography
      if (flightGeography?.geometry?.coordinates?.[0]) {
        const coords = flightGeography.geometry.coordinates[0]
        let maxDist = 0
        coords.forEach(([lng, lat]) => {
          const dist = calculateDistance(
            { lat: pilotLat, lng: pilotLng },
            { lat, lng }
          )
          if (dist > maxDist) maxDist = dist
        })
        data.maxDistanceFromPilot = maxDist
      }
    }
    
    return data
  }, [flightGeography, contingencyVolume, groundRiskBuffer, launchPoint, recoveryPoint, pilotPosition])
  
  const formatArea = (areaM2) => {
    if (!areaM2) return 'N/A'
    if (areaM2 >= 1000000) return `${(areaM2 / 1000000).toFixed(2)} km²`
    if (areaM2 >= 10000) return `${(areaM2 / 10000).toFixed(2)} ha`
    return `${areaM2.toFixed(0)} m²`
  }
  
  const formatDistance = (distanceM) => {
    if (!distanceM) return 'N/A'
    if (distanceM >= 1000) return `${(distanceM / 1000).toFixed(2)} km`
    return `${distanceM.toFixed(0)} m`
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Ruler className="w-4 h-4" />
        Flight Area Measurements
      </h4>
      
      <div className="space-y-4">
        {/* Areas */}
        <div>
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Areas</h5>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-green-50 rounded">
              <p className="text-xs text-green-600">Flight Geography</p>
              <p className="font-medium text-green-800">{formatArea(measurements.flightGeographyArea)}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded">
              <p className="text-xs text-amber-600">Contingency Vol.</p>
              <p className="font-medium text-amber-800">{formatArea(measurements.contingencyVolumeArea)}</p>
            </div>
            <div className="p-2 bg-red-50 rounded">
              <p className="text-xs text-red-600">Ground Risk Buffer</p>
              <p className="font-medium text-red-800">{formatArea(measurements.groundRiskBufferArea)}</p>
            </div>
          </div>
        </div>
        
        {/* Distances */}
        <div>
          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Distances</h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Navigation className="w-3 h-3" /> → <Target className="w-3 h-3" />
                Launch to Recovery
              </span>
              <span className="font-medium">{formatDistance(measurements.launchToRecoveryDistance)}</span>
            </div>
            
            {measurements.maxDistanceFromPilot && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Max from Pilot</span>
                <span className="font-medium">{formatDistance(measurements.maxDistanceFromPilot)}</span>
              </div>
            )}
            
            {measurements.pilotToLaunchDistance && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Pilot to Launch</span>
                <span className="font-medium">{formatDistance(measurements.pilotToLaunchDistance)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SORA VOLUME LAYER TOGGLES
// ============================================

export function SORAVolumeToggles({
  showFlightGeography = true,
  showContingencyVolume = true,
  showGroundRiskBuffer = true,
  onToggle
}) {
  const layers = [
    { 
      id: 'flightGeography', 
      label: 'Flight Geography', 
      color: '#22C55E',
      description: 'Intended flight area',
      visible: showFlightGeography
    },
    { 
      id: 'contingencyVolume', 
      label: 'Contingency Volume', 
      color: '#F59E0B',
      description: 'Buffer for abnormal situations',
      visible: showContingencyVolume
    },
    { 
      id: 'groundRiskBuffer', 
      label: 'Ground Risk Buffer', 
      color: '#EF4444',
      description: 'Extended ground risk area',
      visible: showGroundRiskBuffer
    }
  ]
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Layers className="w-4 h-4" />
        SORA Volumes
      </h4>
      
      <div className="space-y-2">
        {layers.map(layer => (
          <button
            key={layer.id}
            onClick={() => onToggle(layer.id)}
            className={`w-full flex items-center gap-3 p-2 rounded transition-colors ${
              layer.visible ? 'bg-gray-50' : 'opacity-50'
            }`}
          >
            <div 
              className="w-4 h-4 rounded-sm border-2"
              style={{ 
                backgroundColor: layer.visible ? `${layer.color}20` : 'transparent',
                borderColor: layer.color
              }}
            />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900">{layer.label}</p>
              <p className="text-xs text-gray-500">{layer.description}</p>
            </div>
            {layer.visible ? (
              <Eye className="w-4 h-4 text-gray-500" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// VLOS DISTANCE CHECKER
// ============================================

export function VLOSDistanceChecker({ 
  pilotPosition,
  flightGeography,
  maxVLOSDistance = 500 // meters - typical VLOS limit
}) {
  const checkResult = useMemo(() => {
    if (!pilotPosition?.geometry?.coordinates || !flightGeography?.geometry?.coordinates?.[0]) {
      return null
    }
    
    const [pilotLng, pilotLat] = pilotPosition.geometry.coordinates
    const coords = flightGeography.geometry.coordinates[0]
    
    let maxDistance = 0
    let farthestPoint = null
    
    coords.forEach(([lng, lat]) => {
      const dist = calculateDistance(
        { lat: pilotLat, lng: pilotLng },
        { lat, lng }
      )
      if (dist > maxDistance) {
        maxDistance = dist
        farthestPoint = [lng, lat]
      }
    })
    
    return {
      maxDistance,
      farthestPoint,
      withinVLOS: maxDistance <= maxVLOSDistance,
      exceedance: maxDistance > maxVLOSDistance ? maxDistance - maxVLOSDistance : 0
    }
  }, [pilotPosition, flightGeography, maxVLOSDistance])
  
  if (!checkResult) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-500">
          Set pilot position and draw flight geography to check VLOS distances
        </p>
      </div>
    )
  }
  
  return (
    <div className={`rounded-lg p-4 ${
      checkResult.withinVLOS 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-red-50 border border-red-200'
    }`}>
      <h4 className={`font-medium mb-2 flex items-center gap-2 ${
        checkResult.withinVLOS ? 'text-green-800' : 'text-red-800'
      }`}>
        {checkResult.withinVLOS ? (
          <Check className="w-4 h-4" />
        ) : (
          <AlertTriangle className="w-4 h-4" />
        )}
        VLOS Distance Check
      </h4>
      
      <p className={`text-sm ${checkResult.withinVLOS ? 'text-green-700' : 'text-red-700'}`}>
        Maximum distance from pilot: <strong>{checkResult.maxDistance.toFixed(0)}m</strong>
      </p>
      
      {checkResult.withinVLOS ? (
        <p className="text-sm text-green-600 mt-1">
          ✓ Within {maxVLOSDistance}m VLOS limit
        </p>
      ) : (
        <p className="text-sm text-red-600 mt-1">
          ✗ Exceeds VLOS limit by {checkResult.exceedance.toFixed(0)}m - Consider EVLOS/BVLOS
        </p>
      )}
    </div>
  )
}

// ============================================
// FLIGHT PLAN INSTRUCTIONS
// ============================================

export function FlightPlanInstructions() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-green-100 transition-colors"
      >
        <span className="font-medium text-green-900 flex items-center gap-2">
          <Info className="w-4 h-4" />
          How to Complete Flight Plan
        </span>
        <span className="text-sm text-green-600">{isOpen ? 'Hide' : 'Show'}</span>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 text-sm text-green-800">
          <div>
            <h5 className="font-medium mb-1">1. Set Launch Point</h5>
            <p>Click "Launch" tool, then click on the map where the RPAS will take off.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">2. Set Recovery Point</h5>
            <p>Click "Recovery" tool, then click where the RPAS will land. Can be same as launch.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">3. Set Pilot Position</h5>
            <p>Click "Pilot" tool, then mark where the remote pilot will operate from.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">4. Draw Flight Geography (Optional)</h5>
            <p>Click "Flight Area" tool, draw the intended flight area polygon. Double-click to complete.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">5. Select Operation Type</h5>
            <p>Choose VLOS, EVLOS, or BVLOS based on your planned operation.</p>
          </div>
          
          <div>
            <h5 className="font-medium mb-1">6. Configure Aircraft & Weather</h5>
            <p>Select aircraft, set weather minimums, and define contingency procedures.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default {
  ContingencyVolumeCalculator,
  GroundRiskBufferCalculator,
  FlightAreaMeasurements,
  SORAVolumeToggles,
  VLOSDistanceChecker,
  FlightPlanInstructions
}
