# AI-Driven Document Generation System - Implementation Tracker

## Overview
Add an intelligent document generation tool using Claude API to create compliance documentation suites through conversational Q&A workflows.

**Key Concept:** PROJECT = CLIENT - one project contains multiple documents sharing context.

---

## Implementation Status

| Phase | Description | Status | Approval |
|-------|-------------|--------|----------|
| 1 | Foundation (Data Architecture + Claude API) | COMPLETE | Approved |
| 2 | Core UI (Project & Document Management) | COMPLETE | Approved |
| 3 | Conversation System | COMPLETE | Approved |
| 4 | Document Editing | Not Started | Pending |
| 5 | Cross-References & Context | Not Started | Pending |
| 6 | Export & Branding | Not Started | Pending |

---

## Phase 1: Foundation (Data Architecture + Claude API)

### Status: COMPLETE

### Completed Tasks:
- [x] Created `src/lib/firestoreDocumentGeneration.js` - Firestore service with CRUD operations
- [x] Created `functions/documentGeneration.js` - Cloud Functions with Claude API integration
- [x] Updated `functions/package.json` - Added `@anthropic-ai/sdk` dependency
- [x] Updated `functions/index.js` - Exported new Cloud Functions
- [x] Updated `firestore.rules` - Added security rules for documentProjects, generatedDocuments, documentConversations
- [x] Updated `firestore.indexes.json` - Added composite indexes for new collections

### Files Created:

#### 1. `src/lib/firestoreDocumentGeneration.js`
- Full CRUD for documentProjects and generatedDocuments collections
- Real-time subscriptions with onSnapshot
- Section management (add, update, delete, reorder)
- Cross-reference management
- Export tracking
- Constants for PROJECT_STATUSES, DOCUMENT_STATUSES, DOCUMENT_TYPES
- Callable function wrappers for Claude API

#### 2. `functions/documentGeneration.js`
- `sendDocumentMessage` - Send message to Claude for document assistance
- `generateSectionContent` - Generate content for specific sections
- `getOrganizationTokenUsage` - Track token usage per organization
- Rate limiting (100 messages/hour per organization)
- Knowledge base search integration
- Document type-specific system prompts
- Context building with project/document context

### Data Architecture:

**`documentProjects`** collection:
```javascript
{
  organizationId, clientId, clientName, name, description,
  status: 'active' | 'completed' | 'archived',
  branding: { name, logo, colors: { primary, secondary, accent } },
  sharedContext: { companyProfile, operationsScope, aircraftTypes, regulations, customContext },
  documentIds: [],
  createdBy, createdAt, updatedAt
}
```

**`generatedDocuments`** collection:
```javascript
{
  documentProjectId, organizationId,
  type: 'sms' | 'training_manual' | 'maintenance_plan' | ...,
  title, version, status: 'draft' | 'in_review' | 'approved' | 'published',
  sections: [{ id, title, content, order, generatedFrom }],
  crossReferences: [{ targetDocumentId, targetSectionId, referenceText }],
  localContext: { specificRequirements, sourceReferences, regulatoryReferences },
  exports: [{ exportedAt, format, fileUrl }],
  createdBy, createdAt, updatedAt
}
```

**`documentConversations/{documentId}/messages`** subcollection:
```javascript
{
  role: 'user' | 'assistant' | 'system',
  content, tokenUsage: { promptTokens, completionTokens },
  contextSnapshot: { knowledgeBaseDocsUsed },
  createdAt
}
```

---

## Phase 2: Core UI (Project & Document Management)

### Status: COMPLETE

### Files Created:
- `src/pages/DocumentProjects.jsx` - List of document projects
- `src/pages/DocumentProjectView.jsx` - Project overview with document list
- `src/components/documentGeneration/DocumentProjectList.jsx`
- `src/components/documentGeneration/DocumentProjectCard.jsx`
- `src/components/documentGeneration/CreateProjectModal.jsx`
- `src/components/documentGeneration/DocumentList.jsx`
- `src/components/documentGeneration/DocumentCard.jsx`
- `src/components/documentGeneration/CreateDocumentModal.jsx`
- `src/components/documentGeneration/DocumentTypeSelector.jsx`

### Route Integration:
- Add `/document-projects` route to App.jsx
- Add `/document-projects/:projectId` route to App.jsx
- Add navigation item to Layout.jsx sidebar

---

## Phase 3: Conversation System

### Status: COMPLETE

### Files Created:
- `src/pages/DocumentEditor.jsx` - Three-panel layout (sections, editor, chat)
- `src/components/documentGeneration/ConversationPanel.jsx` - Main chat interface with real-time updates
- `src/components/documentGeneration/ConversationMessage.jsx` - Chat bubbles with markdown rendering
- `src/components/documentGeneration/MessageInput.jsx` - Input with quick actions
- `src/components/documentGeneration/KnowledgeBasePanel.jsx` - Referenced KB documents display
- `src/components/documentGeneration/ContextStatusBar.jsx` - Token usage indicator

### Route Integration:
- Added `/document-projects/:projectId/documents/:documentId` route to App.jsx

### Features Implemented:
- Real-time chat with Claude via Cloud Functions
- Message history persistence with Firestore subscriptions
- Knowledge base reference display with search
- Token usage indicator with progress bar and warnings
- Quick actions (Generate, Improve, Checklist, Review)
- Collapsible long messages
- Copy to clipboard for assistant responses
- Three-panel editor layout (sections sidebar, editor, chat)

---

## Phase 4: Document Editing

