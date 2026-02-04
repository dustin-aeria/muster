# Muster Codebase Architecture Map

## Project Overview

**Application:** Muster - RPAS Operations Management System
**Type:** React + Vite Single Page Application with Firebase Cloud Functions
**Total Files:** 350+ JavaScript/JSX files
**Key Framework:** React 18.2, Vite 5.1, Firebase 10.8, Tailwind CSS 3.4

---

## 1. Application Entry Points

| File | Purpose |
|------|---------|
| `index.html` | HTML entry point |
| `src/main.jsx` | React app initialization (BrowserRouter, AuthProvider, OrganizationProvider) |
| `src/App.jsx` | Main routing configuration, lazy loading, route protection |

---

## 2. Directory Structure

```
muster/
├── src/
│   ├── components/          # 250+ React components
│   │   ├── compliance/      # Compliance tracking (10 files)
│   │   ├── cor/             # Certificate of Recognition (3 files)
│   │   ├── dashboard/       # Dashboard widgets (4 files)
│   │   ├── equipment/       # Equipment management (1 file)
│   │   ├── fha/             # Formal Hazard Assessment (8 files)
│   │   ├── forms/           # Form builder (2 files)
│   │   ├── inspections/     # Inspection management (3 files)
│   │   ├── insurance/       # Insurance tracking (1 file)
│   │   ├── jhsc/            # Joint H&S Committee (3 files)
│   │   ├── maintenance/     # Maintenance scheduling (11 files)
│   │   ├── map/             # Mapbox integration (7 files)
│   │   ├── onboarding/      # User onboarding (3 files)
│   │   ├── permits/         # SFOC/RPPL management (7 files)
│   │   ├── policies/        # Policy management (9 files)
│   │   ├── portal/          # Client portal (1 file)
│   │   ├── projects/        # Core project workflow (42+ files)
│   │   │   └── phases/      # Phase management (6 files)
│   │   ├── safety/          # Safety tracking (1 file)
│   │   ├── settings/        # Settings & team management (5 files)
│   │   ├── sora/            # SORA helpers (1 file)
│   │   ├── time/            # Time tracking (2 files)
│   │   ├── training/        # Training management (2 files)
│   │   ├── ui/              # UI component library (56 files)
│   │   └── weather/         # Weather widget (1 file)
│   │
│   ├── contexts/            # React contexts (3 files)
│   │   ├── AuthContext.jsx
│   │   ├── OrganizationContext.jsx
│   │   └── PortalAuthContext.jsx
│   │
│   ├── data/                # Static data (4 files)
│   │   ├── defaultFHATemplates.js    # 60+ FHA templates
│   │   ├── defaultPolicyTemplates.js
│   │   ├── policyContent.js
│   │   └── procedureContent.js
│   │
│   ├── hooks/               # Custom hooks (6 files)
│   │   ├── useAuth.js
│   │   ├── useKnowledgeBase.js
│   │   ├── useMapData.js
│   │   ├── useOrganization.js
│   │   ├── usePolicyPermissions.js
│   │   └── useRegulatoryPatterns.js
│   │
│   ├── lib/                 # Utilities & services (75+ files)
│   │   ├── firebase*.js     # Firebase services (30 files)
│   │   ├── *Export.js       # PDF generation (4 files)
│   │   ├── sora*.js         # SORA calculations (3 files)
│   │   ├── map*.js          # Map utilities (3 files)
│   │   ├── regulatoryFrameworks.js  # TC/EASA/FAA regulations
│   │   └── teamNotificationService.js # Notification orchestration
│   │
│   ├── pages/               # Page components (51 files)
│   │   ├── portal/          # Portal pages (6 files)
│   │   └── settings/        # Settings pages (2 files)
│   │
│   └── styles/              # CSS files (2 files)
│       ├── index.css
│       └── map-controls.css
│
├── functions/               # Firebase Cloud Functions
│   ├── index.js             # Email triggers (sendInvitationEmail, resendInvitationEmail)
│   ├── sendEmail.js         # SendGrid service (backup)
│   ├── sendSMS.js           # Twilio SMS service
│   ├── package.json
│   └── .env                 # Functions environment variables
│
├── docs/                    # Documentation
├── scripts/                 # Migration scripts
└── [config files]
```

