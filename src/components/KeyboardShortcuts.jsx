/**
 * Keyboard Shortcuts Help Modal
 * Shows all available keyboard shortcuts
 *
 * @location src/components/KeyboardShortcuts.jsx
 */

import { useEffect, useState } from 'react'
import { X, Keyboard, Command, Search, Home, FileText, Settings, Plus, HelpCircle } from 'lucide-react'

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['g', 'h'], description: 'Go to Dashboard (Home)', icon: Home },
      { keys: ['g', 'p'], description: 'Go to Projects', icon: FileText },
      { keys: ['g', 's'], description: 'Go to Settings', icon: Settings },
      { keys: ['g', 'c'], description: 'Go to Calendar', icon: FileText }
    ]
  },
  {
    category: 'Global',
    items: [
      { keys: ['Cmd/Ctrl', 'K'], description: 'Open Command Palette', icon: Search },
      { keys: ['?'], description: 'Show Keyboard Shortcuts', icon: HelpCircle },
      { keys: ['Esc'], description: 'Close Modal / Cancel', icon: X }
    ]
  },
  {
    category: 'Quick Actions',
    items: [
      { keys: ['c'], description: 'Create New Project', icon: Plus },
      { keys: ['n', 'p'], description: 'New Project', icon: Plus },
      { keys: ['n', 'i'], description: 'New Incident Report', icon: Plus }
    ]
  }
]

export default function KeyboardShortcuts({ isOpen, onClose }) {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const formatKey = (key) => {
    if (key === 'Cmd/Ctrl') {
      return isMac ? '⌘' : 'Ctrl'
    }
    return key
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-aeria-sky flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-aeria-navy" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
              <p className="text-sm text-gray-500">Quick actions to boost your productivity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="space-y-8">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, index) => {
                    const Icon = shortcut.icon
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{shortcut.description}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <span key={keyIndex} className="flex items-center">
                              {keyIndex > 0 && (
                                <span className="text-gray-400 mx-1">+</span>
                              )}
                              <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded shadow-sm min-w-[24px] text-center">
                                {formatKey(key)}
                              </kbd>
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer tip */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Command className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Pro Tip</p>
                <p className="text-sm text-blue-700">
                  Press <kbd className="px-1.5 py-0.5 text-xs bg-white border rounded mx-1">?</kbd> anytime to open this help menu.
                  Use <kbd className="px-1.5 py-0.5 text-xs bg-white border rounded mx-1">{isMac ? '⌘' : 'Ctrl'}+K</kbd> for the command palette.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
