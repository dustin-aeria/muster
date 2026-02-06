/**
 * Firestore RPAS Manufacturer Performance Declaration Service
 * Handles CRUD operations for Transport Canada Manufacturer Declarations
 *
 * Required for:
 * - RPAS >150kg (Large RPAS)
 * - BVLOS operations
 * - Operations requiring SFOC with performance evidence
 *
 * Per Transport Canada:
 * "For RPA above 150 kg or for BVLOS operations, provide a RPAS manufacturer
 * performance declaration accepted by TC to the applicable technical requirements
 * in reference to the applicant's SORA SAIL level."
 *
 * Collections:
 * - manufacturerDeclarations: Main declaration documents
 * - manufacturerDeclarations/{id}/sections: Documentation section tracking
 * - manufacturerDeclarations/{id}/evidence: Evidence files
 * - manufacturerDeclarations/{id}/activityLog: Audit trail
 *
 * @location src/lib/firestoreManufacturerDeclaration.js
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
 * Declaration statuses
 */
export const MPD_STATUSES = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    description: 'Declaration being prepared'
  },
  in_development: {
    label: 'In Development',
    color: 'bg-blue-100 text-blue-800',
    description: 'Gathering documentation and evidence'
  },
  testing: {
    label: 'Testing',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Conducting required tests and evaluations'
  },
  internal_review: {
    label: 'Internal Review',
    color: 'bg-purple-100 text-purple-800',
    description: 'Reviewing completeness before submission'
  },
  submitted: {
    label: 'Submitted to TC',
    color: 'bg-blue-100 text-blue-800',
    description: 'Declaration submitted to Transport Canada'
  },
  under_review: {
    label: 'Under TC Review',
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Transport Canada reviewing declaration'
  },
  info_requested: {
    label: 'Info Requested',
    color: 'bg-orange-100 text-orange-800',
    description: 'TC has requested additional information'
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-800',
    description: 'Declaration accepted by Transport Canada'
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    description: 'Declaration rejected - see TC comments'
  },
  expired: {
    label: 'Expired',
    color: 'bg-gray-100 text-gray-600',
    description: 'Declaration validity has ended'
  }
}

/**
 * RPAS categories for manufacturer declarations
 */
export const MPD_RPAS_CATEGORIES = {
  large: {
    id: 'large',
    label: 'Large RPAS (>150kg)',
    description: 'RPAS with operating weight exceeding 150kg',
    minWeight: 150,
    requiresSFOC: true,
    requiresMPD: true
  },
  medium_bvlos: {
    id: 'medium_bvlos',
    label: 'Medium RPAS BVLOS',
    description: 'Medium RPAS (25-150kg) conducting BVLOS operations',
    minWeight: 25,
    maxWeight: 150,
    requiresSFOC: false,
    requiresMPD: true,
    operationType: 'BVLOS'
  },
  small_bvlos: {
    id: 'small_bvlos',
    label: 'Small RPAS BVLOS',
    description: 'Small RPAS conducting BVLOS near populated areas',
    maxWeight: 25,
    requiresSFOC: false,
    requiresMPD: true,
    operationType: 'BVLOS'
  }
}

/**
 * Software design assurance levels (DO-178C)
 */
export const SOFTWARE_DAL_LEVELS = {
  A: {
    label: 'Level A - Catastrophic',
    description: 'Software failure could cause or contribute to a catastrophic failure',
    objectives: 66,
    independence: 'All objectives require independence'
  },
  B: {
    label: 'Level B - Hazardous',
    description: 'Software failure could cause or contribute to a hazardous failure',
    objectives: 65,
    independence: 'Most objectives require independence'
  },
  C: {
    label: 'Level C - Major',
    description: 'Software failure could cause or contribute to a major failure',
    objectives: 57,
    independence: 'Some objectives require independence'
  },
  D: {
    label: 'Level D - Minor',
    description: 'Software failure could cause or contribute to a minor failure',
    objectives: 28,
    independence: 'No independence required'
  },
  E: {
    label: 'Level E - No Effect',
    description: 'Software failure has no effect on aircraft operation or pilot workload',
    objectives: 0,
    independence: 'No objectives'
  }
}

/**
 * Design standards that can be referenced
 */
