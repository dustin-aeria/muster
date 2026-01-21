// ============================================
// COR AUDIT REPORT GENERATOR - OPTIMIZED
// HSE Program Report for COR Audit
// 
// @location src/lib/corReportGenerator.js
// @action REPLACE
// ============================================

import { BrandedPDF } from './pdfExportService'

// COR Audit Elements
export const COR_ELEMENTS = {
  management: { id: 'management', name: 'Management Leadership & Commitment', weight: 10 },
  hazard_assessment: { id: 'hazard_assessment', name: 'Hazard Assessment & Control', weight: 15 },
  safe_work: { id: 'safe_work', name: 'Safe Work Practices & Procedures', weight: 10 },
  training: { id: 'training', name: 'Training & Competency', weight: 15 },
  inspections: { id: 'inspections', name: 'Inspections', weight: 10 },
  investigations: { id: 'investigations', name: 'Incident Investigation & Reporting', weight: 15 },
  emergency: { id: 'emergency', name: 'Emergency Preparedness', weight: 10 },
  records: { id: 'records', name: 'Records & Statistics', weight: 10 },
  program_admin: { id: 'program_admin', name: 'Program Administration', weight: 5 }
}

// Complete Program Structure
export const PROGRAM_STRUCTURE = {
  hse: {
    name: 'Health, Safety & Environment',
    policies: [
      { code: 'HSE1022', name: 'Health & Safety Pledge' },
      { code: 'HSE1023', name: 'Commitment Statement' },
      { code: 'HSE1024', name: 'Workers Rights' },
      { code: 'HSE1025', name: 'Safety Management System' },
      { code: 'HSE1026', name: 'Certifications & Qualifications' },
      { code: 'HSE1027', name: 'Health & Safety Policy' },
      { code: 'HSE1028', name: 'Personal Protective Equipment' },
      { code: 'HSE1029', name: 'Vehicle Safety' },
      { code: 'HSE1030', name: 'COVID-19 Policy' },
      { code: 'HSE1031', name: 'Pandemic Disease Policy' },
      { code: 'HSE1032', name: 'Open Communication' },
      { code: 'HSE1033', name: 'Drug & Alcohol Policy' },
      { code: 'HSE1034', name: 'Refuse Unsafe Work' },
      { code: 'HSE1035', name: 'Harassment & Violence' },
      { code: 'HSE1036', name: 'Environmental Policy' },
      { code: 'HSE1037', name: 'Security Policy' },
      { code: 'HSE1038', name: 'Waste Disposal' },
      { code: 'HSE1039', name: 'Fatigue Management' },
      { code: 'HSE1040', name: 'Company Rules' },
      { code: 'HSE1041', name: 'General Safety Rules' },
      { code: 'HSE1042', name: 'Grounds for Dismissal' },
      { code: 'HSE1043', name: 'Public & Visitors Policy' },
      { code: 'HSE1044', name: 'Contractors Policy' },
      { code: 'HSE1045', name: 'Employer Duties' },
      { code: 'HSE1046', name: 'Part 13 Code Requirements' },
      { code: 'HSE1047', name: 'Hazard Assessment Policy' },
      { code: 'HSE1048', name: 'Hazard Control Policy' },
      { code: 'HSE1049', name: 'Inspection Policy' },
      { code: 'HSE1050', name: 'Preventative Maintenance' },
      { code: 'HSE1051', name: 'Emergency Response Policy' },
      { code: 'HSE1052', name: 'Investigations Policy' },
      { code: 'HSE1053', name: 'Systems Overview & Audit' }
    ]
  },
  rpas: {
    name: 'RPAS Operations',
    policies: [
      { code: 'RPAS1001', name: 'Team Competencies' },
      { code: 'RPAS1002', name: 'Roles & Responsibilities' },
      { code: 'RPAS1003', name: 'Airworthiness & Maintenance' },
      { code: 'RPAS1004', name: 'Personal Protective Equipment' },
      { code: 'RPAS1005', name: 'General Procedures' },
      { code: 'RPAS1006', name: 'Emergency Procedures' },
      { code: 'RPAS1007', name: 'Communication Protocol' },
      { code: 'RPAS1008', name: 'Detect, Avoid & Separate' },
      { code: 'RPAS1009', name: 'Minimum Weather Requirements' },
      { code: 'RPAS1010', name: 'Incident & Accident Reporting' },
      { code: 'RPAS1011', name: 'Site Survey & Flight Plan' },
      { code: 'RPAS1012', name: 'Equipment Testing' }
    ],
    procedures: [
      { id: 'RPAS-GP-001', name: 'General Procedures', version: 'V25_01' },
      { id: 'RPAS-EP-001', name: 'Emergency Procedures', version: 'V25_01' },
      { id: 'RPAS-AP-001', name: 'Advanced Procedures', version: 'V25_01' },
      { id: 'RPAS-SS-001', name: 'Site Survey & Flight Plan', version: 'V25_01' }
    ]
  },
  crm: {
    name: 'Crew Resource Management',
    policies: [
      { code: 'CRM1013', name: 'Threat & Error Management' },
      { code: 'CRM1014', name: 'Communication' },
      { code: 'CRM1015', name: 'Situational Awareness' },
      { code: 'CRM1016', name: 'Pressure & Stress Management' },
      { code: 'CRM1017', name: 'Fatigue Management' },
      { code: 'CRM1018', name: 'Workload Management' },
      { code: 'CRM1019', name: 'Decision Making Process' },
      { code: 'CRM1020', name: 'Leadership & Team Building' },
      { code: 'CRM1021', name: 'Automation & Technology' }
    ]
  }
}

