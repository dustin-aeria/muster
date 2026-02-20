/**
 * Firestore Gamification Service
 * Handles all gamification-related database operations
 *
 * Collections:
 * - gamificationConfig: Organization-level settings
 * - questTracks: Quest track definitions
 * - quests: Individual quests within tracks
 * - lessons: Learning content within quests
 * - quizzes: Knowledge checks for quests
 * - quizQuestions: Individual quiz questions
 * - scenarios: Interactive decision scenarios
 * - scenarioNodes: Branching narrative nodes
 * - badges: Badge definitions
 * - readinessCategories: Readiness check-in categories
 * - contentSources: Source documents for content generation
 * - contentChunks: Chunked content for AI context
 *
 * User-specific collections (under /users/{userId}):
 * - gamificationProfile: User's XP, level, badges, etc.
 * - questProgress: Progress on individual quests
 * - scenarioAttempts: Scenario completion records
 * - readinessCheckIns: Daily readiness check-in records
 * - spacedRepetitionQueue: Items due for review
 * - activityLog: Audit trail of all activities
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { logger } from './logger'

// ============================================
// GAMIFICATION CONFIG
// ============================================

/**
 * Get organization gamification configuration
 */
export async function getGamificationConfig(organizationId) {
  try {
    const configRef = doc(db, 'organizations', organizationId, 'gamificationConfig', 'default')
    const configSnap = await getDoc(configRef)

    if (configSnap.exists()) {
      return { id: configSnap.id, ...configSnap.data() }
    }

    // Return defaults if not configured
    return getDefaultGamificationConfig()
  } catch (error) {
    logger.error('Error getting gamification config:', error)
    throw error
  }
}

/**
 * Get default gamification configuration
 */
export function getDefaultGamificationConfig() {
  return {
    // XP rewards
    xpPerQuizCorrect: 10,
    xpPerQuizCorrectFirstTry: 15,
    xpPerLessonComplete: 25,
    xpPerQuestComplete: 100,
    xpPerScenarioComplete: 150,
    xpPerReadinessCheckIn: 15,
    xpPerDailyLogin: 5,
    xpPerPerfectQuiz: 50,

    // Streak bonuses
    streakBonusDay7: 1.25,
    streakBonusDay14: 1.5,
    streakBonusDay30: 1.75,
    streakBonusDay60: 2.0,

    // Streak protection
    maxStreakProtections: 3,
    streakProtectionEarnInterval: 7, // days

    // Quiz settings
    defaultQuizPassingScore: 80,

    // Leaderboard
    leaderboardEnabled: true,
    leaderboardAnonymousOption: true,

    // Readiness
    readinessLowThreshold: 60,
    readinessHighThreshold: 80,

    // Daily caps
    maxDailyXP: 500,

    // Feature flags
    spacedRepetitionEnabled: true,
    scenariosEnabled: true,
    readinessEnabled: true
  }
}

/**
 * Update gamification configuration
 */
export async function updateGamificationConfig(organizationId, updates) {
  try {
    const configRef = doc(db, 'organizations', organizationId, 'gamificationConfig', 'default')
    await setDoc(configRef, {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true })
    return true
  } catch (error) {
    logger.error('Error updating gamification config:', error)
    throw error
  }
}

// ============================================
// USER GAMIFICATION PROFILE
// ============================================

/**
 * Get user's gamification profile
 */
export async function getUserGamificationProfile(userId) {
  try {
    const profileRef = doc(db, 'users', userId, 'gamificationProfile', 'default')
    const profileSnap = await getDoc(profileRef)

    if (profileSnap.exists()) {
      return { id: profileSnap.id, ...profileSnap.data() }
    }

    // Create default profile if doesn't exist
    const defaultProfile = createDefaultGamificationProfile()
    await setDoc(profileRef, defaultProfile)
    return defaultProfile
  } catch (error) {
    logger.error('Error getting user gamification profile:', error)
    throw error
  }
}

/**
 * Create default gamification profile
 */
export function createDefaultGamificationProfile() {
  return {
    totalXP: 0,
    level: 1,
    safetyCultureScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakProtectionsRemaining: 1,
    badgeIds: [],
    completedQuestIds: [],
    completedScenarioIds: [],
    totalLessonsCompleted: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    averageQuizScore: 0,
    averageScenarioScore: 0,
    readinessCheckInStreak: 0,
    averageReadinessScore: 0,
    todayXP: 0,
    todayDate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
}

/**
 * Update user's gamification profile
 */
export async function updateUserGamificationProfile(userId, updates) {
  try {
    const profileRef = doc(db, 'users', userId, 'gamificationProfile', 'default')
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    logger.error('Error updating user gamification profile:', error)
    throw error
  }
}

/**
 * Add XP to user profile
 */
export async function addUserXP(userId, amount, source, sourceId = null) {
  try {
    const profile = await getUserGamificationProfile(userId)
    const config = await getGamificationConfig(profile.organizationId || 'default')

    const today = new Date().toISOString().split('T')[0]
    let todayXP = profile.todayDate === today ? profile.todayXP : 0

    // Apply daily cap
    const cappedAmount = Math.min(amount, config.maxDailyXP - todayXP)
    if (cappedAmount <= 0) {
      logger.info('Daily XP cap reached for user:', userId)
      return { xpAdded: 0, capped: true }
    }

    const newTotalXP = profile.totalXP + cappedAmount
    const newLevel = calculateLevel(newTotalXP)

    const profileRef = doc(db, 'users', userId, 'gamificationProfile', 'default')
    await updateDoc(profileRef, {
      totalXP: increment(cappedAmount),
      level: newLevel,
      todayXP: profile.todayDate === today ? increment(cappedAmount) : cappedAmount,
      todayDate: today,
      updatedAt: serverTimestamp()
    })

    // Log the activity
    await logActivity(userId, 'xp_earned', {
      amount: cappedAmount,
      source,
      sourceId,
      newTotal: newTotalXP
    })

    return {
      xpAdded: cappedAmount,
      capped: cappedAmount < amount,
      newTotal: newTotalXP,
      newLevel,
      leveledUp: newLevel > profile.level
    }
  } catch (error) {
    logger.error('Error adding user XP:', error)
    throw error
  }
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXP) {
  const levelThresholds = [
    0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
    4000, 5000, 6200, 7600, 9200, 11000, 13000, 15200, 17600, 20200,
    23000, 26000, 29200, 32600, 36200, 40000, 44000, 48200, 52600, 57200,
    62000, 67000, 72200, 77600, 83200, 89000, 95000, 101200, 107600, 114200,
    121000, 128000, 135200, 142600, 150200
  ]

  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (totalXP >= levelThresholds[i]) {
      return i + 1
    }
  }
  return 1
}

