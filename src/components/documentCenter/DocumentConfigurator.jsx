/**
 * Document Configurator Component
 * Section toggle list with drag-drop reordering
 *
 * @location src/components/documentCenter/DocumentConfigurator.jsx
 */

import { useState, useCallback } from 'react'
import {
  GripVertical,
  Check,
  X,
  Lock,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { getDocumentColorClasses } from '../../lib/documentTypes'

export default function DocumentConfigurator({
  documentType,
  selectedSections,
  sectionOrder,
  onSectionToggle,
  onSectionReorder
}) {
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverItem, setDragOverItem] = useState(null)

  // Get sections in the correct order
  const orderedSections = documentType?.sections || []

  // Handle drag start
  const handleDragStart = useCallback((e, sectionId) => {
    setDraggedItem(sectionId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', sectionId)
    // Add a slight delay for the ghost image
    setTimeout(() => {
      e.target.classList.add('opacity-50')
    }, 0)
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((e, sectionId) => {
    e.preventDefault()
    if (sectionId !== draggedItem) {
      setDragOverItem(sectionId)
    }
  }, [draggedItem])

  // Handle drag end
  const handleDragEnd = useCallback((e) => {
    e.target.classList.remove('opacity-50')
    setDraggedItem(null)
    setDragOverItem(null)
  }, [])

  // Handle drop
  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData('text/plain')

    if (sourceId === targetId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    // Create new order
    const currentOrder = [...sectionOrder]
    const sourceIndex = currentOrder.indexOf(sourceId)
    const targetIndex = currentOrder.indexOf(targetId)

    if (sourceIndex !== -1) {
      currentOrder.splice(sourceIndex, 1)
      currentOrder.splice(targetIndex, 0, sourceId)
      onSectionReorder(currentOrder)
    }

    setDraggedItem(null)
    setDragOverItem(null)
  }, [sectionOrder, onSectionReorder])

  // Move section up
  const handleMoveUp = useCallback((sectionId) => {
    const currentOrder = [...sectionOrder]
    const index = currentOrder.indexOf(sectionId)
    if (index > 0) {
      currentOrder.splice(index, 1)
      currentOrder.splice(index - 1, 0, sectionId)
      onSectionReorder(currentOrder)
    }
  }, [sectionOrder, onSectionReorder])

  // Move section down
  const handleMoveDown = useCallback((sectionId) => {
    const currentOrder = [...sectionOrder]
    const index = currentOrder.indexOf(sectionId)
    if (index < currentOrder.length - 1) {
      currentOrder.splice(index, 1)
      currentOrder.splice(index + 1, 0, sectionId)
      onSectionReorder(currentOrder)
    }
  }, [sectionOrder, onSectionReorder])

  // Get display order - show selected in order, then unselected
  const displayOrder = [
    ...sectionOrder.filter(id => selectedSections.includes(id)),
    ...orderedSections.filter(s => !selectedSections.includes(s.id)).map(s => s.id)
  ]

  const colors = getDocumentColorClasses(documentType?.id)

  return (
    <div className="space-y-2">
      {/* Section count */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>
          {selectedSections.length} of {orderedSections.length} sections selected
        </span>
        <span className="text-xs">Drag to reorder</span>
      </div>

      {/* Section list */}
      <div className="space-y-1">
        {displayOrder.map((sectionId, index) => {
          const section = orderedSections.find(s => s.id === sectionId)
          if (!section) return null

          const isSelected = selectedSections.includes(sectionId)
          const isFirst = index === 0
          const isLast = index === selectedSections.length - 1
          const isDragging = draggedItem === sectionId
          const isDragOver = dragOverItem === sectionId

          return (
            <div
              key={sectionId}
              draggable={isSelected}
              onDragStart={(e) => handleDragStart(e, sectionId)}
              onDragOver={(e) => handleDragOver(e, sectionId)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, sectionId)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all
                ${isSelected
                  ? `${colors.border} ${colors.bg}`
                  : 'border-gray-200 bg-gray-50'
                }
                ${isDragging ? 'opacity-50' : ''}
                ${isDragOver ? 'ring-2 ring-aeria-navy ring-offset-1' : ''}
                ${isSelected ? 'cursor-grab active:cursor-grabbing' : ''}
              `}
            >
              {/* Drag handle */}
              <div className={`
                flex-shrink-0
                ${isSelected ? 'text-gray-400' : 'text-gray-300'}
              `}>
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Checkbox */}
              <button
                onClick={() => !section.required && onSectionToggle(sectionId)}
                disabled={section.required}
                className={`
                  w-5 h-5 rounded flex items-center justify-center flex-shrink-0
                  transition-colors
                  ${section.required
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isSelected
                      ? `${colors.bg} ${colors.text} border-2 ${colors.border}`
                      : 'border-2 border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {isSelected && <Check className="w-3 h-3" />}
                {section.required && !isSelected && <Lock className="w-3 h-3" />}
              </button>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <span className={`
                  text-sm font-medium
                  ${isSelected ? 'text-gray-900' : 'text-gray-500'}
                `}>
                  {section.label}
                </span>
                {section.required && (
                  <span className="ml-2 text-xs text-gray-400">(Required)</span>
                )}
              </div>

              {/* Reorder buttons (visible on hover) */}
              {isSelected && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleMoveUp(sectionId)}
                    disabled={isFirst}
                    className={`
                      p-1 rounded hover:bg-white/50
                      ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'}
                    `}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(sectionId)}
                    disabled={isLast}
                    className={`
                      p-1 rounded hover:bg-white/50
                      ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'}
                    `}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected sections preview */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Document outline:</p>
        <div className="flex flex-wrap gap-1">
          {sectionOrder
            .filter(id => selectedSections.includes(id))
            .map((sectionId, index) => {
              const section = orderedSections.find(s => s.id === sectionId)
              if (!section) return null

              return (
                <span
                  key={sectionId}
                  className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                    ${colors.bg} ${colors.text}
                  `}
                >
                  <span className="w-4 h-4 rounded-full bg-white/50 flex items-center justify-center text-[10px] font-medium">
                    {index + 1}
                  </span>
                  {section.label}
                </span>
              )
            })}
        </div>
      </div>
    </div>
  )
}
