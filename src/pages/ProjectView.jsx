/**
 * ProjectView.jsx
 * Main project view component with tabbed navigation
 * 
 * FIXES APPLIED:
 * - Issue #1: Improved auto-save with debouncing (saves 2 seconds after last change)
 * - Issue #2: Fixed "No client assigned" using wrong field (project.client -> project.clientName)
 * - Issue #3: Added client logo display in header
 * - Issue #4: Better change detection for nested object updates
 * - Issue #5: Visual feedback for save states (saving, saved, error)
 * - Added: ProjectNeedsAnalysis tab for CONOPS pre-planning
 * 
 * Batch 3 Fix:
 * - Added keyboard navigation for tabs (arrow keys) (M-06)
 * - Added ARIA labels and roles for accessibility (M-04)
 * 
 * @location src/pages/ProjectView.jsx
 * @action REPLACE
 */

import { useState, useEffect, useCallback, useRef } from 'react'
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
  FileText,
  ClipboardList,
  MoreVertical,
  Trash2,
  Circle,
  Loader2,
  Shield,
  CheckCircle2,
  Building2,
  AlertCircle,
  Cloud,
  CloudOff,
  Target,
  MessageSquare,
  Layers,
  Bell,
  ClipboardCheck,
  PackageCheck,
  Package,
  Calculator,
  Clock,
  Receipt,
  Timer,
  Files
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
import ProjectTailgate from '../components/projects/ProjectTailgate'
import ProjectForms from '../components/projects/ProjectForms'
// ProjectExport replaced by DocumentCenter
import ProjectNeedsAnalysis from '../components/projects/ProjectNeedsAnalysis'
import ProjectComments from '../components/projects/ProjectComments'
import DocumentCenter from '../components/documentCenter'
import ProjectTemplates from '../components/projects/ProjectTemplates'
import ProjectTeam from '../components/projects/ProjectTeam'
import ProjectPreField from '../components/projects/ProjectPreField'
import ProjectPostField from '../components/projects/ProjectPostField'
import ProjectTeamPanel from '../components/projects/ProjectTeamPanel'
import ProjectEquipment from '../components/projects/ProjectEquipment'
import ProjectCosts from '../components/projects/ProjectCosts'
import ProjectTimeEntries from '../components/projects/ProjectTimeEntries'
import ProjectExpenses from '../components/projects/ProjectExpenses'
import ProjectActivities from '../components/projects/ProjectActivities'
import PhaseNavigator, { PHASES, getPhaseForTab, getTabsForPhase } from '../components/projects/PhaseNavigator'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import { logger } from '../lib/logger'

const tabs = [
  // Core tabs - always visible
  { id: 'overview', label: 'Overview', icon: FolderKanban },
  { id: 'needs', label: 'Needs Analysis', icon: Target },
  { id: 'costs', label: 'Costs', icon: Calculator },
  { id: 'time', label: 'Time', icon: Clock },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'sections', label: 'Sections', icon: Settings2 },
  // Optional tabs - toggled via Sections page
  { id: 'preField', label: 'Pre-Field', icon: ClipboardCheck, toggleable: true, sectionKey: 'preField' },
  // Core tabs continued
  { id: 'crew', label: 'Crew', icon: Users },
  { id: 'equipment', label: 'Equipment', icon: Package },
  { id: 'activities', label: 'Activities', icon: Timer },
  { id: 'team', label: 'Team', icon: MessageSquare, toggleable: true, sectionKey: 'team' },
  { id: 'notifications', label: 'Notifications', icon: Bell, toggleable: true, sectionKey: 'notifications' },
  { id: 'site', label: 'Site Survey', icon: MapPin },
  { id: 'flight', label: 'Flight Plan', icon: Plane },
  { id: 'hseRisk', label: 'HSE Risk', icon: AlertTriangle },
  { id: 'sora', label: 'SORA', icon: Shield },
  { id: 'emergency', label: 'Emergency', icon: ShieldAlert },
  { id: 'ppe', label: 'PPE', icon: HardHat },
  { id: 'comms', label: 'Communications', icon: Radio },
  { id: 'tailgate', label: 'Tailgate', icon: FileText },
  { id: 'postField', label: 'Post-Field', icon: PackageCheck, toggleable: true, sectionKey: 'postField' },
  { id: 'forms', label: 'Forms', icon: ClipboardList, toggleable: true, sectionKey: 'forms' },
  { id: 'documents', label: 'Documents', icon: Files },
  { id: 'templates', label: 'Templates', icon: Layers, toggleable: true, sectionKey: 'templates' },
]

const statusColors = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  planning: 'bg-blue-100 text-blue-700 border-blue-300',
  active: 'bg-green-100 text-green-700 border-green-300',
  completed: 'bg-purple-100 text-purple-700 border-purple-300',
  archived: 'bg-gray-100 text-gray-500 border-gray-300'
}

