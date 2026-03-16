/**
 * Training.jsx
 * Training Management Dashboard
 *
 * COR Element 3: Training & Instruction of Workers (10-15% weight)
 * Manages training courses, records, and compliance tracking
 * Includes interactive training sessions with inline document viewer and flight skills
 *
 * @location src/pages/Training.jsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  GraduationCap,
  BookOpen,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Award,
  Calendar,
  Filter,
  Download,
  Grid,
  List,
  Search,
  Eye,
  Edit,
  FileText,
  Plane,
  ClipboardCheck,
  X,
  CheckCircle2,
  Circle,
  Play
} from 'lucide-react'

import {
  getCourses,
  getAllTrainingRecords,
  getTrainingMetrics,
  seedDefaultCourses,
  TRAINING_CATEGORIES,
  TRAINING_STATUS
} from '../lib/firestoreTraining'
import { exportTrainingReport } from '../lib/safetyExportService'
import { usePermissions } from '../hooks/usePermissions'
import { getPoliciesEnhanced } from '../lib/firestorePolicies'

import TrainingCourseModal from '../components/training/TrainingCourseModal'
import TrainingRecordModal from '../components/training/TrainingRecordModal'

// ============================================
// TRAINING TRACKS CONFIGURATION
// ============================================

const TRAINING_TRACKS = [
  {
    id: 'onboarding',
    name: 'New Employee Onboarding',
    description: 'Essential policies and procedures for new team members',
    icon: Users,
    color: 'bg-blue-500',
    docTypes: ['policy', 'procedure'],
    docCategories: ['safety', 'operations', 'hr']
  },
  {
    id: 'pilot',
    name: 'Pilot Training',
    description: 'Flight operations training with supervisor sign-off',
    icon: Plane,
    color: 'bg-indigo-500',
    docTypes: ['procedure', 'guide'],
    docCategories: ['operations', 'safety'],
    hasFlightSkills: true
  },
  {
    id: 'field_ops',
    name: 'Field Operations',
    description: 'Site safety and field procedures',
    icon: ClipboardCheck,
    color: 'bg-green-500',
    docTypes: ['procedure', 'fha'],
    docCategories: ['safety', 'operations']
  }
]

// Flight skills with descriptions and checkpoints for supervisor review
const FLIGHT_SKILLS = [
  {
    id: 'preflight',
    name: 'Pre-flight Inspection',
    description: 'Complete walk-around and systems check before flight',
    checkpoints: [
      'Propellers secure, no damage',
      'Battery charged, seated properly',
      'Camera/gimbal operational',
      'GPS lock confirmed',
      'Control surfaces responsive'
    ]
  },
  {
    id: 'takeoff',
    name: 'Takeoff Procedures',
    description: 'Safe launch and initial climb procedures',
    checkpoints: [
      'Clear takeoff area verified',
      'Wind assessment completed',
      'Hover check at 2m altitude',
      'System status confirmed green',
      'Smooth vertical climb executed'
    ]
  },
  {
    id: 'navigation',
    name: 'Basic Navigation',
    description: 'Controlled flight patterns and waypoint navigation',
    checkpoints: [
      'Maintains safe altitude',
      'Smooth directional control',
      'Proper use of flight modes',
      'Situational awareness maintained',
      'Responds to telemetry data'
    ]
  },
  {
    id: 'emergency',
    name: 'Emergency Procedures',
    description: 'Response to in-flight emergencies and system failures',
    checkpoints: [
      'Knows RTH procedure',
      'Can execute manual landing',
      'Responds to low battery alerts',
      'Handles signal loss protocol',
      'Demonstrates controlled descent'
    ]
  },
  {
    id: 'landing',
    name: 'Landing Procedures',
    description: 'Safe approach and touchdown techniques',
    checkpoints: [
      'Proper approach pattern',
      'Controlled descent rate',
      'Hover check before landing',
      'Smooth touchdown executed',
      'Post-landing checks completed'
    ]
  },
  {
    id: 'postflight',
    name: 'Post-flight Procedures',
    description: 'Equipment securing and documentation',
    checkpoints: [
      'Aircraft powered down properly',
      'Battery removed and stored',
      'Equipment inspected for damage',
      'Flight log completed',
      'Data/media secured'
    ]
  }
]

// ============================================
// MARKDOWN PREVIEW COMPONENT
// ============================================

function MarkdownPreview({ content }) {
  if (!content) return <p className="text-gray-500 italic">No content available</p>

  // Simple markdown to HTML converter for common patterns
  const renderMarkdown = (text) => {
    let html = text
      // Headers
      .replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold text-gray-800 mt-4 mb-2">$1</h4>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-5 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-6 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>')
      // Bold and italic
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Bullet lists
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-700">$1</li>')
      .replace(/^• (.+)$/gm, '<li class="ml-4 text-gray-700">$1</li>')
      // Numbered lists
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-gray-700">$1</li>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="my-4 border-gray-200" />')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="text-gray-700 mb-3">')
      .replace(/\n/g, '<br />')

    // Wrap in paragraph if not already structured
    if (!html.startsWith('<')) {
      html = `<p class="text-gray-700 mb-3">${html}</p>`
    }

    return html
  }

  return (
    <div
      className="prose prose-sm max-w-none text-gray-700"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}

export default function Training() {
  const { user } = useAuth()
  const { organizationId } = useOrganization()
  const { canEdit, can } = usePermissions()
  const canRecordTraining = can('recordOwnTraining')

  // State
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [courses, setCourses] = useState([])
  const [records, setRecords] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  // Modal state
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [recordModalOpen, setRecordModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [exporting, setExporting] = useState(false)

  // Load data
  const loadData = useCallback(async () => {
    if (!organizationId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      let coursesData = await getCourses(organizationId)

      // If no courses exist, seed defaults
      if (coursesData.length === 0) {
        await seedDefaultCourses(organizationId)
        coursesData = await getCourses(organizationId)
      }

      const [recordsData, metricsData] = await Promise.all([
        getAllTrainingRecords(organizationId),
        getTrainingMetrics(organizationId)
      ])

      setCourses(coursesData)
      setRecords(recordsData)
      setMetrics(metricsData)
    } catch (error) {
      console.error('Error loading training data:', error)
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Modal handlers
  const handleAddCourse = () => {
    setSelectedCourse(null)
    setCourseModalOpen(true)
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setCourseModalOpen(true)
  }

  const handleAddRecord = (course = null) => {
    setSelectedRecord(null)
    setSelectedCourse(course)
    setRecordModalOpen(true)
  }

  const handleEditRecord = (record) => {
    setSelectedRecord(record)
    setRecordModalOpen(true)
  }

  const handleModalClose = () => {
    setCourseModalOpen(false)
    setRecordModalOpen(false)
    setSelectedCourse(null)
    setSelectedRecord(null)
    loadData()
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportTrainingReport(records, metrics)
    } catch (error) {
      console.error('Error exporting training records:', error)
      alert('Failed to export training report')
    } finally {
      setExporting(false)
    }
  }

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp?.toDate?.() || new Date(timestamp)
    return date.toLocaleDateString('en-CA')
  }

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || course.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchTerm ||
      record.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.crewMemberName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Training session state
  const [activeSession, setActiveSession] = useState(null)
  const [sessionDocuments, setSessionDocuments] = useState([])
  const [expandedDoc, setExpandedDoc] = useState(null)
  const [expandedSkill, setExpandedSkill] = useState(null)
  const [completedDocs, setCompletedDocs] = useState(new Set())
  const [completedSkills, setCompletedSkills] = useState(new Set())
  const [skillSignoffs, setSkillSignoffs] = useState({})
  const [traineeName, setTraineeName] = useState('')
  const [supervisorName, setSupervisorName] = useState('')

  // Load documents for training session
  const loadSessionDocuments = useCallback(async (track) => {
    try {
      const policies = await getPoliciesEnhanced()
      // Filter documents by track's doc types and categories
      const filtered = policies.filter(doc => {
        const matchesType = !track.docTypes || track.docTypes.includes(doc.doc_type || doc.category?.toLowerCase())
        const matchesCategory = !track.docCategories || track.docCategories.some(cat =>
          doc.category?.toLowerCase().includes(cat) || doc.keywords?.some(k => k.toLowerCase().includes(cat))
        )
        return matchesType || matchesCategory
      })
      setSessionDocuments(filtered.slice(0, 10)) // Limit to 10 docs for training
    } catch (error) {
      console.error('Error loading session documents:', error)
      setSessionDocuments([])
    }
  }, [])

  // Start training session
  const handleStartSession = async (track) => {
    setActiveSession(track)
    setCompletedDocs(new Set())
    setCompletedSkills(new Set())
    setSkillSignoffs({})
    setExpandedDoc(null)
    setExpandedSkill(null)
    await loadSessionDocuments(track)
  }

  // Complete document
  const handleCompleteDoc = (docId) => {
    setCompletedDocs(prev => new Set([...prev, docId]))
    setExpandedDoc(null)
  }

  // Sign off flight skill
  const handleSkillSignoff = (skillId) => {
    if (!supervisorName.trim()) {
      alert('Please enter supervisor name for sign-off')
      return
    }
    setCompletedSkills(prev => new Set([...prev, skillId]))
    setSkillSignoffs(prev => ({
      ...prev,
      [skillId]: {
        supervisor: supervisorName,
        timestamp: new Date().toISOString()
      }
    }))
    setExpandedSkill(null)
  }

  // Calculate session progress
  const getSessionProgress = () => {
    if (!activeSession) return 0
    const totalDocs = sessionDocuments.length
    const totalSkills = activeSession.hasFlightSkills ? FLIGHT_SKILLS.length : 0
    const total = totalDocs + totalSkills
    if (total === 0) return 0
    const completed = completedDocs.size + completedSkills.size
    return Math.round((completed / total) * 100)
  }

  // Tabs configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: GraduationCap },
    { id: 'sessions', name: 'Training Sessions', icon: Play },
    { id: 'courses', name: 'Courses', icon: BookOpen, count: courses.length },
    { id: 'records', name: 'Training Records', icon: Award, count: records.length }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-aeria-blue" />
      </div>
    )
  }

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No operator profile found.</p>
          <p className="text-sm mt-2">Please contact your administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training & Competency</h1>
          <p className="text-gray-600 mt-1">Crew certifications, courses, and compliance tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || records.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
          {canRecordTraining && (
            <button
              onClick={() => handleAddRecord()}
              className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Training Record
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Compliance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.complianceRate}%</p>
              </div>
              <div className={`p-3 rounded-lg ${metrics.complianceRate >= 90 ? 'bg-green-100' : metrics.complianceRate >= 70 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <CheckCircle className={`w-6 h-6 ${metrics.complianceRate >= 90 ? 'text-green-600' : metrics.complianceRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Training Records</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalRecords}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.expiringCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Expired</p>
                <p className="text-2xl font-bold text-red-600">{metrics.expiredCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-aeria-blue text-aeria-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
              {tab.count !== undefined && (
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-aeria-blue/10' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expiring Training */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Training Expiring Soon
              </h3>
              {metrics?.expiringRecords?.length > 0 ? (
                <div className="space-y-3">
                  {metrics.expiringRecords.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => handleEditRecord(record)}
                      className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{record.courseName}</p>
                        <p className="text-sm text-gray-600">{record.crewMemberName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-yellow-600 font-medium">
                          Expires: {formatDate(record.expiryDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No training expiring soon</p>
              )}
            </div>

            {/* Expired Training */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Expired Training
              </h3>
              {metrics?.expiredRecords?.length > 0 ? (
                <div className="space-y-3">
                  {metrics.expiredRecords.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => handleEditRecord(record)}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{record.courseName}</p>
                        <p className="text-sm text-gray-600">{record.crewMemberName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-red-600 font-medium">
                          Expired: {formatDate(record.expiryDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No expired training</p>
              )}
            </div>

            {/* Training by Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Grid className="w-5 h-5 text-aeria-blue" />
                Training by Category
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(TRAINING_CATEGORIES).map(([key, category]) => {
                  const categoryData = metrics?.byCategory?.[key] || { current: 0, expiring_soon: 0, expired: 0 }
                  const total = categoryData.current + categoryData.expiring_soon + categoryData.expired

                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg ${category.color} cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={() => {
                        setCategoryFilter(key)
                        setActiveTab('records')
                      }}
                    >
                      <p className="font-medium">{category.label}</p>
                      <p className="text-2xl font-bold mt-1">{total}</p>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className="bg-white/50 px-2 py-0.5 rounded">{categoryData.current} current</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Training Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {!activeSession ? (
              // Track Selection
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Training Track</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TRAINING_TRACKS.map((track) => {
                    const TrackIcon = track.icon
                    return (
                      <div
                        key={track.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-aeria-blue cursor-pointer transition-all group"
                        onClick={() => handleStartSession(track)}
                      >
                        <div className={`w-12 h-12 ${track.color} rounded-xl flex items-center justify-center mb-4`}>
                          <TrackIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-aeria-blue transition-colors">
                          {track.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{track.description}</p>
                        {track.hasFlightSkills && (
                          <span className="inline-flex items-center gap-1 mt-3 px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                            <Plane className="w-3 h-3" />
                            Includes flight skills
                          </span>
                        )}
                        <div className="flex items-center gap-2 mt-4 text-aeria-blue text-sm font-medium">
                          Start Training
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              // Active Training Session
              <div>
                {/* Session Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setActiveSession(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <div className={`w-10 h-10 ${activeSession.color} rounded-lg flex items-center justify-center`}>
                        <activeSession.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">{activeSession.name}</h2>
                        <p className="text-sm text-gray-500">{activeSession.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Progress</p>
                        <p className="text-xl font-bold text-aeria-blue">{getSessionProgress()}%</p>
                      </div>
                      <div className="w-24 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-aeria-blue rounded-full transition-all duration-300"
                          style={{ width: `${getSessionProgress()}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trainee Name Input */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 min-w-[100px]">Trainee Name:</label>
                    <input
                      type="text"
                      value={traineeName}
                      onChange={(e) => setTraineeName(e.target.value)}
                      placeholder="Enter trainee name"
                      className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-500" />
                      Required Documents
                      <span className="text-sm font-normal text-gray-500">
                        ({completedDocs.size}/{sessionDocuments.length} completed)
                      </span>
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {sessionDocuments.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No documents found for this training track</p>
                      </div>
                    ) : (
                      sessionDocuments.map((doc) => {
                        const isCompleted = completedDocs.has(doc.id)
                        const isExpanded = expandedDoc === doc.id

                        return (
                          <div key={doc.id} className="transition-all">
                            {/* Document Card */}
                            <div
                              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                isCompleted ? 'bg-green-50' : ''
                              }`}
                              onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-gray-300'}`}>
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                  ) : (
                                    <Circle className="w-6 h-6" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className={`font-medium ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                                      {doc.title || doc.number}
                                    </h4>
                                    {doc.doc_type && (
                                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                        {doc.doc_type}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 line-clamp-1">
                                    {doc.description || 'Click to read document'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isCompleted ? (
                                    <span className="text-sm text-green-600 font-medium">Completed</span>
                                  ) : (
                                    <span className="text-sm text-gray-400">Click to read</span>
                                  )}
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expanded Document Content */}
                            {isExpanded && (
                              <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                                <div className="ml-10 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="max-h-96 overflow-y-auto mb-4">
                                    <MarkdownPreview content={doc.content} />
                                  </div>
                                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setExpandedDoc(null)
                                      }}
                                      className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                      Collapse
                                    </button>
                                    {!isCompleted && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleCompleteDoc(doc.id)
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Mark Complete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Flight Skills Section */}
                {activeSession.hasFlightSkills && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Plane className="w-5 h-5 text-indigo-500" />
                        Flight Skills
                        <span className="text-sm font-normal text-gray-500">
                          ({completedSkills.size}/{FLIGHT_SKILLS.length} signed off)
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Requires supervisor observation and sign-off</p>
                    </div>

                    {/* Supervisor Name Input */}
                    <div className="p-4 border-b border-gray-100 bg-indigo-50">
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-indigo-700 min-w-[120px]">Supervisor Name:</label>
                        <input
                          type="text"
                          value={supervisorName}
                          onChange={(e) => setSupervisorName(e.target.value)}
                          placeholder="Enter supervisor name for sign-off"
                          className="flex-1 max-w-xs px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {FLIGHT_SKILLS.map((skill) => {
                        const isCompleted = completedSkills.has(skill.id)
                        const isExpanded = expandedSkill === skill.id
                        const signoff = skillSignoffs[skill.id]

                        return (
                          <div key={skill.id} className="transition-all">
                            {/* Skill Card */}
                            <div
                              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                isCompleted ? 'bg-green-50' : ''
                              }`}
                              onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-gray-300'}`}>
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                  ) : (
                                    <Circle className="w-6 h-6" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className={`font-medium ${isCompleted ? 'text-green-700' : 'text-gray-900'}`}>
                                    {skill.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">{skill.description}</p>
                                  {isCompleted && signoff && (
                                    <p className="text-xs text-green-600 mt-1">
                                      Signed off by {signoff.supervisor} on {new Date(signoff.timestamp).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {isCompleted ? (
                                    <span className="text-sm text-green-600 font-medium">Signed Off</span>
                                  ) : (
                                    <span className="text-sm text-gray-400">Review checkpoints</span>
                                  )}
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expanded Skill Checkpoints */}
                            {isExpanded && (
                              <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                                <div className="ml-10 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                  <h5 className="font-medium text-indigo-900 mb-3">Observer Checkpoints</h5>
                                  <ul className="space-y-2 mb-4">
                                    {skill.checkpoints.map((checkpoint, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-indigo-800">
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400" />
                                        {checkpoint}
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="flex items-center justify-between pt-4 border-t border-indigo-200">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setExpandedSkill(null)
                                      }}
                                      className="px-4 py-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                    >
                                      Collapse
                                    </button>
                                    {!isCompleted && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleSkillSignoff(skill.id)
                                        }}
                                        disabled={!supervisorName.trim()}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <Award className="w-4 h-4" />
                                        Sign Off Skill
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Completion Summary */}
                {getSessionProgress() === 100 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Award className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900">Training Complete!</h3>
                        <p className="text-green-700">
                          {traineeName ? `${traineeName} has` : 'Trainee has'} successfully completed all requirements for {activeSession.name}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  />
                </div>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              >
                <option value="">All Categories</option>
                {Object.entries(TRAINING_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>

              {canEdit && (
                <button
                  onClick={handleAddCourse}
                  className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>
              )}
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-gray-500">{course.courseCode}</span>
                      <h3 className="font-semibold text-gray-900 mt-1">{course.name}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${TRAINING_CATEGORIES[course.category]?.color || 'bg-gray-100'}`}>
                      {TRAINING_CATEGORIES[course.category]?.label || course.category}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{course.description}</p>

                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {course.validityPeriod > 0 ? `${course.validityPeriod} months` : 'No expiry'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    {canRecordTraining && (
                      <button
                        onClick={() => handleAddRecord(course)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-aeria-blue hover:bg-aeria-blue/10 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Record
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No courses found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
              >
                <option value="">All Status</option>
                {Object.entries(TRAINING_STATUS).map(([key, status]) => (
                  <option key={key} value={key}>{status.label}</option>
                ))}
              </select>

              <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-aeria-blue text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-aeria-blue text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {canRecordTraining && (
                <button
                  onClick={() => handleAddRecord()}
                  className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Record
                </button>
              )}
            </div>

            {/* Records Table/Grid */}
            {viewMode === 'list' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crew Member</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{record.courseName}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {record.crewMemberName || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(record.completionDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {record.expiryDate ? formatDate(record.expiryDate) : 'No expiry'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {record.provider || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${TRAINING_STATUS[record.status]?.color || 'bg-gray-100'}`}>
                            {TRAINING_STATUS[record.status]?.label || record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="p-1 text-gray-400 hover:text-aeria-blue"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRecords.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No training records found</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => handleEditRecord(record)}
                    className={`bg-white rounded-xl shadow-sm border-l-4 p-4 hover:shadow-md cursor-pointer transition-all ${
                      record.status === 'expired' ? 'border-red-500' :
                      record.status === 'expiring_soon' ? 'border-yellow-500' :
                      'border-green-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.courseName}</h3>
                        <p className="text-sm text-gray-600">{record.crewMemberName}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${TRAINING_STATUS[record.status]?.color || 'bg-gray-100'}`}>
                        {TRAINING_STATUS[record.status]?.label || record.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Completed:</span>
                        <span className="text-gray-900">{formatDate(record.completionDate)}</span>
                      </div>
                      {record.expiryDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Expires:</span>
                          <span className={record.status === 'expired' ? 'text-red-600 font-medium' : 'text-gray-900'}>
                            {formatDate(record.expiryDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Provider:</span>
                        <span className="text-gray-900">{record.provider || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredRecords.length === 0 && viewMode === 'grid' && (
              <div className="text-center py-12 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No training records found</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modals */}
      {courseModalOpen && (
        <TrainingCourseModal
          isOpen={courseModalOpen}
          onClose={handleModalClose}
          course={selectedCourse}
          organizationId={organizationId}
        />
      )}

      {recordModalOpen && (
        <TrainingRecordModal
          isOpen={recordModalOpen}
          onClose={handleModalClose}
          record={selectedRecord}
          course={selectedCourse}
          organizationId={organizationId}
          courses={courses}
        />
      )}
    </div>
  )
}
