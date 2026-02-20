/**
 * Gamification Admin
 * Admin page for seeding and managing gamification content
 */

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  Database, Play, CheckCircle, AlertTriangle, Loader2,
  Trophy, GitBranch, BookOpen, Target
} from 'lucide-react'

import { seedGamificationContent } from '../lib/seedGamificationContent'

export default function GamificationAdmin() {
  const { currentUser } = useAuth()
  const { organization } = useOrganization()

  const [seeding, setSeeding] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSeedContent() {
    if (!organization?.id) {
      setError('No organization found')
      return
    }

    setSeeding(true)
    setError(null)
    setResult(null)

    try {
      const stats = await seedGamificationContent(organization.id)
      setResult(stats)
    } catch (err) {
      console.error('Error seeding content:', err)
      setError(err.message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gamification Admin</h1>
        <p className="text-gray-600 mt-1">Manage gamification content for your organization</p>
      </div>

      {/* Seed Content Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">Seed Initial Content</h2>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            This will create sample quest tracks, quests, lessons, and scenarios for your organization.
            Use this to populate initial training content.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <BookOpen className="w-4 h-4" />
              <span>4 Quest Tracks</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Trophy className="w-4 h-4" />
              <span>12 Quests</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="w-4 h-4" />
              <span>6 Lessons</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <GitBranch className="w-4 h-4" />
              <span>5 Scenarios</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Content seeded successfully!</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-green-600">
                <span>{result.questTracks} tracks</span>
                <span>{result.quests} quests</span>
                <span>{result.lessons} lessons</span>
                <span>{result.scenarios} scenarios</span>
                <span>{result.scenarioNodes} nodes</span>
              </div>
            </div>
          )}

          <button
            onClick={handleSeedContent}
            disabled={seeding}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
              ${seeding
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
              }
            `}
          >
            {seeding ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Seeding Content...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Seed Content
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Organization: {organization?.name || 'None'} ({organization?.id || 'N/A'})
          </p>
        </div>
      </div>

      {/* Content Overview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Content Overview</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Quest Tracks</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  RPAS Fundamentals (4 quests)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Field Safety (3 quests)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Emergency Response (3 quests)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                  Marine Operations (2 quests)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Scenarios</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Yellow</span>
                  The Changing Weather
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">Red</span>
                  Critical Battery Warning
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Yellow</span>
                  Bear in the Area
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">Green</span>
                  Pressure to Fly
                </li>
                <li className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">Red</span>
                  Lost Link Emergency
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
