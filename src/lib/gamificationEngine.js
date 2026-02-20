/**
 * Gamification Engine
 * Core game mechanics: XP calculation, level progression, streak bonuses,
 * badge evaluation, and Safety Culture Score computation
 */

import {
  getUserGamificationProfile,
  getGamificationConfig,
  getStreakMultiplier,
  calculateLevel,
  getLevelTitle,
  getXPForNextLevel
} from './firestoreGamification'

// ============================================
// XP CALCULATION
// ============================================

/**
 * Calculate XP for a lesson completion
 */
export function calculateLessonXP(config, streakDays, lessonDuration = 'normal') {
  const baseXP = config.xpPerLessonComplete || 25

  // Duration multiplier
  const durationMultiplier = {
    short: 0.75,
    normal: 1.0,
    long: 1.25
  }[lessonDuration] || 1.0

  // Streak bonus
  const streakMultiplier = getStreakMultiplier(streakDays, config)

  return Math.floor(baseXP * durationMultiplier * streakMultiplier)
}

/**
 * Calculate XP for quiz performance
 */
export function calculateQuizXP(config, streakDays, correctCount, totalQuestions, isFirstTry = false) {
  let totalXP = 0

  // XP per correct answer
  const perCorrectXP = isFirstTry
    ? (config.xpPerQuizCorrectFirstTry || 15)
    : (config.xpPerQuizCorrect || 10)

  totalXP += correctCount * perCorrectXP

  // Perfect quiz bonus
  if (correctCount === totalQuestions) {
    totalXP += config.xpPerPerfectQuiz || 50
  }

  // Apply streak multiplier
  const streakMultiplier = getStreakMultiplier(streakDays, config)

  return Math.floor(totalXP * streakMultiplier)
}

/**
 * Calculate XP for scenario completion
 */
export function calculateScenarioXP(config, streakDays, scorePercentage) {
  const baseXP = config.xpPerScenarioComplete || 150

  // Score multiplier (0.5x to 1.5x based on performance)
  const scoreMultiplier = 0.5 + (scorePercentage / 100)

  // Streak bonus
  const streakMultiplier = getStreakMultiplier(streakDays, config)

  return Math.floor(baseXP * scoreMultiplier * streakMultiplier)
}

/**
 * Calculate XP for readiness check-in
 */
export function calculateReadinessXP(config, checkInStreak) {
  const baseXP = config.xpPerReadinessCheckIn || 15

  // Readiness has its own streak bonus (doubled)
  const streakMultiplier = getStreakMultiplier(checkInStreak, config)

  return Math.floor(baseXP * streakMultiplier)
}

// ============================================
// LEVEL PROGRESSION
// ============================================

/**
 * Get level progress details
 */
export function getLevelProgress(totalXP) {
  const level = calculateLevel(totalXP)
  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getXPForNextLevel(level)
  const xpInCurrentLevel = totalXP - currentLevelXP
  const xpNeededForNext = nextLevelXP - currentLevelXP
  const progressPercent = Math.round((xpInCurrentLevel / xpNeededForNext) * 100)

  return {
    level,
    title: getLevelTitle(level),
    totalXP,
    currentLevelXP,
    nextLevelXP,
    xpInCurrentLevel,
    xpNeededForNext,
    progressPercent
  }
}

/**
 * Get XP required to reach a specific level
 */
function getXPForLevel(level) {
  const thresholds = [
    0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
    4000, 5000, 6200, 7600, 9200, 11000, 13000, 15200, 17600, 20200
  ]

  if (level <= 0) return 0
  if (level <= thresholds.length) return thresholds[level - 1]

  // For high levels, use formula
  return 20200 + (level - 20) * 3000
}

/**
 * Check if level up occurred
 */
export function checkLevelUp(previousXP, newXP) {
  const previousLevel = calculateLevel(previousXP)
  const newLevel = calculateLevel(newXP)

  if (newLevel > previousLevel) {
    return {
      leveledUp: true,
      previousLevel,
      newLevel,
      newTitle: getLevelTitle(newLevel)
    }
  }

  return { leveledUp: false }
}

// ============================================
// STREAK MECHANICS
// ============================================

/**
 * Get streak status and info
 */
