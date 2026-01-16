import { useState, useEffect, useMemo } from 'react'
import { 
  AlertTriangle, 
  Plus,
  Trash2,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Target,
  Radar,
  FileCheck,
  Wrench,
  GraduationCap,
  Users,
  Eye,
  MapPin,
  Zap,
  Globe,
  Brain,
  Box,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileText,
  Calculator
} from 'lucide-react'

// Import SORA configuration
import {
  populationCategories,
  uaCharacteristics,
  intrinsicGRCMatrix,
  groundMitigations,
  arcLevels,
  tmprDefinitions,
  sailMatrix,
  sailColors,
  sailDescriptions,
  containmentRobustness,
  calculateAdjacentAreaDistance,
  osoDefinitions,
  osoCategories,
  robustnessLevels,
  getIntrinsicGRC,
  calculateFinalGRC as calcFinalGRC,
  calculateResidualARC as calcResidualARC,
  getSAIL,
  checkOSOCompliance,
  getContainmentRequirement
} from '../../lib/soraConfig'

// ============================================
// OSO SAIL-LEVEL GUIDANCE TEXT
// Provides specific guidance for what each SAIL level requires
// ============================================
const osoGuidance = {
  'OSO-01': {
    description: 'Operational procedures are defined, validated & adhered to',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Procedures exist and are documented. Basic validation through review.',
      'M': 'Medium: Procedures validated through table-top exercises or simulation. Evidence of adherence through checklists.',
      'H': 'High: Procedures validated through flight testing. Formal adherence verification with audit trail.'
    }
  },
  'OSO-02': {
    description: 'UAS manufactured by competent and/or proven entity',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Manufacturer has documented quality management procedures.',
      'M': 'Medium: Evidence each UAS manufactured in conformance with design. Quality records maintained.',
      'H': 'High: Manufacturing verified through third-party audit. Full traceability.'
    }
  },
  'OSO-03': {
    description: 'UAS maintained by competent and/or proven entity',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Maintenance performed per manufacturer instructions. Basic logs kept.',
      'M': 'Medium: Maintenance by trained personnel. Documented maintenance program.',
      'H': 'High: Maintenance organization with formal quality system. Independent inspections.'
    }
  },
  'OSO-04': {
    description: 'UAS developed to design standards',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Design follows industry practices. Basic documentation.',
      'M': 'Medium: Design per recognized standard (e.g., ASTM F3298). Design review completed.',
      'H': 'High: Airworthiness Design Standard compliance. Type certification or equivalent.'
    }
  },
  'OSO-05': {
    description: 'UAS designed considering system safety and reliability',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Basic failure mode analysis. Single points of failure identified.',
      'M': 'Medium: System safety assessment (FHA/FMEA). Reliability targets defined.',
      'H': 'High: Full safety assessment per ARP4761 or equivalent. Demonstrated reliability.'
    }
  },
  'OSO-06': {
    description: 'C3 link performance adequate for operation',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: C2 link tested for intended environment. Basic range verification.',
      'M': 'Medium: Link budget analysis. Interference assessment. Documented performance.',
      'H': 'High: Link performance validated in all conditions. Redundancy or protected spectrum.'
    }
  },
  'OSO-07': {
    description: 'Inspection of UAS to ensure safe condition',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Pre-flight inspection checklist used. Visual inspection before each flight.',
      'M': 'Medium: Documented inspection procedures. Component life tracking.',
      'H': 'High: Formal inspection program. Independent verification of critical items.'
    }
  },
  'OSO-08': {
    description: 'Operational procedures for loss of C2 link',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Lost link procedure defined (RTH, land, loiter). Crew trained.',
      'M': 'Medium: Lost link tested and validated. Multiple contingency options.',
      'H': 'High: Automated lost link response validated in flight test. Fail-safe demonstrated.'
    }
  },
  'OSO-09': {
    description: 'Procedures in place for remote crew',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Crew roles defined. Basic operating procedures documented.',
      'M': 'Medium: Detailed crew procedures. Handover protocols. Crew coordination trained.',
      'H': 'High: CRM training. Formal crew qualification. Recurrent training program.'
    }
  },
  'OSO-10': {
    description: 'Safe recovery from technical issue',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Emergency procedures for common failures. Crew awareness.',
      'M': 'Medium: Emergency procedures validated. Flight termination available.',
      'H': 'High: Automated recovery systems. Redundant flight termination. Validated in test.'
    }
  },
  'OSO-11': {
    description: 'Procedures for communication, coordination and handover',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Communication procedures documented. ATC coordination as required.',
      'M': 'Medium: Standardized phraseology. Handover checklists. Backup communication.',
      'H': 'High: Formal coordination agreements. Recorded communications. Tested procedures.'
    }
  },
  'OSO-12': {
    description: 'Remote crew trained for normal procedures',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Basic flight training. Familiarization with UAS type.',
      'M': 'Medium: Formal training program. Type-specific training. Proficiency checks.',
      'H': 'High: Certified training organization. Recurrent training. Competency assessment.'
    }
  },
  'OSO-13': {
    description: 'Remote crew trained for emergency procedures',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Emergency procedures briefed. Basic abnormal operations training.',
      'M': 'Medium: Simulator or hands-on emergency training. Demonstrated competency.',
      'H': 'High: Regular emergency drills. Validated crew response. Recurrent testing.'
    }
  },
  'OSO-14': {
    description: 'Multi-crew coordination (if applicable)',
    guidance: {
      'O': 'Optional - No specific requirement (or single pilot ops)',
      'L': 'Low: Roles and responsibilities defined. Basic coordination procedures.',
      'M': 'Medium: CRM principles applied. Crew coordination training.',
      'H': 'High: Formal CRM training. Team performance evaluation. Standardized procedures.'
    }
  },
  'OSO-15': {
    description: 'Fitness of remote crew',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Self-declaration of fitness. Rest requirements defined.',
      'M': 'Medium: Fatigue risk management. Documented fitness assessment.',
      'H': 'High: Medical certification. Duty time limitations. Fatigue monitoring.'
    }
  },
  'OSO-16': {
    description: 'HMI adequate for operation',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Basic GCS suitable for operation. Essential information displayed.',
      'M': 'Medium: HMI designed per standards. Alerts and warnings appropriate.',
      'H': 'High: HMI validated through human factors assessment. Crew workload evaluated.'
    }
  },
  'OSO-17': {
    description: 'Operational environment defined',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Environmental limits documented. Basic weather minimums.',
      'M': 'Medium: Detailed environmental envelope. Monitoring procedures.',
      'H': 'High: Environmental limits validated in test. Real-time monitoring required.'
    }
  },
  'OSO-18': {
    description: 'Automatic protection of flight envelope',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Basic geofencing. Altitude limits implemented.',
      'M': 'Medium: Automatic envelope protection. Validated limits.',
      'H': 'High: Redundant envelope protection. Independent monitoring. Tested performance.'
    }
  },
  'OSO-19': {
    description: 'Safe recovery from adverse conditions',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Procedures for adverse weather. Crew awareness of limitations.',
      'M': 'Medium: Automatic response to adverse conditions. Validated recovery.',
      'H': 'High: Demonstrated recovery in adverse conditions. Redundant systems.'
    }
  },
  'OSO-20': {
    description: 'Strategic mitigation (air risk)',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Basic airspace assessment. Coordination as required.',
      'M': 'Medium: Formal airspace agreement. NOTAMs/TFRs utilized.',
      'H': 'High: Segregated airspace. ATC coordination. Real-time traffic information.'
    }
  },
  'OSO-21': {
    description: 'Effects of ground impact reduced',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Basic energy absorption. Frangible design considerations.',
      'M': 'Medium: Impact energy reduced. Parachute or autorotation available.',
      'H': 'High: Validated impact attenuation. Demonstrated reduced lethality.'
    }
  },
  'OSO-22': {
    description: 'ERP appropriate for mission',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Basic emergency response plan. Contact information available.',
      'M': 'Medium: Detailed ERP. Coordination with emergency services. Regular review.',
      'H': 'High: Validated ERP. Emergency drills conducted. Integrated response.'
    }
  },
  'OSO-23': {
    description: 'Environmental conditions defined for operation',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Basic weather limits. Wind and visibility minimums.',
      'M': 'Medium: Detailed environmental envelope. Monitoring and verification.',
      'H': 'High: All conditions tested and validated. Real-time environmental monitoring.'
    }
  },
  'OSO-24': {
    description: 'UAS designed to handle adverse conditions',
    guidance: {
      'O': 'Optional - No specific requirement',
      'L': 'Low: Basic environmental protection. Tested in light adverse conditions.',
      'M': 'Medium: Designed for environmental extremes. Validated performance.',
      'H': 'High: Full environmental qualification. Demonstrated performance in extremes.'
    }
  }
}

