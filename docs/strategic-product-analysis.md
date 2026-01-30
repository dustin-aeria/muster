# Strategic Product Analysis: Aeria Ops Market Expansion

**Date:** January 29, 2026
**Purpose:** Deep research analysis on expanding Aeria Ops to serve broader field operations market

---

## Executive Summary

Your software has a **strong foundation** in regulatory compliance and safety management that most field service competitors lack. The key to becoming a "slam dunk" SaaS for broader field operations is to **keep your compliance DNA** while adding the operational and financial features that make software indispensable for day-to-day work.

---

## Part 1: What You're Doing Exceptionally Well

### Your Competitive Moat: Compliance-First Architecture

Most field service software (ServiceTitan, Jobber, BuildOps) focuses on **scheduling → dispatch → invoice**. They bolt on compliance as an afterthought. You've built it the opposite way—**compliance and safety are core**, which is exactly what regulated industries need.

**Unique Differentiators:**

| Feature | Competitors | Aeria Ops |
|---------|-------------|-----------|
| SORA Risk Assessment (JARUS 2.5) | None | Full implementation |
| Regulatory notification triggers (TSB, Transport Canada) | None | Built-in logic |
| Formal Hazard Analysis with risk matrix | Basic checklists | Full FHA workflow |
| JHSC integration | None | Complete module |
| COR audit tracking | Generic compliance | Purpose-built |
| Multi-site operations with per-site risk | Single job focus | Native support |

**Why This Matters:**
Enterprises increasingly require **audit-ready logs, OSHA-aligned documentation, and compliance tracking**. You already have this. Most competitors would need years to catch up.

---

## Part 2: What's Missing for Enterprise Adoption

Enterprises require specific capabilities before adoption. Here's your gap analysis:

### Critical Gaps (Must Have for Enterprise)

| Gap | Why It Matters | Effort |
|-----|----------------|--------|
| **Multi-Tenancy / Organizations** | Large companies like Ledcor have divisions. Each division needs isolated data with parent-level visibility. | High |
| **Role-Based Access Control (RBAC)** | Field tech vs. supervisor vs. manager vs. admin need different permissions. Enterprise IT teams require this. | High |
| **SSO (Single Sign-On)** | Enterprises won't adopt software requiring separate credentials. SAML/OIDC integration is table stakes. | Medium |
| **Audit Logging** | Who changed what, when. Required for ISO 27001, SOC 2 compliance that enterprises demand. | Medium |
| **Invoicing & Billing** | You track costs beautifully but can't generate invoices. This is the #1 feature that creates stickiness—touch their money. | High |

### High-Value Gaps (Competitive Advantage)

| Gap | Why It Matters |
|-----|----------------|
| **Full Offline Sync** | Field operators work in remote areas. Your map caching is a start but need form submission queueing. |
| **Time Tracking** | Integrate with crew management. Track hours worked per project/task. Feed directly into billing. |
| **Progress Billing** | Construction and field services use progress billing—invoice based on % complete, not just time & materials. |
| **Client Portal** | Let clients view project status, approve deliverables, access reports. Reduces your admin burden and increases perceived value. |
| **Subcontractor Management** | Managing subs (compliance, insurance verification, payment tracking) is critical for larger operations. |

---

## Part 3: Making It Sticky for Any Field Operator

**SaaS stickiness comes from embedding into daily workflows**. Here's how to achieve that:

### The "Can't Live Without It" Features

**1. Touch Their Money**
- Generate invoices directly from completed projects
- Support multiple billing methods: Fixed price, T&M, Progress billing, Per-unit
- Integration with QuickBooks, Xero, Sage
- Payment tracking and aging reports

**2. Be Their System of Record**
- Equipment certifications with expiry alerts (you have this!)
- Insurance tracking with client-facing certificates (you have this!)
- Training records that prove competency for contracts
- Permit expiry calendar that prevents compliance gaps

**3. Reduce Administrative Burden**
- Auto-generate reports clients need (daily logs, safety reports, compliance certificates)
- Pre-populate forms from project data
- Smart templates that remember preferences
- Bulk operations (assign equipment to multiple projects, update rates across services)

**4. Create Network Effects**
- Subcontractor invitations (limited access to specific projects)
- Client portal access (view-only dashboards)
- Equipment sharing between operators (rental tracking)

---

## Part 4: Expansion to Adjacent Markets

Your drone/remote sensing focus is actually a **feature, not a limitation**. Here's how the same platform serves adjacent field operations:

### Natural Market Expansion

| Market | Why It Fits | What to Add |
|--------|-------------|-------------|
| **Pipeline Inspection** | Same safety culture, same compliance needs, same equipment tracking | Pipeline-specific forms, ILI (in-line inspection) data integration |
| **Environmental Consulting** | Field data collection, regulatory compliance, reporting | Sample chain-of-custody, lab result integration |
| **Surveying** | Equipment management, field crews, site work | Survey-specific deliverables, coordinate system support |
| **Utility Construction** | Scheduling, compliance, safety | Fiber/cable-specific milestones, utility locates integration |
| **Tower/Telecom** | Height work safety, equipment certification, regulatory compliance | Tower-specific safety protocols, RF exposure tracking |
| **Solar/Wind Installation** | Equipment tracking, safety management, project lifecycle | Energy production tracking, grid connection compliance |

