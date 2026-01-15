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
  Eye
} from 'lucide-react'

export default function ProjectTailgate({ project, onUpdate }) {
  const [copied, setCopied] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    briefing: true,
    checklist: true
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
            riskReviewed: false
          },
          briefingStartTime: '',
          briefingEndTime: ''
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Generate briefing content from project data
  const generateBriefing = () => {
    updateTailgate({
      generatedAt: new Date().toISOString()
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
      `TAILGATE BRIEFING - ${project.name || 'Untitled Project'}`,
      `Date: ${formatDate(project.startDate)}`,
      `Project Code: ${project.projectCode || 'N/A'}`,
      `Client: ${project.clientName || 'N/A'}`,
      '',
      '--- CREW ---',
      ...allCrew.map(c => `${c.role}: ${c.name}${c.phone ? ` (${c.phone})` : ''}`),
      '',
      '--- OPERATION OVERVIEW ---',
      `Description: ${project.description || 'No description'}`,
      `Operation Type: ${project.flightPlan?.operationType || 'Standard'}`,
      `Max Altitude: ${project.flightPlan?.maxAltitude || 'N/A'} ${project.flightPlan?.altitudeUnit || 'AGL'}`,
      '',
      '--- SITE INFORMATION ---',
      `Location: ${project.siteSurvey?.siteName || 'Not specified'}`,
      `Coordinates: ${project.siteSurvey?.latitude || 'N/A'}, ${project.siteSurvey?.longitude || 'N/A'}`,
      `Site Hazards: ${project.siteSurvey?.hazards || 'None documented'}`,
      '',
      '--- EMERGENCY CONTACTS ---',
      `Primary: ${project.emergencyPlan?.primaryEmergencyContact?.name || 'Not set'} - ${project.emergencyPlan?.primaryEmergencyContact?.phone || 'N/A'}`,
      `Hospital: ${project.emergencyPlan?.nearestHospital || 'Not set'}`,
      `Emergency Rally Point: ${project.emergencyPlan?.rallyPoint || 'Not set'}`,
      '',
      '--- COMMUNICATIONS ---',
      `Primary Channel: ${project.communications?.primaryChannel || 'Not set'}`,
      `Backup: ${project.communications?.backupChannel || 'Not set'}`,
      '',
      '--- KEY HAZARDS & MITIGATIONS ---',
      ...(project.riskAssessment?.hazards || []).slice(0, 5).map(h => 
        `• ${h.description || 'Unnamed hazard'} - Controls: ${h.controls || 'None documented'}`
      ),
      '',
      '--- PPE REQUIREMENTS ---',
      ...(project.ppe?.required || []).map(item => `• ${item}`),
      '',
      `Generated: ${new Date().toLocaleString()}`
    ]
    return lines.join('\n')
  }

  // Calculate checklist progress
  const checklistItems = tailgate.checklistCompleted || {}
  const completedCount = Object.values(checklistItems).filter(Boolean).length
  const totalChecklistItems = 8

  // SAIL level from risk assessment
  const sail = project.riskAssessment?.sora ? 
    calculateSAIL(project.riskAssessment.sora) : null

  function calculateSAIL(sora) {
    // Simplified - just display what's stored or calculate
    const grc = sora.finalGRC || 2
    const arc = sora.residualARC || sora.initialARC || 'ARC-a'
    const matrix = {
      1: { 'ARC-a': 'I', 'ARC-b': 'I', 'ARC-c': 'II', 'ARC-d': 'IV' },
      2: { 'ARC-a': 'I', 'ARC-b': 'II', 'ARC-c': 'II', 'ARC-d': 'IV' },
      3: { 'ARC-a': 'II', 'ARC-b': 'II', 'ARC-c': 'IV', 'ARC-d': 'VI' },
      4: { 'ARC-a': 'II', 'ARC-b': 'IV', 'ARC-c': 'IV', 'ARC-d': 'VI' },
      5: { 'ARC-a': 'IV', 'ARC-b': 'IV', 'ARC-c': 'VI', 'ARC-d': 'VI' },
    }
    return matrix[Math.min(grc, 5)]?.[arc] || 'II'
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Field Briefing</h2>
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

      {/* Briefing Time */}
      <div className="card bg-aeria-sky">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Briefing Start Time</label>
            <input
              type="time"
              value={tailgate.briefingStartTime || ''}
              onChange={(e) => updateTailgate({ briefingStartTime: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Briefing End Time</label>
            <input
              type="time"
              value={tailgate.briefingEndTime || ''}
              onChange={(e) => updateTailgate({ briefingEndTime: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Generated Briefing Content */}
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
          <div className="mt-4 space-y-6 print:space-y-4">
            {/* Project Header */}
            <div className="p-4 bg-gray-900 text-white rounded-lg">
              <h3 className="text-xl font-bold">{project.name || 'Untitled Project'}</h3>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-300">
                <span>{formatDate(project.startDate)}</span>
                {project.projectCode && <span>Code: {project.projectCode}</span>}
                {project.clientName && <span>Client: {project.clientName}</span>}
              </div>
            </div>

            {/* Crew */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-aeria-blue" />
                Crew
              </h4>
              {allCrew.length === 0 ? (
                <p className="text-sm text-gray-500">No crew assigned</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allCrew.map((member, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                        member.role === 'PIC' ? 'bg-aeria-navy text-white' :
                        member.role === 'VO' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {member.role}
                      </span>
                      <span className="text-sm text-gray-900">{member.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operation Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Flight Parameters */}
              {project.sections?.flightPlan && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Plane className="w-4 h-4 text-aeria-blue" />
                    Flight Parameters
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Operation Type</dt>
                      <dd className="font-medium">{project.flightPlan?.operationType || 'VLOS'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Max Altitude</dt>
                      <dd className="font-medium">
                        {project.flightPlan?.maxAltitude || '—'} {project.flightPlan?.altitudeUnit || 'AGL'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Aircraft</dt>
                      <dd className="font-medium">{project.flightPlan?.aircraft || '—'}</dd>
                    </div>
                    {sail && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">SAIL Level</dt>
                        <dd className="font-medium">SAIL {sail}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Site Information */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-aeria-blue" />
                  Site Information
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Location</dt>
                    <dd className="font-medium">{project.siteSurvey?.siteName || 'Not specified'}</dd>
                  </div>
                  {project.siteSurvey?.latitude && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Coordinates</dt>
                      <dd className="font-medium font-mono text-xs">
                        {project.siteSurvey.latitude}, {project.siteSurvey.longitude}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Ground Type</dt>
                    <dd className="font-medium capitalize">
                      {project.flightPlan?.groundType?.replace('_', ' ') || '—'}
                    </dd>
                  </div>
                </dl>
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
            {(project.riskAssessment?.hazards || []).length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Key Hazards & Controls
                </h4>
                <div className="space-y-2">
                  {(project.riskAssessment.hazards || []).slice(0, 5).map((hazard, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium text-amber-900">{hazard.description || 'Unnamed hazard'}</p>
                      <p className="text-amber-700">→ {hazard.controls || 'No controls documented'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PPE */}
            {(project.ppe?.required || []).length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-aeria-blue" />
                  Required PPE
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(project.ppe.required || []).map((item, i) => (
                    <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

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

      {/* Pre-Flight Checklist */}
      <div className="card">
        <button
          onClick={() => toggleSection('checklist')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-aeria-blue" />
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
              { key: 'siteSecured', label: 'Site secured and access controlled' },
              { key: 'equipmentChecked', label: 'All equipment inspected and functional' },
              { key: 'crewBriefed', label: 'All crew members briefed on operation' },
              { key: 'commsVerified', label: 'Communications check completed' },
              { key: 'emergencyReviewed', label: 'Emergency procedures reviewed' },
              { key: 'notamsChecked', label: 'NOTAMs and airspace checked' },
              { key: 'weatherConfirmed', label: 'Weather conditions confirmed acceptable' },
              { key: 'riskReviewed', label: 'Risk assessment reviewed with crew' }
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
                  Pre-flight checklist complete — cleared for operations
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Briefing Sign-off */}
      <div className="card bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-3">Briefing Completion</h3>
        <p className="text-sm text-gray-600 mb-4">
          By completing this briefing, the PIC confirms that all crew members have been briefed 
          on the operation, understand their roles, and are aware of all hazards and emergency procedures.
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {tailgate.briefingStartTime && tailgate.briefingEndTime && (
              <span>
                Briefing duration: {tailgate.briefingStartTime} - {tailgate.briefingEndTime}
              </span>
            )}
          </div>
          {completedCount === totalChecklistItems && (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Ready for Operations</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
