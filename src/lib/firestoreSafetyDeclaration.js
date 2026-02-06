/**
 * Firestore Safety Declaration Service
 * Handles CRUD operations for Transport Canada CAR Standard 922 Safety Assurance Declarations
 *
 * Collections:
 * - safetyDeclarations: Main declaration projects
 * - safetyDeclarations/{id}/requirements: Requirement tracking (922.04-922.12)
 * - safetyDeclarations/{id}/testingSessions: Multi-day testing session tracking
 * - safetyDeclarations/{id}/evidence: Evidence files linked to requirements
 *
 * @location src/lib/firestoreSafetyDeclaration.js
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// CONSTANTS
// ============================================

/**
 * Declaration types per Transport Canada CAR 901.194
 */
export const DECLARATION_TYPES = {
  declaration: {
    label: 'Safety Assurance Declaration',
    description: 'Self-declaration for lower-risk operations (small RPAS VLOS, some BVLOS)',
    requiresPreValidation: false
  },
  pre_validated: {
    label: 'Pre-Validated Declaration (PVD)',
    description: 'Requires Transport Canada review before declaration can be made',
    requiresPreValidation: true
  }
}

/**
 * Declaration workflow statuses
 */
export const DECLARATION_STATUSES = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    description: 'Initial setup and configuration'
  },
  requirements_mapping: {
    label: 'Requirements Mapping',
    color: 'bg-blue-100 text-blue-800',
    description: 'Identifying applicable 922.xx requirements'
  },
  testing: {
    label: 'Testing In Progress',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Active testing and evidence collection'
  },
  evidence_review: {
    label: 'Evidence Review',
    color: 'bg-purple-100 text-purple-800',
    description: 'Reviewing completeness of evidence'
  },
  ready_for_submission: {
    label: 'Ready for Submission',
    color: 'bg-green-100 text-green-800',
    description: 'All requirements satisfied, ready to submit'
  },
  submitted: {
    label: 'Submitted to TC',
    color: 'bg-blue-100 text-blue-800',
    description: 'Submitted to Transport Canada'
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-800',
    description: 'Declaration accepted by Transport Canada'
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    description: 'Declaration rejected - requires remediation'
  }
}

/**
 * RPAS weight categories per CARs
 */
export const RPAS_CATEGORIES = {
  micro: {
    label: 'Micro RPAS',
    description: '250g or less',
    maxWeight: 0.25,
    unit: 'kg'
  },
  small: {
    label: 'Small RPAS',
    description: 'More than 250g but not more than 25kg',
    minWeight: 0.25,
    maxWeight: 25,
    unit: 'kg'
  },
  medium: {
    label: 'Medium RPAS',
    description: 'More than 25kg but not more than 150kg',
    minWeight: 25,
    maxWeight: 150,
    unit: 'kg'
  },
  large: {
    label: 'Large RPAS',
    description: 'More than 150kg',
    minWeight: 150,
    unit: 'kg'
  }
}

/**
 * Kinetic energy risk categories per Standard 922
 * KE = 0.5 * mass * velocity^2
 */
export const KINETIC_ENERGY_CATEGORIES = {
  low: {
    label: 'Low Energy',
    description: 'Less than 700 Joules',
    maxKE: 700,
    unit: 'J'
  },
  medium: {
    label: 'Medium Energy',
    description: 'Less than 34 kJ',
    maxKE: 34000,
    unit: 'J'
  },
  high: {
    label: 'High Energy',
    description: 'Less than 1084 kJ',
    maxKE: 1084000,
    unit: 'J'
  },
  very_high: {
    label: 'Very High Energy',
    description: '1084 kJ or more - Contact Transport Canada',
    minKE: 1084000,
    unit: 'J',
    requiresContact: true
  }
}

/**
 * Operation types that trigger specific 922.xx requirements
 * Per Transport Canada AC 922-001 tables (lines 1079-1227)
 *
 * Each operation type specifies:
 * - rpasCategories: which RPAS weight classes can use this operation
 * - applicableStandards: the 922.xx sections required
 * - declarationType: 'declaration' or 'pre_validated'
 */