/**
 * Get level title from level number
 */
export function getLevelTitle(level) {
  if (level >= 100) return 'Safety Legend'
  if (level >= 50) return 'Safety Guardian'
  if (level >= 25) return 'Safety Champion'
  if (level >= 20) return 'Safety Master'
  if (level >= 15) return 'Safety Expert'
  if (level >= 10) return 'Safety Professional'
  if (level >= 5) return 'Safety Practitioner'
  return 'Safety Apprentice'
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel) {
  const levelThresholds = [
    0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
    4000, 5000, 6200, 7600, 9200, 11000, 13000, 15200, 17600, 20200
  ]

  if (currentLevel >= levelThresholds.length) {
    // For high levels, use formula
    return Math.floor(20200 + (currentLevel - 20) * 3000)
  }

  return levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1]
}

// ============================================
// STREAKS
// ============================================

/**
 * Update user streak
 */
export async function updateStreak(userId) {
  try {
    const profile = await getUserGamificationProfile(userId)
    const today = new Date().toISOString().split('T')[0]
    const lastActivity = profile.lastActivityDate

    let newStreak = profile.currentStreak
    let usedProtection = false

    if (!lastActivity) {
      // First activity ever
      newStreak = 1
    } else {
      const lastDate = new Date(lastActivity)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        // Same day, no change
        return { streak: newStreak, updated: false }
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak = profile.currentStreak + 1
      } else if (diffDays === 2 && profile.streakProtectionsRemaining > 0) {
        // Missed one day but have protection
        newStreak = profile.currentStreak + 1
        usedProtection = true
      } else {
        // Streak broken
        newStreak = 1
      }
    }

    const longestStreak = Math.max(newStreak, profile.longestStreak)

    // Check if earned new streak protection
    let newProtections = profile.streakProtectionsRemaining
    if (usedProtection) {
      newProtections -= 1
    }
    if (newStreak > 0 && newStreak % 7 === 0 && newProtections < 3) {
      newProtections += 1
    }

    const profileRef = doc(db, 'users', userId, 'gamificationProfile', 'default')
    await updateDoc(profileRef, {
      currentStreak: newStreak,
      longestStreak,
      lastActivityDate: today,
      streakProtectionsRemaining: newProtections,
      updatedAt: serverTimestamp()
    })

    return {
      streak: newStreak,
      updated: true,
      usedProtection,
      longestStreak,
      protectionsRemaining: newProtections
    }
  } catch (error) {
    logger.error('Error updating streak:', error)
    throw error
  }
}

/**
 * Get streak multiplier based on streak length
 */
export function getStreakMultiplier(streakDays, config = null) {
  const cfg = config || getDefaultGamificationConfig()

  if (streakDays >= 60) return cfg.streakBonusDay60
  if (streakDays >= 30) return cfg.streakBonusDay30
  if (streakDays >= 14) return cfg.streakBonusDay14
  if (streakDays >= 7) return cfg.streakBonusDay7
  return 1.0
}

// ============================================
// BADGES
// ============================================

/**
 * Get all badge definitions
 */
