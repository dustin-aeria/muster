/**
 * firestore.js
 * Firebase Firestore data access layer with multi-site support
 * 
 * UPDATED: Added multi-site project structure support
 * - Projects now support multiple operation sites
 * - Each site has its own map data, site survey, flight plan, and emergency data
 * - SORA assessments are calculated per-site
 * - Backward compatibility maintained for legacy single-site projects
 * 
 * FIX: Added coordinate serialization to prevent "nested arrays not supported" error
 * 
 * @location src/lib/firestore.js
 * @action REPLACE
 */

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
  serverTimestamp,
  runTransaction
} from 'firebase/firestore'
import { db } from './firebase'

// Import multi-site structures
import {
  createDefaultSite,
  MAX_SITES_PER_PROJECT,
  getDefaultSiteMapData,
  getDefaultSiteSurveyData,
  getDefaultSiteFlightPlanData,
  getDefaultSiteEmergencyData,
  getDefaultSiteSoraData
} from './mapDataStructures'

import {
  needsMultiSiteMigration,
  migrateToMultiSite,
  CURRENT_PROJECT_VERSION
} from './siteMigration'

// ============================================
// COORDINATE SERIALIZATION HELPERS
// Firestore doesn't support nested arrays (e.g., polygon coordinates)
// We serialize them to JSON strings before saving
// ============================================

const COORDINATE_MARKER = '__COORDS__:'

/**
 * Check if a value is a coordinate array (array of [number, number] pairs)
 */
function isCoordinateArray(value) {
  if (!Array.isArray(value) || value.length === 0) return false
  const first = value[0]
  if (Array.isArray(first) && first.length >= 2 && 
      typeof first[0] === 'number' && typeof first[1] === 'number') {
    return true
  }
  return false
}

/**
 * Recursively serialize nested arrays (coordinates) to JSON strings
 */
function serializeForFirestore(obj) {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    if (isCoordinateArray(obj)) {
      return COORDINATE_MARKER + JSON.stringify(obj)
    }
    return obj.map(item => serializeForFirestore(item))
  }
  
  const result = {}
  for (const key of Object.keys(obj)) {
    result[key] = serializeForFirestore(obj[key])
  }
  return result
}

/**
 * Recursively deserialize JSON strings back to coordinate arrays
 */
function deserializeFromFirestore(obj) {
  if (obj === null || obj === undefined) return obj
  
  if (typeof obj === 'string' && obj.startsWith(COORDINATE_MARKER)) {
    try {
      return JSON.parse(obj.slice(COORDINATE_MARKER.length))
    } catch {
      // Return original string if parsing fails - coordinates may be malformed
      return obj
    }
  }
  
  if (typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    return obj.map(item => deserializeFromFirestore(item))
  }
  
  const result = {}
  for (const key of Object.keys(obj)) {
    result[key] = deserializeFromFirestore(obj[key])
  }
  return result
}

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
  return snapshot.docs.map(doc => {
    const data = deserializeFromFirestore(doc.data())
    return { id: doc.id, ...data }
  })
}

export async function getProject(id) {
  const docRef = doc(db, 'projects', id)
  const snapshot = await getDoc(docRef)
  
  if (!snapshot.exists()) {
    throw new Error('Project not found')
  }
  
  const data = deserializeFromFirestore(snapshot.data())
  return { id: snapshot.id, ...data }
}

/**
 * Default SORA structure with proper initialization
 * Matches JARUS SORA 2.5 methodology requirements
 * NOTE: This is now used at project level for shared settings
 * Site-specific SORA data is stored in each site
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
  
  // Step 3: Ground Risk Mitigations (SORA 2.5 Annex B - M3 removed)
  mitigations: {
    M1A: { enabled: false, robustness: 'none', evidence: '' },
    M1B: { enabled: false, robustness: 'none', evidence: '' },
    M1C: { enabled: false, robustness: 'none', evidence: '' },
    M2: { enabled: false, robustness: 'none', evidence: '' }
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
 * LEGACY: Kept for backward compatibility during migration period
 * New projects use sites[].siteSurvey instead
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
 * NOTE: Aircraft and weather minimums remain at project level
 * Site-specific flight data is stored in sites[].flightPlan
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

/**
 * Create a new project with multi-site support
 */
