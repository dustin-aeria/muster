import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================
// PROJECTS
// ============================================

const projectsRef = collection(db, 'projects')

export async function getProjects(filters = {}) {
  let q = query(projectsRef, orderBy('createdAt', 'desc'))
  
  if (filters.status) {
    q = query(q, where('status', '==', filters.status))
  }
  
  if (filters.limit) {
    q = query(q, limit(filters.limit))
  }
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getProject(id) {
  const docRef = doc(db, 'projects', id)
  const snapshot = await getDoc(docRef)
  
  if (!snapshot.exists()) {
    throw new Error('Project not found')
  }
  
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Default SORA structure with proper initialization
 * Matches JARUS SORA 2.5 methodology requirements
 * Simplified structure to work with ProjectSORA component
 */
const getDefaultSoraStructure = () => ({
  // Step 1: ConOps (populated from Flight Plan)
  operationType: 'VLOS',           // VLOS | EVLOS | BVLOS
  maxAltitudeAGL: 120,             // meters
  
  // Step 2: iGRC Inputs
  populationCategory: 'sparsely',  // controlled | remote | lightly | sparsely | suburban | highdensity | assembly
  uaCharacteristic: '1m_25ms',     // 1m_25ms | 3m_35ms | 8m_75ms | 20m_120ms | 40m_200ms
  maxSpeed: 25,                    // m/s
  
  // Data source tracking
  populationSource: 'manual',      // manual | siteSurvey
  aircraftSource: 'manual',        // manual | flightPlan
  
  // Step 3: Ground Risk Mitigations
  mitigations: {
    M1A: { enabled: false, robustness: 'none', evidence: '' },
    M1B: { enabled: false, robustness: 'none', evidence: '' },
    M1C: { enabled: false, robustness: 'none', evidence: '' },
    M2: { enabled: false, robustness: 'none', evidence: '' },
    M3: { enabled: true, robustness: 'low', evidence: 'ERP documented' }
  },
  
  // Steps 4-6: Air Risk
  initialARC: 'ARC-b',             // ARC-a | ARC-b | ARC-c | ARC-d
  tmpr: {
    enabled: true,
    type: 'VLOS',                  // VLOS | EVLOS | DAA
    robustness: 'low',
    evidence: ''
  },
  
  // Step 8: Containment
  adjacentAreaPopulation: 'sparsely',
  containment: {
    method: '',
    robustness: 'none',
    evidence: ''
  },
  
  // Step 9: OSO Compliance (keyed by OSO ID)
  osoCompliance: getDefaultOSOComplianceStructure(),
  
  // Metadata
  lastUpdated: null,
  version: '2.5'
})

/**
 * Default OSO Compliance structure (keyed by ID for easy lookup)
 */
const getDefaultOSOComplianceStructure = () => {
  const compliance = {}
  const osoIds = [
    'OSO-01', 'OSO-02', 'OSO-03', 'OSO-04', 'OSO-05', 'OSO-06',
    'OSO-07', 'OSO-08',
    'OSO-09', 'OSO-10', 'OSO-11', 'OSO-12', 'OSO-13', 'OSO-14', 'OSO-15', 'OSO-16',
    'OSO-17', 'OSO-18', 'OSO-19',
    'OSO-20', 'OSO-21', 'OSO-22', 'OSO-23', 'OSO-24'
  ]
  osoIds.forEach(id => {
    compliance[id] = { robustness: 'none', evidence: '' }
  })
  return compliance
}

/**
 * Default Site Survey structure with SORA-integrated population fields
 */
const getDefaultSiteSurveyStructure = () => ({
  location: {
    name: '',
    coordinates: null,         // { lat, lng }
    address: '',
    accessInstructions: ''
  },
  airspace: {
    classification: 'G',       // A | B | C | D | E | F | G
    restrictions: [],
    nearestAerodrome: '',
    aerodromeDistance: null    // km
  },
  // SORA-integrated population assessment
  population: {
    category: null,            // controlled | remote | lightly | sparsely | suburban | highdensity | assembly
    adjacentCategory: null,    // Population category of adjacent area
    density: null,             // people/km² if known
    justification: '',
    assessmentDate: null
  },
  obstacles: [],               // Array of { type, height, distance, notes }
  launchRecovery: {
    launchPoint: null,         // { lat, lng, description }
    recoveryPoint: null,       // { lat, lng, description }
    alternatePoints: []
  },
  surroundings: {
    terrain: '',
    vegetation: '',
    structures: '',
    populatedAreas: '',        // Legacy text field, population.category is now primary
    waterFeatures: '',
    wildlife: ''
  },
  access: {
    vehicleAccess: true,
    parkingAvailable: true,
    permissionsRequired: [],
    accessNotes: ''
  },
  photos: [],                  // Array of { url, caption, type }
  notes: '',
  surveyDate: null,
  surveyedBy: null
})

/**
 * Default Flight Plan structure
 */
const getDefaultFlightPlanStructure = () => ({
  aircraft: [],                // Array of { id, nickname, make, model, mtow, maxSpeed, isPrimary }
  operationType: 'VLOS',       // VLOS | EVLOS | BVLOS
  maxAltitudeAGL: 120,         // meters
  flightAreaType: 'uncontrolled',  // controlled | uncontrolled | restricted
  groundType: 'sparsely_populated',
  overPeople: false,
  nearAerodrome: false,
  aerodromeDistance: null,
  weatherMinimums: {
    minVisibility: 3,          // statute miles
    minCeiling: 500,           // feet AGL
    maxWind: 10,               // m/s
    maxGust: 15,               // m/s
    precipitation: false,
    notes: ''
  },
  contingencies: [
    { trigger: 'Loss of C2 Link', action: 'Return to Home (RTH) automatically engages. If no RTH within 30 seconds, land in place.', priority: 'high' },
    { trigger: 'Low Battery Warning', action: 'Immediately return to launch point. Land with minimum 20% remaining.', priority: 'high' },
    { trigger: 'GPS Loss', action: 'Switch to ATTI mode, maintain visual contact, manual return and land.', priority: 'high' },
    { trigger: 'Fly-Away', action: 'Attempt to regain control. If unsuccessful, contact FIC Edmonton (1-866-541-4102) immediately.', priority: 'critical' },
    { trigger: 'Deteriorating Weather', action: 'Land immediately if conditions fall below minimums. Do not attempt to "push through."', priority: 'medium' },
    { trigger: 'Aircraft in Vicinity', action: 'Descend and hold position or land. Give way to all manned aircraft.', priority: 'high' }
  ],
  additionalProcedures: ''
})

/**
 * Default HSE Risk Assessment structure (Per HSE1047 & HSE1048)
 * Separate from SORA - focuses on workplace hazards and hierarchy of controls
 */
const getDefaultHSERiskStructure = () => ({
  hazards: [],  // Array of hazard objects
  overallRiskAcceptable: null,
  reviewNotes: '',
  reviewedBy: '',
  reviewDate: '',
  approvedBy: '',
  approvalDate: ''
})

/**
 * Helper to create a default hazard entry
 */
export const createDefaultHazard = () => ({
  id: Date.now().toString(),
  category: 'environmental',  // environmental | overhead | access | ergonomic | personal | equipment | biological | chemical
  description: '',
  likelihood: 3,             // 1-5
  severity: 3,               // 1-5
  controlType: 'administrative',  // elimination | substitution | engineering | administrative | ppe
  controls: '',
  residualLikelihood: 2,
  residualSeverity: 2,
  responsible: '',
  verification: ''
})

export async function createProject(data) {
  const project = {
    ...data,
    status: 'draft',
    sections: {
      siteSurvey: false,
      flightPlan: false,
    },
    crew: [],
    
    // Site Survey with SORA-integrated population fields
    siteSurvey: getDefaultSiteSurveyStructure(),
    
    // Flight Plan with aircraft selection
    flightPlan: getDefaultFlightPlanStructure(),
    
    // HSE Risk Assessment (Per HSE1047 & HSE1048)
    // Separate from SORA - focuses on workplace hazards & hierarchy of controls
    hseRiskAssessment: getDefaultHSERiskStructure(),
    
    // SORA 2.5 Assessment (Per JARUS)
    // Driven by Flight Plan and Site Survey data
    soraAssessment: getDefaultSoraStructure(),
    
    // Legacy field for migration - will be deprecated
    riskAssessment: null,
    
    emergencyPlan: {
      musterPoints: [],
      evacuationRoutes: [],
      contacts: [
        { type: 'emergency', name: 'Local Emergency', phone: '911', notes: '' },
        { type: 'fic', name: 'FIC Edmonton', phone: '1-866-541-4102', notes: 'For fly-away reporting' }
      ],
      hospital: null,
      firstAid: null,
      procedures: {}
    },
    ppe: {
      required: [
        { item: 'High-Visibility Vest', specification: 'ANSI Type R Class 2', notes: '' },
        { item: 'Sun Protection', specification: 'Sunscreen, hat', notes: '' },
        { item: 'First Aid Kit', specification: 'As per assessment', notes: '' },
        { item: 'Communication Device', specification: 'Radio/cell phone', notes: '' }
      ],
      siteSpecific: '',
      notes: ''
    },
    communications: {
      primaryMethod: 'cell',
      backupMethod: 'radio',
      radioChannels: [],
      checkInFrequency: '',
      checkInProcedure: '',
      emergencyStopWord: 'STOP STOP STOP',
      aeronauticalRadioRequired: false
    },
    approvals: {
      preparedBy: null,
      preparedDate: null,
      reviewedBy: null,
      reviewedDate: null,
      approvedBy: null,
      approvedDate: null,
      crewAcknowledgments: []
    },
    tailgate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  
  const docRef = await addDoc(projectsRef, project)
  return { id: docRef.id, ...project }
}

export async function updateProject(id, data) {
  const docRef = doc(db, 'projects', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteProject(id) {
  const docRef = doc(db, 'projects', id)
  await deleteDoc(docRef)
}

// ============================================
// CLIENTS
// ============================================

const clientsRef = collection(db, 'clients')

export async function getClients() {
  const q = query(clientsRef, orderBy('name', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getClient(id) {
  const docRef = doc(db, 'clients', id)
  const snapshot = await getDoc(docRef)
  
  if (!snapshot.exists()) {
    throw new Error('Client not found')
  }
  
  return { id: snapshot.id, ...snapshot.data() }
}

export async function createClient(data) {
  const client = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  
  const docRef = await addDoc(clientsRef, client)
  return { id: docRef.id, ...client }
}

export async function updateClient(id, data) {
  const docRef = doc(db, 'clients', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteClient(id) {
  const docRef = doc(db, 'clients', id)
  await deleteDoc(docRef)
}

// ============================================
// OPERATORS
// ============================================

const operatorsRef = collection(db, 'operators')

export async function getOperators() {
  const q = query(operatorsRef, orderBy('lastName', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getOperator(id) {
  const docRef = doc(db, 'operators', id)
  const snapshot = await getDoc(docRef)
  
  if (!snapshot.exists()) {
    throw new Error('Operator not found')
  }
  
  return { id: snapshot.id, ...snapshot.data() }
}

export async function createOperator(data) {
  const operator = {
    ...data,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  
  const docRef = await addDoc(operatorsRef, operator)
  return { id: docRef.id, ...operator }
}

export async function updateOperator(id, data) {
  const docRef = doc(db, 'operators', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteOperator(id) {
  const docRef = doc(db, 'operators', id)
  await deleteDoc(docRef)
}

// ============================================
// AIRCRAFT
// ============================================

const aircraftRef = collection(db, 'aircraft')

export async function getAircraft() {
  const q = query(aircraftRef, orderBy('nickname', 'asc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getAircraftById(id) {
  const docRef = doc(db, 'aircraft', id)
  const snapshot = await getDoc(docRef)
  
  if (!snapshot.exists()) {
    throw new Error('Aircraft not found')
  }
  
  return { id: snapshot.id, ...snapshot.data() }
}

export async function createAircraft(data) {
  const aircraft = {
    ...data,
    status: 'airworthy',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  
  const docRef = await addDoc(aircraftRef, aircraft)
  return { id: docRef.id, ...aircraft }
}

export async function updateAircraft(id, data) {
  const docRef = doc(db, 'aircraft', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteAircraft(id) {
  const docRef = doc(db, 'aircraft', id)
  await deleteDoc(docRef)
}

// ============================================
// FORMS
// ============================================

const formsRef = collection(db, 'forms')

export async function getForms(filters = {}) {
  let q = query(formsRef, orderBy('createdAt', 'desc'))
  
  if (filters.projectId) {
    q = query(q, where('projectId', '==', filters.projectId))
  }
  
  if (filters.type) {
    q = query(q, where('type', '==', filters.type))
  }
  
  if (filters.limit) {
    q = query(q, limit(filters.limit))
  }
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function createForm(data) {
  const form = {
    ...data,
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  
  const docRef = await addDoc(formsRef, form)
  return { id: docRef.id, ...form }
}

export async function updateForm(id, data) {
  const docRef = doc(db, 'forms', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

export async function deleteForm(id) {
  const docRef = doc(db, 'forms', id)
  await deleteDoc(docRef)
}

// ============================================
// HELPER: Migration for Existing Projects
// ============================================

/**
 * Migrate existing project to new decoupled HSE/SORA structure
 * Call this when loading a project that has old data format
 */
export function migrateProjectToDecoupledStructure(project) {
  const hasSeparateStructures = project.hseRiskAssessment && project.soraAssessment
  
  if (hasSeparateStructures) {
    // Already migrated
    return project
  }
  
  // Migrate from old combined riskAssessment structure
  const oldRiskAssessment = project.riskAssessment || {}
  const oldSora = oldRiskAssessment.sora || {}
  const oldHazards = oldRiskAssessment.hazards || []
  
  // Build new HSE Risk Assessment structure
  const hseRiskAssessment = {
    hazards: oldHazards.map(h => ({
      id: h.id || Date.now().toString(),
      category: h.category || 'environmental',
      description: h.description || '',
      likelihood: h.likelihood || 3,
      severity: h.severity || 3,
      controlType: h.controlType || 'administrative',
      controls: h.controls || '',
      residualLikelihood: h.residualLikelihood || 2,
      residualSeverity: h.residualSeverity || 2,
      responsible: h.responsible || '',
      verification: h.verification || ''
    })),
    overallRiskAcceptable: oldRiskAssessment.overallRiskAcceptable || null,
    reviewNotes: oldRiskAssessment.reviewNotes || '',
    reviewedBy: oldRiskAssessment.reviewedBy || '',
    reviewDate: oldRiskAssessment.reviewDate || '',
    approvedBy: '',
    approvalDate: ''
  }
  
  // Build new SORA Assessment structure
  const soraAssessment = {
    operationType: oldSora.tmpr?.type || project.flightPlan?.operationType || 'VLOS',
    maxAltitudeAGL: oldSora.conops?.maxAltitudeAGL || project.flightPlan?.maxAltitudeAGL || 120,
    populationCategory: oldSora.populationCategory || 'sparsely',
    uaCharacteristic: oldSora.uaCharacteristic || '1m_25ms',
    maxSpeed: oldSora.maxSpeed || 25,
    populationSource: oldSora.populationFromSiteSurvey ? 'siteSurvey' : 'manual',
    aircraftSource: project.flightPlan?.aircraft?.length > 0 ? 'flightPlan' : 'manual',
    mitigations: oldSora.mitigations || {
      M1A: { enabled: false, robustness: 'none', evidence: '' },
      M1B: { enabled: false, robustness: 'none', evidence: '' },
      M1C: { enabled: false, robustness: 'none', evidence: '' },
      M2: { enabled: false, robustness: 'none', evidence: '' },
      M3: { enabled: true, robustness: 'low', evidence: 'ERP documented' }
    },
    initialARC: oldSora.initialARC || 'ARC-b',
    tmpr: oldSora.tmpr || { enabled: true, type: 'VLOS', robustness: 'low', evidence: '' },
    adjacentAreaPopulation: oldSora.adjacentAreaPopulation || 'sparsely',
    containment: oldSora.containment || { method: '', robustness: 'none', evidence: '' },
    osoCompliance: oldSora.osoCompliance || getDefaultOSOComplianceStructure(),
    lastUpdated: new Date().toISOString(),
    version: '2.5'
  }
  
  return {
    ...project,
    siteSurvey: {
      ...getDefaultSiteSurveyStructure(),
      ...project.siteSurvey
    },
    flightPlan: {
      ...getDefaultFlightPlanStructure(),
      ...project.flightPlan
    },
    hseRiskAssessment,
    soraAssessment,
    riskAssessment: null  // Clear old structure
  }
}

/**
 * Legacy migration function (calls new function)
 * @deprecated Use migrateProjectToDecoupledStructure instead
 */
export function migrateProjectToSORA(project) {
  return migrateProjectToDecoupledStructure(project)
}
