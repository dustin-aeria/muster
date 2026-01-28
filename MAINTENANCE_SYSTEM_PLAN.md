# Preventative Maintenance System - Implementation Plan

## Overview

A comprehensive maintenance tracking system that pulls from Equipment and Fleet libraries, tracks maintenance schedules, logs service history, and provides dashboard visibility into maintenance status across all assets.

**Key Integration: Forms System**
The existing Forms system will be the backbone for maintenance data collection. Maintenance schedules will link to form templates, and completing maintenance means filling out the associated form. This provides:
- Standardized checklists and inspections
- Photo/signature capture
- GPS location logging
- Complete audit trail
- Consistent data collection

---

## Forms Integration Strategy

### Existing Forms Infrastructure
The app already has a robust Forms system with:
- **20+ field types**: text, number, date, dropdowns, checkboxes, yes/no, photos, signatures, GPS, risk matrix, etc.
- **Form templates**: Reusable templates stored in `formTemplates` collection
- **Form submissions**: Completed forms stored in `formSubmissions` collection
- **Pre-built inspection form**: "Equipment Inspection (Pre-flight Checklist)" already exists

### How Forms Integrate with Maintenance

```
┌─────────────────────────────────────────────────────────────┐
│                    MAINTENANCE SCHEDULE                      │
│  "100-Hour Inspection"                                       │
│  - Interval: Every 100 flight hours                         │
│  - Form Template: "100-Hour Aircraft Inspection Form"  ───┐  │
│  - Warning: 10 hours before                                │  │
└─────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     FORM TEMPLATE                            │
│  "100-Hour Aircraft Inspection Form"                        │
│  Fields:                                                    │
│  - Aircraft (linked dropdown)                               │
│  - Current Hours Reading                                    │
│  - Airframe Inspection (checklist)                         │
│  - Motor Inspection (checklist)                            │
│  - Battery Check (checklist)                               │
│  - Issues Found (repeatable section)                       │
│  - Photos                                                   │
│  - Technician Signature                                     │
│  - Airworthy Sign-off (yes/no)                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
                            User fills out form               │
                                                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   FORM SUBMISSION                            │
│  Becomes the MAINTENANCE RECORD                             │
│  - Links to equipment/aircraft item                         │
│  - Links to maintenance schedule                            │
│  - Contains all checklist responses                         │
│  - Has photos, signature, GPS                               │
│  - Triggers: Update item's maintenance status               │
└─────────────────────────────────────────────────────────────┘
```

### Extended Form Submission Fields
Add to existing `formSubmissions` collection:
```javascript
{
  // Existing fields...

  // NEW: Maintenance linking
  linkedItemId: string | null,        // Equipment or Aircraft ID
  linkedItemType: 'equipment' | 'aircraft' | null,
  linkedItemName: string | null,      // Denormalized
  maintenanceScheduleId: string | null,
  maintenanceScheduleName: string | null,

  // NEW: Meter readings captured
  hoursAtSubmission: number | null,
  cyclesAtSubmission: number | null,

  // NEW: Maintenance outcome
  maintenanceType: 'scheduled' | 'unscheduled' | 'inspection' | 'repair' | null,
  itemPassedInspection: boolean | null,
  nextServiceDue: timestamp | null
}
```

### New Maintenance Form Templates to Create
1. **Pre-Flight Inspection** (enhance existing)
2. **Post-Flight Inspection**
3. **100-Hour Aircraft Inspection**
4. **Annual Aircraft Inspection**
5. **Equipment Service Record**
6. **Vehicle Maintenance Log**
7. **Battery Cycle Log**
8. **Grounding/Return to Service Form**

---

## Phase 1: Data Model & Firestore Functions
**Delivers:** Core data structures and database operations

### New Firestore Collections

