# Aeria Ops: Implementation Plan

**Version:** 1.0
**Date:** January 29, 2026
**Based on:** Strategic Product Analysis

---

## Overview

This plan transforms Aeria Ops from a drone-focused compliance platform into a comprehensive field operations SaaS serving standalone operators and enterprise divisions. The plan is organized into 4 phases over approximately 12-18 months.

---

## Phase 1: Foundation (Stickiness)
**Duration:** 3-4 months
**Goal:** Make the software indispensable for daily operations by touching revenue

---

### 1.1 Invoicing Module
**Priority:** Critical
**Estimated Effort:** 4-5 weeks

#### Data Model

```javascript
// New Collection: invoices
{
  id: string,
  invoiceNumber: string,              // Auto-generated (INV-2026-0001)
  projectId: string,                  // Link to project
  clientId: string,                   // Link to client

  // Billing Details
  billingType: 'fixed' | 'time_materials' | 'progress' | 'per_unit',
  billingPeriod: {
    startDate: Timestamp,
    endDate: Timestamp
  },

  // Line Items
  lineItems: [{
    id: string,
    type: 'service' | 'equipment' | 'labor' | 'expense' | 'other',
    description: string,
    quantity: number,
    unit: string,                     // 'hours', 'days', 'acres', 'miles', etc.
    rate: number,
    amount: number,
    sourceId: string | null,          // Link to service/equipment/timeEntry
    taxable: boolean
  }],

  // Totals
  subtotal: number,
  taxRate: number,
  taxAmount: number,
  total: number,

  // Progress Billing (if applicable)
  progressBilling: {
    contractAmount: number,
    previouslyBilled: number,
    currentBilled: number,
    retainagePercent: number,
    retainageAmount: number,
    percentComplete: number
  } | null,

  // Status & Payment
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'void',
  issueDate: Timestamp,
  dueDate: Timestamp,
  paidDate: Timestamp | null,
  paidAmount: number,
  paymentMethod: string | null,
  paymentReference: string | null,

  // Terms & Notes
  terms: string,
  notes: string,
  internalNotes: string,

  // Metadata
  createdBy: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  sentAt: Timestamp | null,
  viewedAt: Timestamp | null
}
```

#### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/firestoreInvoices.js` | CRUD operations, invoice number generation, status management |
| `src/pages/Invoices.jsx` | Invoice list page with filters and search |
| `src/pages/InvoiceDetail.jsx` | View/edit single invoice |
| `src/components/invoices/InvoiceBuilder.jsx` | Create/edit invoice with line items |
| `src/components/invoices/InvoicePreview.jsx` | PDF preview component |
| `src/components/invoices/InvoiceFromProject.jsx` | Generate invoice from project costs |
| `src/components/invoices/LineItemEditor.jsx` | Add/edit line items |
| `src/components/invoices/PaymentRecorder.jsx` | Record payment modal |
| `src/lib/invoicePdf.js` | PDF generation with company branding |

#### Implementation Steps

1. **Create data layer** (`firestoreInvoices.js`)
   - `createInvoice()`, `updateInvoice()`, `getInvoice()`, `getInvoices()`
   - `generateInvoiceNumber()` - sequential numbering with prefix
   - `calculateInvoiceTotals()` - sum line items, apply tax
   - `getInvoicesByProject()`, `getInvoicesByClient()`
   - `getInvoiceMetrics()` - totals by status, aging report

2. **Build Invoice List page** (`Invoices.jsx`)
   - Stats cards: Draft, Sent, Overdue, Paid (this month)
   - Filters: Status, Client, Date range
   - Table view with sortable columns
   - Quick actions: View, Send, Record Payment, Void

3. **Build Invoice Builder** (`InvoiceBuilder.jsx`)
   - Client selector (auto-populate from project)
   - Billing type selector
   - Line item table with add/edit/remove
   - Auto-calculate from project costs button
   - Tax settings
   - Terms and notes
   - Save as draft / Preview / Send

4. **Build "Generate from Project" flow** (`InvoiceFromProject.jsx`)
   - Select project
   - Choose what to include (services, equipment, labor, expenses)
   - Select billing type
   - Auto-populate line items from project data
   - Review and adjust before creating

5. **PDF Generation** (`invoicePdf.js`)
   - Company logo and branding
   - Client details
   - Line items table
   - Totals with tax breakdown
   - Payment terms and instructions
   - Professional layout matching existing PDF exports

6. **Add to Navigation**
   - Add "Invoices" under new "Billing" section in sidebar
   - Add invoice stats to Dashboard

#### Acceptance Criteria
- [ ] Can create invoice manually with line items
- [ ] Can generate invoice from project costs
- [ ] Can preview and download PDF
- [ ] Can track payment status
- [ ] Can see aging report (30/60/90 days)
- [ ] Invoice numbers are sequential and unique

---

### 1.2 Time Tracking
**Priority:** High
**Estimated Effort:** 3-4 weeks

#### Data Model