export async function getBadgeDefinitions(organizationId) {
  try {
    const badgesRef = collection(db, 'organizations', organizationId, 'badges')
    const q = query(badgesRef, orderBy('category'), orderBy('name'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error getting badge definitions:', error)
    throw error
  }
}

/**
 * Award badge to user
 */
export async function awardBadge(userId, badgeId, organizationId) {
  try {
    const profile = await getUserGamificationProfile(userId)

    // Check if already has badge
    if (profile.badgeIds?.includes(badgeId)) {
      return { awarded: false, reason: 'already_has_badge' }
    }

    // Get badge definition for XP bonus
    const badgeRef = doc(db, 'organizations', organizationId, 'badges', badgeId)
    const badgeSnap = await getDoc(badgeRef)

    if (!badgeSnap.exists()) {
      return { awarded: false, reason: 'badge_not_found' }
    }

    const badge = badgeSnap.data()

    // Update profile
    const profileRef = doc(db, 'users', userId, 'gamificationProfile', 'default')
    await updateDoc(profileRef, {
      badgeIds: arrayUnion(badgeId),
      updatedAt: serverTimestamp()
    })

    // Award XP bonus if any
    if (badge.xpBonus > 0) {
      await addUserXP(userId, badge.xpBonus, 'badge', badgeId)
    }

    // Log activity
    await logActivity(userId, 'badge_earned', {
      badgeId,
      badgeName: badge.name,
      xpBonus: badge.xpBonus
    })

    return { awarded: true, badge }
  } catch (error) {
    logger.error('Error awarding badge:', error)
    throw error
  }
}

/**
 * Check and award badges based on criteria
 */
export async function checkAndAwardBadges(userId, organizationId, context = {}) {
  try {
    const profile = await getUserGamificationProfile(userId)
    const badges = await getBadgeDefinitions(organizationId)
    const awarded = []

    for (const badge of badges) {
      if (profile.badgeIds?.includes(badge.id)) continue

      const earned = evaluateBadgeCriteria(badge.criteria, profile, context)
      if (earned) {
        const result = await awardBadge(userId, badge.id, organizationId)
        if (result.awarded) {
          awarded.push(badge)
        }
      }
    }

    return awarded
  } catch (error) {
    logger.error('Error checking badges:', error)
    throw error
  }
}

/**
 * Evaluate if badge criteria is met
 */
function evaluateBadgeCriteria(criteria, profile, context) {
  if (!criteria) return false

  switch (criteria.type) {
    case 'quest_complete':
      return profile.completedQuestIds?.includes(criteria.targetId)

    case 'track_complete':
      return context.completedTrackId === criteria.targetId

    case 'streak':
      return profile.currentStreak >= criteria.threshold

    case 'xp_total':
      return profile.totalXP >= criteria.threshold

    case 'quests_completed_count':
      return (profile.completedQuestIds?.length || 0) >= criteria.threshold

    case 'scenarios_completed_count':
      return (profile.completedScenarioIds?.length || 0) >= criteria.threshold

    case 'perfect_quiz':
      return context.perfectQuiz === true

    case 'scenario_score':
      return context.scenarioScore >= criteria.threshold

    case 'readiness_streak':
      return profile.readinessCheckInStreak >= criteria.threshold

    case 'level':
      return profile.level >= criteria.threshold

    default:
      return false
  }
}

// ============================================
// QUEST TRACKS & QUESTS
// ============================================

/**
 * Get all quest tracks
 */
export async function getQuestTracks(organizationId) {
  console.log('getQuestTracks called with orgId:', organizationId)
  try {
    const tracksRef = collection(db, 'organizations', organizationId, 'questTracks')
    // Get ALL docs, no filter
    const snapshot = await getDocs(tracksRef)

    console.log('getQuestTracks snapshot size:', snapshot.size)
    console.log('getQuestTracks snapshot empty:', snapshot.empty)
    snapshot.docs.forEach(doc => {
      console.log('Track doc:', doc.id, doc.data())
    })

    // Sort by order in memory, filter active ones
    const tracks = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(t => t.isActive !== false)

    console.log('getQuestTracks returning tracks:', tracks.length)
    return tracks.sort((a, b) => (a.order || 0) - (b.order || 0))
  } catch (error) {
    console.error('getQuestTracks ERROR:', error)
    logger.error('Error getting quest tracks:', error)
    throw error
  }
}

/**
 * Get quests for a track
 */
export async function getQuestsForTrack(organizationId, trackId) {
  try {
    const questsRef = collection(db, 'organizations', organizationId, 'quests')
    // Simple query to avoid compound index requirement
    const q = query(questsRef, where('trackId', '==', trackId))
    const snapshot = await getDocs(q)

    // Filter and sort in memory
    const quests = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(quest => quest.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    return quests
  } catch (error) {
    logger.error('Error getting quests for track:', error)
    throw error
  }
}

/**
 * Get quest by ID
 */
export async function getQuest(organizationId, questId) {
  try {
    const questRef = doc(db, 'organizations', organizationId, 'quests', questId)
    const questSnap = await getDoc(questRef)

    if (!questSnap.exists()) {
      return null
    }

    return { id: questSnap.id, ...questSnap.data() }
  } catch (error) {
    logger.error('Error getting quest:', error)
    throw error
  }
}

/**
 * Get lessons for a quest
 */
export async function getLessonsForQuest(organizationId, questId) {
  try {
    const lessonsRef = collection(db, 'organizations', organizationId, 'lessons')
    const q = query(lessonsRef, where('questId', '==', questId))
    const snapshot = await getDocs(q)

    // Sort by order in memory
    const lessons = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return lessons.sort((a, b) => (a.order || 0) - (b.order || 0))
  } catch (error) {
    logger.error('Error getting lessons for quest:', error)
    throw error
  }
}

/**
 * Get quiz for a quest
 */
export async function getQuizForQuest(organizationId, questId) {
  try {
    const quizzesRef = collection(db, 'organizations', organizationId, 'quizzes')
    const q = query(quizzesRef, where('questId', '==', questId), limit(1))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const quiz = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }

    // Get questions
    const questionsRef = collection(db, 'organizations', organizationId, 'quizQuestions')
    const qQ = query(questionsRef, where('quizId', '==', quiz.id))
    const questionsSnap = await getDocs(qQ)

    quiz.questions = questionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return quiz
  } catch (error) {
    logger.error('Error getting quiz for quest:', error)
    throw error
  }
}

// ============================================
// USER QUEST PROGRESS
// ============================================

/**
 * Get user's progress on a quest
 */
export async function getUserQuestProgress(userId, questId) {
  try {
    const progressRef = collection(db, 'users', userId, 'questProgress')
    const q = query(progressRef, where('questId', '==', questId), limit(1))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  } catch (error) {
    logger.error('Error getting user quest progress:', error)
    throw error
  }
}

/**
 * Get all quest progress for a user
 */
export async function getAllUserQuestProgress(userId) {
  try {
    const progressRef = collection(db, 'users', userId, 'questProgress')
    const snapshot = await getDocs(progressRef)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error getting all user quest progress:', error)
    throw error
  }
}

/**
 * Update or create quest progress
 */
export async function updateQuestProgress(userId, questId, updates) {
  try {
    const existingProgress = await getUserQuestProgress(userId, questId)

    if (existingProgress) {
      const progressRef = doc(db, 'users', userId, 'questProgress', existingProgress.id)
      await updateDoc(progressRef, {
        ...updates,
        lastAccessedAt: serverTimestamp()
      })
      return existingProgress.id
    } else {
      const progressRef = collection(db, 'users', userId, 'questProgress')
      const newDoc = await addDoc(progressRef, {
        questId,
        status: 'in_progress',
        completedLessonIds: [],
        quizAttempts: [],
        bestQuizScore: 0,
        xpEarned: 0,
        startedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        ...updates
      })
      return newDoc.id
    }
  } catch (error) {
    logger.error('Error updating quest progress:', error)
    throw error
  }
}

/**
 * Mark lesson as complete
 */
export async function markLessonComplete(userId, questId, lessonId, organizationId) {
  try {
    const progress = await getUserQuestProgress(userId, questId)
    const config = await getGamificationConfig(organizationId)

    // Check if already completed
    if (progress?.completedLessonIds?.includes(lessonId)) {
      return { alreadyCompleted: true }
    }

    // Update progress
    const completedLessonIds = [...(progress?.completedLessonIds || []), lessonId]
    await updateQuestProgress(userId, questId, {
      completedLessonIds
    })

    // Award XP
    const profile = await getUserGamificationProfile(userId)
    const multiplier = getStreakMultiplier(profile.currentStreak, config)
    const xp = Math.floor(config.xpPerLessonComplete * multiplier)

    const xpResult = await addUserXP(userId, xp, 'lesson', lessonId)

    // Update streak
    await updateStreak(userId)

    // Update profile stats
    await updateUserGamificationProfile(userId, {
      totalLessonsCompleted: increment(1)
    })

    // Log activity
    await logActivity(userId, 'lesson_complete', {
      questId,
      lessonId,
      xpEarned: xpResult.xpAdded
    })

    // Check for badges
    const badges = await checkAndAwardBadges(userId, organizationId)

    return {
      completed: true,
      xpEarned: xpResult.xpAdded,
      badgesEarned: badges
    }
  } catch (error) {
    logger.error('Error marking lesson complete:', error)
    throw error
  }
}

/**
 * Submit quiz attempt
 */
export async function submitQuizAttempt(userId, questId, quizId, answers, organizationId) {
  try {
    const quiz = await getQuizForQuest(organizationId, questId)
    const config = await getGamificationConfig(organizationId)
    const profile = await getUserGamificationProfile(userId)

    // Calculate score
    let correctCount = 0
    const answersAnalysis = []

    for (const question of quiz.questions) {
      const userAnswer = answers[question.id]
      const isCorrect = evaluateAnswer(question, userAnswer)

      if (isCorrect) correctCount++

      answersAnalysis.push({
        questionId: question.id,
        userAnswer,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      })
    }

    const score = Math.round((correctCount / quiz.questions.length) * 100)
    const passed = score >= (quiz.passingScore || config.defaultQuizPassingScore)
    const isPerfect = score === 100

    // Create attempt record
    const attempt = {
      attemptId: `attempt_${Date.now()}`,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      passed,
      isPerfect,
      answers: answersAnalysis,
      dateTaken: serverTimestamp()
    }

    // Update progress
    const progress = await getUserQuestProgress(userId, questId)
    const quizAttempts = [...(progress?.quizAttempts || []), attempt]
    const bestQuizScore = Math.max(progress?.bestQuizScore || 0, score)

    await updateQuestProgress(userId, questId, {
      quizAttempts,
      bestQuizScore
    })

    // Calculate XP
    const multiplier = getStreakMultiplier(profile.currentStreak, config)
    let totalXP = 0

    // XP for correct answers
    const correctXP = Math.floor(correctCount * config.xpPerQuizCorrect * multiplier)
    totalXP += correctXP

    // Bonus for perfect score
    if (isPerfect) {
      totalXP += Math.floor(config.xpPerPerfectQuiz * multiplier)
    }

    const xpResult = await addUserXP(userId, totalXP, 'quiz', quizId)

    // Update streak
    await updateStreak(userId)

    // Update profile stats
    await updateUserGamificationProfile(userId, {
      totalQuestionsAnswered: increment(quiz.questions.length),
      totalCorrectAnswers: increment(correctCount)
    })

    // If passed and all lessons complete, mark quest complete
    let questCompleted = false
    if (passed) {
      const quest = await getQuest(organizationId, questId)
      const lessons = await getLessonsForQuest(organizationId, questId)

      if (progress?.completedLessonIds?.length >= lessons.length) {
        questCompleted = true
        await completeQuest(userId, questId, organizationId)
      }
    }

    // Log activity
    await logActivity(userId, 'quiz_attempt', {
      questId,
      quizId,
      score,
      passed,
      isPerfect,
      xpEarned: xpResult.xpAdded
    })

    // Check for badges
    const badges = await checkAndAwardBadges(userId, organizationId, {
      perfectQuiz: isPerfect
    })

    return {
      score,
      passed,
      isPerfect,
      correctCount,
      totalQuestions: quiz.questions.length,
      answersAnalysis,
      xpEarned: xpResult.xpAdded,
      questCompleted,
      badgesEarned: badges
    }
  } catch (error) {
    logger.error('Error submitting quiz attempt:', error)
    throw error
  }
}

/**
 * Evaluate if answer is correct
 */
function evaluateAnswer(question, userAnswer) {
  switch (question.type) {
    case 'multiple_choice':
    case 'true_false':
      return userAnswer === question.correctAnswer

    case 'matching':
    case 'ordering':
      if (Array.isArray(question.correctAnswer) && Array.isArray(userAnswer)) {
        return JSON.stringify(question.correctAnswer) === JSON.stringify(userAnswer)
      }
      return false

    default:
      return userAnswer === question.correctAnswer
  }
}

/**
 * Complete a quest
 */
async function completeQuest(userId, questId, organizationId) {
  try {
    const config = await getGamificationConfig(organizationId)
    const profile = await getUserGamificationProfile(userId)
    const quest = await getQuest(organizationId, questId)

    // Update progress status
    await updateQuestProgress(userId, questId, {
      status: 'completed',
      completedAt: serverTimestamp()
    })

    // Award quest completion XP
    const multiplier = getStreakMultiplier(profile.currentStreak, config)
    const xp = Math.floor((quest.xpReward || config.xpPerQuestComplete) * multiplier)

    const xpResult = await addUserXP(userId, xp, 'quest_complete', questId)

    // Update profile
    await updateUserGamificationProfile(userId, {
      completedQuestIds: arrayUnion(questId)
    })

    // Log activity
    await logActivity(userId, 'quest_complete', {
      questId,
      questName: quest.name,
      xpEarned: xpResult.xpAdded
    })

    // Check for badges
    await checkAndAwardBadges(userId, organizationId)

    return { completed: true, xpEarned: xpResult.xpAdded }
  } catch (error) {
    logger.error('Error completing quest:', error)
    throw error
  }
}

// ============================================
// SCENARIOS
// ============================================

/**
 * Get all scenarios
 */
export async function getScenarios(organizationId, filters = {}) {
  try {
    const scenariosRef = collection(db, 'organizations', organizationId, 'scenarios')

    // Query for active scenarios (supports both isActive and reviewStatus fields)
    let q = query(scenariosRef, where('isActive', '==', true))

    if (filters.category) {
      q = query(q, where('category', '==', filters.category))
    }

    if (filters.difficultyTier) {
      q = query(q, where('difficultyTier', '==', filters.difficultyTier))
    }

    const snapshot = await getDocs(q)

    // Sort by title in memory since compound indexes may still be building
    const scenarios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return scenarios.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  } catch (error) {
    logger.error('Error getting scenarios:', error)
    throw error
  }
}

/**
 * Get scenario by ID with nodes
 */
export async function getScenarioWithNodes(organizationId, scenarioId) {
  try {
    const scenarioRef = doc(db, 'organizations', organizationId, 'scenarios', scenarioId)
    const scenarioSnap = await getDoc(scenarioRef)

    if (!scenarioSnap.exists()) {
      return null
    }

    const scenario = { id: scenarioSnap.id, ...scenarioSnap.data() }

    // Get nodes with simple query
    const nodesRef = collection(db, 'organizations', organizationId, 'scenarioNodes')
    const q = query(nodesRef, where('scenarioId', '==', scenarioId))
    const nodesSnap = await getDocs(q)

    // Sort by order in memory
    scenario.nodes = nodesSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    return scenario
  } catch (error) {
    logger.error('Error getting scenario with nodes:', error)
    throw error
  }
}

/**
 * Submit scenario attempt
 */
export async function submitScenarioAttempt(userId, scenarioId, pathTaken, organizationId) {
  try {
    const scenario = await getScenarioWithNodes(organizationId, scenarioId)
    const config = await getGamificationConfig(organizationId)
    const profile = await getUserGamificationProfile(userId)

    // Calculate score
    let totalScore = 0
    const decisionsAnalysis = []

    for (const step of pathTaken) {
      const node = scenario.nodes.find(n => n.id === step.nodeId)
      if (!node) continue

      const decision = node.decisions?.find(d => d.id === step.decisionId)
      if (decision) {
        totalScore += decision.scoreImpact || 0
        decisionsAnalysis.push({
          nodeId: step.nodeId,
          decisionId: step.decisionId,
          wasOptimal: decision.isOptimal || false,
          rationale: decision.rationale,
          scoreImpact: decision.scoreImpact || 0
        })
      }
    }

    const scorePercentage = Math.round((totalScore / scenario.maxScore) * 100)

    // Create attempt record
    const attemptRef = collection(db, 'users', userId, 'scenarioAttempts')
    const attempt = {
      scenarioId,
      score: totalScore,
      maxPossibleScore: scenario.maxScore,
      scorePercentage,
      pathTaken,
      decisionsAnalysis,
      startedAt: pathTaken[0]?.timestamp || serverTimestamp(),
      completedAt: serverTimestamp(),
      durationSeconds: pathTaken.length > 0
        ? Math.floor((Date.now() - new Date(pathTaken[0].timestamp).getTime()) / 1000)
        : 0
    }

    const attemptDoc = await addDoc(attemptRef, attempt)

    // Award XP
    const multiplier = getStreakMultiplier(profile.currentStreak, config)
    const scoreMultiplier = Math.max(0.5, scorePercentage / 100) // 0.5x to 1x based on score
    const xp = Math.floor(config.xpPerScenarioComplete * multiplier * scoreMultiplier)

    const xpResult = await addUserXP(userId, xp, 'scenario', scenarioId)

    // Update streak
    await updateStreak(userId)

    // Update profile
    await updateUserGamificationProfile(userId, {
      completedScenarioIds: arrayUnion(scenarioId)
    })

    // Log activity
    await logActivity(userId, 'scenario_complete', {
      scenarioId,
      scenarioTitle: scenario.title,
      score: totalScore,
      scorePercentage,
      xpEarned: xpResult.xpAdded
    })

    // Check for badges
    const badges = await checkAndAwardBadges(userId, organizationId, {
      scenarioScore: scorePercentage
    })

    return {
      attemptId: attemptDoc.id,
      score: totalScore,
      maxScore: scenario.maxScore,
      scorePercentage,
      decisionsAnalysis,
      xpEarned: xpResult.xpAdded,
      badgesEarned: badges
    }
  } catch (error) {
    logger.error('Error submitting scenario attempt:', error)
    throw error
  }
}

/**
 * Get user's scenario attempts
 */
export async function getUserScenarioAttempts(userId, scenarioId = null) {
  try {
    const attemptsRef = collection(db, 'users', userId, 'scenarioAttempts')
    let q = query(attemptsRef, orderBy('completedAt', 'desc'))

    if (scenarioId) {
      q = query(attemptsRef, where('scenarioId', '==', scenarioId), orderBy('completedAt', 'desc'))
    }

    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error getting user scenario attempts:', error)
    throw error
  }
}

// ============================================
// READINESS CHECK-INS
// ============================================

/**
 * Get readiness categories
 */
export async function getReadinessCategories(organizationId) {
  try {
    const categoriesRef = collection(db, 'organizations', organizationId, 'readinessCategories')
    const q = query(categoriesRef, orderBy('order'))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      // Return defaults
      return getDefaultReadinessCategories()
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error getting readiness categories:', error)
    throw error
  }
}

/**
 * Get default readiness categories (IMSAFE-based)
 */
export function getDefaultReadinessCategories() {
  return [
    {
      id: 'physical',
      name: 'Physical Readiness',
      icon: 'activity',
      order: 1,
      weight: 0.25,
      factors: [
        { id: 'sleep', name: 'Sleep Duration', question: 'How many hours of sleep did you get?', type: 'slider', min: 0, max: 12, optimalMin: 7, optimalMax: 9, weight: 0.35 },
        { id: 'energy', name: 'Energy Level', question: 'How would you rate your energy level?', type: 'scale', min: 1, max: 5, optimalMin: 4, optimalMax: 5, weight: 0.25 },
        { id: 'illness', name: 'Illness', question: 'Any illness symptoms?', type: 'select', options: ['None', 'Mild', 'Moderate'], optimalValue: 'None', weight: 0.25 },
        { id: 'hydration', name: 'Hydration', question: 'How is your hydration?', type: 'scale', min: 1, max: 5, optimalMin: 4, optimalMax: 5, weight: 0.15 }
      ]
    },
    {
      id: 'mental',
      name: 'Mental Readiness',
      icon: 'brain',
      order: 2,
      weight: 0.25,
      factors: [
        { id: 'stress', name: 'Stress Level', question: 'How stressed are you feeling?', type: 'scale', min: 1, max: 5, optimalMin: 1, optimalMax: 2, weight: 0.35, inverted: true },
        { id: 'focus', name: 'Focus', question: 'How focused do you feel?', type: 'scale', min: 1, max: 5, optimalMin: 4, optimalMax: 5, weight: 0.35 },
        { id: 'emotional', name: 'Emotional State', question: 'How is your emotional state?', type: 'select', options: ['Stable', 'Slightly off', 'Distressed'], optimalValue: 'Stable', weight: 0.30 }
      ]
    },
    {
      id: 'fatigue',
      name: 'Fatigue Management',
      icon: 'moon',
      order: 3,
      weight: 0.25,
      factors: [
        { id: 'rest_quality', name: 'Rest Quality', question: 'How restful was your sleep?', type: 'scale', min: 1, max: 5, optimalMin: 4, optimalMax: 5, weight: 0.40 },
        { id: 'duty_hours', name: 'Recent Duty Hours', question: 'Hours worked in last 24h?', type: 'slider', min: 0, max: 16, optimalMin: 0, optimalMax: 8, weight: 0.30, inverted: true },
        { id: 'fatigue_level', name: 'Current Fatigue', question: 'How fatigued do you feel?', type: 'scale', min: 1, max: 5, optimalMin: 1, optimalMax: 2, weight: 0.30, inverted: true }
      ]
    },
    {
      id: 'substance',
      name: 'Substance Status',
      icon: 'pill',
      order: 4,
      weight: 0.10,
      factors: [
        { id: 'alcohol', name: 'Alcohol', question: 'Hours since last alcohol?', type: 'slider', min: 0, max: 48, optimalMin: 12, optimalMax: 48, weight: 0.50 },
        { id: 'medication', name: 'Medication', question: 'Any impairing medication?', type: 'select', options: ['None', 'Non-impairing only', 'Potentially impairing'], optimalValue: 'None', weight: 0.50 }
      ]
    },
    {
      id: 'environment',
      name: 'Environmental Preparedness',
      icon: 'cloud',
      order: 5,
      weight: 0.15,
      factors: [
        { id: 'weather_aware', name: 'Weather Awareness', question: 'Have you checked today\'s weather?', type: 'boolean', optimalValue: true, weight: 0.35 },
        { id: 'gear_ready', name: 'Gear Ready', question: 'Is your gear ready?', type: 'boolean', optimalValue: true, weight: 0.35 },
        { id: 'route_planned', name: 'Route Planned', question: 'Is your route/site planned?', type: 'boolean', optimalValue: true, weight: 0.30 }
      ]
    }
  ]
}

/**
 * Submit readiness check-in
 */
export async function submitReadinessCheckIn(userId, responses, organizationId) {
  try {
    const categories = await getReadinessCategories(organizationId)
    const config = await getGamificationConfig(organizationId)
    const profile = await getUserGamificationProfile(userId)

    // Calculate scores
    const categoryScores = {}
    let overallScore = 0

    for (const category of categories) {
      let categoryScore = 0
      let totalWeight = 0

      for (const factor of category.factors) {
        const response = responses[factor.id]
        if (response !== undefined) {
          const factorScore = calculateFactorScore(factor, response)
          categoryScore += factorScore * factor.weight
          totalWeight += factor.weight
        }
      }

      if (totalWeight > 0) {
        categoryScores[category.id] = Math.round((categoryScore / totalWeight) * 100)
        overallScore += categoryScores[category.id] * category.weight
      }
    }

    overallScore = Math.round(overallScore)

    // Determine if flagged for self-care
    const flaggedForSelfCare = overallScore < config.readinessLowThreshold

    // Save check-in
    const today = new Date().toISOString().split('T')[0]
    const checkInsRef = collection(db, 'users', userId, 'readinessCheckIns')

    const checkIn = {
      date: today,
      overallScore,
      categoryScores,
      factorResponses: responses,
      flaggedForSelfCare,
      createdAt: serverTimestamp()
    }

    const checkInDoc = await addDoc(checkInsRef, checkIn)

    // Award XP
    const multiplier = getStreakMultiplier(profile.readinessCheckInStreak, config)
    const xp = Math.floor(config.xpPerReadinessCheckIn * multiplier)
    const xpResult = await addUserXP(userId, xp, 'readiness_checkin', checkInDoc.id)

    // Update readiness streak
    const lastCheckIn = await getLastReadinessCheckIn(userId)
    let newStreak = 1

    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn.date)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        newStreak = profile.readinessCheckInStreak + 1
      } else if (diffDays === 0) {
        newStreak = profile.readinessCheckInStreak
      }
    }

    // Update profile
    await updateUserGamificationProfile(userId, {
      readinessCheckInStreak: newStreak,
      averageReadinessScore: Math.round(
        ((profile.averageReadinessScore || overallScore) + overallScore) / 2
      )
    })

    // Update main streak too
    await updateStreak(userId)

    // Log activity
    await logActivity(userId, 'readiness_checkin', {
      checkInId: checkInDoc.id,
      overallScore,
      xpEarned: xpResult.xpAdded
    })

    // Check for badges
    const badges = await checkAndAwardBadges(userId, organizationId)

    return {
      checkInId: checkInDoc.id,
      overallScore,
      categoryScores,
      flaggedForSelfCare,
      xpEarned: xpResult.xpAdded,
      streak: newStreak,
      badgesEarned: badges
    }
  } catch (error) {
    logger.error('Error submitting readiness check-in:', error)
    throw error
  }
}

