/**
 * pdfExportServiceMultiSite.js
 * Multi-site PDF export enhancements for SORA and Operations Plans
 * 
 * This file extends the existing pdfExportService with multi-site capabilities.
 * Import and use these functions alongside the existing service.
 * 
 * Features:
 * - Per-site SORA assessments
 * - Multi-site operations plan with site sections
 * - Aggregate risk summaries
 * - Site map placeholder sections
 * 
 * @location src/lib/pdfExportServiceMultiSite.js
 * @action NEW
 */

import { BrandedPDF } from './pdfExportService'
import { getProjectMapImages } from './staticMapService'
import { logger } from './logger'
import {
  populationCategories,
  uaCharacteristics,
  sailColors,
  sailDescriptions,
  groundMitigations,
  arcLevels,
  getIntrinsicGRC,
  calculateFinalGRC,
  calculateResidualARC,
  getSAIL,
  checkAllOSOCompliance
} from './soraConfig'

// ============================================
// MULTI-SITE OPERATIONS PLAN PDF
// ============================================

export async function generateMultiSiteOperationsPlanPDF(project, branding = null, clientBranding = null, enhancedContent = null, mapImages = null) {
  const sites = Array.isArray(project?.sites) ? project.sites : []

  const pdf = new BrandedPDF({
    title: 'Multi-Site Operations Plan',
    subtitle: `${sites.length} Operation Site${sites.length !== 1 ? 's' : ''}`,
    projectName: project?.name || '',
    projectCode: project?.projectCode || '',
    clientName: project?.clientName || '',
    branding,
    clientBranding
  })

  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()

  // ============================================
  // EXECUTIVE SUMMARY
  // ============================================
  pdf.addNewSection('Executive Summary')

  // Use enhanced executive summary if available
  if (enhancedContent?.executiveSummary) {
    pdf.addEnhancedParagraph(enhancedContent.executiveSummary)
  } else {
    pdf.addParagraph(`This operations plan covers ${sites.length} operation site${sites.length !== 1 ? 's' : ''} for the ${project?.name || 'unnamed'} project.`)
  }
  pdf.addSpacer(5)
  
  // Project Overview KPIs
  const operationTypes = [...new Set(sites.map(s => s.flightPlan?.operationType || 'VLOS'))]
  const maxSAIL = calculateMaxSAIL(sites)
  
  pdf.addKPIRow([
    { label: 'Total Sites', value: sites.length },
    { label: 'Operation Types', value: operationTypes.join(', ') },
    { label: 'Governing SAIL', value: maxSAIL || 'N/A' },
    { label: 'Status', value: project?.status || 'Draft' }
  ])
  
  pdf.addSpacer(10)
  
  // Sites Summary Table
  pdf.addSubsectionTitle('Sites Overview')
  const siteRows = sites.map((site, idx) => {
    const calc = calculateSiteSORA(site)
    return [
      site.name || `Site ${idx + 1}`,
      site.siteSurvey?.location || 'Not specified',
      site.flightPlan?.operationType || 'VLOS',
      calc.sail || 'N/A'
    ]
  })
  pdf.addTable(['Site Name', 'Location', 'Operation Type', 'SAIL'], siteRows)
  
  // ============================================
  // PER-SITE DETAILS
  // ============================================
  sites.forEach((site, index) => {
    pdf.addNewSection(`Site ${index + 1}: ${site.name || 'Unnamed Site'}`)

    // Add site-specific enhanced introduction if available
    const siteIntro = enhancedContent?.sectionIntroductions?.[site.id || `site_${index}`]
    if (siteIntro) {
      pdf.addEnhancedParagraph(siteIntro)
      pdf.addSpacer(5)
    }

    // Site Survey Data
    pdf.addSubsectionTitle('Site Survey')
    const survey = site.siteSurvey || {}
    pdf.addKeyValueGrid([
      { label: 'Location', value: survey.location || 'Not specified' },
      { label: 'Coordinates', value: formatCoordinates(survey.coordinates || site.mapData?.siteSurvey?.siteLocation?.geometry?.coordinates) },
      { label: 'Population Category', value: populationCategories[survey.population?.category]?.label || 'Not assessed' },
      { label: 'Airspace Class', value: survey.airspace?.classification || 'Not specified' }
    ])
    
    if (survey.obstacles?.length > 0) {
      pdf.addSpacer(5)
      pdf.addParagraph(`Identified Obstacles: ${survey.obstacles.length}`, { bold: true })
      const obstacleRows = survey.obstacles.slice(0, 5).map(o => [
        o.type || 'Unknown',
        o.height ? `${o.height}m` : 'N/A',
        o.distance ? `${o.distance}m` : 'N/A'
      ])
      pdf.addTable(['Type', 'Height', 'Distance'], obstacleRows)
    }
    
    // Flight Plan Data
    pdf.checkNewPage(40)
    pdf.addSubsectionTitle('Flight Plan')
    const fp = site.flightPlan || {}
    pdf.addKeyValueGrid([
      { label: 'Operation Type', value: fp.operationType || 'VLOS' },
      { label: 'Max Altitude AGL', value: fp.maxAltitudeAGL ? `${fp.maxAltitudeAGL}m` : 'Not specified' },
      { label: 'Flight Geography Method', value: fp.flightGeographyMethod || 'Not specified' },
      { label: 'Contingency Buffer', value: fp.contingencyBuffer ? `${fp.contingencyBuffer}m` : 'Not specified' }
    ])
    
    // Map Data Positions
    const mapData = site.mapData || {}
    if (mapData.flightPlan?.launchPoint || mapData.flightPlan?.recoveryPoint) {
      pdf.addSpacer(5)
      pdf.addParagraph('Key Positions:', { bold: true })
      const positions = []
      if (mapData.flightPlan?.launchPoint?.geometry?.coordinates) {
        positions.push(['Launch Point', formatCoordinates(mapData.flightPlan.launchPoint.geometry.coordinates)])
      }
      if (mapData.flightPlan?.recoveryPoint?.geometry?.coordinates) {
        positions.push(['Recovery Point', formatCoordinates(mapData.flightPlan.recoveryPoint.geometry.coordinates)])
      }
      if (mapData.flightPlan?.pilotPosition?.geometry?.coordinates) {
        positions.push(['Pilot Position', formatCoordinates(mapData.flightPlan.pilotPosition.geometry.coordinates)])
      }
      if (positions.length > 0) {
        pdf.addTable(['Position', 'Coordinates'], positions)
      }
    }
    
    // Emergency Data
    pdf.checkNewPage(40)
    pdf.addSubsectionTitle('Emergency Plan')
    const emergency = site.mapData?.emergency || {}
    const musterPoints = emergency.musterPoints || []
    const routes = emergency.evacuationRoutes || []
    
    pdf.addKeyValueGrid([
      { label: 'Muster Points', value: musterPoints.length > 0 ? `${musterPoints.length} defined` : 'Not defined' },
      { label: 'Primary Muster', value: musterPoints.find(p => p.isPrimary)?.name || 'Not designated' },
      { label: 'Evacuation Routes', value: routes.length > 0 ? `${routes.length} defined` : 'Not defined' }
    ])
    
    // Site Map
    const siteMapImage = mapImages?.[site.id]
    if (siteMapImage) {
      pdf.checkNewPage(100)
      pdf.addSubsectionTitle('Site Map')
      pdf.addMapImage(siteMapImage, {
        caption: `${site.name || 'Site'} - Operational area and key positions`,
        height: 70
      })
    }

    // SORA Summary for this site
    pdf.checkNewPage(40)
    pdf.addSubsectionTitle('SORA Assessment')

    // Add site-specific risk narrative if available
    const siteRiskNarrative = enhancedContent?.riskNarrative?.[site.id || `site_${index}`]
    if (siteRiskNarrative) {
      pdf.addEnhancedParagraph(siteRiskNarrative)
      pdf.addSpacer(5)
    }

    const calc = calculateSiteSORA(site)

    pdf.addKPIRow([
      { label: 'iGRC', value: calc.iGRC ?? 'N/A' },
      { label: 'fGRC', value: calc.fGRC ?? 'N/A' },
      { label: 'Initial ARC', value: calc.initialARC || 'N/A' },
      { label: 'Residual ARC', value: calc.residualARC || 'N/A' },
      { label: 'SAIL', value: calc.sail || 'N/A' }
    ])

    // Mitigations applied
    const sora = site.soraAssessment || {}
    const appliedMitigations = Object.entries(sora.mitigations || {})
      .filter(([_, v]) => v?.enabled)
      .map(([k, v]) => `${k} (${v.robustness})`)

    if (appliedMitigations.length > 0) {
      pdf.addSpacer(5)
      pdf.addParagraph(`Ground Mitigations: ${appliedMitigations.join(', ')}`)
    }

    if (sora.tmpr?.enabled) {
      pdf.addParagraph(`Tactical Mitigation: ${sora.tmpr.type} (${sora.tmpr.robustness} robustness)`)
    }
  })
  
  // ============================================
  // PROJECT-LEVEL DATA
  // ============================================
  
  // Aircraft
  if (project?.aircraft?.length > 0 || project?.flightPlan?.aircraft?.length > 0) {
    pdf.addNewSection('Aircraft')
    const aircraft = project.aircraft || []
    if (aircraft.length > 0) {
      const acRows = aircraft.map(ac => [
        ac.nickname || ac.registration || 'N/A',
        `${ac.make || ''} ${ac.model || ''}`.trim() || 'N/A',
        ac.mtow ? `${ac.mtow} kg` : 'N/A',
        ac.isPrimary ? 'Primary' : ''
      ])
      pdf.addTable(['Nickname/Reg', 'Make/Model', 'MTOW', 'Status'], acRows)
    }
  }
  
  // Crew
  if (project?.crew?.length > 0) {
    pdf.addNewSection('Crew Roster')
    const crewRows = project.crew.map(m => [
      m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
      m.role || '',
      m.pilotCertNumber || '',
      Array.isArray(m.certifications) ? m.certifications.join(', ') : (m.certifications || 'N/A')
    ])
    pdf.addTable(['Name', 'Role', 'Cert #', 'Certifications'], crewRows)
  }
  
  // Weather Minimums
  const weather = project?.flightPlan?.weatherMinimums
  if (weather) {
    pdf.addNewSection('Weather Minimums')
    pdf.addKeyValueGrid([
      { label: 'Min Visibility', value: weather.minVisibility ? `${weather.minVisibility} SM` : 'N/A' },
      { label: 'Min Ceiling', value: weather.minCeiling ? `${weather.minCeiling} ft AGL` : 'N/A' },
      { label: 'Max Wind', value: weather.maxWind ? `${weather.maxWind} m/s` : 'N/A' },
      { label: 'Max Gust', value: weather.maxGust ? `${weather.maxGust} m/s` : 'N/A' },
      { label: 'Precipitation', value: weather.precipitation === false ? 'Not Allowed' : 'Allowed' }
    ])
  }
  
  // Emergency Contacts (project-level)
  const emergencyPlan = project?.emergencyPlan || {}
  if (emergencyPlan.contacts?.length > 0) {
    pdf.addNewSection('Emergency Contacts')
    const contactRows = emergencyPlan.contacts.map(c => [
      c.name || '',
      c.role || '',
      c.phone || '',
      c.notes || ''
    ])
    pdf.addTable(['Name', 'Role', 'Phone', 'Notes'], contactRows)
    
    // Nearest facilities
    if (emergencyPlan.facilities?.hospitalName) {
      pdf.addSpacer(10)
      pdf.addSubsectionTitle('Nearest Emergency Facilities')
      pdf.addKeyValueGrid([
        { label: 'Hospital', value: emergencyPlan.facilities.hospitalName },
        { label: 'Address', value: emergencyPlan.facilities.hospitalAddress || 'N/A' },
        { label: 'Phone', value: emergencyPlan.facilities.hospitalPhone || 'N/A' },
        { label: 'Distance', value: emergencyPlan.facilities.hospitalDistance ? `${emergencyPlan.facilities.hospitalDistance} km` : 'N/A' }
      ])
    }
  }
  
  // Add enhanced recommendations if available
  if (enhancedContent?.recommendations) {
    pdf.addNewSection('Recommendations')
    if (Array.isArray(enhancedContent.recommendations)) {
      enhancedContent.recommendations.forEach((rec, i) => {
        pdf.addParagraph(`${i + 1}. ${rec}`, { fontSize: 9 })
      })
    } else {
      pdf.addEnhancedParagraph(enhancedContent.recommendations)
    }
  }

  // ============================================
  // APPROVALS
  // ============================================
  pdf.addNewSection('Approvals')

  // Add enhanced closing statement if available
  if (enhancedContent?.closingStatement) {
    pdf.addEnhancedParagraph(enhancedContent.closingStatement)
    pdf.addSpacer(10)
  } else {
    pdf.addParagraph('This operations plan has been reviewed and approved by the following personnel:')
    pdf.addSpacer(10)
  }

  pdf.addSignatureBlock([
    { role: 'Pilot in Command (PIC)', name: '' },
    { role: 'Operations Manager', name: '' },
    { role: 'Safety Officer', name: '' },
    { role: 'Client Representative', name: '' }
  ])
  
  // Fill TOC
  pdf.fillTableOfContents()
  
  // Add footers to all pages
  const totalPages = pdf.pageNumber
  for (let i = 2; i <= totalPages; i++) {
    pdf.doc.setPage(i)
    pdf.addFooter(i, totalPages)
  }
  
  return pdf
}

