/**
 * SORA AI Assistance Panel
 * Provides AI-powered guidance for SORA assessments
 *
 * @location src/components/sora/SORAIPanel.jsx
 */

import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  X,
  Target,
  Shield,
  CheckCircle,
  FileText,
  HelpCircle
} from 'lucide-react'
import { useSORAI } from '../../lib/sfocSoraAI'
import ReactMarkdown from 'react-markdown'
import { SORA_WIZARD_STEPS } from '../../lib/firestoreSora'
import { osoDefinitions } from '../../lib/soraConfig'

const SORA_STEPS = [
  { id: 'conops', label: 'ConOps Description', description: 'Concept of Operations' },
  { id: 'grc', label: 'Ground Risk Class', description: 'GRC determination and mitigations' },
  { id: 'arc', label: 'Air Risk Class', description: 'ARC assessment and tactical mitigations' },
  { id: 'sail', label: 'SAIL Determination', description: 'Specific Assurance and Integrity Level' },
  { id: 'oso', label: 'OSO Requirements', description: 'Operational Safety Objectives' },
  { id: 'containment', label: 'Containment', description: 'Adjacent area and containment assessment' },
  { id: 'portfolio', label: 'Safety Portfolio', description: 'Evidence compilation' }
]

const QUICK_QUESTIONS = [
  'What is SORA and how does the assessment work?',
  'How do I determine the correct population category?',
  'What ground mitigations can reduce my GRC?',
  'How is the SAIL level calculated?',
  'What evidence do I need for OSO compliance?'
]

export default function SORAIPanel({ soraId, assessment, onClose }) {
  const { loading, error, lastResponse, ask, getStepGuidance, getMitigationAdvice, getOSOHelp, analyzeConOpsText, clearHistory } = useSORAI(soraId)
  const [question, setQuestion] = useState('')
  const [conversation, setConversation] = useState([])
  const [showStepSelector, setShowStepSelector] = useState(false)
  const [showOSOSelector, setShowOSOSelector] = useState(false)
  const [stepGuidance, setStepGuidance] = useState(null)
  const [loadingGuidance, setLoadingGuidance] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  const handleAsk = async (e) => {
    e?.preventDefault()
    if (!question.trim() || loading) return

    const userQuestion = question.trim()
    setQuestion('')

    setConversation(prev => [...prev, { role: 'user', content: userQuestion }])

    const result = await ask(userQuestion)

    if (result.success) {
      setConversation(prev => [...prev, { role: 'assistant', content: result.message }])
    } else {
      setConversation(prev => [...prev, { role: 'error', content: result.error }])
    }
  }

  const handleQuickQuestion = (q) => {
    setQuestion(q)
    setTimeout(() => {
      const form = document.getElementById('sora-ai-form')
      form?.requestSubmit()
    }, 0)
  }

  const handleStepGuidance = async (step) => {
    setShowStepSelector(false)
    setLoadingGuidance(true)
    setActiveTab('guidance')

    const result = await getStepGuidance(step)

    if (result.success) {
      setStepGuidance({
        step: step,
        name: result.stepName,
        content: result.guidance
      })
    }
    setLoadingGuidance(false)
  }

  const handleOSOGuidance = async (osoId) => {
    setShowOSOSelector(false)
    setLoadingGuidance(true)
    setActiveTab('guidance')

    // Find required robustness for this OSO based on SAIL
    const oso = osoDefinitions.find(o => o.id === osoId)
    const requiredRobustness = oso?.requirements?.[assessment?.sail?.level] || null

    const result = await getOSOHelp(osoId, requiredRobustness)

    if (result.success) {
      setStepGuidance({
        step: osoId,
        name: `${osoId}: ${oso?.name || 'OSO Guidance'}`,
        content: result.guidance
      })
    }
    setLoadingGuidance(false)
  }

  const handleMitigationAdvice = async () => {
    setLoadingGuidance(true)
    setActiveTab('guidance')

    const result = await getMitigationAdvice()

    if (result.success) {
      setStepGuidance({
        step: 'mitigations',
        name: 'Mitigation Recommendations',
        content: result.recommendations
      })
    }
    setLoadingGuidance(false)
  }

  const handleClearConversation = () => {
    setConversation([])
    setStepGuidance(null)
    clearHistory()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">SORA AI Assistant</h3>
              <p className="text-sm text-gray-500">Get help with your SORA assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'chat'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('guidance')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'guidance'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Step Guidance
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'chat' && (
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                {/* Step Guidance */}
                <div className="relative">
                  <button
                    onClick={() => setShowStepSelector(!showStepSelector)}
                    className="w-full flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Step Help</span>
                    <ChevronDown className="w-4 h-4 text-purple-600 ml-auto" />
                  </button>

                  {showStepSelector && (
                    <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-auto">
                      {SORA_STEPS.map(step => (
                        <button
                          key={step.id}
                          onClick={() => handleStepGuidance(step.id)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="font-medium text-gray-900 text-sm">{step.label}</p>
                          <p className="text-xs text-gray-500">{step.description}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mitigation Advice */}
                <button
                  onClick={handleMitigationAdvice}
                  className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-900">Mitigations</span>
                </button>
              </div>

              {/* OSO Help */}
              <div className="relative">
                <button
                  onClick={() => setShowOSOSelector(!showOSOSelector)}
                  className="w-full flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">OSO Compliance Help</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-green-600 transition-transform ${showOSOSelector ? 'rotate-180' : ''}`} />
                </button>

                {showOSOSelector && (
                  <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-auto">
                    {osoDefinitions.slice(0, 15).map(oso => (
                      <button
                        key={oso.id}
                        onClick={() => handleOSOGuidance(oso.id)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100"
                      >
                        <p className="font-medium text-gray-900 text-sm">{oso.id}</p>
                        <p className="text-xs text-gray-500 truncate">{oso.name}</p>
                      </button>
                    ))}
                    <button
                      onClick={() => setShowOSOSelector(false)}
                      className="w-full text-center py-2 text-xs text-gray-500 hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>

              {/* Conversation */}
              {conversation.length > 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex justify-end p-2 border-b border-gray-200">
                    <button
                      onClick={handleClearConversation}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                  <div className="max-h-64 overflow-auto p-3 space-y-3">
                    {conversation.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : msg.role === 'error'
                            ? 'bg-red-50 border border-red-200 text-red-700'
                            : 'bg-white border border-gray-200'
                        }`}>
                          {msg.role === 'error' ? (
                            <div className="flex items-center gap-2 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>{msg.content}</span>
                            </div>
                          ) : msg.role === 'user' ? (
                            <p className="text-sm">{msg.content}</p>
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
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                  <div className="space-y-2">
                    {QUICK_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(q)}
                        className="w-full text-left text-sm px-3 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'guidance' && (
            <div>
              {loadingGuidance ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating guidance...</span>
                  </div>
                </div>
              ) : stepGuidance ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{stepGuidance.name}</h4>
                    <button
                      onClick={() => setStepGuidance(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <ReactMarkdown>{stepGuidance.content}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium">No guidance selected</p>
                  <p className="text-sm mt-1">Use the Step Help or OSO buttons to get guidance</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-gray-200">
          <form id="sora-ai-form" onSubmit={handleAsk} className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about SORA, GRC, ARC, SAIL, OSOs..."
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>

          {/* Context Info */}
          {assessment && (
            <p className="text-xs text-gray-400 mt-3">
              Context: {assessment.name}
              {assessment.sail?.level && ` • SAIL ${assessment.sail.level}`}
              {assessment.groundRisk?.finalGRC && ` • GRC ${assessment.groundRisk.finalGRC}`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
