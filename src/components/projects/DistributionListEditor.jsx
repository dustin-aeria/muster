import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  X,
  Users,
  UserPlus,
  Mail,
  Phone,
  Bell,
  MessageSquare,
  Trash2,
  ChevronDown,
  Check,
  AlertCircle
} from 'lucide-react'
import {
  DEFAULT_LIST_TYPES,
  NOTIFICATION_CHANNELS,
  validateMember
} from '../../lib/firestoreDistributionLists'

export default function DistributionListEditor({ list, projectCrew, onSave, onClose }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('custom')
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState([])
  const [errors, setErrors] = useState([])
  const [saving, setSaving] = useState(false)

  // New member form
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberType, setNewMemberType] = useState('operator')
  const [selectedOperator, setSelectedOperator] = useState('')
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberPhone, setNewMemberPhone] = useState('')
  const [newMemberChannels, setNewMemberChannels] = useState(['inApp'])

  // Initialize from existing list
  useEffect(() => {
    if (list) {
      setName(list.name || '')
      setType(list.type || 'custom')
      setDescription(list.description || '')
      setMembers(list.members || [])
    }
  }, [list])

  const handleSave = async () => {
    // Validate
    const validationErrors = []
    if (!name.trim()) {
      validationErrors.push('List name is required')
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        type,
        description: description.trim(),
        members
      })
    } catch (error) {
      setErrors([error.message])
    } finally {
      setSaving(false)
    }
  }

  const handleAddMember = () => {
    let newMember = null

    if (newMemberType === 'operator') {
      if (!selectedOperator) {
        setErrors(['Please select an operator'])
        return
      }

      const operator = projectCrew.find(c => c.organizationId === selectedOperator || c.id === selectedOperator)
      if (!operator) {
        setErrors(['Operator not found'])
        return
      }

      // Check for duplicates
      if (members.some(m => m.organizationId === (operator.organizationId || operator.id))) {
        setErrors(['This operator is already in the list'])
        return
      }

      newMember = {
        type: 'operator',
        organizationId: operator.organizationId || operator.id,
        name: operator.operatorName || operator.name,
        email: operator.email || '',
        phone: operator.phone || '',
        channels: newMemberChannels
      }
    } else {
      // External contact
      if (!newMemberName.trim()) {
        setErrors(['Name is required'])
        return
      }

      if (!newMemberEmail && !newMemberPhone) {
        setErrors(['Email or phone is required for external contacts'])
        return
      }

      // External contacts cannot receive in-app notifications only
      const validChannels = newMemberChannels.filter(c => c !== 'inApp')
      if (validChannels.length === 0) {
        setErrors(['External contacts must have email or SMS enabled'])
        return
      }

      // Check for duplicates by email
      if (newMemberEmail && members.some(m => m.email === newMemberEmail)) {
        setErrors(['A contact with this email already exists'])
        return
      }

      newMember = {
        type: 'external',
        organizationId: null,
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        phone: newMemberPhone.trim(),
        channels: validChannels
      }
    }

    const validation = validateMember(newMember)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setMembers([...members, newMember])
    resetNewMemberForm()
    setErrors([])
  }

  const resetNewMemberForm = () => {
    setShowAddMember(false)
    setNewMemberType('operator')
    setSelectedOperator('')
    setNewMemberName('')
    setNewMemberEmail('')
    setNewMemberPhone('')
    setNewMemberChannels(['inApp'])
  }

  const handleRemoveMember = (index) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const handleToggleChannel = (index, channel) => {
    setMembers(members.map((member, i) => {
      if (i !== index) return member

      const currentChannels = member.channels || []
      const hasChannel = currentChannels.includes(channel)

      // For external contacts, don't allow only inApp
      if (member.type === 'external' && channel !== 'inApp') {
        const newChannels = hasChannel
          ? currentChannels.filter(c => c !== channel)
          : [...currentChannels, channel]

        // Ensure at least one non-inApp channel for external
        const nonInAppChannels = newChannels.filter(c => c !== 'inApp')
        if (nonInAppChannels.length === 0) {
          return member
        }

        return { ...member, channels: newChannels }
      }

      return {
        ...member,
        channels: hasChannel
          ? currentChannels.filter(c => c !== channel)
          : [...currentChannels, channel]
      }
    }))
  }

  const handleNewChannelToggle = (channel) => {
    setNewMemberChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    )
  }

  // Get operators not already in the list
  const availableOperators = projectCrew.filter(c =>
    !members.some(m => m.organizationId === (c.organizationId || c.id))
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            {list ? 'Edit Distribution List' : 'Create Distribution List'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  {errors.map((error, i) => (
                    <p key={i} className="text-sm text-red-700">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">List Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="e.g., Pilots, Safety Team"
              />
            </div>
            <div>
              <label className="label">List Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input"
              >
                {Object.entries(DEFAULT_LIST_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="Optional description"
            />
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Members ({members.length})</label>
              {!showAddMember && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="text-sm text-aeria-blue hover:text-aeria-navy flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
              )}
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4 space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="memberType"
                      value="operator"
                      checked={newMemberType === 'operator'}
                      onChange={() => setNewMemberType('operator')}
                      className="text-aeria-blue"
                    />
                    <span className="text-sm">Operator</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="memberType"
                      value="external"
                      checked={newMemberType === 'external'}
                      onChange={() => setNewMemberType('external')}
                      className="text-aeria-blue"
                    />
                    <span className="text-sm">External Contact</span>
                  </label>
                </div>

                {newMemberType === 'operator' ? (
                  <div>
                    <label className="label">Select Operator</label>
                    <select
                      value={selectedOperator}
                      onChange={(e) => setSelectedOperator(e.target.value)}
                      className="input"
                    >
                      <option value="">Select an operator...</option>
                      {availableOperators.map((op) => (
                        <option key={op.organizationId || op.id} value={op.organizationId || op.id}>
                          {op.operatorName || op.name} ({op.role})
                        </option>
                      ))}
                    </select>
                    {availableOperators.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        All crew members are already in this list.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Name *</label>
                      <input
                        type="text"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="input"
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="input"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input
                        type="tel"
                        value={newMemberPhone}
                        onChange={(e) => setNewMemberPhone(e.target.value)}
                        className="input"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                )}

                {/* Channel Selection */}
                <div>
                  <label className="label">Notification Channels</label>
                  <div className="flex flex-wrap gap-2">
                    {newMemberType === 'operator' && (
                      <button
                        type="button"
                        onClick={() => handleNewChannelToggle('inApp')}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border ${
                          newMemberChannels.includes('inApp')
                            ? 'bg-aeria-blue text-white border-aeria-blue'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                        In-App
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleNewChannelToggle('email')}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border ${
                        newMemberChannels.includes('email')
                          ? 'bg-aeria-blue text-white border-aeria-blue'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNewChannelToggle('sms')}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border ${
                        newMemberChannels.includes('sms')
                          ? 'bg-aeria-blue text-white border-aeria-blue'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      SMS
                    </button>
                  </div>
                  {newMemberType === 'external' && (
                    <p className="text-xs text-gray-500 mt-1">
                      External contacts can only receive email or SMS notifications.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={resetNewMemberForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMember}
                    className="btn-primary"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            {members.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">No members added yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        member.type === 'external'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {member.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {member.type === 'external' ? (
                            <span className="text-purple-600">External</span>
                          ) : (
                            <span className="text-blue-600">Operator</span>
                          )}
                          {member.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </span>
                          )}
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {member.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Channel Toggles */}
                      <div className="flex items-center gap-1">
                        {member.type === 'operator' && (
                          <button
                            onClick={() => handleToggleChannel(index, 'inApp')}
                            className={`p-1.5 rounded ${
                              member.channels?.includes('inApp')
                                ? 'text-aeria-blue bg-blue-50'
                                : 'text-gray-300 hover:text-gray-400'
                            }`}
                            title="In-App notifications"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleChannel(index, 'email')}
                          className={`p-1.5 rounded ${
                            member.channels?.includes('email')
                              ? 'text-aeria-blue bg-blue-50'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                          title="Email notifications"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleChannel(index, 'sms')}
                          className={`p-1.5 rounded ${
                            member.channels?.includes('sms')
                              ? 'text-aeria-blue bg-blue-50'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                          title="SMS notifications"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveMember(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : list ? 'Save Changes' : 'Create List'}
          </button>
        </div>
      </div>
    </div>
  )
}

DistributionListEditor.propTypes = {
  list: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    description: PropTypes.string,
    members: PropTypes.array
  }),
  projectCrew: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

DistributionListEditor.defaultProps = {
  list: null,
  projectCrew: []
}
