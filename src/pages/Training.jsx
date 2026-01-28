/**
 * Training.jsx
 * Training Management Dashboard
 *
 * COR Element 3: Training & Instruction of Workers (10-15% weight)
 * Manages training courses, records, and compliance tracking
 *
 * @location src/pages/Training.jsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
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
  Award,
  Calendar,
  Filter,
  Download,
  Grid,
  List,
  Search,
  Eye,
  Edit
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

import TrainingCourseModal from '../components/training/TrainingCourseModal'
import TrainingRecordModal from '../components/training/TrainingRecordModal'

export default function Training() {
  const { user } = useAuth()
  const operatorId = user?.uid

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
    if (!operatorId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      let coursesData = await getCourses(operatorId)

      // If no courses exist, seed defaults
      if (coursesData.length === 0) {
        await seedDefaultCourses(operatorId)
        coursesData = await getCourses(operatorId)
      }

      const [recordsData, metricsData] = await Promise.all([
        getAllTrainingRecords(operatorId),
        getTrainingMetrics(operatorId)
      ])

      setCourses(coursesData)
      setRecords(recordsData)
      setMetrics(metricsData)
    } catch (error) {
      console.error('Error loading training data:', error)
    } finally {
      setLoading(false)
    }
  }, [operatorId])

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

  // Tabs configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: GraduationCap },
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

  if (!operatorId) {
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
          <button
            onClick={() => handleAddRecord()}
            className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Training Record
          </button>
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

              <button
                onClick={handleAddCourse}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Course
              </button>
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
                    <button
                      onClick={() => handleAddRecord(course)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-aeria-blue hover:bg-aeria-blue/10 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Record
                    </button>
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
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

              <button
                onClick={() => handleAddRecord()}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Record
              </button>
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
          operatorId={operatorId}
        />
      )}

      {recordModalOpen && (
        <TrainingRecordModal
          isOpen={recordModalOpen}
          onClose={handleModalClose}
          record={selectedRecord}
          course={selectedCourse}
          operatorId={operatorId}
          courses={courses}
        />
      )}
    </div>
  )
}
