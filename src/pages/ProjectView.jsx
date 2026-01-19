/**
 * ProjectView.jsx
 * Main project view component with tabbed navigation
 * 
 * PHASE 1 FIXES:
 * - Fixed auto-save with debounced saving (2 second delay)
 * - Added visible save status indicator
 * - Fixed hasChanges state tracking
 * - Added toast-style notifications for save status
 * - Improved save button responsiveness
 * 
 * @location src/pages/ProjectView.jsx
 * @action REPLACE
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  ArrowLeft, 
  FolderKanban, 
  Save,
  Settings2,
  Users,
  MapPin,
  Plane,
  AlertTriangle,
  ShieldAlert,
  HardHat,
  Radio,
  FileCheck,
  FileText,
  ClipboardList,
  Download,
  MoreVertical,
  Trash2,
  Circle,
  Loader2,
  Shield,
  CheckCircle2,
  Building2,
  CloudOff,
  Cloud
} from 'lucide-react'
import { getProject, updateProject, deleteProject, migrateProjectToDecoupledStructure, getClients } from '../lib/firestore'
import ProjectOverview from '../components/projects/ProjectOverview'
import ProjectSections from '../components/projects/ProjectSections'
import ProjectCrew from '../components/projects/ProjectCrew'
import ProjectFlightPlan from '../components/projects/ProjectFlightPlan'
import ProjectSiteSurvey from '../components/projects/ProjectSiteSurvey'
import ProjectEmergency from '../components/projects/ProjectEmergency'
import ProjectPPE from '../components/projects/ProjectPPE'
import ProjectComms from '../components/projects/ProjectComms'
import ProjectHSERisk from '../components/projects/ProjectHSERisk'
import ProjectSORA from '../components/projects/ProjectSORA'
import ProjectApprovals from '../components/projects/ProjectApprovals'
import ProjectTailgate from '../components/projects/ProjectTailgate'
import ProjectForms from '../components/projects/ProjectForms'
import ProjectExport from '../components/projects/ProjectExport'

const tabs = [
  { id: 'overview', label: 'Overview', icon: FolderKanban },
  { id: 'sections', label: 'Sections', icon: Settings2 },
  { id: 'crew', label: 'Crew', icon: Users },
  { id: 'site', label: 'Site Survey', icon: MapPin, toggleable: true, sectionKey: 'siteSurvey' },
  { id: 'flight', label: 'Flight Plan', icon: Plane, toggleable: true, sectionKey: 'flightPlan' },
  { id: 'hseRisk', label: 'HSE Risk', icon: AlertTriangle },
  { id: 'sora', label: 'SORA', icon: Shield },
  { id: 'emergency', label: 'Emergency', icon: ShieldAlert },
  { id: 'ppe', label: 'PPE', icon: HardHat },
  { id: 'comms', label: 'Communications', icon: Radio },
  { id: 'review', label: 'Review', icon: FileCheck },
  { id: 'tailgate', label: 'Tailgate', icon: FileText },
  { id: 'forms', label: 'Forms', icon: ClipboardList },
  { id: 'export', label: 'Export', icon: Download },
]

const statusColors = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  planning: 'bg-blue-100 text-blue-700 border-blue-300',
  active: 'bg-green-100 text-green-700 border-green-300',
  completed: 'bg-purple-100 text-purple-700 border-purple-300',
  archived: 'bg-gray-100 text-gray-500 border-gray-300'
}

// Save status types
const SAVE_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error'
}

export default function ProjectView() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState(SAVE_STATUS.IDLE)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [hasChanges, setHasChanges] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [saveError, setSaveError] = useState(null)
  
  // Store client data for logo display
  const [clientData, setClientData] = useState(null)
  
  // Refs for debounced auto-save
  const projectRef = useRef(project)
  const hasChangesRef = useRef(hasChanges)
  const saveTimerRef = useRef(null)
  const isSavingRef = useRef(false)
  
  // Keep refs in sync
  useEffect(() => {
    projectRef.current = project
    hasChangesRef.current = hasChanges
  }, [project, hasChanges])

  // Load project
  useEffect(() => {
    loadProject()
    return () => {
      // Cleanup save timer on unmount
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [projectId])

  // Load client data when project loads
  useEffect(() => {
    const loadClientData = async () => {
      if (project?.clientId) {
        try {
          const clients = await getClients()
          const client = clients.find(c => c.id === project.clientId)
          setClientData(client || null)
        } catch (err) {
          console.error('Error loading client data:', err)
        }
      } else {
        setClientData(null)
      }
    }
    loadClientData()
  }, [project?.clientId])

  // ============================================
  // AUTO-SAVE LOGIC (Debounced)
  // ============================================
  
  const performSave = useCallback(async () => {
    if (!projectRef.current || isSavingRef.current) return false
    
    isSavingRef.current = true
    setSaveStatus(SAVE_STATUS.SAVING)
    setSaveError(null)
    
    try {
      await updateProject(projectId, projectRef.current)
      setHasChanges(false)
      hasChangesRef.current = false
      setSaveStatus(SAVE_STATUS.SAVED)
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev => prev === SAVE_STATUS.SAVED ? SAVE_STATUS.IDLE : prev)
      }, 3000)
      
      return true
    } catch (err) {
      console.error('Save failed:', err)
      setSaveStatus(SAVE_STATUS.ERROR)
      setSaveError(err.message || 'Failed to save')
      return false
    } finally {
      isSavingRef.current = false
    }
  }, [projectId])

  // Debounced auto-save: triggers 2 seconds after last change
  const scheduleAutoSave = useCallback(() => {
    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    
    // Set pending status
    setSaveStatus(SAVE_STATUS.PENDING)
    
    // Schedule new save
    saveTimerRef.current = setTimeout(() => {
      if (hasChangesRef.current && !isSavingRef.current) {
        performSave()
      }
    }, 2000) // 2 second debounce
  }, [performSave])

  // Save on unmount if there are changes
  useEffect(() => {
    return () => {
      if (hasChangesRef.current && projectRef.current && !isSavingRef.current) {
        // Synchronous save attempt on unmount
        updateProject(projectId, projectRef.current).catch(err => {
          console.error('Save on unmount failed:', err)
        })
      }
    }
  }, [projectId])

  // Warn before browser close/refresh if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChangesRef.current) {
        // Try to save
        if (projectRef.current && !isSavingRef.current) {
          updateProject(projectId, projectRef.current).catch(console.error)
        }
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [projectId])

  // Periodic auto-save fallback (every 30 seconds) for long editing sessions
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasChangesRef.current && !isSavingRef.current) {
        performSave()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [performSave])

  // ============================================
  // DATA LOADING
  // ============================================

  const loadProject = async () => {
    setLoading(true)
    setError('')
    try {
      let data = await getProject(projectId)
      data = migrateProjectToDecoupledStructure(data)
      setProject(data)
      setHasChanges(false)
      setSaveStatus(SAVE_STATUS.IDLE)
    } catch (err) {
      console.error('Error loading project:', err)
      setError('Project not found')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // HANDLERS
  // ============================================

  const handleSave = async () => {
    if (!project) return
    
    // Clear any pending auto-save
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    
    await performSave()
  }

  const handleUpdate = useCallback((updates) => {
    setProject(prev => {
      if (!prev) return prev
      return { ...prev, ...updates }
    })
    setHasChanges(true)
    scheduleAutoSave()
  }, [scheduleAutoSave])

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) {
      return
    }
    
    try {
      await deleteProject(projectId)
      navigate('/projects')
    } catch (err) {
      console.error('Error deleting project:', err)
      alert('Failed to delete project')
    }
  }

  const handleStatusChange = async (newStatus) => {
    handleUpdate({ status: newStatus })
  }

  // Filter visible tabs based on enabled sections
  const visibleTabs = useMemo(() => {
    return tabs.filter(tab => {
      if (!tab.toggleable) return true
      return project?.sections?.[tab.sectionKey]
    })
  }, [project?.sections])

  // ============================================
  // RENDER: Loading State
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER: Error State
  // ============================================

  if (error || !project) {
    return (
      <div className="space-y-6">
        <Link 
          to="/projects" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <div className="card text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested project could not be loaded.'}</p>
          <Link to="/projects" className="btn-primary">
            View All Projects
          </Link>
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER: Save Status Indicator
  // ============================================

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case SAVE_STATUS.PENDING:
        return (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Circle className="w-2 h-2 fill-current text-amber-500" />
            Unsaved
          </span>
        )
      case SAVE_STATUS.SAVING:
        return (
          <span className="text-sm text-blue-600 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </span>
        )
      case SAVE_STATUS.SAVED:
        return (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Saved
          </span>
        )
      case SAVE_STATUS.ERROR:
        return (
          <span className="text-sm text-red-600 flex items-center gap-1" title={saveError}>
            <CloudOff className="w-4 h-4" />
            Save failed
          </span>
        )
      default:
        if (hasChanges) {
          return (
            <span className="text-sm text-amber-600 flex items-center gap-1">
              <Circle className="w-2 h-2 fill-current" />
              Unsaved changes
            </span>
          )
        }
        return (
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Cloud className="w-4 h-4" />
            Saved
          </span>
        )
    }
  }

  // ============================================
  // RENDER: Main Content
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/projects" 
            onClick={async (e) => {
              if (hasChanges) {
                e.preventDefault()
                await performSave()
                navigate('/projects')
              }
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          {/* Client logo/icon display */}
          {clientData?.logo ? (
            <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center p-1 flex-shrink-0">
              <img 
                src={clientData.logo} 
                alt={clientData.name} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : project.clientId ? (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aeria-blue to-aeria-navy flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          ) : null}
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.clientName || 'No client assigned'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Save status indicator */}
          <div className="hidden sm:block">
            {renderSaveStatus()}
          </div>
          
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === SAVE_STATUS.SAVING}
            className={`btn-primary inline-flex items-center gap-2 ${
              !hasChanges && saveStatus !== SAVE_STATUS.ERROR ? 'opacity-50' : ''
            }`}
          >
            {saveStatus === SAVE_STATUS.SAVING ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>

          {/* Status dropdown */}
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium ${statusColors[project.status]}`}
          >
            <option value="draft">Draft</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      handleDelete()
                      setMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Project
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile save status */}
      <div className="sm:hidden flex justify-end">
        {renderSaveStatus()}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto pb-px">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-aeria-navy text-aeria-navy'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <ProjectOverview 
            project={project} 
            onUpdate={handleUpdate}
            onNavigateToSection={(section) => {
              if (section === 'siteSurvey') setActiveTab('site')
              else if (section === 'flightPlan') setActiveTab('flight')
              else if (section === 'emergency') setActiveTab('emergency')
              else if (section === 'sora') setActiveTab('sora')
            }}
          />
        )}
        {activeTab === 'sections' && (
          <ProjectSections project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'crew' && (
          <ProjectCrew project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'site' && (
          <ProjectSiteSurvey project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'flight' && (
          <ProjectFlightPlan 
            project={project} 
            onUpdate={handleUpdate} 
            onNavigateToSection={(section) => {
              if (section === 'siteSurvey') setActiveTab('site')
              else if (section === 'flightPlan') setActiveTab('flight')
              else if (section === 'sora') setActiveTab('sora')
            }}
          />
        )}
        {activeTab === 'hseRisk' && (
          <ProjectHSERisk project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'sora' && (
          <ProjectSORA 
            project={project} 
            onUpdate={handleUpdate}
            onNavigateToSection={(section) => {
              if (section === 'siteSurvey') setActiveTab('site')
              else if (section === 'flightPlan') setActiveTab('flight')
            }}
          />
        )}
        {activeTab === 'emergency' && (
          <ProjectEmergency project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'ppe' && (
          <ProjectPPE project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'comms' && (
          <ProjectComms project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'review' && (
          <ProjectApprovals project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'tailgate' && (
          <ProjectTailgate project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'forms' && (
          <ProjectForms project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'export' && (
          <ProjectExport project={project} />
        )}
      </div>
    </div>
  )
}
