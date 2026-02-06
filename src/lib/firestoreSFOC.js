/**
 * Firestore SFOC (Special Flight Operations Certificate) Service
 * Handles CRUD operations for Transport Canada SFOC-RPAS applications
 *
 * Required for:
 * - RPAS >150kg (Large RPAS) per CAR 903.01(a)
 * - Medium/High complexity operations
 * - BVLOS beyond Level 1 Complex Operations
 * - Operations with dangerous payloads
 *
 * Collections:
 * - sfocApplications: Main SFOC applications
 * - sfocApplications/{id}/documents: Document checklist tracking
 * - sfocApplications/{id}/communications: TC communication log
 * - sfocApplications/{id}/activityLog: Audit trail
 *
 * @location src/lib/firestoreSFOC.js
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

// ============================================
// CONSTANTS
// ============================================

/**
 * SFOC complexity levels per Transport Canada
 */
export const SFOC_COMPLEXITY = {
  medium: {
    id: 'medium',
    label: 'Medium Complexity',
    description: 'RPAS >150kg, altitude >400ft, foreign operators, multiple RPAS',
    processingDays: 60,
    fee: 500, // CAD, varies
    car_reference: 'CAR 903.02(3)'
  },
  high: {
    id: 'high',
    label: 'High Complexity',
    description: 'Extended BVLOS, aerodrome environment, hazardous payloads, piloted drones',
    processingDays: 60,
    fee: 2000, // CAD, varies
    car_reference: 'CAR 903.02(4)'
  }
}

/**
 * SFOC application statuses
 */
export const SFOC_STATUSES = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    description: 'Application being prepared'
  },
  documents_pending: {
    label: 'Documents Pending',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Collecting required documentation'
  },
  sora_in_progress: {
    label: 'SORA In Progress',
    color: 'bg-blue-100 text-blue-800',
    description: 'Completing Specific Operational Risk Assessment'
  },
  review_ready: {
    label: 'Ready for Review',
    color: 'bg-purple-100 text-purple-800',
    description: 'Internal review before submission'
  },
  submitted: {
    label: 'Submitted to TC',
    color: 'bg-blue-100 text-blue-800',
    description: 'Application submitted to Transport Canada'
  },
  under_review: {
    label: 'Under TC Review',
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Transport Canada reviewing application'
  },
  additional_info_requested: {
    label: 'Additional Info Requested',
    color: 'bg-orange-100 text-orange-800',
    description: 'TC has requested additional information'
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    description: 'SFOC approved by Transport Canada'
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    description: 'Application rejected - see TC comments'
  },
  expired: {
    label: 'Expired',
    color: 'bg-gray-100 text-gray-600',
    description: 'SFOC validity period has ended'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-500',
    description: 'Application cancelled by operator'
  }
}

/**
 * SFOC application types
 */
export const SFOC_APPLICATION_TYPES = {
  new: {
    label: 'New Application',
    description: 'First-time SFOC application'
  },
  renewal: {
    label: 'Renewal',
    description: 'Renewing an existing SFOC before expiry'
  },
  amendment: {
    label: 'Amendment',
    description: 'Modifying conditions of an existing SFOC'
  }
}

/**
 * Operation types requiring SFOC per CAR 903.01
 */
