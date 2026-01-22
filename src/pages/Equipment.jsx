// ============================================
// EQUIPMENT PAGE
// Equipment library management with category filtering
// ============================================

import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2,
  Wrench,
  Archive,
  Clock,
  Eye,
  Download,
  Upload,
  Package,
  Radio,
  Camera,
  Truck,
  Zap,
  Target,
  Shield,
  MapPin,
  Briefcase,
  AlertTriangle,
  Calendar,
  Grid,
  List,
  FileSpreadsheet,
  FileText,
  ChevronDown
} from 'lucide-react'
import * as XLSX from 'xlsx'
import {
  getEquipment,
  deleteEquipment,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_STATUS
} from '../lib/firestore'
import EquipmentModal from '../components/EquipmentModal'
import EquipmentSpecSheet, { generateEquipmentSpecPDF } from '../components/EquipmentSpecSheet'
import EquipmentImport from '../components/EquipmentImport'
import { useBranding } from '../components/BrandingSettings'
import { BrandedPDF } from '../lib/pdfExportService'
import { logger } from '../lib/logger'

// ============================================
// CATEGORY ICONS
// ============================================
const categoryIcons = {
  positioning: MapPin,
  ground_control: Target,
  payloads: Camera,
  safety: Shield,
  vehicles: Truck,
  power: Zap,
  communication: Radio,
  support: Briefcase
}

// ============================================
// STATUS CONFIGURATION
// ============================================
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

