/**
 * Insurance Management Data Operations
 * Store and track insurance policies, documents, and expiry warnings
 *
 * @location src/lib/firestoreInsurance.js
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
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { uploadInsuranceDocument, deleteInsuranceDocument } from './storageHelpers'

// ============================================
// COLLECTION REFERENCES
// ============================================

const insuranceRef = collection(db, 'insurancePolicies')

// ============================================
// CONSTANTS & ENUMS
// ============================================

export const INSURANCE_TYPES = {
  liability: {
    label: 'General Liability',
    description: 'Third-party bodily injury and property damage',
    icon: 'Shield'
  },
  aviation: {
    label: 'Aviation/Drone Liability',
    description: 'RPAS-specific liability coverage',
    icon: 'Plane'
  },
  hull: {
    label: 'Hull/Equipment',
    description: 'Physical damage to aircraft and equipment',
    icon: 'Package'
  },
  professional: {
    label: 'Professional Liability',
    description: 'Errors and omissions coverage',
    icon: 'Briefcase'
  },
  workers_comp: {
    label: 'Workers Compensation',
    description: 'Employee injury coverage',
    icon: 'Users'
  },
  vehicle: {
    label: 'Vehicle Insurance',
    description: 'Company vehicle coverage',
    icon: 'Car'
  },
  cyber: {
    label: 'Cyber Liability',
    description: 'Data breach and cyber incident coverage',
    icon: 'Lock'
  },
  other: {
    label: 'Other',
    description: 'Other insurance types',
    icon: 'FileText'
  }
}

export const INSURANCE_STATUS = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800' },
  pending: { label: 'Pending Renewal', color: 'bg-blue-100 text-blue-800' }
}

export const EXPIRY_WARNING_DAYS = 30 // Warn 30 days before expiry

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate insurance status based on expiry date
 */
export function calculateInsuranceStatus(policy) {
  if (!policy.expiryDate) return 'active'

  const now = new Date()
  const expiryDate = policy.expiryDate?.toDate?.() || new Date(policy.expiryDate)
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) return 'expiring_soon'
  return 'active'
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Create a new insurance policy
 */
export async function createInsurancePolicy(policyData) {
  try {
    const newPolicy = {
      ...policyData,
      status: calculateInsuranceStatus(policyData),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(insuranceRef, newPolicy)
    return { id: docRef.id, ...newPolicy }
  } catch (error) {
    console.error('Error creating insurance policy:', error)
    throw error
  }
}

/**
 * Update an insurance policy
 */
export async function updateInsurancePolicy(policyId, updates) {
  try {
    const docRef = doc(insuranceRef, policyId)

    // Recalculate status if expiry date changed
    if (updates.expiryDate) {
      updates.status = calculateInsuranceStatus(updates)
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: policyId, ...updates }
  } catch (error) {
    console.error('Error updating insurance policy:', error)
    throw error
  }
}

/**
 * Get a policy by ID
 */
export async function getInsurancePolicy(policyId) {
  try {
    const docRef = doc(insuranceRef, policyId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) return null

    const data = snapshot.data()
    return {
      id: snapshot.id,
      ...data,
      status: calculateInsuranceStatus(data)
    }
  } catch (error) {
    console.error('Error getting insurance policy:', error)
    throw error
  }
}

/**
 * Get all insurance policies for an operator
 */
export async function getInsurancePolicies(operatorId) {
  try {
    const q = query(
      insuranceRef,
      where('operatorId', '==', operatorId),
      orderBy('expiryDate', 'asc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      status: calculateInsuranceStatus(doc.data())
    }))
  } catch (error) {
    console.error('Error getting insurance policies:', error)
    throw error
  }
}

/**
 * Delete an insurance policy
 */
