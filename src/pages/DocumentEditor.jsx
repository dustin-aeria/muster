/**
 * DocumentEditor.jsx
 * Three-panel document editor with sections, content editor, and AI chat
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MessageSquare,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Download,
  Settings,
  Link2,
  MoreVertical
} from 'lucide-react'
import {
  getGeneratedDocument,
  getDocumentProject,
  subscribeToDocument,
  subscribeToProjectDocuments,
  updateDocumentSection,
  addDocumentSection,
  deleteDocumentSection,
  reorderDocumentSections,
  updateSharedContext,
  addCrossReference,
  removeCrossReference
} from '../lib/firestoreDocumentGeneration'
import {
  ConversationPanel,
  SectionList,
  SectionEditor,
  ContentInsertModal,
  SharedContextPanel,
  CrossReferenceManager
} from '../components/documentGeneration'

export default function DocumentEditor() {
  const { projectId, documentId } = useParams()
  const navigate = useNavigate()

  const [document, setDocument] = useState(null)
  const [project, setProject] = useState(null)
  const [projectDocuments, setProjectDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [showChat, setShowChat] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [saving, setSaving] = useState(false)

  // Content insert modal state
  const [showInsertModal, setShowInsertModal] = useState(false)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [generatingContent, setGeneratingContent] = useState(false)

  // Phase 5: Context and cross-reference state
  const [showContextPanel, setShowContextPanel] = useState(false)
  const [showCrossRefManager, setShowCrossRefManager] = useState(false)
  const [savingContext, setSavingContext] = useState(false)

  // Header menu state
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)

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

  // Subscribe to project documents for cross-references
  useEffect(() => {
    if (!projectId) return

    const unsubscribe = subscribeToProjectDocuments(projectId, (docs) => {
      setProjectDocuments(docs)
    })

    return () => unsubscribe()
  }, [projectId])

  // Section management handlers
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

  const handleReorderSections = async (newOrder) => {
    try {
      await reorderDocumentSections(documentId, newOrder)
    } catch (err) {
      console.error('Error reordering sections:', err)
    }
  }

  const handleAddSection = async () => {
    try {
      const newSection = await addDocumentSection(documentId, {
        title: 'New Section'
      })
      if (newSection) {
        setSelectedSection(newSection)
      }
    } catch (err) {
      console.error('Error adding section:', err)
    }
  }

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return

    try {
      await deleteDocumentSection(documentId, sectionId)

      // If deleted section was selected, select first available
      if (selectedSection?.id === sectionId) {
        const remaining = document?.sections?.filter(s => s.id !== sectionId)
        setSelectedSection(remaining?.[0] || null)
      }
    } catch (err) {
      console.error('Error deleting section:', err)
    }
  }

  const handleRenameSection = async (sectionId, newTitle) => {
    try {
      await updateDocumentSection(documentId, sectionId, { title: newTitle })
    } catch (err) {
      console.error('Error renaming section:', err)
    }
  }

  const handleDuplicateSection = async (sectionId) => {
    const section = document?.sections?.find(s => s.id === sectionId)
    if (!section) return

    try {
      const newSection = await addDocumentSection(documentId, {
        title: `${section.title} (Copy)`,
        content: section.content
      })
      if (newSection) {
        setSelectedSection(newSection)
      }
    } catch (err) {
      console.error('Error duplicating section:', err)
    }
  }

  // AI content generation handlers
  const handleRequestAI = (section) => {
    // Open chat panel and focus on the section
    setShowChat(true)
  }

  const handleContentGenerated = ({ sectionId, content }) => {
    // Show content insert modal
    setGeneratedContent(content)
    setShowInsertModal(true)
    setGeneratingContent(false)
  }

  const handleInsertContent = async (content) => {
    if (!selectedSection) return

    try {
      setSaving(true)
      await updateDocumentSection(documentId, selectedSection.id, {
        content,
        generatedFrom: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error inserting content:', err)
    } finally {
      setSaving(false)
      setShowInsertModal(false)
      setGeneratedContent(null)
    }
  }

  // Phase 5: Context handlers
  const handleSaveContext = async (context) => {
    try {
      setSavingContext(true)
      await updateSharedContext(projectId, context)
      // Refresh project data
      const updatedProject = await getDocumentProject(projectId)
      setProject(updatedProject)
    } catch (err) {
      console.error('Error saving context:', err)
    } finally {
      setSavingContext(false)
    }
  }

  // Phase 5: Cross-reference handlers
  const handleAddCrossReference = async (refData) => {
    try {
      await addCrossReference(documentId, refData)
    } catch (err) {
      console.error('Error adding cross-reference:', err)
    }
  }

  const handleRemoveCrossReference = async (refId) => {
    if (!window.confirm('Remove this cross-reference?')) return

    try {
      await removeCrossReference(documentId, refId)
    } catch (err) {
      console.error('Error removing cross-reference:', err)
    }
  }

  const handleNavigateToDocument = (docId, sectionId) => {
    navigate(`/document-projects/${projectId}/documents/${docId}`)
    setShowCrossRefManager(false)
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
                <span className="text-xs text-gray-400">
                  v{document?.version || '1.0'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {project?.clientName} • {document?.type?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cross-References Button */}
            <button
              onClick={() => setShowCrossRefManager(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              title="Cross-References"
            >
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">References</span>
              {document?.crossReferences?.length > 0 && (
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  {document.crossReferences.length}
                </span>
              )}
            </button>

            {/* AI Chat Toggle */}
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

            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Preview">
              <Eye className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Export">
              <Download className="w-5 h-5" />
            </button>

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showHeaderMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowHeaderMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => {
                        setShowContextPanel(true)
                        setShowHeaderMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      Shared Context
                    </button>
                    <button
                      onClick={() => {
                        setShowCrossRefManager(true)
                        setShowHeaderMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Link2 className="w-4 h-4" />
                      Manage References
                    </button>
                  </div>
                </>
              )}
            </div>
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

          {/* Section List Component */}
          <SectionList
            sections={document?.sections || []}
            selectedSectionId={selectedSection?.id}
            onSelectSection={setSelectedSection}
            onReorderSections={handleReorderSections}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onRenameSection={handleRenameSection}
            onDuplicateSection={handleDuplicateSection}
            collapsed={sidebarCollapsed}
          />
        </aside>

        {/* Editor Panel */}
        <main className="flex-1 flex overflow-hidden">
          <div className={`flex-1 bg-white ${showChat ? 'border-r border-gray-200' : ''}`}>
            <SectionEditor
              section={selectedSection}
              onSave={handleSaveSection}
              onRequestAI={handleRequestAI}
              saving={saving}
              autoSave={true}
              autoSaveDelay={2000}
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

      {/* Content Insert Modal */}
      <ContentInsertModal
        isOpen={showInsertModal}
        onClose={() => {
          setShowInsertModal(false)
          setGeneratedContent(null)
        }}
        generatedContent={generatedContent}
        sectionTitle={selectedSection?.title}
        existingContent={selectedSection?.content}
        onInsert={handleInsertContent}
        loading={generatingContent}
      />

      {/* Shared Context Panel */}
      <SharedContextPanel
        project={project}
        onSave={handleSaveContext}
        saving={savingContext}
        isOpen={showContextPanel}
        onClose={() => setShowContextPanel(false)}
      />

      {/* Cross-Reference Manager */}
      <CrossReferenceManager
        currentDocument={document}
        projectDocuments={projectDocuments}
        crossReferences={document?.crossReferences || []}
        onAddReference={handleAddCrossReference}
        onRemoveReference={handleRemoveCrossReference}
        onNavigateToDocument={handleNavigateToDocument}
        isOpen={showCrossRefManager}
        onClose={() => setShowCrossRefManager(false)}
      />
    </div>
  )
}
