/**
 * Safety AI Service
 * Claude API integration for gamified safety features
 *
 * Handles:
 * - Quiz question generation
 * - Scenario generation and debriefs
 * - Readiness nudges
 * - Content summarization
 * - Adaptive difficulty
 */

import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'
import { logger } from './logger'

// ============================================
// QUIZ GENERATION
// ============================================

/**
 * Generate quiz questions from source content
 */
export async function generateQuizQuestions(params) {
  const {
    sourceChunks,
    regulatoryContext,
    questionCount = 5,
    difficultyLevel = 'intermediate',
    topicFocus = null,
    existingQuestionIds = []
  } = params

  try {
    const generateQuiz = httpsCallable(functions, 'generateQuizQuestions')
    const result = await generateQuiz({
      sourceChunks,
      regulatoryContext,
      questionCount,
      difficultyLevel,
      topicFocus,
      existingQuestionIds
    })

    return result.data
  } catch (error) {
    logger.error('Error generating quiz questions:', error)
    throw error
  }
}

/**
 * Generate explanation for wrong answer
 */
export async function generateWrongAnswerExplanation(params) {
  const {
    question,
    userAnswer,
    correctAnswer,
    regulatoryReference
  } = params

  try {
    const generateExplanation = httpsCallable(functions, 'generateWrongAnswerExplanation')
    const result = await generateExplanation({
      question,
      userAnswer,
      correctAnswer,
      regulatoryReference
    })

    return result.data.explanation
  } catch (error) {
    logger.error('Error generating wrong answer explanation:', error)
    throw error
  }
}

// ============================================
// SCENARIO GENERATION
// ============================================

/**
 * Generate a new scenario
 */
export async function generateScenario(params) {
  const {
    category,
    difficultyTier,
    topicFocus,
    operationalContext,
    procedureChunks,
    regulatoryChunks
  } = params

  try {
    const generate = httpsCallable(functions, 'generateScenario')
    const result = await generate({
      category,
      difficultyTier,
      topicFocus,
      operationalContext,
      procedureChunks,
      regulatoryChunks
    })

    return result.data
  } catch (error) {
    logger.error('Error generating scenario:', error)
    throw error
  }
}

/**
 * Generate scenario debrief
 */
export async function generateScenarioDebrief(params) {
  const {
    scenario,
    pathTaken,
    decisionsAnalysis,
    userScore,
    maxScore
  } = params

  try {
    const generate = httpsCallable(functions, 'generateScenarioDebrief')
    const result = await generate({
      scenario,
      pathTaken,
      decisionsAnalysis,
      userScore,
      maxScore
    })

    return result.data
  } catch (error) {
    logger.error('Error generating scenario debrief:', error)
    throw error
  }
}

/**
 * Generate scenario dialogue (for decision nodes)
 */
export async function generateScenarioDialogue(params) {
  const {
    context,
    character,
    situation,
    tone
  } = params

  try {
    const generate = httpsCallable(functions, 'generateScenarioDialogue')
    const result = await generate({
      context,
      character,
      situation,
      tone
    })

    return result.data.dialogue
  } catch (error) {
    logger.error('Error generating scenario dialogue:', error)
    throw error
  }
}

// ============================================
// READINESS NUDGES
// ============================================

/**
 * Generate readiness nudge based on check-in data
 */
export async function generateReadinessNudge(params) {
  const {
    overallScore,
    categoryScores,
    factorResponses,
    timeOfDay,
    dayOfWeek,
    scheduledOperations,
    recentTrends
  } = params

  try {
    const generate = httpsCallable(functions, 'generateReadinessNudge')
    const result = await generate({
      overallScore,
      categoryScores,
      factorResponses,
      timeOfDay,
      dayOfWeek,
      scheduledOperations,
      recentTrends
    })

    return result.data
  } catch (error) {
    logger.error('Error generating readiness nudge:', error)
    // Return a fallback nudge
    return generateFallbackNudge(overallScore)
  }
}

/**
 * Generate fallback nudge when API fails
 */
function generateFallbackNudge(overallScore) {
  if (overallScore >= 80) {
    return {
      mainMessage: "You're ready to go! Stay focused and have a safe day.",
      tip: null,
      schedulingNote: null,
      category: 'encouragement'
    }
  } else if (overallScore >= 60) {
    return {
      mainMessage: "You're doing okay. Take a moment to check in with yourself throughout the day.",
      tip: "Stay hydrated and take regular breaks.",
      schedulingNote: null,
      category: 'gentle_concern'
    }
  } else {
    return {
      mainMessage: "Your readiness is lower than usual today. That's okay - awareness is the first step.",
      tip: "Consider talking to your supervisor about today's workload.",
      schedulingNote: "If you have operations scheduled, it might be worth discussing adjustments.",
      category: 'check_in_suggested'
    }
  }
}