export const OPERATION_TYPES = {
  // ============================================
  // Small RPAS (sRPAS) VLOS Operations
  // ============================================
  controlled_airspace: {
    id: 'controlled_airspace',
    label: 'Small RPAS - Controlled Airspace',
    description: 'sRPAS operations within controlled airspace',
    applicableStandards: ['922.04'],
    rpasCategories: ['small'],
    declarationType: 'declaration',
    car_reference: 'CAR 901.69(a)'
  },
  near_people_30m: {
    id: 'near_people_30m',
    label: 'Small RPAS - Near People (5-30m)',
    description: 'sRPAS within 30m but not less than 5m of uninvolved persons',
    applicableStandards: ['922.05'],
    rpasCategories: ['small'],
    declarationType: 'declaration',
    car_reference: 'CAR 901.69(b)'
  },
  over_people: {
    id: 'over_people',
    label: 'Small RPAS - Over People (<5m)',
    description: 'sRPAS within 5m horizontal distance of uninvolved persons',
    applicableStandards: ['922.06'],
    rpasCategories: ['small'],
    declarationType: 'declaration',
    car_reference: 'CAR 901.69(c)'
  },

  // ============================================
  // Medium RPAS (mRPAS) VLOS Operations
  // Per AC 922-001 lines 1134-1167
  // ============================================
  medium_rpas_away_from_people: {
    id: 'medium_rpas_away_from_people',
    label: 'Medium RPAS - Away from People (>500ft)',
    description: 'mRPAS VLOS operations more than 500ft from uninvolved persons',
    applicableStandards: ['922.08'],
    rpasCategories: ['medium'],
    declarationType: 'declaration',
    car_reference: 'CAR 901.69(e)'
  },
  medium_rpas_near_people: {
    id: 'medium_rpas_near_people',
    label: 'Medium RPAS - Near People (100-500ft)',
    description: 'mRPAS within 500ft but not less than 100ft of uninvolved persons',
    applicableStandards: ['922.07'],
    rpasCategories: ['medium'],
    declarationType: 'pre_validated',
    car_reference: 'CAR 901.69(f)'
  },
  medium_rpas_over_people: {
    id: 'medium_rpas_over_people',
    label: 'Medium RPAS - Over People (<100ft)',
    description: 'mRPAS within 100ft of uninvolved persons',
    applicableStandards: ['922.07'],
    rpasCategories: ['medium'],
    declarationType: 'pre_validated',
    car_reference: 'CAR 901.69(g)'
  },
  medium_rpas_controlled_airspace: {
    id: 'medium_rpas_controlled_airspace',
    label: 'Medium RPAS - Controlled Airspace',
    description: 'mRPAS operations within controlled airspace',
    applicableStandards: ['922.04'],
    rpasCategories: ['medium'],
    declarationType: 'declaration',
    car_reference: 'CAR 901.69(h)'
  },

  // ============================================
  // Small RPAS (sRPAS) BVLOS Operations
  // Per AC 922-001 lines 1183-1225
  // ============================================
  bvlos_isolated: {
    id: 'bvlos_isolated',
    label: 'Small RPAS - BVLOS Isolated (>1km)',
    description: 'sRPAS BVLOS more than 1km from populated areas',
    applicableStandards: ['922.08', '922.09', '922.10', '922.11'],
    rpasCategories: ['small'],
    declarationType: 'declaration',
    car_reference: 'CAR 901.87(a)'
  },
  bvlos_near_populated: {
    id: 'bvlos_near_populated',
    label: 'Small RPAS - BVLOS Near Populated (<1km)',
    description: 'sRPAS BVLOS within 1km of populated areas or over sparsely populated',
    applicableStandards: ['922.07', '922.09', '922.10', '922.11', '922.12'],
    rpasCategories: ['small'],
    declarationType: 'pre_validated',
    car_reference: 'CAR 901.87(a)'
  },

  // ============================================
  // Medium RPAS (mRPAS) BVLOS Operations
  // Per AC 922-001 lines 1197-1210
  // ============================================
  medium_bvlos_isolated: {
    id: 'medium_bvlos_isolated',
    label: 'Medium RPAS - BVLOS Isolated (>1km)',
    description: 'mRPAS BVLOS more than 1km from populated areas',
    applicableStandards: ['922.08', '922.09', '922.10', '922.11'],
    rpasCategories: ['medium'],
    declarationType: 'declaration',
    car_reference: 'CAR 901.87(a)'
  },

  // ============================================
  // Backwards Compatibility Aliases
  // For existing Firestore data with old keys
  // ============================================
  bvlos_non_isolated: {
    id: 'bvlos_non_isolated',
    label: 'Small RPAS - BVLOS Near Populated (<1km)',
    description: '(Legacy) sRPAS BVLOS within 1km of populated areas',
    applicableStandards: ['922.07', '922.09', '922.10', '922.11', '922.12'],
    rpasCategories: ['small'],
    declarationType: 'pre_validated',
    car_reference: 'CAR 901.87(a)',
    _deprecated: true,
    _useInstead: 'bvlos_near_populated'
  }
}

/**
 * Standard 922 requirement sections with full details
 */