/**
 * Calculate factor score (0-1)
 */
function calculateFactorScore(factor, response) {
  switch (factor.type) {
    case 'slider':
    case 'scale': {
      const value = Number(response)
      const range = factor.max - factor.min
      const optimalRange = factor.optimalMax - factor.optimalMin

      if (value >= factor.optimalMin && value <= factor.optimalMax) {
        return 1.0
      }

      if (factor.inverted) {
        // Lower is better
        if (value < factor.optimalMin) return 1.0
        const excess = value - factor.optimalMax
        const maxExcess = factor.max - factor.optimalMax
        return Math.max(0, 1 - (excess / maxExcess))
      } else {
        // Higher is better
        if (value > factor.optimalMax) return 1.0
        if (value < factor.optimalMin) {
          const deficit = factor.optimalMin - value
          const maxDeficit = factor.optimalMin - factor.min
          return Math.max(0, 1 - (deficit / maxDeficit))
        }
      }
      return 0.5
    }

    case 'select': {
      if (response === factor.optimalValue) return 1.0
      const options = factor.options || []
      const index = options.indexOf(response)
      if (index === -1) return 0
      return 1 - (index / (options.length - 1))
    }

    case 'boolean':
      return response === factor.optimalValue ? 1.0 : 0.0

    default:
      return 0.5
  }
}

