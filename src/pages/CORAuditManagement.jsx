/**
 * CORAuditManagement.jsx
 * COR Audit Cycle and Certificate Management
 *
 * Manages the 3-year COR certification cycle:
 * - Certification audits
 * - Maintenance audits
 * - Re-certification audits
 * - Certificate tracking
 * - Auditor registry
 *
 * @location src/pages/CORAuditManagement.jsx
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Award,
  Calendar,
  Users,
  FileCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  RefreshCw,
  ChevronRight,
  Shield,
  TrendingUp,
  Target,
  Eye,
  Edit,
  FileText,
  AlertCircle
} from 'lucide-react'

import {
  getAudits,
  getCertificates,
  getAuditors,
  getAuditCycleStatus,
  getOpenDeficiencies,
  AUDIT_TYPES,
  AUDIT_STATUS,
  AUDITOR_STATUS,
  CERTIFICATE_STATUS,
  COR_ELEMENTS,
  COR_REQUIREMENTS
} from '../lib/firestoreCORAudit'

import CORAuditModal from '../components/cor/CORAuditModal'
import CORCertificateModal from '../components/cor/CORCertificateModal'
import CORAuditorModal from '../components/cor/CORAuditorModal'

export default function CORAuditManagement() {
  const { user } = useAuth()
  const operatorId = user?.uid

  // State
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [audits, setAudits] = useState([])
  const [certificates, setCertificates] = useState([])
  const [auditors, setAuditors] = useState([])
  const [cycleStatus, setCycleStatus] = useState(null)
  const [openDeficiencies, setOpenDeficiencies] = useState([])

  // Modal state
  const [auditModalOpen, setAuditModalOpen] = useState(false)
  const [certificateModalOpen, setCertificateModalOpen] = useState(false)
  const [auditorModalOpen, setAuditorModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // Load data
  const loadData = useCallback(async () => {
    if (!operatorId) return

    setLoading(true)
    try {
      const [auditsData, certificatesData, auditorsData, cycleData, deficienciesData] = await Promise.all([
        getAudits(operatorId),
        getCertificates(operatorId),
        getAuditors(operatorId, { activeOnly: false }),
        getAuditCycleStatus(operatorId),
        getOpenDeficiencies(operatorId)
      ])

      setAudits(auditsData)
      setCertificates(certificatesData)
      setAuditors(auditorsData)
      setCycleStatus(cycleData)
      setOpenDeficiencies(deficienciesData)
    } catch (error) {
      console.error('Error loading COR audit data:', error)
    } finally {
      setLoading(false)
    }
  }, [operatorId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Modal handlers
  const handleScheduleAudit = () => {
    setSelectedItem(null)
    setAuditModalOpen(true)
  }

  const handleViewAudit = (audit) => {
    setSelectedItem(audit)
    setAuditModalOpen(true)
  }

  const handleAddCertificate = () => {
    setSelectedItem(null)
    setCertificateModalOpen(true)
  }

  const handleViewCertificate = (cert) => {
    setSelectedItem(cert)
    setCertificateModalOpen(true)
  }

  const handleAddAuditor = () => {
    setSelectedItem(null)
    setAuditorModalOpen(true)
  }

  const handleEditAuditor = (auditor) => {
    setSelectedItem(auditor)
    setAuditorModalOpen(true)
  }

  const handleModalClose = () => {
    setAuditModalOpen(false)
    setCertificateModalOpen(false)
    setAuditorModalOpen(false)
    setSelectedItem(null)
    loadData()
  }

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp?.toDate?.() || new Date(timestamp)
    return date.toLocaleDateString('en-CA')
  }

  // Tabs configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'audits', name: 'Audits', icon: FileCheck, count: audits.length },
    { id: 'certificates', name: 'Certificates', icon: Award, count: certificates.length },
    { id: 'auditors', name: 'Auditors', icon: Users, count: auditors.filter(a => a.calculatedStatus === 'active').length }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-aeria-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Safety Audit Management</h1>
          <p className="text-gray-600 mt-1">Safety Management System - Audit Cycle & Compliance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cycle Status Banner */}
      {cycleStatus && (
        <div className={`rounded-xl p-6 ${
          cycleStatus.hasCertificate
            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
            : 'bg-gradient-to-r from-gray-600 to-gray-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold">
                    {cycleStatus.hasCertificate ? 'Safety Certified' : 'Not Certified'}
                  </h2>
                  {cycleStatus.hasCertificate && (
                    <p className="text-white/80 text-sm">
                      Certificate expires: {formatDate(cycleStatus.certificate?.expiryDate)}
                    </p>
                  )}
                </div>
              </div>

              {cycleStatus.nextAuditType && (
                <div className="mt-4 p-3 bg-white/20 rounded-lg">
                  <p className="text-sm font-medium">Next Audit Required</p>
                  <p className="text-lg font-bold">
                    {AUDIT_TYPES[cycleStatus.nextAuditType]?.label || cycleStatus.nextAuditType}
                  </p>
                  {cycleStatus.nextAuditDue && (
                    <p className="text-sm text-white/80">
                      Due by: {formatDate(cycleStatus.nextAuditDue)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{cycleStatus.cycleYear + 1}</p>
                <p className="text-xs text-white/70">Year of Cycle</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{cycleStatus.maintenanceAuditsCompleted}</p>
                <p className="text-xs text-white/70">Maintenance Audits</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{openDeficiencies.length}</p>
                <p className="text-xs text-white/70">Open Deficiencies</p>
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
            {/* Safety Elements Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-aeria-blue" />
                Safety Element Requirements (8 Elements)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(COR_ELEMENTS).map(([key, element]) => (
                  <div
                    key={key}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <p className="text-xs text-gray-500 font-medium uppercase">
                      {key.replace('element', 'Element ')}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
                      {element.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Weight: {element.weight.min}-{element.weight.max}%
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Minimum {COR_REQUIREMENTS.minimumOverallScore}% overall score required.
                Minimum {COR_REQUIREMENTS.minimumElementScore}% on each element.
              </p>
            </div>

            {/* Recent Audits */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-aeria-blue" />
                  Recent Audits
                </h3>
                <button
                  onClick={handleScheduleAudit}
                  className="text-sm text-aeria-blue hover:text-aeria-navy font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Schedule
                </button>
              </div>
              {audits.length > 0 ? (
                <div className="space-y-3">
                  {audits.slice(0, 5).map((audit) => (
                    <div
                      key={audit.id}
                      onClick={() => handleViewAudit(audit)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{audit.auditNumber}</p>
                        <p className="text-sm text-gray-500">
                          {AUDIT_TYPES[audit.auditType]?.label || audit.auditType}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${AUDIT_STATUS[audit.status]?.color || 'bg-gray-100'}`}>
                          {AUDIT_STATUS[audit.status]?.label || audit.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(audit.scheduledDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No audits scheduled</p>
              )}
            </div>

            {/* Open Deficiencies */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Open Deficiencies
              </h3>
              {openDeficiencies.length > 0 ? (
                <div className="space-y-3">
                  {openDeficiencies.slice(0, 5).map((deficiency) => (
                    <div
                      key={deficiency.id}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {deficiency.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Element: {COR_ELEMENTS[deficiency.elementId]?.name || deficiency.elementId}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          deficiency.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          deficiency.severity === 'major' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {deficiency.severity}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {formatDate(deficiency.dueDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="text-gray-500">No open deficiencies</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audits Tab */}
        {activeTab === 'audits' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Safety Audits</h3>
              <button
                onClick={handleScheduleAudit}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
              >
                <Plus className="w-4 h-4" />
                Schedule Audit
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audit #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auditor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {audits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{audit.auditNumber}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {AUDIT_TYPES[audit.auditType]?.label || audit.auditType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {audit.auditorName || '-'}
                        <span className="text-xs text-gray-400 ml-1">
                          ({audit.auditorType})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(audit.scheduledDate)}
                      </td>
                      <td className="px-4 py-3">
                        {audit.overallScore !== null ? (
                          <span className={`font-medium ${
                            audit.overallScore >= COR_REQUIREMENTS.minimumOverallScore
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {audit.overallScore}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${AUDIT_STATUS[audit.status]?.color || 'bg-gray-100'}`}>
                          {AUDIT_STATUS[audit.status]?.label || audit.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewAudit(audit)}
                          className="p-1 text-gray-400 hover:text-aeria-blue"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {audits.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No audits found. Schedule your first safety audit.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Safety Certificates</h3>
              <button
                onClick={handleAddCertificate}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Certificate
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certifying Partner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {cert.certificateNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {cert.corType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {cert.certifyingPartner || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(cert.issueDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(cert.expiryDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${CERTIFICATE_STATUS[cert.calculatedStatus]?.color || 'bg-gray-100'}`}>
                          {CERTIFICATE_STATUS[cert.calculatedStatus]?.label || cert.calculatedStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewCertificate(cert)}
                          className="p-1 text-gray-400 hover:text-aeria-blue"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {certificates.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No certificates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Auditors Tab */}
        {activeTab === 'auditors' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Auditor Registry</h3>
              <button
                onClick={handleAddAuditor}
                className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
              >
                <Plus className="w-4 h-4" />
                Register Auditor
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certification #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Training Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audits Completed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recert Due</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditors.map((auditor) => (
                    <tr key={auditor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{auditor.name}</p>
                          <p className="text-sm text-gray-500">{auditor.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          auditor.auditorType === 'internal'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {auditor.auditorType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {auditor.certificationNumber || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {auditor.trainingHours || 0}h
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {auditor.auditsCompleted || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(auditor.recertificationDue)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${AUDITOR_STATUS[auditor.calculatedStatus]?.color || 'bg-gray-100'}`}>
                          {AUDITOR_STATUS[auditor.calculatedStatus]?.label || auditor.calculatedStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEditAuditor(auditor)}
                          className="p-1 text-gray-400 hover:text-aeria-blue"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {auditors.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No auditors registered. Safety audits require trained internal auditors.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Internal auditors require minimum 14 hours training. External auditors require 35 hours.
                Recertification every 3 years with minimum 7 hours refresher training.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {auditModalOpen && (
        <CORAuditModal
          isOpen={auditModalOpen}
          onClose={handleModalClose}
          audit={selectedItem}
          operatorId={operatorId}
          auditors={auditors}
        />
      )}

      {certificateModalOpen && (
        <CORCertificateModal
          isOpen={certificateModalOpen}
          onClose={handleModalClose}
          certificate={selectedItem}
          operatorId={operatorId}
          audits={audits.filter(a => a.status === 'passed')}
        />
      )}

      {auditorModalOpen && (
        <CORAuditorModal
          isOpen={auditorModalOpen}
          onClose={handleModalClose}
          auditor={selectedItem}
          operatorId={operatorId}
        />
      )}
    </div>
  )
}
