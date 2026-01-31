/**
 * OnboardingChecklist.jsx
 * New user onboarding checklist component
 *
 * Guides users through initial setup steps:
 * - Organization setup
 * - Adding aircraft
 * - Adding crew members
 * - Setting up policies
 * - Creating first project
 *
 * @location src/components/onboarding/OnboardingChecklist.jsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Rocket,
  Building2,
  Plane,
  Users,
  FileText,
  FolderKanban,
  Shield,
  X,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganization } from '../../hooks/useOrganization'
import { getAircraft, getOperators, getProjects } from '../../lib/firestore'
import { getPoliciesEnhanced } from '../../lib/firestorePolicies'
import { logger } from '../../lib/logger'

const ONBOARDING_STEPS = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your organization details and contact information',
    link: '/settings',
    icon: Building2,
    checkFn: (data) => data.hasProfile
  },
  {
    id: 'aircraft',
    title: 'Add Your First Aircraft',
    description: 'Register at least one RPAS aircraft',
    link: '/aircraft',
    icon: Plane,
    checkFn: (data) => data.aircraftCount > 0
  },
  {
    id: 'crew',
    title: 'Add Crew Members',
    description: 'Add pilots and other crew members',
    link: '/operators',
    icon: Users,
    checkFn: (data) => data.crewCount > 0
  },
  {
    id: 'policies',
    title: 'Set Up Policies',
    description: 'Import policies from the library or create your own',
    link: '/policies',
    icon: FileText,
    checkFn: (data) => data.policyCount >= 5
  },
  {
    id: 'project',
    title: 'Create Your First Project',
    description: 'Start planning an operation',
    link: '/projects/new',
    icon: FolderKanban,
    checkFn: (data) => data.projectCount > 0
  }
]

export default function OnboardingChecklist({ onDismiss }) {
  const { userProfile, user } = useAuth()
  const { organizationId } = useOrganization()
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [checkData, setCheckData] = useState({
    hasProfile: false,
    aircraftCount: 0,
    crewCount: 0,
    policyCount: 0,
    projectCount: 0
  })

  useEffect(() => {
    loadChecklistData()
  }, [user])

  const loadChecklistData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const [aircraft, operators, policies, projects] = await Promise.all([
        organizationId ? getAircraft(organizationId).catch(() => []) : Promise.resolve([]),
        organizationId ? getOperators(organizationId).catch(() => []) : Promise.resolve([]),
        getPoliciesEnhanced().catch(() => []),
        organizationId ? getProjects(organizationId).catch(() => []) : Promise.resolve([])
      ])

      setCheckData({
        hasProfile: !!(userProfile?.organizationName || userProfile?.displayName),
        aircraftCount: aircraft.length,
        crewCount: operators.length,
        policyCount: policies.length,
        projectCount: projects.length
      })
    } catch (err) {
      logger.error('Failed to load onboarding data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate completion
  const completedSteps = ONBOARDING_STEPS.filter(step => step.checkFn(checkData))
  const completionPercent = Math.round((completedSteps.length / ONBOARDING_STEPS.length) * 100)
  const allComplete = completionPercent === 100

  // Don't show if all complete and dismissed previously
  const dismissedKey = `onboarding_dismissed_${user?.uid}`
  const wasDismissed = localStorage.getItem(dismissedKey) === 'true'

  const handleDismiss = () => {
    localStorage.setItem(dismissedKey, 'true')
    onDismiss?.()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if dismissed and complete
  if (wasDismissed && allComplete) {
    return null
  }

  return (
    <div className={`bg-gradient-to-r ${allComplete ? 'from-green-50 to-emerald-50 border-green-200' : 'from-blue-50 to-indigo-50 border-blue-200'} rounded-xl border overflow-hidden`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <div className={`p-2 rounded-lg ${allComplete ? 'bg-green-100' : 'bg-blue-100'}`}>
            {allComplete ? (
              <Sparkles className="w-5 h-5 text-green-600" />
            ) : (
              <Rocket className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${allComplete ? 'text-green-900' : 'text-blue-900'}`}>
              {allComplete ? 'Setup Complete!' : 'Getting Started'}
            </h3>
            <p className={`text-sm ${allComplete ? 'text-green-700' : 'text-blue-700'}`}>
              {allComplete
                ? 'You\'re all set to use Muster'
                : `${completedSteps.length} of ${ONBOARDING_STEPS.length} steps completed`}
            </p>
          </div>
          {expanded ? (
            <ChevronDown className={`w-5 h-5 ${allComplete ? 'text-green-600' : 'text-blue-600'}`} />
          ) : (
            <ChevronRight className={`w-5 h-5 ${allComplete ? 'text-green-600' : 'text-blue-600'}`} />
          )}
        </button>
        {allComplete && (
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-green-200 rounded ml-2"
            title="Dismiss"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${allComplete ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {ONBOARDING_STEPS.map((step) => {
            const isComplete = step.checkFn(checkData)
            const Icon = step.icon

            return (
              <Link
                key={step.id}
                to={step.link}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isComplete
                    ? 'bg-white/30 text-gray-600'
                    : 'bg-white hover:bg-white/80 shadow-sm'
                }`}
              >
                <div className={`flex-shrink-0 ${isComplete ? 'text-green-500' : 'text-gray-400'}`}>
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <Icon className={`w-5 h-5 ${isComplete ? 'text-gray-400' : 'text-gray-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isComplete ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{step.description}</p>
                </div>
                {!isComplete && (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