// Calculate KPIs from data
export function calculateSafetyKPIs(data) {
  const { incidents = [], capas = [], forms = [], operators = [], projects = [], aircraft = [] } = data
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  
  const ytdIncidents = incidents.filter(i => {
    const date = i.dateOccurred?.toDate ? i.dateOccurred.toDate() : new Date(i.dateOccurred)
    return date >= yearStart
  })
  
  const recordableIncidents = ytdIncidents.filter(i => i.type !== 'near_miss' && i.type !== 'observation')
  const nearMisses = ytdIncidents.filter(i => i.type === 'near_miss')
  const flightIncidents = ytdIncidents.filter(i => i.category === 'flight' || i.category === 'rpas')
  
  let daysSinceIncident = null
  if (recordableIncidents.length > 0) {
    const sorted = [...recordableIncidents].sort((a, b) => {
      const dateA = a.dateOccurred?.toDate ? a.dateOccurred.toDate() : new Date(a.dateOccurred)
      const dateB = b.dateOccurred?.toDate ? b.dateOccurred.toDate() : new Date(b.dateOccurred)
      return dateB - dateA
    })
    const lastDate = sorted[0].dateOccurred?.toDate ? sorted[0].dateOccurred.toDate() : new Date(sorted[0].dateOccurred)
    daysSinceIncident = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
  }
  
  const formCounts = {}
  forms.forEach(f => { formCounts[f.templateId || 'unknown'] = (formCounts[f.templateId || 'unknown'] || 0) + 1 })
  
  const getFormRate = (ids) => {
    const matching = forms.filter(f => ids.some(t => (f.templateId || '').includes(t)))
    const completed = matching.filter(f => f.status === 'completed')
    return matching.length > 0 ? Math.round((completed.length / matching.length) * 100) : 100
  }
  
  const openCapas = capas.filter(c => !['closed', 'verified_effective'].includes(c.status))
  const closedCapas = capas.filter(c => ['closed', 'verified_effective'].includes(c.status))
  const overdueCapas = openCapas.filter(c => {
    if (!c.targetDate) return false
    const target = c.targetDate?.toDate ? c.targetDate.toDate() : new Date(c.targetDate)
    return target < now
  })
  
  const opsWithCerts = operators.filter(o => Array.isArray(o.certifications) && o.certifications.length > 0)
  const trainingRate = operators.length > 0 ? Math.round((opsWithCerts.length / operators.length) * 100) : 100
  
  const activeAircraft = aircraft.filter(a => ['active', 'operational', 'CLEAR', 'airworthy'].includes(a.status))
  const lockedOut = aircraft.filter(a => ['LOCKOUT', 'grounded'].includes(a.status))
  
  return {
    trainingCompletionRate: trainingRate,
    certCurrencyRate: trainingRate,
    inspectionCompletionRate: getFormRate(['inspection']),
    flhaCompletionRate: getFormRate(['flha', 'field_level']),
    preflightCompletionRate: getFormRate(['preflight', 'pre_flight']),
    daysSinceIncident,
    ytdRecordableIncidents: recordableIncidents.length,
    ytdNearMisses: nearMisses.length,
    ytdFlightIncidents: flightIncidents.length,
    openCapas: openCapas.length,
    closedCapas: closedCapas.length,
    overdueCapas: overdueCapas.length,
    capaClosureRate: capas.length > 0 ? Math.round((closedCapas.length / capas.length) * 100) : 100,
    capaOnTimeRate: closedCapas.length > 0 ? Math.round((closedCapas.filter(c => c.metrics?.onTime !== false).length / closedCapas.length) * 100) : 100,
    totalAircraft: aircraft.length,
    activeAircraft: activeAircraft.length,
    lockedOutAircraft: lockedOut.length,
    equipmentAvailability: aircraft.length > 0 ? Math.round((activeAircraft.length / aircraft.length) * 100) : 100,
    totalForms: forms.length,
    completedForms: forms.filter(f => f.status === 'completed').length,
    formCounts,
    totalOperators: operators.length,
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length
  }
}

