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
import { BrandedPDF, generateFlightPlanBriefPDF } from '../../lib/pdfExportService'
import { logger } from '../../lib/logger'
import { sendTeamNotification } from '../../lib/teamNotificationService'
import { getSiteMapImage } from '../../lib/staticMapService'
import WeatherWidget from '../weather/WeatherWidget'
import TailgateFlightPlanEditor from './TailgateFlightPlanEditor'

// Helper component to get coordinates and show weather
function SiteWeatherWidget({ activeSite }) {
  if (!activeSite) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">No site selected. Add a site in Site Survey first.</p>
      </div>
    )
  }

  // Get coordinates - check multiple possible paths
  // Path 1: Direct on mapData (older structure)
  let coords = activeSite.mapData?.siteLocation?.geometry?.coordinates

  // Path 2: Under siteSurvey (current structure used by Site Survey tab)
  if (!coords) {
    coords = activeSite.mapData?.siteSurvey?.siteLocation?.geometry?.coordinates
  }

  // Coordinates are stored as [lng, lat] in GeoJSON format
  if (coords && coords.length >= 2) {
    const lng = coords[0]
    const lat = coords[1]

    if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
      return (
        <WeatherWidget
          lat={lat}
          lon={lng}
          siteName={activeSite.name || 'Operation Site'}
          compact={false}
        />
      )
    }
  }

  // No valid coordinates found
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Site location not set</p>
          <p className="text-sm text-amber-700 mt-1">
            To see live weather, go to <strong>Site Survey</strong>, click the <strong>Site Location</strong> tool,
            then click on the map to place your site marker.
          </p>
        </div>
      </div>
    </div>
  )
}

// Briefing sections for in-app review
const BRIEFING_SECTIONS = [
  { id: 'projectOverview', label: 'Project Overview', icon: FileText, required: true },
  { id: 'weather', label: 'Weather Conditions', icon: Wind, required: true },
  { id: 'crew', label: 'Crew & Roles', icon: Users, required: true },
  { id: 'aircraft', label: 'Aircraft & Equipment', icon: Plane, required: true },
  { id: 'flightPlan', label: 'Flight Plan', icon: MapPin, required: true },
  { id: 'siteInfo', label: 'Site Details', icon: MapPin, required: false },
  { id: 'hazards', label: 'Hazards & Controls', icon: AlertTriangle, required: true },
  { id: 'ppe', label: 'PPE Requirements', icon: HardHat, required: true },
  { id: 'emergency', label: 'Emergency Procedures', icon: Phone, required: true },
  { id: 'communications', label: 'Communications', icon: Radio, required: true }
]

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

