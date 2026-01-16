// ============================================
// AIRCRAFT SPEC SHEET COMPONENT
// Detailed view and PDF export for aircraft
// ============================================

import { useState } from 'react'
import {
  Plane,
  X,
  Download,
  Printer,
  Copy,
  Check,
  Weight,
  Gauge,
  Clock,
  Maximize,
  Battery,
  Radio,
  Camera,
  Shield,
  Wrench,
  Calendar,
  Hash,
  Tag,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Settings,
  Cpu,
  Navigation,
  Wind,
  Ruler
} from 'lucide-react'
import { BrandedPDF } from '../../lib/pdfExportService'

// ============================================
// STATUS CONFIGURATION
// ============================================
const statusConfig = {
  airworthy: { 
    label: 'Airworthy', 
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2
  },
  maintenance: { 
    label: 'In Maintenance', 
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Wrench
  },
  grounded: { 
    label: 'Grounded', 
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertTriangle
  },
  retired: { 
    label: 'Retired', 
    color: 'bg-gray-100 text-gray-500 border-gray-200',
    icon: X
  }
}

const categoryLabels = {
  multirotor: 'Multirotor',
  fixed_wing: 'Fixed Wing',
  vtol: 'VTOL',
  helicopter: 'Helicopter',
  other: 'Other'
}

