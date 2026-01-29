# AERIA OPS - Comprehensive Software Audit

**Document Version:** 2.0
**Audit Date:** January 28, 2026
**Application Version:** 0.1.0

---

## Executive Summary

Aeria Ops is a comprehensive enterprise drone operations management platform built with React 18, Firebase, and Mapbox. The application provides end-to-end management capabilities for commercial drone operators, including project management, safety compliance, regulatory permit tracking, maintenance scheduling, and field operations support.

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Source Files | 304 |
| Lines of Code | ~96,200 |
| Pages (Routes) | 42 |
| Components | 177 |
| Library Utilities | 60+ |
| Firestore Collections | 64+ |

---

## 1. Core Technology Stack

### Current Stack (MVP/Validation Phase)
- **React 18.2** - UI framework
- **Vite 5.1** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **React Router 6.22** - Client-side routing
- **Firebase 10.8** - Authentication, Firestore, Storage
- **Mapbox GL JS 3.3** - Interactive mapping
- **Vercel** - Deployment platform

### State Management
- **Zustand 4.5** - Lightweight state management
- **React Context** - Auth state provider
- **react-hook-form 7.50** - Form state management

### Planned Migration Strategy
> **Important:** Current Firebase stack is intentionally temporary for MVP/validation phase.

**Planned Migration:** Supabase (PostgreSQL) when funding allows for professional migration support.

**Migration Rationale:**
- PostgreSQL handles multi-tenancy more cleanly
- Better reporting/aggregations capabilities
- Enterprise requirements (SSO, audit logs, data residency)
- More flexible querying

**Current Best Practices (Until Migration):**
- Keep Firestore calls consolidated in service files (e.g., `firestore.js`)
- Avoid scattering database calls across components
- Avoid deeply nested subcollections where flat structures work
- Don't rely heavily on real-time listeners unless genuinely required
- Document data model changes as they happen

**Migration Notes:**
- Auth migration will be the most complex piece
- Vercel deployment will remain post-migration
- Do not over-invest in Firebase-specific patterns

---

## 2. Application Modules - Current State

### 2.1 Dashboard Module
**Files:** `src/pages/Dashboard.jsx`, `src/components/dashboard/*`

Current features:
- Multi-site project summaries
- SORA compliance overview
- Policy acknowledgment alerts
- Active project statistics
- Real-time Firestore data

### 2.2 Projects Module
**Files:** `src/pages/Projects.jsx`, `src/pages/ProjectView.jsx`, `src/components/projects/*`

Current features:
- Project creation with client association
- Multi-site support with individual SORA assessments
- Cost estimation and tracking
- Equipment and crew assignment
- Flight plan management with Mapbox integration
- Site survey tools (polygon drawing, measurements)
- Emergency procedure mapping
- HSE risk assessment
- Tailgate meeting support
- Project proposal generation
- Team distribution lists and notifications

### 2.3 Safety Module
**Files:** `src/pages/Safety*.jsx`, `src/pages/Incident*.jsx`, `src/pages/Capa*.jsx`, `src/components/fha/*`

Current features:
- **Incidents:** Reporting, investigation, root cause analysis
- **CAPAs:** Corrective and preventive actions with effectiveness tracking
- **Inspections:** Templates, scheduling, findings management
- **Formal Hazard Analysis (FHA):** Risk matrix visualization, control measures
- **Field Hazard Reviews:** In-field site assessments
- **JHSC:** Joint Health & Safety Committee meetings and recommendations
- **Training:** Course management, records, competency matrix (currently embedded in Safety)
- **Safety Dashboard:** KPIs, incident trends, training metrics

### 2.4 Compliance Module
**Files:** `src/pages/ComplianceHub.jsx`, `src/pages/Compliance*.jsx`, `src/components/compliance/*`

Current features:
- **Applications:** Structured SFOC, Prequalification questionnaires
- **Q&A Projects:** Compliance questionnaire responses
- **Knowledge Base:** Indexed document search (keyword-based)
- **AI Assistant Panel:** Response suggestions, related requirements
- **Permits & Certificates:** SFOC, COR, land access, airspace authorizations
- **Document Parser:** Import and extract compliance requirements

### 2.5 Maintenance Module
**Files:** `src/pages/Maintenance*.jsx`, `src/components/maintenance/*`

Current features:
- **Dashboard:** KPIs, overdue alerts, activity feed
- **Schedules:** Interval-based maintenance planning
- **Records:** Maintenance action logging
- **Calendar:** Visual maintenance scheduling (separate from main calendar)
- **Alerts:** Due-soon and overdue notifications

### 2.6 COR (Certificate of Registration) Module
**Files:** `src/pages/COR*.jsx`, `src/components/cor/*`

Current features:
- Audit scheduling and tracking
- Auditor management
- Deficiency tracking and resolution
- Certificate management
- COR readiness dashboard

### 2.7 Policies & Procedures Module
**Files:** `src/pages/Policy*.jsx`, `src/pages/Procedure*.jsx`, `src/components/policies/*`

