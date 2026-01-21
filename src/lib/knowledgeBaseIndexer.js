/**
 * knowledgeBaseIndexer.js
 * Utilities for indexing operator documentation into the Knowledge Base
 *
 * This module provides functions to:
 * - Parse policies from policyContent.js into searchable chunks
 * - Index project data (SORA, site surveys, flight plans)
 * - Index equipment specifications
 * - Index crew qualifications
 *
 * @location src/lib/knowledgeBaseIndexer.js
 */

import { POLICY_CONTENT } from '../data/policyContent'
import {
  createChunksBatch,
  deleteChunksBySource,
  clearAllChunks,
  refreshIndexStats
} from './firestoreKnowledgeBase'
import { getPoliciesEnhanced } from './firestorePolicies'
import { logger } from './logger'

// ============================================
// REGULATORY REFERENCE PATTERNS
// ============================================

/**
 * Extract regulatory references from text
 * Patterns: CAR xxx.xx, CARs xxx.xx, AC xxx-xxx, OH&S xxx
 */
export function extractRegulatoryRefs(text) {
  if (!text) return []

  const patterns = [
    /CARs?\s*\d{3}(?:\.\d+)?(?:\([a-z]\))?/gi,  // CAR 901.23, CARs 903.02(d)
    /AC\s*\d{3}-\d{3}/gi,                        // AC 903-001
    /OH&S\s+(?:Act|Code|Regulation)/gi,          // OH&S Act, OH&S Code
    /OHS\s+(?:Code|Regulation)/gi,               // OHS Code
    /Part\s+[IXV]+/gi,                           // Part IX
    /COR\s+Requirements?/gi,                      // COR Requirements
    /CSA\s+[A-Z]?\d+/gi,                          // CSA Z1002
    /ANSI\s+[A-Z]?\d+/gi,                         // ANSI standards
    /ISO\s+\d+/gi,                                // ISO 45001
    /ICAO\s+Doc\s+\d+/gi,                         // ICAO Doc 9995
    /JARUS\s+\w+/gi,                              // JARUS SORA
    /Transport\s+Canada/gi                        // Transport Canada
  ]

  const refs = new Set()
  for (const pattern of patterns) {
    const matches = text.match(pattern)
    if (matches) {
      matches.forEach(m => refs.add(m.trim()))
    }
  }

  return [...refs]
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text) {
  if (!text) return []

  // Domain-specific keywords to look for
  const domainKeywords = [
    // RPAS Operations
    'rpas', 'drone', 'uav', 'uas', 'pilot', 'pic', 'visual observer', 'vo',
    'flight', 'operation', 'bvlos', 'vlos', 'evlos', 'airspace', 'notam',
    'sfoc', 'conops', 'sora', 'sail', 'oso', 'grc', 'arc',
    // Equipment
    'aircraft', 'battery', 'lipo', 'payload', 'sensor', 'camera', 'gimbal',
    'c2 link', 'control link', 'telemetry', 'gps', 'gnss', 'rtk',
    'geo-fence', 'rth', 'return to home', 'failsafe',
    // Safety & Compliance
    'safety', 'emergency', 'incident', 'accident', 'hazard', 'risk',
    'ppe', 'first aid', 'training', 'certification', 'qualification',
    'maintenance', 'inspection', 'airworthiness', 'registration',
    // HSE
    'health', 'environment', 'hse', 'ohs', 'cor', 'audit',
    'investigation', 'capa', 'corrective action',
    // CRM
    'crm', 'briefing', 'debriefing', 'communication', 'fatigue',
    'fitness for duty', 'imsafe', 'decision making', 'tem'
  ]

  const textLower = text.toLowerCase()
  const found = []

  for (const keyword of domainKeywords) {
    if (textLower.includes(keyword)) {
      found.push(keyword)
    }
  }

  return found
}

/**
 * Map policy category to compliance categories
 */
