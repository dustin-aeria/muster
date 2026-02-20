/**
 * Safety Quests Hub
 * Duolingo-style micro-learning with quests, XP, streaks, and spaced repetition
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useOrganizationContext } from '../contexts/OrganizationContext'
import {
  BookOpen, Trophy, Flame, Target, Star, ChevronRight,
  Lock, CheckCircle, Clock, Zap, Award, TrendingUp, Download
} from 'lucide-react'

import {
  getUserGamificationProfile,
  getQuestTracks,
  getQuestsForTrack,
  getSpacedRepetitionDue
} from '../lib/firestoreGamification'
import { seedGamificationContent } from '../lib/seedGamificationContent'

import XPDisplay, { XPBadge, LevelProgress } from '../components/gamification/shared/XPDisplay'
import StreakIndicator, { StreakBadge } from '../components/gamification/shared/StreakIndicator'
import { Badge } from '../components/gamification/shared/BadgeDisplay'
import ProgressRing, { MiniProgressRing } from '../components/gamification/shared/ProgressRing'

export default function SafetyQuests() {
  const { currentUser } = useAuth()
  const { organizationId, loading: orgLoading } = useOrganizationContext()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)
  const [tracks, setTracks] = useState([])
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [quests, setQuests] = useState([])
  const [reviewItems, setReviewItems] = useState([])

  useEffect(() => {
    // Wait for org context to finish loading
    if (orgLoading) return

    if (currentUser?.uid && organizationId) {
      loadData()
    } else {
      // No org or user - stop loading
      setLoading(false)
    }
  }, [currentUser, organizationId, orgLoading])

  async function loadData() {
    if (!organizationId || !currentUser?.uid) return

    setLoading(true)
    setError(null)

    try {
      const [profileData, tracksData, reviewData] = await Promise.all([
        getUserGamificationProfile(currentUser.uid),
        getQuestTracks(organizationId),
        getSpacedRepetitionDue(currentUser.uid)
      ])

      setProfile(profileData)
      setTracks(tracksData)
      setReviewItems(reviewData || [])

      if (tracksData.length > 0) {
        setSelectedTrack(tracksData[0])
        const questsData = await getQuestsForTrack(organizationId, tracksData[0].id)
        setQuests(questsData)
      }
    } catch (err) {
      console.error('Error loading quests data:', err)
      setError('Failed to load quests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleTrackSelect(track) {
    setSelectedTrack(track)
    try {
      const questsData = await getQuestsForTrack(organizationId, track.id)
      setQuests(questsData)
    } catch (err) {
      console.error('Error loading track quests:', err)
    }
  }

  function getQuestStatus(quest) {
    if (!profile?.completedQuests) return 'locked'

    if (profile.completedQuests.includes(quest.id)) {
      return 'completed'
    }

    // Check prerequisites
    if (quest.prerequisites?.length > 0) {
      const hasAllPrereqs = quest.prerequisites.every(
        prereq => profile.completedQuests.includes(prereq)
      )
      if (!hasAllPrereqs) return 'locked'
    }

    // Check if in progress
    if (profile.currentQuests?.includes(quest.id)) {
      return 'in_progress'
    }

    return 'available'
  }

  function handleQuestClick(quest) {
    const status = getQuestStatus(quest)
    if (status === 'locked') return

    navigate(`/safety-quests/${quest.id}`)
  }

  async function handleSeedContent() {
    if (!organizationId) return

    setSeeding(true)
    try {
      await seedGamificationContent(organizationId)
      // Reload data after seeding
      await loadData()
    } catch (err) {
      console.error('Error seeding content:', err)
      setError('Failed to seed content. Please try again.')
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with stats */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Profile card */}
        <div className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Safety Quests</h1>
              <p className="text-purple-100 mt-1">Level up your safety knowledge</p>
            </div>
            <div className="flex items-center gap-4">
              <StreakBadge streak={profile?.currentStreak || 0} size="lg" />
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <XPBadge xp={profile?.totalXP || 0} size="lg" />
            </div>
            <div className="flex-1">
              <LevelProgress
                currentLevel={profile?.level || 1}
                xpInLevel={profile?.xpInCurrentLevel || 0}
                xpToNextLevel={profile?.xpToNextLevel || 100}
              />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="lg:w-80 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-medium">Quests Done</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {profile?.completedQuests?.length || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {profile?.overallAccuracy ? `${Math.round(profile.overallAccuracy)}%` : '--'}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Badges</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {profile?.earnedBadges?.length || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">This Week</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              +{profile?.weeklyXP || 0} XP
            </div>
          </div>
        </div>
      </div>

      {/* Spaced repetition review section */}
      {reviewItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Time to Review!</h3>
                <p className="text-sm text-amber-700">
                  {reviewItems.length} item{reviewItems.length !== 1 ? 's' : ''} ready for spaced repetition
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/safety-quests/review')}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              Start Review
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Track selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Tracks</h2>

        {tracks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Learning Tracks Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started with sample safety quests covering RPAS operations, field safety, emergency response, and more.
            </p>
            <button
              onClick={handleSeedContent}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {seeding ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Creating Content...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Load Sample Quests
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {tracks.map(track => {
              const progress = profile?.trackProgress?.[track.id] || 0
              const isSelected = selectedTrack?.id === track.id

              return (
                <button
                  key={track.id}
                  onClick={() => handleTrackSelect(track)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
                    ${isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <MiniProgressRing
                    progress={progress}
                    size={36}
                    strokeWidth={3}
                    color={isSelected ? 'purple' : 'gray'}
                  />
                  <div className="text-left whitespace-nowrap">
                    <div className={`font-medium ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                      {track.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {track.questCount} quests
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Quest list */}
      {selectedTrack && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900">{selectedTrack.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedTrack.description}</p>
          </div>

          <div className="divide-y divide-gray-100">
            {quests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No quests available in this track yet.
              </div>
            ) : (
              quests.map((quest, index) => {
                const status = getQuestStatus(quest)

                return (
                  <div
                    key={quest.id}
                    onClick={() => handleQuestClick(quest)}
                    className={`
                      p-4 flex items-center gap-4 transition-colors
                      ${status === 'locked'
                        ? 'opacity-60 cursor-not-allowed'
                        : 'cursor-pointer hover:bg-gray-50'
                      }
                    `}
                  >
                    {/* Quest icon/status */}
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center
                      ${status === 'completed' ? 'bg-green-100' : ''}
                      ${status === 'in_progress' ? 'bg-purple-100' : ''}
                      ${status === 'available' ? 'bg-blue-100' : ''}
                      ${status === 'locked' ? 'bg-gray-100' : ''}
                    `}>
                      {status === 'completed' && <CheckCircle className="w-6 h-6 text-green-600" />}
                      {status === 'in_progress' && <BookOpen className="w-6 h-6 text-purple-600" />}
                      {status === 'available' && <Target className="w-6 h-6 text-blue-600" />}
                      {status === 'locked' && <Lock className="w-6 h-6 text-gray-400" />}
                    </div>

                    {/* Quest info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{quest.title}</h4>
                        {quest.xpReward && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {quest.xpReward} XP
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{quest.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {quest.lessonCount || 0} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ~{quest.estimatedMinutes || 10} min
                        </span>
                      </div>
                    </div>

                    {/* Progress/arrow */}
                    {status === 'in_progress' && (
                      <MiniProgressRing
                        progress={profile?.questProgress?.[quest.id] || 0}
                        color="purple"
                      />
                    )}
                    {status !== 'locked' && (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
