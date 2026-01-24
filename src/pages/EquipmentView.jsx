/**
 * Equipment View Page
 * Detailed view of equipment with maintenance tracking
 *
 * @location src/pages/EquipmentView.jsx
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Calendar,
  Wrench,
  FileText,
  Clock,
  DollarSign,
  Settings,
  Activity,
  MapPin,
  Target,
  Camera,
  Shield,
  Truck,
  Zap,
  Radio,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Archive,
  Download
} from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { deleteEquipment, EQUIPMENT_CATEGORIES, EQUIPMENT_STATUS } from '../lib/firestore'
import { subscribeToActivityLog } from '../lib/firestoreComments'
import MaintenanceTracker from '../components/equipment/MaintenanceTracker'
import EquipmentModal from '../components/EquipmentModal'
import { generateEquipmentSpecPDF } from '../components/EquipmentSpecSheet'
import { useBranding } from '../components/BrandingSettings'
import { useAuth } from '../contexts/AuthContext'
import { logger } from '../lib/logger'

// Category icons mapping
const categoryIcons = {
  positioning: MapPin,
  ground_control: Target,
  payloads: Camera,
  safety: Shield,
  vehicles: Truck,
  power: Zap,
  communication: Radio,
  support: Briefcase,
  rpas: Package,
  other: Archive
}

// Status configuration
const statusConfig = {
  available: {
    label: 'Available',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2
  },
  assigned: {
    label: 'Assigned',
    color: 'bg-blue-100 text-blue-700',
    icon: Package
  },
  maintenance: {
    label: 'In Maintenance',
    color: 'bg-amber-100 text-amber-700',
    icon: Wrench
  },
  retired: {
    label: 'Retired',
    color: 'bg-gray-100 text-gray-500',
    icon: Archive
  }
}

export default function EquipmentView() {
  const { equipmentId } = useParams()
  const navigate = useNavigate()
  const { operatorData } = useAuth()
  const { branding } = useBranding()

  const [equipment, setEquipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [activities, setActivities] = useState([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)

  useEffect(() => {
    loadEquipment()
  }, [equipmentId])

  // Subscribe to activity log
  useEffect(() => {
    if (!equipmentId) return

    setActivitiesLoading(true)
    const unsubscribe = subscribeToActivityLog('equipment', equipmentId, (data) => {
      setActivities(data)
      setActivitiesLoading(false)
    })

    return () => unsubscribe()
  }, [equipmentId])

  const loadEquipment = async () => {
    setLoading(true)
    try {
      const docRef = doc(db, 'equipment', equipmentId)
      const snapshot = await getDoc(docRef)

      if (snapshot.exists()) {
        setEquipment({
          id: snapshot.id,
          ...snapshot.data()
        })
      } else {
        logger.error('Equipment not found:', equipmentId)
        navigate('/equipment')
      }
    } catch (err) {
      logger.error('Error loading equipment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${equipment.name}? This cannot be undone.`)) {
      return
    }

    try {
      await deleteEquipment(equipmentId)
      navigate('/equipment')
    } catch (err) {
      logger.error('Error deleting equipment:', err)
      alert('Failed to delete equipment')
    }
  }

  const handleDownloadSpec = () => {
    const pdf = generateEquipmentSpecPDF(equipment, branding)
    pdf.save(`spec-sheet_${equipment.name}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Check maintenance status
  const isMaintenanceOverdue = equipment?.nextServiceDate
    ? new Date(equipment.nextServiceDate) < new Date()
    : false

  const isMaintenanceDueSoon = equipment?.nextServiceDate
    ? (() => {
        const nextService = new Date(equipment.nextServiceDate)
        const now = new Date()
        const daysUntil = Math.ceil((nextService - now) / (1000 * 60 * 60 * 24))
        return daysUntil <= 30 && daysUntil >= 0
      })()
    : false

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'history', label: 'Activity Log', icon: Activity }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="card text-center py-12">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Equipment not found</h3>
        <p className="text-gray-500 mb-4">The equipment you're looking for doesn't exist.</p>
        <Link to="/equipment" className="btn-primary">
          Back to Equipment
        </Link>
      </div>
    )
  }

  const CategoryIcon = categoryIcons[equipment.category] || Package
  const status = statusConfig[equipment.status] || statusConfig.available
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/equipment')}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isMaintenanceOverdue ? 'bg-red-100' : 'bg-aeria-sky'
            }`}>
              <CategoryIcon className={`w-6 h-6 ${
                isMaintenanceOverdue ? 'text-red-600' : 'text-aeria-navy'
              }`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
              <p className="text-gray-500">
                {equipment.manufacturer} {equipment.model}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSpec}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Spec Sheet
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn-secondary text-red-600 hover:bg-red-50 inline-flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Status and alerts */}
      <div className="flex flex-wrap gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${status.color}`}>
          <StatusIcon className="w-4 h-4" />
          {status.label}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
          <CategoryIcon className="w-4 h-4" />
          {EQUIPMENT_CATEGORIES[equipment.category]?.label || equipment.category}
        </span>
        {isMaintenanceOverdue && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-red-100 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            Maintenance Overdue
          </span>
        )}
        {isMaintenanceDueSoon && !isMaintenanceOverdue && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-amber-100 text-amber-700">
            <Clock className="w-4 h-4" />
            Maintenance Due Soon
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
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
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Equipment Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment Details</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Serial Number</dt>
                <dd className="font-mono text-gray-900">{equipment.serialNumber || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Manufacturer</dt>
                <dd className="text-gray-900">{equipment.manufacturer || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Model</dt>
                <dd className="text-gray-900">{equipment.model || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-900">{EQUIPMENT_CATEGORIES[equipment.category]?.label || equipment.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Condition</dt>
                <dd className="text-gray-900">{equipment.condition || '-'}</dd>
              </div>
            </dl>
          </div>

          {/* Purchase Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Purchase Date</dt>
                <dd className="text-gray-900">
                  {equipment.purchaseDate
                    ? new Date(equipment.purchaseDate).toLocaleDateString()
                    : '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Purchase Price</dt>
                <dd className="text-gray-900">
                  {equipment.purchasePrice
                    ? `$${Number(equipment.purchasePrice).toLocaleString()}`
                    : '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Warranty Expiry</dt>
                <dd className="text-gray-900">
                  {equipment.warrantyExpiry
                    ? new Date(equipment.warrantyExpiry).toLocaleDateString()
                    : '-'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Service Schedule */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Schedule</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Maintenance Interval</dt>
                <dd className="text-gray-900">
                  {equipment.maintenanceInterval
                    ? `${equipment.maintenanceInterval} days`
                    : '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last Service</dt>
                <dd className="text-gray-900">
                  {equipment.lastServiceDate
                    ? new Date(equipment.lastServiceDate).toLocaleDateString()
                    : '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Next Service</dt>
                <dd className={`font-medium ${
                  isMaintenanceOverdue ? 'text-red-600' :
                  isMaintenanceDueSoon ? 'text-amber-600' : 'text-gray-900'
                }`}>
                  {equipment.nextServiceDate
                    ? new Date(equipment.nextServiceDate).toLocaleDateString()
                    : '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Flight Hours</dt>
                <dd className="text-gray-900">
                  {equipment.flightHours !== undefined
                    ? `${equipment.flightHours} hrs`
                    : '-'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Notes */}
          {equipment.notes && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{equipment.notes}</p>
            </div>
          )}

          {/* Image */}
          {equipment.imageUrl && (
            <div className="card lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment Image</h2>
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="max-w-md rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <MaintenanceTracker
          equipment={equipment}
          operatorId={operatorData?.id}
        />
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-aeria-navy border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No activity recorded yet</p>
              <p className="text-sm mt-1">Activities will appear here as equipment is used</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Activity className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {activity.actorName || 'System'}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {activity.createdAt
                          ? new Date(activity.createdAt).toLocaleDateString() + ' ' +
                            new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <EquipmentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          loadEquipment()
        }}
        equipment={equipment}
      />
    </div>
  )
}