export function mapPolicyCategory(policyCategory) {
  const mapping = {
    rpas: ['operations', 'equipment', 'crew'],
    crm: ['crew', 'procedures'],
    hse: ['safety', 'procedures', 'training']
  }
  return mapping[policyCategory] || ['general']
}

// ============================================
// POLICY INDEXING
// ============================================

/**
 * Index a single policy into chunks
 * @param {Object} policy - Policy data with sections
 * @returns {Array} Array of chunks
 */
export function policyToChunks(policy) {
  const chunks = []

  // Get full content from POLICY_CONTENT if available
  const policyContent = POLICY_CONTENT[policy.number]

  if (policyContent && policyContent.sections) {
    // Index each section as a separate chunk
    for (let i = 0; i < policyContent.sections.length; i++) {
      const section = policyContent.sections[i]

      chunks.push({
        sourceType: 'policy',
        sourceId: policy.id || `pol-${policy.number}`,
        sourceNumber: policy.number,
        sourceTitle: policy.title,
        section: i + 1,
        sectionTitle: section.title,
        content: section.content,
        keywords: [
          ...extractKeywords(section.content),
          ...extractKeywords(section.title),
          ...(policy.keywords || [])
        ],
        regulatoryRefs: [
          ...extractRegulatoryRefs(section.content),
          ...(policyContent.regulatoryRefs || [])
        ],
        categories: mapPolicyCategory(policy.category),
        version: policy.version || policyContent.version,
        effectiveDate: policy.effectiveDate || policyContent.effectiveDate
      })
    }
  } else if (policy.content) {
    // Single chunk for policies without sections
    chunks.push({
      sourceType: 'policy',
      sourceId: policy.id || `pol-${policy.number}`,
      sourceNumber: policy.number,
      sourceTitle: policy.title,
      section: null,
      sectionTitle: null,
      content: policy.content,
      keywords: [
        ...extractKeywords(policy.content),
        ...(policy.keywords || [])
      ],
      regulatoryRefs: [
        ...extractRegulatoryRefs(policy.content),
        ...(policy.regulatoryRefs || [])
      ],
      categories: mapPolicyCategory(policy.category),
      version: policy.version,
      effectiveDate: policy.effectiveDate
    })
  } else {
    // Minimal chunk from policy metadata
    const descriptionContent = [
      policy.description || '',
      policy.sections?.join('. ') || ''
    ].join('\n\n')

    chunks.push({
      sourceType: 'policy',
      sourceId: policy.id || `pol-${policy.number}`,
      sourceNumber: policy.number,
      sourceTitle: policy.title,
      section: null,
      sectionTitle: 'Overview',
      content: descriptionContent,
      keywords: policy.keywords || [],
      regulatoryRefs: policy.regulatoryRefs || [],
      categories: mapPolicyCategory(policy.category),
      version: policy.version,
      effectiveDate: policy.effectiveDate
    })
  }

  return chunks
}

/**
 * Index all policies for an operator
 * @param {string} operatorId - Operator ID
 * @param {Object} options - Indexing options
 * @returns {Promise<Object>} Result with counts
 */
export async function indexAllPolicies(operatorId, options = {}) {
  const { clearExisting = false } = options
  const results = {
    success: true,
    indexed: 0,
    chunks: 0,
    errors: [],
    sources: []
  }

  try {
    // Optionally clear existing policy chunks
    if (clearExisting) {
      // Get all policy chunks and delete them
      const existingChunks = await deleteAllPolicyChunks(operatorId)
      logger.debug(`Cleared ${existingChunks.deleted} existing policy chunks`)
    }

    // Get policies from Firestore
    const policies = await getPoliciesEnhanced()

    if (policies.length === 0) {
      logger.debug('No policies found in Firestore')
      return results
    }

    // Convert policies to chunks
    const allChunks = []
    for (const policy of policies) {
      try {
        const chunks = policyToChunks(policy)
        allChunks.push(...chunks)
        results.sources.push({
          sourceId: policy.id,
          number: policy.number,
          title: policy.title,
          chunksCreated: chunks.length
        })
      } catch (error) {
        results.errors.push({
          policyNumber: policy.number,
          error: error.message
        })
      }
    }

    // Batch create chunks
    if (allChunks.length > 0) {
      const batchResult = await createChunksBatch(operatorId, allChunks)
      results.chunks = batchResult.created
      results.errors.push(...batchResult.errors)
    }

    results.indexed = results.sources.length
    results.success = results.errors.length === 0

    // Update index stats
    await refreshIndexStats(operatorId)

    return results
  } catch (error) {
    results.success = false
    results.errors.push({ general: error.message })
    return results
  }
}