Current features:
- Policy creation with version control
- Procedure management
- Acknowledgment tracking
- Category organization
- Master policy templates
- Version history and comparison

### 2.8 Fleet Management
**Files:** `src/pages/Aircraft.jsx`, `src/pages/Equipment.jsx`, `src/pages/Operators.jsx`

Current features:
- **Aircraft:** Drone inventory, specs, battery status, maintenance tracking
- **Equipment:** Ground equipment (sensors, generators, etc.)
- **Operators:** Pilot certifications, roles (PIC, VO, Safety Lead)

### 2.9 Client & Services
**Files:** `src/pages/Clients.jsx`, `src/pages/Services.jsx`

Current features:
- Client contact information
- Project relationships
- Service catalog with cost estimates

### 2.10 Forms Module
**Files:** `src/pages/Forms.jsx`, `src/components/forms/*`

Current features:
- Template-based form creation
- Risk calculation integration
- RPAS incident triggers
- Submission tracking and review

### 2.11 Calendar
**Files:** `src/pages/Calendar.jsx`

Current state:
- Unified calendar for all events (maintenance, projects, training, permits)
- Maintenance calendar route now redirects to unified calendar
- Event types: projects, training, maintenance, inspections, insurance, permits

---

## 3. Known Bugs & Issues

### 3.1 Policies Module Bugs
| Issue | Description | Priority | Status |
|-------|-------------|----------|--------|
| Version history fails | "Fails to load version history" error in all policies | High | **FIXED** (Batch 1) |
| Active/Due/Overdue broken | No way to "activate" or set "due dates" on policies | High | **FIXED** (Batch 1) |
| Policy numbering confusing | Static numbers will conflict when users add custom policies | Medium | **FIXED** (Batch 6) |
| Header info unnecessary | Version, effective, review, person shown in header but not useful | Low | **FIXED** (Batch 9) |

### 3.2 Map/Drawing Bugs
| Issue | Description | Priority | Status |
|-------|-------------|----------|--------|
| Cannot edit boundary points | Cannot manually edit or manipulate points of a boundary once laid | High | **FIXED** (Batch 1) |
| Cannot edit evac route points | Cannot manipulate evac route points after initial creation | High | **FIXED** (Batch 1) |
| Spacebar not working in Site Access | In Site Survey > Site Access text field, spacebar doesn't input a space | Medium | Open |

### 3.3 Project Planning Bugs
| Issue | Description | Priority | Status |
|-------|-------------|----------|--------|
| Review section broken | Review section doesn't function well, needs approval workflow | High | **FIXED** (Batch 2) |
| Coverage requirements limited | Can only select 1 coverage requirement | Medium | **FIXED** (Batch 1) |
| Sections incomplete | "Sections" don't include all tabs of project planning | Medium | **FIXED** (Batch 2) |
| Templates placement wrong | Templates should be at end after export tab | Low | **FIXED** (Batch 2) |

### 3.4 Calendar Redundancy
| Issue | Description | Priority | Status |
|-------|-------------|----------|--------|
| Two calendars | Maintenance and general calendars are separate (should be unified) | Medium | **FIXED** (Batch 2) |

### 3.5 Notifications & Team Bugs
| Issue | Description | Priority | Status |
|-------|-------------|----------|--------|
| Notification list creation broken | When clicking to create a notification list, nothing happens | High | Open |

### 3.6 SORA Module Bugs
| Issue | Description | Priority | Status |
|-------|-------------|----------|--------|
| SAIL score requires mitigation | Cannot get SAIL score without selecting a ground risk mitigation (should calculate with or without) | Medium | **Verified Working** - SAIL calculates with defaults (population, UA characteristics) even without mitigations |

---

## 4. Feature Requirements & Enhancements

### 4.1 New User Onboarding & Content Gap Analysis

**Requirements:**
1. Create suggestion area for new users guiding them to first upload existing:
   - Operational procedures
   - Policies
   - Training materials
2. System should analyze uploaded documentation and recommend content from default library to address gaps
3. Compliance hub should actively identify missing/weak areas in operator's library
4. Recommend relevant, high-quality content from default library

**Implementation Notes:**
- Requires document analysis capability
- Content matching algorithm needed
- Gap identification logic

### 4.2 Content Strategy

**Requirements:**
1. Keep default policies/procedures updated with latest:
   - Industry literature
   - Regulatory currency
2. Provide content tailored for specific use cases:
   - Search and Rescue (SAR)
   - Fire operations
   - Industry-specific operations (oil & gas, utilities, mining, agriculture, etc.)
3. Users should be able to:
   - Select which policies to populate from default library
   - Edit populated policies freely
   - Select which procedures to populate from default library
   - Edit populated procedures freely

### 4.3 Document Import & Conversion

**Requirements:**
1. For both policies and procedures:
   - Allow upload of existing document (PDF, Word, etc.)
   - Auto-convert to software format
   - Place in user's library
2. Allow editing of categories:
   - Add new categories
   - Move policies/procedures between categories
   - Rename categories

### 4.4 Project Planning Enhancements

**Operation Types Alignment:**
- Must align with Canadian Aviation Regulations
- Support: Basic, Advanced, Level 1 Complex, SFOC operations
- Verify current operation types match Transport Canada categories

