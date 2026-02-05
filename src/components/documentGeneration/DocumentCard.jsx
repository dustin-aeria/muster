/**
 * DocumentCard.jsx
 * Card component for displaying individual document in a project
 */

import { Link } from 'react-router-dom'
import {
  FileText,
  MoreVertical,
  Clock,
  Edit3,
  Trash2,
  Copy,
  Download,
  ChevronRight,
  Shield,
  GraduationCap,
  Wrench,
  BookOpen,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  AlertCircle,
  CheckSquare
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { DOCUMENT_STATUSES, DOCUMENT_TYPES } from '../../lib/firestoreDocumentGeneration'

const ICON_MAP = {
  Shield,
  GraduationCap,
  Wrench,
  BookOpen,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  AlertCircle,
  CheckSquare
}

export default function DocumentCard({ document, projectId, onDelete, onDuplicate }) {
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

  const typeInfo = DOCUMENT_TYPES[document.type] || { label: document.type, icon: 'FileText' }
  const statusConfig = DOCUMENT_STATUSES[document.status] || DOCUMENT_STATUSES.draft
  const IconComponent = ICON_MAP[typeInfo.icon] || FileText

  const completedSections = document.sections?.filter(s => s.content?.trim()).length || 0
  const totalSections = document.sections?.length || 0
  const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <Link
                to={`/document-projects/${projectId}/documents/${document.id}`}
                className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
              >
                {document.title}
              </Link>
              <p className="text-xs text-gray-500">
                {typeInfo.label}
              </p>
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
                  to={`/document-projects/${projectId}/documents/${document.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Document
                </Link>
                <button
                  onClick={() => {
                    onDuplicate?.(document.id)
                    setShowMenu(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    onDelete?.(document.id)
                    setShowMenu(false)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status & Version */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <span className="text-xs text-gray-500">
            v{document.version}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Sections completed</span>
            <span>{completedSections}/{totalSections}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(document.updatedAt)}
          </div>
          <Link
            to={`/document-projects/${projectId}/documents/${document.id}`}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
          >
            Edit
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
