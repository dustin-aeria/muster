/**
 * Gamification Cloud Functions
 * AI-powered content generation for Safety Quests, Scenarios, and Readiness
 */

const functions = require('firebase-functions/v1')
const Anthropic = require('@anthropic-ai/sdk')
const admin = require('firebase-admin')

// Initialize Anthropic client
let anthropic = null

function getAnthropicClient() {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }
    anthropic = new Anthropic({ apiKey })
    console.log('Anthropic SDK initialized for Gamification')
  }
  return anthropic
}

// ============================================
// QUIZ GENERATION
// ============================================

/**
 * Generate quiz questions from source content
 */
const generateQuizQuestions = functions
  .runWith({
    timeoutSeconds: 120,
    memory: '512MB',
    secrets: ['ANTHROPIC_API_KEY']
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const {
      sourceChunks,
      regulatoryContext,
      questionCount = 5,
      difficultyLevel = 'intermediate',
      topicFocus = null,
      existingQuestionIds = []
    } = data

    try {
      const client = getAnthropicClient()

      const prompt = `You are a safety training content developer for a Canadian RPAS (drone) and remote sensing operations company. Generate quiz questions based on the provided source content.

CONTEXT:
- Industry: RPAS operations, field surveys, marine operations in British Columbia, Canada
- Audience: Field operators, pilots, crew members
- Purpose: Safety training with COR/SECOR audit compliance

SOURCE CONTENT:
${sourceChunks.map(chunk => chunk.text).join('\n\n')}

REGULATORY REFERENCES:
${regulatoryContext || 'Transport Canada CARs Part IX, WorkSafeBC OHS Regulations'}

${topicFocus ? `TOPIC FOCUS: ${topicFocus}` : ''}

Generate ${questionCount} quiz questions following these rules:

1. QUESTION TYPES (vary between these):
   - multiple_choice: 4 options, 1 correct
   - scenario: Present situation, ask best action
   - true_false: Statement with explanation
   - ordering: Sequence of steps (use for procedures)

2. DIFFICULTY LEVEL: ${difficultyLevel}
   - beginner: Direct recall, basic concepts
   - intermediate: Application, "what would you do"
   - advanced: Complex scenarios, edge cases, regulation interpretation

3. REQUIREMENTS:
   - Each question must be traceable to the source content
   - Include regulatory reference where applicable
   - Explanations must cite specific procedures or regulations
   - Wrong answer explanations should be educational, not punishing
   - Use realistic BC/Canadian operational context

4. OUTPUT FORMAT (JSON array):
Return ONLY valid JSON, no markdown or other formatting:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Your question text here",
      "options": [
        {"id": "a", "text": "Option A", "isCorrect": false, "explanation": "Why this is wrong"},
        {"id": "b", "text": "Option B", "isCorrect": true, "explanation": "Why this is correct"},
        {"id": "c", "text": "Option C", "isCorrect": false, "explanation": "Why this is wrong"},
        {"id": "d", "text": "Option D", "isCorrect": false, "explanation": "Why this is wrong"}
      ],
      "regulatoryReference": "CARs 901.XX or WorkSafeBC Part X.XX",
      "difficultyLevel": 1-5
    }
  ]
}

Generate questions that test understanding, not just memorization. Field operators should finish feeling more competent.`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })

      const responseText = response.content[0].text

      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to parse quiz questions from AI response')
      }

      const result = JSON.parse(jsonMatch[0])

      return {
        success: true,
        questions: result.questions,
        model: 'claude-haiku-4-5-20251001',
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens
      }
    } catch (error) {
      console.error('Error generating quiz questions:', error)
      throw new functions.https.HttpsError('internal', error.message)
    }
  })

/**
 * Generate explanation for wrong answer
 */
