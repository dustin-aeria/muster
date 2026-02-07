/**
 * SFOC & SORA AI Cloud Functions
 * Provides Claude API integration for:
 * - SFOC application guidance (Transport Canada CAR 903)
 * - SORA assessment assistance (JARUS SORA 2.5)
 *
 * @version 1.0.0
 */

const functions = require('firebase-functions/v1')
const admin = require('firebase-admin')
const Anthropic = require('@anthropic-ai/sdk')

const db = admin.firestore()

// ============================================
// Configuration
// ============================================

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 4096

// Rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_MESSAGES_PER_WINDOW = 150

// Initialize Anthropic client
let anthropic = null
if (ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  functions.logger.info('Anthropic SDK initialized for SFOC/SORA AI')
} else {
  functions.logger.warn('Anthropic API key not configured for SFOC/SORA AI')
}

// ============================================
// SFOC Knowledge Base (Transport Canada CAR 903)
// ============================================

const SFOC_SYSTEM_PROMPT = `You are an expert aviation consultant specializing in Transport Canada's Special Flight Operations Certificate (SFOC) requirements for RPAS (Remotely Piloted Aircraft Systems).

## Your Expertise
- Deep knowledge of Canadian Aviation Regulations Part IX (CAR 903)
- Understanding of SFOC application requirements for large RPAS (>25kg MTOW)
- Experience with Transport Canada review processes and timelines
- Familiarity with operational risk assessments and safety planning

## Key SFOC Triggers (CAR 903.01)
An SFOC is required when:
- RPAS exceeds 25 kg MTOW
- Operations in controlled airspace without prior authorization
- BVLOS operations outside exemptions
- Operations over people not covered by standard certificates
- Night operations without specific approval
- Operations requiring deviation from standard flight rules

## SFOC Application Components
1. **Concept of Operations (ConOps)** - Detailed operational description
2. **Risk Assessment** - SORA or equivalent methodology
3. **Safety Plan** - Mitigation measures and procedures
4. **Emergency Response Plan (ERP)** - Contingency procedures
5. **Pilot Qualifications** - Training and certification records
6. **Aircraft Documentation** - Specifications, maintenance, insurance

## Application Process
- Standard review: 30-60 working days
- Complex applications: May require multiple review cycles
- Pre-consultation recommended for complex operations
- Electronic submission via Transport Canada portal

## Communication Style
- Be clear, practical, and helpful
- Use plain language to explain regulatory concepts
- Provide specific examples and templates when useful
- Reference specific CAR sections when relevant
- Highlight common application mistakes to avoid
- Always prioritize safety and compliance`

// ============================================
// SORA Knowledge Base (JARUS SORA 2.5)
// ============================================

const SORA_SYSTEM_PROMPT = `You are an expert in JARUS SORA 2.5 (Specific Operational Risk Assessment) methodology for UAS/RPAS operations.

## Your Expertise
- Complete knowledge of SORA 2.5 main body and annexes
- Understanding of Ground Risk Class (GRC) determination
- Air Risk Class (ARC) assessment methodology
- SAIL (Specific Assurance and Integrity Level) derivation
- OSO (Operational Safety Objective) requirements and evidence

## SORA 2.5 Process Steps
1. **ConOps Description** - Detailed operational concept
2. **Intrinsic GRC Determination** - Based on population density and UA characteristics
3. **Final GRC** - After applying ground risk mitigations (M1, M2)
4. **Initial ARC** - Based on airspace and operational environment
5. **Residual ARC** - After tactical mitigations (VLOS, DAA)
6. **SAIL Determination** - Matrix of Final GRC × Residual ARC
7. **OSO Requirements** - Based on SAIL level
8. **Adjacent Area Assessment** - Containment requirements
9. **Comprehensive Safety Portfolio** - Evidence compilation

## Ground Risk Mitigations (Annex B)
- M1(A): Strategic - Sheltering (up to -2 reduction, max medium robustness)
- M1(B): Strategic - Operational Restrictions (-1 to -2, medium to high)
- M1(C): Tactical - Ground Observation (-1, low robustness only)
- M2: Impact Dynamics Reduction (parachute, etc.) (-1 to -2, medium to high)
- Note: M3 (ERP) removed in SORA 2.5

## UA Characteristic Categories (Table 2)
- ≤1m / ≤25 m/s: Small consumer drones
- ≤3m / ≤35 m/s: Medium commercial UAS
- ≤8m / ≤75 m/s: Large industrial UAS
- ≤20m / ≤120 m/s: Large fixed-wing UAS
- ≤40m / ≤200 m/s: Very large UAS

## Population Categories
- Controlled: No unauthorized persons
- Remote: <5 ppl/km²
- Lightly Populated: <50 ppl/km²
- Sparsely Populated: <500 ppl/km²
- Suburban: <5,000 ppl/km²
- High Density Metro: <50,000 ppl/km²
- Assembly: >50,000 ppl/km² (limited SORA applicability)

## SAIL Levels
- SAIL I: Lowest assurance - Declaration may suffice
- SAIL II: Low assurance - Standard procedures
- SAIL III: Medium assurance - Validated procedures
- SAIL IV: Medium-High - Comprehensive safety case
- SAIL V: High assurance - Extensive demonstration
- SAIL VI: Highest - Full airworthiness demonstration

## Communication Style
- Be methodical and step-by-step
- Explain the rationale behind SORA decisions
- Provide specific values and calculations when possible
- Reference specific tables and sections
- Guide users through complex assessments
- Ensure safety is the primary consideration`

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
 * Check rate limit for SFOC/SORA AI
 */
