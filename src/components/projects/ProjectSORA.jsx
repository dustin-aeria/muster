import { useState, useEffect, useCallback } from 'react'
import { 
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Target,
  Radar,
  FileCheck,
  Wrench,
  Users,
  Eye,
  Globe,
  Box,
  RefreshCw,
  Download,
  Calculator,
  Plane,
  MapPin,
  Gauge,
  Link2,
  ExternalLink,
  Radio,
  Zap,
  Layers
} from 'lucide-react'

// Import SORA configuration
import {
  populationCategories,
  uaCharacteristics,
  arcLevels,
  tmprDefinitions,
  sailColors,
  sailDescriptions,
  robustnessLevels,
  osoDefinitions,
  osoCategories,
  getIntrinsicGRC,
  calculateFinalGRC,
  isWithinSORAScope,
  calculateResidualARC,
  getSAIL,
  calculateAdjacentAreaDistance,
  getContainmentRequirement,
  checkOSOCompliance
} from '../../lib/soraConfig'

// ============================================
// OSO SAIL-LEVEL GUIDANCE (SORA 2.5 - 17 OSOs)
// ============================================
const osoGuidance = {
  'OSO-01': { L: 'Operator demonstrates basic competency', M: 'Formal competency assessment', H: 'Third-party competency verification' },
  'OSO-02': { L: 'Manufacturer has quality procedures', M: 'Conformance evidence maintained', H: 'Third-party manufacturing audit' },
  'OSO-03': { L: 'Maintenance per manufacturer instructions', M: 'Trained personnel with documented program', H: 'Quality system with independent inspections' },
  'OSO-04': { L: 'Design follows industry practices', M: 'Recognized standard (e.g., ASTM F3298)', H: 'Airworthiness design standard compliance' },
  'OSO-05': { L: 'Basic failure mode analysis', M: 'System safety assessment (FHA/FMEA)', H: 'Full safety assessment per ARP4761' },
  'OSO-06': { L: 'C2 link tested for environment', M: 'Link budget and interference assessment', H: 'Performance validated in all conditions' },
  'OSO-07': { L: 'Pre-flight checklist used', M: 'Documented inspection procedures', H: 'Formal program with independent verification' },
  'OSO-08': { L: 'Procedures documented and reviewed', M: 'Procedures validated through exercises', H: 'Procedures validated with audit trail' },
  'OSO-09': { L: 'Basic crew training', M: 'Formal training with proficiency checks', H: 'Certified training with recurrent testing' },
  'OSO-13': { L: 'External services identified', M: 'Service agreements in place', H: 'Validated service level agreements' },
  'OSO-16': { L: 'Crew roles defined', M: 'CRM principles applied', H: 'Formal CRM with team evaluation' },
  'OSO-17': { L: 'Self-declaration of fitness', M: 'Fatigue risk management', H: 'Medical certification with duty limits' },
  'OSO-18': { L: 'Basic envelope protection', M: 'Automatic envelope protection', H: 'Redundant protection with independent monitoring' },
  'OSO-19': { L: 'Recovery procedures documented', M: 'Recovery validated in simulation', H: 'Recovery validated in flight test' },
  'OSO-20': { L: 'Basic HMI suitable', M: 'HMI per human factors standards', H: 'Human factors evaluation completed' },
  'OSO-23': { L: 'Basic weather limits', M: 'Detailed envelope with monitoring', H: 'All conditions tested and validated' },
  'OSO-24': { L: 'Basic environmental protection', M: 'Designed for adverse conditions', H: 'Full environmental qualification' }
}

// ============================================
// HELPER: Get UA characteristic from aircraft
// ============================================
const getUACharacteristicFromAircraft = (aircraft) => {
  if (!aircraft || aircraft.length === 0) return '1m_25ms'
  const primary = aircraft.find(a => a.isPrimary) || aircraft[0]
  const speed = primary.maxSpeed || 25
  const dimension = primary.maxDimension || 1
  
  if (dimension <= 1 && speed <= 25) return '1m_25ms'
  if (dimension <= 3 && speed <= 35) return '3m_35ms'
  if (dimension <= 8 && speed <= 75) return '8m_75ms'
  if (dimension <= 20 && speed <= 120) return '20m_120ms'
  return '40m_200ms'
}

// ============================================
// HELPER: Map Site Survey population to SORA category
// ============================================
const mapPopulationCategory = (siteSurveyCategory) => {
  if (populationCategories[siteSurveyCategory]) return siteSurveyCategory
  
  const mapping = {
    'controlled': 'controlled',
    'remote': 'remote',
    'rural': 'lightly',
    'lightly_populated': 'lightly',
    'sparse': 'sparsely',
    'sparsely_populated': 'sparsely',
    'suburban': 'suburban',
    'urban': 'highdensity',
    'high_density': 'highdensity',
    'assembly': 'assembly',
    'crowd': 'assembly'
  }
  
  return mapping[siteSurveyCategory] || 'sparsely'
}