/**
 * Delete all policy chunks
 * @param {string} operatorId - Operator ID
 */
async function deleteAllPolicyChunks(operatorId) {
  const { getChunks } = await import('./firestoreKnowledgeBase')
  const chunks = await getChunks(operatorId, { sourceType: 'policy' })

  const sourceIds = [...new Set(chunks.map(c => c.sourceId))]
  let totalDeleted = 0

  for (const sourceId of sourceIds) {
    const result = await deleteChunksBySource(operatorId, 'policy', sourceId)
    totalDeleted += result.deleted
  }

  return { deleted: totalDeleted }
}

/**
 * Index a single policy (for updates)
 * @param {string} operatorId - Operator ID
 * @param {Object} policy - Policy data
 */
export async function indexSinglePolicy(operatorId, policy) {
  // Delete existing chunks for this policy
  await deleteChunksBySource(operatorId, 'policy', policy.id || `pol-${policy.number}`)

  // Create new chunks
  const chunks = policyToChunks(policy)
  const result = await createChunksBatch(operatorId, chunks)

  // Update stats
  await refreshIndexStats(operatorId)

  return result
}

// ============================================
// PROJECT INDEXING
// ============================================

/**
 * Index project data into chunks
 * @param {Object} project - Project data
 * @returns {Array} Array of chunks
 */
