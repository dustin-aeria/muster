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
  Gauge
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
  
  // Use the larger constraint
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
  // Direct mapping if using SORA categories
  if (populationCategories[siteSurveyCategory]) return siteSurveyCategory
  
  // Map from common Site Survey terms
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
// Based on altitude, airspace type, and environment
// ============================================
const calculateSuggestedARC = (altitudeAGL, airspaceType, isAirportEnv, isUrban) => {
  // Convert meters to feet for comparison (500 ft = 152m threshold)
  const altitudeFt = altitudeAGL * 3.28084
  
  // Step 1: Atypical airspace (segregated/restricted) = ARC-a
  if (airspaceType === 'atypical' || airspaceType === 'segregated') {
    return { arc: 'ARC-a', reason: 'Atypical/segregated airspace' }
  }
  
  // Step 2: Very high altitude (> FL600) = ARC-b (rare case)
  if (altitudeFt > 60000) {
    return { arc: 'ARC-b', reason: 'Above FL600' }
  }
  
  // Step 3: Airport/Heliport environment
  if (isAirportEnv) {
    if (airspaceType === 'controlled' || airspaceType === 'class_b' || 
        airspaceType === 'class_c' || airspaceType === 'class_d') {
      return { arc: 'ARC-d', reason: 'Airport environment in controlled airspace' }
    }
    return { arc: 'ARC-c', reason: 'Airport environment' }
  }
  
  // Step 4: Above 500 ft AGL (152m)
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
  
  // Step 5: Below 500 ft AGL (152m)
  if (airspaceType === 'mode_c_veil' || airspaceType === 'tmz') {
    return { arc: 'ARC-c', reason: 'Below 500ft AGL in Mode-C Veil/TMZ' }
  }
  if (airspaceType === 'controlled') {
    return { arc: 'ARC-c', reason: 'Below 500ft AGL in controlled airspace' }
  }
  if (isUrban) {
    return { arc: 'ARC-c', reason: 'Below 500ft AGL over urban area' }
  }
  
  // Default: Low altitude, uncontrolled, rural = ARC-b
  return { arc: 'ARC-b', reason: 'Below 500ft AGL in uncontrolled airspace over rural area' }
}

