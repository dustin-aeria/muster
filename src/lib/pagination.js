/**
 * Pagination Utilities
 * Client-side and Firestore pagination helpers
 *
 * @location src/lib/pagination.js
 */

import {
  query,
  limit,
  startAfter,
  orderBy,
  getDocs,
  getCountFromServer
} from 'firebase/firestore'

// ============================================
// PAGINATION CONFIGURATION
// ============================================

export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ============================================
// CLIENT-SIDE PAGINATION
// ============================================

/**
 * Paginate an array of items
 */
export function paginateArray(items, page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    items: items.slice(startIndex, endIndex),
    pagination: {
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / pageSize),
      hasNextPage: endIndex < items.length,
      hasPrevPage: page > 1,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, items.length)
    }
  }
}

/**
 * Create pagination state object
 */
export function createPaginationState(options = {}) {
  return {
    page: options.page || 1,
    pageSize: options.pageSize || DEFAULT_PAGE_SIZE,
    totalItems: options.totalItems || 0,
    totalPages: options.totalPages || 0,
    sortBy: options.sortBy || null,
    sortOrder: options.sortOrder || 'asc'
  }
}

/**
 * Get pagination info from state
 */
export function getPaginationInfo(pagination) {
  const { page, pageSize, totalItems } = pagination
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, totalItems)

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    isFirstPage: page === 1,
    isLastPage: page === totalPages || totalPages === 0
  }
}

/**
 * Generate page numbers for pagination UI
 */
export function getPageNumbers(currentPage, totalPages, maxVisible = 7) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = []
  const halfVisible = Math.floor((maxVisible - 3) / 2)

  // Always show first page
  pages.push(1)

  // Calculate range around current page
  let start = Math.max(2, currentPage - halfVisible)
  let end = Math.min(totalPages - 1, currentPage + halfVisible)

  // Adjust if at beginning or end
  if (currentPage <= halfVisible + 2) {
    end = maxVisible - 2
  } else if (currentPage >= totalPages - halfVisible - 1) {
    start = totalPages - maxVisible + 3
  }

  // Add ellipsis after first page if needed
  if (start > 2) {
    pages.push('...')
  }

  // Add middle pages
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  // Add ellipsis before last page if needed
  if (end < totalPages - 1) {
    pages.push('...')
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
}

// ============================================
// FIRESTORE CURSOR PAGINATION
// ============================================

/**
 * Create a Firestore paginated query
 */
export function createPaginatedQuery(collectionRef, options = {}) {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    orderByField = 'createdAt',
    orderDirection = 'desc',
    startAfterDoc = null,
    constraints = []
  } = options

  let q = query(
    collectionRef,
    ...constraints,
    orderBy(orderByField, orderDirection),
    limit(pageSize + 1) // Fetch one extra to check if there's a next page
  )

  if (startAfterDoc) {
    q = query(q, startAfter(startAfterDoc))
  }

  return q
}

/**
 * Execute paginated query and return results with pagination info
 */
export async function executePaginatedQuery(q, pageSize = DEFAULT_PAGE_SIZE) {
  const snapshot = await getDocs(q)
  const docs = snapshot.docs

  const hasNextPage = docs.length > pageSize
  const items = docs.slice(0, pageSize).map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  const lastDoc = docs[pageSize - 1] || null

  return {
    items,
    lastDoc,
    hasNextPage,
    isEmpty: items.length === 0
  }
}

/**
 * Get total count for a query (use sparingly - can be expensive)
 */
export async function getTotalCount(collectionRef, constraints = []) {
  const q = query(collectionRef, ...constraints)
  const snapshot = await getCountFromServer(q)
  return snapshot.data().count
}

// ============================================
// INFINITE SCROLL HELPERS
// ============================================

/**
 * Create infinite scroll state
 */
export function createInfiniteScrollState() {
  return {
    items: [],
    lastDoc: null,
    hasMore: true,
    isLoading: false,
    error: null
  }
}

/**
 * Merge new items into infinite scroll state
 */
export function mergeInfiniteScrollResults(state, newItems, lastDoc, hasMore) {
  return {
    ...state,
    items: [...state.items, ...newItems],
    lastDoc,
    hasMore,
    isLoading: false,
    error: null
  }
}

/**
 * Reset infinite scroll state
 */
export function resetInfiniteScrollState() {
  return createInfiniteScrollState()
}

// ============================================
// SORTING HELPERS
// ============================================

/**
 * Sort array by field
 */
