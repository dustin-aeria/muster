/**
 * AITutor Component
 *
 * Conversational learning assistant that provides context-aware Q&A,
 * concept explanations, real-world examples, and personalized guidance
 * during training sessions.
 *
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../firebase'
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Lightbulb,
  BookOpen,
  HelpCircle,
  RefreshCw,
  ChevronDown,
  Sparkles,
  AlertCircle,
  ExternalLink
} from 'lucide-react'

// Quick action prompts for common questions
const QUICK_ACTIONS = [
  {
    id: 'explain',
    icon: BookOpen,
    label: 'Explain this',
    prompt: 'Can you explain this concept in simpler terms?'
  },
  {
    id: 'example',
    icon: Lightbulb,
    label: 'Give example',
    prompt: 'Can you give me a real-world example of this?'
  },
  {
    id: 'why',
    icon: HelpCircle,
    label: 'Why matters',
    prompt: 'Why is this important for RPAS operations?'
  },
  {
    id: 'regulation',
    icon: ExternalLink,
    label: 'Regulations',
    prompt: 'What regulations apply to this topic?'
  }
]

/**
 * Main AI Tutor Component
 */
export default function AITutor({
  currentContext = {},
  lessonContent = null,
  questId = null,
  trackId = null,
  isOpen = false,
  onToggle,
  position = 'bottom-right'
}) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  // Add welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(currentContext)
      }])
    }
  }, [isOpen])

  // Get welcome message based on context
  function getWelcomeMessage(context) {
    if (context.lessonTitle) {
      return `Hi! I'm your AI tutor. I'm here to help you understand "${context.lessonTitle}". Feel free to ask me any questions about the material, or use the quick actions below for common topics.`
    }
    if (context.questTitle) {
      return `Hello! I'm ready to help you with the "${context.questTitle}" quest. What would you like to know?`
    }
    return `Hi there! I'm your AI learning assistant. I can help explain concepts, provide examples, and answer questions about RPAS operations and safety. How can I help you today?`
  }

  // Send message to AI
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      const askTutor = httpsCallable(functions, 'askAITutor')
      const response = await askTutor({
        message: messageText,
        context: {
          ...currentContext,
          lessonContent: lessonContent?.sections?.map(s => s.content).join('\n').slice(0, 2000),
          questId,
          trackId,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      })

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        references: response.data.references
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('AI Tutor error:', err)
      setError('Unable to get a response. Please try again.')

      // Add error message
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble processing that request. Could you try rephrasing your question?",
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }, [currentContext, lessonContent, questId, trackId, messages, isLoading])

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  // Handle quick action
  const handleQuickAction = (action) => {
    sendMessage(action.prompt)
  }

  // Clear conversation
  const clearConversation = () => {
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      content: getWelcomeMessage(currentContext)
    }])
    setError(null)
  }

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`fixed ${positionClasses[position]} z-50 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 group`}
        aria-label="Open AI Tutor"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-amber-900" />
        </span>
      </button>
    )
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 transition-all ${
        isMinimized ? 'w-72 h-14' : 'w-96 h-[32rem]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AI Tutor</h3>
            {!isMinimized && (
              <p className="text-indigo-200 text-xs">Ask me anything</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-white" />
            ) : (
              <Minimize2 className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearConversation}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}

/**
 * Individual Message Component
 */
function Message({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : message.isError
            ? 'bg-red-50 text-red-800 rounded-bl-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* References */}
        {message.references && message.references.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200/50">
            <p className="text-xs text-gray-500 mb-1">References:</p>
            <div className="space-y-1">
              {message.references.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {ref.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * AI Tutor Hook for easy integration
 */
export function useAITutor(initialContext = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [context, setContext] = useState(initialContext)

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const updateContext = useCallback((newContext) => {
    setContext(prev => ({ ...prev, ...newContext }))
  }, [])

  return {
    isOpen,
    toggle,
    open,
    close,
    context,
    updateContext,
    TutorComponent: (props) => (
      <AITutor
        {...props}
        isOpen={isOpen}
        onToggle={toggle}
        currentContext={context}
      />
    )
  }
}
