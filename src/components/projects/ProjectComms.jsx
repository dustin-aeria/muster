import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  Radio,
  Plus,
  Trash2,
  Phone,
  Smartphone,
  Wifi,
  MessageSquare,
  AlertTriangle,
  Clock,
  Users,
  Volume2,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const commMethods = [
  { value: 'cell', label: 'Cell Phone', icon: Smartphone, description: 'Standard cellular coverage' },
  { value: 'radio', label: 'Two-Way Radio', icon: Radio, description: 'UHF/VHF handheld radios' },
  { value: 'satellite', label: 'Satellite Phone/Device', icon: Wifi, description: 'InReach, satellite phone' },
  { value: 'hand_signals', label: 'Hand Signals', icon: Users, description: 'Visual communication' },
  { value: 'other', label: 'Other', icon: MessageSquare, description: 'Specify in notes' }
]

const defaultRadioChannels = [
  { channel: '1', name: 'Primary Ops', purpose: 'Main operations channel' },
  { channel: '2', name: 'Emergency', purpose: 'Emergency communications only' }
]

const checkInIntervals = [
  { value: '15', label: 'Every 15 minutes' },
  { value: '30', label: 'Every 30 minutes' },
  { value: '60', label: 'Every hour' },
  { value: 'flight', label: 'Before/after each flight' },
  { value: 'custom', label: 'Custom interval' }
]

