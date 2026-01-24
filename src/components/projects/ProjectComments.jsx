/**
 * Project Comments Component
 * Team collaboration through comments, notes, and activity tracking
 *
 * @location src/components/projects/ProjectComments.jsx
 */

import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  FileText,
  HelpCircle,
  CheckSquare,
  AlertCircle,
  Send,
  Pin,
  PinOff,
  Check,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  User,
  MoreVertical,
  Activity
} from 'lucide-react'
import {
  COMMENT_TYPES,
  ACTIVITY_TYPES,
  createComment,
  subscribeToComments,
  updateComment,
  deleteComment,
  toggleCommentResolved,
  toggleCommentPinned,
  subscribeToActivityLog
} from '../../lib/firestoreComments'
import { useAuth } from '../../contexts/AuthContext'

const TYPE_ICONS = {
  comment: MessageSquare,
  note: FileText,
  question: HelpCircle,
  action: CheckSquare,
  issue: AlertCircle
}

const ACTIVITY_ICONS = {
  created: ({ className }) => <span className={className}>+</span>,
  updated: RefreshCw,
  status_change: RefreshCw,
  assigned: User,
  commented: MessageSquare,
  uploaded: ({ className }) => <span className={className}>↑</span>,
  completed: Check
}

export default function ProjectComments({ project, operatorId }) {
  const { user, userProfile } = useAuth()
  const [comments, setComments] = useState([])
  const [activities, setActivities] = useState([])
  const [activeTab, setActiveTab] = useState('comments')
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState('comment')
  const [showResolved, setShowResolved] = useState(false)
  const [expandedComments, setExpandedComments] = useState(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const textareaRef = useRef(null)

  // Subscribe to comments
  useEffect(() => {
    if (!project?.id) return

    const unsubscribe = subscribeToComments('project', project.id, (data) => {
      setComments(data)
    })

    return () => unsubscribe()
  }, [project?.id])

  // Subscribe to activity log
  useEffect(() => {
    if (!project?.id) return

    const unsubscribe = subscribeToActivityLog('project', project.id, (data) => {
      setActivities(data)
    })

    return () => unsubscribe()
  }, [project?.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await createComment({
        entityType: 'project',
        entityId: project.id,
        operatorId,
        type: commentType,
        content: newComment.trim(),
        authorId: user?.uid,
        authorName: userProfile?.firstName
          ? `${userProfile.firstName} ${userProfile.lastName}`
          : userProfile?.email || 'Unknown User',
        authorEmail: user?.email
      })
      setNewComment('')
      setCommentType('comment')
    } catch (err) {
      // Error handled silently - comment will not appear
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleResolved = async (comment) => {
    await toggleCommentResolved(
      comment.id,
      !comment.isResolved,
      user?.uid
    )
  }

  const handleTogglePinned = async (comment) => {
    await toggleCommentPinned(comment.id, !comment.isPinned)
  }

  const handleDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId)
    }
    setMenuOpen(null)
  }

  const toggleExpanded = (commentId) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  const formatDate = (date) => {
    if (!date) return ''
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const filteredComments = showResolved
    ? comments
    : comments.filter(c => !c.isResolved)

  const unresolvedCount = comments.filter(c => !c.isResolved).length

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'comments'
              ? 'text-aeria-navy border-b-2 border-aeria-navy bg-gray-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline-block mr-2" />
          Comments
          {unresolvedCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-aeria-navy text-white rounded-full">
              {unresolvedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'activity'
              ? 'text-aeria-navy border-b-2 border-aeria-navy bg-gray-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Activity className="w-4 h-4 inline-block mr-2" />
          Activity
        </button>
      </div>

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="p-4">
          {/* New Comment Form */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex gap-2 mb-2">
              {Object.entries(COMMENT_TYPES).map(([key, config]) => {
                const Icon = TYPE_ICONS[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCommentType(key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1 transition-colors ${
                      commentType === key
                        ? config.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`Add a ${COMMENT_TYPES[commentType].label.toLowerCase()}...`}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
                rows={2}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-navy/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">
              {filteredComments.length} {filteredComments.length === 1 ? 'comment' : 'comments'}
            </span>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="rounded border-gray-300 text-aeria-navy focus:ring-aeria-navy"
              />
              Show resolved
            </label>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredComments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs">Be the first to add a comment</p>
              </div>
            ) : (
              filteredComments.map((comment) => {
                const Icon = TYPE_ICONS[comment.type] || MessageSquare
                const config = COMMENT_TYPES[comment.type] || COMMENT_TYPES.comment
                const isExpanded = expandedComments.has(comment.id)
                const isLongContent = comment.content?.length > 200

                return (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg border ${
                      comment.isResolved
                        ? 'bg-gray-50 border-gray-200 opacity-70'
                        : comment.isPinned
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-white border-gray-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded ${config.color}`}>
                          <Icon className="w-3 h-3" />
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                        {comment.isPinned && (
                          <Pin className="w-3 h-3 text-yellow-600" />
                        )}
                        {comment.isResolved && (
                          <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                            Resolved
                          </span>
                        )}
                      </div>

                      {/* Actions Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === comment.id ? null : comment.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen === comment.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => {
                                handleTogglePinned(comment)
                                setMenuOpen(null)
                              }}
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              {comment.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                              {comment.isPinned ? 'Unpin' : 'Pin'}
                            </button>
                            <button
                              onClick={() => {
                                handleToggleResolved(comment)
                                setMenuOpen(null)
                              }}
                              className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              {comment.isResolved ? 'Reopen' : 'Resolve'}
                            </button>
                            {comment.authorId === user?.uid && (
                              <button
                                onClick={() => handleDelete(comment.id)}
                                className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {isLongContent && !isExpanded
                        ? comment.content.slice(0, 200) + '...'
                        : comment.content}
                    </div>
                    {isLongContent && (
                      <button
                        onClick={() => toggleExpanded(comment.id)}
                        className="text-xs text-aeria-navy hover:underline mt-1 flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            Show more
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="p-4">
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              activities.map((activity) => {
                const config = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.updated
                const Icon = ACTIVITY_ICONS[activity.type] || RefreshCw

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="p-1.5 bg-gray-100 rounded-full">
                      <Icon className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{activity.actorName}</span>
                        {' '}
                        <span className="text-gray-500">{activity.description}</span>
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
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