export const REQUIREMENT_SECTIONS = {
  '922.04': {
    id: '922.04',
    title: 'Controlled Airspace Operations',
    description: 'Position and altitude accuracy requirements for controlled airspace',
    requirements: [
      {
        id: '922.04.1',
        text: 'Lateral position indication accuracy of at least +/- 10m',
        testable: true,
        acceptanceCriteria: 'Position accuracy <= 10m'
      },
      {
        id: '922.04.2',
        text: 'Altitude indication accuracy of at least +/- 16m',
        testable: true,
        acceptanceCriteria: 'Altitude accuracy <= 16m'
      }
    ]
  },
  '922.05': {
    id: '922.05',
    title: 'Operations Near People (30m)',
    description: 'Injury protection requirements for operations within 30m of uninvolved persons',
    requirements: [
      {
        id: '922.05.1',
        text: 'No single failure may result in severe injury within 30m horizontal distance',
        testable: true,
        acceptanceCriteria: 'Single failure injury probability shown to be remote'
      },
      {
        id: '922.05.2',
        text: 'Design minimizes pilot errors creating hazards',
        testable: false,
        acceptanceCriteria: 'Design review demonstrates error mitigation'
      }
    ]
  },
  '922.06': {
    id: '922.06',
    title: 'Operations Over People',
    description: 'Stringent requirements for operations within 5m of uninvolved persons',
    requirements: [
      {
        id: '922.06.1',
        text: 'No single failure may result in severe injury within 5m horizontal',
        testable: true,
        acceptanceCriteria: 'Single failure must NOT cause severe injury (precluded)'
      },
      {
        id: '922.06.2',
        text: 'Failure combinations resulting in severe injury must be remote probability',
        testable: true,
        acceptanceCriteria: 'Combined failure injury probability < 10^-5'
      },
      {
        id: '922.06.3',
        text: 'Pilot error minimization controls required',
        testable: false,
        acceptanceCriteria: 'Design review demonstrates error mitigation'
      }
    ]
  },
  '922.07': {
    id: '922.07',
    title: 'Safety and Reliability',
    description: 'Formal system safety assessment based on kinetic energy classification',
    requirements: [
      {
        id: '922.07.1',
        text: 'Catastrophic failure conditions extremely improbable and not from single failure',
        testable: true,
        acceptanceCriteria: 'Per kinetic energy table (10^-4 to 10^-6)'
      },
      {
        id: '922.07.2',
        text: 'Probability of failure resulting in severe injury extremely remote',
        testable: true,
        acceptanceCriteria: 'SSA demonstrates compliance with Table 1'
      },
      {
        id: '922.07.3',
        text: 'Structures enable safe operation throughout operational envelope',
        testable: true,
        acceptanceCriteria: 'Structural analysis and testing'
      },
      {
        id: '922.07.4',
        text: 'Non-safety systems cannot adversely affect safety critical systems',
        testable: false,
        acceptanceCriteria: 'Design isolation review'
      }
    ]
  },
  '922.08': {
    id: '922.08',
    title: 'Containment',
    description: 'Geofencing and operational volume containment requirements',
    robustnessLevels: ['low', 'high'],
    requirements: [
      {
        id: '922.08.1',
        text: 'No single failure shall result in operation outside operational volume (Low Robustness)',
        testable: true,
        robustnessLevel: 'low',
        acceptanceCriteria: 'Single failure does not cause flyaway'
      },
      {
        id: '922.08.2',
        text: 'Failures annunciated to operator (Low Robustness)',
        testable: true,
        robustnessLevel: 'low',
        acceptanceCriteria: 'All containment failures produce alerts'
      },
      {
        id: '922.08.3',
        text: 'Single failure protection (High Robustness)',
        testable: true,
        robustnessLevel: 'high',
        acceptanceCriteria: 'Same as low robustness'
      },
      {
        id: '922.08.4',
        text: 'Probability RPA leaves operational volume due to failure combinations extremely remote (High Robustness)',
        testable: true,
        robustnessLevel: 'high',
        acceptanceCriteria: 'Combined failure flyaway probability < 10^-5'
      },
      {
        id: '922.08.5',
        text: 'Software/AEH developed to industry standard (High Robustness)',
        testable: false,
        robustnessLevel: 'high',
        acceptanceCriteria: 'DO-178/254 or ASTM F3201 compliance'
      }
    ]
  },
  '922.09': {
    id: '922.09',
    title: 'Command and Control Link Reliability',
    description: 'C2 link performance and lost-link behavior requirements',
    requirements: [
      {
        id: '922.09.1',
        text: 'Failure combinations resulting in loss of control shown to be remote or less',
        testable: true,
        acceptanceCriteria: 'C2 loss probability < 10^-3'
      },
      {
        id: '922.09.2',
        text: 'RPA behaves predictably and consistently if positive control is lost',
        testable: true,
        acceptanceCriteria: 'Defined lost-link behavior demonstrated'
      },
      {
        id: '922.09.3',
        text: 'Lost-link behavior assists pilots in minimizing hazard probability',
        testable: true,
        acceptanceCriteria: 'RTH, designated landing, or safe behavior'
      }
    ]
  },
  '922.10': {
    id: '922.10',
    title: 'Detect, Alert, and Avoid Systems',
    description: 'DAA system requirements for BVLOS and airspace integration',
    requirements: [
      {
        id: '922.10.1',
        text: 'Annunciated DAA function loss shown to be remote',
        testable: true,
        acceptanceCriteria: 'DAA loss with alert probability < 10^-3'
      },
      {
        id: '922.10.2',
        text: 'Unannunciated DAA loss or misleading guidance shown to be extremely remote',
        testable: true,
        acceptanceCriteria: 'Silent DAA failure probability < 10^-5'
      },
      {
        id: '922.10.3',
        text: 'Risk ratio requirements met per airspace class',
        testable: true,
        acceptanceCriteria: 'Class F/G near controlled: <=0.33, Remote G: <=0.66'
      }
    ]
  },
  '922.11': {
    id: '922.11',
    title: 'Control Station Design',
    description: 'Human factors and crew interface requirements',
    requirements: [
      {
        id: '922.11.1',
        text: 'Controls provide accomplishment of all tasks for safe equipment operation',
        testable: true,
        acceptanceCriteria: 'Task analysis demonstrates completeness'
      },
      {
        id: '922.11.2',
        text: 'Information delivered in clear, unambiguous manner at appropriate resolution',
        testable: true,
        acceptanceCriteria: 'HMI review and user testing'
      },
      {
        id: '922.11.3',
        text: 'Controls accessible and usable consistent with task urgency and duration',
        testable: true,
        acceptanceCriteria: 'Ergonomic assessment'
      },
      {
        id: '922.11.4',
        text: 'Equipment behavior predictable and unambiguous',
        testable: true,
        acceptanceCriteria: 'User testing demonstrates predictability'
      },
      {
        id: '922.11.5',
        text: 'Error management means provided to extent practicable',
        testable: false,
        acceptanceCriteria: 'Design review of error handling'
      },
      {
        id: '922.11.6',
        text: 'Bedford Pilot Workload Rating evaluation',
        testable: true,
        acceptanceCriteria: 'Rating 1-10 with documentation'
      },
      {
        id: '922.11.7',
        text: 'Cooper-Harper handling qualities evaluation',
        testable: true,
        acceptanceCriteria: 'Rating 1-6, tasks rated 4-6 require limitations'
      }
    ]
  },
  '922.12': {
    id: '922.12',
    title: 'Demonstrated Environmental Envelope',
    description: 'Flight test demonstration of operational envelope',
    requirements: [
      {
        id: '922.12.1',
        text: 'Ground and flight testing demonstrates safe operation envelope',
        testable: true,
        acceptanceCriteria: 'Test campaign covers all configurations'
      },
      {
        id: '922.12.2',
        text: 'Testing covers all phases of flight',
        testable: true,
        acceptanceCriteria: 'Takeoff, cruise, maneuver, landing tested'
      },
      {
        id: '922.12.3',
        text: 'Testing includes acceptable failures/degradation of components',
        testable: true,
        acceptanceCriteria: 'Failure mode testing documented'
      },
      {
        id: '922.12.4',
        text: 'Environmental factors tested (weather, EMI, g-loading, attitudes, crosswind, night, latitude, urban)',
        testable: true,
        acceptanceCriteria: 'Environmental test matrix completed'
      },
      {
        id: '922.12.5',
        text: 'Account for inadvertent exceedance before detection/correction',
        testable: true,
        acceptanceCriteria: 'Envelope excursion recovery demonstrated'
      },
      {
        id: '922.12.6',
        text: 'Storage and transportation limitations documented',
        testable: false,
        acceptanceCriteria: 'Documentation provided'
      }
    ]
  }
}

