/**
 * firestoreInspections.js
 * Firestore operations for workplace inspections management
 * Supports COR Element 5: Inspections
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
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { logger } from './logger'

// Collection references
const inspectionTemplatesRef = collection(db, 'inspectionTemplates')
const inspectionsRef = collection(db, 'inspections')
const inspectionFindingsRef = collection(db, 'inspectionFindings')

// Error handling wrapper
const withErrorHandling = async (operation, errorMessage) => {
  try {
    return await operation()
  } catch (error) {
    logger.error(errorMessage, error)
    throw new Error(`${errorMessage}: ${error.message}`)
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const INSPECTION_TYPES = {
  workplace: { label: 'Workplace', description: 'General workplace safety inspection' },
  equipment: { label: 'Equipment', description: 'Equipment and machinery inspection' },
  ppe: { label: 'PPE', description: 'Personal protective equipment inspection' },
  emergency: { label: 'Emergency', description: 'Emergency equipment and procedures' },
  vehicle: { label: 'Vehicle', description: 'Vehicle pre-use inspection' },
  aircraft: { label: 'Aircraft', description: 'UAV/Drone pre-flight inspection' },
  specialized: { label: 'Specialized', description: 'Specialized operation inspection' },
  custom: { label: 'Custom', description: 'User-defined inspection type' }
}

// Formal vs Informal inspection classification
export const INSPECTION_FORMALITY = {
  formal: {
    label: 'Formal',
    description: 'Planned inspection with documented checklist and findings',
    requiresTemplate: true,
    requiresSignature: true
  },
  informal: {
    label: 'Informal',
    description: 'Quick spot-check or walk-through observation',
    requiresTemplate: false,
    requiresSignature: false
  }
}

export const INSPECTION_FREQUENCY = {
  daily: { label: 'Daily', days: 1 },
  weekly: { label: 'Weekly', days: 7 },
  biweekly: { label: 'Bi-weekly', days: 14 },
  monthly: { label: 'Monthly', days: 30 },
  quarterly: { label: 'Quarterly', days: 90 },
  semi_annual: { label: 'Semi-Annual', days: 180 },
  annual: { label: 'Annual', days: 365 },
  as_needed: { label: 'As Needed', days: 0 }
}

export const INSPECTION_STATUS = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
}

export const FINDING_STATUS = {
  open: { label: 'Open', color: 'bg-red-100 text-red-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  corrected: { label: 'Corrected', color: 'bg-blue-100 text-blue-800' },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-800' }
}

export const RISK_LEVELS = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800', priority: 1 },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', priority: 2 },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800', priority: 3 },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800', priority: 4 }
}

export const ITEM_STATUS = {
  satisfactory: { label: 'Satisfactory', color: 'text-green-600' },
  unsatisfactory: { label: 'Unsatisfactory', color: 'text-red-600' },
  na: { label: 'N/A', color: 'text-gray-500' },
  pending: { label: 'Pending', color: 'text-yellow-600' }
}

// COR requirements for inspections
export const COR_INSPECTION_REQUIREMENTS = {
  // Inspections must be documented and findings addressed
  maxDaysToCorrectCritical: 1,
  maxDaysToCorrectHigh: 7,
  maxDaysToCorrectMedium: 30,
  maxDaysToCorrectLow: 90,
  // Minimum inspection frequencies
  workplaceMinFrequency: 'monthly',
  equipmentMinFrequency: 'daily'
}

// ============================================================================
// INSPECTION TEMPLATES (CHECKLISTS)
// ============================================================================

/**
 * Get all inspection templates for an organization
 */
export const getInspectionTemplates = async (organizationId) => {
  return withErrorHandling(async () => {
    const q = query(
      inspectionTemplatesRef,
      where('organizationId', '==', organizationId)
    )
    const snapshot = await getDocs(q)
    const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    // Sort client-side to avoid needing composite index
    templates.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return templates
  }, 'Failed to fetch inspection templates')
}

/**
 * Get active templates by type
 */