export function getStreakInfo(profile, config) {
  const { currentStreak, longestStreak, streakProtectionsRemaining, lastActivityDate } = profile

  const multiplier = getStreakMultiplier(currentStreak, config)
  const nextMilestone = getNextStreakMilestone(currentStreak)
  const daysToMilestone = nextMilestone - currentStreak

  // Calculate if streak is at risk
  const today = new Date().toISOString().split('T')[0]
  const lastDate = lastActivityDate ? new Date(lastActivityDate) : null
  const todayDate = new Date(today)

  let streakAtRisk = false
  let streakBroken = false

  if (lastDate) {
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      streakAtRisk = true // Need to do activity today
    } else if (diffDays > 1) {
      if (diffDays === 2 && streakProtectionsRemaining > 0) {
        streakAtRisk = true // Can use protection
      } else {
        streakBroken = true
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    multiplier,
    multiplierLabel: `${multiplier}x XP`,
    nextMilestone,
    daysToMilestone,
    protectionsRemaining: streakProtectionsRemaining,
    streakAtRisk,
    streakBroken,
    completedToday: lastActivityDate === today
  }
}

/**
 * Get next streak milestone
 */
function getNextStreakMilestone(currentStreak) {
  const milestones = [7, 14, 30, 60, 90, 180, 365]

  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return milestone
    }
  }

  // Beyond 365, next milestone is next year
  return Math.ceil(currentStreak / 365) * 365 + 365
}

/**
 * Get streak bonus tier name
 */
export function getStreakTierName(streakDays) {
  if (streakDays >= 365) return 'Legendary'
  if (streakDays >= 90) return 'Epic'
  if (streakDays >= 30) return 'Rare'
  if (streakDays >= 14) return 'Uncommon'
  if (streakDays >= 7) return 'Common'
  return 'Starting'
}

// ============================================
// BADGE EVALUATION
// ============================================

/**
 * Badge criteria types and evaluation
 */
export const BADGE_CRITERIA_TYPES = {
  QUEST_COMPLETE: 'quest_complete',
  TRACK_COMPLETE: 'track_complete',
  STREAK: 'streak',
  XP_TOTAL: 'xp_total',
  QUESTS_COUNT: 'quests_completed_count',
  SCENARIOS_COUNT: 'scenarios_completed_count',
  PERFECT_QUIZ: 'perfect_quiz',
  SCENARIO_SCORE: 'scenario_score',
  READINESS_STREAK: 'readiness_streak',
  LEVEL: 'level',
  LESSONS_COUNT: 'lessons_count',
  ACCURACY: 'quiz_accuracy'
}

/**
 * Get badge rarity color
 */
export function getBadgeRarityColor(rarity) {
  const colors = {
    common: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
    uncommon: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' },
    rare: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
    epic: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300' },
    legendary: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300' }
  }

  return colors[rarity] || colors.common
}

/**
 * Get default badge definitions
 */