/**
 * Compliance verification methods per AC 922-001
 */
export const COMPLIANCE_METHODS = {
  inspection: {
    label: 'Inspection/Review',
    description: 'Systematic examination of drawings, designs, hardware, software',
    icon: 'Search'
  },
  analysis: {
    label: 'Analysis/Calculation',
    description: 'Detailed examination including calculations, simulation, modeling',
    icon: 'Calculator'
  },
  test: {
    label: 'Test/Demonstration',
    description: 'Verification of performance and behavioral requirements',
    icon: 'TestTube'
  },
  service_experience: {
    label: 'Service Experience',
    description: 'Documented service history of similar designs',
    icon: 'Clock'
  }
}

/**
 * Requirement compliance statuses
 */
export const REQUIREMENT_STATUSES = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
  not_applicable: { label: 'N/A', color: 'bg-gray-100 text-gray-500' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  evidence_needed: { label: 'Evidence Needed', color: 'bg-orange-100 text-orange-800' },
  under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-800' },
  complete: { label: 'Complete', color: 'bg-green-100 text-green-800' }
}

/**
 * Testing session statuses
 */
export const SESSION_STATUSES = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  paused: { label: 'Paused', color: 'bg-orange-100 text-orange-800' },
  complete: { label: 'Complete', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
}

/**
 * Evidence types
 */
export const EVIDENCE_TYPES = {
  test_report: { label: 'Test Report', icon: 'FileText' },
  analysis_document: { label: 'Analysis Document', icon: 'FileSpreadsheet' },
  calculation: { label: 'Calculation', icon: 'Calculator' },
  photo: { label: 'Photo', icon: 'Image' },
  video: { label: 'Video', icon: 'Video' },
  manufacturer_data: { label: 'Manufacturer Data', icon: 'Factory' },
  certification: { label: 'Third-Party Certification', icon: 'Award' },
  drawing: { label: 'Drawing/Diagram', icon: 'PenTool' },
  log_file: { label: 'Log File', icon: 'FileCode' }
}

/**
 * Reliability targets per kinetic energy category (per flight hour)
 */
export const RELIABILITY_TARGETS = {
  catastrophic: { low: 1e-4, medium: 1e-5, high: 1e-6 },
  hazardous: { low: 1e-3, medium: 1e-4, high: 1e-5 },
  major: { low: 1e-2, medium: 1e-3, high: 1e-4 },
  minor: { low: 1e-2, medium: 1e-2, high: 1e-3 }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate kinetic energy
 * @param {number} massKg - Mass in kilograms
 * @param {number} velocityMs - Velocity in meters per second
 * @returns {number} Kinetic energy in Joules
 */
export function calculateKineticEnergy(massKg, velocityMs) {
  return 0.5 * massKg * Math.pow(velocityMs, 2)
}

/**
 * Determine kinetic energy category
 * @param {number} kineticEnergy - KE in Joules
 * @returns {string} Category key
 */
export function getKineticEnergyCategory(kineticEnergy) {
  if (kineticEnergy < 700) return 'low'
  if (kineticEnergy < 34000) return 'medium'
  if (kineticEnergy < 1084000) return 'high'
  return 'very_high'
}

/**
 * Determine RPAS weight category
 * @param {number} weightKg - Weight in kilograms
 * @returns {string} Category key
 */
export function getRPASCategory(weightKg) {
  if (weightKg <= 0.25) return 'micro'
  if (weightKg <= 25) return 'small'
  if (weightKg <= 150) return 'medium'
  return 'large'
}

/**
 * Get applicable requirements based on selected operation types
 * @param {string[]} operationTypeIds - Array of operation type IDs
 * @returns {string[]} Unique array of requirement section IDs
 */
export function getApplicableRequirements(operationTypeIds) {
  const requirements = new Set()

  operationTypeIds.forEach(opTypeId => {
    const opType = OPERATION_TYPES[opTypeId]
    if (opType?.applicableStandards) {
      opType.applicableStandards.forEach(std => requirements.add(std))
    }
  })

  return Array.from(requirements).sort()
}

/**
 * Get operation types filtered by RPAS category
 * @param {string} rpasCategory - RPAS category (micro, small, medium, large)
 * @returns {Object} Filtered operation types applicable to the given category
 */
export function getOperationTypesForCategory(rpasCategory) {
  const filtered = {}

  Object.entries(OPERATION_TYPES).forEach(([key, opType]) => {
    // Skip deprecated operation types (only kept for backwards compatibility with existing data)
    if (opType._deprecated) return

    // If no rpasCategories specified, show for all (backwards compatibility)
    if (!opType.rpasCategories || opType.rpasCategories.includes(rpasCategory)) {
      filtered[key] = opType
    }
  })

  return filtered
}

/**
 * Check if operation type requires pre-validated declaration
 * @param {string} operationTypeId - The operation type ID
 * @returns {boolean} True if pre-validation required
 */
export function requiresPreValidation(operationTypeId) {
  const opType = OPERATION_TYPES[operationTypeId]
  return opType?.declarationType === 'pre_validated'
}

/**
 * Check if any selected operations require pre-validation
 * @param {string[]} operationTypeIds - Array of operation type IDs
 * @returns {boolean} True if any operation requires pre-validation
 */
export function anyRequiresPreValidation(operationTypeIds) {
  return operationTypeIds.some(id => requiresPreValidation(id))
}

/**
 * Calculate declaration completion percentage
 * @param {Object} declaration - Declaration object with requirements
 * @returns {number} Percentage complete (0-100)
 */
export function calculateCompletionPercentage(requirements) {
  if (!requirements || requirements.length === 0) return 0

  const applicable = requirements.filter(r => r.status !== 'not_applicable')
  if (applicable.length === 0) return 100

  const complete = applicable.filter(r => r.status === 'complete').length
  return Math.round((complete / applicable.length) * 100)
}

// ============================================
// DECLARATION CRUD OPERATIONS
// ============================================

/**
 * Create a new safety declaration
 */
export async function createSafetyDeclaration(declarationData) {
  const declaration = {
    organizationId: declarationData.organizationId,

    // Declaration metadata
    name: declarationData.name,
    description: declarationData.description || '',
    declarationType: declarationData.declarationType || 'declaration',
    status: 'draft',

    // RPAS system details
    rpasDetails: {
      manufacturer: declarationData.rpasDetails?.manufacturer || '',
      model: declarationData.rpasDetails?.model || '',
      serialNumber: declarationData.rpasDetails?.serialNumber || '',
      weightKg: declarationData.rpasDetails?.weightKg || 0,
      maxVelocityMs: declarationData.rpasDetails?.maxVelocityMs || 0,
      maxKineticEnergy: declarationData.rpasDetails?.maxKineticEnergy || 0,
      category: declarationData.rpasDetails?.category || 'small',
      kineticEnergyCategory: declarationData.rpasDetails?.kineticEnergyCategory || 'low',
      description: declarationData.rpasDetails?.description || ''
    },

    // Operation types selected
    operationTypes: declarationData.operationTypes || [],

    // Applicable 922.xx requirements (auto-populated)
    applicableStandards: declarationData.applicableStandards || [],

    // Containment robustness level
    robustnessLevel: declarationData.robustnessLevel || 'low',

    // Declarant information
    declarantInfo: {
      name: declarationData.declarantInfo?.name || '',
      organization: declarationData.declarantInfo?.organization || '',
      email: declarationData.declarantInfo?.email || '',
      phone: declarationData.declarantInfo?.phone || '',
      address: declarationData.declarantInfo?.address || ''
    },

    // Optional client (for client declarations)
    clientId: declarationData.clientId || null,
    clientName: declarationData.clientName || null,

    // Submission tracking
    tcReferenceNumber: null,
    submittedAt: null,
    acceptedAt: null,
    letterOfAcceptance: null,

    // Audit fields
    createdBy: declarationData.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'safetyDeclarations'), declaration)

  // Initialize requirements subcollection based on applicable standards
  if (declaration.applicableStandards.length > 0) {
    await initializeRequirements(docRef.id, declaration.applicableStandards)
  }

  return { id: docRef.id, ...declaration }
}

