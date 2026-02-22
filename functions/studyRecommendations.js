/**
 * Study Recommendations - AI-Powered Learning Recommendations
 *
 * Uses Claude AI to analyze user performance and generate personalized
 * study recommendations, spaced repetition scheduling, and learning paths.
 *
 * @version 1.0.0
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { getFirestore } = require('firebase-admin/firestore')
const Anthropic = require('@anthropic-ai/sdk')

const db = getFirestore()

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

/**
 * Analyze user performance across quests and identify knowledge gaps
 */
exports.analyzeUserPerformance = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = request.auth.uid
  const { trackId } = request.data

  try {
    // Fetch user's quest progress
    const progressSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('questProgress')
      .get()

    const quizResults = []
    const scenarioResults = []

    progressSnapshot.forEach(doc => {
      const data = doc.data()
      if (data.quizResults) {
        quizResults.push(...data.quizResults)
      }
      if (data.scenarioResults) {
        scenarioResults.push(...data.scenarioResults)
      }
    })

    // Analyze patterns
    const analysis = {
      totalQuizzesTaken: quizResults.length,
      averageScore: quizResults.length > 0
        ? quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
        : 0,
      weakTopics: identifyWeakTopics(quizResults),
      strongTopics: identifyStrongTopics(quizResults),
      scenarioPerformance: analyzeScenarioPerformance(scenarioResults),
      learningVelocity: calculateLearningVelocity(quizResults),
      recommendedReviewItems: getReviewItems(quizResults)
    }

    // Generate AI-powered insights
    const insights = await generatePerformanceInsights(analysis, trackId)

    return {
      success: true,
      analysis,
      insights
    }
  } catch (error) {
    console.error('Error analyzing user performance:', error)
    throw new HttpsError('internal', 'Failed to analyze performance')
  }
})

/**
 * Generate personalized study recommendations
 */
exports.generateStudyPlan = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = request.auth.uid
  const { targetTrack, studyTimeMinutes, focusAreas } = request.data

  try {
    // Get user's current progress
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data() || {}

    // Get quest progress
    const progressSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('questProgress')
      .get()

    const completedQuests = []
    const inProgressQuests = []

    progressSnapshot.forEach(doc => {
      const data = doc.data()
      if (data.status === 'completed') {
        completedQuests.push(doc.id)
      } else if (data.status === 'in_progress') {
        inProgressQuests.push(doc.id)
      }
    })

    // Generate study plan using AI
    const studyPlan = await generateAIStudyPlan({
      completedQuests,
      inProgressQuests,
      targetTrack,
      studyTimeMinutes,
      focusAreas,
      userLevel: userData.level || 1,
      streak: userData.streak || 0
    })

    return {
      success: true,
      studyPlan
    }
  } catch (error) {
    console.error('Error generating study plan:', error)
    throw new HttpsError('internal', 'Failed to generate study plan')
  }
})

/**
 * Get spaced repetition schedule for review items
 */
exports.getSpacedRepetitionSchedule = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = request.auth.uid

  try {
    // Get items due for review
    const now = new Date()

    const reviewItemsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('reviewItems')
      .where('nextReviewDate', '<=', now)
      .orderBy('nextReviewDate')
      .limit(20)
      .get()

    const reviewItems = []
    reviewItemsSnapshot.forEach(doc => {
      reviewItems.push({
        id: doc.id,
        ...doc.data()
      })
    })

    // Calculate priority scores
    const prioritizedItems = reviewItems.map(item => ({
      ...item,
      priority: calculateReviewPriority(item)
    })).sort((a, b) => b.priority - a.priority)

    return {
      success: true,
      reviewItems: prioritizedItems,
      totalDue: reviewItems.length
    }
  } catch (error) {
    console.error('Error getting review schedule:', error)
    throw new HttpsError('internal', 'Failed to get review schedule')
  }
})

/**
 * Update spaced repetition item after review
 */