/**
 * Generate trend insight from readiness history
 */
export async function generateTrendInsight(params) {
  const {
    readinessHistory,
    period = 30
  } = params

  try {
    const generate = httpsCallable(functions, 'generateTrendInsight')
    const result = await generate({
      readinessHistory,
      period
    })

    return result.data
  } catch (error) {
    logger.error('Error generating trend insight:', error)
    return null
  }
}

// ============================================
// CONTENT PROCESSING
// ============================================

/**
 * Chunk document content for AI processing
 */
export async function chunkDocumentContent(params) {
  const {
    documentId,
    documentType,
    fullText,
    metadata
  } = params

  try {
    const process = httpsCallable(functions, 'chunkDocumentContent')
    const result = await process({
      documentId,
      documentType,
      fullText,
      metadata
    })

    return result.data.chunks
  } catch (error) {
    logger.error('Error chunking document content:', error)
    throw error
  }
}

/**
 * Summarize regulatory update
 */
export async function summarizeRegulatoryUpdate(params) {
  const {
    sourceUrl,
    newContent,
    previousContent,
    regulationType
  } = params

  try {
    const summarize = httpsCallable(functions, 'summarizeRegulatoryUpdate')
    const result = await summarize({
      sourceUrl,
      newContent,
      previousContent,
      regulationType
    })

    return result.data
  } catch (error) {
    logger.error('Error summarizing regulatory update:', error)
    throw error
  }
}

/**
 * Generate lesson content from source chunks
 */
export async function generateLessonContent(params) {
  const {
    sourceChunks,
    lessonTitle,
    lessonType,
    targetDuration,
    difficultyLevel
  } = params

  try {
    const generate = httpsCallable(functions, 'generateLessonContent')
    const result = await generate({
      sourceChunks,
      lessonTitle,
      lessonType,
      targetDuration,
      difficultyLevel
    })

    return result.data
  } catch (error) {
    logger.error('Error generating lesson content:', error)
    throw error
  }
}

// ============================================
// ADAPTIVE DIFFICULTY
// ============================================

/**
 * Get adaptive difficulty recommendation
 */
export async function getAdaptiveDifficulty(params) {
  const {
    recentAccuracy,
    topicProficiency,
    avgTimePerQuestion,
    currentStreak,
    questionsToday,
    currentDifficulty,
    currentTopic
  } = params

  try {
    const adapt = httpsCallable(functions, 'getAdaptiveDifficulty')
    const result = await adapt({
      recentAccuracy,
      topicProficiency,
      avgTimePerQuestion,
      currentStreak,
      questionsToday,
      currentDifficulty,
      currentTopic
    })

    return result.data
  } catch (error) {
    logger.error('Error getting adaptive difficulty:', error)
    // Return default recommendation
    return {
      recommendedDifficulty: currentDifficulty || 2,
      rationale: 'Maintaining current difficulty level.',
      topicAdjustment: 'stay'
    }
  }
}

// ============================================
// CONTENT VALIDATION
// ============================================

/**
 * Validate AI-generated content against source
 */
export async function validateGeneratedContent(params) {
  const {
    generatedContent,
    sourceChunks,
    contentType
  } = params

  try {
    const validate = httpsCallable(functions, 'validateGeneratedContent')
    const result = await validate({
      generatedContent,
      sourceChunks,
      contentType
    })

    return result.data
  } catch (error) {
    logger.error('Error validating generated content:', error)
    throw error
  }
}

/**
 * Check content for safety accuracy concerns
 */
export async function checkSafetyAccuracy(params) {
  const {
    content,
    regulatoryReferences,
    contentType
  } = params

  try {
    const check = httpsCallable(functions, 'checkSafetyAccuracy')
    const result = await check({
      content,
      regulatoryReferences,
      contentType
    })

    return result.data
  } catch (error) {
    logger.error('Error checking safety accuracy:', error)
    throw error
  }
}

// ============================================
// PROMPT TEMPLATES (for reference)
// ============================================