export const SFOC_OPERATION_TRIGGERS = {
  large_rpas: {
    id: 'large_rpas',
    label: 'Large RPAS (>150kg)',
    description: 'Operating an RPAS with weight exceeding 150kg',
    car_reference: 'CAR 903.01(a)',
    complexity: 'medium'
  },
  altitude_above_400: {
    id: 'altitude_above_400',
    label: 'Altitude >400ft AGL',
    description: 'Operating above 400 feet in uncontrolled airspace',
    car_reference: 'CAR 903.01(b)',
    complexity: 'medium'
  },
  multiple_rpas_vlos: {
    id: 'multiple_rpas_vlos',
    label: 'Multiple RPAS VLOS (>5)',
    description: 'Flying more than 5 drones within VLOS',
    car_reference: 'CAR 903.01(c)',
    complexity: 'medium'
  },
  multiple_rpas_bvlos: {
    id: 'multiple_rpas_bvlos',
    label: 'Multiple RPAS BVLOS (>1)',
    description: 'Flying more than 1 drone BVLOS',
    car_reference: 'CAR 903.01(d)',
    complexity: 'medium'
  },
  foreign_operator: {
    id: 'foreign_operator',
    label: 'Foreign Pilot/Operator',
    description: 'Non-citizen/permanent resident commercial operations',
    car_reference: 'CAR 903.01(e)',
    complexity: 'medium'
  },
  international: {
    id: 'international',
    label: 'International Operations',
    description: 'Flying outside Canadian airspace',
    car_reference: 'CAR 903.01(f)',
    complexity: 'medium'
  },
  extended_bvlos: {
    id: 'extended_bvlos',
    label: 'Extended BVLOS',
    description: 'BVLOS beyond sheltered/EVLOS/lower-risk categories',
    car_reference: 'CAR 903.01(g)',
    complexity: 'high'
  },
  bvlos_aerodrome: {
    id: 'bvlos_aerodrome',
    label: 'BVLOS in Aerodrome Environment',
    description: 'BVLOS operations within aerodrome boundaries',
    car_reference: 'CAR 903.01(h)',
    complexity: 'high'
  },
  medium_adverse_weather: {
    id: 'medium_adverse_weather',
    label: 'Medium RPAS Adverse Weather',
    description: 'Flying medium-sized drone in adverse weather or poor visibility',
    car_reference: 'CAR 903.01(i)',
    complexity: 'high'
  },
  hazardous_payload: {
    id: 'hazardous_payload',
    label: 'Hazardous/Dangerous Payload',
    description: 'Operating with dangerous or hazardous payloads',
    car_reference: 'CAR 903.01(j)',
    complexity: 'high'
  },
  piloted_drone: {
    id: 'piloted_drone',
    label: 'Piloted Drone',
    description: 'Flying with a person on board',
    car_reference: 'CAR 903.01(k)',
    complexity: 'high'
  },
  advertised_event: {
    id: 'advertised_event',
    label: 'Advertised Event',
    description: 'Flying at a public advertised event',
    car_reference: 'CAR 903.01(l)',
    complexity: 'medium'
  }
}

/**
 * Required documents for SFOC application
 * Based on TC Medium/High Complexity Compliance Checklist
 */