// ============================================
// HELPER: Calculate Suggested ARC per Figure 6
// ============================================
const calculateSuggestedARC = (altitudeAGL, airspaceType, isAirportEnv, isUrban) => {
  const altitudeFt = altitudeAGL * 3.28084
  
  if (airspaceType === 'atypical' || airspaceType === 'segregated') {
    return { arc: 'ARC-a', reason: 'Atypical/segregated airspace' }
  }
  
  if (altitudeFt > 60000) {
    return { arc: 'ARC-b', reason: 'Above FL600' }
  }
  
  if (isAirportEnv) {
    if (airspaceType === 'controlled' || airspaceType === 'class_b' || 
        airspaceType === 'class_c' || airspaceType === 'class_d') {
      return { arc: 'ARC-d', reason: 'Airport environment in controlled airspace' }
    }
    return { arc: 'ARC-c', reason: 'Airport environment' }
  }
  
  if (altitudeFt > 500) {
    if (airspaceType === 'mode_c_veil' || airspaceType === 'tmz') {
      return { arc: 'ARC-c', reason: 'Above 500ft AGL in Mode-C Veil/TMZ' }
    }
    if (airspaceType === 'controlled') {
      return { arc: 'ARC-d', reason: 'Above 500ft AGL in controlled airspace' }
    }
    if (isUrban) {
      return { arc: 'ARC-c', reason: 'Above 500ft AGL over urban area' }
    }
    return { arc: 'ARC-c', reason: 'Above 500ft AGL' }
  }
  
  if (airspaceType === 'mode_c_veil' || airspaceType === 'tmz') {
    return { arc: 'ARC-c', reason: 'Below 500ft AGL in Mode-C Veil/TMZ' }
  }
  if (airspaceType === 'controlled') {
    return { arc: 'ARC-c', reason: 'Below 500ft AGL in controlled airspace' }
  }
  if (isUrban) {
    return { arc: 'ARC-c', reason: 'Below 500ft AGL over urban area' }
  }
  
  return { arc: 'ARC-b', reason: 'Below 500ft AGL in uncontrolled airspace over rural area' }
}

