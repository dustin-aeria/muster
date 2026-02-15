import { useState } from 'react'
import PropTypes from 'prop-types'
import {
  X,
  Send,
  Users,
  Bell,
  Mail,
  MessageSquare,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  Calendar,
  CheckCircle2,
  FileCheck
} from 'lucide-react'
import {
  sendManualNotification,
  sendTeamNotification,
  MESSAGE_TEMPLATES
} from '../../lib/teamNotificationService'

const PRESET_TEMPLATES = [
  {
    id: 'dailyPlan',
    label: 'Daily Briefing',
    icon: Calendar,
    description: 'Send daily briefing/plan to selected lists'
  },
  {
    id: 'goNoGo',
    label: 'GO/NO GO Update',
    icon: CheckCircle2,
    description: 'Manual GO/NO GO notification'
  },
  {
    id: 'custom',
    label: 'Custom Message',
    icon: MessageSquare,
    description: 'Write a custom notification'
  }
]

export default function SendNotificationModal({ project, distributionLists, onClose, onSent }) {
  const [step, setStep] = useState('template') // 'template' | 'compose' | 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState('custom')
  const [selectedLists, setSelectedLists] = useState([])
  const [selectedChannels, setSelectedChannels] = useState(['inApp'])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  // Get crew info for templates
  const pic = project.crew?.find(c => c.role === 'PIC')
  const crewNames = project.crew?.map(c => c.operatorName || c.name).filter(Boolean) || []

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId)

    if (templateId === 'dailyPlan') {
      const templateData = {
        projectName: project.name || 'Unnamed Project',
        date: new Date().toISOString(),
        location: project.siteSurvey?.address || project.location || 'See project details',
        pic: pic?.operatorName || pic?.name || 'Not assigned',
        crew: crewNames,
        operation: project.needsAnalysis?.operationType || 'RPAS Operation',
        maxAltitude: project.flightPlan?.maxAltitude || '',
        weatherSummary: project.tailgate?.days?.[0]?.weatherData?.conditions || 'Check current conditions'
      }
      setTitle(MESSAGE_TEMPLATES.dailyPlan.title(templateData))
      setBody(MESSAGE_TEMPLATES.dailyPlan.body(templateData))
    } else if (templateId === 'goNoGo') {
      const tailgate = project.tailgate?.days?.[0] || {}
      const templateData = {
        projectName: project.name || 'Unnamed Project',
        decision: tailgate.goNoGoDecision ? 'GO' : 'NO-GO',
        date: new Date().toISOString(),
        pic: pic?.operatorName || pic?.name || 'Not assigned',
        notes: tailgate.goNoGoNotes || ''
      }
      setTitle(MESSAGE_TEMPLATES.goNoGo.title(templateData))
      setBody(MESSAGE_TEMPLATES.goNoGo.body(templateData))
    } else {
      setTitle('')
      setBody('')
    }

    setStep('compose')
  }

  const handleToggleList = (listId) => {
    setSelectedLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    )
  }

  const handleToggleChannel = (channel) => {
    setSelectedChannels(prev => {
      if (prev.includes(channel)) {
        // Don't allow removing the last channel
        if (prev.length === 1) return prev
        return prev.filter(c => c !== channel)
      }
      return [...prev, channel]
    })
  }

  const getRecipientCount = () => {
    let count = 0
    selectedLists.forEach(listId => {
      const list = distributionLists.find(l => l.id === listId)
      if (list) {
        count += list.members?.length || 0
      }
    })
    return count
  }

  const handleSend = async () => {
    if (selectedLists.length === 0) {
      setError('Please select at least one distribution list')
      return
    }

    if (!title.trim()) {
      setError('Please enter a notification title')
      return
    }

    if (!body.trim()) {
      setError('Please enter a notification message')
      return
    }

    setSending(true)
    setError(null)

    try {
      const sendResult = await sendManualNotification(project.id, {
        title: title.trim(),
        body: body.trim(),
        listIds: selectedLists,
        channels: selectedChannels,
        priority: 'normal',
        createdBy: null // Could pass current user ID
      })

      setResult(sendResult)
      setStep('done')

      // Notify parent after a short delay
      setTimeout(() => {
        onSent()
      }, 2000)
    } catch (err) {
      console.error('Failed to send notification:', err)
      setError(err.message || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const recipientCount = getRecipientCount()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-aeria-blue" />
            Send Notification
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            disabled={sending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Template Selection Step */}
          {step === 'template' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Choose a notification template or create a custom message:
              </p>
              {PRESET_TEMPLATES.map((template) => {
                const Icon = template.icon
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.id)}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-aeria-blue hover:bg-aeria-blue/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{template.label}</p>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Compose Step */}
          {step === 'compose' && (
            <div className="space-y-4">
              {/* Back Button */}
              <button
                onClick={() => setStep('template')}
                className="text-sm text-aeria-blue hover:text-aeria-navy"
              >
                ← Back to templates
              </button>

              {/* Title */}
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Notification title"
                />
              </div>

              {/* Body */}
              <div>
                <label className="label">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="input min-h-[150px] font-mono text-sm"
                  placeholder="Notification message..."
                />
              </div>

              {/* Distribution Lists */}
              <div>
                <label className="label">Recipients</label>
                {distributionLists.length === 0 ? (
                  <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                    No distribution lists available. Create one first.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {distributionLists.map((list) => {
                      const isSelected = selectedLists.includes(list.id)
                      const memberCount = list.members?.length || 0

                      return (
                        <button
                          key={list.id}
                          onClick={() => handleToggleList(list.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-aeria-blue/5 border-aeria-blue'
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${
                              isSelected ? 'bg-aeria-blue text-white' : 'bg-gray-200'
                            }`}>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{list.name}</p>
                              <p className="text-xs text-gray-500">{memberCount} members</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Channels */}
              <div>
                <label className="label">Delivery Channels</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleToggleChannel('inApp')}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 border ${
                      selectedChannels.includes('inApp')
                        ? 'bg-aeria-blue text-white border-aeria-blue'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    In-App
                  </button>
                  <button
                    onClick={() => handleToggleChannel('email')}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 border ${
                      selectedChannels.includes('email')
                        ? 'bg-aeria-blue text-white border-aeria-blue'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    onClick={() => handleToggleChannel('sms')}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 border ${
                      selectedChannels.includes('sms')
                        ? 'bg-aeria-blue text-white border-aeria-blue'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    SMS
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Email via Resend, SMS via Twilio.
                </p>
              </div>

              {/* Preview */}
              <button
                onClick={() => setStep('preview')}
                disabled={!title || !body || selectedLists.length === 0}
                className="w-full py-2 text-sm text-aeria-blue hover:text-aeria-navy flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                Preview Notification
              </button>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Back Button */}
              <button
                onClick={() => setStep('compose')}
                className="text-sm text-aeria-blue hover:text-aeria-navy"
              >
                ← Back to edit
              </button>

              {/* Preview Card */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-aeria-blue" />
                  {title}
                </h3>
                <pre className="mt-3 text-sm text-gray-600 whitespace-pre-wrap font-sans">
                  {body}
                </pre>
              </div>

              {/* Summary */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Delivery Summary</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <strong>Recipients:</strong> {recipientCount} people across {selectedLists.length} list{selectedLists.length !== 1 ? 's' : ''}
                  </p>
                  <p>
                    <strong>Channels:</strong> {selectedChannels.map(c =>
                      c === 'inApp' ? 'In-App' : c === 'email' ? 'Email' : 'SMS'
                    ).join(', ')}
                  </p>
                  <p>
                    <strong>Lists:</strong> {selectedLists.map(id =>
                      distributionLists.find(l => l.id === id)?.name
                    ).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Done Step */}
          {step === 'done' && result && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Notification Sent!
              </h3>
              <p className="text-gray-600 mb-4">
                Sent to {result.recipientCount} recipient{result.recipientCount !== 1 ? 's' : ''}.
              </p>
              <div className="inline-flex items-center gap-4 text-sm text-gray-500">
                {result.deliveryStats?.inApp?.sent > 0 && (
                  <span className="flex items-center gap-1">
                    <Bell className="w-4 h-4 text-green-500" />
                    {result.deliveryStats.inApp.sent} in-app
                  </span>
                )}
                {result.deliveryStats?.email?.sent > 0 && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-green-500" />
                    {result.deliveryStats.email.sent} email sent
                  </span>
                )}
                {result.deliveryStats?.email?.pending > 0 && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-amber-500" />
                    {result.deliveryStats.email.pending} email queued
                  </span>
                )}
                {result.deliveryStats?.sms?.sent > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    {result.deliveryStats.sms.sent} SMS sent
                  </span>
                )}
                {result.deliveryStats?.sms?.pending > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    {result.deliveryStats.sms.pending} SMS queued
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'done' && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {recipientCount > 0 && step !== 'template' && (
                <span>{recipientCount} recipient{recipientCount !== 1 ? 's' : ''} selected</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="btn-secondary"
                disabled={sending}
              >
                Cancel
              </button>
              {step === 'preview' && (
                <button
                  onClick={handleSend}
                  className="btn-primary inline-flex items-center gap-2"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Notification
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Done Footer */}
        {step === 'done' && (
          <div className="flex items-center justify-center p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

SendNotificationModal.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    crew: PropTypes.array,
    tailgate: PropTypes.object,
    siteSurvey: PropTypes.object,
    flightPlan: PropTypes.object,
    needsAnalysis: PropTypes.object
  }).isRequired,
  distributionLists: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSent: PropTypes.func.isRequired
}