export const SFOC_DOCUMENT_REQUIREMENTS = {
  // Administrative Documents
  application_form: {
    id: 'application_form',
    category: 'administrative',
    label: 'SFOC Application Form (26-0835E)',
    description: 'Completed Application for Special Flight Operations Certificate RPAS',
    required: true,
    template: 'https://tc.canada.ca/en/aviation/drone-safety'
  },
  fee_payment: {
    id: 'fee_payment',
    category: 'administrative',
    label: 'Fee Payment Confirmation',
    description: 'Proof of SFOC application fee payment',
    required: true,
    effectiveDate: '2025-11-04'
  },

  // Concept of Operations
  conops: {
    id: 'conops',
    category: 'operational',
    label: 'Concept of Operations (ConOps)',
    description: 'Detailed description of operational purpose, crew, RPAS system, procedures, and environment',
    required: true,
    sections: [
      'Purpose and scope of operations',
      'Operational environment description',
      'Crew roles and responsibilities',
      'Communication procedures',
      'Airspace considerations',
      'Expected environmental conditions'
    ]
  },

  // Risk Assessment
  sora_assessment: {
    id: 'sora_assessment',
    category: 'risk',
    label: 'SORA Assessment (AC 903-001)',
    description: 'Specific Operational Risk Assessment per Advisory Circular 903-001',
    required: true,
    linkedModule: 'soraAssessment'
  },
  safety_plan: {
    id: 'safety_plan',
    category: 'risk',
    label: 'Safety Plan',
    description: 'Hazard identification and risk mitigation measures',
    required: true,
    sections: [
      'Hazard identification',
      'Risk assessment matrix',
      'Mitigation measures',
      'Normal operating procedures',
      'Contingency procedures'
    ]
  },
  emergency_response_plan: {
    id: 'emergency_response_plan',
    category: 'risk',
    label: 'Emergency Response Plan',
    description: 'Emergency contingency and response procedures',
    required: true,
    sections: [
      'Emergency contact information',
      'Incident response procedures',
      'Notification requirements (TSB, TC, WorkSafeBC)',
      'Recovery procedures',
      'Communication protocols'
    ]
  },

  // Equipment Documentation
  registration_certificate: {
    id: 'registration_certificate',
    category: 'equipment',
    label: 'RPA Certificate of Registration',
    description: 'Certificate showing manufacturer, model, and registration number',
    required: true
  },
  manufacturer_declaration: {
    id: 'manufacturer_declaration',
    category: 'equipment',
    label: 'Manufacturer Performance Declaration',
    description: 'RPAS manufacturer performance declaration accepted by TC (required for >150kg or BVLOS)',
    required: true,
    requiredFor: ['large_rpas', 'extended_bvlos', 'bvlos_aerodrome'],
    linkedModule: 'manufacturerDeclaration'
  },
  technical_specifications: {
    id: 'technical_specifications',
    category: 'equipment',
    label: 'Technical Specifications',
    description: 'Performance specifications and limitations',
    required: true
  },
  maintenance_instructions: {
    id: 'maintenance_instructions',
    category: 'equipment',
    label: 'Maintenance Instructions',
    description: 'Manufacturer maintenance instructions and schedule',
    required: true
  },
  parachute_documentation: {
    id: 'parachute_documentation',
    category: 'equipment',
    label: 'Parachute System Documentation',
    description: 'Parachute system safety information and deployment altitude (if applicable)',
    required: false,
    requiredIf: 'parachuteEquipped'
  },

  // Crew Documentation
  pilot_certificate: {
    id: 'pilot_certificate',
    category: 'crew',
    label: 'Pilot Certificate - Advanced Operations',
    description: 'Valid drone pilot certificate for advanced operations',
    required: true
  },
  sail_qualification: {
    id: 'sail_qualification',
    category: 'crew',
    label: 'SAIL Level Qualification',
    description: 'Confirmation of qualification for the determined SAIL level',
    required: true
  },
  training_records: {
    id: 'training_records',
    category: 'crew',
    label: 'Training Records',
    description: 'Crew training documentation and recency',
    required: true
  },
  medical_fitness: {
    id: 'medical_fitness',
    category: 'crew',
    label: 'Medical Fitness Assessment',
    description: 'Medical fitness assessment by licensed physician (if required)',
    required: false,
    requiredFor: ['high']
  },

  // Operational Documentation
  site_survey: {
    id: 'site_survey',
    category: 'operational',
    label: 'Site Survey',
    description: 'Site survey documentation or procedure for evaluating multiple sites',
    required: true
  },
  operations_manual: {
    id: 'operations_manual',
    category: 'operational',
    label: 'RPAS Operations Manual',
    description: 'Company and RPAS operation manuals',
    required: true
  },
  maintenance_manual: {
    id: 'maintenance_manual',
    category: 'operational',
    label: 'Maintenance Control Manual',
    description: 'Maintenance policies, procedures, and tracking',
    required: true
  },
  separation_procedures: {
    id: 'separation_procedures',
    category: 'operational',
    label: 'Separation & Collision Avoidance',
    description: 'Procedures for separation and collision avoidance',
    required: true
  },
  insurance_proof: {
    id: 'insurance_proof',
    category: 'operational',
    label: 'Liability Insurance',
    description: 'Proof of liability insurance (minimum $100K, typically $1M+ for commercial)',
    required: true,
    minimumCoverage: 100000
  }
}

/**
 * Document categories for organization
 */
export const DOCUMENT_CATEGORIES = {
  administrative: { label: 'Administrative', icon: 'FileText', order: 1 },
  operational: { label: 'Operational', icon: 'MapPin', order: 2 },
  risk: { label: 'Risk Assessment', icon: 'AlertTriangle', order: 3 },
  equipment: { label: 'Equipment', icon: 'Cpu', order: 4 },
  crew: { label: 'Crew', icon: 'Users', order: 5 }
}

/**
 * Document statuses
 */
export const DOCUMENT_STATUSES = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  uploaded: { label: 'Uploaded', color: 'bg-blue-100 text-blue-800' },
  under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Needs Revision', color: 'bg-red-100 text-red-800' },
  not_applicable: { label: 'N/A', color: 'bg-gray-100 text-gray-500' }
}

/**
 * Communication types for TC correspondence
 */