/**
 * Get last readiness check-in
 */
async function getLastReadinessCheckIn(userId) {
  try {
    const checkInsRef = collection(db, 'users', userId, 'readinessCheckIns')
    const q = query(checkInsRef, orderBy('createdAt', 'desc'), limit(1))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  } catch (error) {
    logger.error('Error getting last readiness check-in:', error)
    return null
  }
}

/**
 * Get readiness check-in history
 */
export async function getReadinessHistory(userId, days = 30) {
  try {
    const checkInsRef = collection(db, 'users', userId, 'readinessCheckIns')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const q = query(
      checkInsRef,
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error getting readiness history:', error)
    throw error
  }
}

/**
 * Get today's readiness check-in
 */
export async function getTodayReadinessCheckIn(userId) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const checkInsRef = collection(db, 'users', userId, 'readinessCheckIns')
    const q = query(checkInsRef, where('date', '==', today), limit(1))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  } catch (error) {
    logger.error('Error getting today\'s readiness check-in:', error)
    return null
  }
}

// ============================================
// ACTIVITY LOG (AUDIT TRAIL)
// ============================================

/**
 * Log activity
 */
export async function logActivity(userId, type, details = {}) {
  try {
    const logRef = collection(db, 'users', userId, 'activityLog')
    await addDoc(logRef, {
      type,
      details,
      timestamp: serverTimestamp(),
      sessionId: getSessionId()
    })
  } catch (error) {
    logger.error('Error logging activity:', error)
    // Don't throw - logging shouldn't break main flow
  }
}