export function getDefaultBadgeDefinitions() {
  return [
    // Quest Badges
    {
      id: 'first_quest',
      name: 'First Steps',
      description: 'Complete your first quest',
      icon: 'award',
      rarity: 'common',
      category: 'milestone',
      criteria: { type: 'quests_completed_count', threshold: 1 },
      xpBonus: 50
    },
    {
      id: 'quest_master_10',
      name: 'Knowledge Seeker',
      description: 'Complete 10 quests',
      icon: 'book-open',
      rarity: 'uncommon',
      category: 'milestone',
      criteria: { type: 'quests_completed_count', threshold: 10 },
      xpBonus: 200
    },
    {
      id: 'quest_master_25',
      name: 'Safety Scholar',
      description: 'Complete 25 quests',
      icon: 'graduation-cap',
      rarity: 'rare',
      category: 'milestone',
      criteria: { type: 'quests_completed_count', threshold: 25 },
      xpBonus: 500
    },

    // Streak Badges
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: 'flame',
      rarity: 'common',
      category: 'streak',
      criteria: { type: 'streak', threshold: 7 },
      xpBonus: 100
    },
    {
      id: 'streak_30',
      name: 'Monthly Champion',
      description: 'Maintain a 30-day streak',
      icon: 'flame',
      rarity: 'uncommon',
      category: 'streak',
      criteria: { type: 'streak', threshold: 30 },
      xpBonus: 300
    },
    {
      id: 'streak_90',
      name: 'Quarterly Legend',
      description: 'Maintain a 90-day streak',
      icon: 'flame',
      rarity: 'rare',
      category: 'streak',
      criteria: { type: 'streak', threshold: 90 },
      xpBonus: 750
    },
    {
      id: 'streak_365',
      name: 'Year of Safety',
      description: 'Maintain a 365-day streak',
      icon: 'flame',
      rarity: 'legendary',
      category: 'streak',
      criteria: { type: 'streak', threshold: 365 },
      xpBonus: 2500
    },

    // Quiz Badges
    {
      id: 'perfect_quiz',
      name: 'Perfect Score',
      description: 'Get 100% on any quiz',
      icon: 'check-circle',
      rarity: 'common',
      category: 'quiz',
      criteria: { type: 'perfect_quiz' },
      xpBonus: 50
    },
    {
      id: 'accuracy_90',
      name: 'Sharp Mind',
      description: 'Maintain 90%+ quiz accuracy',
      icon: 'target',
      rarity: 'rare',
      category: 'quiz',
      criteria: { type: 'quiz_accuracy', threshold: 90 },
      xpBonus: 300
    },

    // Scenario Badges
    {
      id: 'scenario_first',
      name: 'Decision Maker',
      description: 'Complete your first scenario',
      icon: 'git-branch',
      rarity: 'common',
      category: 'scenario',
      criteria: { type: 'scenarios_completed_count', threshold: 1 },
      xpBonus: 75
    },
    {
      id: 'scenario_perfect',
      name: 'Optimal Path',
      description: 'Get 100% on any scenario',
      icon: 'star',
      rarity: 'uncommon',
      category: 'scenario',
      criteria: { type: 'scenario_score', threshold: 100 },
      xpBonus: 150
    },
    {
      id: 'scenario_master',
      name: 'Crisis Manager',
      description: 'Complete 20 scenarios',
      icon: 'shield',
      rarity: 'rare',
      category: 'scenario',
      criteria: { type: 'scenarios_completed_count', threshold: 20 },
      xpBonus: 500
    },

    // Readiness Badges
    {
      id: 'readiness_7',
      name: 'Self-Aware',
      description: '7-day readiness check-in streak',
      icon: 'heart',
      rarity: 'common',
      category: 'readiness',
      criteria: { type: 'readiness_streak', threshold: 7 },
      xpBonus: 100
    },
    {
      id: 'readiness_30',
      name: 'Consistent Operator',
      description: '30-day readiness check-in streak',
      icon: 'heart',
      rarity: 'uncommon',
      category: 'readiness',
      criteria: { type: 'readiness_streak', threshold: 30 },
      xpBonus: 300
    },
    {
      id: 'readiness_100',
      name: 'Wellness Champion',
      description: 'Log 100 readiness check-ins',
      icon: 'activity',
      rarity: 'rare',
      category: 'readiness',
      criteria: { type: 'readiness_streak', threshold: 100 },
      xpBonus: 500
    },

    // XP Milestones
    {
      id: 'xp_1000',
      name: 'Rising Star',
      description: 'Earn 1,000 XP',
      icon: 'trending-up',
      rarity: 'common',
      category: 'milestone',
      criteria: { type: 'xp_total', threshold: 1000 },
      xpBonus: 100
    },
    {
      id: 'xp_10000',
      name: 'Safety Expert',
      description: 'Earn 10,000 XP',
      icon: 'award',
      rarity: 'rare',
      category: 'milestone',
      criteria: { type: 'xp_total', threshold: 10000 },
      xpBonus: 500
    },
    {
      id: 'xp_50000',
      name: 'Safety Legend',
      description: 'Earn 50,000 XP',
      icon: 'crown',
      rarity: 'legendary',
      category: 'milestone',
      criteria: { type: 'xp_total', threshold: 50000 },
      xpBonus: 2000
    },

    // Level Badges
    {
      id: 'level_10',
      name: 'Professional',
      description: 'Reach Level 10',
      icon: 'user-check',
      rarity: 'uncommon',
      category: 'level',
      criteria: { type: 'level', threshold: 10 },
      xpBonus: 200
    },
    {
      id: 'level_25',
      name: 'Champion',
      description: 'Reach Level 25',
      icon: 'shield',
      rarity: 'rare',
      category: 'level',
      criteria: { type: 'level', threshold: 25 },
      xpBonus: 500
    },
    {
      id: 'level_50',
      name: 'Guardian',
      description: 'Reach Level 50',
      icon: 'shield',
      rarity: 'epic',
      category: 'level',
      criteria: { type: 'level', threshold: 50 },
      xpBonus: 1000
    }
  ]
}

