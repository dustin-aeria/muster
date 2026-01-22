/**
 * PolicyProcedureLibrary.jsx
 * Combined tabbed interface for Policies and Procedures
 *
 * Features:
 * - Tab navigation between Policies and Procedures
 * - URL-based tab state (/policies, /procedures)
 * - Preserves search/filter state within tabs
 *
 * @location src/pages/PolicyProcedureLibrary.jsx
 */

import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardList } from 'lucide-react'
import PolicyLibrary from '../components/PolicyLibrary'
import ProcedureLibrary from '../components/ProcedureLibrary'

const TABS = [
  { id: 'policies', name: 'Policies', icon: BookOpen, path: '/policies' },
  { id: 'procedures', name: 'Procedures', icon: ClipboardList, path: '/procedures' }
]

export default function PolicyProcedureLibrary() {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.startsWith('/procedures')) return 'procedures'
    return 'policies'
  }

  const [activeTab, setActiveTab] = useState(getActiveTab())

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab())
  }, [location.pathname])

  // Handle tab change
  const handleTabChange = (tabId) => {
    const tab = TABS.find(t => t.id === tabId)
    if (tab) {
      navigate(tab.path)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-aeria-navy text-aeria-navy'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'policies' ? (
          <PolicyLibrary />
        ) : (
          <ProcedureLibrary />
        )}
      </div>
    </div>
  )
}
