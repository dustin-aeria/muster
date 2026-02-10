/**
 * Export Enhancement Cloud Functions
 * Handles Claude API integration for AI-enhanced PDF exports
 *
 * @version 1.0.0
 */

const functions = require('firebase-functions/v1')
const admin = require('firebase-admin')
const Anthropic = require('@anthropic-ai/sdk')
const crypto = require('crypto')

const db = admin.firestore()

// ============================================
// Configuration
// ============================================

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 4096

// Rate limiting (shared with documentGeneration)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS_PER_WINDOW = 100

// Cache TTL
const CACHE_TTL_DRAFT_MS = 24 * 60 * 60 * 1000 // 24 hours for draft projects
const CACHE_TTL_APPROVED_MS = 0 // Permanent for approved/completed projects

// Initialize Anthropic client
let anthropic = null
if (ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  functions.logger.info('Anthropic SDK initialized for export enhancement')
} else {
  functions.logger.warn('Anthropic API key not configured. Export enhancement will fail.')
}

// ============================================
// Export Type System Prompts
// ============================================

const EXPORT_TYPE_PROMPTS = {
  'quote': {
    system: `You are a professional business development specialist creating compelling quotes for drone services clients.

Your writing style is:
- Professional yet approachable
- Clear about value proposition
- Focused on benefits, not just features
- Confident without being pushy

IMPORTANT: Reference actual project data. Never use generic placeholder text.`,

    sections: {
      scopeSummary: `Write a concise 2-3 sentence description of what will be delivered:
- Highlight the key outcomes the client will receive
- Be specific about the type of service
- Reference the project name and scope`,

      valueProposition: `Write a brief value proposition (2-3 sentences):
- Why choose this operator
- Key differentiators
- Relevant experience or capabilities`,

      pricingIntro: `Write a professional 1-2 sentence introduction to the pricing:
- Frame the investment positively
- Connect price to value delivered
- Do not mention specific amounts (those come from data)`
    }
  },

  'proposal': {
    system: `You are a professional proposal writer creating compelling client proposals for drone services.

Your writing style is:
- Professional and persuasive
- Focused on client benefits
- Clear about methodology and approach
- Confidence-inspiring without overselling

IMPORTANT: Reference actual project data throughout. Never use generic or placeholder content.`,

    sections: {
      executiveSummary: `Write a compelling 2-3 paragraph executive summary that:
- Opens with a clear statement of understanding the client's needs
- Highlights the key benefits and outcomes
- Briefly summarizes the approach
- Closes with a confident value statement`,

      companyValue: `Write 2-3 paragraphs articulating the operator's unique value:
- Key qualifications and experience
- Relevant certifications
- Track record and capabilities
- What sets them apart from competitors`,

      methodologyNarrative: `Write a clear explanation of the approach (2-3 paragraphs):
- How the project will be executed
- Key phases and milestones
- Quality assurance measures
- Client involvement and communication`,

      whyUs: `Write a compelling 2-3 sentence statement about why the client should choose this operator:
- Unique strengths
- Commitment to quality
- Client focus`,

      safetyCommitment: `Write a professional paragraph about safety commitment:
- Regulatory compliance
- Safety protocols
- Risk management approach`
    }
  },

  'project-report': {
    system: `You are a professional technical writer creating comprehensive post-project reports for drone services clients.

Your writing style is:
- Professional and objective
- Clear about methods, findings, and outcomes
- Factual with appropriate detail for technical and executive audiences
- Results-focused with actionable recommendations

IMPORTANT: Reference actual project data, activities, and outcomes. Create a world-class deliverable that demonstrates the value provided.`,

    sections: {
      executiveSummary: `Write a compelling 2-3 paragraph executive summary:
- Summarize the project scope and objectives achieved
- Highlight key deliverables and findings
- Note any significant accomplishments or value delivered
- Provide a brief statement on project success`,

      activitiesNarrative: `Write a professional narrative of field activities (2-3 paragraphs):
- Describe the operations conducted on-site
- Note the sequence of activities and approach taken
- Highlight any adaptations made to achieve objectives
- Reference specific locations, dates, or conditions if available`,

      methodsNarrative: `Describe the methods and techniques employed (2-3 paragraphs):
- Explain the operational approach used
- Detail the data collection methods
- Describe equipment configuration and settings
- Note quality control measures applied`,

      findingsNarrative: `Describe the key findings and observations (2-3 paragraphs):
- What was discovered or documented
- Notable observations from the data
- Any anomalies or items of interest identified
- Quality of data collected`,

      dataAnalysis: `Provide analysis of the collected data (2-3 paragraphs):
- Summarize the data captured
- Describe processing and analysis performed
- Note data quality and completeness
- Reference specific metrics or quantities`,

      deliverablesNarrative: `Describe the deliverables provided to the client (2-3 paragraphs):
- List and describe each deliverable
- Explain the format and content of each
- Note how deliverables meet project objectives
- Describe any additional value provided`,

      recommendations: `Provide professional recommendations (3-5 bullet points):
- Follow-up actions or monitoring if needed
- Future operational considerations
- Additional services that could add value
- Maintenance or update recommendations`
    }
  },

  'operations-plan': {
    system: `You are a professional aviation documentation specialist creating RPAS operations documentation for regulatory submission and client deliverables.

Your writing style is:
- Professional and precise
- Clear and unambiguous
- Suitable for regulatory reviewers and client executives
- Free of generic filler content
- Specific to the actual project data provided

IMPORTANT: Reference actual data from the project context. Never use placeholder text like "[insert here]" or generic statements.`,

    sections: {
      executiveSummary: `Write a 2-3 paragraph professional executive summary that:
- Introduces the operation scope and objectives based on the project details
- Highlights key safety measures and risk mitigations
- Summarizes the operational approach
- References specific sites, aircraft, and crew qualifications`,

      riskNarrative: `Write a clear explanation of the risk assessment that:
- Explains the SORA 2.5 methodology used
- Describes key hazards identified and their mitigations
- Communicates the overall risk posture
- Translates technical risk codes into plain language`,

      recommendations: `Provide 3-5 specific, actionable recommendations based on the assessment data:
- Reference actual site conditions and hazards
- Suggest operational improvements
- Include contingency considerations
- Be practical and implementable`,

      closingStatement: `Write a professional closing statement that:
- Affirms readiness for safe operations
- Notes key approvals required
- Provides appropriate sign-off language`
    }
  },

  'sora': {
    system: `You are an expert SORA (Specific Operations Risk Assessment) specialist with deep knowledge of JARUS SORA 2.5 methodology and Transport Canada RPAS regulations.

Your writing style is:
- Technically precise with correct SORA terminology
- Educational for readers unfamiliar with SORA
- Clear about risk classifications and their implications
- Regulatory-appropriate

IMPORTANT: Use the actual GRC, ARC, and SAIL values from the project. Never invent or guess values.`,

    sections: {
      executiveSummary: `Write a 2-paragraph executive summary of the SORA assessment that:
- States the determined SAIL level and what it means
- Summarizes the ground and air risk classifications
- Notes key mitigations applied
- Confirms operational scope viability`,

      riskNarrative: `Explain the risk assessment in clear prose:
- Convert GRC/ARC classifications into understandable explanations
- Describe what the population category means practically
- Explain the air risk environment
- Clarify what the SAIL level requires operationally`,

      mitigationsSummary: `Summarize the mitigations applied:
- Describe each ground mitigation and its purpose
- Explain tactical mitigation if applied
- Note the robustness levels and what they mean
- Describe the evidence supporting each mitigation`,

      osoNarrative: `Explain the OSO (Operational Safety Objectives) requirements:
- Summarize what OSOs apply to this SAIL level
- Note key compliance requirements
- Highlight any gaps that need addressing`
    }
  },

  'hse-risk': {
    system: `You are an HSE (Health, Safety, and Environment) specialist experienced in field operations and workplace hazard management.

Your writing style is:
- Practical and action-oriented
- Clear about hazard causes and effects
- Focused on prevention and mitigation
- Appropriate for field crews and safety officers`,

    sections: {
      executiveSummary: `Write a brief executive summary that:
- Summarizes the overall risk profile
- Highlights the most significant hazards
- Notes key control measures
- States the residual risk level`,

      hazardDescriptions: `For each hazard, write a professional description that:
- Explains the hazard cause and potential effects
- Describes the control measures
- Notes the risk reduction achieved
- Uses clear cause-effect language`,

      recommendations: `Provide 3-5 practical HSE recommendations:
- Reference specific site conditions
- Suggest additional controls if warranted
- Include PPE considerations
- Note any monitoring requirements`
    }
  },

  'site-survey': {
    system: `You are a site assessment specialist experienced in RPAS operations site evaluation.

Your writing style is:
- Observational and factual
- Clear about site characteristics and constraints
- Practical for operational planning
- Suitable for crew briefings`,

    sections: {
      executiveSummary: `Write a brief site survey summary that:
- Describes the site location and characteristics
- Notes key operational considerations
- Highlights any constraints or hazards
- Confirms suitability for intended operations`,

      siteDescription: `Write a detailed site description covering:
- Geographic and topographic features
- Access and egress routes
- Ground conditions and surfaces
- Notable landmarks and reference points`,

      operationalConsiderations: `Describe operational considerations:
- Airspace constraints
- Obstacle clearances
- Ground hazards
- Weather considerations specific to the site`
    }
  },

  'flight-plan': {
    system: `You are an RPAS flight operations specialist with experience in mission planning and flight authorization documentation.

Your writing style is:
- Operationally precise
- Clear about flight parameters and constraints
- Suitable for regulatory review
- Useful for crew briefing`,

    sections: {
      executiveSummary: `Write a brief flight plan summary that:
- Describes the operation type and purpose
- Notes the aircraft and key parameters
- Highlights airspace considerations
- States the operational envelope`,

      missionDescription: `Describe the mission in detail:
- Operation objectives and deliverables
- Flight profile and patterns
- Coverage area and approach
- Duration and phases`
    }
  },

  'tailgate': {
    system: `You are a field safety specialist experienced in pre-deployment safety briefings for RPAS operations.

Your writing style is:
- Direct and practical
- Focused on immediate safety priorities
- Easy to present verbally
- Action-oriented`,

    sections: {
      briefingIntro: `Write a brief introduction for the safety briefing:
- State the operation objectives
- Note the key safety priorities
- Set expectations for the briefing`,

      emergencyProcedures: `Write coherent emergency procedure prose:
- Describe the emergency response sequence
- Note muster points and evacuation routes
- Clarify communication protocols
- Assign key responsibilities`
    }
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a hash of project data for cache invalidation
 */
function generateProjectHash(project) {
  const relevantData = {
    name: project.name,
    clientName: project.clientName,
    status: project.status,
    sites: project.sites?.map(s => ({
      name: s.name,
      soraAssessment: s.soraAssessment,
      siteSurvey: s.siteSurvey
    })),
    soraAssessment: project.soraAssessment,
    hseRiskAssessment: project.hseRiskAssessment,
    flightPlan: project.flightPlan,
    crew: project.crew?.map(c => ({ name: c.name, role: c.role })),
    emergencyPlan: project.emergencyPlan
  }

  return crypto
    .createHash('md5')
    .update(JSON.stringify(relevantData))
    .digest('hex')
    .substring(0, 16)
}

/**
 * Check rate limit for export enhancement
 */
async function checkRateLimit(orgId) {
  // Shared rate limit with document generation
  const rateLimitRef = db.collection('rateLimits').doc(`doc_gen_${orgId}`)
  const doc = await rateLimitRef.get()
  const now = Date.now()

  if (!doc.exists) {
    await rateLimitRef.set({
      count: 1,
      windowStart: now,
      lastAttempt: now
    })
    return true
  }

  const data = doc.data()

  if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
    await rateLimitRef.set({
      count: 1,
      windowStart: now,
      lastAttempt: now
    })
    return true
  }

  if (data.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  await rateLimitRef.update({
    count: admin.firestore.FieldValue.increment(1),
    lastAttempt: now
  })

  return true
}

/**
 * Verify user has access to the project
 */
async function verifyProjectAccess(projectId, userId) {
  const projectRef = db.collection('projects').doc(projectId)
  const projectSnap = await projectRef.get()

  if (!projectSnap.exists) {
    return { authorized: false, error: 'Project not found' }
  }

  const project = projectSnap.data()
  const orgId = project.organizationId

  const membershipId = `${userId}_${orgId}`
  const membershipRef = db.collection('organizationMembers').doc(membershipId)
  const membershipSnap = await membershipRef.get()

  if (!membershipSnap.exists) {
    return { authorized: false, error: 'User not a member of this organization' }
  }

  const membership = membershipSnap.data()
  if (membership.status !== 'active') {
    return { authorized: false, error: 'User membership not active' }
  }

  if (!['admin', 'management', 'operator'].includes(membership.role)) {
    return { authorized: false, error: 'Insufficient permissions' }
  }

  return { authorized: true, project: { id: projectId, ...project }, orgId, membership }
}

/**
 * Get cached enhancement if valid
 */
async function getCachedEnhancement(projectId, exportType, projectHash) {
  const cacheKey = `${projectId}_${exportType}`
  const cacheRef = db.collection('exportEnhancements').doc(cacheKey)
  const cacheSnap = await cacheRef.get()

  if (!cacheSnap.exists) {
    return null
  }

  const cached = cacheSnap.data()

  // Check if hash matches (project data hasn't changed)
  if (cached.projectHash !== projectHash) {
    return null
  }

  // Check TTL for draft projects
  if (cached.projectStatus === 'draft') {
    const age = Date.now() - cached.cachedAt.toMillis()
    if (age > CACHE_TTL_DRAFT_MS) {
      return null
    }
  }

  return cached
}

/**
 * Store enhancement in cache
 */
async function storeEnhancement(projectId, exportType, enhanced, projectHash, projectStatus, tokenUsage) {
  const cacheKey = `${projectId}_${exportType}`
  const cacheRef = db.collection('exportEnhancements').doc(cacheKey)

  await cacheRef.set({
    projectId,
    exportType,
    enhanced,
    projectHash,
    projectStatus,
    tokenUsage,
    cachedAt: admin.firestore.FieldValue.serverTimestamp()
  })
}

/**
 * Build context from project data for Claude
 */
function buildProjectContext(project, exportType) {
  const sites = Array.isArray(project.sites) ? project.sites : []
  const isMultiSite = sites.length > 1

  let context = `## Project Context
- Project Name: ${project.name || 'Unnamed Project'}
- Project Code: ${project.projectCode || 'N/A'}
- Client: ${project.clientName || 'N/A'}
- Status: ${project.status || 'draft'}
`

  if (isMultiSite) {
    context += `- Sites: ${sites.length}

### Sites Overview
${sites.map((s, i) => `${i + 1}. ${s.name || 'Site ' + (i + 1)}: ${s.siteSurvey?.location || 'Location not specified'}`).join('\n')}
`
  }

  // Add crew info
  if (project.crew?.length > 0) {
    context += `
### Crew (${project.crew.length} personnel)
${project.crew.map(c => `- ${c.name || 'Unnamed'}: ${c.role || 'Unassigned'}`).join('\n')}
`
  }

  // Add aircraft info
  const aircraft = project.aircraft || project.flightPlan?.aircraft || []
  if (aircraft.length > 0) {
    context += `
### Aircraft
${aircraft.map(a => `- ${a.nickname || a.registration || 'N/A'}: ${a.make || ''} ${a.model || ''} (MTOW: ${a.mtow || 'N/A'}kg)`).join('\n')}
`
  }

  // Add SORA data if relevant
  if (['operations-plan', 'sora'].includes(exportType)) {
    if (isMultiSite) {
      context += `
### SORA Assessment by Site
${sites.map((s, i) => {
  const sora = s.soraAssessment || {}
  return `Site ${i + 1}: iGRC=${sora.intrinsicGRC || 'N/A'}, fGRC=${sora.finalGRC || 'N/A'}, ARC=${sora.residualARC || sora.initialARC || 'N/A'}, SAIL=${sora.sail || 'N/A'}`
}).join('\n')}
`
    } else if (project.soraAssessment) {
      const sora = project.soraAssessment
      context += `
### SORA Assessment
- Intrinsic GRC: ${sora.intrinsicGRC || 'N/A'}
- Final GRC: ${sora.finalGRC || 'N/A'}
- Initial ARC: ${sora.initialARC || 'N/A'}
- Residual ARC: ${sora.residualARC || 'N/A'}
- SAIL Level: ${sora.sail || 'N/A'}
- Population Category: ${sora.populationCategory || 'N/A'}
- Operation Type: ${sora.operationType || 'VLOS'}
`
    }
  }

  // Add HSE data if relevant
  if (['operations-plan', 'hse-risk'].includes(exportType) && project.hseRiskAssessment?.hazards?.length > 0) {
    const hazards = project.hseRiskAssessment.hazards
    context += `
### HSE Hazards (${hazards.length} identified)
${hazards.slice(0, 10).map((h, i) => `${i + 1}. ${h.description || 'Unnamed'} - Category: ${h.category || 'General'}, Risk: ${h.riskLevel || 'N/A'}`).join('\n')}
`
  }

  // Add emergency info
  if (project.emergencyPlan) {
    const ep = project.emergencyPlan
    context += `
### Emergency Plan
- Primary Contact: ${ep.primaryEmergencyContact?.name || 'Not set'}
- Hospital: ${ep.nearestHospital || 'Not specified'}
- Muster Point: ${ep.musterPoint || ep.rallyPoint || 'Not specified'}
`
  }

  // Add project report specific context
  if (exportType === 'project-report') {
    // Activities performed
    if (project.activities?.length > 0) {
      context += `
### Field Activities (${project.activities.length} recorded)
${project.activities.slice(0, 10).map((a, i) => `${i + 1}. ${a.type || 'Activity'}: ${a.description || 'No description'} - ${a.status || 'Completed'}`).join('\n')}
`
    }

    // Flight logs
    if (project.flightLogs?.length > 0) {
      const totalFlights = project.flightLogs.length
      const totalDuration = project.flightLogs.reduce((sum, log) => sum + (log.duration || 0), 0)
      context += `
### Flight Summary
- Total Flights: ${totalFlights}
- Total Duration: ${Math.round(totalDuration)} minutes
- Aircraft: ${[...new Set(project.flightLogs.map(l => l.aircraft || 'N/A'))].join(', ')}
`
    }

    // Deliverables
    if (project.needsAnalysis?.deliverables?.length > 0) {
      context += `
### Planned Deliverables
${project.needsAnalysis.deliverables.map((d, i) => `${i + 1}. ${d}`).join('\n')}
`
    }

    // Methodology if specified
    if (project.methodology) {
      context += `
### Methodology
${project.methodology}
`
    }

    // Findings if any
    if (project.findings) {
      context += `
### Preliminary Findings
${project.findings}
`
    }

    // Tailgate briefing completion
    if (project.tailgateBriefing?.completedAt) {
      context += `
### Operations Timeline
- Briefing Completed: ${new Date(project.tailgateBriefing.completedAt).toLocaleDateString()}
`
    }
  }

  return context
}

// ============================================
// Main Cloud Function
// ============================================

/**
 * Enhance export content with Claude AI
 */
const enhanceExportContent = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { projectId, exportType, options = {} } = data
  const userId = context.auth.uid

  // Input validation
  if (!projectId || typeof projectId !== 'string' || projectId.length > 255) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid project ID is required'
    )
  }

  const validExportTypes = ['quote', 'proposal', 'project-report', 'operations-plan', 'sora', 'hse-risk', 'site-survey', 'flight-plan', 'tailgate']
  if (!exportType || !validExportTypes.includes(exportType)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Export type must be one of: ${validExportTypes.join(', ')}`
    )
  }

  if (!anthropic) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'AI service not configured'
    )
  }

  // Verify access
  const accessResult = await verifyProjectAccess(projectId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      accessResult.error
    )
  }

  const { project, orgId } = accessResult

  // Generate project hash for cache comparison
  const projectHash = generateProjectHash(project)

  // Check cache unless force refresh requested
  if (!options.forceRefresh) {
    const cached = await getCachedEnhancement(projectId, exportType, projectHash)
    if (cached) {
      functions.logger.info('Returning cached enhancement', { projectId, exportType })
      return {
        success: true,
        enhanced: cached.enhanced,
        metadata: {
          tokenUsage: cached.tokenUsage,
          cachedAt: cached.cachedAt,
          projectHash: cached.projectHash,
          fromCache: true
        }
      }
    }
  }

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Rate limit exceeded. Please try again later.'
    )
  }

  try {
    // Get prompts for this export type
    const typeConfig = EXPORT_TYPE_PROMPTS[exportType]
    if (!typeConfig) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `No prompts configured for export type: ${exportType}`
      )
    }

    // Build context
    const projectContext = buildProjectContext(project, exportType)

    // Build the generation prompt
    const sectionPrompts = Object.entries(typeConfig.sections)
      .map(([key, prompt]) => `### ${key}\n${prompt}`)
      .join('\n\n')

    const userPrompt = `${projectContext}

## Your Task
Generate exceptional professional prose for the following sections of a ${exportType.replace('-', ' ')} document.

${sectionPrompts}

## Output Format
Return a JSON object with keys matching the section names above. Each value should be the generated prose as a string.
Do not include markdown formatting within the JSON values - just plain text with proper paragraphing.

IMPORTANT:
- Be specific to this project's actual data
- Do not use placeholder text or generic statements
- Reference actual values from the project context
- Write complete, publishable content`

    // Call Claude API
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: typeConfig.system,
      messages: [{ role: 'user', content: userPrompt }]
    })

    const responseText = response.content[0].text
    const tokenUsage = {
      prompt: response.usage.input_tokens,
      completion: response.usage.output_tokens
    }

    // Parse the response as JSON
    let enhanced
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        enhanced = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      functions.logger.warn('Failed to parse response as JSON, using raw text', { parseError })
      // Fallback: use the response text as a single field
      enhanced = {
        executiveSummary: responseText
      }
    }

    // Store in cache
    await storeEnhancement(
      projectId,
      exportType,
      enhanced,
      projectHash,
      project.status || 'draft',
      tokenUsage
    )

    functions.logger.info('Generated export enhancement', {
      projectId,
      exportType,
      tokenUsage
    })

    return {
      success: true,
      enhanced,
      metadata: {
        tokenUsage,
        cachedAt: new Date().toISOString(),
        projectHash,
        fromCache: false
      }
    }
  } catch (error) {
    functions.logger.error('Error in enhanceExportContent:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while generating enhanced content'
    )
  }
})

