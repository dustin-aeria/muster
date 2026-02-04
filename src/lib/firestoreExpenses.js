/**
 * firestoreExpenses.js
 * Firebase Firestore data access layer for Expense Tracking
 *
 * Collections:
 * - expenses: Individual expense records with receipt data and approval workflow
 *
 * @location src/lib/firestoreExpenses.js
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

// ============================================
// CONSTANTS
// ============================================

export const EXPENSE_STATUS = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' }
}

export const EXPENSE_CATEGORIES = {
  fuel: { label: 'Fuel', icon: 'Fuel', color: 'bg-amber-100 text-amber-700' },
  equipment: { label: 'Equipment', icon: 'Package', color: 'bg-blue-100 text-blue-700' },
  travel: { label: 'Travel', icon: 'Car', color: 'bg-green-100 text-green-700' },
  meals: { label: 'Meals', icon: 'UtensilsCrossed', color: 'bg-orange-100 text-orange-700' },
  accommodation: { label: 'Accommodation', icon: 'Hotel', color: 'bg-purple-100 text-purple-700' },
  supplies: { label: 'Supplies', icon: 'ShoppingBag', color: 'bg-cyan-100 text-cyan-700' },
  other: { label: 'Other', icon: 'MoreHorizontal', color: 'bg-gray-100 text-gray-700' }
}

export const OCR_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
  skipped: { label: 'Skipped', color: 'bg-gray-100 text-gray-700' }
}

// ============================================
// COLLECTION REFERENCES
// ============================================

const expensesRef = collection(db, 'expenses')

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format currency amount
 * @param {number} amount - The amount
 * @param {string} currency - Currency code (CAD, USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency
  }).format(amount || 0)
}

/**
 * Calculate expense totals from an array of expenses
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Totals by category and overall
 */
export function calculateExpenseTotals(expenses) {
  const totals = {
    total: 0,
    billable: 0,
    byCategory: {},
    byStatus: {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0
    },
    count: expenses.length
  }

  expenses.forEach(expense => {
    const amount = expense.amount || 0
    totals.total += amount

    if (expense.isBillable) {
      totals.billable += amount
    }

    // By category
    const category = expense.category || 'other'
    if (!totals.byCategory[category]) {
      totals.byCategory[category] = 0
    }
    totals.byCategory[category] += amount

    // By status
    const status = expense.status || 'draft'
    if (totals.byStatus[status] !== undefined) {
      totals.byStatus[status] += amount
    }
  })

  return totals
}

// ============================================
// EXPENSES CRUD
// ============================================

/**
 * Get all expenses with optional filters
 * @param {string} organizationId - Organization ID (required)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>}
 */
