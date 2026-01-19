/**
 * ProjectNeedsAnalysis.jsx
 * CONOPS Needs Analysis - Pre-planning requirement determination (SORA Step 1)
 * 
 * Features:
 * - Mission Profile selection (10 types)
 * - Operating Environment assessment (7 types)
 * - Airspace complexity analysis (6 scenarios)
 * - Operation Type determination (VLOS/EVLOS/BVLOS)
 * - Coverage Requirements estimation
 * - Payload & Sensor recommendations
 * - Auto-generated results for regulatory pathway, crew, aircraft, equipment
 * 
 * @location src/components/projects/ProjectNeedsAnalysis.jsx
 * @action NEW
 */

import React, { useState, useMemo, useCallback } from 'react'
import {
  Target,
  MapPin,
  Plane,
  Sun,
  Moon,
  Sunrise,
  Eye,
  Radio,
  Camera,
  Thermometer,
  Gauge,
  Radar,
  Box,
  Wind,
  Users,
  FileCheck,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  Building,
  TreePine,
  Mountain,
  Wheat,
  HardHat,
  Clapperboard,
  ShieldCheck,
  Leaf,
  Pickaxe,
  Route,
  Navigation,
  Clipboard,
  ListChecks,
  Wrench,
  FileText,
  Award,
  ClipboardCheck,
  Zap,
  Layers,
  Crosshair,
  ArrowRight,
  Calculator,
  Save,
  RefreshCw
} from 'lucide-react'

// ============================================
// CONFIGURATION DATA
// ============================================

const MISSION_PROFILES = {
  inspection: {
    id: 'inspection',
    name: 'Infrastructure Inspection',
    icon: Building,
    description: 'Power lines, pipelines, bridges, towers, buildings, solar farms',
    typicalPayloads: ['rgb_camera', 'thermal', 'zoom_camera'],
    considerations: [
      'Proximity to energized infrastructure',
      'Electromagnetic interference potential',
      'Access restrictions and permits',
      'Weather windows for thermal imaging'
    ],
    deliverables: ['Inspection report', 'Annotated imagery', 'Thermal anomaly report', 'Asset condition assessment'],
    typicalAltitude: '30-120m AGL',
    typicalDuration: '20-45 min per flight',
    recommendedOperationType: 'VLOS',
    riskFactors: ['proximity_operations', 'critical_infrastructure', 'electromagnetic_interference']
  },
  survey_mapping: {
    id: 'survey_mapping',
    name: 'Survey & Mapping',
    icon: MapPin,
    description: 'Topographic surveys, volumetrics, orthomosaics, 3D modeling',
    typicalPayloads: ['rgb_camera', 'multispectral', 'lidar'],
    considerations: [
      'Ground control point placement',
      'Overlap and GSD requirements',
      'Weather conditions for photogrammetry',
      'Coordinate system and datum requirements'
    ],
    deliverables: ['Orthomosaic', 'Digital elevation model', 'Point cloud', 'Volumetric calculations', 'Survey report'],
    typicalAltitude: '60-120m AGL',
    typicalDuration: '15-30 min per sortie',
    recommendedOperationType: 'VLOS',
    riskFactors: ['large_area_coverage', 'altitude_requirements']
  },
  construction: {
    id: 'construction',
    name: 'Construction Progress',
    icon: HardHat,
    description: 'Site progress monitoring, stockpile measurement, safety documentation',
    typicalPayloads: ['rgb_camera', 'zoom_camera'],
    considerations: [
      'Active construction site hazards',
      'Coordination with site management',
      'Worker proximity and notification',
      'Equipment movement scheduling'
    ],
    deliverables: ['Progress photos', 'Site overview video', 'Stockpile volumes', 'Time-lapse compilation'],
    typicalAltitude: '60-100m AGL',
    typicalDuration: '15-25 min per flight',
    recommendedOperationType: 'VLOS',
    riskFactors: ['active_worksite', 'personnel_proximity', 'dynamic_environment']
  },
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    icon: Wheat,
    description: 'Crop health, irrigation monitoring, precision agriculture, livestock',
    typicalPayloads: ['multispectral', 'thermal', 'rgb_camera'],
    considerations: [
      'Crop growth stage timing',
      'Spray drift considerations',
      'Wildlife and livestock presence',
      'Seasonal access restrictions'
    ],
    deliverables: ['NDVI maps', 'Crop health report', 'Irrigation assessment', 'Field boundary mapping'],
    typicalAltitude: '60-120m AGL',
    typicalDuration: '20-40 min per flight',
    recommendedOperationType: 'VLOS',
    riskFactors: ['large_area_coverage', 'wildlife_interaction']
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Response',
    icon: Zap,
    description: 'Search and rescue, disaster assessment, wildfire monitoring',
    typicalPayloads: ['thermal', 'rgb_camera', 'zoom_camera', 'spotlight'],
    considerations: [
      'Coordination with emergency services',
      'Dynamic airspace restrictions',
      'Time-critical operations',
      'Communication with incident command'
    ],
    deliverables: ['Search area coverage', 'Thermal detection report', 'Situational awareness imagery', 'Damage assessment'],
    typicalAltitude: '30-150m AGL',
    typicalDuration: '20-45 min per flight',
    recommendedOperationType: 'BVLOS',
    riskFactors: ['time_critical', 'dynamic_airspace', 'coordination_complexity']
  },
  media: {
    id: 'media',
    name: 'Media & Film',
    icon: Clapperboard,
    description: 'Aerial cinematography, photography, real estate, events',
    typicalPayloads: ['rgb_camera', 'cinema_camera', 'gimbal'],
    considerations: [
      'Shot planning and storyboarding',
      'Crowd and event coordination',
      'Lighting conditions',
      'Noise considerations'
    ],
    deliverables: ['Edited video', 'Still photography', 'Raw footage', 'Aerial panoramas'],
    typicalAltitude: '10-120m AGL',
    typicalDuration: '10-20 min per flight',
    recommendedOperationType: 'VLOS',
    riskFactors: ['public_proximity', 'event_coordination', 'noise_sensitive']
  },
  security: {
    id: 'security',
    name: 'Security & Surveillance',
    icon: ShieldCheck,
    description: 'Perimeter patrol, event security, asset monitoring',
    typicalPayloads: ['rgb_camera', 'thermal', 'zoom_camera', 'spotlight'],
    considerations: [
      'Privacy regulations compliance',
      'Communication with security team',
      'Coverage patterns and schedules',
      'Night operations requirements'
    ],
    deliverables: ['Patrol coverage report', 'Incident documentation', 'Thermal scans', 'Security assessment'],
    typicalAltitude: '30-90m AGL',
    typicalDuration: '20-35 min per flight',
    recommendedOperationType: 'VLOS',
    riskFactors: ['night_operations', 'privacy_considerations', 'continuous_operations']
  },
  environmental: {
    id: 'environmental',
    name: 'Environmental Monitoring',
    icon: Leaf,
    description: 'Wildlife surveys, habitat mapping, erosion monitoring, spill detection',
    typicalPayloads: ['multispectral', 'thermal', 'rgb_camera', 'gas_sensor'],
    considerations: [
      'Wildlife disturbance protocols',
      'Seasonal nesting restrictions',
      'Habitat sensitivity',
      'Regulatory permits for wildlife'
    ],
    deliverables: ['Wildlife count report', 'Habitat mapping', 'Change detection analysis', 'Environmental assessment'],
    typicalAltitude: '60-150m AGL',
    typicalDuration: '25-45 min per flight',
    recommendedOperationType: 'VLOS',
    riskFactors: ['wildlife_disturbance', 'sensitive_habitat', 'permit_requirements']
  },
  mining: {
    id: 'mining',
    name: 'Mining Operations',
    icon: Pickaxe,
    description: 'Pit surveys, stockpile measurement, haul road inspection, blast monitoring',
    typicalPayloads: ['rgb_camera', 'lidar', 'multispectral'],
    considerations: [
      'Blast schedules and exclusion zones',
      'Dust and particulate interference',
      'Equipment movement coordination',
      'Pit wall stability'
    ],
    deliverables: ['Volumetric calculations', 'Pit survey', 'Haul road assessment', 'Blast damage analysis'],
    typicalAltitude: '60-120m AGL',
    typicalDuration: '20-40 min per flight',
    recommendedOperationType: 'VLOS',
    riskFactors: ['active_mining', 'blast_coordination', 'dust_interference']
  },
  linear: {
    id: 'linear',
    name: 'Linear Infrastructure',
    icon: Route,
    description: 'Pipelines, transmission lines, railways, roads, corridors',
    typicalPayloads: ['rgb_camera', 'thermal', 'lidar', 'gas_sensor'],
    considerations: [
      'ROW access and permissions',
      'Crossing agreements',
      'Segment planning and logistics',
      'Emergency landing zones along route'
    ],
    deliverables: ['Corridor assessment', 'Encroachment report', 'Condition survey', 'Thermal anomaly detection'],
    typicalAltitude: '30-90m AGL',
    typicalDuration: '25-45 min per segment',
    recommendedOperationType: 'BVLOS',
    riskFactors: ['extended_range', 'corridor_operations', 'multiple_jurisdictions']
  }
}