// ============================================
// VALIDATION STATUS COMPONENT
// ============================================
const ValidationStatus = ({ sail, osoCompliance, containmentCompliant, outsideScope, onViewGaps }) => {
  const [showAllGaps, setShowAllGaps] = useState(false)
  
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

  const criticalGaps = osoGaps.filter(oso => {
    const required = oso.requirements[sail]
    return required === 'H' || required === 'M'
  })

  const allCompliant = osoGaps.length === 0 && containmentCompliant
  const gapsToShow = showAllGaps ? criticalGaps : criticalGaps.slice(0, 3)

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
             `${osoGaps.length} Gap${osoGaps.length > 1 ? 's' : ''} - Review Recommended`}
          </p>
          
          {!allCompliant && (
            <div className="mt-2 space-y-1">
              {!containmentCompliant && (
                <p className="text-sm text-red-700">• Containment robustness insufficient</p>
              )}
              {gapsToShow.map(oso => (
                <p key={oso.id} className="text-sm text-red-700">
                  • {oso.id}: {oso.name} (requires {oso.requirements[sail]})
                </p>
              ))}
              {criticalGaps.length > 3 && (
                <button
                  onClick={() => setShowAllGaps(!showAllGaps)}
                  className="text-sm text-red-600 hover:text-red-800 underline mt-1"
                >
                  {showAllGaps ? 'Show less' : `Show ${criticalGaps.length - 3} more gaps...`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// OSO ROW COMPONENT
// ============================================
const OSORow = ({ oso, sail, osoData, onUpdate, expanded, onToggleExpand }) => {
  const required = oso.requirements[sail]
  const compliance = checkOSOCompliance(oso, sail, osoData?.robustness || 'none')
  const guidance = osoGuidance[oso.id]?.[required] || ''

  if (required === 'O') {
    return (
      <div className="p-2 bg-gray-50 rounded border border-gray-200 opacity-60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">{oso.id}</span>
          <span className="text-xs text-gray-500">{oso.name}</span>
          <span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-500">Optional</span>
        </div>
      </div>
    )
  }

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
                required === 'L' ? 'bg-blue-100 text-blue-700' :
                required === 'M' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {required}
              </span>
              {!compliance.compliant && (
                <span className="px-1.5 py-0.5 text-xs rounded bg-amber-200 text-amber-800">Gap</span>
              )}
              {compliance.compliant && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
          <select
            value={osoData?.robustness || 'none'}
            onChange={(e) => onUpdate('robustness', e.target.value)}
            className={`input text-xs py-1 w-24 ${!compliance.compliant ? 'border-amber-300' : ''}`}
          >
            {robustnessLevels.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-200 pt-2">
          <p className="text-xs text-gray-500 mb-2">{oso.description}</p>
          {guidance && (
            <div className="p-2 bg-blue-50 rounded border border-blue-100 mb-2">
              <p className="text-xs text-blue-800">
                <strong>Requirement ({required}):</strong> {guidance}
              </p>
            </div>
          )}
          {(osoData?.robustness && osoData.robustness !== 'none') && (
            <div>
              <label className="text-xs text-gray-600">Evidence:</label>
              <textarea
                value={osoData?.evidence || ''}
                onChange={(e) => onUpdate('evidence', e.target.value)}
                className="input text-sm mt-1 min-h-[60px]"
                placeholder="Document compliance evidence..."
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
  
  let report = `SORA 2.5 ASSESSMENT REPORT
================================
Generated: ${reportDate}
Project: ${projectName}
Client: ${project.clientName || 'N/A'}

EXECUTIVE SUMMARY
-----------------
SAIL: ${sail}
Final GRC: ${finalGRC}
Residual ARC: ${residualARC}
OSO Gaps: ${osoGapCount}

STEP 1: CONOPS
--------------
Operation Type: ${sora.operationType || 'VLOS'}
Max Altitude AGL: ${sora.maxAltitudeAGL || 120}m

STEP 2: INTRINSIC GRC
---------------------
Population: ${populationCategories[sora.populationCategory]?.label || sora.populationCategory}
UA Characteristic: ${uaCharacteristics[sora.uaCharacteristic]?.label || sora.uaCharacteristic}
Max Speed: ${sora.maxSpeed || 25} m/s
iGRC: ${intrinsicGRC}

STEP 3: FINAL GRC
-----------------`

  const mits = sora.mitigations || {}
  if (mits.M1A?.enabled) report += `\nM1(A) Sheltering: ${mits.M1A.robustness}`
  if (mits.M1B?.enabled) report += `\nM1(B) Operational Restrictions: ${mits.M1B.robustness}`
  if (mits.M1C?.enabled) report += `\nM1(C) Ground Observers: ${mits.M1C.robustness}`
  if (mits.M2?.enabled) report += `\nM2 Impact Dynamics: ${mits.M2.robustness}`
  report += `\nM3 ERP: ${mits.M3?.enabled ? 'Applied' : 'NOT APPLIED (+1 penalty)'}`
  report += `\nFinal GRC: ${finalGRC}

STEPS 4-6: AIR RISK
-------------------
Initial ARC: ${sora.initialARC || 'ARC-b'}
TMPR: ${sora.tmpr?.type || 'VLOS'} (${sora.tmpr?.robustness || 'low'})
Residual ARC: ${residualARC}

STEP 7: SAIL
------------
SAIL: ${sail}
${sailDescriptions[sail] || ''}

STEP 8: CONTAINMENT
-------------------
Adjacent Area: ${populationCategories[sora.adjacentAreaPopulation]?.label || sora.adjacentAreaPopulation}
Adjacent Distance: ${(adjacentDistance / 1000).toFixed(1)} km
Robustness: ${sora.containment?.robustness || 'none'}

STEP 9: OSO COMPLIANCE
----------------------`

  osoDefinitions.forEach(oso => {
    const osoData = sora.osoCompliance?.[oso.id] || {}
    const required = oso.requirements[sail]
    if (required === 'O') return
    const compliance = checkOSOCompliance(oso, sail, osoData.robustness || 'none')
    report += `\n${oso.id}: ${compliance.compliant ? 'âœ“' : 'âœ—'} (Req: ${required}, Actual: ${osoData.robustness || 'none'})`
  })

  report += `\n\n================================\nEND OF REPORT`
  return report
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectSORA({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
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
  // DATA FROM FLIGHT PLAN AND SITE SURVEY
  // ============================================
  const flightPlan = project.flightPlan || {}
  const siteSurvey = project.siteSurvey || {}
  
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
  const ssIsAirportEnv = ssNearbyAerodromes.length > 0 || siteSurvey.nearAirport || false
  const ssIsUrban = ['suburban', 'highdensity', 'urban', 'assembly'].includes(
    ssPopulation || fpGroundAreaType || ''
  )
  
  // Map airspace classification to ARC-relevant type
  const ssAirspaceType = (() => {
    const cls = ssAirspaceClass.toUpperCase()
    if (cls === 'A' || cls === 'B' || cls === 'C' || cls === 'D') return 'controlled'
    if (cls === 'E') return 'controlled' // Class E is controlled above 700/1200 AGL
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
  // INITIALIZE SORA DATA - Using safer pattern
  // ============================================
  useEffect(() => {
    if (initialized) return

    if (!project.soraAssessment) {
      setInitialized(true)
      const initialOsoCompliance = {}
      osoDefinitions.forEach(oso => {
        initialOsoCompliance[oso.id] = { robustness: 'none', evidence: '' }
      })

      onUpdate({
        soraAssessment: {
          // Step 1: ConOps (from Flight Plan)
          operationType: fpOperationType,
          maxAltitudeAGL: fpMaxAltitude,
          
          // Step 2: iGRC inputs
          populationCategory: derivedPopulation,
          uaCharacteristic: derivedUACharacteristic,
          maxSpeed: fpMaxSpeed,
          
          // Data source tracking
          populationSource: ssPopulation ? 'siteSurvey' : 'manual',
          aircraftSource: fpAircraft.length > 0 ? 'flightPlan' : 'manual',
          
          // Step 3: Mitigations (SORA 2.5 - M3/ERP removed)
          mitigations: {
            M1A: { enabled: false, robustness: 'none', evidence: '' },
            M1B: { enabled: false, robustness: 'none', evidence: '' },
            M1C: { enabled: false, robustness: 'none', evidence: '' },
            M2: { enabled: false, robustness: 'none', evidence: '' }
          },
          
          // Steps 4-6: Air Risk
          initialARC: 'ARC-b',
          tmpr: { enabled: true, type: fpOperationType, robustness: 'low', evidence: '' },
          
          // Step 8: Containment
          adjacentAreaPopulation: derivedAdjacentPopulation,
          containment: { method: '', robustness: 'none', evidence: '' },
          
          // Step 9: OSOs
          osoCompliance: initialOsoCompliance,
          
          // Metadata
          lastUpdated: new Date().toISOString(),
          version: '2.5'
        }
      })
    } else {
      setInitialized(true)
    }
  }, [initialized, project.soraAssessment, onUpdate, fpOperationType, fpMaxAltitude, derivedPopulation, derivedUACharacteristic, fpMaxSpeed, derivedAdjacentPopulation, ssPopulation, fpAircraft.length])

  const sora = project.soraAssessment || {}

  // ============================================
  // UPDATE FUNCTIONS (BATCHED TO FIX SYNC BUG)
  // ============================================
  const updateSora = useCallback((updates) => {
    onUpdate({
      soraAssessment: {
        ...project.soraAssessment,
        ...updates,
        lastUpdated: new Date().toISOString()
      }
    })
  }, [project.soraAssessment, onUpdate])

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
  // SYNC FROM FLIGHT PLAN / SITE SURVEY (BATCHED)
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
      // Also suggest updating ARC based on new altitude
      updates.initialARC = suggestedARC.arc
    }
    
    if (Object.keys(updates).length > 0) {
      updateSora(updates)
    }
  }

  // Check for mismatches - now includes ARC suggestion
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
      intrinsicGRC, finalGRC, residualARC, sail, adjacentDistance, osoGapCount
    })
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SORA_${project.name || 'Assessment'}_${new Date().toISOString().split('T')[0]}.txt`
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
      {/* Header */}
      <div className="card bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            SORA 2.5 Assessment
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

      {/* Sync Warning */}
      {hasMismatch && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-800">
              Flight Plan or Site Survey data has changed
            </span>
          </div>
          <button
            onClick={syncFromSources}
            className="btn btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Data
          </button>
        </div>
      )}

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
                <p className="text-sm text-gray-600">
                  <strong>Aircraft:</strong> {primaryAircraft.make} {primaryAircraft.model} • 
                  Max Speed: {primaryAircraft.maxSpeed || 25} m/s • 
                  MTOW: {primaryAircraft.mtow || 'N/A'} kg
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ground Risk (Steps 2-3) */}
      <div className="card">
        <button
          onClick={() => toggleSection('groundRisk')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Steps 2-3: Ground Risk
          </h3>
          {expandedSections.groundRisk ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.groundRisk && (
          <div className="mt-4 space-y-4">
            {/* Step 2: iGRC */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label">Population Category</label>
                  {sora.populationSource === 'siteSurvey' && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">From Site Survey</span>
                  )}
                </div>
                <select
                  value={sora.populationCategory || 'sparsely'}
                  onChange={(e) => updateSora({ populationCategory: e.target.value, populationSource: 'manual' })}
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

            <div className="p-3 bg-gray-100 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-600">Intrinsic GRC:</span>
              <span className="text-xl font-bold text-gray-900">{intrinsicGRC ?? 'N/A'}</span>
            </div>

            {/* Step 3: Mitigations (SORA 2.5 Annex B Table 11) */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Ground Risk Mitigations</h4>
              
              {['M1A', 'M1B', 'M1C', 'M2'].map(mitId => {
                const mitLabels = {
                  M1A: { name: 'M1(A) - Sheltering', desc: 'People on ground are sheltered by structures', options: ['low', 'medium'] },
                  M1B: { name: 'M1(B) - Operational Restrictions', desc: 'Spacetime-based restrictions reduce exposure', options: ['medium', 'high'] },
                  M1C: { name: 'M1(C) - Ground Observers', desc: 'Observers can warn people in operational area', options: ['low'] },
                  M2: { name: 'M2 - Impact Dynamics Reduced', desc: 'Parachute, autorotation, or frangibility', options: ['medium', 'high'] }
                }
                const mit = mitLabels[mitId]
                
                return (
                  <div key={mitId} className="p-3 bg-gray-50 rounded-lg mb-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sora.mitigations?.[mitId]?.enabled || false}
                        onChange={(e) => updateMitigation(mitId, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{mit.name}</span>
                        <p className="text-xs text-gray-500">{mit.desc}</p>
                      </div>
                    </label>
                    {sora.mitigations?.[mitId]?.enabled && (
                      <select
                        value={sora.mitigations?.[mitId]?.robustness || 'none'}
                        onChange={(e) => updateMitigation(mitId, 'robustness', e.target.value)}
                        className="input text-sm mt-2 w-40"
                      >
                        <option value="none">None</option>
                        {mit.options.map(o => (
                          <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )
              })}
              
              {/* Note: M3 (ERP) removed in SORA 2.5 - no longer a mitigation */}
            </div>

            <div className="p-3 bg-blue-900 text-white rounded-lg flex items-center justify-between">
              <span className="text-sm">Final GRC:</span>
              <span className="text-2xl font-bold">{finalGRC}</span>
            </div>
          </div>
        )}
      </div>

      {/* Air Risk (Steps 4-6) */}
      <div className="card">
        <button
          onClick={() => toggleSection('airRisk')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Radar className="w-5 h-5 text-purple-500" />
            Steps 4-6: Air Risk
            {sora.initialARC !== suggestedARC.arc && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Review Suggested</span>
            )}
          </h3>
          {expandedSections.airRisk ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.airRisk && (
          <div className="mt-4 space-y-4">
            {/* ARC Suggestion based on Figure 6 */}
            <div className={`p-3 rounded-lg border ${
              sora.initialARC === suggestedARC.arc 
                ? 'bg-green-50 border-green-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Suggested ARC (per Figure 6):
                  </p>
                  <p className="text-lg font-bold text-gray-900">{suggestedARC.arc}</p>
                  <p className="text-xs text-gray-500 mt-1">{suggestedARC.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Based on: {fpMaxAltitude}m AGL ({Math.round(fpMaxAltitude * 3.28084)}ft) • 
                    {ssIsUrban ? ' Urban' : ' Rural'} • 
                    {ssIsAirportEnv ? ' Near aerodrome' : ''} • 
                    Class {ssAirspaceClass} ({ssAirspaceType})
                  </p>
                </div>
                {sora.initialARC !== suggestedARC.arc && (
                  <button
                    onClick={() => updateSora({ initialARC: suggestedARC.arc })}
                    className="btn btn-secondary text-xs"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
            
            {/* Altitude Warning */}
            {fpMaxAltitude > 152 && sora.initialARC === 'ARC-b' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Altitude exceeds 500ft (152m)</p>
                  <p className="text-xs text-red-600">
                    Operations above 500ft AGL typically require ARC-c or higher per SORA Figure 6.
                    Current selection: {sora.initialARC}
                  </p>
                </div>
              </div>
            )}
            
            <div>
              <label className="label">Initial ARC (Step 4)</label>
              <select
                value={sora.initialARC || 'ARC-b'}
                onChange={(e) => updateSora({ initialARC: e.target.value })}
                className="input"
              >
                {Object.entries(arcLevels).map(([key, arc]) => (
                  <option key={key} value={key}>{key} - {arc.description}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">TMPR Type (Step 6)</label>
                <select
                  value={sora.tmpr?.type || 'VLOS'}
                  onChange={(e) => updateTmpr({ type: e.target.value })}
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
                  onChange={(e) => updateTmpr({ robustness: e.target.value })}
                  className="input"
                >
                  {robustnessLevels.filter(r => r.value !== 'none').map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 bg-purple-900 text-white rounded-lg flex items-center justify-between">
              <span className="text-sm">Residual ARC:</span>
              <span className="text-2xl font-bold">{residualARC}</span>
            </div>
          </div>
        )}
      </div>

      {/* Containment (Step 8) */}
      {!outsideScope && (
        <div className="card">
          <button
            onClick={() => toggleSection('containment')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Box className="w-5 h-5 text-cyan-500" />
              Step 8: Containment
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

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-gray-500 mb-1">Adjacent Distance</p>
                    <p className="text-lg font-semibold">{(adjacentDistance / 1000).toFixed(1)} km</p>
                    <p className="text-xs text-gray-400">3 min Ã— {sora.maxSpeed || 25} m/s</p>
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