/**
 * Get activity log
 */
export async function getActivityLog(userId, filters = {}) {
  try {
    const logRef = collection(db, 'users', userId, 'activityLog')
    let q = query(logRef, orderBy('timestamp', 'desc'))

    if (filters.type) {
      q = query(logRef, where('type', '==', filters.type), orderBy('timestamp', 'desc'))
    }

    if (filters.limit) {
      q = query(q, limit(filters.limit))
    }

    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error getting activity log:', error)
    throw error
  }
}

/**
 * Get or create session ID
 */
function getSessionId() {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('gamification_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('gamification_session_id', sessionId)
    }
    return sessionId
  }
  return `server_${Date.now()}`
}

// ============================================
// LEADERBOARD
// ============================================

/**
 * Get leaderboard
 */
export async function getLeaderboard(organizationId, period = 'allTime', limitCount = 10) {
  try {
    // This would typically query a denormalized leaderboard collection
    // For now, we'll aggregate from user profiles
    // In production, use Cloud Functions to maintain a real-time leaderboard

    const usersRef = collection(db, 'users')
    // Note: This is simplified - in production, filter by organization
    const q = query(usersRef, orderBy('gamificationProfile.totalXP', 'desc'), limit(limitCount))

    // This query structure won't work directly - would need restructuring
    // Placeholder for leaderboard implementation
    return []
  } catch (error) {
    logger.error('Error getting leaderboard:', error)
    throw error
  }
}