export const COMMUNICATION_TYPES = {
  submission: { label: 'Initial Submission', icon: 'Send' },
  info_request: { label: 'Information Request', icon: 'HelpCircle' },
  info_response: { label: 'Information Response', icon: 'MessageSquare' },
  clarification: { label: 'Clarification', icon: 'MessageCircle' },
  approval: { label: 'Approval Letter', icon: 'CheckCircle' },
  rejection: { label: 'Rejection Notice', icon: 'XCircle' },
  amendment: { label: 'Amendment Request', icon: 'Edit' },
  renewal: { label: 'Renewal Request', icon: 'RefreshCw' }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determine complexity level based on operation triggers
 * @param {string[]} operationTriggers - Array of operation trigger IDs
 * @returns {'medium' | 'high'} Complexity level
 */
export function determineComplexity(operationTriggers) {
  const hasHighComplexity = operationTriggers.some(
    trigger => SFOC_OPERATION_TRIGGERS[trigger]?.complexity === 'high'
  )
  return hasHighComplexity ? 'high' : 'medium'
}

/**
 * Get required documents based on operation triggers and complexity
 * @param {string[]} operationTriggers - Array of operation trigger IDs
 * @param {string} complexity - Complexity level
 * @param {object} options - Additional options (e.g., parachuteEquipped)
 * @returns {object[]} Array of required document definitions
 */
export function getRequiredDocuments(operationTriggers, complexity, options = {}) {
  return Object.entries(SFOC_DOCUMENT_REQUIREMENTS).map(([id, doc]) => {
    let isRequired = doc.required

    // Check if required for specific operations
    if (doc.requiredFor) {
      isRequired = doc.requiredFor.some(trigger =>
        operationTriggers.includes(trigger) || trigger === complexity
      )
    }

    // Check conditional requirements
    if (doc.requiredIf && !options[doc.requiredIf]) {
      isRequired = false
    }

    return {
      ...doc,
      isRequired
    }
  })
}

/**
 * Calculate document completion percentage
 * @param {object[]} documents - Array of document status objects
 * @returns {number} Percentage complete (0-100)
 */
export function calculateDocumentCompletion(documents) {
  if (!documents || documents.length === 0) return 0

  const required = documents.filter(d => d.isRequired && d.status !== 'not_applicable')
  if (required.length === 0) return 100

  const complete = required.filter(d =>
    d.status === 'approved' || d.status === 'uploaded'
  ).length

  return Math.round((complete / required.length) * 100)
}

/**
 * Calculate days until SFOC expiry
 * @param {Date} expiryDate - SFOC expiry date
 * @returns {number} Days until expiry (negative if expired)
 */
export function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Check if SFOC is expiring soon (within 60 days)
 * @param {Date} expiryDate - SFOC expiry date
 * @returns {boolean}
 */
export function isExpiringSoon(expiryDate) {
  const days = getDaysUntilExpiry(expiryDate)
  return days !== null && days <= 60 && days > 0
}

/**
 * Check if SFOC is expired
 * @param {Date} expiryDate - SFOC expiry date
 * @returns {boolean}
 */
export function isExpired(expiryDate) {
  const days = getDaysUntilExpiry(expiryDate)
  return days !== null && days <= 0
}

// ============================================
// SFOC APPLICATION CRUD OPERATIONS
// ============================================

/**
 * Create a new SFOC application
 */
export async function createSFOCApplication(applicationData) {
  const complexity = determineComplexity(applicationData.operationTriggers || [])

  const application = {
    organizationId: applicationData.organizationId,

    // Application metadata
    name: applicationData.name,
    description: applicationData.description || '',
    applicationType: applicationData.applicationType || 'new',
    complexityLevel: complexity,
    status: 'draft',

    // Operation details
    operationTriggers: applicationData.operationTriggers || [],
    operationDescription: applicationData.operationDescription || '',
    proposedStartDate: applicationData.proposedStartDate || null,
    proposedEndDate: applicationData.proposedEndDate || null,
    operationalArea: applicationData.operationalArea || '',

    // Linked references
    aircraftId: applicationData.aircraftId || null,
    aircraftDetails: applicationData.aircraftDetails || null,
    manufacturerDeclarationId: applicationData.manufacturerDeclarationId || null,
    soraAssessmentId: applicationData.soraAssessmentId || null,
    projectId: applicationData.projectId || null,

    // SORA summary (populated when linked)
    soraSummary: {
      sailLevel: null,
      finalGRC: null,
      residualARC: null,
      osoCompliancePercentage: null
    },

    // TC communication
    tcReferenceNumber: null,
    submissionDate: null,
    tcResponseDate: null,
    tcComments: null,

    // Approved SFOC details
    approvedStartDate: null,
    approvedEndDate: null,
    sfocNumber: null,
    conditions: [],

    // Applicant information
    applicantInfo: {
      name: applicationData.applicantInfo?.name || '',
      organization: applicationData.applicantInfo?.organization || '',
      email: applicationData.applicantInfo?.email || '',
      phone: applicationData.applicantInfo?.phone || '',
      address: applicationData.applicantInfo?.address || ''
    },

    // Renewal/amendment reference
    previousSfocId: applicationData.previousSfocId || null,
    previousSfocNumber: applicationData.previousSfocNumber || null,

    // Audit fields
    createdBy: applicationData.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'sfocApplications'), application)

  // Initialize document checklist
  await initializeDocumentChecklist(docRef.id, applicationData.operationTriggers || [], complexity)

  return { id: docRef.id, ...application }
}