export function projectToChunks(project) {
  const chunks = []
  const baseSourceId = project.id

  // Overview
  if (project.overview?.description) {
    chunks.push({
      sourceType: 'project',
      sourceId: baseSourceId,
      sourceTitle: project.name || 'Project',
      section: 'overview',
      sectionTitle: 'Project Overview',
      content: project.overview.description,
      keywords: extractKeywords(project.overview.description),
      regulatoryRefs: [],
      categories: ['operations']
    })
  }

  // SORA Assessment
  if (project.sora) {
    const soraContent = [
      project.sora.conops ? `CONOPS: ${project.sora.conops}` : '',
      project.sora.sailLevel ? `SAIL Level: ${project.sora.sailLevel}` : '',
      project.sora.grc ? `Ground Risk Class: ${project.sora.grc}` : '',
      project.sora.arc ? `Air Risk Class: ${project.sora.arc}` : '',
      project.sora.groundRisk?.summary || '',
      project.sora.airRisk?.summary || ''
    ].filter(Boolean).join('\n\n')

    if (soraContent) {
      chunks.push({
        sourceType: 'project',
        sourceId: baseSourceId,
        sourceTitle: project.name || 'Project',
        section: 'sora',
        sectionTitle: 'SORA Assessment',
        content: soraContent,
        keywords: ['sora', 'sail', 'risk assessment', 'conops', 'grc', 'arc'],
        regulatoryRefs: ['AC 903-001', 'JARUS SORA'],
        categories: ['operations', 'safety']
      })
    }

    // OSOs
    if (project.sora.osos && Object.keys(project.sora.osos).length > 0) {
      const osoContent = Object.entries(project.sora.osos)
        .map(([osoId, oso]) => `${osoId}: ${oso.status || 'Not assessed'} - ${oso.evidence || ''}`)
        .join('\n')

      chunks.push({
        sourceType: 'project',
        sourceId: baseSourceId,
        sourceTitle: project.name || 'Project',
        section: 'osos',
        sectionTitle: 'Operational Safety Objectives',
        content: osoContent,
        keywords: ['oso', 'operational safety objectives', 'sora', 'mitigation'],
        regulatoryRefs: ['AC 903-001'],
        categories: ['safety']
      })
    }
  }

  // Site Survey
  if (project.siteSurvey) {
    const surveyContent = [
      project.siteSurvey.location?.description || '',
      project.siteSurvey.airspace?.description || '',
      project.siteSurvey.hazards?.join(', ') || '',
      project.siteSurvey.emergencyLandingSites?.join(', ') || ''
    ].filter(Boolean).join('\n\n')

    if (surveyContent) {
      chunks.push({
        sourceType: 'project',
        sourceId: baseSourceId,
        sourceTitle: project.name || 'Project',
        section: 'site-survey',
        sectionTitle: 'Site Survey',
        content: surveyContent,
        keywords: ['site survey', 'location', 'airspace', 'hazards'],
        regulatoryRefs: extractRegulatoryRefs(surveyContent),
        categories: ['operations']
      })
    }
  }

  // Flight Plan
  if (project.flightPlan) {
    const flightContent = [
      project.flightPlan.summary || '',
      project.flightPlan.maxAltitudeAGL ? `Max Altitude: ${project.flightPlan.maxAltitudeAGL} AGL` : '',
      project.flightPlan.operationType || '',
      project.flightPlan.weatherMinimums || ''
    ].filter(Boolean).join('\n\n')

    if (flightContent) {
      chunks.push({
        sourceType: 'project',
        sourceId: baseSourceId,
        sourceTitle: project.name || 'Project',
        section: 'flight-plan',
        sectionTitle: 'Flight Plan',
        content: flightContent,
        keywords: ['flight plan', 'altitude', 'weather', 'operation'],
        regulatoryRefs: extractRegulatoryRefs(flightContent),
        categories: ['operations']
      })
    }
  }

  // Emergency Plan
  if (project.emergencyPlan) {
    chunks.push({
      sourceType: 'project',
      sourceId: baseSourceId,
      sourceTitle: project.name || 'Project',
      section: 'emergency',
      sectionTitle: 'Emergency Plan',
      content: typeof project.emergencyPlan === 'string'
        ? project.emergencyPlan
        : JSON.stringify(project.emergencyPlan),
      keywords: ['emergency', 'contingency', 'lost link', 'flyaway'],
      regulatoryRefs: [],
      categories: ['safety', 'procedures']
    })
  }

  return chunks
}

/**
 * Index a project
 * @param {string} operatorId - Operator ID
 * @param {Object} project - Project data
 */
export async function indexProject(operatorId, project) {
  // Delete existing chunks
  await deleteChunksBySource(operatorId, 'project', project.id)

  // Create new chunks
  const chunks = projectToChunks(project)
  const result = await createChunksBatch(operatorId, chunks)

  // Update stats
  await refreshIndexStats(operatorId)

  return result
}

// ============================================
// EQUIPMENT INDEXING
// ============================================

/**
 * Index equipment into chunks
 * @param {Object} equipment - Equipment/aircraft data
 * @returns {Array} Array of chunks
 */
export function equipmentToChunks(equipment) {
  const chunks = []

  const content = [
    `Make/Model: ${equipment.make || ''} ${equipment.model || ''}`,
    equipment.registration ? `Registration: ${equipment.registration}` : '',
    equipment.mtow ? `MTOW: ${equipment.mtow}` : '',
    equipment.maxSpeed ? `Max Speed: ${equipment.maxSpeed}` : '',
    equipment.endurance ? `Endurance: ${equipment.endurance}` : '',
    equipment.specifications || '',
    equipment.capabilities?.join(', ') || ''
  ].filter(Boolean).join('\n')

  chunks.push({
    sourceType: 'equipment',
    sourceId: equipment.id,
    sourceTitle: `${equipment.make || ''} ${equipment.model || ''}`.trim() || 'Aircraft',
    section: null,
    sectionTitle: 'Specifications',
    content,
    keywords: ['aircraft', 'equipment', 'rpas', equipment.make?.toLowerCase(), equipment.model?.toLowerCase()].filter(Boolean),
    regulatoryRefs: ['CAR 901.02'],
    categories: ['equipment']
  })

  return chunks
}

