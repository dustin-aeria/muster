/**
 * Dashboard.jsx
 * Enhanced dashboard with operations overview and policy alerts
 *
 * Features:
 * - Live statistics from Firestore
 * - Multi-site project summary
 * - Policy review status alerts
 * - Time tracking summary
 * - Quick links to new features
 *
 * @location src/pages/Dashboard.jsx
 * @action REPLACE
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganizationContext } from '../contexts/OrganizationContext'
import {
  FolderKanban,
  ClipboardList,
  AlertTriangle,
  Plus,
  ArrowRight,
  MapPin,
  BookOpen,
  AlertCircle,
  Layers
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getProjects, getForms, getOperators, getPolicies } from '../lib/firestore'
import { format, isThisWeek, isToday, addDays, isBefore } from 'date-fns'
import { getStatusInfo } from '../components/PolicyLibrary'
import { logger } from '../lib/logger'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import UpcomingEvents from '../components/dashboard/UpcomingEvents'
import ExpiryRemindersWidget from '../components/dashboard/ExpiryRemindersWidget'
import MaintenanceAlertWidget from '../components/maintenance/MaintenanceAlertWidget'
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist'
import TimeSummaryWidget from '../components/time/TimeSummaryWidget'
import SFOCStatusWidget from '../components/dashboard/SFOCStatusWidget'

export default function Dashboard() {
  const { userProfile } = useAuth()
  const { organizationId } = useOrganizationContext()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [stats, setStats] = useState({
    activeProjects: 0,
    formsThisWeek: 0,
    expiringCerts: 0,
    completedToday: 0,
    totalSites: 0
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [recentForms, setRecentForms] = useState([])
  const [expiringOperators, setExpiringOperators] = useState([])
  const [policyStats, setPolicyStats] = useState({
    totalPolicies: 0,
    reviewDue: 0,
    reviewOverdue: 0
  })

  useEffect(() => {
    if (organizationId) {
      loadDashboardData()
    }
  }, [organizationId])

  const loadDashboardData = async () => {
    if (!organizationId) return
    setLoading(true)
    setLoadError(null)
    try {
      // Load all data in parallel with graceful failure handling
      const [projectsResult, formsResult, operatorsResult, policiesResult] = await Promise.allSettled([
        getProjects(organizationId),
        getForms(organizationId),
        getOperators(organizationId),
        getPolicies(organizationId)
      ])

      // Extract results, using empty arrays for failed requests
      const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : []
      const forms = formsResult.status === 'fulfilled' ? formsResult.value : []
      const operators = operatorsResult.status === 'fulfilled' ? operatorsResult.value : []
      const policies = policiesResult.status === 'fulfilled' ? policiesResult.value : []

      // Log any failures
      if (projectsResult.status === 'rejected') {
        logger.error('Failed to load projects:', projectsResult.reason)
      }
      if (formsResult.status === 'rejected') {
        logger.error('Failed to load forms:', formsResult.reason)
      }
      if (operatorsResult.status === 'rejected') {
        logger.error('Failed to load operators:', operatorsResult.reason)
      }
      if (policiesResult.status === 'rejected') {
        logger.error('Failed to load policies:', policiesResult.reason)
      }

      // Calculate policy stats
      const totalPolicies = policies.length
      const reviewDue = policies.filter(p => getStatusInfo(p).status === 'due').length
      const reviewOverdue = policies.filter(p => getStatusInfo(p).status === 'overdue').length
      setPolicyStats({ totalPolicies, reviewDue, reviewOverdue })

      // Calculate stats
      const activeProjects = projects.filter(p => p.status === 'active').length
      
      const formsThisWeek = forms.filter(f => {
        if (!f.createdAt) return false
        const createdDate = f.createdAt.toDate ? f.createdAt.toDate() : new Date(f.createdAt)
        return isThisWeek(createdDate)
      }).length

      const completedToday = forms.filter(f => {
        if (!f.completedAt) return false
        const completedDate = f.completedAt.toDate ? f.completedAt.toDate() : new Date(f.completedAt)
        return isToday(completedDate)
      }).length

      // Check for expiring certifications (within 30 days)
      const thirtyDaysFromNow = addDays(new Date(), 30)
      const operatorsWithExpiring = operators.filter(op => {
        const certs = op.certifications || []
        return certs.some(cert => {
          if (!cert.expiryDate) return false
          const expiry = new Date(cert.expiryDate)
          return isBefore(expiry, thirtyDaysFromNow)
        })
      })
      const expiringCerts = operatorsWithExpiring.length

      // Calculate total sites across all projects
      let totalSites = 0
      projects.forEach(project => {
        const sites = Array.isArray(project.sites) ? project.sites : []
        totalSites += sites.length || 1 // Count at least 1 if no sites array
      })

      setStats({
        activeProjects,
        formsThisWeek,
        expiringCerts,
        completedToday,
        totalSites
      })

      // Get recent projects (last 5)
      const sortedProjects = [...projects]
        .sort((a, b) => {
          const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt || 0)
          const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt || 0)
          return dateB - dateA
        })
        .slice(0, 5)
      setRecentProjects(sortedProjects)

      // Get recent forms (last 5)
      const sortedForms = [...forms]
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return dateB - dateA
        })
        .slice(0, 5)
      setRecentForms(sortedForms)

      // Store operators with expiring certs for alerts
      setExpiringOperators(operatorsWithExpiring)

    } catch (err) {
      logger.error('Dashboard data load failed:', err)
      setLoadError('Failed to load dashboard data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const formatProjectDate = (project) => {
    const startDate = project.startDate || project.dates?.startDate
    if (!startDate) return 'No date'
    try {
      return format(new Date(startDate), 'MMM d')
    } catch {
      return 'Invalid date'
    }
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    planning: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-purple-100 text-purple-700',
    archived: 'bg-gray-100 text-gray-500'
  }

  const statCards = [
    { 
      name: 'Active Projects', 
      value: stats.activeProjects, 
      icon: FolderKanban, 
      color: 'bg-blue-500',
      link: '/projects?status=active'
    },
    { 
      name: 'Operation Sites', 
      value: stats.totalSites, 
      icon: MapPin, 
      color: 'bg-indigo-500',
      link: '/projects'
    },
    { 
      name: 'Forms This Week', 
      value: stats.formsThisWeek, 
      icon: ClipboardList, 
      color: 'bg-green-500',
      link: '/forms'
    },
    { 
      name: 'Expiring Certs', 
      value: stats.expiringCerts, 
      icon: AlertTriangle, 
      color: stats.expiringCerts > 0 ? 'bg-amber-500' : 'bg-gray-400',
      link: '/operators'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {userProfile?.firstName || 'there'}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your operations.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Link>
        <Link to="/forms" className="btn-secondary inline-flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Start Form
        </Link>
        <Link to="/policies" className="btn-secondary inline-flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          View Policies
        </Link>
      </div>

      {/* Onboarding Checklist - shows for new users */}
      <OnboardingChecklist />

      {/* Error display */}
      {loadError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Unable to load data</p>
            <p className="text-red-600 text-sm">{loadError}</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-200 w-9 h-9"></div>
                <div>
                  <div className="h-6 w-8 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 w-20 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Link 
              key={stat.name} 
              to={stat.link}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Policy Overview & Time Tracking Row */}
      {!loading && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Policy Status Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-aeria-navy" />
                Policy Library
              </h2>
              <Link to="/policies" className="text-sm text-aeria-blue hover:text-aeria-navy">
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{policyStats.totalPolicies}</p>
                <p className="text-xs text-gray-500">Total Policies</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{policyStats.reviewDue}</p>
                <p className="text-xs text-amber-700">Review Due</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{policyStats.reviewOverdue}</p>
                <p className="text-xs text-red-700">Overdue</p>
              </div>
            </div>

            {(policyStats.reviewDue > 0 || policyStats.reviewOverdue > 0) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Policy Review Required</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      {policyStats.reviewDue + policyStats.reviewOverdue} policies need review
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Quick Access</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/policies?category=rpas"
                  className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                >
                  RPAS Operations
                </Link>
                <Link
                  to="/policies?category=crm"
                  className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
                >
                  CRM
                </Link>
                <Link
                  to="/policies?category=hse"
                  className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200"
                >
                  HSE
                </Link>
              </div>
            </div>
          </div>

          {/* Time Tracking Summary */}
          <TimeSummaryWidget />
        </div>
      )}

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-24 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderKanban className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No projects yet</p>
              <Link to="/projects" className="text-sm text-aeria-blue hover:underline mt-1 inline-block">
                Create your first project
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentProjects.map((project) => {
                const sites = Array.isArray(project.sites) ? project.sites : []
                const siteCount = sites.length
                
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-aeria-sky rounded flex items-center justify-center flex-shrink-0">
                      <FolderKanban className="w-4 h-4 text-aeria-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{project.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatProjectDate(project)}</span>
                        {siteCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {siteCount} site{siteCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded ${statusColors[project.status]}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Forms */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Forms</h2>
            <Link to="/forms" className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 w-24 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentForms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No forms completed</p>
              <Link to="/forms" className="text-sm text-aeria-blue hover:underline mt-1 inline-block">
                Start a form
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentForms.map((form) => (
                <div
                  key={form.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {form.type || 'Form'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {form.createdAt?.toDate 
                        ? format(form.createdAt.toDate(), 'MMM d, h:mm a')
                        : 'Unknown date'
                      }
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    form.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {form.status || 'draft'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SFOC & Compliance Row */}
      {!loading && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* SFOC Status Widget */}
          <SFOCStatusWidget />

          {/* Maintenance alerts */}
          <MaintenanceAlertWidget compact />
        </div>
      )}

      {/* Alerts Section */}
      {!loading && (
        <div className="grid lg:grid-cols-1 gap-6">
          {/* Consolidated Expiry Reminders */}
          <ExpiryRemindersWidget />
        </div>
      )}

      {/* Activity & Upcoming Events */}
      {!loading && (
        <div className="grid lg:grid-cols-2 gap-6">
          <ActivityFeed limit={8} />
          <UpcomingEvents daysAhead={14} limit={5} />
        </div>
      )}
    </div>
  )
}