### The Common Thread

All these industries need:
- **Regulatory compliance documentation**
- **Safety management (incidents, hazards, training)**
- **Equipment/asset tracking with maintenance**
- **Field crew management**
- **Client-facing deliverables and reporting**

You have all of this. The differentiation is in the **industry-specific templates, forms, and compliance rules**—not the core architecture.

---

## Part 5: Enterprise Architecture Requirements

For companies like Ledcor (7,000 employees, $3B revenue), here's what their IT team requires:

### Organization Hierarchy

```
Parent Company (Ledcor Group)
├── Division: Technical Services
│   ├── Team: Fiber Installation - West
│   ├── Team: Fiber Installation - East
│   └── Team: Maintenance
├── Division: Construction
│   ├── Team: Commercial
│   └── Team: Industrial
└── Division: Resources
    ├── Team: Pipeline
    └── Team: Mining Services
```

**What This Requires:**
- Data isolation between divisions (can't see each other's projects)
- Roll-up reporting to parent level
- Shared resources (equipment can be assigned across divisions)
- Division-level admins vs. company-level admins
- Cost center tracking for internal billing

### Security & Compliance

| Requirement | Why |
|-------------|-----|
| SOC 2 Type II | Procurement requirement for most enterprises |
| Data residency options | Canadian companies may require Canadian data centers |
| Encryption at rest and in transit | Table stakes |
| Session management | Force logout, session timeout policies |
| IP allowlisting | Restrict access to corporate networks |

---

## Part 6: Recommended Roadmap

### Phase 1: Foundation (Stickiness) — 3-4 months

1. **Invoicing Module**
   - Generate invoices from project costs
   - Support Fixed, T&M, Progress billing
   - PDF generation with company branding
   - Payment status tracking

2. **Time Tracking**
   - Crew time entry per project/task
   - Approval workflow
   - Integration with cost calculations

3. **Client Portal (Basic)**
   - Read-only project status
   - Document/deliverable access
   - Branded login page

### Phase 2: Enterprise Ready — 3-4 months

1. **Multi-Tenancy / Organizations**
   - Organization entity with data isolation
   - User belongs to organization(s)
   - Organization-level settings

2. **Role-Based Access Control**
   - Admin, Manager, Operator, Viewer roles
   - Granular permissions per module
   - Role assignment UI

3. **Audit Logging**
   - Track all data changes
   - Who, what, when, before/after values
   - Exportable for compliance

4. **SSO Integration**
   - SAML 2.0 support
   - Google Workspace, Microsoft Entra ID, Okta

### Phase 3: Market Expansion — 4-6 months

1. **Full Offline Sync**
   - IndexedDB for local storage
   - Background sync when online
   - Conflict resolution UI

2. **Subcontractor Management**
   - Limited-access invitations
   - Insurance/compliance verification
   - Payment tracking

3. **Industry Templates**
   - Pipeline inspection package
   - Environmental consulting package
   - Surveying package
   - Construction package

4. **Integrations**
   - QuickBooks/Xero (accounting)
   - Google Calendar/Outlook (scheduling)
   - ArcGIS/QGIS (GIS data)

### Phase 4: Scale — Ongoing

1. **White-Label / Partner Program**
   - Allow larger companies to rebrand
   - API access for custom integrations

2. **Mobile Native App**
   - iOS and Android apps
   - Push notifications
   - Camera integration for inspections

3. **Advanced Analytics**
   - Cross-project reporting
   - Utilization dashboards
   - Profitability analysis

---

## Part 7: What Makes This a "Slam Dunk"

### For Standalone Operators (SMB)

- **All-in-one platform**: Projects, safety, compliance, billing in one place
- **Professional image**: Branded proposals, reports, invoices
- **Compliance confidence**: Know you're meeting regulatory requirements
- **Cost tracking**: Understand profitability per project

### For Enterprise Divisions

- **IT-approved**: SSO, audit logs, data isolation
- **Scalable**: Works for 5 people or 500
- **Compliance-ready**: Documentation for tenders, audits, certifications
- **Integration-friendly**: Connects to existing ERP/accounting

### The Emotional Hook

Field operators don't want software. They want:
- **Less paperwork** → Forms auto-populate, reports auto-generate
- **Fewer compliance headaches** → Alerts before things expire
- **Getting paid faster** → Invoices from completed work
- **Looking professional to clients** → Branded deliverables
- **Not losing equipment** → Know where everything is
- **Passing audits** → Documentation is organized

Your software already solves most of these. The invoicing and enterprise features complete the picture.

---

## Summary: The Path to Slam Dunk SaaS

| Current State | Gap | Target State |
|---------------|-----|--------------|
| Compliance-first architecture | Limited to drone ops | Compliance-first for ALL field ops |
| Cost tracking | No invoicing | Full billing cycle |
| Single user focus | No multi-tenancy | Organization hierarchy |
| Web responsive | Limited offline | Full offline sync |
| Good safety module | Missing time tracking | Safety + time + billing integrated |
| Templates exist | Industry-specific | Packages per vertical |

