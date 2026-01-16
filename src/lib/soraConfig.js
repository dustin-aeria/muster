// ============================================
// SORA 2.5 Configuration
// JARUS SORA 2.5 Compliant
// ============================================

// ============================================
// POPULATION CATEGORIES (Table 2 rows)
// ============================================
export const populationCategories = {
  controlled: { 
    label: 'Controlled Ground Area', 
    density: 0,
    description: 'Access controlled, no uninvolved persons'
  },
  remote: { 
    label: 'Remote (< 5 ppl/kmÂ²)', 
    density: 5,
    description: 'Sparsely populated wilderness'
  },
  lightly: { 
    label: 'Lightly Populated (< 50 ppl/kmÂ²)', 
    density: 50,
    description: 'Rural areas with scattered homes'
  },
  sparsely: { 
    label: 'Sparsely Populated (< 500 ppl/kmÂ²)', 
    density: 500,
    description: 'Small towns, rural residential'
  },
  suburban: { 
    label: 'Suburban (< 5,000 ppl/kmÂ²)', 
    density: 5000,
    description: 'Suburban residential areas'
  },
  highdensity: { 
    label: 'High Density Metro (< 50,000 ppl/kmÂ²)', 
    density: 50000,
    description: 'Urban city centers'
  },
  assembly: { 
    label: 'Assembly of People (> 50,000 ppl/kmÂ²)', 
    density: 100000,
    description: 'Crowds, events, stadiums'
  }
}

// ============================================
// UA CHARACTERISTICS (Table 2 columns)
// ============================================
export const uaCharacteristics = {
  '1m_25ms': { 
    label: 'â‰¤1m / â‰¤25 m/s', 
    maxDimension: 1, 
    maxSpeed: 25,
    description: 'Small consumer drones'
  },
  '3m_35ms': { 
    label: 'â‰¤3m / â‰¤35 m/s', 
    maxDimension: 3, 
    maxSpeed: 35,
    description: 'Medium commercial UAS'
  },
  '8m_75ms': { 
    label: 'â‰¤8m / â‰¤75 m/s', 
    maxDimension: 8, 
    maxSpeed: 75,
    description: 'Large industrial UAS'
  },
  '20m_120ms': { 
    label: 'â‰¤20m / â‰¤120 m/s', 
    maxDimension: 20, 
    maxSpeed: 120,
    description: 'Large fixed-wing UAS'
  },
  '40m_200ms': { 
    label: 'â‰¤40m / â‰¤200 m/s', 
    maxDimension: 40, 
    maxSpeed: 200,
    description: 'Very large UAS'
  }
}

// ============================================
// INTRINSIC GRC MATRIX (SORA Table 2)
// Rows: Population, Columns: UA Characteristics
// Values: Intrinsic Ground Risk Class (1-10+)
// null = outside SORA scope
// ============================================
export const intrinsicGRCMatrix = {
  controlled: {
    '1m_25ms': 1,
    '3m_35ms': 1,
    '8m_75ms': 1,
    '20m_120ms': 2,
    '40m_200ms': 3
  },
  remote: {
    '1m_25ms': 2,
    '3m_35ms': 2,
    '8m_75ms': 2,
    '20m_120ms': 3,
    '40m_200ms': 4
  },
  lightly: {
    '1m_25ms': 3,
    '3m_35ms': 3,
    '8m_75ms': 3,
    '20m_120ms': 4,
    '40m_200ms': 5
  },
  sparsely: {
    '1m_25ms': 4,
    '3m_35ms': 4,
    '8m_75ms': 4,
    '20m_120ms': 5,
    '40m_200ms': 6
  },
  suburban: {
    '1m_25ms': 5,
    '3m_35ms': 5,
    '8m_75ms': 6,
    '20m_120ms': 7,
    '40m_200ms': null // Outside scope
  },
  highdensity: {
    '1m_25ms': 6,
    '3m_35ms': 7,
    '8m_75ms': null,
    '20m_120ms': null,
    '40m_200ms': null
  },
  assembly: {
    '1m_25ms': 7,
    '3m_35ms': null,
    '8m_75ms': null,
    '20m_120ms': null,
    '40m_200ms': null
  }
}

