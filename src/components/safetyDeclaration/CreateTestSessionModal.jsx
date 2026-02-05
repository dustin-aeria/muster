/**
 * CreateTestSessionModal.jsx
 * Modal for creating and scheduling new testing sessions
 *
 * @location src/components/safetyDeclaration/CreateTestSessionModal.jsx
 */

import { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  TestTube,
  ClipboardList,
  Plus,
  Trash2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Thermometer,
  Wind,
  Cloud,
  Eye as EyeIcon
} from 'lucide-react'
import {
  createTestingSession,
  REQUIREMENT_SECTIONS
} from '../../lib/firestoreSafetyDeclaration'
import { TEST_TYPES } from './TestingSessionManager'

// Default checklist items by test type
const DEFAULT_CHECKLISTS = {
  position_accuracy: {
    preTest: [
      'GPS module calibrated and verified',
      'Reference position markers in place',
      'Weather conditions suitable for testing',
      'Recording equipment ready'
    ],
    inTest: [
      'Record hover position at each waypoint',
      'Document any GPS signal interruptions',
      'Note environmental factors affecting accuracy'
    ],
    postTest: [
      'Download flight logs',
      'Compare recorded vs actual positions',
      'Document any anomalies'
    ]
  },
  altitude_accuracy: {
    preTest: [
      'Barometric sensor calibrated',
      'Reference altitude markers established',
      'AGL verification equipment ready'
    ],
    inTest: [
      'Record altitude at commanded heights',
      'Note any altitude drift during hover',
      'Document pressure/temperature changes'
    ],
    postTest: [
      'Compare commanded vs measured altitudes',
      'Calculate accuracy metrics',
      'Document environmental factors'
    ]
  },
  containment: {
    preTest: [
      'Geofence boundaries configured',
      'RTH settings verified',
      'Containment failure procedures reviewed',
      'Observer positions established'
    ],
    inTest: [
      'Test geofence warning activation',
      'Verify containment response',
      'Record time to containment action'
    ],
    postTest: [
      'Review flight path data',
      'Document containment effectiveness',
      'Note any containment failures'
    ]
  },
  c2_link: {
    preTest: [
      'C2 link range documented',
      'Signal strength meter ready',
      'Lost-link procedure configured',
      'Emergency procedures reviewed'
    ],
    inTest: [
      'Record signal strength at intervals',
      'Test lost-link activation',
      'Verify predictable lost-link behavior'
    ],
    postTest: [
      'Document C2 performance metrics',
      'Review lost-link procedure execution',
      'Calculate link reliability'
    ]
  },
  environmental: {
    preTest: [
      'Weather conditions documented',
      'Flight envelope parameters set',
      'All configurations to be tested listed',
      'Emergency landing sites identified'
    ],
    inTest: [
      'Test all flight phases',
      'Record handling characteristics',
      'Note any envelope exceedances'
    ],
    postTest: [
      'Document flight envelope limits',
      'Review any exceedance incidents',
      'Compile environmental test data'
    ]
  },
  general: {
    preTest: ['Pre-flight inspection complete', 'Test area secured', 'Equipment functioning'],
    inTest: ['Monitor test progress', 'Record observations'],
    postTest: ['Document results', 'Review data']
  }
}