export const DESIGN_STANDARDS = {
  'DO-178C': {
    label: 'DO-178C',
    fullName: 'Software Considerations in Airborne Systems and Equipment Certification',
    description: 'Primary software design assurance standard for aviation',
    applicableTo: 'software'
  },
  'DO-254': {
    label: 'DO-254',
    fullName: 'Design Assurance Guidance for Airborne Electronic Hardware',
    description: 'Hardware design assurance standard for aviation electronics',
    applicableTo: 'hardware'
  },
  'DO-160': {
    label: 'DO-160',
    fullName: 'Environmental Conditions and Test Procedures for Airborne Equipment',
    description: 'Environmental qualification testing standard',
    applicableTo: 'environmental'
  },
  'ASTM_F3201': {
    label: 'ASTM F3201-16',
    fullName: 'Standard Practice for Ensuring Dependability of Software Used in UAS',
    description: 'UAS-specific software dependability standard',
    applicableTo: 'software'
  },
  'ASTM_F3322': {
    label: 'ASTM F3322-18',
    fullName: 'Standard Specification for Small UAS Parachutes',
    description: 'Parachute system requirements for small UAS',
    applicableTo: 'parachute'
  },
  'ARP4754A': {
    label: 'ARP4754A',
    fullName: 'Guidelines for Development of Civil Aircraft and Systems',
    description: 'System-level development guidance',
    applicableTo: 'system'
  },
  'ARP4761': {
    label: 'ARP4761',
    fullName: 'Guidelines and Methods for Conducting Safety Assessment',
    description: 'Safety assessment methodology',
    applicableTo: 'safety'
  }
}

/**
 * Documentation sections required for manufacturer declaration
 */