// ============================================
// HSE HAZARD ASSESSMENT CONFIG
// ============================================
const hazardCategories = [
  { value: 'environmental', label: 'Environmental', examples: 'Weather, terrain, water hazards, wildlife' },
  { value: 'overhead', label: 'Overhead', examples: 'Power lines, towers, buildings, trees, wires' },
  { value: 'access', label: 'Access/Egress', examples: 'Slips/trips, uneven terrain, water crossings' },
  { value: 'ergonomic', label: 'Ergonomic', examples: 'Awkward postures, repetitive tasks, manual handling' },
  { value: 'personal', label: 'Personal Limitations', examples: 'Fatigue, distraction, training gaps, stress' },
  { value: 'equipment', label: 'Equipment', examples: 'Malfunction, battery hazards, sharp edges' },
  { value: 'biological', label: 'Biological', examples: 'Insects, poisonous plants, animal encounters' },
  { value: 'chemical', label: 'Chemical', examples: 'Fuel, battery chemicals, site contaminants' }
]

const likelihoodLevels = [
  { value: 1, label: 'Rare', description: 'Highly unlikely to occur' },
  { value: 2, label: 'Unlikely', description: 'Could occur but not expected' },
  { value: 3, label: 'Possible', description: 'Might occur occasionally' },
  { value: 4, label: 'Likely', description: 'Will probably occur' },
  { value: 5, label: 'Almost Certain', description: 'Expected to occur' }
]

const severityLevels = [
  { value: 1, label: 'Negligible', description: 'No injury, minor inconvenience' },
  { value: 2, label: 'Minor', description: 'First aid injury, minor damage' },
  { value: 3, label: 'Moderate', description: 'Medical treatment, significant damage' },
  { value: 4, label: 'Major', description: 'Serious injury, major damage' },
  { value: 5, label: 'Catastrophic', description: 'Fatality, total loss' }
]

const getRiskLevel = (likelihood, severity) => {
  const score = likelihood * severity
  if (score <= 4) return { level: 'Low', color: 'bg-green-100 text-green-800', action: 'Acceptable with monitoring' }
  if (score <= 9) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800', action: 'Mitigations recommended' }
  if (score <= 16) return { level: 'High', color: 'bg-orange-100 text-orange-800', action: 'Mitigations required' }
  return { level: 'Critical', color: 'bg-red-100 text-red-800', action: 'Do not proceed without controls' }
}

