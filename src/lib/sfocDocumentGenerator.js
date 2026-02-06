/**
 * SFOC Document Generator
 * Generate Transport Canada SFOC application documents
 *
 * Documents included:
 * - Full SFOC Application Package
 * - Concept of Operations (ConOps)
 * - Safety Plan
 * - Emergency Response Plan (ERP)
 * - SORA Assessment Report
 *
 * @location src/lib/sfocDocumentGenerator.js
 */

import { BrandedPDF } from './pdfExportService'
import {
  populationCategories,
  uaCharacteristics,
  arcLevels,
  sailDescriptions,
  sailColors,
  groundMitigations,
  tmprDefinitions,
  containmentMethods,
  osoDefinitions,
  osoCategories,
  sfocTriggers,
  largeRPASGuidance,
  checkAllOSOCompliance
} from './soraConfig'

// ============================================
// CONOPS DOCUMENT GENERATOR
// Per JARUS SORA 2.5 Annex A
// ============================================

/**
 * Generate Concept of Operations (ConOps) PDF
 * Pulls data from SORA assessment
 * @param {object} assessment - SORA assessment data
 * @param {object} options - Generation options
 * @returns {BrandedPDF} PDF document
 */
export async function generateConOpsPDF(assessment, options = {}) {
  const { branding, clientBranding, project } = options
  const conops = assessment.conops || {}

  const pdf = new BrandedPDF({
    title: 'Concept of Operations (ConOps)',
    subtitle: `SORA Assessment: ${assessment.name || 'Unnamed'}`,
    projectName: project?.name || assessment.name || '',
    projectCode: assessment.id?.slice(0, 8).toUpperCase() || '',
    clientName: project?.clientName || '',
    branding,
    clientBranding
  })

  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()

  // Section 1: Operation Description
  pdf.addNewSection('1. Operation Description')

  pdf.addSubsectionTitle('1.1 Purpose and Objective')
  pdf.addParagraph(conops.operationDescription?.purpose || 'Not specified')

  pdf.addSubsectionTitle('1.2 Operation Type')
  pdf.addKeyValueGrid([
    { label: 'Operation Type', value: conops.operationDescription?.operationType || 'Not specified' },
    { label: 'VLOS/BVLOS', value: conops.operationDescription?.vlosType || 'VLOS' },
    { label: 'Day/Night', value: conops.operationDescription?.dayNight || 'Day only' },
    { label: 'Commercial/Non-commercial', value: conops.operationDescription?.commercialStatus || 'Commercial' }
  ])

  if (conops.operationDescription?.description) {
    pdf.addSubsectionTitle('1.3 Detailed Description')
    pdf.addParagraph(conops.operationDescription.description)
  }

  // Section 2: UAS Description
  pdf.addNewSection('2. UAS Description')

  const uas = conops.uasDescription || {}
  pdf.addSubsectionTitle('2.1 Aircraft Identification')
  pdf.addKeyValueGrid([
    { label: 'Manufacturer', value: uas.manufacturer || 'Not specified' },
    { label: 'Model', value: uas.model || 'Not specified' },
    { label: 'Serial Number', value: uas.serialNumber || 'N/A' },
    { label: 'Registration', value: uas.registration || 'N/A' }
  ])

  pdf.addSubsectionTitle('2.2 Aircraft Specifications')
  pdf.addKeyValueGrid([
    { label: 'MTOW', value: uas.mtow ? `${uas.mtow} kg` : 'Not specified' },
    { label: 'Max Dimension', value: uas.maxDimension ? `${uas.maxDimension} m` : 'Not specified' },
    { label: 'Max Speed', value: uas.maxSpeed ? `${uas.maxSpeed} m/s` : 'Not specified' },
    { label: 'Aircraft Type', value: uas.aircraftType || 'Multirotor' }
  ])

  pdf.addSubsectionTitle('2.3 Performance Characteristics')
  pdf.addKeyValueGrid([
    { label: 'Max Endurance', value: uas.maxEndurance ? `${uas.maxEndurance} min` : 'N/A' },
    { label: 'Max Range', value: uas.maxRange ? `${uas.maxRange} km` : 'N/A' },
    { label: 'Power Source', value: uas.powerSource || 'Battery' },
    { label: 'Propulsion Type', value: uas.propulsionType || 'Electric' }
  ])

  if (uas.payloadDescription) {
    pdf.addSubsectionTitle('2.4 Payload')
    pdf.addParagraph(uas.payloadDescription)
    if (uas.payloadWeight) {
      pdf.addLabelValue('Payload Weight', `${uas.payloadWeight} kg`)
    }
  }

  // Section 3: Operating Environment
  pdf.addNewSection('3. Operating Environment')

  const env = conops.operatingEnvironment || {}
  pdf.addSubsectionTitle('3.1 Airspace')
  pdf.addKeyValueGrid([
    { label: 'Airspace Class', value: env.airspaceClass || 'Class G' },
    { label: 'Max Altitude AGL', value: env.maxAltitudeAGL ? `${env.maxAltitudeAGL} ft` : 'Not specified' },
    { label: 'Controlled Airspace', value: env.inControlledAirspace ? 'Yes' : 'No' },
    { label: 'Near Aerodrome', value: env.nearAerodrome ? 'Yes' : 'No' }
  ])

  pdf.addSubsectionTitle('3.2 Ground Environment')
  pdf.addKeyValueGrid([
    { label: 'Population Category', value: populationCategories[env.populationCategory]?.label || 'Not specified' },
    { label: 'Terrain Type', value: env.terrainType || 'Not specified' },
    { label: 'Infrastructure', value: env.infrastructure || 'N/A' },
    { label: 'Ground Hazards', value: env.groundHazards || 'None identified' }
  ])

  if (env.locationDescription) {
    pdf.addSubsectionTitle('3.3 Location Description')
    pdf.addParagraph(env.locationDescription)
  }

  // Section 4: Crew Composition
  pdf.addNewSection('4. Crew Composition')

  const crew = conops.crewComposition || {}
  pdf.addSubsectionTitle('4.1 Remote Crew Requirements')
  pdf.addKeyValueGrid([
    { label: 'Minimum Crew Size', value: crew.minCrewSize || '1' },
    { label: 'PIC Required', value: 'Yes' },
    { label: 'Visual Observers', value: crew.visualObservers || '0' },
    { label: 'Payload Operator', value: crew.payloadOperator ? 'Yes' : 'No' }
  ])

  pdf.addSubsectionTitle('4.2 Qualifications')
  if (crew.pilotCertificate) {
    pdf.addLabelValue('Pilot Certificate', crew.pilotCertificate)
  }
  if (crew.additionalTraining) {
    pdf.addLabelValue('Additional Training', crew.additionalTraining)
  }
  if (crew.medicalRequirements) {
    pdf.addLabelValue('Medical Requirements', crew.medicalRequirements)
  }

  // Section 5: Operational Procedures
  pdf.addNewSection('5. Operational Procedures')

  const procedures = conops.operationalProcedures || {}

  if (procedures.preflightProcedures) {
    pdf.addSubsectionTitle('5.1 Pre-flight Procedures')
    pdf.addParagraph(procedures.preflightProcedures)
  }

  if (procedures.inflightProcedures) {
    pdf.addSubsectionTitle('5.2 In-flight Procedures')
    pdf.addParagraph(procedures.inflightProcedures)
  }

  if (procedures.postflightProcedures) {
    pdf.addSubsectionTitle('5.3 Post-flight Procedures')
    pdf.addParagraph(procedures.postflightProcedures)
  }

  if (procedures.emergencyProcedures) {
    pdf.addSubsectionTitle('5.4 Emergency Procedures Summary')
    pdf.addParagraph(procedures.emergencyProcedures)
  }

  // Section 6: Weather Limitations
  pdf.addNewSection('6. Weather Limitations')

  const weather = conops.weatherLimitations || {}
  pdf.addKeyValueGrid([
    { label: 'Min Visibility', value: weather.minVisibility ? `${weather.minVisibility} km` : 'Not specified' },
    { label: 'Max Wind Speed', value: weather.maxWindSpeed ? `${weather.maxWindSpeed} km/h` : 'Not specified' },
    { label: 'Min Ceiling', value: weather.minCeiling ? `${weather.minCeiling} ft` : 'Not specified' },
    { label: 'Precipitation', value: weather.precipitation || 'No precipitation' }
  ])

  if (weather.additionalLimitations) {
    pdf.addSubsectionTitle('6.1 Additional Weather Limitations')
    pdf.addParagraph(weather.additionalLimitations)
  }

  // Document Control
  pdf.addNewSection('Document Control')
  pdf.addKeyValuePairs([
    ['Document Version', '1.0'],
    ['Generated', new Date().toLocaleDateString('en-CA')],
    ['Assessment ID', assessment.id || 'N/A'],
    ['Status', assessment.status || 'Draft']
  ])

  pdf.addSignatureBlock([
    { role: 'Remote Pilot in Command', name: '' },
    { role: 'Operations Manager', name: '' }
  ])

  return pdf
}

