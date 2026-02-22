/**
 * Training Content AI Functions
 *
 * Claude-powered functions for enhancing training content,
 * generating quizzes, scenarios, and flashcards.
 *
 * @version 1.0.0
 */

const functions = require('firebase-functions/v1')
const admin = require('firebase-admin')
const Anthropic = require('@anthropic-ai/sdk')

// Initialize Anthropic client
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
let anthropic = null
if (ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
}

const db = admin.firestore()

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS_PER_WINDOW = 50 // Training content generation limit

/**
 * Check rate limit for content generation
 */
async function checkRateLimit(userId, action) {
  const rateLimitRef = db.collection('rateLimits').doc(`${action}_${userId}`)
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
 * Enhance lesson content with engagement elements
 * Adds real-world examples, analogies, and interactive elements
 */
exports.enhanceLessonContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  const { rawContent, lessonTitle, category, targetAudience = 'RPAS operators' } = data

  if (!rawContent || typeof rawContent !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid lesson content is required')
  }

  const withinLimit = await checkRateLimit(context.auth.uid, 'enhance_content')
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.')
  }

  const systemPrompt = `You are an expert instructional designer specializing in aviation and RPAS (drone) training.
Your task is to enhance raw training content to make it more engaging and effective for adult learners.

Guidelines:
- Maintain technical accuracy - this is safety-critical aviation training
- Add real-world examples and analogies where appropriate
- Break complex concepts into digestible chunks
- Include practical application scenarios
- Add memory hooks and mnemonics where helpful
- Reference relevant regulations (CARs, SORA) when appropriate
- Keep the professional tone but make it conversational
- Include "Key Takeaway" boxes for critical points
- Add "Think About It" prompts for reflection

Target audience: ${targetAudience}
Category: ${category || 'General Training'}

Return the enhanced content in clean HTML format suitable for a learning management system.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please enhance this lesson content for "${lessonTitle}":\n\n${rawContent}`
        }
      ]
    })

    const enhancedContent = response.content?.[0]?.text || rawContent

    functions.logger.info('Lesson content enhanced', {
      userId: context.auth.uid,
      lessonTitle,
      originalLength: rawContent.length,
      enhancedLength: enhancedContent.length
    })

    return {
      success: true,
      content: enhancedContent,
      metadata: {
        model: 'claude-sonnet-4-20250514',
        enhancedAt: new Date().toISOString()
      }
    }

  } catch (error) {
    functions.logger.error('Content enhancement failed:', error)
    throw new functions.https.HttpsError('internal', 'Failed to enhance content')
  }
})

/**
 * Generate quiz questions from lesson content
 * Creates multiple choice, true/false, and short answer questions
 */
exports.generateQuizFromContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  const {
    lessonContent,
    lessonTitle,
    questionCount = 5,
    difficulty = 'intermediate',
    questionTypes = ['multiple_choice', 'true_false']
  } = data

  if (!lessonContent || typeof lessonContent !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid lesson content is required')
  }

  const withinLimit = await checkRateLimit(context.auth.uid, 'generate_quiz')
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.')
  }

  const systemPrompt = `You are an expert assessment designer for aviation and RPAS training.
Generate quiz questions that test understanding, not just memorization.

Guidelines:
- Create questions at ${difficulty} difficulty level
- Include ${questionCount} questions
- Question types allowed: ${questionTypes.join(', ')}
- Each question should test a key learning objective
- Multiple choice: 4 options, one correct, three plausible distractors
- Include brief explanations for correct answers
- Reference specific regulations or standards where relevant
- Avoid trivial or overly obvious questions

Return as JSON array with this structure:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "regulatoryRef": "CAR 901.xx" (optional),
      "difficulty": "intermediate",
      "points": 10
    }
  ]
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate ${questionCount} quiz questions for this lesson "${lessonTitle}":\n\n${lessonContent}`
        }
      ]
    })

    const responseText = response.content?.[0]?.text || ''

    // Extract JSON from response
    let questions = []
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*"questions"[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        questions = parsed.questions || []
      }
    } catch (parseError) {
      functions.logger.error('JSON parse error:', parseError)
      throw new functions.https.HttpsError('internal', 'Failed to parse generated questions')
    }

    functions.logger.info('Quiz questions generated', {
      userId: context.auth.uid,
      lessonTitle,
      questionCount: questions.length
    })

    return {
      success: true,
      questions,
      metadata: {
        model: 'claude-sonnet-4-20250514',
        generatedAt: new Date().toISOString(),
        lessonTitle,
        difficulty
      }
    }

  } catch (error) {
    functions.logger.error('Quiz generation failed:', error)
    throw new functions.https.HttpsError('internal', 'Failed to generate quiz questions')
  }
})

/**
 * Generate branching scenario from procedure content
 * Creates interactive decision trees for practical application
 */