export const MPD_SECTIONS = {
  system_design: {
    id: 'system_design',
    label: 'System Design Documentation',
    description: 'System architecture, component specifications, and design standards',
    order: 1,
    required: true,
    items: [
      { id: 'architecture_overview', label: 'System Architecture Overview', required: true },
      { id: 'component_specs', label: 'Component Specifications', required: true },
      { id: 'design_standards', label: 'Design Standards Reference', required: true },
      { id: 'interface_definitions', label: 'Interface Control Documents', required: false },
      { id: 'block_diagrams', label: 'Block Diagrams', required: true }
    ]
  },
  software_declaration: {
    id: 'software_declaration',
    label: 'Software Declaration',
    description: 'Custom software documentation per DO-178C or ASTM F3201',
    order: 2,
    required: false,
    requiredIf: 'hasCustomSoftware',
    items: [
      { id: 'software_overview', label: 'Software Design Overview', required: true },
      { id: 'dal_justification', label: 'DAL Level Justification', required: true },
      { id: 'software_requirements', label: 'Software Requirements Specification', required: true },
      { id: 'design_description', label: 'Software Design Description', required: true },
      { id: 'verification_results', label: 'Verification Test Results', required: true },
      { id: 'configuration_management', label: 'Configuration Management Plan', required: true },
      { id: 'software_accomplishment', label: 'Software Accomplishment Summary', required: false }
    ]
  },
  safety_analysis: {
    id: 'safety_analysis',
    label: 'Safety Analysis',
    description: 'FHA, FMEA, System Safety Assessment, and reliability analysis',
    order: 3,
    required: true,
    items: [
      { id: 'fha', label: 'Functional Hazard Assessment (FHA)', required: true },
      { id: 'fmea', label: 'Failure Modes and Effects Analysis (FMEA)', required: true },
      { id: 'ssa', label: 'System Safety Assessment', required: true },
      { id: 'cca', label: 'Common Cause Analysis', required: false },
      { id: 'fault_tree', label: 'Fault Tree Analysis', required: false },
      { id: 'kinetic_energy_calc', label: 'Kinetic Energy Calculations', required: true }
    ]
  },
  performance_verification: {
    id: 'performance_verification',
    label: 'Performance Verification',
    description: 'Flight envelope, testing results, and performance data',
    order: 4,
    required: true,
    items: [
      { id: 'flight_envelope', label: 'Flight Envelope Definition', required: true },
      { id: 'performance_testing', label: 'Performance Test Results', required: true },
      { id: 'c2_link_testing', label: 'C2 Link Testing Results', required: true },
      { id: 'navigation_testing', label: 'GPS/Navigation Accuracy Testing', required: true },
      { id: 'containment_testing', label: 'Containment Capability Testing', required: true },
      { id: 'endurance_testing', label: 'Endurance/Duration Testing', required: false }
    ]
  },
  environmental_qualification: {
    id: 'environmental_qualification',
    label: 'Environmental Qualification',
    description: 'DO-160 or equivalent environmental testing documentation',
    order: 5,
    required: true,
    items: [
      { id: 'operating_envelope', label: 'Operating Environmental Envelope', required: true },
      { id: 'temperature_testing', label: 'Temperature Range Testing', required: true },
      { id: 'wind_testing', label: 'Wind/Turbulence Testing', required: true },
      { id: 'precipitation_testing', label: 'Precipitation Testing', required: false },
      { id: 'emi_emc_testing', label: 'EMI/EMC Testing', required: true },
      { id: 'vibration_testing', label: 'Vibration Testing', required: false },
      { id: 'ip_rating', label: 'IP Rating Documentation', required: false }
    ]
  },
  reliability_assessment: {
    id: 'reliability_assessment',
    label: 'Reliability Assessment',
    description: 'Reliability targets, MTBF data, and failure rate analysis',
    order: 6,
    required: true,
    items: [
      { id: 'reliability_targets', label: 'Reliability Targets per SAIL', required: true },
      { id: 'mtbf_calculations', label: 'MTBF Calculations', required: true },
      { id: 'failure_rate_data', label: 'Component Failure Rate Data', required: true },
      { id: 'redundancy_analysis', label: 'Redundancy Analysis', required: false },
      { id: 'service_experience', label: 'Service Experience Data', required: false }
    ]
  },
  maintenance_program: {
    id: 'maintenance_program',
    label: 'Maintenance Program',
    description: 'Maintenance schedule, inspections, and serviceability criteria',
    order: 7,
    required: true,
    items: [
      { id: 'maintenance_schedule', label: 'Maintenance Schedule', required: true },
      { id: 'inspection_procedures', label: 'Required Inspections', required: true },
      { id: 'replacement_intervals', label: 'Component Replacement Intervals', required: true },
      { id: 'serviceability_criteria', label: 'Serviceability Criteria', required: true },
      { id: 'mandatory_actions', label: 'Mandatory Actions List', required: false }
    ]
  },
  operator_package: {
    id: 'operator_package',
    label: 'Operator Information Package',
    description: 'Operations manual, limitations, and procedures per CAR 901.200',
    order: 8,
    required: true,
    items: [
      { id: 'operations_manual', label: 'Operations Manual', required: true },
      { id: 'flight_manual', label: 'Flight Manual/POH', required: true },
      { id: 'limitations', label: 'Limitations and Restrictions', required: true },
      { id: 'normal_procedures', label: 'Normal Procedures', required: true },
      { id: 'emergency_procedures', label: 'Emergency Procedures', required: true },
      { id: 'maintenance_instructions', label: 'Maintenance Instructions', required: true }
    ]
  }
}

/**
 * Section statuses
 */
export const SECTION_STATUSES = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  documentation_complete: { label: 'Documentation Complete', color: 'bg-blue-100 text-blue-800' },
  under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-800' },
  complete: { label: 'Complete', color: 'bg-green-100 text-green-800' },
  not_applicable: { label: 'N/A', color: 'bg-gray-100 text-gray-500' }
}

/**
 * Evidence types for manufacturer declarations
 */