async function checkRateLimit(orgId) {
  const rateLimitRef = db.collection('rateLimits').doc(`sfoc_sora_ai_${orgId}`)
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
 * Verify user has access to the SFOC application
 */
async function verifySFOCAccess(sfocId, userId) {
  const docRef = db.collection('sfocApplications').doc(sfocId)
  const docSnap = await docRef.get()

  if (!docSnap.exists) {
    return { authorized: false, error: 'SFOC application not found' }
  }

  const sfoc = docSnap.data()
  const orgId = sfoc.organizationId

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

  if (!['admin', 'management', 'operator'].includes(membership.role)) {
    return { authorized: false, error: 'Insufficient permissions' }
  }

  return { authorized: true, sfoc, orgId, membership }
}

/**
 * Verify user has access to the SORA assessment
 */
async function verifySORAAccess(soraId, userId) {
  const docRef = db.collection('soraAssessments').doc(soraId)
  const docSnap = await docRef.get()

  if (!docSnap.exists) {
    return { authorized: false, error: 'SORA assessment not found' }
  }

  const sora = docSnap.data()
  const orgId = sora.organizationId

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

  if (!['admin', 'management', 'operator'].includes(membership.role)) {
    return { authorized: false, error: 'Insufficient permissions' }
  }

  return { authorized: true, sora, orgId, membership }
}

/**
 * Store AI conversation for SFOC
 */
async function storeSFOCConversation(sfocId, role, content, metadata = {}) {
  const messagesRef = db.collection('sfocApplications').doc(sfocId)
    .collection('aiConversations')

  await messagesRef.add({
    role,
    content,
    ...metadata,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })
}

/**
 * Store AI conversation for SORA
 */
async function storeSORAConversation(soraId, role, content, metadata = {}) {
  const messagesRef = db.collection('soraAssessments').doc(soraId)
    .collection('aiConversations')

  await messagesRef.add({
    role,
    content,
    ...metadata,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })
}

/**
 * Get conversation history
 */
async function getConversationHistory(collection, docId, limit = 10) {
  const messagesRef = db.collection(collection).doc(docId)
    .collection('aiConversations')

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

// ============================================
// SFOC AI Functions
// ============================================

/**
 * Ask a question about SFOC requirements and application process
 */
const askSFOCQuestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { sfocId, question, applicationContext } = data
  const userId = context.auth.uid

  // Input validation
  if (!sfocId || typeof sfocId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid SFOC ID is required')
  }

  if (!question || typeof question !== 'string' || question.length > 5000) {
    throw new functions.https.HttpsError('invalid-argument', 'Question must be under 5000 characters')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  // Verify access
  const accessResult = await verifySFOCAccess(sfocId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { sfoc, orgId } = accessResult

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    // Build context-specific system prompt
    let systemPrompt = SFOC_SYSTEM_PROMPT

    if (sfoc) {
      systemPrompt += `\n\n## Current SFOC Application Context
Application Name: ${sfoc.name || 'Unnamed'}
Status: ${sfoc.status || 'Draft'}
Complexity Level: ${sfoc.complexityLevel || 'Not determined'}
Aircraft: ${sfoc.aircraftType || 'Not specified'}
MTOW: ${sfoc.mtow ? `${sfoc.mtow} kg` : 'Not specified'}
Operation Type: ${sfoc.operationType || 'Not specified'}
Location: ${sfoc.location || 'Not specified'}`
    }

    if (applicationContext) {
      systemPrompt += `\n\nAdditional Context: ${escapeHtml(applicationContext)}`
    }

    // Get conversation history
    const history = await getConversationHistory('sfocApplications', sfocId)

    // Store user question
    await storeSFOCConversation(sfocId, 'user', question)

    // Build messages
    const messages = [
      ...history,
      { role: 'user', content: question }
    ]

    // Call Claude API
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: messages
    })

    const assistantMessage = response.content[0].text

    // Store assistant response
    await storeSFOCConversation(sfocId, 'assistant', assistantMessage, {
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    })

    return {
      success: true,
      message: assistantMessage,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in askSFOCQuestion:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while processing your question')
  }
})

