/**
 * Document Generation Cloud Functions
 * Handles Claude API integration for AI-driven document generation
 *
 * Enhanced with:
 * - Internal knowledge base (policies & procedures)
 * - Smart content matching based on document type & client scope
 * - Web research for gap-filling
 *
 * @version 2.0.0
 */

const functions = require('firebase-functions/v1')
const admin = require('firebase-admin')

// Initialize Anthropic SDK
const Anthropic = require('@anthropic-ai/sdk')

// Knowledge base service
const knowledgeBase = require('./knowledgeBase/index.cjs')

const db = admin.firestore()

// ============================================
// Configuration
// ============================================

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = 'claude-sonnet-4-20250514'
const MAX_CONTEXT_MESSAGES = 20
const MAX_TOKENS = 8192  // Increased for comprehensive generation

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_MESSAGES_PER_WINDOW = 100

// Initialize Anthropic client
let anthropic = null
if (ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  functions.logger.info('Anthropic SDK initialized successfully')
} else {
  functions.logger.warn('Anthropic API key not configured. Document generation will fail.')
}

// ============================================
// Security Helpers
// ============================================

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return String(text).replace(/[&<>"']/g, m => map[m])
}

/**
 * Check rate limit for document generation
 */
async function checkRateLimit(orgId) {
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

  // Reset window if expired
  if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
    await rateLimitRef.set({
      count: 1,
      windowStart: now,
      lastAttempt: now
    })
    return true
  }

  // Check limit
  if (data.count >= MAX_MESSAGES_PER_WINDOW) {
    return false
  }

  // Increment counter
  await rateLimitRef.update({
    count: admin.firestore.FieldValue.increment(1),
    lastAttempt: now
  })

  return true
}

/**
 * Verify user has access to the document
 */
async function verifyDocumentAccess(documentId, userId) {
  const docRef = db.collection('generatedDocuments').doc(documentId)
  const docSnap = await docRef.get()

  if (!docSnap.exists) {
    return { authorized: false, error: 'Document not found' }
  }

  const document = docSnap.data()
  const orgId = document.organizationId

  // Check user's organization membership
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

  // Only operators, management, and admins can use document generation
  if (!['admin', 'management', 'operator'].includes(membership.role)) {
    return { authorized: false, error: 'Insufficient permissions' }
  }

  return { authorized: true, document, orgId, membership }
}

// ============================================
// Document Type System Prompts
// ============================================

const DOCUMENT_TYPE_PROMPTS = {
  sms: `You are an expert safety consultant specializing in Safety Management Systems (SMS).
You help create comprehensive SMS documentation that complies with ICAO standards, Transport Canada regulations, and industry best practices.
Focus on: Safety Policy, Safety Risk Management, Safety Assurance, and Safety Promotion.
Adapt content to the client's specific operations - whether drone/RPAS, industrial, or general business.`,

  training_manual: `You are an expert training specialist.
You help create comprehensive training manuals covering ground training, practical training, proficiency standards, and recurrent training requirements.
Ensure all content aligns with regulatory training requirements and industry best practices.
Adapt to the client's industry - aviation, construction, industrial, or other sectors.`,

  maintenance_plan: `You are an expert maintenance specialist.
You help create maintenance program documentation including policies, schedules, procedures, and record-keeping requirements.
Ensure compliance with manufacturer recommendations and regulatory requirements.
Adapt to equipment type - whether aircraft, drones, industrial equipment, or vehicles.`,

  ops_manual: `You are an expert operations consultant.
You help create operations manuals covering organizational structure, operations procedures, emergency procedures, and SOPs.
Focus on practical, actionable procedures that ensure safe and efficient operations.
Adapt to the client's industry and operational scope.`,

  safety_declaration: `You are an expert in safety declarations and risk assessment.
You help create safety declarations that clearly articulate the scope of operations, risk assessments, and commitment to safety.
Ensure clarity and completeness for regulatory review.
Adapt format based on applicable regulations.`,

  hse_manual: `You are an expert in Health, Safety, and Environment (HSE) management.
You help create comprehensive HSE manuals covering policies, hazard management, incident procedures, and PPE requirements.
Focus on practical workplace safety measures applicable to any industry.`,

  risk_assessment: `You are an expert in risk assessment and hazard management.
You help create thorough risk assessments with hazard identification, risk analysis, and mitigation measures.
Use structured risk matrices and clear evaluation criteria.
Adapt methodology to the client's industry and operations.`,

  sop: `You are an expert in creating Standard Operating Procedures (SOPs).
You help create clear, step-by-step procedures that ensure consistent, safe operations.
Focus on clarity, completeness, and practical applicability.
Adapt to any industry or operational context.`,

  erp: `You are an expert in emergency response planning.
You help create comprehensive emergency response plans including procedures, contacts, and communication protocols.
Ensure plans are actionable and cover all relevant scenarios for the client's operations.`,

  compliance_matrix: `You are an expert in regulatory compliance management.
You help create compliance matrices that track regulatory requirements, compliance status, and evidence documentation.
Ensure thorough coverage of all applicable regulations for the client's industry.`
}

