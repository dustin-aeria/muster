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

export async function createProject(data) {
  const project = {
    ...data,
    status: 'draft',
    sections: {
      siteSurvey: false,
      flightPlan: false,
    },
    crew: [],
    riskAssessment: {
      sora: null,
      hazards: []
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
