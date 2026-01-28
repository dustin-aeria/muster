/**
 * EmergencyContactsManager.jsx
 * Company-wide emergency contacts management
 *
 * Features:
 * - Add/edit/remove emergency contacts
 * - Set primary contact per category
 * - Contact categories (Emergency, Aviation, Medical, etc.)
 * - Import default regulatory contacts
 * - Contacts available to all projects
 *
 * @location src/components/settings/EmergencyContactsManager.jsx
 */

import { useState, useEffect } from 'react'
import {
  Phone,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Copy,
  Star,
  StarOff,
  AlertCircle,
  Loader2,
  Building2,
  Shield,
  Ambulance,
  Plane,
  User,
  Users,
  HardHat
} from 'lucide-react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { logger } from '../../lib/logger'

// ============================================
// CONSTANTS
// ============================================

const CONTACT_ROLES = [
  { id: 'emergency', name: 'Emergency Services', icon: Ambulance, color: 'red' },
  { id: 'aviation', name: 'Aviation Authority', icon: Plane, color: 'blue' },
  { id: 'regulatory', name: 'Regulatory', icon: Shield, color: 'purple' },
  { id: 'medical', name: 'Medical', icon: Ambulance, color: 'green' },
  { id: 'manager', name: 'Operations Manager', icon: Users, color: 'indigo' },
  { id: 'safety', name: 'Safety Officer', icon: HardHat, color: 'amber' },
  { id: 'client', name: 'Client Contact', icon: Building2, color: 'gray' },
  { id: 'other', name: 'Other', icon: User, color: 'gray' }
]

const DEFAULT_CONTACTS = [
  {
    name: 'Emergency Services',
    phone: '911',
    role: 'emergency',
    notes: 'Police, Fire, Ambulance',
    isPrimary: true
  },
  {
    name: 'NAV CANADA FIC',
    phone: '1-866-541-4101',
    role: 'aviation',
    notes: 'Flight Information Centre - Report fly-away/incidents'
  },
  {
    name: 'Transport Canada',
    phone: '1-888-463-0521',
    role: 'regulatory',
    notes: 'Civil Aviation - Serious incident reporting'
  },
  {
    name: 'Poison Control',
    phone: '1-800-222-1222',
    role: 'medical',
    notes: 'Hazardous material exposure'
  }
]

// ============================================
// CONTACT CARD COMPONENT
// ============================================

