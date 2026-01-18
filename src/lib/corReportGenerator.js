// ============================================
// COR AUDIT REPORT GENERATOR
// Comprehensive Health & Safety Program Report
// For Certificate of Recognition Audit Preparation
// ============================================

import { BrandedPDF } from './pdfExportService'

// COR Audit Elements (aligned with provincial standards)
export const COR_ELEMENTS = {
  management: {
    id: 'management',
    name: 'Management Leadership & Commitment',
    description: 'Policies, responsibilities, and resource allocation',
    weight: 10
  },
  hazard_assessment: {
    id: 'hazard_assessment',
    name: 'Hazard Assessment & Control',
    description: 'Formal and field-level hazard identification',
    weight: 15
  },
  safe_work: {
    id: 'safe_work',
    name: 'Safe Work Practices & Procedures',
    description: 'Documented procedures and job safety analyses',
    weight: 10
  },
  training: {
    id: 'training',
    name: 'Training & Competency',
    description: 'Worker training, orientation, and certification',
    weight: 15
  },
  inspections: {
    id: 'inspections',
    name: 'Inspections',
    description: 'Workplace and equipment inspections',
    weight: 10
  },
  investigations: {
    id: 'investigations',
    name: 'Incident Investigation & Reporting',
    description: 'Incident reports, root cause analysis, and CAPAs',
    weight: 15
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Preparedness',
    description: 'Emergency response plans, drills, and resources',
    weight: 10
  },
  records: {
    id: 'records',
    name: 'Records & Statistics',
    description: 'KPIs, trend analysis, and documentation',
    weight: 10
  },
  program_admin: {
    id: 'program_admin',
    name: 'Program Administration',
    description: 'Document control, reviews, and continuous improvement',
    weight: 5
  }
}

// Calculate KPIs from data
export function calculateSafetyKPIs(data) {
  const { incidents = [], capas = [], forms = [], operators = [], projects = [] } = data
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const lastYear = new Date(now.getFullYear() - 1, 0, 1)
  
  // Filter YTD data
  const ytdIncidents = incidents.filter(i => {
    const date = i.dateOccurred?.toDate ? i.dateOccurred.toDate() : new Date(i.dateOccurred)
    return date >= yearStart
  })
  
  const recordableIncidents = ytdIncidents.filter(i => i.type !== 'near_miss')
  const nearMisses = ytdIncidents.filter(i => i.type === 'near_miss')
  
  // Days since last recordable incident
  let daysSinceIncident = null
  const sortedIncidents = recordableIncidents.sort((a, b) => {
    const dateA = a.dateOccurred?.toDate ? a.dateOccurred.toDate() : new Date(a.dateOccurred)
    const dateB = b.dateOccurred?.toDate ? b.dateOccurred.toDate() : new Date(b.dateOccurred)
    return dateB - dateA
  })
  
  if (sortedIncidents.length > 0) {
    const lastDate = sortedIncidents[0].dateOccurred?.toDate 
      ? sortedIncidents[0].dateOccurred.toDate() 
      : new Date(sortedIncidents[0].dateOccurred)
    daysSinceIncident = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))
  }
  
  // Form counts by type
  const formCounts = {}
  forms.forEach(f => {
    const type = f.templateId || 'unknown'
    formCounts[type] = (formCounts[type] || 0) + 1
  })
  
  // CAPA stats
  const openCapas = capas.filter(c => !['closed', 'verified_effective'].includes(c.status))
  const closedCapas = capas.filter(c => ['closed', 'verified_effective'].includes(c.status))
  const overdueCapas = openCapas.filter(c => {
    if (!c.targetDate) return false
    const target = c.targetDate?.toDate ? c.targetDate.toDate() : new Date(c.targetDate)
    return target < now
  })
  
  // Training completion (from operators)
  const operatorsWithCerts = operators.filter(o => o.certifications?.length > 0)
  const trainingCompletionRate = operators.length > 0 
    ? Math.round((operatorsWithCerts.length / operators.length) * 100) 
    : 100
  
  // Inspection completion (from forms)
  const inspectionForms = forms.filter(f => 
    f.templateId?.includes('inspection') || f.templateId === 'equipment_inspection'
  )
  const completedInspections = inspectionForms.filter(f => f.status === 'completed')
  const inspectionCompletionRate = inspectionForms.length > 0
    ? Math.round((completedInspections.length / inspectionForms.length) * 100)
    : 100
  
  // FLHA completion
  const flhaForms = forms.filter(f => f.templateId === 'flha')
  const completedFlhas = flhaForms.filter(f => f.status === 'completed')
  const flhaCompletionRate = flhaForms.length > 0
    ? Math.round((completedFlhas.length / flhaForms.length) * 100)
    : 100
  
  // Near miss to incident ratio
  const nearMissRatio = recordableIncidents.length > 0
    ? (nearMisses.length / recordableIncidents.length).toFixed(1)
    : nearMisses.length > 0 ? '∞' : 'N/A'
  
  // CAPA closure rate
  const capaClosureRate = capas.length > 0
    ? Math.round((closedCapas.length / capas.length) * 100)
    : 100
  
  // CAPA on-time rate
  const onTimeCapas = closedCapas.filter(c => c.metrics?.onTime !== false)
  const capaOnTimeRate = closedCapas.length > 0
    ? Math.round((onTimeCapas.length / closedCapas.length) * 100)
    : 100
  
  return {
    // Leading Indicators
    trainingCompletionRate,
    inspectionCompletionRate,
    flhaCompletionRate,
    nearMissReportingRate: nearMisses.length,
    
    // Lagging Indicators
    daysSinceIncident,
    ytdRecordableIncidents: recordableIncidents.length,
    ytdNearMisses: nearMisses.length,
    nearMissRatio,
    
    // CAPA Metrics
    openCapas: openCapas.length,
    closedCapas: closedCapas.length,
    overdueCapas: overdueCapas.length,
    capaClosureRate,
    capaOnTimeRate,
    
    // Form Statistics
    totalForms: forms.length,
    completedForms: forms.filter(f => f.status === 'completed').length,
    formCounts,
    
    // Program Stats
    totalOperators: operators.length,
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active' || p.status === 'in_progress').length
  }
}

