/**
 * LearningHub.jsx
 * Gamified Training Quest System
 *
 * Displays quest tracks, lessons, quizzes, and interactive scenarios
 * for RPAS operator training.
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  BookOpen,
  Trophy,
  Target,
  ChevronRight,
  ChevronLeft,
  Lock,
  CheckCircle,
  Play,
  Star,
  Clock,
  Award,
  Zap,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Info
} from 'lucide-react'

// Import quest tracks data
import { allTracks, getTrack } from '../data/questTracks'
import { getScenario, getScenariosForTrack } from '../data/scenarios'

// Track icons mapping
const TRACK_ICONS = {
  sms: '🛡️',
  crm: '👥',
  rpasOps: '✈️',
  regulatory: '📋',
  riskHazard: '⚠️',
  fieldSafety: '🦺',
  wildlife: '🦅',
  specializedOps: '🔧'
}

// Difficulty colors
const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700'
}

export default function LearningHub() {
  const { user } = useAuth()
  const { organizationId } = useOrganization()

  const [selectedTrack, setSelectedTrack] = useState(null)
  const [selectedQuest, setSelectedQuest] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [userProgress, setUserProgress] = useState({})
  const [loading, setLoading] = useState(false)

  // Calculate track progress (mock for now - would come from Firestore)
  const getTrackProgress = (track) => {
    const totalQuests = track.quests?.length || 0
    const completedQuests = 0 // Would come from user progress
    return totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0
  }

  // Render track list
  const renderTrackList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Hub</h1>
          <p className="text-gray-600 mt-1">Master RPAS operations through interactive training</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
            <Zap className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-indigo-600">0 XP</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg">
            <Trophy className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-600">0 Badges</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{allTracks.length}</p>
              <p className="text-sm text-gray-500">Quest Tracks</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {allTracks.reduce((sum, t) => sum + (t.quests?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Total Quests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {allTracks.reduce((sum, t) => sum + (t.totalXp || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total XP Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quest Tracks Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quest Tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allTracks.map((track) => (
            <div
              key={track.id}
              onClick={() => setSelectedTrack(track)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{TRACK_ICONS[track.id] || '📚'}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${DIFFICULTY_COLORS[track.difficulty] || 'bg-gray-100'}`}>
                  {track.difficulty || 'intermediate'}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {track.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{track.description}</p>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {track.quests?.length || 0} quests
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {track.totalXp} XP
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="text-gray-700 font-medium">{getTrackProgress(track)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${getTrackProgress(track)}%` }}
                  />
                </div>
              </div>

              {/* Badge preview */}
              {track.badge && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-gray-600">{track.badge.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Render track detail view
  const renderTrackDetail = () => {
    if (!selectedTrack) return null

    return (
      <div className="space-y-6">
        {/* Back button and header */}
        <div>
          <button
            onClick={() => {
              setSelectedTrack(null)
              setSelectedQuest(null)
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Quest Tracks
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{TRACK_ICONS[selectedTrack.id] || '📚'}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedTrack.title}</h1>
                <p className="text-gray-600 mt-1">{selectedTrack.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total XP</p>
                <p className="text-xl font-bold text-indigo-600">{selectedTrack.totalXp}</p>
              </div>
              {selectedTrack.badge && (
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Award className="w-8 h-8 text-amber-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Track stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Quests</p>
            <p className="text-2xl font-bold text-gray-900">{selectedTrack.quests?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Estimated Time</p>
            <p className="text-2xl font-bold text-gray-900">{selectedTrack.estimatedHours || 0}h</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Difficulty</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{selectedTrack.difficulty}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Your Progress</p>
            <p className="text-2xl font-bold text-gray-900">{getTrackProgress(selectedTrack)}%</p>
          </div>
        </div>

        {/* Quest list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Quests</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {selectedTrack.quests?.map((quest, index) => (
              <div
                key={quest.id}
                onClick={() => setSelectedQuest(quest)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    index === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{quest.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{quest.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {quest.lessons?.length || 0} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        ~{quest.estimatedTime || 30} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        {quest.xpReward} XP
                      </span>
                      {quest.scenarioId && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Sparkles className="w-3.5 h-3.5" />
                          Scenario
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {index === 0 ? (
                      <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                    ) : (
                      <Lock className="w-5 h-5 text-gray-300" />
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badge preview */}
        {selectedTrack.badge && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <Award className="w-12 h-12 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-amber-700 font-medium">Complete this track to earn:</p>
                <h3 className="text-xl font-bold text-gray-900">{selectedTrack.badge.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedTrack.badge.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                    selectedTrack.badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                    selectedTrack.badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedTrack.badge.rarity}
                  </span>
                  <span className="text-sm text-amber-600 font-medium">
                    +{selectedTrack.badge.xpBonus} XP Bonus
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render quest detail view
  const renderQuestDetail = () => {
    if (!selectedQuest) return null

    return (
      <div className="space-y-6">
        {/* Back button and header */}
        <div>
          <button
            onClick={() => setSelectedQuest(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to {selectedTrack.title}
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900">{selectedQuest.title}</h1>
            <p className="text-gray-600 mt-2">{selectedQuest.description}</p>

            <div className="flex items-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2 text-gray-500">
                <BookOpen className="w-4 h-4" />
                {selectedQuest.lessons?.length || 0} lessons
              </span>
              <span className="flex items-center gap-2 text-gray-500">
                <Clock className="w-4 h-4" />
                ~{selectedQuest.estimatedTime || 30} min
              </span>
              <span className="flex items-center gap-2 text-indigo-600 font-medium">
                <Zap className="w-4 h-4" />
                {selectedQuest.xpReward} XP
              </span>
            </div>
          </div>
        </div>

        {/* Lessons list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Lessons</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {selectedQuest.lessons?.map((lesson, index) => (
              <div
                key={lesson.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                    <span className="text-sm text-indigo-600">+{lesson.xpReward} XP</span>
                  </div>
                  {index === 0 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedLesson({ ...lesson, index })
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Start
                    </button>
                  ) : (
                    <Lock className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz preview */}
        {selectedQuest.quiz && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Quiz: {selectedQuest.quiz.title}</h3>
                <p className="text-sm text-gray-500">
                  {selectedQuest.quiz.questions?.length || 5} questions · Pass score: {selectedQuest.quiz.passingScore}%
                </p>
              </div>
              <Lock className="w-5 h-5 text-gray-300 ml-auto" />
            </div>
          </div>
        )}

        {/* Scenario preview */}
        {selectedQuest.scenarioId && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Interactive Scenario</h3>
                <p className="text-sm text-gray-600">
                  Make decisions in a realistic simulation scenario
                </p>
              </div>
              <Lock className="w-5 h-5 text-gray-300 ml-auto" />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render lesson view
  const renderLessonView = () => {
    if (!selectedLesson) return null

    const currentIndex = selectedLesson.index
    const lessons = selectedQuest.lessons || []
    const isLastLesson = currentIndex === lessons.length - 1
    const nextLesson = !isLastLesson ? lessons[currentIndex + 1] : null

    // Handle completing lesson and moving to next
    const handleCompleteLesson = () => {
      // TODO: Save progress to Firestore
      if (nextLesson) {
        setSelectedLesson({ ...nextLesson, index: currentIndex + 1 })
      } else {
        // All lessons complete - go back to quest view
        setSelectedLesson(null)
      }
    }

    return (
      <div className="space-y-6">
        {/* Header with navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedLesson(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {selectedQuest.title}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Lesson {currentIndex + 1} of {lessons.length}</span>
            <div className="flex gap-1">
              {lessons.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentIndex
                      ? 'bg-indigo-600'
                      : idx < currentIndex
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Lesson card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Lesson header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center gap-2 text-indigo-100 text-sm mb-1">
              <BookOpen className="w-4 h-4" />
              {selectedTrack.title} • {selectedQuest.title}
            </div>
            <h1 className="text-2xl font-bold">{selectedLesson.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-indigo-100">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                ~{selectedLesson.estimatedDuration || 10} min
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                +{selectedLesson.xpReward} XP
              </span>
            </div>
          </div>

          {/* Lesson content */}
          <div className="p-6">
            {/* Key points summary - check both direct keyPoints and content.keyPoints */}
            {(() => {
              const keyPoints = selectedLesson.keyPoints || selectedLesson.content?.keyPoints || []
              return keyPoints.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                    <Info className="w-4 h-4" />
                    Key Points
                  </div>
                  <ul className="space-y-1">
                    {keyPoints.map((point, idx) => (
                      <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}

            {/* Main content - handle both HTML string and structured sections */}
            {(() => {
              const content = selectedLesson.content

              // If content is a string, render as HTML
              if (typeof content === 'string') {
                return (
                  <div
                    className="prose prose-gray max-w-none
                      prose-headings:text-gray-900 prose-headings:font-semibold
                      prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                      prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                      prose-h4:text-base prose-h4:mt-3 prose-h4:mb-2
                      prose-p:text-gray-700 prose-p:leading-relaxed
                      prose-ul:my-3 prose-li:my-1 prose-li:text-gray-700
                      prose-strong:text-gray-900
                      [&_.key-concept]:bg-emerald-50 [&_.key-concept]:border [&_.key-concept]:border-emerald-200 [&_.key-concept]:rounded-lg [&_.key-concept]:p-4 [&_.key-concept]:my-4
                      [&_.key-concept_h3]:text-emerald-700 [&_.key-concept_h3]:text-sm [&_.key-concept_h3]:font-semibold [&_.key-concept_h3]:mb-2 [&_.key-concept_h3]:mt-0
                      [&_.key-concept_p]:text-emerald-800 [&_.key-concept_p]:mb-0
                      [&_.think-about-it]:bg-amber-50 [&_.think-about-it]:border [&_.think-about-it]:border-amber-200 [&_.think-about-it]:rounded-lg [&_.think-about-it]:p-4 [&_.think-about-it]:my-4
                      [&_.think-about-it_h4]:text-amber-700 [&_.think-about-it_h4]:text-sm [&_.think-about-it_h4]:font-semibold [&_.think-about-it_h4]:mb-2 [&_.think-about-it_h4]:mt-0
                      [&_.think-about-it_p]:text-amber-800 [&_.think-about-it_p]:mb-0
                      [&_.key-takeaway]:bg-purple-50 [&_.key-takeaway]:border [&_.key-takeaway]:border-purple-200 [&_.key-takeaway]:rounded-lg [&_.key-takeaway]:p-4 [&_.key-takeaway]:my-4
                      [&_.key-takeaway_h4]:text-purple-700 [&_.key-takeaway_h4]:text-sm [&_.key-takeaway_h4]:font-semibold [&_.key-takeaway_h4]:mb-2 [&_.key-takeaway_h4]:mt-0
                      [&_.key-takeaway_p]:text-purple-800 [&_.key-takeaway_p]:mb-0
                      [&_.warning]:bg-red-50 [&_.warning]:border [&_.warning]:border-red-200 [&_.warning]:rounded-lg [&_.warning]:p-4 [&_.warning]:my-4
                      [&_.warning_h4]:text-red-700 [&_.warning_h4]:text-sm [&_.warning_h4]:font-semibold [&_.warning_h4]:mb-2 [&_.warning_h4]:mt-0
                      [&_.warning_p]:text-red-800 [&_.warning_p]:mb-0
                    "
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                )
              }

              // If content has sections array, render structured content
              if (content?.sections) {
                return (
                  <div className="space-y-4">
                    {content.sections.map((section, idx) => {
                      switch (section.type) {
                        case 'heading':
                          return (
                            <h3 key={idx} className="text-lg font-semibold text-gray-900 mt-6 mb-2">
                              {section.content}
                            </h3>
                          )
                        case 'text':
                          return (
                            <div
                              key={idx}
                              className="text-gray-700 leading-relaxed whitespace-pre-line"
                              dangerouslySetInnerHTML={{
                                __html: section.content
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\n/g, '<br/>')
                              }}
                            />
                          )
                        case 'list':
                          return (
                            <ul key={idx} className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                              {section.items?.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          )
                        case 'callout':
                          const variants = {
                            info: 'bg-blue-50 border-blue-200 text-blue-800',
                            warning: 'bg-amber-50 border-amber-200 text-amber-800',
                            danger: 'bg-red-50 border-red-200 text-red-800',
                            success: 'bg-green-50 border-green-200 text-green-800',
                            tip: 'bg-purple-50 border-purple-200 text-purple-800'
                          }
                          const variantClass = variants[section.variant] || variants.info
                          return (
                            <div key={idx} className={`p-4 rounded-lg border ${variantClass}`}>
                              {section.title && (
                                <div className="font-medium mb-1">{section.title}</div>
                              )}
                              <div className="text-sm">{section.content}</div>
                            </div>
                          )
                        case 'table':
                          return (
                            <div key={idx} className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                {section.headers && (
                                  <thead className="bg-gray-50">
                                    <tr>
                                      {section.headers.map((header, i) => (
                                        <th key={i} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                                          {header}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                )}
                                <tbody className="divide-y divide-gray-100">
                                  {section.rows?.map((row, i) => (
                                    <tr key={i}>
                                      {row.map((cell, j) => (
                                        <td key={j} className="px-4 py-2 text-sm text-gray-600">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )
                        default:
                          return (
                            <p key={idx} className="text-gray-700">{section.content}</p>
                          )
                      }
                    })}
                  </div>
                )
              }

              // Fallback for missing content
              return <p className="text-gray-500 italic">Lesson content not available.</p>
            })()}

            {/* Regulatory references */}
            {selectedLesson.regulatoryRefs && selectedLesson.regulatoryRefs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Regulatory References</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedLesson.regulatoryRefs.map((ref, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                    >
                      {ref.type} {ref.reference} - {ref.section}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer with actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Complete this lesson to earn <strong className="text-amber-600">{selectedLesson.xpReward} XP</strong></span>
            </div>
            <button
              onClick={handleCompleteLesson}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isLastLesson ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Quest
                </>
              ) : (
                <>
                  Next Lesson
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className="space-y-6">
      {selectedLesson ? renderLessonView() : selectedQuest ? renderQuestDetail() : selectedTrack ? renderTrackDetail() : renderTrackList()}
    </div>
  )
}
