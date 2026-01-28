/**
 * ProjectSections.jsx
 * Toggle visibility of optional project planning sections
 *
 * Batch 2 Update:
 * - Added all project tabs as toggleable sections
 * - Separated core required sections from optional ones
 *
 * @location src/components/projects/ProjectSections.jsx
 */

import PropTypes from 'prop-types'
import {
  MapPin,
  Plane,
  Users,
  AlertTriangle,
  ShieldAlert,
  HardHat,
  Radio,
  FileCheck,
  CheckCircle2,
  Lock,
  Target,
  ClipboardCheck,
  MessageSquare,
  Bell,
  Shield,
  FileText,
  PackageCheck,
  ClipboardList,
  FileEdit,
  Download,
  Layers,
  Info,
  FolderKanban,
  Settings2
} from 'lucide-react'

// Core required sections - always visible
const coreSections = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Project summary, client info, dates, and status.',
    icon: FolderKanban,
    alwaysOn: true
  },
  {
    id: 'needsAnalysis',
    label: 'Needs Analysis',
    description: 'CONOPS pre-planning: operation type, coverage, crew requirements.',
    icon: Target,
    alwaysOn: true
  },
  {
    id: 'sections',
    label: 'Sections',
    description: 'This page - toggle optional sections on/off.',
    icon: Settings2,
    alwaysOn: true
  },
  {
    id: 'crew',
    label: 'Crew & Roles',
    description: 'Assign team members and define their responsibilities.',
    icon: Users,
    alwaysOn: true
  },
  {
    id: 'siteSurvey',
    key: 'siteSurvey',
    label: 'Site Survey',
    description: 'Document operational area, airspace, obstacles, and access routes.',
    icon: MapPin,
    alwaysOn: true
  },
  {
    id: 'flightPlan',
    key: 'flightPlan',
    label: 'Flight Plan',
    description: 'Define aircraft, flight profile, weather minimums, and contingency.',
    icon: Plane,
    alwaysOn: true
  },
  {
    id: 'hseRisk',
    label: 'HSE Risk Assessment',
    description: 'Identify workplace hazards and control measures.',
    icon: AlertTriangle,
    alwaysOn: true
  },
  {
    id: 'sora',
    label: 'SORA Assessment',
    description: 'SORA 2.5 risk assessment: GRC, ARC, SAIL, OSOs.',
    icon: Shield,
    alwaysOn: true
  },
  {
    id: 'emergency',
    label: 'Emergency Plan',
    description: 'Emergency contacts, muster points, evacuation routes.',
    icon: ShieldAlert,
    alwaysOn: true
  },
  {
    id: 'ppe',
    label: 'PPE Requirements',
    description: 'Required personal protective equipment for the operation.',
    icon: HardHat,
    alwaysOn: true
  },
  {
    id: 'comms',
    label: 'Communications',
    description: 'Communication methods, radio channels, check-in protocols.',
    icon: Radio,
    alwaysOn: true
  },
  {
    id: 'review',
    label: 'Review & Approval',
    description: 'Document review, approval chain, and crew acknowledgments.',
    icon: FileCheck,
    alwaysOn: true
  },
  {
    id: 'tailgate',
    label: 'Tailgate Briefing',
    description: 'Pre-operation briefing checklist and Go/No-Go decision.',
    icon: FileText,
    alwaysOn: true
  },
  {
    id: 'export',
    label: 'Export',
    description: 'Generate and download project documentation.',
    icon: Download,
    alwaysOn: true
  }
]

// Optional toggleable sections
const optionalSections = [
  {
    id: 'preField',
    key: 'preField',
    label: 'Pre-Field Phase',
    description: 'Track pre-field tasks and costs before field operations.',
    icon: ClipboardCheck,
    alwaysOn: false
  },
  {
    id: 'team',
    key: 'team',
    label: 'Team Discussion',
    description: 'Project comments and team collaboration.',
    icon: MessageSquare,
    alwaysOn: false
  },
  {
    id: 'notifications',
    key: 'notifications',
    label: 'Notifications',
    description: 'Distribution lists and team notification settings.',
    icon: Bell,
    alwaysOn: false
  },
  {
    id: 'postField',
    key: 'postField',
    label: 'Post-Field Phase',
    description: 'Track post-field tasks, deliverables, and costs.',
    icon: PackageCheck,
    alwaysOn: false
  },
  {
    id: 'forms',
    key: 'forms',
    label: 'Forms',
    description: 'Project-linked form submissions and tracking.',
    icon: ClipboardList,
    alwaysOn: false
  },
  {
    id: 'proposal',
    key: 'proposal',
    label: 'Proposal',
    description: 'Generate client-facing project proposals.',
    icon: FileEdit,
    alwaysOn: false
  },
  {
    id: 'templates',
    key: 'templates',
    label: 'Templates',
    description: 'Save and load project templates.',
    icon: Layers,
    alwaysOn: false
  }
]

export default function ProjectSections({ project, onUpdate }) {
  const handleToggle = (sectionKey) => {
    const currentValue = project.sections?.[sectionKey] ?? false
    onUpdate({
      sections: {
        ...project.sections,
        [sectionKey]: !currentValue
      }
    })
  }

  const renderSection = (section) => {
    const isEnabled = section.alwaysOn || project.sections?.[section.key]
    const Icon = section.icon

    return (
      <div
        key={section.id}
        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
          isEnabled
            ? 'bg-aeria-sky/30 border-aeria-light-blue/30'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        {/* Icon */}
        <div className={`p-2 rounded-lg ${isEnabled ? 'bg-aeria-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
              {section.label}
            </h3>
            {section.alwaysOn && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                <Lock className="w-3 h-3" />
                Required
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 ${isEnabled ? 'text-gray-600' : 'text-gray-400'}`}>
            {section.description}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex-shrink-0">
          {section.alwaysOn ? (
            <div className="w-10 h-6 flex items-center justify-center" aria-label={`${section.label} is required`}>
              <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden="true" />
            </div>
          ) : (
            <button
              onClick={() => handleToggle(section.key)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                isEnabled ? 'bg-aeria-navy' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isEnabled}
              aria-label={`Toggle ${section.label} section`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Count enabled optional sections
  const enabledOptionalCount = optionalSections.filter(s => project.sections?.[s.key]).length

  return (
    <div className="space-y-6">
      {/* Optional Sections */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Optional Sections</h2>
          <span className="text-sm text-gray-500">
            {enabledOptionalCount} of {optionalSections.length} enabled
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Enable additional sections based on your project needs. These tabs will appear in the project navigation.
        </p>

        <div className="space-y-3">
          {optionalSections.map(renderSection)}
        </div>
      </div>

      {/* Core Sections */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Core Sections</h2>
        <p className="text-sm text-gray-500 mb-6">
          These sections are required for complete operations planning and cannot be disabled.
        </p>

        <div className="space-y-3">
          {coreSections.map(renderSection)}
        </div>
      </div>

      {/* Info box about SORA */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">About Risk Assessment</h3>
            <p className="text-sm text-blue-700 mt-1">
              The <strong>HSE Risk Assessment</strong> identifies workplace hazards and control measures.
              The <strong>SORA 2.5</strong> (Specific Operations Risk Assessment) calculates Ground Risk Class,
              Air Risk Class, and determines the required SAIL level and Operational Safety Objectives.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

ProjectSections.propTypes = {
  project: PropTypes.shape({
    sections: PropTypes.object
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}
