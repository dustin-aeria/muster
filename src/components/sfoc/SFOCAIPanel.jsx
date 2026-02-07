/**
 * SFOC AI Assistance Panel
 * Provides AI-powered guidance for SFOC applications
 *
 * @location src/components/sfoc/SFOCAIPanel.jsx
 */

import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  Loader2,
  FileText,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  X,
  HelpCircle,
  Lightbulb
} from 'lucide-react'
import { useSFOCAI, getSFOCDocumentGuidance } from '../../lib/sfocSoraAI'
import ReactMarkdown from 'react-markdown'

const DOCUMENT_TYPES = [
  { id: 'conops', label: 'Concept of Operations', description: 'Detailed operational description' },
  { id: 'safety_plan', label: 'Safety Plan', description: 'Risk mitigations and procedures' },
  { id: 'erp', label: 'Emergency Response Plan', description: 'Contingency procedures' },
  { id: 'risk_assessment', label: 'Risk Assessment', description: 'SORA or equivalent methodology' },
  { id: 'pilot_quals', label: 'Pilot Qualifications', description: 'Training and certification' },
  { id: 'aircraft_docs', label: 'Aircraft Documentation', description: 'Specifications and maintenance' },
  { id: 'insurance', label: 'Insurance', description: 'Liability coverage documentation' },
  { id: 'maintenance', label: 'Maintenance Records', description: 'Aircraft maintenance history' }
]

const QUICK_QUESTIONS = [
  'What documents are required for my SFOC application?',
  'How long does Transport Canada take to process applications?',
  'What are the most common reasons for SFOC rejection?',
  'What should I include in my Concept of Operations?',
  'How do I demonstrate pilot competency?'
]

export default function SFOCAIPanel({ sfocId, application }) {
  const { loading, error, lastResponse, ask, getDocumentGuidance, clearHistory } = useSFOCAI(sfocId)
  const [question, setQuestion] = useState('')
  const [conversation, setConversation] = useState([])
  const [showDocSelector, setShowDocSelector] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState(null)
  const [docGuidance, setDocGuidance] = useState(null)
  const [loadingDoc, setLoadingDoc] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  const handleAsk = async (e) => {
    e?.preventDefault()
    if (!question.trim() || loading) return

    const userQuestion = question.trim()
    setQuestion('')

    // Add user message to conversation
    setConversation(prev => [...prev, { role: 'user', content: userQuestion }])

    // Get AI response
    const result = await ask(userQuestion)

    if (result.success) {
      setConversation(prev => [...prev, { role: 'assistant', content: result.message }])
    } else {
      setConversation(prev => [...prev, { role: 'error', content: result.error }])
    }
  }

  const handleQuickQuestion = (q) => {
    setQuestion(q)
    // Trigger ask after state update
    setTimeout(() => {
      const form = document.getElementById('sfoc-ai-form')
      form?.requestSubmit()
    }, 0)
  }

  const handleDocumentGuidance = async (docType) => {
    setSelectedDocType(docType)
    setShowDocSelector(false)
    setLoadingDoc(true)

    const result = await getDocumentGuidance(docType)

    if (result.success) {
      setDocGuidance({
        type: docType,
        name: result.documentName,
        content: result.guidance
      })
    }
    setLoadingDoc(false)
  }

  const handleClearConversation = () => {
    setConversation([])
    setDocGuidance(null)
    clearHistory()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">SFOC AI Assistant</h3>
            <p className="text-sm text-gray-500">Get guidance on Transport Canada SFOC requirements</p>
          </div>
        </div>
        {conversation.length > 0 && (
          <button
            onClick={handleClearConversation}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Clear conversation
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document Guidance Button */}
        <div className="relative">
          <button
            onClick={() => setShowDocSelector(!showDocSelector)}
            className="w-full flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div className="text-left">
                <p className="font-medium text-indigo-900">Document Guidance</p>
                <p className="text-sm text-indigo-600">Get help preparing specific documents</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-indigo-600 transition-transform ${showDocSelector ? 'rotate-180' : ''}`} />
          </button>

          {showDocSelector && (
            <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-auto">
              {DOCUMENT_TYPES.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentGuidance(doc.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <p className="font-medium text-gray-900">{doc.label}</p>
                  <p className="text-sm text-gray-500">{doc.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Questions Button */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <p className="font-medium text-purple-900">Quick Questions</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.slice(0, 2).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                className="text-xs px-3 py-1.5 bg-white border border-purple-200 rounded-full text-purple-700 hover:bg-purple-100 transition-colors truncate max-w-full"
                title={q}
              >
                {q.length > 35 ? q.substring(0, 35) + '...' : q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Document Guidance Display */}
      {loadingDoc && (
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating document guidance...</span>
          </div>
        </div>
      )}

      {docGuidance && !loadingDoc && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-indigo-50 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-indigo-900">{docGuidance.name}</span>
            </div>
            <button
              onClick={() => setDocGuidance(null)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 prose prose-sm max-w-none">
            <ReactMarkdown>{docGuidance.content}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Conversation */}
      {conversation.length > 0 && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="max-h-96 overflow-auto p-4 space-y-4">
            {conversation.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : msg.role === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-white border border-gray-200'
                }`}>
                  {msg.role === 'error' ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{msg.content}</span>
                    </div>
                  ) : msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Quick Question Suggestions */}
      {conversation.length === 0 && !docGuidance && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                className="text-sm px-3 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form id="sfoc-ai-form" onSubmit={handleAsk} className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about SFOC requirements, documents, or process..."
          className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && !loading && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Application Context Info */}
      {application && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            AI assistance is aware of your application context: {application.name}
            {application.complexityLevel && ` (${application.complexityLevel} complexity)`}
            {application.operationTriggers?.length > 0 && ` - ${application.operationTriggers.length} operation triggers`}
          </p>
        </div>
      )}
    </div>
  )
}