export const getActiveTemplatesByType = async (organizationId, type) => {
  return withErrorHandling(async () => {
    const q = query(
      inspectionTemplatesRef,
      where('organizationId', '==', organizationId),
      where('type', '==', type),
      where('isActive', '==', true)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, 'Failed to fetch templates by type')
}

/**
 * Get a single inspection template
 */
export const getInspectionTemplate = async (templateId) => {
  return withErrorHandling(async () => {
    const docSnap = await getDoc(doc(inspectionTemplatesRef, templateId))
    if (!docSnap.exists()) throw new Error('Template not found')
    return { id: docSnap.id, ...docSnap.data() }
  }, 'Failed to fetch inspection template')
}

/**
 * Create a new inspection template
 */
export const createInspectionTemplate = async (templateData) => {
  return withErrorHandling(async () => {
    const data = {
      ...templateData,
      checklistItems: templateData.checklistItems || [],
      isActive: true,
      usageCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    const docRef = await addDoc(inspectionTemplatesRef, data)
    return docRef.id
  }, 'Failed to create inspection template')
}

/**
 * Update an inspection template
 */
export const updateInspectionTemplate = async (templateId, updates) => {
  return withErrorHandling(async () => {
    await updateDoc(doc(inspectionTemplatesRef, templateId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }, 'Failed to update inspection template')
}

/**
 * Deactivate an inspection template
 */
export const deactivateInspectionTemplate = async (templateId) => {
  return withErrorHandling(async () => {
    await updateDoc(doc(inspectionTemplatesRef, templateId), {
      isActive: false,
      updatedAt: serverTimestamp()
    })
  }, 'Failed to deactivate template')
}

/**
 * Delete an inspection template (only if never used)
 */
export const deleteInspectionTemplate = async (templateId) => {
  return withErrorHandling(async () => {
    const template = await getInspectionTemplate(templateId)
    if (template.usageCount > 0) {
      throw new Error('Cannot delete template that has been used. Deactivate instead.')
    }
    await deleteDoc(doc(inspectionTemplatesRef, templateId))
  }, 'Failed to delete inspection template')
}

// ============================================================================
// INSPECTIONS
// ============================================================================

/**
 * Generate inspection number
 */
const generateInspectionNumber = async (organizationId) => {
  const year = new Date().getFullYear()
  const q = query(
    inspectionsRef,
    where('organizationId', '==', organizationId),
    where('inspectionNumber', '>=', `INS-${year}-`),
    where('inspectionNumber', '<', `INS-${year + 1}-`)
  )
  const snapshot = await getDocs(q)
  const nextNum = snapshot.size + 1
  return `INS-${year}-${String(nextNum).padStart(4, '0')}`
}

/**
 * Get all inspections for an organization
 */
export const getInspections = async (organizationId, filters = {}) => {
  return withErrorHandling(async () => {
    const q = query(
      inspectionsRef,
      where('organizationId', '==', organizationId)
    )

    const snapshot = await getDocs(q)
    let inspections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Sort client-side to avoid needing composite index
    inspections.sort((a, b) => {
      const dateA = a.scheduledDate?.toDate?.() || new Date(a.scheduledDate || 0)
      const dateB = b.scheduledDate?.toDate?.() || new Date(b.scheduledDate || 0)
      return dateB - dateA
    })

    // Apply client-side filters
    if (filters.status) {
      inspections = inspections.filter(i => i.status === filters.status)
    }
    if (filters.type) {
      inspections = inspections.filter(i => i.inspectionType === filters.type)
    }
    if (filters.templateId) {
      inspections = inspections.filter(i => i.templateId === filters.templateId)
    }

    // Calculate dynamic status (overdue check)
    const now = new Date()
    inspections = inspections.map(inspection => {
      let calculatedStatus = inspection.status
      if (inspection.status === 'scheduled') {
        const scheduledDate = inspection.scheduledDate?.toDate?.() || new Date(inspection.scheduledDate)
        if (scheduledDate < now) {
          calculatedStatus = 'overdue'
        }
      }
      return { ...inspection, calculatedStatus }
    })

    return inspections
  }, 'Failed to fetch inspections')
}

/**
 * Get upcoming inspections
 */
export const getUpcomingInspections = async (organizationId, days = 7) => {
  return withErrorHandling(async () => {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    const q = query(
      inspectionsRef,
      where('organizationId', '==', organizationId),
      where('status', '==', 'scheduled')
    )

    const snapshot = await getDocs(q)
    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(i => {
        const date = i.scheduledDate?.toDate?.() || new Date(i.scheduledDate)
        return date >= now && date <= futureDate
      })
    // Sort client-side
    results.sort((a, b) => {
      const dateA = a.scheduledDate?.toDate?.() || new Date(a.scheduledDate || 0)
      const dateB = b.scheduledDate?.toDate?.() || new Date(b.scheduledDate || 0)
      return dateA - dateB
    })
    return results
  }, 'Failed to fetch upcoming inspections')
}

/**
 * Get overdue inspections
 */
export const getOverdueInspections = async (organizationId) => {
  return withErrorHandling(async () => {
    const now = new Date()

    const q = query(
      inspectionsRef,
      where('organizationId', '==', organizationId),
      where('status', '==', 'scheduled')
    )

    const snapshot = await getDocs(q)
    const results = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(i => {
        const date = i.scheduledDate?.toDate?.() || new Date(i.scheduledDate)
        return date < now
      })
    // Sort client-side
    results.sort((a, b) => {
      const dateA = a.scheduledDate?.toDate?.() || new Date(a.scheduledDate || 0)
      const dateB = b.scheduledDate?.toDate?.() || new Date(b.scheduledDate || 0)
      return dateA - dateB
    })
    return results
  }, 'Failed to fetch overdue inspections')
}

/**
 * Get a single inspection
 */
export const getInspection = async (inspectionId) => {
  return withErrorHandling(async () => {
    const docSnap = await getDoc(doc(inspectionsRef, inspectionId))
    if (!docSnap.exists()) throw new Error('Inspection not found')
    return { id: docSnap.id, ...docSnap.data() }
  }, 'Failed to fetch inspection')
}

/**
 * Schedule a new inspection
 */
export const scheduleInspection = async (inspectionData) => {
  return withErrorHandling(async () => {
    const inspectionNumber = await generateInspectionNumber(inspectionData.organizationId)

    // Get template details if templateId provided
    let templateDetails = {}
    if (inspectionData.templateId) {
      const template = await getInspectionTemplate(inspectionData.templateId)
      templateDetails = {
        templateName: template.name,
        inspectionType: template.type,
        checklistItems: template.checklistItems.map(item => ({
          ...item,
          status: 'pending',
          notes: ''
        }))
      }
      // Increment template usage count
      await updateDoc(doc(inspectionTemplatesRef, inspectionData.templateId), {
        usageCount: (template.usageCount || 0) + 1
      })
    }

    const data = {
      ...inspectionData,
      ...templateDetails,
      inspectionNumber,
      status: 'scheduled',
      findings: [],
      totalItems: templateDetails.checklistItems?.length || 0,
      satisfactoryItems: 0,
      unsatisfactoryItems: 0,
      overallResult: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(inspectionsRef, data)
    return { id: docRef.id, inspectionNumber }
  }, 'Failed to schedule inspection')
}

/**
 * Start an inspection
 */
export const startInspection = async (inspectionId, inspectorData) => {
  return withErrorHandling(async () => {
    await updateDoc(doc(inspectionsRef, inspectionId), {
      status: 'in_progress',
      startedAt: serverTimestamp(),
      inspectorId: inspectorData.inspectorId,
      inspectorName: inspectorData.inspectorName,
      updatedAt: serverTimestamp()
    })
  }, 'Failed to start inspection')
}

/**
 * Update checklist item status
 */
export const updateChecklistItem = async (inspectionId, itemId, itemData) => {
  return withErrorHandling(async () => {
    const inspection = await getInspection(inspectionId)
    const checklistItems = inspection.checklistItems.map(item => {
      if (item.id === itemId) {
        return { ...item, ...itemData }
      }
      return item
    })

    // Recalculate counts
    const satisfactoryItems = checklistItems.filter(i => i.status === 'satisfactory').length
    const unsatisfactoryItems = checklistItems.filter(i => i.status === 'unsatisfactory').length

    await updateDoc(doc(inspectionsRef, inspectionId), {
      checklistItems,
      satisfactoryItems,
      unsatisfactoryItems,
      updatedAt: serverTimestamp()
    })
  }, 'Failed to update checklist item')
}

/**
 * Complete an inspection
 */
export const completeInspection = async (inspectionId, completionData) => {
  return withErrorHandling(async () => {
    const inspection = await getInspection(inspectionId)

    // Calculate overall result
    const unsatisfactoryCount = inspection.checklistItems?.filter(i => i.status === 'unsatisfactory').length || 0
    const criticalUnsatisfactory = inspection.checklistItems?.filter(
      i => i.status === 'unsatisfactory' && i.isCritical
    ).length || 0

    let overallResult = 'pass'
    if (criticalUnsatisfactory > 0) {
      overallResult = 'fail'
    } else if (unsatisfactoryCount > 0) {
      overallResult = 'conditional'
    }

    await updateDoc(doc(inspectionsRef, inspectionId), {
      status: 'completed',
      completedDate: serverTimestamp(),
      overallResult,
      completionNotes: completionData.notes || '',
      updatedAt: serverTimestamp()
    })

    return { overallResult, unsatisfactoryCount }
  }, 'Failed to complete inspection')
}

/**
 * Cancel an inspection
 */
export const cancelInspection = async (inspectionId, reason) => {
  return withErrorHandling(async () => {
    await updateDoc(doc(inspectionsRef, inspectionId), {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }, 'Failed to cancel inspection')
}

/**
 * Update inspection details
 */
export const updateInspection = async (inspectionId, updates) => {
  return withErrorHandling(async () => {
    await updateDoc(doc(inspectionsRef, inspectionId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }, 'Failed to update inspection')
}

// ============================================================================
// INSPECTION FINDINGS
// ============================================================================

/**
 * Generate finding number
 */
const generateFindingNumber = async (organizationId, inspectionNumber) => {
  const q = query(
    inspectionFindingsRef,
    where('organizationId', '==', organizationId),
    where('inspectionNumber', '==', inspectionNumber)
  )
  const snapshot = await getDocs(q)
  const nextNum = snapshot.size + 1
  return `${inspectionNumber}-F${String(nextNum).padStart(2, '0')}`
}

/**
 * Get all findings for an organization
 */
export const getFindings = async (organizationId, filters = {}) => {
  return withErrorHandling(async () => {
    const q = query(
      inspectionFindingsRef,
      where('organizationId', '==', organizationId)
    )

    const snapshot = await getDocs(q)
    let findings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Sort client-side to avoid needing composite index
    findings.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
      return dateB - dateA
    })

    // Apply client-side filters
    if (filters.status) {
      findings = findings.filter(f => f.status === filters.status)
    }
    if (filters.riskLevel) {
      findings = findings.filter(f => f.riskLevel === filters.riskLevel)
    }
    if (filters.inspectionId) {
      findings = findings.filter(f => f.inspectionId === filters.inspectionId)
    }

    // Calculate if overdue
    const now = new Date()
    findings = findings.map(finding => {
      let isOverdue = false
      if (finding.status !== 'verified' && finding.status !== 'corrected' && finding.dueDate) {
        const dueDate = finding.dueDate?.toDate?.() || new Date(finding.dueDate)
        isOverdue = dueDate < now
      }
      return { ...finding, isOverdue }
    })

    return findings
  }, 'Failed to fetch findings')
}

/**
 * Get open findings
 */
export const getOpenFindings = async (organizationId) => {
  return withErrorHandling(async () => {
    const q = query(
      inspectionFindingsRef,
      where('organizationId', '==', organizationId),
      where('status', 'in', ['open', 'in_progress'])
    )
    const snapshot = await getDocs(q)
    const findings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    // Sort client-side to avoid needing composite index
    findings.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
      return dateB - dateA
    })
    return findings
  }, 'Failed to fetch open findings')
}

/**
 * Get findings by inspection
 */
export const getFindingsByInspection = async (inspectionId) => {
  return withErrorHandling(async () => {
    const q = query(
      inspectionFindingsRef,
      where('inspectionId', '==', inspectionId)
    )
    const snapshot = await getDocs(q)
    const findings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    // Sort client-side
    findings.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
      return dateA - dateB
    })
    return findings
  }, 'Failed to fetch findings for inspection')
}

/**
 * Get a single finding
 */
export const getFinding = async (findingId) => {
  return withErrorHandling(async () => {
    const docSnap = await getDoc(doc(inspectionFindingsRef, findingId))
    if (!docSnap.exists()) throw new Error('Finding not found')
    return { id: docSnap.id, ...docSnap.data() }
  }, 'Failed to fetch finding')
}

/**
 * Create a new finding from inspection
 */
export const createFinding = async (findingData) => {
  return withErrorHandling(async () => {
    const inspection = await getInspection(findingData.inspectionId)
    const findingNumber = await generateFindingNumber(findingData.organizationId, inspection.inspectionNumber)

    // Calculate due date based on risk level
    const daysToCorrect = {
      critical: COR_INSPECTION_REQUIREMENTS.maxDaysToCorrectCritical,
      high: COR_INSPECTION_REQUIREMENTS.maxDaysToCorrectHigh,
      medium: COR_INSPECTION_REQUIREMENTS.maxDaysToCorrectMedium,
      low: COR_INSPECTION_REQUIREMENTS.maxDaysToCorrectLow
    }
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (daysToCorrect[findingData.riskLevel] || 30))

    const data = {
      ...findingData,
      findingNumber,
      inspectionNumber: inspection.inspectionNumber,
      status: 'open',
      dueDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(inspectionFindingsRef, data)
    return { id: docRef.id, findingNumber }
  }, 'Failed to create finding')
}

/**
 * Update finding status
 */
export const updateFindingStatus = async (findingId, status, additionalData = {}) => {
  return withErrorHandling(async () => {
    const updates = {
      status,
      updatedAt: serverTimestamp(),
      ...additionalData
    }

    if (status === 'corrected') {
      updates.correctedDate = serverTimestamp()
    }
    if (status === 'verified') {
      updates.verifiedDate = serverTimestamp()
    }

    await updateDoc(doc(inspectionFindingsRef, findingId), updates)
  }, 'Failed to update finding status')
}

/**
 * Update a finding
 */
export const updateFinding = async (findingId, updates) => {
  return withErrorHandling(async () => {
    await updateDoc(doc(inspectionFindingsRef, findingId), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }, 'Failed to update finding')
}

/**
 * Link finding to CAPA
 */
export const linkFindingToCapa = async (findingId, capaId) => {
  return withErrorHandling(async () => {
    await updateDoc(doc(inspectionFindingsRef, findingId), {
      linkedCapaId: capaId,
      updatedAt: serverTimestamp()
    })
  }, 'Failed to link finding to CAPA')
}

// ============================================================================
// RECURRING INSPECTIONS
// ============================================================================

/**
 * Schedule next recurring inspection based on template frequency
 */
export const scheduleNextRecurringInspection = async (organizationId, templateId, baseDate = new Date()) => {
  return withErrorHandling(async () => {
    const template = await getInspectionTemplate(templateId)
    if (!template.isActive) {
      throw new Error('Cannot schedule from inactive template')
    }

    const frequency = INSPECTION_FREQUENCY[template.frequency]
    if (!frequency || frequency.days === 0) {
      return null // as_needed doesn't auto-schedule
    }

    const scheduledDate = new Date(baseDate)
    scheduledDate.setDate(scheduledDate.getDate() + frequency.days)

    return scheduleInspection({
      organizationId,
      templateId,
      scheduledDate,
      isRecurring: true,
      location: template.defaultLocation || ''
    })
  }, 'Failed to schedule recurring inspection')
}

/**
 * Get inspection schedule compliance
 */
export const getInspectionScheduleCompliance = async (organizationId, templateId, lookbackDays = 90) => {
  return withErrorHandling(async () => {
    const template = await getInspectionTemplate(templateId)
    const frequency = INSPECTION_FREQUENCY[template.frequency]

    if (!frequency || frequency.days === 0) {
      return { compliant: true, message: 'No schedule requirement' }
    }

    const lookbackDate = new Date()
    lookbackDate.setDate(lookbackDate.getDate() - lookbackDays)

    const q = query(
      inspectionsRef,
      where('organizationId', '==', organizationId),
      where('templateId', '==', templateId),
      where('status', '==', 'completed')
    )

    const snapshot = await getDocs(q)
    const completedInspections = snapshot.docs
      .map(doc => doc.data())
      .filter(i => {
        const date = i.completedDate?.toDate?.() || new Date(i.completedDate)
        return date >= lookbackDate
      })
    // Sort client-side
    completedInspections.sort((a, b) => {
      const dateA = a.completedDate?.toDate?.() || new Date(a.completedDate || 0)
      const dateB = b.completedDate?.toDate?.() || new Date(b.completedDate || 0)
      return dateB - dateA
    })

    // Calculate expected number of inspections
    const expectedCount = Math.floor(lookbackDays / frequency.days)
    const actualCount = completedInspections.length
    const complianceRate = expectedCount > 0 ? (actualCount / expectedCount) * 100 : 100

    return {
      compliant: complianceRate >= 80,
      complianceRate: Math.min(100, complianceRate),
      expectedCount,
      actualCount,
      frequency: template.frequency
    }
  }, 'Failed to calculate schedule compliance')
}

// ============================================================================
// COR METRICS & REPORTING
// ============================================================================

/**
 * Calculate COR Element 5 (Inspections) readiness score
 */
export const calculateCORInspectionMetrics = async (organizationId) => {
  return withErrorHandling(async () => {
    const [templates, inspections, findings] = await Promise.all([
      getInspectionTemplates(organizationId),
      getInspections(organizationId),
      getFindings(organizationId)
    ])

    // COR Criteria:
    // 1. Documented inspection program (templates exist)
    // 2. Inspections conducted on schedule
    // 3. Findings documented and tracked
    // 4. Corrective actions implemented timely

    const activeTemplates = templates.filter(t => t.isActive)
    const completedInspections = inspections.filter(i => i.status === 'completed')
    const last90Days = new Date()
    last90Days.setDate(last90Days.getDate() - 90)

    const recentInspections = completedInspections.filter(i => {
      const date = i.completedDate?.toDate?.() || new Date(i.completedDate)
      return date >= last90Days
    })

    const openFindings = findings.filter(f => f.status === 'open' || f.status === 'in_progress')
    const overdueFindings = findings.filter(f => {
      if (f.status === 'verified' || f.status === 'corrected') return false
      const dueDate = f.dueDate?.toDate?.() || new Date(f.dueDate)
      return dueDate < new Date()
    })
    const verifiedFindings = findings.filter(f => f.status === 'verified')

    // Scoring components (each max 25 points)
    const scores = {
      // 1. Program Documentation (have active templates)
      documentation: activeTemplates.length >= 3 ? 25 : (activeTemplates.length / 3) * 25,

      // 2. Inspection Frequency (conducting inspections regularly)
      frequency: recentInspections.length >= 12 ? 25 : (recentInspections.length / 12) * 25,

      // 3. Finding Documentation (all unsatisfactory items tracked)
      findingTracking: completedInspections.length > 0 ?
        Math.min(25, 25 * (1 - overdueFindings.length / Math.max(1, openFindings.length + verifiedFindings.length))) : 0,

      // 4. Corrective Action Completion
      correctiveActions: openFindings.length + verifiedFindings.length > 0 ?
        (verifiedFindings.length / (openFindings.length + verifiedFindings.length)) * 25 : 25
    }

    const totalScore = Math.round(
      scores.documentation + scores.frequency + scores.findingTracking + scores.correctiveActions
    )

    return {
      totalScore,
      scores,
      metrics: {
        activeTemplates: activeTemplates.length,
        totalInspections: completedInspections.length,
        recentInspections: recentInspections.length,
        openFindings: openFindings.length,
        overdueFindings: overdueFindings.length,
        verifiedFindings: verifiedFindings.length
      },
      recommendations: generateInspectionRecommendations(scores, {
        activeTemplates: activeTemplates.length,
        recentInspections: recentInspections.length,
        overdueFindings: overdueFindings.length
      })
    }
  }, 'Failed to calculate COR inspection metrics')
}

/**
 * Generate recommendations based on scores
 */
const generateInspectionRecommendations = (scores, metrics) => {
  const recommendations = []

  if (scores.documentation < 20) {
    recommendations.push({
      priority: 'high',
      area: 'Documentation',
      message: 'Create more inspection checklists to cover all workplace hazards'
    })
  }

  if (scores.frequency < 20) {
    recommendations.push({
      priority: 'high',
      area: 'Frequency',
      message: 'Increase inspection frequency to meet COR requirements'
    })
  }

  if (metrics.overdueFindings > 0) {
    recommendations.push({
      priority: 'critical',
      area: 'Corrective Actions',
      message: `${metrics.overdueFindings} finding(s) overdue - address immediately`
    })
  }

  if (scores.correctiveActions < 20) {
    recommendations.push({
      priority: 'medium',
      area: 'Follow-up',
      message: 'Improve verification of corrective actions'
    })
  }

  return recommendations
}

/**
 * Get inspection summary for dashboard
 */
export const getInspectionSummary = async (organizationId) => {
  return withErrorHandling(async () => {
    const [inspections, findings] = await Promise.all([
      getInspections(organizationId),
      getFindings(organizationId)
    ])

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    return {
      scheduled: inspections.filter(i => i.status === 'scheduled').length,
      overdue: inspections.filter(i => i.calculatedStatus === 'overdue').length,
      completedThisMonth: inspections.filter(i => {
        if (i.status !== 'completed') return false
        const date = i.completedDate?.toDate?.() || new Date(i.completedDate)
        return date >= thisMonth
      }).length,
      completedLastMonth: inspections.filter(i => {
        if (i.status !== 'completed') return false
        const date = i.completedDate?.toDate?.() || new Date(i.completedDate)
        return date >= lastMonth && date < thisMonth
      }).length,
      openFindings: findings.filter(f => f.status === 'open' || f.status === 'in_progress').length,
      overdueFindings: findings.filter(f => {
        if (f.status === 'verified' || f.status === 'corrected') return false
        const dueDate = f.dueDate?.toDate?.() || new Date(f.dueDate)
        return dueDate < now
      }).length,
      passRate: inspections.filter(i => i.status === 'completed').length > 0 ?
        Math.round(
          (inspections.filter(i => i.overallResult === 'pass').length /
          inspections.filter(i => i.status === 'completed').length) * 100
        ) : 0
    }
  }, 'Failed to get inspection summary')
}

// ============================================================================
// DEFAULT TEMPLATES
// ============================================================================

/**
 * Create default inspection templates for a new organization
 */
export const createDefaultTemplates = async (organizationId) => {
  return withErrorHandling(async () => {
    const batch = writeBatch(db)
    const now = serverTimestamp()

    const defaultTemplates = [
      {
        name: 'Daily Workplace Safety Inspection',
        type: 'workplace',
        frequency: 'daily',
        description: 'Daily walk-through safety inspection',
        checklistItems: [
          { id: 'wp-1', section: 'General', item: 'Work areas clean and organized', expectedCondition: 'No obstructions or hazards', isCritical: false },
          { id: 'wp-2', section: 'General', item: 'Emergency exits clear and accessible', expectedCondition: 'Unobstructed', isCritical: true },
          { id: 'wp-3', section: 'General', item: 'Fire extinguishers accessible', expectedCondition: 'Visible and accessible', isCritical: true },
          { id: 'wp-4', section: 'Electrical', item: 'Cords in good condition', expectedCondition: 'No damage or fraying', isCritical: false },
          { id: 'wp-5', section: 'Electrical', item: 'No overloaded outlets', expectedCondition: 'Proper load distribution', isCritical: false },
          { id: 'wp-6', section: 'Storage', item: 'Materials stored safely', expectedCondition: 'Stable and secure', isCritical: false },
          { id: 'wp-7', section: 'PPE', item: 'Required PPE available', expectedCondition: 'Accessible and in good condition', isCritical: true }
        ]
      },
      {
        name: 'UAV Pre-Flight Inspection',
        type: 'aircraft',
        frequency: 'daily',
        description: 'Pre-flight inspection checklist for UAV operations',
        checklistItems: [
          { id: 'uav-1', section: 'Airframe', item: 'Frame structure integrity', expectedCondition: 'No cracks or damage', isCritical: true },
          { id: 'uav-2', section: 'Airframe', item: 'Propellers secure and undamaged', expectedCondition: 'Tight and no chips/cracks', isCritical: true },
          { id: 'uav-3', section: 'Airframe', item: 'Landing gear condition', expectedCondition: 'Secure and functional', isCritical: false },
          { id: 'uav-4', section: 'Power', item: 'Battery charge level', expectedCondition: 'Above minimum for flight', isCritical: true },
          { id: 'uav-5', section: 'Power', item: 'Battery physical condition', expectedCondition: 'No swelling or damage', isCritical: true },
          { id: 'uav-6', section: 'Systems', item: 'GPS signal', expectedCondition: 'Strong lock', isCritical: true },
          { id: 'uav-7', section: 'Systems', item: 'Control link quality', expectedCondition: 'Within acceptable range', isCritical: true },
          { id: 'uav-8', section: 'Systems', item: 'Firmware up to date', expectedCondition: 'Current version', isCritical: false },
          { id: 'uav-9', section: 'Payload', item: 'Payload secured', expectedCondition: 'Properly attached', isCritical: true },
          { id: 'uav-10', section: 'Payload', item: 'Gimbal function', expectedCondition: 'Full range of motion', isCritical: false }
        ]
      },
      {
        name: 'Monthly Equipment Inspection',
        type: 'equipment',
        frequency: 'monthly',
        description: 'Monthly inspection of safety and work equipment',
        checklistItems: [
          { id: 'eq-1', section: 'Fire Safety', item: 'Fire extinguisher pressure', expectedCondition: 'In green zone', isCritical: true },
          { id: 'eq-2', section: 'Fire Safety', item: 'Fire extinguisher inspection tags', expectedCondition: 'Current', isCritical: false },
          { id: 'eq-3', section: 'First Aid', item: 'First aid kit stocked', expectedCondition: 'Complete supplies', isCritical: true },
          { id: 'eq-4', section: 'First Aid', item: 'AED functional', expectedCondition: 'Passed self-test', isCritical: true },
          { id: 'eq-5', section: 'Emergency', item: 'Emergency lighting functional', expectedCondition: 'All lights working', isCritical: true },
          { id: 'eq-6', section: 'Emergency', item: 'Eyewash stations functional', expectedCondition: 'Clean and flowing', isCritical: true }
        ]
      },
      {
        name: 'PPE Inspection',
        type: 'ppe',
        frequency: 'weekly',
        description: 'Personal protective equipment condition inspection',
        checklistItems: [
          { id: 'ppe-1', section: 'Head', item: 'Hard hats condition', expectedCondition: 'No cracks or damage', isCritical: true },
          { id: 'ppe-2', section: 'Eye', item: 'Safety glasses available', expectedCondition: 'Clean and undamaged', isCritical: false },
          { id: 'ppe-3', section: 'Hearing', item: 'Hearing protection available', expectedCondition: 'Adequate supply', isCritical: false },
          { id: 'ppe-4', section: 'Hand', item: 'Gloves appropriate and available', expectedCondition: 'Correct type and good condition', isCritical: false },
          { id: 'ppe-5', section: 'Foot', item: 'Safety footwear worn', expectedCondition: 'Steel toe intact', isCritical: false },
          { id: 'ppe-6', section: 'Visibility', item: 'High-vis vests available', expectedCondition: 'Clean and visible', isCritical: false }
        ]
      }
    ]

    for (const template of defaultTemplates) {
      const docRef = doc(inspectionTemplatesRef)
      batch.set(docRef, {
        ...template,
        organizationId,
        isActive: true,
        usageCount: 0,
        createdAt: now,
        updatedAt: now
      })
    }

    await batch.commit()
    return defaultTemplates.length
  }, 'Failed to create default templates')
}