// ============================================
// MULTI-SITE SORA PDF
// ============================================

export async function generateMultiSiteSORA_PDF(project, branding = null, enhancedContent = null, mapImages = null) {
  const sites = Array.isArray(project?.sites) ? project.sites : []

  const pdf = new BrandedPDF({
    title: 'SORA Risk Assessment',
    subtitle: `Multi-Site Assessment - ${sites.length} Sites`,
    projectName: project?.name || '',
    projectCode: project?.projectCode || '',
    clientName: project?.clientName || '',
    branding
  })

  await pdf.init()
  pdf.addCoverPage()
  pdf.addTableOfContents()

  // ============================================
  // ASSESSMENT SUMMARY
  // ============================================
  pdf.addNewSection('Assessment Summary')

  // Use enhanced executive summary if available
  if (enhancedContent?.executiveSummary) {
    pdf.addEnhancedParagraph(enhancedContent.executiveSummary)
    pdf.addSpacer(5)
  }

  const maxSAIL = calculateMaxSAIL(sites)
  const allWithinScope = sites.every(s => {
    const calc = calculateSiteSORA(s)
    return calc.fGRC !== null && calc.fGRC <= 7
  })

  pdf.addInfoBox(
    'Governing SAIL Level',
    `Based on the multi-site assessment, this operation is governed by SAIL Level ${maxSAIL || 'N/A'}. ${
      allWithinScope
        ? 'All sites are within SORA scope.'
        : 'WARNING: One or more sites are outside SORA scope.'
    }`,
    allWithinScope ? 'info' : 'warning'
  )
  
  pdf.addSpacer(10)
  
  // Summary KPIs
  pdf.addKPIRow([
    { label: 'Sites Assessed', value: sites.length },
    { label: 'Governing SAIL', value: maxSAIL || 'N/A' },
    { label: 'Within Scope', value: allWithinScope ? 'Yes' : 'No' },
    { label: 'Assessment Date', value: new Date().toLocaleDateString('en-CA') }
  ])
  
  pdf.addSpacer(10)
  
  // Sites comparison table
  pdf.addSubsectionTitle('Site Risk Comparison')
  const comparisonRows = sites.map((site, idx) => {
    const calc = calculateSiteSORA(site)
    const sora = site.soraAssessment || {}
    return [
      site.name || `Site ${idx + 1}`,
      populationCategories[sora.populationCategory || 'sparsely']?.label.split('(')[0].trim() || 'N/A',
      calc.iGRC ?? '-',
      calc.fGRC ?? '-',
      calc.residualARC || calc.initialARC || '-',
      calc.sail || '-'
    ]
  })
  pdf.addTable(['Site', 'Population', 'iGRC', 'fGRC', 'ARC', 'SAIL'], comparisonRows)
  
  // ============================================
  // PER-SITE SORA DETAILS
  // ============================================
  sites.forEach((site, index) => {
    pdf.addNewSection(`Site ${index + 1}: ${site.name || 'Unnamed'} - SORA`)

    const sora = site.soraAssessment || {}
    const calc = calculateSiteSORA(site)

    // Add site-specific risk narrative if available
    const siteRiskNarrative = enhancedContent?.riskNarrative?.[site.id || `site_${index}`] || enhancedContent?.riskNarrative
    if (siteRiskNarrative && typeof siteRiskNarrative === 'string') {
      pdf.addEnhancedParagraph(siteRiskNarrative)
      pdf.addSpacer(5)
    }

    // Site Map for SORA context
    const siteMapImage = mapImages?.[site.id]
    if (siteMapImage) {
      pdf.addSubsectionTitle('Operational Area')
      pdf.addMapImage(siteMapImage, {
        caption: `${site.name || 'Site'} - Ground risk assessment area`,
        height: 60
      })
    }

    // Step 2: iGRC
    pdf.addSubsectionTitle('Step 2: Intrinsic Ground Risk Class (iGRC)')
    pdf.addKeyValueGrid([
      { label: 'Population Category', value: populationCategories[sora.populationCategory || calc.population]?.label || 'Not specified' },
      { label: 'UA Characteristics', value: uaCharacteristics[sora.uaCharacteristics || calc.uaChar]?.label || 'Not specified' },
      { label: 'Intrinsic GRC', value: calc.iGRC ?? 'N/A' }
    ])
    
    // Step 3: Final GRC
    pdf.checkNewPage(50)
    pdf.addSubsectionTitle('Step 3: Final Ground Risk Class (fGRC)')
    
    const mitigations = sora.mitigations || {}
    const appliedMitigations = Object.entries(mitigations)
      .filter(([_, v]) => v?.enabled)
    
    if (appliedMitigations.length > 0) {
      const mitRows = appliedMitigations.map(([key, val]) => {
        const mitDef = groundMitigations[key]
        const reduction = mitDef?.reductions?.[val.robustness] || 0
        return [
          mitDef?.name || key,
          val.robustness?.charAt(0).toUpperCase() + val.robustness?.slice(1) || 'None',
          reduction.toString(),
          val.evidence || 'Not documented'
        ]
      })
      pdf.addTable(['Mitigation', 'Robustness', 'Reduction', 'Evidence'], mitRows)
    } else {
      pdf.addParagraph('No ground mitigations applied.')
    }
    
    pdf.addSpacer(5)
    pdf.addKeyValueGrid([
      { label: 'iGRC', value: calc.iGRC ?? 'N/A' },
      { label: 'Total Reduction', value: (calc.iGRC - calc.fGRC) || 0 },
      { label: 'Final GRC', value: calc.fGRC ?? 'N/A' }
    ])
    
    // Steps 4-5: Air Risk
    pdf.checkNewPage(40)
    pdf.addSubsectionTitle('Steps 4-5: Air Risk Assessment')
    pdf.addKeyValueGrid([
      { label: 'Initial ARC', value: `${calc.initialARC} - ${arcLevels[calc.initialARC]?.description || ''}` },
      { label: 'TMPR Applied', value: sora.tmpr?.enabled ? `${sora.tmpr.type} (${sora.tmpr.robustness})` : 'None' },
      { label: 'Residual ARC', value: calc.residualARC }
    ])
    
    // Step 6: SAIL
    pdf.checkNewPage(30)
    pdf.addSubsectionTitle('Step 6: SAIL Determination')
    
    const sailColor = calc.sail ? sailColors[calc.sail] : '#E5E7EB'
    pdf.addInfoBox(
      `SAIL Level: ${calc.sail || 'N/A'}`,
      sailDescriptions[calc.sail] || 'SAIL could not be determined.',
      calc.fGRC <= 7 ? 'info' : 'warning'
    )
    
    // Step 7: OSO Summary (brief)
    if (calc.sail) {
      pdf.checkNewPage(30)
      pdf.addSubsectionTitle('Step 7: OSO Requirements Summary')
      const osoCheck = checkAllOSOCompliance(calc.sail, sora.osoCompliance || {})
      
      pdf.addKeyValueGrid([
        { label: 'Total OSOs', value: osoCheck.summary.total },
        { label: 'Compliant', value: osoCheck.summary.compliant },
        { label: 'Non-Compliant', value: osoCheck.summary.nonCompliant },
        { label: 'Optional', value: osoCheck.summary.optional }
      ])
      
      if (!osoCheck.summary.overallCompliant) {
        pdf.addSpacer(5)
        pdf.addInfoBox('OSO Compliance Gap', `${osoCheck.summary.nonCompliant} required OSOs are not yet compliant.`, 'warning')
      }
    }
  })
  
  // ============================================
  // APPROVALS
  // ============================================
  pdf.addNewSection('Assessment Approval')
  pdf.addSignatureBlock([
    { role: 'SORA Assessor', name: '' },
    { role: 'Technical Reviewer', name: '' },
    { role: 'Operations Manager', name: '' }
  ])
  
  // Fill TOC and footers
  pdf.fillTableOfContents()
  const totalPages = pdf.pageNumber
  for (let i = 2; i <= totalPages; i++) {
    pdf.doc.setPage(i)
    pdf.addFooter(i, totalPages)
  }
  
  return pdf
}