**Coverage Requirements:**
- Allow selection of multiple coverage requirements (currently limited to 1)

**Section Navigation:**
- Update "sections" to include all tabs of project planning process
- Move templates to end (after export tab)

**Map Editing:**
- Enable manual editing of boundary points after initial creation
- Enable manipulation of evac route points after creation
- Drag-to-edit vertex functionality

**Review & Approval Workflow:**
- Link review with distribution list
- Identify approval party from distribution list
- When review submitted → goes to approval party
- Approval party can click "Approved" to update status
- Simple bypass option: "Approved" button for quick approval without workflow

**Preflight Checklists:**
- Auto-populate with relevant project information:
  - Flight plan details
  - Identified risks
  - Hazards
  - Control measures
  - Evac routes
  - Muster points
  - All relevant safety information
- Display as readable format (not just checkboxes)
- Usable during tailgate meeting
- Go/No-Go decision at end

**Exports:**
- Include screenshots of each site from unified map plan
- Generate map images automatically for PDF export

### 4.5 Safety Dashboard Enhancements

**Emergency Contacts:**
- Users should be able to edit emergency contacts
- Add unlimited contacts
- Remove contacts as needed

### 4.6 Forms Library Expansion

**Requirements:**
1. Populate with more form templates from various industries
2. Research and include:
   - Audit forms (various types from HSE master doc)
   - Safety meeting forms
   - Operational tracking forms
   - Industry best practice forms
3. External research needed for:
   - State of science/literature on safety forms
   - Productive operational forms
   - Items that need tracking in safety programs

**Reference:** HSE master doc for insights into typical safety program audits and meetings

### 4.7 Policies Module Overhaul

**Active/Due/Overdue Logic:**
- Remove static active/due/overdue values
- Implement user-specific tracking:
  - When user opens a policy → becomes "Active" for that user
  - Sets 1-year expiry (due date) from open date
  - If over 1 year since last viewed → "Overdue"
  - Per-user, not per-policy

**Header Cleanup:**
- Remove from policy header:
  - Version
  - Effective date
  - Review date
  - Person/author

**Unique Identifiers:**
- Remove static policy numbers
- Implement auto-generated unique identifiers
- Prevents confusion when users add custom policies

**Version History Fix:**
- Debug and fix "fails to load version history" error

### 4.8 Calendar Unification

**Requirements:**
- Merge maintenance calendar and general calendar into ONE main calendar
- All calendar items in single view:
  - Maintenance events
  - Project dates
  - Safety meetings
  - Permit expiries
  - Training due dates
  - All scheduled items

### 4.9 Training Module Separation

**Requirements:**
1. Separate Training from Safety module
2. Create dedicated Training section:
   - Training Hub (main page)
   - Training Modules
3. Training library:
   - Platform will provide default training materials
   - Users can add their own training content
4. Assignment and tracking:
   - Assign training to operators
   - Track recurrency requirements
   - Track completion status
   - Certificate management

### 4.10 Cost of Safety Dashboard Widget

**New dashboard widget showing ROI of safety management:**

| Metric | Description |
|--------|-------------|
| Hours Saved | Documentation time vs. manual processes |
| Hazards Flagged | Regulatory hazards identified and avoided |
| Liability Savings | Estimated cost savings from risk mitigation |
| Compliance Trending | Status tracking over time |

**Purpose:** Demonstrate tangible business value to justify platform investment

### 4.11 Multi-Person Collaboration

**Requirements:**
- Share projects with collaborators
- Multiple users can work on same project
- Real-time or near-real-time collaboration
- Permission levels for collaborators

### 4.12 User Roles & Permissions System

**Platform Admin:**
- Update default policies and procedures
- Add new platform functions and features
- Adjust calculators and risk assessment logic
- Update regulatory reference data
- Modify form templates

**Organization Admin:**
- Update business info, branding, contact details
- Add, edit, manage client records
- Add policies, procedures, forms, equipment, personnel to libraries
- Manage user accounts and permission levels
- Generate and download all report types
- Create branded export packages

**Standard User:**
- Complete and submit forms
- Create and execute operation plans
- Review policies and procedures
- Access assigned projects

### 4.13 International Regulatory Expansion

**European Union - EASA:**
- EASA drone regulations
- EU drone categories (Open, Specific, Certified)
- EASA operational authorizations

**United States - FAA:**
- Part 107 (Small UAS)
- Part 91 (General Aviation)
- Waivers and authorizations
- LAANC integration considerations

---

## 5. Data Architecture

### 5.1 Primary Collections

| Collection | Purpose |
|------------|---------|
| `projects` | Project documents with multi-site support |
| `sites` | Individual site data for multi-site projects |
| `operators` | Pilot/operator records and certifications |
| `aircraft` | Drone/aircraft inventory |
| `equipment` | Ground equipment inventory |
| `clients` | Client information |
| `services` | Service catalog |

### 5.2 Safety Collections

