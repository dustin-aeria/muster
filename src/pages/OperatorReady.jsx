/**
 * Operator Ready Dashboard
 * IMSAFE-based daily readiness/wellness tracker
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganizationContext } from '../contexts/OrganizationContext'
import {
  Heart, Activity, Brain, Coffee, Moon, Wind, Sun,
  AlertTriangle, CheckCircle, TrendingUp, Calendar,
  ChevronRight, Info, Save, BarChart3
} from 'lucide-react'

import {
  getUserGamificationProfile,
  submitReadinessCheckIn,
  getReadinessHistory
} from '../lib/firestoreGamification'

import { generateReadinessNudge, generateTrendInsight } from '../lib/safetyAI'
import ProgressRing, { ScoreRing } from '../components/gamification/shared/ProgressRing'
import StreakIndicator from '../components/gamification/shared/StreakIndicator'

// IMSAFE categories
const IMSAFE_CATEGORIES = {
  illness: {
    id: 'illness',
    label: 'Illness',
    icon: Heart,
    color: 'red',
    question: 'Any illness symptoms affecting performance?',
    options: [
      { value: 100, label: 'Healthy', description: 'No symptoms' },
      { value: 70, label: 'Minor symptoms', description: 'Cold, allergies' },
      { value: 40, label: 'Moderate', description: 'Affecting focus' },
      { value: 10, label: 'Unwell', description: 'Should not operate' }
    ]
  },
  medication: {
    id: 'medication',
    label: 'Medication',
    icon: Activity,
    color: 'orange',
    question: 'Any medication affecting alertness?',
    options: [
      { value: 100, label: 'None', description: 'No medications' },
      { value: 80, label: 'Non-impairing', description: 'Cleared for duty' },
      { value: 40, label: 'Mild effects', description: 'May cause drowsiness' },
      { value: 0, label: 'Impairing', description: 'Cannot operate' }
    ]
  },
  stress: {
    id: 'stress',
    label: 'Stress',
    icon: Brain,
    color: 'yellow',
    question: 'Current mental/emotional state?',
    options: [
      { value: 100, label: 'Relaxed', description: 'Calm and focused' },
      { value: 75, label: 'Mild stress', description: 'Normal workload' },
      { value: 50, label: 'Moderate', description: 'Some distraction' },
      { value: 25, label: 'High stress', description: 'Significantly distracted' }
    ]
  },
  alcohol: {
    id: 'alcohol',
    label: 'Alcohol',
    icon: Coffee,
    color: 'purple',
    question: 'Alcohol consumption (last 12 hours)?',
    options: [
      { value: 100, label: 'None', description: '12+ hours since any alcohol' },
      { value: 50, label: 'Some', description: '8-12 hours since' },
      { value: 0, label: 'Recent', description: 'Within 8 hours - NO GO' }
    ]
  },
  fatigue: {
    id: 'fatigue',
    label: 'Fatigue',
    icon: Moon,
    color: 'blue',
    question: 'Sleep quality and energy level?',
    options: [
      { value: 100, label: 'Well rested', description: '7+ hours, good quality' },
      { value: 75, label: 'Adequate', description: '5-7 hours' },
      { value: 50, label: 'Tired', description: 'Less than 5 hours' },
      { value: 25, label: 'Exhausted', description: 'Impaired judgment' }
    ]
  },
  emotion: {
    id: 'emotion',
    label: 'Emotion',
    icon: Wind,
    color: 'teal',
    question: 'Emotional readiness for operations?',
    options: [
      { value: 100, label: 'Stable', description: 'Ready for field work' },
      { value: 75, label: 'Minor concerns', description: 'Some personal issues' },
      { value: 50, label: 'Distracted', description: 'May affect focus' },
      { value: 25, label: 'Not ready', description: 'Significant impact' }
    ]
  }
}

export default function OperatorReady() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const { organizationId, loading: orgLoading } = useOrganizationContext()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [responses, setResponses] = useState({})
  const [currentCategory, setCurrentCategory] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [nudge, setNudge] = useState(null)
  const [trendInsight, setTrendInsight] = useState(null)
  const [todayCompleted, setTodayCompleted] = useState(false)
  const [todayScore, setTodayScore] = useState(null)

  useEffect(() => {
    // Wait for both auth and org context to finish loading
    if (authLoading || orgLoading) return

    if (currentUser?.uid && organizationId) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [currentUser, organizationId, authLoading, orgLoading])

  async function loadData() {
    if (!organizationId || !currentUser?.uid) return

    setLoading(true)
    setError(null)

    try {
      const [profileData, historyData] = await Promise.all([
        getUserGamificationProfile(currentUser.uid),
        getReadinessHistory(currentUser.uid, 30)
      ])

      setProfile(profileData)
      setHistory(historyData)

      // Check if already completed today
      const today = new Date().toISOString().split('T')[0]
      const todayEntry = historyData.find(h => h.date === today)
      if (todayEntry) {
        setTodayCompleted(true)
        setTodayScore(todayEntry.overallScore)
        setResponses(todayEntry.responses || {})
      }

      // Generate trend insight if enough data
      if (historyData.length >= 7) {
        try {
          const insight = await generateTrendInsight(historyData)
          if (insight?.insight) {
            setTrendInsight(insight.insight)
          }
        } catch (e) {
          console.error('Failed to generate trend insight:', e)
        }
      }
    } catch (err) {
      console.error('Error loading readiness data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function calculateOverallScore() {
    const values = Object.values(responses)
    if (values.length === 0) return 0

    // Weight certain categories higher
    const weights = {
      alcohol: 1.5,
      fatigue: 1.3,
      medication: 1.2,
      illness: 1.0,
      stress: 0.9,
      emotion: 0.8
    }

    let weightedSum = 0
    let totalWeight = 0

    Object.entries(responses).forEach(([cat, value]) => {
      const weight = weights[cat] || 1
      weightedSum += value * weight
      totalWeight += weight
    })

    return Math.round(weightedSum / totalWeight)
  }

  function getScoreColor(score) {
    if (score >= 80) return 'green'
    if (score >= 60) return 'amber'
    if (score >= 40) return 'orange'
    return 'red'
  }

  function getReadinessStatus(score) {
    if (score >= 80) return { label: 'GO', color: 'text-green-600 bg-green-100', description: 'Fully operational' }
    if (score >= 60) return { label: 'CAUTION', color: 'text-amber-600 bg-amber-100', description: 'Proceed with awareness' }
    if (score >= 40) return { label: 'MARGINAL', color: 'text-orange-600 bg-orange-100', description: 'Consider limiting duties' }
    return { label: 'NO-GO', color: 'text-red-600 bg-red-100', description: 'Not fit for field operations' }
  }

  async function handleSubmit() {
    if (Object.keys(responses).length !== Object.keys(IMSAFE_CATEGORIES).length) {
      setError('Please complete all categories')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const overallScore = calculateOverallScore()
      const categoryScores = {}

      Object.keys(IMSAFE_CATEGORIES).forEach(cat => {
        categoryScores[cat] = responses[cat]
      })

      await submitReadinessCheckIn(currentUser.uid, {
        responses,
        overallScore,
        categoryScores,
        timestamp: new Date().toISOString()
      }, organizationId)

      setTodayCompleted(true)
      setTodayScore(overallScore)

      // Generate personalized nudge
      try {
        const nudgeResponse = await generateReadinessNudge({
          overallScore,
          categoryScores,
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon',
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        })

        if (nudgeResponse) {
          setNudge(nudgeResponse)
        }
      } catch (e) {
        console.error('Failed to generate nudge:', e)
      }

      // Reload data
      await loadData()
    } catch (err) {
      console.error('Error submitting readiness check-in:', err)
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCategorySelect(categoryId) {
    setCurrentCategory(currentCategory === categoryId ? null : categoryId)
  }

  function handleOptionSelect(categoryId, value) {
    setResponses(prev => ({
      ...prev,
      [categoryId]: value
    }))
    setCurrentCategory(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  const overallScore = calculateOverallScore()
  const readinessStatus = getReadinessStatus(todayCompleted ? todayScore : overallScore)
  const completedCount = Object.keys(responses).length
  const totalCategories = Object.keys(IMSAFE_CATEGORIES).length

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Operator Ready</h1>
        </div>
        <p className="text-teal-100">
          Daily IMSAFE wellness check for field operations
        </p>

        <div className="flex items-center gap-6 mt-6">
          <div className="flex items-center gap-4">
            <ScoreRing
              score={todayCompleted ? todayScore : overallScore}
              size={80}
              strokeWidth={6}
              showLabel={false}
            />
            <div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${readinessStatus.color}`}>
                {readinessStatus.label}
              </div>
              <p className="text-sm text-teal-100 mt-1">{readinessStatus.description}</p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="text-right">
            <div className="text-sm text-teal-100">Check-in Streak</div>
            <div className="text-2xl font-bold">{profile?.readinessStreak || 0} days</div>
          </div>
        </div>
      </div>

      {/* Nudge message */}
      {nudge && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-900">{nudge.mainMessage}</p>
          {nudge.tip && (
            <p className="text-sm text-blue-700 mt-2">
              <strong>Tip:</strong> {nudge.tip}
            </p>
          )}
        </div>
      )}

      {/* Trend insight */}
      {trendInsight && !nudge && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-purple-700 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Trend Insight</span>
          </div>
          <p className="text-purple-900">{trendInsight.insight}</p>
          {trendInsight.suggestion && (
            <p className="text-sm text-purple-700 mt-2">{trendInsight.suggestion}</p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      {/* Already completed today */}
      {todayCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 text-green-700">
            <CheckCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Today's check-in complete!</h3>
              <p className="text-sm">Your readiness score: {todayScore}%</p>
            </div>
          </div>
        </div>
      )}

      {/* IMSAFE Categories */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900">IMSAFE Check-in</h2>
          <p className="text-sm text-gray-600 mt-1">
            {todayCompleted ? 'Your responses from today' : 'Select your current status for each category'}
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {Object.entries(IMSAFE_CATEGORIES).map(([id, category]) => {
            const Icon = category.icon
            const response = responses[id]
            const isExpanded = currentCategory === id && !todayCompleted
            const selectedOption = category.options.find(o => o.value === response)

            return (
              <div key={id} className="p-4">
                <div
                  onClick={() => !todayCompleted && handleCategorySelect(id)}
                  className={`
                    flex items-center gap-4 cursor-pointer
                    ${todayCompleted ? 'cursor-default' : ''}
                  `}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${category.color}-100`}>
                    <Icon className={`w-6 h-6 text-${category.color}-600`} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{category.label}</h3>
                    <p className="text-sm text-gray-600">{category.question}</p>
                  </div>

                  {response !== undefined ? (
                    <div className="flex items-center gap-2">
                      <span className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${response >= 75 ? 'bg-green-100 text-green-700' : ''}
                        ${response >= 50 && response < 75 ? 'bg-amber-100 text-amber-700' : ''}
                        ${response < 50 ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {selectedOption?.label}
                      </span>
                      {!todayCompleted && (
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      )}
                    </div>
                  ) : (
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  )}
                </div>

                {/* Options */}
                {isExpanded && (
                  <div className="mt-4 pl-16 grid gap-2">
                    {category.options.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleOptionSelect(id, option.value)}
                        className={`
                          text-left p-3 rounded-lg border transition-all
                          ${response === option.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Submit button */}
      {!todayCompleted && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {completedCount} of {totalCategories} categories completed
          </div>
          <button
            onClick={handleSubmit}
            disabled={completedCount !== totalCategories || submitting}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${completedCount === totalCategories
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Save className="w-5 h-5" />
            {submitting ? 'Submitting...' : 'Submit Check-in'}
          </button>
        </div>
      )}

      {/* History section */}
      <div className="mt-8">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
        >
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium">View History</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
        </button>

        {showHistory && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-medium text-gray-900">Last 30 Days</h3>
            </div>
            <div className="p-4">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No check-in history yet</p>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 14).map(entry => {
                    const status = getReadinessStatus(entry.overallScore)
                    return (
                      <div
                        key={entry.date}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-gray-600">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                entry.overallScore >= 80 ? 'bg-green-500' :
                                entry.overallScore >= 60 ? 'bg-amber-500' :
                                entry.overallScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${entry.overallScore}%` }}
                            />
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                            {entry.overallScore}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-start gap-3 text-sm text-gray-600">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700 mb-1">About IMSAFE</p>
            <p>
              IMSAFE is a mnemonic used in aviation to assess personal fitness:
              <strong> I</strong>llness, <strong>M</strong>edication, <strong>S</strong>tress,
              <strong> A</strong>lcohol, <strong>F</strong>atigue, <strong>E</strong>motion.
              This self-assessment helps ensure you're fit for safe field operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
