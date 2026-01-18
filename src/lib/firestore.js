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
  serverTimestamp 
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
// SITE MANAGEMENT HELPERS
// ============================================

/**
 * Add a new site to a project
 */
export async function addSiteToProject(projectId, siteData = {}) {
  const project = await getProject(projectId)
  
  const sites = Array.isArray(project.sites) ? project.sites : []
  
  if (sites.length >= MAX_SITES_PER_PROJECT) {
    throw new Error(`Maximum of ${MAX_SITES_PER_PROJECT} sites per project`)
  }
  
  const newSite = createDefaultSite({
    name: siteData.name || `Site ${sites.length + 1}`,
    description: siteData.description || '',
    order: sites.length,
    createdBy: siteData.createdBy || null
  })
  
  await updateProject(projectId, {
    sites: [...sites, newSite],
    activeSiteId: newSite.id
  })
  
  return newSite
}

/**
 * Duplicate an existing site
 */
export async function duplicateSiteInProject(projectId, sourceSiteId, newName) {
  const project = await getProject(projectId)
  
  const sites = Array.isArray(project.sites) ? project.sites : []
  
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
  const newSite = {
    ...clonedSite,
    id: `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: newName || `${sourceSite.name} (Copy)`,
    status: 'draft',
    order: sites.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  await updateProject(projectId, {
    sites: [...sites, newSite],
    activeSiteId: newSite.id
  })
  
  return newSite
}

/**
 * Remove a site from a project
 */
export async function removeSiteFromProject(projectId, siteId) {
  const project = await getProject(projectId)
  
  const sites = Array.isArray(project.sites) ? project.sites : []
  
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
  let newActiveSiteId = project.activeSiteId
  if (newActiveSiteId === siteId) {
    newActiveSiteId = reorderedSites[0]?.id || null
  }
  
  await updateProject(projectId, {
    sites: reorderedSites,
    activeSiteId: newActiveSiteId
  })
}

/**
 * Update a specific site within a project
 */
export async function updateSiteInProject(projectId, siteId, updates) {
  const project = await getProject(projectId)
  
  const sites = Array.isArray(project.sites) ? project.sites : []
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
  
  await updateProject(projectId, { sites: updatedSites })
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