export default function CreateTestSessionModal({
  isOpen,
  onClose,
  declarationId,
  declaration,
  requirements = [],
  onCreated
}) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    description: '',
    testType: 'general',

    // Schedule
    scheduledDate: '',
    scheduledStartTime: '',
    scheduledEndTime: '',

    // Location & conditions
    location: '',
    gpsCoordinates: '',
    weather: '',
    temperature: '',
    windSpeed: '',
    windDirection: '',
    visibility: '',

    // Linked requirements
    linkedRequirements: [],

    // Checklists
    preTestChecklist: [],
    inTestChecklist: [],
    postTestChecklist: []
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setError(null)
      setFormData({
        name: '',
        description: '',
        testType: 'general',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledStartTime: '',
        scheduledEndTime: '',
        location: '',
        gpsCoordinates: '',
        weather: '',
        temperature: '',
        windSpeed: '',
        windDirection: '',
        visibility: '',
        linkedRequirements: [],
        preTestChecklist: [],
        inTestChecklist: [],
        postTestChecklist: []
      })
    }
  }, [isOpen])

  // Auto-populate checklists when test type changes
  useEffect(() => {
    const defaults = DEFAULT_CHECKLISTS[formData.testType] || DEFAULT_CHECKLISTS.general
    setFormData(prev => ({
      ...prev,
      preTestChecklist: defaults.preTest.map(text => ({ text, completed: false })),
      inTestChecklist: defaults.inTest.map(text => ({ text, completed: false })),
      postTestChecklist: defaults.postTest.map(text => ({ text, completed: false }))
    }))
  }, [formData.testType])

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a session name')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const sessionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        testType: formData.testType,
        scheduledDate: formData.scheduledDate || null,
        scheduledStartTime: formData.scheduledStartTime || null,
        scheduledEndTime: formData.scheduledEndTime || null,
        linkedRequirements: formData.linkedRequirements,
        conditions: {
          location: formData.location.trim(),
          gpsCoordinates: formData.gpsCoordinates.trim() || null,
          weather: formData.weather,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          windSpeed: formData.windSpeed ? parseFloat(formData.windSpeed) : null,
          windDirection: formData.windDirection,
          visibility: formData.visibility
        },
        preTestChecklist: formData.preTestChecklist,
        inTestChecklist: formData.inTestChecklist,
        postTestChecklist: formData.postTestChecklist,
        createdBy: declaration?.createdBy || 'unknown'
      }

      await createTestingSession(declarationId, sessionData)

      if (onCreated) onCreated()
      onClose()
    } catch (err) {
      console.error('Error creating session:', err)
      setError(err.message || 'Failed to create testing session')
    } finally {
      setSaving(false)
    }
  }

  const addChecklistItem = (listType) => {
    const key = `${listType}Checklist`
    setFormData(prev => ({
      ...prev,
      [key]: [...prev[key], { text: '', completed: false }]
    }))
  }

  const updateChecklistItem = (listType, index, text) => {
    const key = `${listType}Checklist`
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].map((item, i) =>
        i === index ? { ...item, text } : item
      )
    }))
  }

  const removeChecklistItem = (listType, index) => {
    const key = `${listType}Checklist`
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }))
  }

  const toggleRequirement = (reqId) => {
    setFormData(prev => ({
      ...prev,
      linkedRequirements: prev.linkedRequirements.includes(reqId)
        ? prev.linkedRequirements.filter(id => id !== reqId)
        : [...prev.linkedRequirements, reqId]
    }))
  }

  // Get applicable requirements for the selected test type
  const applicableRequirements = requirements.filter(req => {
    const testTypeInfo = TEST_TYPES[formData.testType]
    if (!testTypeInfo?.section) return true
    return req.sectionId === testTypeInfo.section
  })

  if (!isOpen) return null

  const totalSteps = 4

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Testing Session</h2>
              <p className="text-sm text-gray-500">Step {step} of {totalSteps}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Position Accuracy Test - Flight 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(TEST_TYPES).map(([key, type]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, testType: key }))}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          formData.testType === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <TestTube className={`w-5 h-5 mt-0.5 ${
                          formData.testType === key ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{type.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{type.section || 'General'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose and scope of this testing session..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Schedule & Location */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Schedule
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Date</label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formData.scheduledStartTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledStartTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Time</label>
                      <input
                        type="time"
                        value={formData.scheduledEndTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledEndTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Location
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Test site location / address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={formData.gpsCoordinates}
                      onChange={(e) => setFormData(prev => ({ ...prev, gpsCoordinates: e.target.value }))}
                      placeholder="GPS coordinates (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-gray-400" />
                    Expected Conditions (Optional)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Weather</label>
                      <select
                        value={formData.weather}
                        onChange={(e) => setFormData(prev => ({ ...prev, weather: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select...</option>
                        <option value="clear">Clear</option>
                        <option value="partly_cloudy">Partly Cloudy</option>
                        <option value="overcast">Overcast</option>
                        <option value="light_rain">Light Rain</option>
                        <option value="fog">Fog/Mist</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Visibility</label>
                      <select
                        value={formData.visibility}
                        onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select...</option>
                        <option value="excellent">Excellent (&gt;10km)</option>
                        <option value="good">Good (5-10km)</option>
                        <option value="moderate">Moderate (2-5km)</option>
                        <option value="poor">Poor (&lt;2km)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Temperature (°C)</label>
                      <input
                        type="number"
                        value={formData.temperature}
                        onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                        placeholder="e.g., 15"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Wind Speed (km/h)</label>
                      <input
                        type="number"
                        value={formData.windSpeed}
                        onChange={(e) => setFormData(prev => ({ ...prev, windSpeed: e.target.value }))}
                        placeholder="e.g., 10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Link Requirements */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Link Requirements</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Select the requirements this testing session will help demonstrate compliance for.
                  </p>
                </div>

                {applicableRequirements.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {applicableRequirements.map(req => (
                      <label
                        key={req.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.linkedRequirements.includes(req.requirementId)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.linkedRequirements.includes(req.requirementId)}
                          onChange={() => toggleRequirement(req.requirementId)}
                          className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {req.requirementId}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{req.text}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <ClipboardList className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No applicable requirements found.</p>
                  </div>
                )}

                {formData.linkedRequirements.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      {formData.linkedRequirements.length} requirement{formData.linkedRequirements.length !== 1 ? 's' : ''} linked
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Checklists */}
            {step === 4 && (
              <div className="space-y-6">
                <p className="text-sm text-gray-500">
                  Customize the checklists for this session. Default items have been added based on the test type.
                </p>

                {/* Pre-Test Checklist */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Pre-Test Checklist</h3>
                  <div className="space-y-2">
                    {formData.preTestChecklist.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => updateChecklistItem('preTest', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Checklist item..."
                        />
                        <button
                          onClick={() => removeChecklistItem('preTest', index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addChecklistItem('preTest')}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>
                </div>

                {/* In-Test Checklist */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">In-Test Checklist</h3>
                  <div className="space-y-2">
                    {formData.inTestChecklist.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => updateChecklistItem('inTest', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Checklist item..."
                        />
                        <button
                          onClick={() => removeChecklistItem('inTest', index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addChecklistItem('inTest')}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>
                </div>

                {/* Post-Test Checklist */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Post-Test Checklist</h3>
                  <div className="space-y-2">
                    {formData.postTestChecklist.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => updateChecklistItem('postTest', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          placeholder="Checklist item..."
                        />
                        <button
                          onClick={() => removeChecklistItem('postTest', index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addChecklistItem('postTest')}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !formData.name.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4" />
                    Create Session
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