/**
 * Initialize document checklist for an application
 */
async function initializeDocumentChecklist(applicationId, operationTriggers, complexity) {
  const batch = writeBatch(db)
  const requiredDocs = getRequiredDocuments(operationTriggers, complexity)

  requiredDocs.forEach(docDef => {
    const docRef = doc(collection(db, 'sfocApplications', applicationId, 'documents'))
    batch.set(docRef, {
      documentId: docDef.id,
      category: docDef.category,
      label: docDef.label,
      description: docDef.description,
      isRequired: docDef.isRequired,
      status: docDef.isRequired ? 'not_started' : 'not_applicable',
      fileUrl: null,
      fileName: null,
      fileSize: null,
      uploadedAt: null,
      uploadedBy: null,
      reviewNotes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  })

  await batch.commit()
}

/**
 * Get an SFOC application by ID
 */
export async function getSFOCApplication(applicationId) {
  const docRef = doc(db, 'sfocApplications', applicationId)
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
    submissionDate: docSnap.data().submissionDate?.toDate(),
    tcResponseDate: docSnap.data().tcResponseDate?.toDate(),
    proposedStartDate: docSnap.data().proposedStartDate?.toDate(),
    proposedEndDate: docSnap.data().proposedEndDate?.toDate(),
    approvedStartDate: docSnap.data().approvedStartDate?.toDate(),
    approvedEndDate: docSnap.data().approvedEndDate?.toDate()
  }
}

/**
 * Get all SFOC applications for an organization
 */
export async function getSFOCApplications(organizationId, options = {}) {
  const { status = null, limitCount = 50 } = options

  let q = query(
    collection(db, 'sfocApplications'),
    where('organizationId', '==', organizationId),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  )

  const snapshot = await getDocs(q)
  let applications = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    lastActivityAt: doc.data().lastActivityAt?.toDate(),
    proposedStartDate: doc.data().proposedStartDate?.toDate(),
    proposedEndDate: doc.data().proposedEndDate?.toDate(),
    approvedStartDate: doc.data().approvedStartDate?.toDate(),
    approvedEndDate: doc.data().approvedEndDate?.toDate()
  }))

  if (status) {
    applications = applications.filter(a => a.status === status)
  }

  return applications
}

/**
 * Subscribe to SFOC applications for real-time updates
 */
export function subscribeToSFOCApplications(organizationId, callback) {
  const q = query(
    collection(db, 'sfocApplications'),
    where('organizationId', '==', organizationId),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastActivityAt: doc.data().lastActivityAt?.toDate(),
      proposedStartDate: doc.data().proposedStartDate?.toDate(),
      proposedEndDate: doc.data().proposedEndDate?.toDate(),
      approvedStartDate: doc.data().approvedStartDate?.toDate(),
      approvedEndDate: doc.data().approvedEndDate?.toDate()
    }))
    callback(applications)
  })
}

/**
 * Subscribe to a single SFOC application
 */
export function subscribeToSFOCApplication(applicationId, callback) {
  const docRef = doc(db, 'sfocApplications', applicationId)

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
      lastActivityAt: docSnap.data().lastActivityAt?.toDate(),
      submissionDate: docSnap.data().submissionDate?.toDate(),
      tcResponseDate: docSnap.data().tcResponseDate?.toDate(),
      proposedStartDate: docSnap.data().proposedStartDate?.toDate(),
      proposedEndDate: docSnap.data().proposedEndDate?.toDate(),
      approvedStartDate: docSnap.data().approvedStartDate?.toDate(),
      approvedEndDate: docSnap.data().approvedEndDate?.toDate()
    })
  })
}

/**
 * Update an SFOC application
 */
export async function updateSFOCApplication(applicationId, updates) {
  const applicationRef = doc(db, 'sfocApplications', applicationId)
  await updateDoc(applicationRef, {
    ...updates,
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp()
  })
}

