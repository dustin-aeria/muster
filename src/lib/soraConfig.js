// ============================================
// SORA 2.5 CONFIGURATION DATA
// Based on JARUS SORA 2.5 Main Body & Annexes
// ============================================

// ============================================
// POPULATION DENSITY CATEGORIES (CARs Basis)
// ============================================
export const populationCategories = [
  { 
    value: 'controlled', 
    label: 'Controlled Ground Area', 
    density: 'N/A',
    description: 'No unauthorized persons present during operations',
    examples: 'Fenced/secured site, industrial facility with access control'
  },
  { 
    value: 'remote', 
    label: 'Remote/Wilderness', 
    density: '<5/km²',
    description: 'Hard to reach, rarely populated areas',
    examples: 'Backcountry, remote industrial sites, wilderness'
  },
  { 
    value: 'sparsely', 
    label: 'Sparsely Populated', 
    density: '<50/km²',
    description: 'Rural areas with occasional structures',
    examples: 'Farms, rural roads, ~1 building per km²'
  },
  { 
    value: 'populated', 
    label: 'Populated', 
    density: '<500/km²',
    description: 'Residential areas with moderate density',
    examples: 'Rural residential, large lot subdivisions'
  },
  { 
    value: 'suburban', 
    label: 'Suburban/Urban', 
    density: '<5,000/km²',
    description: 'Residential and commercial areas',
    examples: 'Single-family homes, apartments, commercial districts'
  },
  { 
    value: 'dense_urban', 
    label: 'High Density Urban', 
    density: '<50,000/km²',
    description: 'Dense urban cores',
    examples: 'Downtown areas, high-rise residential'
  },
  { 
    value: 'assembly', 
    label: 'Assembly of People', 
    density: '>50,000/km²',
    description: 'Large gatherings of people',
    examples: 'Concerts, sporting events, festivals'
  }
]

// ============================================
// UA CHARACTERISTIC DIMENSIONS (SORA Table 2)
// ============================================
export const uaCharacteristics = [
  { 
    value: '1m_25ms', 
    label: '≤1m / ≤25 m/s', 
    dimension: '1m',
    maxSpeed: 25,
    description: 'Small multi-rotors, mini fixed-wing'
  },
  { 
    value: '3m_35ms', 
    label: '≤3m / ≤35 m/s', 
    dimension: '3m',
    maxSpeed: 35,
    description: 'Medium multi-rotors, small fixed-wing'
  },
  { 
    value: '8m_75ms', 
    label: '≤8m / ≤75 m/s', 
    dimension: '8m',
    maxSpeed: 75,
    description: 'Large multi-rotors, medium fixed-wing'
  },
  { 
    value: '20m_120ms', 
    label: '≤20m / ≤120 m/s', 
    dimension: '20m',
    maxSpeed: 120,
    description: 'Large fixed-wing, VTOL'
  },
  { 
    value: '40m_200ms', 
    label: '≤40m / ≤200 m/s', 
    dimension: '40m',
    maxSpeed: 200,
    description: 'Very large UAS'
  }
]

// ============================================
// INTRINSIC GRC MATRIX (SORA Table 2)
// Rows: Population density, Columns: UA characteristics
// Values: Intrinsic GRC (1-10, or null for outside SORA scope)
// ============================================
export const intrinsicGRCMatrix = {
  // Population: { UA_characteristic: iGRC }
  'controlled': { '1m_25ms': 1, '3m_35ms': 1, '8m_75ms': 2, '20m_120ms': 3, '40m_200ms': 3 },
  'remote':     { '1m_25ms': 2, '3m_35ms': 3, '8m_75ms': 4, '20m_120ms': 5, '40m_200ms': 6 },
  'sparsely':   { '1m_25ms': 3, '3m_35ms': 4, '8m_75ms': 5, '20m_120ms': 6, '40m_200ms': 7 },
  'populated':  { '1m_25ms': 4, '3m_35ms': 5, '8m_75ms': 6, '20m_120ms': 7, '40m_200ms': 8 },
  'suburban':   { '1m_25ms': 5, '3m_35ms': 6, '8m_75ms': 7, '20m_120ms': 8, '40m_200ms': 9 },
  'dense_urban':{ '1m_25ms': 6, '3m_35ms': 7, '8m_75ms': 8, '20m_120ms': 9, '40m_200ms': 10 },
  'assembly':   { '1m_25ms': 7, '3m_35ms': 8, '8m_75ms': null, '20m_120ms': null, '40m_200ms': null }
}

