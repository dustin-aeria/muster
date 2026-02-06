/**
 * Firestore SORA Assessment Service
 * Handles CRUD operations for Specific Operational Risk Assessments
 *
 * SORA 2.5 Compliant per JARUS documentation
 * Integrates with soraConfig.js for calculations
 *
 * Collections:
 * - soraAssessments: Main SORA assessment documents
 * - soraAssessments/{id}/osoStatuses: OSO compliance tracking
 * - soraAssessments/{id}/mitigations: Ground and air risk mitigations
 * - soraAssessments/{id}/activityLog: Audit trail
 *
 * @location src/lib/firestoreSora.js
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
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import {
  getIntrinsicGRC,
  calculateFinalGRC,
  calculateResidualARC,
  getSAIL,
  osoDefinitions,
  checkAllOSOCompliance
} from './soraConfig'

// ============================================
// CONSTANTS
// ============================================

/**
 * SORA assessment statuses
 */
export const SORA_STATUSES = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    description: 'Assessment being prepared'
  },
  conops_complete: {
    label: 'ConOps Complete',
    color: 'bg-blue-100 text-blue-800',
    description: 'Concept of Operations documented'
  },
  grc_complete: {
    label: 'GRC Complete',
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Ground Risk Class determined'
  },
  arc_complete: {
    label: 'ARC Complete',
    color: 'bg-purple-100 text-purple-800',
    description: 'Air Risk Class determined'
  },
  sail_determined: {
    label: 'SAIL Determined',
    color: 'bg-orange-100 text-orange-800',
    description: 'SAIL level calculated'
  },
  oso_in_progress: {
    label: 'OSO In Progress',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Completing OSO compliance'
  },
  ready_for_review: {
    label: 'Ready for Review',
    color: 'bg-cyan-100 text-cyan-800',
    description: 'Assessment complete, pending review'
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    description: 'Assessment approved'
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-100 text-gray-500',
    description: 'No longer active'
  }
}

/**
 * ConOps sections for structured entry
 */
export const CONOPS_SECTIONS = {
  operation_description: {
    id: 'operation_description',
    label: 'Operation Description',
    description: 'Purpose and objectives of the operation',
    fields: ['purpose', 'objectives', 'scope', 'duration']
  },
  uas_description: {
    id: 'uas_description',
    label: 'UAS Description',
    description: 'Aircraft characteristics and capabilities',
    fields: ['manufacturer', 'model', 'mtow', 'dimensions', 'propulsion', 'endurance']
  },
  operating_environment: {
    id: 'operating_environment',
    label: 'Operating Environment',
    description: 'Airspace and ground environment',
    fields: ['airspaceClass', 'altitude', 'operationalVolume', 'groundEnvironment']
  },
  crew_composition: {
    id: 'crew_composition',
    label: 'Crew Composition',
    description: 'Remote crew roles and qualifications',
    fields: ['remotePilot', 'visualObservers', 'payloadOperator', 'flightDirector']
  },
  operational_procedures: {
    id: 'operational_procedures',
    label: 'Operational Procedures',
    description: 'Normal and contingency procedures',
    fields: ['normalOps', 'contingencyProcedures', 'emergencyProcedures']
  },
  weather_limitations: {
    id: 'weather_limitations',
    label: 'Weather Limitations',
    description: 'Environmental operating limits',
    fields: ['windLimits', 'visibilityMinimums', 'temperatureRange', 'precipitationLimits']
  }
}

/**
 * Step definitions for wizard
 */
export const SORA_WIZARD_STEPS = [
  { id: 'conops', label: 'Concept of Operations', number: 1 },
  { id: 'ground_risk', label: 'Ground Risk', number: 2 },
  { id: 'air_risk', label: 'Air Risk', number: 3 },
  { id: 'sail', label: 'SAIL Determination', number: 4 },
  { id: 'containment', label: 'Containment', number: 5 },
  { id: 'oso', label: 'OSO Compliance', number: 6 },
  { id: 'review', label: 'Review & Submit', number: 7 }
]

// ============================================
// SORA ASSESSMENT CRUD OPERATIONS
// ============================================

/**
 * Create a new SORA assessment
 */