exports.updateReviewItem = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = request.auth.uid
  const { itemId, quality } = request.data // quality: 0-5 (0=complete blackout, 5=perfect recall)

  if (quality < 0 || quality > 5) {
    throw new HttpsError('invalid-argument', 'Quality must be between 0 and 5')
  }

  try {
    const itemRef = db
      .collection('users')
      .doc(userId)
      .collection('reviewItems')
      .doc(itemId)

    const itemDoc = await itemRef.get()
    if (!itemDoc.exists) {
      throw new HttpsError('not-found', 'Review item not found')
    }

    const item = itemDoc.data()

    // Calculate new interval using SM-2 algorithm variant
    const newSchedule = calculateNextReview(item, quality)

    await itemRef.update({
      ...newSchedule,
      lastReviewDate: new Date(),
      reviewCount: (item.reviewCount || 0) + 1
    })

    return {
      success: true,
      nextReviewDate: newSchedule.nextReviewDate
    }
  } catch (error) {
    console.error('Error updating review item:', error)
    throw new HttpsError('internal', 'Failed to update review item')
  }
})

/**
 * Add item to spaced repetition queue
 */
exports.addToReviewQueue = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = request.auth.uid
  const { type, contentId, question, answer, tags } = request.data

  try {
    const reviewItem = {
      type, // 'quiz-question', 'lesson-concept', 'scenario-decision'
      contentId,
      question,
      answer,
      tags: tags || [],
      easeFactor: 2.5, // Initial ease factor
      interval: 1, // Days until next review
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      createdAt: new Date(),
      reviewCount: 0
    }

    const docRef = await db
      .collection('users')
      .doc(userId)
      .collection('reviewItems')
      .add(reviewItem)

    return {
      success: true,
      itemId: docRef.id
    }
  } catch (error) {
    console.error('Error adding review item:', error)
    throw new HttpsError('internal', 'Failed to add review item')
  }
})

/**
 * Get recommended next quests based on progress and preferences
 */
exports.getNextQuestRecommendations = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated')
  }

  const userId = request.auth.uid
  const { limit = 5 } = request.data

  try {
    // Get user progress
    const progressSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('questProgress')
      .get()

    const completedQuestIds = []
    const questScores = {}

    progressSnapshot.forEach(doc => {
      const data = doc.data()
      if (data.status === 'completed') {
        completedQuestIds.push(doc.id)
      }
      if (data.quizResults?.length > 0) {
        const lastScore = data.quizResults[data.quizResults.length - 1].score
        questScores[doc.id] = lastScore
      }
    })

    // Generate recommendations using AI
    const recommendations = await generateQuestRecommendations({
      completedQuestIds,
      questScores,
      limit
    })

    return {
      success: true,
      recommendations
    }
  } catch (error) {
    console.error('Error getting quest recommendations:', error)
    throw new HttpsError('internal', 'Failed to get recommendations')
  }
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Identify topics where user scored below threshold
 */
function identifyWeakTopics(quizResults) {
  const topicScores = {}

  quizResults.forEach(result => {
    if (result.incorrectQuestions) {
      result.incorrectQuestions.forEach(q => {
        const topic = q.topic || q.questId
        if (!topicScores[topic]) {
          topicScores[topic] = { correct: 0, total: 0 }
        }
        topicScores[topic].total++
      })
    }
    if (result.correctQuestions) {
      result.correctQuestions.forEach(q => {
        const topic = q.topic || q.questId
        if (!topicScores[topic]) {
          topicScores[topic] = { correct: 0, total: 0 }
        }
        topicScores[topic].correct++
        topicScores[topic].total++
      })
    }
  })

  const weakTopics = []
  Object.entries(topicScores).forEach(([topic, scores]) => {
    const percentage = (scores.correct / scores.total) * 100
    if (percentage < 70 && scores.total >= 3) {
      weakTopics.push({
        topic,
        score: Math.round(percentage),
        questionsAttempted: scores.total
      })
    }
  })

  return weakTopics.sort((a, b) => a.score - b.score)
}

/**
 * Identify topics where user scored above threshold
 */
