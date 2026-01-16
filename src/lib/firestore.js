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
 */
const getDefaultSoraStructure = () => ({
  // Step 1: ConOps Documentation
  conops: {
    operationType: 'VLOS',           // VLOS | EVLOS | BVLOS
    operationDescription: '',
    maxAltitudeAGL: 120,             // meters
    flightGeography: '',
    contingencyVolume: '',
    groundRiskBuffer: ''
  },
  
  // Step 2: UA Characteristics & Population (for iGRC)
  uaCharacteristics: {
    characteristicDimension: '1m',   // 1m | 3m | 8m | 20m | 40m
    maxSpeed: 25,                    // m/s - will be synced from Flight Plan aircraft
    source: 'manual'                 // manual | flightPlan
  },
  populationCategory: 'sparsely',    // controlled | remote | lightly | sparsely | suburban | highdensity | assembly
  populationSource: 'manual',        // manual | siteSurvey
  populationJustification: '',
  
  // Step 2 Result
  intrinsicGRC: null,                // 1-10 or null
  
  // Step 3: Ground Risk Mitigations
  groundRiskMitigations: {
    m1a: {                           // Strategic Mitigation - Sheltering
      applied: false,
      robustness: 'none',            // none | low | medium | high
      justification: '',
      reduction: 0                   // -1 for low, -2 for medium
    },
    m1b: {                           // Strategic Mitigation - Operational Restrictions
      applied: false,
      robustness: 'none',
      justification: '',
      reduction: 0
    },
    m1c: {                           // Strategic Mitigation - Ground Observers
      applied: false,
      robustness: 'none',            // Only 'low' available for M1C
      justification: '',
      reduction: 0                   // -1 for low only
    },
    m2: {                            // Effects of UA Impact Dynamics Reduced
      applied: false,
      robustness: 'none',
      method: '',                    // parachute | frangibility | autorotation | other
      justification: '',
      reduction: 0                   // -1 for low, -2 for medium, -4 for high
    },
    m3: {                            // ERP Reduces Effects of Loss of Control
      applied: false,
      justification: '',
      reduction: 0                   // +1 if NOT applied (penalty)
    }
  },
  
  // Step 3 Result
  finalGRC: null,                    // 1-7 (capped)
  
  // Step 4: Initial ARC Determination
  airspaceAssessment: {
    atypicalAirspace: false,         // Operations in atypical airspace?
    overUrban: false,                // Urban environment?
    controlledAirspace: false,       // In controlled airspace?
    airportDistance: null,           // km from nearest airport/heliport
    crossAirways: false,             // Crossing aerial routes?
    segregatedAirspace: false,       // In segregated airspace?
    commonAltitude: false,           // At common altitude with manned aviation?
    vfrRoutes: false,                // Near VFR routes?
    ifrRoutes: false,                // Near IFR routes?
    justification: ''
  },
  
  // Step 4 Result
  initialARC: 'a',                   // a | b | c | d
  
  // Step 5: Air Risk Mitigations (Strategic)
  airRiskMitigations: {
    strategicMitigation: {
      applied: false,
      type: '',                      // commonStructures | notams | temporaryRestriction
      justification: ''
    }
  },
  
  // Step 5 Result (after strategic mitigation)
  residualARCStrategic: 'a',
  
  // Step 6: Tactical Mitigations (TMPR)
  tacticalMitigations: {
    tmprLevel: 'low',                // none | low | medium | high
    vlosCondition: true,             // Operating under VLOS conditions?
    daaMeans: '',                    // Method of Detect & Avoid
    separationProvision: '',         // How separation is maintained
    justification: ''
  },
  
  // Step 6 Result
  residualARC: 'a',                  // Final ARC after all mitigations
  
  // Step 7: SAIL Determination
  sail: null,                        // I | II | III | IV | V | VI
  
  // Step 8: Containment Requirements
  containment: {
    adjacentAreaCategory: 'sparsely', // Population of adjacent area
    adjacentAreaSource: 'manual',     // manual | siteSurvey
    adjacentAreaDistance: null,       // meters (calculated: 3 min × max speed, max 35km)
    containmentRobustness: 'low',     // low | medium | high
    justification: ''
  },
  
  // Step 9: OSO Compliance
  // Array of 24 OSOs with compliance status
  osos: getDefaultOSOStructure(),
  
  // Metadata
  lastCalculated: null,
  version: '2.5'                     // SORA version
})