// ============================================
// SAFETY PLAN GENERATOR
// ============================================

/**
 * Generate Safety Plan PDF
 * @param {object} assessment - SORA assessment data
 * @param {object} options - Generation options
 * @returns {BrandedPDF} PDF document
 */
export async function generateSafetyPlanPDF(assessment, options = {}) {
  const { branding, project, osoStatuses = [] } = options

  const pdf = new BrandedPDF({
    title: 'Safety Plan',
    subtitle: `SFOC Application: ${assessment.name || 'Unnamed'}`,
    projectName: project?.name || assessment.name || '',
    projectCode: assessment.id?.slice(0, 8).toUpperCase() || '',
    clientName: project?.clientName || '',
    branding
  })

  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()

  // Section 1: Safety Policy
  pdf.addNewSection('1. Safety Policy Statement')
  pdf.addParagraph('This Safety Plan establishes the safety management framework for RPAS operations conducted under this SFOC application. The plan ensures systematic identification, assessment, and mitigation of hazards to achieve an acceptable level of safety.')

  pdf.addInfoBox('Safety Commitment',
    'All personnel involved in these operations are committed to maintaining the highest standards of safety and will comply with all applicable regulations and procedures.',
    'info')

  // Section 2: SORA Assessment Summary
  pdf.addNewSection('2. Risk Assessment Summary')

  const sail = assessment.sail?.level
  const grc = assessment.groundRisk?.finalGRC
  const arc = assessment.airRisk?.residualARC

  pdf.addSubsectionTitle('2.1 SAIL Determination')
  pdf.addKPIRow([
    { label: 'SAIL Level', value: sail || 'N/A' },
    { label: 'Final GRC', value: grc || 'N/A' },
    { label: 'Residual ARC', value: arc?.replace('ARC-', '') || 'N/A' }
  ])

  if (sail) {
    pdf.addInfoBox('SAIL Description',
      sailDescriptions[sail] || 'SAIL level determines required operational safety objectives.',
      'info')
  }

  // Section 3: Ground Risk Management
  pdf.addNewSection('3. Ground Risk Management')

  const groundRisk = assessment.groundRisk || {}
  pdf.addSubsectionTitle('3.1 Population Assessment')
  pdf.addKeyValueGrid([
    { label: 'Population Category', value: populationCategories[groundRisk.populationCategory]?.label || 'Not specified' },
    { label: 'UA Characteristic', value: uaCharacteristics[groundRisk.uaCharacteristic]?.label || 'Not specified' },
    { label: 'Intrinsic GRC', value: groundRisk.intrinsicGRC || 'N/A' },
    { label: 'Final GRC', value: groundRisk.finalGRC || 'N/A' }
  ])

  pdf.addSubsectionTitle('3.2 Ground Risk Mitigations')
  const mitigations = groundRisk.mitigations || {}
  const mitigationRows = Object.entries(mitigations)
    .filter(([_, m]) => m.enabled)
    .map(([key, m]) => [
      groundMitigations[key]?.name || key,
      m.robustness || 'N/A',
      groundMitigations[key]?.reductions[m.robustness] ? `${groundMitigations[key].reductions[m.robustness]}` : 'N/A'
    ])

  if (mitigationRows.length > 0) {
    pdf.addTable(['Mitigation', 'Robustness', 'GRC Reduction'], mitigationRows)
  } else {
    pdf.addParagraph('No ground risk mitigations applied.')
  }

  // Section 4: Air Risk Management
  pdf.addNewSection('4. Air Risk Management')

  const airRisk = assessment.airRisk || {}
  pdf.addSubsectionTitle('4.1 Air Risk Classification')
  pdf.addKeyValueGrid([
    { label: 'Initial ARC', value: airRisk.initialARC || 'Not specified' },
    { label: 'Airspace Type', value: airRisk.airspaceType || 'Not specified' },
    { label: 'TMPR Applied', value: airRisk.tmpr?.enabled ? airRisk.tmpr.type : 'None' },
    { label: 'Residual ARC', value: airRisk.residualARC || 'N/A' }
  ])

  if (airRisk.tmpr?.enabled) {
    pdf.addSubsectionTitle('4.2 Tactical Mitigation')
    const tmprDef = tmprDefinitions[airRisk.tmpr.type]
    pdf.addParagraph(tmprDef?.description || 'Tactical mitigation applied.')
    pdf.addLabelValue('Robustness Level', airRisk.tmpr.robustness || 'N/A')
  }

  // Section 5: Containment
  pdf.addNewSection('5. Containment Strategy')

  const containment = assessment.containment || {}
  pdf.addKeyValueGrid([
    { label: 'Adjacent Population', value: populationCategories[containment.adjacentPopulation]?.label || 'Not specified' },
    { label: 'Containment Method', value: containmentMethods[containment.method]?.label || 'Not specified' },
    { label: 'Required Robustness', value: containment.requiredRobustness || 'N/A' },
    { label: 'Achieved Robustness', value: containment.achievedRobustness || 'N/A' }
  ])

  const selectedMethod = containmentMethods[containment.method]
  if (selectedMethod?.evidenceRequired?.length > 0) {
    pdf.addSubsectionTitle('5.1 Containment Evidence Required')
    selectedMethod.evidenceRequired.forEach(req => {
      pdf.addParagraph(`• ${req}`)
    })
  }

  // Section 6: OSO Compliance Summary
  pdf.addNewSection('6. Operational Safety Objectives (OSO)')

  if (sail) {
    const statusMap = {}
    osoStatuses.forEach(oso => {
      statusMap[oso.osoId] = { robustness: oso.robustness, evidence: oso.evidence }
    })
    const compliance = checkAllOSOCompliance(sail, statusMap)

    pdf.addKPIRow([
      { label: 'Total OSOs', value: compliance.summary.total },
      { label: 'Compliant', value: compliance.summary.compliant },
      { label: 'Non-Compliant', value: compliance.summary.nonCompliant },
      { label: 'Optional', value: compliance.summary.optional }
    ])

    if (compliance.summary.nonCompliant > 0) {
      pdf.addInfoBox('Action Required',
        `${compliance.summary.nonCompliant} OSO(s) require additional compliance evidence.`,
        'warning')

      pdf.addSubsectionTitle('6.1 Non-Compliant OSOs')
      const nonCompliantOsos = compliance.results.filter(r => !r.compliant && r.required !== 'O')
      const osoRows = nonCompliantOsos.map(oso => [
        oso.id,
        oso.name,
        oso.requiredLabel,
        oso.actual || 'None'
      ])
      pdf.addTable(['OSO', 'Requirement', 'Required', 'Current'], osoRows)
    }
  } else {
    pdf.addParagraph('SAIL level not determined. Complete SORA assessment to generate OSO requirements.')
  }

  // Section 7: Signatures
  pdf.addNewSection('7. Approval')
  pdf.addSignatureBlock([
    { role: 'Safety Manager', name: '' },
    { role: 'Operations Manager', name: '' },
    { role: 'Accountable Executive', name: '' }
  ])

  return pdf
}

