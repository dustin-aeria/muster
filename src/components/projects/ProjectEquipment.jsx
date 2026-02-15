// ============================================
// PROJECT EQUIPMENT COMPONENT
// Equipment overview for projects - Aircraft + Equipment Library
// ============================================

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Plane,
  Plus,
  X,
  Download,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Gauge,
  Weight,
  Clock,
  Eye,
  Trash2,
  Search,
  Package,
  MapPin,
  Target,
  Camera,
  Shield,
  Truck,
  Zap,
  Radio,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Archive,
  DollarSign
} from 'lucide-react'
import {
  getAircraft,
  getEquipment,
  EQUIPMENT_CATEGORIES
} from '../../lib/firestore'
import { useOrganization } from '../../hooks/useOrganization'
import AircraftSpecSheet, { generateAircraftSpecPDF } from '../AircraftSpecSheet'
import { useBranding } from '../BrandingSettings'
import { BrandedPDF } from '../../lib/pdfExportService'
import { logger } from '../../lib/logger'

// ============================================
// STATUS CONFIGURATION
// ============================================
const aircraftStatusConfig = {
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
  }
}

const equipmentStatusConfig = {
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
  rpas: Plane,
  other: Package
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectEquipment({ project, onUpdate }) {
  const { organizationId } = useOrganization()
  const [allAircraft, setAllAircraft] = useState([])
  const [allEquipment, setAllEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddAircraftModal, setShowAddAircraftModal] = useState(false)
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState(null)
  const [aircraftSearchQuery, setAircraftSearchQuery] = useState('')
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('')
  const [equipmentCategoryFilter, setEquipmentCategoryFilter] = useState('all')
  const [exporting, setExporting] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({})

  const { branding } = useBranding()

  // Get assigned aircraft from flight plan
  const assignedAircraftIds = project.flightPlan?.aircraft?.map(a => a.id) || []
  const assignedAircraft = allAircraft.filter(a => assignedAircraftIds.includes(a.id))

  // Get assigned equipment from project
  const assignedEquipmentIds = project.assignedEquipment?.map(e => e.id) || []
  const assignedEquipment = allEquipment.filter(e => assignedEquipmentIds.includes(e.id))

  // Group assigned equipment by category
  const equipmentByCategory = assignedEquipment.reduce((acc, item) => {
    const cat = item.category || 'support'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  // Load all aircraft and equipment
  useEffect(() => {
    const loadData = async () => {
      if (!organizationId) return
      try {
        const [aircraftData, equipmentData] = await Promise.all([
          getAircraft(organizationId),
          getEquipment(organizationId)
        ])
        setAllAircraft(aircraftData)
        setAllEquipment(equipmentData)
      } catch (err) {
        logger.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [organizationId])

  // Available aircraft (not already assigned)
  const availableAircraft = allAircraft.filter(a =>
    !assignedAircraftIds.includes(a.id) &&
    a.status === 'airworthy' &&
    (a.nickname?.toLowerCase().includes(aircraftSearchQuery.toLowerCase()) ||
      a.make?.toLowerCase().includes(aircraftSearchQuery.toLowerCase()) ||
      a.model?.toLowerCase().includes(aircraftSearchQuery.toLowerCase()))
  )

  // Available equipment (not already assigned to this project)
  const availableEquipment = allEquipment.filter(e =>
    !assignedEquipmentIds.includes(e.id) &&
    (e.status === 'available' || e.status === 'assigned') && // Can assign even if assigned elsewhere
    e.status !== 'retired' &&
    (equipmentCategoryFilter === 'all' || e.category === equipmentCategoryFilter) &&
    (e.name?.toLowerCase().includes(equipmentSearchQuery.toLowerCase()) ||
      e.manufacturer?.toLowerCase().includes(equipmentSearchQuery.toLowerCase()) ||
      e.model?.toLowerCase().includes(equipmentSearchQuery.toLowerCase()))
  )

  // Add aircraft to project
  const handleAddAircraft = async (aircraft) => {
    const currentAircraft = project.flightPlan?.aircraft || []
    const isPrimary = currentAircraft.length === 0

    const updatedFlightPlan = {
      ...project.flightPlan,
      aircraft: [
        ...currentAircraft,
        {
          id: aircraft.id,
          nickname: aircraft.nickname,
          registration: aircraft.registration || aircraft.serialNumber,
          make: aircraft.make,
          model: aircraft.model,
          serialNumber: aircraft.serialNumber,
          isPrimary,
          // Include rates for cost calculations
          hourlyRate: aircraft.hourlyRate || 0,
          dailyRate: aircraft.dailyRate || 0,
          weeklyRate: aircraft.weeklyRate || 0
        }
      ]
    }

    await onUpdate({ flightPlan: updatedFlightPlan })
    setShowAddAircraftModal(false)
  }

  // Remove aircraft from project
  const handleRemoveAircraft = async (aircraftId) => {
    const updatedAircraft = (project.flightPlan?.aircraft || []).filter(a => a.id !== aircraftId)

    // If we removed the primary, make the first one primary
    if (updatedAircraft.length > 0 && !updatedAircraft.some(a => a.isPrimary)) {
      updatedAircraft[0].isPrimary = true
    }

    await onUpdate({
      flightPlan: {
        ...project.flightPlan,
        aircraft: updatedAircraft
      }
    })
  }

  // Set primary aircraft
  const handleSetPrimary = async (aircraftId) => {
    const updatedAircraft = (project.flightPlan?.aircraft || []).map(a => ({
      ...a,
      isPrimary: a.id === aircraftId
    }))

    await onUpdate({
      flightPlan: {
        ...project.flightPlan,
        aircraft: updatedAircraft
      }
    })
  }

  // Add equipment to project
  const handleAddEquipment = async (equipment) => {
    const currentEquipment = project.assignedEquipment || []

    const updatedEquipment = [
      ...currentEquipment,
      {
        id: equipment.id,
        name: equipment.name,
        category: equipment.category,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
        dailyRate: equipment.dailyRate || 0,  // Include for cost calculation
        assignedAt: new Date().toISOString()
      }
    ]

    await onUpdate({ assignedEquipment: updatedEquipment })
    setShowAddEquipmentModal(false)
  }

  // Remove equipment from project
  const handleRemoveEquipment = async (equipmentId) => {
    const updatedEquipment = (project.assignedEquipment || []).filter(e => e.id !== equipmentId)
    await onUpdate({ assignedEquipment: updatedEquipment })
  }

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Export equipment overview PDF
  const handleExportOverview = async () => {
    setExporting(true)

    try {
      const pdf = generateEquipmentOverviewPDF(project, assignedAircraft, assignedEquipment, branding)
      pdf.save(`equipment-overview_${project.projectCode || project.name}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      logger.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Equipment Overview</h2>
          <p className="text-sm text-gray-500">
            {assignedAircraft.length} aircraft, {assignedEquipment.length} equipment items
          </p>
        </div>
        <button
          onClick={handleExportOverview}
          disabled={exporting || (assignedAircraft.length === 0 && assignedEquipment.length === 0)}
          className="btn btn-secondary flex items-center gap-2"
        >
          {exporting ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export PDF
        </button>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading equipment...</p>
        </div>
      ) : (
        <>
          {/* ============================================ */}
          {/* AIRCRAFT SECTION */}
          {/* ============================================ */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Plane className="w-5 h-5 text-aeria-blue" />
                Aircraft ({assignedAircraft.length})
              </h3>
              <button
                onClick={() => setShowAddAircraftModal(true)}
                className="btn btn-primary btn-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Aircraft
              </button>
            </div>

            {assignedAircraft.length === 0 ? (
              <div className="card text-center py-8 bg-gray-50">
                <Plane className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-3">No aircraft assigned</p>
                <button
                  onClick={() => setShowAddAircraftModal(true)}
                  className="btn btn-primary btn-sm inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Aircraft
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {assignedAircraft.map(ac => {
                  const status = aircraftStatusConfig[ac.status] || aircraftStatusConfig.airworthy
                  const StatusIcon = status.icon
                  const flightPlanEntry = project.flightPlan?.aircraft?.find(a => a.id === ac.id)

                  return (
                    <div key={ac.id} className="card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-aeria-sky rounded-lg flex items-center justify-center">
                            <Plane className="w-5 h-5 text-aeria-navy" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{ac.nickname}</h4>
                              {flightPlanEntry?.isPrimary && (
                                <span className="px-1.5 py-0.5 text-xs bg-aeria-navy text-white rounded">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{ac.make} {ac.model}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                        {ac.mtow && (
                          <div className="p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">MTOW</p>
                            <p className="text-sm font-semibold">{ac.mtow} kg</p>
                          </div>
                        )}
                        {ac.maxSpeed && (
                          <div className="p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Speed</p>
                            <p className="text-sm font-semibold">{ac.maxSpeed} m/s</p>
                          </div>
                        )}
                        {ac.endurance && (
                          <div className="p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Endurance</p>
                            <p className="text-sm font-semibold">{ac.endurance} min</p>
                          </div>
                        )}
                      </div>

                      {/* Rates */}
                      {(ac.hourlyRate > 0 || ac.dailyRate > 0) && (
                        <div className="flex items-center gap-3 mb-3 text-sm">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <div className="flex gap-3 text-green-600 font-medium">
                            {ac.hourlyRate > 0 && (
                              <span>${ac.hourlyRate}/hr</span>
                            )}
                            {ac.dailyRate > 0 && (
                              <span>${ac.dailyRate}/day</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedSpec(ac)}
                            className="text-xs text-aeria-blue hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Specs
                          </button>
                          <button
                            onClick={() => {
                              const pdf = generateAircraftSpecPDF(ac, branding)
                              pdf.save(`spec-sheet_${ac.nickname}_${new Date().toISOString().split('T')[0]}.pdf`)
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          {!flightPlanEntry?.isPrimary && assignedAircraft.length > 1 && (
                            <button
                              onClick={() => handleSetPrimary(ac.id)}
                              className="text-xs text-gray-500 hover:text-aeria-navy"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveAircraft(ac.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* EQUIPMENT SECTION */}
          {/* ============================================ */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-aeria-blue" />
                Equipment ({assignedEquipment.length})
              </h3>
              <button
                onClick={() => setShowAddEquipmentModal(true)}
                className="btn btn-primary btn-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Equipment
              </button>
            </div>

            {assignedEquipment.length === 0 ? (
              <div className="card text-center py-8 bg-gray-50">
                <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-3">No equipment assigned</p>
                <button
                  onClick={() => setShowAddEquipmentModal(true)}
                  className="btn btn-primary btn-sm inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Equipment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(equipmentByCategory).map(([category, items]) => {
                  const CategoryIcon = categoryIcons[category] || Package
                  const categoryLabel = EQUIPMENT_CATEGORIES[category]?.label || category
                  const isExpanded = expandedCategories[category] !== false // Default expanded

                  return (
                    <div key={category} className="card">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-1 -m-1"
                      >
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-5 h-5 text-gray-500" />
                          <span className="font-medium text-gray-900">{categoryLabel}</span>
                          <span className="text-sm text-gray-500">({items.length})</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-4 space-y-2">
                          {items.map(item => {
                            const status = equipmentStatusConfig[item.status] || equipmentStatusConfig.available

                            return (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <CategoryIcon className="w-5 h-5 text-gray-400" />
                                  <div>
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {item.manufacturer} {item.model}
                                      {item.serialNumber && (
                                        <span className="ml-2 font-mono">S/N: {item.serialNumber}</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {item.dailyRate > 0 && (
                                    <span className="text-xs text-green-600 font-medium">
                                      ${item.dailyRate}/day
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                                    {status.label}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveEquipment(item.id)}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* EQUIPMENT SUMMARY TABLE */}
          {/* ============================================ */}
          {(assignedAircraft.length > 0 || assignedEquipment.length > 0) && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-aeria-blue" />
                Equipment Manifest
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Item</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Type</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Make/Model</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Serial #</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedAircraft.map(ac => {
                      const status = aircraftStatusConfig[ac.status] || aircraftStatusConfig.airworthy
                      return (
                        <tr key={`ac-${ac.id}`} className="border-b border-gray-100">
                          <td className="py-2 px-3 font-medium text-gray-900">{ac.nickname}</td>
                          <td className="py-2 px-3 text-gray-600">Aircraft</td>
                          <td className="py-2 px-3 text-gray-600">{ac.make} {ac.model}</td>
                          <td className="py-2 px-3 font-mono text-gray-500 text-xs">{ac.serialNumber || '-'}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {assignedEquipment.map(eq => {
                      const status = equipmentStatusConfig[eq.status] || equipmentStatusConfig.available
                      const categoryLabel = EQUIPMENT_CATEGORIES[eq.category]?.label || eq.category
                      return (
                        <tr key={`eq-${eq.id}`} className="border-b border-gray-100">
                          <td className="py-2 px-3 font-medium text-gray-900">{eq.name}</td>
                          <td className="py-2 px-3 text-gray-600">{categoryLabel}</td>
                          <td className="py-2 px-3 text-gray-600">{eq.manufacturer} {eq.model}</td>
                          <td className="py-2 px-3 font-mono text-gray-500 text-xs">{eq.serialNumber || '-'}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================ */}
      {/* ADD AIRCRAFT MODAL */}
      {/* ============================================ */}
      {showAddAircraftModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowAddAircraftModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add Aircraft</h3>
                <button
                  onClick={() => setShowAddAircraftModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search aircraft..."
                    value={aircraftSearchQuery}
                    onChange={(e) => setAircraftSearchQuery(e.target.value)}
                    className="input pl-9"
                  />
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {availableAircraft.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No available aircraft found</p>
                    </div>
                  ) : (
                    availableAircraft.map(ac => (
                      <button
                        key={ac.id}
                        onClick={() => handleAddAircraft(ac)}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Plane className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{ac.nickname}</p>
                            <p className="text-sm text-gray-500">{ac.make} {ac.model}</p>
                          </div>
                          <div className="text-right">
                            {(ac.hourlyRate > 0 || ac.dailyRate > 0) && (
                              <span className="text-xs text-green-600 font-medium block">
                                {ac.dailyRate > 0 ? `$${ac.dailyRate}/day` : `$${ac.hourlyRate}/hr`}
                              </span>
                            )}
                            {ac.mtow && (
                              <span className="text-xs text-gray-400">{ac.mtow} kg</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* ADD EQUIPMENT MODAL */}
      {/* ============================================ */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowAddEquipmentModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add Equipment</h3>
                <button
                  onClick={() => setShowAddEquipmentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                {/* Category filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setEquipmentCategoryFilter('all')}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      equipmentCategoryFilter === 'all'
                        ? 'bg-aeria-navy text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(EQUIPMENT_CATEGORIES).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setEquipmentCategoryFilter(key)}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        equipmentCategoryFilter === key
                          ? 'bg-aeria-navy text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search equipment..."
                    value={equipmentSearchQuery}
                    onChange={(e) => setEquipmentSearchQuery(e.target.value)}
                    className="input pl-9"
                  />
                </div>

                {/* Equipment list */}
                <div className="max-h-[350px] overflow-y-auto space-y-2">
                  {availableEquipment.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No available equipment found</p>
                    </div>
                  ) : (
                    availableEquipment.map(eq => {
                      const CategoryIcon = categoryIcons[eq.category] || Package
                      return (
                        <button
                          key={eq.id}
                          onClick={() => handleAddEquipment(eq)}
                          className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-sky/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <CategoryIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{eq.name}</p>
                              <p className="text-sm text-gray-500">
                                {eq.manufacturer} {eq.model}
                              </p>
                            </div>
                            <div className="text-right">
                              {eq.dailyRate > 0 && (
                                <span className="text-xs text-green-600 font-medium block">
                                  ${eq.dailyRate}/day
                                </span>
                              )}
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                {EQUIPMENT_CATEGORIES[eq.category]?.label || eq.category}
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

ProjectEquipment.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string,
    projectCode: PropTypes.string,
    clientName: PropTypes.string,
    flightPlan: PropTypes.object,
    assignedEquipment: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}

// ============================================
// EQUIPMENT OVERVIEW PDF GENERATOR
// ============================================
export function generateEquipmentOverviewPDF(project, aircraftList, equipmentList = [], branding = {}) {
  const pdf = new BrandedPDF({
    title: 'Equipment Overview',
    subtitle: 'Project Aircraft & Equipment',
    projectName: project.name,
    projectCode: project.projectCode,
    clientName: project.clientName,
    branding
  })

  // Cover page
  pdf.addCoverPage()
  pdf.addNewPage()

  // Project Summary
  pdf.addSectionTitle('Project Information')
  pdf.addKeyValueGrid([
    { label: 'Project', value: project.name },
    { label: 'Code', value: project.projectCode },
    { label: 'Client', value: project.clientName },
    { label: 'Total Aircraft', value: aircraftList.length },
    { label: 'Total Equipment', value: equipmentList.length }
  ])

  // Aircraft Summary
  pdf.addSectionTitle('Aircraft')
  if (aircraftList.length > 0) {
    const rows = aircraftList.map(ac => [
      ac.nickname || 'N/A',
      `${ac.make || ''} ${ac.model || ''}`.trim() || 'N/A',
      ac.serialNumber || 'N/A',
      ac.mtow ? `${ac.mtow} kg` : 'N/A',
      ac.maxSpeed ? `${ac.maxSpeed} m/s` : 'N/A',
      aircraftStatusConfig[ac.status]?.label || 'Unknown'
    ])

    pdf.addTable(
      ['Name', 'Make/Model', 'Serial #', 'MTOW', 'Max Speed', 'Status'],
      rows
    )
  } else {
    pdf.addParagraph('No aircraft assigned to this project.')
  }

  // Equipment Summary
  pdf.addSectionTitle('Equipment')
  if (equipmentList.length > 0) {
    const rows = equipmentList.map(eq => [
      eq.name || 'N/A',
      EQUIPMENT_CATEGORIES[eq.category]?.label || eq.category || 'N/A',
      `${eq.manufacturer || ''} ${eq.model || ''}`.trim() || 'N/A',
      eq.serialNumber || 'N/A',
      equipmentStatusConfig[eq.status]?.label || 'Available'
    ])

    pdf.addTable(
      ['Name', 'Category', 'Make/Model', 'Serial #', 'Status'],
      rows
    )
  } else {
    pdf.addParagraph('No equipment assigned to this project.')
  }

  // Individual Aircraft Details
  aircraftList.forEach((ac, i) => {
    pdf.checkPageBreak(80)

    pdf.addSectionTitle(`Aircraft ${i + 1}: ${ac.nickname || 'Unnamed'}`)

    pdf.addSubsectionTitle('Identification')
    pdf.addKeyValueGrid([
      { label: 'Name', value: ac.nickname },
      { label: 'Make', value: ac.make },
      { label: 'Model', value: ac.model },
      { label: 'Serial Number', value: ac.serialNumber },
      { label: 'Registration', value: ac.registration },
      { label: 'Status', value: aircraftStatusConfig[ac.status]?.label }
    ])

    pdf.addSubsectionTitle('Performance')
    pdf.addKeyValueGrid([
      { label: 'MTOW', value: ac.mtow ? `${ac.mtow} kg` : 'N/A' },
      { label: 'Max Speed', value: ac.maxSpeed ? `${ac.maxSpeed} m/s` : 'N/A' },
      { label: 'Endurance', value: ac.endurance ? `${ac.endurance} min` : 'N/A' },
      { label: 'Max Altitude', value: ac.maxAltitude ? `${ac.maxAltitude} m` : 'N/A' }
    ])
  })

  return pdf
}
