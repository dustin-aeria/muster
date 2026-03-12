/**
 * Phase 4 Database Schema Definitions
 * Firestore collection structure for Workflows, Fillable Forms & Google Drive
 *
 * Collections:
 * - formSubmissions - Filled form submissions with field values
 * - workflowTemplates - Workflow template definitions
 * - workflowInstances - Active/completed workflow instances
 * - googleDriveTokens - User OAuth tokens for Google Drive
 *
 * @version 1.0.0
 */

// ============================================
// FORM SUBMISSIONS SCHEMA
// ============================================

/**
 * @typedef {Object} FormSubmission
 * @property {string} id - Auto-generated document ID
 * @property {string} formId - Reference to source form/document
 * @property {string} formTitle - Title of the form
 * @property {string} [formNumber] - Optional form number
 * @property {string} organizationId - Organization this belongs to
 *
 * @property {Object} fieldValues - JSON object with field values keyed by field ID
 * @property {Array<FieldDefinition>} fieldDefinitions - Parsed field definitions from template
 *
 * @property {('draft'|'submitted'|'approved'|'rejected')} status - Submission status
 * @property {Date} [submittedAt] - When the form was submitted
 * @property {string} [submittedBy] - User ID who submitted
 * @property {string} [submittedByName] - Display name of submitter
 *
 * @property {string} [pdfUrl] - URL to generated PDF in storage
 * @property {Date} [pdfGeneratedAt] - When PDF was generated
 *
 * @property {string} [driveFileId] - Google Drive file ID
 * @property {string} [driveFileUrl] - Google Drive shareable URL
 *
 * @property {string} [workflowInstanceId] - Associated workflow instance
 *
 * @property {Date} createdAt - Creation timestamp
 * @property {string} createdBy - User ID who created
 * @property {string} createdByName - Display name of creator
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} FieldDefinition
 * @property {string} id - Unique field identifier
 * @property {string} label - Display label
 * @property {('text'|'textarea'|'date'|'datetime'|'checkbox'|'select'|'signature'|'number'|'email'|'phone')} type - Field type
 * @property {*} [defaultValue] - Default value
 * @property {boolean} [required] - Whether field is required
 * @property {Array<{label: string, value: string}>} [options] - Options for select fields
 * @property {string} [placeholder] - Placeholder text
 * @property {number} [row] - Row position in form grid
 * @property {number} [col] - Column position in form grid
 */

export const FORM_SUBMISSION_STATUS = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: 'FileEdit' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: 'Send' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: 'CheckCircle' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: 'XCircle' },
}

// ============================================
// WORKFLOW TEMPLATES SCHEMA
// ============================================

/**
 * @typedef {Object} WorkflowTemplate
 * @property {string} id - Auto-generated document ID
 * @property {string} name - Template name
 * @property {string} [description] - Template description
 * @property {string} organizationId - Organization this belongs to
 *
 * @property {Array<WorkflowStep>} steps - Workflow steps in order
 *
 * @property {('manual'|'form_submission')} triggerType - How workflow is triggered
 * @property {Array<string>} [triggerFormTypes] - Form types that trigger this workflow
 *
 * @property {('draft'|'active'|'archived')} status - Template status
 * @property {Date} createdAt - Creation timestamp
 * @property {string} createdBy - User ID who created
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} WorkflowStep
 * @property {string} id - Step identifier (slug)
 * @property {string} name - Display name
 * @property {number} order - Step order (1-based)
 * @property {string} [description] - Step description
 * @property {Array<string>} actions - Available actions: 'approve', 'reject', 'request_changes', 'complete'
 * @property {string} [assigneeRole] - Role to assign to: 'manager', 'admin', 'submitter', 'specific_user'
 * @property {string} [assigneeUserId] - Specific user ID if assigneeRole is 'specific_user'
 * @property {number} [dueDays] - Days until due from step start
 * @property {boolean} [final] - Whether this is the final step
 * @property {boolean} [requireComment] - Whether comment is required for actions
 */

export const WORKFLOW_TEMPLATE_STATUS = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', color: 'bg-yellow-100 text-yellow-700' },
}

export const WORKFLOW_TRIGGER_TYPES = {
  manual: { label: 'Manual', description: 'Workflow started manually by user' },
  form_submission: { label: 'Form Submission', description: 'Triggered when specific form type is submitted' },
}

export const WORKFLOW_ACTIONS = {
  approve: { label: 'Approve', color: 'bg-green-600 hover:bg-green-700', icon: 'CheckCircle' },
  reject: { label: 'Reject', color: 'bg-red-600 hover:bg-red-700', icon: 'XCircle' },
  request_changes: { label: 'Request Changes', color: 'bg-amber-600 hover:bg-amber-700', icon: 'MessageSquare' },
  complete: { label: 'Complete', color: 'bg-blue-600 hover:bg-blue-700', icon: 'CheckSquare' },
}

export const WORKFLOW_ASSIGNEE_ROLES = {
  submitter: { label: 'Submitter', description: 'Person who started the workflow' },
  manager: { label: 'Manager', description: 'Organization manager role' },
  admin: { label: 'Admin', description: 'Organization admin role' },
  specific_user: { label: 'Specific User', description: 'A specific user' },
}

// ============================================
// WORKFLOW INSTANCES SCHEMA
// ============================================