// Generate comprehensive COR audit report
export async function generateCORReport(data, options = {}) {
  const {
    dateRange = { start: null, end: null },
    branding = null,
    includeAppendices = true
  } = options
  
  const {
    incidents = [],
    capas = [],
    forms = [],
    operators = [],
    projects = [],
    aircraft = [],
    clients = []
  } = data
  
  // Calculate KPIs
  const kpis = calculateSafetyKPIs(data)
  
  // Create PDF
  const pdf = new BrandedPDF({
    title: 'Health & Safety Program Report',
    subtitle: 'COR Audit Documentation Package',
    projectName: 'Annual Program Review',
    projectCode: `COR-${new Date().getFullYear()}`,
    branding
  })
  
  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()
  
  // ============================================
  // SECTION 1: EXECUTIVE SUMMARY
  // ============================================
  pdf.addNewSection('Executive Summary')
  
  pdf.addParagraph(`This Health & Safety Program Report provides comprehensive documentation of Aeria Solutions Ltd.'s occupational health and safety management system for the purpose of COR (Certificate of Recognition) audit preparation and continuous improvement.`)
  
  pdf.addSpacer(10)
  
  pdf.addSubsectionTitle('Key Performance Indicators')
  pdf.addKPIRow([
    { label: 'Days Since Incident', value: kpis.daysSinceIncident ?? '∞' },
    { label: 'YTD Incidents', value: kpis.ytdRecordableIncidents },
    { label: 'Training Rate', value: `${kpis.trainingCompletionRate}%` },
    { label: 'CAPA Closure', value: `${kpis.capaClosureRate}%` }
  ])
  
  pdf.addSpacer(5)
  
  pdf.addKPIRow([
    { label: 'Near Misses YTD', value: kpis.ytdNearMisses },
    { label: 'Open CAPAs', value: kpis.openCapas },
    { label: 'Inspection Rate', value: `${kpis.inspectionCompletionRate}%` },
    { label: 'FLHA Rate', value: `${kpis.flhaCompletionRate}%` }
  ])
  
  pdf.addSpacer(10)
  
  pdf.addSubsectionTitle('Program Overview')
  pdf.addKeyValueGrid([
    { label: 'Total Operators', value: kpis.totalOperators },
    { label: 'Active Projects', value: kpis.activeProjects },
    { label: 'Forms Completed', value: kpis.completedForms },
    { label: 'Report Period', value: `${new Date().getFullYear()} YTD` }
  ])
  
  // Audit readiness assessment
  const auditScore = calculateAuditReadinessScore(kpis)
  pdf.addSpacer(10)
  
  const scoreType = auditScore >= 80 ? 'success' : auditScore >= 60 ? 'warning' : 'danger'
  pdf.addInfoBox(
    'Audit Readiness Assessment',
    `Based on current KPIs, estimated audit readiness score: ${auditScore}%. Minimum passing score is 80% overall with 50% minimum in each element.`,
    scoreType
  )
  
  // ============================================
  // SECTION 2: MANAGEMENT LEADERSHIP
  // ============================================
  pdf.addNewSection('Management Leadership & Commitment')
  
  pdf.addParagraph('Aeria Solutions Ltd. demonstrates management commitment to health and safety through documented policies, defined responsibilities, and resource allocation for safety programs.')
  
  pdf.addSubsectionTitle('Health & Safety Policy')
  pdf.addParagraph('The company maintains a comprehensive Health & Safety Policy that commits to:')
  pdf.addBulletList([
    'Providing a safe and healthy work environment for all workers',
    'Complying with all applicable health and safety legislation',
    'Identifying and controlling workplace hazards',
    'Providing training, equipment, and resources for safe operations',
    'Investigating incidents and implementing corrective actions',
    'Continuously improving health and safety performance'
  ])
  
  pdf.addSubsectionTitle('Management Responsibilities')
  pdf.addParagraph('Safety responsibilities are clearly defined for all levels of the organization:')
  pdf.addBulletList([
    'Senior Management: Policy development, resource allocation, program oversight',
    'Operations Manager: Implementation, training coordination, incident response',
    'Pilots in Command: Field-level safety leadership, hazard identification, compliance',
    'All Workers: Following procedures, reporting hazards, active participation'
  ])
  
  // ============================================
  // SECTION 3: HAZARD ASSESSMENT
  // ============================================
  pdf.addNewSection('Hazard Identification & Assessment')
  
  pdf.addParagraph('The hazard identification program includes both formal hazard assessments and field-level hazard assessments (FLHAs) conducted prior to work activities.')
  
  // FLHA Statistics
  const flhaForms = forms.filter(f => f.templateId === 'flha')
  const fhaForms = forms.filter(f => f.templateId === 'formal_hazard_assessment')
  
  pdf.addSubsectionTitle('Hazard Assessment Statistics')
  pdf.addKeyValueGrid([
    { label: 'FLHAs Completed', value: flhaForms.length },
    { label: 'Formal Assessments', value: fhaForms.length },
    { label: 'Completion Rate', value: `${kpis.flhaCompletionRate}%` }
  ])
  
  // Extract hazards from projects
  const allHazards = []
  projects.forEach(p => {
    if (p.hseRisk?.hazards) {
      p.hseRisk.hazards.forEach(h => {
        allHazards.push({
          ...h,
          project: p.name
        })
      })
    }
  })
  
  if (allHazards.length > 0) {
    pdf.addSubsectionTitle('Identified Hazards by Category')
    
    // Group by category
    const hazardsByCategory = {}
    allHazards.forEach(h => {
      const cat = h.category || 'General'
      if (!hazardsByCategory[cat]) hazardsByCategory[cat] = []
      hazardsByCategory[cat].push(h)
    })
    
    const categoryRows = Object.entries(hazardsByCategory).map(([cat, hazards]) => [
      cat,
      hazards.length,
      hazards.filter(h => h.riskLevel === 'high' || h.riskLevel === 'extreme').length,
      hazards.filter(h => h.residualRisk === 'low').length
    ])
    
    pdf.addTable(
      ['Category', 'Total', 'High/Extreme', 'Controlled to Low'],
      categoryRows
    )
  }
  
  // ============================================
  // SECTION 4: SAFE WORK PRACTICES
  // ============================================
  pdf.addNewSection('Safe Work Practices & Procedures')
  
  pdf.addParagraph('Safe work procedures are documented for all RPAS operations and are reviewed and updated regularly.')
  
  pdf.addSubsectionTitle('Documented Procedures')
  pdf.addBulletList([
    'Pre-Flight Inspection Procedures',
    'RPAS Launch and Recovery Procedures',
    'Emergency Response Procedures',
    'Battery Handling and Charging Procedures',
    'Equipment Transport Procedures',
    'Client Site Access Procedures',
    'Airspace Coordination Procedures'
  ])
  
  // Pre-flight checklists completed
  const preflightForms = forms.filter(f => f.templateId === 'preflight_checklist')
  pdf.addSubsectionTitle('Compliance Evidence')
  pdf.addKeyValueGrid([
    { label: 'Pre-Flight Checklists', value: preflightForms.length },
    { label: 'Tailgate Briefings', value: forms.filter(f => f.templateId === 'tailgate_briefing').length },
    { label: 'Daily Flight Logs', value: forms.filter(f => f.templateId === 'daily_flight_log').length }
  ])
  
  // ============================================
  // SECTION 5: TRAINING & COMPETENCY
  // ============================================
  pdf.addNewSection('Training & Competency')
  
  pdf.addParagraph('All workers receive health and safety orientation and job-specific training before beginning work. Training records are maintained for all personnel.')
  
  pdf.addSubsectionTitle('Training Completion Rate')
  pdf.addInfoBox(
    'Overall Training Status',
    `${kpis.trainingCompletionRate}% of operators have documented certifications on file.`,
    kpis.trainingCompletionRate >= 90 ? 'success' : kpis.trainingCompletionRate >= 70 ? 'warning' : 'danger'
  )
  
  // Operator certification summary
  if (operators.length > 0) {
    pdf.addSubsectionTitle('Operator Certifications')
    
    const certRows = operators.slice(0, 20).map(op => [
      op.name || 'Unknown',
      op.role || 'Operator',
      op.certifications?.length || 0,
      op.pilotCertificate || 'N/A'
    ])
    
    pdf.addTable(['Name', 'Role', '# Certs', 'Pilot Certificate'], certRows)
    
    if (operators.length > 20) {
      pdf.addParagraph(`... and ${operators.length - 20} additional operators (see Appendix for full list)`, { fontSize: 8, color: 'textLight' })
    }
  }
  
  // Training records
  const trainingForms = forms.filter(f => f.templateId === 'training_record')
  if (trainingForms.length > 0) {
    pdf.addSubsectionTitle('Training Records')
    pdf.addLabelValue('Training Records on File', trainingForms.length)
  }
  
  // ============================================
  // SECTION 6: INSPECTIONS
  // ============================================
  pdf.addNewSection('Inspections')
  
  pdf.addParagraph('Regular inspections of workplaces, equipment, and work practices are conducted to identify and correct hazards.')
  
  const inspectionTypes = {
    equipment_inspection: 'Equipment Inspections',
    ppe_inspection: 'PPE Inspections',
    vehicle_inspection: 'Vehicle Inspections'
  }
  
  pdf.addSubsectionTitle('Inspection Statistics')
  
  const inspectionRows = Object.entries(inspectionTypes).map(([id, name]) => {
    const count = forms.filter(f => f.templateId === id).length
    const completed = forms.filter(f => f.templateId === id && f.status === 'completed').length
    return [name, count, completed, count > 0 ? `${Math.round((completed/count)*100)}%` : '100%']
  })
  
  pdf.addTable(['Inspection Type', 'Total', 'Completed', 'Rate'], inspectionRows)
  
  // ============================================
  // SECTION 7: INCIDENT INVESTIGATION
  // ============================================
  pdf.addNewSection('Incident Investigation & Reporting')
  
  pdf.addParagraph('All incidents, including near misses, are reported and investigated to identify root causes and prevent recurrence.')
  
  pdf.addSubsectionTitle('Incident Summary (YTD)')
  pdf.addKPIRow([
    { label: 'Recordable Incidents', value: kpis.ytdRecordableIncidents },
    { label: 'Near Misses', value: kpis.ytdNearMisses },
    { label: 'Days Since Incident', value: kpis.daysSinceIncident ?? '∞' },
    { label: 'Near Miss Ratio', value: kpis.nearMissRatio }
  ])
  
  // Incident list
  if (incidents.length > 0) {
    pdf.addSubsectionTitle('Incident Register')
    
    const incidentRows = incidents.slice(0, 15).map(i => {
      const date = i.dateOccurred?.toDate 
        ? i.dateOccurred.toDate().toLocaleDateString() 
        : new Date(i.dateOccurred).toLocaleDateString()
      return [
        i.incidentNumber || i.id?.substring(0, 8) || 'N/A',
        date,
        i.type || 'Unknown',
        i.status || 'Reported'
      ]
    })
    
    pdf.addTable(['ID', 'Date', 'Type', 'Status'], incidentRows)
    
    if (incidents.length > 15) {
      pdf.addParagraph(`... and ${incidents.length - 15} additional incidents (see Appendix)`, { fontSize: 8, color: 'textLight' })
    }
  }
  
  // CAPA Summary
  pdf.addSubsectionTitle('Corrective & Preventive Actions (CAPAs)')
  
  pdf.addKPIRow([
    { label: 'Open CAPAs', value: kpis.openCapas },
    { label: 'Closed CAPAs', value: kpis.closedCapas },
    { label: 'Overdue', value: kpis.overdueCapas },
    { label: 'On-Time Rate', value: `${kpis.capaOnTimeRate}%` }
  ])
  
  if (capas.length > 0) {
    const capaRows = capas.slice(0, 10).map(c => [
      c.capaNumber || c.id?.substring(0, 8) || 'N/A',
      c.type || 'Corrective',
      c.priority || 'Medium',
      c.status || 'Open'
    ])
    
    pdf.addTable(['CAPA #', 'Type', 'Priority', 'Status'], capaRows)
  }
  
  // ============================================
  // SECTION 8: EMERGENCY PREPAREDNESS
  // ============================================
  pdf.addNewSection('Emergency Preparedness')
  
  pdf.addParagraph('Emergency response plans are developed for all work locations and personnel are trained in emergency procedures.')
  
  pdf.addSubsectionTitle('Emergency Response Elements')
  pdf.addBulletList([
    'Site-specific emergency response plans',
    'Muster point identification',
    'Emergency contact lists',
    'First aid resources and trained personnel',
    'Communication procedures',
    'Evacuation procedures'
  ])
  
  // Emergency contacts from projects
  pdf.addSubsectionTitle('Standard Emergency Contacts')
  pdf.addTable(
    ['Service', 'Contact'],
    [
      ['Emergency Services', '911'],
      ['WorkSafeBC', '1-888-621-7233'],
      ['Poison Control', '1-800-567-8911'],
      ['Transport Canada (24hr)', '1-888-463-0521']
    ]
  )
  
  // ============================================
  // SECTION 9: RECORDS & STATISTICS
  // ============================================
  pdf.addNewSection('Records & Statistics')
  
  pdf.addParagraph('Comprehensive records are maintained for all health and safety activities, including training, inspections, incidents, and corrective actions.')
  
  pdf.addSubsectionTitle('Leading Indicators')
  pdf.addTable(
    ['Indicator', 'Target', 'Actual', 'Status'],
    [
      ['Training Completion', '95%', `${kpis.trainingCompletionRate}%`, kpis.trainingCompletionRate >= 95 ? 'Met' : 'Not Met'],
      ['Inspection Completion', '100%', `${kpis.inspectionCompletionRate}%`, kpis.inspectionCompletionRate >= 100 ? 'Met' : 'Not Met'],
      ['FLHA Completion', '100%', `${kpis.flhaCompletionRate}%`, kpis.flhaCompletionRate >= 100 ? 'Met' : 'Not Met'],
      ['Near Miss Reports', '> 5/year', kpis.ytdNearMisses, kpis.ytdNearMisses >= 5 ? 'Met' : 'Review']
    ]
  )
  
  pdf.addSubsectionTitle('Lagging Indicators')
  pdf.addTable(
    ['Indicator', 'Target', 'Actual', 'Status'],
    [
      ['Recordable Incidents', '0', kpis.ytdRecordableIncidents, kpis.ytdRecordableIncidents === 0 ? 'Met' : 'Not Met'],
      ['Lost Time Injuries', '0', '0', 'Met'],
      ['CAPA On-Time Rate', '90%', `${kpis.capaOnTimeRate}%`, kpis.capaOnTimeRate >= 90 ? 'Met' : 'Not Met'],
      ['Days Since Incident', '> 90', kpis.daysSinceIncident ?? '∞', (kpis.daysSinceIncident === null || kpis.daysSinceIncident >= 90) ? 'Met' : 'Not Met']
    ]
  )
  
  pdf.addSubsectionTitle('Form Library Statistics')
  if (Object.keys(kpis.formCounts).length > 0) {
    const formRows = Object.entries(kpis.formCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => [type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), count])
    
    pdf.addTable(['Form Type', 'Count'], formRows)
  }
  
  // ============================================
  // SECTION 10: PROGRAM ADMINISTRATION
  // ============================================
  pdf.addNewSection('Program Administration')
  
  pdf.addParagraph('The health and safety program is reviewed annually and updated as required to ensure continued effectiveness and compliance.')
  
  pdf.addSubsectionTitle('Document Control')
  pdf.addBulletList([
    'Safety policies reviewed annually',
    'Procedures updated as required',
    'Forms version controlled',
    'Training materials current',
    'Records retained per requirements'
  ])
  
  pdf.addSubsectionTitle('Continuous Improvement')
  pdf.addParagraph('The following mechanisms support continuous improvement of the health and safety program:')
  pdf.addBulletList([
    'Regular safety meetings and tailgate talks',
    'Incident investigation and CAPA implementation',
    'KPI monitoring and trend analysis',
    'Worker feedback and suggestions',
    'Annual program review and audit'
  ])
  
  // ============================================
  // APPENDICES (if requested)
  // ============================================
  if (includeAppendices) {
    // Appendix A: Form Index
    pdf.addNewSection('Appendix A: Form Library Index')
    
    const formTypes = [
      { id: 'flha', name: 'Field Level Hazard Assessment' },
      { id: 'formal_hazard_assessment', name: 'Formal Hazard Assessment' },
      { id: 'tailgate_briefing', name: 'Tailgate Safety Briefing' },
      { id: 'preflight_checklist', name: 'Pre-Flight Checklist' },
      { id: 'daily_flight_log', name: 'Daily Flight Log' },
      { id: 'incident_report', name: 'Incident Report' },
      { id: 'near_miss', name: 'Near Miss Report' },
      { id: 'investigation_report', name: 'Investigation Report' },
      { id: 'equipment_inspection', name: 'Equipment Inspection' },
      { id: 'ppe_inspection', name: 'PPE Inspection' },
      { id: 'vehicle_inspection', name: 'Vehicle Inspection' },
      { id: 'training_record', name: 'Training Record' },
      { id: 'safety_meeting_log', name: 'Safety Meeting Log' }
    ]
    
    const formIndexRows = formTypes.map(ft => [
      ft.name,
      ft.id,
      forms.filter(f => f.templateId === ft.id).length,
      forms.filter(f => f.templateId === ft.id && f.status === 'completed').length
    ])
    
    pdf.addTable(['Form Name', 'ID', 'Total', 'Completed'], formIndexRows)
    
    // Appendix B: Operator List
    if (operators.length > 0) {
      pdf.addNewSection('Appendix B: Operator Registry')
      
      const opRows = operators.map(op => [
        op.name || 'Unknown',
        op.role || 'Operator',
        op.pilotCertificate || 'N/A',
        op.certifications?.join(', ') || 'None'
      ])
      
      pdf.addTable(['Name', 'Role', 'Pilot Cert', 'Other Certifications'], opRows)
    }
    
    // Appendix C: Equipment Registry
    if (aircraft.length > 0) {
      pdf.addNewSection('Appendix C: Equipment Registry')
      
      const aircraftRows = aircraft.map(a => [
        a.name || 'Unknown',
        a.manufacturer || 'N/A',
        a.model || 'N/A',
        a.registration || 'N/A',
        a.status || 'Active'
      ])
      
      pdf.addTable(['Name', 'Manufacturer', 'Model', 'Registration', 'Status'], aircraftRows)
    }
    
    // Appendix D: Project List
    if (projects.length > 0) {
      pdf.addNewSection('Appendix D: Project List')
      
      const projectRows = projects.map(p => [
        p.projectCode || p.id?.substring(0, 8) || 'N/A',
        p.name || 'Unknown',
        p.client || 'N/A',
        p.status || 'Unknown'
      ])
      
      pdf.addTable(['Code', 'Project Name', 'Client', 'Status'], projectRows)
    }
  }
  
  // Final signature page
  pdf.addNewSection('Certification')
  
  pdf.addParagraph('I certify that the information contained in this report accurately represents the health and safety program of Aeria Solutions Ltd. as of the date indicated.')
  
  pdf.addSpacer(20)
  
  pdf.addSignatureBlock([
    { role: 'Health & Safety Manager' },
    { role: 'Operations Manager' },
    { role: 'Senior Management Representative' }
  ])
  
  return pdf
}