---

## 3. Firebase Cloud Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `sendInvitationEmail` | Firestore onCreate (`organizationMembers`) | Auto-sends invitation email when member invited |
| `resendInvitationEmail` | HTTP Callable | Manual resend of invitation emails with rate limiting |

### Email Service Configuration
- **Primary:** Resend API
- **Fallback:** SendGrid
- **SMS:** Twilio (ready for implementation)

---

## 4. Firebase/Firestore Collections

### Organizations & Users
- `organizations` - Organization documents
- `organizationMembers` - Membership records (role, status, email tracking)
- `operators` - User profiles
- `roles` - Role definitions
- `permissions` - Permission mappings

### Projects & Operations
- `projects` - Project documents
- `projectSites` - Multi-site data
- `phases` - Project phases
- `tasks` - Project tasks
- `costs` - Cost tracking
- `permits` - SFOC/RPPL
- `flightLogs` - Flight records
- `siteSurveys` - Site survey data

### Safety & Compliance
- `incidents` - Incident reports
- `capas` - Corrective actions
- `hazards` - Hazard library
- `fhas` - Formal Hazard Assessments
- `compliance` - Compliance tracking
- `complianceMatrices` - Compliance matrices

### Assets
- `aircraft` - Aircraft inventory
- `equipment` - Equipment inventory
- `clients` - Client records

### Documentation
- `policies` - Policy documents
- `procedures` - Procedure documents
- `templates` - Document templates
- `checklists` - Checklist templates
- `knowledgeBase` - Knowledge articles

### Administration
- `auditTrail` - Audit logs
- `notifications` - In-app notifications
- `attachments` - File metadata
- `comments` - Comments/discussions
- `training` - Training records
- `insurance` - Insurance policies
- `jhsc` - JHSC meetings

---

## 5. Key Feature Files

### SORA 2.5 Implementation
| File | Purpose |
|------|---------|
| `src/lib/soraConfig.js` | Complete SORA 2.5 configuration (990 lines) |
| `src/components/projects/ProjectSORA.jsx` | SORA assessment UI (1000+ lines) |
| `src/components/projects/ProjectNeedsAnalysis.jsx` | CONOPS builder with regulatory pathways |
| `src/lib/regulatoryFrameworks.js` | TC/EASA/FAA regulations |

### Map System
| File | Purpose |
|------|---------|
| `src/components/map/UnifiedProjectMap.jsx` | Main Mapbox GL integration |
| `src/components/map/MapControls.jsx` | Drawing/measurement tools |
| `src/components/map/SiteSurveyMapTools.jsx` | Population data tools |
| `src/components/map/FlightPlanMapTools.jsx` | Flight path tools |
| `src/components/map/EmergencyMapTools.jsx` | Emergency area tools |

### PDF Export
| File | Purpose |
|------|---------|
| `src/lib/pdfExportService.js` | Single-site PDF export |
| `src/lib/pdfExportServiceMultiSite.js` | Multi-site PDF export |
| `src/lib/exportService.js` | General export wrapper |

### Team Management
| File | Purpose |
|------|---------|
| `src/lib/firestoreOrganizations.js` | Organization & member CRUD |
| `src/components/settings/InviteMemberModal.jsx` | Member invitation UI |
| `src/pages/settings/TeamMembers.jsx` | Team management page |
| `src/lib/teamNotificationService.js` | Notification orchestration |

---

## 6. Component Hierarchy