export const MPD_EVIDENCE_TYPES = {
  design_document: { label: 'Design Document', icon: 'FileText' },
  test_report: { label: 'Test Report', icon: 'ClipboardList' },
  analysis_report: { label: 'Analysis Report', icon: 'BarChart' },
  calculation: { label: 'Calculation', icon: 'Calculator' },
  specification: { label: 'Specification', icon: 'FileCheck' },
  certificate: { label: 'Certificate', icon: 'Award' },
  drawing: { label: 'Drawing/Diagram', icon: 'PenTool' },
  photo: { label: 'Photo', icon: 'Image' },
  video: { label: 'Video', icon: 'Video' },
  datasheet: { label: 'Datasheet', icon: 'Database' },
  log_file: { label: 'Test Log/Data', icon: 'FileCode' },
  compliance_matrix: { label: 'Compliance Matrix', icon: 'Grid' }
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
 * Get kinetic energy category
 * @param {number} kineticEnergy - KE in Joules
 * @returns {object} Category info
 */
export function getKineticEnergyCategory(kineticEnergy) {
  if (kineticEnergy < 700) {
    return { category: 'low', label: 'Low (<700J)', requiresContact: false }
  }
  if (kineticEnergy < 34000) {
    return { category: 'medium', label: 'Medium (<34kJ)', requiresContact: false }
  }
  if (kineticEnergy < 1084000) {
    return { category: 'high', label: 'High (<1084kJ)', requiresContact: false }
  }
  return {
    category: 'very_high',
    label: 'Very High (>=1084kJ)',
    requiresContact: true,
    note: 'Contact Transport Canada directly for guidance'
  }
}

/**
 * Get required sections based on declaration type
 * @param {object} declarationData - Declaration configuration
 * @returns {object[]} Array of section definitions with requirements
 */
export function getRequiredSections(declarationData) {
  return Object.entries(MPD_SECTIONS).map(([id, section]) => {
    let isRequired = section.required

    // Check conditional requirements
    if (section.requiredIf) {
      isRequired = declarationData[section.requiredIf] === true
    }

    return {
      ...section,
      id,
      isRequired,
      items: section.items.map(item => ({
        ...item,
        isRequired: isRequired && item.required
      }))
    }
  })
}

/**
 * Calculate section completion percentage
 * @param {object} section - Section with items
 * @returns {number} Percentage complete (0-100)
 */
export function calculateSectionCompletion(section) {
  if (!section?.items || section.items.length === 0) return 0

  const requiredItems = section.items.filter(i => i.isRequired)
  if (requiredItems.length === 0) return 100

  const completeItems = requiredItems.filter(i =>
    i.status === 'complete' || i.status === 'documentation_complete'
  ).length

  return Math.round((completeItems / requiredItems.length) * 100)
}

/**
 * Calculate overall declaration completion
 * @param {object[]} sections - Array of section status objects
 * @returns {number} Percentage complete (0-100)
 */
export function calculateOverallCompletion(sections) {
  if (!sections || sections.length === 0) return 0

  const requiredSections = sections.filter(s => s.isRequired)
  if (requiredSections.length === 0) return 100

  const completeSections = requiredSections.filter(s => s.status === 'complete').length
  return Math.round((completeSections / requiredSections.length) * 100)
}

// ============================================
// DECLARATION CRUD OPERATIONS
// ============================================

/**
 * Create a new manufacturer declaration
 */
export async function createManufacturerDeclaration(declarationData) {
  // Calculate kinetic energy
  const operatingWeight = declarationData.operatingWeight || 0
  const maxVelocity = declarationData.maxVelocity || 0
  const kineticEnergy = calculateKineticEnergy(operatingWeight, maxVelocity)
  const keCategory = getKineticEnergyCategory(kineticEnergy)

  const declaration = {
    organizationId: declarationData.organizationId,

    // Declaration metadata
    name: declarationData.name,
    description: declarationData.description || '',
    status: 'draft',
    category: declarationData.category || 'large',

    // RPAS details
    rpasDetails: {
      manufacturer: declarationData.manufacturer || '',
      model: declarationData.model || '',
      serialNumber: declarationData.serialNumber || '',
      operatingWeight: operatingWeight,
      maxTakeoffWeight: declarationData.maxTakeoffWeight || operatingWeight,
      maxVelocity: maxVelocity,
      kineticEnergy: kineticEnergy,
      kineticEnergyCategory: keCategory.category,
      dimensions: declarationData.dimensions || '',
      propulsionType: declarationData.propulsionType || '',
      powerSource: declarationData.powerSource || ''
    },

    // Custom software details
    hasCustomSoftware: declarationData.hasCustomSoftware || false,
    softwareDetails: declarationData.hasCustomSoftware ? {
      name: declarationData.softwareDetails?.name || '',
      version: declarationData.softwareDetails?.version || '',
      designStandard: declarationData.softwareDetails?.designStandard || 'ASTM_F3201',
      dalLevel: declarationData.softwareDetails?.dalLevel || 'D',
      description: declarationData.softwareDetails?.description || '',
      functions: declarationData.softwareDetails?.functions || []
    } : null,

    // SAIL reference (from linked SORA)
    sailLevel: declarationData.sailLevel || null,
    soraAssessmentId: declarationData.soraAssessmentId || null,

    // Linked aircraft in Muster
    aircraftId: declarationData.aircraftId || null,

    // Linked SFOC application
    sfocApplicationId: declarationData.sfocApplicationId || null,

    // TC communication
    tcReferenceNumber: null,
    submissionDate: null,
    acceptanceDate: null,
    validUntil: null,
    tcComments: null,

    // Declarant information
    declarantInfo: {
      name: declarationData.declarantInfo?.name || '',
      title: declarationData.declarantInfo?.title || '',
      organization: declarationData.declarantInfo?.organization || '',
      email: declarationData.declarantInfo?.email || '',
      phone: declarationData.declarantInfo?.phone || '',
      address: declarationData.declarantInfo?.address || ''
    },

    // Audit fields
    createdBy: declarationData.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp()
  }

  const docRef = await addDoc(collection(db, 'manufacturerDeclarations'), declaration)

  // Initialize sections
  await initializeDeclarationSections(docRef.id, declarationData)

  return { id: docRef.id, ...declaration }
}

/**
 * Initialize sections for a declaration
 */
async function initializeDeclarationSections(declarationId, declarationData) {
  const batch = writeBatch(db)
  const sections = getRequiredSections(declarationData)

  sections.forEach(section => {
    const sectionRef = doc(collection(db, 'manufacturerDeclarations', declarationId, 'sections'))
    batch.set(sectionRef, {
      sectionId: section.id,
      label: section.label,
      description: section.description,
      order: section.order,
      isRequired: section.isRequired,
      status: section.isRequired ? 'not_started' : 'not_applicable',
      items: section.items.map(item => ({
        id: item.id,
        label: item.label,
        isRequired: item.isRequired,
        status: 'not_started',
        evidenceIds: [],
        notes: ''
      })),
      notes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  })

  await batch.commit()
}

/**
 * Get a manufacturer declaration by ID
 */
export async function getManufacturerDeclaration(declarationId) {
  const docRef = doc(db, 'manufacturerDeclarations', declarationId)
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
    acceptanceDate: docSnap.data().acceptanceDate?.toDate(),
    validUntil: docSnap.data().validUntil?.toDate()
  }
}

/**
 * Get all manufacturer declarations for an organization
 */
export async function getManufacturerDeclarations(organizationId, options = {}) {
  const { status = null, aircraftId = null, limitCount = 50 } = options

  let q = query(
    collection(db, 'manufacturerDeclarations'),
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
    lastActivityAt: doc.data().lastActivityAt?.toDate(),
    submissionDate: doc.data().submissionDate?.toDate(),
    acceptanceDate: doc.data().acceptanceDate?.toDate(),
    validUntil: doc.data().validUntil?.toDate()
  }))

  if (status) {
    declarations = declarations.filter(d => d.status === status)
  }

  if (aircraftId) {
    declarations = declarations.filter(d => d.aircraftId === aircraftId)
  }

  return declarations
}