export async function createProject(data) {
  // Create the first default site
  const initialSite = createDefaultSite({
    name: data.siteName || 'Primary Site',
    description: '',
    order: 0
  })
  
  const project = {
    ...data,
    status: 'draft',
    projectVersion: CURRENT_PROJECT_VERSION,
    
    // Section toggles
    sections: {
      siteSurvey: false,
      flightPlan: false,
    },
    
    // Crew (project-level)
    crew: [],
    
    // ============================================
    // MULTI-SITE STRUCTURE (NEW)
    // ============================================
    sites: [initialSite],
    activeSiteId: initialSite.id,
    
    // ============================================
    // PROJECT-LEVEL DATA (Shared across all sites)
    // ============================================
    
    // Flight Plan - project level (aircraft, weather, contingencies)
    flightPlan: {
      aircraft: [],
      weatherMinimums: {
        minVisibility: 3,
        minCeiling: 500,
        maxWind: 10,
        maxGust: 15,
        precipitation: false,
        notes: ''
      },
      contingencies: getDefaultFlightPlanStructure().contingencies,
      additionalProcedures: ''
    },
    
    // HSE Risk Assessment (Per HSE1047 & HSE1048)
    // Project-level - applies to all sites
    hseRiskAssessment: getDefaultHSERiskStructure(),
    
    // SORA 2.5 - Project level defaults
    // Site-specific SORA data overrides these
    soraDefaults: {
      uaCharacteristic: '1m_25ms',
      mitigations: {
        M1A: { enabled: false, robustness: 'none', evidence: '' },
        M1B: { enabled: false, robustness: 'none', evidence: '' },
        M1C: { enabled: false, robustness: 'none', evidence: '' },
        M2: { enabled: false, robustness: 'none', evidence: '' }
      },
      initialARC: 'ARC-b',
      tmpr: { enabled: true, type: 'VLOS', robustness: 'low', evidence: '' },
      containment: { method: '', robustness: 'none', evidence: '' },
      osoCompliance: getDefaultOSOComplianceStructure()
    },
    
    // Emergency Plan - project level (contacts shared across sites)
    emergencyPlan: {
      contacts: [
        { type: 'emergency', name: 'Local Emergency', phone: '911', notes: '' },
        { type: 'fic', name: 'FIC Edmonton', phone: '1-866-541-4102', notes: 'For fly-away reporting' }
      ],
      firstAid: null,
      procedures: {}
    },
    
    // PPE (project-level)
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
    
    // Communications (project-level)
    communications: {
      primaryMethod: 'cell',
      backupMethod: 'radio',
      radioChannels: [],
      checkInFrequency: '',
      checkInProcedure: '',
      emergencyStopWord: 'STOP STOP STOP',
      aeronauticalRadioRequired: false
    },
    
    // Approvals (project-level)
    approvals: {
      preparedBy: null,
      preparedDate: null,
      reviewedBy: null,
      reviewedDate: null,
      approvedBy: null,
      approvedDate: null,
      crewAcknowledgments: []
    },
    
    // Tailgate
    tailgate: null,

    // ============================================
    // PRE-FIELD AND POST-FIELD PHASES
    // ============================================
    preFieldPhase: {
      tasks: [],
      notes: ''
    },
    postFieldPhase: {
      tasks: [],
      notes: ''
    },

    // ============================================
    // LEGACY FIELDS (for backward compatibility)
    // These are null for new projects
    // ============================================
    siteSurvey: null,
    soraAssessment: null,
    riskAssessment: null,

    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
  
  // Serialize before saving to handle any nested arrays
  const serializedProject = serializeForFirestore(project)
  
  const docRef = await addDoc(projectsRef, serializedProject)
  return { id: docRef.id, ...project }
}

export async function updateProject(id, data) {
  const docRef = doc(db, 'projects', id)
  
  // Serialize nested arrays (coordinates) to JSON strings
  const serializedData = serializeForFirestore(data)
  
  await updateDoc(docRef, {
    ...serializedData,
    updatedAt: serverTimestamp()
  })
}

export async function deleteProject(id) {
  const docRef = doc(db, 'projects', id)
  await deleteDoc(docRef)
}

/**
 * Duplicate an existing project
 * Creates a copy with "(Copy)" appended to name, reset to draft status
 */
export async function duplicateProject(id) {
  // Get the original project
  const original = await getProject(id)

  // Create duplicate data - remove id and reset certain fields
  const { id: _id, createdAt, updatedAt, ...projectData } = original

  const duplicateData = {
    ...projectData,
    name: `${projectData.name} (Copy)`,
    status: 'draft',
    // Reset approvals since this is a copy
    approvals: {
      preparedBy: null,
      preparedDate: null,
      reviewedBy: null,
      reviewedDate: null,
      approvedBy: null,
      approvedDate: null,
      crewAcknowledgments: []
    },
    // Reset tailgate for fresh briefing
    tailgate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  // Serialize and save
  const serializedData = serializeForFirestore(duplicateData)
  const docRef = await addDoc(projectsRef, serializedData)

  return { id: docRef.id, ...duplicateData }
}

// ============================================
// SITE MANAGEMENT HELPERS
// ============================================

/**
 * Add a new site to a project
 * Uses transaction to prevent race conditions when multiple users add sites
 */
export async function addSiteToProject(projectId, siteData = {}) {
  const newSite = await runTransaction(db, async (transaction) => {
    const projectRef = doc(db, 'projects', projectId)
    const projectSnap = await transaction.get(projectRef)

    if (!projectSnap.exists()) {
      throw new Error('Project not found')
    }

    const projectData = deserializeFromFirestore(projectSnap.data())
    const sites = Array.isArray(projectData.sites) ? projectData.sites : []

    if (sites.length >= MAX_SITES_PER_PROJECT) {
      throw new Error(`Maximum of ${MAX_SITES_PER_PROJECT} sites per project`)
    }

    const site = createDefaultSite({
      name: siteData.name || `Site ${sites.length + 1}`,
      description: siteData.description || '',
      order: sites.length,
      createdBy: siteData.createdBy || null
    })

    const serializedData = serializeForFirestore({
      sites: [...sites, site],
      activeSiteId: site.id,
      updatedAt: serverTimestamp()
    })

    transaction.update(projectRef, serializedData)

    return site
  })

  return newSite
}

/**
 * Duplicate an existing site
 * Uses transaction to prevent race conditions
 */
export async function duplicateSiteInProject(projectId, sourceSiteId, newName) {
  const newSite = await runTransaction(db, async (transaction) => {
    const projectRef = doc(db, 'projects', projectId)
    const projectSnap = await transaction.get(projectRef)

    if (!projectSnap.exists()) {
      throw new Error('Project not found')
    }

    const projectData = deserializeFromFirestore(projectSnap.data())
    const sites = Array.isArray(projectData.sites) ? projectData.sites : []

    if (sites.length >= MAX_SITES_PER_PROJECT) {
      throw new Error(`Maximum of ${MAX_SITES_PER_PROJECT} sites per project`)
    }

    const sourceSite = sites.find(s => s.id === sourceSiteId)
    if (!sourceSite) {
      throw new Error('Source site not found')
    }

    // Deep clone the site
    const clonedSite = JSON.parse(JSON.stringify(sourceSite))

    // Generate new ID and update metadata
    const site = {
      ...clonedSite,
      id: `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${sourceSite.name} (Copy)`,
      status: 'draft',
      order: sites.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const serializedData = serializeForFirestore({
      sites: [...sites, site],
      activeSiteId: site.id,
      updatedAt: serverTimestamp()
    })

    transaction.update(projectRef, serializedData)

    return site
  })

  return newSite
}

/**
 * Remove a site from a project
 * Uses transaction to prevent race conditions
 */
export async function removeSiteFromProject(projectId, siteId) {
  await runTransaction(db, async (transaction) => {
    const projectRef = doc(db, 'projects', projectId)
    const projectSnap = await transaction.get(projectRef)

    if (!projectSnap.exists()) {
      throw new Error('Project not found')
    }

    const projectData = deserializeFromFirestore(projectSnap.data())
    const sites = Array.isArray(projectData.sites) ? projectData.sites : []

    if (sites.length <= 1) {
      throw new Error('Cannot remove the last site from a project')
    }

    const filteredSites = sites.filter(s => s.id !== siteId)

    // Re-order remaining sites
    const reorderedSites = filteredSites.map((site, index) => ({
      ...site,
      order: index
    }))

    // Update active site if needed
    let newActiveSiteId = projectData.activeSiteId
    if (newActiveSiteId === siteId) {
      newActiveSiteId = reorderedSites[0]?.id || null
    }

    const serializedData = serializeForFirestore({
      sites: reorderedSites,
      activeSiteId: newActiveSiteId,
      updatedAt: serverTimestamp()
    })

    transaction.update(projectRef, serializedData)
  })
}

/**
 * Update a specific site within a project
 * Uses transaction to prevent race conditions
 */
export async function updateSiteInProject(projectId, siteId, updates) {
  await runTransaction(db, async (transaction) => {
    const projectRef = doc(db, 'projects', projectId)
    const projectSnap = await transaction.get(projectRef)

    if (!projectSnap.exists()) {
      throw new Error('Project not found')
    }

    const projectData = deserializeFromFirestore(projectSnap.data())
    const sites = Array.isArray(projectData.sites) ? projectData.sites : []
    const siteIndex = sites.findIndex(s => s.id === siteId)

    if (siteIndex === -1) {
      throw new Error('Site not found')
    }

    const updatedSites = [...sites]
    updatedSites[siteIndex] = {
      ...updatedSites[siteIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    const serializedData = serializeForFirestore({
      sites: updatedSites,
      updatedAt: serverTimestamp()
    })

    transaction.update(projectRef, serializedData)
  })
}

/**
 * Set the active site for a project
 */
export async function setActiveSite(projectId, siteId) {
  await updateProject(projectId, { activeSiteId: siteId })
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
// EQUIPMENT
// ============================================

const equipmentRef = collection(db, 'equipment')

/**
 * Equipment categories with their specific fields
 */
export const EQUIPMENT_CATEGORIES = {
  positioning: {
    label: 'Positioning',
    description: 'RTK base stations, GNSS receivers',
    fields: ['accuracy', 'frequencyBands', 'rtkCapable', 'constellations']
  },
  ground_control: {
    label: 'Ground Control',
    description: 'GCPs, calibration targets',
    fields: ['targetType', 'targetSize', 'material', 'pattern']
  },
  payloads: {
    label: 'Payloads',
    description: 'Cameras, LiDAR, multispectral sensors',
    fields: ['sensorType', 'resolution', 'weight', 'compatibleAircraft', 'fov']
  },
  safety: {
    label: 'Safety',
    description: 'Fire extinguishers, first aid kits, PPE, signage',
    fields: ['expiryDate', 'certificationRequired', 'certificationDate', 'capacity']
  },
  vehicles: {
    label: 'Vehicles',
    description: 'Trucks, trailers, ATVs',
    fields: ['vin', 'licensePlate', 'capacity', 'fuelType', 'insuranceExpiry']
  },
  power: {
    label: 'Power',
    description: 'Generators, battery chargers, power stations',
    fields: ['outputWattage', 'batteryCapacity', 'inputVoltage', 'outputVoltage', 'portTypes']
  },
  communication: {
    label: 'Communication',
    description: 'Radios, satellite communicators',
    fields: ['frequencyRange', 'channels', 'range', 'encryption', 'batteryLife']
  },
  support: {
    label: 'Support',
    description: 'Tripods, cases, tools, cables',
    fields: ['dimensions', 'weight', 'compatibility', 'material']
  },
  rpas: {
    label: 'RPAS Accessories',
    description: 'Batteries, propellers, controllers, spare parts',
    fields: ['compatibleAircraft', 'partNumber', 'cycles', 'condition']
  },
  other: {
    label: 'Other Equipment',
    description: 'Miscellaneous items',
    fields: ['notes']
  }
}

/**
 * Equipment status options
 */
export const EQUIPMENT_STATUS = {
  available: { label: 'Available', color: 'bg-green-100 text-green-700' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  maintenance: { label: 'In Maintenance', color: 'bg-amber-100 text-amber-700' },
  retired: { label: 'Retired', color: 'bg-gray-100 text-gray-500' }
}

/**
 * Get all equipment with optional filters
 * @param {Object} filters - Optional filters (category, status, search)
 * @returns {Promise<Array>}
 */
export async function getEquipment(filters = {}) {
  let q = query(equipmentRef, orderBy('name', 'asc'))

  if (filters.category) {
    q = query(equipmentRef, where('category', '==', filters.category), orderBy('name', 'asc'))
  }

  if (filters.status) {
    q = query(equipmentRef, where('status', '==', filters.status), orderBy('name', 'asc'))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single equipment item by ID
 * @param {string} id - Equipment ID
 * @returns {Promise<Object>}
 */
export async function getEquipmentById(id) {
  const docRef = doc(db, 'equipment', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Equipment not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create new equipment
 * @param {Object} data - Equipment data
 * @returns {Promise<Object>}
 */
export async function createEquipment(data) {
  const equipment = {
    name: data.name || '',
    category: data.category || 'support',
    subcategory: data.subcategory || '',
    manufacturer: data.manufacturer || '',
    model: data.model || '',
    serialNumber: data.serialNumber || '',
    purchaseDate: data.purchaseDate || null,
    purchasePrice: data.purchasePrice || null,
    status: data.status || 'available',
    condition: data.condition || '',
    notes: data.notes || '',
    imageUrl: data.imageUrl || null,

    // Maintenance tracking
    maintenanceInterval: data.maintenanceInterval || null, // days
    lastServiceDate: data.lastServiceDate || null,
    nextServiceDate: data.nextServiceDate || null,

    // Cost rates for estimating
    hourlyRate: data.hourlyRate || null,
    dailyRate: data.dailyRate || null,
    weeklyRate: data.weeklyRate || null,

    // Category-specific custom fields
    customFields: data.customFields || {},

    // Tracking
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(equipmentRef, equipment)
  return { id: docRef.id, ...equipment }
}

/**
 * Update existing equipment
 * @param {string} id - Equipment ID
 * @param {Object} data - Updated equipment data
 */
export async function updateEquipment(id, data) {
  const docRef = doc(db, 'equipment', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete equipment
 * @param {string} id - Equipment ID
 */
export async function deleteEquipment(id) {
  const docRef = doc(db, 'equipment', id)
  await deleteDoc(docRef)
}

/**
 * Get equipment assigned to a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>}
 */
export async function getProjectEquipmentAssignments(projectId) {
  const assignmentsRef = collection(db, 'projects', projectId, 'assignedEquipment')
  const q = query(assignmentsRef, orderBy('assignedAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Assign equipment to a project
 * @param {string} projectId - Project ID
 * @param {string} equipmentId - Equipment ID
 * @param {string} assignedBy - User ID who made the assignment
 * @param {string} notes - Optional notes
 * @returns {Promise<Object>}
 */
export async function assignEquipmentToProject(projectId, equipmentId, assignedBy, notes = '') {
  const assignmentsRef = collection(db, 'projects', projectId, 'assignedEquipment')

  const assignment = {
    equipmentId,
    assignedAt: serverTimestamp(),
    assignedBy,
    returnedAt: null,
    notes
  }

  const docRef = await addDoc(assignmentsRef, assignment)

  // Update equipment status to assigned
  await updateEquipment(equipmentId, { status: 'assigned' })

  return { id: docRef.id, ...assignment }
}

/**
 * Remove equipment assignment from project
 * @param {string} projectId - Project ID
 * @param {string} assignmentId - Assignment document ID
 * @param {string} equipmentId - Equipment ID to update status
 */
export async function removeEquipmentFromProject(projectId, assignmentId, equipmentId) {
  const assignmentRef = doc(db, 'projects', projectId, 'assignedEquipment', assignmentId)

  // Mark as returned instead of deleting (for history)
  await updateDoc(assignmentRef, {
    returnedAt: serverTimestamp()
  })

  // Update equipment status back to available
  await updateEquipment(equipmentId, { status: 'available' })
}

/**
 * Get equipment due for maintenance
 * @param {number} daysAhead - Number of days to look ahead (default 30)
 * @returns {Promise<Array>}
 */
export async function getEquipmentDueForMaintenance(daysAhead = 30) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysAhead)
  const futureDateStr = futureDate.toISOString().split('T')[0]

  const q = query(
    equipmentRef,
    where('nextServiceDate', '<=', futureDateStr),
    where('status', '!=', 'retired'),
    orderBy('nextServiceDate', 'asc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get equipment maintenance statistics
 * @returns {Promise<Object>} Maintenance statistics
 */
export async function getEquipmentMaintenanceStats() {
  const allEquipment = await getEquipment()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const stats = {
    total: allEquipment.length,
    withMaintenance: 0,
    overdue: 0,
    dueSoon: 0, // within 30 days
    upToDate: 0,
    noSchedule: 0,
    overdueItems: [],
    dueSoonItems: []
  }

  allEquipment.forEach(item => {
    if (item.status === 'retired') return

    if (!item.nextServiceDate) {
      stats.noSchedule++
      return
    }

    stats.withMaintenance++
    const nextService = new Date(item.nextServiceDate)
    const daysUntil = Math.ceil((nextService - today) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) {
      stats.overdue++
      stats.overdueItems.push({
        ...item,
        daysOverdue: Math.abs(daysUntil)
      })
    } else if (daysUntil <= 30) {
      stats.dueSoon++
      stats.dueSoonItems.push({
        ...item,
        daysUntil
      })
    } else {
      stats.upToDate++
    }
  })

  // Sort by urgency
  stats.overdueItems.sort((a, b) => b.daysOverdue - a.daysOverdue)
  stats.dueSoonItems.sort((a, b) => a.daysUntil - b.daysUntil)

  return stats
}

/**
 * Record maintenance completion for equipment
 * Updates lastServiceDate and calculates nextServiceDate based on interval
 * @param {string} equipmentId - Equipment ID
 * @param {string} serviceDate - Date of service (YYYY-MM-DD format)
 * @param {string} notes - Optional service notes
 * @returns {Promise<Object>} Updated equipment data
 */
export async function recordEquipmentMaintenance(equipmentId, serviceDate, notes = '') {
  const equipment = await getEquipmentById(equipmentId)

  const updateData = {
    lastServiceDate: serviceDate,
    status: 'available' // Return to available after maintenance
  }

  // Calculate next service date if interval is set
  if (equipment.maintenanceInterval) {
    const lastService = new Date(serviceDate)
    lastService.setDate(lastService.getDate() + parseInt(equipment.maintenanceInterval))
    updateData.nextServiceDate = lastService.toISOString().split('T')[0]
  }

  // Add maintenance note to existing notes
  if (notes) {
    const timestamp = new Date().toISOString().split('T')[0]
    const maintenanceLog = `[${timestamp}] Maintenance completed: ${notes}`
    updateData.notes = equipment.notes
      ? `${equipment.notes}\n\n${maintenanceLog}`
      : maintenanceLog
  }

  await updateEquipment(equipmentId, updateData)

  return { id: equipmentId, ...equipment, ...updateData }
}

/**
 * Set equipment maintenance status
 * @param {string} equipmentId - Equipment ID
 * @param {boolean} inMaintenance - Whether equipment is in maintenance
 * @param {string} notes - Optional notes
 */
export async function setEquipmentMaintenanceStatus(equipmentId, inMaintenance, notes = '') {
  const updateData = {
    status: inMaintenance ? 'maintenance' : 'available'
  }

  if (notes) {
    const equipment = await getEquipmentById(equipmentId)
    const timestamp = new Date().toISOString().split('T')[0]
    const statusNote = inMaintenance
      ? `[${timestamp}] Sent for maintenance: ${notes}`
      : `[${timestamp}] Returned from maintenance: ${notes}`
    updateData.notes = equipment.notes
      ? `${equipment.notes}\n\n${statusNote}`
      : statusNote
  }

  await updateEquipment(equipmentId, updateData)
}

/**
 * Get equipment value summary (for insurance/accounting)
 * @returns {Promise<Object>} Value summary by category and status
 */
export async function getEquipmentValueSummary() {
  const allEquipment = await getEquipment()

  const summary = {
    totalValue: 0,
    totalItems: allEquipment.length,
    byCategory: {},
    byStatus: {}
  }

  allEquipment.forEach(item => {
    const value = parseFloat(item.purchasePrice) || 0
    summary.totalValue += value

    // By category
    const cat = item.category || 'support'
    if (!summary.byCategory[cat]) {
      summary.byCategory[cat] = { count: 0, value: 0 }
    }
    summary.byCategory[cat].count++
    summary.byCategory[cat].value += value

    // By status
    const status = item.status || 'available'
    if (!summary.byStatus[status]) {
      summary.byStatus[status] = { count: 0, value: 0 }
    }
    summary.byStatus[status].count++
    summary.byStatus[status].value += value
  })

  return summary
}

// ============================================
// SERVICES
// ============================================

const servicesRef = collection(db, 'services')

/**
 * Get all services with optional filters
 * @param {Object} filters - Optional filters (category, status)
 * @returns {Promise<Array>}
 */
export async function getServices(filters = {}) {
  let q = query(servicesRef, orderBy('name', 'asc'))

  if (filters.category) {
    q = query(servicesRef, where('category', '==', filters.category), orderBy('name', 'asc'))
  }

  if (filters.status) {
    q = query(q, where('status', '==', filters.status))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single service by ID
 * @param {string} id - Service ID
 * @returns {Promise<Object>}
 */
export async function getServiceById(id) {
  const docRef = doc(db, 'services', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Service not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new service
 * @param {Object} data - Service data
 * @returns {Promise<Object>}
 */
export async function createService(data) {
  const service = {
    name: data.name,
    category: data.category || 'other',
    description: data.description || '',
    hourlyRate: parseFloat(data.hourlyRate) || 0,
    dailyRate: parseFloat(data.dailyRate) || 0,
    weeklyRate: parseFloat(data.weeklyRate) || 0,
    minimumCharge: parseFloat(data.minimumCharge) || 0,
    unit: data.unit || 'hour',
    status: data.status || 'active',
    notes: data.notes || '',
    createdBy: data.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(servicesRef, service)
  return { id: docRef.id, ...service }
}

/**
 * Update a service
 * @param {string} id - Service ID
 * @param {Object} data - Updated service data
 */
export async function updateServiceRecord(id, data) {
  const docRef = doc(db, 'services', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a service
 * @param {string} id - Service ID
 */
export async function deleteService(id) {
  const docRef = doc(db, 'services', id)
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

  if (filters.status) {
    q = query(q, where('status', '==', filters.status))
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
    projectId: data.projectId || null,  // Optional link to project
    status: data.status || 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(formsRef, form)
  return { id: docRef.id, ...form }
}

/**
 * Get forms linked to a specific project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>}
 */
export async function getFormsByProject(projectId) {
  const q = query(formsRef, where('projectId', '==', projectId), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Link a form to a project
 * @param {string} formId - Form ID
 * @param {string} projectId - Project ID
 */
export async function linkFormToProject(formId, projectId) {
  const docRef = doc(db, 'forms', formId)
  await updateDoc(docRef, {
    projectId,
    updatedAt: serverTimestamp()
  })
}

/**
 * Unlink a form from a project
 * @param {string} formId - Form ID
 */
export async function unlinkFormFromProject(formId) {
  const docRef = doc(db, 'forms', formId)
  await updateDoc(docRef, {
    projectId: null,
    updatedAt: serverTimestamp()
  })
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
// POLICIES
// ============================================

const policiesRef = collection(db, 'policies')

/**
 * Get all policies
 * @param {Object} filters - Optional filters (category, status)
 * @returns {Promise<Array>}
 */
export async function getPolicies(filters = {}) {
  let q = query(policiesRef, orderBy('number', 'asc'))

  if (filters.category) {
    q = query(policiesRef, where('category', '==', filters.category), orderBy('number', 'asc'))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single policy by ID
 * @param {string} id - Policy ID
 * @returns {Promise<Object>}
 */
export async function getPolicy(id) {
  const docRef = doc(db, 'policies', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Policy not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new policy
 * @param {Object} data - Policy data
 * @returns {Promise<Object>}
 */
export async function createPolicy(data) {
  const policy = {
    number: data.number || '',
    title: data.title || '',
    category: data.category || 'rpas',
    description: data.description || '',
    version: data.version || '1.0',
    effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
    reviewDate: data.reviewDate || '',
    owner: data.owner || '',
    status: data.status || 'draft',
    keywords: data.keywords || [],
    relatedPolicies: data.relatedPolicies || [],
    regulatoryRefs: data.regulatoryRefs || [],
    sections: data.sections || [],
    attachments: data.attachments || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: data.createdBy || null
  }

  const docRef = await addDoc(policiesRef, policy)
  return { id: docRef.id, ...policy }
}

/**
 * Update an existing policy
 * @param {string} id - Policy ID
 * @param {Object} data - Updated policy data
 */
export async function updatePolicy(id, data) {
  const docRef = doc(db, 'policies', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a policy
 * @param {string} id - Policy ID
 */
export async function deletePolicy(id) {
  const docRef = doc(db, 'policies', id)
  await deleteDoc(docRef)
}

/**
 * Generate next policy number for a category
 * @param {string} category - Category ID (rpas, crm, hse)
 * @returns {Promise<string>}
 */
export async function getNextPolicyNumber(category) {
  const categoryRanges = {
    rpas: { start: 1001, end: 1999 },
    crm: { start: 2001, end: 2999 },
    hse: { start: 3001, end: 3999 }
  }

  const range = categoryRanges[category] || categoryRanges.rpas

  // Get all policies in category
  const q = query(policiesRef, where('category', '==', category))
  const snapshot = await getDocs(q)

  // Find highest number in range
  let maxNumber = range.start - 1
  snapshot.docs.forEach(doc => {
    const num = parseInt(doc.data().number, 10)
    if (!isNaN(num) && num >= range.start && num <= range.end && num > maxNumber) {
      maxNumber = num
    }
  })

  return String(maxNumber + 1)
}

// ============================================
// HELPER: Migration for Existing Projects
// ============================================

/**
 * Migrate existing project to new decoupled HSE/SORA structure
 * AND new multi-site structure
 * Call this when loading a project that has old data format
 */
export function migrateProjectToDecoupledStructure(project) {
  if (!project) return project
  
  // First, check if we need multi-site migration
  if (needsMultiSiteMigration(project)) {
    // Perform full migration to multi-site structure
    const migratedProject = migrateToMultiSite(project)
    return migratedProject
  }
  
  // Check if already has new structure
  if (Array.isArray(project.sites) && project.sites.length > 0) {
    // Already has sites, ensure all required fields exist
    return ensureProjectDefaults(project)
  }
  
  // Legacy migration for HSE/SORA (from before multi-site)
  const hasSeparateStructures = project.hseRiskAssessment && project.soraAssessment
  
  if (!hasSeparateStructures && project.riskAssessment) {
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
    
    project.hseRiskAssessment = hseRiskAssessment
    project.riskAssessment = null
  }
  
  // Ensure project has sites array (new project without legacy data)
  if (!Array.isArray(project.sites) || project.sites.length === 0) {
    const initialSite = createDefaultSite({
      name: 'Primary Site',
      order: 0
    })
    project.sites = [initialSite]
    project.activeSiteId = initialSite.id
    project.projectVersion = CURRENT_PROJECT_VERSION
  }
  
  return ensureProjectDefaults(project)
}

/**
 * Ensure all required fields exist with defaults
 */
function ensureProjectDefaults(project) {
  // Ensure sites array
  if (!Array.isArray(project.sites)) {
    project.sites = []
  }
  
  // Ensure activeSiteId
  if (!project.activeSiteId && project.sites.length > 0) {
    project.activeSiteId = project.sites[0].id
  }
  
  // Ensure each site has all required structures
  project.sites = project.sites.map(site => ({
    ...site,
    mapData: site.mapData || getDefaultSiteMapData(),
    siteSurvey: site.siteSurvey || getDefaultSiteSurveyData(),
    flightPlan: site.flightPlan || getDefaultSiteFlightPlanData(),
    emergency: site.emergency || getDefaultSiteEmergencyData(),
    soraAssessment: site.soraAssessment || getDefaultSiteSoraData()
  }))
  
  // Ensure project-level structures
  if (!project.flightPlan) {
    project.flightPlan = getDefaultFlightPlanStructure()
  }

  if (!project.hseRiskAssessment) {
    project.hseRiskAssessment = getDefaultHSERiskStructure()
  }

  if (!project.emergencyPlan) {
    project.emergencyPlan = {
      contacts: [
        { type: 'emergency', name: 'Local Emergency', phone: '911', notes: '' },
        { type: 'fic', name: 'FIC Edmonton', phone: '1-866-541-4102', notes: 'For fly-away reporting' }
      ],
      firstAid: null,
      procedures: {}
    }
  }

  // Ensure pre-field and post-field phases exist
  if (!project.preFieldPhase) {
    project.preFieldPhase = { tasks: [], notes: '' }
  }
  if (!project.postFieldPhase) {
    project.postFieldPhase = { tasks: [], notes: '' }
  }

  return project
}

/**
 * Legacy migration function (calls new function)
 * @deprecated Use migrateProjectToDecoupledStructure instead
 */
export function migrateProjectToSORA(project) {
  return migrateProjectToDecoupledStructure(project)
}

// ============================================
// CUSTOM FORMS (User-created form templates)
// ============================================

const customFormsRef = collection(db, 'customForms')

/**
 * Get all custom forms for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export async function getCustomForms(userId) {
  const q = query(customFormsRef, where('createdBy', '==', userId), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single custom form by ID
 * @param {string} id - Form ID
 * @returns {Promise<Object>}
 */
export async function getCustomForm(id) {
  const docRef = doc(db, 'customForms', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Custom form not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new custom form
 * @param {Object} data - Form data
 * @param {string} userId - User ID
 * @returns {Promise<Object>}
 */
export async function createCustomForm(data, userId) {
  const customForm = {
    ...data,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(customFormsRef, customForm)
  return { id: docRef.id, ...customForm }
}

/**
 * Update a custom form
 * @param {string} id - Form ID
 * @param {Object} data - Updated form data
 */
export async function updateCustomForm(id, data) {
  const docRef = doc(db, 'customForms', id)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete a custom form
 * @param {string} id - Form ID
 */
export async function deleteCustomForm(id) {
  const docRef = doc(db, 'customForms', id)
  await deleteDoc(docRef)
}

// ============================================
// USER FEEDBACK
// ============================================

const feedbackRef = collection(db, 'feedback')

/**
 * Submit user feedback
 * @param {Object} data - Feedback data
 * @returns {Promise<Object>}
 */
export async function submitFeedback(data) {
  const feedback = {
    type: data.type || 'general',
    message: data.message || '',
    page: data.page || '',
    userId: data.userId || null,
    userEmail: data.userEmail || null,
    userAgent: data.userAgent || '',
    screenSize: data.screenSize || '',
    status: 'new',  // new | reviewed | resolved
    notes: '',      // Admin notes
    createdAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null
  }

  const docRef = await addDoc(feedbackRef, feedback)
  return { id: docRef.id, ...feedback }
}

/**
 * Get all feedback with optional filters
 * @param {Object} filters - Optional filters (status, type, limit)
 * @returns {Promise<Array>}
 */
export async function getFeedback(filters = {}) {
  let q = query(feedbackRef, orderBy('createdAt', 'desc'))

  if (filters.status) {
    q = query(feedbackRef, where('status', '==', filters.status), orderBy('createdAt', 'desc'))
  }

  if (filters.type) {
    q = query(feedbackRef, where('type', '==', filters.type), orderBy('createdAt', 'desc'))
  }

  if (filters.limit) {
    q = query(q, limit(filters.limit))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Update feedback status/notes
 * @param {string} id - Feedback ID
 * @param {Object} data - Update data (status, notes, reviewedBy)
 */
export async function updateFeedback(id, data) {
  const docRef = doc(db, 'feedback', id)
  await updateDoc(docRef, {
    ...data,
    reviewedAt: data.status !== 'new' ? serverTimestamp() : null
  })
}

/**
 * Delete feedback
 * @param {string} id - Feedback ID
 */
export async function deleteFeedback(id) {
  const docRef = doc(db, 'feedback', id)
  await deleteDoc(docRef)
}

/**
 * Get feedback statistics
 * @returns {Promise<Object>}
 */
export async function getFeedbackStats() {
  const allFeedback = await getFeedback()

  const stats = {
    total: allFeedback.length,
    byStatus: { new: 0, reviewed: 0, resolved: 0 },
    byType: { general: 0, bug: 0, feature: 0, question: 0 },
    recentFeedback: allFeedback.slice(0, 5)
  }

  allFeedback.forEach(item => {
    const status = item.status || 'new'
    const type = item.type || 'general'

    if (stats.byStatus[status] !== undefined) {
      stats.byStatus[status]++
    }
    if (stats.byType[type] !== undefined) {
      stats.byType[type]++
    }
  })

  return stats
}

// ============================================
// UTILITY EXPORTS
// ============================================

export {
  MAX_SITES_PER_PROJECT,
  CURRENT_PROJECT_VERSION,
  createDefaultSite,
  getDefaultSiteMapData,
  getDefaultSiteSurveyData,
  getDefaultSiteFlightPlanData,
  getDefaultSiteEmergencyData,
  getDefaultSiteSoraData
}