// ============================================
// MAIN COMPONENT
// ============================================
export default function Equipment() {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [showModal, setShowModal] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [selectedSpec, setSelectedSpec] = useState(null)
  const [showImport, setShowImport] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [exporting, setExporting] = useState(false)
  const exportMenuRef = useRef(null)

  const { branding } = useBranding()

  useEffect(() => {
    loadEquipment()
  }, [])

  const loadEquipment = async () => {
    setLoading(true)
    try {
      const data = await getEquipment()
      setEquipment(data)
    } catch (err) {
      logger.error('Error loading equipment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (equipmentId, equipmentName) => {
    if (!confirm(`Are you sure you want to delete ${equipmentName}? This cannot be undone.`)) {
      return
    }

    try {
      await deleteEquipment(equipmentId)
      setEquipment(prev => prev.filter(e => e.id !== equipmentId))
    } catch (err) {
      logger.error('Error deleting equipment:', err)
      alert('Failed to delete equipment')
    }
    setMenuOpen(null)
  }

  const handleEdit = (item) => {
    setEditingEquipment(item)
    setShowModal(true)
    setMenuOpen(null)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingEquipment(null)
    loadEquipment()
  }

  // Filter equipment
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Equipment stats
  const stats = {
    total: equipment.length,
    available: equipment.filter(e => e.status === 'available').length,
    assigned: equipment.filter(e => e.status === 'assigned').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length
  }

  // Category counts
  const categoryCounts = Object.keys(EQUIPMENT_CATEGORIES).reduce((acc, cat) => {
    acc[cat] = equipment.filter(e => e.category === cat).length
    return acc
  }, {})

  // Check if maintenance is due soon (within 30 days)
  const isMaintenanceDueSoon = (item) => {
    if (!item.nextServiceDate) return false
    const nextService = new Date(item.nextServiceDate)
    const now = new Date()
    const daysUntil = Math.ceil((nextService - now) / (1000 * 60 * 60 * 24))
    return daysUntil <= 30 && daysUntil >= 0
  }

  const isMaintenanceOverdue = (item) => {
    if (!item.nextServiceDate) return false
    const nextService = new Date(item.nextServiceDate)
    return nextService < new Date()
  }

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  // Export to Excel
  const handleExportExcel = () => {
    setExporting(true)
    setShowExportMenu(false)

    try {
      const exportData = filteredEquipment.map(item => ({
        'Name': item.name || '',
        'Category': EQUIPMENT_CATEGORIES[item.category]?.label || item.category,
        'Manufacturer': item.manufacturer || '',
        'Model': item.model || '',
        'Serial Number': item.serialNumber || '',
        'Status': statusConfig[item.status]?.label || item.status,
        'Condition': item.condition || '',
        'Purchase Date': item.purchaseDate || '',
        'Purchase Price': item.purchasePrice ? `$${item.purchasePrice}` : '',
        'Maintenance Interval (days)': item.maintenanceInterval || '',
        'Last Service': item.lastServiceDate || '',
        'Next Service': item.nextServiceDate || '',
        'Notes': item.notes || ''
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Equipment')

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, ...exportData.map(row => String(row[key] || '').length))
      }))
      ws['!cols'] = colWidths

      const filename = `equipment_inventory_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(wb, filename)
    } catch (err) {
      logger.error('Export to Excel failed:', err)
      alert('Failed to export to Excel')
    } finally {
      setExporting(false)
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    setExporting(true)
    setShowExportMenu(false)

    try {
      const exportData = filteredEquipment.map(item => ({
        'Name': item.name || '',
        'Category': EQUIPMENT_CATEGORIES[item.category]?.label || item.category,
        'Manufacturer': item.manufacturer || '',
        'Model': item.model || '',
        'Serial Number': item.serialNumber || '',
        'Status': statusConfig[item.status]?.label || item.status,
        'Condition': item.condition || '',
        'Purchase Date': item.purchaseDate || '',
        'Purchase Price': item.purchasePrice || '',
        'Maintenance Interval (days)': item.maintenanceInterval || '',
        'Last Service': item.lastServiceDate || '',
        'Next Service': item.nextServiceDate || '',
        'Notes': item.notes || ''
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const csv = XLSX.utils.sheet_to_csv(ws)

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `equipment_inventory_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (err) {
      logger.error('Export to CSV failed:', err)
      alert('Failed to export to CSV')
    } finally {
      setExporting(false)
    }
  }

  // Export to PDF Report
  const handleExportPDF = async () => {
    setExporting(true)
    setShowExportMenu(false)

    try {
      const pdf = new BrandedPDF({
        title: 'Equipment Inventory Report',
        subtitle: `${filteredEquipment.length} Items`,
        projectName: 'Equipment Library',
        projectCode: categoryFilter !== 'all' ? EQUIPMENT_CATEGORIES[categoryFilter]?.label : 'All Categories',
        branding
      })

      await pdf.init()
      pdf.addCoverPage()
      pdf.addNewPage()

      // Summary section
      pdf.addSectionTitle('Inventory Summary')
      pdf.addKPIRow([
        { label: 'Total Items', value: stats.total },
        { label: 'Available', value: stats.available },
        { label: 'Assigned', value: stats.assigned },
        { label: 'In Maintenance', value: stats.maintenance }
      ])

      // Maintenance alerts
      const overdueItems = filteredEquipment.filter(isMaintenanceOverdue)
      const dueSoonItems = filteredEquipment.filter(item => isMaintenanceDueSoon(item) && !isMaintenanceOverdue(item))

      if (overdueItems.length > 0 || dueSoonItems.length > 0) {
        pdf.addSpacer(5)
        if (overdueItems.length > 0) {
          pdf.addInfoBox('Maintenance Overdue', `${overdueItems.length} item(s) have overdue maintenance`, 'danger')
        }
        if (dueSoonItems.length > 0) {
          pdf.addInfoBox('Maintenance Due Soon', `${dueSoonItems.length} item(s) due for maintenance within 30 days`, 'warning')
        }
      }

      // Category breakdown
      pdf.addSectionTitle('Category Breakdown')
      const categoryRows = Object.entries(EQUIPMENT_CATEGORIES).map(([key, cat]) => [
        cat.label,
        String(categoryCounts[key] || 0),
        `${stats.total > 0 ? Math.round((categoryCounts[key] || 0) / stats.total * 100) : 0}%`
      ])
      pdf.addTable(['Category', 'Count', 'Percentage'], categoryRows)

      // Equipment list by category
      const groupedEquipment = {}
      filteredEquipment.forEach(item => {
        const cat = item.category || 'support'
        if (!groupedEquipment[cat]) groupedEquipment[cat] = []
        groupedEquipment[cat].push(item)
      })

      Object.entries(groupedEquipment).forEach(([category, items]) => {
        pdf.addNewPage()
        pdf.addSectionTitle(EQUIPMENT_CATEGORIES[category]?.label || category)

        const rows = items.map(item => [
          item.name || '',
          `${item.manufacturer || ''} ${item.model || ''}`.trim() || '-',
          item.serialNumber || '-',
          statusConfig[item.status]?.label || item.status,
          item.nextServiceDate || '-'
        ])

        pdf.addTable(
          ['Name', 'Manufacturer/Model', 'Serial #', 'Status', 'Next Service'],
          rows
        )
      })

      pdf.save(`equipment_inventory_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      logger.error('Export to PDF failed:', err)
      alert('Failed to export to PDF')
    } finally {
      setExporting(false)
    }
  }

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Library</h1>
          <p className="text-gray-600 mt-1">Manage all operational equipment and inventory</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting || equipment.length === 0}
              className="btn-secondary inline-flex items-center gap-2"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export
              <ChevronDown className="w-3 h-3" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={handleExportExcel}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Export to Excel
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  Export to CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  Export PDF Report
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowImport(true)}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card bg-gray-50">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-green-600">Available</p>
          <p className="text-2xl font-bold text-green-700">{stats.available}</p>
        </div>
        <div className="card bg-blue-50">
          <p className="text-sm text-blue-600">Assigned</p>
          <p className="text-2xl font-bold text-blue-700">{stats.assigned}</p>
        </div>
        <div className="card bg-amber-50">
          <p className="text-sm text-amber-600">In Maintenance</p>
          <p className="text-2xl font-bold text-amber-700">{stats.maintenance}</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            categoryFilter === 'all'
              ? 'bg-aeria-navy text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({equipment.length})
        </button>
        {Object.entries(EQUIPMENT_CATEGORIES).map(([key, cat]) => {
          const Icon = categoryIcons[key]
          return (
            <button
              key={key}
              onClick={() => setCategoryFilter(key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors inline-flex items-center gap-1.5 ${
                categoryFilter === key
                  ? 'bg-aeria-navy text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label} ({categoryCounts[key] || 0})
            </button>
          )
        })}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <label htmlFor="equipment-search" className="sr-only">Search equipment</label>
          <input
            id="equipment-search"
            type="search"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <label htmlFor="equipment-status-filter" className="sr-only">Filter by status</label>
        <select
          id="equipment-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-full sm:w-44"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="maintenance">In Maintenance</option>
          <option value="retired">Retired</option>
        </select>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            aria-label="Grid view"
          >
            <Grid className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            aria-label="List view"
          >
            <List className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Equipment Display */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading equipment...</p>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          {equipment.length === 0 ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No equipment yet</h3>
              <p className="text-gray-500 mb-4">
                Add equipment to your inventory to track and assign to projects.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Equipment
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No matching equipment</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEquipment.map((item) => {
            const status = statusConfig[item.status] || statusConfig.available
            const StatusIcon = status.icon
            const CategoryIcon = categoryIcons[item.category] || Package
            const maintenanceOverdue = isMaintenanceOverdue(item)
            const maintenanceSoon = isMaintenanceDueSoon(item)

            return (
              <div key={item.id} className="card hover:shadow-md transition-shadow">
                {/* Image Header */}
                {item.imageUrl && (
                  <div className="mb-3 -mx-4 -mt-4 overflow-hidden rounded-t-xl">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      maintenanceOverdue ? 'bg-red-100' : 'bg-aeria-sky'
                    }`}>
                      <CategoryIcon className={`w-5 h-5 ${
                        maintenanceOverdue ? 'text-red-600' : 'text-aeria-navy'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.manufacturer} {item.model}
                      </p>
                    </div>
                  </div>

                  {/* More menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuOpen === item.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => {
                              setSelectedSpec(item)
                              setMenuOpen(null)
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Specs
                          </button>
                          <button
                            onClick={() => {
                              const pdf = generateEquipmentSpecPDF(item, branding)
                              pdf.save(`spec-sheet_${item.name}_${new Date().toISOString().split('T')[0]}.pdf`)
                              setMenuOpen(null)
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Category & Status badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                    <CategoryIcon className="w-3 h-3" />
                    {EQUIPMENT_CATEGORIES[item.category]?.label || item.category}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                </div>

                {/* Maintenance warning */}
                {(maintenanceOverdue || maintenanceSoon) && (
                  <div className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
                    maintenanceOverdue ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {maintenanceOverdue ? 'Maintenance overdue' : 'Maintenance due soon'}
                    </span>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-1.5 text-sm">
                  {item.serialNumber && (
                    <p className="text-gray-500 font-mono text-xs">
                      S/N: {item.serialNumber}
                    </p>
                  )}
                  {item.nextServiceDate && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Service: {new Date(item.nextServiceDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {item.condition && (
                    <p className="text-gray-500 text-xs truncate">
                      {item.condition}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Manufacturer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Serial #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Next Service</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map((item) => {
                  const status = statusConfig[item.status] || statusConfig.available
                  const CategoryIcon = categoryIcons[item.category] || Package
                  const maintenanceOverdue = isMaintenanceOverdue(item)

                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <CategoryIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {EQUIPMENT_CATEGORIES[item.category]?.label || item.category}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{item.manufacturer || '-'}</td>
                      <td className="py-3 px-4 font-mono text-gray-600 text-xs">
                        {item.serialNumber || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.nextServiceDate ? (
                          <span className={maintenanceOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {new Date(item.nextServiceDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={showModal}
        onClose={handleModalClose}
        equipment={editingEquipment}
      />

      {/* Equipment Spec Sheet Modal */}
      <EquipmentSpecSheet
        equipment={selectedSpec}
        isOpen={!!selectedSpec}
        onClose={() => setSelectedSpec(null)}
        branding={branding}
      />

      {/* Equipment Import Modal */}
      <EquipmentImport
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImportComplete={loadEquipment}
      />
    </div>
  )
}