```javascript
// New Collection: timeEntries
{
  id: string,
  projectId: string,
  siteId: string | null,              // Optional: specific site
  operatorId: string,                 // Who logged the time

  // Time Details
  date: Timestamp,
  startTime: string,                  // "08:00"
  endTime: string,                    // "17:00"
  breakMinutes: number,
  totalHours: number,                 // Calculated

  // Categorization
  taskType: 'field_work' | 'travel' | 'prep' | 'post_processing' | 'admin' | 'training' | 'other',
  description: string,

  // Billing
  billable: boolean,
  billingRate: number,                // Hourly rate at time of entry
  billingAmount: number,              // totalHours * billingRate
  invoiced: boolean,
  invoiceId: string | null,

  // Approval
  status: 'draft' | 'submitted' | 'approved' | 'rejected',
  submittedAt: Timestamp | null,
  approvedBy: string | null,
  approvedAt: Timestamp | null,
  rejectionReason: string | null,

  // Metadata
  createdBy: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// New Collection: timesheets (weekly aggregation)
{
  id: string,
  operatorId: string,
  weekStartDate: Timestamp,           // Monday of the week
  weekEndDate: Timestamp,             // Sunday of the week

  entries: string[],                  // Array of timeEntry IDs
  totalHours: number,
  billableHours: number,

  status: 'draft' | 'submitted' | 'approved' | 'rejected',
  submittedAt: Timestamp | null,
  approvedBy: string | null,
  approvedAt: Timestamp | null,

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/firestoreTimeTracking.js` | CRUD for time entries and timesheets |
| `src/pages/TimeTracking.jsx` | Time entry list and weekly view |
| `src/components/time/TimeEntryForm.jsx` | Add/edit time entry |
| `src/components/time/WeeklyTimesheet.jsx` | Weekly grid view |
| `src/components/time/TimeApproval.jsx` | Manager approval interface |
| `src/components/time/TimeSummaryWidget.jsx` | Dashboard widget |
| `src/components/projects/ProjectTimeEntries.jsx` | Time entries for a project |

#### Implementation Steps

1. **Create data layer** (`firestoreTimeTracking.js`)
   - `createTimeEntry()`, `updateTimeEntry()`, `deleteTimeEntry()`
   - `getTimeEntriesByProject()`, `getTimeEntriesByOperator()`
   - `getTimeEntriesForWeek()`, `getTimesheetForWeek()`
   - `submitTimesheet()`, `approveTimesheet()`, `rejectTimesheet()`
   - `calculateWeeklyTotals()`

2. **Build Time Entry Form** (`TimeEntryForm.jsx`)
   - Project/site selector
   - Date picker
   - Start/end time or duration entry
   - Task type selector
   - Billable toggle with rate
   - Description field

3. **Build Weekly Timesheet View** (`WeeklyTimesheet.jsx`)
   - Calendar grid (Mon-Sun columns)
   - Project rows
   - Click to add/edit entries
   - Daily and weekly totals
   - Submit for approval button

4. **Build Approval Interface** (`TimeApproval.jsx`)
   - List of pending timesheets
   - Expand to see details
   - Approve/reject with comments
   - Bulk approve

5. **Integrate with Projects**
   - Add "Time" tab to ProjectView
   - Show time entries for project
   - Calculate total labor cost
   - Feed into project cost summary

6. **Integrate with Invoicing**
   - Option to add time entries as invoice line items
   - Mark entries as invoiced when added
   - Prevent duplicate billing

#### Acceptance Criteria
- [ ] Can log time against projects
- [ ] Can view weekly timesheet
- [ ] Can submit timesheet for approval
- [ ] Manager can approve/reject timesheets
- [ ] Time entries flow into project costs
- [ ] Time entries can be added to invoices

---

### 1.3 Client Portal (Basic)
**Priority:** Medium
**Estimated Effort:** 3 weeks

#### Architecture

```
Main App (app.aeriaops.com)
├── Full access for operators
└── All current functionality

Client Portal (portal.aeriaops.com OR app.aeriaops.com/portal)
├── Read-only access for clients
├── View assigned projects
├── Download deliverables
├── View/pay invoices
└── Branded experience
```

#### Data Model Updates

```javascript
// Update: clients collection
{
  // ... existing fields ...

  // Portal Access
  portalEnabled: boolean,
  portalUsers: [{
    id: string,
    email: string,
    name: string,
    role: 'admin' | 'viewer',        // Client-side roles
    invitedAt: Timestamp,
    acceptedAt: Timestamp | null,
    lastLoginAt: Timestamp | null
  }],

  // Branding
  branding: {
    primaryColor: string,
    logoUrl: string,
    companyName: string
  }
}

// New Collection: portalSessions
{
  id: string,
  clientId: string,
  userId: string,
  email: string,
  createdAt: Timestamp,
  expiresAt: Timestamp
}
```

#### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/portal/PortalLogin.jsx` | Client login page |
| `src/pages/portal/PortalDashboard.jsx` | Client home page |
| `src/pages/portal/PortalProjects.jsx` | List of client's projects |
| `src/pages/portal/PortalProjectView.jsx` | Read-only project view |
| `src/pages/portal/PortalInvoices.jsx` | Client's invoices |
| `src/pages/portal/PortalDocuments.jsx` | Downloadable deliverables |
| `src/components/portal/PortalLayout.jsx` | Client portal layout |
| `src/contexts/PortalAuthContext.jsx` | Client authentication context |
| `src/lib/portalAuth.js` | Magic link authentication |

