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
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

// Collection reference
const tasksRef = collection(db, 'tasks')

// Task Status Constants
export const TASK_STATUS = {
  todo: { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  complete: { value: 'complete', label: 'Complete', color: 'bg-green-100 text-green-800' }
}

// Task Priority Constants
export const TASK_PRIORITY = {
  low: { value: 'low', label: 'Low', color: 'bg-green-500', textColor: 'text-green-600', icon: '🟢' },
  medium: { value: 'medium', label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-600', icon: '🟡' },
  high: { value: 'high', label: 'High', color: 'bg-red-500', textColor: 'text-red-600', icon: '🔴' }
}

// Task Visibility Constants
export const TASK_VISIBILITY = {
  personal: { value: 'personal', label: 'Personal' },
  team: { value: 'team', label: 'Team' }
}

// Task Category Constants with colors for calendar
export const TASK_CATEGORY = {
  general: { value: 'general', label: 'General', color: 'bg-gray-500', lightColor: 'bg-gray-100 text-gray-800' },
  flight: { value: 'flight', label: 'Flight Ops', color: 'bg-sky-500', lightColor: 'bg-sky-100 text-sky-800' },
  maintenance: { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-500', lightColor: 'bg-orange-100 text-orange-800' },
  safety: { value: 'safety', label: 'Safety', color: 'bg-red-500', lightColor: 'bg-red-100 text-red-800' },
  training: { value: 'training', label: 'Training', color: 'bg-purple-500', lightColor: 'bg-purple-100 text-purple-800' },
  admin: { value: 'admin', label: 'Admin', color: 'bg-slate-500', lightColor: 'bg-slate-100 text-slate-800' },
  client: { value: 'client', label: 'Client', color: 'bg-emerald-500', lightColor: 'bg-emerald-100 text-emerald-800' },
  planning: { value: 'planning', label: 'Planning', color: 'bg-indigo-500', lightColor: 'bg-indigo-100 text-indigo-800' }
}

/**
 * Create a new task
 * @param {Object} data - Task data
 * @param {string} organizationId - Organization ID
 * @param {string} userId - User ID of creator
 * @returns {Promise<Object>} Created task with ID
 */
export async function createTask(data, organizationId, userId) {
  const task = {
    organizationId,
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    category: data.category || 'general',
    dueDate: data.dueDate || null,
    projectId: data.projectId || null,
    assignedTo: data.assignedTo || userId,
    visibility: data.visibility || 'personal',
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null
  }

  const docRef = await addDoc(tasksRef, task)
  return { id: docRef.id, ...task }
}

/**
 * Get tasks with optional filters
 * @param {string} organizationId - Organization ID
 * @param {Object} filters - Optional filters (assignedTo, status, projectId, visibility)
 * @returns {Promise<Array>} Array of tasks
 */
export async function getTasks(organizationId, filters = {}) {
  let q = query(
    tasksRef,
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc')
  )

  // Note: Firestore requires composite indexes for multiple where clauses
  // We'll filter additional criteria in memory for flexibility
  const snapshot = await getDocs(q)
  let tasks = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || null,
    updatedAt: doc.data().updatedAt?.toDate?.() || null,
    completedAt: doc.data().completedAt?.toDate?.() || null,
    dueDate: doc.data().dueDate?.toDate?.() || null
  }))

  // Apply filters in memory
  if (filters.assignedTo) {
    tasks = tasks.filter(t => t.assignedTo === filters.assignedTo)
  }
  if (filters.status) {
    tasks = tasks.filter(t => t.status === filters.status)
  }
  if (filters.projectId) {
    tasks = tasks.filter(t => t.projectId === filters.projectId)
  }
  if (filters.visibility) {
    tasks = tasks.filter(t => t.visibility === filters.visibility)
  }

  return tasks
}

/**
 * Get a single task by ID
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Task data
 */
export async function getTask(taskId) {
  const docRef = doc(db, 'tasks', taskId)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Task not found')
  }

  const data = snapshot.data()
  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || null,
    updatedAt: data.updatedAt?.toDate?.() || null,
    completedAt: data.completedAt?.toDate?.() || null,
    dueDate: data.dueDate?.toDate?.() || null
  }
}

/**
 * Update a task
 * @param {string} taskId - Task ID
 * @param {Object} data - Fields to update
 * @returns {Promise<void>}
 */
export async function updateTask(taskId, data) {
  const docRef = doc(db, 'tasks', taskId)

  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  }

  // If marking as complete, set completedAt
  if (data.status === 'complete') {
    updateData.completedAt = serverTimestamp()
  } else if (data.status === 'todo') {
    updateData.completedAt = null
  }

  await updateDoc(docRef, updateData)
}

/**
 * Delete a task
 * @param {string} taskId - Task ID
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId) {
  const docRef = doc(db, 'tasks', taskId)
  await deleteDoc(docRef)
}

/**
 * Get tasks for a specific user (personal + assigned)
 * @param {string} organizationId - Organization ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of tasks
 */
export async function getMyTasks(organizationId, userId) {
  const allTasks = await getTasks(organizationId)

  // Return tasks where user is assignee OR creator (for personal tasks)
  return allTasks.filter(task =>
    task.assignedTo === userId ||
    (task.visibility === 'personal' && task.createdBy === userId)
  )
}

/**
 * Get team-visible tasks only
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of team tasks
 */
export async function getTeamTasks(organizationId) {
  return getTasks(organizationId, { visibility: 'team' })
}

/**
 * Get tasks for a specific project
 * @param {string} organizationId - Organization ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Array of tasks
 */
export async function getProjectTasks(organizationId, projectId) {
  return getTasks(organizationId, { projectId })
}

/**
 * Get tasks with due dates for calendar display
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of tasks with due dates
 */
export async function getTasksWithDueDates(organizationId) {
  const allTasks = await getTasks(organizationId)
  return allTasks.filter(task => task.dueDate !== null)
}

/**
 * Toggle task completion status
 * @param {string} taskId - Task ID
 * @param {boolean} isComplete - Whether task is complete
 * @returns {Promise<void>}
 */
export async function toggleTaskComplete(taskId, isComplete) {
  await updateTask(taskId, {
    status: isComplete ? 'complete' : 'todo'
  })
}
