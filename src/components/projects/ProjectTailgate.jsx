import { useState, useEffect } from 'react'
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
  ClipboardCheck
} from 'lucide-react'

export default function ProjectTailgate({ project, onUpdate }) {
  const [copied, setCopied] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    briefing: true,
    checklist: true,
    attendance: true
  })

  // Initialize tailgate data if not present
  useEffect(() => {
    if (!project.tailgate) {
      onUpdate({
        tailgate: {
          generatedAt: null,
          customNotes: '',
          weatherBriefing: '',
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
          weatherMinimumsConfirmed: false,
          safetyTopics: []
        }
      })
    }
  }, [project.tailgate])

  const tailgate = project.tailgate || {}
  
  const updateTailgate = (updates) => {
    onUpdate({
      tailgate: {
        ...tailgate,
        ...updates
      }
    })
  }

  const updateChecklist = (item, value) => {
    updateTailgate({
      checklistCompleted: {
        ...(tailgate.checklistCompleted || {}),
        [item]: value
      }
    })
  }

  const updateCrewAttendance = (crewId, attended) => {
    updateTailgate({
      crewAttendance: {
        ...(tailgate.crewAttendance || {}),
        [crewId]: {
          attended,
          timestamp: attended ? new Date().toISOString() : null
        }
      }
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Generate briefing content from project data
  const generateBriefing = () => {
    updateTailgate({
      generatedAt: new Date().toISOString(),
      briefingStartTime: new Date().toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' })
    })
  }

  // Copy briefing to clipboard
  const copyBriefing = () => {
    const text = generateBriefingText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Get crew by role
  const getCrew = (role) => {
    return (project.crew || []).filter(c => c.role === role)
  }

  const pic = getCrew('PIC')[0]
  const allCrew = project.crew || []

  // Format helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set'
    return new Date(dateStr).toLocaleDateString('en-CA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Not set'
    return timeStr
  }

  // Generate plain text version for copying
  const generateBriefingText = () => {
    const lines = [
      `PRE-DEPLOYMENT BRIEFING - ${project.name || 'Untitled Project'}`,
      `═`.repeat(50),
      `Date: ${formatDate(project.startDate)}`,
      `Project Code: ${project.projectCode || 'N/A'}`,
      `Client: ${project.clientName || 'N/A'}`,
      '',
      '─── CREW ───',
      ...allCrew.map(c => `• ${c.role}: ${c.name}${c.phone ? ` (${c.phone})` : ''}`),
      '',
      '─── OPERATION OVERVIEW ───',
      `Description: ${project.description || 'No description'}`,
      `Operation Type: ${project.flightPlan?.operationType || 'Standard'}`,
      `Max Altitude: ${project.flightPlan?.maxAltitudeAGL || project.flightPlan?.maxAltitude || 'N/A'} m AGL`,
      '',
      '─── SITE INFORMATION ───',
      `Location: ${project.siteSurvey?.general?.siteName || project.siteSurvey?.siteName || 'Not specified'}`,
      `Coordinates: ${project.siteSurvey?.general?.coordinates?.lat || project.siteSurvey?.latitude || 'N/A'}, ${project.siteSurvey?.general?.coordinates?.lng || project.siteSurvey?.longitude || 'N/A'}`,
      '',
      '─── EMERGENCY CONTACTS ───',
      `Primary: ${project.emergencyPlan?.primaryEmergencyContact?.name || 'Not set'} - ${project.emergencyPlan?.primaryEmergencyContact?.phone || 'N/A'}`,
      `Hospital: ${project.emergencyPlan?.nearestHospital || 'Not set'}`,
      `Rally Point: ${project.emergencyPlan?.rallyPoint || 'Not set'}`,
      '',
      '─── COMMUNICATIONS ───',
      `Primary Channel: ${project.communications?.primaryChannel || 'Not set'}`,
      `Backup: ${project.communications?.backupChannel || 'Not set'}`,
      '',
      '─── KEY HAZARDS & MITIGATIONS ───',
      ...((project.hseRiskAssessment?.hazards || project.riskAssessment?.hazards || []).slice(0, 5).map(h => 
        `• ${h.description || h.hazard || 'Unnamed hazard'}\n  → Controls: ${h.controls || 'None documented'}`
      )),
      '',
      '─── PPE REQUIREMENTS ───',
      ...(project.ppe?.required || ['Safety vest', 'Hard hat (if required)', 'Safety boots']).map(item => `• ${item}`),
      '',
      '─── WEATHER BRIEFING ───',
      tailgate.weatherBriefing || 'Not recorded',
      '',
      tailgate.customNotes ? `─── ADDITIONAL NOTES ───\n${tailgate.customNotes}` : '',
      '',
      `═`.repeat(50),
      `Briefing Generated: ${new Date().toLocaleString()}`,
      `Go/No-Go Decision: ${tailgate.goNoGoDecision === true ? 'GO' : tailgate.goNoGoDecision === false ? 'NO-GO' : 'Pending'}`
    ]
    return lines.filter(l => l !== '').join('\n')
  }

  // Calculate checklist progress
  const checklistItems = tailgate.checklistCompleted || {}
  const completedCount = Object.values(checklistItems).filter(Boolean).length
  const totalChecklistItems = 10

  // Calculate crew attendance
  const crewAttendance = tailgate.crewAttendance || {}
  const attendedCount = Object.values(crewAttendance).filter(a => a?.attended).length
  const allCrewAttended = allCrew.length > 0 && attendedCount === allCrew.length

  // SAIL level from SORA assessment
  const sail = project.soraAssessment?.sail || null

  // Check if ready for operations
  const isReadyForOps = completedCount === totalChecklistItems && 
                        allCrewAttended && 
                        tailgate.goNoGoDecision === true

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Pre-Deployment Briefing</h2>
          <p className="text-sm text-gray-500">
            {tailgate.generatedAt 
              ? `Last generated: ${new Date(tailgate.generatedAt).toLocaleString()}`
              : 'Generate a briefing summary for your tailgate meeting'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateBriefing}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {tailgate.generatedAt ? 'Refresh' : 'Generate'}
          </button>
          <button
            onClick={copyBriefing}
            className="btn-secondary inline-flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={() => window.print()}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Go / No-Go Decision */}
      <div className="card border-2 border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-aeria-blue" />
          Go / No-Go Decision
        </h3>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={() => updateTailgate({ goNoGoDecision: true })}
            className={`flex-1 min-w-[150px] p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-3 ${
              tailgate.goNoGoDecision === true 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
            }`}
          >
            <ThumbsUp className="w-6 h-6" />
            <span className="text-lg font-semibold">GO</span>
          </button>
          
          <button
            onClick={() => updateTailgate({ goNoGoDecision: false })}
            className={`flex-1 min-w-[150px] p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-3 ${
              tailgate.goNoGoDecision === false 
                ? 'border-red-500 bg-red-50 text-red-700' 
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
            }`}
          >
            <ThumbsDown className="w-6 h-6" />
            <span className="text-lg font-semibold">NO-GO</span>
          </button>
        </div>
        
        {tailgate.goNoGoDecision === false && (
          <div>
            <label className="label">Reason for No-Go</label>
            <textarea
              value={tailgate.goNoGoNotes || ''}
              onChange={(e) => updateTailgate({ goNoGoNotes: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Document the reason for the No-Go decision..."
            />
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
              allCrewAttended 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
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
                      hasAttended 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
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
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        hasAttended
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {hasAttended ? 'Present ✓' : 'Mark Present'}
                    </button>
                  </div>
                )
              })
            )}
            
            {allCrewAttended && allCrew.length > 0 && (
              <div className="p-3 bg-green-100 border border-green-200 rounded-lg mt-2">
                <p className="text-green-800 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  All crew members present and accounted for
                </p>
              </div>
            )}
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
            Briefing Content
          </h2>
          {expandedSections.briefing ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.briefing && (
          <div className="mt-4 space-y-4">
            {/* Project & Operation Info */}
            <div className="grid sm:grid-cols-2 gap-4 p-4 bg-aeria-sky rounded-lg">
              <div>
                <p className="text-sm text-aeria-navy/70">Project</p>
                <p className="font-semibold text-aeria-navy">{project.name || 'Untitled'}</p>
                <p className="text-sm text-gray-600">{project.projectCode}</p>
              </div>
              <div>
                <p className="text-sm text-aeria-navy/70">Client</p>
                <p className="font-semibold text-aeria-navy">{project.clientName || 'No client'}</p>
              </div>
              <div>
                <p className="text-sm text-aeria-navy/70">Date</p>
                <p className="font-semibold text-aeria-navy">{formatDate(project.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-aeria-navy/70">Operation Type</p>
                <p className="font-semibold text-aeria-navy">{project.flightPlan?.operationType || 'Standard'}</p>
              </div>
            </div>

            {/* SORA / Risk Level */}
            {(sail || project.soraAssessment) && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Risk Assessment Summary
                </h4>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-purple-700">SAIL Level</p>
                    <p className="font-bold text-purple-900 text-lg">{sail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-purple-700">Final GRC</p>
                    <p className="font-bold text-purple-900 text-lg">{project.soraAssessment?.finalGRC || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-purple-700">Residual ARC</p>
                    <p className="font-bold text-purple-900 text-lg">{project.soraAssessment?.residualARC || project.soraAssessment?.initialARC || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Crew List */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-aeria-blue" />
                Crew
              </h4>
              {allCrew.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  {allCrew.map((member, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">{member.role}:</span>
                      <span className="text-gray-900">{member.name}</span>
                      {member.phone && <span className="text-gray-500">({member.phone})</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No crew assigned</p>
              )}
            </div>

            {/* Site Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-aeria-blue" />
                Site Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium">{project.siteSurvey?.general?.siteName || project.siteSurvey?.siteName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Altitude</p>
                  <p className="font-medium">{project.flightPlan?.maxAltitudeAGL || project.flightPlan?.maxAltitude || 'N/A'} m AGL</p>
                </div>
              </div>
            </div>

            {/* Communications */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Radio className="w-4 h-4 text-aeria-blue" />
                Communications
              </h4>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Primary Channel</p>
                  <p className="font-medium">{project.communications?.primaryChannel || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Backup</p>
                  <p className="font-medium">{project.communications?.backupChannel || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Lost Link Action</p>
                  <p className="font-medium">{project.communications?.lostLinkProcedure || 'RTH'}</p>
                </div>
              </div>
            </div>

            {/* Emergency Information */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                Emergency Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-red-700">Emergency Contact</p>
                  <p className="font-medium text-red-900">
                    {project.emergencyPlan?.primaryEmergencyContact?.name || 'Not set'}
                    {project.emergencyPlan?.primaryEmergencyContact?.phone && (
                      <span className="ml-2">{project.emergencyPlan.primaryEmergencyContact.phone}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-red-700">Nearest Hospital</p>
                  <p className="font-medium text-red-900">
                    {project.emergencyPlan?.nearestHospital || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-red-700">Rally Point</p>
                  <p className="font-medium text-red-900">
                    {project.emergencyPlan?.rallyPoint || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-red-700">Emergency Procedure</p>
                  <p className="font-medium text-red-900">
                    {project.emergencyPlan?.emergencyProcedure || 'Standard ERP'}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Hazards */}
            {((project.hseRiskAssessment?.hazards || project.riskAssessment?.hazards || []).length > 0) && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Key Hazards & Controls
                </h4>
                <div className="space-y-2">
                  {(project.hseRiskAssessment?.hazards || project.riskAssessment?.hazards || []).slice(0, 5).map((hazard, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium text-amber-900">{hazard.description || hazard.hazard || 'Unnamed hazard'}</p>
                      <p className="text-amber-700">→ {hazard.controls || 'No controls documented'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PPE */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-aeria-blue" />
                Required PPE
              </h4>
              <div className="flex flex-wrap gap-2">
                {(project.ppe?.required || ['Safety vest', 'Appropriate footwear']).map((item, i) => (
                  <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Weather Briefing */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Wind className="w-4 h-4" />
                Weather Briefing
              </h4>
              <textarea
                value={tailgate.weatherBriefing || ''}
                onChange={(e) => updateTailgate({ weatherBriefing: e.target.value })}
                className="input min-h-[80px] bg-white"
                placeholder="Enter current weather conditions, wind speed/direction, visibility, cloud cover, and any weather-related concerns..."
              />
              
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tailgate.weatherMinimumsConfirmed || false}
                  onChange={(e) => updateTailgate({ weatherMinimumsConfirmed: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-blue-800">Weather conditions meet operational minimums</span>
              </label>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="label">Additional Briefing Notes</label>
              <textarea
                value={tailgate.customNotes || ''}
                onChange={(e) => updateTailgate({ customNotes: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Any additional information for the crew briefing..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Pre-Deployment Checklist */}
      <div className="card">
        <button
          onClick={() => toggleSection('checklist')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-aeria-blue" />
            Pre-Deployment Checklist
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
              { key: 'siteSecured', label: 'Site secured and access controlled' },
              { key: 'equipmentChecked', label: 'All equipment inspected and functional' },
              { key: 'crewBriefed', label: 'All crew members briefed on operation' },
              { key: 'commsVerified', label: 'Communications check completed' },
              { key: 'emergencyReviewed', label: 'Emergency procedures reviewed' },
              { key: 'notamsChecked', label: 'NOTAMs and airspace checked' },
              { key: 'weatherConfirmed', label: 'Weather conditions confirmed acceptable' },
              { key: 'riskReviewed', label: 'Risk assessment reviewed with crew' },
              { key: 'clientNotified', label: 'Client/landowner notified of operations' },
              { key: 'ppeConfirmed', label: 'All crew wearing required PPE' }
            ].map((item) => (
              <label 
                key={item.key}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  checklistItems[item.key] 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklistItems[item.key] || false}
                  onChange={(e) => updateChecklist(item.key, e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <span className={`text-sm ${checklistItems[item.key] ? 'text-green-800' : 'text-gray-700'}`}>
                  {item.label}
                </span>
              </label>
            ))}

            {completedCount === totalChecklistItems && (
              <div className="p-4 bg-green-100 border border-green-200 rounded-lg mt-4">
                <p className="text-green-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Pre-deployment checklist complete
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Briefing Sign-off */}
      <div className={`card ${isReadyForOps ? 'bg-green-50 border-2 border-green-300' : 'bg-gray-50'}`}>
        <h3 className="font-medium text-gray-900 mb-3">Briefing Completion</h3>
        <p className="text-sm text-gray-600 mb-4">
          By completing this briefing, the PIC confirms that all crew members have been briefed 
          on the operation, understand their roles, and are aware of all hazards and emergency procedures.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="label text-xs">Briefing Start</label>
            <input
              type="time"
              value={tailgate.briefingStartTime || ''}
              onChange={(e) => updateTailgate({ briefingStartTime: e.target.value })}
              className="input w-32"
            />
          </div>
          <div>
            <label className="label text-xs">Briefing End</label>
            <input
              type="time"
              value={tailgate.briefingEndTime || ''}
              onChange={(e) => updateTailgate({ briefingEndTime: e.target.value })}
              className="input w-32"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {tailgate.briefingStartTime && tailgate.briefingEndTime && (
              <span>
                Briefing duration: {tailgate.briefingStartTime} - {tailgate.briefingEndTime}
              </span>
            )}
          </div>
          {isReadyForOps ? (
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>Ready for Operations</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>
                {!allCrewAttended && 'Mark all crew present • '}
                {completedCount < totalChecklistItems && 'Complete checklist • '}
                {tailgate.goNoGoDecision !== true && 'Confirm Go decision'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
