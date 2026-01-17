/**
 * Aeria Ops - Safety Data Operations
 * Firestore functions for incidents, CAPAs, and KPI calculations
 *
 * Phase 1: Foundation for Safety KPI Dashboard
 * @version 1.0.0
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
  Timestamp,
  getCountFromServer,
  writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'

// ============================================
// COLLECTION REFERENCES
// ============================================

const incidentsRef = collection(db, 'incidents')
const capasRef = collection(db, 'capas')
const safetyMetricsRef = collection(db, 'safetyMetrics')

// ============================================
// CONSTANTS & ENUMS
// ============================================

export const INCIDENT_TYPES = {
  near_miss: { label: 'Near Miss', severity: 'near_miss', color: 'bg-yellow-100 text-yellow-800' },
  first_aid: { label: 'First Aid', severity: 'minor', color: 'bg-orange-100 text-orange-800' },
  medical_aid: { label: 'Medical Aid', severity: 'moderate', color: 'bg-orange-200 text-orange-900' },
  lost_time: { label: 'Lost Time Injury', severity: 'serious', color: 'bg-red-100 text-red-800' },
  property_damage: { label: 'Property Damage', severity: 'varies', color: 'bg-purple-100 text-purple-800' },
  environmental: { label: 'Environmental', severity: 'varies', color: 'bg-green-100 text-green-800' },
  regulatory: { label: 'Regulatory Violation', severity: 'varies', color: 'bg-blue-100 text-blue-800' },
  aircraft: { label: 'Aircraft Incident', severity: 'varies', color: 'bg-sky-100 text-sky-800' },
}

export const RPAS_INCIDENT_TYPES = {
  fly_away: { label: 'Fly-Away', notifyTC: true, notifyTSB: false },
  loss_of_control: { label: 'Loss of Control', notifyTC: true, notifyTSB: false },
  collision: { label: 'Collision', notifyTC: true, notifyTSB: true },
  boundary_violation: { label: 'Boundary/Airspace Violation', notifyTC: true, notifyTSB: false },
  airspace_incursion: { label: 'Airspace Incursion', notifyTC: true, notifyTSB: false },
  equipment_failure: { label: 'Equipment Failure', notifyTC: true, notifyTSB: false },
  battery_issue: { label: 'Battery Issue', notifyTC: false, notifyTSB: false },
  c2_link_loss: { label: 'C2 Link Loss', notifyTC: true, notifyTSB: false },
  gps_failure: { label: 'GPS Failure', notifyTC: false, notifyTSB: false },
  near_miss_aircraft: { label: 'Near Miss with Aircraft', notifyTC: true, notifyTSB: true },
}

export const SEVERITY_LEVELS = {
  near_miss: { label: 'Near Miss', value: 0, color: 'bg-yellow-500', recordable: false },
  minor: { label: 'Minor (First Aid)', value: 1, color: 'bg-orange-400', recordable: false },
  moderate: { label: 'Moderate (Medical Aid)', value: 2, color: 'bg-orange-600', recordable: true },
  serious: { label: 'Serious (Lost Time)', value: 3, color: 'bg-red-500', recordable: true },
  critical: { label: 'Critical', value: 4, color: 'bg-red-700', recordable: true },
  fatal: { label: 'Fatal', value: 5, color: 'bg-black', recordable: true },
}

export const INCIDENT_STATUS = {
  reported: { label: 'Reported', color: 'bg-blue-100 text-blue-800', order: 1 },
  under_investigation: { label: 'Under Investigation', color: 'bg-yellow-100 text-yellow-800', order: 2 },
  root_cause_identified: { label: 'Root Cause Identified', color: 'bg-orange-100 text-orange-800', order: 3 },
  capa_in_progress: { label: 'CAPA In Progress', color: 'bg-purple-100 text-purple-800', order: 4 },
  pending_verification: { label: 'Pending Verification', color: 'bg-indigo-100 text-indigo-800', order: 5 },
  closed: { label: 'Closed', color: 'bg-green-100 text-green-800', order: 6 },
}

export const CAPA_STATUS = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800', order: 1 },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', order: 2 },
  pending_verification: { label: 'Pending Verification', color: 'bg-purple-100 text-purple-800', order: 3 },
  verified_effective: { label: 'Verified Effective', color: 'bg-green-100 text-green-800', order: 4 },
  verified_ineffective: { label: 'Verified Ineffective', color: 'bg-red-100 text-red-800', order: 5 },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', order: 6 },
}

export const CAPA_TYPES = {
  corrective: { label: 'Corrective Action', description: 'Fix the immediate problem' },
  preventive: { label: 'Preventive Action', description: 'Prevent recurrence' },
  improvement: { label: 'Continuous Improvement', description: 'Enhance existing controls' },
}

export const PRIORITY_LEVELS = {
  critical: { label: 'Critical', color: 'bg-red-600 text-white', daysToResolve: 1 },
  high: { label: 'High', color: 'bg-orange-500 text-white', daysToResolve: 7 },
  medium: { label: 'Medium', color: 'bg-yellow-500 text-black', daysToResolve: 14 },
  low: { label: 'Low', color: 'bg-green-500 text-white', daysToResolve: 30 },
}

// Regulatory notification requirements
export const REGULATORY_TRIGGERS = {
  TSB_IMMEDIATE: {
    label: 'TSB IMMEDIATE NOTIFICATION',
    phone: '1-800-387-3557',
    altPhone: '1-819-994-3741',
    conditions: ['fatal', 'serious_injury', 'rpas_over_25kg', 'collision_manned_aircraft'],
    timeframe: 'Immediately',
  },
  TRANSPORT_CANADA: {
    label: 'Transport Canada (CADORS)',
    conditions: ['fly_away', 'loss_of_control', 'boundary_violation', 'airspace_incursion', 'near_miss_aircraft'],
    timeframe: '72 hours',
  },
  WORKSAFEBC: {
    label: 'WorkSafeBC',
    conditions: ['fatal', 'serious_injury', 'hospitalization'],
    timeframe: 'Immediately',
  },
  AERIA_INTERNAL: {
    label: 'Aeria Internal (Accountable Executive)',
    name: 'Dustin Wales',
    phone: '604-849-2345',
    conditions: ['all'],
    timeframe: 'Same day',
  },
}

// ============================================
// INCIDENT NUMBER GENERATION
// ============================================

/**
 * Generate a unique incident number in format INC-YYYY-NNNN
 */