export const PROMPT_TEMPLATES = {
  quizGeneration: `You are a safety training content developer for a Canadian RPAS (drone) and remote sensing operations company. Generate quiz questions based on the provided source content.

CONTEXT:
- Industry: RPAS operations, field surveys, marine operations in British Columbia, Canada
- Audience: Field operators, pilots, crew members
- Purpose: Safety training with COR/SECOR audit compliance

SOURCE CONTENT:
{sourceChunks}

REGULATORY REFERENCES:
{regulatoryContext}

Generate {questionCount} quiz questions following these rules:

1. QUESTION TYPES (vary between these):
   - Multiple choice (4 options, 1 correct)
   - Scenario-based (present situation, ask best action)
   - True/False with explanation required
   - Ordering (sequence of steps)

2. DIFFICULTY LEVEL: {difficultyLevel}
   - Beginner: Direct recall, basic concepts
   - Intermediate: Application, "what would you do"
   - Advanced: Complex scenarios, edge cases, regulation interpretation

3. REQUIREMENTS:
   - Each question must be traceable to the source content
   - Include regulatory reference where applicable
   - Explanations must cite specific procedures or regulations
   - Wrong answer explanations should be educational, not punishing
   - Use realistic BC/Canadian operational context

Generate questions that test understanding, not just memorization.`,

  scenarioGeneration: `You are creating an interactive safety training scenario for RPAS/drone field operations in British Columbia, Canada.

SCENARIO PARAMETERS:
- Category: {category}
- Difficulty: {difficultyTier}
- Focus Topics: {topicFocus}

OPERATIONAL CONTEXT:
{operationalContext}

PROCEDURE REFERENCES:
{procedureChunks}

Create a branching scenario with:
1. Realistic operational context
2. 3-5 decision points
3. Multiple paths to success
4. Educational debrief content
5. Specific procedure/regulation references

Make it feel real - operators should recognize situations from actual work.`,

  readinessNudge: `You are a supportive safety companion for a field operator doing their daily readiness check-in.

USER'S CURRENT STATE:
- Overall Readiness Score: {overallScore}/100
- Physical Score: {physicalScore}/100
- Mental Score: {mentalScore}/100
- Fatigue Score: {fatigueScore}/100

TONE REQUIREMENTS:
- Supportive, not preachy
- Practical, not corporate
- Brief (2-3 sentences max)
- Field-relevant

Generate a personalized response with:
1. Acknowledgment of their state
2. Contextual tip if score < 80
3. Scheduling consideration if score < 60 and operation scheduled
4. Positive reinforcement if score >= 80`,

  wrongAnswerExplanation: `A safety trainee answered a question incorrectly. Provide a helpful, educational explanation.

QUESTION: {question}
USER'S ANSWER: {userAnswer}
CORRECT ANSWER: {correctAnswer}
REGULATORY REFERENCE: {regulatoryReference}

Provide a brief (2-3 sentence) explanation that:
1. Acknowledges what they might have been thinking
2. Explains why the correct answer is right
3. References the specific regulation or procedure
4. Ends on an encouraging note

Be educational, not condescending.`
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Estimate token count for content
 */
export function estimateTokenCount(text) {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4)
}

/**
 * Truncate content to fit token budget
 */
export function truncateToTokenBudget(text, maxTokens) {
  const estimatedTokens = estimateTokenCount(text)

  if (estimatedTokens <= maxTokens) {
    return text
  }

  // Truncate to approximate length
  const targetLength = maxTokens * 4
  return text.substring(0, targetLength) + '...[truncated]'
}

/**
 * Prepare source chunks for API context
 */
export function prepareSourceContext(chunks, maxTokens = 4000) {
  let context = ''
  let tokenCount = 0

  for (const chunk of chunks) {
    const chunkTokens = estimateTokenCount(chunk.text)

    if (tokenCount + chunkTokens > maxTokens) {
      break
    }

    context += `\n\n[Source: ${chunk.metadata?.section || 'Section'}]\n${chunk.text}`
    tokenCount += chunkTokens
  }

  return context.trim()
}

/**
 * Format regulatory references for context
 */
export function formatRegulatoryContext(references) {
  if (!references || references.length === 0) {
    return 'No specific regulatory references provided.'
  }

  return references.map(ref => {
    if (typeof ref === 'string') {
      return `- ${ref}`
    }
    return `- ${ref.code}: ${ref.title || ref.description || ''}`
  }).join('\n')
}

export default {
  // Quiz Generation
  generateQuizQuestions,
  generateWrongAnswerExplanation,

  // Scenario Generation
  generateScenario,
  generateScenarioDebrief,
  generateScenarioDialogue,

  // Readiness Nudges
  generateReadinessNudge,
  generateTrendInsight,

  // Content Processing
  chunkDocumentContent,
  summarizeRegulatoryUpdate,
  generateLessonContent,

  // Adaptive Difficulty
  getAdaptiveDifficulty,

  // Content Validation
  validateGeneratedContent,
  checkSafetyAccuracy,

  // Utilities
  estimateTokenCount,
  truncateToTokenBudget,
  prepareSourceContext,
  formatRegulatoryContext,

  // Templates (for reference)
  PROMPT_TEMPLATES
}