const generateWrongAnswerExplanation = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
    secrets: ['ANTHROPIC_API_KEY']
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { question, userAnswer, correctAnswer, regulatoryReference } = data

    try {
      const client = getAnthropicClient()

      const prompt = `A safety trainee answered a question incorrectly. Provide a helpful, educational explanation.

QUESTION: ${question}
USER'S ANSWER: ${userAnswer}
CORRECT ANSWER: ${correctAnswer}
${regulatoryReference ? `REGULATORY REFERENCE: ${regulatoryReference}` : ''}

Provide a brief (2-3 sentence) explanation that:
1. Acknowledges what they might have been thinking
2. Explains why the correct answer is right
3. References the specific regulation or procedure if applicable
4. Ends on an encouraging note

Be educational, not condescending. Return only the explanation text.`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [
          { role: 'user', content: prompt }
        ]
      })

      return {
        success: true,
        explanation: response.content[0].text.trim()
      }
    } catch (error) {
      console.error('Error generating explanation:', error)
      throw new functions.https.HttpsError('internal', error.message)
    }
  })

// ============================================
// SCENARIO GENERATION
// ============================================

/**
 * Generate interactive scenario
 */
const generateScenario = functions
  .runWith({
    timeoutSeconds: 180,
    memory: '1GB',
    secrets: ['ANTHROPIC_API_KEY']
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const {
      category,
      difficultyTier,
      topicFocus,
      operationalContext,
      procedureChunks,
      regulatoryChunks
    } = data

    try {
      const client = getAnthropicClient()

      const prompt = `You are creating an interactive safety training scenario for RPAS/drone field operations in British Columbia, Canada.

SCENARIO PARAMETERS:
- Category: ${category} (RPAS_flight / marine_survey / field_logistics / emergency)
- Difficulty: ${difficultyTier} (green=routine / yellow=degraded / red=emergency)
- Focus Topics: ${topicFocus || 'General operations'}

OPERATIONAL CONTEXT:
${operationalContext || 'Standard field survey operation'}

PROCEDURE REFERENCES:
${procedureChunks?.map(c => c.text).join('\n') || 'Standard operating procedures'}

REGULATORY CONTEXT:
${regulatoryChunks?.map(c => c.text).join('\n') || 'Transport Canada CARs Part IX, WorkSafeBC regulations'}

Create a branching scenario following this structure:

1. INITIAL SETUP:
   - Realistic operational context (weather, terrain, crew, equipment, client)
   - Time pressure or constraints that feel authentic
   - No obvious "right answer" telegraphing

2. DECISION POINTS (3-5 minimum):
   - Each decision should have 2-4 options
   - Options should include: optimal, acceptable, risky, wrong
   - Consequences should be realistic and proportional
   - Include pressure from client/time/crew where appropriate

3. BRANCH STRUCTURE:
   - Multiple paths to success (different styles can work)
   - Clear failure paths with educational outcomes
   - At least one "trap" that seems right but isn't

Return ONLY valid JSON:
{
  "title": "Scenario title",
  "description": "Brief description",
  "category": "${category}",
  "difficultyTier": "${difficultyTier}",
  "contextData": {
    "weather": {"conditions": "...", "visibility": "...", "wind": "..."},
    "terrain": "...",
    "equipment": {"aircraft": "...", "status": "...", "batteries": "..."},
    "crewComposition": ["Pilot", "VO"],
    "clientExpectations": "...",
    "timePressure": "..."
  },
  "nodes": [
    {
      "id": "node_1",
      "type": "narrative",
      "content": "Opening narrative...",
      "decisions": [
        {
          "id": "d1a",
          "text": "Option text",
          "nextNodeId": "node_2",
          "scoreImpact": 10,
          "isOptimal": true,
          "rationale": "Why this is the best choice"
        }
      ]
    },
    {
      "id": "node_2",
      "type": "consequence",
      "content": "What happens next...",
      "decisions": [...]
    },
    {
      "id": "node_end_success",
      "type": "ending",
      "content": "Success ending narrative",
      "isEnding": true,
      "endingType": "success"
    }
  ],
  "optimalPath": ["node_1", "node_3", "node_end_success"],
  "maxScore": 100,
  "estimatedMinutes": 15,
  "procedureReferences": ["SOP-RPAS-001"],
  "regulatoryReferences": ["CARs 901.24"]
}

Make it feel real. Field operators should recognize the situations from their actual work.`

      const response = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })

      const responseText = response.content[0].text

      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to parse scenario from AI response')
      }

      const scenario = JSON.parse(jsonMatch[0])

      return {
        success: true,
        scenario,
        model: 'claude-sonnet-4-5-20250929',
        tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens
      }
    } catch (error) {
      console.error('Error generating scenario:', error)
      throw new functions.https.HttpsError('internal', error.message)
    }
  })