// ============================================
// SAFETY CULTURE SCORE
// ============================================

/**
 * Calculate safety culture score
 */
export async function calculateSafetyCultureScore(userId, organizationId) {
  try {
    const profile = await getUserGamificationProfile(userId)
    const tracks = await getQuestTracks(organizationId)

    // Get total quest count
    let totalQuests = 0
    for (const track of tracks) {
      const quests = await getQuestsForTrack(organizationId, track.id)
      totalQuests += quests.length
    }

    const weights = {
      questProgress: 0.25,
      quizAccuracy: 0.20,
      scenarioPerformance: 0.20,
      readinessConsistency: 0.20,
      engagement: 0.15
    }

    const scores = {
      questProgress: totalQuests > 0
        ? ((profile.completedQuestIds?.length || 0) / totalQuests) * 100
        : 0,
      quizAccuracy: profile.averageQuizScore || 0,
      scenarioPerformance: profile.averageScenarioScore || 0,
      readinessConsistency: Math.min((profile.readinessCheckInStreak || 0) / 30, 1) * 100,
      engagement: calculateEngagementScore(profile)
    }

    const safetyCultureScore = Math.round(
      Object.keys(weights).reduce((total, key) => {
        return total + (scores[key] * weights[key])
      }, 0)
    )

    // Update profile
    await updateUserGamificationProfile(userId, { safetyCultureScore })

    return {
      overall: safetyCultureScore,
      breakdown: scores
    }
  } catch (error) {
    logger.error('Error calculating safety culture score:', error)
    throw error
  }
}

/**
 * Calculate engagement score
 */
function calculateEngagementScore(profile) {
  if (!profile.lastActivityDate) return 0

  const lastActivity = new Date(profile.lastActivityDate)
  const now = new Date()
  const daysSinceActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24))

  if (daysSinceActivity === 0) return 100
  if (daysSinceActivity <= 1) return 90
  if (daysSinceActivity <= 3) return 70
  if (daysSinceActivity <= 7) return 50
  if (daysSinceActivity <= 14) return 30
  if (daysSinceActivity <= 30) return 10
  return 0
}

// ============================================
// CONTENT SOURCES & CHUNKS
// ============================================

/**
 * Get content sources
 */