export async function createSORAAssessment(assessmentData) {
  const assessment = {
    organizationId: assessmentData.organizationId,

    // Identification
    name: assessmentData.name,
    description: assessmentData.description || '',
    version: '1.0',
    status: 'draft',
    currentStep: 'conops',

    // Linked references
    sfocApplicationId: assessmentData.sfocApplicationId || null,
    aircraftId: assessmentData.aircraftId || null,
    projectId: assessmentData.projectId || null,

    // ConOps data
    conops: {
      operationDescription: {
        purpose: assessmentData.purpose || '',
        objectives: assessmentData.objectives || '',
        scope: assessmentData.scope || '',
        duration: assessmentData.duration || ''
      },
      uasDescription: {
        manufacturer: '',
        model: '',
        mtow: null,
        maxDimension: null,
        maxSpeed: null,
        propulsion: '',
        endurance: ''
      },
      operatingEnvironment: {
        airspaceClass: '',
        maxAltitudeAGL: null,
        operationalVolume: '',
        groundEnvironment: ''
      },
      crewComposition: {
        remotePilot: '',
        visualObservers: 0,
        payloadOperator: false,
        flightDirector: false
      },
      operationalProcedures: {
        normalOps: '',
        contingencyProcedures: '',
        emergencyProcedures: ''
      },
      weatherLimitations: {
        maxWindSpeed: null,
        minVisibility: null,
        temperatureRange: '',
        precipitationLimits: ''
      },
      isComplete: false
    },

    // Ground Risk Assessment
    groundRisk: {
      populationCategory: null,
      uaCharacteristic: null,
      intrinsicGRC: null,
      mitigations: {
        M1A: { enabled: false, robustness: null, evidence: '' },
        M1B: { enabled: false, robustness: null, evidence: '' },
        M1C: { enabled: false, robustness: null, evidence: '' },
        M2: { enabled: false, robustness: null, evidence: '' }
      },
      finalGRC: null,
      isComplete: false
    },

    // Air Risk Assessment
    airRisk: {
      initialARC: null,
      airspaceType: '',
      encounterRate: '',
      tmpr: {
        enabled: false,
        type: null, // 'VLOS', 'EVLOS', 'DAA'
        robustness: null,
        evidence: ''
      },
      residualARC: null,
      isComplete: false
    },

    // SAIL Determination
    sail: {
      level: null,
      calculatedAt: null,
      isComplete: false
    },

    // Containment (Step 8)
    containment: {
      adjacentPopulation: null,
      requiredRobustness: null,
      method: null,
      achievedRobustness: null,
      evidence: '',
      isComplete: false
    },

    // OSO Compliance Summary (detailed in subcollection)
    osoSummary: {
      totalOSOs: 24,
      compliantCount: 0,
      nonCompliantCount: 0,
      optionalCount: 0,
      overallCompliant: false,
      lastUpdated: null
    },

    // Final assessment
    finalAssessment: {
      recommendation: null,
      approver: null,
      approvedAt: null,
      notes: ''
    },

    // Audit fields
    createdBy: assessmentData.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'soraAssessments'), assessment)

  // Initialize OSO statuses subcollection
  await initializeOSOStatuses(docRef.id)

  return { id: docRef.id, ...assessment }
}

/**
 * Initialize OSO status documents
 */
async function initializeOSOStatuses(assessmentId) {
  const batch = writeBatch(db)

  osoDefinitions.forEach(oso => {
    const docRef = doc(collection(db, 'soraAssessments', assessmentId, 'osoStatuses'))
    batch.set(docRef, {
      osoId: oso.id,
      category: oso.category,
      name: oso.name,
      description: oso.description,
      responsibility: oso.responsibility,
      robustness: 'none',
      evidence: '',
      evidenceFiles: [],
      notes: '',
      verifiedBy: null,
      verifiedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  })

  await batch.commit()
}

/**
 * Get a SORA assessment by ID
 */
export async function getSORAAssessment(assessmentId) {
  const docRef = doc(db, 'soraAssessments', assessmentId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
    sail: {
      ...docSnap.data().sail,
      calculatedAt: docSnap.data().sail?.calculatedAt?.toDate()
    }
  }
}

/**
 * Get all SORA assessments for an organization
 */
export async function getSORAAssessments(organizationId, options = {}) {
  const { status = null, limitCount = 50 } = options

  let q = query(
    collection(db, 'soraAssessments'),
    where('organizationId', '==', organizationId),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  let assessments = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  }))

  if (status) {
    assessments = assessments.filter(a => a.status === status)
  }

  return assessments
}

