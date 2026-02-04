/**
 * ProjectActivities.jsx
 * Activities tab for project view
 *
 * @location src/components/projects/ProjectActivities.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Timer,
  Plus,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  RefreshCw,
  TrendingUp
} from 'lucide-react'
import {
  getActivitiesByProject,
  calculateActivityTotals,
  formatDuration,
  ACTIVITY_CATEGORIES
} from '../../lib/firestoreActivities'
import { logger } from '../../lib/logger'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import ActivityForm from '../activities/ActivityForm'
import ActivityList from '../activities/ActivityList'

export default function ProjectActivities({ project }) {
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)

  // Load activities
  useEffect(() => {
    if (project?.id) {
      loadActivities()
    }
  }, [project?.id])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const data = await getActivitiesByProject(project.id)
      setActivities(data)
    } catch (err) {
      logger.error('Failed to load activities:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals
  const totals = useMemo(() => {
    return calculateActivityTotals(activities)
  }, [activities])

  // Handle edit
  const handleEdit = (activity) => {
    setEditingActivity(activity)
    setShowForm(true)
  }

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false)
    setEditingActivity(null)
  }

  // Handle form save/start
  const handleFormSaved = () => {
    loadActivities()
    handleFormClose()
  }

  // Handle activity started
  const handleActivityStarted = (newActivity) => {
    loadActivities()
    handleFormClose()
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Timer className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Activities</h2>
            <p className="text-sm text-gray-500">
              Track field activities with real-time timers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadActivities}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-green-500 hover:bg-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Activity
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Time */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Time</p>
              <p className="text-xl font-bold">{formatDuration(totals.totalSeconds)}</p>
            </div>
          </div>
        </Card>

        {/* Active */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold text-green-600">
                {totals.byStatus.active}
              </p>
            </div>
          </div>
        </Card>

        {/* Paused */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Pause className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paused</p>
              <p className="text-xl font-bold text-yellow-600">
                {totals.byStatus.paused}
              </p>
            </div>
          </div>
        </Card>

        {/* Completed */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-blue-600">
                {totals.byStatus.completed}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(totals.byCategory).length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">By Category</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(totals.byCategory).map(([category, data]) => {
              const categoryInfo = ACTIVITY_CATEGORIES[category] || ACTIVITY_CATEGORIES.other
              return (
                <div
                  key={category}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${categoryInfo.color}`}
                >
                  <span className="text-sm font-medium">
                    {categoryInfo.label}
                  </span>
                  <span className="text-sm">
                    {data.count} ({formatDuration(data.seconds)})
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Activities List */}
      <Card className="p-4">
        <ActivityList
          activities={activities}
          onEdit={handleEdit}
          onRefresh={loadActivities}
        />
      </Card>

      {/* Activity Form Modal */}
      {showForm && (
        <ActivityForm
          activity={editingActivity}
          projectId={project.id}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
          onStarted={handleActivityStarted}
        />
      )}
    </div>
  )
}
