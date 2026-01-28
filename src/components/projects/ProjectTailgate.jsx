import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  FileText,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Users,
  MapPin,
  Plane,
  Radio,
  Shield,
  Clock,
  Phone,
  Wind,
  ChevronDown,
  ChevronUp,
  Printer,
  CheckCircle2,
  AlertOctagon,
  Thermometer,
  Eye,
  UserCheck,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  ClipboardCheck,
  Download,
  HardHat,
  Loader2,
  Zap,
  Calendar,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { BrandedPDF } from '../../lib/pdfExportService'
import { logger } from '../../lib/logger'
import { sendTeamNotification } from '../../lib/teamNotificationService'
import WeatherWidget from '../weather/WeatherWidget'

// Default sections to include in tailgate briefing
const DEFAULT_INCLUDED_SECTIONS = {
  projectOverview: true,
  crew: true,
  aircraft: true,
  flightPlan: true,
  hazards: true,
  ppe: true,
  emergency: true,
  musterPoint: true,
  evacRoutes: true,
  communications: true,
  weather: true,
  siteInfo: true
}

// Default tailgate data structure
const createDefaultTailgateDay = (date) => ({
  date: date || new Date().toISOString().split('T')[0],
  generatedAt: null,
  customNotes: '',
  weatherBriefing: '',
  weatherData: {
    temperature: '',
    windSpeed: '',
    windDirection: '',
    visibility: '',
    conditions: '',
    ceiling: ''
  },
  checklistCompleted: {
    siteSecured: false,
    equipmentChecked: false,
    crewBriefed: false,
    commsVerified: false,
    emergencyReviewed: false,
    notamsChecked: false,
    weatherConfirmed: false,
    riskReviewed: false,
    clientNotified: false,
    ppeConfirmed: false
  },
  crewAttendance: {},
  briefingStartTime: '',
  briefingEndTime: '',
  goNoGoDecision: null,
  goNoGoNotes: '',
  flightLogs: [],
  includedSections: { ...DEFAULT_INCLUDED_SECTIONS }
})

