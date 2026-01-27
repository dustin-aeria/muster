/**
 * Phase Constants
 * Task types, cost item types, and status definitions for Pre-Field and Post-Field phases
 *
 * @location src/components/projects/phases/phaseConstants.js
 */

import {
  Phone,
  FileCheck,
  MapPin,
  Route,
  Calendar,
  Wrench,
  Car,
  MoreHorizontal,
  Database,
  Package,
  Eye,
  Edit3,
  Send,
  CheckCircle,
  Users,
  Truck,
  Settings,
  DollarSign
} from 'lucide-react'

// ============================================
// PRE-FIELD TASK TYPES
// ============================================

export const PRE_FIELD_TASK_TYPES = {
  client_communication: {
    label: 'Client Communications',
    icon: Phone,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  regulatory: {
    label: 'Regulatory Work',
    description: 'SFOC, airspace authorization',
    icon: FileCheck,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  site_recon: {
    label: 'Site Survey/Reconnaissance',
    icon: MapPin,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  mission_planning: {
    label: 'Mission Planning',
    icon: Route,
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  crew_scheduling: {
    label: 'Crew Scheduling',
    icon: Calendar,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200'
  },
  equipment_prep: {
    label: 'Equipment Prep',
    icon: Wrench,
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  travel: {
    label: 'Travel Planning',
    icon: Car,
    color: 'bg-rose-100 text-rose-700 border-rose-200'
  },
  other: {
    label: 'Other',
    icon: MoreHorizontal,
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// ============================================
// POST-FIELD TASK TYPES
// ============================================

export const POST_FIELD_TASK_TYPES = {
  data_processing: {
    label: 'Data Processing/QC',
    icon: Database,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  },
  deliverable: {
    label: 'Deliverable Production',
    icon: Package,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  },
  client_review: {
    label: 'Client Review',
    icon: Eye,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  revisions: {
    label: 'Revisions',
    icon: Edit3,
    color: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  final_delivery: {
    label: 'Final Delivery',
    icon: Send,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  closeout: {
    label: 'Project Closeout',
    icon: CheckCircle,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  other: {
    label: 'Other',
    icon: MoreHorizontal,
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// ============================================
// COST ITEM TYPES
// ============================================

export const COST_ITEM_TYPES = {
  personnel: {
    label: 'Personnel',
    icon: Users,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    rateField: 'hourlyRate'
  },
  service: {
    label: 'Service',
    icon: Settings,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    rateField: 'hourlyRate'
  },
  equipment: {
    label: 'Equipment',
    icon: Wrench,
    color: 'bg-green-50 text-green-700 border-green-200',
    rateField: 'hourlyRate'
  },
  fleet: {
    label: 'Fleet/Vehicle',
    icon: Truck,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    rateField: 'dailyRate'
  },
  fixed: {
    label: 'Fixed Cost',
    icon: DollarSign,
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    rateField: null
  }
}

// ============================================
// TASK STATUS DEFINITIONS
// ============================================

export const TASK_STATUS = {
  pending: {
    label: 'Pending',
    color: 'text-gray-400',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300'
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300'
  },
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300'
  },
  skipped: {
    label: 'Skipped',
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get task type configuration
 * @param {string} type - Task type key
 * @param {boolean} isPreField - Whether this is a pre-field task
 * @returns {Object} Task type configuration
 */
export function getTaskTypeConfig(type, isPreField = true) {
  const types = isPreField ? PRE_FIELD_TASK_TYPES : POST_FIELD_TASK_TYPES
  return types[type] || types.other
}

/**
 * Get cost item type configuration
 * @param {string} type - Cost item type key
 * @returns {Object} Cost item type configuration
 */
export function getCostItemTypeConfig(type) {
  return COST_ITEM_TYPES[type] || COST_ITEM_TYPES.fixed
}

/**
 * Get task status configuration
 * @param {string} status - Task status key
 * @returns {Object} Status configuration
 */
export function getTaskStatusConfig(status) {
  return TASK_STATUS[status] || TASK_STATUS.pending
}

/**
 * Generate a unique ID for tasks/cost items
 * @returns {string} Unique ID
 */
export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a new task with defaults
 * @param {Object} overrides - Fields to override defaults
 * @returns {Object} New task object
 */
export function createTask(overrides = {}) {
  return {
    id: generateId(),
    name: '',
    type: 'other',
    description: '',
    status: 'pending',
    order: 0,
    dueDate: null,
    completedAt: null,
    costItems: [],
    ...overrides
  }
}

/**
 * Create a new cost item with defaults
 * @param {Object} overrides - Fields to override defaults
 * @returns {Object} New cost item object
 */
export function createCostItem(overrides = {}) {
  return {
    id: generateId(),
    type: 'personnel',
    referenceId: '',
    referenceName: '',
    description: '',
    hours: 0,
    rate: 0,
    rateType: 'hourly',
    total: 0,
    notes: '',
    ...overrides
  }
}

/**
 * Create default phase structure
 * @returns {Object} Default phase object
 */
export function createDefaultPhase() {
  return {
    tasks: [],
    notes: ''
  }
}

export default {
  PRE_FIELD_TASK_TYPES,
  POST_FIELD_TASK_TYPES,
  COST_ITEM_TYPES,
  TASK_STATUS,
  getTaskTypeConfig,
  getCostItemTypeConfig,
  getTaskStatusConfig,
  generateId,
  createTask,
  createCostItem,
  createDefaultPhase
}