// Calculate audit readiness score
export function calculateAuditReadinessScore(kpis) {
  let score = 0
  score += ((kpis.trainingCompletionRate || 100) / 100) * 15
  score += ((kpis.inspectionCompletionRate || 100) / 100) * 10
  score += ((kpis.flhaCompletionRate || 100) / 100) * 15
  score += (kpis.ytdNearMisses || 0) >= 5 ? 10 : (kpis.ytdNearMisses || 0) >= 1 ? 5 : 0
  score += ((kpis.capaClosureRate || 100) / 100) * 15
  score += ((kpis.capaOnTimeRate || 100) / 100) * 10
  score += kpis.daysSinceIncident === null ? 15 : kpis.daysSinceIncident >= 90 ? 12 : kpis.daysSinceIncident >= 30 ? 6 : 3
  score += Math.min(((kpis.totalForms || 0) / 50) * 10, 10)
  return Math.round(score)
}

// Generate COR audit report
export async function generateCORReport(data, options = {}) {
  const { branding = null, includeAppendices = true } = options
  const { operators = [], projects = [], aircraft = [] } = data
  
  const kpis = calculateSafetyKPIs(data)
  const auditScore = calculateAuditReadinessScore(kpis)
  const year = new Date().getFullYear()
  
  // Shorter title to prevent truncation
  const pdf = new BrandedPDF({
    title: 'COR Safety Program Report',
    subtitle: `Annual Audit Documentation - ${year}`,
    projectName: `Safety Program Review`,
    projectCode: `COR-${year}`,
    branding
  })
  
  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()
  
  // ========== SECTION 1: EXECUTIVE SUMMARY ==========
  pdf.addNewSection('Executive Summary')
  
  pdf.addParagraph(`This report documents the Company's integrated safety management system for COR audit purposes. The program encompasses 53 policies across three domains: Health, Safety & Environment (32), RPAS Operations (12), and Crew Resource Management (9), plus 4 detailed operational procedures.`)
  
  pdf.addSpacer(8)
  
  pdf.addSubsectionTitle('Program Overview')
  pdf.addTable(
    ['Domain', 'Count', 'Regulatory Alignment'],
    [
      ['HSE Policies', '32', 'BC OHS Regulation, WorkSafeBC'],
      ['RPAS Policies', '12', 'CARs Part IX, SORA 2.5'],
      ['CRM Policies', '9', 'TC AC 700-042'],
      ['Procedures', '4', 'Internal SOPs']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Audit Readiness')
  pdf.addKPIRow([
    { label: 'Overall Score', value: String(auditScore) + '%' },
    { label: 'Incident-Free Days', value: kpis.daysSinceIncident !== null ? String(kpis.daysSinceIncident) : 'N/A' },
    { label: 'YTD Incidents', value: String(kpis.ytdRecordableIncidents) },
    { label: 'Open CAPAs', value: String(kpis.openCapas) }
  ])
  
  // ========== SECTION 2: MANAGEMENT ==========
  pdf.addNewSection('Management Leadership')
  
  pdf.addSubsectionTitle('Foundational Policies')
  pdf.addTable(
    ['Code', 'Policy', 'Purpose'],
    [
      ['HSE1022', 'Health & Safety Pledge', 'Zero harm commitment'],
      ['HSE1023', 'Commitment Statement', 'Leadership accountability'],
      ['HSE1024', 'Workers Rights', 'Know, participate, refuse'],
      ['HSE1025', 'Safety Management System', 'ISO 45001 aligned'],
      ['HSE1027', 'Health & Safety Policy', 'Core H&S statement']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Organizational Roles')
  pdf.addTable(
    ['Role', 'Safety Responsibility'],
    [
      ['Accountable Executive', 'Overall program accountability and resource allocation'],
      ['Operations Manager', 'Day-to-day implementation and compliance'],
      ['Pilot in Command', 'Flight operation authority and crew safety'],
      ['Visual Observer', 'Airspace monitoring and situational awareness']
    ]
  )
  
  // ========== SECTION 3: HAZARD ASSESSMENT ==========
  pdf.addNewSection('Hazard Assessment')
  
  pdf.addSubsectionTitle('Assessment Methods')
  pdf.addTable(
    ['Method', 'Frequency', 'Reference'],
    [
      ['Formal Hazard Assessment', 'New sites / major changes', 'HSE1047'],
      ['Field-Level Hazard Assessment', 'Every operation', 'HSE1047'],
      ['Site Survey', 'Per operational area', 'RPAS1011'],
      ['SORA Risk Assessment', 'Per flight operation', 'SORA 2.5'],
      ['Threat & Error Management', 'Pre-flight briefings', 'CRM1013']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Risk Control')
  pdf.addParagraph('Hierarchy of Controls: Elimination > Substitution > Engineering > Administrative > PPE')
  pdf.addParagraph('Risk Matrix: 5x5 probability/severity assessment per HSE1048')
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Performance Metrics')
  pdf.addKPIRow([
    { label: 'FLHA Rate', value: String(kpis.flhaCompletionRate) + '%' },
    { label: 'Inspection Rate', value: String(kpis.inspectionCompletionRate) + '%' },
    { label: 'Pre-Flight Rate', value: String(kpis.preflightCompletionRate) + '%' }
  ])
  
  // ========== SECTION 4: SAFE WORK ==========
  pdf.addNewSection('Safe Work Practices')
  
  pdf.addSubsectionTitle('RPAS Operational Procedures')
  pdf.addTable(
    ['Phase', 'Procedure', 'Key Activities'],
    [
      ['Pre-Op', 'Planning & Briefing', 'Weather, NOTAMs, TEM, crew roles'],
      ['Setup', 'Site & Equipment', 'Area inspection, RPAS assembly, checks'],
      ['Flight', 'Operations', 'Monitoring, communication, logging'],
      ['Post-Op', 'Recovery & Debrief', 'Landing, data backup, lessons learned']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('CRM Protocols')
  pdf.addTable(
    ['Protocol', 'Reference', 'Application'],
    [
      ['P.A.C.E. Escalation', 'CRM1014', 'Probe > Alert > Challenge > Emergency'],
      ['Situational Awareness', 'CRM1015', 'Perception > Comprehension > Projection'],
      ['Workload Management', 'CRM1018', 'Task prioritization and delegation'],
      ['Decision Making', 'CRM1019', 'FOR-DEC / DODAR methodology']
    ]
  )
  
  // ========== SECTION 5: TRAINING ==========
  pdf.addNewSection('Training & Competency')
  
  pdf.addSubsectionTitle('Required Certifications')
  pdf.addTable(
    ['Certification', 'Requirement', 'Renewal'],
    [
      ['RPAS Pilot Certificate', 'Basic / Advanced / Complex', 'Per TC requirements'],
      ['ROC-A (Radio)', 'Aeronautical radio operations', '5 years'],
      ['Emergency First Aid', 'All operational crew', '3 years'],
      ['CRM Training', 'All flight crew', 'Annual refresher']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Current Status')
  pdf.addKPIRow([
    { label: 'Cert Currency', value: String(kpis.certCurrencyRate) + '%' },
    { label: 'Training Complete', value: String(kpis.trainingCompletionRate) + '%' },
    { label: 'Total Operators', value: String(kpis.totalOperators) }
  ])
  
  // ========== SECTION 6: INSPECTIONS ==========
  pdf.addNewSection('Inspections & Maintenance')
  
  pdf.addSubsectionTitle('Inspection Schedule')
  pdf.addTable(
    ['Type', 'Frequency', 'Reference'],
    [
      ['Workplace Inspection', 'Monthly', 'HSE1049'],
      ['Pre-Flight Inspection', 'Every operation', 'RPAS1003'],
      ['Equipment Testing', 'New / Annual / Post-repair', 'RPAS1012'],
      ['Vehicle Inspection', 'Daily (pre-use)', 'HSE1029'],
      ['PPE Inspection', 'Before each use', 'HSE1028']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Equipment Status (CLEAR/LOCKOUT System)')
  pdf.addKPIRow([
    { label: 'Availability', value: String(kpis.equipmentAvailability) + '%' },
    { label: 'Active Units', value: String(kpis.activeAircraft) },
    { label: 'Locked Out', value: String(kpis.lockedOutAircraft) }
  ])
  
  // ========== SECTION 7: INCIDENTS ==========
  pdf.addNewSection('Incident Management')
  
  pdf.addSubsectionTitle('Reporting Requirements')
  pdf.addTable(
    ['Authority', 'Timeframe', 'Trigger Events'],
    [
      ['Internal', '24 hours', 'All incidents, near misses, observations'],
      ['Transport Canada', 'Per CAR 901.49', 'Reportable RPAS occurrences'],
      ['WorkSafeBC', 'Immediately', 'Serious injury, fatality'],
      ['TSB', 'Immediately', 'Fatality, mid-air collision risk']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('YTD Statistics')
  pdf.addTable(
    ['Metric', 'Actual', 'Target', 'Status'],
    [
      ['Recordable Incidents', String(kpis.ytdRecordableIncidents), '0', kpis.ytdRecordableIncidents === 0 ? 'MET' : 'NOT MET'],
      ['Flight Incidents', String(kpis.ytdFlightIncidents), '0', kpis.ytdFlightIncidents === 0 ? 'MET' : 'NOT MET'],
      ['Near Miss Reports', String(kpis.ytdNearMisses), '>=5', kpis.ytdNearMisses >= 5 ? 'MET' : 'REVIEW']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('CAPA Performance')
  pdf.addKPIRow([
    { label: 'Open', value: String(kpis.openCapas) },
    { label: 'Overdue', value: String(kpis.overdueCapas) },
    { label: 'Closure Rate', value: String(kpis.capaClosureRate) + '%' },
    { label: 'On-Time', value: String(kpis.capaOnTimeRate) + '%' }
  ])
  
  // ========== SECTION 8: EMERGENCY ==========
  pdf.addNewSection('Emergency Response')
  
  pdf.addSubsectionTitle('RPAS Emergency Procedures')
  pdf.addTable(
    ['Scenario', 'Primary Response', 'Reference'],
    [
      ['Control Station Failure', 'Activate backup / RTH', 'RPAS-EP-001'],
      ['RPAS System Failure', 'Emergency landing / FTS', 'RPAS-EP-001'],
      ['Fly-Away Event', 'Track, notify ATC, recover', 'RPAS-EP-001'],
      ['C2 Link Loss', 'Automated failsafe activation', 'RPAS-EP-001'],
      ['Crash / Collision', 'Scene preservation, notify', 'RPAS-EP-001']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Emergency Contacts')
  pdf.addTable(
    ['Service', 'Number'],
    [
      ['Emergency Services', '911'],
      ['WorkSafeBC 24hr', '1-888-621-7233'],
      ['Transport Canada', '1-888-463-0521'],
      ['NAV CANADA', '1-866-992-7433']
    ]
  )
  
  // ========== SECTION 9: RECORDS ==========
  pdf.addNewSection('Records & Statistics')
  
  pdf.addSubsectionTitle('Leading Indicators')
  pdf.addTable(
    ['Indicator', 'Target', 'Actual', 'Status'],
    [
      ['Training Completion', '>=95%', String(kpis.trainingCompletionRate) + '%', kpis.trainingCompletionRate >= 95 ? 'MET' : 'NOT MET'],
      ['Inspection Completion', '100%', String(kpis.inspectionCompletionRate) + '%', kpis.inspectionCompletionRate >= 100 ? 'MET' : 'NOT MET'],
      ['FLHA Completion', '100%', String(kpis.flhaCompletionRate) + '%', kpis.flhaCompletionRate >= 100 ? 'MET' : 'NOT MET'],
      ['Near Miss Reporting', '>=5/year', String(kpis.ytdNearMisses), kpis.ytdNearMisses >= 5 ? 'MET' : 'REVIEW']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Form Statistics')
  const formEntries = Object.entries(kpis.formCounts || {})
  if (formEntries.length > 0) {
    const formRows = formEntries.sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([type, count]) => [type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), String(count)])
    pdf.addTable(['Form Type', 'Count'], formRows)
  } else {
    pdf.addParagraph('No forms recorded in current period.')
  }
  
  // ========== SECTION 10: PROGRAM ADMIN ==========
  pdf.addNewSection('Program Administration')
  
  pdf.addSubsectionTitle('Document Control')
  pdf.addTable(
    ['Element', 'Practice'],
    [
      ['Version Control', 'All policies tracked with revision history'],
      ['Review Cycle', 'Annual review with documented amendments'],
      ['Distribution', 'Electronic via company platform'],
      ['Retention', 'Per regulatory requirements (min 3 years)']
    ]
  )
  
  pdf.addSpacer(5)
  
  pdf.addSubsectionTitle('Regulatory Framework')
  pdf.addTable(
    ['Regulation', 'Scope'],
    [
      ['BC OHS Regulation', 'Workplace health and safety'],
      ['CARs Part IX', 'RPAS operations'],
      ['JARUS SORA 2.5', 'Operational risk assessment'],
      ['ISO 45001:2018', 'SMS framework alignment']
    ]
  )
  
  // ========== APPENDICES ==========
  if (includeAppendices) {
    pdf.addNewSection('Policy Index')
    
    // HSE Policies - split into 2 columns via smaller table
    pdf.addSubsectionTitle('HSE Policies (32)')
    const hseRows = PROGRAM_STRUCTURE.hse.policies.map(p => [p.code, p.name])
    pdf.addTable(['Code', 'Name'], hseRows, { fontSize: 7 })
    
    // RPAS + CRM on same page
    pdf.addSubsectionTitle('RPAS Policies (12)')
    const rpasRows = PROGRAM_STRUCTURE.rpas.policies.map(p => [p.code, p.name])
    pdf.addTable(['Code', 'Name'], rpasRows, { fontSize: 8 })
    
    pdf.addSubsectionTitle('CRM Policies (9)')
    const crmRows = PROGRAM_STRUCTURE.crm.policies.map(p => [p.code, p.name])
    pdf.addTable(['Code', 'Name'], crmRows, { fontSize: 8 })
    
    pdf.addSubsectionTitle('Procedures (4)')
    const procRows = PROGRAM_STRUCTURE.rpas.procedures.map(p => [p.id, p.name, p.version])
    pdf.addTable(['Code', 'Name', 'Version'], procRows, { fontSize: 8 })
    
    // Operators
    if (operators.length > 0) {
      pdf.addNewSection('Operator Registry')
      const opRows = operators.slice(0, 20).map(op => [
        op.name || `${op.firstName || ''} ${op.lastName || ''}`.trim() || 'Unknown',
        op.role || 'Operator',
        op.pilotCertificate || 'N/A'
      ])
      pdf.addTable(['Name', 'Role', 'Pilot Cert'], opRows)
    }
    
    // Equipment
    if (aircraft.length > 0) {
      pdf.addNewSection('Equipment Registry')
      const acRows = aircraft.map(a => [
        a.nickname || a.name || 'Unknown',
        a.manufacturer || 'N/A',
        a.model || 'N/A',
        a.status || 'Active'
      ])
      pdf.addTable(['Name', 'Manufacturer', 'Model', 'Status'], acRows)
    }
    
    // Projects
    if (projects.length > 0) {
      pdf.addNewSection('Project Registry')
      const projRows = projects.slice(0, 15).map(p => [
        p.projectCode || (p.id ? p.id.substring(0, 8) : 'N/A'),
        p.name || 'Unknown',
        p.client || 'N/A',
        p.status || 'Unknown'
      ])
      pdf.addTable(['Code', 'Name', 'Client', 'Status'], projRows)
    }
  }
  
  // ========== CERTIFICATION ==========
  pdf.addNewSection('Certification')
  
  pdf.addParagraph('I certify that this report accurately represents the Health, Safety & Environment program of the Company as of the date indicated.')
  
  pdf.addSpacer(15)
  
  pdf.addSignatureBlock([
    { role: 'Health & Safety Manager' },
    { role: 'Operations Manager' },
    { role: 'Accountable Executive' }
  ])
  
  pdf.addSpacer(10)
  
  pdf.addParagraph(`Generated: ${new Date().toLocaleDateString('en-CA')} | TC Company File: 930355`)
  
  return pdf
}

// Export function
export async function exportCORReport(data, options = {}) {
  const pdf = await generateCORReport(data, options)
  const filename = `COR_Safety_Report_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
  return filename
}

export default {
  COR_ELEMENTS,
  PROGRAM_STRUCTURE,
  calculateSafetyKPIs,
  calculateAuditReadinessScore,
  generateCORReport,
  exportCORReport
}
