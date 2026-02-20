/**
 * Scenario Challenges Hub
 * Branching-narrative decision simulations based on field scenarios
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useOrganizationContext } from '../contexts/OrganizationContext'
import {
  GitBranch, Play, Trophy, Clock, Target, Star,
  ChevronRight, Award, Zap, AlertTriangle, CheckCircle,
  Lock, Filter, RefreshCw, Download
} from 'lucide-react'

import {
  getUserGamificationProfile,
  getScenarios,
  getUserScenarioAttempts
} from '../lib/firestoreGamification'
import { seedGamificationContent } from '../lib/seedGamificationContent'

import { ScoreRing, MiniProgressRing } from '../components/gamification/shared/ProgressRing'
import { XPBadge } from '../components/gamification/shared/XPDisplay'

const DIFFICULTY_CONFIG = {
  green: {
    label: 'Routine',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    description: 'Standard operations, minor decisions'
  },
  yellow: {
    label: 'Degraded',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: AlertTriangle,
    description: 'Equipment issues, weather changes, time pressure'
  },
  red: {
    label: 'Emergency',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertTriangle,
    description: 'Critical decisions, safety incidents'
  }
}

const CATEGORY_CONFIG = {
  RPAS_flight: {
    label: 'RPAS Flight',
    icon: '🚁',
    color: 'bg-blue-50 text-blue-700'
  },
  marine_survey: {
    label: 'Marine Survey',
    icon: '🚢',
    color: 'bg-cyan-50 text-cyan-700'
  },
  field_logistics: {
    label: 'Field Logistics',
    icon: '🏕️',
    color: 'bg-emerald-50 text-emerald-700'
  },
  emergency: {
    label: 'Emergency Response',
    icon: '🚨',
    color: 'bg-red-50 text-red-700'
  }
}

export default function ScenarioChallenges() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const { organizationId, loading: orgLoading } = useOrganizationContext()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)
  const [scenarios, setScenarios] = useState([])
  const [attempts, setAttempts] = useState({})
  const [filter, setFilter] = useState({ category: 'all', difficulty: 'all' })
  const [sortBy, setSortBy] = useState('recommended')

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
      const [profileData, scenariosData, attemptsData] = await Promise.all([
        getUserGamificationProfile(currentUser.uid),
        getScenarios(organizationId),
        getUserScenarioAttempts(currentUser.uid)
      ])

      setProfile(profileData)
      setScenarios(scenariosData)

      // Index attempts by scenario ID
      const attemptsIndex = {}
      attemptsData.forEach(attempt => {
        if (!attemptsIndex[attempt.scenarioId]) {
          attemptsIndex[attempt.scenarioId] = []
        }
        attemptsIndex[attempt.scenarioId].push(attempt)
      })
      setAttempts(attemptsIndex)
    } catch (err) {
      console.error('Error loading scenarios:', err)
      setError('Failed to load scenarios. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function getScenarioStatus(scenario) {
    const scenarioAttempts = attempts[scenario.id] || []

    if (scenarioAttempts.length === 0) {
      return { status: 'new', bestScore: null, attemptCount: 0 }
    }

    const bestScore = Math.max(...scenarioAttempts.map(a => a.score))
    const completed = scenarioAttempts.some(a => a.completed)

    return {
      status: completed ? 'completed' : 'attempted',
      bestScore,
      attemptCount: scenarioAttempts.length
    }
  }

  function getFilteredScenarios() {
    let filtered = [...scenarios]

    // Apply category filter
    if (filter.category !== 'all') {
      filtered = filtered.filter(s => s.category === filter.category)
    }

    // Apply difficulty filter
    if (filter.difficulty !== 'all') {
      filtered = filtered.filter(s => s.difficultyTier === filter.difficulty)
    }

    // Sort
    switch (sortBy) {
      case 'recommended':
        // Show new ones first, then incomplete, then completed
        filtered.sort((a, b) => {
          const statusA = getScenarioStatus(a).status
          const statusB = getScenarioStatus(b).status
          const order = { new: 0, attempted: 1, completed: 2 }
          return order[statusA] - order[statusB]
        })
        break
      case 'difficulty':
        const diffOrder = { green: 0, yellow: 1, red: 2 }
        filtered.sort((a, b) => diffOrder[a.difficultyTier] - diffOrder[b.difficultyTier])
        break
      case 'recent':
        filtered.sort((a, b) => {
          const attemptsA = attempts[a.id] || []
          const attemptsB = attempts[b.id] || []
          const lastA = attemptsA.length > 0 ? new Date(attemptsA[0].timestamp) : new Date(0)
          const lastB = attemptsB.length > 0 ? new Date(attemptsB[0].timestamp) : new Date(0)
          return lastB - lastA
        })
        break
    }

    return filtered
  }

  function handleScenarioClick(scenario) {
    navigate(`/scenario-challenges/${scenario.id}`)
  }

  async function handleSeedContent() {
    if (!organizationId) return

    setSeeding(true)
    try {
      await seedGamificationContent(organizationId)
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

  const filteredScenarios = getFilteredScenarios()
  const completedCount = scenarios.filter(s => getScenarioStatus(s).status === 'completed').length
  const avgScore = profile?.scenarioAverageScore || 0

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <GitBranch className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Scenario Challenges</h1>
          </div>
          <p className="text-indigo-100">
            Test your decision-making in realistic field situations
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="text-sm text-indigo-100">Completed</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{scenarios.length - completedCount}</div>
              <div className="text-sm text-indigo-100">Remaining</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{avgScore ? `${Math.round(avgScore)}%` : '--'}</div>
              <div className="text-sm text-indigo-100">Avg Score</div>
            </div>
          </div>
        </div>

        {/* Performance summary */}
        <div className="lg:w-72 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
            Your Performance
          </h3>
          <div className="flex justify-center mb-4">
            <ScoreRing
              score={avgScore}
              size={100}
              strokeWidth={8}
              label="Average"
            />
          </div>
          <div className="space-y-2">
            {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => {
              const tierScenarios = scenarios.filter(s => s.difficultyTier === key)
              const completed = tierScenarios.filter(s =>
                getScenarioStatus(s).status === 'completed'
              ).length

              return (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-0.5 rounded ${config.color}`}>
                    {config.label}
                  </span>
                  <span className="text-gray-600">
                    {completed}/{tierScenarios.length}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filter:</span>
        </div>

        <select
          value={filter.category}
          onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        <select
          value={filter.difficulty}
          onChange={(e) => setFilter(prev => ({ ...prev, difficulty: e.target.value }))}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Difficulties</option>
          {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        <div className="flex-1" />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="recommended">Recommended</option>
          <option value="difficulty">By Difficulty</option>
          <option value="recent">Recently Played</option>
        </select>
      </div>

      {/* Scenario grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GitBranch className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scenarios Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started with interactive decision-making scenarios covering weather changes, battery emergencies, wildlife encounters, and more.
            </p>
            <button
              onClick={handleSeedContent}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {seeding ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Creating Scenarios...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Load Sample Scenarios
                </>
              )}
            </button>
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-xl">
            No scenarios match your filters.
          </div>
        ) : (
          filteredScenarios.map(scenario => {
            const { status, bestScore, attemptCount } = getScenarioStatus(scenario)
            const diffConfig = DIFFICULTY_CONFIG[scenario.difficultyTier]
            const catConfig = CATEGORY_CONFIG[scenario.category]

            return (
              <div
                key={scenario.id}
                onClick={() => handleScenarioClick(scenario)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-purple-200 transition-all group"
              >
                {/* Scenario header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-2xl`}>{catConfig?.icon || '📋'}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded border ${diffConfig.color}`}>
                        {diffConfig.label}
                      </span>
                      {status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {scenario.description}
                  </p>
                </div>

                {/* Scenario meta */}
                <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{scenario.estimatedMinutes || 15} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {scenario.xpReward || 50} XP
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {bestScore !== null && (
                      <span className="text-sm font-medium text-gray-700">
                        Best: {bestScore}%
                      </span>
                    )}
                    {status === 'new' && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        NEW
                      </span>
                    )}
                    {attemptCount > 0 && (
                      <span className="text-xs text-gray-400">
                        {attemptCount}x
                      </span>
                    )}
                  </div>
                </div>

                {/* Play button overlay */}
                <div className="p-4 flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors group-hover:bg-purple-700">
                    {status === 'completed' ? (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Replay
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        {status === 'attempted' ? 'Continue' : 'Start'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