/**
 * Generate scenario debrief
 */
const generateScenarioDebrief = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB',
    secrets: ['ANTHROPIC_API_KEY']
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { scenario, pathTaken, decisionsAnalysis, userScore, maxScore } = data

    try {
      const client = getAnthropicClient()

      const prompt = `Generate a detailed debrief for a safety training scenario the user just completed.

SCENARIO: ${scenario.title}
CATEGORY: ${scenario.category}
DIFFICULTY: ${scenario.difficultyTier}

USER'S PATH AND DECISIONS:
${decisionsAnalysis.map((d, i) => `${i + 1}. Node ${d.nodeId}: ${d.wasOptimal ? 'Optimal choice' : 'Suboptimal choice'}`).join('\n')}

SCORE: ${userScore}/${maxScore} (${Math.round((userScore / maxScore) * 100)}%)

PROCEDURE REFERENCES: ${scenario.procedureReferences?.join(', ') || 'Standard procedures'}
REGULATORY REFERENCES: ${scenario.regulatoryReferences?.join(', ') || 'Applicable regulations'}

Generate a debrief that:
1. Summarizes overall performance
2. Analyzes each key decision point
3. Explains optimal choices with procedure/regulation references
4. Provides practical field advice
5. Ends with constructive encouragement

Return ONLY valid JSON:
{
  "overallSummary": "Your overall performance summary...",
  "decisionAnalysis": [
    {
      "decision": "Description of the decision point",
      "userChoice": "What they chose",
      "wasOptimal": true/false,
      "explanation": "Why this was/wasn't the best choice",
      "reference": "Procedure or regulation reference"
    }
  ],
  "keyTakeaway": "The main lesson from this scenario",
  "practicalAdvice": "Field-applicable advice",
  "encouragement": "Constructive closing message"
}`

      const response = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })

      const responseText = response.content[0].text

      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to parse debrief from AI response')
      }

      const debrief = JSON.parse(jsonMatch[0])

      return {
        success: true,
        debrief,
        model: 'claude-sonnet-4-5-20250929'
      }
    } catch (error) {
      console.error('Error generating debrief:', error)
      throw new functions.https.HttpsError('internal', error.message)
    }
  })

// ============================================
// READINESS NUDGES
// ============================================

/**
 * Generate readiness nudge based on check-in data
 */
const generateReadinessNudge = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
    secrets: ['ANTHROPIC_API_KEY']
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const {
      overallScore,
      categoryScores,
      factorResponses,
      timeOfDay,
      dayOfWeek,
      scheduledOperations,
      recentTrends
    } = data

    try {
      const client = getAnthropicClient()

      const prompt = `You are a supportive safety companion for a field operator doing their daily readiness check-in.

USER'S CURRENT STATE:
- Overall Readiness Score: ${overallScore}/100
- Physical Score: ${categoryScores?.physical || 'N/A'}/100
- Mental Score: ${categoryScores?.mental || 'N/A'}/100
- Fatigue Score: ${categoryScores?.fatigue || 'N/A'}/100
- Substance Status Score: ${categoryScores?.substance || 'N/A'}/100
- Environment Score: ${categoryScores?.environment || 'N/A'}/100

CONTEXT:
- Time of day: ${timeOfDay || 'Morning'}
- Day of week: ${dayOfWeek || 'Weekday'}
- Upcoming operations: ${scheduledOperations || 'None scheduled'}
- Recent trends: ${recentTrends || 'No data'}

TONE REQUIREMENTS:
- Supportive, not preachy
- Practical, not corporate
- Brief (2-3 sentences max for main message)
- Field-relevant (these are outdoor professionals)

Generate a personalized response:
1. ACKNOWLEDGMENT (required): Recognize their state without judgment
2. CONTEXTUAL TIP (if score < 80): One practical, actionable tip
3. SCHEDULING NOTE (if score < 60 and operation scheduled): Gentle suggestion
4. POSITIVE REINFORCEMENT (if score >= 80): Quick motivational note

Return ONLY valid JSON:
{
  "mainMessage": "Your supportive message here",
  "tip": "Practical tip or null",
  "schedulingNote": "Scheduling consideration or null",
  "category": "encouragement" | "gentle_concern" | "check_in_suggested"
}

Remember: This is voluntary, personal data. The operator trusts us with their wellness. Respect that.`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [
          { role: 'user', content: prompt }
        ]
      })

      const responseText = response.content[0].text

      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        // Return fallback
        return {
          success: true,
          mainMessage: overallScore >= 80
            ? "You're ready to go! Stay focused and have a safe day."
            : "Take care of yourself today. You've got this.",
          tip: null,
          schedulingNote: null,
          category: overallScore >= 80 ? 'encouragement' : 'gentle_concern'
        }
      }

      const nudge = JSON.parse(jsonMatch[0])

      return {
        success: true,
        ...nudge
      }
    } catch (error) {
      console.error('Error generating readiness nudge:', error)
      // Return fallback instead of throwing
      return {
        success: true,
        mainMessage: "Thanks for checking in. Have a safe day!",
        tip: null,
        schedulingNote: null,
        category: 'encouragement'
      }
    }
  })