/**
 * Initialize requirements subcollection for a declaration
 */
async function initializeRequirements(declarationId, applicableStandards) {
  const batch = writeBatch(db)

  applicableStandards.forEach(standardId => {
    const section = REQUIREMENT_SECTIONS[standardId]
    if (!section) return

    section.requirements.forEach(req => {
      const reqRef = doc(collection(db, 'safetyDeclarations', declarationId, 'requirements'))
      batch.set(reqRef, {
        requirementId: req.id,
        sectionId: standardId,
        sectionTitle: section.title,
        text: req.text,
        testable: req.testable,
        acceptanceCriteria: req.acceptanceCriteria,
        robustnessLevel: req.robustnessLevel || null,
        status: 'not_started',
        complianceMethod: null,
        notes: '',
        evidenceIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    })
  })

  await batch.commit()
}

/**
 * Get a safety declaration by ID
 */
export async function getSafetyDeclaration(declarationId) {
  const docRef = doc(db, 'safetyDeclarations', declarationId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
    lastActivityAt: docSnap.data().lastActivityAt?.toDate(),
    submittedAt: docSnap.data().submittedAt?.toDate(),
    acceptedAt: docSnap.data().acceptedAt?.toDate()
  }
}

/**
 * Get all safety declarations for an organization
 */
export async function getSafetyDeclarations(organizationId, options = {}) {
  const { status = null, clientId = null, limitCount = 50 } = options

  let q = query(
    collection(db, 'safetyDeclarations'),
    where('organizationId', '==', organizationId),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  let declarations = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    lastActivityAt: doc.data().lastActivityAt?.toDate()
  }))

  // Filter by status if specified
  if (status) {
    declarations = declarations.filter(d => d.status === status)
  }

  // Filter by client if specified
  if (clientId) {
    declarations = declarations.filter(d => d.clientId === clientId)
  }

  return declarations
}

/**
 * Subscribe to safety declarations for real-time updates
 */
export function subscribeToSafetyDeclarations(organizationId, callback) {
  const q = query(
    collection(db, 'safetyDeclarations'),
    where('organizationId', '==', organizationId),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const declarations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastActivityAt: doc.data().lastActivityAt?.toDate()
    }))
    callback(declarations)
  })
}

/**
 * Subscribe to a single declaration for real-time updates
 */
export function subscribeToSafetyDeclaration(declarationId, callback) {
  const docRef = doc(db, 'safetyDeclarations', declarationId)

  return onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null)
      return
    }

    callback({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
      lastActivityAt: docSnap.data().lastActivityAt?.toDate()
    })
  })
}

/**
 * Update a safety declaration
 */
export async function updateSafetyDeclaration(declarationId, updates) {
  const declarationRef = doc(db, 'safetyDeclarations', declarationId)
  await updateDoc(declarationRef, {
    ...updates,
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp()
  })
}

/**
 * Update declaration status
 */
export async function updateDeclarationStatus(declarationId, status) {
  const updates = { status }

  if (status === 'submitted') {
    updates.submittedAt = serverTimestamp()
  } else if (status === 'accepted') {
    updates.acceptedAt = serverTimestamp()
  }

  await updateSafetyDeclaration(declarationId, updates)
}

/**
 * Delete a safety declaration and all subcollections
 */