// ============================================
// EMERGENCY RESPONSE PLAN GENERATOR
// ============================================

/**
 * Generate Emergency Response Plan (ERP) PDF
 * @param {object} assessment - SORA assessment data
 * @param {object} options - Generation options
 * @returns {BrandedPDF} PDF document
 */
export async function generateERPPDF(assessment, options = {}) {
  const { branding, project, emergencyContacts = [] } = options
  const conops = assessment.conops || {}

  const pdf = new BrandedPDF({
    title: 'Emergency Response Plan',
    subtitle: `SFOC Application: ${assessment.name || 'Unnamed'}`,
    projectName: project?.name || assessment.name || '',
    projectCode: assessment.id?.slice(0, 8).toUpperCase() || '',
    clientName: project?.clientName || '',
    branding
  })

  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()

  // Section 1: Purpose
  pdf.addNewSection('1. Purpose and Scope')
  pdf.addParagraph('This Emergency Response Plan (ERP) establishes procedures for responding to emergencies during RPAS operations. All personnel must be familiar with these procedures and their assigned responsibilities.')

  pdf.addInfoBox('Applicability',
    'This ERP applies to all flight operations conducted under this SFOC and must be available to all crew members during operations.',
    'info')

  // Section 2: Emergency Contacts
  pdf.addNewSection('2. Emergency Contacts')

  pdf.addSubsectionTitle('2.1 External Emergency Services')
  pdf.addTable(
    ['Service', 'Contact Number', 'Notes'],
    [
      ['Emergency Services', '911', 'Fire, Police, Ambulance'],
      ['Local Police', '[Enter local number]', 'Non-emergency line'],
      ['Nearest Hospital', '[Enter hospital name]', '[Enter address]'],
      ['Transport Canada RPAS Centre', '1-800-305-2059', 'Incident reporting']
    ]
  )

  pdf.addSubsectionTitle('2.2 Operational Contacts')
  if (emergencyContacts.length > 0) {
    const contactRows = emergencyContacts.map(c => [
      c.name || 'N/A',
      c.role || 'N/A',
      c.phone || 'N/A',
      c.email || 'N/A'
    ])
    pdf.addTable(['Name', 'Role', 'Phone', 'Email'], contactRows)
  } else {
    pdf.addTable(
      ['Role', 'Name', 'Phone', 'Email'],
      [
        ['Pilot in Command', '[PIC Name]', '[Phone]', '[Email]'],
        ['Operations Manager', '[Manager Name]', '[Phone]', '[Email]'],
        ['Safety Manager', '[Safety Mgr Name]', '[Phone]', '[Email]'],
        ['Client Contact', '[Client Name]', '[Phone]', '[Email]']
      ]
    )
  }

  // Section 3: Emergency Categories
  pdf.addNewSection('3. Emergency Categories')

  pdf.addSubsectionTitle('3.1 Flyaway / Loss of Control')
  pdf.addParagraph('A flyaway occurs when the aircraft departs from controlled flight and cannot be recovered by the remote pilot.')
  pdf.addInfoBox('Immediate Actions',
    '1. Attempt emergency landing procedure\n2. Activate flight termination if equipped\n3. Alert all personnel to clear area\n4. Contact ATC if in controlled airspace',
    'danger')

  pdf.addSubsectionTitle('3.2 Loss of C3 Link')
  pdf.addParagraph('Loss of command, control, and communications link with the aircraft.')
  pdf.addInfoBox('Immediate Actions',
    '1. Execute lost link procedure\n2. Monitor return-to-home behavior\n3. Clear recovery area\n4. Prepare for manual intervention if required',
    'warning')

  pdf.addSubsectionTitle('3.3 Collision or Near Miss')
  pdf.addParagraph('Collision with or near miss of manned aircraft, people, or property.')
  pdf.addInfoBox('Immediate Actions',
    '1. Terminate flight immediately\n2. Render assistance if safe\n3. Call 911 if injuries\n4. Preserve evidence\n5. Report to Transport Canada within 24 hours',
    'danger')

  pdf.addSubsectionTitle('3.4 Injury to Personnel')
  pdf.addParagraph('Any injury to crew members or bystanders during operations.')
  pdf.addInfoBox('Immediate Actions',
    '1. Terminate flight immediately\n2. Render first aid\n3. Call 911 for serious injuries\n4. Document incident\n5. Report per regulatory requirements',
    'danger')

  pdf.addSubsectionTitle('3.5 Fire')
  pdf.addParagraph('Fire involving the aircraft, batteries, or surrounding area.')
  pdf.addInfoBox('Immediate Actions',
    '1. Evacuate personnel to safe distance\n2. Call 911\n3. Use fire extinguisher only if safe\n4. DO NOT approach lithium battery fires\n5. Contain area until fire department arrives',
    'danger')

  // Section 4: Reporting Requirements
  pdf.addNewSection('4. Incident Reporting')

  pdf.addSubsectionTitle('4.1 Transport Canada Reporting')
  pdf.addParagraph('The following incidents must be reported to Transport Canada:')
  pdf.addParagraph('• Injuries requiring medical attention beyond first aid')
  pdf.addParagraph('• Collision with manned aircraft')
  pdf.addParagraph('• Interference with manned aviation')
  pdf.addParagraph('• Damage to property exceeding $1,000')
  pdf.addParagraph('• Any incident that poses a risk to aviation safety')

  pdf.addInfoBox('Reporting Timeline',
    'IMMEDIATE: Contact ATC if in controlled airspace\n24 HOURS: Report to Transport Canada RPAS Centre\n30 DAYS: Submit written incident report',
    'info')

  pdf.addSubsectionTitle('4.2 Internal Reporting')
  pdf.addParagraph('All incidents, near misses, and hazardous occurrences must be documented in the internal safety reporting system within 24 hours of the event.')

  // Section 5: Muster Points
  pdf.addNewSection('5. Emergency Assembly')

  pdf.addSubsectionTitle('5.1 Muster Point')
  pdf.addParagraph('In the event of an emergency requiring evacuation, all personnel shall assemble at the designated muster point. The muster point should be:')
  pdf.addParagraph('• Minimum 100m from the flight operations area')
  pdf.addParagraph('• Clear of potential flyaway trajectories')
  pdf.addParagraph('• Accessible by emergency vehicles')
  pdf.addParagraph('• Clearly identified before operations begin')

  pdf.addSubsectionTitle('5.2 Personnel Accounting')
  pdf.addParagraph('The PIC or designated safety officer is responsible for accounting for all personnel following an emergency evacuation.')

  // Section 6: Equipment
  pdf.addNewSection('6. Emergency Equipment')

  pdf.addSubsectionTitle('6.1 Required Equipment')
  pdf.addTable(
    ['Item', 'Location', 'Responsible'],
    [
      ['First Aid Kit', 'GCS/Vehicle', 'PIC'],
      ['Fire Extinguisher (ABC)', 'Vehicle', 'PIC'],
      ['Emergency Beacon/Light', 'GCS', 'PIC'],
      ['Communication Device', 'GCS', 'PIC'],
      ['Site Map', 'GCS', 'PIC'],
      ['This ERP Document', 'GCS', 'PIC']
    ]
  )

  // Section 7: Revision History
  pdf.addNewSection('7. Document Control')
  pdf.addKeyValuePairs([
    ['Document Version', '1.0'],
    ['Effective Date', new Date().toLocaleDateString('en-CA')],
    ['Next Review Date', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA')],
    ['Assessment ID', assessment.id || 'N/A']
  ])

  pdf.addSignatureBlock([
    { role: 'Prepared By', name: '' },
    { role: 'Reviewed By', name: '' },
    { role: 'Approved By', name: '' }
  ])

  return pdf
}

// ============================================
// COMPREHENSIVE SORA REPORT GENERATOR
// ============================================

/**
 * Generate comprehensive SORA Assessment Report PDF
 * @param {object} assessment - Complete SORA assessment data
 * @param {object} options - Generation options
 * @returns {BrandedPDF} PDF document
 */
export async function generateSORAReportPDF(assessment, options = {}) {
  const { branding, project, osoStatuses = [] } = options

  const pdf = new BrandedPDF({
    title: 'SORA Assessment Report',
    subtitle: 'JARUS SORA 2.5 Methodology',
    projectName: project?.name || assessment.name || '',
    projectCode: assessment.id?.slice(0, 8).toUpperCase() || '',
    clientName: project?.clientName || '',
    branding
  })

  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()

  // Executive Summary
  pdf.addNewSection('Executive Summary')

  const sail = assessment.sail?.level
  const grc = assessment.groundRisk?.finalGRC
  const arc = assessment.airRisk?.residualARC

  pdf.addParagraph(`This report documents the Specific Operations Risk Assessment (SORA) for ${assessment.name || 'the proposed operation'}. The assessment follows the JARUS SORA 2.5 methodology as adopted by Transport Canada for SFOC applications.`)

  pdf.addKPIRow([
    { label: 'SAIL Level', value: sail || 'N/A' },
    { label: 'Final GRC', value: grc || 'N/A' },
    { label: 'Residual ARC', value: arc?.replace('ARC-', '') || 'N/A' },
    { label: 'Status', value: assessment.status || 'Draft' }
  ])

  if (sail) {
    pdf.addInfoBox('Assessment Result',
      `SAIL ${sail}: ${sailDescriptions[sail]}`,
      sail <= 'II' ? 'success' : sail <= 'IV' ? 'warning' : 'danger')
  }

  // Step 1: ConOps Summary
  pdf.addNewSection('Step 1: Concept of Operations')

  const conops = assessment.conops || {}
  pdf.addSubsectionTitle('Operation Description')
  pdf.addParagraph(conops.operationDescription?.purpose || 'No operation description provided.')

  pdf.addSubsectionTitle('UAS Description')
  const uas = conops.uasDescription || {}
  pdf.addKeyValueGrid([
    { label: 'Manufacturer/Model', value: `${uas.manufacturer || 'N/A'} ${uas.model || ''}`.trim() },
    { label: 'MTOW', value: uas.mtow ? `${uas.mtow} kg` : 'N/A' },
    { label: 'Max Dimension', value: uas.maxDimension ? `${uas.maxDimension} m` : 'N/A' },
    { label: 'Max Speed', value: uas.maxSpeed ? `${uas.maxSpeed} m/s` : 'N/A' }
  ])

  pdf.addSubsectionTitle('Operating Environment')
  const env = conops.operatingEnvironment || {}
  pdf.addKeyValueGrid([
    { label: 'Max Altitude', value: env.maxAltitudeAGL ? `${env.maxAltitudeAGL} ft AGL` : 'N/A' },
    { label: 'Airspace Class', value: env.airspaceClass || 'N/A' },
    { label: 'Population Density', value: populationCategories[env.populationCategory]?.label || 'N/A' },
    { label: 'Operation Type', value: conops.operationDescription?.vlosType || 'VLOS' }
  ])

  // Step 2: Ground Risk Determination
  pdf.addNewSection('Step 2: Ground Risk Assessment')

  const groundRisk = assessment.groundRisk || {}

  pdf.addSubsectionTitle('Intrinsic Ground Risk Class (iGRC)')
  pdf.addParagraph('The iGRC is determined by the population density of the operational area and the UA characteristic dimension/speed category.')

  pdf.addKeyValueGrid([
    { label: 'Population Category', value: populationCategories[groundRisk.populationCategory]?.label || 'N/A' },
    { label: 'UA Characteristic', value: uaCharacteristics[groundRisk.uaCharacteristic]?.label || 'N/A' },
    { label: 'Intrinsic GRC', value: groundRisk.intrinsicGRC || 'N/A' },
    { label: 'Final GRC', value: groundRisk.finalGRC || 'N/A' }
  ])

  // Ground Risk Mitigations
  pdf.addSubsectionTitle('Ground Risk Mitigations')
  const mitigations = groundRisk.mitigations || {}
  const activeMitigations = Object.entries(mitigations).filter(([_, m]) => m.enabled)

  if (activeMitigations.length > 0) {
    const mitRows = activeMitigations.map(([key, m]) => {
      const mitDef = groundMitigations[key]
      const reduction = mitDef?.reductions[m.robustness] || 0
      return [
        key,
        mitDef?.name || key,
        m.robustness || 'N/A',
        reduction.toString()
      ]
    })
    pdf.addTable(['Code', 'Mitigation', 'Robustness', 'Reduction'], mitRows)
  } else {
    pdf.addParagraph('No ground risk mitigations applied.')
  }

  const iGRC = groundRisk.intrinsicGRC || 0
  const fGRC = groundRisk.finalGRC || iGRC
  if (iGRC && fGRC && iGRC !== fGRC) {
    pdf.addInfoBox('GRC Reduction',
      `Ground risk reduced from iGRC ${iGRC} to final GRC ${fGRC} (reduction of ${iGRC - fGRC})`,
      'success')
  }

  // Step 3: Air Risk Determination
  pdf.addNewSection('Step 3: Air Risk Assessment')

  const airRisk = assessment.airRisk || {}

  pdf.addSubsectionTitle('Initial Air Risk Class')
  pdf.addKeyValueGrid([
    { label: 'Initial ARC', value: airRisk.initialARC || 'N/A' },
    { label: 'Airspace Type', value: airRisk.airspaceType || 'N/A' }
  ])

  if (airRisk.initialARC) {
    const arcDef = arcLevels[airRisk.initialARC]
    if (arcDef) {
      pdf.addParagraph(`${arcDef.description}. Encounter rate: ${arcDef.encounters}.`)
    }
  }

  pdf.addSubsectionTitle('Tactical Mitigation Performance Requirement (TMPR)')
  if (airRisk.tmpr?.enabled) {
    const tmprDef = tmprDefinitions[airRisk.tmpr.type]
    pdf.addKeyValueGrid([
      { label: 'TMPR Type', value: airRisk.tmpr.type || 'N/A' },
      { label: 'Description', value: tmprDef?.description || 'N/A' },
      { label: 'Robustness', value: airRisk.tmpr.robustness || 'N/A' },
      { label: 'ARC Reduction', value: tmprDef?.arcReduction || 'N/A' }
    ])
  } else {
    pdf.addParagraph('No tactical mitigation applied.')
  }

  pdf.addSubsectionTitle('Residual Air Risk')
  pdf.addKeyValueGrid([
    { label: 'Initial ARC', value: airRisk.initialARC || 'N/A' },
    { label: 'TMPR Applied', value: airRisk.tmpr?.enabled ? 'Yes' : 'No' },
    { label: 'Residual ARC', value: airRisk.residualARC || 'N/A' }
  ])

  // Step 4: SAIL Determination
  pdf.addNewSection('Step 4: SAIL Determination')

  pdf.addParagraph('The Specific Assurance and Integrity Level (SAIL) is determined by cross-referencing the final GRC with the residual ARC in Table 7 of SORA 2.5.')

  // SAIL Matrix visualization
  pdf.addSubsectionTitle('SAIL Matrix (Table 7)')
  pdf.addTable(
    ['Final GRC', 'ARC-a', 'ARC-b', 'ARC-c', 'ARC-d'],
    [
      ['≤2', 'I', 'II', 'IV', 'VI'],
      ['3', 'II', 'II', 'IV', 'VI'],
      ['4', 'III', 'III', 'IV', 'VI'],
      ['5', 'IV', 'IV', 'IV', 'VI'],
      ['6', 'V', 'V', 'V', 'VI'],
      ['7', 'VI', 'VI', 'VI', 'VI']
    ]
  )

  if (sail) {
    pdf.addInfoBox('Determined SAIL',
      `With Final GRC ${grc} and Residual ARC ${arc}, the operation requires SAIL ${sail}.\n\n${sailDescriptions[sail]}`,
      sail <= 'II' ? 'success' : sail <= 'IV' ? 'warning' : 'danger')
  }

  // Step 5: Containment
  pdf.addNewSection('Step 5: Containment Assessment')

  const containment = assessment.containment || {}
  pdf.addKeyValueGrid([
    { label: 'Adjacent Area Population', value: populationCategories[containment.adjacentPopulation]?.label || 'N/A' },
    { label: 'Containment Method', value: containmentMethods[containment.method]?.label || 'N/A' },
    { label: 'Required Robustness', value: containment.requiredRobustness || 'N/A' },
    { label: 'Achieved Robustness', value: containment.achievedRobustness || 'N/A' }
  ])

  const containmentOK = containment.achievedRobustness && containment.requiredRobustness &&
    ['none', 'low', 'medium', 'high'].indexOf(containment.achievedRobustness) >=
    ['none', 'low', 'medium', 'high'].indexOf(containment.requiredRobustness)

  if (containmentOK) {
    pdf.addInfoBox('Containment Satisfied',
      'Achieved robustness meets or exceeds required robustness level.',
      'success')
  } else if (containment.requiredRobustness) {
    pdf.addInfoBox('Containment Gap',
      'Additional containment measures may be required to meet robustness requirements.',
      'warning')
  }

  // Step 6: OSO Compliance
  pdf.addNewSection('Step 6: OSO Compliance')

  if (sail) {
    const statusMap = {}
    osoStatuses.forEach(oso => {
      statusMap[oso.osoId] = { robustness: oso.robustness, evidence: oso.evidence }
    })
    const compliance = checkAllOSOCompliance(sail, statusMap)

    pdf.addKPIRow([
      { label: 'Total OSOs', value: compliance.summary.total },
      { label: 'Compliant', value: compliance.summary.compliant },
      { label: 'Non-Compliant', value: compliance.summary.nonCompliant },
      { label: 'Overall Status', value: compliance.summary.overallCompliant ? 'PASS' : 'GAPS' }
    ])

    // OSO Details by Category
    Object.entries(osoCategories).forEach(([catKey, category]) => {
      pdf.addSubsectionTitle(category.label)
      const catOsos = compliance.results.filter(r => category.osos.includes(r.id))
      const osoRows = catOsos.map(oso => [
        oso.id,
        oso.name.substring(0, 40) + (oso.name.length > 40 ? '...' : ''),
        oso.requiredLabel,
        oso.actual || 'None',
        oso.compliant ? 'Yes' : 'No'
      ])
      pdf.addTable(['OSO', 'Requirement', 'Required', 'Achieved', 'Compliant'], osoRows)
    })

    if (!compliance.summary.overallCompliant) {
      pdf.addInfoBox('Action Required',
        `${compliance.summary.nonCompliant} OSO(s) do not meet the required robustness level for SAIL ${sail}. Additional evidence or mitigation measures are required.`,
        'danger')
    }
  } else {
    pdf.addParagraph('SAIL level not determined. Complete previous steps to generate OSO requirements.')
  }

  // Conclusions
  pdf.addNewSection('Conclusions')

  pdf.addSubsectionTitle('Assessment Summary')
  pdf.addKeyValuePairs([
    ['Assessment Name', assessment.name || 'N/A'],
    ['Assessment ID', assessment.id || 'N/A'],
    ['SAIL Level', sail || 'Not determined'],
    ['Final GRC', grc || 'Not determined'],
    ['Residual ARC', arc || 'Not determined'],
    ['Assessment Date', new Date().toLocaleDateString('en-CA')],
    ['Status', assessment.status || 'Draft']
  ])

  // Approval Section
  pdf.addNewSection('Approval')
  pdf.addSignatureBlock([
    { role: 'SORA Assessor', name: '' },
    { role: 'Technical Reviewer', name: '' },
    { role: 'Operations Manager', name: '' }
  ])

  return pdf
}

// ============================================
// COMPLETE SFOC PACKAGE GENERATOR
// ============================================

/**
 * Generate complete SFOC application package
 * Combines all required documents
 * @param {object} assessment - SORA assessment data
 * @param {object} options - Generation options
 * @returns {object} Object with all generated PDFs
 */
export async function generateSFOCPackage(assessment, options = {}) {
  const results = {
    conops: null,
    safetyPlan: null,
    erp: null,
    soraReport: null,
    errors: []
  }

  try {
    results.conops = await generateConOpsPDF(assessment, options)
  } catch (err) {
    results.errors.push({ document: 'ConOps', error: err.message })
  }

  try {
    results.safetyPlan = await generateSafetyPlanPDF(assessment, options)
  } catch (err) {
    results.errors.push({ document: 'Safety Plan', error: err.message })
  }

  try {
    results.erp = await generateERPPDF(assessment, options)
  } catch (err) {
    results.errors.push({ document: 'ERP', error: err.message })
  }

  try {
    results.soraReport = await generateSORAReportPDF(assessment, options)
  } catch (err) {
    results.errors.push({ document: 'SORA Report', error: err.message })
  }

  return results
}

// ============================================
// EXPORT HELPERS
// ============================================

/**
 * Save PDF with standardized filename
 * @param {BrandedPDF} pdf - PDF document
 * @param {string} type - Document type
 * @param {string} assessmentId - Assessment ID
 */
export function saveSFOCDocument(pdf, type, assessmentId) {
  const typeLabels = {
    conops: 'ConOps',
    safetyPlan: 'SafetyPlan',
    erp: 'ERP',
    soraReport: 'SORA_Report'
  }
  const label = typeLabels[type] || type
  const date = new Date().toISOString().split('T')[0]
  const filename = `SFOC_${label}_${assessmentId?.slice(0, 8) || 'draft'}_${date}.pdf`
  pdf.save(filename)
  return filename
}

export default {
  generateConOpsPDF,
  generateSafetyPlanPDF,
  generateERPPDF,
  generateSORAReportPDF,
  generateSFOCPackage,
  saveSFOCDocument
}