export default function ProjectComms({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    methods: true,
    radio: true,
    checkin: true,
    emergency: true
  })

  // Initialize communications if not present
  useEffect(() => {
    if (!project.communications) {
      onUpdate({
        communications: {
          primaryMethod: 'cell',
          backupMethod: 'radio',
          cellCoverage: 'full',
          cellNotes: '',
          radioChannels: [...defaultRadioChannels],
          radioType: '',
          radioNotes: '',
          satelliteDevice: '',
          satelliteId: '',
          checkInInterval: '30',
          customInterval: '',
          checkInProcedure: 'Crew members check in with PIC at specified intervals. Confirm location, status, and any concerns.',
          checkInContacts: [],
          emergencyWord: 'MAYDAY',
          stopWord: 'STOP STOP STOP',
          lostCommsProcedure: 'If communication is lost for more than 15 minutes:\n1. Attempt contact on backup method\n2. Return to last known position\n3. If still no contact, return to muster point\n4. Initiate emergency protocol if no contact within 30 minutes',
          aeronauticalRadio: false,
          aeronauticalFrequencies: '',
          additionalNotes: ''
        }
      })
    }
  }, [project.communications])

  const comms = project.communications || {}

  const updateComms = (updates) => {
    onUpdate({
      communications: {
        ...comms,
        ...updates
      }
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Radio channels
  const addRadioChannel = () => {
    updateComms({
      radioChannels: [...(comms.radioChannels || []), {
        channel: '',
        name: '',
        purpose: ''
      }]
    })
  }

  const updateRadioChannel = (index, field, value) => {
    const newChannels = [...(comms.radioChannels || [])]
    newChannels[index] = { ...newChannels[index], [field]: value }
    updateComms({ radioChannels: newChannels })
  }

  const removeRadioChannel = (index) => {
    const newChannels = (comms.radioChannels || []).filter((_, i) => i !== index)
    updateComms({ radioChannels: newChannels })
  }

  // Check-in contacts
  const addCheckInContact = () => {
    updateComms({
      checkInContacts: [...(comms.checkInContacts || []), {
        name: '',
        phone: '',
        role: ''
      }]
    })
  }

  const updateCheckInContact = (index, field, value) => {
    const newContacts = [...(comms.checkInContacts || [])]
    newContacts[index] = { ...newContacts[index], [field]: value }
    updateComms({ checkInContacts: newContacts })
  }

  const removeCheckInContact = (index) => {
    const newContacts = (comms.checkInContacts || []).filter((_, i) => i !== index)
    updateComms({ checkInContacts: newContacts })
  }

  const getMethodInfo = (methodValue) => {
    return commMethods.find(m => m.value === methodValue) || commMethods[4]
  }

  const PrimaryIcon = getMethodInfo(comms.primaryMethod).icon
  const BackupIcon = getMethodInfo(comms.backupMethod).icon

  return (
    <div className="space-y-6">
      {/* Communication Methods */}
      <div className="card">
        <button
          onClick={() => toggleSection('methods')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Radio className="w-5 h-5 text-aeria-blue" />
            Communication Methods
          </h2>
          {expandedSections.methods ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.methods && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Primary Method */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <PrimaryIcon className="w-5 h-5 text-green-700" />
                  <span className="font-medium text-green-800">Primary Method</span>
                </div>
                <select
                  value={comms.primaryMethod || 'cell'}
                  onChange={(e) => updateComms({ primaryMethod: e.target.value })}
                  className="input"
                >
                  {commMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              {/* Backup Method */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <BackupIcon className="w-5 h-5 text-blue-700" />
                  <span className="font-medium text-blue-800">Backup Method</span>
                </div>
                <select
                  value={comms.backupMethod || 'radio'}
                  onChange={(e) => updateComms({ backupMethod: e.target.value })}
                  className="input"
                >
                  {commMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cell Coverage */}
            {(comms.primaryMethod === 'cell' || comms.backupMethod === 'cell') && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Cell Coverage at Site
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Coverage Quality</label>
                    <select
                      value={comms.cellCoverage || 'full'}
                      onChange={(e) => updateComms({ cellCoverage: e.target.value })}
                      className="input"
                    >
                      <option value="full">Full Coverage</option>
                      <option value="partial">Partial/Spotty Coverage</option>
                      <option value="minimal">Minimal Coverage</option>
                      <option value="none">No Coverage</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Coverage Notes</label>
                    <input
                      type="text"
                      value={comms.cellNotes || ''}
                      onChange={(e) => updateComms({ cellNotes: e.target.value })}
                      className="input"
                      placeholder="e.g., Best signal near parking area"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Satellite Device */}
            {(comms.primaryMethod === 'satellite' || comms.backupMethod === 'satellite') && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Satellite Device Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Device Type</label>
                    <input
                      type="text"
                      value={comms.satelliteDevice || ''}
                      onChange={(e) => updateComms({ satelliteDevice: e.target.value })}
                      className="input"
                      placeholder="e.g., Garmin InReach Mini"
                    />
                  </div>
                  <div>
                    <label className="label">Device ID / Number</label>
                    <input
                      type="text"
                      value={comms.satelliteId || ''}
                      onChange={(e) => updateComms({ satelliteId: e.target.value })}
                      className="input"
                      placeholder="ID or phone number"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Radio Channels */}
      {(comms.primaryMethod === 'radio' || comms.backupMethod === 'radio') && (
        <div className="card">
          <button
            onClick={() => toggleSection('radio')}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-aeria-blue" />
              Radio Channels
            </h2>
            {expandedSections.radio ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandedSections.radio && (
            <div className="mt-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Radio Type/Model</label>
                  <input
                    type="text"
                    value={comms.radioType || ''}
                    onChange={(e) => updateComms({ radioType: e.target.value })}
                    className="input"
                    placeholder="e.g., Motorola T600, BaoFeng UV-5R"
                  />
                </div>
                <div>
                  <label className="label">Radio Notes</label>
                  <input
                    type="text"
                    value={comms.radioNotes || ''}
                    onChange={(e) => updateComms({ radioNotes: e.target.value })}
                    className="input"
                    placeholder="e.g., FRS/GMRS, programmed frequencies"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Channel Assignments</label>
                  <button
                    onClick={addRadioChannel}
                    className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Channel
                  </button>
                </div>

                <div className="space-y-2">
                  {(comms.radioChannels || []).map((channel, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        value={channel.channel}
                        onChange={(e) => updateRadioChannel(index, 'channel', e.target.value)}
                        className="input text-sm w-20 text-center font-mono"
                        placeholder="Ch"
                      />
                      <input
                        type="text"
                        value={channel.name}
                        onChange={(e) => updateRadioChannel(index, 'name', e.target.value)}
                        className="input text-sm flex-1"
                        placeholder="Channel name"
                      />
                      <input
                        type="text"
                        value={channel.purpose}
                        onChange={(e) => updateRadioChannel(index, 'purpose', e.target.value)}
                        className="input text-sm flex-1"
                        placeholder="Purpose"
                      />
                      <button
                        onClick={() => removeRadioChannel(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Check-In Procedures */}
      <div className="card">
        <button
          onClick={() => toggleSection('checkin')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-aeria-blue" />
            Check-In Procedures
          </h2>
          {expandedSections.checkin ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.checkin && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Check-In Interval</label>
                <select
                  value={comms.checkInInterval || '30'}
                  onChange={(e) => updateComms({ checkInInterval: e.target.value })}
                  className="input"
                >
                  {checkInIntervals.map(interval => (
                    <option key={interval.value} value={interval.value}>{interval.label}</option>
                  ))}
                </select>
              </div>

              {comms.checkInInterval === 'custom' && (
                <div>
                  <label className="label">Custom Interval</label>
                  <input
                    type="text"
                    value={comms.customInterval || ''}
                    onChange={(e) => updateComms({ customInterval: e.target.value })}
                    className="input"
                    placeholder="e.g., Every 45 minutes"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="label">Check-In Procedure</label>
              <textarea
                value={comms.checkInProcedure || ''}
                onChange={(e) => updateComms({ checkInProcedure: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Describe the check-in procedure..."
              />
            </div>

            {/* Check-in Contacts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Check-In Contacts</label>
                <button
                  onClick={addCheckInContact}
                  className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </button>
              </div>

              {(comms.checkInContacts || []).length === 0 ? (
                <p className="text-sm text-gray-500 italic">No check-in contacts specified. Typically crew checks in with PIC.</p>
              ) : (
                <div className="space-y-2">
                  {(comms.checkInContacts || []).map((contact, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateCheckInContact(index, 'name', e.target.value)}
                        className="input text-sm flex-1"
                        placeholder="Name"
                      />
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => updateCheckInContact(index, 'phone', e.target.value)}
                        className="input text-sm w-36 font-mono"
                        placeholder="Phone"
                      />
                      <input
                        type="text"
                        value={contact.role}
                        onChange={(e) => updateCheckInContact(index, 'role', e.target.value)}
                        className="input text-sm w-32"
                        placeholder="Role"
                      />
                      <button
                        onClick={() => removeCheckInContact(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Emergency Communications */}
      <div className="card">
        <button
          onClick={() => toggleSection('emergency')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-aeria-blue" />
            Emergency Communications
          </h2>
          {expandedSections.emergency ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.emergency && (
          <div className="mt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Emergency Word</label>
                <input
                  type="text"
                  value={comms.emergencyWord ?? ''}
                  onChange={(e) => updateComms({ emergencyWord: e.target.value })}
                  className="input font-bold text-red-600"
                  placeholder="e.g., MAYDAY"
                />
                <p className="text-xs text-gray-500 mt-1">Word to indicate an emergency situation</p>
              </div>
              <div>
                <label className="label">Stop Work Word</label>
                <input
                  type="text"
                  value={comms.stopWord ?? ''}
                  onChange={(e) => updateComms({ stopWord: e.target.value })}
                  className="input font-bold text-amber-600"
                  placeholder="e.g., STOP STOP STOP"
                />
                <p className="text-xs text-gray-500 mt-1">Word to immediately cease all operations</p>
              </div>
            </div>

            <div>
              <label className="label">Lost Communications Procedure</label>
              <textarea
                value={comms.lostCommsProcedure || ''}
                onChange={(e) => updateComms({ lostCommsProcedure: e.target.value })}
                className="input min-h-[120px]"
                placeholder="Procedure to follow if communications are lost..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Aeronautical Radio */}
      <div className="card">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={comms.aeronauticalRadio || false}
            onChange={(e) => updateComms({ aeronauticalRadio: e.target.checked })}
            className="w-4 h-4 text-aeria-navy rounded mt-1"
          />
          <div className="flex-1">
            <label className="font-medium text-gray-900 cursor-pointer" onClick={() => updateComms({ aeronauticalRadio: !comms.aeronauticalRadio })}>
              Aeronautical Radio Required
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Check if operations require monitoring aeronautical frequencies (controlled airspace, near aerodromes)
            </p>

            {comms.aeronauticalRadio && (
              <div className="mt-3">
                <label className="label">Frequencies to Monitor</label>
                <textarea
                  value={comms.aeronauticalFrequencies || ''}
                  onChange={(e) => updateComms({ aeronauticalFrequencies: e.target.value })}
                  className="input min-h-[60px]"
                  placeholder="e.g., 126.7 MHz (CYSE Tower), 122.8 MHz (MF)"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="card">
        <h3 className="font-medium text-gray-900 mb-3">Additional Communication Notes</h3>
        <textarea
          value={comms.additionalNotes || ''}
          onChange={(e) => updateComms({ additionalNotes: e.target.value })}
          className="input min-h-[80px]"
          placeholder="Any additional communication requirements, client protocols, or site-specific considerations..."
        />
      </div>

      {/* Quick Reference */}
      <div className="card bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-900">Communication Test Reminder</h3>
            <p className="text-sm text-amber-700 mt-1">
              Test all communication devices during the tailgate briefing before commencing operations. 
              Verify that all crew members can communicate with the PIC and understand the emergency words.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

ProjectComms.propTypes = {
  project: PropTypes.shape({
    communications: PropTypes.object
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}
