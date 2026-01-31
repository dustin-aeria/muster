// ============================================
// AIRCRAFT PAGE
// Fleet management with spec sheet viewing
// ============================================

import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Plane,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Archive,
  Battery,
  Gauge,
  Weight,
  Clock,
  Eye,
  Download,
  FileText,
  DollarSign,
  RotateCcw,
  Calendar,
  XOctagon
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAircraft, deleteAircraft } from '../lib/firestore'
import { useOrganization } from '../hooks/useOrganization'
import { usePermissions } from '../hooks/usePermissions'
import { CanEdit, CanDelete } from '../components/PermissionGuard'
import { calculateOverallMaintenanceStatus } from '../lib/firestoreMaintenance'
import AircraftModal from '../components/AircraftModal'
import AircraftSpecSheet, { generateAircraftSpecPDF } from '../components/AircraftSpecSheet'
import { useBranding } from '../components/BrandingSettings'
import { logger } from '../lib/logger'
import { formatCurrency } from '../lib/costEstimator'

// ============================================
// STATUS CONFIGURATION
// ============================================
const statusConfig = {
  airworthy: {
    label: 'Airworthy',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2
  },
  maintenance: {
    label: 'In Maintenance',
    color: 'bg-amber-100 text-amber-700',
    icon: Wrench
  },
  grounded: {
    label: 'Grounded',
    color: 'bg-red-100 text-red-700',
    icon: AlertTriangle
  },
  retired: {
    label: 'Retired',
    color: 'bg-gray-100 text-gray-500',
    icon: Archive
  }
}