| Collection | Purpose |
|------------|---------|
| `incidents` | Safety incident reports |
| `capas` | Corrective and preventive actions |
| `inspections` | Inspection records |
| `inspectionTemplates` | Reusable inspection templates |
| `inspectionFindings` | Inspection findings |
| `formalHazards` | Formal hazard analyses |
| `fieldHazardReviews` | Site-specific FHA reviews |
| `masterFormalHazards` | Master FHA templates |
| `safetyMetrics` | Safety KPI tracking |

### 5.3 Compliance Collections

| Collection | Purpose |
|------------|---------|
| `complianceApplications` | SFOC, Prequalification applications |
| `complianceProjects` | Q&A compliance projects |
| `complianceTemplates` | Questionnaire templates |
| `knowledgeBase` | Indexed compliance documents |
| `documentRegistry` | Document metadata |
| `permits` | Operational permits |

### 5.4 Policy Collections

| Collection | Purpose |
|------------|---------|
| `policies` | Company policies |
| `policyVersions` | Policy version history |
| `policyCategories` | Policy categories |
| `masterPolicies` | Master policy templates |
| `policyAcknowledgments` | User acknowledgments |
| `procedures` | Procedures library |
| `procedureVersions` | Procedure versions |
| `procedureAcknowledgments` | User acknowledgments |

### 5.5 Maintenance Collections

| Collection | Purpose |
|------------|---------|
| `maintenanceSchedules` | Schedule definitions |
| `maintenanceRecords` | Action records |

### 5.6 COR Collections

| Collection | Purpose |
|------------|---------|
| `corAudits` | Audit records |
| `corAuditors` | Auditor information |
| `corCertificates` | Certificates |
| `corDeficiencies` | Audit deficiencies |

### 5.7 JHSC Collections

| Collection | Purpose |
|------------|---------|
| `jhscCommittees` | Committees |
| `jhscMembers` | Members |
| `jhscMeetings` | Meetings |
| `jhscMinutes` | Meeting minutes |
| `jhscRecommendations` | Recommendations |

### 5.8 Training Collections

| Collection | Purpose |
|------------|---------|
| `trainingCourses` | Course definitions |
| `trainingRecords` | Completion records |
| `trainingMatrix` | Requirements matrix |

### 5.9 Administrative Collections

| Collection | Purpose |
|------------|---------|
| `users` | User accounts |
| `notifications` | System notifications |
| `distributionLists` | Team notification lists |
| `comments` | Entity comments |
| `activities` | Activity logs |
| `attachments` | File metadata |
| `auditLogs` | Audit trail |
| `feedback` | User feedback |
| `insurancePolicies` | Insurance tracking |
| `flightLogs` | Flight operation logs |
| `forms` | Form submissions |
| `customForms` | User form templates |
| `checklistTemplates` | Checklist templates |
| `checklistInstances` | Checklist instances |

### 5.10 New Collections Needed

| Collection | Purpose |
|------------|---------|
| `userPolicyStatus` | Per-user policy active/due/overdue tracking |
| `projectCollaborators` | Multi-user project access |
| `userRoles` | Role definitions and permissions |
| `trainingModules` | Training content library |
| `trainingAssignments` | Operator training assignments |

---

## 6. Current Integrations

### 6.1 Firebase (Fully Integrated)
- **Authentication:** Email/password login, password reset
- **Firestore:** Real-time database with 64+ collections
- **Storage:** Document and file storage

### 6.2 Mapbox (Fully Integrated)
- Interactive project mapping
- Drawing tools (polygon, line, point)
- Flight path visualization
- Emergency zone mapping
- Offline tile caching (500 tiles per cache)
- Static map generation

### 6.3 SORA 2.5 Compliance (Implemented)
- Full JARUS SORA 2.5 methodology
- iGRC (intrinsic Ground Risk Class) calculation
- SAIL (Specific Assurance and Integrity Level) determination
- Ground risk mitigations (Annex B)
- OSO (Operational Safety Objectives) tracking
- Per-site assessment support

---

## 7. API Integrations (Future - Lower Priority)

> **Note:** API integrations should be implemented after core functionality is complete.

### 7.1 Weather API Integration - **IMPLEMENTED (Batch 10/12)**
**Current State:** `src/lib/weatherService.js` integrated with Open-Meteo API:
- Current conditions (temperature, wind, humidity, visibility, precipitation)
- 5-day forecast with daily highs/lows
- Flight category assessment (VFR, MVFR, IFR, LIFR)
- Drone flight assessment (Good, Marginal, Poor, No Fly)
- Wind speed/gust analysis with direction
- Real-time data in Tailgate using site coordinates
- Planning checkboxes in Site Survey for expected conditions

### 7.2 NOTAM Integration
**Current State:** References throughout codebase

**Missing:** No API integration for live NOTAM data

**Recommended APIs:**
- NAV CANADA NOTAM system
- FAA NOTAM API

### 7.3 AirData Integration
**Current State:** 40+ references in policies/procedures

**Missing:** No AirData API integration

**Potential Features:**
- Flight log import
- Battery health sync
- Flight statistics

### 7.4 ForeFlight Integration
**Current State:** Referenced in procedures