export function sortArray(items, sortBy, sortOrder = 'asc') {
  if (!sortBy) return items

  return [...items].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]

    // Handle null/undefined
    if (aVal == null) return sortOrder === 'asc' ? 1 : -1
    if (bVal == null) return sortOrder === 'asc' ? -1 : 1

    // Handle dates
    if (aVal instanceof Date) aVal = aVal.getTime()
    if (bVal instanceof Date) bVal = bVal.getTime()

    // Handle strings
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const comparison = aVal.localeCompare(bVal)
      return sortOrder === 'asc' ? comparison : -comparison
    }

    // Handle numbers
    if (sortOrder === 'asc') {
      return aVal - bVal
    } else {
      return bVal - aVal
    }
  })
}

/**
 * Toggle sort order
 */
export function toggleSortOrder(currentOrder) {
  return currentOrder === 'asc' ? 'desc' : 'asc'
}

/**
 * Get sort icon based on order
 */
export function getSortIcon(sortOrder) {
  return sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'
}

// ============================================
// FILTERING HELPERS
// ============================================

/**
 * Filter array by search query
 */
export function filterBySearch(items, query, searchFields) {
  if (!query || query.trim() === '') return items

  const searchTerms = query.toLowerCase().split(/\s+/)

  return items.filter(item => {
    return searchTerms.every(term => {
      return searchFields.some(field => {
        const value = getNestedValue(item, field)
        if (value == null) return false
        return String(value).toLowerCase().includes(term)
      })
    })
  })
}

/**
 * Filter array by field value
 */
export function filterByField(items, field, value) {
  if (value == null || value === '' || value === 'all') return items

  return items.filter(item => {
    const itemValue = getNestedValue(item, field)
    if (Array.isArray(value)) {
      return value.includes(itemValue)
    }
    return itemValue === value
  })
}

/**
 * Filter array by date range
 */
export function filterByDateRange(items, dateField, startDate, endDate) {
  return items.filter(item => {
    const itemDate = new Date(item[dateField])
    if (startDate && itemDate < new Date(startDate)) return false
    if (endDate && itemDate > new Date(endDate)) return false
    return true
  })
}

/**
 * Apply multiple filters
 */
export function applyFilters(items, filters) {
  let filtered = [...items]

  Object.entries(filters).forEach(([key, filter]) => {
    if (filter.type === 'search' && filter.value) {
      filtered = filterBySearch(filtered, filter.value, filter.fields)
    } else if (filter.type === 'field' && filter.value != null) {
      filtered = filterByField(filtered, filter.field, filter.value)
    } else if (filter.type === 'dateRange') {
      filtered = filterByDateRange(filtered, filter.field, filter.start, filter.end)
    }
  })

  return filtered
}

// ============================================
// COMBINED PAGINATION WITH FILTERS
// ============================================

/**
 * Apply filters, sort, and paginate
 */
export function processItems(items, options = {}) {
  const {
    filters = {},
    sortBy = null,
    sortOrder = 'asc',
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE
  } = options

  // Apply filters
  let processed = applyFilters(items, filters)

  // Apply sorting
  if (sortBy) {
    processed = sortArray(processed, sortBy, sortOrder)
  }

  // Apply pagination
  const result = paginateArray(processed, page, pageSize)

  return {
    ...result,
    totalFiltered: processed.length
  }
}

// ============================================
// URL STATE MANAGEMENT
// ============================================

/**
 * Parse pagination params from URL
 */
export function parsePaginationParams(searchParams) {
  return {
    page: parseInt(searchParams.get('page')) || 1,
    pageSize: parseInt(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE,
    sortBy: searchParams.get('sortBy') || null,
    sortOrder: searchParams.get('sortOrder') || 'asc',
    search: searchParams.get('search') || ''
  }
}

/**
 * Build URL params from pagination state
 */
export function buildPaginationParams(state) {
  const params = new URLSearchParams()

  if (state.page && state.page !== 1) {
    params.set('page', state.page.toString())
  }
  if (state.pageSize && state.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set('pageSize', state.pageSize.toString())
  }
  if (state.sortBy) {
    params.set('sortBy', state.sortBy)
    params.set('sortOrder', state.sortOrder || 'asc')
  }
  if (state.search) {
    params.set('search', state.search)
  }

  return params.toString()
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get nested object value
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export default {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  paginateArray,
  createPaginationState,
  getPaginationInfo,
  getPageNumbers,
  createPaginatedQuery,
  executePaginatedQuery,
  getTotalCount,
  createInfiniteScrollState,
  mergeInfiniteScrollResults,
  resetInfiniteScrollState,
  sortArray,
  toggleSortOrder,
  getSortIcon,
  filterBySearch,
  filterByField,
  filterByDateRange,
  applyFilters,
  processItems,
  parsePaginationParams,
  buildPaginationParams
}