/**
 * Index equipment/aircraft
 * @param {string} operatorId - Operator ID
 * @param {Object} equipment - Equipment data
 */
export async function indexEquipment(operatorId, equipment) {
  await deleteChunksBySource(operatorId, 'equipment', equipment.id)
  const chunks = equipmentToChunks(equipment)
  const result = await createChunksBatch(operatorId, chunks)
  await refreshIndexStats(operatorId)
  return result
}

// ============================================
// CREW INDEXING
// ============================================

/**
 * Index crew member into chunks
 * @param {Object} crew - Crew member data
 * @returns {Array} Array of chunks
 */
export function crewToChunks(crew) {
  const chunks = []

  const content = [
    `Name: ${crew.name || ''}`,
    crew.role ? `Role: ${crew.role}` : '',
    crew.certifications?.map(c => `Certification: ${c.type} - ${c.number} (Expires: ${c.expiry || 'N/A'})`).join('\n') || '',
    crew.training?.map(t => `Training: ${t.name} (Completed: ${t.date || 'N/A'})`).join('\n') || '',
    crew.qualifications?.join(', ') || ''
  ].filter(Boolean).join('\n')

  chunks.push({
    sourceType: 'crew',
    sourceId: crew.id,
    sourceTitle: crew.name || 'Crew Member',
    section: null,
    sectionTitle: 'Qualifications',
    content,
    keywords: ['crew', 'pilot', 'certification', 'training', 'qualification'],
    regulatoryRefs: ['CAR 901.54', 'CAR 901.55'],
    categories: ['crew']
  })

  return chunks
}

/**
 * Index crew member
 * @param {string} operatorId - Operator ID
 * @param {Object} crew - Crew data
 */
export async function indexCrew(operatorId, crew) {
  await deleteChunksBySource(operatorId, 'crew', crew.id)
  const chunks = crewToChunks(crew)
  const result = await createChunksBatch(operatorId, chunks)
  await refreshIndexStats(operatorId)
  return result
}

// ============================================
// FULL REINDEX
// ============================================

/**
 * Perform full reindex of all operator documentation
 * @param {string} operatorId - Operator ID
 * @param {Object} options - Options
 * @returns {Promise<Object>} Results
 */
export async function fullReindex(operatorId, options = {}) {
  const results = {
    success: true,
    policies: { indexed: 0, chunks: 0 },
    projects: { indexed: 0, chunks: 0 },
    equipment: { indexed: 0, chunks: 0 },
    crew: { indexed: 0, chunks: 0 },
    errors: []
  }

  try {
    // Clear all existing chunks
    await clearAllChunks(operatorId)

    // Index policies
    const policyResult = await indexAllPolicies(operatorId, { clearExisting: false })
    results.policies = {
      indexed: policyResult.indexed,
      chunks: policyResult.chunks
    }
    results.errors.push(...policyResult.errors)

    // Note: Projects, equipment, and crew would be indexed when their data is available
    // They would be called from their respective components/pages

    // Update final stats
    await refreshIndexStats(operatorId)

    return results
  } catch (error) {
    results.success = false
    results.errors.push({ general: error.message })
    return results
  }
}

// ============================================
// EXPORT
// ============================================

export default {
  extractRegulatoryRefs,
  extractKeywords,
  policyToChunks,
  indexAllPolicies,
  indexSinglePolicy,
  projectToChunks,
  indexProject,
  equipmentToChunks,
  indexEquipment,
  crewToChunks,
  indexCrew,
  fullReindex
}
