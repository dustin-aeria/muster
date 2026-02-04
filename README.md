# Muster

RPAS Operations Management System - A comprehensive platform for drone operations planning, compliance, and safety management.

**Live:** [muster-app.com](https://muster-app.com)

## Overview

Muster is a purpose-built SaaS application for commercial drone operators that integrates HSE (Health, Safety, and Environment) protocols with RPAS operational workflows. It provides multi-tenant team management, regulatory compliance tracking, and streamlined project planning.

### Key Features

- **Multi-Tenant Teams** - Organization management with role-based access (Admin, Management, Operator, Viewer)
- **Project Workflow** - End-to-end project planning from needs analysis to flight execution
- **SORA Integration** - JARUS SORA 2.5 compliant risk assessment and SAIL determination
- **CONOPS Builder** - Mission profiles for aerial, marine, and ground-based operations
- **Regulatory Pathways** - Automatic determination of Basic/Advanced/SFOC/Level 1 Complex requirements
- **Formal Hazard Assessments** - 60+ FHA templates with risk matrices
- **Policy & Procedure Management** - Document control with version tracking
- **Equipment Management** - Fleet tracking, maintenance scheduling, compliance monitoring
- **Team Notifications** - Email invitations and notifications via Resend
- **Interactive Maps** - Mapbox integration with airspace visualization
- **PDF Exports** - Professional operations plans and reports

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5 |
| Styling | Tailwind CSS |
| Backend | Firebase (Auth, Firestore, Storage, Cloud Functions) |
| Hosting | Vercel |
| Email | Resend API |
| Maps | Mapbox GL JS |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Firebase project
- Resend account (for emails)
- Mapbox account (for maps)

### Installation

```bash
# Clone the repository
git clone https://github.com/dustin-aeria/muster.git
cd muster

# Install dependencies
npm install

# Install functions dependencies
cd functions && npm install && cd ..

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Mapbox
VITE_MAPBOX_TOKEN=
```

For Cloud Functions, configure `functions/.env`:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=Muster <notifications@yourdomain.com>
APP_URL=https://muster-app.com
```

## Project Structure

```
muster/
├── src/
│   ├── components/       # React components (250+)
│   │   ├── compliance/   # Compliance tracking
│   │   ├── equipment/    # Fleet management
│   │   ├── fha/          # Hazard assessments
│   │   ├── maintenance/  # Maintenance scheduling
│   │   ├── map/          # Mapbox integration
│   │   ├── permits/      # SFOC/RPPL management
│   │   ├── policies/     # Policy management
│   │   ├── projects/     # Project workflow (core)
│   │   ├── settings/     # Organization settings
│   │   ├── training/     # Training records
│   │   └── ui/           # Reusable UI components
│   │
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.jsx
│   │   └── OrganizationContext.jsx
│   │
│   ├── data/             # Static data & templates
│   │   ├── defaultFHATemplates.js
│   │   └── policyContent.js
│   │
│   ├── hooks/            # Custom React hooks
│   │
│   ├── lib/              # Services & utilities (70+)
│   │   ├── firebase*.js  # Firebase services
│   │   ├── *Export.js    # PDF generation
│   │   └── sora*.js      # SORA calculations
│   │
│   └── pages/            # Page components (50+)
│
├── functions/            # Firebase Cloud Functions
│   ├── index.js          # Email triggers
│   └── sendEmail.js      # Email service
│
└── docs/                 # Documentation
```

## Deployment

### Vercel (Frontend)

Push to `main` branch triggers automatic deployment.

### Firebase Functions

```bash
firebase deploy --only functions
```

### Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Regulatory Framework

Muster supports multiple regulatory frameworks:

- **Transport Canada** - CARs Part IX (Basic, Advanced, SFOC, Level 1 Complex)
- **EASA** - EU 2019/947 (Open, Specific, Certified)
- **FAA** - 14 CFR Part 107

## License

Proprietary - All rights reserved.