export async function deleteSafetyDeclaration(declarationId) {
  const batch = writeBatch(db)

  // Delete requirements
  const reqQuery = query(collection(db, 'safetyDeclarations', declarationId, 'requirements'))
  const reqSnapshot = await getDocs(reqQuery)
  reqSnapshot.docs.forEach(docSnap => {
    batch.delete(doc(db, 'safetyDeclarations', declarationId, 'requirements', docSnap.id))
  })

  // Delete testing sessions
  const sessionQuery = query(collection(db, 'safetyDeclarations', declarationId, 'testingSessions'))
  const sessionSnapshot = await getDocs(sessionQuery)
  sessionSnapshot.docs.forEach(docSnap => {
    batch.delete(doc(db, 'safetyDeclarations', declarationId, 'testingSessions', docSnap.id))
  })

  // Delete evidence
  const evidenceQuery = query(collection(db, 'safetyDeclarations', declarationId, 'evidence'))
  const evidenceSnapshot = await getDocs(evidenceQuery)
  evidenceSnapshot.docs.forEach(docSnap => {
    batch.delete(doc(db, 'safetyDeclarations', declarationId, 'evidence', docSnap.id))
  })

  // Delete the declaration itself
  batch.delete(doc(db, 'safetyDeclarations', declarationId))

  await batch.commit()
}

// ============================================
// REQUIREMENTS SUBCOLLECTION
// ============================================

/**
 * Get all requirements for a declaration
 */
export async function getDeclarationRequirements(declarationId) {
  const q = query(
    collection(db, 'safetyDeclarations', declarationId, 'requirements'),
    orderBy('sectionId', 'asc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))
}

/**
 * Subscribe to requirements for real-time updates
 */
export function subscribeToDeclarationRequirements(declarationId, callback) {
  const q = query(
    collection(db, 'safetyDeclarations', declarationId, 'requirements'),
    orderBy('sectionId', 'asc')
  )

  return onSnapshot(q, (snapshot) => {
    const requirements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }))
    callback(requirements)
  })
}

/**
 * Update a requirement
 */
export async function updateRequirement(declarationId, requirementId, updates) {
  const reqRef = doc(db, 'safetyDeclarations', declarationId, 'requirements', requirementId)
  await updateDoc(reqRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })

  // Update declaration lastActivityAt
  await updateDoc(doc(db, 'safetyDeclarations', declarationId), {
    lastActivityAt: serverTimestamp()
  })
}

/**
 * Link evidence to a requirement
 */
export async function linkEvidenceToRequirement(declarationId, requirementId, evidenceId) {
  const reqRef = doc(db, 'safetyDeclarations', declarationId, 'requirements', requirementId)
  await updateDoc(reqRef, {
    evidenceIds: arrayUnion(evidenceId),
    updatedAt: serverTimestamp()
  })
}

/**
 * Unlink evidence from a requirement
 */
export async function unlinkEvidenceFromRequirement(declarationId, requirementId, evidenceId) {
  const reqRef = doc(db, 'safetyDeclarations', declarationId, 'requirements', requirementId)
  await updateDoc(reqRef, {
    evidenceIds: arrayRemove(evidenceId),
    updatedAt: serverTimestamp()
  })
}

// ============================================
// TESTING SESSIONS SUBCOLLECTION
// ============================================

/**
 * Create a new testing session
 */
export async function createTestingSession(declarationId, sessionData) {
  const session = {
    declarationId,

    // Session metadata
    name: sessionData.name,
    description: sessionData.description || '',
    testType: sessionData.testType || '',
    linkedRequirements: sessionData.linkedRequirements || [],

    // Scheduling
    scheduledDate: sessionData.scheduledDate || null,
    scheduledStartTime: sessionData.scheduledStartTime || null,
    scheduledEndTime: sessionData.scheduledEndTime || null,

    // Actual times
    actualStartTime: null,
    actualEndTime: null,
    totalDurationMinutes: 0,

    // Session state (for pause/resume)
    status: 'scheduled',
    pausedAt: null,
    resumedAt: null,
    pauseHistory: [], // Array of { pausedAt, resumedAt, reason }

    // Environmental conditions
    conditions: {
      weather: sessionData.conditions?.weather || '',
      temperature: sessionData.conditions?.temperature || null,
      windSpeed: sessionData.conditions?.windSpeed || null,
      windDirection: sessionData.conditions?.windDirection || '',
      visibility: sessionData.conditions?.visibility || '',
      location: sessionData.conditions?.location || '',
      gpsCoordinates: sessionData.conditions?.gpsCoordinates || null
    },

    // Results
    results: {
      passed: null,
      summary: '',
      measurements: [],
      observations: [],
      issues: []
    },

    // Attachments
    attachmentIds: [],

    // Checklists
    preTestChecklist: sessionData.preTestChecklist || [],
    inTestChecklist: sessionData.inTestChecklist || [],
    postTestChecklist: sessionData.postTestChecklist || [],

    // Audit
    conductedBy: sessionData.conductedBy || null,
    createdBy: sessionData.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(
    collection(db, 'safetyDeclarations', declarationId, 'testingSessions'),
    session
  )

  // Update declaration lastActivityAt
  await updateDoc(doc(db, 'safetyDeclarations', declarationId), {
    lastActivityAt: serverTimestamp()
  })

  return { id: docRef.id, ...session }
}

/**
 * Get all testing sessions for a declaration
 */
export async function getTestingSessions(declarationId) {
  const q = query(
    collection(db, 'safetyDeclarations', declarationId, 'testingSessions'),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    actualStartTime: doc.data().actualStartTime?.toDate(),
    actualEndTime: doc.data().actualEndTime?.toDate(),
    pausedAt: doc.data().pausedAt?.toDate()
  }))
}

/**
 * Subscribe to testing sessions
 */
export function subscribeToTestingSessions(declarationId, callback) {
  const q = query(
    collection(db, 'safetyDeclarations', declarationId, 'testingSessions'),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      actualStartTime: doc.data().actualStartTime?.toDate(),
      actualEndTime: doc.data().actualEndTime?.toDate(),
      pausedAt: doc.data().pausedAt?.toDate()
    }))
    callback(sessions)
  })
}

/**
 * Get a single testing session
 */
export async function getTestingSession(declarationId, sessionId) {
  const docRef = doc(db, 'safetyDeclarations', declarationId, 'testingSessions', sessionId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
    actualStartTime: docSnap.data().actualStartTime?.toDate(),
    actualEndTime: docSnap.data().actualEndTime?.toDate(),
    pausedAt: docSnap.data().pausedAt?.toDate()
  }
}

/**
 * Update a testing session
 */