/**
 * Get document checklist guidance for SFOC application
 */
const getSFOCDocumentGuidance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { sfocId, documentType } = data
  const userId = context.auth.uid

  if (!sfocId || !documentType) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  // Verify access
  const accessResult = await verifySFOCAccess(sfocId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { sfoc, orgId } = accessResult

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    const documentTypes = {
      conops: 'Concept of Operations (ConOps)',
      safety_plan: 'Safety Plan',
      erp: 'Emergency Response Plan (ERP)',
      risk_assessment: 'Risk Assessment / SORA Report',
      pilot_quals: 'Pilot Qualifications',
      aircraft_docs: 'Aircraft Documentation',
      insurance: 'Insurance Documentation',
      maintenance: 'Maintenance Records'
    }

    const docName = documentTypes[documentType] || documentType

    let systemPrompt = SFOC_SYSTEM_PROMPT

    if (sfoc) {
      systemPrompt += `\n\n## Application Context
Application: ${sfoc.name || 'Unnamed'}
Operation Type: ${sfoc.operationType || 'Not specified'}
Aircraft: ${sfoc.aircraftType || 'Not specified'}
MTOW: ${sfoc.mtow ? `${sfoc.mtow} kg` : 'Not specified'}
Location: ${sfoc.location || 'Not specified'}`
    }

    const prompt = `Provide comprehensive guidance for preparing the "${docName}" document for this SFOC application.

Please include:

## Document Purpose
Explain what this document demonstrates to Transport Canada and why it's required.

## Required Content
List all the sections and information that must be included. Be specific about what Transport Canada reviewers look for.

## Best Practices
Provide tips for creating a strong, complete document that will pass review.

## Common Deficiencies
List the most common reasons this type of document gets sent back for revision.

## Template Structure
Suggest an outline/structure that meets TC requirements.

## Evidence to Include
What supporting documentation or evidence should accompany this document?

Tailor your guidance to the specific operation type and aircraft if known.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      success: true,
      documentType: documentType,
      documentName: docName,
      guidance: response.content[0].text,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in getSFOCDocumentGuidance:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while generating guidance')
  }
})

// ============================================
// SORA AI Functions
// ============================================

/**
 * Ask a question about SORA assessment
 */
const askSORAQuestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { soraId, question, assessmentContext } = data
  const userId = context.auth.uid

  if (!soraId || typeof soraId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid SORA ID is required')
  }

  if (!question || typeof question !== 'string' || question.length > 5000) {
    throw new functions.https.HttpsError('invalid-argument', 'Question must be under 5000 characters')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  // Verify access
  const accessResult = await verifySORAAccess(soraId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { sora, orgId } = accessResult

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    let systemPrompt = SORA_SYSTEM_PROMPT

    if (sora) {
      systemPrompt += `\n\n## Current SORA Assessment Context
Assessment Name: ${sora.name || 'Unnamed'}
Status: ${sora.status || 'Draft'}
Current Step: ${sora.currentStep || 'Not started'}

UA Characteristics: ${sora.uaCharacteristics || 'Not specified'}
Population Category: ${sora.populationCategory || 'Not specified'}
Intrinsic GRC: ${sora.intrinsicGRC || 'Not calculated'}
Final GRC: ${sora.finalGRC || 'Not calculated'}
Initial ARC: ${sora.initialARC || 'Not determined'}
Residual ARC: ${sora.residualARC || 'Not determined'}
SAIL: ${sora.sail || 'Not determined'}`
    }

    if (assessmentContext) {
      systemPrompt += `\n\nAdditional Context: ${escapeHtml(assessmentContext)}`
    }

    // Get conversation history
    const history = await getConversationHistory('soraAssessments', soraId)

    // Store user question
    await storeSORAConversation(soraId, 'user', question)

    const messages = [
      ...history,
      { role: 'user', content: question }
    ]

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: messages
    })

    const assistantMessage = response.content[0].text

    await storeSORAConversation(soraId, 'assistant', assistantMessage, {
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    })

    return {
      success: true,
      message: assistantMessage,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in askSORAQuestion:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while processing your question')
  }
})

/**
 * Get step-by-step guidance for current SORA step
 */
const getSORAStepGuidance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { soraId, step } = data
  const userId = context.auth.uid

  if (!soraId || !step) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  const accessResult = await verifySORAAccess(soraId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { sora, orgId } = accessResult

  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    const stepDescriptions = {
      conops: 'ConOps (Concept of Operations) Description',
      grc: 'Ground Risk Class (GRC) Determination',
      arc: 'Air Risk Class (ARC) Assessment',
      sail: 'SAIL (Specific Assurance and Integrity Level) Determination',
      oso: 'OSO (Operational Safety Objectives) Requirements',
      containment: 'Adjacent Area and Containment Assessment',
      portfolio: 'Safety Portfolio Compilation'
    }

    const stepName = stepDescriptions[step] || step

    let systemPrompt = SORA_SYSTEM_PROMPT

    if (sora) {
      systemPrompt += `\n\n## Current Assessment State
Assessment: ${sora.name || 'Unnamed'}
UA Characteristics: ${sora.uaCharacteristics || 'Not specified'}
Population Category: ${sora.populationCategory || 'Not specified'}
Intrinsic GRC: ${sora.intrinsicGRC || 'Not calculated'}
Final GRC: ${sora.finalGRC || 'Not calculated'}
Applied Mitigations: ${JSON.stringify(sora.groundMitigations || {})}
Initial ARC: ${sora.initialARC || 'Not determined'}
Residual ARC: ${sora.residualARC || 'Not determined'}
SAIL: ${sora.sail || 'Not determined'}`
    }

    const prompt = `Provide detailed guidance for completing the "${stepName}" step of this SORA assessment.

## Step Overview
Explain what this step accomplishes and its importance in the overall SORA process.

## Required Inputs
What information is needed to complete this step? Reference the current assessment state.

## Step-by-Step Instructions
Walk through exactly how to complete this step, including:
- What decisions need to be made
- What calculations are involved
- What tables or matrices to reference

## Common Mistakes
What errors do people typically make at this step?

## Evidence Requirements
What documentation or evidence should be prepared at this step?

## Next Steps
After completing this step, what comes next?

Base your guidance on the current assessment state and JARUS SORA 2.5 requirements.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      success: true,
      step: step,
      stepName: stepName,
      guidance: response.content[0].text,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in getSORAStepGuidance:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while generating guidance')
  }
})