/**
 * Subscribe to manufacturer declarations for real-time updates
 */
export function subscribeToManufacturerDeclarations(organizationId, callback) {
  const q = query(
    collection(db, 'manufacturerDeclarations'),
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
 * Subscribe to a single declaration
 */
export function subscribeToManufacturerDeclaration(declarationId, callback) {
  const docRef = doc(db, 'manufacturerDeclarations', declarationId)

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
      acceptanceDate: docSnap.data().acceptanceDate?.toDate(),
      validUntil: docSnap.data().validUntil?.toDate()
    })
  })
}

/**
 * Update a manufacturer declaration
 */
export async function updateManufacturerDeclaration(declarationId, updates) {
  const declarationRef = doc(db, 'manufacturerDeclarations', declarationId)

  // Recalculate kinetic energy if weight/velocity changed
  if (updates.operatingWeight !== undefined || updates.maxVelocity !== undefined) {
    const current = await getManufacturerDeclaration(declarationId)
    const weight = updates.operatingWeight ?? current.rpasDetails.operatingWeight
    const velocity = updates.maxVelocity ?? current.rpasDetails.maxVelocity
    const kineticEnergy = calculateKineticEnergy(weight, velocity)
    const keCategory = getKineticEnergyCategory(kineticEnergy)

    updates['rpasDetails.kineticEnergy'] = kineticEnergy
    updates['rpasDetails.kineticEnergyCategory'] = keCategory.category
  }

  await updateDoc(declarationRef, {
    ...updates,
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp()
  })
}