### Status: NOT STARTED

### Planned Files:
- `src/components/documentGeneration/SectionList.jsx` - Draggable section navigation
- `src/components/documentGeneration/SectionEditor.jsx` - Markdown editor
- `src/components/documentGeneration/ContentInsertModal.jsx` - Accept/edit AI content

### Features:
- Markdown editing with preview
- Insert AI-generated content into sections
- Section drag-drop reordering
- Auto-save with debounce

---

## Phase 5: Cross-References & Context

### Status: NOT STARTED

### Planned Files:
- `src/components/documentGeneration/SharedContextPanel.jsx`
- `src/components/documentGeneration/CrossReferenceManager.jsx`
- `src/components/documentGeneration/DocumentLinkPopover.jsx`

### Features:
- Edit project-wide shared context
- Create cross-references between documents
- Context persistence in Claude conversations

---

## Phase 6: Export & Branding

### Status: NOT STARTED

### Planned Files:
- `src/components/documentGeneration/DocumentExportModal.jsx`
- `src/components/documentGeneration/DocumentPreview.jsx`
- `src/components/documentGeneration/BrandingPreview.jsx`
- `src/lib/documentExportService.js`

### Features:
- Export to PDF, DOCX, MD
- Apply client branding (logo, colors)
- Cross-reference appendix
- Live preview with branding

---

## Document Types Supported

| Type | Label | Key Sections |
|------|-------|--------------|
| `sms` | Safety Management System | Policy, Risk Mgmt, Assurance, Promotion |
| `training_manual` | Training Manual | Ground, Flight, Proficiency, Recurrent |
| `maintenance_plan` | Maintenance Program | Policy, Schedule, Procedures, Records |
| `ops_manual` | Operations Manual | Organization, Flight Ops, Emergency |
| `safety_declaration` | Safety Declaration | Declaration, Scope, Risk Assessment |
| `hse_manual` | HSE Manual | Policy, Hazards, Incidents, PPE |
| `risk_assessment` | Risk Assessment | Scope, Hazards, Analysis, Mitigations |
| `sop` | Standard Operating Procedure | Purpose, Responsibilities, Steps |
| `erp` | Emergency Response Plan | Overview, Contacts, Procedures |
| `compliance_matrix` | Compliance Matrix | Requirements, Status, Evidence |

---

## Security Measures

1. **Claude API key** - Stored only in Cloud Functions environment (never client-side)
2. **All API calls** - Through Firebase callable functions with authentication
3. **Firestore rules** - Organization-based access control
4. **Rate limiting** - 100 messages per hour per organization
5. **Input validation** - Message length limits, ID validation
6. **Role-based access** - Only operators, management, admins can use

---

## Environment Variables Required

Add to Cloud Functions environment:
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Verification Checklist

- [ ] Phase 1: Deploy Cloud Function, test Claude API call via Firebase console
- [ ] Phase 2: Create project, verify Firestore documents, navigate UI
- [ ] Phase 3: Send messages, verify real-time updates, check token tracking
- [ ] Phase 4: Edit sections, insert AI content, verify auto-save
- [ ] Phase 5: Create cross-references, verify context in conversations
- [ ] Phase 6: Export PDF, verify branding applied correctly

---

## Change Log

| Date | Phase | Changes |
|------|-------|---------|
| 2026-02-04 | 1 | Created firestoreDocumentGeneration.js and documentGeneration.js |
| 2026-02-04 | 1 | Added @anthropic-ai/sdk to package.json |
| 2026-02-04 | 1 | Exported Cloud Functions in index.js |
| 2026-02-04 | 1 | Added Firestore security rules and indexes |
| 2026-02-04 | 1 | **PHASE 1 COMPLETE** |
| 2026-02-04 | 2 | Created DocumentProjects.jsx and DocumentProjectView.jsx pages |
| 2026-02-04 | 2 | Created 7 components: DocumentProjectList, DocumentProjectCard, CreateProjectModal, DocumentList, DocumentCard, CreateDocumentModal, DocumentTypeSelector |
| 2026-02-04 | 2 | Added routes to App.jsx |
| 2026-02-04 | 2 | Added navigation to Layout.jsx (under Compliance section) |
| 2026-02-04 | 2 | **PHASE 2 COMPLETE** |
| 2026-02-04 | 3 | Created DocumentEditor.jsx page (three-panel layout) |
| 2026-02-04 | 3 | Created ConversationPanel.jsx (main chat interface) |
| 2026-02-04 | 3 | Created ConversationMessage.jsx (chat bubbles with markdown) |
| 2026-02-04 | 3 | Created MessageInput.jsx (input with quick actions) |
| 2026-02-04 | 3 | Created KnowledgeBasePanel.jsx (KB references display) |
| 2026-02-04 | 3 | Created ContextStatusBar.jsx (token usage indicator) |
| 2026-02-04 | 3 | Added document editor route to App.jsx |
| 2026-02-04 | 3 | Updated component index.js exports |
| 2026-02-04 | 3 | **PHASE 3 COMPLETE** |

---

## Notes

- Phases 1, 2, and 3 are complete. Ready for Phase 4 approval.
- Each phase requires explicit approval before proceeding
- Remember to run `npm install` in the functions directory to install @anthropic-ai/sdk
- Remember to set ANTHROPIC_API_KEY in Cloud Functions environment variables
- Document Generator is accessible from sidebar under Compliance > Document Generator
- Document editor accessible at `/document-projects/:projectId/documents/:documentId`