exports.generateScenarioFromProcedure = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  const {
    procedureContent,
    procedureTitle,
    scenarioType = 'decision_tree',
    difficulty = 'intermediate',
    context: scenarioContext = {}
  } = data

  if (!procedureContent || typeof procedureContent !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid procedure content is required')
  }

  const withinLimit = await checkRateLimit(context.auth.uid, 'generate_scenario')
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.')
  }

  const systemPrompt = `You are an expert scenario designer for aviation and RPAS operations training.
Create realistic, immersive scenarios that test procedural knowledge and decision-making.

Guidelines:
- Create a ${scenarioType} scenario at ${difficulty} difficulty
- Make it realistic and relevant to Canadian RPAS operations
- Include environmental factors, time pressure, and real-world complications
- Each decision point should have 2-4 options with different outcomes
- Include at least one "trap" choice that seems reasonable but is wrong
- Provide detailed feedback for each path
- Reference relevant procedures and regulations
- The scenario should take 5-10 minutes to complete

Context provided: ${JSON.stringify(scenarioContext)}

Return as JSON with this structure:
{
  "scenario": {
    "id": "scenario_xxx",
    "title": "Scenario Title",
    "description": "Setup and context",
    "type": "${scenarioType}",
    "difficulty": "${difficulty}",
    "estimatedTime": 10,
    "startNodeId": "node_1",
    "nodes": [
      {
        "id": "node_1",
        "type": "situation",
        "content": "Situation description with rich detail",
        "image": null,
        "choices": [
          {
            "id": "choice_1a",
            "text": "Choice text",
            "nextNodeId": "node_2",
            "isOptimal": true,
            "feedback": "Why this choice matters"
          }
        ]
      },
      {
        "id": "node_end_success",
        "type": "outcome",
        "content": "Success outcome description",
        "isSuccess": true,
        "xpReward": 50,
        "lessonLearned": "Key takeaway"
      }
    ],
    "learningObjectives": ["Objective 1", "Objective 2"],
    "regulatoryRefs": ["CAR xxx", "Standard xxx"]
  }
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Create an interactive scenario based on this procedure "${procedureTitle}":\n\n${procedureContent}`
        }
      ]
    })

    const responseText = response.content?.[0]?.text || ''

    let scenario = null
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*"scenario"[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        scenario = parsed.scenario
      }
    } catch (parseError) {
      functions.logger.error('Scenario JSON parse error:', parseError)
      throw new functions.https.HttpsError('internal', 'Failed to parse generated scenario')
    }

    if (!scenario) {
      throw new functions.https.HttpsError('internal', 'No scenario generated')
    }

    functions.logger.info('Scenario generated', {
      userId: context.auth.uid,
      procedureTitle,
      nodeCount: scenario.nodes?.length || 0
    })

    return {
      success: true,
      scenario,
      metadata: {
        model: 'claude-sonnet-4-20250514',
        generatedAt: new Date().toISOString()
      }
    }

  } catch (error) {
    functions.logger.error('Scenario generation failed:', error)
    throw new functions.https.HttpsError('internal', 'Failed to generate scenario')
  }
})

/**
 * Generate flashcards from content
 * Creates study cards with questions, answers, and memory aids
 */
exports.generateFlashcardsFromContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  const {
    content,
    contentTitle,
    cardCount = 10,
    category = 'general',
    focusAreas = []
  } = data

  if (!content || typeof content !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid content is required')
  }

  const withinLimit = await checkRateLimit(context.auth.uid, 'generate_flashcards')
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.')
  }

  const focusNote = focusAreas.length > 0
    ? `Focus on these areas: ${focusAreas.join(', ')}`
    : 'Cover all key concepts'

  const systemPrompt = `You are an expert in creating effective flashcards for aviation and RPAS training.
Create flashcards that aid memorization and understanding.

Guidelines:
- Create ${cardCount} flashcards from the content
- Each card should focus on ONE key concept
- Use clear, concise questions
- Provide complete but focused answers
- Include mnemonics or memory aids where helpful
- Reference regulations when relevant
- ${focusNote}

Return as JSON array:
{
  "flashcards": [
    {
      "id": "card_1",
      "category": "${category}",
      "question": "Clear question",
      "answer": "Complete answer",
      "mnemonic": "Memory aid if applicable",
      "regulatoryRef": "Reference if applicable",
      "difficulty": "beginner|intermediate|advanced",
      "tags": ["tag1", "tag2"]
    }
  ]
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate ${cardCount} flashcards from this content "${contentTitle}":\n\n${content}`
        }
      ]
    })

    const responseText = response.content?.[0]?.text || ''

    let flashcards = []
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*"flashcards"[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        flashcards = parsed.flashcards || []
      }
    } catch (parseError) {
      functions.logger.error('Flashcard JSON parse error:', parseError)
      throw new functions.https.HttpsError('internal', 'Failed to parse generated flashcards')
    }

    functions.logger.info('Flashcards generated', {
      userId: context.auth.uid,
      contentTitle,
      cardCount: flashcards.length
    })

    return {
      success: true,
      flashcards,
      metadata: {
        model: 'claude-sonnet-4-20250514',
        generatedAt: new Date().toISOString(),
        category
      }
    }

  } catch (error) {
    functions.logger.error('Flashcard generation failed:', error)
    throw new functions.https.HttpsError('internal', 'Failed to generate flashcards')
  }
})

