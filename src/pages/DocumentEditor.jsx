/**
 * DocumentEditor.jsx
 * Three-panel document editor with sections, content editor, and AI chat
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Eye,
  Save,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  GripVertical
} from 'lucide-react'
import {
  getGeneratedDocument,
  getDocumentProject,
  subscribeToDocument,
  updateDocumentSection
} from '../lib/firestoreDocumentGeneration'
import { ConversationPanel } from '../components/documentGeneration'

// Simple section editor placeholder - will be enhanced in Phase 4
function SectionEditor({ section, onChange, onSave, saving }) {
  const [content, setContent] = useState(section?.content || '')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setContent(section?.content || '')
    setHasChanges(false)
  }, [section?.id])

  const handleContentChange = (e) => {
    setContent(e.target.value)
    setHasChanges(true)
    onChange?.(e.target.value)
  }

  const handleSave = () => {
    onSave?.(content)
    setHasChanges(false)
  }

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <FileText className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Section Selected
        </h3>
        <p className="text-sm text-gray-500">
          Select a section from the sidebar to start editing.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Section Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            {section.generatedFrom && (
              <p className="text-xs text-gray-500 mt-0.5">
                Generated from AI conversation
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-4 overflow-hidden">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing or use AI to generate content..."
          className="w-full h-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
        />
      </div>
    </div>
  )
}

export default function DocumentEditor() {
  const { projectId, documentId } = useParams()
  const navigate = useNavigate()

  const [document, setDocument] = useState(null)
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [showChat, setShowChat] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load document and project
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [docData, projectData] = await Promise.all([
          getGeneratedDocument(documentId),
          getDocumentProject(projectId)
        ])

        if (!docData) {
          setError('Document not found')
          return
        }

        setDocument(docData)
        setProject(projectData)

        // Select first section by default
        if (docData.sections?.length > 0) {
          setSelectedSection(docData.sections[0])
        }
      } catch (err) {
        console.error('Error loading document:', err)
        setError('Failed to load document')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [documentId, projectId])

  // Subscribe to document updates
  useEffect(() => {
    if (!documentId) return

    const unsubscribe = subscribeToDocument(documentId, (updatedDoc) => {
      setDocument(updatedDoc)

      // Update selected section if it was updated
      if (selectedSection && updatedDoc?.sections) {
        const updated = updatedDoc.sections.find(s => s.id === selectedSection.id)
        if (updated) {
          setSelectedSection(updated)
        }
      }
    })

    return () => unsubscribe()
  }, [documentId, selectedSection?.id])

  const handleSaveSection = async (content) => {
    if (!selectedSection) return

    try {
      setSaving(true)
      await updateDocumentSection(documentId, selectedSection.id, { content })
    } catch (err) {
      console.error('Error saving section:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleContentGenerated = ({ sectionId, content }) => {
    // This will be handled more robustly in Phase 4
    console.log('Content generated for section:', sectionId, content)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
        <Link
          to={`/document-projects/${projectId}`}
          className="text-blue-600 hover:text-blue-700"
        >
          Return to project
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/document-projects/${projectId}`}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900">
                  {document?.title || 'Untitled Document'}
                </h1>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  document?.status === 'published' ? 'bg-green-100 text-green-700' :
                  document?.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                  document?.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {document?.status || 'draft'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {project?.clientName} • {document?.type?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showChat
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              AI Chat
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Eye className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sections Sidebar */}
        <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all ${
          sidebarCollapsed ? 'w-12' : 'w-64'
        }`}>
          {/* Sidebar Header */}
          <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="text-sm font-medium text-gray-700">Sections</span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Section List */}
          {!sidebarCollapsed && (
            <nav className="flex-1 overflow-y-auto p-2">
              {document?.sections?.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  No sections yet
                </div>
              ) : (
                <ul className="space-y-1">
                  {document?.sections?.map((section, index) => (
                    <li key={section.id}>
                      <button
                        onClick={() => setSelectedSection(section)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                          selectedSection?.id === section.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {section.title}
                          </p>
                          {section.content && (
                            <p className="text-xs text-gray-500 truncate">
                              {section.content.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                        {section.content ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <span className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          )}

          {/* Add Section Button */}
          {!sidebarCollapsed && (
            <div className="p-2 border-t border-gray-200">
              <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>
          )}
        </aside>

        {/* Editor Panel */}
        <main className={`flex-1 flex overflow-hidden ${showChat ? '' : ''}`}>
          <div className={`flex-1 bg-white ${showChat ? 'border-r border-gray-200' : ''}`}>
            <SectionEditor
              section={selectedSection}
              onChange={() => {}}
              onSave={handleSaveSection}
              saving={saving}
            />
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div className="w-96 flex-shrink-0 bg-white">
              <ConversationPanel
                documentId={documentId}
                document={document}
                project={project}
                currentSection={selectedSection}
                onContentGenerated={handleContentGenerated}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
