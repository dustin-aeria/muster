/**
 * Document Generation Cloud Functions
 * Handles Claude API integration for AI-driven document generation
 *
 * @version 1.0.0
 */

const functions = require('firebase-functions/v1')
const admin = require('firebase-admin')

// Initialize Anthropic SDK
const Anthropic = require('@anthropic-ai/sdk')

const db = admin.firestore()

// ============================================
// Configuration
// ============================================

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = 'claude-sonnet-4-20250514'
const MAX_CONTEXT_MESSAGES = 20
const MAX_TOKENS = 4096

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
  sms: `You are an expert aviation safety consultant specializing in Safety Management Systems (SMS).
You help create comprehensive SMS documentation that complies with ICAO standards and regulatory requirements.
Focus on: Safety Policy, Safety Risk Management, Safety Assurance, and Safety Promotion.
Use clear, professional language appropriate for regulatory documentation.`,

  training_manual: `You are an expert aviation training specialist.
You help create comprehensive training manuals covering ground training, flight training, proficiency standards, and recurrent training requirements.
Ensure all content aligns with regulatory training requirements and industry best practices.`,

  maintenance_plan: `You are an expert aviation maintenance specialist.
You help create maintenance program documentation including policies, schedules, procedures, and record-keeping requirements.
Ensure compliance with manufacturer recommendations and regulatory requirements.`,

  ops_manual: `You are an expert aviation operations consultant.
You help create operations manuals covering organizational structure, flight operations, emergency procedures, and SOPs.
Focus on practical, actionable procedures that ensure safe and efficient operations.`,

  safety_declaration: `You are an expert in aviation safety declarations and risk assessment.
You help create safety declarations that clearly articulate the scope of operations, risk assessments, and commitment to safety.
Ensure clarity and completeness for regulatory review.`,

  hse_manual: `You are an expert in Health, Safety, and Environment (HSE) management.
You help create comprehensive HSE manuals covering policies, hazard management, incident procedures, and PPE requirements.
Focus on practical workplace safety measures.`,

  risk_assessment: `You are an expert in aviation risk assessment and hazard management.
You help create thorough risk assessments with hazard identification, risk analysis, and mitigation measures.
Use structured risk matrices and clear evaluation criteria.`,

  sop: `You are an expert in creating Standard Operating Procedures (SOPs).
You help create clear, step-by-step procedures that ensure consistent, safe operations.
Focus on clarity, completeness, and practical applicability.`,

  erp: `You are an expert in emergency response planning.
You help create comprehensive emergency response plans including procedures, contacts, and communication protocols.
Ensure plans are actionable and cover all relevant scenarios.`,

  compliance_matrix: `You are an expert in regulatory compliance management.
You help create compliance matrices that track regulatory requirements, compliance status, and evidence documentation.
Ensure thorough coverage of all applicable regulations.`
}

// ============================================
// Context Building
// ============================================

/**
 * Build system prompt with document and project context
 */
