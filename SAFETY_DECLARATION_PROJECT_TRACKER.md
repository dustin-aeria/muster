# Safety Declaration Tool - Project Tracker

## Project Overview
Building a specialized Safety Assurance Declaration tool for RPAS equipment in compliance with Transport Canada CAR Standard 922. The tool supports both internal custom RPAS equipment and client system declarations.

## Key References
- **Standard 922**: RPAS Safety Assurance (technical requirements)
- **AC 922-001**: Guidance for making declarations
- **AC 901-001**: Declaration and PVD procedural guidance
- **Form 26-0882E**: Primary application form

---

## Current Status

| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| Phase 1 | COMPLETE | 2026-02-05 | 2026-02-05 | Foundation & Data Model |
| Phase 2 | COMPLETE | 2026-02-05 | 2026-02-05 | Declaration Dashboard & Project Management |
| Phase 3 | COMPLETE | 2026-02-05 | 2026-02-05 | Requirements Mapping & Compliance Matrix |
| Phase 4 | COMPLETE | 2026-02-05 | 2026-02-05 | Testing Session Management |
| Phase 5 | COMPLETE | 2026-02-05 | 2026-02-05 | Evidence Management & Documentation |
| Phase 6 | NOT STARTED | - | - | Declaration Generation & Submission |
| Phase 7 | NOT STARTED | - | - | Polish, Integration & Testing |

---

## Phase Details

### Phase 1: Foundation & Data Model
**Goal**: Establish database structure and core services

**Tasks**:
- [x] Create Firestore collections for declarations
- [x] Define declaration types (Declaration vs PVD)
- [x] Define operation categories mapping to 922.04-922.12
- [x] Create firestoreSafetyDeclaration.js service layer
- [x] Add declaration routes and navigation

**Data Model**:
```
safetyDeclarations/
  - id
  - organizationId
  - declarationType: 'declaration' | 'pre-validated'
  - rpasDetails: { manufacturer, model, serialNumber, weight, maxKineticEnergy }
  - operationTypes: [] (maps to 922.04-922.12 requirements)
  - status: 'draft' | 'testing' | 'review' | 'submitted' | 'accepted'
  - createdAt, updatedAt
  - submittedAt, acceptedAt
  - declarantInfo: { name, organization, contact }
  - clientId (optional - for client declarations)

safetyDeclarations/{id}/requirements/
  - requirementId (e.g., '922.04', '922.05')
  - status: 'not-started' | 'in-progress' | 'complete' | 'not-applicable'
  - complianceMethod: 'inspection' | 'analysis' | 'test' | 'service-experience'
  - notes, evidence[]

safetyDeclarations/{id}/testingSessions/
  - sessionId
  - date, startTime, endTime
  - testType
  - conditions: { weather, temperature, location }
  - results, observations, issues
  - attachments[]
  - status: 'scheduled' | 'in-progress' | 'complete' | 'cancelled'

safetyDeclarations/{id}/evidence/
  - evidenceId
  - type: 'test-result' | 'analysis' | 'calculation' | 'photo' | 'video' | 'document'
  - linkedRequirements: []
  - fileUrl, uploadedAt, uploadedBy
  - description
```

**Deliverables**:
- Firestore service file
- TypeScript/JSDoc interfaces
- Basic CRUD operations
- Route registration

---

### Phase 2: Declaration Dashboard & Project Management
**Goal**: UI for managing declaration projects

**Tasks**:
- [x] SafetyDeclarationHub.jsx - main dashboard (enhanced with modal integration, grid/list views)
- [x] CreateDeclarationModal.jsx - multi-step wizard
  - Step 1: Declaration type selection (Declaration vs PVD)
  - Step 2: RPAS system details (model, weight, kinetic energy calc)
  - Step 3: Operation type selection (triggers 922.xx requirements)
  - Step 4: Declarant/client information
- [x] DeclarationCard.jsx - project card with status and progress
- [x] DeclarationDetail.jsx - full project view with tabs (from Phase 1)