export async function getContentSources(organizationId, type = null) {
  try {
    const sourcesRef = collection(db, 'organizations', organizationId, 'contentSources')
    let q = query(sourcesRef, where('isActive', '==', true))

    if (type) {
      q = query(q, where('type', '==', type))
    }

    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error getting content sources:', error)
    throw error
  }
}

/**
 * Get content chunks for a source
 */
export async function getContentChunks(organizationId, sourceId) {
  try {
    const chunksRef = collection(db, 'organizations', organizationId, 'contentChunks')
    const q = query(chunksRef, where('sourceId', '==', sourceId), orderBy('chunkIndex'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error getting content chunks:', error)
    throw error
  }
}

/**
 * Search content chunks by topic/keywords
 */
export async function searchContentChunks(organizationId, keywords, limitCount = 10) {
  try {
    // Note: Full-text search would require Algolia/Typesense integration
    // This is a simplified keyword-based search
    const chunksRef = collection(db, 'organizations', organizationId, 'contentChunks')
    const q = query(
      chunksRef,
      where('metadata.keywords', 'array-contains-any', keywords),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error searching content chunks:', error)
    throw error
  }
}

// ============================================
// SPACED REPETITION
// ============================================

/**
 * Get items due for spaced repetition review
 */
export async function getSpacedRepetitionDue(userId) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const queueRef = collection(db, 'users', userId, 'spacedRepetitionQueue')
    const q = query(
      queueRef,
      where('nextReviewDate', '<=', today),
      orderBy('nextReviewDate'),
      limit(10)
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    logger.error('Error getting spaced repetition due items:', error)
    throw error
  }
}

/**
 * Update spaced repetition item after review
 * Using SM-2 algorithm
 */
export async function updateSpacedRepetitionItem(userId, itemId, quality) {
  // quality: 0-5 (0-2 = failed, 3 = correct with difficulty, 4-5 = correct easily)
  try {
    const itemRef = doc(db, 'users', userId, 'spacedRepetitionQueue', itemId)
    const itemSnap = await getDoc(itemRef)

    if (!itemSnap.exists()) return null

    const item = itemSnap.data()

    // SM-2 algorithm
    let { easeFactor, repetitions, interval } = item

    if (quality < 3) {
      // Failed - reset
      repetitions = 0
      interval = 1
    } else {
      // Passed
      if (repetitions === 0) {
        interval = 1
      } else if (repetitions === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * easeFactor)
      }
      repetitions += 1
    }

    // Update ease factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    easeFactor = Math.max(1.3, easeFactor)

    // Calculate next review date
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + interval)

    await updateDoc(itemRef, {
      easeFactor,
      repetitions,
      interval,
      nextReviewDate: nextReviewDate.toISOString().split('T')[0],
      lastReviewedAt: serverTimestamp()
    })

    return {
      easeFactor,
      repetitions,
      interval,
      nextReviewDate: nextReviewDate.toISOString().split('T')[0]
    }
  } catch (error) {
    logger.error('Error updating spaced repetition item:', error)
    throw error
  }
}

/**
 * Add item to spaced repetition queue
 */
export async function addToSpacedRepetition(userId, contentType, contentId) {
  try {
    const queueRef = collection(db, 'users', userId, 'spacedRepetitionQueue')

    // Check if already exists
    const q = query(
      queueRef,
      where('contentType', '==', contentType),
      where('contentId', '==', contentId),
      limit(1)
    )
    const existing = await getDocs(q)

    if (!existing.empty) {
      return existing.docs[0].id
    }

    // Add new item
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const newItem = await addDoc(queueRef, {
      contentType,
      contentId,
      nextReviewDate: tomorrow.toISOString().split('T')[0],
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      createdAt: serverTimestamp()
    })

    return newItem.id
  } catch (error) {
    logger.error('Error adding to spaced repetition:', error)
    throw error
  }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to user gamification profile updates
 */
export function subscribeToGamificationProfile(userId, callback) {
  const profileRef = doc(db, 'users', userId, 'gamificationProfile', 'default')

  return onSnapshot(profileRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() })
    } else {
      callback(null)
    }
  }, (error) => {
    logger.error('Error in gamification profile subscription:', error)
  })
}

/**
 * Subscribe to quest progress updates
 */
export function subscribeToQuestProgress(userId, callback) {
  const progressRef = collection(db, 'users', userId, 'questProgress')

  return onSnapshot(progressRef, (snapshot) => {
    const progress = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(progress)
  }, (error) => {
    logger.error('Error in quest progress subscription:', error)
  })
}

export default {
  // Config
  getGamificationConfig,
  getDefaultGamificationConfig,
  updateGamificationConfig,

  // User Profile
  getUserGamificationProfile,
  createDefaultGamificationProfile,
  updateUserGamificationProfile,
  addUserXP,
  calculateLevel,
  getLevelTitle,
  getXPForNextLevel,

  // Streaks
  updateStreak,
  getStreakMultiplier,

  // Badges
  getBadgeDefinitions,
  awardBadge,
  checkAndAwardBadges,

  // Quest Tracks & Quests
  getQuestTracks,
  getQuestsForTrack,
  getQuest,
  getLessonsForQuest,
  getQuizForQuest,

  // User Quest Progress
  getUserQuestProgress,
  getAllUserQuestProgress,
  updateQuestProgress,
  markLessonComplete,
  submitQuizAttempt,

  // Scenarios
  getScenarios,
  getScenarioWithNodes,
  submitScenarioAttempt,
  getUserScenarioAttempts,

  // Readiness
  getReadinessCategories,
  getDefaultReadinessCategories,
  submitReadinessCheckIn,
  getReadinessHistory,
  getTodayReadinessCheckIn,

  // Activity Log
  logActivity,
  getActivityLog,

  // Leaderboard
  getLeaderboard,

  // Safety Culture Score
  calculateSafetyCultureScore,

  // Content
  getContentSources,
  getContentChunks,
  searchContentChunks,

  // Spaced Repetition
  getSpacedRepetitionDue,
  updateSpacedRepetitionItem,
  addToSpacedRepetition,

  // Subscriptions
  subscribeToGamificationProfile,
  subscribeToQuestProgress
}