**Missing:** No integration

**Potential Features:**
- Flight plan import/export
- Airspace awareness

### 7.5 NAV CANADA Airspace Authorization
**Current State:** Permit system supports airspace_auth type

**Missing:** No automated authorization system

### 7.6 AI/ML Enhancements
**Current State:** Keyword-based search

**Recommended:**
- Firebase Vertex AI for semantic search
- Vector embeddings for document similarity
- LLM-powered response generation

### 7.7 Email/SMS Notifications
**Current State:** In-app notifications working

**Missing:** External delivery

**Recommended:**
- Firebase Cloud Messaging (push)
- SendGrid (email)
- Twilio (SMS)

---

## 8. Technical Debt

### 8.1 Code Quality
- 3 TODO comments identified
- Some large files (2,700+ LOC)
- Inconsistent error handling patterns
- Some duplicate code across components

### 8.2 Performance
- No code splitting beyond lazy loading
- Large bundle size potential
- No image optimization
- No CDN configuration

### 8.3 Security
- Firebase security rules need audit
- No rate limiting on client
- No input sanitization review
- No CSP headers configured

### 8.4 Documentation
- Inline JSDoc comments present
- No external API documentation
- No architecture diagrams
- No onboarding guide

### 8.5 Testing
- No test files found
- No unit tests
- No integration tests
- No E2E tests

---

## 9. Implementation Roadmap

### Phase 1: Critical Bug Fixes (Immediate)
1. Fix policy version history loading error
2. Fix map boundary/evac route point editing
3. Implement policy Active/Due/Overdue user-based tracking
4. Fix coverage requirements to allow multiple selections

### Phase 2: Core UX Improvements (Short-term)
1. **Calendar Unification**
   - Merge maintenance and general calendars
   - Single unified calendar view

2. **Policy/Procedure Enhancements**
   - Remove static policy numbers (use auto-generated IDs)
   - Clean up policy headers
   - Allow users to select/populate from default library
   - Enable full editing of populated content
   - Document upload and auto-conversion
   - Category management (add, edit, move)

3. **Project Planning Improvements**
   - Update sections to include all tabs
   - Move templates after export tab
   - Align operation types with Canadian Aviation Regulations
   - Review/approval workflow with distribution list integration
   - Simple "Approved" bypass option

4. **Preflight Checklist Enhancement**
   - Auto-populate with plan data (risks, hazards, controls, routes)
   - Readable format for tailgate meetings
   - Go/No-Go decision capture

### Phase 3: New Features (Medium-term)
1. **Training Module Separation**
   - Create Training Hub page
   - Training modules/content library
   - Assignment and tracking system
   - Recurrency management

2. **User Roles & Permissions**
   - Implement Platform Admin role
   - Implement Organization Admin role
   - Implement Standard User role
   - Permission checks throughout app

3. **Multi-Person Collaboration**
   - Project sharing functionality
   - Collaborator permissions
   - Concurrent editing support

4. **Safety Dashboard Enhancements**
   - Editable emergency contacts
   - Cost of Safety ROI widget

5. **Forms Library Expansion**
   - Research and add industry forms
   - Safety meeting templates
   - Audit templates
   - Operational tracking forms

6. **New User Onboarding**
   - Document upload guidance
   - Gap analysis system
   - Content recommendations

### Phase 4: Content & Compliance (Medium-term)
1. **Content Strategy Implementation**
   - Industry-specific content (SAR, Fire, utilities, etc.)
   - Regulatory currency maintenance process
   - Default library curation

2. **Export Enhancements**
   - Map screenshots in exports
   - Branded export packages

3. **International Regulatory Expansion**
   - EASA regulations and categories
   - FAA Part 107, Part 91 support

### Phase 5: API Integrations (Long-term)
1. Weather API integration
2. NOTAM API integration
3. Email/SMS notifications
4. AirData integration
5. AI/ML enhancements (Vertex AI)
6. ForeFlight integration
7. NAV CANADA automation

### Phase 6: Platform Migration (When Funded)
1. Supabase (PostgreSQL) migration planning
2. Data model migration
3. Auth system migration
4. Testing and validation
5. Production cutover

---

## 10. File Structure Overview

```
aeria-ops/
├── src/
│   ├── pages/              # 42 route pages
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── ProjectView.jsx
│   │   ├── SafetyDashboard.jsx
│   │   ├── ComplianceHub.jsx
│   │   ├── MaintenanceDashboard.jsx
│   │   └── ... (38 more)
│   │
│   ├── components/         # 177 components
│   │   ├── Layout.jsx
│   │   ├── compliance/     # 9 files
│   │   ├── cor/            # 3 files
│   │   ├── dashboard/      # 3 files
│   │   ├── fha/            # 10 files
│   │   ├── forms/          # 2 files
│   │   ├── maintenance/    # 10 files
│   │   ├── map/            # 7 files
│   │   ├── permits/        # 8 files
│   │   ├── policies/       # 5 files
│   │   └── projects/       # 15+ files
│   │
│   ├── lib/                # 60+ utilities
│   │   ├── firebase.js
│   │   ├── firestore.js
│   │   ├── firestorePolicies.js
│   │   ├── firestoreSafety.js
│   │   ├── firestoreCompliance.js
│   │   ├── soraConfig.js
│   │   ├── weatherService.js
│   │   └── ... (50+ more)
│   │
│   ├── hooks/              # 4 custom hooks
│   ├── contexts/           # Auth context
│   ├── data/               # Static data
│   └── styles/             # CSS
│
├── functions/              # Firebase Cloud Functions
├── public/                 # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── firebase.json
```