/**
 * Generate trend insight from readiness history
 */
const generateTrendInsight = functions
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
    secrets: ['ANTHROPIC_API_KEY']
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { readinessHistory, period = 30 } = data

    if (!readinessHistory || readinessHistory.length < 7) {
      return {
        success: true,
        insight: null,
        reason: 'Not enough data for trend analysis'
      }
    }

    try {
      const client = getAnthropicClient()

      // Prepare trend data
      const trendSummary = readinessHistory.map(h => ({
        date: h.date,
        score: h.overallScore,
        dayOfWeek: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' })
      }))

      const prompt = `Analyze this readiness check-in data and provide ONE brief, actionable insight.

DATA (last ${period} days):
${trendSummary.map(t => `${t.dayOfWeek} ${t.date}: ${t.score}/100`).join('\n')}

Look for patterns like:
- Day-of-week patterns (e.g., lower scores on Mondays)
- Declining trends
- Improvement trends
- Consistently low categories

Return ONLY valid JSON:
{
  "pattern": "Brief description of the pattern found",
  "insight": "One sentence insight",
  "suggestion": "One actionable suggestion"
}`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [
          { role: 'user', content: prompt }
        ]
      })

      const responseText = response.content[0].text

      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return { success: true, insight: null }
      }

      const insight = JSON.parse(jsonMatch[0])

      return {
        success: true,
        insight
      }
    } catch (error) {
      console.error('Error generating trend insight:', error)
      return { success: true, insight: null }
    }
  })

// ============================================
// CONTENT PROCESSING
// ============================================

/**
 * Chunk document content for AI processing
 */
const chunkDocumentContent = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB'
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const { documentId, documentType, fullText, metadata } = data

    try {
      // Target ~750 tokens per chunk (~3000 chars)
      const TARGET_CHUNK_SIZE = 3000
      const OVERLAP = 200

      const chunks = []
      let position = 0
      let chunkIndex = 0

      while (position < fullText.length) {
        let endPosition = position + TARGET_CHUNK_SIZE

        // Try to break at paragraph or sentence boundary
        if (endPosition < fullText.length) {
          // Look for paragraph break first
          const paragraphBreak = fullText.lastIndexOf('\n\n', endPosition)
          if (paragraphBreak > position + TARGET_CHUNK_SIZE / 2) {
            endPosition = paragraphBreak
          } else {
            // Look for sentence break
            const sentenceBreak = fullText.lastIndexOf('. ', endPosition)
            if (sentenceBreak > position + TARGET_CHUNK_SIZE / 2) {
              endPosition = sentenceBreak + 1
            }
          }
        }

        const chunkText = fullText.slice(position, endPosition).trim()

        if (chunkText.length > 0) {
          chunks.push({
            chunkIndex,
            text: chunkText,
            sourceId: documentId,
            metadata: {
              ...metadata,
              position,
              length: chunkText.length
            }
          })
          chunkIndex++
        }

        position = endPosition - OVERLAP
        if (position < 0) position = 0
        if (endPosition >= fullText.length) break
      }

      return {
        success: true,
        chunks,
        totalChunks: chunks.length
      }
    } catch (error) {
      console.error('Error chunking document:', error)
      throw new functions.https.HttpsError('internal', error.message)
    }
  })