function ContactCard({ contact, onEdit, onDelete, onTogglePrimary }) {
  const roleConfig = CONTACT_ROLES.find(r => r.id === contact.role) || CONTACT_ROLES.find(r => r.id === 'other')
  const RoleIcon = roleConfig?.icon || User

  const colorClasses = {
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className={`p-4 rounded-lg border ${contact.isPrimary ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[roleConfig?.color || 'gray']}`}>
          <RoleIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{contact.name || 'Unnamed Contact'}</h4>
            {contact.isPrimary && (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                Primary
              </span>
            )}
          </div>
          <a
            href={`tel:${contact.phone}`}
            className="text-lg font-semibold text-aeria-blue hover:text-aeria-navy"
          >
            {contact.phone || 'No phone'}
          </a>
          <p className="text-sm text-gray-500 mt-1">{roleConfig?.name}</p>
          {contact.notes && (
            <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded px-2 py-1">
              {contact.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onTogglePrimary(contact.id)}
            className={`p-1.5 rounded ${
              contact.isPrimary
                ? 'text-amber-500 bg-amber-100'
                : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
            }`}
            title={contact.isPrimary ? 'Primary contact' : 'Set as primary'}
          >
            {contact.isPrimary ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(contact)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Edit contact"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// CONTACT FORM COMPONENT
// ============================================

function ContactForm({ contact, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    phone: contact?.phone || '',
    role: contact?.role || 'other',
    notes: contact?.notes || '',
    isPrimary: contact?.isPrimary || false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.phone.trim()) return
    onSave({
      ...contact,
      ...formData,
      id: contact?.id || `contact_${Date.now()}`
    })
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Contact Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            placeholder="Name or Organization"
            required
          />
        </div>
        <div>
          <label className="label">Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input"
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Role / Category</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="input"
          >
            {CONTACT_ROLES.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 p-2 rounded bg-white border border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPrimary}
              onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded"
            />
            <span className="text-sm text-gray-700">Primary contact for this role</span>
          </label>
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <input
          type="text"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="input"
          placeholder="When to contact, availability, etc."
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          {contact?.id ? 'Update Contact' : 'Add Contact'}
        </button>
      </div>
    </form>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function EmergencyContactsManager() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const docRef = doc(db, 'settings', 'emergencyContacts')
      const snapshot = await getDoc(docRef)
      if (snapshot.exists()) {
        setContacts(snapshot.data().contacts || [])
      }
    } catch (err) {
      logger.error('Failed to load emergency contacts:', err)
      setError('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const saveContacts = async (newContacts) => {
    setSaving(true)
    setError('')
    try {
      const docRef = doc(db, 'settings', 'emergencyContacts')
      await setDoc(docRef, {
        contacts: newContacts,
        updatedAt: new Date().toISOString()
      }, { merge: true })
      setContacts(newContacts)
    } catch (err) {
      logger.error('Failed to save emergency contacts:', err)
      setError('Failed to save contacts')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = (contact) => {
    const existing = contacts.findIndex(c => c.id === contact.id)
    let newContacts

    if (existing >= 0) {
      newContacts = [...contacts]
      newContacts[existing] = contact
    } else {
      newContacts = [...contacts, contact]
    }

    // If this contact is primary, remove primary from others in same role
    if (contact.isPrimary) {
      newContacts = newContacts.map(c =>
        c.id !== contact.id && c.role === contact.role
          ? { ...c, isPrimary: false }
          : c
      )
    }

    saveContacts(newContacts)
    setShowForm(false)
    setEditingContact(null)
  }

  const handleDelete = (contactId) => {
    if (!confirm('Delete this emergency contact?')) return
    const newContacts = contacts.filter(c => c.id !== contactId)
    saveContacts(newContacts)
  }

  const handleTogglePrimary = (contactId) => {
    const contact = contacts.find(c => c.id === contactId)
    if (!contact) return

    const newContacts = contacts.map(c => {
      if (c.id === contactId) {
        return { ...c, isPrimary: !c.isPrimary }
      }
      // Remove primary from others in same role if setting as primary
      if (!contact.isPrimary && c.role === contact.role) {
        return { ...c, isPrimary: false }
      }
      return c
    })

    saveContacts(newContacts)
  }

  const handleLoadDefaults = () => {
    if (contacts.length > 0) {
      if (!confirm('This will add default emergency contacts to your existing list. Continue?')) return
    }

    const newContacts = [
      ...contacts,
      ...DEFAULT_CONTACTS.map(c => ({
        ...c,
        id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      }))
    ]

    saveContacts(newContacts)
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setShowForm(true)
  }

  // Group contacts by role
  const groupedContacts = CONTACT_ROLES.map(role => ({
    ...role,
    contacts: contacts.filter(c => c.role === role.id)
  })).filter(group => group.contacts.length > 0)

  const ungroupedContacts = contacts.filter(c => !CONTACT_ROLES.some(r => r.id === c.role))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Phone className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Emergency Contacts</h2>
            <p className="text-sm text-gray-500">
              Company-wide emergency contacts available to all projects
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {contacts.length === 0 && (
            <button
              onClick={handleLoadDefaults}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Load Defaults
            </button>
          )}
          <button
            onClick={() => {
              setEditingContact(null)
              setShowForm(true)
            }}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <ContactForm
          contact={editingContact}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingContact(null)
          }}
        />
      )}

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No emergency contacts configured</p>
          <p className="text-sm text-gray-500 mb-4">
            Add contacts or load default regulatory contacts
          </p>
          <button
            onClick={handleLoadDefaults}
            className="btn-secondary text-sm"
          >
            Load Default Contacts
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedContacts.map(group => (
            <div key={group.id}>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <group.icon className="w-4 h-4" />
                {group.name}
                <span className="text-gray-400">({group.contacts.length})</span>
              </h3>
              <div className="space-y-2">
                {group.contacts.map(contact => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePrimary={handleTogglePrimary}
                  />
                ))}
              </div>
            </div>
          ))}

          {ungroupedContacts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Other Contacts</h3>
              <div className="space-y-2">
                {ungroupedContacts.map(contact => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePrimary={handleTogglePrimary}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      {contacts.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Using Emergency Contacts</p>
            <p className="text-blue-700 mt-1">
              These contacts are available as defaults when creating new projects.
              Project-specific contacts can be customized in each project's Emergency Plan section.
            </p>
          </div>
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-gray-800 text-white rounded-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  )
}