/**
 * Invalidate cache for a project
 */
const invalidateExportCache = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { projectId, exportType } = data
  const userId = context.auth.uid

  // Verify access
  const accessResult = await verifyProjectAccess(projectId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      accessResult.error
    )
  }

  try {
    if (exportType) {
      // Invalidate specific export type
      const cacheKey = `${projectId}_${exportType}`
      await db.collection('exportEnhancements').doc(cacheKey).delete()
    } else {
      // Invalidate all export types for this project
      const snapshot = await db.collection('exportEnhancements')
        .where('projectId', '==', projectId)
        .get()

      const batch = db.batch()
      snapshot.docs.forEach(doc => batch.delete(doc.ref))
      await batch.commit()
    }

    return { success: true }
  } catch (error) {
    functions.logger.error('Error invalidating cache:', error)
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while invalidating cache'
    )
  }
})

/**
 * Get cache status for a project's exports
 */
const getExportCacheStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { projectId } = data
  const userId = context.auth.uid

  // Verify access
  const accessResult = await verifyProjectAccess(projectId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      accessResult.error
    )
  }

  try {
    const snapshot = await db.collection('exportEnhancements')
      .where('projectId', '==', projectId)
      .get()

    const cacheStatus = {}
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      cacheStatus[data.exportType] = {
        cachedAt: data.cachedAt,
        projectHash: data.projectHash,
        tokenUsage: data.tokenUsage
      }
    })

    // Generate current project hash
    const currentHash = generateProjectHash(accessResult.project)

    return {
      success: true,
      cacheStatus,
      currentProjectHash: currentHash
    }
  } catch (error) {
    functions.logger.error('Error getting cache status:', error)
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while getting cache status'
    )
  }
})

module.exports = {
  enhanceExportContent,
  invalidateExportCache,
  getExportCacheStatus
}
