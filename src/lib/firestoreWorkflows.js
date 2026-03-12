/**
 * Firestore Workflow Operations
 * CRUD operations for workflow templates and instances
 *
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
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'
import {
  COLLECTIONS,
  WORKFLOW_TEMPLATE_STATUS,
  WORKFLOW_INSTANCE_STATUS,
  DEFAULT_WORKFLOW_TEMPLATES,
} from './database-phase4'

// ============================================
// COLLECTION REFERENCES
// ============================================

const workflowTemplatesRef = collection(db, COLLECTIONS.WORKFLOW_TEMPLATES)
const workflowInstancesRef = collection(db, COLLECTIONS.WORKFLOW_INSTANCES)

// ============================================
// ERROR HANDLING HELPER
// ============================================

async function withErrorHandling(operation, operationName) {
  try {
    return await operation()
  } catch (error) {
    const enhancedError = new Error(`${operationName} failed: ${error.message}`)
    enhancedError.originalError = error
    enhancedError.operationName = operationName
    throw enhancedError
  }
}

// ============================================
// WORKFLOW TEMPLATES
// ============================================

/**
 * Get all workflow templates for an organization
 * @param {string} organizationId - Organization ID
 * @param {string} [status] - Optional status filter
 * @returns {Promise<Array>} Array of workflow templates
 */
export async function getWorkflowTemplates(organizationId, status = null) {
  return withErrorHandling(async () => {
    let q = query(
      workflowTemplatesRef,
      where('organizationId', '==', organizationId),
      orderBy('name', 'asc')
    )

    const snapshot = await getDocs(q)
    let templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }))

    if (status) {
      templates = templates.filter(t => t.status === status)
    }

    return templates
  }, 'getWorkflowTemplates')
}

/**
 * Get active workflow templates
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>}
 */
export async function getActiveWorkflowTemplates(organizationId) {
  return getWorkflowTemplates(organizationId, 'active')
}

/**
 * Get a single workflow template by ID
 * @param {string} templateId - Template document ID
 * @returns {Promise<Object|null>}
 */
export async function getWorkflowTemplate(templateId) {
  return withErrorHandling(async () => {
    const docRef = doc(workflowTemplatesRef, templateId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) {
      return null
    }

    const data = snapshot.data()
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    }
  }, 'getWorkflowTemplate')
}

/**
 * Create a new workflow template
 * @param {Object} template - Template data
 * @returns {Promise<Object>} Created template with ID
 */
export async function createWorkflowTemplate(template) {
  return withErrorHandling(async () => {
    const now = serverTimestamp()

    const docData = {
      name: template.name,
      description: template.description || '',
      organizationId: template.organizationId,
      steps: template.steps || [],
      triggerType: template.triggerType || 'manual',
      triggerFormTypes: template.triggerFormTypes || [],
      status: template.status || 'draft',
      createdAt: now,
      createdBy: template.createdBy,
      updatedAt: now,
    }

    const docRef = await addDoc(workflowTemplatesRef, docData)

    return {
      id: docRef.id,
      ...docData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }, 'createWorkflowTemplate')
}

/**
 * Update a workflow template
 * @param {string} templateId - Template ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateWorkflowTemplate(templateId, updates) {
  return withErrorHandling(async () => {
    const docRef = doc(workflowTemplatesRef, templateId)

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  }, 'updateWorkflowTemplate')
}

/**
 * Delete a workflow template
 * @param {string} templateId - Template ID
 * @returns {Promise<void>}
 */
export async function deleteWorkflowTemplate(templateId) {
  return withErrorHandling(async () => {
    const docRef = doc(workflowTemplatesRef, templateId)
    await deleteDoc(docRef)
  }, 'deleteWorkflowTemplate')
}

/**
 * Archive a workflow template
 * @param {string} templateId - Template ID
 * @returns {Promise<void>}
 */
export async function archiveWorkflowTemplate(templateId) {
  return updateWorkflowTemplate(templateId, { status: 'archived' })
}

/**
 * Activate a workflow template
 * @param {string} templateId - Template ID
 * @returns {Promise<void>}
 */
export async function activateWorkflowTemplate(templateId) {
  return updateWorkflowTemplate(templateId, { status: 'active' })
}

/**
 * Seed default workflow templates for a new organization
 * @param {string} organizationId - Organization ID
 * @param {string} createdBy - User ID
 * @returns {Promise<Array>} Created templates
 */
export async function seedDefaultWorkflowTemplates(organizationId, createdBy) {
  return withErrorHandling(async () => {
    const created = []

    for (const template of DEFAULT_WORKFLOW_TEMPLATES) {
      const result = await createWorkflowTemplate({
        ...template,
        organizationId,
        createdBy,
      })
      created.push(result)
    }

    return created
  }, 'seedDefaultWorkflowTemplates')
}

// ============================================
// WORKFLOW INSTANCES
// ============================================

/**
 * Get all workflow instances for an organization
 * @param {string} organizationId - Organization ID
 * @param {string} [status] - Optional status filter
 * @returns {Promise<Array>}
 */
export async function getWorkflowInstances(organizationId, status = null) {
  return withErrorHandling(async () => {
    let q = query(
      workflowInstancesRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    let instances = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      startedAt: doc.data().startedAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
    }))

    if (status) {
      instances = instances.filter(i => i.status === status)
    }

    return instances
  }, 'getWorkflowInstances')
}