// Note: null values indicate operation outside SORA scope (certified category required)
// GRC > 7 also outside SORA scope for standard operations

// ============================================
// GROUND RISK MITIGATIONS (SORA 2.5 Annex B)
// Separated into M1A, M1B, M1C, M2, M3
// ============================================
export const groundMitigations = {
  M1A: {
    id: 'M1A',
    name: 'Strategic Mitigation - Sheltering',
    description: 'People are IN shelter (buildings, vehicles) during operations. Not just that shelter exists nearby.',
    reductions: { low: -1, medium: -2, high: null }, // High not applicable for sheltering
    criteria: {
      low: 'Basic claim that people are sheltered, operational procedures documented',
      medium: 'Verified sheltering with defined structures, people confirmed inside during ops',
      high: 'N/A - High robustness not applicable for sheltering mitigation'
    },
    note: 'Sheltered operation means people are INSIDE shelter during flight, not just that shelter is available'
  },
  M1B: {
    id: 'M1B', 
    name: 'Strategic Mitigation - Operational Restrictions',
    description: 'Reducing exposure through time/space restrictions on operations',
    reductions: { low: null, medium: -1, high: -2 }, // Low not applicable
    criteria: {
      low: 'N/A - Low robustness not applicable for operational restrictions',
      medium: 'Defined operational boundaries, time restrictions, controlled access',
      high: 'Comprehensive restrictions with active monitoring, geofencing, boundary enforcement'
    },
    note: 'Includes temporal restrictions, geographic boundaries, and access control measures'
  },
  M1C: {
    id: 'M1C',
    name: 'Tactical Mitigation - Ground Observation',
    description: 'Observer(s) monitoring ground area during operations',
    reductions: { low: -1, medium: null, high: null }, // Only low available
    criteria: {
      low: 'Ground observer(s) with communication to PIC, defined observation zones',
      medium: 'N/A - Medium robustness not applicable for ground observation',
      high: 'N/A - High robustness not applicable for ground observation'
    },
    note: 'Tactical mitigation - requires active observation during operations'
  },
  M2: {
    id: 'M2',
    name: 'Effects of Ground Impact Reduced',
    description: 'Technical measures to reduce harm from ground impact (parachute, frangible design, low kinetic energy)',
    reductions: { low: null, medium: -1, high: -2 },
    criteria: {
      low: 'N/A - Low robustness not applicable for impact reduction',
      medium: 'Tested energy attenuation system (e.g., parachute with demonstrated performance)',
      high: 'Certified/proven energy attenuation with redundancy, frangible design with testing'
    },
    note: 'Requires technical evidence of impact energy reduction capability'
  },
  M3: {
    id: 'M3',
    name: 'Emergency Response Plan',
    description: 'ERP in place for emergency situations - REQUIRED but does not reduce GRC',
    reductions: { low: 0, medium: 0, high: 0 },
    criteria: {
      low: 'Basic ERP documented with emergency contacts and procedures',
      medium: 'ERP with defined response times, resources, and communication procedures',
      high: 'Comprehensive ERP with training, drills, coordination with emergency services'
    },
    note: 'ERP is mandatory for all operations but provides no GRC reduction'
  }
}