// ============================================
// DATA SOURCES PANEL
// ============================================
function DataSourcesPanel({ siteSurvey, flightPlan, sora, onNavigateToSection, onSync, hasMismatch, siteName }) {
  const hasPopulation = siteSurvey?.population?.category
  const hasAirspace = siteSurvey?.airspace?.classification
  const hasAircraft = flightPlan?.aircraft?.length > 0
  const hasOperationType = flightPlan?.operationType
  const hasAltitude = flightPlan?.maxAltitudeAGL

  const primaryAircraft = flightPlan?.aircraft?.find(a => a.isPrimary) || flightPlan?.aircraft?.[0]

  const dataComplete = hasPopulation && hasAirspace && hasAircraft

  return (
    <div className={`card border-2 ${dataComplete ? 'border-green-200 bg-green-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-600" />
          Data Sources
          {siteName && <span className="text-sm font-normal text-gray-500">— {siteName}</span>}
          {dataComplete ? (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Auto-populated
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Incomplete
            </span>
          )}
        </h2>
        {hasMismatch && (
          <button
            onClick={onSync}
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Now
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-3 rounded-lg border ${hasPopulation ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className={`w-4 h-4 ${hasPopulation ? 'text-green-600' : 'text-amber-600'}`} />
              <span className="text-sm font-medium text-gray-700">Population</span>
            </div>
            <span className="text-xs text-gray-500">Site Survey</span>
          </div>
          {hasPopulation ? (
            <p className="text-sm font-medium text-gray-900">
              {populationCategories[siteSurvey.population.category]?.label || siteSurvey.population.category}
            </p>
          ) : (
            <p className="text-sm text-amber-700">Not set</p>
          )}
          {onNavigateToSection && (
            <button
              onClick={() => onNavigateToSection('siteSurvey')}
              className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Edit
            </button>
          )}
        </div>

        <div className={`p-3 rounded-lg border ${hasAirspace ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${hasAirspace ? 'text-green-600' : 'text-amber-600'}`} />
              <span className="text-sm font-medium text-gray-700">Airspace</span>
            </div>
            <span className="text-xs text-gray-500">Site Survey</span>
          </div>
          {hasAirspace ? (
            <p className="text-sm font-medium text-gray-900">
              Class {siteSurvey.airspace.classification}
            </p>
          ) : (
            <p className="text-sm text-amber-700">Not set</p>
          )}
          {onNavigateToSection && (
            <button
              onClick={() => onNavigateToSection('siteSurvey')}
              className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Edit
            </button>
          )}
        </div>

        <div className={`p-3 rounded-lg border ${hasAircraft ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Plane className={`w-4 h-4 ${hasAircraft ? 'text-green-600' : 'text-amber-600'}`} />
              <span className="text-sm font-medium text-gray-700">Aircraft</span>
            </div>
            <span className="text-xs text-gray-500">Flight Plan</span>
          </div>
          {hasAircraft && primaryAircraft ? (
            <div>
              <p className="text-sm font-medium text-gray-900">{primaryAircraft.nickname || primaryAircraft.model}</p>
              <p className="text-xs text-gray-500">{primaryAircraft.maxSpeed || 25} m/s • {primaryAircraft.maxDimension || 1}m</p>
            </div>
          ) : (
            <p className="text-sm text-amber-700">Not selected</p>
          )}
          {onNavigateToSection && (
            <button
              onClick={() => onNavigateToSection('flightPlan')}
              className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Edit
            </button>
          )}
        </div>

        <div className={`p-3 rounded-lg border ${hasOperationType ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className={`w-4 h-4 ${hasOperationType ? 'text-green-600' : 'text-amber-600'}`} />
              <span className="text-sm font-medium text-gray-700">Operation</span>
            </div>
            <span className="text-xs text-gray-500">Flight Plan</span>
          </div>
          {hasOperationType ? (
            <div>
              <p className="text-sm font-medium text-gray-900">{flightPlan.operationType}</p>
              <p className="text-xs text-gray-500">{hasAltitude ? `${flightPlan.maxAltitudeAGL}m AGL` : ''}</p>
            </div>
          ) : (
            <p className="text-sm text-amber-700">Not set</p>
          )}
          {onNavigateToSection && (
            <button
              onClick={() => onNavigateToSection('flightPlan')}
              className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Edit
            </button>
          )}
        </div>
      </div>

      {!dataComplete && (
        <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Tip:</strong> Complete the Site Survey and Flight Plan for automatic SORA data population. 
            This ensures consistent data across all assessments.
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================
// VALIDATION STATUS COMPONENT
// ============================================
const ValidationStatus = ({ sail, osoCompliance, containmentCompliant, outsideScope }) => {
  if (outsideScope) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-800">
          <XCircle className="w-5 h-5" />
          <span className="font-medium">Outside SORA Scope - Certified Category Required</span>
        </div>
        <p className="text-sm text-red-700 mt-1">
          Consider different operational parameters or certified category operations.
        </p>
      </div>
    )
  }

  const osoGaps = osoDefinitions.filter(oso => {
    const compliance = checkOSOCompliance(oso, sail, osoCompliance?.[oso.id]?.robustness || 'none')
    return !compliance.compliant && oso.requirements[sail] !== 'O'
  })

  const isCompliant = osoGaps.length === 0 && containmentCompliant

  return (
    <div className={`p-4 rounded-lg ${isCompliant ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
      <div className="flex items-center gap-2">
        {isCompliant ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">All Requirements Met</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-800">
              {osoGaps.length} OSO Gap{osoGaps.length !== 1 ? 's' : ''}{!containmentCompliant ? ' + Containment' : ''}
            </span>
          </>
        )}
      </div>
      {!isCompliant && (
        <p className="text-sm text-amber-700 mt-1">
          Review OSO compliance and containment requirements below.
        </p>
      )}
    </div>
  )
}

// ============================================
// OSO ROW COMPONENT
// ============================================
const OSORow = ({ oso, sail, osoData, onUpdate, expanded, onToggleExpand }) => {
  const required = oso.requirements[sail]
  const compliance = checkOSOCompliance(oso, sail, osoData?.robustness || 'none')
  const guidance = osoGuidance[oso.id]

  if (required === 'O') {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">{oso.id}</span>
            <span className="text-sm text-gray-500">{oso.name}</span>
          </div>
          <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">Optional</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-3 rounded-lg border ${compliance.compliant ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-300'}`}>
      <button 
        onClick={onToggleExpand}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {compliance.compliant ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-sm font-medium text-gray-900">{oso.id}</span>
            <span className="text-sm text-gray-600">{oso.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs rounded ${
              required === 'H' ? 'bg-red-100 text-red-700' :
              required === 'M' ? 'bg-amber-100 text-amber-700' :
              'bg-green-100 text-green-700'
            }`}>
              Required: {required}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <p className="text-sm text-gray-600">{oso.description}</p>
          
          {guidance && (
            <div className="p-2 bg-blue-50 rounded text-sm">
              <p className="text-blue-800">
                <strong>{required} Level:</strong> {guidance[required]}
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Achieved Robustness</label>
              <select
                value={osoData?.robustness || 'none'}
                onChange={(e) => onUpdate('robustness', e.target.value)}
                className={`input text-sm ${!compliance.compliant ? 'border-amber-300' : ''}`}
              >
                {robustnessLevels.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Evidence / Notes</label>
              <input
                type="text"
                value={osoData?.evidence || ''}
                onChange={(e) => onUpdate('evidence', e.target.value)}
                className="input text-sm"
                placeholder="Reference documents, procedures..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// GENERATE SORA REPORT
// ============================================
const generateSORAReport = (project, sora, calculations, siteName) => {
  const { intrinsicGRC, finalGRC, residualARC, sail, adjacentDistance, osoGapCount, requiredContainment } = calculations
  
  let report = `SORA 2.5 ASSESSMENT REPORT
Generated: ${new Date().toISOString()}
Project: ${project.name || 'Unnamed Project'}
${siteName ? `Site: ${siteName}` : ''}

====================================
SUMMARY
====================================
Intrinsic GRC: ${intrinsicGRC}
Final GRC: ${finalGRC}
Initial ARC: ${sora.initialARC || 'ARC-b'}
Residual ARC: ${residualARC}
SAIL: ${sail}
OSO Gaps: ${osoGapCount}
Containment Required: ${requiredContainment}

====================================
CONOPS
====================================
Operation Type: ${sora.operationType || 'VLOS'}
Max Altitude AGL: ${sora.maxAltitudeAGL || 120}m
Population Category: ${sora.populationCategory || 'sparsely'}
UA Characteristic: ${sora.uaCharacteristic || '1m_25ms'}

====================================
MITIGATIONS
====================================
`

  const mitigations = sora.mitigations || {}
  Object.entries(mitigations).forEach(([key, mit]) => {
    if (mit.enabled) {
      report += `${key}: ${mit.robustness} - ${mit.evidence || 'No evidence provided'}\n`
    }
  })

  report += `
====================================
OSO COMPLIANCE (SAIL ${sail})
====================================
`

  osoDefinitions.forEach(oso => {
    const required = oso.requirements[sail]
    const achieved = sora.osoCompliance?.[oso.id]?.robustness || 'none'
    const compliance = checkOSOCompliance(oso, sail, achieved)
    report += `${oso.id}: Required ${required}, Achieved ${achieved} - ${compliance.compliant ? 'COMPLIANT' : 'GAP'}\n`
  })

  return report
}

// ============================================
// SITE SELECTOR COMPONENT
// ============================================
function SiteSelector({ sites, activeSiteIndex, onSelectSite }) {
  if (!sites || sites.length <= 1) return null

  const sitesWithSora = sites.filter(s => s.includeFlightPlan !== false)

  if (sitesWithSora.length <= 1) return null

  return (
    <div className="card bg-gradient-to-r from-purple-50 to-white">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-gray-700">Site:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sites.map((site, index) => {
            if (site.includeFlightPlan === false) return null
            return (
              <button
                key={site.id}
                onClick={() => onSelectSite(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSiteIndex === index
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300'
                }`}
              >
                {site.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectSORA({ project, onUpdate, onNavigateToSection }) {
  const [activeSiteIndex, setActiveSiteIndex] = useState(0)
  const [expandedSections, setExpandedSections] = useState({
    dataSources: true,
    conops: true,
    groundRisk: true,
    airRisk: true,
    containment: true,
    oso: false
  })
  const [expandedOsos, setExpandedOsos] = useState({})
  const [initialized, setInitialized] = useState(false)

  // Guard clause for loading state
  if (!project) return <div className="p-4 text-gray-500">Loading...</div>

  // ============================================
  // MULTI-SITE SUPPORT
  // ============================================
  const sites = project.sites || []
  const useLegacy = sites.length === 0
  
  // Get sites with flight plans (SORA applicable)
  const sitesWithSora = useLegacy ? [] : sites.filter(s => s.includeFlightPlan !== false)
  
  // Ensure valid active site index
  const validIndex = Math.min(activeSiteIndex, Math.max(0, sitesWithSora.length - 1))
  const activeSite = useLegacy ? null : sitesWithSora[validIndex]
  
  // ============================================
  // DATA FROM FLIGHT PLAN AND SITE SURVEY
  // ============================================
  const flightPlan = useLegacy 
    ? (project.flightPlan || {})
    : (activeSite?.flightPlan || {})
  
  const siteSurvey = useLegacy 
    ? (project.siteSurvey || {})
    : (activeSite?.siteSurvey || {})
  
  const siteName = useLegacy ? null : activeSite?.name
  
  // Flight Plan data
  const fpAircraft = flightPlan.aircraft || []
  const fpOperationType = flightPlan.operationType || 'VLOS'
  const fpMaxAltitude = flightPlan.maxAltitudeAGL || 120
  const fpGroundAreaType = flightPlan.groundAreaType
  
  // Primary aircraft
  const primaryAircraft = fpAircraft.find(a => a.isPrimary) || fpAircraft[0]
  const fpMaxSpeed = primaryAircraft?.maxSpeed || 25
  
  // Site Survey data - Population
  const ssPopulation = siteSurvey.population?.category
  const ssAdjacentPopulation = siteSurvey.population?.adjacentCategory
  
  // Site Survey data - Airspace (for ARC calculation per Figure 6)
  const ssAirspaceClass = siteSurvey.airspace?.classification || 'G'
  const ssNearbyAerodromes = siteSurvey.airspace?.nearbyAerodromes || []
  const ssIsAirportEnv = ssNearbyAerodromes.length > 0 || siteSurvey.nearAirport || siteSurvey.airspace?.nearAerodrome || false
  const ssIsUrban = ['suburban', 'highdensity', 'urban', 'assembly'].includes(
    ssPopulation || fpGroundAreaType || ''
  )
  
  // Map airspace classification to ARC-relevant type
  const ssAirspaceType = (() => {
    const cls = ssAirspaceClass.toUpperCase()
    if (cls === 'A' || cls === 'B' || cls === 'C' || cls === 'D') return 'controlled'
    if (cls === 'E') return 'controlled'
    if (cls === 'G') return 'uncontrolled'
    return 'uncontrolled'
  })()
  
  // Derived values
  const derivedPopulation = mapPopulationCategory(ssPopulation || fpGroundAreaType || 'sparsely')
  const derivedAdjacentPopulation = mapPopulationCategory(ssAdjacentPopulation || derivedPopulation)
  const derivedUACharacteristic = getUACharacteristicFromAircraft(fpAircraft)
  
  // Calculate suggested ARC based on Figure 6
  const suggestedARC = calculateSuggestedARC(
    fpMaxAltitude,
    ssAirspaceType,
    ssIsAirportEnv,
    ssIsUrban
  )

  // ============================================
  // GET/SET SORA DATA (multi-site aware)
  // ============================================
  const getSora = () => {
    if (useLegacy) {
      return project.soraAssessment || {}
    }
    return activeSite?.sora || {}
  }

  const sora = getSora()

  // ============================================
  // INITIALIZE SORA DATA
  // ============================================
  useEffect(() => {
    if (initialized) return

    const currentSora = getSora()
    if (!currentSora || Object.keys(currentSora).length === 0) {
      setInitialized(true)
      const initialOsoCompliance = {}
      osoDefinitions.forEach(oso => {
        initialOsoCompliance[oso.id] = { robustness: 'none', evidence: '' }
      })

      const initialSora = {
        operationType: fpOperationType,
        maxAltitudeAGL: fpMaxAltitude,
        populationCategory: derivedPopulation,
        uaCharacteristic: derivedUACharacteristic,
        maxSpeed: fpMaxSpeed,
        populationSource: ssPopulation ? 'siteSurvey' : 'manual',
        aircraftSource: fpAircraft.length > 0 ? 'flightPlan' : 'manual',
        mitigations: {
          M1A: { enabled: false, robustness: 'none', evidence: '' },
          M1B: { enabled: false, robustness: 'none', evidence: '' },
          M1C: { enabled: false, robustness: 'none', evidence: '' },
          M2: { enabled: false, robustness: 'none', evidence: '' }
        },
        initialARC: suggestedARC.arc,
        tmpr: { enabled: true, type: fpOperationType, robustness: 'low', evidence: '' },
        adjacentAreaPopulation: derivedAdjacentPopulation,
        containment: { method: '', robustness: 'none', evidence: '' },
        osoCompliance: initialOsoCompliance,
        lastUpdated: new Date().toISOString(),
        version: '2.5'
      }

      if (useLegacy) {
        onUpdate({ soraAssessment: initialSora })
      } else {
        const newSites = [...project.sites]
        const siteIdx = sites.findIndex(s => s.id === activeSite?.id)
        if (siteIdx >= 0) {
          newSites[siteIdx] = { ...newSites[siteIdx], sora: initialSora }
          onUpdate({ sites: newSites })
        }
      }
    } else {
      setInitialized(true)
    }
  }, [initialized, activeSiteIndex])

  // ============================================
  // UPDATE FUNCTIONS
  // ============================================
  const updateSora = useCallback((updates) => {
    const newSora = {
      ...getSora(),
      ...updates,
      lastUpdated: new Date().toISOString()
    }

    if (useLegacy) {
      onUpdate({ soraAssessment: newSora })
    } else {
      const newSites = [...project.sites]
      const siteIdx = sites.findIndex(s => s.id === activeSite?.id)
      if (siteIdx >= 0) {
        newSites[siteIdx] = { ...newSites[siteIdx], sora: newSora }
        onUpdate({ sites: newSites })
      }
    }
  }, [useLegacy, project.sites, activeSite?.id, onUpdate])

  const updateMitigation = (mitId, field, value) => {
    updateSora({
      mitigations: {
        ...(sora.mitigations || {}),
        [mitId]: {
          ...(sora.mitigations?.[mitId] || {}),
          [field]: value
        }
      }
    })
  }

  const updateTmpr = (updates) => {
    updateSora({
      tmpr: { ...(sora.tmpr || {}), ...updates }
    })
  }

  const updateContainment = (updates) => {
    updateSora({
      containment: { ...(sora.containment || {}), ...updates }
    })
  }

  const updateOso = (osoId, field, value) => {
    updateSora({
      osoCompliance: {
        ...(sora.osoCompliance || {}),
        [osoId]: {
          ...(sora.osoCompliance?.[osoId] || {}),
          [field]: value
        }
      }
    })
  }

  // ============================================
  // SYNC FROM FLIGHT PLAN / SITE SURVEY
  // ============================================
  const syncFromSources = () => {
    const updates = {}
    
    if (ssPopulation) {
      updates.populationCategory = derivedPopulation
      updates.populationSource = 'siteSurvey'
    }
    if (ssAdjacentPopulation) {
      updates.adjacentAreaPopulation = derivedAdjacentPopulation
    }
    if (fpAircraft.length > 0) {
      updates.uaCharacteristic = derivedUACharacteristic
      updates.maxSpeed = fpMaxSpeed
      updates.aircraftSource = 'flightPlan'
    }
    if (fpOperationType) {
      updates.operationType = fpOperationType
      updates.tmpr = { ...(sora.tmpr || {}), type: fpOperationType }
    }
    if (fpMaxAltitude) {
      updates.maxAltitudeAGL = fpMaxAltitude
      updates.initialARC = suggestedARC.arc
    }
    
    if (Object.keys(updates).length > 0) {
      updateSora(updates)
    }
  }

  // Check for mismatches
  const hasMismatch = (
    (ssPopulation && derivedPopulation !== sora.populationCategory) ||
    (fpMaxSpeed && fpMaxSpeed !== sora.maxSpeed) ||
    (fpOperationType && fpOperationType !== sora.operationType) ||
    (fpMaxAltitude && fpMaxAltitude !== sora.maxAltitudeAGL) ||
    (sora.initialARC !== suggestedARC.arc)
  )

  // ============================================
  // CALCULATIONS
  // ============================================
  const intrinsicGRC = getIntrinsicGRC(
    sora.populationCategory || 'sparsely',
    sora.uaCharacteristic || '1m_25ms'
  )
  const finalGRC = calculateFinalGRC(intrinsicGRC, sora.mitigations || {})
  const residualARC = calculateResidualARC(sora.initialARC || 'ARC-b', sora.tmpr)
  const sail = getSAIL(finalGRC, residualARC) || 'II'
  const outsideScope = intrinsicGRC === null || intrinsicGRC > 7 || finalGRC > 7
  const adjacentDistance = calculateAdjacentAreaDistance(sora.maxSpeed || 25)
  const requiredContainment = getContainmentRequirement(sora.adjacentAreaPopulation || 'sparsely', sail)
  
  const osoGapCount = osoDefinitions.filter(oso => {
    const compliance = checkOSOCompliance(oso, sail, sora.osoCompliance?.[oso.id]?.robustness || 'none')
    return !compliance.compliant && oso.requirements[sail] !== 'O'
  }).length

  const containmentCompliant = (() => {
    const levels = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3 }
    return (levels[sora.containment?.robustness] || 0) >= (levels[requiredContainment] || 0)
  })()

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleExport = () => {
    const report = generateSORAReport(project, sora, {
      intrinsicGRC, finalGRC, residualARC, sail, adjacentDistance, osoGapCount, requiredContainment
    }, siteName)
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SORA_${project.name || 'Assessment'}${siteName ? '_' + siteName : ''}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Site Selector */}
      <SiteSelector
        sites={sites}
        activeSiteIndex={validIndex}
        onSelectSite={setActiveSiteIndex}
      />

      {/* Data Sources Panel */}
      <DataSourcesPanel
        siteSurvey={siteSurvey}
        flightPlan={flightPlan}
        sora={sora}
        onNavigateToSection={onNavigateToSection}
        onSync={syncFromSources}
        hasMismatch={hasMismatch}
        siteName={siteName}
      />

      {/* Header */}
      <div className="card bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            SORA 2.5 Assessment
            {siteName && <span className="text-sm font-normal text-gray-500">— {siteName}</span>}
          </h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              JARUS SORA 2.5
            </span>
            <button
              onClick={handleExport}
              className="btn btn-secondary text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {outsideScope ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Outside SORA Scope</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              GRC exceeds maximum. Consider certified category or different parameters.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
                <p className="text-xs text-gray-500 mb-1">Intrinsic GRC</p>
                <p className="text-2xl font-bold text-gray-400">{intrinsicGRC}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
                <p className="text-xs text-gray-500 mb-1">Final GRC</p>
                <p className="text-2xl font-bold text-gray-900">{finalGRC}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
                <p className="text-xs text-gray-500 mb-1">Initial ARC</p>
                <p className="text-lg font-bold text-gray-400">{sora.initialARC || 'ARC-b'}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm border">
                <p className="text-xs text-gray-500 mb-1">Residual ARC</p>
                <p className="text-lg font-bold text-gray-900">{residualARC}</p>
              </div>
              <div className={`text-center p-3 rounded-lg shadow-sm ${sailColors[sail]}`}>
                <p className="text-xs opacity-75 mb-1">SAIL</p>
                <p className="text-2xl font-bold">{sail}</p>
              </div>
            </div>

            <ValidationStatus 
              sail={sail}
              osoCompliance={sora.osoCompliance}
              containmentCompliant={containmentCompliant}
              outsideScope={outsideScope}
            />
          </>
        )}
      </div>

      {/* ConOps (Step 1) */}
      <div className="card">
        <button
          onClick={() => toggleSection('conops')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-500" />
            Step 1: ConOps Description
            {sora.aircraftSource === 'flightPlan' && (
              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">From Flight Plan</span>
            )}
          </h3>
          {expandedSections.conops ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.conops && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Operation Type</label>
                <select
                  value={sora.operationType || 'VLOS'}
                  onChange={(e) => updateSora({ operationType: e.target.value })}
                  className="input"
                >
                  <option value="VLOS">VLOS - Visual Line of Sight</option>
                  <option value="EVLOS">EVLOS - Extended Visual Line of Sight</option>
                  <option value="BVLOS">BVLOS - Beyond Visual Line of Sight</option>
                </select>
              </div>
              <div>
                <label className="label">Max Altitude AGL (m)</label>
                <input
                  type="number"
                  value={sora.maxAltitudeAGL || 120}
                  onChange={(e) => updateSora({ maxAltitudeAGL: parseInt(e.target.value) })}
                  className="input"
                  min="0"
                  max="1000"
                />
              </div>
            </div>
            
            {primaryAircraft && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Primary Aircraft:</strong> {primaryAircraft.nickname || primaryAircraft.model} 
                  <span className="text-gray-500 ml-2">
                    ({primaryAircraft.maxDimension || 1}m, {primaryAircraft.maxSpeed || 25} m/s)
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ground Risk (Steps 2-3) */}
      {!outsideScope && (
        <div className="card">
          <button
            onClick={() => toggleSection('groundRisk')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              Steps 2-3: Ground Risk
              {sora.populationSource === 'siteSurvey' && (
                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">From Site Survey</span>
              )}
            </h3>
            {expandedSections.groundRisk ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.groundRisk && (
            <div className="mt-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Population Category (Overflown Area)</label>
                  <select
                    value={sora.populationCategory || 'sparsely'}
                    onChange={(e) => updateSora({ populationCategory: e.target.value })}
                    className="input"
                  >
                    {Object.entries(populationCategories).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">UA Characteristic</label>
                  <select
                    value={sora.uaCharacteristic || '1m_25ms'}
                    onChange={(e) => updateSora({ uaCharacteristic: e.target.value })}
                    className="input"
                  >
                    {Object.entries(uaCharacteristics).map(([key, ua]) => (
                      <option key={key} value={key}>{ua.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-800">Intrinsic GRC (Table 2)</span>
                  <span className="text-2xl font-bold text-orange-700">{intrinsicGRC}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Mitigations (SORA 2.5)</h4>
                <div className="space-y-3">
                  {['M1A', 'M1B', 'M1C', 'M2'].map(mitId => {
                    const mit = sora.mitigations?.[mitId] || {}
                    const mitLabels = {
                      M1A: 'M1A - Strategic Ground Risk Mitigation',
                      M1B: 'M1B - Operational Ground Risk Mitigation',
                      M1C: 'M1C - Emergency Response Plan',
                      M2: 'M2 - Effects Reduction (Parachute, etc.)'
                    }
                    return (
                      <div key={mitId} className="p-3 bg-gray-50 rounded-lg border">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mit.enabled || false}
                            onChange={(e) => updateMitigation(mitId, 'enabled', e.target.checked)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="font-medium text-sm">{mitLabels[mitId]}</span>
                        </label>
                        {mit.enabled && (
                          <div className="mt-3 grid sm:grid-cols-2 gap-2 pl-7">
                            <select
                              value={mit.robustness || 'none'}
                              onChange={(e) => updateMitigation(mitId, 'robustness', e.target.value)}
                              className="input text-sm"
                            >
                              {robustnessLevels.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={mit.evidence || ''}
                              onChange={(e) => updateMitigation(mitId, 'evidence', e.target.value)}
                              className="input text-sm"
                              placeholder="Evidence / Reference"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">Final GRC (after mitigations)</span>
                  <span className="text-2xl font-bold text-green-700">{finalGRC}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Air Risk (Steps 4-6) */}
      {!outsideScope && (
        <div className="card">
          <button
            onClick={() => toggleSection('airRisk')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Radar className="w-5 h-5 text-blue-500" />
              Steps 4-6: Air Risk
            </h3>
            {expandedSections.airRisk ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.airRisk && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Initial ARC (from Figure 6)</label>
                <div className="flex items-center gap-3">
                  <select
                    value={sora.initialARC || 'ARC-b'}
                    onChange={(e) => updateSora({ initialARC: e.target.value })}
                    className="input flex-1"
                  >
                    {Object.entries(arcLevels).map(([key, arc]) => (
                      <option key={key} value={key}>{key} - {arc.description}</option>
                    ))}
                  </select>
                  <div className="p-2 bg-blue-50 rounded text-xs text-blue-700">
                    Suggested: {suggestedARC.arc}
                    <span className="block text-blue-500">{suggestedARC.reason}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sora.tmpr?.enabled !== false}
                    onChange={(e) => updateTmpr({ enabled: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="font-medium text-sm">TMPR - Tactical Mitigation Performance Requirement</span>
                </label>
                {sora.tmpr?.enabled !== false && (
                  <div className="mt-3 grid sm:grid-cols-2 gap-2 pl-7">
                    <select
                      value={sora.tmpr?.robustness || 'low'}
                      onChange={(e) => updateTmpr({ robustness: e.target.value })}
                      className="input text-sm"
                    >
                      {robustnessLevels.filter(r => r.value !== 'none').map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={sora.tmpr?.evidence || ''}
                      onChange={(e) => updateTmpr({ evidence: e.target.value })}
                      className="input text-sm"
                      placeholder="Evidence / Reference"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Residual ARC</span>
                  <span className="text-2xl font-bold text-blue-700">{residualARC}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Containment (Step 8) */}
      {!outsideScope && (
        <div className="card">
          <button
            onClick={() => toggleSection('containment')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Box className="w-5 h-5 text-purple-500" />
              Step 8: Adjacent Area / Containment
              {!containmentCompliant && (
                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">Gap</span>
              )}
            </h3>
            {expandedSections.containment ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.containment && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Adjacent Area Population</label>
                <select
                  value={sora.adjacentAreaPopulation || 'sparsely'}
                  onChange={(e) => updateSora({ adjacentAreaPopulation: e.target.value })}
                  className="input"
                >
                  {Object.entries(populationCategories).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-gray-500 mb-1">Adjacent Distance</p>
                    <p className="text-lg font-semibold text-gray-900">{(adjacentDistance / 1000).toFixed(1)} km</p>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-gray-500 mb-1">Required Robustness</p>
                    <p className={`text-lg font-semibold ${
                      requiredContainment === 'high' ? 'text-red-600' :
                      requiredContainment === 'medium' ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {requiredContainment.charAt(0).toUpperCase() + requiredContainment.slice(1)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Actual Robustness:</label>
                  <select
                    value={sora.containment?.robustness || 'none'}
                    onChange={(e) => updateContainment({ robustness: e.target.value })}
                    className={`input text-sm w-32 ${!containmentCompliant ? 'border-red-300 bg-red-50' : ''}`}
                  >
                    {robustnessLevels.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {containmentCompliant ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              <div>
                <label className="label">Containment Method / Evidence</label>
                <textarea
                  value={sora.containment?.evidence || ''}
                  onChange={(e) => updateContainment({ evidence: e.target.value })}
                  className="input min-h-[80px]"
                  placeholder="Describe containment means (geofencing, procedures, etc.)..."
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* OSO Compliance (Step 9) */}
      {!outsideScope && (
        <div className="card">
          <button
            onClick={() => toggleSection('oso')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-500" />
              Step 9: OSO Compliance
              {osoGapCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">{osoGapCount} Gap{osoGapCount > 1 ? 's' : ''}</span>
              )}
            </h3>
            {expandedSections.oso ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.oso && (
            <div className="mt-4 space-y-6">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>SAIL {sail}</strong> requirements shown. Click to expand for guidance.
                </p>
              </div>

              {Object.entries(osoCategories).map(([catKey, catInfo]) => {
                const categoryOsos = osoDefinitions.filter(oso => oso.category === catKey)
                const CategoryIcon = {
                  technical: Wrench,
                  external: Globe,
                  human: Users,
                  operating: Eye,
                  air: Radar
                }[catKey] || Shield

                return (
                  <div key={catKey}>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <CategoryIcon className="w-4 h-4" />
                      {catInfo.label}
                    </h4>
                    <div className="space-y-2">
                      {categoryOsos.map(oso => (
                        <OSORow
                          key={oso.id}
                          oso={oso}
                          sail={sail}
                          osoData={sora.osoCompliance?.[oso.id]}
                          onUpdate={(field, value) => updateOso(oso.id, field, value)}
                          expanded={expandedOsos[oso.id] || false}
                          onToggleExpand={() => setExpandedOsos(prev => ({ ...prev, [oso.id]: !prev[oso.id] }))}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
