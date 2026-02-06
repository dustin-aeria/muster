/**
 * MPD Document Generator
 * Generate Manufacturer Performance Declaration documents
 * for Transport Canada SFOC applications
 *
 * Per Transport Canada guidance:
 * - Required for RPAS >150kg
 * - Required for certain BVLOS operations
 * - Evidence requirements scale with SAIL level
 *
 * @location src/lib/mpdDocumentGenerator.js
 */

import { BrandedPDF } from './pdfExportService'
import {
  osoDefinitions,
  osoCategories,
  sailDescriptions,
  mpdRequirementsBySAIL,
  highRobustnessOSOsBySAIL,
  checkAllOSOCompliance
} from './soraConfig'

// ============================================
// MPD SECTIONS CONFIGURATION
// ============================================

/**
 * Standard MPD sections per Transport Canada template
 */
export const mpdSections = {
  uasIdentification: {
    id: 'uasIdentification',
    title: '1. UAS Identification',
    description: 'Details of the Unmanned Aircraft System',
    fields: [
      { id: 'manufacturer', label: 'Manufacturer Name', required: true },
      { id: 'model', label: 'Model/Type Designation', required: true },
      { id: 'serialNumber', label: 'Serial Number(s)', required: true },
      { id: 'softwareVersion', label: 'Software Version', required: true },
      { id: 'mtow', label: 'Maximum Take-Off Weight (kg)', required: true },
      { id: 'maxDimension', label: 'Maximum Characteristic Dimension (m)', required: true },
      { id: 'propulsionType', label: 'Propulsion Type', required: true },
      { id: 'powerSource', label: 'Power Source', required: true }
    ]
  },
  designOrganization: {
    id: 'designOrganization',
    title: '2. Design Organization',
    description: 'Information about the organization responsible for UAS design',
    fields: [
      { id: 'orgName', label: 'Organization Name', required: true },
      { id: 'orgAddress', label: 'Address', required: true },
      { id: 'contactName', label: 'Contact Person', required: true },
      { id: 'contactEmail', label: 'Contact Email', required: true },
      { id: 'contactPhone', label: 'Contact Phone', required: true },
      { id: 'qmsStatus', label: 'Quality Management System', required: false },
      { id: 'designStandards', label: 'Design Standards Applied', required: false }
    ]
  },
  performanceSpecs: {
    id: 'performanceSpecs',
    title: '3. Performance Specifications',
    description: 'Declared performance characteristics',
    fields: [
      { id: 'maxSpeed', label: 'Maximum Speed (m/s)', required: true },
      { id: 'maxAltitude', label: 'Maximum Operating Altitude (ft AGL)', required: true },
      { id: 'maxRange', label: 'Maximum Range (km)', required: true },
      { id: 'maxEndurance', label: 'Maximum Endurance (min)', required: true },
      { id: 'operatingTemp', label: 'Operating Temperature Range', required: true },
      { id: 'windLimits', label: 'Wind Speed Limits (km/h)', required: true },
      { id: 'ipRating', label: 'IP Rating', required: false }
    ]
  },
  safetyFeatures: {
    id: 'safetyFeatures',
    title: '4. Safety Features',
    description: 'Built-in safety systems and features',
    subsections: [
      {
        id: 'flightTermination',
        label: 'Flight Termination System',
        fields: [
          { id: 'ftsEquipped', label: 'FTS Equipped', type: 'boolean' },
          { id: 'ftsType', label: 'FTS Type' },
          { id: 'ftsActivation', label: 'Activation Method' },
          { id: 'ftsReliability', label: 'Declared Reliability' }
        ]
      },
      {
        id: 'geofencing',
        label: 'Geofencing',
        fields: [
          { id: 'geofenceEquipped', label: 'Geofencing Equipped', type: 'boolean' },
          { id: 'geofenceType', label: 'Geofence Type' },
          { id: 'geofenceAccuracy', label: 'Position Accuracy' }
        ]
      },
      {
        id: 'returnToHome',
        label: 'Return to Home',
        fields: [
          { id: 'rthEquipped', label: 'RTH Equipped', type: 'boolean' },
          { id: 'rthTriggers', label: 'RTH Triggers' },
          { id: 'rthBehavior', label: 'RTH Behavior' }
        ]
      },
      {
        id: 'lostLink',
        label: 'Lost Link Behavior',
        fields: [
          { id: 'lostLinkProcedure', label: 'Lost Link Procedure' },
          { id: 'lostLinkTimeout', label: 'Timeout Before Action (s)' }
        ]
      }
    ]
  },
  c3Link: {
    id: 'c3Link',
    title: '5. Command, Control & Communication',
    description: 'C3 link specifications and characteristics',
    fields: [
      { id: 'c3Type', label: 'C3 Link Type', required: true },
      { id: 'frequency', label: 'Operating Frequency', required: true },
      { id: 'range', label: 'Nominal Range', required: true },
      { id: 'latency', label: 'Typical Latency', required: false },
      { id: 'redundancy', label: 'Link Redundancy', required: false },
      { id: 'encryption', label: 'Encryption', required: false }
    ]
  },
  reliability: {
    id: 'reliability',
    title: '6. Reliability & Safety Analysis',
    description: 'System reliability and safety assessment data',
    fields: [
      { id: 'mtbf', label: 'Mean Time Between Failures', required: false },
      { id: 'safetyAnalysis', label: 'Safety Analysis Performed', required: true },
      { id: 'fhaPerformed', label: 'FHA Performed', type: 'boolean' },
      { id: 'fmeaPerformed', label: 'FMEA Performed', type: 'boolean' },
      { id: 'testingHours', label: 'Total Flight Test Hours', required: false }
    ]
  },
  osoCompliance: {
    id: 'osoCompliance',
    title: '7. OSO Compliance',
    description: 'Declaration of compliance with designer-responsibility OSOs',
    designerOSOs: ['OSO-02', 'OSO-04', 'OSO-05', 'OSO-06', 'OSO-18', 'OSO-19', 'OSO-20', 'OSO-21', 'OSO-24']
  },
  declaration: {
    id: 'declaration',
    title: '8. Declaration',
    description: 'Formal declaration of compliance'
  }
}