/**
 * Update declaration status
 */
export async function updateMPDStatus(declarationId, status, additionalUpdates = {}) {
  const updates = { status, ...additionalUpdates }

  if (status === 'submitted') {
    updates.submissionDate = serverTimestamp()
  } else if (status === 'accepted') {
    updates.acceptanceDate = serverTimestamp()
  }

  await updateManufacturerDeclaration(declarationId, updates)
}

/**
 * Link to SFOC application
 */
export async function linkMPDToSFOC(declarationId, sfocApplicationId) {
  await updateManufacturerDeclaration(declarationId, {
    sfocApplicationId
  })
}

/**
 * Delete a manufacturer declaration
 */
export async function deleteManufacturerDeclaration(declarationId) {
  const batch = writeBatch(db)

  // Delete sections
  const sectionsQuery = query(collection(db, 'manufacturerDeclarations', declarationId, 'sections'))
  const sectionsSnapshot = await getDocs(sectionsQuery)
  sectionsSnapshot.docs.forEach(docSnap => {
    batch.delete(doc(db, 'manufacturerDeclarations', declarationId, 'sections', docSnap.id))
  })

  // Delete evidence
  const evidenceQuery = query(collection(db, 'manufacturerDeclarations', declarationId, 'evidence'))
  const evidenceSnapshot = await getDocs(evidenceQuery)
  evidenceSnapshot.docs.forEach(docSnap => {
    batch.delete(doc(db, 'manufacturerDeclarations', declarationId, 'evidence', docSnap.id))
  })

  // Delete activity log
  const activityQuery = query(collection(db, 'manufacturerDeclarations', declarationId, 'activityLog'))
  const activitySnapshot = await getDocs(activityQuery)
  activitySnapshot.docs.forEach(docSnap => {
    batch.delete(doc(db, 'manufacturerDeclarations', declarationId, 'activityLog', docSnap.id))
  })

  // Delete the declaration
  batch.delete(doc(db, 'manufacturerDeclarations', declarationId))

  await batch.commit()
}

// ============================================
// SECTIONS OPERATIONS
// ============================================

/**
 * Get all sections for a declaration
 */
export async function getDeclarationSections(declarationId) {
  const q = query(
    collection(db, 'manufacturerDeclarations', declarationId, 'sections'),
    orderBy('order', 'asc')
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
 * Subscribe to sections
 */
export function subscribeToDeclarationSections(declarationId, callback) {
  const q = query(
    collection(db, 'manufacturerDeclarations', declarationId, 'sections'),
    orderBy('order', 'asc')
  )

  return onSnapshot(q, (snapshot) => {
    const sections = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }))
    callback(sections)
  })
}

/**
 * Update a section
 */
export async function updateDeclarationSection(declarationId, sectionId, updates) {
  const sectionRef = doc(db, 'manufacturerDeclarations', declarationId, 'sections', sectionId)
  await updateDoc(sectionRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })

  // Update declaration lastActivityAt
  await updateDoc(doc(db, 'manufacturerDeclarations', declarationId), {
    lastActivityAt: serverTimestamp()
  })
}

/**
 * Update a section item
 */
export async function updateSectionItem(declarationId, sectionId, itemId, updates) {
  const section = await getDoc(doc(db, 'manufacturerDeclarations', declarationId, 'sections', sectionId))
  if (!section.exists()) return

  const sectionData = section.data()
  const updatedItems = sectionData.items.map(item => {
    if (item.id === itemId) {
      return { ...item, ...updates }
    }
    return item
  })

  await updateDeclarationSection(declarationId, sectionId, { items: updatedItems })
}

// ============================================
// EVIDENCE OPERATIONS
// ============================================

/**
 * Add evidence to a declaration
 */