**UI Elements**:
- Progress indicators (% complete)
- Days since last activity
- Testing schedule overview
- Quick actions (continue testing, add evidence, generate report)

**Deliverables**:
- Dashboard page
- Creation wizard
- Project listing
- Detail view shell

---

### Phase 3: Requirements Mapping & Compliance Matrix
**Goal**: Map operations to specific 922.xx requirements and track compliance

**Tasks**:
- [x] RequirementsMatrix.jsx - visual compliance tracker
- [x] RequirementDetailModal.jsx - individual requirement view/edit modal
- [x] Automatic requirement selection based on operation types (in Phase 2)
- [x] Robustness level determination (Low vs High) - integrated in create wizard
- [x] DAL assignment based on kinetic energy - integrated in create wizard
- [x] Integrate RequirementsMatrix into SafetyDeclarationDetail page

**Requirement Categories** (from Standard 922):
- 922.04: Controlled Airspace Operations (position/altitude accuracy)
- 922.05: Operations Near People (30m, injury protection)
- 922.06: Operations Over People (<5m, stringent requirements)
- 922.07: Safety and Reliability (formal SSA, DAL assignment)
- 922.08: Containment (Low/High robustness)
- 922.09: C2 Link Reliability (lost-link behavior)
- 922.10: Detect, Alert, Avoid Systems
- 922.11: Control Station Design (human factors)
- 922.12: Environmental Envelope (flight testing)

**Compliance Methods**:
- Inspection/Review
- Analysis/Calculation
- Test/Demonstration
- Service Experience

**Deliverables**:
- Requirements database (seeded)
- Compliance matrix UI
- Automatic requirement selection logic
- Method-of-compliance tracking

---

### Phase 4: Testing Session Management
**Goal**: Track multi-day/multi-week testing campaigns

**Critical Feature**: Save and resume testing sessions across extended periods

**Tasks**:
- [x] TestingSessionManager.jsx - testing campaign overview with stats, search, and filter
- [x] CreateTestSessionModal.jsx - multi-step wizard for scheduling new tests
- [x] TestSessionDetail.jsx - active test recording with timer and controls
- [x] Real-time elapsed time tracking with pause history
- [x] Pre-test, in-test, post-test checklists (auto-populated by test type)
- [x] Environmental conditions logging (location, weather, temp, wind, visibility)
- [x] Issue/observation recording during tests with timestamps
- [x] Integrate testing components into SafetyDeclarationDetail page
- [ ] Photo/video attachment during tests (deferred to Phase 5 - Evidence)

**Test Types** (by requirement):
- Position accuracy testing (922.04)
- Altitude accuracy testing (922.04)
- Injury potential testing (922.05, 922.06)
- Failure mode testing (922.07)
- Containment testing (922.08)
- C2 link testing (922.09)
- DAA testing (922.10)
- Workload assessment (922.11)
- Environmental envelope testing (922.12)

**Session States**:
- Scheduled (future test)
- In Progress (can pause/resume)
- Paused (save state, return later)
- Complete (all data captured)
- Cancelled (with reason)

**Deliverables**:
- Testing session CRUD
- Real-time session tracking
- Pause/resume functionality
- Multi-session campaign view
- Test calendar integration

---

### Phase 5: Evidence Management & Documentation
**Goal**: Organize and link evidence to requirements

**Tasks**:
- [x] EvidenceManager.jsx - evidence library with grid/list view, stats, search, and filter
- [x] EvidenceUploadModal.jsx - file upload with drag-drop, metadata, requirement linking
- [x] EvidenceDetailModal.jsx - view/edit evidence, manage requirement links
- [x] Firebase Storage integration for file uploads (uploadDeclarationEvidence)
- [x] Integrate evidence components into SafetyDeclarationDetail page
- [x] Real-time evidence subscription and stats updates

**Evidence Types**:
- Test reports (structured data)
- Analysis documents (PDFs, spreadsheets)
- Calculations (kinetic energy, failure rates)
- Photos/videos (test documentation)
- Manufacturer data (specs, service history)
- Third-party certifications