// ============================================
// Context Building
// ============================================

/**
 * Build comprehensive system prompt with knowledge base content
 */
async function buildEnhancedSystemPrompt(document, project) {
  const typePrompt = DOCUMENT_TYPE_PROMPTS[document.type] || DOCUMENT_TYPE_PROMPTS.sop

  // Get relevant knowledge base content
  const kbContext = knowledgeBase.buildKnowledgeContext(
    document.type,
    project.sharedContext,
    12000 // Max tokens for knowledge base context
  )

  let systemPrompt = `${typePrompt}

## Your Role
You are helping ${project.clientName || 'this client'} create professional documentation.
You have access to a comprehensive internal knowledge base with proven, compliant policies and procedures.
Use this knowledge base as your PRIMARY source, adapting content to the client's specific needs.
When the knowledge base doesn't cover something, use your expertise and research to fill gaps.

## Client Context
Client: ${project.clientName}
Project: ${project.name}
${project.description ? `Description: ${project.description}` : ''}

### Operations Profile
${project.sharedContext?.companyProfile ? `Company Profile: ${project.sharedContext.companyProfile}` : ''}
${project.sharedContext?.operationsScope ? `Operations Scope: ${project.sharedContext.operationsScope}` : ''}
${project.sharedContext?.aircraftTypes?.length ? `Equipment/Aircraft: ${project.sharedContext.aircraftTypes.join(', ')}` : ''}
${project.sharedContext?.regulations?.length ? `Applicable Regulations: ${project.sharedContext.regulations.join(', ')}` : ''}
${project.sharedContext?.customContext ? `Additional Context: ${project.sharedContext.customContext}` : ''}

### Client Industry Detection
${kbContext.includesDroneOps ? '✓ Client operations include drone/RPAS work - include aviation-specific content' : '✗ Client does NOT appear to do drone/RPAS work - focus on general industry content'}

## Current Document
Type: ${document.type}
Title: ${document.title}
Version: ${document.version}
Status: ${document.status}

### Document Sections
${document.sections.map((s, i) => `${i + 1}. ${s.title}${s.content ? ' (has content)' : ' (empty)'}`).join('\n')}

${document.localContext?.specificRequirements ? `### Document-Specific Requirements\n${document.localContext.specificRequirements}` : ''}
${document.localContext?.regulatoryReferences?.length ? `### Regulatory References\n${document.localContext.regulatoryReferences.join('\n')}` : ''}

---

## INTERNAL KNOWLEDGE BASE

The following is your primary reference material. Adapt this content to the client's needs:

### Policies Included (${kbContext.includedPolicies.length})
${kbContext.includedPolicies.map(p => `- ${p.number}: ${p.title}`).join('\n')}

### Procedures Included (${kbContext.includedProcedures.length})
${kbContext.includedProcedures.map(p => `- ${p.number}: ${p.title}`).join('\n')}

${kbContext.gaps.length > 0 ? `### Potential Gaps (may need research)
Topics the client may need that aren't fully covered: ${kbContext.gaps.join(', ')}` : ''}

---

${kbContext.content}

---

## Instructions
1. **Use the knowledge base content above as your primary source**
2. **Adapt and customize** content to match the client's specific context
3. **Maintain compliance** with relevant regulations
4. **Fill gaps** using your expertise when the knowledge base doesn't cover something
5. **Ask clarifying questions** if requirements are unclear
6. **Format in markdown** for easy editing
7. **Be thorough but concise** - professional documentation style
8. **Reference specific regulations** where applicable`

  return {
    systemPrompt,
    knowledgeContext: kbContext
  }
}

/**
 * Get conversation history for context
 */
async function getConversationHistory(documentId, limit = MAX_CONTEXT_MESSAGES) {
  const messagesRef = db.collection('documentConversations').doc(documentId).collection('messages')
  const snapshot = await messagesRef
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snapshot.docs
    .map(doc => ({
      role: doc.data().role,
      content: doc.data().content
    }))
    .reverse()
}

/**
 * Store a message in the conversation
 */
async function storeMessage(documentId, role, content, tokenUsage = null, contextSnapshot = null) {
  const messagesRef = db.collection('documentConversations').doc(documentId).collection('messages')

  await messagesRef.add({
    role,
    content,
    tokenUsage,
    contextSnapshot,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })
}

/**
 * Perform web search for additional research (using Claude's built-in capabilities)
 * This is called when we detect gaps in the knowledge base
 */
async function performResearch(gaps, context, anthropic) {
  if (!gaps || gaps.length === 0) return null

  const researchPrompt = `Based on the following context and gaps, provide brief, factual information that would help create professional documentation:

Context: ${context}

Topics needing research:
${gaps.map(g => `- ${g}`).join('\n')}

Provide concise, factual information for each topic. Focus on:
1. Industry best practices
2. Common regulatory requirements
3. Standard procedures or approaches
4. Key considerations

Format as bullet points, keeping each topic to 2-3 key points.`

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: researchPrompt }]
    })

    return response.content[0].text
  } catch (error) {
    functions.logger.error('Research request failed:', error)
    return null
  }
}

// ============================================
// Callable Functions
// ============================================

/**
 * Send a message to Claude for document assistance
 */
const sendDocumentMessage = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { documentId, message, enableResearch = true } = data
  const userId = context.auth.uid

  // Input validation
  if (!documentId || typeof documentId !== 'string' || documentId.length > 255) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid document ID is required'
    )
  }

  if (!message || typeof message !== 'string' || message.length > 10000) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Message is required and must be under 10000 characters'
    )
  }

  if (!anthropic) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'AI service not configured'
    )
  }

  // Verify access
  const accessResult = await verifyDocumentAccess(documentId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      accessResult.error
    )
  }

  const { document, orgId } = accessResult

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Rate limit exceeded. Please try again later.'
    )
  }

  try {
    // Get project context
    const projectRef = db.collection('documentProjects').doc(document.documentProjectId)
    const projectSnap = await projectRef.get()

    if (!projectSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Project not found')
    }

    const project = projectSnap.data()

    // Build enhanced system prompt with knowledge base
    const { systemPrompt, knowledgeContext } = await buildEnhancedSystemPrompt(document, project)

    // Perform research if gaps detected and enabled
    let researchContent = null
    if (enableResearch && knowledgeContext.gaps.length > 0) {
      researchContent = await performResearch(
        knowledgeContext.gaps,
        `${project.sharedContext?.operationsScope || ''} ${message}`,
        anthropic
      )
    }

    // Get conversation history
    const conversationHistory = await getConversationHistory(documentId)

    // Store user message
    await storeMessage(documentId, 'user', message, null, {
      knowledgePoliciesUsed: knowledgeContext.includedPolicies.map(p => p.number),
      knowledgeProceduresUsed: knowledgeContext.includedProcedures.map(p => p.number),
      gapsIdentified: knowledgeContext.gaps,
      researchPerformed: !!researchContent
    })

    // Build final message with research if available
    let finalMessage = message
    if (researchContent) {
      finalMessage += `\n\n[Additional research conducted on identified gaps:]\n${researchContent}`
    }

    // Build messages array for Claude
    const messages = [
      ...conversationHistory,
      { role: 'user', content: finalMessage }
    ]

    // Call Claude API
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: messages
    })

    const assistantMessage = response.content[0].text
    const tokenUsage = {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens
    }

    // Store assistant response
    await storeMessage(documentId, 'assistant', assistantMessage, tokenUsage)

    // Update document timestamp
    await db.collection('generatedDocuments').doc(documentId).update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return {
      success: true,
      message: assistantMessage,
      tokenUsage,
      knowledgeUsed: {
        policies: knowledgeContext.includedPolicies.length,
        procedures: knowledgeContext.includedProcedures.length,
        includesDroneOps: knowledgeContext.includesDroneOps
      },
      gapsIdentified: knowledgeContext.gaps,
      researchPerformed: !!researchContent
    }
  } catch (error) {
    functions.logger.error('Error in sendDocumentMessage:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while generating content'
    )
  }
})

/**
 * Generate content for a specific document section
 */
const generateSectionContent = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { documentId, sectionId, prompt, enableResearch = true } = data
  const userId = context.auth.uid

  // Input validation
  if (!documentId || !sectionId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Document ID and section ID are required'
    )
  }

  if (!prompt || typeof prompt !== 'string' || prompt.length > 5000) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Prompt is required and must be under 5000 characters'
    )
  }

  if (!anthropic) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'AI service not configured'
    )
  }

  // Verify access
  const accessResult = await verifyDocumentAccess(documentId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      accessResult.error
    )
  }

  const { document, orgId } = accessResult

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Rate limit exceeded. Please try again later.'
    )
  }

  // Find the section
  const section = document.sections.find(s => s.id === sectionId)
  if (!section) {
    throw new functions.https.HttpsError('not-found', 'Section not found')
  }

  try {
    // Get project context
    const projectRef = db.collection('documentProjects').doc(document.documentProjectId)
    const projectSnap = await projectRef.get()
    const project = projectSnap.data()

    // Build enhanced system prompt
    const { systemPrompt, knowledgeContext } = await buildEnhancedSystemPrompt(document, project)

    // Perform research if gaps detected
    let researchContent = null
    if (enableResearch && knowledgeContext.gaps.length > 0) {
      researchContent = await performResearch(
        knowledgeContext.gaps,
        `${section.title} ${prompt}`,
        anthropic
      )
    }

    // Build section-specific prompt
    let sectionPrompt = `Generate comprehensive content for the "${section.title}" section.

User instructions: ${prompt}

${section.content ? `Current section content to expand/improve:\n${section.content}` : 'This section is currently empty. Generate complete content.'}

Requirements:
- Use the internal knowledge base content provided as your primary source
- Adapt content to match the client's specific context and industry
- Generate well-structured, professional content
- Use markdown formatting (headers, lists, tables as appropriate)
- Ensure compliance with applicable regulations
- Be thorough but concise
- Include specific, actionable content where appropriate`

    if (researchContent) {
      sectionPrompt += `\n\n[Research on identified gaps:]\n${researchContent}`
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: sectionPrompt }]
    })

    const generatedContent = response.content[0].text
    const tokenUsage = {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens
    }

    // Store the generation in conversation history
    await storeMessage(
      documentId,
      'system',
      `Generated content for section: ${section.title}`,
      tokenUsage,
      {
        sectionId,
        knowledgePoliciesUsed: knowledgeContext.includedPolicies.map(p => p.number),
        knowledgeProceduresUsed: knowledgeContext.includedProcedures.map(p => p.number),
        gapsIdentified: knowledgeContext.gaps,
        researchPerformed: !!researchContent
      }
    )

    return {
      success: true,
      content: generatedContent,
      sectionId,
      tokenUsage,
      knowledgeUsed: {
        policies: knowledgeContext.includedPolicies.length,
        procedures: knowledgeContext.includedProcedures.length,
        includesDroneOps: knowledgeContext.includesDroneOps
      },
      gapsIdentified: knowledgeContext.gaps,
      researchPerformed: !!researchContent
    }
  } catch (error) {
    functions.logger.error('Error in generateSectionContent:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while generating section content'
    )
  }
})

/**
 * Search the knowledge base for relevant content
 */
const searchKnowledgeBase = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { query, type = 'all', limit = 10 } = data

  if (!query || typeof query !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Query is required'
    )
  }

  try {
    let results = { policies: [], procedures: [] }

    if (type === 'all' || type === 'policies') {
      results.policies = knowledgeBase.searchPolicies(query, limit)
        .map(p => ({
          number: p.number,
          title: p.title,
          category: p.category,
          description: p.description,
          score: p._score
        }))
    }

    if (type === 'all' || type === 'procedures') {
      results.procedures = knowledgeBase.searchProcedures(query, limit)
        .map(p => ({
          number: p.number,
          title: p.title,
          category: p.category,
          description: p.description,
          score: p._score
        }))
    }

    return {
      success: true,
      results
    }
  } catch (error) {
    functions.logger.error('Error searching knowledge base:', error)
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while searching'
    )
  }
})

/**
 * Get knowledge base content for a specific document type
 */
const getKnowledgeForDocumentType = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { documentType, projectContext = {} } = data

  if (!documentType) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Document type is required'
    )
  }

  try {
    const relevant = knowledgeBase.getRelevantContent(documentType, projectContext)

    return {
      success: true,
      includesDroneOps: relevant.includesDroneOps,
      policies: relevant.policies.map(p => ({
        number: p.number,
        title: p.title,
        category: p.category,
        description: p.description
      })),
      procedures: relevant.procedures.map(p => ({
        number: p.number,
        title: p.title,
        category: p.category,
        description: p.description
      })),
      gaps: relevant.gaps,
      documentTypeInfo: relevant.mapping
    }
  } catch (error) {
    functions.logger.error('Error getting knowledge for document type:', error)
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred'
    )
  }
})

/**
 * Get token usage statistics for an organization
 */
const getOrganizationTokenUsage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { organizationId } = data
  const userId = context.auth.uid

  // Verify user is member of organization
  const membershipId = `${userId}_${organizationId}`
  const membershipRef = db.collection('organizationMembers').doc(membershipId)
  const membershipSnap = await membershipRef.get()

  if (!membershipSnap.exists || membershipSnap.data().status !== 'active') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'User not a member of this organization'
    )
  }

  try {
    // Get all documents for the organization
    const documentsSnap = await db.collection('generatedDocuments')
      .where('organizationId', '==', organizationId)
      .get()

    let totalPromptTokens = 0
    let totalCompletionTokens = 0
    let messageCount = 0

    // Aggregate token usage from all conversations
    for (const docSnap of documentsSnap.docs) {
      const messagesSnap = await db.collection('documentConversations')
        .doc(docSnap.id)
        .collection('messages')
        .get()

      messagesSnap.docs.forEach(msgDoc => {
        const msgData = msgDoc.data()
        if (msgData.tokenUsage) {
          totalPromptTokens += msgData.tokenUsage.promptTokens || 0
          totalCompletionTokens += msgData.tokenUsage.completionTokens || 0
        }
        messageCount++
      })
    }

    return {
      success: true,
      usage: {
        promptTokens: totalPromptTokens,
        completionTokens: totalCompletionTokens,
        totalTokens: totalPromptTokens + totalCompletionTokens,
        messageCount,
        documentCount: documentsSnap.size
      }
    }
  } catch (error) {
    functions.logger.error('Error getting token usage:', error)
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while retrieving usage statistics'
    )
  }
})

/**
 * Populate ALL sections of a document with baseline content from knowledge base
 * This is the main function for auto-generating complete document content
 */
const populateAllSections = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' }) // Extended timeout for full document generation
  .https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    )
  }

  const { documentId } = data
  const userId = context.auth.uid

  if (!documentId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Document ID is required'
    )
  }

  if (!anthropic) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'AI service not configured'
    )
  }

  // Verify access
  const accessResult = await verifyDocumentAccess(documentId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      accessResult.error
    )
  }

  const { document, orgId } = accessResult

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Rate limit exceeded. Please try again later.'
    )
  }

  try {
    // Get project context
    const projectRef = db.collection('documentProjects').doc(document.documentProjectId)
    const projectSnap = await projectRef.get()

    if (!projectSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Project not found')
    }

    const project = projectSnap.data()

    // Build enhanced system prompt with knowledge base
    const { systemPrompt, knowledgeContext } = await buildEnhancedSystemPrompt(document, project)

    // Generate content for all sections in a single request
    const sectionsToGenerate = document.sections.filter(s => !s.content || s.content.trim() === '')

    if (sectionsToGenerate.length === 0) {
      return {
        success: true,
        message: 'All sections already have content',
        sectionsUpdated: 0
      }
    }

    // Build the generation prompt
    const allSectionsPrompt = `Generate comprehensive baseline content for this ${document.type} document.
Client: ${project.clientName}
${project.sharedContext?.operationsScope ? `Operations: ${project.sharedContext.operationsScope}` : ''}

Generate professional, compliance-ready content for EACH of the following sections. Use the knowledge base content provided as your primary source and adapt it to this client's specific context.

For each section, provide complete, well-structured content with:
- Clear headers and organization
- Specific, actionable details (not generic placeholders)
- Relevant regulatory references where applicable
- Markdown formatting

Sections to generate:
${sectionsToGenerate.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
===SECTION: [Section Title]===
[Content for that section]

===SECTION: [Next Section Title]===
[Content for that section]

And so on for each section. Make sure each section is substantial and professional.`

    // Call Claude API with extended context
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: allSectionsPrompt }]
    })

    const generatedText = response.content[0].text
    const tokenUsage = {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens
    }

    // Parse the response into sections
    const sectionPattern = /===SECTION:\s*(.+?)===\s*([\s\S]*?)(?====SECTION:|$)/gi
    const parsedSections = {}
    let match

    while ((match = sectionPattern.exec(generatedText)) !== null) {
      const sectionTitle = match[1].trim()
      const sectionContent = match[2].trim()
      parsedSections[sectionTitle.toLowerCase()] = sectionContent
    }

    // Update sections in Firestore
    const updatedSections = document.sections.map(section => {
      // Try to find matching generated content
      const matchKey = Object.keys(parsedSections).find(key =>
        section.title.toLowerCase().includes(key) ||
        key.includes(section.title.toLowerCase()) ||
        // Fuzzy match for similar titles
        key.split(' ').some(word => section.title.toLowerCase().includes(word))
      )

      if (matchKey && parsedSections[matchKey] && (!section.content || section.content.trim() === '')) {
        return {
          ...section,
          content: parsedSections[matchKey],
          generatedFrom: new Date().toISOString()
        }
      }
      return section
    })

    // Count how many were actually updated
    const sectionsUpdated = updatedSections.filter((s, i) =>
      s.content !== document.sections[i].content
    ).length

    // Save to Firestore
    await db.collection('generatedDocuments').doc(documentId).update({
      sections: updatedSections,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    // Store the generation in conversation history
    await storeMessage(
      documentId,
      'system',
      `Auto-populated ${sectionsUpdated} sections with baseline content`,
      tokenUsage,
      {
        action: 'populateAllSections',
        sectionsUpdated,
        knowledgePoliciesUsed: knowledgeContext.includedPolicies.map(p => p.number),
        knowledgeProceduresUsed: knowledgeContext.includedProcedures.map(p => p.number)
      }
    )

    return {
      success: true,
      sectionsUpdated,
      totalSections: document.sections.length,
      tokenUsage,
      knowledgeUsed: {
        policies: knowledgeContext.includedPolicies.length,
        procedures: knowledgeContext.includedProcedures.length,
        includesDroneOps: knowledgeContext.includesDroneOps
      }
    }
  } catch (error) {
    functions.logger.error('Error in populateAllSections:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while generating document content'
    )
  }
})

module.exports = {
  sendDocumentMessage,
  generateSectionContent,
  populateAllSections,
  searchKnowledgeBase,
  getKnowledgeForDocumentType,
  getOrganizationTokenUsage
}
