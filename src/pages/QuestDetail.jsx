/**
 * Quest Detail Page
 * Individual quest view with lessons and quizzes
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  ArrowLeft, BookOpen, CheckCircle, Circle, Play,
  Lock, Star, Zap, Clock, Award, ChevronRight,
  HelpCircle, Check, X, RefreshCw
} from 'lucide-react'

import {
  getQuest,
  getLessonsForQuest,
  getUserGamificationProfile,
  updateQuestProgress,
  markLessonComplete,
  submitQuizAttempt
} from '../lib/firestoreGamification'

import { generateQuizQuestions, generateWrongAnswerExplanation } from '../lib/safetyAI'
import ProgressRing, { MiniProgressRing } from '../components/gamification/shared/ProgressRing'
import { XPGainAnimation, LevelUpCelebration } from '../components/gamification/shared/XPDisplay'
import { BadgeEarnedCelebration } from '../components/gamification/shared/BadgeDisplay'

export default function QuestDetail() {
  const { questId } = useParams()
  const { currentUser, loading: authLoading } = useAuth()
  const { organization, loading: orgLoading } = useOrganization()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quest, setQuest] = useState(null)
  const [lessons, setLessons] = useState([])
  const [profile, setProfile] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [quizMode, setQuizMode] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizResults, setQuizResults] = useState([])
  const [xpGain, setXpGain] = useState(null)
  const [levelUp, setLevelUp] = useState(null)
  const [badgeEarned, setBadgeEarned] = useState(null)
  const [wrongAnswerExplanation, setWrongAnswerExplanation] = useState(null)

  useEffect(() => {
    // Wait for both auth and org context to finish loading
    if (authLoading || orgLoading) return

    if (currentUser?.uid && questId && organization?.id) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [currentUser, questId, organization, authLoading, orgLoading])

  async function loadData() {
    if (!organization?.id) return

    setLoading(true)
    setError(null)

    try {
      const [questData, lessonsData, profileData] = await Promise.all([
        getQuest(organization.id, questId),
        getLessonsForQuest(organization.id, questId),
        getUserGamificationProfile(currentUser.uid)
      ])

      setQuest(questData)
      setLessons(lessonsData)
      setProfile(profileData)

      // Start quest if not already
      if (!profileData?.currentQuests?.includes(questId) &&
          !profileData?.completedQuests?.includes(questId)) {
        await updateQuestProgress(currentUser.uid, questId, { status: 'in_progress', startedAt: new Date().toISOString() })
      }
    } catch (err) {
      console.error('Error loading quest:', err)
      setError('Failed to load quest. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function getLessonStatus(lesson, index) {
    const completedLessons = profile?.lessonProgress?.[questId] || []

    if (completedLessons.includes(lesson.id)) {
      return 'completed'
    }

    // First lesson or previous lesson completed
    if (index === 0 || completedLessons.includes(lessons[index - 1]?.id)) {
      return 'available'
    }

    return 'locked'
  }

  function handleLessonClick(lesson, index) {
    const status = getLessonStatus(lesson, index)
    if (status === 'locked') return

    setCurrentLesson(lesson)
    setQuizMode(false)
    setQuizQuestions([])
    setCurrentQuestionIndex(0)
    setQuizResults([])
    setSelectedAnswer(null)
    setShowExplanation(false)
  }

  async function handleLessonComplete() {
    if (!currentLesson) return

    try {
      const result = await markLessonComplete(currentUser.uid, questId, currentLesson.id)

      if (result.xpAwarded) {
        setXpGain(result.xpAwarded)
        setTimeout(() => setXpGain(null), 2000)
      }

      // Refresh profile
      const updatedProfile = await getUserGamificationProfile(currentUser.uid)
      setProfile(updatedProfile)

      // Check if quest is complete
      const completedLessons = updatedProfile.lessonProgress?.[questId] || []
      if (completedLessons.length === lessons.length) {
        // Quest complete!
        await updateQuestProgress(currentUser.uid, questId, {
          status: 'completed',
          completedAt: new Date().toISOString()
        })
        // Check for level up after reload
        const finalProfile = await getUserGamificationProfile(currentUser.uid)
        if (finalProfile.level > updatedProfile.level) {
          setLevelUp(finalProfile.level)
        }
      }

      setCurrentLesson(null)
    } catch (err) {
      console.error('Error completing lesson:', err)
      setError('Failed to save progress.')
    }
  }

  async function handleStartQuiz() {
    setQuizMode(true)
    setCurrentQuestionIndex(0)
    setQuizResults([])
    setSelectedAnswer(null)
    setShowExplanation(false)

    // Generate quiz questions if not already loaded
    if (quizQuestions.length === 0) {
      try {
        const questions = await generateQuizQuestions({
          sourceChunks: [{ text: currentLesson.content?.sections?.map(s => s.content).join('\n') || '' }],
          questionCount: 3,
          difficultyLevel: 'intermediate'
        })

        if (questions?.questions) {
          setQuizQuestions(questions.questions)
        }
      } catch (err) {
        console.error('Error generating quiz:', err)
        // Use fallback questions
        setQuizQuestions([
          {
            type: 'multiple_choice',
            question: 'What is the main topic of this lesson?',
            options: [
              { id: 'a', text: 'Safety procedures', isCorrect: true, explanation: 'Correct!' },
              { id: 'b', text: 'Equipment maintenance', isCorrect: false, explanation: 'Review the lesson content.' },
              { id: 'c', text: 'Weather patterns', isCorrect: false, explanation: 'Not the main focus.' },
              { id: 'd', text: 'Navigation systems', isCorrect: false, explanation: 'Try again.' }
            ]
          }
        ])
      }
    }
  }

  async function handleAnswerSelect(option) {
    if (showExplanation) return

    setSelectedAnswer(option)
    setShowExplanation(true)

    const isCorrect = option.isCorrect
    setQuizResults(prev => [...prev, { questionIndex: currentQuestionIndex, isCorrect }])

    // Generate wrong answer explanation if needed
    if (!isCorrect) {
      try {
        const question = quizQuestions[currentQuestionIndex]
        const correctOption = question.options.find(o => o.isCorrect)

        const explanation = await generateWrongAnswerExplanation({
          question: question.question,
          userAnswer: option.text,
          correctAnswer: correctOption.text,
          regulatoryReference: question.regulatoryReference
        })

        if (explanation?.explanation) {
          setWrongAnswerExplanation(explanation.explanation)
        }
      } catch (err) {
        console.error('Error generating explanation:', err)
      }
    }
  }

  async function handleNextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setWrongAnswerExplanation(null)
    } else {
      // Quiz complete
      const correctCount = quizResults.filter(r => r.isCorrect).length
      const score = Math.round((correctCount / quizQuestions.length) * 100)

      try {
        const result = await submitQuizAttempt(currentUser.uid, questId, currentLesson.id, {
          score,
          correctCount,
          totalQuestions: quizQuestions.length,
          timestamp: new Date().toISOString()
        })

        if (result.xpGained) {
          setXpGain(result.xpGained)
          setTimeout(() => setXpGain(null), 2000)
        }

        // Complete the lesson after quiz
        await handleLessonComplete()
      } catch (err) {
        console.error('Error submitting quiz:', err)
      }

      setQuizMode(false)
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

  if (!quest) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-600">Quest not found.</div>
        <button
          onClick={() => navigate('/safety-quests')}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Back to Quests
        </button>
      </div>
    )
  }

  const completedLessons = profile?.lessonProgress?.[questId] || []
  const progress = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0

  // Render quiz mode
  if (quizMode && quizQuestions.length > 0) {
    const question = quizQuestions[currentQuestionIndex]

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h3>

          <div className="space-y-3">
            {question.options.map(option => {
              const isSelected = selectedAnswer?.id === option.id
              const showResult = showExplanation
              const isCorrect = option.isCorrect

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showExplanation}
                  className={`
                    w-full text-left p-4 rounded-xl border-2 transition-all
                    ${!showResult && isSelected ? 'border-purple-500 bg-purple-50' : ''}
                    ${!showResult && !isSelected ? 'border-gray-200 hover:border-gray-300' : ''}
                    ${showResult && isCorrect ? 'border-green-500 bg-green-50' : ''}
                    ${showResult && isSelected && !isCorrect ? 'border-red-500 bg-red-50' : ''}
                    ${showExplanation ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    {showResult && isCorrect && <Check className="w-5 h-5 text-green-600" />}
                    {showResult && isSelected && !isCorrect && <X className="w-5 h-5 text-red-600" />}
                  </div>
                </button>
              )
            })}
          </div>

          {showExplanation && (
            <div className="mt-6 p-4 rounded-lg bg-gray-50">
              {selectedAnswer?.isCorrect ? (
                <div className="text-green-700">
                  <p className="font-medium">Correct!</p>
                  <p className="text-sm mt-1">{selectedAnswer.explanation}</p>
                </div>
              ) : (
                <div className="text-red-700">
                  <p className="font-medium">Not quite.</p>
                  <p className="text-sm mt-1">
                    {wrongAnswerExplanation || selectedAnswer?.explanation}
                  </p>
                </div>
              )}

              <button
                onClick={handleNextQuestion}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                {currentQuestionIndex < quizQuestions.length - 1 ? (
                  <>Next Question <ChevronRight className="w-4 h-4" /></>
                ) : (
                  <>Complete Quiz <CheckCircle className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render lesson view
  if (currentLesson) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <button
          onClick={() => setCurrentLesson(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quest
        </button>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <h2 className="text-xl font-bold">{currentLesson.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-purple-100 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                ~{currentLesson.estimatedMinutes || 5} min
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {currentLesson.xpReward || 25} XP
              </span>
            </div>
          </div>

          <div className="p-6 prose prose-sm max-w-none">
            {currentLesson.content?.introduction && (
              <p className="text-gray-700 mb-4">{currentLesson.content.introduction}</p>
            )}

            {currentLesson.content?.sections?.map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.heading}</h3>
                <div className="text-gray-700 whitespace-pre-wrap">{section.content}</div>
                {section.keyPoint && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm">
                      <strong>Key Point:</strong> {section.keyPoint}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {currentLesson.content?.summary && (
              <div className="p-4 bg-gray-50 rounded-lg mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                <p className="text-gray-700">{currentLesson.content.summary}</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Ready to test your knowledge?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleLessonComplete}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  Skip Quiz
                </button>
                <button
                  onClick={handleStartQuiz}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Take Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render quest overview
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* XP/Level celebrations */}
      {xpGain && <XPGainAnimation amount={xpGain} />}
      {levelUp && <LevelUpCelebration level={levelUp} onClose={() => setLevelUp(null)} />}
      {badgeEarned && <BadgeEarnedCelebration badge={badgeEarned} onClose={() => setBadgeEarned(null)} />}

      {/* Back button */}
      <button
        onClick={() => navigate('/safety-quests')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Quests
      </button>

      {/* Quest header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quest.title}</h1>
            <p className="text-purple-100 mt-2">{quest.description}</p>
          </div>
          <ProgressRing
            progress={progress}
            size={80}
            strokeWidth={6}
            color="gradient"
            className="bg-white/20 rounded-full"
          >
            <span className="text-lg font-bold text-white">{progress}%</span>
          </ProgressRing>
        </div>

        <div className="flex items-center gap-6 mt-6 text-sm">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {lessons.length} Lessons
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            ~{quest.estimatedMinutes || 30} min
          </span>
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {quest.xpReward || 100} XP
          </span>
        </div>
      </div>

      {/* Lesson list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Lessons</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {lessons.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No lessons available yet.
            </div>
          ) : (
            lessons.map((lesson, index) => {
              const status = getLessonStatus(lesson, index)

              return (
                <div
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson, index)}
                  className={`
                    p-4 flex items-center gap-4 transition-colors
                    ${status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${status === 'completed' ? 'bg-green-100' : ''}
                    ${status === 'available' ? 'bg-purple-100' : ''}
                    ${status === 'locked' ? 'bg-gray-100' : ''}
                  `}>
                    {status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {status === 'available' && <Play className="w-5 h-5 text-purple-600" />}
                    {status === 'locked' && <Lock className="w-5 h-5 text-gray-400" />}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{lesson.estimatedMinutes || 5} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {lesson.xpReward || 25} XP
                      </span>
                    </div>
                  </div>

                  {status !== 'locked' && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
