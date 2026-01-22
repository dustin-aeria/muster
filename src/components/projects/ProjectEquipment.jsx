// ============================================
// PROJECT EQUIPMENT COMPONENT
// Equipment overview for projects
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
  Battery,
  Gauge,
  Weight,
  Clock,
  Camera,
  Radio,
  Shield,
  FileText,
  Eye,
  Trash2,
  Search,
  Package
} from 'lucide-react'
import { getAircraft } from '../../lib/firestore'
import AircraftSpecSheet, { generateAircraftSpecPDF } from '../AircraftSpecSheet'
import { useBranding } from '../BrandingSettings'
import { BrandedPDF } from '../../lib/pdfExportService'
import { logger } from '../../lib/logger'

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
  }
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectEquipment({ project, onUpdate }) {
  const [allAircraft, setAllAircraft] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [exporting, setExporting] = useState(false)
  
  const { branding } = useBranding()

  // Get assigned aircraft from flight plan
  const assignedAircraftIds = project.flightPlan?.aircraft?.map(a => a.id) || []
  const assignedAircraft = allAircraft.filter(a => assignedAircraftIds.includes(a.id))

  // Load all aircraft
  useEffect(() => {
    const loadAircraft = async () => {
      try {
        const data = await getAircraft()
        setAllAircraft(data)
      } catch (err) {
        logger.error('Failed to load aircraft:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAircraft()
  }, [])

  // Available aircraft (not already assigned)
  const availableAircraft = allAircraft.filter(a => 
    !assignedAircraftIds.includes(a.id) &&
    a.status === 'airworthy' &&
    (a.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     a.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     a.model?.toLowerCase().includes(searchQuery.toLowerCase()))
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
          registration: aircraft.registration || aircraft.serialNumber,
          make: aircraft.make,
          model: aircraft.model,
          serialNumber: aircraft.serialNumber,
          isPrimary
        }
      ]
    }
    
    await onUpdate({ flightPlan: updatedFlightPlan })
    setShowAddModal(false)
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

  // Export equipment overview PDF
  const handleExportOverview = async () => {
    setExporting(true)
    
    try {
      const pdf = generateEquipmentOverviewPDF(project, assignedAircraft, branding)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Equipment Overview</h2>
          <p className="text-sm text-gray-500">
            {assignedAircraft.length} aircraft assigned to this project
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportOverview}
            disabled={exporting || assignedAircraft.length === 0}
            className="btn btn-secondary flex items-center gap-2"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export PDF
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Aircraft
          </button>
        </div>
      </div>

      {/* Assigned Aircraft */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading equipment...</p>
        </div>
      ) : assignedAircraft.length === 0 ? (
        <div className="card text-center py-12">
          <Plane className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No aircraft assigned</h3>
          <p className="text-gray-500 mb-4">
            Add aircraft to this project for flight operations.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Aircraft
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignedAircraft.map(ac => {
            const status = statusConfig[ac.status] || statusConfig.airworthy
            const StatusIcon = status.icon
            const flightPlanEntry = project.flightPlan?.aircraft?.find(a => a.id === ac.id)
            
            return (
              <div key={ac.id} className="card hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-aeria-sky rounded-xl flex items-center justify-center">
                      <Plane className="w-6 h-6 text-aeria-navy" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{ac.nickname}</h3>
                        {flightPlanEntry?.isPrimary && (
                          <span className="px-2 py-0.5 text-xs bg-aeria-navy text-white rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{ac.make} {ac.model}</p>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                </div>
                
                {/* Quick Specs */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {ac.mtow && (
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Weight className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">MTOW</p>
                      <p className="text-sm font-semibold">{ac.mtow} kg</p>
                    </div>
                  )}
                  {ac.maxSpeed && (
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Gauge className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Max Speed</p>
                      <p className="text-sm font-semibold">{ac.maxSpeed} m/s</p>
                    </div>
                  )}
                  {ac.endurance && (
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Endurance</p>
                      <p className="text-sm font-semibold">{ac.endurance} min</p>
                    </div>
                  )}
                </div>
                
                {/* Serial Number */}
                <p className="text-xs text-gray-400 font-mono mb-4">
                  S/N: {ac.serialNumber}
                </p>
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSpec(ac)}
                      className="text-sm text-aeria-blue hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View Specs
                    </button>
                    <button
                      onClick={() => {
                        const pdf = generateAircraftSpecPDF(ac, branding)
                        pdf.save(`spec-sheet_${ac.nickname}_${new Date().toISOString().split('T')[0]}.pdf`)
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!flightPlanEntry?.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(ac.id)}
                        className="text-xs text-gray-500 hover:text-aeria-navy"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveAircraft(ac.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
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

      {/* Equipment Summary Table */}
      {assignedAircraft.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-aeria-blue" />
            Equipment Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Aircraft</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Registration</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">MTOW</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Max Speed</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Endurance</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignedAircraft.map(ac => {
                  const status = statusConfig[ac.status] || statusConfig.airworthy
                  return (
                    <tr key={ac.id} className="border-b border-gray-100">
                      <td className="py-2 px-3">
                        <div>
                          <p className="font-medium text-gray-900">{ac.nickname}</p>
                          <p className="text-xs text-gray-500">{ac.make} {ac.model}</p>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-gray-600">
                        {ac.registration || ac.serialNumber}
                      </td>
                      <td className="py-2 px-3">{ac.mtow ? `${ac.mtow} kg` : '-'}</td>
                      <td className="py-2 px-3">{ac.maxSpeed ? `${ac.maxSpeed} m/s` : '-'}</td>
                      <td className="py-2 px-3">{ac.endurance ? `${ac.endurance} min` : '-'}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${status.color}`}>
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

      {/* Add Aircraft Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add Aircraft</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                  <label htmlFor="equipment-aircraft-search" className="sr-only">Search aircraft</label>
                  <input
                    id="equipment-aircraft-search"
                    type="search"
                    placeholder="Search aircraft..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                          {ac.mtow && (
                            <span className="text-xs text-gray-400">{ac.mtow} kg</span>
                          )}
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
    equipment: PropTypes.shape({
      aircraft: PropTypes.arrayOf(PropTypes.string)
    })
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}

// ============================================
// EQUIPMENT OVERVIEW PDF GENERATOR
// ============================================
export function generateEquipmentOverviewPDF(project, aircraftList, branding = {}) {
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
    { label: 'Total Aircraft', value: aircraftList.length }
  ])
  
  // Equipment Summary Table
  pdf.addSectionTitle('Equipment Summary')
  if (aircraftList.length > 0) {
    const rows = aircraftList.map(ac => [
      ac.nickname || 'N/A',
      `${ac.make || ''} ${ac.model || ''}`.trim() || 'N/A',
      ac.serialNumber || 'N/A',
      ac.mtow ? `${ac.mtow} kg` : 'N/A',
      ac.maxSpeed ? `${ac.maxSpeed} m/s` : 'N/A',
      statusConfig[ac.status]?.label || 'Unknown'
    ])
    
    pdf.addTable(
      ['Name', 'Make/Model', 'Serial #', 'MTOW', 'Max Speed', 'Status'],
      rows
    )
  } else {
    pdf.addParagraph('No aircraft assigned to this project.')
  }
  
  // Individual Aircraft Details
  aircraftList.forEach((ac, i) => {
    if (i > 0 || aircraftList.length > 0) {
      pdf.checkPageBreak(80)
    }
    
    pdf.addSectionTitle(`Aircraft ${i + 1}: ${ac.nickname || 'Unnamed'}`)
    
    pdf.addSubsectionTitle('Identification')
    pdf.addKeyValueGrid([
      { label: 'Name', value: ac.nickname },
      { label: 'Make', value: ac.make },
      { label: 'Model', value: ac.model },
      { label: 'Serial Number', value: ac.serialNumber },
      { label: 'Registration', value: ac.registration },
      { label: 'Status', value: statusConfig[ac.status]?.label }
    ])
    
    pdf.addSubsectionTitle('Performance')
    pdf.addKeyValueGrid([
      { label: 'MTOW', value: ac.mtow ? `${ac.mtow} kg` : 'N/A' },
      { label: 'Max Speed', value: ac.maxSpeed ? `${ac.maxSpeed} m/s` : 'N/A' },
      { label: 'Endurance', value: ac.endurance ? `${ac.endurance} min` : 'N/A' },
      { label: 'Max Altitude', value: ac.maxAltitude ? `${ac.maxAltitude} m` : 'N/A' }
    ])
    
    if (ac.primarySensor || ac.secondarySensor) {
      pdf.addSubsectionTitle('Sensors')
      pdf.addKeyValueGrid([
        { label: 'Primary', value: ac.primarySensor || 'N/A' },
        { label: 'Secondary', value: ac.secondarySensor || 'N/A' }
      ])
    }
  })
  
  return pdf
}