// ============================================
// SAFETY CULTURE SCORE
// ============================================

/**
 * Calculate Safety Culture Score breakdown
 */
export function calculateSafetyCultureScoreBreakdown(profile, totalQuestsCount) {
  const weights = {
    questProgress: 0.25,
    quizAccuracy: 0.20,
    scenarioPerformance: 0.20,
    readinessConsistency: 0.20,
    engagement: 0.15
  }

  const scores = {
    questProgress: totalQuestsCount > 0
      ? ((profile.completedQuestIds?.length || 0) / totalQuestsCount) * 100
      : 0,
    quizAccuracy: profile.totalQuestionsAnswered > 0
      ? (profile.totalCorrectAnswers / profile.totalQuestionsAnswered) * 100
      : 0,
    scenarioPerformance: profile.averageScenarioScore || 0,
    readinessConsistency: Math.min((profile.readinessCheckInStreak || 0) / 30, 1) * 100,
    engagement: calculateEngagementScore(profile.lastActivityDate)
  }

  const overall = Math.round(
    Object.keys(weights).reduce((total, key) => {
      return total + (scores[key] * weights[key])
    }, 0)
  )

  return {
    overall,
    breakdown: scores,
    weights,
    tier: getSafetyCultureTier(overall)
  }
}

/**
 * Calculate engagement score based on activity recency
 */
function calculateEngagementScore(lastActivityDate) {
  if (!lastActivityDate) return 0

  const lastActivity = new Date(lastActivityDate)
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

/**
 * Get Safety Culture tier
 */
export function getSafetyCultureTier(score) {
  if (score >= 90) return { name: 'Exemplary', color: 'text-green-600', bg: 'bg-green-100' }
  if (score >= 75) return { name: 'Strong', color: 'text-blue-600', bg: 'bg-blue-100' }
  if (score >= 60) return { name: 'Developing', color: 'text-yellow-600', bg: 'bg-yellow-100' }
  return { name: 'Needs Attention', color: 'text-orange-600', bg: 'bg-orange-100' }
}

// ============================================
// QUEST TRACK PROGRESS
// ============================================

/**
 * Calculate track progress
 */
export function calculateTrackProgress(track, quests, userProgress) {
  const questProgressMap = new Map(
    userProgress.map(p => [p.questId, p])
  )

  let completedCount = 0
  let inProgressCount = 0
  let totalXPEarned = 0

  for (const quest of quests) {
    const progress = questProgressMap.get(quest.id)
    if (progress?.status === 'completed') {
      completedCount++
      totalXPEarned += progress.xpEarned || 0
    } else if (progress?.status === 'in_progress') {
      inProgressCount++
    }
  }

  const totalQuests = quests.length
  const progressPercent = totalQuests > 0
    ? Math.round((completedCount / totalQuests) * 100)
    : 0

  return {
    trackId: track.id,
    trackName: track.name,
    totalQuests,
    completedCount,
    inProgressCount,
    notStartedCount: totalQuests - completedCount - inProgressCount,
    progressPercent,
    totalXPEarned,
    isComplete: completedCount === totalQuests
  }
}

/**
 * Check if quest is unlocked (prerequisites met)
 */
export function isQuestUnlocked(quest, completedQuestIds) {
  if (!quest.prerequisiteQuestIds || quest.prerequisiteQuestIds.length === 0) {
    return true
  }

  return quest.prerequisiteQuestIds.every(id =>
    completedQuestIds.includes(id)
  )
}

/**
 * Check if track is unlocked (prerequisite tracks completed)
 */
export function isTrackUnlocked(track, completedTrackIds) {
  if (!track.prerequisiteTrackIds || track.prerequisiteTrackIds.length === 0) {
    return true
  }

  return track.prerequisiteTrackIds.every(id =>
    completedTrackIds.includes(id)
  )
}

// ============================================
// LEADERBOARD CALCULATIONS
// ============================================

/**
 * Calculate leaderboard position change
 */
export function calculatePositionChange(currentPosition, previousPosition) {
  if (previousPosition === null || previousPosition === undefined) {
    return { change: 0, direction: 'new' }
  }

  const change = previousPosition - currentPosition

  if (change > 0) {
    return { change, direction: 'up' }
  } else if (change < 0) {
    return { change: Math.abs(change), direction: 'down' }
  }

  return { change: 0, direction: 'same' }
}

/**
 * Get leaderboard time period boundaries
 */
export function getLeaderboardPeriodBounds(period) {
  const now = new Date()

  switch (period) {
    case 'daily':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: now
      }

    case 'weekly':
      const dayOfWeek = now.getDay()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - dayOfWeek)
      weekStart.setHours(0, 0, 0, 0)
      return { start: weekStart, end: now }

    case 'monthly':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      }

    case 'allTime':
    default:
      return {
        start: new Date(0),
        end: now
      }
  }
}