// Save status states
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
  const { user } = useAuth()
  const { organizationId } = useOrganization()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [activePhase, setActivePhase] = useState('plan')
  const [menuOpen, setMenuOpen] = useState(false)
  
  // Improved save state management
  const [saveStatus, setSaveStatus] = useState(SAVE_STATUS.IDLE)
  const [lastSaved, setLastSaved] = useState(null)
  
  // Client data for logo display
  const [clientData, setClientData] = useState(null)
  
  // Refs for save management
  const projectRef = useRef(project)
  const saveTimeoutRef = useRef(null)
  const pendingChangesRef = useRef(false)
  
  // Keep project ref in sync
  useEffect(() => {
    projectRef.current = project
  }, [project])

  // Load project on mount
  useEffect(() => {
    loadProject()
    
    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      // Force save any pending changes on unmount
      if (pendingChangesRef.current && projectRef.current) {
        saveToFirestore(projectRef.current)
      }
    }
  }, [projectId])

  // Load client data when project loads
  useEffect(() => {
    const loadClientData = async () => {
      if (project?.clientId) {
        try {
          const clients = await getClients(organizationId)
          const client = clients.find(c => c.id === project.clientId)
          setClientData(client || null)
        } catch (err) {
          // Intentionally silent - client logo is optional display data
          logger.debug('Client data load failed (non-critical):', err)
          setClientData(null)
        }
      } else {
        setClientData(null)
      }
    }
    loadClientData()
  }, [project?.clientId])

  // Warn before browser close if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (pendingChangesRef.current) {
        // Try to save
        if (projectRef.current) {
          saveToFirestore(projectRef.current)
        }
        e.preventDefault()
        e.returnValue = 'You have unsaved changes.'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // ============================================
  // CORE FUNCTIONS
  // ============================================

  const loadProject = async () => {
    setLoading(true)
    setError('')
    try {
      let data = await getProject(projectId)
      data = migrateProjectToDecoupledStructure(data)
      setProject(data)
      setLastSaved(new Date())
    } catch (err) {
      logger.error('Failed to load project:', err)
      setError('Project not found or failed to load')
    } finally {
      setLoading(false)
    }
  }

  // Actual save to Firestore
  const saveToFirestore = async (projectData) => {
    if (!projectData || !projectId) return false
    
    setSaveStatus(SAVE_STATUS.SAVING)
    
    try {
      await updateProject(projectId, projectData)
      setSaveStatus(SAVE_STATUS.SAVED)
      setLastSaved(new Date())
      pendingChangesRef.current = false
      
      // Reset to idle after showing "saved" briefly
      setTimeout(() => {
        setSaveStatus(prev => prev === SAVE_STATUS.SAVED ? SAVE_STATUS.IDLE : prev)
      }, 2000)
      
      return true
    } catch (err) {
      logger.error('Failed to save project:', err)
      setSaveStatus(SAVE_STATUS.ERROR)

      // Reset to pending after showing error
      setTimeout(() => {
        setSaveStatus(SAVE_STATUS.PENDING)
      }, 3000)

      return false
    }
  }

  // Debounced save - triggers 2 seconds after last change
  const scheduleSave = useCallback((projectData) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    pendingChangesRef.current = true
    setSaveStatus(SAVE_STATUS.PENDING)
    
    // Schedule save for 2 seconds from now
    saveTimeoutRef.current = setTimeout(() => {
      saveToFirestore(projectData)
    }, 2000)
  }, [projectId])

  // Manual save (immediate)
  const handleSave = async () => {
    if (!project) return
    
    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    await saveToFirestore(project)
  }

  // Main update handler - called by all child components
  const handleUpdate = useCallback((updates) => {
    setProject(prev => {
      if (!prev) return prev
      
      const newProject = { ...prev, ...updates }
      
      // Schedule debounced save
      scheduleSave(newProject)
      
      return newProject
    })
  }, [scheduleSave])

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) {
      return
    }
    
    // Clear any pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    try {
      await deleteProject(projectId)
      navigate('/projects')
    } catch (err) {
      logger.error('Failed to delete project:', err)
      alert('Failed to delete project. Please try again.')
    }
  }

  const handleStatusChange = (newStatus) => {
    handleUpdate({ status: newStatus })
  }

  // Handle navigation away - save immediately
  const handleNavigateAway = async () => {
    if (pendingChangesRef.current && projectRef.current) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      await saveToFirestore(projectRef.current)
    }
  }

  // Filter visible tabs based on enabled sections
  const visibleTabs = tabs.filter(tab => {
    if (!tab.toggleable) return true
    return project?.sections?.[tab.sectionKey]
  })

  // Get tabs for the current phase
  const phaseTabs = getTabsForPhase(activePhase)
  const visiblePhaseTabs = visibleTabs.filter(tab => phaseTabs.includes(tab.id))

  // Handle phase change
  const handlePhaseChange = (phaseId) => {
    setActivePhase(phaseId)
    // Set active tab to first visible tab in the new phase
    const newPhaseTabs = getTabsForPhase(phaseId)
    const firstVisibleTab = visibleTabs.find(tab => newPhaseTabs.includes(tab.id))
    if (firstVisibleTab) {
      setActiveTab(firstVisibleTab.id)
    }
  }

  // Sync phase when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    const newPhase = getPhaseForTab(tabId)
    if (newPhase !== activePhase) {
      setActivePhase(newPhase)
    }
  }

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
          <span className="text-sm text-amber-600 flex items-center gap-1">
            <Circle className="w-2 h-2 fill-current" />
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
          <span className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Save failed
          </span>
        )
      default:
        if (lastSaved) {
          return (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Cloud className="w-3 h-3" />
              Synced
            </span>
          )
        }
        return null
    }
  }

  // ============================================
  // RENDER: Main Component
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/projects" 
            onClick={async (e) => {
              if (pendingChangesRef.current) {
                e.preventDefault()
                await handleNavigateAway()
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
          {renderSaveStatus()}
          
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === SAVE_STATUS.SAVING || saveStatus === SAVE_STATUS.IDLE}
            className={`btn-primary inline-flex items-center gap-2 ${
              saveStatus === SAVE_STATUS.IDLE ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-busy={saveStatus === SAVE_STATUS.SAVING}
          >
            {saveStatus === SAVE_STATUS.SAVING ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden="true" />
                Save
              </>
            )}
          </button>

          {/* Status dropdown */}
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium ${statusColors[project.status]}`}
            aria-label="Project status"
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
              aria-label="More options"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <MoreVertical className="w-5 h-5" aria-hidden="true" />
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
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    Delete Project
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Phase Navigator */}
      <PhaseNavigator
        activePhase={activePhase}
        onPhaseChange={handlePhaseChange}
        project={project}
        visibleTabs={visibleTabs}
      />

      {/* Sub-tabs within phase */}
      {visiblePhaseTabs.length > 1 && (
        <div className="border-b border-gray-200 bg-gray-50">
          <nav
            className="flex gap-1 overflow-x-auto px-4 py-1"
            role="tablist"
            aria-label="Phase sections"
            onKeyDown={(e) => {
              const currentTabs = visiblePhaseTabs
              const currentIndex = currentTabs.findIndex(t => t.id === activeTab)

              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault()
                const nextIndex = currentIndex < currentTabs.length - 1 ? currentIndex + 1 : 0
                handleTabChange(currentTabs[nextIndex].id)
                document.getElementById(`tab-${currentTabs[nextIndex].id}`)?.focus()
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault()
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentTabs.length - 1
                handleTabChange(currentTabs[prevIndex].id)
                document.getElementById(`tab-${currentTabs[prevIndex].id}`)?.focus()
              } else if (e.key === 'Home') {
                e.preventDefault()
                handleTabChange(currentTabs[0].id)
                document.getElementById(`tab-${currentTabs[0].id}`)?.focus()
              } else if (e.key === 'End') {
                e.preventDefault()
                handleTabChange(currentTabs[currentTabs.length - 1].id)
                document.getElementById(`tab-${currentTabs[currentTabs.length - 1].id}`)?.focus()
              }
            }}
          >
            {visiblePhaseTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-colors ${
                    isActive
                      ? 'bg-white text-aeria-navy shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      )}

      {/* Tab Content */}
      <div 
        role="tabpanel" 
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTab === 'overview' && (
          <ProjectOverview project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'needs' && (
          <ProjectNeedsAnalysis
            project={project}
            onUpdate={handleUpdate}
            onNavigate={(target) => {
              if (target === 'site-survey') setActiveTab('site')
              else if (target === 'flight-plan') setActiveTab('flight')
            }}
          />
        )}
        {activeTab === 'costs' && (
          <ProjectCosts project={project} />
        )}
        {activeTab === 'time' && (
          <ProjectTimeEntries project={project} />
        )}
        {activeTab === 'expenses' && (
          <ProjectExpenses project={project} />
        )}
        {activeTab === 'sections' && (
          <ProjectSections project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'templates' && (
          <ProjectTemplates project={project} mode="manage" />
        )}
        {activeTab === 'preField' && (
          <ProjectPreField project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'crew' && (
          <div className="space-y-6">
            <ProjectCrew project={project} onUpdate={handleUpdate} />
            <ProjectTeamPanel project={project} onUpdate={handleUpdate} />
          </div>
        )}
        {activeTab === 'equipment' && (
          <ProjectEquipment project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'activities' && (
          <ProjectActivities project={project} />
        )}
        {activeTab === 'team' && (
          <ProjectComments project={project} organizationId={organizationId} />
        )}
        {activeTab === 'notifications' && (
          <ProjectTeam project={project} onUpdate={handleUpdate} />
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
        {activeTab === 'tailgate' && (
          <ProjectTailgate project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'postField' && (
          <ProjectPostField project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'forms' && (
          <ProjectForms project={project} onUpdate={handleUpdate} />
        )}
        {activeTab === 'documents' && (
          <DocumentCenter project={project} />
        )}
      </div>
    </div>
  )
}