export async function deleteInsurancePolicy(policyId) {
  try {
    // Get policy to find documents to delete
    const policy = await getInsurancePolicy(policyId)

    // Delete associated documents from storage
    if (policy?.documents?.length > 0) {
      for (const doc of policy.documents) {
        if (doc.path) {
          try {
            await deleteInsuranceDocument(doc.path)
          } catch (e) {
            console.warn('Failed to delete document:', e)
          }
        }
      }
    }

    const docRef = doc(insuranceRef, policyId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting insurance policy:', error)
    throw error
  }
}

// ============================================
// DOCUMENT MANAGEMENT
// ============================================

/**
 * Add a document to a policy
 */
export async function addPolicyDocument(policyId, file) {
  try {
    // Upload file to storage
    const uploadResult = await uploadInsuranceDocument(file, policyId)

    // Get current policy
    const policy = await getInsurancePolicy(policyId)
    const documents = policy.documents || []

    // Add new document
    documents.push({
      ...uploadResult,
      uploadedAt: new Date().toISOString()
    })

    // Update policy
    await updateInsurancePolicy(policyId, { documents })

    return uploadResult
  } catch (error) {
    console.error('Error adding policy document:', error)
    throw error
  }
}

/**
 * Remove a document from a policy
 */
export async function removePolicyDocument(policyId, documentPath) {
  try {
    // Delete from storage
    await deleteInsuranceDocument(documentPath)

    // Get current policy
    const policy = await getInsurancePolicy(policyId)
    const documents = (policy.documents || []).filter(d => d.path !== documentPath)

    // Update policy
    await updateInsurancePolicy(policyId, { documents })
  } catch (error) {
    console.error('Error removing policy document:', error)
    throw error
  }
}

// ============================================
// METRICS & REPORTING
// ============================================

/**
 * Get insurance metrics
 */
export async function getInsuranceMetrics(operatorId) {
  try {
    const policies = await getInsurancePolicies(operatorId)

    const now = new Date()
    let active = 0
    let expiringSoon = 0
    let expired = 0
    const byType = {}

    for (const policy of policies) {
      const status = calculateInsuranceStatus(policy)

      if (status === 'active') active++
      else if (status === 'expiring_soon') expiringSoon++
      else if (status === 'expired') expired++

      // Count by type
      byType[policy.type] = (byType[policy.type] || 0) + 1
    }

    // Get policies expiring soon
    const expiringPolicies = policies
      .filter(p => calculateInsuranceStatus(p) === 'expiring_soon')
      .sort((a, b) => {
        const aDate = a.expiryDate?.toDate?.() || new Date(a.expiryDate)
        const bDate = b.expiryDate?.toDate?.() || new Date(b.expiryDate)
        return aDate - bDate
      })

    // Get expired policies
    const expiredPolicies = policies
      .filter(p => calculateInsuranceStatus(p) === 'expired')

    return {
      totalPolicies: policies.length,
      active,
      expiringSoon,
      expired,
      byType,
      expiringPolicies,
      expiredPolicies,
      complianceRate: policies.length > 0
        ? Math.round((active / policies.length) * 100)
        : 100
    }
  } catch (error) {
    console.error('Error getting insurance metrics:', error)
    throw error
  }
}

/**
 * Get insurance summary for compliance reports
 */
export async function getInsuranceSummary(operatorId) {
  try {
    const policies = await getInsurancePolicies(operatorId)

    return policies.map(policy => ({
      id: policy.id,
      type: policy.type,
      typeLabel: INSURANCE_TYPES[policy.type]?.label || policy.type,
      carrier: policy.carrier,
      policyNumber: policy.policyNumber,
      coverageAmount: policy.coverageAmount,
      effectiveDate: policy.effectiveDate,
      expiryDate: policy.expiryDate,
      status: calculateInsuranceStatus(policy),
      hasDocument: (policy.documents?.length || 0) > 0
    }))
  } catch (error) {
    console.error('Error getting insurance summary:', error)
    throw error
  }
}

export default {
  // CRUD
  createInsurancePolicy,
  updateInsurancePolicy,
  getInsurancePolicy,
  getInsurancePolicies,
  deleteInsurancePolicy,

  // Documents
  addPolicyDocument,
  removePolicyDocument,

  // Metrics
  getInsuranceMetrics,
  getInsuranceSummary,

  // Helpers
  calculateInsuranceStatus,

  // Constants
  INSURANCE_TYPES,
  INSURANCE_STATUS,
  EXPIRY_WARNING_DAYS
}