---

## 11. Dependencies

### Production Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.22.0",
  "firebase": "^10.8.0",
  "mapbox-gl": "^3.3.0",
  "@mapbox/mapbox-gl-draw": "^1.4.3",
  "@turf/buffer": "^7.3.2",
  "@turf/helpers": "^7.3.2",
  "zustand": "^4.5.0",
  "react-hook-form": "^7.50.0",
  "date-fns": "^3.3.1",
  "lucide-react": "^0.330.0",
  "xlsx": "^0.18.5",
  "clsx": "^2.1.0"
}
```

### Dev Dependencies
```json
{
  "vite": "^5.1.0",
  "@vitejs/plugin-react": "^4.2.1",
  "tailwindcss": "^3.4.1",
  "postcss": "^8.4.35",
  "autoprefixer": "^10.4.17",
  "eslint": "^8.56.0"
}
```

---

## 12. Environment Variables

Required configuration in `.env`:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_MAPBOX_ACCESS_TOKEN=
```

---

## 13. Regulatory Compliance Features

### Transport Canada RPAS Regulations
- SFOC application support
- COR audit management
- Pilot certification tracking
- Incident reporting (CADORS-compatible)
- **Needed:** Alignment with Basic, Advanced, Level 1 Complex categories

### SORA 2.5 (JARUS)
- Full methodology implementation
- Ground risk assessment
- Air risk assessment
- SAIL determination
- OSO tracking

### Occupational Health & Safety
- JHSC management
- Inspection system
- Incident investigation
- CAPA process
- Training records

### Future Regulatory Support
- EASA (European Union)
- FAA Part 107 / Part 91 (United States)

---

## Appendix A: Largest Files by LOC

| File | Lines |
|------|-------|
| `src/lib/firestorePolicies.js` | 2,764 |
| `src/pages/Forms.jsx` | 2,356 |
| `src/lib/firestore.js` | 1,924 |
| `src/pages/ComplianceHub.jsx` | 1,702 |
| `src/lib/firestoreSafety.js` | 1,594 |
| `src/lib/seedComplianceTemplates.js` | 1,579 |
| `src/lib/formDefinitions.js` | 1,514 |
| `src/pages/ProjectView.jsx` | 1,400+ |

---

## Appendix B: Component Count by Directory

| Directory | Count |
|-----------|-------|
| `src/components/` (root) | 21 |
| `src/components/projects/` | 15+ |
| `src/components/fha/` | 10 |
| `src/components/maintenance/` | 10 |
| `src/components/compliance/` | 9 |
| `src/components/permits/` | 8 |
| `src/components/map/` | 7 |
| `src/components/policies/` | 5 |
| `src/components/cor/` | 3 |
| `src/components/dashboard/` | 3 |

---

## Appendix C: Priority Matrix

### Critical (Do First) - **BATCH 1 COMPLETE (Jan 28, 2026)**
- [x] Fix policy version history bug *(Completed - in-memory sort)*
- [x] Fix map point editing *(Completed - MapboxDraw integration)*
- [x] Implement user-based policy tracking *(Completed - 1-year expiry)*
- [x] Fix coverage requirements multi-select *(Completed - array-based)*

### High Priority - **BATCH 2 COMPLETE (Jan 28, 2026)**
- [x] Calendar unification *(Completed - maintenance calendar redirects to unified calendar)*
- [x] Project section navigation & templates placement *(Completed - templates moved to end, all tabs toggleable)*
- [x] Project review/approval workflow *(Completed - Quick Approve button added)*
- [x] Preflight checklist auto-population *(Already complete - Tailgate pulls hazards, PPE, emergency, etc.)*

### High Priority - **BATCH 3 COMPLETE (Jan 28, 2026)**
- [x] Policy/procedure library selection & editing *(Completed - PolicyLibrarySelector modal)*
- [x] Document upload/conversion *(Completed - PDF upload with text extraction)*
- [x] Operation types alignment with CARs *(Already aligned - VLOS/EVLOS/BVLOS/Night with CARs Part IX)*

### Medium Priority - **BATCH 4 COMPLETE (Jan 28, 2026)**
- [x] Training module separation *(Completed - renamed to "Training & Competency", standalone module)*
- [x] User roles & permissions *(Completed - userRoles.js with role hierarchy and permissions)*
- [x] Forms library expansion *(Completed - 4 new forms: Post-Flight Report, Battery Cycle Log, Client Orientation, Crew Competency Check)*
- [x] Cost of Safety dashboard widget *(Completed - CostOfSafetyWidget on SafetyDashboard)*

