// ============================================
// EQUIPMENT SPEC SHEET COMPONENT
// Detailed view and PDF export for equipment
// ============================================

import { useState } from 'react'
import PropTypes from 'prop-types'
import {
  Package,
  X,
  Download,
  Copy,
  Check,
  Calendar,
  Hash,
  Tag,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Wrench,
  DollarSign,
  MapPin,
  Target,
  Camera,
  Shield,
  Truck,
  Zap,
  Radio,
  Briefcase,
  Archive,
  Info,
  Building2
} from 'lucide-react'
import { BrandedPDF } from '../lib/pdfExportService'
import { EQUIPMENT_CATEGORIES } from '../lib/firestore'
import { logger } from '../lib/logger'

// ============================================
// STATUS CONFIGURATION
// ============================================
const statusConfig = {
  available: {
    label: 'Available',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2
  },
  assigned: {
    label: 'Assigned',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Package
  },
  maintenance: {
    label: 'In Maintenance',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Wrench
  },
  retired: {
    label: 'Retired',
    color: 'bg-gray-100 text-gray-500 border-gray-200',
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
  support: Briefcase
}

// ============================================
// SPEC FIELD COMPONENT
// ============================================
const SpecField = ({ icon: Icon, label, value, unit, className = '' }) => {
  if (!value && value !== 0 && value !== false) return null

  // Handle boolean values
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value

  return (
    <div className={`flex items-start gap-3 p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon className="w-4 h-4 text-aeria-navy" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-gray-900">
          {displayValue}{unit && <span className="text-gray-500 font-normal ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

// ============================================
// MAIN SPEC SHEET COMPONENT
// ============================================
export default function EquipmentSpecSheet({ equipment, isOpen, onClose, branding }) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  if (!isOpen || !equipment) return null

  const status = statusConfig[equipment.status] || statusConfig.available
  const StatusIcon = status.icon
  const CategoryIcon = categoryIcons[equipment.category] || Package
  const categoryLabel = EQUIPMENT_CATEGORIES[equipment.category]?.label || equipment.category

  // Check if maintenance is overdue
  const isMaintenanceOverdue = equipment.nextServiceDate && new Date(equipment.nextServiceDate) < new Date()

  // ============================================
  // COPY TO CLIPBOARD
  // ============================================
  const handleCopy = async () => {
    const text = generateTextSpec(equipment)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ============================================
  // GENERATE TEXT SPEC
  // ============================================
  const generateTextSpec = (eq) => {
    const lines = [
      '═'.repeat(50),
      'EQUIPMENT SPECIFICATION SHEET',
      '═'.repeat(50),
      '',
      `Name: ${eq.name || 'N/A'}`,
      `Category: ${categoryLabel}`,
      `Manufacturer: ${eq.manufacturer || 'N/A'}`,
      `Model: ${eq.model || 'N/A'}`,
      `Serial Number: ${eq.serialNumber || 'N/A'}`,
      `Status: ${statusConfig[eq.status]?.label || 'Unknown'}`,
      `Condition: ${eq.condition || 'N/A'}`,
      '',
      '─'.repeat(30),
      'PURCHASE INFORMATION',
      '─'.repeat(30),
      `Purchase Date: ${eq.purchaseDate || 'N/A'}`,
      `Purchase Price: ${eq.purchasePrice ? '$' + eq.purchasePrice.toLocaleString() : 'N/A'}`,
      '',
      '─'.repeat(30),
      'MAINTENANCE',
      '─'.repeat(30),
      `Service Interval: ${eq.maintenanceInterval ? eq.maintenanceInterval + ' days' : 'N/A'}`,
      `Last Service: ${eq.lastServiceDate || 'N/A'}`,
      `Next Service: ${eq.nextServiceDate || 'N/A'}`,
      ''
    ]

    // Add category-specific fields
    if (eq.customFields && Object.keys(eq.customFields).length > 0) {
      lines.push('─'.repeat(30))
      lines.push(`${categoryLabel.toUpperCase()} DETAILS`)
      lines.push('─'.repeat(30))
      Object.entries(eq.customFields).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
          lines.push(`${label}: ${typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}`)
        }
      })
      lines.push('')
    }

    if (eq.notes) {
      lines.push('─'.repeat(30))
      lines.push('NOTES')
      lines.push('─'.repeat(30))
      lines.push(eq.notes)
      lines.push('')
    }

    lines.push('═'.repeat(50))
    lines.push(`Generated: ${new Date().toLocaleString()}`)
    lines.push('═'.repeat(50))

    return lines.join('\n')
  }

  // ============================================
  // EXPORT TO PDF
  // ============================================
  const handleExportPDF = async () => {
    setExporting(true)

    try {
      const pdf = generateEquipmentSpecPDF(equipment, branding)
      pdf.save(`spec-sheet_${equipment.name || equipment.serialNumber || 'equipment'}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      logger.error('PDF export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-aeria-navy to-aeria-blue p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {equipment.imageUrl ? (
                  <img
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center">
                    <CategoryIcon className="w-10 h-10" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-white/70 mb-1">{categoryLabel}</p>
                  <h2 className="text-2xl font-bold">{equipment.name || 'Unnamed Equipment'}</h2>
                  <p className="text-white/80">{equipment.manufacturer} {equipment.model}</p>
                  {equipment.serialNumber && (
                    <p className="text-sm text-white/60 font-mono mt-1">S/N: {equipment.serialNumber}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${status.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </span>
                {isMaintenanceOverdue && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                    <AlertTriangle className="w-4 h-4" />
                    Maintenance Overdue
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white text-aeria-navy hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                >
                  {exporting ? (
                    <div className="w-4 h-4 border-2 border-aeria-navy border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
            {/* Equipment Image */}
            {equipment.imageUrl && (
              <div className="mb-6">
                <img
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  className="w-full max-h-64 object-contain rounded-lg bg-gray-50"
                />
              </div>
            )}

            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-aeria-blue" />
                Basic Information
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <SpecField icon={Tag} label="Name" value={equipment.name} />
                <SpecField icon={CategoryIcon} label="Category" value={categoryLabel} />
                <SpecField icon={Building2} label="Manufacturer" value={equipment.manufacturer} />
                <SpecField icon={Tag} label="Model" value={equipment.model} />
                <SpecField icon={Hash} label="Serial Number" value={equipment.serialNumber} />
                <SpecField icon={CheckCircle2} label="Condition" value={equipment.condition} />
              </div>
            </div>

            {/* Category-Specific Details */}
            {equipment.customFields && Object.keys(equipment.customFields).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CategoryIcon className="w-5 h-5 text-aeria-blue" />
                  {categoryLabel} Details
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(equipment.customFields).map(([key, value]) => {
                    if (value === null || value === undefined || value === '') return null
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                    return (
                      <SpecField
                        key={key}
                        icon={Info}
                        label={label}
                        value={value}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Purchase Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-aeria-blue" />
                Purchase Information
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <SpecField icon={Calendar} label="Purchase Date" value={equipment.purchaseDate} />
                <SpecField
                  icon={DollarSign}
                  label="Purchase Price"
                  value={equipment.purchasePrice ? `$${equipment.purchasePrice.toLocaleString()}` : null}
                />
              </div>
            </div>

            {/* Maintenance */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-aeria-blue" />
                Maintenance Schedule
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <SpecField icon={Calendar} label="Service Interval" value={equipment.maintenanceInterval} unit="days" />
                <SpecField icon={Calendar} label="Last Service" value={equipment.lastServiceDate} />
                <SpecField
                  icon={isMaintenanceOverdue ? AlertTriangle : Calendar}
                  label="Next Service"
                  value={equipment.nextServiceDate}
                  className={isMaintenanceOverdue ? 'bg-red-50' : ''}
                />
              </div>
            </div>

            {/* Notes */}
            {equipment.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-aeria-blue" />
                  Notes
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{equipment.notes}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
              {equipment.createdAt && (
                <p>Created: {new Date(equipment.createdAt.seconds ? equipment.createdAt.seconds * 1000 : equipment.createdAt).toLocaleString()}</p>
              )}
              {equipment.updatedAt && (
                <p>Updated: {new Date(equipment.updatedAt.seconds ? equipment.updatedAt.seconds * 1000 : equipment.updatedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

EquipmentSpecSheet.propTypes = {
  equipment: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  branding: PropTypes.object
}

// ============================================
// PDF GENERATOR FOR EQUIPMENT SPEC
// ============================================
export function generateEquipmentSpecPDF(equipment, branding = {}) {
  const categoryLabel = EQUIPMENT_CATEGORIES[equipment.category]?.label || equipment.category

  const pdf = new BrandedPDF({
    title: 'Equipment Specification Sheet',
    subtitle: `${equipment.manufacturer || ''} ${equipment.model || ''}`.trim() || categoryLabel,
    projectName: equipment.name || 'Equipment',
    projectCode: equipment.serialNumber || '',
    branding
  })

  // Cover page
  pdf.addCoverPage()
  pdf.addNewPage()

  // Equipment Header
  pdf.addSectionTitle('Equipment Information')
  pdf.addKeyValueGrid([
    { label: 'Name', value: equipment.name },
    { label: 'Category', value: categoryLabel },
    { label: 'Manufacturer', value: equipment.manufacturer },
    { label: 'Model', value: equipment.model },
    { label: 'Serial Number', value: equipment.serialNumber },
    { label: 'Status', value: statusConfig[equipment.status]?.label },
    { label: 'Condition', value: equipment.condition }
  ])

  // Category-specific fields
  if (equipment.customFields && Object.keys(equipment.customFields).length > 0) {
    pdf.addSectionTitle(`${categoryLabel} Details`)
    const customFieldsGrid = Object.entries(equipment.customFields)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
      }))

    if (customFieldsGrid.length > 0) {
      pdf.addKeyValueGrid(customFieldsGrid)
    }
  }

  // Purchase Information
  pdf.addSectionTitle('Purchase Information')
  pdf.addKeyValueGrid([
    { label: 'Purchase Date', value: equipment.purchaseDate || 'N/A' },
    { label: 'Purchase Price', value: equipment.purchasePrice ? `$${equipment.purchasePrice.toLocaleString()}` : 'N/A' }
  ])

  // Maintenance
  pdf.addSectionTitle('Maintenance Schedule')
  pdf.addKeyValueGrid([
    { label: 'Service Interval', value: equipment.maintenanceInterval ? `${equipment.maintenanceInterval} days` : 'N/A' },
    { label: 'Last Service', value: equipment.lastServiceDate || 'N/A' },
    { label: 'Next Service', value: equipment.nextServiceDate || 'N/A' }
  ])

  // Notes
  if (equipment.notes) {
    pdf.addSectionTitle('Notes')
    pdf.addParagraph(equipment.notes)
  }

  return pdf
}