// ============================================
// SINGLE-SITE EXPORT
// ============================================

export async function generateSingleSiteExport(project, siteId, exportType, branding = null, enhancedContent = null, mapImages = null) {
  const sites = Array.isArray(project?.sites) ? project.sites : []
  const site = sites.find(s => s.id === siteId)

  if (!site) {
    throw new Error(`Site ${siteId} not found`)
  }

  // Create a pseudo-project with just this site
  const singleSiteProject = {
    ...project,
    name: `${project.name} - ${site.name}`,
    sites: [site]
  }

  switch (exportType) {
    case 'operations-plan':
      return generateMultiSiteOperationsPlanPDF(singleSiteProject, branding, null, enhancedContent, mapImages)
    case 'sora':
      return generateMultiSiteSORA_PDF(singleSiteProject, branding, enhancedContent, mapImages)
    default:
      throw new Error(`Unknown export type: ${exportType}`)
  }
}

// ============================================
// HELPER FUNCTIONS (exported for use in components)
// ============================================

export function calculateSiteSORA(site) {
  const sora = site.soraAssessment || {}
  const population = sora.populationCategory || site.siteSurvey?.population?.category || 'sparsely'
  const uaChar = sora.uaCharacteristics || '1m_25ms'
  
  const iGRC = getIntrinsicGRC(population, uaChar)
  const fGRC = calculateFinalGRC(iGRC, sora.mitigations || {})
  const initialARC = sora.initialARC || 'ARC-b'
  const residualARC = calculateResidualARC(initialARC, sora.tmpr || {})
  const sail = getSAIL(fGRC, residualARC)
  
  return {
    population,
    uaChar,
    iGRC,
    fGRC,
    initialARC,
    residualARC,
    sail,
    withinScope: fGRC !== null && fGRC <= 7
  }
}