/**
 * Generate wrong answer explanation
 * Provides supportive, educational feedback when users answer incorrectly
 */
exports.generateWrongAnswerExplanation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  const {
    question,
    userAnswer,
    correctAnswer,
    explanation,
    category
  } = data

  if (!question || !userAnswer || !correctAnswer) {
    throw new functions.https.HttpsError('invalid-argument', 'Question, user answer, and correct answer are required')
  }

  const withinLimit = await checkRateLimit(context.auth.uid, 'wrong_answer_explanation')
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.')
  }

  const systemPrompt = `You are a supportive RPAS instructor helping a student understand why their answer was incorrect.

Guidelines:
- Be encouraging and supportive - never condescending
- Explain WHY the correct answer is right
- Explain WHY the chosen answer is incorrect
- Provide a memorable way to remember the concept
- Keep response concise (3-4 sentences)
- Reference regulations if relevant

Format your response with:
1. Brief acknowledgment
2. Why the correct answer is right
3. Common misconception addressed
4. Memory tip`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-3-5-20241022', // Using Haiku for quick, simple responses
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Question: ${question}
User's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}
${explanation ? `Explanation: ${explanation}` : ''}
Category: ${category || 'General'}`
        }
      ]
    })

    const feedbackText = response.content?.[0]?.text || 'The correct answer is different. Please review the lesson material.'

    return {
      success: true,
      feedback: feedbackText
    }

  } catch (error) {
    functions.logger.error('Wrong answer explanation failed:', error)
    // Return a default message instead of throwing
    return {
      success: true,
      feedback: `The correct answer is: ${correctAnswer}. ${explanation || 'Please review the lesson for more details.'}`
    }
  }
})

/**
 * Generate scenario debrief
 * Provides comprehensive analysis after completing a scenario
 */
exports.generateScenarioDebrief = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated')
  }

  if (!anthropic) {
    throw new functions.https.HttpsError('failed-precondition', 'AI service not configured')
  }

  const {
    scenarioTitle,
    decisions,
    outcome,
    timeSpent,
    optimalPath
  } = data

  if (!scenarioTitle || !decisions || !outcome) {
    throw new functions.https.HttpsError('invalid-argument', 'Scenario data is required')
  }

  const withinLimit = await checkRateLimit(context.auth.uid, 'scenario_debrief')
  if (!withinLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.')
  }

  const systemPrompt = `You are an experienced RPAS operations instructor conducting a debrief after a training scenario.

Guidelines:
- Start with what went well
- Analyze each decision point
- Connect decisions to real-world consequences
- Reference relevant regulations and procedures
- Provide specific improvement recommendations
- Include a "What would a seasoned pilot do?" perspective
- End with encouragement and next steps

Structure your debrief:
1. **Overall Assessment** (1-2 sentences)
2. **What You Did Well** (2-3 bullet points)
3. **Decision Analysis** (analyze key decision points)
4. **Regulatory Connections** (relevant CARs, procedures)
5. **Real-World Application** (how this applies to actual operations)
6. **Recommendations** (specific actions to improve)
7. **Next Steps** (what to study or practice next)`

  try {
    const decisionSummary = decisions.map((d, i) =>
      `Decision ${i + 1}: ${d.choice} (${d.wasOptimal ? 'Optimal' : 'Suboptimal'})`
    ).join('\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please provide a debrief for this scenario:

Scenario: ${scenarioTitle}
Outcome: ${outcome.isSuccess ? 'Successful' : 'Unsuccessful'} - ${outcome.description}
Time Spent: ${timeSpent} minutes

Decisions Made:
${decisionSummary}

${optimalPath ? `Optimal Path: ${optimalPath}` : ''}`
        }
      ]
    })

    const debriefText = response.content?.[0]?.text || ''

    functions.logger.info('Scenario debrief generated', {
      userId: context.auth.uid,
      scenarioTitle,
      outcomeSuccess: outcome.isSuccess
    })

    return {
      success: true,
      debrief: debriefText,
      metadata: {
        generatedAt: new Date().toISOString()
      }
    }

  } catch (error) {
    functions.logger.error('Scenario debrief failed:', error)
    throw new functions.https.HttpsError('internal', 'Failed to generate debrief')
  }
})

module.exports = {
  enhanceLessonContent: exports.enhanceLessonContent,
  generateQuizFromContent: exports.generateQuizFromContent,
  generateScenarioFromProcedure: exports.generateScenarioFromProcedure,
  generateFlashcardsFromContent: exports.generateFlashcardsFromContent,
  generateWrongAnswerExplanation: exports.generateWrongAnswerExplanation,
  generateScenarioDebrief: exports.generateScenarioDebrief
}
