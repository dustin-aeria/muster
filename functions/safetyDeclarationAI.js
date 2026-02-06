/**
 * Safety Declaration AI Cloud Functions
 * Provides Claude API integration for CAR Standard 922 compliance assistance
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
  functions.logger.info('Anthropic SDK initialized for Safety Declaration AI')
} else {
  functions.logger.warn('Anthropic API key not configured for Safety Declaration AI')
}

// ============================================
// CAR Standard 922 Knowledge Base
// ============================================

const CAR_922_SYSTEM_PROMPT = `You are an expert aviation safety consultant specializing in Transport Canada's CAR Standard 922 (Safety Assurance - RPAS) compliance.

## Your Expertise
- Deep knowledge of CAR Standard 922 requirements (922.04 through 922.12)
- Understanding of AC 922-001 guidance material
- Experience with RPAS safety declarations and compliance evidence
- Familiarity with system safety assessments, reliability analysis, and testing methodologies

## CAR Standard 922 Sections
- 922.04: Controlled Airspace Operations - Position accuracy requirements
- 922.05: Operations Near People (30m lateral) - Single failure protection
- 922.06: Operations Over People (5m lateral) - Most stringent requirements
- 922.07: Safety and Reliability - Kinetic energy based reliability targets
- 922.08: Containment - Geofencing and robustness requirements
- 922.09: C2 Link Reliability - Command and control performance
- 922.10: Detect, Alert, Avoid (DAA) - Airspace integration
- 922.11: Control Station Design - Human factors requirements
- 922.12: Demonstrated Environmental Envelope - Flight test demonstration

## Kinetic Energy Categories (per 922.07)
- Low: < 700 J (10^-4 catastrophic failure probability)
- Medium: < 34,000 J (10^-5 catastrophic failure probability)
- High: < 1,084,000 J (10^-6 catastrophic failure probability)
- Very High: >= 1,084,000 J (Requires direct TC consultation)

## Reliability Targets (per flight hour)
- Catastrophic: Low KE: 10^-4, Medium KE: 10^-5, High KE: 10^-6
- Hazardous: Low KE: 10^-3, Medium KE: 10^-4, High KE: 10^-5
- Major: Low KE: 10^-2, Medium KE: 10^-3, High KE: 10^-4
- Minor: Low KE: 10^-2, Medium KE: 10^-2, High KE: 10^-3

## Communication Style
- Be clear, practical, and helpful
- Use plain language to explain technical concepts
- Provide specific examples when possible
- Reference specific 922.xx sections when relevant
- Highlight common pitfalls and best practices
- Always prioritize safety`

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
 * Check rate limit for safety declaration AI
 */
