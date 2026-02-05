/**
 * ConversationPanel.jsx
 * Main chat interface for document generation conversations
 */

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import { subscribeToConversation, addConversationMessage } from '../../lib/firestoreDocumentGeneration'
import ConversationMessage from './ConversationMessage'
import MessageInput from './MessageInput'
import ContextStatusBar from './ContextStatusBar'
import KnowledgeBasePanel from './KnowledgeBasePanel'

export default function ConversationPanel({
  documentId,
  document,
  project,
  currentSection = null,
  onContentGenerated
}) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tokenUsage, setTokenUsage] = useState({ promptTokens: 0, completionTokens: 0 })
  const [referencedDocs, setReferencedDocs] = useState([])
  const [kbLoading, setKbLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Subscribe to conversation messages
  useEffect(() => {
    if (!documentId) return

    const unsubscribe = subscribeToConversation(documentId, (newMessages) => {
      setMessages(newMessages)

      // Calculate total token usage
      const usage = newMessages.reduce((acc, msg) => {
        if (msg.tokenUsage) {
          acc.promptTokens += msg.tokenUsage.promptTokens || 0
          acc.completionTokens += msg.tokenUsage.completionTokens || 0
        }
        return acc
      }, { promptTokens: 0, completionTokens: 0 })
      setTokenUsage(usage)

      // Collect referenced KB docs
      const kbDocs = []
      newMessages.forEach(msg => {
        if (msg.contextSnapshot?.knowledgeBaseDocsUsed) {
          msg.contextSnapshot.knowledgeBaseDocsUsed.forEach(doc => {
            if (!kbDocs.find(d => d.id === doc.id)) {
              kbDocs.push(doc)
            }
          })
        }
      })
      setReferencedDocs(kbDocs)
    })

    return () => unsubscribe()
  }, [documentId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content) => {
    if (!content.trim() || loading) return

    setError(null)
    setLoading(true)
    setKbLoading(true)

    try {
      // Add user message optimistically
      const userMessage = {
        role: 'user',
        content: content.trim(),
        createdAt: new Date()
      }

      // Call Cloud Function
      const sendDocumentMessage = httpsCallable(functions, 'sendDocumentMessage')
      const result = await sendDocumentMessage({
        documentId,
        message: content.trim(),
        sectionId: currentSection?.id || null
      })

      setKbLoading(false)

      // Handle response
      if (result.data) {
        // If content was generated for a section, notify parent
        if (result.data.generatedContent && onContentGenerated) {
          onContentGenerated({
            sectionId: currentSection?.id,
            content: result.data.generatedContent
          })
        }

        // Update referenced docs from response
        if (result.data.knowledgeBaseDocsUsed) {
          setReferencedDocs(prev => {
            const newDocs = [...prev]
            result.data.knowledgeBaseDocsUsed.forEach(doc => {
              if (!newDocs.find(d => d.id === doc.id)) {
                newDocs.push(doc)
              }
            })
            return newDocs
          })
        }
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err.message || 'Failed to send message. Please try again.')
      setKbLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
      if (lastUserMessage) {
        handleSendMessage(lastUserMessage.content)
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Context Status Bar */}
      <ContextStatusBar
        tokenUsage={tokenUsage}
        messageCount={messages.length}
        knowledgeBaseDocsCount={referencedDocs.length}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Empty State */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a Conversation
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-4">
              Ask questions about your document, request content generation, or get help with compliance requirements.
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Try asking:</p>
              <ul className="space-y-1">
                <li>"Generate content for the policy section"</li>
                <li>"What are the key requirements for {document?.type || 'this document'}?"</li>
                <li>"Review this section for compliance gaps"</li>
              </ul>
            </div>
          </div>
        )}

        {/* Message List */}
        {messages.map((message, index) => (
          <ConversationMessage
            key={message.id || index}
            message={message}
            isLast={index === messages.length - 1}
          />
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Thinking</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Knowledge Base Panel */}
      <KnowledgeBasePanel
        referencedDocs={referencedDocs}
        loading={kbLoading}
        onViewDocument={(doc) => {
          // Could open document in new tab or modal
          console.log('View document:', doc)
        }}
      />

      {/* Message Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={!documentId}
        loading={loading}
        placeholder={
          currentSection
            ? `Ask about "${currentSection.title}" or request content...`
            : 'Ask about the document or request content...'
        }
        currentSection={currentSection?.title}
      />
    </div>
  )
}