// ============================================
// HELPER: Determine UA characteristic from aircraft data
// ============================================
const getUACharacteristicFromAircraft = (aircraft) => {
  if (!aircraft || aircraft.length === 0) return null
  
  const primary = aircraft.find(a => a.isPrimary) || aircraft[0]
  const speed = primary.maxSpeed || 25
  
  if (speed <= 25) return '1m_25ms'
  if (speed <= 35) return '3m_35ms'
  if (speed <= 75) return '8m_75ms'
  if (speed <= 120) return '20m_120ms'
  return '40m_200ms'
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
          <span className="font-medium">Outside SORA Scope - Cannot validate</span>
        </div>
      </div>
    )
  }

  const osoGaps = osoDefinitions.filter(oso => {
    const compliance = checkOSOCompliance(oso, sail, osoCompliance?.[oso.id]?.robustness || 'none')
    return !compliance.compliant
  })

  const criticalGaps = osoGaps.filter(oso => {
    const required = oso.requirements[sail]
    return required === 'H' || required === 'M'
  })

  const allCompliant = osoGaps.length === 0 && containmentCompliant

  return (
    <div className={`p-4 rounded-lg border ${
      allCompliant ? 'bg-green-50 border-green-200' :
      criticalGaps.length > 0 ? 'bg-red-50 border-red-200' :
      'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-start gap-3">
        {allCompliant ? (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        ) : criticalGaps.length > 0 ? (
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1">
          <p className={`font-medium ${
            allCompliant ? 'text-green-800' :
            criticalGaps.length > 0 ? 'text-red-800' : 'text-amber-800'
          }`}>
            {allCompliant ? 'SORA Assessment Complete - All Requirements Met' :
             criticalGaps.length > 0 ? `${criticalGaps.length} Critical Gap${criticalGaps.length > 1 ? 's' : ''} Require Attention` :
             `${osoGaps.length} Minor Gap${osoGaps.length > 1 ? 's' : ''} - Review Recommended`}
          </p>
          
          {!allCompliant && (
            <div className="mt-2 space-y-1">
              {!containmentCompliant && (
                <p className="text-sm text-red-700">• Containment robustness does not meet requirement</p>
              )}
              {criticalGaps.slice(0, 3).map(oso => (
                <p key={oso.id} className="text-sm text-red-700">
                  • {oso.id}: {oso.name} (requires {oso.requirements[sail]})
                </p>
              ))}
              {criticalGaps.length > 3 && (
                <p className="text-sm text-red-700">• ...and {criticalGaps.length - 3} more</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// CONTAINMENT CALCULATOR COMPONENT
// ============================================
const ContainmentCalculator = ({ maxSpeed, adjacentPopulation, sail, currentRobustness, onRobustnessChange }) => {
  const adjacentDistance = calculateAdjacentAreaDistance(maxSpeed)
  const requiredRobustness = getContainmentRequirement(adjacentPopulation, sail)
  
  const levels = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3 }
  const isCompliant = levels[currentRobustness] >= levels[requiredRobustness]

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
        <Calculator className="w-4 h-4 text-aeria-blue" />
        Containment Calculator (SORA Step 8)
      </h4>
      
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-white rounded border">
          <p className="text-xs text-gray-500 mb-1">Adjacent Area Distance</p>
          <p className="text-lg font-semibold text-gray-900">
            {(adjacentDistance / 1000).toFixed(1)} km
          </p>
          <p className="text-xs text-gray-400">
            Formula: 3 min × {maxSpeed} m/s = {(maxSpeed * 180 / 1000).toFixed(1)} km (max 35km)
          </p>
        </div>
        
        <div className="p-3 bg-white rounded border">
          <p className="text-xs text-gray-500 mb-1">Required Robustness</p>
          <p className={`text-lg font-semibold ${
            requiredRobustness === 'high' ? 'text-red-600' :
            requiredRobustness === 'medium' ? 'text-amber-600' :
            'text-green-600'
          }`}>
            {requiredRobustness.charAt(0).toUpperCase() + requiredRobustness.slice(1)}
          </p>
          <p className="text-xs text-gray-400">
            Based on {adjacentPopulation} adjacent area + SAIL {sail}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700">Actual Containment Robustness:</label>
        <select
          value={currentRobustness}
          onChange={(e) => onRobustnessChange(e.target.value)}
          className={`input text-sm w-32 ${!isCompliant ? 'border-red-300 bg-red-50' : ''}`}
        >
          {robustnessLevels.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        {isCompliant ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
      
      {!isCompliant && (
        <p className="text-sm text-red-600 mt-2">
          ⚠️ Containment robustness must be at least "{requiredRobustness}" for this configuration
        </p>
      )}
    </div>
  )
}

// ============================================
// OSO ROW WITH GUIDANCE COMPONENT
// ============================================
const OSORow = ({ oso, sail, osoData, onUpdate, expanded, onToggleExpand }) => {
  const required = oso.requirements[sail]
  const compliance = checkOSOCompliance(oso, sail, osoData?.robustness || 'none')
  const guidance = osoGuidance[oso.id]?.guidance?.[required] || ''

  return (
    <div className={`rounded-lg border ${
      !compliance.compliant ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={onToggleExpand}
                className="text-gray-400 hover:text-gray-600"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <span className="font-medium text-gray-900 text-sm">{oso.id}</span>
              <span className="text-sm text-gray-700">{oso.name}</span>
              <span className={`px-1.5 py-0.5 text-xs rounded ${
                required === 'O' ? 'bg-gray-100 text-gray-600' :
                required === 'L' ? 'bg-blue-100 text-blue-700' :
                required === 'M' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                Req: {required}
              </span>
              {!compliance.compliant && required !== 'O' && (
                <span className="px-1.5 py-0.5 text-xs rounded bg-amber-200 text-amber-800">
                  Gap
                </span>
              )}
              {compliance.compliant && required !== 'O' && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
          <select
            value={osoData?.robustness || 'none'}
            onChange={(e) => onUpdate('robustness', e.target.value)}
            className={`input text-xs py-1 w-24 ${
              !compliance.compliant && required !== 'O' ? 'border-amber-300' : ''
            }`}
          >
            {robustnessLevels.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-200 mt-2 pt-3">
          <p className="text-xs text-gray-500 mb-2">{oso.description}</p>
          
          {guidance && (
            <div className="p-2 bg-blue-50 rounded border border-blue-100 mb-2">
              <p className="text-xs text-blue-800">
                <strong>SAIL {sail} Guidance:</strong> {guidance}
              </p>
            </div>
          )}
          
          {(osoData?.robustness && osoData.robustness !== 'none') && (
            <div>
              <label className="text-xs text-gray-600">Evidence / Means of Compliance:</label>
              <textarea
                value={osoData?.evidence || ''}
                onChange={(e) => onUpdate('evidence', e.target.value)}
                className="input text-sm mt-1 min-h-[60px]"
                placeholder="Document how this OSO is met..."
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// SORA EXPORT FUNCTION
// ============================================
const generateSORAReport = (project, sora, calculations) => {
  const { intrinsicGRC, finalGRC, residualARC, sail, adjacentDistance, osoGapCount } = calculations
  
  const reportDate = new Date().toLocaleDateString('en-CA')
  const projectName = project.name || 'Unnamed Project'
  
  let report = `
SORA 2.5 RISK ASSESSMENT REPORT
================================
Generated: ${reportDate}
Project: ${projectName}
Client: ${project.clientName || 'N/A'}

EXECUTIVE SUMMARY
-----------------
Specific Assurance and Integrity Level (SAIL): ${sail}
Final Ground Risk Class (GRC): ${finalGRC}
Residual Air Risk Class (ARC): ${residualARC}
OSO Compliance Gaps: ${osoGapCount}

STEP 1: CONOPS DOCUMENTATION
----------------------------
Operation Type: ${sora.tmpr?.type || 'VLOS'}
Max Altitude AGL: ${project.flightPlan?.maxAltitudeAGL || 120}m

STEP 2: INTRINSIC GROUND RISK CLASS
------------------------------------
Population Category: ${sora.populationCategory || 'sparsely'}
UA Characteristic: ${sora.uaCharacteristic || '1m_25ms'}
Maximum Speed: ${sora.maxSpeed || 25} m/s
Intrinsic GRC: ${intrinsicGRC}

STEP 3: FINAL GRC (WITH MITIGATIONS)
------------------------------------
`

  // Add mitigation details
  const mits = sora.mitigations || {}
  if (mits.M1A?.enabled) report += `M1(A) Sheltering: ${mits.M1A.robustness} robustness\n`
  if (mits.M1B?.enabled) report += `M1(B) Operational Restrictions: ${mits.M1B.robustness} robustness\n`
  if (mits.M1C?.enabled) report += `M1(C) Ground Observers: ${mits.M1C.robustness} robustness\n`
  if (mits.M2?.enabled) report += `M2 Impact Dynamics: ${mits.M2.robustness} robustness\n`
  if (mits.M3?.enabled) report += `M3 ERP: Applied\n`
  
  report += `Final GRC: ${finalGRC}

STEP 4-6: AIR RISK ASSESSMENT
-----------------------------
Initial ARC: ${sora.initialARC || 'ARC-b'}
TMPR Type: ${sora.tmpr?.type || 'VLOS'}
TMPR Robustness: ${sora.tmpr?.robustness || 'low'}
Residual ARC: ${residualARC}

STEP 7: SAIL DETERMINATION
--------------------------
SAIL: ${sail}
${sailDescriptions[sail] || ''}

STEP 8: CONTAINMENT
-------------------
Adjacent Area Population: ${sora.adjacentAreaPopulation || 'sparsely'}
Adjacent Area Distance: ${(adjacentDistance / 1000).toFixed(1)} km
Containment Robustness: ${sora.containment?.robustness || 'none'}

STEP 9: OSO COMPLIANCE SUMMARY
------------------------------
`

  // Add OSO summary
  osoDefinitions.forEach(oso => {
    const osoData = sora.osoCompliance?.[oso.id] || {}
    const required = oso.requirements[sail]
    const compliance = checkOSOCompliance(oso, sail, osoData.robustness || 'none')
    const status = compliance.compliant ? '✓' : '✗'
    report += `${oso.id}: ${status} (Required: ${required}, Actual: ${osoData.robustness || 'none'})\n`
  })

  report += `
================================
END OF SORA REPORT
`

  return report
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectRisk({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    validation: true,
    groundRisk: true,
    airRisk: true,
    containment: true,
    oso: false,
    hazards: true
  })
  const [expandedOsos, setExpandedOsos] = useState({})
  const [showExportModal, setShowExportModal] = useState(false)

  const flightPlanEnabled = project.sections?.flightPlan
  const siteSurveyEnabled = project.sections?.siteSurvey

  // ============================================
  // Get data from Site Survey and Flight Plan
  // ============================================
  const siteSurveyPopulation = project.siteSurvey?.population?.category
  const siteSurveyAdjacentPopulation = project.siteSurvey?.population?.adjacentCategory
  const flightPlanAircraft = project.flightPlan?.aircraft
  const flightPlanMaxSpeed = flightPlanAircraft?.find(a => a.isPrimary)?.maxSpeed || 
                             flightPlanAircraft?.[0]?.maxSpeed || 25

  // Initialize risk assessment if not present
  useEffect(() => {
    if (!project.riskAssessment) {
      const initialOsoCompliance = {}
      osoDefinitions.forEach(oso => {
        initialOsoCompliance[oso.id] = {
          robustness: 'none',
          evidence: ''
        }
      })

      const initialPopulation = siteSurveyPopulation || 'sparsely'
      const initialAdjacentPopulation = siteSurveyAdjacentPopulation || 'sparsely'
      const initialUACharacteristic = getUACharacteristicFromAircraft(flightPlanAircraft) || '1m_25ms'

      onUpdate({
        riskAssessment: {
          sora: {
            enabled: flightPlanEnabled,
            uaCharacteristic: initialUACharacteristic,
            maxSpeed: flightPlanMaxSpeed,
            populationCategory: initialPopulation,
            adjacentAreaPopulation: initialAdjacentPopulation,
            populationFromSiteSurvey: !!siteSurveyPopulation,
            adjacentFromSiteSurvey: !!siteSurveyAdjacentPopulation,
            mitigations: {
              M1A: { enabled: false, robustness: 'none', evidence: '' },
              M1B: { enabled: false, robustness: 'none', evidence: '' },
              M1C: { enabled: false, robustness: 'none', evidence: '' },
              M2: { enabled: false, robustness: 'none', evidence: '' },
              M3: { enabled: true, robustness: 'low', evidence: 'ERP documented in Emergency Plan section' }
            },
            initialARC: 'ARC-b',
            tmpr: {
              enabled: true,
              type: 'VLOS',
              robustness: 'low',
              evidence: ''
            },
            containment: {
              method: '',
              robustness: 'none',
              evidence: ''
            },
            osoCompliance: initialOsoCompliance,
            additionalNotes: ''
          },
          hazards: [],
          overallRiskAcceptable: null,
          reviewNotes: '',
          reviewedBy: '',
          reviewDate: ''
        }
      })
    }
  }, [project.riskAssessment, flightPlanEnabled, onUpdate, siteSurveyPopulation, siteSurveyAdjacentPopulation, flightPlanAircraft, flightPlanMaxSpeed])

  const riskAssessment = project.riskAssessment || { sora: {}, hazards: [] }
  const sora = riskAssessment.sora || {}

  // ============================================
  // UPDATE FUNCTIONS
  // ============================================
  const updateRiskAssessment = (updates) => {
    onUpdate({
      riskAssessment: {
        ...riskAssessment,
        ...updates
      }
    })
  }

  const updateSora = (field, value) => {
    updateRiskAssessment({
      sora: { ...sora, [field]: value }
    })
  }

  const updateMitigation = (mitId, field, value) => {
    updateSora('mitigations', {
      ...(sora.mitigations || {}),
      [mitId]: {
        ...(sora.mitigations?.[mitId] || {}),
        [field]: value
      }
    })
  }

  const updateTmpr = (field, value) => {
    updateSora('tmpr', {
      ...(sora.tmpr || {}),
      [field]: value
    })
  }

  const updateContainment = (field, value) => {
    updateSora('containment', {
      ...(sora.containment || {}),
      [field]: value
    })
  }

  const updateOso = (osoId, field, value) => {
    updateSora('osoCompliance', {
      ...(sora.osoCompliance || {}),
      [osoId]: {
        ...(sora.osoCompliance?.[osoId] || {}),
        [field]: value
      }
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleOso = (osoId) => {
    setExpandedOsos(prev => ({ ...prev, [osoId]: !prev[osoId] }))
  }

  // ============================================
  // SYNC FROM SITE SURVEY
  // ============================================
  const syncFromSiteSurvey = () => {
    if (siteSurveyPopulation) {
      updateSora('populationCategory', siteSurveyPopulation)
      updateSora('populationFromSiteSurvey', true)
    }
    if (siteSurveyAdjacentPopulation) {
      updateSora('adjacentAreaPopulation', siteSurveyAdjacentPopulation)
      updateSora('adjacentFromSiteSurvey', true)
    }
  }

  const syncFromFlightPlan = () => {
    if (flightPlanMaxSpeed) {
      updateSora('maxSpeed', flightPlanMaxSpeed)
    }
    const uaChar = getUACharacteristicFromAircraft(flightPlanAircraft)
    if (uaChar) {
      updateSora('uaCharacteristic', uaChar)
    }
  }

  // ============================================
  // CALCULATIONS
  // ============================================
  const intrinsicGRC = getIntrinsicGRC(
    sora.populationCategory || 'sparsely',
    sora.uaCharacteristic || '1m_25ms'
  )

  const finalGRC = calcFinalGRC(intrinsicGRC, sora.mitigations || {})
  const residualARC = calcResidualARC(sora.initialARC || 'ARC-b', sora.tmpr)
  const sail = getSAIL(finalGRC, residualARC) || 'II'
  const outsideScope = intrinsicGRC === null || intrinsicGRC > 7 || finalGRC > 7
  const adjacentDistance = calculateAdjacentAreaDistance(sora.maxSpeed || 25)
  const requiredContainment = getContainmentRequirement(
    sora.adjacentAreaPopulation || 'sparsely',
    sail
  )

  const osoGapCount = osoDefinitions.filter(oso => {
    const compliance = checkOSOCompliance(oso, sail, sora.osoCompliance?.[oso.id]?.robustness || 'none')
    return !compliance.compliant
  }).length

  const containmentCompliant = (() => {
    const levels = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3 }
    const required = levels[requiredContainment] || 0
    const actual = levels[sora.containment?.robustness] || 0
    return actual >= required
  })()

  const siteSurveyMismatch = siteSurveyPopulation && siteSurveyPopulation !== sora.populationCategory
  const adjacentMismatch = siteSurveyAdjacentPopulation && siteSurveyAdjacentPopulation !== sora.adjacentAreaPopulation

  // ============================================
  // EXPORT HANDLER
  // ============================================
  const handleExport = () => {
    const report = generateSORAReport(project, sora, {
      intrinsicGRC,
      finalGRC,
      residualARC,
      sail,
      adjacentDistance,
      osoGapCount
    })
    
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SORA_Report_${project.name || 'Project'}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ============================================
  // HAZARDS MANAGEMENT
  // ============================================
  const addHazard = () => {
    updateRiskAssessment({
      hazards: [...(riskAssessment.hazards || []), {
        category: 'environmental',
        description: '',
        likelihood: 2,
        severity: 2,
        controls: '',
        residualLikelihood: 1,
        residualSeverity: 1,
        responsible: ''
      }]
    })
  }

  const updateHazard = (index, field, value) => {
    const newHazards = [...(riskAssessment.hazards || [])]
    newHazards[index] = { ...newHazards[index], [field]: value }
    updateRiskAssessment({ hazards: newHazards })
  }

  const removeHazard = (index) => {
    const newHazards = (riskAssessment.hazards || []).filter((_, i) => i !== index)
    updateRiskAssessment({ hazards: newHazards })
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* SORA Summary Header */}
      {flightPlanEnabled && (
        <>
          <div className="card bg-gradient-to-r from-aeria-sky to-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">SORA 2.5 Assessment Summary</h2>
              <button
                onClick={handleExport}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
            
            {outsideScope ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Outside SORA Scope</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  The combination of population density and UA characteristics results in a GRC outside 
                  the SORA methodology scope. Consider certified category operations or different operational parameters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Intrinsic GRC</p>
                    <p className="text-2xl font-bold text-gray-400">{intrinsicGRC}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Final GRC</p>
                    <p className="text-2xl font-bold text-gray-900">{finalGRC}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Initial ARC</p>
                    <p className="text-lg font-bold text-gray-400">{sora.initialARC || 'ARC-b'}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Residual ARC</p>
                    <p className="text-lg font-bold text-gray-900">{residualARC}</p>
                  </div>
                  <div className={`text-center p-3 rounded-lg shadow-sm ${sailColors[sail]}`}>
                    <p className="text-xs opacity-75 mb-1">SAIL</p>
                    <p className="text-2xl font-bold">{sail}</p>
                  </div>
                </div>

                {/* Validation Status */}
                <ValidationStatus 
                  sail={sail}
                  osoCompliance={sora.osoCompliance}
                  containmentCompliant={containmentCompliant}
                  outsideScope={outsideScope}
                />
              </>
            )}
          </div>

          {/* Sync Warning */}
          {(siteSurveyMismatch || adjacentMismatch) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Site Survey population data differs from SORA assessment
                </span>
              </div>
              <button
                onClick={syncFromSiteSurvey}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Sync Now
              </button>
            </div>
          )}
        </>
      )}

      {/* Ground Risk Section */}
      {flightPlanEnabled && (
        <div className="card">
          <button
            onClick={() => toggleSection('groundRisk')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-aeria-blue" />
              Ground Risk Assessment (Steps 2-3)
            </h2>
            {expandedSections.groundRisk ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.groundRisk && (
            <div className="mt-4 space-y-4">
              {/* Population & UA Characteristics */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label">Population Category</label>
                    {sora.populationFromSiteSurvey && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                        From Site Survey
                      </span>
                    )}
                  </div>
                  <select
                    value={sora.populationCategory || 'sparsely'}
                    onChange={(e) => {
                      updateSora('populationCategory', e.target.value)
                      updateSora('populationFromSiteSurvey', false)
                    }}
                    className="input"
                  >
                    {Object.entries(populationCategories).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="label">UA Characteristic</label>
                    {flightPlanAircraft?.length > 0 && (
                      <button
                        onClick={syncFromFlightPlan}
                        className="text-xs text-aeria-blue hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Sync from Flight Plan
                      </button>
                    )}
                  </div>
                  <select
                    value={sora.uaCharacteristic || '1m_25ms'}
                    onChange={(e) => updateSora('uaCharacteristic', e.target.value)}
                    className="input"
                  >
                    {Object.entries(uaCharacteristics).map(([key, ua]) => (
                      <option key={key} value={key}>{ua.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Max Speed (m/s)</label>
                <input
                  type="number"
                  value={sora.maxSpeed || 25}
                  onChange={(e) => updateSora('maxSpeed', parseFloat(e.target.value) || 25)}
                  className="input w-32"
                  min="1"
                  max="200"
                />
              </div>

              {/* iGRC Result */}
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  Intrinsic Ground Risk Class (iGRC): <strong className="text-lg">{intrinsicGRC ?? 'N/A'}</strong>
                </p>
              </div>

              {/* Mitigations */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Ground Risk Mitigations</h3>
                
                {/* M1A */}
                <div className="p-3 bg-gray-50 rounded-lg mb-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sora.mitigations?.M1A?.enabled || false}
                      onChange={(e) => updateMitigation('M1A', 'enabled', e.target.checked)}
                      className="w-4 h-4 text-aeria-navy rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-900">M1(A) - Strategic Sheltering</span>
                      <p className="text-xs text-gray-500">People on ground are sheltered</p>
                    </div>
                  </label>
                  {sora.mitigations?.M1A?.enabled && (
                    <div className="mt-2 ml-7">
                      <select
                        value={sora.mitigations?.M1A?.robustness || 'none'}
                        onChange={(e) => updateMitigation('M1A', 'robustness', e.target.value)}
                        className="input text-sm w-40"
                      >
                        <option value="none">None</option>
                        <option value="low">Low (-1 GRC)</option>
                        <option value="medium">Medium (-2 GRC)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* M1B */}
                <div className="p-3 bg-gray-50 rounded-lg mb-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sora.mitigations?.M1B?.enabled || false}
                      onChange={(e) => updateMitigation('M1B', 'enabled', e.target.checked)}
                      className="w-4 h-4 text-aeria-navy rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-900">M1(B) - Operational Restrictions</span>
                      <p className="text-xs text-gray-500">Temporal/spatial restrictions on operation</p>
                    </div>
                  </label>
                  {sora.mitigations?.M1B?.enabled && (
                    <div className="mt-2 ml-7">
                      <select
                        value={sora.mitigations?.M1B?.robustness || 'none'}
                        onChange={(e) => updateMitigation('M1B', 'robustness', e.target.value)}
                        className="input text-sm w-40"
                      >
                        <option value="none">None</option>
                        <option value="medium">Medium (-1 GRC)</option>
                        <option value="high">High (-2 GRC)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* M1C */}
                <div className="p-3 bg-gray-50 rounded-lg mb-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sora.mitigations?.M1C?.enabled || false}
                      onChange={(e) => updateMitigation('M1C', 'enabled', e.target.checked)}
                      className="w-4 h-4 text-aeria-navy rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-900">M1(C) - Ground Observers</span>
                      <p className="text-xs text-gray-500">Observers to warn people in operational area</p>
                    </div>
                  </label>
                  {sora.mitigations?.M1C?.enabled && (
                    <div className="mt-2 ml-7">
                      <select
                        value={sora.mitigations?.M1C?.robustness || 'none'}
                        onChange={(e) => updateMitigation('M1C', 'robustness', e.target.value)}
                        className="input text-sm w-40"
                      >
                        <option value="none">None</option>
                        <option value="low">Low (-1 GRC)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* M2 */}
                <div className="p-3 bg-gray-50 rounded-lg mb-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sora.mitigations?.M2?.enabled || false}
                      onChange={(e) => updateMitigation('M2', 'enabled', e.target.checked)}
                      className="w-4 h-4 text-aeria-navy rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-900">M2 - Impact Dynamics Reduced</span>
                      <p className="text-xs text-gray-500">Parachute, autorotation, frangibility</p>
                    </div>
                  </label>
                  {sora.mitigations?.M2?.enabled && (
                    <div className="mt-2 ml-7">
                      <select
                        value={sora.mitigations?.M2?.robustness || 'none'}
                        onChange={(e) => updateMitigation('M2', 'robustness', e.target.value)}
                        className="input text-sm w-40"
                      >
                        <option value="none">None</option>
                        <option value="low">Low (-1 GRC)</option>
                        <option value="medium">Medium (-2 GRC)</option>
                        <option value="high">High (-4 GRC)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* M3 */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sora.mitigations?.M3?.enabled || false}
                      onChange={(e) => updateMitigation('M3', 'enabled', e.target.checked)}
                      className="w-4 h-4 text-aeria-navy rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-900">M3 - Emergency Response Plan</span>
                      <p className="text-xs text-gray-500">ERP in place (NOT enabled = +1 GRC penalty)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Final GRC */}
              <div className="p-3 bg-aeria-navy text-white rounded-lg">
                <p className="text-sm">
                  Final Ground Risk Class (GRC): <strong className="text-2xl ml-2">{finalGRC}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Air Risk Section */}
      {flightPlanEnabled && (
        <div className="card">
          <button
            onClick={() => toggleSection('airRisk')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Radar className="w-5 h-5 text-aeria-blue" />
              Air Risk Assessment (Steps 4-6)
            </h2>
            {expandedSections.airRisk ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.airRisk && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="label">Initial Air Risk Class</label>
                <select
                  value={sora.initialARC || 'ARC-b'}
                  onChange={(e) => updateSora('initialARC', e.target.value)}
                  className="input"
                >
                  {Object.entries(arcLevels).map(([key, arc]) => (
                    <option key={key} value={key}>{key} - {arc.description}</option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Tactical Mitigation (TMPR)</h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">TMPR Type</label>
                    <select
                      value={sora.tmpr?.type || 'VLOS'}
                      onChange={(e) => updateTmpr('type', e.target.value)}
                      className="input"
                    >
                      {Object.entries(tmprDefinitions).map(([key, tmpr]) => (
                        <option key={key} value={key}>{key} - {tmpr.description}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">TMPR Robustness</label>
                    <select
                      value={sora.tmpr?.robustness || 'low'}
                      onChange={(e) => updateTmpr('robustness', e.target.value)}
                      className="input"
                    >
                      {robustnessLevels.filter(r => r.value !== 'none').map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-aeria-navy text-white rounded-lg">
                <p className="text-sm">
                  Residual Air Risk Class (ARC): <strong className="text-2xl ml-2">{residualARC}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Containment Section */}
      {flightPlanEnabled && !outsideScope && (
        <div className="card">
          <button
            onClick={() => toggleSection('containment')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Box className="w-5 h-5 text-aeria-blue" />
              Containment Requirements (Step 8)
              {!containmentCompliant && (
                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">Gap</span>
              )}
            </h2>
            {expandedSections.containment ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.containment && (
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label">Adjacent Area Population</label>
                  {sora.adjacentFromSiteSurvey && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      From Site Survey
                    </span>
                  )}
                </div>
                <select
                  value={sora.adjacentAreaPopulation || 'sparsely'}
                  onChange={(e) => {
                    updateSora('adjacentAreaPopulation', e.target.value)
                    updateSora('adjacentFromSiteSurvey', false)
                  }}
                  className="input"
                >
                  {Object.entries(populationCategories).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <ContainmentCalculator
                maxSpeed={sora.maxSpeed || 25}
                adjacentPopulation={sora.adjacentAreaPopulation || 'sparsely'}
                sail={sail}
                currentRobustness={sora.containment?.robustness || 'none'}
                onRobustnessChange={(value) => updateContainment('robustness', value)}
              />

              <div>
                <label className="label">Containment Method / Evidence</label>
                <textarea
                  value={sora.containment?.evidence || ''}
                  onChange={(e) => updateContainment('evidence', e.target.value)}
                  className="input min-h-[80px]"
                  placeholder="Describe how containment is achieved (e.g., geofencing, operational procedures, physical barriers)..."
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* OSO Compliance Section */}
      {flightPlanEnabled && !outsideScope && (
        <div className="card">
          <button
            onClick={() => toggleSection('oso')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-aeria-blue" />
              OSO Compliance (Step 9)
              {osoGapCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                  {osoGapCount} Gap{osoGapCount > 1 ? 's' : ''}
                </span>
              )}
            </h2>
            {expandedSections.oso ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.oso && (
            <div className="mt-4 space-y-6">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>SAIL {sail}</strong> requires the following robustness levels. 
                  Click any OSO to expand and see specific guidance for your SAIL level.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  O = Optional, L = Low, M = Medium, H = High
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
                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <CategoryIcon className="w-4 h-4" />
                      {catInfo.label}
                    </h3>
                    <div className="space-y-2">
                      {categoryOsos.map(oso => (
                        <OSORow
                          key={oso.id}
                          oso={oso}
                          sail={sail}
                          osoData={sora.osoCompliance?.[oso.id]}
                          onUpdate={(field, value) => updateOso(oso.id, field, value)}
                          expanded={expandedOsos[oso.id] || false}
                          onToggleExpand={() => toggleOso(oso.id)}
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

      {/* HSE Hazard Assessment */}
      <div className="card">
        <button
          onClick={() => toggleSection('hazards')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-aeria-blue" />
            HSE Hazard Assessment
          </h2>
          {expandedSections.hazards ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.hazards && (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Identify non-RPAS operational hazards following the HSE hazard assessment framework.
                This assessment is always required regardless of SORA.
              </p>
            </div>

            {(riskAssessment.hazards || []).length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">No hazards identified yet.</p>
                <button
                  onClick={addHazard}
                  className="text-sm text-aeria-blue hover:underline mt-2"
                >
                  Add your first hazard
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {(riskAssessment.hazards || []).map((hazard, index) => {
                  const initialRisk = getRiskLevel(hazard.likelihood, hazard.severity)
                  const residualRisk = getRiskLevel(hazard.residualLikelihood, hazard.residualSeverity)
                  
                  return (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                            #{index + 1}
                          </span>
                          <select
                            value={hazard.category}
                            onChange={(e) => updateHazard(index, 'category', e.target.value)}
                            className="input text-sm w-40"
                          >
                            {hazardCategories.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => removeHazard(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mb-3">
                        <label className="label text-xs">Hazard Description</label>
                        <textarea
                          value={hazard.description}
                          onChange={(e) => updateHazard(index, 'description', e.target.value)}
                          className="input text-sm min-h-[60px]"
                          placeholder="Describe the hazard..."
                        />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="label text-xs">Likelihood</label>
                          <select
                            value={hazard.likelihood}
                            onChange={(e) => updateHazard(index, 'likelihood', parseInt(e.target.value))}
                            className="input text-sm"
                          >
                            {likelihoodLevels.map(l => (
                              <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label text-xs">Severity</label>
                          <select
                            value={hazard.severity}
                            onChange={(e) => updateHazard(index, 'severity', parseInt(e.target.value))}
                            className="input text-sm"
                          >
                            {severityLevels.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label text-xs">Initial Risk</label>
                          <div className={`px-3 py-2 rounded text-sm font-medium ${initialRisk.color}`}>
                            {initialRisk.level}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="label text-xs">Control Measures</label>
                        <textarea
                          value={hazard.controls}
                          onChange={(e) => updateHazard(index, 'controls', e.target.value)}
                          className="input text-sm min-h-[60px]"
                          placeholder="Describe controls to mitigate this hazard..."
                        />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="label text-xs">Residual Likelihood</label>
                          <select
                            value={hazard.residualLikelihood}
                            onChange={(e) => updateHazard(index, 'residualLikelihood', parseInt(e.target.value))}
                            className="input text-sm"
                          >
                            {likelihoodLevels.map(l => (
                              <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label text-xs">Residual Severity</label>
                          <select
                            value={hazard.residualSeverity}
                            onChange={(e) => updateHazard(index, 'residualSeverity', parseInt(e.target.value))}
                            className="input text-sm"
                          >
                            {severityLevels.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label text-xs">Residual Risk</label>
                          <div className={`px-3 py-2 rounded text-sm font-medium ${residualRisk.color}`}>
                            {residualRisk.level}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <button
              onClick={addHazard}
              className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Hazard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