// ============================================
// AIR RISK CLASS (ARC) DEFINITIONS
// ============================================
export const arcLevels = [
  { 
    value: 'ARC-a', 
    label: 'ARC-a', 
    description: 'Atypical airspace - very low encounter rate',
    guidance: 'Segregated/restricted airspace, very remote areas with no air traffic',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  { 
    value: 'ARC-b', 
    label: 'ARC-b', 
    description: 'Low encounter rate',
    guidance: 'Class G uncontrolled, rural areas, minimal air traffic',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  { 
    value: 'ARC-c', 
    label: 'ARC-c', 
    description: 'Medium encounter rate',
    guidance: 'Near aerodromes (uncontrolled), suburban areas, moderate traffic',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  { 
    value: 'ARC-d', 
    label: 'ARC-d', 
    description: 'High encounter rate',
    guidance: 'Controlled airspace (Class B/C/D), urban areas, airport environment',
    color: 'bg-red-100 text-red-800 border-red-300'
  }
]

// ============================================
// ARC DETERMINATION DECISION TREE
// ============================================
export const arcDecisionFactors = [
  { id: 'atypical', question: 'Is this atypical airspace (segregated, very low encounter)?', arcIfYes: 'ARC-a' },
  { id: 'aboveFL600', question: 'Is operation above FL600?', arcIfYes: 'ARC-b' },
  { id: 'airportEnv', question: 'Is operation in airport/heliport environment?', note: 'Consider ARC-c or ARC-d' },
  { id: 'controlled', question: 'Is airspace controlled (Class A/B/C/D/E)?', note: 'Consider ARC-c or ARC-d' },
  { id: 'modeCVeil', question: 'Is operation in Mode-C veil or TMZ?', note: 'Consider ARC-c' },
  { id: 'urban', question: 'Is operation in urban area?', note: 'Consider ARC-c' },
  { id: 'above500AGL', question: 'Is operation above 500ft AGL?', note: 'May increase ARC' }
]

// ============================================
// TMPR DEFINITIONS (Tactical Mitigation Performance Requirements)
// ============================================
export const tmprDefinitions = [
  {
    id: 'VLOS',
    name: 'VLOS Operations',
    arcReduction: 1,
    description: 'Visual Line of Sight maintained - basic see-and-avoid capability',
    requirements: {
      low: 'VLOS maintained by PIC, manual avoidance',
      medium: 'VLOS with enhanced situational awareness (ADS-B In, FLARM)',
      high: 'VLOS with automated alerts and collision avoidance guidance'
    }
  },
  {
    id: 'EVLOS',
    name: 'Extended VLOS with Observers',
    arcReduction: 1,
    description: 'Visual observers extend operational range while maintaining visual contact',
    requirements: {
      low: 'Visual observers with radio communication to PIC',
      medium: 'Trained observers with defined handoff procedures',
      high: 'Comprehensive observer network with redundant communications'
    }
  },
  {
    id: 'DAA',
    name: 'Detect and Avoid',
    arcReduction: 2,
    description: 'Full DAA capability to detect, track, and avoid conflicts',
    requirements: {
      low: 'N/A - DAA requires medium or high robustness',
      medium: 'Cooperative DAA (ADS-B In/Out, transponder)',
      high: 'Non-cooperative DAA (radar, optical sensors, sensor fusion)'
    }
  }
]

// ============================================
// SAIL DETERMINATION MATRIX (SORA Table 4)
// Final GRC (rows) vs Residual ARC (columns)
// ============================================
export const sailMatrix = {
  1: { 'ARC-a': 'I',  'ARC-b': 'I',  'ARC-c': 'II', 'ARC-d': 'IV' },
  2: { 'ARC-a': 'I',  'ARC-b': 'II', 'ARC-c': 'II', 'ARC-d': 'IV' },
  3: { 'ARC-a': 'II', 'ARC-b': 'II', 'ARC-c': 'IV', 'ARC-d': 'VI' },
  4: { 'ARC-a': 'II', 'ARC-b': 'IV', 'ARC-c': 'IV', 'ARC-d': 'VI' },
  5: { 'ARC-a': 'IV', 'ARC-b': 'IV', 'ARC-c': 'VI', 'ARC-d': 'VI' },
  6: { 'ARC-a': 'IV', 'ARC-b': 'VI', 'ARC-c': 'VI', 'ARC-d': 'VI' },
  7: { 'ARC-a': 'VI', 'ARC-b': 'VI', 'ARC-c': 'VI', 'ARC-d': 'VI' }
}

export const sailColors = {
  'I':  'bg-green-100 text-green-800 border-green-300',
  'II': 'bg-blue-100 text-blue-800 border-blue-300',
  'IV': 'bg-amber-100 text-amber-800 border-amber-300',
  'VI': 'bg-red-100 text-red-800 border-red-300'
}

export const sailDescriptions = {
  'I':  'Low risk - Basic assurance required',
  'II': 'Low-Medium risk - Enhanced procedures required',
  'IV': 'Medium-High risk - Significant assurance required',
  'VI': 'High risk - Maximum assurance required'
}

// ============================================
// CONTAINMENT REQUIREMENTS (SORA Step 8)
// ============================================
export const containmentRobustness = {
  // Based on adjacent area population and SAIL
  // Format: { adjacentPopulation: { SAIL: requiredRobustness } }
  'controlled': { 'I': 'low', 'II': 'low', 'IV': 'low', 'VI': 'low' },
  'remote':     { 'I': 'low', 'II': 'low', 'IV': 'low', 'VI': 'medium' },
  'sparsely':   { 'I': 'low', 'II': 'low', 'IV': 'medium', 'VI': 'medium' },
  'populated':  { 'I': 'low', 'II': 'medium', 'IV': 'medium', 'VI': 'high' },
  'suburban':   { 'I': 'medium', 'II': 'medium', 'IV': 'high', 'VI': 'high' },
  'dense_urban':{ 'I': 'medium', 'II': 'high', 'IV': 'high', 'VI': 'high' },
  'assembly':   { 'I': 'high', 'II': 'high', 'IV': 'high', 'VI': 'high' }
}

// Adjacent area distance calculation
// Distance = 3 minutes of flight at max operational speed
export const calculateAdjacentAreaDistance = (maxSpeedMs) => {
  // 3 minutes = 180 seconds
  const distanceMeters = maxSpeedMs * 180
  const distanceKm = distanceMeters / 1000
  return {
    meters: Math.round(distanceMeters),
    km: Math.round(distanceKm * 10) / 10,
    nm: Math.round((distanceKm / 1.852) * 10) / 10
  }
}

// ============================================
// OSO DEFINITIONS (SORA 2.5 Annex E)
// Requirements: O = Optional, L = Low, M = Medium, H = High
// ============================================
export const osoDefinitions = [
  // Technical Competence OSOs
  {
    id: 'OSO#01',
    category: 'competence',
    name: 'Ensure operator competence',
    description: 'The operator is competent and/or proven for the operation',
    requirements: { 'I': 'O', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  {
    id: 'OSO#02',
    category: 'competence',
    name: 'UAS manufactured by competent entity',
    description: 'UAS manufactured by entity with appropriate competencies',
    requirements: { 'I': 'O', 'II': 'O', 'IV': 'L', 'VI': 'M' }
  },
  {
    id: 'OSO#03',
    category: 'competence',
    name: 'UAS maintained by competent entity',
    description: 'UAS maintenance performed by competent personnel following procedures',
    requirements: { 'I': 'L', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  // Technical Design OSOs
  {
    id: 'OSO#04',
    category: 'design',
    name: 'UAS developed to design standards',
    description: 'UAS developed according to recognized design standards',
    requirements: { 'I': 'O', 'II': 'O', 'IV': 'L', 'VI': 'M' }
  },
  {
    id: 'OSO#05',
    category: 'design',
    name: 'UAS designed considering system safety',
    description: 'System safety and reliability considered in UAS design',
    requirements: { 'I': 'O', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  {
    id: 'OSO#06',
    category: 'design',
    name: 'C3 link performance appropriate',
    description: 'Command, control, and communication link meets operational needs',
    requirements: { 'I': 'O', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  // Operational Procedures OSOs
  {
    id: 'OSO#07',
    category: 'procedures',
    name: 'Inspection of UAS',
    description: 'Pre-flight and periodic inspections to ensure safe condition',
    requirements: { 'I': 'L', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  {
    id: 'OSO#08',
    category: 'procedures',
    name: 'Operational procedures defined and validated',
    description: 'Procedures are defined, validated, and adhered to',
    requirements: { 'I': 'L', 'II': 'M', 'IV': 'H', 'VI': 'H' }
  },
  {
    id: 'OSO#09',
    category: 'crew',
    name: 'Remote crew trained and current',
    description: 'Flight crew have appropriate training and maintain currency',
    requirements: { 'I': 'L', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  {
    id: 'OSO#10',
    category: 'design',
    name: 'Safe recovery from technical issue',
    description: 'UAS can safely recover from foreseeable technical failures',
    requirements: { 'I': 'O', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  // Environmental OSOs
  {
    id: 'OSO#11',
    category: 'procedures',
    name: 'Procedures for adverse conditions',
    description: 'Procedures exist for handling adverse operating conditions',
    requirements: { 'I': 'L', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  {
    id: 'OSO#12',
    category: 'design',
    name: 'UAS designed for adverse conditions',
    description: 'UAS designed and qualified to cope with adverse conditions',
    requirements: { 'I': 'O', 'II': 'O', 'IV': 'L', 'VI': 'M' }
  },
  {
    id: 'OSO#13',
    category: 'external',
    name: 'External services adequate',
    description: 'External services supporting UAS operation are adequate',
    requirements: { 'I': 'L', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  // Containment OSOs
  {
    id: 'OSO#14',
    category: 'containment',
    name: 'Operational volume protected',
    description: 'Procedures to define and protect operational volume',
    requirements: { 'I': 'O', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  {
    id: 'OSO#15',
    category: 'containment',
    name: 'Ground risk buffer definition',
    description: 'Adjacent area/ground risk buffer appropriately defined',
    requirements: { 'I': 'O', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  // Crew OSOs
  {
    id: 'OSO#16',
    category: 'crew',
    name: 'Multi-crew coordination',
    description: 'Effective coordination between multiple crew members',
    requirements: { 'I': 'L', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  {
    id: 'OSO#17',
    category: 'crew',
    name: 'Remote crew fit to operate',
    description: 'Fitness requirements for remote crew members',
    requirements: { 'I': 'L', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  // Human Factors OSOs
  {
    id: 'OSO#18',
    category: 'human_factors',
    name: 'Automatic flight envelope protection',
    description: 'Automated systems to protect against exceeding flight envelope',
    requirements: { 'I': 'O', 'II': 'O', 'IV': 'L', 'VI': 'M' }
  },
  {
    id: 'OSO#19',
    category: 'human_factors',
    name: 'Safe recovery from human error',
    description: 'Procedures/design to recover from remote crew errors',
    requirements: { 'I': 'O', 'II': 'O', 'IV': 'L', 'VI': 'M' }
  },
  {
    id: 'OSO#20',
    category: 'human_factors',
    name: 'Human factors evaluation, HMI appropriate',
    description: 'HMI designed considering human factors principles',
    requirements: { 'I': 'O', 'II': 'L', 'IV': 'L', 'VI': 'M' }
  },
  // Additional OSOs
  {
    id: 'OSO#21',
    category: 'design',
    name: 'Flight termination capability',
    description: 'Reliable method to terminate flight in emergency',
    requirements: { 'I': 'L', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  {
    id: 'OSO#22',
    category: 'procedures',
    name: 'Safe environmental conditions',
    description: 'Operations conducted only in safe environmental conditions',
    requirements: { 'I': 'L', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  {
    id: 'OSO#23',
    category: 'procedures',
    name: 'Environmental conditions defined',
    description: 'Environmental conditions for safe operations are defined',
    requirements: { 'I': 'L', 'II': 'L', 'IV': 'M', 'VI': 'H' }
  },
  {
    id: 'OSO#24',
    category: 'design',
    name: 'UAS qualified for environment',
    description: 'UAS designed and qualified for operating environment',
    requirements: { 'I': 'O', 'II': 'O', 'IV': 'L', 'VI': 'M' }
  }
]

// OSO Category labels
export const osoCategories = {
  'competence': { label: 'Competence', icon: 'GraduationCap' },
  'design': { label: 'Technical Design', icon: 'Wrench' },
  'procedures': { label: 'Operational Procedures', icon: 'FileCheck' },
  'crew': { label: 'Crew', icon: 'Users' },
  'containment': { label: 'Containment', icon: 'Target' },
  'human_factors': { label: 'Human Factors', icon: 'Brain' },
  'external': { label: 'External Services', icon: 'Globe' }
}

// ============================================
// ROBUSTNESS LEVELS
// ============================================
export const robustnessLevels = [
  { value: 'none', label: 'None', color: 'bg-gray-100 text-gray-600', index: 0 },
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700', index: 1 },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700', index: 2 },
  { value: 'high', label: 'High', color: 'bg-green-100 text-green-700', index: 3 }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get intrinsic GRC from population and UA characteristics
 */
export const getIntrinsicGRC = (populationCategory, uaCharacteristic) => {
  const row = intrinsicGRCMatrix[populationCategory]
  if (!row) return null
  return row[uaCharacteristic] || null
}

/**
 * Calculate final GRC with mitigations
 */
export const calculateFinalGRC = (intrinsicGRC, mitigations) => {
  if (!intrinsicGRC) return null
  
  let grc = intrinsicGRC
  
  // Apply M1A reduction
  if (mitigations.M1A?.enabled && mitigations.M1A.robustness !== 'none') {
    const reduction = groundMitigations.M1A.reductions[mitigations.M1A.robustness]
    if (reduction) grc += reduction // reductions are negative numbers
  }
  
  // Apply M1B reduction
  if (mitigations.M1B?.enabled && mitigations.M1B.robustness !== 'none') {
    const reduction = groundMitigations.M1B.reductions[mitigations.M1B.robustness]
    if (reduction) grc += reduction
  }
  
  // Apply M1C reduction (tactical)
  if (mitigations.M1C?.enabled && mitigations.M1C.robustness !== 'none') {
    const reduction = groundMitigations.M1C.reductions[mitigations.M1C.robustness]
    if (reduction) grc += reduction
  }
  
  // Apply M2 reduction
  if (mitigations.M2?.enabled && mitigations.M2.robustness !== 'none') {
    const reduction = groundMitigations.M2.reductions[mitigations.M2.robustness]
    if (reduction) grc += reduction
  }
  
  // Clamp to valid range (1-7 for SORA scope)
  return Math.max(1, Math.min(7, grc))
}

/**
 * Calculate residual ARC with TMPR
 */
export const calculateResidualARC = (initialARC, tmpr) => {
  const arcOrder = ['ARC-a', 'ARC-b', 'ARC-c', 'ARC-d']
  const initialIndex = arcOrder.indexOf(initialARC)
  
  if (!tmpr?.enabled || tmpr.robustness === 'none') {
    return initialARC
  }
  
  const tmprDef = tmprDefinitions.find(t => t.id === tmpr.type)
  if (!tmprDef) return initialARC
  
  // Calculate reduction based on robustness
  let effectiveReduction = 0
  if (tmpr.robustness === 'low') effectiveReduction = Math.min(tmprDef.arcReduction, 1)
  else if (tmpr.robustness === 'medium') effectiveReduction = Math.min(tmprDef.arcReduction, 1)
  else if (tmpr.robustness === 'high') effectiveReduction = tmprDef.arcReduction
  
  const newIndex = Math.max(0, initialIndex - effectiveReduction)
  return arcOrder[newIndex]
}

/**
 * Get SAIL from final GRC and residual ARC
 */
export const getSAIL = (finalGRC, residualARC) => {
  if (!finalGRC || finalGRC > 7) return null // Outside SORA scope
  return sailMatrix[finalGRC]?.[residualARC] || null
}

/**
 * Check OSO compliance
 */
export const checkOSOCompliance = (oso, sail, actualRobustness) => {
  const required = oso.requirements[sail]
  if (required === 'O') return { compliant: true, message: 'Optional' }
  
  const levels = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3, 'L': 1, 'M': 2, 'H': 3 }
  const requiredLevel = levels[required] || 0
  const actualLevel = levels[actualRobustness] || 0
  
  if (actualLevel >= requiredLevel) {
    return { compliant: true, message: 'Compliant' }
  }
  return { compliant: false, message: `Requires ${required} robustness` }
}

/**
 * Get containment requirement
 */
export const getContainmentRequirement = (adjacentPopulation, sail) => {
  return containmentRobustness[adjacentPopulation]?.[sail] || 'medium'
}