export async function updateTestingSession(declarationId, sessionId, updates) {
  const sessionRef = doc(db, 'safetyDeclarations', declarationId, 'testingSessions', sessionId)
  await updateDoc(sessionRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })

  // Update declaration lastActivityAt
  await updateDoc(doc(db, 'safetyDeclarations', declarationId), {
    lastActivityAt: serverTimestamp()
  })
}

/**
 * Start a testing session
 */
export async function startTestingSession(declarationId, sessionId) {
  await updateTestingSession(declarationId, sessionId, {
    status: 'in_progress',
    actualStartTime: serverTimestamp()
  })
}

/**
 * Pause a testing session
 */
export async function pauseTestingSession(declarationId, sessionId, reason = '') {
  const session = await getTestingSession(declarationId, sessionId)
  if (!session) return

  const pauseEntry = {
    pausedAt: new Date().toISOString(),
    resumedAt: null,
    reason
  }

  await updateTestingSession(declarationId, sessionId, {
    status: 'paused',
    pausedAt: serverTimestamp(),
    pauseHistory: [...(session.pauseHistory || []), pauseEntry]
  })
}

/**
 * Resume a testing session
 */
export async function resumeTestingSession(declarationId, sessionId) {
  const session = await getTestingSession(declarationId, sessionId)
  if (!session) return

  // Update the last pause entry with resume time
  const pauseHistory = [...(session.pauseHistory || [])]
  if (pauseHistory.length > 0) {
    pauseHistory[pauseHistory.length - 1].resumedAt = new Date().toISOString()
  }

  await updateTestingSession(declarationId, sessionId, {
    status: 'in_progress',
    pausedAt: null,
    resumedAt: serverTimestamp(),
    pauseHistory
  })
}

/**
 * Complete a testing session
 */
export async function completeTestingSession(declarationId, sessionId, results) {
  const session = await getTestingSession(declarationId, sessionId)
  if (!session) return

  // Calculate total duration
  const startTime = session.actualStartTime
  const endTime = new Date()
  let totalMinutes = Math.round((endTime - startTime) / 60000)

  // Subtract paused time
  if (session.pauseHistory) {
    session.pauseHistory.forEach(pause => {
      if (pause.pausedAt && pause.resumedAt) {
        const pauseStart = new Date(pause.pausedAt)
        const pauseEnd = new Date(pause.resumedAt)
        totalMinutes -= Math.round((pauseEnd - pauseStart) / 60000)
      }
    })
  }

  await updateTestingSession(declarationId, sessionId, {
    status: 'complete',
    actualEndTime: serverTimestamp(),
    totalDurationMinutes: Math.max(0, totalMinutes),
    results: {
      ...session.results,
      ...results
    }
  })
}

/**
 * Cancel a testing session
 */
export async function cancelTestingSession(declarationId, sessionId, reason = '') {
  await updateTestingSession(declarationId, sessionId, {
    status: 'cancelled',
    'results.summary': reason
  })
}

/**
 * Delete a testing session
 */
export async function deleteTestingSession(declarationId, sessionId) {
  const sessionRef = doc(db, 'safetyDeclarations', declarationId, 'testingSessions', sessionId)
  await deleteDoc(sessionRef)

  // Update declaration lastActivityAt
  await updateDoc(doc(db, 'safetyDeclarations', declarationId), {
    lastActivityAt: serverTimestamp()
  })
}

// ============================================
// EVIDENCE SUBCOLLECTION
// ============================================

/**
 * Add evidence to a declaration
 */
export async function addEvidence(declarationId, evidenceData) {
  const evidence = {
    declarationId,

    // Evidence metadata
    name: evidenceData.name,
    description: evidenceData.description || '',
    type: evidenceData.type || 'document',

    // File information
    fileUrl: evidenceData.fileUrl || null,
    fileName: evidenceData.fileName || null,
    fileSize: evidenceData.fileSize || null,
    mimeType: evidenceData.mimeType || null,

    // Linked requirements
    linkedRequirements: evidenceData.linkedRequirements || [],

    // Linked testing session
    testingSessionId: evidenceData.testingSessionId || null,

    // Audit
    uploadedBy: evidenceData.uploadedBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(
    collection(db, 'safetyDeclarations', declarationId, 'evidence'),
    evidence
  )

  // Link to requirements if specified
  if (evidenceData.linkedRequirements?.length > 0) {
    for (const reqId of evidenceData.linkedRequirements) {
      await linkEvidenceToRequirement(declarationId, reqId, docRef.id)
    }
  }

  // Update declaration lastActivityAt
  await updateDoc(doc(db, 'safetyDeclarations', declarationId), {
    lastActivityAt: serverTimestamp()
  })

  return { id: docRef.id, ...evidence }
}

/**
 * Get all evidence for a declaration
 */
export async function getDeclarationEvidence(declarationId) {
  const q = query(
    collection(db, 'safetyDeclarations', declarationId, 'evidence'),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))
}

/**
 * Subscribe to evidence
 */
export function subscribeToDeclarationEvidence(declarationId, callback) {
  const q = query(
    collection(db, 'safetyDeclarations', declarationId, 'evidence'),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const evidence = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }))
    callback(evidence)
  })
}

/**
 * Update evidence
 */