### Medium Priority - **BATCH 5 COMPLETE (Jan 28, 2026)**
- [x] New user onboarding *(Completed - OnboardingChecklist guides users through setup steps)*
- [x] Content gap analysis *(Completed - ContentGapAnalysis identifies missing policies, training, certifications)*
- [x] Multi-person collaboration basics *(Completed - ProjectTeamPanel for team member management with roles)*

### Medium Priority - **BATCH 6 COMPLETE (Jan 28, 2026)**
- [x] Policy numbering system improvement *(Completed - duplicate validation, auto-generate button, helper text)*
- [x] International regulatory frameworks (EASA, FAA) *(Completed - regulatoryFrameworks.js with TC/EASA/FAA configs, RegulatoryFrameworkSelector component, Settings integration)*
- [x] Policy header simplification *(Reviewed - current header is functional with useful metadata)*

### Medium Priority - **BATCH 7 COMPLETE (Jan 28, 2026)**
- [x] Emergency contacts management *(Completed - EmergencyContactsManager component with company-wide contacts, default emergency numbers, role-based categorization, Settings integration)*
- [x] Policy category management *(Completed - CategoryManager component already existed, integrated into Settings with new Policies tab)*
- [x] Additional form templates *(Completed - Added site_survey and flight_plan templates to formDefinitions.js with comprehensive RPAS-specific fields)*

### Medium Priority - **BATCH 8 COMPLETE (Jan 28, 2026)**
- [x] Permits & Certificates feature *(Completed - Full CRUD for permits/certificates with types: SFOC, COR, Land Access, Airspace Auth, Client Approval. Features: status badges, expiry tracking, privileges & conditions, document upload, Calendar integration, ComplianceHub tab)*

### Medium Priority - **BATCH 9 COMPLETE**
- [x] Policy header simplification *(Completed - Simplified to show only actionable items: version, review overdue alert, acknowledgment count)*
- [x] Dashboard expiry reminders *(Completed - ExpiryRemindersWidget consolidates permits, insurance, and certifications expiring within 30 days)*
- [x] Loading states and error handling improvements *(Completed - Components already have good loading/error states; widget includes loading, error, and empty states)*

### Lower Priority - **BATCH 12 COMPLETE (Jan 28, 2026)**
- [x] WeatherWidget moved to Tailgate *(Completed - Real-time weather from Open-Meteo API using site coordinates, with multi-site selector)*
- [x] Site Survey weather planning *(Completed - Simple checkbox grid for expected conditions: clear, cloudy, rain, fog, wind, snow, dust, hot, cold, variable)*
- [x] Map distance measurement tool *(Completed - DistanceMeasurement component with Haversine formula, measureDistance drawing mode)*
- [x] "Same as boundary" flight area option *(Completed - Flight geography method option that copies operations boundary)*

### Outstanding Bugs
- [ ] Bug: Notification list creation *(Debug logging added - test and check console)*
- [x] Bug: Spacebar in Site Access field *(Fixed - added stopPropagation to input fields)*

### Batch 13 - Map Overlay Layers (Jan 28, 2026)
- [x] Province/State borders layer *(Completed - toggleable admin boundaries from Mapbox, purple dashed lines)*
- [x] Overlay layers UI *(Completed - "Layers" button with panel showing available overlays)*
- [ ] Municipal boundaries *(Coming Soon - requires Statistics Canada census subdivision data)*
- [ ] Airspace integration *(Coming Soon - requires NAV CANADA or OpenAIP data)*
- [ ] Population density *(Coming Soon - requires Statistics Canada or WorldPop data)*

### Lower Priority - **BATCH 11 COMPLETE (Jan 28, 2026)**
- [x] Pre-field "Safety" task type *(Completed - Added safety task type with ShieldAlert icon)*
- [x] Hours & operators on pre-field/post-field tasks *(Completed - Tasks now support hours, assigned operators, and auto cost calculation)*
- [x] Bug: SORA SAIL score without mitigation *(Verified working - SAIL calculates with defaults when no mitigations selected)*

### Lower Priority - **BATCH 10 COMPLETE**
- [x] Weather API integration *(Completed - Open-Meteo API with current conditions, 5-day forecast, VFR/IFR flight conditions, drone flight assessment, integrated into Tailgate)*
- [ ] NOTAMs integration *(Future)*
- [ ] Platform migration (Firebase to Supabase)

---

## 10. Feature Backlog

Items considered but not yet implemented. Prioritize from this list for future batches.

### Pre-Field & Post-Field Tasks
- [x] **Add "Safety" task type** - *(Completed Batch 11)*
- [x] **Hours & Operators on tasks** - *(Completed Batch 11)*

### Unified Project Map - Comprehensive Feature Roadmap

**Current Implementation:**
- Mapbox GL JS with MapboxDraw for drawing/editing
- Multi-site support with color coding
- Three layer groups: Site Survey, Flight Plan, Emergency
- Basemap switching (Streets, Satellite, Outdoors)
- Fullscreen mode, zoom controls, fit-to-bounds