// Maintenance status configuration
const maintenanceStatusConfig = {
  ok: { label: 'Maintenance Current', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  due_soon: { label: 'Maintenance Due Soon', color: 'bg-amber-100 text-amber-700', icon: Clock },
  overdue: { label: 'Maintenance Overdue', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  grounded: { label: 'Grounded', color: 'bg-red-200 text-red-800', icon: XOctagon },
  no_schedule: { label: 'No Schedule', color: 'bg-gray-100 text-gray-500', icon: Calendar }
}

const categoryLabels = {
  multirotor: 'Multirotor',
  fixed_wing: 'Fixed Wing',
  vtol: 'VTOL',
  helicopter: 'Helicopter',
  other: 'Other'
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function Aircraft() {
  const { organizationId } = useOrganization()
  const { canEdit, canDelete } = usePermissions()
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingAircraft, setEditingAircraft] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [selectedSpec, setSelectedSpec] = useState(null)

  const { branding } = useBranding()

  useEffect(() => {
    if (organizationId) {
      loadAircraft()
    }
  }, [organizationId])

  const loadAircraft = async () => {
    setLoading(true)
    try {
      const data = await getAircraft(organizationId)
      setAircraft(data)
    } catch (err) {
      logger.error('Error loading aircraft:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (aircraftId, aircraftName) => {
    if (!confirm(`Are you sure you want to delete ${aircraftName}? This cannot be undone.`)) {
      return
    }
    
    try {
      await deleteAircraft(aircraftId)
      setAircraft(prev => prev.filter(a => a.id !== aircraftId))
    } catch (err) {
      logger.error('Error deleting aircraft:', err)
      alert('Failed to delete aircraft')
    }
    setMenuOpen(null)
  }

  const handleEdit = (ac) => {
    setEditingAircraft(ac)
    setShowModal(true)
    setMenuOpen(null)
  }

  const handleViewSpec = (ac) => {
    setSelectedSpec(ac)
    setMenuOpen(null)
  }

  const handleExportSpec = (ac) => {
    try {
      const pdf = generateAircraftSpecPDF(ac, branding)
      pdf.save(`spec-sheet_${ac.nickname || ac.serialNumber || 'aircraft'}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      logger.error('Failed to export spec:', err)
    }
    setMenuOpen(null)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingAircraft(null)
    loadAircraft()
  }

  // Filter aircraft
  const filteredAircraft = aircraft.filter(ac => {
    const matchesSearch = 
      ac.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ac.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ac.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ac.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ac.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Fleet stats
  const fleetStats = {
    total: aircraft.length,
    airworthy: aircraft.filter(a => a.status === 'airworthy').length,
    maintenance: aircraft.filter(a => a.status === 'maintenance').length,
    grounded: aircraft.filter(a => a.status === 'grounded' || a.isGrounded).length,
    maintenanceOverdue: aircraft.filter(a => calculateOverallMaintenanceStatus(a) === 'overdue').length,
    maintenanceDueSoon: aircraft.filter(a => calculateOverallMaintenanceStatus(a) === 'due_soon').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet</h1>
          <p className="text-gray-600 mt-1">Global aircraft inventory for all projects</p>
        </div>
        <CanEdit>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Aircraft
          </button>
        </CanEdit>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="card bg-gray-50">
          <p className="text-sm text-gray-500">Total Fleet</p>
          <p className="text-2xl font-bold text-gray-900">{fleetStats.total}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-green-600">Airworthy</p>
          <p className="text-2xl font-bold text-green-700">{fleetStats.airworthy}</p>
        </div>
        <div className="card bg-amber-50">
          <p className="text-sm text-amber-600">In Maintenance</p>
          <p className="text-2xl font-bold text-amber-700">{fleetStats.maintenance}</p>
        </div>
        <div className="card bg-red-50">
          <p className="text-sm text-red-600">Grounded</p>
          <p className="text-2xl font-bold text-red-700">{fleetStats.grounded}</p>
        </div>
        <Link to="/maintenance?type=aircraft&status=overdue" className="card bg-red-50 hover:bg-red-100 transition-colors">
          <p className="text-sm text-red-600">Maint. Overdue</p>
          <p className="text-2xl font-bold text-red-700">{fleetStats.maintenanceOverdue}</p>
        </Link>
        <Link to="/maintenance?type=aircraft&status=due_soon" className="card bg-amber-50 hover:bg-amber-100 transition-colors">
          <p className="text-sm text-amber-600">Maint. Due Soon</p>
          <p className="text-2xl font-bold text-amber-700">{fleetStats.maintenanceDueSoon}</p>
        </Link>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <label htmlFor="aircraft-search" className="sr-only">Search aircraft</label>
          <input
            id="aircraft-search"
            type="search"
            placeholder="Search aircraft..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <label htmlFor="aircraft-status-filter" className="sr-only">Filter by status</label>
        <select
          id="aircraft-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-44"
        >
          <option value="all">All Status</option>
          <option value="airworthy">Airworthy</option>
          <option value="maintenance">In Maintenance</option>
          <option value="grounded">Grounded</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      {/* Aircraft list */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading aircraft...</p>
        </div>
      ) : filteredAircraft.length === 0 ? (
        <div className="card text-center py-12">
          <Plane className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          {aircraft.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No aircraft yet</h3>
              <p className="text-gray-500 mb-4">
                {canEdit
                  ? 'Add aircraft to your fleet to assign them to operations.'
                  : 'No aircraft have been added yet. Contact an admin to add aircraft.'}
              </p>
              <CanEdit>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Aircraft
                </button>
              </CanEdit>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No matching aircraft</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAircraft.map((ac) => {
            const status = statusConfig[ac.status] || statusConfig.airworthy
            const StatusIcon = status.icon
            const maintStatus = calculateOverallMaintenanceStatus(ac)
            const maintConfig = maintenanceStatusConfig[maintStatus] || maintenanceStatusConfig.no_schedule
            const MaintIcon = maintConfig.icon
            const hasFlightData = ac.totalFlightHours || ac.totalCycles || ac.totalFlights

            return (
              <div key={ac.id} className="card hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      maintStatus === 'overdue' ? 'bg-red-100' :
                      maintStatus === 'grounded' ? 'bg-red-200' :
                      'bg-aeria-sky'
                    }`}>
                      <Plane className={`w-5 h-5 ${
                        maintStatus === 'overdue' || maintStatus === 'grounded' ? 'text-red-600' : 'text-aeria-navy'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{ac.nickname}</h3>
                      <p className="text-sm text-gray-500">{ac.make} {ac.model}</p>
                    </div>
                  </div>

                  {/* More menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === ac.id ? null : ac.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuOpen === ac.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => handleViewSpec(ac)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Spec Sheet
                          </button>
                          <button
                            onClick={() => handleExportSpec(ac)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export Spec PDF
                          </button>
                          <Link
                            to={`/maintenance/item/aircraft/${ac.id}`}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => setMenuOpen(null)}
                          >
                            <Wrench className="w-4 h-4" />
                            Maintenance Details
                          </Link>
                          {(canEdit || canDelete) && <hr className="my-1 border-gray-200" />}
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(ac)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(ac.id, ac.nickname)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                  {maintStatus !== 'no_schedule' && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${maintConfig.color}`}>
                      <MaintIcon className="w-3.5 h-3.5" />
                      {maintConfig.label}
                    </span>
                  )}
                </div>

                {/* Maintenance warning */}
                {(maintStatus === 'overdue' || maintStatus === 'grounded') && (
                  <Link
                    to={`/maintenance/item/aircraft/${ac.id}`}
                    className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
                      maintStatus === 'grounded' ? 'bg-red-100 text-red-800' : 'bg-red-50 text-red-700'
                    } hover:opacity-80 transition-opacity`}
                  >
                    {maintStatus === 'grounded' ? (
                      <XOctagon className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span className="text-xs font-medium">
                      {maintStatus === 'grounded' ? 'Aircraft Grounded' : 'Maintenance Overdue'}
                    </span>
                  </Link>
                )}

                {maintStatus === 'due_soon' && (
                  <Link
                    to={`/maintenance/item/aircraft/${ac.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg mb-3 bg-amber-50 text-amber-700 hover:opacity-80 transition-opacity"
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">Maintenance Due Soon</span>
                  </Link>
                )}

                {/* Flight hours and cycles */}
                {hasFlightData && (
                  <div className="flex items-center gap-4 mb-3 p-2 bg-gray-50 rounded-lg text-sm">
                    {ac.totalFlightHours > 0 && (
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Gauge className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{ac.totalFlightHours}</span>
                        <span className="text-gray-500">hrs</span>
                      </div>
                    )}
                    {ac.totalCycles > 0 && (
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <RotateCcw className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{ac.totalCycles}</span>
                        <span className="text-gray-500">cycles</span>
                      </div>
                    )}
                    {ac.totalFlights > 0 && (
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Plane className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{ac.totalFlights}</span>
                        <span className="text-gray-500">flights</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Specs grid */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {ac.mtow && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Weight className="w-3.5 h-3.5 text-gray-400" />
                      <span>{ac.mtow} kg</span>
                    </div>
                  )}
                  {ac.maxSpeed && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Gauge className="w-3.5 h-3.5 text-gray-400" />
                      <span>{ac.maxSpeed} m/s</span>
                    </div>
                  )}
                  {ac.endurance && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{ac.endurance} min</span>
                    </div>
                  )}
                  {ac.category && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Plane className="w-3.5 h-3.5 text-gray-400" />
                      <span>{categoryLabels[ac.category] || ac.category}</span>
                    </div>
                  )}
                </div>

                {/* Inspection dates */}
                {(ac.lastInspection || ac.nextInspectionDue) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                    {ac.lastInspection && (
                      <div className="text-gray-500">
                        <span className="block text-gray-400">Last Inspection</span>
                        {new Date(ac.lastInspection).toLocaleDateString()}
                      </div>
                    )}
                    {ac.nextInspectionDue && (
                      <div className="text-gray-500">
                        <span className="block text-gray-400">Next Due</span>
                        <span className={new Date(ac.nextInspectionDue) < new Date() ? 'text-red-600 font-medium' : ''}>
                          {new Date(ac.nextInspectionDue).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Rates */}
                {(ac.hourlyRate > 0 || ac.dailyRate > 0 || ac.weeklyRate > 0) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-sm">
                      <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-gray-600">
                        {ac.hourlyRate > 0 && (
                          <span>{formatCurrency(ac.hourlyRate)}/hr</span>
                        )}
                        {ac.dailyRate > 0 && (
                          <span>{formatCurrency(ac.dailyRate)}/day</span>
                        )}
                        {ac.weeklyRate > 0 && (
                          <span>{formatCurrency(ac.weeklyRate)}/wk</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Serial number */}
                {ac.serialNumber && (
                  <p className="text-xs text-gray-400 font-mono mt-3 pt-3 border-t border-gray-100">
                    S/N: {ac.serialNumber}
                  </p>
                )}

                {/* Quick actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleViewSpec(ac)}
                    className="flex-1 text-sm text-aeria-blue hover:text-aeria-navy flex items-center justify-center gap-1"
                  >
                    <FileText className="w-4 h-4" />
                    Specs
                  </button>
                  <Link
                    to={`/maintenance/item/aircraft/${ac.id}`}
                    className="flex-1 text-sm text-aeria-blue hover:text-aeria-navy flex items-center justify-center gap-1"
                  >
                    <Wrench className="w-4 h-4" />
                    Maintenance
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Aircraft Modal */}
      <AircraftModal 
        isOpen={showModal} 
        onClose={handleModalClose}
        aircraft={editingAircraft}
      />
      
      {/* Spec Sheet Modal */}
      <AircraftSpecSheet
        aircraft={selectedSpec}
        isOpen={!!selectedSpec}
        onClose={() => setSelectedSpec(null)}
        branding={branding}
      />
    </div>
  )
}