/**
 * Generate lesson content from source chunks
 */
const generateLessonContent = functions
  .runWith({
    timeoutSeconds: 120,
    memory: '512MB',
    secrets: ['ANTHROPIC_API_KEY']
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const {
      sourceChunks,
      lessonTitle,
      lessonType = 'text',
      targetDuration = 3,
      difficultyLevel = 'intermediate'
    } = data

    try {
      const client = getAnthropicClient()

      const prompt = `Create engaging safety training lesson content for RPAS/field operations professionals.

LESSON TITLE: ${lessonTitle}
TYPE: ${lessonType} (text / card / interactive)
TARGET DURATION: ${targetDuration} minutes
DIFFICULTY: ${difficultyLevel}

SOURCE CONTENT:
${sourceChunks.map(c => c.text).join('\n\n')}

Create lesson content that:
1. Is engaging and practical
2. Uses clear, field-relevant language
3. Includes real-world examples
4. References specific procedures/regulations
5. Can be completed in ~${targetDuration} minutes

Return ONLY valid JSON:
{
  "title": "${lessonTitle}",
  "content": {
    "introduction": "Brief intro paragraph",
    "sections": [
      {
        "heading": "Section heading",
        "content": "Section content in markdown",
        "keyPoint": "One key takeaway"
      }
    ],
    "summary": "Brief summary",
    "references": ["Procedure or regulation references"]
  },
  "estimatedSeconds": ${targetDuration * 60}
}`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })

      const responseText = response.content[0].text

      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to parse lesson content from AI response')
      }

      const lesson = JSON.parse(jsonMatch[0])

      return {
        success: true,
        lesson,
        model: 'claude-haiku-4-5-20251001'
      }
    } catch (error) {
      console.error('Error generating lesson content:', error)
      throw new functions.https.HttpsError('internal', error.message)
    }
  })

/**
 * Get adaptive difficulty recommendation
 */
const getAdaptiveDifficulty = functions
  .runWith({
    timeoutSeconds: 15,
    memory: '256MB'
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
    }

    const {
      recentAccuracy,
      topicProficiency,
      avgTimePerQuestion,
      currentStreak,
      questionsToday,
      currentDifficulty = 2,
      currentTopic
    } = data

    // Simple rule-based adaptive difficulty (no AI needed)
    let recommendedDifficulty = currentDifficulty
    let rationale = ''
    let topicAdjustment = 'stay'

    if (recentAccuracy >= 90 && questionsToday >= 5) {
      recommendedDifficulty = Math.min(5, currentDifficulty + 1)
      rationale = 'Great accuracy! Increasing difficulty to keep you challenged.'
    } else if (recentAccuracy < 60 && questionsToday >= 3) {
      recommendedDifficulty = Math.max(1, currentDifficulty - 1)
      rationale = 'Adjusting difficulty to help reinforce fundamentals.'
      topicAdjustment = 'review_basics'
    } else if (recentAccuracy >= 80) {
      rationale = 'Maintaining current difficulty. Good progress!'
    } else {
      rationale = 'Keep practicing. You\'re building knowledge!'
    }

    // Adjust for time per question
    if (avgTimePerQuestion > 60 && recentAccuracy < 70) {
      topicAdjustment = 'review_basics'
      rationale += ' Consider reviewing the source material.'
    }

    return {
      success: true,
      recommendedDifficulty,
      rationale,
      topicAdjustment
    }
  })

// Export all functions
module.exports = {
  generateQuizQuestions,
  generateWrongAnswerExplanation,
  generateScenario,
  generateScenarioDebrief,
  generateReadinessNudge,
  generateTrendInsight,
  chunkDocumentContent,
  generateLessonContent,
  getAdaptiveDifficulty
}