export async function addMPDEvidence(declarationId, evidenceData) {
  const evidence = {
    declarationId,
    name: evidenceData.name,
    description: evidenceData.description || '',
    type: evidenceData.type || 'document',
    fileUrl: evidenceData.fileUrl || null,
    fileName: evidenceData.fileName || null,
    fileSize: evidenceData.fileSize || null,
    mimeType: evidenceData.mimeType || null,
    linkedSections: evidenceData.linkedSections || [],
    linkedItems: evidenceData.linkedItems || [],
    uploadedBy: evidenceData.uploadedBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(
    collection(db, 'manufacturerDeclarations', declarationId, 'evidence'),
    evidence
  )

  // Update declaration lastActivityAt
  await updateDoc(doc(db, 'manufacturerDeclarations', declarationId), {
    lastActivityAt: serverTimestamp()
  })

  return { id: docRef.id, ...evidence }
}

/**
 * Get all evidence for a declaration
 */
export async function getMPDEvidence(declarationId) {
  const q = query(
    collection(db, 'manufacturerDeclarations', declarationId, 'evidence'),
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
export function subscribeToMPDEvidence(declarationId, callback) {
  const q = query(
    collection(db, 'manufacturerDeclarations', declarationId, 'evidence'),
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
 * Delete evidence
 */
export async function deleteMPDEvidence(declarationId, evidenceId) {
  const evidenceRef = doc(db, 'manufacturerDeclarations', declarationId, 'evidence', evidenceId)
  await deleteDoc(evidenceRef)

  await updateDoc(doc(db, 'manufacturerDeclarations', declarationId), {
    lastActivityAt: serverTimestamp()
  })
}

// ============================================
// STATISTICS
// ============================================

/**
 * Get declaration statistics
 */
export async function getMPDStats(declarationId) {
  const [sections, evidence] = await Promise.all([
    getDeclarationSections(declarationId),
    getMPDEvidence(declarationId)
  ])

  const totalSections = sections.filter(s => s.isRequired).length
  const completeSections = sections.filter(s => s.isRequired && s.status === 'complete').length

  let totalItems = 0
  let completeItems = 0

  sections.forEach(section => {
    if (section.isRequired) {
      section.items.forEach(item => {
        if (item.isRequired) {
          totalItems++
          if (item.status === 'complete' || item.status === 'documentation_complete') {
            completeItems++
          }
        }
      })
    }
  })

  return {
    sections: {
      total: totalSections,
      complete: completeSections,
      percentage: totalSections > 0 ? Math.round((completeSections / totalSections) * 100) : 0
    },
    items: {
      total: totalItems,
      complete: completeItems,
      percentage: totalItems > 0 ? Math.round((completeItems / totalItems) * 100) : 0
    },
    evidence: {
      total: evidence.length,
      byType: Object.keys(MPD_EVIDENCE_TYPES).reduce((acc, type) => {
        acc[type] = evidence.filter(e => e.type === type).length
        return acc
      }, {})
    }
  }
}

// ============================================
// ACTIVITY LOG
// ============================================

/**
 * Log an activity
 */
export async function logMPDActivity(declarationId, activityData) {
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
    collection(db, 'manufacturerDeclarations', declarationId, 'activityLog'),
    activity
  )

  return { id: docRef.id, ...activity }
}

/**
 * Get activity log
 */
export async function getMPDActivityLog(declarationId, limitCount = 50) {
  const q = query(
    collection(db, 'manufacturerDeclarations', declarationId, 'activityLog'),
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
  MPD_STATUSES,
  MPD_RPAS_CATEGORIES,
  SOFTWARE_DAL_LEVELS,
  DESIGN_STANDARDS,
  MPD_SECTIONS,
  SECTION_STATUSES,
  MPD_EVIDENCE_TYPES,

  // Helpers
  calculateKineticEnergy,
  getKineticEnergyCategory,
  getRequiredSections,
  calculateSectionCompletion,
  calculateOverallCompletion,

  // Declaration CRUD
  createManufacturerDeclaration,
  getManufacturerDeclaration,
  getManufacturerDeclarations,
  subscribeToManufacturerDeclarations,
  subscribeToManufacturerDeclaration,
  updateManufacturerDeclaration,
  updateMPDStatus,
  linkMPDToSFOC,
  deleteManufacturerDeclaration,

  // Sections
  getDeclarationSections,
  subscribeToDeclarationSections,
  updateDeclarationSection,
  updateSectionItem,

  // Evidence
  addMPDEvidence,
  getMPDEvidence,
  subscribeToMPDEvidence,
  deleteMPDEvidence,

  // Statistics
  getMPDStats,

  // Activity
  logMPDActivity,
  getMPDActivityLog
}
