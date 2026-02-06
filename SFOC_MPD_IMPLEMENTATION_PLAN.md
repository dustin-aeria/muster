# SFOC & RPAS Manufacturer Performance Declaration - Implementation Plan

**Created:** February 6, 2026
**Purpose:** Add SFOC (Special Flight Operations Certificate) and RPAS Manufacturer Performance Declaration management to Muster for large RPAS (>150kg) operations

---

## Executive Summary

For your client's 400kg drone with custom software, two critical regulatory pathways are required:

1. **SFOC (Special Flight Operations Certificate)** - Mandatory for all RPAS >150kg per CAR 903.01(a)
2. **RPAS Manufacturer Performance Declaration** - Required for RPAS >150kg, must be accepted by Transport Canada

This plan adds comprehensive tooling to Muster for managing both processes, integrating with the existing Safety Declaration (CAR 922) system.

---

## Regulatory Research Summary

### Sources Consulted
- [Transport Canada - Medium/High Complexity SFOC](https://tc.canada.ca/en/aviation/drone-safety/drone-pilot-licensing/get-permission-special-drone-operations/get-permission-special-drone-operations-medium-high-complexity)
- [Transport Canada - Higher-Risk Environments](https://tc.canada.ca/en/aviation/drone-safety/drone-pilot-licensing/get-permission-special-drone-operations/higher-risk-environments)
- [Advisory Circular AC 903-001 - RPAS Operational Risk Assessment](https://tc.canada.ca/en/aviation/reference-centre/advisory-circulars/advisory-circular-ac-no-903-001)
- [Advisory Circular AC 903-002](https://tc.canada.ca/en/aviation/reference-centre/advisory-circulars/advisory-circular-ac-no-903-002)
- [Advisory Circular AC 922-001 - RPAS Safety Assurance](https://tc.canada.ca/en/aviation/reference-centre/advisory-circulars/advisory-circular-ac-no-922-001)
- [Advisory Circular AC 901-002](https://tc.canada.ca/en/aviation/reference-centre/advisory-circulars/advisory-circular-ac-no-901-002)
- [Standard 922 - RPAS Safety Assurance](https://tc.canada.ca/en/corporate-services/acts-regulations/list-regulations/canadian-aviation-regulations-sor-96-433/standards/standard-922-rpas-safety-assurance)
- [Safety Assurance Declaration Submission](https://tc.canada.ca/en/aviation/drone-safety/submitting-drone-safety-assurance-declaration)
- [Pre-Validated Declaration Process](https://tc.canada.ca/en/aviation/drone-safety/submitting-drone-safety-assurance-declaration/apply-pre-validated-declaration)
- [2025 Drone Regulation Changes](https://tc.canada.ca/en/aviation/drone-safety/2025-summary-changes-canada-drone-regulations)
- [Canada Gazette RPAS Amendments](https://gazette.gc.ca/rp-pr/p1/2023/2023-06-24/html/reg6-eng.html)
- [JARUS SORA 2.5 Documentation](http://jarus-rpas.org/wp-content/uploads/2024/06/SORA-v2.5-Main-Body-Release-JAR_doc_25.pdf)

### Key Findings for 400kg RPAS

#### 1. SFOC is Mandatory
- **Trigger:** Any RPAS >150kg requires SFOC per CAR 903.01(a)
- **Complexity:** Medium or High complexity (60 business days processing)
- **Fees (effective Nov 4, 2025):** $150-$2,000 depending on complexity
- **Validity:** Maximum 12 months

#### 2. Manufacturer Performance Declaration Required
- For RPAS >150kg OR BVLOS operations
- Must be "accepted by TC to the applicable technical requirements"
- Tied to SAIL (Specific Assurance and Integrity Level) from SORA
- At SAIL III/IV+, TC requires detailed means of compliance documentation
- Test reports and evidence must be available on request

#### 3. Large RPAS Falls Outside Standard 922 Framework
- Standard 922 and AC 922-001 explicitly cover only RPAS up to 150kg
- For >150kg, direct engagement with TC is required
- Falls into "pre-2019 style" regulatory pathway
- Kinetic energy for 400kg drone at any reasonable speed exceeds 1084kJ threshold

#### 4. SORA Assessment Required
- Must complete per AC 903-001
- Determines SAIL level (I-VI)
- SAIL drives robustness requirements for 24 OSOs (Operational Safety Objectives)
- Higher SAIL = more evidence/third-party validation required

#### 5. Custom Software Considerations
- DO-178C or ASTM F3201-16 standards recommended
- Software safety assessment required
- Part of manufacturer declaration package
- OSO #24 (Environmental Conditions) requires environmental testing documentation

---

## SFOC Application Requirements

### Required Documentation Package

#### 1. Administrative Documents
- [ ] Application Form (26-0835E or 24-0109)
- [ ] Compliance Checklist (provided by TC after initial submission)
- [ ] Application fee payment confirmation

#### 2. Concept of Operations (ConOps)
- [ ] Purpose and scope of operations
- [ ] Operational environment description
- [ ] Crew roles and responsibilities
- [ ] Communication procedures
- [ ] Airspace considerations
- [ ] Expected environmental conditions

#### 3. Specific Operational Risk Assessment (SORA)
- [ ] Ground Risk Class (GRC) determination
- [ ] Air Risk Class (ARC) determination
- [ ] Mitigation measures (M1A, M1B, M1C, M2, TMPR)
- [ ] Final GRC and Residual ARC
- [ ] SAIL level determination
- [ ] 24 OSO compliance matrix with robustness levels

#### 4. Safety Plan
- [ ] Hazard identification
- [ ] Risk mitigation measures
- [ ] Normal operating procedures
- [ ] Emergency procedures
- [ ] Contingency procedures

#### 5. Emergency Response Plan
- [ ] Personnel and contact information
- [ ] Equipment and resources
- [ ] Communication protocols
- [ ] Incident response procedures
- [ ] Notification requirements (TSB, TC, WorkSafeBC)

#### 6. Equipment Documentation
- [ ] RPA Certificate of Registration
- [ ] Manufacturer Performance Declaration (accepted by TC)
- [ ] Technical specifications
- [ ] Performance limitations
- [ ] Maintenance instructions and schedule
- [ ] Serviceability procedures
- [ ] Software documentation (for custom software)
- [ ] Parachute system documentation (if applicable)

#### 7. Crew Documentation
- [ ] Pilot Certificate - Advanced Operations
- [ ] SAIL-level qualification confirmation
- [ ] Recency requirements
- [ ] Training records
- [ ] Medical fitness assessment (if required)

#### 8. Operational Documentation
- [ ] Site survey or representative example
- [ ] RPAS Operations Manual
- [ ] Maintenance Control Manual
- [ ] Separation and collision avoidance procedures
- [ ] Liability insurance proof ($100K minimum, typically $1M+ for commercial)

---

## RPAS Manufacturer Performance Declaration Requirements

### For RPAS >150kg (Large Category)

#### 1. System Design Documentation
- [ ] System architecture overview
- [ ] Component specifications
- [ ] Design standards used (DO-178C, DO-254, ASTM F3201-16, etc.)
- [ ] Software design documentation (for custom software)
- [ ] Hardware design documentation

#### 2. Safety Analysis
- [ ] Functional Hazard Assessment (FHA)
- [ ] Failure Modes and Effects Analysis (FMEA)
- [ ] System Safety Assessment
- [ ] Common Cause Analysis
- [ ] Kinetic energy calculations

#### 3. Performance Verification
- [ ] Flight envelope definition
- [ ] Performance testing results
- [ ] Command & Control link testing
- [ ] GPS/navigation accuracy testing
- [ ] Containment capability testing

#### 4. Environmental Qualification (OSO #24)
- [ ] Operating environmental conditions defined
- [ ] DO-160 or equivalent testing documentation
- [ ] Temperature range testing
- [ ] Wind/turbulence testing
- [ ] Precipitation testing (if applicable)
- [ ] EMI/EMC testing

#### 5. Reliability Assessment
- [ ] Reliability targets per SAIL level
- [ ] MTBF calculations
- [ ] Failure rate data
- [ ] Redundancy documentation

#### 6. Maintenance Program
- [ ] Maintenance schedule
- [ ] Required inspections
- [ ] Replacement intervals
- [ ] Serviceability criteria

#### 7. Operator Information Package
- [ ] Operations manual
- [ ] Flight manual/POH
- [ ] Limitations and procedures
- [ ] Emergency procedures
- [ ] Maintenance instructions per CAR 901.200

---

## 24 Operational Safety Objectives (OSOs)

### Category: Technical Issues with UAS
| OSO | Description | SAIL I | SAIL II | SAIL III | SAIL IV | SAIL V | SAIL VI |
|-----|-------------|--------|---------|----------|---------|--------|---------|
| 01 | Operator is competent and/or proven | O | L | M | H | H | H |
| 02 | UAS manufactured by competent organization | O | O | L | M | H | H |
| 03 | UAS maintained by competent entity | L | L | M | M | H | H |
| 04 | UAS developed to design standards | O | O | L | M | H | H |
| 05 | UAS designed considering system safety | O | O | L | M | H | H |
| 06 | C2 link performance adequate | O | L | M | H | H | H |
| 07 | Inspection of UAS to ensure safe operation | L | L | M | M | H | H |
| 10 | Safe recovery from technical issues | O | O | L | M | H | H |
| 18 | Automatic protection of flight envelope | O | O | L | M | H | H |
| 19 | Safe recovery from human error | O | O | L | M | H | H |

### Category: External System Deterioration
| OSO | Description | SAIL I | SAIL II | SAIL III | SAIL IV | SAIL V | SAIL VI |
|-----|-------------|--------|---------|----------|---------|--------|---------|
| 11 | Procedures for deterioration of systems | O | L | M | M | H | H |
| 12 | UAS designed for deterioration of systems | O | O | L | M | H | H |
| 13 | External services supporting operations | L | L | M | M | H | H |

### Category: Human Error
| OSO | Description | SAIL I | SAIL II | SAIL III | SAIL IV | SAIL V | SAIL VI |
|-----|-------------|--------|---------|----------|---------|--------|---------|
| 14 | Operational procedures defined, validated, adhered to | L | M | H | H | H | H |
| 15 | Remote crew trained and current | L | L | M | M | H | H |
| 16 | Multi-crew coordination | L | L | M | M | H | H |
| 17 | Remote crew fit to operate | L | L | M | M | H | H |
| 20 | Human factors evaluation | O | O | L | M | H | H |

### Category: Adverse Operating Conditions
| OSO | Description | SAIL I | SAIL II | SAIL III | SAIL IV | SAIL V | SAIL VI |
|-----|-------------|--------|---------|----------|---------|--------|---------|
| 21 | Operational procedures for adverse conditions | L | M | H | H | H | H |
| 22 | Remote crew trained for adverse conditions | L | L | M | M | H | H |
| 23 | Environmental conditions defined | L | L | M | M | H | H |
| 24 | UAS designed for adverse environmental conditions | O | O | M | M | H | H |

**Legend:** O = Optional, L = Low Robustness, M = Medium Robustness, H = High Robustness

### Robustness Level Evidence Requirements

| Level | Integrity | Assurance Required |
|-------|-----------|-------------------|
| **Low** | Criteria met | Declaration by operator/manufacturer, supporting documentation |
| **Medium** | Standards-based | Standards identification, SLAs for external services, validation against TC standards |
| **High** | Third-party validated | Third-party audit, Organizational Operating Certificate, recurrent audits |

---

## Implementation Phases

### Phase 1: Database Schema & Constants (Backend Foundation)

**Files to Create:**
- `src/lib/firestoreSFOC.js` - SFOC data layer
- `src/lib/firestoreManufacturerDeclaration.js` - MPD data layer
- `src/lib/soraAssessment.js` - SORA calculation engine

**Data Structures:**

```javascript
// SFOC Application
{
  id: string,
  organizationId: string,
  status: 'draft' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'expired',
  complexityLevel: 'medium' | 'high',

  // Application Details
  applicationType: 'new' | 'renewal' | 'amendment',
  proposedStartDate: timestamp,
  proposedEndDate: timestamp,
  operationDescription: string,

  // Linked References
  aircraftId: string,  // Link to aircraft >150kg
  manufacturerDeclarationId: string,
  soraAssessmentId: string,

  // Document Checklist
  documents: {
    applicationForm: { status, fileUrl, uploadedAt },
    conops: { status, fileUrl, uploadedAt },
    soraAssessment: { status, fileUrl, uploadedAt },
    safetyPlan: { status, fileUrl, uploadedAt },
    emergencyResponsePlan: { status, fileUrl, uploadedAt },
    sitesurvey: { status, fileUrl, uploadedAt },
    operationsManual: { status, fileUrl, uploadedAt },
    maintenanceManual: { status, fileUrl, uploadedAt },
    insuranceProof: { status, fileUrl, uploadedAt },
    crewQualifications: { status, fileUrl, uploadedAt },
    // ... etc
  },

  // TC Communication
  tcReferenceNumber: string,
  submissionDate: timestamp,
  tcResponseDate: timestamp,
  tcComments: string,

  // Validity
  approvedStartDate: timestamp,
  approvedEndDate: timestamp,
  conditions: [string],

  // Audit Trail
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string
}

// Manufacturer Performance Declaration
{
  id: string,
  organizationId: string,
  aircraftId: string,

  status: 'draft' | 'in_development' | 'testing' | 'submitted' | 'accepted' | 'rejected',

  // RPAS Details
  rpasCategory: 'large', // >150kg
  manufacturer: string,
  model: string,
  serialNumber: string,
  operatingWeight: number,
  maxTakeoffWeight: number,
  kineticEnergy: number, // Calculated

  // Software Details (for custom software)
  hasCustomSoftware: boolean,
  softwareDetails: {
    name: string,
    version: string,
    designStandard: 'DO-178C' | 'ASTM_F3201' | 'other',
    dalLevel: 'A' | 'B' | 'C' | 'D' | 'E', // Design Assurance Level
    description: string
  },

  // SAIL Reference
  sailLevel: 1 | 2 | 3 | 4 | 5 | 6,

  // Documentation Sections
  systemDesign: { status, documents: [] },
  safetyAnalysis: { status, documents: [] },
  performanceVerification: { status, documents: [] },
  environmentalQualification: { status, documents: [] },
  reliabilityAssessment: { status, documents: [] },
  maintenanceProgram: { status, documents: [] },
  operatorPackage: { status, documents: [] },

  // TC Communication
  tcReferenceNumber: string,
  submissionDate: timestamp,
  acceptanceDate: timestamp,
  validUntil: timestamp,

  createdAt: timestamp,
  updatedAt: timestamp
}

// SORA Assessment
{
  id: string,
  organizationId: string,
  sfocId: string,

  // ConOps Summary
  operationType: string,
  operationalVolume: object,
  populationDensity: number,

  // Ground Risk
  intrinsicGRC: number,
  m1aMitigation: { applied: boolean, robustness: string },
  m1bMitigation: { applied: boolean, robustness: string },
  m1cMitigation: { applied: boolean, robustness: string },
  m2Mitigation: { applied: boolean, robustness: string },
  finalGRC: number,

  // Air Risk
  initialARC: string,
  tmprMitigation: { type: string, robustness: string },
  residualARC: string,

  // SAIL Determination
  sailLevel: number,

  // OSO Compliance
  osoCompliance: [
    {
      osoNumber: number,
      requiredRobustness: 'O' | 'L' | 'M' | 'H',
      achievedRobustness: 'O' | 'L' | 'M' | 'H',
      status: 'not_started' | 'in_progress' | 'compliant' | 'non_compliant',
      evidence: [{ type, description, fileUrl }],
      notes: string
    }
  ],

  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Phase 2: SFOC Management Module (Core Feature)

**Files to Create:**
- `src/pages/SFOCHub.jsx` - Main SFOC management hub
- `src/pages/SFOCDetail.jsx` - Individual SFOC detail/editor
- `src/pages/SFOCApplication.jsx` - Step-by-step application wizard

**Components to Create:**
- `src/components/sfoc/SFOCCard.jsx` - SFOC summary card
- `src/components/sfoc/SFOCTimeline.jsx` - Application progress timeline
- `src/components/sfoc/SFOCDocumentChecklist.jsx` - Document requirements tracker
- `src/components/sfoc/SFOCStatusBadge.jsx` - Status indicator
- `src/components/sfoc/ComplexityAssessment.jsx` - Determine medium vs high complexity

**Features:**
1. Create new SFOC application
2. Track document collection progress
3. Link to SORA assessment
4. Link to Manufacturer Declaration
5. Generate submission package
6. Track TC communication
7. Renewal/amendment workflows
8. Expiry tracking and alerts

### Phase 3: RPAS Manufacturer Performance Declaration Module

**Files to Create:**
- `src/pages/ManufacturerDeclarationHub.jsx` - MPD management hub
- `src/pages/ManufacturerDeclarationDetail.jsx` - Individual MPD detail
- `src/pages/ManufacturerDeclarationWizard.jsx` - Creation wizard

**Components to Create:**
- `src/components/mpd/MPDCard.jsx` - Declaration summary card
- `src/components/mpd/SystemDesignSection.jsx` - Design documentation
- `src/components/mpd/SafetyAnalysisSection.jsx` - FHA/FMEA tracking
- `src/components/mpd/PerformanceTestingSection.jsx` - Test results
- `src/components/mpd/EnvironmentalQualSection.jsx` - DO-160/environmental testing
- `src/components/mpd/SoftwareDeclarationSection.jsx` - Custom software documentation
- `src/components/mpd/KineticEnergyCalculator.jsx` - KE calculation tool

**Features:**
1. Create declaration for aircraft >150kg
2. Track all 7 documentation sections
3. Custom software declaration support
4. Kinetic energy calculation
5. Link to SAIL level requirements
6. Evidence upload and management
7. Generate declaration document
8. TC submission tracking

### Phase 4: SORA 2.5 Assessment Tool (Enhanced)

**Files to Modify:**
- `src/lib/soraConfig.js` - Add SAIL/OSO logic for large RPAS

**Files to Create:**
- `src/pages/SORAAssessmentWizard.jsx` - Full SORA wizard
- `src/components/sora/SORAStepNavigator.jsx` - Step navigation

**Components to Create:**
- `src/components/sora/ConOpsBuilder.jsx` - Concept of Operations builder
- `src/components/sora/GRCCalculator.jsx` - Ground Risk Class tool
- `src/components/sora/ARCCalculator.jsx` - Air Risk Class tool
- `src/components/sora/MitigationSelector.jsx` - M1A/M1B/M1C/M2/TMPR
- `src/components/sora/SAILDetermination.jsx` - SAIL matrix tool
- `src/components/sora/OSOComplianceMatrix.jsx` - 24 OSO tracker
- `src/components/sora/OSOEvidencePanel.jsx` - Evidence per OSO
- `src/components/sora/RobustnessIndicator.jsx` - L/M/H robustness display

**Features:**
1. Step-by-step SORA 2.5 methodology
2. ConOps document generation
3. GRC/ARC calculations with mitigations
4. SAIL level determination
5. Full 24 OSO compliance tracking
6. Robustness level evidence management
7. Export SORA report for SFOC submission

### Phase 5: Document Generation & Templates

**Files to Create:**
- `src/lib/sfocDocumentGenerator.js` - Generate SFOC documents
- `src/lib/mpdDocumentGenerator.js` - Generate MPD documents

**Templates to Create:**
- ConOps template (based on TC requirements)
- Safety Plan template
- Emergency Response Plan template
- SORA Report template
- Manufacturer Declaration template
- OSO Evidence Summary template

**Features:**
1. Pre-filled document templates
2. Pull data from Muster (aircraft, crew, etc.)
3. Export to Word/PDF
4. Version tracking
5. Collaborative editing

### Phase 6: Integration & Navigation

**Files to Modify:**
- `src/App.jsx` - Add routes
- `src/components/Layout.jsx` - Add sidebar navigation
- `src/pages/Aircraft.jsx` - Link to MPD for >150kg aircraft
- `src/pages/SafetyDeclarationHub.jsx` - Cross-link to SFOC

**Features:**
1. Sidebar navigation updates
2. Dashboard widgets for SFOC status
3. Aircraft detail integration
4. Calendar integration (SFOC expiry, submission deadlines)
5. Notification system for deadlines

### Phase 7: Cloud Functions & AI Assistance

**Files to Create:**
- `functions/sfocAssistant.js` - AI assistance for SFOC applications
- `functions/soraGuidance.js` - AI guidance for SORA assessments

**Features:**
1. AI assistance for ConOps writing
2. OSO compliance guidance
3. Document review suggestions
4. Regulatory requirement explanations

---

## File Summary

### New Files to Create

| File | Purpose | Lines (Est.) |
|------|---------|--------------|
| `src/lib/firestoreSFOC.js` | SFOC data layer | 600 |
| `src/lib/firestoreManufacturerDeclaration.js` | MPD data layer | 500 |
| `src/lib/soraAssessment.js` | SORA engine | 800 |
| `src/lib/sfocDocumentGenerator.js` | Document generation | 400 |
| `src/lib/mpdDocumentGenerator.js` | MPD document generation | 300 |
| `src/pages/SFOCHub.jsx` | SFOC management hub | 400 |
| `src/pages/SFOCDetail.jsx` | SFOC detail view | 600 |
| `src/pages/SFOCApplication.jsx` | Application wizard | 800 |
| `src/pages/ManufacturerDeclarationHub.jsx` | MPD hub | 350 |
| `src/pages/ManufacturerDeclarationDetail.jsx` | MPD detail | 500 |
| `src/pages/ManufacturerDeclarationWizard.jsx` | MPD wizard | 700 |
| `src/pages/SORAAssessmentWizard.jsx` | SORA wizard | 600 |
| `src/components/sfoc/*` (6 components) | SFOC UI components | 800 |
| `src/components/mpd/*` (7 components) | MPD UI components | 900 |
| `src/components/sora/*` (8 components) | SORA UI components | 1200 |
| `functions/sfocAssistant.js` | AI cloud function | 400 |
| `functions/soraGuidance.js` | AI cloud function | 300 |

**Total Estimated New Code:** ~9,150 lines

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.jsx` | Add 6 new routes |
| `src/components/Layout.jsx` | Add SFOC/MPD navigation section |
| `src/pages/Aircraft.jsx` | Link to MPD for large aircraft |
| `src/pages/Dashboard.jsx` | Add SFOC status widgets |
| `src/lib/soraConfig.js` | Add SAIL/OSO constants |
| `functions/index.js` | Export new functions |

---

## Implementation Order

### Sprint 1: Foundation (Phase 1) - COMPLETE
- [x] Create Firestore schema for SFOC, MPD, SORA
- [x] Implement firestoreSFOC.js CRUD operations (~750 lines)
- [x] Implement firestoreManufacturerDeclaration.js (~650 lines)
- [x] Enhance soraConfig.js with SAIL/OSO data (~200 lines added)

### Sprint 2: SFOC Core (Phase 2) - COMPLETE
- [x] SFOCHub.jsx main page (~430 lines)
- [x] SFOCCard.jsx component (~280 lines)
- [x] CreateSFOCModal.jsx wizard (steps 1-3) (~470 lines)
- [x] SFOCDocumentChecklist.jsx component (~300 lines)
- [x] Status tracking (integrated in SFOCDetail)
- [x] Routes added to App.jsx
- [x] Navigation link added to Layout.jsx

### Sprint 3: SFOC Complete (Phase 2 cont.) - COMPLETE
- [x] SFOCDetail.jsx full view (~450 lines)
- [ ] SFOCApplication.jsx wizard (steps 4-7) - deferred to future sprint
- [ ] Timeline component - placeholder in SFOCDetail
- [ ] TC communication tracking - placeholder in SFOCDetail

### Sprint 4: Manufacturer Declaration (Phase 3)
- [ ] ManufacturerDeclarationHub.jsx
- [ ] ManufacturerDeclarationWizard.jsx
- [ ] System design section
- [ ] Safety analysis section
- [ ] Custom software declaration

### Sprint 5: MPD Complete (Phase 3 cont.)
- [ ] ManufacturerDeclarationDetail.jsx
- [ ] Performance testing section
- [ ] Environmental qualification section
- [ ] Kinetic energy calculator
- [ ] Evidence management

### Sprint 6: SORA Tool (Phase 4)
- [ ] SORAAssessmentWizard.jsx
- [ ] ConOps builder
- [ ] GRC/ARC calculators
- [ ] SAIL determination

### Sprint 7: OSO Compliance (Phase 4 cont.)
- [ ] OSOComplianceMatrix.jsx
- [ ] OSO evidence management
- [ ] Robustness tracking
- [ ] SORA report generation

### Sprint 8: Document Generation (Phase 5)
- [ ] ConOps template
- [ ] Safety Plan template
- [ ] Emergency Response Plan template
- [ ] SORA Report template
- [ ] MPD template

### Sprint 9: Integration (Phase 6)
- [ ] Navigation updates
- [ ] Dashboard widgets
- [ ] Aircraft integration
- [ ] Calendar integration
- [ ] Notifications

### Sprint 10: AI & Polish (Phase 7)
- [ ] Cloud functions for AI assistance
- [ ] ConOps writing assistance
- [ ] OSO guidance
- [ ] Testing and bug fixes

---

## Verification Plan

### Unit Tests
- [ ] SFOC CRUD operations
- [ ] MPD CRUD operations
- [ ] SORA calculations (GRC, ARC, SAIL)
- [ ] OSO robustness determination
- [ ] Kinetic energy calculations

### Integration Tests
- [ ] SFOC wizard flow
- [ ] MPD wizard flow
- [ ] SORA wizard flow
- [ ] Document generation

### E2E Tests
- [ ] Create SFOC for >150kg aircraft
- [ ] Create MPD for aircraft
- [ ] Complete SORA assessment
- [ ] Link SFOC to MPD and SORA
- [ ] Generate submission package
- [ ] Track TC response

---

## Contact Information

For regulatory questions:
- **SFOC Applications:** TC.RPASCentre-CentreSATP.TC@tc.gc.ca
- **Manufacturer Declarations:** TC.RPASDeclaration-DeclarationSATP.TC@tc.gc.ca
- **Processing Times:** Medium/High Complexity = 60 business days

---

## Notes for 400kg Drone with Custom Software

### Specific Requirements for Your Client

1. **Weight Category:** Large RPAS (>150kg) - falls outside normal CAR Part IX framework
2. **Kinetic Energy:** At any reasonable operational speed, will exceed 1084kJ threshold
3. **SAIL Level:** Likely SAIL IV-VI depending on operations - requires HIGH robustness for most OSOs
4. **Custom Software:** Must document per DO-178C or ASTM F3201-16 standards
5. **Direct TC Engagement:** Recommended to contact TC early in the process

### Recommended Approach

1. **Contact TC First:** Email TC.RPASCentre-CentreSATP.TC@tc.gc.ca to discuss the 400kg platform
2. **Engage Early:** 60+ business days processing means start 4-6 months before operations
3. **Third-Party Audits:** At SAIL IV+, expect need for third-party validation
4. **Software DAL:** Determine appropriate Design Assurance Level for custom software
5. **Environmental Testing:** Plan for DO-160 or equivalent testing program

---

*Last Updated: February 6, 2026*