/**
 * Subscribe to SORA assessments
 */
export function subscribeToSORAAssessments(organizationId, callback) {
  const q = query(
    collection(db, 'soraAssessments'),
    where('organizationId', '==', organizationId),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const assessments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }))
    callback(assessments)
  })
}

/**
 * Subscribe to a single SORA assessment
 */
export function subscribeToSORAAssessment(assessmentId, callback) {
  const docRef = doc(db, 'soraAssessments', assessmentId)

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
      sail: {
        ...docSnap.data().sail,
        calculatedAt: docSnap.data().sail?.calculatedAt?.toDate()
      }
    })
  })
}

/**
 * Update a SORA assessment
 */
export async function updateSORAAssessment(assessmentId, updates) {
  const assessmentRef = doc(db, 'soraAssessments', assessmentId)
  await updateDoc(assessmentRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

/**
 * Update ConOps section
 */
export async function updateConOps(assessmentId, conopsData) {
  const isComplete = Boolean(
    conopsData.operationDescription?.purpose &&
    conopsData.uasDescription?.mtow &&
    conopsData.operatingEnvironment?.maxAltitudeAGL
  )

  await updateSORAAssessment(assessmentId, {
    conops: {
      ...conopsData,
      isComplete
    },
    currentStep: isComplete ? 'ground_risk' : 'conops'
  })

  // If we have UAS data, auto-calculate UA characteristic
  if (conopsData.uasDescription?.maxDimension && conopsData.uasDescription?.maxSpeed) {
    await autoCalculateUACharacteristic(assessmentId, conopsData.uasDescription)
  }
}

/**
 * Auto-determine UA characteristic from dimensions and speed
 */
async function autoCalculateUACharacteristic(assessmentId, uasData) {
  const { maxDimension, maxSpeed } = uasData

  let uaChar = null
  if (maxDimension <= 1 && maxSpeed <= 25) uaChar = '1m_25ms'
  else if (maxDimension <= 3 && maxSpeed <= 35) uaChar = '3m_35ms'
  else if (maxDimension <= 8 && maxSpeed <= 75) uaChar = '8m_75ms'
  else if (maxDimension <= 20 && maxSpeed <= 120) uaChar = '20m_120ms'
  else if (maxDimension <= 40 && maxSpeed <= 200) uaChar = '40m_200ms'

  if (uaChar) {
    const assessment = await getSORAAssessment(assessmentId)
    if (assessment) {
      await updateSORAAssessment(assessmentId, {
        'groundRisk.uaCharacteristic': uaChar
      })
    }
  }
}

/**
 * Update Ground Risk section and recalculate
 */
export async function updateGroundRisk(assessmentId, groundRiskData) {
  // Calculate intrinsic GRC
  const iGRC = getIntrinsicGRC(
    groundRiskData.populationCategory,
    groundRiskData.uaCharacteristic
  )

  // Calculate final GRC with mitigations
  const finalGRC = calculateFinalGRC(iGRC, groundRiskData.mitigations)

  const isComplete = iGRC !== null && finalGRC !== null

  await updateSORAAssessment(assessmentId, {
    groundRisk: {
      ...groundRiskData,
      intrinsicGRC: iGRC,
      finalGRC,
      isComplete
    },
    currentStep: isComplete ? 'air_risk' : 'ground_risk'
  })

  // If both GRC and ARC are complete, recalculate SAIL
  if (isComplete) {
    await recalculateSAIL(assessmentId)
  }
}

/**
 * Update Air Risk section and recalculate
 */
export async function updateAirRisk(assessmentId, airRiskData) {
  // Calculate residual ARC with TMPR
  const residualARC = calculateResidualARC(
    airRiskData.initialARC,
    airRiskData.tmpr
  )

  const isComplete = Boolean(airRiskData.initialARC && residualARC)

  await updateSORAAssessment(assessmentId, {
    airRisk: {
      ...airRiskData,
      residualARC,
      isComplete
    },
    currentStep: isComplete ? 'sail' : 'air_risk'
  })

  // If both GRC and ARC are complete, recalculate SAIL
  if (isComplete) {
    await recalculateSAIL(assessmentId)
  }
}

/**
 * Recalculate SAIL level
 */
export async function recalculateSAIL(assessmentId) {
  const assessment = await getSORAAssessment(assessmentId)
  if (!assessment) return null

  const { groundRisk, airRisk } = assessment

  if (!groundRisk.finalGRC || !airRisk.residualARC) {
    return null
  }

  const sailLevel = getSAIL(groundRisk.finalGRC, airRisk.residualARC)

  await updateSORAAssessment(assessmentId, {
    sail: {
      level: sailLevel,
      calculatedAt: serverTimestamp(),
      isComplete: sailLevel !== null
    },
    currentStep: sailLevel ? 'containment' : 'sail'
  })

  // Update OSO requirements based on new SAIL
  if (sailLevel) {
    await updateOSORequirements(assessmentId, sailLevel)
  }

  return sailLevel
}

/**
 * Update Containment section
 */
export async function updateContainment(assessmentId, containmentData) {
  const isComplete = Boolean(
    containmentData.adjacentPopulation &&
    containmentData.method &&
    containmentData.achievedRobustness
  )

  await updateSORAAssessment(assessmentId, {
    containment: {
      ...containmentData,
      isComplete
    },
    currentStep: isComplete ? 'oso' : 'containment'
  })
}

/**
 * Update OSO requirements based on SAIL
 */
async function updateOSORequirements(assessmentId, sailLevel) {
  // Get existing OSO statuses
  const osoStatuses = await getOSOStatuses(assessmentId)

  // Check compliance for each OSO
  const osoStatusMap = {}
  osoStatuses.forEach(oso => {
    osoStatusMap[oso.osoId] = { robustness: oso.robustness, evidence: oso.evidence }
  })

  const compliance = checkAllOSOCompliance(sailLevel, osoStatusMap)

  await updateSORAAssessment(assessmentId, {
    osoSummary: {
      totalOSOs: compliance.summary.total,
      compliantCount: compliance.summary.compliant,
      nonCompliantCount: compliance.summary.nonCompliant,
      optionalCount: compliance.summary.optional,
      overallCompliant: compliance.summary.overallCompliant,
      lastUpdated: serverTimestamp()
    }
  })
}

// ============================================
// OSO STATUS OPERATIONS
// ============================================

/**
 * Get all OSO statuses for an assessment
 */
export async function getOSOStatuses(assessmentId) {
  const q = query(
    collection(db, 'soraAssessments', assessmentId, 'osoStatuses'),
    orderBy('osoId', 'asc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    verifiedAt: doc.data().verifiedAt?.toDate()
  }))
}

/**
 * Subscribe to OSO statuses
 */
export function subscribeToOSOStatuses(assessmentId, callback) {
  const q = query(
    collection(db, 'soraAssessments', assessmentId, 'osoStatuses'),
    orderBy('osoId', 'asc')
  )

  return onSnapshot(q, (snapshot) => {
    const statuses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      verifiedAt: doc.data().verifiedAt?.toDate()
    }))
    callback(statuses)
  })
}

