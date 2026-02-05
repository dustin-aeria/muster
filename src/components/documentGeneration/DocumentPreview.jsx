/**
 * DocumentPreview.jsx
 * Full document preview with branding and styling
 */

import { useState } from 'react'
import {
  X,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileText,
  Link2
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function DocumentPreview({
  isOpen,
  onClose,
  document,
  project,
  onExport
}) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [viewMode, setViewMode] = useState('full') // 'full' | 'section'

  if (!isOpen) return null

  const sections = document?.sections || []
  const colors = project?.branding?.colors || {
    primary: '#1e3a5f',
    secondary: '#2563eb',
    accent: '#3b82f6'
  }

  const handlePrint = () => {
    window.print()
  }

  const goToSection = (index) => {
    setCurrentSection(Math.max(0, Math.min(index, sections.length - 1)))
    setViewMode('section')
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-gray-100 ${
      isFullscreen ? '' : 'p-4'
    }`}>
      {/* Header */}
      <div className={`bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between ${
        isFullscreen ? '' : 'rounded-t-xl'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Document Preview
            </h2>
            <p className="text-sm text-gray-500">
              {document?.title || 'Untitled'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('full')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'full'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Full
            </button>
            <button
              onClick={() => setViewMode('section')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'section'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Section
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Print"
          >
            <Printer className="w-5 h-5" />
          </button>

          {onExport && (
            <button
              onClick={() => onExport(document, project)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 flex overflow-hidden ${
        isFullscreen ? '' : 'rounded-b-xl'
      }`}>
        {/* Table of Contents Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden lg:block">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Contents
            </h3>
            <nav className="space-y-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => goToSection(index)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    viewMode === 'section' && currentSection === index
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}. {section.title}
                </button>
              ))}
              {document?.crossReferences?.length > 0 && (
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <span className="px-3 text-xs font-medium text-gray-500 uppercase">
                    Appendix
                  </span>
                  <div className="mt-1 px-3 py-2 text-sm text-gray-600">
                    <Link2 className="w-4 h-4 inline mr-2" />
                    {document.crossReferences.length} Cross-References
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto bg-gray-200 p-8">
          <div
            className="max-w-4xl mx-auto bg-white shadow-lg"
            style={{
              minHeight: '11in',
              padding: '1in'
            }}
          >
            {/* Document Content */}
            {viewMode === 'full' ? (
              <FullDocumentView
                document={document}
                project={project}
                colors={colors}
              />
            ) : (
              <SectionView
                section={sections[currentSection]}
                sectionIndex={currentSection}
                totalSections={sections.length}
                colors={colors}
                onPrev={() => setCurrentSection(Math.max(0, currentSection - 1))}
                onNext={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Full document view component
function FullDocumentView({ document, project, colors }) {
  const sections = document?.sections || []

  return (
    <div className="space-y-8">
      {/* Title Page */}
      <div className="text-center pb-8 border-b-2" style={{ borderColor: colors.primary }}>
        {project?.branding?.logo && (
          <img
            src={project.branding.logo}
            alt="Logo"
            className="h-16 mx-auto mb-6"
          />
        )}
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: colors.primary }}
        >
          {document?.title || 'Untitled Document'}
        </h1>
        <p className="text-lg text-gray-600 uppercase tracking-wide">
          {document?.type?.replace(/_/g, ' ')}
        </p>
        <div className="mt-6 text-sm text-gray-500">
          <p className="font-medium">{project?.clientName || project?.branding?.name}</p>
          <p>Version {document?.version || '1.0'} • {document?.status || 'Draft'}</p>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="pb-8 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>
          Table of Contents
        </h2>
        <ol className="space-y-2">
          {sections.map((section, index) => (
            <li key={section.id} className="flex items-center gap-2">
              <span className="text-gray-500">{index + 1}.</span>
              <span>{section.title}</span>
              <span className="flex-1 border-b border-dotted border-gray-300" />
              <span className="text-gray-400 text-sm">{index + 3}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Sections */}
      {sections.map((section, index) => (
        <div key={section.id} className="pb-8 border-b border-gray-200 last:border-0">
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: colors.primary }}
          >
            {index + 1}. {section.title}
          </h2>
          {section.content ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h3 className="text-lg font-bold mt-6 mb-2">{children}</h3>,
                  h2: ({ children }) => <h4 className="text-base font-bold mt-4 mb-2">{children}</h4>,
                  h3: ({ children }) => <h5 className="text-sm font-bold mt-3 mb-1">{children}</h5>,
                  p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                  blockquote: ({ children }) => (
                    <blockquote
                      className="border-l-4 pl-4 italic my-4"
                      style={{ borderColor: colors.primary, color: '#666' }}
                    >
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {section.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-400 italic">No content in this section.</p>
          )}
        </div>
      ))}

      {/* Cross-References Appendix */}
      {document?.crossReferences?.length > 0 && (
        <div className="pt-8">
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: colors.primary }}
          >
            Appendix: Cross-References
          </h2>
          <div className="space-y-3">
            {document.crossReferences.map((ref, index) => (
              <div key={ref.id || index} className="flex items-start gap-2 text-sm">
                <span className="font-medium">{index + 1}.</span>
                <div>
                  <p className="font-medium">{ref.referenceText}</p>
                  <p className="text-gray-500 text-xs">
                    Document: {ref.targetDocumentId}
                    {ref.targetSectionId && ` • Section: ${ref.targetSectionId}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-8 mt-8 border-t border-gray-200 text-center text-xs text-gray-400">
        Generated with Muster Document Generator
      </div>
    </div>
  )
}

// Single section view component
function SectionView({ section, sectionIndex, totalSections, colors, onPrev, onNext }) {
  if (!section) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No section selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Section Header */}
      <div className="pb-4 border-b-2 mb-6" style={{ borderColor: colors.primary }}>
        <p className="text-sm text-gray-500 mb-1">
          Section {sectionIndex + 1} of {totalSections}
        </p>
        <h2
          className="text-2xl font-bold"
          style={{ color: colors.primary }}
        >
          {section.title}
        </h2>
      </div>

      {/* Section Content */}
      <div className="flex-1">
        {section.content ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h3 className="text-lg font-bold mt-6 mb-2">{children}</h3>,
                h2: ({ children }) => <h4 className="text-base font-bold mt-4 mb-2">{children}</h4>,
                h3: ({ children }) => <h5 className="text-sm font-bold mt-3 mb-1">{children}</h5>,
                p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                blockquote: ({ children }) => (
                  <blockquote
                    className="border-l-4 pl-4 italic my-4"
                    style={{ borderColor: colors.primary, color: '#666' }}
                  >
                    {children}
                  </blockquote>
                ),
              }}
            >
              {section.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-400 italic">No content in this section.</p>
        )}
      </div>

      {/* Navigation */}
      <div className="pt-6 mt-6 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={sectionIndex === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-sm text-gray-500">
          {sectionIndex + 1} / {totalSections}
        </span>
        <button
          onClick={onNext}
          disabled={sectionIndex === totalSections - 1}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