async function buildSystemPrompt(document, project, knowledgeBaseDocs = []) {
  const typePrompt = DOCUMENT_TYPE_PROMPTS[document.type] || DOCUMENT_TYPE_PROMPTS.sop

  let systemPrompt = `${typePrompt}

## Current Document Context
Document Type: ${document.type}
Document Title: ${document.title}
Version: ${document.version}
Status: ${document.status}

## Document Sections
${document.sections.map((s, i) => `${i + 1}. ${s.title}${s.content ? ' (has content)' : ' (empty)'}`).join('\n')}

## Project Context
Client: ${project.clientName}
Project: ${project.name}
${project.description ? `Description: ${project.description}` : ''}

## Shared Context
${project.sharedContext.companyProfile ? `Company Profile: ${project.sharedContext.companyProfile}` : ''}
${project.sharedContext.operationsScope ? `Operations Scope: ${project.sharedContext.operationsScope}` : ''}
${project.sharedContext.aircraftTypes?.length ? `Aircraft Types: ${project.sharedContext.aircraftTypes.join(', ')}` : ''}
${project.sharedContext.regulations?.length ? `Applicable Regulations: ${project.sharedContext.regulations.join(', ')}` : ''}
${project.sharedContext.customContext ? `Additional Context: ${project.sharedContext.customContext}` : ''}

${document.localContext?.specificRequirements ? `## Document-Specific Requirements\n${document.localContext.specificRequirements}` : ''}
${document.localContext?.regulatoryReferences?.length ? `## Regulatory References\n${document.localContext.regulatoryReferences.join('\n')}` : ''}`

  // Add knowledge base context if available
  if (knowledgeBaseDocs.length > 0) {
    systemPrompt += `\n\n## Reference Documents from Knowledge Base
${knowledgeBaseDocs.map(doc => `### ${doc.title}\n${doc.content?.substring(0, 1000) || 'No content'}...`).join('\n\n')}`
  }

  // Add cross-reference context
  if (document.crossReferences?.length > 0) {
    systemPrompt += `\n\n## Cross-References to Other Documents
${document.crossReferences.map(ref => `- ${ref.referenceText}`).join('\n')}`
  }

  systemPrompt += `

## Instructions
- Generate professional, compliance-ready documentation
- Use clear, precise language appropriate for regulatory review
- Maintain consistency with existing document content
- Reference applicable regulations and standards where appropriate
- Format content in markdown for easy editing
- When generating section content, provide complete, well-structured text
- Ask clarifying questions if requirements are unclear`

  return systemPrompt
}

/**
 * Search knowledge base for relevant documents
 */
async function searchKnowledgeBase(query, orgId, limit = 5) {
  try {
    // Simple keyword-based search in knowledge base
    const kbRef = db.collection('knowledgeBase')
    const snapshot = await kbRef
      .where('organizationId', '==', orgId)
      .limit(20)
      .get()

    if (snapshot.empty) {
      return []
    }

    // Score documents based on keyword matching
    const queryTerms = query.toLowerCase().split(/\s+/)
    const scoredDocs = snapshot.docs.map(doc => {
      const data = doc.data()
      const text = `${data.title || ''} ${data.content || ''} ${(data.tags || []).join(' ')}`.toLowerCase()

      let score = 0
      queryTerms.forEach(term => {
        if (text.includes(term)) {
          score += 1
        }
      })

      return { id: doc.id, ...data, score }
    })

    // Return top matches
    return scoredDocs
      .filter(d => d.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  } catch (error) {
    functions.logger.error('Error searching knowledge base:', error)
    return []
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

  const { documentId, message } = data
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

    // Search knowledge base for relevant content
    const knowledgeBaseDocs = await searchKnowledgeBase(message, orgId)

    // Build system prompt
    const systemPrompt = await buildSystemPrompt(document, project, knowledgeBaseDocs)

    // Get conversation history
    const conversationHistory = await getConversationHistory(documentId)

    // Store user message
    await storeMessage(documentId, 'user', message, null, {
      knowledgeBaseDocsUsed: knowledgeBaseDocs.map(d => d.id)
    })

    // Build messages array for Claude
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
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
      knowledgeBaseDocsUsed: knowledgeBaseDocs.length
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

  const { documentId, sectionId, prompt } = data
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

    // Search knowledge base
    const knowledgeBaseDocs = await searchKnowledgeBase(`${section.title} ${prompt}`, orgId)

    // Build system prompt
    const systemPrompt = await buildSystemPrompt(document, project, knowledgeBaseDocs)

    // Build section-specific prompt
    const sectionPrompt = `Generate comprehensive content for the "${section.title}" section.

User instructions: ${prompt}

${section.content ? `Current section content to expand/improve:\n${section.content}` : 'This section is currently empty. Generate complete content.'}

Requirements:
- Generate well-structured, professional content
- Use markdown formatting (headers, lists, tables as appropriate)
- Ensure compliance with applicable regulations
- Be thorough but concise
- Include specific, actionable content where appropriate`

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
      { sectionId, knowledgeBaseDocsUsed: knowledgeBaseDocs.map(d => d.id) }
    )

    return {
      success: true,
      content: generatedContent,
      sectionId,
      tokenUsage
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

module.exports = {
  sendDocumentMessage,
  generateSectionContent,
  getOrganizationTokenUsage
}