// Default section review status
const DEFAULT_SECTION_REVIEWS = {
  projectOverview: false,
  weather: false,
  crew: false,
  aircraft: false,
  flightPlan: false,
  siteInfo: false,
  hazards: false,
  ppe: false,
  emergency: false,
  communications: false
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
  // Section review tracking - for in-app briefing workflow
  sectionReviews: { ...DEFAULT_SECTION_REVIEWS },
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
  distributedAt: null, // When GO was distributed
  flightLogs: [],
  includedSections: { ...DEFAULT_INCLUDED_SECTIONS },
  // Flight window for flight plan notifications
  operationStartTime: '',   // HH:MM format
  operationEndTime: '',     // HH:MM format
  editFlightPlanEnabled: false,
  tailgateMapData: null  // Field-adjusted flight plan data (GeoJSON)
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

  // Toggle section review status (for in-app briefing workflow)
  const toggleSectionReview = (sectionId) => {
    const currentReviews = currentDay.sectionReviews || DEFAULT_SECTION_REVIEWS
    updateCurrentDay({
      sectionReviews: {
        ...currentReviews,
        [sectionId]: !currentReviews[sectionId]
      }
    })
  }

  const includedSections = currentDay.includedSections || DEFAULT_INCLUDED_SECTIONS
  const sectionReviews = currentDay.sectionReviews || DEFAULT_SECTION_REVIEWS

  // Calculate review progress
  const reviewedSections = BRIEFING_SECTIONS.filter(s => sectionReviews[s.id]).length
  const totalSections = BRIEFING_SECTIONS.length
  const allSectionsReviewed = reviewedSections === totalSections

  // Handle GO/NO GO decision with notification and distribution
  const handleGoNoGoDecision = async (decision) => {
    const previousDecision = currentDay.goNoGoDecision
    const statusText = decision === true ? 'GO' : 'NO-GO'

    // Update the decision and mark distribution time if GO
    updateCurrentDay({
      goNoGoDecision: decision,
      distributedAt: decision === true ? new Date().toISOString() : null
    })

    // Only send notifications if this is a change and project exists
    if (project.id && ((decision === true && previousDecision !== true) || (decision === false && previousDecision !== false))) {
      // Send existing goNoGo notification
      try {
        await sendTeamNotification(project.id, 'goNoGo', {
          decision: statusText,
          date: currentDay.date || new Date().toISOString(),
          pic: pic?.operatorName || pic?.name || 'Not assigned',
          notes: decision === false ? currentDay.goNoGoNotes : '',
          // Include briefing summary for distribution
          briefingSummary: {
            project: project.name,
            client: project.clientName,
            date: currentDay.date,
            crewCount: allCrew.length,
            sectionsReviewed: reviewedSections
          }
        })
        logger.info('Tailgate briefing distributed successfully')
      } catch (error) {
        logger.error('Failed to distribute tailgate briefing:', error)
      }

      // Send flight plan notification with PDF attachment
      try {
        // Generate map image for the PDF
        // Use tailgate-specific map data if field adjustments were made
        let mapImage = null
        const useFieldAdjustments = currentDay.tailgateMapData && currentDay.tailgateMapData.editedAt

        if (activeSite) {
          try {
            // If we have field adjustments, create a modified site object for map generation
            const siteForMap = useFieldAdjustments
              ? {
                  ...activeSite,
                  mapData: {
                    ...activeSite.mapData,
                    flightPlan: currentDay.tailgateMapData
                  }
                }
              : activeSite

            mapImage = await getSiteMapImage(siteForMap, {
              width: 800,
              height: 500,
              style: 'satelliteStreets'
            })
          } catch (mapErr) {
            logger.warn('Failed to generate map image for flight plan:', mapErr)
          }
        }

        // Generate flight plan PDF using field adjustments if available
        const siteForPdf = useFieldAdjustments
          ? {
              ...activeSite,
              flightPlan: {
                ...(activeSite?.flightPlan || {}),
                ...currentDay.tailgateMapData
              },
              mapData: {
                ...(activeSite?.mapData || {}),
                flightPlan: currentDay.tailgateMapData
              }
            }
          : activeSite

        const flightPlanPdf = await generateFlightPlanBriefPDF(siteForPdf, {
          projectName: project.name,
          projectCode: project.projectCode,
          clientName: project.clientName,
          operatorName: project.branding?.operator?.name || '',
          operatorContact: project.branding?.operator?.phone || project.branding?.operator?.email || '',
          status: statusText,
          statusNotes: currentDay.goNoGoNotes,
          startTime: currentDay.operationStartTime,
          endTime: currentDay.operationEndTime,
          date: currentDay.date,
          mapImage,
          branding: project.branding || null
        })

        // Get PDF as base64
        const pdfDataUrl = flightPlanPdf.getDataUrl()
        const pdfBase64 = pdfDataUrl.split(',')[1] // Remove data:application/pdf;base64, prefix

        // Send flight plan notification
        await sendTeamNotification(project.id, 'flightPlan', {
          status: statusText,
          siteName: activeSite?.name || 'Site',
          date: currentDay.date,
          startTime: currentDay.operationStartTime || 'TBD',
          endTime: currentDay.operationEndTime || 'TBD',
          altitude: activeSite?.flightPlan?.maxAltitudeAGL || project.flightPlan?.maxAltitudeAGL || 'See plan',
          notes: currentDay.goNoGoNotes
        }, {
          attachments: [{
            filename: `FlightPlan_${project.projectCode || 'FP'}_${currentDay.date || 'nodate'}.pdf`,
            content: pdfBase64
          }]
        })
        logger.info('Flight plan notification sent successfully')
      } catch (err) {
        logger.error('Failed to send flight plan notification:', err)
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

  // Get hazards - check multiple possible data paths
  const getHazards = () => {
    const hazards = project.hseRisk?.hazards ||
                    project.hseRiskAssessment?.hazards ||
                    project.riskAssessment?.hazards ||
                    project.hazards ||
                    []
    return Array.isArray(hazards) ? hazards.slice(0, 6) : []
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

      {/* Flight Window Section */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-aeria-blue" />
          <h3 className="font-medium text-gray-900">Flight Window</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="operation-start-time" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              id="operation-start-time"
              type="time"
              value={currentDay?.operationStartTime || ''}
              onChange={(e) => {
                console.log('Start time change:', e.target.value)
                updateCurrentDay({ operationStartTime: e.target.value })
              }}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="operation-end-time" className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              id="operation-end-time"
              type="time"
              value={currentDay?.operationEndTime || ''}
              onChange={(e) => {
                console.log('End time change:', e.target.value)
                updateCurrentDay({ operationEndTime: e.target.value })
              }}
              className="input"
            />
          </div>
        </div>

        {/* Edit Flight Plan Toggle */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label htmlFor="edit-flight-plan-toggle" className="flex items-center gap-3 cursor-pointer">
            <input
              id="edit-flight-plan-toggle"
              type="checkbox"
              checked={currentDay?.editFlightPlanEnabled || false}
              onChange={(e) => {
                console.log('Edit flight plan toggle:', e.target.checked)
                updateCurrentDay({ editFlightPlanEnabled: e.target.checked })
              }}
              className="w-4 h-4 text-aeria-blue rounded"
            />
            <div>
              <span className="font-medium text-gray-900">Edit Flight Plan</span>
              <p className="text-sm text-gray-500">Make adjustments before today's operations</p>
            </div>
          </label>

          {/* Show saved indicator if field adjustments exist */}
          {currentDay?.tailgateMapData && (
            <div className="mt-2 ml-7 flex items-center gap-2 text-sm text-green-600">
              <Check className="w-4 h-4" />
              Field adjustments saved
              <span className="text-gray-400">
                ({new Date(currentDay.tailgateMapData.editedAt).toLocaleTimeString()})
              </span>
            </div>
          )}
        </div>

        {/* Inline Flight Plan Editor */}
        {currentDay?.editFlightPlanEnabled && (
          <div className="mt-4">
            <TailgateFlightPlanEditor
              site={activeSite}
              initialMapData={currentDay?.tailgateMapData}
              onSave={(mapData) => {
                updateCurrentDay({
                  tailgateMapData: mapData,
                  editFlightPlanEnabled: false
                })
                logger.info('Tailgate flight plan adjustments saved')
              }}
              onCancel={() => {
                updateCurrentDay({ editFlightPlanEnabled: false })
              }}
            />
          </div>
        )}
      </div>

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

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isMultiDay ? `Day ${selectedDayIndex + 1}: ` : ''}Tailgate Briefing
          </h2>
          <p className="text-sm text-gray-500">
            {formatDate(currentDay.date)} • Review each section and check off when complete
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
            <span className={`text-sm font-medium ${allSectionsReviewed ? 'text-green-600' : 'text-gray-600'}`}>
              {reviewedSections}/{totalSections} reviewed
            </span>
          </div>
          {/* Export options (secondary) */}
          <button onClick={exportToPDF} disabled={exporting} className="btn-secondary text-sm inline-flex items-center gap-1">
            {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            PDF
          </button>
          {isMultiDay && days.length > 1 && (
            <button
              onClick={() => removeDay(selectedDayIndex)}
              className="btn-secondary text-red-600 hover:bg-red-50 text-sm"
              title="Remove this day"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Briefing Progress */}
      <div className={`p-4 rounded-lg border-2 ${
        allSectionsReviewed && completedCount === totalChecklistItems ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {allSectionsReviewed ? (
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            ) : (
              <ClipboardCheck className="w-8 h-8 text-blue-600" />
            )}
            <div>
              <h3 className={`font-semibold ${allSectionsReviewed ? 'text-green-800' : 'text-blue-800'}`}>
                {allSectionsReviewed ? 'All Sections Reviewed' : 'Review Briefing Sections'}
              </h3>
              <p className={`text-sm ${allSectionsReviewed ? 'text-green-600' : 'text-blue-600'}`}>
                Sections: {reviewedSections}/{totalSections} •
                Checklist: {completedCount}/{totalChecklistItems} •
                Crew: {attendedCount}/{allCrew.length}
              </p>
            </div>
          </div>
          {currentDay.distributedAt && (
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                Distributed
              </span>
              <p className="text-xs text-gray-500 mt-1">{new Date(currentDay.distributedAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* BRIEFING REVIEW SECTIONS */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-aeria-blue" />
          Briefing Review
          <span className="text-xs font-normal text-gray-500 ml-2">Click each section to expand and review</span>
        </h3>

        <div className="space-y-2">
          {BRIEFING_SECTIONS.map(section => {
            const Icon = section.icon
            const isReviewed = sectionReviews[section.id]
            const isExpanded = expandedSections[section.id]

            return (
              <div key={section.id} className={`border rounded-lg overflow-hidden ${isReviewed ? 'border-green-300 bg-green-50/50' : 'border-gray-200'}`}>
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isReviewed ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${isReviewed ? 'text-green-800' : 'text-gray-700'}`}>{section.label}</span>
                    {section.required && !isReviewed && (
                      <span className="text-xs text-amber-600">Required</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isReviewed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    {/* Section content rendered based on type */}
                    <div className="py-3">
                      {section.id === 'projectOverview' && (
                        <div className="p-4 bg-gradient-to-r from-aeria-navy to-aeria-blue text-white rounded-lg">
                          <h4 className="text-lg font-bold">{project.name || 'Untitled Project'}</h4>
                          <div className="grid sm:grid-cols-4 gap-4 mt-3 text-sm">
                            <div><p className="text-white/70">Date</p><p className="font-semibold">{formatShortDate(currentDay.date)}</p></div>
                            <div><p className="text-white/70">Client</p><p className="font-semibold">{project.clientName || 'N/A'}</p></div>
                            <div><p className="text-white/70">Operation</p><p className="font-semibold">{project.flightPlan?.operationType || 'VLOS'}</p></div>
                            <div><p className="text-white/70">Max Alt</p><p className="font-semibold">{project.flightPlan?.maxAltitudeAGL || 120}m AGL</p></div>
                          </div>
                        </div>
                      )}

                      {section.id === 'weather' && <SiteWeatherWidget activeSite={activeSite} />}

                      {section.id === 'crew' && (
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          {allCrew.length > 0 ? allCrew.map((member, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{member.role || 'Crew'}:</span>
                              <span>{member.operatorName || member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown'}</span>
                            </div>
                          )) : (
                            <p className="text-gray-500 italic col-span-2">No crew assigned. Add crew in the Crew tab.</p>
                          )}
                        </div>
                      )}

                      {section.id === 'aircraft' && (
                        <div className="text-sm space-y-2">
                          {(() => {
                            const aircraftList = Array.isArray(project.aircraft) ? project.aircraft : (project.aircraft ? [project.aircraft] : [])
                            if (aircraftList.length === 0) {
                              return <p className="text-gray-500 italic">No aircraft assigned. Add aircraft in the Equipment tab.</p>
                            }
                            return aircraftList.map((ac, i) => (
                              <div key={i} className="p-2 bg-gray-50 rounded">
                                <p><span className="font-medium">Aircraft:</span> {ac.nickname || ac.model || ac.name || 'Not specified'}</p>
                                {ac.registration && <p><span className="font-medium">Registration:</span> {ac.registration}</p>}
                                {ac.serialNumber && <p><span className="font-medium">Serial:</span> {ac.serialNumber}</p>}
                              </div>
                            ))
                          })()}
                        </div>
                      )}

                      {section.id === 'flightPlan' && (
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div><span className="font-medium">Operation Type:</span> {project.flightPlan?.operationType || 'VLOS'}</div>
                          <div><span className="font-medium">Max Altitude:</span> {project.flightPlan?.maxAltitudeAGL || 120}m AGL</div>
                          {project.flightPlan?.weatherMinimums?.minVisibility && (
                            <div><span className="font-medium">Min Visibility:</span> {project.flightPlan.weatherMinimums.minVisibility}m</div>
                          )}
                          {project.flightPlan?.weatherMinimums?.maxWind && (
                            <div><span className="font-medium">Max Wind:</span> {project.flightPlan.weatherMinimums.maxWind} m/s</div>
                          )}
                          {project.description && (
                            <div className="sm:col-span-2 mt-2 p-2 bg-gray-50 rounded">
                              <span className="font-medium">Description:</span> {project.description}
                            </div>
                          )}
                        </div>
                      )}

                      {section.id === 'siteInfo' && (
                        <div className="text-sm">
                          {activeSite ? (
                            <>
                              <p><span className="font-medium">Site:</span> {activeSite.name || 'Site 1'}</p>
                              {activeSite.address && <p><span className="font-medium">Address:</span> {activeSite.address}</p>}
                              {activeSite.siteSurvey?.access?.landOwner && (
                                <p><span className="font-medium">Land Owner:</span> {activeSite.siteSurvey.access.landOwner}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-500 italic">No site configured. Add a site in Site Survey.</p>
                          )}
                        </div>
                      )}

                      {section.id === 'hazards' && (
                        <div className="space-y-2">
                          {hazards.length > 0 ? (
                            <>
                              {hazards.slice(0, 5).map((hazard, i) => (
                                <div key={i} className="text-sm p-2 bg-amber-50 rounded">
                                  <p className="font-medium text-amber-900">{hazard.hazard || hazard.description || hazard.name || 'Hazard'}</p>
                                  <p className="text-amber-700">→ {hazard.control || hazard.controls || hazard.mitigation || 'Controls not documented'}</p>
                                </div>
                              ))}
                              {hazards.length > 5 && <p className="text-sm text-gray-500">+ {hazards.length - 5} more hazards</p>}
                            </>
                          ) : (
                            <p className="text-gray-500 italic">No hazards documented. Complete HSE Risk Assessment.</p>
                          )}
                        </div>
                      )}

                      {section.id === 'ppe' && (
                        <div className="flex flex-wrap gap-2">
                          {ppeItems.length > 0 ? ppeItems.map((item, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{item}</span>
                          )) : (
                            <p className="text-gray-500 italic">No PPE requirements set. Configure in PPE tab.</p>
                          )}
                        </div>
                      )}

                      {section.id === 'emergency' && (
                        <div className="space-y-3 text-sm">
                          {/* All Emergency Contacts */}
                          <div>
                            <p className="font-medium text-gray-700 mb-2">Emergency Contacts:</p>
                            <div className="space-y-2">
                              {(project.emergencyPlan?.contacts?.length > 0) ? (
                                project.emergencyPlan.contacts.map((contact, i) => (
                                  <div key={i} className="p-2 bg-red-50 rounded flex items-center justify-between">
                                    <div>
                                      <span className="font-medium text-red-900">{contact.name || 'Unknown'}</span>
                                      {contact.role && <span className="text-red-700 ml-2">({contact.role})</span>}
                                    </div>
                                    <span className="text-red-800 font-mono">{contact.phone || 'No phone'}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 italic">No emergency contacts configured.</p>
                              )}
                            </div>
                          </div>

                          {/* Nearest Facilities */}
                          <div className="grid sm:grid-cols-3 gap-2">
                            <div className="p-2 bg-blue-50 rounded">
                              <p className="text-blue-700 text-xs font-medium">Hospital</p>
                              <p className="text-blue-900 font-medium">{project.emergencyPlan?.nearestFacilities?.hospitalName || project.emergencyPlan?.nearestHospital || 'Not set'}</p>
                              {project.emergencyPlan?.nearestFacilities?.hospitalPhone && (
                                <p className="text-blue-800 text-xs">{project.emergencyPlan.nearestFacilities.hospitalPhone}</p>
                              )}
                            </div>
                            <div className="p-2 bg-orange-50 rounded">
                              <p className="text-orange-700 text-xs font-medium">Fire Station</p>
                              <p className="text-orange-900 font-medium">{project.emergencyPlan?.nearestFacilities?.fireStationName || 'Not set'}</p>
                              {project.emergencyPlan?.nearestFacilities?.fireStationPhone && (
                                <p className="text-orange-800 text-xs">{project.emergencyPlan.nearestFacilities.fireStationPhone}</p>
                              )}
                            </div>
                            <div className="p-2 bg-indigo-50 rounded">
                              <p className="text-indigo-700 text-xs font-medium">Police</p>
                              <p className="text-indigo-900 font-medium">{project.emergencyPlan?.nearestFacilities?.policeStationName || 'Not set'}</p>
                              {project.emergencyPlan?.nearestFacilities?.policeStationPhone && (
                                <p className="text-indigo-800 text-xs">{project.emergencyPlan.nearestFacilities.policeStationPhone}</p>
                              )}
                            </div>
                          </div>

                          {/* Muster Point */}
                          {(project.emergencyPlan?.musterPoints?.length > 0 || project.emergencyPlan?.rallyPoint) && (
                            <div className="p-2 bg-green-50 rounded">
                              <span className="text-green-700 font-medium">Muster Point: </span>
                              <span className="text-green-900">
                                {project.emergencyPlan?.musterPoints?.find(mp => mp.isPrimary)?.name ||
                                 project.emergencyPlan?.musterPoints?.[0]?.name ||
                                 project.emergencyPlan?.rallyPoint || 'Not set'}
                              </span>
                            </div>
                          )}

                          {/* Emergency Procedures Summary */}
                          {project.emergencyPlan?.procedures?.length > 0 && (
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="font-medium text-gray-700 mb-1">Emergency Procedures:</p>
                              <div className="flex flex-wrap gap-1">
                                {project.emergencyPlan.procedures.map((proc, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                    {proc.customName || proc.type || 'Procedure'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {section.id === 'communications' && (
                        <div className="text-sm space-y-1">
                          {project.communications ? (
                            <>
                              {project.communications.primaryChannel && <p><span className="font-medium">Primary Channel:</span> {project.communications.primaryChannel}</p>}
                              {project.communications.backupChannel && <p><span className="font-medium">Backup:</span> {project.communications.backupChannel}</p>}
                              {project.communications.emergencyChannel && <p><span className="font-medium">Emergency:</span> {project.communications.emergencyChannel}</p>}
                              {project.communications.emergencyWord && <p><span className="font-medium">Emergency Word:</span> <span className="text-red-600 font-bold">{project.communications.emergencyWord}</span></p>}
                              {project.communications.stopWord && <p><span className="font-medium">Stop Word:</span> <span className="text-amber-600 font-bold">{project.communications.stopWord}</span></p>}
                            </>
                          ) : (
                            <p className="text-gray-500 italic">No communications configured. Set up in Communications tab.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Mark as Reviewed button */}
                    <button
                      onClick={() => toggleSectionReview(section.id)}
                      className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
                        isReviewed
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-aeria-navy text-white hover:bg-aeria-navy/90'
                      }`}
                    >
                      {isReviewed ? '✓ Reviewed' : 'Mark as Reviewed'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Date Picker moved here for quick access */}
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
            <SiteWeatherWidget activeSite={activeSite} />

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

      {/* ========================================== */}
      {/* GO / NO-GO DECISION - AT THE END */}
      {/* ========================================== */}
      <div className={`card border-4 ${
        currentDay.goNoGoDecision === true
          ? 'border-green-500 bg-green-50'
          : currentDay.goNoGoDecision === false
          ? 'border-red-500 bg-red-50'
          : 'border-gray-300'
      }`}>
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-aeria-blue" />
            Final Decision
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {allSectionsReviewed
              ? 'All sections reviewed. Make your GO / NO-GO decision.'
              : `Complete review of all sections first (${reviewedSections}/${totalSections} done)`
            }
          </p>
        </div>

        {/* Readiness checklist summary */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <div className={`text-center p-3 rounded-lg ${allSectionsReviewed ? 'bg-green-100' : 'bg-gray-100'}`}>
            <p className={`text-2xl font-bold ${allSectionsReviewed ? 'text-green-700' : 'text-gray-500'}`}>
              {reviewedSections}/{totalSections}
            </p>
            <p className="text-xs text-gray-600">Sections Reviewed</p>
          </div>
          <div className={`text-center p-3 rounded-lg ${completedCount === totalChecklistItems ? 'bg-green-100' : 'bg-gray-100'}`}>
            <p className={`text-2xl font-bold ${completedCount === totalChecklistItems ? 'text-green-700' : 'text-gray-500'}`}>
              {completedCount}/{totalChecklistItems}
            </p>
            <p className="text-xs text-gray-600">Checklist Items</p>
          </div>
          <div className={`text-center p-3 rounded-lg ${attendedCount === allCrew.length ? 'bg-green-100' : 'bg-gray-100'}`}>
            <p className={`text-2xl font-bold ${attendedCount === allCrew.length ? 'text-green-700' : 'text-gray-500'}`}>
              {attendedCount}/{allCrew.length}
            </p>
            <p className="text-xs text-gray-600">Crew Present</p>
          </div>
        </div>

        {/* GO / NO-GO Buttons */}
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={() => handleGoNoGoDecision(true)}
            disabled={!allSectionsReviewed}
            className={`flex-1 min-w-[200px] p-6 rounded-xl border-4 transition-all flex flex-col items-center justify-center gap-2 ${
              currentDay.goNoGoDecision === true
                ? 'border-green-500 bg-green-100 text-green-700 shadow-lg'
                : !allSectionsReviewed
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-200 hover:border-green-400 hover:bg-green-50/50'
            }`}
          >
            <ThumbsUp className="w-10 h-10" />
            <span className="text-2xl font-bold">GO</span>
            <span className="text-xs opacity-75">Operation Approved</span>
          </button>

          <button
            onClick={() => handleGoNoGoDecision(false)}
            className={`flex-1 min-w-[200px] p-6 rounded-xl border-4 transition-all flex flex-col items-center justify-center gap-2 ${
              currentDay.goNoGoDecision === false
                ? 'border-red-500 bg-red-100 text-red-700 shadow-lg'
                : 'border-gray-200 hover:border-red-400 hover:bg-red-50/50'
            }`}
          >
            <ThumbsDown className="w-10 h-10" />
            <span className="text-2xl font-bold">NO-GO</span>
            <span className="text-xs opacity-75">Operation Cancelled</span>
          </button>
        </div>

        {/* NO-GO Reason */}
        {currentDay.goNoGoDecision === false && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <label className="label text-red-800">Reason for No-Go Decision</label>
            <textarea
              value={currentDay.goNoGoNotes || ''}
              onChange={(e) => updateCurrentDay({ goNoGoNotes: e.target.value })}
              className="input min-h-[100px] border-red-300"
              placeholder="Document the reason for the No-Go decision..."
            />
          </div>
        )}

        {/* GO Confirmation */}
        {currentDay.goNoGoDecision === true && (
          <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-semibold text-green-800">Operations Approved</p>
            <p className="text-sm text-green-700 mt-1">
              Tailgate briefing has been distributed to the team.
            </p>
            {currentDay.distributedAt && (
              <p className="text-xs text-green-600 mt-2">
                Distributed at {new Date(currentDay.distributedAt).toLocaleString()}
              </p>
            )}
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