/**
 * Update an OSO status
 */
export async function updateOSOStatus(assessmentId, osoDocId, updates) {
  const docRef = doc(db, 'soraAssessments', assessmentId, 'osoStatuses', osoDocId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })

  // Get current SAIL and recalculate compliance
  const assessment = await getSORAAssessment(assessmentId)
  if (assessment?.sail?.level) {
    await updateOSORequirements(assessmentId, assessment.sail.level)
  }
}

/**
 * Batch update multiple OSO statuses
 */
export async function batchUpdateOSOStatuses(assessmentId, updates) {
  const batch = writeBatch(db)

  updates.forEach(({ osoDocId, data }) => {
    const docRef = doc(db, 'soraAssessments', assessmentId, 'osoStatuses', osoDocId)
    batch.update(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
  })

  await batch.commit()

  // Recalculate compliance
  const assessment = await getSORAAssessment(assessmentId)
  if (assessment?.sail?.level) {
    await updateOSORequirements(assessmentId, assessment.sail.level)
  }
}

// ============================================
// FINAL APPROVAL AND SUBMISSION
// ============================================

/**
 * Submit assessment for review
 */
export async function submitForReview(assessmentId) {
  await updateSORAAssessment(assessmentId, {
    status: 'ready_for_review',
    currentStep: 'review'
  })
}

/**
 * Approve assessment
 */
export async function approveAssessment(assessmentId, approverInfo) {
  await updateSORAAssessment(assessmentId, {
    status: 'approved',
    finalAssessment: {
      recommendation: 'approved',
      approver: approverInfo.userId,
      approverName: approverInfo.name,
      approvedAt: serverTimestamp(),
      notes: approverInfo.notes || ''
    }
  })
}

// ============================================
// LINKING TO SFOC
// ============================================

/**
 * Link SORA assessment to SFOC application
 */
export async function linkToSFOC(assessmentId, sfocApplicationId) {
  await updateSORAAssessment(assessmentId, {
    sfocApplicationId
  })
}

/**
 * Get SORA summary for SFOC integration
 */
export async function getSORAForSFOC(assessmentId) {
  const assessment = await getSORAAssessment(assessmentId)
  if (!assessment) return null

  return {
    assessmentId,
    name: assessment.name,
    sailLevel: assessment.sail?.level,
    finalGRC: assessment.groundRisk?.finalGRC,
    residualARC: assessment.airRisk?.residualARC,
    osoCompliancePercentage: assessment.osoSummary?.overallCompliant
      ? 100
      : Math.round((assessment.osoSummary?.compliantCount / assessment.osoSummary?.totalOSOs) * 100) || 0,
    status: assessment.status
  }
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get SORA assessment statistics
 */
export async function getSORAStats(organizationId) {
  const assessments = await getSORAAssessments(organizationId, { limitCount: 1000 })

  const stats = {
    total: assessments.length,
    byStatus: {},
    bySAIL: { 'I': 0, 'II': 0, 'III': 0, 'IV': 0, 'V': 0, 'VI': 0 },
    inProgress: 0,
    approved: 0,
    osoCompliant: 0
  }

  assessments.forEach(assessment => {
    // Count by status
    stats.byStatus[assessment.status] = (stats.byStatus[assessment.status] || 0) + 1

    // Count by SAIL
    if (assessment.sail?.level) {
      stats.bySAIL[assessment.sail.level]++
    }

    // Count in progress
    if (!['approved', 'archived'].includes(assessment.status)) {
      stats.inProgress++
    }

    // Count approved
    if (assessment.status === 'approved') {
      stats.approved++
    }

    // Count OSO compliant
    if (assessment.osoSummary?.overallCompliant) {
      stats.osoCompliant++
    }
  })

  return stats
}

// ============================================
// DELETE
// ============================================

/**
 * Delete a SORA assessment
 */
export async function deleteSORAAssessment(assessmentId) {
  const batch = writeBatch(db)

  // Delete OSO statuses
  const osoQuery = query(collection(db, 'soraAssessments', assessmentId, 'osoStatuses'))
  const osoSnapshot = await getDocs(osoQuery)
  osoSnapshot.docs.forEach(docSnap => {
    batch.delete(doc(db, 'soraAssessments', assessmentId, 'osoStatuses', docSnap.id))
  })

  // Delete the assessment
  batch.delete(doc(db, 'soraAssessments', assessmentId))

  await batch.commit()
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Constants
  SORA_STATUSES,
  CONOPS_SECTIONS,
  SORA_WIZARD_STEPS,

  // Assessment CRUD
  createSORAAssessment,
  getSORAAssessment,
  getSORAAssessments,
  subscribeToSORAAssessments,
  subscribeToSORAAssessment,
  updateSORAAssessment,
  deleteSORAAssessment,

  // Section updates
  updateConOps,
  updateGroundRisk,
  updateAirRisk,
  recalculateSAIL,
  updateContainment,

  // OSO operations
  getOSOStatuses,
  subscribeToOSOStatuses,
  updateOSOStatus,
  batchUpdateOSOStatuses,

  // Approval flow
  submitForReview,
  approveAssessment,

  // SFOC integration
  linkToSFOC,
  getSORAForSFOC,

  // Statistics
  getSORAStats
}