const OPERATING_ENVIRONMENTS = {
  controlled: {
    id: 'controlled',
    name: 'Controlled Site',
    description: 'Private property with access control, no uninvolved persons',
    populationCategory: 'controlled',
    soraCategory: 'Controlled ground area',
    characteristics: [
      'Fenced or otherwise secured perimeter',
      'Access controlled by operator or client',
      'All persons aware of operations',
      'No uninvolved third parties'
    ],
    examples: ['Secured industrial site', 'Private farm with gates', 'Closed construction site'],
    typicalSAIL: 'I-II'
  },
  remote: {
    id: 'remote',
    name: 'Remote/Uninhabited',
    description: 'Very low population density, minimal infrastructure',
    populationCategory: 'sparse',
    soraCategory: 'Remote/Rural',
    characteristics: [
      'Population density < 50 people/km²',
      'Minimal infrastructure',
      'Limited road access',
      'Primarily natural terrain'
    ],
    examples: ['Remote wilderness', 'Offshore areas', 'Desert regions'],
    typicalSAIL: 'I-II'
  },
  sparsely: {
    id: 'sparsely',
    name: 'Sparsely Populated',
    description: 'Rural areas with scattered residences and light traffic',
    populationCategory: 'sparse',
    soraCategory: 'Sparsely populated',
    characteristics: [
      'Population density 50-500 people/km²',
      'Scattered residences',
      'Agricultural land use',
      'Light vehicle traffic'
    ],
    examples: ['Agricultural areas', 'Rural communities', 'Light industrial zones'],
    typicalSAIL: 'II-III'
  },
  suburban: {
    id: 'suburban',
    name: 'Suburban',
    description: 'Residential areas with moderate population density',
    populationCategory: 'moderate',
    soraCategory: 'Suburban/Residential',
    characteristics: [
      'Population density 500-2000 people/km²',
      'Residential neighborhoods',
      'Local commercial areas',
      'Moderate vehicle traffic'
    ],
    examples: ['Residential neighborhoods', 'Small town centers', 'Light commercial areas'],
    typicalSAIL: 'III-IV'
  },
  urban: {
    id: 'urban',
    name: 'Urban',
    description: 'Dense urban areas with high population and infrastructure',
    populationCategory: 'populated',
    soraCategory: 'Urban/Dense',
    characteristics: [
      'Population density > 2000 people/km²',
      'Multi-story buildings',
      'High pedestrian traffic',
      'Complex infrastructure'
    ],
    examples: ['City centers', 'Downtown areas', 'Major commercial districts'],
    typicalSAIL: 'IV-VI'
  },
  gathering: {
    id: 'gathering',
    name: 'Assembly of People',
    description: 'Events, gatherings, or areas with concentrated populations',
    populationCategory: 'gathering',
    soraCategory: 'Assembly of people',
    characteristics: [
      'Temporary or permanent gatherings',
      'High local density during events',
      'Limited dispersal capability',
      'Public event considerations'
    ],
    examples: ['Sporting events', 'Concerts', 'Public gatherings', 'Markets'],
    typicalSAIL: 'V-VI'
  },
  mixed: {
    id: 'mixed',
    name: 'Mixed Environment',
    description: 'Operations spanning multiple environment types',
    populationCategory: 'moderate',
    soraCategory: 'Mixed',
    characteristics: [
      'Varying population density',
      'Multiple land use types',
      'Requires per-segment assessment',
      'Conservative approach recommended'
    ],
    examples: ['Linear infrastructure', 'Large project areas', 'Corridor operations'],
    typicalSAIL: 'III-V'
  }
}

const AIRSPACE_SCENARIOS = {
  uncontrolled_rural: {
    id: 'uncontrolled_rural',
    name: 'Uncontrolled Rural',
    class: 'G',
    description: 'Class G airspace in rural areas, no nearby aerodromes',
    complexity: 'low',
    requirements: [
      'No ATC authorization required',
      'Standard altitude limits apply',
      'NOTAM recommended for extended operations'
    ],
    arcBase: 'a'
  },
  uncontrolled_suburban: {
    id: 'uncontrolled_suburban',
    name: 'Uncontrolled Suburban',
    class: 'G',
    description: 'Class G airspace near populated areas',
    complexity: 'low',
    requirements: [
      'No ATC authorization required',
      'Maintain awareness of local traffic',
      'Consider helipad proximity'
    ],
    arcBase: 'a'
  },
  controlled_transition: {
    id: 'controlled_transition',
    name: 'Controlled Airspace (Transition)',
    class: 'E',
    description: 'Class E transition areas or control zones',
    complexity: 'medium',
    requirements: [
      'ATC authorization required',
      'NAV CANADA coordination',
      'NOTAM required',
      'Two-way communication capability recommended'
    ],
    arcBase: 'b'
  },
  near_aerodrome: {
    id: 'near_aerodrome',
    name: 'Near Aerodrome',
    class: 'D/E',
    description: 'Within 5.6km of controlled aerodrome',
    complexity: 'medium',
    requirements: [
      'Site-specific authorization from NAV CANADA',
      'Coordination with aerodrome operator',
      'NOTAM required',
      'Real-time communication capability'
    ],
    arcBase: 'b'
  },
  control_zone: {
    id: 'control_zone',
    name: 'Control Zone',
    class: 'C/D',
    description: 'Within airport control zone',
    complexity: 'high',
    requirements: [
      'SFOC likely required',
      'Direct coordination with ATC',
      'NOTAM required',
      'Real-time ATC communication',
      'Transponder recommended'
    ],
    arcBase: 'c'
  },
  restricted_special: {
    id: 'restricted_special',
    name: 'Restricted/Special Use',
    class: 'F',
    description: 'Military, restricted, or special use airspace',
    complexity: 'high',
    requirements: [
      'Special authorization required',
      'Coordination with controlling authority',
      'Time-limited operations',
      'Additional security clearance may be required'
    ],
    arcBase: 'c'
  }
}