#### Implementation Steps

1. **Client Portal Authentication**
   - Magic link login (no password required)
   - Send login link to client email
   - Create session on link click
   - Session expiry and refresh

2. **Portal Layout**
   - Client branding (logo, colors)
   - Simplified navigation
   - Contact support link

3. **Portal Dashboard**
   - Active projects count
   - Pending invoices
   - Recent activity
   - Quick links

4. **Projects View**
   - List projects assigned to client
   - Read-only project details
   - Status and progress
   - Key deliverables

5. **Documents/Deliverables**
   - List downloadable files
   - Organized by project
   - Download tracking

6. **Invoices View**
   - List all invoices
   - View invoice details
   - Download PDF
   - Payment status

7. **Invite Clients from Main App**
   - Client detail page: "Enable Portal Access"
   - Add portal users (email addresses)
   - Send invitation emails
   - Track invitation status

#### Acceptance Criteria
- [ ] Client can log in via magic link
- [ ] Client can view their projects (read-only)
- [ ] Client can download deliverables
- [ ] Client can view and download invoices
- [ ] Portal shows client branding
- [ ] Operator can invite clients from main app

---

## Phase 2: Enterprise Ready
**Duration:** 3-4 months
**Goal:** Meet enterprise IT requirements for adoption

---

### 2.1 Multi-Tenancy / Organizations
**Priority:** Critical
**Estimated Effort:** 5-6 weeks

#### Data Model

```javascript
// New Collection: organizations
{
  id: string,
  name: string,
  slug: string,                       // URL-friendly identifier
  type: 'standalone' | 'division' | 'enterprise',

  // Hierarchy
  parentId: string | null,            // For divisions under enterprise

  // Settings
  settings: {
    timezone: string,
    dateFormat: string,
    currency: string,
    fiscalYearStart: number,          // Month (1-12)
  },

  // Branding
  branding: {
    logoUrl: string,
    primaryColor: string,
    companyName: string,
    website: string
  },

  // Subscription
  subscription: {
    plan: 'starter' | 'professional' | 'enterprise',
    status: 'active' | 'trial' | 'suspended' | 'cancelled',
    trialEndsAt: Timestamp | null,
    currentPeriodEndsAt: Timestamp
  },

  // Limits
  limits: {
    users: number,
    projects: number,
    storage: number                   // GB
  },

  createdAt: Timestamp,
  updatedAt: Timestamp
}

// New Collection: organizationMembers
{
  id: string,
  organizationId: string,
  userId: string,

  role: 'owner' | 'admin' | 'manager' | 'operator' | 'viewer',

  // Permissions (granular overrides)
  permissions: {
    projects: 'none' | 'view' | 'edit' | 'manage',
    equipment: 'none' | 'view' | 'edit' | 'manage',
    operators: 'none' | 'view' | 'edit' | 'manage',
    safety: 'none' | 'view' | 'edit' | 'manage',
    compliance: 'none' | 'view' | 'edit' | 'manage',
    billing: 'none' | 'view' | 'edit' | 'manage',
    settings: 'none' | 'view' | 'manage'
  },

  invitedBy: string,
  invitedAt: Timestamp,
  acceptedAt: Timestamp | null,
  status: 'pending' | 'active' | 'suspended',

  createdAt: Timestamp,
  updatedAt: Timestamp
}

// Update: All existing collections get organizationId
{
  // ... existing fields ...
  organizationId: string              // Required on all data
}
```

#### Migration Strategy

1. **Create default organization for existing users**
   - On deploy, create organization for each existing user
   - Assign user as owner
   - Add organizationId to all their existing data

2. **Update all queries to filter by organizationId**
   - Every Firestore query includes `where('organizationId', '==', orgId)`
   - No data leakage between organizations

3. **Update all create operations to include organizationId**
   - Every new document gets current user's organizationId

#### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/firestoreOrganizations.js` | Organization CRUD |
| `src/contexts/OrganizationContext.jsx` | Current org context |
| `src/pages/settings/OrganizationSettings.jsx` | Org settings page |
| `src/pages/settings/TeamMembers.jsx` | Manage team members |
| `src/components/settings/InviteMemberModal.jsx` | Invite new members |
| `src/components/settings/RoleSelector.jsx` | Role assignment |
| `src/components/OrgSwitcher.jsx` | Switch between orgs (if multi-org) |
| `src/hooks/useOrganization.js` | Get current org |
| `src/hooks/usePermissions.js` | Check user permissions |

#### Implementation Steps

1. **Create Organization infrastructure**
   - Organization data model and Firestore rules
   - OrganizationContext provider
   - useOrganization hook

2. **Migration script**
   - Create organizations for existing users
   - Add organizationId to all existing documents
   - Test data isolation

3. **Update all data access**
   - Modify every getX() function to accept/require organizationId
   - Update Firestore security rules
   - Test that users can only see their org's data

4. **Team Members page**
   - List current members with roles
   - Invite new members by email
   - Change member roles
   - Remove members

5. **Organization Settings**
   - Edit org name, branding
   - Timezone and locale settings
   - View subscription status