function identifyStrongTopics(quizResults) {
  const topicScores = {}

  quizResults.forEach(result => {
    if (result.correctQuestions) {
      result.correctQuestions.forEach(q => {
        const topic = q.topic || q.questId
        if (!topicScores[topic]) {
          topicScores[topic] = { correct: 0, total: 0 }
        }
        topicScores[topic].correct++
        topicScores[topic].total++
      })
    }
    if (result.incorrectQuestions) {
      result.incorrectQuestions.forEach(q => {
        const topic = q.topic || q.questId
        if (!topicScores[topic]) {
          topicScores[topic] = { correct: 0, total: 0 }
        }
        topicScores[topic].total++
      })
    }
  })

  const strongTopics = []
  Object.entries(topicScores).forEach(([topic, scores]) => {
    const percentage = (scores.correct / scores.total) * 100
    if (percentage >= 90 && scores.total >= 3) {
      strongTopics.push({
        topic,
        score: Math.round(percentage),
        questionsAttempted: scores.total
      })
    }
  })

  return strongTopics.sort((a, b) => b.score - a.score)
}

/**
 * Analyze scenario decision patterns
 */
function analyzeScenarioPerformance(scenarioResults) {
  if (scenarioResults.length === 0) {
    return { completed: 0, avgOutcome: 0, commonMistakes: [] }
  }

  const completed = scenarioResults.length
  const avgOutcome = scenarioResults.reduce((sum, r) => sum + (r.outcome || 0), 0) / completed

  // Identify common mistake patterns
  const mistakePatterns = {}
  scenarioResults.forEach(result => {
    if (result.poorDecisions) {
      result.poorDecisions.forEach(decision => {
        const pattern = decision.category || 'general'
        mistakePatterns[pattern] = (mistakePatterns[pattern] || 0) + 1
      })
    }
  })

  const commonMistakes = Object.entries(mistakePatterns)
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    completed,
    avgOutcome: Math.round(avgOutcome * 100),
    commonMistakes
  }
}

/**
 * Calculate how quickly user is learning
 */
function calculateLearningVelocity(quizResults) {
  if (quizResults.length < 5) {
    return { trend: 'insufficient-data', value: 0 }
  }

  // Compare recent scores to earlier scores
  const recent = quizResults.slice(-5)
  const earlier = quizResults.slice(-10, -5)

  const recentAvg = recent.reduce((sum, r) => sum + r.score, 0) / recent.length
  const earlierAvg = earlier.length > 0
    ? earlier.reduce((sum, r) => sum + r.score, 0) / earlier.length
    : recentAvg

  const change = recentAvg - earlierAvg

  if (change > 5) {
    return { trend: 'improving', value: Math.round(change) }
  } else if (change < -5) {
    return { trend: 'declining', value: Math.round(change) }
  } else {
    return { trend: 'stable', value: Math.round(change) }
  }
}

/**
 * Get items that should be reviewed based on performance
 */
function getReviewItems(quizResults) {
  const incorrectItems = []

  quizResults.forEach(result => {
    if (result.incorrectQuestions) {
      result.incorrectQuestions.forEach(q => {
        incorrectItems.push({
          questionId: q.id,
          questId: q.questId,
          question: q.question,
          correctAnswer: q.correctAnswer,
          timestamp: result.timestamp
        })
      })
    }
  })

  // Sort by most recent first
  return incorrectItems
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
}

/**
 * Calculate next review interval using modified SM-2 algorithm
 */