const OPERATION_TYPES = {
  vlos_day: {
    id: 'vlos_day',
    name: 'VLOS - Day',
    icon: Sun,
    description: 'Visual line of sight during daylight hours',
    requirements: ['Basic or Advanced certificate', 'Unaided visual contact maintained'],
    complexity: 'standard',
    sailModifier: 0
  },
  vlos_twilight: {
    id: 'vlos_twilight',
    name: 'VLOS - Twilight',
    icon: Sunrise,
    description: 'Visual line of sight during civil twilight',
    requirements: ['Advanced certificate', 'Anti-collision lighting', 'Enhanced visibility measures'],
    complexity: 'enhanced',
    sailModifier: 0
  },
  vlos_night: {
    id: 'vlos_night',
    name: 'VLOS - Night',
    icon: Moon,
    description: 'Visual line of sight during night operations',
    requirements: ['SFOC required', 'Anti-collision lighting', 'Night-specific training', 'Enhanced procedures'],
    complexity: 'advanced',
    sailModifier: 1
  },
  evlos_day: {
    id: 'evlos_day',
    name: 'EVLOS - Day',
    icon: Eye,
    description: 'Extended visual line of sight with visual observers',
    requirements: ['Advanced certificate', 'Qualified visual observers', 'Communication protocols'],
    complexity: 'enhanced',
    sailModifier: 0
  },
  bvlos_day: {
    id: 'bvlos_day',
    name: 'BVLOS - Day',
    icon: Radio,
    description: 'Beyond visual line of sight daytime operations',
    requirements: ['SFOC required', 'Detect and avoid capability', 'Redundant C2 link', 'Emergency procedures'],
    complexity: 'advanced',
    sailModifier: 1
  },
  bvlos_night: {
    id: 'bvlos_night',
    name: 'BVLOS - Night',
    icon: Radio,
    description: 'Beyond visual line of sight night operations',
    requirements: ['SFOC required', 'Full DAA system', 'Enhanced lighting', 'Night BVLOS procedures'],
    complexity: 'high',
    sailModifier: 2
  }
}

const COVERAGE_TYPES = {
  point: {
    id: 'point',
    name: 'Point/Asset',
    description: 'Single structure or asset inspection',
    areaRange: '< 1 ha',
    flightEstimate: '1-2 flights',
    platformSuggestion: 'Multi-rotor'
  },
  small_area: {
    id: 'small_area',
    name: 'Small Area',
    description: 'Limited area survey or inspection',
    areaRange: '1-10 ha',
    flightEstimate: '2-4 flights',
    platformSuggestion: 'Multi-rotor'
  },
  medium_area: {
    id: 'medium_area',
    name: 'Medium Area',
    description: 'Site-wide coverage or moderate survey',
    areaRange: '10-50 ha',
    flightEstimate: '4-8 flights',
    platformSuggestion: 'Multi-rotor or VTOL'
  },
  large_area: {
    id: 'large_area',
    name: 'Large Area',
    description: 'Extensive area mapping or survey',
    areaRange: '50-200 ha',
    flightEstimate: '8-15 flights',
    platformSuggestion: 'VTOL or Fixed-wing'
  },
  very_large: {
    id: 'very_large',
    name: 'Very Large Area',
    description: 'Regional or district-scale coverage',
    areaRange: '200-1000 ha',
    flightEstimate: '15-30+ flights',
    platformSuggestion: 'Fixed-wing or VTOL'
  },
  linear_short: {
    id: 'linear_short',
    name: 'Linear - Short',
    description: 'Short corridor or linear feature',
    areaRange: '< 5 km',
    flightEstimate: '1-3 flights',
    platformSuggestion: 'Multi-rotor'
  },
  linear_long: {
    id: 'linear_long',
    name: 'Linear - Extended',
    description: 'Extended corridor or pipeline',
    areaRange: '5-50+ km',
    flightEstimate: '5-20+ flights',
    platformSuggestion: 'VTOL or Fixed-wing (BVLOS)'
  }
}