export async function getExpenses(organizationId, filters = {}) {
  if (!organizationId) {
    console.warn('getExpenses called without organizationId')
    return []
  }

  const constraints = [
    where('organizationId', '==', organizationId),
    orderBy('date', 'desc')
  ]

  if (filters.projectId) {
    constraints.splice(1, 0, where('projectId', '==', filters.projectId))
  }

  if (filters.status) {
    constraints.splice(1, 0, where('status', '==', filters.status))
  }

  if (filters.category) {
    constraints.splice(1, 0, where('category', '==', filters.category))
  }

  if (filters.createdBy) {
    constraints.splice(1, 0, where('createdBy', '==', filters.createdBy))
  }

  if (filters.limit) {
    constraints.push(limit(filters.limit))
  }

  const q = query(expensesRef, ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

/**
 * Get a single expense by ID
 * @param {string} id - Expense ID
 * @returns {Promise<Object>}
 */
export async function getExpenseById(id) {
  const docRef = doc(db, 'expenses', id)
  const snapshot = await getDoc(docRef)

  if (!snapshot.exists()) {
    throw new Error('Expense not found')
  }

  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Get expenses for a specific project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>}
 */
export async function getExpensesByProject(projectId) {
  const q = query(
    expensesRef,
    where('projectId', '==', projectId)
  )
  const snapshot = await getDocs(q)
  const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  // Sort client-side to avoid needing composite index
  return expenses.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

/**
 * Create a new expense
 * @param {Object} data - Expense data
 * @param {string} organizationId - Organization ID (required for security rules)
 * @returns {Promise<Object>}
 */
export async function createExpense(data, organizationId) {
  if (!organizationId) {
    throw new Error('organizationId is required to create an expense')
  }

  const expense = {
    // Organization (REQUIRED for security rules)
    organizationId,

    // Project/Site association
    projectId: data.projectId,
    projectName: data.projectName || '',
    siteId: data.siteId || null,
    siteName: data.siteName || '',

    // Core expense data
    vendor: data.vendor || '',
    amount: data.amount || 0,
    currency: data.currency || 'CAD',
    date: data.date || new Date().toISOString().split('T')[0],
    description: data.description || '',
    category: data.category || 'other',
    isBillable: data.isBillable ?? true,

    // OCR extraction data
    ocrData: {
      extractedVendor: null,
      extractedAmount: null,
      extractedDate: null,
      confidence: 0,
      rawText: null,
      processedAt: null
    },
    ocrStatus: data.receipt ? 'pending' : 'skipped',

    // Receipt photo
    receipt: data.receipt || null,

    // Approval workflow
    status: 'draft',
    submittedAt: null,
    submittedBy: null,
    approvedAt: null,
    approvedBy: null,
    approvedByName: null,
    rejectionReason: null,

    // Metadata
    createdBy: data.createdBy,
    createdByName: data.createdByName || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  const docRef = await addDoc(expensesRef, expense)
  return { id: docRef.id, ...expense }
}

/**
 * Update an existing expense
 * @param {string} id - Expense ID
 * @param {Object} data - Updated data
 */
export async function updateExpense(id, data) {
  const docRef = doc(db, 'expenses', id)
  const current = await getExpenseById(id)

  // Only allow editing draft or rejected expenses
  if (current.status !== 'draft' && current.status !== 'rejected') {
    throw new Error('Cannot edit an expense that has been submitted or approved')
  }

  // If expense was rejected, reset to draft when edited
  let updateData = { ...data }
  if (current.status === 'rejected') {
    updateData.status = 'draft'
    updateData.rejectionReason = null
  }

  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  })
}

/**
 * Delete an expense
 * @param {string} id - Expense ID
 */
export async function deleteExpense(id) {
  const docRef = doc(db, 'expenses', id)

  // Check if expense can be deleted
  const expense = await getExpenseById(id)
  if (expense.status !== 'draft' && expense.status !== 'rejected') {
    throw new Error('Cannot delete an expense that has been submitted or approved')
  }

  await deleteDoc(docRef)
}

// ============================================
// APPROVAL WORKFLOW
// ============================================

/**
 * Submit an expense for approval
 * @param {string} expenseId - Expense ID
 * @param {string} submittedBy - User ID of submitter
 */
export async function submitExpense(expenseId, submittedBy) {
  const docRef = doc(db, 'expenses', expenseId)
  const expense = await getExpenseById(expenseId)

  if (expense.status !== 'draft' && expense.status !== 'rejected') {
    throw new Error('Expense is already submitted or approved')
  }

  // Validate required fields
  if (!expense.vendor || !expense.amount || !expense.date) {
    throw new Error('Expense must have vendor, amount, and date before submission')
  }

  await updateDoc(docRef, {
    status: 'submitted',
    submittedAt: serverTimestamp(),
    submittedBy,
    rejectionReason: null,
    updatedAt: serverTimestamp()
  })
}

/**
 * Approve an expense
 * @param {string} expenseId - Expense ID
 * @param {string} approvedBy - Approver's user ID
 * @param {string} approvedByName - Approver's name
 */
export async function approveExpense(expenseId, approvedBy, approvedByName) {
  const docRef = doc(db, 'expenses', expenseId)
  const expense = await getExpenseById(expenseId)

  if (expense.status !== 'submitted') {
    throw new Error('Only submitted expenses can be approved')
  }

  await updateDoc(docRef, {
    status: 'approved',
    approvedAt: serverTimestamp(),
    approvedBy,
    approvedByName,
    rejectionReason: null,
    updatedAt: serverTimestamp()
  })
}

/**
 * Reject an expense
 * @param {string} expenseId - Expense ID
 * @param {string} rejectedBy - Rejector's user ID
 * @param {string} reason - Rejection reason
 */
export async function rejectExpense(expenseId, rejectedBy, reason) {
  const docRef = doc(db, 'expenses', expenseId)
  const expense = await getExpenseById(expenseId)

  if (expense.status !== 'submitted') {
    throw new Error('Only submitted expenses can be rejected')
  }

  await updateDoc(docRef, {
    status: 'rejected',
    rejectionReason: reason,
    updatedAt: serverTimestamp()
  })
}

/**
 * Get pending expenses for approval (for managers)
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>}
 */
export async function getPendingExpenses(organizationId) {
  if (!organizationId) {
    throw new Error('organizationId is required')
  }

  const q = query(
    expensesRef,
    where('organizationId', '==', organizationId),
    where('status', '==', 'submitted')
  )
  const snapshot = await getDocs(q)
  const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

  // Sort by submittedAt ascending (oldest first)
  return expenses.sort((a, b) => {
    const aTime = a.submittedAt?.toMillis?.() || 0
    const bTime = b.submittedAt?.toMillis?.() || 0
    return aTime - bTime
  })
}

// ============================================
// OCR DATA HANDLING
// ============================================

/**
 * Update expense with OCR extracted data
 * Called by Cloud Function after processing
 * @param {string} expenseId - Expense ID
 * @param {Object} ocrData - Extracted data from OCR
 */
export async function updateExpenseOCRData(expenseId, ocrData) {
  const docRef = doc(db, 'expenses', expenseId)

  await updateDoc(docRef, {
    ocrData: {
      extractedVendor: ocrData.vendor || null,
      extractedAmount: ocrData.amount || null,
      extractedDate: ocrData.date || null,
      confidence: ocrData.confidence || 0,
      rawText: ocrData.rawText || null,
      processedAt: serverTimestamp()
    },
    ocrStatus: 'completed',
    updatedAt: serverTimestamp()
  })
}

/**
 * Apply OCR data to expense fields (user confirms)
 * @param {string} expenseId - Expense ID
 */
export async function applyOCRData(expenseId) {
  const expense = await getExpenseById(expenseId)

  if (!expense.ocrData) {
    throw new Error('No OCR data available')
  }

  const updates = {}

  if (expense.ocrData.extractedVendor && !expense.vendor) {
    updates.vendor = expense.ocrData.extractedVendor
  }
  if (expense.ocrData.extractedAmount && !expense.amount) {
    updates.amount = expense.ocrData.extractedAmount
  }
  if (expense.ocrData.extractedDate && !expense.date) {
    updates.date = expense.ocrData.extractedDate
  }

  if (Object.keys(updates).length > 0) {
    await updateExpense(expenseId, updates)
  }
}

/**
 * Mark receipt as archived (after OCR processing complete)
 * @param {string} expenseId - Expense ID
 */
export async function archiveReceipt(expenseId) {
  const docRef = doc(db, 'expenses', expenseId)
  const expense = await getExpenseById(expenseId)

  if (!expense.receipt) {
    throw new Error('No receipt to archive')
  }

  await updateDoc(docRef, {
    'receipt.archived': true,
    updatedAt: serverTimestamp()
  })
}

// ============================================
// STATISTICS & REPORTING
// ============================================

/**
 * Get expense summary for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>}
 */
export async function getProjectExpenseSummary(projectId) {
  const expenses = await getExpensesByProject(projectId)
  return calculateExpenseTotals(expenses)
}

/**
 * Get expense statistics for an organization
 * @param {string} organizationId - Organization ID
 * @param {number} days - Number of days to look back
 * @returns {Promise<Object>}
 */
export async function getOrganizationExpenseStats(organizationId, days = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  const cutoffStr = cutoffDate.toISOString().split('T')[0]

  const expenses = await getExpenses(organizationId)
  const recentExpenses = expenses.filter(e => e.date >= cutoffStr)

  return {
    ...calculateExpenseTotals(recentExpenses),
    period: `Last ${days} days`
  }
}