/**
 * Designer-responsible OSOs requiring MPD compliance
 */
export const designerOSOs = osoDefinitions.filter(oso => oso.responsibility === 'designer')

// ============================================
// MPD PDF GENERATOR
// ============================================

/**
 * Generate Manufacturer Performance Declaration PDF
 * @param {object} declaration - MPD declaration data
 * @param {object} options - Generation options
 * @returns {BrandedPDF} PDF document
 */
export async function generateMPDPDF(declaration, options = {}) {
  const { branding, assessment, osoStatuses = [] } = options
  const sail = assessment?.sail?.level || declaration.sail || 'IV'
  const mpdReqs = mpdRequirementsBySAIL[sail] || mpdRequirementsBySAIL['IV']

  const pdf = new BrandedPDF({
    title: 'Manufacturer Performance Declaration',
    subtitle: `SAIL ${sail} - ${mpdReqs.label}`,
    projectName: declaration.uasIdentification?.model || 'UAS Declaration',
    projectCode: declaration.id?.slice(0, 8).toUpperCase() || '',
    clientName: declaration.designOrganization?.orgName || '',
    branding
  })

  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()

  // Introduction
  pdf.addNewSection('Introduction')

  pdf.addParagraph('This Manufacturer Performance Declaration (MPD) is submitted in accordance with Transport Canada requirements for RPAS operations requiring a Special Flight Operations Certificate (SFOC).')

  pdf.addInfoBox('Declaration Type',
    `${mpdReqs.label}\n${mpdReqs.description}`,
    mpdReqs.thirdPartyRequired ? 'warning' : 'info')

  pdf.addParagraph(`Evidence Level Required: ${mpdReqs.evidenceLevel?.toUpperCase() || 'MEDIUM'}`)
  pdf.addParagraph(`Third-Party Verification: ${mpdReqs.thirdPartyRequired ? 'Required' : 'Not Required'}`)

  // Section 1: UAS Identification
  pdf.addNewSection(mpdSections.uasIdentification.title)

  const uasId = declaration.uasIdentification || {}
  pdf.addKeyValueGrid([
    { label: 'Manufacturer', value: uasId.manufacturer || '[Not Provided]' },
    { label: 'Model/Type', value: uasId.model || '[Not Provided]' },
    { label: 'Serial Number', value: uasId.serialNumber || '[Not Provided]' },
    { label: 'Software Version', value: uasId.softwareVersion || '[Not Provided]' }
  ])

  pdf.addSubsectionTitle('Physical Characteristics')
  pdf.addKeyValueGrid([
    { label: 'MTOW', value: uasId.mtow ? `${uasId.mtow} kg` : '[Not Provided]' },
    { label: 'Max Dimension', value: uasId.maxDimension ? `${uasId.maxDimension} m` : '[Not Provided]' },
    { label: 'Propulsion', value: uasId.propulsionType || '[Not Provided]' },
    { label: 'Power Source', value: uasId.powerSource || '[Not Provided]' }
  ])

  // Section 2: Design Organization
  pdf.addNewSection(mpdSections.designOrganization.title)

  const designOrg = declaration.designOrganization || {}
  pdf.addKeyValuePairs([
    ['Organization Name', designOrg.orgName || '[Not Provided]'],
    ['Address', designOrg.orgAddress || '[Not Provided]'],
    ['Contact Person', designOrg.contactName || '[Not Provided]'],
    ['Email', designOrg.contactEmail || '[Not Provided]'],
    ['Phone', designOrg.contactPhone || '[Not Provided]']
  ])

  if (designOrg.qmsStatus) {
    pdf.addSubsectionTitle('Quality Management')
    pdf.addParagraph(designOrg.qmsStatus)
  }

  if (designOrg.designStandards) {
    pdf.addSubsectionTitle('Design Standards Applied')
    pdf.addParagraph(designOrg.designStandards)
  }

  // Section 3: Performance Specifications
  pdf.addNewSection(mpdSections.performanceSpecs.title)

  const perfSpecs = declaration.performanceSpecs || {}
  pdf.addSubsectionTitle('Flight Performance')
  pdf.addKeyValueGrid([
    { label: 'Max Speed', value: perfSpecs.maxSpeed ? `${perfSpecs.maxSpeed} m/s` : 'N/A' },
    { label: 'Max Altitude', value: perfSpecs.maxAltitude ? `${perfSpecs.maxAltitude} ft AGL` : 'N/A' },
    { label: 'Max Range', value: perfSpecs.maxRange ? `${perfSpecs.maxRange} km` : 'N/A' },
    { label: 'Max Endurance', value: perfSpecs.maxEndurance ? `${perfSpecs.maxEndurance} min` : 'N/A' }
  ])

  pdf.addSubsectionTitle('Environmental Limits')
  pdf.addKeyValueGrid([
    { label: 'Operating Temp', value: perfSpecs.operatingTemp || 'N/A' },
    { label: 'Wind Limits', value: perfSpecs.windLimits ? `${perfSpecs.windLimits} km/h` : 'N/A' },
    { label: 'IP Rating', value: perfSpecs.ipRating || 'N/A' }
  ])

  // Section 4: Safety Features
  pdf.addNewSection(mpdSections.safetyFeatures.title)

  const safetyFeatures = declaration.safetyFeatures || {}

  // Flight Termination System
  pdf.addSubsectionTitle('4.1 Flight Termination System (FTS)')
  const fts = safetyFeatures.flightTermination || {}
  if (fts.ftsEquipped) {
    pdf.addKeyValueGrid([
      { label: 'FTS Equipped', value: 'Yes' },
      { label: 'FTS Type', value: fts.ftsType || 'N/A' },
      { label: 'Activation Method', value: fts.ftsActivation || 'N/A' },
      { label: 'Declared Reliability', value: fts.ftsReliability || 'N/A' }
    ])
  } else {
    pdf.addParagraph('Flight Termination System: Not equipped')
  }

  // Geofencing
  pdf.addSubsectionTitle('4.2 Geofencing')
  const geofence = safetyFeatures.geofencing || {}
  if (geofence.geofenceEquipped) {
    pdf.addKeyValueGrid([
      { label: 'Geofencing', value: 'Equipped' },
      { label: 'Type', value: geofence.geofenceType || 'N/A' },
      { label: 'Position Accuracy', value: geofence.geofenceAccuracy || 'N/A' }
    ])
  } else {
    pdf.addParagraph('Geofencing: Not equipped')
  }

  // Return to Home
  pdf.addSubsectionTitle('4.3 Return to Home (RTH)')
  const rth = safetyFeatures.returnToHome || {}
  if (rth.rthEquipped) {
    pdf.addKeyValueGrid([
      { label: 'RTH', value: 'Equipped' },
      { label: 'Triggers', value: rth.rthTriggers || 'N/A' },
      { label: 'Behavior', value: rth.rthBehavior || 'N/A' }
    ])
  } else {
    pdf.addParagraph('Return to Home: Not equipped')
  }

  // Lost Link
  pdf.addSubsectionTitle('4.4 Lost Link Behavior')
  const lostLink = safetyFeatures.lostLink || {}
  pdf.addKeyValuePairs([
    ['Procedure', lostLink.lostLinkProcedure || 'Not specified'],
    ['Timeout', lostLink.lostLinkTimeout ? `${lostLink.lostLinkTimeout} seconds` : 'N/A']
  ])

  // Section 5: C3 Link
  pdf.addNewSection(mpdSections.c3Link.title)

  const c3 = declaration.c3Link || {}
  pdf.addKeyValueGrid([
    { label: 'Link Type', value: c3.c3Type || 'N/A' },
    { label: 'Frequency', value: c3.frequency || 'N/A' },
    { label: 'Nominal Range', value: c3.range || 'N/A' },
    { label: 'Latency', value: c3.latency || 'N/A' }
  ])

  if (c3.redundancy || c3.encryption) {
    pdf.addSubsectionTitle('Additional C3 Features')
    pdf.addKeyValuePairs([
      ['Link Redundancy', c3.redundancy || 'None'],
      ['Encryption', c3.encryption || 'None']
    ])
  }

  // Section 6: Reliability & Safety Analysis
  pdf.addNewSection(mpdSections.reliability.title)

  const reliability = declaration.reliability || {}
  pdf.addKeyValueGrid([
    { label: 'MTBF', value: reliability.mtbf || 'Not provided' },
    { label: 'Safety Analysis', value: reliability.safetyAnalysis || 'Not provided' },
    { label: 'FHA Performed', value: reliability.fhaPerformed ? 'Yes' : 'No' },
    { label: 'FMEA Performed', value: reliability.fmeaPerformed ? 'Yes' : 'No' }
  ])

  if (reliability.testingHours) {
    pdf.addLabelValue('Total Flight Test Hours', reliability.testingHours)
  }

  // Section 7: OSO Compliance
  pdf.addNewSection(mpdSections.osoCompliance.title)

  pdf.addParagraph('The following Operational Safety Objectives (OSOs) are the responsibility of the UAS designer/manufacturer. This section declares compliance with these requirements for the declared SAIL level.')

  // Get designer OSOs
  const designerResponsibleOSOs = osoDefinitions.filter(oso => oso.responsibility === 'designer')

  // Build status map
  const statusMap = {}
  osoStatuses.forEach(oso => {
    statusMap[oso.osoId] = { robustness: oso.robustness, evidence: oso.evidence }
  })

  // Check compliance for designer OSOs
  const sailOSORequirements = highRobustnessOSOsBySAIL[sail] || []

  pdf.addSubsectionTitle('Designer-Responsibility OSOs')
  const osoRows = designerResponsibleOSOs.map(oso => {
    const requirement = oso.requirements[sail] || 'O'
    const status = statusMap[oso.id] || { robustness: 'none' }
    const requirementMap = { 'O': 0, 'L': 1, 'M': 2, 'H': 3 }
    const robustnessMap = { 'none': 0, 'low': 1, 'medium': 2, 'high': 3 }
    const requiredLevel = requirementMap[requirement] ?? 0
    const actualLevel = robustnessMap[status.robustness] ?? 0
    const compliant = actualLevel >= requiredLevel

    return [
      oso.id,
      oso.name.substring(0, 35) + (oso.name.length > 35 ? '...' : ''),
      requirement === 'O' ? 'Optional' : requirement === 'L' ? 'Low' : requirement === 'M' ? 'Medium' : 'High',
      status.robustness ? status.robustness.charAt(0).toUpperCase() + status.robustness.slice(1) : 'None',
      compliant ? 'Yes' : requirement === 'O' ? 'N/A' : 'No'
    ]
  })

  pdf.addTable(['OSO', 'Requirement', 'Required', 'Declared', 'Compliant'], osoRows)

  // Evidence guidance for high SAIL
  if (['V', 'VI'].includes(sail)) {
    pdf.addInfoBox('High SAIL Evidence Requirements',
      'For SAIL V and VI, Transport Canada typically requires third-party verification of compliance claims. Supporting evidence should include test reports, certification documents, and independent assessments.',
      'warning')
  }

  // Section 8: Declaration
  pdf.addNewSection(mpdSections.declaration.title)

  pdf.addParagraph('I/We hereby declare that the information provided in this Manufacturer Performance Declaration is accurate and complete to the best of my/our knowledge.')

  pdf.addParagraph('I/We confirm that:')
  pdf.addParagraph('1. The UAS identified in this declaration meets the specifications and performance characteristics stated herein.')
  pdf.addParagraph('2. The UAS has been designed and manufactured in accordance with the standards and processes described.')
  pdf.addParagraph('3. The safety features and systems described function as specified.')
  pdf.addParagraph('4. We will notify Transport Canada and the operator of any changes that may affect compliance with this declaration.')

  if (mpdReqs.thirdPartyRequired) {
    pdf.addInfoBox('Third-Party Verification Required',
      `For SAIL ${sail}, this declaration must be supported by third-party verification. Attach relevant certification documents, audit reports, or verification evidence.`,
      'warning')
  }

  // Signature Block
  pdf.addSubsectionTitle('Authorized Signature')
  pdf.addKeyValuePairs([
    ['Organization', designOrg.orgName || '[Organization Name]'],
    ['Declaration Date', new Date().toLocaleDateString('en-CA')],
    ['Declaration ID', declaration.id || 'N/A']
  ])

  pdf.addSignatureBlock([
    { role: 'Authorized Representative', name: designOrg.contactName || '' },
    { role: 'Title', name: '' },
    { role: 'Date', name: '' }
  ])

  // Appendices placeholder
  pdf.addNewSection('Appendices')
  pdf.addParagraph('The following supporting documents should be attached to this declaration as required by the SAIL level:')

  if (['III', 'IV', 'V', 'VI'].includes(sail)) {
    pdf.addParagraph('• Design documentation and specifications')
    pdf.addParagraph('• Safety analysis reports (FHA, FMEA, or equivalent)')
  }

  if (['IV', 'V', 'VI'].includes(sail)) {
    pdf.addParagraph('• Test reports and verification evidence')
    pdf.addParagraph('• C3 link performance data')
  }

  if (['V', 'VI'].includes(sail)) {
    pdf.addParagraph('• Third-party audit or certification reports')
    pdf.addParagraph('• Environmental qualification test results')
    pdf.addParagraph('• Reliability demonstration data')
  }

  return pdf
}