#### Drawing & Measurement Tools
- [x] **Polygon Drawing** - Operations boundary, flight geography, contingency volume
- [x] **Line Drawing** - Evacuation routes
- [x] **Marker Placement** - Site location, obstacles, launch/recovery points, muster points
- [x] **Vertex Editing** - Edit polygon/line points after creation
- [x] **Distance Measurement** - *(Batch 12)* Haversine formula, displays in m/km/ft/NM
- [x] **"Same as Boundary"** - *(Batch 12)* Copy operations boundary to flight geography
- [ ] **Area Measurement** - Calculate and display polygon area in m²/km²/acres
- [ ] **Coordinate Display** - Show lat/lng on hover or click
- [ ] **Bearing/Heading Tool** - Measure direction between two points

#### Reference Overlay Layers
- [x] **Province/State Borders** - *(Batch 13)* Toggleable admin boundaries, purple dashed lines
- [x] **Overlay Layer UI** - *(Batch 13)* "Layers" button with toggle panel
- [ ] **Municipal Boundaries** - Statistics Canada census subdivision data (requires Mapbox tileset upload)
- [ ] **Airspace Zones** - NAV CANADA or OpenAIP controlled/restricted airspace
- [ ] **Population Density** - Statistics Canada or WorldPop density heatmap
- [ ] **Terrain/Elevation** - Hillshade, contour lines, elevation data
- [ ] **Land Use/Zoning** - Parks, industrial, residential, agricultural areas
- [ ] **Infrastructure** - Power lines, pipelines, railways, highways

#### Airspace Intelligence
- [ ] **Controlled Airspace Display** - Class A/B/C/D/E/F zones with altitude info
- [ ] **Control Zone Boundaries** - Airport CTR boundaries
- [ ] **Restricted/Prohibited Areas** - CYR/CYA zones
- [ ] **Altitude-Aware Airspace** - Show which airspace applies at flight altitude
- [ ] **Airspace Click-to-Query** - Click map to get airspace classification at that point
- [ ] **NAV CANADA RPAS Integration** - Link to notification requirements

#### Flight Planning Aids
- [ ] **NOTAMs Display** - Active NOTAMs affecting flight area
- [ ] **TFRs (Temporary Flight Restrictions)** - Display active TFRs
- [ ] **Weather Overlay** - Radar, cloud cover, wind direction on map
- [ ] **Sun Position** - Sunrise/sunset direction, shadow calculation
- [ ] **Magnetic Declination** - Show magnetic vs true north

#### Data Export & Sharing
- [ ] **Screenshot/Image Export** - Export map view as PNG/JPEG
- [ ] **KML/KMZ Export** - Export flight plan for Google Earth
- [ ] **GPX Export** - Export waypoints for GPS devices
- [ ] **PDF Map Insert** - Auto-generate map images for PDF exports
- [ ] **Share Map Link** - Generate shareable link to current map view

#### Performance & Offline
- [ ] **Offline Tile Caching** - Cache map tiles for field use (partial implementation exists)
- [ ] **Vector Tile Optimization** - Efficient rendering for large datasets
- [ ] **Lazy Loading** - Load overlay data only when enabled

#### Data Sources to Integrate
| Layer | Source | Format | Notes |
|-------|--------|--------|-------|
| Municipal Boundaries | Statistics Canada | Shapefile → Mapbox Tileset | Census Subdivision (CSD) |
| Airspace | NAV CANADA / OpenAIP | GeoJSON / API | Requires data agreement or API |
| Population Density | Statistics Canada / WorldPop | Raster / Vector | Census data by dissemination area |
| NOTAMs | NAV CANADA | API | Real-time feed |
| Weather Radar | Environment Canada | WMS / Tiles | Radar imagery overlay |

### Data & Reporting
- [ ] **Enhanced Reporting** - Comprehensive PDF/Excel reports for projects, safety metrics, compliance status
- [ ] **Data Export** - Bulk CSV/Excel export for projects, safety records, maintenance logs
- [ ] **Audit Trail & Activity Logging** - Track changes to critical records, user activity history, compliance audit trail

### Search & Navigation
- [ ] **Global Search** - Search across all modules (projects, policies, permits, equipment, etc.)
- [ ] **Advanced Filtering** - Saved filters, filter presets, search history
- [ ] **Quick Navigation** - Keyboard shortcuts, command palette

### Integrations
- [ ] **NOTAMs Integration** - Notices to Airmen for airspace restrictions and TFRs
- [ ] **Document Import** - Bulk import existing documents with metadata extraction

### User Experience
- [ ] **Mobile Responsiveness** - Improved mobile experience for field use
- [ ] **Offline Capability** - Cache critical data for field operations without connectivity
- [ ] **Email Notifications** - Automated alerts for expiring items, assignments, approvals

### Infrastructure
- [ ] **Platform Migration** - Firebase to Supabase (PostgreSQL) for enterprise features
- [ ] **Performance Optimization** - Code splitting, lazy loading, bundle size reduction

---

*Document Version 2.1 - Updated January 29, 2026*
*Includes feature requirements, bug tracking, updated roadmap, and comprehensive Mapbox feature plan*