**Deliverables**:
- File upload to Firebase Storage
- Evidence metadata management
- Requirement-evidence linking
- Completeness tracking
- Gap identification

---

### Phase 6: Declaration Generation & Submission
**Goal**: Generate compliant declaration documents

**Tasks**:
- [ ] DeclarationGenerator.jsx - document assembly
- [ ] Form 26-0882E auto-population
- [ ] Compliance summary report
- [ ] Evidence package assembly
- [ ] Submission checklist
- [ ] Export to PDF/DOCX
- [ ] Email preparation for TC submission

**Generated Documents**:
- Declaration statement
- RPAS system description
- Operations limitations
- Compliance matrix with evidence references
- Test summary reports
- Safety assessment summary

**Deliverables**:
- Document templates
- Auto-generation logic
- Export functionality
- Submission workflow

---

### Phase 7: Polish, Integration & Testing
**Goal**: Refine UX, integrate with existing Muster features

**Tasks**:
- [ ] Integration with existing document generator
- [ ] Link to compliance module
- [ ] Knowledge base integration
- [ ] Audit trail for all actions
- [ ] Dashboard widgets
- [ ] Permission controls
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states

**Deliverables**:
- Polished UI/UX
- Full integration
- Documentation
- User testing

---

## Technical Notes

### Kinetic Energy Calculation
```
KE = 0.5 * mass * velocity^2

Categories:
- < 700J: Lowest risk
- < 34kJ: Medium risk
- < 1084kJ: Higher risk
- > 1084kJ: Contact TC
```

### Injury Severity (AIS Scale)
- AIS-1: Minor
- AIS-2: Moderate
- AIS-3: Serious (12 J/cm^2 max for avoidance)
- AIS-4: Severe (~50% death probability)
- AIS-5: Critical
- AIS-6: Unsurvivable

### Reliability Targets (per flight hour)
| Criticality | <700J | <34kJ | <1084kJ |
|---|---|---|---|
| Catastrophic | 10^-4 | 10^-5 | 10^-6 |
| Hazardous | 10^-3 | 10^-4 | 10^-5 |
| Major | 10^-2 | 10^-3 | 10^-4 |
| Minor | 10^-2 | 10^-2 | 10^-3 |

---

## Session Log

### Session 1 - 2026-02-05
- Initial research and planning
- Created project tracker
- Defined phased approach
- **Phase 1 Complete:**
  - Created `src/lib/firestoreSafetyDeclaration.js` (comprehensive service layer ~900 lines)
    - All constants: declaration types, statuses, RPAS categories, kinetic energy categories
    - All requirement sections (922.04-922.12) with detailed sub-requirements
    - Full CRUD for declarations, requirements, testing sessions, evidence
    - Real-time subscriptions
    - Helper functions (KE calculator, category determination, etc.)
  - Created `src/pages/SafetyDeclarationHub.jsx` (dashboard with placeholder UI)
  - Created `src/pages/SafetyDeclarationDetail.jsx` (detail view with tabs)
  - Added routes to `App.jsx`
  - Added navigation entry to `Layout.jsx` (under Compliance section)

- **Phase 2 Complete:**
  - Created `src/components/safetyDeclaration/CreateDeclarationModal.jsx` (~550 lines)
    - 4-step wizard: Type selection, RPAS details, Operations, Declarant info
    - Built-in kinetic energy calculator with real-time category display
    - Operation type selection with auto-population of 922.xx requirements
    - Client declaration support
    - Form validation at each step
  - Created `src/components/safetyDeclaration/DeclarationCard.jsx` (~200 lines)
    - Progress bar showing completion percentage
    - Stats display (requirements, tests, evidence)
    - Status-aware styling
    - Compact variant for list views
  - Updated `src/pages/SafetyDeclarationHub.jsx`
    - Integrated CreateDeclarationModal
    - Added grid/list view toggle
    - Interactive stat cards for quick filtering
    - Real-time stats loading per declaration
    - Enhanced search (name, manufacturer, model, client)

