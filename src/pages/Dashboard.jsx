/**
 * Dashboard.jsx
 * Main dashboard with live statistics from Firestore
 * 
 * FIXES APPLIED:
 * - Issue #1: Connected stats to Firestore (no longer hardcoded)
 * 
 * @location src/pages/Dashboard.jsx
 * @action REPLACE
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  FolderKanban, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2,
  Plus,
  ArrowRight,
  Loader2,
  Building2,
  Calendar,
  Users
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getProjects, getClients, getForms, getOperators } from '../lib/firestore'
import { format, isThisWeek, isToday, addDays, isBefore } from 'date-fns'

export default function Dashboard() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeProjects: 0,
    formsThisWeek: 0,
    expiringCerts: 0,
    completedToday: 0
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [recentForms, setRecentForms] = useState([])
  const [expiringOperators, setExpiringOperators] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load all data in parallel
      const [projects, forms, operators] = await Promise.all([
        getProjects(),
        getForms(),
        getOperators()
      ])

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

      setStats({
        activeProjects,
        formsThisWeek,
        expiringCerts,
        completedToday
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
      console.error('Error loading dashboard data:', err)
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

  const formatProjectDate = (dates) => {
    if (!dates?.startDate) return 'No date'
    try {
      return format(new Date(dates.startDate), 'MMM d')
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
    { 
      name: 'Completed Today', 
      value: stats.completedToday, 
      icon: CheckCircle2, 
      color: 'bg-emerald-500',
      link: '/forms'
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
      </div>

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
              {recentProjects.map((project) => (
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
                      <span>{formatProjectDate(project.dates)}</span>
                      <span className={`px-1.5 py-0.5 rounded ${statusColors[project.status]}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
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

      {/* Certification alerts */}
      {!loading && expiringOperators.length > 0 ? (
        <div className="card border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-900">Certification Alerts</h3>
              <p className="text-sm text-amber-700 mt-1">
                {expiringOperators.length} operator{expiringOperators.length > 1 ? 's have' : ' has'} certifications expiring within 30 days.
              </p>
              <div className="mt-3 space-y-2">
                {expiringOperators.slice(0, 3).map((op) => (
                  <div key={op.id} className="flex items-center gap-2 text-sm text-amber-800">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{op.firstName} {op.lastName}</span>
                    <span className="text-amber-600">
                      - {op.certifications?.filter(c => {
                        if (!c.expiryDate) return false
                        const expiry = new Date(c.expiryDate)
                        return isBefore(expiry, addDays(new Date(), 30))
                      }).map(c => c.type || c.name).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/operators" className="text-sm text-amber-800 font-medium hover:underline mt-3 inline-block">
                View all operators →
              </Link>
            </div>
          </div>
        </div>
      ) : !loading ? (
        <div className="card border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900">All Certifications Current</h3>
              <p className="text-sm text-green-700 mt-1">
                No certifications are expiring in the next 30 days.
              </p>
              <Link to="/operators" className="text-sm text-green-800 font-medium hover:underline mt-2 inline-block">
                Manage operators →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