/**
 * Recommend mitigations based on current GRC/ARC
 */
const recommendMitigations = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { soraId, targetGRC, targetARC } = data
  const userId = context.auth.uid

  if (!soraId) {
    throw new functions.https.HttpsError('invalid-argument', 'SORA ID is required')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  const accessResult = await verifySORAAccess(soraId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { sora, orgId } = accessResult

  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    let systemPrompt = SORA_SYSTEM_PROMPT

    systemPrompt += `\n\n## Current Assessment State
Intrinsic GRC: ${sora.intrinsicGRC || 'Not calculated'}
Current Final GRC: ${sora.finalGRC || sora.intrinsicGRC || 'Not calculated'}
Initial ARC: ${sora.initialARC || 'Not determined'}
Current Residual ARC: ${sora.residualARC || sora.initialARC || 'Not determined'}
Current SAIL: ${sora.sail || 'Not determined'}
Currently Applied Mitigations: ${JSON.stringify(sora.groundMitigations || {})}
Operation Type: ${sora.operationType || 'Not specified'}
Population Category: ${sora.populationCategory || 'Not specified'}`

    const prompt = `Based on the current SORA assessment state, recommend mitigations to achieve:
${targetGRC ? `- Target Final GRC: ${targetGRC}` : ''}
${targetARC ? `- Target Residual ARC: ${targetARC}` : ''}
${!targetGRC && !targetARC ? '- Optimize the SAIL level for this operation' : ''}

## Recommended Ground Risk Mitigations

For each applicable mitigation (M1A, M1B, M1C, M2), explain:
1. **Applicability**: Is this mitigation suitable for this operation?
2. **Robustness Level**: What level (low/medium/high) is achievable?
3. **GRC Reduction**: How many levels of reduction does this provide?
4. **Evidence Required**: What must be demonstrated?
5. **Implementation**: Practical steps to implement

## Recommended Air Risk Mitigations (TMPR)

Recommend tactical mitigations (VLOS, EVLOS, DAA) with:
1. **ARC Reduction**: Expected reduction
2. **Requirements**: What's needed to claim this mitigation
3. **Practical Considerations**: Feasibility assessment

## Combined Effect

Show the expected:
- Final GRC after ground mitigations
- Residual ARC after air mitigations
- Resulting SAIL level

## Trade-offs

Discuss any trade-offs between different mitigation strategies.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      success: true,
      recommendations: response.content[0].text,
      currentState: {
        intrinsicGRC: sora.intrinsicGRC,
        finalGRC: sora.finalGRC,
        initialARC: sora.initialARC,
        residualARC: sora.residualARC,
        sail: sora.sail
      },
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in recommendMitigations:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while generating recommendations')
  }
})

/**
 * Get OSO compliance guidance for specific OSO
 */
const getOSOGuidance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { soraId, osoId, requiredRobustness } = data
  const userId = context.auth.uid

  if (!soraId || !osoId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  const accessResult = await verifySORAAccess(soraId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { sora, orgId } = accessResult

  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    let systemPrompt = SORA_SYSTEM_PROMPT

    systemPrompt += `\n\n## Assessment Context
SAIL Level: ${sora.sail || 'Not determined'}
Operation Type: ${sora.operationType || 'Not specified'}`

    const prompt = `Provide comprehensive guidance for achieving compliance with ${osoId} at ${requiredRobustness || 'the required'} robustness level.

## OSO Overview
Explain what this OSO requires and why it exists in the SORA framework.

## Robustness Requirements
Explain what "low", "medium", and "high" robustness means for this specific OSO.

## Evidence Requirements by Robustness Level

### Low Robustness
- What evidence is sufficient?
- Examples of acceptable documentation

### Medium Robustness
- Additional requirements beyond low
- Verification/validation needs

### High Robustness
- Full requirements for highest level
- Third-party involvement if needed

## Practical Compliance Steps
Step-by-step guide to achieving compliance.

## Common Evidence Examples
Specific examples of evidence that satisfies this OSO.

## Common Deficiencies
What typically causes OSO compliance to be rejected?

## Tips for ${sora.operationType || 'your'} Operations
Specific advice based on the operation type.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      success: true,
      osoId: osoId,
      requiredRobustness: requiredRobustness,
      guidance: response.content[0].text,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in getOSOGuidance:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while generating OSO guidance')
  }
})

