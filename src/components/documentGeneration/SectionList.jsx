/**
 * SectionList.jsx
 * Draggable section navigation for document editor
 */

import { useState } from 'react'
import {
  GripVertical,
  Plus,
  ChevronRight,
  CheckCircle,
  Circle,
  MoreVertical,
  Trash2,
  Edit3,
  Copy
} from 'lucide-react'

export default function SectionList({
  sections = [],
  selectedSectionId,
  onSelectSection,
  onReorderSections,
  onAddSection,
  onDeleteSection,
  onRenameSection,
  onDuplicateSection,
  collapsed = false
}) {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Create new order
    const newSections = [...sections]
    const [removed] = newSections.splice(draggedIndex, 1)
    newSections.splice(dropIndex, 0, removed)

    // Get new section IDs in order
    const newOrder = newSections.map(s => s.id)
    onReorderSections?.(newOrder)

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const startRename = (section) => {
    setEditingId(section.id)
    setEditTitle(section.title)
    setMenuOpenId(null)
  }

  const saveRename = () => {
    if (editTitle.trim() && editingId) {
      onRenameSection?.(editingId, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveRename()
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditTitle('')
    }
  }

  const getSectionProgress = (section) => {
    if (!section.content) return 0
    const wordCount = section.content.trim().split(/\s+/).length
    if (wordCount < 50) return 25
    if (wordCount < 200) return 50
    if (wordCount < 500) return 75
    return 100
  }

  if (collapsed) {
    return (
      <div className="py-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onSelectSection?.(section)}
            className={`w-full p-2 flex items-center justify-center ${
              selectedSectionId === section.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            title={section.title}
          >
            {section.content ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Section List */}
      <nav className="flex-1 overflow-y-auto p-2">
        {sections.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No sections yet
          </div>
        ) : (
          <ul className="space-y-1">
            {sections.map((section, index) => {
              const progress = getSectionProgress(section)
              const isSelected = selectedSectionId === section.id
              const isDragging = draggedIndex === index
              const isDragOver = dragOverIndex === index

              return (
                <li
                  key={section.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative ${isDragging ? 'opacity-50' : ''}`}
                >
                  {/* Drop indicator */}
                  {isDragOver && (
                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded" />
                  )}

                  <div
                    className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Section Content */}
                    <button
                      onClick={() => onSelectSection?.(section)}
                      className="flex-1 min-w-0 text-left"
                    >
                      {editingId === section.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={saveRename}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <p className="text-sm font-medium truncate">
                            {section.title}
                          </p>
                          {/* Progress bar */}
                          <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                progress === 100
                                  ? 'bg-green-500'
                                  : progress >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-300'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </>
                      )}
                    </button>

                    {/* Status Icon */}
                    {progress === 100 ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                        isSelected ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                    )}

                    {/* Menu Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuOpenId(menuOpenId === section.id ? null : section.id)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {menuOpenId === section.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpenId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                startRename(section)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit3 className="w-4 h-4" />
                              Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDuplicateSection?.(section.id)
                                setMenuOpenId(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate
                            </button>
                            <hr className="my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteSection?.(section.id)
                                setMenuOpenId(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </nav>

      {/* Add Section Button */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={onAddSection}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>
    </div>
  )
}