**Your unfair advantage**: You've built what enterprise compliance teams wish every field service tool had. Now wrap it in the operational features that make it indispensable for daily work.

---

## Current Feature Inventory

Based on codebase analysis (42 pages, 177 components, 60+ library utilities):

### What Aeria Ops Currently Has

**Project Management**
- Multi-site operations planning
- Comprehensive project lifecycle (Draft → Planning → Active → Completed → Archived)
- Project templates and duplication
- Needs Analysis / ConOps pre-planning
- Team management and crew assignment
- Comments and collaboration

**Operations Planning**
- Flight plan management with Mapbox integration
- Site survey tools (polygon drawing, measurements)
- Equipment and crew assignment
- PPE and safety gear requirements
- Emergency procedures mapping
- Communications plans
- Pre-field checklists
- AI-generated tailgate briefings (Claude API)
- Post-field reporting

**SORA Compliance (JARUS 2.5)**
- SAIL risk classification (I-VI)
- ConOps assessment
- Ground risk mitigation (M1A, M1B, M1C, M2)
- Air risk assessment with TMPR
- Per-site SORA calculations
- Interactive risk matrix

**Safety Management**
- Incident tracking with severity classification
- RPAS-specific incident types
- Regulatory trigger identification (TSB, Transport Canada, WorkSafeBC)
- CAPAs with effectiveness verification
- Inspections with findings and follow-up
- Safety KPIs and dashboards
- Field hazard reviews
- Formal Hazard Analysis (FHA)
- JHSC meetings and recommendations

**Compliance & Regulatory**
- Compliance applications (SFOC, Prequalification)
- Compliance templates
- Permit management
- Knowledge base with AI suggestions
- Document parsing

**Training & Competency**
- Course management
- Training records
- Training metrics and KPIs
- Competency matrix

**Maintenance Management**
- Interval-based scheduling (hours, cycles, calendar)
- Maintenance records and alerts
- Grounding management
- Return-to-service tracking

**Equipment & Fleet**
- Complete equipment library
- Equipment categories and status tracking
- Equipment costs (hourly/daily/weekly rates)
- Equipment import/export
- Aircraft spec sheets with PDF export

**Cost Estimation**
- Project cost estimation
- Equipment and personnel rates
- Cost categories
- Rate management

**Policies & Procedures**
- Policy library with search
- Version control
- Policy acknowledgment tracking
- Procedure library

**Client & Services**
- Client database with branding
- Services offering with pricing

**Operators & Crew**
- Operator profiles and certifications
- Certification expiry alerts
- Role and status tracking

**Forms & Checklists**
- Dynamic form builder
- Risk assessment integration
- RPAS incident auto-flagging

**Dashboard & Analytics**
- Home dashboard with key metrics
- SORA overview
- Policy status
- Certification and maintenance alerts
- Activity feed

**Insurance Management**
- Insurance policy tracking
- Expiry alerts
- Multiple policy types

---

## Sources

- [IFS - Best Field Service Management Software](https://blog.ifs.com/best-field-service-management-software/)
- [NetSuite - 19 Field Service Management Features](https://www.netsuite.com/portal/resource/articles/erp/field-services-management-features.shtml)
- [Salesforce - 6 Best FSM Software 2025](https://www.salesforce.com/service/field-service-management/software/)
- [BuildOps - Enterprise FSM Software](https://buildops.com/resources/enterprise-field-service-management-software/)
- [WorkOS - Enterprise Ready Guide](https://workos.com/guide/the-guide-to-becoming-enterprise-ready-for-saas-product-managers)
- [Descope - B2B SaaS Enterprise Readiness](https://www.descope.com/blog/post/b2b-saas-enterprise-readiness)
- [Microsoft - Multi-tenant SaaS Architecture](https://learn.microsoft.com/en-us/azure/architecture/guide/saas-multitenant-solution-architecture/)
- [Userpilot - SaaS Customer Retention](https://userpilot.com/blog/saas-customer-retention/)
- [CIO - Ledcor Cloud Workforce Scheduling](https://www.cio.com/article/288854/cloud-computing-construction-company-looks-to-the-cloud-for-workforce-scheduling.html)
- [Procore - Subcontractor Management](https://www.procore.com/subcontractors)
- [Fulcrum - Field Data Collection](https://www.fulcrumapp.com/)
- [ArcGIS Field Maps](https://www.esri.com/en-us/arcgis/products/arcgis-field-maps/overview)
- [Knowify - Progress Billing](https://knowify.com/resources/progress-billing-in-construction/)
- [Frontegg - Multi-tenant Architecture](https://frontegg.com/blog/saas-multitenancy)
- [ServiceTitan vs BuildOps Comparison](https://www.servicetitan.com/comparison/servicetitan-versus-buildops)
- [Field Eagle - Oil & Gas Inspection](https://www.fieldeagle.com/oil-and-gas-inspection-software/)
- [KPA - Oil & Gas Safety Software](https://kpa.io/oil-and-gas-safety-management-software/)