/**
 * Analyze ConOps for completeness
 */
const analyzeConOps = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { soraId, conopsText } = data
  const userId = context.auth.uid

  if (!soraId || !conopsText) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters')
  }

  if (conopsText.length > 50000) {
    throw new functions.https.HttpsError('invalid-argument', 'ConOps text too long (max 50000 characters)')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  const accessResult = await verifySORAAccess(soraId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { orgId } = accessResult

  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    const prompt = `Analyze this Concept of Operations (ConOps) for SORA compliance completeness:

---
${escapeHtml(conopsText)}
---

Evaluate against JARUS SORA 2.5 Annex A ConOps Template requirements.

## Overall Assessment
Rate as: Complete, Mostly Complete, Needs Work, or Incomplete

## Section-by-Section Analysis

For each required ConOps section, indicate:
- ✅ Present and adequate
- ⚠️ Present but needs improvement
- ❌ Missing or inadequate

Required sections per Annex A:
1. UAS Description
2. Operational Environment
3. Operational Procedures
4. Ground Risk Characterization
5. Air Risk Characterization
6. Emergency Procedures
7. Crew Competency
8. Technical Containment

## Critical Gaps
List the most important missing or deficient elements.

## Specific Recommendations
Actionable suggestions to improve the ConOps.

## Strengths
What is done well in this ConOps?

Be specific and reference exact sections of the provided text.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SORA_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      success: true,
      analysis: response.content[0].text,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in analyzeConOps:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while analyzing the ConOps')
  }
})

module.exports = {
  // SFOC Functions
  askSFOCQuestion,
  getSFOCDocumentGuidance,
  // SORA Functions
  askSORAQuestion,
  getSORAStepGuidance,
  recommendMitigations,
  getOSOGuidance,
  analyzeConOps
}
