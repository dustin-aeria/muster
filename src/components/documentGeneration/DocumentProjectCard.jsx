/**
 * DocumentProjectCard.jsx
 * Card component displaying a document project summary
 */

import { Link } from 'react-router-dom'
import {
  FileText,
  MoreVertical,
  Clock,
  Building2,
  ChevronRight,
  CheckCircle,
  Archive
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { PROJECT_STATUSES } from '../../lib/firestoreDocumentGeneration'

export default function DocumentProjectCard({ project, onDelete, onArchive }) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const statusConfig = PROJECT_STATUSES[project.status] || PROJECT_STATUSES.active
  const documentCount = project.documentIds?.length || 0

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: project.branding?.colors?.primary || '#1e3a5f' }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <Link
                to={`/document-projects/${project.id}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {project.name}
              </Link>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Building2 className="w-3.5 h-3.5" />
                {project.clientName}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <Link
                  to={`/document-projects/${project.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                  View Project
                </Link>
                {project.status !== 'completed' && (
                  <button
                    onClick={() => {
                      onArchive?.(project.id, 'completed')
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </button>
                )}
                {project.status !== 'archived' && (
                  <button
                    onClick={() => {
                      onArchive?.(project.id, 'archived')
                      setShowMenu(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                )}
                <hr className="my-1" />
                <button
                  onClick={() => {
                    onDelete?.(project.id)
                    setShowMenu(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  Delete Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <span className="text-gray-500">
            {documentCount} {documentCount === 1 ? 'document' : 'documents'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Updated {formatDate(project.updatedAt)}
          </div>
          <Link
            to={`/document-projects/${project.id}`}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Open
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