6. **Update all UI to be org-aware**
   - Show org name in sidebar
   - Org switcher (for users in multiple orgs)

#### Acceptance Criteria
- [ ] Each user belongs to an organization
- [ ] Data is isolated between organizations
- [ ] Can invite team members
- [ ] Can assign roles to members
- [ ] Organization settings page works
- [ ] Existing data migrated successfully

---

### 2.2 Role-Based Access Control (RBAC)
**Priority:** Critical
**Estimated Effort:** 3-4 weeks

#### Role Definitions

| Role | Description | Typical User |
|------|-------------|--------------|
| **Owner** | Full access, can delete org | Business owner |
| **Admin** | Full access except delete org | Operations manager |
| **Manager** | Manage projects, approve time, view reports | Team lead |
| **Operator** | Work on assigned projects, log time | Field technician |
| **Viewer** | Read-only access | Client stakeholder |

#### Permission Matrix

| Module | Owner | Admin | Manager | Operator | Viewer |
|--------|-------|-------|---------|----------|--------|
| **Projects** | Manage | Manage | Manage | Edit assigned | View |
| **Equipment** | Manage | Manage | Edit | View | View |
| **Operators** | Manage | Manage | View | View own | None |
| **Safety** | Manage | Manage | Edit | Submit | View |
| **Compliance** | Manage | Manage | Edit | View | View |
| **Training** | Manage | Manage | Edit | View own | None |
| **Invoices** | Manage | Manage | View | None | Own only |
| **Time** | Manage | Manage | Approve | Own only | None |
| **Settings** | Manage | Manage | View | None | None |
| **Team** | Manage | Manage | View | None | None |

#### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/permissions.js` | Permission definitions and checks |
| `src/hooks/usePermissions.js` | Hook for checking permissions |
| `src/components/PermissionGate.jsx` | Component wrapper for permission checks |
| `src/components/settings/RolePermissions.jsx` | View/edit role permissions |

#### Implementation Steps

1. **Define permission system** (`permissions.js`)
   ```javascript
   export const ROLES = {
     OWNER: 'owner',
     ADMIN: 'admin',
     MANAGER: 'manager',
     OPERATOR: 'operator',
     VIEWER: 'viewer'
   }

   export const PERMISSIONS = {
     PROJECTS_VIEW: 'projects:view',
     PROJECTS_EDIT: 'projects:edit',
     PROJECTS_MANAGE: 'projects:manage',
     // ... etc
   }

   export const ROLE_PERMISSIONS = {
     [ROLES.OWNER]: ['*'],  // All permissions
     [ROLES.ADMIN]: ['*'],
     [ROLES.MANAGER]: [...],
     [ROLES.OPERATOR]: [...],
     [ROLES.VIEWER]: [...]
   }

   export function hasPermission(userRole, permission) { ... }
   export function canAccessModule(userRole, module) { ... }
   ```

2. **Create usePermissions hook**
   ```javascript
   export function usePermissions() {
     const { member } = useOrganization()

     return {
       can: (permission) => hasPermission(member.role, permission),
       canAccess: (module) => canAccessModule(member.role, module),
       role: member.role
     }
   }
   ```

3. **Create PermissionGate component**
   ```javascript
   export function PermissionGate({ permission, children, fallback }) {
     const { can } = usePermissions()

     if (!can(permission)) {
       return fallback || null
     }

     return children
   }
   ```

4. **Wrap all sensitive UI**
   - Hide navigation items user can't access
   - Disable edit buttons for view-only users
   - Show read-only views where appropriate
   - Redirect if accessing forbidden routes

5. **Update Firestore security rules**
   - Validate permissions on write operations
   - Check user role before allowing changes

#### Acceptance Criteria
- [ ] Roles are assigned to team members
- [ ] UI hides/disables based on permissions
- [ ] API/Firestore enforces permissions
- [ ] Owner can customize role permissions
- [ ] Permission denied shows friendly message

---

### 2.3 Audit Logging
**Priority:** High
**Estimated Effort:** 2-3 weeks

#### Data Model

```javascript
// New Collection: auditLogs
{
  id: string,
  organizationId: string,

  // What happened
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout',
  resource: string,                   // 'project', 'equipment', 'invoice', etc.
  resourceId: string,
  resourceName: string,               // Human-readable name

  // Who did it
  userId: string,
  userEmail: string,
  userName: string,
  userRole: string,

  // Details
  changes: [{                         // For updates
    field: string,
    oldValue: any,
    newValue: any
  }] | null,

  metadata: {
    ip: string,
    userAgent: string,
    sessionId: string
  },

  timestamp: Timestamp
}
```

#### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/auditLog.js` | Audit logging functions |
| `src/pages/settings/AuditLog.jsx` | View audit logs |
| `src/components/settings/AuditLogViewer.jsx` | Filterable log viewer |
| `src/components/settings/AuditLogExport.jsx` | Export logs to CSV |

#### Implementation Steps