export function calculateMaxSAIL(sites) {
  const sailOrder = ['I', 'II', 'III', 'IV', 'V', 'VI']
  let maxIndex = -1
  
  sites.forEach(site => {
    const calc = calculateSiteSORA(site)
    const idx = sailOrder.indexOf(calc.sail)
    if (idx > maxIndex) {
      maxIndex = idx
    }
  })
  
  return maxIndex >= 0 ? sailOrder[maxIndex] : null
}

function formatCoordinates(coords) {
  if (!coords) return 'Not specified'
  if (Array.isArray(coords) && coords.length >= 2) {
    return `${coords[1].toFixed(5)}°N, ${coords[0].toFixed(5)}°W`
  }
  if (coords.lat !== undefined && coords.lng !== undefined) {
    return `${coords.lat.toFixed(5)}°N, ${coords.lng.toFixed(5)}°W`
  }
  return 'Invalid coordinates'
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

export async function exportMultiSitePDF(type, project, options = {}) {
  const { branding, clientBranding, siteId, enhancedContent, includeMapImages = true } = options
  let pdf

  // Fetch map images for all sites if enabled
  let mapImages = null
  if (includeMapImages) {
    try {
      mapImages = await getProjectMapImages(project, {
        width: 800,
        height: 500,
        style: 'satelliteStreets'
      })
    } catch (e) {
      logger.warn('Failed to fetch map images for multi-site PDF:', e)
    }
  }

  // If siteId provided, export single site
  if (siteId) {
    pdf = await generateSingleSiteExport(project, siteId, type, branding, enhancedContent, mapImages)
  } else {
    // Export all sites
    switch (type) {
      case 'operations-plan':
        pdf = await generateMultiSiteOperationsPlanPDF(project, branding, clientBranding, enhancedContent, mapImages)
        break
      case 'sora':
        pdf = await generateMultiSiteSORA_PDF(project, branding, enhancedContent, mapImages)
        break
      default:
        throw new Error(`Unknown export type: ${type}`)
    }
  }

  const siteSuffix = siteId ? `_site-${siteId}` : '_all-sites'
  const filename = `${type}${siteSuffix}_${project?.projectCode || project?.name || 'export'}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(filename)
  return filename
}

export default {
  generateMultiSiteOperationsPlanPDF,
  generateMultiSiteSORA_PDF,
  generateSingleSiteExport,
  exportMultiSitePDF,
  calculateSiteSORA,
  calculateMaxSAIL
}