export async function generateIncidentNumber() {
  const year = new Date().getFullYear()
  const yearPrefix = `INC-${year}-`
  
  // Query for incidents this year to get the count
  const q = query(
    incidentsRef,
    where('incidentNumber', '>=', yearPrefix),
    where('incidentNumber', '<', `INC-${year + 1}-`),
    orderBy('incidentNumber', 'desc'),
    limit(1)
  )
  
  const snapshot = await getDocs(q)
  
  let nextNumber = 1
  if (!snapshot.empty) {
    const lastIncident = snapshot.docs[0].data()
    const lastNumber = parseInt(lastIncident.incidentNumber.split('-')[2], 10)
    nextNumber = lastNumber + 1
  }
  
  return `${yearPrefix}${String(nextNumber).padStart(4, '0')}`
}

/**
 * Generate a unique CAPA number in format CAPA-YYYY-NNNN
 */
export async function generateCapaNumber() {
  const year = new Date().getFullYear()
  const yearPrefix = `CAPA-${year}-`
  
  const q = query(
    capasRef,
    where('capaNumber', '>=', yearPrefix),
    where('capaNumber', '<', `CAPA-${year + 1}-`),
    orderBy('capaNumber', 'desc'),
    limit(1)
  )
  
  const snapshot = await getDocs(q)
  
  let nextNumber = 1
  if (!snapshot.empty) {
    const lastCapa = snapshot.docs[0].data()
    const lastNumber = parseInt(lastCapa.capaNumber.split('-')[2], 10)
    nextNumber = lastNumber + 1
  }
  
  return `${yearPrefix}${String(nextNumber).padStart(4, '0')}`
}

// ============================================
// INCIDENT CRUD OPERATIONS
// ============================================

/**
 * Get default incident structure
 */
export const getDefaultIncidentStructure = () => ({
  // Identity
  incidentNumber: '',
  
  // Classification
  type: 'near_miss',
  rpasType: null,
  severity: 'near_miss',
  
  // Event Details
  dateOccurred: null,
  timeOccurred: '',
  dateReported: null,
  reportedBy: '',
  reportedByEmail: '',
  location: '',
  gpsCoordinates: null, // { lat, lng }
  projectId: null,
  projectName: '',
  aircraftId: null,
  aircraftName: '',
  
  // Description
  title: '',
  description: '',
  immediateActions: '',
  witnesses: [], // [{ name, contact, statement }]
  photos: [], // [{ url, caption, uploadedAt }]
  
  // People Involved
  involvedPersons: [], // [{ name, role, injuryType, injuryDescription, treatmentReceived, daysLost }]
  
  // Equipment Involved
  equipmentDamage: [], // [{ item, damageDescription, estimatedCost, repairable }]
  
  // Regulatory Notifications
  regulatoryNotifications: {
    tsbRequired: false,
    tsbNotified: false,
    tsbNotifiedDate: null,
    tsbReference: '',
    
    tcRequired: false,
    tcNotified: false,
    tcNotifiedDate: null,
    tcReference: '',
    
    worksafebcRequired: false,
    worksafebcNotified: false,
    worksafebcNotifiedDate: null,
    worksafebcReference: '',
    
    aeriaNotified: false,
    aeriaNotifiedDate: null,
  },
  
  // Investigation
  investigation: {
    assigned: false,
    assignedTo: '',
    assignedDate: null,
    startedDate: null,
    completedDate: null,
    
    // Root Cause Analysis
    immediateCauses: {
      substandardActs: [],
      substandardConditions: [],
    },
    rootCauses: {
      personalFactors: [],
      jobSystemFactors: [],
    },
    
    fiveWhys: [], // [{ why, answer }]
    fishbone: {
      people: [],
      process: [],
      equipment: [],
      environment: [],
      management: [],
      measurement: [],
    },
    
    findings: '',
    recommendations: [],
  },
  
  // Timeline
  timeline: [], // [{ date, action, by, notes }]
  
  // Linked CAPAs
  linkedCapas: [], // [capaId, ...]
  
  // Status
  status: 'reported',
  
  // Metrics (auto-calculated)
  metrics: {
    reportingDelay: 0, // days between occurrence and report
    investigationDuration: 0, // days
    totalResolutionTime: 0, // days from report to close
  },
  
  // Metadata
  createdAt: null,
  updatedAt: null,
  closedAt: null,
  closedBy: '',
})

/**
 * Get all incidents with optional filters
 */