1. **Create audit logging utility**
   ```javascript
   export async function logAudit({
     action,
     resource,
     resourceId,
     resourceName,
     changes = null,
     metadata = {}
   }) {
     const user = getCurrentUser()
     const org = getCurrentOrganization()

     await addDoc(collection(db, 'auditLogs'), {
       organizationId: org.id,
       action,
       resource,
       resourceId,
       resourceName,
       changes,
       userId: user.uid,
       userEmail: user.email,
       userName: user.displayName,
       userRole: user.role,
       metadata: {
         ...metadata,
         userAgent: navigator.userAgent,
         timestamp: new Date().toISOString()
       },
       timestamp: serverTimestamp()
     })
   }
   ```

2. **Create change detection utility**
   ```javascript
   export function detectChanges(oldData, newData, fields) {
     const changes = []
     for (const field of fields) {
       if (oldData[field] !== newData[field]) {
         changes.push({
           field,
           oldValue: oldData[field],
           newValue: newData[field]
         })
       }
     }
     return changes.length > 0 ? changes : null
   }
   ```

3. **Add logging to all data operations**
   - Create operations: log with action='create'
   - Update operations: log with changes array
   - Delete operations: log with action='delete'
   - Sensitive views: log with action='view'
   - Exports: log with action='export'

4. **Build Audit Log Viewer**
   - Filterable by date range
   - Filterable by user
   - Filterable by resource type
   - Filterable by action
   - Search by resource name
   - Export to CSV for compliance

5. **Retention policy**
   - Keep logs for configurable period (default: 2 years)
   - Archive old logs to cold storage
   - Comply with data retention requirements

#### Acceptance Criteria
- [ ] All create/update/delete operations logged
- [ ] Logs include who, what, when, changes
- [ ] Admin can view audit logs
- [ ] Can filter and search logs
- [ ] Can export logs to CSV
- [ ] Logs cannot be modified or deleted

---

### 2.4 SSO Integration
**Priority:** High
**Estimated Effort:** 3-4 weeks

#### Supported Providers

| Provider | Protocol | Priority |
|----------|----------|----------|
| Google Workspace | OIDC | High |
| Microsoft Entra ID (Azure AD) | SAML 2.0 / OIDC | High |
| Okta | SAML 2.0 | Medium |
| Generic SAML | SAML 2.0 | Medium |

#### Data Model

```javascript
// Update: organizations collection
{
  // ... existing fields ...

  sso: {
    enabled: boolean,
    provider: 'google' | 'microsoft' | 'okta' | 'saml',

    // SAML Configuration
    saml: {
      entryPoint: string,             // IdP SSO URL
      issuer: string,                 // SP Entity ID
      cert: string,                   // IdP Certificate
      callbackUrl: string             // ACS URL
    } | null,

    // OIDC Configuration
    oidc: {
      clientId: string,
      clientSecret: string,           // Encrypted
      issuer: string,
      authorizationUrl: string,
      tokenUrl: string,
      userInfoUrl: string
    } | null,

    // Settings
    autoProvision: boolean,           // Create users automatically
    defaultRole: string,              // Role for new users
    allowedDomains: string[],         // Email domains allowed
    enforceSSO: boolean               // Disable password login
  }
}
```

#### Implementation Steps

1. **Choose SSO library**
   - Option A: Firebase Auth with custom providers
   - Option B: Auth0 / WorkOS integration
   - Option C: Implement SAML/OIDC directly

   **Recommendation:** Use WorkOS or Auth0 for enterprise SSO - they handle the complexity

2. **SSO Configuration UI**
   - Settings page for SSO setup
   - Provider selection
   - Configuration fields (varies by provider)
   - Test connection button
   - Enable/disable toggle

3. **Login Flow Updates**
   - Detect organization from email domain
   - Redirect to SSO if enabled
   - Handle SSO callback
   - Create/update user on successful auth
   - Assign default role

4. **User Provisioning**
   - Auto-create users on first SSO login
   - Sync user attributes (name, email)
   - Optional: SCIM provisioning for user lifecycle

5. **Security Considerations**
   - Enforce SSO option (disable password login)
   - Session timeout policies
   - Re-authentication for sensitive actions

#### Acceptance Criteria
- [ ] Admin can configure SSO provider
- [ ] Users can login via SSO
- [ ] New users auto-provisioned on first login
- [ ] Can enforce SSO-only authentication
- [ ] Works with Google Workspace
- [ ] Works with Microsoft Entra ID

---

## Phase 3: Market Expansion
**Duration:** 4-6 months
**Goal:** Enable broader market adoption and sticky integrations

---

### 3.1 Full Offline Sync
**Priority:** High
**Estimated Effort:** 4-5 weeks

#### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
├─────────────────────────────────────────────────────┤
│  React App                                          │
│    ├── Online Mode: Direct Firestore access        │
│    └── Offline Mode: IndexedDB → Sync Queue        │
├─────────────────────────────────────────────────────┤
│  Service Worker                                      │
│    ├── Cache static assets                          │
│    ├── Queue failed requests                        │
│    └── Background sync                              │
├─────────────────────────────────────────────────────┤
│  IndexedDB                                          │
│    ├── Cached data (projects, equipment, etc.)     │
│    ├── Pending changes queue                        │
│    └── Conflict tracking                           │
└─────────────────────────────────────────────────────┘
```

#### Implementation Steps

1. **Set up Service Worker**
   - Cache static assets (JS, CSS, images)
   - Cache API responses
   - Intercept failed requests
   - Background sync when online

2. **IndexedDB Data Layer**
   ```javascript
   // src/lib/offlineDb.js
   import { openDB } from 'idb'

   const db = await openDB('aeria-ops', 1, {
     upgrade(db) {
       // Cached data stores
       db.createObjectStore('projects', { keyPath: 'id' })
       db.createObjectStore('equipment', { keyPath: 'id' })
       db.createObjectStore('operators', { keyPath: 'id' })
       db.createObjectStore('forms', { keyPath: 'id' })

       // Sync queue
       db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })

       // Metadata
       db.createObjectStore('meta', { keyPath: 'key' })
     }
   })
   ```

3. **Sync Queue Management**
   ```javascript
   // Queue changes when offline
   export async function queueChange(operation) {
     const db = await getDb()
     await db.add('syncQueue', {
       ...operation,
       timestamp: Date.now(),
       status: 'pending'
     })
   }

   // Process queue when online
   export async function processSyncQueue() {
     const db = await getDb()
     const queue = await db.getAll('syncQueue')

     for (const item of queue) {
       try {
         await processQueueItem(item)
         await db.delete('syncQueue', item.id)
       } catch (error) {
         if (isConflict(error)) {
           await handleConflict(item, error)
         } else {
           throw error
         }
       }
     }
   }
   ```

4. **Conflict Resolution UI**
   - Detect conflicts (server changed while offline)
   - Show conflict resolution modal
   - Options: Keep mine, Keep server, Merge
   - Apply resolution and continue sync

5. **Offline Indicators**
   - Show offline banner when disconnected
   - Show sync status (pending changes count)
   - Show last sync time
   - Manual sync button

6. **PWA Manifest**
   ```json
   {
     "name": "Aeria Ops",
     "short_name": "Aeria",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#1e3a5f",
     "icons": [...]
   }
   ```

#### Acceptance Criteria
- [ ] App loads when offline
- [ ] Can view cached data offline
- [ ] Can create/edit forms offline
- [ ] Changes sync when back online
- [ ] Conflicts detected and resolvable
- [ ] Offline status clearly indicated
- [ ] Can install as PWA

---

### 3.2 Subcontractor Management
**Priority:** Medium
**Estimated Effort:** 3-4 weeks

#### Data Model

```javascript
// New Collection: subcontractors
{
  id: string,
  organizationId: string,

  // Company Info
  companyName: string,
  contactName: string,
  email: string,
  phone: string,
  address: string,

  // Compliance Documents
  documents: [{
    id: string,
    type: 'insurance_coi' | 'wcb_clearance' | 'license' | 'certification' | 'contract' | 'other',
    name: string,
    fileUrl: string,
    expiryDate: Timestamp | null,
    status: 'valid' | 'expiring' | 'expired' | 'pending',
    uploadedAt: Timestamp,
    verifiedBy: string | null,
    verifiedAt: Timestamp | null
  }],

  // Portal Access
  portalAccess: {
    enabled: boolean,
    email: string,
    lastLoginAt: Timestamp | null
  },

  // Relationship
  status: 'active' | 'inactive' | 'pending_approval',
  approvedBy: string | null,
  approvedAt: Timestamp | null,

  // Rates
  defaultRates: [{
    serviceType: string,
    rate: number,
    unit: 'hour' | 'day' | 'job'
  }],

  // Performance
  rating: number,                     // 1-5
  completedProjects: number,
  notes: string,

  createdAt: Timestamp,
  updatedAt: Timestamp
}