/**
 * @typedef {Object} WorkflowInstance
 * @property {string} id - Auto-generated document ID
 * @property {string} templateId - Reference to workflow template
 * @property {string} templateName - Name of the template (denormalized)
 * @property {string} organizationId - Organization this belongs to
 *
 * @property {string} entityType - Type of entity: 'form_submission', 'document', etc.
 * @property {string} entityId - ID of the entity being tracked
 * @property {string} [entityTitle] - Title of the entity (denormalized)
 *
 * @property {string} currentStepId - Current step identifier
 * @property {string} currentStepName - Current step display name
 * @property {('active'|'completed'|'cancelled')} status - Instance status
 *
 * @property {string} [assignedTo] - Currently assigned user ID
 * @property {string} [assignedToName] - Display name of assigned user
 * @property {Date} [dueDate] - Due date for current step
 *
 * @property {Array<WorkflowHistoryEntry>} history - History of actions
 *
 * @property {Date} startedAt - When workflow was started
 * @property {string} startedBy - User ID who started workflow
 * @property {string} startedByName - Display name of starter
 * @property {Date} [completedAt] - When workflow was completed
 *
 * @property {Date} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} WorkflowHistoryEntry
 * @property {string} stepId - Step ID at time of action
 * @property {string} stepName - Step name at time of action
 * @property {string} action - Action taken: 'started', 'approved', 'rejected', 'request_changes', 'completed', 'assigned'
 * @property {string} by - User ID who took action
 * @property {string} byName - Display name of user
 * @property {Date} at - Timestamp of action
 * @property {string} [comment] - Optional comment
 */

export const WORKFLOW_INSTANCE_STATUS = {
  active: { label: 'Active', color: 'bg-blue-100 text-blue-700', icon: 'Play' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: 'CheckCircle' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: 'XCircle' },
}

// ============================================
// GOOGLE DRIVE TOKENS SCHEMA
// ============================================

/**
 * @typedef {Object} GoogleDriveToken
 * @property {string} id - Document ID (same as userId for easy lookup)
 * @property {string} userId - Reference to auth user
 * @property {string} organizationId - Organization context
 *
 * @property {string} accessToken - Google OAuth access token (encrypted in production)
 * @property {string} refreshToken - Google OAuth refresh token (encrypted in production)
 * @property {Date} tokenExpiry - When access token expires
 *
 * @property {string} [defaultFolderId] - Default Drive folder for uploads
 * @property {string} [defaultFolderName] - Name of default folder
 * @property {boolean} autoUpload - Whether to auto-upload form PDFs
 *
 * @property {Date} connectedAt - When account was connected
 * @property {Date} [lastUsedAt] - Last time Drive was used
 * @property {string} [email] - Connected Google account email
 */

export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // Create/manage files created by app
  'https://www.googleapis.com/auth/drive.metadata.readonly', // Read folder structure
]

// ============================================
// DEFAULT WORKFLOW TEMPLATES
// ============================================

/**
 * Default workflow templates that can be seeded into new organizations
 */
export const DEFAULT_WORKFLOW_TEMPLATES = [
  {
    name: 'Form Approval',
    description: 'Standard approval workflow for form submissions',
    triggerType: 'form_submission',
    triggerFormTypes: [],
    status: 'active',
    steps: [
      {
        id: 'submit',
        name: 'Submit',
        order: 1,
        description: 'Form submitted for review',
        actions: [],
        final: false,
      },
      {
        id: 'review',
        name: 'Manager Review',
        order: 2,
        description: 'Manager reviews the submission',
        actions: ['approve', 'reject', 'request_changes'],
        assigneeRole: 'manager',
        dueDays: 3,
        requireComment: false,
        final: false,
      },
      {
        id: 'complete',
        name: 'Complete',
        order: 3,
        description: 'Workflow completed',
        actions: [],
        final: true,
      },
    ],
  },
  {
    name: 'Two-Level Approval',
    description: 'Requires both manager and admin approval',
    triggerType: 'manual',
    triggerFormTypes: [],
    status: 'active',
    steps: [
      {
        id: 'submit',
        name: 'Submit',
        order: 1,
        description: 'Item submitted for review',
        actions: [],
        final: false,
      },
      {
        id: 'manager_review',
        name: 'Manager Review',
        order: 2,
        description: 'Manager reviews and approves',
        actions: ['approve', 'reject', 'request_changes'],
        assigneeRole: 'manager',
        dueDays: 3,
        requireComment: false,
        final: false,
      },
      {
        id: 'admin_review',
        name: 'Admin Review',
        order: 3,
        description: 'Admin provides final approval',
        actions: ['approve', 'reject'],
        assigneeRole: 'admin',
        dueDays: 5,
        requireComment: true,
        final: false,
      },
      {
        id: 'complete',
        name: 'Complete',
        order: 4,
        description: 'Workflow completed',
        actions: [],
        final: true,
      },
    ],
  },
]

// ============================================
// FIRESTORE COLLECTION NAMES
// ============================================

export const COLLECTIONS = {
  FORM_SUBMISSIONS: 'formSubmissions',
  WORKFLOW_TEMPLATES: 'workflowTemplates',
  WORKFLOW_INSTANCES: 'workflowInstances',
  GOOGLE_DRIVE_TOKENS: 'googleDriveTokens',
}