/**
 * Get active workflow instances
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>}
 */
export async function getActiveWorkflowInstances(organizationId) {
  return getWorkflowInstances(organizationId, 'active')
}

/**
 * Get a single workflow instance by ID
 * @param {string} instanceId - Instance document ID
 * @returns {Promise<Object|null>}
 */
export async function getWorkflowInstance(instanceId) {
  return withErrorHandling(async () => {
    const docRef = doc(workflowInstancesRef, instanceId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) {
      return null
    }

    const data = snapshot.data()
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      startedAt: data.startedAt?.toDate(),
      completedAt: data.completedAt?.toDate(),
      dueDate: data.dueDate?.toDate(),
      history: (data.history || []).map(h => ({
        ...h,
        at: h.at?.toDate ? h.at.toDate() : new Date(h.at),
      })),
    }
  }, 'getWorkflowInstance')
}

/**
 * Start a new workflow instance
 * @param {Object} options - Workflow options
 * @param {string} options.templateId - Workflow template ID
 * @param {string} options.organizationId - Organization ID
 * @param {string} options.entityType - Entity type (e.g., 'form_submission')
 * @param {string} options.entityId - Entity ID
 * @param {string} [options.entityTitle] - Entity title
 * @param {string} options.startedBy - User ID starting workflow
 * @param {string} options.startedByName - User display name
 * @returns {Promise<Object>} Created workflow instance
 */
export async function startWorkflow(options) {
  return withErrorHandling(async () => {
    // Get the template
    const template = await getWorkflowTemplate(options.templateId)
    if (!template) {
      throw new Error('Workflow template not found')
    }

    if (template.status !== 'active') {
      throw new Error('Workflow template is not active')
    }

    // Find the first step
    const sortedSteps = [...template.steps].sort((a, b) => a.order - b.order)
    const firstStep = sortedSteps[0]

    if (!firstStep) {
      throw new Error('Workflow template has no steps')
    }

    // Calculate due date if step has dueDays
    let dueDate = null
    if (firstStep.dueDays) {
      dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + firstStep.dueDays)
    }

    const now = serverTimestamp()

    const docData = {
      templateId: options.templateId,
      templateName: template.name,
      organizationId: options.organizationId,
      entityType: options.entityType,
      entityId: options.entityId,
      entityTitle: options.entityTitle || '',
      currentStepId: firstStep.id,
      currentStepName: firstStep.name,
      status: 'active',
      assignedTo: null,
      assignedToName: null,
      dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
      history: [
        {
          stepId: firstStep.id,
          stepName: firstStep.name,
          action: 'started',
          by: options.startedBy,
          byName: options.startedByName,
          at: new Date().toISOString(),
          comment: null,
        },
      ],
      startedAt: now,
      startedBy: options.startedBy,
      startedByName: options.startedByName,
      completedAt: null,
      createdAt: now,
    }

    const docRef = await addDoc(workflowInstancesRef, docData)

    return {
      id: docRef.id,
      ...docData,
      createdAt: new Date(),
      startedAt: new Date(),
      dueDate,
    }
  }, 'startWorkflow')
}