// ============================================
// GROUND RISK MITIGATIONS (Annex B)
// ============================================
export const groundMitigations = {
  M1A: {
    name: 'M1(A) - Strategic Mitigation: Sheltering',
    description: 'People on ground are sheltered',
    reductions: {
      none: 0,
      low: -1,
      medium: -2,
      high: -2  // M1A only goes up to medium
    }
  },
  M1B: {
    name: 'M1(B) - Strategic Mitigation: Operational Restrictions',
    description: 'Temporal/spatial restrictions reduce exposure',
    reductions: {
      none: 0,
      low: 0,
      medium: -1,
      high: -2
    }
  },
  M1C: {
    name: 'M1(C) - Strategic Mitigation: Ground Observers',
    description: 'Observers warn people in operational area',
    reductions: {
      none: 0,
      low: -1,
      medium: -1,  // M1C only provides -1 at low
      high: -1
    }
  },
  M2: {
    name: 'M2 - Impact Dynamics Reduced',
    description: 'Parachute, autorotation, frangibility reduces impact energy',
    reductions: {
      none: 0,
      low: -1,
      medium: -2,
      high: -4
    }
  },
  M3: {
    name: 'M3 - Emergency Response Plan',
    description: 'ERP reduces effects of loss of control',
    reductions: {
      // M3 is a penalty if NOT applied
      notApplied: 1,
      applied: 0
    }
  }
}

// ============================================
// AIR RISK CLASSES
// ============================================
export const arcLevels = {
  'ARC-a': {
    description: 'Atypical airspace, segregated',
    encounters: 'Negligible'
  },
  'ARC-b': {
    description: 'Uncontrolled, low altitude',
    encounters: 'Low'
  },
  'ARC-c': {
    description: 'Controlled, medium traffic',
    encounters: 'Medium'
  },
  'ARC-d': {
    description: 'High traffic areas',
    encounters: 'High'
  }
}

// ============================================
// TMPR DEFINITIONS (Tactical Mitigation)
// ============================================
export const tmprDefinitions = {
  VLOS: {
    description: 'Visual Line of Sight - See and avoid',
    arcReduction: 1,
    maxResidualARC: 'ARC-b'
  },
  EVLOS: {
    description: 'Extended VLOS - VOs provide separation',
    arcReduction: 1,
    maxResidualARC: 'ARC-b'
  },
  DAA: {
    description: 'Detect and Avoid system',
    arcReduction: 2,
    maxResidualARC: 'ARC-a'
  }
}

// ============================================
// SAIL MATRIX (Table 4)
// Final GRC (rows) Ã— Residual ARC (columns) = SAIL
// ============================================
export const sailMatrix = {
  1: { 'ARC-a': 'I', 'ARC-b': 'I', 'ARC-c': 'II', 'ARC-d': 'IV' },
  2: { 'ARC-a': 'I', 'ARC-b': 'II', 'ARC-c': 'II', 'ARC-d': 'IV' },
  3: { 'ARC-a': 'II', 'ARC-b': 'II', 'ARC-c': 'IV', 'ARC-d': 'V' },
  4: { 'ARC-a': 'II', 'ARC-b': 'III', 'ARC-c': 'IV', 'ARC-d': 'V' },
  5: { 'ARC-a': 'III', 'ARC-b': 'III', 'ARC-c': 'IV', 'ARC-d': 'VI' },
  6: { 'ARC-a': 'III', 'ARC-b': 'IV', 'ARC-c': 'V', 'ARC-d': 'VI' },
  7: { 'ARC-a': 'IV', 'ARC-b': 'IV', 'ARC-c': 'V', 'ARC-d': 'VI' }
}

// ============================================
// SAIL COLORS & DESCRIPTIONS
// ============================================
export const sailColors = {
  'I': 'bg-green-100 text-green-800',
  'II': 'bg-green-200 text-green-800',
  'III': 'bg-yellow-100 text-yellow-800',
  'IV': 'bg-orange-100 text-orange-800',
  'V': 'bg-red-100 text-red-800',
  'VI': 'bg-red-200 text-red-900'
}