// ============================================
// MPD TEMPLATE GENERATOR
// ============================================

/**
 * Generate blank MPD template for manufacturer to complete
 * @param {string} sail - Target SAIL level
 * @param {object} options - Generation options
 * @returns {BrandedPDF} PDF document
 */
export async function generateMPDTemplatePDF(sail = 'IV', options = {}) {
  const { branding } = options
  const mpdReqs = mpdRequirementsBySAIL[sail] || mpdRequirementsBySAIL['IV']

  const pdf = new BrandedPDF({
    title: 'Manufacturer Performance Declaration Template',
    subtitle: `SAIL ${sail} Requirements`,
    projectName: 'MPD Template',
    branding
  })

  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()

  // Instructions
  pdf.addNewSection('Instructions')

  pdf.addParagraph('This template is provided to assist manufacturers in preparing a Manufacturer Performance Declaration (MPD) for submission to Transport Canada as part of an SFOC application.')

  pdf.addInfoBox('SAIL Level Requirements',
    `This template is configured for SAIL ${sail} operations.\n${mpdReqs.description}\nEvidence Level: ${mpdReqs.evidenceLevel?.toUpperCase()}\nThird-Party Required: ${mpdReqs.thirdPartyRequired ? 'Yes' : 'No'}`,
    'info')

  pdf.addSubsectionTitle('Completing this Declaration')
  pdf.addParagraph('1. Fill in all required fields marked with an asterisk (*)')
  pdf.addParagraph('2. Provide supporting evidence as specified for each section')
  pdf.addParagraph('3. Ensure all technical specifications are accurate and verifiable')
  pdf.addParagraph('4. Have the declaration signed by an authorized representative')
  pdf.addParagraph('5. Attach all required appendices and supporting documents')

  // Section 1: UAS Identification
  pdf.addNewSection(mpdSections.uasIdentification.title)
  pdf.addParagraph(mpdSections.uasIdentification.description)

  const uasFields = mpdSections.uasIdentification.fields.map(f => [
    f.label + (f.required ? ' *' : ''),
    '',
    ''
  ])
  pdf.addTable(['Field', 'Value', 'Evidence Reference'], uasFields)

  // Section 2: Design Organization
  pdf.addNewSection(mpdSections.designOrganization.title)
  pdf.addParagraph(mpdSections.designOrganization.description)

  const orgFields = mpdSections.designOrganization.fields.map(f => [
    f.label + (f.required ? ' *' : ''),
    ''
  ])
  pdf.addTable(['Field', 'Value'], orgFields)

  // Section 3: Performance Specifications
  pdf.addNewSection(mpdSections.performanceSpecs.title)
  pdf.addParagraph(mpdSections.performanceSpecs.description)

  const perfFields = mpdSections.performanceSpecs.fields.map(f => [
    f.label + (f.required ? ' *' : ''),
    '',
    ''
  ])
  pdf.addTable(['Specification', 'Declared Value', 'Test Reference'], perfFields)

  // Section 4: Safety Features
  pdf.addNewSection(mpdSections.safetyFeatures.title)
  pdf.addParagraph(mpdSections.safetyFeatures.description)

  mpdSections.safetyFeatures.subsections.forEach(sub => {
    pdf.addSubsectionTitle(sub.label)
    const subFields = sub.fields.map(f => [
      f.label,
      '',
      ''
    ])
    pdf.addTable(['Feature', 'Value/Description', 'Evidence'], subFields)
  })

  // Section 5: C3 Link
  pdf.addNewSection(mpdSections.c3Link.title)
  pdf.addParagraph(mpdSections.c3Link.description)

  const c3Fields = mpdSections.c3Link.fields.map(f => [
    f.label + (f.required ? ' *' : ''),
    '',
    ''
  ])
  pdf.addTable(['Parameter', 'Specification', 'Test Reference'], c3Fields)

  // Section 6: Reliability
  pdf.addNewSection(mpdSections.reliability.title)
  pdf.addParagraph(mpdSections.reliability.description)

  const relFields = mpdSections.reliability.fields.map(f => [
    f.label + (f.required ? ' *' : ''),
    ''
  ])
  pdf.addTable(['Parameter', 'Value/Status'], relFields)

  // Section 7: OSO Compliance
  pdf.addNewSection(mpdSections.osoCompliance.title)
  pdf.addParagraph(mpdSections.osoCompliance.description)

  pdf.addSubsectionTitle('Designer-Responsibility OSOs')
  pdf.addParagraph('Complete the following table for each OSO that is the responsibility of the designer/manufacturer:')

  const designerOSORows = osoDefinitions
    .filter(oso => oso.responsibility === 'designer')
    .map(oso => {
      const req = oso.requirements[sail] || 'O'
      return [
        oso.id,
        oso.name.substring(0, 30) + '...',
        req === 'O' ? 'Optional' : req,
        '',
        ''
      ]
    })

  pdf.addTable(['OSO', 'Requirement', 'Required Level', 'Declared Level', 'Evidence Reference'], designerOSORows)

  // Evidence Guidance
  pdf.addSubsectionTitle('Evidence Guidance by Robustness Level')

  pdf.addParagraph('LOW Robustness:')
  pdf.addParagraph('• Basic documentation and manufacturer declarations')
  pdf.addParagraph('• Product specifications and user manuals')

  pdf.addParagraph('MEDIUM Robustness:')
  pdf.addParagraph('• Compliance matrices to recognized standards')
  pdf.addParagraph('• Design verification and test reports')
  pdf.addParagraph('• Analysis documentation (FHA, FMEA)')

  pdf.addParagraph('HIGH Robustness:')
  pdf.addParagraph('• Independent third-party verification')
  pdf.addParagraph('• Certification or type approval documentation')
  pdf.addParagraph('• Comprehensive test and demonstration records')

  // Section 8: Declaration
  pdf.addNewSection(mpdSections.declaration.title)

  pdf.addParagraph('I/We hereby declare that the information provided in this Manufacturer Performance Declaration is accurate and complete to the best of my/our knowledge.')

  pdf.addSubsectionTitle('Declaration Statements')
  pdf.addParagraph('☐ The UAS identified meets the specifications stated herein')
  pdf.addParagraph('☐ The UAS has been designed per described standards and processes')
  pdf.addParagraph('☐ Safety features function as specified')
  pdf.addParagraph('☐ We will notify of any changes affecting compliance')

  pdf.addSignatureBlock([
    { role: 'Authorized Representative', name: '' },
    { role: 'Title', name: '' },
    { role: 'Date', name: '' }
  ])

  // Required Appendices
  pdf.addNewSection('Required Appendices')

  pdf.addParagraph('Based on SAIL level requirements, attach the following:')

  const appendixReqs = [
    ['A', 'UAS Specifications Document', 'All SAIL levels'],
    ['B', 'Safety Analysis Report', 'SAIL III+'],
    ['C', 'Test Reports', 'SAIL IV+'],
    ['D', 'Third-Party Verification', 'SAIL V+'],
    ['E', 'Environmental Qualification', 'SAIL VI']
  ]

  pdf.addTable(['Appendix', 'Document', 'Required For'], appendixReqs)

  return pdf
}