#### `maintenanceSchedules` Collection
Defines maintenance schedule templates that can be applied to items.
```javascript
{
  id: string,
  name: string,                    // "100-Hour Inspection", "Annual Service"
  description: string,
  itemType: 'equipment' | 'aircraft',
  category: string | null,         // Optional: specific to equipment category
  intervalType: 'days' | 'hours' | 'cycles' | 'flights',
  intervalValue: number,
  warningThreshold: number,        // Days/hours/cycles before due to warn
  criticalThreshold: number,       // Days/hours/cycles before due = critical

  // FORM INTEGRATION - Link to form template
  formTemplateId: string | null,   // Links to formTemplates collection
  formTemplateName: string | null, // Denormalized for display
  requiresForm: boolean,           // true = must complete form to log service

  // Legacy tasks (for schedules without forms, or additional tasks)
  tasks: [
    {
      id: string,
      name: string,
      description: string,
      required: boolean
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `maintenanceRecords` Collection
Individual maintenance events/logs. **When a form is required, this record is auto-generated from the form submission.**
```javascript
{
  id: string,
  itemId: string,                  // Reference to equipment or aircraft
  itemType: 'equipment' | 'aircraft',
  itemName: string,                // Denormalized for quick display
  scheduleId: string | null,       // Reference to schedule (null if ad-hoc)
  scheduleName: string | null,

  // FORM INTEGRATION - Link to completed form
  formSubmissionId: string | null, // Links to formSubmissions collection
  formTemplateId: string | null,   // Which template was used
  formTemplateName: string | null, // Denormalized for display

  // Service details
  serviceType: 'scheduled' | 'unscheduled' | 'repair' | 'inspection',
  serviceDate: timestamp,
  completedBy: string,             // User ID
  completedByName: string,         // Denormalized

  // Meter readings at time of service
  hoursAtService: number | null,
  cyclesAtService: number | null,
  flightsAtService: number | null,

  // Tasks completed (legacy - used when no form attached)
  tasksCompleted: [
    {
      taskId: string,
      name: string,
      completed: boolean,
      notes: string
    }
  ],

  // Parts & costs (can be extracted from form or entered manually)
  partsUsed: [
    {
      name: string,
      partNumber: string,
      quantity: number,
      cost: number
    }
  ],
  laborHours: number,
  laborCost: number,
  partsCost: number,
  totalCost: number,

  // Documentation
  notes: string,
  findings: string,
  attachments: [
    {
      name: string,
      url: string,
      type: string
    }
  ],

  // Status
  status: 'completed' | 'in_progress' | 'scheduled',

  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `maintenanceItems` Subcollection (on equipment/aircraft)
Tracks maintenance state per item. Alternative: extend equipment/aircraft documents directly.

### Extended Equipment Fields
Add to existing equipment documents:
```javascript
{
  // Existing fields...

  // New maintenance tracking
  maintenanceScheduleIds: string[],     // Applied schedules
  currentHours: number,                  // Operating hours
  currentCycles: number,                 // Usage cycles

  // Per-schedule tracking
  maintenanceStatus: {
    [scheduleId]: {
      lastServiceDate: timestamp,
      lastServiceHours: number,
      lastServiceCycles: number,
      nextDueDate: timestamp,
      nextDueHours: number,
      nextDueCycles: number,
      status: 'ok' | 'due_soon' | 'overdue'
    }
  },

  // Grounding/lockout
  isGrounded: boolean,
  groundedReason: string,
  groundedDate: timestamp,
  groundedBy: string
}
```

### Extended Aircraft Fields
Add to existing aircraft documents:
```javascript
{
  // Existing fields...

  // Make existing fields editable
  totalFlightHours: number,
  totalCycles: number,
  lastInspection: timestamp,
  nextInspectionDue: timestamp,

  // New maintenance tracking
  maintenanceScheduleIds: string[],
  firmwareVersion: string,

  // Per-schedule tracking (same as equipment)
  maintenanceStatus: { ... },

  // Grounding/lockout
  isGrounded: boolean,
  groundedReason: string,
  groundedDate: timestamp,
  groundedBy: string
}
```

### New Firestore Functions
```javascript
// Maintenance Schedules
createMaintenanceSchedule(data)
updateMaintenanceSchedule(id, data)
deleteMaintenanceSchedule(id)
getMaintenanceSchedules(filters)
getMaintenanceScheduleById(id)

// Maintenance Records
createMaintenanceRecord(data)
updateMaintenanceRecord(id, data)
deleteMaintenanceRecord(id)
getMaintenanceRecords(filters)  // by itemId, itemType, dateRange
getMaintenanceRecordById(id)

// Item Maintenance Operations
applyScheduleToItem(itemId, itemType, scheduleId)
removeScheduleFromItem(itemId, itemType, scheduleId)
recordMaintenance(itemId, itemType, recordData)
updateItemMeters(itemId, itemType, { hours, cycles, flights })
groundItem(itemId, itemType, reason, groundedBy)
ungroundItem(itemId, itemType, clearedBy, notes)

// Dashboard Queries
getMaintenanceDashboardStats()
getItemsDueSoon(daysAhead, itemType?)
getOverdueItems(itemType?)
getUpcomingMaintenance(daysAhead)
getMaintenanceHistory(itemId, itemType)
```

### Files Created/Modified
| File | Action | Purpose |
|------|--------|---------|
| `src/lib/firestoreMaintenance.js` | CREATE | All maintenance Firestore functions |
| `src/lib/firestore.js` | MODIFY | Add equipment/aircraft maintenance field updates |

### Dependencies
- None (foundational phase)

### Testable After Phase 1
- Create/edit/delete maintenance schedules via Firebase console
- Create maintenance records via Firebase console
- Query functions return correct data

---

## Phase 2: Maintenance Dashboard Page
**Delivers:** Main dashboard with KPIs and status overview

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Preventative Maintenance                    [+ Log Service] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│ │ Total   │ │ Due     │ │ Overdue │ │ Grounded│            │
│ │ Items   │ │ Soon    │ │         │ │         │            │
│ │   47    │ │   8     │ │   2     │ │   1     │            │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ Items Requiring Attention                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 M300 RTK - 100hr inspection OVERDUE (5 days)        │ │
│ │ 🔴 Generator #2 - Annual service OVERDUE (2 days)      │ │
│ │ 🟡 L1 LiDAR - Calibration due in 12 days               │ │
│ │ 🟡 Truck F150 - Oil change due in 18 days              │ │
│ └─────────────────────────────────────────────────────────┘ │
├──────────────────────────┬──────────────────────────────────┤
│ Quick Actions            │ Recent Maintenance               │
│ • Log Equipment Service  │ • M300 RTK - Pre-flight (Today)  │
│ • Log Aircraft Service   │ • Battery Pack #3 - Cycle (Yest) │
│ • View All Schedules     │ • Truck - Oil Change (3 days ago)│
│ • Maintenance Calendar   │                                  │
└──────────────────────────┴──────────────────────────────────┘
```

### Components
- `MaintenanceDashboard.jsx` - Main page component
- `MaintenanceStatCard.jsx` - KPI stat cards
- `MaintenanceAlertList.jsx` - Items needing attention
- `RecentMaintenanceList.jsx` - Recent service activity

### Files Created/Modified
| File | Action | Purpose |
|------|--------|---------|
| `src/pages/MaintenanceDashboard.jsx` | CREATE | Main dashboard page |
| `src/components/maintenance/MaintenanceStatCard.jsx` | CREATE | Stat card component |
| `src/components/maintenance/MaintenanceAlertList.jsx` | CREATE | Alert list component |
| `src/components/maintenance/RecentMaintenanceList.jsx` | CREATE | Recent activity list |
| `src/components/Layout.jsx` | MODIFY | Add navigation item |
| `src/App.jsx` | MODIFY | Add route |

### Dependencies
- Phase 1 (Firestore functions)

### Testable After Phase 2
- Navigate to Maintenance from sidebar
- View dashboard with stats loading from real data
- See items due soon and overdue
- See recent maintenance activity

---

## Phase 3: Maintenance Item List & Filters
**Delivers:** Searchable, filterable list of all maintainable items

### List View Layout
```
┌─────────────────────────────────────────────────────────────┐
│ All Maintainable Items                                      │
├─────────────────────────────────────────────────────────────┤
│ [Search...        ] [Type ▾] [Status ▾] [Category ▾]       │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🛩️ M300 RTK                              🔴 OVERDUE    │ │
│ │ Aircraft • DJI Matrice 300 • 142.5 hrs                 │ │
│ │ Next: 100hr Inspection (5 days overdue)                │ │
│ │                              [View] [Log Service]      │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔧 Generator #2                          🟡 DUE SOON   │ │
│ │ Equipment • Power • Honda EU2200i                      │ │
│ │ Next: Annual Service (in 12 days)                      │ │
│ │                              [View] [Log Service]      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Filters
- **Type**: All, Equipment, Aircraft
- **Status**: All, OK, Due Soon, Overdue, Grounded
- **Category**: All, or specific equipment categories
- **Search**: Name, serial number, model

### Components
- `MaintenanceItemList.jsx` - Main list page
- `MaintenanceItemCard.jsx` - Individual item card
- `MaintenanceFilters.jsx` - Filter controls

### Files Created/Modified
| File | Action | Purpose |
|------|--------|---------|
| `src/pages/MaintenanceItemList.jsx` | CREATE | Item list page |
| `src/components/maintenance/MaintenanceItemCard.jsx` | CREATE | Item card component |
| `src/components/maintenance/MaintenanceFilters.jsx` | CREATE | Filter controls |

### Dependencies
- Phase 1 (Firestore functions)
- Phase 2 (Navigation in place)

### Testable After Phase 3
- View all equipment and aircraft in unified list
- Filter by type, status, category
- Search by name/serial
- See maintenance status on each item

---

## Phase 4: Maintenance Record Logging (Form-Integrated)
**Delivers:** Form-based maintenance logging with automatic record creation

### How It Works

When user clicks "Log Service" on an item:

1. **Schedule Selection Modal** opens first
2. User selects which maintenance schedule they're completing
3. **If schedule has linked form template:**
   - Opens Form Filler (existing component) pre-populated with item context
   - Form includes all checklist items, photo captures, signatures, etc.
   - On form submission → auto-creates maintenance record linked to form
4. **If schedule has NO linked form (legacy/simple):**
   - Opens simple Log Maintenance Modal for manual entry

### Schedule Selection Modal
```
┌─────────────────────────────────────────────────────────────┐
│ Log Maintenance for M300 RTK                         [X]    │
├─────────────────────────────────────────────────────────────┤
│ Select the maintenance being performed:                     │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ○ 100-Hour Inspection                                   │ │
│ │   Every 100 hrs • 📋 Requires form completion           │ │
│ │   Status: 🔴 OVERDUE by 5 hours                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ○ Annual Inspection                                     │ │
│ │   Every 365 days • 📋 Requires form completion          │ │
│ │   Status: 🟢 353 days remaining                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ○ Ad-hoc / Unscheduled Maintenance                     │ │
│ │   Log repair, damage, or other unscheduled service     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                              [Cancel] [Start Maintenance]   │
└─────────────────────────────────────────────────────────────┘
```

### Form Filler Flow (When Form Required)
```
┌─────────────────────────────────────────────────────────────┐
│ 100-Hour Aircraft Inspection                         [X]    │
├─────────────────────────────────────────────────────────────┤
│ ▸ Pre-filled Context                                        │
│   Aircraft: M300 RTK (auto-filled)                         │
│   Current Hours: 142.5 (auto-filled)                       │
│   Schedule: 100-Hour Inspection (auto-filled)              │
├─────────────────────────────────────────────────────────────┤
│ ▸ Inspection Checklist                                      │
│   ☐ Airframe visual inspection                             │
│   ☐ Propeller condition check                              │
│   ☐ Motor inspection                                        │
│   ☐ Landing gear inspection                                │
│   ...                                                       │
├─────────────────────────────────────────────────────────────┤
│ ▸ Issues Found (Repeatable)                                │
│   [+ Add Issue]                                             │
├─────────────────────────────────────────────────────────────┤
│ ▸ Parts Replaced                                            │
│   [+ Add Part]                                              │
├─────────────────────────────────────────────────────────────┤
│ ▸ Photo Documentation                                       │
│   [📷 Take/Upload Photos]                                   │
├─────────────────────────────────────────────────────────────┤
│ ▸ Sign-Off                                                  │
│   Aircraft Airworthy: ○ Yes  ○ No (requires comment)       │
│   Technician Signature: [____________]                      │
│                                                             │
│                                      [Cancel] [Submit Form] │
└─────────────────────────────────────────────────────────────┘
```

### Legacy Log Modal (When No Form)
Simple manual entry for schedules without forms:
```
┌─────────────────────────────────────────────────────────────┐
│ Log Maintenance Service                              [X]    │
├─────────────────────────────────────────────────────────────┤
│ Item: M300 RTK (DJI Matrice 300)                           │
│ Schedule: Oil Change (manual entry)                        │
│                                                             │
│ Service Date: [2025-01-27    ]                             │
│ Completed By: [Dustin Wales ▾]                             │
│                                                             │
│ ─── Meter Readings ───                                     │
│ Hours:  [142.5] Cycles: [89] Flights: [156]               │
│                                                             │
│ ─── Parts & Labor ───                                      │
│ [+ Add Part]                                               │
│ Labor Hours: [1.5] Rate: [$75/hr]                         │
│                                                             │
│ ─── Notes ───                                              │
│ [                                                    ]     │
│                                                             │
│ ─── Attachments ───                                        │
│ [Upload Receipt/Documentation]                             │
│                                                             │
│ Total Cost: $201.50                                        │
│                                   [Cancel] [Save Record]   │
└─────────────────────────────────────────────────────────────┘
```

### Auto-Record Creation Logic
When a form submission is completed with maintenance linking:
```javascript
// On form submission with maintenance context
async function onMaintenanceFormSubmitted(formSubmission) {
  // Create maintenance record automatically
  const maintenanceRecord = {
    itemId: formSubmission.linkedItemId,
    itemType: formSubmission.linkedItemType,
    itemName: formSubmission.linkedItemName,
    scheduleId: formSubmission.maintenanceScheduleId,
    scheduleName: formSubmission.maintenanceScheduleName,

    // Link to form
    formSubmissionId: formSubmission.id,
    formTemplateId: formSubmission.templateId,
    formTemplateName: formSubmission.templateName,

    // Extract from form fields
    serviceDate: formSubmission.submittedAt,
    completedBy: formSubmission.submittedBy,
    completedByName: formSubmission.submittedByName,
    hoursAtService: formSubmission.hoursAtSubmission,
    cyclesAtService: formSubmission.cyclesAtSubmission,

    // Extract from form responses (field mappings)
    findings: extractFindingsFromForm(formSubmission),
    partsUsed: extractPartsFromForm(formSubmission),

    status: 'completed',
    serviceType: 'scheduled'
  }

  await createMaintenanceRecord(maintenanceRecord)
  await updateItemMaintenanceStatus(itemId, itemType, scheduleId)
}
```

### Components
- `SelectScheduleModal.jsx` - Schedule selection before logging
- `LogMaintenanceModal.jsx` - Legacy manual entry modal
- `MaintenanceFormLauncher.jsx` - Opens form filler with maintenance context
- `PartsUsedEditor.jsx` - Parts entry section (shared)
- `AttachmentUploader.jsx` - File upload component (shared)

### Files Created/Modified
| File | Action | Purpose |
|------|--------|---------|
| `src/components/maintenance/SelectScheduleModal.jsx` | CREATE | Schedule selection modal |
| `src/components/maintenance/LogMaintenanceModal.jsx` | CREATE | Legacy manual logging modal |
| `src/components/maintenance/MaintenanceFormLauncher.jsx` | CREATE | Launch form with context |
| `src/components/maintenance/PartsUsedEditor.jsx` | CREATE | Parts entry |
| `src/components/maintenance/AttachmentUploader.jsx` | CREATE | File uploads |
| `src/lib/firestoreMaintenance.js` | MODIFY | Add form-to-record logic |
| `src/components/forms/FormFiller.jsx` | MODIFY | Handle maintenance context pre-fill |

### Dependencies
- Phase 1 (Firestore functions)
- Phase 3 (Item list to launch modal from)
- Phase 6A (Form templates must exist)

### Testable After Phase 4
- Open schedule selection from item list
- Select form-based schedule → opens form filler with pre-filled context
- Complete form → maintenance record auto-created
- Select non-form schedule → opens legacy modal
- Item status updates after logging

---

## Phase 5: Item Maintenance Detail View
**Delivers:** Full maintenance history and management for single item

### Detail View Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to List                                              │
│                                                             │
│ M300 RTK                                    [Log Service]   │
│ DJI Matrice 300 RTK • S/N: 1ZNBJ4R0010234                  │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Flight Hours │ │ Cycles       │ │ Status       │         │
│ │    142.5     │ │     89       │ │  🔴 OVERDUE  │         │
│ │ [Update]     │ │ [Update]     │ │              │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
├─────────────────────────────────────────────────────────────┤
│ Applied Maintenance Schedules                [+ Add]       │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 100-Hour Inspection          Every 100 hours           ││
│ │ Last: 98.2 hrs (Jan 10)      Next: 198.2 hrs          ││
│ │ Status: 🔴 44.3 hrs OVERDUE                   [Remove] ││
│ └─────────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Annual Inspection            Every 365 days            ││
│ │ Last: Jan 15, 2025           Next: Jan 15, 2026       ││
│ │ Status: 🟢 353 days remaining                 [Remove] ││
│ └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ Maintenance History                                        │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Jan 10, 2025 - 100-Hour Inspection                     ││
│ │ Completed by: Dustin Wales • 98.2 hrs                  ││
│ │ Cost: $201.50 • Tasks: 4/4 complete           [View]   ││
│ └─────────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Dec 5, 2024 - Pre-Season Inspection                    ││
│ │ Completed by: Dustin Wales • 45.0 hrs                  ││
│ │ Cost: $0.00 • Tasks: 8/8 complete             [View]   ││
│ └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ [🔒 Ground This Item]                                      │
└─────────────────────────────────────────────────────────────┘
```

### Components
- `MaintenanceItemDetail.jsx` - Main detail page
- `ItemMeterDisplay.jsx` - Hours/cycles display with edit
- `AppliedSchedulesList.jsx` - Active schedules on item
- `MaintenanceHistoryList.jsx` - Service history
- `GroundItemModal.jsx` - Grounding confirmation

### Files Created/Modified
| File | Action | Purpose |
|------|--------|---------|
| `src/pages/MaintenanceItemDetail.jsx` | CREATE | Item detail page |
| `src/components/maintenance/ItemMeterDisplay.jsx` | CREATE | Meter display/edit |
| `src/components/maintenance/AppliedSchedulesList.jsx` | CREATE | Schedule list |
| `src/components/maintenance/MaintenanceHistoryList.jsx` | CREATE | History list |
| `src/components/maintenance/GroundItemModal.jsx` | CREATE | Grounding modal |
| `src/App.jsx` | MODIFY | Add detail route |

### Dependencies
- Phase 1-4

### Testable After Phase 5
- Navigate to item detail from list
- View and update meter readings
- See all applied schedules with status
- View full maintenance history
- Ground/unground item

---

## Phase 6A: Maintenance Form Templates
**Delivers:** Pre-built form templates for common maintenance tasks

### Purpose
Create standardized form templates that will be linked to maintenance schedules. These ensure consistent data collection, photo documentation, and sign-off procedures.

### Form Templates to Create

#### 1. Pre-Flight Inspection (Aircraft)
**Template Name:** `pre-flight-inspection`
| Section | Field Type | Description |
|---------|------------|-------------|
| Header | Info | Aircraft selection, date, pilot |
| Visual Inspection | Checklist | Airframe, props, motors, battery connectors |
| Systems Check | Checklist | Compass cal, GPS, RTH, camera/payload |
| Battery Status | Number + Checklist | Voltage, cycles, swelling check |
| Weather Assessment | Dropdown + Number | Conditions, wind speed |
| Airworthy Declaration | Yes/No + Signature | Sign-off required |

#### 2. Post-Flight Inspection (Aircraft)
**Template Name:** `post-flight-inspection`
| Section | Field Type | Description |
|---------|------------|-------------|
| Header | Info | Aircraft, flight duration, landing type |
| Post-Flight Checks | Checklist | Props, motors hot spots, unusual sounds |
| Battery Post-Flight | Number | End voltage, flight time on pack |
| Issues Observed | Repeatable | Description, severity, photo upload |
| Flight Data | Number | Flight hours to add, cycles to add |
| Serviceable Status | Yes/No + Signature | Ready for next flight |

#### 3. 100-Hour Aircraft Inspection
**Template Name:** `100-hour-inspection`
| Section | Field Type | Description |
|---------|------------|-------------|
| Header | Info | Aircraft, current hours, inspector |
| Airframe Inspection | Checklist (20+ items) | Frame, arms, screws, cracks |
| Motor Inspection | Checklist | Bearings, ESCs, wiring |
| Propeller Inspection | Checklist | Chips, cracks, balance |
| Battery Assessment | Checklist + Numbers | All batteries, cycles, IR readings |
| Firmware Check | Text + Checklist | Version, update required |
| Parts Replaced | Repeatable | Part name, number, cost |
| Issues Found | Repeatable | Issue, severity, corrective action |
| Photo Documentation | Photos | Required evidence photos |
| Airworthy Sign-off | Yes/No + Signature | Return to service declaration |

#### 4. Annual Aircraft Inspection
**Template Name:** `annual-aircraft-inspection`
Same as 100-hour but expanded with:
- Full sensor calibration verification
- Gimbal inspection and calibration
- Payload mount inspection
- Remote controller inspection
- Complete battery fleet assessment
- Regulatory compliance check

#### 5. Equipment Service Record
**Template Name:** `equipment-service`
| Section | Field Type | Description |
|---------|------------|-------------|
| Header | Info | Equipment selection, date |
| Current Readings | Numbers | Hours, cycles (if applicable) |
| Service Performed | Checklist | Common tasks for category |
| Parts/Consumables | Repeatable | Items used with cost |
| Labor | Numbers | Hours, rate |
| Issues Found | Repeatable | With severity and photos |
| Serviceable Status | Yes/No + Signature | Return to service |

#### 6. Battery Cycle Log
**Template Name:** `battery-cycle-log`
| Section | Field Type | Description |
|---------|------------|-------------|
| Header | Info | Battery ID, date |
| Pre-Flight | Numbers | Starting voltage, IR reading |
| Post-Flight | Numbers | End voltage, flight time |
| Cycle Count | Number | Updated cycle count |
| Condition Check | Checklist | Swelling, damage, connector |
| Status | Dropdown | Good / Monitor / Retire |
| Notes | Text | Observations |

#### 7. Vehicle Maintenance Log
**Template Name:** `vehicle-maintenance`
| Section | Field Type | Description |
|---------|------------|-------------|
| Header | Info | Vehicle, odometer, date |
| Service Type | Dropdown | Oil change, tire rotation, etc. |
| Tasks Completed | Checklist | Service-specific tasks |
| Parts/Fluids | Repeatable | With cost |
| Receipts | Photos | Upload receipts |
| Next Service | Date + Number | Next due date/mileage |
| Technician | Signature | Sign-off |

#### 8. Grounding / Return to Service
**Template Name:** `grounding-rts`
| Section | Field Type | Description |
|---------|------------|-------------|
| Header | Info | Item, date, action type |
| **For Grounding:** | | |
| Reason | Dropdown + Text | Category and description |
| Defect Details | Text + Photos | Full description with evidence |
| Safety Impact | Dropdown | Low/Medium/High/Critical |
| Grounded By | Signature | Authorization |
| **For Return to Service:** | | |
| Corrective Actions | Repeatable | What was done |
| Parts Replaced | Repeatable | With documentation |
| Inspection Completed | Reference | Link to inspection form |
| Verification Checks | Checklist | Post-repair checks |
| RTS Authorization | Signature + Text | Authorized by, position |

### Implementation Approach

**Option A: Manual Template Creation**
- Admin creates templates through Forms management UI
- Templates stored in `formTemplates` collection
- Tag templates with `category: 'maintenance'`

**Option B: Seeded Templates**
- Add seed data script that creates templates on first run
- Templates marked as `isSystem: true` (non-deletable)
- Can be cloned and customized

**Recommended: Option B** - ensures consistency and baseline templates

### Files Created/Modified
| File | Action | Purpose |
|------|--------|---------|
| `src/lib/maintenanceFormTemplates.js` | CREATE | Template definitions |
| `src/lib/seedMaintenanceForms.js` | CREATE | Seed script |
| `src/components/maintenance/MaintenanceFormsAdmin.jsx` | CREATE | Template management UI |

### Dependencies
- Phase 1 (Firestore structure)
- Existing Forms system

### Testable After Phase 6A
- Maintenance form templates appear in Forms list
- Templates can be filled out standalone
- Templates appear in schedule linking dropdown

---

## Phase 6B: Maintenance Schedules Management
**Delivers:** Create and manage maintenance schedule templates with form linking

### Schedule Management Page
```
┌─────────────────────────────────────────────────────────────┐
│ Maintenance Schedules                      [+ New Schedule] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 100-Hour Inspection                    Aircraft         │ │
│ │ Every 100 flight hours • 10hr warning • 0hr critical   │ │
│ │ 📋 Form: 100-Hour Aircraft Inspection                  │ │
│ │ Applied to: 3 aircraft                    [Edit] [Del] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Annual Vehicle Service                   Vehicles       │ │
│ │ Every 365 days • 30 day warning • 7 day critical       │ │
│ │ 📋 Form: Vehicle Maintenance Log                       │ │
│ │ Applied to: 2 equipment                   [Edit] [Del] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Weekly Generator Check                   Equipment      │ │
│ │ Every 7 days • 2 day warning • 0 day critical          │ │
│ │ ✏️ Manual entry (no form)                              │ │
│ │ Applied to: 2 equipment                   [Edit] [Del] │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Schedule Editor Modal (Updated with Form Linking)
```
┌─────────────────────────────────────────────────────────────┐
│ Edit Maintenance Schedule                            [X]    │
├─────────────────────────────────────────────────────────────┤
│ Name: [100-Hour Inspection                        ]        │
│ Description: [Comprehensive inspection every 100 hrs]      │
│                                                             │
│ ─── Applies To ───                                         │
│ Item Type: (○) Aircraft  (○) Equipment                     │
│ Category:  [All Categories ▾] (optional filter)            │
│                                                             │
│ ─── Schedule Interval ───                                  │
│ Interval Type: [Hours ▾]  Value: [100]                     │
│ Warning at: [10] hours before due                          │
│ Critical at: [0] hours before due                          │
│                                                             │
│ ─── Form Integration ───                                   │
│ ☑ Require form completion to log this maintenance          │
│                                                             │
│ Linked Form Template:                                      │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 📋 100-Hour Aircraft Inspection          [Change] [👁️] ││
│ │ 45 fields • Photos • Signature required               ││
│ └─────────────────────────────────────────────────────────┘│
│ [+ Create New Form Template]                               │
│                                                             │
│ ─── Legacy Tasks (if no form) ───                          │
│ (Hidden when form is linked)                               │
│                                                             │
│                               [Cancel] [Save Schedule]      │
└─────────────────────────────────────────────────────────────┘
```

### Schedule Editor Fields
- Name, description
- Item type (equipment/aircraft)
- Category filter (optional)
- Interval type and value
- Warning/critical thresholds
- **Form integration toggle**
- **Form template selector** (dropdown of maintenance-tagged templates)
- Legacy task list editor (only if no form linked)

### Components
- `MaintenanceSchedulesPage.jsx` - Schedule management page
- `ScheduleEditorModal.jsx` - Create/edit schedule
- `ScheduleTaskEditor.jsx` - Task list management

### Files Created/Modified
| File | Action | Purpose |
|------|--------|---------|
| `src/pages/MaintenanceSchedulesPage.jsx` | CREATE | Schedule list page |
| `src/components/maintenance/ScheduleEditorModal.jsx` | CREATE | Schedule editor |
| `src/components/maintenance/ScheduleTaskEditor.jsx` | CREATE | Task list editor |
| `src/App.jsx` | MODIFY | Add route |

### Dependencies
- Phase 1 (Firestore functions)
- Phase 6A (Form templates available to link)

### Testable After Phase 6B
- Create new maintenance schedules
- Link form templates to schedules
- Toggle form requirement on/off
- Edit and delete schedules
- See which items have schedule applied
- Preview linked form from schedule

---

## Phase 7: Calendar View
**Delivers:** Calendar visualization of upcoming maintenance

### Calendar Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Maintenance Calendar                       [Month ▾] [List] │
├─────────────────────────────────────────────────────────────┤
│      January 2026                                           │
│ Sun   Mon   Tue   Wed   Thu   Fri   Sat                    │
│                     1     2     3     4                     │
│                           🟡    🔴                          │
│  5     6     7     8     9    10    11                     │
│              🟡                                             │
│ 12    13    14    15    16    17    18                     │
│        🟡                 🟡                                 │
│ ...                                                         │
├─────────────────────────────────────────────────────────────┤
│ January 2, 2026                                            │
│ • 🟡 M300 RTK - 100hr Inspection due                       │
│ • 🔴 Generator #2 - Annual service OVERDUE                 │
└─────────────────────────────────────────────────────────────┘
```

### Components
- `MaintenanceCalendarPage.jsx` - Calendar page
- `MaintenanceCalendar.jsx` - Calendar component
- `CalendarDayEvents.jsx` - Day event list

### Files Created/Modified
| File | Action | Purpose |
|------|--------|---------|
| `src/pages/MaintenanceCalendarPage.jsx` | CREATE | Calendar page |
| `src/components/maintenance/MaintenanceCalendar.jsx` | CREATE | Calendar component |
| `src/components/maintenance/CalendarDayEvents.jsx` | CREATE | Event list |
| `src/App.jsx` | MODIFY | Add route |

### Dependencies
- Phase 1-3

### Testable After Phase 7
- View calendar with maintenance events
- Navigate between months
- Click date to see details
- Events color-coded by status

---

## Phase 8: Equipment & Aircraft Modal Updates
**Delivers:** Add maintenance fields to existing modals

### Updates to EquipmentModal
- Add "Maintenance" tab/section
- Current hours/cycles fields
- Applied schedules selector
- Grounding controls

### Updates to AircraftModal
- Make existing maintenance fields editable:
  - `totalFlightHours`
  - `totalCycles`
  - `lastInspection`
  - `nextInspectionDue`
- Add firmware version field
- Applied schedules selector
- Grounding controls

### Files Modified
| File | Action | Purpose |
|------|--------|---------|
| `src/components/EquipmentModal.jsx` | MODIFY | Add maintenance section |
| `src/components/AircraftModal.jsx` | MODIFY | Add maintenance fields |

### Dependencies
- Phase 1, 6

### Testable After Phase 8
- Edit equipment with maintenance fields
- Edit aircraft with all maintenance fields
- Apply schedules directly from item modal

---

## Phase 9: Notifications & Integration
**Delivers:** Alerts, notifications, and system integration

### Features
- Dashboard widget showing maintenance alerts
- Email notifications for upcoming/overdue (if email system exists)
- Integration with main Dashboard.jsx quick stats
- Integration with QuickStats.jsx widget

### Files Modified
| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Dashboard.jsx` | MODIFY | Add maintenance alerts widget |
| `src/components/QuickStats.jsx` | MODIFY | Add maintenance stat |
| `src/components/maintenance/MaintenanceAlertWidget.jsx` | CREATE | Reusable alert widget |

### Dependencies
- Phase 1-5

### Testable After Phase 9
- See maintenance alerts on main dashboard
- Maintenance stat in quick stats
- Alerts update in real-time

---

## File Summary

### New Files (26 files)
```
src/lib/
  firestoreMaintenance.js
  maintenanceFormTemplates.js     # Phase 6A: Template definitions
  seedMaintenanceForms.js         # Phase 6A: Seed script

src/pages/
  MaintenanceDashboard.jsx
  MaintenanceItemList.jsx
  MaintenanceItemDetail.jsx
  MaintenanceSchedulesPage.jsx
  MaintenanceCalendarPage.jsx

src/components/maintenance/
  MaintenanceStatCard.jsx
  MaintenanceAlertList.jsx
  RecentMaintenanceList.jsx
  MaintenanceItemCard.jsx
  MaintenanceFilters.jsx
  SelectScheduleModal.jsx         # Phase 4: Schedule selection
  LogMaintenanceModal.jsx         # Phase 4: Legacy manual entry
  MaintenanceFormLauncher.jsx     # Phase 4: Launch form with context
  PartsUsedEditor.jsx
  AttachmentUploader.jsx
  ItemMeterDisplay.jsx
  AppliedSchedulesList.jsx
  MaintenanceHistoryList.jsx
  GroundItemModal.jsx
  ScheduleEditorModal.jsx
  ScheduleTaskEditor.jsx
  MaintenanceFormsAdmin.jsx       # Phase 6A: Template management
  MaintenanceCalendar.jsx
  CalendarDayEvents.jsx
  MaintenanceAlertWidget.jsx
```

### Modified Files (8 files)
```
src/lib/firestore.js
src/components/Layout.jsx
src/App.jsx
src/components/EquipmentModal.jsx
src/components/AircraftModal.jsx
src/pages/Dashboard.jsx
src/components/QuickStats.jsx
src/components/forms/FormFiller.jsx   # Phase 4: Handle maintenance context
```

---

## Navigation Structure

```
Sidebar:
├── Dashboard
├── Projects
├── Calendar
├── ...
├── Maintenance (NEW)
│   ├── Dashboard        → /maintenance
│   ├── All Items        → /maintenance/items
│   ├── Schedules        → /maintenance/schedules
│   └── Calendar         → /maintenance/calendar
├── Safety
├── ...
└── Libraries
    ├── Fleet
    ├── Equipment
    └── ...
```

---

## Phase Dependencies Diagram

```
Phase 1 (Data Model)
    │
    ├──→ Phase 2 (Dashboard)
    │        │
    │        └──→ Phase 9 (Notifications)
    │
    ├──→ Phase 3 (Item List)
    │        │
    │        └──→ Phase 7 (Calendar)
    │
    ├──→ Phase 6A (Form Templates)  ←── Uses existing Forms system
    │        │
    │        ├──→ Phase 4 (Log Service - Form Integrated)
    │        │        │
    │        │        └──→ Phase 5 (Item Detail)
    │        │
    │        └──→ Phase 6B (Schedules Management)
    │                 │
    │                 └──→ Phase 8 (Modal Updates)
    │
    └──→ Phase 8 (Modal Updates)


FORM INTEGRATION FLOW:
┌─────────────────────────────────────────────────────────────┐
│  Phase 6A creates Form Templates                            │
│       ↓                                                     │
│  Phase 6B links Templates to Schedules                      │
│       ↓                                                     │
│  Phase 4 launches Forms when logging maintenance            │
│       ↓                                                     │
│  Form submission → Auto-creates Maintenance Record          │
└─────────────────────────────────────────────────────────────┘
```

---

## Estimated Deliverables Per Phase

| Phase | Primary Deliverable | Commit Message |
|-------|---------------------|----------------|
| 1 | Data model & Firestore functions | "Add maintenance data model and Firestore functions" |
| 2 | Maintenance dashboard with KPIs | "Add maintenance dashboard page" |
| 3 | Item list with filters | "Add maintenance item list with filters" |
| 6A | Maintenance form templates | "Add maintenance form templates and seed data" |
| 4 | Form-integrated maintenance logging | "Add form-integrated maintenance logging" |
| 5 | Item detail view | "Add maintenance item detail page" |
| 6B | Schedule management with form linking | "Add maintenance schedule management with form linking" |
| 7 | Calendar view | "Add maintenance calendar view" |
| 8 | Equipment/Aircraft modal updates | "Add maintenance fields to Equipment and Aircraft modals" |
| 9 | Dashboard integration & notifications | "Integrate maintenance alerts with main dashboard" |

**Recommended Build Order:** 1 → 2 → 3 → 6A → 6B → 4 → 5 → 7 → 8 → 9

---

## Policy Compliance Mapping

| Policy Requirement | System Feature | Form Integration |
|-------------------|----------------|------------------|
| Maintenance scheduling (HSE1050) | Schedule templates, interval tracking | Schedules link to specific form templates |
| Inspection routines (HSE1050) | Task checklists per schedule | Standardized form checklists ensure consistency |
| Documentation/logging (HSE1050) | Maintenance records with full history | Forms capture photos, signatures, GPS |
| Weekly log reviews (HSE1050) | Dashboard + calendar views | Form submissions create searchable records |
| Pre/post-flight inspections (RPAS003) | Quick log service for inspection type | Pre/Post-flight form templates with all required checks |
| Battery cycle tracking (RPAS003) | Cycles field on aircraft/equipment | Battery Cycle Log form captures all data |
| Flight hours tracking (RPAS003) | Hours field with update capability | Forms auto-extract hours from meter reading fields |
| Firmware tracking (RPAS003) | Firmware version field on aircraft | 100-Hour inspection form includes firmware check |
| 24-month record retention (RPAS003) | All records stored with timestamps | Form submissions stored with full audit trail |
| Lockout capability (RPAS003) | Ground/unground functionality | Grounding/RTS form with authorization signatures |
| Defect reporting (RPAS003) | Findings field in maintenance records | Repeatable "Issues Found" sections with photos |
| Competent personnel sign-off | Technician field on records | Digital signature capture in forms |
| Regulatory traceability | Linked records and references | Form submissions link to item, schedule, and project |