// ============================================
// SPEC FIELD COMPONENT
// ============================================
const SpecField = ({ icon: Icon, label, value, unit, className = '' }) => {
  if (!value && value !== 0) return null
  
  return (
    <div className={`flex items-start gap-3 p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon className="w-4 h-4 text-aeria-navy" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-gray-900">
          {value}{unit && <span className="text-gray-500 font-normal ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

// ============================================
// MAIN SPEC SHEET COMPONENT
// ============================================
export default function AircraftSpecSheet({ aircraft, isOpen, onClose, branding }) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  if (!isOpen || !aircraft) return null

  const status = statusConfig[aircraft.status] || statusConfig.airworthy
  const StatusIcon = status.icon

  // ============================================
  // COPY TO CLIPBOARD
  // ============================================
  const handleCopy = async () => {
    const text = generateTextSpec(aircraft)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ============================================
  // GENERATE TEXT SPEC
  // ============================================
  const generateTextSpec = (ac) => {
    const lines = [
      '═'.repeat(50),
      'AIRCRAFT SPECIFICATION SHEET',
      '═'.repeat(50),
      '',
      `Name: ${ac.nickname || 'N/A'}`,
      `Make: ${ac.make || 'N/A'}`,
      `Model: ${ac.model || 'N/A'}`,
      `Serial Number: ${ac.serialNumber || 'N/A'}`,
      `Registration: ${ac.registration || 'N/A'}`,
      `Category: ${categoryLabels[ac.category] || ac.category || 'N/A'}`,
      `Status: ${statusConfig[ac.status]?.label || 'Unknown'}`,
      '',
      '─'.repeat(30),
      'PERFORMANCE SPECIFICATIONS',
      '─'.repeat(30),
      `MTOW: ${ac.mtow ? ac.mtow + ' kg' : 'N/A'}`,
      `Max Speed: ${ac.maxSpeed ? ac.maxSpeed + ' m/s' : 'N/A'}`,
      `Cruise Speed: ${ac.cruiseSpeed ? ac.cruiseSpeed + ' m/s' : 'N/A'}`,
      `Max Altitude: ${ac.maxAltitude ? ac.maxAltitude + ' m' : 'N/A'}`,
      `Endurance: ${ac.endurance ? ac.endurance + ' min' : 'N/A'}`,
      `Range: ${ac.range ? ac.range + ' km' : 'N/A'}`,
      '',
      '─'.repeat(30),
      'PHYSICAL SPECIFICATIONS',
      '─'.repeat(30),
      `Dimensions: ${ac.dimensions || 'N/A'}`,
      `Wingspan/Diameter: ${ac.wingspan ? ac.wingspan + ' m' : 'N/A'}`,
      `Empty Weight: ${ac.emptyWeight ? ac.emptyWeight + ' kg' : 'N/A'}`,
      `Payload Capacity: ${ac.payloadCapacity ? ac.payloadCapacity + ' kg' : 'N/A'}`,
      '',
      '─'.repeat(30),
      'SYSTEMS',
      '─'.repeat(30),
      `Propulsion: ${ac.propulsion || 'N/A'}`,
      `Battery: ${ac.batteryType || 'N/A'}`,
      `Flight Controller: ${ac.flightController || 'N/A'}`,
      `GPS: ${ac.gps || 'N/A'}`,
      `Datalink: ${ac.datalink || 'N/A'}`,
      '',
      '─'.repeat(30),
      'SENSORS & PAYLOADS',
      '─'.repeat(30),
      `Primary Sensor: ${ac.primarySensor || 'N/A'}`,
      `Secondary Sensor: ${ac.secondarySensor || 'N/A'}`,
      `Other Payloads: ${ac.otherPayloads || 'N/A'}`,
      '',
      '─'.repeat(30),
      'MAINTENANCE',
      '─'.repeat(30),
      `Last Inspection: ${ac.lastInspection || 'N/A'}`,
      `Next Inspection Due: ${ac.nextInspectionDue || 'N/A'}`,
      `Total Flight Hours: ${ac.totalFlightHours ? ac.totalFlightHours + ' hrs' : 'N/A'}`,
      `Total Cycles: ${ac.totalCycles || 'N/A'}`,
      '',
      '═'.repeat(50),
      `Generated: ${new Date().toLocaleString()}`,
      '═'.repeat(50)
    ]
    
    return lines.join('\n')
  }

  // ============================================
  // EXPORT TO PDF
  // ============================================
  const handleExportPDF = async () => {
    setExporting(true)
    
    try {
      const pdf = generateAircraftSpecPDF(aircraft, branding)
      pdf.save(`spec-sheet_${aircraft.nickname || aircraft.serialNumber || 'aircraft'}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
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
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Plane className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{aircraft.nickname || 'Unnamed Aircraft'}</h2>
                  <p className="text-white/80">{aircraft.make} {aircraft.model}</p>
                  {aircraft.serialNumber && (
                    <p className="text-sm text-white/60 font-mono mt-1">S/N: {aircraft.serialNumber}</p>
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
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
              
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
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Performance Specs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-aeria-blue" />
                Performance Specifications
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <SpecField icon={Weight} label="MTOW" value={aircraft.mtow} unit="kg" />
                <SpecField icon={Gauge} label="Max Speed" value={aircraft.maxSpeed} unit="m/s" />
                <SpecField icon={Navigation} label="Cruise Speed" value={aircraft.cruiseSpeed} unit="m/s" />
                <SpecField icon={Maximize} label="Max Altitude" value={aircraft.maxAltitude} unit="m" />
                <SpecField icon={Clock} label="Endurance" value={aircraft.endurance} unit="min" />
                <SpecField icon={Wind} label="Range" value={aircraft.range} unit="km" />
              </div>
            </div>
            
            {/* Physical Specs */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-aeria-blue" />
                Physical Specifications
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <SpecField icon={Maximize} label="Dimensions" value={aircraft.dimensions} />
                <SpecField icon={Ruler} label="Wingspan/Diameter" value={aircraft.wingspan} unit="m" />
                <SpecField icon={Weight} label="Empty Weight" value={aircraft.emptyWeight} unit="kg" />
                <SpecField icon={Weight} label="Payload Capacity" value={aircraft.payloadCapacity} unit="kg" />
                <SpecField icon={Plane} label="Category" value={categoryLabels[aircraft.category]} />
              </div>
            </div>
            
            {/* Systems */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-aeria-blue" />
                Systems
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <SpecField icon={Settings} label="Propulsion" value={aircraft.propulsion} />
                <SpecField icon={Battery} label="Battery" value={aircraft.batteryType} />
                <SpecField icon={Cpu} label="Flight Controller" value={aircraft.flightController} />
                <SpecField icon={Navigation} label="GPS" value={aircraft.gps} />
                <SpecField icon={Radio} label="Datalink" value={aircraft.datalink} />
                <SpecField icon={Radio} label="Frequency" value={aircraft.frequency} unit="GHz" />
              </div>
            </div>
            
            {/* Sensors & Payloads */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-aeria-blue" />
                Sensors & Payloads
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <SpecField icon={Camera} label="Primary Sensor" value={aircraft.primarySensor} />
                <SpecField icon={Camera} label="Secondary Sensor" value={aircraft.secondarySensor} />
                <SpecField icon={Settings} label="Other Payloads" value={aircraft.otherPayloads} />
              </div>
            </div>
            
            {/* Identification */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-aeria-blue" />
                Identification
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <SpecField icon={Hash} label="Serial Number" value={aircraft.serialNumber} />
                <SpecField icon={Tag} label="Registration" value={aircraft.registration} />
                <SpecField icon={Shield} label="Insurance Policy" value={aircraft.insurancePolicy} />
              </div>
            </div>
            
            {/* Maintenance */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-aeria-blue" />
                Maintenance
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <SpecField icon={Calendar} label="Last Inspection" value={aircraft.lastInspection} />
                <SpecField icon={Calendar} label="Next Inspection" value={aircraft.nextInspectionDue} />
                <SpecField icon={Clock} label="Total Flight Hours" value={aircraft.totalFlightHours} unit="hrs" />
                <SpecField icon={Hash} label="Total Cycles" value={aircraft.totalCycles} />
              </div>
            </div>
            
            {/* Notes */}
            {aircraft.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-aeria-blue" />
                  Notes
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{aircraft.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PDF GENERATOR FOR AIRCRAFT SPEC
// ============================================
export function generateAircraftSpecPDF(aircraft, branding = {}) {
  const pdf = new BrandedPDF({
    title: 'Aircraft Specification Sheet',
    subtitle: `${aircraft.make} ${aircraft.model}`,
    projectName: aircraft.nickname || 'Aircraft',
    projectCode: aircraft.serialNumber || '',
    branding
  })
  
  // Cover page
  pdf.addCoverPage()
  pdf.addNewPage()
  
  // Aircraft Header
  pdf.addSectionTitle('Aircraft Information')
  pdf.addKeyValueGrid([
    { label: 'Name', value: aircraft.nickname },
    { label: 'Make', value: aircraft.make },
    { label: 'Model', value: aircraft.model },
    { label: 'Serial Number', value: aircraft.serialNumber },
    { label: 'Registration', value: aircraft.registration },
    { label: 'Category', value: categoryLabels[aircraft.category] },
    { label: 'Status', value: statusConfig[aircraft.status]?.label }
  ])
  
  // Performance
  pdf.addSectionTitle('Performance Specifications')
  pdf.addKeyValueGrid([
    { label: 'MTOW', value: aircraft.mtow ? `${aircraft.mtow} kg` : 'N/A' },
    { label: 'Max Speed', value: aircraft.maxSpeed ? `${aircraft.maxSpeed} m/s` : 'N/A' },
    { label: 'Cruise Speed', value: aircraft.cruiseSpeed ? `${aircraft.cruiseSpeed} m/s` : 'N/A' },
    { label: 'Max Altitude', value: aircraft.maxAltitude ? `${aircraft.maxAltitude} m` : 'N/A' },
    { label: 'Endurance', value: aircraft.endurance ? `${aircraft.endurance} min` : 'N/A' },
    { label: 'Range', value: aircraft.range ? `${aircraft.range} km` : 'N/A' }
  ])
  
  // Physical
  pdf.addSectionTitle('Physical Specifications')
  pdf.addKeyValueGrid([
    { label: 'Dimensions', value: aircraft.dimensions || 'N/A' },
    { label: 'Wingspan/Diameter', value: aircraft.wingspan ? `${aircraft.wingspan} m` : 'N/A' },
    { label: 'Empty Weight', value: aircraft.emptyWeight ? `${aircraft.emptyWeight} kg` : 'N/A' },
    { label: 'Payload Capacity', value: aircraft.payloadCapacity ? `${aircraft.payloadCapacity} kg` : 'N/A' }
  ])
  
  // Systems
  pdf.addSectionTitle('Systems')
  pdf.addKeyValueGrid([
    { label: 'Propulsion', value: aircraft.propulsion || 'N/A' },
    { label: 'Battery', value: aircraft.batteryType || 'N/A' },
    { label: 'Flight Controller', value: aircraft.flightController || 'N/A' },
    { label: 'GPS', value: aircraft.gps || 'N/A' },
    { label: 'Datalink', value: aircraft.datalink || 'N/A' },
    { label: 'Frequency', value: aircraft.frequency ? `${aircraft.frequency} GHz` : 'N/A' }
  ])
  
  // Sensors
  pdf.addSectionTitle('Sensors & Payloads')
  pdf.addKeyValueGrid([
    { label: 'Primary Sensor', value: aircraft.primarySensor || 'N/A' },
    { label: 'Secondary Sensor', value: aircraft.secondarySensor || 'N/A' },
    { label: 'Other Payloads', value: aircraft.otherPayloads || 'N/A' }
  ])
  
  // Maintenance
  pdf.addSectionTitle('Maintenance')
  pdf.addKeyValueGrid([
    { label: 'Last Inspection', value: aircraft.lastInspection || 'N/A' },
    { label: 'Next Inspection', value: aircraft.nextInspectionDue || 'N/A' },
    { label: 'Total Flight Hours', value: aircraft.totalFlightHours ? `${aircraft.totalFlightHours} hrs` : 'N/A' },
    { label: 'Total Cycles', value: aircraft.totalCycles || 'N/A' }
  ])
  
  // Notes
  if (aircraft.notes) {
    pdf.addSectionTitle('Notes')
    pdf.addParagraph(aircraft.notes)
  }
  
  return pdf
}