export const sailDescriptions = {
  'I': 'Lowest risk - Standard operating procedures sufficient',
  'II': 'Low risk - Enhanced operating procedures recommended',
  'III': 'Moderate risk - Formal safety management required',
  'IV': 'Medium-high risk - Comprehensive safety case required',
  'V': 'High risk - Extensive safety demonstration required',
  'VI': 'Highest risk - Full airworthiness demonstration required'
}

// ============================================
// ROBUSTNESS LEVELS
// ============================================
export const robustnessLevels = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

// ============================================
// CONTAINMENT ROBUSTNESS (Tables 8-13)
// Based on adjacent area population & SAIL
// ============================================
export const containmentRobustness = {
  controlled: {
    'I': 'low', 'II': 'low', 'III': 'low', 'IV': 'low', 'V': 'medium', 'VI': 'high'
  },
  remote: {
    'I': 'low', 'II': 'low', 'III': 'low', 'IV': 'low', 'V': 'medium', 'VI': 'high'
  },
  lightly: {
    'I': 'low', 'II': 'low', 'III': 'low', 'IV': 'medium', 'V': 'medium', 'VI': 'high'
  },
  sparsely: {
    'I': 'low', 'II': 'low', 'III': 'low', 'IV': 'medium', 'V': 'high', 'VI': 'high'
  },
  suburban: {
    'I': 'low', 'II': 'low', 'III': 'medium', 'IV': 'medium', 'V': 'high', 'VI': 'high'
  },
  highdensity: {
    'I': 'low', 'II': 'medium', 'III': 'medium', 'IV': 'high', 'V': 'high', 'VI': 'high'
  },
  assembly: {
    'I': 'medium', 'II': 'medium', 'III': 'high', 'IV': 'high', 'V': 'high', 'VI': 'high'
  }
}

// ============================================
// OSO CATEGORIES
// ============================================
export const osoCategories = {
  technical: { label: 'Technical Issue with UAS', osos: ['OSO-01', 'OSO-02', 'OSO-03', 'OSO-04', 'OSO-05', 'OSO-06'] },
  external: { label: 'Deterioration of External Systems', osos: ['OSO-07', 'OSO-08'] },
  human: { label: 'Human Error', osos: ['OSO-09', 'OSO-10', 'OSO-11', 'OSO-12', 'OSO-13', 'OSO-14', 'OSO-15', 'OSO-16'] },
  operating: { label: 'Adverse Operating Conditions', osos: ['OSO-17', 'OSO-18', 'OSO-19'] },
  air: { label: 'Air Risk', osos: ['OSO-20', 'OSO-21', 'OSO-22', 'OSO-23', 'OSO-24'] }
}

