/**
 * XP Display Component
 * Shows user's XP, level, and progress to next level
 */

import { useMemo } from 'react'
import { TrendingUp, Star, Zap } from 'lucide-react'
import { getLevelProgress, getLevelTitle } from '../../../lib/gamificationEngine'

export default function XPDisplay({
  totalXP = 0,
  showLevel = true,
  showProgress = true,
  showTitle = false,
  size = 'md',
  className = ''
}) {
  const progress = useMemo(() => getLevelProgress(totalXP), [totalXP])

  const sizeClasses = {
    sm: {
      container: 'text-sm',
      xp: 'text-lg font-bold',
      icon: 'w-4 h-4',
      progress: 'h-1.5'
    },
    md: {
      container: 'text-base',
      xp: 'text-2xl font-bold',
      icon: 'w-5 h-5',
      progress: 'h-2'
    },
    lg: {
      container: 'text-lg',
      xp: 'text-3xl font-bold',
      icon: 'w-6 h-6',
      progress: 'h-3'
    }
  }

  const sizes = sizeClasses[size] || sizeClasses.md

  return (
    <div className={`${sizes.container} ${className}`}>
      <div className="flex items-center gap-3">
        {showLevel && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full">
            <Star className={sizes.icon} />
            <span className="font-semibold">Level {progress.level}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-amber-600">
          <Zap className={`${sizes.icon} fill-current`} />
          <span className={sizes.xp}>{totalXP.toLocaleString()}</span>
          <span className="text-amber-500 text-sm">XP</span>
        </div>
      </div>

      {showTitle && (
        <p className="text-gray-600 mt-1">{progress.title}</p>
      )}

      {showProgress && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{progress.xpInCurrentLevel.toLocaleString()} XP</span>
            <span>{progress.xpNeededForNext.toLocaleString()} XP to Level {progress.level + 1}</span>
          </div>
          <div className={`w-full bg-gray-200 rounded-full ${sizes.progress} overflow-hidden`}>
            <div
              className={`bg-gradient-to-r from-purple-500 to-indigo-500 ${sizes.progress} rounded-full transition-all duration-500`}
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact XP badge for inline display
 */
export function XPBadge({ amount, animated = true, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium
        bg-amber-100 text-amber-700
        ${animated ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <Zap className="w-3.5 h-3.5 fill-current" />
      +{amount} XP
    </span>
  )
}

/**
 * XP gain animation overlay
 */
export function XPGainAnimation({ amount, onComplete }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
      onAnimationEnd={onComplete}
    >
      <div className="animate-bounce-up text-4xl font-bold text-amber-500 drop-shadow-lg flex items-center gap-2">
        <Zap className="w-10 h-10 fill-current" />
        +{amount} XP
      </div>
    </div>
  )
}

/**
 * Level progress bar for compact display
 */
export function LevelProgress({ currentLevel, xpInLevel, xpToNextLevel, className = '' }) {
  const progressPercent = xpToNextLevel > 0 ? Math.min(100, (xpInLevel / xpToNextLevel) * 100) : 0

  return (
    <div className={`flex-1 ${className}`}>
      <div className="flex justify-between text-xs text-purple-100 mb-1">
        <span>Level {currentLevel}</span>
        <span>{Math.round(progressPercent)}%</span>
      </div>
      <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
        <div
          className="bg-white h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Level up celebration
 */
export function LevelUpCelebration({ newLevel, newTitle, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
          <Star className="w-10 h-10 text-white fill-current" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Level Up!</h2>
        <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Level {newLevel}
        </p>
        <p className="text-gray-600 mb-6">{newTitle}</p>

        <button
          onClick={onClose}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