export async function getIncidents(filters = {}) {
  let q = query(incidentsRef, orderBy('createdAt', 'desc'))
  
  // Apply filters
  if (filters.status) {
    q = query(incidentsRef, where('status', '==', filters.status), orderBy('createdAt', 'desc'))
  }
  
  if (filters.type) {
    q = query(incidentsRef, where('type', '==', filters.type), orderBy('createdAt', 'desc'))
  }
  
  if (filters.severity) {
    q = query(incidentsRef, where('severity', '==', filters.severity), orderBy('createdAt', 'desc'))
  }
  
  if (filters.projectId) {
    q = query(incidentsRef, where('projectId', '==', filters.projectId), orderBy('createdAt', 'desc'))
  }
  
  if (filters.dateFrom && filters.dateTo) {
    q = query(
      incidentsRef,
      where('dateOccurred', '>=', Timestamp.fromDate(new Date(filters.dateFrom))),
      where('dateOccurred', '<=', Timestamp.fromDate(new Date(filters.dateTo))),
      orderBy('dateOccurred', 'desc')
    )
  }
  
  if (filters.limit) {
    q = query(q, limit(filters.limit))
  }
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single incident by ID
 */
export async function getIncident(id) {
  const docRef = doc(db, 'incidents', id)
  const snapshot = await getDoc(docRef)
  
  if (!snapshot.exists()) {
    throw new Error('Incident not found')
  }
  
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new incident
 */
export async function createIncident(data) {
  const incidentNumber = await generateIncidentNumber()
  
  // Determine regulatory notification requirements
  const regulatoryNotifications = determineRegulatoryNotifications(data)
  
  const incident = {
    ...getDefaultIncidentStructure(),
    ...data,
    incidentNumber,
    regulatoryNotifications: {
      ...getDefaultIncidentStructure().regulatoryNotifications,
      ...regulatoryNotifications,
    },
    dateReported: serverTimestamp(),
    timeline: [
      {
        date: new Date().toISOString(),
        action: 'Incident Reported',
        by: data.reportedBy || 'System',
        notes: `Incident ${incidentNumber} created`,
      }
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  
  const docRef = await addDoc(incidentsRef, incident)
  return { id: docRef.id, ...incident, incidentNumber }
}

/**
 * Update an incident
 */
export async function updateIncident(id, data) {
  const docRef = doc(db, 'incidents', id)
  
  // Add timeline entry if status changed
  let timeline = data.timeline || []
  if (data.status && data._previousStatus && data.status !== data._previousStatus) {
    timeline = [
      ...timeline,
      {
        date: new Date().toISOString(),
        action: `Status changed to ${INCIDENT_STATUS[data.status]?.label || data.status}`,
        by: data._changedBy || 'System',
        notes: data._statusChangeNotes || '',
      }
    ]
    delete data._previousStatus
    delete data._changedBy
    delete data._statusChangeNotes
  }
  
  await updateDoc(docRef, {
    ...data,
    timeline,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Close an incident
 */
export async function closeIncident(id, closedBy, notes = '') {
  const incident = await getIncident(id)
  
  const timeline = [
    ...(incident.timeline || []),
    {
      date: new Date().toISOString(),
      action: 'Incident Closed',
      by: closedBy,
      notes,
    }
  ]
  
  // Calculate metrics
  const createdAt = incident.createdAt?.toDate ? incident.createdAt.toDate() : new Date(incident.createdAt)
  const totalResolutionTime = Math.ceil((new Date() - createdAt) / (1000 * 60 * 60 * 24))
  
  await updateDoc(doc(db, 'incidents', id), {
    status: 'closed',
    closedAt: serverTimestamp(),
    closedBy,
    timeline,
    'metrics.totalResolutionTime': totalResolutionTime,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete an incident (soft delete recommended in production)
 */
export async function deleteIncident(id) {
  const docRef = doc(db, 'incidents', id)
  await deleteDoc(docRef)
}

// ============================================
// CAPA CRUD OPERATIONS
// ============================================

/**
 * Get default CAPA structure
 */
export const getDefaultCapaStructure = () => ({
  // Identity
  capaNumber: '',
  
  // Source
  sourceType: 'incident', // incident | audit | observation | inspection | meeting | drill
  sourceId: null,
  sourceReference: '',
  
  // Classification
  type: 'corrective', // corrective | preventive | improvement
  priority: 'medium',
  category: '', // HSE | Operations | Equipment | Training | Procedures
  
  // Description
  title: '',
  problemStatement: '',
  rootCause: '',
  
  // Assignment
  assignedTo: '',
  assignedToEmail: '',
  assignedBy: '',
  assignedDate: null,
  
  // Timeline
  targetDate: null,
  revisedTargetDate: null,
  extensionReason: '',
  completedDate: null,
  
  // Action Details
  action: {
    description: '',
    methodology: '', // What approach will be used
    resources: [], // Resources required
    estimatedCost: 0,
    actualCost: 0,
  },
  
  // Implementation
  implementation: {
    status: 'not_started', // not_started | in_progress | complete
    actionsTaken: '',
    evidenceProvided: [], // [{ type, description, url, uploadedAt }]
    resourcesUsed: [],
    completionNotes: '',
  },
  
  // Verification of Effectiveness (VOE)
  verification: {
    required: true,
    method: '', // inspection | audit | review | testing | observation
    criteria: '', // How will effectiveness be measured
    verifiedBy: '',
    verifiedDate: null,
    effective: null, // true | false | null
    evidence: '',
    findings: '',
    
    // Recurrence Check
    recurrenceCheck: {
      required: true,
      checkDate: null, // Usually 30-90 days after implementation
      checkedBy: '',
      recurred: null, // true | false | null
      notes: '',
    },
  },
  
  // Status
  status: 'open',
  
  // Related Items
  relatedIncidentId: null,
  relatedCapas: [], // For linked/follow-up CAPAs
  
  // Comments/History
  comments: [], // [{ date, by, text }]
  statusHistory: [], // [{ date, from, to, by, reason }]
  
  // Metrics (auto-calculated)
  metrics: {
    daysOpen: 0,
    daysOverdue: 0,
    onTime: null, // true | false after completion
    effectivenessScore: null, // 0-100
  },
  
  // Metadata
  createdAt: null,
  updatedAt: null,
  closedAt: null,
})

/**
 * Get all CAPAs with optional filters
 */
export async function getCapas(filters = {}) {
  let q = query(capasRef, orderBy('createdAt', 'desc'))
  
  if (filters.status) {
    q = query(capasRef, where('status', '==', filters.status), orderBy('createdAt', 'desc'))
  }
  
  if (filters.assignedTo) {
    q = query(capasRef, where('assignedTo', '==', filters.assignedTo), orderBy('createdAt', 'desc'))
  }
  
  if (filters.priority) {
    q = query(capasRef, where('priority', '==', filters.priority), orderBy('createdAt', 'desc'))
  }
  
  if (filters.type) {
    q = query(capasRef, where('type', '==', filters.type), orderBy('createdAt', 'desc'))
  }
  
  if (filters.sourceType) {
    q = query(capasRef, where('sourceType', '==', filters.sourceType), orderBy('createdAt', 'desc'))
  }
  
  if (filters.incidentId) {
    q = query(capasRef, where('relatedIncidentId', '==', filters.incidentId), orderBy('createdAt', 'desc'))
  }
  
  if (filters.overdue) {
    const now = Timestamp.now()
    q = query(
      capasRef,
      where('targetDate', '<', now),
      where('status', 'in', ['open', 'in_progress']),
      orderBy('targetDate', 'asc')
    )
  }
  
  if (filters.limit) {
    q = query(q, limit(filters.limit))
  }
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single CAPA by ID
 */
export async function getCapa(id) {
  const docRef = doc(db, 'capas', id)
  const snapshot = await getDoc(docRef)
  
  if (!snapshot.exists()) {
    throw new Error('CAPA not found')
  }
  
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Create a new CAPA
 */
export async function createCapa(data) {
  const capaNumber = await generateCapaNumber()
  
  const capa = {
    ...getDefaultCapaStructure(),
    ...data,
    capaNumber,
    assignedDate: data.assignedTo ? serverTimestamp() : null,
    statusHistory: [
      {
        date: new Date().toISOString(),
        from: null,
        to: 'open',
        by: data.assignedBy || 'System',
        reason: 'CAPA created',
      }
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  
  const docRef = await addDoc(capasRef, capa)
  
  // If linked to an incident, update the incident
  if (data.relatedIncidentId) {
    const incident = await getIncident(data.relatedIncidentId)
    await updateIncident(data.relatedIncidentId, {
      linkedCapas: [...(incident.linkedCapas || []), docRef.id],
    })
  }
  
  return { id: docRef.id, ...capa, capaNumber }
}

/**
 * Update a CAPA
 */
export async function updateCapa(id, data) {
  const docRef = doc(db, 'capas', id)
  const existing = await getCapa(id)
  
  // Track status changes
  let statusHistory = existing.statusHistory || []
  if (data.status && data.status !== existing.status) {
    statusHistory = [
      ...statusHistory,
      {
        date: new Date().toISOString(),
        from: existing.status,
        to: data.status,
        by: data._changedBy || 'System',
        reason: data._statusChangeReason || '',
      }
    ]
    delete data._changedBy
    delete data._statusChangeReason
  }
  
  await updateDoc(docRef, {
    ...data,
    statusHistory,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Complete CAPA implementation
 */
export async function completeCapa(id, completionData) {
  const capa = await getCapa(id)
  
  const wasOnTime = capa.targetDate?.toDate 
    ? new Date() <= capa.targetDate.toDate() 
    : true
  
  await updateDoc(doc(db, 'capas', id), {
    status: 'pending_verification',
    completedDate: serverTimestamp(),
    'implementation.status': 'complete',
    'implementation.actionsTaken': completionData.actionsTaken,
    'implementation.evidenceProvided': completionData.evidence || [],
    'implementation.completionNotes': completionData.notes || '',
    'metrics.onTime': wasOnTime,
    statusHistory: [
      ...(capa.statusHistory || []),
      {
        date: new Date().toISOString(),
        from: capa.status,
        to: 'pending_verification',
        by: completionData.completedBy || 'System',
        reason: 'Implementation completed',
      }
    ],
    updatedAt: serverTimestamp(),
  })
}

/**
 * Verify CAPA effectiveness
 */
export async function verifyCapa(id, verificationData) {
  const capa = await getCapa(id)
  
  const newStatus = verificationData.effective ? 'verified_effective' : 'verified_ineffective'
  
  await updateDoc(doc(db, 'capas', id), {
    status: newStatus,
    'verification.verifiedBy': verificationData.verifiedBy,
    'verification.verifiedDate': serverTimestamp(),
    'verification.effective': verificationData.effective,
    'verification.evidence': verificationData.evidence || '',
    'verification.findings': verificationData.findings || '',
    'metrics.effectivenessScore': verificationData.effective ? 100 : 0,
    statusHistory: [
      ...(capa.statusHistory || []),
      {
        date: new Date().toISOString(),
        from: capa.status,
        to: newStatus,
        by: verificationData.verifiedBy,
        reason: verificationData.effective ? 'Verified effective' : 'Verified ineffective',
      }
    ],
    updatedAt: serverTimestamp(),
  })
  
  // If ineffective, may need to create follow-up CAPA
  return { effective: verificationData.effective, status: newStatus }
}

/**
 * Record recurrence check for CAPA
 */
export async function recordRecurrenceCheck(id, checkData) {
  const capa = await getCapa(id)
  
  await updateDoc(doc(db, 'capas', id), {
    'verification.recurrenceCheck.checkDate': serverTimestamp(),
    'verification.recurrenceCheck.checkedBy': checkData.checkedBy,
    'verification.recurrenceCheck.recurred': checkData.recurred,
    'verification.recurrenceCheck.notes': checkData.notes || '',
    status: checkData.recurred ? 'verified_ineffective' : 'closed',
    closedAt: checkData.recurred ? null : serverTimestamp(),
    statusHistory: [
      ...(capa.statusHistory || []),
      {
        date: new Date().toISOString(),
        from: capa.status,
        to: checkData.recurred ? 'verified_ineffective' : 'closed',
        by: checkData.checkedBy,
        reason: checkData.recurred 
          ? 'Issue recurred - CAPA ineffective' 
          : 'No recurrence - CAPA closed',
      }
    ],
    updatedAt: serverTimestamp(),
  })
  
  return { recurred: checkData.recurred }
}

/**
 * Close a CAPA
 */
export async function closeCapa(id, closedBy, notes = '') {
  const capa = await getCapa(id)
  
  await updateDoc(doc(db, 'capas', id), {
    status: 'closed',
    closedAt: serverTimestamp(),
    statusHistory: [
      ...(capa.statusHistory || []),
      {
        date: new Date().toISOString(),
        from: capa.status,
        to: 'closed',
        by: closedBy,
        reason: notes || 'CAPA closed',
      }
    ],
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a CAPA
 */
export async function deleteCapa(id) {
  const docRef = doc(db, 'capas', id)
  await deleteDoc(docRef)
}

/**
 * Add comment to CAPA
 */
export async function addCapaComment(id, commentData) {
  const capa = await getCapa(id)
  
  const comment = {
    date: new Date().toISOString(),
    by: commentData.by,
    text: commentData.text,
  }
  
  await updateDoc(doc(db, 'capas', id), {
    comments: [...(capa.comments || []), comment],
    updatedAt: serverTimestamp(),
  })
  
  return comment
}

// ============================================
// REGULATORY NOTIFICATION HELPERS
// ============================================

/**
 * Determine which regulatory notifications are required based on incident data
 */
export function determineRegulatoryNotifications(incidentData) {
  const notifications = {
    tsbRequired: false,
    tcRequired: false,
    worksafebcRequired: false,
    aeriaNotified: false,
  }
  
  // TSB Requirements
  if (
    incidentData.severity === 'fatal' ||
    (incidentData.severity === 'serious' && incidentData.involvedPersons?.some(p => p.hospitalized)) ||
    incidentData.rpasType === 'collision' ||
    incidentData.rpasType === 'near_miss_aircraft'
  ) {
    notifications.tsbRequired = true
  }
  
  // Transport Canada Requirements
  if (
    incidentData.rpasType === 'fly_away' ||
    incidentData.rpasType === 'loss_of_control' ||
    incidentData.rpasType === 'boundary_violation' ||
    incidentData.rpasType === 'airspace_incursion' ||
    incidentData.rpasType === 'near_miss_aircraft' ||
    incidentData.type === 'aircraft'
  ) {
    notifications.tcRequired = true
  }
  
  // WorkSafeBC Requirements
  if (
    incidentData.severity === 'fatal' ||
    incidentData.severity === 'serious' ||
    incidentData.involvedPersons?.some(p => p.hospitalized)
  ) {
    notifications.worksafebcRequired = true
  }
  
  // Aeria Internal - ALL incidents
  notifications.aeriaNotified = false // Will be set to true when notified
  
  return notifications
}

/**
 * Get incidents requiring regulatory notification
 */
export async function getIncidentsRequiringNotification() {
  const incidents = await getIncidents({ status: 'reported' })
  
  return incidents.filter(inc => {
    const notif = inc.regulatoryNotifications || {}
    return (
      (notif.tsbRequired && !notif.tsbNotified) ||
      (notif.tcRequired && !notif.tcNotified) ||
      (notif.worksafebcRequired && !notif.worksafebcNotified) ||
      !notif.aeriaNotified
    )
  })
}

/**
 * Mark regulatory notification as complete
 */
export async function markNotificationComplete(incidentId, notificationType, reference = '') {
  const fieldMap = {
    tsb: { notified: 'regulatoryNotifications.tsbNotified', date: 'regulatoryNotifications.tsbNotifiedDate', ref: 'regulatoryNotifications.tsbReference' },
    tc: { notified: 'regulatoryNotifications.tcNotified', date: 'regulatoryNotifications.tcNotifiedDate', ref: 'regulatoryNotifications.tcReference' },
    worksafebc: { notified: 'regulatoryNotifications.worksafebcNotified', date: 'regulatoryNotifications.worksafebcNotifiedDate', ref: 'regulatoryNotifications.worksafebcReference' },
    aeria: { notified: 'regulatoryNotifications.aeriaNotified', date: 'regulatoryNotifications.aeriaNotifiedDate' },
  }
  
  const fields = fieldMap[notificationType]
  if (!fields) throw new Error('Invalid notification type')
  
  const updateData = {
    [fields.notified]: true,
    [fields.date]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  
  if (fields.ref && reference) {
    updateData[fields.ref] = reference
  }
  
  await updateDoc(doc(db, 'incidents', incidentId), updateData)
}

// ============================================
// KPI CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate days since last recordable incident
 */
export async function getDaysSinceLastIncident(excludeNearMiss = true) {
  let q = query(incidentsRef, orderBy('dateOccurred', 'desc'), limit(1))
  
  if (excludeNearMiss) {
    q = query(
      incidentsRef,
      where('severity', 'in', ['minor', 'moderate', 'serious', 'critical', 'fatal']),
      orderBy('dateOccurred', 'desc'),
      limit(1)
    )
  }
  
  const snapshot = await getDocs(q)
  
  if (snapshot.empty) {
    return { days: null, lastIncident: null, message: 'No incidents on record' }
  }
  
  const lastIncident = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  const lastDate = lastIncident.dateOccurred?.toDate 
    ? lastIncident.dateOccurred.toDate() 
    : new Date(lastIncident.dateOccurred)
  
  const days = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24))
  
  return { days, lastIncident, message: null }
}

/**
 * Get incident statistics for a time period
 */
export async function getIncidentStats(startDate, endDate) {
  const start = Timestamp.fromDate(new Date(startDate))
  const end = Timestamp.fromDate(new Date(endDate))
  
  const q = query(
    incidentsRef,
    where('dateOccurred', '>=', start),
    where('dateOccurred', '<=', end),
    orderBy('dateOccurred', 'desc')
  )
  
  const snapshot = await getDocs(q)
  const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  
  // Count by type
  const byType = {}
  Object.keys(INCIDENT_TYPES).forEach(type => { byType[type] = 0 })
  
  // Count by severity
  const bySeverity = {}
  Object.keys(SEVERITY_LEVELS).forEach(sev => { bySeverity[sev] = 0 })
  
  // Count by status
  const byStatus = {}
  Object.keys(INCIDENT_STATUS).forEach(status => { byStatus[status] = 0 })
  
  // Count RPAS-specific
  const byRpasType = {}
  Object.keys(RPAS_INCIDENT_TYPES).forEach(type => { byRpasType[type] = 0 })
  
  let totalRecordable = 0
  let totalLostDays = 0
  let totalNearMiss = 0
  
  incidents.forEach(inc => {
    if (inc.type) byType[inc.type] = (byType[inc.type] || 0) + 1
    if (inc.severity) bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1
    if (inc.status) byStatus[inc.status] = (byStatus[inc.status] || 0) + 1
    if (inc.rpasType) byRpasType[inc.rpasType] = (byRpasType[inc.rpasType] || 0) + 1
    
    // Recordable incidents (medical aid and above)
    if (SEVERITY_LEVELS[inc.severity]?.recordable) {
      totalRecordable++
    }
    
    // Near misses
    if (inc.type === 'near_miss' || inc.severity === 'near_miss') {
      totalNearMiss++
    }
    
    // Lost days
    if (inc.involvedPersons) {
      inc.involvedPersons.forEach(person => {
        totalLostDays += person.daysLost || 0
      })
    }
  })
  
  return {
    total: incidents.length,
    byType,
    bySeverity,
    byStatus,
    byRpasType,
    totalRecordable,
    totalNearMiss,
    totalLostDays,
    incidents,
  }
}

/**
 * Calculate TRIR (Total Recordable Incident Rate)
 * Formula: (Number of recordable incidents * 200,000) / Total hours worked
 */
export async function calculateTRIR(startDate, endDate, totalHoursWorked) {
  if (!totalHoursWorked || totalHoursWorked === 0) {
    return { trir: 0, recordableCount: 0, message: 'No hours worked provided' }
  }
  
  const stats = await getIncidentStats(startDate, endDate)
  const trir = (stats.totalRecordable * 200000) / totalHoursWorked
  
  return {
    trir: Math.round(trir * 100) / 100,
    recordableCount: stats.totalRecordable,
    hoursWorked: totalHoursWorked,
  }
}

/**
 * Calculate LTIFR (Lost Time Injury Frequency Rate)
 * Formula: (Number of LTIs * 1,000,000) / Total hours worked
 */
export async function calculateLTIFR(startDate, endDate, totalHoursWorked) {
  if (!totalHoursWorked || totalHoursWorked === 0) {
    return { ltifr: 0, ltiCount: 0, message: 'No hours worked provided' }
  }
  
  const start = Timestamp.fromDate(new Date(startDate))
  const end = Timestamp.fromDate(new Date(endDate))
  
  const q = query(
    incidentsRef,
    where('dateOccurred', '>=', start),
    where('dateOccurred', '<=', end),
    where('type', '==', 'lost_time')
  )
  
  const snapshot = await getDocs(q)
  const ltiCount = snapshot.size
  
  const ltifr = (ltiCount * 1000000) / totalHoursWorked
  
  return {
    ltifr: Math.round(ltifr * 100) / 100,
    ltiCount,
    hoursWorked: totalHoursWorked,
  }
}

/**
 * Calculate Near Miss Ratio
 * A healthy safety culture typically has 10:1 or higher near miss to incident ratio
 */
export async function calculateNearMissRatio(startDate, endDate) {
  const stats = await getIncidentStats(startDate, endDate)
  
  const actualIncidents = stats.total - stats.totalNearMiss
  
  if (actualIncidents === 0) {
    return {
      ratio: stats.totalNearMiss > 0 ? 'Excellent' : 'N/A',
      nearMissCount: stats.totalNearMiss,
      incidentCount: actualIncidents,
      assessment: stats.totalNearMiss > 0 ? 'Good reporting culture' : 'No data',
    }
  }
  
  const ratio = stats.totalNearMiss / actualIncidents
  
  let assessment = 'Needs improvement'
  if (ratio >= 10) assessment = 'Excellent'
  else if (ratio >= 5) assessment = 'Good'
  else if (ratio >= 2) assessment = 'Fair'
  
  return {
    ratio: Math.round(ratio * 10) / 10,
    nearMissCount: stats.totalNearMiss,
    incidentCount: actualIncidents,
    assessment,
  }
}

/**
 * Get CAPA statistics
 */
export async function getCapaStats(filters = {}) {
  let q = query(capasRef)
  
  if (filters.startDate && filters.endDate) {
    const start = Timestamp.fromDate(new Date(filters.startDate))
    const end = Timestamp.fromDate(new Date(filters.endDate))
    q = query(capasRef, where('createdAt', '>=', start), where('createdAt', '<=', end))
  }
  
  const snapshot = await getDocs(q)
  const capas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  
  // Count by status
  const byStatus = {}
  Object.keys(CAPA_STATUS).forEach(status => { byStatus[status] = 0 })
  
  // Count by type
  const byType = {}
  Object.keys(CAPA_TYPES).forEach(type => { byType[type] = 0 })
  
  // Count by priority
  const byPriority = {}
  Object.keys(PRIORITY_LEVELS).forEach(priority => { byPriority[priority] = 0 })
  
  let totalOverdue = 0
  let totalOnTime = 0
  let totalLate = 0
  let totalEffective = 0
  let totalIneffective = 0
  let totalDaysToClose = 0
  let closedCount = 0
  
  const now = new Date()
  
  capas.forEach(capa => {
    if (capa.status) byStatus[capa.status] = (byStatus[capa.status] || 0) + 1
    if (capa.type) byType[capa.type] = (byType[capa.type] || 0) + 1
    if (capa.priority) byPriority[capa.priority] = (byPriority[capa.priority] || 0) + 1
    
    // Check overdue
    if (['open', 'in_progress'].includes(capa.status) && capa.targetDate) {
      const targetDate = capa.targetDate.toDate ? capa.targetDate.toDate() : new Date(capa.targetDate)
      if (now > targetDate) {
        totalOverdue++
      }
    }
    
    // On-time completion
    if (capa.metrics?.onTime === true) totalOnTime++
    if (capa.metrics?.onTime === false) totalLate++
    
    // Effectiveness
    if (capa.status === 'verified_effective') totalEffective++
    if (capa.status === 'verified_ineffective') totalIneffective++
    
    // Average closure time
    if (capa.closedAt && capa.createdAt) {
      const created = capa.createdAt.toDate ? capa.createdAt.toDate() : new Date(capa.createdAt)
      const closed = capa.closedAt.toDate ? capa.closedAt.toDate() : new Date(capa.closedAt)
      totalDaysToClose += Math.ceil((closed - created) / (1000 * 60 * 60 * 24))
      closedCount++
    }
  })
  
  const completedCount = totalOnTime + totalLate
  const verifiedCount = totalEffective + totalIneffective
  
  return {
    total: capas.length,
    byStatus,
    byType,
    byPriority,
    totalOverdue,
    openCount: byStatus.open + byStatus.in_progress,
    closedCount: byStatus.closed + byStatus.verified_effective,
    
    // Rates
    onTimeRate: completedCount > 0 ? Math.round((totalOnTime / completedCount) * 100) : null,
    effectivenessRate: verifiedCount > 0 ? Math.round((totalEffective / verifiedCount) * 100) : null,
    averageDaysToClose: closedCount > 0 ? Math.round(totalDaysToClose / closedCount) : null,
    
    capas,
  }
}

/**
 * Get overdue CAPAs
 */
export async function getOverdueCapas() {
  const now = Timestamp.now()
  
  const q = query(
    capasRef,
    where('status', 'in', ['open', 'in_progress']),
    where('targetDate', '<', now),
    orderBy('targetDate', 'asc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => {
    const data = doc.data()
    const targetDate = data.targetDate?.toDate ? data.targetDate.toDate() : new Date(data.targetDate)
    const daysOverdue = Math.ceil((new Date() - targetDate) / (1000 * 60 * 60 * 24))
    return { id: doc.id, ...data, daysOverdue }
  })
}

/**
 * Get CAPAs due soon (next 7 days)
 */
export async function getCapasDueSoon(days = 7) {
  const now = new Date()
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))
  
  const q = query(
    capasRef,
    where('status', 'in', ['open', 'in_progress']),
    where('targetDate', '>=', Timestamp.fromDate(now)),
    where('targetDate', '<=', Timestamp.fromDate(futureDate)),
    orderBy('targetDate', 'asc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => {
    const data = doc.data()
    const targetDate = data.targetDate?.toDate ? data.targetDate.toDate() : new Date(data.targetDate)
    const daysRemaining = Math.ceil((targetDate - new Date()) / (1000 * 60 * 60 * 24))
    return { id: doc.id, ...data, daysRemaining }
  })
}

// ============================================
// DASHBOARD DATA AGGREGATION
// ============================================

/**
 * Get comprehensive safety dashboard data
 */
export async function getSafetyDashboardData() {
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  
  // Get days since last incident
  const daysSinceIncident = await getDaysSinceLastIncident(true)
  
  // Get YTD incident stats
  const ytdIncidentStats = await getIncidentStats(yearStart.toISOString(), now.toISOString())
  
  // Get MTD incident stats
  const mtdIncidentStats = await getIncidentStats(monthStart.toISOString(), now.toISOString())
  
  // Get CAPA stats
  const capaStats = await getCapaStats()
  
  // Get overdue items
  const overdueCapas = await getOverdueCapas()
  const capasDueSoon = await getCapasDueSoon(7)
  
  // Get incidents requiring notification
  const pendingNotifications = await getIncidentsRequiringNotification()
  
  // Calculate near miss ratio YTD
  const nearMissRatio = await calculateNearMissRatio(yearStart.toISOString(), now.toISOString())
  
  // Get open incidents under investigation
  const openIncidents = await getIncidents({ status: 'under_investigation' })
  
  return {
    // Hero Metric
    daysSinceLastIncident: daysSinceIncident.days,
    lastIncidentInfo: daysSinceIncident.lastIncident,
    
    // Incident Summary
    incidents: {
      ytd: {
        total: ytdIncidentStats.total,
        recordable: ytdIncidentStats.totalRecordable,
        nearMiss: ytdIncidentStats.totalNearMiss,
        lostDays: ytdIncidentStats.totalLostDays,
        byType: ytdIncidentStats.byType,
        bySeverity: ytdIncidentStats.bySeverity,
      },
      mtd: {
        total: mtdIncidentStats.total,
        recordable: mtdIncidentStats.totalRecordable,
        nearMiss: mtdIncidentStats.totalNearMiss,
      },
      openCount: openIncidents.length,
      nearMissRatio: nearMissRatio,
    },
    
    // CAPA Summary
    capas: {
      total: capaStats.total,
      open: capaStats.openCount,
      overdue: capaStats.totalOverdue,
      dueSoon: capasDueSoon.length,
      onTimeRate: capaStats.onTimeRate,
      effectivenessRate: capaStats.effectivenessRate,
      avgDaysToClose: capaStats.averageDaysToClose,
      byStatus: capaStats.byStatus,
      byPriority: capaStats.byPriority,
    },
    
    // Action Items
    actionItems: {
      overdueCapas: overdueCapas,
      capasDueSoon: capasDueSoon,
      pendingNotifications: pendingNotifications,
      openInvestigations: openIncidents,
    },
    
    // Timestamps
    generatedAt: new Date().toISOString(),
    period: {
      ytdStart: yearStart.toISOString(),
      mtdStart: monthStart.toISOString(),
    },
  }
}

/**
 * Get trend data for charts (last 12 months)
 */
export async function getIncidentTrendData(months = 12) {
  const trends = []
  const now = new Date()
  
  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    
    const stats = await getIncidentStats(monthStart.toISOString(), monthEnd.toISOString())
    
    trends.push({
      month: monthStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
      date: monthStart.toISOString(),
      total: stats.total,
      recordable: stats.totalRecordable,
      nearMiss: stats.totalNearMiss,
      lostDays: stats.totalLostDays,
    })
  }
  
  return trends
}

/**
 * Get safety score (composite leading indicator)
 */
export async function calculateSafetyScore(metrics) {
  const weights = {
    flhaCompletion: 0.15,
    trainingCompliance: 0.15,
    inspectionCompliance: 0.10,
    capaOnTime: 0.15,
    actionClosure: 0.10,
    nearMissReporting: 0.10,
    meetingAttendance: 0.10,
    equipmentAirworthy: 0.15,
  }
  
  let score = 0
  let maxScore = 0
  
  Object.entries(weights).forEach(([key, weight]) => {
    const value = metrics[key]
    if (value !== null && value !== undefined) {
      // Normalize to 0-1 range if percentage
      const normalized = value > 1 ? value / 100 : value
      score += normalized * weight * 100
      maxScore += weight * 100
    }
  })
  
  // Return score normalized to available metrics
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : null
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  // Constants
  INCIDENT_TYPES,
  RPAS_INCIDENT_TYPES,
  SEVERITY_LEVELS,
  INCIDENT_STATUS,
  CAPA_STATUS,
  CAPA_TYPES,
  PRIORITY_LEVELS,
  REGULATORY_TRIGGERS,
  
  // Incident Operations
  getDefaultIncidentStructure,
  generateIncidentNumber,
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  closeIncident,
  deleteIncident,
  
  // CAPA Operations
  getDefaultCapaStructure,
  generateCapaNumber,
  getCapas,
  getCapa,
  createCapa,
  updateCapa,
  completeCapa,
  verifyCapa,
  recordRecurrenceCheck,
  closeCapa,
  deleteCapa,
  addCapaComment,
  
  // Regulatory Notifications
  determineRegulatoryNotifications,
  getIncidentsRequiringNotification,
  markNotificationComplete,
  
  // KPI Calculations
  getDaysSinceLastIncident,
  getIncidentStats,
  calculateTRIR,
  calculateLTIFR,
  calculateNearMissRatio,
  getCapaStats,
  getOverdueCapas,
  getCapasDueSoon,
  
  // Dashboard Data
  getSafetyDashboardData,
  getIncidentTrendData,
  calculateSafetyScore,
}
