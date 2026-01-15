import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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
  Loader2
} from 'lucide-react'
import { getProject, updateProject, deleteProject } from '../lib/firestore'
import ProjectOverview from '../components/projects/ProjectOverview'
import ProjectSections from '../components/projects/ProjectSections'
import ProjectCrew from '../components/projects/ProjectCrew'
import ProjectFlightPlan from '../components/projects/ProjectFlightPlan'
import ProjectSiteSurvey from '../components/projects/ProjectSiteSurvey'
import ProjectEmergency from '../components/projects/ProjectEmergency'

const tabs = [
  { id: 'overview', label: 'Overview', icon: FolderKanban },
  { id: 'sections', label: 'Sections', icon: Settings2 },
  { id: 'crew', label: 'Crew', icon: Users },
  { id: 'site', label: 'Site Survey', icon: MapPin, toggleable: true, sectionKey: 'siteSurvey' },
  { id: 'flight', label: 'Flight Plan', icon: Plane, toggleable: true, sectionKey: 'flightPlan' },
  { id: 'risk', label: 'Risk Assessment', icon: AlertTriangle },
  { id: 'emergency', label: 'Emergency', icon: ShieldAlert },
  { id: 'ppe', label: 'PPE', icon: HardHat },
  { id: 'comms', label: 'Communications', icon: Radio },
  { id: 'approvals', label: 'Approvals', icon: FileCheck },
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

export default function ProjectView() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [hasChanges, setHasChanges] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProject(projectId)
      setProject(data)
    } catch (err) {
      console.error('Error loading project:', err)
      setError('Project not found')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!project || !hasChanges) return
    
    setSaving(true)
    try {
      await updateProject(projectId, project)
      setHasChanges(false)
    } catch (err) {
      console.error('Error saving project:', err)
      alert('Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = (updates) => {
    setProject(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

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
  const visibleTabs = tabs.filter(tab => {
    if (!tab.toggleable) return true
    return project?.sections?.[tab.sectionKey]
  })

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
          <FolderKanban className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Project not found</h3>
          <p className="text-gray-500">
            This project may have been deleted or you don't have access.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link 
            to="/projects" 
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[project.status]} cursor-pointer`}
              >
                <option value="draft">Draft</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {project.projectCode && (
                <span className="font-mono">{project.projectCode}</span>
              )}
              {project.clientName && (
                <>
                  <span>•</span>
                  <span>{project.clientName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:mt-0 mt-2 ml-12 lg:ml-0">
          {/* Save indicator */}
          {hasChanges && (
            <span className="text-sm text-amber-600 flex items-center gap-1">
              <Circle className="w-2 h-2 fill-current" />
              Unsaved changes
            </span>
          )}
          
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="btn-primary inline-flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>

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
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
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

      {/* Tabs */}
      <div className="border-b border-gray-200 -mx-4 lg:-mx-8 px-4 lg:px-8">
        <nav className="flex gap-1 overflow-x-auto scrollbar-hide">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-aeria-navy text-aeria-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <ProjectOverview project={project} onUpdate={handleUpdate} />
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
          <ProjectFlightPlan project={project} onUpdate={handleUpdate} />
        )}
        
        {activeTab === 'risk' && (
          <PlaceholderSection title="Risk Assessment" description="SORA assessment and HSE hazard identification." />
        )}
        
        {activeTab === 'emergency' && (
          <ProjectEmergency project={project} onUpdate={handleUpdate} />
        )}
        
        {activeTab === 'ppe' && (
          <PlaceholderSection title="PPE Requirements" description="Required personal protective equipment." />
        )}
        
        {activeTab === 'comms' && (
          <PlaceholderSection title="Communications" description="Communication methods and protocols." />
        )}
        
        {activeTab === 'approvals' && (
          <PlaceholderSection title="Approvals & Signatures" description="Review, approval, and crew acknowledgments." />
        )}
        
        {activeTab === 'tailgate' && (
          <PlaceholderSection title="Tailgate Briefing" description="AI-generated field briefing from operations plan." />
        )}
        
        {activeTab === 'forms' && (
          <PlaceholderSection title="Forms" description="Field forms linked to this project." />
        )}
        
        {activeTab === 'export' && (
          <PlaceholderSection title="Export" description="Generate PDFs and project packages." />
        )}
      </div>
    </div>
  )
}

// Temporary placeholder for sections not yet built
function PlaceholderSection({ title, description }) {
  return (
    <div className="card text-center py-12">
      <Settings2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500">{description}</p>
      <p className="text-sm text-gray-400 mt-4">This section is coming soon.</p>
    </div>
  )
}