/**
 * Default OSO structure for all 24 Operational Safety Objectives
 * Requirements vary by SAIL level (I-VI)
 */
const getDefaultOSOStructure = () => [
  // Technical Issue with UAS (OSOs 1-6)
  { id: 'OSO-01', category: 'technical', name: 'Operational procedures are defined, validated & adhered to', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-02', category: 'technical', name: 'UAS manufactured by competent and/or proven entity', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-03', category: 'technical', name: 'UAS maintained by competent and/or proven entity', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-04', category: 'technical', name: 'UAS developed to design standards', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-05', category: 'technical', name: 'UAS is designed considering system safety and reliability', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-06', category: 'technical', name: 'C3 link performance adequate for operation', compliance: null, evidence: '', notes: '' },
  
  // Deterioration of External Systems (OSOs 7-8)
  { id: 'OSO-07', category: 'external', name: 'Inspection of UAS to ensure safe condition', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-08', category: 'external', name: 'Operational procedures for loss of C2 link', compliance: null, evidence: '', notes: '' },
  
  // Human Error (OSOs 9-16)
  { id: 'OSO-09', category: 'human', name: 'Procedures in place for remote crew', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-10', category: 'human', name: 'Safe recovery from technical issue', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-11', category: 'human', name: 'Procedures in place for communication, coordination and handover', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-12', category: 'human', name: 'Remote crew trained for normal procedures', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-13', category: 'human', name: 'Remote crew trained for emergency procedures', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-14', category: 'human', name: 'Multi-crew coordination (if applicable)', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-15', category: 'human', name: 'Fitness of remote crew', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-16', category: 'human', name: 'HMI adequate for operation', compliance: null, evidence: '', notes: '' },
  
  // Adverse Operating Conditions (OSOs 17-19)
  { id: 'OSO-17', category: 'operating', name: 'Operational environment defined', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-18', category: 'operating', name: 'Automatic protection of flight envelope', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-19', category: 'operating', name: 'Safe recovery from adverse conditions', compliance: null, evidence: '', notes: '' },
  
  // Air Risk (OSOs 20-24)
  { id: 'OSO-20', category: 'air', name: 'Strategic mitigation', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-21', category: 'air', name: 'Effects of ground impact reduced', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-22', category: 'air', name: 'ERP appropriate for mission', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-23', category: 'air', name: 'Environmental conditions defined for operation', compliance: null, evidence: '', notes: '' },
  { id: 'OSO-24', category: 'air', name: 'UAS designed to handle adverse conditions', compliance: null, evidence: '', notes: '' }
]

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
    
    // Risk Assessment with full SORA 2.5 structure + HSE hazards
    riskAssessment: {
      sora: getDefaultSoraStructure(),
      hazards: []  // HSE hazard assessment (separate from SORA)
    },
    
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
 * Migrate existing project to new SORA structure
 * Call this when loading a project that has old/missing SORA data
 */
export function migrateProjectToSORA(project) {
  const needsMigration = !project.riskAssessment?.sora?.version ||
                         !project.siteSurvey?.population ||
                         !project.flightPlan?.contingencies
  
  if (!needsMigration) {
    return project
  }
  
  return {
    ...project,
    siteSurvey: {
      ...getDefaultSiteSurveyStructure(),
      ...project.siteSurvey,
      population: {
        ...getDefaultSiteSurveyStructure().population,
        ...project.siteSurvey?.population
      }
    },
    flightPlan: {
      ...getDefaultFlightPlanStructure(),
      ...project.flightPlan
    },
    riskAssessment: {
      ...project.riskAssessment,
      sora: {
        ...getDefaultSoraStructure(),
        ...project.riskAssessment?.sora,
        // Preserve any existing OSO compliance data
        osos: project.riskAssessment?.sora?.osos?.length === 24
          ? project.riskAssessment.sora.osos
          : getDefaultOSOStructure()
      },
      hazards: project.riskAssessment?.hazards || []
    }
  }
}