// ============================================
// EXPORT HELPERS FOR COR/SECOR
// ============================================

/**
 * Format activity log for audit export
 */
export function formatActivityForAudit(activities) {
  return activities.map(activity => ({
    date: activity.timestamp?.toDate?.() || new Date(activity.timestamp),
    type: formatActivityType(activity.type),
    details: formatActivityDetails(activity),
    score: activity.details?.score || null,
    xpEarned: activity.details?.xpEarned || 0
  }))
}

/**
 * Format activity type for human reading
 */
function formatActivityType(type) {
  const typeLabels = {
    lesson_complete: 'Lesson Completed',
    quiz_attempt: 'Quiz Attempt',
    quest_complete: 'Quest Completed',
    scenario_complete: 'Scenario Completed',
    readiness_checkin: 'Readiness Check-In',
    badge_earned: 'Badge Earned',
    xp_earned: 'XP Earned'
  }

  return typeLabels[type] || type
}

/**
 * Format activity details for export
 */
function formatActivityDetails(activity) {
  switch (activity.type) {
    case 'lesson_complete':
      return `Completed lesson in quest ${activity.details?.questId}`

    case 'quiz_attempt':
      return `Quiz score: ${activity.details?.score}% (${activity.details?.passed ? 'Passed' : 'Failed'})`

    case 'quest_complete':
      return `Completed quest: ${activity.details?.questName}`

    case 'scenario_complete':
      return `Scenario: ${activity.details?.scenarioTitle}, Score: ${activity.details?.scorePercentage}%`

    case 'readiness_checkin':
      return `Readiness score: ${activity.details?.overallScore}/100`

    case 'badge_earned':
      return `Earned badge: ${activity.details?.badgeName}`

    default:
      return JSON.stringify(activity.details)
  }
}

/**
 * Generate training summary for COR/SECOR audit
 */
export function generateTrainingSummary(profile, activities, questProgress) {
  const completedQuests = questProgress.filter(p => p.status === 'completed')

  return {
    userId: profile.userId,
    generatedAt: new Date().toISOString(),
    summary: {
      totalXP: profile.totalXP,
      level: profile.level,
      levelTitle: getLevelTitle(profile.level),
      safetyCultureScore: profile.safetyCultureScore,
      totalLessonsCompleted: profile.totalLessonsCompleted,
      totalQuestsCompleted: completedQuests.length,
      totalScenariosCompleted: profile.completedScenarioIds?.length || 0,
      averageQuizScore: profile.averageQuizScore,
      averageScenarioScore: profile.averageScenarioScore,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      badgesEarned: profile.badgeIds?.length || 0
    },
    completedQuests: completedQuests.map(q => ({
      questId: q.questId,
      completedAt: q.completedAt,
      bestQuizScore: q.bestQuizScore,
      xpEarned: q.xpEarned
    })),
    recentActivity: formatActivityForAudit(activities.slice(0, 50))
  }
}

export default {
  // XP Calculation
  calculateLessonXP,
  calculateQuizXP,
  calculateScenarioXP,
  calculateReadinessXP,

  // Level Progression
  getLevelProgress,
  checkLevelUp,

  // Streak Mechanics
  getStreakInfo,
  getStreakTierName,

  // Badges
  BADGE_CRITERIA_TYPES,
  getBadgeRarityColor,
  getDefaultBadgeDefinitions,

  // Safety Culture Score
  calculateSafetyCultureScoreBreakdown,
  getSafetyCultureTier,

  // Quest Progress
  calculateTrackProgress,
  isQuestUnlocked,
  isTrackUnlocked,

  // Leaderboard
  calculatePositionChange,
  getLeaderboardPeriodBounds,

  // Audit Export
  formatActivityForAudit,
  generateTrainingSummary
}