// ============================================
// OSO DEFINITIONS WITH REQUIREMENTS BY SAIL
// O = Optional, L = Low, M = Medium, H = High
// ============================================
export const osoDefinitions = [
  // Technical
  { id: 'OSO-01', category: 'technical', name: 'Operational procedures defined, validated & adhered to', 
    description: 'Procedures exist, are validated, and crew adheres to them',
    requirements: { 'I': 'O', 'II': 'L', 'III': 'M', 'IV': 'H', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-02', category: 'technical', name: 'UAS manufactured by competent entity',
    description: 'Manufacturer has documented quality processes',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-03', category: 'technical', name: 'UAS maintained by competent entity',
    description: 'Maintenance by trained personnel following procedures',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-04', category: 'technical', name: 'UAS developed to design standards',
    description: 'UAS designed per recognized standards',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'O', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-05', category: 'technical', name: 'UAS designed considering system safety & reliability',
    description: 'System safety and reliability analysis performed',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-06', category: 'technical', name: 'C3 link performance adequate for operation',
    description: 'Command, control, communication link meets operational needs',
    requirements: { 'I': 'O', 'II': 'L', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  
  // External
  { id: 'OSO-07', category: 'external', name: 'Inspection of UAS to ensure safe condition',
    description: 'Pre-flight and periodic inspections performed',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-08', category: 'external', name: 'Operational procedures for loss of C2 link',
    description: 'Lost link procedures defined and validated',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  
  // Human
  { id: 'OSO-09', category: 'human', name: 'Procedures in place for remote crew',
    description: 'Crew operating procedures documented',
    requirements: { 'I': 'O', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-10', category: 'human', name: 'Safe recovery from technical issue',
    description: 'Procedures for safe recovery from failures',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-11', category: 'human', name: 'Procedures for communication, coordination & handover',
    description: 'Communication and coordination procedures defined',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-12', category: 'human', name: 'Remote crew trained for normal procedures',
    description: 'Crew training for normal operations',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-13', category: 'human', name: 'Remote crew trained for emergency procedures',
    description: 'Crew training for emergencies',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-14', category: 'human', name: 'Multi-crew coordination',
    description: 'Coordination between multiple crew members (if applicable)',
    requirements: { 'I': 'O', 'II': 'L', 'III': 'L', 'IV': 'M', 'V': 'M', 'VI': 'H' }},
  { id: 'OSO-15', category: 'human', name: 'Fitness of remote crew',
    description: 'Crew fitness-for-duty requirements',
    requirements: { 'I': 'O', 'II': 'L', 'III': 'L', 'IV': 'M', 'V': 'M', 'VI': 'H' }},
  { id: 'OSO-16', category: 'human', name: 'HMI adequate for operation',
    description: 'Human-machine interface meets operational needs',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'M', 'VI': 'H' }},
  
  // Operating Conditions
  { id: 'OSO-17', category: 'operating', name: 'Operational environment defined',
    description: 'Environmental envelope for operation documented',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-18', category: 'operating', name: 'Automatic protection of flight envelope',
    description: 'Automatic systems prevent exceeding limits',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-19', category: 'operating', name: 'Safe recovery from adverse conditions',
    description: 'Procedures and systems for adverse condition recovery',
    requirements: { 'I': 'O', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  
  // Air Risk
  { id: 'OSO-20', category: 'air', name: 'Strategic mitigation (air risk)',
    description: 'Strategic means to reduce air collision risk',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-21', category: 'air', name: 'Effects of ground impact reduced',
    description: 'Means to reduce ground impact effects',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-22', category: 'air', name: 'ERP appropriate for mission',
    description: 'Emergency Response Plan suitable for operation',
    requirements: { 'I': 'L', 'II': 'M', 'III': 'M', 'IV': 'H', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-23', category: 'air', name: 'Environmental conditions defined',
    description: 'Weather and environmental limits documented',
    requirements: { 'I': 'L', 'II': 'L', 'III': 'M', 'IV': 'M', 'V': 'H', 'VI': 'H' }},
  { id: 'OSO-24', category: 'air', name: 'UAS designed for adverse conditions',
    description: 'UAS can handle defined adverse conditions',
    requirements: { 'I': 'O', 'II': 'O', 'III': 'L', 'IV': 'M', 'V': 'H', 'VI': 'H' }}
]

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Get intrinsic GRC from matrix
 * @param {string} population - Population category key
 * @param {string} uaChar - UA characteristic key
 * @returns {number|null} Intrinsic GRC or null if outside scope
 */
export function getIntrinsicGRC(population, uaChar) {
  return intrinsicGRCMatrix[population]?.[uaChar] ?? null
}

/**
 * Calculate final GRC with mitigations
 * @param {number} iGRC - Intrinsic GRC
 * @param {object} mitigations - Applied mitigations
 * @returns {number} Final GRC (minimum 1, maximum 7 for SORA scope)
 */
export function calculateFinalGRC(iGRC, mitigations = {}) {
  if (iGRC === null) return null
  
  let reduction = 0
  
  // M1A - Sheltering
  if (mitigations.M1A?.enabled) {
    const rob = mitigations.M1A.robustness || 'none'
    reduction += groundMitigations.M1A.reductions[rob] || 0
  }
  
  // M1B - Operational Restrictions
  if (mitigations.M1B?.enabled) {
    const rob = mitigations.M1B.robustness || 'none'
    reduction += groundMitigations.M1B.reductions[rob] || 0
  }
  
  // M1C - Ground Observers
  if (mitigations.M1C?.enabled) {
    const rob = mitigations.M1C.robustness || 'none'
    reduction += groundMitigations.M1C.reductions[rob] || 0
  }
  
  // M2 - Impact Dynamics
  if (mitigations.M2?.enabled) {
    const rob = mitigations.M2.robustness || 'none'
    reduction += groundMitigations.M2.reductions[rob] || 0
  }
  
  // M3 - ERP (penalty if not applied)
  if (!mitigations.M3?.enabled) {
    reduction += 1 // +1 GRC penalty
  }
  
  const finalGRC = iGRC + reduction
  
  // Clamp to valid range (1-7 for SORA, >7 is outside scope)
  return Math.max(1, finalGRC)
}

/**
 * Calculate residual ARC after tactical mitigations
 * @param {string} initialARC - Initial ARC (e.g., 'ARC-b')
 * @param {object} tmpr - TMPR configuration
 * @returns {string} Residual ARC
 */
export function calculateResidualARC(initialARC, tmpr = {}) {
  const arcOrder = ['ARC-a', 'ARC-b', 'ARC-c', 'ARC-d']
  const currentIndex = arcOrder.indexOf(initialARC)
  
  if (currentIndex === -1) return 'ARC-b'
  
  // If TMPR enabled, can reduce ARC
  if (tmpr?.enabled && tmpr?.type) {
    const tmprDef = tmprDefinitions[tmpr.type]
    if (tmprDef) {
      // Check if robustness is sufficient
      const robustnessOk = tmpr.robustness === 'low' || tmpr.robustness === 'medium' || tmpr.robustness === 'high'
      if (robustnessOk) {
        const newIndex = Math.max(0, currentIndex - tmprDef.arcReduction)
        const maxIndex = arcOrder.indexOf(tmprDef.maxResidualARC)
        return arcOrder[Math.max(newIndex, maxIndex >= 0 ? maxIndex : 0)]
      }
    }
  }
  
  return initialARC
}

/**
 * Get SAIL from matrix
 * @param {number} finalGRC - Final GRC
 * @param {string} residualARC - Residual ARC
 * @returns {string|null} SAIL level or null if outside scope
 */
export function getSAIL(finalGRC, residualARC) {
  if (finalGRC === null || finalGRC > 7) return null
  const grc = Math.min(7, Math.max(1, finalGRC))
  return sailMatrix[grc]?.[residualARC] ?? null
}

/**
 * Calculate adjacent area distance
 * @param {number} maxSpeed - Max speed in m/s
 * @returns {number} Distance in meters (capped at 35km)
 */
export function calculateAdjacentAreaDistance(maxSpeed) {
  // 3 minutes Ã— max speed, capped at 35km
  const distance = maxSpeed * 180 // 3 min = 180 seconds
  return Math.min(distance, 35000) // Cap at 35km
}

/**
 * Get required containment robustness
 * @param {string} adjacentPopulation - Adjacent area population category
 * @param {string} sail - SAIL level
 * @returns {string} Required robustness level
 */
export function getContainmentRequirement(adjacentPopulation, sail) {
  return containmentRobustness[adjacentPopulation]?.[sail] ?? 'low'
}

/**
 * Check OSO compliance
 * @param {object} oso - OSO definition
 * @param {string} sail - SAIL level
 * @param {string} actualRobustness - Actual robustness achieved
 * @returns {object} Compliance status
 */
export function checkOSOCompliance(oso, sail, actualRobustness) {
  const required = oso.requirements[sail]
  
  // Map requirement letters to robustness values
  const requirementMap = { 'O': 0, 'L': 1, 'M': 2, 'H': 3 }
  const robustnessMap = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3 }
  
  const requiredLevel = requirementMap[required] ?? 0
  const actualLevel = robustnessMap[actualRobustness] ?? 0
  
  return {
    required,
    actual: actualRobustness,
    compliant: actualLevel >= requiredLevel,
    gap: requiredLevel > actualLevel ? requiredLevel - actualLevel : 0
  }
}

// ============================================
// DEFAULT EXPORTS
// ============================================
export default {
  populationCategories,
  uaCharacteristics,
  intrinsicGRCMatrix,
  groundMitigations,
  arcLevels,
  tmprDefinitions,
  sailMatrix,
  sailColors,
  sailDescriptions,
  robustnessLevels,
  containmentRobustness,
  osoCategories,
  osoDefinitions,
  getIntrinsicGRC,
  calculateFinalGRC,
  calculateResidualARC,
  getSAIL,
  calculateAdjacentAreaDistance,
  getContainmentRequirement,
  checkOSOCompliance
}