/**
 * Update application status
 */
export async function updateSFOCStatus(applicationId, status, additionalUpdates = {}) {
  const updates = { status, ...additionalUpdates }

  if (status === 'submitted') {
    updates.submissionDate = serverTimestamp()
  } else if (status === 'approved') {
    updates.tcResponseDate = serverTimestamp()
  } else if (status === 'rejected') {
    updates.tcResponseDate = serverTimestamp()
  }

  await updateSFOCApplication(applicationId, updates)
}

/**
 * Link SORA assessment to SFOC application
 */
export async function linkSORAToSFOC(applicationId, soraAssessmentId, soraSummary) {
  await updateSFOCApplication(applicationId, {
    soraAssessmentId,
    soraSummary: {
      sailLevel: soraSummary.sailLevel,
      finalGRC: soraSummary.finalGRC,
      residualARC: soraSummary.residualARC,
      osoCompliancePercentage: soraSummary.osoCompliancePercentage
    }
  })
}

/**
 * Link manufacturer declaration to SFOC application
 */
export async function linkManufacturerDeclarationToSFOC(applicationId, declarationId) {
  await updateSFOCApplication(applicationId, {
    manufacturerDeclarationId: declarationId
  })
}

/**
 * Delete an SFOC application
 */
export async function deleteSFOCApplication(applicationId) {
  const batch = writeBatch(db)

  // Delete documents
  const docsQuery = query(collection(db, 'sfocApplications', applicationId, 'documents'))
  const docsSnapshot = await getDocs(docsQuery)
  docsSnapshot.docs.forEach(docSnap => {
    batch.delete(doc(db, 'sfocApplications', applicationId, 'documents', docSnap.id))
  })

  // Delete communications
  const commsQuery = query(collection(db, 'sfocApplications', applicationId, 'communications'))
  const commsSnapshot = await getDocs(commsQuery)
  commsSnapshot.docs.forEach(docSnap => {
    batch.delete(doc(db, 'sfocApplications', applicationId, 'communications', docSnap.id))
  })

  // Delete activity log
  const activityQuery = query(collection(db, 'sfocApplications', applicationId, 'activityLog'))
  const activitySnapshot = await getDocs(activityQuery)
  activitySnapshot.docs.forEach(docSnap => {
    batch.delete(doc(db, 'sfocApplications', applicationId, 'activityLog', docSnap.id))
  })

  // Delete the application
  batch.delete(doc(db, 'sfocApplications', applicationId))

  await batch.commit()
}

// ============================================
// DOCUMENT CHECKLIST OPERATIONS
// ============================================

/**
 * Get all documents for an application
 */
export async function getSFOCDocuments(applicationId) {
  const q = query(
    collection(db, 'sfocApplications', applicationId, 'documents'),
    orderBy('category', 'asc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    uploadedAt: doc.data().uploadedAt?.toDate()
  }))
}

/**
 * Subscribe to documents for real-time updates
 */
export function subscribeToSFOCDocuments(applicationId, callback) {
  const q = query(
    collection(db, 'sfocApplications', applicationId, 'documents'),
    orderBy('category', 'asc')
  )

  return onSnapshot(q, (snapshot) => {
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      uploadedAt: doc.data().uploadedAt?.toDate()
    }))
    callback(documents)
  })
}

/**
 * Update a document's status
 */
export async function updateSFOCDocument(applicationId, documentId, updates) {
  const docRef = doc(db, 'sfocApplications', applicationId, 'documents', documentId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })

  // Update application lastActivityAt
  await updateDoc(doc(db, 'sfocApplications', applicationId), {
    lastActivityAt: serverTimestamp()
  })
}

/**
 * Upload a document file
 */
export async function uploadSFOCDocumentFile(applicationId, documentId, fileData, uploadedBy) {
  await updateSFOCDocument(applicationId, documentId, {
    status: 'uploaded',
    fileUrl: fileData.fileUrl,
    fileName: fileData.fileName,
    fileSize: fileData.fileSize,
    mimeType: fileData.mimeType,
    uploadedAt: serverTimestamp(),
    uploadedBy
  })
}

// ============================================
// COMMUNICATIONS LOG
// ============================================

/**
 * Add a communication entry
 */
