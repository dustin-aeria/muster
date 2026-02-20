/**
 * Badge Display Components
 * Shows earned badges, badge details, and badge gallery
 */

import { useState } from 'react'
import {
  Award, Flame, Star, Shield, Target, Heart, TrendingUp,
  CheckCircle, BookOpen, GitBranch, Zap, Crown, X
} from 'lucide-react'
import { getBadgeRarityColor } from '../../../lib/gamificationEngine'

/**
 * Icon mapping for badges
 */
const BADGE_ICONS = {
  award: Award,
  flame: Flame,
  star: Star,
  shield: Shield,
  target: Target,
  heart: Heart,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle,
  'book-open': BookOpen,
  'git-branch': GitBranch,
  zap: Zap,
  crown: Crown,
  'graduation-cap': BookOpen,
  activity: Heart,
  'user-check': CheckCircle
}

/**
 * Get icon component for badge
 */
function getBadgeIcon(iconName) {
  return BADGE_ICONS[iconName] || Award
}

/**
 * Single badge display
 */
export function Badge({
  badge,
  earned = false,
  size = 'md',
  showName = true,
  onClick,
  className = ''
}) {
  const Icon = getBadgeIcon(badge.icon)
  const rarityColors = getBadgeRarityColor(badge.rarity)

  const sizeClasses = {
    sm: {
      container: 'w-10 h-10',
      icon: 'w-5 h-5'
    },
    md: {
      container: 'w-14 h-14',
      icon: 'w-7 h-7'
    },
    lg: {
      container: 'w-20 h-20',
      icon: 'w-10 h-10'
    }
  }

  const sizes = sizeClasses[size] || sizeClasses.md

  return (
    <div
      className={`flex flex-col items-center gap-1 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={() => onClick?.(badge)}
    >
      <div
        className={`
          ${sizes.container} rounded-full flex items-center justify-center
          ${earned
            ? `${rarityColors.bg} ${rarityColors.border} border-2`
            : 'bg-gray-100 border-2 border-gray-200'
          }
          ${onClick ? 'hover:scale-110 transition-transform' : ''}
        `}
      >
        <Icon
          className={`
            ${sizes.icon}
            ${earned ? rarityColors.text : 'text-gray-400'}
          `}
        />
      </div>
      {showName && (
        <span className={`text-xs text-center ${earned ? 'text-gray-700' : 'text-gray-400'}`}>
          {badge.name}
        </span>
      )}
    </div>
  )
}

/**
 * Badge row display
 */
export function BadgeRow({ badges, earnedBadgeIds = [], maxDisplay = 5, className = '' }) {
  const displayBadges = badges.slice(0, maxDisplay)
  const remaining = badges.length - maxDisplay

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {displayBadges.map(badge => (
        <Badge
          key={badge.id}
          badge={badge}
          earned={earnedBadgeIds.includes(badge.id)}
          size="sm"
          showName={false}
        />
      ))}
      {remaining > 0 && (
        <span className="text-sm text-gray-500">+{remaining} more</span>
      )}
    </div>
  )
}

/**
 * Badge detail modal
 */
export function BadgeDetailModal({ badge, earned = false, earnedAt, onClose }) {
  if (!badge) return null

  const Icon = getBadgeIcon(badge.icon)
  const rarityColors = getBadgeRarityColor(badge.rarity)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 max-w-sm w-full animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${rarityColors.bg} ${rarityColors.text}`}>
            {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div
            className={`
              w-24 h-24 rounded-full flex items-center justify-center mb-4
              ${earned
                ? `${rarityColors.bg} ${rarityColors.border} border-4`
                : 'bg-gray-100 border-4 border-gray-200'
              }
            `}
          >
            <Icon className={`w-12 h-12 ${earned ? rarityColors.text : 'text-gray-400'}`} />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">{badge.name}</h3>
          <p className="text-gray-600 mb-4">{badge.description}</p>

          {badge.xpBonus > 0 && (
            <div className="flex items-center gap-1 text-amber-600 mb-4">
              <Zap className="w-4 h-4 fill-current" />
              <span className="font-medium">+{badge.xpBonus} XP bonus</span>
            </div>
          )}

          {earned ? (
            <div className="text-green-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Earned{earnedAt ? ` on ${new Date(earnedAt).toLocaleDateString()}` : ''}</span>
            </div>
          ) : (
            <div className="text-gray-500">
              <p className="text-sm">How to earn:</p>
              <p className="font-medium">{getCriteriaDescription(badge.criteria)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Get human-readable criteria description
 */
function getCriteriaDescription(criteria) {
  if (!criteria) return 'Complete specific requirements'

  switch (criteria.type) {
    case 'quest_complete':
      return 'Complete a specific quest'
    case 'track_complete':
      return 'Complete all quests in a track'
    case 'streak':
      return `Maintain a ${criteria.threshold}-day streak`
    case 'xp_total':
      return `Earn ${criteria.threshold.toLocaleString()} total XP`
    case 'quests_completed_count':
      return `Complete ${criteria.threshold} quests`
    case 'scenarios_completed_count':
      return `Complete ${criteria.threshold} scenarios`
    case 'perfect_quiz':
      return 'Get 100% on any quiz'
    case 'scenario_score':
      return `Score ${criteria.threshold}% or higher on a scenario`
    case 'readiness_streak':
      return `${criteria.threshold}-day readiness check-in streak`
    case 'level':
      return `Reach Level ${criteria.threshold}`
    default:
      return 'Complete specific requirements'
  }
}

/**
 * Badge gallery
 */
export function BadgeGallery({
  badges,
  earnedBadgeIds = [],
  filter = 'all',
  onBadgeClick,
  className = ''
}) {
  const [selectedBadge, setSelectedBadge] = useState(null)

  const filteredBadges = badges.filter(badge => {
    if (filter === 'earned') return earnedBadgeIds.includes(badge.id)
    if (filter === 'unearned') return !earnedBadgeIds.includes(badge.id)
    return true
  })

  // Group by category
  const groupedBadges = filteredBadges.reduce((acc, badge) => {
    const category = badge.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(badge)
    return acc
  }, {})

  const categoryLabels = {
    milestone: 'Milestones',
    streak: 'Streaks',
    quiz: 'Quizzes',
    scenario: 'Scenarios',
    readiness: 'Readiness',
    level: 'Levels',
    other: 'Other'
  }

  return (
    <div className={className}>
      {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            {categoryLabels[category] || category}
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {categoryBadges.map(badge => (
              <Badge
                key={badge.id}
                badge={badge}
                earned={earnedBadgeIds.includes(badge.id)}
                size="md"
                onClick={() => {
                  setSelectedBadge(badge)
                  onBadgeClick?.(badge)
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          earned={earnedBadgeIds.includes(selectedBadge.id)}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  )
}

/**
 * Badge earned celebration
 */
export function BadgeEarnedCelebration({ badge, onClose }) {
  const Icon = getBadgeIcon(badge.icon)
  const rarityColors = getBadgeRarityColor(badge.rarity)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full opacity-20 animate-ping" />
          </div>
          <div
            className={`
              w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 relative
              ${rarityColors.bg} ${rarityColors.border} border-4
            `}
          >
            <Icon className={`w-12 h-12 ${rarityColors.text}`} />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Badge Earned!</h2>
        <p className="text-2xl font-bold text-gray-900 mb-2">{badge.name}</p>
        <p className="text-gray-600 mb-4">{badge.description}</p>

        {badge.xpBonus > 0 && (
          <div className="flex items-center justify-center gap-1 text-amber-600 mb-4">
            <Zap className="w-5 h-5 fill-current" />
            <span className="font-bold">+{badge.xpBonus} XP</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-colors"
        >
          Awesome!
        </button>
      </div>
    </div>
  )
}

export default Badge