// New Collection: subcontractorAssignments
{
  id: string,
  subcontractorId: string,
  projectId: string,

  // Scope
  scope: string,
  startDate: Timestamp,
  endDate: Timestamp,

  // Financials
  agreedRate: number,
  rateUnit: 'hour' | 'day' | 'fixed',
  estimatedTotal: number,
  actualTotal: number,

  // Status
  status: 'pending' | 'active' | 'completed' | 'cancelled',

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Subcontractors.jsx` | Subcontractor list and management |
| `src/pages/SubcontractorDetail.jsx` | View/edit subcontractor |
| `src/components/subcontractors/SubcontractorForm.jsx` | Add/edit subcontractor |
| `src/components/subcontractors/DocumentUpload.jsx` | Upload compliance docs |
| `src/components/subcontractors/ComplianceStatus.jsx` | Document expiry status |
| `src/components/subcontractors/AssignToProject.jsx` | Assign sub to project |
| `src/components/projects/ProjectSubcontractors.jsx` | Subs on a project |

#### Implementation Steps

1. **Subcontractor CRUD**
   - Add/edit subcontractor companies
   - Track contact information
   - Set default rates

2. **Document Management**
   - Upload insurance certificates, licenses
   - Track expiry dates
   - Auto-status based on expiry
   - Verification workflow

3. **Compliance Dashboard**
   - List subs with compliance status
   - Expiring documents alert
   - Filter by status

4. **Project Assignment**
   - Assign subcontractor to project
   - Define scope and rates
   - Track assignment status

5. **Subcontractor Portal (Extension of Client Portal)**
   - View assigned projects
   - Upload documents
   - Submit time/work completed
   - View payments

#### Acceptance Criteria
- [ ] Can add/manage subcontractors
- [ ] Can upload compliance documents
- [ ] Expiry alerts for documents
- [ ] Can assign subs to projects
- [ ] Subs can access portal (optional)

---

### 3.3 Industry Templates
**Priority:** Medium
**Estimated Effort:** 4-5 weeks

#### Template Structure

Each industry package includes:
- Project templates
- Form templates
- Checklist templates
- Compliance document templates
- Default equipment categories
- Default service offerings
- Industry-specific terminology

#### Packages to Create

**1. Pipeline Inspection Package**
```javascript
{
  id: 'pipeline-inspection',
  name: 'Pipeline Inspection',
  industries: ['oil_gas', 'utilities'],

  projectTemplates: [
    'ILI Data Analysis',
    'Visual Pipeline Inspection',
    'Leak Detection Survey',
    'ROW Patrol'
  ],

  formTemplates: [
    'Pipeline Anomaly Report',
    'Leak Detection Log',
    'ROW Condition Report',
    'Excavation Permit'
  ],

  equipmentCategories: [
    'Inspection Vehicles',
    'Leak Detection Equipment',
    'GPS/Survey Equipment',
    'Safety Equipment'
  ],

  complianceItems: [
    'Pipeline Operator Qualification',
    'OQ Training Records',
    'Drug & Alcohol Program'
  ]
}
```

**2. Environmental Consulting Package**
```javascript
{
  id: 'environmental',
  name: 'Environmental Consulting',
  industries: ['environmental', 'consulting'],

  projectTemplates: [
    'Phase I ESA',
    'Phase II ESA',
    'Contaminated Site Assessment',
    'Wildlife Survey',
    'Wetland Delineation'
  ],

  formTemplates: [
    'Sample Chain of Custody',
    'Field Observation Log',
    'Wildlife Observation Form',
    'Soil Sample Log',
    'Groundwater Sample Log'
  ],

  equipmentCategories: [
    'Sampling Equipment',
    'Monitoring Equipment',
    'Survey Equipment',
    'PPE'
  ]
}
```

**3. Survey Package**
```javascript
{
  id: 'surveying',
  name: 'Land Surveying',
  industries: ['surveying', 'construction'],

  projectTemplates: [
    'Boundary Survey',
    'Topographic Survey',
    'Construction Staking',
    'As-Built Survey',
    'ALTA/NSPS Survey'
  ],

  formTemplates: [
    'Field Notes',
    'Control Point Log',
    'Monument Record',
    'Photo Log'
  ],

  equipmentCategories: [
    'Total Stations',
    'GPS/GNSS Receivers',
    'Data Collectors',
    'Drones/UAV',
    'Support Equipment'
  ]
}
```

**4. Utility Construction Package**
```javascript
{
  id: 'utility-construction',
  name: 'Utility Construction',
  industries: ['telecom', 'utilities', 'construction'],

  projectTemplates: [
    'Fiber Installation',
    'Pole Replacement',
    'Underground Conduit',
    'Service Drop Installation',
    'Network Upgrade'
  ],

  formTemplates: [
    'Daily Construction Log',
    'Utility Locate Request',
    'Permit Application',
    'Quality Inspection',
    'As-Built Documentation'
  ],

  equipmentCategories: [
    'Construction Equipment',
    'Splicing Equipment',
    'Testing Equipment',
    'Vehicles',
    'Safety Equipment'
  ]
}
```

#### Implementation Steps

1. **Template Data Structure**
   - Define template schema
   - Store templates in Firestore (or static JSON)
   - Version templates for updates

2. **Template Selection UI**
   - Industry selector during onboarding
   - Template browser in settings
   - Preview templates before applying

3. **Template Application**
   - Copy template items to user's organization
   - Allow customization after applying
   - Don't overwrite existing customizations

4. **Template Management (Admin)**
   - Create/edit templates
   - Publish new versions
   - Track template usage

#### Acceptance Criteria
- [ ] User can select industry during onboarding
- [ ] Templates populate relevant forms/checklists
- [ ] User can customize after applying template
- [ ] Can apply additional templates later
- [ ] Templates don't overwrite user customizations

---

### 3.4 Integrations
**Priority:** Medium
**Estimated Effort:** 4-6 weeks

#### Priority Integrations

| Integration | Type | Value |
|-------------|------|-------|
| QuickBooks Online | Accounting | Sync invoices, payments |
| Xero | Accounting | Sync invoices, payments |
| Google Calendar | Scheduling | Sync project dates, deadlines |
| Outlook/Microsoft 365 | Scheduling | Sync project dates, deadlines |
| Zapier | Automation | Connect to 5000+ apps |

#### QuickBooks Integration

**Scope:**
- Push invoices to QuickBooks
- Sync customers (clients)
- Pull payment status
- Sync chart of accounts (for line item categorization)

**Implementation:**
1. OAuth2 connection flow
2. Customer sync (Aeria clients ↔ QB customers)
3. Invoice push (Aeria invoice → QB invoice)
4. Payment webhook (QB payment → update Aeria)
5. Disconnect/reconnect flow

#### Google Calendar Integration

**Scope:**
- Sync project milestones to calendar
- Sync maintenance due dates
- Sync training sessions
- Sync certification expiries

**Implementation:**
1. OAuth2 connection flow
2. Select which calendars to sync to
3. Choose what to sync (projects, maintenance, etc.)
4. Two-way sync option
5. Conflict handling

#### Zapier Integration

**Scope:**
- Triggers: Project created, Invoice sent, Form submitted, etc.
- Actions: Create project, Add equipment, etc.

**Implementation:**
1. Create Zapier app
2. Define triggers and actions
3. Webhook infrastructure
4. API endpoints for Zapier
5. Authentication (API keys)

#### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/settings/Integrations.jsx` | Integration settings page |
| `src/lib/integrations/quickbooks.js` | QuickBooks API client |
| `src/lib/integrations/xero.js` | Xero API client |
| `src/lib/integrations/googleCalendar.js` | Google Calendar API client |
| `src/components/integrations/QuickBooksSetup.jsx` | QB connection UI |
| `src/components/integrations/CalendarSetup.jsx` | Calendar connection UI |

#### Acceptance Criteria
- [ ] Can connect QuickBooks account
- [ ] Invoices sync to QuickBooks
- [ ] Payments sync back from QuickBooks
- [ ] Can connect Google Calendar
- [ ] Project dates appear in calendar
- [ ] Can disconnect integrations cleanly

---

## Phase 4: Scale
**Duration:** Ongoing
**Goal:** Enterprise features and platform expansion

---

### 4.1 White-Label / Partner Program
- Custom branding per organization
- Custom domains (client.aeriaops.com)
- Reseller/partner portal
- Revenue sharing infrastructure

### 4.2 Mobile Native App
- iOS app (React Native or native Swift)
- Android app (React Native or native Kotlin)
- Push notifications
- Camera integration for inspections
- GPS tracking
- Offline-first architecture

### 4.3 Advanced Analytics
- Cross-project reporting
- Equipment utilization dashboards
- Profitability analysis by project/client
- Safety trend analysis
- Custom report builder
- Scheduled report delivery

### 4.4 API & Developer Platform
- Public REST API
- API documentation
- API keys management
- Webhooks for events
- SDKs (JavaScript, Python)
- Developer portal

---

## Implementation Timeline

```
Month 1-2:   Invoicing Module
Month 2-3:   Time Tracking
Month 3-4:   Client Portal (Basic)
Month 4-5:   Multi-Tenancy / Organizations
Month 5-6:   Role-Based Access Control
Month 6-7:   Audit Logging + SSO
Month 7-9:   Full Offline Sync
Month 9-10:  Subcontractor Management
Month 10-12: Industry Templates
Month 12-14: Integrations (QuickBooks, Calendar)
Month 14+:   Phase 4 (Scale)
```

---

## Technical Considerations

### Database Migration (Firebase → Supabase)

Consider migrating to Supabase for:
- Better multi-tenancy with PostgreSQL
- Row-level security (RLS) for data isolation
- Built-in auth with SSO support
- Real-time subscriptions
- Edge functions
- Better enterprise compliance

**Migration Strategy:**
1. Build new features on Supabase
2. Create sync layer between Firebase and Supabase
3. Migrate data collection by collection
4. Update UI to use Supabase
5. Deprecate Firebase

### Performance Optimization

- Implement pagination on all list views
- Add caching layer (React Query)
- Lazy load routes and components
- Optimize bundle size (code splitting)
- CDN for static assets

### Testing Strategy

- Unit tests for utility functions
- Integration tests for API/data layer
- E2E tests for critical flows (Playwright)
- Performance testing for scale
- Security testing (penetration testing)

---

## Success Metrics

### Phase 1 Success
- 50% of projects have invoices generated
- Average time to invoice < 24 hours after project completion
- Time tracking adoption > 70% of operators

### Phase 2 Success
- 3+ enterprise clients onboarded
- SSO enabled for enterprise clients
- Zero data leakage incidents

### Phase 3 Success
- Offline usage > 20% of form submissions
- 5+ subcontractors managed per enterprise client
- 3+ industry templates in use

### Phase 4 Success
- 10+ API integrations active
- Mobile app > 30% of usage
- Partner revenue > 20% of total

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Scope creep | Strict phase boundaries, MVP for each feature |
| Technical debt | Refactor as you go, maintain test coverage |
| Enterprise sales cycle | Start POCs early, build relationships |
| Competition | Focus on compliance differentiation |
| Offline complexity | Use proven libraries (idb, workbox) |
| Integration maintenance | Use middleware layer, version APIs |

---

## Next Steps

1. **Validate priorities with users**
   - Survey current users on most-wanted features
   - Interview potential enterprise customers
   - Confirm industry expansion targets

2. **Technical architecture review**
   - Finalize Firebase vs Supabase decision
   - Design multi-tenancy data model
   - Plan offline sync architecture

3. **Start Phase 1**
   - Begin invoicing module design
   - Create detailed technical specs
   - Set up development environment

4. **Build team (if needed)**
   - Identify skill gaps
   - Plan hiring or contracting
   - Establish development processes