function calculateNextReview(item, quality) {
  let easeFactor = item.easeFactor || 2.5
  let interval = item.interval || 1

  // Adjust ease factor based on quality
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

  if (quality < 3) {
    // Failed recall - reset interval
    interval = 1
  } else {
    if (interval === 1) {
      interval = 1
    } else if (interval === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
  }

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return {
    easeFactor,
    interval,
    nextReviewDate
  }
}

/**
 * Calculate review priority score
 */
function calculateReviewPriority(item) {
  let priority = 50 // Base priority

  // Overdue items get higher priority
  const now = new Date()
  const dueDate = item.nextReviewDate?.toDate?.() || item.nextReviewDate
  const daysPastDue = Math.max(0, (now - dueDate) / (24 * 60 * 60 * 1000))
  priority += Math.min(30, daysPastDue * 5)

  // Lower ease factor = more difficult = higher priority
  if (item.easeFactor < 2.0) {
    priority += 20
  } else if (item.easeFactor < 2.5) {
    priority += 10
  }

  // Recently missed items get higher priority
  if (item.lastRecallQuality < 3) {
    priority += 15
  }

  return Math.round(priority)
}

/**
 * Generate AI-powered performance insights
 */
async function generatePerformanceInsights(analysis, trackId) {
  const prompt = `You are an aviation training analyst. Based on the following performance data, provide 3-4 brief, actionable insights for the learner.

Performance Data:
- Total quizzes taken: ${analysis.totalQuizzesTaken}
- Average score: ${Math.round(analysis.averageScore)}%
- Weak topics: ${JSON.stringify(analysis.weakTopics)}
- Strong topics: ${JSON.stringify(analysis.strongTopics)}
- Learning velocity: ${analysis.learningVelocity.trend} (${analysis.learningVelocity.value}% change)
- Scenario performance: ${analysis.scenarioPerformance.avgOutcome}% average outcome
- Common scenario mistakes: ${JSON.stringify(analysis.scenarioPerformance.commonMistakes)}

Track focus: ${trackId || 'general'}

Provide insights in JSON format:
{
  "insights": [
    {"type": "strength|weakness|recommendation|encouragement", "message": "Brief insight message"}
  ],
  "priorityFocus": "Single most important area to focus on"
}

Keep messages concise and actionable. Reference specific topics when possible.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = response.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return { insights: [], priorityFocus: null }
  } catch (error) {
    console.error('Error generating insights:', error)
    return { insights: [], priorityFocus: null }
  }
}

/**
 * Generate AI-powered study plan
 */
async function generateAIStudyPlan(params) {
  const prompt = `You are an aviation training planner. Create a focused study plan based on:

Student Profile:
- Level: ${params.userLevel}
- Current streak: ${params.streak} days
- Available time: ${params.studyTimeMinutes} minutes
- Focus areas: ${params.focusAreas?.join(', ') || 'general'}
- Target track: ${params.targetTrack || 'any'}
- Completed quests: ${params.completedQuests.length}
- In-progress quests: ${params.inProgressQuests.join(', ') || 'none'}

Create a study session plan in JSON format:
{
  "sessionTitle": "Brief motivating title",
  "estimatedMinutes": number,
  "activities": [
    {
      "type": "review|lesson|quiz|scenario",
      "contentId": "suggested content id or null",
      "description": "What to do",
      "duration": minutes,
      "priority": "high|medium|low"
    }
  ],
  "tips": ["1-2 study tips"],
  "streakMessage": "Encouraging message about their streak"
}

Keep it achievable within the time constraint. Prioritize weak areas if identified.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = response.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch (error) {
    console.error('Error generating study plan:', error)
    return null
  }
}

/**
 * Generate quest recommendations
 */
async function generateQuestRecommendations(params) {
  const prompt = `You are recommending next quests for an RPAS training program. Based on:

Completed quests: ${params.completedQuestIds.join(', ') || 'none'}
Recent scores: ${JSON.stringify(params.questScores)}

Available tracks: SMS, CRM, RPAS Operations, Regulatory, Risk & Hazard, Field Safety, Wildlife, Specialized Operations

Recommend ${params.limit} next quests in JSON format:
{
  "recommendations": [
    {
      "questId": "suggested-quest-id",
      "trackId": "track-id",
      "reason": "Why this quest is recommended",
      "prerequisitesMet": true/false,
      "difficulty": "beginner|intermediate|advanced"
    }
  ]
}

Consider logical progression, prerequisite knowledge, and variety.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = response.content[0].text
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]).recommendations
    }
    return []
  } catch (error) {
    console.error('Error generating quest recommendations:', error)
    return []
  }
}