// ============================================
// EXPORT HELPERS
// ============================================

/**
 * Save MPD PDF with standardized filename
 * @param {BrandedPDF} pdf - PDF document
 * @param {object} declaration - Declaration data
 * @param {string} type - 'declaration' or 'template'
 */
export function saveMPDDocument(pdf, declaration, type = 'declaration') {
  const uasModel = declaration?.uasIdentification?.model || 'UAS'
  const cleanModel = uasModel.replace(/[^a-zA-Z0-9]/g, '_')
  const date = new Date().toISOString().split('T')[0]
  const prefix = type === 'template' ? 'MPD_Template' : 'MPD'
  const filename = `${prefix}_${cleanModel}_${date}.pdf`
  pdf.save(filename)
  return filename
}

/**
 * Generate MPD from SORA assessment data
 * Pre-fills MPD with data from assessment
 * @param {object} assessment - SORA assessment
 * @param {object} options - Generation options
 * @returns {object} Pre-filled MPD declaration data
 */
export function prefillMPDFromAssessment(assessment) {
  const conops = assessment.conops || {}
  const uas = conops.uasDescription || {}

  return {
    sail: assessment.sail?.level || 'IV',
    uasIdentification: {
      manufacturer: uas.manufacturer || '',
      model: uas.model || '',
      serialNumber: uas.serialNumber || '',
      softwareVersion: uas.softwareVersion || '',
      mtow: uas.mtow || '',
      maxDimension: uas.maxDimension || '',
      propulsionType: uas.propulsionType || '',
      powerSource: uas.powerSource || ''
    },
    performanceSpecs: {
      maxSpeed: uas.maxSpeed || '',
      maxAltitude: conops.operatingEnvironment?.maxAltitudeAGL || '',
      maxRange: uas.maxRange || '',
      maxEndurance: uas.maxEndurance || '',
      operatingTemp: '',
      windLimits: conops.weatherLimitations?.maxWindSpeed || ''
    },
    designOrganization: {
      orgName: '',
      orgAddress: '',
      contactName: '',
      contactEmail: '',
      contactPhone: ''
    },
    safetyFeatures: {
      flightTermination: {},
      geofencing: {},
      returnToHome: {},
      lostLink: {}
    },
    c3Link: {},
    reliability: {}
  }
}

export default {
  mpdSections,
  designerOSOs,
  generateMPDPDF,
  generateMPDTemplatePDF,
  saveMPDDocument,
  prefillMPDFromAssessment
}