```
App.jsx
├── AuthProvider (contexts/AuthContext.jsx)
├── OrganizationProvider (contexts/OrganizationContext.jsx)
├── PortalAuthProvider (contexts/PortalAuthContext.jsx)
│
├── Public Routes
│   ├── Login.jsx
│   └── Portal Routes
│       ├── PortalLogin.jsx
│       ├── PortalVerify.jsx
│       └── PortalDashboard.jsx
│
└── Protected Routes
    └── Layout.jsx
        ├── Dashboard.jsx
        │
        ├── Projects Module
        │   ├── Projects.jsx (list)
        │   └── ProjectView.jsx
        │       ├── ProjectOverview.jsx
        │       ├── ProjectNeedsAnalysis.jsx
        │       ├── ProjectSORA.jsx
        │       ├── ProjectSiteSurvey.jsx
        │       ├── ProjectFlightPlan.jsx
        │       ├── ProjectEmergency.jsx
        │       ├── ProjectRisk.jsx
        │       └── [40+ more components]
        │
        ├── Safety Module
        │   ├── SafetyDashboard.jsx
        │   ├── Incidents.jsx
        │   ├── Capas.jsx
        │   ├── JHSC.jsx
        │   └── FormalHazardLibrary.jsx
        │
        ├── Compliance Module
        │   ├── ComplianceHub.jsx
        │   └── ComplianceApplicationEditor.jsx
        │
        ├── Maintenance Module
        │   ├── MaintenanceDashboard.jsx
        │   └── MaintenanceItemList.jsx
        │
        ├── Policy Module
        │   └── PolicyProcedureLibrary.jsx
        │
        ├── Settings Module
        │   ├── TeamMembers.jsx
        │   └── OrganizationSettings.jsx
        │
        └── Asset Management
            ├── Aircraft.jsx
            ├── Equipment.jsx
            ├── Operators.jsx
            └── Clients.jsx
```

---

## 7. Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  (Components in src/components/ and src/pages/)                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTEXT PROVIDERS                           │
│  AuthContext.jsx - User auth state                              │
│  OrganizationContext.jsx - Organization & membership state      │
│  PortalAuthContext.jsx - Portal auth state                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOM HOOKS (src/hooks/)                     │
│  useAuth, useOrganization, useMapData, etc.                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FIRESTORE SERVICES (src/lib/firestore*.js)      │
│  30+ service files for different collections                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FIREBASE                                  │
│  firebase.js - Firebase initialization                          │
│  Firestore, Auth, Storage, Cloud Functions                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUD FUNCTIONS (functions/)                  │
│  Email triggers, notifications, background tasks                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. External Dependencies

### Core
- React 18.2.0
- React Router DOM 6.22.0
- Firebase 10.8.0

### UI
- Tailwind CSS 3.4.1
- Lucide React 0.330.0 (icons)
- Headless UI 2.2.9

### Maps
- mapbox-gl 3.3.0
- @mapbox/mapbox-gl-draw 1.4.3
- @turf/buffer, @turf/helpers

### Data/Utilities
- Zustand 4.5.0 (state)
- date-fns 3.3.1
- xlsx 0.18.5
- pdfjs-dist 5.4.530

### Cloud Functions
- resend (email)
- @sendgrid/mail (backup email)
- twilio (SMS)

---

## 9. Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `vite.config.js` | Vite build configuration |
| `tailwind.config.js` | Tailwind customization (Muster brand) |
| `firebase.json` | Firebase deployment |
| `firestore.indexes.json` | Firestore indexes |
| `firestore.rules` | Firestore security rules |
| `postcss.config.js` | PostCSS configuration |
| `vercel.json` | Vercel deployment |
| `.env.example` | Environment template |
| `functions/.env` | Cloud Functions environment |

---

## 10. Brand Configuration (Tailwind)

```javascript
// From tailwind.config.js
colors: {
  aeria: {
    navy: '#1E3A5F',
    blue: '#2E5C8A',
    'light-blue': '#4A90D9',
    sky: '#E8F1F8'
  },
  risk: {
    critical: '#DC2626',
    high: '#F59E0B',
    medium: '#3B82F6',
    low: '#10B981'
  }
}
```

---

## 11. Role-Based Access Control

```javascript
// Role hierarchy (from firestoreOrganizations.js)
Levels: admin (100) > management (70) > operator (40) > viewer (10)

Permissions:
- admin: view, create/edit, delete, approve, manage team, manage settings
- management: view, create/edit, delete, approve
- operator: view, create/edit
- viewer: view only
```

---

## 12. Key Patterns Used

1. **Code Splitting**: Core pages sync, others lazy-loaded
2. **Context API**: Auth, Organization, Portal state
3. **Custom Hooks**: Data fetching, permissions
4. **Firestore Services**: Abstracted database operations
5. **Cloud Functions**: Email triggers, background processing
6. **Component Composition**: Modular UI components
7. **Form Management**: React Hook Form + custom validation
8. **Multi-Tenancy**: Organization-scoped data isolation

---

*Updated: 2026-02-04*