async function checkRateLimit(orgId) {
  const rateLimitRef = db.collection('rateLimits').doc(`safety_dec_ai_${orgId}`)
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
 * Verify user has access to the safety declaration
 */
async function verifyDeclarationAccess(declarationId, userId) {
  const docRef = db.collection('safetyDeclarations').doc(declarationId)
  const docSnap = await docRef.get()

  if (!docSnap.exists) {
    return { authorized: false, error: 'Declaration not found' }
  }

  const declaration = docSnap.data()
  const orgId = declaration.organizationId

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

  // Only operators, management, and admins can use declaration AI
  if (!['admin', 'management', 'operator'].includes(membership.role)) {
    return { authorized: false, error: 'Insufficient permissions' }
  }

  return { authorized: true, declaration, orgId, membership }
}

/**
 * Store AI conversation for a declaration
 */
async function storeConversationMessage(declarationId, role, content, metadata = {}) {
  const messagesRef = db.collection('safetyDeclarations').doc(declarationId)
    .collection('aiConversations')

  await messagesRef.add({
    role,
    content,
    ...metadata,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })
}

/**
 * Get conversation history for context
 */
async function getConversationHistory(declarationId, limit = 10) {
  const messagesRef = db.collection('safetyDeclarations').doc(declarationId)
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
// AI Functions
// ============================================

/**
 * Ask a question about safety declaration requirements
 * Context-aware conversation for gathering user information
 */
const askDeclarationQuestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { declarationId, question, rpasContext } = data
  const userId = context.auth.uid

  // Input validation
  if (!declarationId || typeof declarationId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid declaration ID is required')
  }

  if (!question || typeof question !== 'string' || question.length > 5000) {
    throw new functions.https.HttpsError('invalid-argument', 'Question must be under 5000 characters')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  // Verify access
  const accessResult = await verifyDeclarationAccess(declarationId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { declaration, orgId } = accessResult

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    // Build context-specific system prompt
    let systemPrompt = CAR_922_SYSTEM_PROMPT

    if (declaration.rpasDetails) {
      systemPrompt += `\n\n## Current RPAS Context
Manufacturer: ${declaration.rpasDetails.manufacturer || 'Not specified'}
Model: ${declaration.rpasDetails.model || 'Not specified'}
Weight: ${declaration.rpasDetails.weightKg ? `${declaration.rpasDetails.weightKg} kg` : 'Not specified'}
Max Velocity: ${declaration.rpasDetails.maxVelocityMs ? `${declaration.rpasDetails.maxVelocityMs} m/s` : 'Not specified'}
Kinetic Energy: ${declaration.rpasDetails.maxKineticEnergy ? `${declaration.rpasDetails.maxKineticEnergy.toFixed(0)} J` : 'Not calculated'}
Category: ${declaration.rpasDetails.category || 'Not determined'}
KE Category: ${declaration.rpasDetails.kineticEnergyCategory || 'Not determined'}`
    }

    if (declaration.operationTypes?.length > 0) {
      systemPrompt += `\n\nSelected Operation Types: ${declaration.operationTypes.join(', ')}`
    }

    if (rpasContext) {
      systemPrompt += `\n\nAdditional Context: ${escapeHtml(rpasContext)}`
    }

    // Get conversation history
    const history = await getConversationHistory(declarationId)

    // Store user question
    await storeConversationMessage(declarationId, 'user', question)

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
    await storeConversationMessage(declarationId, 'assistant', assistantMessage, {
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
    functions.logger.error('Error in askDeclarationQuestion:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while processing your question')
  }
})

/**
 * Verify a calculation (kinetic energy, reliability targets)
 */
const verifyCalculation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { declarationId, calculationType, inputs } = data
  const userId = context.auth.uid

  if (!declarationId || !calculationType || !inputs) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  // Verify access
  const accessResult = await verifyDeclarationAccess(declarationId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { orgId } = accessResult

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    let prompt = ''

    if (calculationType === 'kinetic_energy') {
      const { massKg, velocityMs, calculatedKE, keCategory } = inputs

      prompt = `Please verify this kinetic energy calculation for CAR 922.07 compliance:

Input Values:
- Mass: ${massKg} kg
- Maximum Velocity: ${velocityMs} m/s

User's Calculated Results:
- Kinetic Energy: ${calculatedKE} J
- KE Category: ${keCategory}

Please:
1. Verify the calculation (KE = 0.5 * mass * velocity^2)
2. Confirm the correct kinetic energy category based on CAR 922.07
3. Explain what reliability targets apply for this category
4. Note any concerns or recommendations

Format your response clearly with sections for each point.`
    } else if (calculationType === 'reliability') {
      const { keCategory, failureSeverity, targetProbability, userCalculation } = inputs

      prompt = `Please verify this reliability target calculation for CAR 922.07:

Input Values:
- Kinetic Energy Category: ${keCategory}
- Failure Severity: ${failureSeverity}
- Target Probability: ${targetProbability}

User's Calculation/Approach:
${userCalculation}

Please:
1. Verify the correct target probability for this KE category and severity
2. Check if the user's approach is valid
3. Explain how to demonstrate compliance with this target
4. Suggest appropriate compliance methods (test, analysis, service experience)

Format your response clearly with sections for each point.`
    } else {
      throw new functions.https.HttpsError('invalid-argument', 'Unknown calculation type')
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: CAR_922_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      success: true,
      verification: response.content[0].text,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in verifyCalculation:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred during verification')
  }
})

/**
 * Recommend compliance method for a specific requirement
 */
const recommendComplianceMethod = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { declarationId, requirementId, rpasContext } = data
  const userId = context.auth.uid

  if (!declarationId || !requirementId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  // Verify access
  const accessResult = await verifyDeclarationAccess(declarationId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { declaration, orgId } = accessResult

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    // Get the requirement details
    const reqRef = db.collection('safetyDeclarations').doc(declarationId)
      .collection('requirements').doc(requirementId)
    const reqSnap = await reqRef.get()

    if (!reqSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Requirement not found')
    }

    const requirement = reqSnap.data()

    let systemPrompt = CAR_922_SYSTEM_PROMPT

    if (declaration.rpasDetails) {
      systemPrompt += `\n\n## Current RPAS Context
Manufacturer: ${declaration.rpasDetails.manufacturer || 'Not specified'}
Model: ${declaration.rpasDetails.model || 'Not specified'}
Weight: ${declaration.rpasDetails.weightKg ? `${declaration.rpasDetails.weightKg} kg` : 'Not specified'}
KE Category: ${declaration.rpasDetails.kineticEnergyCategory || 'Not determined'}
Type: ${declaration.declarationType === 'pre_validated' ? 'Pre-Validated Declaration (PVD)' : 'Standard Declaration'}`
    }

    const prompt = `For the following CAR Standard 922 requirement, recommend the best compliance method:

Requirement: ${requirement.requirementId}
Section: ${requirement.sectionTitle}
Text: ${requirement.text}
Acceptance Criteria: ${requirement.acceptanceCriteria || 'Not specified'}
Testable: ${requirement.testable ? 'Yes' : 'No'}

${rpasContext ? `Additional Context: ${escapeHtml(rpasContext)}` : ''}

Please provide:
1. **Recommended Compliance Method**: Choose from Inspection, Analysis, Test, or Service Experience
2. **Why This Method**: Explain why this method is most appropriate
3. **How to Demonstrate Compliance**: Specific steps and activities
4. **Evidence Required**: What documentation/data is needed
5. **Common Pitfalls**: What to avoid when complying with this requirement
6. **Alternative Approaches**: Other valid methods if the primary is not feasible

Consider the RPAS type and complexity when making recommendations.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      success: true,
      recommendation: response.content[0].text,
      requirementId: requirement.requirementId,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in recommendComplianceMethod:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while generating recommendations')
  }
})

/**
 * Generate detailed guidance for a specific 922.xx requirement
 */
const generateRequirementGuidance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { declarationId, requirementId } = data
  const userId = context.auth.uid

  if (!declarationId || !requirementId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  // Verify access
  const accessResult = await verifyDeclarationAccess(declarationId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { declaration, orgId } = accessResult

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    // Get the requirement details
    const reqRef = db.collection('safetyDeclarations').doc(declarationId)
      .collection('requirements').doc(requirementId)
    const reqSnap = await reqRef.get()

    if (!reqSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Requirement not found')
    }

    const requirement = reqSnap.data()

    let systemPrompt = CAR_922_SYSTEM_PROMPT

    if (declaration.rpasDetails) {
      systemPrompt += `\n\n## Current RPAS Context
Manufacturer: ${declaration.rpasDetails.manufacturer || 'Commercial RPAS'}
Model: ${declaration.rpasDetails.model || 'Not specified'}
Weight: ${declaration.rpasDetails.weightKg ? `${declaration.rpasDetails.weightKg} kg` : 'Not specified'}
KE Category: ${declaration.rpasDetails.kineticEnergyCategory || 'Not determined'}`
    }

    const prompt = `Provide comprehensive, practical guidance for complying with this CAR Standard 922 requirement:

Requirement ID: ${requirement.requirementId}
Section: ${requirement.sectionTitle}
Requirement Text: ${requirement.text}
Acceptance Criteria: ${requirement.acceptanceCriteria || 'Not specified'}

Please structure your response with these sections:

## Plain Language Explanation
Explain what this requirement means in simple terms that a new RPAS operator could understand.

## Why This Matters
Explain the safety rationale - why Transport Canada requires this.

## How to Comply
Provide practical, step-by-step guidance on how to demonstrate compliance. Be specific about what activities and documentation are needed.

## Example Evidence
Give concrete examples of what acceptable compliance evidence looks like. Include formats, content, and quality expectations.

## Common Mistakes to Avoid
List the most common errors operators make when addressing this requirement.

## Related Standards
Mention any related standards or guidance documents (e.g., DO-178C, SAE ARP4761, etc.) that may be relevant.

## Tips for Your RPAS Type
Based on the RPAS context provided, give any specific tips or considerations.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      success: true,
      guidance: response.content[0].text,
      requirementId: requirement.requirementId,
      sectionTitle: requirement.sectionTitle,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in generateRequirementGuidance:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while generating guidance')
  }
})

/**
 * Analyze evidence for completeness and quality
 */
const analyzeEvidence = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { declarationId, requirementId, evidenceDescription, evidenceType } = data
  const userId = context.auth.uid

  if (!declarationId || !requirementId || !evidenceDescription) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  // Verify access
  const accessResult = await verifyDeclarationAccess(declarationId, userId)
  if (!accessResult.authorized) {
    throw new functions.https.HttpsError('permission-denied', accessResult.error)
  }

  const { declaration, orgId } = accessResult

  // Check rate limit
  const withinLimit = await checkRateLimit(orgId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    // Get the requirement details
    const reqRef = db.collection('safetyDeclarations').doc(declarationId)
      .collection('requirements').doc(requirementId)
    const reqSnap = await reqRef.get()

    if (!reqSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Requirement not found')
    }

    const requirement = reqSnap.data()

    const prompt = `Analyze this evidence description for CAR Standard 922 compliance:

Requirement: ${requirement.requirementId} - ${requirement.sectionTitle}
Requirement Text: ${requirement.text}
Acceptance Criteria: ${requirement.acceptanceCriteria || 'Not specified'}

Evidence Type: ${evidenceType || 'Not specified'}
Evidence Description:
${escapeHtml(evidenceDescription)}

Please analyze:

## Evidence Adequacy
Rate the evidence as: Likely Adequate, Needs Enhancement, or Insufficient
Explain your reasoning.

## Strengths
What aspects of this evidence are good?

## Gaps Identified
What is missing or unclear that should be addressed?

## Recommendations
Specific suggestions to strengthen this evidence.

## Required Enhancements
If the evidence is not adequate, what specifically needs to be added or changed?

Be constructive and specific in your feedback.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: CAR_922_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      success: true,
      analysis: response.content[0].text,
      requirementId: requirement.requirementId,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in analyzeEvidence:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while analyzing evidence')
  }
})

/**
 * Get pre-declaration guidance based on RPAS type and operations
 */
const getPreDeclarationGuidance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  const { organizationId, rpasType, manufacturer, model, isCustomBuild, operationTypes, hasExperience } = data
  const userId = context.auth.uid

  if (!organizationId) {
    throw new functions.https.HttpsError('invalid-argument', 'Organization ID is required')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  // Verify membership
  const membershipId = `${userId}_${organizationId}`
  const membershipRef = db.collection('organizationMembers').doc(membershipId)
  const membershipSnap = await membershipRef.get()

  if (!membershipSnap.exists || membershipSnap.data().status !== 'active') {
    throw new functions.https.HttpsError('permission-denied', 'User not an active member')
  }

  // Check rate limit
  const withinLimit = await checkRateLimit(organizationId)
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Please try again later.')
  }

  try {
    const prompt = `A user is starting a new CAR Standard 922 Safety Declaration. Based on their context, provide personalized guidance:

## User's Situation
- RPAS Type: ${rpasType || 'Not specified'}
- Manufacturer: ${manufacturer || 'Not specified'}
- Model: ${model || 'Not specified'}
- Custom/Modified Build: ${isCustomBuild ? 'Yes' : 'No'}
- Planned Operations: ${operationTypes?.join(', ') || 'Not specified'}
- Previous Declaration Experience: ${hasExperience ? 'Yes' : 'No, first time'}

Please provide:

## Personalized Roadmap
Based on the RPAS and operations selected, outline the key steps they will need to complete.

## Estimated Complexity
Rate the declaration complexity as: Straightforward, Moderate, or Complex
Explain why and what drives the complexity.

## Key Requirements to Focus On
Which CAR 922 sections will be most important for their specific case?

## Recommended Preparation
What should they gather or prepare before starting the declaration process?

## Common Challenges
What challenges do operators with similar setups typically face?

## Tips for Success
Practical advice to complete the declaration successfully.

Be encouraging but realistic about the effort required.`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: CAR_922_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    })

    return {
      success: true,
      guidance: response.content[0].text,
      tokenUsage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens
      }
    }
  } catch (error) {
    functions.logger.error('Error in getPreDeclarationGuidance:', error)

    if (error instanceof functions.https.HttpsError) {
      throw error
    }

    throw new functions.https.HttpsError('internal', 'An error occurred while generating guidance')
  }
})

module.exports = {
  askDeclarationQuestion,
  verifyCalculation,
  recommendComplianceMethod,
  generateRequirementGuidance,
  analyzeEvidence,
  getPreDeclarationGuidance
}