export async function updateEvidence(declarationId, evidenceId, updates) {
  const evidenceRef = doc(db, 'safetyDeclarations', declarationId, 'evidence', evidenceId)
  await updateDoc(evidenceRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete evidence
 */
export async function deleteEvidence(declarationId, evidenceId) {
  // First, unlink from all requirements
  const requirements = await getDeclarationRequirements(declarationId)
  for (const req of requirements) {
    if (req.evidenceIds?.includes(evidenceId)) {
      await unlinkEvidenceFromRequirement(declarationId, req.id, evidenceId)
    }
  }

  // Delete the evidence document
  const evidenceRef = doc(db, 'safetyDeclarations', declarationId, 'evidence', evidenceId)
  await deleteDoc(evidenceRef)

  // Update declaration lastActivityAt
  await updateDoc(doc(db, 'safetyDeclarations', declarationId), {
    lastActivityAt: serverTimestamp()
  })
}

// ============================================
// STATISTICS & ANALYTICS
// ============================================

/**
 * Get declaration statistics
 */
export async function getDeclarationStats(declarationId) {
  const [requirements, sessions, evidence] = await Promise.all([
    getDeclarationRequirements(declarationId),
    getTestingSessions(declarationId),
    getDeclarationEvidence(declarationId)
  ])

  const totalRequirements = requirements.length
  const applicableRequirements = requirements.filter(r => r.status !== 'not_applicable')
  const completedRequirements = requirements.filter(r => r.status === 'complete')
  const inProgressRequirements = requirements.filter(r => r.status === 'in_progress')

  const completedSessions = sessions.filter(s => s.status === 'complete')
  const totalTestingMinutes = completedSessions.reduce((sum, s) => sum + (s.totalDurationMinutes || 0), 0)

  return {
    requirements: {
      total: totalRequirements,
      applicable: applicableRequirements.length,
      completed: completedRequirements.length,
      inProgress: inProgressRequirements.length,
      completionPercentage: calculateCompletionPercentage(requirements)
    },
    testing: {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      scheduledSessions: sessions.filter(s => s.status === 'scheduled').length,
      inProgressSessions: sessions.filter(s => s.status === 'in_progress' || s.status === 'paused').length,
      totalTestingMinutes,
      totalTestingHours: Math.round(totalTestingMinutes / 60 * 10) / 10
    },
    evidence: {
      total: evidence.length,
      byType: Object.keys(EVIDENCE_TYPES).reduce((acc, type) => {
        acc[type] = evidence.filter(e => e.type === type).length
        return acc
      }, {})
    }
  }
}

// ============================================
// ACTIVITY LOG (AUDIT TRAIL)
// ============================================

/**
 * Activity log action types
 */
export const ACTIVITY_TYPES = {
  declaration_created: { label: 'Declaration Created', icon: 'Plus', color: 'green' },
  declaration_updated: { label: 'Declaration Updated', icon: 'Edit', color: 'blue' },
  status_changed: { label: 'Status Changed', icon: 'RefreshCw', color: 'blue' },
  requirement_updated: { label: 'Requirement Updated', icon: 'CheckSquare', color: 'blue' },
  requirement_completed: { label: 'Requirement Completed', icon: 'CheckCircle', color: 'green' },
  session_created: { label: 'Test Session Created', icon: 'Plus', color: 'blue' },
  session_started: { label: 'Test Session Started', icon: 'Play', color: 'yellow' },
  session_completed: { label: 'Test Session Completed', icon: 'CheckCircle', color: 'green' },
  session_cancelled: { label: 'Test Session Cancelled', icon: 'XCircle', color: 'red' },
  evidence_uploaded: { label: 'Evidence Uploaded', icon: 'Upload', color: 'blue' },
  evidence_deleted: { label: 'Evidence Deleted', icon: 'Trash', color: 'red' },
  evidence_linked: { label: 'Evidence Linked', icon: 'Link', color: 'blue' },
  comment_added: { label: 'Comment Added', icon: 'MessageSquare', color: 'gray' }
}

/**
 * Log an activity to the declaration's activity log
 */
export async function logActivity(declarationId, activityData) {
  const activity = {
    declarationId,
    type: activityData.type,
    description: activityData.description || '',
    details: activityData.details || {},
    userId: activityData.userId || 'system',
    userName: activityData.userName || 'System',
    createdAt: serverTimestamp()
  }

  const docRef = await addDoc(
    collection(db, 'safetyDeclarations', declarationId, 'activityLog'),
    activity
  )

  return { id: docRef.id, ...activity }
}

/**
 * Get activity log for a declaration
 */
export async function getActivityLog(declarationId, limitCount = 50) {
  const q = query(
    collection(db, 'safetyDeclarations', declarationId, 'activityLog'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate()
  }))
}

/**
 * Subscribe to activity log for real-time updates
 */
export function subscribeToActivityLog(declarationId, callback, limitCount = 50) {
  const q = query(
    collection(db, 'safetyDeclarations', declarationId, 'activityLog'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )

  return onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))
    callback(activities)
  })
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Constants
  DECLARATION_TYPES,
  DECLARATION_STATUSES,
  RPAS_CATEGORIES,
  KINETIC_ENERGY_CATEGORIES,
  OPERATION_TYPES,
  REQUIREMENT_SECTIONS,
  COMPLIANCE_METHODS,
  REQUIREMENT_STATUSES,
  SESSION_STATUSES,
  EVIDENCE_TYPES,
  RELIABILITY_TARGETS,

  // Helpers
  calculateKineticEnergy,
  getKineticEnergyCategory,
  getRPASCategory,
  getApplicableRequirements,
  calculateCompletionPercentage,

  // Declaration CRUD
  createSafetyDeclaration,
  getSafetyDeclaration,
  getSafetyDeclarations,
  subscribeToSafetyDeclarations,
  subscribeToSafetyDeclaration,
  updateSafetyDeclaration,
  updateDeclarationStatus,
  deleteSafetyDeclaration,

  // Requirements
  getDeclarationRequirements,
  subscribeToDeclarationRequirements,
  updateRequirement,
  linkEvidenceToRequirement,
  unlinkEvidenceFromRequirement,

  // Testing Sessions
  createTestingSession,
  getTestingSessions,
  subscribeToTestingSessions,
  getTestingSession,
  updateTestingSession,
  startTestingSession,
  pauseTestingSession,
  resumeTestingSession,
  completeTestingSession,
  cancelTestingSession,
  deleteTestingSession,

  // Evidence
  addEvidence,
  getDeclarationEvidence,
  subscribeToDeclarationEvidence,
  updateEvidence,
  deleteEvidence,

  // Statistics
  getDeclarationStats,

  // Activity Log
  ACTIVITY_TYPES,
  logActivity,
  getActivityLog,
  subscribeToActivityLog
}
