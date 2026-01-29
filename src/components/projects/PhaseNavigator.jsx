/**
 * PhaseNavigator.jsx
 * 5-phase stepper navigation for project workflow
 * Groups tabs into: PLAN → SITES → SAFETY → FIELD → DELIVER
 *
 * @location src/components/projects/PhaseNavigator.jsx
 */

import {
  ClipboardList,
  MapPin,
  Shield,
  Plane,
  PackageCheck,
  ChevronRight,
  Check
} from 'lucide-react'

// Phase definitions with their associated tabs
export const PHASES = [
  {
    id: 'plan',
    label: 'Plan',
    icon: ClipboardList,
    description: 'Project setup & preparation',
    tabs: ['overview', 'needs', 'costs', 'sections', 'preField', 'templates', 'proposal']
  },
  {
    id: 'sites',
    label: 'Sites',
    icon: MapPin,
    description: 'Site survey & flight planning',
    tabs: ['site', 'flight']
  },
  {
    id: 'safety',
    label: 'Safety',
    icon: Shield,
    description: 'Risk assessment & compliance',
    tabs: ['hseRisk', 'sora', 'emergency', 'ppe', 'comms']
  },
  {
    id: 'field',
    label: 'Field',
    icon: Plane,
    description: 'Crew, equipment & operations',
    tabs: ['crew', 'equipment', 'team', 'notifications', 'review', 'tailgate', 'forms']
  },
  {
    id: 'deliver',
    label: 'Deliver',
    icon: PackageCheck,
    description: 'Post-field & export',
    tabs: ['postField', 'export']
  }
]

// Get phase for a given tab
export function getPhaseForTab(tabId) {
  return PHASES.find(phase => phase.tabs.includes(tabId))?.id || 'plan'
}

// Get all tabs for a phase
export function getTabsForPhase(phaseId) {
  return PHASES.find(phase => phase.id === phaseId)?.tabs || []
}

export default function PhaseNavigator({
  activePhase,
  onPhaseChange,
  project,
  visibleTabs = []
}) {
  // Calculate phase completion (simple heuristic based on data presence)
  const getPhaseStatus = (phase) => {
    switch (phase.id) {
      case 'plan':
        // Plan is complete if basic info is filled
        return project?.name && project?.clientName ? 'complete' : 'active'
      case 'sites':
        // Sites complete if site survey or flight plan has data
        return project?.siteSurvey?.location || project?.flightPlan?.waypoints?.length
          ? 'complete' : 'pending'
      case 'safety':
        // Safety complete if any risk assessment done
        return project?.hseRisk?.risks?.length || project?.sora?.conops
          ? 'complete' : 'pending'
      case 'field':
        // Field ready if crew assigned
        return project?.crew?.length > 0 ? 'complete' : 'pending'
      case 'deliver':
        return 'pending'
      default:
        return 'pending'
    }
  }

  // Check if phase has any visible tabs
  const phaseHasVisibleTabs = (phase) => {
    return phase.tabs.some(tabId => visibleTabs.some(vt => vt.id === tabId))
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-2 py-3 overflow-x-auto">
        {PHASES.map((phase, index) => {
          const Icon = phase.icon
          const isActive = activePhase === phase.id
          const status = getPhaseStatus(phase)
          const hasVisibleTabs = phaseHasVisibleTabs(phase)

          // Skip phases with no visible tabs
          if (!hasVisibleTabs && !isActive) return null

          return (
            <div key={phase.id} className="flex items-center flex-shrink-0">
              {/* Phase Button */}
              <button
                onClick={() => onPhaseChange(phase.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-aeria-navy text-white shadow-md'
                    : status === 'complete'
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {/* Status indicator */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-white/20'
                    : status === 'complete'
                    ? 'bg-green-200'
                    : 'bg-gray-200'
                }`}>
                  {status === 'complete' && !isActive ? (
                    <Check className="w-3.5 h-3.5 text-green-700" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`} />
                  )}
                </div>

                {/* Label */}
                <div className="text-left">
                  <div className={`text-sm font-semibold ${
                    isActive ? 'text-white' : ''
                  }`}>
                    {phase.label}
                  </div>
                  <div className={`text-xs hidden sm:block ${
                    isActive ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {phase.description}
                  </div>
                </div>
              </button>

              {/* Connector */}
              {index < PHASES.length - 1 && (
                <ChevronRight className="w-5 h-5 mx-1 text-gray-300 flex-shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
