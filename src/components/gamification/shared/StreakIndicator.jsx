/**
 * Streak Indicator Component
 * Shows current streak, streak status, and bonus multiplier
 */

import { Flame, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { getStreakTierName } from '../../../lib/gamificationEngine'

export default function StreakIndicator({
  currentStreak = 0,
  longestStreak = 0,
  multiplier = 1,
  protectionsRemaining = 0,
  streakAtRisk = false,
  completedToday = false,
  size = 'md',
  showDetails = true,
  className = ''
}) {
  const sizeClasses = {
    sm: {
      container: 'text-sm',
      icon: 'w-4 h-4',
      streak: 'text-lg'
    },
    md: {
      container: 'text-base',
      icon: 'w-5 h-5',
      streak: 'text-2xl'
    },
    lg: {
      container: 'text-lg',
      icon: 'w-6 h-6',
      streak: 'text-3xl'
    }
  }

  const sizes = sizeClasses[size] || sizeClasses.md
  const tierName = getStreakTierName(currentStreak)

  const getFlameColor = () => {
    if (currentStreak === 0) return 'text-gray-400'
    if (streakAtRisk && !completedToday) return 'text-orange-500 animate-pulse'
    if (currentStreak >= 30) return 'text-red-500'
    if (currentStreak >= 7) return 'text-orange-500'
    return 'text-amber-500'
  }

  return (
    <div className={`${sizes.container} ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 ${getFlameColor()}`}>
          <Flame className={`${sizes.icon} ${currentStreak > 0 ? 'fill-current' : ''}`} />
          <span className={`${sizes.streak} font-bold`}>{currentStreak}</span>
          <span className="text-gray-500 text-sm">day{currentStreak !== 1 ? 's' : ''}</span>
        </div>

        {multiplier > 1 && (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            {multiplier}x XP
          </span>
        )}

        {completedToday && (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )}
      </div>

      {showDetails && (
        <div className="mt-2 space-y-1">
          {streakAtRisk && !completedToday && (
            <div className="flex items-center gap-2 text-orange-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Complete an activity to keep your streak!</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            {longestStreak > 0 && (
              <span>Best: {longestStreak} days</span>
            )}

            {protectionsRemaining > 0 && (
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>{protectionsRemaining} protection{protectionsRemaining !== 1 ? 's' : ''}</span>
              </div>
            )}

            {currentStreak > 0 && (
              <span className="text-purple-600 font-medium">{tierName}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact streak badge for inline display
 */
export function StreakBadge({ streak, className = '' }) {
  if (streak === 0) return null

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium
        ${streak >= 30 ? 'bg-red-100 text-red-700' :
          streak >= 7 ? 'bg-orange-100 text-orange-700' :
          'bg-amber-100 text-amber-700'}
        ${className}
      `}
    >
      <Flame className="w-3.5 h-3.5 fill-current" />
      {streak}
    </span>
  )
}

/**
 * Streak calendar view
 */
export function StreakCalendar({ activityDates = [], className = '' }) {
  const today = new Date()
  const days = []

  // Generate last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      hasActivity: activityDates.includes(dateStr),
      isToday: i === 0
    })
  }

  return (
    <div className={className}>
      <div className="text-sm text-gray-500 mb-2">Last 30 days</div>
      <div className="flex gap-1 flex-wrap">
        {days.map((day, index) => (
          <div
            key={day.date}
            className={`
              w-4 h-4 rounded-sm
              ${day.hasActivity
                ? 'bg-green-500'
                : day.isToday
                  ? 'bg-gray-300 ring-2 ring-blue-400'
                  : 'bg-gray-200'
              }
            `}
            title={`${day.date}${day.hasActivity ? ' - Active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Streak milestone progress
 */
export function StreakMilestoneProgress({ currentStreak, className = '' }) {
  const milestones = [7, 14, 30, 60, 90]
  const nextMilestone = milestones.find(m => m > currentStreak) || milestones[milestones.length - 1]
  const prevMilestone = milestones.filter(m => m <= currentStreak).pop() || 0
  const progress = ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100

  return (
    <div className={className}>
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>{prevMilestone} days</span>
        <span>{nextMilestone} days</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="flex justify-center mt-2">
        <span className="text-sm text-gray-600">
          {nextMilestone - currentStreak} day{nextMilestone - currentStreak !== 1 ? 's' : ''} to next milestone
        </span>
      </div>
    </div>
  )
}