export async function addSFOCCommunication(applicationId, communicationData) {
  const communication = {
    applicationId,
    type: communicationData.type,
    subject: communicationData.subject || '',
    content: communicationData.content || '',
    direction: communicationData.direction || 'outbound', // 'outbound' or 'inbound'
    attachments: communicationData.attachments || [],
    tcReferenceNumber: communicationData.tcReferenceNumber || null,
    sentBy: communicationData.sentBy || null,
    receivedFrom: communicationData.receivedFrom || null,
    date: communicationData.date || serverTimestamp(),
    createdAt: serverTimestamp()
  }

  const docRef = await addDoc(
    collection(db, 'sfocApplications', applicationId, 'communications'),
    communication
  )

  // Update application lastActivityAt
  await updateDoc(doc(db, 'sfocApplications', applicationId), {
    lastActivityAt: serverTimestamp()
  })

  return { id: docRef.id, ...communication }
}

/**
 * Get all communications for an application
 */
export async function getSFOCCommunications(applicationId) {
  const q = query(
    collection(db, 'sfocApplications', applicationId, 'communications'),
    orderBy('date', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
    createdAt: doc.data().createdAt?.toDate()
  }))
}

/**
 * Subscribe to communications
 */
export function subscribeToSFOCCommunications(applicationId, callback) {
  const q = query(
    collection(db, 'sfocApplications', applicationId, 'communications'),
    orderBy('date', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const communications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }))
    callback(communications)
  })
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get SFOC application statistics for an organization
 */
export async function getSFOCStats(organizationId) {
  const applications = await getSFOCApplications(organizationId, { limitCount: 1000 })

  const stats = {
    total: applications.length,
    byStatus: {},
    byComplexity: { medium: 0, high: 0 },
    active: 0,
    expiringSoon: 0,
    expired: 0,
    pending: 0
  }

  applications.forEach(app => {
    // Count by status
    stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1

    // Count by complexity
    if (app.complexityLevel) {
      stats.byComplexity[app.complexityLevel]++
    }

    // Count active/expiring
    if (app.status === 'approved') {
      if (isExpired(app.approvedEndDate)) {
        stats.expired++
      } else if (isExpiringSoon(app.approvedEndDate)) {
        stats.expiringSoon++
        stats.active++
      } else {
        stats.active++
      }
    }

    // Count pending (in review process)
    if (['submitted', 'under_review', 'additional_info_requested'].includes(app.status)) {
      stats.pending++
    }
  })

  return stats
}

// ============================================
// ACTIVITY LOG
// ============================================

/**
 * Log an activity
 */
export async function logSFOCActivity(applicationId, activityData) {
  const activity = {
    applicationId,
    type: activityData.type,
    description: activityData.description || '',
    details: activityData.details || {},
    userId: activityData.userId || 'system',
    userName: activityData.userName || 'System',
    createdAt: serverTimestamp()
  }

  const docRef = await addDoc(
    collection(db, 'sfocApplications', applicationId, 'activityLog'),
    activity
  )

  return { id: docRef.id, ...activity }
}

/**
 * Get activity log
 */
export async function getSFOCActivityLog(applicationId, limitCount = 50) {
  const q = query(
    collection(db, 'sfocApplications', applicationId, 'activityLog'),
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

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  // Constants
  SFOC_COMPLEXITY,
  SFOC_STATUSES,
  SFOC_APPLICATION_TYPES,
  SFOC_OPERATION_TRIGGERS,
  SFOC_DOCUMENT_REQUIREMENTS,
  DOCUMENT_CATEGORIES,
  DOCUMENT_STATUSES,
  COMMUNICATION_TYPES,

  // Helpers
  determineComplexity,
  getRequiredDocuments,
  calculateDocumentCompletion,
  getDaysUntilExpiry,
  isExpiringSoon,
  isExpired,

  // Application CRUD
  createSFOCApplication,
  getSFOCApplication,
  getSFOCApplications,
  subscribeToSFOCApplications,
  subscribeToSFOCApplication,
  updateSFOCApplication,
  updateSFOCStatus,
  linkSORAToSFOC,
  linkManufacturerDeclarationToSFOC,
  deleteSFOCApplication,

  // Documents
  getSFOCDocuments,
  subscribeToSFOCDocuments,
  updateSFOCDocument,
  uploadSFOCDocumentFile,

  // Communications
  addSFOCCommunication,
  getSFOCCommunications,
  subscribeToSFOCCommunications,

  // Statistics
  getSFOCStats,

  // Activity
  logSFOCActivity,
  getSFOCActivityLog
}