/**
 * Advance a workflow instance to the next step
 * @param {string} instanceId - Instance ID
 * @param {string} action - Action taken (approve, reject, etc.)
 * @param {Object} options - Action options
 * @param {string} options.userId - User ID taking action
 * @param {string} options.userName - User display name
 * @param {string} [options.comment] - Optional comment
 * @returns {Promise<Object>} Updated workflow instance
 */
export async function advanceWorkflow(instanceId, action, options) {
  return withErrorHandling(async () => {
    const instance = await getWorkflowInstance(instanceId)
    if (!instance) {
      throw new Error('Workflow instance not found')
    }

    if (instance.status !== 'active') {
      throw new Error('Workflow is not active')
    }

    // Get the template to find next step
    const template = await getWorkflowTemplate(instance.templateId)
    if (!template) {
      throw new Error('Workflow template not found')
    }

    const sortedSteps = [...template.steps].sort((a, b) => a.order - b.order)
    const currentStepIndex = sortedSteps.findIndex(s => s.id === instance.currentStepId)
    const currentStep = sortedSteps[currentStepIndex]

    // Validate action is allowed
    if (currentStep.actions && !currentStep.actions.includes(action)) {
      throw new Error(`Action '${action}' is not allowed for this step`)
    }

    // Add history entry
    const historyEntry = {
      stepId: currentStep.id,
      stepName: currentStep.name,
      action,
      by: options.userId,
      byName: options.userName,
      at: new Date().toISOString(),
      comment: options.comment || null,
    }

    // Determine next state
    let nextStepId = null
    let nextStepName = null
    let newStatus = 'active'
    let completedAt = null
    let dueDate = null

    if (action === 'reject') {
      // Workflow rejected - go back to first step or mark complete
      newStatus = 'active'
      const firstStep = sortedSteps[0]
      nextStepId = firstStep.id
      nextStepName = firstStep.name
    } else if (action === 'request_changes') {
      // Stay on current step, reassign to original submitter
      nextStepId = currentStep.id
      nextStepName = currentStep.name
    } else if (action === 'approve' || action === 'complete') {
      // Move to next step
      const nextStep = sortedSteps[currentStepIndex + 1]

      if (!nextStep || currentStep.final) {
        // Workflow complete
        newStatus = 'completed'
        completedAt = serverTimestamp()
        nextStepId = currentStep.id
        nextStepName = currentStep.name
      } else {
        nextStepId = nextStep.id
        nextStepName = nextStep.name

        // Calculate due date for next step
        if (nextStep.dueDays) {
          dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + nextStep.dueDays)
        }
      }
    }

    // Update the instance
    const updates = {
      currentStepId: nextStepId,
      currentStepName: nextStepName,
      status: newStatus,
      dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
      history: arrayUnion(historyEntry),
      updatedAt: serverTimestamp(),
    }

    if (completedAt) {
      updates.completedAt = completedAt
    }

    const docRef = doc(workflowInstancesRef, instanceId)
    await updateDoc(docRef, updates)

    return {
      ...instance,
      ...updates,
      completedAt: completedAt ? new Date() : null,
      dueDate,
    }
  }, 'advanceWorkflow')
}

/**
 * Assign a workflow step to a user
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID to assign
 * @param {string} userName - User display name
 * @param {string} assignedBy - User ID assigning
 * @param {string} assignedByName - Assigner display name
 * @returns {Promise<void>}
 */
