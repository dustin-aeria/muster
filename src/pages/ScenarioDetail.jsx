/**
 * Scenario Detail Page
 * Branching narrative scenario player
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  ArrowLeft, GitBranch, CheckCircle, AlertTriangle,
  Zap, Clock, Award, RotateCcw, ChevronRight
} from 'lucide-react'

import {
  getScenarioWithNodes,
  getUserGamificationProfile,
  submitScenarioAttempt
} from '../lib/firestoreGamification'

import { ScoreRing } from '../components/gamification/shared/ProgressRing'
import { XPGainAnimation } from '../components/gamification/shared/XPDisplay'

export default function ScenarioDetail() {
  const { scenarioId } = useParams()
  const { user: currentUser, loading: authLoading } = useAuth()
  const { organization, loading: orgLoading } = useOrganization()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [scenario, setScenario] = useState(null)
  const [nodes, setNodes] = useState([])
  const [profile, setProfile] = useState(null)
  const [currentNode, setCurrentNode] = useState(null)
  const [decisionHistory, setDecisionHistory] = useState([])
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [xpGain, setXpGain] = useState(null)

  useEffect(() => {
    if (authLoading || orgLoading) return

    if (currentUser?.uid && scenarioId && organization?.id) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [currentUser, scenarioId, organization, authLoading, orgLoading])

  async function loadData() {
    if (!organization?.id) return

    setLoading(true)
    setError(null)

    try {
      const [scenarioData, profileData] = await Promise.all([
        getScenarioWithNodes(organization.id, scenarioId),
        getUserGamificationProfile(currentUser.uid)
      ])

      if (!scenarioData) {
        setError('Scenario not found')
        return
      }

      setScenario(scenarioData)
      const nodesData = scenarioData.nodes || []
      setNodes(nodesData)
      setProfile(profileData)

      // Check if scenario has nodes
      if (nodesData.length === 0) {
        setError('This scenario is still being developed. Please try another one.')
        return
      }

      // Find the starting node (order: 1 or first narrative node)
      const startNode = nodesData.find(n => n.order === 1) || nodesData.find(n => n.type === 'narrative') || nodesData[0]
      setCurrentNode(startNode)
      setScore(50) // Start with base score
    } catch (err) {
      console.error('Error loading scenario:', err)
      setError('Failed to load scenario. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleDecision(decision) {
    // Record decision
    setDecisionHistory(prev => [...prev, {
      nodeId: currentNode.id,
      decisionId: decision.id,
      decisionText: decision.text,
      scoreImpact: decision.scoreImpact,
      isOptimal: decision.isOptimal
    }])

    // Update score
    setScore(prev => Math.max(0, Math.min(100, prev + decision.scoreImpact)))

    // Find next node
    const nextNode = nodes.find(n => n.id === decision.nextNodeId)

    if (nextNode) {
      setCurrentNode(nextNode)

      // Check if this is an ending
      if (nextNode.isEnding || nextNode.type === 'ending') {
        handleComplete(nextNode)
      }
    } else {
      // No next node found - treat as ending
      handleComplete(currentNode)
    }
  }

  async function handleComplete(endingNode) {
    setIsComplete(true)

    // Calculate final score
    const finalScore = endingNode?.finalScore || score

    // Submit attempt - convert decisionHistory to pathTaken format
    try {
      const pathTaken = decisionHistory.map(d => ({
        nodeId: d.nodeId,
        decisionId: d.decisionId
      }))

      const result = await submitScenarioAttempt(
        currentUser.uid,
        scenarioId,
        pathTaken,
        organization.id
      )

      if (result?.xpEarned) {
        setXpGain(result.xpEarned)
      }
    } catch (err) {
      console.error('Error submitting scenario attempt:', err)
    }
  }

  function handleRestart() {
    setIsComplete(false)
    setDecisionHistory([])
    setScore(50)
    const startNode = nodes.find(n => n.order === 1) || nodes.find(n => n.type === 'narrative') || nodes[0]
    setCurrentNode(startNode)
    setXpGain(null)
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
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/scenario-challenges')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Scenarios
        </button>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* XP Animation */}
      {xpGain && (
        <XPGainAnimation xp={xpGain} onComplete={() => setXpGain(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/scenario-challenges')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Scenarios
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-600">
            <Zap className="w-5 h-5" />
            <span className="font-medium">{scenario?.xpReward} XP</span>
          </div>
          <ScoreRing score={score} size={48} strokeWidth={4} />
        </div>
      </div>

      {/* Scenario Title */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <GitBranch className="w-6 h-6" />
          <h1 className="text-2xl font-bold">{scenario?.title}</h1>
        </div>
        <p className="text-indigo-100">{scenario?.description}</p>

        {/* Context info */}
        {scenario?.contextData && (
          <div className="mt-4 pt-4 border-t border-indigo-400/30 grid grid-cols-2 gap-3 text-sm">
            {scenario.contextData.weather && (
              <div>
                <span className="text-indigo-200">Weather:</span>{' '}
                {scenario.contextData.weather.conditions}
              </div>
            )}
            {scenario.contextData.terrain && (
              <div>
                <span className="text-indigo-200">Location:</span>{' '}
                {scenario.contextData.terrain}
              </div>
            )}
            {scenario.contextData.equipment?.aircraft && (
              <div>
                <span className="text-indigo-200">Aircraft:</span>{' '}
                {scenario.contextData.equipment.aircraft}
              </div>
            )}
            {scenario.contextData.crewComposition && (
              <div>
                <span className="text-indigo-200">Crew:</span>{' '}
                {scenario.contextData.crewComposition.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current Node */}
      {!isComplete && currentNode && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Narrative content */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <p className="text-gray-800 text-lg leading-relaxed">
              {currentNode.content}
            </p>
          </div>

          {/* Decisions */}
          {currentNode.decisions && currentNode.decisions.length > 0 && (
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">What do you do?</h3>
              <div className="space-y-3">
                {currentNode.decisions.map((decision) => (
                  <button
                    key={decision.id}
                    onClick={() => handleDecision(decision)}
                    className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 group-hover:text-purple-900">
                        {decision.text}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion screen */}
      {isComplete && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <ScoreRing score={score} size={120} strokeWidth={8} showLabel />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {score >= 80 ? 'Excellent Work!' : score >= 60 ? 'Good Decisions!' : score >= 40 ? 'Room for Improvement' : 'Learning Opportunity'}
          </h2>

          {currentNode?.content && (
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              {currentNode.content}
            </p>
          )}

          {/* Decision review */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left max-w-lg mx-auto">
            <h3 className="font-medium text-gray-900 mb-3">Your Decisions:</h3>
            <div className="space-y-2">
              {decisionHistory.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {d.isOptimal ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  )}
                  <span className={d.isOptimal ? 'text-green-700' : 'text-amber-700'}>
                    {d.decisionText}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/scenario-challenges')}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              More Scenarios
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {decisionHistory.length} decision{decisionHistory.length !== 1 ? 's' : ''} made
      </div>
    </div>
  )
}