export default function ProjectTailgate({ project, onUpdate }) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [expandedSections, setExpandedSections] = useState({
    briefing: true,
    checklist: true,
    attendance: true,
    weather: true
  })

  // Site selection for multi-site projects
  const sites = project.sites || []
  const [activeSiteId, setActiveSiteId] = useState(project.activeSiteId || sites[0]?.id || null)
  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0] || null

  // Initialize tailgate data - support both single day and multi-day
  useEffect(() => {
    if (!project.tailgate) {
      // New structure: array of days
      const startDate = project.startDate || new Date().toISOString().split('T')[0]
      onUpdate({
        tailgate: {
          days: [createDefaultTailgateDay(startDate)],
          isMultiDay: false
        }
      })
    } else if (!project.tailgate.days) {
      // Migrate old single-day structure to new format
      const oldData = project.tailgate
      onUpdate({
        tailgate: {
          days: [{
            date: project.startDate || new Date().toISOString().split('T')[0],
            generatedAt: oldData.generatedAt,
            customNotes: oldData.customNotes || '',
            weatherBriefing: oldData.weatherBriefing || '',
            weatherData: oldData.weatherData || {},
            checklistCompleted: oldData.checklistCompleted || {},
            crewAttendance: oldData.crewAttendance || {},
            briefingStartTime: oldData.briefingStartTime || '',
            briefingEndTime: oldData.briefingEndTime || '',
            goNoGoDecision: oldData.goNoGoDecision,
            goNoGoNotes: oldData.goNoGoNotes || '',
            flightLogs: oldData.flightLogs || []
          }],
          isMultiDay: false
        }
      })
    }
  }, [project.tailgate])

  const tailgate = project.tailgate || { days: [] }
  const days = tailgate.days || []
  const currentDay = days[selectedDayIndex] || createDefaultTailgateDay()
  const isMultiDay = tailgate.isMultiDay || days.length > 1

  // Update functions
  const updateTailgate = (updates) => {
    onUpdate({ tailgate: { ...tailgate, ...updates } })
  }

  const updateCurrentDay = (updates) => {
    const newDays = [...days]
    newDays[selectedDayIndex] = { ...currentDay, ...updates }
    updateTailgate({ days: newDays })
  }

  const updateChecklist = (item, value) => {
    updateCurrentDay({
      checklistCompleted: {
        ...(currentDay.checklistCompleted || {}),
        [item]: value
      }
    })
  }

  const updateCrewAttendance = (crewId, attended) => {
    updateCurrentDay({
      crewAttendance: {
        ...(currentDay.crewAttendance || {}),
        [crewId]: {
          attended,
          timestamp: attended ? new Date().toISOString() : null
        }
      }
    })
  }

  const updateWeatherData = (field, value) => {
    updateCurrentDay({
      weatherData: {
        ...(currentDay.weatherData || {}),
        [field]: value
      }
    })
  }

  const toggleIncludedSection = (section) => {
    const currentIncluded = currentDay.includedSections || DEFAULT_INCLUDED_SECTIONS
    updateCurrentDay({
      includedSections: {
        ...currentIncluded,
        [section]: !currentIncluded[section]
      }
    })
  }

  const includedSections = currentDay.includedSections || DEFAULT_INCLUDED_SECTIONS

  // Handle GO/NO GO decision with notification
  const handleGoNoGoDecision = async (decision) => {
    const previousDecision = currentDay.goNoGoDecision

    // Update the decision
    updateCurrentDay({ goNoGoDecision: decision })

    // Send notification if this is a new decision (not just toggling)
    if (previousDecision !== decision && project.id) {
      try {
        await sendTeamNotification(project.id, 'goNoGo', {
          decision: decision ? 'GO' : 'NO-GO',
          date: currentDay.date || new Date().toISOString(),
          pic: pic?.operatorName || pic?.name || 'Not assigned',
          notes: decision === false ? currentDay.goNoGoNotes : ''
        })
      } catch (error) {
        // Log error but don't block the UI update
        logger.error('Failed to send GO/NO GO notification:', error)
      }
    }
  }

  // Multi-day management
  const addDay = () => {
    const lastDay = days[days.length - 1]
    const lastDate = lastDay?.date ? new Date(lastDay.date) : new Date()
    lastDate.setDate(lastDate.getDate() + 1)
    const newDate = lastDate.toISOString().split('T')[0]
    
    updateTailgate({
      days: [...days, createDefaultTailgateDay(newDate)],
      isMultiDay: true
    })
    setSelectedDayIndex(days.length)
  }

  const removeDay = (index) => {
    if (days.length <= 1) return
    const newDays = days.filter((_, i) => i !== index)
    updateTailgate({ days: newDays, isMultiDay: newDays.length > 1 })
    if (selectedDayIndex >= newDays.length) {
      setSelectedDayIndex(newDays.length - 1)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Generate briefing
  const generateBriefing = () => {
    updateCurrentDay({
      generatedAt: new Date().toISOString(),
      briefingStartTime: new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })
    })
  }

  // Crew and helpers
  const allCrew = project.crew || []
  const pic = allCrew.find(c => c.role === 'PIC')

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set'
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-CA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatShortDate = (dateStr) => {
    if (!dateStr) return 'Day'
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-CA', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Get PPE items
  const getPPEItems = () => {
    const ppe = project.ppe || {}
    const items = []
    
    if (ppe.selectedItems?.length > 0) {
      const commonPPE = {
        'hi_vis_vest': 'High-Visibility Vest',
        'safety_boots': 'Safety Boots (CSA)',
        'hard_hat': 'Hard Hat',
        'safety_glasses': 'Safety Glasses',
        'ear_plugs': 'Hearing Protection',
        'work_gloves': 'Work Gloves',
        'sunscreen': 'Sunscreen',
        'winter_jacket': 'Winter Jacket',
        'rain_gear': 'Rain Gear'
      }
      ppe.selectedItems.forEach(id => {
        if (commonPPE[id]) items.push(commonPPE[id])
        else items.push(id.replace(/_/g, ' '))
      })
    }
    
    if (ppe.customItems?.length > 0) {
      ppe.customItems.forEach(item => items.push(item.item))
    }
    
    if (ppe.items?.length > 0 && items.length === 0) {
      ppe.items.forEach(item => items.push(item.item || item.name || item))
    }
    
    if (items.length === 0) {
      return ['Safety Vest', 'Safety Boots', 'Safety Glasses (as required)']
    }
    
    return items
  }

  // Get hazards
  const getHazards = () => {
    const hazards = project.hseRiskAssessment?.hazards || project.riskAssessment?.hazards || []
    return hazards.slice(0, 6)
  }

  // Copy briefing text
  const copyBriefing = () => {
    const text = generateBriefingText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generateBriefingText = () => {
    const ppeItems = getPPEItems()
    const hazards = getHazards()
    const weather = currentDay.weatherData || {}
    
    const lines = [
      `PRE-DEPLOYMENT BRIEFING - ${project.name || 'Untitled Project'}`,
      `═`.repeat(50),
      `Date: ${formatDate(currentDay.date)}`,
      isMultiDay ? `Day ${selectedDayIndex + 1} of ${days.length}` : '',
      `Project Code: ${project.projectCode || 'N/A'}`,
      `Client: ${project.clientName || 'N/A'}`,
      '',
      '─── CREW ───',
      ...allCrew.map(c => `• ${c.role}: ${c.name}${c.phone ? ` (${c.phone})` : ''}`),
      '',
      '─── WEATHER ───',
      weather.temperature ? `Temperature: ${weather.temperature}` : '',
      weather.windSpeed ? `Wind: ${weather.windSpeed} ${weather.windDirection || ''}` : '',
      weather.visibility ? `Visibility: ${weather.visibility}` : '',
      weather.conditions ? `Conditions: ${weather.conditions}` : '',
      currentDay.weatherBriefing || '',
      '',
      '─── OPERATION OVERVIEW ───',
      `Description: ${project.description || 'No description'}`,
      `Operation Type: ${project.flightPlan?.operationType || 'Standard'}`,
      `Max Altitude: ${project.flightPlan?.maxAltitudeAGL || 'N/A'} m AGL`,
      '',
      '─── KEY HAZARDS & CONTROLS ───',
      ...(hazards.length > 0 
        ? hazards.map(h => `• ${h.description || 'Unnamed'}\n  → ${h.controls || 'None'}`)
        : ['No hazards documented']),
      '',
      '─── PPE REQUIREMENTS ───',
      ...ppeItems.map(item => `• ${item}`),
      '',
      '─── EMERGENCY ───',
      `Contact: ${project.emergencyPlan?.primaryEmergencyContact?.name || 'Not set'} - ${project.emergencyPlan?.primaryEmergencyContact?.phone || 'N/A'}`,
      `Hospital: ${project.emergencyPlan?.nearestHospital || 'Not set'}`,
      `Rally Point: ${project.emergencyPlan?.rallyPoint || 'Not set'}`,
      '',
      currentDay.customNotes ? `─── NOTES ───\n${currentDay.customNotes}` : '',
      '',
      `═`.repeat(50),
      `Generated: ${new Date().toLocaleString()}`,
      `Decision: ${currentDay.goNoGoDecision === true ? 'GO' : currentDay.goNoGoDecision === false ? 'NO-GO' : 'Pending'}`
    ]
    return lines.filter(l => l !== '').join('\n')
  }

  // Export PDF
  const exportToPDF = async () => {
    setExporting(true)
    try {
      const pdf = new BrandedPDF({
        title: `Pre-Deployment Briefing${isMultiDay ? ` - Day ${selectedDayIndex + 1}` : ''}`,
        subtitle: 'Tailgate Safety Meeting',
        projectName: project.name,
        projectCode: project.projectCode,
        clientName: project.clientName
      })
      
      await pdf.init()
      pdf.addCoverPage()
      pdf.addNewPage()
      
      // Operation Details
      pdf.addSectionTitle('Operation Details')
      pdf.addKeyValueGrid([
        { label: 'Project', value: project.name },
        { label: 'Date', value: formatDate(currentDay.date) },
        { label: 'Day', value: isMultiDay ? `${selectedDayIndex + 1} of ${days.length}` : '1' },
        { label: 'Briefing Time', value: currentDay.briefingStartTime || 'Not recorded' }
      ])
      
      // Weather
      const weather = currentDay.weatherData || {}
      if (weather.temperature || weather.windSpeed || currentDay.weatherBriefing) {
        pdf.addSectionTitle('Weather Conditions')
        pdf.addKeyValueGrid([
          { label: 'Temperature', value: weather.temperature || 'N/A' },
          { label: 'Wind', value: weather.windSpeed ? `${weather.windSpeed} ${weather.windDirection || ''}` : 'N/A' },
          { label: 'Visibility', value: weather.visibility || 'N/A' },
          { label: 'Conditions', value: weather.conditions || 'N/A' }
        ])
        if (currentDay.weatherBriefing) {
          pdf.addParagraph(currentDay.weatherBriefing)
        }
      }
      
      // Crew
      if (allCrew.length > 0) {
        pdf.addSectionTitle('Crew Roster')
        const crewRows = allCrew.map(c => [
          c.role || 'N/A',
          c.name || 'N/A',
          c.phone || 'N/A',
          currentDay.crewAttendance?.[c.id || c.name]?.attended ? '✓ Present' : '○ Absent'
        ])
        pdf.addTable(['Role', 'Name', 'Phone', 'Attendance'], crewRows)
      }
      
      // Hazards
      const hazards = getHazards()
      if (hazards.length > 0) {
        pdf.addSectionTitle('Key Hazards & Controls')
        const hazardRows = hazards.map((h, i) => [
          String(i + 1),
          h.description || 'Unnamed',
          h.controls || 'None documented'
        ])
        pdf.addTable(['#', 'Hazard', 'Controls'], hazardRows)
      }
      
      // PPE
      pdf.addSectionTitle('Required PPE')
      pdf.addParagraph(getPPEItems().join(' • '))
      
      // Go/No-Go
      pdf.addSectionTitle('Go/No-Go Decision')
      pdf.addLabelValue('Decision', currentDay.goNoGoDecision === true ? 'GO' : currentDay.goNoGoDecision === false ? 'NO-GO' : 'Pending')
      if (currentDay.goNoGoNotes) {
        pdf.addParagraph(currentDay.goNoGoNotes)
      }
      
      // Signatures
      pdf.addSectionTitle('Acknowledgment')
      pdf.addSignatureBlock([
        { role: 'Pilot in Command', name: pic?.name },
        { role: 'Crew Present', name: `${Object.values(currentDay.crewAttendance || {}).filter(a => a?.attended).length} of ${allCrew.length}` }
      ])
      
      const filename = `Tailgate_${project.projectCode || project.name || 'briefing'}_Day${selectedDayIndex + 1}_${currentDay.date || 'nodate'}.pdf`
      pdf.save(filename)
    } catch (err) {
      logger.error('PDF export failed:', err)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  // Calculate stats
  const checklistItems = currentDay.checklistCompleted || {}
  const completedCount = Object.values(checklistItems).filter(Boolean).length
  const totalChecklistItems = 10

  const crewAttendance = currentDay.crewAttendance || {}
  const attendedCount = Object.values(crewAttendance).filter(a => a?.attended).length
  const allCrewAttended = allCrew.length > 0 && attendedCount === allCrew.length

  const isReadyForOps = completedCount === totalChecklistItems && 
                        allCrewAttended && 
                        currentDay.goNoGoDecision === true

  // Calculate overall operation status
  const operationStats = useMemo(() => {
    let completedDays = 0
    let goDays = 0
    let noGoDays = 0
    
    days.forEach(day => {
      if (day.goNoGoDecision === true) {
        goDays++
        completedDays++
      } else if (day.goNoGoDecision === false) {
        noGoDays++
        completedDays++
      }
    })
    
    return { total: days.length, completed: completedDays, go: goDays, noGo: noGoDays }
  }, [days])

  const hazards = getHazards()
  const ppeItems = getPPEItems()

  return (
    <div className="space-y-6">
      {/* Site Selector for Multi-Site Projects */}
      {sites.length > 1 && (
        <div className="card bg-gradient-to-r from-aeria-navy/5 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-aeria-navy" />
              <div>
                <h3 className="font-semibold text-gray-900">Active Site</h3>
                <p className="text-sm text-gray-600">Select the site for this tailgate briefing</p>
              </div>
            </div>
            <select
              value={activeSiteId || ''}
              onChange={(e) => setActiveSiteId(e.target.value)}
              className="input w-auto min-w-[200px]"
            >
              {sites.map(site => (
                <option key={site.id} value={site.id}>
                  {site.name || `Site ${sites.indexOf(site) + 1}`}
                </option>
              ))}
            </select>
          </div>
          {activeSite && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-sm text-gray-600">
              {activeSite.mapData?.siteSurvey?.siteLocation && (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  Location set
                </span>
              )}
              {activeSite.mapData?.siteSurvey?.operationsBoundary && (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  Boundary defined
                </span>
              )}
              {activeSite.siteSurvey?.weatherPlanning?.assumedConditions && (
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  Weather planned
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Single Site Info Banner */}
      {sites.length === 1 && activeSite && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">{activeSite.name || 'Site 1'}</span>
          {activeSite.mapData?.siteSurvey?.siteLocation && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Location set
            </span>
          )}
        </div>
      )}

      {/* Multi-Day Header */}
      {isMultiDay && (
        <div className="card bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Multi-Day Operation
              </h3>
              <p className="text-sm text-gray-600">
                {operationStats.go} GO / {operationStats.noGo} NO-GO / {operationStats.total - operationStats.completed} Pending
              </p>
            </div>
            <button onClick={addDay} className="btn-secondary text-sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Day
            </button>
          </div>
          
          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day, index) => {
              const dayChecklist = day.checklistCompleted || {}
              const dayComplete = Object.values(dayChecklist).filter(Boolean).length
              const isGo = day.goNoGoDecision === true
              const isNoGo = day.goNoGoDecision === false
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all ${
                    index === selectedDayIndex
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <p className={`text-xs font-medium ${index === selectedDayIndex ? 'text-blue-700' : 'text-gray-600'}`}>
                      Day {index + 1}
                    </p>
                    <p className={`text-sm ${index === selectedDayIndex ? 'text-blue-900' : 'text-gray-900'}`}>
                      {formatShortDate(day.date)}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {isGo && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {isNoGo && <XCircle className="w-4 h-4 text-red-500" />}
                      {!isGo && !isNoGo && (
                        <span className="text-xs text-gray-400">{dayComplete}/10</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isMultiDay ? `Day ${selectedDayIndex + 1}: ` : ''}Pre-Deployment Briefing
          </h2>
          <p className="text-sm text-gray-500">
            {formatDate(currentDay.date)}
            {currentDay.generatedAt && ` • Generated ${new Date(currentDay.generatedAt).toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={generateBriefing} className="btn-secondary inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            {currentDay.generatedAt ? 'Refresh' : 'Generate'}
          </button>
          <button onClick={copyBriefing} className="btn-secondary inline-flex items-center gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={exportToPDF} disabled={exporting} className="btn-primary inline-flex items-center gap-2">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? 'Exporting...' : 'PDF'}
          </button>
          {isMultiDay && days.length > 1 && (
            <button 
              onClick={() => removeDay(selectedDayIndex)}
              className="btn-secondary text-red-600 hover:bg-red-50"
              title="Remove this day"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Readiness Status */}
      <div className={`p-4 rounded-lg border-2 ${
        isReadyForOps ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          {isReadyForOps ? (
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          )}
          <div>
            <h3 className={`font-semibold ${isReadyForOps ? 'text-green-800' : 'text-amber-800'}`}>
              {isReadyForOps ? 'Ready for Operations' : 'Pre-Flight Items Pending'}
            </h3>
            <p className={`text-sm ${isReadyForOps ? 'text-green-600' : 'text-amber-600'}`}>
              Checklist: {completedCount}/{totalChecklistItems} •
              Crew: {attendedCount}/{allCrew.length} •
              Decision: {currentDay.goNoGoDecision === true ? 'GO' : currentDay.goNoGoDecision === false ? 'NO-GO' : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Briefing Content Configuration */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-aeria-blue" />
          Briefing Content
          <span className="text-xs font-normal text-gray-500">Select items to include</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {[
            { key: 'projectOverview', label: 'Project Overview', icon: FileText },
            { key: 'crew', label: 'Crew & Roles', icon: Users },
            { key: 'aircraft', label: 'Aircraft/Equipment', icon: Plane },
            { key: 'flightPlan', label: 'Flight Plan', icon: MapPin },
            { key: 'hazards', label: 'Hazards & Controls', icon: AlertTriangle },
            { key: 'ppe', label: 'PPE Requirements', icon: HardHat },
            { key: 'emergency', label: 'Emergency Contacts', icon: Phone },
            { key: 'musterPoint', label: 'Muster Point', icon: MapPin },
            { key: 'evacRoutes', label: 'Evacuation Routes', icon: AlertOctagon },
            { key: 'communications', label: 'Communications', icon: Radio },
            { key: 'weather', label: 'Weather Data', icon: Wind },
            { key: 'siteInfo', label: 'Site Details', icon: MapPin }
          ].map(item => {
            const Icon = item.icon
            const isIncluded = includedSections[item.key]
            return (
              <label
                key={item.key}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                  isIncluded
                    ? 'bg-aeria-sky border-aeria-navy/30 text-aeria-navy'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isIncluded}
                  onChange={() => toggleIncludedSection(item.key)}
                  className="w-4 h-4 rounded border-gray-300 text-aeria-navy"
                />
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Date Picker (for current day) */}
      <div className="card">
        <label className="label">Operation Date</label>
        <input
          type="date"
          value={currentDay.date || ''}
          onChange={(e) => updateCurrentDay({ date: e.target.value })}
          className="input max-w-xs"
        />
        {!isMultiDay && (
          <button 
            onClick={() => updateTailgate({ isMultiDay: true })}
            className="ml-4 text-sm text-blue-600 hover:text-blue-800"
          >
            + Enable multi-day operation
          </button>
        )}
      </div>

      {/* Go / No-Go Decision */}
      <div className="card border-2 border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-aeria-blue" />
          Go / No-Go Decision
        </h3>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={() => handleGoNoGoDecision(true)}
            className={`flex-1 min-w-[150px] p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-3 ${
              currentDay.goNoGoDecision === true
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
            }`}
          >
            <ThumbsUp className="w-6 h-6" />
            <span className="text-lg font-semibold">GO</span>
          </button>

          <button
            onClick={() => handleGoNoGoDecision(false)}
            className={`flex-1 min-w-[150px] p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-3 ${
              currentDay.goNoGoDecision === false
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
            }`}
          >
            <ThumbsDown className="w-6 h-6" />
            <span className="text-lg font-semibold">NO-GO</span>
          </button>
        </div>
        
        {currentDay.goNoGoDecision === false && (
          <div>
            <label className="label">Reason for No-Go</label>
            <textarea
              value={currentDay.goNoGoNotes || ''}
              onChange={(e) => updateCurrentDay({ goNoGoNotes: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Document the reason for the No-Go decision..."
            />
          </div>
        )}
      </div>

      {/* Weather Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('weather')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wind className="w-5 h-5 text-blue-500" />
            Weather Conditions
          </h2>
          {expandedSections.weather ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.weather && (
          <div className="mt-4 space-y-4">
            {/* Live Weather Widget */}
            {(() => {
              if (!activeSite) {
                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">No site available</p>
                      <p className="text-sm text-amber-700">
                        Add a site in the <strong>Site Survey</strong> tab first.
                      </p>
                    </div>
                  </div>
                )
              }

              // Get coordinates from mapData siteLocation (GeoJSON format [lng, lat])
              const siteLocation = activeSite.mapData?.siteSurvey?.siteLocation
              const coords = siteLocation?.geometry?.coordinates
              if (coords && coords.length >= 2) {
                return (
                  <WeatherWidget
                    latitude={coords[1]}
                    longitude={coords[0]}
                    siteName={activeSite.name || 'Operation Site'}
                    compact={false}
                  />
                )
              }
              // Fallback: check for legacy string coordinates format
              const legacyCoords = activeSite.coordinates
              if (legacyCoords && typeof legacyCoords === 'string') {
                const [lat, lng] = legacyCoords.split(',').map(c => parseFloat(c?.trim()))
                if (!isNaN(lat) && !isNaN(lng)) {
                  return (
                    <WeatherWidget
                      latitude={lat}
                      longitude={lng}
                      siteName={activeSite.name || 'Operation Site'}
                      compact={false}
                    />
                  )
                }
              }
              // No coordinates available for this site
              return (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Site location not set</p>
                    <p className="text-sm text-amber-700">
                      Set a site location for <strong>{activeSite.name || 'this site'}</strong> in the Site Survey tab to see live weather data.
                    </p>
                  </div>
                </div>
              )
            })()}

            {/* Manual Weather Entry (for overrides or when no site coordinates) */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-3">Manual entry (use if live data unavailable or to record official observations)</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="weather-temperature" className="label flex items-center gap-2">
                  <Thermometer className="w-4 h-4" aria-hidden="true" />
                  Temperature
                </label>
                <input
                  id="weather-temperature"
                  type="text"
                  value={currentDay.weatherData?.temperature || ''}
                  onChange={(e) => updateWeatherData('temperature', e.target.value)}
                  className="input"
                  placeholder="e.g., 15°C"
                />
              </div>
              <div>
                <label htmlFor="weather-wind-speed" className="label flex items-center gap-2">
                  <Wind className="w-4 h-4" aria-hidden="true" />
                  Wind Speed
                </label>
                <input
                  id="weather-wind-speed"
                  type="text"
                  value={currentDay.weatherData?.windSpeed || ''}
                  onChange={(e) => updateWeatherData('windSpeed', e.target.value)}
                  className="input"
                  placeholder="e.g., 10 km/h"
                />
              </div>
              <div>
                <label htmlFor="weather-wind-direction" className="label">Wind Direction</label>
                <input
                  id="weather-wind-direction"
                  type="text"
                  value={currentDay.weatherData?.windDirection || ''}
                  onChange={(e) => updateWeatherData('windDirection', e.target.value)}
                  className="input"
                  placeholder="e.g., NW"
                />
              </div>
              <div>
                <label htmlFor="weather-visibility" className="label flex items-center gap-2">
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  Visibility
                </label>
                <input
                  id="weather-visibility"
                  type="text"
                  value={currentDay.weatherData?.visibility || ''}
                  onChange={(e) => updateWeatherData('visibility', e.target.value)}
                  className="input"
                  placeholder="e.g., >10 SM"
                />
              </div>
              <div>
                <label htmlFor="weather-ceiling" className="label">Ceiling</label>
                <input
                  id="weather-ceiling"
                  type="text"
                  value={currentDay.weatherData?.ceiling || ''}
                  onChange={(e) => updateWeatherData('ceiling', e.target.value)}
                  className="input"
                  placeholder="e.g., CLR or 5000 ft"
                />
              </div>
              <div>
                <label htmlFor="weather-conditions" className="label">Conditions</label>
                <input
                  id="weather-conditions"
                  type="text"
                  value={currentDay.weatherData?.conditions || ''}
                  onChange={(e) => updateWeatherData('conditions', e.target.value)}
                  className="input"
                  placeholder="e.g., Clear, Few clouds"
                />
              </div>
            </div>
            <div>
              <label htmlFor="weather-notes" className="label">Weather Notes / METAR</label>
              <textarea
                id="weather-notes"
                value={currentDay.weatherBriefing || ''}
                onChange={(e) => updateCurrentDay({ weatherBriefing: e.target.value })}
                className="input min-h-[60px]"
                placeholder="METAR, TAF, or other weather notes..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Crew Attendance */}
      <div className="card">
        <button
          onClick={() => toggleSection('attendance')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            Crew Attendance
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              allCrewAttended ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
              {attendedCount}/{allCrew.length}
            </span>
          </h2>
          {expandedSections.attendance ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.attendance && (
          <div className="mt-4 space-y-2">
            {allCrew.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No crew assigned to this project</p>
            ) : (
              allCrew.map((member) => {
                const attendance = crewAttendance[member.id || member.name]
                const hasAttended = attendance?.attended
                
                return (
                  <div 
                    key={member.id || member.name}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      hasAttended ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        hasAttended ? 'bg-green-200' : 'bg-gray-200'
                      }`}>
                        {hasAttended ? (
                          <UserCheck className="w-5 h-5 text-green-700" />
                        ) : (
                          <Users className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateCrewAttendance(member.id || member.name, !hasAttended)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        hasAttended
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hasAttended ? 'Present ✓' : 'Mark Present'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Pre-Flight Checklist */}
      <div className="card">
        <button
          onClick={() => toggleSection('checklist')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-aeria-blue" />
            Pre-Flight Checklist
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              completedCount === totalChecklistItems 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {completedCount}/{totalChecklistItems}
            </span>
          </h2>
          {expandedSections.checklist ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.checklist && (
          <div className="mt-4 space-y-2">
            {[
              { key: 'siteSecured', label: 'Site secured and perimeter established', icon: MapPin },
              { key: 'equipmentChecked', label: 'Aircraft and equipment pre-flight complete', icon: Plane },
              { key: 'crewBriefed', label: 'Crew briefed on operation plan', icon: Users },
              { key: 'commsVerified', label: 'Communications verified', icon: Radio },
              { key: 'emergencyReviewed', label: 'Emergency procedures reviewed', icon: AlertOctagon },
              { key: 'notamsChecked', label: 'NOTAMs and airspace checked', icon: Zap },
              { key: 'weatherConfirmed', label: 'Weather conditions confirmed acceptable', icon: Wind },
              { key: 'riskReviewed', label: 'Risk assessment reviewed with crew', icon: Shield },
              { key: 'clientNotified', label: 'Client/stakeholders notified', icon: Phone },
              { key: 'ppeConfirmed', label: 'All required PPE confirmed', icon: HardHat }
            ].map(item => {
              const Icon = item.icon
              const isChecked = checklistItems[item.key]
              return (
                <label
                  key={item.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isChecked 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked || false}
                    onChange={(e) => updateChecklist(item.key, e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600"
                  />
                  <Icon className={`w-4 h-4 ${isChecked ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`text-sm ${isChecked ? 'text-green-800' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Briefing Content */}
      <div className="card">
        <button
          onClick={() => toggleSection('briefing')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-aeria-blue" />
            Briefing Summary
          </h2>
          {expandedSections.briefing ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.briefing && (
          <div className="mt-4 space-y-4">
            {/* Project Header - Always visible */}
            {includedSections.projectOverview && (
              <div className="p-4 bg-gradient-to-r from-aeria-navy to-aeria-blue text-white rounded-lg">
                <h3 className="text-xl font-bold">{project.name || 'Untitled Project'}</h3>
                <div className="grid sm:grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-white/70">Date</p>
                    <p className="font-semibold">{formatShortDate(currentDay.date)}</p>
                  </div>
                  <div>
                    <p className="text-white/70">Client</p>
                    <p className="font-semibold">{project.clientName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-white/70">Operation</p>
                    <p className="font-semibold">{project.flightPlan?.operationType || 'VLOS'}</p>
                  </div>
                  <div>
                    <p className="text-white/70">Max Alt</p>
                    <p className="font-semibold">{project.flightPlan?.maxAltitudeAGL || 120}m AGL</p>
                  </div>
                </div>
              </div>
            )}

            {/* Crew & Roles */}
            {includedSections.crew && allCrew.length > 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  Crew Assignments
                </h4>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  {allCrew.map((member, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{member.role}:</span>
                      <span className="text-gray-900">{member.name}</span>
                      {member.phone && <span className="text-gray-500">({member.phone})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aircraft/Equipment */}
            {includedSections.aircraft && project.aircraft && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Plane className="w-4 h-4 text-gray-600" />
                  Aircraft/Equipment
                </h4>
                <div className="text-sm">
                  <p><span className="font-medium">Aircraft:</span> {project.aircraft?.nickname || project.aircraft?.model || 'Not specified'}</p>
                  {project.aircraft?.registration && <p><span className="font-medium">Registration:</span> {project.aircraft.registration}</p>}
                </div>
              </div>
            )}

            {/* Flight Plan Details */}
            {includedSections.flightPlan && project.flightPlan && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Flight Plan Summary
                </h4>
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-indigo-800">
                  <div><span className="font-medium">Operation:</span> {project.flightPlan.operationType || 'VLOS'}</div>
                  <div><span className="font-medium">Max Altitude:</span> {project.flightPlan.maxAltitudeAGL || 120}m AGL</div>
                  {project.flightPlan.flightArea && <div><span className="font-medium">Area:</span> {project.flightPlan.flightArea}</div>}
                  {project.description && <div className="sm:col-span-2"><span className="font-medium">Description:</span> {project.description}</div>}
                </div>
              </div>
            )}

            {/* Site Information */}
            {includedSections.siteInfo && activeSite && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  Site Details
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  {activeSite.name && <p><span className="font-medium">Site:</span> {activeSite.name}</p>}
                  {activeSite.address && <p><span className="font-medium">Address:</span> {activeSite.address}</p>}
                  {(() => {
                    const siteLocation = activeSite.mapData?.siteSurvey?.siteLocation
                    const coords = siteLocation?.geometry?.coordinates
                    if (coords && coords.length >= 2) {
                      return <p><span className="font-medium">Coordinates:</span> {coords[1].toFixed(6)}, {coords[0].toFixed(6)}</p>
                    }
                    if (activeSite.coordinates) {
                      return <p><span className="font-medium">Coordinates:</span> {activeSite.coordinates}</p>
                    }
                    return null
                  })()}
                  {activeSite.siteSurvey?.access?.landOwner && (
                    <p><span className="font-medium">Land Owner:</span> {activeSite.siteSurvey.access.landOwner}</p>
                  )}
                  {activeSite.siteSurvey?.access?.accessNotes && (
                    <p><span className="font-medium">Access Notes:</span> {activeSite.siteSurvey.access.accessNotes}</p>
                  )}
                </div>
              </div>
            )}

            {/* Key Hazards */}
            {includedSections.hazards && hazards.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Key Hazards & Controls
                </h4>
                <div className="space-y-2">
                  {hazards.map((hazard, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium text-amber-900">{hazard.description || 'Unnamed'}</p>
                      <p className="text-amber-700">→ {hazard.controls || 'None documented'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PPE */}
            {includedSections.ppe && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <HardHat className="w-4 h-4" />
                  Required PPE
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ppeItems.map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Communications */}
            {includedSections.communications && project.communications && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  Communications
                </h4>
                <div className="text-sm text-purple-800">
                  {project.communications.primaryChannel && <p><span className="font-medium">Primary Channel:</span> {project.communications.primaryChannel}</p>}
                  {project.communications.emergencyChannel && <p><span className="font-medium">Emergency:</span> {project.communications.emergencyChannel}</p>}
                  {project.communications.emergencyWord && <p><span className="font-medium">Emergency Word:</span> {project.communications.emergencyWord}</p>}
                  {project.communications.stopWord && <p><span className="font-medium">Stop Word:</span> {project.communications.stopWord}</p>}
                </div>
              </div>
            )}

            {/* Muster Point */}
            {includedSections.musterPoint && project.emergencyPlan?.rallyPoint && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Muster Point / Rally Point
                </h4>
                <p className="text-sm text-green-800">{project.emergencyPlan.rallyPoint}</p>
              </div>
            )}

            {/* Evacuation Routes */}
            {includedSections.evacRoutes && project.emergencyPlan?.evacuationRoutes && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4" />
                  Evacuation Routes
                </h4>
                <p className="text-sm text-orange-800">{project.emergencyPlan.evacuationRoutes}</p>
              </div>
            )}

            {/* Emergency */}
            {includedSections.emergency && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4" />
                  Emergency Information
                </h4>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-red-700">Contact: </span>
                    <span className="text-red-900 font-medium">
                      {project.emergencyPlan?.primaryEmergencyContact?.name || 'Not set'} - {project.emergencyPlan?.primaryEmergencyContact?.phone || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-700">Hospital: </span>
                    <span className="text-red-900 font-medium">{project.emergencyPlan?.nearestHospital || 'Not set'}</span>
                  </div>
                  {project.emergencyPlan?.hospitalAddress && (
                    <div className="sm:col-span-2">
                      <span className="text-red-700">Hospital Address: </span>
                      <span className="text-red-900">{project.emergencyPlan.hospitalAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weather (from data entered above) */}
            {includedSections.weather && (currentDay.weatherData?.temperature || currentDay.weatherData?.windSpeed || currentDay.weatherBriefing) && (
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <h4 className="font-semibold text-sky-900 mb-2 flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  Current Weather
                </h4>
                <div className="grid sm:grid-cols-3 gap-2 text-sm text-sky-800">
                  {currentDay.weatherData?.temperature && <div><span className="font-medium">Temp:</span> {currentDay.weatherData.temperature}</div>}
                  {currentDay.weatherData?.windSpeed && <div><span className="font-medium">Wind:</span> {currentDay.weatherData.windSpeed} {currentDay.weatherData.windDirection || ''}</div>}
                  {currentDay.weatherData?.visibility && <div><span className="font-medium">Visibility:</span> {currentDay.weatherData.visibility}</div>}
                </div>
                {currentDay.weatherBriefing && <p className="text-sm text-sky-700 mt-2">{currentDay.weatherBriefing}</p>}
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="label">Additional Notes</label>
              <textarea
                value={currentDay.customNotes || ''}
                onChange={(e) => updateCurrentDay({ customNotes: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Any other items for today's briefing..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

ProjectTailgate.propTypes = {
  project: PropTypes.shape({
    tailgate: PropTypes.object,
    crew: PropTypes.array,
    sites: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}