- **Phase 3 Complete:**
  - Created `src/components/safetyDeclaration/RequirementsMatrix.jsx` (~350 lines)
    - Visual compliance tracker with requirements grouped by section
    - Stats overview (total, complete, in progress, evidence needed)
    - Search and filter by status functionality
    - Expand/collapse sections
    - Progress bars per section showing completion percentage
    - Click-to-edit individual requirements via modal
  - Created `src/components/safetyDeclaration/RequirementDetailModal.jsx` (~380 lines)
    - Modal for viewing and editing requirement details
    - Status selection with visual icons
    - Compliance method selection (Inspection, Analysis, Test, Service Experience)
    - Notes field for compliance documentation
    - Shows reliability targets for 922.07 requirements
    - Shows robustness level for 922.08 requirements
    - Linked evidence display (placeholder for Phase 5)
    - Save to Firestore on changes
  - Updated `src/pages/SafetyDeclarationDetail.jsx`
    - Integrated RequirementsMatrix in requirements tab
    - Auto-refresh stats on requirement updates

- **Phase 4 Complete:**
  - Created `src/components/safetyDeclaration/TestingSessionManager.jsx` (~450 lines)
    - Session overview with stats (total, active, scheduled, completed, total hours)
    - Search and status filter functionality
    - Sessions grouped by status (active, scheduled, completed, cancelled)
    - Quick actions: start, pause, resume, view, delete
    - Environmental conditions display
    - Linked requirements badges
  - Created `src/components/safetyDeclaration/CreateTestSessionModal.jsx` (~500 lines)
    - 4-step wizard: Basic info, Schedule & Location, Link Requirements, Checklists
    - Test type selection (9 types matching 922.xx sections)
    - Auto-populated checklists based on test type
    - Environmental conditions fields
    - Requirement linking with filtering by test type
  - Created `src/components/safetyDeclaration/TestSessionDetail.jsx` (~650 lines)
    - Real-time elapsed time display with pause history tracking
    - Start/Pause/Resume/Complete controls
    - Environmental conditions editing
    - Pre-test, in-test, post-test checklists with toggle
    - Observations recording with timestamps
    - Issues tracking with resolved status
    - Results summary with pass/fail outcome
    - Collapsible sections for better UX
  - Updated `src/pages/SafetyDeclarationDetail.jsx`
    - Integrated TestingSessionManager in testing tab
    - Session detail view navigation
    - CreateTestSessionModal integration
    - Auto-update viewing session from subscription

- **Phase 5 Complete:**
  - Created `src/components/safetyDeclaration/EvidenceManager.jsx` (~400 lines)
    - Evidence library with grid and list views
    - Stats overview (total, linked, unlinked, types used)
    - Search and filter by evidence type
    - Evidence cards with preview, linked requirements, and actions
    - Quick actions: view, download, delete
  - Created `src/components/safetyDeclaration/EvidenceUploadModal.jsx` (~350 lines)
    - Drag-and-drop file upload zone
    - Evidence type selection (9 types)
    - Name and description fields
    - Link to testing session
    - Multi-select requirement linking
    - Firebase Storage upload with progress indicator
  - Created `src/components/safetyDeclaration/EvidenceDetailModal.jsx` (~400 lines)
    - File preview (images, videos, PDF indicator)
    - File info display (name, size, type, upload date)
    - Download file button
    - Edit mode for name, description, type
    - Manage requirement links (add/remove)
    - Delete with confirmation
  - Updated `src/lib/storageHelpers.js`
    - Added uploadDeclarationEvidence function (100MB limit, broad file type support)
    - Added deleteDeclarationEvidence function
  - Updated `src/pages/SafetyDeclarationDetail.jsx`
    - Integrated EvidenceManager in evidence tab
    - Evidence subscription for real-time updates
    - Upload and detail modals integration

---

## Recovery Notes
If development is interrupted:
1. Check this tracker for current phase/status
2. Review git log for latest committed work
3. Check TODO comments in code for in-progress items
4. Resume from last completed task in current phase

---

## Contact
For regulatory questions: TC.RPASDeclaration-DeclarationSATP.TC@tc.gc.ca