export async function assignWorkflow(instanceId, userId, userName, assignedBy, assignedByName) {
  return withErrorHandling(async () => {
    const historyEntry = {
      stepId: null, // Will be filled from current step
      stepName: null,
      action: 'assigned',
      by: assignedBy,
      byName: assignedByName,
      at: new Date().toISOString(),
      comment: `Assigned to ${userName}`,
    }

    const instance = await getWorkflowInstance(instanceId)
    historyEntry.stepId = instance.currentStepId
    historyEntry.stepName = instance.currentStepName

    const docRef = doc(workflowInstancesRef, instanceId)
    await updateDoc(docRef, {
      assignedTo: userId,
      assignedToName: userName,
      history: arrayUnion(historyEntry),
      updatedAt: serverTimestamp(),
    })
  }, 'assignWorkflow')
}

/**
 * Cancel a workflow instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID cancelling
 * @param {string} userName - User display name
 * @param {string} [reason] - Cancellation reason
 * @returns {Promise<void>}
 */
export async function cancelWorkflow(instanceId, userId, userName, reason = null) {
  return withErrorHandling(async () => {
    const instance = await getWorkflowInstance(instanceId)

    const historyEntry = {
      stepId: instance.currentStepId,
      stepName: instance.currentStepName,
      action: 'cancelled',
      by: userId,
      byName: userName,
      at: new Date().toISOString(),
      comment: reason,
    }

    const docRef = doc(workflowInstancesRef, instanceId)
    await updateDoc(docRef, {
      status: 'cancelled',
      history: arrayUnion(historyEntry),
      updatedAt: serverTimestamp(),
    })
  }, 'cancelWorkflow')
}

/**
 * Get workflow tasks assigned to a user
 * @param {string} organizationId - Organization ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>}
 */
export async function getMyWorkflowTasks(organizationId, userId) {
  return withErrorHandling(async () => {
    const q = query(
      workflowInstancesRef,
      where('organizationId', '==', organizationId),
      where('assignedTo', '==', userId),
      where('status', '==', 'active'),
      orderBy('dueDate', 'asc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      startedAt: doc.data().startedAt?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
    }))
  }, 'getMyWorkflowTasks')
}

/**
 * Get pending workflow tasks (unassigned or need action)
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>}
 */
export async function getPendingWorkflowTasks(organizationId) {
  return withErrorHandling(async () => {
    const active = await getActiveWorkflowInstances(organizationId)

    // Get template info for each to determine required actions
    const tasks = []
    for (const instance of active) {
      const template = await getWorkflowTemplate(instance.templateId)
      if (template) {
        const currentStep = template.steps.find(s => s.id === instance.currentStepId)
        if (currentStep && currentStep.actions && currentStep.actions.length > 0) {
          tasks.push({
            ...instance,
            currentStep,
            availableActions: currentStep.actions,
          })
        }
      }
    }

    return tasks
  }, 'getPendingWorkflowTasks')
}

/**
 * Get workflow instance counts by status
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>}
 */
export async function getWorkflowCounts(organizationId) {
  return withErrorHandling(async () => {
    const instances = await getWorkflowInstances(organizationId)

    const counts = {
      total: instances.length,
      active: 0,
      completed: 0,
      cancelled: 0,
    }

    for (const instance of instances) {
      if (counts[instance.status] !== undefined) {
        counts[instance.status]++
      }
    }

    return counts
  }, 'getWorkflowCounts')
}

/**
 * Get workflows for a specific entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @returns {Promise<Array>}
 */
export async function getWorkflowsForEntity(entityType, entityId) {
  return withErrorHandling(async () => {
    const q = query(
      workflowInstancesRef,
      where('entityType', '==', entityType),
      where('entityId', '==', entityId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      startedAt: doc.data().startedAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
    }))
  }, 'getWorkflowsForEntity')
}