// Calculate estimated audit readiness score
function calculateAuditReadinessScore(kpis) {
  let score = 0
  let maxScore = 0
  
  // Training (15%)
  maxScore += 15
  score += (kpis.trainingCompletionRate / 100) * 15
  
  // Inspections (10%)
  maxScore += 10
  score += (kpis.inspectionCompletionRate / 100) * 10
  
  // FLHA (15%)
  maxScore += 15
  score += (kpis.flhaCompletionRate / 100) * 15
  
  // Near miss reporting (10%)
  maxScore += 10
  if (kpis.ytdNearMisses >= 5) score += 10
  else if (kpis.ytdNearMisses >= 3) score += 7
  else if (kpis.ytdNearMisses >= 1) score += 4
  
  // CAPA closure (15%)
  maxScore += 15
  score += (kpis.capaClosureRate / 100) * 15
  
  // CAPA on-time (10%)
  maxScore += 10
  score += (kpis.capaOnTimeRate / 100) * 10
  
  // Incident-free days (15%)
  maxScore += 15
  if (kpis.daysSinceIncident === null || kpis.daysSinceIncident >= 365) score += 15
  else if (kpis.daysSinceIncident >= 180) score += 12
  else if (kpis.daysSinceIncident >= 90) score += 9
  else if (kpis.daysSinceIncident >= 30) score += 6
  else score += 3
  
  // Documentation completeness (10%)
  maxScore += 10
  const docScore = Math.min((kpis.totalForms / 50) * 10, 10)
  score += docScore
  
  return Math.round((score / maxScore) * 100)
}

// Export function for use in components
export async function exportCORReport(data, options = {}) {
  const pdf = await generateCORReport(data, options)
  
  const filename = `COR_Program_Report_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
  
  return filename
}

export default {
  COR_ELEMENTS,
  calculateSafetyKPIs,
  generateCORReport,
  exportCORReport
}