const PAYLOAD_TYPES = {
  rgb_camera: {
    id: 'rgb_camera',
    name: 'RGB Camera',
    icon: Camera,
    description: 'Standard visual spectrum camera',
    weight: 'light',
    typicalWeight: '100-500g',
    applications: ['Photography', 'Videography', 'Mapping', 'Inspection'],
    dataOutput: 'Images, Video'
  },
  zoom_camera: {
    id: 'zoom_camera',
    name: 'Zoom/Optical Camera',
    icon: Camera,
    description: 'High-zoom optical camera for detailed inspection',
    weight: 'medium',
    typicalWeight: '300-800g',
    applications: ['Detailed inspection', 'Wildlife observation', 'Security'],
    dataOutput: 'High-resolution images, Video'
  },
  thermal: {
    id: 'thermal',
    name: 'Thermal Infrared',
    icon: Thermometer,
    description: 'Thermal imaging camera',
    weight: 'medium',
    typicalWeight: '200-600g',
    applications: ['Electrical inspection', 'Search and rescue', 'Building assessment', 'Wildlife'],
    dataOutput: 'Radiometric images, FLIR video'
  },
  multispectral: {
    id: 'multispectral',
    name: 'Multispectral',
    icon: Layers,
    description: 'Multi-band spectral imaging for agriculture/environment',
    weight: 'medium',
    typicalWeight: '200-500g',
    applications: ['Crop health', 'Environmental monitoring', 'Vegetation analysis'],
    dataOutput: 'Multi-band imagery, NDVI/NDRE maps'
  },
  lidar: {
    id: 'lidar',
    name: 'LiDAR',
    icon: Radar,
    description: 'Light Detection and Ranging sensor',
    weight: 'heavy',
    typicalWeight: '500-2000g',
    applications: ['Topographic survey', 'Forestry', 'Corridor mapping', 'Volumetrics'],
    dataOutput: 'Point cloud, DEM, DTM'
  },
  gas_sensor: {
    id: 'gas_sensor',
    name: 'Gas Detection',
    icon: Wind,
    description: 'Methane or multi-gas detection sensor',
    weight: 'medium',
    typicalWeight: '200-800g',
    applications: ['Pipeline inspection', 'Environmental monitoring', 'Industrial safety'],
    dataOutput: 'Gas concentration data, Leak detection'
  },
  cinema_camera: {
    id: 'cinema_camera',
    name: 'Cinema Camera',
    icon: Clapperboard,
    description: 'Professional cinema-grade camera system',
    weight: 'heavy',
    typicalWeight: '1000-3000g',
    applications: ['Film production', 'Commercial video', 'Broadcast'],
    dataOutput: 'RAW video, ProRes'
  },
  spotlight: {
    id: 'spotlight',
    name: 'Spotlight/Illumination',
    icon: Zap,
    description: 'High-intensity illumination for night operations',
    weight: 'medium',
    typicalWeight: '300-800g',
    applications: ['Search and rescue', 'Night inspection', 'Security'],
    dataOutput: 'N/A (illumination)'
  },
  delivery: {
    id: 'delivery',
    name: 'Delivery/Drop System',
    icon: Box,
    description: 'Payload delivery or release mechanism',
    weight: 'varies',
    typicalWeight: '200-2000g',
    applications: ['Medical delivery', 'Supply drop', 'Emergency response'],
    dataOutput: 'Delivery confirmation'
  },
  gimbal: {
    id: 'gimbal',
    name: 'Gimbal System',
    icon: Navigation,
    description: 'Stabilized gimbal mount for cameras',
    weight: 'medium',
    typicalWeight: '300-1000g',
    applications: ['Stabilized video', 'Inspection', 'Cinematography'],
    dataOutput: 'N/A (stabilization)'
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getWeightClass = (payloadIds) => {
  const weights = payloadIds.map(id => PAYLOAD_TYPES[id]?.weight || 'light')
  if (weights.includes('heavy')) return 'heavy'
  if (weights.filter(w => w === 'medium').length >= 2) return 'heavy'
  if (weights.includes('medium')) return 'medium'
  return 'light'
}

const determineRegulatoryPathway = (analysis) => {
  const { operationType, environment, airspace, payloads } = analysis
  
  // Check for SFOC requirements
  const sfocIndicators = [
    operationType?.includes('night'),
    operationType?.includes('bvlos'),
    airspace === 'control_zone' || airspace === 'restricted_special',
    environment === 'gathering',
    environment === 'urban' && operationType !== 'vlos_day'
  ]
  
  if (sfocIndicators.filter(Boolean).length >= 1) {
    return {
      pathway: 'SFOC',
      reason: 'Special Flight Operations Certificate required due to: ' + 
        [
          operationType?.includes('night') && 'Night operations',
          operationType?.includes('bvlos') && 'BVLOS operations',
          (airspace === 'control_zone' || airspace === 'restricted_special') && 'Complex airspace',
          environment === 'gathering' && 'Operations over gatherings',
          (environment === 'urban' && operationType !== 'vlos_day') && 'Urban operations'
        ].filter(Boolean).join(', '),
      complexity: 'high'
    }
  }
  
  // Check for Advanced operations
  const advancedIndicators = [
    environment === 'suburban' || environment === 'urban',
    airspace === 'controlled_transition' || airspace === 'near_aerodrome',
    operationType === 'evlos_day' || operationType === 'vlos_twilight'
  ]
  
  if (advancedIndicators.filter(Boolean).length >= 1) {
    return {
      pathway: 'Advanced',
      reason: 'Advanced operations certificate required for operations in ' +
        [
          (environment === 'suburban' || environment === 'urban') && 'populated areas',
          (airspace === 'controlled_transition' || airspace === 'near_aerodrome') && 'controlled airspace',
          (operationType === 'evlos_day' || operationType === 'vlos_twilight') && 'EVLOS/twilight operations'
        ].filter(Boolean).join(', '),
      complexity: 'medium'
    }
  }
  
  // Basic operations
  return {
    pathway: 'Basic',
    reason: 'Basic operations in uncontrolled airspace over unpopulated areas',
    complexity: 'low'
  }
}

const estimateSAIL = (analysis) => {
  const { operationType, environment, airspace } = analysis
  
  // Base SAIL from environment
  let baseSAIL = 1
  switch (environment) {
    case 'controlled': baseSAIL = 1; break
    case 'remote': baseSAIL = 1; break
    case 'sparsely': baseSAIL = 2; break
    case 'suburban': baseSAIL = 3; break
    case 'urban': baseSAIL = 4; break
    case 'gathering': baseSAIL = 5; break
    case 'mixed': baseSAIL = 3; break
    default: baseSAIL = 2
  }
  
  // Airspace modifier
  let airspaceModifier = 0
  if (airspace === 'control_zone' || airspace === 'restricted_special') {
    airspaceModifier = 1
  }
  
  // Operation type modifier
  const opMod = OPERATION_TYPES[operationType]?.sailModifier || 0
  
  const finalSAIL = Math.min(6, Math.max(1, baseSAIL + airspaceModifier + opMod))
  
  return {
    level: ['I', 'II', 'III', 'IV', 'V', 'VI'][finalSAIL - 1],
    numeric: finalSAIL,
    factors: {
      environment: baseSAIL,
      airspace: airspaceModifier,
      operationType: opMod
    }
  }
}

const generateCrewRequirements = (analysis) => {
  const { missionProfile, operationType, coverage, environment } = analysis
  const requirements = {
    pic: { required: true, count: 1, notes: [] },
    vo: { required: false, count: 0, notes: [] },
    payloadOperator: { required: false, count: 0, notes: [] },
    groundSupport: { required: false, count: 0, notes: [] }
  }
  
  // Visual Observer requirements
  if (operationType?.includes('evlos')) {
    requirements.vo.required = true
    requirements.vo.count = 1
    requirements.vo.notes.push('Required for EVLOS operations')
  }
  
  if (coverage === 'large_area' || coverage === 'very_large' || coverage === 'linear_long') {
    requirements.vo.required = true
    requirements.vo.count = Math.max(requirements.vo.count, 2)
    requirements.vo.notes.push('Recommended for large area operations')
  }
  
  // Payload Operator
  const complexPayloads = ['lidar', 'multispectral', 'cinema_camera', 'gas_sensor']
  const selectedPayloads = analysis.payloads || []
  if (selectedPayloads.some(p => complexPayloads.includes(p))) {
    requirements.payloadOperator.required = true
    requirements.payloadOperator.count = 1
    requirements.payloadOperator.notes.push('Complex payload requires dedicated operator')
  }
  
  // Ground Support
  if (environment === 'urban' || environment === 'gathering') {
    requirements.groundSupport.required = true
    requirements.groundSupport.count = 1
    requirements.groundSupport.notes.push('Crowd/traffic management in populated areas')
  }
  
  if (missionProfile === 'emergency' || missionProfile === 'security') {
    requirements.groundSupport.count = Math.max(requirements.groundSupport.count, 2)
    requirements.groundSupport.notes.push('Coordination with emergency/security services')
  }
  
  return requirements
}

const generateAircraftRequirements = (analysis) => {
  const { missionProfile, coverage, payloads, operationType } = analysis
  const profile = MISSION_PROFILES[missionProfile]
  const coverageInfo = COVERAGE_TYPES[coverage]
  const weightClass = getWeightClass(payloads || [])
  
  // Determine platform type
  let platformType = 'Multi-rotor'
  if (coverage === 'very_large' || coverage === 'linear_long') {
    platformType = 'Fixed-wing or VTOL'
  } else if (coverage === 'large_area' || coverage === 'linear_short') {
    platformType = 'Multi-rotor or VTOL'
  }
  
  // Payload capacity
  let minCapacity = '250g'
  if (weightClass === 'medium') minCapacity = '500g'
  if (weightClass === 'heavy') minCapacity = '1kg+'
  
  // Flight time
  let minFlightTime = '20 min'
  if (['large_area', 'very_large', 'linear_long'].includes(coverage)) {
    minFlightTime = '30+ min'
  }
  
  // Special features
  const features = []
  if (operationType?.includes('night') || operationType?.includes('twilight')) {
    features.push('Anti-collision lighting')
  }
  if (operationType?.includes('bvlos')) {
    features.push('Redundant C2 link', 'Return-to-home', 'Geofencing')
  }
  if (payloads?.includes('thermal')) {
    features.push('Gimbal compatibility')
  }
  if (payloads?.includes('lidar')) {
    features.push('Stable platform', 'High payload capacity')
  }
  if (missionProfile === 'emergency') {
    features.push('Quick deployment', 'All-weather capability')
  }
  
  return {
    platformType,
    minCapacity,
    minFlightTime,
    features,
    recommendation: coverageInfo?.platformSuggestion || platformType
  }
}

const generateEquipmentChecklist = (analysis) => {
  const { missionProfile, operationType, payloads, environment, airspace } = analysis
  
  const equipment = {
    flightEquipment: [
      { item: 'Aircraft (primary)', required: true },
      { item: 'Spare batteries (min 3)', required: true },
      { item: 'Battery charger', required: true },
      { item: 'Controller', required: true },
      { item: 'Mobile device with flight app', required: true },
      { item: 'Landing pad', required: true }
    ],
    safetyEquipment: [
      { item: 'Fire extinguisher', required: true },
      { item: 'First aid kit', required: true },
      { item: 'High-visibility vest', required: true },
      { item: 'Safety cones/tape', required: environment !== 'remote' },
      { item: 'Hard hat', required: ['construction', 'mining', 'inspection'].includes(missionProfile) }
    ],
    communicationEquipment: [
      { item: 'Two-way radio', required: true },
      { item: 'Mobile phone', required: true },
      { item: 'Aviation radio', required: ['control_zone', 'near_aerodrome', 'controlled_transition'].includes(airspace) }
    ],
    documentationEquipment: [
      { item: 'Pilot certificate', required: true },
      { item: 'Aircraft registration', required: true },
      { item: 'Insurance documentation', required: true },
      { item: 'Site authorization', required: environment !== 'controlled' },
      { item: 'SFOC (if applicable)', required: operationType?.includes('bvlos') || operationType?.includes('night') }
    ],
    payloadEquipment: [],
    additionalEquipment: []
  }
  
  // Add payload-specific equipment
  if (payloads?.includes('thermal')) {
    equipment.payloadEquipment.push({ item: 'Thermal calibration target', required: false })
  }
  if (payloads?.includes('lidar')) {
    equipment.payloadEquipment.push(
      { item: 'LiDAR sensor', required: true },
      { item: 'Ground control points', required: true },
      { item: 'RTK base station', required: false }
    )
  }
  if (payloads?.includes('multispectral')) {
    equipment.payloadEquipment.push(
      { item: 'Calibration panel', required: true },
      { item: 'GPS ground control', required: true }
    )
  }
  
  // Mission-specific additions
  if (missionProfile === 'survey_mapping') {
    equipment.additionalEquipment.push(
      { item: 'Ground control points', required: true },
      { item: 'RTK/PPK receiver', required: false },
      { item: 'Measuring tape/rod', required: false }
    )
  }
  if (missionProfile === 'emergency') {
    equipment.additionalEquipment.push(
      { item: 'Spotlight/floodlight', required: operationType?.includes('night') },
      { item: 'Emergency beacon', required: false },
      { item: 'Incident command radio', required: true }
    )
  }
  if (operationType?.includes('night')) {
    equipment.additionalEquipment.push(
      { item: 'Headlamp/flashlight', required: true },
      { item: 'Reflective markers', required: true },
      { item: 'Illuminated landing pad', required: true }
    )
  }
  
  return equipment
}

const generateDocumentationRequirements = (analysis) => {
  const { operationType, environment, airspace } = analysis
  const regulatory = determineRegulatoryPathway(analysis)
  
  const docs = {
    required: [
      'Pilot certificate (appropriate level)',
      'Aircraft registration',
      'Proof of insurance',
      'Flight log/records'
    ],
    recommended: [
      'Site risk assessment',
      'Emergency response plan',
      'Client authorization/contract'
    ],
    operational: [
      'Pre-flight checklist',
      'Daily flight log',
      'Weather briefing documentation'
    ]
  }
  
  // Add based on regulatory pathway
  if (regulatory.pathway === 'Advanced') {
    docs.required.push(
      'Advanced pilot certificate',
      'NAV CANADA authorization (if applicable)',
      'Site survey documentation'
    )
  }
  
  if (regulatory.pathway === 'SFOC') {
    docs.required.push(
      'SFOC (Special Flight Operations Certificate)',
      'SFOC-specific operating procedures',
      'Crew qualification records',
      'Aircraft airworthiness documentation'
    )
  }
  
  if (['control_zone', 'near_aerodrome', 'controlled_transition'].includes(airspace)) {
    docs.required.push(
      'NAV CANADA authorization',
      'NOTAM request/confirmation'
    )
  }
  
  if (operationType?.includes('bvlos')) {
    docs.required.push(
      'BVLOS-specific procedures',
      'DAA system documentation',
      'C2 link specifications'
    )
  }
  
  return docs
}

// ============================================
// UI COMPONENTS
// ============================================

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, badge = null, complete = null }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-aeria-navy/10 text-aeria-navy rounded-full">
              {badge}
            </span>
          )}
          {complete !== null && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              complete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {complete ? 'Complete' : 'Incomplete'}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

function SelectionCard({ item, selected, onSelect, icon: Icon }) {
  return (
    <button
      onClick={() => onSelect(item.id)}
      className={`p-4 rounded-lg border-2 text-left transition-all ${
        selected 
          ? 'border-aeria-navy bg-aeria-navy/5' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <Icon className={`w-6 h-6 flex-shrink-0 ${selected ? 'text-aeria-navy' : 'text-gray-400'}`} />
        ) : item.icon ? (
          <item.icon className={`w-6 h-6 flex-shrink-0 ${selected ? 'text-aeria-navy' : 'text-gray-400'}`} />
        ) : null}
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${selected ? 'text-aeria-navy' : 'text-gray-900'}`}>
            {item.name}
          </p>
          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
        </div>
        {selected && (
          <CheckCircle2 className="w-5 h-5 text-aeria-navy flex-shrink-0" />
        )}
      </div>
    </button>
  )
}

function InfoBanner({ type = 'info', children }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  }
  
  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle2,
    error: AlertTriangle
  }
  
  const IconComponent = icons[type]
  
  return (
    <div className={`p-4 rounded-lg border ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

function PayloadCard({ payload, selected, onToggle }) {
  const WeightBadge = ({ weight }) => {
    const colors = {
      light: 'bg-green-100 text-green-700',
      medium: 'bg-amber-100 text-amber-700',
      heavy: 'bg-red-100 text-red-700',
      varies: 'bg-gray-100 text-gray-700'
    }
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[weight]}`}>
        {weight}
      </span>
    )
  }
  
  return (
    <button
      onClick={() => onToggle(payload.id)}
      className={`p-3 rounded-lg border-2 text-left transition-all ${
        selected 
          ? 'border-aeria-navy bg-aeria-navy/5' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <payload.icon className={`w-5 h-5 ${selected ? 'text-aeria-navy' : 'text-gray-400'}`} />
          <span className={`font-medium text-sm ${selected ? 'text-aeria-navy' : 'text-gray-900'}`}>
            {payload.name}
          </span>
        </div>
        <WeightBadge weight={payload.weight} />
      </div>
      <p className="text-xs text-gray-500">{payload.description}</p>
    </button>
  )
}

// ============================================
// RESULT COMPONENTS
// ============================================

function RegulatoryPathwayResult({ pathway }) {
  if (!pathway) return null
  
  const colors = {
    Basic: 'bg-green-100 border-green-300 text-green-800',
    Advanced: 'bg-amber-100 border-amber-300 text-amber-800',
    SFOC: 'bg-red-100 border-red-300 text-red-800'
  }
  
  return (
    <div className={`p-4 rounded-lg border-2 ${colors[pathway.pathway]}`}>
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6" />
        <div>
          <p className="text-xs uppercase tracking-wide opacity-75">Regulatory Pathway</p>
          <p className="text-xl font-bold">{pathway.pathway} Operations</p>
        </div>
      </div>
      <p className="text-sm opacity-90">{pathway.reason}</p>
    </div>
  )
}

function SAILResult({ sail }) {
  if (!sail) return null
  
  const sailColors = {
    'I': 'bg-green-100 border-green-300 text-green-800',
    'II': 'bg-lime-100 border-lime-300 text-lime-800',
    'III': 'bg-amber-100 border-amber-300 text-amber-800',
    'IV': 'bg-orange-100 border-orange-300 text-orange-800',
    'V': 'bg-red-100 border-red-300 text-red-800',
    'VI': 'bg-red-200 border-red-400 text-red-900'
  }
  
  return (
    <div className={`p-4 rounded-lg border-2 ${sailColors[sail.level]}`}>
      <div className="flex items-center gap-3 mb-3">
        <Gauge className="w-6 h-6" />
        <div>
          <p className="text-xs uppercase tracking-wide opacity-75">Estimated SAIL Level</p>
          <p className="text-2xl font-bold">SAIL {sail.level}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white/50 rounded p-2">
          <p className="opacity-75">Environment</p>
          <p className="font-semibold">+{sail.factors.environment}</p>
        </div>
        <div className="bg-white/50 rounded p-2">
          <p className="opacity-75">Airspace</p>
          <p className="font-semibold">+{sail.factors.airspace}</p>
        </div>
        <div className="bg-white/50 rounded p-2">
          <p className="opacity-75">Operation</p>
          <p className="font-semibold">+{sail.factors.operationType}</p>
        </div>
      </div>
    </div>
  )
}

function CrewRequirementsResult({ requirements }) {
  if (!requirements) return null
  
  const roles = [
    { key: 'pic', name: 'Pilot-in-Command', icon: Users },
    { key: 'vo', name: 'Visual Observer', icon: Eye },
    { key: 'payloadOperator', name: 'Payload Operator', icon: Camera },
    { key: 'groundSupport', name: 'Ground Support', icon: ShieldCheck }
  ]
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Users className="w-5 h-5 text-aeria-navy" />
        Crew Requirements
      </h4>
      <div className="space-y-3">
        {roles.map(role => {
          const req = requirements[role.key]
          if (!req) return null
          
          return (
            <div key={role.key} className={`flex items-start gap-3 p-3 rounded-lg ${
              req.required ? 'bg-aeria-navy/5' : 'bg-gray-50'
            }`}>
              <role.icon className={`w-5 h-5 ${req.required ? 'text-aeria-navy' : 'text-gray-400'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${req.required ? 'text-gray-900' : 'text-gray-500'}`}>
                    {role.name}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    req.required ? 'bg-aeria-navy text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {req.required ? `Required (${req.count})` : 'Optional'}
                  </span>
                </div>
                {req.notes.length > 0 && (
                  <ul className="mt-1 text-xs text-gray-500">
                    {req.notes.map((note, i) => (
                      <li key={i}>• {note}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AircraftRequirementsResult({ requirements }) {
  if (!requirements) return null
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Plane className="w-5 h-5 text-aeria-navy" />
        Aircraft Requirements
      </h4>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Platform Type</p>
          <p className="font-medium text-gray-900">{requirements.platformType}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Min Payload Capacity</p>
          <p className="font-medium text-gray-900">{requirements.minCapacity}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Min Flight Time</p>
          <p className="font-medium text-gray-900">{requirements.minFlightTime}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Recommendation</p>
          <p className="font-medium text-gray-900">{requirements.recommendation}</p>
        </div>
      </div>
      {requirements.features.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Required Features:</p>
          <div className="flex flex-wrap gap-2">
            {requirements.features.map((feature, i) => (
              <span key={i} className="px-2 py-1 bg-aeria-navy/10 text-aeria-navy text-xs rounded">
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EquipmentChecklistResult({ equipment }) {
  if (!equipment) return null
  
  const categories = [
    { key: 'flightEquipment', name: 'Flight Equipment', icon: Plane },
    { key: 'safetyEquipment', name: 'Safety Equipment', icon: Shield },
    { key: 'communicationEquipment', name: 'Communication', icon: Radio },
    { key: 'documentationEquipment', name: 'Documentation', icon: FileText },
    { key: 'payloadEquipment', name: 'Payload Equipment', icon: Camera },
    { key: 'additionalEquipment', name: 'Additional Equipment', icon: Box }
  ]
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <ListChecks className="w-5 h-5 text-aeria-navy" />
        Equipment Checklist
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => {
          const items = equipment[cat.key] || []
          if (items.length === 0) return null
          
          return (
            <div key={cat.key} className="bg-gray-50 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2 text-sm">
                <cat.icon className="w-4 h-4 text-gray-500" />
                {cat.name}
              </h5>
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {item.required ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded flex-shrink-0" />
                    )}
                    <span className={item.required ? 'text-gray-900' : 'text-gray-500'}>
                      {item.item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DocumentationResult({ docs }) {
  if (!docs) return null
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <FileCheck className="w-5 h-5 text-aeria-navy" />
        Documentation Requirements
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h5 className="font-medium text-red-700 mb-2 text-sm flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Required
          </h5>
          <ul className="space-y-1">
            {docs.required.map((doc, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="font-medium text-amber-700 mb-2 text-sm flex items-center gap-1">
            <Info className="w-4 h-4" />
            Recommended
          </h5>
          <ul className="space-y-1">
            {docs.recommended.map((doc, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="font-medium text-gray-700 mb-2 text-sm flex items-center gap-1">
            <Clipboard className="w-4 h-4" />
            Operational
          </h5>
          <ul className="space-y-1">
            {docs.operational.map((doc, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProjectNeedsAnalysis({ project, onUpdate, onNavigate }) {
  // Analysis state
  const [analysis, setAnalysis] = useState(() => {
    return project?.needsAnalysis || {
      missionProfile: null,
      environment: null,
      airspace: null,
      operationType: null,
      coverage: null,
      payloads: []
    }
  })
  
  const [showResults, setShowResults] = useState(false)
  
  // Update analysis field
  const updateAnalysis = useCallback((field, value) => {
    setAnalysis(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-save to project
      if (onUpdate) {
        onUpdate({ needsAnalysis: updated })
      }
      
      return updated
    })
  }, [onUpdate])
  
  // Toggle payload selection
  const togglePayload = useCallback((payloadId) => {
    setAnalysis(prev => {
      const payloads = prev.payloads || []
      const updated = payloads.includes(payloadId)
        ? payloads.filter(p => p !== payloadId)
        : [...payloads, payloadId]
      
      const newAnalysis = { ...prev, payloads: updated }
      
      if (onUpdate) {
        onUpdate({ needsAnalysis: newAnalysis })
      }
      
      return newAnalysis
    })
  }, [onUpdate])
  
  // Calculate results
  const results = useMemo(() => {
    if (!analysis.missionProfile || !analysis.environment || !analysis.airspace || !analysis.operationType) {
      return null
    }
    
    return {
      regulatory: determineRegulatoryPathway(analysis),
      sail: estimateSAIL(analysis),
      crew: generateCrewRequirements(analysis),
      aircraft: generateAircraftRequirements(analysis),
      equipment: generateEquipmentChecklist(analysis),
      documentation: generateDocumentationRequirements(analysis)
    }
  }, [analysis])
  
  // Completeness check
  const completeness = useMemo(() => {
    const checks = {
      missionProfile: !!analysis.missionProfile,
      environment: !!analysis.environment,
      airspace: !!analysis.airspace,
      operationType: !!analysis.operationType,
      coverage: !!analysis.coverage,
      payloads: (analysis.payloads?.length || 0) > 0
    }
    
    const completed = Object.values(checks).filter(Boolean).length
    const total = Object.keys(checks).length
    
    return {
      checks,
      completed,
      total,
      percent: Math.round((completed / total) * 100),
      isComplete: completed === total
    }
  }, [analysis])
  
  // Selected mission profile details
  const selectedProfile = analysis.missionProfile ? MISSION_PROFILES[analysis.missionProfile] : null
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-aeria-navy" />
              CONOPS Needs Analysis
            </h2>
            <p className="text-gray-500 mt-1">
              Define your operation requirements to determine regulatory pathway, crew, and equipment needs
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Completion</p>
              <p className={`text-lg font-bold ${
                completeness.percent === 100 ? 'text-green-600' : 'text-gray-900'
              }`}>
                {completeness.percent}%
              </p>
            </div>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  completeness.percent === 100 ? 'bg-green-500' : 'bg-aeria-navy'
                }`}
                style={{ width: `${completeness.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Analysis Sections */}
      <div className="space-y-4">
        {/* Mission Profile */}
        <CollapsibleSection 
          title="Mission Profile" 
          icon={Target} 
          badge="Step 1"
          complete={completeness.checks.missionProfile}
          defaultOpen={!completeness.checks.missionProfile}
        >
          <p className="text-sm text-gray-600 mb-4">
            Select the type of operation that best describes your mission objectives.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(MISSION_PROFILES).map(profile => (
              <SelectionCard
                key={profile.id}
                item={profile}
                selected={analysis.missionProfile === profile.id}
                onSelect={(id) => updateAnalysis('missionProfile', id)}
              />
            ))}
          </div>
          
          {selectedProfile && (
            <div className="mt-4 p-4 bg-aeria-navy/5 rounded-lg">
              <h4 className="font-medium text-aeria-navy mb-3">Mission Profile Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Typical Altitude</p>
                  <p className="font-medium">{selectedProfile.typicalAltitude}</p>
                </div>
                <div>
                  <p className="text-gray-500">Typical Duration</p>
                  <p className="font-medium">{selectedProfile.typicalDuration}</p>
                </div>
                <div>
                  <p className="text-gray-500">Recommended Op Type</p>
                  <p className="font-medium">{selectedProfile.recommendedOperationType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Common Payloads</p>
                  <p className="font-medium">
                    {selectedProfile.typicalPayloads.map(p => PAYLOAD_TYPES[p]?.name || p).join(', ')}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-gray-500 text-sm mb-1">Key Considerations:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {selectedProfile.considerations.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-aeria-navy flex-shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CollapsibleSection>
        
        {/* Operating Environment */}
        <CollapsibleSection 
          title="Operating Environment" 
          icon={MapPin} 
          badge="Step 2"
          complete={completeness.checks.environment}
          defaultOpen={completeness.checks.missionProfile && !completeness.checks.environment}
        >
          <p className="text-sm text-gray-600 mb-4">
            Characterize the ground environment where operations will take place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(OPERATING_ENVIRONMENTS).map(env => (
              <SelectionCard
                key={env.id}
                item={env}
                selected={analysis.environment === env.id}
                onSelect={(id) => updateAnalysis('environment', id)}
              />
            ))}
          </div>
          
          {analysis.environment && (
            <InfoBanner type="info">
              <strong>SORA Category:</strong> {OPERATING_ENVIRONMENTS[analysis.environment].soraCategory}
              <br />
              <strong>Typical SAIL Range:</strong> {OPERATING_ENVIRONMENTS[analysis.environment].typicalSAIL}
            </InfoBanner>
          )}
        </CollapsibleSection>
        
        {/* Airspace */}
        <CollapsibleSection 
          title="Airspace" 
          icon={Plane} 
          badge="Step 3"
          complete={completeness.checks.airspace}
          defaultOpen={completeness.checks.environment && !completeness.checks.airspace}
        >
          <p className="text-sm text-gray-600 mb-4">
            Select the airspace scenario that applies to your operation area.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(AIRSPACE_SCENARIOS).map(scenario => (
              <button
                key={scenario.id}
                onClick={() => updateAnalysis('airspace', scenario.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  analysis.airspace === scenario.id
                    ? 'border-aeria-navy bg-aeria-navy/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className={`font-medium ${
                      analysis.airspace === scenario.id ? 'text-aeria-navy' : 'text-gray-900'
                    }`}>
                      {scenario.name}
                    </p>
                    <p className="text-sm text-gray-500">Class {scenario.class}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    scenario.complexity === 'low' ? 'bg-green-100 text-green-700' :
                    scenario.complexity === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {scenario.complexity}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{scenario.description}</p>
              </button>
            ))}
          </div>
          
          {analysis.airspace && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-800 mb-2">Requirements:</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                {AIRSPACE_SCENARIOS[analysis.airspace].requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CollapsibleSection>
        
        {/* Operation Type */}
        <CollapsibleSection 
          title="Operation Type" 
          icon={Eye} 
          badge="Step 4"
          complete={completeness.checks.operationType}
          defaultOpen={completeness.checks.airspace && !completeness.checks.operationType}
        >
          <p className="text-sm text-gray-600 mb-4">
            Define the visual line of sight and time-of-day parameters.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(OPERATION_TYPES).map(op => (
              <button
                key={op.id}
                onClick={() => updateAnalysis('operationType', op.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  analysis.operationType === op.id
                    ? 'border-aeria-navy bg-aeria-navy/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <op.icon className={`w-6 h-6 ${
                    analysis.operationType === op.id ? 'text-aeria-navy' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className={`font-medium ${
                      analysis.operationType === op.id ? 'text-aeria-navy' : 'text-gray-900'
                    }`}>
                      {op.name}
                    </p>
                    <p className={`text-xs ${
                      op.complexity === 'standard' ? 'text-green-600' :
                      op.complexity === 'enhanced' ? 'text-amber-600' :
                      op.complexity === 'advanced' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {op.complexity}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{op.description}</p>
              </button>
            ))}
          </div>
          
          {analysis.operationType && (
            <InfoBanner type={
              OPERATION_TYPES[analysis.operationType].complexity === 'standard' ? 'success' :
              OPERATION_TYPES[analysis.operationType].complexity === 'enhanced' ? 'info' :
              'warning'
            }>
              <strong>Requirements:</strong>
              <ul className="mt-1 space-y-1">
                {OPERATION_TYPES[analysis.operationType].requirements.map((req, i) => (
                  <li key={i}>• {req}</li>
                ))}
              </ul>
            </InfoBanner>
          )}
        </CollapsibleSection>
        
        {/* Coverage Requirements */}
        <CollapsibleSection 
          title="Coverage Requirements" 
          icon={Crosshair} 
          badge="Step 5"
          complete={completeness.checks.coverage}
          defaultOpen={completeness.checks.operationType && !completeness.checks.coverage}
        >
          <p className="text-sm text-gray-600 mb-4">
            Estimate the area or distance to be covered.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(COVERAGE_TYPES).map(cov => (
              <button
                key={cov.id}
                onClick={() => updateAnalysis('coverage', cov.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  analysis.coverage === cov.id
                    ? 'border-aeria-navy bg-aeria-navy/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`font-medium ${
                  analysis.coverage === cov.id ? 'text-aeria-navy' : 'text-gray-900'
                }`}>
                  {cov.name}
                </p>
                <p className="text-sm text-gray-500 mb-2">{cov.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-500">
                    <strong>Area:</strong> {cov.areaRange}
                  </span>
                  <span className="text-gray-500">
                    <strong>Est. Flights:</strong> {cov.flightEstimate}
                  </span>
                </div>
                <p className="text-xs text-aeria-navy mt-1">
                  <strong>Platform:</strong> {cov.platformSuggestion}
                </p>
              </button>
            ))}
          </div>
        </CollapsibleSection>
        
        {/* Payloads & Sensors */}
        <CollapsibleSection 
          title="Payloads & Sensors" 
          icon={Camera} 
          badge="Step 6"
          complete={completeness.checks.payloads}
          defaultOpen={completeness.checks.coverage && !completeness.checks.payloads}
        >
          <p className="text-sm text-gray-600 mb-4">
            Select all payload types required for the mission. Weight classification affects aircraft requirements.
          </p>
          
          {selectedProfile && (
            <InfoBanner type="info">
              <strong>Recommended for {selectedProfile.name}:</strong>{' '}
              {selectedProfile.typicalPayloads.map(p => PAYLOAD_TYPES[p]?.name || p).join(', ')}
            </InfoBanner>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {Object.values(PAYLOAD_TYPES).map(payload => (
              <PayloadCard
                key={payload.id}
                payload={payload}
                selected={analysis.payloads?.includes(payload.id)}
                onToggle={togglePayload}
              />
            ))}
          </div>
          
          {analysis.payloads?.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Selected ({analysis.payloads.length}):</strong>{' '}
                {analysis.payloads.map(p => PAYLOAD_TYPES[p]?.name).join(', ')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Combined Weight Class:</strong>{' '}
                <span className={`font-medium ${
                  getWeightClass(analysis.payloads) === 'light' ? 'text-green-600' :
                  getWeightClass(analysis.payloads) === 'medium' ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {getWeightClass(analysis.payloads)}
                </span>
              </p>
            </div>
          )}
        </CollapsibleSection>
      </div>
      
      {/* Generate Results Button */}
      {completeness.isComplete && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowResults(!showResults)}
            className="btn-primary flex items-center gap-2 px-6 py-3"
          >
            <Calculator className="w-5 h-5" />
            {showResults ? 'Hide Analysis Results' : 'Generate Analysis Results'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Results Section */}
      {showResults && results && (
        <div className="space-y-4">
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-aeria-navy" />
              Analysis Results
            </h3>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RegulatoryPathwayResult pathway={results.regulatory} />
            <SAILResult sail={results.sail} />
          </div>
          
          {/* Detailed Results */}
          <div className="space-y-4">
            <CrewRequirementsResult requirements={results.crew} />
            <AircraftRequirementsResult requirements={results.aircraft} />
            <EquipmentChecklistResult equipment={results.equipment} />
            <DocumentationResult docs={results.documentation} />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowResults(false)}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Modify Analysis
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate?.('site-survey')}
                className="btn-secondary flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Continue to Site Survey
              </button>
              <button
                onClick={() => onNavigate?.('flight-plan')}
                className="btn-primary flex items-center gap-2"
              >
                <Plane className="w-4 h-4" />
                Continue to Flight Plan
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Help Text */}
      {!completeness.isComplete && (
        <InfoBanner type="info">
          Complete all six analysis sections to generate your regulatory pathway, crew requirements, 
          aircraft specifications, and equipment checklist. This analysis helps ensure you have the 
          right resources and documentation before beginning detailed flight planning.
        </InfoBanner>
      )}
    </div>
  )
}
